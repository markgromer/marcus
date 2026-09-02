# Security

MARCUS is designed around a simple rule: **capability is not authorization**.

## Defaults

- The server binds to `127.0.0.1` unless explicitly changed.
- API access requires `MARCUS_ADMIN_TOKEN`.
- Runtime configuration, memory, project records, logs and `.env` files are gitignored.
- Coding agents may execute only inside configured workspace roots.
- Coding operations require approval under the default `consequential` policy.
- Approval is bound to a digest of the exact operation. Changing its type, project or payload invalidates the approval.
- The bundled Claude Code adapter never enables `bypassPermissions`.
- Child coding agents receive a reduced environment rather than every variable available to MARCUS.
- Unsupported consequential operation types fail closed instead of pretending they succeeded.

## Deployment warning

The included server is intentionally local-first. Do not expose it directly to the public internet. Put a production deployment behind authenticated TLS infrastructure, rate limiting and a reviewed secret-management strategy.

## Secrets

Keep API keys in environment variables or a local `.env` file. Never place credentials in operator prompts, durable conversational memory, project descriptions, repository files or screenshots.

## Reporting

Before publishing a vulnerability, give the maintainer a reasonable opportunity to investigate and patch it. Do not include working credentials, private user data or destructive reproduction steps in public issues.
