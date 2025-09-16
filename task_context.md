# Project Overview

## 🏗️ Inferred Architecture
- **Pattern:** Next.js 15 with App Router + TypeScript MCP Multi-Agent System
- **Frontend:** React 19 with Tailwind CSS v4, Radix UI components
- **Backend:** Node.js with `mcp-use` library v0.1.15+, OpenAI GPT-4o integration
- **MCP Integration:** Multi-server architecture with HTTP and stdio connections
- **State Management:** React hooks with server-side configuration management
- **Environment:** Windows development environment with cmd shell

## 🛠️ Tech Stack
- **Language:** TypeScript 5.6+ (strict mode enabled)
- **Framework:** Next.js 15.4.6 with React 19.1.0
- **MCP Library:** mcp-use v0.1.17 for MCP client/agent functionality
- **LLM Integration:** LangChain OpenAI v0.6.8 + AI SDK v5.0.15
- **UI Components:** Radix UI + Tailwind CSS v4 + Lucide React icons
- **Development:** tsx, ESLint 9, Turbopack for dev server

---

# Task Analysis for: MCP Servers Connection Issues

## 📜 Scope & Constraints
- **Scope:** Fix MCP server connectivity issues affecting DocFork and Hustle HTTP servers. Focus on environment variable loading, authentication, and connection initialization in the Next.js UI application.
- **Limitations:** 
  - Do not modify the core `mcp-use` library or MCP server configurations
  - Maintain backward compatibility with existing CLI agent configurations
  - Preserve graceful degradation functionality for offline/failed connections
  - Keep existing server management and health monitoring systems intact

## 🧠 Internal Context Analysis

### **Primary Task Files**
- `mcp-agent-ui/src/lib/mcp-chat-service.ts`: Core MCP service initialization and connection handling
- `mcp-agent-ui/.env.local`: Environment variables configuration (contains API keys)
- `mcp-agent-ui/src/lib/mcp-config-service.ts`: Server configuration management
- `mcp-agent-ui/src/hooks/use-mcp-status.ts`: Health status monitoring hook

### **⚠️ Potential Impact Analysis (Dependent Files)**
- `mcp-agent-ui/src/app/api/chat/route.ts`: Chat API endpoint that initializes MCP service
- `mcp-agent-ui/src/app/api/health/route.ts`: Health check endpoint using MCP service
- `mcp-agent-ui/src/hooks/use-mcp-servers.ts`: Server management hook
- `mcp-agent-ui/src/components/settings/ServerEditor.tsx`: UI for server configuration
- `mcp-agent-ui/mcp-config.json`: Server definitions (enabled/disabled states)
- `mcp-agent-ui/mcp-agent.config.json`: Agent configuration sync file
- `src/config/server-manager.ts`: Backend server manager (if used by UI)

## 🔍 Root Cause Analysis

### **Environment Variable Loading Issues**
1. **Next.js Environment Variable Scope**: Variables in `.env.local` are only available server-side by default
2. **Runtime Access Patterns**: `process.env` access in client components vs server components
3. **Variable Validation**: Missing validation for required API keys during initialization

### **MCP Server Configuration Issues**
1. **Server States Mismatch**: 
   - `mcp-config.json`: DocFork enabled, Hustle disabled
   - `mcp-agent.config.json`: DocFork disabled, Hustle enabled
2. **Authentication Format**: Smithery requires both URL parameters and Authorization headers
3. **Connection Type Handling**: HTTP vs stdio server initialization differences

### **Initialization Sequence Problems**
1. **Async Initialization**: MCP service initialization happens on first use, not app startup
2. **Error Propagation**: Connection failures don't prevent service creation but cause runtime errors
3. **Graceful Degradation**: Fallback to LLM-only mode works but connection issues persist

## 🌐 External Research Findings

### **Primary Documentation**
- **Smithery MCP Documentation**: URL parameter authentication with `api_key` and `profile` parameters
- **mcp-use Library**: Configuration patterns for HTTP and stdio MCP servers
- **Next.js Environment Variables**: Server-side vs client-side access patterns

### ✨ **Recommended Supplementary Research**
- **Environment Variable Security**: Next.js patterns for secure API key management
- **MCP Connection Pooling**: Best practices for persistent MCP client connections
- **Health Monitoring**: Implementing robust health checks for MCP servers
- **Error Recovery**: Circuit breaker patterns for MCP connection failures

## 🔧 Specific Issues Identified

### **1. Environment Variable Configuration**
**Problem**: Environment variables are properly loaded in `.env.local` but may not be accessible in all contexts
**Evidence**: 
```typescript
// From mcp-chat-service.ts - server-side access works
const smitheryApiKey = process.env.SMITHERY_API_KEY || 'SMITHERY_API_KEY_REQUIRED';
const hustleApiKey = process.env.HUSTLE_API_KEY || 'HUSTLE_API_KEY_REQUIRED';
```

### **2. Server Configuration Synchronization**
**Problem**: Inconsistent enabled/disabled states across configuration files
**Evidence**:
- `mcp-config.json`: DocFork enabled=true, Hustle enabled=false  
- `mcp-agent.config.json`: DocFork enabled=false, Hustle enabled=true

### **3. MCP Client Initialization**
**Problem**: MCPClient.fromDict() may fail with configuration errors but service continues
**Evidence**:
```typescript
// Graceful degradation in place but connection issues remain
try {
  this.mcpClient = MCPClient.fromDict(mcpConfig);
} catch (configError) {
  // Falls back to empty client - connection still broken
  this.mcpClient = MCPClient.fromDict({ mcpServers: {} });
}
```

### **4. Authentication Format Issues**
**Problem**: Smithery authentication requires specific URL and header format
**Evidence**: Smithery servers expect both URL parameters AND Authorization headers

## ✅ Handoff Complete

This context file contains the comprehensive analysis for fixing MCP server connection issues. The problems are primarily related to:

1. **Configuration Synchronization**: Mismatched server enabled states
2. **Environment Variable Access**: Proper Next.js server-side environment handling  
3. **Authentication Format**: Correct Smithery API authentication implementation
4. **Connection Initialization**: Robust error handling and recovery patterns

The task is **medium complexity** - requires systematic fixes across multiple configuration files and service initialization, but follows established patterns and doesn't require architectural changes.
