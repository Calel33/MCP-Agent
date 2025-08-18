/**
 * Server Health Monitoring System for MCP Multi-Server Agent
 * 
 * This module provides comprehensive health monitoring for MCP servers including:
 * - Real-time health checks
 * - Connection status monitoring
 * - Automatic reconnection logic
 * - Health metrics collection
 * - Circuit breaker functionality
 */

import type { MCPServerConfig } from '@/config/types.js';
import type { MCPClientFactory } from '@/config/client-factory.js';
import { HealthChecker } from './health-checker.js';
import { ReconnectionManager } from './reconnection-manager.js';

/**
 * Health status for a server
 */
export type ServerHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'disconnected' | 'reconnecting';

/**
 * Detailed health information for a server
 */
export interface ServerHealthInfo {
  serverId: string;
  status: ServerHealthStatus;
  lastHealthCheck: Date;
  lastSuccessfulCheck: Date;
  consecutiveFailures: number;
  averageResponseTime: number;
  errorRate: number;
  connectionCount: number;
  memoryUsage?: number;
  cpuUsage?: number;
  lastError?: string;
  uptime: number; // in milliseconds
  isCircuitBreakerOpen: boolean;
}

/**
 * Health monitoring configuration
 */
export interface HealthMonitoringConfig {
  /** Health check interval in milliseconds */
  healthCheckInterval: number;
  /** Timeout for health checks in milliseconds */
  healthCheckTimeout: number;
  /** Number of consecutive failures before marking as unhealthy */
  failureThreshold: number;
  /** Number of consecutive successes needed to mark as healthy */
  recoveryThreshold: number;
  /** Whether to enable automatic reconnection */
  autoReconnect: boolean;
  /** Reconnection retry interval in milliseconds */
  reconnectInterval: number;
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts: number;
  /** Circuit breaker configuration */
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenMaxCalls: number;
  };
}

/**
 * Default health monitoring configuration
 */
export const DEFAULT_HEALTH_CONFIG: HealthMonitoringConfig = {
  healthCheckInterval: 30000, // 30 seconds
  healthCheckTimeout: 5000, // 5 seconds
  failureThreshold: 3,
  recoveryThreshold: 2,
  autoReconnect: true,
  reconnectInterval: 10000, // 10 seconds
  maxReconnectAttempts: 5,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    halfOpenMaxCalls: 3,
  },
};

/**
 * Health monitoring events
 */
export interface HealthMonitoringEvents {
  'server-healthy': (serverId: string, info: ServerHealthInfo) => void;
  'server-unhealthy': (serverId: string, info: ServerHealthInfo) => void;
  'server-disconnected': (serverId: string, info: ServerHealthInfo) => void;
  'server-reconnected': (serverId: string, info: ServerHealthInfo) => void;
  'circuit-breaker-opened': (serverId: string, info: ServerHealthInfo) => void;
  'circuit-breaker-closed': (serverId: string, info: ServerHealthInfo) => void;
  'health-check-failed': (serverId: string, error: Error) => void;
  'reconnection-failed': (serverId: string, error: Error, attempt: number) => void;
}

/**
 * Server Health Monitoring System
 */
export class ServerHealthMonitor {
  private config: HealthMonitoringConfig;
  private healthChecker: HealthChecker;
  private reconnectionManager: ReconnectionManager;
  
  private healthInfo: Map<string, ServerHealthInfo> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<keyof HealthMonitoringEvents, Function[]> = new Map();
  private isMonitoring = false;

  constructor(
    clientFactory: MCPClientFactory,
    config: Partial<HealthMonitoringConfig> = {}
  ) {
    this.config = { ...DEFAULT_HEALTH_CONFIG, ...config };
    this.healthChecker = new HealthChecker(clientFactory, this.config);
    this.reconnectionManager = new ReconnectionManager(clientFactory, this.config);

    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Initialize health monitoring for servers
   */
  async initialize(servers: MCPServerConfig[]): Promise<void> {
    console.log('🏥 Initializing Server Health Monitor...');

    // Initialize health info for all enabled servers
    for (const server of servers) {
      if (server.enabled) {
        this.healthInfo.set(server.id, {
          serverId: server.id,
          status: 'disconnected',
          lastHealthCheck: new Date(),
          lastSuccessfulCheck: new Date(),
          consecutiveFailures: 0,
          averageResponseTime: 0,
          errorRate: 0,
          connectionCount: 0,
          uptime: 0,
          isCircuitBreakerOpen: false,
        });
      }
    }

    // Initialize health checker and reconnection manager
    await this.healthChecker.initialize(servers);
    await this.reconnectionManager.initialize(servers);

    console.log(`✅ Health Monitor initialized for ${servers.filter(s => s.enabled).length} servers`);
  }

  /**
   * Start health monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('⚠️ Health monitoring is already running');
      return;
    }

    console.log(`🏥 Starting health monitoring (interval: ${this.config.healthCheckInterval}ms)`);
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    // Perform initial health check
    this.performHealthChecks().catch(error => {
      console.error('❌ Initial health check failed:', error);
    });
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('🔄 Stopping health monitoring...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('✅ Health monitoring stopped');
  }

  /**
   * Perform health checks on all monitored servers
   */
  private async performHealthChecks(): Promise<void> {
    const serverIds = Array.from(this.healthInfo.keys());
    
    const healthCheckPromises = serverIds.map(async (serverId) => {
      try {
        const result = await this.healthChecker.checkServerHealth(serverId);
        await this.updateServerHealth(serverId, result);
      } catch (error) {
        console.error(`❌ Health check failed for server ${serverId}:`, error);
        await this.handleHealthCheckFailure(serverId, error as Error);
        this.emit('health-check-failed', serverId, error as Error);
      }
    });

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Update server health information
   */
  private async updateServerHealth(serverId: string, healthResult: any): Promise<void> {
    const currentInfo = this.healthInfo.get(serverId);
    if (!currentInfo) return;

    const now = new Date();
    const wasHealthy = currentInfo.status === 'healthy';

    // Update health info based on check result
    const updatedInfo: ServerHealthInfo = {
      ...currentInfo,
      lastHealthCheck: now,
      averageResponseTime: this.calculateAverageResponseTime(
        currentInfo.averageResponseTime,
        healthResult.responseTime || 0
      ),
    };

    if (healthResult.success) {
      updatedInfo.status = 'healthy';
      updatedInfo.lastSuccessfulCheck = now;
      updatedInfo.consecutiveFailures = 0;
      updatedInfo.errorRate = Math.max(0, updatedInfo.errorRate - 0.1);
      
      // Close circuit breaker if recovery threshold is met
      if (updatedInfo.isCircuitBreakerOpen && updatedInfo.consecutiveFailures === 0) {
        updatedInfo.isCircuitBreakerOpen = false;
        this.emit('circuit-breaker-closed', serverId, updatedInfo);
      }

      if (!wasHealthy) {
        this.emit('server-healthy', serverId, updatedInfo);
      }
    } else {
      updatedInfo.consecutiveFailures++;
      updatedInfo.errorRate = Math.min(1.0, updatedInfo.errorRate + 0.1);
      updatedInfo.lastError = healthResult.error?.message || 'Unknown error';

      // Determine status based on failure count
      if (updatedInfo.consecutiveFailures >= this.config.failureThreshold) {
        updatedInfo.status = 'unhealthy';
        
        // Open circuit breaker if threshold is reached
        if (this.config.circuitBreaker.enabled && 
            updatedInfo.consecutiveFailures >= this.config.circuitBreaker.failureThreshold) {
          updatedInfo.isCircuitBreakerOpen = true;
          this.emit('circuit-breaker-opened', serverId, updatedInfo);
        }

        if (wasHealthy) {
          this.emit('server-unhealthy', serverId, updatedInfo);
        }
      } else {
        updatedInfo.status = 'degraded';
      }
    }

    this.healthInfo.set(serverId, updatedInfo);
  }

  /**
   * Handle health check failure
   */
  private async handleHealthCheckFailure(serverId: string, error: Error): Promise<void> {
    const currentInfo = this.healthInfo.get(serverId);
    if (!currentInfo) return;

    const updatedInfo: ServerHealthInfo = {
      ...currentInfo,
      status: 'disconnected',
      lastHealthCheck: new Date(),
      consecutiveFailures: currentInfo.consecutiveFailures + 1,
      lastError: error.message,
    };

    this.healthInfo.set(serverId, updatedInfo);
    this.emit('server-disconnected', serverId, updatedInfo);

    // Trigger reconnection if enabled
    if (this.config.autoReconnect) {
      await this.reconnectionManager.scheduleReconnection(serverId);
    }
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(current: number, newTime: number): number {
    if (current === 0) return newTime;
    return (current * 0.8) + (newTime * 0.2); // Exponential moving average
  }

  /**
   * Set up event forwarding from health checker and reconnection manager
   */
  private setupEventForwarding(): void {
    // Forward reconnection events
    this.reconnectionManager.on('reconnection-success', (serverId: string) => {
      const info = this.healthInfo.get(serverId);
      if (info) {
        info.status = 'healthy';
        info.consecutiveFailures = 0;
        this.emit('server-reconnected', serverId, info);
      }
    });

    this.reconnectionManager.on('reconnection-failed', (serverId: string, error: Error, attempt: number) => {
      this.emit('reconnection-failed', serverId, error, attempt);
    });
  }

  /**
   * Add event listener
   */
  on<K extends keyof HealthMonitoringEvents>(
    event: K,
    listener: HealthMonitoringEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof HealthMonitoringEvents>(
    event: K,
    listener: HealthMonitoringEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit<K extends keyof HealthMonitoringEvents>(
    event: K,
    ...args: Parameters<HealthMonitoringEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get health information for a specific server
   */
  getServerHealth(serverId: string): ServerHealthInfo | null {
    return this.healthInfo.get(serverId) || null;
  }

  /**
   * Get health information for all servers
   */
  getAllServerHealth(): ServerHealthInfo[] {
    return Array.from(this.healthInfo.values());
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    totalServers: number;
    healthyServers: number;
    unhealthyServers: number;
    disconnectedServers: number;
    averageResponseTime: number;
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  } {
    const allHealth = this.getAllServerHealth();
    const totalServers = allHealth.length;
    const healthyServers = allHealth.filter(h => h.status === 'healthy').length;
    const unhealthyServers = allHealth.filter(h => h.status === 'unhealthy').length;
    const disconnectedServers = allHealth.filter(h => h.status === 'disconnected').length;
    
    const averageResponseTime = allHealth.reduce((sum, h) => sum + h.averageResponseTime, 0) / totalServers || 0;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyServers > 0 || disconnectedServers > totalServers / 2) {
      overallStatus = 'unhealthy';
    } else if (healthyServers < totalServers) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      totalServers,
      healthyServers,
      unhealthyServers,
      disconnectedServers,
      averageResponseTime,
      overallStatus,
    };
  }

  /**
   * Force health check for a specific server
   */
  async forceHealthCheck(serverId: string): Promise<ServerHealthInfo | null> {
    try {
      const result = await this.healthChecker.checkServerHealth(serverId);
      await this.updateServerHealth(serverId, result);
      return this.getServerHealth(serverId);
    } catch (error) {
      console.error(`❌ Forced health check failed for server ${serverId}:`, error);
      await this.handleHealthCheckFailure(serverId, error as Error);
      return this.getServerHealth(serverId);
    }
  }

  /**
   * Manually trigger reconnection for a server
   */
  async reconnectServer(serverId: string): Promise<boolean> {
    return await this.reconnectionManager.reconnectServer(serverId);
  }

  /**
   * Get monitoring status
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get configuration
   */
  getConfig(): HealthMonitoringConfig {
    return { ...this.config };
  }

  /**
   * Shutdown health monitoring
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Server Health Monitor...');
    
    this.stopMonitoring();
    await this.reconnectionManager.shutdown();
    
    this.healthInfo.clear();
    this.eventListeners.clear();
    
    console.log('✅ Server Health Monitor shutdown completed');
  }
}
