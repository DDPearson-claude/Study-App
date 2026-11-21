// Hue-band report for screenshots (palette work).
//
//   node tools/hue-report.mjs <png|dir> [...more] [--sat=0.10] [--val=0.06] [--json] [--csv]
//
// For every image (directories are expanded to their *.png files, sorted) and for all
// images pooled together, prints the share of "chromatic" colour per hue band. A pixel
// is chromatic when its HSV saturation > --sat and value > --val; it then contributes
// a weight of saturation x value (so a vivid bright mint counts far more than a faint
// grey-teal tint, and near-black / near-grey pixels count for nothing).
//
// Bands (degrees): red 345-15, orange 15-40, yellow 40-65, GREEN 65-160, TEAL 160-195,
// cyan 195-210, blue 210-250, violet 250-290, magenta 290-345. "green+teal" = the sum of
// the two bands we want to keep rare. Shares are % of the chromatic weight; "chroma" is
// the mean weight per pixel over the whole image (how colourful the frame is at all) and
// "px%" the fraction of pixels that passed the chromatic test.
//
// PNGs are decoded in headless Chromium (Playwright, same lookup as tools/playtest.mjs):
// no extra npm dependencies. --json prints one machine-readable object instead of tables;
// --csv prints one row per image.
import { createRequire } from 'node:module';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, basename, join } from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

export const BANDS = [
  // name, from, to (degrees, half-open [from, to); red wraps)
  ['red', 345, 15], ['orange', 15, 40], ['yellow', 40, 65], ['green', 65, 160], ['teal', 160, 195],
  ['cyan', 195, 210], ['blue', 210, 250], ['violet', 250, 290], ['magenta', 290, 345],
];

const opts = { sat: 0.10, val: 0.06, json: false, csv: false };
const inputs = [];
for (const a of process.argv.slice(2)) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    if (k === 'json' || k === 'csv') opts[k] = true;
    else if (k in opts) opts[k] = Number(v);
    else { console.error(`unknown option ${a}`); process.exit(2); }
  } else inputs.push(a);
}
if (!inputs.length) {
  console.error('usage: node tools/hue-report.mjs <png|dir> [...] [--sat=0.10] [--val=0.06] [--json] [--csv]');
  process.exit(2);
}
const files = [];
for (const p of inputs) {
  const abs = resolve(process.cwd(), p);
  let st;
  try { st = statSync(abs); } catch { console.error(`missing: ${abs}`); continue; }
  if (st.isDirectory()) readdirSync(abs).filter((f) => /\.png$/i.test(f)).sort().forEach((f) => files.push(join(abs, f)));
  else files.push(abs);
}
if (!files.length) { console.error('no PNG files found'); process.exit(2); }

// --------------------------------------------------------------------------- analysis (runs in the page)
async function analyse(page, dataUrl, bands, sat, val) {
  return page.evaluate(async ({ dataUrl, bands, sat, val }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const px = g.getImageData(0, 0, w, h).data;
    // 360 one-degree bins of weight + pixel counts, folded into bands afterwards
    const binW = new Float64Array(360), binN = new Float64Array(360);
    let total = 0, chromaPx = 0, sumV = 0;
    const n = w * h;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i] / 255, gg = px[i + 1] / 255, b = px[i + 2] / 255;
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), d = mx - mn;
      sumV += mx;
      if (mx <= val || d <= 0) continue;
      const s = d / mx;
      if (s <= sat) continue;
      let hdeg;
      if (mx === r) hdeg = 60 * (((gg - b) / d) % 6);
      else if (mx === gg) hdeg = 60 * ((b - r) / d + 2);
      else hdeg = 60 * ((r - gg) / d + 4);
      if (hdeg < 0) hdeg += 360;
      const bin = Math.min(359, Math.floor(hdeg));
      const wgt = s * mx;
      binW[bin] += wgt; binN[bin] += 1;
      total += wgt; chromaPx++;
    }
    const inBand = (deg, f, t) => (f < t ? deg >= f && deg < t : deg >= f || deg < t);
    const bandW = {}, bandN = {};
    for (const [name, f, t] of bands) {
      let sw = 0, sn = 0;
      for (let d = 0; d < 360; d++) if (inBand(d + 0.5, f, t)) { sw += binW[d]; sn += binN[d]; }
      bandW[name] = sw; bandN[name] = sn;
    }
    // weighted circular mean hue of the green+teal mass (where in 65-195 the green sits)
    let gx = 0, gy = 0;
    for (let d = 65; d < 195; d++) { const a = ((d + 0.5) * Math.PI) / 180; gx += Math.cos(a) * binW[d]; gy += Math.sin(a) * binW[d]; }
    let gHue = (Math.atan2(gy, gx) * 180) / Math.PI; if (gHue < 0) gHue += 360;
    return { w, h, pixels: n, total, chromaPx, meanValue: sumV / n, bandW, bandN, greenHue: gx || gy ? gHue : null };
  }, { dataUrl, bands, sat, val });
}

function shares(rec) {
  const out = {};
  for (const [name] of BANDS) out[name] = rec.total > 0 ? (100 * rec.bandW[name]) / rec.total : 0;
  out.greenTeal = out.green + out.teal;
  return out;
}

// --------------------------------------------------------------------------- main
const browser = await chromium.launch({ args: ['--disable-gpu'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><title>hue-report</title>');
const results = [];
const pooled = { total: 0, pixels: 0, chromaPx: 0, sumValue: 0, bandW: Object.fromEntries(BANDS.map(([n]) => [n, 0])), bandN: Object.fromEntries(BANDS.map(([n]) => [n, 0])) };
for (const f of files) {
  try {
    const dataUrl = 'data:image/png;base64,' + readFileSync(f).toString('base64');
    const rec = await analyse(page, dataUrl, BANDS, opts.sat, opts.val);
    rec.file = f;
    rec.name = basename(f, '.png');
    rec.share = shares(rec);
    rec.chroma = rec.total / rec.pixels;
    results.push(rec);
    pooled.total += rec.total; pooled.pixels += rec.pixels; pooled.chromaPx += rec.chromaPx; pooled.sumValue += rec.meanValue * rec.pixels;
    for (const [n] of BANDS) { pooled.bandW[n] += rec.bandW[n]; pooled.bandN[n] += rec.bandN[n]; }
  } catch (e) {
    results.push({ file: f, name: basename(f, '.png'), error: String(e?.message || e) });
  }
}
await browser.close();
pooled.share = shares(pooled);
pooled.chroma = pooled.pixels ? pooled.total / pooled.pixels : 0;
pooled.meanValue = pooled.pixels ? pooled.sumValue / pooled.pixels : 0;
// mean of per-image green+teal shares (each frame counts equally, whatever its chroma)
const ok = results.filter((r) => !r.error);
const meanGT = ok.length ? ok.reduce((s, r) => s + r.share.greenTeal, 0) / ok.length : 0;

const fmt = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '-');
if (opts.json) {
  const strip = (r) => (r.error ? r : { name: r.name, file: r.file, size: [r.w, r.h], chroma: +r.chroma.toFixed(4), chromaPx: +(100 * r.chromaPx / r.pixels).toFixed(2), meanValue: +r.meanValue.toFixed(4), greenHue: r.greenHue == null ? null : +r.greenHue.toFixed(1), share: Object.fromEntries(Object.entries(r.share).map(([k, v]) => [k, +v.toFixed(2)])) });
  console.log(JSON.stringify({
    thresholds: { sat: opts.sat, val: opts.val }, bands: BANDS.map(([n, f, t]) => `${n} ${f}-${t}`),
    overall: { images: ok.length, chroma: +pooled.chroma.toFixed(4), chromaPx: +(100 * pooled.chromaPx / Math.max(1, pooled.pixels)).toFixed(2), share: Object.fromEntries(Object.entries(pooled.share).map(([k, v]) => [k, +v.toFixed(2)])), greenTealPooled: +pooled.share.greenTeal.toFixed(2), greenTealMeanPerImage: +meanGT.toFixed(2) },
    images: results.map(strip),
  }, null, 2));
} else if (opts.csv) {
  console.log(['image', 'chroma', 'px%', ...BANDS.map(([n]) => n), 'green+teal'].join(','));
  for (const r of results) {
    if (r.error) { console.log(`${r.name},ERROR ${JSON.stringify(r.error)}`); continue; }
    console.log([r.name, fmt(r.chroma, 4), fmt(100 * r.chromaPx / r.pixels), ...BANDS.map(([n]) => fmt(r.share[n])), fmt(r.share.greenTeal)].join(','));
  }
  console.log(['OVERALL', fmt(pooled.chroma, 4), fmt(100 * pooled.chromaPx / pooled.pixels), ...BANDS.map(([n]) => fmt(pooled.share[n])), fmt(pooled.share.greenTeal)].join(','));
} else {
  const cols = ['red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'blue', 'violet', 'magenta'];
  const nameW = Math.max(8, ...results.map((r) => r.name.length)) + 1;
  const head = 'image'.padEnd(nameW) + 'chroma  px%  ' + cols.map((c) => c.slice(0, 6).padStart(7)).join('') + '  GREEN+TEAL';
  console.log(`hue shares, % of chromatic weight (s>${opts.sat}, v>${opts.val}, weight = s*v)`);
  console.log(head);
  console.log('-'.repeat(head.length));
  for (const r of results) {
    if (r.error) { console.log(r.name.padEnd(nameW) + 'ERROR ' + r.error); continue; }
    console.log(r.name.padEnd(nameW) + fmt(r.chroma, 3).padStart(6) + fmt(100 * r.chromaPx / r.pixels, 0).padStart(5) + '  ' + cols.map((c) => fmt(r.share[c]).padStart(7)).join('') + fmt(r.share.greenTeal).padStart(12));
  }
  console.log('-'.repeat(head.length));
  console.log('OVERALL'.padEnd(nameW) + fmt(pooled.chroma, 3).padStart(6) + fmt(100 * pooled.chromaPx / pooled.pixels, 0).padStart(5) + '  ' + cols.map((c) => fmt(pooled.share[c]).padStart(7)).join('') + fmt(pooled.share.greenTeal).padStart(12));
  console.log(`\ngreen+teal share: ${fmt(pooled.share.greenTeal)}% pooled over ${ok.length} image(s) (green ${fmt(pooled.share.green)}% + teal ${fmt(pooled.share.teal)}%); mean per image ${fmt(meanGT)}%`);
  const errs = results.filter((r) => r.error).length;
  if (errs) console.log(`${errs} image(s) failed to decode`);
}
