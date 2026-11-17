// watercraft-face.js — WC-3: the water's face on the Mossmere under the loop (docs/loop/WATERCRAFT.md §2.1–§2.2, §5.4, §5.6, §5.7).
// Pure: no three.js, no data import, no state. world-art.js builds the reed beds and the lily beds from these plans, water.js bakes
// the inflow's seam, the outflow's threads and the gravel fan into the depth texture's spare channels and sets the wind lane's four
// uniforms from laneUniform; tools/tests/watercraft-face.test.mjs proves where everything lies.
//
//   faceOn(D, zoneId)          the face is drawn on the Mossmere under the loop only (the flag-off game and other waters unchanged)
//   lightOf(phase)             'day' (calm, day, dawn) · 'dusk' · 'night' (gloomtide, night): WATERCRAFT's three lights
//   GEO                        §2.2's geometry block (WC-1's src/watercraft.js, read only)
//   laneOf(lane) / laneUniform  watercraft.laneFor(evening) normalised to {x, z, dx, dz, w, len}; the shader's vec4 (x, z, heading, k)
//   eveningLane(evening, phase) the lane the water draws tonight (laneFor; null at night)
//   reedPlan(L, rng, o)        the reed clumps: the four shore beds, thicker round the rock islands, thinner round the masonry ones
//   bedPadPlan(L, rng, o)      the four lily beds' pads (12–16 a bed, 8 on low), clear of islands, pillars and posts
//   faceMasks(x, z, probe)     {seam, fan} 0..1 for the depth texture's B and A channels (the bake, a few rows a frame)
//   avoidList(L, D)            what the beds keep clear of: dock posts, the places' footprints, the mooring's hulls and lane, the glide-in
//   heronSpots(...)            (the heron is after the MVP: WATERCRAFT §13; kept out of this lane by the time box)

import { WATERCRAFT, laneFor, lightOf as wcLight } from './watercraft.js';

const TAU = Math.PI * 2;
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** §2.2's geometry block: WC-1's binding copy in src/watercraft.js (the face reads it, never edits it). */
export const GEO = WATERCRAFT.mossmere.geometry;

/** The face's own tunings (art, not odds: nothing here changes a bite). */
export const FACE = Object.freeze({
  // the seam: foam threads running west from the Veil's spill (x from 56.5 down to `x1`), meandering about z = 4
  seam: { x0: 56.5, x1: 31, z: 4, w: 5.5 },
  // the gravel fan under the Sluice Veil: a sector opening west from (57.5, 4)
  fan: { x: 57.5, z: 4, r: 9, half: 0.62 },
  // the outflow's threads drawn to the gate: from r1 + 3 m in to the gate's stone ring
  pull: { r0: 4.2, r1: 14 },
  // reeds: clumps per metre of shore bed and per metre of island edge (thicker on rock, thinner on masonry)
  reeds: { shorePerM: 2.2, shoreLow: 1.2, rockPerM: 0.55, rockLow: 0.3, stonePerM: 0.16, stoneLow: 0.08, keep: 3 },
  pads: { perBed: [12, 16], low: 8, minGap: 0.95 },
  twitch: { max: 4, life: 2.4, reach: 4.5 },
});

/** The face runs on the Mossmere under the loop only. */
export function faceOn(D, zoneId) { return D?.LOOP_ENABLED === true && zoneId === 'mossmere'; }
/** WATERCRAFT's three lights (watercraft.lightOf: calm, day, dawn → day; dusk → dusk; gloomtide, night → night). */
export function lightOf(phase) { return wcLight(phase); }

/** A seeded stream (mulberry32): the face's own, so the built art's draws are untouched. */
export function faceRng(seed = 0x7a11ce) {
  let a = (Math.floor(num(seed, 1)) >>> 0) || 1;
  const r = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.range = (lo, hi) => lo + (hi - lo) * r();
  return r;
}

// ------------------------------------------------------------------ the wind lane
/** Any laneFor result ({x, z, heading} | {x, z, dx, dz} | {cx, cz, angle} | {a: {x, z}, b: {x, z}} …) as {x, z, dx, dz, w, len}, or null. */
export function laneOf(l) {
  if (!l || typeof l !== 'object') return null;
  const w = num(l.w ?? l.width, GEO.lane.w), len = num(l.len ?? l.length, GEO.lane.len);
  if (l.a && l.b && Number.isFinite(l.a.x) && Number.isFinite(l.b.x)) {
    const dx = l.b.x - l.a.x, dz = l.b.z - l.a.z, n = Math.hypot(dx, dz) || 1;
    return { x: (l.a.x + l.b.x) / 2, z: (l.a.z + l.b.z) / 2, dx: dx / n, dz: dz / n, w, len: num(l.len, n) };
  }
  const x = num(l.x ?? l.cx, NaN), z = num(l.z ?? l.cz, NaN);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
  let dx = num(l.dx, NaN), dz = num(l.dz, NaN);
  if (Array.isArray(l.dir)) { dx = num(l.dir[0], NaN); dz = num(l.dir[1], NaN); }
  else if (l.dir && typeof l.dir === 'object') { dx = num(l.dir.x, NaN); dz = num(l.dir.z, NaN); }
  if (!Number.isFinite(dx) || !Number.isFinite(dz)) { const h = num(l.h ?? l.heading ?? l.angle ?? l.yaw, 0); dx = Math.cos(h); dz = Math.sin(h); }
  const n = Math.hypot(dx, dz) || 1;
  return { x, z, dx: dx / n, dz: dz / n, w, len };
}
/** Tonight's wind lane as the water draws it: watercraft.laneFor(evening, phase), normalised; null at night or with no evening. */
export function eveningLane(evening, phase = null) {
  if (!(Number(evening) > 0)) return null;
  return laneOf(laneFor(evening, phase));
}
/** The share of a lane's strip (sampled along its line) in water at least GEO.margin deep. */
export function laneInWater(lane, probe, n = 26) {
  const l = laneOf(lane);
  if (!l || !probe?.depth) return 0;
  let wet = 0;
  for (let i = 0; i < n; i++) {
    const s = (i / (n - 1) - 0.5) * l.len;
    const x = l.x + l.dx * s, z = l.z + l.dz * s;
    if (num(probe.depth(x, z), 0) >= GEO.margin && (!probe.fromShore || probe.fromShore(x, z) > 1)) wet++;
  }
  return wet / n;
}
/** The four lane uniforms: (x, z, heading, k); k is 1 by day and dusk, 0 at night (the lane is a day-and-dusk read). */
export function laneUniform(lane, phase) {
  const l = laneOf(lane);
  const on = l && GEO.lane.phases.includes(lightOf(phase));
  if (!l) return [0, 0, 0, 0];
  return [l.x, l.z, Math.atan2(l.dz, l.dx), on ? 1 : 0];
}
/** Is (x, z) inside the lane's strip (the smooth slick, 4 m × 50 m)? */
export function inLane(lane, x, z) {
  const l = laneOf(lane);
  if (!l) return false;
  const ox = x - l.x, oz = z - l.z;
  const along = ox * l.dx + oz * l.dz, across = -ox * l.dz + oz * l.dx;
  return Math.abs(along) <= l.len / 2 && Math.abs(across) <= l.w / 2;
}

// ------------------------------------------------------------------ what the beds keep clear of
/** Circles and segments the reed beds, lily beds and the heron keep clear of: dock posts, the places' footprints (as circles round
 *  their discs, rects and paths), the mooring's hull circles, its lane points and the glide-in (14 m out along the barge's line from
 *  its mooring, LOOP.tow.glideIn when present, 3 m a side). → {circles: [{x, z, r, kind}], segs: [{ax, az, bx, bz, r, kind}]} */
export function avoidList(L, D, waterId = 'mossmere') {
  const circles = [], segs = [];
  for (const d of L?.docks || []) for (const p of d.posts || []) circles.push({ x: p.x, z: p.z, r: num(p.r, 0.3), kind: 'post' });
  const ids = typeof D?.loopPlaceIds === 'function' ? D.loopPlaceIds(waterId) : [];
  for (const id of ids) {
    const a = typeof D?.loopPlace === 'function' ? D.loopPlace(id)?.area : null;
    if (!a) continue;
    if (a.kind === 'disc') circles.push({ x: a.x, z: a.z, r: num(a.r, 0), kind: `place:${id}` });
    else if (a.kind === 'rect') circles.push({ x: a.x, z: a.z, r: Math.hypot(num(a.w) / 2, num(a.d) / 2), kind: `place:${id}` });
    else if (a.kind === 'path' && Array.isArray(a.pts)) for (let i = 0; i + 1 < a.pts.length; i++) segs.push({ ax: a.pts[i][0], az: a.pts[i][1], bx: a.pts[i + 1][0], bz: a.pts[i + 1][1], r: num(a.w) / 2, kind: `place:${id}` });
  }
  let M = null;
  try { M = typeof D?.loopMooring === 'function' ? D.loopMooring(waterId, (L?.docks || []).map((d) => ({ x: d.x, z: d.z, yaw: d.yaw }))) : null; } catch { M = null; }
  if (M) {
    for (const c of M.circles || []) circles.push({ x: c.x, z: c.z, r: c.r, kind: c.kind || 'hull' });
    for (const q of M.lane || []) circles.push({ x: q.x, z: q.z, r: 1.6, kind: 'lane' });
    const gi = D?.LOOP?.tow?.glideIn;
    const len = num(gi?.len ?? gi?.length ?? (typeof gi === 'number' ? gi : NaN), 14);
    const fx = -Math.sin(M.hull.yaw), fz = -Math.cos(M.hull.yaw);
    // the barge's line: out from the hull along its keel, whichever way is open water (the side away from the shore)
    const ax = M.hull.x, az = M.hull.z, outA = { x: ax + fx * len, z: az + fz * len }, outB = { x: ax - fx * len, z: az - fz * len };
    const out = Math.hypot(outA.x, outA.z) < Math.hypot(outB.x, outB.z) ? outA : outB;
    segs.push({ ax, az, bx: out.x, bz: out.z, r: 3, kind: 'glideIn' });
    segs.push({ ax: M.raft.x, az: M.raft.z, bx: (M.lane?.[0]?.x ?? M.raft.x), bz: (M.lane?.[0]?.z ?? M.raft.z), r: 1.6, kind: 'lane' });
  }
  return { circles, segs };
}
const segDist = (s, x, z) => {
  const vx = s.bx - s.ax, vz = s.bz - s.az, L2 = vx * vx + vz * vz;
  const t = L2 > 0 ? clamp01(((x - s.ax) * vx + (z - s.az) * vz) / L2) : 0;
  return Math.hypot(x - (s.ax + vx * t), z - (s.az + vz * t));
};
/** The clearance (m) from (x, z) to the nearest thing in an avoid list (negative inside one). */
export function clearanceOf(avoid, x, z) {
  let best = Infinity;
  for (const c of avoid?.circles || []) best = Math.min(best, Math.hypot(x - c.x, z - c.z) - c.r);
  for (const s of avoid?.segs || []) best = Math.min(best, segDist(s, x, z) - s.r);
  return best;
}

// ------------------------------------------------------------------ reeds and pads
const inArc = (deg, [a, b]) => deg >= a && deg <= b;
const degOf = (x, z) => { const d = (Math.atan2(z, x) * 180) / Math.PI; return d < 0 ? d + 360 : d; };
/** Where (x, z) is clear of land and solid things for a reed (it may stand in the shallows, never on an island or a post). */
function reedClear(L, x, z, pad) {
  const sr = typeof L.shoreR === 'function' ? L.shoreR(Math.atan2(z, x)) : 60;
  if (Math.hypot(x, z) > sr - 0.3) return false;
  for (const o of L.obstacles || []) if (Math.hypot(x - o.x, z - o.z) < o.r + pad) return false;
  return true;
}
/** The reed clumps {x, z, n, h, where: 'shore' | 'rock' | 'stone', bed?} for the Mossmere: each shore bed reedOff m off the shore
 *  inside its arc, thicker reeds round the rock islands (out to k·r + plus from the centre), thinner round the masonry ones. Every
 *  clump keeps `FACE.reeds.keep` m clear of the avoid list. */
export function reedPlan(L, rng, { low = false, avoid = null } = {}) {
  const R = FACE.reeds, out = [];
  const keepOk = (x, z) => !avoid || clearanceOf(avoid, x, z) >= R.keep;
  // the four shore beds
  GEO.reedArcs.forEach((arc, bi) => {
    const mid = ((arc[0] + arc[1]) / 2) * (Math.PI / 180);
    const sr = typeof L.shoreR === 'function' ? L.shoreR(mid) : 60;
    const span = ((arc[1] - arc[0]) * Math.PI / 180) * sr;
    const n = Math.round(span * (low ? R.shoreLow : R.shorePerM) * (GEO.reedOff[1] - GEO.reedOff[0]) / 3);
    for (let t = 0, k = 0; t < n * 6 && k < n; t++) {
      const deg = arc[0] + rng() * (arc[1] - arc[0]), a = (deg * Math.PI) / 180;
      // denser by the shore, thinning toward the bed's open-water edge (a reed line, not a square)
      const off = GEO.reedOff[0] + Math.pow(rng(), 1.6) * (GEO.reedOff[1] - GEO.reedOff[0] - 0.3);
      const rr = (typeof L.shoreR === 'function' ? L.shoreR(a) : 60) - off;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (!inArc(degOf(x, z), arc) || !reedClear(L, x, z, 0.4) || !keepOk(x, z)) continue;
      out.push({ x, z, n: 4 + ((rng() * 5) | 0), h: rng.range(1.1, 2.1) * (1.08 - off / 12), where: 'shore', bed: bi });
      k++;
    }
  });
  // the islands: thick reeds round the rock ones, a thin fringe round the masonry ones
  for (const o of L.islands || []) {
    const rock = GEO.reedIslands.includes(o.kind), stone = GEO.stoneIslands.includes(o.kind);
    if (!rock && !stone) continue;
    const per = rock ? (low ? R.rockLow : R.rockPerM) : (low ? R.stoneLow : R.stonePerM);
    const reach = rock ? GEO.reedReach.k * o.r + GEO.reedReach.plus : o.r * 1.25;
    const n = Math.max(rock ? 6 : 2, Math.round(TAU * o.r * per * (rock ? 2.2 : 1)));
    for (let t = 0, k = 0; t < n * 8 && k < n; t++) {
      const a = rng() * TAU, d = o.r * 1.04 + Math.pow(rng(), 1.4) * Math.max(0.3, reach - o.r * 1.04);
      const x = o.x + Math.cos(a) * d, z = o.z + Math.sin(a) * d;
      if (!reedClear(L, x, z, 0.15) || !keepOk(x, z)) continue;
      out.push({ x, z, n: rock ? 4 + ((rng() * 5) | 0) : 2 + ((rng() * 3) | 0), h: rock ? rng.range(1.0, 2.0) : rng.range(0.7, 1.3), where: rock ? 'rock' : 'stone', island: o.name || null });
      k++;
    }
  }
  return out;
}
/** The four lily beds' pads {x, z, ry, s, ph, bed}: perBed (12–16; `low` 8) inside each bed's disc, ≥ minGap apart, clear of
 *  islands, pillars and posts and of the avoid list by FACE.reeds.keep m. */
export function bedPadPlan(L, rng, { low = false, avoid = null } = {}) {
  const P = FACE.pads, out = [];
  GEO.beds.forEach((b, bi) => {
    const want = low ? P.low : P.perBed[0] + ((rng() * (P.perBed[1] - P.perBed[0] + 1)) | 0);
    const mine = [];
    for (let t = 0; t < want * 40 && mine.length < want; t++) {
      const a = rng() * TAU, d = Math.sqrt(rng()) * (b.r - 0.5), x = b.x + Math.cos(a) * d, z = b.z + Math.sin(a) * d;
      if (!reedClear(L, x, z, 0.6) || (avoid && clearanceOf(avoid, x, z) < FACE.reeds.keep)) continue;
      if (mine.some((q) => Math.hypot(q.x - x, q.z - z) < P.minGap)) continue;
      mine.push({ x, z, ry: rng() * TAU, s: rng.range(0.65, 1.35), ph: rng() * TAU, bed: bi });
    }
    out.push(...mine);
  });
  return out;
}

// ------------------------------------------------------------------ the baked masks (B: foam threads; A: the gravel fan)
const wave = (x, s) => Math.sin(x * 0.19 + s) * 1.3 + Math.sin(x * 0.47 + s * 2.1) * 0.55;
/** The seam's centre z at x (it meanders), exported for the test. */
export function seamZ(x) { return FACE.seam.z + wave(x, 0.7); }
/**
 * The face's masks at (x, z) for the depth texture's spare channels: `seam` (B) the envelope of the inflow's foam seam running
 * west from the spill and of the outflow's threads drawn to the gate (the shader draws the threads themselves inside it), `fan` (A)
 * the pale gravel fan under the Sluice Veil. probe = {depth(x, z), fromShore(x, z)}: 0 on land.
 */
export function faceMasks(x, z, probe = null) {
  const wet = probe?.fromShore ? smooth(-0.5, 1.5, probe.fromShore(x, z)) : 1;
  if (wet <= 0) return { seam: 0, fan: 0 };
  const S = FACE.seam, F = FACE.fan, O = GEO.outflow, Pp = FACE.pull;
  // the inflow's seam: strongest at the spill, fading west; a band about the meandering line, wider downstream
  let seam = 0;
  if (x <= S.x0 + 1 && x >= S.x1 - 4) {
    const along = clamp01((S.x0 - x) / (S.x0 - S.x1));
    const half = S.w * (0.55 + 0.6 * along);
    const across = Math.abs(z - seamZ(x));
    seam = (1 - smooth(half * 0.55, half, across)) * smooth(S.x1 - 4, S.x1 + 6, x) * smooth(S.x0 + 1, S.x0 - 1.5, x) * (1 - 0.45 * along);
  }
  // the outflow's pull: a ring from the gate's stones out to r1, strongest near the lip
  const ro = Math.hypot(x - O.x, z - O.z);
  const pull = smooth(Pp.r0 - 0.2, Pp.r0 + 1.2, ro) * (1 - smooth(Pp.r1 - 4, Pp.r1, ro)) * (ro < Pp.r1 ? 1 : 0);
  seam = Math.max(seam, pull * 0.9);
  // (LOST-TACKLE §5.3: the cut behind the Veil, probe.notch: its water slides down the cut toward the lake, a thread band along its middle
  // from the culvert's spill to the mouth, where it meets the inflow's seam)
  const N = probe?.notch;
  if (N && Number.isFinite(N.r0)) {
    const along = x * N.ca + z * N.sa, t = clamp01((along - N.r0) / Math.max(1, N.end - N.r0));
    const lc = Math.abs(-x * N.sa + z * N.ca - 0.7 * Math.sin(Math.PI * t) * (t > 0 ? 1 : 0)), h = N.hw;
    if (along > N.r0 - 3 && along < N.end) seam = Math.max(seam, (1 - smooth(h * 0.3, h * 0.85, lc)) * smooth(N.end - 0.4, N.end - 3.5, along) * smooth(N.r0 - 3, N.r0, along) * (0.28 + 0.2 * (1 - t)));   // (thin: still water)
  }
  // the gravel fan: a sector opening west from under the spill
  const fx = x - F.x, fz = z - F.z, fr = Math.hypot(fx, fz);
  let fan = 0;
  if (fr < F.r) {
    const ang = Math.abs(Math.atan2(fz, -fx));
    fan = (1 - smooth(F.half * 0.6, F.half, ang)) * (1 - smooth(F.r * 0.55, F.r, fr)) * smooth(0.0, 1.2, fr);
  }
  return { seam: clamp01(seam) * wet, fan: clamp01(fan) * wet };
}
