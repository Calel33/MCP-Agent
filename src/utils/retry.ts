/**
 * Retry mechanism utility for MCP Multi-Agent
 * 
 * Provides configurable retry logic with exponential backoff, jitter, and circuit breaker integration
 */

import { MCPError, RecoveryStrategy } from './errors.js';
import { ErrorHandler } from './error-handler.js';

/**
 * Retry configuration options
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  jitterFactor: number;
  retryableErrors: string[];
  nonRetryableErrors: string[];
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  jitterFactor: 0.1,
  retryableErrors: [
    'MCPConnectionError',
    'MCPServerError',
    'MCPTimeoutError',
    'MCPRateLimitError',
    'MCPToolExecutionError'
  ],
  nonRetryableErrors: [
    'MCPAuthenticationError',
    'MCPConfigurationError',
    'MCPValidationError'
  ],
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000
};

/**
 * Retry attempt information
 */
export interface RetryAttempt {
  attempt: number;
  delay: number;
  timestamp: Date;
  error?: Error;
  success: boolean;
}

/**
 * Retry result information
 */
export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: MCPError;
  attempts: RetryAttempt[];
  totalTime: number;
  finalAttempt: number;
}

/**
 * Retry context for tracking and logging
 */
export interface RetryContext {
  operation: string;
  serverId?: string;
  toolName?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

/**
 * Retry mechanism class with exponential backoff and circuit breaker
 */
export class RetryMechanism {
  private config: RetryConfig;
  private errorHandler: ErrorHandler;
  private circuitBreakers: Map<string, { isOpen: boolean; lastFailure: Date; failureCount: number }> = new Map();

  constructor(
    config: Partial<RetryConfig> = {},
    errorHandler?: ErrorHandler
  ) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.errorHandler = errorHandler || new ErrorHandler();
  }

  /**
   * Execute an operation with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    context: RetryContext,
    customConfig?: Partial<RetryConfig>
  ): Promise<RetryResult<T>> {
    const config = { ...this.config, ...customConfig };
    const attempts: RetryAttempt[] = [];
    const startTime = Date.now();

    // Check circuit breaker
    if (config.enableCircuitBreaker && this.isCircuitBreakerOpen(context.serverId)) {
      const error = new MCPError('Circuit breaker is open', {
        category: 'server' as any,
        severity: 'high' as any,
        recoveryStrategy: RecoveryStrategy.CIRCUIT_BREAKER,
        retryable: false,
        serverId: context.serverId,
        correlationId: context.correlationId
      });

      return {
        success: false,
        error,
        attempts: [],
        totalTime: 0,
        finalAttempt: 0
      };
    }

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      const attemptStart = Date.now();
      
      try {
        console.log(`🔄 Attempt ${attempt}/${config.maxAttempts} for operation: ${context.operation}`);
        
        const result = await operation();
        
        const attemptInfo: RetryAttempt = {
          attempt,
          delay: 0,
          timestamp: new Date(),
          success: true
        };
        attempts.push(attemptInfo);

        // Reset circuit breaker on success
        if (context.serverId) {
          this.resetCircuitBreaker(context.serverId);
        }

        console.log(`✅ Operation succeeded on attempt ${attempt}: ${context.operation}`);
        
        return {
          success: true,
          result,
          attempts,
          totalTime: Date.now() - startTime,
          finalAttempt: attempt
        };

      } catch (error) {
        const mcpError = this.errorHandler.handleError(error, {
          operation: context.operation,
          serverId: context.serverId,
          toolName: context.toolName,
          correlationId: context.correlationId,
          additionalContext: context.metadata
        });

        const attemptInfo: RetryAttempt = {
          attempt,
          delay: 0,
          timestamp: new Date(),
          error: mcpError,
          success: false
        };

        // Check if error is retryable
        if (!this.isRetryable(mcpError, config)) {
          attempts.push(attemptInfo);
          console.error(`❌ Non-retryable error on attempt ${attempt}: ${mcpError.message}`);
          
          return {
            success: false,
            error: mcpError,
            attempts,
            totalTime: Date.now() - startTime,
            finalAttempt: attempt
          };
        }

        // Update circuit breaker
        if (config.enableCircuitBreaker && context.serverId) {
          this.updateCircuitBreaker(context.serverId, mcpError);
        }

        // If this is the last attempt, don't wait
        if (attempt === config.maxAttempts) {
          attempts.push(attemptInfo);
          console.error(`❌ Final attempt ${attempt} failed: ${mcpError.message}`);
          
          return {
            success: false,
            error: mcpError,
            attempts,
            totalTime: Date.now() - startTime,
            finalAttempt: attempt
          };
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);
        attemptInfo.delay = delay;
        attempts.push(attemptInfo);

        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms: ${mcpError.message}`);
        
        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    // This should never be reached, but included for completeness
    const finalError = new MCPError('Max retry attempts exceeded', {
      category: 'unknown' as any,
      severity: 'high' as any,
      recoveryStrategy: RecoveryStrategy.MANUAL_INTERVENTION,
      retryable: false,
      serverId: context.serverId,
      correlationId: context.correlationId
    });

    return {
      success: false,
      error: finalError,
      attempts,
      totalTime: Date.now() - startTime,
      finalAttempt: config.maxAttempts
    };
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(error: MCPError, config: RetryConfig): boolean {
    // Check if error type is explicitly non-retryable
    if (config.nonRetryableErrors.includes(error.constructor.name)) {
      return false;
    }

    // Check if error type is explicitly retryable
    if (config.retryableErrors.includes(error.constructor.name)) {
      return true;
    }

    // Use error's own retryable flag
    return error.isRetryable();
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    // Calculate exponential backoff
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay);
    
    // Add jitter if enabled
    if (config.jitter) {
      const jitterAmount = delay * config.jitterFactor;
      const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
      delay += jitter;
    }
    
    return Math.max(0, Math.round(delay));
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if circuit breaker is open for a server
   */
  private isCircuitBreakerOpen(serverId?: string): boolean {
    if (!serverId) return false;
    
    const breaker = this.circuitBreakers.get(serverId);
    if (!breaker) return false;
    
    if (!breaker.isOpen) return false;
    
    // Check if timeout has passed
    const timeSinceFailure = Date.now() - breaker.lastFailure.getTime();
    if (timeSinceFailure > this.config.circuitBreakerTimeout) {
      breaker.isOpen = false;
      breaker.failureCount = 0;
      console.info(`🔌 Circuit breaker timeout expired for ${serverId}, resetting to closed`);
      return false;
    }
    
    return true;
  }

  /**
   * Update circuit breaker state
   */
  private updateCircuitBreaker(serverId: string, error: MCPError): void {
    let breaker = this.circuitBreakers.get(serverId);
    if (!breaker) {
      breaker = { isOpen: false, lastFailure: new Date(), failureCount: 0 };
      this.circuitBreakers.set(serverId, breaker);
    }
    
    breaker.failureCount++;
    breaker.lastFailure = new Date();
    
    if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
      breaker.isOpen = true;
      console.warn(`🔌 Circuit breaker opened for ${serverId} after ${breaker.failureCount} failures`);
    }
  }

  /**
   * Reset circuit breaker for a server
   */
  private resetCircuitBreaker(serverId: string): void {
    const breaker = this.circuitBreakers.get(serverId);
    if (breaker && (breaker.isOpen || breaker.failureCount > 0)) {
      breaker.isOpen = false;
      breaker.failureCount = 0;
      console.info(`🔌 Circuit breaker reset for ${serverId}`);
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Record<string, { isOpen: boolean; failureCount: number; lastFailure: Date }> {
    const status: Record<string, any> = {};
    for (const [serverId, breaker] of this.circuitBreakers.entries()) {
      status[serverId] = {
        isOpen: breaker.isOpen,
        failureCount: breaker.failureCount,
        lastFailure: breaker.lastFailure
      };
    }
    return status;
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    for (const [serverId] of this.circuitBreakers.entries()) {
      this.resetCircuitBreaker(serverId);
    }
  }
}
