// Count live db subscriptions across many route changes (limit is 64 per view).
import { open, report, sleep, P, NOW, topic, lesson } from './lib.mjs';
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'),
  'topics/tA/lessons/i2': { status: 'building', updatedAt: NOW, by: { device: 'other', page: 'x' }, lesson: lesson('i2').lesson } };
const app = await open({ db, sample: () => new Promise(() => {}) });
const { page } = app;
await page.goto(app.url('#/'));
await page.waitForSelector('.tcard');
await page.evaluate(() => {
  const real = U.rt.db; window.__subs = 0;
  const count = (ref) => new Proxy(ref, { get(t, k) {
    if (k === 'onSnapshot') return (n, e) => { window.__subs++; const stop = t.onSnapshot(n, e); let done = false; return () => { if (!done) { done = true; window.__subs--; } stop(); }; };
    if (k === 'orderBy' || k === 'where' || k === 'limit') return (...a) => count(t[k](...a));
    const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
  } });
  U.rt.db = { doc: (p) => count(real.doc(p)), collection: (p) => count(real.collection(p)) };
});
const routes = ['#/t/tA', '#/t/tA/i1', '#/t/tA/i2', '#/today', '#/review', '#/map', '#/book', '#/'];
const seen = [];
for (let round = 0; round < 4; round++) for (const r of routes) { await page.evaluate((h) => { location.hash = h; }, r); await sleep(250); seen.push(await page.evaluate(() => window.__subs)); }
console.log((Math.max(...seen) < 10 ? 'OK ' : 'PROBLEM ') + 'subscriptions stay bounded across navigation\n   live subscriptions after each route: ' + seen.join(','));
await app.close();
