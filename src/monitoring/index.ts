/**
 * Monitoring Module for MCP Multi-Server Agent
 * 
 * This module provides comprehensive monitoring capabilities including:
 * - Server health monitoring
 * - Connection status tracking
 * - Automatic reconnection management
 * - Health metrics and reporting
 */

// Core monitoring components
export { ServerHealthMonitor } from './server-health.js';
export { HealthChecker } from './health-checker.js';
export { ReconnectionManager } from './reconnection-manager.js';

// Types and interfaces
export type {
  ServerHealthStatus,
  ServerHealthInfo,
  HealthMonitoringConfig,
  HealthMonitoringEvents,
} from './server-health.js';

export type {
  HealthCheckResult,
  HealthCheckOptions,
} from './health-checker.js';

export type {
  ReconnectionAttempt,
  ReconnectionStatus,
  ReconnectionEvents,
} from './reconnection-manager.js';

// Default configuration
export { DEFAULT_HEALTH_CONFIG } from './server-health.js';

/**
 * Factory function to create a configured health monitoring system
 */
import type { MCPClientFactory } from '@/config/client-factory.js';
import type { MCPServerConfig } from '@/config/types.js';
import { ServerHealthMonitor, DEFAULT_HEALTH_CONFIG } from './server-health.js';
import type { HealthMonitoringConfig } from './server-health.js';

export async function createHealthMonitor(
  clientFactory: MCPClientFactory,
  servers: MCPServerConfig[],
  config: Partial<HealthMonitoringConfig> = {}
): Promise<ServerHealthMonitor> {
  const fullConfig = { ...DEFAULT_HEALTH_CONFIG, ...config };
  const monitor = new ServerHealthMonitor(clientFactory, fullConfig);
  
  await monitor.initialize(servers);
  
  return monitor;
}

/**
 * Utility function to create health monitoring with automatic startup
 */
export async function createAndStartHealthMonitor(
  clientFactory: MCPClientFactory,
  servers: MCPServerConfig[],
  config: Partial<HealthMonitoringConfig> = {}
): Promise<ServerHealthMonitor> {
  const monitor = await createHealthMonitor(clientFactory, servers, config);
  monitor.startMonitoring();
  return monitor;
}
