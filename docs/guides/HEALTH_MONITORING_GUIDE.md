# 🏥 Health Monitoring Guide - MCP Multi-Agent

## Overview

The MCP Multi-Agent includes a comprehensive health monitoring system that provides real-time monitoring, automatic reconnection, and circuit breaker functionality for all connected MCP servers.

## 🎯 Key Features

### **Real-time Health Monitoring**
- Configurable health check intervals (default: 30 seconds)
- Comprehensive server validation including connection status and tool availability
- Response time tracking and error rate monitoring
- Memory usage monitoring (when available)

### **Circuit Breaker Pattern**
- Prevents cascading failures by isolating unhealthy servers
- Configurable failure thresholds and recovery timeouts
- Automatic transition between closed, open, and half-open states
- Graceful degradation when servers are unavailable

### **Automatic Reconnection**
- Exponential backoff with jitter to prevent thundering herd
- Configurable retry limits and intervals
- Manual reconnection triggers
- Comprehensive reconnection status tracking

### **Event-Driven Architecture**
- Real-time health change notifications
- Circuit breaker state change events
- Reconnection success/failure events
- Comprehensive error reporting

## 🚀 Quick Start

### Basic Health Monitoring

```typescript
import { MultiServerAgent } from '@/agent/multi-server-agent';
import { getOpenAIClient } from '@/llm/factory';
import { loadConfig } from '@/config/loader';

// Load configuration with health monitoring enabled
const config = loadConfig({
  serverManager: {
    healthMonitoring: true,
    healthCheckInterval: 30000,
    autoReconnect: true,
  }
});

// Create agent
const openaiClient = await getOpenAIClient(config.llm);
const agent = new MultiServerAgent(config, openaiClient);

// Initialize with health monitoring
await agent.initialize();

// Check if health monitoring is active
console.log(`Health monitoring: ${agent.isHealthMonitoringActive()}`);
```

### Getting Health Information

```typescript
// Get health summary
const summary = agent.getHealthSummary();
console.log(`${summary.healthyServers}/${summary.totalServers} servers healthy`);
console.log(`Overall status: ${summary.overallStatus}`);

// Get detailed health for all servers
const serverHealth = agent.getServerHealth();
serverHealth.forEach(health => {
  console.log(`${health.serverId}: ${health.status}`);
  if (health.status !== 'healthy') {
    console.log(`  Failures: ${health.consecutiveFailures}`);
    console.log(`  Last error: ${health.lastError}`);
  }
});
```

## ⚙️ Configuration

### Environment Variables

```bash
# Health Monitoring Configuration
SERVER_HEALTH_MONITORING=true                  # Enable health monitoring
SERVER_HEALTH_CHECK_INTERVAL=30000             # Check interval (ms)
SERVER_HEALTH_CHECK_TIMEOUT=5000               # Check timeout (ms)
SERVER_AUTO_RECONNECT=true                     # Enable auto-reconnection
SERVER_RECONNECT_INTERVAL=10000                # Reconnection interval (ms)
SERVER_MAX_RECONNECT_ATTEMPTS=5                # Max reconnection attempts

# Circuit Breaker Configuration
SERVER_CIRCUIT_BREAKER_THRESHOLD=5             # Failure threshold
SERVER_CIRCUIT_BREAKER_RECOVERY_TIMEOUT=60000  # Recovery timeout (ms)
```

### Programmatic Configuration

```typescript
import { createHealthMonitor } from '@/monitoring';

const healthConfig = {
  healthCheckInterval: 15000,        // 15 seconds
  healthCheckTimeout: 3000,          // 3 seconds
  failureThreshold: 3,               // Mark unhealthy after 3 failures
  recoveryThreshold: 2,              // Mark healthy after 2 successes
  autoReconnect: true,
  reconnectInterval: 5000,           // 5 seconds
  maxReconnectAttempts: 10,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,             // Open circuit after 5 failures
    recoveryTimeout: 30000,          // 30 seconds
    halfOpenMaxCalls: 3,             // Test with 3 calls in half-open
  },
};

const monitor = await createHealthMonitor(clientFactory, servers, healthConfig);
```

## 📊 Health Status Types

### Server Health Status
- **`healthy`**: Server is responding normally
- **`degraded`**: Server has some failures but is still functional
- **`unhealthy`**: Server has exceeded failure threshold
- **`disconnected`**: Server is not reachable
- **`reconnecting`**: Server is in the process of reconnecting

### Circuit Breaker States
- **`closed`**: Normal operation, requests pass through
- **`open`**: Circuit is open, requests are blocked
- **`half-open`**: Testing if server has recovered

## 🔧 Advanced Usage

### Manual Health Checks

```typescript
// Force immediate health check for a specific server
const healthResult = await agent.forceHealthCheck('filesystem');
if (healthResult) {
  console.log(`Health check: ${healthResult.status}`);
  console.log(`Response time: ${healthResult.averageResponseTime}ms`);
  console.log(`Error rate: ${(healthResult.errorRate * 100).toFixed(2)}%`);
}
```

### Manual Reconnection

```typescript
// Manually trigger reconnection for a failed server
const success = await agent.reconnectServer('filesystem');
console.log(`Reconnection ${success ? 'successful' : 'failed'}`);
```

### Event Monitoring

```typescript
import { createAndStartHealthMonitor } from '@/monitoring';

const monitor = await createAndStartHealthMonitor(clientFactory, servers);

// Listen for health events
monitor.on('server-healthy', (serverId, info) => {
  console.log(`✅ Server ${serverId} is healthy`);
});

monitor.on('server-unhealthy', (serverId, info) => {
  console.log(`❌ Server ${serverId} is unhealthy: ${info.lastError}`);
});

monitor.on('circuit-breaker-opened', (serverId, info) => {
  console.log(`🔴 Circuit breaker opened for ${serverId}`);
});

monitor.on('circuit-breaker-closed', (serverId, info) => {
  console.log(`🟢 Circuit breaker closed for ${serverId}`);
});

monitor.on('server-reconnected', (serverId, info) => {
  console.log(`🔄 Server ${serverId} reconnected successfully`);
});
```

## 🧪 Testing Health Monitoring

### Basic Test

```bash
npm run test:health-monitoring:basic
```

### Test with Simulated Failures

```bash
npm run test:health-monitoring:failures
```

### Comprehensive Test Suite

```bash
npm run test:health-monitoring
```

## 📈 Monitoring Metrics

### Health Summary Metrics
- `totalServers`: Total number of monitored servers
- `healthyServers`: Number of healthy servers
- `unhealthyServers`: Number of unhealthy servers
- `disconnectedServers`: Number of disconnected servers
- `averageResponseTime`: Average response time across all servers
- `overallStatus`: Overall system health status

### Per-Server Metrics
- `consecutiveFailures`: Number of consecutive health check failures
- `averageResponseTime`: Average response time for this server
- `errorRate`: Error rate (0.0 to 1.0)
- `connectionCount`: Number of active connections
- `uptime`: Server uptime in milliseconds
- `isCircuitBreakerOpen`: Circuit breaker status

## 🔍 Troubleshooting

### Common Issues

#### Health Monitoring Not Starting
```typescript
// Check if health monitoring is enabled
const isActive = agent.isHealthMonitoringActive();
if (!isActive) {
  console.log('Health monitoring is not active');
  // Check configuration
  const config = agent.getServerManagerConfig();
  console.log('Health monitoring enabled:', config.healthMonitoring);
}
```

#### Servers Showing as Unhealthy
```typescript
// Get detailed health information
const health = agent.getServerHealth();
const unhealthyServers = health.filter(h => h.status === 'unhealthy');

unhealthyServers.forEach(server => {
  console.log(`Server ${server.serverId}:`);
  console.log(`  Last error: ${server.lastError}`);
  console.log(`  Consecutive failures: ${server.consecutiveFailures}`);
  console.log(`  Circuit breaker open: ${server.isCircuitBreakerOpen}`);
});
```

#### Reconnection Not Working
```typescript
// Check reconnection status
const reconnectionStatus = monitor.getAllReconnectionStatus();
reconnectionStatus.forEach(status => {
  if (status.isReconnecting) {
    console.log(`${status.serverId} is reconnecting:`);
    console.log(`  Attempts: ${status.totalAttempts}`);
    console.log(`  Next attempt: ${status.nextAttemptAt}`);
    console.log(`  Max attempts reached: ${status.maxAttemptsReached}`);
  }
});
```

## 🎛️ Performance Tuning

### High-Frequency Monitoring
```typescript
const config = {
  healthCheckInterval: 5000,         // 5 seconds
  healthCheckTimeout: 2000,          // 2 seconds
  failureThreshold: 2,               // Quick failure detection
  circuitBreaker: {
    failureThreshold: 3,             // Quick circuit opening
    recoveryTimeout: 15000,          // Fast recovery
  },
};
```

### Conservative Monitoring
```typescript
const config = {
  healthCheckInterval: 60000,        // 1 minute
  healthCheckTimeout: 10000,         // 10 seconds
  failureThreshold: 5,               // Tolerant of failures
  circuitBreaker: {
    failureThreshold: 10,            // Slow circuit opening
    recoveryTimeout: 300000,         // 5 minutes recovery
  },
};
```

## 🖥️ CLI Health Monitoring ✅ **NEW!**

The CLI interface provides convenient commands for monitoring server health:

### Server Status Commands

```bash
# Check all server status
npm run cli -- server status

# Check specific server
npm run cli -- server status --server filesystem

# Get detailed server information
npm run cli -- server info --server filesystem

# List all servers with status
npm run cli -- server list
```

### Server Status Output

**Table Format (default):**
```
📊 Server Status

CONFIGURED filesystem - File System
  └─ Type: stdio
  └─ Command: npx @modelcontextprotocol/server-filesystem /tmp
```

**JSON Format:**
```bash
npm run cli -- server status --format json
```

```json
{
  "servers": [
    {
      "id": "filesystem",
      "name": "File System",
      "enabled": true,
      "connectionType": "stdio",
      "status": "configured"
    }
  ]
}
```

### Health Monitoring Integration

The CLI integrates with the health monitoring system to provide:

- **Real-time Status**: Current server health and connectivity
- **Configuration Validation**: Verify server configurations are correct
- **Connection Testing**: Test server connections and response times
- **Error Reporting**: Clear error messages for connection issues

### Troubleshooting with CLI

```bash
# 1. Check server configuration
npm run cli -- config show

# 2. Validate configuration
npm run cli -- config validate

# 3. List configured servers
npm run cli -- server list

# 4. Check server status
npm run cli -- server status

# 5. Test specific server
npm run cli -- server info --server <server-id>
```

## 📚 API Reference

For complete API documentation, see [API_REFERENCE.md](./API_REFERENCE.md#-health-monitoring-api).

---

*Last Updated: 2025-08-18*  
*Version: 1.0*  
*For more information, see the [Architecture Documentation](./ARCHITECTURE.md)*
