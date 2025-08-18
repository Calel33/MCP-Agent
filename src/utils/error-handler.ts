/**
 * Error handler utility for MCP Multi-Agent
 * 
 * Provides centralized error handling, classification, and recovery mechanisms
 */

import {
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
  ErrorCategory,
  ErrorSeverity,
  RecoveryStrategy
} from './errors.js';

/**
 * Error classification patterns
 */
const ERROR_PATTERNS = {
  connection: [
    /connection.*failed/i,
    /network.*error/i,
    /econnrefused/i,
    /enotfound/i,
    /timeout/i,
    /socket.*hang.*up/i
  ],
  authentication: [
    /unauthorized/i,
    /invalid.*api.*key/i,
    /authentication.*failed/i,
    /401/,
    /403/,
    /access.*denied/i
  ],
  server: [
    /server.*error/i,
    /internal.*server.*error/i,
    /500/,
    /502/,
    /503/,
    /504/
  ],
  rateLimit: [
    /rate.*limit/i,
    /too.*many.*requests/i,
    /429/,
    /quota.*exceeded/i
  ],
  timeout: [
    /timeout/i,
    /timed.*out/i,
    /request.*timeout/i,
    /408/
  ],
  validation: [
    /validation.*error/i,
    /invalid.*input/i,
    /bad.*request/i,
    /400/
  ]
};

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableRetry: boolean;
  maxRetryAttempts: number;
  retryDelay: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  enableGracefulDegradation: boolean;
}

/**
 * Default error handler configuration
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableLogging: true,
  logLevel: 'error',
  enableRetry: true,
  maxRetryAttempts: 3,
  retryDelay: 1000,
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  enableGracefulDegradation: true
};

/**
 * Centralized error handler class
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCounts: Map<string, number> = new Map();
  private circuitBreakers: Map<string, boolean> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handle and classify an error
   */
  handleError(
    error: unknown,
    context: {
      operation?: string;
      serverId?: string;
      toolName?: string;
      correlationId?: string;
      additionalContext?: Record<string, any>;
    } = {}
  ): MCPError {
    // Convert to MCPError if not already
    const mcpError = this.classifyError(error, context);

    // Log the error
    if (this.config.enableLogging) {
      this.logError(mcpError, context);
    }

    // Update error tracking
    this.updateErrorTracking(mcpError);

    // Check circuit breaker
    if (this.config.enableCircuitBreaker) {
      this.updateCircuitBreaker(mcpError);
    }

    return mcpError;
  }

  /**
   * Classify an unknown error into appropriate MCP error type
   */
  private classifyError(
    error: unknown,
    context: {
      operation?: string;
      serverId?: string;
      toolName?: string;
      correlationId?: string;
      additionalContext?: Record<string, any>;
    }
  ): MCPError {
    // If already an MCPError, return as-is
    if (error instanceof MCPError) {
      return error;
    }

    const errorMessage = this.extractErrorMessage(error);
    const originalError = error instanceof Error ? error : undefined;

    // Classify based on error message patterns
    for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(errorMessage))) {
        return this.createErrorByCategory(
          category as keyof typeof ERROR_PATTERNS,
          errorMessage,
          context,
          originalError
        );
      }
    }

    // Default to generic MCPError
    return new MCPError(errorMessage, {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.NONE,
      retryable: false,
      serverId: context.serverId,
      toolName: context.toolName,
      correlationId: context.correlationId,
      context: context.additionalContext
    }, originalError);
  }

  /**
   * Create error by category
   */
  private createErrorByCategory(
    category: keyof typeof ERROR_PATTERNS,
    message: string,
    context: any,
    originalError?: Error
  ): MCPError {
    switch (category) {
      case 'connection':
        return new MCPConnectionError(
          message,
          context.serverId,
          originalError,
          context.additionalContext
        );
      case 'authentication':
        return new MCPAuthenticationError(
          message,
          context.serverId,
          originalError,
          context.additionalContext
        );
      case 'server':
        return new MCPServerError(
          message,
          context.serverId,
          originalError,
          context.additionalContext
        );
      case 'rateLimit':
        return new MCPRateLimitError(
          message,
          undefined,
          originalError,
          context.additionalContext
        );
      case 'timeout':
        return new MCPTimeoutError(
          message,
          0,
          context.serverId,
          originalError,
          context.additionalContext
        );
      case 'validation':
        return new MCPValidationError(
          message,
          undefined,
          originalError,
          context.additionalContext
        );
      default:
        return new MCPError(message, {
          category: ErrorCategory.UNKNOWN,
          severity: ErrorSeverity.MEDIUM,
          recoveryStrategy: RecoveryStrategy.NONE,
          retryable: false,
          serverId: context.serverId,
          correlationId: context.correlationId,
          context: context.additionalContext
        }, originalError);
    }
  }

  /**
   * Extract error message from unknown error
   */
  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'Unknown error occurred';
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    error: MCPError,
    context: {
      operation?: string;
      serverId?: string;
      toolName?: string;
      correlationId?: string;
    }
  ): void {
    const logData = {
      error: error.toJSON(),
      context,
      timestamp: new Date().toISOString()
    };

    const logMessage = `[${error.details.category.toUpperCase()}] ${error.message}`;

    switch (error.details.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logMessage, logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logMessage, logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logMessage, logData);
        break;
      case ErrorSeverity.LOW:
        console.info('ℹ️ LOW SEVERITY ERROR:', logMessage, logData);
        break;
    }
  }

  /**
   * Update error tracking for circuit breaker
   */
  private updateErrorTracking(error: MCPError): void {
    const key = error.details.serverId || 'global';
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);
  }

  /**
   * Update circuit breaker state
   */
  private updateCircuitBreaker(error: MCPError): void {
    if (!error.details.serverId) return;

    const errorCount = this.errorCounts.get(error.details.serverId) || 0;
    if (errorCount >= this.config.circuitBreakerThreshold) {
      this.circuitBreakers.set(error.details.serverId, true);
      console.warn(`🔌 Circuit breaker opened for server: ${error.details.serverId}`);
    }
  }

  /**
   * Check if circuit breaker is open for a server
   */
  isCircuitBreakerOpen(serverId: string): boolean {
    return this.circuitBreakers.get(serverId) || false;
  }

  /**
   * Reset circuit breaker for a server
   */
  resetCircuitBreaker(serverId: string): void {
    this.circuitBreakers.set(serverId, false);
    this.errorCounts.set(serverId, 0);
    console.info(`🔌 Circuit breaker reset for server: ${serverId}`);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByServer: Record<string, number>;
    openCircuitBreakers: string[];
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const errorsByServer = Object.fromEntries(this.errorCounts);
    const openCircuitBreakers = Array.from(this.circuitBreakers.entries())
      .filter(([_, isOpen]) => isOpen)
      .map(([serverId]) => serverId);

    return {
      totalErrors,
      errorsByServer,
      openCircuitBreakers
    };
  }

  /**
   * Reset all error tracking
   */
  reset(): void {
    this.errorCounts.clear();
    this.circuitBreakers.clear();
  }
}
