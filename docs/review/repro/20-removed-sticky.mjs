// A failed topic delete used to wipe progress and cards first, keep the topic, and then (with the
// tid stuck in the store's `removed` set) silently drop every later write for it.
// (a) The topic doc itself cannot be deleted (the db keeps answering 'unavailable'): nothing may be
//     lost, the page must say so, and Dan's later answers for the topic must still be saved.
// (b) One lesson delete blips once: the delete must still remove everything (children retried).
import { open, report, sleep, P, NOW, topic, lesson } from './lib.mjs';
const seed = () => ({ 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'), [P('profile')]: { prefs: {}, days: {} },
  [P('profile/progress/tA')]: { updatedAt: NOW, ideas: { i2: { stage: 'done', doneAt: NOW, say: [{ text: 'my words', at: NOW }] } } },
  [P('profile/cards/tA')]: { cards: { i2_c1: { id: 'i2_c1', tid: 'tA', iid: 'i2', type: 'choice', spec: {}, s: { due: '2026-12-01' }, hist: [] } } } });
// Every delete of a path matching `re` rejects 'unavailable' (`times` times; Infinity = always).
const failDeletes = (page, re, times) => page.evaluate(([src, n]) => {
  const real = U.rt.db, rx = new RegExp(src); let left = n === null ? Infinity : n;
  U.rt.db = { collection: (p) => real.collection(p), doc: (p) => { const r = real.doc(p); if (!rx.test(p)) return r;
    return Object.assign(Object.create(r), { get: () => r.get(), set: (d) => r.set(d), update: (d) => r.update(d), onSnapshot: (a, b) => r.onSnapshot(a, b),
      delete: () => (left-- > 0 ? Promise.reject({ code: 'unavailable', message: 'transient' }) : r.delete()) }); } };
}, [re.source, Number.isFinite(times) ? times : null]);

{ // (a)
  const app = await open({ db: seed(), sample: () => '{}' });
  const { page } = app;
  await page.goto(app.url('#/t/tA'));
  await page.waitForSelector('.tp-ready');
  await failDeletes(page, /^topics\/tA$/, Infinity);
  await page.click('.tp-delete'); await page.click('.sheet .btn.danger');
  await page.waitForSelector('#toasts .toast');
  await sleep(1500);
  const toast = await page.textContent('#toasts .toast');
  const stillThere = await page.evaluate(() => !!window.__CLAUDE_STUB__.get('topics/tA'));
  const kept = await page.evaluate(([a, b]) => ({ progress: !!window.__CLAUDE_STUB__.get(a), cards: !!window.__CLAUDE_STUB__.get(b), lesson: !!window.__CLAUDE_STUB__.get('topics/tA/lessons/i1') }), [P('profile/progress/tA'), P('profile/cards/tA')]);
  // Dan carries on with the topic: opens idea 1 and makes his guess.
  await page.evaluate(() => { location.hash = '#/t/tA/i1'; });
  await page.waitForSelector('.lsn-options .option');
  await page.click('.lsn-options .option >> nth=0'); await page.click('.lsn-main');
  await sleep(1000);
  const prog = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p), P('profile/progress/tA'));
  const saved = !!(prog && prog.ideas && prog.ideas.i1 && prog.ideas.i1.predict);
  report('a failed delete loses data or silently drops later writes', stillThere && (!kept.progress || !kept.cards || !kept.lesson || !saved),
    'toast: "' + toast + '"; topic still exists: ' + stillThere + '; still there: ' + JSON.stringify(kept) + '; guess saved afterwards: ' + saved);
  await app.close();
}
{ // (b)
  const app = await open({ db: seed(), sample: () => '{}' });
  const { page } = app;
  await page.goto(app.url('#/t/tA'));
  await page.waitForSelector('.tp-ready');
  await failDeletes(page, /lessons/, 1);
  await page.click('.tp-delete'); await page.click('.sheet .btn.danger');
  await page.waitForFunction(() => location.hash === '#/');
  await sleep(1500);
  const left = await page.evaluate(() => Object.keys(window.__CLAUDE_STUB__.dump()).filter((k) => /tA/.test(k)));
  report('a delete with one transient child failure leaves pieces behind', left.length > 0, 'docs for tA left: ' + JSON.stringify(left));
  await app.close();
}
