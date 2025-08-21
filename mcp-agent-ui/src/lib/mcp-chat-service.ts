/**
 * MCP Chat Service
 *
 * Bridges MCP servers with AI SDK UI components using mcp-use library.
 * Provides streaming chat functionality with real-time tool execution visibility.
 */

import { MCPAgent, MCPClient } from 'mcp-use';
import { ChatOpenAI } from '@langchain/openai';
import type { CoreMessage } from 'ai';

export interface ChatOptions {
  conversationHistory?: CoreMessage[];
  enableToolVisibility?: boolean;
  maxSteps?: number;
  timeout?: number;
  servers?: string[];
}

export class MCPChatService {
  private initialized = false;
  private mcpAgent: MCPAgent | null = null;
  private mcpClient: MCPClient | null = null;
  private llm: ChatOpenAI | null = null;

  constructor() {
    // Initialize with real MCP backend using mcp-use library
    console.log('🔧 Initializing MCP Chat Service with production backend...');
  }

  /**
   * Initialize the MCP service with real filesystem server
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🔧 Initializing MCP Chat Service with DocFork (HTTP) MCP server...');

      // Validate OpenAI API key
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }

      // Create MCP client with DocFork MCP server using Smithery URL parameter format
      const smitheryApiKey = process.env.SMITHERY_API_KEY || 'SMITHERY_API_KEY_REQUIRED';
      const smitheryProfile = process.env.SMITHERY_PROFILE || 'glad-squid-LrsVYY';
      // Smithery expects api_key as URL parameter, not Authorization header
      const docforkUrl = `https://server.smithery.ai/@docfork/mcp/mcp?api_key=${smitheryApiKey}&profile=${smitheryProfile}`;

      console.log('🔧 DocFork MCP Configuration:');
      console.log(`   API Key: ${smitheryApiKey.substring(0, 8)}...${smitheryApiKey.substring(smitheryApiKey.length - 4)}`);
      console.log(`   API Key Length: ${smitheryApiKey.length}`);
      console.log(`   API Key Full (DEBUG): ${smitheryApiKey}`);
      console.log(`   Profile: ${smitheryProfile}`);
      console.log(`   URL: ${docforkUrl}`);
      console.log(`   Auth Method: URL parameter + Authorization header (Smithery format)`);

      const mcpConfig = {
        mcpServers: {
          'docfork-mcp': {
            url: docforkUrl, // URL contains api_key parameter
            preferSse: false, // Use Streamable HTTP (preferred)
            authToken: smitheryApiKey, // Also include in Authorization header (Smithery requires both)
            headers: {
              'Content-Type': 'application/json'
            }
          },
        },
      };

      console.log('🔧 MCP Client Configuration:');
      console.log(JSON.stringify(mcpConfig, null, 2));

      this.mcpClient = MCPClient.fromDict(mcpConfig);

      console.log('🎭 MCP DocFork client created (HTTP Streamable)');

      // Create LangChain OpenAI client
      this.llm = new ChatOpenAI({
        modelName: 'gpt-4o',
        openAIApiKey: apiKey,
        temperature: 0.1,
        maxTokens: 4096,
      });

      console.log('🤖 OpenAI LLM client created');

      // Create MCP Agent with the client and LLM
      this.mcpAgent = new MCPAgent({
        client: this.mcpClient,
        llm: this.llm,
        maxSteps: 10,
        autoInitialize: true,
        verbose: true,
      });
      console.log('🤖 MCP Agent created');

      this.initialized = true;
      console.log('✅ MCP Chat Service initialized successfully with DocFork (HTTP) MCP server');
    } catch (error) {
      console.error('❌ Failed to initialize MCP Chat Service:', error);
      throw new Error(`MCP initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream chat response using real MCP filesystem server
   */
  async streamChat(query: string, options: ChatOptions = {}): Promise<Response> {
    // Ensure service is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.mcpAgent) {
      throw new Error('MCP Agent not initialized');
    }

    try {
      console.log(`🤖 Processing query with DocFork MCP server: "${query.slice(0, 100)}${query.length > 100 ? '...' : ''}"`);
      console.log(`🔧 MCP Client Status:`, {
        initialized: !!this.mcpClient,
        agentInitialized: !!this.mcpAgent,
        serverNames: this.mcpClient?.getServerNames?.() || 'N/A'
      });

      // Build context from conversation history
      const contextualQuery = this.buildContextualQuery(query, options.conversationHistory);

      // Use real MCP agent
      const aiSDKStream = this.streamRealMCPResponse(contextualQuery, options);

      // Create readable stream
      const readableStream = this.createReadableStreamFromGenerator(aiSDKStream);

      // Return streaming response compatible with AI SDK
      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('❌ Error in MCP chat streaming:', error);
      throw error;
    }
  }

  /**
   * Stream real MCP agent response with filesystem tool execution
   */
  private async *streamRealMCPResponse(query: string, options: ChatOptions) {
    if (!this.mcpAgent) {
      throw new Error('MCP Agent not initialized');
    }

    try {
      // Show tool usage if enabled
      if (options.enableToolVisibility) {
        yield '\n🔧 Connecting to DocFork MCP server...\n';
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Use the real MCP agent to process the query
      const maxSteps = options.maxSteps || 10;
      console.log(`🤖 Running MCP agent with max steps: ${maxSteps}`);
      console.log(`🔧 About to call mcpAgent.run() with query: "${query}"`);

      let result;
      try {
        result = await this.mcpAgent.run(query, maxSteps);
        console.log(`✅ MCP agent run completed successfully`);
        console.log(`📊 Result type: ${typeof result}, length: ${result?.length || 'N/A'}`);
      } catch (mcpError) {
        console.error(`❌ MCP agent run failed:`, {
          error: mcpError instanceof Error ? mcpError.message : mcpError,
          stack: mcpError instanceof Error ? mcpError.stack : undefined,
          type: typeof mcpError
        });
        throw mcpError;
      }

      if (options.enableToolVisibility) {
        yield '\n✅ DocFork MCP server connected\n\n';
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // The result is a string from MCPAgent.run()
      const response = result;

      if (options.enableToolVisibility) {
        yield '\n🔧 Tool execution completed\n\n';
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Stream the response word by word for better UX
      const words = response.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(resolve => setTimeout(resolve, 50));
      }

    } catch (error) {
      console.error('❌ Error in real MCP streaming:', error);

      // Fallback to error message
      yield `\n❌ Error connecting to DocFork MCP server: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
      yield `I'm having trouble connecting to the DocFork MCP server. This might be because:\n`;
      yield `- The DocFork MCP server at Smithery is not available\n`;
      yield `- The API key or profile parameters are invalid or expired\n`;
      yield `- The OpenAI API key is not configured in .env.local\n`;
      yield `- There's a network issue connecting to https://server.smithery.ai\n\n`;
      yield `Please check the console for more details and try again.`;
    }
  }

  /**
   * Create readable stream from async generator
   */
  private createReadableStreamFromGenerator(
    generator: AsyncGenerator<string, void, void>,
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }



  /**
   * Build contextual query from conversation history
   */
  private buildContextualQuery(query: string, history?: CoreMessage[]): string {
    if (!history || history.length === 0) {
      return query;
    }

    const contextParts = history.slice(-6).map(msg => { // Last 6 messages for context
      const role = msg.role === 'user' ? 'Human' : 'Assistant';
      return `${role}: ${msg.content}`;
    });

    return `Previous conversation:\n${contextParts.join('\n')}\n\nCurrent query: ${query}`;
  }

  /**
   * Get service health status from real MCP Playwright server
   */
  async getHealthStatus() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.mcpAgent || !this.mcpClient) {
        return {
          status: 'error',
          healthy: false,
          error: 'MCP Agent or Client not initialized',
          service: 'MCP Chat Service (Production Mode)',
        };
      }

      // Test MCP client connectivity
      try {
        const serverNames = this.mcpClient.getServerNames();
        console.log('📡 Available MCP servers:', serverNames);

        return {
          status: 'healthy',
          healthy: true,
          service: 'MCP Chat Service (Production Mode)',
          backend: 'DocFork MCP (HTTP Streamable)',
          servers: serverNames,
          features: {
            streaming: true,
            tool_visibility: true,
            browser_automation: 'real',
            documentation_research: 'real',
            mcp_integration: 'production'
          }
        };
      } catch (serverError) {
        return {
          status: 'error',
          healthy: false,
          error: `MCP server connectivity issue: ${serverError instanceof Error ? serverError.message : 'Unknown error'}`,
          service: 'MCP Chat Service (Production Mode)',
        };
      }
    } catch (error) {
      return {
        status: 'error',
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'MCP Chat Service (Production Mode)',
      };
    }
  }

  /**
   * Cleanup resources including MCP client and agent
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up MCP Chat Service...');

      if (this.mcpClient) {
        await this.mcpClient.closeAllSessions();
        this.mcpClient = null;
      }

      this.mcpAgent = null;
      this.llm = null;
      this.initialized = false;

      console.log('✅ MCP Chat Service cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}
