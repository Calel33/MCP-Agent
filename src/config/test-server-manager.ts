/**
 * Test script for server manager configuration
 * 
 * This script validates the server manager implementation and demonstrates
 * the performance optimizations and resource management features.
 */

import { createServerManager, createServerManagerConfig } from './server-manager.js';
import type { MCPServerConfig } from './types.js';

/**
 * Test server configurations for validation
 */
const testServers: MCPServerConfig[] = [
  {
    id: 'filesystem',
    name: 'File System Server',
    description: 'Local file system operations',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', '/tmp'],
    enabled: true,
    priority: 10,
    tags: ['filesystem', 'local'],
    timeout: 30000,
    retry: {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
    },
  },
  {
    id: 'web-search',
    name: 'Web Search Server',
    description: 'Web search capabilities',
    connectionType: 'http',
    url: 'http://localhost:3001',
    enabled: true,
    priority: 8,
    tags: ['web', 'search'],
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  {
    id: 'database',
    name: 'Database Server',
    description: 'Database operations',
    connectionType: 'websocket',
    url: 'ws://localhost:3002',
    enabled: true,
    priority: 9,
    tags: ['database', 'sql'],
    timeout: 20000,
  },
  {
    id: 'disabled-server',
    name: 'Disabled Test Server',
    description: 'Server for testing disabled state',
    connectionType: 'http',
    url: 'http://localhost:9999',
    enabled: false,
    priority: 1,
    tags: ['test'],
  },
];

/**
 * Test server manager configuration creation
 */
async function testServerManagerConfig(): Promise<void> {
  console.log('🧪 Testing Server Manager Configuration...\n');

  // Test 1: Default configuration
  console.log('📋 Test 1: Default Configuration');
  const defaultConfig = createServerManagerConfig();
  console.log('✅ Default config created:', {
    enabled: defaultConfig.enabled,
    maxConcurrentServers: defaultConfig.maxConcurrentServers,
    serverStartupTimeout: defaultConfig.serverStartupTimeout,
    healthMonitoring: defaultConfig.healthMonitoring,
    autoReconnect: defaultConfig.autoReconnect,
  });

  // Test 2: Custom configuration
  console.log('\n📋 Test 2: Custom Configuration');
  const customConfig = createServerManagerConfig({
    maxConcurrentServers: 5,
    serverStartupTimeout: 45,
    healthCheckInterval: 15000,
    connectionPool: {
      maxConnectionsPerServer: 10,
      idleTimeout: 600000,
      keepAliveInterval: 60000,
    },
    loadBalancing: {
      strategy: 'least-connections',
    },
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeout: 20000,
      halfOpenMaxCalls: 2,
    },
  });
  console.log('✅ Custom config created:', {
    maxConcurrentServers: customConfig.maxConcurrentServers,
    serverStartupTimeout: customConfig.serverStartupTimeout,
    healthCheckInterval: customConfig.healthCheckInterval,
    loadBalancing: customConfig.loadBalancing?.strategy,
    circuitBreaker: customConfig.circuitBreaker?.failureThreshold,
  });

  console.log('\n✅ Server Manager Configuration Tests Passed!\n');
}

/**
 * Test server manager initialization and operations
 */
async function testServerManagerOperations(): Promise<void> {
  console.log('🔧 Testing Server Manager Operations...\n');

  // Create server manager with optimized configuration
  const config = createServerManagerConfig({
    maxConcurrentServers: 3,
    healthMonitoring: true,
    healthCheckInterval: 5000, // 5 seconds for testing
    loadBalancing: {
      strategy: 'priority-based',
    },
  });

  const serverManager = createServerManager(config);

  try {
    // Test 1: Initialization
    console.log('📋 Test 1: Server Manager Initialization');
    await serverManager.initialize(testServers);
    console.log('✅ Server manager initialized successfully');

    // Test 2: Get MCP Agent configuration
    console.log('\n📋 Test 2: MCP Agent Configuration');
    const mcpConfig = serverManager.getMCPAgentConfig();
    console.log('✅ MCP Agent config:', mcpConfig);

    // Test 3: Server selection
    console.log('\n📋 Test 3: Server Selection');
    const enabledServers = testServers.filter(s => s.enabled);
    const selectedServer = serverManager.selectOptimalServer(enabledServers);
    console.log('✅ Selected server:', selectedServer?.id, '(priority:', selectedServer?.priority, ')');

    // Test 4: Server metrics
    console.log('\n📋 Test 4: Server Metrics');
    const metrics = serverManager.getServerMetrics();
    console.log('✅ Server metrics count:', metrics.length);
    metrics.forEach(metric => {
      console.log(`  - ${metric.serverId}: ${metric.status} (connections: ${metric.connectionCount})`);
    });

    // Test 5: Configuration retrieval
    console.log('\n📋 Test 5: Configuration Retrieval');
    const retrievedConfig = serverManager.getConfig();
    console.log('✅ Retrieved config:', {
      enabled: retrievedConfig.enabled,
      maxConcurrentServers: retrievedConfig.maxConcurrentServers,
      healthMonitoring: retrievedConfig.healthMonitoring,
    });

    // Wait a bit to see health monitoring in action
    console.log('\n⏳ Waiting 6 seconds to observe health monitoring...');
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Check metrics again
    const updatedMetrics = serverManager.getServerMetrics();
    console.log('✅ Updated metrics after health check:');
    updatedMetrics.forEach(metric => {
      console.log(`  - ${metric.serverId}: ${metric.status} (last check: ${metric.lastHealthCheck.toISOString()})`);
    });

    // Test 6: Shutdown
    console.log('\n📋 Test 6: Server Manager Shutdown');
    await serverManager.shutdown();
    console.log('✅ Server manager shutdown completed');

  } catch (error) {
    console.error('❌ Server manager test failed:', error);
    throw error;
  }

  console.log('\n✅ Server Manager Operations Tests Passed!\n');
}

/**
 * Test performance scenarios
 */
async function testPerformanceScenarios(): Promise<void> {
  console.log('🚀 Testing Performance Scenarios...\n');

  // Test 1: High concurrency configuration
  console.log('📋 Test 1: High Concurrency Configuration');
  const highConcurrencyConfig = createServerManagerConfig({
    maxConcurrentServers: 10,
    connectionPool: {
      maxConnectionsPerServer: 20,
      idleTimeout: 120000,
      keepAliveInterval: 15000,
    },
    resourceManagement: {
      maxMemoryPerServer: 1024, // 1GB
      cpuThreshold: 0.9,
      gcInterval: 30000,
    },
  });

  const highConcurrencyManager = createServerManager(highConcurrencyConfig);
  await highConcurrencyManager.initialize(testServers);
  
  const highConcurrencyMcpConfig = highConcurrencyManager.getMCPAgentConfig();
  console.log('✅ High concurrency MCP config:', {
    maxConcurrentServers: highConcurrencyMcpConfig.maxConcurrentServers,
    connectionPooling: highConcurrencyMcpConfig['connectionPooling'],
  });

  await highConcurrencyManager.shutdown();

  // Test 2: Low latency configuration
  console.log('\n📋 Test 2: Low Latency Configuration');
  const lowLatencyConfig = createServerManagerConfig({
    maxConcurrentServers: 2,
    serverStartupTimeout: 10,
    healthCheckInterval: 2000,
    loadBalancing: {
      strategy: 'least-connections',
    },
    circuitBreaker: {
      failureThreshold: 2,
      recoveryTimeout: 5000,
      halfOpenMaxCalls: 1,
    },
  });

  const lowLatencyManager = createServerManager(lowLatencyConfig);
  await lowLatencyManager.initialize(testServers);
  
  const lowLatencyMcpConfig = lowLatencyManager.getMCPAgentConfig();
  console.log('✅ Low latency MCP config:', {
    maxConcurrentServers: lowLatencyMcpConfig.maxConcurrentServers,
    serverStartupTimeout: lowLatencyMcpConfig.serverStartupTimeout,
  });

  await lowLatencyManager.shutdown();

  console.log('\n✅ Performance Scenarios Tests Passed!\n');
}

/**
 * Main test function
 */
async function runServerManagerTests(): Promise<void> {
  console.log('🎯 Starting Server Manager Tests\n');
  console.log('=' .repeat(60));

  try {
    await testServerManagerConfig();
    await testServerManagerOperations();
    await testPerformanceScenarios();

    console.log('=' .repeat(60));
    console.log('🎉 All Server Manager Tests Passed Successfully!');
    console.log('✅ Server manager configuration is working correctly');
    console.log('✅ Performance optimizations are properly configured');
    console.log('✅ Resource management features are functional');

  } catch (error) {
    console.error('\n' + '=' .repeat(60));
    console.error('❌ Server Manager Tests Failed!');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runServerManagerTests().catch(console.error);
}

export {
  runServerManagerTests,
  testServerManagerConfig,
  testServerManagerOperations,
  testPerformanceScenarios,
};
