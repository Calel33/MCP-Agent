# 📚 API Reference - MCP Multi-Agent

## Overview

This document provides comprehensive API documentation for the Multiple MCP Servers General Purpose Agent. The API is organized into modules for configuration, LLM integration, and agent orchestration.

## 🏗️ Core Modules

### `@/config` - Configuration Management

#### `loadConfig(customConfig?: Partial<MCPMultiAgentConfig>): MCPMultiAgentConfig`

Loads configuration from environment variables and defaults.

**Parameters:**
- `customConfig` (optional): Partial configuration to override defaults

**Returns:** Complete configuration object

**Example:**
```typescript
import { loadConfig } from '@/config';

const config = loadConfig({
  agent: { maxSteps: 20 },
  llm: { temperature: 0.2 }
});
```

#### `createConfig(servers: MCPServerConfig[], options?): MCPMultiAgentConfig`

Creates configuration with custom servers.

**Parameters:**
- `servers`: Array of MCP server configurations
- `options` (optional): LLM, agent, and server manager options

**Example:**
```typescript
import { createConfig } from '@/config';

const config = createConfig([
  {
    id: 'filesystem',
    name: 'File System',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', '/path/to/directory'],
    enabled: true
  }
]);
```

#### `MCPClientFactory`

Factory for creating and managing MCP client connections.

**Constructor:**
```typescript
new MCPClientFactory(config: MCPMultiAgentConfig)
```

**Methods:**

##### `createClient(): MCPClient`
Creates a single MCP client configured with all enabled servers.

##### `createSession(serverId: string, autoInitialize?: boolean): Promise<any>`
Creates a session for a specific server.

##### `getEnabledServers(): MCPServerConfig[]`
Returns all enabled server configurations.

##### `closeAll(): Promise<void>`
Closes all server sessions.

### `@/llm` - LLM Integration

#### `getOpenAIClient(config?: Partial<LLMConfig>): Promise<OpenAIClient>`

Convenience function to get a ready-to-use OpenAI client.

**Parameters:**
- `config` (optional): Partial LLM configuration

**Returns:** Promise resolving to OpenAIClient instance

#### `OpenAIClient`

OpenAI client wrapper with AI SDK integration.

**Methods:**

##### `generateResponse(messages: CoreMessage[], options?): Promise<string>`
Generates a single response using OpenAI.

**Parameters:**
- `messages`: Array of conversation messages
- `options`: Generation options (temperature, maxTokens, systemPrompt)

##### `streamResponse(messages: CoreMessage[], options?): AsyncGenerator<string>`
Streams response chunks from OpenAI.

**Parameters:**
- `messages`: Array of conversation messages  
- `options`: Streaming options (temperature, maxTokens, systemPrompt)

**Example:**
```typescript
import { getOpenAIClient, createMessage } from '@/llm';

const client = await getOpenAIClient();
const messages = [createMessage('user', 'Hello!')];

// Standard response
const response = await client.generateResponse(messages);

// Streaming response
for await (const chunk of client.streamResponse(messages)) {
  process.stdout.write(chunk);
}
```

### `@/agent` - Agent Implementation

#### `createMultiServerAgent(config: MCPMultiAgentConfig, openaiClient: OpenAIClient): Promise<MultiServerAgent>`

Factory function to create a MultiServerAgent with proper configuration.

**Parameters:**
- `config`: Complete agent configuration
- `openaiClient`: Initialized OpenAI client

**Returns:** Promise resolving to MultiServerAgent instance

#### `MultiServerAgent`

Main agent class that integrates MCPAgent with OpenAI client.

**Constructor:**
```typescript
new MultiServerAgent(config: MCPMultiAgentConfig, openaiClient: OpenAIClient)
```

**Methods:**

##### `initialize(): Promise<void>`
Initializes the agent with MCP servers and LLM.

##### `run(query: string, options?: AgentRunOptions): Promise<AgentResult>`
Runs a query using the multi-server agent.

**Parameters:**
- `query`: The query string to execute
- `options`: Execution options

**Options:**
```typescript
interface AgentRunOptions {
  maxSteps?: number;      // Maximum steps (default: config.agent.maxSteps)
  timeout?: number;       // Timeout in milliseconds
  stream?: boolean;       // Whether to stream response
  context?: string;       // Additional context
  servers?: string[];     // Specific servers to use
}
```

**Returns:**
```typescript
interface AgentResult {
  response: string;       // Final response
  steps: number;          // Steps taken
  executionTime: number;  // Execution time in ms
  toolsUsed: string[];    // Tools used during execution
  warnings?: string[];    // Non-fatal warnings
}
```

##### `runStream(query: string, options?: AgentRunOptions, onChunk?: (chunk: string) => void): Promise<AgentResult>`
Runs a streaming query with real-time chunk callbacks.

**Parameters:**
- `query`: The query string to execute
- `options`: Execution options
- `onChunk`: Callback for each response chunk

##### `getServerInfo(): Promise<ServerInfo>`
Gets information about available servers and tools.

**Returns:**
```typescript
interface ServerInfo {
  servers: Array<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    connectionType: string;
  }>;
  totalServers: number;
  enabledServers: number;
}
```

##### `testConnections(): Promise<ConnectionTestResult>`
Tests connection to all enabled servers.

**Returns:**
```typescript
interface ConnectionTestResult {
  successful: string[];
  failed: Array<{ serverId: string; error: string }>;
}
```

##### `shutdown(): Promise<void>`
Gracefully shuts down the agent and closes all connections.

##### `isReady(): boolean`
Checks if the agent is initialized and ready.

##### `getConfig(): MCPMultiAgentConfig`
Gets the current configuration (returns a copy).

##### `getServerMetrics(): ServerMetrics[]`
Gets real-time server performance metrics.

**Returns:**
```typescript
interface ServerMetrics {
  serverId: string;
  connectionCount: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  lastHealthCheck: Date;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disconnected';
}
```

##### `getServerManagerConfig(): AdvancedServerManagerConfig`
Gets the current server manager configuration.

**Returns:** Complete server manager configuration including connection pooling, load balancing, and circuit breaker settings.

### `@/config/server-manager` - Server Manager

#### `createServerManager(config?: Partial<AdvancedServerManagerConfig>): ServerManager`

Creates a server manager instance with optimized configuration.

**Parameters:**
- `config` (optional): Partial server manager configuration

**Returns:** ServerManager instance

**Example:**
```typescript
import { createServerManager } from '@/config/server-manager';

const serverManager = createServerManager({
  maxConcurrentServers: 5,
  healthMonitoring: true,
  loadBalancing: { strategy: 'least-connections' }
});
```

#### `createServerManagerConfig(overrides?: Partial<AdvancedServerManagerConfig>): AdvancedServerManagerConfig`

Creates optimized server manager configuration.

**Parameters:**
- `overrides` (optional): Configuration overrides

**Returns:** Complete server manager configuration

**Example:**
```typescript
import { createServerManagerConfig } from '@/config/server-manager';

const config = createServerManagerConfig({
  maxConcurrentServers: 10,
  connectionPool: {
    maxConnectionsPerServer: 20,
    idleTimeout: 600000
  },
  circuitBreaker: {
    failureThreshold: 3,
    recoveryTimeout: 20000
  }
});
```

#### `ServerManager`

Advanced server manager class for optimized multi-server operations.

**Methods:**

##### `initialize(servers: MCPServerConfig[]): Promise<void>`
Initializes server manager with health monitoring.

##### `getMCPAgentConfig(): object`
Gets optimized MCPAgent configuration.

##### `selectOptimalServer(availableServers: MCPServerConfig[]): MCPServerConfig | null`
Selects optimal server based on load balancing strategy.

##### `getServerMetrics(): ServerMetrics[]`
Gets current server performance metrics.

##### `shutdown(): Promise<void>`
Gracefully shuts down server manager and cleanup resources.

## 🔧 Configuration Types

### `MCPMultiAgentConfig`

Complete configuration interface:

```typescript
interface MCPMultiAgentConfig {
  servers: MCPServerConfig[];
  agent: AgentConfig;
  serverManager: ServerManagerConfig;
  llm: LLMConfig;
  env?: Record<string, string>;
  logging?: LoggingConfig;
}
```

### `MCPServerConfig`

Server configuration interface:

```typescript
interface MCPServerConfig {
  id: string;
  name: string;
  description?: string;
  connectionType: 'http' | 'websocket' | 'stdio' | 'sse';
  enabled: boolean;
  priority: number;
  tags: string[];
  
  // Connection-specific properties
  command?: string;        // For stdio
  args?: string[];         // For stdio
  env?: Record<string, string>; // For stdio
  url?: string;           // For http/websocket/sse
  headers?: Record<string, string>; // For http/websocket/sse
  
  // Retry configuration
  retry: RetryConfig;
}
```

### `AgentConfig`

Agent behavior configuration:

```typescript
interface AgentConfig {
  maxSteps: number;        // Maximum execution steps
  timeout: number;         // Timeout in milliseconds
  autoInitialize: boolean; // Auto-initialize on creation
  verbose: boolean;        // Verbose logging
}
```

### `LLMConfig`

LLM configuration interface:

```typescript
interface LLMConfig {
  model: string;           // OpenAI model name
  apiKey: string;          // OpenAI API key
  baseURL?: string;        // Custom OpenAI endpoint
  organization?: string;   // OpenAI organization
  temperature?: number;    // Response randomness (0-2)
  maxTokens?: number;      // Maximum response tokens
  maxRetries?: number;     // Maximum retry attempts
  retryDelay?: number;     // Retry delay in milliseconds
}
```

## 🚀 Usage Examples

### Basic Agent Setup

```typescript
import { loadConfig } from '@/config';
import { getOpenAIClient } from '@/llm';
import { createMultiServerAgent } from '@/agent';

async function main() {
  // Load configuration
  const config = loadConfig();
  
  // Create OpenAI client
  const openaiClient = await getOpenAIClient();
  
  // Create agent
  const agent = await createMultiServerAgent(config, openaiClient);
  
  // Run query
  const result = await agent.run('What tools do you have access to?');
  console.log(result.response);
  
  // Cleanup
  await agent.shutdown();
}
```

### Streaming Response

```typescript
const agent = await createMultiServerAgent(config, openaiClient);

await agent.runStream(
  'Count from 1 to 5',
  { maxSteps: 10 },
  (chunk) => process.stdout.write(chunk)
);
```

### Custom Server Configuration

```typescript
import { createConfig } from '@/config';

const config = createConfig([
  {
    id: 'filesystem',
    name: 'File System Server',
    connectionType: 'stdio',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', '/workspace'],
    enabled: true,
    priority: 10,
    tags: ['files', 'io'],
    retry: { maxAttempts: 3, delayMs: 1000 }
  }
], {
  agent: { maxSteps: 20, verbose: true },
  llm: { temperature: 0.1, maxTokens: 2048 }
});
```

## 🖥️ CLI Interface ✅ **NEW - PRODUCTION READY!**

### CLI Entry Point

The CLI interface provides a complete command-line interface for interacting with the multi-server agent.

**Usage:**
```bash
npm run cli -- <command> [options]
# or
npm run mcp-agent -- <command> [options]
```

### Query Commands

#### `query <question> [options]`

Send a query to the multi-server agent.

**Parameters:**
- `question` (required): The question or request to send to the agent

**Options:**
- `-s, --stream`: Enable streaming response output
- `-m, --max-steps <number>`: Maximum number of steps for the agent (default: 10)
- `-t, --timeout <number>`: Timeout in milliseconds (default: 30000)
- `-f, --format <type>`: Output format - 'text' or 'json' (default: text)

**Examples:**
```bash
# Basic query
npm run cli -- query "What tools do you have access to?"

# Streaming query
npm run cli -- query "Tell me a story" --stream

# JSON output
npm run cli -- query "List servers" --format json

# Custom options
npm run cli -- query "Complex task" --max-steps 15 --timeout 60000
```

### Server Management Commands

#### `server list [options]`

List all configured MCP servers.

**Options:**
- `-e, --enabled-only`: Show only enabled servers
- `-f, --format <type>`: Output format - 'table' or 'json' (default: table)

**Examples:**
```bash
# List all servers
npm run cli -- server list

# List only enabled servers
npm run cli -- server list --enabled-only

# JSON format
npm run cli -- server list --format json
```

#### `server status [options]`

Check the health status of MCP servers.

**Options:**
- `-s, --server <id>`: Check specific server by ID
- `-f, --format <type>`: Output format - 'table' or 'json' (default: table)

**Examples:**
```bash
# Check all server status
npm run cli -- server status

# Check specific server
npm run cli -- server status --server filesystem
```

#### `server info [options]`

Show detailed information about servers.

**Options:**
- `-s, --server <id>`: Show info for specific server
- `-f, --format <type>`: Output format - 'table' or 'json' (default: table)

**Examples:**
```bash
# Show all server info
npm run cli -- server info

# Show specific server info
npm run cli -- server info --server filesystem
```

### Configuration Commands

#### `config init [options]`

Initialize configuration with default settings.

**Options:**
- `--force`: Overwrite existing configuration

**Examples:**
```bash
# Initialize configuration
npm run cli -- config init

# Force overwrite
npm run cli -- config init --force
```

#### `config show [options]`

Show current configuration.

**Options:**
- `-f, --format <type>`: Output format - 'table' or 'json' (default: table)

**Examples:**
```bash
# Show configuration
npm run cli -- config show

# JSON format
npm run cli -- config show --format json
```

#### `config validate`

Validate configuration settings.

**Examples:**
```bash
# Validate configuration
npm run cli -- config validate
```

### Global Options

All commands support these global options:

- `--verbose`: Enable verbose output
- `--quiet`: Suppress non-essential output
- `--no-color`: Disable colored output
- `--help`: Display help for command

### Exit Codes

The CLI uses standard exit codes:

- `0`: Success
- `1`: General error
- `2`: Invalid usage
- `3`: Configuration error
- `4`: Network error
- `5`: Timeout error
- `6`: Permission error
- `7`: Not found error
- `8`: Validation error

### CLI API Classes

#### `CLILogger`

Advanced logging system for CLI commands.

**Constructor:**
```typescript
new CLILogger(options: LoggerOptions)
```

**Methods:**
- `error(message: string, details?: any): void`
- `warn(message: string): void`
- `info(message: string): void`
- `success(message: string): void`
- `debug(message: string, data?: any): void`
- `verbose(message: string, data?: any): void`
- `json(data: any): void`

#### `SimpleAgent`

Lightweight agent implementation for CLI usage.

**Constructor:**
```typescript
new SimpleAgent(config: MCPMultiAgentConfig, openaiClient: OpenAIClient)
```

**Methods:**
- `initialize(): Promise<void>`
- `run(query: string, options?: SimpleAgentRunOptions): Promise<SimpleAgentResult>`
- `runStream(query: string, options?: SimpleAgentRunOptions, onChunk?: (chunk: string) => void): Promise<SimpleAgentResult>`
- `getServerInfo(): Promise<{ totalServers: number; enabledServers: number }>`

## 🧪 Testing

### CLI Test Commands ✅ **NEW!**

```bash
# Run CLI test suite
npm run test:cli

# Validate CLI functionality
npm run validate:cli
```

### Development Test Commands

```bash
# Test OpenAI integration
npm run dev test-openai

# Test agent implementation (minimal)
npm run dev test-agent --minimal

# Test agent implementation (full)
npm run dev test-agent
```

### Programmatic Testing

```typescript
import { testMultiServerAgent, testMinimalAgent } from '@/agent/test-agent';

// Run comprehensive tests
await testMultiServerAgent();

// Run minimal tests (no external servers)
await testMinimalAgent();
```

## 🔍 Error Handling

All methods throw descriptive errors that can be caught and handled:

```typescript
try {
  const result = await agent.run('Complex query');
  console.log(result.response);
} catch (error) {
  if (error.message.includes('Agent initialization failed')) {
    // Handle initialization errors
  } else if (error.message.includes('Agent execution failed')) {
    // Handle execution errors
  }
  console.error('Agent error:', error.message);
}
```

## 🌍 Environment Configuration API

### `@/config/env` - Environment Configuration Module

#### `loadEnvironmentConfig(): EnvironmentConfig`

Loads and validates environment configuration with comprehensive validation.

**Returns:** Complete environment configuration object

**Throws:** `EnvironmentError` for validation failures

**Example:**
```typescript
import { loadEnvironmentConfig } from '@/config/env';

try {
  const envConfig = loadEnvironmentConfig();
  console.log('Environment:', envConfig.environment.nodeEnv);
  console.log('OpenAI Model:', envConfig.openai.model);
} catch (error) {
  console.error('Environment error:', error.message);
}
```

#### `getEnvironmentConfig(): EnvironmentConfig`

Gets cached environment configuration (loads on first call).

**Returns:** Cached environment configuration object

#### `validateEnvironmentConfig(): { valid: boolean; errors: string[] }`

Validates environment configuration without throwing errors.

**Returns:** Validation result with error details

**Example:**
```typescript
import { validateEnvironmentConfig } from '@/config/env';

const validation = validateEnvironmentConfig();
if (!validation.valid) {
  console.log('Environment errors:', validation.errors);
}
```

#### `resetEnvironmentConfig(): void`

Resets cached configuration (useful for testing).

#### `EnvironmentConfig` Interface

```typescript
interface EnvironmentConfig {
  openai: {
    apiKey: string;
    baseURL?: string;
    organization?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    maxRetries?: number;
    retryDelay?: number;
  };
  agent: {
    maxSteps: number;
    timeout: number;
  };
  serverManager: {
    maxConcurrentServers: number;
    startupTimeout: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'text' | 'json';
    file?: string;
  };
  environment: {
    nodeEnv: 'development' | 'production' | 'test';
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
  };
}
```

## 📝 Environment Variables

**Required Variables:**
```bash
OPENAI_API_KEY=your_openai_api_key_here    # Required: OpenAI API key
```

**Optional Configuration:**
```bash
# OpenAI Configuration
OPENAI_BASE_URL=https://api.openai.com/v1  # Custom OpenAI endpoint
OPENAI_ORGANIZATION=your_org_id            # OpenAI organization ID
OPENAI_MODEL=gpt-4o                        # Model (default: gpt-4o)
OPENAI_TEMPERATURE=0.1                     # Temperature 0-2 (default: 0.1)
OPENAI_MAX_TOKENS=4096                     # Max tokens 1-32000 (default: 4096)
OPENAI_MAX_RETRIES=3                       # Retries 0-10 (default: 3)
OPENAI_RETRY_DELAY=2000                    # Retry delay 100-30000ms (default: 2000)

# Agent Configuration
AGENT_MAX_STEPS=10                         # Max steps 1-100 (default: 10)
AGENT_TIMEOUT=60000                        # Timeout 1000-300000ms (default: 60000)

# Server Manager Configuration
MAX_CONCURRENT_SERVERS=3                   # Concurrent servers 1-20 (default: 3)
SERVER_STARTUP_TIMEOUT=30                  # Startup timeout 5-300s (default: 30)

# Logging Configuration
LOG_LEVEL=info                             # Level: debug|info|warn|error (default: info)
LOG_FORMAT=text                            # Format: text|json (default: text)
LOG_FILE=./logs/agent.log                  # Optional log file path

# Environment Detection
NODE_ENV=development                       # Environment: development|production|test
```

**Validation Features:**
- Type safety with TypeScript interfaces
- Range validation for numeric values
- Enum validation for string values
- Helpful error messages with suggestions
- Default values for all optional variables

## 🏥 Health Monitoring API

### `@/monitoring` - Server Health Monitoring

#### `ServerHealthMonitor`

Main health monitoring orchestrator with event-driven architecture.

**Constructor:**
```typescript
new ServerHealthMonitor(clientFactory: MCPClientFactory, config?: Partial<HealthMonitoringConfig>)
```

**Methods:**

##### `initialize(servers: MCPServerConfig[]): Promise<void>`
Initialize health monitoring for specified servers.

##### `startMonitoring(): void`
Start periodic health monitoring.

##### `stopMonitoring(): void`
Stop health monitoring.

##### `getServerHealth(serverId: string): ServerHealthInfo | null`
Get health information for a specific server.

##### `getAllServerHealth(): ServerHealthInfo[]`
Get health information for all monitored servers.

##### `getHealthSummary(): HealthSummary`
Get overall health summary with aggregated metrics.

##### `forceHealthCheck(serverId: string): Promise<ServerHealthInfo | null>`
Force immediate health check for a server.

##### `reconnectServer(serverId: string): Promise<boolean>`
Manually trigger reconnection for a server.

**Events:**
```typescript
monitor.on('server-healthy', (serverId: string, info: ServerHealthInfo) => {
  console.log(`Server ${serverId} is healthy`);
});

monitor.on('server-unhealthy', (serverId: string, info: ServerHealthInfo) => {
  console.log(`Server ${serverId} is unhealthy: ${info.lastError}`);
});

monitor.on('circuit-breaker-opened', (serverId: string, info: ServerHealthInfo) => {
  console.log(`Circuit breaker opened for ${serverId}`);
});
```

#### `HealthChecker`

Performs detailed health checks with timeout and tool validation.

**Methods:**

##### `checkServerHealth(serverId: string, options?: HealthCheckOptions): Promise<HealthCheckResult>`
Perform comprehensive health check on a server.

##### `quickConnectionTest(serverId: string): Promise<boolean>`
Perform quick connection test (3-second timeout).

##### `comprehensiveHealthCheck(serverId: string): Promise<HealthCheckResult>`
Perform comprehensive health check with all options enabled.

##### `isServerResponsive(serverId: string): Promise<boolean>`
Check if server is responsive with tool validation.

#### `ReconnectionManager`

Handles automatic reconnection with exponential backoff.

**Methods:**

##### `scheduleReconnection(serverId: string): Promise<void>`
Schedule reconnection for a failed server.

##### `reconnectServer(serverId: string): Promise<boolean>`
Manually trigger immediate reconnection.

##### `cancelReconnection(serverId: string): void`
Cancel scheduled reconnection.

##### `getReconnectionStatus(serverId: string): ReconnectionStatus | null`
Get reconnection status for a server.

##### `getAllReconnectionStatus(): ReconnectionStatus[]`
Get reconnection status for all servers.

#### Factory Functions

##### `createHealthMonitor(clientFactory, servers, config?): Promise<ServerHealthMonitor>`
Create and initialize health monitor.

##### `createAndStartHealthMonitor(clientFactory, servers, config?): Promise<ServerHealthMonitor>`
Create, initialize, and start health monitor.

**Example Usage:**
```typescript
import { createAndStartHealthMonitor } from '@/monitoring';

const monitor = await createAndStartHealthMonitor(clientFactory, servers, {
  healthCheckInterval: 30000,
  autoReconnect: true,
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 60000,
    halfOpenMaxCalls: 3,
  },
});

// Listen for health events
monitor.on('server-unhealthy', (serverId, info) => {
  console.log(`Server ${serverId} failed: ${info.lastError}`);
});

// Get health summary
const summary = monitor.getHealthSummary();
console.log(`${summary.healthyServers}/${summary.totalServers} servers healthy`);
```

### Health Monitoring Types

#### `ServerHealthStatus`
```typescript
type ServerHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'disconnected' | 'reconnecting';
```

#### `ServerHealthInfo`
```typescript
interface ServerHealthInfo {
  serverId: string;
  status: ServerHealthStatus;
  lastHealthCheck: Date;
  lastSuccessfulCheck: Date;
  consecutiveFailures: number;
  averageResponseTime: number;
  errorRate: number;
  connectionCount: number;
  memoryUsage?: number;
  cpuUsage?: number;
  lastError?: string;
  uptime: number;
  isCircuitBreakerOpen: boolean;
}
```

#### `HealthMonitoringConfig`
```typescript
interface HealthMonitoringConfig {
  healthCheckInterval: number;        // Default: 30000ms
  healthCheckTimeout: number;         // Default: 5000ms
  failureThreshold: number;           // Default: 3
  recoveryThreshold: number;          // Default: 2
  autoReconnect: boolean;             // Default: true
  reconnectInterval: number;          // Default: 10000ms
  maxReconnectAttempts: number;       // Default: 5
  circuitBreaker: {
    enabled: boolean;                 // Default: true
    failureThreshold: number;         // Default: 5
    recoveryTimeout: number;          // Default: 60000ms
    halfOpenMaxCalls: number;         // Default: 3
  };
}
```

## `@/utils` - Error Handling and Recovery

### Error Handling Classes

#### `ErrorRecoveryOrchestrator`

Comprehensive error recovery orchestrator that coordinates retry mechanisms, graceful degradation, and error handling.

**Constructor:**
```typescript
new ErrorRecoveryOrchestrator(config?: Partial<ErrorRecoveryConfig>)
```

**Methods:**

##### `executeWithRecovery<T>(operation, context): Promise<RecoveryResult<T>>`

Execute operation with comprehensive error recovery.

**Parameters:**
- `operation`: Function that returns a Promise
- `context`: OperationContext with operation details

**Example:**
```typescript
import { ErrorRecoveryOrchestrator } from '@/utils';

const orchestrator = new ErrorRecoveryOrchestrator();

const result = await orchestrator.executeWithRecovery(
  async () => {
    // Your operation here
    return await someOperation();
  },
  {
    operationName: 'my_operation',
    serverId: 'my-server',
    isCritical: false,
    correlationId: 'op-123'
  }
);

if (result.success) {
  console.log('Operation succeeded:', result.result);
} else {
  console.error('Operation failed:', result.error);
}
```

##### `getMetrics(): RecoveryMetrics`

Get comprehensive error recovery metrics.

**Returns:** Object with operation statistics, error counts, and recovery usage.

##### `getHealthStatus(): SystemHealthStatus`

Get overall system health including error recovery status.

**Returns:** Object with health assessment and performance metrics.

### Error Classes

#### `MCPError`

Base error class with enhanced metadata and categorization.

**Constructor:**
```typescript
new MCPError(message: string, details?: Partial<MCPErrorDetails>, originalError?: Error)
```

**Methods:**
- `isRetryable(): boolean` - Check if error is retryable
- `getRecoveryStrategy(): RecoveryStrategy` - Get recommended recovery strategy
- `isCritical(): boolean` - Check if error is critical
- `toJSON(): object` - Serialize error for logging

#### Specialized Error Classes

- `MCPConnectionError` - Connection and network errors
- `MCPAuthenticationError` - Authentication failures
- `MCPServerError` - Server-side errors
- `MCPToolExecutionError` - Tool execution failures
- `MCPTimeoutError` - Timeout errors
- `MCPRateLimitError` - Rate limiting errors

### Utility Functions

#### `withErrorRecovery<T>(operation, context, config?): Promise<RecoveryResult<T>>`

Utility function to wrap any operation with error recovery.

**Example:**
```typescript
import { withErrorRecovery } from '@/utils';

const result = await withErrorRecovery(
  async () => await myOperation(),
  {
    operationName: 'my_operation',
    serverId: 'server-1',
    isCritical: false
  }
);
```

#### `handleError(error, context?, config?): MCPError`

Classify and handle any error type.

**Example:**
```typescript
import { handleError } from '@/utils';

try {
  await someOperation();
} catch (error) {
  const mcpError = handleError(error, {
    operation: 'my_operation',
    serverId: 'server-1'
  });

  console.log(`Error category: ${mcpError.details.category}`);
  console.log(`Retryable: ${mcpError.isRetryable()}`);
}
```

### Enhanced MultiServerAgent Methods

#### `getErrorRecoveryMetrics(): RecoveryMetrics`

Get error recovery metrics from the agent.

#### `getSystemHealthStatus(): SystemHealthStatus`

Get comprehensive system health including error recovery.

#### `resetErrorRecovery(): void`

Reset error recovery metrics and state.

---

*Last Updated: 2025-08-18*
*Version: 1.2*
*For more information, see the [Architecture Documentation](./ARCHITECTURE.md) and [Error Handling Completion Handoff](./ERROR_HANDLING_COMPLETION_HANDOFF.md)*
