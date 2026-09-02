# MARCUS

**Stop managing your AI coding agents yourself.**

MARCUS is a self-hosted personal operating system that sits above your projects and coding agents. It keeps durable project context, remembers what matters, coordinates work across Claude Code and Codex, tracks approval-gated operations, and is designed to involve you only when judgment or permission is actually required.

> **Status: early public build.** The portable kernel works today; higher-autonomy supervision and verification loops are still being built. This repository contains no personal data from the original OS1/MARCUS operator system.

## Why I built it

AI made writing code dramatically easier. The new bottleneck became me: remembering every project, reopening the right repo, restoring context, choosing an agent, checking its work, and deciding what happens next. MARCUS exists to move that coordination layer out of my head.

The goal is not another chat tab. The goal is:

```text
You
 ↓
MARCUS ── durable memory + project state + policy
 ↓
chooses/prepares work
 ↙             ↘
Claude Code    Codex
 ↘             ↙
results → verification → approval/escalation → you
```

## Quick start

Requirements: **Node.js 22+** and at least one supported model provider.

```bash
git clone https://github.com/markgromer/marcus.git
cd marcus
npm install
npm run setup
npm start
```

Open **http://127.0.0.1:3030** and finish onboarding in the browser.

Check your environment at any time:

```bash
npm run doctor
```

Want to understand the product before connecting providers?

```bash
npm run demo
```

## What works today

| Capability | Status |
| --- | --- |
| Operator-owned, self-hosted runtime | ✅ |
| Durable local memory | ✅ |
| Project registry | ✅ |
| OpenAI / Anthropic chat providers | ✅ |
| Approval-gated operations | ✅ |
| Local web interface | ✅ |
| Environment / coding-agent detection | ✅ |
| Project-folder discovery | ✅ |
| Diagnostics (`npm run doctor`) | ✅ |
| Demo runtime | 🧪 |
| Browser-first onboarding | 🧪 |
| Guided first operation | 🚧 |
| Autonomous planning / supervision | 🚧 |
| Verification loops | 🚧 |
| Rich GitHub integration | 🚧 |

## First-run philosophy

A fresh MARCUS should learn you rather than ship with somebody else's life baked into it. New installs start empty. During onboarding MARCUS discovers available tools, lets you choose approved project roots, imports projects, configures your preferred providers and establishes execution boundaries.

## Safety model

MARCUS is intentionally not allowed to treat access as permission. Consequential actions—repository writes, code execution outside approved workspaces, deployment, deletion, messaging, publishing, billing changes and similar operations—are designed to remain approval-gated and auditable.

See `SECURITY.md` and `docs/ARCHITECTURE.md`.

## Design goals

- Operator-owned and self-hostable
- Durable memory instead of disposable sessions
- Project-aware context and execution
- Explicit approval boundaries
- Pluggable coding agents
- Local-machine capability without unrestricted machine access
- Provider-neutral integrations
- Portable fresh installs with zero operator/business data
- Secrets kept in environment variables or local runtime storage

## Contributing

Issues and pull requests are welcome, especially around onboarding, portability, agent adapters, verification, security boundaries and cross-platform support. See `CONTRIBUTING.md`.

## License

No open-source license has been selected yet. Until a license is added, normal copyright restrictions apply. A public license should be selected before the first stable release.
