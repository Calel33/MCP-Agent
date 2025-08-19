# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 🏗️ Project Overview

This is a **Multiple MCP Servers General Purpose Agent** - a TypeScript-based AI system that connects to multiple Model Context Protocol (MCP) servers simultaneously. The project consists of two main components:

1. **Backend Multi-Agent System** (`src/`) - TypeScript agent with MCP server integration
2. **Frontend macOS-style UI** (`mcp-agent-ui/`) - Next.js 15 + React 19 ChatGPT-style interface

## 🚀 Common Development Commands

### Backend Development
```bash
# Build the TypeScript backend
npm run build

# Start development mode
npm run dev

# CLI interface
npm run cli -- query "What tools do you have access to?"
npm run cli -- server list
npm run cli -- config show

# Testing
npm test                         # Run all tests
npm run test:watch              # Watch mode
npm run type-check              # TypeScript type checking
npm run lint                    # ESLint
npm run lint:fix               # Fix linting issues

# Specific component testing
npm run dev test-openai         # Test OpenAI integration
npm run dev test-agent          # Test full agent
npm run dev test-agent --minimal # Minimal agent test
npm run test:health-monitoring  # Health monitoring tests
npm run test:error-handling     # Error handling tests
npm run test:cli               # CLI test suite
```

### Frontend Development (macOS UI)
```bash
cd mcp-agent-ui

# Start development server (with Turbopack)
npm run dev    # Available at http://localhost:3000/chat

# Production build
npm run build
npm run start

# Linting
npm run lint
```

### Environment Setup
```bash
# Test environment configuration
npm run dev:test-env

# Test integration
npm run dev:test-integration
```

## 🎯 Architecture Overview

### High-Level Design Principles
- **Modularity**: Clean separation with dedicated modules (agent, config, llm, cli, monitoring, utils)
- **Type Safety**: Full TypeScript implementation with strict mode
- **Error Recovery**: Comprehensive error handling with retry, circuit breaker, and graceful degradation
- **Multi-Server Support**: Concurrent MCP server connections with intelligent selection
- **Health Monitoring**: Real-time server health checks with automatic reconnection

### Core Components Architecture

**Backend (`src/`)**:
- `agent/` - MultiServerAgent class with MCPAgent integration
- `config/` - Environment configuration, server management, client factory
- `llm/` - OpenAI client wrapper with caching and health checks  
- `cli/` - Complete CLI interface with Commander.js (query, server, config commands)
- `monitoring/` - Health monitoring with circuit breaker pattern
- `utils/` - Error handling, retry mechanisms, graceful degradation

**Frontend (`mcp-agent-ui/`)**:
- `app/chat/` - Main macOS-style ChatGPT interface
- `app/api/chat/` - Streaming API route with MCP integration
- `components/` - Custom macOS UI components with traffic light controls
- `hooks/` - React hooks for MCP status monitoring

### Key Design Patterns

**Factory Pattern**: Used for LLM clients and MCP client creation
```typescript
// LLMFactory provides singleton client management
const llmFactory = LLMFactory.getInstance();
const client = await llmFactory.getClient(config);
```

**Error Recovery Pattern**: Comprehensive error handling throughout
```typescript
const result = await this.errorRecovery.executeWithRecovery(
  async () => { /* operation */ },
  { operationName: 'operation_name', isCritical: true }
);
```

**Server Manager Pattern**: Advanced server lifecycle management
```typescript
const serverManager = createServerManager(config.serverManager);
await serverManager.initialize(servers, clientFactory);
```

## 🔧 Configuration System

The project uses a comprehensive configuration system with environment validation:

### Environment Variables (`.env`)
- `OPENAI_API_KEY` (required) - OpenAI API key
- `OPENAI_MODEL` (optional, default: gpt-4o) - Model to use
- `MAX_CONCURRENT_SERVERS` (optional, default: 3) - Concurrent server limit
- `LOG_LEVEL` (optional, default: info) - Logging level (debug|info|warn|error)

### MCP Configuration (`mcp-config.json`)
- Server definitions with connection types (stdio, http, websocket)
- Health monitoring settings
- Server manager configuration with load balancing strategies
- Retry and timeout configurations

### Key Configuration Files
- `src/config/env.ts` - Environment validation with TypeScript types
- `src/config/server-manager.ts` - Advanced server management features
- `src/config/client-factory.ts` - MCP client creation and management
- `mcp-config.json` - Main configuration file for servers and settings

## 🔌 MCP Integration Architecture

### Supported Server Types
- **Filesystem Server**: File operations (`@modelcontextprotocol/server-filesystem`)
- **Browser Server**: Web scraping (`@modelcontextprotocol/server-puppeteer`) 
- **SQLite Server**: Database operations (`@modelcontextprotocol/server-sqlite`)
- **Custom HTTP/WebSocket servers**: Extensible server support

### Connection Management
- **Connection Pooling**: Configurable max connections per server
- **Health Monitoring**: Real-time health checks with circuit breaker
- **Auto Reconnection**: Exponential backoff with jitter
- **Load Balancing**: Priority-based, least-connections, round-robin strategies

### Server Configuration Pattern
```typescript
{
  "id": "filesystem",
  "connectionType": "stdio", 
  "command": "npx",
  "args": ["@modelcontextprotocol/server-filesystem", "/path/to/directory"],
  "enabled": true,
  "priority": 8,
  "tags": ["filesystem", "files", "io"],
  "retry": { "maxAttempts": 3, "delayMs": 1000 }
}
```

## 🛡️ Error Handling & Resilience

The project implements comprehensive error handling:

### Error Categories
- **MCPError**: Base class for MCP-related errors
- **MCPConnectionError**: Network/connection failures  
- **MCPServerError**: Server crashes or invalid responses
- **MCPToolExecutionError**: Tool execution failures
- **ConfigValidationError**: Configuration validation errors

### Recovery Mechanisms
- **Retry with Exponential Backoff**: Configurable retry attempts with jitter
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Graceful Degradation**: Fallback strategies (cached responses, simplified responses)
- **Error Recovery Orchestrator**: Coordinates all recovery systems

### Error Handling Pattern
```typescript
try {
  const result = await this.errorRecovery.executeWithRecovery(operation, context);
} catch (error) {
  if (error instanceof MCPConnectionError) {
    // Handle connection-specific errors
  }
  // Comprehensive error logging and correlation
}
```

## 🖥️ CLI Development

The CLI uses Commander.js with a modular structure:

### Command Structure
- `query|q <question>` - Send queries to the agent (supports streaming)
- `server|srv list|status|info` - Manage MCP servers
- `config|cfg init|show|validate` - Configuration management

### CLI Development Pattern
```typescript
// Adding new commands in src/cli/commands/
export function createNewCommand(): Command {
  return new Command('new-command')
    .description('Command description')
    .option('-o, --option <value>', 'Option description')
    .action(async (options: any) => {
      await handleNewCommand(options);
    });
}
```

## 🎨 UI Development (macOS Interface)

### Technology Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: Custom macOS-style components with traffic light controls
- **Styling**: Tailwind CSS v4 with custom design system
- **Real-time**: Streaming responses with `@ai-sdk/react`
- **MCP Integration**: `mcp-use` library for server communication

### Key UI Components
- `app/chat/page.tsx` - Main ChatGPT-style interface
- `app/api/chat/route.ts` - Streaming API with MCP integration
- Traffic light window controls for authentic macOS feel
- Auto-resizing textarea with keyboard shortcuts (Enter/Shift+Enter)

### UI Development Pattern
```typescript
// Streaming integration pattern
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});
const reader = response.body?.getReader();
// Handle streaming response word-by-word
```

## 🔍 Testing Strategy

### Test Categories
- **Unit Tests**: Individual component testing with Vitest
- **Integration Tests**: Component interaction testing
- **CLI Tests**: Comprehensive CLI command testing (`test-cli.sh`)
- **Health Monitoring Tests**: Server health and reconnection testing
- **Error Handling Tests**: Recovery mechanism validation

### Testing Commands
```bash
npm test                        # All tests
npm run test:watch             # Watch mode
npm run dev test-agent --minimal  # Quick agent test
npm run test:health-monitoring  # Health system tests
npm run test:error-handling     # Error recovery tests
./src/cli/test-cli.sh          # CLI test suite
```

## 🚀 Development Workflow

### Starting Development
1. **Environment Setup**: Copy `.env.example` to `.env` and add OpenAI API key
2. **Install Dependencies**: `npm install` in both root and `mcp-agent-ui/`
3. **Backend Development**: `npm run dev` for agent development
4. **Frontend Development**: `cd mcp-agent-ui && npm run dev` for UI
5. **Testing**: Use the comprehensive test suite for validation

### Code Standards
- **TypeScript Strict Mode**: Full type safety with strict configuration
- **Error Handling**: Always use comprehensive error handling patterns
- **Path Aliases**: Use `@/config`, `@/llm`, etc. for imports
- **Documentation**: JSDoc comments for all public APIs
- **Testing**: Write tests for all new functionality

### Build and Deployment
```bash
# Backend build
npm run build

# Frontend build  
cd mcp-agent-ui && npm run build

# Production start
npm start  # Backend
cd mcp-agent-ui && npm start  # Frontend
```

## 🔐 Security Considerations

- **API Key Management**: Never commit API keys; use environment variables
- **Input Validation**: All inputs validated with TypeScript types and runtime checks  
- **Error Messages**: Sensitive information filtered from error responses
- **Audit Dependencies**: Regular `npm audit` for security vulnerabilities
- **Configuration Validation**: Comprehensive validation prevents misconfigurations

## 📊 Performance Optimization

### Backend Optimizations
- **Connection Pooling**: Reuse MCP connections efficiently
- **Client Caching**: OpenAI clients cached with health checks
- **Concurrent Processing**: Parallel server operations where possible
- **Resource Management**: Memory and CPU monitoring with thresholds

### Frontend Optimizations  
- **Turbopack**: Fast development builds with Next.js 15
- **Streaming**: Real-time response streaming reduces perceived latency
- **Auto-scroll**: Smooth animations with optimized DOM updates
- **Component Optimization**: React 19 features for better performance

## 🔮 Extension Points

### Adding New MCP Servers
1. Add server configuration to `mcp-config.json`
2. Update server tags and priorities
3. Test integration with `npm run cli -- server status`

### Adding New CLI Commands  
1. Create command file in `src/cli/commands/`
2. Register in `src/cli/index.ts`
3. Add tests to CLI test suite
4. Update help documentation

### Extending Error Handling
1. Add new error types in `src/utils/errors.ts`
2. Update error classification in `src/utils/error-handler.ts`
3. Add recovery strategies in `src/utils/graceful-degradation.ts`
4. Test with comprehensive error scenarios

## 📁 Important File Locations

- **Main Entry**: `src/index.ts` (backend), `mcp-agent-ui/src/app/page.tsx` (frontend)
- **Configuration**: `mcp-config.json`, `src/config/`
- **Agent Implementation**: `src/agent/multi-server-agent.ts`
- **CLI Interface**: `src/cli/index.ts`
- **Error Handling**: `src/utils/`
- **UI Components**: `mcp-agent-ui/src/components/`
- **API Routes**: `mcp-agent-ui/src/app/api/`
- **Documentation**: `docs/` directory with comprehensive guides

This project demonstrates production-ready patterns for multi-server MCP integration with comprehensive error handling, health monitoring, and a beautiful user interface.
