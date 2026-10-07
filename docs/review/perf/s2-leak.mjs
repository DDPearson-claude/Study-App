// Memory/listener/iframe/subscription growth when navigating lesson -> topic -> next lesson, 20 times.
import { createWorld, openTab, serve, closeBrowser, stopServer, memory, save, sleep } from './harness.mjs';
import { makeSeed } from './seed.mjs';
const url = await serve();
const variant = process.argv[2] || 'via-topic';
const W = createWorld({ seed: makeSeed({ topics: 4, ideas: 6, stage: 'play' }), dbLatency: 80, taskLat: { tutor: 500, grade: 500 } });
const tab = await openTab(W, { cpu: 4, label: 'A' });
const { page, cdp } = tab;
async function waitLive(timeout = 30000) {
  await page.waitForFunction(() => { const f = document.querySelector('.kit-frame'); return f && f.dataset.state === 'live'; }, null, { timeout, polling: 50 });
}
async function state() {
  const m = await memory(cdp);
  const p = await page.evaluate(() => ({
    iframes: document.querySelectorAll('iframe').length,
    bus: Object.fromEntries(Object.entries(U._bus).map(([k, v]) => [k, v.length])),
    toasts: document.getElementById('toasts').childElementCount,
    sheets: document.getElementById('sheets').childElementCount,
    lsKeys: (() => { try { return localStorage.length; } catch (e) { return -1; } })(),
  }));
  return Object.assign(m, p, { frames: page.frames().length, subs: W.subsByLabel.A || 0 });
}
await page.goto(url + '#/t/topic-0/i1', { waitUntil: 'commit' });
await waitLive();
await sleep(1500);
const rows = [];
const s0 = await state();
rows.push(Object.assign({ visit: 0 }, s0));
console.log('start', JSON.stringify(s0));
await page.evaluate(() => { window.__perf.lt.length = 0; });
const navMs = [];
for (let k = 1; k <= 20; k++) {
  const iid = 'i' + ((k % 6) + 1);
  if (variant === 'via-topic') {
    await page.evaluate(() => { location.hash = '#/t/topic-0'; });
    await page.locator('.pnode').first().waitFor({ timeout: 20000 });
    await sleep(300);
  }
  if (variant === 'tutor') {
    await page.locator('.lsn-ask').click();
    await page.locator('.tutor-input').fill('Why does length matter?');
    await page.locator('.tutor-input').press('Enter');
    await page.waitForFunction(() => /gravity/.test(document.querySelector('.tutor-log').textContent), null, { timeout: 60000 });
  }
  const t = Date.now();
  await page.evaluate((h) => { location.hash = h; }, '#/t/topic-0/' + iid);
  await waitLive();
  navMs.push(Date.now() - t);
  await sleep(700);
  if (k % 5 === 0) { const s = await state(); rows.push(Object.assign({ visit: k }, s)); console.log('visit', k, JSON.stringify(s)); }
}
const lt = await page.evaluate(() => window.__perf.lt);
const lts = lt.map((x) => x[1]).sort((a, b) => b - a);
console.log('nav->interactive live ms (median, max):', navMs.slice().sort((a, b) => a - b)[10], Math.max(...navMs));
console.log('long tasks during 20 navs:', lt.length, 'total', lts.reduce((a, b) => a + b, 0), 'ms; top', lts.slice(0, 8).join(','), 'by container', JSON.stringify(lt.reduce((o, x) => (o[x[2]] = (o[x[2]] || 0) + 1, o), {})));
console.log('max subs', JSON.stringify(W.maxSubsByLabel), 'errors', tab.errors.slice(0, 3));
save('s2-leak-' + variant, { rows, navMs, lt, maxSubs: W.maxSubsByLabel, samples: W.sample.log.map((e) => [e.task, e.outcome]) });
await closeBrowser(); stopServer();
