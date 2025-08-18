#!/usr/bin/env node

/**
 * Simple test for query functionality
 */

import chalk from 'chalk';
import { loadConfig } from '@/config/loader.js';
import { OpenAIClient } from '@/llm/openai-client.js';

async function testQuery() {
  try {
    console.log(chalk.blue('🔧 Testing basic query functionality...'));
    
    // Load config
    const config = loadConfig();
    console.log(chalk.gray(`📡 Configuration loaded: ${config.servers.length} servers configured`));
    
    // Create OpenAI client
    const openaiClient = new OpenAIClient(config.llm);
    console.log(chalk.gray('🤖 OpenAI client created'));
    
    // Test a simple streaming response
    console.log(chalk.blue('🌊 Testing streaming response...'));
    
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful AI assistant.'
      },
      {
        role: 'user' as const,
        content: 'Hello! Can you tell me what 2+2 equals?'
      }
    ];
    
    let fullResponse = '';
    const streamGenerator = openaiClient.streamResponse(messages, {});
    
    for await (const chunk of streamGenerator) {
      fullResponse += chunk;
      process.stdout.write(chalk.white(chunk));
    }
    
    console.log(chalk.green('\n\n✅ Streaming test completed successfully!'));
    console.log(chalk.gray(`Full response: ${fullResponse}`));
    
  } catch (error) {
    console.error(chalk.red('Test failed:'), error instanceof Error ? error.message : String(error));
    console.error(chalk.gray('Error details:'), error);
    process.exit(1);
  }
}

testQuery();
