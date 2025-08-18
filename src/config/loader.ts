/**
 * Configuration loader for MCP multi-server agent
 */

import { config } from 'dotenv';
import type {
  MCPMultiAgentConfig,
  MCPServerConfig,
  LLMConfig,
  AgentConfig,
  ServerManagerConfig
} from './types.js';
import {
  DEFAULT_CONFIG
} from './types.js';
import { getEnvironmentConfig, EnvironmentError } from './env.js';

// Load environment variables
config();

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(`Configuration validation error: ${message}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Load configuration from environment variables and defaults
 */
export function loadConfig(customConfig?: Partial<MCPMultiAgentConfig>): MCPMultiAgentConfig {
  try {
    // Load validated environment configuration
    const envConfig = getEnvironmentConfig();

    // Build LLM configuration from environment
    const llmConfig = {
      ...DEFAULT_CONFIG.llm,
      apiKey: envConfig.openai.apiKey,
      model: envConfig.openai.model,
      temperature: envConfig.openai.temperature,
      maxTokens: envConfig.openai.maxTokens,
      maxRetries: envConfig.openai.maxRetries,
      retryDelay: envConfig.openai.retryDelay,
      ...(envConfig.openai.baseURL && { baseURL: envConfig.openai.baseURL }),
      ...(envConfig.openai.organization && { organization: envConfig.openai.organization }),
      ...customConfig?.llm,
    } as LLMConfig;

    // Build agent configuration from environment
    const agentConfig = {
      ...DEFAULT_CONFIG.agent,
      timeout: envConfig.agent.timeout,
      maxSteps: envConfig.agent.maxSteps,
      ...customConfig?.agent,
    } as AgentConfig;

    // Build server manager configuration from environment
    const serverManagerConfig = {
      ...DEFAULT_CONFIG.serverManager,
      maxConcurrentServers: envConfig.serverManager.maxConcurrentServers,
      serverStartupTimeout: envConfig.serverManager.startupTimeout,
      ...customConfig?.serverManager,
    } as ServerManagerConfig;

    // Build logging configuration from environment
    const loggingConfig: { level: 'debug' | 'info' | 'warn' | 'error'; format: 'json' | 'text'; file?: string } = {
      level: envConfig.logging.level,
      format: envConfig.logging.format,
      ...customConfig?.logging,
    };

    if (envConfig.logging.file) {
      loggingConfig.file = envConfig.logging.file;
    }

    // Build complete configuration
    const config: MCPMultiAgentConfig = {
      servers: customConfig?.servers || getDefaultServers(),
      agent: agentConfig,
      serverManager: serverManagerConfig,
      llm: llmConfig,
      logging: loggingConfig,
      ...(customConfig?.env && { env: customConfig.env }),
    };

    // Validate configuration
    validateConfig(config);

    return config;

  } catch (error) {
    if (error instanceof EnvironmentError) {
      throw new ConfigValidationError(error.message);
    }
    throw error;
  }
}

/**
 * Get default server configurations
 * These are example servers - users should customize based on their needs
 */
function getDefaultServers(): MCPServerConfig[] {
  return [
    {
      id: 'filesystem',
      name: 'File System Server',
      description: 'Provides file system operations',
      connectionType: 'stdio',
      command: 'npx',
      args: ['@modelcontextprotocol/server-filesystem', '/tmp'],
      enabled: false, // Disabled by default - user should enable and configure
      priority: 5,
      tags: ['filesystem', 'files'],
      timeout: 30000,
      retry: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffMultiplier: 2,
      },
    },
    {
      id: 'web-browser',
      name: 'Web Browser Server',
      description: 'Provides web browsing capabilities',
      connectionType: 'stdio',
      command: 'npx',
      args: ['@modelcontextprotocol/server-puppeteer'],
      enabled: false, // Disabled by default
      priority: 3,
      tags: ['web', 'browser', 'scraping'],
      timeout: 45000,
      retry: {
        maxAttempts: 2,
        delayMs: 2000,
      },
    },
    {
      id: 'sqlite',
      name: 'SQLite Database Server',
      description: 'Provides SQLite database operations',
      connectionType: 'stdio',
      command: 'npx',
      args: ['@modelcontextprotocol/server-sqlite', 'database.db'],
      enabled: false, // Disabled by default
      priority: 4,
      tags: ['database', 'sqlite', 'sql'],
      timeout: 20000,
      retry: {
        maxAttempts: 3,
        delayMs: 1000,
      },
    },
  ];
}

/**
 * Validate the complete configuration
 */
function validateConfig(config: MCPMultiAgentConfig): void {
  // Validate LLM configuration
  if (!config.llm.apiKey) {
    throw new ConfigValidationError('LLM API key is required');
  }

  // Validate servers
  if (!Array.isArray(config.servers)) {
    throw new ConfigValidationError('Servers must be an array');
  }

  const enabledServers = config.servers.filter(server => server.enabled);
  if (enabledServers.length === 0) {
    console.warn('Warning: No servers are enabled. The agent will have limited capabilities.');
  }

  // Validate each server configuration
  config.servers.forEach((server, index) => {
    validateServerConfig(server, index);
  });

  // Validate server manager configuration
  if (config.serverManager.enabled && config.serverManager.maxConcurrentServers! <= 0) {
    throw new ConfigValidationError('maxConcurrentServers must be greater than 0');
  }

  // Validate agent configuration
  if (config.agent.maxSteps! <= 0) {
    throw new ConfigValidationError('Agent maxSteps must be greater than 0');
  }

  if (config.agent.timeout! <= 0) {
    throw new ConfigValidationError('Agent timeout must be greater than 0');
  }
}

/**
 * Validate a single server configuration
 */
function validateServerConfig(server: MCPServerConfig, index: number): void {
  const prefix = `Server ${index} (${server.id || 'unnamed'})`;

  if (!server.id) {
    throw new ConfigValidationError(`${prefix}: id is required`);
  }

  if (!server.name) {
    throw new ConfigValidationError(`${prefix}: name is required`);
  }

  if (!server.connectionType) {
    throw new ConfigValidationError(`${prefix}: connectionType is required`);
  }

  // Validate connection-specific requirements
  switch (server.connectionType) {
    case 'http':
    case 'websocket':
    case 'sse':
      if (!server.url) {
        throw new ConfigValidationError(
          `${prefix}: url is required for ${server.connectionType} connections`
        );
      }
      break;
    
    case 'stdio':
      if (!server.command) {
        throw new ConfigValidationError(
          `${prefix}: command is required for stdio connections`
        );
      }
      break;
    
    default:
      throw new ConfigValidationError(
        `${prefix}: unsupported connectionType: ${server.connectionType}`
      );
  }

  // Validate timeout
  if (server.timeout !== undefined && server.timeout <= 0) {
    throw new ConfigValidationError(`${prefix}: timeout must be greater than 0`);
  }

  // Validate retry configuration
  if (server.retry) {
    if (server.retry.maxAttempts <= 0) {
      throw new ConfigValidationError(`${prefix}: retry.maxAttempts must be greater than 0`);
    }
    if (server.retry.delayMs < 0) {
      throw new ConfigValidationError(`${prefix}: retry.delayMs must be non-negative`);
    }
  }
}

/**
 * Create a configuration with custom servers
 */
export function createConfig(servers: MCPServerConfig[], options?: {
  llm?: Partial<LLMConfig>;
  agent?: Partial<AgentConfig>;
  serverManager?: Partial<ServerManagerConfig>;
}): MCPMultiAgentConfig {
  const customConfig: any = { servers };

  if (options?.llm) {
    customConfig.llm = options.llm;
  }
  if (options?.agent) {
    customConfig.agent = options.agent;
  }
  if (options?.serverManager) {
    customConfig.serverManager = options.serverManager;
  }

  return loadConfig(customConfig);
}
