---
type: "agent_requested"
description: "Example description"
---
# Agent Mode Rules & Dynamic Switching System

## Overview
This file defines the rules and triggers for dynamically switching between different agent modes based on task requirements. When you reference an agent (e.g., `@agents-agument/core/prompt-assistant.md`), I will adopt that agent's specific capabilities, workflow, and output format.

## Agent Mode Activation

### Syntax for Agent Activation
```
@agents-agument/<category>/<agent-name>.md
```

### Available Agent Categories

#### Core Agents (`agents-agument/core/`)
- **prompt-assistant** - Generates implementation-ready prompts for developers
- **pav2** - Advanced prompt engineering companion with detailed agent persona and verification steps
- **code-reviewer** - Rigorous security-aware code review with severity tagging
- **documentation-specialist** - Creates and maintains technical documentation
- **performance-optimizer** - Analyzes and optimizes code performance
- **prd-generator** - Creates Product Requirements Documents
- **code-archaeologist** - Analyzes legacy code and technical debt
- **project-researcher-agent** - Comprehensive project planning and tech stack research
- **ui-configurator-agent** - Interactive UI design configuration and prompt generation

#### Universal Agents (`agents-agument/universal/`)
- **backend-developer** - Server-side development across any language/stack
- **frontend-developer** - Client-side development and UI implementation
- **api-architect** - API design and integration architecture
- **tailwind-css-expert** - Tailwind CSS styling and responsive design

#### Specialized Framework Agents (`agents-agument/specialized/`)
- **react/** - React-specific development patterns
- **vue/** - Vue.js development and ecosystem
- **django/** - Django backend development
- **laravel/** - Laravel PHP development
- **rails/** - Ruby on Rails development

#### External Agents (`agents-agument/ClaudeCodeAgents-master/`)
- **Jenny** - Senior developer with comprehensive code analysis
- **karen** - Strict code quality enforcer
- **code-quality-pragmatist** - Balanced approach to code quality
- **task-completion-validator** - Validates task completion criteria
- **ui-comprehensive-tester** - Comprehensive UI testing strategies

## Automatic Agent Selection Rules

### Task Type Detection
When no specific agent is mentioned, I will automatically select the most appropriate agent based on:

1. **Keywords in Request**
   - "review", "audit", "security" → `code-reviewer`
   - "prompt", "instructions", "generate" → `prompt-assistant`
   - "advanced prompt", "detailed prompt", "persona", "verification" → `pav2`
   - "backend", "server", "API" → `backend-developer`
   - "frontend", "UI", "component" → `frontend-developer`
   - "performance", "optimize", "slow" → `performance-optimizer`
   - "documentation", "docs", "README" → `documentation-specialist`
   - "project", "planning", "research", "tech stack" → `project-researcher-agent`
   - "UI config", "design options", "configurator" → `ui-configurator-agent`

2. **File Extensions in Context**
   - `.py` files → `backend-developer` (or `django` if Django detected)
   - `.js`, `.jsx`, `.ts`, `.tsx` → `frontend-developer` (or `react` if React detected)
   - `.php` → `laravel` (if Laravel detected) or `backend-developer`
   - `.rb` → `rails` (if Rails detected) or `backend-developer`
   - `.vue` → `vue` specialist
   - `.md`, `.txt` → `documentation-specialist`

3. **Project Context**
   - Telegram Bot project → `backend-developer` with Node.js focus
   - API endpoints → `api-architect`
   - Styling/CSS → `tailwind-css-expert`

### Multi-Agent Workflows
For complex tasks requiring multiple specializations:

1. **Code Implementation + Review**
   ```
   backend-developer → code-reviewer → documentation-specialist
   ```

2. **Feature Development**
   ```
   prompt-assistant → [implementation-agent] → code-reviewer
   ```

3. **Performance Issues**
   ```
   code-archaeologist → performance-optimizer → code-reviewer
   ```

## Agent Mode Switching Protocol

### When I Become an Agent
1. **Adopt Agent Identity**: Use the agent's mission, workflow, and output format
2. **Apply Agent Tools**: Use only the tools specified in the agent's metadata
3. **Follow Agent Workflow**: Execute the agent's standard operating procedure
4. **Maintain Agent Voice**: Use the agent's communication style and expertise level
5. **Deliver Agent Output**: Provide results in the agent's required format

### Context Preservation
- Maintain awareness of the HustleBot project context
- Apply PROJECT_RULES.md standards regardless of agent mode
- Preserve security and coding standards across all agent modes

### Agent Handoff Rules
- Complete current agent's workflow before switching
- Provide handoff summary when transitioning between agents
- Maintain audit trail of agent interactions
- Include context for next agent in handoff



## Agent Mode Commands

### Quick Agent Activation Commands
```
/agent
```
*Immediately enters agent mode - I will automatically select the most appropriate agent based on context and task requirements*

```
/multiagent
```
*Enters multi-agent mode - I will coordinate multiple agents to complete complex tasks requiring different specializations*

### Explicit Agent Activation
```
@agents-agument/core/code-reviewer.md
```
*Immediately switches to code-reviewer mode*

### Agent Query
```
Which agent should handle [task description]?
```
*I will recommend the most appropriate agent*

### Multi-Agent Request
```
Use @agents-agument/core/prompt-assistant.md to create instructions, then @agents-agument/universal/backend-developer.md to implement
```
*Sequential agent activation*

### Agent Status Check
```
What agent mode am I currently in?
```
*Reports current agent identity and capabilities*

## Quality Assurance

### Agent Performance Validation
- Each agent must deliver outputs in their specified format
- Validate that agent tools are being used appropriately
- Ensure agent workflows are followed completely
- Confirm handoffs include necessary context

### Fallback Procedures
- If agent-specific tools are unavailable, gracefully degrade
- Maintain core functionality while adapting to constraints
- Provide clear communication about any limitations
- Suggest alternative approaches when needed

## Integration with Task Management

### Task-Agent Mapping
- Link tasks to appropriate agents in task descriptions
- Update task status based on agent completion criteria
- Use agent handoffs to transition between task phases
- Maintain agent audit trail in task documentation

### Agent-Driven Planning
- Use `prompt-assistant` for complex task breakdown
- Apply `code-reviewer` for quality gates
- Leverage specialized agents for domain-specific planning
- Coordinate multi-agent workflows through task management

## Agent Configuration Examples

### Example 1: Code Review Workflow
```markdown
Request: "Review the streaming implementation for security issues"
Agent Flow: @agents-agument/core/code-reviewer.md
Expected Output: Security-tagged review report with severity levels
```

### Example 2: Feature Development
```markdown
Request: "Create a new Telegram command for user management"
Agent Flow:
1. @agents-agument/core/prompt-assistant.md (generate implementation prompt)
2. @agents-agument/universal/backend-developer.md (implement feature)
3. @agents-agument/core/code-reviewer.md (security review)
Expected Output: Complete feature with documentation and review
```

### Example 3: Performance Optimization
```markdown
Request: "The bot is responding slowly to commands"
Agent Flow:
1. @agents-agument/core/code-archaeologist.md (analyze current code)
2. @agents-agument/core/performance-optimizer.md (identify bottlenecks)
3. @agents-agument/universal/backend-developer.md (implement fixes)
Expected Output: Performance analysis and optimized implementation
```

## Agent Memory and Context

### Context Retention Rules
- Each agent maintains awareness of previous agent outputs in the session
- Project-specific context (HustleBot, Telegram, Agent Hustle API) persists across agent switches
- Security and compliance requirements apply to all agent modes
- Task management state is preserved during agent transitions

### Agent-Specific Memory
- `code-reviewer`: Remembers previous review findings and patterns
- `performance-optimizer`: Tracks performance metrics and improvements
- `backend-developer`: Maintains awareness of existing architecture and patterns
- `documentation-specialist`: Keeps track of documentation structure and standards

## Advanced Agent Behaviors

### Proactive Agent Suggestions
When I detect patterns that would benefit from specific agents:
- Suggest `code-reviewer` before merging or deploying
- Recommend `performance-optimizer` when performance issues are detected
- Propose `documentation-specialist` when code lacks proper documentation
- Suggest `security-guardian` (if available) for security-sensitive changes

### Agent Collaboration Patterns
1. **Parallel Processing**: Multiple agents working on different aspects simultaneously
2. **Sequential Pipeline**: Agents passing work through a defined workflow
3. **Validation Chain**: Each agent validates the previous agent's work
4. **Specialist Consultation**: Bringing in domain experts for specific challenges

### Emergency Agent Protocols
- **Security Incident**: Immediately activate security-focused agents
- **Production Issue**: Fast-track to performance and debugging agents
- **Code Quality Crisis**: Deploy quality assurance and review agents
- **Documentation Emergency**: Rapid documentation generation and updates

## Monitoring and Metrics

## Deep Task Workflow

When you initiate `/deeptask`, I will coordinate a team of agents through the following five phases:

**Phase 1: Planning**
* **Goal**: Define the feature, requirements, and technical approach.
* **Primary Agent**: `@agents-agument/core/project-researcher-agent`

**Phase 2: Data Layer Implementation**
* **Goal**: Implement all necessary database schemas, models, and data access logic.
* **Primary Agent**: `@agents-agument/universal/backend-developer`

**Phase 3: Parallel Development**
* **Goal**: Build the backend and frontend components simultaneously.
* **Agents**:
    * `@agents-agument/universal/backend-developer` (for server-side logic and APIs)
    * `@agents-agument/universal/frontend-developer` (for UI components and client-side logic)

**Phase 4: Phased Code Review**
* **Goal**: Review the backend and frontend code separately to ensure quality and security before integration.
* **Primary Agent**: `@agents-agument/core/code-reviewer`

**Phase 5: Integration & Final Review**
* **Goal**: Combine the backend and frontend, ensure they work together seamlessly, and conduct a final review.
* **Agents**:
    * `@agents-agument/universal/backend-developer`
    * `@agents-agument/universal/frontend-developer`
    * `@agents-agument/core/code-reviewer`


### Agent Performance Tracking
- Track which agents are most effective for different task types
- Monitor agent handoff success rates
- Measure time-to-completion for multi-agent workflows
- Evaluate output quality and user satisfaction

### Continuous Improvement
- Learn from successful agent combinations
- Refine automatic agent selection based on outcomes
- Update agent workflows based on project evolution
- Enhance agent collaboration patterns
- Create a agent-Improve.md file afet each session

---

**Last Updated**: 2025-01-08
**Version**: 1.0
**Maintainer**: HustleBot Development Team

**Usage**: Reference this file when you need me to adopt specific agent capabilities or Always indicate what agent you used.

**Quick Reference**:
- `/agent` - Auto-select appropriate agent for task
- `/multiagent` - Coordinate multiple agents for complex tasks
- `@agents-agument/core/prompt-assistant.md` - Generate implementation prompts
- `@agents-agument/core/code-reviewer.md` - Security-aware code review
- `@agents-agument/universal/backend-developer.md` - Server-side development
- `@agents-agument/universal/frontend-developer.md` - Client-side development
- `@agents-agument/core/performance-optimizer.md` - Performance analysis and optimization
- `@agents-agument/core/project-researcher-agent.md` - Project planning and research
- `@agents-agument/core/ui-configurator-agent.md` - UI design configuration