// fishing-signs.js — the six signs on the water (DESIGN §25.6.1, §25.14.2 F6; CONTRACT §13.5 sign:*, §13.7 fishing signs).
// Pure rules, no three.js and no ctx, so tools/tests can drive them in node: which sign kinds a phase offers, how many signs
// live, how each sign moves and when it shows (a rise's rings, a boil, a strike's slap, a bubble trail's head, a glow trail),
// and what a cast does when it lands near one (each kind's cast rule → its effect on the bite).
// fishing.js owns the list (spawns them through world.randomWaterPoint, pre-rolls their fish, emits sign:*), fishing-fx.js
// draws them (the per-fish instance buffer) and water only gets the tagged ripples and wakes fishing-fx asks for.
//
//   kind      shows                              cast rule                                effect (BALANCE.signs.kinds)
//   rise      rings every 4–9 s, r ∝ length      within 2.5 m of a ring, ≤ 3 s after it   wait × 0.5; its pre-rolled fish bites
//   boil      a dark back turns the surface      within 3 m in the 8 s after a boil       its pre-rolled Prize+ bites 60%
//   nervous   fry skitter out of a patch         at the patch edge (the centre spooks it) predators × 3, favour +0.3
//   strike    one heavy slap                     within 4 m in the next 10 s              favour +0.6, predators × 3
//   bubbles   bubbles creep along the bottom     at the head of the trail (2 m)           bottom feeders × 2, favour +0.2
//   glow      a light moving under the surface   lead it by 1–3 m (≤ 1.4 m to the side)   its pre-rolled night fish bites 70%

export const SIGN_KINDS = ['rise', 'boil', 'nervous', 'strike', 'bubbles', 'glow'];
export const KIND_ID = { rise: 1, boil: 2, nervous: 3, strike: 4, bubbles: 5, glow: 6 };
/** Kinds whose sign carries one pre-rolled fish (species + size score) that the cast rule can hand to the bite. */
export const PREROLLED = new Set(['rise', 'boil', 'glow']);

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const U = (rng, a, b) => a + (b - a) * rng();

/** The rules of one kind: BALANCE.signs.kinds[kind] over these defaults (the extras are presentation and pacing). */
const DEFAULTS = {
  rise:    { every: [4, 9], castR: 2.5, within: 3, waitMult: 0.5, drift: 0.22, bite: 1 },
  boil:    { every: [8, 13], castR: 3, within: 8, bite: 0.6, minClass: 'prize', drift: 0.12 },
  nervous: { radius: 2.3, edgeIn: 0.55, edgeOut: 1.6, predators: 3, favour: 0.3, chumTime: 30, chumRadius: 2.6 },
  strike:  { castR: 4, within: 10, favour: 0.6, predators: 3, ttl: 14 },
  bubbles: { headR: 2.0, bottom: 2, favour: 0.2, speed: 0.32, every: [1.4, 2.4], trail: 3.2 },
  glow:    { lead: [1, 3], lateral: 1.4, bite: 0.7, speed: 0.7, range: 24 },
};
export function kindRules(kind, B = {}) {
  const d = DEFAULTS[kind] || {};
  const k = B?.kinds?.[kind] || {};
  const out = { ...d };
  for (const [key, v] of Object.entries(k)) if (typeof v === 'number' || Array.isArray(v)) out[key] = v;
  if (kind === 'nervous' && typeof k.castR === 'number') out.radius = k.castR;   // castR 'edge' keeps the patch radius
  if (kind === 'bubbles' && typeof k.castR === 'number') out.headR = k.castR;    // castR 'head' keeps the head radius
  return out;
}

// ------------------------------------------------------------------ how many, which kinds (spawn)
/** Signs alive at once for a phase (calm 2–4 as BALANCE.spots / signs.calmAlive; night fewer, glow-led). */
export function aliveRange(phase, B = {}, spots = {}) {
  if (phase === 'gloomtide') return Array.isArray(B.nightAlive) ? B.nightAlive : [2, 3];
  return Array.isArray(B.calmAlive) ? B.calmAlive : Array.isArray(spots.calmCount) ? spots.calmCount : [2, 4];
}
export const maxAlive = (B = {}) => num(B.maxAlive, 6);
/** Kind weights by phase: day reads rises, nervous water, bubbles, now and then a boil or a strike; night is glow trails. */
export const KIND_WEIGHTS = {
  calm:      { rise: 3, nervous: 1.8, bubbles: 1.6, boil: 1.3, strike: 1.0 },
  dusk:      { rise: 3.2, boil: 1.6, nervous: 1.4, strike: 1.2, bubbles: 1.2 },
  dawn:      { rise: 3.2, boil: 1.4, nervous: 1.6, strike: 1.0, bubbles: 1.2 },
  gloomtide: { glow: 4, rise: 1.4, boil: 1.1, bubbles: 0.8, nervous: 0.6 },
};
const KIND_CAP = { boil: 2, strike: 1, glow: 3, rise: 3, nervous: 2, bubbles: 2 };
/** Pick the next kind for a phase, given the kinds alive (caps: one strike, two boils …). null when nothing fits. */
export function pickKind(phase, rng, alive = [], weights = KIND_WEIGHTS) {
  const W = weights[phase] || weights.calm;
  const n = {};
  for (const k of alive) n[k] = (n[k] || 0) + 1;
  let total = 0;
  const opts = [];
  for (const [k, w] of Object.entries(W)) {
    if (k === 'glow' && phase !== 'gloomtide') continue;   // night only
    if ((n[k] || 0) >= (KIND_CAP[k] ?? 2)) continue;
    // a little variety: each sign of a kind already alive halves its weight
    const ww = w / (1 + (n[k] || 0));
    opts.push([k, ww]); total += ww;
  }
  if (!opts.length || total <= 0) return null;
  let r = rng() * total;
  for (const [k, w] of opts) { r -= w; if (r <= 0) return k; }
  return opts[opts.length - 1][0];
}
/** Lifetime of a new sign (BALANCE.spots ttl 45–75 s; a strike lives for its 10 s window and a short fade; chum 30 s). */
export function signTtl(kind, rng, spots = {}, B = {}, { chum = false } = {}) {
  const R = kindRules(kind, B);
  if (chum) return num(R.chumTime, 30);
  if (kind === 'strike') return num(R.ttl, num(R.within, 10) + 4);
  const t = Array.isArray(spots.ttl) ? spots.ttl : [45, 75];
  return U(rng, num(t[0], 45), num(t[1], 75));
}

// ------------------------------------------------------------------ a sign
let SEQ = 0;
/**
 * A new sign at (x, z) on the fishing clock t. opts: {heading, ttl, preroll: {speciesId, z, sizeClass, ancient, lengthM, tint},
 * chum, rng, B (BALANCE.signs)}. Its first show comes soon so a sign reads the moment it appears (a strike slaps at once).
 */
export function createSign(kind, x, z, t, opts = {}) {
  const rng = opts.rng || Math.random;
  const R = kindRules(kind, opts.B);
  const heading = num(opts.heading, rng() * Math.PI * 2);
  const ttl = num(opts.ttl, 60);
  const s = {
    id: opts.id ?? ++SEQ, kind, x, z, position: { x, y: 0, z }, heading, turn: (rng() - 0.5) * 0.25,
    born: t, age: 0, ttl, maxTtl: ttl, strength: 0, chum: !!opts.chum, radius: 2.6, rare: false, depleted: false,
    preroll: opts.preroll || null, seed: rng(),
    lastAt: -1e9, lastX: x, lastZ: z, nextAt: t + 0.6, shows: 0,
    head: { x, z },   // bubbles: the head of the trail
  };
  switch (kind) {
    case 'rise': s.radius = num(R.castR, 2.5); s.nextAt = t + U(rng, 0.4, 1.4); break;
    case 'boil': s.radius = num(R.castR, 3); s.nextAt = t + U(rng, 0.3, 1.0); s.rare = true; break;
    case 'nervous': s.radius = s.chum ? num(R.chumRadius, 2.6) : num(R.radius, 2.3); s.nextAt = t; break;
    case 'strike': s.radius = num(R.castR, 4); s.nextAt = t + 0.05; s.rare = true; break;
    case 'bubbles': s.radius = num(R.headR, 2); s.nextAt = t + 0.2; break;
    case 'glow': s.radius = num(R.lateral, 1.4) + num(R.lead?.[1], 3); s.rare = true; break;
    default: break;
  }
  return s;
}

/** Where a sign's fish is now (rise and boil drift a little; a glow trail and a bubble trail's head travel). */
function travel(s, dt, R, rng) {
  if (s.kind === 'glow' || s.kind === 'bubbles' || s.kind === 'rise' || s.kind === 'boil') {
    const v = s.kind === 'glow' ? num(R.speed, 0.7) : s.kind === 'bubbles' ? num(R.speed, 0.32) : num(R.drift, 0.15);
    // a lazy curve: the heading turns slowly and swings back toward the anchor so trails wander, never leave
    s.heading += s.turn * dt;
    const dx = s.position.x - s.x, dz = s.position.z - s.z, far = Math.hypot(dx, dz);
    const leash = s.kind === 'glow' ? 7 : s.kind === 'bubbles' ? 4 : 1.6;
    if (far > leash) {
      const back = Math.atan2(-dx, -dz);
      let d = back - s.heading; d = Math.atan2(Math.sin(d), Math.cos(d));
      s.heading += clamp(d, -1, 1) * dt * 0.8;
    }
    if (rng() < dt * 0.15) s.turn = (rng() - 0.5) * 0.5;
    s.position.x += Math.sin(s.heading) * v * dt;
    s.position.z += Math.cos(s.heading) * v * dt;
    if (s.kind === 'bubbles') { s.head.x = s.position.x; s.head.z = s.position.z; }
  }
}

/**
 * Step a sign by dt on the fishing clock (t is the clock after the step). Returns the shows that happened this step:
 * [{type: 'rise'|'boil'|'strike'|'bubble'|'fry'|'glow', x, z, heading}] (fishing turns them into sign:rise, water ripples and fx).
 */
export function stepSign(s, dt, t, rng = Math.random, B = {}) {
  const R = kindRules(s.kind, B);
  s.age += dt;
  if (s.ttl !== Infinity) s.ttl -= dt;
  const fadeIn = clamp(s.age / 1.2, 0, 1), fadeOut = s.ttl === Infinity ? 1 : clamp(s.ttl / 4, 0, 1);
  s.strength = fadeIn * fadeOut;
  travel(s, dt, R, rng);
  const shows = [];
  if (s.ttl <= 0.6) return shows;   // fading out: no new shows
  if (t < s.nextAt) return shows;
  const px = s.position.x, pz = s.position.z;
  switch (s.kind) {
    case 'rise': {
      s.lastAt = t; s.lastX = px; s.lastZ = pz; s.shows++;
      const e = Array.isArray(R.every) ? R.every : [4, 9];
      s.nextAt = t + U(rng, num(e[0], 4), num(e[1], 9));
      shows.push({ type: 'rise', x: px, z: pz, heading: s.heading });
      break;
    }
    case 'boil': {
      s.lastAt = t; s.lastX = px; s.lastZ = pz; s.shows++;
      const e = Array.isArray(R.every) ? R.every : [8, 13];
      s.nextAt = t + U(rng, num(e[0], 8), num(e[1], 13));
      shows.push({ type: 'boil', x: px, z: pz, heading: s.heading });
      break;
    }
    case 'strike': {
      if (s.shows === 0) { s.lastAt = t; s.lastX = px; s.lastZ = pz; s.shows = 1; shows.push({ type: 'strike', x: px, z: pz, heading: s.heading }); }
      s.nextAt = Infinity;
      break;
    }
    case 'nervous': {
      s.lastAt = t; s.shows++;
      s.nextAt = t + U(rng, 1.6, 2.4);   // a fresh skitter for the water's ripple pool
      shows.push({ type: 'fry', x: px, z: pz });
      break;
    }
    case 'bubbles': {
      s.lastAt = t; s.lastX = px; s.lastZ = pz; s.shows++;
      const e = Array.isArray(R.every) ? R.every : [1.4, 2.4];
      s.nextAt = t + U(rng, num(e[0], 1.4), num(e[1], 2.4));
      shows.push({ type: 'bubble', x: px, z: pz, heading: s.heading });
      break;
    }
    case 'glow': {
      s.lastAt = t; s.lastX = px; s.lastZ = pz; s.shows++;
      s.nextAt = t + 0.42;   // a light wake behind the fish (water's tagged wake), every 0.4 s
      shows.push({ type: 'glow', x: px, z: pz, heading: s.heading });
      break;
    }
    default: s.nextAt = Infinity;
  }
  return shows;
}

// ------------------------------------------------------------------ the cast rules
/**
 * What a cast landing at (x, z) on the fishing clock t gets from sign s (DESIGN §25.6.1), or null when it is outside the rule.
 * Returns {kind, id, inSign, waitMult?, preroll?: {chance}, predators?, bottom?, favour?, spook?}.
 *   inSign — the cast is inside a live sign (the quality bonus and the signCatch bounty); a spook is not.
 *   opts.leadMult widens nothing (Night Eyes extends how far a glow trail shows, not the lead window).
 */
export function castRule(s, x, z, t, B = {}) {
  if (!s || s.ttl <= 0.25) return null;   // a sign fading out is gone; one just appearing already counts
  const R = kindRules(s.kind, B);
  const base = { kind: s.kind, id: s.id, inSign: true };
  switch (s.kind) {
    case 'rise': {
      const d = Math.hypot(x - s.lastX, z - s.lastZ);
      if (t - s.lastAt < 0 || t - s.lastAt > num(R.within, 3) || d > num(R.castR, 2.5)) return null;
      return { ...base, waitMult: num(R.waitMult, 0.5), preroll: { chance: num(R.bite, 1) } };
    }
    case 'boil': {
      const d = Math.hypot(x - s.lastX, z - s.lastZ);
      if (t - s.lastAt < 0 || t - s.lastAt > num(R.within, 8) || d > num(R.castR, 3)) return null;
      return { ...base, preroll: { chance: num(R.bite, 0.6) } };
    }
    case 'nervous': {
      const r = s.radius, d = Math.hypot(x - s.position.x, z - s.position.z);
      if (d > r + num(R.edgeOut, 1.6)) return null;
      if (!s.chum && d < r * num(R.edgeIn, 0.55)) return { ...base, inSign: false, spook: true };   // into the bait ball: the fry scatter
      return { ...base, predators: num(R.predators, 3), favour: num(R.favour, 0.3) };
    }
    case 'strike': {
      const d = Math.hypot(x - s.lastX, z - s.lastZ);
      if (t - s.lastAt < 0 || t - s.lastAt > num(R.within, 10) || d > num(R.castR, 4)) return null;
      return { ...base, predators: num(R.predators, 3), favour: num(R.favour, 0.6) };
    }
    case 'bubbles': {
      const d = Math.hypot(x - s.head.x, z - s.head.z);
      if (d > num(R.headR, 2)) return null;
      return { ...base, bottom: num(R.bottom, 2), favour: num(R.favour, 0.2) };
    }
    case 'glow': {
      const fx = Math.sin(s.heading), fz = Math.cos(s.heading);
      const dx = x - s.position.x, dz = z - s.position.z;
      const along = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx);
      const L = Array.isArray(R.lead) ? R.lead : [1, 3];
      if (along < num(L[0], 1) || along > num(L[1], 3) || side > num(R.lateral, 1.4)) return null;
      return { ...base, preroll: { chance: num(R.bite, 0.7) } };
    }
    default: return null;
  }
}
/** The best rule among the live signs for a cast (a pre-rolled fish first, then the biggest favour); null when none applies. */
export function bestRule(signs, x, z, t, B = {}) {
  let best = null, bs = -1;
  for (const s of signs || []) {
    const r = castRule(s, x, z, t, B);
    if (!r) continue;
    const score = (r.spook ? 0 : 1) + (r.preroll ? 10 + r.preroll.chance : 0) + (r.favour || 0) + (r.waitMult ? 0.5 : 0);
    if (score > bs) { bs = score; best = { rule: r, sign: s }; }
  }
  return best;
}

/** The ring radius of a rise (m) for a fish of length L (m): ∝ length, readable from the sail framing. */
export const riseRadius = (L) => clamp(0.7 + 2.0 * num(L, 0.3), 0.8, 5);
/** A boil's slick (m): the back of a Prize+ fish turning the surface (ellipse ≈ 1.4 L × 0.8 L, never smaller than a hand span). */
export const boilSize = (L) => ({ a: clamp(0.5 + 1.1 * num(L, 0.8), 0.7, 9), b: clamp(0.3 + 0.6 * num(L, 0.8), 0.45, 5) });
/** A glow trail's brightness (0.35–1.2) ∝ the fish's length. */
export const glowBrightness = (L) => clamp(0.3 + 0.55 * num(L, 0.5), 0.35, 1.2);
