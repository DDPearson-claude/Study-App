import { createWorld, openTab, serve, closeBrowser, stopServer, sleep } from './harness.mjs';
import { makeSeed } from './seed.mjs';
const url = await serve();
const W = createWorld({ seed: makeSeed({ topics: 3 }), dbLatency: 60 });
const tab = await openTab(W, { fontMs: 20000, watch: [['learn', '.tcard:not(.is-skeleton)']] });
const t0 = Date.now();
await tab.page.goto(url + '#/', { waitUntil: 'commit' });
for (const t of [2000, 10000, 19000, 22000]) {
  await sleep(t - (Date.now() - t0));
  const s = await tab.page.evaluate(() => ({ U: typeof window.U, fcp: window.__perf.paints['first-contentful-paint'] || null, learn: window.__perf.marks.learn || null, view: (document.getElementById('view') || {}).childElementCount }));
  console.log('t=' + t, JSON.stringify(s));
}
await closeBrowser(); stopServer();
