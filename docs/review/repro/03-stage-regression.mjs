// Desktop has a lesson open at Predict; Dan finishes the same idea on his phone. Any step on the
// desktop then moves the idea back from 'done' (the lesson only knows the doneAt it loaded).
import { open, report, sleep, P, NOW, topic, lesson } from './lib.mjs';
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1') };
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/t/tA/i1'));
await page.waitForSelector('.lsn-options .option');
await sleep(400);
// The phone finishes the idea (full progress doc as the other device would leave it).
const done = { lastIdea: 'i1', updatedAt: NOW, ideas: { i1: { stage: 'done', startedAt: NOW, doneAt: NOW, predict: { answer: 'Squeezed', at: NOW },
  say: [{ text: 'It is a squeeze passed along', at: NOW, verdict: 'got-it', met: [true, true] }], checks: { c1: { correct: true, at: NOW } } } } };
await page.evaluate(([p, d]) => window.__CLAUDE_STUB__.seed(p, d), [P('profile/progress/tA'), done]);
// Desktop: Dan taps an option and "That's my guess".
await page.click('.lsn-options .option >> nth=1');
await page.click('.lsn-main');
await sleep(600);
const prog = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p), P('profile/progress/tA'));
const i1 = prog.ideas.i1;
report('finished idea moved back from done', i1.stage !== 'done', 'progress.ideas.i1 = ' + JSON.stringify({ stage: i1.stage, doneAt: i1.doneAt, predict: i1.predict }));
await page.goto(app.url('#/t/tA'));
await page.waitForSelector('.pnode');
console.log('   topic page: ' + (await page.textContent('.pnode >> nth=0')).replace(/\s+/g, ' '));
await app.close();
