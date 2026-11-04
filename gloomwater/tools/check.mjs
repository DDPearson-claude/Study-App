// Fast node-only checks (no browser), ~1–2 s:
//   node tools/check.mjs            data validation + unit tests + a bundle smoke build
//   node tools/check.mjs --quick    skip the bundle build
// Runs tools/validate-data.mjs (data.js integrity), every tools/tests/*.test.mjs (pure-logic suites:
// progression with a fake ctx, world layout / depth / reachability / dock rotation), and bundles
// src/main.js with esbuild in memory so syntax or import errors anywhere fail fast. Exits 1 on any
// failure.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const quick = process.argv.includes('--quick');
const results = [];

function run(label, file, args = []) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [file, ...args], { cwd: root, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const ok = r.status === 0;
  const tail = out.trim().split('\n').filter(Boolean);
  const summary = tail.slice(-1)[0] || '';
  results.push({ label, ok, ms: Date.now() - t0, summary });
  if (!ok) console.log(`\n--- ${label} output ---\n${tail.slice(-40).join('\n')}\n`);
}

run('validate-data', resolve(here, 'validate-data.mjs'));
for (const f of readdirSync(resolve(here, 'tests')).filter((f) => f.endsWith('.test.mjs')).sort()) run(`tests/${f}`, resolve(here, 'tests', f));

if (!quick) {
  const t0 = Date.now();
  try {
    const esbuild = await import('esbuild');
    await esbuild.build({
      entryPoints: [resolve(root, 'src/main.js')], bundle: true, format: 'esm', target: ['es2020'], write: false,
      loader: { '.css': 'text', '.glsl': 'text', '.svg': 'text' }, logLevel: 'silent',
    });
    results.push({ label: 'bundle (esbuild)', ok: true, ms: Date.now() - t0, summary: 'src/main.js bundles' });
  } catch (e) {
    results.push({ label: 'bundle (esbuild)', ok: false, ms: Date.now() - t0, summary: String(e?.message || e).split('\n').slice(0, 6).join(' | ') });
  }
}

console.log('\n=== gloomwater check ===');
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.label.padEnd(30)} ${String(r.ms).padStart(5)} ms  ${r.summary}`);
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n${failed.length} check(s) failed` : '\nall checks passed');
process.exit(failed.length ? 1 : 0);
