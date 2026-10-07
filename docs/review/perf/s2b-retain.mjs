import { createWorld, openTab, serve, closeBrowser, stopServer, memory, sleep } from './harness.mjs';
import { makeSeed } from './seed.mjs';
import { snapshot, analyze } from './heap.mjs';
const url = await serve();
const variant = process.argv[2] || 'lesson-only';
const W = createWorld({ seed: makeSeed({ topics: 2, ideas: 6, stage: 'play' }), dbLatency: 30 });
const tab = await openTab(W, { label: 'A' });
const { page, cdp } = tab;
const live = () => page.waitForFunction(() => { const f = document.querySelector('.kit-frame'); return f && f.dataset.state === 'live'; }, null, { timeout: 30000, polling: 50 });
const first = variant === 'topic-only' ? '#/t/topic-0' : variant === 'learn-only' ? '#/' : '#/t/topic-0/i1';
await page.goto(url + first, { waitUntil: 'commit' });
await sleep(2500);
console.log(variant, 'start', JSON.stringify(await memory(cdp)));
for (let k = 1; k <= 10; k++) {
  if (variant === 'lesson-only') { await page.evaluate((h) => { location.hash = h; }, '#/t/topic-0/i' + ((k % 6) + 1)); await live(); }
  else if (variant === 'topic-only') { await page.evaluate((h) => { location.hash = h; }, k % 2 ? '#/t/topic-1' : '#/t/topic-0'); await page.locator('.pnode').first().waitFor(); }
  else if (variant === 'learn-only') { await page.evaluate((h) => { location.hash = h; }, k % 2 ? '#/map' : '#/'); await sleep(800); }
  await sleep(600);
}
console.log(variant, 'after 10', JSON.stringify(await memory(cdp)));
const snap = await snapshot(cdp);
const a = analyze(snap, { paths: 4 });
console.log('detached:', a.total, JSON.stringify(a.byName));
a.paths.forEach((p) => console.log('\n' + p.node + '\n  ' + p.path.reverse().join('\n  ')));
await closeBrowser(); stopServer();
