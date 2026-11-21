// models-size.js — pure size and measuring helpers shared by models (createFish) and actors (the measuring
// ceremony). No three.js, no DOM: unit-tested in tools/tests/actors-v3.test.mjs.
//
// v3 honest stretched scale (DESIGN §25.7.1, §25.7.5; CONTRACT §13.7 models): a species that carries v3 size data
// (feature-detected: `species.size`) is built at its true length in metres; v1 / v2 species keep the weight model.

export const MIN_LENGTH_M = 0.04;          // the only floor left (a 0.08 m Cupbearer measures 0.08 m)

/**
 * True length (m) of a v3 species, or null when the species has no v3 size data (v1 / v2 weight model applies).
 *   {z}         L = L50 · e^(σz + tail · max(0, z − tailFrom)²)  (data.sizeLength, cm; the Pilgrim Salmon's L50 by lake)
 *   {lengthCm}  an exact length (a measured Fish's `length`, e.g. a grown legend) wins over z
 *   weightKg    the size model's own inverse, L = ∛(W / k) (W = k · L³), so callers still passing a v3 weight size truly
 */
export function trueLengthM(sp, arg, { data = null, zone = null } = {}) {
  const S = sp?.size;
  if (!S || !(Number(S.k) > 0) || S.L50 === undefined || S.L50 === null) return null;
  let cm = null;
  if (arg && typeof arg === 'object') {
    if (Number.isFinite(arg.lengthCm) && arg.lengthCm > 0) cm = arg.lengthCm;
    else if (Number.isFinite(arg.z)) {
      const zn = arg.zone ?? zone ?? sp.zone ?? null;
      if (typeof data?.sizeLength === 'function') cm = data.sizeLength(sp, arg.z, zn);
      else {
        const L50 = typeof S.L50 === 'number' ? S.L50 : (S.L50[zn] ?? Object.values(S.L50)[0]);
        const B = data?.BALANCE?.size, tail = sp.rarity === 'legendary' ? 0 : (B?.tail ?? 0.06), from = B?.tailFrom ?? 1.04;
        cm = L50 * Math.exp(S.sigma * arg.z + tail * Math.max(0, arg.z - from) ** 2);
      }
    }
  } else if (Number.isFinite(arg) && arg > 0) cm = Math.cbrt((arg * 1000) / S.k);
  return Number.isFinite(cm) && cm > 0 ? Math.max(MIN_LENGTH_M, cm / 100) : null;
}

// ------------------------------------------------------------------ the measuring ceremony (DESIGN §25.6.8)
export const MEASURE_POSES = ['measurePalm', 'measureArms', 'measureHang', 'measureAlongside'];
const DEFAULT_POSES = [{ id: 'palm', below: 0.25 }, { id: 'arms', below: 0.85 }, { id: 'hang', below: 2.0 }, { id: 'alongside', below: Infinity }];
const POSE_NAME = { palm: 'measurePalm', arms: 'measureArms', hang: 'measureHang', alongside: 'measureAlongside' };

/**
 * The measuring pose for a fish of `lengthM` metres (BALANCE.ceremony.poses, the Wick is 0.85 m): Palm < 0.25 m (cupped,
 * close-up) · Arms 0.25–0.85 m (held up) · Hang 0.85–2.0 m (head-up from the rod tip) · Alongside > 2.0 m and every legend.
 */
export function measurePoseFor(lengthM, { legendary = false, poses = null } = {}) {
  if (legendary) return 'measureAlongside';
  const L = Number(lengthM);
  const list = Array.isArray(poses) && poses.length ? poses : DEFAULT_POSES;
  if (!Number.isFinite(L)) return 'measureArms';
  for (const p of list) if (L < (p.below ?? Infinity)) return POSE_NAME[p.id] || 'measureArms';
  return 'measureAlongside';
}

/**
 * Knot spacing (m) of the knotted cord for a fish of `lengthM`: 2 cm knots for the fry, 5 cm for palm fish, decimetres
 * for keepers, then quarter-metres, half-metres and whole metres as the fish grows, so the cord carries at most 10 knots.
 * "Great knots" (bigger, darker) mark every 10 cm / 25 cm / 50 cm / 1 m / 5 m / 10 m, the way a sounding line is marked.
 */
const KNOT_STEPS = [0.02, 0.05, 0.1, 0.25, 0.5, 1, 2];
const GREAT_EVERY = { 0.02: 0.1, 0.05: 0.25, 0.1: 0.5, 0.25: 1, 0.5: 1, 1: 5, 2: 10 };
export function cordKnots(lengthM, maxKnots = 10) {
  const L = Math.max(MIN_LENGTH_M, Number(lengthM) || 0);
  let step = KNOT_STEPS[KNOT_STEPS.length - 1];
  for (const s of KNOT_STEPS) if (L / s <= maxKnots) { step = s; break; }
  const G = GREAT_EVERY[step];
  const knots = [];
  for (let i = 1; i * step < L - step * 0.2; i++) {   // no knot crowding the tail tip (the end bead sits there)
    const at = Math.round(i * step * 1e4) / 1e4, r = at / G;
    knots.push({ at, u: at / L, great: Math.abs(r - Math.round(r)) < 1e-6 });
  }
  return { step, knots };
}

/** The cord's unroll curve, matching audio's tick clock (count(k) = L · (1 − (1 − k)²): quick at first, settling). */
export function cordEase(k) { const x = Math.min(1, Math.max(0, Number(k) || 0)); return 1 - (1 - x) * (1 - x); }

/**
 * The cord's time span inside the ceremony for a class (SIZE_CLASSES[].ceremony × the cord beat's share of the reference
 * timeline BALANCE.ceremony.beats: cord 1.4–2.8 of 3.6 s; the 1.2 s variant during a swarm window). Same rule as audio's.
 */
export function cordDurationFor(data, sizeClass, { short = false } = {}) {
  const B = data?.BALANCE?.ceremony;
  const cls = Array.isArray(data?.SIZE_CLASSES) ? data.SIZE_CLASSES.find((c) => c.id === sizeClass) : null;
  const total = short ? Number(B?.cinematic?.duringSwarm ?? 1.2) : Number(cls?.ceremony ?? 2.4);
  const cord = Array.isArray(B?.beats?.cord) ? Number(B.beats.cord[1]) - Number(B.beats.cord[0]) : 1.4;
  const full = Array.isArray(B?.beats?.banners) ? Number(B.beats.banners[1]) : 3.6;
  const d = total * (cord > 0 ? cord : 1.4) / (full > 0 ? full : 3.6);
  return Math.min(3, Math.max(0.35, Number.isFinite(d) ? d : 1.4));
}
