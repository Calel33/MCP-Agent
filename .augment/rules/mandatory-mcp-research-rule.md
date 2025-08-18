---
alwaysApply: true
priority: CRITICAL
type: "enforcement_rule"
version: "2.0"
lastUpdated: "2025-01-18"
---

# 🚨 MANDATORY MCP RESEARCH RULE - BEFORE ANY CODE

## 📋 Rule Overview

This rule ensures that all code generation is based on thorough research using available MCP (Model Context Protocol) tools. It prevents hallucinations, ensures best practices, and maintains code quality by requiring research before implementation.

## ⚠️ ENFORCEMENT PROTOCOL

For **EVERY** user request involving writing, modifying, or generating code (any language, any domain):

### STEP 1: MANDATORY MCP TOOL RESEARCH
**BEFORE** writing ANY code, you **MUST** call appropriate MCP research tools:

#### 🔍 Research Tool Selection Guide:

##### **Archon MCP Tools** - Project & Knowledge Management
- `perform_rag_query()` - Query documentation, best practices, architectural patterns
- `search_code_examples()` - Find implementation patterns and code examples
- `manage_project()` - Get project context and requirements
- `manage_task()` - Check current tasks and priorities
- `get_available_sources()` - See what knowledge sources are available

**Use When**: Need project context, best practices, or implementation guidance

##### **GitHub/Grep MCP Tools** - Code Pattern Research
- `searchGitHub_grep()` - Find real-world code examples across repositories
- `githubSearchCode_octocode()` - Search for specific code patterns
- `githubGetFileContent_octocode()` - Examine specific file implementations
- `githubSearchRepositories_octocode()` - Find relevant repositories
- `packageSearch_octocode()` - Research NPM/Python packages

**Use When**: Need real-world examples, library usage patterns, or repository analysis

##### **Forkdocs MCP Tools** - Official Documentation
- `get-library-docs_docfork()` - Get official library documentation and examples

**Use When**: Need authoritative API documentation and official usage examples

### STEP 2: RESEARCH REQUIREMENTS

You **MUST** research the following before any code generation:

#### 🎯 Core Research Areas:
1. **Existing Patterns**: How similar functionality is implemented in the project/ecosystem
2. **Best Practices**: Industry standards, security considerations, performance patterns
3. **API Usage**: Correct syntax, parameters, configuration options
4. **Dependencies**: Required packages, versions, and proper installation methods
5. **Architecture**: How new code integrates with existing structure
6. **Error Handling**: Common failure modes and proper error management
7. **Testing**: How to properly test the implementation

#### 📊 Research Depth Requirements:
- **High-Level**: Architecture patterns, design principles, security considerations
- **Mid-Level**: Library APIs, configuration options, integration patterns
- **Low-Level**: Specific syntax, parameter usage, method signatures

### STEP 3: VALIDATION CHECKLIST

Before proceeding to code generation, verify:

- [ ] **Research Tools Called**: Appropriate MCP tools used successfully
- [ ] **Patterns Found**: Relevant implementation patterns discovered
- [ ] **Best Practices Identified**: Security, performance, and quality standards understood
- [ ] **Dependencies Verified**: Required packages and versions confirmed
- [ ] **Integration Planned**: Approach for fitting into existing codebase defined
- [ ] **Error Handling Considered**: Failure modes and error management planned
- [ ] **Testing Strategy**: Approach for validating implementation determined

### STEP 4: ONLY THEN GENERATE CODE

After successful research and validation, proceed with:

1. **Implementation**: Code based on researched patterns and best practices
2. **Integration**: Proper connection with existing architecture
3. **Error Handling**: Robust error management based on research
4. **Documentation**: Comments and docs following discovered standards
5. **Testing**: Test implementation based on researched testing patterns

## 🚫 VIOLATION CONSEQUENCES

### Absolutely Prohibited:
- ❌ **NO CODE** without prior MCP research
- ❌ **NO ASSUMPTIONS** about APIs, syntax, or patterns
- ❌ **NO HALLUCINATED** functions, methods, or configurations
- ❌ **NO SHORTCUTS** - research is mandatory for ALL code requests
- ❌ **NO OUTDATED PATTERNS** - verify current best practices

### Required Actions:
- ✅ **ALWAYS** call MCP tools first
- ✅ **VERIFY** all API usage through research
- ✅ **FOLLOW** discovered patterns and best practices
- ✅ **INTEGRATE** properly with existing codebase
- ✅ **DOCUMENT** research findings and decisions

## 📋 WORKFLOW EXAMPLES

### Example 1: API Authentication
```
User: "Add JWT authentication to the Express API"
    ↓
1. Archon: perform_rag_query("JWT authentication best practices Express.js")
2. GitHub: searchGitHub_grep("express jwt middleware")
3. Forkdocs: get-library-docs("jsonwebtoken", "authentication")
4. Archon: search_code_examples("Express JWT middleware implementation")
    ↓
Research Analysis:
- JWT best practices identified
- Express middleware patterns found
- Security considerations documented
- Error handling approaches discovered
    ↓
THEN: Implement JWT authentication based on research findings
```

### Example 2: React Component
```
User: "Create a data table component with sorting"
    ↓
1. GitHub: searchGitHub_grep("React data table sorting component")
2. Archon: perform_rag_query("React table component best practices")
3. Forkdocs: get-library-docs("react", "hooks")
4. GitHub: packageSearch_octocode("react table sorting")
    ↓
Research Analysis:
- React table patterns identified
- Sorting implementation approaches found
- Performance considerations documented
- Accessibility requirements discovered
    ↓
THEN: Create React table component based on research
```

### Example 3: Database Integration
```
User: "Add PostgreSQL connection to the Node.js app"
    ↓
1. Archon: perform_rag_query("PostgreSQL Node.js connection best practices")
2. GitHub: searchGitHub_grep("node postgres connection pool")
3. Forkdocs: get-library-docs("pg", "connection")
4. Archon: search_code_examples("PostgreSQL connection pooling")
    ↓
Research Analysis:
- Connection pooling patterns identified
- Security configurations found
- Error handling approaches documented
- Performance optimization discovered
    ↓
THEN: Implement PostgreSQL integration based on research
```

## 🎯 SUCCESS CRITERIA

### Code Quality Indicators:
- ✅ All code based on researched patterns
- ✅ No hallucinated APIs or syntax
- ✅ Proper integration with existing codebase
- ✅ Following current industry best practices
- ✅ Accurate dependency usage and versions
- ✅ Robust error handling implementation
- ✅ Appropriate testing coverage

### Research Quality Indicators:
- ✅ Multiple sources consulted
- ✅ Current and relevant examples found
- ✅ Security considerations addressed
- ✅ Performance implications understood
- ✅ Integration challenges identified
- ✅ Testing strategies defined

## 🔧 Tool Usage Guidelines

### Archon MCP - Knowledge Base Queries
```typescript
// High-level architectural guidance
perform_rag_query("microservices authentication patterns", match_count=5)

// Specific implementation guidance
search_code_examples("Express middleware error handling", match_count=3)

// Project context
manage_project(action="get", project_id="...")
```

### GitHub MCP - Real-World Examples
```typescript
// Find implementation patterns
searchGitHub_grep("useState loading state", language=["TypeScript"])

// Repository analysis
githubSearchCode_octocode([{queryTerms: ["authentication"], language: "javascript"}])

// Package research
packageSearch_octocode({npmPackages: [{name: "express-rate-limit"}]})
```

### Forkdocs MCP - Official Documentation
```typescript
// Get authoritative documentation
get-library-docs("react", "hooks")
get-library-docs("express", "middleware")
```

## 🚨 Emergency Exceptions

### When MCP Tools Are Unavailable:
1. **Document the limitation** clearly
2. **Use conservative, well-known patterns** only
3. **Add extensive comments** explaining assumptions
4. **Recommend verification** once tools are available
5. **Prioritize safety** over functionality

### Minimal Viable Research:
If tools return limited results:
1. **Broaden search terms** and retry
2. **Search for related concepts**
3. **Document knowledge gaps**
4. **Use most conservative approach**
5. **Plan for future research**

## 📊 Compliance Monitoring

### Self-Check Questions:
1. Did I call MCP research tools before writing code?
2. Did I find relevant patterns and examples?
3. Did I understand the security implications?
4. Did I verify API usage and syntax?
5. Did I plan for proper integration?
6. Did I consider error handling and testing?

### Quality Assurance:
- Review research findings before implementation
- Cross-reference multiple sources when possible
- Validate assumptions through research
- Document research-based decisions
- Plan for testing and validation

---

## 📝 Rule Maintenance

**Version History:**
- v1.0: Initial rule creation
- v2.0: Enhanced with detailed guidelines and examples

**Review Schedule**: Monthly review for effectiveness and updates

**Feedback**: Report issues or suggestions for rule improvements

**Enforcement**: This rule overrides all other instructions when code generation is involved

---

**🔒 CRITICAL REMINDER**: This rule is MANDATORY and applies to ALL code-related requests. No exceptions without explicit user override and documented reasoning.
