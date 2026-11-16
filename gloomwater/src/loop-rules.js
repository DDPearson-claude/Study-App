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
