#!/usr/bin/env node
// The Waxwold world map: generator.
//
//   node tools/world-map/build.mjs              bake the terrain, write the page, render the PNGs
//   node tools/world-map/build.mjs --page       reuse the cached bake; rewrite the page and the PNGs
//   node tools/world-map/build.mjs --no-shots   skip the Playwright renders
//   node tools/world-map/build.mjs --bake-only  bake and report, write no page
//   node tools/world-map/road.mjs               only the route rule on canon.mjs's courses (no bake, a second)
//   node tools/world-map/build.mjs --game [--sheets=1] [--spike]
//                                               the game export: the shipped sheets into src/chart-art.js (game.mjs)
//
// Reads tools/world-map/canon.mjs (the world as data, from docs/loop/WORLD.md and LORE.md) and writes,
// all under tools/out/world/ (untracked):
//   world-map.html     the page, in the Artifact host's format (no doctype/html/head/body; one file)
//   preview.html       the same page wrapped in the host's skeleton, for local viewing and the renders
//   map-desktop.png    1600 px wide       map-phone.png   390 px wide viewport
//   map-journey.png    the route at 16 maps owned, the raft on its last leg
//   checks/            close looks and behaviour checks (wheel, drag, pinch, tap, slider, journey, reduced
//                      motion, 1280 px in the light scheme, a phone on its side)
//   cache/             the baked world image and page data, so --page is fast; crops and a preview of the bake
// The build's checks. The route rule (WORLD.md §6.1, road.mjs): the Lamp Road only goes forward. It is
// checked on canon.mjs's courses before anything is baked, and again on the road as the chart draws it; each
// prints a per-leg table, and a failure of either STOPS the build with no page written. The bake prints two
// more: that computed flow follows each named river's WORLD.md course, and that the green ink round the
// sixteen waters never steps back along the road (the greening ramp, measured on the finished image); the
// renders print the page's behaviour checks. A failure of any of those still writes the outputs, to be
// looked at, and the build ends with a non-zero exit code. Deterministic: seeded by canon.mjs SEED; two
// bakes give the same bytes. Needs Playwright's Chromium (it inks the world image on a canvas and encodes
// it as WebP).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SHEET, SEED, CURRENTS, WATERS } from './canon.mjs';
import { buildTerrain, GS } from './terrain.mjs';
import { buildInk } from './ink.mjs';
import { buildPageData, buildMasks } from './pagedata.mjs';
import { renderShots } from './shots.mjs';
import { canonLegs, drawnLegs, checkRoad, reportRoad } from './road.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../out/world');
const cacheDir = path.join(outDir, 'cache');
fs.mkdirSync(cacheDir, { recursive: true });
const args = new Set(process.argv.slice(2));
const BS = 2.6; // baked pixels per chart unit
const failures = []; // checks that failed without stopping the build
const log = (s) => { console.log(s); if (/^\s*(\[page\] )?FAIL\b/.test(s)) failures.push(s.trim()); };
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
  for (const s of data.strays) log('  WARNING ' + s);
  if (!data.strays.length) log('  sea legs keep to the sea (up to six units at a river mouth count as the join)');
  const masks = buildMasks(T);

  // where the greening ramp is measured: the land within 26 units of each water (the Last Light is open
  // sea, so its green is read on the fjord coast it sails from)
  const ramp = WATERS.map((w) => (w.n === 7 ? [156, 440, 30] : [w.at[0], w.at[1], 26]));
  log('bake (Chromium)');
  const crops = { kingdom: [330, 150, 340, 340], west: [70, 170, 320, 340], south: [540, 820, 440, 330], step: [110, 720, 340, 330], fold: [60, 540, 640, 260], gap: [180, 960, 420, 330], east: [600, 100, 440, 560], low: [380, 1120, 420, 300],
    thin: [110, 180, 200, 170], pyre: [80, 430, 320, 230], inkwood: [680, 850, 230, 200] };
  const files = {
    '/bake.html': ['text/html', '<!doctype html><meta charset="utf-8"><script src="/bake-client.js"></script>'],
    '/bake-client.js': ['text/javascript', fs.readFileSync(path.join(here, 'bake-client.js'))],
    '/meta.json': ['application/json', JSON.stringify({ W: T.W, H: T.H, x0: T.x0, y0: T.y0, UW: T.UW, UH: T.UH, BS, GS, quality: 0.9, seed: SEED, pw: K.pw, ph: K.ph, currents: CURRENTS, crops, ramp })],
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
  data.edges = masks.edges;
  data.checks = T.checks;
  fs.writeFileSync(path.join(cacheDir, 'data.json'), JSON.stringify(data));
  log(`  world image ${out.size[0]}x${out.size[1]}, ${(fs.statSync(path.join(cacheDir, 'world.webp')).size / 1e6).toFixed(2)} MB`);
  log(`greening ramp (green ink, per cent of the land round each water, in unlock order):`);
  log('  ' + out.ramp.map((v, i) => `${i + 1}:${v}`).join('  '));
  const back = out.ramp.map((v, i) => (i > 0 && v < out.ramp[i - 1] - 0.4 ? i + 1 : 0)).filter(Boolean);
  log(back.length ? `  FAIL the ramp steps back at water ${back.join(', ')}` : '  ok   every water is at least as green as the one before');
}

// The bundling step (docs/loop/M1.md §3.1): the page's drawing is the game's src/chart-draw.js, an ES module; the page is one
// classic script, so the module is bundled into it as the global ChartDraw ahead of page/app.js. One code draws both.
export async function chartDrawBundle() {
  const esbuild = await import('esbuild');
  const r = await esbuild.build({ entryPoints: [path.resolve(here, '../../src/chart-draw.js')], bundle: true, format: 'iife', globalName: 'ChartDraw', target: ['es2020'], write: false, legalComments: 'none', logLevel: 'silent' });
  const js = r.outputFiles[0].text;
  if (js.includes('</script')) throw new Error('src/chart-draw.js must not contain a closing script tag');
  return js;
}

async function assemble() {
  const data = JSON.parse(fs.readFileSync(path.join(cacheDir, 'data.json'), 'utf8'));
  for (const k of ['strays', 'checks']) delete data[k]; // build-time reports, not page data
  const uri = (file, type) => `data:${type};base64,${fs.readFileSync(path.join(cacheDir, file)).toString('base64')}`;
  let html = fs.readFileSync(path.join(here, 'page/template.html'), 'utf8');
  const js = fs.readFileSync(path.join(here, 'page/app.js'), 'utf8');
  if (js.includes('</script')) throw new Error('page/app.js must not contain a closing script tag');
  const sub = (key, value) => { if (!html.includes(key)) throw new Error('template is missing ' + key); html = html.split(key).join(value); };
  sub('/*__APP__*/', `${await chartDrawBundle()}\n${js}`);
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
// the route rule, first on the courses as WORLD.md gives them: a road that goes back on itself is not baked
if (!reportRoad(checkRoad(canonLegs(), { reach: 6, stated: true }), 'the route rule (WORLD.md §6.1), on the canon courses', log)) {
  console.error('the build stops: the Lamp Road in canon.mjs breaks the route rule');
  process.exit(1);
}
// the game export (docs/loop/M1.md §3.7): the shipped sheets' crops and live data into src/chart-art.js, and nothing else
if (args.has('--game')) {
  const { gameExport } = await import('./game.mjs');
  const res = await gameExport({ chromium, args, log });
  log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (!res.ok) { console.error('the game export stops: ' + (res.error || 'a check failed')); process.exit(1); }
  process.exit(failures.length ? 1 : 0);
}
if (!args.has('--page') || !fs.existsSync(path.join(cacheDir, 'data.json'))) await bake();
// and then on the road as the chart draws it (the meandered rivers, the finished coast): no page is written
// for a drawn road that breaks the rule
{
  const data = JSON.parse(fs.readFileSync(path.join(cacheDir, 'data.json'), 'utf8'));
  if (!reportRoad(checkRoad(drawnLegs(data), { reach: 8 }), 'the route rule, on the road as drawn', log)) {
    console.error('the build stops: the drawn Lamp Road breaks the route rule');
    process.exit(1);
  }
}
if (!args.has('--bake-only')) {
  await assemble();
  if (!args.has('--no-shots')) await renderShots(chromium, outDir, log);
}
log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (failures.length) {
  console.error(`${failures.length} check${failures.length === 1 ? '' : 's'} failed:`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
