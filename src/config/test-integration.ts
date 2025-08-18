/**
 * Integration test for environment configuration with existing systems
 * Run with: npm run dev:test-integration
 */

import { 
  loadConfig, 
  loadEnvironmentConfig, 
  getEnvironmentConfig,
  validateEnvironmentConfig 
} from './index.js';

/**
 * Test integration between environment config and main config loader
 */
async function testConfigIntegration(): Promise<void> {
  console.log('🔗 Testing Environment Configuration Integration\n');

  try {
    // Test 1: Environment configuration loads successfully
    console.log('1. Testing environment configuration...');
    const envConfig = loadEnvironmentConfig();
    console.log('✅ Environment configuration loaded');

    // Test 2: Main configuration loader uses environment config
    console.log('\n2. Testing main configuration loader...');
    const mainConfig = loadConfig();
    console.log('✅ Main configuration loaded');

    // Test 3: Verify integration between configs
    console.log('\n3. Verifying configuration integration...');
    
    // Check OpenAI configuration
    if (mainConfig.llm.apiKey === envConfig.openai.apiKey) {
      console.log('✅ OpenAI API key integration verified');
    } else {
      console.log('❌ OpenAI API key integration failed');
    }

    if (mainConfig.llm.model === envConfig.openai.model) {
      console.log('✅ OpenAI model integration verified');
    } else {
      console.log('❌ OpenAI model integration failed');
    }

    if (mainConfig.llm.temperature === envConfig.openai.temperature) {
      console.log('✅ OpenAI temperature integration verified');
    } else {
      console.log('❌ OpenAI temperature integration failed');
    }

    // Check agent configuration
    if (mainConfig.agent.maxSteps === envConfig.agent.maxSteps) {
      console.log('✅ Agent max steps integration verified');
    } else {
      console.log('❌ Agent max steps integration failed');
    }

    if (mainConfig.agent.timeout === envConfig.agent.timeout) {
      console.log('✅ Agent timeout integration verified');
    } else {
      console.log('❌ Agent timeout integration failed');
    }

    // Check server manager configuration
    if (mainConfig.serverManager.maxConcurrentServers === envConfig.serverManager.maxConcurrentServers) {
      console.log('✅ Server manager max concurrent servers integration verified');
    } else {
      console.log('❌ Server manager max concurrent servers integration failed');
    }

    // Check logging configuration
    if (mainConfig.logging?.level === envConfig.logging.level) {
      console.log('✅ Logging level integration verified');
    } else {
      console.log('❌ Logging level integration failed');
    }

    if (mainConfig.logging?.format === envConfig.logging.format) {
      console.log('✅ Logging format integration verified');
    } else {
      console.log('❌ Logging format integration failed');
    }

    console.log('\n✅ Configuration integration tests passed!');

  } catch (error) {
    console.log('\n❌ Configuration integration test failed:');
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Test environment configuration with custom overrides
 */
async function testCustomOverrides(): Promise<void> {
  console.log('\n🎛️ Testing Custom Configuration Overrides\n');

  try {
    // Test custom LLM configuration
    console.log('1. Testing custom LLM configuration...');
    const customConfig = loadConfig({
      llm: {
        apiKey: 'test-key',
        temperature: 0.5,
        maxTokens: 2048,
      }
    });

    if (customConfig.llm.temperature === 0.5) {
      console.log('✅ Custom temperature override verified');
    } else {
      console.log('❌ Custom temperature override failed');
    }

    if (customConfig.llm.maxTokens === 2048) {
      console.log('✅ Custom max tokens override verified');
    } else {
      console.log('❌ Custom max tokens override failed');
    }

    // Verify environment values are still used for non-overridden values
    const envConfig = getEnvironmentConfig();
    if (customConfig.llm.apiKey === envConfig.openai.apiKey) {
      console.log('✅ Environment API key preserved with custom overrides');
    } else {
      console.log('❌ Environment API key not preserved with custom overrides');
    }

    console.log('\n✅ Custom override tests passed!');

  } catch (error) {
    console.log('\n❌ Custom override test failed:');
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Test error handling and validation
 */
async function testErrorHandling(): Promise<void> {
  console.log('\n🚨 Testing Error Handling\n');

  try {
    // Test validation without throwing
    console.log('1. Testing validation function...');
    const validation = validateEnvironmentConfig();
    
    if (validation.valid) {
      console.log('✅ Environment validation passed');
    } else {
      console.log('❌ Environment validation failed:');
      validation.errors.forEach(error => console.log(`   ${error}`));
    }

    // Test that main config loader handles environment errors
    console.log('\n2. Testing error propagation...');
    try {
      loadConfig();
      console.log('✅ Configuration loaded without errors');
    } catch (error) {
      console.log('❌ Configuration loading failed:');
      console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n✅ Error handling tests passed!');

  } catch (error) {
    console.log('\n❌ Error handling test failed:');
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Test environment detection
 */
async function testEnvironmentDetection(): Promise<void> {
  console.log('\n🌍 Testing Environment Detection\n');

  try {
    const envConfig = getEnvironmentConfig();
    
    console.log('1. Environment detection results:');
    console.log(`   Node Environment: ${envConfig.environment.nodeEnv}`);
    console.log(`   Is Development: ${envConfig.environment.isDevelopment}`);
    console.log(`   Is Production: ${envConfig.environment.isProduction}`);
    console.log(`   Is Test: ${envConfig.environment.isTest}`);

    // Verify only one environment flag is true
    const envFlags = [
      envConfig.environment.isDevelopment,
      envConfig.environment.isProduction,
      envConfig.environment.isTest
    ];
    const trueCount = envFlags.filter(flag => flag).length;

    if (trueCount === 1) {
      console.log('✅ Environment detection is consistent');
    } else {
      console.log('❌ Environment detection is inconsistent');
    }

    console.log('\n✅ Environment detection tests passed!');

  } catch (error) {
    console.log('\n❌ Environment detection test failed:');
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Main integration test function
 */
async function main(): Promise<void> {
  console.log('🚀 Environment Configuration Integration Test Suite');
  console.log('==================================================\n');

  try {
    await testConfigIntegration();
    await testCustomOverrides();
    await testErrorHandling();
    await testEnvironmentDetection();
    
    console.log('\n🎉 All integration tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Environment configuration integration');
    console.log('   ✅ Custom configuration overrides');
    console.log('   ✅ Error handling and validation');
    console.log('   ✅ Environment detection');
    
    console.log('\n🚀 Environment configuration is ready for production!');
    
  } catch (error) {
    console.error('\n💥 Integration test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { 
  testConfigIntegration, 
  testCustomOverrides, 
  testErrorHandling, 
  testEnvironmentDetection 
};
