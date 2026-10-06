// Shared Playwright helper: opens the built app (or any page) with the claude.ai runtime stub.
//
//   import { openApp } from '../../tools/harness/page.mjs';
//   const app = await openApp({ width: 360, sample: (input, info) => reply, tools: {...} });
//   await app.page.goto(app.url('#/'));  ...  await app.close();
//
// sample(input, info) runs in Node. `input` is the prompt string (or the turns array);
// info = { tier, toolNames }. Return a string or an object (objects are JSON-encoded).
// Every prompt begins with "TASK: <name>", so route on that: taskOf(input).
// tools: { 'Server Name': { toolName: (input) => payload } } run in Node too.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STUB = join(root, 'tools', 'harness', 'claude-stub.js');

export function taskOf(input) {
  const text = typeof input === 'string' ? input : (Array.isArray(input) ? (input.find((t) => t.role === 'user') || {}).content || '' : '');
  const m = String(text).match(/^TASK:\s*([a-z-]+)/m);
  return m ? m[1] : 'unknown';
}

// Starting the browser, loading the page and waiting for U.boot.ready get a generous limit: with
// several browser tests running on the machine at once, boot alone has taken over Playwright's
// default 30 s. Only these waits are longer; what each test checks is unchanged.
export const BOOT_MS = 90000;

export async function openApp(opts = {}) {
  const {
    width = 360, height = 760, dark = false, config = {}, sample = null, tools = {},
    file = join(root, 'dist', 'my-university.html'), deny = [], headless = true,
  } = opts;
  const browser = await chromium.launch({ headless, timeout: BOOT_MS });
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: dark ? 'dark' : 'light', deviceScaleFactor: 2, hasTouch: width < 700 });
  // Web fonts can't load through this sandbox's proxy; fallbacks are fine for tests.
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(BOOT_MS);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack || e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });

  await page.exposeFunction('__nodeSample', async (input, info) => {
    if (!sample) throw new Error('no sample handler');
    const out = await sample(input, info);
    return typeof out === 'string' ? out : JSON.stringify(out);
  });
  await page.exposeFunction('__nodeTool', async (server, tool, input) => {
    const h = tools[server] && tools[server][tool];
    if (!h) throw new Error('no tool ' + server + '/' + tool);
    return JSON.stringify(await h(input));
  });
  await page.addInitScript((cfg) => { window.__CLAUDE_STUB_CONFIG__ = cfg; }, { ...config, deny });
  await page.addInitScript({ path: STUB });
  await page.addInitScript((toolList) => {
    const S = window.__CLAUDE_STUB__;
    S.onSample((input, o) => window.__nodeSample(input, { tier: o.modelTier, toolNames: (o.tools || []).map((t) => t.name) }));
    toolList.forEach(([server, tool]) => S.onTool(server, tool, (input) => window.__nodeTool(server, tool, input).then((s) => JSON.parse(s))));
  }, Object.entries(tools).flatMap(([s, t]) => Object.keys(t).map((k) => [s, k])));

  const base = pathToFileURL(file).href;
  return {
    browser, context, page, errors,
    url: (hash = '#/') => base + hash,
    // Boot has finished (U.boot.ready, in builds that include 99-boot.js): routed, badge started.
    booted: () => page.waitForFunction(() => window.U && U.boot && U.boot.ready === true, null, { timeout: BOOT_MS }),
    stub: () => page.evaluate(() => window.__CLAUDE_STUB__.dump()),
    calls: () => page.evaluate(() => window.__CLAUDE_STUB__.calls),
    seed: (path, data) => page.evaluate(([p, d]) => window.__CLAUDE_STUB__.seed(p, d), [path, data]),
    shot: async (name) => { const dir = join(root, 'tests', 'out'); mkdirSync(dir, { recursive: true }); await page.screenshot({ path: join(dir, name + '.png'), fullPage: true }); return join(dir, name + '.png'); },
    close: () => browser.close(),
  };
}

export function readJson(rel) { return JSON.parse(readFileSync(join(root, rel), 'utf8')); }
export const ROOT = root;
