#!/usr/bin/env node
// Browser test for ready-made courses (76-shelves.js): Learn shows a shelf's folder, the shelf
// shows its folders, a folder lists its courses in order, built ones open their topic, the rest
// say they are not built yet. No shelves: no section. Screenshots: tests/out/shelves/.
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

let app = await open({ ...base, 'shelves/maths': SHELF });
const { page } = app;
await page.waitForSelector('.shelves .shelf-card');
ok((await page.locator('#shelves-h').textContent()) === 'Ready-made courses', 'Learn has a Ready-made courses section');
ok(/Maths/.test(await page.locator('.shelves .shelf-card').innerText()) && /2 folders · 3 courses · 1 built/.test(await page.locator('.shelves .shelf-card').innerText()), 'the Maths folder, with its counts');
await page.locator('.shelves .shelf-card').scrollIntoViewIfNeeded();
await page.screenshot({ path: join(SHOTS, 'learn-360.png') });
await page.locator('.shelves .shelf-card').click();
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
ok(/Not built yet/.test(await page.locator('.shelf-courses li.is-waiting').innerText()) && (await page.locator('.shelf-courses li.is-waiting a').count()) === 0, 'one not built yet says so and is not a link');
await page.screenshot({ path: join(SHOTS, 'folder-360.png'), fullPage: true });
await page.evaluate(() => U.go('#/shelf/maths/nope'));
await page.waitForSelector('.v-empty');
ok(/not in Maths any more/.test(await page.locator('.v-empty').innerText()), 'an unknown folder says so');
ok(app.errors.length === 0, 'no page errors ' + app.errors.join(' | '));
await app.close();

app = await open({ ...base });
await app.page.waitForSelector('.tgrid .tcard');
await app.page.waitForTimeout(800);
ok((await app.page.locator('.shelves').count()) === 0, 'no shelves: no section');
await app.close();
const wide = await open({ ...base, 'shelves/maths': SHELF }, 1280);
await wide.page.evaluate(() => U.go('#/shelf/maths'));
await wide.page.waitForSelector('.shelf-page .shelf-card');
await wide.page.screenshot({ path: join(SHOTS, 'shelf-1280.png') });
ok(wide.errors.length === 0, 'no page errors at 1280');
await wide.close();
console.log(fails ? fails + ' failed' : 'all shelves checks passed');
process.exit(fails ? 1 : 0);
