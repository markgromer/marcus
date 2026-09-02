import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { loadConfig, publicConfig } from './config.js';
import { buildSystemPrompt } from './core/prompt-builder.js';
import { runChat } from './providers/chat/index.js';
import { listProjects, upsertProject } from './projects/registry.js';
import { recentMemory, remember, searchMemory } from './memory/local-memory.js';
import { approveOperation, createOperation, executeOperation, getOperation, listOperations } from './operations/engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const host = process.env.MARCUS_HOST || '127.0.0.1';
const port = Number(process.env.MARCUS_PORT || 3030);
const adminToken = String(process.env.MARCUS_ADMIN_TOKEN || '');

if (!adminToken) console.warn('WARNING: MARCUS_ADMIN_TOKEN is not configured. API requests will be denied until setup is completed.');
if (!['127.0.0.1', 'localhost', '::1'].includes(host) && !adminToken) throw new Error('Refusing non-loopback bind without MARCUS_ADMIN_TOKEN.');

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

function tokenMatches(candidate) {
  if (!adminToken || !candidate) return false;
  const a = Buffer.from(adminToken);
  const b = Buffer.from(candidate);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAdmin(req, res, next) {
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const token = String(req.headers['x-marcus-token'] || bearer || '');
  if (!tokenMatches(token)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/health', async (_req, res) => {
  let configured = true;
  try { await loadConfig(); } catch { configured = false; }
  res.json({ ok: true, configured, host, version: '0.1.0' });
});

app.use('/api', requireAdmin);

app.get('/api/config', async (_req, res, next) => {
  try { res.json(publicConfig(await loadConfig())); } catch (error) { next(error); }
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
  res.status(500).json({ error: error.message || 'Internal error', operation: error.operation || undefined });
});

app.listen(port, host, () => console.log(`MARCUS listening on http://${host}:${port}`));
