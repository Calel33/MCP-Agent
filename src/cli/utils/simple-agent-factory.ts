/**
 * Simple Agent Factory for CLI (without complex error handling)
 * 
 * Provides a basic MultiServerAgent instance for CLI commands
 */

import { SimpleAgent } from './simple-agent.ts';
import { OpenAIClient } from '@/llm/openai-client.ts';
import { loadConfig, createConfig } from '@/config/loader.ts';
import type { MCPMultiAgentConfig, MCPServerConfig } from '@/config/types.ts';
import chalk from 'chalk';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

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

    // Load configuration from files first, then fall back to defaults
    const config = await loadConfigFromFiles();

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
