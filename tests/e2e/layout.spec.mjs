#!/usr/bin/env node
// Browser tests for the phone and laptop layouts (U.layout, head.html, 10-base.css and the
// laptop rules in 50-lesson.css and 70-views.css), on the complete build with only the model
// stubbed. Checks: Auto picks phone on a phone and laptop on a laptop and follows a resized
// window; the Layout setting pins either, per device (localStorage only, never the db); a
// pinned phone layout on a laptop is a centred phone column with its tab bar and sheets inside
// it; a pinned laptop layout on a phone keeps the top bar on one row; the laptop shapes (topic
// grid, topic page columns, Map columns, a wide lesson interactive with a narrower text column);
// Learn at narrow laptop widths and every text size (the ask box's height, when Learn goes two
// columns, the line shown beside the ask when nothing is due, the reviews row's width, the busy ask
// wherever its form is narrow, the words Learn, Today and an empty review share); and no screen ever
// scrolls sideways. Screenshots land in tests/out/layout/.
// Usage: node tests/e2e/layout.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, readJson, taskOf, ROOT } from '../../tools/harness/page.mjs';
import { readPng } from '../../tools/harness/png.mjs';

const FILE = join(ROOT, 'tests', 'out', 'layout.html');
const SHOTS = join(ROOT, 'tests', 'out', 'layout');
const UID = 'u_stubuser0000000000000000';
const FILTER = process.argv[2] || '';
const SEED = readJson('tests/fixtures/views-seed.json');
const TOPIC = readJson('tests/fixtures/lesson-ui-topic.json');
const PENDULUM = readJson('tests/fixtures/lesson-ui-pendulum.json');

const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
mkdirSync(SHOTS, { recursive: true });

// ---------- tiny runner ----------
const results = [];
let current = null;
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
async function test(name, fn) {
  if (FILTER && !name.includes(FILTER)) return;
  current = { name, apps: [] };
  try {
    await fn();
    for (const app of current.apps) assert(app.errors.length === 0, 'page errors:\n  ' + app.errors.join('\n  '));
    results.push({ name, ok: true });
    console.log(`ok    ${name}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name}\n      ${String(e && e.stack || e).split('\n').slice(0, 4).join('\n      ')}`);
  } finally {
    for (const app of current.apps) await app.close().catch(() => {});
  }
}

function seedDb() {
  const db = { 'topics/pendulums': TOPIC, 'topics/pendulums/lessons/i1': PENDULUM };
  for (const tid of Object.keys(SEED.topics)) db['topics/' + tid] = SEED.topics[tid];
  for (const [k, v] of Object.entries(SEED.research)) db['topics/' + k.replace('/', '/research/')] = v;
  for (const [tid, v] of Object.entries(SEED.progress)) db[`data/users/${UID}/profile/progress/${tid}`] = v;
  return db;
}

// Opens the app at a size, optionally with a pinned layout already saved on this device.
async function open(width, height, { layout = null, hash = '#/', db = seedDb() } = {}) {
  const app = await openApp({
    width, height, file: FILE, config: { db },
    sample: (input) => (taskOf(input) === 'tutor' ? 'Sure.' : new Promise(() => {})),
  });
  current.apps.push(app);
  if (layout) await app.page.addInitScript((l) => { try { localStorage.setItem('mu-layout', l); } catch (e) {} }, layout);
  await app.page.goto(app.url(hash));
  await app.page.evaluate(() => U.rt.ready);
  return app;
}
const shot = (app, name) => app.page.screenshot({ path: join(SHOTS, name + '.png'), fullPage: true });
const layoutOf = (app) => app.page.evaluate(() => ({ layout: document.documentElement.dataset.layout, framed: document.documentElement.classList.contains('framed') }));
const rect = (app, sel) => app.page.evaluate((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; }, sel);
const cols = (app, sel) => app.page.evaluate((s) => { const el = document.querySelector(s); return el ? getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length : 0; }, sel);
async function noSideways(app, where) {
  const o = await app.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  assert(o.sw <= o.cw + 1, `${where}: the page scrolls sideways (${o.sw} > ${o.cw})`);
}
async function go(app, hash, ready) {
  await app.page.evaluate((h) => { location.hash = h; }, hash);
  await app.page.locator(ready).first().waitFor({ timeout: 15000 });
  await app.page.waitForTimeout(300);
}

// ---------- Auto ----------
await test('auto: a phone gets the phone layout, tabs floating at the bottom, nothing sideways', async () => {
  const app = await open(390, 844);
  eq((await layoutOf(app)).layout, 'phone', 'layout');
  await app.page.locator('.tcard').first().waitFor();
  const tabs = await rect(app, '#tabs');
  // D4: the tabs float in an outlined bar, 12 px in from each side and 10 px above the bottom edge.
  assert(Math.abs(tabs.left - 12) < 2 && Math.abs(390 - tabs.right - 12) < 2 && Math.abs(844 - tabs.bottom - 10) < 2, 'tab bar floats along the bottom edge: ' + JSON.stringify(tabs));
  eq(await cols(app, '.tgrid'), 1, 'topic cards in one column');
  await noSideways(app, 'Learn');
  await shot(app, 'phone-learn');
  for (const [hash, ready, name] of [['#/t/pendulums', '.path', 'topic'], ['#/t/pendulums/i1', '.lsn-stage', 'lesson'], ['#/map', '.map-list, .v-empty', 'map'], ['#/book', '.view h1', 'book'], ['#/today', '.view h1', 'today']]) {
    await go(app, hash, ready);
    await noSideways(app, name);
    await shot(app, 'phone-' + name);
  }
});

await test('auto: a laptop gets the laptop layout and uses the width', async () => {
  const app = await open(1366, 768);
  eq((await layoutOf(app)).layout, 'laptop', 'layout');
  await app.page.locator('.tcard').first().waitFor();
  const tabs = await rect(app, '#tabs'), bar = await rect(app, '#topbar');
  assert(tabs.top >= bar.top && tabs.bottom <= bar.bottom + 1, 'tabs sit in the top bar');
  const view = await rect(app, '#view');
  assert(view.width > 1100, 'Learn uses the width: ' + view.width);
  eq(await cols(app, '.tgrid'), 3, 'topic cards in three columns');
  await noSideways(app, 'Learn');
  await shot(app, 'laptop-learn');

  await go(app, '#/t/pendulums', '.path');
  const main = await rect(app, '.tp-main'), rail = await rect(app, '.tp-rail');
  assert(rail && main && rail.left >= main.right && rail.top < main.bottom, 'topic page: Ask and sources beside the path ' + JSON.stringify({ main, rail }));
  const hook = await rect(app, '.tp-title');
  assert(hook.width <= 720, 'the title keeps a reading width: ' + hook.width);
  await noSideways(app, 'topic');
  await shot(app, 'laptop-topic');

  await go(app, '#/map', '.map-list');
  eq(await cols(app, '.map-list'), 2, 'Map shows two topics side by side');
  await noSideways(app, 'map');
  await shot(app, 'laptop-map');

  await go(app, '#/t/pendulums/i1', '.lsn-stage');
  await app.page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor();
  const head = await rect(app, '.lsn-head'), lede = await rect(app, '.lsn-stage');
  assert(head.width <= 720, 'the lesson heading keeps a reading width: ' + head.width);
  await app.page.locator('.option').nth(1).click();
  await app.page.getByRole('button', { name: 'That\'s my guess' }).click();
  await app.page.locator('.lsn-panel .kit-frame, .lsn-panel iframe').first().waitFor({ timeout: 15000 });
  const panel = await rect(app, '.lsn-play'), text = await rect(app, '.lsn-stage[data-stage="play"] .lsn-h');
  assert(panel.width >= 1000 && panel.width > text.width + 200, 'the interactive is wide, the text narrower ' + JSON.stringify({ panel: panel.width, text: text.width, lede: lede.width }));
  await app.page.waitForTimeout(800);
  await noSideways(app, 'lesson');
  await shot(app, 'laptop-lesson');

  // The Library's shelves use the width (two shelves side by side); the Book keeps the column.
  await go(app, '#/book', '.view h1');
  const lib = await rect(app, '#view');
  assert(lib.width > 720 && lib.width <= 1200, 'the Library uses the wide screens\' width: ' + lib.width);
  await shot(app, 'laptop-library');
  for (const [hash, ready, name] of [['#/book/words', '.view h1', 'book'], ['#/today', '.view h1', 'today']]) {
    await go(app, hash, ready);
    const v = await rect(app, '#view');
    assert(v.width <= 720, name + ' keeps the reading column: ' + v.width);
    await noSideways(app, name);
    await shot(app, 'laptop-' + name);
  }
});

await test('auto: the layout follows the window as it is resized', async () => {
  const app = await open(1280, 800);
  eq((await layoutOf(app)).layout, 'laptop', 'wide window');
  await app.page.setViewportSize({ width: 820, height: 800 });
  await app.page.waitForTimeout(200);
  eq((await layoutOf(app)).layout, 'phone', 'narrow window');
  await noSideways(app, 'narrow window');
  await app.page.setViewportSize({ width: 1100, height: 800 });
  await app.page.waitForTimeout(200);
  eq((await layoutOf(app)).layout, 'laptop', 'wide again');
});

// ---------- the setting ----------
await test('setting: Phone and Laptop pin the layout on this device only; Auto goes back', async () => {
  const app = await open(1366, 768);
  await app.page.click('#settings-btn');
  const seg = app.page.getByRole('radiogroup', { name: 'Layout' });
  await seg.waitFor();
  eq(await seg.getByRole('radio', { checked: true }).textContent(), 'Auto', 'Auto is the default');
  assert(/laptop layout here/.test(await app.page.textContent('.set-layout-note')), 'the note says what Auto picked');
  await seg.getByRole('radio', { name: 'Phone' }).click();
  let l = await layoutOf(app);
  assert(l.layout === 'phone' && l.framed, 'Phone on a laptop: the phone column ' + JSON.stringify(l));
  eq(await app.page.evaluate(() => localStorage.getItem('mu-layout')), 'phone', 'saved on the device');
  const sheet = await rect(app, '.sheet'), frame = await rect(app, '.app');
  assert(sheet.left >= frame.left - 1 && sheet.right <= frame.right + 1, 'the open sheet moves inside the phone column ' + JSON.stringify({ sheet, frame }));
  await shot(app, 'setting-phone');
  await seg.getByRole('radio', { name: 'Auto' }).click();
  l = await layoutOf(app);
  assert(l.layout === 'laptop' && !l.framed, 'Auto again: laptop ' + JSON.stringify(l));
  eq(await app.page.evaluate(() => localStorage.getItem('mu-layout')), null, 'Auto clears the device setting');
  await app.page.waitForTimeout(600);
  const dump = await app.stub();
  const prof = dump[`data/users/${UID}/profile`] || {};
  assert(!('layout' in (prof.prefs || {})) && !JSON.stringify(prof).includes('"layout"'), 'the layout never goes to the db profile');
});

await test('pinned phone on a laptop: a centred phone column with its own tab bar', async () => {
  const app = await open(1366, 768, { layout: 'phone' });
  const l = await layoutOf(app);
  assert(l.layout === 'phone' && l.framed, 'pinned before first paint ' + JSON.stringify(l));
  await app.page.locator('.tcard').first().waitFor();
  const frame = await rect(app, '.app'), tabs = await rect(app, '#tabs');
  assert(frame.width <= 432 && Math.abs((frame.left + frame.right) / 2 - 683) < 2, 'centred phone column ' + JSON.stringify(frame));
  assert(Math.abs(tabs.left - frame.left - 12) < 2 && Math.abs(frame.right - tabs.right - 12) < 2 && Math.abs(768 - tabs.bottom - 10) < 2, 'tab bar floats inside the column ' + JSON.stringify(tabs));
  eq(await cols(app, '.tgrid'), 1, 'the column gets the phone shapes: one column of topics');
  await noSideways(app, 'framed Learn');
  await shot(app, 'framed-learn');
  await go(app, '#/t/pendulums/i1', '.lsn-stage');
  const panel = await rect(app, '.lsn-stage');
  assert(panel.right <= frame.right + 1 && panel.left >= frame.left - 1, 'the lesson stays in the column');
  await shot(app, 'framed-lesson');
});

await test('pinned laptop on a phone: the top bar stays on one row', async () => {
  const app = await open(390, 844, { layout: 'laptop' });
  eq((await layoutOf(app)).layout, 'laptop', 'layout');
  await app.page.locator('.tcard').first().waitFor();
  const bar = await app.page.evaluate(() => { const b = document.getElementById('topbar'); return { sw: b.scrollWidth, cw: b.clientWidth, h: b.getBoundingClientRect().height }; });
  assert(bar.sw <= bar.cw + 1 && bar.h <= 64, 'one row, nothing cut off ' + JSON.stringify(bar));
  await noSideways(app, 'Learn');
  await shot(app, 'pinned-laptop-phone');
});

// ---------- navigation inside the viewer ----------
await test('in-app links route even when something else cancels link clicks', async () => {
  const app = await openApp({ width: 390, height: 844, file: FILE, config: { db: seedDb() }, sample: () => new Promise(() => {}) });
  current.apps.push(app);
  // A stand-in for a viewer that cancels every link click to handle it itself.
  await app.page.addInitScript(() => { document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a')) e.preventDefault(); }); });
  await app.page.goto(app.url('#/'));
  await app.page.evaluate(() => U.rt.ready);
  await app.page.click('#tabs a[data-tab="map"]');
  await app.page.waitForFunction(() => document.getElementById('view').dataset.screen === 'map', null, { timeout: 5000 });
  await app.page.locator('.tcard, .map-topic-head').first().waitFor({ timeout: 8000 }).catch(() => {});
  eq(await app.page.evaluate(() => location.hash), '#/map', 'the address follows');
  const ext = await app.page.evaluate(() => { const a = U.views.extLink('https://example.org/x', 'x'); return { href: a.getAttribute('href'), target: a.target, rel: a.rel }; });
  assert(ext.href === 'https://example.org/x' && ext.target === '_blank' && /noopener/.test(ext.rel), 'outbound links are plain new-tab links ' + JSON.stringify(ext));
});

// ---------- review cards on a phone and a laptop ----------
// Cards on the pendulum lesson (its interactive has no K.stage); a body with one swapped in.
const pad2 = (n) => (n < 10 ? '0' : '') + n;
const localDay = (n) => { const d = new Date(Date.now() + n * 864e5); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
const CARDS = {
  i1_c1: { ...PENDULUM.lesson.checks[0] },
  i1_c4: { id: 'c4', type: 'target', q: 'Set the string length so one swing takes 3 seconds.', control: 'L', output: 'T', target: 3, tolerance: 0.05, why: 'T = 2π√(L/g), so 3 s needs about 2.24 m.' },
};
const STAGED = PENDULUM.interactive.html.replace('K.check(', 'K.stage(\'.pd\', \'#pd-ctl\');\nK.check(');
async function openReview(width, height, { card, size = 'm', dark = false, html = null, why = null }) {
  const db = seedDb(), spec = why ? { ...CARDS[card], why } : CARDS[card];
  if (html) db['topics/pendulums/lessons/i1'] = { ...PENDULUM, interactive: { ...PENDULUM.interactive, html } };
  db[`data/users/${UID}/profile`] = { prefs: { theme: dark ? 'dark' : 'light', size, easy: false, cap: 15, light: false }, days: {}, createdAt: new Date().toISOString() };
  db[`data/users/${UID}/profile/cards/pendulums`] = { cards: { [card]: { id: card, tid: 'pendulums', iid: 'i1', type: spec.type, spec,
    createdAt: new Date().toISOString(), s: { due: localDay(-2), stability: 3.2, difficulty: 5.4, reps: 1, lapses: 0, last: localDay(-9) }, hist: [] } } };
  const app = await openApp({ width, height, dark, file: FILE, config: { db }, sample: () => new Promise(() => {}) });
  current.apps.push(app);
  await app.page.addInitScript(([t, s]) => { try { localStorage.setItem('mu-prefs', JSON.stringify({ theme: t, size: s })); } catch (e) {} }, [dark ? 'dark' : 'light', size]);
  await app.page.goto(app.url('#/review'));
  await app.page.evaluate(() => U.rt.ready);
  await app.page.locator('.rv-stage > .qc').waitFor({ timeout: 15000 });
  return app;
}
// Viewport rects of the review bar, the card parts (null when not shown) and (for target cards)
// the slider and the readout inside the interactive.
async function reviewRects(app) {
  const r = await app.page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e || e.hidden || !e.getClientRects().length) return null; const b = e.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }; };
    return { vh: innerHeight, bar: box('.rv-top'), q: box('.rv-stage .qc-q'), grades: box('.rv-stage .qc-grades'), cont: box('.rv-stage .qc-continue'), frame: box('.qc-stage iframe'),
      hint: box('.qc-hint'), btn: box('.qc-primary'), wide: document.querySelector('.rv-stage .qc').classList.contains('qc-wide'),
      goal: box('.rv-stage .qc-goal'), num: box('.rv-stage .qc-goal-num'), aim: box('.rv-stage .qc-aim'), fb: box('.rv-stage .qc-fb'), head: box('.rv-stage .qc-fb-head'), answer: box('.rv-stage .qc-fb .qc-answer'), done: box('.rv-stage .qc-change') };
  });
  if (r.frame) {
    const inner = await app.page.frameLocator('.qc-stage iframe').locator('body').evaluate(() => {
      const box = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom }; };
      return { range: box('.k-control input[type=range], input[type=range]'), readout: box('.k-readout') };
    });
    const at = (b) => b && { left: b.left + r.frame.left, right: b.right + r.frame.left, top: b.top + r.frame.top, bottom: b.bottom + r.frame.top };
    r.range = at(inner.range); r.readout = at(inner.readout);
  }
  return r;
}
const overlaps = (a, b) => !!(a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom);
const onScreen = (b, r) => !!b && b.top >= r.bar.bottom - 1 && b.bottom <= r.vh + 1;

for (const [w, h] of [[390, 844], [360, 707]]) {
  await test(`review on a ${w}x${h} phone: after a wrong answer, Change brings the grades and Continue on screen`, async () => {
    const app = await openReview(w, h, { card: 'i1_c1' });
    await app.page.locator('.qc-opt', { hasText: '8 s' }).click();
    await app.page.locator('.qc-primary').click();
    await app.page.locator('.qc-fb.is-wrong').waitFor();
    await app.page.waitForTimeout(800);
    let r = await reviewRects(app);
    assert(r.q.top >= r.bar.bottom - 1 && r.q.bottom <= r.vh, 'the question stays in view right after answering ' + JSON.stringify({ q: r.q, bar: r.bar.bottom }));
    await app.page.locator('.qc-change').click();
    await app.page.waitForTimeout(900);
    r = await reviewRects(app);
    assert(onScreen(r.grades, r) && onScreen(r.cont, r), 'after Change the grade buttons and Continue are on screen ' + JSON.stringify({ grades: r.grades, cont: r.cont, vh: r.vh }));
    await shot(app, `review-phone-${w}-change`);
  });
}

for (const size of ['m', 'xl']) {
  await test(`laptop review at ${size}: a target card without K.stage keeps a column; the hint and Check sit beside it, over nothing`, async () => {
    const app = await openReview(1366, 768, { card: 'i1_c4', size });
    await app.page.waitForFunction(() => !document.querySelector('.qc-primary').disabled, null, { timeout: 15000 });
    await app.page.waitForTimeout(1200);
    let r = await reviewRects(app);
    assert(!r.wide && r.frame.width <= 720, 'the interactive keeps a reading column, not the full width ' + JSON.stringify({ wide: r.wide, frame: r.frame.width }));
    assert(r.btn.left >= r.frame.right, 'Check sits beside the interactive ' + JSON.stringify({ btn: r.btn, frame: r.frame }));
    await app.page.locator('.qc-primary').click();
    await app.page.locator('.qc-hint:not([hidden])').waitFor();
    await app.page.waitForTimeout(500);
    r = await reviewRects(app);
    for (const [k, part] of [['hint', r.hint], ['Check', r.btn]]) {
      for (const [n, target] of [['slider', r.range], ['readout', r.readout]]) assert(!overlaps(part, target), `the ${k} does not cover the ${n} ` + JSON.stringify({ part, target }));
    }
    assert(r.hint.top >= r.bar.bottom - 1 && r.btn.bottom <= r.vh, 'the hint and Check are on screen ' + JSON.stringify({ hint: r.hint, btn: r.btn }));
    // Dan scrolls down to the slider: they stay beside it, on screen.
    await app.page.evaluate(() => window.scrollBy(0, 300));
    await app.page.waitForTimeout(300);
    r = await reviewRects(app);
    assert(r.hint.top >= r.bar.bottom - 1 && r.btn.bottom <= r.vh && !overlaps(r.btn, r.range) && !overlaps(r.hint, r.readout), 'scrolled, the hint and Check stay in view beside the interactive ' + JSON.stringify({ hint: r.hint, btn: r.btn }));
    await noSideways(app, 'target card');
    await shot(app, `review-laptop-target-${size}`);
  });
}

await test('laptop review: a target card whose interactive has a K.stage gets the full width, and the docked bar clears its controls', async () => {
  const app = await openReview(1366, 768, { card: 'i1_c4', size: 'xl', html: STAGED });
  await app.page.waitForFunction(() => !document.querySelector('.qc-primary').disabled, null, { timeout: 15000 });
  await app.page.waitForTimeout(1200);
  let r = await reviewRects(app);
  assert(r.wide && r.frame.width >= 1000, 'the kit reports the stage and the interactive gets the width ' + JSON.stringify({ wide: r.wide, frame: r.frame.width }));
  assert(onScreen(r.num, r) && !r.aim, 'the docked bar does not repeat the goal sentence on screen ' + JSON.stringify({ num: r.num, aim: r.aim }));
  await app.page.locator('.qc-primary').click();
  await app.page.locator('.qc-hint:not([hidden])').waitFor();
  await app.page.waitForTimeout(500);
  r = await reviewRects(app);
  for (const [k, part] of [['hint', r.hint], ['Check', r.btn]]) {
    for (const [n, target] of [['slider', r.range], ['readout', r.readout]]) assert(!overlaps(part, target), `the ${k} does not cover the ${n} ` + JSON.stringify({ part, target }));
  }
  await shot(app, 'review-laptop-target-stage');
});

// The feedback beside a target card is held under the bar (top 76 px). Dan presses Check again
// while scrolled down to the readout (or presses it, then scrolls down), then Change: a panel
// that fits below the bar stays held there whole (heading, answer line, Done, grades, Continue)
// and never drops back to the question's row above the screen; one too tall for that starts just
// under the bar, and Change brings its grades and Continue on screen.
const WHY4 = 'T = 2π√(L/g), so a 3 s swing needs a string about 2.24 m long. The swing time grows with the square root of the length, not with the length itself. That is why doubling the time needs four times the string, not twice as much. Gravity sets the scale: on the Moon, where the pull is about a sixth as strong, the same string would swing about two and a half times more slowly.';
const WHY_HUGE = [WHY4, WHY4, WHY4].join('\n\n');
// A first miss (the hint), then Check again: scrolled down by `by` before it ('scrolled') or
// just after it ('then').
async function checkTwice(app, by, when = 'scrolled') {
  const scroll = async () => { await app.page.evaluate((y) => window.scrollBy(0, y), by); await app.page.waitForTimeout(400); };
  await app.page.waitForFunction(() => !document.querySelector('.qc-primary').disabled, null, { timeout: 15000 });
  await app.page.waitForTimeout(1200);
  await app.page.locator('.qc-primary').click();
  await app.page.locator('.qc-hint:not([hidden])').waitFor();
  if (when === 'scrolled') await scroll();
  await app.page.locator('.qc-primary').click();
  await app.page.locator('.qc-fb.is-wrong').waitFor();
  await app.page.waitForTimeout(900);
  if (when === 'then') await scroll();
  return reviewRects(app);
}
const offScreen = (r) => ['fb', 'head', 'answer', 'done', 'cont'].filter((k) => !onScreen(r[k], r));
for (const [w, h, size, dark, by, why] of [[1366, 768, 'm', false, 400], [1366, 768, 'xl', false, 400], [960, 700, 'xl', true, 400], [960, 700, 'xl', true, 200], [1366, 768, 'm', false, 300, WHY4]]) {
  for (const when of ['scrolled', 'then']) {
    const how = when === 'scrolled' ? `scrolled ${by} px, Check again and Change` : `Check again, scroll ${by} px and Change`;
    await test(`laptop review ${w}x${h} ${size}${dark ? ' dark' : ''}${why ? ', a long why' : ''}: ${how}; the target card's whole panel stays on screen`, async () => {
      const app = await openReview(w, h, { card: 'i1_c4', size, dark, why });
      let r = await checkTwice(app, by, when);
      assert(!r.wide, 'the pendulum keeps the column layout');
      assert(!offScreen(r).length, 'after Check again the whole panel is on screen, under the bar; off: ' + offScreen(r).join(', ') + ' ' + JSON.stringify({ fb: r.fb, bar: r.bar.bottom, vh: r.vh }));
      if (when === 'scrolled') await shot(app, `review-laptop-target-${w}-${size}-${by}${why ? '-why' : ''}-check`);
      await app.page.locator('.qc-change').click();
      await app.page.waitForTimeout(900);
      r = await reviewRects(app);
      assert(!offScreen(r).length && onScreen(r.grades, r), 'after Change the whole panel and its grades are on screen; off: ' + offScreen(r).join(', ') + ' ' + JSON.stringify({ fb: r.fb, grades: r.grades, bar: r.bar.bottom, vh: r.vh }));
      if (when === 'scrolled') await shot(app, `review-laptop-target-${w}-${size}-${by}${why ? '-why' : ''}-change`);
    });
  }
}
await test('laptop review 960x700 xl: a target panel too tall to hold under the bar starts just under it, and Change shows its grades and Continue', async () => {
  const app = await openReview(960, 700, { card: 'i1_c4', size: 'xl', why: WHY_HUGE });
  let r = await checkTwice(app, 400);
  assert(r.fb.height > r.vh - 76, 'the panel is taller than the room under the bar ' + r.fb.height);
  assert(onScreen(r.head, r) && r.fb.top >= r.bar.bottom - 1 && r.fb.top <= r.bar.bottom + 24, 'the panel starts just under the bar ' + JSON.stringify({ fb: r.fb, head: r.head, bar: r.bar.bottom }));
  await app.page.locator('.qc-change').click();
  await app.page.waitForTimeout(900);
  r = await reviewRects(app);
  assert(onScreen(r.done, r) && onScreen(r.grades, r) && onScreen(r.cont, r), 'after Change, Done, the grades and Continue are on screen ' + JSON.stringify({ done: r.done, grades: r.grades, cont: r.cont, vh: r.vh }));
});

// The aim beside Check repeats the goal sentence: on a laptop it shows only once the goal's
// number can no longer be read, never beside a number Dan can still read, and never leaves him
// without it. It comes in under Check (in the docked bar, beside it), so Check never moves. What
// can be read is measured on the screen, not with the card's own rule (which compares boxes): the
// share of the number's ink, found in a screenshot at the top, still drawn where the number now
// is, every 2 px through the band where it passes under the bar, down and back up. A phone keeps
// the aim under the interactive, above Check.
const frames = (app) => app.page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
const dist = (d, i, e, j) => Math.abs(d[i] - e[j]) + Math.abs(d[i + 1] - e[j + 1]) + Math.abs(d[i + 2] - e[j + 2]);
// The goal's number as drawn now (whole css px): its box and which of its pixels are ink.
async function numberInk(app) {
  const n = await rect(app, '.rv-stage .qc-goal-num'), x = Math.floor(n.left), y = Math.floor(n.top);
  const box = { x, y, width: Math.ceil(n.right) - x, height: Math.ceil(n.bottom) - y };
  const img = readPng(await app.page.screenshot({ clip: box })), ink = [];
  for (let i = 0; i < img.width * img.height * img.channels; i += img.channels) if (dist(img.data, i, img.data, 0) > 90) ink.push(i);
  return { box, img, ink, k: img.width / box.width, sy: await app.page.evaluate(() => scrollY) };
}
// The share of that ink still drawn in the same place now that the page has scrolled.
async function inkShown(app, g) {
  const sy = await app.page.evaluate(() => scrollY), top = g.box.y - (sy - g.sy), from = Math.max(0, top);
  if (from >= top + g.box.height) return 0;
  const img = readPng(await app.page.screenshot({ clip: { x: g.box.x, y: from, width: g.box.width, height: top + g.box.height - from } }));
  const skip = Math.round((from - top) * g.k) * g.img.width * g.img.channels;
  return g.ink.filter((i) => i >= skip && dist(img.data, i - skip, g.img.data, i) <= 60).length / g.ink.length;
}
// Whether showing or hiding the aim would move Check (the class the card's watcher sets, flipped
// and put back before anything paints).
const aimMovesCheck = (app) => app.page.evaluate(() => {
  const card = document.querySelector('.rv-stage .qc'), at = () => { const b = card.querySelector('.qc-primary').getBoundingClientRect(); return [b.left, b.top, b.width, b.height].join(); };
  const a = at(); card.classList.toggle('qc-goal-away'); const b = at(); card.classList.toggle('qc-goal-away');
  return a !== b;
});
for (const [w, h, size, dark, html] of [[1366, 768, 'm', false], [1366, 768, 'xl', false], [960, 700, 'xl', true], [1366, 768, 'xl', false, STAGED]]) {
  await test(`laptop review ${w}x${h} at ${size}${dark ? ' dark' : ''}${html ? ', K.stage' : ''}: the target card's aim shows only once the goal's number cannot be read, and Check never moves`, async () => {
    const app = await openReview(w, h, { card: 'i1_c4', size, dark, html });
    await app.page.waitForFunction(() => !document.querySelector('.qc-primary').disabled, null, { timeout: 15000 });
    await app.page.waitForTimeout(800);
    let r = await reviewRects(app);
    assert(!!r.wide === !!html, 'the expected layout ' + JSON.stringify({ wide: r.wide }));
    assert(onScreen(r.num, r) && !r.aim, 'with the goal sentence on screen the aim is not shown ' + JSON.stringify({ goal: r.goal, aim: r.aim }));
    const g = await numberInk(app);
    assert(g.ink.length > 20 && (await inkShown(app, g)) === 1, 'the number is found on the screen ' + g.ink.length);
    // Where the number's box passes under the bar once the bar has stuck.
    const band = g.box.y + g.box.height - r.bar.height;
    const down = [];
    for (let y = 0; y < band - 36; y += 15) down.push(y);
    for (let y = Math.max(0, band - 36); y <= band + 16; y += 2) down.push(y);
    for (let y = band + 30; y < 420; y += 15) down.push(y);
    down.push(420);
    const up = [];
    for (let y = band + 15; y >= band - 37; y -= 2) up.push(y);
    let prev = null, partly = 0;
    for (const y of [...down, ...up, 0]) {
      await app.page.evaluate((v) => window.scrollTo(0, v), y);
      await frames(app);
      r = await reviewRects(app);
      const sy = await app.page.evaluate(() => scrollY), shown = await inkShown(app, g), at = `scrolled to ${sy} px with ${Math.round(shown * 100)}% of the number showing`;
      if (shown > 0 && shown < 1) partly++;
      assert(!r.aim || shown < 0.5, `${at}, the aim shows beside a number Dan can still read ` + JSON.stringify({ num: r.num, bar: r.bar.bottom, aim: r.aim }));
      assert(shown > 0 || onScreen(r.aim, r), `${at}, the number is gone and the aim is not on screen ` + JSON.stringify({ num: r.num, bar: r.bar.bottom, aim: r.aim }));
      assert(!(await aimMovesCheck(app)), `${at}, showing or hiding the aim moves Check ` + JSON.stringify({ btn: r.btn }));
      // Scrolling, Check moves with the page or stays put (held under the bar or docked), never against it.
      if (prev) {
        const moved = r.btn.top - prev.btn, by = sy - prev.sy;
        assert(by >= 0 ? moved <= 0.5 && moved >= -by - 0.5 : moved >= -0.5 && moved <= -by + 0.5, `${at}, Check jumps by ${moved} px for a scroll of ${by} px`);
      }
      prev = { btn: r.btn.top, sy };
      if (y === 420) {
        assert(shown === 0 && onScreen(r.aim, r) && (html ? r.aim.right <= r.btn.left : r.aim.top >= r.btn.bottom), 'with the goal sentence gone, the aim shows ' + (html ? 'beside' : 'under') + ' Check ' + JSON.stringify({ aim: r.aim, btn: r.btn }));
        await shot(app, `review-laptop-target-${w}-${size}${html ? '-stage' : ''}-aim`);
      }
    }
    assert(partly >= 4, 'the sweep went through the band where the number is partly under the bar ' + partly);
    assert(!r.aim, 'back at the top the aim goes again ' + JSON.stringify({ goal: r.goal, aim: r.aim }));
  });
}
for (const [w, h] of [[390, 844], [360, 707]]) {
  await test(`review on a ${w}x${h} phone: a target card keeps its aim under the interactive, above Check`, async () => {
    const app = await openReview(w, h, { card: 'i1_c4' });
    await app.page.waitForFunction(() => !document.querySelector('.qc-primary').disabled, null, { timeout: 15000 });
    await app.page.waitForTimeout(800);
    const r = await reviewRects(app);
    assert(r.aim && r.aim.top >= r.frame.bottom && r.aim.bottom <= r.btn.top, 'the aim sits under the interactive, above Check ' + JSON.stringify({ aim: r.aim, frame: r.frame, btn: r.btn }));
  });
}
// ---------- Learn at narrow laptop widths (UX round 3) ----------
// Reading settings saved in the db profile, so boot applies them (and emits 'prefs') while Learn draws.
function withPrefs(db, prefs) { return { ...db, [`data/users/${UID}/profile`]: { prefs: { theme: 'light', size: 'm', easy: false, cap: 15, light: false, ...prefs } } }; }
// Cards for one topic: `due` of them due today, `later` due in two days, `doneToday` reviewed
// today (and due in four days).
function withCards(db, { due = 0, later = 0, doneToday = 0 } = {}) {
  const cards = {};
  for (let i = 0; i < due + later + doneToday; i++) {
    const id = 'i1_c' + i, at = new Date(Date.now() - 9 * 864e5).toISOString(), done = i >= due + later;
    cards[id] = { id, tid: 'how-tides-work-ab12', iid: 'i1', type: 'choice', createdAt: at, learnedAt: at,
      hist: [{ at, grade: 3, ok: true }].concat(done ? [{ at: new Date().toISOString(), grade: 3, ok: true }] : []),
      spec: { id: 'c' + i, type: 'choice', q: 'How many high tides do most coasts get in a day?', options: ['One', 'Two'], answer: 1, why: 'Two bulges.' },
      s: { due: localDay(i < due ? 0 : done ? 4 : 2), stability: 3, difficulty: 5, reps: 1, lapses: 0, last: localDay(done ? 0 : -9) } };
  }
  return { ...db, [`data/users/${UID}/profile/cards/how-tides-work-ab12`]: { cards } };
}
const askBox = (app) => app.page.evaluate(() => {
  const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, width: b.width, height: b.height }; };
  const learn = document.querySelector('.learn');
  return { input: r('#ask-input'), go: r('.ask-go'), ask: r('.ask'), rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
    cols: getComputedStyle(learn).gridTemplateColumns.split(' ').filter((c) => /px$/.test(c)).length, size: document.documentElement.dataset.size };
});
const settle = (app) => app.page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 50)))));
// An empty ask box is one line tall, level with its go button (which is one line tall at every size).
async function oneLine(app, where) {
  await settle(app);
  const b = await askBox(app);
  assert(Math.abs(b.input.height - b.go.height) < 1.5 && Math.abs(b.input.top - b.go.top) < 1.5,
    `${where} (${b.size}): the empty box is one line, level with its button (box ${b.input.height} at ${b.input.top}, button ${b.go.height} at ${b.go.top})`);
  return b;
}

await test('ux3: the ask box fits its words and placeholder after boot, a text size change and a resize', async () => {
  // The boot 'prefs' event used to fit the box while Learn still had its first-run placeholder,
  // and the box kept two lines once Dan's topics arrived (940-1024 px, every size but s).
  for (const [w, size] of [[1024, 'xl'], [940, 'm'], [960, 'l']]) {
    const app = await open(w, 768, { db: withCards(withPrefs(seedDb(), { size }), { due: 2 }) });
    await app.page.locator('.tcard').first().waitFor();
    await oneLine(app, `returning at ${w}`);
    if (w !== 1024) continue;
    for (const s of ['m', 'l', 'xl']) {
      await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), s);
      await oneLine(app, `text size changed at ${w}`);
    }
    for (const [vw, vh] of [[940, 768], [1366, 768], [960, 700]]) {
      await app.page.setViewportSize({ width: vw, height: vh });
      await oneLine(app, `resized to ${vw}`);
    }
    await app.page.fill('#ask-input', 'How do vaccines train the immune system to remember a virus it has never met before');
    await settle(app);
    const grown = await askBox(app);
    assert(grown.input.height > grown.go.height + 10, 'a long question still grows the box: ' + grown.input.height);
    await app.page.fill('#ask-input', '');
    await oneLine(app, 'cleared');
    // A width change that is not a window resize (here the Layout setting) fits the box again too.
    await app.page.setViewportSize({ width: 1366, height: 768 });
    await app.page.fill('#ask-input', 'How do tides work around a small island');
    await oneLine(app, 'a short question on the laptop');
    await app.page.evaluate(() => U.layout.set('phone'));
    await settle(app);
    const framed = await askBox(app);
    assert(framed.input.width < 400 && framed.input.height > framed.go.height + 10, `in the phone column the question wraps and the box grows (${framed.input.width} wide, ${framed.input.height} tall)`);
    await app.page.evaluate(() => U.layout.set('auto'));
    await oneLine(app, 'back on the laptop');
  }
});

await test('ux3: Learn goes two columns only when the ask keeps 35rem; the box stays wider than Start learning', async () => {
  const db = withPrefs(Object.fromEntries(Object.entries(seedDb()).filter(([k]) => !k.startsWith('topics/'))), { size: 'xl' });
  const app = await open(960, 768, { db });
  await app.page.locator('.welcome').waitFor();
  for (const [vw, size] of [[960, 'xl'], [1024, 'xl'], [1100, 'l'], [1366, 'xl'], [940, 'm'], [960, 'm'], [1366, 'm']]) {
    await app.page.setViewportSize({ width: vw, height: 768 });
    await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), size);
    const b = await oneLine(app, `first run at ${vw}`);   // the placeholder fits on one line
    const where = `${vw} px at ${size}`;
    assert(b.input.width > b.go.width + 40, `${where}: the box (${b.input.width}) is wider than its button (${b.go.width})`);
    if (b.cols === 2) {
      assert(b.ask.width >= 35 * b.rem - 1, `${where}: beside the welcome the ask keeps 35rem (${b.ask.width} < ${35 * b.rem})`);
      const welcome = await rect(app, '.welcome');
      assert(welcome.left >= b.ask.right, `${where}: how it works sits beside the ask`);
    }
    await noSideways(app, where);
    if (vw === 960 && size === 'xl') await shot(app, 'ux3-learn-first-960-xl');
  }
  // The checker's case: at 960 px and Extra large the ask now has the full width.
  await app.page.setViewportSize({ width: 960, height: 768 });
  await app.page.evaluate(() => U.settings.apply(Object.assign({}, U.settings.prefs, { size: 'xl' })));
  await settle(app);
  eq((await askBox(app)).cols, 0, 'one column at 960 px and Extra large');
  await app.page.setViewportSize({ width: 1366, height: 768 });
  await settle(app);
  eq((await askBox(app)).cols, 2, 'two columns at 1366 px and Extra large');
});

await test('ux3: laptop Learn with nothing due says so quietly beside the ask; phones and one column do not', async () => {
  const app = await open(1366, 768, { db: withCards(seedDb(), { later: 2 }) });
  await app.page.locator('.today-row.is-quiet').waitFor();
  const quiet = await rect(app, '.today-row.is-quiet'), ask = await rect(app, '.ask'), h1 = await rect(app, '.ask h1');
  assert(quiet.left >= ask.right && quiet.top < h1.bottom, 'the line sits in the top-right, beside the ask ' + JSON.stringify({ quiet, ask }));
  const words = await app.page.locator('.today-row.is-quiet').innerText();
  assert(/Nothing to review today/.test(words) && /Next up: 2 cards (tomorrow|on )/.test(words), 'says nothing is due and when cards come back: ' + words);
  eq(await app.page.locator('.learn-today a').count(), 0, 'a status, not a nudge to tap');
  eq(await app.page.locator('.today-row:not(.is-quiet)').count(), 0, 'no reviews row');
  await shot(app, 'ux3-learn-nothing-due-1366');
  // Returning Learn keeps its two columns from 900 px of view (940 px wide); one column (the laptop
  // layout at 910 px, so under 900 px of view) has no line.
  await app.page.setViewportSize({ width: 940, height: 768 });
  await settle(app);
  const quiet940 = await rect(app, '.today-row.is-quiet'), ask940 = await rect(app, '.ask');
  assert(quiet940.width > 0 && quiet940.left >= ask940.right, 'two columns at 940 px: the line beside the ask');
  await app.page.setViewportSize({ width: 910, height: 768 });
  await settle(app);
  eq(await app.page.locator('.today-row.is-quiet').isVisible(), false, 'one column at 910 px: no line');
  await app.page.setViewportSize({ width: 390, height: 844 });
  await settle(app);
  eq(await app.page.locator('.today-row.is-quiet').isVisible(), false, 'phone: no line, Continue stays near the top');

  // No cards at all yet; and with reviews waiting the row that opens Today is back.
  const fresh = await open(1366, 768);
  await fresh.page.locator('.today-row.is-quiet').waitFor();
  assert(/Nothing to review yet/.test(await fresh.page.locator('.today-row.is-quiet').innerText()), 'no cards yet');
  const due = await open(1366, 768, { db: withCards(seedDb(), { due: 3, later: 1 }) });
  await due.page.locator('a.today-row').waitFor();
  eq(await due.page.locator('.today-row.is-quiet').count(), 0, 'reviews waiting: the usual row');
  assert(/3 reviews ready/.test(await due.page.locator('a.today-row').innerText()), 'three ready');
});

// ---------- Learn follow-ups (UX round 3b) ----------
const borderOf = (app, sel) => app.page.evaluate((s) => getComputedStyle(document.querySelector(s)).borderTopColor, sel);
// How far the reviews row's arrow is from the end of its words. It measures the words' own line
// boxes (each text node's client rects), not a Range over .today-text, whose children are blocks
// as wide as the text column, so that ended by the arrow however far away the words stopped.
// Words that wrap have used all the room the row has, so the ragged end of a wrapped line is not
// a gap, as long as the text column runs right up to the arrow.
const arrowGap = (app) => app.page.evaluate(() => {
  const text = document.querySelector('a.today-row .today-text'), arrow = document.querySelector('a.today-row .today-go').getBoundingClientRect().left;
  const walk = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
  let right = -Infinity, wraps = false;
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const r = document.createRange();
    r.selectNodeContents(n);
    const lines = [...r.getClientRects()].filter((b) => b.width > 0);
    if (lines.length > 1) wraps = true;
    for (const b of lines) right = Math.max(right, b.right);
  }
  const g = { gap: Math.round(arrow - right), wraps, column: Math.round(arrow - text.getBoundingClientRect().right) };
  return { ...g, byLabel: g.gap < 40 || (g.wraps && g.column < 20) };
});

await test('ux3b: only the reviews link reacts to hover; the quiet line does not look tappable', async () => {
  const app = await open(1366, 768, { db: withCards(seedDb(), { later: 2 }) });
  await app.page.locator('.today-row.is-quiet').waitFor();
  await app.page.mouse.move(5, 700);
  const still = await borderOf(app, '.today-row.is-quiet');
  await app.page.hover('.today-row.is-quiet');
  await app.page.waitForTimeout(200);
  eq(await borderOf(app, '.today-row.is-quiet'), still, 'the quiet line keeps its border under the pointer');
  const due = await open(1366, 768, { db: withCards(seedDb(), { due: 2 }) });
  await due.page.locator('a.today-row').waitFor();
  await due.page.mouse.move(5, 700);
  const rest = await borderOf(due, 'a.today-row');
  await due.page.hover('a.today-row');
  await due.page.waitForTimeout(200);
  assert(await borderOf(due, 'a.today-row') !== rest, 'the reviews link still answers the pointer');
});

await test('ux3b: Learn, Today and a review with nothing to show say the same words, and count what the daily limit held back', async () => {
  for (const [name, db, head, sub] of [
    // The limit (15) is used up and 5 are still due: they wait for tomorrow (2 more come back in two days).
    ['limit used up', withCards(seedDb(), { due: 5, later: 2, doneToday: 15 }), 'Done for today', /^Next up: 5 cards tomorrow\.$/],
    ['done for today', withCards(seedDb(), { later: 2, doneToday: 3 }), 'Done for today', /^Next up: 2 cards on \S+\.$/],
    ['nothing due', withCards(seedDb(), { later: 2 }), 'Nothing to review today', /^Next up: 2 cards on \S+\.$/],
    ['no cards yet', seedDb(), 'Nothing to review yet', /^When you finish a lesson, the questions you answered come back the next day, so they stick\.$/],
  ]) {
    const app = await open(1366, 768, { db });
    await app.page.locator('.today-row.is-quiet').waitFor();
    const learn = await app.page.evaluate(() => [...document.querySelectorAll('.today-row.is-quiet .today-text > *')].map((e) => e.textContent));
    eq(learn[0], head, `${name}: Learn's line`);
    assert(sub.test(learn[1]), `${name}: Learn's line says "${learn[1]}"`);
    const words = (sel) => app.page.evaluate((box) => {
      const t = (s) => { const el = document.querySelector(box + ' ' + s); return el ? el.textContent : ''; };
      return { head: t('.td-title'), lead: t('.td-lead'), next: t('.td-next'), more: t('.td-more-note') };
    }, sel);
    await go(app, '#/today', '.td-clear');
    const today = await words('.td-clear');
    eq(today.head, head, `${name}: Today's heading matches Learn`);
    eq(today.next || today.lead, learn[1], `${name}: Today says what Learn says`);
    if (name === 'limit used up') assert(/^5 more cards are due/.test(today.more), 'Today still offers the 5 waiting, without hurry: ' + today.more);
    // The focus-mode review with nothing to show (an old link, Back after a session) says the same,
    // never a third wording; with the limit used up, #/review/more still has the 5 waiting.
    for (const hash of name === 'limit used up' ? ['#/review'] : ['#/review', '#/review/more']) {
      await go(app, hash, '.rv-empty');
      eq(JSON.stringify(await words('.rv-empty')), JSON.stringify(today), `${name}: ${hash} says what Today says`);
      await noSideways(app, `${name}: ${hash}`);
    }
    if (name !== 'limit used up') continue;
    // Side by side on a laptop, "Back to Today" and "Review 5 more" keep one line at every text size.
    for (const size of ['m', 'xl']) {
      await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), size);
      await settle(app);
      const lines = await app.page.evaluate(() => [...document.querySelectorAll('.rv-empty .td-actions .btn')].map((b) => {
        const r = document.createRange();
        r.selectNodeContents(b);
        return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size;
      }));
      eq(JSON.stringify(lines), '[1,1]', `${name} at ${size}: each button keeps its words on one line`);
      await shot(app, 'ux3c-review-empty-limit-used-up-1366-' + size);
    }
  }
});

await test('ux3b: returning Learn keeps two columns from 900 px at every text size; the reviews row stays compact', async () => {
  const app = await open(1024, 768, { db: withCards(withPrefs(seedDb(), { size: 'xl' }), { due: 2 }) });
  await app.page.locator('a.today-row').waitFor();
  for (const [vw, size] of [[940, 'xl'], [1024, 'xl'], [1190, 'xl'], [940, 'l'], [1075, 'l'], [940, 'm'], [959, 'm'], [1366, 'm'], [1366, 'xl']]) {
    await app.page.setViewportSize({ width: vw, height: 768 });
    await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), size);
    const where = `${vw} px at ${size}`;
    const b = await oneLine(app, `returning at ${vw}`);
    eq(b.cols, 2, `${where}: two columns`);
    const row = await rect(app, 'a.today-row'), ask = await rect(app, '.ask'), h1 = await rect(app, '.ask h1'), cont = await rect(app, '.ccard');
    assert(row.left >= ask.right && row.top < h1.bottom, `${where}: the reviews row sits beside the ask ${JSON.stringify({ row, ask })}`);
    assert(row.width <= 381, `${where}: the reviews row keeps its column (${row.width})`);
    assert(cont.top < Math.max(ask.bottom, row.bottom) + 60, `${where}: Continue comes straight after (${cont.top} vs ${ask.bottom} / ${row.bottom})`);
    const g = await arrowGap(app);
    assert(g.byLabel, `${where}: the arrow sits by its label (${JSON.stringify(g)})`);
    await noSideways(app, where);
    if (vw === 1024) await shot(app, 'ux3b-learn-returning-1024-' + size);
  }
  // One column (the laptop layout under 900 px of view, a wide phone column, phones): the row is as
  // wide as its words, so its arrow stays by its label.
  for (const [vw, size] of [[910, 'm'], [910, 'xl'], [700, 'm'], [390, 'xl'], [360, 'm']]) {
    await app.page.setViewportSize({ width: vw, height: 800 });
    await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), size);
    await settle(app);
    const where = `one column, ${vw} px at ${size}`;
    eq((await askBox(app)).cols, 0, where);
    const g = await arrowGap(app);
    assert(g.byLabel, `${where}: the arrow sits by its label (${JSON.stringify(g)})`);
    await noSideways(app, where);
  }
});

await test('ux3b: while Claude plans on a phone, Planning… takes its own row and the whole question shows', async () => {
  for (const [w, h, size] of [[390, 844, 'xl'], [360, 707, 'm']]) {
    const app = await open(w, h, { db: withPrefs(seedDb(), { size }) });
    await app.page.locator('.tcard').first().waitFor();
    await app.page.evaluate(() => { U.gen.createTopic = () => new Promise(() => {}); });
    await app.page.fill('#ask-input', 'How do vaccines train the immune system to remember a virus it has never met before');
    await app.page.click('.ask-go');
    await app.page.locator('.ask-go.is-busy').waitFor();
    await settle(app);
    const where = `${w} px at ${size}`;
    const input = await rect(app, '#ask-input'), btn = await rect(app, '.ask-go'), ask = await rect(app, '.ask');
    assert(btn.top >= input.bottom - 1, `${where}: Planning… sits under the question (${btn.top} < ${input.bottom})`);
    assert(input.width >= ask.width - 1, `${where}: the question keeps the full width (${input.width} of ${ask.width})`);
    const sc = await app.page.evaluate(() => { const i = document.querySelector('#ask-input'); return { sh: i.scrollHeight, ch: i.clientHeight, top: i.scrollTop }; });
    assert(sc.sh <= sc.ch + 1 && sc.top === 0, `${where}: the whole question shows (${sc.sh} > ${sc.ch})`);
    await noSideways(app, where);
    await shot(app, `ux3b-learn-busy-${w}-${size}`);
  }
});

// ---------- Learn follow-ups (UX round 3c) ----------
await test('ux3c: while Claude plans, Planning… takes its own row wherever the ask form is narrow, at every width', async () => {
  // The checker's case: at 940 px and Extra large the returning ask's column is 480 px, and a long
  // question beside the busy button grew into a 260 x 393 px box that pushed Continue off the screen.
  // Under 36rem the form stacks; wider, the box keeps at least 24rem beside the button.
  const Q = 'How do vaccines train the immune system to remember a virus it has never met before, and why do some need boosters while others last a lifetime of exposure';
  const noTopics = Object.fromEntries(Object.entries(seedDb()).filter(([k]) => !k.startsWith('topics/')));
  for (const [kind, db, cases] of [
    ['returning', seedDb(), [[940, 'xl', true], [960, 'xl', true], [1024, 'xl', true], [940, 'm', true], [1024, 'm', true], [1190, 'xl', false], [1366, 'm', false], [1366, 'xl', false], [390, 'xl', true]]],
    ['first run', noTopics, [[960, 'xl', false], [1366, 'xl', true], [1366, 'm', false], [700, 'xl', true], [360, 'm', true]]],
  ]) {
    const app = await open(cases[0][0], 768, { db: withPrefs(db, { size: cases[0][1] }) });
    await app.page.locator(kind === 'returning' ? '.tcard' : '.welcome').first().waitFor();
    await app.page.evaluate(() => { U.gen.createTopic = () => new Promise(() => {}); });
    await app.page.fill('#ask-input', Q);
    await app.page.click('.ask-go');
    await app.page.locator('.ask-go.is-busy').waitFor();
    for (const [vw, size, stack] of cases) {
      await app.page.setViewportSize({ width: vw, height: 768 });
      await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), size);
      await settle(app);
      const where = `${kind}, ${vw} px at ${size}`;
      const b = await askBox(app), form = await rect(app, '.ask-form'), input = b.input, btn = b.go;
      eq(form.width < 36 * b.rem, stack, `${where}: the form (${form.width} px) is narrow`);
      if (vw === 940) eq(b.cols, 2, `${where}: two columns`);
      if (stack) {
        assert(btn.top >= input.top + input.height - 1, `${where}: Planning… sits under the question (${btn.top} < ${input.top + input.height})`);
        assert(input.width >= form.width - 1 && btn.width >= form.width - 1, `${where}: the question and Planning… keep the form's width (${input.width}, ${btn.width} of ${form.width})`);
        assert(input.height < input.width, `${where}: not a tall narrow box (${input.width} x ${input.height})`);
      } else {
        assert(btn.left >= input.right - 1, `${where}: Planning… stays beside the question`);
        assert(input.width >= 24 * b.rem, `${where}: the box beside it keeps 24rem (${input.width})`);
      }
      const sc = await app.page.evaluate(() => { const i = document.querySelector('#ask-input'); return { sh: i.scrollHeight, ch: i.clientHeight, top: i.scrollTop }; });
      assert(sc.sh <= sc.ch + 1 && sc.top === 0, `${where}: the whole question shows (${sc.sh} > ${sc.ch})`);
      await noSideways(app, where);
      if (vw === 940 && size === 'xl') await shot(app, 'ux3c-learn-busy-940-xl');
    }
  }
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} layout tests passed`);
process.exit(failed.length ? 1 : 0);
