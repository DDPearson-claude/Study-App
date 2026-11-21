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
export const KIND_ID = { rise: 1, boil: 2, nervous: 3, strike: 4, bubbles: 5, glow: 6,
  pinprick: 7, gas: 8, cloud: 9, stems: 10 };   // WC-2 (WATERCRAFT §5.2): the Mossmere's new tells; 11 a silhouette, 12 a bow wave (fishing-fx)
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
  // WC-2 (WATERCRAFT §5.3): the Mossmere's new tells, under the loop only
  pinprick: { castR: 1.5, every: [0.7, 1.5], favour: 0.2 },
  gas:      { every: [3, 9] },
  cloud:    { castR: 2, within: 15, every: [7, 12], favour: 0.2, drift: 0.08, grow: 0.22, maxR: 1.7 },
  stems:    { castR: 2.5, within: 8, every: [3, 6], radius: 1.3 },
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
const KIND_CAP = { boil: 2, strike: 1, glow: 3, rise: 3, nervous: 2, bubbles: 2, pinprick: 2, gas: 1, cloud: 2, stems: 2 };   // (WC-2: §5.3's caps)
export const kindCap = (k) => KIND_CAP[k] ?? 2;
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
    // WC-2 (WATERCRAFT §5.2–§5.3): the Mossmere's tells
    case 'pinprick': s.radius = num(R.castR, 1.5); s.nextAt = t + U(rng, 0.2, 0.6); break;
    case 'gas': s.radius = 0.6; s.nextAt = t + U(rng, 0.5, 2.5); break;
    case 'cloud': s.radius = num(R.maxR, 1.7); s.nextAt = t + U(rng, 0.2, 0.8); break;
    case 'stems': s.radius = num(R.radius, 1.3); s.nextAt = t + U(rng, 0.3, 1.2); break;
    default: break;
  }
  if (opts.form) s.form = opts.form;                       // WC-2: the tell's form (sip, splash, roll; ruffle, spray)
  if (Array.isArray(opts.makers)) s.makers = opts.makers;   // WC-2: the species ids that make this tell here (rule.makers)
  if (opts.moss) s.moss = true;                             // WC-2: the Mossmere under the loop (the CONTRACT rule object)
  if (s.form === 'splash') s.radius = 3;
  return s;
}

/** Where a sign's fish is now (rise and boil drift a little; a glow trail and a bubble trail's head travel). */
function travel(s, dt, R, rng) {
  const drifts = s.kind === 'cloud' || (s.kind === 'nervous' && s.form === 'ruffle');   // WC-2: a mud plume and a ruffle drift
  if (s.kind === 'glow' || s.kind === 'bubbles' || s.kind === 'rise' || s.kind === 'boil' || drifts) {
    const v = s.kind === 'glow' ? num(R.speed, 0.7) : s.kind === 'bubbles' ? num(R.speed, 0.32) : drifts ? num(R.drift, 0.1) : num(R.drift, 0.15);
    // a lazy curve: the heading turns slowly and swings back toward the anchor so trails wander, never leave
    s.heading += s.turn * dt;
    const dx = s.position.x - s.x, dz = s.position.z - s.z, far = Math.hypot(dx, dz);
    const leash = s.kind === 'glow' ? 7 : s.kind === 'bubbles' ? 4 : drifts ? 2.5 : 1.6;
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
      const e = s.form === 'splash' ? [6, 11] : s.form === 'roll' ? [8, 14] : Array.isArray(R.every) ? R.every : [4, 9];   // (WC-2 forms)
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
    // WC-2 (WATERCRAFT §5.2): pin-pricks fizz in one gap; bed gas bursts now and then in one spot; a mud cloud puffs; stems knock
    case 'pinprick': case 'gas': case 'cloud': case 'stems': {
      s.lastAt = t; s.lastX = px; s.lastZ = pz; s.shows++;
      const e = Array.isArray(R.every) ? R.every : [3, 6];
      s.nextAt = t + U(rng, num(e[0], 3), num(e[1], 6));
      shows.push({ type: s.kind, x: px, z: pz, heading: s.heading });
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
  if (s.moss) return mossRule(s, x, z, t, B);   // WC-2: the Mossmere under the loop (WATERCRAFT §5.3)
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

// ================================================================== WC-2: the Mossmere's tells (WATERCRAFT §5; under the loop only)
// The v3 signs re-grounded as an angler's reads, and four new tells (pin-pricks, bed gas, the mud cloud, stems). A tell is made by
// species that are really at that spot at that hour (honest spawning, §5.5): each kind's weight is its hour weight × the share of
// its makers in the "who is there" pool (watercraft's loopPool(…, {area, hook: false})). A cast that obeys a tell's rule gets the
// CONTRACT rule object {kind, id, inSign, form, waitMult, preroll?, makers, tilt, favour?, respond} (WC-1's castOdds applies the
// makers' tilt on takers, the take and the waits); a cast into a tell's middle spooks it where §5.3 says. Glow never shows here.
// WATERCRAFT.mossmere.tells (watercraft.js, WC-1) wins over this table when it is passed in (normTells); this is §5.3 as written.
const MINNOW = 'dusk_minnow', LAMP = 'lampsipper', CARP = 'weeping_carp', KOI = 'candlefin_koi', SUCKER = 'rustfin_sucker';
const PIKE = 'reedjaw_pike', BASS = 'overbold_bass', MILKEYE = 'milkeye_perch', PERCH = 'mossback_perch', CHUB = 'likely_chub';
const TROUT = 'kissmark_trout', STURGEON = 'bridgechain_sturgeon', OLDPIKE = 'thousandcast_pike';
const PLACES4 = ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'];
/** §5.3: per kind its forms (each with makers, areas and, where it differs, its hour weights), its hour weights and its cap. */
export const MOSS_TELLS = {
  rise: { light: { day: 3, dusk: 3.2, night: 1.6 }, cap: 3, forms: {
    sip:    { makers: [MINNOW, LAMP, KOI, CARP], areas: ['margin', 'reeds', 'pads', 'lane', 'open', 'lily_maze'] },
    splash: { makers: [CHUB, BASS, TROUT], areas: ['stones', 'reeds', 'pads', 'inflow', 'outflow'] },
    roll:   { makers: [CARP, SUCKER], areas: ['margin', 'pads', 'open'], lights: ['dusk'] } } },
  boil: { light: { day: 1.3, dusk: 1.6, night: 1.1 }, cap: 2, forms: {
    swirl: { makers: [PIKE, MILKEYE, TROUT, BASS, CARP, CHUB], areas: ['reeds', 'pads', 'stones', 'dropoff', 'deep', ...PLACES4] } } },
  nervous: { light: { day: 1.2, dusk: 1.4, night: 0.8 }, cap: 2, forms: {
    ruffle: { makers: [MINNOW], night: [LAMP], areas: ['margin', 'reeds', 'pads', 'lane', 'open'] },
    spray:  { makers: [PIKE, BASS, MILKEYE, PERCH, OLDPIKE], light: { day: 1.8, dusk: 1.4, night: 0.4 }, minnowRaw: 1,
      areas: ['margin', 'reeds', 'pads', 'lane', 'open', 'inflow', 'outflow', 'under_the_span'] } } },
  strike: { light: { day: 1, dusk: 1.2, night: 0.8 }, cap: 1, forms: {
    strike: { makers: [PIKE, BASS, MILKEYE, PERCH, OLDPIKE], areas: ['reeds', 'pads', 'stones', 'dropoff', 'outflow', 'under_the_span'] } } },
  bubbles: { light: { day: 1.6, dusk: 1.2, night: 0.6 }, cap: 2, forms: {
    fizz: { makers: [CARP], areas: ['margin', 'reeds', 'pads', 'lane', 'open', 'lily_maze'] } } },
  pinprick: { light: { day: 1.2, dusk: 1.4, night: 0 }, cap: 2, forms: {
    pinprick: { makers: [KOI], areas: ['pads', 'lily_maze'] } } },
  cloud: { light: { day: 1.2, dusk: 1, night: 0 }, cap: 2, forms: {
    cloud: { makers: [CARP, SUCKER, STURGEON], areas: ['margin', 'open', 'inflow', 'under_the_span'] } } },
  stems: { light: { day: 1, dusk: 1.2, night: 0.3 }, cap: 2, forms: {
    stems: { makers: [CARP, KOI], byArea: { reeds: [CARP] }, areas: ['pads', 'reeds', 'lily_maze'] } } },
  gas: { light: { day: 0.5, dusk: 0.4, night: 0.3 }, cap: 1, forms: {
    gas: { makers: [], areas: ['margin', 'open', 'deep'] } } },
};
/** §2.4's Dusk Minnow row (raw area weights): fry spray only where it is ≥ 1 (places: as anywhere, 1). WATERCRAFT.mossmere.raw wins. */
export const MINNOW_RAW = { margin: 2, reeds: 1.8, pads: 1.8, stones: 0.8, dropoff: 0.5, lane: 2, open: 1, deep: 0.3, inflow: 1.5, outflow: 1 };
/** The answer the water gives an obeyed tell (§5.3), by kind and form; drawn 1–2 s as water. */
export const RESPOND = { sip: 'rise', roll: 'rise', splash: 'splash', swirl: 'bow', strike: 'bow', ruffle: 'ruffle', spray: 'spray',
  fizz: 'fizz', pinprick: 'pinprick', cloud: 'cloud', stems: 'stems' };
export const WAITS = { rise: 0.5, tell: 0.65 };
/** The light of a phase (watercraft.lightOf's rule): calm, day, dawn → day; dusk → dusk; gloomtide, night → night. */
export const lightOf = (phase) => (phase === 'dusk' ? 'dusk' : phase === 'gloomtide' || phase === 'night' ? 'night' : 'day');

/** The form a kind without forms is drawn as (watercraft's tables keep makers on the kind for these). */
const ONE_FORM = { boil: 'swirl', strike: 'strike', bubbles: 'fizz', pinprick: 'pinprick', cloud: 'cloud', stems: 'stems', gas: 'gas' };
const TELLS_CACHE = new WeakMap();
/**
 * The tells table in use, in MOSS_TELLS' shape: WATERCRAFT.mossmere.tells (WC-1's: {hours, cap, makers?, areas?, forms?: {name:
 * {hours?, makers (a list, or by light), areas, phases?, minnowRaw?}}, glow: {retired}}) converted, else MOSS_TELLS itself.
 */
export function normTells(t) {
  if (!t || typeof t !== 'object' || t === MOSS_TELLS) return MOSS_TELLS;
  if (TELLS_CACHE.has(t)) return TELLS_CACHE.get(t);
  const out = {};
  for (const [kind, K] of Object.entries(t)) {
    if (!K || typeof K !== 'object' || K.retired || kind === 'glow' || kind === 'alive') continue;
    const forms = K.forms && typeof K.forms === 'object' ? K.forms : ONE_FORM[kind] ? { [ONE_FORM[kind]]: K } : null;
    if (!forms) continue;
    const fo = {};
    for (const [fname, f] of Object.entries(forms)) {
      const mk = f.makers ?? K.makers, mine = MOSS_TELLS[kind]?.forms?.[fname] || {};
      const areas = f.areas ?? K.areas;
      if (!Array.isArray(areas)) continue;
      fo[fname] = {
        makers: Array.isArray(mk) ? mk : Array.isArray(mk?.day) ? mk.day : Array.isArray(mk?.dusk) ? mk.dusk : [],
        byLight: !Array.isArray(mk) && mk && typeof mk === 'object' ? mk : undefined,
        byArea: f.byArea ?? mine.byArea, areas, lights: f.phases ?? f.lights, light: f.hours ?? f.light, minnowRaw: f.minnowRaw ?? mine.minnowRaw,
      };
    }
    if (Object.keys(fo).length) out[kind] = { light: K.hours ?? K.light, cap: K.cap, forms: fo };
  }
  const res = Object.keys(out).length ? out : MOSS_TELLS;
  TELLS_CACHE.set(t, res);
  return res;
}
/** The makers of one form at an area and light (the ruffle's Lampsipper at night; the stems in reeds: the carp alone). */
export function formMakers(f, area, light) {
  if (!f) return [];
  if (f.byArea && f.byArea[area]) return f.byArea[area];
  if (f.byLight && Array.isArray(f.byLight[light])) return f.byLight[light];
  if (light === 'night' && Array.isArray(f.night)) return f.night;
  return Array.isArray(f.makers) ? f.makers : [];
}
/**
 * Honest spawning's options at one point (§5.5): [{kind, form, makers, w}] for every kind and form allowed in `area` at `light` and
 * under its cap, w = hour weight × Σ share of its makers in `share` (a Map or object: species id → its share of the who-is-there
 * pool, the giant's share included), bed gas by its weight alone; each sign of a kind already alive halves that kind's weight (the
 * built variety rule). opts: {alive: [kind], tells, minnowRaw (area → the minnow's raw weight), glow (the flag-off phase table: never
 * here)}. Empty: no tell can show there (the caller tries another point).
 */
export function tellOptions(area, light, share, opts = {}) {
  const T = normTells(opts.tells), raw = opts.minnowRaw || MINNOW_RAW;
  const get = (id) => (share instanceof Map ? num(share.get(id), 0) : num(share?.[id], 0));
  const n = {};
  for (const k of opts.alive || []) n[k] = (n[k] || 0) + 1;
  const out = [];
  for (const [kind, K] of Object.entries(T)) {
    if (kind === 'glow') continue;
    if ((n[kind] || 0) >= num(K.cap, kindCap(kind))) continue;
    for (const [form, f] of Object.entries(K.forms || {})) {
      if (!Array.isArray(f.areas) || !f.areas.includes(area)) continue;
      if (Array.isArray(f.lights) && !f.lights.includes(light)) continue;
      const hw = num((f.light || K.light || {})[light], 0);
      if (!(hw > 0)) continue;
      if (f.minnowRaw != null && !PLACES4.includes(area) && num(raw[area], 0) < f.minnowRaw) continue;
      const makers = formMakers(f, area, light);
      let s = 0;
      if (kind === 'gas') s = 1;
      else for (const id of makers) s += get(id);
      if (!(s > 0)) continue;
      out.push({ kind, form, makers, w: hw * s / (1 + (n[kind] || 0)) });
    }
  }
  return out;
}
/** Draw one option of tellOptions by its weight (rng once); null when there is none. */
export function pickTell(options, rng = Math.random) {
  let tot = 0;
  for (const o of options || []) tot += o.w;
  if (!(tot > 0)) return null;
  let r = rng() * tot;
  for (const o of options) { r -= o.w; if (r <= 0) return o; }
  return options[options.length - 1];
}

/** The Mossmere's cast rules (§5.3): the rule object, a spook where a tell's middle is hit, else null. */
export function mossRule(s, x, z, t, B = {}) {
  const R = kindRules(s.kind, B);
  const form = s.form || null;
  const base = { kind: s.kind, id: s.id, inSign: true, form, makers: Array.isArray(s.makers) ? s.makers.slice() : [], respond: RESPOND[form] || null };
  const tell = (extra) => ({ ...base, tilt: 3, waitMult: WAITS.tell, ...extra });
  const spook = () => ({ kind: s.kind, id: s.id, inSign: false, form, spook: true });
  switch (s.kind) {
    case 'rise': {   // the sip (and the roll): 2.5 m, 3 s; the splash: 3 m, 2 s. Its fish takes (takeChance(1, grade)); wait × 0.5
      const d = Math.hypot(x - s.lastX, z - s.lastZ), within = form === 'splash' ? 2 : num(R.within, 3), r = form === 'splash' ? 3 : num(R.castR, 2.5);
      if (s.shows < 1 || t - s.lastAt < 0 || t - s.lastAt > within || d > r) return null;
      return { ...base, tilt: 1, waitMult: WAITS.rise, preroll: { chance: num(R.bite, 1) } };
    }
    case 'boil': {   // the swirl: 3 m, 8 s; its Prize+ fish takes (takeChance(0.6, grade)); a bow wave; wait × 0.65
      const d = Math.hypot(x - s.lastX, z - s.lastZ);
      if (s.shows < 1 || t - s.lastAt < 0 || t - s.lastAt > num(R.within, 8) || d > num(R.castR, 3)) return null;
      return { ...base, tilt: 1, waitMult: WAITS.tell, preroll: { chance: num(R.bite, 0.6) } };
    }
    case 'nervous': {   // the ruffle and the fry: at the edge; into the middle it goes flat / the fry scatter (a spook)
      const r = s.radius, d = Math.hypot(x - s.position.x, z - s.position.z);
      if (d > r + num(R.edgeOut, 1.6)) return null;
      if (d < r * num(R.edgeIn, 0.55)) return spook();
      return form === 'spray' ? tell({ favour: num(R.favour, 0.3) }) : tell({});
    }
    case 'strike': {   // 4 m, 10 s: its makers × 3, favour +0.6, a bow wave
      const d = Math.hypot(x - s.lastX, z - s.lastZ);
      if (s.shows < 1 || t - s.lastAt < 0 || t - s.lastAt > num(R.within, 10) || d > num(R.castR, 4)) return null;
      return tell({ favour: num(R.favour, 0.6) });
    }
    case 'bubbles': {   // carp fizz: within 2 m of the trail's head, never behind it
      const dx = x - s.head.x, dz = z - s.head.z, d = Math.hypot(dx, dz);
      const along = dx * Math.sin(s.heading) + dz * Math.cos(s.heading);
      if (d > num(R.headR, 2) || along < -0.5) return null;
      return tell({ favour: num(R.favour, 0.2) });
    }
    case 'pinprick': {   // within 1.5 m of the patch's centre: the koi × 3, favour +0.2
      if (Math.hypot(x - s.position.x, z - s.position.z) > num(R.castR, 1.5)) return null;
      return tell({ favour: num(R.favour, 0.2) });
    }
    case 'cloud': {   // within 2 m of its freshest edge, ≤ 15 s after it blooms; into its middle spooks it
      const since = t - s.lastAt;
      if (s.shows < 1 || since < 0 || since > num(R.within, 15)) return null;
      const rc = cloudRadius(since, R), cx = s.lastX, cz = s.lastZ;
      const d = Math.hypot(x - cx, z - cz);
      if (d < rc * 0.5) return spook();
      const ex = cx + Math.sin(s.heading) * rc, ez = cz + Math.cos(s.heading) * rc;   // the freshest edge: where it is drifting to
      if (Math.hypot(x - ex, z - ez) > num(R.castR, 2) && d > rc + 0.6) return null;
      return tell({ favour: num(R.favour, 0.2) });
    }
    case 'stems': {   // within 2.5 m of the moving stems' edge, ≤ 8 s; into the middle of the bed spooks it
      const since = t - s.lastAt, d = Math.hypot(x - s.position.x, z - s.position.z);
      if (s.shows < 1 || since < 0 || since > num(R.within, 8)) return null;
      if (d < s.radius * 0.5) return spook();
      if (d > s.radius + num(R.castR, 2.5)) return null;
      return tell({});
    }
    default: return null;   // bed gas (and glow): no cast rule; the cast rolls the pool as anywhere
  }
}
/** A mud cloud's radius (m) `since` s after it bloomed. */
export const cloudRadius = (since, R = DEFAULTS.cloud) => Math.min(num(R.maxR, 1.7), 0.45 + num(R.grow, 0.22) * Math.max(0, since));
/**
 * The water's answer to an obeyed tell (§5.3): {type, x, z, heading, life, delay} drawn at the float (rise, splash: beside it; bow:
 * from the tell toward the float; fizz: the trail turned onto it), or null for a spook, a rule with no answer, or none.
 */
export function answerFor(rule, s, bob, rng = Math.random) {
  if (!rule || rule.spook || !rule.respond || !s || !bob) return null;
  const from = { x: s.kind === 'bubbles' ? s.head.x : s.position.x, z: s.kind === 'bubbles' ? s.head.z : s.position.z };
  const toward = Math.atan2(bob.x - from.x, bob.z - from.z);
  const a = rng() * Math.PI * 2, off = 0.35 + 0.3 * rng();
  const life = 1 + rng(), delay = 0.35 + 0.5 * rng();
  switch (rule.respond) {
    case 'rise': case 'splash': return { type: rule.respond, x: bob.x + Math.cos(a) * off, z: bob.z + Math.sin(a) * off, heading: toward, life, delay };
    case 'bow': return { type: 'bow', x: from.x, z: from.z, x1: bob.x, z1: bob.z, heading: toward, life: 1.6, delay: 0.2 };
    case 'cloud': return { type: 'cloud', x: bob.x + Math.cos(a) * 0.5, z: bob.z + Math.sin(a) * 0.5, heading: toward, life: 2, delay };
    default: return { type: rule.respond, x: bob.x, z: bob.z, heading: toward, life, delay };
  }
}
/** F17 on a makers' tilt (AUTOFISH.signRule): true when tilting `makers` by `tilt` over `entries` [{id|sp, w}] still leaves ≥ minSpecies
 *  species and none above maxShare (the tilt does not name a fish). WC-1's castOdds judges it on takers; this is the rule's shape. */
export function makersTiltOk(entries, makers, tilt = 3, rule = {}) {
  const ms = new Set(makers || []), minS = num(rule.minSpecies, 2), maxS = num(rule.maxShare, 0.8);
  let tot = 0, n = 0, top = 0;
  const w = (entries || []).map((e) => { const id = e.id ?? e.sp?.id ?? e.sp; const v = num(e.w, 0) * (ms.has(id) ? tilt : 1); if (v > 0) n++; tot += v; return v; });
  for (const v of w) top = Math.max(top, v);
  return n >= minS && tot > 0 && top / tot <= maxS;
}
