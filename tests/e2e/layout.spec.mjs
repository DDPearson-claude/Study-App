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

// The aim beside Check repeats the goal sentence: on a laptop it shows only while the goal's
// number is off the screen, never beside it, and never leaves Dan without the number. A phone
// keeps it under the interactive, above Check.
for (const [w, h, size] of [[1366, 768, 'm'], [1366, 768, 'xl'], [960, 700, 'xl']]) {
  await test(`laptop review ${w}x${h} at ${size}: the target card's aim never shows beside its goal sentence`, async () => {
    const app = await openReview(w, h, { card: 'i1_c4', size });
    await app.page.waitForFunction(() => !document.querySelector('.qc-primary').disabled, null, { timeout: 15000 });
    await app.page.waitForTimeout(800);
    const seen = (r) => onScreen(r.num, r) && r.goal.bottom <= r.vh + 1;
    const frames = () => app.page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
    let r = await reviewRects(app);
    assert(seen(r) && !r.aim, 'with the goal sentence on screen the aim is not shown ' + JSON.stringify({ goal: r.goal, aim: r.aim }));
    // Every 15 px down to well past the goal, through the band where its first line is under the bar.
    for (let y = 15; y <= 420; y += 15) {
      await app.page.evaluate((v) => window.scrollTo(0, v), y);
      await frames();
      r = await reviewRects(app);
      assert(!(seen(r) && r.aim) && (seen(r) || onScreen(r.aim, r)), `scrolled to ${y} px, the instruction shows once ` + JSON.stringify({ num: r.num, goal: r.goal, aim: r.aim, bar: r.bar.bottom }));
    }
    assert(!seen(r) && onScreen(r.aim, r) && r.aim.bottom <= r.btn.top, 'with the goal sentence gone, the aim shows above Check ' + JSON.stringify({ aim: r.aim, btn: r.btn }));
    await shot(app, `review-laptop-target-${w}-${size}-aim`);
    await app.page.evaluate(() => window.scrollTo(0, 0));
    await app.page.waitForTimeout(250);
    r = await reviewRects(app);
    assert(seen(r) && !r.aim, 'back at the top the aim goes again ' + JSON.stringify({ goal: r.goal, aim: r.aim }));
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

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} layout tests passed`);
process.exit(failed.length ? 1 : 0);
