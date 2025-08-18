# 🚀 Multiple MCP Servers General Purpose Agent

A TypeScript-based AI agent that connects to multiple MCP (Model Context Protocol) servers using the mcp-use library, with intelligent server selection and OpenAI integration for natural language processing.

## ✨ Features

- **Multi-Server Support**: Connect to multiple MCP servers concurrently
- **Advanced Server Manager**: Performance optimization with connection pooling and load balancing
- **Intelligent Server Selection**: Automatic server selection based on task requirements and load
- **OpenAI Integration**: GPT-4 integration with AI SDK for natural language processing
- **TypeScript**: Full type safety and modern TypeScript features
- **Production-Ready CLI**: Complete command-line interface with query, server, and config commands ✅ **NEW!**
- **Health Monitoring**: Real-time server health checks and automatic reconnection
- **Circuit Breaker**: Fault tolerance with graceful degradation
- **Performance Metrics**: Real-time monitoring of server performance and resource usage
- **Error Handling**: Robust error handling and recovery mechanisms

## 🛠️ Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- OpenAI API key

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/user/mcp-multi-agent.git
cd mcp-multi-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## 🚀 Quick Start

### Development Mode
```bash
npm run dev
```

### Build and Run
```bash
npm run build
npm start
```

### CLI Interface ✅ **NEW!**
```bash
# Initialize configuration
npm run cli -- config init

# Query the agent
npm run cli -- query "What tools do you have access to?"

# Stream responses in real-time
npm run cli -- query "Tell me a story" --stream

# Manage servers
npm run cli -- server list
npm run cli -- server status

# Get help
npm run cli -- --help
npm run cli -- query --help
```

### Interactive Chat Mode (Coming Soon)
```bash
npm run dev -- --chat
```

## 📁 Project Structure

```
src/
├── agent/              # Core agent implementation
├── config/             # Configuration files
├── llm/               # OpenAI LLM integration
├── cli/               # Command-line interface
├── monitoring/        # Server health monitoring
├── utils/             # Utility functions
└── index.ts           # Main entry point
```

## ⚙️ Configuration

### Environment Configuration

The agent uses a comprehensive environment configuration system with validation:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (with defaults)
OPENAI_MODEL=gpt-4o                    # Model to use
OPENAI_TEMPERATURE=0.1                 # Response temperature (0-2)
AGENT_MAX_STEPS=10                     # Maximum agent steps (1-100)
AGENT_TIMEOUT=60000                    # Timeout in milliseconds
MAX_CONCURRENT_SERVERS=3               # Concurrent MCP servers (1-20)
LOG_LEVEL=info                         # Logging level
```

### Server Configuration

The agent supports multiple MCP servers with flexible configuration:

```typescript
// Example server configuration
const servers = [
  {
    name: "filesystem",
    type: "http",
    url: "http://localhost:3001"
  },
  {
    name: "browser",
    type: "websocket",
    url: "ws://localhost:3002"
  }
];
```

### Configuration Testing

Test your configuration:

```bash
# Test environment configuration
npm run dev:test-env

# Test agent with configuration
npm run dev test-agent --minimal
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Yes |
| `MAX_CONCURRENT_SERVERS` | Maximum concurrent servers (default: 3) | No |
| `SERVER_TIMEOUT` | Server connection timeout in ms (default: 5000) | No |

## 📚 Usage Examples

### Basic Usage
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
  const result = await agent.run("What tools do you have access to?");
  console.log(result.response);

  // Cleanup
  await agent.shutdown();
}
```

### Streaming Responses
```typescript
await agent.runStream(
  "Count from 1 to 5 and explain each step",
  { maxSteps: 10 },
  (chunk) => process.stdout.write(chunk)
);
```

### Testing
```bash
# Test OpenAI integration
npm run dev test-openai

# Test agent (minimal configuration)
npm run dev test-agent --minimal

# Test agent (full configuration)
npm run dev test-agent
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📚 Documentation

- **[User Guide](./docs/USER_GUIDE.md)** - Complete setup and usage guide
- **[API Reference](./docs/API_REFERENCE.md)** - Comprehensive API documentation
- **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)** - Contributing and development setup
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Technical architecture details
- **[Project Progress](./docs/PROJECT_PROGRESS.md)** - Current status and roadmap
- **[Product Brief](./docs/PRODUCT_BRIEF.md)** - Project overview and goals
- **[Document Rules](./docs/DOCUMENT_RULES.md)** - Agent workflow and documentation standards
- **[Universal Document Rules](./docs/UNIVERSAL_DOCUMENT_RULES.md)** - Universal rules and session management for any project

## 🔗 External Links

- [mcp-use Documentation](https://docs.mcp-use.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 🐛 Issues & Support

If you encounter any issues:
1. Check the [Bug Log](./docs/BUG_LOG.md) for known issues
2. Review the [User Guide](./docs/USER_GUIDE.md) for troubleshooting
3. Report new issues on [GitHub Issues](https://github.com/user/mcp-multi-agent/issues)
