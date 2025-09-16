# 🔍 MCP Research Optimization Guide - Enhanced with DeepWiki

## 🎯 Purpose

This guide documents optimized strategies for using our MCP tools effectively, including the powerful new DeepWiki MCP integration for intelligent repository research. Updated with lessons learned from multiple research sessions and DeepWiki testing results.

## 📊 Session Analysis: What Went Wrong

### **❌ Research Issues Encountered**

#### **1. Generic Documentation Searches**
**What I Did Wrong:**
```
perform_rag_query("responsive design full screen layout mobile sidebar collapsible")
```
**Result**: Got Solidity documentation and unrelated content instead of React/Next.js patterns

#### **2. Broad GitHub Searches**
**What I Did Wrong:**
```
searchGitHub_grep("h-screen w-screen bg-gray")
```
**Result**: Found random repositories instead of our specific tech stack patterns

#### **3. Missed Project-Specific Context**
**What I Did Wrong:**
- Didn't search our own codebase first
- Didn't leverage our existing patterns
- Didn't use project-specific terminology

## ✅ ENHANCED Research Strategy with DeepWiki

### **🎯 NEW PRIORITY ORDER: Archon → DeepWiki → GitHub → Docfork**

### **🎯 Phase 1: Project-First Research (Archon)**

#### **1. Start with Our Own Codebase**
```typescript
// ALWAYS start here for any UI work
search_code_examples_archon({
  query: "React Next.js responsive sidebar Tailwind CSS",
  source_id: "our-project-specific-sources",
  match_count: 5
})
```

#### **2. Use Project-Specific Terminology**
```typescript
// Instead of generic terms, use our stack
perform_rag_query_archon({
  query: "Next.js 15 React 19 Tailwind CSS responsive design patterns",
  match_count: 3
})
```

### **🎯 Phase 2: Intelligent Repository Analysis (DeepWiki)** ⭐ **NEW**

#### **1. Ask Expert-Level Questions**
```typescript
// Ask natural language questions about repositories
ask_question_deepwiki({
  repoName: "expressjs/express",
  question: "How do I set up basic routing with middleware for authentication?"
})
```

#### **2. Get Architecture Insights**
```typescript
// Understand how libraries work internally
ask_question_deepwiki({
  repoName: "vercel/next.js",
  question: "What are the best practices for responsive design in Next.js applications?"
})
```

#### **3. Explore Repository Structure**
```typescript
// Get organized knowledge about repositories
read_wiki_structure_deepwiki({
  repoName: "facebook/react"
})
```

### **🎯 Phase 3: External Pattern Discovery (GitHub)**

#### **1. Stack-Specific GitHub Searches**
```typescript
// Target our exact tech stack
searchGitHub_grep({
  query: "useState.*sidebar.*mobile",
  language: ["TypeScript", "TSX"],
  repo: "vercel/", // Target Next.js ecosystem
  useRegexp: true
})
```

### **🎯 Phase 4: Official Documentation (Docfork)**

#### **1. Library-Specific Documentation**
```typescript
// Get official docs for our exact libraries
get-library-docs_docfork({
  libraryName: "vercel/next.js",
  topic: "responsive design"
})
```

## 🎯 MCP Tool Specialization - ENHANCED WITH DEEPWIKI

### **🔑 Key Insight: Four Specialized Research Tools Working Together**

#### **🏗️ Archon MCP = PROJECT-SPECIFIC Research**
- **Purpose**: Search within OUR project's knowledge base and integrated sources
- **Best For**: Patterns we've already implemented, tech stack we're using, project-specific examples
- **Sources**: shadcn/ui, Next.js docs, libraries we've integrated, our own code patterns
- **❌ NOT For**: Generic programming tutorials, broad "how-to" guides, general best practices

#### **🧠 DeepWiki MCP = INTELLIGENT REPOSITORY ANALYSIS** ⭐ **NEW PRIORITY #2**
- **Purpose**: Ask natural language questions about GitHub repositories and get expert-level answers
- **Best For**: Understanding how libraries work, best practices, architecture insights, implementation guidance
- **Sources**: Comprehensive analysis of entire GitHub repositories with structured knowledge extraction
- **Unique Capabilities**:
  - Q&A interface for complex technical questions
  - Contextual explanations with code examples
  - Security and error handling insights
  - Cross-component relationship understanding
- **✅ Perfect For**: "How to..." questions, best practices discovery, architecture understanding, implementation guidance

#### **🐙 GitHub MCP = EXTERNAL Pattern Discovery**
- **Purpose**: Find real-world implementations across the broader ecosystem
- **Best For**: Discovering new patterns, seeing how others solve similar problems, finding quality examples
- **Sources**: Public repositories, open-source projects, community implementations
- **✅ Perfect For**: Generic programming patterns, industry best practices, external validation

#### **📚 Docfork MCP = OFFICIAL Library Documentation**
- **Purpose**: Fetch up-to-date official documentation and code examples for open-source libraries
- **Best For**: Official docs, installation guides, specific topics, code examples from maintainers
- **Sources**: Official documentation sites for any open-source library (React, Next.js, shadcn/ui, etc.)
- **How It Works**: Uses `author/library` format to fetch official docs and can focus on specific topics
- **✅ Perfect For**: Installation guides, authentication setup, routing examples, best practices from official sources

### **🚨 Why Archon Returned Bad Results in Our Test**
The test revealed that using Archon for **generic concepts** like "responsive design best practices" returns irrelevant results because:
1. **Archon searches OUR project sources** - not general programming knowledge
2. **Our sources are project-specific** - shadcn/ui, Next.js, specific libraries we use
3. **Generic queries don't match our curated content** - we need project-specific terminology

## 🛠️ Tool-Specific Optimization Strategies

### **🏗️ Archon MCP Tools - PROJECT-SPECIFIC Knowledge Base**

#### **🎯 CRITICAL UNDERSTANDING: Archon is for PROJECT-RELATED research only**
- **✅ USE FOR**: Our codebase patterns, project-specific implementations, tech stack we've already integrated
- **❌ DON'T USE FOR**: General programming tutorials, generic "how-to" documentation, broad technical concepts

#### **Best Practices:**
1. **Use for Project-Specific Patterns**
   ```typescript
   // ✅ GOOD - Looking for patterns in OUR project
   search_code_examples_archon({
     query: "React sidebar component our implementation",
     source_id: "ui.shadcn.com", // We have shadcn in our sources
     match_count: 3
   })

   // ❌ BAD - Generic programming concepts
   perform_rag_query("how to make responsive design")
   ```

2. **Check What Sources We Actually Have**
   ```typescript
   // ✅ ALWAYS start here to know what's available
   get_available_sources_archon()
   // Then search within those specific sources
   ```

3. **Use for Implementation Patterns We've Integrated**
   ```typescript
   // ✅ GOOD - We have Next.js/shadcn in our sources
   perform_rag_query("Next.js shadcn sidebar responsive patterns")

   // ❌ BAD - Generic concepts not in our project
   perform_rag_query("responsive design best practices")
   ```

### **🐙 GitHub MCP Tools - External Pattern Research**

#### **Optimized Search Patterns:**

1. **Repository-Specific Searches**
   ```typescript
   // ✅ Target quality repositories
   githubSearchCode_octocode([{
     queryTerms: ["responsive", "sidebar"],
     owner: ["vercel", "shadcn-ui", "tailwindlabs"],
     language: "typescript",
     stars: ">1000"
   }])
   ```

2. **Pattern-Specific Searches**
   ```typescript
   // ✅ Search for exact patterns we need
   searchGitHub_grep({
     query: "lg:hidden.*sidebar.*mobile",
     language: ["TSX"],
     repo: "shadcn-ui/",
     useRegexp: true
   })
   ```

3. **Package Research**
   ```typescript
   // ✅ Research packages for our stack
   packageSearch_octocode({
     npmPackages: [{
       name: "tailwindcss responsive",
       searchLimit: 3
     }]
   })
   ```

### **🧠 DeepWiki MCP Tools - Intelligent Repository Analysis** ⭐ **NEW PRIORITY #2**

#### **🎯 CRITICAL UNDERSTANDING: DeepWiki is Revolutionary**
DeepWiki transforms how we research by providing **expert-level Q&A** about any GitHub repository. Unlike code search tools, DeepWiki **understands context, relationships, and best practices**.

#### **Strategic Usage Patterns:**

##### **1. Question-Based Research**
```typescript
// ✅ Ask "How to..." questions for implementation guidance
ask_question_deepwiki({
  repoName: "expressjs/express",
  question: "How do I set up basic routing in Express.js with middleware for authentication?"
})

// ✅ Get best practices and security insights
ask_question_deepwiki({
  repoName: "expressjs/express",
  question: "What are the best practices for error handling and security in Express.js applications?"
})

// ✅ Understand architecture and design patterns
ask_question_deepwiki({
  repoName: "facebook/react",
  question: "How do React hooks work internally and what are the best practices for custom hooks?"
})
```

##### **2. Repository Structure Analysis**
```typescript
// ✅ Get organized knowledge structure
read_wiki_structure_deepwiki({
  repoName: "vercel/next.js"
})
// Returns: Organized topics like "Routing System", "Middleware", "Authentication Patterns"

// ✅ Read comprehensive repository documentation
read_wiki_contents_deepwiki({
  repoName: "tailwindlabs/tailwindcss"
})
```

##### **3. When to Use DeepWiki vs Other Tools**
- **✅ USE DeepWiki FOR**:
  - "How to..." implementation questions
  - Best practices and security guidance
  - Architecture understanding
  - Error handling patterns
  - Integration approaches
  - Performance considerations

- **❌ DON'T USE DeepWiki FOR**:
  - Simple code pattern searches (use GitHub MCP)
  - Official installation guides (use Docfork MCP)
  - Project-specific patterns (use Archon MCP)

### **📚 Docfork MCP Tools - Official Library Documentation**

#### **Strategic Usage:**
```typescript
// ✅ Get official docs using author/library format
get-library-docs_docfork("vercel/next.js", "routing")
get-library-docs_docfork("shadcn-ui/ui", "authentication")
get-library-docs_docfork("tailwindlabs/tailwindcss", "responsive-design")

// ✅ Focus on specific topics
get-library-docs_docfork("facebook/react", "hooks")
get-library-docs_docfork("nextauthjs/next-auth", "installation")
```

## 🎯 ENHANCED Project-Specific Research Workflow with DeepWiki

### **For UI/Frontend Tasks (NEW 4-Phase Approach):**

1. **Check Our Project Patterns First (Archon)**
   ```typescript
   // ✅ Search within OUR integrated sources
   search_code_examples_archon({
     query: "React sidebar responsive shadcn component",
     source_id: "ui.shadcn.com", // We know we have this source
     match_count: 3
   })
   ```

2. **Ask Expert Questions (DeepWiki)** ⭐ **NEW PHASE**
   ```typescript
   // ✅ Get intelligent insights about implementation approaches
   ask_question_deepwiki({
     repoName: "facebook/react",
     question: "What are the best practices for responsive React components with state management?"
   })

   // ✅ Understand architecture patterns
   ask_question_deepwiki({
     repoName: "vercel/next.js",
     question: "How should I implement responsive navigation in Next.js applications?"
   })
   ```

3. **Find External Patterns (GitHub)**
   ```typescript
   // ✅ Discover patterns from quality external sources
   githubSearchCode_octocode([{
     queryTerms: ["responsive", "sidebar", "useMediaQuery"],
     owner: ["vercel", "shadcn-ui"],
     language: "typescript"
   }])
   ```

4. **Get Official Library Documentation (Docfork)**
   ```typescript
   // ✅ Get official docs using author/library format
   get-library-docs_docfork("facebook/react", "hooks")
   get-library-docs_docfork("tailwindlabs/tailwindcss", "responsive-design")
   get-library-docs_docfork("vercel/next.js", "routing")
   ```

5. **Cross-Validate with Our Project Context (Archon)**
   ```typescript
   // ✅ See how patterns fit with our existing setup
   perform_rag_query_archon({
     query: "Next.js shadcn responsive implementation patterns",
     match_count: 2
   })
   ```

### **For Backend/MCP Tasks:**

1. **Check Our MCP Integration**
   ```typescript
   search_code_examples_archon({
     query: "MCP client configuration TypeScript",
     source_id: "our-mcp-examples"
   })
   ```

2. **Research MCP Patterns**
   ```typescript
   perform_rag_query_archon({
     query: "Model Context Protocol server integration",
     match_count: 5
   })
   ```

3. **Find MCP Examples**
   ```typescript
   githubSearchCode_octocode([{
     queryTerms: ["mcp-use", "ModelContextProtocol"],
     language: "typescript"
   }])
   ```

## 🚀 Advanced Research Techniques

### **1. Progressive Query Refinement**
```typescript
// Start broad, then narrow
const queries = [
  { queryTerms: ["responsive"] },
  { queryTerms: ["responsive", "sidebar"] },
  { queryTerms: ["responsive", "sidebar", "mobile"] },
  { queryTerms: ["responsive", "sidebar", "mobile", "tailwind"] }
];
```

### **2. Multi-Source Validation**
```typescript
// Cross-reference multiple sources
const archonResults = await perform_rag_query_archon("Next.js responsive");
const githubResults = await searchGitHub_grep("Next.js responsive");
const docsResults = await get-library-docs_docfork("next.js", "responsive");
```

### **3. Context-Aware Searches**
```typescript
// Use project context in queries
perform_rag_query_archon({
  query: `${currentProjectStack} responsive design patterns`,
  match_count: 5
})
```

## 📋 Research Quality Checklist

### **Before Starting Research:**
- [ ] Identified specific technical requirements
- [ ] Listed our exact tech stack components
- [ ] Checked what sources are available in Archon
- [ ] Planned progressive query strategy

### **During Research:**
- [ ] Started with project-specific sources
- [ ] Used exact library/framework names
- [ ] Targeted quality repositories (high stars)
- [ ] Cross-referenced multiple sources
- [ ] Validated patterns against our architecture

### **After Research:**
- [ ] Found patterns specific to our tech stack
- [ ] Validated implementation approaches
- [ ] Documented research findings
- [ ] Created implementation plan based on research

## 🧪 UPDATED: Test Results & Corrected Understanding

### **✅ What Our Testing Revealed (2025-08-20)**

#### **Archon MCP - PROJECT-SPECIFIC Success**
```typescript
// ✅ WORKED PERFECTLY - Project-specific search
search_code_examples_archon({
  query: "React Next.js responsive sidebar component",
  source_id: "ui.shadcn.com"
})
// Result: Found excellent responsive patterns including ComboBoxResponsive with useMediaQuery
```

#### **GitHub MCP - EXTERNAL Pattern Success**
```typescript
// ✅ WORKED PERFECTLY - External pattern discovery
searchGitHub_grep({
  query: "useMediaQuery",
  repo: "shadcn-ui/",
  language: ["TypeScript", "TSX"]
})
// Result: Multiple real-world responsive implementations
```

#### **Archon MCP - GENERIC Concept Failure**
```typescript
// ❌ FAILED - Generic programming concepts
perform_rag_query_archon({
  query: "Next.js 15 React 19 Tailwind CSS responsive design patterns"
})
// Result: Returned Solidity and Google AI docs instead of React patterns
```

### **🎯 CORRECTED Research Strategy**

#### **Use Archon For:**
- ✅ Patterns within our integrated sources (shadcn/ui, Next.js docs we have)
- ✅ Project-specific implementations we've already built
- ✅ Tech stack components we're actually using
- ✅ Cross-referencing external patterns with our project setup

#### **Use GitHub For:**
- ✅ Discovering new implementation patterns
- ✅ Finding real-world examples from quality repositories
- ✅ Validating approaches across the broader ecosystem
- ✅ Generic programming patterns and best practices

#### **Use Docfork For:**
- ✅ Official documentation from library maintainers (using author/library format)
- ✅ Installation guides and setup instructions
- ✅ Topic-focused documentation (authentication, routing, etc.)
- ✅ Code examples and best practices from official sources
- ✅ Up-to-date documentation for any open-source library

## 🎯 Key Takeaways for Future Sessions

### **✅ DO:**
1. **Start with our own knowledge base** - Use Archon tools first
2. **Be specific with tech stack** - Use exact library names and versions
3. **Target quality sources** - High-star repos, official docs
4. **Progressive refinement** - Start broad, narrow down
5. **Cross-validate** - Use multiple sources for confirmation

### **❌ DON'T:**
1. **Use generic search terms** - Avoid vague queries
2. **Ignore project context** - Always consider our specific stack
3. **Skip our own patterns** - Check existing code first
4. **Accept irrelevant results** - Refine queries if results are off-topic
5. **Rush the research phase** - Proper research saves implementation time

## 🔄 Continuous Improvement

### **After Each Session:**
1. **Document what worked** - Note successful query patterns
2. **Identify gaps** - What sources were missing?
3. **Update this guide** - Add new optimization strategies
4. **Share learnings** - Update team knowledge base

---

**📝 Created**: 2025-08-20  
**📊 Based on**: Responsive UI implementation session analysis  
**🎯 Purpose**: Optimize MCP tool usage for project-specific research  
**🔄 Status**: Living document - update after each research session

## 📚 Appendix: Session-Specific Examples

### **What I Should Have Done in the Responsive UI Session**

#### **❌ What I Actually Did:**
```typescript
// Generic search that returned Solidity docs
perform_rag_query_archon({
  query: "responsive design full screen layout mobile sidebar collapsible",
  match_count: 5
})
```

#### **✅ What I Should Have Done:**
```typescript
// 1. Check our existing UI patterns first
search_code_examples_archon({
  query: "React Next.js sidebar component state management",
  source_id: "ui.shadcn.com", // We had shadcn examples available!
  match_count: 3
})

// 2. Search for our specific tech stack
perform_rag_query_archon({
  query: "Next.js 15 Tailwind CSS responsive sidebar mobile breakpoints",
  match_count: 3
})

// 3. Target quality React/Next.js repositories
githubSearchCode_octocode([{
  queryTerms: ["useState", "sidebar", "responsive"],
  owner: ["vercel", "shadcn-ui", "tailwindlabs"],
  language: "typescript",
  stars: ">500"
}])

// 4. Get official Tailwind responsive docs
get-library-docs_docfork("tailwindcss", "responsive-design")
```

### **Discovered: We Had Great Sources Available!**

From the session, I found we actually had excellent sources:
- **shadcn/ui examples** - Perfect responsive sidebar patterns
- **Tailwind documentation** - Comprehensive responsive design guides
- **Next.js patterns** - Official responsive design recommendations

**Lesson**: Always check `get_available_sources_archon()` first!

## 🎯 Advanced MCP Research Patterns

### **Pattern 1: Stack-Specific Research Chain**
```typescript
// For any React/Next.js UI task
const researchChain = async () => {
  // 1. Our patterns
  const ourPatterns = await search_code_examples_archon({
    query: "React component responsive design",
    source_id: "ui.shadcn.com"
  });

  // 2. Official docs
  const officialDocs = await get-library-docs_docfork("react", "hooks");

  // 3. Quality examples
  const examples = await githubSearchCode_octocode([{
    queryTerms: ["useState", "responsive"],
    owner: ["vercel"],
    language: "typescript"
  }]);

  return { ourPatterns, officialDocs, examples };
};
```

### **Pattern 2: Progressive Specificity**
```typescript
// Start general, get specific
const progressiveSearch = async (baseQuery: string) => {
  const queries = [
    `${baseQuery}`,
    `${baseQuery} React`,
    `${baseQuery} React Next.js`,
    `${baseQuery} React Next.js Tailwind CSS`,
    `${baseQuery} React Next.js Tailwind CSS TypeScript`
  ];

  for (const query of queries) {
    const results = await perform_rag_query_archon({ query, match_count: 2 });
    if (results.success && results.results.length > 0) {
      return results; // Found relevant results
    }
  }
};
```

### **Pattern 3: Multi-Source Validation**
```typescript
// Validate patterns across sources
const validatePattern = async (pattern: string) => {
  const sources = await Promise.all([
    search_code_examples_archon({ query: pattern }),
    githubSearchCode_octocode([{ queryTerms: [pattern] }]),
    get-library-docs_docfork("react", pattern)
  ]);

  // Cross-reference results for consistency
  return sources.filter(source => source.success);
};
```

## 🔧 Tool-Specific Optimization Tips

### **Archon MCP Optimization**
```typescript
// ✅ Use technical terminology from our stack
perform_rag_query_archon({
  query: "TypeScript React hooks useState useEffect responsive design",
  match_count: 3
})

// ✅ Search our code examples with specific patterns
search_code_examples_archon({
  query: "sidebar collapsible mobile overlay backdrop",
  source_id: "ui.shadcn.com",
  match_count: 5
})
```

### **GitHub MCP Optimization**
```typescript
// ✅ Target our ecosystem
githubSearchCode_octocode([{
  queryTerms: ["responsive", "sidebar"],
  owner: ["vercel", "shadcn-ui", "tailwindlabs", "chakra-ui"],
  language: "typescript",
  stars: ">100",
  pushed: ">2023-01-01" // Recent patterns
}])

// ✅ Use regex for specific patterns
searchGitHub_grep({
  query: "useState.*sidebar.*mobile",
  language: ["TypeScript", "TSX"],
  useRegexp: true,
  repo: "shadcn-ui/"
})
```

### **Docfork MCP Optimization**
```typescript
// ✅ Get official docs using proper author/library format
const stackDocs = await Promise.all([
  get-library-docs_docfork("vercel/next.js", "responsive-design"),
  get-library-docs_docfork("tailwindlabs/tailwindcss", "responsive-design"),
  get-library-docs_docfork("facebook/react", "hooks"),
  get-library-docs_docfork("shadcn-ui/ui", "installation")
]);

// ✅ Focus on specific topics for targeted information
get-library-docs_docfork("nextauthjs/next-auth", "authentication")
get-library-docs_docfork("prisma/prisma", "installation")
```

## 📊 Research Quality Metrics

### **Success Indicators:**
- ✅ Found patterns specific to our tech stack
- ✅ Got examples from quality sources (shadcn, Vercel, etc.)
- ✅ Cross-validated approaches across multiple sources
- ✅ Found official documentation for our libraries
- ✅ Discovered implementation patterns we can adapt

### **Failure Indicators:**
- ❌ Generic results not related to our stack
- ❌ Outdated patterns or deprecated approaches
- ❌ Single-source validation without cross-reference
- ❌ Missing official documentation
- ❌ Patterns that don't fit our architecture

---

## 🔑 CRITICAL INSIGHT: MCP Tool Specialization

### **The Bridge Concept**
As discovered in testing, **Archon MCP acts as a "bridge"** between external research and our specific project implementation:

1. **External Discovery** (GitHub MCP) → Find patterns and approaches
2. **Project Integration** (Archon MCP) → See how patterns fit our tech stack
3. **Official Validation** (Forkdocs MCP) → Confirm API usage and syntax

### **Why This Matters**
- **Archon isn't Google** - It's our project's curated knowledge base
- **Generic searches fail** - Because Archon contains project-specific sources
- **Specificity wins** - Use exact library names and project terminology
- **Cross-validation essential** - Each tool serves a different research purpose

### **Updated Success Formula**
```
GitHub (discover) → Archon (integrate) → Forkdocs (validate) → Implementation
```

## 🧪 DEEPWIKI TESTING RESULTS - REVOLUTIONARY CAPABILITIES

### **✅ Real DeepWiki Testing Examples (2025-08-21)**

#### **Test 1: Express.js Routing and Authentication**
```typescript
// ✅ QUESTION ASKED
ask_question_deepwiki({
  repoName: "expressjs/express",
  question: "How do I set up basic routing in Express.js with middleware for authentication?"
})

// ✅ AMAZING RESULT - Got comprehensive answer including:
// - Basic routing patterns with app.get(), app.post()
// - Parameter handling with req.params
// - Global vs route-specific middleware
// - Authentication middleware examples
// - Router composition with express.Router()
// - Security considerations and best practices
```

#### **Test 2: Express.js Security and Error Handling**
```typescript
// ✅ QUESTION ASKED
ask_question_deepwiki({
  repoName: "expressjs/express",
  question: "What are the best practices for error handling and security in Express.js applications?"
})

// ✅ INCREDIBLE RESULT - Received expert-level guidance on:
// - Error handling middleware patterns
// - Asynchronous error handling with Promises
// - Body parsing security features
// - Security vulnerability reporting procedures
// - Built-in security protections
// - Production-ready error handling strategies
```

#### **Test 3: Repository Structure Analysis**
```typescript
// ✅ EXPLORED REPOSITORY STRUCTURE
read_wiki_structure_deepwiki({
  repoName: "expressjs/express"
})

// ✅ STRUCTURED KNOWLEDGE - Got organized topics:
// - Express.js Overview
// - Core Architecture (Application Creation, Request/Response Extensions)
// - Routing System (Router Architecture, Parameter Processing)
// - Middleware System (Body Parsing, Static Files)
// - Response Methods (Content Delivery, File Operations)
// - View and Template System
// - Common Use Cases and Examples
// - Project Governance and Development
```

### **🎯 DeepWiki vs Other Tools - CLEAR DIFFERENTIATION**

#### **DeepWiki Unique Strengths:**
- ✅ **Contextual Understanding**: Explains HOW and WHY, not just WHAT
- ✅ **Expert-Level Answers**: Provides comprehensive implementation guidance
- ✅ **Security Insights**: Automatically includes security considerations
- ✅ **Best Practices**: Shows production-ready patterns
- ✅ **Relationship Understanding**: Explains how components work together
- ✅ **Structured Knowledge**: Organizes information logically

#### **When DeepWiki Excels:**
- 🎯 **"How to..." questions** → DeepWiki provides step-by-step guidance
- 🎯 **Architecture understanding** → DeepWiki explains system design
- 🎯 **Best practices** → DeepWiki shows production patterns
- 🎯 **Security guidance** → DeepWiki includes security considerations
- 🎯 **Error handling** → DeepWiki shows robust error management
- 🎯 **Integration patterns** → DeepWiki explains how pieces fit together

### **🚀 UPDATED Research Priority Justification**

Based on testing, the **Archon → DeepWiki → GitHub → Docfork** priority order is optimal because:

1. **Archon** (Project-specific) → Check our existing patterns first
2. **DeepWiki** (Intelligent analysis) → Get expert understanding of how to implement
3. **GitHub** (Pattern discovery) → Find real-world examples to validate approach
4. **Docfork** (Official docs) → Confirm API syntax and installation details

## 🆕 NEW: Hustle HTTP MCP Integration (2025-08-21)

### **🔗 Hustle HTTP MCP Server**
**Purpose**: Crypto agent capabilities for blockchain and cryptocurrency research
**Connection**: Remote HTTP endpoint via `mcp-remote`
**Priority**: 8 (Medium priority, same as DocFork)

#### **When to Use Hustle HTTP MCP:**
- 🪙 **Cryptocurrency research** → Market data, token analysis, DeFi protocols
- 📊 **Blockchain analysis** → Smart contract patterns, transaction analysis
- 💰 **Trading strategies** → Technical analysis, market indicators
- 🔐 **Crypto security** → Wallet security, smart contract auditing
- 🌐 **DeFi integration** → Protocol research, yield farming strategies

#### **Integration Points:**
- **Backend**: Available in both `mcp-config.json` and `mcp-agent.config.json`
- **Frontend**: Integrated into `mcp-chat-service.ts` for real-time crypto queries
- **Security**: Uses secure environment variables (`HUSTLE_API_KEY`, `HUSTLE_VAULT_ID`)

#### **Research Workflow with Crypto Focus:**
```typescript
// 1. Start with project context (Archon)
search_code_examples_archon({
  query: "crypto trading bot implementation",
  match_count: 5
})

// 2. Get expert crypto insights (Hustle HTTP)
// [Use through chat interface - "Analyze Bitcoin market trends"]

// 3. Find implementation patterns (GitHub)
searchGitHub_grep({
  query: "cryptocurrency API integration",
  language: ["TypeScript", "JavaScript"]
})

// 4. Validate with official docs (DocFork)
// [Standard documentation research]
```

### **🎯 Updated MCP Server Ecosystem**

| Server | Type | Priority | Best For | Status |
|--------|------|----------|----------|--------|
| **Archon** | Project | 10 | Our codebase patterns | ✅ Active |
| **DeepWiki** | Intelligence | 9 | Expert repository analysis | ✅ Active |
| **Hustle HTTP** | Remote | 8 | Crypto/blockchain research | 🆕 New |
| **DocFork** | HTTP | 8 | Official documentation | ✅ Active |
| **Playwright** | stdio | 10 | Browser automation | ✅ Active |
| **GitHub Search** | API | 7 | Pattern discovery | ✅ Active |

**🎯 Next Update**: After crypto research sessions, add specific Hustle HTTP patterns and optimizations.

---

**📝 UPDATED**: 2025-08-21 - Added Hustle HTTP MCP integration and crypto research workflows
