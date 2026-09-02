import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MODULE_DIR = path.join(HERE, 'modules');
const MODULES = ['operator-profile.md', 'operating-doctrine.md', 'personality.md', 'attention-radar.md', 'execution-authority.md', 'memory-doctrine.md'];

function valueAt(object, dotted) { return dotted.split('.').reduce((value, key) => value?.[key], object); }
function render(template, context) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const value = valueAt(context, key);
    return Array.isArray(value) ? value.join(', ') : String(value ?? '');
  });
}

export async function buildSystemPrompt(config) {
  const sections = [`# ${config.assistant?.name || 'MARCUS'} CORE SYSTEM`];
  for (const file of MODULES) {
    const raw = await fs.readFile(path.join(MODULE_DIR, file), 'utf8');
    sections.push(render(raw, config));
  }
  return sections.join('\n\n').trim();
}
