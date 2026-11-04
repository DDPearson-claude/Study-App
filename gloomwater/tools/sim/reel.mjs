// tools/sim/reel.mjs — faithful per-frame reimplementation of the DESIGN §5.5 reel model
// (tension, bands, surges, leaps, snap/slack, legendary phase mechanics) driven by a bot
// angler with human limits (perception delay, perception noise, missed surge warnings,
// misread leaps). Used by balance-sim.mjs to turn species difficulty × gear × skill into
// P(land), fight duration and catch quality. All model constants come from BALANCE.reel.
import { BALANCE } from '../../src/data.js';

const R = BALANCE.reel;
const DT = 1 / 30;

// Smooth 1-D value noise in [-1, 1] at `hz`, seeded per fight.
function makeNoise(rng, hz) {
  const pts = [];
  return (t) => {
    const x = t * hz, i = Math.floor(x), f = x - i;
    while (pts.length <= i + 1) pts.push(rng() * 2 - 1);
    const s = f * f * (3 - 2 * f);
    return pts[i] * (1 - s) + pts[i + 1] * s;
  };
}

/**
 * Simulate one hooked fight.
 * sp: species (difficulty, behavior, rarity, boss?) · g: {LS, RS, SZ, slackTime} · skill: reel skill
 * opts: {perfect, startP (wounded), rng}
 * returns {landed, reason, time, q (quality score before spot/bait bonuses), overSecs}
 */
export function simulateFight(sp, g, skill, opts) {
  const rng = opts.rng;
  const d = sp.difficulty;
  const boss = sp.rarity === 'legendary' ? sp.boss : null;
  const beh = sp.behavior;
  const str = R.strength[beh] ?? 1;
  const noise1 = makeNoise(rng, R.noiseHz);
  const noise2 = makeNoise(rng, 0.7);
  const phi = rng() * Math.PI * 2;
  const A = R.bandAmp + R.bandAmpErratic * d.erratic;
  const om = R.bandOmega + R.bandOmegaErratic * d.erratic;
  const baseWarn = beh === 'darter' ? R.darterWarn : Math.max(R.warnMin, R.warnBase - R.warnErratic * d.erratic);

  let T = R.startTension, vT = 0;
  let P = Math.max(opts.perfect ? R.perfectProgress : R.startProgress, opts.startP || 0);
  let slackT = 0, snapT = 0, t = 0;
  let darterOff = 0, darterGoal = 0;
  let holding = true;
  // surge machine
  let surgeStartT = 0, sState = 'idle', sTimer = 0, sLen = 0, sKind = 'pull', pendingDouble = false;
  const everyFor = (enraged) => Math.max(d.surgeEvery * (enraged ? R.enrage.surgeEvery : 1), (d.surgeTime + warnFor(enraged)) / R.dutyCap);
  function warnFor(enraged) { return enraged ? Math.max(R.enrage.warnFloor, baseWarn - R.enrage.warnCut) : baseWarn; }
  let nextSurge = everyFor(false) * U(rng, ...R.surgeJitter) + R.firstSurgeDelay + (opts.perfect ? R.perfectSurgeDelay : 0);
  // bot memory
  const hist = []; // [T, c] ring for delayed perception
  const delaySteps = Math.max(1, Math.round(skill.rt / DT));
  let noticed = false, noticeAt = 0, readLeap = true, lapseUntil = -1;
  let trackingDecoy = false, trackSweet = true, trackRollAt = 0;
  let timeSweet = 0, timeHoldSafe = 0, overSecs = 0;
  const maxTime = 240;

  while (t < maxTime) {
    const enraged = !!(boss && t > boss.enrage);
    // ---- phase
    let ph = null;
    if (boss) for (const p of boss.phases) if (P >= p.at) ph = p;
    const lastPhase = boss ? ph === boss.phases[boss.phases.length - 1] : true;
    const tireOn = !boss || (lastPhase && (ph.tireFrom == null || P >= ph.tireFrom));
    const mech = ph?.mechanic || 'none';
    let pw = d.power * (1 - R.tire * P * (tireOn ? 1 : 0)) * (enraged ? R.enrage.power : 1);
    // ---- bands
    let shrink = 1;
    if (mech === 'shrink') { const p0 = ph.at; shrink = 1 - (1 - (ph.sweetTo ?? 0.6)) * Math.min(1, (P - p0) / Math.max(0.01, 1 - p0)); }
    if (mech === 'brittle') shrink = ph.shardWidth ?? 0.6;   // two shards, each 0.6× (both count; modelled as nearer shard)
    let w = clamp(g.SZ * d.sweet * shrink, R.bandMin, R.bandMax);
    let c = 0.5 + A * Math.sin(om * t + phi) + R.bandNoise * d.erratic * noise2(t) + (beh === 'sinker' ? R.sinkerBand : 0) + darterOff;
    if (mech === 'drag') c += ph.bandOffset ?? -0.1;
    c = clamp(c, R.safeMin + w / 2, R.safeMax - w / 2);
    if (mech === 'brittle') { // a second shard on the other side of centre: take whichever is nearer to T
      const c2 = clamp(1 - c, R.safeMin + w / 2, R.safeMax - w / 2);
      if (Math.abs(T - c2) < Math.abs(T - c)) c = c2;
    }
    const hidden = mech === 'flicker' && (t % (ph.every ?? 8)) > (ph.every ?? 8) - (ph.hide ?? 1.5);
    // ---- surge machine
    const surging = sState === 'surge';
    if (sState === 'idle' && t >= nextSurge) {
      sState = 'warn'; sTimer = warnFor(enraged);
      sKind = beh === 'leaper' ? 'leap' : 'pull';
      if (mech === 'mixedSurge' || mech === 'eclipse') sKind = rng() < 0.5 ? 'leap' : 'pull';
      noticed = rng() < skill.warnNotice; noticeAt = t + skill.rt + 0.05;
      const misreadP = (mech === 'mixedSurge' || mech === 'eclipse') ? skill.mixedMisread : (sKind === 'leap' ? skill.leapMisread : 0.02);
      readLeap = rng() >= misreadP;   // true = the bot correctly identifies what to do
      if (mech === 'decoy' && ph.swapOnSurge) trackingDecoy = rng() < skill.decoyFooled;
    } else if (sState === 'warn') {
      sTimer -= DT;
      if (sTimer <= 0) { sState = 'surge'; surgeStartT = t; sLen = d.surgeTime * U(rng, ...R.surgeLenJitter); sTimer = sLen; }
    } else if (sState === 'surge') {
      sTimer -= DT;
      if (sTimer <= 0) {
        sState = 'idle';
        if (beh === 'darter') darterGoal = (rng() < 0.5 ? -1 : 1) * U(rng, ...R.darterJump);
        if (mech === 'doubleSurge' && !pendingDouble) { pendingDouble = true; nextSurge = t + (ph.gap ?? 0.9); }
        else { pendingDouble = false; nextSurge = t + everyFor(enraged) * U(rng, ...R.surgeJitter); }
      }
    }
    darterOff += (darterGoal - darterOff) * Math.min(1, DT / R.darterJumpTime);
    const leaping = sState === 'surge' && sKind === 'leap';

    // ---- bot decision (delayed, noisy perception)
    hist.push([T, c]);
    const [Tseen0, cseen] = hist.length > delaySteps ? hist[hist.length - 1 - delaySteps] : hist[0];
    if (hist.length > 64) hist.shift();
    const Tseen = Tseen0 + gauss(rng) * skill.noise;
    if (t > lapseUntil && rng() < skill.lapseRate * DT) lapseUntil = t + skill.lapseTime;
    if (t > lapseUntil) {
      const inWarn = sState === 'warn', inSurge = sState === 'surge';
      const knows = noticed && t >= noticeAt;
      const lateSeen = inSurge && (t - surgeStartT) > skill.rt + 0.2;   // a missed warning is recognised once the surge is visible
      const believed = readLeap ? sKind : (sKind === 'leap' ? 'pull' : 'leap');
      let decided = false;
      if ((inWarn && knows) || (inSurge && (knows || lateSeen))) {
        if (believed === 'pull') { holding = false; decided = true; }          // ease off through warning + surge
        else if (inSurge) { holding = !(Tseen > 0.85); decided = true; }      // leap: hold through it, ease only near the top
      }
      if (decided) {
        // handled
      } else if (Tseen > skill.panicAt) {
        holding = false;
      } else {
        if (t >= trackRollAt) { trackSweet = rng() < skill.sweetTrack; trackRollAt = t + 1.5; }
        const goal = hidden || !trackSweet ? 0.5 : cseen;
        const half = Math.max(0.03, Math.min(skill.bandHalf, w * 0.45));
        if (holding && Tseen > goal + half) holding = false;
        else if (!holding && Tseen < goal - half) holding = true;
      }
    }

    // ---- tension
    let target;
    if (leaping) target = holding ? R.leapHold * pw / g.LS : R.leapRelease;
    else if (holding) target = R.riseBase * pw * (sState === 'surge' ? R.surgeHoldMult * Math.sqrt(str) : 1) / g.LS;
    else if (sState === 'surge') target = R.surgeCreep * pw * str / (g.LS * Math.max(0.3, sLen));
    else target = -R.fallBase / (0.8 + 0.2 * pw);
    target += d.erratic * R.jitter * noise1(t);
    if (beh === 'sinker') target += R.sinkerDrag * pw / g.LS;
    if (mech === 'drag') target += ph.drag ?? 0.08;
    vT += (target - vT) * (1 - Math.exp(-R.accel * DT));
    T = Math.max(0, T + vT * DT);

    // ---- progress
    const inSafe = T >= R.safeMin && T <= R.safeMax;
    const inSweet = Math.abs(T - c) <= w / 2 && !(mech === 'decoy' && trackingDecoy);
    if (holding && inSafe) {
      P += DT * g.RS / d.stamina * (inSweet ? R.sweetMult : 1);
      timeHoldSafe += DT; if (inSweet) timeSweet += DT;
    }
    const decayMult = mech === 'shrink' && ph.decayMult ? ph.decayMult : 1;
    if (T < R.safeMin) P -= R.decaySlack * DT * decayMult;
    if (sState === 'surge' && !leaping && !holding) P -= R.decaySurge * DT;
    if (T > R.safeMax) overSecs += DT;
    P = Math.max(0, P);
    // ---- fail states
    const snapAt = mech === 'brittle' ? (ph.snapAt ?? 0.92) : R.snapAt;
    if (T >= snapAt) { snapT += DT; if (snapT >= R.snapGrace) return { landed: false, reason: 'snap', time: t, P }; } else snapT = 0;
    if (T < R.slackLine) slackT += DT; else slackT = Math.max(0, slackT - R.slackDecay * DT);
    if (slackT >= g.slackTime) {
      const noEscape = boss?.noSlackEscape && !(ph?.slackEscapes);
      if (noEscape) { P = Math.max(0, P + (boss.slackDive?.progress ?? -0.12)); T = boss.slackDive?.tension ?? 0.35; vT = 0; slackT = 0; }
      else return { landed: false, reason: 'slack', time: t, P };
    }
    if (P >= 1) {
      const q = timeSweet / Math.max(1, timeHoldSafe) - BALANCE.quality.overDangerPenalty * overSecs;
      return { landed: true, reason: 'landed', time: t + R.landingTime, q, P: 1 };
    }
    t += DT;
  }
  return { landed: false, reason: 'timeout', time: t, P };
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function U(rng, a, b) { return a + (b - a) * rng(); }
function gauss(rng) { let u = 0; while (u === 0) u = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); }

// ---- memoised sampling: K fights per (species, gear bucket, skill, perfect, wounded)
const cache = new Map();
export function fightSample(sp, g, skill, perfect, startP, rng, K = 48) {
  const key = `${sp.id}|${g.LS.toFixed(2)}|${g.RS.toFixed(2)}|${g.SZ.toFixed(3)}|${g.slackTime.toFixed(1)}|${skill.id}|${perfect ? 1 : 0}|${(startP || 0).toFixed(1)}`;
  let arr = cache.get(key);
  if (!arr) {
    arr = [];
    let s = hashStr(key);
    const lrng = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    for (let i = 0; i < K; i++) arr.push(simulateFight(sp, g, skill, { perfect, startP, rng: lrng }));
    cache.set(key, arr);
  }
  return arr[Math.floor(rng() * arr.length)];
}
export function fightStats(sp, g, skill, perfect = false, startP = 0, K = 200) {
  let landed = 0, time = 0, q = 0, snap = 0, slack = 0;
  let s = hashStr(sp.id + skill.id + 'stats');
  const lrng = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  for (let i = 0; i < K; i++) {
    const r = simulateFight(sp, g, skill, { perfect, startP, rng: lrng });
    if (r.landed) { landed++; time += r.time; q += r.q; } else if (r.reason === 'snap') snap++; else slack++;
  }
  return { pLand: landed / K, time: landed ? time / landed : NaN, q: landed ? q / landed : NaN, snap: snap / K, slack: slack / K };
}
function hashStr(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
