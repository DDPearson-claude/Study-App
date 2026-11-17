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
// the Full Hold (docs/loop/slice-1a/PLAN.md §3.5): main's pure guards, tested in node (tools/tests/loop-evening.test.mjs)
import { startRoute, tripKeyAllowed, loopFreshSave } from './loop-rules.js';
import { createLoopHome } from './loop-home.js';
import { createLoopTow } from './loop-tow.js';   // M1 step 5b (LANE 5B-TOW): the opening at the Landing and the tow
import { attachHeron } from './actors-heron.js';   // WC-3 (WATERCRAFT §5.4): the heron on the Mossmere under the loop
import { attachWildlife } from './actors-wildlife.js';   // the Mossmere's wildlife (LOOP.wildlife; ?wild=0 off): the moths and the lampbills
import { attachAmbient } from './world-ambient.js';   // the Mossmere's ambient (LOOP.ambient; ?wild=0 off): the candle-boats
// >>> INTRO LANE B: import (the opening cut scene's director; docs/v3/intro/SPEC.md, CONTRACT §13.13)
import { create as createIntro, markIntroSeen, replayOffered } from './intro.js';
// <<< INTRO LANE B

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
// With the show (AUTOFISH.show, v3): fishing's own valve opens the card show.valve s after the fish breaks the surface, whatever
// state the show is in; main's is the second line, 4 s behind it.
const SHOW_VALVE = data.V3_ENABLED === true ? Number(data.AUTOFISH?.show?.valve) : NaN;
const CINEMATIC_MAX = SHOW_VALVE > 0 ? SHOW_VALVE + 4
  : Math.max(20, ...(Array.isArray(data.SIZE_CLASSES) ? data.SIZE_CLASSES : []).map((c) => (Number(c.ceremony) || 0) * 3 + 5));
// v3 is on for this page load (data reads the flag; main reads it for the run options, the save migration and saving).
const V3 = data.V3_ENABLED === true;
// The Full Hold (docs/loop/SPEC.md, slice-1a/PLAN.md §2.2): catch, keep, sell, upgrade. Read once, here (PLAN §4.1 rule 1). Off the
// loop PARKED is {}, so every PARKED.x is falsy and every loop branch below is skipped: the v1 and v3 builds run as built.
const LOOP_ON = data.LOOP_ENABLED === true;
const PARKED = LOOP_ON ? (data.PARKED || {}) : {};
// The First Evening slice (DESIGN §25.4.8, §25.14.2b; CONTRACT §13.1, §13.12): with v3 on and the cove's data in the build, boot
// builds the cove under the title, Begin on a fresh save plays the First Evening, every new run sets out from the Landing through
// the 3 s glide, and a snuff cuts to the hearth for 3 s before the summary. With v3 off none of it exists.
// Feature detection (CONTRACT §13.0: structure switches by feature detection, not a second flag): the slice runs only once the
// world module can build the cove (`export const SUPPORTS_COVE = true` from the FE-W1 world work). Until then a v3 build keeps
// today's flow — New Descent straight into the lake, the death screen at once — so a half-built opening never ships.
// (the loop replaces the First Evening: under GW_LOOP the slice is off whatever the world can build; M1.md §2.15)
const FE_ON = V3 && !LOOP_ON && !!data.COVE && !!data.FIRST_EVENING && worldMod.SUPPORTS_COVE === true;
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
// The loop's one flag-off rule (PLAN §2.2 item 2, §4.1 rule 9): a trip saved by a loop build and opened with the loop off is sold
// and dropped (its clams paid into meta.loop, the hold emptied), and a descent the loop parked is put back. A no-op for every save
// a flag-off build writes (no `outing: 'trip'`, no meta.loop.parkedRun). Found by feature detection: until progression re-exports
// it, nothing runs.
let strandWrite = false;
{
  const strand = LOOP_ON ? null : moduleExport(progressionMod, 'sellStrandedTrip');
  if (strand) {
    try { const r = strand(bootSave); if (r && (r.sold || r.restored) && r.save) { bootSave = r.save; strandWrite = true; } } catch (e) { bootErrors.push(['sellStrandedTrip', e]); }
  }
}
const pureMigrate = V3 ? moduleExport(progressionMod, 'migrateSave') : null;
if (pureMigrate) {
  // a module-level (pure) migrateSave runs before any module exists, so nothing ever sees the old ids
  try { bootSave = pureMigrate(saveEnvelope) || saveEnvelope; migratedAtBoot = true; } catch (e) { bootErrors.push(['migrateSave', e]); }
}
const saved = normalizeSave(bootSave);
if (strandWrite) { try { writeSave({ meta: saved.meta, run: saved.run }); } catch (e) { bootErrors.push(['sellStrandedTrip write', e]); } }
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
  // (the loop, PLAN §3.5: only a saved TRIP is Continued; a non-trip descent waits, parked at the first Sail, PLAN CHOICE 5)
  hasSavedRun: () => !!(savedRun && savedRun.active) && (!LOOP_ON || savedRun.outing === 'trip'),
  /**
   * New run (title → New Descent). v3 (CONTRACT §13.0): `{character, nightMode}` (+ the v1 `startZone`); run 1
   * (`meta.runs === 0`) is the First Outing (outing 'first', every night still, no choice); later runs take the chosen
   * mode or the default (Lantern).
   */
  startNewRun(opts = {}) {
    // the loop (PLAN §2.2 item 3, CHOICE 2): the film's hand-off goes home to the Jetty; anything else starts a trip
    const route = startRoute({ loopOn: LOOP_ON, intro: !!opts.__intro });
    if (route === 'home') return enterHome('intro');
    if (route === 'trip') return startTrip(opts);
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
    // (INTRO LANE B: the cut scene's hand-off marks its zone:change {intro: true}: the lake is already on screen, SPEC section 7.5)
    ctx.bus.emit('zone:change', { zone: run.zone, prev: FE_ON ? 'cove' : null, ...(opts.__intro ? { intro: true } : {}) });
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
    // the loop (PLAN §2.2 item 10): no saved trip → the Jetty; a saved trip continues with the raft where it was
    if (LOOP_ON && !game.hasSavedRun()) return enterHome('title');
    if (!savedRun) return game.startNewRun();
    resetBeats();
    // a run saved before v3 was on played v1's nights (a swarm every night): it continues as Gloomtide
    if (V3) lockRunMode(savedRun, { nightMode: 'gloomtide', outing: 'normal' });
    ctx.state.run = savedRun;
    savedRun = null;
    ctx.paused = false;
    // the loop: the saved raft place, read now (a save on the way to run:start writes the spawn's place into run.pos)
    const loopPos = LOOP_ON ? (ctx.state.run.pos ?? ctx.state.run.flags?.pos ?? null) : null;
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
    if (LOOP_ON) {   // the raft's place (T32): after run:start, whose listener put it at the lake's spawn
      if (loopPos) { try { ctx.player.restore?.(loopPos); } catch (e) { report('player.restore', e); } }
      loopHome?.moorMurk?.();   // (M1 step 5a: Murk moored at the home barge through the evening, as enterHome moors him)
    }
  },
  endRun(cause = 'unknown') {
    if (LOOP_ON) { endTripHome(cause); return; }   // a trip ends only at home (PLAN §2.2 item 5)
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
    if (LOOP_ON) return;   // (the loop: no victory, no death; a trip ends only at home)
    const meta = ctx.state.meta;
    meta.victory = true;
    meta.victories = (meta.victories || 0) + 1;
    let summary = null;
    try { summary = ctx.progression.summarizeRun?.('victory-preview'); } catch { /* optional */ }
    game.save();
    ctx.ui.showVictory?.(summary && !summary.isStub ? summary : { day: ctx.state.run?.day });
  },
  toTitle() {
    stopIntro();   // INTRO LANE B: a film in progress ends with no event (the save untouched)
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
    if (ctx.flow === 'intro') return;   // INTRO LANE B: nothing is saved while the cut scene plays (a closed tab plays it again; a replay writes nothing)
    const live = ctx.state.run && ctx.state.run.active ? ctx.state.run : null;
    // v3 (CONTRACT §13.6): the player writes run.pos into the run before every save
    if (V3 && live && ctx.flow === 'playing') { try { ctx.player.writeSave?.(live); } catch (e) { report('player.writeSave', e); } }
    const run = live || (savedRun || null);
    writeSave({ meta: ctx.state.meta, run });
  },
  wipeAll() {
    stopIntro(); introFlow.prewarm = false;   // INTRO LANE B: a wiped save is a fresh one again
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

// >>> INTRO LANE B: flow (the opening cut scene: trigger, flow 'intro', the hand-off, the replay; SPEC §7)
// "One Warm Light" (docs/v3/intro/SPEC.md §7, CONTRACT §13.13). The director (src/intro.js, ctx.intro) owns the film's time and
// the stage; main owns everything around it:
//   the trigger   game.introPending(): a fresh save's title says Begin; game.beginIntro() goes straight in (no panel, no click)
//   the flow      'intro': no run, gameDt 0, ctx.cinematic held, no HUD, no save, no input but the skip keys
//   the hand-off  on `intro:done`: meta.intro = {seen, skipped}, then startNewRun({character, nightMode, __intro: true}) in the
//                 same task (flow:change → zone:change {intro: true} → run:start, then the save): the First Outing starts on
//                 the frame the film ended on. A stage error hands over the same way (seen: true: a broken device never loops)
//   the replay    game.replayIntro() from the title's quiet word: the same film, nothing written, back to the title
//   the lake      the film is set on the first run's lake. A title that shows another lake (a returning save) is swapped
//                 under the opening's full ink and put back at the end, with no zone:change for either
// Under the loop (LOOP_ON, slice-1a PLAN §2.2 items 20–24) the trigger is New Descent → Start (game.beginIntro({character})).
// When the cove ships (FE_ON: world.SUPPORTS_COVE) the film is dressed at the sea-gate and hands to the First Evening's wake
// (SPEC §7.5, INTRO.cove): written down, not built. Until that is built the film stays off with the cove on.
const INTRO = V3 ? data.INTRO || null : null;
const INTRO_LAKE = 'mossmere';   // the First Outing's lake (startNewRun's default start zone)
const introFlow = { on: false, replay: false, back: null, idle: 0, prewarm: false, inked: false, wall: 0, swallowUntil: 0 };
/** The film's DOM side (src/ui-intro.js), when the ui module is real. */
function introView() { const u = ctx.ui; return u && !u.isStub && u.intro && typeof u.intro.curtain === 'function' ? u.intro : null; }
const worldZoneId = () => safe(() => ctx.world.getZone?.()?.id, null);
/** Show a lake with no zone:change (no banner, no sting, no save): the world, the raft at its spawn, the water's own maps. */
function showLake(id, grade) {
  const w = ctx.world;
  if (w && !w.isStub && id && worldZoneId() !== id) {
    w.setZone(id, { instant: true, flash: false });
    const sp = w.getSpawn?.();
    if (sp?.position && !ctx.player.isStub) ctx.player.teleport?.(sp.position, Number(sp.yaw) || 0);
    if (!ctx.water.isStub) { ctx.water.setObstacles?.(null); ctx.water.rebakeDepth?.(); }
  }
  if (grade && !ctx.render.isStub) ctx.render.setGrade?.(grade, { instant: true });
}
/**
 * Under the opening's full ink (the director calls it once, before the stage goes live): the film's lake and its grade go on,
 * so the last shot is the run's own picture and nothing pops at the hand-off. A replay remembers what to put back.
 */
function introUnderInk() {
  const zoneWas = worldZoneId();
  const gradeWas = safe(() => ctx.render.getGrade?.(), null);
  const lakeGrade = INTRO?.handoff?.grade === 'ease' ? null : (data.ZONES || []).find((z) => z.id === INTRO_LAKE)?.grade || null;
  if (introFlow.replay) introFlow.back = { zone: zoneWas && zoneWas !== INTRO_LAKE ? zoneWas : null, grade: lakeGrade ? gradeWas : null };
  showLake(INTRO_LAKE, lakeGrade);
  introFlow.inked = !!lakeGrade;
}
function startIntro({ replay = false, reduced } = {}) {
  if (!ctx.intro || !INTRO || FE_ON || ctx.flow !== 'title' || ctx.intro.isActive() || introFlow.on) return false;
  // the title is closed for the game, but its picture stays for the opening ink to close over (ui-intro.js takeTitle): no fade of its own
  try { introView()?.takeTitle?.(); } catch (e) { report('intro.takeTitle', e); }
  try { ctx.ui.closeAll?.(); } catch (e) { report('ui.closeAll', e); }
  resetBeats();
  ctx.state.run = null;
  ctx.paused = false;
  Object.assign(introFlow, { on: true, replay: !!replay, back: null, idle: 0, inked: false, wall: 0, swallowUntil: 0 });
  setFlow('intro');
  ctx.cinematic = true;
  let ok = false;
  try { ok = ctx.intro.start({ replay: !!replay, reduced, underInk: introUnderInk }) === true; } catch (e) { report('intro.start', e); }
  if (!ok && introFlow.on) leaveIntro();   // (it could not start: the title again, nothing changed)
  return ok;
}
/** Out of flow 'intro' to the title with nothing written: what a replay put aside comes back. */
function leaveIntro({ eased = false } = {}) {
  const back = introFlow.back, firstPlay = introFlow.on && !introFlow.replay;   // (read before the flow is reset)
  Object.assign(introFlow, { on: false, replay: false, back: null, idle: 0 });
  if (back) {
    try {
      if (back.zone) showLake(back.zone, back.grade);
      else if (back.grade && !ctx.render.isStub) ctx.render.setGrade?.(back.grade, { instant: !eased });
    } catch (e) { report('intro lake', e); }
  }
  ctx.cinematic = false;
  ctx.state.run = null;
  if (ctx.flow === 'intro') {
    // the loop (PLAN CHOICE 46): a first film abandoned to the title forgets the Wick it was started with, so the title is fresh
    // again (New Descent, not Continue) and no half-begun save is written
    if (LOOP_ON && firstPlay) { try { loopApi()?.setWick?.(null); } catch (e) { report('loop.setWick', e); } }
    setFlow('title'); try { ctx.ui.showTitle?.(); } catch (e) { report('showTitle', e); }
  }
}
/** Hard abort with no event (toTitle, wipeAll, debug 'stop'). `title` also leaves flow 'intro' for the title. */
function stopIntro({ title = false } = {}) {
  if (!ctx.intro) return;
  try { ctx.intro.stop(); } catch (e) { report('intro.stop', e); }
  if (!introFlow.on) return;
  if (title) { leaveIntro(); return; }
  const back = introFlow.back;
  Object.assign(introFlow, { on: false, replay: false, back: null, idle: 0 });
  if (back) { try { if (back.zone) showLake(back.zone, back.grade); else if (back.grade) ctx.render.setGrade?.(back.grade, { instant: true }); } catch (e) { report('intro lake', e); } }
  ctx.cinematic = false;
}
/** `intro:done` (registered after every module's listeners, so they all saw the film end before the run starts). */
function onIntroDone(p = {}) {
  if (!introFlow.on) return;
  if (p.replay) {
    // a replay writes nothing: the title again, over the last frame; another lake comes back under a short curtain of ink
    const inked = !!p.skipped && p.mode === 'veil';   // (a veil skip ends under full ink: the swap is already covered)
    const V = Math.max(0.1, Number(INTRO?.trigger?.replay?.veil) || 0.3), view = introView();
    if (introFlow.back?.zone && !inked && view && view.curtain({ in: V / 2, out: V / 2, onFull: () => leaveIntro() })) return;
    leaveIntro({ eased: !inked });
    return;
  }
  const H = INTRO?.handoff || {}, graded = introFlow.inked;
  Object.assign(introFlow, { on: false, replay: false, back: null, idle: 0, inked: false });
  // a skip lands in play a moment after the key: the same key pressed again (a double Esc) is swallowed for INTRO.skip.after s,
  // so the first second of play never opens on the pause menu (the mirror of the 0.5 s guard at the start)
  // (timed on the frame loop's own clock, `last`, which the keys are compared against too)
  if (p.skipped) introFlow.swallowUntil = last + Math.max(0, Number(INTRO?.skip?.after) || 0.6) * 1000;
  try {
    markIntroSeen(ctx.state.meta, !!p.skipped);
    game.startNewRun({ character: H.character || 'wick', nightMode: H.nightMode || 'still', __intro: true });
    // the lake's grade, if the film did not already wear it (INTRO.handoff.grade 'ease', or a film that broke before the ink):
    // render ignores this zone:change, so it eases in here as control begins
    if (!graded) { const g = (data.ZONES || []).find((z) => z.id === (ctx.state.run?.zone || (LOOP_ON ? INTRO_LAKE : null)))?.grade; if (g && !ctx.render.isStub) ctx.render.setGrade?.(g); }
  } catch (e) {
    report('intro hand-off', e);
    if (ctx.flow === 'intro') { ctx.cinematic = false; setFlow('title'); try { ctx.ui.showTitle?.(); } catch (e2) { report('showTitle', e2); } }
  }
}
/**
 * The director itself failed (its update threw, or the film outlived main's own valve): stop it with no event and hand over as an
 * error (A10). A first play is marked seen and goes into the First Outing, as any skip does; a replay goes back to the title.
 */
function failIntro(why, { reported = false } = {}) {
  if (!ctx.intro) return;
  if (!reported) report('intro', why instanceof Error ? why : new Error(String(why)));
  const replay = introFlow.replay;
  try { ctx.intro.stop(); } catch (e) { report('intro.stop', e); }
  if (introFlow.on) onIntroDone({ skipped: true, error: true, replay, mode: null });
}
/** Once a frame while the flow is 'intro': nothing may open over the film, and a film that ended without its hand-off is let go. */
function tickIntroFlow(rawDt) {
  if (ctx.flow !== 'intro') return;
  if (safe(() => ctx.ui.isBlocking?.(), false) === true) { try { ctx.ui.closeAll?.(); } catch (e) { report('ui.closeAll', e); } }
  if (ctx.intro?.isActive()) {
    introFlow.idle = 0;
    // main's own valve, on the wall clock (the director's runs inside its update): a film still up INTRO.clock.valve + 2 s of
    // visible time after it started is ended here (a debug seek holds the film on purpose and is not counted)
    const held = safe(() => ctx.intro.state.hold, false) === true, hidden = safe(() => document.hidden, false) === true;
    if (!held && !hidden) introFlow.wall += Math.min(0.25, rawDt);
    if (introFlow.wall > (Number(INTRO?.clock?.valve) || 25) + 2) failIntro(new Error(`the cut scene was still playing after ${introFlow.wall.toFixed(1)} s; handed over`));
    return;
  }
  introFlow.idle += Math.min(0.25, rawDt);
  if (introFlow.idle > 1.5) { report('intro', new Error('the cut scene ended without its hand-off; back to the title')); leaveIntro(); }
}
Object.assign(game, {
  /** Would the title's primary word play the film now? (A3: a fresh save, a v3 build; a debug build only after an opt-in.) */
  introPending: () => !!ctx.intro && !FE_ON && ctx.flow === 'title' && ctx.intro.pending(),
  /** Does the title offer the quiet replay word? */
  introReplayOffered: () => !!ctx.intro && !FE_ON && replayOffered({ v3: V3, intro: INTRO, meta: ctx.state.meta, pending: ctx.intro.pending() }),
  /** The fresh title is up: let the stage build in idle time, so Begin costs nothing (SPEC §9). Once per fresh save. */
  prewarmIntro() {
    if (!ctx.intro || introFlow.prewarm) return false;
    introFlow.prewarm = true;
    const P = INTRO?.trigger?.prewarm || {};
    let tries = Math.max(1, Number(P.tries) || 8);
    const idle = (fn) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 80));
    // the stage builds ONE slice per prewarm() call (the models, then one warm-up per part: 9 or 10 in all). An idle period takes as
    // many slices as it has time for; a busy one (a timeout) takes one. Whatever is left when Begin is pressed is built under the ink
    const steps = () => safe(() => ctx.intro.stage?.stats?.().steps?.[0], 0) || 0;
    const go = (deadline) => {
      if (ctx.flow !== 'title' || !ctx.intro || ctx.intro.isActive()) return;
      let ok = false;
      for (;;) {
        const before = steps();
        try { ok = ctx.intro.prewarm() === true; } catch (e) { report('intro.prewarm', e); return; }
        if (ok || --tries <= 0) break;
        // (no step taken: the world cannot say its anchors yet. Ask again on a later slice rather than spin)
        if (steps() === before || !(deadline && typeof deadline.timeRemaining === 'function' && deadline.timeRemaining() > 6)) break;
      }
      if (!ok && tries > 0) idle(go);
    };
    setTimeout(() => {
      // the game makes its smoke and ember pools (two point clouds, one program) at the first puff, which is the Wick's first wax
      // drip a few seconds into any title: have them exist now (one unseen mote under the lake), so that program is compiled
      // under the title and never under the film
      try { if (ctx.flow === 'title' && !ctx.models.isStub && !ctx.player.isStub) ctx.models.emitSmoke?.({ x: ctx.player.position.x, y: -40, z: ctx.player.position.z }, { alpha: 0, lifeT: 0.05, size: 0.01, jitter: 0 }); } catch (e) { report('intro.prewarm pools', e); }
      idle(go);
    }, Math.max(0, Number(P.after) || 0.5) * 1000);
    return true;
  },
  /** The title's Begin on a fresh save: the film, then the First Outing, with no other click. (The loop: New Descent's Start.) */
  beginIntro(opts = {}) {
    if (LOOP_ON) return beginLoopIntro(opts);
    return !game.hasSavedRun() && startIntro({ replay: false, reduced: opts.reduced });
  },
  /** The title's replay word: the same film; nothing is written and it ends at the title. */
  replayIntro(opts = {}) { return startIntro({ replay: true, reduced: opts.reduced }); },
  /** The Skip word and the skip keys (honoured after INTRO.skip.guard). */
  skipIntro() { return ctx.flow === 'intro' && !!ctx.intro && ctx.intro.skip() === true; },
});
// <<< INTRO LANE B

// >>> LOOP LANE B: the Full Hold's evening and home (docs/loop/slice-1a/PLAN.md §2.2 items 3–11, 17, 20–24; §3.5, §5)
// One game mode under GW_LOOP: New Descent's Start → the film → the Jetty (flow `home`, no run) → Sail → the 3 s glide out →
// a trip (outing `trip`) → Home → the sail home → the tally at the Jetty. Main owns the flows; the home flow itself is
// src/loop-home.js (a factory node can drive with a fake player); progression's loop (ctx.progression.loop, lane A) owns every
// number and record; the screens are ui's (lane C). Off the loop nothing here runs.
const SKIP_KEYS = () => (Array.isArray(INTRO?.skip?.keys) ? INTRO.skip.keys : ['Escape', 'Enter', 'NumpadEnter', 'Space']);
let heronW = null;   // WC-3: the heron (attached on the first frame under the loop; false if it cannot be)
let wildW = null;    // the wildlife (the same: attached on the first frame under the loop with LOOP.wildlife.on; false if not)
let ambW = null;     // the ambient's candle-boats (the same, with LOOP.ambient.on)
const loopHome = LOOP_ON ? createLoopHome({
  ctx, data, report, setFlow, resetBeats, showLake, save: () => game.save(), lockRunMode, lake: INTRO_LAKE,
  savedRun: { get: () => savedRun, set: (r) => { savedRun = r; } },
  hasSavedRun: () => game.hasSavedRun(),
  startIntro: (o) => startIntro(o),
  introOn: () => ({ intro: !!ctx.intro && !!INTRO, debug: DEBUG, optIn: safe(() => ctx.intro.state?.optIn, false) === true }),
  tow: () => loopTow,   // M1 step 5b (LANE 5B-TOW): the opening's Landing and first tow take the hand-off while the tow is due
}) : null;
// >>> M1 step 5b (LANE 5B-TOW; SPEC §6.5, OPENING §6.2 rev. 5): the tow, one component (src/loop-tow.js + src/ui-tow.js): the opening
// at the Landing (enterHome's hook) and playTow(water), every later water's first tow; its clock is main's frame (loop below)
const loopTow = LOOP_ON ? createLoopTow({ ctx, data, report, home: () => loopHome, save: () => game.save() }) : null;
Object.assign(game, {
  /** A water's first tow (SPEC §6.5): its leg on the Chart, the ink dip, the glide in to its mooring. → whether it began. */
  playTow: (water, o) => (loopTow ? loopTow.playTow(water, o) : false),
  /** The tow's phase while one plays ('arrive' | 'wake' | 'leg' | 'dip' | … | 'glide'), or null. */
  towing: () => (loopTow ? loopTow.phase : null),
  /** The glide in's camera pull (render's home framing drawn back: 1 at the dip, 0 at the mooring). */
  towCam: () => (loopTow ? loopTow.camPull() : 0),
});
// <<< M1 step 5b
/** progression's loop API (null off the loop, or before lane A wires it). */
function loopApi() { return loopHome ? loopHome.loopApi() : null; }
function enterHome(from, tally = null) { return loopHome ? loopHome.enterHome(from, tally) : false; }
function startTrip(opts) { return loopHome ? loopHome.startTrip(opts) : false; }
function endTripHome(cause) { return loopHome ? loopHome.endTripHome(cause) : false; }
function beginLoopIntro(opts) { return loopHome ? loopHome.beginIntro(opts) : false; }
function skipHomeGlide() { return loopHome ? loopHome.skipHomeGlide() : false; }
const homeGliding = () => !!loopHome && loopHome.gliding() !== null;
Object.assign(game, {
  /** The Chart's Sail (PLAN §2.2 item 4): tutorialDone on the first Sail, closeAll, the 3 s glide out, then startTrip({at}). */
  sail: (plan) => (loopHome ? loopHome.sail(plan) : false),
  /** May the player go home now? → {ok, why} (PLAN §3.5). */
  canGoHome: (o) => (loopHome ? loopHome.canGoHome(o) : { ok: false, why: 'flow' }),
  /** Home (the pill's press and hold, or the pause's Home). */
  goHome: (o) => (loopHome ? loopHome.goHome(o) : false),
  /** The title's Continue at home. */
  toHome: () => enterHome('title', null),
  /** At home (no trip saved): the title's Continue goes to the Jetty. */
  atHome: () => LOOP_ON && !game.hasSavedRun(),
  /** The title's fresh branch (PLAN §2.2 item 21): New Descent · Settings while nothing of the loop has begun. */
  loopFresh: () => LOOP_ON && loopFreshSave(ctx.state.meta, game.hasSavedRun()),
  /** A home glide is running (the hand-off, the sail home or the glide out): its kind, or null. */
  homeGlide: () => (loopHome ? loopHome.gliding() : null),
  /** M1 step 3a: the place whose mist is lifting at a trip's start (its few seconds hold the evening still), or null. */
  lifting: () => (loopHome ? loopHome.lifting() : null),
});
/** M1 step 3a: a tap or a skip key while a place's mist lifts ends that lift at once (marked; the next due one follows). */
const loopLifting = () => !!loopHome && ctx.flow === 'playing' && loopHome.lifting() !== null;
// <<< LOOP LANE B

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
// >>> INTRO LANE B: create (v3 only; null with the flag off)
ctx.intro = null;
if (V3 && data.INTRO) {
  try { ctx.intro = createIntro(ctx, { debug: DEBUG, hasSavedRun: () => game.hasSavedRun() }); ctx.intro.init(); } catch (e) { report('create(intro)', e); ctx.intro = null; }
  // the hand-off: wired here, after every module's own listeners, so each of them saw `intro:done` before the run starts
  if (ctx.intro) ctx.bus.on('intro:done', onIntroDone);
}
// <<< INTRO LANE B

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
  // the loop's home (PLAN §2.2 items 8, 22): a tap during a home glide skips it; nothing reaches fishing or combat (the Jetty's taps
  // are the ui's). gameAcceptsInput is false in flow home, so this comes first.
  if (LOOP_ON && ctx.flow === 'home') { if (!safe(() => ctx.ui.isBlocking?.(), false) && homeGliding()) skipHomeGlide(); return; }
  if (LOOP_ON && loopLifting()) { if (!ctx.paused && !safe(() => ctx.ui.isBlocking?.(), false)) loopHome.skipLift(); return; }   // (no cast during a lift)
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
  // during the show (from the fish breaking the surface to its card: the reveal, then the frozen world of ctx.cinematic) combat
  // and trade take no press: it goes to fishing only, which owns the show's hurry
  const cine = ctx.cinematic || (V3 && safe(() => ctx.fishing.inShow, false) === true);
  // (the loop parks combat and the run's shop, PLAN §2.2 item 9: a tap is fishing's)
  if (!cine && !PARKED.combat && safe(() => ctx.combat.onPointerDown?.(ndc), false) === true) return;
  if (!cine && !PARKED.runShop && safe(() => ctx.actors.pickMerchant?.(ndc), false) === true && safe(() => ctx.progression.canShop?.(), false) === true) {
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
  // >>> INTRO LANE B: keys (while the film plays only the skip keys do anything; nothing reaches the game or a focused element)
  if (ctx.flow === 'intro') {
    if (e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.code)) return;   // (the browser's own keys stay the browser's)
    e.preventDefault();
    if (!e.repeat && (INTRO?.skip?.keys || []).includes(e.code)) game.skipIntro();   // (a held Enter from Begin never skips)
    return;
  }
  if (introFlow.swallowUntil && last < introFlow.swallowUntil && (INTRO?.skip?.keys || []).includes(e.code)) { e.preventDefault(); return; }
  // <<< INTRO LANE B
  // the loop's home (PLAN §2.2 item 8, R23): while a home glide runs and no screen is up, a skip key ends it at its end (the
  // Escape that skipped the film was swallowed above); otherwise the keys at home are the ui's (the Jetty's home pause)
  if (LOOP_ON && ctx.flow === 'home' && homeGliding() && !e.repeat && SKIP_KEYS().includes(e.code) && !safe(() => ctx.ui.isBlocking?.(), false)) {
    skipHomeGlide(); e.preventDefault(); return;
  }
  // M1 step 3a: a skip key while a place's mist lifts ends that lift (the pause waits for it: Escape skips the lift first)
  if (LOOP_ON && loopLifting() && !ctx.paused && !e.repeat && SKIP_KEYS().includes(e.code) && !safe(() => ctx.ui.isBlocking?.(), false)) {
    loopHome.skipLift(); e.preventDefault(); return;
  }
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
  // v3, the show (the fish has broken the surface; the Wick presents it): Space / Enter hurry it to its card, as a tap does
  // (fishing owns the rule: the reveal is never cut, a first-ever species or a personal best keeps its 0.8 s). No Flare under it.
  if (V3 && (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') && safe(() => ctx.fishing.inShow, false) === true) { if (!e.repeat) safe(() => ctx.fishing.hurryShow?.(), null); e.preventDefault(); return; }
  const cine = ctx.cinematic; // the ceremony freezes combat (no Flare) and the world's interactions
  // the loop's trip (T58): no Flare, no E (Murk is home, the gate is scenery); the strike and the hurry were routed above
  if (LOOP_ON && ctx.state.run?.outing === 'trip' && !tripKeyAllowed(e.code, { biting: biting(), inShow: safe(() => ctx.fishing.inShow, false) === true })) {
    if (e.code === 'Space' || e.code === 'KeyF' || e.code === 'KeyE') e.preventDefault();
    return;
  }
  if (e.code === 'Space' || e.code === 'KeyF') { if (!cine && !PARKED.combat) safe(() => ctx.combat.flare?.(), null); e.preventDefault(); }
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
// >>> INTRO LANE B: debug (CONTRACT §13.13: one hook, registered only in a debug build; 'intro' is in core.HIDDEN_DEBUG_HOOKS)
if (V3 && DEBUG && ctx.intro) {
  /**
   * intro()                      → the readout {phase, t, beat, line, replay, reduced, skipped, hold, optIn, pending, stage}
   * intro('play', {replay, reduced}) · intro('seek', t) · intro('resume') · intro('skip') · intro('stop')
   * intro('auto', bool)          → opt this page in to (or out of) auto-play on a fresh save's Begin
   * intro('prewarm')             → build the set now (as the fresh-save title does in idle time)
   */
  ctx.debug.intro = (cmd, arg) => {
    const d = ctx.intro;
    const readout = () => ({ ...d.state, pending: d.pending(), flow: ctx.flow, seen: !!ctx.state.meta.intro?.seen, stage: peek(() => d.stage?.stats?.()),
      view: peek(() => introView()?.debug()), back: introFlow.back ? { ...introFlow.back, grade: !!introFlow.back.grade } : null });
    switch (cmd) {
      case undefined: return readout();
      // 'play' goes through the real flow: {replay: false} is the fresh save's Begin (it hands over to a run), anything else the replay
      case 'play': { const o = arg && typeof arg === 'object' ? arg : {}; if (o.replay === false) game.beginIntro(o); else game.replayIntro(o); return readout(); }
      // 'seek' holds the film at t (a replay, started through the flow if idle) and draws its words at once
      case 'seek': if (!d.isActive()) game.replayIntro({}); d.seek(Number(arg) || 0); introView()?.sync(); return readout();
      case 'resume': d.resume(); return readout();
      case 'skip': if (!game.skipIntro()) d.skip(); return readout();
      case 'stop': stopIntro({ title: true }); introView()?.update(0); return readout();
      case 'auto': d.setOptIn(arg !== false); return readout();
      case 'prewarm': d.prewarm(); return readout();
      default: return null;
    }
  };
}
// <<< INTRO LANE B
// >>> LOOP LANE B: debug (PLAN §2.2 items 17, 23; 'loop' is in core.HIDDEN_DEBUG_HOOKS: debug builds only)
if (LOOP_ON && DEBUG) {
  ctx.debug.loop = {
    state: () => loopApi()?.state?.() ?? null,
    giveClams: (n) => loopApi()?.debugGive?.(n) ?? null,
    bites: (key) => loopApi()?.bitesSpent?.(key) ?? null,
    home: () => game.goHome(),
    sail: (w) => game.sail({ water: w }),
    /** tutorial() the record · tutorial(step) jump to a beat · 'done' mark it done · 'reset' begin it again (progression's resetTutorial) */
    tutorial(step) {
      const L = loopApi();
      if (!L) return null;
      if (step === 'done') L.tutorialDone?.();
      else if (step === 'reset') { if (typeof L.resetTutorial === 'function') L.resetTutorial(); else return false; }
      else if (typeof step === 'string') { L.beginTutorial?.(); L.setTutorialStep?.(step); }
      return L.tutorial?.() ?? null;
    },
    /** wick() the chosen Wick · wick(id) choose one (the title or home only: never on a trip) */
    wick(id) {
      const L = loopApi();
      if (!L) return null;
      if (id !== undefined && ctx.flow !== 'playing') { const w = data.loopWickId(id); L.setWick?.(w); safe(() => ctx.actors.setCharacter?.(w), null); }
      return L.wick?.() ?? null;
    },
    /** what main knows of home: the flow, the glide (kind) and the latch of a Sail */
    /** M1 step 5b (LANE 5B-TOW): tow() the tow's readout · tow('tap') a tap on it */
    tow: (cmd) => loopTow?.debug?.(cmd) ?? null,
    homeState: () => ({ flow: ctx.flow, glide: loopHome?.gliding() ?? null, sailing: !!loopHome?.sailing, atHome: game.atHome(), fresh: game.loopFresh(),
      sailPlace: loopHome?.sailPlace ?? null, lift: loopHome?.liftState?.() ?? null }),
    // M1 step 3a (PLAN §2.2 item 6): the places for the scenarios. They write meta.loop directly (a debug build's shortcut past the shelf)
    /** own(id | 'all') owns a place map (or every place of the Mossmere) and saves; its lift plays on the next trip. → the owned ids */
    own(id = 'all') {
      const ml = loopApi()?.state?.();
      if (!ml || typeof ml !== 'object') return null;
      if (!Array.isArray(ml.maps?.places)) { ml.maps = { ...(ml.maps || {}), places: [] }; }
      for (const p of debugPlaceIds(id)) if (!ml.maps.places.includes(p)) ml.maps.places.push(p);
      game.save(); loopHome?.syncPlaces();
      return ml.maps.places.slice();
    },
    /** lift(id | 'all', {play}) lifts a place's mist (owning it first): on a trip its lift beat plays now (play: false lifts it at
     *  once, no beat); at home it is marked lifted. → {lifting, lifted} */
    lift(id = 'all', { play = true } = {}) {
      const ml = loopApi()?.state?.();
      if (!ml || typeof ml !== 'object') return null;
      ctx.debug.loop.own(id);
      const ids = debugPlaceIds(id).filter((p) => !(ml.lifted || []).includes(p));
      const trip = ctx.flow === 'playing' && ctx.state.run?.outing === 'trip';
      if (trip && play && ids.length) loopHome?.beginLifts(ids);
      else {
        for (const p of ids) {
          loopApi()?.markLifted?.(p);
          safe(() => ctx.world.liftMist?.(p, 0), null);
        }
        game.save(); loopHome?.syncPlaces();
      }
      return { lifting: loopHome?.lifting() ?? null, lifted: (ml.lifted || []).slice() };
    },
    /** giveBait(id, n, {fit}): n of a bait (the Heartmoss Ball) into the Mossmere's bag (and the trip's, on a trip); fit: on the line. */
    giveBait(id = 'heartmoss', n = 1, { fit = false } = {}) {
      const ml = loopApi()?.state?.();
      if (!ml || typeof ml !== 'object') return null;
      const k = Math.max(0, Math.round(Number(n) || 0)), zone = ctx.state.run?.zone || 'mossmere';
      ml.bait = ml.bait && typeof ml.bait === 'object' ? ml.bait : {};
      ml.bait[zone] = { ...(ml.bait[zone] || {}), [id]: ((ml.bait[zone]?.[id]) | 0) + k };
      const r = ctx.state.run;
      if (r && r.outing === 'trip') { r.bait = r.bait || {}; r.bait[id] = (r.bait[id] | 0) + k; }
      if (fit) loopApi()?.fit?.('bait', id);   // the ledger's fit (on a trip it puts the ball on the line too)
      game.save();
      return { bag: { ...ml.bait[zone] }, trip: r?.outing === 'trip' ? { ...(r.bait || {}) } : null, fitted: { ...(ml.fitted || {}) } };
    },
    /** at(placeId): the raft put into a place's water (its centre; a path's middle), facing on. → {x, z} */
    at(placeId) {
      const p = data.loopPlace?.(placeId);
      if (!p) return null;
      const a = p.area || {}, pt = a.kind === 'path' && Array.isArray(a.pts) && a.pts.length >= 2
        ? { x: (a.pts[0][0] + a.pts[a.pts.length - 1][0]) / 2, z: (a.pts[0][1] + a.pts[a.pts.length - 1][1]) / 2 }
        : { x: Number.isFinite(a.x) ? a.x : p.x, z: Number.isFinite(a.z) ? a.z : p.z };
      safe(() => ctx.player.teleport?.(pt, ctx.player.heading ?? 0), null);
      return pt;
    },
    /** places() → {owned, lifted, due, lifting, banks} (banks: the world's readout, ctx.debug.world.places(), when it has one) */
    places: () => {
      const p = loopHome?.placesNow?.() ?? { owned: [], lifted: [] };
      return { ...p, due: peek(() => loopApi()?.liftDue?.(), []), lifting: loopHome?.lifting() ?? null, lift: loopHome?.liftState?.() ?? null,
        banks: peek(() => ctx.debug.world?.places?.()) ?? peek(() => ctx.world.places?.()) ?? null };
    },
    /** the drawn Chart (M1 step 3b): chart() its state · chart('fixture', state | places) the M1 §2.4 places drawn before step 3a
     *  ships them · chart('layout') the last layout and its targets · chart('clear') */
    chart: (cmd, arg) => safe(() => ctx.ui?.loop?.chartDebug?.(cmd, arg), null),
  };
}
/** debug: a place id, or 'all' (the Mossmere's places in the Chart's order), as the ids LOOP.places holds. */
function debugPlaceIds(id) {
  const all = Object.keys(data.LOOP?.places || {});
  return id === 'all' ? (data.loopPlaceIds?.('mossmere') ?? all) : (all.includes(id) ? [id] : []);
}
// <<< LOOP LANE B
// M2 (CONTRACT §13.1, §13.11): a release build (v3, debug off) exposes no species, roll, plan or pre-roll on window.__gw
if (V3 && !DEBUG) { for (const k of HIDDEN_DEBUG_HOOKS) delete ctx.debug[k]; }


// ------------------------------------------------------------------ loop
let last = performance.now();
const errorCounts = new Map();
function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = Math.max(0, (now - last) / 1000);   // (INTRO LANE B: the cut scene clamps its own dt, INTRO.clock)
  const realDt = clamp(rawDt, 0, 0.05);
  last = now;
  const time = ctx.time;
  time.dt = realDt;
  time.t += realDt;
  time.frame++;
  updateMoveInput();
  const blocking = safe(() => ctx.ui.isBlocking?.(), false) === true;
  // v3: the hub (the Landing) runs too; survival and combat idle there (CONTRACT §13.1)
  const inHub = FE_ON && ctx.flow === 'hub';
  // the loop's home (PLAN §2.2 item 8): the Jetty runs (the glides, the raft at its dock); survival and combat idle there, as in the hub
  const inHome = LOOP_ON && ctx.flow === 'home';
  const running = (ctx.flow === 'playing' || inHub || inHome) && !ctx.paused && !blocking;
  if (running) slowmo.tick(realDt);
  time.gameDt = running ? realDt * time.timeScale : 0;
  if (cinematic) {
    if (ctx.flow !== 'playing' && ctx.flow !== 'hub' && ctx.flow !== 'intro') ctx.cinematic = false; // (the cove's ceremony has no run; INTRO LANE B: the cut scene holds the flag, its own valve ends it)
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

  // >>> INTRO LANE B: frame (the film's clock runs on real elapsed time, before the modules, so they all see this frame's moment)
  if (ctx.intro) {
    // (a director that throws ends the film at once: A10, any exception inside the cut scene ends it cleanly into the game)
    try { ctx.intro.update(rawDt); } catch (e) { const n = (errorCounts.get('intro') || 0) + 1; errorCounts.set('intro', n); if (n <= 3) report('update(intro)', e); failIntro(e, { reported: true }); }
    tickIntroFlow(rawDt);
  }
  // <<< INTRO LANE B
  for (const name of UPDATE_ORDER) {
    const m = ctx[name];
    if (!m || m.isStub || !m.update) continue;
    try {
      // the cinematic flag is read live: fishing (updated first) can start the ceremony this very frame
      m.update(GAMEPLAY.has(name) ? ((cinematic || inHub || inHome) && CINEMATIC_FROZEN.has(name) ? 0 : time.gameDt) : time.dt, time.t);
    } catch (e) {
      const n = (errorCounts.get(name) || 0) + 1;
      errorCounts.set(name, n);
      if (n <= 3 || n % 300 === 0) report(`update(${name}) [x${n}]`, e);
    }
  }
  // the loop (M1 step 3a): a place's lift runs on the real clock while the game runs (a pause or a blocking screen holds it)
  if (loopHome) { try { loopHome.update(running ? realDt : 0); } catch (e) { const n = (errorCounts.get('loopHome') || 0) + 1; errorCounts.set('loopHome', n); if (n <= 3) report('update(loopHome)', e); } }
  // M1 step 5b (LANE 5B-TOW): the tow's clock (real time; it waits by itself while another screen is over its Chart)
  if (loopTow) { try { loopTow.update(realDt); } catch (e) { const n = (errorCounts.get('loopTow') || 0) + 1; errorCounts.set('loopTow', n); if (n <= 3) report('update(loopTow)', e); } }
  // (the catch show, its reveal close-up from T0 as well as the lift's ctx.cinematic: the wildlife keeps out of it; main hands them the flag, they read no fishing)
  const wildShow = LOOP_ON && safe(() => ctx.fishing.inShow, false) === true;
  if (LOOP_ON && heronW !== false) { try { if (!heronW) { heronW = attachHeron(ctx) || false; if (heronW) ctx.debug.heron = heronW.state; } if (heronW) heronW.update(running ? realDt : 0, { show: wildShow }); } catch (e) { heronW = false; report('update(heron)', e); } }   // WC-3: the heron
  if (LOOP_ON && wildW !== false) { try { if (!wildW) { wildW = attachWildlife(ctx) || false; if (wildW) ctx.debug.wildlife = wildW.state; } if (wildW) wildW.update(running ? realDt : 0, { show: wildShow }); } catch (e) { wildW = false; report('update(wildlife)', e); } }   // the moths and the lampbills
  if (LOOP_ON && ambW !== false) { try { if (!ambW) { ambW = attachAmbient(ctx) || false; if (ambW) ctx.debug.ambient = ambW.state; } if (ambW) ambW.update(running ? realDt : 0, { show: wildShow }); } catch (e) { ambW = false; report('update(ambient)', e); } }   // the candle-boats
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
