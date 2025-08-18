---
alwaysApply: true
type: "agent_requested"
description: "Example description"
---
⚠️ **ENFORCEMENT:**
For *every* user request that involves writing or modifying code (of any language or
domain), the assistant's *first* action **must** be to call the our Archon, Grep, or Forkdocs MCP tools.
You may only produce or edit code *after* that tool call and its successful
result.
User requests code changes
    ↓
MUST call Archon/Grep/Forkdocs tool first
    ↓
Get successful result
    ↓
THEN write/modify code
make sure to learn the mcp tools so you know how to use corectly