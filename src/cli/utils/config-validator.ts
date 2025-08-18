/**
 * Configuration Validator
 * 
 * Validates MCP Multi-Agent configuration files
 */

import type { MCPMultiAgentConfig } from '@/config/types.js';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fixed?: boolean;
  fixedConfig?: any;
}

export interface ValidationOptions {
  strict?: boolean;
  autoFix?: boolean;
}

/**
 * Validate configuration object
 */
export async function validateConfiguration(
  config: any,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let fixedConfig = options.autoFix ? JSON.parse(JSON.stringify(config)) : null;
  let hasFixedIssues = false;

  // Validate root structure
  if (!config || typeof config !== 'object') {
    errors.push({
      path: 'root',
      message: 'Configuration must be an object',
      severity: 'error'
    });
    return { valid: false, errors, warnings };
  }

  // Validate LLM configuration
  validateLLMConfig(config.llm, errors, warnings, fixedConfig, options);

  // Validate servers configuration
  validateServersConfig(config.servers, errors, warnings, fixedConfig, options);

  // Validate agent configuration
  validateAgentConfig(config.agent, errors, warnings, fixedConfig, options);

  // Validate server manager configuration
  validateServerManagerConfig(config.serverManager, errors, warnings, fixedConfig, options);

  // Check for unknown properties in strict mode
  if (options.strict) {
    validateUnknownProperties(config, errors, warnings);
  }

  const valid = errors.length === 0;
  const result: ValidationResult = { valid, errors, warnings };

  if (options.autoFix && fixedConfig) {
    result.fixed = hasFixedIssues;
    result.fixedConfig = fixedConfig;
  }

  return result;
}

/**
 * Validate LLM configuration
 */
function validateLLMConfig(
  llm: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  fixedConfig: any,
  options: ValidationOptions
): void {
  if (!llm) {
    errors.push({
      path: 'llm',
      message: 'LLM configuration is required',
      severity: 'error'
    });
    
    if (fixedConfig) {
      fixedConfig.llm = {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY || ''
      };
    }
    return;
  }

  // Validate provider
  if (!llm.provider) {
    errors.push({
      path: 'llm.provider',
      message: 'LLM provider is required',
      severity: 'error'
    });
  } else if (llm.provider !== 'openai') {
    warnings.push({
      path: 'llm.provider',
      message: 'Only "openai" provider is currently supported',
      severity: 'warning'
    });
  }

  // Validate model
  if (!llm.model) {
    errors.push({
      path: 'llm.model',
      message: 'LLM model is required',
      severity: 'error'
    });
  }

  // Validate API key
  if (!llm.apiKey && !process.env.OPENAI_API_KEY) {
    errors.push({
      path: 'llm.apiKey',
      message: 'OpenAI API key is required (set in config or OPENAI_API_KEY environment variable)',
      severity: 'error'
    });
  }

  // Validate optional parameters
  if (llm.temperature !== undefined) {
    if (typeof llm.temperature !== 'number' || llm.temperature < 0 || llm.temperature > 2) {
      errors.push({
        path: 'llm.temperature',
        message: 'Temperature must be a number between 0 and 2',
        severity: 'error'
      });
    }
  }

  if (llm.maxTokens !== undefined) {
    if (typeof llm.maxTokens !== 'number' || llm.maxTokens < 1) {
      errors.push({
        path: 'llm.maxTokens',
        message: 'maxTokens must be a positive number',
        severity: 'error'
      });
    }
  }
}

/**
 * Validate servers configuration
 */
function validateServersConfig(
  servers: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  fixedConfig: any,
  options: ValidationOptions
): void {
  if (!servers) {
    warnings.push({
      path: 'servers',
      message: 'No servers configured - agent will have limited capabilities',
      severity: 'warning'
    });
    
    if (fixedConfig) {
      fixedConfig.servers = [];
    }
    return;
  }

  if (!Array.isArray(servers)) {
    errors.push({
      path: 'servers',
      message: 'Servers must be an array',
      severity: 'error'
    });
    return;
  }

  // Validate each server
  servers.forEach((server: any, index: number) => {
    const serverPath = `servers[${index}]`;
    
    // Required fields
    if (!server.id) {
      errors.push({
        path: `${serverPath}.id`,
        message: 'Server ID is required',
        severity: 'error'
      });
    }

    if (!server.name) {
      errors.push({
        path: `${serverPath}.name`,
        message: 'Server name is required',
        severity: 'error'
      });
    }

    if (!server.connectionType) {
      errors.push({
        path: `${serverPath}.connectionType`,
        message: 'Connection type is required',
        severity: 'error'
      });
    } else if (!['stdio', 'http', 'websocket'].includes(server.connectionType)) {
      errors.push({
        path: `${serverPath}.connectionType`,
        message: 'Connection type must be "stdio", "http", or "websocket"',
        severity: 'error'
      });
    }

    // Validate stdio-specific fields
    if (server.connectionType === 'stdio') {
      if (!server.command) {
        errors.push({
          path: `${serverPath}.command`,
          message: 'Command is required for stdio connections',
          severity: 'error'
        });
      }

      if (server.args && !Array.isArray(server.args)) {
        errors.push({
          path: `${serverPath}.args`,
          message: 'Args must be an array',
          severity: 'error'
        });
      }
    }

    // Validate optional fields
    if (server.priority !== undefined) {
      if (typeof server.priority !== 'number' || server.priority < 0) {
        errors.push({
          path: `${serverPath}.priority`,
          message: 'Priority must be a non-negative number',
          severity: 'error'
        });
      }
    }

    if (server.enabled !== undefined && typeof server.enabled !== 'boolean') {
      errors.push({
        path: `${serverPath}.enabled`,
        message: 'Enabled must be a boolean',
        severity: 'error'
      });
    }

    // Check for duplicate IDs
    const duplicateIndex = servers.findIndex((s: any, i: number) => 
      i !== index && s.id === server.id
    );
    if (duplicateIndex !== -1) {
      errors.push({
        path: `${serverPath}.id`,
        message: `Duplicate server ID "${server.id}" (also found at servers[${duplicateIndex}])`,
        severity: 'error'
      });
    }
  });
}

/**
 * Validate agent configuration
 */
function validateAgentConfig(
  agent: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  fixedConfig: any,
  options: ValidationOptions
): void {
  if (!agent) {
    warnings.push({
      path: 'agent',
      message: 'Agent configuration missing, using defaults',
      severity: 'warning'
    });
    
    if (fixedConfig) {
      fixedConfig.agent = {
        maxSteps: 10,
        timeout: 30000
      };
    }
    return;
  }

  if (agent.maxSteps !== undefined) {
    if (typeof agent.maxSteps !== 'number' || agent.maxSteps < 1) {
      errors.push({
        path: 'agent.maxSteps',
        message: 'maxSteps must be a positive number',
        severity: 'error'
      });
    } else if (agent.maxSteps > 50) {
      warnings.push({
        path: 'agent.maxSteps',
        message: 'maxSteps > 50 may cause performance issues',
        severity: 'warning'
      });
    }
  }

  if (agent.timeout !== undefined) {
    if (typeof agent.timeout !== 'number' || agent.timeout < 1000) {
      errors.push({
        path: 'agent.timeout',
        message: 'timeout must be at least 1000ms',
        severity: 'error'
      });
    }
  }

  if (agent.enableStreaming !== undefined && typeof agent.enableStreaming !== 'boolean') {
    errors.push({
      path: 'agent.enableStreaming',
      message: 'enableStreaming must be a boolean',
      severity: 'error'
    });
  }
}

/**
 * Validate server manager configuration
 */
function validateServerManagerConfig(
  serverManager: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  fixedConfig: any,
  options: ValidationOptions
): void {
  if (!serverManager) {
    warnings.push({
      path: 'serverManager',
      message: 'Server manager configuration missing, using defaults',
      severity: 'warning'
    });
    
    if (fixedConfig) {
      fixedConfig.serverManager = {
        enabled: true,
        maxConcurrentServers: 5,
        healthCheckInterval: 30000
      };
    }
    return;
  }

  if (serverManager.enabled !== undefined && typeof serverManager.enabled !== 'boolean') {
    errors.push({
      path: 'serverManager.enabled',
      message: 'enabled must be a boolean',
      severity: 'error'
    });
  }

  if (serverManager.maxConcurrentServers !== undefined) {
    if (typeof serverManager.maxConcurrentServers !== 'number' || serverManager.maxConcurrentServers < 1) {
      errors.push({
        path: 'serverManager.maxConcurrentServers',
        message: 'maxConcurrentServers must be a positive number',
        severity: 'error'
      });
    }
  }

  if (serverManager.healthCheckInterval !== undefined) {
    if (typeof serverManager.healthCheckInterval !== 'number' || serverManager.healthCheckInterval < 1000) {
      errors.push({
        path: 'serverManager.healthCheckInterval',
        message: 'healthCheckInterval must be at least 1000ms',
        severity: 'error'
      });
    }
  }
}

/**
 * Validate for unknown properties in strict mode
 */
function validateUnknownProperties(
  config: any,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  const knownRootProperties = ['llm', 'servers', 'agent', 'serverManager'];
  
  Object.keys(config).forEach(key => {
    if (!knownRootProperties.includes(key)) {
      warnings.push({
        path: key,
        message: `Unknown property "${key}" in configuration`,
        severity: 'warning'
      });
    }
  });
}
