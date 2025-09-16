/**
 * Codebuff Agent Type Definitions
 */

export interface AgentDefinition {
  /** Unique identifier for this agent. Must contain only lowercase letters, numbers, and hyphens */
  id: string
  
  /** Version string (if not provided, will default to '0.0.1' and be bumped on each publish) */
  version?: string
  
  /** Publisher ID for the agent. Must be provided if you want to publish the agent. */
  publisher?: string
  
  /** Human-readable name for the agent */
  displayName: string
  
  /** AI model to use for this agent */
  model: ModelName
  
  /** Tools this agent can use */
  toolNames?: ToolName[]
  
  /** Other agents this agent can spawn */
  spawnableAgents?: string[]
  
  /** The input schema required to spawn the agent */
  inputSchema?: {
    prompt?: { type: 'string'; description?: string }
    params?: JsonObjectSchema
  }
  
  /** Whether to include conversation history from the parent agent in context */
  includeMessageHistory?: boolean
  
  /** How the agent should output a response to its parent */
  outputMode?: 'last_message' | 'all_messages' | 'structured_output'
  
  /** JSON schema for structured output */
  outputSchema?: JsonObjectSchema
  
  /** Prompt for when and why to spawn this agent */
  spawnerPrompt?: string
  
  /** Background information for the agent */
  systemPrompt?: string
  
  /** Instructions for the agent */
  instructionsPrompt?: string
  
  /** Prompt inserted at each agent step */
  stepPrompt?: string
  
  /** Programmatically step the agent forward and run tools */
  handleSteps?: (context: AgentStepContext) => Generator<ToolCall | 'STEP' | 'STEP_ALL', void, { agentState: AgentState; toolResult: string | undefined }>
}

export interface AgentState {
  agentId: string
  parentId: string
  messageHistory: Message[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentStepContext {
  agentState: AgentState
  prompt?: string
  params?: Record<string, any>
}

export interface ToolCall {
  toolName: string
  input: Record<string, any>
}

export type JsonSchema = {
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'integer'
  description?: string
  properties?: Record<string, JsonSchema | boolean>
  required?: string[]
  enum?: Array<string | number | boolean | null>
  [k: string]: unknown
}

export type JsonObjectSchema = JsonSchema & { type: 'object' }

export type ToolName = 
  | 'read_files'
  | 'write_file'
  | 'str_replace'
  | 'find_files'
  | 'code_search'
  | 'run_terminal_command'
  | 'web_search'
  | 'read_docs'
  | 'spawn_agents'
  | 'set_messages'
  | 'add_message'
  | 'think_deeply'
  | 'set_output'
  | 'end_turn'

export type ModelName = 
  | 'openai/gpt-5'
  | 'anthropic/claude-4-sonnet-20250522'
  | 'google/gemini-2.5-pro'
  | 'qwen/qwen3-coder'
  | string