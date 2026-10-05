#!/usr/bin/env node
// Builds app/ into one self-contained page: dist/my-university.html
// Usage: node tools/build.mjs [--out path]
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, 'app');
const outArg = process.argv.indexOf('--out');
const out = outArg > 0 ? resolve(process.argv[outArg + 1]) : join(root, 'dist', 'my-university.html');

const read = (p) => readFileSync(p, 'utf8');
const listed = (dir, ext) => existsSync(dir)
  ? readdirSync(dir).filter((f) => f.endsWith(ext)).sort().map((f) => join(dir, f))
  : [];

let sha = 'dev';
try { sha = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch {}
const build = new Date().toISOString().slice(0, 10) + '-' + sha;

const kitJs = read(join(app, 'kit', 'kit.js'));
const kitCss = read(join(app, 'kit', 'kit.css'));

// --only 00,10,20,32  builds with just the JS/CSS files whose names start with those prefixes
// (for testing one module while others are mid-edit). Core files 00/10/20 are always included.
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > 0 ? ['00', '10', '20'].concat(process.argv[onlyArg + 1].split(',')) : null;
const pick = (f) => !only || only.some((p) => f.split(/[\\/]/).pop().startsWith(p));
const css = listed(join(app, 'src', 'css'), '.css').filter(pick).map((f) => `/* ${f.slice(app.length + 1)} */\n` + read(f)).join('\n');
let js = listed(join(app, 'src', 'js'), '.js').filter(pick).map((f) => `// ---- ${f.slice(app.length + 1)} ----\n` + read(f)).join('\n');
if (only && !js.includes('"@@KIT_JS@@"')) js += '\n' + read(join(app, 'src', 'js', '32-sandbox.js'));

const replacements = {
  '"@@KIT_JS@@"': JSON.stringify(kitJs),
  '"@@KIT_CSS@@"': JSON.stringify(kitCss),
  '"@@BUILD@@"': JSON.stringify(build),
};
for (const [k, v] of Object.entries(replacements)) {
  if (!js.includes(k)) throw new Error(`placeholder ${k} missing from app/src/js`);
  js = js.split(k).join(v);
}
// A literal </script> inside the bundle would end the script element early.
js = js.replace(/<\/script/gi, '<\\/script');

const html = [
  read(join(app, 'src', 'head.html')).trim(),
  '<style>',
  css,
  '</style>',
  read(join(app, 'src', 'body.html')).trim(),
  '<script>',
  '"use strict";',
  js,
  '</script>',
  '',
].join('\n');

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`built ${out.slice(root.length + 1)} (${kb} KB, build ${build})`);
