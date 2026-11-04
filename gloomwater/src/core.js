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
    tutorialDone: false,
    seenTips: {},           // tipId -> true
    unlocks: {},            // misc permanent unlock flags (waystones etc.)
    settings: { master: 0.8, music: 0.6, sfx: 0.9, quality: 'auto', screenShake: true },
  };
}

/** Load {meta, run} from storage (run may be null). */
export function loadSave() {
  const raw = storage.get(SAVE_KEY);
  const meta = Object.assign(defaultMeta(), raw?.meta || {});
  meta.settings = Object.assign(defaultMeta().settings, raw?.meta?.settings || {});
  const run = raw?.run && raw.run.active ? raw.run : null;
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
