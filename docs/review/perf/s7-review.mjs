// Review session cost: db reads per answer, main-thread time, with a heavier card store.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep, NET } from './harness.mjs';
import { makeSeed } from './seed.mjs';
const url = await serve();
const T = Number(process.argv[2] || 30);
const seed = makeSeed({ topics: T, ideas: 8 });
const cardBytes = Object.entries(seed).filter(([k]) => k.includes('/cards/')).reduce((a, [, v]) => a + JSON.stringify(v).length, 0);
const W = createWorld({ seed, dbLatency: 600, taskLat: { grade: 8000 } });
const tab = await openTab(W, { label: 'A', cpu: 4, net: NET.slow4g });
const { page } = tab;
await page.goto(url + '#/today', { waitUntil: 'commit' });
await page.locator('.td-start').waitFor({ timeout: 60000 });
const q0 = W.counts.query || 0, g0 = W.counts.get || 0;
await page.evaluate(() => { window.__perf.lt.length = 0; });
await page.locator('.td-start').click();
const per = [];
for (let i = 0; i < 10; i++) {
  const card = page.locator('.qc').first();
  await card.waitFor({ timeout: 60000 });
  const type = await card.getAttribute('class');
  const t = Date.now();
  if (/qc-type-choice/.test(type)) { await card.locator('.qc-opt').first().click(); await card.locator('.qc-primary').click(); }
  else if (/qc-type-order/.test(type)) { const chips = card.locator('.qc-chip'); while (await chips.count()) await chips.first().click(); await card.locator('.qc-primary').click(); }
  else if (/qc-type-estimate/.test(type)) { await card.locator('.qc-nudge').last().click(); await card.locator('.qc-primary').click(); }
  else if (/qc-type-recall/.test(type)) { await card.locator('textarea').fill('A longer string swings more slowly.'); await card.locator('.qc-primary').click(); }
  else { await card.locator('.qc-continue').click(); continue; }
  await card.locator('.qc-continue:not([disabled])').click();
  per.push(Date.now() - t);
  await sleep(300);
}
await sleep(4000);
const lt = await page.evaluate(() => window.__perf.lt);
const out = { topics: T, cardDocsKB: Math.round(cardBytes / 1024), queriesDuringReview: (W.counts.query || 0) - q0, getsDuringReview: (W.counts.get || 0) - g0, longTasks: lt.length, longTaskMs: lt.reduce((a, x) => a + x[1], 0), top: lt.map((x) => x[1]).sort((a, b) => b - a).slice(0, 6), samples: W.sample.log.map((e) => e.task) };
console.log(JSON.stringify(out));
save('s7-review-' + T, out);
await closeBrowser(); stopServer();
