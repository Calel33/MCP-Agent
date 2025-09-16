/**
 * Utility exports for MCP Multi-Agent
 * 
 * Comprehensive error handling, retry mechanisms, and graceful degradation utilities
 */

// Error types and classes
export {
  MCPError,
  MCPConnectionError,
  MCPAuthenticationError,
  MCPConfigurationError,
  MCPServerError,
  MCPToolExecutionError,
  MCPLLMError,
  MCPTimeoutError,
  MCPRateLimitError,
  MCPValidationError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
  type MCPErrorDetails
} from './errors.ts';

// Error handler
export {
  ErrorHandler,
  type ErrorHandlerConfig
} from './error-handler.ts';

// Retry mechanism
export {
  RetryMechanism,
  type RetryConfig,
  type RetryAttempt,
  type RetryResult,
  type RetryContext
} from './retry.ts';

// Graceful degradation
export {
  GracefulDegradationManager,
  DegradationStrategy,
  type DegradationConfig,
  type DegradationResult
} from './graceful-degradation.ts';

// Error recovery orchestrator
export {
  ErrorRecoveryOrchestrator,
  type ErrorRecoveryConfig,
  type RecoveryMetrics,
  type OperationContext,
  type RecoveryResult
} from './error-recovery.ts';

/**
 * Create a default error recovery orchestrator with sensible defaults
 */
export function createErrorRecoveryOrchestrator(
  config?: Partial<import('./error-recovery.ts').ErrorRecoveryConfig>
): import('./error-recovery.ts').ErrorRecoveryOrchestrator {
  return new (require('./error-recovery.ts').ErrorRecoveryOrchestrator)(config);
}

/**
 * Create a default error handler with sensible defaults
 */
export function createErrorHandler(
  config?: Partial<import('./error-handler.ts').ErrorHandlerConfig>
): import('./error-handler.ts').ErrorHandler {
  return new (require('./error-handler.ts').ErrorHandler)(config);
}

/**
 * Create a default retry mechanism with sensible defaults
 */
export function createRetryMechanism(
  config?: Partial<import('./retry.ts').RetryConfig>,
  errorHandler?: import('./error-handler.ts').ErrorHandler
): import('./retry.ts').RetryMechanism {
  return new (require('./retry.ts').RetryMechanism)(config, errorHandler);
}

/**
 * Create a default graceful degradation manager with sensible defaults
 */
export function createGracefulDegradationManager(
  config?: Partial<import('./graceful-degradation.ts').DegradationConfig>,
  errorHandler?: import('./error-handler.ts').ErrorHandler
): import('./graceful-degradation.ts').GracefulDegradationManager {
  return new (require('./graceful-degradation.ts').GracefulDegradationManager)(config, errorHandler);
}

/**
 * Utility function to wrap any async operation with error recovery
 */
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  context: import('./error-recovery.ts').OperationContext,
  config?: Partial<import('./error-recovery.ts').ErrorRecoveryConfig>
): Promise<import('./error-recovery.ts').RecoveryResult<T>> {
  const orchestrator = createErrorRecoveryOrchestrator(config);
  return await orchestrator.executeWithRecovery(operation, context);
}

/**
 * Utility function to wrap any async operation with retry logic only
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context: import('./retry.ts').RetryContext,
  config?: Partial<import('./retry.ts').RetryConfig>
): Promise<import('./retry.ts').RetryResult<T>> {
  const retryMechanism = createRetryMechanism(config);
  return await retryMechanism.execute(operation, context);
}

/**
 * Utility function to classify and handle errors
 */
export function handleError(
  error: unknown,
  context: {
    operation?: string;
    serverId?: string;
    toolName?: string;
    correlationId?: string;
    additionalContext?: Record<string, any>;
  } = {},
  config?: Partial<import('./error-handler.ts').ErrorHandlerConfig>
): import('./errors.ts').MCPError {
  const errorHandler = createErrorHandler(config);
  return errorHandler.handleError(error, context);
}

/**
 * Utility function to check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof MCPError) {
    return error.isRetryable();
  }
  
  // Check common retryable error patterns
  const errorMessage = error instanceof Error ? error.message : String(error);
  const retryablePatterns = [
    /timeout/i,
    /network.*error/i,
    /connection.*failed/i,
    /server.*error/i,
    /rate.*limit/i,
    /503/,
    /502/,
    /504/
  ];
  
  return retryablePatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Utility function to determine error severity
 */
export function getErrorSeverity(error: unknown): import('./errors.ts').ErrorSeverity {
  if (error instanceof MCPError) {
    return error.details.severity;
  }
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Critical errors
  if (/authentication|authorization|security|critical/i.test(errorMessage)) {
    return ErrorSeverity.CRITICAL;
  }
  
  // High severity errors
  if (/server.*error|connection.*failed|timeout/i.test(errorMessage)) {
    return ErrorSeverity.HIGH;
  }
  
  // Low severity errors
  if (/validation|bad.*request|invalid.*input/i.test(errorMessage)) {
    return ErrorSeverity.LOW;
  }
  
  // Default to medium
  return ErrorSeverity.MEDIUM;
}

/**
 * Utility function to get recommended recovery strategy
 */
export function getRecoveryStrategy(error: unknown): import('./errors.ts').RecoveryStrategy {
  if (error instanceof MCPError) {
    return error.getRecoveryStrategy();
  }
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Authentication/authorization errors require manual intervention
  if (/authentication|authorization|401|403/i.test(errorMessage)) {
    return RecoveryStrategy.MANUAL_INTERVENTION;
  }
  
  // Connection/network errors can be retried
  if (/connection|network|timeout|502|503|504/i.test(errorMessage)) {
    return RecoveryStrategy.RETRY;
  }
  
  // Server errors might benefit from circuit breaker
  if (/server.*error|500/i.test(errorMessage)) {
    return RecoveryStrategy.CIRCUIT_BREAKER;
  }
  
  // Tool execution errors can use fallback
  if (/tool|execution|operation/i.test(errorMessage)) {
    return RecoveryStrategy.FALLBACK;
  }
  
  // Default to graceful degradation
  return RecoveryStrategy.GRACEFUL_DEGRADATION;
}
