/**
 * Agent Factory for CLI
 * 
 * Provides a singleton instance of the MultiServerAgent for CLI commands
 */

import { MultiServerAgent } from '@/agent/multi-server-agent.js';
import { OpenAIClient } from '@/llm/openai-client.js';
import { loadConfig } from '@/config/loader.js';
import type { MCPMultiAgentConfig } from '@/config/types.js';
import chalk from 'chalk';

// Singleton instance
let agentInstance: MultiServerAgent | null = null;
let initializationPromise: Promise<MultiServerAgent> | null = null;

/**
 * Get or create the MultiServerAgent instance
 */
export async function getMultiServerAgent(): Promise<MultiServerAgent> {
  // If we already have an instance, return it
  if (agentInstance) {
    return agentInstance;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = initializeAgent();
  
  try {
    agentInstance = await initializationPromise;
    return agentInstance;
  } catch (error) {
    // Reset promise on failure so we can retry
    initializationPromise = null;
    throw error;
  }
}

/**
 * Initialize the MultiServerAgent
 */
async function initializeAgent(): Promise<MultiServerAgent> {
  try {
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.log(chalk.gray('🔧 Initializing Multi-Server Agent...'));
    }

    // Load configuration
    const config = await loadAgentConfig();
    
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.log(chalk.gray(`📡 Configuration loaded: ${config.servers.length} servers configured`));
    }

    // Get OpenAI client
    const openaiClient = new OpenAIClient();

    if (process.env['CLI_VERBOSE'] === 'true') {
      console.log(chalk.gray('🤖 OpenAI client initialized'));
    }

    // Create agent instance
    const agent = new MultiServerAgent(config, openaiClient);
    
    // Initialize the agent
    await agent.initialize();
    
    if (process.env['CLI_VERBOSE'] === 'true') {
      const serverInfo = await agent.getServerInfo();
      console.log(chalk.gray(`✅ Agent initialized: ${serverInfo.enabledServers}/${serverInfo.totalServers} servers enabled`));
    }

    return agent;
    
  } catch (error) {
    console.error(chalk.red('Failed to initialize agent:'), error instanceof Error ? error.message : String(error));
    
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.error(chalk.gray('Error details:'), error);
    }
    
    throw error;
  }
}

/**
 * Load agent configuration from file or environment
 */
async function loadAgentConfig(): Promise<MCPMultiAgentConfig> {
  try {
    // Try to load from custom config file if specified
    const customConfigPath = process.env['CLI_CONFIG_PATH'];

    if (customConfigPath) {
      if (process.env['CLI_VERBOSE'] === 'true') {
        console.log(chalk.gray(`📄 Loading custom config: ${customConfigPath}`));
      }
      
      // Load custom configuration
      return await loadCustomConfig(customConfigPath);
    }
    
    // Use default configuration loader
    const config = loadConfig();
    
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.log(chalk.gray('📄 Using default configuration'));
    }
    
    return config;
    
  } catch (error) {
    console.error(chalk.red('Configuration error:'), error instanceof Error ? error.message : String(error));
    
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
 * Load configuration from a custom file path
 */
async function loadCustomConfig(configPath: string): Promise<MCPMultiAgentConfig> {
  const { existsSync, readFileSync } = await import('fs');
  const { resolve } = await import('path');
  
  const fullPath = resolve(configPath);
  
  if (!existsSync(fullPath)) {
    throw new Error(`Configuration file not found: ${fullPath}`);
  }
  
  try {
    const configContent = readFileSync(fullPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Validate and transform the configuration
    return validateAndTransformConfig(config);
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file: ${fullPath}`);
    }
    throw error;
  }
}

/**
 * Validate and transform configuration object
 */
function validateAndTransformConfig(config: any): MCPMultiAgentConfig {
  // Basic validation
  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be an object');
  }
  
  // Ensure required sections exist
  const transformedConfig: MCPMultiAgentConfig = {
    llm: {
      provider: 'openai',
      model: config.llm?.model || 'gpt-4',
      apiKey: config.llm?.apiKey || process.env['OPENAI_API_KEY'] || '',
      ...config.llm
    },
    servers: config.servers || [],
    agent: {
      maxSteps: config.agent?.maxSteps || 10,
      timeout: config.agent?.timeout || 30000,
      ...config.agent
    },
    serverManager: {
      enabled: config.serverManager?.enabled !== false,
      maxConcurrentServers: config.serverManager?.maxConcurrentServers || 5,
      healthCheckInterval: config.serverManager?.healthCheckInterval || 30000,
      ...config.serverManager
    }
  };
  
  // Validate API key
  if (!transformedConfig.llm.apiKey) {
    throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or configure it in the config file.');
  }
  
  // Validate servers array
  if (!Array.isArray(transformedConfig.servers)) {
    throw new Error('Configuration "servers" must be an array');
  }
  
  return transformedConfig;
}

/**
 * Reset the agent instance (useful for testing or configuration changes)
 */
export function resetAgent(): void {
  if (agentInstance) {
    // Cleanup if the agent has a cleanup method
    if (typeof (agentInstance as any).cleanup === 'function') {
      (agentInstance as any).cleanup();
    }
  }
  
  agentInstance = null;
  initializationPromise = null;
}

/**
 * Check if agent is initialized
 */
export function isAgentInitialized(): boolean {
  return agentInstance !== null;
}

/**
 * Get agent instance without initialization (returns null if not initialized)
 */
export function getAgentIfInitialized(): MultiServerAgent | null {
  return agentInstance;
}
