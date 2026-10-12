// Dan taps through the ideas of a freshly planned topic (2 s each) before settling on one.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep, FX, summarizeSamples } from './harness.mjs';
const url = await serve();
const W = createWorld({ seed: { ['topics/jet']: Object.assign({}, FX.planJet, { id: 'jet', status: 'ready', research: { status: 'unavailable', at: new Date().toISOString(), sources: 0 } }) }, dbLatency: 150, taskLat: { 'write-lesson': 25000, 'build-interactive': 35000, 'repair-interactive': 35000 } });
const tab = await openTab(W, { label: 'A' });
const { page } = tab;
await page.goto(url + '#/t/jet', { waitUntil: 'commit' });
await page.locator('.pnode').first().waitFor();
for (const iid of ['i1', 'i2', 'i3', 'i4', 'i5', 'i6']) { await page.evaluate((h) => { location.hash = h; }, '#/t/jet/' + iid); await sleep(2000); }
await page.evaluate(() => { location.hash = '#/t/jet/i1'; });
const t0 = Date.now();
while (Date.now() - t0 < 240000) { const sts = [...W.store.keys()].filter((k) => k.includes('/lessons/')).map((k) => W.store.get(k).data.status); if (sts.length && sts.every((s) => s === 'ready' || s === 'failed') && W.sample.running === 0 && !W.sample.queue.length) break; await sleep(1000); }
const statuses = Object.fromEntries([...W.store.keys()].filter((k) => k.includes('/lessons/')).map((k) => [k.split('/').pop(), W.store.get(k).data.status + (W.store.get(k).data.error ? ': ' + W.store.get(k).data.error.slice(0, 60) : '')]));
const out = { samples: summarizeSamples(W), peakQueue: Math.max(...W.sample.log.map(() => 0)), log: W.sample.log.map((e) => [e.task, e.idea, e.tEnq, e.tRun, e.tEnd, e.outcome]), statuses, screen: (await page.locator('#view').innerText()).replace(/\s+/g, ' ').slice(0, 200), elapsed: W.now() };
console.log(JSON.stringify(out, null, 1));
save('s8-peek', out);
await closeBrowser(); stopServer();
