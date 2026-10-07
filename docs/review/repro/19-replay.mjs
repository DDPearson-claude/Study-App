// "Go through it again" on a finished idea overwrites the original guess and check results and
// re-runs addFromLesson (resetting learnedAt), although replay is meant to leave progress alone.
import { open, report, sleep, P, TODAY, addDays, NOW, isoDaysAgo, topic, lesson } from './lib.mjs';
const orig = { stage: 'done', startedAt: isoDaysAgo(10), doneAt: isoDaysAgo(10), predict: { answer: 'Squeezed', at: isoDaysAgo(10) },
  say: [{ text: 'my words', at: isoDaysAgo(10), verdict: 'got-it', met: [true, true] }], checks: { c1: { correct: true, at: isoDaysAgo(10) } } };
const card = { id: 'i1_c1', tid: 'tA', iid: 'i1', type: 'choice', spec: lesson('i1').lesson.checks[0], createdAt: isoDaysAgo(10), learnedAt: isoDaysAgo(10),
  s: { due: addDays(TODAY, 2), stability: 5, difficulty: 5, reps: 3, lapses: 2, last: addDays(TODAY, -3) }, hist: [{ at: isoDaysAgo(6), grade: 1, ok: false }, { at: isoDaysAgo(3), grade: 1, ok: false }] };
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'), [P('profile/progress/tA')]: { updatedAt: NOW, lastIdea: 'i1', ideas: { i1: orig } },
  [P('profile/cards/tA')]: { cards: { i1_c1: card } }, [P('profile')]: { prefs: {}, days: {} } };
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/t/tA/i1'));
await page.waitForSelector('.lsn-again button');
await page.click('.lsn-again button');
await page.click('.lsn-options .option >> nth=1'); await page.click('.lsn-main');           // a different guess
await page.click('.lsn-stage[data-stage=play] .lsn-main');                                   // continue (no interactive)
await page.click('.lsn-stage[data-stage=explain] .lsn-main');
await page.click('.lsn-stage[data-stage=say] .lsn-after .lsn-main');
const wrong = await page.$$eval('.qc-opt', (b) => b.findIndex((x) => /air itself/.test(x.textContent)));
await page.click('.qc-opt >> nth=' + wrong); await page.click('.qc-primary'); await page.click('.qc-continue');
await page.waitForSelector('.lsn-done');
await sleep(800);
const st = await page.evaluate(([a, b]) => ({ p: window.__CLAUDE_STUB__.get(a).ideas.i1, c: window.__CLAUDE_STUB__.get(b).cards.i1_c1 }), [P('profile/progress/tA'), P('profile/cards/tA')]);
report('replay overwrites the original record', st.p.predict.answer !== 'Squeezed' && st.p.checks.c1.correct === false,
  'predict=' + JSON.stringify(st.p.predict.answer) + ' checks.c1.correct=' + st.p.checks.c1.correct + ' stage=' + st.p.stage + ' card.learnedAt reset: ' + (st.c.learnedAt > NOW));
await app.close();
