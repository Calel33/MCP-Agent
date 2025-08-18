#!/usr/bin/env node

/**
 * Multiple MCP Servers General Purpose Agent
 *
 * A TypeScript-based AI agent that connects to multiple MCP servers
 * using the mcp-use library, with intelligent server selection and
 * OpenAI integration for natural language processing.
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { program } from 'commander';
import chalk from 'chalk';

// Version from package.json
const packageJson = await import('../package.json', { assert: { type: 'json' } });
const version = packageJson.default.version;

console.log(chalk.blue.bold(`
🚀 MCP Multi-Agent v${version}
Multiple MCP Servers General Purpose Agent
`));

program
  .name('mcp-multi-agent')
  .description('AI agent with multiple MCP server support')
  .version(version);

program
  .option('-c, --chat', 'Start interactive chat mode')
  .option('-s, --servers <servers>', 'Comma-separated list of server names to use')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    try {
      console.log(chalk.yellow('🔧 Initializing MCP Multi-Agent...'));

      if (options.chat) {
        console.log(chalk.green('💬 Starting interactive chat mode...'));
        // TODO: Implement chat mode in Phase 4
        console.log(chalk.red('❌ Chat mode not yet implemented. Coming in Phase 4!'));
      } else {
        console.log(chalk.green('🤖 Starting agent in command mode...'));
        // TODO: Implement command mode
        console.log(chalk.red('❌ Command mode not yet implemented. Coming in Phase 2-3!'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error starting agent:'), error);
      process.exit(1);
    }
  });

// Add test command for OpenAI integration
program
  .command('test-openai')
  .description('Test OpenAI LLM integration')
  .action(async () => {
    try {
      const { testOpenAIIntegration } = await import('./llm/test-integration.js');
      await testOpenAIIntegration();
    } catch (error) {
      console.error(chalk.red('❌ Error testing OpenAI integration:'), error);
      process.exit(1);
    }
  });

// Add test command for Multi-Server Agent
program
  .command('test-agent')
  .description('Test Multi-Server Agent implementation')
  .option('--minimal', 'Run minimal test without external servers')
  .action(async (options) => {
    try {
      if (options.minimal) {
        const { testMinimalAgent } = await import('./agent/test-agent.js');
        await testMinimalAgent();
      } else {
        const { runAllAgentTests } = await import('./agent/test-agent.js');
        await runAllAgentTests();
      }
    } catch (error) {
      console.error(chalk.red('❌ Error testing Multi-Server Agent:'), error);
      process.exit(1);
    }
  });

// Add test command for Error Handling
program
  .command('test-error-handling')
  .description('Test comprehensive error handling and recovery system')
  .action(async () => {
    try {
      const { runErrorHandlingTests } = await import('./utils/test-error-handling.js');
      await runErrorHandlingTests();
    } catch (error) {
      console.error(chalk.red('❌ Error testing error handling system:'), error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
