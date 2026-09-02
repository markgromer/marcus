import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { loadConfig, publicConfig, saveConfig, DEFAULT_CONFIG } from './config.js';
import { buildSystemPrompt } from './core/prompt-builder.js';
import { runChat } from './providers/chat/index.js';
import { listProjects, upsertProject } from './projects/registry.js';
import { recentMemory, remember, searchMemory } from './memory/local-memory.js';
import { approveOperation, createOperation, executeOperation, getOperation, listOperations } from './operations/engine.js';
import { detectEnvironment, discoverProjects } from './system/detect.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const host = process.env.MARCUS_HOST || '127.0.0.1';
const port = Number(process.env.MARCUS_PORT || 3030);
const adminToken = String(process.env.MARCUS_ADMIN_TOKEN || '');
const isLoopbackHost = ['127.0.0.1', 'localhost', '::1'].includes(host);

if (!adminToken) console.warn('WARNING: MARCUS_ADMIN_TOKEN is not configured. Remote API requests will be denied until setup is completed.');
if (!isLoopbackHost && !adminToken) throw new Error('Refusing non-loopback bind without MARCUS_ADMIN_TOKEN.');

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

function isLocalRequest(req) {
  const ip = String(req.ip || req.socket?.remoteAddress || '');
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

function tokenMatches(candidate) {
  if (!adminToken || !candidate) return false;
  const a = Buffer.from(adminToken);
  const b = Buffer.from(candidate);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAdmin(req, res, next) {
  if (isLoopbackHost && isLocalRequest(req)) return next();
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const token = String(req.headers['x-marcus-token'] || bearer || '');
  if (!tokenMatches(token)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

async function configured() {
  try {
    const config = await loadConfig();
    return Boolean(config.operator?.name);
  } catch { return false; }
}

app.get('/api/health', async (req, res) => {
  res.json({ ok: true, configured: await configured(), host, version: '0.2.0', local: isLocalRequest(req) });
});

app.get('/api/bootstrap', async (req, res, next) => {
  try {
    if (!isLoopbackHost || !isLocalRequest(req)) return res.status(403).json({ error: 'Bootstrap is only available from the local machine.' });
    const environment = await detectEnvironment();
    const config = await loadConfig({ required: false });
    res.json({ configured: Boolean(config.operator?.name), environment, config: publicConfig(config) });
  } catch (error) { next(error); }
});

app.post('/api/setup', async (req, res, next) => {
  try {
    if (!isLoopbackHost || !isLocalRequest(req)) return res.status(403).json({ error: 'First-run setup is local-only.' });
    const body = req.body || {};
    const operatorName = String(body.operatorName || '').trim();
    if (!operatorName) return res.status(400).json({ error: 'Your name is required.' });
    const roots = Array.isArray(body.workspaceRoots) ? body.workspaceRoots.map((item) => path.resolve(String(item))).filter(Boolean) : [];
    const chatProvider = ['openai', 'anthropic'].includes(body.chatProvider) ? body.chatProvider : 'openai';
    const codingProvider = ['claude', 'codex'].includes(body.codingProvider) ? body.codingProvider : 'claude';
    const config = structuredClone(DEFAULT_CONFIG);
    config.assistant.name = String(body.assistantName || 'MARCUS').trim() || 'MARCUS';
    config.operator = {
      name: operatorName,
      role: String(body.role || '').trim(),
      workingStyle: String(body.workingStyle || 'Direct, evidence-first, and action-oriented').trim(),
      priorities: Array.isArray(body.priorities) ? body.priorities.map(String).map((v) => v.trim()).filter(Boolean) : []
    };
    config.organizations = Array.isArray(body.organizations) ? body.organizations.map(String).map((v) => v.trim()).filter(Boolean) : [];
    config.chat = { provider: chatProvider, model: String(body.model || '').trim() };
    config.coding = { provider: codingProvider, claudePermissionMode: 'acceptEdits' };
    config.security = { approvalMode: 'consequential', allowedWorkspaceRoots: roots };
    const saved = await saveConfig(config);
    res.status(201).json({ ok: true, config: publicConfig(saved) });
  } catch (error) { next(error); }
});

app.use('/api', requireAdmin);

app.get('/api/config', async (_req, res, next) => {
  try { res.json(publicConfig(await loadConfig())); } catch (error) { next(error); }
});

app.get('/api/environment', async (_req, res, next) => {
  try { res.json(await detectEnvironment()); } catch (error) { next(error); }
});

app.get('/api/discover-projects', async (req, res, next) => {
  try {
    const root = String(req.query.root || '').trim();
    if (!root) return res.status(400).json({ error: 'root is required' });
    const config = await loadConfig({ required: false });
    const allowed = config.security?.allowedWorkspaceRoots || [];
    const resolved = path.resolve(root);
    const permitted = allowed.length === 0 || allowed.some((candidate) => resolved === candidate || resolved.startsWith(`${candidate}${path.sep}`));
    if (!permitted) return res.status(403).json({ error: 'That folder is outside the configured workspace roots.' });
    res.json({ root: resolved, projects: await discoverProjects(resolved, 3) });
  } catch (error) { next(error); }
});

app.post('/api/import-projects', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.projects) ? req.body.projects : [];
    const imported = [];
    for (const item of items.slice(0, 100)) {
      if (!item?.name || !item?.path) continue;
      imported.push(await upsertProject({ name: item.name, path: item.path, repository: item.path, status: 'active', kind: item.kind || 'project' }));
    }
    res.status(201).json({ imported });
  } catch (error) { next(error); }
});

app.get('/api/dashboard', async (_req, res, next) => {
  try {
    const [projects, operations, memory] = await Promise.all([listProjects(), listOperations(20), recentMemory(8)]);
    const needsYou = operations.filter((op) => ['pending_approval', 'awaiting_approval'].includes(op.status));
    const active = operations.filter((op) => ['running', 'approved', 'prepared'].includes(op.status));
    res.json({
      projects,
      operations,
      needsYou,
      active,
      recent: memory,
      counts: { projects: projects.length, needsYou: needsYou.length, active: active.length }
    });
  } catch (error) { next(error); }
});

app.get('/api/projects', async (_req, res, next) => {
  try { res.json({ projects: await listProjects() }); } catch (error) { next(error); }
});

app.post('/api/projects', async (req, res, next) => {
  try { res.status(201).json(await upsertProject(req.body || {})); } catch (error) { next(error); }
});

app.get('/api/memory', async (req, res, next) => {
  try {
    const query = String(req.query.q || '');
    const entries = query ? await searchMemory(query, 20) : await recentMemory(20);
    res.json({ entries });
  } catch (error) { next(error); }
});

app.post('/api/chat', async (req, res, next) => {
  try {
    const input = String(req.body?.message || '').trim();
    if (!input) return res.status(400).json({ error: 'message is required' });
    const config = await loadConfig();
    const baseSystem = await buildSystemPrompt(config);
    const projects = await listProjects();
    const memory = await recentMemory(12);
    const context = `\n\n## Current local context\nProjects: ${JSON.stringify(projects.map(({ id, name, status, repository }) => ({ id, name, status, repository })))}\nRecent memory: ${JSON.stringify(memory.map(({ kind, text, createdAt }) => ({ kind, text, createdAt })))}`;
    const answer = await runChat({ config, system: `${baseSystem}${context}`, input });
    await remember({ kind: 'conversation', text: `USER: ${input}\nASSISTANT: ${answer}` });
    res.json({ answer });
  } catch (error) { next(error); }
});

app.get('/api/operations', async (req, res, next) => {
  try { res.json({ operations: await listOperations(req.query.limit) }); } catch (error) { next(error); }
});

app.get('/api/operations/:id', async (req, res, next) => {
  try {
    const operation = await getOperation(req.params.id);
    if (!operation) return res.status(404).json({ error: 'Not found' });
    res.json(operation);
  } catch (error) { next(error); }
});

app.post('/api/operations', async (req, res, next) => {
  try { res.status(201).json(await createOperation(req.body || {}, await loadConfig())); } catch (error) { next(error); }
});

app.post('/api/operations/:id/approve', async (req, res, next) => {
  try { res.json(await approveOperation(req.params.id, req.body?.approvedBy || 'operator')); } catch (error) { next(error); }
});

app.post('/api/operations/:id/execute', async (req, res, next) => {
  try { res.json(await executeOperation(req.params.id, await loadConfig())); } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = /not configured/i.test(error.message || '') ? 409 : 500;
  res.status(status).json({ error: error.message || 'Internal error', operation: error.operation || undefined });
});

app.listen(port, host, () => console.log(`MARCUS listening on http://${host}:${port}`));
