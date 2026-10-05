#!/usr/bin/env node
// Browser tests for the views: Learn (home), topic page, Map, Book, reading settings and boot.
// Builds a partial page with only these modules (plus core), fakes U.gen / U.review / U.tutor
// and the lesson route where they are absent, and checks behaviour at 360 and 1280 px in light
// and dark. Screenshots land in tests/out/views/. Exits non-zero on any failure.
// Usage: node tests/e2e/views.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, readJson, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'views.html');
const SHOTS = join(ROOT, 'tests', 'out', 'views');
const UID = 'u_stubuser0000000000000000';
const SEED = readJson('tests/fixtures/views-seed.json');
const FILTER = process.argv[2] || '';

const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--only', '70,71,72,73,74,99', '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
mkdirSync(SHOTS, { recursive: true });

// ---------- tiny runner ----------
const results = [];
let current = null;
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
async function test(name, fn) {
  if (FILTER && !name.includes(FILTER)) return;
  const t0 = Date.now();
  current = { name, apps: [] };
  try {
    await fn();
    for (const app of current.apps) assert(app.errors.length === 0, 'page errors:\n  ' + app.errors.join('\n  '));
    results.push({ name, ok: true, s: (Date.now() - t0) / 1000 });
    console.log(`ok    ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: e });
    console.log(`FAIL  ${name}\n      ${String(e && e.stack || e).split('\n').slice(0, 4).join('\n      ')}`);
  } finally {
    for (const app of current.apps) await app.close().catch(() => {});
  }
}

// ---------- fixtures ----------
function seedDb(opts = {}) {
  const db = {};
  const topics = opts.topics || Object.keys(SEED.topics);
  for (const tid of topics) db['topics/' + tid] = SEED.topics[tid];
  for (const [k, v] of Object.entries(SEED.research)) if (topics.includes(k.split('/')[0])) db['topics/' + k.replace('/', '/research/')] = v;
  for (const [tid, v] of Object.entries(SEED.progress)) if (topics.includes(tid)) db[`data/users/${UID}/profile/progress/${tid}`] = v;
  Object.assign(db, opts.extra || {});
  return db;
}

// Stand-ins for modules other engineers own, installed before the app script runs.
function installFakes({ review, tutor, gen, bands, due }) {
  window.U = window.U || {};
  window.__calls = { tutor: [], gen: [] };
  if (review) {
    U.review = {
      dueCount: async () => due,
      refreshBadge: () => { const b = document.getElementById('today-badge'); if (b) { b.hidden = !due; b.textContent = String(due); } },
      ideaBands: async () => bands,
    };
  }
  if (tutor) U.tutor = { open: (ctx) => { window.__calls.tutor.push({ tid: ctx.tid, title: ctx.topic && ctx.topic.title }); } };
  if (gen) {
    const planned = (query) => ({
      status: 'ready', title: 'How tides work', hook: 'Why does the sea rise twice a day?',
      oneBreath: 'The Moon stretches the oceans into two bulges and Earth turns under both.',
      ideas: [
        { id: 'i1', title: 'Gravity weakens with distance', oneLine: 'Pull drops quickly with distance.', deps: [], kind: 'quantity' },
        { id: 'i2', title: 'A difference in pull stretches Earth', oneLine: 'A stretch, not a lift.', deps: ['i1'], kind: 'mechanism' },
        { id: 'i3', title: 'Two bulges, not one', oneLine: 'The far side is pulled less.', deps: ['i2'], kind: 'mechanism' },
        { id: 'i4', title: 'Earth turns under the bulges', oneLine: 'Two high tides a day.', deps: ['i3'], kind: 'process' },
        { id: 'i5', title: 'Spring and neap tides', oneLine: 'Sun and Moon in line.', deps: ['i3'], kind: 'mechanism' },
      ],
      calibration: [{ id: 'c1', q: 'How many high tides do most coasts get in a day?', options: ['One', 'Two'], answer: 1, why: 'Two bulges.' }],
      research: { status: 'running' },
    });
    U.gen = {
      createTopic: async (query, opts) => {
        window.__calls.gen.push({ query, level: opts && opts.level });
        if (gen === 'fail') { await new Promise((r) => setTimeout(r, 300)); throw { code: 'rate_limited', message: 'busy' }; }
        const id = U.slug(query) + '-' + Math.random().toString(36).slice(2, 6);
        await U.store.topic.create({ id, title: '', query, createdAt: U.now(), updatedAt: U.now(), status: 'planning', level: (opts && opts.level) || 'new', hue: U.hash(query) % 360, ideas: [], research: { status: 'none' } });
        if (opts && opts.onCreated) opts.onCreated(id);
        const flip = () => U.store.topic.update(id, planned(query));
        if (gen === 'slow') { await new Promise((r) => setTimeout(r, 1800)); await flip(); return id; }
        setTimeout(flip, window.__PLAN_MS || 2500);
        return id;
      },
    };
  }
}

// TEMPORARY: the shell's .topbar has backdrop-filter, which makes it the containing block for the
// fixed #tabs inside it, so on phones the tab bar covers the top bar (reported to the shell owner).
// Screenshots neutralise it so they show the views as intended; the check below reports it.
const SHELL_SHIM = '.topbar{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background:var(--bg)!important}';

async function open({ width = 360, dark = false, db = {}, fakes = {}, tools = {}, deny = [], hash = '#/', prefs = null, shim = true } = {}) {
  const app = await openApp({ width, height: width < 700 ? 707 : 900, dark, file: FILE, config: { db }, tools, deny });
  current.apps.push(app);
  await app.page.addInitScript(installFakes, { review: true, tutor: true, gen: 'fast', bands: SEED.bands, due: 4, ...fakes });
  const p = prefs || (dark ? { theme: 'dark' } : null);
  if (p) await app.page.addInitScript((v) => { try { if (!sessionStorage.getItem('__prefsSet')) { localStorage.setItem('mu-prefs', JSON.stringify(v)); sessionStorage.setItem('__prefsSet', '1'); } } catch (e) {} }, p);
  if (shim) await app.page.addInitScript((css) => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }); }, SHELL_SHIM);
  await app.page.goto(app.url(hash));
  await app.page.waitForFunction(() => window.U && U.boot && U.boot.ready === true);
  // A stand-in lesson screen and Today screen so navigation can be checked.
  await app.page.evaluate(() => {
    if (!U.routes.list.some((r) => r.re.test('#/t/a/b'))) U.routes.add('#/t/:tid/:iid', (p, ctx) => { ctx.view.appendChild(U.h('h1', { id: 'fake-lesson' }, 'Lesson ' + p.iid)); }, { tab: 'learn', focus: true });
    if (!U.routes.list.some((r) => r.re.test('#/today'))) U.routes.add('#/today', (p, ctx) => { ctx.view.appendChild(U.h('h1', { id: 'fake-today' }, 'Today')); }, { tab: 'today' });
  });
  return app;
}

async function shot(app, name, { full = true } = {}) {
  await app.page.waitForTimeout(250);
  const { scrollWidth, innerWidth } = await app.page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  assert(scrollWidth <= innerWidth, `${name}: page scrolls sideways (${scrollWidth} > ${innerWidth})`);
  await app.page.screenshot({ path: join(SHOTS, name + '.png'), fullPage: full, animations: 'disabled' });
}
const text = (app, sel) => app.page.locator(sel).first().innerText();
const count = (app, sel) => app.page.locator(sel).count();
const hash = (app) => app.page.evaluate(() => location.hash);
const doc = (app, path) => app.page.evaluate((p) => window.__CLAUDE_STUB__.get(p), path);
const WIDTHS = [[360, false], [360, true], [1280, false], [1280, true]];
const tag = (w, dark) => `${w}-${dark ? 'dark' : 'light'}`;

// ---------- tests ----------

await test('shell: phone tab bar sits at the bottom (reported, not owned here)', async () => {
  const app = await open({ shim: false });
  const r = await app.page.evaluate(() => { const t = document.getElementById('tabs').getBoundingClientRect(); return { top: t.top, vh: innerHeight }; });
  if (r.top < r.vh / 2) console.log('      NOTE: #tabs renders at the top of the screen on phones (top bar backdrop-filter). Shell fix needed.');
});

await test('home: first run at 360 and 1280, light and dark', async () => {
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, fakes: { due: 0 } });
    await app.page.waitForSelector('.welcome');
    eq(await text(app, '.ask h1'), 'What do you want to learn?', 'heading');
    eq(await count(app, '.ask-levels [role=radio]'), 3, 'three levels');
    eq(await app.page.getAttribute('.ask-levels [data-level=new]', 'aria-checked'), 'true', 'New is the default level');
    eq(await count(app, '.ccard'), 0, 'no continue card on first run');
    eq(await count(app, '.today-row'), 0, 'no Today row when nothing is due');
    eq(await app.page.getAttribute('html', 'data-mu-theme'), dark ? 'dark' : 'light', 'theme');
    await shot(app, `home-first-${tag(w, dark)}`);
  }
});

await test('home: example chips fill the input; level chips switch', async () => {
  const app = await open();
  await app.page.click('.chip-soft >> text=How index funds work');
  eq(await app.page.inputValue('#ask-input'), 'How index funds work', 'example fills the input');
  await app.page.click('.ask-levels [data-level=solid]');
  eq(await app.page.getAttribute('.ask-levels [data-level=solid]', 'aria-checked'), 'true', 'level picked');
  eq(await app.page.getAttribute('.ask-levels [data-level=new]', 'aria-checked'), 'false', 'other level cleared');
  // An empty submit does nothing but nudge.
  await app.page.fill('#ask-input', '   ');
  await app.page.press('#ask-input', 'Enter');
  eq(await hash(app), '#/', 'empty query stays home');
});

await test('home: typing a topic shows planning, then the plan arrives', async () => {
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark });
    await app.page.evaluate(() => { window.__PLAN_MS = 2200; });
    await app.page.fill('#ask-input', 'How tides work');
    await app.page.click('.ask-levels [data-level=some]');
    await app.page.press('#ask-input', 'Enter');
    await app.page.waitForSelector('.tp-planning');
    assert((await hash(app)).startsWith('#/t/how-tides-work-'), 'navigated to the new topic');
    eq(await text(app, '.tp-title'), 'How tides work', 'query is the title while planning');
    assert((await text(app, '.tp-wait-line')).length > 10, 'a waiting line shows');
    const calls = await app.page.evaluate(() => window.__calls.gen);
    eq(calls[0].level, 'some', 'level passed to createTopic');
    await shot(app, `topic-planning-${tag(w, dark)}`);
    await app.page.waitForSelector('.path', { timeout: 6000 });
    eq(await count(app, '.pnode'), 5, 'five ideas once ready');
    eq(await text(app, '.pnode.is-current .pnode-btn'), 'Start here', 'first idea says Start here');
    // Back home the topic shows as a card and as the Continue card.
    await app.page.click('.backlink');
    await app.page.waitForSelector('.ccard');
    eq((await text(app, '.ccard .eyebrow')).toLowerCase(), 'ready when you are', 'not started yet');
  }
});

await test('home: createTopic that resolves after planning opens the topic as soon as it exists', async () => {
  const app = await open({ fakes: { gen: 'slow' } });
  await app.page.fill('#ask-input', 'Why the sky is blue');
  await app.page.click('.ask-go');
  await app.page.waitForSelector('.tp-planning', { timeout: 1500 });
  await app.page.waitForSelector('.path', { timeout: 5000 });
});

await test('home: a failed createTopic explains and re-enables', async () => {
  const app = await open({ fakes: { gen: 'fail' } });
  await app.page.fill('#ask-input', 'Black holes');
  await app.page.click('.ask-go');
  await app.page.waitForSelector('.toast.bad');
  assert((await text(app, '.toast.bad')).includes('Claude is busy'), 'plain-words error');
  await app.page.waitForFunction(() => !document.querySelector('#ask-input').disabled);
});

await test('home: continue card, Today row and topic cards', async () => {
  const planning = { id: 'black-holes-zz', title: '', query: 'How black holes form', createdAt: '2026-10-05T09:00:00.000Z', updatedAt: '2026-10-05T09:00:00.000Z', status: 'planning', hue: 250, ideas: [] };
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, db: seedDb({ extra: { 'topics/black-holes-zz': planning } }) });
    await app.page.waitForSelector('.ccard');
    eq(await text(app, '.ccard-title'), 'How tides work', 'most recently touched topic');
    assert((await text(app, '.ccard-next')).includes('Idea 3 of 6'), 'next idea shown');
    eq(await app.page.getAttribute('.ccard', 'href'), '#/t/how-tides-work-ab12/i3', 'continue opens the lesson');
    assert((await text(app, '.today-row')).includes('4 reviews ready'), 'Today row');
    eq(await count(app, '.tcard'), 4, 'four topic cards');
    eq(await count(app, '.tcard.is-planning'), 1, 'planning card');
    assert((await text(app, '.tcard.is-done')).includes('All 5 ideas done'), 'finished topic');
    eq(await app.page.locator('.tcard .src-badge:not(.is-quiet)').count(), 1, 'one Sources checked badge');
    await shot(app, `home-topics-${tag(w, dark)}`);
    if (w === 360 && !dark) {
      // Returning on a phone: a compact ask; the level choice appears once Dan starts typing.
      eq(await app.page.locator('.ask-level-row').isVisible(), false, 'levels tucked away');
      eq(await app.page.locator('.ask-try').isVisible(), false, 'examples tucked away');
      await app.page.fill('#ask-input', 'Black holes');
      eq(await app.page.locator('.ask-level-row').isVisible(), true, 'levels shown while typing');
      await app.page.fill('#ask-input', '');
      // Covers are deterministic: the same topic draws the same picture every render.
      const a = await app.page.evaluate(() => U.views.cover({ title: 'How tides work', hue: 196 }).outerHTML);
      const b = await app.page.evaluate(() => U.views.cover({ title: 'How tides work', hue: 196 }).outerHTML);
      eq(a, b, 'cover is deterministic');
      await app.page.click('.today-row');
      await app.page.waitForSelector('#fake-today');
    }
  }
});

await test('home: topic cards update live', async () => {
  const app = await open({ db: seedDb({ topics: ['index-funds-cd34'] }) });
  await app.page.waitForSelector('.tcard');
  await app.seed('topics/new-one-aa', { id: 'new-one-aa', title: '', query: 'The fall of Rome', createdAt: '2026-10-05T10:00:00.000Z', updatedAt: '2026-10-05T10:00:00.000Z', status: 'planning', hue: 20, ideas: [] });
  await app.page.waitForSelector('.tcard.is-planning');
  assert((await text(app, '.tcard.is-planning')).includes('The fall of Rome'), 'planning card shows the query');
});

await test('topic: ready page with warm-up, path and library', async () => {
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/t/how-tides-work-ab12' });
    await app.page.waitForSelector('.path');
    await app.page.waitForSelector('.src');
    eq(await text(app, '.tp-title'), 'How tides work', 'title');
    assert((await text(app, '.tp-hook')).startsWith('Why does the sea rise twice'), 'hook');
    assert((await text(app, '.tp-breath')).includes('two bulges'), 'in one breath');
    eq(await count(app, '.pnode'), 6, 'six ideas');
    eq(await count(app, '.pnode.is-done'), 2, 'two done');
    eq(await text(app, '.pnode.is-current .pnode-title'), 'Two bulges, not one', 'current is the last idea touched');
    eq(await text(app, '.pnode.is-current .pnode-btn'), 'Continue', 'Continue on a started idea');
    assert((await text(app, '.pnode:nth-child(5)')).includes('You may already know this'), 'known idea');
    assert((await text(app, '.pnode:nth-child(6) .pnode-deps')).includes('“Earth turns under the bulges” and “Spring and neap tides”'), 'deps as words');
    assert((await text(app, '.lib-status')).includes('Sources checked · 4 sources'), 'research status');
    eq(await count(app, '.src'), 4, 'four sources');
    assert((await text(app, '.lib-group-h')).includes('Spring and neap tides'), 'per-idea sources');
    eq(await count(app, '.tp-warm, .tp-warm-again'), 0, 'no warm-up once Dan has started');
    eq(await count(app, '.pnode:nth-child(3) .pnode-deps'), 0, 'no deps text when it is just the idea before');
    await shot(app, `topic-ready-${tag(w, dark)}`);
  }
});

await test('topic: warm-up saves answers and never blocks the path', async () => {
  const app = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56' });
  await app.page.waitForSelector('.tp-warm');
  assert((await text(app, '.tp-warm')).toLowerCase().includes('warm-up · 1 of 2'), 'warm-up shows');
  eq(await count(app, '.pnode.is-current'), 1, 'path is open while the warm-up waits');
  await app.page.click('.tp-warm .option >> text=The middle note');
  await app.page.waitForSelector('.tp-warm-why');
  eq(await text(app, '.tp-warm-verdict'), 'Right.', 'right answer');
  await app.page.click('.tp-warm-why .btn');
  await app.page.click('.tp-warm .option >> text=Yes, always');
  assert((await text(app, '.tp-warm-verdict')).startsWith('Not quite'), 'wrong answer named kindly');
  await shot(app, 'topic-warmup-reveal-360-light');
  await app.page.click('.tp-warm-why .btn');
  await app.page.waitForSelector('.tp-warm-done');
  assert((await text(app, '.tp-warm-done')).includes('1 of 2 right'), 'summary');
  await app.page.waitForTimeout(300);
  const p = await doc(app, `data/users/${UID}/profile/progress/minor-keys-ef56`);
  eq(p.calibration.c1, 1, 'c1 saved');
  eq(p.calibration.c2, 0, 'c2 saved');
});

await test('topic: skip the warm-up; ask Claude; open an idea', async () => {
  const app = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56' });
  await app.page.waitForSelector('.tp-warm');
  await app.page.click('.tp-skip');
  await app.page.waitForSelector('.tp-warm-again');
  await app.page.waitForTimeout(300);
  eq((await doc(app, `data/users/${UID}/profile/progress/minor-keys-ef56`)).calibrationSkipped, true, 'skip remembered');
  await app.page.goto(app.url('#/t/how-tides-work-ab12'));
  await app.page.waitForSelector('.pnode.is-current');
  await app.page.click('.tp-ask');
  const calls = await app.page.evaluate(() => window.__calls.tutor);
  eq(calls[0] && calls[0].tid, 'how-tides-work-ab12', 'tutor opened with the topic');
  await app.page.click('.pnode.is-current .pnode-link');
  await app.page.waitForSelector('#fake-lesson');
  eq(await hash(app), '#/t/how-tides-work-ab12/i3', 'idea opens the lesson');
});

await test('topic: research states and no tutor module', async () => {
  const app = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56', fakes: { tutor: false } });
  await app.page.waitForSelector('.path');
  assert((await text(app, '.lib-status')).includes('Checking sources…'), 'running');
  eq(await count(app, '.tp-ask'), 0, 'no Ask button without the tutor');
  await shot(app, 'topic-unstarted-360-light');
  await app.page.goto(app.url('#/t/index-funds-cd34'));
  await app.page.waitForSelector('.path');
  await app.page.waitForFunction(() => /Connect Parallel Search/.test(document.querySelector('.lib-status').textContent));
  assert((await text(app, '.tp-progress')).includes('All 5 ideas done'), 'complete topic');
  await shot(app, 'topic-complete-360-light');
});

await test('topic: failed planning offers Try again (recreates with the same query)', async () => {
  const failed = { id: 'jazz-xx', title: '', query: 'How jazz chords work', createdAt: '2026-10-05T09:00:00.000Z', updatedAt: '2026-10-05T09:00:00.000Z', status: 'failed', error: 'Claude could not be reached.', hue: 140, ideas: [], level: 'some' };
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db: { 'topics/jazz-xx': failed }, hash: '#/t/jazz-xx' });
    await app.page.waitForSelector('.tp-failed');
    assert((await text(app, '.tp-failed .notice')).includes('Claude could not be reached.'), 'error in plain words');
    await shot(app, `topic-failed-${tag(w, dark)}`);
    await app.page.evaluate(() => { window.__PLAN_MS = 300; });
    await app.page.click('.tp-failed .btn >> text=Try again');
    await app.page.waitForFunction(() => location.hash.startsWith('#/t/how-jazz-chords-work-'));
    const calls = await app.page.evaluate(() => window.__calls.gen);
    eq(calls[0].query, 'How jazz chords work', 'same query');
    eq(calls[0].level, 'some', 'same level');
    await app.page.waitForTimeout(300);
    eq(await doc(app, 'topics/jazz-xx'), undefined, 'failed topic removed');
  }
});

await test('topic: delete asks first, then removes everything', async () => {
  const app = await open({ db: seedDb(), hash: '#/t/index-funds-cd34' });
  await app.page.waitForSelector('.path');
  await app.page.click('.tp-delete');
  await app.page.waitForSelector('.sheet');
  await shot(app, 'topic-delete-confirm-360-light', { full: false });
  await app.page.click('.sheet .btn >> text=Cancel');
  assert(await doc(app, 'topics/index-funds-cd34'), 'cancel keeps it');
  await app.page.click('.tp-delete');
  await app.page.click('.sheet .btn.danger');
  await app.page.waitForFunction(() => location.hash === '#/');
  await app.page.waitForTimeout(200);
  eq(await doc(app, 'topics/index-funds-cd34'), undefined, 'topic gone');
  eq(await doc(app, `data/users/${UID}/profile/progress/index-funds-cd34`), undefined, 'progress gone');
});

await test('topic: missing topic', async () => {
  const app = await open({ hash: '#/t/nope' });
  await app.page.waitForSelector('.v-empty');
  assert((await text(app, '.v-empty h2')).includes('not here'), 'gone state');
});

await test('map: constellations by strength band', async () => {
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/map' });
    await app.page.waitForSelector('.map-svg');
    eq(await count(app, '.map-topic'), 3, 'three topics');
    eq(await count(app, '.map-legend-item'), 4, 'legend in words');
    eq(await app.page.locator('a[href="#/t/how-tides-work-ab12/i1"] .map-dot').getAttribute('class'), 'map-dot is-strong', 'band from review');
    eq(await app.page.locator('a[href="#/t/how-tides-work-ab12/i2"] .map-dot').getAttribute('class'), 'map-dot is-fragile', 'fragile');
    eq(await app.page.locator('a[href="#/t/how-tides-work-ab12/i3"] .map-dot').getAttribute('class'), 'map-dot is-new', 'new');
    // Labels fit inside the drawing and do not overlap their neighbours.
    const bad = await app.page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.map-svg').forEach((svg) => {
        const sb = svg.getBoundingClientRect();
        const boxes = [...svg.querySelectorAll('.map-label')].map((t) => t.getBoundingClientRect());
        boxes.forEach((b, i) => {
          if (b.left < sb.left - 1 || b.right > sb.right + 1) out.push('label outside ' + i);
          boxes.forEach((c, j) => { if (j > i && b.left < c.right - 1 && c.left < b.right - 1 && b.top < c.bottom - 1 && c.top < b.bottom - 1) out.push(`labels ${i} and ${j} overlap`); });
          if (parseFloat(getComputedStyle(svg.querySelector('.map-label')).fontSize) < 13) out.push('label too small');
        });
      });
      return out;
    });
    eq(bad.join('; '), '', 'labels readable');
    await shot(app, `map-${tag(w, dark)}`);
    if (w === 360 && !dark) {
      await app.page.click('a[href="#/t/how-tides-work-ab12/i2"]');
      await app.page.waitForSelector('#fake-lesson');
    }
  }
});

await test('map: bands from progress when the review module is absent; resizes', async () => {
  const app = await open({ width: 1280, db: seedDb(), hash: '#/map', fakes: { review: false } });
  await app.page.waitForSelector('.map-svg');
  eq(await app.page.locator('a[href="#/t/how-tides-work-ab12/i1"] .map-dot').getAttribute('class'), 'map-dot is-growing', 'done -> growing');
  eq(await app.page.locator('a[href="#/t/how-tides-work-ab12/i3"] .map-dot').getAttribute('class'), 'map-dot is-new', 'not done -> new');
  await app.page.setViewportSize({ width: 360, height: 707 });
  await app.page.waitForFunction(() => Number(document.querySelector('.map-svg').getAttribute('width')) < 340);
});

await test('map: empty state', async () => {
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, hash: '#/map' });
    await app.page.waitForSelector('.v-empty');
    assert((await text(app, '.v-empty h2')).includes('empty'), 'empty map');
    await shot(app, `map-empty-${tag(w, dark)}`);
  }
});

await test('book: first and latest explanations, and export', async () => {
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/book' });
    await app.page.waitForSelector('.book-entry');
    eq(await count(app, '.book-topic'), 2, 'two topics with explanations');
    eq(await count(app, '.book-entry'), 3, 'three ideas explained');
    const first = app.page.locator('.book-entry').first();
    assert((await first.innerText()).includes('Things pull on each other less'), 'first words');
    assert((await first.innerText()).includes('Gravity falls with the square of distance'), 'latest words');
    eq(await first.locator('.book-words').count(), 2, 'first and latest');
    eq(await count(app, '.book-q'), 2, 'questions Dan asked');
    eq(await text(app, '.book-q'), 'Does the Sun make tides too?', 'newest question first');
    await shot(app, `book-${tag(w, dark)}`);
    if (w === 360 && !dark) {
      await app.page.click('.book-actions .btn >> text=Save as Markdown');
      await app.page.click('.book-actions .btn >> text=Save as JSON');
      await app.page.waitForTimeout(200);
      const dl = (await app.calls()).filter((c) => c.kind === 'download').map((c) => c.filename);
      assert(/^my-book-\d{4}-\d{2}-\d{2}\.md$/.test(dl[0]), 'markdown file ' + dl[0]);
      assert(/^my-book-\d{4}-\d{2}-\d{2}\.json$/.test(dl[1]), 'json file ' + dl[1]);
      const md = await app.page.evaluate(async () => U.book.toMarkdown(U.book.collect(await U.store.topics.list(), await U.store.progress.all())));
      assert(md.includes('## How tides work') && md.includes('### Gravity weakens with distance') && md.includes('> Gravity falls'), 'markdown content');
      assert(md.includes('### Questions I asked') && md.includes('- Does the Sun make tides too?'), 'markdown questions');
    }
  }
});

await test('book: empty state', async () => {
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db: seedDb({ topics: ['minor-keys-ef56'] }), hash: '#/book' });
    await app.page.waitForSelector('.v-empty');
    eq(await app.page.locator('.book-actions').isVisible(), false, 'no export when empty');
    await shot(app, `book-empty-${tag(w, dark)}`);
  }
});

await test('settings: changes apply at once, save, and survive a reload', async () => {
  const app = await open({ db: seedDb() });
  await app.page.click('#settings-btn');
  await app.page.waitForSelector('.set');
  assert((await text(app, '.sheet-head h2')) === 'Reading settings', 'sheet title');
  await app.page.waitForFunction(() => /Not connected/.test(document.querySelector('.set-research').textContent));
  await shot(app, 'settings-360-light', { full: false });
  await app.page.evaluate(() => { const s = document.querySelector('.sheet'); s.scrollTop = s.scrollHeight; });
  await shot(app, 'settings-360-light-end', { full: false });
  await app.page.evaluate(() => { document.querySelector('.sheet').scrollTop = 0; });
  await app.page.click('.set .seg-btn >> text=Dark');
  eq(await app.page.getAttribute('html', 'data-mu-theme'), 'dark', 'dark applied');
  await app.page.click('.set .seg-btn[aria-label="Extra large text"]');
  eq(await app.page.getAttribute('html', 'data-size'), 'xl', 'size applied');
  await app.page.click('.set-switch:has(input[name=easy])');
  eq(await app.page.getAttribute('html', 'data-easy'), '1', 'easier reading applied');
  await app.page.click('.set .seg-btn >> text=20');
  await app.page.click('.set-switch:has(input[name=light])');
  await shot(app, 'settings-360-dark-xl', { full: false });
  await app.page.waitForTimeout(400);
  const prof = await doc(app, `data/users/${UID}/profile`);
  eq(JSON.stringify(prof.prefs), JSON.stringify({ theme: 'dark', size: 'xl', easy: true, cap: 20, light: true }), 'saved to the profile');
  const local = await app.page.evaluate(() => JSON.parse(localStorage.getItem('mu-prefs')));
  eq(local.theme + local.size + local.easy, 'darkxltrue', 'mirrored to localStorage');
  // Backup holds everything.
  await app.page.click('.set .btn >> text=Save a backup');
  await app.page.waitForSelector('.toast.good');
  const dl = (await app.calls()).filter((c) => c.kind === 'download').map((c) => c.filename);
  assert(/^my-university-backup-\d{4}-\d{2}-\d{2}\.json$/.test(dl[0]), 'backup file ' + dl[0]);
  const b = await app.page.evaluate(() => U.settings.backup());
  eq(b.topics.length, 3, 'backup topics');
  assert(b.research['how-tides-work-ab12'].topic.sources.length === 3, 'backup research');
  assert(b.progress['how-tides-work-ab12'].ideas.i1.stage === 'done', 'backup progress');
  assert(b.profile.prefs.theme === 'dark' && 'cards' in b && 'lessons' in b, 'backup profile, cards, lessons');
  assert((await text(app, '.set-build')).startsWith('Build 20'), 'build id');
  // A route change closes the sheet; the button opens it again.
  await app.page.evaluate(() => U.go('#/map'));
  await app.page.waitForSelector('.map');
  await app.page.click('#settings-btn');
  await app.page.waitForSelector('.set');
  // Reload: the stub db starts empty, so prefs come back from localStorage (first paint) and
  // are adopted into the new profile.
  await app.page.keyboard.press('Escape');
  await app.page.reload();
  await app.page.waitForFunction(() => window.U && U.boot && U.boot.ready === true);
  eq(await app.page.getAttribute('html', 'data-mu-theme'), 'dark', 'dark kept after reload');
  eq(await app.page.getAttribute('html', 'data-size'), 'xl', 'size kept after reload');
  eq(await app.page.getAttribute('html', 'data-easy'), '1', 'easy kept after reload');
  await app.page.waitForTimeout(400);
  eq((await doc(app, `data/users/${UID}/profile`)).prefs.theme, 'dark', 'adopted into the profile');
  await app.page.waitForSelector('.tcard, .welcome');
  await shot(app, 'home-after-reload-360-dark-xl');
});

await test('settings: wide and dark, research connected, match system', async () => {
  const app = await open({ width: 1280, dark: true, tools: { 'Parallel Search': { web_search: () => ({ results: [] }), web_fetch: () => ({}) } } });
  await app.page.click('#settings-btn');
  await app.page.waitForFunction(() => /Connected/.test(document.querySelector('.set-research').textContent));
  await shot(app, 'settings-1280-dark', { full: false });
  await app.page.evaluate(() => U.settings.open());
  eq(await count(app, '.sheet'), 1, 'opening twice does not stack sheets');
  await app.page.click('.set .seg-btn >> text=Match system');
  eq(await app.page.getAttribute('html', 'data-mu-theme'), 'system', 'system applied');
  const bg = await app.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  eq(bg, 'rgb(18, 22, 28)', 'system follows the dark device');
});

await test('settings: db prefs win over this device, and apply live from another device', async () => {
  const app = await open({ db: { [`data/users/${UID}/profile`]: { prefs: { theme: 'dark', size: 'l', easy: false, cap: 15, light: false }, days: {} } }, prefs: { theme: 'light', size: 's' } });
  eq(await app.page.getAttribute('html', 'data-mu-theme'), 'dark', 'profile theme applied at boot');
  eq(await app.page.getAttribute('html', 'data-size'), 'l', 'profile size applied at boot');
  await app.seed(`data/users/${UID}/profile`, { prefs: { theme: 'light', size: 'm', easy: true, cap: 15, light: false }, days: {} });
  await app.page.waitForFunction(() => document.documentElement.getAttribute('data-mu-theme') === 'light' && document.documentElement.getAttribute('data-easy') === '1');
});

await test('boot: notice when progress cannot be kept; dismiss sticks for the session', async () => {
  const app = await open({ deny: ['db'] });
  await app.page.waitForSelector('#persist-notice');
  eq(await text(app, '#persist-notice'), 'Open this in the Claude app to keep your progress.', 'notice text');
  await shot(app, 'boot-notice-360-light');
  await app.page.click('.boot-notice-x');
  eq(await count(app, '#persist-notice'), 0, 'dismissed');
  await app.page.reload();
  await app.page.waitForFunction(() => window.U && U.boot && U.boot.ready === true);
  eq(await count(app, '#persist-notice'), 0, 'stays dismissed');
  const app2 = await open({});
  eq(await count(app2, '#persist-notice'), 0, 'no notice with the db');
});

await test('boot: study minutes count only while in use', async () => {
  const app = await open({});
  const days = await app.page.evaluate(async () => {
    const s = U.boot.study, t0 = Date.now();
    s.active = 0; s.lastTick = t0; s.lastInput = t0;
    for (let i = 1; i <= 8; i++) { s.lastInput = t0 + i * 15000 - 1000; s.tick(t0 + i * 15000); } // 2 active minutes
    s.lastInput = t0; // then idle for 10 minutes
    for (let i = 9; i <= 48; i++) s.tick(t0 + i * 15000);
    await new Promise((r) => setTimeout(r, 400));
    return (await U.store.profile.get()).days;
  });
  eq(days[await app.page.evaluate(() => U.today())], 2, 'two minutes logged, idle time ignored');
});

// ---------- summary ----------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed. Screenshots: tests/out/views/`);
process.exit(failed.length ? 1 : 0);
