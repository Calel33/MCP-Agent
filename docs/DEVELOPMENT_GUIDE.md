# 🛠️ Development Guide - MCP Multi-Agent

## Overview

This guide provides comprehensive information for developers who want to contribute to or extend the MCP Multi-Agent project. It covers development setup, coding standards, testing procedures, and contribution guidelines.

## 🚀 Development Setup

### 🎉 **PRODUCTION READY - IMMEDIATE ACCESS**

**The system is already fully operational!**

**🌐 Live Application**: http://localhost:3001/chat
**Status**: ✅ DocFork MCP documentation research with HTTP Streamable transport

### **Quick Development Access**

**Frontend Development** (DocFork MCP UI):
```bash
cd mcp-agent-ui
npm run dev  # Starts DocFork MCP interface at localhost:3001/chat
```

**Backend Development** (MCP Multi-Agent):
```bash
npm run cli -- query "test query"  # Test CLI
npm run build  # Build TypeScript backend
```

**Health Monitoring**:
```bash
curl http://localhost:3001/api/health  # Check system status
```

### **Development Prerequisites** (if extending)

- **Node.js**: Version 18.0.0 or higher ✅ **READY**
- **OpenAI API**: Already configured ✅ **ACTIVE**
- **MCP Servers**: DocFork MCP server connected via HTTP Streamable ✅ **OPERATIONAL**
- **TypeScript**: Full type safety ✅ **CONFIGURED**
- **HTTP Transport**: Streamable HTTP with automatic SSE fallback ✅ **OPTIMIZED**

### **Advanced Development Setup** (optional)

Only needed if you want to modify the core system:

1. **Backend development:**
```bash
npm install  # Dependencies already installed
npm run build  # Build TypeScript backend
npm run test  # Run test suite
```

2. **Frontend development:**
```bash
cd mcp-agent-ui
npm install  # UI dependencies
npm run dev  # Development server with hot reload
npm run build  # Production build
```

### Environment Configuration System

The project uses a comprehensive environment configuration system with validation and type safety:

#### Configuration Architecture

```
src/config/
├── env.ts              # Environment configuration with validation
├── loader.ts           # Main configuration loader
├── types.ts            # TypeScript interfaces
├── client-factory.ts   # MCP client factory
└── test-env.ts         # Environment testing utilities
```

#### Environment Variables

**Required Variables:**
- `OPENAI_API_KEY`: Your OpenAI API key (required for LLM integration)
- `SMITHERY_API_KEY`: Smithery API key (required for DocFork and Playwright MCP)
- `SMITHERY_PROFILE`: Smithery profile ID (required for DocFork MCP)
- `HUSTLE_API_KEY`: Hustle HTTP API key (required for crypto agent MCP)
- `HUSTLE_VAULT_ID`: Hustle vault ID (required for crypto agent MCP)

**Optional Configuration:**
- `OPENAI_MODEL`: Model to use (default: gpt-4o)
- `OPENAI_TEMPERATURE`: Response temperature 0-2 (default: 0.1)
- `OPENAI_MAX_TOKENS`: Maximum tokens 1-32000 (default: 4096)
- `OPENAI_MAX_RETRIES`: Retry attempts 0-10 (default: 3)
- `OPENAI_RETRY_DELAY`: Retry delay 100-30000ms (default: 2000)
- `AGENT_MAX_STEPS`: Agent steps 1-100 (default: 10)
- `AGENT_TIMEOUT`: Agent timeout 1000-300000ms (default: 60000)
- `MAX_CONCURRENT_SERVERS`: Concurrent servers 1-20 (default: 3)
- `SERVER_STARTUP_TIMEOUT`: Startup timeout 5-300s (default: 30)
- `LOG_LEVEL`: Logging level debug|info|warn|error (default: info)
- `LOG_FORMAT`: Log format text|json (default: text)
- `LOG_FILE`: Optional log file path
- `NODE_ENV`: Environment development|production|test (default: development)

#### Environment Testing

Test your environment configuration:

```bash
# Test environment configuration
npm run dev:test-env

# Test with specific environment
NODE_ENV=production npm run dev:test-env

# Test agent with environment
npm run dev test-agent --minimal
```

#### Environment Validation Features

- **Type Safety**: Full TypeScript interfaces for all environment variables
- **Range Validation**: Numeric values validated against min/max ranges
- **Enum Validation**: String values validated against allowed options
- **Helpful Errors**: Detailed error messages with suggestions
- **Default Values**: Sensible defaults for all optional variables
- **Environment Detection**: Automatic development/production/test detection

3. **Verify setup:**
```bash
npm run type-check
npm run build
npm run dev test-openai
```

### Development Workflow

```bash
# Start development with hot reload
npm run dev

# Type checking (runs continuously)
npm run type-check

# Build for production
npm run build

# Run tests
npm run test
npm run dev test-agent

# Linting
npm run lint
npm run lint:fix
```

## 📁 Project Structure

```
mcp-multi-agent/
├── src/                    # Source code
│   ├── agent/             # Agent implementation ✅
│   ├── config/            # Configuration management ✅
│   ├── llm/               # LLM integration ✅
│   ├── cli/               # CLI interface ✅ COMPLETED
│   │   ├── index.ts       # Main CLI entry point
│   │   ├── commands/      # CLI command implementations
│   │   └── utils/         # CLI utilities and helpers
│   ├── monitoring/        # Health monitoring (planned)
│   ├── utils/             # Utility functions (planned)
│   └── index.ts           # Main entry point
├── docs/                  # Documentation
├── dist/                  # Build output
├── tests/                 # Test files (planned)
├── examples/              # Usage examples (planned)
└── scripts/               # Build and utility scripts
```

## 🔧 Coding Standards

### TypeScript Configuration

The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Code Style Guidelines

1. **Type Safety**: Always use explicit types, avoid `any`
2. **Error Handling**: Comprehensive error handling with descriptive messages
3. **Documentation**: JSDoc comments for all public APIs
4. **Naming**: Use descriptive names, follow TypeScript conventions
5. **Imports**: Use path aliases (`@/config`, `@/llm`, etc.)

### Example Code Pattern

```typescript
/**
 * Example function with proper TypeScript patterns
 */
export async function exampleFunction(
  config: RequiredConfig,
  options?: OptionalOptions
): Promise<Result> {
  try {
    // Validate inputs
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    // Implementation with proper error handling
    const result = await someAsyncOperation(config, options);
    
    return {
      success: true,
      data: result,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`Operation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## 🧪 Testing Strategy

### Test Structure

```
tests/
├── unit/              # Unit tests for individual components
├── integration/       # Integration tests for component interaction
├── e2e/              # End-to-end tests for complete workflows
└── fixtures/         # Test data and mock configurations
```

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm run dev test-openai      # OpenAI integration
npm run dev test-agent       # Agent implementation
npm run dev test-agent --minimal  # Minimal agent test

# Run with coverage
npm run test:coverage
```

### Writing Tests

Example test pattern:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMultiServerAgent } from '@/agent';
import { loadConfig } from '@/config';
import { getOpenAIClient } from '@/llm';

describe('MultiServerAgent', () => {
  let agent: MultiServerAgent;
  
  beforeEach(async () => {
    const config = loadConfig({ /* test config */ });
    const openaiClient = await getOpenAIClient();
    agent = await createMultiServerAgent(config, openaiClient);
  });

  afterEach(async () => {
    await agent.shutdown();
  });

  it('should initialize successfully', () => {
    expect(agent.isReady()).toBe(true);
  });

  it('should handle queries correctly', async () => {
    const result = await agent.run('Test query');
    expect(result.response).toBeDefined();
    expect(result.executionTime).toBeGreaterThan(0);
  });
});
```

## 🏗️ Architecture Patterns

### Factory Pattern

Used for creating clients and agents:

```typescript
// LLM Factory
export class LLMFactory {
  private static instance: LLMFactory;
  private clients = new Map<string, OpenAIClient>();

  static getInstance(): LLMFactory {
    if (!LLMFactory.instance) {
      LLMFactory.instance = new LLMFactory();
    }
    return LLMFactory.instance;
  }
}

// Agent Factory
export async function createMultiServerAgent(
  config: MCPMultiAgentConfig,
  openaiClient: OpenAIClient
): Promise<MultiServerAgent> {
  const agent = new MultiServerAgent(config, openaiClient);
  if (config.agent.autoInitialize) {
    await agent.initialize();
  }
  return agent;
}
```

### Configuration Pattern

Centralized configuration with environment variable support:

```typescript
export function loadConfig(customConfig?: Partial<MCPMultiAgentConfig>): MCPMultiAgentConfig {
  // Load from environment
  const envConfig = loadFromEnvironment();
  
  // Merge with defaults and custom config
  const config = {
    ...DEFAULT_CONFIG,
    ...envConfig,
    ...customConfig
  };
  
  // Validate configuration
  validateConfig(config);
  
  return config;
}
```

### Error Handling Pattern

Consistent error handling across the codebase:

```typescript
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

// Usage
try {
  const config = loadConfig();
} catch (error) {
  if (error instanceof ConfigValidationError) {
    console.error('Configuration error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🔌 Adding New Features

### Adding a New MCP Server

1. **Define server configuration:**
```typescript
// In src/config/examples.ts
export const NEW_SERVER_CONFIG: MCPServerConfig = {
  id: 'new-server',
  name: 'New Server',
  description: 'Description of the new server',
  connectionType: 'stdio',
  command: 'npx',
  args: ['new-server-package'],
  enabled: false,
  priority: 5,
  tags: ['new', 'server'],
  retry: { maxAttempts: 3, delayMs: 1000 }
};
```

2. **Add to default configuration:**
```typescript
// In src/config/types.ts
export const DEFAULT_CONFIG = {
  // ... existing config
  servers: [
    // ... existing servers
    NEW_SERVER_CONFIG
  ]
};
```

3. **Test the integration:**
```typescript
// Create test for new server
const config = createConfig([NEW_SERVER_CONFIG]);
const agent = await createMultiServerAgent(config, openaiClient);
const result = await agent.testConnections();
```

### Adding New Agent Capabilities

1. **Extend AgentRunOptions:**
```typescript
export interface AgentRunOptions {
  // ... existing options
  newOption?: boolean;
}
```

2. **Implement in MultiServerAgent:**
```typescript
async run(query: string, options: AgentRunOptions = {}): Promise<AgentResult> {
  // Handle new option
  if (options.newOption) {
    // New capability implementation
  }
  
  // ... existing implementation
}
```

3. **Add tests:**
```typescript
it('should handle new option', async () => {
  const result = await agent.run('Test query', { newOption: true });
  // Assertions for new behavior
});
```

## 🖥️ CLI Development ✅ **NEW!**

### CLI Architecture

The CLI interface is built with a modular architecture using commander.js:

```typescript
// CLI structure
src/cli/
├── index.ts              # Main CLI entry point with commander.js
├── commands/             # Command implementations
│   ├── query.ts         # Query command with streaming support
│   ├── servers.ts       # Server management commands
│   └── config.ts        # Configuration commands
├── utils/               # CLI utilities
│   ├── logger.ts        # Advanced logging system
│   ├── simple-agent.ts  # Lightweight agent for CLI
│   └── config-*.ts      # Configuration utilities
└── test-*.sh           # CLI testing scripts
```

### Adding New CLI Commands

1. **Create command file:**
```typescript
// src/cli/commands/new-command.ts
import { Command } from 'commander';
import chalk from 'chalk';

export function createNewCommand(): Command {
  return new Command('new-command')
    .description('Description of new command')
    .argument('<required-arg>', 'Required argument description')
    .option('-o, --option <value>', 'Optional parameter')
    .action(async (requiredArg: string, options: any) => {
      await handleNewCommand(requiredArg, options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent new-command "example" --option value
`);
}

async function handleNewCommand(arg: string, options: any): Promise<void> {
  try {
    // Command implementation
    console.log(chalk.green('Command executed successfully'));
  } catch (error) {
    console.error(chalk.red('Command failed:'), error);
    process.exit(1);
  }
}
```

2. **Register in main CLI:**
```typescript
// src/cli/index.ts
import { createNewCommand } from './commands/new-command.js';

function addNewCommands(program: Command): void {
  const newCommand = createNewCommand();
  program.addCommand(newCommand);
}
```

3. **Add tests:**
```bash
# Add to src/cli/test-cli.sh
run_test_with_output "New command test" "npm run cli -- new-command 'test'" "expected output"
```

### CLI Logging System

The CLI uses an advanced logging system with multiple levels:

```typescript
import { CLILogger, LogLevel, ExitCode } from './utils/logger.js';

// Create logger
const logger = new CLILogger({
  verbose: process.env['CLI_VERBOSE'] === 'true',
  quiet: process.env['CLI_QUIET'] === 'true',
  noColor: process.env['CLI_NO_COLOR'] === 'true'
});

// Use different log levels
logger.error('Error message', errorDetails);
logger.warn('Warning message');
logger.info('Info message');
logger.success('Success message');
logger.debug('Debug message', debugData);
logger.verbose('Verbose message', verboseData);

// Exit with proper code
exitWithError('Error message', ExitCode.CONFIG_ERROR, errorDetails);
```

### CLI Testing

The CLI includes comprehensive testing:

```bash
# Run CLI test suite
npm run test:cli

# Run validation script
npm run validate:cli

# Manual testing
./src/cli/test-cli.sh
```

**Test Categories:**
- Basic commands (help, version)
- Query commands (standard, streaming, JSON)
- Server management (list, status, info)
- Configuration (init, show, validate)
- Error handling (invalid args, missing params)
- Output formatting (text, JSON, table)
- Logging and verbosity (verbose, quiet, no-color)

### CLI Configuration

The CLI supports multiple configuration sources:

```typescript
// Environment variables
CLI_VERBOSE=true
CLI_QUIET=false
CLI_NO_COLOR=false
CLI_CONFIG_PATH=./custom-config.json

// Configuration file
{
  "llm": {
    "model": "gpt-4",
    "apiKey": "your-key"
  },
  "servers": [...],
  "agent": {
    "maxSteps": 10,
    "timeout": 30000
  }
}
```

### CLI Error Handling

The CLI uses standardized exit codes:

```typescript
export enum ExitCode {
  SUCCESS = 0,           // Command completed successfully
  GENERAL_ERROR = 1,     // General error
  INVALID_USAGE = 2,     // Invalid command usage
  CONFIG_ERROR = 3,      // Configuration error
  NETWORK_ERROR = 4,     // Network/connection error
  TIMEOUT_ERROR = 5,     // Operation timeout
  PERMISSION_ERROR = 6,  // Permission denied
  NOT_FOUND_ERROR = 7,   // Resource not found
  VALIDATION_ERROR = 8   // Validation failed
}
```

## 🏥 Health Monitoring Development

### Health Monitoring Architecture

The health monitoring system consists of three main components:

```typescript
// Core health monitoring components
import {
  ServerHealthMonitor,    // Main orchestrator
  HealthChecker,         // Health check implementation
  ReconnectionManager    // Automatic reconnection logic
} from '@/monitoring';
```

### Developing Health Monitoring Features

#### 1. Creating Custom Health Checks

```typescript
// Extend HealthChecker for custom health validation
class CustomHealthChecker extends HealthChecker {
  async checkServerHealth(serverId: string, options?: HealthCheckOptions): Promise<HealthCheckResult> {
    // Call parent implementation
    const baseResult = await super.checkServerHealth(serverId, options);

    // Add custom validation
    const customChecks = await this.performCustomChecks(serverId);

    return {
      ...baseResult,
      details: {
        ...baseResult.details,
        customMetrics: customChecks
      }
    };
  }

  private async performCustomChecks(serverId: string): Promise<any> {
    // Custom health check logic
    return {
      diskSpace: await this.checkDiskSpace(serverId),
      networkLatency: await this.checkNetworkLatency(serverId),
      customMetric: await this.checkCustomMetric(serverId)
    };
  }
}
```

#### 2. Custom Reconnection Strategies

```typescript
// Extend ReconnectionManager for custom reconnection logic
class CustomReconnectionManager extends ReconnectionManager {
  protected calculateBackoffDelay(attemptNumber: number): number {
    // Custom backoff strategy (e.g., linear instead of exponential)
    const baseDelay = this.config.reconnectInterval;
    return baseDelay * (attemptNumber + 1); // Linear backoff
  }

  async reconnectServer(serverId: string): Promise<boolean> {
    // Pre-reconnection custom logic
    await this.performPreReconnectionChecks(serverId);

    // Call parent implementation
    const success = await super.reconnectServer(serverId);

    // Post-reconnection custom logic
    if (success) {
      await this.performPostReconnectionSetup(serverId);
    }

    return success;
  }
}
```

#### 3. Custom Health Monitoring Events

```typescript
// Extend ServerHealthMonitor with custom events
interface CustomHealthMonitoringEvents extends HealthMonitoringEvents {
  'custom-metric-threshold': (serverId: string, metric: string, value: number) => void;
  'server-performance-degraded': (serverId: string, metrics: PerformanceMetrics) => void;
  'maintenance-mode-required': (serverId: string, reason: string) => void;
}

class CustomServerHealthMonitor extends ServerHealthMonitor {
  // Override to add custom event handling
  protected async updateServerHealth(serverId: string, healthResult: any): Promise<void> {
    await super.updateServerHealth(serverId, healthResult);

    // Custom event logic
    const healthInfo = this.getServerHealth(serverId);
    if (healthInfo) {
      this.checkCustomThresholds(serverId, healthInfo);
    }
  }

  private checkCustomThresholds(serverId: string, health: ServerHealthInfo): void {
    // Custom threshold checking
    if (health.averageResponseTime > 5000) {
      this.emit('server-performance-degraded', serverId, {
        responseTime: health.averageResponseTime,
        errorRate: health.errorRate
      });
    }

    if (health.memoryUsage && health.memoryUsage > 1000) {
      this.emit('custom-metric-threshold', serverId, 'memory', health.memoryUsage);
    }
  }
}
```

### Testing Health Monitoring

#### 1. Unit Testing Health Components

```typescript
// Test health checker
describe('HealthChecker', () => {
  let healthChecker: HealthChecker;
  let mockClientFactory: jest.Mocked<MCPClientFactory>;

  beforeEach(() => {
    mockClientFactory = createMockClientFactory();
    healthChecker = new HealthChecker(mockClientFactory, DEFAULT_HEALTH_CONFIG);
  });

  it('should detect healthy server', async () => {
    mockClientFactory.isConnected.mockReturnValue(true);

    const result = await healthChecker.checkServerHealth('test-server');

    expect(result.success).toBe(true);
    expect(result.details.connectionStatus).toBe('connected');
  });

  it('should handle connection timeout', async () => {
    mockClientFactory.createSession.mockImplementation(() =>
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
    );

    const result = await healthChecker.checkServerHealth('test-server', { timeout: 50 });

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('timeout');
  });
});
```

#### 2. Integration Testing

```typescript
// Test complete health monitoring workflow
describe('Health Monitoring Integration', () => {
  let agent: MultiServerAgent;
  let healthMonitor: ServerHealthMonitor;

  beforeEach(async () => {
    const config = createTestConfig();
    const openaiClient = await getOpenAIClient(config.llm);
    agent = new MultiServerAgent(config, openaiClient);
    await agent.initialize();

    // Access internal health monitor for testing
    healthMonitor = (agent as any).serverManager.healthMonitor;
  });

  it('should detect and recover from server failure', async () => {
    // Simulate server failure
    await simulateServerFailure('test-server');

    // Wait for health monitoring to detect failure
    await waitForHealthStatus('test-server', 'unhealthy');

    // Verify health status
    const health = agent.getServerHealth();
    const serverHealth = health.find(h => h.serverId === 'test-server');
    expect(serverHealth?.status).toBe('unhealthy');

    // Simulate server recovery
    await simulateServerRecovery('test-server');

    // Wait for health monitoring to detect recovery
    await waitForHealthStatus('test-server', 'healthy');

    // Verify recovery
    const recoveredHealth = agent.getServerHealth();
    const recoveredServerHealth = recoveredHealth.find(h => h.serverId === 'test-server');
    expect(recoveredServerHealth?.status).toBe('healthy');
  });
});
```

#### 3. Performance Testing

```typescript
// Test health monitoring performance
describe('Health Monitoring Performance', () => {
  it('should handle high-frequency health checks', async () => {
    const config = {
      ...DEFAULT_HEALTH_CONFIG,
      healthCheckInterval: 1000, // 1 second
    };

    const monitor = await createHealthMonitor(clientFactory, servers, config);
    monitor.startMonitoring();

    // Monitor for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));

    const summary = monitor.getHealthSummary();
    expect(summary.totalServers).toBeGreaterThan(0);

    // Verify no memory leaks
    const memoryUsage = process.memoryUsage();
    expect(memoryUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // < 100MB

    await monitor.shutdown();
  });
});
```

### Health Monitoring Best Practices

#### 1. Configuration Guidelines

```typescript
// Production configuration
const productionHealthConfig: HealthMonitoringConfig = {
  healthCheckInterval: 30000,        // 30 seconds
  healthCheckTimeout: 5000,          // 5 seconds
  failureThreshold: 3,               // Conservative failure detection
  autoReconnect: true,
  maxReconnectAttempts: 5,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,             // Open circuit after 5 failures
    recoveryTimeout: 60000,          // 1 minute recovery
    halfOpenMaxCalls: 3,
  },
};

// Development configuration
const developmentHealthConfig: HealthMonitoringConfig = {
  healthCheckInterval: 10000,        // 10 seconds
  healthCheckTimeout: 3000,          // 3 seconds
  failureThreshold: 2,               // Quick failure detection
  autoReconnect: true,
  maxReconnectAttempts: 10,          // More attempts for debugging
  circuitBreaker: {
    enabled: true,
    failureThreshold: 3,             // Quick circuit opening
    recoveryTimeout: 30000,          // 30 seconds recovery
    halfOpenMaxCalls: 2,
  },
};
```

#### 2. Error Handling

```typescript
// Robust error handling in health monitoring
class RobustHealthMonitor extends ServerHealthMonitor {
  protected async performHealthChecks(): Promise<void> {
    try {
      await super.performHealthChecks();
    } catch (error) {
      console.error('Health monitoring error:', error);

      // Implement fallback health checking
      await this.performFallbackHealthChecks();
    }
  }

  private async performFallbackHealthChecks(): Promise<void> {
    // Simplified health checks when main monitoring fails
    const serverIds = Array.from(this.healthInfo.keys());

    for (const serverId of serverIds) {
      try {
        const isConnected = this.clientFactory.isConnected(serverId);
        const healthInfo = this.getServerHealth(serverId);

        if (healthInfo) {
          healthInfo.status = isConnected ? 'healthy' : 'disconnected';
          healthInfo.lastHealthCheck = new Date();
        }
      } catch (error) {
        console.warn(`Fallback health check failed for ${serverId}:`, error);
      }
    }
  }
}
```

#### 3. Monitoring Integration

```typescript
// Integration with external monitoring systems
class MonitoringIntegratedHealthMonitor extends ServerHealthMonitor {
  constructor(
    clientFactory: MCPClientFactory,
    config: HealthMonitoringConfig,
    private externalMonitoring: ExternalMonitoringService
  ) {
    super(clientFactory, config);
    this.setupExternalMonitoringIntegration();
  }

  private setupExternalMonitoringIntegration(): void {
    this.on('server-unhealthy', (serverId, info) => {
      this.externalMonitoring.sendAlert({
        type: 'server_unhealthy',
        serverId,
        errorRate: info.errorRate,
        consecutiveFailures: info.consecutiveFailures,
        lastError: info.lastError
      });
    });

    this.on('circuit-breaker-opened', (serverId, info) => {
      this.externalMonitoring.sendAlert({
        type: 'circuit_breaker_opened',
        serverId,
        severity: 'high',
        details: info
      });
    });
  }
}
```

## 📦 Building and Deployment

### Build Process

```bash
# Clean build
npm run clean
npm run build

# Verify build
node dist/index.js --help
```

### Build Configuration

The project uses TypeScript compiler with these key settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Distribution

```bash
# Create distribution package
npm pack

# Install from package
npm install mcp-multi-agent-1.0.0.tgz
```

## 🐛 Debugging

### Debug Configuration

VS Code launch configuration:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Agent",
  "program": "${workspaceFolder}/src/index.ts",
  "args": ["test-agent", "--minimal"],
  "runtimeArgs": ["-r", "tsx/cjs"],
  "env": {
    "NODE_ENV": "development"
  },
  "console": "integratedTerminal"
}
```

### Logging

Enable debug logging:

```typescript
const config = loadConfig({
  logging: {
    level: 'debug',
    format: 'text'
  }
});
```

### Common Debug Scenarios

1. **Agent initialization issues:**
```bash
npm run dev test-agent --minimal
```

2. **OpenAI connection problems:**
```bash
npm run dev test-openai
```

3. **MCP server connection issues:**
```bash
# Enable verbose logging
DEBUG=mcp-use:* npm run dev test-agent
```

## 🤝 Contributing

### Contribution Workflow

1. **Fork the repository**
2. **Create a feature branch:**
```bash
git checkout -b feature/new-feature
```

3. **Make changes following coding standards**
4. **Add tests for new functionality**
5. **Run the test suite:**
```bash
npm run type-check
npm run lint
npm run test
npm run dev test-agent
```

6. **Commit with descriptive messages:**
```bash
git commit -m "feat: add new MCP server integration"
```

7. **Push and create pull request**

### Commit Message Format

Follow conventional commits:

```
feat: add new feature
fix: resolve bug in agent initialization
docs: update API documentation
test: add integration tests
refactor: improve error handling
```

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Comprehensive error handling
- [ ] Unit tests for new functionality
- [ ] Integration tests where applicable
- [ ] Documentation updates
- [ ] No breaking changes (or properly documented)
- [ ] Performance considerations addressed

## 📋 Release Process

### Version Management

```bash
# Update version
npm version patch|minor|major

# Build and test
npm run build
npm run test

# Publish (when ready)
npm publish
```

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped appropriately
- [ ] Build artifacts verified
- [ ] Security review completed

## 🔒 Security Guidelines

### API Key Management

- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate keys regularly
- Monitor API usage and costs

### Code Security

- Validate all inputs
- Use TypeScript strict mode
- Handle errors gracefully
- Audit dependencies regularly

```bash
# Security audit
npm audit
npm audit fix
```

## 📚 Resources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [mcp-use Library](https://github.com/mcp-use/mcp-use)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vitest Testing Framework](https://vitest.dev/)

### Tools

- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [TypeScript ESLint](https://typescript-eslint.io/) - Linting
- [Prettier](https://prettier.io/) - Code formatting
- [Vitest](https://vitest.dev/) - Testing framework

---

*Last Updated: 2025-08-18*
*Version: 1.1*
*For questions about development, see the [User Guide](./USER_GUIDE.md), [API Reference](./API_REFERENCE.md), or [Health Monitoring Guide](./HEALTH_MONITORING_GUIDE.md)*
