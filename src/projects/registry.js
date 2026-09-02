import path from 'node:path';
import crypto from 'node:crypto';
import { JsonStore } from '../state/json-store.js';
import { runtimeDir } from '../config.js';

const store = new JsonStore(path.join(runtimeDir, 'projects.json'), { projects: [] });

export async function listProjects() { return (await store.read()).projects || []; }

export async function getProject(id) { return (await listProjects()).find((project) => project.id === id) || null; }

export async function upsertProject(input) {
  const now = new Date().toISOString();
  let saved;
  await store.update((state) => {
    const projects = state.projects || [];
    const id = input.id || `project_${crypto.randomUUID()}`;
    const index = projects.findIndex((project) => project.id === id);
    saved = { ...(index >= 0 ? projects[index] : {}), id, name: String(input.name || '').trim(), workspace: String(input.workspace || '').trim(), repository: String(input.repository || '').trim(), status: input.status || 'active', updatedAt: now, createdAt: index >= 0 ? projects[index].createdAt : now };
    if (!saved.name) throw new Error('Project name is required.');
    if (index >= 0) projects[index] = saved; else projects.push(saved);
    return { ...state, projects };
  });
  return saved;
}
