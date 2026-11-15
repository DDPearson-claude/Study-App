#!/usr/bin/env node
// The Evenland world map: generator.
//
//   node tools/world-map/build.mjs              bake the terrain, write the page, render the PNGs
//   node tools/world-map/build.mjs --page       reuse the cached bake; rewrite the page and the PNGs
//   node tools/world-map/build.mjs --no-shots   skip the Playwright renders
//
// Reads tools/world-map/canon.mjs (the world as data, from docs/loop/WORLD.md and LORE.md) and writes,
// all under tools/out/world/ (untracked):
//   world-map.html     the page, in the Artifact host's format (no doctype/html/head/body; one file)
//   preview.html       the same page wrapped in the host's skeleton, for local viewing and the renders
//   map-desktop.png    1600 px wide       map-phone.png   390 px wide viewport
//   map-journey.png    the route at 16 maps owned
//   cache/             the baked world image and page data, so --page is fast
// Deterministic: seeded by canon.mjs SEED. Needs Playwright's Chromium (it inks the world image
// on a canvas and encodes it as WebP).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SHEET, SEED, CURRENTS } from './canon.mjs';
import { buildTerrain, GS } from './terrain.mjs';
import { buildInk } from './ink.mjs';
import { buildPageData, buildMasks } from './pagedata.mjs';
import { renderShots } from './shots.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../out/world');
const cacheDir = path.join(outDir, 'cache');
fs.mkdirSync(cacheDir, { recursive: true });
const args = new Set(process.argv.slice(2));
const BS = 2.8; // baked pixels per chart unit
const log = (s) => console.log(s);
const dataUriToBuf = (u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64');

async function bake() {
  log('terrain');
  const T = buildTerrain(log);
  log('hydrology check (computed flow against the WORLD.md courses):');
  for (const c of T.checks) log(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.id}${c.reached != null ? `  reached ${c.reached}  max deviation ${c.maxDev} units${c.left ? `  left the course near ${c.left}` : ''}` : ''}`);
  log('ink');
  const K = buildInk(T, log);
  log('page data');
  const data = buildPageData(T);
  const masks = buildMasks(T);

  log('bake (Chromium)');
  const crops = { kingdom: [330, 150, 340, 340], west: [90, 180, 300, 330], south: [540, 820, 420, 320], step: [120, 720, 330, 330], fold: [100, 560, 600, 240], gap: [180, 960, 420, 330], east: [600, 200, 380, 500] };
  const files = {
    '/bake.html': ['text/html', '<!doctype html><meta charset="utf-8"><script src="/bake-client.js"></script>'],
    '/bake-client.js': ['text/javascript', fs.readFileSync(path.join(here, 'bake-client.js'))],
    '/meta.json': ['application/json', JSON.stringify({ W: T.W, H: T.H, x0: T.x0, y0: T.y0, UW: T.UW, UH: T.UH, BS, GS, quality: 0.9, seed: SEED, pw: K.pw, ph: K.ph, currents: CURRENTS, crops, toneW: masks.tw, toneH: masks.th })],
    '/vec.json': ['application/json', JSON.stringify(K.vec)],
    '/base.bin': ['application/octet-stream', Buffer.from(K.base.buffer)],
    '/glyphs.bin': ['application/octet-stream', Buffer.from(K.glyphArr.buffer)],
    '/hach.bin': ['application/octet-stream', Buffer.from(K.hachArr.buffer)],
    '/paper.bin': ['application/octet-stream', Buffer.from(K.paper.buffer)],
  };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', (m) => log('  [page] ' + m.text()));
  page.on('pageerror', (e) => log('  [page error] ' + e.message));
  await page.route('http://gw.local/**', (route) => {
    const f = files[new URL(route.request().url()).pathname];
    if (!f) return route.fulfill({ status: 404, body: 'no' });
    return route.fulfill({ status: 200, contentType: f[0], body: f[1] });
  });
  await page.goto('http://gw.local/bake.html');
  const out = await page.evaluate(() => window.bake());
  await browser.close();
  fs.writeFileSync(path.join(cacheDir, 'world.webp'), dataUriToBuf(out.world));
  fs.writeFileSync(path.join(cacheDir, 'paper.jpg'), dataUriToBuf(out.paper));
  fs.writeFileSync(path.join(cacheDir, 'preview.jpg'), dataUriToBuf(out.preview));
  for (const [name, uri] of Object.entries(out.crops)) fs.writeFileSync(path.join(cacheDir, `crop-${name}.jpg`), dataUriToBuf(uri));
  fs.writeFileSync(path.join(cacheDir, 'masks.png'), masks.png);
  data.world = { w: out.size[0], h: out.size[1], bs: BS };
  data.masks = { cols: masks.cols, rows: masks.rows, tw: masks.tw, th: masks.th, unit: masks.unit };
  data.checks = T.checks;
  data.tone = out.tone;
  fs.writeFileSync(path.join(cacheDir, 'data.json'), JSON.stringify(data));
  log(`  world image ${out.size[0]}x${out.size[1]}, ${(fs.statSync(path.join(cacheDir, 'world.webp')).size / 1e6).toFixed(2)} MB`);
}

function assemble() {
  const data = JSON.parse(fs.readFileSync(path.join(cacheDir, 'data.json'), 'utf8'));
  const uri = (file, type) => `data:${type};base64,${fs.readFileSync(path.join(cacheDir, file)).toString('base64')}`;
  let html = fs.readFileSync(path.join(here, 'page/template.html'), 'utf8');
  const js = fs.readFileSync(path.join(here, 'page/app.js'), 'utf8');
  if (js.includes('</script')) throw new Error('page/app.js must not contain a closing script tag');
  const sub = (key, value) => { if (!html.includes(key)) throw new Error('template is missing ' + key); html = html.split(key).join(value); };
  sub('/*__APP__*/', js);
  sub('"__DATA__"', JSON.stringify(data).replace(/</g, '\\u003c'));
  sub('__WORLD_URI__', uri('world.webp', 'image/webp'));
  sub('__PAPER_URI__', uri('paper.jpg', 'image/jpeg'));
  sub('__MASKS_URI__', uri('masks.png', 'image/png'));
  for (const bad of ['<!doctype', '<html', '<head', '<body']) if (new RegExp(bad + '[\s>]', 'i').test(html)) throw new Error('the page must not contain ' + bad);
  fs.writeFileSync(path.join(outDir, 'world-map.html'), html);
  // the host wraps the page like this (charset, viewport with viewport-fit=cover, a small reset)
  const skeleton = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${html}</body></html>`;
  fs.writeFileSync(path.join(outDir, 'preview.html'), skeleton);
  const mb = fs.statSync(path.join(outDir, 'world-map.html')).size / 1e6;
  log(`page: ${path.join(outDir, 'world-map.html')}  ${mb.toFixed(2)} MB`);
  if (mb > 12) throw new Error('the page is over 12 MB');
}

const t0 = Date.now();
if (!args.has('--page') || !fs.existsSync(path.join(cacheDir, 'data.json'))) await bake();
if (!args.has('--bake-only')) {
  assemble();
  if (!args.has('--no-shots')) await renderShots(chromium, outDir, log);
}
log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
