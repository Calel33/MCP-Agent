# 🎯 Goal-Oriented Research Guide - Agent Research Protocol

## 🎯 Purpose

This guide provides a systematic approach for agents to conduct comprehensive, goal-oriented research using our enhanced MCP tools. Every research session must directly address the user's stated goal and provide actionable implementation guidance.

## 🚨 CRITICAL RESEARCH PRINCIPLE

**ALL RESEARCH MUST BE GOAL-ORIENTED**: Every research action must directly contribute to achieving the user's stated objective. Research that doesn't connect back to the goal is incomplete and ineffective.

## 🔍 Research Tool Priority Order

### **Priority #1: Archon MCP** - Project-Specific Knowledge
- **When**: Always start here for project-related research
- **Purpose**: Search within OUR project's knowledge base and integrated sources
- **Best For**: Existing patterns, our tech stack, project-specific implementations

### **Priority #2: DeepWiki MCP** - Intelligent Repository Analysis ⭐
- **When**: Need expert understanding of how to implement features
- **Purpose**: Ask natural language questions about repositories for expert-level answers
- **Best For**: "How to..." questions, best practices, architecture guidance, implementation patterns

### **Priority #3: GitHub MCP** - External Pattern Discovery
- **When**: Need real-world examples and community patterns
- **Purpose**: Find implementations across the broader ecosystem
- **Best For**: Pattern validation, discovering new approaches, quality examples

### **Priority #4: Docfork MCP** - Official Documentation
- **When**: Need official API documentation and installation guides
- **Purpose**: Fetch up-to-date official documentation
- **Best For**: API syntax, installation procedures, official best practices

## 🎯 Goal-Oriented Research Workflow

### **Phase 1: Goal Analysis & Research Planning**

#### **Step 1: Parse User Goal**
```typescript
// Extract key components from user request
const goalAnalysis = {
  objective: "What does the user want to achieve?",
  technology: "What tech stack/libraries are involved?",
  scope: "Is this UI, backend, integration, etc.?",
  constraints: "Any specific requirements or limitations?",
  deliverable: "What should be the final output?"
}
```

#### **Step 2: Plan Research Strategy**
```typescript
// Determine which tools to use based on goal
const researchPlan = {
  archonQueries: ["Project-specific patterns to search"],
  deepwikiQuestions: ["Expert questions to ask"],
  githubSearches: ["External patterns to discover"],
  docforkTopics: ["Official docs to fetch"]
}
```

### **Phase 2: Systematic Research Execution**

#### **Step 1: Project-Specific Research (Archon)**
```typescript
// Always start with our existing knowledge
const projectResearch = async (goal) => {
  // Check available sources
  const sources = await get_available_sources();
  
  // Search project-specific patterns
  const patterns = await search_code_examples({
    query: `${goal.technology} ${goal.objective}`,
    source_id: "relevant-source-id",
    match_count: 5
  });
  
  // Query project documentation
  const docs = await perform_rag_query({
    query: `${goal.technology} ${goal.objective} implementation`,
    match_count: 3
  });
  
  return { sources, patterns, docs };
};
```

#### **Step 2: Expert Analysis (DeepWiki)**
```typescript
// Get intelligent insights about implementation
const expertResearch = async (goal) => {
  // Ask implementation questions
  const howTo = await ask_question_deepwiki({
    repoName: `${goal.technology}/repository`,
    question: `How do I ${goal.objective} using ${goal.technology}?`
  });
  
  // Get best practices
  const bestPractices = await ask_question_deepwiki({
    repoName: `${goal.technology}/repository`,
    question: `What are the best practices for ${goal.objective} in ${goal.technology}?`
  });
  
  // Understand architecture
  const architecture = await ask_question_deepwiki({
    repoName: `${goal.technology}/repository`,
    question: `How should I architect ${goal.objective} for scalability and maintainability?`
  });
  
  return { howTo, bestPractices, architecture };
};
```

#### **Step 3: Pattern Discovery (GitHub)**
```typescript
// Find real-world implementations
const patternResearch = async (goal) => {
  // Search for quality implementations
  const implementations = await githubSearchCode_octocode([{
    queryTerms: [goal.objective, goal.technology],
    owner: ["quality-organizations"],
    language: goal.language,
    stars: ">100",
    pushed: ">2023-01-01"
  }]);
  
  // Find specific patterns
  const patterns = await searchGitHub_grep({
    query: `${goal.objective}.*${goal.technology}`,
    language: [goal.language],
    useRegexp: true,
    repo: "quality-repos/"
  });
  
  return { implementations, patterns };
};
```

#### **Step 4: Official Documentation (Docfork)**
```typescript
// Get official documentation
const officialResearch = async (goal) => {
  // Fetch library documentation
  const docs = await get-library-docs_docfork(
    `${goal.author}/${goal.library}`,
    goal.topic
  );
  
  return { docs };
};
```

### **Phase 3: Research Synthesis & Goal Alignment**

#### **Step 1: Analyze Research Results**
```typescript
const synthesizeResearch = (projectRes, expertRes, patternRes, officialRes) => {
  return {
    projectPatterns: "What patterns exist in our project?",
    expertGuidance: "What do experts recommend?",
    realWorldExamples: "How do others implement this?",
    officialApproach: "What's the official way?",
    gaps: "What information is missing?",
    conflicts: "Are there conflicting approaches?"
  };
};
```

#### **Step 2: Create Goal-Aligned Implementation Plan**
```typescript
const createImplementationPlan = (synthesis, originalGoal) => {
  return {
    approach: "Chosen implementation approach based on research",
    rationale: "Why this approach best achieves the goal",
    steps: ["Step-by-step implementation plan"],
    considerations: ["Security, performance, maintainability factors"],
    testing: "How to validate the implementation",
    integration: "How this fits with existing codebase"
  };
};
```

## 🎯 Research Templates by Goal Type

### **UI/Frontend Implementation Goals**
```typescript
const frontendResearchTemplate = async (goal) => {
  // 1. Project patterns
  const ourPatterns = await search_code_examples({
    query: `React ${goal.component} responsive ${goal.framework}`,
    source_id: "ui.shadcn.com"
  });
  
  // 2. Expert guidance
  const expertAdvice = await ask_question_deepwiki({
    repoName: "facebook/react",
    question: `How do I create ${goal.component} with ${goal.features}?`
  });
  
  // 3. Real-world examples
  const examples = await githubSearchCode_octocode([{
    queryTerms: [goal.component, goal.features],
    owner: ["vercel", "shadcn-ui"],
    language: "typescript"
  }]);
  
  // 4. Official docs
  const docs = await get-library-docs_docfork("facebook/react", "components");
  
  return { ourPatterns, expertAdvice, examples, docs };
};
```

### **Backend/API Implementation Goals**
```typescript
const backendResearchTemplate = async (goal) => {
  // 1. Project patterns
  const ourAPI = await perform_rag_query({
    query: `${goal.framework} API ${goal.feature} implementation`,
    match_count: 3
  });
  
  // 2. Expert guidance
  const expertAdvice = await ask_question_deepwiki({
    repoName: `${goal.framework}/${goal.framework}`,
    question: `How do I implement ${goal.feature} with proper error handling and security?`
  });
  
  // 3. Real-world examples
  const examples = await searchGitHub_grep({
    query: `${goal.framework} ${goal.feature}`,
    language: [goal.language],
    repo: `${goal.framework}/`
  });
  
  // 4. Official docs
  const docs = await get-library-docs_docfork(`${goal.framework}/${goal.framework}`, goal.feature);
  
  return { ourAPI, expertAdvice, examples, docs };
};
```

### **Integration/MCP Implementation Goals**
```typescript
const integrationResearchTemplate = async (goal) => {
  // 1. Project patterns
  const ourIntegrations = await search_code_examples({
    query: `MCP ${goal.integration} TypeScript configuration`,
    source_id: "our-mcp-examples"
  });
  
  // 2. Expert guidance
  const expertAdvice = await ask_question_deepwiki({
    repoName: goal.mcpRepo,
    question: `How do I integrate ${goal.integration} with ${goal.platform}?`
  });
  
  // 3. Real-world examples
  const examples = await githubSearchCode_octocode([{
    queryTerms: ["mcp", goal.integration],
    language: "typescript"
  }]);
  
  return { ourIntegrations, expertAdvice, examples };
};
```

## 🎯 Research Quality Validation

### **Goal Alignment Checklist**
- [ ] **Direct Relevance**: Does research directly address the user's goal?
- [ ] **Actionable Insights**: Can the user implement based on research findings?
- [ ] **Complete Coverage**: Are all aspects of the goal covered?
- [ ] **Best Practices**: Are security, performance, and maintainability considered?
- [ ] **Integration Path**: Is it clear how to integrate with existing codebase?

### **Research Completeness Checklist**
- [ ] **Project Context**: Checked existing patterns and implementations
- [ ] **Expert Guidance**: Got intelligent insights from DeepWiki
- [ ] **Real-World Validation**: Found quality external examples
- [ ] **Official Confirmation**: Verified with official documentation
- [ ] **Implementation Plan**: Created step-by-step approach
- [ ] **Risk Assessment**: Identified potential challenges and solutions

## 🚀 Research Output Format

### **Standard Research Report Template**
```markdown
# 🎯 Research Report: [Goal Description]

## 📋 Goal Analysis
- **Objective**: [What user wants to achieve]
- **Technology**: [Tech stack involved]
- **Scope**: [UI/Backend/Integration/etc.]
- **Deliverable**: [Expected output]

## 🔍 Research Findings

### 🏗️ Project-Specific Patterns (Archon)
[What patterns exist in our project]

### 🧠 Expert Guidance (DeepWiki)
[Key insights from intelligent repository analysis]

### 🐙 Real-World Examples (GitHub)
[Quality implementations from the ecosystem]

### 📚 Official Documentation (Docfork)
[Official API and best practices]

## 🎯 Implementation Plan
[Step-by-step approach based on research]

## ⚠️ Considerations
[Security, performance, integration factors]

## 🧪 Testing Strategy
[How to validate the implementation]

## 🔗 Next Steps
[Immediate actions to achieve the goal]
```

## 🤖 Agent Research Instructions

### **When User Requests Research**

#### **Trigger Phrases:**
- "Research how to..."
- "Find the best way to..."
- "I need to understand..."
- "Help me implement..."
- "What's the best approach for..."

#### **Agent Response Protocol:**
1. **Acknowledge Research Request**
   ```
   🔍 **RESEARCH MODE ACTIVATED**

   I'll conduct comprehensive research to help you [restate goal].
   Research Priority: Archon → DeepWiki → GitHub → Docfork
   ```

2. **Execute Systematic Research**
   - Follow the 4-phase research workflow
   - Use appropriate templates based on goal type
   - Ensure all research connects back to the user's goal

3. **Deliver Research Report**
   - Use the standard research report template
   - Provide actionable implementation guidance
   - Include next steps and considerations

### **Research Quality Standards**

#### **Minimum Research Requirements:**
- ✅ **At least 2 MCP tools used** (preferably all 4)
- ✅ **Direct goal alignment** demonstrated
- ✅ **Actionable implementation plan** provided
- ✅ **Security and best practices** considered
- ✅ **Integration approach** defined

#### **Excellence Indicators:**
- 🌟 **All 4 MCP tools used effectively**
- 🌟 **Multiple implementation approaches** compared
- 🌟 **Potential challenges** identified and addressed
- 🌟 **Testing strategy** included
- 🌟 **Performance considerations** documented

## 🎯 Real-World Research Examples

### **Example 1: "Research how to add real-time notifications to our React app"**

#### **Goal Analysis:**
- **Objective**: Add real-time notifications
- **Technology**: React, potentially WebSockets/SSE
- **Scope**: Frontend with backend integration
- **Deliverable**: Working notification system

#### **Research Execution:**
```typescript
// Phase 1: Project patterns
const projectPatterns = await search_code_examples({
  query: "React notifications real-time WebSocket",
  source_id: "ui.shadcn.com",
  match_count: 5
});

// Phase 2: Expert guidance
const expertAdvice = await ask_question_deepwiki({
  repoName: "facebook/react",
  question: "How do I implement real-time notifications in React applications with proper state management?"
});

// Phase 3: Real-world examples
const examples = await githubSearchCode_octocode([{
  queryTerms: ["react", "notifications", "websocket"],
  owner: ["vercel", "facebook"],
  language: "typescript",
  stars: ">500"
}]);

// Phase 4: Official docs
const docs = await get-library-docs_docfork("facebook/react", "state-management");
```

### **Example 2: "Research the best way to implement JWT authentication in Express"**

#### **Goal Analysis:**
- **Objective**: Implement JWT authentication
- **Technology**: Express.js, JWT
- **Scope**: Backend API security
- **Deliverable**: Secure authentication system

#### **Research Execution:**
```typescript
// Phase 1: Project patterns
const authPatterns = await perform_rag_query({
  query: "Express.js JWT authentication middleware security",
  match_count: 3
});

// Phase 2: Expert guidance
const expertAdvice = await ask_question_deepwiki({
  repoName: "expressjs/express",
  question: "What are the best practices for implementing JWT authentication with proper security measures?"
});

// Phase 3: Real-world examples
const examples = await searchGitHub_grep({
  query: "express jwt middleware authentication",
  repo: "expressjs/",
  language: ["JavaScript", "TypeScript"]
});

// Phase 4: Official docs
const jwtDocs = await get-library-docs_docfork("auth0/jsonwebtoken", "authentication");
```

## 🎯 Research Troubleshooting

### **Common Research Issues & Solutions**

#### **Issue: "No relevant results from Archon"**
**Solution**:
- Check available sources first: `get_available_sources()`
- Use project-specific terminology
- Try broader then narrower queries
- Remember: Archon is for OUR project patterns only

#### **Issue: "DeepWiki questions not getting good answers"**
**Solution**:
- Ask specific "How to..." questions
- Include context about what you're trying to achieve
- Try different repository names (e.g., main library vs ecosystem repos)
- Ask about best practices and architecture

#### **Issue: "GitHub searches returning irrelevant results"**
**Solution**:
- Use more specific query terms
- Filter by quality repositories (stars, recent activity)
- Use regex patterns for exact matches
- Target specific organizations/owners

#### **Issue: "Research doesn't connect to goal"**
**Solution**:
- Re-read the user's original goal
- Ensure each research query includes goal-relevant terms
- Synthesize findings with explicit goal connection
- Create implementation plan that directly addresses the goal

## 🔄 Continuous Research Improvement

### **After Each Research Session:**
1. **Document what worked** - Note successful query patterns
2. **Identify gaps** - What information was missing?
3. **Update templates** - Improve research templates based on learnings
4. **Share insights** - Add successful patterns to this guide

### **Research Metrics:**
- **Goal Achievement**: Did research enable goal completion?
- **Efficiency**: How quickly was relevant information found?
- **Quality**: Were best practices and security considered?
- **Completeness**: Were all aspects of the goal covered?

---

**📝 Created**: 2025-08-21
**🎯 Purpose**: Enable systematic, goal-oriented research using enhanced MCP tools
**🔄 Status**: Living document - update based on research outcomes
**🚀 Usage**: Reference this guide when conducting research for users
