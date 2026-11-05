// water-signs.js — pure helpers for water.js's v3 surface signs and the Glowtide (DESIGN §25.6.1, §25.8.3;
// CONTRACT §13.7 water, §13.9). No three.js, no ctx: tools/tests/water-signs.test.mjs runs them in node.
//
// Signs: fishing-fx (the signs' one owner) asks water for ripples and wakes and may tag them with a sign
// kind — `water.addRipple(x, z, intensity, {kind, size})`, `water.addWake(x, z, dx, dz, intensity, {kind})`.
// A tagged mark rides the SAME uRip / uWake arrays as every other ripple and wake (no new uniform, no
// new array): its kind, the fish's length and the intensity are packed into the vec4's .w, which plain
// ripples keep below 64 (strength ≤ 3) and plain wakes below 4 (strength ≤ 1), so the shader tells
// them apart with one compare and an untagged mark renders exactly as before.
//
//   ripple .w = 64·kind + bucket + intensity     bucket = round(√length · 20) in 1..63, intensity in [0, 0.999]
//   wake   .w =  4·kind + intensity              intensity in [0, 1]
//
// The GLSL decoder lives in water-shader.js (signMark); the two must agree with decodeSignRipple below.

/** The six sign kinds of DESIGN §25.6.1 (CONTRACT §13.5 `sign:spawn` kind) → their packed id (0 = a plain mark). */
export const SIGN_KINDS = ['rise', 'boil', 'nervous', 'strike', 'bubbles', 'glow'];
export const SIGN_ID = { rise: 1, boil: 2, nervous: 3, strike: 4, bubbles: 5, glow: 6 };
/** Seconds one tagged ripple paints the surface, by id (index 0 unused). The shader's signLife() matches. */
export const SIGN_LIFE = [0, 5.2, 4.2, 4.2, 7.5, 2.8, 2.6];
/** A fish length (m) for a sign that names only a size class (`sign:spawn {sizeClass}`); fishing-fx passes `size` when it knows the fish. */
export const CLASS_LENGTH = { small: 0.14, keeper: 0.3, prize: 0.6, trophy: 1.1, elder: 2.0, ancient: 2.6, legend: 3.0 };
/** Default length (m) per kind when neither `size` nor `sizeClass` is given. */
const KIND_LENGTH = { rise: 0.3, boil: 0.9, nervous: 0.6, strike: 0.9, bubbles: 0.35, glow: 0.6 };
/** Uniform slots the tagged marks may take before the plain ripples / wakes get theirs (packed first). */
// Six live signs at fishing-fx's cadences (DESIGN §25.6.1) keep ≈ 15 marks alive at worst (a glow trail ≈ 6,
// a bubble trail ≈ 4, a rise or a nervous patch 2, a boil or a strike 1); past the cap the newest marks win.
export const SIGN_CAP = { high: { rip: 16, wake: 8 }, medium: { rip: 16, wake: 8 }, low: { rip: 10, wake: 6 } };
export const RIP_BASE = 64;
export const WAKE_BASE = 4;
const MAX_BUCKET = 63;

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** The packed id of a sign kind name (or id), else 0. */
export function signId(kind) {
  if (typeof kind === 'number') return kind >= 1 && kind <= 6 ? Math.floor(kind) : 0;
  return SIGN_ID[typeof kind === 'string' ? kind.toLowerCase() : ''] || 0;
}

/** The fish length (m) a sign paints: opts.size (m) → opts.length → opts.sizeClass → the kind's default. */
export function signLength(kindName, opts = {}) {
  const o = opts && typeof opts === 'object' ? opts : {};
  const s = Number(o.size ?? o.length);
  if (fin(s) && s > 0) return s;
  const c = typeof o.sizeClass === 'string' ? CLASS_LENGTH[o.sizeClass.toLowerCase()] : undefined;
  if (fin(c)) return c;
  return KIND_LENGTH[kindName] ?? 0.5;
}

/** Length (m) → the 1..63 size bucket (√length · 20: 2 cm steps at a minnow, ~30 cm at a 9 m legend). */
export function sizeBucket(length) {
  const L = fin(length) && length > 0 ? length : 0.0025;
  return clamp(Math.round(Math.sqrt(L) * 20), 1, MAX_BUCKET);
}
export const bucketLength = (b) => (b * b) / 400;

/** Pack a tagged ripple's .w. intensity 0..1 (1 = full). */
export function encodeSignRipple(id, length, intensity = 1) {
  const k = signId(id);
  if (!k) return 0;
  const i = clamp(fin(intensity) ? intensity : 1, 0, 0.999);
  return RIP_BASE * k + sizeBucket(length) + i;
}
/** Unpack a ripple .w exactly as the shader does: {kind (0 = plain), length, intensity, strength (plain only)}. */
export function decodeSignRipple(w) {
  if (!(w >= RIP_BASE)) return { kind: 0, length: 0, intensity: 0, strength: w };
  const kind = Math.floor(w / RIP_BASE);
  const rem = w - kind * RIP_BASE;
  const b = Math.floor(rem);
  return { kind, length: bucketLength(b), intensity: Math.min(1, (rem - b) * 1.002), strength: 0 };
}
/** Pack a tagged wake's .w (intensity 0..1). */
export function encodeSignWake(id, intensity = 1) {
  const k = signId(id);
  const s = clamp(fin(intensity) ? intensity : 1, 0, 1);
  return k ? WAKE_BASE * k + s : s;
}
export function decodeSignWake(w) {
  const kind = Math.floor(w / WAKE_BASE);
  return { kind, intensity: w - kind * WAKE_BASE };
}

/** Seconds a tagged ripple of id paints (0 for a plain one). */
export const signLife = (id) => SIGN_LIFE[id] || 0;

// ------------------------------------------------------------------------------ Glowtide (DESIGN §25.8.3)
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/**
 * The Glowtide's strength (0..1) for a survival.getPhaseInfo() result: off in calm, a first glimmer as dusk
 * deepens, full through the night (eased in over its first 12 %), fading out across the night's last tenth
 * and the first half of dawn. `null` / no run → 0.
 */
export function glowtideFor(info) {
  if (!info || typeof info.phase !== 'string') return 0;
  const k = clamp(fin(info.k) ? info.k : 0, 0, 1);
  switch (info.phase) {
    case 'dusk': return 0.4 * smooth(0.55, 1, k);
    case 'gloomtide': return 0.4 + 0.6 * smooth(0, 0.12, k) - 0.25 * smooth(0.9, 1, k);
    case 'dawn': return 0.75 * (1 - smooth(0, 0.5, k));
    default: return 0;
  }
}
