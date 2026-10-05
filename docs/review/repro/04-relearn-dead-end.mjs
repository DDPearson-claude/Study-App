// Two lapses on an idea show "Learn it again", which flags progress.ideas[iid].relearn, but
// nothing reads the flag: the link opens the old, finished lesson and nothing is rebuilt.
import { open, report, sleep, P, TODAY, addDays, NOW, isoDaysAgo, topic, lesson } from './lib.mjs';
const card = { id: 'i1_c1', tid: 'tA', iid: 'i1', type: 'choice', spec: lesson('i1').lesson.checks[0], createdAt: isoDaysAgo(20), learnedAt: isoDaysAgo(20),
  s: { due: addDays(TODAY, 3), stability: 1, difficulty: 7, reps: 4, lapses: 2, last: addDays(TODAY, -1) },
  hist: [{ at: isoDaysAgo(10), grade: 1, ok: false }, { at: isoDaysAgo(1), grade: 1, ok: false }] };
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'),
  [P('profile/progress/tA')]: { updatedAt: NOW, lastIdea: 'i1', ideas: { i1: { stage: 'done', startedAt: isoDaysAgo(20), doneAt: isoDaysAgo(20) } } },
  [P('profile/cards/tA')]: { cards: { i1_c1: card } }, [P('profile')]: { prefs: {}, days: {} } };
const calls = [];
const app = await open({ db, sample: (input) => { calls.push((String(typeof input === 'string' ? input : JSON.stringify(input)).match(/TASK: [a-z-]+/) || ['?'])[0] + (/Sound is a pressure wave/.test(String(input)) && !/The speed of sound\b[^]*IDEA TO TEACH/.test(String(input)) ? '' : '')); return '{}'; } });
const { page } = app;
await page.goto(app.url('#/today'));
await page.waitForSelector('.td-relearn-link');
await sleep(500);
const flag = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p).ideas.i1.relearn, P('profile/progress/tA'));
await page.click('.td-relearn-link');
await page.waitForSelector('.lsn-done, .lsn-prep', { timeout: 5000 });
await sleep(1500);
const shown = (await page.$('.lsn-done h2')) ? (await page.textContent('.lsn-done h2')).trim() : (await page.textContent('.lsn-prep')).replace(/\s+/g, ' ').trim().slice(0, 120);
const lessonDoc = await page.evaluate(() => window.__CLAUDE_STUB__.get('topics/tA/lessons/i1'));
const prog = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p).ideas.i1, P('profile/progress/tA'));
report('"Learn it again" opens the old finished lesson; nothing is rebuilt', flag === true && /learned this idea/i.test(shown) && lessonDoc.status === 'ready' && lessonDoc.updatedAt === db['topics/tA/lessons/i1'].updatedAt,
  'relearn flag=' + flag + '; lesson screen shows: "' + shown + '"; sample calls: ' + JSON.stringify(calls) + '; lesson status: ' + lessonDoc.status + '; progress.ideas.i1 now: ' + JSON.stringify({ round: prog.round, stage: prog.stage, relearn: prog.relearn, checks: prog.checks }));
await page.goto(app.url('#/today'));
await page.waitForSelector('.td-title');
console.log('   Today still says: ' + ((await page.$('.td-relearn')) ? (await page.textContent('.td-relearn')).replace(/\s+/g, ' ').slice(0, 90) : 'no relearn block'));
const i2 = await page.evaluate(() => window.__CLAUDE_STUB__.get('topics/tA/lessons/i2')); console.log('   (the sample calls are the prefetch of the NEXT idea: lessons/i2 status=' + (i2 && i2.status) + '; lessons/i1 untouched)');
await app.close();
