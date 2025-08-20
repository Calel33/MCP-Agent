# Feature: Add DocFork MCP Server to Multi-Server Agent System

## Persona & Stack
- **Persona**: Senior TypeScript Developer specializing in MCP (Model Context Protocol) integration
- **Frameworks**: Node.js, Next.js 15, React 19
- **Languages**: TypeScript, JavaScript
- **Tools**: MCP-Use, Smithery CLI, LangChain
- **Architecture**: Multi-server MCP agent with backend CLI and frontend UI

## Goal
Integrate DocFork MCP server into the existing multi-server agent system to provide documentation and library research capabilities alongside the current Playwright MCP server. The integration should be additive, preserving all existing functionality while extending the agent's capabilities.

## Scope & Constraints
- **Scope**: Add DocFork server configuration to both backend (`mcp-agent.config.json`, `src/config/loader.ts`) and frontend (`mcp-agent-ui/src/lib/mcp-chat-service.ts`)
- **Limitations**: Do NOT remove or modify existing Playwright MCP server configuration
- **Connection Type**: HTTP (as confirmed by user)
- **Approach**: Additive integration only

## Context
- **Code Injection**: 
  - `@file mcp-agent.config.json` - Current backend configuration
  - `@file mcp-agent-ui/src/lib/mcp-chat-service.ts` - Frontend MCP service
  - `@file src/config/loader.ts` - Backend server loader
- **Memory Recall**: Recall and reference any relevant memories about MCP server integration patterns, Playwright configuration, and multi-server setup to ensure consistency with existing architecture.
- **Configuration Format**: 
  ```json
  {
    "mcpServers": {
      "mcp": {
        "command": "cmd",
        "args": ["/c", "npx", "-y", "@smithery/cli@latest", "run", "@docfork/mcp", "--key", "9c441b5c-510a-41cd-a242-f77baa272f2c"]
      }
    }
  }
  ```

## Plan
1. **Research Phase**: 
   - Research mcp-use connection types and configuration patterns
   - Examine current MCP server integration architecture
   - Understand how to properly add servers to existing multi-server setup

2. **Backend Integration**:
   - Add DocFork server configuration to `mcp-agent.config.json`
   - Update `src/config/loader.ts` if needed for server loading
   - Ensure proper HTTP connection type configuration

3. **Frontend Integration**:
   - Add DocFork server to `mcp-agent-ui/src/lib/mcp-chat-service.ts`
   - Update MCPClient.fromDict() configuration
   - Maintain existing Playwright server alongside new DocFork server

4. **Validation**:
   - Verify both servers can run simultaneously
   - Test that existing Playwright functionality remains intact
   - Confirm DocFork server provides expected documentation capabilities

## Requirements
- **DocFork Server Configuration**:
  - Server ID: `docfork-mcp` or similar descriptive identifier
  - Connection type: HTTP
  - Command structure: Use provided Smithery CLI command
  - Priority and timeout settings appropriate for documentation queries
  - Tags: Include "documentation", "research", "libraries"

- **Integration Requirements**:
  - Must work alongside existing Playwright MCP server
  - Both backend and frontend should have access to DocFork capabilities
  - Preserve all existing server configurations and functionality
  - Follow established patterns from current MCP server setup

- **Configuration Consistency**:
  - Use same configuration structure as existing servers
  - Maintain consistent naming conventions
  - Apply appropriate error handling and retry logic

## External Libraries
- [mcp-use](https://github.com/modelcontextprotocol/mcp-use) – MCP client library for TypeScript
- [Smithery CLI](https://smithery.ai/) – CLI tool for running MCP servers
- [DocFork MCP](https://github.com/docfork/mcp) – Documentation and library research MCP server

## Verification & Output
- **Output Expectation**: 
  - Updated `mcp-agent.config.json` with DocFork server in servers array
  - Updated `mcp-agent-ui/src/lib/mcp-chat-service.ts` with DocFork server in mcpServers object
  - Any necessary updates to `src/config/loader.ts` for server loading
  - Maintain all existing file structures and naming conventions

- **Verification Plan**: 
  - Test backend agent can connect to both Playwright and DocFork servers
  - Test frontend UI can access both server capabilities
  - Verify existing Playwright functionality remains unchanged
  - Test DocFork server responds to documentation queries
  - Run existing tests to ensure no regressions

---

**Created by**: Clarity Agent + PAV2 Agent collaboration
**Date**: 2025-08-20
**Purpose**: Implementation-ready prompt for adding DocFork MCP server to multi-server agent system
