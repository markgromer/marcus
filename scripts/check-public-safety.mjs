import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const bannedLiterals = [
  'markgromer',
  'mark gromer',
  'c:\\users\\markg',
  'task-tracker-5wsa',
  'scoop doggy logs',
  'poopsites',
  'fastfoodsms',
  'titan syndicate'
];
const secretPatterns = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/
];

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
const failures = [];
for (const file of files) {
  if (/\.(png|jpe?g|gif|webp|ico|woff2?|zip|pdf)$/i.test(file)) continue;
  let text;
  try { text = await fs.readFile(file, 'utf8'); } catch { continue; }
  const lower = text.toLowerCase();
  for (const literal of bannedLiterals) if (lower.includes(literal)) failures.push(`${file}: contains banned extraction literal "${literal}"`);
  for (const pattern of secretPatterns) if (pattern.test(text)) failures.push(`${file}: matches possible credential pattern ${pattern}`);
}
if (files.some((file) => file === '.env' || file.startsWith('runtime/') || file.startsWith('data/'))) failures.push('Runtime or .env data is tracked by git.');
if (failures.length) {
  console.error('Public-safety check failed:\n' + failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log(`Public-safety check passed across ${files.length} tracked files.`);
