/**
 * Multi-server MCP Agent implementation
 * 
 * This class integrates the mcp-use library's MCPAgent with our OpenAI client
 * and configuration system to provide a unified interface for interacting
 * with multiple MCP servers.
 */

import { MCPAgent } from 'mcp-use';
import { ChatOpenAI } from '@langchain/openai';
import type { CoreMessage } from 'ai';

import { MCPClientFactory } from '@/config/client-factory.js';
import { OpenAIClient } from '@/llm/openai-client.js';
import { ServerManager, createServerManager } from '@/config/server-manager.js';
import type { MCPMultiAgentConfig } from '@/config/types.js';
import {
  ErrorRecoveryOrchestrator,
  withErrorRecovery,
  MCPError,
  MCPConnectionError,
  MCPServerError,
  MCPToolExecutionError,
  type OperationContext,
  type RecoveryResult,
  type RecoveryMetrics
} from '@/utils/index.js';

/**
 * Options for running agent queries
 */
export interface AgentRunOptions {
  /** Maximum number of steps the agent can take */
  maxSteps?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** Additional context or instructions */
  context?: string;
  /** Specific servers to use (if not provided, uses all enabled servers) */
  servers?: string[];
}

/**
 * Result from agent execution
 */
export interface AgentResult {
  /** The final response from the agent */
  response: string;
  /** Number of steps taken */
  steps: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Tools that were used during execution */
  toolsUsed: string[];
  /** Any errors encountered (non-fatal) */
  warnings?: string[];
}

/**
 * Multi-server MCP Agent that combines OpenAI LLM with multiple MCP servers
 */
export class MultiServerAgent {
  private config: MCPMultiAgentConfig;
  private clientFactory: MCPClientFactory;
  private openaiClient: OpenAIClient;
  private serverManager: ServerManager;
  private mcpAgent: MCPAgent | null = null;
  private langchainLLM: ChatOpenAI | null = null;
  private initialized = false;
  private errorRecovery: ErrorRecoveryOrchestrator;

  constructor(
    config: MCPMultiAgentConfig,
    openaiClient: OpenAIClient
  ) {
    this.config = config;
    this.openaiClient = openaiClient;
    this.clientFactory = new MCPClientFactory(config);
    this.serverManager = createServerManager(config.serverManager);

    // Initialize error recovery orchestrator
    this.errorRecovery = new ErrorRecoveryOrchestrator({
      errorHandler: {
        enableLogging: true,
        logLevel: 'error',
        enableRetry: true,
        maxRetryAttempts: 3,
        enableCircuitBreaker: true,
        enableGracefulDegradation: true
      },
      retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitter: true,
        enableCircuitBreaker: true
      },
      degradation: {
        enableCaching: true,
        cacheTimeout: 300000, // 5 minutes
        maxDegradationTime: 3600000 // 1 hour
      },
      enableMetrics: true,
      metricsRetentionTime: 86400000 // 24 hours
    });
  }

  /**
   * Initialize the agent with MCP servers and LLM
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const result = await this.errorRecovery.executeWithRecovery(
      async () => {
        console.log('🔧 Initializing Multi-Server Agent...');

        // Initialize server manager first with client factory for health monitoring
        await this.serverManager.initialize(this.config.servers, this.clientFactory);

        // Create MCP client with all configured servers
        const mcpClient = this.clientFactory.createClient();
        console.log(`📡 Connected to ${this.clientFactory.getEnabledServers().length} MCP servers`);

        // Create LangChain-compatible OpenAI client for mcp-use integration
        const llmConfig: any = {
          modelName: this.config.llm.model,
          openAIApiKey: this.config.llm.apiKey,
        };

        // Only add optional properties if they are defined
        if (this.config.llm.temperature !== undefined) {
          llmConfig.temperature = this.config.llm.temperature;
        }
        if (this.config.llm.maxTokens !== undefined) {
          llmConfig.maxTokens = this.config.llm.maxTokens;
        }
        if (this.config.llm.baseURL) {
          llmConfig.configuration = { baseURL: this.config.llm.baseURL };
        }
        if (this.config.llm.organization) {
          llmConfig.configuration = {
            ...llmConfig.configuration,
            organization: this.config.llm.organization
          };
        }

        this.langchainLLM = new ChatOpenAI(llmConfig);

        // Create MCPAgent with optimized server manager configuration
        const serverManagerConfig = this.serverManager.getMCPAgentConfig();
        const agentConfig: any = {
          llm: this.langchainLLM,
          client: mcpClient,
          // Apply optimized server manager settings
          ...serverManagerConfig,
        };

        // Only add optional properties if they are defined
        if (this.config.agent.maxSteps !== undefined) {
          agentConfig.maxSteps = this.config.agent.maxSteps;
        }
        if (this.config.agent.verbose !== undefined) {
          agentConfig.verbose = this.config.agent.verbose;
        }

        this.mcpAgent = new MCPAgent(agentConfig);

        console.log('✅ Multi-Server Agent initialized successfully');
        console.log(`🔧 Server Manager: ${serverManagerConfig.useServerManager ? 'Enabled' : 'Disabled'}`);
        console.log(`📊 Max Concurrent Servers: ${serverManagerConfig.maxConcurrentServers}`);
        console.log(`⏱️ Server Startup Timeout: ${serverManagerConfig.serverStartupTimeout}s`);

        return true;
      },
      {
        operationName: 'agent_initialization',
        isCritical: true,
        correlationId: `init_${Date.now()}`,
        metadata: {
          serverCount: this.config.servers.length,
          llmModel: this.config.llm.model
        }
      }
    );

    if (result.success) {
      this.initialized = true;
    } else {
      const errorMessage = result.error?.message || 'Unknown initialization error';
      console.error('❌ Failed to initialize Multi-Server Agent:', errorMessage);
      throw new MCPConnectionError(
        `Agent initialization failed: ${errorMessage}`,
        'agent_initialization',
        result.error
      );
    }
  }

  /**
   * Run a query using the multi-server agent
   */
  async run(query: string, options: AgentRunOptions = {}): Promise<AgentResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.mcpAgent) {
      throw new MCPServerError('Agent not properly initialized');
    }

    const maxSteps = options.maxSteps || this.config.agent.maxSteps;
    const correlationId = `query_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const result = await this.errorRecovery.executeWithRecovery(
      async () => {
        console.log(`🤖 Running query: "${query}"`);
        console.log(`📊 Max steps: ${maxSteps}, Timeout: ${options.timeout || this.config.agent.timeout}ms`);

        // Run the query through MCPAgent
        const result = await this.mcpAgent!.run(query, maxSteps);

        console.log(`✅ Query completed successfully`);
        return result;
      },
      {
        operationName: 'agent_query_execution',
        isCritical: false,
        correlationId,
        cacheKey: `query_${Buffer.from(query).toString('base64').slice(0, 20)}`,
        metadata: {
          query: query.slice(0, 100), // Truncate for logging
          maxSteps,
          timeout: options.timeout || this.config.agent.timeout
        }
      }
    );

    const executionTime = result.metrics.totalTime;

    if (result.success) {
      return {
        response: result.result || '',
        steps: maxSteps || this.config.agent.maxSteps || 10,
        executionTime,
        toolsUsed: [], // TODO: Extract from MCPAgent execution logs
        warnings: result.metrics.fallbackUsed ? ['Used fallback or cached response'] : []
      };
    } else {
      const errorMessage = result.error?.message || 'Unknown execution error';
      console.error(`❌ Query failed after ${executionTime}ms:`, errorMessage);

      throw new MCPToolExecutionError(
        `Agent execution failed: ${errorMessage}`,
        'agent_query',
        undefined,
        result.error,
        { query, maxSteps, correlationId }
      );
    }
  }

  /**
   * Run a streaming query (using our OpenAI client for streaming)
   */
  async runStream(
    query: string, 
    options: AgentRunOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<AgentResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      console.log(`🌊 Running streaming query: "${query}"`);

      // For streaming, we'll use our OpenAI client directly
      // TODO: In future versions, integrate with MCPAgent streaming when available
      const messages: CoreMessage[] = [
        {
          role: 'system',
          content: `You are a helpful AI assistant with access to multiple MCP servers. 
                   Available servers: ${this.clientFactory.getEnabledServers().map(s => s.id).join(', ')}.
                   ${options.context || ''}`
        },
        {
          role: 'user',
          content: query
        }
      ];

      let fullResponse = '';

      const streamOptions: any = {};
      if (this.config.llm.temperature !== undefined) {
        streamOptions.temperature = this.config.llm.temperature;
      }
      if (this.config.llm.maxTokens !== undefined) {
        streamOptions.maxTokens = this.config.llm.maxTokens;
      }

      const streamGenerator = this.openaiClient.streamResponse(messages, streamOptions);

      for await (const chunk of streamGenerator) {
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      }

      const executionTime = Date.now() - startTime;
      
      console.log(`✅ Streaming query completed in ${executionTime}ms`);

      return {
        response: fullResponse,
        steps: 1, // Direct LLM call
        executionTime,
        toolsUsed: ['openai-direct'], // Indicate direct OpenAI usage
        warnings: ['Streaming mode uses direct OpenAI client, MCP tools not available']
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Streaming query failed after ${executionTime}ms:`, error);
      
      throw new Error(`Streaming execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get information about available servers and tools
   */
  async getServerInfo(): Promise<{
    servers: Array<{
      id: string;
      name: string;
      description: string;
      enabled: boolean;
      connectionType: string;
    }>;
    totalServers: number;
    enabledServers: number;
  }> {
    const allServers = this.config.servers;
    const enabledServers = this.clientFactory.getEnabledServers();

    return {
      servers: allServers.map(server => ({
        id: server.id,
        name: server.name,
        description: server.description || 'No description available',
        enabled: server.enabled,
        connectionType: server.connectionType
      })),
      totalServers: allServers.length,
      enabledServers: enabledServers.length
    };
  }

  /**
   * Test connection to all enabled servers
   */
  async testConnections(): Promise<{
    successful: string[];
    failed: Array<{ serverId: string; error: string }>;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const enabledServers = this.clientFactory.getEnabledServers();
    const successful: string[] = [];
    const failed: Array<{ serverId: string; error: string }> = [];

    console.log(`🔍 Testing connections to ${enabledServers.length} servers...`);

    for (const server of enabledServers) {
      try {
        await this.clientFactory.createSession(server.id, true);
        successful.push(server.id);
        console.log(`✅ ${server.id}: Connected successfully`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        failed.push({ serverId: server.id, error: errorMessage });
        console.log(`❌ ${server.id}: Connection failed - ${errorMessage}`);
      }
    }

    return { successful, failed };
  }

  /**
   * Get server performance metrics
   */
  getServerMetrics() {
    return this.serverManager.getServerMetrics();
  }

  /**
   * Get detailed server health information
   */
  getServerHealth() {
    return this.serverManager.getDetailedServerHealth();
  }

  /**
   * Get health summary for all servers
   */
  getHealthSummary() {
    return this.serverManager.getHealthSummary();
  }

  /**
   * Force health check for a specific server
   */
  async forceHealthCheck(serverId: string) {
    return await this.serverManager.forceHealthCheck(serverId);
  }

  /**
   * Manually trigger reconnection for a server
   */
  async reconnectServer(serverId: string): Promise<boolean> {
    return await this.serverManager.reconnectServer(serverId);
  }

  /**
   * Check if health monitoring is active
   */
  isHealthMonitoringActive(): boolean {
    return this.serverManager.isHealthMonitoringActive();
  }

  /**
   * Get server manager configuration
   */
  getServerManagerConfig() {
    return this.serverManager.getConfig();
  }

  /**
   * Get error recovery metrics
   */
  getErrorRecoveryMetrics(): RecoveryMetrics {
    return this.errorRecovery.getMetrics();
  }

  /**
   * Get operation history for debugging
   */
  getOperationHistory(limit?: number) {
    return this.errorRecovery.getOperationHistory(limit);
  }

  /**
   * Get overall system health status including error recovery
   */
  getSystemHealthStatus() {
    const recoveryHealth = this.errorRecovery.getHealthStatus();
    const serverHealth = this.getHealthSummary();

    return {
      ...recoveryHealth,
      serverHealth,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset error recovery metrics and state
   */
  resetErrorRecovery(): void {
    this.errorRecovery.reset();
    console.log('🔄 Error recovery metrics and state reset');
  }

  /**
   * Gracefully shutdown the agent and close all connections
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Multi-Server Agent...');

    try {
      await this.serverManager.shutdown();
      await this.clientFactory.closeAll();
      this.initialized = false;
      console.log('✅ Agent shutdown completed');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Check if the agent is initialized and ready
   */
  isReady(): boolean {
    return this.initialized && this.mcpAgent !== null;
  }

  /**
   * Get the current configuration
   */
  getConfig(): MCPMultiAgentConfig {
    return { ...this.config }; // Return a copy to prevent mutations
  }
}

/**
 * Factory function to create a MultiServerAgent with proper configuration
 */
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
