// (uncommitted 20-store.js change) topic.remove() adds the tid to `removed` before deleting and
// never takes it out. If the delete fails, the topic stays (the page says so and re-renders it),
// but every later write for it is silently dropped for the rest of the session.
import { open, report, sleep, P, NOW, topic, lesson } from './lib.mjs';
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'), [P('profile')]: { prefs: {}, days: {} },
  [P('profile/progress/tA')]: { updatedAt: NOW, ideas: { i2: { stage: 'done', doneAt: NOW, say: [{ text: 'my words', at: NOW }] } } },
  [P('profile/cards/tA')]: { cards: { i2_c1: { id: 'i2_c1', tid: 'tA', iid: 'i2', type: 'choice', spec: {}, s: { due: '2026-12-01' }, hist: [] } } } };
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/t/tA'));
await page.waitForSelector('.tp-ready');
await page.evaluate(() => {   // one transient failure on the delete of the lessons
  const real = U.rt.db; let blips = 1;
  U.rt.db = { collection: (p) => real.collection(p), doc: (p) => { const r = real.doc(p); if (!/lessons/.test(p)) return r;
    return Object.assign(Object.create(r), { get: () => r.get(), set: (d) => r.set(d), update: (d) => r.update(d), onSnapshot: (a, b) => r.onSnapshot(a, b),
      delete: () => (blips-- > 0 ? Promise.reject({ code: 'unavailable', message: 'transient' }) : r.delete()) }); } };
});
await page.click('.tp-delete'); await page.click('.sheet .btn.danger');
await page.waitForSelector('#toasts .toast');
await sleep(500);
const toast = await page.textContent('#toasts .toast');
const stillThere = await page.evaluate(() => !!window.__CLAUDE_STUB__.get('topics/tA'));
const wiped = await page.evaluate(([a, b]) => ({ progress: !!window.__CLAUDE_STUB__.get(a), cards: !!window.__CLAUDE_STUB__.get(b) }), [P('profile/progress/tA'), P('profile/cards/tA')]);
console.log('   after the failed delete the topic remains but progress exists: ' + wiped.progress + ', cards exist: ' + wiped.cards);
// Dan carries on with the topic: opens idea 1 and makes his guess.
await page.evaluate(() => { location.hash = '#/t/tA/i1'; });
await page.waitForSelector('.lsn-options .option');
await page.click('.lsn-options .option >> nth=0'); await page.click('.lsn-main');
await sleep(800);
const prog = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p), P('profile/progress/tA'));
report('after a failed delete, progress for the surviving topic is silently not saved', stillThere && !prog,
  'toast: "' + toast + '"; topic still exists: ' + stillThere + '; progress doc: ' + JSON.stringify(prog) + '; toasts now: ' + JSON.stringify(await page.$$eval('#toasts .toast', (t) => t.map((x) => x.textContent))));
await app.close();
