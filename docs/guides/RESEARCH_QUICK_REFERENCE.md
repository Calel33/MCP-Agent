# 🚀 Research Quick Reference - Agent Cheat Sheet

## 🎯 GOAL-ORIENTED RESEARCH PROTOCOL

### **🚨 CRITICAL RULE: ALL RESEARCH MUST DIRECTLY ADDRESS USER'S GOAL**

## 🔍 Research Tool Priority Order

| Priority | Tool | Purpose | When to Use |
|----------|------|---------|-------------|
| **#1** | **Archon MCP** | Project-specific patterns | Our existing implementations |
| **#2** | **DeepWiki MCP** ⭐ | Expert repository analysis | "How to..." questions |
| **#3** | **GitHub MCP** | External pattern discovery | Real-world examples |
| **#4** | **Docfork MCP** | Official documentation | API syntax, installation |

## 🎯 Quick Research Workflow

### **Step 1: Parse Goal**
```
What does user want? → [objective]
What tech stack? → [technology]  
What scope? → [UI/backend/integration]
What deliverable? → [expected output]
```

### **Step 2: Execute Research (4 Phases)**

#### **Phase 1: Archon (Project Patterns)**
```typescript
// Check what we have
get_available_sources()

// Search our patterns
search_code_examples({
  query: "[technology] [objective]",
  source_id: "relevant-source",
  match_count: 5
})
```

#### **Phase 2: DeepWiki (Expert Guidance)** ⭐
```typescript
// Ask implementation questions
ask_question_deepwiki({
  repoName: "[technology]/[repository]",
  question: "How do I [objective] using [technology]?"
})

// Get best practices
ask_question_deepwiki({
  repoName: "[technology]/[repository]", 
  question: "What are the best practices for [objective]?"
})
```

#### **Phase 3: GitHub (External Examples)**
```typescript
// Find quality implementations
githubSearchCode_octocode([{
  queryTerms: ["[objective]", "[technology]"],
  owner: ["quality-orgs"],
  language: "[language]",
  stars: ">100"
}])
```

#### **Phase 4: Docfork (Official Docs)**
```typescript
// Get official documentation
get-library-docs_docfork("[author]/[library]", "[topic]")
```

### **Step 3: Synthesize & Plan**
```
✅ Connect all findings back to user's goal
✅ Create step-by-step implementation plan
✅ Include security/performance considerations
✅ Define testing strategy
```

## 🎯 Research Templates by Goal Type

### **UI/Frontend Goals**
```typescript
// 1. Our UI patterns
search_code_examples("React [component] responsive", source_id="ui.shadcn.com")

// 2. Expert React guidance  
ask_question_deepwiki("facebook/react", "How do I create [component] with [features]?")

// 3. Quality examples
githubSearchCode_octocode([{queryTerms: ["[component]"], owner: ["vercel", "shadcn-ui"]}])

// 4. Official React docs
get-library-docs_docfork("facebook/react", "components")
```

### **Backend/API Goals**
```typescript
// 1. Our API patterns
perform_rag_query("[framework] API [feature] implementation")

// 2. Expert backend guidance
ask_question_deepwiki("[framework]/[framework]", "How do I implement [feature] securely?")

// 3. Quality examples  
searchGitHub_grep("[framework] [feature]", repo="[framework]/")

// 4. Official docs
get-library-docs_docfork("[framework]/[framework]", "[feature]")
```

### **Integration/MCP Goals**
```typescript
// 1. Our MCP patterns
search_code_examples("MCP [integration] TypeScript", source_id="our-mcp-examples")

// 2. Expert integration guidance
ask_question_deepwiki("[mcp-repo]", "How do I integrate [service] with [platform]?")

// 3. MCP examples
githubSearchCode_octocode([{queryTerms: ["mcp", "[integration]"]}])
```

## 🧠 DeepWiki Power Patterns ⭐

### **Question Types That Work Best:**
- ✅ **"How do I..."** → Implementation guidance
- ✅ **"What are the best practices for..."** → Expert recommendations  
- ✅ **"How should I architect..."** → Design patterns
- ✅ **"What are common pitfalls when..."** → Error prevention
- ✅ **"How do I handle errors in..."** → Robust error management

### **DeepWiki Repository Targets:**
- **React**: `facebook/react`
- **Next.js**: `vercel/next.js`  
- **Express**: `expressjs/express`
- **TypeScript**: `microsoft/TypeScript`
- **Tailwind**: `tailwindlabs/tailwindcss`
- **Node.js**: `nodejs/node`

## 🚨 Research Quality Checklist

### **Before Starting:**
- [ ] Clearly understand user's goal
- [ ] Identify technology stack involved
- [ ] Plan which MCP tools to use

### **During Research:**
- [ ] Start with Archon (our patterns)
- [ ] Ask expert questions with DeepWiki
- [ ] Find external validation with GitHub
- [ ] Confirm with official docs via Docfork
- [ ] Ensure each finding connects to goal

### **Before Responding:**
- [ ] All research directly addresses user's goal
- [ ] Implementation plan is actionable
- [ ] Security/performance considered
- [ ] Integration approach defined
- [ ] Testing strategy included

## 🎯 Research Report Template

```markdown
# 🔍 Research Report: [Goal]

## 📋 Goal Analysis
**Objective**: [What user wants]
**Technology**: [Tech stack]  
**Scope**: [UI/Backend/Integration]

## 🔍 Research Findings

### 🏗️ Our Patterns (Archon)
[Project-specific implementations]

### 🧠 Expert Guidance (DeepWiki) ⭐
[Key insights and best practices]

### 🐙 External Examples (GitHub)  
[Quality real-world implementations]

### 📚 Official Docs (Docfork)
[API syntax and official guidance]

## 🎯 Implementation Plan
1. [Step 1]
2. [Step 2]  
3. [Step 3]

## ⚠️ Considerations
- Security: [Security factors]
- Performance: [Performance factors]
- Integration: [How it fits existing code]

## 🧪 Testing Strategy
[How to validate implementation]

## 🚀 Next Steps
[Immediate actions for user]
```

## 🚫 Common Research Mistakes

### **❌ DON'T:**
- Use generic search terms
- Skip project-specific research (Archon)
- Ignore the user's actual goal
- Provide research without implementation plan
- Forget security/performance considerations

### **✅ DO:**
- Always start with user's goal
- Use all 4 MCP tools when possible
- Ask specific DeepWiki questions
- Connect findings back to goal
- Provide actionable next steps

## 🎯 Success Metrics

### **Research Success Indicators:**
- ✅ User can immediately start implementation
- ✅ All aspects of goal are covered
- ✅ Best practices and security included
- ✅ Clear integration path provided
- ✅ Testing approach defined

### **Research Quality Levels:**
- **Good**: 2+ MCP tools, basic implementation plan
- **Great**: 3+ MCP tools, comprehensive plan with considerations  
- **Excellent**: All 4 MCP tools, detailed plan with testing and security

---

**🎯 Remember**: Every research action must directly contribute to achieving the user's stated goal!

**📝 Created**: 2025-08-21  
**🚀 Usage**: Reference during any research request
