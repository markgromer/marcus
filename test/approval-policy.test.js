import test from 'node:test';
import assert from 'node:assert/strict';
import { operationDigest, requiresApproval, riskFor } from '../src/security/approval-policy.js';

test('read-only actions are low risk', () => {
  assert.equal(riskFor('project.read'), 'low');
  assert.equal(requiresApproval('project.read', 'consequential'), false);
});

test('coding actions require approval by default', () => {
  assert.equal(riskFor('coding.task'), 'high');
  assert.equal(requiresApproval('coding.task', 'consequential'), true);
});

test('digest changes when payload changes', () => {
  const base = { type: 'coding.task', projectId: 'p1', payload: { prompt: 'Implement the approved change.' } };
  assert.notEqual(operationDigest(base), operationDigest({ ...base, payload: { prompt: 'Deploy everything.' } }));
});
