#!/usr/bin/env node
// Browser test for Dan's calculator (Dan, 25 Oct: "add a scientific calculator icon I can tap to open
// in the app"): the engine (45-calc.js), the sheet (46-calc-sheet.js) and the kit's field / insert
// messages (app/kit/kit.js). In the complete app with the model never called: the icon in the top
// bar beside Aa opens it from Today, and the lesson's own bar opens it in a refresher steps lesson
// with a typed answer (K.answer). At 360 px light and dark and at 1280 px: the sheet sits over the
// lower part of the screen and the question above stays readable and scrollable; keys are 44 px or
// more and nothing scrolls sideways; a sum is worked by its keys (and by a laptop's keyboard);
// Insert puts the result into the typed answer, focused and unchecked, and shows only while there
// is one; the icon again, Close and Escape close it; its state lasts the visit, and DEG/RAD and
// the last 10 sums are remembered on the device. The read-through's bar has the icon too.
// Screenshots: tests/out/calc/, and one contact sheet of them all (tests/out/calc/contact.png).
// Run: node tests/e2e/calc.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'calc.html');
const SHOTS = join(ROOT, 'tests', 'out', 'calc');
const FILTER = process.argv[2] || '';
const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
mkdirSync(SHOTS, { recursive: true });

const fx = (n) => JSON.parse(readFileSync(join(ROOT, 'tests', 'fixtures', n), 'utf8'));
const results = [];
const shots = [];
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
    console.log(`FAIL  ${name}\n      ${String(e && e.stack || e).split('\n').slice(0, 5).join('\n      ')}`);
    for (const app of current.apps) await app.page.screenshot({ path: join(SHOTS, 'fail-' + name.replace(/\W+/g, '-').slice(0, 40) + '.png') }).catch(() => {});
  } finally {
    for (const app of current.apps) await app.close().catch(() => {});
  }
}

// ---------- a ready-made course: i1 a refresher steps lesson with a typed answer (and its guide) ----------
const UID = 'u_stubuser0000000000000000';
const PROGRESS = `data/users/${UID}/profile/progress/pendulums`;
function stepsLesson() {
  const d = fx('lesson-ui-pendulum.json');
  const parts = fx('refresher-parts.json');
  d.lesson.mode = 'read'; d.lesson.format = 'steps';
  d.lesson.predict = null; d.lesson.say = null; d.lesson.checks = [];
  d.lesson.practice = { text: '- Divide the line current by √3.' };
  d.lesson.written = parts.written; d.lesson.summary = parts.summary;
  d.interactive.html = readFileSync(join(ROOT, 'tests', 'fixtures', 'refresher-body.html'), 'utf8');
  return d;
}
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="340" height="80"><rect x="20" y="10" width="300" height="60" style="fill:#2A78D6"/></svg>';
const GUIDE = { v: 1, iid: 'i1', pages: [
  { kind: 'show', name: 'Bar', text: 'The design current is what the circuit carries in normal service.', svg: SVG, alt: 'A blue bar.' },
  { kind: 'example', name: 'Delta', task: 'Determine the current in each cable in delta.', answer: '13.33 A', why: '23.08 ÷ √3 = 13.33 A.', svg: null, alt: '' },
] };
function db() {
  const t = fx('lesson-ui-topic.json');
  return {
    'topics/pendulums': { ...t, mode: 'read', readyMade: { shelf: 'electrical', course: 'pendulums' } },
    'topics/pendulums/lessons/i1': stepsLesson(),
    'topics/pendulums/case/file': fx('refresher-case.json'),
    'topics/pendulums/guide/i1': GUIDE,
    [PROGRESS]: { updatedAt: '2026-10-24T18:00:00.000Z', lastIdea: 'i1', ideas: { i1: { round: 0, stage: 'play', startedAt: '2026-10-24T18:00:00.000Z' } } },
  };
}
async function open({ width = 360, dark = false, hash = '#/today', fresh = true } = {}) {
  const app = await openApp({ width, height: width < 700 ? 760 : 860, dark, file: FILE, config: { db: db() }, sample: () => new Promise(() => {}) });
  current.apps.push(app);
  // Reading settings as the device keeps them (head.html paints from mu-prefs); a fresh device has no calculator memory.
  await app.page.addInitScript(([v, f]) => {
    try {
      if (!sessionStorage.getItem('__p')) {
        localStorage.setItem('mu-prefs', JSON.stringify(v));
        if (f) localStorage.removeItem('mu.calc');
        sessionStorage.setItem('__p', '1');
      }
    } catch (e) { /* fine */ }
  }, [{ theme: dark ? 'dark' : 'light', size: 'm' }, fresh]);
  await app.page.goto(app.url(hash));
  await app.booted();
  return app;
}
const tag = (app) => `${app.page.viewportSize().width}-${current.dark ? 'dark' : 'light'}`;
async function shot(app, name) {
  await app.page.waitForTimeout(250);
  const path = join(SHOTS, name + '.png');
  await app.page.screenshot({ path });
  shots.push({ name, path });
}
async function noSideways(app, where) {
  const w = await app.page.evaluate(() => {
    const p = document.querySelector('.calc');
    return { doc: [document.documentElement.scrollWidth, window.innerWidth], panel: p && !p.hidden ? [p.scrollWidth, p.clientWidth] : [0, 0],
      keys: (() => { const k = document.querySelector('.calc-keys'); return k ? [k.scrollWidth, k.clientWidth] : [0, 0]; })() };
  });
  assert(w.doc[0] <= w.doc[1], `${where}: the page scrolls sideways (${w.doc})`);
  assert(w.panel[0] <= w.panel[1] + 1, `${where}: the sheet scrolls sideways (${w.panel})`);
  assert(w.keys[0] <= w.keys[1] + 1, `${where}: the keys scroll sideways (${w.keys})`);
}
// Taps on a phone, clicks with a mouse.
async function press(app, ...ids) {
  const touch = app.page.viewportSize().width < 700;
  for (const id of ids) {
    const k = app.page.locator(`.calc-key[data-key="${id}"]`);
    if (touch) await k.tap(); else await k.click();
  }
}
const result = (app) => app.page.evaluate(() => { const r = document.querySelector('.calc-res'); return { text: r.textContent, cls: r.className }; });
const expr = (app) => app.page.locator('.calc-expr').inputValue();
// The sheet slides up for a quarter of a second: measure it once it has settled.
const settle = (app) => app.page.waitForTimeout(400);
const isOpen = (app) => app.page.evaluate(() => { const p = document.querySelector('.calc'); return !!p && !p.hidden && document.documentElement.classList.contains('calc-open'); });
async function geometry(app) {
  return app.page.evaluate(() => {
    const p = document.querySelector('.calc').getBoundingClientRect();
    const keys = [...document.querySelectorAll('.calc-key')].map((k) => { const r = k.getBoundingClientRect(); return { id: k.dataset.key, w: r.width, h: r.height, right: r.right, left: r.left }; });
    return { top: p.top, bottom: p.bottom, left: p.left, right: p.right, width: p.width, height: p.height, vw: window.innerWidth, vh: window.innerHeight, keys,
      small: keys.filter((k) => k.w < 44 || k.h < 44).map((k) => k.id + ' ' + Math.round(k.w) + 'x' + Math.round(k.h)),
      outside: keys.filter((k) => k.left < p.left || k.right > p.right).map((k) => k.id),
      bg: getComputedStyle(document.querySelector('.calc')).backgroundColor };
  });
}
// The frame of the lesson, and its typed answer.
const lessonFrame = (app) => app.page.frameLocator('.lsn-steps-play iframe');

// ---------- Today, at 360 light and dark and 1280: open, work sums, close ----------
for (const [width, dark] of [[360, false], [360, true], [1280, false]]) {
  await test(`from Today at ${width} ${dark ? 'dark' : 'light'}: the icon beside Aa opens it over the lower part, a sum is worked, it closes`, async () => {
    current.dark = dark;
    const app = await open({ width, dark });
    const { page } = app;
    await page.waitForSelector('.td h1');
    const icon = await page.evaluate(() => {
      const b = document.getElementById('calc-btn');
      return b && { inTopbar: !!b.closest('.topbar'), beforeAa: b.nextElementSibling && b.nextElementSibling.id === 'settings-btn', label: b.getAttribute('aria-label'),
        expanded: b.getAttribute('aria-expanded'), w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height };
    });
    assert(icon && icon.inTopbar && icon.beforeAa, 'the calculator icon sits in the top bar, just before Aa: ' + JSON.stringify(icon));
    eq([icon.label, icon.expanded], ['Calculator', 'false'], 'its name and state');
    assert(icon.w >= 44 && icon.h >= 44, 'a 44 px target: ' + JSON.stringify(icon));
    await page.click('#calc-btn');
    await settle(app);
    assert(await isOpen(app), 'it opens');
    eq(await page.getAttribute('#calc-btn', 'aria-expanded'), 'true', 'the icon says it is open');
    eq(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('calc-expr')), true, 'focus goes to the sum, ready for a keyboard');
    const g = await geometry(app);
    eq(g.small, [], 'every key is at least 44 px');
    eq(g.outside, [], 'every key fits inside the sheet');
    eq(g.keys.length, 35, 'thirty-five keys, seven to a row');
    if (width < 700) {
      assert(Math.abs(g.bottom - g.vh) < 1 && g.left <= 0.5 && Math.abs(g.right - g.vw) < 1, 'a bottom sheet across the phone: ' + JSON.stringify([g.top, g.bottom, g.left, g.right]));
      assert(g.height <= 400 && g.height <= g.vh * 0.56, `it covers the lower part only (${Math.round(g.height)} of ${g.vh} px)`);
    } else {
      assert(g.width <= 404 && g.vw - g.right >= 12 && g.vh - g.bottom >= 12, 'docked at the bottom right on a laptop: ' + JSON.stringify([g.left, g.right, g.width, g.bottom]));
    }
    if (dark) eq(g.bg, 'rgb(29, 32, 36)', 'dark: the sheet takes the dark surface');
    else eq(g.bg, 'rgb(255, 255, 255)', 'light: the sheet is white');
    // The page above stays readable: the heading is above the sheet, and the page scrolls past its
    // end by the sheet's height.
    const room = await page.evaluate(() => {
      const h1 = document.querySelector('#view h1').getBoundingClientRect(), p = document.querySelector('.calc').getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(document.getElementById('view')).paddingBottom);
      return { h1: h1.bottom, top: p.top, pad, ph: p.height };
    });
    assert(room.h1 <= room.top, 'the screen\'s heading stays above the sheet: ' + JSON.stringify(room));
    assert(room.pad >= room.ph, 'the page can scroll its end up above the sheet: ' + JSON.stringify(room));
    await noSideways(app, 'Today, open');

    // A sum by its keys: 2 × (3 + 4) = 14, its answer shown while typed and then as the result.
    await press(app, 'd2', 'mul', 'lp', 'd3', 'add', 'd4');
    const live = await result(app);
    assert(/is-live/.test(live.cls) && live.text === '14', 'the answer shows as he types, brackets closed for him: ' + JSON.stringify(live));
    await press(app, 'rp', 'eq');
    eq(await expr(app), '2×(3+4)', 'the sum as typed');
    const done = await result(app);
    assert(/is-done/.test(done.cls) && done.text === '14', 'equals: 14 ' + JSON.stringify(done));
    await page.waitForFunction(() => /equals 14/.test(document.querySelector('.calc [role="status"]').textContent), null, { timeout: 2000 });
    // Carries on from Ans: + 1 = 15.
    await press(app, 'add', 'd1', 'eq');
    eq([await expr(app), (await result(app)).text], ['Ans+1', '15'], 'an operator after a result carries on from Ans');
    // sin 30 in degrees, its bracket closed on =.
    await press(app, 'sin', 'd3', 'd0', 'eq');
    eq([await expr(app), (await result(app)).text], ['sin(30)', '0.5'], 'a digit or function after a result starts afresh; sin 30° = 0.5');
    // Prefixes and ENG: 4.7k ÷ 2 = 2350, shown as 2.35k with ENG on.
    await press(app, 'd4', 'dot', 'd7', 'k', 'div', 'd2', 'eq');
    eq([await expr(app), (await result(app)).text], ['4.7k÷2', '2350'], '4.7k ÷ 2');
    await page.click('.calc-eng');
    eq((await result(app)).text, '2.35k', 'ENG shows the prefix');
    eq(await page.getAttribute('.calc-eng', 'aria-pressed'), 'true', 'ENG is pressed');
    await page.click('.calc-eng');
    // 2nd: sin⁻¹ and µ's partner p.
    await page.locator('.calc-shift').click();
    eq(await page.getAttribute('.calc-shift', 'aria-pressed'), 'true', '2nd is pressed');
    eq(await page.locator('.calc-key[data-key="sin"]').textContent(), 'sin⁻¹', '2nd relabels sin');
    await press(app, 'sin', 'd1', 'eq');
    eq([await expr(app), (await result(app)).text], ['sin⁻¹(1)', '90'], 'sin⁻¹(1) = 90°, and 2nd lets go after one key');
    eq([await page.locator('.calc-key[data-key="sin"]').textContent(), await page.getAttribute('.calc-shift', 'aria-pressed')], ['sin', 'false'], '2nd is off again');
    // The e key (2nd + π) after a number is the constant, never a power of ten: 2e − 3, not 0.002.
    await press(app, 'd2');
    await page.locator('.calc-shift').click();
    await press(app, 'pi', 'sub', 'd3', 'eq');
    eq([await expr(app), (await result(app)).text], ['2e−3', '2.436563657'], 'pressing 2, e, −, 3 is 2e − 3');
    // ×10ⁿ is the power of ten: 2 ×10ⁿ − 3 = 0.002.
    await press(app, 'd2', 'exp', 'sub', 'd3', 'eq');
    eq([await expr(app), (await result(app)).text], ['2E−3', '0.002'], 'pressing 2, ×10ⁿ, −, 3 is 2×10⁻³');
    // An error in plain words, in red, said politely.
    await press(app, 'd1', 'div', 'd0', 'eq');
    const err = await result(app);
    assert(/is-error/.test(err.cls) && err.text === 'Can\'t divide by zero', 'dividing by zero is said plainly: ' + JSON.stringify(err));
    eq(await page.evaluate(() => getComputedStyle(document.querySelector('.calc-res')).color), dark ? 'rgb(242, 166, 172)' : 'rgb(159, 48, 56)', 'the error is red');
    await page.waitForFunction(() => /divide by zero/.test(document.querySelector('.calc [role="status"]').textContent), null, { timeout: 2000 });
    // Backspace takes the whole function name; AC clears.
    await press(app, 'ac', 'd2', 'sqrt');
    eq(await expr(app), '2√(', 'a function key types its name and bracket');
    await press(app, 'del');
    eq(await expr(app), '2', 'backspace takes √( as one');
    await press(app, 'ac');
    eq([await expr(app), (await result(app)).text], ['', ''], 'AC clears the sum');
    // No answer box on Today: no Insert.
    await page.waitForTimeout(1700);
    eq(await page.locator('.calc-insert').isVisible(), false, 'no answer box, so no Insert');
    await noSideways(app, 'Today, after sums');
    await press(app, 'd2', 'mul', 'pi', 'mul', 'd5', 'd0', 'eq');
    await shot(app, `today-${tag(app)}`);

    if (width >= 700) {
      // A laptop types into it: 2^10, Enter, then *2 carries on from Ans.
      await page.locator('.calc-expr').focus();
      await page.keyboard.press('Control+a');
      await page.keyboard.type('2^10');
      await page.keyboard.press('Enter');
      eq((await result(app)).text, '1024', 'typed on the keyboard: 2^10 = 1024');
      await page.keyboard.type('*2');
      eq(await expr(app), 'Ans×2', '* after a result carries on from Ans, shown as ×');
      await page.keyboard.press('Enter');
      eq((await result(app)).text, '2048', 'Enter works it out');
      await page.keyboard.type('4.7k/220u');
      await page.keyboard.press('Enter');
      eq([await expr(app), (await result(app)).text], ['4.7k÷220u', '21363636.36'], 'prefixes typed on the keyboard');
      // Escape closes, and focus goes back to the icon.
      await page.keyboard.press('Escape');
      assert(!(await isOpen(app)), 'Escape closes it');
      eq(await page.evaluate(() => document.activeElement && document.activeElement.id), 'calc-btn', 'focus returns to the icon');
    } else {
      // The Close button closes it.
      await page.locator('.calc-x').tap();
      assert(!(await isOpen(app)), 'Close closes it');
      eq(await page.getAttribute('#calc-btn', 'aria-expanded'), 'false', 'the icon says it is closed');
      eq(await page.evaluate(() => [document.documentElement.classList.contains('calc-open'), document.documentElement.style.getPropertyValue('--calc-h')]), [false, ''], 'the page takes its own padding back');
    }
    await noSideways(app, 'Today, closed');
  });
}

// ---------- a lesson with a typed answer: open from the lesson bar, Insert, unchecked ----------
for (const [width, dark] of [[360, false], [360, true], [1280, false]]) {
  await test(`in a lesson at ${width} ${dark ? 'dark' : 'light'}: the lesson bar's icon, the state kept, Insert into the typed answer`, async () => {
    current.dark = dark;
    const app = await open({ width, dark, hash: '#/today' });
    const { page } = app;
    // Opened on Today first: a sum left in it stays for the visit.
    await page.click('#calc-btn');
    await press(app, 'd1', 'd2', 'mul', 'd3', 'eq');
    await page.click('#calc-btn');
    assert(!(await isOpen(app)), 'the icon again closes it');
    await page.evaluate(() => U.go('#/t/pendulums/i1'));
    const fr = lessonFrame(app);
    await fr.locator('.k-answer-input').waitFor({ timeout: 20000 });
    const bar = await page.evaluate(() => {
      const b = document.querySelector('.lsn-bar .calc-btn');
      return b && { label: b.getAttribute('aria-label'), next: b.nextElementSibling && b.nextElementSibling.className, topbar: getComputedStyle(document.getElementById('topbar')).display,
        r: b.getBoundingClientRect().toJSON(), barH: document.querySelector('.lsn-bar').getBoundingClientRect().height };
    });
    assert(bar && bar.label === 'Calculator' && /lsn-ask/.test(bar.next), 'the lesson bar has the icon, before Ask: ' + JSON.stringify(bar));
    eq(bar.topbar, 'none', 'the lesson hides the top bar');
    assert(bar.r.width >= 44 && bar.r.height >= 44, 'a 44 px target in the lesson bar');
    await noSideways(app, 'lesson, closed');
    await page.click('.lsn-bar .calc-btn');
    await settle(app);
    assert(await isOpen(app), 'it opens from the lesson');
    eq([await expr(app), (await result(app)).text], ['12×3', '36'], 'the sum from Today is still there');
    // Insert shows while the typed answer is on screen.
    await page.locator('.calc-insert').waitFor({ state: 'visible', timeout: 4000 });
    // 23.08 ÷ √3: each cable's current in delta.
    await press(app, 'd2', 'd3', 'dot', 'd0', 'd8', 'div', 'sqrt', 'd3', 'eq');
    eq([await expr(app), (await result(app)).text], ['23.08÷√(3)', '13.32524421'], '23.08 ÷ √3');
    const want = await page.evaluate(() => U.calc.plain(U.calcSheet.state.value));
    eq(want, '13.32524421', 'the plain digits that go in');
    // The question stays readable: the page scrolls it into the room between the lesson bar and
    // the sheet, where it shows whole.
    const task = await fr.locator('#taskA').evaluate((n) => { const r = n.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
    await page.evaluate((t) => {
      const f = document.querySelector('.lsn-steps-play iframe').getBoundingClientRect(), bar = document.querySelector('.lsn-bar').getBoundingClientRect().bottom;
      window.scrollBy(0, f.top + t.top - bar - 8);
    }, task);
    await page.waitForTimeout(150);
    const q = await page.evaluate(() => {
      const f = document.querySelector('.lsn-steps-play iframe').getBoundingClientRect();
      return { frameTop: f.top, bar: document.querySelector('.lsn-bar').getBoundingClientRect().bottom, sheet: document.querySelector('.calc').getBoundingClientRect().top };
    });
    assert(q.frameTop + task.top >= q.bar - 1 && q.frameTop + task.bottom <= q.sheet, 'the question reads clear of the bar and the sheet: ' + JSON.stringify({ q, task }));
    await shot(app, `question-${tag(app)}`);
    await page.locator('.calc-insert').click();
    await fr.locator('.k-answer-input').evaluate((n, v) => new Promise((res, rej) => { const t0 = Date.now(); (function go() { if (n.value === v) res(); else if (Date.now() - t0 > 3000) rej(new Error('not inserted: ' + n.value)); else setTimeout(go, 50); })(); }), want);
    const box = await fr.locator('.k-answer').evaluate((n) => ({ state: n.getAttribute('data-state'), msg: n.querySelector('.k-answer-msg').textContent, value: n.querySelector('input').value,
      focused: document.activeElement === n.querySelector('input'), fb: document.getElementById('fbA').textContent }));
    eq([box.value, box.state, box.msg, box.fb], [want, '', '', ''], 'the result is in the typed answer, unchecked');
    eq(box.focused, true, 'the answer field has the focus in its page');
    await page.waitForFunction(() => /is in the answer box/.test(document.querySelector('.calc [role="status"]').textContent), null, { timeout: 2000 });
    // The field sits clear of the sheet and of the lesson bar after Insert.
    const at = await page.evaluate(() => ({ frameTop: document.querySelector('.lsn-steps-play iframe').getBoundingClientRect().top,
      bar: document.querySelector('.lsn-bar').getBoundingClientRect().bottom, sheet: document.querySelector('.calc').getBoundingClientRect().top }));
    const field = await fr.locator('.k-answer-input').evaluate((n) => { const r = n.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
    assert(at.frameTop + field.top >= at.bar && at.frameTop + field.bottom <= at.sheet, 'the answer field shows between the bar and the sheet: ' + JSON.stringify({ at, field }));
    await noSideways(app, 'lesson, inserted');
    await shot(app, `lesson-${tag(app)}`);
    // He checks it himself: right.
    await fr.getByRole('button', { name: 'Check', exact: true }).click();
    eq(await fr.locator('.k-answer').getAttribute('data-state'), 'right', 'his own Check marks it right');
    // A step with no typed answer: Insert goes.
    await fr.getByRole('button', { name: 'Next' }).click();
    await page.locator('.calc-insert').waitFor({ state: 'hidden', timeout: 4000 });
    // The lesson bar's icon closes it again; Escape closes it from the sum.
    await page.click('.lsn-bar .calc-btn');
    assert(!(await isOpen(app)), 'the icon in the lesson bar closes it');
    await page.click('.lsn-bar .calc-btn');
    assert(await isOpen(app), 'and opens it again');
    await page.locator('.calc-expr').focus();
    await page.keyboard.press('Escape');
    assert(!(await isOpen(app)), 'Escape closes it');
    eq(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('lsn-calc')), true, 'focus back on the lesson bar\'s icon');
    await noSideways(app, 'lesson, closed again');
  });
}

// ---------- history and what the device remembers ----------
await test('history: the last 10 sums, tap one to use it again; DEG/RAD and history remembered on the device', async () => {
  current.dark = false;
  const app = await open({ width: 360 });
  const { page } = app;
  await page.click('#calc-btn');
  for (let n = 1; n <= 12; n++) {
    await press(app, ...String(n).split('').map((d) => 'd' + d), 'add', 'd1', 'eq');
  }
  await page.locator('.calc-hist-btn').tap();
  eq(await page.getAttribute('.calc-hist-btn', 'aria-pressed'), 'true', 'History is pressed');
  const rows = await page.locator('.calc-hrow').evaluateAll((list) => list.map((b) => b.textContent));
  eq(rows.length, 10, 'ten sums kept');
  eq([rows[0], rows[9]], ['12+1= 13', '3+1= 4'], 'newest first');
  const keysHidden = await page.evaluate(() => getComputedStyle(document.querySelector('.calc-keys')).visibility);
  eq(keysHidden, 'hidden', 'the list lies over the keys');
  await noSideways(app, 'history');
  await shot(app, 'history-360-light');
  await page.locator('.calc-hrow').nth(2).tap();
  eq([await expr(app), (await result(app)).text], ['10+1', '11'], 'tapping one puts its sum back');
  eq(await page.evaluate(() => getComputedStyle(document.querySelector('.calc-keys')).visibility), 'visible', 'and the keys come back');
  await page.locator('.calc-angle').tap();
  eq(await page.locator('.calc-angle').textContent(), 'RAD', 'RAD');
  await press(app, 'ac', 'sin', 'pi', 'div', 'd2', 'eq');
  eq((await result(app)).text, '1', 'sin(π÷2) in radians = 1');
  // A reload: the device remembers RAD and the sums; the sheet starts closed.
  await page.reload();
  await app.booted();
  assert(!(await isOpen(app)), 'closed after a reload');
  await page.click('#calc-btn');
  eq(await page.locator('.calc-angle').textContent(), 'RAD', 'RAD remembered');
  await page.locator('.calc-hist-btn').tap();
  const after = await page.locator('.calc-hrow').evaluateAll((list) => list.map((b) => b.textContent));
  eq([after.length, after[0]], [10, 'sin(π÷2)= 1'], 'the sums remembered');
  await page.locator('.calc-hist-btn').tap();
  eq(await page.evaluate(() => getComputedStyle(document.querySelector('.calc-keys')).visibility), 'visible', 'History again: back to the keys');
  await press(app, 'ans');
  eq(await expr(app), 'Ans', 'Ans');
  await press(app, 'mul', 'd3', 'eq');
  eq((await result(app)).text, '3', 'Ans is the last answer remembered');
});

// ---------- the read-through's bar ----------
await test('the read-through\'s bar has the icon', async () => {
  current.dark = false;
  const app = await open({ width: 360, hash: '#/t/pendulums/i1/read' });
  const { page } = app;
  await page.locator('.rd-pages').waitFor({ timeout: 20000 });
  assert(await page.locator('.rd-bar .calc-btn').count() === 1, 'the icon in the read-through bar');
  await page.locator('.rd-bar .calc-btn').tap();
  assert(await isOpen(app), 'it opens');
  await press(app, 'd2', 'd3', 'dot', 'd0', 'd8', 'div', 'sqrt', 'd3', 'eq');
  eq((await result(app)).text, '13.32524421', 'works there too');
  await page.waitForTimeout(1700);
  eq(await page.locator('.calc-insert').isVisible(), false, 'no typed answer while reading, so no Insert');
  await noSideways(app, 'read-through');
  await shot(app, 'read-360-light');
});

// ---------- one contact sheet ----------
if (shots.length) {
  const { chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const cells = shots.map((s) => `<figure><img src="data:image/png;base64,${readFileSync(s.path).toString('base64')}"><figcaption>${s.name}</figcaption></figure>`).join('');
  await page.setContent(`<style>body{margin:12px;font:14px system-ui;background:#fff}h1{font-size:16px;margin:0 0 8px}
    main{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}figure{margin:0}img{display:block;height:620px;width:auto;border:1px solid #ccc}
    figcaption{text-align:center;color:#333;margin-top:4px}</style><h1>Calculator: every screenshot of this run</h1><main>${cells}</main>`);
  await page.screenshot({ path: join(SHOTS, 'contact.png'), fullPage: true });
  await browser.close();
  console.log('contact sheet: ' + join(SHOTS, 'contact.png'));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} calculator tests passed`);
process.exit(failed.length ? 1 : 0);
