import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const envPath = path.resolve('.env');
const dataDir = path.resolve('.marcus');

await fs.mkdir(dataDir, { recursive: true });
try {
  await fs.access(envPath);
} catch {
  const token = crypto.randomBytes(32).toString('hex');
  await fs.writeFile(envPath, [
    'MARCUS_HOST=127.0.0.1',
    'MARCUS_PORT=3030',
    `MARCUS_ADMIN_TOKEN=${token}`,
    '# Add provider credentials in the browser onboarding or here.',
    'OPENAI_API_KEY=',
    'ANTHROPIC_API_KEY=',
    ''
  ].join('\n'), { mode: 0o600 });
}

console.log('\nMARCUS bootstrap complete.');
console.log('Run `npm start`, open http://127.0.0.1:3030, and finish setup in the browser.');
