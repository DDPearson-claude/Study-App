// main.js — bootstrap, game loop, input routing, flow control, saving, debug API.
// See CONTRACT.md §2–§4.
import * as THREE from 'three';
import * as data from './data.js';
import { createBus, loadSave, writeSave, wipeSave, defaultMeta, clamp } from './core.js';

import * as renderMod from './render.js';
import * as waterMod from './water.js';
import * as worldMod from './world.js';
import * as modelsMod from './models.js';
import * as actorsMod from './actors.js';
import * as progressionMod from './progression.js';
import * as survivalMod from './survival.js';
import * as playerMod from './player.js';
import * as combatMod from './combat.js';
import * as fishingMod from './fishing.js';
import * as audioMod from './audio.js';
import * as uiMod from './ui.js';

const MODULES = [
  ['render', renderMod], ['water', waterMod], ['world', worldMod], ['models', modelsMod],
  ['actors', actorsMod], ['progression', progressionMod], ['survival', survivalMod],
  ['player', playerMod], ['combat', combatMod], ['fishing', fishingMod], ['audio', audioMod], ['ui', uiMod],
];
const GAMEPLAY = new Set(['player', 'fishing', 'survival', 'combat', 'progression']);
const UPDATE_ORDER = ['player', 'fishing', 'survival', 'combat', 'progression', 'actors', 'models', 'world', 'water', 'audio', 'ui', 'render'];

// ------------------------------------------------------------------ stub
function makeStub(label) {
  const fn = function () { return stub; };
  const stub = new Proxy(fn, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === 'then') return undefined;
      if (prop === Symbol.iterator) return function* () {};
      if (prop === 'toString') return () => `[stub ${label}]`;
      if (prop === 'valueOf') return () => 0;
      if (prop === 'isStub') return true;
      return stub;
    },
    apply() { return stub; },
    construct() { return stub; },
    set() { return true; },
  });
  return stub;
}

// ------------------------------------------------------------------ ctx
const saved = loadSave();
// Touch mode comes from the input device only. Viewport size drives layout breakpoints in CSS,
// never the control scheme (a short laptop window is still a mouse + keyboard).
const isMobile = (() => {
  try { return matchMedia('(pointer: coarse)').matches || (matchMedia('(hover: none)').matches && navigator.maxTouchPoints > 0); } catch { return false; }
})();

const ctx = {
  THREE,
  bus: createBus(),
  state: { meta: saved.meta, run: null },
  data,
  time: { dt: 0, gameDt: 0, t: 0, gameT: 0, timeScale: 1, frame: 0 },
  flow: 'boot',
  paused: false,
  input: { down: false, x: 0, y: 0, ndc: new THREE.Vector2(), pressed: false, released: false, keys: new Set(), move: new THREE.Vector2(), joy: new THREE.Vector2() },
  debug: {},
  isMobile,
  errors: [],
};
let savedRun = saved.run; // run waiting to be continued
window.__gw = ctx;

function report(where, err) {
  console.error(`[gloomwater] ${where}:`, err);
  ctx.errors.push(`${where}: ${err?.message || err}`);
}

// ------------------------------------------------------------------ flow
let autosaveTimer = 0;
const game = {
  hasSavedRun: () => !!(savedRun && savedRun.active),
  startNewRun(opts = {}) {
    const startZone = opts.startZone || 'mossmere';
    const character = opts.character || ctx.state.meta.lastCharacter || null;
    let run;
    try { run = ctx.progression.createRun({ startZone, character }); } catch (e) { report('createRun', e); }
    if (!run || run.isStub) run = fallbackRun(startZone);
    if (run.character) ctx.state.meta.lastCharacter = run.character;
    ctx.state.run = run;
    savedRun = null;
    ctx.state.meta.runs = (ctx.state.meta.runs || 0) + 1;
    ctx.paused = false;
    setFlow('playing');
    ctx.bus.emit('zone:change', { zone: run.zone, prev: null });
    ctx.bus.emit('run:start', { continued: false });
    game.save();
  },
  continueRun() {
    if (!savedRun) return game.startNewRun();
    ctx.state.run = savedRun;
    savedRun = null;
    ctx.paused = false;
    setFlow('playing');
    ctx.bus.emit('zone:change', { zone: ctx.state.run.zone, prev: null });
    ctx.bus.emit('run:start', { continued: true });
  },
  endRun(cause = 'unknown') {
    if (ctx.flow !== 'playing' || !ctx.state.run) return;
    let summary = null;
    try { summary = ctx.progression.summarizeRun(cause); } catch (e) { report('summarizeRun', e); }
    if (!summary || summary.isStub) summary = { cause, day: ctx.state.run.day, memories: 0, breakdown: [], records: [] };
    const meta = ctx.state.meta;
    if (cause !== 'victory' && cause !== 'abandoned') meta.deaths = (meta.deaths || 0) + 1;
    meta.bestDay = Math.max(meta.bestDay || 0, ctx.state.run.day || 0);
    ctx.state.run.active = false;
    setFlow('dead');
    ctx.bus.emit('run:end', { summary });
    game.save();
    ctx.ui.showDeath?.(summary);
  },
  victory() {
    const meta = ctx.state.meta;
    meta.victory = true;
    meta.victories = (meta.victories || 0) + 1;
    let summary = null;
    try { summary = ctx.progression.summarizeRun?.('victory-preview'); } catch { /* optional */ }
    game.save();
    ctx.ui.showVictory?.(summary && !summary.isStub ? summary : { day: ctx.state.run?.day });
  },
  toTitle() {
    if (ctx.flow === 'playing' && ctx.state.run?.active) { savedRun = ctx.state.run; }
    game.save();
    ctx.state.run = null;
    ctx.paused = false;
    setFlow('title');
    ctx.ui.showTitle?.();
  },
  pause() { if (ctx.flow === 'playing' && !ctx.paused) { ctx.paused = true; ctx.ui.openPause?.(); } },
  resume() { ctx.paused = false; },
  togglePause() { ctx.paused ? game.resume() : game.pause(); },
  isPaused: () => ctx.paused,
  save() {
    const run = ctx.state.run && ctx.state.run.active ? ctx.state.run : (savedRun || null);
    writeSave({ meta: ctx.state.meta, run });
  },
  wipeAll() {
    wipeSave();
    ctx.state.meta = defaultMeta();
    ctx.state.run = null;
    savedRun = null;
    setFlow('title');
    ctx.ui.showTitle?.();
  },
};
ctx.game = game;

function setFlow(flow) {
  const prev = ctx.flow;
  ctx.flow = flow;
  if (prev !== flow) ctx.bus.emit('flow:change', { flow, prev });
}

function fallbackRun(startZone) {
  return {
    active: true, id: 'run_' + Date.now(), seed: (Math.random() * 1e9) | 0, playTime: 0,
    day: 1, phase: 'calm', phaseTime: 0, zone: startZone, zonesUnlocked: [startZone],
    hp: 5, oil: 100, satiety: 100, shells: 0, bait: {}, equippedBait: null, creel: [],
    upgrades: {}, legendaries: {}, bounties: [], gateOpen: false, character: null,
    level: 1, xp: 0, xpNext: 10, boons: {}, rerollsUsed: 0,
    stats: { fishCaught: 0, fishLost: 0, perfectHooks: 0, enemiesSlain: 0, elitesSlain: 0, bossesSlain: 0, shellsEarned: 0, biggest: null, newSpecies: 0, damageTaken: 0, nightsSurvived: 0, nightsNoDamage: 0, maxLevel: 1 },
    flags: {},
  };
}

// ------------------------------------------------------------------ module creation
const host = document.getElementById('game');
for (const [name, mod] of MODULES) {
  try {
    const api = mod.create ? mod.create(ctx) : null;
    ctx[name] = api || makeStub(name);
  } catch (e) {
    report(`create(${name})`, e);
    ctx[name] = makeStub(name);
  }
}
if (ctx.render?.canvas && !ctx.render.isStub && !ctx.render.canvas.parentElement) host.appendChild(ctx.render.canvas);
for (const [name] of MODULES) {
  try { ctx[name].init?.(); } catch (e) { report(`init(${name})`, e); ctx[name] = makeStub(name); }
}

// bus wiring owned by main
ctx.bus.on('player:died', ({ cause }) => game.endRun(cause));
ctx.bus.on('victory', () => game.victory());
['phase:change', 'fish:landed', 'shop:buy', 'relic:buy', 'zone:change'].forEach((e) => ctx.bus.on(e, () => {
  if (ctx.flow === 'playing' || e === 'relic:buy') game.save();
}));

// ------------------------------------------------------------------ input
const input = ctx.input;
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try { ctx.audio.unlock?.(); } catch (e) { report('audio.unlock', e); }
}
function toNdc(e, out) {
  return out.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
}
function setPointer(e) {
  input.x = e.clientX; input.y = e.clientY;
  toNdc(e, input.ndc);
}
function gameAcceptsInput() {
  return ctx.flow === 'playing' && !ctx.paused && !safe(() => ctx.ui.isBlocking?.(), false);
}
function safe(fn, fallback) { try { const v = fn(); return v && v.isStub ? fallback : v; } catch (e) { report('input', e); return fallback; } }

// Multi-touch (DESIGN §3.2): one finger holds the reel while another taps gloomlings. Only the
// pointer whose press reached fishing (fishPointerId) moves the aim or releases the hold; any
// other pointer zaps / opens the shop and never touches fishing while that hold lasts.
// input.ndc / input.down follow the primary pointer (the fishing pointer while one exists).
const downPointers = new Set();
let fishPointerId = null;
let primaryId = null;
const tapNdc = new THREE.Vector2();
function pressAction(e) {
  if (!gameAcceptsInput()) return;
  const ndc = toNdc(e, tapNdc);
  if (safe(() => ctx.combat.onPointerDown?.(ndc), false) === true) return;
  if (safe(() => ctx.actors.pickMerchant?.(ndc), false) === true && safe(() => ctx.progression.canShop?.(), false) === true) {
    ctx.ui.openShop?.();
    return;
  }
  if (fishPointerId !== null && e.pointerId !== fishPointerId) return; // a second finger never re-enters fishing
  fishPointerId = e.pointerId;
  setPointer(e);
  safe(() => ctx.fishing.onPointerDown?.(), null);
}
function releaseFishing() {
  if (fishPointerId === null) return;
  fishPointerId = null;
  safe(() => ctx.fishing.onPointerUp?.(), null);
}

host.addEventListener('pointerdown', (e) => {
  unlockAudio();
  downPointers.add(e.pointerId);
  if (primaryId === null && fishPointerId === null) { primaryId = e.pointerId; setPointer(e); input.pressed = true; }
  input.down = true;
  try { host.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
  pressAction(e);
  e.preventDefault();
});
host.addEventListener('pointermove', (e) => {
  const own = fishPointerId !== null ? e.pointerId === fishPointerId : (primaryId === null || e.pointerId === primaryId);
  if (!own) return;
  setPointer(e);
  if (fishPointerId !== null && gameAcceptsInput()) safe(() => ctx.fishing.onPointerMove?.(input.ndc), null);
});
const up = (e) => {
  if (!downPointers.delete(e.pointerId)) return;
  const wasFish = e.pointerId === fishPointerId;
  if (wasFish || e.pointerId === primaryId) setPointer(e);
  if (e.pointerId === primaryId) primaryId = null;
  if (wasFish) releaseFishing();
  input.down = fishPointerId !== null || primaryId !== null;
  if (!input.down) input.released = true;
};
host.addEventListener('pointerup', up);
host.addEventListener('pointercancel', up);
host.addEventListener('lostpointercapture', up);
host.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('pointerdown', unlockAudio, { capture: true });

window.addEventListener('keydown', (e) => {
  unlockAudio();
  if (e.repeat && e.code === 'Space') { e.preventDefault(); return; }
  input.keys.add(e.code);
  if (safe(() => ctx.ui.handleKey?.(e.code), false) === true) { e.preventDefault(); return; }
  // Space is the flare key: while a run is on screen (incl. a level-up / catch card that just
  // popped up, or the fresh death screen) it must never fall through and click a focused button.
  if (e.code === 'Space' && (ctx.flow === 'playing' || ctx.flow === 'dead')) e.preventDefault();
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (ctx.flow === 'playing') { game.togglePause(); e.preventDefault(); }
    return;
  }
  if (MOVE_KEYS.has(e.code)) e.preventDefault();
  if (!gameAcceptsInput()) return;
  if (e.code === 'Space' || e.code === 'KeyF') { safe(() => ctx.combat.flare?.(), null); e.preventDefault(); }
  else if (e.code === 'KeyE') { safe(() => ctx.player.interact?.(), null); e.preventDefault(); }
});
window.addEventListener('keyup', (e) => {
  input.keys.delete(e.code);
  if (e.code === 'Space' && (ctx.flow === 'playing' || ctx.flow === 'dead')) e.preventDefault();
});
const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
function updateMoveInput() {
  const k = input.keys;
  let x = 0, y = 0;
  if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
  if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
  if (k.has('KeyW') || k.has('ArrowUp')) y += 1;
  if (k.has('KeyS') || k.has('ArrowDown')) y -= 1;
  input.move.set(x, y);
  if (input.move.lengthSq() > 1) input.move.normalize();
}
window.addEventListener('blur', () => {
  input.keys.clear();
  input.move.set(0, 0);
  input.joy.set(0, 0);
  downPointers.clear(); primaryId = null;
  if (input.down) { input.down = false; input.released = true; }
  releaseFishing();
});

// ------------------------------------------------------------------ resize / visibility
function onResize() {
  try { ctx.render.resize?.(innerWidth, innerHeight); } catch (e) { report('resize', e); }
}
window.addEventListener('resize', onResize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { game.save(); if (ctx.flow === 'playing' && !ctx.paused) game.pause(); }
});
window.addEventListener('pagehide', () => game.save());

// ------------------------------------------------------------------ debug helpers
Object.assign(ctx.debug, {
  timeScale(x = 1) { ctx.time.timeScale = x; return x; },
  errors: () => ctx.errors.slice(),
  run: () => ctx.state.run,
});

// ------------------------------------------------------------------ loop
let last = performance.now();
const errorCounts = new Map();
function frame(now) {
  requestAnimationFrame(frame);
  const realDt = clamp((now - last) / 1000, 0, 0.05);
  last = now;
  const time = ctx.time;
  time.dt = realDt;
  time.t += realDt;
  time.frame++;
  updateMoveInput();
  const blocking = safe(() => ctx.ui.isBlocking?.(), false) === true;
  const running = ctx.flow === 'playing' && !ctx.paused && !blocking;
  time.gameDt = running ? realDt * time.timeScale : 0;
  time.gameT += time.gameDt;
  if (running && ctx.state.run) {
    ctx.state.run.playTime = (ctx.state.run.playTime || 0) + time.gameDt;
    autosaveTimer += realDt;
    if (autosaveTimer > 30) { autosaveTimer = 0; game.save(); }
  }

  for (const name of UPDATE_ORDER) {
    const m = ctx[name];
    if (!m || m.isStub || !m.update) continue;
    try {
      m.update(GAMEPLAY.has(name) ? time.gameDt : time.dt, time.t);
    } catch (e) {
      const n = (errorCounts.get(name) || 0) + 1;
      errorCounts.set(name, n);
      if (n <= 3 || n % 300 === 0) report(`update(${name}) [x${n}]`, e);
    }
  }
  try { if (!ctx.render.isStub) ctx.render.render?.(); } catch (e) {
    const n = (errorCounts.get('render()') || 0) + 1;
    errorCounts.set('render()', n);
    if (n <= 3) report('render()', e);
  }
  input.pressed = false;
  input.released = false;
}

// ------------------------------------------------------------------ start
onResize();
setFlow('title');
try { ctx.ui.showTitle?.(); } catch (e) { report('showTitle', e); }
const loader = document.getElementById('loader');
if (loader) { loader.classList.add('done'); setTimeout(() => loader.remove(), 1200); }
requestAnimationFrame((n) => { last = n; frame(n); });
ctx.bus.emit('boot', {});
