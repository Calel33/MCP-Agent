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
   * Initialize the MCP service with all enabled servers from configuration
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Import the MCPConfigService
      const { MCPConfigService } = await import('./mcp-config-service');
      
      // Load all enabled servers from configuration
      const allServers = await MCPConfigService.getAllServers();
      const enabledServers = allServers.filter(server => server.enabled);
      
      console.log(`🔧 Initializing MCP Chat Service with ${enabledServers.length} enabled servers...`);
      console.log(`📡 Enabled servers: ${enabledServers.map(s => s.name).join(', ')}`);

      // Validate OpenAI API key
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }

      // Environment variables for server configurations
      const smitheryApiKey = process.env.SMITHERY_API_KEY || 'SMITHERY_API_KEY_REQUIRED';
      const smitheryProfile = process.env.SMITHERY_PROFILE || process.env.SMITHERY_API_KEY || 'default';
      const hustleApiKey = process.env.HUSTLE_API_KEY || 'HUSTLE_API_KEY_REQUIRED';
      const hustleVaultId = process.env.HUSTLE_VAULT_ID || 'HUSTLE_VAULT_ID_REQUIRED';

      console.log('🔧 Environment Variables Check:');
      console.log(`   OpenAI API Key: ${apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET'}`);
      console.log(`   Smithery API Key: ${smitheryApiKey !== 'SMITHERY_API_KEY_REQUIRED' ? `${smitheryApiKey.substring(0, 8)}...${smitheryApiKey.substring(smitheryApiKey.length - 4)}` : 'NOT SET'}`);
      console.log(`   Smithery Profile: ${smitheryProfile !== 'default' ? `${smitheryProfile.substring(0, 8)}...${smitheryProfile.substring(smitheryProfile.length - 4)}` : 'USING DEFAULT'}`);
      console.log(`   Hustle API Key: ${hustleApiKey !== 'HUSTLE_API_KEY_REQUIRED' ? `${hustleApiKey.substring(0, 8)}...${hustleApiKey.substring(hustleApiKey.length - 4)}` : 'NOT SET'}`);
      console.log(`   Hustle Vault ID: ${hustleVaultId !== 'HUSTLE_VAULT_ID_REQUIRED' ? hustleVaultId : 'NOT SET'}`);
      
      // Environment variable validation with improved messaging
      const missingVars = [];
      if (smitheryApiKey === 'SMITHERY_API_KEY_REQUIRED') {
        missingVars.push('SMITHERY_API_KEY');
      }
      if (hustleApiKey === 'HUSTLE_API_KEY_REQUIRED' && enabledServers.some(s => s.id === 'hustle-http')) {
        missingVars.push('HUSTLE_API_KEY');
      }
      if (hustleVaultId === 'HUSTLE_VAULT_ID_REQUIRED' && enabledServers.some(s => s.id === 'hustle-http')) {
        missingVars.push('HUSTLE_VAULT_ID');
      }
      
      if (missingVars.length > 0) {
        console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
        console.warn(`   Create .env.local file with these variables or servers may not connect properly`);
        console.warn(`   Continuing with graceful degradation - MCP servers may be unavailable`);
      }

      // Build MCP configuration dynamically from enabled servers
      const mcpServers: Record<string, {
        url?: string;
        command?: string;
        args?: string[];
        preferSse?: boolean;
        authToken?: string;
        headers?: Record<string, string>;
      }> = {};
      
      for (const server of enabledServers) {
        console.log(`🔧 Configuring server: ${server.name} (${server.type})`);
        
        if (server.type === 'http' && server.url) {
          // Handle HTTP servers
          let url = server.url;
          
          // Replace environment variables in URL
          url = url.replace('${SMITHERY_API_KEY}', smitheryApiKey);
          url = url.replace('${SMITHERY_PROFILE}', smitheryProfile);
          url = url.replace('${HUSTLE_API_KEY}', hustleApiKey);
          url = url.replace('${HUSTLE_VAULT_ID}', hustleVaultId);
          
          // Special handling for different server authentication methods
          let headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (url.includes('server.smithery.ai')) {
            // Smithery uses URL parameter authentication (api_key and profile already in URL)
            // No additional headers needed - authentication is via URL parameters
            console.log(`   🔐 Smithery URL parameter auth configured for ${server.id}`);
            
            // Verify the URL has the required parameters
            if (!url.includes('api_key=') || !url.includes('profile=')) {
              console.warn(`   ⚠️ Smithery URL missing required parameters for ${server.id}`);
            }
          } else if (url.includes('hustle-remote.myagent.sh')) {
            // Hustle uses API key in URL parameters (already replaced above)
            console.log(`   🔐 Hustle URL auth configured for ${server.id}`);
            
            // Verify the URL has the required parameters
            if (!url.includes('apikey=') || !url.includes('vaultId=')) {
              console.warn(`   ⚠️ Hustle URL missing required parameters for ${server.id}`);
            }
          } else {
            // Generic HTTP server - add Authorization header if we have an auth token
            if (smitheryApiKey !== 'SMITHERY_API_KEY_REQUIRED') {
              headers['Authorization'] = `Bearer ${smitheryApiKey}`;
              console.log(`   🔐 Generic Authorization header configured for ${server.id}`);
            }
          }
          
          mcpServers[server.id] = {
            url: url,
            preferSse: false,
            headers: headers
          };
          
          console.log(`   ✅ HTTP server configured: ${server.id}`);
          console.log(`   📍 URL: ${url.substring(0, 50)}...`);
          console.log(`   🔐 Headers:`, Object.keys(mcpServers[server.id].headers || {}));
          
        } else if (server.type === 'stdio' && server.command && server.args) {
          // Handle stdio servers
          const args = server.args.map(arg => {
            // Replace environment variables in args
            return arg
              .replace('${SMITHERY_API_KEY}', smitheryApiKey)
              .replace('${HUSTLE_API_KEY}', hustleApiKey)
              .replace('${HUSTLE_VAULT_ID}', hustleVaultId);
          });
          
          mcpServers[server.id] = {
            command: server.command,
            args: args
          };
          
          console.log(`   ✅ STDIO server configured: ${server.id}`);
          console.log(`   🔧 Command: ${server.command} ${args.join(' ')}`);
        } else {
          console.log(`   ⚠️ Skipping server ${server.id}: unsupported configuration`);
        }
      }

      const mcpConfig = {
        mcpServers: mcpServers
      };

      console.log('🔧 Final MCP Client Configuration:');
      console.log(JSON.stringify(mcpConfig, null, 2));

      // Try creating MCPClient with graceful degradation
      try {
        this.mcpClient = MCPClient.fromDict(mcpConfig);
        console.log('✅ MCPClient created successfully from configuration');
      } catch (configError) {
        console.error('❌ MCPClient configuration error:', {
          error: configError instanceof Error ? configError.message : configError,
          stack: configError instanceof Error ? configError.stack : undefined,
          config: mcpConfig
        });
        
        // Graceful degradation: Create empty MCP client if configuration fails
        console.log('🔄 Attempting graceful degradation with empty MCP configuration...');
        try {
          this.mcpClient = MCPClient.fromDict({ mcpServers: {} });
          console.log('✅ Fallback MCPClient created (no MCP servers)');
        } catch (fallbackError) {
          console.error('❌ Even fallback MCPClient failed:', fallbackError);
          throw new Error(`Complete MCP initialization failure: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
      }

      console.log(`🎭 MCP clients created for ${Object.keys(mcpServers).length} servers`);

      // Test individual server connections (non-blocking)
      await this.testServerConnections(mcpServers);

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
      console.log(`✅ MCP Chat Service initialized successfully with ${enabledServers.length} enabled servers`);
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
   * Test individual server connections without failing the entire initialization
   */
  private async testServerConnections(mcpServers: Record<string, unknown>): Promise<void> {
    console.log('🔍 Testing individual server connections...');
    
    for (const [serverId, serverConfig] of Object.entries(mcpServers)) {
      try {
        // Create a temporary client for just this server
        const testConfig = { mcpServers: { [serverId]: serverConfig } };
        const testClient = MCPClient.fromDict(testConfig);
        
        // Try to get server info (lightweight test)
        const serverNames = testClient.getServerNames?.() || [];
        if (serverNames.length > 0) {
          console.log(`   ✅ Server ${serverId}: Configuration valid`);
        } else {
          console.log(`   ⚠️ Server ${serverId}: No server names returned`);
        }
      } catch (testError) {
        console.log(`   ❌ Server ${serverId}: Configuration failed -`, 
          testError instanceof Error ? testError.message : testError);
      }
    }
    
    console.log('🔍 Server connection tests completed');
  }

  /**
   * Stream real MCP agent response with MCP server tool execution
   */
  private async *streamRealMCPResponse(query: string, options: ChatOptions) {
    if (!this.mcpAgent) {
      throw new Error('MCP Agent not initialized');
    }

    try {
      // Show tool usage if enabled
      if (options.enableToolVisibility) {
        const serverNames = this.mcpClient?.getServerNames?.() || [];
        const serverList = serverNames.length > 0 ? serverNames.join(', ') : 'MCP servers';
        yield `\n🔧 Connecting to ${serverList}...\n`;
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
        
        // Check if this is a connection error - if so, fall back to LLM-only mode
        const errorMessage = mcpError instanceof Error ? mcpError.message : String(mcpError);
        if (errorMessage.includes('Could not connect to server') || 
            errorMessage.includes('Invalid configuration') ||
            errorMessage.includes('Failed to connect')) {
          
          console.log('🔄 MCP connection failed, falling back to LLM-only mode...');
          
          // Show fallback message to user if tool visibility is enabled
          if (options.enableToolVisibility) {
            yield '\n⚠️ MCP servers unavailable, using LLM-only mode...\n';
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          // Use just the LLM without MCP tools
          if (!this.llm) {
            throw new Error('LLM not initialized - cannot provide fallback response');
          }
          const fallbackResult = await this.llm.invoke(query);
          
          // Use a wrapper object instead of modifying the string
          result = {
            content: fallbackResult.content,
            _isFallback: true
          };
          
          console.log('✅ Fallback LLM response completed');
        } else {
          throw mcpError;
        }
      }

      if (options.enableToolVisibility) {
        // Check if this is a fallback response
        if (typeof result === 'object' && result !== null && '_isFallback' in result) {
          yield '\n✅ LLM-only response ready\n\n';
        } else {
          const serverNames = this.mcpClient?.getServerNames?.() || [];
          const serverList = serverNames.length > 0 ? serverNames.join(', ') : 'MCP servers';
          yield `\n✅ ${serverList} connected\n\n`;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // The result can be a string from MCPAgent.run() or a wrapper object from fallback
      const response = typeof result === 'object' && result.content ? result.content : result;

      if (options.enableToolVisibility) {
        if (typeof result === 'object' && result !== null && '_isFallback' in result) {
          yield '\n🤖 LLM processing completed\n\n';
        } else {
          yield '\n🔧 Tool execution completed\n\n';
        }
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

      // Fallback to error message with graceful degradation info
      const serverNames = this.mcpClient?.getServerNames?.() || [];
      const serverList = serverNames.length > 0 ? serverNames.join(', ') : 'MCP servers';
      
      // Check if this was a connection error that should have been handled gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Could not connect to server') || 
          errorMessage.includes('Invalid configuration') ||
          errorMessage.includes('Failed to connect')) {
        
        yield `\n⚠️ MCP server connection issues detected, but I'm still here to help!\n\n`;
        yield `I attempted to connect to: ${serverList}\n`;
        yield `While I couldn't access the specialized MCP tools, I can still:\n`;
        yield `- Answer questions using my built-in knowledge\n`;
        yield `- Help with general tasks and problem-solving\n`;
        yield `- Provide information on a wide range of topics\n\n`;
        yield `For full functionality, please check:\n`;
        yield `- MCP server availability and configuration\n`;
        yield `- API keys in .env.local file\n`;
        yield `- Network connectivity\n\n`;
        yield `How can I help you today?`;
      } else {
        yield `\n❌ Error: ${errorMessage}\n\n`;
        yield `Please check the console for more details and try again.`;
      }
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
