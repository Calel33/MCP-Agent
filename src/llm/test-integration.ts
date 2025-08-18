/**
 * Test script for OpenAI LLM integration
 * This is a development utility to test the OpenAI client functionality
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { getOpenAIClient, testOpenAIConnection, createMessage } from './index.js';

/**
 * Test the OpenAI integration
 */
async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI LLM Integration...\n');

  try {
    // Test 1: Connection test
    console.log('1. Testing OpenAI connection...');
    const isConnected = await testOpenAIConnection();
    console.log(`   Connection status: ${isConnected ? '✅ Connected' : '❌ Failed'}\n`);

    if (!isConnected) {
      console.log('❌ OpenAI connection failed. Please check your API key and try again.');
      return;
    }

    // Test 2: Get client and basic configuration
    console.log('2. Creating OpenAI client...');
    const client = await getOpenAIClient();
    const config = client.getConfig();
    console.log(`   Model: ${config.model}`);
    console.log(`   Temperature: ${config.temperature}`);
    console.log(`   Max Tokens: ${config.maxTokens}`);
    console.log(`   Max Retries: ${config.maxRetries}\n`);

    // Test 3: Simple text generation
    console.log('3. Testing text generation...');
    const messages = [createMessage('user', 'Say "Hello, World!" in a friendly way.')];
    const response = await client.generateResponse(messages);
    console.log(`   Response: ${response}\n`);

    // Test 4: Streaming response
    console.log('4. Testing streaming response...');
    console.log('   Streaming: ');
    const streamMessages = [createMessage('user', 'Count from 1 to 5, one number per line.')];
    
    let streamedText = '';
    for await (const chunk of client.streamResponse(streamMessages)) {
      process.stdout.write(chunk);
      streamedText += chunk;
    }
    console.log('\n   Streaming complete.\n');

    console.log('✅ All OpenAI integration tests passed!');

  } catch (error) {
    console.error('❌ OpenAI integration test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 Tip: Make sure to set your OPENAI_API_KEY environment variable.');
        console.log('   You can create a .env file with: OPENAI_API_KEY=your_key_here');
      }
    }
  }
}

/**
 * Run the test if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  testOpenAIIntegration().catch(console.error);
}

export { testOpenAIIntegration };
