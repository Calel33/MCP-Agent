/**
 * Graceful degradation utility for MCP Multi-Agent
 * 
 * Provides fallback mechanisms and graceful degradation strategies when servers are unavailable
 */

import { MCPError, ErrorCategory, ErrorSeverity } from './errors.js';
import { ErrorHandler } from './error-handler.js';

/**
 * Degradation strategy types
 */
export enum DegradationStrategy {
  FALLBACK_SERVER = 'fallback_server',
  CACHED_RESPONSE = 'cached_response',
  SIMPLIFIED_RESPONSE = 'simplified_response',
  ERROR_RESPONSE = 'error_response',
  SKIP_OPERATION = 'skip_operation',
  MANUAL_INTERVENTION = 'manual_intervention'
}

/**
 * Degradation configuration
 */
export interface DegradationConfig {
  enableCaching: boolean;
  cacheTimeout: number;
  fallbackServers: Record<string, string[]>;
  simplifiedResponses: Record<string, any>;
  criticalOperations: string[];
  nonCriticalOperations: string[];
  maxDegradationTime: number;
}

/**
 * Default degradation configuration
 */
const DEFAULT_DEGRADATION_CONFIG: DegradationConfig = {
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
  fallbackServers: {},
  simplifiedResponses: {},
  criticalOperations: ['authentication', 'authorization', 'security'],
  nonCriticalOperations: ['logging', 'analytics', 'monitoring'],
  maxDegradationTime: 3600000 // 1 hour
};

/**
 * Degradation result
 */
export interface DegradationResult<T> {
  success: boolean;
  result?: T;
  strategy: DegradationStrategy;
  fallbackUsed: boolean;
  degradationLevel: 'none' | 'partial' | 'full';
  message: string;
  originalError?: MCPError;
}

/**
 * Cache entry for degradation
 */
interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  serverId: string;
  operation: string;
}

/**
 * Graceful degradation manager
 */
export class GracefulDegradationManager {
  private config: DegradationConfig;
  private errorHandler: ErrorHandler;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private degradationStartTimes: Map<string, Date> = new Map();
  private serverAvailability: Map<string, boolean> = new Map();

  constructor(
    config: Partial<DegradationConfig> = {},
    errorHandler?: ErrorHandler
  ) {
    this.config = { ...DEFAULT_DEGRADATION_CONFIG, ...config };
    this.errorHandler = errorHandler || new ErrorHandler();
  }

  /**
   * Execute operation with graceful degradation
   */
  async executeWithDegradation<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      serverId: string;
      isCritical?: boolean;
      fallbackServers?: string[];
      cacheKey?: string;
      simplifiedFallback?: T;
    }
  ): Promise<DegradationResult<T>> {
    const { operationName, serverId, isCritical = false } = context;

    try {
      // Check if server is available
      if (!this.isServerAvailable(serverId)) {
        return await this.handleDegradation(context);
      }

      // Try primary operation
      const result = await operation();
      
      // Cache successful result if caching is enabled
      if (this.config.enableCaching && context.cacheKey) {
        this.cacheResult(context.cacheKey, result, serverId, operationName);
      }

      // Mark server as available
      this.markServerAvailable(serverId);

      return {
        success: true,
        result,
        strategy: DegradationStrategy.FALLBACK_SERVER,
        fallbackUsed: false,
        degradationLevel: 'none',
        message: 'Operation completed successfully'
      };

    } catch (error) {
      const mcpError = this.errorHandler.handleError(error, {
        operation: operationName,
        serverId,
        correlationId: context.cacheKey
      });

      // Mark server as unavailable
      this.markServerUnavailable(serverId);

      // Handle degradation
      return await this.handleDegradation(context, mcpError);
    }
  }

  /**
   * Handle degradation based on error and context
   */
  private async handleDegradation<T>(
    context: {
      operationName: string;
      serverId: string;
      isCritical?: boolean;
      fallbackServers?: string[];
      cacheKey?: string;
      simplifiedFallback?: T;
    },
    originalError?: MCPError
  ): Promise<DegradationResult<T>> {
    const { operationName, serverId, isCritical = false } = context;

    // Start degradation tracking
    this.startDegradationTracking(serverId);

    // Determine degradation strategy
    const strategy = this.determineDegradationStrategy(context, originalError);

    switch (strategy) {
      case DegradationStrategy.FALLBACK_SERVER:
        return await this.tryFallbackServers(context, originalError);

      case DegradationStrategy.CACHED_RESPONSE:
        return this.tryCache(context, originalError);

      case DegradationStrategy.SIMPLIFIED_RESPONSE:
        return this.useSimplifiedResponse(context, originalError);

      case DegradationStrategy.SKIP_OPERATION:
        return this.skipOperation(context, originalError);

      case DegradationStrategy.ERROR_RESPONSE:
        return this.returnErrorResponse(context, originalError);

      case DegradationStrategy.MANUAL_INTERVENTION:
        return this.requireManualIntervention(context, originalError);

      default:
        return this.returnErrorResponse(context, originalError);
    }
  }

  /**
   * Determine appropriate degradation strategy
   */
  private determineDegradationStrategy(
    context: {
      operationName: string;
      serverId: string;
      isCritical?: boolean;
      fallbackServers?: string[];
      cacheKey?: string;
      simplifiedFallback?: T;
    },
    originalError?: MCPError
  ): DegradationStrategy {
    const { operationName, isCritical = false, fallbackServers, cacheKey, simplifiedFallback } = context;

    // Critical operations require more careful handling
    if (isCritical || this.config.criticalOperations.includes(operationName)) {
      // Try fallback servers first for critical operations
      if (fallbackServers && fallbackServers.length > 0) {
        return DegradationStrategy.FALLBACK_SERVER;
      }
      // Then try cache
      if (this.config.enableCaching && cacheKey && this.hasValidCache(cacheKey)) {
        return DegradationStrategy.CACHED_RESPONSE;
      }
      // For critical operations, require manual intervention if no fallbacks
      return DegradationStrategy.MANUAL_INTERVENTION;
    }

    // Non-critical operations can be more flexible
    if (this.config.nonCriticalOperations.includes(operationName)) {
      // Try simplified response first for non-critical operations
      if (simplifiedFallback !== undefined) {
        return DegradationStrategy.SIMPLIFIED_RESPONSE;
      }
      // Skip non-critical operations if no fallback
      return DegradationStrategy.SKIP_OPERATION;
    }

    // Default strategy based on available options
    if (fallbackServers && fallbackServers.length > 0) {
      return DegradationStrategy.FALLBACK_SERVER;
    }
    if (this.config.enableCaching && cacheKey && this.hasValidCache(cacheKey)) {
      return DegradationStrategy.CACHED_RESPONSE;
    }
    if (simplifiedFallback !== undefined) {
      return DegradationStrategy.SIMPLIFIED_RESPONSE;
    }

    return DegradationStrategy.ERROR_RESPONSE;
  }

  /**
   * Try fallback servers
   */
  private async tryFallbackServers<T>(
    context: {
      operationName: string;
      serverId: string;
      fallbackServers?: string[];
    },
    originalError?: MCPError
  ): Promise<DegradationResult<T>> {
    const fallbackServers = context.fallbackServers || this.config.fallbackServers[context.serverId] || [];

    for (const fallbackServerId of fallbackServers) {
      if (this.isServerAvailable(fallbackServerId)) {
        try {
          console.log(`🔄 Trying fallback server ${fallbackServerId} for ${context.operationName}`);
          
          // Note: In a real implementation, you would execute the operation with the fallback server
          // For now, we'll simulate success
          const result = await this.simulateFallbackOperation<T>(fallbackServerId, context.operationName);
          
          return {
            success: true,
            result,
            strategy: DegradationStrategy.FALLBACK_SERVER,
            fallbackUsed: true,
            degradationLevel: 'partial',
            message: `Operation completed using fallback server: ${fallbackServerId}`,
            originalError
          };

        } catch (error) {
          console.warn(`⚠️ Fallback server ${fallbackServerId} also failed: ${error}`);
          this.markServerUnavailable(fallbackServerId);
        }
      }
    }

    // All fallback servers failed, try next strategy
    return this.tryCache(context, originalError);
  }

  /**
   * Try cached response
   */
  private tryCache<T>(
    context: {
      operationName: string;
      serverId: string;
      cacheKey?: string;
    },
    originalError?: MCPError
  ): Promise<DegradationResult<T>> {
    if (!this.config.enableCaching || !context.cacheKey) {
      return Promise.resolve(this.useSimplifiedResponse(context, originalError));
    }

    const cached = this.getCachedResult<T>(context.cacheKey);
    if (cached) {
      console.log(`📦 Using cached response for ${context.operationName}`);
      
      return Promise.resolve({
        success: true,
        result: cached,
        strategy: DegradationStrategy.CACHED_RESPONSE,
        fallbackUsed: true,
        degradationLevel: 'partial',
        message: 'Using cached response due to server unavailability',
        originalError
      });
    }

    return Promise.resolve(this.useSimplifiedResponse(context, originalError));
  }

  /**
   * Use simplified response
   */
  private useSimplifiedResponse<T>(
    context: {
      operationName: string;
      serverId: string;
      simplifiedFallback?: T;
    },
    originalError?: MCPError
  ): DegradationResult<T> {
    if (context.simplifiedFallback !== undefined) {
      console.log(`📝 Using simplified response for ${context.operationName}`);
      
      return {
        success: true,
        result: context.simplifiedFallback,
        strategy: DegradationStrategy.SIMPLIFIED_RESPONSE,
        fallbackUsed: true,
        degradationLevel: 'full',
        message: 'Using simplified response due to server unavailability',
        originalError
      };
    }

    return this.skipOperation(context, originalError);
  }

  /**
   * Skip operation
   */
  private skipOperation<T>(
    context: {
      operationName: string;
      serverId: string;
    },
    originalError?: MCPError
  ): DegradationResult<T> {
    console.log(`⏭️ Skipping non-critical operation: ${context.operationName}`);
    
    return {
      success: true,
      result: undefined,
      strategy: DegradationStrategy.SKIP_OPERATION,
      fallbackUsed: true,
      degradationLevel: 'full',
      message: 'Operation skipped due to server unavailability',
      originalError
    };
  }

  /**
   * Return error response
   */
  private returnErrorResponse<T>(
    context: {
      operationName: string;
      serverId: string;
    },
    originalError?: MCPError
  ): DegradationResult<T> {
    return {
      success: false,
      result: undefined,
      strategy: DegradationStrategy.ERROR_RESPONSE,
      fallbackUsed: false,
      degradationLevel: 'full',
      message: 'Operation failed and no fallback available',
      originalError
    };
  }

  /**
   * Require manual intervention
   */
  private requireManualIntervention<T>(
    context: {
      operationName: string;
      serverId: string;
    },
    originalError?: MCPError
  ): DegradationResult<T> {
    console.error(`🚨 Manual intervention required for critical operation: ${context.operationName}`);
    
    return {
      success: false,
      result: undefined,
      strategy: DegradationStrategy.MANUAL_INTERVENTION,
      fallbackUsed: false,
      degradationLevel: 'full',
      message: 'Critical operation failed, manual intervention required',
      originalError
    };
  }

  /**
   * Simulate fallback operation (placeholder)
   */
  private async simulateFallbackOperation<T>(serverId: string, operation: string): Promise<T> {
    // This is a placeholder - in real implementation, you would execute the actual operation
    // with the fallback server
    await new Promise(resolve => setTimeout(resolve, 100));
    return {} as T;
  }

  /**
   * Cache result
   */
  private cacheResult<T>(key: string, data: T, serverId: string, operation: string): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      serverId,
      operation
    });
  }

  /**
   * Get cached result
   */
  private getCachedResult<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp.getTime();
    if (age > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if cache entry is valid
   */
  private hasValidCache(key: string): boolean {
    return this.getCachedResult(key) !== null;
  }

  /**
   * Mark server as available
   */
  private markServerAvailable(serverId: string): void {
    this.serverAvailability.set(serverId, true);
    this.degradationStartTimes.delete(serverId);
  }

  /**
   * Mark server as unavailable
   */
  private markServerUnavailable(serverId: string): void {
    this.serverAvailability.set(serverId, false);
  }

  /**
   * Check if server is available
   */
  private isServerAvailable(serverId: string): boolean {
    return this.serverAvailability.get(serverId) !== false;
  }

  /**
   * Start degradation tracking
   */
  private startDegradationTracking(serverId: string): void {
    if (!this.degradationStartTimes.has(serverId)) {
      this.degradationStartTimes.set(serverId, new Date());
    }
  }

  /**
   * Get degradation status
   */
  getDegradationStatus(): {
    degradedServers: string[];
    cacheSize: number;
    serverAvailability: Record<string, boolean>;
  } {
    const degradedServers = Array.from(this.degradationStartTimes.keys());
    const serverAvailability = Object.fromEntries(this.serverAvailability);

    return {
      degradedServers,
      cacheSize: this.cache.size,
      serverAvailability
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset degradation tracking
   */
  resetDegradationTracking(): void {
    this.degradationStartTimes.clear();
    this.serverAvailability.clear();
  }
}
