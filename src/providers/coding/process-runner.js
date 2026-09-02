import { spawn } from 'node:child_process';

export function reducedEnv(extra = {}) {
  const keys = ['PATH', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'TEMP', 'TMP', 'SystemRoot', 'COMSPEC', 'SHELL', 'TERM'];
  const env = {};
  for (const key of keys) if (process.env[key]) env[key] = process.env[key];
  return { ...env, ...extra };
}

export function runProcess({ command, args = [], cwd, env = {}, timeoutMs = 30 * 60 * 1000 }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, windowsHide: true, shell: false });
    let stdout = '';
    let stderr = '';
    const cap = 2_000_000;
    child.stdout?.on('data', (chunk) => { stdout = (stdout + chunk.toString()).slice(-cap); });
    child.stderr?.on('data', (chunk) => { stderr = (stderr + chunk.toString()).slice(-cap); });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Coding agent timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      if (code === 0) resolve({ code, signal, stdout, stderr });
      else reject(Object.assign(new Error(`Coding agent exited with code ${code ?? 'unknown'}.`), { code, signal, stdout, stderr }));
    });
  });
}
