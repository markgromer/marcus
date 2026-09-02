import path from 'node:path';
import crypto from 'node:crypto';
import { JsonStore } from '../state/json-store.js';
import { runtimeDir } from '../config.js';
import { getProject } from '../projects/registry.js';
import { assertAllowedWorkspace } from '../security/path-guard.js';
import { operationDigest, requiresApproval, riskFor } from '../security/approval-policy.js';
import { runCodingAgent } from '../providers/coding/index.js';

const store = new JsonStore(path.join(runtimeDir, 'operations.json'), { operations: [] });

export async function listOperations(limit = 100) {
  const operations = (await store.read()).operations || [];
  return operations.slice(-Math.max(1, Math.min(Number(limit) || 100, 500))).reverse();
}

export async function getOperation(id) { return ((await store.read()).operations || []).find((item) => item.id === id) || null; }

export async function createOperation(input, config) {
  const operation = {
    id: `op_${crypto.randomUUID()}`,
    type: String(input.type || ''),
    projectId: input.projectId || null,
    payload: input.payload || {},
    risk: riskFor(String(input.type || '')),
    status: requiresApproval(String(input.type || ''), config.security?.approvalMode) ? 'awaiting_approval' : 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approval: null,
    result: null,
    error: null
  };
  if (!operation.type) throw new Error('Operation type is required.');
  operation.digest = operationDigest(operation);
  await store.update((state) => ({ ...state, operations: [...(state.operations || []), operation] }));
  return operation;
}

async function replaceOperation(next) {
  await store.update((state) => ({ ...state, operations: (state.operations || []).map((item) => item.id === next.id ? next : item) }));
  return next;
}

export async function approveOperation(id, approvedBy = 'operator') {
  const operation = await getOperation(id);
  if (!operation) throw new Error('Operation not found.');
  if (operation.status !== 'awaiting_approval') throw new Error(`Operation cannot be approved from status ${operation.status}.`);
  const digest = operationDigest(operation);
  if (digest !== operation.digest) throw new Error('Operation changed after it was prepared. Create a new approval request.');
  return replaceOperation({ ...operation, status: 'ready', approval: { digest, approvedBy, approvedAt: new Date().toISOString() }, updatedAt: new Date().toISOString() });
}

export async function executeOperation(id, config) {
  let operation = await getOperation(id);
  if (!operation) throw new Error('Operation not found.');
  if (operation.status !== 'ready') throw new Error(`Operation is not ready; current status is ${operation.status}.`);
  if (requiresApproval(operation.type, config.security?.approvalMode)) {
    if (!operation.approval || operation.approval.digest !== operationDigest(operation)) throw new Error('A matching approval is required.');
  }
  operation = await replaceOperation({ ...operation, status: 'running', updatedAt: new Date().toISOString() });
  try {
    let result;
    if (operation.type === 'coding.task') {
      const project = await getProject(operation.projectId);
      if (!project) throw new Error('Coding operation requires a registered project.');
      const cwd = await assertAllowedWorkspace(project.workspace, config.security?.allowedWorkspaceRoots || []);
      const prompt = String(operation.payload?.prompt || '').trim();
      if (prompt.length < 10) throw new Error('Coding prompt is too short.');
      result = await runCodingAgent({ prompt, cwd, config });
    } else {
      throw new Error(`Execution is not implemented for ${operation.type}. Refusing to simulate success.`);
    }
    operation = await replaceOperation({ ...operation, status: 'completed', result, error: null, updatedAt: new Date().toISOString(), completedAt: new Date().toISOString() });
    return operation;
  } catch (error) {
    operation = await replaceOperation({ ...operation, status: 'failed', error: { message: error.message, stderr: error.stderr || '' }, updatedAt: new Date().toISOString() });
    throw Object.assign(error, { operation });
  }
}
