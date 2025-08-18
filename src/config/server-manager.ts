/**
 * Server Manager Configuration for MCP Multi-Server Agent
 * 
 * This module provides optimized server manager configuration for performance
 * and resource management when working with multiple MCP servers.
 */

import type { ServerManagerConfig, MCPServerConfig } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import type { MCPClientFactory } from './client-factory.js';
import { ServerHealthMonitor, createHealthMonitor } from '@/monitoring/index.js';
import type { ServerHealthInfo, HealthMonitoringConfig } from '@/monitoring/index.js';

/**
 * Advanced server manager configuration options
 */
export interface AdvancedServerManagerConfig extends ServerManagerConfig {
  /** Connection pool settings */
  connectionPool?: {
    /** Maximum connections per server */
    maxConnectionsPerServer: number;
    /** Connection idle timeout in milliseconds */
    idleTimeout: number;
    /** Connection keep-alive interval in milliseconds */
    keepAliveInterval: number;
  };
  
  /** Resource management settings */
  resourceManagement?: {
    /** Maximum memory usage per server in MB */
    maxMemoryPerServer: number;
    /** CPU usage threshold for throttling (0-1) */
    cpuThreshold: number;
    /** Garbage collection interval in milliseconds */
    gcInterval: number;
  };
  
  /** Load balancing configuration */
  loadBalancing?: {
    /** Strategy for server selection */
    strategy: 'round-robin' | 'least-connections' | 'priority-based' | 'random';
    /** Weight factors for server selection */
    weights?: Record<string, number>;
  };
  
  /** Circuit breaker configuration */
  circuitBreaker?: {
    /** Failure threshold before opening circuit */
    failureThreshold: number;
    /** Recovery timeout in milliseconds */
    recoveryTimeout: number;
    /** Half-open state test requests */
    halfOpenMaxCalls: number;
  };
}

/**
 * Server performance metrics
 */
export interface ServerMetrics {
  serverId: string;
  connectionCount: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  lastHealthCheck: Date;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disconnected';
}

/**
 * Server Manager class for optimized multi-server operations
 */
export class ServerManager {
  private config: AdvancedServerManagerConfig;
  private metrics: Map<string, ServerMetrics> = new Map();
  private connectionPools: Map<string, any[]> = new Map();
  private circuitStates: Map<string, 'closed' | 'open' | 'half-open'> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthMonitor: ServerHealthMonitor | null = null;
  private clientFactory: MCPClientFactory | null = null;

  constructor(config: AdvancedServerManagerConfig) {
    this.config = {
      ...DEFAULT_CONFIG.serverManager,
      ...config,
      connectionPool: {
        maxConnectionsPerServer: 5,
        idleTimeout: 300000, // 5 minutes
        keepAliveInterval: 30000, // 30 seconds
        ...config.connectionPool,
      },
      resourceManagement: {
        maxMemoryPerServer: 512, // 512 MB
        cpuThreshold: 0.8, // 80%
        gcInterval: 60000, // 1 minute
        ...config.resourceManagement,
      },
      loadBalancing: {
        strategy: 'priority-based',
        ...config.loadBalancing,
      },
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 30000, // 30 seconds
        halfOpenMaxCalls: 3,
        ...config.circuitBreaker,
      },
    };
  }

  /**
   * Get optimized MCPAgent configuration
   */
  getMCPAgentConfig(): {
    useServerManager: boolean;
    maxConcurrentServers?: number;
    serverStartupTimeout?: number;
    [key: string]: any;
  } {
    const config: any = {
      useServerManager: this.config.enabled,
      // Additional performance optimizations
      connectionPooling: this.config.connectionPool ? true : false,
      healthMonitoring: this.config.healthMonitoring,
      autoReconnect: this.config.autoReconnect,
    };

    // Only add optional properties if they are defined
    if (this.config.maxConcurrentServers !== undefined) {
      config.maxConcurrentServers = this.config.maxConcurrentServers;
    }
    if (this.config.serverStartupTimeout !== undefined) {
      config.serverStartupTimeout = this.config.serverStartupTimeout;
    }

    return config;
  }

  /**
   * Initialize server manager with health monitoring
   */
  async initialize(servers: MCPServerConfig[], clientFactory?: MCPClientFactory): Promise<void> {
    console.log('🔧 Initializing Server Manager...');

    // Store client factory for health monitoring
    if (clientFactory) {
      this.clientFactory = clientFactory;
    }

    // Initialize metrics for all servers
    for (const server of servers) {
      if (server.enabled) {
        this.metrics.set(server.id, {
          serverId: server.id,
          connectionCount: 0,
          averageResponseTime: 0,
          errorRate: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          lastHealthCheck: new Date(),
          status: 'disconnected',
        });

        // Initialize circuit breaker state
        this.circuitStates.set(server.id, 'closed');

        // Initialize connection pool
        this.connectionPools.set(server.id, []);
      }
    }

    // Initialize advanced health monitoring if client factory is available
    if (this.config.healthMonitoring && this.clientFactory) {
      await this.initializeAdvancedHealthMonitoring(servers);
    } else if (this.config.healthMonitoring && this.config.healthCheckInterval) {
      // Fallback to basic health monitoring
      this.startHealthMonitoring();
    }

    console.log(`✅ Server Manager initialized for ${servers.filter(s => s.enabled).length} servers`);
  }

  /**
   * Initialize advanced health monitoring with ServerHealthMonitor
   */
  private async initializeAdvancedHealthMonitoring(servers: MCPServerConfig[]): Promise<void> {
    if (!this.clientFactory) {
      console.warn('⚠️ Client factory not available, falling back to basic health monitoring');
      this.startHealthMonitoring();
      return;
    }

    try {
      console.log('🏥 Initializing advanced health monitoring...');

      // Create health monitoring configuration
      const healthConfig: Partial<HealthMonitoringConfig> = {
        healthCheckInterval: this.config.healthCheckInterval || 30000,
        healthCheckTimeout: 5000,
        failureThreshold: this.config.circuitBreaker?.failureThreshold || 3,
        autoReconnect: this.config.autoReconnect || true,
        reconnectInterval: 10000,
        maxReconnectAttempts: 5,
        circuitBreaker: {
          enabled: true,
          failureThreshold: this.config.circuitBreaker?.failureThreshold || 5,
          recoveryTimeout: this.config.circuitBreaker?.recoveryTimeout || 30000,
          halfOpenMaxCalls: this.config.circuitBreaker?.halfOpenMaxCalls || 3,
        },
      };

      // Create and initialize health monitor
      this.healthMonitor = await createHealthMonitor(this.clientFactory, servers, healthConfig);

      // Set up event listeners to update server manager metrics
      this.setupHealthMonitoringEvents();

      // Start monitoring
      this.healthMonitor.startMonitoring();

      console.log('✅ Advanced health monitoring initialized and started');
    } catch (error) {
      console.error('❌ Failed to initialize advanced health monitoring:', error);
      console.log('🔄 Falling back to basic health monitoring...');
      this.startHealthMonitoring();
    }
  }

  /**
   * Set up event listeners for health monitoring
   */
  private setupHealthMonitoringEvents(): void {
    if (!this.healthMonitor) return;

    this.healthMonitor.on('server-healthy', (serverId: string, info: ServerHealthInfo) => {
      this.updateServerMetricsFromHealthInfo(serverId, info);
      this.circuitStates.set(serverId, 'closed');
    });

    this.healthMonitor.on('server-unhealthy', (serverId: string, info: ServerHealthInfo) => {
      this.updateServerMetricsFromHealthInfo(serverId, info);
    });

    this.healthMonitor.on('server-disconnected', (serverId: string, info: ServerHealthInfo) => {
      this.updateServerMetricsFromHealthInfo(serverId, info);
    });

    this.healthMonitor.on('circuit-breaker-opened', (serverId: string, _info: ServerHealthInfo) => {
      this.circuitStates.set(serverId, 'open');
      console.warn(`⚠️ Circuit breaker opened for server ${serverId}`);
    });

    this.healthMonitor.on('circuit-breaker-closed', (serverId: string, _info: ServerHealthInfo) => {
      this.circuitStates.set(serverId, 'closed');
      console.log(`✅ Circuit breaker closed for server ${serverId}`);
    });
  }

  /**
   * Update server metrics from health monitoring info
   */
  private updateServerMetricsFromHealthInfo(serverId: string, healthInfo: ServerHealthInfo): void {
    const metrics = this.metrics.get(serverId);
    if (!metrics) return;

    // Map health status to server manager status
    let status: ServerMetrics['status'];
    switch (healthInfo.status) {
      case 'healthy':
        status = 'healthy';
        break;
      case 'degraded':
        status = 'degraded';
        break;
      case 'unhealthy':
        status = 'unhealthy';
        break;
      case 'disconnected':
      case 'reconnecting':
        status = 'disconnected';
        break;
      default:
        status = 'disconnected';
    }

    // Update metrics
    Object.assign(metrics, {
      status,
      lastHealthCheck: healthInfo.lastHealthCheck,
      averageResponseTime: healthInfo.averageResponseTime,
      errorRate: healthInfo.errorRate,
      connectionCount: healthInfo.connectionCount,
      memoryUsage: healthInfo.memoryUsage || 0,
    });

    this.metrics.set(serverId, metrics);
  }

  /**
   * Start health monitoring for all servers
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    console.log(`🏥 Basic health monitoring started (interval: ${this.config.healthCheckInterval}ms)`);
  }

  /**
   * Perform health checks on all servers
   */
  private async performHealthChecks(): Promise<void> {
    const promises = Array.from(this.metrics.keys()).map(async (serverId) => {
      try {
        const metrics = this.metrics.get(serverId);
        if (!metrics) return;

        // Update last health check time
        metrics.lastHealthCheck = new Date();
        
        // Check circuit breaker state
        const circuitState = this.circuitStates.get(serverId);
        if (circuitState === 'open') {
          // Check if recovery timeout has passed
          const timeSinceLastCheck = Date.now() - metrics.lastHealthCheck.getTime();
          if (timeSinceLastCheck > (this.config.circuitBreaker?.recoveryTimeout || 30000)) {
            this.circuitStates.set(serverId, 'half-open');
            console.log(`🔄 Circuit breaker for ${serverId} moved to half-open state`);
          }
        }

        // Update metrics (placeholder - would integrate with actual server monitoring)
        this.updateServerMetrics(serverId, {
          status: 'healthy', // Would be determined by actual health check
          connectionCount: this.connectionPools.get(serverId)?.length || 0,
        });

      } catch (error) {
        console.error(`❌ Health check failed for server ${serverId}:`, error);
        this.handleServerError(serverId, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Update server metrics
   */
  private updateServerMetrics(serverId: string, updates: Partial<ServerMetrics>): void {
    const metrics = this.metrics.get(serverId);
    if (metrics) {
      Object.assign(metrics, updates);
      this.metrics.set(serverId, metrics);
    }
  }

  /**
   * Handle server errors and circuit breaker logic
   */
  private handleServerError(serverId: string, _error: any): void {
    const metrics = this.metrics.get(serverId);
    if (!metrics) return;

    // Update error rate
    metrics.errorRate = Math.min(metrics.errorRate + 0.1, 1.0);
    metrics.status = 'unhealthy';

    // Check circuit breaker threshold
    const threshold = this.config.circuitBreaker?.failureThreshold || 5;
    if (metrics.errorRate * 10 >= threshold) {
      this.circuitStates.set(serverId, 'open');
      console.warn(`⚠️ Circuit breaker opened for server ${serverId} due to high error rate`);
    }

    this.updateServerMetrics(serverId, metrics);
  }

  /**
   * Get server selection based on load balancing strategy
   */
  selectOptimalServer(availableServers: MCPServerConfig[]): MCPServerConfig | null {
    const enabledServers = availableServers.filter(s => s.enabled);
    if (enabledServers.length === 0) return null;

    // Filter out servers with open circuit breakers
    const healthyServers = enabledServers.filter(server => {
      const circuitState = this.circuitStates.get(server.id);
      return circuitState !== 'open';
    });

    if (healthyServers.length === 0) return null;

    const strategy = this.config.loadBalancing?.strategy || 'priority-based';

    switch (strategy) {
      case 'priority-based':
        return healthyServers.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0] || null;

      case 'least-connections':
        return healthyServers.sort((a, b) => {
          const aConnections = this.metrics.get(a.id)?.connectionCount || 0;
          const bConnections = this.metrics.get(b.id)?.connectionCount || 0;
          return aConnections - bConnections;
        })[0] || null;

      case 'round-robin':
        // Simple round-robin implementation
        const timestamp = Date.now();
        const index = timestamp % healthyServers.length;
        return healthyServers[index] || null;

      case 'random':
        return healthyServers[Math.floor(Math.random() * healthyServers.length)] || null;

      default:
        return healthyServers[0] || null;
    }
  }

  /**
   * Get current server metrics
   */
  getServerMetrics(): ServerMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get detailed health information from health monitor
   */
  getDetailedServerHealth(): ServerHealthInfo[] {
    if (this.healthMonitor) {
      return this.healthMonitor.getAllServerHealth();
    }
    return [];
  }

  /**
   * Get health summary from health monitor
   */
  getHealthSummary() {
    if (this.healthMonitor) {
      return this.healthMonitor.getHealthSummary();
    }

    // Fallback to basic metrics summary
    const metrics = this.getServerMetrics();
    const totalServers = metrics.length;
    const healthyServers = metrics.filter(m => m.status === 'healthy').length;
    const unhealthyServers = metrics.filter(m => m.status === 'unhealthy').length;
    const disconnectedServers = metrics.filter(m => m.status === 'disconnected').length;

    return {
      totalServers,
      healthyServers,
      unhealthyServers,
      disconnectedServers,
      averageResponseTime: metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / totalServers || 0,
      overallStatus: unhealthyServers > 0 ? 'unhealthy' : healthyServers < totalServers ? 'degraded' : 'healthy',
    };
  }

  /**
   * Force health check for a specific server
   */
  async forceHealthCheck(serverId: string): Promise<ServerHealthInfo | null> {
    if (this.healthMonitor) {
      return await this.healthMonitor.forceHealthCheck(serverId);
    }
    return null;
  }

  /**
   * Manually trigger reconnection for a server
   */
  async reconnectServer(serverId: string): Promise<boolean> {
    if (this.healthMonitor) {
      return await this.healthMonitor.reconnectServer(serverId);
    }
    return false;
  }

  /**
   * Check if health monitoring is active
   */
  isHealthMonitoringActive(): boolean {
    return this.healthMonitor ? this.healthMonitor.isMonitoringActive() : false;
  }

  /**
   * Get server manager configuration
   */
  getConfig(): AdvancedServerManagerConfig {
    return { ...this.config };
  }

  /**
   * Shutdown server manager and cleanup resources
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Server Manager...');

    // Shutdown health monitor if active
    if (this.healthMonitor) {
      await this.healthMonitor.shutdown();
      this.healthMonitor = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Clear all metrics and connection pools
    this.metrics.clear();
    this.connectionPools.clear();
    this.circuitStates.clear();

    console.log('✅ Server Manager shutdown completed');
  }
}

/**
 * Create optimized server manager configuration
 */
export function createServerManagerConfig(
  overrides: Partial<AdvancedServerManagerConfig> = {}
): AdvancedServerManagerConfig {
  return {
    ...DEFAULT_CONFIG.serverManager,
    ...overrides,
    connectionPool: {
      maxConnectionsPerServer: 5,
      idleTimeout: 300000, // 5 minutes
      keepAliveInterval: 30000, // 30 seconds
      ...overrides.connectionPool,
    },
    resourceManagement: {
      maxMemoryPerServer: 512, // 512 MB
      cpuThreshold: 0.8, // 80%
      gcInterval: 60000, // 1 minute
      ...overrides.resourceManagement,
    },
    loadBalancing: {
      strategy: 'priority-based',
      ...overrides.loadBalancing,
    },
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 30000, // 30 seconds
      halfOpenMaxCalls: 3,
      ...overrides.circuitBreaker,
    },
  };
}

/**
 * Factory function to create a server manager instance
 */
export function createServerManager(
  config: Partial<AdvancedServerManagerConfig> = {}
): ServerManager {
  const fullConfig = createServerManagerConfig(config);
  return new ServerManager(fullConfig);
}
