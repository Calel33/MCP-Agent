# Codebuff Agents

This directory contains custom agent templates for the Codebuff system.

## Clarity Agent

The **Clarity Agent** (`clarity-agent.ts`) is designed to handle vague or incomplete user requests by:

1. **Scanning the codebase** using `code_search` and `read_files` tools
2. **Understanding context** from project structure, patterns, and existing code
3. **Asking targeted questions** to clarify requirements
4. **Transforming ambiguous requests** into specific, actionable tasks

## Code Archaeologist Agent

The **Code Archaeologist Agent** (`code-archaeologist.ts`) is designed to explore and document unfamiliar, legacy, or complex codebases by:

1. **Deep Codebase Exploration** using comprehensive file analysis and pattern recognition
2. **Architecture Mapping** to understand system structure, dependencies, and data flow
3. **Quality Assessment** including complexity analysis, technical debt identification, and security evaluation
4. **Comprehensive Reporting** with detailed markdown documentation and prioritized recommendations

### Usage

Spawn the clarity agent when users provide vague requests like:
- "fix the login"
- "improve the UI"
- "optimize performance"
- "add error handling"

```typescript
// Example spawn call
spawn_agents({
  agents: [{
    agent_type: 'clarity-agent',
    prompt: 'The user wants to "fix the authentication issues" but didn\'t specify what\'s broken'
  }]
})
```

### How it Works

1. **Initial Analysis**: Reviews the user's request to identify unclear aspects
2. **Codebase Exploration**: Searches for relevant files, patterns, and implementations
3. **Context Building**: Understands the project structure and existing approaches
4. **Targeted Questioning**: Asks 2-3 specific questions based on findings
5. **Iterative Refinement**: Continues until requirements are clear and actionable

### Example Interaction

**User**: "fix the login"

**Clarity Agent**:
1. Searches for authentication-related files
2. Finds: `auth/login.tsx`, `api/auth.js`, `middleware/session.js`
3. Asks: "I found your login system uses JWT tokens with a React form component. Are you experiencing: 1) Form validation errors, 2) Token expiration issues, or 3) API authentication failures? What specific behavior are you seeing?"

**Result**: Transforms vague request into specific, actionable task.

### Code Archaeologist Usage

Spawn the code archaeologist agent for comprehensive codebase analysis:
- Legacy system exploration
- Pre-refactoring assessments
- Security audits
- Onboarding documentation
- Technical debt analysis

```typescript
// Example spawn call
spawn_agents({
  agents: [{
    agent_type: 'code-archaeologist',
    prompt: 'Analyze this React/Node.js application for potential refactoring opportunities',
    params: {
      scope: 'full',
      includeTests: true,
      outputFormat: 'comprehensive'
    }
  }]
})
```

### How Code Archaeologist Works

1. **Discovery Phase**: Maps project structure, identifies technologies and entry points
2. **Architecture Analysis**: Traces data flow, maps dependencies, identifies patterns
3. **Quality Assessment**: Analyzes complexity, identifies technical debt and security risks
4. **Comprehensive Reporting**: Generates detailed markdown with executive summary, metrics, and prioritized recommendations

### Example Code Archaeologist Report Sections

- **Executive Summary**: Health score, top risks, critical recommendations
- **Architecture Overview**: System diagram, tech stack, component relationships
- **Quality Metrics**: Complexity scores, test coverage, code smell hotspots
- **Security Assessment**: Vulnerabilities, auth patterns, dependency risks
- **Performance Analysis**: Bottlenecks, optimization opportunities
- **Prioritized Actions**: P0-P3 recommendations with effort estimates

## Agent Development

### Creating New Agents

1. Import the type definitions:
```typescript
import type { AgentDefinition } from './types/agent-definition'
```

2. Define your agent:
```typescript
const definition: AgentDefinition = {
  id: 'my-agent',
  displayName: 'My Custom Agent',
  model: 'anthropic/claude-4-sonnet-20250522',
  toolNames: ['read_files', 'code_search'],
  // ... other configuration
}

export default definition
```

### Best Practices

- **Minimal Tools**: Only include tools the agent actually needs
- **Clear Purpose**: Write specific spawnerPrompt and instructionsPrompt
- **Focused Scope**: Each agent should have a well-defined responsibility
- **Consistent Naming**: Use kebab-case for IDs and descriptive display names

### Available Tools

- `read_files` - Read file contents
- `code_search` - Search codebase with ripgrep
- `write_file` - Create/edit files
- `str_replace` - Replace text in files
- `run_terminal_command` - Execute CLI commands
- `spawn_agents` - Spawn other agents
- `add_message` - Add to conversation history
- `end_turn` - End agent turn

### Model Options

- `anthropic/claude-4-sonnet-20250522` - Best for complex reasoning
- `openai/gpt-5` - Good general purpose model
- `google/gemini-2.5-pro` - Strong code understanding
- `qwen/qwen3-coder` - Optimized for coding tasks