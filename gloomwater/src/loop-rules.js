// loop-rules.js — main's pure guards for the Full Hold (docs/loop/slice-1a/PLAN.md §3.5; lane B). main.js is never imported in
// node, so every rule main applies to the loop's flow lives here, where tools/tests/loop-evening.test.mjs reads it. Nothing here
// reads ctx, data or the DOM: each function takes what it decides on and returns a plain value. Off the loop main never calls them.

const TRIP_FLOWS = new Set(['home', 'title']);
const PLAY_STATES = new Set(['bite', 'reeling', 'landing']);

/** A trip ends only at home (T31): every other cause (death, abandon, victory, a title's New Descent) is refused under the loop. */
export function tripEndAllowed(cause) { return cause === 'home'; }

/** A trip starts only from home or the title, and never over a saved trip (T31; a saved trip is Continued, never replaced). */
export function tripStartAllowed({ flow, hasSavedTrip } = {}) { return TRIP_FLOWS.has(flow) && hasSavedTrip !== true; }

/**
 * May the player go home now (T49, PLAN CHOICE 4)? Not during a play (a bite, the reel, the landing), the show, an open card or a
 * got-away note still to come; not paused (unless the press comes from the pause menu's Home), not in another flow, not off a
 * trip. A line in the water (charging, casting, waiting) is fine: Home reels it in and nothing is spent.
 * → {ok, why}, why ∈ 'play' | 'show' | 'card' | 'note' | 'flow' | null.
 */
export function goHomeAllowed({ flow, outing, paused = false, fromPause = false, cinematic = false, inShow = false, fishingState = 'idle',
  blocking = false, cardOpen = false, notePending = false } = {}) {
  if (flow !== 'playing' || outing !== 'trip' || (paused === true && fromPause !== true)) return { ok: false, why: 'flow' };
  if (PLAY_STATES.has(fishingState)) return { ok: false, why: 'play' };
  if (cinematic === true || inShow === true) return { ok: false, why: 'show' };
  if (cardOpen === true || (fromPause !== true && blocking === true)) return { ok: false, why: 'card' };
  if (notePending === true) return { ok: false, why: 'note' };
  return { ok: true, why: null };
}

/** game.startNewRun's first line (T44, PLAN CHOICE 2): under the loop the film's hand-off goes home, anything else is a trip. */
export function startRoute({ loopOn = false, intro = false } = {}) {
  if (loopOn !== true) return 'built';
  return intro === true ? 'home' : 'trip';
}

/**
 * main's keydown on a trip (T58): KeyE (Murk is home, the gate is scenery) and the Flare keys do nothing. Space is the strike in a
 * bite and the hurry in a show, both of which main routes before it asks; outside them it is the parked Flare.
 */
export function tripKeyAllowed(code, { biting = false, inShow = false } = {}) {
  if (code === 'KeyE' || code === 'KeyF') return false;
  if (code === 'Space') return biting === true || inShow === true;
  return true;
}

/**
 * The title's fresh branch (T62, PLAN CHOICE 33): nothing of the loop has begun. No trip saved, no Wick chosen, no tutorial
 * record and no evening sold. An old v3 save with runs and no loop block is fresh to the loop.
 */
export function loopFreshSave(meta, hasSavedTrip = false) {
  if (hasSavedTrip === true) return false;
  const L = meta && typeof meta === 'object' ? meta.loop : null;
  if (!L || typeof L !== 'object') return true;
  if (L.wick != null && L.wick !== '') return false;
  if (L.tutorial != null) return false;
  return !(Number(L.evenings) > 0);
}

/** Does Start play the film (T63, PLAN CHOICE 34)? A release build always; a debug build only after the intro opt-in. */
export function filmAllowed({ intro = false, debug = false, optIn = false } = {}) {
  return intro === true && (debug !== true || optIn === true);
}

/**
 * The sail home (PLAN §2.2 item 7, CHOICE 44): from the raft, `secs` of raft speed toward the Jetty's dock (never past it).
 * → [[x, z], [x, z]] for player.glide, or null when the raft is already at the dock.
 */
export function homeGlidePath(from, dock, speed = 6, secs = 2) {
  const fx = Number(from?.x), fz = Number(from?.z), dx = Number(dock?.x), dz = Number(dock?.z);
  if (![fx, fz, dx, dz].every(Number.isFinite)) return null;
  const d = Math.hypot(dx - fx, dz - fz);
  if (d < 0.05) return null;
  const s = Math.min(d, Math.max(0, Number(speed) || 0) * Math.max(0, Number(secs) || 0)) / d;
  if (!(s > 0)) return null;
  return [[fx, fz], [fx + (dx - fx) * s, fz + (dz - fz) * s]];
}

// ---- M1 step 3a (docs/loop/m1-step3a/PLAN.md PLAN CHOICE 7; T118's clearance rule): the glide out toward a place.
/** The least distance (m) from a glide's path ([{x, z}, …]) to the edge of any obstacle ({x, z, r}); Infinity with none. */
export function glideClearance(path, obstacles = []) {
  let best = Infinity;
  const P = Array.isArray(path) ? path : [];
  for (const o of Array.isArray(obstacles) ? obstacles : []) {
    if (!o || !Number.isFinite(o.x) || !Number.isFinite(o.z)) continue;
    for (let i = 0; i + 1 < P.length; i++) {
      const a = P[i], b = P[i + 1], vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz;
      const t = l2 > 0 ? Math.max(0, Math.min(1, ((o.x - a.x) * vx + (o.z - a.z) * vz) / l2)) : 0;
      best = Math.min(best, Math.hypot(o.x - (a.x + vx * t), o.z - (a.z + vz * t)) - (Number(o.r) || 0));
    }
  }
  return best;
}
/**
 * The glide out of a Sail toward a place: `sailPlan` (data.sailPlan) from the dock toward the place's centre, its bearing turned by
 * the least angle (`step`° either side, up to `max`°) that keeps the whole glide `clear` m (the raft's radius + 0.3) off every
 * obstacle, so the raft never grazes a statue or a pillar on its way (a straight line toward the Lily Maze passes 0.5 m from the
 * statue off the Jetty). → the plan ({from, to, yaw, path}), or null when no bearing within `max`° is clear (open water's glide then).
 */
export function placeGlide(sailPlan, dock, centre, T, obstacles = [], { clear = 1.9, step = 5, max = 60 } = {}) {
  if (typeof sailPlan !== 'function' || !dock || !centre) return null;
  const dx = Number(centre.x) - Number(dock.x), dz = Number(centre.z) - Number(dock.z), d = Math.hypot(dx, dz);
  if (!(d > 0)) return null;
  const a0 = Math.atan2(dz, dx);
  for (let k = 0; k * step <= max; k++) {
    for (const s of k ? [1, -1] : [1]) {
      const a = a0 + s * k * step * Math.PI / 180;
      const g = sailPlan(dock, { x: dock.x + Math.cos(a) * d, z: dock.z + Math.sin(a) * d }, T, null);
      if (g && glideClearance(g.path, obstacles) >= clear) return g;
    }
  }
  return null;
}

// ---- M1 step 5a: the home barge's mooring (SPEC §6.5; data.loopMooring resolves one: {raft, hull, murk, lane, circles})
/** The least clearance (m) of a polyline [[x, z] | {x, z}] from a set of circles [{x, z, r}] (negative: it crosses one). */
export function pathClearance(pts, circles = [], step = 0.25) {
  const P = (Array.isArray(pts) ? pts : []).map((q) => (Array.isArray(q) ? { x: Number(q[0]), z: Number(q[1]) } : { x: Number(q?.x), z: Number(q?.z) }));
  let worst = Infinity;
  for (let i = 0; i + 1 < P.length; i++) {
    const a = P[i], b = P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / step));
    for (let k = 0; k <= n; k++) {
      const x = a.x + (b.x - a.x) * (k / n), z = a.z + (b.z - a.z) * (k / n);
      for (const c of circles) worst = Math.min(worst, Math.hypot(x - c.x, z - c.z) - c.r);
    }
  }
  return worst;
}
const polyLen = (P) => { let s = 0; for (let i = 0; i + 1 < P.length; i++) s += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); return s; };
/**
 * The glide in to the barge's stern (the sail home, the film's hand-off; M1 §4 step 5a): it ends at the tie-up (docks[dock]) and
 * never crosses a hull (clear of every circle by `pad` m, the raft's radius). Straight in when that way is clear; else through the
 * mooring's lane (the glide out, reversed); and when neither is clear or both are longer than `reach` (the sail home's 2 s at
 * twice the raft's speed), the last `reach` m of the canonical approach, the lane's line run out from the tie-up (`cut`: the raft
 * is put at its start first, the camera with it). `obstacles`: the circles to keep clear of (default the mooring's own).
 * → {path: [[x, z], …], len, cut, clear}, or null without a mooring or a start.
 */
export function glideInPath(from, M, { reach = Infinity, pad = 1.6, obstacles = null } = {}) {
  const fx = Number(from?.x), fz = Number(from?.z);
  if (!M?.raft || !Number.isFinite(fx) || !Number.isFinite(fz)) return null;
  const tie = [M.raft.x, M.raft.z], lane = (M.lane || []).map((q) => [q.x, q.z]);
  // (the lake's own obstacles when the caller has them: world.getObstacles() holds the islands, pillars, posts and the hulls)
  const circles = Array.isArray(obstacles) ? obstacles : Array.isArray(M.circles) ? M.circles : [];
  const res = (path, cut) => ({ path, len: polyLen(path), cut, clear: pathClearance(path, circles) });
  if (Math.hypot(fx - tie[0], fz - tie[1]) < 0.05) return res([tie, tie], false);
  for (const route of [[[fx, fz], tie], [[fx, fz], ...lane, tie]]) {
    if (route.length === 3 && !lane.length) continue;
    if (polyLen(route) <= reach + 1e-9 && pathClearance(route, circles) >= pad) return res(route, false);
  }
  // the canonical approach: along the lane's line from the tie-up, `reach` m long (or the lane's own length when reach is open)
  const e = lane.length ? lane[0] : [tie[0] - Math.sin(M.raft.yaw || 0) * 15, tie[1] - Math.cos(M.raft.yaw || 0) * 15];
  const d = Math.hypot(e[0] - tie[0], e[1] - tie[1]) || 1, ux = (e[0] - tie[0]) / d, uz = (e[1] - tie[1]) / d;
  const L = Number.isFinite(reach) ? reach : Math.max(d, Math.hypot(fx - tie[0], fz - tie[1]));
  const start = [tie[0] + ux * L, tie[1] + uz * L];
  const path = L > d + 1e-6 ? [start, e, tie] : [start, tie];
  return res(path, true);
}

/** The distance (m) from a point to a place's footprint ({kind: 'disc', x, z, r} | {kind: 'path', pts, w} | {kind: 'rect', x, z, w,
 *  d}): 0 inside it. */
export function footprintDistance(px, pz, a) {
  if (!a || typeof a !== 'object') return Infinity;
  if (a.kind === 'disc') return Math.max(0, Math.hypot(px - a.x, pz - a.z) - (Number(a.r) || 0));
  if (a.kind === 'rect') { const dx = Math.max(0, Math.abs(px - a.x) - (Number(a.w) || 0) / 2), dz = Math.max(0, Math.abs(pz - a.z) - (Number(a.d) || 0) / 2); return Math.hypot(dx, dz); }
  if (a.kind === 'path' && Array.isArray(a.pts)) {
    let best = Infinity;
    for (let i = 0; i + 1 < a.pts.length; i++) {
      const [ax, az] = a.pts[i], [bx, bz] = a.pts[i + 1], vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1;
      const k = Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / l2));
      best = Math.min(best, Math.hypot(px - ax - vx * k, pz - az - vz * k));
    }
    return Math.max(0, best - (Number(a.w) || 0) / 2);
  }
  return Infinity;
}

/**
 * The mooring's checks (M1 §4 step 5a; validate-data --loop and the node tests): both hulls and the raft clear of every island,
 * pillar, post and gate stone (`obstacles`, the lake's own: not the hulls), every place's footprint and its mist bank (footprint +
 * `bank` m) and the shore (shoreR(angle)); clear of the spawn; the glide in (from the spawn, the film's hand-off, and the sail
 * home's canonical approach) and the glide out (`out`: its points) clear of the hulls by the raft's radius and of the lake by it
 * + 0.3 m. M: data.loopMooring(...). → [fault strings] (empty: all clear)
 */
export function mooringChecks(M, { obstacles = [], shoreR = null, spawn = null, out = null, places = [], bank = 1.5, raftR = 1.6, reach = 24,
  clearObs = 0.5, clearPlace = 1.0, clearShore = 2.0, clearSpawn = 1.0 } = {}) {
  const F = [];
  if (!M?.raft || !Array.isArray(M.circles) || !M.circles.length) return ['no mooring'];
  const bodies = [...M.circles, { x: M.raft.x, z: M.raft.z, r: raftR, kind: 'raft' }];
  for (const c of bodies) {
    for (const o of obstacles) { const d = Math.hypot(c.x - o.x, c.z - o.z) - o.r - c.r; if (d < clearObs) F.push(`${c.kind} at (${c.x.toFixed(1)}, ${c.z.toFixed(1)}) within ${d.toFixed(2)} m of the ${o.kind || 'obstacle'} at (${o.x.toFixed(1)}, ${o.z.toFixed(1)})`); }
    if (typeof shoreR === 'function') { const d = shoreR(Math.atan2(c.z, c.x)) - Math.hypot(c.x, c.z) - c.r; if (d < clearShore) F.push(`${c.kind} at (${c.x.toFixed(1)}, ${c.z.toFixed(1)}) within ${d.toFixed(2)} m of the shore`); }
    for (const p of places) { const d = footprintDistance(c.x, c.z, p.area) - c.r - bank; if (d < clearPlace) F.push(`${c.kind} within ${d.toFixed(2)} m of ${p.id}'s mist bank`); }
    if (spawn && c.kind !== 'raft') { const d = Math.hypot(c.x - spawn.x, c.z - spawn.z) - c.r - raftR; if (d < clearSpawn) F.push(`${c.kind} within ${d.toFixed(2)} m of the spawn`); }
  }
  const hulls = M.circles, lake = obstacles;
  const glide = (name, pts) => {
    if (!Array.isArray(pts) || pts.length < 2) { F.push(`${name}: no path`); return; }
    const h = pathClearance(pts, hulls), l = pathClearance(pts, lake);
    if (h < raftR - 1e-6) F.push(`${name} passes ${h.toFixed(2)} m from a hull (needs ${raftR})`);
    if (l < raftR + 0.3 - 1e-6) F.push(`${name} passes ${l.toFixed(2)} m from the lake's islands and pillars (needs ${(raftR + 0.3).toFixed(1)})`);
  };
  if (spawn) { const g = glideInPath(spawn, M, { pad: raftR, obstacles: [...hulls, ...lake] }); if (!g || g.cut) F.push('the glide in from the spawn (the hand-off) has no clear way'); else glide('the glide in from the spawn', g.path); }
  const far = glideInPath({ x: M.raft.x + 500, z: M.raft.z + 500 }, M, { reach, pad: raftR, obstacles: [] });
  glide('the sail home\'s approach', far?.path);
  if (out) glide('the glide out', out.map((q) => (Array.isArray(q) ? q : [q.x, q.z])));
  for (const p of places) {
    const c = p.area?.kind === 'disc' || p.area?.kind === 'rect' ? { x: p.area.x, z: p.area.z } : p.area?.pts ? { x: p.area.pts[0][0], z: p.area.pts[0][1] } : null;
    if (!c) continue;
    const g = glideInPath(c, M, { reach, pad: raftR, obstacles: [...hulls, ...lake] });
    if (g) glide(`the sail home from ${p.id}`, g.path);
  }
  return F;
}
