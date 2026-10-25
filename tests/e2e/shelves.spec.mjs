#!/usr/bin/env node
// Browser test for the Library, the home (77-library.js), and ready-made courses (76-shelves.js):
// the home lists each shelf (Maths) under "Your library", the shelf shows its folders, a folder lists
// its courses in order, built ones open their topic, the rest say they are not built yet, and a
// started course's row says where Dan is ("Lesson 3 of 6"). Above the shelves: the look-up field,
// the course he left open (its tone, cover and lesson) and the puzzles in the box (none: no row);
// shelves with nothing built fold under one line, and so do a folder's planned courses (open when
// nothing in it is built), each fold kept as he left it. Typing in the look-up field replaces the
// page with matching lessons (then courses), a count line and, for nothing, a plain note; a lesson
// row opens its lesson (ready) or its course (coming soon); the words stay while he browses and
// comes back; clearing brings the page back. The old Ready-made courses page opens
// the home; the Book tab opens the dossiers, ending with "In your own words" and the Map.
// Screenshots: tests/out/shelves/.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openApp as openPage, readJson, ROOT } from '../../tools/harness/page.mjs';
// The puzzle box is hidden by default (U.flags.puzzleBox, 00-core.js, since 25 Oct). This spec tests
// it, so every page it opens shows it.
const openApp = (o) => openPage({ puzzleBox: true, ...o });

const FILE = join(ROOT, 'tests', 'out', 'shelves.html');
const SHOTS = join(ROOT, 'tests', 'out', 'shelves');
const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
mkdirSync(SHOTS, { recursive: true });
const SEED = readJson('tests/fixtures/views-seed.json');
const SHELF = {
  v: 1, title: 'Maths', order: 1, blurb: 'Every area of maths in one place.',
  folders: [
    { id: 'foundations', title: 'Foundational maths', blurb: 'The building blocks.', courses: [
      { id: 'fractions', title: 'Fractions', blurb: 'What a fraction really is.', tid: 'how-tides-work-ab12' },
      { id: 'negative-numbers', title: 'Negative numbers', blurb: 'Numbers below zero.', tid: null }] },
    { id: 'algebra', title: 'Algebra', blurb: 'Patterns and rules.', courses: [{ id: 'visual-algebra', title: 'Visual algebra', blurb: 'Spot the rule.', tid: null }] },
  ],
};
// A shelf with nothing built yet: folded away on the home.
const LATER = { v: 1, title: 'Science and technology', order: 2, blurb: 'Physics, astronomy and how things work.', folders: [
  { id: 'physics', title: 'Physics', courses: [{ id: 'forces', title: 'Forces', tid: null }, { id: 'waves', title: 'Waves', tid: null }] }] };
// Two puzzles in the box from tides' first lesson (ready now), and one that comes back later.
const CARD = (id, due) => ({ id, tid: 'how-tides-work-ab12', iid: 'i1', type: 'choice', createdAt: '2026-10-01T08:00:00.000Z', learnedAt: '2026-10-01T08:00:00.000Z',
  spec: { id: id.split('_')[1], type: 'choice', q: 'How many high tides do most coasts get in a day?', options: ['One', 'Two'], answer: 1, why: 'Two bulges.' },
  s: { due, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: '2026-10-01' }, hist: [{ at: '2026-10-01T08:00:00.000Z', grade: 3, ok: true }] });
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok    ' : 'FAIL  ') + m); if (!c) fails++; };
async function open(db, width = 360) {
  const app = await openApp({ width, height: 800, file: FILE, config: { db } });
  await app.page.goto(app.url('#/'));
  await app.booted();
  return app;
}
const base = {};
for (const tid of Object.keys(SEED.topics)) base['topics/' + tid] = SEED.topics[tid];
// Fractions is a ready-made course built as the tides topic: 2 of its 6 ideas done.
const UID = 'u_stubuser0000000000000000';
const MADE = { ...base, 'topics/how-tides-work-ab12': { ...SEED.topics['how-tides-work-ab12'], readyMade: { shelf: 'maths', course: 'fractions' } } };
for (const [tid, v] of Object.entries(SEED.progress)) MADE[`data/users/${UID}/profile/progress/${tid}`] = v;
// Tides' third lesson is built; the rest are not (so they are coming soon).
MADE['topics/how-tides-work-ab12/lessons/i3'] = { status: 'ready', updatedAt: '2026-10-01T08:00:00.000Z', lesson: { iid: 'i3', title: 'Two bulges, not one' }, interactive: null, note: 'No interactive.' };
// One of the two is a puzzle (phase 6: a ready-made lesson's worked example); the box counts both.
const PUZZLE = { ...CARD('i1_x1', '2026-10-02'), id: 'i1_x1', type: 'puzzle', spec: { q: 'How many high tides do most coasts get in a day?', answer: '2', why: 'Two bulges.', input: 'typed', page: 0 } };
MADE[`data/users/${UID}/profile/cards/how-tides-work-ab12`] = { cards: { i1_x1: PUZZLE, i1_c2: CARD('i1_c2', '2026-10-03'), i1_c3: CARD('i1_c3', '2099-01-01') } };

let app = await open({ ...MADE, 'shelves/maths': SHELF, 'shelves/science': LATER });
const { page } = app;
await page.waitForSelector('.lib-home .shelf-card');
// The look-up field, then the rows, then the shelves.
ok(await page.getAttribute('#lib-look', 'placeholder') === 'Look up a lesson: power factor, cosine rule…', 'the look-up field, with its placeholder');
ok((await page.locator('label[for="lib-look"]').textContent()) === 'Look up a lesson', 'and its name');
await page.waitForSelector('.lib-open');
ok((await page.locator('.lib-open').count()) === 1, 'one left-open row');
ok((await page.locator('.lib-open').getAttribute('href')) === '#/t/how-tides-work-ab12/i3', 'it opens the lesson he is on (' + await page.locator('.lib-open').getAttribute('href') + ')');
ok(/^Left open · How tides work$/i.test((await page.locator('.lib-open-label').textContent()).trim()), 'labelled with the course');
ok((await page.locator('.lib-open strong').textContent()) === 'Two bulges, not one', 'the lesson\'s title');
ok((await page.locator('.lib-open-n').textContent()) === 'lesson 3 of 6', 'and where it sits');
ok(await page.locator('.lib-open svg.cover').count() === 1 && /^[0-5]$/.test(await page.locator('.lib-open').getAttribute('data-tone')), 'with its cover and its tone');
await page.waitForSelector('.lib-box');
ok((await page.locator('.lib-box strong').textContent()) === '2 puzzles in the box', 'the puzzle box counts what is in it');
ok(/From How tides work · when you like/.test(await page.locator('.lib-box').innerText()), 'from which course, when he likes (' + (await page.locator('.lib-box').innerText()).replace(/\n/g, ' | ') + ')');
ok((await page.locator('.lib-box').getAttribute('href')) === '#/today', 'it opens Today');
ok(!/due|overdue|streak/i.test(await page.locator('.lib-home').innerText()), 'nothing is "due" on the home');
const order = await page.evaluate(() => ['#lib-look', '.lib-open', '.lib-box', '.lib-shelves'].map((s) => Math.round(document.querySelector(s).getBoundingClientRect().top)));
ok(order.every((y, i) => !i || y > order[i - 1]), 'field, left open, box, shelves, top to bottom (' + order + ')');
// The shelves: built ones as cards; the rest fold under one line, closed.
ok((await page.locator('.lib-shelves > .shelf-grid > .shelf-card').count()) === 1, 'one shelf with built courses');
ok(/2 folders · 1 course built · 2 to come/.test(await page.locator('.lib-shelves > .shelf-grid > .shelf-card').innerText()), 'its meta says what is built and what is to come');
ok((await page.locator('.lib-later summary').innerText()).trim() === '1 more shelf planned: Science and technology', 'the planned shelf folds under one line');
ok(!(await page.locator('.lib-later details').evaluate((d) => d.open)), 'closed until he opens it');
await page.locator('.lib-later summary').click();
ok((await page.locator('.lib-later .shelf-card.is-waiting').count()) === 1 && (await page.locator('.lib-later a').count()) === 0, 'opened: a card that opens nothing');
ok(/On the way · about 2 courses/.test(await page.locator('.lib-later .shelf-card').innerText()), 'saying what is coming');

ok((await page.locator('.lib-home h1').textContent()) === 'Your library', 'the home is the Library');
ok((await page.evaluate(() => document.getElementById('view').dataset.screen)) === 'library', 'its own screen');
ok((await page.locator('.ask, .tcard, .ccard').count()) === 0, 'no ask box and no topic cards');
await page.screenshot({ path: join(SHOTS, 'home-360.png') });
await page.locator('.lib-home a.shelf-card').click();
await page.waitForFunction(() => (document.querySelector('.shelf-page h1') || {}).textContent === 'Maths');
ok((await page.locator('.shelf-page h1').textContent()) === 'Maths', 'the shelf page');
ok((await page.locator('.backlink').getAttribute('href')) === '#/' && /Your library/.test(await page.locator('.backlink').innerText()), 'back to the Library');
ok((await page.getAttribute('#tabs .tab[data-tab="library"]', 'aria-current')) === 'page', 'under the Library tab');
ok((await page.locator('.shelf-page .shelf-card').count()) === 2, 'its two folders');
ok(/1 course · none built yet/.test(await page.locator('.shelf-page .shelf-card').nth(1).innerText()), 'with each folder\'s count');
await page.screenshot({ path: join(SHOTS, 'shelf-360.png'), fullPage: true });
await page.locator('.shelf-page .shelf-card').first().click();
await page.waitForSelector('.shelf-courses');
ok((await page.locator('.shelf-page h1').textContent()) === 'Foundational maths', 'the folder page');
ok((await page.locator('.shelf-page > .shelf-courses > li').count()) === 1, 'its built course first');
ok((await page.locator('.shelf-fold summary').innerText()).trim() === '1 more coming', 'the planned ones fold away');
ok(!(await page.locator('.shelf-fold').evaluate((d) => d.open)), 'closed until he opens it');
await page.locator('.shelf-fold summary').click();
await page.evaluate(() => U._route());
await page.waitForSelector('.shelf-fold');
ok(await page.locator('.shelf-fold').evaluate((d) => d.open), 'and kept open across a redraw');
ok((await page.locator('.shelf-courses li.is-built a').getAttribute('href')) === '#/t/how-tides-work-ab12', 'a built course opens its topic');
await page.waitForFunction(() => /Lesson 3 of 6/.test((document.querySelector('.shelf-courses li.is-built .shelf-ready') || {}).textContent || ''), null, { timeout: 5000 }).catch(() => {});
ok((await page.locator('.shelf-courses li.is-built .shelf-ready').textContent()) === 'Lesson 3 of 6', 'a started course says where he is (' + (await page.locator('.shelf-courses li.is-built .shelf-ready').textContent()) + ')');
ok(/Not built yet/.test(await page.locator('.shelf-courses li.is-waiting').innerText()) && (await page.locator('.shelf-courses li.is-waiting a').count()) === 0, 'one not built yet says so and is not a link');
await page.screenshot({ path: join(SHOTS, 'folder-360.png'), fullPage: true });
ok((await page.locator('.backlink').getAttribute('href')) === '#/shelf/maths', 'back to Maths');
await page.evaluate(() => U.go('#/shelf/maths/algebra'));
await page.waitForSelector('.shelf-fold');
ok(await page.locator('.shelf-fold').evaluate((d) => d.open), 'a folder with nothing built opens with its fold open');
await page.evaluate(() => U.go('#/shelf/maths/nope'));
await page.waitForSelector('.v-empty');
ok(/not in Maths any more/.test(await page.locator('.v-empty').innerText()), 'an unknown folder says so');
// Look up: every typed word in a lesson's title or one line; titles first.
await page.evaluate(() => U.go('#/'));
await page.waitForSelector('.lib-home .shelf-card');
await page.fill('#lib-look', 'BULGES');
await page.waitForSelector('.lib-results:not([hidden]) .shelf-course');
ok(await page.locator('.lib-body').evaluate((b) => b.hidden), 'the results take the page\'s place');
const hits = await page.locator('.lib-hits .shelf-title').allTextContents();
ok(hits[0] === 'Two bulges, not one' && hits[1] === 'Earth turns under the bulges', 'titles that match, case-insensitive, in course order (' + hits.join(' | ') + ')');
ok((await page.locator('.lib-count').textContent()) === hits.length + ' lessons', 'a count line (' + await page.locator('.lib-count').textContent() + ')');
await page.waitForFunction(() => /ready to browse/.test((document.querySelector('.lib-hits li:first-child .shelf-ready') || {}).textContent || ''));
ok((await page.locator('.lib-hits li').first().locator('.shelf-ready').textContent()) === 'How tides work · lesson 3 · ready to browse', 'a built lesson is ready to browse');
ok((await page.locator('.lib-hits li').first().locator('a').getAttribute('href')) === '#/t/how-tides-work-ab12/i3', 'and opens the lesson');
await page.waitForFunction(() => /coming soon/.test((document.querySelector('.lib-hits li:nth-child(2) .shelf-meta') || {}).textContent || ''));
ok((await page.locator('.lib-hits li').nth(1).locator('a').getAttribute('href')) === '#/t/how-tides-work-ab12', 'one not built yet says coming soon and opens its course');
await page.fill('#lib-look', 'pull distance');
await page.waitForFunction(() => /Gravity weakens with distance/.test((document.querySelector('.lib-hits') || {}).textContent || ''));
ok((await page.locator('.lib-hits .shelf-title').allTextContents()).join(' | ') === 'Gravity weakens with distance', 'every word must appear, in the title or the one line');
await page.fill('#lib-look', 'tides');
await page.waitForSelector('.lib-hits.is-courses');
ok((await page.locator('.lib-hits.is-courses .shelf-title').textContent()) === 'How tides work', 'courses match by title and blurb, after the lessons');
ok(/ · 1 course$/.test(await page.locator('.lib-count').textContent()), 'counted (' + await page.locator('.lib-count').textContent() + ')');
await page.screenshot({ path: join(SHOTS, 'lookup-360.png') });
await page.fill('#lib-look', 'zebra crossing');
await page.waitForSelector('.lib-none');
ok((await page.locator('.lib-none').textContent()) === 'Nothing called that yet. Try a word from the lesson\'s title.', 'nothing found says so plainly');
// The words stay while he browses and comes back.
await page.fill('#lib-look', 'bulges');
await page.waitForSelector('.lib-hits .shelf-course');
await page.locator('.lib-hits a').nth(1).click();
await page.waitForFunction(() => location.hash === '#/t/how-tides-work-ab12');
await page.evaluate(() => U.go('#/'));
await page.waitForSelector('.lib-hits .shelf-course');
ok((await page.inputValue('#lib-look')) === 'bulges', 'back on the home, his words and their results are still there');
await page.click('.lib-look-clear');
ok(!(await page.locator('.lib-body').evaluate((b) => b.hidden)) && (await page.locator('.lib-results').evaluate((r) => r.hidden)) && (await page.inputValue('#lib-look')) === '', 'clearing brings the page back');
ok((await page.evaluate(() => document.activeElement && document.activeElement.id)) === 'lib-look', 'with the field ready to type in');
// The lesson's back arrow returns to where the lesson was opened from: the Library, or the course.
await page.evaluate(() => U.go('#/'));
await page.waitForSelector('.lib-open');
await page.locator('.lib-open').click();
await page.waitForSelector('.lsn-back');
ok((await page.getAttribute('.lsn-back', 'aria-label')) === 'Back to your library' && (await page.getAttribute('.lsn-back', 'href')) === '#/', 'opened from the Library, the lesson goes back there');
await page.locator('.lsn-back').click();
await page.waitForSelector('.lib-home .lib-open');
ok((await page.evaluate(() => location.hash)) === '#/', 'and it does');
await page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
// A ready-made lesson whose lesson is ready offers its two ways on the current card (Quiz me
// through it first, 20 Oct), once the page knows the lesson is ready.
await page.waitForSelector('.pnode.is-current .pnode-ways a');
await page.locator('.pnode.is-current .pnode-ways a').first().click();
await page.waitForSelector('.lsn-back');
ok((await page.getAttribute('.lsn-back', 'aria-label')) === 'Back to the course' && (await page.getAttribute('.lsn-back', 'href')) === '#/t/how-tides-work-ab12', 'opened from the course, back to the course');
await page.evaluate(() => { location.hash = '#/t/how-tides-work-ab12/i4'; });
await page.waitForFunction(() => location.hash === '#/t/how-tides-work-ab12/i4');
await page.waitForSelector('.lsn-back');
ok((await page.getAttribute('.lsn-back', 'href')) === '#/t/how-tides-work-ab12', 'from another lesson, back to the course');
// The old Ready-made courses page opens the home.
await page.evaluate(() => U.go('#/library/courses'));
await page.waitForFunction(() => location.hash === '#/' && !!document.querySelector('.lib-home'));
ok(true, 'the old Ready-made courses address opens the Library');
// The Book tab: the dossiers, as tiles, ending with "In your own words", then the Map.
await page.locator('#tabs .tab[data-tab="book"]').click();
await page.waitForSelector('.lib-dossiers .dl-grid > li:last-child a.own');
ok((await page.locator('.lib-page h1').textContent()) === 'Dossiers' && (await page.evaluate(() => location.hash)) === '#/book', 'the Book opens the dossiers, ending with In your own words');
ok((await page.locator('a.lib-map').getAttribute('href')) === '#/map', 'and links to the Map');
await page.locator('a.lib-map').click();
await page.waitForSelector('.map h1');
ok((await page.getAttribute('#tabs .tab[data-tab="book"]', 'aria-current')) === 'page', 'the Map sits under the Book tab');
ok((await page.locator('#tabs .tab').count()) === 3, 'three tabs: no Map tab');
ok(app.errors.length === 0, 'no page errors ' + app.errors.join(' | '));
await app.close();

app = await open({ ...base });
await app.page.waitForFunction(() => /No shelves yet/.test((document.querySelector('.lib-shelves') || {}).textContent || ''));
ok(true, 'no shelves: the Library says so');
await app.page.waitForTimeout(800);
ok((await app.page.locator('.lib-open, .lib-box').count()) === 0, 'nothing left open and nothing in the box: no rows, no filler');
await app.close();
const wide = await open({ ...MADE, 'shelves/maths': SHELF }, 1280);
await wide.page.waitForSelector('.lib-home .shelf-card');
await wide.page.waitForSelector('.lib-open');
await wide.page.waitForSelector('.lib-box');
const side = await wide.page.evaluate(() => { const a = document.querySelector('.lib-open').getBoundingClientRect(), b = document.querySelector('.lib-box').getBoundingClientRect(); return { dy: Math.round(Math.abs(a.top - b.top)), beside: b.left >= a.right - 1 }; });
ok(side.dy < 2 && side.beside, 'on a laptop the two rows sit side by side (' + JSON.stringify(side) + ')');
await wide.page.screenshot({ path: join(SHOTS, 'home-1280.png') });
// The course page's row counts its puzzles too, and opens a review of just these.
await wide.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
await wide.page.waitForSelector('.tp-box');
ok((await wide.page.locator('.tp-box strong').textContent()) === '2 puzzles from lesson 1', 'the course page: its puzzles, from which lesson (' + await wide.page.locator('.tp-box strong').textContent() + ')');
ok((await wide.page.getAttribute('.tp-box', 'href')) === '#/review?topic=how-tides-work-ab12', 'opening just these');
await wide.page.evaluate(() => U.go('#/shelf/maths'));
await wide.page.waitForSelector('.shelf-page .shelf-card');
await wide.page.screenshot({ path: join(SHOTS, 'shelf-1280.png') });
ok(wide.errors.length === 0, 'no page errors at 1280');
await wide.close();
console.log(fails ? fails + ' failed' : 'all shelves checks passed');
process.exit(fails ? 1 : 0);
