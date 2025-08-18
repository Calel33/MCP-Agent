#!/usr/bin/env node

/**
 * CLI Entry Point for MCP Multi-Agent
 *
 * This is the main command-line interface for the Multiple MCP Servers General Purpose Agent.
 * It provides commands for querying the agent, managing servers, and configuring the system.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

/**
 * Create and configure the main CLI program
 */
function createProgram(): Command {
  const program = new Command();

  // Basic program configuration
  program
    .name('mcp-agent')
    .description('Multiple MCP Servers General Purpose Agent - CLI Interface')
    .version(packageJson.version, '-v, --version', 'display version number')
    .helpOption('-h, --help', 'display help for command');

  // Global options
  program
    .option('--verbose', 'enable verbose output')
    .option('--quiet', 'suppress non-essential output')
    .option('--no-color', 'disable colored output')
    .option('--config <path>', 'path to configuration file')
    .option('--env <path>', 'path to environment file');

  // Add command groups (dynamically loaded)
  addQueryCommands(program);
  addServerCommands(program);
  addConfigCommands(program);

  // Add global help text with examples
  program.addHelpText('after', `
Examples:
  # Query the agent
  $ mcp-agent query "What is the weather like today?"
  $ mcp-agent q "List files in current directory" --stream

  # Manage servers
  $ mcp-agent server list
  $ mcp-agent server status --server filesystem

  # Configuration
  $ mcp-agent config init
  $ mcp-agent config show
  $ mcp-agent config validate

  # Get help for specific commands
  $ mcp-agent query --help
  $ mcp-agent server --help
  $ mcp-agent config --help

For more information, visit: https://github.com/user/mcp-multi-agent
`);

  // Add global error handling
  program.exitOverride((err) => {
    if (err.code === 'commander.version') {
      console.log(packageJson.version);
      process.exit(0);
    }
    if (err.code === 'commander.help') {
      process.exit(0);
    }
    if (err.code === 'commander.helpDisplayed') {
      process.exit(0);
    }

    // Handle other errors
    console.error(chalk.red('Error:'), err.message);
    process.exit(err.exitCode || 1);
  });

  return program;
}

/**
 * Add query-related commands
 */
function addQueryCommands(program: Command): void {
  const queryCommand = new Command('query')
    .alias('q')
    .description('send a query to the multi-server agent')
    .argument('<question>', 'the question or request to send to the agent')
    .option('-s, --stream', 'enable streaming response output')
    .option('-m, --max-steps <number>', 'maximum number of steps for the agent', '10')
    .option('-t, --timeout <number>', 'timeout in milliseconds', '30000')
    .option('-f, --format <type>', 'output format (text, json)', 'text')
    .action(async (question: string, options: any) => {
      await handleQueryCommand(question, options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent query "What tools do you have access to?"
  $ mcp-agent q "List all files in the current directory" --stream
  $ mcp-agent query "Search for TypeScript files" --format json
  $ mcp-agent query "Help me debug this error" --max-steps 15 --timeout 60000
`);

  program.addCommand(queryCommand);
}

/**
 * Add server management commands
 */
function addServerCommands(program: Command): void {
  const serverCommand = new Command('server')
    .alias('srv')
    .description('manage MCP server connections');

  // Add list subcommand
  serverCommand
    .command('list')
    .alias('ls')
    .description('list all configured MCP servers')
    .option('-e, --enabled-only', 'show only enabled servers')
    .option('-f, --format <type>', 'output format (table, json)', 'table')
    .action(async (options: any) => {
      await handleServerListCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent server list
  $ mcp-agent srv ls --enabled-only
  $ mcp-agent server list --format json
`);

  // Add status subcommand
  serverCommand
    .command('status')
    .description('check the health status of MCP servers')
    .option('-s, --server <id>', 'check specific server by ID')
    .option('-f, --format <type>', 'output format (table, json)', 'table')
    .action(async (options: any) => {
      await handleServerStatusCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent server status
  $ mcp-agent server status --server filesystem
  $ mcp-agent server status --format json
`);

  // Add info subcommand
  serverCommand
    .command('info')
    .description('show detailed information about servers')
    .option('-s, --server <id>', 'show info for specific server')
    .option('-f, --format <type>', 'output format (table, json)', 'table')
    .action(async (options: any) => {
      await handleServerInfoCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent server info
  $ mcp-agent server info --server filesystem
  $ mcp-agent server info --format json
`);

  program.addCommand(serverCommand);
}

/**
 * Add configuration commands
 */
function addConfigCommands(program: Command): void {
  const configCommand = new Command('config')
    .alias('cfg')
    .description('manage configuration settings');

  // Add init subcommand
  configCommand
    .command('init')
    .description('initialize configuration with default settings')
    .option('--force', 'overwrite existing configuration')
    .action(async (options: any) => {
      await handleConfigInitCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config init
  $ mcp-agent config init --force
`);

  // Add show subcommand
  configCommand
    .command('show')
    .description('show current configuration')
    .option('-f, --format <type>', 'output format (table, json)', 'table')
    .action(async (options: any) => {
      await handleConfigShowCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config show
  $ mcp-agent config show --format json
`);

  // Add validate subcommand
  configCommand
    .command('validate')
    .description('validate configuration settings')
    .action(async () => {
      await handleConfigValidateCommand();
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config validate
`);

  program.addCommand(configCommand);
}

/**
 * Handle the query command execution
 */
async function handleQueryCommand(question: string, options: any): Promise<void> {
  const { createLogger, ExitCode, exitWithError } = await import('./utils/logger.js');
  const logger = createLogger();

  try {
    // Validate inputs
    const maxSteps = parseInt(options.maxSteps || '10', 10);
    const timeout = parseInt(options.timeout || '30000', 10);

    if (isNaN(maxSteps) || maxSteps < 1) {
      exitWithError('max-steps must be a positive number', ExitCode.INVALID_USAGE);
    }
    if (isNaN(timeout) || timeout < 1000) {
      exitWithError('timeout must be at least 1000ms', ExitCode.INVALID_USAGE);
    }

    // Show query info if verbose
    logger.verbose('Query configuration', {
      question,
      maxSteps,
      timeout,
      streaming: options.stream,
      format: options.format
    });

    // Import simple agent factory to avoid complex error handling dependencies
    const { getSimpleMultiServerAgent } = await import('./utils/simple-agent-factory.js');

    // Get the agent instance
    if (process.env['CLI_QUIET'] !== 'true') {
      logger.step('Initializing agent...');
    }
    const agent = await getSimpleMultiServerAgent();

    if (options.stream) {
      await handleStreamingQuery(agent, question, { maxSteps, timeout }, options, logger);
    } else {
      await handleStandardQuery(agent, question, { maxSteps, timeout }, options, logger);
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      exitWithError('OpenAI API key not found. Run "mcp-agent config init" to set up configuration.', ExitCode.CONFIG_ERROR, error);
    } else if (error instanceof Error && error.message.includes('timeout')) {
      exitWithError('Query timed out. Try increasing the timeout with --timeout option.', ExitCode.TIMEOUT_ERROR, error);
    } else {
      exitWithError(`Query failed: ${error instanceof Error ? error.message : String(error)}`, ExitCode.GENERAL_ERROR, error);
    }
  }
}

/**
 * Handle standard (non-streaming) query
 */
async function handleStandardQuery(
  agent: any,
  question: string,
  runOptions: { maxSteps: number; timeout: number },
  cliOptions: any,
  logger: any
): Promise<void> {
  logger.progress('Processing query...');

  const startTime = Date.now();
  const result = await agent.run(question, runOptions);
  const endTime = Date.now();

  // Format and display results
  if (cliOptions.format === 'json') {
    logger.json({
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
    });
  } else {
    // Text format
    logger.success('Query completed successfully');
    logger.output('\n' + result.response);

    if (result.toolsUsed && result.toolsUsed.length > 0) {
      logger.info(`Tools used: ${result.toolsUsed.join(', ')}`);
    }

    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach((warning: string) => logger.warn(warning));
    }

    logger.verbose(`Execution time: ${endTime - startTime}ms`);
  }
}

/**
 * Handle streaming query
 */
async function handleStreamingQuery(
  agent: any,
  question: string,
  runOptions: { maxSteps: number; timeout: number },
  cliOptions: any,
  logger: any
): Promise<void> {
  logger.progress('Streaming response...\n');

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
    logger.json({
      query: question,
      response: responseText,
      executionTime: endTime - startTime,
      streaming: true,
      metadata: {
        maxSteps: runOptions.maxSteps,
        timeout: runOptions.timeout,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    logger.verbose(`Streaming completed in ${endTime - startTime}ms`);
  }
}

/**
 * Handle server list command
 */
async function handleServerListCommand(options: any): Promise<void> {
  try {
    console.log(chalk.blue('📡 Retrieving server list...'));

    // Load configuration to get server list
    const { loadConfig } = await import('@/config/loader.js');
    const config = loadConfig();

    const servers = config.servers;
    const filteredServers = options.enabledOnly
      ? servers.filter((s: any) => s.enabled)
      : servers;

    if (options.format === 'json') {
      console.log(JSON.stringify({
        totalServers: servers.length,
        enabledServers: servers.filter((s: any) => s.enabled).length,
        servers: filteredServers
      }, null, 2));
    } else {
      // Table format
      const totalServers = servers.length;
      const enabledServers = servers.filter((s: any) => s.enabled).length;

      console.log(chalk.green(`\n📊 Server Summary: ${totalServers} total, ${enabledServers} enabled\n`));

      if (filteredServers.length === 0) {
        console.log(chalk.yellow('No servers found.'));
        return;
      }

      console.log(chalk.bold('ID'.padEnd(20) + 'Name'.padEnd(25) + 'Status'.padEnd(10) + 'Type'));
      console.log('─'.repeat(70));

      filteredServers.forEach((server: any) => {
        const status = server.enabled ? chalk.green('enabled') : chalk.gray('disabled');
        const type = server.connectionType || 'unknown';

        console.log(
          server.id.padEnd(20) +
          server.name.padEnd(25) +
          status.padEnd(10) +
          type
        );

        if (server.description) {
          console.log(chalk.gray(`  └─ ${server.description}`));
        }
      });
    }

  } catch (error) {
    console.error(chalk.red('Failed to list servers:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle server status command
 */
async function handleServerStatusCommand(options: any): Promise<void> {
  try {
    console.log(chalk.blue('🔍 Checking server status...'));

    // Load configuration
    const { loadConfig } = await import('@/config/loader.js');
    const config = loadConfig();

    const servers = config.servers;
    const targetServers = options.server
      ? servers.filter((s: any) => s.id === options.server)
      : servers.filter((s: any) => s.enabled);

    if (targetServers.length === 0) {
      if (options.server) {
        console.error(chalk.red(`Server '${options.server}' not found`));
      } else {
        console.log(chalk.yellow('No enabled servers found'));
      }
      process.exit(1);
    }

    if (options.format === 'json') {
      const statusData = targetServers.map((server: any) => ({
        id: server.id,
        name: server.name,
        enabled: server.enabled,
        connectionType: server.connectionType,
        status: server.enabled ? 'configured' : 'disabled'
      }));

      console.log(JSON.stringify({ servers: statusData }, null, 2));
    } else {
      console.log(chalk.green('\n📊 Server Status\n'));

      targetServers.forEach((server: any) => {
        const status = server.enabled ? chalk.green('CONFIGURED') : chalk.gray('DISABLED');
        console.log(`${status} ${server.id} - ${server.name}`);
        console.log(chalk.gray(`  └─ Type: ${server.connectionType || 'unknown'}`));

        if (server.command) {
          console.log(chalk.gray(`  └─ Command: ${server.command} ${(server.args || []).join(' ')}`));
        }
      });
    }

  } catch (error) {
    console.error(chalk.red('Failed to check server status:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle server info command
 */
async function handleServerInfoCommand(options: any): Promise<void> {
  try {
    console.log(chalk.blue('📋 Retrieving server information...'));

    // Load configuration
    const { loadConfig } = await import('@/config/loader.js');
    const config = loadConfig();

    const servers = config.servers;

    if (options.server) {
      // Single server detailed info
      const server = servers.find((s: any) => s.id === options.server);
      if (!server) {
        console.error(chalk.red(`Server '${options.server}' not found`));
        process.exit(1);
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(server, null, 2));
      } else {
        console.log(chalk.green('\n📊 Server Information\n'));
        console.log(chalk.bold(`${server.name} (${server.id})`));
        console.log(`Description: ${server.description || 'No description'}`);
        console.log(`Type: ${server.connectionType}`);
        console.log(`Status: ${server.enabled ? chalk.green('Enabled') : chalk.gray('Disabled')}`);
        console.log(`Priority: ${server.priority || 'Not set'}`);

        if (server.command) {
          console.log(`Command: ${server.command}`);
          if (server.args && server.args.length > 0) {
            console.log(`Arguments: ${server.args.join(' ')}`);
          }
        }

        if (server.tags && server.tags.length > 0) {
          console.log(`Tags: ${server.tags.join(', ')}`);
        }
      }
    } else {
      // Summary of all servers
      if (options.format === 'json') {
        console.log(JSON.stringify({ servers }, null, 2));
      } else {
        console.log(chalk.green('\n📊 All Servers Information\n'));

        servers.forEach((server: any) => {
          const status = server.enabled ? chalk.green('✓') : chalk.gray('○');
          console.log(`${status} ${server.id} - ${server.name}`);
          console.log(chalk.gray(`  └─ ${server.description || 'No description'}`));
        });
      }
    }

  } catch (error) {
    console.error(chalk.red('Failed to get server info:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle config init command
 */
async function handleConfigInitCommand(options: any): Promise<void> {
  try {
    console.log(chalk.blue('🔧 Initializing configuration...'));

    // Check if .env file exists
    const { existsSync } = await import('fs');
    const envPath = '.env';

    if (existsSync(envPath) && !options.force) {
      console.log(chalk.yellow('⚠️  .env file already exists. Use --force to overwrite.'));
      return;
    }

    // Create .env file with template
    const { writeFileSync } = await import('fs');
    const envTemplate = `# MCP Multi-Agent Environment Configuration
# OpenAI API Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Agent Configuration
AGENT_MAX_STEPS=10
AGENT_TIMEOUT=60000

# Server Manager Configuration
MAX_CONCURRENT_SERVERS=3
SERVER_STARTUP_TIMEOUT=30

# Logging Configuration
LOG_LEVEL=info
NODE_ENV=development
`;

    writeFileSync(envPath, envTemplate);
    console.log(chalk.green(`✅ Configuration template created: ${envPath}`));

    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log(chalk.gray('1. Edit .env and add your OpenAI API key'));
    console.log(chalk.gray('2. Adjust configuration settings as needed'));
    console.log(chalk.gray('3. Run: mcp-agent config validate'));

  } catch (error) {
    console.error(chalk.red('Failed to initialize configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle config show command
 */
async function handleConfigShowCommand(options: any): Promise<void> {
  try {
    console.log(chalk.blue('📋 Loading configuration...'));

    // Load configuration
    const { loadConfig } = await import('@/config/loader.js');
    const config = loadConfig();

    if (options.format === 'json') {
      // Hide sensitive information in JSON output
      const safeConfig = {
        ...config,
        llm: {
          ...config.llm,
          apiKey: config.llm.apiKey ? '***HIDDEN***' : 'NOT_SET'
        }
      };
      console.log(JSON.stringify(safeConfig, null, 2));
    } else {
      // Table format
      console.log(chalk.green('\n📊 Current Configuration\n'));

      // LLM Configuration
      console.log(chalk.bold('LLM Configuration:'));
      console.log(`  Model: ${config.llm.model}`);
      console.log(`  API Key: ${config.llm.apiKey ? chalk.green('✓ Set') : chalk.red('✗ Not set')}`);
      console.log(`  Temperature: ${config.llm.temperature ?? 'default'}`);
      console.log(`  Max Tokens: ${config.llm.maxTokens ?? 'default'}`);

      // Agent Configuration
      console.log(chalk.bold('\nAgent Configuration:'));
      console.log(`  Max Steps: ${config.agent.maxSteps}`);
      console.log(`  Timeout: ${config.agent.timeout}ms`);

      // Server Manager Configuration
      console.log(chalk.bold('\nServer Manager Configuration:'));
      console.log(`  Enabled: ${config.serverManager.enabled ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`  Max Concurrent Servers: ${config.serverManager.maxConcurrentServers}`);
      console.log(`  Health Check Interval: ${config.serverManager.healthCheckInterval}ms`);

      // Servers
      console.log(chalk.bold('\nServers:'));
      console.log(`  Total: ${config.servers.length}`);
      console.log(`  Enabled: ${config.servers.filter(s => s.enabled).length}`);
      console.log(`  Disabled: ${config.servers.filter(s => !s.enabled).length}`);
    }

  } catch (error) {
    console.error(chalk.red('Failed to show configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle config validate command
 */
async function handleConfigValidateCommand(): Promise<void> {
  try {
    console.log(chalk.blue('🔍 Validating configuration...'));

    // Load configuration
    const { loadConfig } = await import('@/config/loader.js');
    const config = loadConfig();

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate LLM configuration
    if (!config.llm.apiKey) {
      errors.push('OpenAI API key is not set');
    }

    if (!config.llm.model) {
      errors.push('LLM model is not specified');
    }

    // Validate agent configuration
    if (config.agent.maxSteps < 1) {
      errors.push('Agent max steps must be at least 1');
    }

    if (config.agent.maxSteps > 50) {
      warnings.push('Agent max steps > 50 may cause performance issues');
    }

    if (config.agent.timeout < 1000) {
      errors.push('Agent timeout must be at least 1000ms');
    }

    // Validate servers
    const enabledServers = config.servers.filter(s => s.enabled);
    if (enabledServers.length === 0) {
      warnings.push('No servers are enabled - agent will have limited capabilities');
    }

    // Check for duplicate server IDs
    const serverIds = config.servers.map(s => s.id);
    const duplicateIds = serverIds.filter((id, index) => serverIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate server IDs found: ${duplicateIds.join(', ')}`);
    }

    // Display results
    if (errors.length === 0 && warnings.length === 0) {
      console.log(chalk.green('✅ Configuration is valid'));
    } else {
      if (errors.length > 0) {
        console.log(chalk.red('❌ Configuration validation failed'));
        errors.forEach(error => {
          console.log(chalk.red(`  • ${error}`));
        });
      }

      if (warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
      }

      if (errors.length > 0) {
        process.exit(1);
      }
    }

  } catch (error) {
    console.error(chalk.red('Failed to validate configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Setup global CLI options and environment
 */
function setupGlobalOptions(options: any): void {
  // Handle color output
  if (options.noColor) {
    chalk.level = 0;
  }

  // Set verbosity level
  if (options.verbose) {
    process.env['CLI_VERBOSE'] = 'true';
  }
  if (options.quiet) {
    process.env['CLI_QUIET'] = 'true';
  }

  // Set config paths
  if (options.config) {
    process.env['CLI_CONFIG_PATH'] = options.config;
  }
  if (options.env) {
    process.env['CLI_ENV_PATH'] = options.env;
  }
}

/**
 * Main CLI execution function
 */
export async function main(argv?: string[]): Promise<void> {
  try {
    const program = createProgram();
    
    // Parse arguments
    const args = argv || process.argv;
    await program.parseAsync(args);
    
    // Setup global options after parsing
    const options = program.opts();
    setupGlobalOptions(options);
    
  } catch (error) {
    // Handle unexpected errors
    console.error(chalk.red('Unexpected error:'), error instanceof Error ? error.message : String(error));
    
    if (process.env['CLI_VERBOSE'] === 'true') {
      console.error(chalk.gray('Stack trace:'), error);
    }
    
    process.exit(1);
  }
}

/**
 * Run the CLI directly
 */
main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});

export { createProgram };
