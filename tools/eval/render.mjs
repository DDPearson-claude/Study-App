#!/usr/bin/env node
// Self-tests and screenshots a model-written interactive body exactly as the app would run it.
//   node tools/eval/render.mjs body.html --out tests/out/eval/<name> [--app dist/my-university.html]
// Writes <out>-report.json and <out>-{360,1280}-{light,dark}.png; prints the merged report.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { openApp, ROOT } from '../harness/page.mjs';

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }

export async function renderBody(body, out, appFile) {
  mkdirSync(dirname(out), { recursive: true });
  const shots = [];
  let report = null;
  for (const width of [360, 1280]) {
    for (const theme of ['light', 'dark']) {
      const app = await openApp({ width, height: 900, file: appFile });
      await app.page.goto(app.url('#/__eval'));
      await app.page.evaluate((t) => { document.documentElement.dataset.muTheme = t; }, theme);
      if (!report) {
        report = await app.page.evaluate(async (html) => { await U.rt.ready; return U.sandbox.test(html, { widths: [340, 720], timeout: 9000 }); }, body);
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
        box.style.cssText = 'max-width:720px;margin:16px auto;padding:0 16px';
        host.appendChild(box);
        const m = U.sandbox.mount(box, { html });
        await Promise.race([m.ready, new Promise((r) => setTimeout(r, 6000))]);
        await new Promise((r) => setTimeout(r, 500));
      }, body);
      const path = `${out}-${width}-${theme}.png`;
      await app.page.screenshot({ path, fullPage: true });
      shots.push(path);
      if (app.errors.length) report.hostErrors = (report.hostErrors || []).concat(app.errors);
      await app.close();
    }
  }
  writeFileSync(out + '-report.json', JSON.stringify({ report, shots }, null, 2));
  return { report, shots };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  const out = resolve(arg('out', `${ROOT}/tests/out/eval/render`));
  const r = await renderBody(readFileSync(file, 'utf8'), out, arg('app') ? resolve(arg('app')) : undefined);
  console.log(JSON.stringify(r, null, 2));
}
