# Architecture

MARCUS separates **identity**, **context**, **decisioning**, **authorization** and **execution** so personalization does not require forking core logic.

## Layers

1. **Operator configuration** — local `runtime/config.json`, created by the setup wizard. It describes the operator, assistant identity, organizations, provider choices and allowed workspace roots.
2. **Prompt kernel** — composable Markdown modules under `src/core/modules/`. They define operating doctrine without hard-coding one person's businesses or habits.
3. **Durable state** — atomic JSON stores for projects, operations and local memory. Runtime state is outside source control.
4. **Approval policy** — classifies operations and binds approval to the exact prepared action digest.
5. **Provider boundaries** — chat providers and coding agents live behind small adapters. The initial coding adapters support Claude Code and Codex.
6. **Execution boundary** — coding work resolves a registered project, validates its workspace against configured roots, then starts the selected coding agent with a reduced environment.
7. **Interfaces** — a local Express API and a lightweight browser UI. Other clients can use the same API without inventing a second memory or approval model.

## Why this differs from a search-and-replace fork

A personal operating system should not contain another user's biography, local paths, clients, deployment hosts or accumulated conversations. MARCUS therefore treats those as runtime data. A new operator starts with an empty memory and configures identity through `npm run setup`.

## Current extraction boundary

The first public baseline includes the portable kernel, local memory, projects, approval-gated coding operations, Claude Code/Codex execution, and chat providers. Browser automation, third-party messaging integrations, richer semantic memory, cloud deployment adapters and the mature desktop bridge are intentionally not copied blindly; they should be extracted behind the same provider and authorization boundaries.
