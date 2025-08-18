/**
 * Comprehensive error handling system for MCP Multi-Agent
 * 
 * This module provides:
 * - Custom error classes for different error types
 * - Error categorization and severity levels
 * - Error recovery strategies
 * - Standardized error formatting
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  CONFIGURATION = 'configuration',
  SERVER = 'server',
  TOOL_EXECUTION = 'tool_execution',
  LLM = 'llm',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

/**
 * Recovery strategies for different error types
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  GRACEFUL_DEGRADATION = 'graceful_degradation',
  CIRCUIT_BREAKER = 'circuit_breaker',
  MANUAL_INTERVENTION = 'manual_intervention',
  NONE = 'none'
}

/**
 * Base error interface with enhanced metadata
 */
export interface MCPErrorDetails {
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoveryStrategy: RecoveryStrategy;
  retryable: boolean;
  serverId?: string;
  toolName?: string;
  context?: Record<string, any>;
  timestamp: Date;
  correlationId?: string;
}

/**
 * Base MCP Error class with enhanced error handling
 */
export class MCPError extends Error {
  public readonly details: MCPErrorDetails;
  public readonly originalError?: Error;

  constructor(
    message: string,
    details: Partial<MCPErrorDetails> = {},
    originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;
    
    // Set default values for required fields
    this.details = {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.NONE,
      retryable: false,
      timestamp: new Date(),
      ...details
    };

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get formatted error information
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.details.retryable;
  }

  /**
   * Get recovery strategy
   */
  getRecoveryStrategy(): RecoveryStrategy {
    return this.details.recoveryStrategy;
  }

  /**
   * Check if error is critical
   */
  isCritical(): boolean {
    return this.details.severity === ErrorSeverity.CRITICAL;
  }
}

/**
 * Connection-related errors
 */
export class MCPConnectionError extends MCPError {
  constructor(
    message: string,
    serverId?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.CONNECTION,
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: RecoveryStrategy.RETRY,
      retryable: true,
      serverId,
      context
    }, originalError);
  }
}

/**
 * Authentication and authorization errors
 */
export class MCPAuthenticationError extends MCPError {
  constructor(
    message: string,
    serverId?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: RecoveryStrategy.MANUAL_INTERVENTION,
      retryable: false,
      serverId,
      context
    }, originalError);
  }
}

/**
 * Configuration-related errors
 */
export class MCPConfigurationError extends MCPError {
  constructor(
    message: string,
    context?: Record<string, any>,
    originalError?: Error
  ) {
    super(message, {
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.CRITICAL,
      recoveryStrategy: RecoveryStrategy.MANUAL_INTERVENTION,
      retryable: false,
      context
    }, originalError);
  }
}

/**
 * Server-related errors
 */
export class MCPServerError extends MCPError {
  constructor(
    message: string,
    serverId?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.SERVER,
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: RecoveryStrategy.CIRCUIT_BREAKER,
      retryable: true,
      serverId,
      context
    }, originalError);
  }
}

/**
 * Tool execution errors
 */
export class MCPToolExecutionError extends MCPError {
  constructor(
    message: string,
    toolName?: string,
    serverId?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.TOOL_EXECUTION,
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.FALLBACK,
      retryable: true,
      serverId,
      toolName,
      context
    }, originalError);
  }
}

/**
 * LLM-related errors
 */
export class MCPLLMError extends MCPError {
  constructor(
    message: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.LLM,
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: RecoveryStrategy.RETRY,
      retryable: true,
      context
    }, originalError);
  }
}

/**
 * Timeout errors
 */
export class MCPTimeoutError extends MCPError {
  constructor(
    message: string,
    timeout: number,
    serverId?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.RETRY,
      retryable: true,
      serverId,
      context: { timeout, ...context }
    }, originalError);
  }
}

/**
 * Rate limit errors
 */
export class MCPRateLimitError extends MCPError {
  constructor(
    message: string,
    retryAfter?: number,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.RETRY,
      retryable: true,
      context: { retryAfter, ...context }
    }, originalError);
  }
}

/**
 * Validation errors
 */
export class MCPValidationError extends MCPError {
  constructor(
    message: string,
    validationErrors?: string[],
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      recoveryStrategy: RecoveryStrategy.MANUAL_INTERVENTION,
      retryable: false,
      context: { validationErrors, ...context }
    }, originalError);
  }
}
