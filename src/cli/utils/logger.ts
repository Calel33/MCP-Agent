/**
 * CLI Logger Utility
 * 
 * Provides consistent logging with verbose/quiet mode support
 */

import chalk from 'chalk';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4
}

export interface LoggerOptions {
  verbose?: boolean;
  quiet?: boolean;
  noColor?: boolean;
}

/**
 * CLI Logger class
 */
export class CLILogger {
  private options: LoggerOptions;
  private logLevel: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
    
    // Determine log level based on options
    if (options.quiet) {
      this.logLevel = LogLevel.ERROR;
    } else if (options.verbose) {
      this.logLevel = LogLevel.VERBOSE;
    } else {
      this.logLevel = LogLevel.INFO;
    }

    // Handle color output
    if (options.noColor) {
      chalk.level = 0;
    }
  }

  /**
   * Log an error message
   */
  error(message: string, details?: any): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(chalk.red('❌ Error:'), message);
      
      if (details && this.logLevel >= LogLevel.DEBUG) {
        console.error(chalk.gray('Details:'), details);
      }
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(chalk.yellow('⚠️  Warning:'), message);
    }
  }

  /**
   * Log an info message
   */
  info(message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(chalk.blue('ℹ️  Info:'), message);
    }
  }

  /**
   * Log a success message
   */
  success(message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(chalk.green('✅ Success:'), message);
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(chalk.gray('🐛 Debug:'), message);
      
      if (data) {
        console.log(chalk.gray('Data:'), data);
      }
    }
  }

  /**
   * Log a verbose message
   */
  verbose(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.VERBOSE) {
      console.log(chalk.gray('🔍 Verbose:'), message);
      
      if (data) {
        console.log(chalk.gray('Data:'), data);
      }
    }
  }

  /**
   * Log a step in a process
   */
  step(message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(chalk.blue('🔧'), message);
    }
  }

  /**
   * Log a progress message
   */
  progress(message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(chalk.cyan('⏳'), message);
    }
  }

  /**
   * Log raw output (always shown unless quiet)
   */
  output(message: string): void {
    if (!this.options.quiet) {
      console.log(message);
    }
  }

  /**
   * Log formatted JSON output
   */
  json(data: any): void {
    if (!this.options.quiet) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log a table header
   */
  tableHeader(header: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(chalk.bold(header));
      console.log('─'.repeat(header.length));
    }
  }

  /**
   * Log a table row
   */
  tableRow(row: string): void {
    if (!this.options.quiet) {
      console.log(row);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): CLILogger {
    const childLogger = new CLILogger(this.options);
    
    // Override methods to include context
    const originalMethods = {
      error: childLogger.error.bind(childLogger),
      warn: childLogger.warn.bind(childLogger),
      info: childLogger.info.bind(childLogger),
      debug: childLogger.debug.bind(childLogger),
      verbose: childLogger.verbose.bind(childLogger)
    };

    childLogger.error = (message: string, details?: any) => {
      originalMethods.error(`[${context}] ${message}`, details);
    };

    childLogger.warn = (message: string) => {
      originalMethods.warn(`[${context}] ${message}`);
    };

    childLogger.info = (message: string) => {
      originalMethods.info(`[${context}] ${message}`);
    };

    childLogger.debug = (message: string, data?: any) => {
      originalMethods.debug(`[${context}] ${message}`, data);
    };

    childLogger.verbose = (message: string, data?: any) => {
      originalMethods.verbose(`[${context}] ${message}`, data);
    };

    return childLogger;
  }
}

/**
 * Create a logger instance from environment variables
 */
export function createLogger(): CLILogger {
  return new CLILogger({
    verbose: process.env['CLI_VERBOSE'] === 'true',
    quiet: process.env['CLI_QUIET'] === 'true',
    noColor: process.env['CLI_NO_COLOR'] === 'true'
  });
}

/**
 * Exit codes for CLI commands
 */
export enum ExitCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
  INVALID_USAGE = 2,
  CONFIG_ERROR = 3,
  NETWORK_ERROR = 4,
  TIMEOUT_ERROR = 5,
  PERMISSION_ERROR = 6,
  NOT_FOUND_ERROR = 7,
  VALIDATION_ERROR = 8
}

/**
 * Exit with appropriate code and message
 */
export function exitWithError(message: string, code: ExitCode = ExitCode.GENERAL_ERROR, details?: any): never {
  const logger = createLogger();
  logger.error(message, details);
  process.exit(code);
}
