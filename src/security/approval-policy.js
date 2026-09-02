import crypto from 'node:crypto';

const READ_ONLY = new Set(['project.read', 'memory.search', 'status.read']);
const HIGH_IMPACT = new Set(['coding.task', 'external.send', 'deploy', 'publish', 'git.push', 'git.merge', 'delete', 'billing.change']);

export function riskFor(type) {
  if (READ_ONLY.has(type)) return 'low';
  if (HIGH_IMPACT.has(type)) return 'high';
  return 'medium';
}

export function requiresApproval(type, mode = 'consequential') {
  if (mode === 'all') return true;
  if (mode === 'none') return false;
  return riskFor(type) !== 'low';
}

export function operationDigest(operation) {
  const canonical = JSON.stringify({ type: operation.type, projectId: operation.projectId || null, payload: operation.payload || {} });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}
