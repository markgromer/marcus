import { reducedEnv, runProcess } from './process-runner.js';

const ALLOWED_MODES = new Set(['default', 'acceptEdits', 'plan', 'auto', 'dontAsk']);

export async function runClaudeCode({ prompt, cwd, config }) {
  const bin = process.env.MARCUS_CLAUDE_BIN || 'claude';
  const requested = config.coding?.claudePermissionMode || 'acceptEdits';
  const permissionMode = ALLOWED_MODES.has(requested) ? requested : 'acceptEdits';
  const env = reducedEnv({
    ...(process.env.ANTHROPIC_API_KEY ? { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY } : {}),
    ...(process.env.CLAUDE_CODE_USE_BEDROCK ? { CLAUDE_CODE_USE_BEDROCK: process.env.CLAUDE_CODE_USE_BEDROCK } : {}),
    ...(process.env.CLAUDE_CODE_USE_VERTEX ? { CLAUDE_CODE_USE_VERTEX: process.env.CLAUDE_CODE_USE_VERTEX } : {})
  });
  const args = ['-p', prompt, '--output-format', 'json', '--permission-mode', permissionMode, '--no-session-persistence'];
  const result = await runProcess({ command: bin, args, cwd, env });
  let parsed = null;
  try { parsed = JSON.parse(result.stdout); } catch {}
  return { provider: 'claude-code', permissionMode, output: parsed?.result || parsed?.message || result.stdout, raw: parsed, stderr: result.stderr };
}
