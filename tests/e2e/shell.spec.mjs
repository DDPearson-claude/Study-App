#!/usr/bin/env node
// Browser tests for the app shell (00-core.js, 74-settings.js, 99-boot.js, 10-base.css) on the
// complete build with the runtime stubbed. Checks: toasts stay visible above an open sheet (phone
// and laptop); Map idea dots route through U.go even where the viewer cancels link clicks; reading
// settings changed while the app is still opening (or when the profile cannot be read) keep the
// device's other settings and reach the profile; playing with an interactive counts as study time
// (its hidden self-test frames do not); the Settings radio groups are one Tab stop each and follow
// the arrow keys; a change that could not be saved before the app was closed is sent when it opens
// again (the outbox kept on the device).
// Usage: node tests/e2e/shell.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { openApp, readJson, taskOf, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'shell.html');
const UID = 'u_stubuser0000000000000000';
const PROFILE = `data/users/${UID}/profile`;
const FILTER = process.argv[2] || '';
const SEED = readJson('tests/fixtures/views-seed.json');
const TOPIC = readJson('tests/fixtures/lesson-ui-topic.json');
const PENDULUM = readJson('tests/fixtures/lesson-ui-pendulum.json');

const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);

// ---------- tiny runner ----------
const results = [];
let current = null;
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Waits until the page has stopped scrolling (the lesson scrolls itself to each new step, and a
// scroll counts as Dan being there).
async function scrollIdle(page) {
  let last = null, same = 0;
  for (let i = 0; i < 60 && same < 5; i++) {
    const y = await page.evaluate(() => window.scrollY);
    same = y === last ? same + 1 : 0; last = y;
    await sleep(100);
  }
}

function seedDb(extra = {}) {
  const db = { 'topics/pendulums': TOPIC, 'topics/pendulums/lessons/i1': PENDULUM };
  for (const tid of Object.keys(SEED.topics)) db['topics/' + tid] = SEED.topics[tid];
  for (const [k, v] of Object.entries(SEED.research)) db['topics/' + k.replace('/', '/research/')] = v;
  for (const [tid, v] of Object.entries(SEED.progress)) db[`data/users/${UID}/profile/progress/${tid}`] = v;
  return Object.assign(db, extra);
}

// opts.init runs in the page before any app script (after the stub), e.g. to wrap window.claude.
async function open({ width = 360, height = 760, hash = '#/', db = seedDb(), init = null, initArg = null, local = null, wait = true } = {}) {
  const app = await openApp({ width, height, file: FILE, config: { db }, sample: (input) => (taskOf(input) === 'tutor' ? 'Sure.' : new Promise(() => {})) });
  current.apps.push(app);
  if (local) await app.page.addInitScript((l) => { try { localStorage.setItem('mu-prefs', JSON.stringify(l)); } catch (e) {} }, local);
  if (init) await app.page.addInitScript(init, initArg);
  await app.page.goto(app.url(hash));
  if (wait) await app.page.evaluate(() => U.rt.ready);
  return app;
}

// ---------- toasts over sheets ----------
for (const [width, height, layout] of [[360, 760, 'phone'], [1280, 800, 'laptop']]) {
  await test(`toasts: a result shown while a sheet is open is seen, not hidden under it (${layout})`, async () => {
    const app = await open({ width, height });
    await app.page.locator('.tcard').first().waitFor();
    await app.page.click('#settings-btn');
    await app.page.locator('.sheet').waitFor();
    await app.page.getByRole('button', { name: 'Save a backup' }).click();
    const toast = app.page.locator('.toast');
    await toast.first().waitFor({ timeout: 8000 });
    eq(await toast.first().textContent(), 'Backup saved.', 'the backup result');
    // What is painted on top at three points of the toast (hit-testing skips pointer-events:none,
    // so the toast is made hittable just for this look).
    const hit = await app.page.evaluate(() => {
      const probe = document.createElement('style');
      probe.textContent = '.toast { pointer-events: auto !important; }';
      document.head.appendChild(probe);
      const t = document.querySelector('.toast').getBoundingClientRect(), s = document.querySelector('.sheet').getBoundingClientRect();
      const pts = [[t.left + 6, t.top + 6], [(t.left + t.right) / 2, (t.top + t.bottom) / 2], [t.right - 6, t.bottom - 6]];
      const tops = pts.map(([x, y]) => { const el = document.elementFromPoint(x, y); return el && el.closest('.toast') ? 'toast' : (el && el.className) || 'none'; });
      probe.remove();
      return { tops, toast: [t.top, t.bottom], sheet: [s.top, s.bottom] };
    });
    eq(hit.tops, ['toast', 'toast', 'toast'], 'the toast is on top at every point ' + JSON.stringify(hit));
    if (layout === 'phone') {
      assert(hit.toast[1] <= hit.sheet[0] + 24, 'on a phone it moves up out of the sheet\'s way ' + JSON.stringify(hit));
      eq(await toast.first().evaluate((el) => getComputedStyle(el).pointerEvents), 'none', 'and takes no tap meant for the sheet');
    }
    await app.page.keyboard.press('Escape');
    await app.page.evaluate(() => U.toast('After the sheet.'));
    const back = await app.page.evaluate(() => { const ts = document.querySelectorAll('.toast'); const t = ts[ts.length - 1].getBoundingClientRect(); return { bottom: t.bottom, vh: innerHeight }; });
    assert(back.bottom > back.vh / 2, 'with no sheet open, toasts sit at the bottom again ' + JSON.stringify(back));
  });
}

// On a small phone at the largest text size a long toast would cover the sheet's heading and
// Close for its whole 6-8 s: it is cut to the lines that fit above the heading, and opens on a tap.
for (const [width, height] of [[360, 640], [390, 844]]) {
  await test(`toasts: above a sheet at extra large text, a long toast leaves the sheet's Close in view (${width}x${height})`, async () => {
    const app = await open({ width, height, local: { size: 'xl', theme: 'light' } });
    await app.page.waitForFunction(() => U.boot && U.boot.ready);
    await app.page.click('#settings-btn');
    await app.page.locator('.sheet').waitFor();
    await sleep(400);   // the sheet has slid in
    const LONG = 'Your work could not be saved just now. It will be saved as soon as the connection is back, so keep the app open until then.';
    await app.page.evaluate((t) => { U.toast('An older note.', { ms: 20000 }); U.toast(t, { kind: 'bad', ms: 20000 }); }, LONG);
    await sleep(350);
    const look = () => app.page.evaluate(() => {
      const shown = Array.from(document.querySelectorAll('.toast')).filter((t) => getComputedStyle(t).display !== 'none');
      const t = shown[shown.length - 1], r = t.getBoundingClientRect(), w = t.querySelector('.toast-text');
      const close = document.querySelector('.sheet [aria-label="Close"]').getBoundingClientRect(), h2 = document.querySelector('.sheet h2').getBoundingClientRect();
      return { shown: shown.length, bottom: r.bottom, closeTop: close.top, headTop: h2.top, cls: t.className, whole: w.scrollHeight <= w.clientHeight + 1, pe: getComputedStyle(t).pointerEvents };
    });
    const a = await look();
    eq(a.shown, 1, 'only the newest toast shows above the sheet');
    assert(a.bottom <= a.closeTop && a.bottom <= a.headTop, 'the toast stops above the sheet\'s heading and Close ' + JSON.stringify(a));
    if (width === 360) {
      assert(/is-cut/.test(a.cls) && !a.whole, 'cut to the lines that fit ' + JSON.stringify(a));
      eq(a.pe, 'auto', 'a cut toast takes a tap');
      await app.page.locator('.toast.is-cut').click();
      const b = await look();
      assert(/is-open/.test(b.cls) && b.whole, 'a tap shows all of it ' + JSON.stringify(b));
      await app.page.locator('.toast.is-open').click();
      const c = await look();
      assert(!/is-open/.test(c.cls) && c.bottom <= c.closeTop, 'another tap folds it again ' + JSON.stringify(c));
    }
    await app.page.keyboard.press('Escape');
    await sleep(100);
    const d = await app.page.evaluate(() => { const ts = document.querySelectorAll('.toast'); const t = ts[ts.length - 1], w = t.querySelector('.toast-text'); return { n: ts.length, bottom: t.getBoundingClientRect().bottom, vh: innerHeight, whole: w.scrollHeight <= w.clientHeight + 1, cls: t.className }; });
    assert(d.n === 2 && d.bottom > d.vh / 2 && d.whole && !/is-cut/.test(d.cls), 'with the sheet closed, both toasts sit at the bottom, whole ' + JSON.stringify(d));
  });
}

// ---------- in-app links ----------
await test('Map idea dots route in the app even where the viewer cancels link clicks', async () => {
  const app = await open({
    width: 390, height: 844, hash: '#/map',
    // A stand-in for a viewer that cancels every link click to handle it itself (as in layout.spec).
    init: () => { document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a')) e.preventDefault(); }); },
  });
  const dot = app.page.locator('a.map-node').first();
  await dot.waitFor({ timeout: 8000 });
  const href = await dot.getAttribute('href');
  eq(await dot.evaluate((a) => a.namespaceURI), 'http://www.w3.org/2000/svg', 'the dot is an SVG link');
  await dot.click();
  await app.page.waitForFunction((h) => U.currentHash() === h && document.getElementById('view').dataset.screen === 'lesson', href, { timeout: 5000 });
});

// ---------- reading settings before the profile is known ----------
const SAVED = { theme: 'dark', size: 'xl', easy: true, cap: 30, light: false };
const radioState = (app) => app.page.evaluate(() => Array.from(document.querySelectorAll('.sheet [role=radiogroup]')).map((g) => {
  const c = g.querySelector('[aria-checked=true]');
  return g.getAttribute('aria-label') + '=' + (c ? (c.getAttribute('aria-label') || c.textContent) : '?');
}).concat(['easy=' + document.querySelector('.sheet input[name=easy]').checked]).join(' | '));
const htmlPrefs = (app) => app.page.evaluate(() => ({ theme: document.documentElement.dataset.muTheme, size: document.documentElement.dataset.size, easy: document.documentElement.dataset.easy || null }));

await test('settings changed while the app is still opening keep the others and reach the profile', async () => {
  // The profile and this device both hold dark, extra large, easier reading, 30 a day.
  const app = await open({
    width: 390, height: 844, wait: false, local: SAVED,
    db: seedDb({ [PROFILE]: { prefs: SAVED, days: {}, createdAt: '2026-09-01T00:00:00Z' } }),
    // The user id answers only when the test says so: "Opening your university…" stays up.
    init: () => {
      const real = window.claude;
      let release; const gate = new Promise((r) => { release = r; });
      window.__releaseUid = () => release();
      window.claude = { use: (name) => real.use(name).then((ns) => (name === 'user' && ns ? { ...ns, id: () => gate.then(() => ns.id()) } : ns)) };
    },
  });
  await app.page.locator('.boot-opening').waitFor();
  await app.page.click('#settings-btn');
  await app.page.locator('.sheet').waitFor();
  eq(await radioState(app), 'Appearance=Dark | Text size=Extra large text | Layout=Auto | Most reviews in a day=30 | easy=true', 'the sheet shows this device\'s settings, as painted');
  await app.page.getByRole('radio', { name: 'Large text', exact: true }).click();
  eq(await htmlPrefs(app), { theme: 'dark', size: 'l', easy: '1' }, 'one change leaves the others alone');
  await sleep(1500);
  await app.page.evaluate(() => window.__releaseUid());
  await app.page.waitForFunction(() => U.boot && U.boot.ready);
  await sleep(1500);
  eq(await htmlPrefs(app), { theme: 'dark', size: 'l', easy: '1' }, 'the profile read at boot does not undo it');
  const prof = (await app.stub())[PROFILE];
  eq(prof.prefs, { ...SAVED, size: 'l' }, 'saved to the profile');
  assert(!(await app.page.locator('.toast.bad').count()), 'no error was shown');
});

await test('settings when the profile cannot be read: the device copy stays and one change keeps the others', async () => {
  const app = await open({
    width: 390, height: 844, local: SAVED,
    db: seedDb({ [PROFILE]: { prefs: { ...SAVED, light: true }, days: {}, createdAt: '2026-09-01T00:00:00Z' } }),
    // The first read of the profile is refused.
    init: () => {
      const real = window.claude;
      let failed = false;
      window.claude = { use: (n) => real.use(n).then((ns) => {
        if (n !== 'db' || !ns) return ns;
        return { collection: ns.collection.bind(ns), doc: (p) => {
          const r = ns.doc(p);
          if (!/\/profile$/.test(p)) return r;
          return { ...r, get: () => (failed ? r.get() : (failed = true, Promise.reject({ code: 'permission_denied', message: 'denied' }))), update: (d) => r.update(d), set: (d) => r.set(d), onSnapshot: (a, b) => r.onSnapshot(a, b) };
        } };
      }) };
    },
  });
  await app.page.waitForFunction(() => U.boot && U.boot.ready);
  await sleep(800);
  await app.page.click('#settings-btn');
  await app.page.locator('.sheet').waitFor();
  const shown = await radioState(app);
  assert(/^Appearance=Dark \| Text size=Extra large text \| Layout=Auto \| Most reviews in a day=30 \| easy=true$/.test(shown), 'not the defaults: ' + shown);
  await app.page.getByRole('radio', { name: 'Match system' }).click();
  await sleep(600);
  eq(await htmlPrefs(app), { theme: 'system', size: 'xl', easy: '1' }, 'size and easier reading stay');
  const prefs = (await app.stub())[PROFILE].prefs;
  eq([prefs.theme, prefs.size, prefs.easy, prefs.cap], ['system', 'xl', true, 30], 'only the change is saved over the profile');
  eq(await app.page.evaluate(() => U.settings.prefs.light), true, 'and the profile itself still arrives once it can be read (Light days on)');
});

// ---------- study time ----------
await test('playing with the interactive counts as study time; hidden self-test frames do not', async () => {
  const app = await open({ width: 390, height: 844, hash: '#/t/pendulums/i1' });
  const p = app.page;
  await p.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor({ timeout: 15000 });
  await p.locator('.option').nth(1).click();
  await p.getByRole('button', { name: 'That\'s my guess' }).click();
  await p.locator('.lsn-panel iframe.kit-iframe').first().waitFor({ timeout: 15000 });
  await p.waitForFunction(() => document.querySelector('.kit-frame') && document.querySelector('.kit-frame').dataset.state !== 'loading', null, { timeout: 15000 });
  await scrollIdle(p);
  const old = Date.now() - 100000;
  await p.evaluate((t) => { U.boot.study.lastInput = t; }, old);
  // A hidden self-test frame (as U.sandbox.test makes) whose kit reports a change: not Dan.
  await p.evaluate(() => {
    const f = document.createElement('iframe');
    f.className = 'kit-test'; f.setAttribute('sandbox', 'allow-scripts'); f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none;z-index:-1;border:0';
    f.srcdoc = '<script>setTimeout(function(){parent.postMessage({src:"kit",type:"change",params:{},outputs:{}},"*")},50)<\/script>';
    document.body.appendChild(f);
  });
  await sleep(600);
  eq(await p.evaluate(() => U.boot.study.lastInput), old, 'a hidden frame does not count');
  // Dan moves the slider inside the interactive (keys go to the frame; the page sees nothing).
  const fl = p.frameLocator('.lsn-panel iframe.kit-iframe');
  const range = fl.locator('input[type=range]').first();
  await range.focus();
  await scrollIdle(p);
  await p.evaluate((t) => { U.boot.study.lastInput = t; }, old);
  await p.keyboard.press('ArrowRight');
  await p.keyboard.press('ArrowRight');
  await sleep(800);
  const after = await p.evaluate(() => U.boot.study.lastInput);
  assert(after > old + 90000, 'a change in the interactive counts as activity: ' + (Date.now() - after) + ' ms ago');
});

// ---------- radio groups ----------
await test('settings radio groups: one Tab stop each, arrow keys move the choice and wrap', async () => {
  const app = await open({ width: 390, height: 844 });
  await app.page.locator('.tcard').first().waitFor();
  await app.page.click('#settings-btn');
  await app.page.locator('.sheet').waitFor();
  await sleep(200);
  const stops = await app.page.evaluate(() => Array.from(document.querySelectorAll('.sheet [role=radiogroup]')).map((g) => {
    const t = Array.from(g.querySelectorAll('[role=radio]')).filter((b) => b.tabIndex >= 0);
    return t.length === 1 && t[0].getAttribute('aria-checked') === 'true';
  }));
  eq(stops, [true, true, true, true], 'each group is one Tab stop, on its checked option');
  const look = app.page.getByRole('radiogroup', { name: 'Appearance' });
  await look.getByRole('radio', { name: 'Light' }).focus();
  const focused = () => app.page.evaluate(() => (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent) + ':' + document.activeElement.getAttribute('aria-checked'));
  await app.page.keyboard.press('ArrowRight');
  eq(await focused(), 'Dark:true', 'ArrowRight picks and focuses the next option');
  eq(await app.page.evaluate(() => document.documentElement.dataset.muTheme), 'dark', 'and applies it');
  await app.page.keyboard.press('ArrowDown');
  eq(await focused(), 'Match system:true', 'ArrowDown too');
  await app.page.keyboard.press('ArrowRight');
  eq(await focused(), 'Light:true', 'wrapping round to the first');
  await app.page.keyboard.press('ArrowLeft');
  eq(await focused(), 'Match system:true', 'ArrowLeft goes back, wrapping');
  eq(await look.evaluate((g) => Array.from(g.querySelectorAll('[role=radio]')).map((b) => b.tabIndex)), [-1, -1, 0], 'the Tab stop follows the choice');
  await app.page.keyboard.press('Tab');
  eq(await app.page.evaluate(() => document.activeElement.closest('[role=radiogroup]') && document.activeElement.closest('[role=radiogroup]').getAttribute('aria-label')), 'Text size', 'Tab leaves the group for the next one');
  await sleep(500);
  eq((await app.stub())[PROFILE].prefs.theme, 'system', 'the last choice is saved');
});

// ---------- the outbox outlives the page ----------
await test('a setting that could not be saved before the app closed is saved when it opens again', async () => {
  const app = await open({
    width: 390, height: 844,
    db: seedDb({ [PROFILE]: { prefs: { theme: 'light', size: 'm', easy: false, cap: 15, light: false }, days: {}, createdAt: '2026-09-01T00:00:00Z' } }),
    // Writes to the profile fail as a dead bridge does while sessionStorage 'test-down' is '1'.
    init: () => {
      const real = window.claude;
      const down = () => { try { return sessionStorage.getItem('test-down') === '1'; } catch (e) { return false; } };
      const unav = () => Promise.reject({ code: 'unavailable', message: 'bridge not responding' });
      window.claude = { use: (n) => real.use(n).then((ns) => {
        if (n !== 'db' || !ns) return ns;
        return { collection: ns.collection.bind(ns), doc: (p) => {
          const r = ns.doc(p);
          if (!/\/profile$/.test(p)) return r;
          return { ...r, get: () => r.get(), onSnapshot: (a, b) => r.onSnapshot(a, b), update: (d) => (down() ? unav() : r.update(d)), set: (d) => (down() ? unav() : r.set(d)) };
        } };
      }) };
    },
  });
  const p = app.page;
  await p.waitForFunction(() => U.boot && U.boot.ready);
  await p.evaluate(() => sessionStorage.setItem('test-down', '1'));
  await p.click('#settings-btn');
  await p.locator('.sheet').waitFor();
  await p.getByRole('radio', { name: 'Large text', exact: true }).click();
  const notice = p.locator('.toast.bad');
  await notice.first().waitFor({ timeout: 8000 });
  assert(/keep the app open/i.test(await notice.first().textContent()), 'the notice asks to keep the app open, not that the work is kept: ' + await notice.first().textContent());
  const kept = await p.evaluate((uid) => Object.keys(localStorage).filter((k) => k.startsWith('mu.outbox.' + uid + '.')).map((k) => JSON.parse(localStorage.getItem(k))), UID);
  eq(kept.map((o) => o.docs[PROFILE] && o.docs[PROFILE].prefs.size), ['l'], 'the held write is kept on the device');
  eq((await app.stub())[PROFILE].prefs.size, 'm', 'and has not reached the profile');

  // The app is closed and opened again (here: reloaded, with the same db) once the bridge is back.
  await p.evaluate(() => sessionStorage.setItem('test-down', '0'));
  await p.reload();
  await p.waitForFunction(() => U.boot && U.boot.ready);
  await p.waitForFunction((path) => { const d = window.__CLAUDE_STUB__.dump()[path]; return d && d.prefs && d.prefs.size === 'l'; }, PROFILE, { timeout: 8000 });
  await p.waitForFunction(() => document.documentElement.dataset.size === 'l', null, { timeout: 5000 });
  eq(await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('mu.outbox.')).length), 0, 'the device copy is gone once it landed');
  // The failed writes were logged as errors on purpose; nothing else may be.
  for (let i = app.errors.length - 1; i >= 0; i--) if (/db write failed .*unavailable/.test(app.errors[i])) app.errors.splice(i, 1);
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} shell tests passed`);
process.exit(failed.length ? 1 : 0);
