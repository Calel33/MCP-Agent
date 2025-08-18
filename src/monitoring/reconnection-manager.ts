/**
 * Reconnection Manager for MCP Servers
 * 
 * This module handles automatic reconnection logic for failed MCP servers,
 * including exponential backoff, retry limits, and connection recovery.
 */

import type { MCPServerConfig } from '@/config/types.js';
import type { MCPClientFactory } from '@/config/client-factory.js';
import type { HealthMonitoringConfig } from './server-health.js';

/**
 * Reconnection attempt information
 */
export interface ReconnectionAttempt {
  serverId: string;
  attempt: number;
  timestamp: Date;
  success: boolean;
  error?: Error;
  nextAttemptAt?: Date;
}

/**
 * Reconnection status for a server
 */
export interface ReconnectionStatus {
  serverId: string;
  isReconnecting: boolean;
  totalAttempts: number;
  lastAttempt?: ReconnectionAttempt | undefined;
  nextAttemptAt?: Date | undefined;
  backoffDelay: number;
  maxAttemptsReached: boolean;
}

/**
 * Reconnection events
 */
export interface ReconnectionEvents {
  'reconnection-started': (serverId: string) => void;
  'reconnection-success': (serverId: string) => void;
  'reconnection-failed': (serverId: string, error: Error, attempt: number) => void;
  'reconnection-abandoned': (serverId: string, totalAttempts: number) => void;
  'backoff-delay': (serverId: string, delay: number) => void;
}

/**
 * Reconnection Manager class
 */
export class ReconnectionManager {
  private clientFactory: MCPClientFactory;
  private config: HealthMonitoringConfig;
  private serverConfigs: Map<string, MCPServerConfig> = new Map();
  
  private reconnectionStatus: Map<string, ReconnectionStatus> = new Map();
  private reconnectionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<keyof ReconnectionEvents, Function[]> = new Map();
  private isShuttingDown = false;

  constructor(clientFactory: MCPClientFactory, config: HealthMonitoringConfig) {
    this.clientFactory = clientFactory;
    this.config = config;
  }

  /**
   * Initialize reconnection manager
   */
  async initialize(servers: MCPServerConfig[]): Promise<void> {
    console.log('🔄 Initializing Reconnection Manager...');
    
    for (const server of servers) {
      if (server.enabled) {
        this.serverConfigs.set(server.id, server);
        this.reconnectionStatus.set(server.id, {
          serverId: server.id,
          isReconnecting: false,
          totalAttempts: 0,
          backoffDelay: this.config.reconnectInterval,
          maxAttemptsReached: false,
        });
      }
    }

    console.log(`✅ Reconnection Manager initialized for ${this.serverConfigs.size} servers`);
  }

  /**
   * Schedule reconnection for a server
   */
  async scheduleReconnection(serverId: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    const status = this.reconnectionStatus.get(serverId);
    if (!status) {
      console.warn(`⚠️ No reconnection status found for server ${serverId}`);
      return;
    }

    if (status.isReconnecting) {
      console.log(`🔄 Reconnection already in progress for ${serverId}`);
      return;
    }

    if (status.maxAttemptsReached) {
      console.log(`⚠️ Max reconnection attempts reached for ${serverId}`);
      return;
    }

    console.log(`📅 Scheduling reconnection for ${serverId} (attempt ${status.totalAttempts + 1})`);
    
    status.isReconnecting = true;
    this.emit('reconnection-started', serverId);

    // Calculate backoff delay with exponential backoff
    const delay = this.calculateBackoffDelay(status.totalAttempts);
    status.backoffDelay = delay;
    status.nextAttemptAt = new Date(Date.now() + delay);

    this.emit('backoff-delay', serverId, delay);

    // Schedule the reconnection attempt
    const timeout = setTimeout(async () => {
      await this.attemptReconnection(serverId);
    }, delay);

    this.reconnectionTimeouts.set(serverId, timeout);
  }

  /**
   * Attempt to reconnect to a server
   */
  async attemptReconnection(serverId: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    const status = this.reconnectionStatus.get(serverId);
    if (!status) {
      return;
    }

    status.totalAttempts++;
    const attempt: ReconnectionAttempt = {
      serverId,
      attempt: status.totalAttempts,
      timestamp: new Date(),
      success: false,
    };

    console.log(`🔄 Attempting reconnection to ${serverId} (attempt ${attempt.attempt}/${this.config.maxReconnectAttempts})`);

    try {
      // Close existing session if any
      await this.clientFactory.closeSession(serverId);
      
      // Wait a moment before attempting to reconnect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt to create new session
      await this.clientFactory.createSession(serverId, true);
      
      // Verify connection is working
      const isConnected = this.clientFactory.isConnected(serverId);
      if (!isConnected) {
        throw new Error('Connection verification failed');
      }

      // Success!
      attempt.success = true;
      status.lastAttempt = attempt;
      status.isReconnecting = false;
      status.totalAttempts = 0; // Reset attempt counter on success
      status.backoffDelay = this.config.reconnectInterval; // Reset backoff
      status.maxAttemptsReached = false;

      console.log(`✅ Successfully reconnected to ${serverId}`);
      this.emit('reconnection-success', serverId);

    } catch (error) {
      attempt.success = false;
      attempt.error = error as Error;
      status.lastAttempt = attempt;

      console.error(`❌ Reconnection attempt ${attempt.attempt} failed for ${serverId}:`, error);
      this.emit('reconnection-failed', serverId, error as Error, attempt.attempt);

      // Check if we should continue trying
      if (status.totalAttempts >= this.config.maxReconnectAttempts) {
        status.maxAttemptsReached = true;
        status.isReconnecting = false;
        
        console.warn(`⚠️ Max reconnection attempts (${this.config.maxReconnectAttempts}) reached for ${serverId}`);
        this.emit('reconnection-abandoned', serverId, status.totalAttempts);
      } else {
        // Schedule next attempt
        status.isReconnecting = false;
        await this.scheduleReconnection(serverId);
      }
    }

    // Clean up timeout
    this.reconnectionTimeouts.delete(serverId);
  }

  /**
   * Manually trigger reconnection for a server
   */
  async reconnectServer(serverId: string): Promise<boolean> {
    console.log(`🔄 Manual reconnection triggered for ${serverId}`);
    
    // Cancel any scheduled reconnection
    this.cancelReconnection(serverId);
    
    // Reset status
    const status = this.reconnectionStatus.get(serverId);
    if (status) {
      status.totalAttempts = 0;
      status.maxAttemptsReached = false;
      status.isReconnecting = false;
    }

    // Attempt immediate reconnection
    await this.attemptReconnection(serverId);
    
    // Return success status
    return this.clientFactory.isConnected(serverId);
  }

  /**
   * Cancel scheduled reconnection for a server
   */
  cancelReconnection(serverId: string): void {
    const timeout = this.reconnectionTimeouts.get(serverId);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectionTimeouts.delete(serverId);
    }

    const status = this.reconnectionStatus.get(serverId);
    if (status) {
      status.isReconnecting = false;
      status.nextAttemptAt = undefined;
    }

    console.log(`🚫 Cancelled reconnection for ${serverId}`);
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attemptNumber: number): number {
    const baseDelay = this.config.reconnectInterval;
    const maxDelay = 300000; // 5 minutes max
    
    // Exponential backoff: baseDelay * 2^attemptNumber
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
    
    // Add some jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    
    return Math.floor(delay + jitter);
  }

  /**
   * Reset reconnection status for a server
   */
  resetReconnectionStatus(serverId: string): void {
    this.cancelReconnection(serverId);
    
    const status = this.reconnectionStatus.get(serverId);
    if (status) {
      status.totalAttempts = 0;
      status.isReconnecting = false;
      status.backoffDelay = this.config.reconnectInterval;
      status.maxAttemptsReached = false;
      status.lastAttempt = undefined;
      status.nextAttemptAt = undefined;
    }

    console.log(`🔄 Reset reconnection status for ${serverId}`);
  }

  /**
   * Get reconnection status for a server
   */
  getReconnectionStatus(serverId: string): ReconnectionStatus | null {
    return this.reconnectionStatus.get(serverId) || null;
  }

  /**
   * Get reconnection status for all servers
   */
  getAllReconnectionStatus(): ReconnectionStatus[] {
    return Array.from(this.reconnectionStatus.values());
  }

  /**
   * Check if any servers are currently reconnecting
   */
  hasActiveReconnections(): boolean {
    return Array.from(this.reconnectionStatus.values()).some(status => status.isReconnecting);
  }

  /**
   * Get servers that have reached max attempts
   */
  getFailedServers(): string[] {
    return Array.from(this.reconnectionStatus.values())
      .filter(status => status.maxAttemptsReached)
      .map(status => status.serverId);
  }

  /**
   * Add event listener
   */
  on<K extends keyof ReconnectionEvents>(
    event: K,
    listener: ReconnectionEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof ReconnectionEvents>(
    event: K,
    listener: ReconnectionEvents[K]
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
  private emit<K extends keyof ReconnectionEvents>(
    event: K,
    ...args: Parameters<ReconnectionEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Error in reconnection event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get reconnection statistics
   */
  getStatistics(): {
    totalServers: number;
    reconnectingServers: number;
    failedServers: number;
    totalAttempts: number;
    successfulReconnections: number;
  } {
    const allStatus = this.getAllReconnectionStatus();
    
    return {
      totalServers: allStatus.length,
      reconnectingServers: allStatus.filter(s => s.isReconnecting).length,
      failedServers: allStatus.filter(s => s.maxAttemptsReached).length,
      totalAttempts: allStatus.reduce((sum, s) => sum + s.totalAttempts, 0),
      successfulReconnections: allStatus.filter(s => s.lastAttempt?.success).length,
    };
  }

  /**
   * Shutdown reconnection manager
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Reconnection Manager...');
    
    this.isShuttingDown = true;
    
    // Cancel all pending reconnections
    for (const serverId of this.reconnectionTimeouts.keys()) {
      this.cancelReconnection(serverId);
    }
    
    // Clear all data
    this.reconnectionStatus.clear();
    this.reconnectionTimeouts.clear();
    this.eventListeners.clear();
    
    console.log('✅ Reconnection Manager shutdown completed');
  }
}
