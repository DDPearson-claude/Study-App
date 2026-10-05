// Read-modify-write with a whole-document set (addFromLesson) or a counter (logStudy): a write from
// the other device that lands between this device's read and its write is silently lost.
// The read is delayed 300 ms to stand in for network latency; the other device's write is seeded.
import { open, report, sleep, P, TODAY, addDays, NOW, isoDaysAgo, topic, lesson } from './lib.mjs';
const old = { id: 'i2_c1', tid: 'tA', iid: 'i2', type: 'choice', spec: { id: 'c1', type: 'choice', q: 'Old?', options: ['a', 'b'], answer: 0 }, createdAt: isoDaysAgo(9), learnedAt: isoDaysAgo(9),
  s: { due: TODAY, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: addDays(TODAY, -3) }, hist: [] };
const db = { 'topics/tA': topic('tA'), [P('profile/cards/tA')]: { cards: { i2_c1: old } }, [P('profile')]: { prefs: {}, days: { [TODAY]: 10 } } };
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/map'));
await page.waitForSelector('.map');
const r = await page.evaluate(async ([cardsPath, profPath, today]) => {
  const S = window.__CLAUDE_STUB__;
  const getC = U.store.cards.get, getP = U.store.profile.get;
  U.store.cards.get = (tid) => getC(tid).then((d) => new Promise((ok) => setTimeout(() => ok(d), 300)));
  U.store.profile.get = () => getP().then((d) => new Promise((ok) => setTimeout(() => ok(d), 300)));
  // This device finishes lesson i1 while the phone saves a review of card i2_c1.
  const a = U.review.addFromLesson('tA', 'i1', { checks: [{ id: 'c1', type: 'choice', q: 'New?', options: ['x', 'y'], answer: 0 }] }, { checks: { c1: { correct: true } } });
  setTimeout(() => { const d = S.get(cardsPath); d.cards.i2_c1.s = { due: '2026-11-01', stability: 20, difficulty: 4, reps: 2, lapses: 0, last: today }; d.cards.i2_c1.hist = [{ at: new Date().toISOString(), grade: 3, ok: true }]; S.seed(cardsPath, d); }, 100);
  await a; await new Promise((ok) => setTimeout(ok, 300));
  const card = S.get(cardsPath).cards.i2_c1;
  // Both devices log 2 study minutes at about the same time.
  const b = U.logStudy(2);
  setTimeout(() => { const d = S.get(profPath); d.days[today] += 2; S.seed(profPath, d); }, 100);
  await b; await new Promise((ok) => setTimeout(ok, 300));
  return { card: { due: card.s.due, hist: card.hist.length }, minutes: S.get(profPath).days[today] };
}, [P('profile/cards/tA'), P('profile'), TODAY]);
report('addFromLesson full-document set drops a concurrent review', r.card.due === TODAY && r.card.hist === 0, 'card i2_c1 after both writes: ' + JSON.stringify(r.card) + ' (phone had saved due 2026-11-01 with 1 hist entry)');
report('logStudy loses a concurrent increment', r.minutes === 12, 'minutes today: ' + r.minutes + ' (expected 14)');
await app.close();
