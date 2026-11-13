// Headless Chromium smoke test for Gloomwater.
//
//   node tools/playtest.mjs [--html=index.html] [--shots=tools/out/shots] [--script=path.mjs]
//                           [--width=1280] [--height=720] [--mobile] [--wait=4000] [--lean[=0.45]]
//
// Default scenario: load page, wait, screenshot title, start a new run, wait,
// screenshot, perform a cast (hold+release), wait, screenshot. Prints all console
// errors / page errors and ctx.errors, and exits non-zero if any page error occurred.
//
// Custom scenario: --script=file.mjs exporting `default async function (api)` where
// api = { page, shot(name), wait(ms), frames(n), evalGame(fn, arg), hold(ms, x?, y?), click(x, y), log,
//         width, height, args }. A scenario may return { failures: [string] } (or throw) to fail the run.
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));
const htmlPath = resolve(here, '..', String(args.html || 'index.html'));
const shotsDir = resolve(here, '..', String(args.shots || 'tools/out/shots'));
mkdirSync(shotsDir, { recursive: true });
const width = Number(args.width || (args.mobile ? 390 : 1280));
const height = Number(args.height || (args.mobile ? 844 : 720));

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const context = await browser.newContext({
  viewport: { width, height }, deviceScaleFactor: 1,
  hasTouch: !!args.mobile, isMobile: !!args.mobile,
});
// v3 debug builds (CONTRACT §13.1, §13.11): hidden-state hooks register only when GW_DEBUG is set before the page's scripts
// run; scenarios get them unless --release (a release build: no species, roll, plan or pre-roll on window.__gw)
if (!args.release) await context.addInitScript(() => { globalThis.GW_DEBUG = true; });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') {
    const text = m.text();
    if (/fonts\.g(oogleapis|static)\.com|ERR_TUNNEL|ERR_CONNECTION|net::ERR/.test(text)) return; // offline font fetch
    (m.type() === 'error' ? consoleErrors : []).push(text);
    if (args.verbose) console.log(`[console.${m.type()}]`, text);
  } else if (args.verbose) console.log(`[console.${m.type()}]`, m.text());
});
page.on('pageerror', (e) => pageErrors.push(String(e?.stack || e)));
// block remote font requests quickly (offline sandbox)
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());

const wait = (ms) => page.waitForTimeout(ms);
// Software GL on a shared machine can drop to ~1 fps: give screenshots time, retry once, and
// never fail a scenario on a screenshot timeout alone (it is logged instead).
const shot = async (name) => {
  const p = resolve(shotsDir, `${name}.png`);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await page.screenshot({ path: p, timeout: 90000 });
      console.log('screenshot', p);
      return p;
    } catch (e) {
      console.log(`screenshot ${name} failed (attempt ${attempt + 1}): ${String(e?.message || e).split('\n')[0]}`);
    }
  }
  return null;
};
/** Resolve after n rendered frames (game time advances only with frames). */
const frames = (n = 1) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const evalGame = (fn, arg) => page.evaluate(fn, arg);
const hold = async (ms, x = width / 2, y = height * 0.6) => {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await wait(ms);
  await page.mouse.up();
};
const click = async (x, y) => { await page.mouse.click(x, y); };
const log = (...a) => console.log('[scenario]', ...a);
const api = { page, shot, wait, frames, evalGame, hold, click, log, width, height, args };

const t0 = Date.now();
await page.goto(pathToFileURL(htmlPath).href, { timeout: Number(args.gotoTimeout || 240000) });   // a loaded software-GL box needs more than 30 s
await wait(Number(args.wait || 4000));
// --lean[=0.45]: render below CSS resolution (debug.renderScale) for fast, logic-only runs
if (args.lean) {
  const sc = args.lean === true ? 0.45 : Number(args.lean);
  await evalGame((sc) => window.__gw?.debug?.renderScale?.(sc), sc).catch(() => {});
}

try {
  if (args.script) {
    const mod = await import(pathToFileURL(resolve(process.cwd(), String(args.script))).href);
    const res = await mod.default(api);
    for (const f of (res && Array.isArray(res.failures) ? res.failures : [])) pageErrors.push('assertion: ' + f);
  } else {
    await shot('01-title');
    await evalGame(() => window.__gw?.game?.startNewRun({}));
    await wait(3000);
    await shot('02-run-start');
    await hold(700);
    await wait(2500);
    await shot('03-after-cast');
    const info = await evalGame(() => ({
      flow: window.__gw?.flow,
      fishing: window.__gw?.fishing?.state,
      phase: window.__gw?.survival?.getPhaseInfo?.(),
      run: window.__gw?.state?.run && { day: window.__gw.state.run.day, hp: window.__gw.state.run.hp, oil: window.__gw.state.run.oil, satiety: window.__gw.state.run.satiety, zone: window.__gw.state.run.zone },
      calls: window.__gw?.render?.renderer?.info?.render?.calls,
      tris: window.__gw?.render?.renderer?.info?.render?.triangles,
    }));
    console.log('state', JSON.stringify(info));
  }
} catch (e) {
  pageErrors.push('scenario failed: ' + (e?.stack || e));
}

const gameErrors = await evalGame(() => (window.__gw?.errors || []).slice()).catch(() => []);
const fps = await evalGame(async () => {
  let n = 0; const s = performance.now();
  await new Promise((r) => { const f = () => { n++; if (performance.now() - s < 1000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
  return n;
}).catch(() => -1);

console.log(`\n=== playtest summary (${((Date.now() - t0) / 1000).toFixed(1)}s, ~${fps} fps in software GL) ===`);
console.log(`page errors: ${pageErrors.length}`);
pageErrors.forEach((e) => console.log('  PAGEERROR', e));
console.log(`console errors: ${consoleErrors.length}`);
consoleErrors.slice(0, 40).forEach((e) => console.log('  CONSOLE', e));
console.log(`ctx.errors: ${gameErrors.length}`);
gameErrors.slice(0, 40).forEach((e) => console.log('  GAME', e));
await browser.close();
process.exit(pageErrors.length || gameErrors.length ? 1 : 0);
