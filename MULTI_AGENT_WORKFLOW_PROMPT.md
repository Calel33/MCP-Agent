# 🤖 Multi-Agent Development Workflow - Complete Session Protocol

## 🎯 Core Workflow Mandate

**CRITICAL**: This workflow MUST be followed for ALL development sessions. No exceptions.

### 🔒 Universal Rules (NEVER VIOLATE)
1. **MANDATORY Session Documentation**: Every session MUST use `/start session`, `/session pause`, `/resume`, `/session end`
2. **MANDATORY MCP Research**: NO CODE without prior MCP tool research (Archon, GitHub, Forkdocs)
3. **Multi-Agent Mode**: ALL sessions MUST be completed in multi-agent mode
4. **User Review Required**: Agent MUST ask user to review work before marking tasks complete

---

## 📋 Complete Session Workflow

### **Phase 1: Session Initialization**

#### Step 1: Session Start Command
```
User types: /start session
```

#### Step 2: Agent Actions (MANDATORY)
1. **Check/Create Documentation Structure**:
   ```bash
   # Check if docs folder exists
   if (!exists("docs/")) {
     create_folder("docs/");
     create_folder("docs/sessions/");
     create_basic_documentation();
   }
   ```

2. **Gather Current Context**:
   - Read existing documentation (`docs/PROJECT_BRIEF.md`, `docs/PROJECT_PROGRESS.md`)
   - Understand project status and technology stack
   - Identify current tasks/priorities
   - Review recent changes from session logs

3. **Create Session Document**:
   ```
   File: docs/sessions/SESSION_YYYY-MM-DD_HH-MM.md
   Content:
   - Session start time and agent
   - Project context summary
   - Current status assessment
   - Planned work for session
   - Previous session summary (if applicable)
   ```

4. **Update Session Log**:
   ```
   File: docs/SESSION_LOG.md
   Add entry:
   - Session ID, start time, agent
   - Brief description of planned work
   - Links to session documentation
   ```

### **Phase 2: Task Identification & Research**

#### Step 3: Task Analysis
- **If task is vague**: Use Clarity Agent workflow to clarify requirements
- **If task is clear**: Proceed to research phase
- **Always**: Document the specific task in session notes

#### Step 4: MANDATORY MCP Research (BEFORE ANY CODE)
**CRITICAL**: This step CANNOT be skipped for ANY coding task.

##### Research Tool Selection (CRITICAL: Each Tool Has Specific Purpose):

1. **Archon MCP Tools** (PROJECT-SPECIFIC Research):
   - **Purpose**: Search within OUR project's knowledge base and integrated sources
   - **Best For**: Patterns we've implemented, tech stack we're using, project-specific examples
   - **Tools**:
     - `search_code_examples()` - Find patterns in OUR integrated sources (shadcn/ui, etc.)
     - `perform_rag_query()` - Query OUR project-specific documentation
     - `get_available_sources()` - See what sources we actually have
     - `manage_project()` - Project context and requirements
   - **❌ NOT For**: Generic programming tutorials, broad "how-to" guides

2. **GitHub/Grep MCP Tools** (EXTERNAL Pattern Discovery):
   - **Purpose**: Find real-world implementations across the broader ecosystem
   - **Best For**: Discovering new patterns, seeing how others solve problems, quality examples
   - **Tools**:
     - `searchGitHub_grep()` - Find patterns in quality repositories
     - `githubSearchCode_octocode()` - Discover implementations from specific orgs
     - `packageSearch_octocode()` - Research NPM/Python packages
   - **✅ Perfect For**: Generic programming patterns, industry best practices

3. **Docfork MCP Tools** (OFFICIAL Library Documentation):
   - **Purpose**: Fetch up-to-date official documentation for any open-source library
   - **Best For**: Official docs, installation guides, topic-focused information, code examples
   - **How It Works**: Uses `author/library` format to access official documentation
   - **Tools**:
     - `get-library-docs_docfork()` - Official library documentation with topic focus
   - **✅ Perfect For**: Installation guides, authentication setup, routing examples, official best practices

##### Optimized Research Workflow:

**Phase 1: Project-First Research (Archon)**
```typescript
// 1. Check what sources we have
get_available_sources_archon()

// 2. Search our project-specific patterns
search_code_examples_archon({
  query: "React [specific-feature] [our-tech-stack]",
  source_id: "ui.shadcn.com", // Use sources we actually have
  match_count: 3
})
```

**Phase 2: External Pattern Discovery (GitHub)**
```typescript
// 3. Find real-world implementations
searchGitHub_grep({
  query: "[specific-pattern]",
  repo: "shadcn-ui/", // Target quality repositories
  language: ["TypeScript", "TSX"]
})
```

**Phase 3: Official Documentation (Docfork)**
```typescript
// 4. Get official library documentation
get-library-docs_docfork("[author/library-name]", "[specific-topic]")
// Examples:
// get-library-docs_docfork("vercel/next.js", "routing")
// get-library-docs_docfork("shadcn-ui/ui", "installation")
```

**Phase 4: Project Integration (Archon)**
```typescript
// 5. Cross-validate with our project setup
perform_rag_query_archon({
  query: "[library-name] [our-tech-stack] integration patterns",
  match_count: 2
})
```

##### Research Requirements Checklist:
- [ ] **Project Patterns** (Archon): Check our existing implementations first
- [ ] **External Examples** (GitHub): Find quality real-world patterns
- [ ] **Official APIs** (Forkdocs): Validate syntax and usage
- [ ] **Integration** (Archon): Ensure compatibility with our tech stack
- [ ] **Best Practices**: Security, performance, error handling
- [ ] **Dependencies**: Required packages and versions
- [ ] **Testing**: Validation approaches based on discovered patterns

### **Phase 3: Implementation**

#### Step 5: Code Generation (ONLY AFTER RESEARCH)
1. **Implementation**: Based on researched patterns and best practices
2. **Integration**: Proper connection with existing architecture
3. **Error Handling**: Robust error management based on research
4. **Documentation**: Comments following discovered standards
5. **Testing**: Implementation based on researched testing patterns

#### Step 6: Documentation Updates
- Update relevant project documentation
- Document decisions and rationale
- Update session progress notes

### **Phase 4: Review & Completion**

#### Step 7: MANDATORY User Review
**CRITICAL**: Agent MUST ask user to review work before completion.

Agent says:
```
"I have completed [specific task description]. Please review the implementation:

**Files Modified:**
- [list of files changed]

**Key Changes:**
- [summary of changes made]

**Testing Recommendations:**
- [suggested tests to run]

Please review this work and let me know if it meets your requirements before I mark this task as complete."
```

#### Step 8: Task Status Update
- **If user approves**: Mark task as complete
- **If user requests changes**: Update task status and implement changes
- **Always**: Document user feedback and final status

### **Phase 5: Session Management**

#### Step 9: Session Pause (if needed)
```
User types: /session pause
```

**Agent Actions**:
1. **Create Pause Documentation**:
   ```
   File: docs/sessions/PAUSE_YYYY-MM-DD_HH-MM.md
   Content:
   - Exact current state of work
   - What was being worked on
   - Next immediate steps
   - Context needed to resume
   ```

2. **Update Session Log**: Mark session as paused

#### Step 10: Session Resume (if paused)
```
User types: /resume
```

**Agent Actions**:
1. **Find Latest Pause Document**
2. **Restore Complete Context**
3. **Continue from Exact State**
4. **Update Session Documentation**

#### Step 11: Session End
```
User types: /session end
```

**Agent Actions**:
1. **Create Session Summary**:
   - Session end time
   - Complete work summary
   - Files created/modified
   - Achievements and outcomes
   - Next session recommendations

2. **Update Project Documentation**:
   - Update PROJECT_PROGRESS.md
   - Update ARCHITECTURE.md (if applicable)
   - Update BUG_LOG.md (if issues found/fixed)

3. **Update Session Log**: Mark session as completed

---

## 🚨 Critical Enforcement Rules

### **NEVER Do These Things**:
- ❌ Start work without `/start session`
- ❌ Write code without MCP research
- ❌ Complete tasks without user review
- ❌ Skip session documentation
- ❌ Work outside multi-agent mode

### **ALWAYS Do These Things**:
- ✅ Follow complete session workflow
- ✅ Research before coding (MCP tools)
- ✅ Ask for user review before completion
- ✅ Document all work and decisions
- ✅ Maintain session continuity

---

## 📊 Success Criteria

### **Session Success**:
- [ ] Session properly started with `/start session`
- [ ] Documentation structure created/verified
- [ ] Task clearly identified and documented
- [ ] MCP research completed before coding
- [ ] Implementation based on research findings
- [ ] User review requested and completed
- [ ] Session properly ended with `/session end`

### **Code Quality Success**:
- [ ] All code based on researched patterns
- [ ] No hallucinated APIs or syntax
- [ ] Proper integration with existing codebase
- [ ] Following current industry best practices
- [ ] Robust error handling implementation
- [ ] User-approved implementation

---

## 🎯 Multi-Agent Coordination

### **Agent Handoffs**:
- Each agent MUST read session documentation before starting
- Context MUST be preserved across agent switches
- Session documentation MUST be updated by each agent
- User review MUST be requested by the implementing agent

### **Clarity Agent Integration**:
- Use when user requests are vague or incomplete
- Follow Clarity Agent workflow for requirement clarification
- Document clarified requirements in session notes
- Proceed to research phase once requirements are clear

---

**🔒 ENFORCEMENT**: This workflow is MANDATORY for ALL development sessions. Violation will result in context loss, poor code quality, and project knowledge degradation.

**📞 QUESTIONS**: If any step is unclear, create documentation first, then ask for clarification.

**🚀 GOAL**: Maintain professional-grade development workflow with complete documentation, thorough research, and user validation at every step.
