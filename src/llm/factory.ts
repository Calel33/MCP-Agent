/**
 * LLM factory for creating and managing OpenAI clients
 */

import { OpenAIClient, createOpenAIClient } from './openai-client.js';
import type { LLMConfig } from '@/config/types';
import { ENV_VARS, DEFAULT_CONFIG } from '@/config/types';

/**
 * LLM factory class for managing OpenAI client instances
 */
export class LLMFactory {
  private static instance: LLMFactory;
  private clients: Map<string, OpenAIClient> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): LLMFactory {
    if (!LLMFactory.instance) {
      LLMFactory.instance = new LLMFactory();
    }
    return LLMFactory.instance;
  }

  /**
   * Create or get cached OpenAI client
   */
  async getClient(config: LLMConfig, cacheKey?: string): Promise<OpenAIClient> {
    const key = cacheKey || this.generateCacheKey(config);
    
    if (this.clients.has(key)) {
      const client = this.clients.get(key)!;
      // Verify the client is still working
      const isWorking = await client.testConnection();
      if (isWorking) {
        return client;
      }
      // Remove broken client from cache
      this.clients.delete(key);
    }

    // Create new client
    const client = await createOpenAIClient(config);
    this.clients.set(key, client);
    return client;
  }

  /**
   * Create a new client without caching
   */
  async createClient(config: LLMConfig): Promise<OpenAIClient> {
    return createOpenAIClient(config);
  }

  /**
   * Remove client from cache
   */
  removeClient(cacheKey: string): boolean {
    return this.clients.delete(cacheKey);
  }

  /**
   * Clear all cached clients
   */
  clearCache(): void {
    this.clients.clear();
  }

  /**
   * Get number of cached clients
   */
  getCacheSize(): number {
    return this.clients.size;
  }

  /**
   * Generate cache key from config
   */
  private generateCacheKey(config: LLMConfig): string {
    const keyParts = [
      config.model || DEFAULT_CONFIG.llm.model,
      config.baseURL || 'default',
      config.organization || 'default',
    ];
    return keyParts.join(':');
  }
}

/**
 * Load LLM configuration from environment variables
 */
export function loadLLMConfig(): LLMConfig {
  const apiKey = process.env[ENV_VARS.OPENAI_API_KEY];

  if (!apiKey) {
    throw new Error(`Missing required environment variable: ${ENV_VARS.OPENAI_API_KEY}`);
  }

  const config: LLMConfig = {
    apiKey,
    model: process.env['OPENAI_MODEL'] || DEFAULT_CONFIG.llm.model,
    temperature: process.env['OPENAI_TEMPERATURE']
      ? parseFloat(process.env['OPENAI_TEMPERATURE'])
      : DEFAULT_CONFIG.llm.temperature,
    maxTokens: process.env['OPENAI_MAX_TOKENS']
      ? parseInt(process.env['OPENAI_MAX_TOKENS'], 10)
      : DEFAULT_CONFIG.llm.maxTokens,
    maxRetries: process.env['OPENAI_MAX_RETRIES']
      ? parseInt(process.env['OPENAI_MAX_RETRIES'], 10)
      : DEFAULT_CONFIG.llm.maxRetries,
    retryDelay: process.env['OPENAI_RETRY_DELAY']
      ? parseInt(process.env['OPENAI_RETRY_DELAY'], 10)
      : DEFAULT_CONFIG.llm.retryDelay,
  };

  // Add optional properties only if they exist
  const baseURL = process.env[ENV_VARS.OPENAI_BASE_URL];
  if (baseURL) {
    config.baseURL = baseURL;
  }
  const organization = process.env[ENV_VARS.OPENAI_ORGANIZATION];
  if (organization) {
    config.organization = organization;
  }

  return config;
}

/**
 * Validate LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): void {
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    throw new Error('Temperature must be between 0 and 2');
  }

  if (config.maxTokens !== undefined && config.maxTokens < 1) {
    throw new Error('Max tokens must be greater than 0');
  }

  if (config.maxRetries !== undefined && config.maxRetries < 0) {
    throw new Error('Max retries must be non-negative');
  }

  if (config.retryDelay !== undefined && config.retryDelay < 0) {
    throw new Error('Retry delay must be non-negative');
  }
}

/**
 * Create LLM configuration with validation
 */
export function createLLMConfig(config: Partial<LLMConfig>): LLMConfig {
  const fullConfig: LLMConfig = {
    apiKey: config.apiKey || process.env[ENV_VARS.OPENAI_API_KEY] || '',
    model: config.model || DEFAULT_CONFIG.llm.model,
    temperature: config.temperature ?? DEFAULT_CONFIG.llm.temperature,
    maxTokens: config.maxTokens || DEFAULT_CONFIG.llm.maxTokens,
    maxRetries: config.maxRetries || DEFAULT_CONFIG.llm.maxRetries,
    retryDelay: config.retryDelay || DEFAULT_CONFIG.llm.retryDelay,
  };

  // Add optional properties only if they exist
  const baseURL = config.baseURL || process.env[ENV_VARS.OPENAI_BASE_URL];
  if (baseURL) {
    fullConfig.baseURL = baseURL;
  }
  const organization = config.organization || process.env[ENV_VARS.OPENAI_ORGANIZATION];
  if (organization) {
    fullConfig.organization = organization;
  }

  validateLLMConfig(fullConfig);
  return fullConfig;
}

/**
 * Convenience function to get a ready-to-use OpenAI client
 */
export async function getOpenAIClient(config?: Partial<LLMConfig>): Promise<OpenAIClient> {
  const factory = LLMFactory.getInstance();
  const llmConfig = config ? createLLMConfig(config) : loadLLMConfig();
  return factory.getClient(llmConfig);
}

/**
 * Test OpenAI connection with current environment
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const client = await getOpenAIClient();
    return client.testConnection();
  } catch (error) {
    console.error('Failed to test OpenAI connection:', error);
    return false;
  }
}
