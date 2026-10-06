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

export async function openApp(opts = {}) {
  const {
    width = 360, height = 760, dark = false, config = {}, sample = null, tools = {},
    file = join(root, 'dist', 'my-university.html'), deny = [], headless = true,
  } = opts;
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: dark ? 'dark' : 'light', deviceScaleFactor: 2, hasTouch: width < 700 });
  // Web fonts can't load through this sandbox's proxy; fallbacks are fine for tests.
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await context.newPage();
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
  // Under heavy machine load, page.goto has occasionally resolved before the app's script ran
  // ("U is not defined" in the next evaluate). After a goto to the app, wait until the app's
  // global exists; if it never comes, load the page once more, saying so.
  const goto = page.goto.bind(page);
  page.goto = async (url, o) => {
    const res = await goto(url, o);
    if (!String(url).startsWith(base)) return res;
    // Every page the specs open is built from the app's core, which defines the global U.
    const up = () => page.waitForFunction(() => typeof window.U !== 'undefined', null, { timeout: 30000 });
    try { await up(); } catch (e) {
      console.warn('harness: the app had not started 30 s after goto; loading it again');
      await goto(url, o);
      await up();
    }
    return res;
  };
  return {
    browser, context, page, errors,
    url: (hash = '#/') => base + hash,
    stub: () => page.evaluate(() => window.__CLAUDE_STUB__.dump()),
    calls: () => page.evaluate(() => window.__CLAUDE_STUB__.calls),
    seed: (path, data) => page.evaluate(([p, d]) => window.__CLAUDE_STUB__.seed(p, d), [path, data]),
    shot: async (name) => { const dir = join(root, 'tests', 'out'); mkdirSync(dir, { recursive: true }); await page.screenshot({ path: join(dir, name + '.png'), fullPage: true }); return join(dir, name + '.png'); },
    close: () => browser.close(),
  };
}

export function readJson(rel) { return JSON.parse(readFileSync(join(root, rel), 'utf8')); }
export const ROOT = root;
