/**
 * Comprehensive test suite for error handling and recovery system
 */

import {
  ErrorHandler,
  RetryMechanism,
  GracefulDegradationManager,
  ErrorRecoveryOrchestrator,
  MCPError,
  MCPConnectionError,
  MCPServerError,
  MCPToolExecutionError,
  MCPTimeoutError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy
} from './index.js';

/**
 * Test error handling classification
 */
async function testErrorClassification(): Promise<void> {
  console.log('\n🧪 Testing Error Classification...');
  
  const errorHandler = new ErrorHandler();
  
  // Test connection error classification
  const connectionError = new Error('ECONNREFUSED: Connection refused');
  const classifiedConnection = errorHandler.handleError(connectionError, {
    operation: 'test_connection',
    serverId: 'test-server'
  });
  
  console.log(`✅ Connection error classified as: ${classifiedConnection.details.category}`);
  console.log(`   Retryable: ${classifiedConnection.isRetryable()}`);
  console.log(`   Recovery strategy: ${classifiedConnection.getRecoveryStrategy()}`);
  
  // Test authentication error classification
  const authError = new Error('401 Unauthorized: Invalid API key');
  const classifiedAuth = errorHandler.handleError(authError, {
    operation: 'test_auth',
    serverId: 'test-server'
  });
  
  console.log(`✅ Auth error classified as: ${classifiedAuth.details.category}`);
  console.log(`   Retryable: ${classifiedAuth.isRetryable()}`);
  console.log(`   Recovery strategy: ${classifiedAuth.getRecoveryStrategy()}`);
  
  // Test timeout error classification
  const timeoutError = new Error('Request timeout after 5000ms');
  const classifiedTimeout = errorHandler.handleError(timeoutError, {
    operation: 'test_timeout',
    serverId: 'test-server'
  });
  
  console.log(`✅ Timeout error classified as: ${classifiedTimeout.details.category}`);
  console.log(`   Retryable: ${classifiedTimeout.isRetryable()}`);
  console.log(`   Recovery strategy: ${classifiedTimeout.getRecoveryStrategy()}`);
}

/**
 * Test retry mechanism
 */
async function testRetryMechanism(): Promise<void> {
  console.log('\n🔄 Testing Retry Mechanism...');
  
  const retryMechanism = new RetryMechanism({
    maxAttempts: 3,
    baseDelay: 100,
    maxDelay: 1000,
    backoffMultiplier: 2,
    jitter: false // Disable for predictable testing
  });
  
  let attemptCount = 0;
  
  // Test successful retry
  const successResult = await retryMechanism.execute(
    async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary failure');
      }
      return 'Success!';
    },
    {
      operation: 'test_retry_success',
      serverId: 'test-server',
      correlationId: 'test-001'
    }
  );
  
  console.log(`✅ Retry success result:`, {
    success: successResult.success,
    attempts: successResult.finalAttempt,
    result: successResult.result
  });
  
  // Test retry failure
  attemptCount = 0;
  const failureResult = await retryMechanism.execute(
    async () => {
      attemptCount++;
      throw new Error('Persistent failure');
    },
    {
      operation: 'test_retry_failure',
      serverId: 'test-server',
      correlationId: 'test-002'
    }
  );
  
  console.log(`✅ Retry failure result:`, {
    success: failureResult.success,
    attempts: failureResult.finalAttempt,
    error: failureResult.error?.message
  });
}

/**
 * Test graceful degradation
 */
async function testGracefulDegradation(): Promise<void> {
  console.log('\n🛡️ Testing Graceful Degradation...');
  
  const degradationManager = new GracefulDegradationManager({
    enableCaching: true,
    cacheTimeout: 5000,
    fallbackServers: {
      'primary-server': ['backup-server-1', 'backup-server-2']
    }
  });
  
  // Test with simplified fallback
  const degradationResult = await degradationManager.executeWithDegradation(
    async () => {
      throw new Error('Primary server unavailable');
    },
    {
      operationName: 'test_operation',
      serverId: 'primary-server',
      isCritical: false,
      simplifiedFallback: { message: 'Simplified response due to server unavailability' }
    }
  );
  
  console.log(`✅ Degradation result:`, {
    success: degradationResult.success,
    strategy: degradationResult.strategy,
    fallbackUsed: degradationResult.fallbackUsed,
    degradationLevel: degradationResult.degradationLevel,
    result: degradationResult.result
  });
}

/**
 * Test error recovery orchestrator
 */
async function testErrorRecoveryOrchestrator(): Promise<void> {
  console.log('\n🎭 Testing Error Recovery Orchestrator...');
  
  const orchestrator = new ErrorRecoveryOrchestrator({
    retry: {
      maxAttempts: 2,
      baseDelay: 50,
      jitter: false
    },
    degradation: {
      enableCaching: true
    }
  });
  
  let operationCount = 0;
  
  // Test successful operation
  const successResult = await orchestrator.executeWithRecovery(
    async () => {
      operationCount++;
      if (operationCount === 1) {
        throw new Error('First attempt fails');
      }
      return { data: 'Operation successful', attempt: operationCount };
    },
    {
      operationName: 'test_orchestrator_success',
      serverId: 'test-server',
      isCritical: false,
      correlationId: 'orch-001'
    }
  );
  
  console.log(`✅ Orchestrator success result:`, {
    success: successResult.success,
    strategy: successResult.strategy,
    retryAttempts: successResult.metrics.retryAttempts,
    totalTime: successResult.metrics.totalTime,
    result: successResult.result
  });
  
  // Test with degradation
  const degradationResult = await orchestrator.executeWithRecovery(
    async () => {
      throw new Error('Persistent failure');
    },
    {
      operationName: 'test_orchestrator_degradation',
      serverId: 'test-server',
      isCritical: false,
      simplifiedFallback: { message: 'Fallback response' },
      correlationId: 'orch-002'
    }
  );
  
  console.log(`✅ Orchestrator degradation result:`, {
    success: degradationResult.success,
    strategy: degradationResult.strategy,
    degradationLevel: degradationResult.metrics.degradationLevel,
    fallbackUsed: degradationResult.metrics.fallbackUsed,
    result: degradationResult.result
  });
  
  // Get metrics
  const metrics = orchestrator.getMetrics();
  console.log(`📊 Orchestrator metrics:`, {
    totalOperations: metrics.totalOperations,
    successfulOperations: metrics.successfulOperations,
    failedOperations: metrics.failedOperations,
    retriedOperations: metrics.retriedOperations,
    degradedOperations: metrics.degradedOperations
  });
}

/**
 * Test circuit breaker functionality
 */
async function testCircuitBreaker(): Promise<void> {
  console.log('\n🔌 Testing Circuit Breaker...');
  
  const retryMechanism = new RetryMechanism({
    maxAttempts: 1,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 3,
    circuitBreakerTimeout: 1000
  });
  
  // Trigger circuit breaker
  for (let i = 0; i < 5; i++) {
    const result = await retryMechanism.execute(
      async () => {
        throw new Error(`Failure ${i + 1}`);
      },
      {
        operation: 'test_circuit_breaker',
        serverId: 'failing-server',
        correlationId: `cb-${i}`
      }
    );
    
    console.log(`   Attempt ${i + 1}: ${result.success ? 'Success' : 'Failed'}`);
  }
  
  const circuitStatus = retryMechanism.getCircuitBreakerStatus();
  console.log(`✅ Circuit breaker status:`, circuitStatus);
}

/**
 * Test custom error types
 */
async function testCustomErrorTypes(): Promise<void> {
  console.log('\n🏷️ Testing Custom Error Types...');
  
  // Test MCPConnectionError
  const connectionError = new MCPConnectionError(
    'Failed to connect to server',
    'test-server',
    new Error('ECONNREFUSED'),
    { port: 8080, host: 'localhost' }
  );
  
  console.log(`✅ MCPConnectionError:`, {
    category: connectionError.details.category,
    severity: connectionError.details.severity,
    retryable: connectionError.isRetryable(),
    recoveryStrategy: connectionError.getRecoveryStrategy(),
    serverId: connectionError.details.serverId
  });
  
  // Test MCPToolExecutionError
  const toolError = new MCPToolExecutionError(
    'Tool execution failed',
    'file_read',
    'filesystem-server',
    new Error('Permission denied'),
    { path: '/restricted/file.txt' }
  );
  
  console.log(`✅ MCPToolExecutionError:`, {
    category: toolError.details.category,
    severity: toolError.details.severity,
    retryable: toolError.isRetryable(),
    recoveryStrategy: toolError.getRecoveryStrategy(),
    toolName: toolError.details.toolName
  });
  
  // Test error JSON serialization
  const errorJson = connectionError.toJSON();
  console.log(`✅ Error JSON serialization:`, {
    hasName: !!errorJson.name,
    hasMessage: !!errorJson.message,
    hasDetails: !!errorJson.details,
    hasOriginalError: !!errorJson.originalError
  });
}

/**
 * Run all error handling tests
 */
export async function runErrorHandlingTests(): Promise<void> {
  console.log('🚀 Starting Error Handling Tests...');
  
  try {
    await testErrorClassification();
    await testRetryMechanism();
    await testGracefulDegradation();
    await testErrorRecoveryOrchestrator();
    await testCircuitBreaker();
    await testCustomErrorTypes();
    
    console.log('\n✅ All error handling tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error handling tests failed:', error);
    throw error;
  }
}

/**
 * Run tests if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runErrorHandlingTests().catch(console.error);
}
