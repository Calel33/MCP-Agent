# 🚫 No Hardcoded Implementations Rule

## Core Principle
**NEVER hardcode server configurations, API endpoints, or service connections. Always use dynamic configuration loading.**

## Implementation Standards

### ✅ ALWAYS DO
- Load configurations from JSON/config files
- Use environment variables for sensitive data  
- Filter enabled/disabled servers dynamically
- Support adding new servers without code changes
- Use type-safe configuration interfaces

### ❌ NEVER DO
- Hardcode server URLs or commands in service code
- Create fixed server lists in initialization methods
- Skip configuration validation
- Ignore enabled/disabled flags

## Quick Check
Before deploying: Can I add a new MCP server by only editing the config file? If no, it's hardcoded.

## Example Pattern
```typescript
// ❌ BAD - Hardcoded
const servers = {
  'docfork': { url: 'https://...' },
  'hustle': { url: 'https://...' }
};

// ✅ GOOD - Dynamic
const servers = await ConfigService.getEnabledServers();
const mcpConfig = servers.reduce((config, server) => {
  config[server.id] = buildServerConfig(server);
  return config;
}, {});
```

---
**Enforcement**: Mandatory for all service initialization and configuration loading
