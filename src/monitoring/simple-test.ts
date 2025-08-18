/**
 * Simple Health Monitoring Test
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { MultiServerAgent } from '@/agent/multi-server-agent.js';
import { getOpenAIClient } from '@/llm/factory.js';
import { loadConfig } from '@/config/loader.js';

async function simpleTest(): Promise<void> {
  console.log('🧪 Simple Health Monitoring Test...');

  try {
    // Load configuration
    console.log('📋 Loading configuration...');
    const config = loadConfig();
    console.log(`✅ Configuration loaded with ${config.servers.length} servers`);
    
    // Create OpenAI client
    console.log('🤖 Creating OpenAI client...');
    const openaiClient = await getOpenAIClient(config.llm);
    console.log('✅ OpenAI client created');
    
    // Create agent
    console.log('🔧 Creating agent...');
    const agent = new MultiServerAgent(config, openaiClient);
    console.log('✅ Agent created');
    
    // Initialize agent
    console.log('🚀 Initializing agent...');
    await agent.initialize();
    console.log('✅ Agent initialized');
    
    // Check health monitoring status
    console.log('🏥 Checking health monitoring status...');
    const isMonitoring = agent.isHealthMonitoringActive();
    console.log(`Health monitoring active: ${isMonitoring}`);
    
    // Get health summary
    console.log('📊 Getting health summary...');
    const healthSummary = agent.getHealthSummary();
    console.log('Health Summary:', JSON.stringify(healthSummary, null, 2));
    
    // Get server health details
    console.log('🔍 Getting server health details...');
    const serverHealth = agent.getServerHealth();
    console.log(`Server Health: ${serverHealth.length} servers monitored`);
    
    serverHealth.forEach(health => {
      console.log(`  - ${health.serverId}: ${health.status} (failures: ${health.consecutiveFailures})`);
    });
    
    // Test connection status
    console.log('🔗 Testing connections...');
    const connectionResults = await agent.testConnections();
    console.log(`Successful connections: ${connectionResults.successful.length}`);
    console.log(`Failed connections: ${connectionResults.failed.length}`);
    
    // Cleanup
    console.log('🔄 Shutting down...');
    await agent.shutdown();
    
    console.log('✅ Simple test completed successfully!');
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    process.exit(1);
  }
}

// Run the test
simpleTest().catch(console.error);
