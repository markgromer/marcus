# Setup

## Requirements

- Node.js 20+
- Git
- At least one chat provider credential (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`)
- Optional: Claude Code and/or Codex CLI installed and authenticated if you want coding operations

## Install

```bash
git clone https://github.com/markgromer/marcus.git
cd marcus
npm install
npm run setup
```

The wizard asks for the operator name, working style, organizations, chat provider, coding agent and one or more allowed project-parent folders. It writes personal configuration to `runtime/config.json` and creates a gitignored `.env` containing a random local admin token.

Add the provider key you actually use to `.env`, then start:

```bash
npm start
```

Open `http://127.0.0.1:3030` and paste the admin token from `.env` into the local UI.

## Register a project

Projects are intentionally not auto-discovered across your entire computer. Register a project through `POST /api/projects` with a name and workspace path beneath one of the allowed roots.

## Coding operations

Create a `coding.task` operation with a registered `projectId` and a `payload.prompt`. Under the default security policy it will stop at `awaiting_approval`. Approve the exact operation, then execute it. The configured coding adapter runs only in the project's validated workspace.

Claude Code defaults to the `acceptEdits` permission mode. MARCUS does not enable bypass-permissions mode. Codex uses its non-interactive `exec` command.
