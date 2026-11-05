// fishing-play.js — the automatic play, planned (DESIGN §25.6.5; CONTRACT §13.7 planPlay, §13.7a). Pure: no state, no ctx, no
// Math.random. Imported by fishing.js and the tests.
//
//   planPlay(sizeClass, z, seed, {leapChance, tiers, place, legendId, A}) -> Plan
//       The whole play from size class, z, the fitted tackle (mean tier), the place and a seed: its length, its beats (take, gain,
//       run, hold, surge, last stand, the still, lift), its overlays (glimpses, scares, leaps) and its presentation numbers (tow,
//       rod bend, camera shake, music). It never sees a species id: fishing passes the species' leap chance in
//       (AUTOFISH.leaps[id] ?? 0) and, for legends, the legend's id (an authored set piece, AUTOFISH.legendPlays). The plan is built
//       BEFORE the outcome is applied, so a landed and a lost play on one seed are identical up to the loss.
//   chooseLoss(plan, {style, grade, foul, leaper, causeU, momentU, A}) -> {cause, at, frac, on, dur}
//       Where and how a lost play is lost (AUTOFISH.loss): the cause follows the slot the fish tests (style), Small / Keeper only
//       spit or throw, Prize / Trophy never spool, a mistimed strike doubles the spat weight, a foul place takes half, a leap in the
//       second half throws the hook on the leap (onLeap) and a scare there loses on the scare (onScare). Always at ≥ loss.minAt of
//       the plan. Every choice comes from the two draws fishing made at the strike (causeU, momentU), so nothing else is drawn.
//   applyLoss(plan, loss) -> Plan      the plan cut at the loss moment, with the loss beat (the plan up to it is untouched)
//   partPlan(plan, t, cause, dur) -> Plan   an outside end now (Gloomtide's hand slam, 'staggered')
//   presentAt(plan, t, out?) -> {phase, kind, beat, beatK, k, line, bend, glimpse, leap, leapU, scare, done}
//       The presentation at play time t (s): where the fish is along the line (k: 0 at the take, 1 at the scoop), the line's
//       tension and the rod's bend (presentation only: no odds), and the overlay that is live.
import { AUTOFISH, SIZE_CLASSES, BALANCE_V3 } from './data.js';

export const PLAY_CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const CLASS_I = { small: 0, keeper: 1, prize: 2, trophy: 3, elder: 4, ancient: 5, legend: 5 };
// holds per play (the "hold" beat: a stalemate, the rod deep and still); presentation only
const HOLDS = { small: 0, keeper: 0, prize: 1, trophy: 1, elder: 1, ancient: 2 };
// a beat's line tension (presentation only; never the odds) and how it moves the fish along the line (gain + / run −)
const LINE = { take: 0.75, gain: 0.5, run: 0.86, hold: 0.66, surge: 0.95, lastStand: 1, still: 0.07, lift: 0.45, loss: 0, place: 0.7 };
const PULL = { take: 0, gain: 1, run: -0.7, hold: 0, surge: -0.2, lastStand: -0.6, still: 0, lift: 0, loss: 0, place: 0.6 };
// legends' named beats as play phases (their kind keeps the name: the legend grammar carries the species, so nothing is hidden)
const LEGEND_PHASE = { take: 'take', lift: 'lift', run: 'run', hold: 'hold', lastStand: 'lastStand', still: 'still', leap: 'gain',
  toll: 'hold', circle: 'run', bloomingDive: 'run', shatterRun: 'run', emberSurge: 'surge', graspingDark: 'surge' };
const GLIMPSE_KIND = { keeper: ['swirl'], prize: ['roll', 'roll'], trophy: ['roll', 'tailSlap', 'roll'], elder: ['roll', 'pass', 'tailSlap', 'roll'], ancient: ['roll', 'pass', 'tailSlap', 'roll', 'roll'] };

export function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, k) => a + (b - a) * k;
const r4 = (v) => Math.round(v * 1e4) / 1e4;
/** A second, independent uniform from one draw (a hash of its bits): the loss's sub-choices never draw again. */
export function subU(u, k) { return mulberry32(((Math.floor(clamp(u, 0, 1) * 4294967295) >>> 0) ^ Math.imul(k + 1, 0x9E3779B1)) | 0)(); }

/** The play class of a size score: small … elder, or 'ancient' (an Elder with z ≥ the Ancient threshold). */
export function playClassOf(z, sz = BALANCE_V3.size, classes = SIZE_CLASSES) {
  const c = classes.find((q) => z < q.zMax)?.id || 'elder';
  return c === 'elder' && z >= sz.ancient ? 'ancient' : c;
}
/** [lo, hi] of z inside a play class (the class band the play's length grows across). */
export function zBand(cls, sz = BALANCE_V3.size, classes = SIZE_CLASSES) {
  if (cls === 'ancient') return [sz.ancient, sz.z.max];
  const i = classes.findIndex((q) => q.id === cls);
  const lo = i <= 0 ? sz.z.min : classes[i - 1].zMax;
  const hi = cls === 'elder' ? sz.ancient : classes[i].zMax;
  return [lo, hi];
}
const meanTier = (t) => {
  if (Number.isFinite(t)) return clamp(t, 0, 4);
  if (t && typeof t === 'object') { const v = ['rod', 'line', 'reel'].map((k) => (Number.isFinite(t[k]) ? t[k] : 0)); return clamp((v[0] + v[1] + v[2]) / 3, 0, 4); }
  return 0;
};
const intIn = (r, u) => (Array.isArray(r) ? r[0] + Math.floor(u * (r[1] - r[0] + 1 - 1e-9)) : 0);
/** Positions for up to `max` overlays inside [a, b] with a minimum gap, from a FIXED number of draws (always `max`): sorted
 *  uniforms over the slack plus the gaps, so the count never shifts any later draw. */
function spaced(rng, max, n, a, b, gap) {
  const u = []; for (let i = 0; i < max; i++) u.push(rng());
  if (n <= 0) return [];
  const g = Math.min(gap, (b - a) / Math.max(1, n)), slack = Math.max(0, (b - a) - (n - 1) * g);
  return u.slice(0, n).sort((x, y) => x - y).map((v, i) => a + v * slack + i * g);
}

/**
 * The automatic play (pure). sizeClass: small … elder (an Elder with z past the Ancient threshold plays as an Ancient) or
 * 'ancient'; z: the size score; seed: the plan seed fishing drew at the strike. opts: {leapChance (0..1, the species' chance that a
 * play leaps), tiers (mean fitted tier 0–4, or {rod, line, reel}), place (a place id: its beat replaces one gain), legendId (a
 * legend's authored play), A (AUTOFISH, for tests)}.
 */
export function planPlay(sizeClass, z, seed, { leapChance = 0, tiers = 0, place = null, legendId = null, A = AUTOFISH } = {}) {
  const P0 = A.play, rng = mulberry32((seed >>> 0) || 1);
  const U = (r) => (Array.isArray(r) ? lerp(r[0], r[1], rng()) : r);
  const tier = meanTier(tiers);
  const T = P0.tackle || {};
  const legend = legendId && A.legendPlays?.[legendId] ? legendId : null;
  const cls = legend ? 'legend' : sizeClass === 'ancient' || (sizeClass === 'elder' && z >= BALANCE_V3.size.ancient) ? 'ancient' : sizeClass;
  const P = legend ? (P0.legend || {}) : P0[cls] || P0.keeper;
  const plan = { v: 1, sizeClass: cls, z: r4(z), seed: seed >>> 0, tier: r4(tier), legend, place: place || null,
    beats: [], events: [], lastStands: [], still: null, firstGlimpse: null, leapCount: 0, leaps: 0,
    tow: 0, bend: 0, shake: 0, music: null, strainPitch: 0, pass: false, loss: null, end: 0, dur: 0 };
  if (legend) return planLegend(plan, A.legendPlays[legend], A, rng, U, tier);
  // ---- length: grows with z inside the class band, × U(jitter), −5% per mean fitted tier
  const [lo, hi] = zBand(cls);
  const bandPos = clamp((z - lo) / Math.max(1e-6, hi - lo), 0, 1);
  const jit = U(P0.jitter || [1, 1]);
  const dur = lerp(P.dur[0], P.dur[1], bandPos) * jit * Math.max(0.5, 1 + (T.durPerTier ?? 0) * tier);
  plan.dur = r4(dur); plan.end = plan.dur;
  plan.bend = r4(clamp((P.bend ?? 0.5) + (T.bendPerTier ?? 0) * tier, 0.08, 1));
  plan.shake = P.shake ?? 0; plan.music = P.music ?? null; plan.strainPitch = (T.strainPitchPerTier ?? 0) * tier;
  plan.tow = r4((P.tow ?? 0) * (0.85 + 0.3 * bandPos));
  plan.pass = !!P.pass;
  const B = P0.beat;
  // ---- fixed draws, in this order (the order never depends on the class's counts)
  const takeD = U(B.take), liftD = U(B.lift);
  const nRuns = intIn(P.runs, rng()), nSurges = intIn(P.surges, rng());
  const lsU = [rng(), rng(), rng(), rng()];   // last-stand starts and lengths (up to 2)
  const seqU = []; for (let i = 0; i < 16; i++) seqU.push(rng());   // beat order and lengths
  // ---- the frame of the play: the take, the lift (it covers [≤ 0.88, 1]: the scoop comes after the latest possible spat)
  const take1 = Math.min(takeD, dur * 0.2);
  const lift0 = Math.min(dur - Math.min(liftD, dur * 0.4), dur * 0.88);
  // ---- last stands and the still (Elder 1, Ancient 2 with the still between)
  const wins = (P0.lastStandAt?.[cls] || []).slice(0, P.lastStand || 0);
  const reserved = [];
  if (wins.length) {
    // each last stand starts inside its window; the second (Ancient) is long enough before the lift, with the still between
    const minLS = B.lastStand[0] * 0.75;
    const stillD = P.still ? (B.still?.[0] ?? 1.5) : 0;
    const w2 = wins[1] ? [wins[1][0] * dur, Math.max(wins[1][0] * dur, Math.min(wins[1][1] * dur, lift0 - minLS))] : null;
    const s1 = lerp(wins[0][0], wins[0][1], lsU[0]) * dur;
    let e1 = s1 + lerp(B.lastStand[0], B.lastStand[1], lsU[1]);
    e1 = Math.max(s1 + 0.5, Math.min(e1, w2 ? w2[1] - stillD : lift0));
    reserved.push({ phase: 'lastStand', t0: s1, t1: e1 });
    if (w2) {
      const s2 = Math.max(lerp(w2[0], w2[1], lsU[2]), e1 + stillD);
      if (stillD) reserved.push({ phase: 'still', t0: s2 - stillD, t1: s2 });   // everything stops, then it thunders off
      const e2 = Math.max(s2 + 0.5, Math.min(s2 + lerp(B.lastStand[0], B.lastStand[1], lsU[3]), lift0));
      reserved.push({ phase: 'lastStand', t0: s2, t1: e2 });
    }
  }
  // ---- the action beats between: gain, a1, gain, a2, …, gain (runs, surges and holds in a seeded order)
  const acts = [];
  for (let i = 0; i < nRuns; i++) acts.push({ phase: 'run', long: cls === 'elder' && i === 0 });
  for (let i = 0; i < nSurges; i++) acts.push({ phase: 'surge' });
  for (let i = 0; i < (HOLDS[cls] ?? 0); i++) acts.push({ phase: 'hold' });
  for (let i = acts.length - 1; i > 0; i--) { const j = Math.floor(seqU[i % 16] * (i + 1)); [acts[i], acts[j]] = [acts[j], acts[i]]; }
  const seq = [];
  for (let i = 0; i <= acts.length; i++) { seq.push({ phase: 'gain' }); if (i < acts.length) seq.push(acts[i]); }
  if (place && P0.placeBeats?.[place]) { const g = seq.findIndex((s, i) => s.phase === 'gain' && i > 0) ; if (g > 0) seq[g] = { phase: 'place', kind: P0.placeBeats[place] }; else seq[0] = { phase: 'place', kind: P0.placeBeats[place] }; }
  seq.forEach((s, i) => { const r = B[s.phase === 'place' ? 'gain' : s.phase] || [0.5, 1.5]; s.d = lerp(r[0], r[1], seqU[(i + 7) % 16]) * (s.long ? 1.6 : 1); s.strength = r4(0.55 + 0.45 * seqU[(i + 3) % 16]); });
  // lay the sequence over the free time [take1, lift0] minus the reserved blocks, scaled to fill it exactly
  const free = [];
  let cur = take1;
  for (const r of reserved.sort((a, b) => a.t0 - b.t0)) { if (r.t0 > cur + 1e-6) free.push([cur, r.t0]); cur = Math.max(cur, r.t1); }
  if (lift0 > cur + 1e-6) free.push([cur, lift0]);
  const freeT = free.reduce((a, [x, y]) => a + (y - x), 0), nomT = seq.reduce((a, s) => a + s.d, 0) || 1;
  const k = freeT / nomT;
  const beats = [{ phase: 'take', kind: null, t0: 0, t1: take1, strength: r4(0.6 + 0.08 * CLASS_I[cls]) }];
  let fi = 0, pos = free[0]?.[0] ?? take1;
  for (const s of seq) {
    let left = s.d * k;
    while (left > 1e-6 && fi < free.length) {
      const room = free[fi][1] - pos;
      const d = Math.min(room, left);
      if (d > 1e-6) beats.push({ phase: s.phase, kind: s.kind || (s.long ? 'long' : null), t0: pos, t1: pos + d, strength: s.strength });
      left -= d; pos += d;
      if (free[fi][1] - pos <= 1e-6) { fi++; pos = free[fi]?.[0] ?? pos; }
    }
  }
  for (const r of reserved) beats.push({ phase: r.phase, kind: null, t0: r.t0, t1: r.t1, strength: r.phase === 'still' ? 0.1 : 1 });
  beats.push({ phase: 'lift', kind: null, t0: lift0, t1: dur, strength: 0.5 });
  plan.beats = mergeBeats(beats.sort((a, b) => a.t0 - b.t0));
  plan.lastStands = reserved.filter((r) => r.phase === 'lastStand').map((r) => [r4(r.t0), r4(r.t1)]);
  plan.still = reserved.find((r) => r.phase === 'still') ? (({ t0, t1 }) => [r4(t0), r4(t1)])(reserved.find((r) => r.phase === 'still')) : null;
  // ---- overlays (fixed draws each): glimpses, then scares, then leaps last (a leap chance never shifts another draw)
  const ev = [];
  const nG = intIn(P.glimpses, rng());
  const g0 = P0.firstGlimpse?.[cls] ? lerp(P0.firstGlimpse[cls][0], P0.firstGlimpse[cls][1], rng()) : (rng(), null);
  const gPos = spaced(rng, 5, Math.max(0, nG - 1), 0.15, 0.85, 0.08);
  const kinds = GLIMPSE_KIND[cls] || [];
  if (nG > 0 && g0 != null) {
    const all = [g0, ...gPos].sort((a, b) => a - b);
    const firstAt = g0;
    all.forEach((f, i) => ev.push({ phase: 'glimpse', kind: kinds[i] || 'roll', at: f * dur, dur: U(B.glimpse), first: f === firstAt }));
    plan.firstGlimpse = r4(firstAt * dur);
  } else if (cls === 'small') {   // a Small never shows itself in the play: it skitters at the surface during the lift (the class estimate stamps there)
    ev.push({ phase: 'glimpse', kind: 'skitter', at: lift0, dur: dur - lift0, first: true });
    plan.firstGlimpse = r4(lift0);
  }
  const nS = intIn(P0.scare?.[cls], rng());
  const sPos = spaced(rng, 2, nS, 0.2, 0.85, 0.1);
  const sKind = [rng(), rng()];
  sPos.forEach((f, i) => ev.push({ phase: 'scare', kind: sKind[i] < 0.5 ? 'slack' : 'shake', at: f * dur, dur: U(B.scare) }));
  const leapU = rng(), countU = rng();
  const dist = A.leap?.count?.[cls] || [];
  let nL = 0;
  { let acc = 0; for (const [n, p] of dist) { acc += p; if (countU < acc - 1e-12) { nL = n; break; } } if (!nL && dist.length) nL = dist[dist.length - 1][0]; }
  const when = A.leap?.when || [0.15, 0.85];
  const lPos = spaced(rng, 3, Math.min(nL, A.leap?.perClassMax?.[cls] ?? 3), when[0], when[1], A.leap?.minGap ?? 0.12);
  const lDur = [U(B.leap), U(B.leap), U(B.leap)];
  if (cls !== 'small' && leapU < clamp(+leapChance || 0, 0, 1) && lPos.length) {
    lPos.forEach((f, i) => ev.push({ phase: 'leap', kind: A.leap?.kind?.[cls] || 'leap', at: f * dur, dur: Math.min(lDur[i], dur * 0.12 + 0.3), n: i, first: i === 0 }));
    plan.leapCount = lPos.length; plan.leaps = lPos.length;
  }
  plan.events = ev.sort((a, b) => a.at - b.at).map((e) => ({ ...e, at: r4(e.at), dur: r4(e.dur) }));
  plan.beats = plan.beats.map((b) => ({ ...b, t0: r4(b.t0), t1: r4(b.t1) }));
  if (plan.beats.length) { plan.beats[plan.beats.length - 1].t1 = plan.dur; }
  plan.knots = progressKnots(plan);
  return plan;
}
function mergeBeats(beats) {   // slivers (a beat split around a reserved block, < 0.12 s) join the beat before them
  const out = [];
  for (const b of beats) {
    if (b.t1 - b.t0 <= 1e-6) continue;
    if (out.length && b.t1 - b.t0 < 0.12 && b.phase !== 'lift') { out[out.length - 1].t1 = b.t1; continue; }
    out.push({ ...b });
  }
  return out;
}
/** The authored legend plays (AUTOFISH.legendPlays): fixed length, named beats evenly over the play between the take and the lift,
 *  leaps at their authored fractions. */
function planLegend(plan, L, A, rng, U, tier) {
  const B = A.play.beat;
  const dur = L.dur;
  plan.dur = dur; plan.end = dur; plan.bend = 1; plan.shake = 0.22; plan.music = 'boss'; plan.tow = 2.5;
  const set = L.set.filter((s) => s !== 'take' && s !== 'lift');
  const take1 = U(B.take), lift0 = dur - Math.max(U(B.lift), dur * 0.08);
  const span = (lift0 - take1) / Math.max(1, set.length);
  const beats = [{ phase: 'take', kind: null, t0: 0, t1: take1, strength: 1 }];
  set.forEach((name, i) => beats.push({ phase: LEGEND_PHASE[name] || 'gain', kind: name, t0: take1 + i * span, t1: take1 + (i + 1) * span, strength: r4(0.7 + 0.3 * rng()) }));
  beats.push({ phase: 'lift', kind: null, t0: lift0, t1: dur, strength: 0.6 });
  plan.beats = beats.map((b) => ({ ...b, t0: r4(b.t0), t1: r4(b.t1) }));
  plan.lastStands = plan.beats.filter((b) => b.phase === 'lastStand').map((b) => [b.t0, b.t1]);
  const st = plan.beats.find((b) => b.phase === 'still'); plan.still = st ? [st.t0, st.t1] : null;
  plan.events = (L.leaps || []).map((f, i) => ({ phase: 'leap', kind: 'leap', at: r4(f * dur), dur: r4(U(B.leap)), n: i, first: i === 0 }));
  plan.leapCount = plan.events.length; plan.leaps = plan.leapCount;
  plan.knots = progressKnots(plan);
  return plan;
}
/** k (the fish's progress toward the raft, 0 → 1) at every beat boundary: gains pull it in, runs and surges give line; the lift
 *  brings it from 0.8 to 1. Presentation only. */
function progressKnots(plan) {
  const out = [];
  let g = 0;
  const lift = plan.beats.find((b) => b.phase === 'lift');
  const L0 = lift ? lift.t0 : plan.dur;
  const raw = [];
  for (const b of plan.beats) { raw.push([b.t0, g]); if (b.phase !== 'lift') g = Math.max(0, g + (PULL[b.phase] ?? 0) * (b.t1 - b.t0)); }
  const gL = Math.max(1e-6, raw.find(([t]) => t >= L0 - 1e-6)?.[1] ?? g);
  for (const [t, v] of raw) out.push([t, t >= L0 - 1e-6 ? 0.8 : clamp(0.8 * v / gL, 0, 0.8)]);
  out.push([plan.dur, 1]);
  return out.map(([t, v]) => [r4(t), r4(v)]);
}

/** The loss's cause weights for a style and class (AUTOFISH.loss.byStyle / byClass, a mistimed strike's spat), normalised. */
export function lossWeights(style, cls, grade = 'struck', A = AUTOFISH) {
  const L = A.loss;
  const w = { ...(L.byStyle[style] || L.byStyle.steady) };
  const C = L.byClass[cls === 'legend' ? 'elder' : cls] || {};
  if (C.only) { for (const k of Object.keys(w)) if (!C.only.includes(k)) delete w[k]; if (C.only.includes('spat')) w.spat = (w.spat || 0) + 0.4; }
  for (const k of C.no || []) delete w[k];
  if (C.spat) w.spat = (w.spat || 0) + C.spat;
  if ((grade === 'early' || grade === 'late') && w.spat) w.spat *= L.mistimedSpat ?? 2;
  const tot = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  for (const k of Object.keys(w)) w[k] /= tot;
  return w;
}
const pickW = (w, u) => { let acc = 0; const ks = Object.keys(w); for (const k of ks) { acc += w[k]; if (u < acc - 1e-12) return k; } return ks[ks.length - 1]; };
/** Where a lost play is lost (pure; see the header). Returns {cause, at (s), frac, on: 'leap'|'scare'|'beat', dur (the loss beat, s)}. */
export function chooseLoss(plan, { style = 'steady', grade = 'struck', foul = false, leaper = false, causeU = 0.5, momentU = 0.5, A = AUTOFISH } = {}) {
  const L = A.loss, dur = plan.dur, minAt = (L.minAt ?? 0.5) * dur, cls = plan.sizeClass;
  const s1 = subU(causeU, 1), s2 = subU(causeU, 2), s3 = subU(causeU, 3), m2 = subU(momentU, 2), m3 = subU(momentU, 3);
  const lossDur = r4(lerp(A.play.beat.loss[0], A.play.beat.loss[1], m3));
  const out = (cause, at, on) => ({ cause, at: r4(Math.max(minAt, at)), frac: r4(Math.max(minAt, at) / dur), on, dur: lossDur });
  if (foul && s1 < (L.chainFouled ?? 0.5)) { const [a, b] = L.at.fouled; return out('fouled', lerp(a, b, momentU) * dur, 'beat'); }
  // a leap in the second half: the hook is thrown on the leap (its apex)
  const thrownWin = L.at.thrown;
  const leaps = plan.events.filter((e) => e.phase === 'leap' && e.at >= minAt && e.at <= thrownWin[1] * dur);
  if (leaps.length && s2 < (leaper ? L.onLeap.leaper : L.onLeap.other)) {
    const e = leaps[Math.min(leaps.length - 1, Math.floor(m2 * leaps.length))];
    return out('thrown', e.at + e.dur * 0.5, 'leap');
  }
  // a scare in the loss window: the play is lost on the scare (a slack moment spits, a head-shake throws)
  const scares = plan.events.filter((e) => e.phase === 'scare' && e.at >= minAt && e.at <= 0.9 * dur);
  if (scares.length && s3 < (L.onScare ?? 0.4)) {
    const e = scares[Math.min(scares.length - 1, Math.floor(m2 * scares.length))];
    return out(e.kind === 'slack' ? 'spat' : 'thrown', e.at + Math.min(0.2, e.dur * 0.4), 'scare');
  }
  const w = lossWeights(style, cls, grade, A);
  const cause = pickW(w, causeU);
  const [a, b] = L.at[cause] || [0.5, 0.9];
  const lo = Math.max(minAt, a * dur), hi = Math.max(lo, b * dur);
  // snap to a beat that reads as the cause (snapped: a run, surge or last stand; spooled: the long run or a last stand)
  const want = cause === 'snapped' ? ['run', 'surge', 'lastStand'] : cause === 'spooled' ? ['run', 'lastStand'] : cause === 'thrown' ? ['surge'] : null;
  if (want) {
    const cands = plan.beats.filter((x) => want.includes(x.phase) && x.t1 > lo && x.t0 < hi);
    if (cands.length) {
      const x = cands[Math.min(cands.length - 1, Math.floor(m2 * cands.length))];
      const x0 = Math.max(lo, x.t0), x1 = Math.min(hi, x.t1);
      return out(cause, lerp(x0, x1, momentU), 'beat');
    }
  }
  return out(cause, lerp(lo, hi, momentU), 'beat');
}
/** The plan cut at the loss: everything before `loss.at` is untouched; then one loss beat; overlays after it go. */
export function applyLoss(plan, loss) {
  const at = loss.at;
  const beats = [];
  for (const b of plan.beats) { if (b.t0 >= at - 1e-9) break; beats.push(b.t1 > at ? { ...b, t1: at } : b); }
  beats.push({ phase: 'loss', kind: loss.cause, t0: at, t1: r4(at + loss.dur), strength: 1 });
  const events = plan.events.filter((e) => e.at < at - 1e-9);   // the leap or scare it is lost on started before the loss: it stays
  const p = { ...plan, beats, events, loss: { ...loss }, end: r4(at + loss.dur) };
  p.knots = [...plan.knots.filter(([t]) => t < at), [at, kAt(plan, at)], [r4(at + loss.dur), 0]];
  return p;
}
/** An outside end now (Gloomtide's hand slam: 'staggered'): the same as a loss at t, whatever the plan said. */
export function partPlan(plan, t, cause = 'staggered', dur = 0.6) {
  return applyLoss(plan, { cause, at: r4(Math.min(Math.max(0, t), plan.end)), frac: r4(t / plan.dur), on: 'beat', dur });
}
function kAt(plan, t) {
  const K = plan.knots;
  if (!K?.length) return 0;
  if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [t0, v0] = K[i - 1], [t1, v1] = K[i]; return lerp(v0, v1, (t - t0) / Math.max(1e-6, t1 - t0)); }
  return K[K.length - 1][1];
}
/** The presentation at play time t (pure): the beat, its progress, the fish along the line (k), the line and the rod, the live overlay. */
export function presentAt(plan, t, out = {}) {
  const B = plan.beats;
  let i = 0;
  while (i < B.length - 1 && t >= B[i].t1) i++;
  const b = B[i] || { phase: 'take', t0: 0, t1: 1, strength: 0 };
  out.beat = i; out.phase = b.phase; out.kind = b.kind ?? null; out.strength = b.strength ?? 0;
  out.beatK = clamp((t - b.t0) / Math.max(1e-6, b.t1 - b.t0), 0, 1);
  out.k = clamp(kAt(plan, t), 0, 1);
  let line = LINE[b.phase] ?? 0.5;
  out.glimpse = null; out.leap = null; out.leapU = 0; out.scare = null;
  for (const e of plan.events) {
    if (t < e.at || t > e.at + e.dur) continue;
    if (e.phase === 'glimpse') out.glimpse = e;
    else if (e.phase === 'leap') { out.leap = e; out.leapU = clamp((t - e.at) / Math.max(1e-6, e.dur), 0, 1); line = 0.35 + 0.4 * Math.sin(Math.PI * out.leapU); }
    else if (e.phase === 'scare') { out.scare = e; line = e.kind === 'slack' ? 0.04 : 0.92; }
  }
  if (b.phase === 'loss') line = b.kind === 'snapped' ? 0 : 0.03 * (1 - out.beatK);
  out.line = line;
  out.bend = r4((plan.bend || 0.5) * line);
  out.done = t >= plan.end;
  return out;
}
