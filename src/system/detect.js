import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

async function has(bin) {
  try {
    const { stdout, stderr } = await exec(bin, ['--version'], { timeout: 4000 });
    return { installed:true, version:String(stdout||stderr).trim().split('\n')[0] };
  } catch { return { installed:false, version:'' }; }
}

export async function detectEnvironment() {
  const tools = {};
  for (const [key, bin] of Object.entries({ git:'git', github:'gh', claude:'claude', codex:'codex', docker:'docker' })) tools[key] = await has(bin);
  return {
    platform: os.platform(),
    arch: os.arch(),
    home: os.homedir(),
    node: process.version,
    tools,
    credentials: {
      openai:Boolean(process.env.OPENAI_API_KEY),
      anthropic:Boolean(process.env.ANTHROPIC_API_KEY)
    }
  };
}

async function looksLikeProject(dir) {
  try {
    const names = new Set(await fs.readdir(dir));
    return ['.git','package.json','pyproject.toml','requirements.txt','Cargo.toml','go.mod'].some(n => names.has(n));
  } catch { return false; }
}

export async function discoverProjects(root, depth=2) {
  const resolved = path.resolve(root);
  const found = [];
  async function walk(dir, level) {
    if (found.length >= 100 || level > depth) return;
    if (await looksLikeProject(dir)) {
      const names = new Set(await fs.readdir(dir));
      const kind = names.has('package.json') ? 'node' : names.has('pyproject.toml') || names.has('requirements.txt') ? 'python' : names.has('Cargo.toml') ? 'rust' : names.has('go.mod') ? 'go' : 'git';
      found.push({ name:path.basename(dir), path:dir, kind, git:names.has('.git') });
      if (names.has('.git')) return;
    }
    if (level === depth) return;
    let entries=[]; try { entries=await fs.readdir(dir,{withFileTypes:true}); } catch { return; }
    for (const e of entries) if (e.isDirectory() && !['node_modules','.git','.next','dist','build','vendor'].includes(e.name)) await walk(path.join(dir,e.name),level+1);
  }
  await walk(resolved,0);
  return found;
}
