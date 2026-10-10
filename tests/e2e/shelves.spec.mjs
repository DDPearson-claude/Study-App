#!/usr/bin/env node
// Browser test for ready-made courses (76-shelves.js): the Library opens on two choices, Dossiers
// and Ready-made courses; Ready-made courses lists each shelf (Maths), the shelf
// shows its folders, a folder lists its courses in order, built ones open their topic, the rest
// say they are not built yet. No shelves: no section. A built course (topic.readyMade) stays out
// of Learn's list and Continue, and its row says where Dan is ("Lesson 3 of 6"). Screenshots:
// tests/out/shelves/.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, readJson, ROOT } from '../../tools/harness/page.mjs';

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

let app = await open({ ...MADE, 'shelves/maths': SHELF });
const { page } = app;
await page.waitForSelector('.tgrid .tcard');
ok((await page.locator('.shelf-card').count()) === 0, 'Learn has no ready-made courses (they live in the Library)');
await page.waitForTimeout(600);
const learnLinks = await page.locator('.learn a[href^="#/t/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
ok(learnLinks.length > 0 && !learnLinks.some((h) => h.includes('how-tides-work-ab12')), 'a built ready-made course is not in Learn\'s topics or Continue (' + learnLinks.join(' ') + ')');
await page.evaluate(() => U.go('#/book'));
await page.waitForSelector('.lib-choice');
ok((await page.locator('.lib-choice').count()) === 2, 'the Library opens on two choices');
ok((await page.locator('.lib-choice-t').allTextContents()).join() === 'Dossiers,Ready-made courses', 'Dossiers and Ready-made courses');
await page.waitForFunction(() => /Maths/.test((document.querySelector('.is-courses .lib-choice-m') || {}).textContent || ''));
await page.screenshot({ path: join(SHOTS, 'library-360.png') });
await page.locator('.lib-choice.is-courses').click();
await page.waitForSelector('.shelf-page .shelf-card');
ok((await page.locator('.shelf-page h1').textContent()) === 'Ready-made courses', 'Ready-made courses');
ok(/Maths/.test(await page.locator('.shelf-page .shelf-card').innerText()) && /2 folders · 3 courses · 1 built/.test(await page.locator('.shelf-page .shelf-card').innerText()), 'the Maths folder, with its counts');
await page.locator('.shelf-page .shelf-card').click();
await page.waitForFunction(() => (document.querySelector('.shelf-page h1') || {}).textContent === 'Maths');
await page.waitForSelector('.shelf-page h1');
ok((await page.locator('.shelf-page h1').textContent()) === 'Maths', 'the shelf page');
ok((await page.locator('.shelf-page .shelf-card').count()) === 2, 'its two folders');
ok(/1 course · none built yet/.test(await page.locator('.shelf-page .shelf-card').nth(1).innerText()), 'with each folder\'s count');
await page.screenshot({ path: join(SHOTS, 'shelf-360.png'), fullPage: true });
await page.locator('.shelf-page .shelf-card').first().click();
await page.waitForSelector('.shelf-courses');
ok((await page.locator('.shelf-page h1').textContent()) === 'Foundational maths', 'the folder page');
ok((await page.locator('.shelf-courses li').count()) === 2, 'its courses');
ok((await page.locator('.shelf-courses li.is-built a').getAttribute('href')) === '#/t/how-tides-work-ab12', 'a built course opens its topic');
await page.waitForFunction(() => /Lesson 3 of 6/.test((document.querySelector('.shelf-courses li.is-built .shelf-ready') || {}).textContent || ''), null, { timeout: 5000 }).catch(() => {});
ok((await page.locator('.shelf-courses li.is-built .shelf-ready').textContent()) === 'Lesson 3 of 6', 'a started course says where he is (' + (await page.locator('.shelf-courses li.is-built .shelf-ready').textContent()) + ')');
ok(/Not built yet/.test(await page.locator('.shelf-courses li.is-waiting').innerText()) && (await page.locator('.shelf-courses li.is-waiting a').count()) === 0, 'one not built yet says so and is not a link');
await page.screenshot({ path: join(SHOTS, 'folder-360.png'), fullPage: true });
ok((await page.locator('.backlink').getAttribute('href')) === '#/shelf/maths', 'back to Maths');
await page.evaluate(() => U.go('#/shelf/maths/nope'));
await page.waitForSelector('.v-empty');
ok(/not in Maths any more/.test(await page.locator('.v-empty').innerText()), 'an unknown folder says so');
ok(app.errors.length === 0, 'no page errors ' + app.errors.join(' | '));
await app.close();

app = await open({ ...base });
await app.page.waitForSelector('.tgrid .tcard');
await app.page.waitForTimeout(800);
await app.page.evaluate(() => U.go('#/library/courses'));
await app.page.waitForFunction(() => /None yet/.test(document.querySelector('.shelf-page') ? document.querySelector('.shelf-page').textContent : ''));
ok(true, 'no shelves: Ready-made courses says none yet');
await app.close();
const wide = await open({ ...base, 'shelves/maths': SHELF }, 1280);
await wide.page.evaluate(() => U.go('#/shelf/maths'));
await wide.page.waitForSelector('.shelf-page .shelf-card');
await wide.page.screenshot({ path: join(SHOTS, 'shelf-1280.png') });
ok(wide.errors.length === 0, 'no page errors at 1280');
await wide.close();
console.log(fails ? fails + ' failed' : 'all shelves checks passed');
process.exit(fails ? 1 : 0);
