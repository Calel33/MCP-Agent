/**
 * Agent module exports
 */

// Core multi-server agent
export { 
  MultiServerAgent, 
  createMultiServerAgent,
  type AgentRunOptions,
  type AgentResult 
} from './multi-server-agent.js';

// Re-export configuration types for convenience
export type { 
  MCPMultiAgentConfig, 
  AgentConfig, 
  ServerManagerConfig 
} from '@/config/types';
