/**
 * Error recovery orchestrator for MCP Multi-Agent
 * 
 * Coordinates error handling, retry mechanisms, and graceful degradation
 */

import { MCPError, RecoveryStrategy } from './errors.js';
import { ErrorHandler, ErrorHandlerConfig } from './error-handler.js';
import { RetryMechanism, RetryConfig, RetryResult } from './retry.js';
import { GracefulDegradationManager, DegradationConfig, DegradationResult } from './graceful-degradation.js';

/**
 * Error recovery configuration
 */
export interface ErrorRecoveryConfig {
  errorHandler: Partial<ErrorHandlerConfig>;
  retry: Partial<RetryConfig>;
  degradation: Partial<DegradationConfig>;
  enableMetrics: boolean;
  metricsRetentionTime: number;
}

/**
 * Default error recovery configuration
 */
const DEFAULT_ERROR_RECOVERY_CONFIG: ErrorRecoveryConfig = {
  errorHandler: {
    enableLogging: true,
    logLevel: 'error',
    enableRetry: true,
    maxRetryAttempts: 3,
    enableCircuitBreaker: true,
    enableGracefulDegradation: true
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    enableCircuitBreaker: true
  },
  degradation: {
    enableCaching: true,
    cacheTimeout: 300000,
    maxDegradationTime: 3600000
  },
  enableMetrics: true,
  metricsRetentionTime: 86400000 // 24 hours
};

/**
 * Recovery metrics
 */
export interface RecoveryMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  retriedOperations: number;
  degradedOperations: number;
  averageRetryAttempts: number;
  circuitBreakerActivations: number;
  cacheHits: number;
  fallbackUsage: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recoveryStrategiesUsed: Record<string, number>;
}

/**
 * Operation context for recovery
 */
export interface OperationContext {
  operationName: string;
  serverId?: string;
  toolName?: string;
  correlationId?: string;
  isCritical?: boolean;
  fallbackServers?: string[];
  cacheKey?: string;
  simplifiedFallback?: any;
  metadata?: Record<string, any>;
}

/**
 * Recovery result
 */
export interface RecoveryResult<T> {
  success: boolean;
  result?: T;
  error?: MCPError;
  strategy: RecoveryStrategy;
  retryResult?: RetryResult<T>;
  degradationResult?: DegradationResult<T>;
  metrics: {
    totalTime: number;
    retryAttempts: number;
    fallbackUsed: boolean;
    cacheUsed: boolean;
    degradationLevel: 'none' | 'partial' | 'full';
  };
}

/**
 * Error recovery orchestrator
 */
export class ErrorRecoveryOrchestrator {
  private config: ErrorRecoveryConfig;
  private errorHandler: ErrorHandler;
  private retryMechanism: RetryMechanism;
  private degradationManager: GracefulDegradationManager;
  private metrics: RecoveryMetrics;
  private operationHistory: Array<{
    timestamp: Date;
    operation: string;
    success: boolean;
    strategy: RecoveryStrategy;
    duration: number;
  }> = [];

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_ERROR_RECOVERY_CONFIG, ...config };
    
    // Initialize components
    this.errorHandler = new ErrorHandler(this.config.errorHandler);
    this.retryMechanism = new RetryMechanism(this.config.retry, this.errorHandler);
    this.degradationManager = new GracefulDegradationManager(this.config.degradation, this.errorHandler);
    
    // Initialize metrics
    this.metrics = this.initializeMetrics();
  }

  /**
   * Execute operation with comprehensive error recovery
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context: OperationContext
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    try {
      // First, try the operation with retry mechanism
      const retryResult = await this.retryMechanism.execute(
        operation,
        {
          operation: context.operationName,
          serverId: context.serverId,
          toolName: context.toolName,
          correlationId: context.correlationId,
          metadata: context.metadata
        }
      );

      if (retryResult.success) {
        // Operation succeeded with or without retries
        this.metrics.successfulOperations++;
        if (retryResult.finalAttempt > 1) {
          this.metrics.retriedOperations++;
          this.updateAverageRetryAttempts(retryResult.finalAttempt);
        }

        const result: RecoveryResult<T> = {
          success: true,
          result: retryResult.result,
          strategy: RecoveryStrategy.RETRY,
          retryResult,
          metrics: {
            totalTime: Date.now() - startTime,
            retryAttempts: retryResult.finalAttempt,
            fallbackUsed: false,
            cacheUsed: false,
            degradationLevel: 'none'
          }
        };

        this.recordOperation(context.operationName, true, RecoveryStrategy.RETRY, Date.now() - startTime);
        return result;
      }

      // Retry failed, try graceful degradation
      const degradationResult = await this.degradationManager.executeWithDegradation(
        operation,
        {
          operationName: context.operationName,
          serverId: context.serverId || 'unknown',
          isCritical: context.isCritical,
          fallbackServers: context.fallbackServers,
          cacheKey: context.cacheKey,
          simplifiedFallback: context.simplifiedFallback
        }
      );

      if (degradationResult.success) {
        // Degradation succeeded
        this.metrics.successfulOperations++;
        this.metrics.degradedOperations++;
        this.updateRecoveryStrategyUsage(degradationResult.strategy);

        if (degradationResult.fallbackUsed) {
          this.metrics.fallbackUsage++;
        }

        const result: RecoveryResult<T> = {
          success: true,
          result: degradationResult.result,
          strategy: RecoveryStrategy.GRACEFUL_DEGRADATION,
          retryResult,
          degradationResult,
          metrics: {
            totalTime: Date.now() - startTime,
            retryAttempts: retryResult.finalAttempt,
            fallbackUsed: degradationResult.fallbackUsed,
            cacheUsed: degradationResult.strategy === 'cached_response' as any,
            degradationLevel: degradationResult.degradationLevel
          }
        };

        this.recordOperation(context.operationName, true, RecoveryStrategy.GRACEFUL_DEGRADATION, Date.now() - startTime);
        return result;
      }

      // Both retry and degradation failed
      this.metrics.failedOperations++;
      this.updateErrorMetrics(retryResult.error || degradationResult.originalError);

      const result: RecoveryResult<T> = {
        success: false,
        error: retryResult.error || degradationResult.originalError,
        strategy: RecoveryStrategy.NONE,
        retryResult,
        degradationResult,
        metrics: {
          totalTime: Date.now() - startTime,
          retryAttempts: retryResult.finalAttempt,
          fallbackUsed: degradationResult.fallbackUsed,
          cacheUsed: false,
          degradationLevel: degradationResult.degradationLevel
        }
      };

      this.recordOperation(context.operationName, false, RecoveryStrategy.NONE, Date.now() - startTime);
      return result;

    } catch (error) {
      // Unexpected error in recovery process
      const mcpError = this.errorHandler.handleError(error, {
        operation: context.operationName,
        serverId: context.serverId,
        toolName: context.toolName,
        correlationId: context.correlationId,
        additionalContext: context.metadata
      });

      this.metrics.failedOperations++;
      this.updateErrorMetrics(mcpError);

      const result: RecoveryResult<T> = {
        success: false,
        error: mcpError,
        strategy: RecoveryStrategy.NONE,
        metrics: {
          totalTime: Date.now() - startTime,
          retryAttempts: 0,
          fallbackUsed: false,
          cacheUsed: false,
          degradationLevel: 'full'
        }
      };

      this.recordOperation(context.operationName, false, RecoveryStrategy.NONE, Date.now() - startTime);
      return result;
    }
  }

  /**
   * Get current recovery metrics
   */
  getMetrics(): RecoveryMetrics {
    return { ...this.metrics };
  }

  /**
   * Get operation history
   */
  getOperationHistory(limit?: number): Array<{
    timestamp: Date;
    operation: string;
    success: boolean;
    strategy: RecoveryStrategy;
    duration: number;
  }> {
    const history = [...this.operationHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    overallHealth: 'healthy' | 'degraded' | 'critical';
    successRate: number;
    averageResponseTime: number;
    circuitBreakers: Record<string, any>;
    degradationStatus: any;
    errorRate: number;
  } {
    const successRate = this.metrics.totalOperations > 0 
      ? this.metrics.successfulOperations / this.metrics.totalOperations 
      : 1;

    const errorRate = this.metrics.totalOperations > 0
      ? this.metrics.failedOperations / this.metrics.totalOperations
      : 0;

    const recentHistory = this.getOperationHistory(100);
    const averageResponseTime = recentHistory.length > 0
      ? recentHistory.reduce((sum, op) => sum + op.duration, 0) / recentHistory.length
      : 0;

    let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errorRate > 0.5) {
      overallHealth = 'critical';
    } else if (errorRate > 0.2 || this.metrics.degradedOperations > this.metrics.totalOperations * 0.3) {
      overallHealth = 'degraded';
    }

    return {
      overallHealth,
      successRate,
      averageResponseTime,
      circuitBreakers: this.retryMechanism.getCircuitBreakerStatus(),
      degradationStatus: this.degradationManager.getDegradationStatus(),
      errorRate
    };
  }

  /**
   * Reset all metrics and state
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.operationHistory = [];
    this.retryMechanism.resetAllCircuitBreakers();
    this.degradationManager.clearCache();
    this.degradationManager.resetDegradationTracking();
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): RecoveryMetrics {
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      retriedOperations: 0,
      degradedOperations: 0,
      averageRetryAttempts: 0,
      circuitBreakerActivations: 0,
      cacheHits: 0,
      fallbackUsage: 0,
      errorsByCategory: {},
      errorsBySeverity: {},
      recoveryStrategiesUsed: {}
    };
  }

  /**
   * Update average retry attempts
   */
  private updateAverageRetryAttempts(attempts: number): void {
    const currentAverage = this.metrics.averageRetryAttempts;
    const retriedOps = this.metrics.retriedOperations;
    this.metrics.averageRetryAttempts = ((currentAverage * (retriedOps - 1)) + attempts) / retriedOps;
  }

  /**
   * Update error metrics
   */
  private updateErrorMetrics(error?: MCPError): void {
    if (!error) return;

    // Update by category
    const category = error.details.category;
    this.metrics.errorsByCategory[category] = (this.metrics.errorsByCategory[category] || 0) + 1;

    // Update by severity
    const severity = error.details.severity;
    this.metrics.errorsBySeverity[severity] = (this.metrics.errorsBySeverity[severity] || 0) + 1;
  }

  /**
   * Update recovery strategy usage
   */
  private updateRecoveryStrategyUsage(strategy: string): void {
    this.metrics.recoveryStrategiesUsed[strategy] = (this.metrics.recoveryStrategiesUsed[strategy] || 0) + 1;
  }

  /**
   * Record operation in history
   */
  private recordOperation(
    operation: string,
    success: boolean,
    strategy: RecoveryStrategy,
    duration: number
  ): void {
    this.operationHistory.push({
      timestamp: new Date(),
      operation,
      success,
      strategy,
      duration
    });

    // Clean up old history entries
    if (this.config.enableMetrics) {
      const cutoff = new Date(Date.now() - this.config.metricsRetentionTime);
      this.operationHistory = this.operationHistory.filter(entry => entry.timestamp > cutoff);
    }
  }
}
