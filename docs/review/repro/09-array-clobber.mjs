// Arrays written wholesale from a stale in-memory copy erase the other device's entries:
// (a) say[] (Dan's own words, the Book), (b) a card's hist and FSRS state in review.
import { open, report, sleep, P, TODAY, addDays, NOW, isoDaysAgo, topic, lesson } from './lib.mjs';
{ // (a) say-it-back on two devices
  const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'),
    [P('profile/progress/tA')]: { updatedAt: NOW, lastIdea: 'i1', ideas: { i1: { stage: 'say', startedAt: NOW, predict: { answer: 'x', at: NOW } } } } };
  const app = await open({ db, sample: () => '{}' });
  const { page } = app;
  await page.goto(app.url('#/t/tA/i1'));
  await page.waitForSelector('.lsn-say-input');
  await page.evaluate(() => { U.gen.grade = () => Promise.resolve({ met: [true, true], verdict: 'got-it', nailed: 'Yes.', followUp: '' }); });
  // Phone: Dan explains it there first.
  // (the phone writes an old-style array here, the hardest case: it must be kept and converted)
  await page.evaluate((p) => { const d = window.__CLAUDE_STUB__.get(p); d.ideas.i1.say = [{ text: 'PHONE: a squeeze handed from molecule to molecule', at: new Date().toISOString(), verdict: 'got-it', met: [true, true] }]; d.ideas.i1.stage = 'checks'; window.__CLAUDE_STUB__.seed(p, d); }, P('profile/progress/tA'));
  // Desktop (still showing Say it back) — Dan types here too.
  await page.fill('.lsn-say-input', 'DESKTOP: pressure wave passed along');
  await page.click('.lsn-compose .lsn-main');
  await page.waitForSelector('.lsn-grade');
  await sleep(500);
  const say = await page.evaluate((p) => { const v = window.__CLAUDE_STUB__.get(p).ideas.i1.say; return (Array.isArray(v) ? v : Object.values(v || {})).filter(Boolean).map((s) => s.text); }, P('profile/progress/tA'));
  report('(a) say[] from the other device is erased', !say.some((t) => t.startsWith('PHONE')), 'progress.ideas.i1.say = ' + JSON.stringify(say));
  await app.close();
}
{ // (b) review the same card on two devices (desktop review screen opened before the phone's review)
  const card = { id: 'i1_c1', tid: 'tA', iid: 'i1', type: 'choice', spec: lesson('i1').lesson.checks[0], createdAt: isoDaysAgo(20), learnedAt: isoDaysAgo(20),
    s: { due: TODAY, stability: 4, difficulty: 5, reps: 1, lapses: 0, last: addDays(TODAY, -4) }, hist: [{ at: isoDaysAgo(4), grade: 3, ok: true }] };
  const db = { 'topics/tA': topic('tA'), [P('profile/cards/tA')]: { cards: { i1_c1: card } }, [P('profile')]: { prefs: {}, days: {} } };
  const app = await open({ db, sample: () => '{}' });
  const { page } = app;
  await page.goto(app.url('#/review'));
  await page.waitForSelector('.qc-opt');
  // Phone reviews it first: graded Again (lapse), due tomorrow.
  await page.evaluate((p) => { const d = window.__CLAUDE_STUB__.get(p); const c = d.cards.i1_c1;
    c.s = { due: '2026-10-06', stability: 1.2, difficulty: 7, reps: 2, lapses: 1, last: c.s.last.replace(/./g, (x) => x) && new Date().toISOString().slice(0, 10) };
    c.hist.push({ at: new Date().toISOString(), grade: 1, ok: false, from: 'phone' }); window.__CLAUDE_STUB__.seed(p, d); }, P('profile/cards/tA'));
  // Desktop answers the stale copy.
  const right = await page.$$eval('.qc-opt', (bs) => bs.findIndex((b) => /squeeze/.test(b.textContent)));
  await page.click('.qc-opt >> nth=' + right); await page.click('.qc-primary'); await page.click('.qc-continue');
  await sleep(600);
  const c = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p).cards.i1_c1, P('profile/cards/tA'));
  report('(b) the phone\'s review (lapse + history entry) is erased', !c.hist.some((h) => h.from === 'phone') && c.s.lapses === 0,
    'hist=' + JSON.stringify(c.hist.map((h) => h.grade + (h.from ? '/' + h.from : ''))) + ' s=' + JSON.stringify(c.s));
  await app.close();
}
