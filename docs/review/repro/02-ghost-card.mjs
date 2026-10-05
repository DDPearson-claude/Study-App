// Another device deletes a topic while this one is mid-review: the next answer recreates the
// cards doc with a partial card (no type/spec/iid) that is due forever and can only be skipped.
import { open, report, sleep, P, TODAY, addDays, NOW, isoDaysAgo, topic } from './lib.mjs';
const card = (id, iid, q) => ({ id, tid: 'tA', iid, type: 'choice', spec: { id: 'c1', type: 'choice', q, options: ['Yes', 'No'], answer: 0, why: 'Because.' },
  createdAt: isoDaysAgo(9), learnedAt: isoDaysAgo(9), s: { due: addDays(TODAY, -1), stability: 3, difficulty: 5, reps: 1, lapses: 0, last: addDays(TODAY, -5) }, hist: [{ at: isoDaysAgo(5), grade: 3, ok: true }] });
const db = {
  'topics/tA': topic('tA'),
  [P('profile/cards/tA')]: { cards: { i1_c1: card('i1_c1', 'i1', 'First question?'), i2_c1: card('i2_c1', 'i2', 'Second question?') } },
  [P('profile')]: { prefs: { cap: 15 }, days: {}, createdAt: NOW },
};
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/review'));
await page.waitForSelector('.qc-opt');
// The other device deletes the topic (topic.remove deletes the cards doc too).
await page.evaluate((p) => { window.__CLAUDE_STUB__.remove('topics/tA'); window.__CLAUDE_STUB__.remove(p); }, P('profile/cards/tA'));
await page.click('.qc-opt >> nth=0'); await page.click('.qc-primary'); await page.click('.qc-continue');
await sleep(800);
const doc = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p), P('profile/cards/tA'));
report('partial card recreated after topic deleted elsewhere', !!doc, 'cards doc now: ' + JSON.stringify(doc));
// Next day's session (here: a new review) shows it and it can never be answered.
await page.goto(app.url('#/today'));
await page.waitForSelector('.td-title');
const today = (await page.textContent('.td')).replace(/\s+/g, ' ').slice(0, 140);
console.log('   Today says: ' + today);
// Make it due again (as it will be tomorrow) and open a review.
await page.evaluate((p) => { const d = window.__CLAUDE_STUB__.get(p); Object.values(d.cards).forEach((c) => { c.s.due = '2000-01-01'; }); window.__CLAUDE_STUB__.seed(p, d); }, P('profile/cards/tA'));
await page.goto(app.url('#/review'));
await page.waitForSelector('.qc');
console.log('   review card shows: ' + (await page.textContent('.qc')).replace(/\s+/g, ' ').slice(0, 120));
await page.click('.qc-continue'); await sleep(600);
const after = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p), P('profile/cards/tA'));
console.log('   after Skip, still due: ' + JSON.stringify(Object.values(after.cards).map((c) => c.s.due)));
console.log('   badge: ' + await page.evaluate(() => document.getElementById('today-badge') && document.getElementById('today-badge').textContent));
await app.close();
