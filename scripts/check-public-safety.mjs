import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

// Build extraction-specific markers from fragments so this checker does not flag its own source.
// The public GitHub owner/login and legal license attribution are intentionally allowed;
// private operator identity inside runtime/product data and machine-specific data are not.
const bannedLiterals = [
  ['mark', ' ', 'gromer'].join(''),
  ['c:', '\\\\', 'users', '\\\\', 'markg'].join(''),
  ['task', '-tracker-', '5wsa'].join(''),
  ['scoop', ' doggy ', 'logs'].join(''),
  ['poop', 'sites'].join(''),
  ['fast', 'food', 'sms'].join(''),
  ['titan', ' syndicate'].join('')
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
  if (file !== 'LICENSE') {
    for (const literal of bannedLiterals) if (lower.includes(literal)) failures.push(`${file}: contains operator-specific extraction data`);
  }
  for (const pattern of secretPatterns) if (pattern.test(text)) failures.push(`${file}: matches a possible credential pattern`);
}
if (files.some((file) => file === '.env' || file.startsWith('runtime/') || file.startsWith('runtime-demo/') || file.startsWith('data/'))) failures.push('Runtime or .env data is tracked by git.');
if (failures.length) {
  console.error('Public-safety check failed:\n' + failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log(`Public-safety check passed across ${files.length} tracked files.`);
