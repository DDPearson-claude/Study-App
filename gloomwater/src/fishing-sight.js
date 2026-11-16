// fishing-sight.js — WC-2: silhouettes (WATERCRAFT §6; the Mossmere under the loop). Pure rules, no three.js and no ctx, so node
// tests drive them: where a fish can be seen (clear, calm, shallow water by day and dusk; at night only in the lantern's light or
// over a drowned lamp at the Buoy Lights), which fish (the "who is there" pool, deep-bodied and long shapes ×1.5, never a giant, the
// legend, the sturgeon, the trout or the eel), how big (its true length, data.sizeLength), how far off the raft (by length), how it
// moves (five outlines), when it bolts (a cast on it, the raft too near, a splash by a still fish) and when a cast leads it (ahead
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
  alive: { high: 4, medium: 4, low: 3 },
  every: [12, 30],                   // a new one every 12–30 s while fewer are alive
  life: [40, 90],
  bands: [[0.25, [6, 12]], [0.6, [8, 20]], [Infinity, [10, 28]]],   // spawn distance off the raft by length (m)
  raft: [3, 5],                      // its own distance off the raft, by fish (small nearer), jittered
  dusk: 0.75,                        // fainter at dusk
  lantern: { r: 8, stub: 1.5, perLevel: 0.15, min: 0.25 },
  lamp: { r: 1.9 },                  // a drowned lamp's glow at the Buoy Lights (m)
  spook: { r: 0.6, splash: 2, quietR: 10, quietT: 30, waitMult: 1.5, bolt: 1.2 },
  lead: { near: [1, 1.6], far: [3, 2.5], side: 1.2, still: [0.8, 2] },
  take: { base: 0.45, waitMult: 0.3, delay: [0.5, 1.5] },
};
/** The five outlines (§6.2) and their ids in fishing-fx's SDF branch. */
export const OUTLINE_ID = { deep: 1, torpedo: 2, long: 3, shoal: 4, claw: 5 };
/** Body width / length by outline (the drawn proportion). */
export const OUTLINE_ASPECT = { deep: 0.3, torpedo: 0.19, long: 0.12, shoal: 0.18, claw: 0.34 };
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

/** Spawn distance off the raft by length (§6.3): under 25 cm 6–12 m; 25–60 cm 8–20 m; over 60 cm 10–28 m. */
export function spawnBand(L, S = SIGHT) {
  for (const [lim, band] of S.bands) if (L < lim) return band;
  return S.bands[S.bands.length - 1][1];
}
/** Its own distance off the raft (3–5 m): a small fish nearer, a big one farther, a little jitter (seed 0..1). */
export function keepOffFor(L, seed = 0.5, S = SIGHT) {
  const [a, b] = S.raft;
  const k = clamp((num(L, 0.3) - 0.12) / 0.6, 0, 1);
  return clamp(a + (b - a) * k + (seed - 0.5) * 0.6, a, b);
}
/** The distance band a new shape of length L may spawn in: the length band by day and dusk; at night inside the lantern's light. */
export function spawnRange(L, { light = 'day', lanternR = 8, keepOff = 4 } = {}, S = SIGHT) {
  if (light === 'night') return [keepOff + 0.4, Math.max(keepOff + 0.5, lanternReach(lanternR, num(S.lantern.min, 0.25)))];
  const [a, b] = spawnBand(L, S);
  return [Math.max(a, keepOff + 0.4), b];
}
/** Try up to `tries` points round the raft in a range; accept(x, z) → true takes it. {x, z, d} or null. */
export function spawnPoint(raft, range, accept, rng = Math.random, tries = 6) {
  for (let i = 0; i < tries; i++) {
    const d = U(rng, range[0], range[1]), a = rng() * TAU;
    const x = raft.x + Math.cos(a) * d, z = raft.z + Math.sin(a) * d;
    if (accept(x, z)) return { x, z, d };
  }
  return null;
}
/** How many may live (§6.3): 4 on high and medium, 3 on low. */
export const sightCap = (tier = 'high', S = SIGHT) => num(S.alive[tier], tier === 'low' ? 3 : 4);

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
    id: o.id ?? `sight${++SEQ}`, kind: 'sight', sp: o.sp || null, z: num(o.zScore, 0), length: L, outline,
    x: o.x, z: o.z, home: { x: o.x, z: o.z }, heading: num(o.heading, rng() * TAU), speed: 0, turn: 0,
    area: o.area || null, light: o.light || 'day', depth: num(o.depth, 0.3), seed,
    keepOff: keepOffFor(L, seed), n: outline === 'shoal' ? 3 + Math.floor(rng() * 3) : 1,
    mode: 'cruise', modeT: 0, age: 0, life: U(rng, SIGHT.life[0], SIGHT.life[1]), alpha: 0, vis: 1,
    bait: null, tailT: 0, cloudAt: -1, gone: false, born: num(o.t, 0),
  };
}
/** The pace and timings of each outline (§6.4). */
const PACE = {
  deep:    { speed: [0.25, 0.45], cruise: [6, 14], stop: [4, 10] },
  torpedo: { speed: [0.4, 0.8], cruise: [3, 8], stop: [2, 5] },
  long:    { speed: [1.5, 1.5], cruise: [1, 2], stop: [2.2, 4.4] },     // holds 70% of the time, darts 1.5 m/s for 1–2 s
  shoal:   { speed: [0.5, 0.5], cruise: [4, 8], stop: [0, 0] },
  claw:    { speed: [0.1, 0.1], cruise: [2, 5], stop: [2, 6] },
};
function setMode(f, mode, rng) {
  const P = PACE[f.outline] || PACE.torpedo;
  f.mode = mode;
  if (mode === 'cruise') { f.modeT = U(rng, P.cruise[0], P.cruise[1]); f.speed = U(rng, P.speed[0], P.speed[1]); if (f.outline === 'shoal') f.turn = (rng() < 0.5 ? -1 : 1) * U(rng, 0.3, 0.7); else f.turn = (rng() - 0.5) * 0.3; }
  else if (mode === 'hold' || mode === 'root') { f.modeT = U(rng, P.stop[0], P.stop[1]); f.speed = 0; }
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
  f.age += dt;
  if (f.mode !== 'bolt' && f.mode !== 'sink' && f.mode !== 'take' && f.mode !== 'nose') {
    if (f.age >= f.life || env.quiet) { f.mode = 'sink'; f.modeT = 2.5; f.speed = Math.min(f.speed, 0.2); }
  }
  // fade: in over 2 s; out as it bolts (1.2 s) or sinks (2.5 s)
  if (f.mode === 'bolt') f.alpha = Math.max(0, f.alpha - dt / SIGHT.spook.bolt);
  else if (f.mode === 'sink') f.alpha = Math.max(0, f.alpha - dt / 2.5);
  else f.alpha = Math.min(1, f.alpha + dt / 2);
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
      f.heading = wrap(f.heading + f.turn * dt);
      if (f.outline !== 'shoal' && rng() < dt * 0.2) f.turn = (rng() - 0.5) * 0.5;
      if (f.modeT <= 0) {
        if (f.outline === 'shoal') setMode(f, 'cruise', rng);
        else if (f.outline === 'deep') setMode(f, 'root', rng);
        else if (f.outline === 'torpedo') { if (rng() < 0.35) setMode(f, 'hold', rng); else { f.heading = wrap(f.heading + (rng() < 0.5 ? -1 : 1) * U(rng, 0.8, 1.6)); setMode(f, 'cruise', rng); } }
        else setMode(f, 'hold', rng);
      }
      break;
    }
    case 'hold': case 'root': {
      f.speed = 0;
      if (f.mode === 'root' && num(env.depth?.(f.x, f.z), 1) < 0.3) {   // tailing: the tail breaks the film, head down; a cloud where it digs
        f.tailT -= dt;
        if (f.tailT <= 0) { f.tailT = U(rng, 1.8, 3.2); ev.push({ type: 'tail', x: f.x - Math.sin(f.heading) * f.length * 0.45, z: f.z - Math.cos(f.heading) * f.length * 0.45, heading: f.heading }); }
      }
      if (f.modeT <= 0) {
        if (f.mode === 'root') f.heading = wrap(f.heading + Math.PI + (rng() - 0.5) * 0.8);   // turns back along the same route
        if (f.outline === 'long') f.heading = wrap(f.heading + (rng() - 0.5) * 1.6);
        setMode(f, 'cruise', rng);
      }
      break;
    }
    case 'bolt': f.speed = 3; if (f.modeT <= 0) f.gone = true; break;
    case 'sink': if (f.modeT <= 0 || f.alpha <= 0) f.gone = true; break;
    case 'take': case 'nose': {
      const b = f.bait;
      if (!b) { setMode(f, 'cruise', rng); break; }
      if (f.wait > 0) { f.wait -= dt; f.speed = 0; break; }   // the bob settles (0.5–1.5 s), then it turns to the bait
      const want = Math.atan2(b.x - f.x, b.z - f.z);
      f.heading = wrap(f.heading + clamp(wrap(want - f.heading), -2.5 * dt, 2.5 * dt));
      const d = Math.hypot(b.x - f.x, b.z - f.z) - f.length * 0.5;
      f.speed = d > 0.15 ? Math.min(0.7, 0.25 + d * 0.4) : 0;
      if (d <= 0.15 && !f.reached) {
        f.reached = true;
        if (f.mode === 'take') ev.push({ type: 'reach' });
        else { f.mode = 'turn'; f.modeT = 1.2; }
      }
      break;
    }
    case 'turn': {   // it noses the bait and turns slowly away (no spook)
      f.heading = wrap(f.heading + 1.6 * dt);
      f.speed = 0.22;
      if (f.modeT <= 0) { f.bait = null; f.reached = false; setMode(f, 'cruise', rng); }
      break;
    }
    default: setMode(f, 'cruise', rng);
  }
  if (f.speed > 0) {
    const nx = f.x + Math.sin(f.heading) * f.speed * dt, nz = f.z + Math.cos(f.heading) * f.speed * dt;
    const free = f.mode === 'bolt' || f.mode === 'take' || f.mode === 'nose' || f.mode === 'turn';
    const homeOk = Math.hypot(nx - f.home.x, nz - f.home.z) < 12;
    const raftOk = !raft || Math.hypot(nx - raft.x, nz - raft.z) >= f.keepOff + 0.3;
    if (free || (homeOk && raftOk && (!env.ok || env.ok(nx, nz)))) { f.x = nx; f.z = nz; }
    else {   // the edge of its water (or the raft's distance): it turns back
      f.heading = wrap(f.heading + Math.PI * (0.55 + 0.3 * rng()) * (rng() < 0.5 ? -1 : 1));
      if (f.outline === 'long') setMode(f, 'hold', rng);
    }
  }
  if (f.gone) ev.push({ type: 'gone' });
  return ev;
}
function bolt(f, away) {
  f.mode = 'bolt'; f.modeT = SIGHT.spook.bolt; f.speed = 3; f.bait = null;
  if (Number.isFinite(away)) f.heading = away;
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
  const k = 0.12 + 1.4 * clamp(num(f.depth, 0.3), 0, 0.5);
  let dx = sunDir.x, dz = sunDir.z;
  if (light === 'dusk') { dx = 0.35; dz = -0.5; }
  if (light === 'night' && raft) { const d = Math.hypot(f.x - raft.x, f.z - raft.z) || 1; dx = (f.x - raft.x) / d; dz = (f.z - raft.z) / d; }
  const n = Math.hypot(dx, dz) || 1;
  return { x: dx / n * k, z: dz / n * k };
}
