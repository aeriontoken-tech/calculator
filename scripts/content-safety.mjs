import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const prohibited = JSON.parse(
  fs.readFileSync(path.join(root, 'prohibited-marketing-phrases.json'), 'utf8'),
);

const include = new Set(['.ts', '.tsx', '.css', '.md']);
const ignore = new Set(['node_modules', '.next', '.git', 'coverage']);

function collect(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignore.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collect(full);
    if (!include.has(path.extname(entry.name))) return [];
    return [full];
  });
}

const failures = [];
for (const file of collect(root)) {
  const rel = path.relative(root, file);
  if (rel === path.join('scripts', 'content-safety.mjs')) continue;
  if (rel === 'prohibited-marketing-phrases.json') continue;
  if (rel.endsWith('.test.ts') || rel.endsWith('.test.tsx')) continue;
  const text = fs.readFileSync(file, 'utf8').toLowerCase();
  for (const phrase of prohibited) {
    if (text.includes(phrase.toLowerCase())) failures.push(`${rel}: contains "${phrase}"`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Content safety scan passed');
