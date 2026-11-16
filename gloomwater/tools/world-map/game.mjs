// The game export (docs/loop/M1.md §3.1, §3.2, §3.7): `node tools/world-map/build.mjs --game [--sheets=1] [--spike]`.
//
// For each shipped sheet it bakes that sheet's box at the game's resolution (the bake's crop viewport: never the whole world
// canvas), cuts the sheet's reveal mask into the crop as a feathered alpha, encodes it as WebP, and writes one generated module,
// src/chart-art.js: the crops as data URIs, the paper, and the live layer's data for the shipped sheets only (their road legs,
// lamps, vignette pieces, labels pinned to those sheets, the Landing, the Waystones' first arc). The game never bakes.
//
// Deterministic in its decoded pixels: two bakes are decoded in Chromium and their RGBA compared (the WebP encoder's bytes vary
// with the Playwright build); the file is re-written only when the decoded pixels change, and its header records the Chromium
// version. Its checks (any failure stops it, no file written): each crop within its budget; no label, lamp, vignette or leg of an
// unshipped sheet in the export; no name from WORLD.md §10's never list; the route rule on the road as drawn; the crop's alpha
// zero outside its sheet's mask; the two bakes' decoded pixels equal.
//
// --spike (M1.md §3.2's first commit): bake sheet 1, print its bytes at q 0.9 and 0.85, the paper's, and the minified size of
// page/app.js's drawing half, and write nothing into src/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED, WATERS, HOME, LABELS } from './canon.mjs';
import { buildTerrain, GS } from './terrain.mjs';
import { buildInk } from './ink.mjs';
import { buildPageData, buildMasks, sheetAlpha } from './pagedata.mjs';
import { checkRoad, drawnLegs, reportRoad } from './road.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const ART = path.join(root, 'src/chart-art.js');

// M1.md §3.2 (re-set by the spike): the game's resolution and each part's budget, raw bytes
export const GAME = {
  scale: { 1: 5.5 },             // px a Chart unit: reach I at 5.5 (the kingdom inset); later reaches at 2.6
  quality: 0.9,                  // WebP; the knobs, in order, if a crop is over its line: 0.85, a narrower feather, 5 px a unit
  maskUnit: 0.5,                 // the reveal mask's grid, in Chart units
  budget: { reachI: 100_000, later: 100_000, paper: 6_000, live: 15_000, code: 40_000, inHtml: 200_000 },   // the spike's lines (M1.md §3.2)
};
// WORLD.md §10: the names that never appear on any sheet
export const NEVER = ['The Eastern Downs', 'The Morning Gulf', 'The Morning Isle', 'the Morning Isle', 'The Low Horn', 'never charted'];

const r1 = (v) => Math.round(v * 10) / 10;
const kb = (n) => `${(n / 1000).toFixed(1)} KB`;
const b64 = (u) => u.slice(u.indexOf(',') + 1);
const bytesOf = (u) => Buffer.from(b64(u), 'base64').length;

/** The sheets a build ships: `--sheets=1,2` or, by default, the waters LOOP.shipped names (the Mossmere until step 2 sets it). */
export async function shippedSheets(arg) {
  if (arg) return String(arg).split(',').map((s) => Number(s.trim())).filter((n) => n >= 1 && n <= 16);
  globalThis.GW_V3 = true; globalThis.GW_LOOP = true;
  const D = await import(path.join(root, 'src/data.js'));
  const W = D.LOOP?.waters || {};
  const order = (id) => Number(W[id]?.order) || null;
  const shipped = D.LOOP?.shipped;
  const ids = Array.isArray(shipped) ? shipped : typeof shipped === 'string' ? Object.keys(W).filter((id) => order(id) && order(id) <= order(shipped)) : Object.keys(W);
  const ns = ids.map(order).filter(Boolean).sort((a, b) => a - b);
  return ns.length ? ns : [1];
}

/** The minified bytes of a source (esbuild, as the game's build minifies). */
export async function minifiedBytes(src, { format = 'esm' } = {}) {
  const esbuild = await import('esbuild');
  const r = await esbuild.transform(src, { minify: true, format, target: 'es2020', legalComments: 'none' });
  return Buffer.byteLength(r.code);
}

async function bakeSheets({ chromium, T, K, alpha, boxes, sheets, quality, log }) {
  const files = {
    '/bake.html': ['text/html', '<!doctype html><meta charset="utf-8"><script src="/bake-client.js"></script>'],
    '/bake-client.js': ['text/javascript', fs.readFileSync(path.join(here, 'bake-client.js'))],
    '/vec.json': ['application/json', JSON.stringify(K.vec)],
    '/base.bin': ['application/octet-stream', Buffer.from(K.base.buffer)],
    '/glyphs.bin': ['application/octet-stream', Buffer.from(K.glyphArr.buffer)],
    '/hach.bin': ['application/octet-stream', Buffer.from(K.hachArr.buffer)],
    '/paper.bin': ['application/octet-stream', Buffer.from(K.paper.buffer)],
  };
  const browser = await chromium.launch();
  const version = browser.version();
  const out = [];
  try {
    for (const n of sheets) {
      const box = boxes[n], scale = GAME.scale[n] ?? 2.6, unit = GAME.maskUnit;
      const mw = Math.round(box[2] / unit), mh = Math.round(box[3] / unit), grey = new Uint8Array(mw * mh);
      for (let j = 0; j < mh; j++) for (let i = 0; i < mw; i++) grey[j * mw + i] = Math.round(255 * Math.max(0, Math.min(1, alpha(n - 1, box[0] + (i + 0.5) * unit, box[1] + (j + 0.5) * unit))));
      const view = { box, scale, quality, mask: { w: mw, h: mh, unit } };
      const meta = { W: T.W, H: T.H, x0: T.x0, y0: T.y0, UW: T.UW, UH: T.UH, BS: 2.6, GS, quality, seed: SEED, pw: K.pw, ph: K.ph, currents: (await import('./canon.mjs')).CURRENTS, view };
      const runs = [];
      for (let run = 0; run < 2; run++) { // two bakes, each in a fresh page: their decoded pixels must agree
        const page = await browser.newPage();
        page.on('pageerror', (e) => log('  [page error] ' + e.message));
        const served = { ...files, '/meta.json': ['application/json', JSON.stringify(meta)], '/mask.bin': ['application/octet-stream', Buffer.from(grey.buffer)] };
        await page.route('http://gw.local/**', (route) => {
          const f = served[new URL(route.request().url()).pathname];
          if (!f) return route.fulfill({ status: 404, body: 'no' });
          return route.fulfill({ status: 200, contentType: f[0], body: f[1] });
        });
        await page.goto('http://gw.local/bake.html');
        runs.push(await page.evaluate(() => window.bake()));
        await page.close();
      }
      out.push({ n, box, scale, mask: { w: mw, h: mh, unit }, grey, runs });
    }
  } finally { await browser.close(); }
  return { version, sheets: out };
}

/** The paper the game draws under its sheets: K.paper (the whole sheet at pw / UW px a unit), cropped to `box` (Chart units) when
 *  given, as JPEG. Returns {uri, box, w, h}: `box` is what the image covers, in Chart units. */
async function encodePaper(chromium, K, T, q, box = null) {
  const k = K.pw / T.UW;
  let px0 = 0, py0 = 0, w = K.pw, h = K.ph;
  if (box) { px0 = Math.max(0, Math.floor((box[0] - T.x0) * k)); py0 = Math.max(0, Math.floor((box[1] - T.y0) * k)); w = Math.min(K.pw - px0, Math.ceil(box[2] * k)); h = Math.min(K.ph - py0, Math.ceil(box[3] * k)); }
  const px = new Uint8ClampedArray(w * h * 4);
  for (let j = 0; j < h; j++) px.set(K.paper.subarray(((py0 + j) * K.pw + px0) * 4, ((py0 + j) * K.pw + px0 + w) * 4), j * w * 4);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><meta charset="utf-8">');
    const uri = await page.evaluate(({ px, w, h, q }) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(px), w, h), 0, 0);
      return c.toDataURL('image/jpeg', q);
    }, { px: Array.from(px), w, h, q });
    return { uri, box: [r1(T.x0 + px0 / k), r1(T.y0 + py0 / k), r1(w / k), r1(h / k)], w, h };
  } finally { await browser.close(); }
}
/** The Chart's view of the shipped sheets: their boxes' union, with a margin for the pinned sheets and the sealed sheet. */
export function viewBox(boxes, pad = 60) {
  const bs = Object.values(boxes);
  const x0 = Math.min(...bs.map((b) => b[0])) - pad, y0 = Math.min(...bs.map((b) => b[1])) - pad;
  const x1 = Math.max(...bs.map((b) => b[0] + b[2])) + pad, y1 = Math.max(...bs.map((b) => b[1] + b[3])) + pad;
  return [x0, y0, x1 - x0, y1 - y0];
}

/** The drawing half of page/app.js (the marks, the vignettes, the road, the lettering, the frame, the raft), as the spike measures it. */
function appDrawingHalf() {
  const src = fs.readFileSync(path.join(here, 'page/app.js'), 'utf8').split('\n');
  const from = src.findIndex((l) => l.includes('// ---- where the charted country stops'));
  const to = src.findIndex((l) => l.includes('// ---- a small locator'));
  return src.slice(from, to).join('\n');
}

export async function gameExport({ chromium, args, log }) {
  const spike = args.has('--spike');
  const sheetArg = [...args].find((a) => a.startsWith('--sheets='))?.split('=')[1];
  const sheets = await shippedSheets(sheetArg);
  log(`game export: sheet${sheets.length > 1 ? 's' : ''} ${sheets.join(', ')}${spike ? ' (the spike)' : ''}`);
  log('terrain'); const T = buildTerrain(() => {});
  log('ink'); const K = buildInk(T, () => {});
  const { alpha, bbox } = sheetAlpha(T);
  const boxes = {};
  for (const n of sheets) { const b = bbox[n - 1]; boxes[n] = [Math.floor(b[0]), Math.floor(b[1]), Math.ceil(b[2]) - Math.floor(b[0]), Math.ceil(b[3]) - Math.floor(b[1])]; }

  if (spike) {
    const res = [];
    for (const q of [0.9, 0.85]) {
      const baked = await bakeSheets({ chromium, T, K, alpha, boxes, sheets: [1], quality: q, log });
      const s = baked.sheets[0], a = s.runs[0], b = s.runs[1];
      res.push({ q, bytes: bytesOf(a.sheet), size: a.size, same: a.hash === b.hash, leak: a.leak, opaque: a.opaque, partial: a.partial, chromium: baked.version, box: s.box });
      fs.mkdirSync(path.join(root, 'tools/out/world/game'), { recursive: true });
      fs.writeFileSync(path.join(root, `tools/out/world/game/spike-sheet1-q${q}.webp`), Buffer.from(b64(a.sheet), 'base64'));
    }
    const paper = (await encodePaper(chromium, K, T, 0.86)).uri;
    const crop = await encodePaper(chromium, K, T, 0.86, viewBox(boxes));
    fs.writeFileSync(path.join(root, 'tools/out/world/game/spike-paper.jpg'), Buffer.from(b64(crop.uri), 'base64'));
    const drawSrc = appDrawingHalf();
    const drawMin = await minifiedBytes(`(function(){${drawSrc}\nwindow.__keep=[drawSheetEdge,drawRoad,chevron,returnMark,layoutMarks,lantern,drawLamps,hearth,P,dot,rect,poly,wave,VIGNETTES,drawVignettes,spacedWidth,inkText,handFont,drawLabels,riverLabel,chartText,stone,drawFrame,pilgrim,drawRaft];})();`, { format: 'iife' });
    const appMin = await minifiedBytes(fs.readFileSync(path.join(here, 'page/app.js'), 'utf8'), { format: 'iife' });
    log('the spike (M1.md §3.2):');
    for (const r of res) log(`  sheet 1, box ${r.box.join(' ')} units, ${r.size[0]} x ${r.size[1]} px at ${GAME.scale[1]} px a unit, WebP with alpha at q ${r.q}: ${r.bytes} bytes (${kb(r.bytes)}; base64 ${kb(Math.ceil(r.bytes / 3) * 4)}) · two bakes decode the same: ${r.same} · alpha outside the mask: ${r.leak} px · opaque ${r.opaque}, feathered ${r.partial} px`);
    log(`  the paper (${K.pw} x ${K.ph} px, JPEG q 0.86): ${bytesOf(paper)} bytes (${kb(bytesOf(paper))}); cropped to M1's view (${crop.box.join(' ')} units, ${crop.w} x ${crop.h} px): ${bytesOf(crop.uri)} bytes (${kb(bytesOf(crop.uri))})`);
    log(`  page/app.js's drawing half, minified: ${drawMin} bytes (${kb(drawMin)}); the whole app.js minified ${appMin} bytes`);
    log(`  Chromium ${res[0].chromium}`);
    return { ok: true, spike: res, paper: bytesOf(paper), drawMin };
  }
  return { ok: false, error: 'the full export is not built yet' };
}
