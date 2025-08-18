/**
 * Configuration module exports
 */

// Types and interfaces
export * from './types.js';

// Configuration loader
export * from './loader.js';

// Environment configuration
export * from './env.js';

// Client factory
export * from './client-factory.js';

// Re-export commonly used items for convenience
export {
  loadConfig,
  createConfig,
  ConfigValidationError
} from './loader.js';

export {
  loadEnvironmentConfig,
  getEnvironmentConfig,
  resetEnvironmentConfig,
  validateEnvironmentConfig,
  EnvironmentError
} from './env.js';

export {
  MCPClientFactory
} from './client-factory.js';

export type {
  MCPMultiAgentConfig,
  MCPServerConfig,
  AgentConfig,
  ServerManagerConfig,
  LLMConfig
} from './types.js';

export type {
  EnvironmentConfig
} from './env.js';

export {
  DEFAULT_CONFIG,
  ENV_VARS
} from './types.js';
