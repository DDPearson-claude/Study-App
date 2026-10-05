// A subscription that dies (the documented dead-bridge 'unavailable', 'resource_exhausted',
// 'revoked') is only console.error'd: Learn then claims Dan has no topics at all, and the topic page
// sits on its skeleton forever.
import { open, report, sleep, topic } from './lib.mjs';
const app = await open({ db: { 'topics/tA': topic('tA'), 'topics/tB': topic('tB', { title: 'Sourdough' }) }, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/'));
await page.waitForSelector('.tcard');
await page.evaluate(() => {
  const real = U.rt.db;
  const dying = (ref) => new Proxy(ref, { get(t, k) {
    if (k === 'onSnapshot') return (next, error) => { setTimeout(() => error && error({ code: 'unavailable', message: 'bridge stopped responding' }), 10); return () => {}; };
    if (k === 'orderBy' || k === 'where' || k === 'limit') return (...a) => dying(t[k](...a));
    const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
  } });
  U.rt.db = { doc: (p) => dying(real.doc(p)), collection: (p) => dying(real.collection(p)) };
});
await page.evaluate(() => { location.hash = '#/map'; });
await sleep(300);
await page.evaluate(() => { location.hash = '#/'; });
await sleep(800);
const learn = (await page.textContent('.learn-topics')).replace(/\s+/g, ' ').slice(0, 90);
await page.evaluate(() => { location.hash = '#/t/tA'; });
await sleep(3000);
const skeleton = await page.$('.tp .skeleton');
report('dead subscription shows "no topics" / endless skeleton', /starts here/.test(learn) && !!skeleton,
  'Learn shows: "' + learn + '"; topic page still skeleton after 3 s: ' + !!skeleton);
await app.close();
