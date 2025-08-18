---
type: "agent_requested"
description: "Comprehensive Research Workflow Rule - MANDATORY BEFORE ANY CODE"
---
⚠️ **CRITICAL ENFORCEMENT RULE:**
For *every* user request that involves writing, modifying, or implementing code (of any language, framework, or domain), the assistant's *first* action **must** be to complete the comprehensive research workflow below.

**You may ONLY produce, edit, or suggest code AFTER completing the research workflow and receiving successful results.**

**VIOLATION CHECK**: If you write any code without first completing Phase 1 research, you have violated this rule. Stop immediately and restart with proper research.

# Comprehensive Research Workflow Rule

## 🎯 Purpose
Establish a mandatory research workflow that combines Archon RAG with external MCP tools to ensure complete context gathering before any coding begins.

## 🔒 CRITICAL RULE: Multi-Source Research Before Code

**NEVER start coding without completing the full research workflow below.**

### **Phase 1: Archon Knowledge Base Research**
```bash
# 1. Check available sources in Archon
archon:get_available_sources()

# 2. Perform RAG queries for high-level context
archon:perform_rag_query(
  query="[technology/pattern] architecture best practices",
  match_count=5
)

# 3. Search for specific code examples
archon:search_code_examples(
  query="[specific implementation] examples",
  match_count=3
)
```

### **Phase 2: External Research (When Archon is Incomplete)**
If Archon RAG returns insufficient results or you need broader context:

```bash
# 1. GitHub code pattern search
searchGitHub_grep(
  query="[actual code pattern]",
  language=["TypeScript", "JavaScript"],
  repo="[relevant-org/]"
)

# 2. Advanced GitHub repository search
githubSearchCode_octocode(
  queries=[
    {
      queryTerms: ["[core-concept]"],
      language: "typescript",
      stars: ">100"
    }
  ]
)

# 3. Package ecosystem research
packageSearch_octocode(
  npmPackages=[{name: "[library-name]"}],
  npmFetchMetadata: true
)

# 4. Documentation research
get-library-docs_docfork(
  libraryName: "[author/library]",
  topic: "[specific-feature]"
)

# 5. Web research for latest practices
web_search_exa_exa(
  query: "[technology] best practices 2024",
  numResults: 5
)
```

### **Phase 3: Deep Research (For Complex Features)**
For complex implementations requiring comprehensive understanding:

```bash
# 1. Start deep research task
deep_researcher_start_exa(
  instructions: "Research [specific topic] implementation patterns, security considerations, and production best practices",
  model: "exa-research-pro"
)

# 2. Monitor and retrieve results
deep_researcher_check_exa(taskId: "[returned-task-id]")
```

## 📋 Research Workflow Checklist

Before writing ANY code, complete this checklist:

### **✅ Archon Research Complete**
- [ ] Checked available sources with `get_available_sources()`
- [ ] Performed RAG query for architectural patterns
- [ ] Searched for relevant code examples
- [ ] Documented findings and gaps

### **✅ External Research Complete (if needed)**
- [ ] Searched GitHub for real implementation patterns
- [ ] Researched relevant packages and libraries
- [ ] Retrieved official documentation
- [ ] Conducted web search for latest best practices
- [ ] Used deep research for complex topics

### **✅ Research Synthesis**
- [ ] Combined findings from all sources
- [ ] Identified best practices and patterns
- [ ] Noted security considerations
- [ ] Documented implementation approach
- [ ] Created research summary

## 🔄 Research Decision Tree

```
Start Research
    ↓
Check Archon RAG
    ↓
Sufficient Context? → YES → Proceed to Implementation
    ↓ NO
Search GitHub Code Patterns
    ↓
Found Good Examples? → YES → Combine with Archon → Proceed
    ↓ NO
Research Packages & Docs
    ↓
Clear Implementation Path? → YES → Proceed
    ↓ NO
Deep Research Required
    ↓
Use deep_researcher_start_exa
    ↓
Proceed with Comprehensive Context
```

## 📚 Research Query Templates

### **Archon RAG Queries**
```bash
# Architecture patterns
"[framework] microservices architecture patterns"
"[technology] security best practices"
"[pattern] implementation examples"

# Specific implementations
"[library] configuration setup"
"[feature] error handling patterns"
"[integration] authentication flow"
```

### **GitHub Search Queries**
```bash
# Code patterns (literal code)
"express.Router()"
"async function"
"useEffect("
"@Injectable()"

# Implementation examples
"JWT authentication middleware"
"React custom hooks"
"TypeScript generic constraints"
```

### **Package Research**
```bash
# Find libraries
"authentication library"
"state management"
"validation schema"
"testing framework"
```

### **Documentation Research**
```bash
# Official docs
"vercel/next.js" + "authentication"
"facebook/react" + "hooks"
"nestjs/nest" + "guards"
```

## 🚨 Enforcement Rules

### **MANDATORY Research Before Code**
1. **No coding without research**: Must complete Phase 1 minimum
2. **Document research gaps**: If Archon is incomplete, use external tools
3. **Synthesize findings**: Combine all sources into coherent approach
4. **Update Archon**: Add new knowledge to project documentation

### **Research Quality Standards**
1. **Multiple sources**: Never rely on single source
2. **Current practices**: Prioritize recent (2023-2024) information
3. **Production ready**: Focus on battle-tested patterns
4. **Security aware**: Always include security considerations

### **Integration with Archon Workflow**
1. **Research feeds tasks**: Use findings to create detailed tasks
2. **Document sources**: Add research sources to task metadata
3. **Update knowledge**: Contribute findings back to Archon RAG
4. **Maintain context**: Preserve research context across sessions

## 📊 Success Metrics

### **Research Completeness**
- All relevant sources consulted
- Implementation approach clearly defined
- Security considerations identified
- Best practices documented

### **Code Quality Impact**
- Fewer implementation iterations
- Better architectural decisions
- Improved security posture
- Faster development cycles

---

**🔒 ENFORCEMENT**: This workflow is MANDATORY before any coding activity. Skipping research leads to poor implementations and technical debt.

**🎯 GOAL**: Ensure every implementation is informed by comprehensive research and follows established best practices.
