import { reducedEnv, runProcess } from './process-runner.js';

export async function runCodex({ prompt, cwd }) {
  const bin = process.env.MARCUS_CODEX_BIN || 'codex';
  const env = reducedEnv({ ...(process.env.OPENAI_API_KEY ? { OPENAI_API_KEY: process.env.OPENAI_API_KEY } : {}) });
  const result = await runProcess({ command: bin, args: ['exec', '--ephemeral', prompt], cwd, env });
  return { provider: 'codex', output: result.stdout, stderr: result.stderr };
}
