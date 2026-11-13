// core.js — shared foundation: event bus, RNG, math helpers, save/load.
// Owned by the integrator. Every module may import from here.
import * as THREE from 'three';

export const VERSION = 1;
export const SAVE_KEY = 'gloomwater.save.v1';

// ---------------------------------------------------------------- event bus
export function createBus() {
  const map = new Map();
  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set());
      map.get(evt).add(fn);
      return () => map.get(evt)?.delete(fn);
    },
    once(evt, fn) {
      const off = this.on(evt, (p) => { off(); fn(p); });
      return off;
    },
    off(evt, fn) { map.get(evt)?.delete(fn); },
    emit(evt, payload = {}) {
      const set = map.get(evt);
      if (!set) return;
      for (const fn of [...set]) {
        try { fn(payload); } catch (err) { console.error(`[bus] handler for "${evt}" threw`, err); }
      }
    },
  };
}

// ---------------------------------------------------------------- math
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
export const remap = (v, a0, a1, b0, b1) => lerp(b0, b1, clamp(invLerp(a0, a1, v)));
export const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
/** Frame-rate independent exponential approach: damp(current, target, lambda, dt). */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const TAU = Math.PI * 2;

// ---------------------------------------------------------------- RNG
/** Seedable PRNG (mulberry32). rng() -> [0,1). */
export function makeRng(seed = 1) {
  let s = seed >>> 0;
  const rng = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.range = (a, b) => a + (b - a) * rng();
  rng.int = (a, b) => Math.floor(a + (b - a + 1) * rng()); // inclusive
  rng.pick = (arr) => arr[Math.floor(rng() * arr.length)];
  rng.chance = (p) => rng() < p;
  /** weighted pick: items = [{w:number, ...}] or (items, weightFn) */
  rng.weighted = (items, wf = (i) => i.w) => {
    let total = 0;
    for (const it of items) total += Math.max(0, wf(it));
    if (total <= 0) return items[0];
    let r = rng() * total;
    for (const it of items) { r -= Math.max(0, wf(it)); if (r <= 0) return it; }
    return items[items.length - 1];
  };
  return rng;
}
/** Shared non-deterministic RNG for cosmetic randomness. */
export const rand = makeRng((Math.random() * 2 ** 32) >>> 0);

let uidCounter = 0;
export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${(uidCounter++).toString(36)}`;

// ---------------------------------------------------------------- color helpers
export const color = (c) => new THREE.Color(c);
export function hexToCss(hex) { return '#' + new THREE.Color(hex).getHexString(); }

// ---------------------------------------------------------------- storage (always guarded)
export const storage = {
  get(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
  },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

// ---------------------------------------------------------------- v3 rollout switch (CONTRACT §13.0, DESIGN §25.14.1)
// data.js reads `globalThis.GW_V3` / `GW_V3_PHASE` once, when it evaluates. main.js imports this module BEFORE data.js,
// so the switch below runs first. Precedence:
//   1. preset globals (a v3 build's template.html, or a tool that sets them itself) win and are left untouched;
//   2. the page URL: `?v3` / `?v3=1|on|true` or `?v3=0|off|false`, plus `?v3phase=1..4` (this load only);
//   3. localStorage `gloomwater.v3` (`{on, phase}`; written by `__gw.debug.setV3(on, phase)`, survives reloads);
//   4. the shipped default, V3_ROLLOUT.
// Only an "on" result writes the globals (GW_V3 = true, GW_V3_PHASE = phase); "off" writes nothing, so the flag-off game
// evaluates data.js exactly as before. Node tools (no document) are never touched.
/** The shipped default. Flip `on` and raise `phase` only in the commit that passes that phase's gate (DESIGN §25.14.1). */
export const V3_ROLLOUT = Object.freeze({ on: false, phase: 1 });
export const V3_FLAG_KEY = 'gloomwater.v3';

function parseFlagOn(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase();
  if (s === '' || s === '1' || s === 'on' || s === 'true' || s === 'yes') return true;
  if (s === '0' || s === 'off' || s === 'false' || s === 'no') return false;
  return null;
}
function parseFlagPhase(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Math.floor(Number(v));
  return n >= 1 && n <= 4 ? n : null;
}

/**
 * Pure resolution of the v3 switch. `preset` = {v3, phase} read from globalThis; `search` = location.search;
 * `stored` = the parsed localStorage value. Returns {on, phase, source: 'preset'|'url'|'storage'|'default', apply}
 * where `apply` says whether the globals must be written (only when this switch itself turns v3 on).
 */
export function resolveV3Flags({ preset = null, search = '', stored = null, rollout = V3_ROLLOUT } = {}) {
  if (preset && typeof preset.v3 === 'boolean') {
    // data.js defaults an unset phase to 4 (tools see the whole design)
    return { on: preset.v3, phase: preset.v3 ? parseFlagPhase(preset.phase) ?? 4 : null, source: 'preset', apply: false };
  }
  let on = null, phase = null, source = 'default';
  if (stored !== null && stored !== undefined) {
    const so = typeof stored === 'object' ? parseFlagOn(stored.on) : parseFlagOn(typeof stored === 'number' ? stored : String(stored));
    if (so !== null) { on = so; source = 'storage'; }
    if (typeof stored === 'object') phase = parseFlagPhase(stored.phase);
  }
  let q = null;
  try { q = new URLSearchParams(search || ''); } catch { q = null; }
  if (q && q.has('v3')) {
    const u = parseFlagOn(q.get('v3'));
    if (u !== null) { on = u; source = 'url'; }
  }
  if (q && q.has('v3phase')) phase = parseFlagPhase(q.get('v3phase')) ?? phase;
  if (on === null) { on = !!rollout.on; source = 'default'; }
  const ph = on ? phase ?? parseFlagPhase(rollout.phase) ?? 1 : null;
  return { on, phase: ph, source, apply: on };
}

/** Reads the URL / localStorage (browser pages only) and writes GW_V3 / GW_V3_PHASE when the result is "on". */
export function applyV3Flags(g = globalThis) {
  const preset = { v3: g.GW_V3, phase: g.GW_V3_PHASE };
  let search = '', stored = null;
  if (typeof g.document !== 'undefined') {
    try { search = g.location?.search || ''; } catch { search = ''; }
    stored = storage.get(V3_FLAG_KEY);
  }
  const r = resolveV3Flags({ preset, search, stored });
  if (r.apply) { g.GW_V3 = true; g.GW_V3_PHASE = r.phase; }
  return r;
}

/** Stores the switch for the next load (`on` null clears it back to the URL / shipped default). Returns the stored value. */
export function setV3Flag(on, phase) {
  if (on === null || on === undefined) { storage.remove(V3_FLAG_KEY); return null; }
  const val = { on: !!on, phase: parseFlagPhase(phase) ?? V3_ROLLOUT.phase };
  storage.set(V3_FLAG_KEY, val);
  return val;
}

/** How this page load resolved the switch (read by main's debug hooks). */
export const V3_FLAGS = applyV3Flags();

// ---------------------------------------------------------------- debug switch (CONTRACT §13.1, §13.11; DESIGN §25.14.2a M2)
// Hooks that return hidden state (species, z, the roll, the play plan, pre-rolls) register only when debugEnabled() is true:
// `?debug=1` in the page URL, the localStorage key `gw.debug === '1'`, or `globalThis.GW_DEBUG === true` (the scenario runner
// sets it before the page's scripts run). A release build exposes no species, roll, plan or pre-roll on window.__gw.
export const DEBUG_KEY = 'gw.debug';
/** Pure: {preset: GW_DEBUG, search: location.search, stored: the raw localStorage string} → bool. `?debug=0` turns it off. */
export function resolveDebug({ preset, search = '', stored = null } = {}) {
  let q = null;
  try { q = new URLSearchParams(search || ''); } catch { q = null; }
  if (q && q.has('debug')) {
    const v = parseFlagOn(q.get('debug'));
    if (v !== null) return v;
  }
  if (preset === true) return true;
  return stored === '1' || stored === 1 || stored === true;
}
/** Is the debug build on for this page? Read live (a tool may set GW_DEBUG before main creates the hooks). */
export function debugEnabled(g = globalThis) {
  let search = '', stored = null;
  if (typeof g.document !== 'undefined') {
    try { search = g.location?.search || ''; } catch { search = ''; }
    try { stored = g.localStorage?.getItem(DEBUG_KEY) ?? null; } catch { stored = null; }
  }
  return resolveDebug({ preset: g.GW_DEBUG, search, stored });
}
/**
 * The debug hooks that return hidden state (CONTRACT §13.11): main removes them from ctx.debug after every module's init when
 * debugEnabled() is false, whatever module registered them (belt and braces for the hidden-information rule).
 */
export const HIDDEN_DEBUG_HOOKS = Object.freeze([
  'fishChance', 'fishPlan', 'fishOutcome', 'fishSeed', 'fishStrike', 'fishLinger', 'preroll', 'fishing', 'fishSigns', 'fishReel',
  'fishHook', 'forceBite', 'instantCatch', 'sign', 'odds', 'marked', 'wound', 'rollResident', 'addMarkedFish',
]);

// ---------------------------------------------------------------- the world is live (CONTRACT §13.1)
/** `flow === 'playing' || flow === 'hub'`: the one helper player, fishing, render, actors, ui-hud and audio use. */
export const inWorld = (ctx) => !!ctx && (ctx.flow === 'playing' || ctx.flow === 'hub');

// ---------------------------------------------------------------- the First Evening's legacy step (CONTRACT §13.2, §13.12)
/**
 * The separate, idempotent step that runs only while `meta.firstEvening === undefined` (progression owns it; main applies the
 * same rule at boot as a fallback, so a returning player never meets the tutorial): `meta.runs > 0` or a journal entry for any
 * non-cove species → `{done: true, legacy: true}`; anything else → `{done: false, step: null}`. Returns true when it wrote.
 * `coveSpecies` = COVE.fishing.species (the Quayling). Never called with v3 off.
 */
export function firstEveningLegacy(meta, coveSpecies = ['quayling']) {
  if (!meta || typeof meta !== 'object' || meta.firstEvening !== undefined) return false;
  const cove = new Set(Array.isArray(coveSpecies) ? coveSpecies : []);
  const journal = meta.journal && typeof meta.journal === 'object' ? meta.journal : {};
  const lake = Object.keys(journal).some((id) => !cove.has(id) && journal[id] && (journal[id].caught > 0 || journal[id].seen || journal[id].firstDay !== undefined || Object.keys(journal[id]).length > 0));
  const legacy = (Number(meta.runs) || 0) > 0 || lake;
  meta.firstEvening = legacy ? { done: true, step: null, skipped: false, legacy: true } : { done: false, step: null, skipped: false, legacy: false };
  return true;
}
/** Where a quit First Evening resumes (FIRST_EVENING.resume): before the catch → 'cast', after it → 'gate', none → null. */
export function firstEveningResumeStep(step, steps, resume = { beforeCatch: 'cast', afterCatch: 'gate' }) {
  if (!step || !Array.isArray(steps)) return null;
  const i = steps.indexOf(step), m = steps.indexOf('measure');
  if (i < 0) return null;
  return i < m ? resume.beforeCatch || 'cast' : resume.afterCatch || 'gate';
}

// ---------------------------------------------------------------- time scale (ctx.game.slowmo, CONTRACT §13.1)
/**
 * main owns `time.timeScale`. A slow-motion beat (the leap reveal: 0.25 s at 0.35) scales the base time scale for `seconds`
 * of running time and then restores it. `tick(realDt)` is called once per frame while the game runs (not while paused or
 * behind a blocking modal). Overlapping calls keep the slower scale and the longer remainder. If something else rewrites
 * `time.timeScale` during the beat, the restore leaves that value alone. `setBase(x)` changes the base (debug.timeScale).
 */
export function createSlowmo(time) {
  let left = 0, scale = 1, base = 1, applied = null;
  const end = () => {
    if (applied !== null && time.timeScale === applied) time.timeScale = base;
    left = 0; scale = 1; applied = null;
  };
  return {
    start(seconds = 0.25, s = 0.35) {
      const sec = clamp(Number(seconds) || 0, 0, 10);
      const sc = clamp(Number.isFinite(Number(s)) ? Number(s) : 1, 0.01, 1);
      if (!(sec > 0)) { end(); return false; }
      if (applied === null) { base = time.timeScale; scale = sc; left = sec; }
      else {
        if (time.timeScale !== applied) base = time.timeScale;
        scale = Math.min(scale, sc); left = Math.max(left, sec);
      }
      applied = base * scale;
      time.timeScale = applied;
      return true;
    },
    tick(dt) {
      if (applied === null) return;
      left -= Math.max(0, Number(dt) || 0);
      if (left <= 1e-9) end();
    },
    cancel: end,
    setBase(x) {
      base = x;
      if (applied !== null) { applied = base * scale; time.timeScale = applied; } else time.timeScale = x;
    },
    get active() { return applied !== null; },
    get state() { return { active: applied !== null, left: Math.max(0, left), scale: applied !== null ? scale : 1, base: applied !== null ? base : time.timeScale }; },
  };
}

// ---------------------------------------------------------------- v3 run options (startNewRun, CONTRACT §13.0)
/**
 * The night mode and outing a P1–P2 run starts with. Run 1 (`meta.runs === 0`) is the First Outing: outing 'first', every
 * night still, no choice. Later runs: the chosen mode if it is one of `nightModes.order`, else the default (Lantern), and
 * runs before `nightModes.offeredFrom` stay still. `nightModes` = data BALANCE.nightModes (DESIGN §25.5.1, §25.5.8).
 */
export function v3RunOptions(meta, opts = {}, nightModes = null) {
  const NM = nightModes || {};
  const order = Array.isArray(NM.order) && NM.order.length ? NM.order : ['still', 'lantern', 'gloomtide'];
  const still = order.includes(NM.firstOuting) ? NM.firstOuting : order.includes('still') ? 'still' : order[0];
  const runs = Math.max(0, Math.floor(Number(meta?.runs) || 0));
  if (runs === 0) return { outing: 'first', nightMode: still };
  if (runs + 1 < (Number(NM.offeredFrom) || 2)) return { outing: 'normal', nightMode: still };
  const dflt = order.includes(NM.default) ? NM.default : order.includes('lantern') ? 'lantern' : order[0];
  return { outing: 'normal', nightMode: order.includes(opts?.nightMode) ? opts.nightMode : dflt };
}

// ---------------------------------------------------------------- state
/** Persistent meta (survives death). */
export function defaultMeta() {
  return {
    memories: 0,            // meta currency ("Memories")
    memoriesEarnedTotal: 0,
    relics: {},             // relicId -> level
    journal: {},            // speciesId -> { caught, biggest, firstDay, firstRun }
    bestDay: 0,
    deepestZone: 0,         // index into ZONES
    runs: 0,
    deaths: 0,
    victory: false,
    victories: 0,
    totalFish: 0,
    totalSlain: 0,
    bestLevel: 0,
    tutorialDone: false,
    seenTips: {},           // tipId -> true
    challenges: {},         // challengeId -> true
    challengeProgress: {},  // challengeId -> number (lifetime-scope progress)
    unlocks: {},            // 'character:<id>' | 'boon:<id>' | 'relic:<id>' | 'bait:<id>' -> true
    lastCharacter: null,
    settings: { master: 0.8, music: 0.6, sfx: 0.9, quality: 'auto', screenShake: true, damageNumbers: true },
  };
}

/**
 * The raw save envelope as stored: `{version, savedAt, meta, run}` (CONTRACT §13.1 Boot, §13.2). Nothing is merged in:
 * `defaultMeta()` is applied by `normalizeSave()` AFTER any migration (`progression.migrateSave`), so it never supplies
 * `schema`. No save (or an unreadable one) → `{version: 0, savedAt: 0, meta: {}, run: null}`. `run` is whatever was stored
 * (writeSave only ever stores an active run or null).
 */
export function loadSave() {
  const raw = storage.get(SAVE_KEY);
  const ok = !!raw && typeof raw === 'object' && !Array.isArray(raw);
  const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : null);
  return {
    ...(ok ? raw : {}),
    version: ok ? Number(raw.version) || 0 : 0,
    savedAt: ok ? Number(raw.savedAt) || 0 : 0,
    meta: (ok && obj(raw.meta)) || {},
    run: (ok && obj(raw.run)) || null,
  };
}

/**
 * An envelope (after migration) → the live `{meta, run}`: the saved meta over `defaultMeta()` (settings merged key by key),
 * and the run only if it is still active. This is exactly what v1's loadSave returned.
 */
export function normalizeSave(save) {
  const m = save && save.meta && typeof save.meta === 'object' ? save.meta : {};
  const meta = Object.assign(defaultMeta(), m);
  meta.settings = Object.assign(defaultMeta().settings, m.settings || {});
  const run = save?.run && save.run.active ? save.run : null;
  return { meta, run };
}

export function writeSave(state) {
  return storage.set(SAVE_KEY, { version: VERSION, savedAt: Date.now(), meta: state.meta, run: state.run && state.run.active ? state.run : null });
}

export function wipeSave() { storage.remove(SAVE_KEY); }

// ---------------------------------------------------------------- misc
/** Dispose a THREE object tree (geometries, materials, textures). */
export function disposeObject(obj) {
  obj?.traverse?.((o) => {
    o.geometry?.dispose?.();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose(); }
      m.dispose?.();
    }
  });
  obj?.parent?.remove(obj);
}

/** Format numbers for UI: 1234 -> "1,234". */
export const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const fmtKg = (kg) => (kg < 10 ? kg.toFixed(2) : kg < 100 ? kg.toFixed(1) : Math.round(kg).toString()) + ' kg';
