#!/usr/bin/env node

/**
 * CLI Validation Script
 * 
 * Tests core CLI functionality and validates all commands work correctly
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Helper functions
function logInfo(message) {
    console.log(chalk.blue('ℹ️  [INFO]'), message);
}

function logSuccess(message) {
    console.log(chalk.green('✅ [PASS]'), message);
    testsPassed++;
}

function logError(message) {
    console.log(chalk.red('❌ [FAIL]'), message);
    testsFailed++;
}

function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'pipe',
            ...options
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            resolve({
                code,
                stdout,
                stderr,
                output: stdout + stderr
            });
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function runTest(testName, command, args, expectedCode = 0, expectedOutput = null) {
    testsRun++;
    logInfo(`Running test: ${testName}`);

    try {
        const result = await runCommand(command, args);
        
        // Check exit code
        if (result.code !== expectedCode) {
            logError(`${testName} (expected exit code ${expectedCode}, got ${result.code})`);
            return false;
        }

        // Check output pattern if provided
        if (expectedOutput && !result.output.includes(expectedOutput)) {
            logError(`${testName} (expected output pattern '${expectedOutput}' not found)`);
            console.log('Actual output:', result.output.substring(0, 200) + '...');
            return false;
        }

        logSuccess(testName);
        return true;
    } catch (error) {
        logError(`${testName} (error: ${error.message})`);
        return false;
    }
}

async function main() {
    console.log(chalk.cyan('🧪 CLI Validation Suite'));
    console.log(chalk.cyan('========================'));

    // Test 1: Help command
    await runTest(
        'Help command',
        'npm', ['run', 'cli', '--', '--help'],
        0,
        'Multiple MCP Servers General Purpose Agent'
    );

    // Test 2: Version command
    await runTest(
        'Version command',
        'npm', ['run', 'cli', '--', '--version'],
        0,
        '1.0.0'
    );

    // Test 3: Query help
    await runTest(
        'Query help',
        'npm', ['run', 'cli', '--', 'query', '--help'],
        0,
        'send a query to the multi-server agent'
    );

    // Test 4: Server help
    await runTest(
        'Server help',
        'npm', ['run', 'cli', '--', 'server', '--help'],
        0,
        'manage MCP server connections'
    );

    // Test 5: Config help
    await runTest(
        'Config help',
        'npm', ['run', 'cli', '--', 'config', '--help'],
        0,
        'manage configuration settings'
    );

    // Test 6: Basic query
    await runTest(
        'Basic query',
        'npm', ['run', 'cli', '--', 'query', 'What is 1+1?', '--quiet'],
        0,
        '1 + 1'
    );

    // Test 7: Query JSON format
    await runTest(
        'Query JSON format',
        'npm', ['run', 'cli', '--', 'query', 'Hello', '--format', 'json', '--quiet'],
        0,
        '"response"'
    );

    // Test 8: Invalid max-steps
    await runTest(
        'Invalid max-steps',
        'npm', ['run', 'cli', '--', 'query', 'test', '--max-steps', '0'],
        2
    );

    // Test 9: Server list
    await runTest(
        'Server list',
        'npm', ['run', 'cli', '--', 'server', 'list'],
        0,
        'Server Summary'
    );

    // Test 10: Server list JSON
    await runTest(
        'Server list JSON',
        'npm', ['run', 'cli', '--', 'server', 'list', '--format', 'json'],
        0,
        '"totalServers"'
    );

    // Test 11: Config show
    await runTest(
        'Config show',
        'npm', ['run', 'cli', '--', 'config', 'show'],
        0,
        'Current Configuration'
    );

    // Test 12: Config validate
    await runTest(
        'Config validate',
        'npm', ['run', 'cli', '--', 'config', 'validate'],
        0,
        'Configuration is valid'
    );

    // Test 13: Invalid command
    await runTest(
        'Invalid command',
        'npm', ['run', 'cli', '--', 'invalid-command'],
        1
    );

    // Summary
    console.log('');
    console.log(chalk.cyan('🏁 Validation Complete'));
    console.log(chalk.cyan('======================'));
    console.log(`Tests run: ${testsRun}`);
    console.log(`Tests passed: ${testsPassed}`);
    console.log(`Tests failed: ${testsFailed}`);

    if (testsFailed === 0) {
        console.log(chalk.green('✅ All tests passed!'));
        process.exit(0);
    } else {
        console.log(chalk.red(`❌ ${testsFailed} test(s) failed`));
        process.exit(1);
    }
}

main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
});
