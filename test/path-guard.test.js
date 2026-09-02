import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assertAllowedWorkspace } from '../src/security/path-guard.js';

test('workspace must remain under an allowed root', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'marcus-path-'));
  const root = path.join(base, 'projects');
  const inside = path.join(root, 'demo');
  const outside = path.join(base, 'outside');
  await fs.mkdir(inside, { recursive: true });
  await fs.mkdir(outside, { recursive: true });
  assert.equal(await assertAllowedWorkspace(inside, [root]), await fs.realpath(inside));
  await assert.rejects(() => assertAllowedWorkspace(outside, [root]), /outside/);
  await fs.rm(base, { recursive: true, force: true });
});
