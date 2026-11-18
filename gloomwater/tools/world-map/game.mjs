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
import { buildPageData, sheetAlpha } from './pagedata.mjs';
import { isolines, chaikin, simplify } from './lib/util.mjs';
import { checkRoad, drawnLegs, reportRoad } from './road.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const ART = path.join(root, 'src/chart-art.js');

// M1.md §3.2 (re-set by the spike): the game's resolution and each part's budget, raw bytes
export const GAME = {
  scale: { 1: 5.5, 2: 5.5, 3: 5.5, 4: 5.5 },   // px a Chart unit: reach I (sheets 1-4) at 5.5 (the kingdom inset); later reaches at 2.6
  quality: 0.9,                  // WebP; the knobs, in order, if a crop is over its line: 0.85, a narrower feather, 5 px a unit
  maskUnit: 0.5,                 // the reveal mask's grid, in Chart units
  budget: { reachI: 100_000, later: 100_000, paper: 6_000, live: 15_000, code: 60_000, inHtml: 200_000 },   // the spike's lines (M1.md §3.2)
};
// WORLD.md §10: the names that never appear on any sheet
export const NEVER = ['The Eastern Downs', 'The Morning Gulf', 'The Morning Isle', 'the Morning Isle', 'The Low Horn', 'never charted'];

const r1 = (v) => Math.round(v * 10) / 10;
const kb = (n) => `${(n / 1000).toFixed(1)} KB`;
const b64 = (u) => u.slice(u.indexOf(',') + 1);
const bytesOf = (u) => Buffer.from(b64(u), 'base64').length;

/** The sheets a build bakes: `--sheets=1,2` or, by default, the waters LOOP.shipped names (the Mossmere until step 2 sets it) and,
 *  LAKE 2 lane C (LAKE2.md §6.2), the next water LOOP.waters already holds, baked ahead of its gate: the game draws a sheet only once
 *  its water is owned and ships (chart-draw's owned sheets), so the ahead sheet waits unseen and the gate needs no second bake. */
export async function shippedSheets(arg) {
  if (arg) return String(arg).split(',').map((s) => Number(s.trim())).filter((n) => n >= 1 && n <= 16).sort((a, b) => a - b);
  globalThis.GW_V3 = true; globalThis.GW_LOOP = true;
  const D = await import(path.join(root, 'src/data.js'));
  const W = D.LOOP?.waters || {};
  const order = (id) => Number(W[id]?.order) || null;
  const shipped = D.LOOP?.shipped;
  const ids = Array.isArray(shipped) ? shipped : typeof shipped === 'string' ? Object.keys(W).filter((id) => order(id) && order(id) <= order(shipped)) : Object.keys(W);
  const ns = ids.map(order).filter(Boolean).sort((a, b) => a - b);
  if (!ns.length) ns.push(1);
  const ahead = Math.max(...ns) + 1;
  if (ahead <= 16 && Object.keys(W).some((id) => order(id) === ahead)) ns.push(ahead);
  return ns;
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

/** The minified bytes of src/chart-draw.js as a bundle of all its exports (the game bundles only the pieces it calls). */
async function chartDrawMin() {
  const esbuild = await import('esbuild');
  const r = await esbuild.build({ entryPoints: [path.join(root, 'src/chart-draw.js')], bundle: true, format: 'esm', minify: true, target: ['es2020'], write: false, legalComments: 'none', logLevel: 'silent' });
  return Buffer.byteLength(r.outputFiles[0].text);
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
    const drawMin = await chartDrawMin();
    log('the spike (M1.md §3.2):');
    for (const r of res) log(`  sheet 1, box ${r.box.join(' ')} units, ${r.size[0]} x ${r.size[1]} px at ${GAME.scale[1]} px a unit, WebP with alpha at q ${r.q}: ${r.bytes} bytes (${kb(r.bytes)}; base64 ${kb(Math.ceil(r.bytes / 3) * 4)}) · two bakes decode the same: ${r.same} · alpha outside the mask: ${r.leak} px · opaque ${r.opaque}, feathered ${r.partial} px`);
    log(`  the paper (${K.pw} x ${K.ph} px, JPEG q 0.86): ${bytesOf(paper)} bytes (${kb(bytesOf(paper))}); cropped to M1's view (${crop.box.join(' ')} units, ${crop.w} x ${crop.h} px): ${bytesOf(crop.uri)} bytes (${kb(bytesOf(crop.uri))})`);
    log(`  src/chart-draw.js, every export, minified: ${drawMin} bytes (${kb(drawMin)})`);
    log(`  Chromium ${res[0].chromium}`);
    return { ok: true, spike: res, paper: bytesOf(paper), drawMin };
  }
  return fullExport({ chromium, T, K, alpha, bbox, boxes, sheets, log });
}


// ------------------------------------------------------------------ the export itself
const FIX = path.join(root, 'tools/tests/fixtures/chart-veil.json');
// the road's stones of arc I and the plain rose, at the Landing's corner, in the Cold Sea (M1.md §3.3), in Chart units
const STONES = { at: [631, 163], rose: [662, 162.5] };

/** The water ids of LOOP.waters by their order (sheet n is the water of order n). */
async function waterIds() {
  globalThis.GW_V3 = true; globalThis.GW_LOOP = true;
  const D = await import(path.join(root, 'src/data.js'));
  const W = D.LOOP?.waters || {}, by = {};
  for (const id of Object.keys(W)) if (Number(W[id]?.order) > 0) by[Number(W[id].order)] = id;
  return by;
}
/** The inked edge of the shipped sheets (where the charted country stops), from their alpha on a 1-unit grid over `box`. */
function edgeLines(alpha, sheets, box) {
  const unit = 1, w = Math.round(box[2] / unit) + 1, h = Math.round(box[3] / unit) + 1, f = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { let a = 0; for (const n of sheets) a = Math.max(a, alpha(n - 1, box[0] + i * unit, box[1] + j * unit)); f[j * w + i] = a; }
  const lines = [];
  for (const l of isolines(f, w, h, 0.5)) {
    const pts = chaikin(l.map((p) => [box[0] + p[0] * unit, box[1] + p[1] * unit]), 2, false);
    if (pts.length > 4) lines.push(simplify(pts, 0.5).flatMap((p) => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2]));
  }
  return lines;
}
/** Where, inside the shipped sheets' boxes, an unshipped sheet's ground lies (and no shipped sheet's): the game draws nothing there
 *  but paper. Written for the Chart's pixel test only (tools/tests/fixtures/chart-veil.json); the game never reads it. */
function veilGrid(alpha, sheets, boxes) {
  // LAKE 2 lane C: one grid for each count of sheets owned (the road only goes forward, so the owned sheets are always the first n):
  // inside the owned sheets' window (their boxes' union, as the Chart draws it), the cells of every sheet not yet owned
  const all = Array.from({ length: 16 }, (_, i) => i + 1), out = [];
  for (const n of sheets) {
    const owned = sheets.filter((m) => m <= n), later = all.filter((m) => !owned.includes(m));
    const box = unionBox(owned.map((m) => boxes[m])), unit = 1, w = box[2], h = box[3], rows = [];
    let cells = 0;
    for (let j = 0; j < h; j++) {
      let row = '';
      for (let i = 0; i < w; i++) {
        const x = box[0] + i + 0.5, y = box[1] + j + 0.5;
        let own = 0; for (const m of owned) own = Math.max(own, alpha(m - 1, x, y));
        let other = 0; if (own < 0.05) for (const m of later) { other = Math.max(other, alpha(m - 1, x, y)); if (other > 0.5) break; }
        const v = own < 0.05 && other > 0.5 ? 1 : 0; cells += v; row += v;
      }
      rows.push(row.replace(/(0+|1+)/g, (r) => `${r[0]}${r.length},`).replace(/,$/, ''));
    }
    out.push({ sheet: n, owned, box, unit, w, h, cells, rows });
  }
  return out;
}
/** The window over some sheets' boxes (their union), [x, y, w, h] in Chart units: the Chart's first window once two are owned. */
export function unionBox(bs) {
  const x0 = Math.min(...bs.map((b) => b[0])), y0 = Math.min(...bs.map((b) => b[1]));
  return [x0, y0, Math.max(...bs.map((b) => b[0] + b[2])) - x0, Math.max(...bs.map((b) => b[1] + b[3])) - y0];
}

async function fullExport({ chromium, T, K, alpha, boxes, sheets, log }) {
  const fail = [];
  const check = (ok, text) => { log(`  ${ok ? 'ok  ' : 'FAIL'} ${text}`); if (!ok) fail.push(text); };
  const ids = await waterIds();
  const last = Math.max(...sheets);
  log('page data');
  const data = buildPageData(T);
  // the route rule, on the road as drawn
  const road = checkRoad(drawnLegs(data), { reach: 8 });
  check(reportRoad(road, 'the route rule, on the road as drawn', () => {}), 'the route rule (road.mjs) on the drawn road, the shipped legs among them');
  log('bake (Chromium, each sheet twice)');
  const baked = await bakeSheets({ chromium, T, K, alpha, boxes, sheets, quality: GAME.quality, log });
  const view = viewBox(boxes);
  const paper = await encodePaper(chromium, K, T, 0.86, view);
  // the live layer for the shipped sheets only
  const pieceIdx = data.pieces.map((pc, i) => (pc.leg <= last ? i : -1)).filter((i) => i >= 0);
  const pieces = pieceIdx.map((i) => { const pc = data.pieces[i]; return { id: pc.id, k: pc.k, flow: pc.flow, wide: pc.wide, leg: pc.leg, p: pc.p }; });
  const inBoxes = (at) => sheets.some((n) => { const b = boxes[n]; return at[0] >= b[0] && at[0] <= b[0] + b[2] && at[1] >= b[1] && at[1] <= b[1] + b[3]; });
  const labels = data.labels.filter((l) => l.sheet >= 1 && l.sheet <= last && inBoxes(l.at)).map((l) => ({ t: l.t, kind: l.kind, at: l.at, a: l.a, z: l.z, sheet: l.sheet }));
  // (LAKE 2 lane C: what the Chart shows with the first n sheets owned, for each n baked: their edge, drawn over their window as the
  // first sheet's always was, and the wisp where the owned road runs on; the first sheet's keep their M1 names, `edges` and `wisp`)
  const atN = (n) => { const owned = sheets.filter((m) => m <= n); return { edges: edgeLines(alpha, owned, viewBox(Object.fromEntries(owned.map((m) => [m, boxes[m]])))), wisp: n < 16 ? data.wisps[n - 1] : null }; };
  const first = atN(sheets[0]);
  const live = {
    pieces,
    waters: data.waters.filter((w) => w.n <= last).map((w) => ({ n: w.n, water: ids[w.n] || null, at: w.at, vg: w.vg })),
    home: { at: data.home.at, vg: data.home.vg },
    wisp: first.wisp,
    edges: first.edges,
    ...(sheets.length > 1 ? { more: Object.fromEntries(sheets.slice(1).map((n) => [n, atN(n)])) } : {}),
    labels,
    stones: STONES,
  };
  const liveJson = JSON.stringify(live);
  // ---- the checks
  for (const s of baked.sheets) {
    const a = s.runs[0], b = s.runs[1], bytes = bytesOf(a.sheet), line = s.n <= 4 ? GAME.budget.reachI : GAME.budget.later;
    check(bytes <= line, `sheet ${s.n}: ${bytes} bytes as WebP (${a.size[0]} x ${a.size[1]} px), within its ${line}`);
    check(a.hash === b.hash, `sheet ${s.n}: two bakes decode to the same pixels (${a.hash})`);
    check(a.leak === 0, `sheet ${s.n}: no alpha outside its mask (${a.leak} px)`);
  }
  check(bytesOf(paper.uri) <= GAME.budget.paper, `the paper: ${bytesOf(paper.uri)} bytes, within ${GAME.budget.paper}`);
  check(liveJson.length <= GAME.budget.live, `the live layer's data: ${liveJson.length} bytes, within ${GAME.budget.live}`);
  check(pieces.every((p) => p.leg <= last) && live.waters.every((w) => w.n <= last) && labels.every((l) => l.sheet <= last), 'no leg, lamp, vignette or label of an unshipped sheet');
  const names = data.waters.filter((w) => w.n > last).map((w) => w.name.replace(/^The /, ''));
  const leaked = [...NEVER, ...names].filter((n) => liveJson.includes(n));
  check(!leaked.length, `no name of the never list or of an unshipped water${leaked.length ? ': ' + leaked.join(', ') : ''}`);
  check(live.waters.every((w) => w.water), 'every shipped sheet is a water of LOOP.waters');
  if (fail.length) return { ok: false, error: `${fail.length} check(s) failed` };

  // ---- write src/chart-art.js: the images kept from the file there when their decoded pixels have not changed
  let prev = null;
  try { prev = fs.existsSync(ART) ? (await import(path.join(ART) + `?t=${Date.now()}`)).CHART_ART : null; } catch { prev = null; }
  const art = {
    v: 1, seed: SEED, chromium: baked.version, view, maskUnit: GAME.maskUnit,
    sheets: baked.sheets.map((s) => {
      const old = prev?.sheets?.find((q) => q.n === s.n && q.hash === s.runs[0].hash && q.scale === s.scale && String(q.box) === String(s.box));
      return { n: s.n, water: ids[s.n], box: s.box, scale: s.scale, w: s.runs[0].size[0], h: s.runs[0].size[1], hash: s.runs[0].hash, uri: old ? old.uri : s.runs[0].sheet };
    }),
    paper: { box: paper.box, w: paper.w, h: paper.h, uri: prev?.paper && String(prev.paper.box) === String(paper.box) && prev.paper.hash === hashOf(K, paper) ? prev.paper.uri : paper.uri, hash: hashOf(K, paper) },
    live,
  };
  const kept = art.sheets.filter((s, i) => s.uri !== baked.sheets[i].runs[0].sheet).length;
  const body = `// src/chart-art.js — generated by \`node tools/world-map/build.mjs --game\`; never edited by hand (docs/loop/M1.md §3.1, §3.7).
// The shipped sheets of the Chart: each sheet's bake as WebP with its reveal mask as alpha, the bake's paper for M1's view, and
// the live layer's data for those sheets only. Baked in Chromium ${baked.version}, seed ${SEED}; decoded pixels ${art.sheets.map((s) => `sheet ${s.n} ${s.hash}`).join(', ')}.
// The images are re-written only when their decoded pixels change (the WebP encoder's bytes vary with the Chromium build).
export const CHART_ART = ${JSON.stringify(art, null, 0).replace(/"uri":"/g, '\n  "uri":"')};
`;
  const before = fs.existsSync(ART) ? fs.readFileSync(ART, 'utf8') : null;
  const strip = (t) => t && t.replace(/Baked in Chromium [^,]+,/, '').replace(/"chromium":"[^"]*"/, '');
  if (strip(before) === strip(body)) log(`  ${path.relative(root, ART)} unchanged (its pixels and data are the same)`);
  else { fs.writeFileSync(ART, body); log(`  wrote ${path.relative(root, ART)}: ${(body.length / 1000).toFixed(1)} KB${kept ? ` (${kept} image${kept > 1 ? 's' : ''} kept: same pixels)` : ''}`); }
  // the Chart's pixel test reads where no unshipped sheet's ground may be inked (tools side only)
  const veil = veilGrid(alpha, sheets, boxes);
  fs.writeFileSync(FIX, JSON.stringify({ note: 'generated by build.mjs --game: inside each shipped sheet\'s box, the cells (1 Chart unit) of an unshipped sheet\'s ground; the Chart draws only paper there (run-length rows)', veil }) + '\n');
  log(`  wrote ${path.relative(root, FIX)} (${veil.map((v) => `sheet ${v.sheet}: ${v.cells} cells of later ground in its box`).join('; ')})`);
  return { ok: true, art };
}
/** The paper's own hash, so an unchanged paper keeps its bytes too. */
function hashOf(K, paper) {
  let h = 0x811c9dc5 >>> 0;
  const s = `${paper.box}|${paper.w}x${paper.h}|`;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  for (let i = 0; i < K.paper.length; i += 7) { h ^= K.paper[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
