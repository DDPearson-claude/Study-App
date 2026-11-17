// Unit tests for the heart at the hook set (src/ui-heart.js; the user's ask, 17 Nov 2026): it fires once, at fishing:hookset, for an
// Elder and an Ancient and never for the other classes, a legend or a find; never twice for one fish (until the next cast); the words
// (TEXT_LOOP.heart: the class's own label, ≤ 3 words, no number, on the allow-list); the beats fast at first and slowing (the Ancient's
// deeper and slower); the vignette on the beats and off with reduced motion (and the buzz with it); the words laid clear of what they
// must not cover; fishing emits fishing:hookset only on a trip; nothing off the loop.
//   node tools/tests/loop-heart.test.mjs   (or node tools/check.mjs)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBus } from '../../src/core.js';
import { loadLoopData } from './loop-fixture.mjs';

const D = await loadLoopData();
const H = await import('../../src/ui-heart.js');
const U = await import('../../src/ui-loop.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');
let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const section = (s) => console.log(`- ${s}`);
const { heartFor, heartWords, heartBeats, heartEdge, heartPlace, createHeartView } = H;

section('which hooks: an Elder and an Ancient only');
{
  ok(heartFor({ sizeClass: 'elder' }, D) === 'elder' && heartFor({ sizeClass: 'elder', ancient: true }, D) === 'ancient', 'Elder → elder, Ancient → ancient');
  for (const c of ['small', 'keeper', 'prize', 'trophy', 'legend', 'find', null]) ok(heartFor({ sizeClass: c }, D) === null, `nothing for ${c}`);
  ok(heartFor({ sizeClass: 'elder', legendary: true }, D) === null && heartFor({ sizeClass: 'elder', find: true }, D) === null, 'nothing for a legend or a find');
  ok(heartFor({ sizeClass: 'elder' }, { ...D, LOOP_ENABLED: false }) === null, 'nothing off the loop');
}

section('the words: the class\'s own label, few, plain, allowed');
{
  for (const cls of ['elder', 'ancient']) {
    const w = heartWords(D, cls), label = cls === 'ancient' ? D.TEXT_V3?.classes?.ancient || 'Ancient' : D.SIZE_CLASSES.find((c) => c.id === 'elder').label;
    ok(!!w && w.trim().split(/\s+/).length <= 3, `${cls}: at most 3 words ("${w}")`);
    ok(w.toLowerCase().includes(label.toLowerCase()), `${cls}: names the class's own label (${label})`);
    ok(!/\d|%/.test(w), `${cls}: no number, no odds`);
    ok(U.textAllowed(w, { D }), `${cls}: ui-loop's textAllowed lets it on the water`);
  }
}

section('the beats: fast at first, slowing; the Ancient deeper and slower');
{
  const E = D.LOOP.heart.elder, A = D.LOOP.heart.ancient;
  for (const [n, c] of [['elder', E], ['ancient', A]]) {
    const b = heartBeats(c), gaps = b.slice(1).map((t, i) => t - b[i]);
    ok(b.length === c.n && b[0] === 0, `${n}: ${c.n} beats from the hook set`, b);
    ok(gaps.every((g, i) => i === 0 || g >= gaps[i - 1] - 1e-9) && gaps[gaps.length - 1] > gaps[0], `${n}: the gaps grow (slowing)`, gaps);
    ok(b[b.length - 1] >= 2.5 && b[b.length - 1] <= 6, `${n}: over the first few seconds (${b[b.length - 1]} s)`);
    ok(heartEdge(0.07, c, b) > 0.8 * c.edge && heartEdge(b[1] - 0.02, c, b) < 0.5 * c.edge, `${n}: the edge swells on a beat and fades between`);
    ok(b.every((t) => heartEdge(t + 0.07, c, b) <= 1), `${n}: never past 1`);
  }
  ok(A.pitch < E.pitch && A.first > E.first && A.last > E.last && A.gap > E.gap, 'the Ancient: deeper (pitch), slower (gaps, lub-dub)');
  ok(Array.isArray(D.LOOP.heart.buzz) && D.LOOP.heart.buzz.length === 3, 'a double buzz (on, off, on)');
  ok(D.LOOP.heart.words.hold >= 1.5 && D.LOOP.heart.words.hold <= 2.5, 'the words fade after about 2 s');
}

section('the place: low, clear, or not at all');
{
  const float = { left: 380, right: 600, top: 300, bottom: 470 }, hud = { left: 0, right: 960, top: 470, bottom: 540 };
  const P = heartPlace({ W: 960, H: 540, w: 260, h: 36, avoid: [float, hud] });
  ok(P.ok && P.top >= 540 * 0.45 && P.top + 36 <= 470 - 10 && (P.left + 260 <= float.left - 10 || P.left >= float.right + 10 || P.top + 36 <= float.top - 10), 'clear of the float and the HUD, low on the frame', P);
  const mid = heartPlace({ W: 960, H: 540, w: 260, h: 36, avoid: [] });
  ok(mid.ok && mid.left === 350 && mid.top === 540 - 44 - 36, 'nothing in the way: centred at the foot', mid);
  ok(!heartPlace({ W: 960, H: 540, w: 260, h: 36, avoid: [{ left: 0, right: 960, top: 200, bottom: 540 }] }).ok, 'no clear place: not shown');
  ok(!heartPlace({ W: 300, H: 600, w: 290, h: 30 }).ok, 'never cut at a screen edge (wider than the frame less its gutters: not shown)');
}

// ---- the view on a fake DOM
function fakeEl(cls = '') {
  const set = new Set(String(cls).split(/\s+/).filter(Boolean));
  const el = {
    children: [], parent: null, style: { setProperty() {} }, dataset: {}, attrs: {}, text: '', removed: false,
    classList: { add: (...c) => c.forEach((x) => set.add(x)), remove: (...c) => c.forEach((x) => set.delete(x)), contains: (c) => set.has(c) },
    set textContent(t) { el.text = String(t); }, get textContent() { return el.text; },
    setAttribute: (k, v) => { el.attrs[k] = v; },
    appendChild: (c) => { c.parent = el; el.children.push(c); return c; },
    insertBefore: (c) => { c.parent = el; el.children.unshift(c); return c; },
    remove: () => { el.removed = true; if (el.parent) el.parent.children = el.parent.children.filter((x) => x !== el); },
    get offsetWidth() { return Math.ceil(el.text.length * 17); }, get offsetHeight() { return 35; },
  };
  return el;
}
function rig({ rm = false, haptics = true, vw = 960, vh = 540 } = {}) {
  const bus = createBus(), sounds = [], buzzes = [];
  const nav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { vibrate: (p) => { buzzes.push(p); return true; } }, configurable: true, writable: true });
  const ctx = { bus, flow: 'playing', state: { meta: { settings: {} }, run: { outing: 'trip' } }, fishing: { bobberPos: { x: 0, y: 0, z: 0 } }, player: { position: { x: 0, y: 0, z: 4 } },
    audio: { play: (name, o) => { sounds.push({ name, ...o }); return true; } } };
  const hud = fakeEl('gw-hud');
  const K = { ctx, D: () => D, h: (tag, cls) => fakeEl(cls), settings: () => ({ reducedMotion: rm, haptics }), layers: { hud }, root: { querySelectorAll: () => [] },
    project: (p) => ({ ok: true, behind: false, x: vw / 2, y: p.z > 1 ? vh * 0.7 : vh * 0.42 }), hasBlocking: () => false, vw, vh, report: (w, e) => { throw e; } };
  const view = createHeartView(K);
  const R = { bus, view, hud, sounds, buzzes, restore: () => { if (nav) Object.defineProperty(globalThis, 'navigator', nav); else delete globalThis.navigator; } };
  R.frames = (sec, dt = 1 / 30) => { for (let t = 0; t < sec - 1e-9; t += dt) view.update(dt); };
  R.words = () => hud.children.filter((c) => c.classList.contains('gw-heart-w') && !c.removed);
  R.edge = () => hud.children.filter((c) => c.classList.contains('gw-heart-edge') && !c.removed);
  return R;
}

section('the view: fires once at the hook set of an Elder and an Ancient');
{
  const R = rig();
  for (const c of ['small', 'keeper', 'prize', 'trophy']) { R.bus.emit('fishing:hookset', { sizeClass: c, ancient: false }); R.frames(0.2); }
  ok(R.view.debug().fires === 0 && R.words().length === 0 && R.sounds.length === 0 && R.buzzes.length === 0, 'Small, Keeper, Prize, Trophy: nothing at all');
  R.bus.emit('fishing:cast', {});
  R.bus.emit('fishing:hookset', { sizeClass: 'elder', ancient: false });
  ok(R.view.debug().fires === 1 && R.view.debug().cls === 'elder', 'an Elder: it fires at the hook set');
  ok(R.words().length === 1 && R.words()[0].text === D.TEXT_LOOP.heart.elder && R.words()[0].classList.contains('gw-in'), `the words "${D.TEXT_LOOP.heart.elder}" come in`);
  const P = R.view.debug().place;
  ok(P?.ok && P.top >= 540 * 0.45, 'low on the screen', P);
  ok(R.edge().length === 1, 'the frame\'s edges darken (one full-frame vignette)');
  ok(R.buzzes.length === 1 && JSON.stringify(R.buzzes[0]) === JSON.stringify(D.LOOP.heart.buzz), 'a double buzz on a phone', R.buzzes);
  R.frames(0.05);
  ok(R.sounds.length === 1 && R.sounds[0].name === 'heart_hook', 'the first beat sounds at once (heart_hook)', R.sounds);
  R.bus.emit('fishing:hookset', { sizeClass: 'elder', ancient: false });
  ok(R.view.debug().fires === 1, 'never twice for one fish');
  R.frames(1);
  ok(R.view.debug().edge !== null, 'the vignette follows the beats');
  R.frames(D.LOOP.heart.words.hold);
  ok(R.view.debug().words === null, `the words fade after about ${D.LOOP.heart.words.hold} s`);
  R.frames(5);
  const elderBeats = R.sounds.filter((s) => s.name === 'heart_hook');
  ok(elderBeats.length === D.LOOP.heart.elder.n, `${D.LOOP.heart.elder.n} beats in all`, elderBeats.length);
  ok(!R.view.debug().on && R.words().length === 0 && R.edge().length === 0, 'then it is over and gone');
  R.bus.emit('fishing:cast', {});
  R.bus.emit('fishing:hookset', { sizeClass: 'elder', ancient: true });
  ok(R.view.debug().fires === 2 && R.view.debug().cls === 'ancient' && R.words()[0]?.text === D.TEXT_LOOP.heart.ancient && R.words()[0].classList.contains('gw-heart-ancient'), 'the next fish, an Ancient: its own words, warm');
  R.frames(0.05);
  ok(R.sounds.at(-1).pitch === D.LOOP.heart.ancient.pitch && R.sounds.at(-1).pitch < elderBeats[0].pitch, 'its thump deeper');
  R.bus.emit('fishing:escaped', {});
  ok(R.view.debug().words === null, 'the words give way when the fish gets away');
  R.restore();
}

section('reduced motion: no vignette, no buzz; the words and the sound stay');
{
  const R = rig({ rm: true });
  R.bus.emit('fishing:hookset', { sizeClass: 'elder', ancient: true });
  R.frames(0.1);
  ok(R.view.debug().fires === 1 && R.view.debug().rm === true, 'it fires');
  ok(R.edge().length === 0 && R.view.debug().edge === null, 'no vignette');
  ok(R.buzzes.length === 0, 'no buzz');
  ok(R.words().length === 1 && R.sounds.length >= 1, 'the words and the heartbeat');
  R.restore();
  const Q = rig({ haptics: false });
  Q.bus.emit('fishing:hookset', { sizeClass: 'elder' });
  ok(Q.buzzes.length === 0 && Q.edge().length === 1, 'the haptics setting off: no buzz (the vignette stays)');
  Q.restore();
}

section('the seams: fishing on a trip only, ui.js under the loop, the sound');
{
  const f = src('fishing.js'), ui = src('ui.js'), sfx = src('audio-sfx.js');
  ok(/if \(trip && !legendary && !S\.find\) emit\('fishing:hookset', \{ sizeClass: S\.sizeClass \|\| 'keeper', ancient: !!S\.ancient \}\)/.test(f), 'fishing emits fishing:hookset at the strike, on a trip only, no species, no odds');
  ok(/if \(loopView\) \{ try \{ loopView\.heart = createHeartView\(K\);/.test(ui), 'ui.js builds it beside the loop view only');
  ok(/heart_hook: \{/.test(sfx), 'the heart_hook sound is in the sfx synth');
}

console.log(`\nloop-heart: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
