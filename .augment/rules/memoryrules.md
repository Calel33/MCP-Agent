---
type: "manual"
description: "Example description"
---
{
  "system_rule": {
    "name": "Memory Folder Management System Rule",
    "version": "1.0",
    "description": "A rule set for an AI agent to create, manage, and maintain project memory and documentation.",
    "trigger_conditions": [
      "New code commits ",
      "Issue closure (in a bug tracking system)",
      "Completion of a development sprint",
      "Scheduled daily/weekly runs"
    ],
    "actions": {
      "initialization": "On first run, the agent must create the 'memory-docs/' directory and all subdirectories specified below. It will also create the root-level files with initial placeholder content.",
      "maintenance": "On each trigger, the agent will check the project state and update the memory folder as per the instructions for each item. It will add, modify, or remove files as necessary to keep the documentation current and accurate."
    },
    "folder_structure": {
      "root_directory": "memory-docs/",
      "directories": [
        {
          "name": "architecture/",
          "purpose": "High-level system docs & diagrams",
          "instructions": "Create new documents (e.g., Markdown, images) when architectural changes occur. Ensure all documents reflect the current system design. Maintain diagrams to be up-to-date with system components and data flow."
        },
        {
          "name": "fix-guides/",
          "purpose": "Post-mortems + resolutions",
          "instructions": "Upon resolution of a critical bug or incident, create a new file (e.g., 'YYYY-MM-DD-incident-summary.md'). This file should detail the root cause, fix, and preventative measures. Once created, these files are static and should not be modified."
        },
        {
          "name": "open-issues/",
          "purpose": "STILL broken, needs work",
          "instructions": "Synchronize with the project's issue tracker. For each open, high-priority issue, create a corresponding file. When an issue is closed, delete its file from this directory and, if a post-mortem is required, create a document in 'fix-guides/'."
        },
        {
          "name": "audits/",
          "purpose": "Performance, cost, security reviews",
          "instructions": "After any review or audit (e.g., performance test, security scan), generate a summary report and save it here. Reports should include findings, recommendations, and the date of the audit. Keep these files for historical reference."
        },
        {
          "name": "references/",
          "purpose": "APIs, schemas, checklists",
          "instructions": "This directory contains static, reference-level documentation. Update files here whenever an API schema changes, a new checklist is created, or any other core reference material is modified."
        }
      ],
      "root_files": [
        {
          "name": "progress.md",
          "purpose": "Single running changelog",
          "instructions": "Append a new entry to the top of this file for each significant project milestone or code merge. Each entry should include a date, a brief summary of changes, and a link to relevant pull requests or issues."
        },
        {
          "name": "implementation-plan.md",
          "purpose": "Current build blueprint",
          "instructions": "Maintain this file as the single source of truth for the active development plan. When the plan changes, overwrite the file with the new blueprint. Do not keep old versions in this directory."
        },
        {
          "name": "features.md",
          "purpose": "Consolidated shipped-feature documentation",
          "instructions": "When a new feature is deployed to production, add a new section to this file documenting the feature's functionality, technical details, and its purpose. This file should be a comprehensive record of all features shipped."
        }
      ]
    }
  }
}