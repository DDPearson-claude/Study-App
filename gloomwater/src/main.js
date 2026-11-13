// main.js — bootstrap, game loop, input routing, flow control, saving, debug API.
// See CONTRACT.md §2–§4 (v3: §13.0 rollout, §13.1 flow / ctx / main, §13.6 saving).
import * as THREE from 'three';
// core.js BEFORE data.js: importing it applies the v3 rollout switch (GW_V3 / GW_V3_PHASE, CONTRACT §13.0), and data.js
// reads those globals once, when it evaluates.
import {
  createBus, loadSave, normalizeSave, writeSave, wipeSave, defaultMeta, clamp,
  createSlowmo, v3RunOptions, setV3Flag, V3_FLAGS,
  debugEnabled, HIDDEN_DEBUG_HOOKS, firstEveningLegacy,
} from './core.js';
import * as data from './data.js';
import { create as createFirstEvening } from './first-evening.js';

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
// The First Evening slice (DESIGN §25.4.8, §25.14.2b; CONTRACT §13.1, §13.12): with v3 on and the cove's data in the build, boot
// builds the cove under the title, Begin on a fresh save plays the First Evening, every new run sets out from the Landing through
// the 3 s glide, and a snuff cuts to the hearth for 3 s before the summary. With v3 off none of it exists.
const FE_ON = V3 && !!data.COVE && !!data.FIRST_EVENING;
const FE = FE_ON ? data.FIRST_EVENING : null;
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
// the First Evening's legacy step (CONTRACT §13.2; progression owns it, main applies the same idempotent rule as a fallback):
// only while meta.firstEvening is undefined — a v1 / v2 / P1-era save with runs or a lake fish → {done: true, legacy: true}
if (FE_ON) { try { firstEveningLegacy(saved.meta, data.COVE.fishing?.species); } catch (e) { bootErrors.push(['firstEveningLegacy', e]); } }
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
// v3 hub state (main owns it): the zone the world shows, the departure in progress, a replay's sandbox, the hearth cut
const hub = {
  zone: null,              // the last zone:change's zone ('cove' while the Landing is built)
  departing: null,         // {opts} while the every-run glide runs
  sandbox: null,           // the meta snapshot (JSON) while a replay of the First Evening runs: no save writes anything
  hearth: null,            // {t, summary} while a snuff shows the hearth (FIRST_EVENING.snuffed.hearth s)
  glides: 'real',          // debug builds: 'skip' makes every later run's glide pass at once (tests); release builds are always real
};
const DEBUG = V3 && debugEnabled();
if (DEBUG) hub.glides = 'skip';

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
    // v3 (DESIGN §25.4.8): every new run sets out from the Landing: the raft at the jetty, the 3 s glide under the arch, then the
    // run. A fresh save's first new game is the First Evening (a release build never lets New Descent skip it).
    if (FE_ON && !opts.__arch) return departFromLanding(opts);
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
    hub.departing = null;
    setFlow('playing');
    // v3: the run leaves the cove (CONTRACT §13.3: prev 'cove'; progression resets the market, audio plays `setout`)
    ctx.bus.emit('zone:change', { zone: run.zone, prev: FE_ON ? 'cove' : null });
    ctx.bus.emit('run:start', { continued: false });
    game.save();
  },
  /** v3 (CONTRACT §13.1, §13.12): the title's Begin. A fresh save plays the First Evening (resuming a quit one); otherwise false. */
  begin() {
    if (!FE_ON || !ctx.firstEvening) return false;
    const fe = feState();
    if (fe.done) return false;
    savedRun = null;
    enterHub('boot');
    if (fe.step) ctx.firstEvening.resume(); else ctx.firstEvening.start();
    return true;
  },
  /** v3: Settings → Replay the first evening, or the legacy ribbon ({fromRibbon: true}): the slice in a sandbox that writes nothing. */
  replayFirstEvening({ fromRibbon = false } = {}) {
    if (!FE_ON || !ctx.firstEvening || ctx.firstEvening.isActive()) return false;
    const fe = feState();
    if (fromRibbon) { fe.offerSeen = true; game.save(); }   // the ribbon goes away for good on use (saved before the sandbox)
    hub.sandbox = JSON.stringify(ctx.state.meta);
    enterHub('title');
    ctx.firstEvening.start({ replay: true });
    return true;
  },
  /** v3: the legacy ribbon's "Not now" (the offer goes away for good). */
  dismissFirstEveningOffer() { if (!FE_ON) return false; feState().offerSeen = true; game.save(); return true; },
  /** v3: the First Evening's offer ribbon shows on a legacy save's title until used or dismissed. */
  firstEveningOffer() { if (!FE_ON) return false; const fe = feState(); return !!fe.legacy && !fe.offerSeen; },
  /** CONTRACT §13.1 Map Table confirm (the First Outing card in the FE slice). */
  planSetOut(plan = {}) {
    if (!FE_ON) return { ok: false, msg: '' };
    if (ctx.firstEvening?.isActive?.() && ctx.firstEvening.step === 'plan') { ctx.firstEvening.onPlan(plan); return { ok: true, msg: '' }; }
    return { ok: false, msg: 'The Map Table opens with the Landing.' };
  },
  cancelSetOut() { if (FE_ON && ctx.firstEvening?.step === 'plan') ctx.firstEvening.onCardClosed(); },
  continueRun() {
    if (!savedRun) return game.startNewRun();
    resetBeats();
    // a run saved before v3 was on played v1's nights (a swarm every night): it continues as Gloomtide
    if (V3) lockRunMode(savedRun, { nightMode: 'gloomtide', outing: 'normal' });
    ctx.state.run = savedRun;
    savedRun = null;
    ctx.paused = false;
    setFlow('playing');
    if (FE_ON) {
      // CONTRACT §13.4 Continue: the title orbited the cove, so prev is 'cove' and `continued` marks the Continue
      ctx.bus.emit('zone:change', { zone: ctx.state.run.zone, prev: hub.zone || 'cove', continued: true });
      ctx.bus.emit('run:start', { continued: true });
      const pos = ctx.state.run.pos ?? ctx.state.run.flags?.pos;
      if (pos) { try { ctx.player.restore?.(pos); } catch (e) { report('player.restore', e); } }
      return;
    }
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
    if (FE_ON && cause !== 'victory' && cause !== 'abandoned') { hearthCut(summary); return; }
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
    if (FE_ON) { stopFirstEvening(); hub.departing = null; hub.hearth = null; }
    game.save();
    resetBeats();
    const prevZone = hub.zone;
    ctx.state.run = null;
    ctx.paused = false;
    setFlow('title');
    // CONTRACT §13.1: from an expedition, the cove is rebuilt under the title (the run stays in the save)
    if (FE_ON && prevZone !== 'cove') ctx.bus.emit('zone:change', { zone: 'cove', hub: true, prev: prevZone, from: 'title' });
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
    if (hub.sandbox !== null) return;   // a replay of the First Evening writes nothing (DESIGN §25.4.8)
    const live = ctx.state.run && ctx.state.run.active ? ctx.state.run : null;
    // v3 (CONTRACT §13.6): the player writes run.pos into the run before every save
    if (V3 && live && ctx.flow === 'playing') { try { ctx.player.writeSave?.(live); } catch (e) { report('player.writeSave', e); } }
    const run = live || (savedRun || null);
    writeSave({ meta: ctx.state.meta, run });
  },
  wipeAll() {
    resetBeats();
    if (FE_ON) { stopFirstEvening(); hub.sandbox = null; hub.departing = null; hub.hearth = null; }
    wipeSave();
    ctx.state.meta = defaultMeta();
    if (FE_ON) firstEveningLegacy(ctx.state.meta, data.COVE.fishing?.species);
    ctx.state.run = null;
    savedRun = null;
    setFlow('title');
    if (FE_ON && hub.zone !== 'cove') ctx.bus.emit('zone:change', { zone: 'cove', hub: true, prev: hub.zone, from: 'title' });
    ctx.ui.showTitle?.();
  },
};
ctx.game = game;

// ------------------------------------------------------------------ v3: the Landing (CONTRACT §13.1, §13.3, §13.12)
/** meta.firstEvening (progression owns it; created lazily, never by defaultMeta). */
function feState() {
  const m = ctx.state.meta;
  if (!m.firstEvening || typeof m.firstEvening !== 'object') firstEveningLegacy(m, data.COVE?.fishing?.species);
  return m.firstEvening;
}
/** The world shows the cove (built under the title at boot; rebuilt after a run). */
function ensureCove(from) {
  if (hub.zone === 'cove') return;
  ctx.bus.emit('zone:change', { zone: 'cove', hub: true, prev: hub.zone, from });
}
/** Flow `hub` (the Landing): survival and combat idle, no 30 s autosave; `hub:enter {from}` (CONTRACT §13.1). */
function enterHub(from) {
  resetBeats();
  ctx.state.run = null;
  ctx.paused = false;
  try { ctx.ui.closeAll?.(); } catch (e) { report('ui.closeAll', e); }
  setFlow('hub');
  ensureCove(from === 'boot' ? 'title' : from);
  ctx.bus.emit('hub:enter', { from });
  game.save();
}
function stopFirstEvening() {
  const fe = ctx.firstEvening;
  if (!fe?.isActive?.()) return;
  try { fe.stop?.(); } catch (e) { report('firstEvening.stop', e); }
  if (hub.sandbox !== null) restoreSandbox();
}
function restoreSandbox() {
  const snap = hub.sandbox;
  hub.sandbox = null;
  if (snap === null) return;
  const m = ctx.state.meta, fresh = JSON.parse(snap);
  for (const k of Object.keys(m)) delete m[k];
  Object.assign(m, fresh);
}
/**
 * Every later run (FIRST_EVENING.everyRun; CONTRACT §13.1): New Descent → the cove with the raft at its mooring → the 3 s glide under
 * the arch (tap to skip after the first) with one rotating Murk line → at the arch line the run starts. `run:start` never fires
 * without the glide. A release build sends a fresh save's first new game to the First Evening instead.
 */
function departFromLanding(opts = {}) {
  const fe = feState();
  if (!fe.done && !DEBUG && ctx.firstEvening) { game.begin(); return; }
  if (hub.departing) return;
  resetBeats();
  savedRun = null;
  ctx.state.run = null;
  ctx.paused = false;
  try { ctx.ui.closeAll?.(); } catch (e) { report('ui.closeAll', e); }
  hub.departing = { opts: { ...opts } };
  setFlow('hub');
  ensureCove('title');
  const E = FE.everyRun || {};
  const lines = Array.isArray(E.murk) ? E.murk : [];
  const runs = Math.max(0, Number(ctx.state.meta.runs) || 0);
  const key = lines.length ? lines[runs % lines.length] : null;
  const text = key ? FE.text?.[key] || '' : '';
  if (text) ctx.bus.emit('firstEvening:line', { kind: 'murk', key, text, hold: Number(FE.lines?.murkHold ?? 2.4) + Number(FE.lines?.murkPerChar ?? 0.05) * text.length, everyRun: true });
  const skippable = E.skippableAfterFirst !== false && (runs > 0 || !!fe.done);
  const arch = () => { if (!hub.departing) return; const o = hub.departing.opts; game.startNewRun({ ...o, __arch: true }); };
  let started = false;
  try { started = !!ctx.player.setOutFromMooring?.({ onLine: arch, skippable }); } catch (e) { report('player.setOutFromMooring', e); }
  if (!started) { arch(); return; }   // no player glide in this build: the run starts at once (never without the cove)
  if (hub.glides === 'skip') { try { ctx.player.skipGlide?.(); } catch (e) { report('player.skipGlide', e); } if (hub.departing) arch(); }
}
/** A snuff cuts to the hearth for 3 s (FIRST_EVENING.snuffed) before the Snuffed summary. */
function hearthCut(summary) {
  const S = FE.snuffed || {};
  hub.hearth = { t: Number(S.hearth) || 3, summary };
  ctx.bus.emit('zone:change', { zone: 'cove', hub: true, prev: hub.zone, from: 'snuffed' });
  const text = FE.text?.[S.line || 'snuffedLine'] || '';
  ctx.bus.emit('firstEvening:line', { kind: 'lore', key: S.line || 'snuffedLine', text, hold: hub.hearth.t, snuffed: true });
  ctx.bus.emit('firstEvening:beat', { id: 'hearth', dur: hub.hearth.t, step: null });
}
function tickHearth(dt) {
  if (!hub.hearth) return;
  hub.hearth.t -= dt;
  if (hub.hearth.t > 0) return;
  const summary = hub.hearth.summary;
  hub.hearth = null;
  ctx.bus.emit('firstEvening:line', { kind: 'lore', key: null, text: '' });
  if (ctx.flow === 'dead') ctx.ui.showDeath?.(summary);
}

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
// v3: the First Evening director (CONTRACT §13.12), created when the build carries it
if (FE_ON) {
  try { ctx.firstEvening = createFirstEvening(ctx); } catch (e) { report('create(firstEvening)', e); ctx.firstEvening = null; }
}
for (const [name] of MODULES) {
  try { ctx[name].init?.(); } catch (e) { report(`init(${name})`, e); ctx[name] = makeStub(name); }
}
if (ctx.firstEvening) { try { ctx.firstEvening.init(); } catch (e) { report('init(firstEvening)', e); ctx.firstEvening = null; } }

// bus wiring owned by main
ctx.bus.on('zone:change', ({ zone } = {}) => { if (zone) hub.zone = zone; });
ctx.bus.on('player:died', ({ cause }) => game.endRun(cause));
if (FE_ON) {
  // the First Evening (CONTRACT §13.12): main saves meta.firstEvening.step at each checkpoint (not in a replay) and, at the arch
  // crossing, starts the First Outing (P1–P2: startNewRun({character: 'wick', nightMode: 'still'}); run 1 is the First Outing)
  ctx.bus.on('firstEvening:step', ({ id, replay, skipped } = {}) => {
    if (replay || hub.sandbox !== null) return;
    const fe = feState();
    fe.step = id || null;
    if (skipped) fe.skipped = true;
    game.save();
  });
  ctx.bus.on('firstEvening:done', ({ replay } = {}) => {
    if (replay) {
      restoreSandbox();   // meta is the snapshot again, byte for byte (nothing was saved during the replay)
      ctx.state.run = null;
      setFlow('title');
      ctx.ui.showTitle?.();
      return;
    }
    const fe = feState();
    fe.done = true; fe.step = null;
    const S = FE.setOut || {};
    // after every listener has seen firstEvening:done (CONTRACT §13.12 order: done → zone:change → run:start)
    queueMicrotask(() => {
      if (ctx.flow !== 'hub' || ctx.state.run) return;
      game.startNewRun({ character: S.character || 'wick', nightMode: S.nightMode || 'still', __arch: true });
    });
  });
}
ctx.bus.on('victory', () => game.victory());
['phase:change', 'fish:landed', 'shop:buy', 'relic:buy', 'zone:change'].forEach((e) => ctx.bus.on(e, () => {
  if (ctx.flow === 'playing' || e === 'relic:buy') game.save();
}));
// v3 hub saves (CONTRACT §13.6): on hub:enter (main saves in enterHub) and on visibilitychange / pagehide (below)
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
  const live = ctx.flow === 'playing' || (FE_ON && ctx.flow === 'hub');
  return live && !ctx.paused && !safe(() => ctx.ui.isBlocking?.(), false);
}
/** v3 (CONTRACT §13.1): while fishing.state is 'bite' the pointer and Space / Enter go to the strike first, in every flow and mode. */
const biting = () => V3 && safe(() => ctx.fishing.state, null) === 'bite';
/** v3: the strike tap. `kind` = 'touch' | 'mouse' | 'key' (AUTOFISH.strike.latencyComp). */
function strikeTap(kind) {
  input.kind = kind;
  const f = ctx.fishing;
  if (typeof f.strike === 'function') return safe(() => f.strike(kind), null);
  safe(() => f.onPointerDown?.({ input: kind }), null);   // fishing grades the tap after its input's latency (AUTOFISH.strike.latencyComp)
  if (kind === 'key') safe(() => f.onPointerUp?.(), null);
  return true;
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
  if (V3) {
    const kind = e.pointerType === 'touch' || e.pointerType === 'pen' ? 'touch' : 'mouse';
    input.kind = kind;
    // the strike takes input priority during the bite (before zaps, Murk's barge and Flare)
    if (biting() && !ctx.cinematic) {
      if (fishPointerId !== null && e.pointerId !== fishPointerId) return;
      fishPointerId = e.pointerId;
      setPointer(e);
      strikeTap(kind);
      return;
    }
    if (FE_ON && ctx.flow === 'hub') { hubPress(e); return; }
  }
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
  if (V3) safe(() => ctx.fishing.onPointerDown?.({ input: input.kind }), null);
  else safe(() => ctx.fishing.onPointerDown?.(), null);
}
/** The Landing (CONTRACT §13.1 pointer routing in the hub): the First Evening's taps, a skippable glide, then cove fishing. No zap. */
function hubPress(e) {
  const fe = ctx.firstEvening;
  if (fe?.isActive?.()) {
    if (fe.step === 'framing' || fe.step === 'wake') { fe.hurry(); return; }
    if (fe.locksInput()) return;
  }
  if (safe(() => ctx.player.glideState, null)) { safe(() => ctx.player.skipGlide?.(), null); return; }
  if (hub.departing) return;
  if (fishPointerId !== null && e.pointerId !== fishPointerId) return;
  fishPointerId = e.pointerId;
  setPointer(e);
  safe(() => ctx.fishing.onPointerDown?.({ input: input.kind }), null);
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
  if (FE_ON && ctx.flow === 'hub') { if (MOVE_KEYS.has(e.code)) e.preventDefault(); if (hubKey(e)) { e.preventDefault(); return; } }
  // Space is the flare key: while a run is on screen (incl. a level-up / catch card that just
  // popped up, or the fresh death screen) it must never fall through and click a focused button.
  if (e.code === 'Space' && (ctx.flow === 'playing' || ctx.flow === 'dead')) e.preventDefault();
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (ctx.flow === 'playing') { game.togglePause(); e.preventDefault(); }
    return;
  }
  if (MOVE_KEYS.has(e.code)) e.preventDefault();
  if (!gameAcceptsInput()) return;
  // v3: Space / Enter strike during the bite (F stays Flare); outside it Space flares as before
  if (V3 && (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') && biting() && !ctx.cinematic) { strikeTap('key'); e.preventDefault(); return; }
  const cine = ctx.cinematic; // the ceremony freezes combat (no Flare) and the world's interactions
  if (e.code === 'Space' || e.code === 'KeyF') { if (!cine) safe(() => ctx.combat.flare?.(), null); e.preventDefault(); }
  else if (e.code === 'KeyE') { if (!cine) safe(() => ctx.player.interact?.(), null); e.preventDefault(); }
});
/** Keys in the hub: Esc / Enter skip the framing; Space / Enter / Esc skip a skippable glide; E uses a post; no Flare, no pause. */
function hubKey(e) {
  if (safe(() => ctx.ui.isBlocking?.(), false) || ctx.paused) return false;
  const fe = ctx.firstEvening, code = e.code;
  const enter = code === 'Enter' || code === 'NumpadEnter';
  if (fe?.isActive?.() && fe.step === 'framing' && (code === 'Escape' || enter)) { fe.skipWord(); return true; }
  if (fe?.isActive?.() && fe.step === 'wake' && (code === 'Escape' || enter || code === 'Space')) { fe.hurry(); return true; }
  if (biting() && (code === 'Space' || enter)) { strikeTap('key'); return true; }
  if (safe(() => ctx.player.glideState, null) && (code === 'Space' || enter || code === 'Escape')) { safe(() => ctx.player.skipGlide?.(), null); return true; }
  if (code === 'KeyE') { if (!fe?.locksInput?.()) safe(() => ctx.player.interact?.(), null); return true; }
  return code === 'Space' || code === 'Escape' || code === 'KeyP' || code === 'KeyF';
}
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
  /** M2: is this a debug build (?debug=1, localStorage gw.debug, GW_DEBUG)? Hidden-state hooks exist only then (v3). */
  debugEnabled: () => (V3 ? DEBUG : debugEnabled()),
});
if (FE_ON) Object.assign(ctx.debug, {
  /** CONTRACT §13.11: firstEvening(step | 'reset' | 'done') — jump to a step, clear meta.firstEvening, or mark it done. No arg: the readout. */
  firstEvening(step) {
    const fe = ctx.firstEvening;
    if (step === undefined) return fe ? { ...fe.state, meta: ctx.state.meta.firstEvening ? { ...ctx.state.meta.firstEvening } : null, hub: { zone: hub.zone, departing: !!hub.departing, sandbox: hub.sandbox !== null, hearth: hub.hearth ? +hub.hearth.t.toFixed(2) : null, glides: hub.glides } } : null;
    if (!fe) return false;
    if (step === 'reset' || step === 'done') return fe.debugJump(step);
    if (ctx.flow !== 'hub') enterHub('title');
    return fe.debugJump(step);
  },
  firstEveningLosses: (n) => ctx.firstEvening?.setLosses(n) ?? null,
  /** CONTRACT §13.11: a fresh save (wipe + reload-equivalent state: meta.firstEvening {done: false}). */
  freshSave() { game.wipeAll(); return ctx.state.meta.firstEvening ? { ...ctx.state.meta.firstEvening } : null; },
  /** Debug builds: 'skip' passes every later run's glide at once (the default for tests), 'real' plays it. */
  glides(mode) { if (mode === 'skip' || mode === 'real') hub.glides = mode; return hub.glides; },
  hub: () => ({ flow: ctx.flow, zone: hub.zone, departing: !!hub.departing, sandbox: hub.sandbox !== null, hearth: hub.hearth ? +hub.hearth.t.toFixed(2) : null, glides: hub.glides }),
});
// M2 (CONTRACT §13.1, §13.11): a release build (v3, debug off) exposes no species, roll, plan or pre-roll on window.__gw
if (V3 && !DEBUG) { for (const k of HIDDEN_DEBUG_HOOKS) delete ctx.debug[k]; }


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
  // v3: the hub (the Landing) runs too; survival and combat idle there (CONTRACT §13.1)
  const inHub = FE_ON && ctx.flow === 'hub';
  const running = (ctx.flow === 'playing' || inHub) && !ctx.paused && !blocking;
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
      m.update(GAMEPLAY.has(name) ? ((cinematic || inHub) && CINEMATIC_FROZEN.has(name) ? 0 : time.gameDt) : time.dt, time.t);
    } catch (e) {
      const n = (errorCounts.get(name) || 0) + 1;
      errorCounts.set(name, n);
      if (n <= 3 || n % 300 === 0) report(`update(${name}) [x${n}]`, e);
    }
  }
  if (FE_ON) {
    // the First Evening's clock (lines, beats) runs on the hub's game time (stopped by a pause or a blocking card); the hearth cut
    if (ctx.firstEvening) { try { ctx.firstEvening.update(inHub ? time.gameDt : 0); } catch (e) { const n = (errorCounts.get('firstEvening') || 0) + 1; errorCounts.set('firstEvening', n); if (n <= 3) report('update(firstEvening)', e); } }
    if (hub.hearth && ctx.flow === 'dead') tickHearth(realDt);
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
// v3 (CONTRACT §13.1 Boot): the world builds the cove so the title orbits it
if (FE_ON) { try { ctx.bus.emit('zone:change', { zone: 'cove', hub: true, prev: null, from: 'boot' }); } catch (e) { report('boot cove', e); } }
try { ctx.ui.showTitle?.(); } catch (e) { report('showTitle', e); }
const loader = document.getElementById('loader');
if (loader) { loader.classList.add('done'); setTimeout(() => loader.remove(), 1200); }
requestAnimationFrame((n) => { last = n; frame(n); });
ctx.bus.emit('boot', {});
