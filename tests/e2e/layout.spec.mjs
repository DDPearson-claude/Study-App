#!/usr/bin/env node
// Browser tests for the phone and laptop layouts (U.layout, head.html, 10-base.css and the
// laptop rules in 50-lesson.css and 70-views.css), on the complete build with only the model
// stubbed. Checks: Auto picks phone on a phone and laptop on a laptop and follows a resized
// window; the Layout setting pins either, per device (localStorage only, never the db); a
// pinned phone layout on a laptop is a centred phone column with its tab bar and sheets inside
// it; a pinned laptop layout on a phone keeps the top bar on one row; the laptop shapes (topic
// grid, topic page columns, Map columns, a wide lesson interactive with a narrower text column);
// and no screen ever scrolls sideways. Screenshots land in tests/out/layout/.
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
async function open(width, height, { layout = null, hash = '#/' } = {}) {
  const app = await openApp({
    width, height, file: FILE, config: { db: seedDb() },
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

// ---------- review cards on a phone and a laptop ----------
// Cards on the pendulum lesson (its interactive has no K.stage); a body with one swapped in.
const pad2 = (n) => (n < 10 ? '0' : '') + n;
const localDay = (n) => { const d = new Date(Date.now() + n * 864e5); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
const CARDS = {
  i1_c1: { ...PENDULUM.lesson.checks[0] },
  i1_c4: { id: 'c4', type: 'target', q: 'Set the string length so one swing takes 3 seconds.', control: 'L', output: 'T', target: 3, tolerance: 0.05, why: 'T = 2π√(L/g), so 3 s needs about 2.24 m.' },
};
const STAGED = PENDULUM.interactive.html.replace('K.check(', 'K.stage(\'.pd\', \'#pd-ctl\');\nK.check(');
async function openReview(width, height, { card, size = 'm', dark = false, html = null }) {
  const db = seedDb();
  if (html) db['topics/pendulums/lessons/i1'] = { ...PENDULUM, interactive: { ...PENDULUM.interactive, html } };
  db[`data/users/${UID}/profile`] = { prefs: { theme: dark ? 'dark' : 'light', size, easy: false, cap: 15, light: false }, days: {}, createdAt: new Date().toISOString() };
  db[`data/users/${UID}/profile/cards/pendulums`] = { cards: { [card]: { id: card, tid: 'pendulums', iid: 'i1', type: CARDS[card].type, spec: CARDS[card],
    createdAt: new Date().toISOString(), s: { due: localDay(-2), stability: 3.2, difficulty: 5.4, reps: 1, lapses: 0, last: localDay(-9) }, hist: [] } } };
  const app = await openApp({ width, height, dark, file: FILE, config: { db }, sample: () => new Promise(() => {}) });
  current.apps.push(app);
  await app.page.addInitScript(([t, s]) => { try { localStorage.setItem('mu-prefs', JSON.stringify({ theme: t, size: s })); } catch (e) {} }, [dark ? 'dark' : 'light', size]);
  await app.page.goto(app.url('#/review'));
  await app.page.evaluate(() => U.rt.ready);
  await app.page.locator('.rv-stage > .qc').waitFor({ timeout: 15000 });
  return app;
}
// Viewport rects of the review bar, the card parts and (for target cards) the slider and the
// readout inside the interactive.
async function reviewRects(app) {
  const r = await app.page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width }; };
    return { vh: innerHeight, bar: box('.rv-top'), q: box('.rv-stage .qc-q'), grades: box('.rv-stage .qc-grades'), cont: box('.rv-stage .qc-continue'), frame: box('.qc-stage iframe'),
      hint: box('.qc-hint'), btn: box('.qc-primary'), wide: document.querySelector('.rv-stage .qc').classList.contains('qc-wide') };
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
  await app.page.locator('.qc-primary').click();
  await app.page.locator('.qc-hint:not([hidden])').waitFor();
  await app.page.waitForTimeout(500);
  r = await reviewRects(app);
  for (const [k, part] of [['hint', r.hint], ['Check', r.btn]]) {
    for (const [n, target] of [['slider', r.range], ['readout', r.readout]]) assert(!overlaps(part, target), `the ${k} does not cover the ${n} ` + JSON.stringify({ part, target }));
  }
  await shot(app, 'review-laptop-target-stage');
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} layout tests passed`);
process.exit(failed.length ? 1 : 0);
