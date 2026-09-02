import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const demoDir = path.resolve('runtime-demo');
await fs.mkdir(demoDir, { recursive: true });
const now = new Date().toISOString();
const projectA = 'project_demo_web';
const projectB = 'project_demo_mobile';

await fs.writeFile(path.join(demoDir, 'config.json'), JSON.stringify({
  schemaVersion: 1,
  assistant: { name: 'MARCUS', acronym: 'Modular Autonomous Routing, Coordination & Utility System' },
  operator: { name: 'Demo Operator', role: 'Builder', workingStyle: 'Direct, evidence-first, and action-oriented', priorities: ['Ship reliably', 'Protect focus'] },
  organizations: [],
  chat: { provider: 'openai', model: '' },
  coding: { provider: 'claude', claudePermissionMode: 'acceptEdits' },
  security: { approvalMode: 'consequential', allowedWorkspaceRoots: [process.cwd()] },
  createdAt: now,
  updatedAt: now
}, null, 2));

await fs.writeFile(path.join(demoDir, 'projects.json'), JSON.stringify({ projects: [
  { id: projectA, name: 'Customer Portal', workspace: process.cwd(), repository: 'https://github.com/example/customer-portal', status: 'active', createdAt: now, updatedAt: now },
  { id: projectB, name: 'Mobile App', workspace: process.cwd(), repository: 'https://github.com/example/mobile-app', status: 'active', createdAt: now, updatedAt: now }
]}, null, 2));

await fs.writeFile(path.join(demoDir, 'operations.json'), JSON.stringify({ operations: [
  { id: 'op_demo_approval', type: 'coding.task', projectId: projectA, payload: { prompt: 'Improve onboarding validation and run tests.' }, risk: 'high', status: 'awaiting_approval', createdAt: now, updatedAt: now, approval: null, result: null, error: null, digest: 'demo' },
  { id: 'op_demo_ready', type: 'coding.task', projectId: projectB, payload: { prompt: 'Audit navigation accessibility.' }, risk: 'high', status: 'ready', createdAt: now, updatedAt: now, approval: { approvedBy: 'Demo Operator', approvedAt: now, digest: 'demo' }, result: null, error: null, digest: 'demo' }
]}, null, 2));

await fs.writeFile(path.join(demoDir, 'memory.json'), JSON.stringify({ entries: [
  { id: 'mem_demo_1', kind: 'project', text: 'Customer Portal onboarding was reviewed; validation is the next highest-value improvement.', metadata: {}, createdAt: now },
  { id: 'mem_demo_2', kind: 'decision', text: 'Keep consequential coding operations approval-gated until the operator changes policy.', metadata: {}, createdAt: now }
]}, null, 2));

console.log('\nStarting MARCUS in demo mode at http://127.0.0.1:3030');
console.log('Demo data lives in runtime-demo and does not touch your normal MARCUS runtime.\n');
const child = spawn(process.execPath, ['src/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, MARCUS_RUNTIME_DIR: demoDir, MARCUS_CONFIG_FILE: path.join(demoDir, 'config.json') }
});
child.on('exit', (code) => process.exit(code ?? 0));
