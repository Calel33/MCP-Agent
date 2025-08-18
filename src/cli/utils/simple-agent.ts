/**
 * Simple Agent for CLI (without complex error handling)
 * 
 * A simplified version of MultiServerAgent for CLI usage
 */

import { OpenAIClient } from '@/llm/openai-client.js';
import type { MCPMultiAgentConfig } from '@/config/types.js';
import type { CoreMessage } from 'ai';

export interface SimpleAgentResult {
  response: string;
  executionTime: number;
  toolsUsed: string[];
  warnings: string[];
}

export interface SimpleAgentRunOptions {
  maxSteps?: number;
  timeout?: number;
  context?: string;
}

/**
 * Simple agent implementation for CLI
 */
export class SimpleAgent {
  private config: MCPMultiAgentConfig;
  private openaiClient: OpenAIClient;
  private initialized = false;

  constructor(config: MCPMultiAgentConfig, openaiClient: OpenAIClient) {
    this.config = config;
    this.openaiClient = openaiClient;
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const isQuiet = process.env['CLI_QUIET'] === 'true';
    const isVerbose = process.env['CLI_VERBOSE'] === 'true';

    if (!isQuiet) {
      console.log('🔧 Initializing Simple Agent...');
    }

    // For now, just mark as initialized
    // In a full implementation, this would set up MCP servers
    this.initialized = true;

    if (!isQuiet) {
      console.log('✅ Simple Agent initialized');
    }
  }

  /**
   * Get server info
   */
  async getServerInfo(): Promise<{ totalServers: number; enabledServers: number }> {
    const totalServers = this.config.servers.length;
    const enabledServers = this.config.servers.filter(s => s.enabled).length;
    
    return { totalServers, enabledServers };
  }

  /**
   * Run a query using the simple agent
   */
  async run(query: string, options: SimpleAgentRunOptions = {}): Promise<SimpleAgentResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      const isQuiet = process.env['CLI_QUIET'] === 'true';
      const isVerbose = process.env['CLI_VERBOSE'] === 'true';

      if (isVerbose) {
        console.log(`🤖 Running query: "${query}"`);
      }

      const messages: CoreMessage[] = [
        {
          role: 'system',
          content: `You are a helpful AI assistant. ${options.context || ''}`
        },
        {
          role: 'user',
          content: query
        }
      ];

      // Use the OpenAI client to get a response
      let fullResponse = '';
      const streamGenerator = this.openaiClient.streamResponse(messages, {
        temperature: this.config.llm.temperature,
        maxTokens: this.config.llm.maxTokens
      });

      for await (const chunk of streamGenerator) {
        fullResponse += chunk;
      }

      const executionTime = Date.now() - startTime;

      if (isVerbose) {
        console.log(`✅ Query completed successfully`);
      }

      return {
        response: fullResponse,
        executionTime,
        toolsUsed: [], // No tools in simple implementation
        warnings: []
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Query failed:', error);

      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Run a streaming query
   */
  async runStream(
    query: string, 
    options: SimpleAgentRunOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<SimpleAgentResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      const isQuiet = process.env['CLI_QUIET'] === 'true';
      const isVerbose = process.env['CLI_VERBOSE'] === 'true';

      if (isVerbose) {
        console.log(`🌊 Running streaming query: "${query}"`);
      }

      const messages: CoreMessage[] = [
        {
          role: 'system',
          content: `You are a helpful AI assistant. ${options.context || ''}`
        },
        {
          role: 'user',
          content: query
        }
      ];

      let fullResponse = '';
      const streamGenerator = this.openaiClient.streamResponse(messages, {
        temperature: this.config.llm.temperature,
        maxTokens: this.config.llm.maxTokens
      });

      for await (const chunk of streamGenerator) {
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      }

      const executionTime = Date.now() - startTime;

      if (isVerbose) {
        console.log(`✅ Streaming query completed successfully`);
      }

      return {
        response: fullResponse,
        executionTime,
        toolsUsed: [], // No tools in simple implementation
        warnings: []
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Streaming query failed:', error);

      throw new Error(`Streaming query execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
