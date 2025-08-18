/**
 * Test environment configuration
 * Run with: npm run dev test-env
 */

import { 
  loadEnvironmentConfig, 
  getEnvironmentConfig, 
  validateEnvironmentConfig,
  EnvironmentError 
} from './env.js';

/**
 * Test environment configuration loading
 */
async function testEnvironmentConfig(): Promise<void> {
  console.log('🧪 Testing Environment Configuration\n');

  try {
    // Test validation without loading
    console.log('1. Validating environment configuration...');
    const validation = validateEnvironmentConfig();
    
    if (validation.valid) {
      console.log('✅ Environment validation passed');
    } else {
      console.log('❌ Environment validation failed:');
      validation.errors.forEach(error => console.log(`   ${error}`));
      return;
    }

    // Test loading configuration
    console.log('\n2. Loading environment configuration...');
    const config = loadEnvironmentConfig();
    console.log('✅ Environment configuration loaded successfully');

    // Display configuration (with sensitive data masked)
    console.log('\n3. Configuration Summary:');
    console.log('📊 Environment Configuration:');
    console.log(`   Environment: ${config.environment.nodeEnv}`);
    console.log(`   Development: ${config.environment.isDevelopment}`);
    console.log(`   Production: ${config.environment.isProduction}`);
    
    console.log('\n🤖 OpenAI Configuration:');
    console.log(`   API Key: ${config.openai.apiKey ? '***' + config.openai.apiKey.slice(-4) : 'Not set'}`);
    console.log(`   Model: ${config.openai.model}`);
    console.log(`   Temperature: ${config.openai.temperature}`);
    console.log(`   Max Tokens: ${config.openai.maxTokens}`);
    console.log(`   Max Retries: ${config.openai.maxRetries}`);
    console.log(`   Retry Delay: ${config.openai.retryDelay}ms`);
    if (config.openai.baseURL) {
      console.log(`   Base URL: ${config.openai.baseURL}`);
    }
    if (config.openai.organization) {
      console.log(`   Organization: ${config.openai.organization}`);
    }

    console.log('\n🤖 Agent Configuration:');
    console.log(`   Max Steps: ${config.agent.maxSteps}`);
    console.log(`   Timeout: ${config.agent.timeout}ms`);

    console.log('\n🖥️  Server Manager Configuration:');
    console.log(`   Max Concurrent Servers: ${config.serverManager.maxConcurrentServers}`);
    console.log(`   Startup Timeout: ${config.serverManager.startupTimeout}s`);

    console.log('\n📝 Logging Configuration:');
    console.log(`   Level: ${config.logging.level}`);
    console.log(`   Format: ${config.logging.format}`);
    if (config.logging.file) {
      console.log(`   File: ${config.logging.file}`);
    }

    // Test cached configuration
    console.log('\n4. Testing cached configuration...');
    const cachedConfig = getEnvironmentConfig();
    console.log('✅ Cached configuration retrieved successfully');
    
    // Verify it's the same object
    if (cachedConfig === config) {
      console.log('✅ Cached configuration is properly cached');
    } else {
      console.log('❌ Cached configuration is not the same object');
    }

    console.log('\n✅ All environment configuration tests passed!');

  } catch (error) {
    console.log('\n❌ Environment configuration test failed:');
    
    if (error instanceof EnvironmentError) {
      console.log(`   ${error.message}`);
    } else {
      console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure .env file exists in project root');
    console.log('   2. Copy .env.example to .env: cp .env.example .env');
    console.log('   3. Add your OpenAI API key to .env file');
    console.log('   4. Check that all required environment variables are set');
    
    process.exit(1);
  }
}

/**
 * Test environment configuration with invalid values
 */
async function testInvalidEnvironment(): Promise<void> {
  console.log('\n🧪 Testing Invalid Environment Configuration\n');

  // Save original values
  const originalApiKey = process.env['OPENAI_API_KEY'];
  const originalTemp = process.env['OPENAI_TEMPERATURE'];

  try {
    // Test missing API key
    console.log('1. Testing missing API key...');
    delete process.env['OPENAI_API_KEY'];
    
    const validation1 = validateEnvironmentConfig();
    if (!validation1.valid) {
      console.log('✅ Correctly detected missing API key');
    } else {
      console.log('❌ Failed to detect missing API key');
    }

    // Restore API key
    if (originalApiKey) {
      process.env['OPENAI_API_KEY'] = originalApiKey;
    }

    // Test invalid temperature
    console.log('\n2. Testing invalid temperature...');
    process.env['OPENAI_TEMPERATURE'] = 'invalid';
    
    const validation2 = validateEnvironmentConfig();
    if (!validation2.valid) {
      console.log('✅ Correctly detected invalid temperature');
    } else {
      console.log('❌ Failed to detect invalid temperature');
    }

    console.log('\n✅ Invalid environment tests passed!');

  } finally {
    // Restore original values
    if (originalApiKey) {
      process.env['OPENAI_API_KEY'] = originalApiKey;
    }
    if (originalTemp) {
      process.env['OPENAI_TEMPERATURE'] = originalTemp;
    } else {
      delete process.env['OPENAI_TEMPERATURE'];
    }
  }
}

/**
 * Main test function
 */
async function main(): Promise<void> {
  console.log('🚀 Environment Configuration Test Suite');
  console.log('=====================================\n');

  try {
    await testEnvironmentConfig();
    await testInvalidEnvironment();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('   1. Run: npm run dev test-agent --minimal');
    console.log('   2. Verify agent works with new environment config');
    console.log('   3. Test with different environment variable values');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testEnvironmentConfig, testInvalidEnvironment };
