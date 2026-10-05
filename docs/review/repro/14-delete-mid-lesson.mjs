// The topic is deleted on another device while the lesson is open here: finishing it recreates
// the progress doc and a full cards doc for a topic that no longer exists. Those cards come back
// in review forever ("A topic · An idea") and there is no topic left to delete them with.
import { open, report, sleep, P, NOW, topic, lesson } from './lib.mjs';
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'),
  [P('profile/progress/tA')]: { updatedAt: NOW, lastIdea: 'i1', ideas: { i1: { stage: 'checks', startedAt: NOW, predict: { answer: 'x', at: NOW }, say: [{ text: 'my words', at: NOW, verdict: 'got-it', met: [true, true] }] } } },
  [P('profile')]: { prefs: {}, days: {} } };
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/t/tA/i1'));
await page.waitForSelector('.qc-opt');
await page.evaluate(([a, b]) => { const S = window.__CLAUDE_STUB__; ['topics/tA', 'topics/tA/lessons/i1', a, b].forEach((p) => S.remove(p)); }, [P('profile/progress/tA'), P('profile/cards/tA')]);
await page.click('.qc-opt >> nth=0'); await page.click('.qc-primary'); await page.click('.qc-continue');
await page.waitForSelector('.lsn-done');
await sleep(800);
const dump = await page.evaluate(() => window.__CLAUDE_STUB__.dump());
const keys = Object.keys(dump).filter((k) => /tA/.test(k));
report('finishing a lesson of a deleted topic recreates its progress and cards', !dump['topics/tA'] && keys.length >= 2, 'docs for tA now: ' + JSON.stringify(keys));
// Tomorrow the card is due: make it due now and look at Today.
await page.evaluate((p) => { const S = window.__CLAUDE_STUB__; const d = S.get(p); Object.values(d.cards).forEach((c) => { c.s.due = '2000-01-01'; }); S.seed(p, d); }, P('profile/cards/tA'));
await page.goto(app.url('#/today'));
await page.waitForSelector('.td-title');
console.log('   Today: ' + (await page.textContent('.td')).replace(/\s+/g, ' ').slice(0, 120));
await app.close();
