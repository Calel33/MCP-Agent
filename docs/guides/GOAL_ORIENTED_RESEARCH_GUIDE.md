# 🎯 Goal-Oriented Research Guide - Agent Research Protocol

## 🎯 Purpose

This guide provides a systematic approach for agents to conduct comprehensive, goal-oriented research using our enhanced MCP tools. Every research session must directly address the user's stated goal and provide actionable implementation guidance.

## 🚨 CRITICAL RESEARCH PRINCIPLES

### **Principle #1: ALL RESEARCH MUST BE GOAL-ORIENTED**
Every research action must directly contribute to achieving the user's stated objective. Research that doesn't connect back to the goal is incomplete and ineffective.

### **Principle #2: ALWAYS CHECK PROJECT DOCS FOLDER FIRST** ✅ NEW
Before any external research, agents MUST read our `docs/` folder to understand:
- **Current project architecture** (`ARCHITECTURE.md`)
- **Implementation patterns we've established** (`IMPLEMENTATION_DOCUMENT_*.md`)
- **Previous learnings and insights** (`WHAT_WE_LEARNED_*.md`)
- **Completed features and handoffs** (`*_COMPLETION_HANDOFF.md`)
- **Current project status** (`PROJECT_PROGRESS.md`)
- **Session history and context** (`SESSION_LOG.md`)

**Why This Matters**: Our docs folder contains comprehensive project context that prevents:
- ❌ Suggesting approaches that conflict with our established patterns
- ❌ Re-researching solutions we've already implemented
- ❌ Missing critical environmental context (like the Next.js file path issue)
- ❌ Ignoring lessons learned from previous sessions
- ❌ Proposing architectures that don't fit our existing system

## 🔍 Research Tool Priority Order

### **Priority #0: Local Project Documentation** - MANDATORY FIRST STEP ✅ NEW
- **When**: ALWAYS - Before any other research tool
- **Purpose**: Read our comprehensive `docs/` folder for project context
- **Best For**: Understanding our architecture, patterns, previous learnings, environmental context
- **Tools**: `read_file`, `list_dir`, `grep` to explore docs folder
- **Critical Files**: 
  - `ARCHITECTURE.md` - System design and components
  - `PROJECT_PROGRESS.md` - Current status and completed features
  - `IMPLEMENTATION_DOCUMENT_*.md` - Existing implementation guides
  - `WHAT_WE_LEARNED_*.md` - Previous session insights
  - `*_COMPLETION_HANDOFF.md` - Completed feature documentation

### **Priority #1: Archon MCP** - Project-Specific Knowledge
- **When**: After reading local docs, for project-related research
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
  deliverable: "What should be the final output?",
  environment: "What runtime environment context is needed?" // ✅ NEW
}
```

#### **Step 2: Plan Research Strategy**
```typescript
// Determine which tools to use based on goal
const researchPlan = {
  environmentContext: ["Runtime environment verification needed"], // ✅ NEW
  archonQueries: ["Project-specific patterns to search"],
  deepwikiQuestions: ["Expert questions to ask"],
  githubSearches: ["External patterns to discover"],
  docforkTopics: ["Official docs to fetch"]
}
```

### **Phase 2: Systematic Research Execution**

#### **Step 0: Environment Context Verification (CRITICAL)** ✅ NEW
```typescript
// ALWAYS verify runtime environment before implementation
const environmentResearch = async (goal) => {
  // 1. Framework working directory behavior
  const workingDirectory = {
    nextjs: "process.cwd() points to app directory, not project root",
    react: "Different in development vs production builds",
    node: "May vary based on how application is started",
    verification: "console.log('Working directory:', process.cwd())"
  };
  
  // 2. File system access patterns
  const fileAccess = {
    configFiles: "Where do config files need to live?",
    staticAssets: "How are static files accessed?",
    uploads: "Where do uploaded files go?",
    verification: "Test file access with fs.existsSync()"
  };
  
  // 3. Development vs Production differences
  const environmentDiffs = {
    paths: "Do file paths change between dev and prod?",
    permissions: "Are file permissions different?",
    bundling: "How does bundling affect file access?",
    verification: "Test in both environments"
  };
  
  // 4. Framework-specific context
  const frameworkContext = {
    nextjs: {
      appRouter: "Files must be in app directory for API routes",
      staticFiles: "public/ directory for static assets",
      configFiles: "Config files in app root, not project root"
    },
    react: {
      buildTime: "Static files bundled at build time",
      runtime: "Dynamic files must be accessible at runtime"
    },
    node: {
      cwd: "Working directory depends on execution context",
      requires: "Module resolution follows Node.js rules"
    }
  };
  
  return { workingDirectory, fileAccess, environmentDiffs, frameworkContext };
};
```

#### **Step 1: Project-Specific Research (Archon + Local Docs)**
```typescript
// ALWAYS start with our existing knowledge - MANDATORY
const projectResearch = async (goal) => {
  // 1. CRITICAL: Read our project documentation first
  const projectContext = await readProjectDocs({
    architecture: "docs/ARCHITECTURE.md", // System architecture and components
    progress: "docs/PROJECT_PROGRESS.md", // Current project status
    sessionHistory: "docs/SESSION_LOG.md", // Previous session learnings
    implementationGuides: "docs/IMPLEMENTATION_DOCUMENT_*.md", // Existing implementation docs
    learningDocs: "docs/WHAT_WE_LEARNED_*.md", // Previous insights and patterns
    handoffDocs: "docs/*_COMPLETION_HANDOFF.md" // Completed feature documentation
  });
  
  // 2. Check available Archon sources
  const sources = await get_available_sources();
  
  // 3. Search project-specific patterns in Archon
  const patterns = await search_code_examples({
    query: `${goal.technology} ${goal.objective}`,
    source_id: "relevant-source-id",
    match_count: 5
  });
  
  // 4. Query project documentation in Archon
  const archonDocs = await perform_rag_query({
    query: `${goal.technology} ${goal.objective} implementation`,
    match_count: 3
  });
  
  // 5. Analyze existing project patterns from docs folder
  const existingPatterns = await analyzeProjectPatterns({
    codebase: projectContext.architecture,
    completedFeatures: projectContext.handoffDocs,
    previousLearnings: projectContext.learningDocs,
    currentProgress: projectContext.progress
  });
  
  return { projectContext, sources, patterns, archonDocs, existingPatterns };
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
  // 0. Environment context verification ✅ NEW
  const environmentContext = {
    framework: goal.framework, // Next.js, React, Vue, etc.
    buildProcess: "How does bundling affect file access?",
    staticAssets: "Where do CSS, images, fonts need to live?",
    apiRoutes: "How do frontend components call backend APIs?",
    fileStructure: "What's the expected directory structure?",
    verification: "Test component imports and asset loading"
  };
  
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
  
  return { environmentContext, ourPatterns, expertAdvice, examples, docs };
};
```

### **Backend/API Implementation Goals**
```typescript
const backendResearchTemplate = async (goal) => {
  // 0. Environment context verification ✅ NEW
  const environmentContext = {
    runtime: goal.runtime, // Node.js, Deno, Bun
    framework: goal.framework, // Express, Fastify, Next.js API
    fileSystem: {
      configLocation: "Where do config files need to live?",
      uploads: "How are file uploads handled?",
      staticFiles: "How are static assets served?",
      logs: "Where do log files get written?",
      verification: "Test file I/O operations in target environment"
    },
    deployment: {
      workingDirectory: "What's the working directory in production?",
      permissions: "What file system permissions are available?",
      environment: "How do environment variables work?",
      verification: "Test deployment-specific file access patterns"
    }
  };
  
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
  
  return { environmentContext, ourAPI, expertAdvice, examples, docs };
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
- [ ] **Environment Context**: Are runtime environment requirements verified? ✅ NEW

### **Research Completeness Checklist**
- [ ] **Environment Verification**: Confirmed runtime context and file system requirements ✅ NEW
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
- **Environment**: [Runtime context and requirements] ✅ NEW

## 🔍 Research Findings

### 🌍 Environment Context (CRITICAL) ✅ NEW
[Runtime environment verification and file system requirements]

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

## 🌍 Environment Verification Steps ✅ NEW
[How to verify runtime context before implementation]

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
   Research Priority: Local Docs → Archon → DeepWiki → GitHub → Docfork
   
   🚨 CRITICAL: Starting with our project documentation analysis...
   ```

2. **MANDATORY: Read Project Documentation First** ✅ NEW
   ```typescript
   // ALWAYS execute this step before any external research
   const projectContextAnalysis = async () => {
     // 1. Check docs folder structure
     const docsList = await list_dir("docs/");
     
     // 2. Read core architecture
     const architecture = await read_file("docs/ARCHITECTURE.md");
     
     // 3. Check current progress
     const progress = await read_file("docs/PROJECT_PROGRESS.md");
     
     // 4. Find relevant implementation docs
     const implementationDocs = await glob_file_search("docs/IMPLEMENTATION_DOCUMENT_*.md");
     
     // 5. Check previous learnings
     const learningDocs = await glob_file_search("docs/WHAT_WE_LEARNED_*.md");
     
     // 6. Review completion handoffs
     const handoffDocs = await glob_file_search("docs/*_COMPLETION_HANDOFF.md");
     
     // 7. Analyze session history
     const sessionLog = await read_file("docs/SESSION_LOG.md");
     
     return {
       architecture,
       progress,
       implementationDocs,
       learningDocs,
       handoffDocs,
       sessionLog,
       projectContext: "Synthesized understanding of our project"
     };
   };
   ```

3. **Execute Systematic Research**
   - FIRST: Complete project documentation analysis
   - THEN: Follow the 4-phase research workflow
   - Use appropriate templates based on goal type
   - Ensure all research connects back to the user's goal AND project context

4. **Deliver Research Report**
   - Use the standard research report template
   - Include project context analysis findings
   - Provide actionable implementation guidance
   - Include next steps and considerations

### **Research Quality Standards**

#### **Minimum Research Requirements:**
- ✅ **Project documentation analysis completed** - MANDATORY FIRST STEP ✅ NEW
- ✅ **At least 2 MCP tools used** (preferably all 4)
- ✅ **Direct goal alignment** demonstrated
- ✅ **Actionable implementation plan** provided
- ✅ **Security and best practices** considered
- ✅ **Integration approach** defined
- ✅ **Project context considered** in all recommendations ✅ NEW

#### **Excellence Indicators:**
- 🌟 **Complete docs folder analysis** with synthesis of project patterns ✅ NEW
- 🌟 **All 4 MCP tools used effectively**
- 🌟 **Multiple implementation approaches** compared
- 🌟 **Potential challenges** identified and addressed
- 🌟 **Testing strategy** included
- 🌟 **Performance considerations** documented
- 🌟 **Previous learnings incorporated** from WHAT_WE_LEARNED docs ✅ NEW

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

#### **Issue: "Didn't check project docs folder"** ✅ NEW
**Solution**:
- STOP current research immediately
- Run `list_dir("docs/")` to see available documentation
- Read `docs/ARCHITECTURE.md` for system understanding
- Check `docs/PROJECT_PROGRESS.md` for current status
- Search for relevant `docs/IMPLEMENTATION_DOCUMENT_*.md` files
- Review `docs/WHAT_WE_LEARNED_*.md` for previous insights
- Restart research with full project context

#### **Issue: "Suggesting conflicting approaches"** ✅ NEW
**Solution**:
- Review `docs/ARCHITECTURE.md` for established patterns
- Check `docs/*_COMPLETION_HANDOFF.md` for completed features
- Look for similar implementations in previous sessions
- Ensure recommendations align with our tech stack
- Consider environment context from previous learnings

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
**🔄 Updated**: 2025-01-10 - Added mandatory project documentation analysis  
**🎯 Purpose**: Enable systematic, goal-oriented research using enhanced MCP tools  
**🚨 Critical Update**: ALWAYS check `docs/` folder FIRST before any external research  
**🔄 Status**: Living document - update based on research outcomes  
**🚀 Usage**: Reference this guide when conducting research for users  

### **🎯 Key Updates (2025-01-10)**
- ✅ **Mandatory docs folder analysis** before any external research
- ✅ **Environment context verification** to prevent file path issues
- ✅ **Project context integration** in all research templates
- ✅ **Enhanced troubleshooting** for documentation and context issues
- ✅ **Updated research quality standards** with docs requirements
