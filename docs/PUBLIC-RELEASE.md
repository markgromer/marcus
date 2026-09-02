# Public release boundary

This repository is a clean-room extraction of the reusable MARCUS architecture, not a mirror of an operator's live instance.

## Intentionally included

- configurable assistant/operator identity
- modular operating prompt
- local-first authenticated API
- durable local project, memory and operation stores
- exact-action approval records
- allowed-workspace containment
- Claude Code and Codex coding-agent adapters
- OpenAI and Anthropic chat-provider adapters
- first-run configuration wizard
- publication leakage checks

## Intentionally excluded from the first baseline

- historical conversations, daily notes and personal memory
- client/business records
- local machine paths
- production URLs and deployment IDs
- credentials and provider tokens
- browser profiles and cookies
- account-specific messaging, email or CRM configuration
- copied production evidence and audit history

Those capabilities can be added back only as portable modules with explicit authorization and clean per-operator storage.
