# MARCUS

**Stop managing your AI coding agents yourself.**

MARCUS is a self-hosted personal operating system that sits above your projects and coding agents. It keeps durable project context, remembers what matters, coordinates approval-gated work across Claude Code and Codex, and is designed to involve you when judgment or permission is actually required.

> **Status: public alpha.** First-run onboarding, environment detection, project discovery/import, durable local state, approval-gated coding operations, diagnostics, and a populated demo are implemented. Higher-autonomy planning, supervision, and verification loops are still being built.

## Why I built it

AI made writing code dramatically easier. The new bottleneck became me: remembering every project, reopening the right repo, restoring context, choosing an agent, checking its work, and deciding what happens next. MARCUS exists to move that coordination layer out of my head.

```text
You
 ↓
MARCUS ── durable memory + project state + policy
 ↓
prepares work
 ↙             ↘
Claude Code    Codex
 ↘             ↙
results → approval / review → you
```

## Quick start

Requirements: **Node.js 22+**. Claude Code and/or Codex are optional but required to execute coding operations with that agent.

```bash
git clone https://github.com/markgromer/marcus.git
cd marcus
npm install
npm run setup
npm start
```

Open **http://127.0.0.1:3030**. MARCUS will guide you through setup, detect installed tools, scan the project folder you choose, and import selected projects.

If your chosen chat provider API key was not already detected, add it to `.env` and restart MARCUS:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

Only configure the provider you use.

## See it before configuring anything

```bash
npm run demo
```

Demo mode creates isolated sample state in `runtime-demo/` and starts the same control center without touching your normal MARCUS runtime.

## Diagnostics

```bash
npm run doctor
```

Use this before opening a bug report. It checks the runtime, Node version, Git, supported coding agents, provider credentials, configuration, workspace access, and common setup problems.

## What works today

| Capability | Status |
| --- | --- |
| Operator-owned, self-hosted runtime | ✅ |
| Browser-first onboarding | ✅ |
| Localhost-first authentication UX | ✅ |
| Environment / coding-agent detection | ✅ |
| Project-folder discovery and import | ✅ |
| Durable local memory | ✅ |
| Project registry | ✅ |
| OpenAI / Anthropic chat providers | ✅ |
| Approval-gated coding operations | ✅ |
| Claude Code / Codex adapters | ✅ |
| Control-center dashboard | ✅ |
| Guided first coding operation | ✅ |
| Diagnostics (`npm run doctor`) | ✅ |
| Isolated populated demo (`npm run demo`) | ✅ |
| Autonomous planning / supervision | 🚧 |
| Independent verification loops | 🚧 |
| Rich GitHub lifecycle integration | 🚧 |

## The first useful loop

1. Run setup and open MARCUS.
2. Let it detect your environment.
3. Select a project parent folder and import projects.
4. From the control center, create the guided first coding operation.
5. Review the prepared operation before approval.
6. Approve and execute it only when you are comfortable with the scope.
7. Review the result inside MARCUS.

The approval boundary is intentional. MARCUS should become more autonomous only where the operator explicitly chooses to grant that autonomy.

## Safety model

MARCUS does not treat access as permission. Workspace paths are allow-listed. Coding work is represented as an operation with a digest, risk classification, approval state, result, and error state. Consequential work is approval-gated by default, and non-loopback API access requires the generated admin token.

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
- Honest UI: never claim an operation succeeded when it was only planned or prepared

## Contributing

Issues and pull requests are welcome, especially around onboarding, portability, agent adapters, verification, security boundaries and cross-platform support. See `CONTRIBUTING.md`.

## License

Apache-2.0. See `LICENSE`.
