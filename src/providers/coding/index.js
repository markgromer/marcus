import { runClaudeCode } from './claude-code.js';
import { runCodex } from './codex.js';

export async function runCodingAgent({ prompt, cwd, config }) {
  const provider = config.coding?.provider || 'claude';
  if (provider === 'claude') return runClaudeCode({ prompt, cwd, config });
  if (provider === 'codex') return runCodex({ prompt, cwd, config });
  throw new Error(`Unsupported coding provider: ${provider}`);
}
