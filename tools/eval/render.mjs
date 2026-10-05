#!/usr/bin/env node
// Self-tests and screenshots a model-written interactive body exactly as the app would run it.
//   node tools/eval/render.mjs body.html --out tests/out/eval/<name> [--app dist/my-university.html] [--no-moved]
// Writes <out>-report.json, <out>-{360,1280}-{light,dark}.png (the opening state) and
// <out>-{360,1280}-{light,dark}-moved.png: every control set to another value through the host's
// set() (a slider to 75% of its range, or to its top or middle if it opens near 75%; a choice or
// stepper to its next option; a toggle flipped), then the first K.button pressed or K.anim played.
// Then <out>-{360,1280}-{light,dark}-end.png: every control at its far end (a slider's top, or its
// bottom if it opens there; a choice's or stepper's last option) after 2.5 s, so an answer at the
// end of a process or a slow animation is seen. Prints the merged report plus what was moved.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { openApp, ROOT } from '../harness/page.mjs';

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }

// The setting a reviewer should see after Dan has played: something other than the opening one.
export function movedValue(c) {
  if (c.kind === 'choice' || c.kind === 'toggle') {
    const opts = c.options || [false, true];
    const i = opts.findIndex((v) => v === c.value);
    return opts[(i + 1) % opts.length];
  }
  if (c.kind === 'stepper') return c.value < c.max ? c.value + 1 : Math.max(0, c.value - 1);
  const span = c.max - c.min, at = (t) => c.log ? c.min * Math.pow(c.max / c.min, t) : c.min + t * span;
  const t = c.log ? Math.log(c.value / c.min) / Math.log(c.max / c.min) : (c.value - c.min) / span;
  return at(Math.abs(t - 0.75) >= 0.1 ? 0.75 : t < 0.75 ? 1 : 0.5);
}

// The far end of a control: what a reviewer should also see.
export function endValue(c) {
  if (c.kind === 'choice' || c.kind === 'stepper') {
    const opts = c.options || [];
    if (opts.length) return opts[opts.length - 1] === c.value ? opts[0] : opts[opts.length - 1];
    return c.max != null ? (c.value === c.max ? 0 : c.max) : c.value;
  }
  if (c.kind === 'toggle') return !c.value;
  return c.value >= c.max ? c.min : c.max;
}

export async function renderBody(body, out, appFile, o = {}) {
  mkdirSync(dirname(out), { recursive: true });
  const shots = [];
  let report = null, moves = null;
  for (const width of [360, 1280]) {
    for (const theme of ['light', 'dark']) {
      const app = await openApp({ width, height: 900, file: appFile });
      // The in-page move loop below uses movedValue.
      await app.page.addInitScript(`window.__movedValue = ${movedValue.toString()}; window.__endValue = ${endValue.toString()};`);
      await app.page.goto(app.url('#/__eval'));
      await app.page.evaluate((t) => { document.documentElement.dataset.muTheme = t; }, theme);
      if (!report) {
        report = await app.page.evaluate(async (html) => { await U.rt.ready; return U.sandbox.test(html, { widths: [340, 720, 1040], timeout: 9000 }); }, body);
      }
      await app.page.evaluate(async (html) => {
        await U.rt.ready;
        // Our own host outside the app shell, so the app's router can't clear it.
        const shell = document.getElementById('app');
        if (shell) shell.style.display = 'none';
        const host = document.createElement('div');
        host.style.cssText = 'min-height:100vh;background:var(--bg);padding:1px 0';
        document.body.appendChild(host);
        const box = document.createElement('div');
        box.style.cssText = 'max-width:' + (window.innerWidth >= 1000 ? 1080 : 720) + 'px;margin:16px auto;padding:0 16px';
        host.appendChild(box);
        window.__render = U.sandbox.mount(box, { html });
        await Promise.race([window.__render.ready, new Promise((r) => setTimeout(r, 6000))]);
        await new Promise((r) => setTimeout(r, 500));
      }, body);
      const path = `${out}-${width}-${theme}.png`;
      await app.page.screenshot({ path, fullPage: true });
      shots.push(path);
      if (o.moved !== false) {
        const did = await app.page.evaluate(async () => {
          const m = window.__render, done = [];
          if (!m || typeof m.inputs !== 'function') return done;
          const info = await m.inputs().catch(() => null);
          if (!info) return done;
          for (const c of info.inputs) {
            const v = window.__movedValue(c);
            try { await m.set(c.id, v); done.push(c.id + ' = ' + JSON.stringify(v)); } catch (e) { done.push(c.id + ': ' + (e && e.message)); }
          }
          if (info.actions.length) {
            try { await m.press(); done.push('pressed "' + info.actions[0] + '"'); } catch (e) { done.push('press: ' + (e && e.message)); }
          }
          await new Promise((r) => setTimeout(r, info.actions.length ? 1500 : 500));
          return done;
        }).catch((e) => ['could not move: ' + e.message]);
        if (!moves) moves = did;
        const mpath = `${out}-${width}-${theme}-moved.png`;
        await app.page.screenshot({ path: mpath, fullPage: true });
        shots.push(mpath);
        await app.page.evaluate(async () => {
          const m = window.__render;
          const info = m && typeof m.inputs === 'function' ? await m.inputs().catch(() => null) : null;
          for (const c of (info && info.inputs) || []) { try { await m.set(c.id, window.__endValue(c)); } catch (e) { /* reported by the moved pass */ } }
          await new Promise((r) => setTimeout(r, 2500));
        }).catch(() => {});
        const epath = `${out}-${width}-${theme}-end.png`;
        await app.page.screenshot({ path: epath, fullPage: true });
        shots.push(epath);
      }
      if (app.errors.length) report.hostErrors = (report.hostErrors || []).concat(app.errors);
      await app.close();
    }
  }
  writeFileSync(out + '-report.json', JSON.stringify({ report, moved: moves, shots }, null, 2));
  return { report, moved: moves, shots };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  const out = resolve(arg('out', `${ROOT}/tests/out/eval/render`));
  const r = await renderBody(readFileSync(file, 'utf8'), out, arg('app') ? resolve(arg('app')) : undefined, { moved: !process.argv.includes('--no-moved') });
  console.log(JSON.stringify(r, null, 2));
}
