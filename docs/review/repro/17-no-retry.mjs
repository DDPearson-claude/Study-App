// The db contract says a verb rejecting 'unavailable' (transient) should be retried once after a
// short randomized delay. U.store never retries: one blip drops the coalesced patch for good, e.g.
// Dan's say-it-back answer, while the screen shows it as saved.
import { open, report, sleep, P, NOW, topic, lesson } from './lib.mjs';
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'),
  [P('profile/progress/tA')]: { updatedAt: NOW, lastIdea: 'i1', ideas: { i1: { stage: 'say', startedAt: NOW, predict: { answer: 'x', at: NOW } } } } };
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/t/tA/i1'));
await page.waitForSelector('.lsn-say-input');
await sleep(1000); // let the on-open progress write land first
await page.evaluate((progPath) => {
  U.gen.grade = () => Promise.resolve({ met: [true, true], verdict: 'got-it', nailed: 'Yes.', followUp: '' });
  const real = U.rt.db; let blips = 1;
  U.rt.db = { collection: (p) => real.collection(p), doc: (p) => {
    const r = real.doc(p);
    if (p !== progPath) return r;
    return Object.assign(Object.create(r), { get: () => r.get(), set: (d) => r.set(d), onSnapshot: (a, b) => r.onSnapshot(a, b),
      update: (d) => (blips-- > 0 ? Promise.reject({ code: 'unavailable', message: 'transient' }) : r.update(d)) });
  } };
}, P('profile/progress/tA'));
await page.fill('.lsn-say-input', 'A pressure wave passed along from molecule to molecule');
await page.click('.lsn-compose .lsn-main');
await page.waitForSelector('.lsn-grade');
await sleep(1500);
const say = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p).ideas.i1.say, P('profile/progress/tA'));
const toasts = await page.$$eval('#toasts .toast', (t) => t.map((x) => x.textContent));
report('one transient failure loses the answer (no retry)', !say, 'saved say: ' + JSON.stringify(say) + '; toast: ' + JSON.stringify(toasts));
await app.close();
