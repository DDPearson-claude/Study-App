// Unit tests for the float's two marks taught once (src/ui-teach.js; the user's play-test, 16 November 2026): the words (TEXT_LOOP.teach,
// ≤ 6 words, no number, on the allow-list), the trigger (the first settled float on a trip after the opening tutorial, never during
// it, once a save: meta.seenTips[TEACH_TIP] survives a save and a reload; an older save that has played is taught once), the view's
// life on a fake DOM (it shows after the marks settle, holds LOOP_TEACH.hold s, goes at the bite, a cast or a tap, never again), the
// layout on a 358 px, a 390 px phone and a desktop (both captions clear of each other, the marks, the float and the HUD's bands, the
// phone's text ≥ 16 px, pointer-events none), Murk's first quiet-water line still the quiet water's teacher, and nothing off the loop.
//   node tools/tests/loop-teach.test.mjs   (or node tools/check.mjs)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBus, defaultMeta, normalizeSave } from '../../src/core.js';
import { loadLoopData, freshLoopMeta } from './loop-fixture.mjs';

const D = await loadLoopData();
const T = await import('../../src/ui-teach.js');
const U = await import('../../src/ui-loop.js');
const { migrateSave } = await import('../../src/progression.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const section = (s) => console.log(`- ${s}`);
const { TEACH_TIP, LOOP_TEACH, teachDue, teachWords, teachSide, teachLayout, TEACH_CSS, createTeachView } = T;

section('the words: TEXT_LOOP.teach, plain and few, on the allow-list');
const W = teachWords(D);
{
  ok(!!W && W.notches === D.TEXT_LOOP.teach.notches && W.dots === D.TEXT_LOOP.teach.dots, 'teachWords reads TEXT_LOOP.teach', W);
  for (const [k, t] of Object.entries(W || {})) {
    ok(t.trim().split(/\s+/).length <= 6, `${k}: at most 6 words ("${t}")`);
    ok(!/\d|%/.test(t), `${k}: no number, no percentage`);
    ok(U.textAllowed(t, { D }), `${k}: ui-loop's textAllowed lets it on the water`);
    ok(U.allowedWords(D).has(t), `${k}: on allowedWords`);
  }
  // (the live region speaks both captions once, in one text node in the toasts layer: loop-1a's T43 scan reads it whole)
  ok(W && U.textAllowed(`${W.notches} ${W.dots}`, { D }), 'the live region\'s one line (both captions) passes textAllowed');
  ok(!U.textAllowed(`${W?.notches} ${W?.dots} Extra.`, { D }), '… and only that line, not any run of sentences');
  ok(teachWords({}) === null && teachWords({ TEXT_LOOP: { teach: { notches: 'x' } } }) === null, 'no words, no moment');
}

section('the trigger: the first settled float on a trip after the tutorial, once');
const due0 = { loopOn: true, trip: true, tutorialDone: true, seen: false, shown: false, state: 'waiting', marks: true, blocking: false, lifting: false, settled: 1 };
{
  ok(teachDue(due0) === true, 'due: a trip, the tutorial done, unseen, the float settled with its marks');
  ok(teachDue({ ...due0, tutorialDone: false }) === false, 'never during the opening tutorial');
  ok(teachDue({ ...due0, seen: true }) === false, 'never once seen');
  ok(teachDue({ ...due0, shown: true }) === false, 'never while it shows');
  for (const s of ['idle', 'casting', 'bite', 'reeling', 'landing', 'lost']) ok(teachDue({ ...due0, state: s }) === false, `not while ${s}`);
  ok(teachDue({ ...due0, marks: false }) === false, 'not until the notches and the dots are on screen');
  ok(teachDue({ ...due0, settled: LOOP_TEACH.after - 0.05 }) === false && teachDue({ ...due0, settled: LOOP_TEACH.after }) === true, `the marks settle ${LOOP_TEACH.after} s first`);
  ok(teachDue({ ...due0, blocking: true }) === false && teachDue({ ...due0, lifting: true }) === false, 'never under a screen or a place\'s lift');
  ok(teachDue({ ...due0, loopOn: false }) === false && teachDue({ ...due0, trip: false }) === false, 'off the loop or off a trip: never');
  ok(teachDue() === false, 'no arguments: not due');
}

// ---------------------------------------------------------------- a fake DOM: just what the view touches
function fakeEl(cls = '') {
  const set = new Set(String(cls).split(/\s+/).filter(Boolean));
  const el = {
    children: [], parent: null, style: {}, dataset: {}, attrs: {}, text: '', removed: false,
    classList: { add: (...c) => c.forEach((x) => set.add(x)), remove: (...c) => c.forEach((x) => set.delete(x)), toggle: (c, on) => { if (on ?? !set.has(c)) set.add(c); else set.delete(c); }, contains: (c) => set.has(c) },
    get className() { return [...set].join(' '); },
    set textContent(t) { el.text = String(t); }, get textContent() { return el.text; },
    set innerHTML(hh) { if (/<path/.test(hh)) { el.paths = [fakeEl('gw-teach-1'), fakeEl('gw-teach-2')]; } },
    setAttribute: (k, v) => { el.attrs[k] = v; },
    appendChild: (c) => { c.parent = el; el.children.push(c); return c; },
    remove: () => { el.removed = true; if (el.parent) el.parent.children = el.parent.children.filter((x) => x !== el); },
    querySelectorAll: (sel) => (sel === 'path' ? el.paths || [] : sel === '.gw-teach-cap' ? el.children.filter((c) => c.classList.contains('gw-teach-cap')) : []),
    get offsetWidth() { const mw = parseFloat(el.style.maxWidth) || 250; return Math.min(mw, Math.ceil(el.text.length * 8.2)); },
    get offsetHeight() { const mw = parseFloat(el.style.maxWidth) || 250; return Math.ceil((el.text.length * 8.2) / mw) * 22 + 4; },
  };
  return el;
}
const rect = (l, t, w, h) => ({ left: l, top: t, right: l + w, bottom: t + h, width: w, height: h, getBoundingClientRect() { return this; } });
function rig({ meta = null, tutorialDone = true, vw = 390, vh = 664 } = {}) {
  globalThis.requestAnimationFrame = (f) => { f(); return 0; };
  const bus = createBus();
  const m = meta || { ...freshLoopMeta(D) };
  if (tutorialDone) m.loop.tutorial = { done: true, step: null }; else m.loop.tutorial = { done: false, step: 'wake' };
  let saves = 0;
  // the float's marks as ui-hud-v3 draws them: the favour block above-right of the float
  const fav = { on: false, ticks: rect(vw / 2, 300, 72, 27), dots: [rect(vw / 2 + 16, 330, 5, 5), rect(vw / 2 + 25, 330, 5, 5), rect(vw / 2 + 34, 330, 5, 5)] };
  const favNode = { querySelector: (s) => (s === '.gw-fav-ticks' ? fav.ticks : null), querySelectorAll: (s) => (s === '.gw-fav-dots i' ? fav.dots : []) };
  const ctx = {
    bus, flow: 'playing', state: { meta: m, run: { outing: 'trip', evening: 2 } },
    fishing: { state: 'idle', bobberPos: { x: 0, y: 0, z: 0 } },
    progression: { loop: { tutorial: () => ({ ...m.loop.tutorial }) } },
    game: { save: () => { saves++; }, lifting: () => false },
  };
  const hud = fakeEl('gw-hud');
  let blocking = false;
  const K = {
    ctx, D: () => D, h: (tag, cls, html) => { const e = fakeEl(cls); if (html) e.innerHTML = html; return e; }, meta: () => ctx.state.meta,
    settings: () => ({ reducedMotion: false }), layers: { hud, toasts: fakeEl('gw-toasts') }, root: { querySelector: (s) => (s === '.gw-favour.gw-on.gw-loopfav' && fav.on ? favNode : null) },
    project: () => ({ ok: true, behind: false, x: vw / 2 - 30, y: 372 }), hasBlocking: () => blocking, vw, vh, report: (w, e) => { throw e; },
  };
  const view = createTeachView(K);
  const R = { bus, ctx, K, view, fav, hud, m, saves: () => saves, block: (b) => { blocking = b; } };
  R.frames = (sec, dt = 1 / 30) => { for (let t = 0; t < sec - 1e-9; t += dt) view.update(dt); };
  R.settle = () => { ctx.fishing.state = 'waiting'; fav.on = true; };
  R.cast = () => { bus.emit('fishing:cast', {}); ctx.fishing.state = 'casting'; fav.on = false; R.frames(0.2); R.settle(); };
  R.caps = () => hud.children.filter((c) => c.classList.contains('gw-teach') && !c.removed);
  return R;
}
const flush = () => new Promise((r) => setTimeout(r, 0));

section('the view: once a save, after the tutorial, gone at the bite');
{
  const R = rig();
  R.frames(1);
  ok(!R.view.debug().shown, 'not while idle');
  R.settle(); R.frames(0.3);
  ok(!R.view.debug().shown, `not before the marks have settled ${LOOP_TEACH.after} s`);
  R.frames(0.5);
  ok(R.view.debug().shown && R.caps().length === 1, 'the first settled float: the captions show');
  const el = R.caps()[0];
  const words = el.children.filter((c) => c.classList.contains('gw-teach-cap')).map((c) => [c.dataset.mark, c.text]);
  ok(JSON.stringify(words) === JSON.stringify([['notches', W.notches], ['dots', W.dots]]), 'two captions: the notches\' and the dots\'', words);
  ok((el.paths || []).length === 2 && el.paths.every((p) => /^M[\d.-]+ [\d.-]+ Q/.test(p.attrs.d || '')), 'two ink leaders, each a drawn line (no ring)', el.paths?.map((p) => p.attrs.d));
  ok(el.classList.contains('gw-in') && !el.classList.contains('gw-rm'), 'it inks in');
  ok(R.m.seenTips[TEACH_TIP] === true, `recorded at once: meta.seenTips.${TEACH_TIP}`);
  await flush();
  ok(R.saves() >= 1, 'and the game saved (a reload never repeats it)');
  const lay = R.view.debug().layout;
  ok(lay?.ok === true, 'its layout is clean (no overlap, inside the bands)', lay?.faults);
  R.frames(LOOP_TEACH.hold - 1);
  ok(R.view.debug().shown, `it holds about ${LOOP_TEACH.hold} s`);
  R.bus.emit('fishing:bite', {}); R.ctx.fishing.state = 'bite'; R.fav.on = false;
  ok(!R.view.debug().shown && el.classList.contains('gw-out'), 'the bite: it fades');
  await new Promise((r) => setTimeout(r, 700));
  R.view.update(1 / 30);
  ok(R.caps().length === 0, 'and is gone');
  R.cast(); R.frames(3);
  ok(!R.view.debug().shown && R.caps().length === 0, 'the next settled float: never again this save');
}
{
  const R = rig();
  R.settle(); R.frames(1);
  ok(R.view.debug().shown, '(a second rig shows)');
  R.frames(LOOP_TEACH.hold + 0.1);
  ok(!R.view.debug().shown, `no bite: it fades after ${LOOP_TEACH.hold} s`);
}
{
  const R = rig(); R.settle(); R.frames(1);
  R.bus.emit('fishing:cast', {});
  ok(!R.view.debug().shown, 'the next cast: it fades');
}
{
  const R = rig(); R.settle(); R.frames(1);
  R.block(true); R.frames(1 / 30);
  ok(!R.view.debug().shown, 'a screen over the water: it goes');
  const R2 = rig(); R2.block(true); R2.settle(); R2.frames(2);
  ok(!R2.view.debug().shown && R2.m.seenTips?.[TEACH_TIP] !== true, 'under a screen it waits, unrecorded');
}
{
  const R = rig({ tutorialDone: false });
  R.settle(); R.frames(3);
  ok(!R.view.debug().shown && R.m.seenTips?.[TEACH_TIP] !== true, 'during the opening tutorial: never, and nothing recorded');
  R.m.loop.tutorial = { done: true, step: null };
  R.cast(); R.frames(1);
  ok(R.view.debug().shown, 'the first settled float after it is done: shown');
}
{
  const R = rig();
  R.settings = null; R.K.settings = () => ({ reducedMotion: true });
  R.settle(); R.frames(1);
  ok(R.caps()[0]?.classList.contains('gw-rm'), 'reduced motion: the plain-fade class');
}

section('a save and a reload: the record survives; an older save is taught once');
{
  const R = rig();
  R.settle(); R.frames(1);
  // the save as writeSave stores it, read back as main's boot does (loadSave → migrateSave → normalizeSave)
  const env = JSON.parse(JSON.stringify({ version: 3, savedAt: 1, meta: R.ctx.state.meta, run: null }));
  const back = normalizeSave(migrateSave(env, D));
  ok(back.meta.seenTips?.[TEACH_TIP] === true, 'the record is in the save after a reload');
  const R2 = rig({ meta: back.meta });
  R2.settle(); R2.frames(3);
  ok(!R2.view.debug().shown, 'after the reload: never again');
  // an older save that has played (evenings sold, the first trip's tips seen, struck many times) has no record: taught once
  const old = { ...defaultMeta(), loop: { ...freshLoopMeta(D).loop, evenings: 7, wick: 'taper', said: { firstSale: true, firstQuiet: true } },
    seenTips: { fe_cast: true, fe_strike: true, ui_struck: 20, cast_basics: true, ui_tell_rise_3: true } };
  const oldBack = normalizeSave(migrateSave(JSON.parse(JSON.stringify({ version: 3, savedAt: 1, meta: old, run: null })), D)).meta;
  const R3 = rig({ meta: oldBack });
  R3.settle(); R3.frames(1);
  ok(R3.view.debug().shown && oldBack.seenTips[TEACH_TIP] === true, 'an older save that has played: taught on its next settled float');
  R3.view.update(10); R3.cast(); R3.frames(2);
  ok(!R3.view.debug().shown, 'and only once');
  ok(oldBack.seenTips.fe_cast === true && oldBack.seenTips.ui_struck === 20, 'its other tips are untouched');
}

section('the layout: a 358 px and a 390 px phone and a desktop, the float anywhere it settles');
{
  // the favour block as ui-hud-v3's placeFav puts it (150 px wide, centred at the float + 36 px, above it or below it)
  const favAt = (W, H, px, py, n = 5) => {
    const top = W < 700 ? 190 : 118;
    const x = Math.max(16 + 74, Math.min(W - 16 - 74, px + 36));
    const below = py - 70 < top;
    const y = Math.max(top, Math.min(H - 250, below ? py + 46 : py - 66));
    const dw = n * 5 + (n - 1) * 4;
    return { ticks: { left: x - 36, right: x + 36, top: y - 12, bottom: y + 15 }, dots: { left: x - dw / 2, right: x + dw / 2, top: y + 17, bottom: y + 22 } };
  };
  const fs = (W) => (W <= 700 ? 17 : 19);
  // a caption's size at a width: the words wrapped at ~0.46 em a character (Alegreya's average), line-height 1.25, padding 2 px 4 px
  const measure = (text, maxW, W) => {
    const cw = 0.46 * fs(W), words = text.split(' ');
    let lines = 1, line = 0, wMax = 0;
    for (const w of words) { const ww = (w.length + 1) * cw; if (line + ww > maxW - 8 && line > 0) { lines++; wMax = Math.max(wMax, line); line = ww; } else line += ww; }
    wMax = Math.max(wMax, line);
    return { w: Math.ceil(Math.min(maxW, wMax + 8)), h: Math.ceil(lines * fs(W) * 1.25 + 4) };
  };
  const views = [[358, 664], [390, 664], [960, 540], [1280, 720]];
  const bad = [], soft = [];
  let n = 0, beside = 0, desk = 0;
  for (const [Wd, Ht] of views) {
    for (const fx of [0.2, 0.35, 0.5, 0.65, 0.8]) for (const fy of [0.38, 0.5, 0.62]) for (const dots of [9, 5, 1]) {
      const px = Wd * fx, py = Ht * fy;
      const m = favAt(Wd, Ht, px, py, dots);
      const s = teachSide({ W: Wd, ticks: m.ticks, dots: m.dots });
      // the raft below the float (the camera rides behind it): its deck and the Wick's flame, as the view's raftRect boxes them
      const ry = py + (Wd > 700 ? 135 : 100);
      const raft = { left: px - 56, right: px + 56, top: ry - 50, bottom: ry + 32 };
      const L = teachLayout({ W: Wd, H: Ht, ticks: m.ticks, dots: m.dots, float: { left: px - 16, right: px + 16, top: py - 12, bottom: py + 38 }, raft, side: s.side,
        notes: measure(W.notches, s.maxW, Wd), dotsCap: measure(W.dots, s.maxW, Wd) });
      n++;
      if (!L.ok) bad.push({ Wd, Ht, fx, fy, dots, faults: L.faults });
      if (L.soft.length) soft.push({ Wd, Ht, fx, fy, dots, soft: L.soft });
      if (Wd > 700) { desk++; if (L.notes.left >= m.ticks.right || L.notes.right <= m.ticks.left) beside++; }
      // the leaders run from each caption to its own mark
      const [a, b] = L.leaders;
      if (!(Math.abs(a.y2 - (m.ticks.top + m.ticks.bottom) / 2) < 0.5 && Math.abs(b.y2 - (m.dots.top + m.dots.bottom) / 2) < 0.5)) bad.push({ Wd, fx, fy, leader: 'off its mark' });
    }
  }
  ok(bad.length === 0, `every layout clean (${n} placements: the captions apart, clear of the marks, the float and the HUD's bands)`, bad.slice(0, 4));
  ok(soft.length <= Math.ceil(n * 0.1), `the raft and its Wick kept clear where there is room (${n - soft.length}/${n})`, soft.slice(0, 4));
  if (soft.length) console.log(`  (over the raft with no room to clear it: ${soft.length} of ${n}: ${JSON.stringify(soft.slice(0, 3))})`);
  ok(beside === desk, `on a desktop they sit beside the float's marks (${beside}/${desk})`);
  const s358 = teachSide({ W: 358, ...favAt(358, 664, 179, 380) });
  ok(s358.maxW >= 100, 'a 358 px phone leaves a caption room for its words in two lines', s358);
}

section('the CSS: the strike tip\'s hand, ≥ 16 px on a phone, never a tap\'s target, no ring');
{
  ok(/\.gw-teach \{[^}]*pointer-events: none !important/.test(TEACH_CSS) && /\.gw-teach \* \{ pointer-events: none !important/.test(TEACH_CSS), 'pointer-events none on the layer and everything in it');
  const sizes = [...TEACH_CSS.matchAll(/font(?:-size)?:[^;]*?(\d+(?:\.\d+)?)px/g)].map((x) => Number(x[1]));
  ok(sizes.length >= 2 && sizes.every((s) => s >= 16), 'every caption size ≥ 16 px (the phone\'s 17)', sizes);
  ok(/var\(--f-body\)/.test(TEACH_CSS) && /text-shadow: 0 1px 2px #000, 0 0 14px rgba\(4, 5, 12, \.85\)/.test(TEACH_CSS), "the toasts' type and ink-shadow (the strike tip's, Murk's lines')");
  ok(!/border-radius|circle|ellipse\(/.test(TEACH_CSS.replace(/radial-gradient\(ellipse[^;]*;/g, '')), 'no ring or disc drawn (the feathered veil behind the words only)');
  ok(/prefers-reduced-motion|gw-rm/.test(TEACH_CSS) && /\.gw-teach\.gw-rm \.gw-teach-cap \{ animation: none !important/.test(TEACH_CSS), 'reduced motion: no ink-in');
}

section('the quiet water: Murk\'s first quiet-water line still says it (SPEC §8.6); nothing more here');
{
  const L = src('ui-loop.js');
  ok(typeof D.TEXT_LOOP.murk.firstQuiet === 'string' && D.TEXT_LOOP.murk.firstQuiet.length > 0, `TEXT_LOOP.murk.firstQuiet ("${D.TEXT_LOOP.murk.firstQuiet}")`);
  ok(/F\.bitesLeft <= 0[^\n]*\n[^\n]*quietSaid = true;\n[^\n]*sayOnce', 'firstQuiet'\)/.test(L) && /if \(line\) murkToast\(line\)/.test(L), "ui-loop's update says it on the water, the first time the dots run out (sayOnce: once a save)");
  ok(!/quiet/i.test(JSON.stringify(D.TEXT_LOOP.teach)), 'no third caption: the quiet water stays Murk\'s');
}

section('off the loop: nothing is built');
{
  const ui = src('ui.js');
  ok(/if \(loopView\) \{ try \{ loopView\.teach = createTeachView\(K\);/.test(ui) && /if \(loopOn\) \{ try \{ loopView = createLoopView\(K\);/.test(ui), 'ui.js builds it beside the loop view only (loopOn)');
  ok(/if \(loopView\?\.teach\) \{ try \{ loopView\.teach\.update\(dt\);/.test(ui), 'and steps it only when built');
  const T0 = await import('../../src/ui-teach.js?off');
  ok(T0.teachDue({ ...due0, loopOn: false }) === false, 'teachDue is false with the flag off');
}

console.log(`\nloop-teach: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
