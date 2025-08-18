/**
 * LLM module exports
 */

// Core OpenAI client
export { OpenAIClient, createOpenAIClient, createMessage, createConversation } from './openai-client.js';

// Factory and configuration
export { 
  LLMFactory, 
  loadLLMConfig, 
  validateLLMConfig, 
  createLLMConfig, 
  getOpenAIClient, 
  testOpenAIConnection 
} from './factory.js';

// Re-export types from config
export type { LLMConfig } from '@/config/types';

// Re-export AI SDK types for convenience
export type { CoreMessage } from 'ai';
