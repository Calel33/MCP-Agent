# 🚀 Hustle HTTP MCP Integration Guide

## 📋 Overview

This guide documents the integration of the Hustle HTTP MCP server into the MCP Multi-Agent system. The Hustle HTTP MCP provides crypto agent capabilities through a remote HTTP endpoint.

## 🎯 Integration Summary

**Date**: 2025-08-21  
**Agent**: Multi-Agent Workflow (Clarity → Project Researcher → Backend Developer → Documentation Specialist)  
**Status**: ✅ Complete - Ready for Testing  

### **What Was Added**
- **Hustle HTTP MCP Server** - Crypto agent capabilities via remote HTTP endpoint
- **Secure Environment Variables** - `HUSTLE_API_KEY` and `HUSTLE_VAULT_ID`
- **Multi-Configuration Support** - Added to both backend and frontend configurations
- **Complete Documentation** - Setup instructions and security guidelines

## 🔧 Configuration Details

### **Backend Configuration**

#### **Primary Config (`mcp-config.json`)**
```json
{
  "servers": [
    {
      "id": "hustle-http",
      "name": "Hustle HTTP MCP Server",
      "description": "Provides crypto agent capabilities via Hustle HTTP MCP",
      "connectionType": "stdio",
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://hustle-remote.myagent.sh/mcp?apikey=${HUSTLE_API_KEY}&vaultId=${HUSTLE_VAULT_ID}"
      ],
      "enabled": true,
      "priority": 8,
      "tags": ["crypto", "agent", "http", "remote"],
      "timeout": 30000,
      "retry": {
        "maxAttempts": 3,
        "delayMs": 1500,
        "backoffMultiplier": 2
      }
    }
  ]
}
```

#### **Extended Config (`mcp-agent.config.json`)**
- Same configuration as above
- Maintains consistency across both configuration files
- Preserves existing Playwright and DocFork MCP servers

### **Frontend Configuration**

#### **MCP Chat Service (`mcp-agent-ui/src/lib/mcp-chat-service.ts`)**
```typescript
const mcpConfig = {
  mcpServers: {
    'hustle-http': {
      command: 'npx',
      args: [
        'mcp-remote',
        `https://hustle-remote.myagent.sh/mcp?apikey=${hustleApiKey}&vaultId=${hustleVaultId}`
      ]
    },
  },
};
```

## 🔒 Security Configuration

### **Environment Variables**

#### **Required Variables**
```bash
# Hustle HTTP MCP Configuration (Required for Crypto Agent MCP)
HUSTLE_API_KEY=your_hustle_api_key_here
HUSTLE_VAULT_ID=your_hustle_vault_id_here
```

#### **Security Features**
- ✅ **No Hardcoded Credentials** - All sensitive data uses environment variables
- ✅ **Secure URL Construction** - API key and vault ID passed as URL parameters
- ✅ **Environment Variable Validation** - Fallback values for missing credentials
- ✅ **Consistent Pattern** - Follows same security model as existing MCP servers

### **Setup Instructions**

1. **Create/Update `.env` file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your Hustle credentials**:
   ```bash
   # Add to .env file
   HUSTLE_API_KEY=your_actual_api_key_here
   HUSTLE_VAULT_ID=your_actual_vault_id_here
   ```

3. **Verify configuration**:
   ```bash
   # Check that environment variables are loaded
   npm run config:validate
   ```

## 🏗️ Technical Architecture

### **Connection Type**: `http`
- Uses `npx mcp-remote` command for HTTP-to-stdio bridging
- Enables remote MCP server communication through HTTP interface
- Maintains compatibility with existing MCP client infrastructure

### **Priority**: `8`
- Medium priority (same as DocFork MCP)
- Lower than Playwright MCP (priority 10)
- Allows for balanced resource allocation

### **Timeout & Retry Configuration**
- **Timeout**: 30 seconds (standard for HTTP-based MCP servers)
- **Max Attempts**: 3 retries
- **Delay**: 1.5 seconds initial delay
- **Backoff**: 2x multiplier for progressive delays

## 🔄 Integration Points

### **Backend Integration**
- **Config Loader** (`src/config/loader.ts`) - Automatically loads server configuration
- **Server Manager** - Handles lifecycle management and health monitoring
- **CLI Interface** - Available through `mcp-agent server` commands

### **Frontend Integration**
- **MCP Chat Service** - Direct integration with chat interface
- **Real-time Communication** - Streaming support for crypto agent interactions
- **UI Components** - Automatic tool execution visibility

## 🧪 Testing & Validation

### **Configuration Validation**
```bash
# Validate all MCP server configurations
npm run config:validate

# Test specific server connectivity
npm run server:test hustle-http
```

### **Frontend Testing**
```bash
# Start frontend development server
cd mcp-agent-ui
npm run dev

# Test MCP integration in chat interface
# Navigate to http://localhost:3000/chat
# Send message: "Test crypto agent capabilities"
```

### **Backend Testing**
```bash
# Start backend with verbose logging
npm run start:verbose

# Check server status
npm run server:status

# Monitor health checks
npm run server:health
```

## 📊 Current MCP Server Ecosystem

| Server | Type | Priority | Status | Purpose |
|--------|------|----------|--------|---------|
| **Playwright MCP** | stdio | 10 | ✅ Active | Browser automation |
| **DocFork MCP** | http | 8 | ✅ Active | Documentation research |
| **Hustle HTTP** | http | 8 | 🆕 New | Crypto agent capabilities |

## 🚨 Troubleshooting

### **Common Issues**

#### **Missing Environment Variables**
```bash
Error: HUSTLE_API_KEY environment variable is required
```
**Solution**: Ensure `.env` file contains valid `HUSTLE_API_KEY` and `HUSTLE_VAULT_ID`

#### **Connection Timeout**
```bash
Error: MCP server connection timeout after 30000ms
```
**Solution**: Check network connectivity and API key validity

#### **Invalid Credentials**
```bash
Error: Authentication failed for Hustle HTTP MCP
```
**Solution**: Verify API key and vault ID are correct and active

### **Debug Commands**
```bash
# Enable verbose logging
export LOG_LEVEL=debug

# Test MCP remote connection
npx mcp-remote https://hustle-remote.myagent.sh/mcp?apikey=YOUR_KEY&vaultId=YOUR_VAULT

# Check environment variables
env | grep HUSTLE
```

## 📈 Next Steps

### **Immediate Actions**
1. ✅ **Configuration Complete** - All files updated with secure credentials
2. 🔄 **Testing Required** - User to test functionality and connectivity
3. 📝 **Documentation Updated** - Integration guide created

### **Future Enhancements**
- **Health Monitoring** - Add specific health checks for crypto agent endpoints
- **Performance Metrics** - Monitor response times and success rates
- **Feature Documentation** - Document specific crypto agent capabilities
- **Integration Examples** - Create sample workflows using crypto agent features

## 📚 Related Documentation

- [MCP Research Optimization Guide](./MCP_RESEARCH_OPTIMIZATION_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Security Incident Report](./SECURITY_INCIDENT_REPORT_2025-08-21.md)

---

**Created**: 2025-08-21  
**Last Updated**: 2025-08-21  
**Status**: Ready for Testing  
**Next Review**: After user testing completion
