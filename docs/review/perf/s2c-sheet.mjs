import { createWorld, openTab, serve, closeBrowser, stopServer, memory, sleep } from './harness.mjs';
import { makeSeed } from './seed.mjs';
import { snapshot, analyze } from './heap.mjs';
const url = await serve();
const W = createWorld({ seed: makeSeed({ topics: 2, ideas: 6, stage: 'play' }), dbLatency: 30, taskLat: { tutor: 300 } });
const tab = await openTab(W, { label: 'A' });
const { page, cdp } = tab;
async function docListeners() {
  const { result } = await cdp.send('Runtime.evaluate', { expression: 'document' });
  const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
  const by = {}; listeners.forEach((l) => { by[l.type] = (by[l.type] || 0) + 1; });
  await cdp.send('Runtime.releaseObject', { objectId: result.objectId });
  return by;
}
await page.goto(url + '#/t/topic-0/i1', { waitUntil: 'commit' });
await page.locator('.kit-frame[data-state="live"]').waitFor({ timeout: 30000 });
await sleep(800);
console.log('start', JSON.stringify(await docListeners()), JSON.stringify(await memory(cdp)));
for (let k = 1; k <= 10; k++) {
  await page.locator('.lsn-ask').click();
  await page.locator('.tutor-input').fill('Question ' + k);
  await page.locator('.tutor-input').press('Enter');
  await page.waitForFunction(() => /gravity/.test((document.querySelector('.tutor-log') || {}).textContent || ''), null, { timeout: 30000 });
  // leave the lesson with the sheet still open (back gesture / tab tap)
  await page.evaluate((h) => { location.hash = h; }, '#/t/topic-0/i' + ((k % 6) + 1));
  await page.locator('.kit-frame[data-state="live"]').waitFor({ timeout: 30000 });
  await sleep(300);
}
console.log('after 10 opens left open', JSON.stringify(await docListeners()), JSON.stringify(await memory(cdp)));
const a = analyze(await snapshot(cdp), { paths: 2 });
console.log('detached', a.total, JSON.stringify(a.byName.slice(0, 6)));
a.paths.forEach((p) => console.log(p.node + '\n  ' + p.path.reverse().join('\n  ')));
await closeBrowser(); stopServer();
