import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSystemPrompt } from '../src/core/prompt-builder.js';

test('system prompt is personalized from runtime configuration', async () => {
  const prompt = await buildSystemPrompt({
    assistant: { name: 'ATLAS' },
    operator: { name: 'Alex', role: 'Builder', workingStyle: 'Concise', priorities: ['shipping', 'quality'] }
  });
  assert.match(prompt, /ATLAS CORE SYSTEM/);
  assert.match(prompt, /Alex/);
  assert.match(prompt, /Builder/);
  assert.doesNotMatch(prompt, /\{\{/);
});
