Read Project Context (Quick, General)

Use this simple, project-agnostic command at the start of any session to scan common docs, configs, scripts, and top-level code folders, then output a concise read-only context report.

Optional input
- task-name: (if provided, scan matching docs/tasks/[task-name]/)

Read (auto-detect if present)
- Docs
  - README.md, CONTRIBUTING.md, CHANGELOG.md
  - docs/SESSION_LOG.md (recent entries)
  - Latest file in docs/sessions/{general,pauses,handoffs,learnings}/
  - docs/core/{ARCHITECTURE.md,PROJECT_PROGRESS.md,DEVELOPMENT_GUIDE.md,PRODUCT_BRIEF.md}
  - If task-name provided: docs/tasks/[task-name]/README.md and newest docs/tasks/[task-name]/sessions/*
- Package & workspace
  - package.json (scripts, engines) and any package-lock.json/yarn.lock/pnpm-lock.yaml
  - pnpm-workspace.yaml, turbo.json (monorepo indicators)
  - packages/* (list first-level package folders)
- Environment & tooling
  - .env, .env.* (names only), .env.example
  - .editorconfig, .nvmrc/.node-version, .gitignore
- TypeScript/JS config
  - tsconfig.json, tsconfig.*.json, jsconfig.json
- Framework/build config (detect any)
  - next.config.*, vite.config.*, webpack.config.*, rollup.config.*, parcel.*
  - babel.config.*, swc.*.config.*, tsup.config.*, esbuild.config.*
  - tailwind.config.*, postcss.config.*
- Lint/format/test config
  - eslint.config.*, .eslintrc.*, prettier.config.* | .prettierrc*
  - jest.config.*, vitest.config.*, playwright.config.*, cypress.config.*
- Runtime/infra
  - Dockerfile, docker-compose.yml, Makefile, Procfile
  - config/* (list first-level files)
- Code map (top-level only)
  - src/* (list first-level dirs/files)
  - app/* (if present; list first-level)
  - server/*, backend/*, api/* (if present)
  - client/*, frontend/*, ui/* (if present)
  - tests/* or __tests__/* (first-level)
- Change history
  - changes/** or .changeset/** (list latest few entries by filename)
- Prompts/commands (index only)
  - prompts/*, prompts-main/*, commands/* (list filenames only)

Output
Provide a brief "Context Report" with sections:
1) Docs snapshot (recent sessions + key docs present)
2) Config snapshot (which config files exist; noteworthy flags if obvious)
3) Scripts – list important commands from root package.json (and workspaces if present)
4) Code map – top-level directories/files (src/app/server/client/tests)
5) Workspace/monorepo (packages, workspace files if any)
6) Recent changes (latest filenames found)
7) Suggested next reads (areas that appear important)

Rules
- Read-only; do not modify files or tasks
- Keep the report concise and high-signal

