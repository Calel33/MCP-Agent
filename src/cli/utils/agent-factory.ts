/**
 * Agent Factory for CLI
 * 
 * Provides a singleton instance of the MultiServerAgent for CLI commands
 */

import { MultiServerAgent } from '@/agent/multi-server-agent.ts';
import { OpenAIClient } from '@/llm/openai-client.ts';
import { loadConfig, createConfig } from '@/config/loader.ts';
import type { MCPMultiAgentConfig, MCPServerConfig } from '@/config/types.ts';
import chalk from 'chalk';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

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
    
    // Try to load from config files first, then fall back to defaults
    const config = await loadConfigFromFiles();
    
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
 * Load configuration from files (mcp-config.json or mcp-agent.config.json)
 */
async function loadConfigFromFiles(): Promise<MCPMultiAgentConfig> {
  // Get the project root directory (where package.json is located)
  const projectRoot = findProjectRoot();
  
  // Define config file locations - check UI directory first, then root
  const configLocations = [
    { path: join(projectRoot, 'mcp-agent-ui', 'mcp-config.json'), format: 'ui' },
    { path: join(projectRoot, 'mcp-agent-ui', 'mcp-agent.config.json'), format: 'cli' },
    { path: join(projectRoot, 'mcp-config.json'), format: 'ui' },
    { path: join(projectRoot, 'mcp-agent.config.json'), format: 'cli' },
  ];

  for (const { path: configPath, format } of configLocations) {
    if (existsSync(configPath)) {
      try {
        const configContent = readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        
        if (process.env['CLI_VERBOSE'] === 'true') {
          console.log(chalk.gray(`📄 Loading config from: ${configPath}`));
        }
        
        // Check if this is the UI format (mcp-config.json)
        if (format === 'ui' && config.servers && Array.isArray(config.servers)) {
          // Convert UI format to CLI format
          const servers: MCPServerConfig[] = config.servers.map((server: any) => ({
            id: server.id,
            name: server.name,
            description: server.description || `${server.name} server`,
            connectionType: server.type, // UI uses 'type', CLI uses 'connectionType'
            command: server.command,
            args: server.args,
            url: server.url,
            enabled: server.enabled,
            priority: server.priority || 5,
            tags: server.tags || [server.type],
            timeout: server.timeout,
            retry: {
              maxAttempts: 3,
              delayMs: 1500,
              backoffMultiplier: 2
            },
            ...(server.type === 'http' && server.url && {
              preferSse: false,
              requestInit: {
                headers: {
                  "Content-Type": "application/json"
                }
              }
            })
          }));
          
          return createConfig(servers);
        }
        
        // Check if this is the CLI format (mcp-agent.config.json)
        if (format === 'cli' && config.servers && config.llm) {
          return config as MCPMultiAgentConfig;
        }
        
      } catch (error) {
        if (process.env['CLI_VERBOSE'] === 'true') {
          console.log(chalk.yellow(`⚠️  Failed to load ${configPath}: ${error instanceof Error ? error.message : String(error)}`));
        }
        continue;
      }
    }
  }

  // If no config files found or they're invalid, use default configuration
  if (process.env['CLI_VERBOSE'] === 'true') {
    console.log(chalk.gray('📄 No config files found, using defaults'));
  }
  return loadConfig();
}

/**
 * Find the project root directory by looking for package.json
 */
function findProjectRoot(): string {
  let currentDir = process.cwd();
  
  // Walk up the directory tree looking for package.json
  while (currentDir !== dirname(currentDir)) {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        // Check if this is our project by looking for the name
        if (packageJson.name === 'mcp-multi-agent' || 
            (packageJson.scripts && packageJson.scripts.dev && packageJson.scripts.dev.includes('tsx'))) {
          return currentDir;
        }
      } catch {
        // Continue searching if package.json is invalid
      }
    }
    currentDir = dirname(currentDir);
  }
  
  // If we can't find the project root, use current working directory
  return process.cwd();
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
