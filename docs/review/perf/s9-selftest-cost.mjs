// Main-thread cost of the hidden self-test (U.sandbox.test at 340 + 720 px) on a 4x-throttled CPU,
// i.e. what a background prefetch does to the lesson Dan is using.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep, SKATER, FX } from './harness.mjs';
import { makeSeed } from './seed.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './harness.mjs';
const url = await serve();
const bodies = {
  skater: SKATER,
  pendulum: FX.pendulum.interactive.html,
  brayton: readFileSync(join(ROOT, 'app', 'kit', 'examples', 'brayton-efficiency.html'), 'utf8'),
  'bill-to-law': readFileSync(join(ROOT, 'app', 'kit', 'examples', 'bill-to-law.html'), 'utf8'),
};
const W = createWorld({ seed: makeSeed({ topics: 1, ideas: 2, stage: 'play' }), dbLatency: 50 });
const tab = await openTab(W, { label: 'A', cpu: 4 });
const { page } = tab;
await page.goto(url + '#/t/topic-0/i1', { waitUntil: 'commit' });
await page.locator('.kit-frame[data-state="live"]').waitFor({ timeout: 30000 });
await sleep(2000);
const rows = [];
for (const [name, html] of Object.entries(bodies)) {
  await page.evaluate(() => { window.__perf.lt.length = 0; });
  const r = await page.evaluate(async (h) => {
    const t0 = performance.now();
    // a probe for input latency on the page while the test runs: how late do 50 ms timers fire?
    let worst = 0, n = 0, last = performance.now();
    const probe = setInterval(() => { const now = performance.now(); worst = Math.max(worst, now - last - 50); last = now; n++; }, 50);
    const rep = await U.sandbox.test(h, { widths: [340, 720] });
    clearInterval(probe);
    return { ms: Math.round(performance.now() - t0), ok: rep.ok, errors: (rep.errors || []).slice(0, 2), worstTimerLagMs: Math.round(worst) };
  }, html);
  const lt = await page.evaluate(() => window.__perf.lt);
  rows.push({ name, kb: +(html.length / 1024).toFixed(1), ...r, longTasks: lt.length, longTaskMs: lt.reduce((a, x) => a + x[1], 0), top: lt.map((x) => x[1]).sort((a, b) => b - a).slice(0, 5) });
  console.log(JSON.stringify(rows[rows.length - 1]));
}
save('s9-selftest-cost', rows);
await closeBrowser(); stopServer();
