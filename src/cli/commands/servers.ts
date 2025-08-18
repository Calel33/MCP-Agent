/**
 * Server Management Commands
 * 
 * Handles commands for listing, monitoring, and managing MCP server connections
 */

import { Command } from 'commander';
import chalk from 'chalk';

/**
 * Create server management commands
 */
export function createServerCommands(): Command {
  const serverCommand = new Command('server')
    .alias('srv')
    .description('manage MCP server connections');

  // Add subcommands
  serverCommand.addCommand(createListCommand());
  serverCommand.addCommand(createStatusCommand());
  serverCommand.addCommand(createTestCommand());
  serverCommand.addCommand(createInfoCommand());

  return serverCommand;
}

/**
 * Create the 'list' subcommand
 */
function createListCommand(): Command {
  return new Command('list')
    .alias('ls')
    .description('list all configured MCP servers')
    .option('-e, --enabled-only', 'show only enabled servers')
    .option('-f, --format <type>', 'output format (table, json, simple)', 'table')
    .option('--show-config', 'include configuration details')
    .action(async (options: ListOptions) => {
      await handleListCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent server list
  $ mcp-agent srv ls --enabled-only
  $ mcp-agent server list --format json
  $ mcp-agent server list --show-config
`);
}

/**
 * Create the 'status' subcommand
 */
function createStatusCommand(): Command {
  return new Command('status')
    .description('check the health status of MCP servers')
    .option('-s, --server <id>', 'check specific server by ID')
    .option('-f, --format <type>', 'output format (table, json)', 'table')
    .option('--detailed', 'show detailed health information')
    .action(async (options: StatusOptions) => {
      await handleStatusCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent server status
  $ mcp-agent server status --server filesystem
  $ mcp-agent server status --format json --detailed
`);
}

/**
 * Create the 'test' subcommand
 */
function createTestCommand(): Command {
  return new Command('test')
    .description('test connection to MCP servers')
    .option('-s, --server <id>', 'test specific server by ID')
    .option('-t, --timeout <ms>', 'connection timeout in milliseconds', '10000')
    .option('--retry <count>', 'number of retry attempts', '3')
    .action(async (options: TestOptions) => {
      await handleTestCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent server test
  $ mcp-agent server test --server filesystem
  $ mcp-agent server test --timeout 5000 --retry 1
`);
}

/**
 * Create the 'info' subcommand
 */
function createInfoCommand(): Command {
  return new Command('info')
    .description('show detailed information about servers and tools')
    .option('-s, --server <id>', 'show info for specific server')
    .option('--tools', 'include available tools information')
    .option('-f, --format <type>', 'output format (table, json)', 'table')
    .action(async (options: InfoOptions) => {
      await handleInfoCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent server info
  $ mcp-agent server info --server filesystem --tools
  $ mcp-agent server info --format json
`);
}

// Command option interfaces
interface ListOptions {
  enabledOnly?: boolean;
  format?: 'table' | 'json' | 'simple';
  showConfig?: boolean;
}

interface StatusOptions {
  server?: string;
  format?: 'table' | 'json';
  detailed?: boolean;
}

interface TestOptions {
  server?: string;
  timeout?: string;
  retry?: string;
}

interface InfoOptions {
  server?: string;
  tools?: boolean;
  format?: 'table' | 'json';
}

/**
 * Handle the 'list' command
 */
async function handleListCommand(options: ListOptions): Promise<void> {
  try {
    const { getMultiServerAgent } = await import('../utils/agent-factory.js');
    const agent = await getMultiServerAgent();
    
    console.log(chalk.blue('📡 Retrieving server list...'));
    
    const serverInfo = await agent.getServerInfo();
    const servers = await agent.getServerConfigurations();
    
    const filteredServers = options.enabledOnly 
      ? servers.filter((s: any) => s.enabled)
      : servers;

    if (options.format === 'json') {
      console.log(JSON.stringify({
        totalServers: serverInfo.totalServers,
        enabledServers: serverInfo.enabledServers,
        servers: filteredServers
      }, null, 2));
    } else if (options.format === 'simple') {
      filteredServers.forEach((server: any) => {
        const status = server.enabled ? chalk.green('✓') : chalk.gray('○');
        console.log(`${status} ${server.id} - ${server.name}`);
      });
    } else {
      // Table format
      console.log(chalk.green(`\n📊 Server Summary: ${serverInfo.totalServers} total, ${serverInfo.enabledServers} enabled\n`));
      
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
        
        if (options.showConfig && server.enabled) {
          console.log(chalk.gray(`  └─ ${server.description || 'No description'}`));
          if (server.command) {
            console.log(chalk.gray(`     Command: ${server.command} ${(server.args || []).join(' ')}`));
          }
        }
      });
    }
    
  } catch (error) {
    console.error(chalk.red('Failed to list servers:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle the 'status' command
 */
async function handleStatusCommand(options: StatusOptions): Promise<void> {
  try {
    const { getMultiServerAgent } = await import('../utils/agent-factory.js');
    const agent = await getMultiServerAgent();
    
    console.log(chalk.blue('🔍 Checking server health...'));
    
    // This would use the health monitoring system
    const healthStatus = await agent.getHealthStatus(options.server);
    
    if (options.format === 'json') {
      console.log(JSON.stringify(healthStatus, null, 2));
    } else {
      // Table format
      console.log(chalk.green('\n📊 Server Health Status\n'));
      
      if (options.server) {
        // Single server status
        const server = healthStatus.servers.find((s: any) => s.id === options.server);
        if (!server) {
          console.error(chalk.red(`Server '${options.server}' not found`));
          process.exit(1);
        }
        
        displayServerStatus(server, options.detailed);
      } else {
        // All servers status
        healthStatus.servers.forEach((server: any) => {
          displayServerStatus(server, options.detailed);
        });
      }
    }
    
  } catch (error) {
    console.error(chalk.red('Failed to check server status:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle the 'test' command
 */
async function handleTestCommand(options: TestOptions): Promise<void> {
  try {
    const timeout = parseInt(options.timeout || '10000', 10);
    const retryCount = parseInt(options.retry || '3', 10);
    
    const { getMultiServerAgent } = await import('../utils/agent-factory.js');
    const agent = await getMultiServerAgent();
    
    console.log(chalk.blue('🧪 Testing server connections...'));
    
    const testResults = await agent.testConnections(options.server, { timeout, retryCount });
    
    console.log(chalk.green('\n📊 Connection Test Results\n'));
    
    testResults.forEach((result: any) => {
      const status = result.success ? chalk.green('✓ PASS') : chalk.red('✗ FAIL');
      console.log(`${status} ${result.serverId} - ${result.serverName}`);
      
      if (!result.success) {
        console.log(chalk.red(`  └─ Error: ${result.error}`));
      } else if (result.responseTime) {
        console.log(chalk.gray(`  └─ Response time: ${result.responseTime}ms`));
      }
    });
    
  } catch (error) {
    console.error(chalk.red('Failed to test connections:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle the 'info' command
 */
async function handleInfoCommand(options: InfoOptions): Promise<void> {
  try {
    const { getMultiServerAgent } = await import('../utils/agent-factory.js');
    const agent = await getMultiServerAgent();
    
    console.log(chalk.blue('📋 Retrieving server information...'));
    
    const serverInfo = await agent.getDetailedServerInfo(options.server, options.tools);
    
    if (options.format === 'json') {
      console.log(JSON.stringify(serverInfo, null, 2));
    } else {
      // Table format
      displayServerInfo(serverInfo, options);
    }
    
  } catch (error) {
    console.error(chalk.red('Failed to get server info:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Display server status in table format
 */
function displayServerStatus(server: any, detailed?: boolean): void {
  const status = server.healthy ? chalk.green('HEALTHY') : chalk.red('UNHEALTHY');
  console.log(`${status} ${server.id} - ${server.name}`);
  
  if (detailed) {
    console.log(chalk.gray(`  └─ Last check: ${server.lastCheck}`));
    console.log(chalk.gray(`  └─ Uptime: ${server.uptime || 'Unknown'}`));
    if (server.error) {
      console.log(chalk.red(`  └─ Error: ${server.error}`));
    }
  }
}

/**
 * Display server info in table format
 */
function displayServerInfo(serverInfo: any, options: InfoOptions): void {
  console.log(chalk.green('\n📊 Server Information\n'));
  
  if (options.server) {
    // Single server detailed info
    const server = serverInfo;
    console.log(chalk.bold(`${server.name} (${server.id})`));
    console.log(`Description: ${server.description || 'No description'}`);
    console.log(`Type: ${server.connectionType}`);
    console.log(`Status: ${server.enabled ? chalk.green('Enabled') : chalk.gray('Disabled')}`);
    
    if (options.tools && server.tools) {
      console.log(chalk.bold('\nAvailable Tools:'));
      server.tools.forEach((tool: any) => {
        console.log(`  • ${tool.name} - ${tool.description}`);
      });
    }
  } else {
    // Summary of all servers
    serverInfo.servers.forEach((server: any) => {
      const status = server.enabled ? chalk.green('✓') : chalk.gray('○');
      console.log(`${status} ${server.id} - ${server.name}`);
      
      if (options.tools && server.toolCount) {
        console.log(chalk.gray(`  └─ ${server.toolCount} tools available`));
      }
    });
  }
}
