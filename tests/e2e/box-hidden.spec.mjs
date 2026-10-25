#!/usr/bin/env node
// Browser test for the puzzle box hidden (U.flags.puzzleBox off, the default since 25 Oct; Dan: "The
// puzzles in the box section has errors but tbh just delete that for now"; he chose to hide it and
// keep his cards and progress). In the complete app, with puzzles saved in the box and a lesson
// whose puzzles the backfill would make: Today shows no box and no counts, only today's study one
// tap away (the lesson he left open, else the Library) and This week; the Library and the course
// page have no puzzle row; #/review and its addresses go home quietly; Settings has no daily review
// limits; puzzlesFor, the backfill and the badge make, record and read nothing; no saved card or
// progress field changes. Switched on again (in the page, then on a fresh load) the box is as it was
// and the backfill makes what was held back.
// Screenshots: tests/out/box-hidden/.  Run: node tests/e2e/box-hidden.spec.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, readJson, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'box-hidden.html');
const SHOTS = join(ROOT, 'tests', 'out', 'box-hidden');
const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok    ' : 'FAIL  ') + m); if (!c) fails++; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Study days, as the app counts them (U.studyDay: the local day, turning over at 4 am).
const pad = (n) => (n < 10 ? '0' : '') + n;
const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const studyDay = (d) => { const x = new Date(d); if (x.getHours() < 4) x.setDate(x.getDate() - 1); return dayStr(x); };
const TODAY = studyDay(new Date());
const addDays = (day, n) => { const [y, m, d] = day.split('-').map(Number); return dayStr(new Date(y, m - 1, d + n)); };

// ---------- seed: a ready-made course on a shelf, part way through ----------
const UID = 'u_stubuser0000000000000000';
const TID = 'how-tides-work-ab12';
const SEED = readJson('tests/fixtures/views-seed.json');
const CARDS = `data/users/${UID}/profile/cards/${TID}`;
const PROGRESS = `data/users/${UID}/profile/progress/${TID}`;
const SHELF = { v: 1, title: 'Maths', order: 1, blurb: 'Every area of maths in one place.', folders: [
  { id: 'foundations', title: 'Foundational maths', courses: [{ id: 'tides', title: 'How tides work', tid: TID }] }] };
// i1 and i2 quizzed through (steps lessons finish as read lessons); i1's puzzles are in the box,
// i2's were never made (the backfill's work, from its version 2 guide); i3 is where he is.
const PROG = { updatedAt: '2026-10-20T19:00:00.000Z', lastIdea: 'i3', way: 'quiz', ideas: {
  i1: { round: 0, stage: 'done', startedAt: '2026-10-10T18:00:00.000Z', doneAt: '2026-10-10T18:20:00.000Z', readRound: 0, cardsRound: 0, quizRound: 0, puzzleRound: 0, puzzleV: 2 },
  i2: { round: 0, stage: 'done', startedAt: '2026-10-12T18:00:00.000Z', doneAt: '2026-10-12T18:20:00.000Z', readRound: 0, cardsRound: 0, quizRound: 0 },
  i3: { round: 0, stage: 'play', startedAt: '2026-10-20T18:55:00.000Z' },
} };
const GUIDE2 = { v: 2, iid: 'i2', pages: [
  { kind: 'example', name: 'Bulges', task: 'How many tidal bulges does the Moon raise?', answer: '2', why: 'One facing it, one opposite.', input: 'typed' },
  { kind: 'example', name: 'Day', task: 'Roughly how many hours between two high tides?', answer: '12.4 h', why: 'Half of a 24.8 hour lunar day.', input: 'typed' },
] };
const puzzle = (id, due, extra = {}) => ({ id, tid: TID, iid: 'i1', type: 'puzzle', createdAt: '2026-10-10T18:20:00.000Z', learnedAt: '2026-10-10T18:20:00.000Z',
  spec: { q: 'How many high tides do most coasts get in a day?', answer: '2', why: 'Two bulges.', input: 'typed', page: 0 },
  s: { due, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: addDays(TODAY, -4) }, hist: [{ at: '2026-10-14T08:00:00.000Z', grade: 3, ok: true }], ...extra });
const CARDDOC = { cards: {
  i1_x1: puzzle('i1_x1', addDays(TODAY, -1)),
  i1_x2: puzzle('i1_x2', TODAY, { spec: { q: 'Which pulls harder on the near ocean, the Moon or the Sun?', answer: 'The Moon', why: 'Closer.', input: 'pick', options: ['The Moon', 'The Sun'], page: 1 } }),
  i1_x3: puzzle('i1_x3', addDays(TODAY, 6), { spec: { q: 'How far is the Moon, in thousands of km?', answer: '384', why: 'About 384,000 km.', input: 'typed', page: 2 } }),
} };
function db({ progress = true, cards = true } = {}) {
  const out = { 'shelves/maths': SHELF };
  for (const tid of Object.keys(SEED.topics)) out['topics/' + tid] = SEED.topics[tid];
  out['topics/' + TID] = { ...SEED.topics[TID], readyMade: { shelf: 'maths', course: 'tides' }, guideV: 2 };
  out[`topics/${TID}/guide/i2`] = GUIDE2;
  out[`topics/${TID}/lessons/i3`] = { status: 'ready', updatedAt: '2026-10-01T08:00:00.000Z', lesson: { iid: 'i3', title: 'Two bulges, not one' }, interactive: null, note: 'No interactive.' };
  out[`data/users/${UID}/profile`] = { prefs: { theme: 'light', size: 'm', easy: false, cap: 15, light: false }, days: { [addDays(TODAY, -1)]: { d1: 12 } }, createdAt: '2026-09-01T08:00:00.000Z' };
  if (progress) out[PROGRESS] = PROG;
  if (cards) out[CARDS] = CARDDOC;
  return out;
}
async function open({ width = 360, hash = '#/today', box = false, data = {} } = {}) {
  const app = await openApp({ width, height: width < 700 ? 800 : 900, file: FILE, config: { db: db(data) }, sample: () => new Promise(() => {}), puzzleBox: box });
  await app.page.goto(app.url(hash));
  await app.booted();
  return app;
}
const doc = (app, p) => app.page.evaluate((x) => { const d = window.__CLAUDE_STUB__.get(x); return d === undefined ? null : d; }, p);
const text = (app, sel) => app.page.locator(sel).innerText();
const BOX_WORDS = /puzzle|in the box|flip through|review/i;

// ---------- Today, at 360 and 1280 ----------
let app = await open();
const { page } = app;
ok((await page.evaluate(() => U.flags.puzzleBox)) === false, 'the switch is off by default');
await page.waitForSelector('.td .td-title');
ok((await text(app, '.td h1')) === 'Pick up where you left off', 'Today: today\'s study is the heading (' + await text(app, '.td h1') + ')');
ok((await page.locator('.td .lib-open').count()) === 1, 'one tap away: the lesson he left open');
ok((await page.getAttribute('.td .lib-open', 'href')) === `#/t/${TID}/i3`, 'it opens the lesson he is on');
ok(/^Left open · How tides work$/i.test((await text(app, '.td .lib-open-label')).trim()) && (await text(app, '.td .lib-open-n')) === 'lesson 3 of 6', 'labelled with its course and where it sits');
ok((await page.locator('.td-start, .td-by, .td-light, .td-clear, .td-relearn, .td-notes').count()) === 0, 'no box, no Flip through, no By course, no Light day, no done-for-today');
ok((await page.locator('.td-week').count()) === 1, 'This week is still there');
ok(!BOX_WORDS.test(await text(app, '#view')), 'nothing on Today names puzzles, the box or reviews: ' + (await text(app, '#view')).replace(/\n/g, ' | '));
ok(!/\b\d+\s+(puzzle|card|review)/i.test(await text(app, '#view')), 'and nothing counts them');
ok((await page.getAttribute('#tabs .tab[data-tab="today"]', 'aria-current')) === 'page', 'Today is still its tab');
const wide = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
ok(wide[0] <= wide[1], 'no sideways scroll at 360 (' + wide + ')');
await page.screenshot({ path: join(SHOTS, 'today-360.png'), fullPage: true });

// ---------- the Library and the course page: no puzzle rows ----------
await page.evaluate(() => U.go('#/'));
await page.waitForSelector('.lib-home .lib-open');
await page.waitForTimeout(1000);
ok((await page.locator('.lib-box').count()) === 0, 'the Library: no puzzle row');
ok(!BOX_WORDS.test(await text(app, '.lib-rows')), 'its rows name no puzzles');
await page.evaluate((t) => U.go('#/t/' + t), TID);
await page.waitForSelector('.tp .path');
await page.waitForTimeout(1000);
ok((await page.locator('.tp-box').count()) === 0, 'the course page: no puzzle row');
ok(!/puzzles? from|flip through|in the box|review cards/i.test(await text(app, '#view')), 'and nothing on it names the box or review cards');

// ---------- #/review and its addresses go home quietly ----------
for (const hash of ['#/review', '#/review/more', `#/review?topic=${TID}`, `#/review/more?topic=${TID}`]) {
  await page.evaluate(() => U.go('#/today'));
  await page.waitForSelector('.td .td-title');
  await page.evaluate((h) => U.go(h), hash);
  await page.waitForFunction(() => location.hash === '#/' && !!document.querySelector('.lib-home h1'), null, { timeout: 10000 });
  ok((await page.locator('.rv').count()) === 0 && !(await page.evaluate(() => document.documentElement.classList.contains('focus'))), hash + ' goes home (the Library), not a blank review');
  // In place: Back goes to where he was before, not to the review address.
  await page.goBack();
  await page.waitForFunction(() => location.hash === '#/today', null, { timeout: 10000 }).catch(() => {});
  ok((await page.evaluate(() => location.hash)) === '#/today', hash + ': Back returns to Today (the address was replaced)');
}
ok((await page.locator('#toasts > *').count()) === 0, 'quietly: no toast');

// ---------- Settings: no daily review limits ----------
await page.click('#settings-btn');
await page.waitForSelector('.set');
const settings = await text(app, '.set');
ok(!/Daily reviews|Most reviews|Light days/.test(settings) && (await page.locator('.set input[name=light]').count()) === 0, 'Settings: no daily review limits');
ok(/Appearance/.test(settings) && /Backup/.test(settings), 'the rest of Settings is there');
await page.keyboard.press('Escape');

// ---------- the Map: reads no cards and names no review ----------
// (Its bands would otherwise come from saved cards that no longer get reviewed, and fade to Fragile.)
await page.evaluate(() => { window.__bandsRead = 0; const f = U.review.ideaBands; U.review.ideaBands = function () { window.__bandsRead++; return f.apply(this, arguments); }; });
await page.evaluate(() => U.go('#/map'));
await page.waitForSelector('.map-list .map-dot');
await page.waitForTimeout(600);
const mapText = await text(app, '.map');
ok(!/review/i.test(mapText), 'the Map names no review: ' + mapText.replace(/\n/g, ' | ').slice(0, 300));
ok(/as you learn\./.test(mapText), 'its lead says the dots fill in as he learns');
ok((await page.evaluate(() => window.__bandsRead)) === 0, 'it reads no review bands');
ok((await page.locator('.map-dot.is-fragile, .map-dot.is-strong').count()) === 0, 'no dot is Fragile or Strong');
const keys = await page.locator('.map-legend-item strong').allInnerTexts();
ok(same(keys.filter((k) => k !== 'Read'), ['New', 'Growing']), 'the key shows New and Growing (and Read when there is one): ' + keys);
await page.screenshot({ path: join(SHOTS, 'map-360.png'), fullPage: true });
await page.evaluate(() => U.go('#/today'));
await page.waitForSelector('.td .td-title');

// ---------- nothing made, recorded or read; nothing saved changes ----------
// The boot's mendCards ran 1.5 s after opening, and Today's on each visit.
const api = await page.evaluate(async ([tid, guide]) => ({
  mend: await U.review.mendPuzzles(true),
  cards: await U.review.mendCards(true),
  made: await U.review.puzzlesFor(tid, 'i2', { guide, lesson: null, idea: {}, round: 0 }),
  badge: await U.review.refreshBadge(),
}), [TID, GUIDE2]);
ok(same(api, { mend: [], cards: [], made: 0, badge: 0 }), 'puzzlesFor, the backfill and the badge make and count nothing: ' + JSON.stringify(api));
await page.waitForTimeout(500);
ok(same(await doc(app, CARDS), CARDDOC), 'every saved card, its schedule and history, exactly as it was');
ok(same(await doc(app, PROGRESS), PROG), 'progress exactly as it was (puzzleRound, puzzleV, cardsRound included): ' + JSON.stringify(await doc(app, PROGRESS)));
ok(app.errors.length === 0, 'no page errors ' + app.errors.join(' | '));

// One tap: the row opens the lesson, and the lesson's back arrow comes back to Today. (Opening the
// lesson writes its own progress, as it always does, so this comes after the check above.)
await page.evaluate(() => U.go('#/today'));
await page.waitForSelector('.td .lib-open');
await page.locator('.td .lib-open').click();
await page.waitForSelector('.lsn-back');
ok((await page.evaluate(() => location.hash)) === `#/t/${TID}/i3` && (await page.getAttribute('.lsn-back', 'aria-label')) === 'Back to Today', 'the row opens the lesson, and back goes to Today');

// Switched on in the page: the box is as it was, and the backfill makes what was held back.
const back = await page.evaluate(async () => { U.flags.puzzleBox = true; return { box: await U.review.box(), mend: await U.review.mendPuzzles(true) }; });
ok(back.box.size === 2 && same(back.mend, [{ tid: TID, iid: 'i2' }]), 'switched on: the 2 puzzles ready are in the box, and i2 gets its puzzles now: ' + JSON.stringify(back));
const after = await doc(app, CARDS);
ok(['i1_x1', 'i1_x2', 'i1_x3'].every((id) => same(after.cards[id], CARDDOC.cards[id])) && !!after.cards.i2_x1 && !!after.cards.i2_x2, 'the old cards untouched, the new ones added');
ok((await doc(app, PROGRESS)).ideas.i2.puzzleRound === 0, 'and recorded for i2');
await app.close();

// The desktop layout: the same calm page.
app = await open({ width: 1280 });
await app.page.waitForSelector('.td .lib-open');
await app.page.screenshot({ path: join(SHOTS, 'today-1280.png'), fullPage: true });
ok(!BOX_WORDS.test(await text(app, '#view')), 'Today at 1280: no box');
ok(app.errors.length === 0, 'no page errors at 1280');
await app.close();

// Nothing left open (a first visit): the way to the Library, and nothing that looks empty or broken.
app = await open({ data: { progress: false, cards: false } });
await app.page.waitForSelector('.td .td-title');
ok((await text(app, '.td h1')) === 'Nothing left open', 'nothing left open says so (' + await text(app, '.td h1') + ')');
ok((await app.page.getAttribute('.td-study a.btn', 'href')) === '#/' && (await text(app, '.td-study a.btn')) === 'Browse your library', 'with the way to the Library');
ok(!BOX_WORDS.test(await text(app, '#view')), 'and no box words');
await app.page.screenshot({ path: join(SHOTS, 'today-nothing-open-360.png'), fullPage: true });
ok(app.errors.length === 0, 'no page errors on a first visit');
await app.close();

// A fresh load with the switch on (this device's mu.puzzleBox = '1'): the box is back as it was.
app = await open({ box: true });
await app.page.waitForSelector('.td .td-title');
ok((await text(app, '.td h1')) === '2 puzzles in the box' && (await app.page.locator('.td-start').count()) === 1, 'switched on: Today is the puzzle box again (' + await text(app, '.td h1') + ')');
await app.page.evaluate(() => U.go('#/review'));
await app.page.waitForSelector('.rv .qc-q, .rv-stage .qc-q', { timeout: 15000 });
ok((await app.page.evaluate(() => location.hash)) === '#/review', 'and #/review opens a review');
ok(app.errors.length === 0, 'no page errors with the box on');
await app.close();

console.log(fails ? fails + ' failed' : 'all box-hidden checks passed');
process.exit(fails ? 1 : 0);
