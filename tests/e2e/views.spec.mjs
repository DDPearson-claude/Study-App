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

async function open({ width = 360, dark = false, db = {}, fakes = {}, tools = {}, deny = [], hash = '#/', prefs = null } = {}) {
  const app = await openApp({ width, height: width < 700 ? 707 : 900, dark, file: FILE, config: { db }, tools, deny });
  current.apps.push(app);
  await app.page.addInitScript(installFakes, { review: true, tutor: true, gen: 'fast', bands: SEED.bands, due: 4, ...fakes });
  const p = prefs || (dark ? { theme: 'dark' } : null);
  if (p) await app.page.addInitScript((v) => { try { if (!sessionStorage.getItem('__prefsSet')) { localStorage.setItem('mu-prefs', JSON.stringify(v)); sessionStorage.setItem('__prefsSet', '1'); } } catch (e) {} }, p);
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

await test('shell: on a phone the tab bar sits at the bottom and the settings button is tappable', async () => {
  const app = await open({});
  const r = await app.page.evaluate(() => { const t = document.getElementById('tabs').getBoundingClientRect(); return { bottom: t.bottom, vh: innerHeight }; });
  assert(Math.abs(r.bottom - r.vh) < 2, `tab bar at the bottom (bottom ${r.bottom}, viewport ${r.vh})`);
  await app.page.click('#settings-btn');
  await app.page.waitForSelector('.set');
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
    if (w === 1280) {
      const r = await app.page.evaluate(() => { const a = document.querySelector('.ask').getBoundingClientRect(), b = document.querySelector('.welcome').getBoundingClientRect(); return { gap: b.left - a.right, dy: b.top - a.top }; });
      assert(r.gap >= 0 && Math.abs(r.dy) < 40, `how it works sits beside the ask on a laptop (${JSON.stringify(r)})`);
    }
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
    eq(await text(app, '.pnode.is-current .pnode-kicker'), 'START HERE', 'first idea is marked Start here');
    eq(await text(app, '.pnode.is-current .pnode-btn'), 'Start this idea', 'its button says what it does');
    assert((await text(app, '.tp-cta')).startsWith('Start: Gravity weakens'), 'the header offers the first idea');
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
  const fresh = new Date().toISOString();   // planning right now (an old 'planning' would show as stopped)
  const planning = { id: 'black-holes-zz', title: '', query: 'How black holes form', createdAt: fresh, updatedAt: fresh, status: 'planning', hue: 250, ideas: [] };
  for (const [w, dark] of WIDTHS) {
    const app = await open({ width: w, dark, db: seedDb({ extra: { 'topics/black-holes-zz': planning } }) });
    await app.page.waitForSelector('.ccard');
    eq(await text(app, '.ccard-title'), 'How tides work', 'most recently touched topic');
    assert((await text(app, '.ccard-next')).includes('Idea 3 of 6'), 'next idea shown');
    eq(await app.page.getAttribute('.ccard', 'href'), '#/t/how-tides-work-ab12/i3', 'continue opens the lesson');
    assert((await text(app, '.today-row')).includes('4 reviews ready'), 'Today row');
    if (w === 1280) {
      const r = await app.page.evaluate(() => { const a = document.querySelector('.ask-form').getBoundingClientRect(), b = document.querySelector('.today-row').getBoundingClientRect(), h = document.querySelector('.ask h1').getBoundingClientRect(); return { gap: b.left - a.right, top: b.top - h.top, below: b.top < a.bottom }; });
      assert(r.gap > 0 && r.below && Math.abs(r.top) < 60, `reviews sit beside the ask on a laptop (${JSON.stringify(r)})`);
    }
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
  const now = new Date().toISOString();
  await app.seed('topics/new-one-aa', { id: 'new-one-aa', title: '', query: 'The fall of Rome', createdAt: now, updatedAt: now, status: 'planning', hue: 20, ideas: [] });
  await app.page.waitForSelector('.tcard.is-planning');
  assert((await text(app, '.tcard.is-planning')).includes('The fall of Rome'), 'planning card shows the query');
});

await test('topic: ready page with hook, path and library (no warm-up once started)', async () => {
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
  const today = days[await app.page.evaluate(() => U.today())];
  eq(typeof today === 'object' ? Object.values(today).reduce((a, n) => a + n, 0) : today, 2, 'two minutes logged, idle time ignored');
  eq(Object.keys(today).length, 1, 'kept under this device\'s own key');
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
  await app.page.goto(app.url('#/'));
  await app.page.waitForSelector('.tcard');
  eq(await count(app, '.tcard.is-planning'), 0, 'no endless "Planning…" card on Learn');
  assert((await text(app, '.tcard.is-failed')).includes('Planning stopped'), 'Learn says it stopped');
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
  await app.page.goto(app.url('#/'));
  await app.page.waitForSelector('.tcard');
});

await test('regressions: "Sources checked" only when a source was kept; a check that confirmed none says so plainly', async () => {
  const db = seedDb();
  // Stored as done with 0 sources (before a run that kept none counted as failed), and failed
  // with the reason the source check gives now.
  db['topics/minor-keys-ef56'] = { ...db['topics/minor-keys-ef56'], research: { status: 'done', at: ago(60e3), sources: 0, dropped: 2, error: null } };
  db['topics/index-funds-cd34'] = { ...db['topics/index-funds-cd34'], research: { status: 'failed', at: ago(60e3), sources: 0, dropped: 3, error: 'No source could be confirmed against the pages the search returned.' } };
  const NONE = 'The source check ran but could not confirm a single source, so these lessons are not source-checked.';
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db, tools: { 'Parallel Search': { web_search: () => ({ results: [] }), web_fetch: () => ({}) } } });
    await app.page.waitForSelector('.tcard');
    eq(await app.page.locator('.tcard .src-badge:not(.is-quiet)').count(), 1, 'one Sources checked badge: only the topic that kept sources');
    eq(await app.page.locator('.tcard[href="#/t/how-tides-work-ab12"] .src-badge').count(), 1, 'the topic with 4 sources keeps its badge');
    eq(await app.page.locator('.tcard[href="#/t/minor-keys-ef56"] .src-badge').count(), 0, 'done with 0 sources: no badge');
    eq(await app.page.locator('.tcard[href="#/t/index-funds-cd34"] .src-badge').count(), 0, 'confirmed none: no badge');
    for (const tid of ['minor-keys-ef56', 'index-funds-cd34']) {
      await app.page.goto(app.url('#/t/' + tid));
      await app.page.waitForSelector('.path');
      await app.page.waitForFunction(() => /could not confirm/.test(document.querySelector('.lib-status').textContent));
      const lib = await text(app, '.lib-status');
      assert(lib.includes(NONE), tid + ': says plainly that nothing was confirmed: ' + lib);
      assert(!/Sources checked|did not finish/.test(lib), tid + ': neither "Sources checked" nor "did not finish": ' + lib);
      eq(await count(app, '.lib-retry'), 1, tid + ': offers to check again');
      await app.page.locator('.tp-lib').scrollIntoViewIfNeeded();
      await shot(app, `topic-sources-none-${tid.split('-')[0]}-${tag(w, dark)}`, { full: w > 700 });
    }
    // The topic with kept sources is unchanged.
    await app.page.goto(app.url('#/t/how-tides-work-ab12'));
    await app.page.waitForSelector('.path');
    await app.page.waitForFunction(() => /Sources checked · 4 sources/.test(document.querySelector('.lib-status').textContent));
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

await test('regressions: a dead subscription shows an error with Try again, never the first-run screen', async () => {
  const app = await open({ db: seedDb() });
  await app.page.waitForSelector('.tcard');
  await app.page.evaluate(() => {
    const real = U.rt.db;
    const dying = (ref, code) => new Proxy(ref, { get(t, k) {
      if (k === 'onSnapshot') return (next, error) => { setTimeout(() => error && error({ code, message: 'listener stopped' }), 10); return () => {}; };
      if (k === 'orderBy' || k === 'where' || k === 'limit') return (...a) => dying(t[k](...a), code);
      const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
    } });
    U.rt.db = { doc: (p) => dying(real.doc(p), 'revoked'), collection: (p) => dying(real.collection(p), 'unavailable') };
  });
  await app.page.evaluate(() => U.go('#/map'));
  await app.page.evaluate(() => U.go('#/'));
  await app.page.waitForSelector('.learn-topics .v-load-error');
  assert(!/starts here/.test(await text(app, '.learn-topics')), 'not the welcome');
  assert(/Reconnecting/.test(await text(app, '.learn-topics')), 'says it is reconnecting first');
  await app.page.waitForFunction(() => /could not be loaded/.test(document.querySelector('.learn-topics').textContent), null, { timeout: 8000 });
  eq(await count(app, '.learn-topics .btn >> text=Try again'), 1, 'then Try again');
  await shot(app, 'regress-learn-dead-subscription-360-light');
  await app.page.evaluate(() => U.go('#/t/how-tides-work-ab12'));
  await app.page.waitForSelector('.tp .v-load-error');
  eq(await count(app, '.tp .skeleton'), 0, 'no endless skeleton on the topic page');
});

await test('regressions: bad addresses go home or say "not here"', async () => {
  const app = await open({ db: seedDb(), hash: '#/t/how-tides-work-ab12' });
  await app.page.waitForSelector('.path');
  await app.page.evaluate(() => { location.hash = '#/t/how-tides-work-ab12%E0%A4%A'; });
  await app.page.waitForFunction(() => location.hash === '#/');
  await app.page.waitForSelector('.ask');
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
  const app = await open({ db, hash: '#/book' });
  await app.page.waitForSelector('.book-entry');
  const first = app.page.locator('.book-entry').first();
  assert((await first.locator('.is-first').innerText()).includes('First explanation.'), 'first by time');
  assert((await first.locator('.is-latest').innerText()).includes('Second explanation'), 'latest by time');
  eq(await text(app, '.book-q'), 'Newest question?', 'newest question first');
});

await test('a11y: each screen takes focus on its h1, names itself, and the view is not one live region', async () => {
  const app = await open({ db: seedDb() });
  await app.page.waitForSelector('.tcard');
  eq(await app.page.getAttribute('#view', 'aria-live'), null, 'no aria-live on the whole view');
  eq(await app.page.getAttribute('html', 'lang'), 'en-GB', 'language set');
  await app.page.click('.tab[data-tab="map"]');
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
  await app.page.waitForSelector('.tcard');
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

await test('ux2: planning and failed topics get a proper title, the topic page\'s words, a red Delete and a time note', async () => {
  const fresh = new Date().toISOString(), old = ago(3 * 60e3);
  const db = {
    'topics/holes-zz': { id: 'holes-zz', title: '', query: 'how black holes form', createdAt: fresh, updatedAt: fresh, status: 'planning', hue: 250, ideas: [] },
    'topics/roads-zz': { id: 'roads-zz', title: '', query: 'how the romans built roads', createdAt: old, updatedAt: old, status: 'failed', error: 'Claude is busy right now.', hue: 30, ideas: [] },
    'topics/rome-zz': { id: 'rome-zz', title: '', query: 'the fall of rome', createdAt: old, updatedAt: old, status: 'planning', hue: 20, ideas: [] },
  };
  for (const [w, dark] of [[360, false], [1280, true]]) {
    const app = await open({ width: w, dark, db });
    await app.page.waitForSelector('.tcard.is-failed');
    eq(await text(app, '.tcard.is-planning .tcard-title'), 'How black holes form', 'planning card titled like the topic page');
    const failed = await text(app, '.tcard[href="#/t/roads-zz"]'), stuck = await text(app, '.tcard[href="#/t/rome-zz"]');
    assert(failed.startsWith('How the romans built roads') && failed.includes('Planning did not finish. Open it to try again.'), 'failed card: ' + failed);
    assert(stuck.startsWith('The fall of rome') && stuck.includes('Planning stopped. Open it to try again.'), 'stopped card: ' + stuck);
    await app.page.evaluate(() => U.go('#/t/roads-zz'));
    await app.page.waitForSelector('.tp-failed');
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

await test('ux2: a long question wraps in the ask box (up to three lines), and Enter still asks', async () => {
  const LONG = 'How do vaccines train the immune system to remember a virus it has never met before';
  for (const w of [360, 1280]) {
    const app = await open({ width: w, db: seedDb() });
    await app.page.waitForSelector('.tcard');
    eq(await app.page.evaluate(() => document.getElementById('ask-input').tagName), 'TEXTAREA', 'a box that wraps');
    const one = await app.page.evaluate(() => document.getElementById('ask-input').getBoundingClientRect().height);
    await app.page.fill('#ask-input', LONG);
    const m = await app.page.evaluate(() => { const i = document.getElementById('ask-input'), cs = getComputedStyle(i); return { h: i.getBoundingClientRect().height, sw: i.scrollWidth, cw: i.clientWidth, line: parseFloat(cs.lineHeight), go: document.querySelector('.ask-go').getBoundingClientRect().bottom, bottom: i.getBoundingClientRect().bottom }; });
    assert(m.sw <= m.cw, `no sideways scroll (${m.sw} > ${m.cw})`);
    assert(m.h > one + m.line * 0.9 && m.h <= one + m.line * 2 + 2, `grows by whole lines, to three at most (${one} -> ${m.h})`);
    assert(Math.abs(m.go - m.bottom) < 2, 'the go button stays beside the last line');
    if (w === 360) await shot(app, 'ux2-ask-long-360-light', { full: false });
    await app.page.press('#ask-input', 'Enter');
    await app.page.waitForSelector('.tp-planning');
    eq((await app.page.evaluate(() => window.__calls.gen))[0].query, LONG, 'Enter asks, with no new line added');
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

await test('ux2: the Today badge sits on the clock\'s corner at every text size', async () => {
  for (const size of ['m', 'xl']) {
    const app = await open({ db: seedDb(), prefs: { theme: 'light', size } });
    await app.page.waitForSelector('#today-badge:not([hidden])');
    const r = await app.page.evaluate(() => { const i = document.querySelector('.tab[data-tab="today"] svg').getBoundingClientRect(), b = document.getElementById('today-badge').getBoundingClientRect(); return { left: (b.left - i.left) / i.width, bottom: (b.bottom - i.top) / i.height }; });
    assert(r.left >= 0.75 && r.bottom <= 0.6, `badge in the icon's top-right corner at ${size} (${JSON.stringify(r)})`);
    if (size === 'xl') await shot(app, 'ux2-badge-360-xl', { full: false });
  }
});

await test('ux2: on a laptop every tab screen starts at the same left edge', async () => {
  const app = await open({ width: 1280, db: seedDb() });
  await app.page.waitForSelector('.tcard');
  const lefts = {};
  for (const [hash, sel] of [['#/', '.ask h1'], ['#/today', '#fake-today'], ['#/map', '.map h1'], ['#/book', '.book h1']]) {
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

// ---------- summary ----------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed. Screenshots: tests/out/views/`);
process.exit(failed.length ? 1 : 0);
