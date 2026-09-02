import fs from 'node:fs/promises';
import path from 'node:path';

export class JsonStore {
  constructor(file, fallback) {
    this.file = file;
    this.fallback = fallback;
    this.queue = Promise.resolve();
  }

  async read() {
    try {
      return JSON.parse(await fs.readFile(this.file, 'utf8'));
    } catch (error) {
      if (error?.code === 'ENOENT') return structuredClone(this.fallback);
      throw error;
    }
  }

  async write(value) {
    this.queue = this.queue.then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      const bak = `${this.file}.bak`;
      try { await fs.copyFile(this.file, bak); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
      await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
      await fs.rename(tmp, this.file);
    });
    await this.queue;
    return value;
  }

  async update(mutator) {
    const current = await this.read();
    return this.write(await mutator(current));
  }
}
