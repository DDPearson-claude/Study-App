// fishing-sight.js — WC-2: silhouettes (WATERCRAFT §6; the Mossmere under the loop). Pure rules, no three.js and no ctx, so node
// tests drive them: where a fish can be seen (clear, calm, shallow water by day and dusk; at night only in the lantern's light or
// over a drowned lamp at the Buoy Lights), which fish (the "who is there" pool, deep-bodied and long shapes ×1.5, never a giant, the
// legend, the sturgeon, the trout or the eel), how big (its true length, data.sizeLength), how far off the raft (by length), how it
// moves (five outlines: a slow glide and gentle turns, never a dart or a jump), when it bolts (a cast on it, the raft too near, a splash by a still fish) and when a cast leads it (ahead
// on its line; beside a still fish's head). fishing.js owns the list (spawn, step, the cast test, the take through the built
// pre-roll path); fishing-fx.js draws each as ONE instance of the sign buffer (the fish, its shadow, a shoal's shapes).
//
// No word, no number, no ring: a silhouette is a fish in the water, nothing more (§6.9). The lead window is invisible.

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const U = (rng, a, b) => a + (b - a) * rng();
const TAU = Math.PI * 2;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** §6.1–§6.6 as numbers (WATERCRAFT.mossmere.sight, WC-1's, wins where it is passed in with the same keys). */
export const SIGHT = {
  depth: 0.45,                       // never at or below this depth (the bed is out of sight)
  reedOuter: 0.18,                   // a reed line's outer edge: its deeper part
  alive: { high: 2, medium: 2, low: 2 },   // (17 Nov 2026, the user: at most two at a time; a shoal counts as one)
  every: [12, 30],                   // a new one every 12–30 s while fewer are alive
  life: [40, 90],
  bands: [[0.3, [4.5, 8]], [0.6, [5, 11]], [1.0, [6, 15]], [Infinity, [7, 20]]],   // the fallback spawn distance off the raft by length (m), no camera
  raft: [3, 5],                      // its own distance off the raft, by fish (small nearer), jittered
  dusk: 0.75,                        // fainter at dusk
  lantern: { r: 8, stub: 1.5, perLevel: 0.15, min: 0.25 },
  lamp: { r: 1.9 },                  // a drowned lamp's glow at the Buoy Lights (m)
  spook: { r: 0.6, splash: 2, quietR: 10, quietT: 30, waitMult: 1.5, bolt: 1.2 },
  // how it moves on screen (17 Nov 2026): it glides and turns slowly, never darts or jumps; it fades in and out over about 1 s; a
  // spooked fish bolts calmly (a smooth speed-up as it fades)
  glide: { turn: 0.7, boltTurn: 1.6, acc: 0.35, boltAcc: 1.4, boltV: 1.4, fadeIn: 1, fadeOut: 1.1 },
  lead: { near: [1, 1.6], far: [3, 2.5], side: 1.2, still: [0.8, 2] },
  take: { base: 0.45, waitMult: 0.3, delay: [0.5, 1.5] },
};
/** The five outlines (§6.2) and their ids in fishing-fx's SDF branch. */
export const OUTLINE_ID = { deep: 1, torpedo: 2, long: 3, shoal: 4, claw: 5 };
/** Body width / length by outline (the drawn proportion). */
export const OUTLINE_ASPECT = { deep: 0.15, torpedo: 0.11, long: 0.075, shoal: 0.1, claw: 0.17 };   // half-width / length (fishing-fx's sightSdf)
export const OUTLINE_OF = {
  weeping_carp: 'deep', candlefin_koi: 'deep', rustfin_sucker: 'deep',
  mossback_perch: 'torpedo', overbold_bass: 'torpedo', likely_chub: 'torpedo', milkeye_perch: 'torpedo',
  reedjaw_pike: 'long', dusk_minnow: 'shoal', lampsipper: 'shoal', gutter_crayfish: 'claw',
};
/** Never seen (§6.2): too deep, a place's own, or a bait-only fish (its outline is after the MVP). Giants and legends by flag too. */
export const NEVER = new Set(['kissmark_trout', 'bridgechain_sturgeon', 'gloam_eel', 'belled_matriarch', 'thousandcast_pike', 'hullkiss_lamprey']);
/** Where a shape can be seen (§6.1): the margins, the lily beds' gaps, shallow stone and timber, the inflow's fan, a reed line's
 *  outer edge, the Lily Maze's shallow half; the Buoy Lights only at night, over its lamps. Never deep, open, drop-off, lane, the Span. */
export const SIGHT_AREAS = new Set(['margin', 'pads', 'stones', 'inflow', 'reeds', 'lily_maze']);
export const lightOf = (phase) => (phase === 'dusk' ? 'dusk' : phase === 'gloomtide' || phase === 'night' ? 'night' : 'day');

/** The lantern's reach on the water (m): the raft's light 8 m, Stub ×1.5, +15% a Lantern level. */
export const lanternRadius = ({ stub = false, level = 0 } = {}, S = SIGHT) =>
  num(S.lantern.r, 8) * (stub ? num(S.lantern.stub, 1.5) : 1) * (1 + num(S.lantern.perLevel, 0.15) * Math.max(0, num(level, 0)));
/** The lantern's intensity on the water at distance d (0..1): the light's own smooth window (three.js's range falloff), no step. */
export function lanternAt(d, R) {
  const u = clamp(num(d, 0) / Math.max(0.1, num(R, 8)), 0, 1);
  const w = clamp(1 - u * u * u * u, 0, 1);
  return w * w;
}
/** The distance at which the lantern's intensity falls to k (inverse of lanternAt). */
export const lanternReach = (R, k = SIGHT.lantern.min) => R * Math.pow(1 - Math.sqrt(clamp(k, 0, 1)), 0.25);
/** A drowned lamp's glow at distance d (0..1, smooth). */
export function lampAt(d, r = SIGHT.lamp.r) {
  const u = clamp(num(d, 0) / r, 0, 1);
  return (1 - u * u) * (1 - u * u);
}

/**
 * How visible a fish is at a point (0..1; 0 = it cannot be seen there). p = {area, depth, light, raftDist, lanternR, lamp (the Buoy
 * Lights' lamp glow there, 0..1), mist, quiet}. By day 1, at dusk 0.75, at night the dusk figure × the lantern's intensity; at the
 * Buoy Lights by night a shape shows only over a lamp (any depth there).
 */
export function visibleAt(p = {}, S = SIGHT) {
  if (!p || p.mist || p.quiet) return 0;
  const light = p.light || 'day';
  if (p.area === 'buoy_lights') return light === 'night' ? clamp(num(p.lamp, 0), 0, 1) : 0;
  if (!SIGHT_AREAS.has(p.area)) return 0;
  const depth = num(p.depth, 1);
  if (!(depth < num(S.depth, 0.45)) || depth < 0.02) return 0;
  if (p.area === 'reeds' && depth < num(S.reedOuter, 0.18)) return 0;
  if (light === 'day') return 1;
  if (light === 'dusk') return num(S.dusk, 0.75);
  return num(S.dusk, 0.75) * lanternAt(num(p.raftDist, 1e9), num(p.lanternR, lanternRadius({}, S)));
}
/** A new shape may spawn there: visible, and at night where the lantern's intensity (or a lamp's) is at least 0.25. */
export function canSpawnAt(p = {}, S = SIGHT) {
  const v = visibleAt(p, S);
  if (!(v > 0)) return false;
  if ((p.light || 'day') !== 'night') return true;
  if (p.area === 'buoy_lights') return num(p.lamp, 0) >= num(S.lantern.min, 0.25);
  return lanternAt(num(p.raftDist, 1e9), num(p.lanternR, lanternRadius({}, S))) >= num(S.lantern.min, 0.25);
}

/** The outline a species shows at this light and area (null: never seen here). The crayfish only at night on the stones; the Milkeye Perch
 *  only at night (in the lantern's light); the Lampsipper (a night fish) as a shoal. */
export function outlineOf(id, light = 'day', area = null) {
  if (!id || NEVER.has(id)) return null;
  const o = OUTLINE_OF[id] || null;
  if (!o) return null;
  if (id === 'gutter_crayfish' && (light !== 'night' || (area && area !== 'stones'))) return null;
  if (id === 'milkeye_perch' && light !== 'night') return null;
  return o;
}
/** Which fish is seen (§6.2): drawn from the who-is-there pool's entries ([{sp, w}] or [[sp, w]]) by weight, deep-bodied and long
 *  shapes ×1.5, never a giant, a legend, a bait-only fish or one of NEVER. null when none can be seen there. */
export function pickSight(entries, { light = 'day', area = null } = {}, rng = Math.random) {
  const opts = [];
  let tot = 0;
  for (const e of entries || []) {
    const sp = Array.isArray(e) ? e[0] : e.sp, w0 = Array.isArray(e) ? e[1] : e.w;
    if (!sp || sp.giant || sp.rarity === 'legendary' || sp.bait || sp.place) continue;
    const o = outlineOf(sp.id, light, area);
    if (!o) continue;
    const w = num(w0, 0) * (o === 'deep' || o === 'long' ? 1.5 : 1);
    if (!(w > 0)) continue;
    opts.push([sp, w]); tot += w;
  }
  if (!(tot > 0)) return null;
  let r = rng() * tot;
  for (const [sp, w] of opts) { r -= w; if (r <= 0) return sp; }
  return opts[opts.length - 1][0];
}
/** A silhouette's true length (m): data.sizeLength (cm) at its z, the fish's own, never the class length. */
export const sightLength = (D, sp, z, zone = null) => num(D?.sizeLength?.(sp, z, zone), 30) / 100;

/** The fallback spawn distance off the raft by length when no live camera is at hand (node tests, a headless page): §6.3 as revised
 *  16 Nov 2026 (the user's word, the lead's call): a small fish near, on the camera's side, a big one farther. Measured on the desktop
 *  play camera (960x540, the sail framing): under 30 cm 4.5–8 m, under 60 cm 5–11 m, under 1 m 6–15 m, bigger 7–20 m. */
export function spawnBand(L, S = SIGHT) {
  for (const [lim, band] of S.bands) if (L < lim) return band;
  return S.bands[S.bands.length - 1][1];
}
/** How far either side of the camera's bearing (rad, from the raft) a fallback spawn may lie: small fish lean to the camera's side. */
export const spawnSide = (L) => 0.9 + 0.6 * clamp(num(L, 0.3), 0, 1.2);
/** Its own distance off the raft (3–5 m): a small fish nearer, a big one farther, a little jitter (seed 0..1). */
export function keepOffFor(L, seed = 0.5, S = SIGHT) {
  const [a, b] = S.raft;
  const k = clamp((num(L, 0.3) - 0.12) / 0.6, 0, 1);
  return clamp(a + (b - a) * k + (seed - 0.5) * 0.6, a, b);
}
/** The distance band a new shape of length L may spawn in without a camera: the length band by day and dusk; at night inside the
 *  lantern's light. (With a live camera the spawn is chosen on the screen instead: readableSpot.) */
export function spawnRange(L, { light = 'day', lanternR = 8, keepOff = 4 } = {}, S = SIGHT) {
  if (light === 'night') return [keepOff + 0.4, Math.max(keepOff + 0.5, lanternReach(lanternR, num(S.lantern.min, 0.25)))];
  const [a, b] = spawnBand(L, S);
  return [Math.max(a, keepOff + 0.4), Math.max(b, keepOff + 0.9)];
}
/** Try up to `tries` points round the raft in a range; accept(x, z) → true takes it. {x, z, d} or null. `side` = {a (the camera's
 *  bearing from the raft, rad: x = cos a, z = sin a), w (how far either side)} leans the points to the camera's side. */
export function spawnPoint(raft, range, accept, rng = Math.random, tries = 6, side = null) {
  for (let i = 0; i < tries; i++) {
    const d = U(rng, range[0], range[1]), a = side && Number.isFinite(side.a) ? side.a + (rng() * 2 - 1) * num(side.w, Math.PI) : rng() * TAU;
    const x = raft.x + Math.cos(a) * d, z = raft.z + Math.sin(a) * d;
    if (accept(x, z)) return { x, z, d };
  }
  return null;
}

// ---- where a shape reads (16 Nov 2026: the user's word wins over §6.3's bands). Every silhouette is spawned where its TRUE length
// draws at least READ.px on this screen through the live camera (about 24 px on a phone, 30 on a desktop), measured broadside, as it
// is first seen; it is never drawn bigger than the fish. Where the camera cannot draw a fish that big anywhere in the open part of the
// frame (a small perch on a phone: the play camera stands 18 m off and 11 m up there), it is put where it draws biggest, and a fish
// that would still draw under READ.floor of the mark is not seen at all (the pick rolls again), as a real angler does not make out a
// hand-long perch at that range. Pure maths on the camera's matrices (three.js's column-major elements), no three.js import.
export const READ = {
  px: { phone: 24, desk: 30 },
  floor: 0.65,                          // a share of px: under it the fish is not seen on this screen
  frame: { x: [0.08, 0.92], y: [0.18, 0.8] },               // the open part of the frame (the HUD's bands lie outside it)
  // a phone held upright: the touch stick's thumb ring sits low on the left (ui.css .gw-joyzone: 44vw × 46vh, its hint at about
  // 0.2 W, 0.83 H) and the HOME band along the foot, so the open frame reaches lower on the right, away from the thumb (`low`)
  framePortrait: { x: [0.1, 0.9], y: [0.2, 0.72], low: { x: [0.47, 0.9], y: [0.72, 0.87] } },
  tries: 36, maxD: 24, jitter: 0.45,    // screen samples per search; the farthest off the raft (m); heading ± (rad) off broadside
  inset: { x: 0.03, y: 0.05 },          // a spawn keeps this far inside the frame (it may swim to the frame's edge, then turns back)
};
/** The mark (px) a silhouette's drawn length must reach on a W×H screen: a phone held upright (or any screen under 480 px) 24, else 30. */
export const readPx = (W, H, R = READ) => (num(W, 960) < num(H, 540) || Math.min(num(W, 960), num(H, 540)) < 480 ? R.px.phone : R.px.desk);
/** A plain lens from a three.js camera (its world, view and projection matrices, kept by reference) and the screen in CSS px. */
export function lensOf(cam, W, H) {
  const m = cam?.matrixWorld?.elements, v = cam?.matrixWorldInverse?.elements, p = cam?.projectionMatrix?.elements;
  if (!m || !v || !p || !(num(W, 0) > 0) || !(num(H, 0) > 0) || !(Math.abs(p[0]) > 1e-6)) return null;
  return { m, v, p, W, H };
}
/** World (x, y, z) to screen px: {x, y, w (the clip w: > 0 in front)} or null behind the lens. */
export function toScreen(lens, x, y, z) {
  const v = lens.v, p = lens.p;
  const vx = v[0] * x + v[4] * y + v[8] * z + v[12], vy = v[1] * x + v[5] * y + v[9] * z + v[13], vz = v[2] * x + v[6] * y + v[10] * z + v[14];
  const cx = p[0] * vx + p[4] * vy + p[8] * vz + p[12], cy = p[1] * vx + p[5] * vy + p[9] * vz + p[13], cw = p[3] * vx + p[7] * vy + p[11] * vz + p[15];
  if (!(cw > 1e-4)) return null;
  return { x: (cx / cw + 1) * 0.5 * lens.W, y: (1 - cy / cw) * 0.5 * lens.H, w: cw };
}
/** Screen px (sx, sy) down to the water (y = y0): {x, z, t (the ray's length)} or null where the ray does not meet it. */
export function fromScreen(lens, sx, sy, y0 = 0) {
  const m = lens.m, p = lens.p;
  const nx = (sx / lens.W) * 2 - 1, ny = 1 - (sy / lens.H) * 2;
  const cx = (nx + p[8]) / p[0], cy = (ny + p[9]) / p[5];   // (the camera-space ray through it, at z = −1)
  const dx = m[0] * cx + m[4] * cy - m[8], dy = m[1] * cx + m[5] * cy - m[9], dz = m[2] * cx + m[6] * cy - m[10];
  const ox = m[12], oy = m[13], oz = m[14];
  if (!(dy < -1e-6) || !(oy > y0)) return null;
  const t = (y0 - oy) / dy;
  return { x: ox + dx * t, z: oz + dz * t, t };
}
/** The heading (§6's convention: forward = (sin h, cos h)) that lies a fish across the view at (x, z): broadside to the lens. */
export function broadside(lens, x, z) {
  const dx = x - lens.m[12], dz = z - lens.m[14], n = Math.hypot(dx, dz) || 1;
  return Math.atan2(dz / n, -dx / n);
}
/**
 * A fish's drawn length on the screen (px): the segment of its true length lengthM lying on the water at `at` ({x, z, y?}) along
 * `heading` (default: broadside to the lens), through the lens's real projection. 0 behind the lens.
 */
export function projectedLength(lengthM, at, lens, heading = null) {
  if (!lens || !at) return 0;
  const h = Number.isFinite(heading) ? heading : broadside(lens, at.x, at.z);
  let hx = Math.sin(h) * num(lengthM, 0) * 0.5, hz = Math.cos(h) * num(lengthM, 0) * 0.5;
  const y = num(at.y, 0), k = lookStretch(lens, at.x, y, at.z);
  if (k.s > 1) { const along = hx * k.dx + hz * k.dz; hx += k.dx * along * (k.s - 1); hz += k.dz * along * (k.s - 1); }   // (as fishing-fx draws it)
  const a = toScreen(lens, at.x - hx, y, at.z - hz), b = toScreen(lens, at.x + hx, y, at.z + hz);
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
}
/** fishing-fx's look into the water (its SIGN_VS): a silhouette's footprint is eased out along the line of sight by (1 / sin of the
 *  view's angle)^0.75, at most 2×, so the play camera's low angle does not press it flat; across the view its length is untouched,
 *  end on it never draws longer than across. {s, dx, dz} (dx, dz: the level direction toward the lens). */
export function lookStretch(lens, x, y, z) {
  const tx = lens.m[12] - x, ty = lens.m[13] - num(y, 0), tz = lens.m[14] - z, hl = Math.hypot(tx, tz), l = Math.hypot(hl, ty);
  const sg = clamp(ty / Math.max(l, 1e-3), 0.05, 1);
  return { s: clamp(Math.pow(1 / sg, 0.75), 1, 2), dx: hl > 1e-3 ? tx / hl : 0, dz: hl > 1e-3 ? tz / hl : 1 };
}
/** The open part of the frame as rects of screen fractions [{x: [x0, x1], y: [y0, y1]}] (READ.frame; a phone held upright:
 *  framePortrait and its `low` reach on the right). inset: kept that far inside (a spawn's room to swim), `low` joined to the main
 *  rect's inset foot so the two stay one open area. */
export function frameRects(lens, R = READ, inset = true) {
  const F0 = lens.W < lens.H ? R.framePortrait : R.frame, ix = inset ? num(R.inset?.x, 0) : 0, iy = inset ? num(R.inset?.y, 0) : 0;
  const out = [{ x: [F0.x[0] + ix, F0.x[1] - ix], y: [F0.y[0] + iy, F0.y[1] - iy] }];
  if (F0.low) out.push({ x: [F0.low.x[0] + ix, F0.low.x[1] - ix], y: [F0.y[1] - iy, F0.low.y[1] - iy] });
  return out;
}
/** A random point (screen fractions [sx, sy]) in the open frame's rects, by their areas. */
export function framePoint(rects, rng = Math.random) {
  let tot = 0;
  for (const r of rects) tot += (r.x[1] - r.x[0]) * (r.y[1] - r.y[0]);
  let k = rng() * tot, f = rects[0];
  for (const r of rects) { const a = (r.x[1] - r.x[0]) * (r.y[1] - r.y[0]); if (k <= a) { f = r; break; } k -= a; }
  return [U(rng, f.x[0], f.x[1]), U(rng, f.y[0], f.y[1])];
}
/** Is (x, z) inside the open part of the frame (READ.frame; a phone held upright: framePortrait with its `low` reach)? */
export function inFrame(lens, x, z, R = READ, y = 0) {
  const s = toScreen(lens, x, y, z);
  if (!s) return false;
  const fx = s.x / lens.W, fy = s.y / lens.H;
  for (const F of frameRects(lens, R, false)) if (fx >= F.x[0] && fx <= F.x[1] && fy >= F.y[0] && fy <= F.y[1]) return true;
  return false;
}
/**
 * Where a fish of true length L reads on this screen. o = {lens, raft {x, z}, keepOff, accept(x, z) → it may spawn there, rng, need
 * (px; default readPx), floor (px; default need × READ.floor), maxD, tries, heading (fixed, else broadside ± READ.jitter), near
 * (rings [{x, z, r0, r1}] probed too)}; accept
 * is handed the candidate too (x, z, {heading, px, …}: the shape as it would lie, for its head, tail and shadow). Samples
 * the open part of the frame, down to the water, past its own distance off the raft: a spot that draws ≥ need is taken at random
 * among those found (so big fish spread over the whole frame, small ones keep to the near water, on the camera's side); with none, the
 * spot that draws biggest if it reaches the floor. {x, z, d, px, heading, reads (≥ need)} or null (not seen on this screen).
 */
export function readableSpot(L, o = {}, R = READ) {
  const lens = o.lens, raft = o.raft || { x: 0, z: 0 }, rng = o.rng || Math.random;
  if (!lens) return null;
  const need = num(o.need, readPx(lens.W, lens.H, R)), floor = num(o.floor, need * num(R.floor, 0.65));
  const minD = num(o.keepOff, keepOffFor(L)) + 0.4, maxD = num(o.maxD, R.maxD), tries = num(o.tries, R.tries);
  const rects = frameRects(lens, R);   // (spawned a little inside the frame: room to swim)
  const good = [], short = [];
  const probe = (sx, sy) => {
    const w = fromScreen(lens, sx * lens.W, sy * lens.H);
    if (!w) return;
    const d = Math.hypot(w.x - raft.x, w.z - raft.z);
    if (d < minD || d > maxD) return;
    const b = broadside(lens, w.x, w.z) + (rng() < 0.5 ? 0 : Math.PI);
    let heading = Number.isFinite(o.heading) ? o.heading : b + (rng() * 2 - 1) * num(R.jitter, 0.45);
    let px = projectedLength(L, w, lens, heading);
    if (px < need && !Number.isFinite(o.heading)) { const pb = projectedLength(L, w, lens, b); if (pb > px) { px = pb; heading = b; } }   // (squarely across the view where a turn would lose the mark)
    const c = { x: w.x, z: w.z, d, px, heading: wrap(heading), reads: px >= need };
    (c.reads ? good : short).push(c);
  };
  for (let i = 0; i < tries; i++) { const [sx, sy] = framePoint(rects, rng); probe(sx, sy); }
  // and along each rect's lower edge, where the camera draws a fish biggest (so a fish that can just make the mark finds where)
  for (const F of rects) for (let i = 0; i < 11; i++) probe(F.x[0] + (F.x[1] - F.x[0]) * (i + 0.5 + (rng() - 0.5) * 0.5) / 11, F.y[1] - (F.y[1] - F.y[0]) * 0.05 * rng());
  // none reads yet (a big fish's own distance off the raft leaves little of a close framing's water): a jittered grid over the frame
  if (!good.length) for (const F of rects) for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) probe(F.x[0] + (F.x[1] - F.x[0]) * (i + rng()) / 12, F.y[0] + (F.y[1] - F.y[0]) * (j + rng()) / 12);
  // (o.near: [{x, z, r0, r1}] rings round the things it lies by, as a lamp's light at the Buoy Lights: probed there as well)
  for (const q of o.near || []) for (let k = 0; k < 6; k++) {
    const a = rng() * TAU, r = U(rng, q.r0, q.r1), s2 = toScreen(lens, q.x + Math.cos(a) * r, 0, q.z + Math.sin(a) * r);
    if (s2) probe(s2.x / lens.W, s2.y / lens.H);
  }
  for (let i = good.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = good[i]; good[i] = good[j]; good[j] = t; }
  for (const c of good) if (!o.accept || o.accept(c.x, c.z, c)) return c;
  // (none it may lie at among those that read: a jittered grid over the frame before it settles for less)
  if (good.length && o.accept) {
    const n0 = good.length;
    for (const F of rects) for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) probe(F.x[0] + (F.x[1] - F.x[0]) * (i + rng()) / 12, F.y[0] + (F.y[1] - F.y[0]) * (j + rng()) / 12);
    for (const c of good.slice(n0)) if (o.accept(c.x, c.z, c)) return c;
  }
  short.sort((a, b) => b.px - a.px);   // none reads in view: the biggest it draws, if that reaches the floor
  for (const c of short) { if (c.px < floor) break; if (!o.accept || o.accept(c.x, c.z, c)) return c; }
  return null;
}
/**
 * Is the line of sight from the lens (eye {x, y, z}) down to the water at (x, z) blocked: by a blocker [{x, z, r, h}] (a rock island, a
 * pillar, the raft and its Wick), or by the land (land(x, z) → true: the shore's boulders stand up to `bank` m there)? Sampled
 * every 0.4 m along the ray. A shape put where it reads must also be in sight: never behind a foreground rock.
 */
export function sightBlocked(x, z, eye, blockers = [], land = null, bank = 3.6) {
  if (!eye) return false;
  const dx = num(eye.x, x) - x, dy = num(eye.y, 0), dz = num(eye.z, z) - z, len = Math.hypot(dx, dz);
  const n = Math.max(2, Math.ceil(len / 0.4));
  for (let i = 1; i < n; i++) {
    const t = i / n, px = x + dx * t, pz = z + dz * t, py = dy * t;
    for (const b of blockers) if (py < b.h && (px - b.x) * (px - b.x) + (pz - b.z) * (pz - b.z) < b.r * b.r) return true;
    if (land && py < bank && land(px, pz)) return true;
  }
  return false;
}
/** A shape's drawn half-length (m) at (x, z) along `heading`: half its true length, eased out along the line of sight as fishing-fx
 *  draws it (lookStretch); with no lens, the most the look can stretch it (2×). */
export function drawnHalf(L, lens, x, z, heading = null) {
  const half = num(L, 0.3) * 0.5;
  if (!lens) return half * 2;
  const k = lookStretch(lens, x, 0, z);
  if (!Number.isFinite(heading)) return half * k.s;
  const hx = Math.sin(heading), hz = Math.cos(heading), al = hx * k.dx + hz * k.dz;
  return half * Math.hypot(hx + k.dx * al * (k.s - 1), hz + k.dz * al * (k.s - 1));
}
/**
 * The points a drawn shape covers on the water: its centre, its head and its tail as drawn (the look's stretch), and the same three of
 * its shadow (offset {x, z}, shadowOffset) — [[x, z], …]. The sight test runs on each, so no part of a fish lies behind a post.
 */
export function shapePoints(L, x, z, heading, lens = null, shadow = null) {
  let hx = Math.sin(num(heading, 0)) * num(L, 0.3) * 0.5, hz = Math.cos(num(heading, 0)) * num(L, 0.3) * 0.5;
  if (lens) { const k = lookStretch(lens, x, 0, z); if (k.s > 1) { const al = hx * k.dx + hz * k.dz; hx += k.dx * al * (k.s - 1); hz += k.dz * al * (k.s - 1); } }
  const pts = [[x, z], [x + hx, z + hz], [x - hx, z - hz]];
  if (shadow && (shadow.x || shadow.z)) for (const [px, pz] of pts.slice(0, 3)) pts.push([px + shadow.x, pz + shadow.z]);
  return pts;
}
/** Is any part of a drawn shape (shapePoints) out of the lens's sight (sightBlocked)? */
export function shapeBlocked(L, x, z, heading, eye, blockers = [], land = null, lens = null, shadow = null) {
  if (!eye) return false;
  for (const [px, pz] of shapePoints(L, x, z, heading, lens, shadow)) if (sightBlocked(px, pz, eye, blockers, land)) return true;
  return false;
}
/** The most a fish of length L can draw anywhere a spawn may go (the open frame, inset) past dMin off the raft (px; a fine scan, for tests). */
export function bestReadPx(L, lens, raft = { x: 0, z: 0 }, dMin = 3.4, maxD = READ.maxD, R = READ, n = 48) {
  let best = 0;
  for (const F of frameRects(lens, R)) for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {   // (where a spawn may go)
    const w = fromScreen(lens, (F.x[0] + (F.x[1] - F.x[0]) * i / n) * lens.W, (F.y[0] + (F.y[1] - F.y[0]) * j / n) * lens.H);
    if (!w) continue;
    const d = Math.hypot(w.x - raft.x, w.z - raft.z);
    if (d < dMin || d > maxD) continue;
    best = Math.max(best, projectedLength(L, w, lens));
  }
  return best;
}
/** How many may live: two at a time on every tier (17 Nov 2026; a shoal is one). */
export const sightCap = (tier = 'high', S = SIGHT) => Math.min(2, num(S.alive[tier], 2));

let SEQ = 0;
/**
 * A new silhouette. o = {sp, z, length (m), x, z, heading, area, light, t, rng, n (a shoal's count)}. Its home is where it spawned:
 * it keeps to its area round there (fishing.js passes env.ok for the area, depth and obstacles).
 */
export function createSight(o = {}) {
  const rng = o.rng || Math.random;
  const outline = o.outline || outlineOf(o.sp?.id, o.light, o.area) || 'torpedo';
  const L = Math.max(0.05, num(o.length, 0.3));
  const seed = rng();
  return {
    id: o.id ?? `sight${++SEQ}`, kind: 'sight', sp: o.sp || null, zs: num(o.zScore, 0), length: L, outline,   // (zs: its size score; z is where it is)
    x: o.x, z: o.z, home: { x: o.x, z: o.z }, heading: num(o.heading, rng() * TAU), speed: 0, turn: 0, hT: null, vT: null,   // (hT, vT: where it is turning to and the pace it eases to)
    area: o.area || null, light: o.light || 'day', depth: num(o.depth, 0.3), seed,
    keepOff: keepOffFor(L, seed), leash: clamp(3 + 5 * L, 4, 12), n: outline === 'shoal' ? 3 + Math.floor(rng() * 3) : 1,
    mode: 'cruise', modeT: 0, age: 0, life: U(rng, SIGHT.life[0], SIGHT.life[1]), alpha: 0, vis: 1,
    bait: null, tailT: 0, cloudAt: -1, gone: false, born: num(o.t, 0),
  };
}
/** The pace and timings of each outline (§6.4). */
const PACE = {
  deep:    { speed: [0.25, 0.45], cruise: [6, 14], stop: [4, 10] },
  torpedo: { speed: [0.4, 0.8], cruise: [3, 8], stop: [2, 5] },
  long:    { speed: [0.22, 0.35], cruise: [3, 6], stop: [6, 12] },     // holds most of the time, then glides a little way (never darts)
  shoal:   { speed: [0.5, 0.5], cruise: [4, 8], stop: [0, 0] },
  claw:    { speed: [0.1, 0.1], cruise: [2, 5], stop: [2, 6] },
};
function setMode(f, mode, rng) {
  const P = PACE[f.outline] || PACE.torpedo;
  f.mode = mode;
  if (mode === 'cruise') { f.modeT = U(rng, P.cruise[0], P.cruise[1]); f.vT = U(rng, P.speed[0], P.speed[1]); if (f.outline === 'shoal') f.turn = (rng() < 0.5 ? -1 : 1) * U(rng, 0.15, 0.35); else f.turn = (rng() - 0.5) * 0.25; }
  else if (mode === 'hold' || mode === 'root') { f.modeT = U(rng, P.stop[0], P.stop[1]); f.vT = 0; }
}
/**
 * Step a silhouette by dt. env = {raft: {x, z}, ok(x, z) → it may swim there (its area, shallow enough, 1 m off islands and pillars),
 * depth(x, z), rng}. Returns events: [{type: 'tail', x, z}] (rooting in water < 0.3 breaks the film: a tailing tell and a mud cloud),
 * [{type: 'bolt', x, z, heading, cause}] (the raft came within its distance), [{type: 'reach'}] (a taking fish reached the bait),
 * [{type: 'gone'}] (faded out: remove it).
 */
export function stepSight(f, dt, env = {}) {
  const rng = env.rng || Math.random;
  const ev = [];
  if (!f || f.gone) return ev;
  const G = SIGHT.glide;
  if (!Number.isFinite(f.hT)) f.hT = f.heading;
  if (!Number.isFinite(f.vT)) f.vT = f.speed;
  f.age += dt;
  if (f.mode !== 'bolt' && f.mode !== 'sink' && f.mode !== 'take' && f.mode !== 'nose') {
    if (f.age >= f.life || env.quiet) { f.mode = 'sink'; f.modeT = G.fadeOut + 0.2; f.vT = Math.min(f.vT, 0.15); }
  }
  // fade: in over about 1 s; out over about 1 s as it bolts or sinks
  if (f.mode === 'bolt') f.alpha = Math.max(0, f.alpha - dt / SIGHT.spook.bolt);
  else if (f.mode === 'sink') f.alpha = Math.max(0, f.alpha - dt / G.fadeOut);
  else f.alpha = Math.min(1, f.alpha + dt / G.fadeIn);
  const raft = env.raft;
  const rd = raft ? Math.hypot(f.x - raft.x, f.z - raft.z) : 1e9;
  if (raft && rd < f.keepOff && f.mode !== 'bolt' && f.mode !== 'sink' && f.mode !== 'take') {
    bolt(f, Math.atan2(f.x - raft.x, f.z - raft.z));
    ev.push({ type: 'bolt', x: f.x, z: f.z, heading: f.heading, cause: 'raft' });
  }
  f.modeT -= dt;
  switch (f.mode) {
    case 'cruise': {
      if (f.outline === 'shoal' && f.modeT <= 0) f.turn = -f.turn;
      if (Math.abs(wrap(f.hT - f.heading)) < 0.05) f.hT = wrap(f.hT + f.turn * dt);   // (a slow drift of its line; a turn under way runs out first)
      if (f.outline !== 'shoal' && rng() < dt * 0.2) f.turn = (rng() - 0.5) * 0.35;
      if (f.modeT <= 0) {
        if (f.outline === 'shoal') setMode(f, 'cruise', rng);
        else if (f.outline === 'deep') setMode(f, 'root', rng);
        else if (f.outline === 'torpedo') { if (rng() < 0.35) setMode(f, 'hold', rng); else { f.hT = wrap(f.heading + (rng() < 0.5 ? -1 : 1) * U(rng, 0.8, 1.6)); setMode(f, 'cruise', rng); } }
        else setMode(f, 'hold', rng);
      }
      break;
    }
    case 'hold': case 'root': {
      f.vT = 0;
      if (f.mode === 'root' && num(env.depth?.(f.x, f.z), 1) < 0.3) {   // tailing: the tail breaks the film, head down; a cloud where it digs
        f.tailT -= dt;
        if (f.tailT <= 0) { f.tailT = U(rng, 1.8, 3.2); ev.push({ type: 'tail', x: f.x - Math.sin(f.heading) * f.length * 0.45, z: f.z - Math.cos(f.heading) * f.length * 0.45, heading: f.heading }); }
      }
      if (f.modeT <= 0) {
        if (f.mode === 'root') f.hT = wrap(f.heading + Math.PI + (rng() - 0.5) * 0.8);   // turns back along the same route (slowly)
        if (f.outline === 'long') f.hT = wrap(f.heading + (rng() - 0.5) * 1.6);
        setMode(f, 'cruise', rng);
      }
      break;
    }
    case 'bolt': f.vT = G.boltV; if (f.modeT <= 0 || f.alpha <= 0) f.gone = true; break;
    case 'sink': if (f.modeT <= 0 || f.alpha <= 0) f.gone = true; break;
    case 'take': case 'nose': {
      const b = f.bait;
      if (!b) { setMode(f, 'cruise', rng); break; }
      if (f.wait > 0) { f.wait -= dt; f.vT = 0; break; }   // the bob settles (0.5–1.5 s), then it turns to the bait
      f.hT = Math.atan2(b.x - f.x, b.z - f.z);
      const d = Math.hypot(b.x - f.x, b.z - f.z) - f.length * 0.5;
      f.vT = d > 0.15 ? Math.min(0.5, 0.15 + d * 0.3) * (Math.abs(wrap(f.hT - f.heading)) < 0.8 ? 1 : 0.3) : 0;
      if (d <= 0.15 && !f.reached) {
        f.reached = true;
        if (f.mode === 'take') ev.push({ type: 'reach' });
        else { f.mode = 'turn'; f.modeT = 1.2; }
      }
      break;
    }
    case 'turn': {   // it noses the bait and turns slowly away (no spook)
      f.hT = wrap(f.heading + 0.6);
      f.vT = 0.18;
      if (f.modeT <= 0) { f.bait = null; f.reached = false; setMode(f, 'cruise', rng); }
      break;
    }
    default: setMode(f, 'cruise', rng);
  }
  // the glide: it turns toward hT and eases to vT, never by a jump (a calm bolt turns and speeds up a little quicker)
  const bolting = f.mode === 'bolt';
  const tr = (bolting ? G.boltTurn : G.turn) * dt, ac = (bolting ? G.boltAcc : G.acc) * dt;
  f.hT = wrap(f.hT);
  f.heading = wrap(f.heading + clamp(wrap(f.hT - f.heading), -tr, tr));
  f.speed = Math.max(0, f.speed + clamp(f.vT - f.speed, -ac, ac));
  if (f.speed > 0) {
    const free = f.mode === 'bolt' || f.mode === 'take' || f.mode === 'nose' || f.mode === 'turn';
    const can = (x, z) => Math.hypot(x - f.home.x, z - f.home.z) < num(f.leash, 12)   // (it keeps near where it was first seen: a small fish a few metres)
      && (!raft || Math.hypot(x - raft.x, z - raft.z) >= f.keepOff + 0.3) && (!env.ok || env.ok(x, z));
    // it looks ahead by its head and the way it needs to slow: nearing the edge of its water (or the raft's distance) it slows and
    // turns back gently
    const la = 0.2 + f.length * 0.5 + f.speed * f.speed / (2 * G.acc);
    if (!free && Math.abs(wrap(f.hT - f.heading)) < 0.3 && !can(f.x + Math.sin(f.heading) * la, f.z + Math.cos(f.heading) * la)) {
      f.hT = wrap(f.heading + Math.PI * (0.55 + 0.3 * rng()) * (rng() < 0.5 ? -1 : 1));
      f.vT = Math.min(f.vT, 0.1);
    }
    const nx = f.x + Math.sin(f.heading) * f.speed * dt, nz = f.z + Math.cos(f.heading) * f.speed * dt;
    if (free || can(nx, nz)) { f.x = nx; f.z = nz; }
    else f.speed = Math.max(0, f.speed - (G.boltAcc - G.acc) * dt);   // (at the very edge it comes to rest while it turns)
  }
  if (f.gone) ev.push({ type: 'gone' });
  return ev;
}
function bolt(f, away) {
  f.mode = 'bolt'; f.modeT = SIGHT.spook.bolt; f.vT = SIGHT.glide.boltV; f.bait = null;
  if (Number.isFinite(away)) f.hT = away;   // (it turns away and speeds up smoothly as it fades: a calm bolt, never a jump)
}
/** Make it bolt away from (x, z) (a cast on it, a splash by it): {type: 'bolt', x, z, heading}. */
export function boltFrom(f, x, z) {
  bolt(f, Math.atan2(f.x - x, f.z - z));
  return { type: 'bolt', x: f.x, z: f.z, heading: f.heading };
}
/** The fish's head (its front, L/2 ahead of its centre). */
export const headOf = (f) => ({ x: f.x + Math.sin(f.heading) * f.length * 0.5, z: f.z + Math.cos(f.heading) * f.length * 0.5 });
const isStill = (f) => f.speed < 0.05 || f.mode === 'hold' || f.mode === 'root';
/**
 * Does this spook it (§6.5)? ev = {cast: {x, z}} (a cast that lands on it: within 0.6 m + half its length of its body), {raft: {x, z}}
 * (within its own distance), or {splash: {x, z}} (a splash within 2 m of a still fish).
 */
export function spookTest(f, ev = {}, S = SIGHT) {
  if (!f || f.gone || f.mode === 'bolt' || f.mode === 'sink') return false;
  if (ev.cast) return Math.hypot(ev.cast.x - f.x, ev.cast.z - f.z) <= num(S.spook.r, 0.6) + f.length * 0.5;
  if (ev.raft) return Math.hypot(ev.raft.x - f.x, ev.raft.z - f.z) < f.keepOff;
  if (ev.splash) return isStill(f) && Math.hypot(ev.splash.x - f.x, ev.splash.z - f.z) <= num(S.spook.splash, 2);
  return false;
}
/**
 * Does a cast at (x, z) lead it (§6.6)? A moving fish: ahead on its line, from 1 m + 1.6 m × speed to 3 m + 2.5 m × speed along its
 * heading (from its head), ≤ 1.2 m to either side; a still or rooting fish: 0.8–2 m from its head, beside it (never behind its head).
 * Never on it (the spook disc wins). Returns 'lead' | 'still' | null.
 */
export function leadTest(f, x, z, S = SIGHT) {
  if (!f || f.gone || f.mode === 'bolt' || f.mode === 'sink' || f.mode === 'take' || f.mode === 'nose') return null;
  if (spookTest(f, { cast: { x, z } }, S)) return null;
  const h = headOf(f), fx = Math.sin(f.heading), fz = Math.cos(f.heading);
  const dx = x - h.x, dz = z - h.z;
  const along = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx);
  if (isStill(f)) {
    const d = Math.hypot(dx, dz);
    return d >= S.lead.still[0] && d <= S.lead.still[1] && along >= -0.15 ? 'still' : null;
  }
  const v = Math.max(0, f.speed);
  const a = S.lead.near[0] + S.lead.near[1] * v, b = S.lead.far[0] + S.lead.far[1] * v;
  return along >= a && along <= b && side <= S.lead.side ? 'lead' : null;
}
/** The take's chance by grade (§3.6; watercraft.takeChance when given): 0 → 0.01, 1 → base, 2 → base + 0.1, 3 → base + 0.2 (≤ 0.9). */
export function takeChance(base, grade, wc = null) {
  if (typeof wc?.takeChance === 'function') return wc.takeChance(base, grade);
  if (grade === 0) return 0.01;
  if (grade === 2) return Math.max(base, Math.min(0.9, base + 0.1));
  if (grade === 3) return Math.max(base, Math.min(0.9, base + 0.2));
  return base;
}
/**
 * The cast rule a silhouette gives a cast at (x, z): a lead → {kind: 'sight', id, inSign, form: outline, preroll: {chance: 0.45},
 * takeWaitMult: 0.3, makers: [its species], respond: 'take'}; on it → a spook {spook: true, waitMult: 1.5}; else null.
 */
export function sightRule(f, x, z, S = SIGHT) {
  if (!f || f.gone) return null;
  if (spookTest(f, { cast: { x, z } }, S)) return { kind: 'sight', id: f.id, inSign: false, form: f.outline, spook: true, waitMult: num(S.spook.waitMult, 1.5) };
  const l = leadTest(f, x, z, S);
  if (!l) return null;
  // (makers name the fish for the logs; tilt 1: the pool behind a refusal is not tilted, §6.6)
  return { kind: 'sight', id: f.id, inSign: true, form: f.outline, lead: l, preroll: { chance: num(S.take.base, 0.45) }, takeWaitMult: num(S.take.waitMult, 0.3),
    makers: f.sp?.id ? [f.sp.id] : [], tilt: 1, respond: 'take' };
}
/** A led fish turns to the bait after the bob settles (0.5–1.5 s): take (it will bite) or nose (it refuses and turns away). */
export function approach(f, bob, took, rng = Math.random, S = SIGHT) {
  f.mode = took ? 'take' : 'nose';
  f.bait = { x: bob.x, z: bob.z };
  f.wait = U(rng, S.take.delay[0], S.take.delay[1]);
  f.reached = false;
  f.life = Math.max(f.life, f.age + 20);
}
/** Spooked water goes quiet (§6.5): no new silhouette within 10 m for 30 s. quiet = [{x, z, until}]. */
export function quietAt(quiet, x, z, t, S = SIGHT) {
  for (const q of quiet || []) if (t < q.until && Math.hypot(q.x - x, q.z - z) < num(S.spook.quietR, 10)) return true;
  return false;
}
/** The drawn shadow's offset (m, world): by the light (the low sun late in the day, the sky at dusk, the lantern at night) and depth. */
export function shadowOffset(f, { light = 'day', raft = null, sunDir = { x: 0.6, z: -0.8 } } = {}) {
  const k = 0.06 + 0.7 * clamp(num(f.depth, 0.3), 0, 0.5);   // (a little off the body: never read as a second fish)
  let dx = sunDir.x, dz = sunDir.z;
  if (light === 'dusk') { dx = 0.35; dz = -0.5; }
  if (light === 'night' && raft) { const d = Math.hypot(f.x - raft.x, f.z - raft.z) || 1; dx = (f.x - raft.x) / d; dz = (f.z - raft.z) / d; }
  const n = Math.hypot(dx, dz) || 1;
  return { x: dx / n * k, z: dz / n * k };
}
