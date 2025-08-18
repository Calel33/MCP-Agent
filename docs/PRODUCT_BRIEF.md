# Multiple MCP Servers General Purpose Agent - Product Brief

## 1. Project Overview / Description

An AI agent that connects to multiple MCP servers using the **mcp-use TypeScript library**. The agent can automatically choose the right server for each task, giving it access to many different tools and capabilities in one place.

## 2. Target Audience

- **Developers** who want to build AI agents with access to multiple tools
- **Teams** needing automation across different systems and services
- **Anyone** who wants a single AI agent that can handle diverse tasks

## 3. Primary Benefits / Features

- **Multiple MCP Servers**: Connect to many different MCP servers at once
- **Smart Server Selection**: Automatically picks the right server for each task
- **Production-Ready CLI**: Complete command-line interface for queries, server management, and configuration ✅ **NEW!**
- **OpenAI Integration**: Uses OpenAI models with streaming support for natural language processing
- **TypeScript**: Full type safety and better developer experience
- **Easy Setup**: Simple configuration and installation with automated setup
- **Comprehensive Testing**: Full test suite with 25+ test cases and validation
- **Advanced Logging**: Multi-level logging with verbose/quiet modes and colored output

## 4. High-Level Tech/Architecture

- **Language**: TypeScript/Node.js
- **Core Library**: mcp-use TypeScript library
- **LLM Provider**: OpenAI (GPT-4)
- **MCP Servers**: Multiple servers for different tools (file system, web browser, databases, etc.)
- **Communication**: HTTP/SSE connections to MCP servers
