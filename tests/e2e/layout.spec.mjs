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
// on a phone, Learn and Today's shared words); and no screen ever scrolls sideways. Screenshots land in tests/out/layout/.
// Usage: node tests/e2e/layout.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, readJson, taskOf, ROOT } from '../../tools/harness/page.mjs';

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
await test('auto: a phone gets the phone layout, tabs docked at the bottom, nothing sideways', async () => {
  const app = await open(390, 844);
  eq((await layoutOf(app)).layout, 'phone', 'layout');
  await app.page.locator('.tcard').first().waitFor();
  const tabs = await rect(app, '#tabs');
  assert(Math.abs(tabs.bottom - 844) < 2 && tabs.width >= 389, 'tab bar spans the bottom edge: ' + JSON.stringify(tabs));
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

  for (const [hash, ready, name] of [['#/book', '.view h1', 'book'], ['#/today', '.view h1', 'today']]) {
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
  assert(Math.abs(tabs.left - frame.left) < 2 && Math.abs(tabs.right - frame.right) < 2 && Math.abs(tabs.bottom - 768) < 2, 'tab bar docked inside the column ' + JSON.stringify(tabs));
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

// ---------- Learn at narrow laptop widths (UX round 3) ----------
const localDay = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
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
const frames = (app) => app.page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 50)))));
// An empty ask box is one line tall, level with its go button (which is one line tall at every size).
async function oneLine(app, where) {
  await frames(app);
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
    await frames(app);
    const grown = await askBox(app);
    assert(grown.input.height > grown.go.height + 10, 'a long question still grows the box: ' + grown.input.height);
    await app.page.fill('#ask-input', '');
    await oneLine(app, 'cleared');
    // A width change that is not a window resize (here the Layout setting) fits the box again too.
    await app.page.setViewportSize({ width: 1366, height: 768 });
    await app.page.fill('#ask-input', 'How do tides work around a small island');
    await oneLine(app, 'a short question on the laptop');
    await app.page.evaluate(() => U.layout.set('phone'));
    await frames(app);
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
  await frames(app);
  eq((await askBox(app)).cols, 0, 'one column at 960 px and Extra large');
  await app.page.setViewportSize({ width: 1366, height: 768 });
  await frames(app);
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
  await frames(app);
  const quiet940 = await rect(app, '.today-row.is-quiet'), ask940 = await rect(app, '.ask');
  assert(quiet940.width > 0 && quiet940.left >= ask940.right, 'two columns at 940 px: the line beside the ask');
  await app.page.setViewportSize({ width: 910, height: 768 });
  await frames(app);
  eq(await app.page.locator('.today-row.is-quiet').isVisible(), false, 'one column at 910 px: no line');
  await app.page.setViewportSize({ width: 390, height: 844 });
  await frames(app);
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
// From the end of the reviews row's words to its arrow.
const arrowGap = (app) => app.page.evaluate(() => {
  const r = document.createRange();
  r.selectNodeContents(document.querySelector('a.today-row .today-text'));
  return document.querySelector('a.today-row .today-go').getBoundingClientRect().left - r.getBoundingClientRect().right;
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

await test('ux3b: Learn and Today say the same words when nothing is waiting, and count what the daily limit held back', async () => {
  for (const [name, db, head, sub] of [
    // The limit (15) is used up and 5 are still due: they wait for tomorrow (2 more come back in two days).
    ['limit used up', withCards(seedDb(), { due: 5, later: 2, doneToday: 15 }), 'Done for today', /^Next up: 5 cards tomorrow\.$/],
    ['nothing due', withCards(seedDb(), { later: 2 }), 'Nothing to review today', /^Next up: 2 cards on \S+\.$/],
    ['no cards yet', seedDb(), 'Nothing to review yet', /^When you finish a lesson, the questions you answered come back the next day, so they stick\.$/],
  ]) {
    const app = await open(1366, 768, { db });
    await app.page.locator('.today-row.is-quiet').waitFor();
    const learn = await app.page.evaluate(() => [...document.querySelectorAll('.today-row.is-quiet .today-text > *')].map((e) => e.textContent));
    eq(learn[0], head, `${name}: Learn's line`);
    assert(sub.test(learn[1]), `${name}: Learn's line says "${learn[1]}"`);
    await go(app, '#/today', '.td-clear');
    const today = await app.page.evaluate(() => {
      const t = (s) => { const el = document.querySelector(s); return el ? el.textContent : ''; };
      return { head: t('.td-title'), lead: t('.td-lead'), next: t('.td-next'), more: t('.td-more-note') };
    });
    eq(today.head, head, `${name}: Today's heading matches Learn`);
    eq(today.next || today.lead, learn[1], `${name}: Today says what Learn says`);
    if (name === 'limit used up') assert(/^5 more cards are due/.test(today.more), 'Today still offers the 5 waiting, without hurry: ' + today.more);
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
    assert(await arrowGap(app) < 40, `${where}: the arrow sits by its label`);
    await noSideways(app, where);
    if (vw === 1024) await shot(app, 'ux3b-learn-returning-1024-' + size);
  }
  // One column (the laptop layout under 900 px of view, a wide phone column, phones): the row is as
  // wide as its words, so its arrow stays by its label.
  for (const [vw, size] of [[910, 'm'], [910, 'xl'], [700, 'm'], [390, 'xl'], [360, 'm']]) {
    await app.page.setViewportSize({ width: vw, height: 800 });
    await app.page.evaluate((v) => U.settings.apply(Object.assign({}, U.settings.prefs, { size: v })), size);
    await frames(app);
    const where = `one column, ${vw} px at ${size}`;
    eq((await askBox(app)).cols, 0, where);
    const gap = await arrowGap(app);
    assert(gap < 40, `${where}: the arrow sits by its label (${gap} px away)`);
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
    await frames(app);
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

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} layout tests passed`);
process.exit(failed.length ? 1 : 0);
