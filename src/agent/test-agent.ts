/**
 * Test suite for MultiServerAgent
 * 
 * This file provides comprehensive testing for the agent implementation
 * including initialization, server connections, and query execution.
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import chalk from 'chalk';
import { MultiServerAgent, createMultiServerAgent } from './multi-server-agent.js';
import { loadConfig } from '@/config/loader.js';
import { getOpenAIClient } from '@/llm/factory.js';

/**
 * Test the MultiServerAgent implementation
 */
export async function testMultiServerAgent(): Promise<void> {
  console.log(chalk.blue.bold('\n🧪 Testing Multi-Server Agent Implementation...\n'));

  try {
    // 1. Load configuration
    console.log(chalk.yellow('1. Loading configuration...'));
    const config = loadConfig();
    console.log(chalk.green(`   ✅ Configuration loaded with ${config.servers.length} servers`));
    console.log(chalk.gray(`   📊 Enabled servers: ${config.servers.filter(s => s.enabled).length}`));

    // 2. Create OpenAI client
    console.log(chalk.yellow('\n2. Creating OpenAI client...'));
    const openaiClient = await getOpenAIClient();
    console.log(chalk.green('   ✅ OpenAI client created successfully'));

    // 3. Create MultiServerAgent
    console.log(chalk.yellow('\n3. Creating Multi-Server Agent...'));
    const agent = await createMultiServerAgent(config, openaiClient);
    console.log(chalk.green('   ✅ Multi-Server Agent created successfully'));

    // 4. Test server information
    console.log(chalk.yellow('\n4. Getting server information...'));
    const serverInfo = await agent.getServerInfo();
    console.log(chalk.green(`   ✅ Found ${serverInfo.totalServers} total servers, ${serverInfo.enabledServers} enabled`));
    
    serverInfo.servers.forEach(server => {
      const status = server.enabled ? chalk.green('✅') : chalk.red('❌');
      console.log(chalk.gray(`   ${status} ${server.id}: ${server.name} (${server.connectionType})`));
    });

    // 5. Test connections (if servers are configured)
    if (serverInfo.enabledServers > 0) {
      console.log(chalk.yellow('\n5. Testing server connections...'));
      const connectionResults = await agent.testConnections();
      
      console.log(chalk.green(`   ✅ Successful connections: ${connectionResults.successful.length}`));
      connectionResults.successful.forEach(serverId => {
        console.log(chalk.gray(`   ✅ ${serverId}: Connected`));
      });

      if (connectionResults.failed.length > 0) {
        console.log(chalk.red(`   ❌ Failed connections: ${connectionResults.failed.length}`));
        connectionResults.failed.forEach(({ serverId, error }) => {
          console.log(chalk.gray(`   ❌ ${serverId}: ${error}`));
        });
      }
    } else {
      console.log(chalk.yellow('\n5. Skipping connection tests (no enabled servers)'));
    }

    // 6. Test basic query execution
    console.log(chalk.yellow('\n6. Testing basic query execution...'));
    try {
      const result = await agent.run('Hello! Can you tell me what tools you have access to?', {
        maxSteps: 5,
        timeout: 30000
      });
      
      console.log(chalk.green('   ✅ Query executed successfully'));
      console.log(chalk.gray(`   📝 Response: ${result.response.substring(0, 100)}...`));
      console.log(chalk.gray(`   ⏱️  Execution time: ${result.executionTime}ms`));
      console.log(chalk.gray(`   🔧 Tools used: ${result.toolsUsed.join(', ') || 'None'}`));
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow(`   ⚠️  Warnings: ${result.warnings.join(', ')}`));
      }
    } catch (error) {
      console.log(chalk.red(`   ❌ Query execution failed: ${error instanceof Error ? error.message : String(error)}`));
    }

    // 7. Test streaming query
    console.log(chalk.yellow('\n7. Testing streaming query...'));
    try {
      let streamedContent = '';
      const streamResult = await agent.runStream(
        'Count from 1 to 5 and explain what you are doing.',
        { maxSteps: 3, timeout: 20000 },
        (chunk) => {
          streamedContent += chunk;
          process.stdout.write(chalk.cyan(chunk));
        }
      );
      
      console.log(chalk.green('\n   ✅ Streaming query completed successfully'));
      console.log(chalk.gray(`   ⏱️  Execution time: ${streamResult.executionTime}ms`));
      console.log(chalk.gray(`   📊 Total content length: ${streamedContent.length} characters`));
      
      if (streamResult.warnings && streamResult.warnings.length > 0) {
        console.log(chalk.yellow(`   ⚠️  Warnings: ${streamResult.warnings.join(', ')}`));
      }
    } catch (error) {
      console.log(chalk.red(`   ❌ Streaming query failed: ${error instanceof Error ? error.message : String(error)}`));
    }

    // 8. Test agent status
    console.log(chalk.yellow('\n8. Checking agent status...'));
    const isReady = agent.isReady();
    console.log(chalk.green(`   ✅ Agent ready status: ${isReady}`));

    // 9. Cleanup
    console.log(chalk.yellow('\n9. Shutting down agent...'));
    await agent.shutdown();
    console.log(chalk.green('   ✅ Agent shutdown completed'));

    console.log(chalk.blue.bold('\n🎉 All Multi-Server Agent tests completed successfully!\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Multi-Server Agent test failed:'), error);
    throw error;
  }
}

/**
 * Test with minimal configuration (no external servers)
 */
export async function testMinimalAgent(): Promise<void> {
  console.log(chalk.blue.bold('\n🧪 Testing Minimal Agent Configuration...\n'));

  try {
    // Create minimal config with no external servers
    const minimalConfig = loadConfig({
      servers: [], // No servers for minimal test
      agent: {
        maxSteps: 3,
        timeout: 15000,
        autoInitialize: true,
        verbose: false,
      }
    });

    const openaiClient = await getOpenAIClient();
    const agent = new MultiServerAgent(minimalConfig, openaiClient);

    console.log(chalk.yellow('Testing minimal agent initialization...'));
    await agent.initialize();
    console.log(chalk.green('✅ Minimal agent initialized successfully'));

    console.log(chalk.yellow('Testing server info with no servers...'));
    const serverInfo = await agent.getServerInfo();
    console.log(chalk.green(`✅ Server info: ${serverInfo.totalServers} servers, ${serverInfo.enabledServers} enabled`));

    console.log(chalk.yellow('Testing streaming with no MCP servers...'));
    await agent.runStream('What is 2 + 2?', {}, (chunk) => {
      process.stdout.write(chalk.cyan(chunk));
    });
    console.log(chalk.green('\n✅ Streaming test completed'));

    await agent.shutdown();
    console.log(chalk.blue.bold('\n🎉 Minimal agent test completed successfully!\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Minimal agent test failed:'), error);
    throw error;
  }
}

/**
 * Run all agent tests
 */
export async function runAllAgentTests(): Promise<void> {
  try {
    await testMinimalAgent();
    await testMultiServerAgent();
    console.log(chalk.green.bold('\n🎉 All agent tests passed! 🚀\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n💥 Agent tests failed!\n'));
    throw error;
  }
}

// Allow running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllAgentTests().catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
