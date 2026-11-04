// main.js — bootstrap, game loop, input routing, flow control, saving, debug API.
// See CONTRACT.md §2–§4 (v3: §13.0 rollout, §13.1 flow / ctx / main, §13.6 saving).
import * as THREE from 'three';
// core.js BEFORE data.js: importing it applies the v3 rollout switch (GW_V3 / GW_V3_PHASE, CONTRACT §13.0), and data.js
// reads those globals once, when it evaluates.
import {
  createBus, loadSave, normalizeSave, writeSave, wipeSave, defaultMeta, clamp,
  createSlowmo, v3RunOptions, setV3Flag, V3_FLAGS,
} from './core.js';
import * as data from './data.js';

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
// The measuring ceremony is a cinematic state (CONTRACT §13.1): while ctx.cinematic is set these get dt 0 (no phase clock,
// drains, enemies, director or swarm-window progress). Fishing keeps its dt (it runs the ceremony and freezes its own bite
// timers); actors, render, ui and audio always get real dt.
const CINEMATIC_FROZEN = new Set(['survival', 'combat']);
// Safety valve: the longest ceremony is an Elder's 5 s (SIZE_CLASSES), the card follows at once. A flag held this long
// (running time) is a bug in its owner; main reports it and lets the clock run again rather than freezing the night forever.
const CINEMATIC_MAX = Math.max(20, ...(Array.isArray(data.SIZE_CLASSES) ? data.SIZE_CLASSES : []).map((c) => (Number(c.ceremony) || 0) * 3 + 5));
// v3 is on for this page load (data reads the flag; main reads it for the run options, the save migration and saving).
const V3 = data.V3_ENABLED === true;
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

/** An optional function export of a module namespace (feature detection without a static import of a missing name). */
function moduleExport(mod, name) { const f = mod?.[name]; return typeof f === 'function' ? f : null; }

// ------------------------------------------------------------------ ctx
// core.loadSave() returns the raw envelope {version, meta, run}; v3 migrates it (progression.migrateSave, Pg0 renames the
// ids) BEFORE defaultMeta() is merged (normalizeSave). Flag off: no migration, so normalizeSave gives v1's {meta, run}.
const saveEnvelope = loadSave();
const bootErrors = [];
let migratedAtBoot = false;
let bootSave = saveEnvelope;
const pureMigrate = V3 ? moduleExport(progressionMod, 'migrateSave') : null;
if (pureMigrate) {
  // a module-level (pure) migrateSave runs before any module exists, so nothing ever sees the old ids
  try { bootSave = pureMigrate(saveEnvelope) || saveEnvelope; migratedAtBoot = true; } catch (e) { bootErrors.push(['migrateSave', e]); }
}
const saved = normalizeSave(bootSave);
// Touch mode comes from the input device only. Viewport size drives layout breakpoints in CSS,
// never the control scheme (a short laptop window is still a mouse + keyboard).
const isMobile = (() => {
  try { return matchMedia('(pointer: coarse)').matches || (matchMedia('(hover: none)').matches && navigator.maxTouchPoints > 0); } catch { return false; }
})();

let cinematic = false;
let cinematicFor = 0; // running seconds the flag has been held (the safety valve)
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
  /** The measuring ceremony (CONTRACT §13.1): fishing sets it at startCeremony and clears it when the card opens. */
  get cinematic() { return cinematic; },
  set cinematic(v) { const on = !!v; if (on !== cinematic) { cinematic = on; cinematicFor = 0; } },
};
let savedRun = saved.run; // run waiting to be continued
window.__gw = ctx;

function report(where, err) {
  console.error(`[gloomwater] ${where}:`, err);
  ctx.errors.push(`${where}: ${err?.message || err}`);
}
for (const [where, err] of bootErrors) report(where, err);

// ------------------------------------------------------------------ flow
let autosaveTimer = 0;
// main owns ctx.time.timeScale: slowmo scales it for a beat and restores it (CONTRACT §13.1)
const slowmo = createSlowmo(ctx.time);
const LEAP = data.BALANCE?.bite?.leapReveal || {};
/** Cinematic and slow-motion beats never outlive the run or screen they started in. */
function resetBeats() {
  ctx.cinematic = false;
  slowmo.cancel();
}
/**
 * v3: a run's night mode and outing are locked at creation (progression.createRun owns them, Pg12). If the progression in
 * this build does not set them, main fills them so every module can branch on run.nightMode / run.outing.
 */
function lockRunMode(run, mode) {
  if (!run || run.isStub) return;
  if (typeof run.nightMode !== 'string') run.nightMode = mode.nightMode;
  if (typeof run.outing !== 'string') run.outing = mode.outing;
}
const game = {
  hasSavedRun: () => !!(savedRun && savedRun.active),
  /**
   * New run (title → New Descent). v3 (CONTRACT §13.0): `{character, nightMode}` (+ the v1 `startZone`); run 1
   * (`meta.runs === 0`) is the First Outing (outing 'first', every night still, no choice); later runs take the chosen
   * mode or the default (Lantern).
   */
  startNewRun(opts = {}) {
    const startZone = opts.startZone || 'mossmere';
    const character = opts.character || ctx.state.meta.lastCharacter || null;
    const mode = V3 ? v3RunOptions(ctx.state.meta, opts, data.BALANCE?.nightModes) : null;
    resetBeats();
    let run;
    try { run = ctx.progression.createRun(mode ? { startZone, character, nightMode: mode.nightMode, outing: mode.outing } : { startZone, character }); } catch (e) { report('createRun', e); }
    if (!run || run.isStub) run = fallbackRun(startZone);
    if (mode) lockRunMode(run, mode);
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
    resetBeats();
    // a run saved before v3 was on played v1's nights (a swarm every night): it continues as Gloomtide
    if (V3) lockRunMode(savedRun, { nightMode: 'gloomtide', outing: 'normal' });
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
    resetBeats();
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
    resetBeats();
    ctx.state.run = null;
    ctx.paused = false;
    setFlow('title');
    ctx.ui.showTitle?.();
  },
  pause() { if (ctx.flow === 'playing' && !ctx.paused) { ctx.paused = true; ctx.ui.openPause?.(); } },
  resume() { ctx.paused = false; },
  togglePause() { ctx.paused ? game.resume() : game.pause(); },
  isPaused: () => ctx.paused,
  /**
   * The leap reveal (CONTRACT §13.1; BALANCE.bite.leapReveal: 0.25 s at 0.35): scale time for `seconds` of running time,
   * then restore the time scale that was in force. Returns false (and ends any beat) for seconds <= 0.
   */
  slowmo(seconds = LEAP.time ?? 0.25, scale = LEAP.timescale ?? 0.35) { return slowmo.start(seconds, scale); },
  save() {
    const live = ctx.state.run && ctx.state.run.active ? ctx.state.run : null;
    // v3 (CONTRACT §13.6): the player writes run.pos into the run before every save
    if (V3 && live && ctx.flow === 'playing') { try { ctx.player.writeSave?.(live); } catch (e) { report('player.writeSave', e); } }
    const run = live || (savedRun || null);
    writeSave({ meta: ctx.state.meta, run });
  },
  wipeAll() {
    resetBeats();
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
// v3: a migrateSave that lives on the progression API runs here, after create and before any init (CONTRACT §13.2)
if (V3 && !migratedAtBoot && !ctx.progression.isStub && typeof ctx.progression.migrateSave === 'function') {
  try {
    const s = normalizeSave(ctx.progression.migrateSave(saveEnvelope) || saveEnvelope);
    ctx.state.meta = s.meta;
    savedRun = s.run;
  } catch (e) { report('migrateSave', e); }
}
for (const [name] of MODULES) {
  try { ctx[name].init?.(); } catch (e) { report(`init(${name})`, e); ctx[name] = makeStub(name); }
}

// bus wiring owned by main
ctx.bus.on('player:died', ({ cause }) => game.endRun(cause));
ctx.bus.on('victory', () => game.victory());
['phase:change', 'fish:landed', 'shop:buy', 'relic:buy', 'zone:change'].forEach((e) => ctx.bus.on(e, () => {
  if (ctx.flow === 'playing' || e === 'relic:buy') game.save();
}));
// v3: progression emits fish:measured at the seal stamp with the records already written; saving here means a reload
// right after the stamp keeps the PB and the class first (CONTRACT §13.5, §13.6). The cove (hub) saves on it too.
ctx.bus.on('fish:measured', () => { if (ctx.flow === 'playing' || ctx.flow === 'hub') game.save(); });

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
  // during the measuring ceremony combat and trade are frozen: the press goes to fishing only (it owns the ceremony's skip)
  const cine = ctx.cinematic;
  if (!cine && safe(() => ctx.combat.onPointerDown?.(ndc), false) === true) return;
  if (!cine && safe(() => ctx.actors.pickMerchant?.(ndc), false) === true && safe(() => ctx.progression.canShop?.(), false) === true) {
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
  if (e.isPrimary) {
    // the browser's primary pointer means no other pointer of this kind is down: forget any
    // stale ids (an up lost to a blur or a stolen capture) before tracking this press
    for (const id of downPointers) if (id !== e.pointerId) downPointers.delete(id);
    if (fishPointerId !== null && fishPointerId !== e.pointerId) releaseFishing();
    primaryId = null;
  }
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
  const cine = ctx.cinematic; // the ceremony freezes combat (no Flare) and the world's interactions
  if (e.code === 'Space' || e.code === 'KeyF') { if (!cine) safe(() => ctx.combat.flare?.(), null); e.preventDefault(); }
  else if (e.code === 'KeyE') { if (!cine) safe(() => ctx.player.interact?.(), null); e.preventDefault(); }
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
/** Read another module's state for a debug readout: never reports, never returns a stub. */
function peek(fn, fallback = null) { try { const v = fn(); return v === undefined || (v && v.isStub) ? fallback : v; } catch { return fallback; } }
// a module may have put its own v3 readout on ctx.debug during init (progression does): main's v3() merges it in
const moduleV3 = typeof ctx.debug.v3 === 'function' ? ctx.debug.v3 : null;
Object.assign(ctx.debug, {
  // the base time scale; a running slowmo beat keeps its factor on top of it and restores to this
  timeScale(x = 1) { slowmo.setBase(x); return x; },
  errors: () => ctx.errors.slice(),
  run: () => ctx.state.run,
  /** CONTRACT §13.11: the v3 state at a glance (feature-detected; null where a module does not provide it yet). */
  v3() {
    const r = ctx.state.run;
    const extra = peek(() => moduleV3?.()) || {};
    const known = Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== null && v !== undefined));
    return {
      ...extra,
      flow: ctx.flow, outing: r?.outing ?? null, nightMode: r?.nightMode ?? null, day: r?.day ?? null,
      farWater: peek(() => ctx.progression.getFarWater?.()) ?? r?.farWater ?? null,
      favour: peek(() => ctx.fishing.view?.favour),
      pressure: r?.pressure ?? null,
      liveWell: peek(() => ctx.progression.getLiveWell?.()),
      residents: peek(() => ctx.progression.getResidents?.(r?.zone)),
      ...known, // what the owning module knows wins over main's generic readout
      // main's own facts always win
      enabled: data.V3_ENABLED === true, phase: data.V3_ENABLED ? data.V3_PHASE : null, switch: V3_FLAGS.source,
      cinematic: ctx.cinematic, slowmo: slowmo.state,
    };
  },
  /** The v3 switch for the NEXT load (localStorage; CONTRACT §13.0): setV3(true[, phase]) · setV3(false) · setV3(null) clears. */
  setV3(on = true, phase) { return { stored: setV3Flag(on, phase), now: { enabled: data.V3_ENABLED === true, phase: data.V3_PHASE }, note: 'reload to apply' }; },
  /** Main's beat state: the ceremony flag (and how long it has been held) and the slow-motion beat. */
  beats: () => ({ cinematic: ctx.cinematic, cinematicFor, cinematicMax: CINEMATIC_MAX, slowmo: slowmo.state, timeScale: ctx.time.timeScale }),
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
  if (running) slowmo.tick(realDt);
  time.gameDt = running ? realDt * time.timeScale : 0;
  if (cinematic) {
    if (ctx.flow !== 'playing' && ctx.flow !== 'hub') ctx.cinematic = false; // (the cove's ceremony has no run)
    else if (running && (cinematicFor += realDt) > CINEMATIC_MAX) {
      report('cinematic', new Error(`ctx.cinematic held for ${CINEMATIC_MAX} s of play; released`));
      ctx.cinematic = false;
    }
  }
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
      // the cinematic flag is read live: fishing (updated first) can start the ceremony this very frame
      m.update(GAMEPLAY.has(name) ? (cinematic && CINEMATIC_FROZEN.has(name) ? 0 : time.gameDt) : time.dt, time.t);
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
