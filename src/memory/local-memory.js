import path from 'node:path';
import crypto from 'node:crypto';
import { JsonStore } from '../state/json-store.js';
import { runtimeDir } from '../config.js';

const store = new JsonStore(path.join(runtimeDir, 'memory.json'), { entries: [] });

export async function remember({ kind = 'conversation', text, metadata = {} }) {
  const entry = { id: `mem_${crypto.randomUUID()}`, kind, text: String(text || '').slice(0, 20000), metadata, createdAt: new Date().toISOString() };
  await store.update((state) => ({ ...state, entries: [...(state.entries || []), entry].slice(-5000) }));
  return entry;
}

export async function recentMemory(limit = 20) {
  const entries = (await store.read()).entries || [];
  return entries.slice(-Math.max(1, Math.min(Number(limit) || 20, 100)));
}

export async function searchMemory(query, limit = 10) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return recentMemory(limit);
  const entries = (await store.read()).entries || [];
  return entries.filter((entry) => `${entry.text} ${JSON.stringify(entry.metadata)}`.toLowerCase().includes(q)).slice(-limit).reverse();
}
