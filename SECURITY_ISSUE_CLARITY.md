# 🚨 CRITICAL SECURITY ISSUE: Exposed API Keys - Implementation Clarity

## 📋 **Issue Summary**
**SEVERITY**: CRITICAL  
**TYPE**: Hardcoded API Keys in Source Code  
**IMPACT**: Potential unauthorized access to Smithery/DocFork MCP services  
**STATUS**: Requires immediate remediation  

## 🔍 **Exposed Key Details**
**Key**: `9c441b5c-510a-41cd-a242-f77baa272f2c`
**Services**: Smithery API (DocFork MCP + Playwright MCP integrations)
**Exposure Count**: 10+ files across the codebase (excluding build artifacts)

## 📁 **Files Containing Exposed Key**
1. `mcp-agent.config.json` (line 38, 60)
2. `mcp-config.json` (line 38)
3. `src/config/loader.ts` (line 123, 140)
4. `mcp-agent-ui/src/lib/mcp-chat-service.ts` (line 52)
5. `docs/PROJECT_PROGRESS.md` (line 423)
6. `docs/sessions/SESSION_2025-08-20_PLAYWRIGHT_MCP_INTEGRATION.md` (lines 52, 103, 132)
7. `docs/sessions/SESSION_2025-08-20_DOCFORK_MCP_INTEGRATION.md` (lines 56, 95, 135, 143)
8. `prompts/add-docfork-mcp-server.md` (line 31)
9. Build artifacts in `.next/` directory (compiled versions)

### **Additional Playwright MCP References** (same key used)
10. `docs/BUG_LOG.md` (line 486) - Playwright MCP configuration
11. `docs/API_REFERENCE.md` (line 60) - Playwright MCP setup example

## 🎯 **Implementation Requirements**

### **Phase 1: Immediate Security Response**
1. **Rotate the exposed key** with Smithery service provider
2. **Revoke access** for the compromised key `9c441b5c-510a-41cd-a242-f77baa272f2c`
3. **Generate new API key** from Smithery dashboard

### **Phase 2: Secure Implementation**
Replace all hardcoded keys with environment variable pattern:

#### **Environment Variables Setup**
Create `.env.local` (for development):
```bash
SMITHERY_API_KEY=your_new_api_key_here
SMITHERY_PROFILE=glad-squid-LrsVYY
```

Create `.env.example` (for team reference):
```bash
SMITHERY_API_KEY=your_smithery_api_key
SMITHERY_PROFILE=your_smithery_profile
```

#### **Code Pattern Replacements**
**Replace this pattern:**
```typescript
url: 'https://server.smithery.ai/@docfork/mcp/mcp?api_key=9c441b5c-510a-41cd-a242-f77baa272f2c&profile=glad-squid-LrsVYY'
```

**With this secure pattern:**
```typescript
url: `https://server.smithery.ai/@docfork/mcp/mcp?api_key=${process.env.SMITHERY_API_KEY}&profile=${process.env.SMITHERY_PROFILE}`
```

### **Phase 3: Configuration Updates**

#### **Update mcp-agent.config.json**
```json
{
  "mcpServers": {
    "docfork-mcp": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "@docfork/mcp", "--key", "${SMITHERY_API_KEY}"],
      "env": {
        "SMITHERY_API_KEY": "${SMITHERY_API_KEY}"
      }
    },
    "playwright-mcp": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "@microsoft/playwright-mcp", "--key", "${SMITHERY_API_KEY}"],
      "env": {
        "SMITHERY_API_KEY": "${SMITHERY_API_KEY}"
      }
    }
  }
}
```

#### **Update mcp-config.json**
```json
{
  "mcpServers": {
    "docfork-mcp": {
      "url": "https://server.smithery.ai/@docfork/mcp/mcp?api_key=${SMITHERY_API_KEY}&profile=${SMITHERY_PROFILE}",
      "preferSse": false
    }
  }
}
```

### **Phase 4: Documentation Cleanup**
1. **Remove keys from all documentation files**
2. **Update session logs** to reference environment variables
3. **Update prompts** to use placeholder patterns
4. **Clean build artifacts** by rebuilding the project

### **Phase 5: Prevention Measures**

#### **Add .gitignore entries**
```gitignore
# Environment files
.env.local
.env.production
.env.development

# API keys and secrets
**/config/**/secrets.*
**/*secret*
**/*key*
```

#### **Pre-commit hook setup**
Install and configure tools to prevent future key exposure:
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

## 🔧 **Implementation Checklist**

### **Immediate Actions (Priority 1)**
- [ ] Rotate Smithery API key
- [ ] Revoke compromised key `9c441b5c-510a-41cd-a242-f77baa272f2c`
- [ ] Create `.env.local` with new key
- [ ] Add `.env.local` to `.gitignore`

### **Code Updates (Priority 2)**
- [ ] Update `src/config/loader.ts`
- [ ] Update `mcp-agent-ui/src/lib/mcp-chat-service.ts`
- [ ] Update `mcp-agent.config.json`
- [ ] Update `mcp-config.json`
- [ ] Rebuild project to update `.next/` artifacts

### **Documentation Cleanup (Priority 3)**
- [ ] Clean `docs/PROJECT_PROGRESS.md`
- [ ] Clean `docs/BUG_LOG.md` (Playwright MCP references)
- [ ] Clean `docs/API_REFERENCE.md` (Playwright MCP examples)
- [ ] Clean session documentation files
- [ ] Update prompt templates
- [ ] Create security documentation

### **Prevention Setup (Priority 4)**
- [ ] Set up pre-commit hooks
- [ ] Create secrets management documentation
- [ ] Train team on secure practices
- [ ] Implement automated security scanning

## 🚨 **Critical Notes for Implementation**

1. **DO NOT COMMIT** the new API key to version control
2. **VERIFY** all team members have the new environment setup
3. **TEST** all MCP integrations after key rotation
4. **MONITOR** for any remaining hardcoded secrets
5. **DOCUMENT** the incident for future reference

## 📞 **Next Steps**
1. **Immediate**: Rotate the API key with Smithery
2. **Implementation**: Follow the secure patterns above
3. **Verification**: Test all MCP functionality
4. **Prevention**: Set up automated security checks

---
**Created**: 2025-08-21  
**Agent**: Clarity Agent  
**Priority**: CRITICAL - Implement immediately  
**Estimated Time**: 2-3 hours for complete remediation
