Read Project Context (Quick)

Use this simple command at the start of a session to read key project files and output a concise context report. Read-only. No code edits, no task changes.

Optional input
- task-name: (if provided, scan matching docs/tasks/[task-name]/)

Read (if present)
- Docs
  - docs/SESSION_LOG.md
  - Latest file in docs/sessions/{general,pauses,handoffs,learnings}/
  - If task-name provided: docs/tasks/[task-name]/README.md and newest docs/tasks/[task-name]/sessions/*
- Configs
  - mcp-config.json and mcp-agent.config.json (repo root)
  - mcp-agent-ui/mcp-config.json and mcp-agent-ui/mcp-agent.config.json
- Build/run
  - package.json (root) and mcp-agent-ui/package.json (scripts)
  - tsconfig.json (root) and mcp-agent-ui/tsconfig.json
  - mcp-agent-ui/next.config.ts, tailwind.config.js, mcp-agent-ui/eslint.config.mjs, eslint.config.js
- Code map (top-level only)
  - src/ (agent/backend): list first-level dirs/files
  - mcp-agent-ui/src/app, mcp-agent-ui/src/components, mcp-agent-ui/src/hooks, mcp-agent-ui/src/lib, mcp-agent-ui/src/types: list first-level entries
- Change history
  - changes/codebasechanges/* and mcp-agent-ui/changes/codebasechanges/* (latest entries)
- Prompts/commands (index only)
  - prompts/*, prompts-main/commands/*, commands/*

Output
Provide a brief "Context Report" with sections:
1) Docs snapshot (recent sessions + task notes)
2) Config snapshot (which config files exist; key flags if obvious)
3) Scripts (root and UI) – list important commands
4) Backend map (src/* one level)
5) UI map (app pages/layouts and key components one level)
6) Recent changes (latest filenames)
7) Potential next reads (any file/area that looks important)

Rules
- Read-only; do not modify files or tasks
- Keep the report concise and high-signal

