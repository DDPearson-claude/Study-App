#!/usr/bin/env node
// Runs every browser test script in tests/e2e (*.spec.mjs) one after another, after a fresh
// build. Each spec is a plain node script that exits non-zero on failure.
// Usage: node tests/e2e/run.mjs [filter]
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const filter = process.argv[2] || '';

const build = spawnSync(process.execPath, [join(root, 'tools', 'build.mjs')], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);

const specs = readdirSync(here).filter((f) => f.endsWith('.spec.mjs') && f.includes(filter)).sort();
const results = [];
for (const spec of specs) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [join(here, spec)], { stdio: 'inherit', cwd: root, timeout: 15 * 60 * 1000 });
  results.push({ spec, ok: r.status === 0, s: ((Date.now() - t0) / 1000).toFixed(1) });
}
console.log('\n' + results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.spec}  (${r.s}s)`).join('\n'));
process.exit(results.every((r) => r.ok) ? 0 : 1);
