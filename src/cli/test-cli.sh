#!/bin/bash

# CLI Test Suite for MCP Multi-Agent
# Tests all CLI commands and validates functionality

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

run_test() {
    local test_name="$1"
    local command="$2"
    local expected_exit_code="${3:-0}"
    
    ((TESTS_RUN++))
    log_info "Running test: $test_name"
    
    # Run the command and capture exit code
    if eval "$command" >/dev/null 2>&1; then
        actual_exit_code=0
    else
        actual_exit_code=$?
    fi
    
    # Check exit code
    if [ "$actual_exit_code" -eq "$expected_exit_code" ]; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name (expected exit code $expected_exit_code, got $actual_exit_code)"
        return 1
    fi
}

run_test_with_output() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    local expected_exit_code="${4:-0}"
    
    ((TESTS_RUN++))
    log_info "Running test: $test_name"
    
    # Run the command and capture output and exit code
    output=$(eval "$command" 2>&1) || actual_exit_code=$?
    actual_exit_code=${actual_exit_code:-0}
    
    # Check exit code
    if [ "$actual_exit_code" -ne "$expected_exit_code" ]; then
        log_error "$test_name (expected exit code $expected_exit_code, got $actual_exit_code)"
        return 1
    fi
    
    # Check output pattern
    if echo "$output" | grep -q "$expected_pattern"; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name (output pattern '$expected_pattern' not found)"
        echo "Actual output: $output"
        return 1
    fi
}

# Start testing
echo "🧪 Starting CLI Test Suite"
echo "=========================="

# Test 1: Basic help command
run_test_with_output "Help command" "npm run cli -- --help" "Multiple MCP Servers General Purpose Agent"

# Test 2: Version command
run_test_with_output "Version command" "npm run cli -- --version" "1.0.0"

# Test 3: Query command help
run_test_with_output "Query help" "npm run cli -- query --help" "send a query to the multi-server agent"

# Test 4: Server command help
run_test_with_output "Server help" "npm run cli -- server --help" "manage MCP server connections"

# Test 5: Config command help
run_test_with_output "Config help" "npm run cli -- config --help" "manage configuration settings"

# Test 6: Basic query command
run_test_with_output "Basic query" "npm run cli -- query 'What is 2+2?' --quiet" "2 + 2 equals 4"

# Test 7: Query with JSON format
run_test_with_output "Query JSON format" "npm run cli -- query 'Hello' --format json --quiet" '"response"'

# Test 8: Query with streaming
run_test_with_output "Query streaming" "npm run cli -- query 'Hi' --stream --quiet" "Hi"

# Test 9: Query with invalid max-steps
run_test "Query invalid max-steps" "npm run cli -- query 'test' --max-steps 0" 2

# Test 10: Query with invalid timeout
run_test "Query invalid timeout" "npm run cli -- query 'test' --timeout 500" 2

# Test 11: Server list command
run_test_with_output "Server list" "npm run cli -- server list" "Server Summary"

# Test 12: Server list JSON format
run_test_with_output "Server list JSON" "npm run cli -- server list --format json" '"totalServers"'

# Test 13: Server list enabled only
run_test_with_output "Server list enabled only" "npm run cli -- server list --enabled-only" "No servers found"

# Test 14: Server status command
run_test "Server status" "npm run cli -- server status" 1

# Test 15: Server info command
run_test_with_output "Server info" "npm run cli -- server info" "All Servers Information"

# Test 16: Server info specific server
run_test_with_output "Server info filesystem" "npm run cli -- server info --server filesystem" "File System"

# Test 17: Server info non-existent server
run_test "Server info non-existent" "npm run cli -- server info --server nonexistent" 1

# Test 18: Config show command
run_test_with_output "Config show" "npm run cli -- config show" "Current Configuration"

# Test 19: Config show JSON format
run_test_with_output "Config show JSON" "npm run cli -- config show --format json" '"llm"'

# Test 20: Config validate command
run_test_with_output "Config validate" "npm run cli -- config validate" "Configuration is valid"

# Test 21: Invalid command
run_test "Invalid command" "npm run cli -- invalid-command" 1

# Test 22: Query without question
run_test "Query without question" "npm run cli -- query" 1

# Test 23: Verbose mode
run_test_with_output "Verbose mode" "npm run cli -- query 'test' --verbose --quiet" "Query configuration"

# Test 24: No color mode
run_test "No color mode" "npm run cli -- query 'test' --no-color --quiet"

# Test 25: Config init in temp directory
run_test "Config init" "cd /tmp && npm run --prefix '$PWD' cli -- config init --force"

# Summary
echo ""
echo "🏁 Test Suite Complete"
echo "======================"
echo "Tests run: $TESTS_RUN"
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $TESTS_FAILED test(s) failed${NC}"
    exit 1
fi
