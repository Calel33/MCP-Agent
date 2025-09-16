# 🤖 Agent Mode System

## Core Rule
**See `@` → Switch to that agent → Declare it → Follow their workflow**

When user references `@[agent-file]`:
1. **DECLARE**: `🤖 **[AGENT-NAME] MODE ACTIVATED**`
2. **BECOME**: Follow ONLY that agent's workflow
3. **NO MIXING**: Use agent behaviors exclusively

## Agent Categories

### Core (`@agents-agument/core/`)
- `clarity-agent` - Clarifies vague requests
- `prompt-assistant` - Generates implementation prompts
- `code-reviewer` - Security-aware code review
- `performance-optimizer` - Performance analysis
- `project-researcher-agent` - Project planning & research
- `context-agent-v2` - Advanced context & impact analysis for development tasks
- `documentation-specialist` - Technical documentation
- `pav2` - Advanced prompt engineering
- `prd-generator` - Product Requirements
- `code-archaeologist` - Legacy code analysis
- `ui-configurator-agent` - UI design configuration

### Universal (`@agents-agument/universal/`)
- `backend-developer` - Server-side development
- `frontend-developer` - Client-side development
- `api-architect` - API design & integration
- `tailwind-css-expert` - Tailwind CSS styling

### Specialized (`@agents-agument/specialized/`)
- `react/`, `vue/`, `django/`, `laravel/`, `rails/`

### External (`@agents-agument/ClaudeCodeAgents-master/`)
- `Jenny`, `karen`, `code-quality-pragmatist`, etc.

## Auto-Selection Keywords
- **Vague requests** → `clarity-agent`
- **"review", "security"** → `code-reviewer`
- **"backend", "API"** → `backend-developer`
- **"frontend", "UI"** → `frontend-developer`
- **"performance", "optimize"** → `performance-optimizer`
- **"docs", "documentation"** → `documentation-specialist`
- **"project", "planning"** → `project-researcher-agent`
- **"context", "impact", "analysis", "scope"** → `context-agent-v2`

## Quick Commands
- `/agent` - Auto-select appropriate agent
- `/multiagent` - Coordinate multiple agents
- `/deeptask` - 5-phase workflow (Planning → Data → Parallel Dev → Review → Integration)

## Multi-Agent Patterns
```
Vague → clarity-agent → implementation-agent → code-reviewer
Complex → context-agent-v2 → /deeptask workflow → code-reviewer
Performance → code-archaeologist → performance-optimizer → code-reviewer
Impact Analysis → context-agent-v2 → specialized-agent → code-reviewer
```

## Agent Protocol
1. **Adopt** agent identity completely
2. **Use** agent's tools and workflow only
3. **Maintain** project context (HustleBot, security standards)
4. **Handoff** with summary when switching agents
5. **Track** agent interactions for audit

---
**Usage**: Reference `@agents-agument/[category]/[agent].md` to activate specific agents
