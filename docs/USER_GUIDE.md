# 📖 User Guide - MCP Multi-Agent

## Getting Started

The Multiple MCP Servers General Purpose Agent is a TypeScript-based AI agent that connects to multiple Model Context Protocol (MCP) servers simultaneously, providing intelligent server selection and OpenAI integration for natural language processing.

## 🚀 Quick Start - BEAUTIFUL MACOS INTERFACE!

### 🎉 **STUNNING MACOS CHATGPT INTERFACE READY**

**Access the beautiful macOS-style MCP Multi-Agent UI immediately:**

**🌐 Open**: http://localhost:3001/chat
**Status**: ✅ Live with DocFork MCP documentation research capabilities
**Features**: Professional responsive design with HTTP Streamable DocFork MCP integration

### **Instant Usage - No Setup Required**

The application is already running with:
- ✅ **DocFork MCP Server** with HTTP Streamable transport for documentation research
- ✅ **Professional responsive interface** with mobile-first design
- ✅ **Sidebar layout** with conversation history and collapsible navigation
- ✅ **Documentation research capabilities** via DocFork MCP integration
- ✅ **OpenAI GPT-4o integration** with streaming responses
- ✅ **Auto-scroll behavior** and smooth typing animations
- ✅ **Keyboard shortcuts** (Enter to send, Shift+Enter for new lines)
- ✅ **HTTP Streamable transport** with automatic SSE fallback for optimal performance

**Try these documentation research interactions right now:**
```
"Can you help me understand React hooks documentation?"
"Show me the latest Next.js routing documentation"
"What are the best practices for TypeScript interfaces?"
"Find documentation about HTTP streaming in Node.js"
"Research authentication patterns for web applications"
```

### **Alternative: CLI Interface**

For command-line usage:
```bash
# Query the agent directly
npm run cli -- query "What files are in this directory?"

# Check server status
npm run cli -- server list

# View configuration
npm run cli -- config show
```

### **Development Setup (Optional)**

If you want to modify or extend the system:

1. **Prerequisites:**
   - Node.js 18.0.0+
   - OpenAI API key (already configured)

2. **Development server:**
```bash
cd mcp-agent-ui
npm run dev  # Starts on available port
```

3. **Backend development:**
```bash
npm run build  # Build TypeScript backend
npm run cli    # Test CLI interface
```

## 🔧 Configuration

### Environment Setup

The agent uses a comprehensive environment configuration system with validation and type safety. Create a `.env` file in the project root:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI Configuration (Optional)
OPENAI_BASE_URL=https://api.openai.com/v1      # Custom OpenAI endpoint
OPENAI_ORGANIZATION=your_org_id_here           # OpenAI organization ID
OPENAI_MODEL=gpt-4o                            # Model to use (default: gpt-4o)
OPENAI_TEMPERATURE=0.1                         # Response temperature (0-2, default: 0.1)
OPENAI_MAX_TOKENS=4096                         # Maximum tokens per response (default: 4096)
OPENAI_MAX_RETRIES=3                           # Maximum retry attempts (default: 3)
OPENAI_RETRY_DELAY=2000                        # Retry delay in milliseconds (default: 2000)

# Agent Configuration
AGENT_MAX_STEPS=10                             # Maximum steps the agent can take (1-100, default: 10)
AGENT_TIMEOUT=60000                            # Agent timeout in milliseconds (1000-300000, default: 60000)

# Server Manager Configuration
MAX_CONCURRENT_SERVERS=3                       # Maximum concurrent active servers (1-20, default: 3)
SERVER_STARTUP_TIMEOUT=30                      # Server startup timeout in seconds (5-300, default: 30)

# Health Monitoring Configuration (Optional)
SERVER_HEALTH_MONITORING=true                  # Enable health monitoring (default: true)
SERVER_HEALTH_CHECK_INTERVAL=30000             # Health check interval in milliseconds (default: 30000)
SERVER_HEALTH_CHECK_TIMEOUT=5000               # Health check timeout in milliseconds (default: 5000)
SERVER_AUTO_RECONNECT=true                     # Enable automatic reconnection (default: true)
SERVER_RECONNECT_INTERVAL=10000                # Reconnection interval in milliseconds (default: 10000)
SERVER_MAX_RECONNECT_ATTEMPTS=5                # Maximum reconnection attempts (default: 5)

# Advanced Server Manager Configuration (Optional)
SERVER_CONNECTION_POOL_SIZE=5                  # Max connections per server (default: 5)
SERVER_CIRCUIT_BREAKER_THRESHOLD=5             # Failure threshold for circuit breaker (default: 5)
SERVER_CIRCUIT_BREAKER_RECOVERY_TIMEOUT=60000  # Circuit breaker recovery timeout in milliseconds (default: 60000)
SERVER_LOAD_BALANCING_STRATEGY=priority-based  # Strategy: priority-based, least-connections, round-robin, random

# Logging Configuration
LOG_LEVEL=info                                 # Log level: debug, info, warn, error (default: info)
LOG_FORMAT=text                                # Log format: text, json (default: text)
LOG_FILE=./logs/agent.log                      # Optional: Log file path

# Environment Detection
NODE_ENV=development                           # Environment: development, production, test (default: development)
```

### Environment Validation

The agent includes comprehensive environment validation with helpful error messages:

```bash
# Test your environment configuration
npm run dev:test-env
```

This will validate all environment variables and show you exactly what's configured.

### Server Configuration

The agent comes with pre-configured MCP servers that are disabled by default. To enable servers, modify the configuration in your code:

```typescript
import { loadConfig } from '@/config';

const config = loadConfig({
  servers: [
    {
      id: 'filesystem',
      name: 'File System Server',
      connectionType: 'stdio',
      command: 'npx',
      args: ['@modelcontextprotocol/server-filesystem', '/your/workspace/path'],
      enabled: true,  // Enable the server
      priority: 10,
      tags: ['files', 'io'],
      retry: { maxAttempts: 3, delayMs: 1000 }
    }
  ]
});
```

## 🤖 Using the Agent

### Basic Usage

```typescript
import { loadConfig } from '@/config';
import { getOpenAIClient } from '@/llm';
import { createMultiServerAgent } from '@/agent';

async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    
    // Create OpenAI client
    const openaiClient = await getOpenAIClient();
    
    // Create and initialize agent
    const agent = await createMultiServerAgent(config, openaiClient);
    
    // Run a query
    const result = await agent.run('What tools do you have access to?');
    console.log('Response:', result.response);
    console.log('Execution time:', result.executionTime, 'ms');
    
    // Cleanup
    await agent.shutdown();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

### Streaming Responses

For real-time responses, use the streaming mode:

```typescript
const agent = await createMultiServerAgent(config, openaiClient);

await agent.runStream(
  'Count from 1 to 10 and explain each number',
  { maxSteps: 15, timeout: 30000 },
  (chunk) => {
    // Handle each chunk as it arrives
    process.stdout.write(chunk);
  }
);
```

### Server Information

Get information about available servers:

```typescript
const serverInfo = await agent.getServerInfo();
console.log(`Total servers: ${serverInfo.totalServers}`);
console.log(`Enabled servers: ${serverInfo.enabledServers}`);

serverInfo.servers.forEach(server => {
  console.log(`${server.id}: ${server.name} (${server.enabled ? 'enabled' : 'disabled'})`);
});
```

### Connection Testing

Test connections to all enabled servers:

```typescript
const connectionResults = await agent.testConnections();

console.log('Successful connections:', connectionResults.successful);
connectionResults.failed.forEach(({ serverId, error }) => {
  console.log(`Failed: ${serverId} - ${error}`);
});
```

### Server Manager Configuration

The agent includes an advanced server manager for performance optimization and reliability. You can configure it for different use cases:

#### High Performance Configuration

For maximum throughput with multiple servers:

```typescript
import { loadConfig } from '@/config';

const config = loadConfig({
  serverManager: {
    enabled: true,
    maxConcurrentServers: 10,
    serverStartupTimeout: 5,
    healthMonitoring: true,
    healthCheckInterval: 5000,
    autoReconnect: true,
  }
});
```

#### Production Configuration

For production environments with reliability focus:

```typescript
const config = loadConfig({
  serverManager: {
    enabled: true,
    maxConcurrentServers: 3,
    serverStartupTimeout: 30,
    healthMonitoring: true,
    healthCheckInterval: 30000,
    autoReconnect: true,
  }
});
```

#### Advanced Server Manager Features

```typescript
import { createServerManager } from '@/config/server-manager';

const serverManager = createServerManager({
  maxConcurrentServers: 5,
  connectionPool: {
    maxConnectionsPerServer: 10,
    idleTimeout: 600000,      // 10 minutes
    keepAliveInterval: 60000, // 1 minute
  },
  loadBalancing: {
    strategy: 'least-connections', // or 'priority-based', 'round-robin', 'random'
  },
  circuitBreaker: {
    failureThreshold: 3,
    recoveryTimeout: 20000,   // 20 seconds
    halfOpenMaxCalls: 2,
  },
  resourceManagement: {
    maxMemoryPerServer: 1024, // 1GB
    cpuThreshold: 0.9,        // 90%
    gcInterval: 30000,        // 30 seconds
  },
});
```

### Server Health Monitoring

The agent includes comprehensive health monitoring with automatic reconnection:

```typescript
// Check if health monitoring is active
const isMonitoring = agent.isHealthMonitoringActive();
console.log(`Health monitoring active: ${isMonitoring}`);

// Get detailed health information
const serverHealth = agent.getServerHealth();
serverHealth.forEach(health => {
  console.log(`Server: ${health.serverId}`);
  console.log(`  Status: ${health.status}`);
  console.log(`  Consecutive Failures: ${health.consecutiveFailures}`);
  console.log(`  Average Response Time: ${health.averageResponseTime}ms`);
  console.log(`  Error Rate: ${(health.errorRate * 100).toFixed(2)}%`);
  console.log(`  Last Health Check: ${health.lastHealthCheck}`);
  console.log(`  Circuit Breaker: ${health.isCircuitBreakerOpen ? 'OPEN' : 'CLOSED'}`);
  if (health.lastError) {
    console.log(`  Last Error: ${health.lastError}`);
  }
});

// Get health summary
const healthSummary = agent.getHealthSummary();
console.log('Health Summary:', {
  totalServers: healthSummary.totalServers,
  healthyServers: healthSummary.healthyServers,
  unhealthyServers: healthSummary.unhealthyServers,
  overallStatus: healthSummary.overallStatus,
  averageResponseTime: healthSummary.averageResponseTime
});

// Force health check for a specific server
const healthResult = await agent.forceHealthCheck('filesystem');
if (healthResult) {
  console.log(`Forced health check result: ${healthResult.status}`);
}

// Manually trigger reconnection
const reconnectSuccess = await agent.reconnectServer('filesystem');
console.log(`Reconnection ${reconnectSuccess ? 'successful' : 'failed'}`);
```

### Server Metrics and Monitoring

Get real-time server performance metrics:

```typescript
// Get server metrics
const metrics = agent.getServerMetrics();
metrics.forEach(metric => {
  console.log(`Server: ${metric.serverId}`);
  console.log(`  Status: ${metric.status}`);
  console.log(`  Connections: ${metric.connectionCount}`);
  console.log(`  Response Time: ${metric.averageResponseTime}ms`);
  console.log(`  Error Rate: ${(metric.errorRate * 100).toFixed(2)}%`);
  console.log(`  Memory Usage: ${metric.memoryUsage}MB`);
  console.log(`  Last Health Check: ${metric.lastHealthCheck}`);
});

// Get server manager configuration
const serverManagerConfig = agent.getServerManagerConfig();
console.log('Server Manager Config:', {
  enabled: serverManagerConfig.enabled,
  maxConcurrentServers: serverManagerConfig.maxConcurrentServers,
  loadBalancing: serverManagerConfig.loadBalancing?.strategy,
});
```

## 🛠️ CLI Interface ✅ **NEW - PRODUCTION READY!**

The project now includes a complete, production-ready CLI interface for interacting with the multi-server agent:

### CLI Installation & Setup

```bash
# Initialize CLI configuration
npm run cli -- config init

# Validate configuration
npm run cli -- config validate
```

### Query Commands ✅ **NEW!**

```bash
# Basic query
npm run cli -- query "What tools do you have access to?"

# Streaming query with real-time output
npm run cli -- query "Tell me a story about AI" --stream

# Query with JSON output
npm run cli -- query "List available servers" --format json

# Query with custom options
npm run cli -- query "Complex task" --max-steps 15 --timeout 60000
```

### Server Management ✅ **NEW!**

```bash
# List all configured servers
npm run cli -- server list

# List only enabled servers
npm run cli -- server list --enabled-only

# Check server status
npm run cli -- server status

# Get detailed server information
npm run cli -- server info --server filesystem

# Server info in JSON format
npm run cli -- server info --format json
```

### Configuration Management ✅ **NEW!**

```bash
# Show current configuration
npm run cli -- config show

# Show configuration in JSON format
npm run cli -- config show --format json

# Validate configuration
npm run cli -- config validate

# Initialize new configuration (with force overwrite)
npm run cli -- config init --force
```

### CLI Help System ✅ **NEW!**

```bash
# Global help
npm run cli -- --help

# Command-specific help
npm run cli -- query --help
npm run cli -- server --help
npm run cli -- config --help

# Subcommand help
npm run cli -- server list --help
```

### Advanced CLI Options ✅ **NEW!**

```bash
# Verbose mode (detailed output)
npm run cli -- query "test" --verbose

# Quiet mode (minimal output)
npm run cli -- query "test" --quiet

# Disable colored output
npm run cli -- query "test" --no-color
```

### Development Commands

```bash
# Test OpenAI integration
npm run dev test-openai

# Test agent with minimal configuration (no external servers)
npm run dev test-agent --minimal

# Test agent with full configuration
npm run dev test-agent
```

### Development Commands

```bash
# Type checking
npm run type-check

# Build the project
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Clean build artifacts
npm run clean
```

## 🔌 MCP Server Integration

### Supported Server Types

The agent supports multiple MCP server connection types:

1. **stdio**: Process-based communication (most common)
2. **HTTP**: RESTful API communication
3. **WebSocket**: Real-time bidirectional communication
4. **SSE**: Server-Sent Events for streaming

### Popular MCP Servers

Here are some popular MCP servers you can integrate:

#### File System Server
```typescript
{
  id: 'filesystem',
  name: 'File System Server',
  connectionType: 'stdio',
  command: 'npx',
  args: ['@modelcontextprotocol/server-filesystem', '/workspace'],
  enabled: true
}
```

#### Web Browser Server (Playwright)
```typescript
{
  id: 'browser',
  name: 'Web Browser Server',
  connectionType: 'stdio',
  command: 'npx',
  args: ['@playwright/mcp@latest'],
  env: { DISPLAY: ':1' },
  enabled: true
}
```

#### SQLite Database Server
```typescript
{
  id: 'sqlite',
  name: 'SQLite Server',
  connectionType: 'stdio',
  command: 'npx',
  args: ['@modelcontextprotocol/server-sqlite', '/path/to/database.db'],
  enabled: true
}
```

## 🎯 Common Use Cases

### 1. File Operations with AI

```typescript
// Enable filesystem server and ask the agent to work with files
const result = await agent.run(
  'List all TypeScript files in the src directory and summarize their purposes'
);
```

### 2. Web Research

```typescript
// Enable browser server for web automation
const result = await agent.run(
  'Search for the latest TypeScript features and create a summary'
);
```

### 3. Database Queries

```typescript
// Enable SQLite server for database operations
const result = await agent.run(
  'Show me the schema of the users table and count how many users we have'
);
```

### 4. Multi-Server Workflows

```typescript
// Use multiple servers in a single query
const result = await agent.run(
  'Search the web for Node.js best practices, then save the findings to a file called best-practices.md'
);
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Environment Configuration Errors

**Missing API Key:**
```
Environment configuration error: OpenAI API Key is required but not provided
  Variable: OPENAI_API_KEY
  Suggestion: Get your API key from https://platform.openai.com/api-keys
```
**Solution**: Add your OpenAI API key to the `.env` file.

**Invalid Numeric Values:**
```
Environment configuration error: Invalid numeric value: "invalid"
  Variable: OPENAI_TEMPERATURE
  Suggestion: Provide a valid number (default: 0.1)
```
**Solution**: Check that numeric environment variables contain valid numbers within the specified ranges.

**Invalid Enum Values:**
```
Environment configuration error: Invalid value: "invalid"
  Variable: LOG_LEVEL
  Suggestion: Valid values: debug, info, warn, error (default: info)
```
**Solution**: Use only the allowed values for enum-type environment variables.

#### 2. Server Connection Failed
```
❌ filesystem: Connection failed - spawn npx ENOENT
```
**Solution**: Ensure the MCP server package is installed or the command path is correct.

#### 3. TypeScript Compilation Errors
```
Error: Cannot find module '@/config'
```
**Solution**: Run `npm run build` to compile TypeScript files.

### Debug Mode

Enable verbose logging for debugging:

```typescript
const config = loadConfig({
  agent: { verbose: true },
  logging: { level: 'debug' }
});
```

### Testing Individual Components

Test components separately:

```bash
# Test only OpenAI integration
npm run dev test-openai

# Test only agent without external servers
npm run dev test-agent --minimal
```

## 📊 Performance Tips

### 1. Server Manager Optimization

The agent uses a server manager for performance optimization. Ensure it's enabled:

```typescript
const config = loadConfig({
  serverManager: {
    enabled: true,
    maxConcurrentServers: 3,
    healthMonitoring: true
  }
});
```

### 2. Connection Pooling

The agent automatically pools connections to MCP servers. You can configure timeouts:

```typescript
const config = loadConfig({
  serverManager: {
    serverStartupTimeout: 30,
    healthCheckInterval: 30000
  }
});
```

### 3. Response Optimization

For faster responses, reduce the maximum steps:

```typescript
const result = await agent.run('Simple query', {
  maxSteps: 5,
  timeout: 15000
});
```

## 🔒 Security Considerations

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables for sensitive configuration
- Rotate API keys regularly

### 2. Server Security
- Only enable trusted MCP servers
- Validate server configurations before deployment
- Monitor server connections and logs

### 3. Input Validation
- The agent automatically validates inputs
- Be cautious with file system access permissions
- Review server capabilities before enabling

## 🚀 Next Steps

### Phase 3 Features ✅ **100% COMPLETE!**
- ✅ **Server health monitoring and auto-reconnection**: Comprehensive health monitoring with circuit breaker pattern
- ✅ **Enhanced CLI interface**: Complete production-ready CLI with query, server, and config commands ✅ **COMPLETED TODAY!**
- ✅ **Advanced error handling and recovery**: Comprehensive error management with proper exit codes ✅ **COMPLETED!**

### Phase 4 Features (Planned)
- Web-based dashboard
- Real-time monitoring interface
- Plugin system for custom tools
- Advanced configuration GUI

## 📚 Additional Resources

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Health Monitoring Guide](./HEALTH_MONITORING_GUIDE.md) - Server health monitoring and troubleshooting
- [Architecture Guide](./ARCHITECTURE.md) - Technical architecture details
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Contributing and development setup
- [Project Progress](./PROJECT_PROGRESS.md) - Current status and roadmap
- [Product Brief](./PRODUCT_BRIEF.md) - Project overview and goals
- [Bug Log](./BUG_LOG.md) - Known issues and resolutions

## 🤝 Support

For issues and questions:
1. Check the [Bug Log](./BUG_LOG.md) for known issues
2. Review the [Error Handling Completion Handoff](./ERROR_HANDLING_COMPLETION_HANDOFF.md) for error handling and recovery ✅ **NEW**
3. Review the [Health Monitoring Guide](./HEALTH_MONITORING_GUIDE.md) for server health issues
4. Review the [API Reference](./API_REFERENCE.md) for usage details
5. Test with minimal configuration to isolate problems
6. Enable debug logging for detailed error information
7. Use `npm run test:error-handling` to test error handling system ✅ **NEW**

---

*Last Updated: 2025-08-18*
*Version: 1.3*
*Happy coding with MCP Multi-Agent! 🚀*
