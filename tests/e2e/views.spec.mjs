#!/usr/bin/env node
// Browser tests for the views: the Library (home), topic page, Map and Book, reading settings and boot.
// (Learn, the old home with its ask box and intake, is unhooked since 18 Oct: its tests went with it.)
// Builds a partial page with only these modules (plus core), fakes U.gen / U.review / U.tutor
// and the lesson route where they are absent, and checks behaviour at 360 and 1280 px in light
// and dark. Version 9: the topic page's mode switch and "What you told me", and ideas
// only read shown as "Read" on the path and the Map.
// Screenshots land in tests/out/views/. Exits non-zero on any failure.
// Usage: node tests/e2e/views.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, readJson, taskOf, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'views.html');
const SHOTS = join(ROOT, 'tests', 'out', 'views');
const UID = 'u_stubuser0000000000000000';
const SEED = readJson('tests/fixtures/views-seed.json');
const FILTER = process.argv[2] || '';

const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--only', '70,71,72,73,74,75,76,77,99', '--out', FILE], { stdio: 'inherit' });
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
// The Library's one shelf: tides built (a ready-made course), two not built yet.
const SHELF = { v: 1, title: 'Maths', order: 1, blurb: 'Every area of maths in one place.', folders: [
  { id: 'foundations', title: 'Foundational maths', blurb: 'The building blocks.', courses: [
    { id: 'tides', title: 'How tides work', blurb: 'Why the sea rises twice a day.', tid: 'how-tides-work-ab12' },
    { id: 'negative-numbers', title: 'Negative numbers', blurb: 'Numbers below zero.', tid: null }] },
  { id: 'algebra', title: 'Algebra', blurb: 'Patterns and rules.', courses: [{ id: 'visual-algebra', title: 'Visual algebra', blurb: 'Spot the rule.', tid: null }] }] };
function seedDb(opts = {}) {
  const db = { 'shelves/maths': SHELF };
  const topics = opts.topics || Object.keys(SEED.topics);
  for (const tid of topics) db['topics/' + tid] = SEED.topics[tid];
  for (const [k, v] of Object.entries(SEED.research)) if (topics.includes(k.split('/')[0])) db['topics/' + k.replace('/', '/research/')] = v;
  for (const [tid, v] of Object.entries(SEED.progress)) if (topics.includes(tid)) db[`data/users/${UID}/profile/progress/${tid}`] = v;
  Object.assign(db, opts.extra || {});
  return db;
}

// Stand-ins for modules other engineers own, installed before the app script runs.
function installFakes({ review, tutor, gen, bands, due, minutes, intake }) {
  window.U = window.U || {};
  window.__calls = { tutor: [], gen: [] };
  if (review) {
    U.review = {
      dueCount: async () => due,
      // Today's own estimate for the session, when a test gives one (the real one: 60-today.js).
      outlook: minutes == null ? undefined : async () => ({ size: due, minutes }),
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
        window.__calls.gen.push({ query, level: opts && opts.level, mode: opts && opts.mode, intake: opts && 'intake' in opts ? JSON.parse(JSON.stringify(opts.intake)) : undefined });
        if (gen === 'fail') { await new Promise((r) => setTimeout(r, 300)); throw { code: 'rate_limited', message: 'busy' }; }
        const id = U.slug(query) + '-' + Math.random().toString(36).slice(2, 6);
        await U.store.topic.create({ id, title: '', query, createdAt: U.now(), updatedAt: U.now(), status: 'planning', level: (opts && opts.level) || 'new', mode: (opts && opts.mode) || 'study', intake: (opts && opts.intake) || null, hue: U.hash(query) % 360, ideas: [], research: { status: 'none' } });
        if (opts && opts.onCreated) opts.onCreated(id);
        const flip = () => U.store.topic.update(id, planned(query));
        if (gen === 'slow') { await new Promise((r) => setTimeout(r, 1800)); await flip(); return id; }
        setTimeout(flip, window.__PLAN_MS || 2500);
        return id;
      },
    };
    // The intake (v9 contract: U.gen.intake(query, {level, mode}) -> {questions}): 'ok' answers with
    // two questions (one pick-one with "Something else", one pick-any); 'fail' rejects as U.ask does;
    // 'slow' never answers; 'none' has no questions. No intake (undefined): this view has none.
    if (intake) {
      U.gen.intake = (query, opts) => {
        window.__calls.gen.push({ intake: query, level: opts && opts.level, mode: opts && opts.mode });
        if (intake === 'fail') return new Promise((res, rej) => setTimeout(() => rej({ code: 'unavailable', message: 'offline' }), 300));
        if (intake === 'slow') return new Promise(() => {});
        if (intake === 'none') return new Promise((res) => setTimeout(() => res({ questions: [] }), 200));
        return new Promise((res) => setTimeout(() => res({ questions: [
          { id: 'q1', q: 'What do you want to be able to do with this?', options: ['Explain it to my kids', 'Predict the tide times', 'Just understand it'], multi: false, other: true },
          { id: 'q2', q: 'Which parts interest you most?', options: ['The Moon\'s pull', 'Spring and neap tides', 'Why there are two a day'], multi: true, other: false },
        ] }), 400));
      };
    }
    U.gen.research = async (tid) => { window.__calls.gen.push({ research: tid }); await U.store.topic.update(tid, { research: { status: 'running', at: U.now(), sources: 0 } }); return null; };
    if (gen === 'replan') {
      U.gen.replan = async (tid) => {
        window.__calls.gen.push({ replan: tid });
        await U.store.topic.update(tid, { status: 'planning', error: null });
        await new Promise((r) => setTimeout(r, 600));
        await U.store.topic.update(tid, planned(''));
        return tid;
      };
    }
  }
}

async function open({ width = 360, dark = false, db = {}, fakes = {}, tools = {}, deny = [], hash = '#/', prefs = null, init = null } = {}) {
  const app = await openApp({ width, height: width < 700 ? 707 : 900, dark, file: FILE, config: { db }, tools, deny });
  current.apps.push(app);
  await app.page.addInitScript(installFakes, { review: true, tutor: true, gen: 'fast', bands: SEED.bands, due: 4, ...fakes });
  for (const f of [].concat(init || [])) await app.page.addInitScript(f);   // in order
  const p = prefs || (dark ? { theme: 'dark' } : null);
  if (p) await app.page.addInitScript((v) => { try { if (!sessionStorage.getItem('__prefsSet')) { localStorage.setItem('mu-prefs', JSON.stringify(v)); sessionStorage.setItem('__prefsSet', '1'); } } catch (e) {} }, p);
  await app.page.goto(app.url(hash));
  await app.booted();
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

await test('home: the Library opens on its shelves, under three tabs: Library, Today, Book', async () => {
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, db: seedDb() });
    await app.page.waitForSelector('.lib-home .shelf-card');
    eq(await text(app, '.lib-home h1'), 'Your library', 'the heading');
    eq((await app.page.locator('#tabs .tab').allInnerTexts()).map((t) => t.trim()).join('|'), 'Library|Today|Book', 'three tabs');
    eq(await app.page.getAttribute('#tabs .tab[data-tab="library"]', 'aria-current'), 'page', 'Library is current');
    eq(await count(app, '#today-badge'), 0, 'no badge on Today');
    eq(await count(app, '.ask, .tcard, .ccard'), 0, 'no ask box, no topic cards');
    await shot(app, `home-${tag(w, dark)}`);
  }
});

await test('shell: on a phone the tab bar sits at the bottom and the settings button is tappable', async () => {
  const app = await open({});
  const r = await app.page.evaluate(() => { const t = document.getElementById('tabs').getBoundingClientRect(); return { bottom: t.bottom, vh: innerHeight }; });
  assert(Math.abs(r.bottom - r.vh) < 2, `tab bar at the bottom (bottom ${r.bottom}, viewport ${r.vh})`);
  await app.page.click('#settings-btn');
  await app.page.waitForSelector('.set');
});

await test('topic: ready page with hook, path and library (no warm-up once started)', async () => {
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/t/how-tides-work-ab12' });
    await app.page.waitForSelector('.path');
    await app.page.waitForSelector('.lib-fold');   // the source cards are folded away until opened
    eq(await text(app, '.tp-title'), 'How tides work', 'title');
    assert((await text(app, '.tp-hook')).startsWith('Why does the sea rise twice'), 'hook');
    assert((await text(app, '.tp-breath')).includes('two bulges'), 'in one breath');
    eq(await count(app, '.pnode'), 6, 'six ideas');
    eq(await count(app, '.pnode.is-done'), 2, 'two done');
    eq(await text(app, '.pnode.is-current .pnode-title'), 'Two bulges, not one', 'current is the last idea touched');
    eq(await text(app, '.pnode.is-current .pnode-btn'), 'Continue', 'Continue on a started idea');
    assert((await text(app, '.pnode:nth-child(5)')).includes('You may already know this'), 'known idea');
    assert((await text(app, '.pnode:nth-child(6) .pnode-deps')).includes('“Earth turns under the bulges” and “Spring and neap tides”'), 'deps as words');
    eq(await text(app, '.lib-status'), 'Research found 4 sources', 'research status: what research found');
    await app.page.click('.lib-fold > summary');   // the cards are folded away until opened
    eq(await count(app, '.src:visible'), 4, 'four sources');
    assert((await text(app, '.lib-group-h')).includes('Spring and neap tides'), 'per-idea sources');
    eq(await count(app, '.tp-warm, .tp-warm-again'), 0, 'no warm-up once Dan has started');
    eq(await count(app, '.pnode:nth-child(3) .pnode-deps'), 0, 'no deps text when it is just the idea before');
    if (w === 1280) {
      const r = await app.page.evaluate(() => { const b = document.querySelector('.tp-banner').getBoundingClientRect(), t = document.querySelector('.tp-title').getBoundingClientRect(), rail = document.querySelector('.tp-rail').getBoundingClientRect(), path = document.querySelector('.path').getBoundingClientRect();
        return { beside: b.left > t.right, h: Math.round(b.height), railEdge: Math.round(b.left - rail.left), path: Math.round(path.top), vh: innerHeight }; });
      assert(r.beside && r.h < 240 && Math.abs(r.railEdge) <= 1, `cover beside the title, over the rail (${JSON.stringify(r)})`);
      assert(r.path < r.vh, `the path starts on the first screen (${JSON.stringify(r)})`);
    }
    await shot(app, `topic-ready-${tag(w, dark)}`);
  }
});

await test('topic: warm-up saves answers and never blocks the path', async () => {
  const app = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56' });
  await app.page.waitForSelector('.tp-warm');
  assert((await text(app, '.tp-warm')).toLowerCase().includes('warm-up · 1 of 2'), 'warm-up shows');
  eq(await count(app, '.pnode.is-current'), 1, 'path is open while the warm-up waits');
  await app.page.click('.tp-warm .option >> text=The middle note');
  eq(await count(app, '.tp-warm-why'), 0, 'a tap only selects (it can be changed)');
  eq(await app.page.getAttribute('.tp-warm .option[aria-pressed="true"]', 'data-key'), 'warm-c1-1', 'the tapped answer is selected');
  await app.page.click('.tp-warm-check');
  await app.page.waitForSelector('.tp-warm-why');
  eq(await text(app, '.tp-warm-verdict'), 'Right.', 'right answer');
  await app.page.click('.tp-warm-why .btn');
  await app.page.click('.tp-warm .option >> text=Yes, always');
  await app.page.click('.tp-warm-check');
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
  const db = seedDb();
  db['topics/minor-keys-ef56'] = { ...db['topics/minor-keys-ef56'], research: { status: 'running', at: new Date().toISOString(), sources: 0 } };
  const app = await open({ db, hash: '#/t/minor-keys-ef56', fakes: { tutor: false } });
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

await test('topic: Try again uses U.gen.replan when it exists', async () => {
  const failed = { id: 'jazz-xx', title: 'How jazz chords work', query: 'how jazz chords work', createdAt: '2026-10-05T09:00:00.000Z', updatedAt: '2026-10-05T09:00:00.000Z', status: 'failed', error: 'Claude is busy right now.', hue: 140, ideas: [] };
  const app = await open({ db: { 'topics/jazz-xx': failed }, hash: '#/t/jazz-xx', fakes: { gen: 'replan' } });
  await app.page.waitForSelector('.tp-failed');
  await app.page.click('.tp-failed .btn >> text=Try again');
  await app.page.waitForSelector('.tp-planning');
  await app.page.waitForSelector('.path');
  eq(await hash(app), '#/t/jazz-xx', 'same topic, planned again');
  eq(JSON.stringify(await app.page.evaluate(() => window.__calls.gen)), JSON.stringify([{ replan: 'jazz-xx' }]), 'replan called, nothing recreated');
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

// Audit 40: the missing topic is a screen of its own: an h1 that takes focus, and a title.
await test('topic: missing topic', async () => {
  const app = await open({ hash: '#/t/nope' });
  await app.page.waitForSelector('.v-empty');
  eq(await text(app, '#view h1'), 'This topic is not here any more', 'gone state, as the screen\'s heading');
  await app.page.waitForFunction(() => document.activeElement && document.activeElement.matches('#view h1'), null, { timeout: 3000 });
  eq(await app.page.title(), 'Topic not found · My University', 'the title says so');
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
    eq(await text(app, '.map-topic.is-done .map-topic-text .done-note'), 'Every idea learned', 'a finished topic says so, in green words');
    const ring = await app.page.evaluate(() => { const d = document.querySelector('.map-topic.is-done .map-dot'), c = document.querySelector('.map-topic:not(.is-done) .map-dot'); return [getComputedStyle(d).strokeWidth, getComputedStyle(c).strokeWidth]; });
    eq(ring[0], ring[1], 'no special ring on a finished topic\'s dots');
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
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/book/words' });
    await app.page.waitForSelector('.book-entry');
    eq(await count(app, '.book-topic'), 2, 'two topics with explanations');
    eq(await count(app, '.book-entry'), 3, 'three ideas explained');
    const first = app.page.locator('.book-entry').first();
    assert((await first.innerText()).includes('Things pull on each other less'), 'first words');
    assert((await first.innerText()).includes('Gravity falls with the square of distance'), 'latest words');
    eq(await first.locator('.book-words').count(), 2, 'first and latest');
    eq(await count(app, '.book-q'), 2, 'questions Dan asked');
    eq(await text(app, '.book-q'), 'Does the Sun make tides too?', 'newest question first');
    eq(await count(app, '.book-words.is-first'), await count(app, '.book-words.is-latest'), 'only a first try with a later one beside it is marked as a first try');
    const ink = await app.page.evaluate(() => [getComputedStyle(document.querySelector('.book-words.is-only .book-text')).color, getComputedStyle(document.querySelector('.book-words.is-latest .book-text')).color]);
    eq(ink[0], ink[1], 'a lone explanation reads at full strength, like a latest one');
    await shot(app, `book-${tag(w, dark)}`);
    if (w === 360 && !dark) {
      await app.page.click('.book-actions .btn >> text=Save as Markdown');
      await app.page.click('.book-actions .btn >> text=Save a full copy');
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
    const app = await open({ width: w, dark, db: seedDb({ topics: ['minor-keys-ef56'] }), hash: '#/book/words' });
    await app.page.waitForSelector('.v-empty');
    eq(await app.page.locator('.book-actions').isVisible(), false, 'no export when empty');
    await shot(app, `book-empty-${tag(w, dark)}`);
  }
});

await test('settings: changes apply at once, save, and survive a reload', async () => {
  const app = await open({ db: seedDb() });
  await app.page.click('#settings-btn');
  await app.page.waitForSelector('.set');
  assert((await text(app, '.sheet-head h2')) === 'Settings', 'sheet title');
  eq(await app.page.getAttribute('#settings-btn', 'aria-label'), 'Settings', 'button named for what it opens');
  await app.page.waitForFunction(() => /Not connected/.test(document.querySelector('.set-research').textContent));
  await shot(app, 'settings-360-light', { full: false });
  eq(await app.page.evaluate(() => document.querySelector('.sheet').classList.contains('has-more')), true, 'the bottom edge fades while more is below');
  await app.page.evaluate(() => { const s = document.querySelector('.sheet'); s.scrollTop = s.scrollHeight; });
  await app.page.waitForFunction(() => !document.querySelector('.sheet').classList.contains('has-more'));
  await shot(app, 'settings-360-light-end', { full: false });
  await app.page.evaluate(() => { document.querySelector('.sheet').scrollTop = 0; });
  await app.page.waitForFunction(() => document.querySelector('.sheet').classList.contains('has-more'));
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
  await app.page.keyboard.press('Escape');
  await app.page.evaluate(() => U.go('#/'));
  // Reload: the stub db starts empty, so prefs come back from localStorage (first paint) and
  // are adopted into the new profile.
  await app.page.reload();
  await app.booted();
  eq(await app.page.getAttribute('html', 'data-mu-theme'), 'dark', 'dark kept after reload');
  eq(await app.page.getAttribute('html', 'data-size'), 'xl', 'size kept after reload');
  eq(await app.page.getAttribute('html', 'data-easy'), '1', 'easy kept after reload');
  await app.page.waitForTimeout(400);
  eq((await doc(app, `data/users/${UID}/profile`)).prefs.theme, 'dark', 'adopted into the profile');
  await app.page.waitForSelector('.lib-shelves .shelf-card, .lib-shelves p.muted');
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
  // Boot routes at once; the profile's prefs arrive just after.
  await app.page.waitForFunction(() => document.documentElement.getAttribute('data-mu-theme') === 'dark');
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
  await app.booted();
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
  const today = days[await app.page.evaluate(() => U.studyDay())];   // minutes are kept by study day
  eq(typeof today === 'object' ? Object.values(today).reduce((a, n) => a + n, 0) : today, 2, 'two minutes logged, idle time ignored');
  eq(Object.keys(today).length, 1, 'kept under this device\'s own key');
});


// Audit round 3, finding 14: a capability that answers late used to be dropped for the visit
// (the app ran on the in-memory store and looked wiped). The page clock is faked so the 10 s and
// 30 s waits pass at once.
await test('boot: slow saved work is waited for, said plainly, and shown when it arrives late', async () => {
  async function slowApp(name, ms) {
    const app = await openApp({ width: 360, height: 707, file: FILE, config: { db: seedDb() } });
    current.apps.push(app);
    await app.page.addInitScript(installFakes, { review: true, tutor: true, gen: 'fast', bands: SEED.bands, due: 4 });
    await app.page.clock.install();
    await app.page.addInitScript(([n, wait]) => {
      const real = window.claude;
      window.claude = { use: (k) => (k === n ? new Promise((r) => setTimeout(r, wait)).then(() => real.use(k)) : real.use(k)) };
    }, [name, ms]);
    await app.page.goto(app.url('#/'));
    return app;
  }
  const notice = (app) => app.page.evaluate(() => { const n = document.getElementById('persist-notice'); return n ? n.textContent : null; });

  // db answers at 12 s: boot waits for it (saying why after 10 s) and opens on his shelves.
  let app = await slowApp('db', 12000);
  await app.page.clock.runFor(11500);
  assert((await text(app, '.boot-opening')).includes('Your saved work is taking longer than usual to load'), 'says what is slow');
  await app.page.clock.runFor(1000);
  await app.page.waitForFunction(() => U.boot.ready === true);
  await app.page.waitForSelector('.lib-home .shelf-card');
  assert(!/No shelves yet/.test(await text(app, '.lib-home')), 'never an empty Library');
  eq(await notice(app), null, 'no notice');

  // db answers at 35 s: the app opens at 30 s, says plainly that the saved work is not in yet,
  // and shows it the moment it arrives.
  app = await slowApp('db', 35000);
  await app.page.clock.runFor(30500);
  await app.page.waitForFunction(() => U.boot.ready === true);
  assert(/Your saved work has not loaded yet/.test(await notice(app)), 'plain notice, not "open this in the Claude app"');
  await app.page.clock.runFor(5000);
  await app.page.waitForSelector('.lib-home .shelf-card');
  eq(await app.page.evaluate(() => U.store.persistent()), true, 'the real db is in use');
  eq(await notice(app), null, 'the notice goes');
  await app.page.waitForFunction(() => /Your saved work has loaded/.test(document.getElementById('toasts').textContent));
  eq(await count(app, '.lib-home .shelf-card'), 1, 'the shelf is back');

  // The user capability late: the courses show, his progress joins them when the id arrives.
  app = await slowApp('user', 35000);
  await app.page.clock.runFor(30500);
  await app.page.waitForFunction(() => U.boot.ready === true);
  await app.page.evaluate(() => U.go('#/shelf/maths/foundations'));
  await app.page.waitForSelector('.shelf-courses .is-built .shelf-ready');
  eq(await text(app, '.shelf-courses .is-built .shelf-ready'), 'Ready to browse', 'no progress yet');
  assert(/Your saved work has not loaded yet/.test(await notice(app)), 'notice while progress is missing');
  await app.page.clock.runFor(5000);
  await app.page.waitForFunction(() => /Lesson 3 of 6/.test((document.querySelector('.shelf-courses .is-built .shelf-ready') || {}).textContent || ''));
  eq(await app.page.evaluate(() => U.rt.uid), UID);
  eq(await notice(app), null);
});

// The skeptic's second pass, G2: claude.d.ts says a framed page whose host never answers gets
// null from use() after 10 s, and a null can be asked again. The page clock is faked.
await test('boot: saved work that answers null (a host that did not answer) is asked again, never shown as wiped (G2)', async () => {
  // claude.use(name) resolves null after 10 s for its first `nulls` asks, then answers.
  async function nullApp(name, nulls) {
    const app = await openApp({ width: 360, height: 707, file: FILE, config: { db: seedDb() } });
    current.apps.push(app);
    await app.page.addInitScript(installFakes, { review: true, tutor: true, gen: 'fast', bands: SEED.bands, due: 4 });
    await app.page.clock.install();
    await app.page.addInitScript(([n, k]) => {
      const real = window.claude;
      let asked = 0;
      window.__asked = () => asked;
      window.claude = { use: (x) => (x === n && ++asked <= k ? new Promise((r) => setTimeout(() => r(null), 10000)) : real.use(x)) };
    }, [name, nulls]);
    await app.page.goto(app.url('#/'));
    return app;
  }
  const notice = (app) => app.page.evaluate(() => { const n = document.getElementById('persist-notice'); return n ? n.textContent : null; });

  // One null, then the db: boot asks again a second later and opens on his shelves.
  let app = await nullApp('db', 1);
  await app.page.clock.runFor(10500);
  eq(await app.page.evaluate(() => !!(window.U && U.boot && U.boot.ready)), false, 'still waiting for it');
  await app.page.clock.runFor(1000);
  await app.page.waitForFunction(() => U.boot.ready === true);
  await app.page.waitForSelector('.lib-home .shelf-card');
  eq(await app.page.evaluate(() => window.__asked()), 2, 'asked again');
  assert(!/No shelves yet/.test(await text(app, '.lib-home')), 'never an empty Library');
  eq(await notice(app), null, 'no notice');

  // Null at every ask for 30 s: the app opens saying the saved work is still loading (not "open
  // this in the Claude app", not the first-run welcome, not "this topic is not here"), and shows it
  // when a later ask gets it.
  app = await nullApp('db', 3);
  await app.page.clock.runFor(30500);
  await app.page.waitForFunction(() => U.boot.ready === true);
  assert(/Your saved work has not loaded yet/.test(await notice(app)), 'plain notice: ' + await notice(app));
  assert(!/No shelves yet/.test(await text(app, '.lib-home')), 'not an empty Library');
  assert((await text(app, '.lib-shelves')).includes('Your saved work is still loading'), 'says the shelves are still loading');
  await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
  await app.page.waitForSelector('.v-saved-late');
  assert(!(await text(app, '#view')).includes('not here any more'), 'a topic is not called deleted');
  await app.page.evaluate(() => U.go('#/map'));
  await app.page.waitForSelector('.v-saved-late');
  eq(await count(app, '.v-empty'), 0, 'nor is the map called empty');
  await app.page.evaluate(() => U.go('#/'));
  await app.page.clock.runFor(8000);
  await app.page.waitForSelector('.lib-home .shelf-card');
  eq(await app.page.evaluate(() => U.store.persistent()), true, 'the real db is in use');
  eq(await app.page.evaluate(() => window.__asked()), 4, 'asked until it answered');
  eq(await notice(app), null, 'the notice goes');
  await app.page.waitForFunction(() => /Your saved work has loaded/.test(document.getElementById('toasts').textContent));
  eq(await count(app, '.lib-home .shelf-card'), 1, 'the shelf is back');

  // The user capability the same way: his progress joins the courses when it arrives.
  app = await nullApp('user', 3);
  await app.page.clock.runFor(30500);
  await app.page.waitForFunction(() => U.boot.ready === true);
  assert(/Your saved work has not loaded yet/.test(await notice(app)), 'notice while progress is missing');
  await app.page.evaluate(() => U.go('#/shelf/maths/foundations'));
  await app.page.clock.runFor(8000);
  await app.page.waitForFunction(() => /Lesson 3 of 6/.test((document.querySelector('.shelf-courses .is-built .shelf-ready') || {}).textContent || ''));
  eq(await app.page.evaluate(() => U.rt.uid), UID);
  eq(await notice(app), null);

  // A quick null on a page of its own (no viewer around it) is the answer: no waiting, the plain advice.
  app = await open({ deny: ['db'] });
  await app.page.waitForSelector('#persist-notice');
  eq(await text(app, '#persist-notice'), 'Open this in the Claude app to keep your progress.', 'notice text');
});

// ---------- regressions (docs/review/correctness.md, ux.md, performance.md) ----------
const ago = (ms) => new Date(Date.now() - ms).toISOString();

await test('regressions: a planning topic nobody is planning offers Try again and Delete', async () => {
  const stuck = { id: 'tides-zz', title: '', query: 'how tides work', createdAt: ago(3 * 60e3), updatedAt: ago(3 * 60e3), status: 'planning', hue: 200, ideas: [], level: 'new' };
  const soon = { id: 'rome-zz', title: '', query: 'the fall of rome', createdAt: ago(88e3), updatedAt: ago(88e3), status: 'planning', hue: 20, ideas: [] };
  const app = await open({ db: { 'topics/tides-zz': stuck, 'topics/rome-zz': soon }, hash: '#/t/tides-zz' });
  await app.page.waitForSelector('.tp-failed');
  assert((await text(app, '.tp-failed .notice')).includes('Planning stopped'), 'says planning stopped');
  eq(await count(app, '.tp-failed .btn >> text=Try again'), 1, 'Try again');
  eq(await count(app, '.tp-failed .tp-delete >> text=Delete this topic'), 1, 'Delete');
  await shot(app, 'regress-planning-stopped-360-light');
  // One that is still within its 90 s turns into "stopped" by itself.
  await app.page.goto(app.url('#/t/rome-zz'));
  await app.page.waitForSelector('.tp-planning');
  await app.page.waitForSelector('.tp-failed', { timeout: 6000 });
});

await test('regressions: research left running by a closed page counts as not checked, with a retry', async () => {
  const db = seedDb();
  db['topics/minor-keys-ef56'] = { ...db['topics/minor-keys-ef56'], research: { status: 'running', at: ago(10 * 60e3), sources: 0 } };
  const app = await open({ db, hash: '#/t/minor-keys-ef56', tools: { 'Parallel Search': { web_search: () => ({ results: [] }), web_fetch: () => ({}) } } });
  await app.page.waitForSelector('.lib-retry');
  assert((await text(app, '.lib-status')).includes('did not finish'), 'not checked');
  await app.page.click('.lib-retry');
  await app.page.waitForFunction(() => window.__calls.gen.some((c) => c.research === 'minor-keys-ef56'));
  await app.page.waitForFunction(() => /Checking sources/.test(document.querySelector('.lib-status').textContent));
});

await test('regressions: research that finished but confirmed no source says so, with a retry (G3)', async () => {
  const db = seedDb();
  db['topics/minor-keys-ef56'] = { ...db['topics/minor-keys-ef56'], research: { status: 'failed', at: ago(60e3), sources: 0, dropped: 6, reason: 'none_confirmed', error: 'No source could be confirmed against the pages the search returned.' } };
  const app = await open({ db, hash: '#/t/minor-keys-ef56', tools: { 'Parallel Search': { web_search: () => ({ results: [] }), web_fetch: () => ({}) } } });
  await app.page.waitForSelector('.lib-retry');
  const said = await text(app, '.lib-status');
  assert(said.includes('could not confirm a single source') && !said.includes('did not finish'), said);
  assert(!/Sources checked|Research found/.test(await text(app, '#view')), 'never "Sources checked" or "Research found"');
});

await test('regressions: "Sources found" only when a source was kept; a check that confirmed none says so plainly', async () => {
  const db = seedDb();
  // Stored as done with 0 sources (before a run that kept none counted as failed), and failed
  // with the reason the source check gives now.
  db['topics/minor-keys-ef56'] = { ...db['topics/minor-keys-ef56'], research: { status: 'done', at: ago(60e3), sources: 0, dropped: 2, error: null } };
  db['topics/index-funds-cd34'] = { ...db['topics/index-funds-cd34'], research: { status: 'failed', at: ago(60e3), sources: 0, dropped: 3, error: 'No source could be confirmed against the pages the search returned.' } };
  const NONE = 'The source check ran but could not confirm a single source, so these lessons are not source-checked.';
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db, tools: { 'Parallel Search': { web_search: () => ({ results: [] }), web_fetch: () => ({}) } } });
    for (const tid of ['minor-keys-ef56', 'index-funds-cd34']) {
      await app.page.goto(app.url('#/t/' + tid));
      await app.page.waitForSelector('.path');
      await app.page.waitForFunction(() => /could not confirm/.test(document.querySelector('.lib-status').textContent));
      const lib = await text(app, '.lib-status');
      assert(lib.includes(NONE), tid + ': says plainly that nothing was confirmed: ' + lib);
      assert(!/Sources checked|Research found|did not finish/.test(lib), tid + ': neither "Research found" nor "did not finish": ' + lib);
      eq(await count(app, '.lib-retry'), 1, tid + ': offers to check again');
      await app.page.locator('.tp-lib').scrollIntoViewIfNeeded();
      await shot(app, `topic-sources-none-${tid.split('-')[0]}-${tag(w, dark)}`, { full: w > 700 });
    }
    // The topic with kept sources is unchanged.
    await app.page.goto(app.url('#/t/how-tides-work-ab12'));
    await app.page.waitForSelector('.path');
    await app.page.waitForFunction(() => /Research found 4 sources/.test(document.querySelector('.lib-status').textContent));
  }
});

await test('settings: connected, but on a view that cannot run page tools it says new topics are not source-checked here', async () => {
  const connected = { 'Parallel Search': { web_search: () => ({ results: [] }), web_fetch: () => ({}) } };
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, tools: connected });
    await app.page.evaluate(() => { U.rt.toolsOk = () => Promise.resolve(false); });
    await app.page.click('#settings-btn');
    await app.page.waitForFunction(() => /Connected, but this view cannot use it/.test(document.querySelector('.set-research').textContent));
    const t = await text(app, '.set-research');
    assert(t.includes('Connected, but this view cannot use it. New topics started here are not source-checked, and their lessons say so.'), t);
    assert(!t.includes('New topics are checked against real sources'), 'never claims sources are checked here');
    eq(await count(app, '.set-research .set-ok'), 0, 'no tick: nothing is checked here');
    await app.page.locator('.set-research').scrollIntoViewIfNeeded();
    await shot(app, `settings-research-no-tools-${tag(w, dark)}`, { full: false });
    await app.page.keyboard.press('Escape');
    // Where page tools run (or the runtime cannot tell), it is simply connected.
    await app.page.evaluate(() => { U.rt.toolsOk = () => Promise.resolve(true); });
    await app.page.click('#settings-btn');
    await app.page.waitForFunction(() => /Connected\. New topics are checked against real sources/.test(document.querySelector('.set-research').textContent));
  }
});

await test('regressions: a dead subscription shows an error with Try again, never an empty Library', async () => {
  const app = await open({ db: seedDb() });
  await app.page.waitForSelector('.lib-home .shelf-card');
  await app.page.evaluate(() => {
    const real = U.rt.db;
    const dying = (ref, code) => new Proxy(ref, { get(t, k) {
      if (k === 'onSnapshot') return (next, error) => { setTimeout(() => error && error({ code, message: 'listener stopped' }), 10); return () => {}; };
      if (k === 'orderBy' || k === 'where' || k === 'limit') return (...a) => dying(t[k](...a), code);
      const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
    } });
    window.__listCode = 'unavailable';   // the shelves: a dead bridge first, refused later
    U.rt.db = { doc: (p) => dying(real.doc(p), 'revoked'), collection: (p) => new Proxy({}, { get(t, k) { return dying(real.collection(p), window.__listCode)[k]; } }) };
  });
  await app.page.evaluate(() => U.go('#/map'));
  await app.page.evaluate(() => U.go('#/'));
  await app.page.waitForSelector('.lib-shelves .v-load-error');
  assert(!/No shelves yet/.test(await text(app, '.lib-shelves .shelf-grid')), 'never "no shelves"');
  assert(/Reconnecting/.test(await text(app, '.lib-shelves .shelf-grid')), 'says it is reconnecting first');
  // A dead bridge: parked after the quick tries, so it still says "Reconnecting…" (it loads by itself).
  await app.page.waitForTimeout(4500);
  assert(/^Reconnecting/.test(await text(app, '.lib-shelves .shelf-grid')) && !(await count(app, '.lib-shelves .shelf-grid .btn')), 'parked: still reconnecting, nothing to press: ' + await text(app, '.lib-shelves .shelf-grid'));
  // Refused: an error, with Try again.
  await app.page.evaluate(() => { window.__listCode = 'revoked'; U.go('#/'); });
  await app.page.waitForFunction(() => /could not be loaded/.test(document.querySelector('.lib-shelves').textContent), null, { timeout: 8000 });
  eq(await count(app, '.lib-shelves .btn >> text=Try again'), 1, 'then Try again');
  assert(!/No shelves yet/.test(await text(app, '.lib-shelves .shelf-grid')), 'never "no shelves"');
  await shot(app, 'regress-home-dead-subscription-360-light');
  await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
  await app.page.waitForSelector('.tp .v-load-error');
  eq(await count(app, '.tp .skeleton'), 0, 'no endless skeleton on the topic page');
});

await test('regressions: bad addresses go home or say "not here"', async () => {
  const app = await open({ db: seedDb(), hash: '#/t/how-tides-work-ab12' });
  await app.page.waitForSelector('.path');
  await app.page.evaluate(() => { location.hash = '#/t/how-tides-work-ab12%E0%A4%A'; });
  await app.page.waitForFunction(() => location.hash === '#/');
  await app.page.waitForSelector('.lib-home');
  await app.page.evaluate(() => { location.hash = '#/t/..'; });
  await app.page.waitForSelector('.not-here');
  eq(await text(app, '.not-here h1'), 'This page is not here', 'not-here screen');
});

await test('regressions: sheets take focus, trap Tab, block the app, never stack, and close fully on navigation', async () => {
  const app = await open({ width: 1280, db: seedDb(), hash: '#/t/index-funds-cd34' });
  await app.page.addInitScript(() => {});
  await app.page.waitForSelector('.path');
  const base = await app.page.evaluate(() => { window.__kd = 0; const a = document.addEventListener.bind(document), r = document.removeEventListener.bind(document);
    document.addEventListener = (t, f, o) => { if (t === 'keydown') window.__kd++; return a(t, f, o); };
    document.removeEventListener = (t, f, o) => { if (t === 'keydown') window.__kd--; return r(t, f, o); }; return 0; });
  void base;
  await app.page.focus('.tp-delete');
  await app.page.keyboard.press('Enter');
  await app.page.waitForSelector('.sheet');
  await app.page.keyboard.press('Enter').catch(() => {});
  await app.page.evaluate(() => document.querySelector('.tp-delete').click());
  await app.page.waitForTimeout(200);
  eq(await count(app, '.sheet'), 1, 'one confirmation, not two');
  eq(await app.page.evaluate(() => document.querySelector('.sheet').contains(document.activeElement)), true, 'focus is inside the sheet');
  eq(await app.page.evaluate(() => document.getElementById('app').hasAttribute('inert')), true, 'the app behind is inert');
  for (let i = 0; i < 6; i++) await app.page.keyboard.press('Tab');
  eq(await app.page.evaluate(() => document.querySelector('.sheet').contains(document.activeElement)), true, 'Tab stays inside the sheet');
  await app.page.evaluate(() => { window.__answer = 'pending'; U.confirmSheet({ title: 'Delete this topic?', text: 'x' }).then((v) => { window.__answer = String(v); }); });
  await app.page.evaluate(() => U.go('#/map'));
  await app.page.waitForSelector('.map');
  await app.page.waitForTimeout(100);
  eq(await app.page.evaluate(() => window.__answer), 'false', 'a confirmation closed by navigation answers "no"');
  eq(await app.page.evaluate(() => window.__kd), 0, 'no keydown listener left behind');
  eq(await app.page.evaluate(() => document.getElementById('app').hasAttribute('inert')), false, 'the app is usable again');
});

await test('regressions: the Map shows a just-finished idea as learned', async () => {
  const db = seedDb();
  const pr = JSON.parse(JSON.stringify(db[`data/users/${UID}/profile/progress/how-tides-work-ab12`]));
  pr.ideas.i3 = { stage: 'done', doneAt: new Date().toISOString() };
  db[`data/users/${UID}/profile/progress/how-tides-work-ab12`] = pr;
  const app = await open({ width: 1280, db, hash: '#/map' });
  await app.page.waitForSelector('.map-svg');
  eq(await app.page.locator('a[href="#/t/how-tides-work-ab12/i3"] .map-dot').getAttribute('class'), 'map-dot is-growing', 'done, first review not yet due -> growing');
});

await test('regressions: the Book reads keyed explanations and questions (and old arrays)', async () => {
  const db = seedDb();
  const pr = JSON.parse(JSON.stringify(db[`data/users/${UID}/profile/progress/how-tides-work-ab12`]));
  pr.ideas.i1.say = { kb: { text: 'Second explanation, from the phone.', at: '2026-10-02T08:00:00.000Z', verdict: 'got-it' }, ka: { text: 'First explanation.', at: '2026-09-01T08:00:00.000Z', verdict: 'partly' }, kx: null };
  pr.questions = { q2: { q: 'Newest question?', iid: 'i1', at: '2026-10-03T08:00:00.000Z' }, q1: { q: 'Older question?', iid: 'i1', at: '2026-09-03T08:00:00.000Z' } };
  db[`data/users/${UID}/profile/progress/how-tides-work-ab12`] = pr;
  const app = await open({ db, hash: '#/book/words' });
  await app.page.waitForSelector('.book-entry');
  const first = app.page.locator('.book-entry').first();
  assert((await first.locator('.is-first').innerText()).includes('First explanation.'), 'first by time');
  assert((await first.locator('.is-latest').innerText()).includes('Second explanation'), 'latest by time');
  eq(await text(app, '.book-q'), 'Newest question?', 'newest question first');
});

await test('a11y: each screen takes focus on its h1, names itself, and the view is not one live region', async () => {
  const app = await open({ db: seedDb() });
  await app.page.waitForSelector('.lib-home .shelf-card');
  eq(await app.page.title(), 'Your library · My University', 'the home names itself');
  eq(await app.page.getAttribute('#view', 'aria-live'), null, 'no aria-live on the whole view');
  eq(await app.page.getAttribute('html', 'lang'), 'en-GB', 'language set');
  await app.page.evaluate(() => U.go('#/map'));
  await app.page.waitForSelector('.map h1');
  await app.page.waitForFunction(() => document.activeElement && document.activeElement.tagName === 'H1');
  eq(await app.page.title(), 'Map · My University', 'title');
  await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
  await app.page.waitForFunction(() => document.title === 'How tides work · My University');
  await app.page.waitForFunction(() => document.activeElement && document.activeElement.classList.contains('tp-title'));
  // A progress write elsewhere does not rebuild the path under him.
  const before = await app.page.evaluate(() => { const n = document.querySelector('.pnode.is-current'); n.__mark = 1; return !!n; });
  await app.seed(`data/users/${UID}/profile/progress/how-tides-work-ab12`, { ...SEED.progress['how-tides-work-ab12'], calibrationSkipped: true });
  await app.page.waitForTimeout(300);
  eq(before && await app.page.evaluate(() => document.querySelector('.pnode.is-current').__mark === 1), true, 'unchanged parts are not rebuilt');
});

await test('topic: back from a lesson brings the next idea into view; the header offers it', async () => {
  const app = await open({ db: seedDb(), hash: '#/' });
  await app.page.waitForSelector('.lib-home .shelf-card');
  await app.page.evaluate(() => { sessionStorage.setItem('mu-from-lesson', 'how-tides-work-ab12'); U.go('#/t/how-tides-work-ab12'); });
  await app.page.waitForSelector('.pnode.is-current');
  await app.page.waitForTimeout(300);
  const inView = await app.page.evaluate(() => { const r = document.querySelector('.pnode.is-current').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
  eq(inView, true, 'current idea on screen');
  assert((await text(app, '.tp-cta')).startsWith('Continue: Two bulges'), 'header says Continue with the idea');
  await shot(app, 'topic-from-lesson-360-light', { full: false });
});

await test('text size: XL scales the whole app, not only the reading text', async () => {
  const sizes = {};
  for (const size of ['m', 'xl']) {
    const app = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56', prefs: { theme: 'light', size } });
    await app.page.waitForSelector('.tp-warm .option');
    sizes[size] = await app.page.evaluate(() => ['.tp-warm .option', '.eyebrow', '.pnode-title', '.tab', '.btn'].map((q) => parseFloat(getComputedStyle(document.querySelector(q)).fontSize)));
    if (size === 'xl') await shot(app, 'topic-warmup-360-light-xl');
  }
  sizes.xl.forEach((v, i) => assert(Math.abs(v / sizes.m[i] - 1.25) < 0.02, `size ${i} scales by 1.25 (${sizes.m[i]} -> ${v})`));
});

await test('dark mode: the delete button and error toasts are readable', async () => {
  const app = await open({ dark: true, db: seedDb(), hash: '#/t/index-funds-cd34' });
  await app.page.waitForSelector('.path');
  await app.page.click('.tp-delete');
  await app.page.waitForSelector('.sheet .btn.danger');
  await app.page.evaluate(() => U.toast('Claude is busy right now.', { kind: 'bad' }));
  const ratio = await app.page.evaluate(() => {
    function lum(c) { const m = c.match(/\d+(\.\d+)?/g).map(Number).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; }
    function cr(el) { const s = getComputedStyle(el); const a = lum(s.color), b = lum(s.backgroundColor); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
    return [cr(document.querySelector('.sheet .btn.danger')), cr(document.querySelector('.toast.bad'))];
  });
  assert(ratio[0] >= 4.5 && ratio[1] >= 4.5, 'contrast ' + ratio.map((r) => r.toFixed(2)).join(', '));
  await shot(app, 'topic-delete-confirm-360-dark', { full: false });
});

// ---------- UX round 2 (docs/review/ux-round2.md: screens) ----------

await test('ux2: planning and failed topics get a proper title, the same words, a red Delete and a time note', async () => {
  const fresh = new Date().toISOString(), old = ago(3 * 60e3);
  const db = {
    'topics/holes-zz': { id: 'holes-zz', title: '', query: 'how black holes form', createdAt: fresh, updatedAt: fresh, status: 'planning', hue: 250, ideas: [] },
    'topics/roads-zz': { id: 'roads-zz', title: '', query: 'how the romans built roads', createdAt: old, updatedAt: old, status: 'failed', error: 'Claude is busy right now.', hue: 30, ideas: [] },
    'topics/rome-zz': { id: 'rome-zz', title: '', query: 'the fall of rome', createdAt: old, updatedAt: old, status: 'planning', hue: 20, ideas: [] },
  };
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db, hash: '#/t/rome-zz' });
    await app.page.waitForSelector('.tp-failed');
    assert((await text(app, '.tp-failed .notice')).startsWith('Planning stopped'), 'a planning nobody is doing has stopped');
    await app.page.evaluate(() => U.go('#/t/roads-zz'));
    await app.page.waitForFunction(() => /did not finish/.test((document.querySelector('.tp-failed .notice') || {}).textContent || ''));
    assert((await text(app, '.tp-failed .notice')).startsWith('Planning did not finish.'), 'the page uses the same words');
    const red = await app.page.evaluate(() => { const d = document.querySelector('.tp-failed .tp-delete'), probe = document.createElement('span'); probe.style.color = 'var(--red)'; document.body.appendChild(probe); const r = [getComputedStyle(d).color, getComputedStyle(probe).color]; probe.remove(); return r; });
    eq(red[0], red[1], 'Delete is red, as it is everywhere else');
    if (w === 1280) {
      const r = await app.page.evaluate(() => { const b = document.querySelector('.tp-banner').getBoundingClientRect(), n = document.querySelector('.tp-failed .notice').getBoundingClientRect(); return { beside: b.left > n.right, top: Math.round(b.top - document.querySelector('.tp-failed .eyebrow').getBoundingClientRect().top) }; });
      assert(r.beside && Math.abs(r.top) < 12, `failed page: the cover sits beside the words (${JSON.stringify(r)})`);
    }
    await shot(app, `ux2-failed-${tag(w, dark)}`, { full: false });
    await app.page.evaluate(() => U.go('#/t/holes-zz'));
    await app.page.waitForSelector('.tp-planning');
    eq(await text(app, '.tp-title'), 'How black holes form', 'planning page title');
    assert((await text(app, '.tp-wait-note')).includes('usually takes under a minute'), 'says how long it takes');
    const sk = await app.page.evaluate(() => { const probe = document.createElement('span'); probe.style.color = 'var(--line)'; document.body.appendChild(probe); const line = getComputedStyle(probe).color; probe.remove(); return { line, bg: getComputedStyle(document.querySelector('.tp-sk-path .skeleton')).backgroundImage }; });
    assert(sk.bg.includes(sk.line), 'the waiting path is drawn in --line, so it shows: ' + sk.bg);
    await shot(app, `ux2-planning-${tag(w, dark)}`, { full: false });
  }
});

await test('ux2: covers come in six motifs, and the three older ones still go to the same topics', async () => {
  const app = await open({});
  const r = await app.page.evaluate(() => {
    const titles = Array.from({ length: 60 }, (_, i) => 'Topic number ' + i);
    const old = ['hills', 'orbits', 'arches'], seen = {}, moved = [];
    titles.forEach((t) => {
      const m = U.views.cover({ title: t }).getAttribute('data-motif'), h = U.hash(t);
      seen[m] = (seen[m] || 0) + 1;
      if (h % 6 < 3 && m !== old[h % 3]) moved.push(t);
    });
    return { seen, moved };
  });
  eq(Object.keys(r.seen).sort().join(','), 'arches,hills,orbits,peaks,stars,stones', 'six motifs in use');
  eq(r.moved.join(', '), '', 'a topic on an older motif keeps it');
});

await test('ux2: on a laptop every tab screen starts at the same left edge', async () => {
  const app = await open({ width: 1280, db: seedDb() });
  await app.page.waitForSelector('.lib-home .shelf-card');
  const lefts = {};
  for (const [hash, sel] of [['#/', '.lib-home h1'], ['#/today', '#fake-today'], ['#/map', '.map h1'], ['#/book', '.lib-page h1']]) {
    await app.page.evaluate((h) => U.go(h), hash);
    await app.page.waitForSelector(sel);
    lefts[hash] = await app.page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().left), sel);
  }
  eq(new Set(Object.values(lefts)).size, 1, 'headings do not jump sideways ' + JSON.stringify(lefts));
  await shot(app, 'ux2-book-1280-light', { full: false });
});

await test('ux2: the laptop layout on a narrow screen says its tabs are icons only', async () => {
  const app = await open({});
  await app.page.evaluate(() => U.layout.set('laptop'));
  await app.page.click('#settings-btn');
  await app.page.waitForSelector('.set-layout-note');
  assert(/tabs as icons only/.test(await text(app, '.set-layout-note')), 'note: ' + await text(app, '.set-layout-note'));
  await app.page.click('.seg-layout .seg-btn >> text=Phone');
  assert(!/icons only/.test(await text(app, '.set-layout-note')), 'no such note for the phone layout');
});

// ---------- whole lessons: say whether the next one is being prepared or ready ----------
// A lesson opens only when it is whole, so the topic page tells Dan whether the next
// idea's lesson is still being prepared or ready (from its doc, and this page's own work on it).
function nextUp() {
  const p = JSON.parse(JSON.stringify(SEED.progress['how-tides-work-ab12']));
  delete p.ideas.i3; p.lastIdea = 'i2'; p.updatedAt = new Date().toISOString();
  return { [`data/users/${UID}/profile/progress/how-tides-work-ab12`]: p };
}
const TIDES_I3 = 'topics/how-tides-work-ab12/lessons/i3';
const busyDoc = (status, at = new Date().toISOString()) => ({ status, updatedAt: at, lesson: status === 'building' ? { iid: 'i3', title: 'Two bulges' } : null, interactive: null });
const readyDoc = () => ({ status: 'ready', updatedAt: new Date().toISOString(), lesson: { iid: 'i3', title: 'Two bulges' }, interactive: null, note: 'No interactive.' });

await test('whole lessons: the topic page says whether the next idea is being prepared or ready', async () => {
  for (const [w, dark, size] of [[360, false, null], [390, false, 'xl'], [960, true, null], [1366, false, null], [1280, true, null]]) {
    const app = await open({ width: w, dark, db: seedDb({ extra: { ...nextUp(), [TIDES_I3]: busyDoc('writing') } }), hash: '#/t/how-tides-work-ab12', prefs: size ? { size, theme: dark ? 'dark' : 'light' } : null });
    await app.page.waitForSelector('.pnode.is-current');
    await app.page.waitForSelector('.tp-next-note');
    eq(await text(app, '.tp-next-note'), 'Idea 3 is being prepared…', 'header: being prepared (writing)');
    assert((await text(app, '.tp-cta')).startsWith('Start: Two bulges'), 'the header still offers it');
    eq(await text(app, '.pnode.is-current .pnode-prep'), 'Being prepared…', 'the path marks it');
    await app.seed(TIDES_I3, busyDoc('building'));
    await app.page.waitForTimeout(250);
    eq(await text(app, '.tp-next-note'), 'Idea 3 is being prepared…', 'still being prepared while its interactive is built');
    await shot(app, `whole-topic-preparing-${tag(w, dark)}${size ? '-' + size : ''}`, { full: false });
    await app.page.evaluate(() => document.querySelector('.pnode.is-current').scrollIntoView({ block: 'center' }));
    await shot(app, `whole-topic-preparing-path-${tag(w, dark)}${size ? '-' + size : ''}`, { full: false });
    await app.page.evaluate(() => window.scrollTo(0, 0));
    await app.seed(TIDES_I3, readyDoc());
    await app.page.waitForFunction(() => /Idea 3 is ready\./.test(document.querySelector('.tp-next-note') && document.querySelector('.tp-next-note').textContent));
    eq(await count(app, '.pnode-prep'), 0, 'no idea marked once it is ready');
    await shot(app, `whole-topic-ready-${tag(w, dark)}${size ? '-' + size : ''}`, { full: false });
    if (w === 360) {
      // Work that stopped long ago is not "being prepared": opening the idea prepares it.
      await app.seed(TIDES_I3, busyDoc('building', '2026-01-01T00:00:00.000Z'));
      await app.page.waitForFunction(() => !document.querySelector('.tp-next-note'));
      // This page's own work on another idea (Learn it again of a finished one) marks it at once.
      await app.page.evaluate(() => { U.gen.status = () => ({ lessons: { i1: 'building' } }); U.emit('gen', { tid: 'how-tides-work-ab12', iid: 'i1', kind: 'lesson', status: 'building', text: '' }); });
      await app.page.waitForSelector('.pnode:nth-child(1) .pnode-prep');
      eq(await count(app, '.pnode-prep'), 1, 'only that idea is marked');
      await app.page.evaluate(() => { U.gen.status = () => ({ lessons: { i1: 'ready' } }); U.emit('gen', { tid: 'how-tides-work-ab12', iid: 'i1', kind: 'lesson', status: 'ready', text: '' }); });
      await app.page.waitForFunction(() => !document.querySelector('.pnode-prep'));
    }
  }
});

// Final fixes F1: a reload kills the next idea's background prefetch, leaving its doc 'building'
// under this tab's name with nothing working on it. In the complete app (real store and U.gen,
// only the model stubbed), Learn and the topic page never say "being prepared" while nothing
// prepares it: the screens start that one prefetch again (it picks up the written lesson and
// builds its interactive), and only then say it. Any other idea this tab left stays as it is;
// another tab's fresh work is believed and left alone.
await test('whole lessons: after a reload, the next idea\'s prefetch is started again, and only then is it "being prepared"', async () => {
  const FULL = join(ROOT, 'tests', 'out', 'views-full.html');
  const b = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FULL], { stdio: 'inherit' });
  assert(b.status === 0, 'full build failed');
  const fx = (n) => readJson('tests/fixtures/lesson-ui-' + n + '.json');
  const TOPIC = fx('topic'), PENDULUM = fx('pendulum'), SMALL = fx('small-swings');
  const tid = 'pendulums', at = new Date(Date.now() - 86400000).toISOString(), now = new Date().toISOString();
  const lessonDoc = (iid, base, by) => ({ status: 'building', updatedAt: now, startedAt: now, lesson: { ...JSON.parse(JSON.stringify(base.lesson)), iid }, sourced: true, interactive: null, by });
  const db = (by) => ({
    [`topics/${tid}`]: TOPIC,
    [`topics/${tid}/lessons/i1`]: PENDULUM,
    [`topics/${tid}/lessons/i2`]: lessonDoc('i2', PENDULUM, by),
    [`topics/${tid}/lessons/i3`]: lessonDoc('i3', SMALL, by),
    [`data/users/${UID}/profile/progress/${tid}`]: { updatedAt: at, lastIdea: 'i1', ideas: { i1: { stage: 'done', startedAt: at, doneAt: at, predict: { answer: 'x', at }, checks: {} } } },
  });
  async function start(by) {
    const calls = [];
    const app = await openApp({ width: 360, height: 707, file: FULL, config: { db: db(by) },
      sample: (input) => {
        calls.push({ task: taskOf(input), text: typeof input === 'string' ? input : JSON.stringify(input) });
        // The fact-check answers (a background job's calls run one at a time); the rest stay pending.
        return taskOf(input) === 'verify-lesson' ? { issues: [] } : new Promise(() => {});
      } });
    current.apps.push(app);
    // The tab's id outlives a reload (sessionStorage): this page is the reloaded tab.
    await app.page.addInitScript(() => { try { sessionStorage.setItem('mu.tab', 'tReloaded'); } catch (e) { /* fine */ } });
    await app.page.goto(app.url('#/t/' + tid));
    await app.booted();
    // From boot on: whenever the page says idea 2 is being prepared, is a job of this page on it?
    await app.page.evaluate((tid) => {
      window.__claims = [];
      setInterval(() => {
        const n = document.querySelector('.tp-next-note');
        if (!n || !/being prepared/.test(n.textContent)) return;
        const l = (U.gen.status(tid).lessons || {}).i2;
        window.__claims.push({ live: l || null, at: Date.now() });
      }, 25);
    }, tid);
    return { app, calls };
  }

  // This tab's prefetch, killed by the reload: started again, once, for idea 2 only.
  const mine = { device: 'dSame', tab: 'tReloaded', page: 'pBeforeReload', holder: 'dSame/tReloaded' };
  const { app, calls } = await start(mine);
  await app.page.waitForFunction(() => /Idea 2 is being prepared…/.test((document.querySelector('.tp-next-note') || {}).textContent || ''), null, { timeout: 15000 });
  await app.page.waitForTimeout(800);
  eq(await app.page.evaluate((t) => (U.gen.status(t).lessons || {}).i2, tid), 'building', 'a job of this page is on idea 2');
  // (A lesson saved before its fact-check ran is checked beside the build: contract V.)
  eq(calls.map((c) => c.task).sort().join(','), 'build-interactive,verify-lesson', 'the written lesson is kept: only its interactive is built again, and the lesson checked');
  assert(/Gravity’s part/.test(calls.find((c) => c.task === 'build-interactive').text), 'for idea 2');
  const lying = await app.page.evaluate(() => window.__claims.filter((c) => !c.live || !/^(writing|waiting|building)$/.test(c.live)));
  eq(lying.length, 0, 'the topic page never says "being prepared" while nothing prepares it');
    // The topic page agrees, and starts nothing more.
  await app.page.evaluate(() => U.go('#/t/pendulums'));
  await app.page.waitForSelector('.tp-next-note');
  eq(await text(app, '.tp-next-note'), 'Idea 2 is being prepared…', 'topic header');
  eq(await text(app, '.pnode.is-current .pnode-prep'), 'Being prepared…', 'the path marks idea 2');
  await app.page.waitForTimeout(800);
  eq(await count(app, '.pnode-prep'), 1, 'only idea 2 is marked');
  eq(calls.filter((c) => c.task === 'build-interactive').length, 1, 'no second start, and idea 3 (also left by this tab) is not started: ' + calls.map((c) => c.task).join(','));
  eq(calls.length, 2, 'nothing else either (the check and the build of idea 2): ' + calls.map((c) => c.task).join(','));
  eq(await app.page.evaluate(() => window.__claims.filter((c) => !c.live).length), 0, 'the topic page never claims it either');
  await shot(app, 'whole-topic-after-reload-360-light', { full: false });

  // Another tab's (or device's) fresh work is believed, and left to it.
  const other = await start({ device: 'dOther', tab: 'tOther', page: 'pOther', holder: 'dOther/tOther' });
  await other.app.page.waitForFunction(() => /Idea 2 is being prepared…/.test((document.querySelector('.tp-next-note') || {}).textContent || ''), null, { timeout: 15000 });
  await other.app.page.waitForTimeout(1500);
  eq(other.calls.length, 0, 'nothing started over another tab\'s work');
});

// ---------- audit round 3, views (docs/review/audit-round3.md 24, 40, 49, 51; finding 7) ----------

// The platform's dead bridge, as the audit reproduced it (tests/out/audit-skeptic-watch): live
// listeners end with an error and every resubscribe fails the same way until the bridge is back.
// __bridge.drop(code) ends them ('unavailable' by default); __bridge.down = false brings it back.
function deadBridge() {
  const ctl = (window.__bridge = { down: false, code: 'unavailable', live: new Set() });
  const dead = () => ({ code: ctl.code, message: 'bridge not responding' });
  const wrapSub = (t) => (next, error) => {
    if (ctl.down) { setTimeout(() => error && error(dead()), 50); return () => {}; }
    const off = t.onSnapshot(next, error), rec = { off, error };
    ctl.live.add(rec);
    return () => { off(); ctl.live.delete(rec); };
  };
  const wq = (q) => ({ path: q.path, orderBy: (...a) => wq(q.orderBy(...a)), where: (...a) => wq(q.where(...a)), limit: (...a) => wq(q.limit(...a)), get: () => q.get(), onSnapshot: wrapSub(q), doc: (id) => wd(q.doc(id)) });
  const wd = (r) => ({ id: r.id, path: r.path, get: () => r.get(), set: (d) => r.set(d), update: (d) => r.update(d), delete: () => r.delete(), acquire: (o) => r.acquire(o), onSnapshot: wrapSub(r), collection: (p) => wq(r.collection(p)) });
  ctl.drop = (code) => { ctl.code = code || 'unavailable'; ctl.down = true; for (const rec of [...ctl.live]) { rec.off(); ctl.live.delete(rec); rec.error && rec.error(dead()); } };
  const real = window.claude;
  window.claude = { ...real, use: (n) => real.use(n).then((ns) => (n === 'db' && ns ? { doc: (p) => wd(ns.doc(p)), collection: (p) => wq(ns.collection(p)) } : ns)) };
}
const focusedOn = (app, sel) => app.page.evaluate((q) => !!document.activeElement && document.activeElement.matches(q), sel);

// Audit 24: the plan (hook, "in one breath", the warm-up's answers) is written before research
// and never checked. It says so, calmly, and the Library's tick speaks only for the lessons.
await test('audit 24: the plan\'s overview says it is Claude\'s and not source-checked; the Library says what research found', async () => {
  const OVERVIEW = 'This summary and the question above are Claude\'s overview from what it already knows, not checked against sources.';
  const db = seedDb();
  db['topics/index-funds-cd34'] = { ...db['topics/index-funds-cd34'], oneBreath: '' };   // an older plan with no summary
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db, hash: '#/t/how-tides-work-ab12' });
    await app.page.waitForSelector('.lib-fold');
    eq(await text(app, '.tp-breath .tp-overview-note'), OVERVIEW, 'In one breath and the hook are labelled as Claude\'s overview');
    eq(await text(app, '.lib-status'), 'Research found 4 sources', 'the tick says what research found');
    assert(!/Sources checked|checked against \d/i.test(await text(app, '#view')), 'no claim that the sources checked anything, beside the overview');
    // Calm: smaller than the summary, in the muted colour, never a warning.
    const look = await app.page.evaluate(() => {
      const n = document.querySelector('.tp-breath .tp-overview-note'), probe = document.body.appendChild(Object.assign(document.createElement('span'), { style: 'color: var(--muted)' }));
      const r = { note: parseFloat(getComputedStyle(n).fontSize), body: parseFloat(getComputedStyle(document.querySelector('.tp-breath .reading')).fontSize), color: getComputedStyle(n).color, muted: getComputedStyle(probe).color, warn: !!n.closest('.notice, .callout.warn') };
      probe.remove();
      return r;
    });
    assert(look.note < look.body && look.color === look.muted && !look.warn, `a quiet note (${JSON.stringify(look)})`);
    if (w === 1280) {
      // The rail sits beside the summary: its line says what research found, nothing more.
      const r = await app.page.evaluate(() => { const a = document.querySelector('.tp-breath').getBoundingClientRect(), b = document.querySelector('.lib-status').getBoundingClientRect(); return { beside: b.left > a.right }; });
      assert(r.beside, 'the Library is beside the summary on a laptop');
    }
    await app.page.locator('.tp-breath').scrollIntoViewIfNeeded();
    await shot(app, `audit24-overview-${tag(w, dark)}`, { full: false });
    // An older plan without a summary: the hook says it itself.
    await app.page.evaluate(() => U.go('#/t/index-funds-cd34'));
    await app.page.waitForSelector('.path');
    eq(await count(app, '.tp-breath'), 0, 'no summary');
    eq(await text(app, '.tp-head .tp-overview-note'), 'Claude\'s overview from what it already knows, not checked against sources.', 'labelled under the hook');
  }
  // The warm-up's answer and why, once shown.
  const app = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56' });
  await app.page.waitForSelector('.tp-warm');
  eq(await count(app, '.tp-warm .tp-overview-note'), 0, 'nothing to label before an answer is shown');
  await app.page.click('.tp-warm .option >> text=The middle note');
  await app.page.click('.tp-warm-check');
  await app.page.waitForSelector('.tp-warm-why');
  eq(await text(app, '.tp-warm-why .tp-overview-note'), 'Claude\'s answer from what it already knows, not checked against sources.', 'the warm-up answer is labelled');
  await app.page.locator('.tp-warm-why').scrollIntoViewIfNeeded();
  await shot(app, 'audit24-warmup-360-light', { full: false });
});

// Audit 40: every state of the topic page has an h1 that takes focus, and a title of its own.
await test('audit 40: a topic that could not be loaded, was deleted elsewhere, or loads after 6 s gets a heading, focus and a title', async () => {
  const app = await open({ db: seedDb() });
  await app.page.waitForSelector('.lib-home .shelf-card');
  // A watch the db refuses: "could not be loaded", with Try again.
  await app.page.evaluate(() => {
    const real = window.__realDb = U.rt.db;
    U.rt.db = { collection: real.collection.bind(real), doc: (p) => new Proxy(real.doc(p), { get(t, k) {
      if (k === 'onSnapshot') return (n, e) => { setTimeout(() => e({ code: 'permission_denied', message: 'no' }), 10); return () => {}; };
      const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
    } }) };
  });
  await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
  await app.page.waitForSelector('.tp-state-h');
  eq(await text(app, '#view h1'), 'This topic could not be loaded', 'its own heading');
  await app.page.waitForFunction(() => document.activeElement && document.activeElement.matches('#view h1'), null, { timeout: 3000 });
  eq(await app.page.title(), 'Topic could not be loaded · My University', 'title');
  eq(await count(app, '.tp-state .btn >> text=Try again'), 1, 'Try again');
  await shot(app, 'audit40-not-loaded-360-light', { full: false });
  // Slower than U._focusScreen waits (6 s): the heading still takes focus when the topic arrives.
  await app.page.evaluate(() => {
    const real = window.__realDb;
    U.rt.db = { collection: real.collection.bind(real), doc: (p) => new Proxy(real.doc(p), { get(t, k) {
      if (k === 'onSnapshot' && /^topics\/[^/]+$/.test(p)) return (n, e) => { let off = null, dead = false; const timer = setTimeout(() => { if (!dead) off = t.onSnapshot(n, e); }, 7000); return () => { dead = true; clearTimeout(timer); if (off) off(); }; };
      const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
    } }) };
  });
  await app.page.click('.backlink');
  await app.page.waitForSelector('.lib-home .shelf-card');
  await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
  await app.page.waitForTimeout(6500);
  eq(await count(app, '#view h1'), 0, 'still loading after 6 s');
  await app.page.waitForSelector('.tp-title', { timeout: 5000 });
  await app.page.waitForFunction(() => document.activeElement && document.activeElement.matches('.tp-title'), null, { timeout: 2000 });
  eq(await app.page.title(), 'How tides work · My University', 'title');
  // Deleted on another device while Dan is on it, with focus on an idea: the new heading takes it.
  await app.page.evaluate(() => { U.rt.db = window.__realDb; });
  await app.page.focus('.pnode.is-current .pnode-link');
  await app.page.evaluate(() => U.rt.db.doc('topics/how-tides-work-ab12').delete());
  await app.page.waitForSelector('.v-empty h1');
  await app.page.waitForFunction(() => document.activeElement && document.activeElement.matches('.v-empty h1'), null, { timeout: 2000 });
  eq(await app.page.title(), 'Topic not found · My University', 'title once gone');
});

// Audit 51: Learn's reviews row gives Today's own time for the session, never its own guess.
// Finding 7 (what was left): a watch parked by a dead bridge (20-store.js) after the screen has
// loaded. The audit's case: the topic page shows "Planning your topic"; the bridge stops for longer
// than the quick resubscribes; the plan finishes and is saved meanwhile.
await test('finding 7: a parked watch says "Reconnecting…" over the page it keeps; the note goes, and the page catches up, when it is back', async () => {
  const now = new Date().toISOString();
  const db = seedDb({ extra: { 'topics/jet-engines-zz': { id: 'jet-engines-zz', title: '', query: 'How jet engines work', createdAt: now, updatedAt: now, status: 'planning', hue: 30, ideas: [] } } });
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db, hash: '#/t/jet-engines-zz', init: deadBridge });
    await app.page.waitForSelector('.tp-planning');
    await app.page.evaluate(() => { U.store.WATCH_PARK_MS = 1500; window.__bridge.drop(); });
    await app.page.waitForSelector('.tp-conn .v-reconnect', { timeout: 10000 });
    assert(/^Reconnecting…/.test(await text(app, '.tp-conn .v-pill')), 'says it is reconnecting: ' + await text(app, '.tp-conn'));
    assert((await app.page.textContent('.tp-conn .v-pill')).includes('so what you see may be out of date. It updates by itself once the connection is back.'), 'a screen reader hears why');
    eq(await count(app, '.tp-conn .btn, .tp-conn .notice.bad'), 0, 'calm, and nothing to press: it reconnects by itself');
    eq(await count(app, '.tp-planning'), 1, 'the page it had stays');
    await shot(app, `finding7-topic-reconnecting-${tag(w, dark)}`, { full: false });
    // The plan is saved while the bridge is down; then it answers again.
    const planned = { ...SEED.topics['how-tides-work-ab12'], id: 'jet-engines-zz', title: 'How jet engines work', status: 'ready', updatedAt: new Date().toISOString() };
    await app.seed('topics/jet-engines-zz', planned);
    await app.page.waitForTimeout(500);
    await app.page.evaluate(() => { window.__bridge.down = false; });
    await app.page.waitForSelector('.tp-ready .path', { timeout: 8000 });
    await app.page.waitForFunction(() => !document.querySelector('.tp-conn').children.length, null, { timeout: 8000 });
    // The Library: the shelves watch parks after they were shown.
    await app.page.evaluate(() => U.go('#/'));
    await app.page.waitForSelector('.lib-home .shelf-card');
    await app.page.evaluate(() => window.__bridge.drop());
    await app.page.waitForSelector('.lib-live .v-reconnect', { timeout: 10000 });
    eq(await count(app, '.lib-home .shelf-card'), 1, 'the Library keeps its shelves');
    assert(!/could not be loaded/.test(await text(app, '.lib-home')), 'not "could not be loaded" over shelves it shows');
    await shot(app, `finding7-home-reconnecting-${tag(w, dark)}`, { full: false });
    await app.page.evaluate(() => { window.__bridge.down = false; });
    await app.page.waitForFunction(() => !document.querySelector('.lib-live').children.length, null, { timeout: 8000 });
    // A watch ended for good (refused, not a dead bridge) says so, with Try again.
    await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
    await app.page.waitForSelector('.path');
    await app.page.evaluate(() => window.__bridge.drop('permission_denied'));
    await app.page.waitForSelector('.tp-conn .v-load-error.bad', { timeout: 5000 });
    assert((await text(app, '.tp-conn')).startsWith('This page stopped updating.'), await text(app, '.tp-conn'));
    eq(await count(app, '.tp-conn .btn >> text=Try again'), 1, 'Try again');
    eq(await count(app, '.path'), 1, 'still showing the page');
  }
});

// ---------- the views check (its report: tests/out/check-views; problems 1-5) ----------

const LIB_NOTE = 'Each lesson lists the sources it drew on, or says it was written without them.';
const CLAIMS = /checked against \d|lessons? (were |was |are )?checked|sources checked/i;

// 1. Nothing checks a lesson against the sources yet, and the first lesson is usually written
// before research finishes (unsourced). The Library says only what research found, and that each
// lesson says which it is.
await test('views check 1: the Library says what research found, never that lessons were checked', async () => {
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/t/how-tides-work-ab12' });
    await app.page.waitForSelector('.lib-fold');
    eq(await text(app, '.lib-status'), 'Research found 4 sources', 'the Library: what research found');
    eq(await text(app, '.tp-lib .lib-note'), LIB_NOTE, 'and that each lesson says whether it drew on them');
    assert(!CLAIMS.test(await text(app, '#view')), 'no claim that lessons were checked: ' + await text(app, '.tp-lib'));
    // Quiet: the muted colour, smaller than the status.
    const look = await app.page.evaluate(() => {
      const n = document.querySelector('.tp-lib .lib-note'), probe = document.body.appendChild(Object.assign(document.createElement('span'), { style: 'color: var(--muted)' }));
      const r = { note: parseFloat(getComputedStyle(n).fontSize), status: parseFloat(getComputedStyle(document.querySelector('.lib-status')).fontSize), color: getComputedStyle(n).color, muted: getComputedStyle(probe).color };
      probe.remove();
      return r;
    });
    assert(look.note < look.status && look.color === look.muted, 'a quiet line: ' + JSON.stringify(look));
    await app.page.locator('.tp-lib').scrollIntoViewIfNeeded();
    await shot(app, `check1-library-${tag(w, dark)}`, { full: false });
  }
});

// The Library says lessons were checked against the sources only as far as their docs say so
// (doc.verified.status 'done', with sources: contract V): every whole lesson, or how many.
await test('views check 1b: the Library claims a fact-check only where every whole lesson had one, else says how many', async () => {
  const L = (iid, verified, sources = 1) => ({ status: 'ready', updatedAt: new Date().toISOString(), interactive: null, note: 'No interactive.', verified,
    lesson: { iid, title: 'Lesson ' + iid, sources: Array.from({ length: sources }, (_, k) => ({ n: k + 1, title: 'S', url: 'https://example.org/' + k, quote: 'q' })) } });
  const done = { status: 'done', at: new Date().toISOString(), applied: [], notes: [] };
  const lessons = (docs) => Object.fromEntries(docs.map((d) => ['topics/how-tides-work-ab12/lessons/' + d.lesson.iid, d]));
  const cases = [
    ['some checked', lessons([L('i1', done), L('i2', { ...done, status: 'failed' })]), LIB_NOTE + ' 1 of the 2 lessons written so far was checked against them.'],
    ['all checked', lessons([L('i1', done), L('i2', done)]), 'Each lesson is checked against them before it opens.'],
    ['checked without sources does not count', lessons([L('i1', done, 0)]), LIB_NOTE],
  ];
  for (const [name, extra, want] of cases) {
    const app = await open({ width: 360, db: seedDb({ extra }), hash: '#/t/how-tides-work-ab12' });
    await app.page.waitForSelector('.tp-lib .lib-note');
    await app.page.waitForFunction((w) => document.querySelector('.tp-lib .lib-note').textContent === w, want, { timeout: 5000 }).catch(() => {});
    eq(await text(app, '.tp-lib .lib-note'), want, name);
    await app.close();
  }
});

// 2. Older plans can have a statement as the hook: the note under "In one breath" names it as such.
// 12 Oct: a ready-made course's hook and In one breath are checked when it is built
// (topic.overviewChecked, from tools/course/assemble.mjs), so its notes say so; and the Sources
// cards fold away under the status line until Dan opens them, staying open across a redraw.
await test('ready-made: a checked overview says so; the sources fold away, and stay open across a redraw', async () => {
  const db = seedDb();
  db['topics/how-tides-work-ab12'] = { ...db['topics/how-tides-work-ab12'], readyMade: { shelf: 'maths', course: 'tides' }, overviewChecked: true };
  db['topics/index-funds-cd34'] = { ...db['topics/index-funds-cd34'], oneBreath: '', overviewChecked: true };
  const app = await open({ db, hash: '#/t/how-tides-work-ab12' });
  await app.page.waitForSelector('.lib-fold');
  eq(await text(app, '.tp-breath .tp-overview-note'), 'This summary and the question above were checked against the course\'s sources when it was built.', 'checked: said under In one breath');
  eq(await text(app, '.lib-status'), 'Research found 4 sources', 'the status line shows as before');
  eq(await count(app, '.src:visible'), 0, 'the source cards start folded');
  eq(await text(app, '.lib-fold > summary'), 'Show all 4 sources', 'the fold says how many');
  const row = await app.page.locator('.lib-fold > summary').boundingBox();
  assert(row && row.height >= 44, 'the fold row is a 44 px target (' + (row && row.height) + ')');
  await app.page.click('.lib-fold > summary');
  eq(await count(app, '.src:visible'), 4, 'open: the four cards');
  // The Library redraws when an idea's title changes on another device: the fold stays open.
  await app.page.evaluate(() => { const t = JSON.parse(JSON.stringify(window.__CLAUDE_STUB__.get('topics/how-tides-work-ab12'))); t.ideas[0].title = 'Gravity fades with distance'; window.__CLAUDE_STUB__.seed('topics/how-tides-work-ab12', t); });
  await app.page.waitForFunction(() => /Gravity fades/.test(document.querySelector('.path').textContent));
  eq(await count(app, '.src:visible'), 4, 'still open after the redraw');
  await shot(app, 'ready-made-overview-checked-360', { full: false });
  // An older plan with no summary: the note under the hook says checked too.
  await app.page.evaluate(() => U.go('#/t/index-funds-cd34'));
  await app.page.waitForSelector('.path');
  eq(await text(app, '.tp-head .tp-overview-note'), 'Checked against the course\'s sources when it was built.', 'checked, under the hook');
  // A course with no kept sources has nothing to fold.
  await app.page.evaluate(() => U.go('#/t/minor-keys-ef56'));
  await app.page.waitForSelector('.path');
  eq(await count(app, '.lib-fold'), 0, 'no sources: no fold');
});

await test('views check 2: the overview note calls a statement hook "the line above", a question "the question above"', async () => {
  const db = seedDb();
  db['topics/minor-keys-ef56'] = { ...db['topics/minor-keys-ef56'], hook: 'A weight on a string kept the world on time for 300 years.' };
  const app = await open({ db, hash: '#/t/minor-keys-ef56' });
  await app.page.waitForSelector('.tp-breath');
  eq(await text(app, '.tp-breath .tp-overview-note'), 'This summary and the line above are Claude\'s overview from what it already knows, not checked against sources.', 'a statement');
  // The hook changes on another device: the note follows it.
  await app.seed('topics/minor-keys-ef56', { ...db['topics/minor-keys-ef56'], hook: 'Why does one note change the **mood**?”', updatedAt: new Date().toISOString() });
  await app.page.waitForFunction(() => /question above/.test(document.querySelector('.tp-breath .tp-overview-note').textContent), null, { timeout: 5000 });
  await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
  await app.page.waitForSelector('.tp-breath');
  eq(await text(app, '.tp-breath .tp-overview-note'), 'This summary and the question above are Claude\'s overview from what it already knows, not checked against sources.', 'a question');
});

// 3. The bridge down for longer than the quick tries when a screen opens: the store keeps trying
// (parked) and the screen fills in by itself, so it says "Reconnecting…" calmly. Only a refusal
// is an error, with its heading, its title and Try again.
await test('views check 3: a watch parked before the screen has loaded says "Reconnecting…" calmly (topic page, the Library); a refusal is still an error', async () => {
  const down = () => { window.__bridge.down = true; };
  const calm = async (app, sel, what) => {
    await app.page.waitForSelector(sel + ' .v-load-error', { timeout: 10000 });
    await app.page.waitForTimeout(4500);   // past the quick tries (0.4 + 0.8 + 1.6 s): parked
    const t = await text(app, sel);
    assert(/^Reconnecting…/.test(await text(app, sel + ' .v-load-error')), what + ' says it is reconnecting: ' + t);
    assert(!/could not be loaded/.test(t), what + ' is not "could not be loaded": ' + t);
    eq(await count(app, `${sel} .notice.bad, ${sel} .btn`), 0, what + ': calm, and nothing to press');
  };
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/t/how-tides-work-ab12', init: [deadBridge, down] });
    await calm(app, '#view', 'the topic page');
    eq(await count(app, '#view h1'), 0, 'no "could not be loaded" heading');
    eq(await app.page.title(), 'Topic · My University', 'the title does not call it an error');
    await shot(app, `check3-topic-parked-before-load-${tag(w, dark)}`, { full: false });
    await app.page.evaluate(() => { window.__bridge.down = false; window.dispatchEvent(new Event('online')); });
    await app.page.waitForSelector('.tp-title', { timeout: 8000 });
    await app.page.waitForFunction(() => document.activeElement && document.activeElement.matches('.tp-title'), null, { timeout: 3000 });
    // The Library's first load, the same way.
    await app.page.evaluate(() => { window.__bridge.down = true; U.go('#/'); });
    await calm(app, '.lib-shelves', 'the Library');
    await shot(app, `check3-home-parked-before-load-${tag(w, dark)}`, { full: false });
    await app.page.evaluate(() => { window.__bridge.down = false; window.dispatchEvent(new Event('online')); });
    await app.page.waitForSelector('.lib-home .shelf-card', { timeout: 8000 });
  }
  // Refused: the topic page's error, with its heading and title; the Library's, with Try again.
  const app = await open({ db: seedDb(), hash: '#/t/how-tides-work-ab12', init: [deadBridge, () => { window.__bridge.down = true; window.__bridge.code = 'permission_denied'; }] });
  await app.page.waitForSelector('.tp-state-h');
  eq(await text(app, '#view h1'), 'This topic could not be loaded', 'a refusal is an error');
  eq(await count(app, '#view .notice.bad .btn >> text=Try again'), 1, 'with Try again');
  eq(await app.page.title(), 'Topic could not be loaded · My University', 'and its title');
  await app.page.evaluate(() => U.go('#/'));
  await app.page.waitForSelector('.lib-shelves .v-load-error.bad');
  eq(await count(app, '.lib-shelves .btn >> text=Try again'), 1, 'the Library: Try again');
});

// 4. A watch parked once the topic page has loaded: a small "Reconnecting…" that floats under the
// top bar wherever Dan has scrolled, takes no room (WebKit, which the iPhone app uses, has no
// scroll anchoring, so anything inserted above would move the page under his thumb), and lets
// taps through.
await test('views check 4: the topic page\'s "Reconnecting…" floats in view wherever Dan is and moves nothing', async () => {
  for (const [w, dark] of [[360, false], [390, false], [1280, true]]) {
    const app = await open({ width: w, dark, db: seedDb(), hash: '#/t/how-tides-work-ab12', init: deadBridge });
    await app.page.waitForSelector('.path');
    await app.page.evaluate(() => { document.documentElement.style.overflowAnchor = 'none'; U.store.WATCH_PARK_MS = 60000; });   // as WebKit
    const where = () => app.page.evaluate(() => {
      const r = (q) => { const b = document.querySelector(q); if (!b) return null; const x = b.getBoundingClientRect(); return { top: Math.round(x.top), bottom: Math.round(x.bottom), left: Math.round(x.left), right: Math.round(x.right) }; };
      const pill = document.querySelector('.tp-conn .v-reconnect');
      return { y: Math.round(scrollY), page: r('.tp-ready'), path: r('.path'), back: r('.tp-head .backlink'), pill: r('.tp-conn .v-reconnect'), bar: Math.round(document.getElementById('topbar').getBoundingClientRect().bottom), vh: innerHeight, vw: innerWidth, pe: pill && getComputedStyle(pill).pointerEvents };
    });
    const overlaps = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    for (const at of ['top', 'path']) {
      if (at === 'path') await app.page.evaluate(() => document.querySelector('.path .pnode:last-child').scrollIntoView({ block: 'end' }));
      else await app.page.evaluate(() => window.scrollTo(0, 0));
      await app.page.waitForTimeout(200);
      const before = await where();
      await app.page.evaluate(() => window.__bridge.drop());
      await app.page.waitForSelector('.tp-conn .v-reconnect', { timeout: 10000 });
      await app.page.waitForTimeout(400);
      const after = await where();
      const tagAt = `${w}-${at}: `;
      eq(after.y, before.y, tagAt + 'the page did not scroll');
      eq(JSON.stringify([after.page, after.path]), JSON.stringify([before.page, before.path]), tagAt + 'nothing moved');
      assert(after.pill.top >= after.bar && after.pill.bottom <= after.vh && after.pill.left >= 0 && after.pill.right <= after.vw, tagAt + 'in view, under the top bar: ' + JSON.stringify(after));
      assert(!overlaps(after.pill, after.back), tagAt + 'not over the back link: ' + JSON.stringify(after));
      eq(after.pe, 'none', tagAt + 'taps go through it');
      assert(/^Reconnecting…/.test(await text(app, '.tp-conn')), tagAt + 'says it is reconnecting: ' + await text(app, '.tp-conn'));
      eq(await count(app, '.tp-conn .btn, .tp-conn .notice.bad'), 0, tagAt + 'calm, nothing to press');
      await shot(app, `check4-topic-parked-${at}-${tag(w, dark)}`, { full: false });
      await app.page.evaluate(() => { window.__bridge.down = false; window.dispatchEvent(new Event('online')); });
      await app.page.waitForFunction(() => !document.querySelector('.tp-conn').children.length, null, { timeout: 8000 });
      eq(JSON.stringify((await where()).path), JSON.stringify(before.path), tagAt + 'nothing moves when it goes');
    }
  }
});

// 5. The warm-up's Next question, Done, Skip (and "Try the warm-up questions") replace the
// button that had focus: focus goes to what replaced it, never to the page's title.
await test('views check 5: after the warm-up\'s Next question, Done or Skip, focus goes to what comes next', async () => {
  const on = (app, sel) => app.page.evaluate((q) => { const a = document.activeElement; return a && a.matches(q) ? (a.textContent || '').trim() : 'focus on ' + (a ? a.tagName + '.' + a.className : 'nothing'); }, sel);
  const app = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56' });
  await app.page.waitForSelector('.tp-warm');
  await app.page.click('.tp-warm .option >> text=The middle note');
  await app.page.click('.tp-warm-check');
  await app.page.waitForSelector('.tp-warm-why');
  assert(await focusedOn(app, '[data-key="warm-next"]'), 'Next question has focus');
  await app.page.keyboard.press('Enter');
  eq(await on(app, '.tp-warm-q'), 'Do people everywhere hear minor keys as sad?', 'the next question has focus');
  await app.page.keyboard.press('Tab');
  assert(await focusedOn(app, '.tp-warm .option'), 'Tab goes on to its answers');
  await app.page.keyboard.press('Enter');
  await app.page.click('.tp-warm-check');
  await app.page.waitForSelector('.tp-warm-why');
  await app.page.keyboard.press('Enter');   // Done
  await app.page.waitForSelector('.tp-warm-done');
  assert((await on(app, '.tp-warm-done')).includes('1 of 2 right'), 'the summary that replaced it has focus: ' + await on(app, '.tp-warm-done'));
  // Skip, then bring the questions back.
  const b = await open({ db: seedDb(), hash: '#/t/minor-keys-ef56' });
  await b.page.waitForSelector('.tp-skip');
  await b.page.focus('.tp-skip');
  await b.page.keyboard.press('Enter');
  await b.page.waitForSelector('.tp-warm-again');
  eq(await on(b, '.tp-warm-again'), 'Try the 2 warm-up questions', 'what replaced the warm-up has focus');
  await b.page.keyboard.press('Tab');
  assert(await focusedOn(b, '.tp-warm-again button'), 'Tab reaches its button');
  await b.page.keyboard.press('Enter');
  await b.page.waitForSelector('.tp-warm-q');
  eq(await on(b, '.tp-warm-q'), 'What changes between a major chord and a minor chord?', 'the first question has focus again');
});

// ---------- v9: how Dan learns a topic, and the intake ----------
await test('v9 topic: the mode shows with a switch for the ideas to come', async () => {
  const db = seedDb();
  const t = db['topics/index-funds-cd34'];
  db['topics/index-funds-cd34'] = { ...t, mode: 'read', intake: { questions: [{ id: 'q1', q: 'What do you want from it?', options: ['Invest my savings', 'Understand the news'], multi: true, other: true }], answers: { q1: { picked: ['Invest my savings'], other: 'a pension' } } } };
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db: JSON.parse(JSON.stringify(db)), hash: '#/t/index-funds-cd34' });
    await app.page.waitForSelector('.tp-mode');
    eq(await app.page.getAttribute('.tp-modes [data-mode=read]', 'aria-checked'), 'true', 'Just teach me, as saved');
    eq(await app.page.getAttribute('.tp-modes', 'role'), 'radiogroup', 'a radio group');
    assert(/Applies to the ideas you have not started yet/.test(await text(app, '.tp-mode')), 'says what a switch changes');
    assert((await text(app, '.tp-told')).includes('Invest my savings; a pension'), 'what he told Claude');
    eq(await app.page.locator('.tp-warm, .tp-warm-again, .tp-warm-done').count(), 0, 'no warm-up questions when he just wants to be taught');
    if (w === 1280) {
      const r = await app.page.evaluate(() => { const m = document.querySelector('.tp-mode').getBoundingClientRect(), p = document.querySelector('.tp-main').getBoundingClientRect(); return m.left > p.right - 1; });
      eq(r, true, 'in the rail on a laptop');
    }
    await app.page.locator('.tp-mode').scrollIntoViewIfNeeded();
    await shot(app, `v9-topic-mode-${tag(w, dark)}`);
    // Switch with the keyboard: the choice and focus move together, and it is saved.
    await app.page.focus('.tp-modes [data-mode=read]');
    await app.page.keyboard.press('ArrowLeft');
    await app.page.waitForFunction(() => { const d = window.__CLAUDE_STUB__.get('topics/index-funds-cd34'); return d && d.mode === 'study'; });
    await app.page.waitForFunction(() => /quick checks/.test(document.querySelector('.tp-mode-note').textContent));
    assert(await focusedOn(app, '.tp-modes [data-mode=study][aria-checked=true]'), 'focus stays on the chosen mode');
    assert(!/just teach me/i.test(await text(app, '.tp-head .eyebrow')), 'the header follows');
    await app.page.click('.tp-modes [data-mode=read]');
    await app.page.waitForFunction(() => window.__CLAUDE_STUB__.get('topics/index-funds-cd34').mode === 'read');
  }
});

await test('v9 topic and map: an idea he only read says "Read", and the Map shows it apart', async () => {
  const db = seedDb();
  const P = `data/users/${UID}/profile/progress/index-funds-cd34`;
  db[P] = { updatedAt: '2026-10-04T19:00:00.000Z', ideas: { a1: { stage: 'done', round: 0, readRound: 0, cardsRound: 0, startedAt: '2026-10-01T10:00:00.000Z', doneAt: '2026-10-01T10:20:00.000Z' }, a2: { stage: 'done', round: 1, readRound: 0, startedAt: '2026-10-02T10:00:00.000Z', doneAt: '2026-10-02T10:20:00.000Z' } } };
  const app = await open({ db, hash: '#/t/index-funds-cd34' });
  await app.page.waitForSelector('.path');
  assert(/^READ · (1 OCT|OCT 1)$/.test(await text(app, '.pnode:nth-child(1) .pnode-kicker')), 'read, never "done" as if tested: ' + await text(app, '.pnode:nth-child(1) .pnode-kicker'));
  assert(/^DONE/.test(await text(app, '.pnode:nth-child(2) .pnode-kicker')), 'a round studied since says done');
  await app.page.evaluate(() => U.go('#/map'));
  await app.page.waitForSelector('.map-svg');
  await app.page.waitForFunction(() => document.querySelectorAll('.map-legend-item').length === 5);
  assert((await text(app, '.map-legend')).includes('Read'), 'the key has Read when there is one');
  const dots = await app.page.$$eval('.map-topic', (ts) => ts.map((t) => [t.querySelector('h2').textContent, [...t.querySelectorAll('.map-node')].map((a) => a.getAttribute('aria-label').split(', ').pop()).join(',')]));
  const funds = dots.find((d) => d[0] === 'How index funds work');
  assert(funds && funds[1].startsWith('read,'), 'the read idea\'s dot says read: ' + JSON.stringify(funds));
  assert((await app.page.locator('.map-topic', { hasText: 'How index funds work' }).innerText()).includes('2 of 5 ideas done'), 'one read and one learned: "done"');
  await shot(app, 'v9-map-read');
  // No read idea anywhere: the key keeps its four.
  const b = await open({ db: seedDb(), hash: '#/map' });
  await b.page.waitForSelector('.map-svg');
  eq(await count(b, '.map-legend-item'), 4, 'four in the key');
});

// ---------- summary ----------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed. Screenshots: tests/out/views/`);
process.exit(failed.length ? 1 : 0);
