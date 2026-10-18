#!/usr/bin/env node
// Browser tests for the phone and laptop layouts (U.layout, head.html, 10-base.css and the
// laptop rules in 50-lesson.css and 70-views.css), on the complete build with only the model
// stubbed. Checks: Auto picks phone on a phone and laptop on a laptop and follows a resized
// window; the Layout setting pins either, per device (localStorage only, never the db); a
// pinned phone layout on a laptop is a centred phone column with its tab bar and sheets inside
// it; a pinned laptop layout on a phone keeps the top bar on one row; the laptop shapes (topic
// shelves, topic page columns, Map columns, a wide lesson interactive with a narrower text column);
// the words Today and an empty review share; no screen ever
// scrolls sideways; and D4 (80-d4.css, Claude's notes in 52-notes.js), which the lesson, review and
// views specs leave out of their pages: a finished lesson's green bar, focus mode's missing tab bar,
// Continue on screen after a review answer on small phones, 44 px reply chips and note links,
// replies reaching Ask Claude (with what he has just done; typed ones saved, chips not, a chip
// waiting in the box included), the second go's hint, Today's notes, the byline at
// Extra large, the callout notices and the dimmed answers. Screenshots land in tests/out/layout/.
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

// Two shelves for the Library (the home), so a laptop can show them side by side.
const SHELVES = {
  'shelves/maths': { v: 1, title: 'Maths', order: 1, blurb: 'Every area of maths in one place.', folders: [{ id: 'mechanics', title: 'Mechanics', courses: [{ id: 'pendulums', title: 'Why pendulums keep time', tid: 'pendulums' }, { id: 'tides', title: 'How tides work', tid: 'how-tides-work-ab12' }] }] },
  'shelves/electrical': { v: 1, title: 'Electrical engineering', order: 2, blurb: 'Circuits, power at sea, machines.', folders: [{ id: 'circuits', title: 'Circuit analysis', courses: [{ id: 'ac', title: 'AC circuits', tid: null }] }] },
};
function seedDb() {
  const db = { 'topics/pendulums': TOPIC, 'topics/pendulums/lessons/i1': PENDULUM, ...SHELVES };
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
  await app.page.locator('.lib-home .shelf-card').first().waitFor();
  const tabs = await rect(app, '#tabs');
  // D4: the tabs float in an outlined bar, 12 px in from each side and 10 px above the bottom edge.
  assert(Math.abs(tabs.left - 12) < 2 && Math.abs(390 - tabs.right - 12) < 2 && Math.abs(844 - tabs.bottom - 10) < 2, 'tab bar floats along the bottom edge: ' + JSON.stringify(tabs));
  eq(await cols(app, '.lib-home .shelf-grid'), 1, 'shelves in one column');
  await noSideways(app, 'the Library');
  await shot(app, 'phone-library');
  for (const [hash, ready, name] of [['#/t/pendulums', '.path', 'topic'], ['#/t/pendulums/i1', '.lsn-stage', 'lesson'], ['#/map', '.map-list, .v-empty', 'map'], ['#/book', '.view h1', 'book'], ['#/today', '.view h1', 'today']]) {
    await go(app, hash, ready);
    await noSideways(app, name);
    await shot(app, 'phone-' + name);
  }
});

await test('auto: a laptop gets the laptop layout and uses the width', async () => {
  const app = await open(1366, 768);
  eq((await layoutOf(app)).layout, 'laptop', 'layout');
  await app.page.locator('.lib-home .shelf-card').first().waitFor();
  const tabs = await rect(app, '#tabs'), bar = await rect(app, '#topbar');
  assert(tabs.top >= bar.top && tabs.bottom <= bar.bottom + 1, 'tabs sit in the top bar');
  const view = await rect(app, '#view');
  assert(view.width > 1100, 'the Library uses the width: ' + view.width);
  eq(await cols(app, '.lib-home .shelf-grid'), 2, 'shelves side by side');
  await noSideways(app, 'the Library');
  await shot(app, 'laptop-library');

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

  // The Book's dossiers use the width; its own words keep the column.
  await go(app, '#/book', '.view h1');
  const lib = await rect(app, '#view');
  assert(lib.width > 720 && lib.width <= 1200, 'the dossiers use the wide screens\' width: ' + lib.width);
  await shot(app, 'laptop-dossiers');
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
  await app.page.locator('.lib-home .shelf-card').first().waitFor();
  const frame = await rect(app, '.app'), tabs = await rect(app, '#tabs');
  assert(frame.width <= 432 && Math.abs((frame.left + frame.right) / 2 - 683) < 2, 'centred phone column ' + JSON.stringify(frame));
  assert(Math.abs(tabs.left - frame.left - 12) < 2 && Math.abs(frame.right - tabs.right - 12) < 2 && Math.abs(768 - tabs.bottom - 10) < 2, 'tab bar floats inside the column ' + JSON.stringify(tabs));
  eq(await cols(app, '.lib-home .shelf-grid'), 1, 'the column gets the phone shapes: one column of shelves');
  await noSideways(app, 'framed Library');
  await shot(app, 'framed-library');
  await go(app, '#/t/pendulums/i1', '.lsn-stage');
  const panel = await rect(app, '.lsn-stage');
  assert(panel.right <= frame.right + 1 && panel.left >= frame.left - 1, 'the lesson stays in the column');
  await shot(app, 'framed-lesson');
});

await test('pinned laptop on a phone: the top bar stays on one row', async () => {
  const app = await open(390, 844, { layout: 'laptop' });
  eq((await layoutOf(app)).layout, 'laptop', 'layout');
  await app.page.locator('.lib-home .shelf-card').first().waitFor();
  const bar = await app.page.evaluate(() => { const b = document.getElementById('topbar'); return { sw: b.scrollWidth, cw: b.clientWidth, h: b.getBoundingClientRect().height }; });
  assert(bar.sw <= bar.cw + 1 && bar.h <= 64, 'one row, nothing cut off ' + JSON.stringify(bar));
  await noSideways(app, 'the Library');
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
  await app.page.click('#tabs a[data-tab="book"]');
  await app.page.waitForFunction(() => document.getElementById('view').dataset.screen === 'book', null, { timeout: 5000 });
  eq(await app.page.evaluate(() => location.hash), '#/book', 'the address follows');
  await app.page.click('a.lib-map');
  await app.page.waitForFunction(() => document.getElementById('view').dataset.screen === 'map', null, { timeout: 5000 });
  eq(await app.page.evaluate(() => location.hash), '#/map', 'and a link on the page too');
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
// ---------- Today and an empty review (UX rounds 3 and 3b) ----------
// Reading settings saved in the db profile, so boot applies them (and emits 'prefs') as the app opens.
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
const settle = (app) => app.page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 50)))));
await test('ux3b: Today and a review with nothing to show say the same words, and count what the daily limit held back', async () => {
  for (const [name, db, head, sub] of [
    // The limit (15) is used up and 5 are still due: they wait for tomorrow (2 more come back in two days).
    ['limit used up', withCards(seedDb(), { due: 5, later: 2, doneToday: 15 }), 'Done for today', /^Next up: 5 cards tomorrow\.$/],
    ['done for today', withCards(seedDb(), { later: 2, doneToday: 3 }), 'Done for today', /^Next up: 2 cards on \S+\.$/],
    ['nothing due', withCards(seedDb(), { later: 2 }), 'Nothing to review today', /^Next up: 2 cards on \S+\.$/],
    ['no cards yet', seedDb(), 'Nothing to review yet', /^When you finish a lesson, the questions you answered come back the next day, so they stick\.$/],
  ]) {
    const app = await open(1366, 768, { db });
    const words = (sel) => app.page.evaluate((box) => {
      const t = (s) => { const el = document.querySelector(box + ' ' + s); return el ? el.textContent : ''; };
      return { head: t('.td-title'), lead: t('.td-lead'), next: t('.td-next'), more: t('.td-more-note') };
    }, sel);
    await go(app, '#/today', '.td-clear');
    const today = await words('.td-clear');
    eq(today.head, head, `${name}: Today's heading`);
    assert(sub.test(today.next || today.lead), `${name}: Today says "${today.next || today.lead}"`);
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

// ---------- D4: the look (80-d4.css) and Claude's notes (52-notes.js) on this full page ----------
const PROG = (tid) => `data/users/${UID}/profile/progress/${tid}`;
const withProgress = (db, tid, doc) => ({ ...db, [PROG(tid)]: doc });
// His first say-it-back answer to the pendulum lesson, graded "partly", in round 0.
const SAID = { text: 'Longer is slower.', at: '2026-10-01T10:10:00.000Z', verdict: 'partly', met: [true, false, false], nailed: 'You saw that a longer string swings more slowly.', followUp: 'How much slower is a string four times as long?', round: 0 };
const atStage = (stage, more = {}) => withProgress(seedDb(), 'pendulums', { ideas: { i1: { stage, round: 0, startedAt: '2026-10-01T10:00:00.000Z', ...more } } });
// A colour as the page computes it (rgb()), for comparing with a token.
const tokenColor = (app, name) => app.page.evaluate((n) => { const e = document.createElement('i'); e.style.color = `var(${n})`; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; }, name);
const sampled = async (app) => (await app.calls()).filter((c) => c.kind === 'sample')
  .map((c) => (Array.isArray(c.input) ? c.input.map((t) => (typeof t.content === 'string' ? t.content : JSON.stringify(t.content))).join('\n\n') : String(c.input)));
// The n-th question sent to Ask Claude (its whole request), once it has gone ('' if it never does).
async function tutorAsked(app, n = 1) {
  for (let i = 0; i < 100; i++) {
    const asked = (await sampled(app)).filter((t) => /TASK: tutor/.test(t));
    if (asked.length >= n) return asked[n - 1];
    await app.page.waitForTimeout(100);
  }
  return '';
}
// The sRGB colours in a computed colour string (rgb() or color(srgb …)), as 0-255 triples.
function colours(css) {
  const out = [];
  for (const m of css.matchAll(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)|color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/g)) out.push(m[1] ? [+m[1], +m[2], +m[3]] : [m[4] * 255, m[5] * 255, m[6] * 255]);
  return out;
}
function contrast(a, b) {
  const lum = (c) => { const [r, g, bl] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

await test('d4: a finished lesson\'s bar turns green under "Idea learned"; the step he is on reads at 3:1', async () => {
  const app = await open(390, 844, { hash: '#/t/pendulums/i1', db: atStage('done', { doneAt: '2026-10-01T10:20:00.000Z' }) });
  await app.page.locator('.lsn-bar.is-all').waitFor({ timeout: 15000 });
  await app.page.waitForTimeout(600);   // the segments' colour fades in (.35 s)
  const green = await tokenColor(app, '--green');
  const segs = await app.page.$$eval('.lsn-step > i', (l) => l.map((i) => getComputedStyle(i).backgroundColor));
  assert(segs.length > 1 && segs.every((c) => c === green), `every segment is green (${green}): ${segs.join(', ')}`);
  assert(/Idea (learned|read)/.test(await app.page.textContent('.lsn-steps-label')), 'the label says so');
  const now = await open(390, 844, { hash: '#/t/pendulums/i1', db: atStage('checks') });
  await now.page.locator('.lsn-step.is-now').waitFor({ timeout: 15000 });
  const [filled, rest] = colours(await now.page.$eval('.lsn-step.is-now > i', (i) => getComputedStyle(i).backgroundImage)).filter((c, i, l) => i === 0 || String(c) !== String(l[0]));
  assert(filled && rest && contrast(filled, rest) >= 3, `the current step's filled part against its unfilled part is at least 3:1 (${filled && rest && contrast(filled, rest).toFixed(2)})`);
});

await test('d4: focus mode (a lesson, a review) makes no room for the hidden tabs on a phone; the tabs keep theirs elsewhere', async () => {
  const room = (app) => app.page.evaluate(() => ({ focus: document.documentElement.classList.contains('focus'), tabbar: getComputedStyle(document.documentElement).getPropertyValue('--tabbar-h').trim(), toasts: getComputedStyle(document.querySelector('.toasts')).bottom, pad: getComputedStyle(document.documentElement).scrollPaddingBottom }));
  const phone = await open(360, 640, { hash: '#/t/pendulums/i1' });
  await phone.page.locator('.lsn-stage').first().waitFor({ timeout: 15000 });
  let r = await room(phone);
  assert(r.focus && r.tabbar === '0px' && r.toasts === '16px' && r.pad === '16px', 'a lesson on a phone: ' + JSON.stringify(r));
  await go(phone, '#/review', '.view h1, .rv-stage');
  r = await room(phone);
  assert(r.focus && r.toasts === '16px', 'a review on a phone: ' + JSON.stringify(r));
  await go(phone, '#/', '.lib-home .shelf-card');
  r = await room(phone);
  assert(!r.focus && r.toasts === '104px' && r.pad === '104px', 'the Library on a phone keeps room for the floating tabs: ' + JSON.stringify(r));
  const laptop = await open(1280, 800, { hash: '#/t/pendulums/i1' });
  await laptop.page.locator('.lsn-stage').first().waitFor({ timeout: 15000 });
  r = await room(laptop);
  assert(r.focus && r.toasts === '16px', 'a lesson on a laptop: ' + JSON.stringify(r));
  await go(laptop, '#/', '.lib-home .shelf-card');
  r = await room(laptop);
  assert(!r.focus && r.toasts === '16px', 'the Library on a laptop (tabs in the top bar): ' + JSON.stringify(r));
});

// Right answers, wrong ones and (at 390 x 844) the wrong one with a common mix-up. A wrong answer
// at 360 x 640 never docked on this card, before D4 too (its panel needs 311 px; the dock leaves
// it 281): its panel joins the flow under the answers, as it did.
for (const [w, h, picks] of [[360, 640, ['4 s']], [360, 707, ['4 s', '16 s']], [390, 844, ['4 s', '16 s', '8 s']]]) {
  await test(`d4: review on a ${w}x${h} phone: Continue is on screen right after answering (${picks.join(', ')})`, async () => {
    for (const pick of picks) {
      const app = await openReview(w, h, { card: 'i1_c1' });
      await app.page.locator('.qc-opt', { hasText: pick }).click();
      await app.page.locator('.qc-primary').click();
      await app.page.locator('.qc-fb').waitFor();
      await app.page.waitForTimeout(800);
      const r = await reviewRects(app);
      assert(onScreen(r.cont, r), `${pick}: Continue is on screen ${JSON.stringify({ cont: r.cont, fb: r.fb, vh: r.vh })}`);
      assert(r.q.top >= r.bar.bottom - 1, `${pick}: the question starts below the bar`);
      const reply = await app.page.$$eval('.rv-stage .qc-fb .note-chip', (l) => l.filter((b) => b.getClientRects().length).map((b) => b.textContent));
      assert(reply.some((t) => /Reply/.test(t)), `${pick}: a way to reply to Claude stays (${reply.join(', ')})`);
      if (w === 360 && h === 640) await shot(app, `d4-review-${w}x${h}-${pick.replace(/\W/g, '')}`);
      await app.close();
    }
  });
}

await test('d4: reply chips and note links are 44 px targets; a chip asks Claude with what he has just done', async () => {
  // A review with room for its row of chips.
  const app = await openReview(390, 844, { card: 'i1_c1' });
  await app.page.locator('.qc-opt', { hasText: '4 s' }).click();
  await app.page.locator('.qc-primary').click();
  await app.page.locator('.qc-fb .note-chip').first().waitFor();
  await app.page.waitForTimeout(500);
  const chips = await app.page.$$eval('.qc-fb .note-chip', (l) => l.map((b) => ({ t: b.textContent, h: b.getBoundingClientRect().height })));
  assert(chips.length === 3 && chips.every((c) => c.h >= 44), 'review chips: ' + JSON.stringify(chips));
  eq(await app.page.$eval('.option.qc-dim', (o) => getComputedStyle(o).opacity), '1', 'dimmed answers fade by colour, not opacity (the dots stay behind them)');
  eq(await app.page.$eval('.option.qc-dim', (o) => getComputedStyle(o).color), await tokenColor(app, '--muted'), 'dimmed answers in muted ink');
  await app.page.locator('.qc-fb .note-chip', { hasText: 'Why?' }).click();
  const asked = await tutorAsked(app, 1);
  assert(/WHAT HE HAS JUST DONE/.test(asked) && asked.includes('He chose "4 s"') && /Why\?/.test(asked), 'the tutor request says what he has just done and asks the chip\'s question');

  // A lesson's check: chips, the reply box, then (after Continue) nothing in the way.
  const lsn = await open(360, 640, { hash: '#/t/pendulums/i1', db: atStage('checks', { say: { k1: SAID } }) });
  await lsn.page.locator('.lsn-stage[data-stage="checks"] .qc-opt').first().waitFor({ timeout: 15000 });
  await lsn.page.locator('.lsn-stage[data-stage="checks"] .qc-opt', { hasText: '8 s' }).click();
  await lsn.page.locator('.lsn-stage[data-stage="checks"] .qc-primary').click();
  await lsn.page.locator('.qc-fb .note-reply').waitFor();
  const order = await lsn.page.$eval('.qc-fb', (p) => [...p.children].map((c) => c.classList.contains('qc-continue') ? 'continue' : c.classList.contains('note-reply') ? 'reply' : '').filter(Boolean));
  eq(order.join(','), 'continue,reply', 'in a lesson Continue comes straight after the explanation, the reply box after it');
  const sizes = await lsn.page.$$eval('.qc-fb .note-chip, .qc-fb .note-send, .qc-fb .note-input', (l) => l.map((b) => Math.round(b.getBoundingClientRect().height)));
  assert(sizes.length === 4 && sizes.every((x) => x >= 44), 'lesson chips, box and send are 44 px: ' + sizes);
  await lsn.page.locator('.qc-fb .note-chip', { hasText: 'Why?' }).click();
  const q1 = await tutorAsked(lsn, 1);
  await lsn.page.locator('.tutor-msg.bot').first().waitFor({ timeout: 10000 });
  assert(/WHAT HE HAS JUST DONE/.test(q1) && q1.includes('He chose "8 s"') && /he got it wrong/.test(q1), 'the lesson check\'s chip says what he has just done');
  await lsn.page.keyboard.press('Escape');
  await lsn.page.locator('.tutor-sheet').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await lsn.page.fill('.qc-fb .note-input', 'Why does the square root come in?');
  await lsn.page.press('.qc-fb .note-input', 'Enter');
  await lsn.page.waitForFunction(() => document.querySelectorAll('.tutor-msg.bot').length >= 2 && !document.querySelector('.tutor-msg.bot.pending, .tutor-msg.pending'), null, { timeout: 10000 }).catch(() => {});
  await lsn.page.waitForTimeout(1500);
  const qs = Object.values(((await lsn.stub())[PROG('pendulums')] || {}).questions || {}).map((x) => x.q);
  assert(qs.includes('Why does the square root come in?'), 'a typed reply is saved as his question: ' + JSON.stringify(qs));
  assert(!qs.includes('Why?'), 'a chip is not: ' + JSON.stringify(qs));

});

await test('d4: say it back: while his second go is open the chip asks for a hint and Claude is told not to give it away', async () => {
  const app = await open(390, 844, { hash: '#/t/pendulums/i1', db: atStage('say', { say: { k1: SAID } }) });
  await app.page.locator('.lsn-grade .note-chip').first().waitFor({ timeout: 15000 });
  eq((await app.page.$$eval('.lsn-grade .note-chip', (l) => l.map((b) => b.textContent))).join(', '), 'Give me a hint, Give me an example', 'the chips');
  assert(await app.page.locator('.lsn-after .btn', { hasText: 'Have another go' }).count() === 1, 'his second go is on offer');
  await app.page.locator('.lsn-grade .note-chip', { hasText: 'Give me a hint' }).click();
  let asked = await tutorAsked(app, 1);
  await app.page.locator('.tutor-msg.bot').first().waitFor({ timeout: 10000 });
  assert(/He still has a second go at this answer/.test(asked) && /do not state the missing point/.test(asked), 'Claude is told he still has a second go');
  // Once he has asked for the model answer, the second go is gone from the screen: no holding back.
  await app.page.keyboard.press('Escape');
  await app.page.waitForTimeout(400);
  await app.page.locator('.lsn-after', { hasText: 'Show me a model answer' }).locator('button, a').filter({ hasText: 'Show me a model answer' }).click();
  await app.page.locator('.lsn-model').waitFor();
  await app.page.locator('.lsn-grade .note-chip', { hasText: 'Give me an example' }).click();
  asked = await tutorAsked(app, 2);
  assert(/WHAT HE HAS JUST DONE/.test(asked) && !/second go/.test(asked), 'after the model answer nothing is held back');
});

await test('d4: a chip tapped while Claude is still answering waits in the box and, sent as it is, is not saved as his question', async () => {
  let release = null, n = 0;
  const app = await openApp({ width: 390, height: 844, file: FILE, config: { db: atStage('say', { say: { k1: SAID } }) },
    sample: (input) => (taskOf(input) !== 'tutor' ? new Promise(() => {}) : ++n === 1 ? new Promise((r) => { release = () => r('Here is a hint.'); }) : 'Sure.') });
  current.apps.push(app);
  await app.page.goto(app.url('#/t/pendulums/i1'));
  await app.page.evaluate(() => U.rt.ready);
  const chip = app.page.locator('.lsn-grade .note-chip');
  await chip.first().waitFor({ timeout: 15000 });
  await chip.first().click();
  await app.page.locator('.tutor-msg.bot').first().waitFor();
  await app.page.keyboard.press('Escape');
  await app.page.waitForTimeout(400);
  await chip.nth(1).click();
  await app.page.locator('.tutor-input').waitFor();
  eq(await app.page.inputValue('.tutor-input'), 'Give me an example', 'the chip waits in the box');
  release();
  await app.page.waitForFunction(() => !document.querySelector('.tutor-send').disabled, null, { timeout: 10000 });
  await app.page.click('.tutor-send');
  await app.page.waitForFunction(() => document.querySelectorAll('.tutor-msg.bot').length >= 2, null, { timeout: 10000 });
  await app.page.waitForTimeout(1200);
  eq(n, 2, 'both questions went to Claude');
  const qs = Object.values(((await app.stub())[PROG('pendulums')] || {}).questions || {}).map((x) => x.q);
  assert(!qs.includes('Give me an example'), 'the chip is not saved as his question: ' + JSON.stringify(qs));
  // Edited first, it is his own words.
  await app.page.fill('.tutor-input', 'Give me an example with a swing');
  await app.page.click('.tutor-send');
  await app.page.waitForTimeout(1500);
  const qs2 = Object.values(((await app.stub())[PROG('pendulums')] || {}).questions || {}).map((x) => x.q);
  assert(qs2.includes('Give me an example with a swing'), 'a typed question is saved: ' + JSON.stringify(qs2));
});

await test('d4: the note byline at Large and Extra large keeps one row; a long context wraps in its own column', async () => {
  // Claude's notes on Today, once the day's review is done (the cards came from tides' first idea).
  const said = withProgress(withCards(seedDb(), { later: 1, doneToday: 2 }), 'how-tides-work-ab12', { ...SEED.progress['how-tides-work-ab12'], ideas: { ...SEED.progress['how-tides-work-ab12'].ideas, i1: { stage: 'done', round: 0, say: { k: { ...SAID, at: '2026-10-02T10:00:00.000Z' } } } } });
  const app = await open(360, 800, { hash: '#/today', db: withPrefs(said, { size: 'xl' }) });
  await app.page.locator('.td-notes .note-by').first().waitFor({ timeout: 15000 });
  for (const size of ['l', 'xl']) {
    await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), size);
    await app.page.waitForTimeout(300);
    const b = await app.page.$eval('.td-notes .note-by', (by) => {
      const r = (s) => by.querySelector(s).getBoundingClientRect();
      const ctx = by.querySelector('.note-ctx');
      return { av: r('.note-av'), name: r('.note-name'), ctx: r('.note-ctx'), lines: Math.round(ctx.getBoundingClientRect().height / parseFloat(getComputedStyle(ctx).lineHeight)) };
    });
    assert(b.ctx.left >= b.name.right && b.ctx.top < b.av.bottom, `${size}: the context stays beside the name ${JSON.stringify(b)}`);
    if (size === 'xl') { assert(b.lines >= 2, `${size}: a long context wraps (${b.lines} lines)`); await shot(app, 'd4-today-notes-xl'); }
  }
});

await test('d4: Today\'s notes come after the session (none above Start review), in the first paint; nothing below them moves', async () => {
  const said = (db) => withProgress(db, 'how-tides-work-ab12', { ...SEED.progress['how-tides-work-ab12'], ideas: { ...SEED.progress['how-tides-work-ab12'].ideas, i1: { stage: 'done', round: 0, say: { k: { ...SAID } } } } });
  // Due: the cards are still to be recalled, so no note gives their answers away.
  {
    const app = await openApp({ width: 390, height: 844, file: FILE, config: { db: said(withCards(seedDb(), { due: 3 })) }, sample: () => new Promise(() => {}) });
    current.apps.push(app);
    await app.page.goto(app.url('#/today'));
    await app.page.evaluate(() => U.rt.ready);
    await app.page.locator('.td-start').waitFor({ timeout: 15000 });
    await app.page.waitForTimeout(800);
    const n = await app.page.evaluate(() => document.querySelectorAll('.td .note-text').length);
    eq(n, 0, 'notes on Today while cards are due');
  }
  // Done for today: Claude's notes on the ideas just reviewed, there when the screen first appears.
  const app = await openApp({ width: 390, height: 844, file: FILE, config: { db: said(withCards(seedDb(), { later: 1, doneToday: 2 })) }, sample: () => new Promise(() => {}) });
  current.apps.push(app);
  await app.page.addInitScript(() => {
    window.__first = null;
    new MutationObserver(() => {
      if (window.__first || !document.querySelector('.td-title')) return;
      const w = document.querySelector('.td-week');
      window.__first = { notes: !!document.querySelector('.td .notes'), week: w ? w.getBoundingClientRect().top + scrollY : null };
    }).observe(document, { childList: true, subtree: true });
  });
  await app.page.goto(app.url('#/today'));
  await app.page.evaluate(() => U.rt.ready);
  await app.page.locator('.td-title').waitFor({ timeout: 15000 });
  await app.page.waitForTimeout(1500);
  const r = await app.page.evaluate(() => ({ first: window.__first, title: document.querySelector('.td-title').textContent, head: (document.querySelector('#td-notes-h') || {}).textContent, notes: [...document.querySelectorAll('.td .note-text')].map((n) => n.textContent), week: document.querySelector('.td-week').getBoundingClientRect().top + scrollY }));
  eq(r.title, 'Done for today', 'the screen');
  assert(r.first && r.first.notes, 'the notes are there when the screen first appears ' + JSON.stringify(r));
  assert(Math.abs(r.first.week - r.week) < 1, `nothing below moves (${r.first.week} then ${r.week})`);
  eq(r.head, 'Claude\'s notes on today\'s review', 'the notes\' heading');
  eq(r.notes.join(' / '), SAID.followUp, 'Claude\'s follow-up on the idea reviewed today');
});

await test('d4: the lessons\' "callout note" notices keep the callout look (not a note card\'s)', async () => {
  const app = await open(390, 844, { hash: '#/t/pendulums/i1' });
  await app.page.locator('.lsn-stage').first().waitFor({ timeout: 15000 });
  const r = await app.page.evaluate(() => {
    const p = U.h('p', { class: 'callout note' }, 'The quick checks are not loaded in this view, so they are skipped this time.');
    document.querySelector('.lsn-stage').appendChild(p);
    const cs = getComputedStyle(p), out = { padding: cs.padding, display: cs.display, border: cs.borderTopStyle };
    p.remove();
    return out;
  });
  eq(JSON.stringify(r), JSON.stringify({ padding: '16px 18px', display: 'block', border: 'dashed' }), 'the notice');
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} layout tests passed`);
process.exit(failed.length ? 1 : 0);
