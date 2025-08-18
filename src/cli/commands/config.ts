/**
 * Configuration Management Commands
 * 
 * Handles commands for managing API keys, server configurations, and CLI preferences
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Create configuration management commands
 */
export function createConfigCommands(): Command {
  const configCommand = new Command('config')
    .alias('cfg')
    .description('manage configuration settings');

  // Add subcommands
  configCommand.addCommand(createInitCommand());
  configCommand.addCommand(createGetCommand());
  configCommand.addCommand(createSetCommand());
  configCommand.addCommand(createListCommand());
  configCommand.addCommand(createValidateCommand());

  return configCommand;
}

/**
 * Create the 'init' subcommand
 */
function createInitCommand(): Command {
  return new Command('init')
    .description('initialize configuration with default settings')
    .option('--force', 'overwrite existing configuration')
    .option('--template <name>', 'use configuration template', 'default')
    .action(async (options: InitOptions) => {
      await handleInitCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config init
  $ mcp-agent config init --force
  $ mcp-agent config init --template minimal
`);
}

/**
 * Create the 'get' subcommand
 */
function createGetCommand(): Command {
  return new Command('get')
    .description('get configuration value')
    .argument('<key>', 'configuration key (e.g., llm.model, servers.filesystem.enabled)')
    .option('-f, --format <type>', 'output format (value, json)', 'value')
    .action(async (key: string, options: GetOptions) => {
      await handleGetCommand(key, options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config get llm.model
  $ mcp-agent config get servers.filesystem.enabled
  $ mcp-agent config get llm --format json
`);
}

/**
 * Create the 'set' subcommand
 */
function createSetCommand(): Command {
  return new Command('set')
    .description('set configuration value')
    .argument('<key>', 'configuration key')
    .argument('<value>', 'configuration value')
    .option('--type <type>', 'value type (string, number, boolean, json)', 'string')
    .action(async (key: string, value: string, options: SetOptions) => {
      await handleSetCommand(key, value, options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config set llm.model "gpt-4"
  $ mcp-agent config set servers.filesystem.enabled true --type boolean
  $ mcp-agent config set agent.maxSteps 15 --type number
`);
}

/**
 * Create the 'list' subcommand
 */
function createListCommand(): Command {
  return new Command('list')
    .alias('ls')
    .description('list all configuration settings')
    .option('-f, --format <type>', 'output format (table, json, yaml)', 'table')
    .option('--filter <pattern>', 'filter keys by pattern')
    .option('--show-defaults', 'include default values')
    .action(async (options: ListOptions) => {
      await handleListCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config list
  $ mcp-agent config list --format json
  $ mcp-agent config list --filter "servers.*"
  $ mcp-agent config list --show-defaults
`);
}

/**
 * Create the 'validate' subcommand
 */
function createValidateCommand(): Command {
  return new Command('validate')
    .description('validate configuration settings')
    .option('--fix', 'attempt to fix validation errors')
    .option('--strict', 'use strict validation rules')
    .action(async (options: ValidateOptions) => {
      await handleValidateCommand(options);
    })
    .addHelpText('after', `
Examples:
  $ mcp-agent config validate
  $ mcp-agent config validate --fix
  $ mcp-agent config validate --strict
`);
}

// Command option interfaces
interface InitOptions {
  force?: boolean;
  template?: string;
}

interface GetOptions {
  format?: 'value' | 'json';
}

interface SetOptions {
  type?: 'string' | 'number' | 'boolean' | 'json';
}

interface ListOptions {
  format?: 'table' | 'json' | 'yaml';
  filter?: string;
  showDefaults?: boolean;
}

interface ValidateOptions {
  fix?: boolean;
  strict?: boolean;
}

/**
 * Handle the 'init' command
 */
async function handleInitCommand(options: InitOptions): Promise<void> {
  try {
    console.log(chalk.blue('🔧 Initializing configuration...'));
    
    const configPath = getConfigPath();
    const envPath = getEnvPath();
    
    // Check if files exist
    if (!options.force) {
      if (existsSync(configPath)) {
        console.error(chalk.red('Configuration file already exists. Use --force to overwrite.'));
        process.exit(1);
      }
    }
    
    // Create configuration template
    const template = await getConfigTemplate(options.template || 'default');
    
    // Write configuration file
    writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(chalk.green(`✅ Configuration created: ${configPath}`));
    
    // Create .env.example if it doesn't exist
    if (!existsSync(envPath)) {
      const envTemplate = getEnvTemplate();
      writeFileSync(envPath, envTemplate);
      console.log(chalk.green(`✅ Environment template created: ${envPath}`));
    }
    
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log(chalk.gray('1. Copy .env.example to .env'));
    console.log(chalk.gray('2. Add your OpenAI API key to .env'));
    console.log(chalk.gray('3. Configure MCP servers as needed'));
    console.log(chalk.gray('4. Run: mcp-agent config validate'));
    
  } catch (error) {
    console.error(chalk.red('Failed to initialize configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle the 'get' command
 */
async function handleGetCommand(key: string, options: GetOptions): Promise<void> {
  try {
    const config = await loadConfiguration();
    const value = getNestedValue(config, key);
    
    if (value === undefined) {
      console.error(chalk.red(`Configuration key '${key}' not found`));
      process.exit(1);
    }
    
    if (options.format === 'json') {
      console.log(JSON.stringify({ [key]: value }, null, 2));
    } else {
      console.log(value);
    }
    
  } catch (error) {
    console.error(chalk.red('Failed to get configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle the 'set' command
 */
async function handleSetCommand(key: string, value: string, options: SetOptions): Promise<void> {
  try {
    const config = await loadConfiguration();
    
    // Parse value based on type
    let parsedValue: any = value;
    switch (options.type) {
      case 'number':
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
          throw new Error(`Invalid number value: ${value}`);
        }
        break;
      case 'boolean':
        parsedValue = value.toLowerCase() === 'true';
        break;
      case 'json':
        parsedValue = JSON.parse(value);
        break;
      // 'string' is default, no parsing needed
    }
    
    // Set nested value
    setNestedValue(config, key, parsedValue);
    
    // Save configuration
    const configPath = getConfigPath();
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(chalk.green(`✅ Configuration updated: ${key} = ${JSON.stringify(parsedValue)}`));
    
  } catch (error) {
    console.error(chalk.red('Failed to set configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle the 'list' command
 */
async function handleListCommand(options: ListOptions): Promise<void> {
  try {
    const config = await loadConfiguration();
    
    // Flatten configuration for display
    const flatConfig = flattenObject(config);
    
    // Apply filter if specified
    let filteredConfig = flatConfig;
    if (options.filter) {
      const pattern = new RegExp(options.filter);
      filteredConfig = Object.fromEntries(
        Object.entries(flatConfig).filter(([key]) => pattern.test(key))
      );
    }
    
    if (options.format === 'json') {
      console.log(JSON.stringify(filteredConfig, null, 2));
    } else if (options.format === 'yaml') {
      // Simple YAML-like output
      Object.entries(filteredConfig).forEach(([key, value]) => {
        console.log(`${key}: ${JSON.stringify(value)}`);
      });
    } else {
      // Table format
      console.log(chalk.green('\n📊 Configuration Settings\n'));
      console.log(chalk.bold('Key'.padEnd(40) + 'Value'));
      console.log('─'.repeat(70));
      
      Object.entries(filteredConfig).forEach(([key, value]) => {
        const displayValue = typeof value === 'string' ? value : JSON.stringify(value);
        const truncatedValue = displayValue.length > 30 ? displayValue.substring(0, 27) + '...' : displayValue;
        console.log(key.padEnd(40) + truncatedValue);
      });
    }
    
  } catch (error) {
    console.error(chalk.red('Failed to list configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle the 'validate' command
 */
async function handleValidateCommand(options: ValidateOptions): Promise<void> {
  try {
    console.log(chalk.blue('🔍 Validating configuration...'));
    
    const { validateConfiguration } = await import('../utils/config-validator.js');
    const config = await loadConfiguration();
    
    const validation = await validateConfiguration(config, {
      strict: options.strict,
      autoFix: options.fix
    });
    
    if (validation.valid) {
      console.log(chalk.green('✅ Configuration is valid'));
    } else {
      console.log(chalk.red('❌ Configuration validation failed'));
      
      validation.errors.forEach((error: any) => {
        console.log(chalk.red(`  • ${error.path}: ${error.message}`));
      });
      
      if (validation.warnings && validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        validation.warnings.forEach((warning: any) => {
          console.log(chalk.yellow(`  • ${warning.path}: ${warning.message}`));
        });
      }
      
      if (options.fix && validation.fixed) {
        console.log(chalk.blue('\n🔧 Auto-fixes applied'));
        const configPath = getConfigPath();
        writeFileSync(configPath, JSON.stringify(validation.fixedConfig, null, 2));
        console.log(chalk.green('✅ Configuration updated with fixes'));
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red('Failed to validate configuration:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Utility functions

function getConfigPath(): string {
  return process.env.CLI_CONFIG_PATH || join(process.cwd(), 'mcp-agent.config.json');
}

function getEnvPath(): string {
  return process.env.CLI_ENV_PATH || join(process.cwd(), '.env.example');
}

async function loadConfiguration(): Promise<any> {
  const configPath = getConfigPath();
  
  if (!existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}. Run 'mcp-agent config init' first.`);
  }
  
  const configContent = readFileSync(configPath, 'utf-8');
  return JSON.parse(configContent);
}

async function getConfigTemplate(templateName: string): Promise<any> {
  // Import default configuration template
  const { getDefaultConfig } = await import('../utils/config-templates.js');
  return getDefaultConfig(templateName);
}

function getEnvTemplate(): string {
  return `# MCP Multi-Agent Environment Configuration
# Copy this file to .env and fill in your values

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom configuration file path
# MCP_AGENT_CONFIG_PATH=./custom-config.json

# Optional: Logging level
# LOG_LEVEL=info

# Optional: CLI preferences
# CLI_NO_COLOR=false
# CLI_VERBOSE=false
`;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}
