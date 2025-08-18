/**
 * Configuration types for MCP multi-server agent
 */

/**
 * Supported MCP server connection types
 */
export type MCPConnectionType = 'http' | 'websocket' | 'stdio' | 'sse';

/**
 * Configuration for a single MCP server
 */
export interface MCPServerConfig {
  /** Unique identifier for the server */
  id: string;
  
  /** Human-readable name for the server */
  name: string;
  
  /** Description of the server's capabilities */
  description?: string;
  
  /** Connection type for this server */
  connectionType: MCPConnectionType;
  
  /** Server endpoint URL (for HTTP/WebSocket/SSE) */
  url?: string;
  
  /** Command to start the server (for stdio) */
  command?: string;
  
  /** Arguments for the command (for stdio) */
  args?: string[];
  
  /** Environment variables for the server */
  env?: Record<string, string>;
  
  /** Connection timeout in milliseconds */
  timeout?: number;
  
  /** Whether this server is enabled */
  enabled: boolean;
  
  /** Priority for server selection (higher = more preferred) */
  priority?: number;
  
  /** Tags for categorizing server capabilities */
  tags?: string[];
  
  /** Custom headers for HTTP/WebSocket connections */
  headers?: Record<string, string>;
  
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier?: number;
  };
}

/**
 * Agent configuration options
 */
export interface AgentConfig {
  /** Maximum number of steps the agent can take */
  maxSteps?: number;
  
  /** Timeout for agent operations in milliseconds */
  timeout?: number;
  
  /** Whether to auto-initialize the agent */
  autoInitialize?: boolean;
  
  /** Tools that are not allowed to be used */
  disallowedTools?: string[];
  
  /** Whether to enable verbose logging */
  verbose?: boolean;
  
  /** Custom system prompt for the agent */
  systemPrompt?: string;
}

/**
 * Server manager configuration
 */
export interface ServerManagerConfig {
  /** Whether to use the server manager */
  enabled: boolean;
  
  /** Maximum number of concurrent active servers */
  maxConcurrentServers?: number;
  
  /** Timeout for server startup in seconds */
  serverStartupTimeout?: number;
  
  /** Whether to enable server health monitoring */
  healthMonitoring?: boolean;
  
  /** Interval for health checks in milliseconds */
  healthCheckInterval?: number;
  
  /** Whether to automatically reconnect failed servers */
  autoReconnect?: boolean;
}

/**
 * OpenAI LLM configuration
 */
export interface LLMConfig {
  /** OpenAI API key */
  apiKey: string;
  
  /** Model to use */
  model?: string;
  
  /** Temperature for response generation */
  temperature?: number;
  
  /** Maximum tokens for responses */
  maxTokens?: number;
  
  /** Maximum number of retries */
  maxRetries?: number;
  
  /** Retry delay in milliseconds */
  retryDelay?: number;
  
  /** Base URL for OpenAI API (for custom endpoints) */
  baseURL?: string;
  
  /** Organization ID */
  organization?: string;
}

/**
 * Complete configuration for the MCP multi-server agent
 */
export interface MCPMultiAgentConfig {
  /** List of MCP servers to connect to */
  servers: MCPServerConfig[];
  
  /** Agent configuration */
  agent: AgentConfig;
  
  /** Server manager configuration */
  serverManager: ServerManagerConfig;
  
  /** LLM configuration */
  llm: LLMConfig;
  
  /** Global environment variables */
  env?: Record<string, string>;
  
  /** Logging configuration */
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    file?: string;
  };
}

/**
 * Environment variable names used by the application
 */
export const ENV_VARS = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENAI_BASE_URL: 'OPENAI_BASE_URL',
  OPENAI_ORGANIZATION: 'OPENAI_ORGANIZATION',
  LOG_LEVEL: 'LOG_LEVEL',
  LOG_FORMAT: 'LOG_FORMAT',
  LOG_FILE: 'LOG_FILE',
  MAX_CONCURRENT_SERVERS: 'MAX_CONCURRENT_SERVERS',
  SERVER_STARTUP_TIMEOUT: 'SERVER_STARTUP_TIMEOUT',
  AGENT_TIMEOUT: 'AGENT_TIMEOUT',
  AGENT_MAX_STEPS: 'AGENT_MAX_STEPS',
  // Server Manager Advanced Settings
  SERVER_HEALTH_CHECK_INTERVAL: 'SERVER_HEALTH_CHECK_INTERVAL',
  SERVER_CONNECTION_POOL_SIZE: 'SERVER_CONNECTION_POOL_SIZE',
  SERVER_CIRCUIT_BREAKER_THRESHOLD: 'SERVER_CIRCUIT_BREAKER_THRESHOLD',
  SERVER_LOAD_BALANCING_STRATEGY: 'SERVER_LOAD_BALANCING_STRATEGY',
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  agent: {
    maxSteps: 10,
    timeout: 60000, // 60 seconds
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
  llm: {
    model: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 4096,
    maxRetries: 3,
    retryDelay: 2000,
  },
  logging: {
    level: 'info' as const,
    format: 'text' as const,
  },
} as const;
