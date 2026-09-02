# MARCUS

**Modular Autonomous Routing, Coordination & Utility System**

MARCUS is a self-hosted personal operating system for people who want an AI assistant that can maintain durable context, coordinate projects, prepare and execute bounded operations, work with coding agents, and stay behind explicit approval boundaries for consequential actions.

> **Status:** early public extraction from the original OS1/MARCUS system. This repository is being rebuilt around portable configuration and contains no personal runtime data from the original operator.

## Design goals

- Operator-owned and self-hostable
- Durable memory instead of disposable chat sessions
- Project-aware context and execution
- Explicit approval gates for consequential actions
- Pluggable coding agents, including Claude Code and Codex
- Local desktop capability without exposing the whole machine
- Provider-neutral integrations
- Fresh install starts with no operator/business data
- Secrets stay in environment variables or local runtime storage and are never committed

## Current build

This repository is being assembled as the clean, distributable MARCUS codebase. The original operator-specific OS1 repository is intentionally **not** used as a history source here; personal notes, conversations, production URLs, local paths, credentials, business records, and runtime data are excluded by design.

## Planned first-run flow

```bash
npm install
npm run setup
npm start
```

The setup command will create a local operator profile, assistant identity, execution policy, project roots, coding-agent choice, and provider configuration without requiring source-code edits.

## Security model

MARCUS should be powerful without being casually dangerous. High-impact actions such as sending messages, publishing, deploying, deleting, billing changes, repository writes, or executing code outside approved workspaces must remain approval-gated and auditable.

See `SECURITY.md` and `docs/ARCHITECTURE.md` as the public extraction is completed.

## License

No open-source license has been selected yet. Until a license is added, normal copyright restrictions apply.
