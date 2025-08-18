/**
 * Environment configuration module for MCP multi-server agent
 * Provides centralized environment variable handling with validation and type safety
 */

import { config } from 'dotenv';
import { ENV_VARS } from './types.js';

// Load environment variables from .env file
config();

/**
 * Environment validation error with helpful context
 */
export class EnvironmentError extends Error {
  constructor(message: string, variable?: string, suggestion?: string) {
    let fullMessage = `Environment configuration error: ${message}`;
    
    if (variable) {
      fullMessage += `\n  Variable: ${variable}`;
    }
    
    if (suggestion) {
      fullMessage += `\n  Suggestion: ${suggestion}`;
    }
    
    super(fullMessage);
    this.name = 'EnvironmentError';
  }
}

/**
 * Environment variable configuration with validation
 */
export interface EnvironmentConfig {
  // OpenAI Configuration
  openai: {
    apiKey: string;
    baseURL?: string | undefined;
    organization?: string | undefined;
    model?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    maxRetries?: number | undefined;
    retryDelay?: number | undefined;
  };
  
  // Agent Configuration
  agent: {
    maxSteps: number;
    timeout: number;
  };
  
  // Server Manager Configuration
  serverManager: {
    maxConcurrentServers: number;
    startupTimeout: number;
  };
  
  // Logging Configuration
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'text' | 'json';
    file?: string | undefined;
  };
  
  // Environment Detection
  environment: {
    nodeEnv: 'development' | 'production' | 'test';
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
  };
}

/**
 * Default environment values
 */
const DEFAULT_ENV_VALUES = {
  openai: {
    model: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 4096,
    maxRetries: 3,
    retryDelay: 2000,
  },
  agent: {
    maxSteps: 10,
    timeout: 60000,
  },
  serverManager: {
    maxConcurrentServers: 3,
    startupTimeout: 30,
  },
  logging: {
    level: 'info' as const,
    format: 'text' as const,
  },
} as const;

/**
 * Validate required environment variables
 */
function validateRequiredVariables(): void {
  const required = [
    {
      key: ENV_VARS.OPENAI_API_KEY,
      name: 'OpenAI API Key',
      suggestion: 'Get your API key from https://platform.openai.com/api-keys'
    }
  ];

  for (const { key, name, suggestion } of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      throw new EnvironmentError(
        `${name} is required but not provided`,
        key,
        suggestion
      );
    }
  }
}

/**
 * Validate and parse numeric environment variable
 */
function parseNumber(
  value: string | undefined,
  defaultValue: number,
  variableName: string,
  min?: number,
  max?: number
): number {
  if (!value) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new EnvironmentError(
      `Invalid numeric value: "${value}"`,
      variableName,
      `Provide a valid integer (default: ${defaultValue})`
    );
  }

  if (min !== undefined && parsed < min) {
    throw new EnvironmentError(
      `Value ${parsed} is below minimum ${min}`,
      variableName,
      `Use a value >= ${min}`
    );
  }

  if (max !== undefined && parsed > max) {
    throw new EnvironmentError(
      `Value ${parsed} is above maximum ${max}`,
      variableName,
      `Use a value <= ${max}`
    );
  }

  return parsed;
}

/**
 * Validate and parse float environment variable
 */
function parseFloat(
  value: string | undefined,
  defaultValue: number,
  variableName: string,
  min?: number,
  max?: number
): number {
  if (!value) {
    return defaultValue;
  }

  const parsed = Number.parseFloat(value);
  if (isNaN(parsed)) {
    throw new EnvironmentError(
      `Invalid float value: "${value}"`,
      variableName,
      `Provide a valid number (default: ${defaultValue})`
    );
  }

  if (min !== undefined && parsed < min) {
    throw new EnvironmentError(
      `Value ${parsed} is below minimum ${min}`,
      variableName,
      `Use a value >= ${min}`
    );
  }

  if (max !== undefined && parsed > max) {
    throw new EnvironmentError(
      `Value ${parsed} is above maximum ${max}`,
      variableName,
      `Use a value <= ${max}`
    );
  }

  return parsed;
}

/**
 * Validate enum environment variable
 */
function parseEnum<T extends string>(
  value: string | undefined,
  defaultValue: T,
  validValues: readonly T[],
  variableName: string
): T {
  if (!value) {
    return defaultValue;
  }

  if (!validValues.includes(value as T)) {
    throw new EnvironmentError(
      `Invalid value: "${value}"`,
      variableName,
      `Valid values: ${validValues.join(', ')} (default: ${defaultValue})`
    );
  }

  return value as T;
}

/**
 * Detect and validate environment type
 */
function detectEnvironment(): EnvironmentConfig['environment'] {
  const nodeEnv = parseEnum(
    process.env['NODE_ENV'],
    'development',
    ['development', 'production', 'test'] as const,
    'NODE_ENV'
  );

  return {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
  };
}

/**
 * Load and validate environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  try {
    // Validate required variables first
    validateRequiredVariables();

    // Detect environment
    const environment = detectEnvironment();

    // Parse OpenAI configuration
    const openaiConfig = {
      apiKey: process.env[ENV_VARS.OPENAI_API_KEY]!,
      model: process.env['OPENAI_MODEL'] || DEFAULT_ENV_VALUES.openai.model,
      temperature: parseFloat(
        process.env['OPENAI_TEMPERATURE'],
        DEFAULT_ENV_VALUES.openai.temperature,
        'OPENAI_TEMPERATURE',
        0,
        2
      ),
      maxTokens: parseNumber(
        process.env['OPENAI_MAX_TOKENS'],
        DEFAULT_ENV_VALUES.openai.maxTokens,
        'OPENAI_MAX_TOKENS',
        1,
        32000
      ),
      maxRetries: parseNumber(
        process.env['OPENAI_MAX_RETRIES'],
        DEFAULT_ENV_VALUES.openai.maxRetries,
        'OPENAI_MAX_RETRIES',
        0,
        10
      ),
      retryDelay: parseNumber(
        process.env['OPENAI_RETRY_DELAY'],
        DEFAULT_ENV_VALUES.openai.retryDelay,
        'OPENAI_RETRY_DELAY',
        100,
        30000
      ),
    };

    // Add optional properties only if they exist
    const openai: EnvironmentConfig['openai'] = {
      ...openaiConfig,
      ...(process.env[ENV_VARS.OPENAI_BASE_URL] && { baseURL: process.env[ENV_VARS.OPENAI_BASE_URL] }),
      ...(process.env[ENV_VARS.OPENAI_ORGANIZATION] && { organization: process.env[ENV_VARS.OPENAI_ORGANIZATION] }),
    };

    // Parse agent configuration
    const agent = {
      maxSteps: parseNumber(
        process.env[ENV_VARS.AGENT_MAX_STEPS],
        DEFAULT_ENV_VALUES.agent.maxSteps,
        ENV_VARS.AGENT_MAX_STEPS,
        1,
        100
      ),
      timeout: parseNumber(
        process.env[ENV_VARS.AGENT_TIMEOUT],
        DEFAULT_ENV_VALUES.agent.timeout,
        ENV_VARS.AGENT_TIMEOUT,
        1000,
        300000
      ),
    };

    // Parse server manager configuration
    const serverManager = {
      maxConcurrentServers: parseNumber(
        process.env[ENV_VARS.MAX_CONCURRENT_SERVERS],
        DEFAULT_ENV_VALUES.serverManager.maxConcurrentServers,
        ENV_VARS.MAX_CONCURRENT_SERVERS,
        1,
        20
      ),
      startupTimeout: parseNumber(
        process.env[ENV_VARS.SERVER_STARTUP_TIMEOUT],
        DEFAULT_ENV_VALUES.serverManager.startupTimeout,
        ENV_VARS.SERVER_STARTUP_TIMEOUT,
        5,
        300
      ),
    };

    // Parse logging configuration
    const loggingConfig = {
      level: parseEnum(
        process.env[ENV_VARS.LOG_LEVEL],
        DEFAULT_ENV_VALUES.logging.level,
        ['debug', 'info', 'warn', 'error'] as const,
        ENV_VARS.LOG_LEVEL
      ),
      format: parseEnum(
        process.env[ENV_VARS.LOG_FORMAT],
        DEFAULT_ENV_VALUES.logging.format,
        ['text', 'json'] as const,
        ENV_VARS.LOG_FORMAT
      ),
    };

    // Add optional file property only if it exists
    const logging: EnvironmentConfig['logging'] = {
      ...loggingConfig,
      ...(process.env[ENV_VARS.LOG_FILE] && { file: process.env[ENV_VARS.LOG_FILE] }),
    };

    return {
      openai,
      agent,
      serverManager,
      logging,
      environment,
    };

  } catch (error) {
    if (error instanceof EnvironmentError) {
      throw error;
    }
    
    throw new EnvironmentError(
      `Failed to load environment configuration: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get environment configuration with caching
 */
let cachedConfig: EnvironmentConfig | null = null;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = loadEnvironmentConfig();
  }
  return cachedConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetEnvironmentConfig(): void {
  cachedConfig = null;
}

/**
 * Validate environment configuration without throwing
 */
export function validateEnvironmentConfig(): { valid: boolean; errors: string[] } {
  try {
    loadEnvironmentConfig();
    return { valid: true, errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, errors: [message] };
  }
}
