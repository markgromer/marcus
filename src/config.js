import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
export const runtimeDir = path.resolve(process.env.MARCUS_RUNTIME_DIR || path.join(ROOT, 'runtime'));
export const configFile = path.resolve(process.env.MARCUS_CONFIG_FILE || path.join(runtimeDir, 'config.json'));

export const DEFAULT_CONFIG = Object.freeze({
  schemaVersion: 1,
  assistant: { name: 'MARCUS', acronym: 'Modular Autonomous Routing, Coordination & Utility System' },
  operator: { name: '', role: '', workingStyle: '', priorities: [] },
  organizations: [],
  chat: { provider: 'openai', model: '' },
  coding: { provider: 'claude', claudePermissionMode: 'acceptEdits' },
  security: { approvalMode: 'consequential', allowedWorkspaceRoots: [] },
  createdAt: null,
  updatedAt: null
});

export async function ensureRuntimeDir() {
  await fs.mkdir(runtimeDir, { recursive: true });
}

export async function loadConfig({ required = true } = {}) {
  try {
    const raw = await fs.readFile(configFile, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (error) {
    if (error?.code === 'ENOENT' && !required) return structuredClone(DEFAULT_CONFIG);
    if (error?.code === 'ENOENT') throw new Error('MARCUS is not configured. Run `npm run setup`.');
    throw error;
  }
}

export async function saveConfig(config) {
  await ensureRuntimeDir();
  const next = { ...config, schemaVersion: 1, updatedAt: new Date().toISOString() };
  if (!next.createdAt) next.createdAt = next.updatedAt;
  const tmp = `${configFile}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 });
  await fs.rename(tmp, configFile);
  return next;
}

export function publicConfig(config) {
  return {
    schemaVersion: config.schemaVersion,
    assistant: config.assistant,
    operator: { name: config.operator?.name || '', role: config.operator?.role || '' },
    organizations: config.organizations || [],
    chat: config.chat,
    coding: config.coding,
    security: { approvalMode: config.security?.approvalMode || 'consequential', workspaceRootCount: config.security?.allowedWorkspaceRoots?.length || 0 }
  };
}
