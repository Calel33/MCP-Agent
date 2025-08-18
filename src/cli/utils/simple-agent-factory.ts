/**
 * Simple Agent Factory for CLI (without complex error handling)
 * 
 * Provides a basic MultiServerAgent instance for CLI commands
 */

import { SimpleAgent } from './simple-agent.js';
import { OpenAIClient } from '@/llm/openai-client.js';
import { loadConfig } from '@/config/loader.js';
import type { MCPMultiAgentConfig } from '@/config/types.js';
import chalk from 'chalk';

// Singleton instance
let agentInstance: SimpleAgent | null = null;

/**
 * Get or create a simple agent instance
 */
export async function getSimpleMultiServerAgent(): Promise<SimpleAgent> {
  // If we already have an instance, return it
  if (agentInstance) {
    return agentInstance;
  }

  try {
    const isQuiet = process.env['CLI_QUIET'] === 'true';
    const isVerbose = process.env['CLI_VERBOSE'] === 'true';

    if (isVerbose) {
      console.log(chalk.gray('🔧 Initializing Simple Multi-Server Agent...'));
    }

    // Load configuration
    const config = loadConfig();

    if (isVerbose) {
      console.log(chalk.gray(`📡 Configuration loaded: ${config.servers.length} servers configured`));
    }

    // Get OpenAI client
    const openaiClient = new OpenAIClient(config.llm);

    if (isVerbose) {
      console.log(chalk.gray('🤖 OpenAI client initialized'));
    }

    // Create agent instance
    agentInstance = new SimpleAgent(config, openaiClient);

    // Initialize the agent
    await agentInstance.initialize();

    if (isVerbose) {
      const serverInfo = await agentInstance.getServerInfo();
      console.log(chalk.gray(`✅ Agent initialized: ${serverInfo.enabledServers}/${serverInfo.totalServers} servers enabled`));
    }

    return agentInstance;
    
  } catch (error) {
    console.error(chalk.red('Failed to initialize agent:'), error instanceof Error ? error.message : String(error));
    
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.error(chalk.gray('Error details:'), error);
    }
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        console.error(chalk.yellow('\n💡 Tip: Make sure your OpenAI API key is set in the .env file'));
        console.error(chalk.gray('   You can create one by running: mcp-agent config init'));
      }
      
      if (error.message.includes('config')) {
        console.error(chalk.yellow('\n💡 Tip: Initialize configuration with: mcp-agent config init'));
      }
    }
    
    throw error;
  }
}

/**
 * Reset the agent instance
 */
export function resetSimpleAgent(): void {
  if (agentInstance) {
    // Cleanup if the agent has a cleanup method
    if (typeof (agentInstance as any).cleanup === 'function') {
      (agentInstance as any).cleanup();
    }
  }
  
  agentInstance = null;
}

/**
 * Check if agent is initialized
 */
export function isSimpleAgentInitialized(): boolean {
  return agentInstance !== null;
}
