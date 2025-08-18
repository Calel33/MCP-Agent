# 📋 Universal Document Rules & Session Management

## 🎯 Purpose

This document establishes universal rules, standards, and workflows that ALL agents must follow when working on ANY project. It ensures consistency, maintains project knowledge, preserves context across sessions, and provides session management capabilities.

## 🔒 CRITICAL UNIVERSAL RULES - NEVER VIOLATE

### **Rule 1: ALWAYS Check/Create Documentation Structure First**
Before starting ANY work:
1. ✅ Check if `docs/` folder exists - if not, CREATE IT
2. ✅ Check for existing documentation and read current status
3. ✅ Understand project context and current phase
4. ✅ Follow established patterns and architecture

### **Rule 2: MANDATORY Session Documentation**
For ALL sessions and significant work:
1. ✅ MUST document session start with `/start session`
2. ✅ MUST create session pause documentation with `/session pause`
3. ✅ MUST resume with context preservation using `/resume`
4. ✅ MUST end sessions with summary using `/session end`

### **Rule 3: Context Preservation Across Sessions**
ALL agents MUST:
1. ✅ Maintain project identity and technology stack
2. ✅ Preserve all existing functionality
3. ✅ Document all changes and decisions
4. ✅ Create audit trail for all work

## 📁 Universal Documentation Structure

### **Required Documentation Folder Structure**
```
docs/
├── README.md                    # Documentation index (auto-create if missing)
├── PROJECT_BRIEF.md            # Project overview (auto-create if missing)
├── ARCHITECTURE.md             # Technical architecture
├── PROJECT_PROGRESS.md         # Current status and roadmap
├── BUG_LOG.md                  # Issue tracking and resolutions
├── SESSION_LOG.md              # Session tracking and management
├── API_REFERENCE.md            # API documentation (if applicable)
├── USER_GUIDE.md               # User documentation (if applicable)
├── DEVELOPMENT_GUIDE.md        # Contributing guide (if applicable)
└── sessions/                   # Session-specific documentation
    ├── SESSION_YYYY-MM-DD_HH-MM.md
    └── PAUSE_YYYY-MM-DD_HH-MM.md
```

### **Auto-Creation Rules**
If `docs/` folder doesn't exist:
1. ✅ CREATE `docs/` folder immediately
2. ✅ CREATE `docs/README.md` with basic navigation
3. ✅ CREATE `docs/PROJECT_BRIEF.md` with project template
4. ✅ CREATE `docs/SESSION_LOG.md` for session tracking
5. ✅ CREATE `docs/sessions/` subfolder for session documentation

## 🎮 Session Management Commands

### **`/start session` - Begin New Session**

**Purpose**: Initialize a new work session with context gathering

**Agent Actions**:
1. **Check Documentation Structure**:
   ```bash
   # Check if docs folder exists
   if (!exists("docs/")) {
     create_docs_structure();
   }
   ```

2. **Gather Current Context**:
   - Read existing documentation
   - Understand project status
   - Identify current tasks/priorities
   - Review recent changes

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

### **`/session pause` - Pause Current Work**

**Purpose**: Temporarily pause work while preserving exact context

**Agent Actions**:
1. **Create Pause Documentation**:
   ```
   File: docs/sessions/PAUSE_YYYY-MM-DD_HH-MM.md
   Content:
   - Exact current state of work
   - What was being worked on
   - Next immediate steps
   - Any temporary files or changes
   - Context needed to resume
   - Time of pause and reason
   ```

2. **Update Current Session Document**:
   - Add pause timestamp
   - Summarize work completed so far
   - Note any incomplete work

3. **Update Session Log**:
   - Mark session as paused
   - Add pause reason and timestamp

### **`/resume` - Resume Previous Session**

**Purpose**: Continue work from exactly where it was paused

**Agent Actions**:
1. **Find Latest Pause Document**:
   - Locate most recent `PAUSE_*.md` file
   - Read complete context and state

2. **Restore Context**:
   - Understand exact state when paused
   - Review any changes since pause
   - Identify next immediate steps

3. **Update Session Documentation**:
   - Mark session as resumed
   - Add resume timestamp
   - Continue work from documented state

4. **Continue Work**:
   - Pick up exactly where left off
   - Follow documented next steps
   - Maintain continuity

### **`/session end` - End Current Session**

**Purpose**: Properly close session with complete documentation

**Agent Actions**:
1. **Create Session Summary**:
   ```
   File: docs/sessions/SESSION_YYYY-MM-DD_HH-MM.md (update)
   Add:
   - Session end time
   - Complete work summary
   - Files created/modified
   - Achievements and outcomes
   - Issues encountered
   - Next session recommendations
   ```

2. **Update Project Documentation**:
   - Update relevant docs with changes
   - Update PROJECT_PROGRESS.md if applicable
   - Update ARCHITECTURE.md if changes made
   - Update BUG_LOG.md if issues found/fixed
   - Create handoff documentation

3. **Update Session Log**:
   - Mark session as completed
   - Add summary and outcomes
   - Link to detailed session documentation

## 🔄 Universal Documentation Workflow

### **Starting Any Project Work**
1. **Initialize Documentation**:
   ```bash
   # Check and create docs structure
   if (!exists("docs/")) {
     create_folder("docs/");
     create_folder("docs/sessions/");
     create_basic_documentation();
   }
   ```

2. **Assess Current State**:
   - Read existing documentation
   - Understand project context
   - Identify current priorities
   - Review recent work

3. **Plan Session Work**:
   - Define session goals
   - Identify deliverables
   - Estimate time requirements
   - Document planned approach

### **During Work Execution**
1. **Document Changes**: Update relevant documentation as work progresses
2. **Track Issues**: Add any bugs/issues to BUG_LOG.md
3. **Update Progress**: Modify PROJECT_PROGRESS.md for significant milestones
4. **Maintain Context**: Keep session documentation current

### **Completing Work**
1. **Finalize Documentation**: Ensure all changes are documented
2. **Update Status**: Reflect current state in progress documents
3. **Create Handoffs**: Document work for future sessions/agents
4. **Clean Up**: Remove temporary files, organize documentation

## 📝 Universal Documentation Standards

### **File Naming Convention**
- **Core Docs**: `UPPERCASE_WITH_UNDERSCORES.md`
- **Sessions**: `SESSION_YYYY-MM-DD_HH-MM.md`
- **Pauses**: `PAUSE_YYYY-MM-DD_HH-MM.md`
- **Project Specific**: Follow project conventions

### **Content Standards**
1. **Headers**: Use emoji + descriptive text (`# 🎯 Purpose`)
2. **Status Indicators**: Use ✅ ❌ 🔄 ⏳ consistently
3. **Code Blocks**: Always specify language for syntax highlighting
4. **Links**: Use relative paths for internal docs (`./OTHER_DOC.md`)
5. **Dates**: Use ISO format (YYYY-MM-DD)
6. **Times**: Use 24-hour format (HH:MM)

### **Required Sections for Session Documents**
```markdown
# 📅 Session YYYY-MM-DD HH:MM - [Brief Description]

## 🎯 Session Overview
- Start time, agent, planned work

## 📋 Project Context
- Current project state
- Recent changes
- Current priorities

## 🔄 Work Completed
- Detailed list of accomplishments
- Files created/modified
- Issues resolved

## 🚧 Work In Progress
- Current task status
- Next immediate steps
- Temporary state

## 🎯 Next Session Recommendations
- Suggested next steps
- Priority items
- Context for next agent

## 📊 Session Summary
- Total time, outcomes, notes
```

## 🔍 Universal Context Management

### **Project Context MUST Include**
1. **Project Identity**:
   - Project name and description
   - Technology stack and versions
   - Key stakeholders and contacts

2. **Current Status**:
   - Overall progress and milestones
   - Current phase and active tasks
   - Recent achievements and changes

3. **Technical Context**:
   - Architecture and design decisions
   - Key components and their status
   - Dependencies and integrations

### **Session Context MUST Include**
1. **Work Context**:
   - What was being worked on
   - Current state of work
   - Next immediate steps

2. **Environmental Context**:
   - File states and changes
   - Configuration settings
   - Temporary modifications

3. **Decision Context**:
   - Decisions made during session
   - Rationale for approaches taken
   - Alternative options considered

## 🚨 Universal Error Prevention

### **NEVER Do These Things**
1. ❌ Start work without checking/creating docs structure
2. ❌ Skip session documentation for significant work
3. ❌ Pause work without documenting current state
4. ❌ Delete or overwrite session documentation
5. ❌ Change project fundamentals without documentation

### **ALWAYS Do These Things**
1. ✅ Check for docs folder and create if missing
2. ✅ Document session start, pause, resume, and end
3. ✅ Maintain project context across sessions
4. ✅ Update relevant documentation when making changes
5. ✅ Create clear handoffs for future work

## 🔧 Auto-Creation Templates

### **Basic PROJECT_BRIEF.md Template**
```markdown
# 📋 Project Brief - [Project Name]

## 🎯 Project Overview
[Brief description of what this project does]

## 🏗️ Technology Stack
[List of technologies, frameworks, versions]

## 📊 Current Status
[Current development phase and progress]

## 🎯 Goals and Objectives
[What the project aims to achieve]

## 📚 Documentation
- [Link to other relevant documentation]
```

### **Basic SESSION_LOG.md Template**
```markdown
# 📅 Session Log - [Project Name]

## 🎯 Purpose
Track all work sessions for this project.

## 📋 Session History

| Date | Time | Agent | Status | Description | Documentation |
|------|------|-------|--------|-------------|---------------|
| YYYY-MM-DD | HH:MM | Agent Name | Active/Paused/Complete | Brief description | [Link](./sessions/SESSION_*.md) |

## 📊 Session Statistics
- Total sessions: X
- Total time: X hours
- Active sessions: X
- Completed sessions: X
```

## 🎯 Success Metrics

### **Documentation Success**
- All sessions have corresponding documentation
- Project context is preserved across sessions
- No loss of work or decisions
- Clear audit trail of all changes

### **Session Management Success**
- Seamless pause and resume capabilities
- No context loss between sessions
- Clear handoffs between agents
- Efficient session transitions

---

**🔒 ENFORCEMENT**: These rules are MANDATORY for ALL agents working on ANY project. Violation will result in context loss and project knowledge degradation.

**📞 QUESTIONS**: If any rule is unclear, create documentation first, then ask for clarification.

**🚀 GOAL**: Maintain professional-grade documentation and seamless session management across all projects.

## 🛠️ Implementation Guide for Agents

### **Session Command Implementation**

When a user types session commands, agents should:

1. **`/start session`**:
   ```typescript
   // Check docs structure
   if (!fs.existsSync('docs')) {
     fs.mkdirSync('docs');
     fs.mkdirSync('docs/sessions');
     createBasicDocumentation();
   }

   // Create session document
   const sessionId = `SESSION_${new Date().toISOString().slice(0,16).replace('T', '_').replace(':', '-')}`;
   createSessionDocument(sessionId);
   updateSessionLog('start', sessionId);
   ```

2. **`/session pause`**:
   ```typescript
   const pauseId = `PAUSE_${new Date().toISOString().slice(0,16).replace('T', '_').replace(':', '-')}`;
   createPauseDocument(pauseId, getCurrentState());
   updateSessionLog('pause', pauseId);
   ```

3. **`/resume`**:
   ```typescript
   const latestPause = findLatestPauseDocument();
   const context = loadPauseContext(latestPause);
   resumeFromContext(context);
   updateSessionLog('resume', context.sessionId);
   ```

4. **`/session end`**:
   ```typescript
   finalizeSessionDocument();
   updateProjectDocumentation();
   updateSessionLog('end', currentSessionId);
   ```

### **Auto-Documentation Functions**

```typescript
function createBasicDocumentation() {
  createFile('docs/README.md', getDocumentationIndexTemplate());
  createFile('docs/PROJECT_BRIEF.md', getProjectBriefTemplate());
  createFile('docs/SESSION_LOG.md', getSessionLogTemplate());
}

function createSessionDocument(sessionId: string) {
  const content = generateSessionTemplate(sessionId);
  createFile(`docs/sessions/${sessionId}.md`, content);
}
```

---

*Created: 2025-08-17*
*Version: 1.0*
*Status: UNIVERSAL - Apply to all projects*
