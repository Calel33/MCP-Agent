/**
 * Configuration Templates
 * 
 * Provides default configuration templates for different use cases
 */

import type { MCPMultiAgentConfig } from '@/config/types.js';

/**
 * Get default configuration template
 */
export function getDefaultConfig(templateName: string = 'default'): MCPMultiAgentConfig {
  switch (templateName.toLowerCase()) {
    case 'minimal':
      return getMinimalConfig();
    case 'development':
      return getDevelopmentConfig();
    case 'production':
      return getProductionConfig();
    case 'default':
    default:
      return getStandardConfig();
  }
}

/**
 * Standard configuration with common MCP servers
 */
function getStandardConfig(): MCPMultiAgentConfig {
  return {
    llm: {
      model: 'gpt-4',
      apiKey: process.env['OPENAI_API_KEY'] || '',
      temperature: 0.7,
      maxTokens: 4000
    },
    servers: [
      {
        id: 'filesystem',
        name: 'File System',
        description: 'Access and manipulate files and directories',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem', '/tmp'],
        enabled: true,
        priority: 1,
        tags: ['files', 'filesystem'],
        retry: {
          maxAttempts: 3,
          delayMs: 1000
        }
      },
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the web for information',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-brave-search'],
        enabled: false,
        priority: 2,
        tags: ['web', 'search'],
        retry: {
          maxAttempts: 3,
          delayMs: 1000
        }
      },
      {
        id: 'git',
        name: 'Git Operations',
        description: 'Git repository operations and version control',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-git'],
        enabled: false,
        priority: 3,
        tags: ['git', 'version-control'],
        retry: {
          maxAttempts: 3,
          delayMs: 1000
        }
      }
    ],
    agent: {
      maxSteps: 10,
      timeout: 30000
    },
    serverManager: {
      enabled: true,
      maxConcurrentServers: 5,
      healthCheckInterval: 30000,
      retryDelay: 2000
    }
  };
}

/**
 * Minimal configuration with no MCP servers
 */
function getMinimalConfig(): MCPMultiAgentConfig {
  return {
    llm: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || '',
      temperature: 0.7
    },
    servers: [],
    agent: {
      maxSteps: 5,
      timeout: 15000,
      enableStreaming: false
    },
    serverManager: {
      enabled: false,
      maxConcurrentServers: 1,
      healthCheckInterval: 60000
    }
  };
}

/**
 * Development configuration with debugging features
 */
function getDevelopmentConfig(): MCPMultiAgentConfig {
  return {
    llm: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || '',
      temperature: 0.3,
      maxTokens: 2000
    },
    servers: [
      {
        id: 'filesystem',
        name: 'File System (Dev)',
        description: 'Development file system access',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem', './'],
        enabled: true,
        priority: 1,
        tags: ['files', 'development'],
        retry: {
          maxAttempts: 1,
          delayMs: 500
        }
      },
      {
        id: 'git',
        name: 'Git (Dev)',
        description: 'Git operations for development',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-git'],
        enabled: true,
        priority: 2,
        tags: ['git', 'development'],
        retry: {
          maxAttempts: 1,
          delayMs: 500
        }
      }
    ],
    agent: {
      maxSteps: 15,
      timeout: 60000,
      enableStreaming: true,
      debug: true
    },
    serverManager: {
      enabled: true,
      maxConcurrentServers: 3,
      healthCheckInterval: 15000,
      connectionTimeout: 5000,
      retryDelay: 1000,
      debug: true
    }
  };
}

/**
 * Production configuration optimized for performance and reliability
 */
function getProductionConfig(): MCPMultiAgentConfig {
  return {
    llm: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || '',
      temperature: 0.5,
      maxTokens: 3000
    },
    servers: [
      {
        id: 'filesystem',
        name: 'File System',
        description: 'Production file system access',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem', '/app/data'],
        enabled: true,
        priority: 1,
        tags: ['files', 'production'],
        retry: {
          maxAttempts: 5,
          delayMs: 2000
        }
      },
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Production web search capabilities',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-brave-search'],
        enabled: true,
        priority: 2,
        tags: ['web', 'search', 'production'],
        retry: {
          maxAttempts: 5,
          delayMs: 2000
        }
      },
      {
        id: 'database',
        name: 'Database',
        description: 'Database operations',
        connectionType: 'stdio',
        command: 'npx',
        args: ['@modelcontextprotocol/server-postgres'],
        enabled: false,
        priority: 3,
        tags: ['database', 'production'],
        retry: {
          maxAttempts: 5,
          delayMs: 3000
        }
      }
    ],
    agent: {
      maxSteps: 8,
      timeout: 45000,
      enableStreaming: true
    },
    serverManager: {
      enabled: true,
      maxConcurrentServers: 10,
      healthCheckInterval: 60000,
      connectionTimeout: 15000,
      retryDelay: 5000
    }
  };
}

/**
 * Get available template names
 */
export function getAvailableTemplates(): string[] {
  return ['default', 'minimal', 'development', 'production'];
}

/**
 * Get template description
 */
export function getTemplateDescription(templateName: string): string {
  switch (templateName.toLowerCase()) {
    case 'default':
      return 'Standard configuration with common MCP servers';
    case 'minimal':
      return 'Minimal configuration with no MCP servers';
    case 'development':
      return 'Development configuration with debugging features';
    case 'production':
      return 'Production configuration optimized for performance';
    default:
      return 'Unknown template';
  }
}

/**
 * Validate configuration template
 */
export function validateTemplate(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!config.llm) {
    errors.push('Missing "llm" configuration');
  } else {
    if (!config.llm.provider) {
      errors.push('Missing "llm.provider"');
    }
    if (!config.llm.model) {
      errors.push('Missing "llm.model"');
    }
  }

  if (!config.servers) {
    errors.push('Missing "servers" array');
  } else if (!Array.isArray(config.servers)) {
    errors.push('"servers" must be an array');
  }

  if (!config.agent) {
    errors.push('Missing "agent" configuration');
  }

  if (!config.serverManager) {
    errors.push('Missing "serverManager" configuration');
  }

  // Validate server configurations
  if (Array.isArray(config.servers)) {
    config.servers.forEach((server: any, index: number) => {
      if (!server.id) {
        errors.push(`Server ${index}: missing "id"`);
      }
      if (!server.name) {
        errors.push(`Server ${index}: missing "name"`);
      }
      if (!server.connectionType) {
        errors.push(`Server ${index}: missing "connectionType"`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
