/**
 * OpenAI client implementation with AI SDK integration
 */

import { openai } from '@ai-sdk/openai';
import { generateText, streamText, type CoreMessage } from 'ai';
import type { LLMConfig } from '@/config/types';

/**
 * OpenAI client wrapper with configuration and error handling
 */
export class OpenAIClient {
  private config: LLMConfig & { apiKey: string };
  private model: ReturnType<typeof openai>;

  constructor(config: LLMConfig) {
    // Validate required configuration
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Merge with defaults
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gpt-4o',
      temperature: config.temperature ?? 0.1,
      maxTokens: config.maxTokens || 4096,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 2000,
    };

    // Add optional properties only if they exist
    if (config.baseURL) {
      this.config.baseURL = config.baseURL;
    }
    if (config.organization) {
      this.config.organization = config.organization;
    }

    // Initialize the AI SDK OpenAI model
    const modelSettings: any = {};
    if (this.config.baseURL) {
      modelSettings.baseURL = this.config.baseURL;
    }
    if (this.config.organization) {
      modelSettings.organization = this.config.organization;
    }

    this.model = openai(this.config.model!, modelSettings);
  }

  /**
   * Generate a single response from the LLM
   */
  async generateResponse(
    messages: CoreMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    try {
      // Add system prompt if provided
      const finalMessages: CoreMessage[] = options?.systemPrompt
        ? [{ role: 'system', content: options.systemPrompt }, ...messages]
        : messages;

      const generateOptions: any = {
        model: this.model,
        messages: finalMessages,
      };

      const temperature = options?.temperature ?? this.config.temperature;
      if (temperature !== undefined) {
        generateOptions.temperature = temperature;
      }

      const maxTokens = options?.maxTokens ?? this.config.maxTokens;
      if (maxTokens !== undefined) {
        generateOptions.maxTokens = maxTokens;
      }

      const result = await generateText(generateOptions);

      return result.text;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stream a response from the LLM
   */
  async *streamResponse(
    messages: CoreMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): AsyncGenerator<string, void, void> {
    try {
      // Add system prompt if provided
      const finalMessages: CoreMessage[] = options?.systemPrompt
        ? [{ role: 'system', content: options.systemPrompt }, ...messages]
        : messages;

      const streamOptions: any = {
        model: this.model,
        messages: finalMessages,
      };

      const temperature = options?.temperature ?? this.config.temperature;
      if (temperature !== undefined) {
        streamOptions.temperature = temperature;
      }

      const maxTokens = options?.maxTokens ?? this.config.maxTokens;
      if (maxTokens !== undefined) {
        streamOptions.maxTokens = maxTokens;
      }

      const result = streamText(streamOptions);

      for await (const chunk of result.textStream) {
        yield chunk;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get the underlying AI SDK model for advanced usage
   */
  getModel() {
    return this.model;
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<LLMConfig & { apiKey: string }> {
    return { ...this.config };
  }

  /**
   * Update configuration (creates new client instance)
   */
  updateConfig(newConfig: Partial<LLMConfig>): OpenAIClient {
    return new OpenAIClient({ ...this.config, ...newConfig });
  }

  /**
   * Test the connection to OpenAI
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await generateText({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10,
      });
      return result.text.length > 0;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      // Check for common OpenAI errors
      if (error.message.includes('401')) {
        return new Error('Invalid OpenAI API key');
      }
      if (error.message.includes('429')) {
        return new Error('OpenAI rate limit exceeded');
      }
      if (error.message.includes('500')) {
        return new Error('OpenAI server error');
      }
      if (error.message.includes('timeout')) {
        return new Error('OpenAI request timeout');
      }
      return error;
    }
    return new Error('Unknown OpenAI error');
  }
}

/**
 * Create an OpenAI client with retry logic
 */
export async function createOpenAIClient(config: LLMConfig): Promise<OpenAIClient> {
  const client = new OpenAIClient(config);
  
  // Test connection with retry logic
  let attempts = 0;
  const maxAttempts = config.maxRetries || 3;
  const retryDelay = config.retryDelay || 2000;

  while (attempts < maxAttempts) {
    try {
      const isConnected = await client.testConnection();
      if (isConnected) {
        return client;
      }
      throw new Error('Connection test failed');
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to connect to OpenAI after ${maxAttempts} attempts: ${error}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
    }
  }

  throw new Error('Failed to create OpenAI client');
}

/**
 * Utility function to convert string messages to CoreMessage format
 */
export function createMessage(role: 'user' | 'assistant' | 'system', content: string): CoreMessage {
  return { role, content };
}

/**
 * Utility function to create a conversation from string array
 */
export function createConversation(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): CoreMessage[] {
  return messages.map(msg => createMessage(msg.role, msg.content));
}
