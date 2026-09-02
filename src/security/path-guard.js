import fs from 'node:fs/promises';
import path from 'node:path';

async function canonical(input) {
  const resolved = path.resolve(String(input || ''));
  try { return await fs.realpath(resolved); } catch { return resolved; }
}

export async function assertAllowedWorkspace(candidate, roots = []) {
  if (!candidate) throw new Error('Workspace path is required.');
  if (!Array.isArray(roots) || roots.length === 0) throw new Error('No workspace roots are configured.');
  const target = await canonical(candidate);
  for (const rootInput of roots) {
    const root = await canonical(rootInput);
    const relative = path.relative(root, target);
    if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) return target;
  }
  throw new Error('Workspace is outside the configured allowed roots.');
}
