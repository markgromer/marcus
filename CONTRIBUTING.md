# Contributing

Keep MARCUS portable. Core code must not assume one operator name, company, home directory, repository owner, deployment hostname or provider account.

Before proposing a change:

```bash
npm test
npm run check
```

The public-safety check intentionally rejects known operator-specific extraction strings, likely credentials, tracked runtime data and tracked `.env` files.

For consequential integrations, preserve these invariants:

- preparation and execution are separate states;
- approval applies to the exact prepared action;
- provider success must be verified rather than inferred;
- secrets do not enter durable conversational memory;
- local filesystem access is bounded to registered roots;
- new provider code fails closed when verification is unavailable.
