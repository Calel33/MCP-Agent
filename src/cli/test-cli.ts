#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('test-cli')
  .description('Test CLI for debugging')
  .version('1.0.0')
  .option('-v, --verbose', 'verbose output')
  .action(() => {
    console.log(chalk.green('✅ CLI is working!'));
  });

program.parse();
