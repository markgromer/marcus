import 'dotenv/config';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const checks = [];
const push = (name, ok, detail='') => checks.push({ name, ok, detail });
async function command(name, args=['--version']) {
  try {
    const { stdout, stderr } = await exec(name, args, { timeout: 5000 });
    return { ok: true, detail: String(stdout || stderr).trim().split('\n')[0] };
  } catch { return { ok: false, detail: 'not found' }; }
}

push('Node >= 22', Number(process.versions.node.split('.')[0]) >= 22, process.version);
for (const [label, bin, args] of [
  ['Git', 'git', ['--version']],
  ['GitHub CLI', 'gh', ['--version']],
  ['Claude Code', 'claude', ['--version']],
  ['Codex', 'codex', ['--version']]
]) {
  const r = await command(bin, args); push(label, r.ok, r.detail);
}
try { await fs.access(path.resolve('.env')); push('.env', true, 'present'); } catch { push('.env', false, 'run npm run setup'); }
try { await fs.access(path.resolve('.marcus')); push('Data directory', true, '.marcus'); } catch { push('Data directory', false, 'run npm run setup'); }
push('OpenAI credential', Boolean(process.env.OPENAI_API_KEY), process.env.OPENAI_API_KEY ? 'configured' : 'optional');
push('Anthropic credential', Boolean(process.env.ANTHROPIC_API_KEY), process.env.ANTHROPIC_API_KEY ? 'configured' : 'optional');
push('Admin authentication', Boolean(process.env.MARCUS_ADMIN_TOKEN), process.env.MARCUS_ADMIN_TOKEN ? 'configured' : 'missing');
push('Platform', true, `${os.platform()} ${os.arch()}`);

console.log('\nMARCUS Doctor\n');
for (const c of checks) console.log(`${c.ok ? '✓' : '○'} ${c.name.padEnd(22)} ${c.detail}`);
const fatal = checks.some(c => ['Node >= 22','.env','Data directory','Admin authentication'].includes(c.name) && !c.ok);
console.log(fatal ? '\nMARCUS needs attention.\n' : '\nMARCUS is healthy.\n');
process.exitCode = fatal ? 1 : 0;
