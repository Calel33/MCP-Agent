/**
 * Query Command Implementation
 * 
 * Handles the main 'query' command for sending questions/requests to the multi-server agent
 */

import { Command } from 'commander';
import chalk from 'chalk';

/**
 * Create the query command
 */
export function createQueryCommand(): Command {
  const queryCommand = new Command('query')
    .alias('q')
    .description('send a query to the multi-server agent')
    .argument('<question>', 'the question or request to send to the agent')
    .option('-s, --stream', 'enable streaming response output')
    .option('-m, --max-steps <number>', 'maximum number of steps for the agent', '10')
    .option('-t, --timeout <number>', 'timeout in milliseconds', '30000')
    .option('-f, --format <type>', 'output format (text, json)', 'text')
    .option('--no-color', 'disable colored output')
    .action(async (question: string, options: QueryOptions) => {
      await handleQueryCommand(question, options);
    });

  // Add examples
  queryCommand.addHelpText('after', `
Examples:
  $ mcp-agent query "What tools do you have access to?"
  $ mcp-agent q "List all files in the current directory" --stream
  $ mcp-agent query "Search for TypeScript files" --format json
  $ mcp-agent query "Help me debug this error" --max-steps 15 --timeout 60000
`);

  return queryCommand;
}

/**
 * Options for the query command
 */
interface QueryOptions {
  stream?: boolean;
  maxSteps?: string;
  timeout?: string;
  format?: 'text' | 'json';
  noColor?: boolean;
}

/**
 * Handle the query command execution
 */
async function handleQueryCommand(question: string, options: QueryOptions): Promise<void> {
  try {
    // Validate inputs
    const maxSteps = parseInt(options.maxSteps || '10', 10);
    const timeout = parseInt(options.timeout || '30000', 10);

    if (isNaN(maxSteps) || maxSteps < 1) {
      throw new Error('max-steps must be a positive number');
    }
    if (isNaN(timeout) || timeout < 1000) {
      throw new Error('timeout must be at least 1000ms');
    }

    // Show query info if verbose
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.log(chalk.gray('Query configuration:'));
      console.log(chalk.gray(`  Question: ${question}`));
      console.log(chalk.gray(`  Max steps: ${maxSteps}`));
      console.log(chalk.gray(`  Timeout: ${timeout}ms`));
      console.log(chalk.gray(`  Streaming: ${options.stream ? 'enabled' : 'disabled'}`));
      console.log(chalk.gray(`  Format: ${options.format}`));
      console.log('');
    }

    // Import agent modules dynamically to avoid circular dependencies
    const { getMultiServerAgent } = await import('../utils/agent-factory.js');
    
    // Get the agent instance
    const agent = await getMultiServerAgent();

    if (options.stream) {
      await handleStreamingQuery(agent, question, { maxSteps, timeout }, options);
    } else {
      await handleStandardQuery(agent, question, { maxSteps, timeout }, options);
    }

  } catch (error) {
    console.error(chalk.red('Query failed:'), error instanceof Error ? error.message : String(error));
    
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.error(chalk.gray('Error details:'), error);
    }
    
    process.exit(1);
  }
}

/**
 * Handle standard (non-streaming) query
 */
async function handleStandardQuery(
  agent: any, 
  question: string, 
  runOptions: { maxSteps: number; timeout: number },
  cliOptions: QueryOptions
): Promise<void> {
  console.log(chalk.blue('🤖 Processing query...'));
  
  const startTime = Date.now();
  const result = await agent.run(question, runOptions);
  const endTime = Date.now();

  // Format and display results
  if (cliOptions.format === 'json') {
    console.log(JSON.stringify({
      query: question,
      response: result.response,
      executionTime: endTime - startTime,
      toolsUsed: result.toolsUsed || [],
      warnings: result.warnings || [],
      metadata: {
        maxSteps: runOptions.maxSteps,
        timeout: runOptions.timeout,
        timestamp: new Date().toISOString()
      }
    }, null, 2));
  } else {
    // Text format
    console.log(chalk.green('\n✅ Query completed successfully\n'));
    console.log(chalk.white(result.response));
    
    if (result.toolsUsed && result.toolsUsed.length > 0) {
      console.log(chalk.gray(`\n🔧 Tools used: ${result.toolsUsed.join(', ')}`));
    }
    
    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Warnings: ${result.warnings.join(', ')}`));
    }
    
    console.log(chalk.gray(`\n⏱️  Execution time: ${endTime - startTime}ms`));
  }
}

/**
 * Handle streaming query
 */
async function handleStreamingQuery(
  agent: any,
  question: string,
  runOptions: { maxSteps: number; timeout: number },
  cliOptions: QueryOptions
): Promise<void> {
  console.log(chalk.blue('🤖 Streaming response...\n'));
  
  const startTime = Date.now();
  let responseText = '';

  await agent.runStream(question, runOptions, (chunk: string) => {
    responseText += chunk;
    if (cliOptions.format === 'json') {
      // For JSON format, collect chunks and output at the end
      return;
    } else {
      // For text format, output chunks in real-time
      process.stdout.write(chalk.white(chunk));
    }
  });

  const endTime = Date.now();

  if (cliOptions.format === 'json') {
    console.log(JSON.stringify({
      query: question,
      response: responseText,
      executionTime: endTime - startTime,
      streaming: true,
      metadata: {
        maxSteps: runOptions.maxSteps,
        timeout: runOptions.timeout,
        timestamp: new Date().toISOString()
      }
    }, null, 2));
  } else {
    console.log(chalk.gray(`\n\n⏱️  Streaming completed in ${endTime - startTime}ms`));
  }
}
