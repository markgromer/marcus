import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { discoverProjects } from '../src/system/detect.js';

test('discoverProjects finds common project types and skips node_modules', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'marcus-discovery-'));
  try {
    await fs.mkdir(path.join(root, 'web'));
    await fs.writeFile(path.join(root, 'web', 'package.json'), '{}');
    await fs.mkdir(path.join(root, 'api'));
    await fs.writeFile(path.join(root, 'api', 'pyproject.toml'), '[project]');
    await fs.mkdir(path.join(root, 'node_modules', 'fake'), { recursive: true });
    await fs.writeFile(path.join(root, 'node_modules', 'fake', 'package.json'), '{}');

    const projects = await discoverProjects(root, 2);
    assert.equal(projects.length, 2);
    assert.deepEqual(projects.map((p) => p.name).sort(), ['api', 'web']);
    assert.equal(projects.find((p) => p.name === 'web').kind, 'node');
    assert.equal(projects.find((p) => p.name === 'api').kind, 'python');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
