#!/usr/bin/env node
// Browser tests for course pictures (35-art.js): drawn through the Hugging Face connector
// ('Claude MCP', Z-Image Turbo) for every planned course, one at a time, and shown on the covers
// (Learn, the topic page), in Settings and as the dossier's frontispiece. Asked once on Learn;
// off means hidden and never drawn; a refused connector stops the queue; a failure is said only
// where Dan asked; deleting a course takes its picture unless its dossier is kept.
// The full build, with the stub runtime. Screenshots land in tests/out/art/.
// Usage: node tests/e2e/art.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { openApp, readJson, taskOf, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'art.html');
const SHOTS = join(ROOT, 'tests', 'out', 'art');
const UID = 'u_stubuser0000000000000000';
const SEED = readJson('tests/fixtures/views-seed.json');
const FILTER = process.argv[2] || '';
const SERVER = 'Claude MCP', TOOL = 'gr1_z_image_turbo_generate';

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
    results.push({ name, ok: false, err: e });
    console.log(`FAIL  ${name}\n      ${String(e && e.stack || e).split('\n').slice(0, 4).join('\n      ')}`);
  } finally {
    for (const app of current.apps) await app.close().catch(() => {});
  }
}

// ---------- a real picture: a 1280x720 PNG (a watercolour-ish gradient), built here ----------
function png(w, h, hue) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * (w * 3 + 1) + 1 + x * 3;
      raw[o] = 235 - Math.round(60 * y / h); raw[o + 1] = 222 - Math.round((40 + hue) * x / w); raw[o + 2] = 190 + Math.round(40 * Math.sin(x / 40 + hue));
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]).toString('base64');
}
const PICS = [png(1280, 720, 0), png(1280, 720, 30)];

// ---------- fixtures ----------
const P = (rest) => `data/users/${UID}/profile/${rest}`;
function seedDb({ prefs, extra } = {}) {
  const db = {};
  for (const tid of Object.keys(SEED.topics)) db['topics/' + tid] = SEED.topics[tid];
  for (const [tid, v] of Object.entries(SEED.progress)) db[P('progress/' + tid)] = v;
  db[`data/users/${UID}/profile`] = { prefs: Object.assign({ size: 'm', theme: 'light', easy: false, cap: 15, light: false }, prefs || {}), days: {}, createdAt: '2026-09-01T08:00:00.000Z' };
  Object.assign(db, extra || {});
  return db;
}
const TIDS = Object.keys(SEED.topics);

// The connector: answers like the real Space (an image block, its URL and the seed as text),
// after a moment; counts calls and how many ran at once.
function connector({ fail = null, ms = 150 } = {}) {
  const c = { calls: [], running: 0, most: 0, n: 0 };
  c.tools = { [SERVER]: { [TOOL]: async (input) => {
    c.calls.push(input);
    c.running++; c.most = Math.max(c.most, c.running);
    await new Promise((r) => setTimeout(r, ms));
    c.running--;
    if (fail) throw fail;
    const pic = PICS[c.n++ % PICS.length];
    return { __result: { content: [
      { type: 'image', data: pic, mimeType: 'image/png' },
      { type: 'text', text: 'Image URL: https://mcp-tools-z-image-turbo.hf.space/gradio_api/file=/tmp/gradio/abc/image.webp' },
      { type: 'text', text: 'The seed used for generation was' + (553645 + c.n) },
    ] } };
  } } };
  return c;
}
const scenes = [];
function sample(input) {
  const task = taskOf(input);
  if (task === 'cover-picture') {
    const title = (String(input).match(/Title: (.*)/) || [])[1] || '';
    scenes.push(title);
    return { scene: 'A quiet harbour wall at dusk with fishing boats resting on wet sand, rock pools and a pale moon above calm water (' + title + ')' };
  }
  throw new Error('unexpected sample task ' + task);
}

async function open({ width = 390, height = 844, dark = false, db = seedDb(), hash = '#/', tools = {}, permissions = null } = {}) {
  const app = await openApp({ width, height, dark, file: FILE, config: permissions ? { db, permissions } : { db }, sample, tools });
  current.apps.push(app);
  await app.page.goto(app.url(hash));
  await app.booted();
  return app;
}
const doc = (app, p) => app.page.evaluate((x) => { const d = window.__CLAUDE_STUB__.get(x); return d === undefined ? null : d; }, p);
const go = (app, h) => app.page.evaluate((x) => U.go(x), h);
const ready = (app, n) => app.page.waitForFunction((k) => Object.entries(window.__CLAUDE_STUB__.dump()).filter(([p, d]) => /^art\/[^/]+$/.test(p) && d.status === 'ready').length >= k, n, { timeout: 30000 });
const covers = (app, sel) => app.page.$$eval(sel + ' svg.cover', (l) => l.map((s) => { const i = s.querySelector('image.cv-art'); return i ? i.getAttribute('href') : null; }));
async function shot(app, name) { await app.page.waitForTimeout(400); await app.page.screenshot({ path: join(SHOTS, name + '.png'), fullPage: true }); }
const artDoc = (tid, src, extra) => ({ status: 'ready', src: src || 'data:image/png;base64,' + PICS[0], scene: 'A quiet harbour', model: 'Z-Image Turbo', at: '2026-10-06T08:00:00.000Z', ...(extra || {}) });

// =========================================================================================
await test('pictures on: every planned course gets one, drawn one at a time, shown on its cover', async () => {
  const con = connector();
  const app = await open({ db: seedDb({ prefs: { pictures: true } }), tools: con.tools });
  await ready(app, TIDS.length);
  eq(con.calls.length, TIDS.length, 'one call per course');
  eq(con.most, 1, 'never two at once');
  for (const input of con.calls) {
    eq(input.resolution, '1280x720 ( 16:9 )', 'a wide picture');
    eq(input.random_seed, true, 'a fresh seed');
    assert(/^A quiet harbour wall at dusk .*\. Illustration in the style of a naturalist's field journal/.test(input.prompt), 'the scene, then the house style: ' + input.prompt.slice(0, 120));
    assert(/No text, no letters/.test(input.prompt), 'no text asked for');
  }
  for (const tid of TIDS) {
    const d = await doc(app, 'art/' + tid);
    assert(/^data:image\/(webp|jpeg);base64,/.test(d.src), tid + ': re-encoded small: ' + d.src.slice(0, 30));
    assert(d.src.length < 190000, tid + ': under the limit: ' + d.src.length);
    assert(/^A quiet harbour wall/.test(d.scene) && d.model === 'Z-Image Turbo' && d.seed > 553645 && !d.by, tid + ': scene, model, seed, no holder: ' + JSON.stringify({ ...d, src: '' }));
  }
  // Every course card shows its own picture (the continue card too).
  await app.page.waitForFunction((n) => document.querySelectorAll('.tgrid svg.cover image.cv-art').length >= n, TIDS.length, { timeout: 10000 });
  const hrefs = await covers(app, '.tgrid');
  assert(hrefs.every((h) => /^data:image\//.test(h || '')), 'every card has a picture');
  const size = await app.page.$eval('.tgrid svg.cover image.cv-art', (i) => { const r = i.getBoundingClientRect(); return [r.width, r.height]; });
  assert(size[0] > 40 && size[1] > 40, 'drawn at a real size: ' + size);
  await shot(app, 'learn-390');
  // The topic page: the banner, and the line that says what it is.
  await go(app, '#/t/' + TIDS[0]);
  await app.page.waitForSelector('.tp-banner svg.cover image.cv-art');
  const line = await app.page.locator('.tp-art').innerText();
  assert(/drawn by an image model, for decoration only/.test(line) && /Draw a new one/.test(line), 'said plainly: ' + line);
  await shot(app, 'topic-390');
  // Dark mode: a little dimmer.
  const dark = await open({ dark: true, width: 1280, height: 900, db: seedDb({ prefs: { pictures: true, theme: 'dark' }, extra: Object.fromEntries(TIDS.map((t) => ['art/' + t, artDoc(t)])) }), tools: con.tools });
  await dark.page.waitForSelector('.tgrid svg.cover image.cv-art');
  await dark.page.waitForTimeout(900);   // the fade-in as the pictures arrive
  eq(await dark.page.$eval('.tgrid svg.cover image.cv-art', (i) => getComputedStyle(i).opacity), '0.86', 'dimmer in dark mode');
  await shot(dark, 'learn-1280-dark');
  eq(con.calls.length, TIDS.length, 'courses that have a picture are not drawn again');
});

await test('not asked yet: Learn asks once, below the topics; "No thanks" turns them off for good', async () => {
  const con = connector();
  const app = await open({ tools: con.tools });
  await app.page.waitForSelector('.art-invite');
  const box = await app.page.evaluate(() => { const a = document.querySelector('.learn-art').getBoundingClientRect().top, t = document.querySelector('.learn-topics').getBoundingClientRect().bottom; return a >= t - 1; });
  assert(box, 'below his topics, never in the way');
  assert(/Pictures for your courses/.test(await app.page.locator('.art-invite').innerText()), 'the invitation');
  await shot(app, 'invite-390');
  await app.page.locator('.art-invite button', { hasText: 'No thanks' }).click();
  await app.page.waitForFunction(() => !document.querySelector('.art-invite'));
  await app.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.prefs && d.prefs.pictures === false; }, `data/users/${UID}/profile`, { timeout: 10000 });
  await app.page.waitForTimeout(1200);
  eq(con.calls.length, 0, 'nothing drawn');
  // (The stub's db starts afresh on a reload, so Learn is left and opened again instead.)
  await go(app, '#/map');
  await app.page.waitForTimeout(300);
  await go(app, '#/');
  await app.page.waitForSelector('.tgrid .tcard');
  await app.page.waitForTimeout(800);
  eq(await app.page.locator('.art-invite').count(), 0, 'never asked again');
});

await test('"Draw the pictures" turns them on and draws one for each course', async () => {
  const con = connector();
  const app = await open({ tools: con.tools });
  await app.page.locator('.art-invite button', { hasText: 'Draw the pictures' }).click();
  await ready(app, TIDS.length);
  await app.page.waitForFunction(() => !document.querySelector('.art-invite'));
  eq((await doc(app, `data/users/${UID}/profile`)).prefs.pictures, true, 'saved as on');
  eq(con.most, 1, 'one at a time');
});

await test('topic page: drawing again keeps the old picture until the new one is saved; a failure is said there, with Try again', async () => {
  const con = connector({ ms: 1200 });
  const old = 'data:image/png;base64,' + PICS[1];
  const db = seedDb({ prefs: { pictures: true }, extra: Object.fromEntries(TIDS.map((t) => ['art/' + t, artDoc(t, old)])) });
  const app = await open({ hash: '#/t/' + TIDS[1], db, tools: con.tools });
  await app.page.waitForSelector('.tp-art .tp-art-btn');
  await app.page.locator('.tp-art-btn', { hasText: 'Draw a new one' }).click();
  await app.page.waitForFunction(() => /Drawing a cover picture/.test((document.querySelector('.tp-art') || {}).textContent || ''));
  eq((await covers(app, '.tp-banner'))[0], old, 'the old picture stays while the new one is drawn');
  await app.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.status === 'ready' && /^data:image\/(webp|jpeg)/.test(d.src); }, 'art/' + TIDS[1], { timeout: 20000 });
  await app.page.waitForFunction(() => /^data:image\/(webp|jpeg)/.test((document.querySelector('.tp-banner image.cv-art') || { getAttribute: () => '' }).getAttribute('href') || ''));
  eq(con.calls.length, 1, 'only the one asked for (the others already have pictures)');
  // A connector failure: said on the topic page, with a way to try again; the picture he had stays.
  const bad = connector({ fail: { code: 'tool_error', message: 'GPU quota exceeded' } });
  const b = await open({ hash: '#/t/' + TIDS[2], db, tools: bad.tools });
  await b.page.locator('.tp-art-btn', { hasText: 'Draw a new one' }).click();
  await b.page.waitForFunction(() => /could not be drawn/.test((document.querySelector('.tp-art') || {}).textContent || ''), null, { timeout: 15000 });
  const line = await b.page.locator('.tp-art').innerText();
  assert(/the image model said “GPU quota exceeded”/.test(line) && /Try again/.test(line), 'why, in the model\'s words, and Try again: ' + line);
  const d = await doc(b, 'art/' + TIDS[2]);
  assert(d.status === 'failed' && d.code === 'tool_error' && d.src === old, 'recorded, old picture kept: ' + JSON.stringify({ ...d, src: d.src.slice(0, 22) }));
  eq((await covers(b, '.tp-banner'))[0], old, 'still shown');
  await shot(b, 'topic-failed-390');
  // Learn never shows a picture failure as an error.
  await go(b, '#/');
  await b.page.waitForSelector('.tgrid .tcard');
  await b.page.waitForTimeout(800);
  eq(await b.page.locator('.toast.bad, .toast[data-kind="bad"]').count(), 0, 'no red toast on Learn');
});

await test('a connector that is not allowed stops the queue after one try', async () => {
  const con = connector({ fail: { code: 'not_in_manifest', message: 'declined' } });
  const app = await open({ db: seedDb({ prefs: { pictures: true } }), tools: con.tools });
  await app.page.waitForFunction(() => Object.entries(window.__CLAUDE_STUB__.dump()).some(([p, d]) => /^art\//.test(p) && d.status === 'failed'), null, { timeout: 20000 });
  await app.page.waitForTimeout(3000);
  eq(con.calls.length, 1, 'one call, then no more this visit');
  await go(app, '#/t/' + TIDS[0]);
  await app.page.waitForSelector('.tp-path-sec');
  const failed = (await app.page.evaluate(() => Object.entries(window.__CLAUDE_STUB__.dump()).filter(([p, d]) => /^art\//.test(p) && d.status === 'failed').map(([p]) => p.slice(4))))[0];
  await go(app, '#/t/' + failed);
  await app.page.waitForFunction(() => /not allowed for this app/.test((document.querySelector('.tp-art') || {}).textContent || ''), null, { timeout: 10000 });
});

await test('no connector: never asked, nothing drawn, Settings says how to connect it', async () => {
  const app = await open({ tools: {} });
  await app.page.waitForSelector('.tgrid .tcard');
  await app.page.waitForTimeout(1200);
  eq(await app.page.locator('.art-invite').count(), 0, 'no invitation without the connector');
  await app.page.evaluate(() => U.settings.open());
  await app.page.waitForSelector('.set-switch:has(input[name=pictures])');
  await app.page.click('.set-switch:has(input[name=pictures])');
  await app.page.waitForFunction(() => /Not connected/.test((document.querySelector('.set-art-status') || {}).textContent || ''), null, { timeout: 10000 });
  assert(/Connect Claude MCP/.test(await app.page.locator('.set-art-status').innerText()), 'the steps');
  const left = await app.page.evaluate(() => Object.keys(window.__CLAUDE_STUB__.dump()).filter((p) => /^art\//.test(p)));
  eq(left.length, 0, 'no picture docs');
});

await test('off: pictures hidden and never drawn; Settings turns them on and off again', async () => {
  const con = connector();
  const db = seedDb({ prefs: { pictures: false }, extra: { ['art/' + TIDS[0]]: artDoc(TIDS[0]) } });
  const app = await open({ width: 1280, height: 900, db, tools: con.tools });
  await app.page.waitForSelector('.tgrid .tcard');
  await app.page.waitForTimeout(1000);
  eq(await app.page.locator('svg.cover image.cv-art').count(), 0, 'hidden while off');
  eq(con.calls.length, 0, 'nothing drawn while off');
  await app.page.evaluate(() => U.settings.open());
  await app.page.waitForSelector('.set-switch:has(input[name=pictures])');
  await app.page.click('.set-switch:has(input[name=pictures])');
  await app.page.waitForFunction(() => /Connected/.test((document.querySelector('.set-art-status') || {}).textContent || ''), null, { timeout: 10000 });
  await shot(app, 'settings-1280');
  await ready(app, TIDS.length);
  eq(con.calls.length, TIDS.length - 1, 'drawn for the courses without one');
  await app.page.waitForFunction((n) => document.querySelectorAll('.tgrid svg.cover image.cv-art').length >= n, TIDS.length, { timeout: 10000 });
  await app.page.click('.set-switch:has(input[name=pictures])');
  await app.page.waitForFunction(() => document.querySelectorAll('svg.cover image.cv-art').length === 0, null, { timeout: 5000 });
  eq(await app.page.locator('.set-art-status').innerText(), '', 'no status while off');
});

await test('deleting a course takes its picture, unless its kept dossier still shows it on its title page', async () => {
  const fx = (n) => readJson('tests/fixtures/lesson-ui-' + n + '.json');
  const L = (iid, f) => { const d = JSON.parse(JSON.stringify(fx(f))); d.lesson.iid = iid; return d; };
  const at = (h) => `2026-10-0${h[0]}T${h.slice(1)}:00:00.000Z`;
  const course = (extra) => seedDb({ prefs: { pictures: true }, extra: Object.assign({
    'topics/pendulums': fx('topic'),
    'topics/pendulums/lessons/i1': L('i1', 'pendulum'),
    'topics/pendulums/lessons/i3': L('i3', 'small-swings'),
    [P('progress/pendulums')]: { updatedAt: at('509'), ideas: { i1: { stage: 'done', startedAt: at('508'), doneAt: at('509') }, i3: { stage: 'done', startedAt: at('510'), doneAt: at('511') } } },
    'art/pendulums': artDoc('pendulums'),
  }, Object.fromEntries(TIDS.map((t) => ['art/' + t, artDoc(t)])), extra || {}) });
  const con = connector();
  // Kept: the dossier opens on its title page with the picture taped in.
  const app = await open({ hash: '#/t/pendulums', db: course(), tools: con.tools });
  await app.page.locator('.tp-delete').click();
  await app.page.waitForSelector('.dos-keep');
  await app.page.locator('.sheet-actions .btn', { hasText: 'Delete topic' }).click();
  await app.page.waitForFunction(() => location.hash === '#/', null, { timeout: 20000 });
  eq(await doc(app, 'topics/pendulums'), null, 'the course is gone');
  assert(await doc(app, 'art/pendulums'), 'its picture stays with the kept dossier');
  await go(app, '#/book/pendulums/contents');
  await app.page.waitForSelector('.d-front:not([hidden]) img', { timeout: 15000 });
  assert(/^data:image\//.test(await app.page.getAttribute('.d-front img', 'src')), 'the frontispiece');
  assert(/drawn for this course by an image model/.test(await app.page.locator('.d-front figcaption').innerText()), 'said to be drawn by an image model');
  await shot(app, 'dossier-title-390');
  // Opened straight from a link: the plate appears when the picture arrives.
  const c = await open({ hash: '#/book/pendulums/contents', db: course(), tools: con.tools });
  await c.page.waitForSelector('.d-front:not([hidden]) img', { timeout: 15000 });
  // Not kept: the picture goes too.
  const b = await open({ hash: '#/t/pendulums', db: course(), tools: con.tools });
  await b.page.locator('.tp-delete').click();
  await b.page.locator('.dos-keep-opt[data-keep="false"]').click();
  await b.page.locator('.sheet-actions .btn', { hasText: 'Delete topic' }).click();
  await b.page.waitForFunction(() => !window.__CLAUDE_STUB__.get('art/pendulums'), null, { timeout: 20000 });
  assert(await doc(b, 'art/' + TIDS[0]), 'other courses keep theirs');
  eq(con.calls.length, 0, 'no picture drawn: every course already had one');
});

const PERM = 'mcp:Claude MCP';
const permsCalls = (app) => app.page.evaluate(() => window.__CLAUDE_STUB__.calls.filter((c) => c.kind === 'permissions').length);

await test('consent first: nothing is drawn while the connector\'s prompt is open; once allowed, it is', async () => {
  const con = connector();
  const app = await open({ tools: con.tools, permissions: { states: { [PERM]: 'prompt' }, answer: { [PERM]: 'granted' }, delayMs: 2500 } });
  await app.page.locator('.art-invite button', { hasText: 'Draw the pictures' }).focus();
  await app.page.keyboard.press('Enter');
  await app.page.waitForTimeout(1800);
  eq(con.calls.length, 0, 'no call while he is still reading the prompt');
  eq(await app.page.evaluate(() => U.settings.prefs.pictures), undefined, 'not on until he allows it');
  await ready(app, TIDS.length);
  eq(await permsCalls(app), 1, 'asked once');
  const note = await app.page.evaluate(() => [document.activeElement.className, document.activeElement.textContent]);
  assert(/art-note/.test(note[0]) && /Pictures are on/.test(note[1]), 'his answer said back, with focus on it: ' + note);
});

await test('refused: no pictures, said back; Settings shows "Not allowed" and Open permissions puts it right', async () => {
  const con = connector();
  const app = await open({ width: 1280, height: 900, tools: con.tools, permissions: { states: { [PERM]: 'prompt' }, answer: { [PERM]: 'denied' }, afterManage: { [PERM]: 'granted' } } });
  await app.page.locator('.art-invite button', { hasText: 'Draw the pictures' }).click();
  await app.page.waitForSelector('.art-note');
  assert(/not allowed for this app\. Settings shows how to allow it/.test(await app.page.locator('.art-note').innerText()), 'said back');
  await app.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.prefs && d.prefs.pictures === false; }, `data/users/${UID}/profile`, { timeout: 10000 });
  eq(con.calls.length, 0, 'nothing drawn');
  await app.page.evaluate(() => U.settings.open());
  await app.page.waitForFunction(() => /Not allowed for this app/.test((document.querySelector('.set-art-status') || {}).textContent || ''), null, { timeout: 10000 });
  await shot(app, 'settings-denied-1280');
  await app.page.locator('.set-art-status button', { hasText: 'Open permissions' }).click();
  await ready(app, TIDS.length);
  eq(await app.page.isChecked('input[name=pictures]'), true, 'the switch is on');
  await app.page.waitForFunction(() => /Connected/.test((document.querySelector('.set-art-status') || {}).textContent || ''), null, { timeout: 10000 });
});

await test('closed without choosing: nothing changes and the card stays to answer later', async () => {
  const con = connector();
  const app = await open({ tools: con.tools, permissions: { states: { [PERM]: 'prompt' } } });
  await app.page.locator('.art-invite button', { hasText: 'Draw the pictures' }).click();
  await app.page.waitForTimeout(800);
  eq(await app.page.locator('.art-invite button:not([disabled])').count(), 2, 'the card is still there to answer');
  eq(await app.page.evaluate(() => U.settings.prefs.pictures), undefined, 'still not asked');
  eq(con.calls.length, 0, 'nothing drawn');
});

await test('unattended drawing never asks: pictures on, but the connector not yet allowed here', async () => {
  const con = connector();
  const app = await open({ db: seedDb({ prefs: { pictures: true } }), tools: con.tools, permissions: { states: { [PERM]: 'prompt' } } });
  await app.page.waitForSelector('.tgrid .tcard');
  await app.page.waitForTimeout(2500);
  eq(con.calls.length, 0, 'no unattended call that would open the prompt');
  eq(await permsCalls(app), 0, 'and no request either');
});

await test('a double tap on "Draw a new one" draws once; focus stays in the foot', async () => {
  const con = connector({ ms: 1000 });
  const db = seedDb({ prefs: { pictures: true }, extra: Object.fromEntries(TIDS.map((t) => ['art/' + t, artDoc(t)])) });
  const app = await open({ hash: '#/t/' + TIDS[0], db, tools: con.tools });
  const btn = app.page.locator('.tp-art-btn', { hasText: 'Draw a new one' });
  await btn.focus();
  await app.page.keyboard.press('Enter');
  await app.page.keyboard.press('Enter');
  await app.page.waitForFunction(() => /Drawing a cover picture/.test((document.querySelector('.tp-art') || {}).textContent || ''));
  eq(await app.page.evaluate(() => !!(document.activeElement && document.activeElement.closest('.tp-foot'))), true, 'focus stays in the foot while it draws');
  await app.page.waitForFunction(() => /Draw a new one/.test((document.querySelector('.tp-art') || {}).textContent || ''), null, { timeout: 20000 });
  eq(con.calls.length, 1, 'one draw for two taps');
  eq(await app.page.evaluate(() => !!(document.activeElement && document.activeElement.closest('.tp-foot'))), true, 'and after');
});

console.log('\n' + results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`).join('\n'));
process.exit(results.every((r) => r.ok) ? 0 : 1);
