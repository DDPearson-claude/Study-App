// Main-thread cost of each tab screen with a big library (40 topics x 8 ideas), 4x CPU, and the
// cost of one live update (another device touches a topic) while Learn is open.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep } from './harness.mjs';
import { makeSeed } from './seed.mjs';
const url = await serve();
const N = Number(process.argv[2] || 40);
const W = createWorld({ seed: makeSeed({ topics: N, ideas: 8 }), dbLatency: 100 });
const tab = await openTab(W, { label: 'A', cpu: 4 });
const { page } = tab;
await page.goto(url + '#/today', { waitUntil: 'commit' });
await page.locator('.td-title').waitFor({ timeout: 60000 });
await sleep(1500);
const rows = [];
for (const [name, hash, sel] of [['learn', '#/', '.tcard:not(.is-skeleton)'], ['map', '#/map', '.map-topic svg'], ['book', '#/book', '.book-topic'], ['today', '#/today', '.td-title'], ['topic', '#/t/topic-3', '.pnode']]) {
  await page.evaluate(() => { window.__perf.lt.length = 0; });
  const q0 = W.counts.query || 0, g0 = W.counts.get || 0;
  const t = Date.now();
  await page.evaluate((h) => { location.hash = h; }, hash);
  await page.locator(sel).first().waitFor({ timeout: 60000 });
  const ms = Date.now() - t;
  await sleep(2500);
  const lt = await page.evaluate(() => window.__perf.lt);
  const nodes = await page.evaluate(() => document.getElementsByTagName('*').length);
  rows.push({ name, ms, longTasks: lt.length, longTaskMs: lt.reduce((a, x) => a + x[1], 0), top: lt.map((x) => x[1]).sort((a, b) => b - a).slice(0, 4), queries: (W.counts.query || 0) - q0, gets: (W.counts.get || 0) - g0, nodes });
  console.log(JSON.stringify(rows[rows.length - 1]));
}
// live update while Learn is open
await page.evaluate(() => { location.hash = '#/'; });
await page.locator('.tcard:not(.is-skeleton)').first().waitFor();
await sleep(2000);
await page.evaluate(() => { window.__perf.lt.length = 0; });
const q0 = W.counts.query || 0;
for (let i = 0; i < 5; i++) {
  const p = 'topics/topic-' + i; const d = JSON.parse(JSON.stringify(W.store.get(p).data)); d.updatedAt = new Date().toISOString(); d.research = { status: 'running', at: d.updatedAt, sources: 0 };
  // simulate another device's write landing (heartbeat/research status)
  W.store.set(p, { data: d, version: 99 });
  for (const sub of W.subs.values()) if (sub.kind === 'query' && sub.coll === 'topics') await sub.page.evaluate(([id, pl]) => window.__rtDeliver(id, 'query', pl), [sub.id, [...W.store.keys()].filter((k) => /^topics\/[^/]+$/.test(k)).map((k) => ({ id: k.split('/')[1], exists: true, data: W.store.get(k).data })).sort((a, b) => (b.data.updatedAt || '').localeCompare(a.data.updatedAt || ''))]);
  await sleep(1000);
}
await sleep(1500);
const lt = await page.evaluate(() => window.__perf.lt);
const live = { name: 'learn: 5 topic updates from another device', longTasks: lt.length, longTaskMs: lt.reduce((a, x) => a + x[1], 0), top: lt.map((x) => x[1]).sort((a, b) => b - a).slice(0, 5), progressQueries: (W.counts.query || 0) - q0 };
console.log(JSON.stringify(live));
save('s10-screens-' + N, { rows, live });
await closeBrowser(); stopServer();
