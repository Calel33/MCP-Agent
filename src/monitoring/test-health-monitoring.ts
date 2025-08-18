/**
 * Test Health Monitoring Implementation
 * 
 * This module provides testing functionality for the health monitoring system.
 */

import { MultiServerAgent } from '@/agent/multi-server-agent.js';
import { getOpenAIClient } from '@/llm/factory.js';
import { loadConfig } from '@/config/loader.js';
import type { MCPMultiAgentConfig } from '@/config/types.js';
import type { AdvancedServerManagerConfig } from '@/config/server-manager.js';

/**
 * Test health monitoring functionality
 */
export async function testHealthMonitoring(): Promise<void> {
  console.log('🧪 Testing Health Monitoring System...');

  try {
    // Load configuration
    const config = loadConfig();

    // Create OpenAI client
    const openaiClient = await getOpenAIClient(config.llm);
    
    // Create agent with health monitoring enabled
    const agentConfig: MCPMultiAgentConfig = {
      ...config,
      serverManager: {
        ...config.serverManager,
        healthMonitoring: true,
        healthCheckInterval: 10000, // 10 seconds for testing
        autoReconnect: true,
      },
    };

    const agent = new MultiServerAgent(agentConfig, openaiClient);
    
    console.log('🔧 Initializing agent with health monitoring...');
    await agent.initialize();
    
    // Test 1: Check initial health status
    console.log('\n📊 Test 1: Initial Health Status');
    const initialHealth = agent.getHealthSummary();
    console.log('Health Summary:', JSON.stringify(initialHealth, null, 2));
    
    const serverHealth = agent.getServerHealth();
    console.log(`Server Health Details: ${serverHealth.length} servers monitored`);
    serverHealth.forEach(health => {
      console.log(`  - ${health.serverId}: ${health.status} (${health.consecutiveFailures} failures)`);
    });

    // Test 2: Check if health monitoring is active
    console.log('\n🏥 Test 2: Health Monitoring Status');
    const isMonitoring = agent.isHealthMonitoringActive();
    console.log(`Health monitoring active: ${isMonitoring}`);

    // Test 3: Test connection status
    console.log('\n🔍 Test 3: Connection Testing');
    const connectionResults = await agent.testConnections();
    console.log('Connection Test Results:');
    console.log(`  Successful: ${connectionResults.successful.join(', ')}`);
    console.log(`  Failed: ${connectionResults.failed.map(f => `${f.serverId} (${f.error})`).join(', ')}`);

    // Test 4: Force health check on a specific server
    if (serverHealth.length > 0) {
      console.log('\n🔄 Test 4: Force Health Check');
      const serverId = serverHealth[0]!.serverId;
      console.log(`Forcing health check for server: ${serverId}`);
      
      const healthResult = await agent.forceHealthCheck(serverId);
      if (healthResult) {
        console.log(`Health check result: ${healthResult.status} (${healthResult.averageResponseTime}ms avg)`);
      } else {
        console.log('Health check not available (using basic monitoring)');
      }
    }

    // Test 5: Server metrics
    console.log('\n📈 Test 5: Server Metrics');
    const metrics = agent.getServerMetrics();
    console.log(`Server Metrics: ${metrics.length} servers`);
    metrics.forEach(metric => {
      console.log(`  - ${metric.serverId}: ${metric.status} (${metric.errorRate.toFixed(2)} error rate, ${metric.averageResponseTime}ms avg)`);
    });

    // Test 6: Wait for health monitoring cycle
    console.log('\n⏱️ Test 6: Waiting for Health Monitoring Cycle (15 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    const updatedHealth = agent.getHealthSummary();
    console.log('Updated Health Summary:', JSON.stringify(updatedHealth, null, 2));

    // Test 7: Test reconnection (if any servers are disconnected)
    console.log('\n🔄 Test 7: Reconnection Testing');
    const currentHealth = agent.getServerHealth();
    const disconnectedServers = currentHealth.filter(h => h.status === 'disconnected' || h.status === 'unhealthy');
    
    if (disconnectedServers.length > 0) {
      const serverId = disconnectedServers[0]!.serverId;
      console.log(`Testing reconnection for server: ${serverId}`);
      
      const reconnectResult = await agent.reconnectServer(serverId);
      console.log(`Reconnection result: ${reconnectResult ? 'Success' : 'Failed'}`);
    } else {
      console.log('All servers are healthy, no reconnection testing needed');
    }

    // Test 8: Final health summary
    console.log('\n📊 Test 8: Final Health Summary');
    const finalHealth = agent.getHealthSummary();
    console.log('Final Health Summary:', JSON.stringify(finalHealth, null, 2));
    
    console.log('\n✅ Health monitoring tests completed successfully!');
    
    // Cleanup
    console.log('\n🔄 Cleaning up...');
    await agent.shutdown();
    
  } catch (error) {
    console.error('❌ Health monitoring test failed:', error);
    throw error;
  }
}

/**
 * Test health monitoring with simulated failures
 */
export async function testHealthMonitoringWithFailures(): Promise<void> {
  console.log('🧪 Testing Health Monitoring with Simulated Failures...');

  try {
    // Load configuration with shorter intervals for testing
    const config = loadConfig();

    // Create OpenAI client
    const openaiClient = await getOpenAIClient(config.llm);
    
    // Create agent with aggressive health monitoring for testing
    const advancedServerManagerConfig: AdvancedServerManagerConfig = {
      ...config.serverManager,
      healthMonitoring: true,
      healthCheckInterval: 5000, // 5 seconds
      autoReconnect: true,
      circuitBreaker: {
        failureThreshold: 2, // Low threshold for testing
        recoveryTimeout: 15000, // 15 seconds
        halfOpenMaxCalls: 1,
      },
    };

    const agentConfig: MCPMultiAgentConfig = {
      ...config,
      serverManager: advancedServerManagerConfig,
    };

    const agent = new MultiServerAgent(agentConfig, openaiClient);
    
    console.log('🔧 Initializing agent...');
    await agent.initialize();
    
    console.log('📊 Initial state:');
    const initialHealth = agent.getHealthSummary();
    console.log(JSON.stringify(initialHealth, null, 2));
    
    // Monitor health changes for 30 seconds
    console.log('\n⏱️ Monitoring health changes for 30 seconds...');
    
    const startTime = Date.now();
    const monitoringDuration = 30000; // 30 seconds
    
    while (Date.now() - startTime < monitoringDuration) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
      
      const currentHealth = agent.getHealthSummary();
      const serverHealth = agent.getServerHealth();
      
      console.log(`\n📊 Health Update (${Math.floor((Date.now() - startTime) / 1000)}s):`);
      console.log(`Overall: ${currentHealth.overallStatus} (${currentHealth.healthyServers}/${currentHealth.totalServers} healthy)`);
      
      serverHealth.forEach(health => {
        const status = health.status;
        const failures = health.consecutiveFailures;
        const circuitBreaker = health.isCircuitBreakerOpen ? ' [CB OPEN]' : '';
        console.log(`  - ${health.serverId}: ${status} (${failures} failures)${circuitBreaker}`);
      });
    }
    
    console.log('\n✅ Health monitoring with failures test completed!');
    
    // Cleanup
    await agent.shutdown();
    
  } catch (error) {
    console.error('❌ Health monitoring with failures test failed:', error);
    throw error;
  }
}

/**
 * Run all health monitoring tests
 */
export async function runAllHealthMonitoringTests(): Promise<void> {
  console.log('🚀 Running All Health Monitoring Tests...\n');
  
  try {
    await testHealthMonitoring();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    await testHealthMonitoringWithFailures();
    
    console.log('\n🎉 All health monitoring tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Health monitoring tests failed:', error);
    process.exit(1);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const testType = process.argv[2];
  
  switch (testType) {
    case 'basic':
      testHealthMonitoring().catch(console.error);
      break;
    case 'failures':
      testHealthMonitoringWithFailures().catch(console.error);
      break;
    case 'all':
    default:
      runAllHealthMonitoringTests().catch(console.error);
      break;
  }
}
