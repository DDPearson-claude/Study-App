#!/usr/bin/env node
// Films a steps lesson's motion so a reviewer can see it, not guess it: opens the body as the app
// would (360 px, light), and for each step sets the step control, then screenshots the frame
// every --every ms for --for ms. Each step's frames go on one contact sheet with their times.
//   node tools/eval/filmstrip.mjs body.html --out build/x/i3.film [--steps 0,2,4] [--every 200]
//        [--for 5000] [--app tests/out/kit.html] [--theme dark] [--control step] [--eval "js"]
// --eval runs in the lesson's frame after the step opens (to answer a puzzle, say), then filming
// starts again from that moment. Writes <out>-s<N>.png (contact sheets), <out>-s<N>-end.png (the
// last frame) and <out>.json: per step,
// each frame's time and whether it differs from the one before, and when the motion settled.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { openApp, ROOT } from '../harness/page.mjs';

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
const file = process.argv[2];
if (!file || file.startsWith('--')) { console.error('usage: filmstrip.mjs body.html --out prefix [--steps 0,2] [--every 200] [--for 5000] [--app kit.html] [--eval js]'); process.exit(2); }
const out = resolve(arg('out', `${ROOT}/tests/out/eval/film`));
const every = Math.max(60, +arg('every', 200));
const span = Math.max(every, +arg('for', 5000));
const control = arg('control', 'step');
const theme = arg('theme', 'light');
const evalJs = arg('eval', '');
mkdirSync(dirname(out), { recursive: true });

const app = await openApp({ width: 360, height: 900, file: arg('app') ? resolve(arg('app')) : undefined });
const { page } = app;
await page.goto(app.url('#/__eval'));
await page.evaluate((t) => { document.documentElement.dataset.muTheme = t; }, theme);
await page.evaluate(async (html) => {
  await U.rt.ready;
  const shell = document.getElementById('app');
  if (shell) shell.style.display = 'none';
  const box = document.createElement('div');
  box.style.cssText = 'max-width:720px;margin:16px auto;padding:0 16px;background:var(--bg)';
  document.body.appendChild(box);
  window.__film = U.sandbox.mount(box, { html });
  await Promise.race([window.__film.ready, new Promise((r) => setTimeout(r, 6000))]);
}, readFileSync(file, 'utf8'));
const info = await page.evaluate(() => window.__film.inputs());
const ctl = info.inputs.find((c) => c.id === control);
if (!ctl) { console.error('no control "' + control + '" (has: ' + info.inputs.map((c) => c.id).join(', ') + ')'); await app.close(); process.exit(1); }
const steps = arg('steps') ? arg('steps').split(',').map(Number) : Array.from({ length: (ctl.max | 0) + 1 }, (_, i) => i);
const frameEl = page.locator('.kit-iframe').first();
const kitFrame = () => page.frames().find((f) => f !== page.mainFrame());

async function film() {
  const shots = [], t0 = Date.now();
  let prev = null;
  for (let k = 0; ; k++) {
    const due = t0 + k * every;
    if (due - t0 > span) break;
    const wait = due - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    const t = (Date.now() - t0) / 1000;
    const buf = await frameEl.screenshot();
    shots.push({ t, buf, changed: !!prev && !prev.equals(buf) });
    prev = buf;
  }
  return shots;
}

const result = { body: file, every, for: span, theme, steps: [] };
for (const s of steps) {
  // Each step opens fresh: away to another step first, so its demonstration plays from the start.
  await page.evaluate(([id, v]) => window.__film.set(id, v), [control, s === 0 ? 1 : 0]).catch(() => {});
  await page.waitForTimeout(150);
  await page.evaluate(([id, v]) => window.__film.set(id, v), [control, s]);
  let shots = await film();
  let evalNote = null;
  if (evalJs) {
    const f = kitFrame();
    try { evalNote = String(await f.evaluate(evalJs)); } catch (e) { evalNote = 'eval failed: ' + e.message; }
    shots = shots.concat((await film()).map((x) => ({ ...x, t: x.t + span / 1000 + every / 1000, after: true })));
  }
  const changes = shots.filter((x) => x.changed).map((x) => x.t);
  const settled = changes.length ? changes[changes.length - 1] : 0;
  // The contact sheet: frames four to a row at half size, each with its time.
  const cells = shots.map((x) => `<figure><img src="data:image/png;base64,${x.buf.toString('base64')}"><figcaption>${x.after ? 'after · ' : ''}${x.t.toFixed(2)} s${x.changed ? ' ·' : ''}</figcaption></figure>`).join('');
  const sheet = await app.context.newPage();
  await sheet.setViewportSize({ width: 1500, height: 900 });
  await sheet.setContent(`<style>body{margin:12px;font:14px system-ui;background:#fff}h1{font-size:16px;margin:0 0 8px}
    main{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}figure{margin:0}img{width:100%;border:1px solid #ccc}
    figcaption{text-align:center;color:#333}</style><h1>Step ${s}: a frame every ${every} ms; · marks a change from the frame before. Settled by ${settled.toFixed(2)} s.</h1><main>${cells}</main>`);
  const path = `${out}-s${s}.png`;
  // The last frame alone, so the finished picture can be compared with another version's.
  writeFileSync(`${out}-s${s}-end.png`, shots[shots.length - 1].buf);
  await sheet.screenshot({ path, fullPage: true });
  await sheet.close();
  result.steps.push({ step: s, sheet: path, settled, changes, eval: evalNote, frames: shots.length });
}
if (app.errors.length) result.errors = app.errors;
writeFileSync(out + '.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await app.close();
