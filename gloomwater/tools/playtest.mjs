// Headless Chromium smoke test for Gloomwater.
//
//   node tools/playtest.mjs [--html=index.html] [--shots=tools/out/shots] [--script=path.mjs]
//                           [--width=1280] [--height=720] [--mobile] [--wait=4000]
//
// Default scenario: load page, wait, screenshot title, start a new run, wait,
// screenshot, perform a cast (hold+release), wait, screenshot. Prints all console
// errors / page errors and ctx.errors, and exits non-zero if any page error occurred.
//
// Custom scenario: --script=file.mjs exporting `default async function (api)` where
// api = { page, shot(name), wait(ms), evalGame(fn, arg), hold(ms, x?, y?), click(x, y), log }
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
const shot = async (name) => {
  const p = resolve(shotsDir, `${name}.png`);
  await page.screenshot({ path: p });
  console.log('screenshot', p);
  return p;
};
const evalGame = (fn, arg) => page.evaluate(fn, arg);
const hold = async (ms, x = width / 2, y = height * 0.6) => {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await wait(ms);
  await page.mouse.up();
};
const click = async (x, y) => { await page.mouse.click(x, y); };
const log = (...a) => console.log('[scenario]', ...a);
const api = { page, shot, wait, evalGame, hold, click, log, width, height };

const t0 = Date.now();
await page.goto(pathToFileURL(htmlPath).href);
await wait(Number(args.wait || 4000));

try {
  if (args.script) {
    const mod = await import(pathToFileURL(resolve(process.cwd(), String(args.script))).href);
    await mod.default(api);
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
