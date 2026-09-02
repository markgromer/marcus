import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { DEFAULT_CONFIG, saveConfig } from '../src/config.js';

const rl = readline.createInterface({ input, output });
const ask = async (question, fallback = '') => (await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `)).trim() || fallback;

try {
  const operatorName = await ask('Your name');
  if (!operatorName) throw new Error('Operator name is required.');
  const role = await ask('What do you do?');
  const assistantName = await ask('Assistant name', 'MARCUS');
  const workingStyle = await ask('How should the assistant work with you?', 'Direct, evidence-first, and action-oriented');
  const priorities = (await ask('Top priorities, comma separated')).split(',').map((item) => item.trim()).filter(Boolean);
  const organizations = (await ask('Businesses/organizations, comma separated')).split(',').map((item) => item.trim()).filter(Boolean);
  const chatProvider = (await ask('Chat provider: openai or anthropic', 'openai')).toLowerCase();
  const codingProvider = (await ask('Coding agent: claude or codex', 'claude')).toLowerCase();
  const rootsRaw = await ask('Allowed project parent folders, separated by semicolons');
  const roots = rootsRaw.split(';').map((item) => item.trim()).filter(Boolean).map((item) => path.resolve(item));
  const config = structuredClone(DEFAULT_CONFIG);
  config.assistant.name = assistantName;
  config.operator = { name: operatorName, role, workingStyle, priorities };
  config.organizations = organizations;
  config.chat = { provider: ['openai', 'anthropic'].includes(chatProvider) ? chatProvider : 'openai', model: '' };
  config.coding = { provider: ['claude', 'codex'].includes(codingProvider) ? codingProvider : 'claude', claudePermissionMode: 'acceptEdits' };
  config.security = { approvalMode: 'consequential', allowedWorkspaceRoots: roots };
  await saveConfig(config);

  const envPath = path.resolve('.env');
  try { await fs.access(envPath); }
  catch {
    const token = crypto.randomBytes(32).toString('hex');
    await fs.writeFile(envPath, `MARCUS_HOST=127.0.0.1\nMARCUS_PORT=3030\nMARCUS_ADMIN_TOKEN=${token}\n# Add only the provider credentials you actually use.\nOPENAI_API_KEY=\nANTHROPIC_API_KEY=\n`, { mode: 0o600 });
  }
  console.log('\nMARCUS setup complete. Add your provider credential to .env, then run `npm start`.');
} finally {
  rl.close();
}
