#!/usr/bin/env node
// The drawn Chart's paint, timed alone (docs/loop/M1.md §2.14: first paint ≤ 150 ms, a redraw ≤ 16 ms; M1 step 3b, the review's
// should). In the game page on the shared software-GL boxes every canvas call that syncs with the GPU process waits behind the 3D
// frames, so chart-shots' figures there say nothing of the Chart's own cost. This page draws nothing else: src/chart-draw.js and
// src/chart-art.js bundled alone, the art decoded as the game decodes it, the layout's inputs (the Mossmere's geometry, its places'
// sites, the M1 §2.4 fixture's model) computed in node exactly as the node test computes them. Each frame is drawn on a CPU canvas
// (willReadFrequently) of the Chart's size at its DPR and one pixel read back, so the figure is the raster's.
//
//   nice -n 5 node tools/chart-time.mjs [--runs=12]
//
// Reports the median and the worst of `runs` paints for: the first paint (a fresh canvas, its first frame), a redraw (a place chosen),
// and a frame of the tutorial's ink-in, at desktop 960 x 540 (DPR 2), a 390 x 844 phone (DPR 3) and Safari's 390 x 664 (DPR 3).
// Advisory here (the machine is shared); step 6 reads the same on the real phones. No fish glyphs (they are drawn once and cached).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { loadLoopData, freshLoopMeta } from './tests/loop-fixture.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const runs = Math.max(3, Number(args.runs) || 12);

const D = await loadLoopData();
const U = await import('../src/ui-loop.js'), C = await import('../src/ui-chart.js');
const geo = C.waterGeometry(D, 'mossmere');
const shoreAt = geo.shoreAt ? Array.from({ length: 720 }, (_, i) => geo.shoreAt((i / 720) * Math.PI * 2 - Math.PI)) : null;
const water = { mossmere: { ...geo, shoreAt: null } };
const sites = C.placeSites(D, 'mossmere');
const model = (state, opts = {}) => {
  const m = U.chartModel(freshLoopMeta(D), D, { slots: 3, tutorial: !!opts.tutorial });
  m.sheets[0].places = C.chartPlaces(D, C.CHART_FIXTURE(D, state));
  if (opts.pick) m.pick = opts.pick;
  return m;
};
const weights = {};
for (const p of C.CHART_FIXTURE(D, 'all')) if (p.best) weights[p.best.weight] = D.fmtWeight(p.best.weight);
const input = {
  water, sites, shoreAt, weights, fonts: C.CHART_FONTS, words: { soon: D.TEXT_LOOP.comingSoon, book: 'Journal' },
  frames: {
    tutorial: model('none', { tutorial: true }),
    later: model('later'),
    chosen: model('later', { pick: { water: 'mossmere', place: 'under_the_span' } }),
  },
};

const esbuild = await import('esbuild');
const entry = `import { drawChart, vignetteLanding, vignetteMossmere } from ${JSON.stringify(path.join(root, 'src/chart-draw.js'))};
import { CHART_ART } from ${JSON.stringify(path.join(root, 'src/chart-art.js'))};
window.chartTime = async (input, sizes, runs) => {
  const decode = async (uri) => createImageBitmap(await (await fetch(uri)).blob());
  const art = { sheets: await Promise.all(CHART_ART.sheets.map(async (s) => ({ ...s, image: await decode(s.uri) }))), paper: { ...CHART_ART.paper, image: await decode(CHART_ART.paper.uri) }, live: CHART_ART.live };
  try { await Promise.all(['italic 16px "IM Fell English"', '16px "IM Fell English"', '16px "Cedarville Cursive"'].map((f) => document.fonts.load(f))); } catch (e) {}
  const S = input.shoreAt, water = { mossmere: { ...input.water.mossmere, shoreAt: S ? (a) => S[Math.round(((a + Math.PI) / (Math.PI * 2)) * S.length) % S.length] : null } };
  const out = {};
  for (const [name, w, h, dpr] of sizes) {
    const view = (g, ink) => ({ w, h, dpr, phone: w < 560, F: input.fonts, water, sites: input.sites, ink, vignettes: { 0: vignetteLanding, 1: vignetteMossmere },
      fmtWeight: (x) => input.weights[x] || '', fishGlyph: () => null, words: input.words, paperImage: art.paper.image,
      measure: (t, f) => { g.save(); g.font = f; const x = g.measureText(t).width; g.restore(); return x; } });
    // the game's kept base (ui-chart.js baseCache), here on CPU canvases: a first paint draws it, a redraw only lays it down
    const newCache = () => ({ map: new Map(), get(k) { return this.map.get(k) || null; }, set(k, c) { this.map.set(k, c); },
      canvas(cw, ch) { const c = document.createElement('canvas'); c.width = cw; c.height = ch; c.getContext('2d', { willReadFrequently: true }); return c; } });
    let cache = newCache();
    const time = (frame, ink, fresh) => {
      const res = [];
      let cv = null, g = null;
      for (let i = 0; i < runs; i++) {
        if (fresh || !cv) { cv = document.createElement('canvas'); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); g = cv.getContext('2d', { willReadFrequently: true }); }
        if (fresh) cache = newCache();
        const t0 = performance.now();
        drawChart(g, input.frames[frame], art, { ...view(g, ink), cache }, 0); g.getImageData(0, 0, 1, 1);
        res.push(performance.now() - t0);
      }
      res.sort((a, b) => a - b);
      return { median: Math.round(res[res.length >> 1] * 10) / 10, worst: Math.round(res[res.length - 1] * 10) / 10 };
    };
    out[name] = { first: time('later', { sheet: 1, places: {} }, true), redraw: (time('later', { sheet: 1, places: {} }, false), time('chosen', { sheet: 1, places: {} }, false)), inking: time('tutorial', { sheet: 0.5, places: {} }, false) };
  }
  return out;
};`;
const r = await esbuild.build({ stdin: { contents: entry, resolveDir: root, loader: 'js' }, bundle: true, format: 'iife', target: ['es2020'], write: false, logLevel: 'silent' });
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gw-chart-time-'));
const page = path.join(dir, 'chart-time.html');
fs.writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cedarville+Cursive&display=swap"></head><body><script>${r.outputFiles[0].text}</script></body></html>`);
// the Chart's sheet as the game lays it out: the desktop's 892 x 364, a 390 x 844 phone's 354 x 612, Safari's 390 x 664: 354 x 432
const sizes = [['desktop 960 x 540, DPR 2', 892, 364, 2], ['phone 390 x 844, DPR 3', 354, 612, 3], ['Safari 390 x 664, DPR 3', 354, 432, 3]];
const browser = await chromium.launch();
const pg = await browser.newPage();
const errors = [];
pg.on('pageerror', (e) => errors.push(String(e?.message || e)));
await pg.goto(pathToFileURL(page).href, { timeout: 120000 });
const res = await pg.evaluate(([inp, sz, n]) => window.chartTime(inp, sz, n), [input, sizes, runs]);
await browser.close();
fs.rmSync(dir, { recursive: true, force: true });
let over = 0;
console.log(`the Chart's paint alone, ms (median / worst of ${runs}; a CPU canvas, one pixel read back):`);
for (const [name, t] of Object.entries(res)) {
  const ok1 = t.first.median <= 150, ok2 = t.redraw.median <= 16;
  if (!ok1 || !ok2) over++;
  console.log(`  ${name}: first paint ${t.first.median} / ${t.first.worst} (≤ 150 ${ok1 ? 'ok' : 'over'}); a redraw ${t.redraw.median} / ${t.redraw.worst} (≤ 16 ${ok2 ? 'ok' : 'over'}); an ink-in frame ${t.inking.median} / ${t.inking.worst}`);
}
if (errors.length) console.log('page errors:', errors);
console.log(over ? `\n${over} size(s) over a line (advisory on a shared box)` : '\nevery line held');
process.exit(errors.length ? 1 : 0);
