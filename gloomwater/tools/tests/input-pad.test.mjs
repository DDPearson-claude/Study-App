// Unit tests for the game controller (src/input-pad.js; the user's ask, 17 Nov 2026): the standard mapping, the dead zone, the edge
// detection, the spatial focus order (the home's targets, a grid, a row over a wide button), the held direction's repeat, the hint
// glyph's place (beside its label, never over it: clearAt), several pads at once, a slider by the pad (no key left held), and the pad attached to a fake page with a fake getGamepads: the stick sails, A held aims ahead of the raft and its
// release casts, the right stick turns the aim, Start / Y / X are the P / J / B keys, the intro's skip, the hints on with the pad
// and off at a real pointer or key (never at the pad's own synthetic keys), a lost pad lets go, the rumble guarded by the settings.
//   node tools/tests/input-pad.test.mjs   (or node tools/check.mjs)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBus } from '../../src/core.js';
import { loadLoopData } from './loop-fixture.mjs';

const D = await loadLoopData();
const P = await import('../../src/input-pad.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');
let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const section = (s) => console.log(`- ${s}`);
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const { PAD, DEAD, deadZone, firstPad, readPads, edges, stickDir, navPick, createRepeat, chipPlace, clearAt, attachPad } = P;

section('the standard mapping');
ok(PAD.A === 0 && PAD.B === 1 && PAD.X === 2 && PAD.Y === 3 && PAD.LB === 4 && PAD.RB === 5 && PAD.LT === 6 && PAD.RT === 7, 'A B X Y LB RB LT RT = 0–7');
ok(PAD.BACK === 8 && PAD.START === 9 && PAD.LS === 10 && PAD.RS === 11 && PAD.UP === 12 && PAD.DOWN === 13 && PAD.LEFT === 14 && PAD.RIGHT === 15, 'Back Start LS RS, the D-pad 12–15');

section('the dead zone');
{
  const o = { x: 9, y: 9 };
  deadZone(0.1, -0.15, DEAD, o); ok(o.x === 0 && o.y === 0, 'a resting stick (inside the dead zone) is still', o);
  deadZone(0, -1, DEAD, o); ok(near(o.x, 0) && near(o.y, 1), 'full up (axis -1) is y = +1', o);
  deadZone(1, 0, DEAD, o); ok(near(o.x, 1) && near(o.y, 0), 'full right is x = 1', o);
  deadZone(0.8, 0.8, DEAD, o); ok(near(Math.hypot(o.x, o.y), 1) && o.x > 0 && o.y < 0, 'a corner is clamped to 1, y down negative', o);
  deadZone(DEAD + 0.05, 0, DEAD, o); ok(o.x > 0 && o.x < 0.1, 'just past the zone starts near 0 (rescaled, no jump)', o);
  const same = deadZone(0.5, 0, DEAD, o); ok(same === o, 'writes into the given object (no allocation)');
}

section('the pad, its buttons, the edges');
{
  ok(firstPad(null) === null && firstPad([null, null]) === null, 'no pad → null');
  const odd = { connected: true, mapping: '', buttons: new Array(12).fill({ pressed: false }), axes: [] }, std = { connected: true, mapping: 'standard', buttons: new Array(17).fill({ pressed: false }), axes: [] };
  ok(firstPad([odd, std]) === std && firstPad([odd]) === odd && firstPad([{ ...std, connected: false }]) === null, 'the standard pad first, any pad else, never a disconnected one');
  const cur = new Uint8Array(16), prev = new Uint8Array(16), dn = new Uint8Array(16), up = new Uint8Array(16), ax = new Float32Array(4);
  const gp = { mapping: 'standard', buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0.5, -0.25, 0, 1] };
  gp.buttons[0].pressed = true; gp.buttons[7].value = 0.8;
  readPads([gp], cur, ax);
  ok(cur[0] === 1 && cur[7] === 1 && cur[1] === 0 && near(ax[0], 0.5) && near(ax[3], 1), 'pressed or a trigger past half is down; the axes read', { cur: [...cur], ax: [...ax] });
  ok(edges(cur, prev, dn, up) === true && dn[0] === 1 && dn[7] === 1 && up[0] === 0, 'a press is one down edge');
  ok(edges(cur, prev, dn, up) === false && dn[0] === 0, 'held: no second edge');
  cur[0] = 0; edges(cur, prev, dn, up);
  ok(up[0] === 1 && dn[0] === 0, 'let go: one up edge');
  // a handheld's maker or Steam adds an idle virtual copy (often first): any pad's press counts, each axis from the pad pushing it furthest
  const pad = (mapping, ts) => ({ connected: true, mapping, timestamp: ts, buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] });
  const idle = pad('standard', 5), real = pad('standard', 9), odd2 = pad('', 12);
  real.buttons[0].pressed = true; real.axes[0] = -0.7; idle.axes[0] = 0.1; odd2.buttons[9].pressed = true; odd2.axes[2] = -1;
  const li = readPads([idle, real, odd2], cur, ax);
  ok(cur[0] === 1 && cur[9] === 0 && near(ax[0], -0.7) && ax[2] === 0 && li === 1, 'two standard pads: the idle copy hides nothing; a non-standard pad beside them is not read; the rumble goes to the one that changed last', { cur: [...cur], ax: [...ax], li });
  const lo = readPads([null, odd2], cur, ax);
  ok(lo === 1 && cur[9] === 1 && ax[2] === 0, "a non-standard pad alone: its buttons, never its axes (a trigger resting at -1 is not a held stick)");
  ok(readPads([null, null], cur, ax) === -1 && cur[9] === 0, 'no pad: -1, all let go');
}

section('a stick as a direction; the held direction repeats');
{
  ok(stickDir(0, 0.9) === 0 && stickDir(0.9, 0) === 1 && stickDir(0, -0.9) === 2 && stickDir(-0.9, 0) === 3 && stickDir(0.3, 0.3) === -1, 'up right down left, nothing under half');
  const rep = createRepeat(0.36, 0.13);
  const seq = [];
  for (let i = 0; i < 30; i++) seq.push(rep(1, 1 / 30));
  const at = seq.map((d, i) => (d === 1 ? i : -1)).filter((i) => i >= 0);
  ok(at[0] === 0 && at[1] >= 10 && at[1] <= 11 && at[2] - at[1] >= 3 && at[2] - at[1] <= 5, 'at once, then after ~0.36 s, then every ~0.13 s', at);
  ok(rep(-1, 1 / 30) === -1 && rep(1, 1 / 30) === 1, 'let go and pressed again: at once');
  ok(rep(2, 1 / 30) === 2, 'a new direction: at once');
}

section('the focus order (spatial, by screen position)');
{
  const R = (l, t, w, h) => ({ l, t, r: l + w, b: t + h });
  // the home's targets as the barge lays them out (MURK left, CHART under the raft, JOURNAL right), the pause glyph top left
  const home = [R(20, 20, 44, 44), R(300, 520, 120, 44), R(640, 600, 140, 44), R(980, 500, 140, 44)];   // pause, murk, chart, journal
  ok(navPick(home[2], home, 1, 2) === 3 && navPick(home[2], home, 3, 2) === 1, 'CHART → right JOURNAL, ← MURK');
  ok(navPick(home[1], home, 0, 1) === 0 && navPick(home[0], home, 2, 0) === 1, 'MURK ↑ the pause glyph, and back ↓');
  ok(navPick(home[3], home, 1, 3) === -1, 'nothing further right: the focus stays');
  // a grid: the target in line beats a nearer one off to the side
  const grid = [R(0, 0, 100, 40), R(200, 0, 100, 40), R(0, 100, 100, 40), R(130, 60, 40, 40)];
  ok(navPick(grid[0], grid, 1, 0) === 1, '→ the button in the same row, not the nearer one lower down');
  ok(navPick(grid[0], grid, 2, 0) === 2, '↓ the button in the same column');
  // a row of two over a wide button (the catch card's foot over a wide line)
  const card = [R(100, 300, 120, 44), R(240, 300, 120, 44), R(100, 380, 260, 44)];
  ok(navPick(card[0], card, 2, 0) === 2 && navPick(card[1], card, 2, 1) === 2 && navPick(card[2], card, 0, 2) <= 1, 'both of a row go ↓ to the wide one and it goes ↑ to the row');
  // a column (the pause menu): ↓ ↓ walks it in order
  const col = [R(500, 300, 200, 40), R(500, 350, 200, 40), R(500, 400, 200, 40)];
  ok(navPick(col[0], col, 2, 0) === 1 && navPick(col[1], col, 2, 1) === 2 && navPick(col[2], col, 0, 2) === 1, 'a column in order');
}

section('the hint glyph beside a button, never over a word, never cut');
{
  const r = { l: 400, t: 300, r: 520, b: 344 };
  const a = chipPlace(r, 20, 1280, 800);
  ok(a && a.x + 20 <= r.l && a.y > r.t && a.y + 20 < r.b, 'left of it, centred on its height', a);
  const edge = chipPlace({ l: 4, t: 300, r: 120, b: 344 }, 20, 1280, 800);
  ok(edge && edge.x >= 120, 'at the screen edge: right of it (never cut)', edge);
  const blocked = chipPlace(r, 20, 1280, 800, (x) => x > 520);
  ok(blocked.x >= 520, 'a word on its left: right of it', blocked);
  const b = chipPlace(r, 20, 1280, 800, () => true, 6, true);
  ok(b && b.x >= r.r && b.x - r.r <= 8, 'the way back (B): right of its button, after its word', b);
  ok(chipPlace(r, 20, 1280, 800, () => false, 6, false, { l: 380, t: 290, r: 540, b: 354 }) === null, 'nowhere clear: no glyph (never one over its word)');
  const corner = chipPlace({ l: 1250, t: 2, r: 1279, b: 30 }, 20, 1280, 800);
  ok(corner && corner.x + 20 <= 1278 && corner.y >= 2, 'inside the screen even at its corner', corner);
  // clearAt on a fake page: a button with a bare text label (Murk's "Buy · 400"); the purse, a pill, close on its left
  const R = (l, t, r2, b2) => ({ left: l, top: t, right: r2, bottom: b2, width: r2 - l, height: b2 - t });
  const txt = (v) => ({ nodeType: 3, nodeValue: v, nextSibling: null });
  const el = (tag, rect, kids, btn) => { const e = { tagName: tag, rect, firstChild: kids, getBoundingClientRect: () => rect, closest: () => (btn ? e : null) }; return e; };
  const page = (els) => ({ elementFromPoint: (x, y) => els.find((e) => x >= e.rect.left && x < e.rect.right && y >= e.rect.top && y < e.rect.bottom) || null });
  const near2 = (q, lab) => q && !(q.x < lab.right && q.x + 20 > lab.left && q.y < lab.bottom && q.y + 20 > lab.top);
  {
    const lab = R(642, 734, 752, 754), buy = el('BUTTON', R(620, 720, 774, 768), txt('Buy · '), true);
    const purse = el('DIV', R(505, 724, 606, 764), { nodeType: 1, nextSibling: null }), foot = el('DIV', R(0, 716, 1280, 772), null);
    const doc = page([purse, buy, foot]);
    const L = { l: lab.left, t: lab.top, r: lab.right, b: lab.bottom }, O = { l: 620, t: 720, r: 774, b: 768 };
    const q = chipPlace(L, 20, 1280, 800, clearAt(doc, buy, lab), 6, false, O);
    ok(near2(q, lab) && q.x >= O.r, 'a bare-text button, its padding too narrow and a pill on its left: the glyph goes right of the button, never over its word', q);
    const wide = el('BUTTON', R(560, 720, 834, 768), txt('Buy · '), true), lab2 = R(642, 734, 752, 754);
    const q2 = chipPlace({ l: lab2.left, t: lab2.top, r: lab2.right, b: lab2.bottom }, 20, 1280, 800, clearAt(page([wide, foot]), wide, lab2), 6, false, { l: 560, t: 720, r: 834, b: 768 });
    ok(near2(q2, lab2) && q2.x >= 560 && q2.x + 20 <= lab2.left, "a bare-text button with room: in its own padding, left of its word", q2);
    const tight = el('BUTTON', lab2, txt('Buy · '), true), left = el('BUTTON', R(560, 734, 632, 754), txt('Back'), true);
    const T3 = { l: lab2.left, t: lab2.top, r: lab2.right, b: lab2.bottom };
    const q3 = chipPlace(T3, 20, 1280, 800, clearAt(page([left, tight, foot]), tight, lab2), 6, false, T3);
    ok(near2(q3, lab2) && q3.x >= lab2.right, 'a button close on its left: right of its word, never over it', q3);
  }
}

section('attached to a fake page: the water');
function rig({ flow = 'playing', settings = {} } = {}) {
  const win = new EventTarget();
  win.Event = Event;
  win.KeyboardEvent = class extends Event { constructor(t, i = {}) { super(t, i); this.code = i.code; this.key = i.key; } };
  win.innerWidth = 1280; win.innerHeight = 800;
  const timers = [];
  win.setTimeout = (f, ms) => { timers.push(ms); f(); return 0; };
  const keys = [];
  win.addEventListener('keydown', (e) => keys.push(e.code));
  const cls = new Set();
  const doc = { documentElement: { classList: { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)), contains: (c) => cls.has(c) } },
    querySelector: () => null, createElement: () => ({}), head: { appendChild() {} }, body: { appendChild() {} }, styleSheets: [] };
  const gp = { id: 'fake', index: 0, mapping: 'standard', connected: true, buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
  const rumbles = [];
  gp.vibrationActuator = { type: 'dual-rumble', playEffect: (t, o) => { rumbles.push([t, o]); return Promise.resolve('complete'); } };
  let connected = true;
  const nav = { getGamepads: () => [connected ? gp : null, null, null, null] };
  const move = { x: 0, y: 0, lengthSq() { return this.x * this.x + this.y * this.y; }, normalize() { const l = Math.sqrt(this.lengthSq()); this.x /= l; this.y /= l; return this; } };
  const bus = createBus();
  const ctx = { flow, paused: false, input: { move }, ui: { isBlocking: () => false }, player: { heading: 0 }, render: { getYaw: () => 0 }, state: { meta: { settings } }, bus, data: D };
  const calls = { press: 0, release: 0 };
  const pad = attachPad(ctx, { press: () => calls.press++, release: () => calls.release++, win, doc, nav });
  const set = (b, on) => { gp.buttons[b].pressed = on; gp.buttons[b].value = on ? 1 : 0; };
  const frame = () => { move.x = 0; move.y = 0; pad.poll(1 / 60); };
  return { ctx, pad, gp, set, frame, keys, cls, calls, win, rumbles, timers, bus, move, disconnect: () => { connected = false; } };
}
{
  const T = rig();
  T.frame();
  ok(!T.cls.has('gw-pad-on') && T.calls.press === 0, 'a resting pad changes nothing (no class, no press)');
  T.gp.axes[1] = -1; T.frame();
  ok(near(T.move.y, 1) && near(T.move.x, 0), 'the left stick up sails forward (as W)', { x: T.move.x, y: T.move.y });
  ok(T.cls.has('gw-pad-on'), 'the pad is in use: the page knows (hints on, the touch stick hidden)');
  T.gp.axes[1] = 0; T.set(PAD.RIGHT, true); T.frame();
  ok(near(T.move.x, 1), 'the D-pad sails too', { x: T.move.x });
  T.set(PAD.RIGHT, false);
  T.ctx.player.heading = Math.PI / 2;   // the raft faces -x
  T.set(PAD.A, true); T.frame();
  const aim = T.ctx.input.padAim;
  ok(T.calls.press === 1 && aim.on === true && near(aim.x, -1) && near(aim.z, 0, 1e-9), 'A down: one press, the aim ahead of the raft', aim);
  T.frame();
  ok(T.calls.press === 1, 'A held: no second press');
  T.gp.axes[2] = 1; T.frame();
  ok(near(aim.x, 1) && near(aim.z, 0, 1e-9), 'the right stick turns the aim (right on the screen, camera yaw 0)', aim);
  T.ctx.render.getYaw = () => Math.PI / 2; T.gp.axes[2] = 0; T.gp.axes[3] = -1; T.frame();
  ok(near(aim.x, -1) && near(aim.z, 0, 1e-9), 'up on the right stick is up the screen (away from the camera)', aim);
  T.gp.axes[3] = 0;
  T.set(PAD.A, false); T.frame();
  ok(T.calls.release === 1 && aim.on === false, 'A up: the release (the cast), the pointer has its aim back', aim);
  T.keys.length = 0;
  T.set(PAD.START, true); T.frame(); T.set(PAD.START, false); T.frame();
  T.set(PAD.Y, true); T.frame(); T.set(PAD.Y, false); T.frame();
  T.set(PAD.X, true); T.frame(); T.set(PAD.X, false); T.frame();
  ok(T.keys.join(',') === 'KeyP,KeyJ,KeyB', 'Start, Y, X: the pause, the Journal, the tackle tin (P, J, B)', T.keys);
  ok(T.cls.has('gw-pad-on'), "the pad's own keys never count as the player's key");
  T.win.dispatchEvent(new Event('pointerdown'));
  ok(!T.cls.has('gw-pad-on'), 'a real pointer (mouse or touch): the hints go, the touch stick is back');
  T.set(PAD.B, true); T.frame();
  ok(T.cls.has('gw-pad-on'), 'the pad again: back on');
  T.win.dispatchEvent(new T.win.KeyboardEvent('keydown', { code: 'KeyW' }));
  ok(!T.cls.has('gw-pad-on'), 'a real key: off');
  T.set(PAD.B, false); T.frame();
  // a lost pad mid-cast lets go
  T.set(PAD.A, true); T.frame();
  const pr = T.calls.release;
  T.disconnect(); T.frame();
  ok(T.calls.release === pr + 1 && T.ctx.input.padAim.on === false && !T.cls.has('gw-pad-on'), 'the pad unplugged with A held: the cast is let go, the page as it was');
}
{
  const T = rig();
  T.set(PAD.A, true); T.frame();
  T.ctx.ui.isBlocking = () => true; T.frame();   // the catch card opens under a held A
  ok(T.calls.release === 1 && T.ctx.input.padAim.on === false, 'a screen opening under a held A lets the press go (no stuck cast)');
}
{
  const T = rig({ flow: 'intro' });
  T.set(PAD.A, true); T.frame();
  ok(T.keys[0] === 'Escape' && T.calls.press === 0, 'the intro: A is a skip key (Escape), no press');
}

section('a slider by the pad: its value moves, no arrow key is left held in the game');
{
  const win = new EventTarget();
  win.Event = Event;
  win.KeyboardEvent = class extends Event { constructor(t, i = {}) { super(t, i); this.code = i.code; this.key = i.key; } };
  win.innerWidth = 1280; win.innerHeight = 800; win.getComputedStyle = () => ({ pointerEvents: 'auto' });
  const held = new Set();   // main's input.keys: down adds, up deletes
  win.addEventListener('keydown', (e) => held.add(e.code)); win.addEventListener('keyup', (e) => held.delete(e.code));
  const cl = () => { const c = new Set(); return { add: (x) => c.add(x), remove: (x) => c.delete(x), contains: (x) => c.has(x), toggle: (x, on) => (on ? c.add(x) : c.delete(x)) }; };
  const doc = { activeElement: null, documentElement: { classList: cl() }, head: { appendChild() {} }, body: { appendChild() {} }, styleSheets: [],
    createElement: () => ({ className: '', setAttribute() {}, dataset: {}, style: {}, classList: cl() }) };
  const slider = { tagName: 'INPUT', value: 50, dataset: {}, isConnected: true, textContent: '', classList: cl(), getAttribute: () => null, closest: () => null,
    matches: (q) => q.includes('range') && !q.includes('gw-x'), getBoundingClientRect: () => ({ left: 500, top: 300, right: 700, bottom: 324, width: 200, height: 24 }),
    focus() { doc.activeElement = slider; },
    dispatchEvent(e) {   // its own key handler (ui-screens: ±5), then the event bubbles to the window (main's key set)
      if (e.type === 'keydown') slider.value += e.code === 'ArrowRight' ? 5 : e.code === 'ArrowLeft' ? -5 : 0;
      win.dispatchEvent(new win.KeyboardEvent(e.type, { code: e.code, key: e.key })); return true;
    } };
  const scope = { dataset: { modal: 'settings' }, classList: { contains: (c) => c === 'gw-modal' }, previousElementSibling: null,
    querySelectorAll: (q) => (q.includes('range') ? [slider] : []), querySelector: () => null, contains: (x) => x === slider };
  doc.querySelector = (q) => (q === '.gw-modal-layer' ? { lastElementChild: scope } : null);
  const gp = { mapping: 'standard', connected: true, buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
  const ctx = { flow: 'home', paused: false, input: { keys: held }, ui: { isBlocking: () => true }, state: { meta: { settings: {} } } };
  const pad = attachPad(ctx, { win, doc, nav: { getGamepads: () => [gp] } });
  gp.buttons[PAD.RIGHT].pressed = true; pad.poll(1 / 60);
  gp.buttons[PAD.RIGHT].pressed = false; pad.poll(1 / 60);
  ok(slider.value === 55, 'RIGHT on a focused slider: +5', slider.value);
  ok(held.size === 0, 'no arrow key left held in the game (the raft would steer by itself on the next trip)', [...held]);
  gp.buttons[PAD.LEFT].pressed = true; pad.poll(1 / 60);
  ok(slider.value === 50 && held.size === 0, 'LEFT: back, and none held', { v: slider.value, held: [...held] });
}

section('rumble: soft at the strike, the heart for an Elder / Ancient; off with the settings');
{
  const T = rig();
  T.bus.emit('fishing:strike', { grade: 'clean' });
  ok(T.rumbles.length === 0, 'no rumble while the pad is not in use');
  T.set(PAD.A, true); T.frame();
  T.bus.emit('fishing:strike', { grade: 'clean' });
  ok(T.rumbles.length === 1 && T.rumbles[0][0] === 'dual-rumble' && T.rumbles[0][1].duration <= 120 && T.rumbles[0][1].strongMagnitude < 0.3, 'a short soft dual-rumble at the strike', T.rumbles[0]);
  T.rumbles.length = 0; T.timers.length = 0;
  T.bus.emit('fishing:hookset', { sizeClass: 'keeper' });
  ok(T.rumbles.length === 0, 'nothing more for a Keeper');
  T.bus.emit('fishing:hookset', { sizeClass: 'elder' });
  const n = P.attachPad && D.LOOP.heart.elder ? (await import('../../src/ui-heart.js')).heartBeats(D.LOOP.heart.elder).length : 0;
  ok(n > 1 && T.rumbles.length === 2 * n && T.rumbles[0][1].strongMagnitude > T.rumbles[T.rumbles.length - 2][1].strongMagnitude, "an Elder: the heart's beats, a lub and a dub each, easing", { n, r: T.rumbles.length });
  T.rumbles.length = 0;
  T.bus.emit('fishing:hookset', { sizeClass: 'elder', ancient: true });
  ok(T.rumbles.length > 0, 'an Ancient too');
  for (const s of [{ screenShake: false }, { haptics: false }, { vibration: false }, { reducedMotion: true }]) {
    const U = rig({ settings: s });
    U.set(PAD.A, true); U.frame();
    U.bus.emit('fishing:strike', { grade: 'clean' }); U.bus.emit('fishing:hookset', { sizeClass: 'elder' });
    ok(U.rumbles.length === 0, `no rumble with ${JSON.stringify(s)}`);
  }
  const W = rig();
  delete W.gp.vibrationActuator;
  W.set(PAD.A, true); W.frame();
  let threw = false;
  try { W.bus.emit('fishing:strike', { grade: 'clean' }); } catch { threw = true; }
  ok(!threw, 'a pad without an actuator: nothing, no error');
}

section('the seams: under the loop only, nothing for mouse, keys or touch');
{
  const m = src('main.js'), f = src('fishing.js'), s = src('ui-screens.js'), p = src('input-pad.js');
  ok(/import \{ attachPad \} from '\.\/input-pad\.js'/.test(m) && /const pad = LOOP_ON \? attachPad\(/.test(m), 'main attaches the pad under the loop only');
  ok(/updateMoveInput\(\);\n  if \(pad\) pad\.poll\(realDt\);/.test(m), 'polled each frame right after the keys\' move');
  ok(/e\.pointerType === 'pad' \? 'key'/.test(m), "the pad's press is a key's latency at the strike");
  ok(/const pa = ctx\.input\?\.padAim;\n    if \(pa && pa\.on === true/.test(f), "fishing's aim reads the pad's only while its A is held");
  ok(/SW && ctx\.input\?\.padSeen === true\) content\.appendChild\(toggleRow\('padHints', 'Controller hints', true\)\)/.test(s), 'Settings: "Controller hints" once a pad is seen, under the loop');
  ok(!/\bring\b.*raft|outline.*player/i.test(p.replace(/never a ring[^\n]*/gi, '')), 'no ring round the raft or the player');
  ok(/if \(li < 0\) \{/.test(p) && /setActive\(true\)/.test(p), 'without a pad (or one at rest) the page is untouched');
}

console.log(`\ninput-pad: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
