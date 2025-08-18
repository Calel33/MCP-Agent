/**
 * Example configurations for MCP multi-server agent
 */

import type { MCPServerConfig, MCPMultiAgentConfig } from './types.js';

/**
 * Example server configurations for common MCP servers
 */
export const EXAMPLE_SERVERS: Record<string, MCPServerConfig> = {
  // File system server
  filesystem: {
    id: 'filesystem',
    name: 'File System Server',
    description: 'Provides file system operations like reading, writing, and listing files',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', '/tmp'],
    enabled: true,
    priority: 8,
    tags: ['filesystem', 'files', 'io'],
    timeout: 30000,
    retry: {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
    },
  },

  // Web browser server
  browser: {
    id: 'browser',
    name: 'Web Browser Server',
    description: 'Provides web browsing and scraping capabilities using Puppeteer',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-puppeteer'],
    enabled: true,
    priority: 6,
    tags: ['web', 'browser', 'scraping', 'automation'],
    timeout: 45000,
    retry: {
      maxAttempts: 2,
      delayMs: 2000,
    },
  },

  // SQLite database server
  sqlite: {
    id: 'sqlite',
    name: 'SQLite Database Server',
    description: 'Provides SQLite database operations and SQL query execution',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-sqlite', './data/database.db'],
    enabled: true,
    priority: 7,
    tags: ['database', 'sqlite', 'sql', 'storage'],
    timeout: 20000,
    retry: {
      maxAttempts: 3,
      delayMs: 1000,
    },
  },

  // Git server
  git: {
    id: 'git',
    name: 'Git Server',
    description: 'Provides Git repository operations and version control',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-git', '--repository', '.'],
    enabled: false, // Disabled by default for security
    priority: 5,
    tags: ['git', 'version-control', 'repository'],
    timeout: 25000,
    retry: {
      maxAttempts: 2,
      delayMs: 1500,
    },
  },

  // Memory server
  memory: {
    id: 'memory',
    name: 'Memory Server',
    description: 'Provides persistent memory and knowledge storage',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-memory'],
    enabled: true,
    priority: 4,
    tags: ['memory', 'storage', 'knowledge'],
    timeout: 15000,
    retry: {
      maxAttempts: 3,
      delayMs: 1000,
    },
  },

  // HTTP example (custom server)
  customHttp: {
    id: 'custom-http',
    name: 'Custom HTTP Server',
    description: 'Example HTTP-based MCP server',
    connectionType: 'http',
    url: 'http://localhost:3001/mcp',
    enabled: false,
    priority: 3,
    tags: ['custom', 'http', 'api'],
    timeout: 30000,
    headers: {
      'Authorization': 'Bearer your-token-here',
      'Content-Type': 'application/json',
    },
    retry: {
      maxAttempts: 3,
      delayMs: 2000,
    },
  },

  // WebSocket example
  customWebSocket: {
    id: 'custom-ws',
    name: 'Custom WebSocket Server',
    description: 'Example WebSocket-based MCP server',
    connectionType: 'websocket',
    url: 'ws://localhost:3002/mcp',
    enabled: false,
    priority: 2,
    tags: ['custom', 'websocket', 'realtime'],
    timeout: 30000,
    retry: {
      maxAttempts: 2,
      delayMs: 3000,
    },
  },
};

/**
 * Example configuration for development
 */
export const DEVELOPMENT_CONFIG: Partial<MCPMultiAgentConfig> = {
  servers: [
    EXAMPLE_SERVERS['filesystem']!,
    EXAMPLE_SERVERS['memory']!,
    EXAMPLE_SERVERS['sqlite']!,
  ],
  agent: {
    maxSteps: 15,
    timeout: 120000, // 2 minutes for development
    autoInitialize: true,
    verbose: true,
  },
  serverManager: {
    enabled: true,
    maxConcurrentServers: 2,
    serverStartupTimeout: 45,
    healthMonitoring: true,
    healthCheckInterval: 60000, // 1 minute
    autoReconnect: true,
  },
  logging: {
    level: 'debug',
    format: 'text',
  },
};

/**
 * Example configuration for production
 */
export const PRODUCTION_CONFIG: Partial<MCPMultiAgentConfig> = {
  servers: [
    EXAMPLE_SERVERS['filesystem']!,
    EXAMPLE_SERVERS['browser']!,
    EXAMPLE_SERVERS['sqlite']!,
    EXAMPLE_SERVERS['memory']!,
  ],
  agent: {
    maxSteps: 10,
    timeout: 60000, // 1 minute
    autoInitialize: true,
    verbose: false,
  },
  serverManager: {
    enabled: true,
    maxConcurrentServers: 3,
    serverStartupTimeout: 30,
    healthMonitoring: true,
    healthCheckInterval: 30000, // 30 seconds
    autoReconnect: true,
  },
  logging: {
    level: 'info',
    format: 'json',
    file: './logs/agent.log',
  },
};

/**
 * Minimal configuration with just essential servers
 */
export const MINIMAL_CONFIG: Partial<MCPMultiAgentConfig> = {
  servers: [
    EXAMPLE_SERVERS['filesystem']!,
    EXAMPLE_SERVERS['memory']!,
  ],
  agent: {
    maxSteps: 8,
    timeout: 45000,
    autoInitialize: true,
  },
  serverManager: {
    enabled: true,
    maxConcurrentServers: 2,
    serverStartupTimeout: 20,
  },
};

/**
 * Configuration for testing with mock servers
 */
export const TEST_CONFIG: Partial<MCPMultiAgentConfig> = {
  servers: [
    {
      id: 'test-memory',
      name: 'Test Memory Server',
      description: 'Memory server for testing',
      connectionType: 'stdio',
      command: 'npx',
      args: ['@modelcontextprotocol/server-memory'],
      enabled: true,
      priority: 10,
      tags: ['test', 'memory'],
      timeout: 10000,
    },
  ],
  agent: {
    maxSteps: 5,
    timeout: 30000,
    autoInitialize: true,
    verbose: true,
  },
  serverManager: {
    enabled: false, // Disable for simpler testing
    maxConcurrentServers: 1,
    serverStartupTimeout: 15,
  },
  logging: {
    level: 'debug',
    format: 'text',
  },
};

/**
 * Helper function to create a custom configuration
 */
export function createCustomConfig(
  servers: MCPServerConfig[],
  options?: {
    environment?: 'development' | 'production' | 'test';
    enableServerManager?: boolean;
    maxSteps?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
  }
): Partial<MCPMultiAgentConfig> {
  const baseConfig = options?.environment === 'production'
    ? PRODUCTION_CONFIG
    : options?.environment === 'test'
    ? TEST_CONFIG
    : DEVELOPMENT_CONFIG;

  return {
    ...baseConfig,
    servers,
    agent: {
      ...baseConfig.agent,
      maxSteps: options?.maxSteps ?? baseConfig.agent?.maxSteps ?? 10,
    },
    serverManager: {
      ...baseConfig.serverManager,
      enabled: options?.enableServerManager ?? baseConfig.serverManager?.enabled ?? true,
    },
    logging: {
      ...baseConfig.logging,
      level: options?.logLevel ?? baseConfig.logging?.level ?? 'info',
      format: baseConfig.logging?.format ?? 'text',
    },
  };
}
