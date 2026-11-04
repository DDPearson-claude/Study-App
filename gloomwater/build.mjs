// Gloomwater build: bundles src/main.js (+ three.js) with esbuild and inlines the
// result into src/template.html, producing a single self-contained index.html
// that works offline (double-click to play).
//
// Usage:
//   node build.mjs                 full build -> index.html
//   node build.mjs --dev           unminified (readable stack traces)
//   node build.mjs --stub=a,b      replace listed src modules with a universal stub
//   node build.mjs --only=a,b      stub EVERY game module except the listed ones
//   node build.mjs --out=path      write somewhere else (e.g. tools/out/test.html)
//
// Stub-able module names: render, water, world, actors, models, fishing,
// survival, progression, ui, audio
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));

const MODULES = ['render', 'water', 'world', 'actors', 'models', 'fishing', 'survival', 'progression', 'ui', 'audio'];
let stubbed = new Set();
if (args.stub) String(args.stub).split(',').forEach(m => stubbed.add(m.trim()));
if (args.only) {
  const keep = new Set(String(args.only).split(',').map(s => s.trim()));
  MODULES.forEach(m => { if (!keep.has(m)) stubbed.add(m); });
}

const stubPlugin = {
  name: 'gw-stub',
  setup(build) {
    build.onResolve({ filter: /^\.\/(\w+)\.js$/ }, a => {
      const name = a.path.slice(2, -3);
      if (stubbed.has(name) && a.importer.endsWith('main.js')) {
        return { path: resolve(here, 'tools/stub.js') };
      }
      return null;
    });
  },
};

const dev = !!args.dev;
const result = await esbuild.build({
  entryPoints: [resolve(here, 'src/main.js')],
  bundle: true,
  format: 'esm',
  target: ['es2020'],
  minify: !dev,
  sourcemap: false,
  write: false,
  legalComments: 'none',
  loader: { '.css': 'text', '.glsl': 'text', '.svg': 'text' },
  plugins: [stubPlugin],
  logLevel: 'warning',
});

const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const template = readFileSync(resolve(here, 'src/template.html'), 'utf8');
if (!template.includes('<!--GAME_SCRIPT-->')) throw new Error('template missing <!--GAME_SCRIPT--> marker');
const html = template.replace('<!--GAME_SCRIPT-->', () => `<script type="module">\n${js}\n</script>`);
const out = resolve(here, args.out ? String(args.out) : 'index.html');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`built ${out} (${(html.length / 1024).toFixed(0)} KB)${stubbed.size ? ' stubbed: ' + [...stubbed].join(',') : ''}${dev ? ' [dev]' : ''}`);
