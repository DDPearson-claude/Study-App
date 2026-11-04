// fishing-reel.js — the per-frame reel tension model (DESIGN §5.5, legendary phases §5.6).
// Pure logic, no three.js: imported only by fishing.js. Every constant comes from
// BALANCE.reel (passed in as `R`) with safe fallbacks so a half-filled data table never
// breaks a fight.
//
//   const reel = createReel({ R, sp, behavior, boss, LS, RS, sweetZone, slackTime, perfect,
//                             startP, rng, onEvent });
//   reel.step(dt, holding)        // advance one frame
//   reel.T, reel.P, reel.sweetMin … // read-outs for fishing.view
//   onEvent(type, payload): 'surgeWarn' {kind, warn} | 'surge' {strength, kind, duration}
//     | 'surgeEnd' {kind} | 'phase' {index, name, mechanic} | 'enrage' {} | 'dive' {}
//     | 'snap' {} | 'slack' {} | 'landed' {}
//   reel.spike(dT)                // external tension spike (hand slam during a legendary)

const DEF = {
  safeMin: 0.15, safeMax: 0.85, slackLine: 0.08, slackDecay: 2, snapAt: 1.0, snapGrace: 0.12,
  riseBase: 0.42, fallBase: 0.55, surgeHoldMult: 2.2, surgeCreep: 0.18, leapHold: 0.25, leapRelease: -0.9,
  sinkerDrag: 0.06, jitter: 0.22, noiseHz: 1.5, accel: 9, tire: 0.25, decaySlack: 0.04, decaySurge: 0.015,
  sweetMult: 2, startTension: 0.35, startProgress: 0.10, perfectProgress: 0.22, firstSurgeDelay: 1.5,
  perfectSurgeDelay: 1.5, dutyCap: 0.42, warnMin: 0.5, warnBase: 0.9, warnErratic: 0.2, darterWarn: 0.5,
  bandAmp: 0.08, bandAmpErratic: 0.14, bandOmega: 0.5, bandOmegaErratic: 0.9, bandNoise: 0.08,
  darterJump: [0.10, 0.18], darterJumpTime: 0.3, sinkerBand: -0.08, bandMin: 0.05, bandMax: 0.40,
  strength: { steady: 1, darter: 0.6, sinker: 1, thrasher: 1.3, leaper: 1 },
  enrage: { power: 1.25, surgeEvery: 0.75, warnCut: 0.15, warnFloor: 0.55 },
  dangerFrom: 0.72, surgeJitter: [0.75, 1.25], surgeLenJitter: [0.85, 1.15], dangerLine: 0.85,
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** Smooth 1D value noise in [-1, 1] (deterministic per seed). */
function makeNoise(seed) {
  const h = (i) => { const s = Math.sin((i + seed * 17.13) * 127.1 + seed * 311.7) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
  return (x) => {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return h(i) + (h(i + 1) - h(i)) * u;
  };
}

export function createReel(opts = {}) {
  const R = { ...DEF, ...(opts.R || {}) };
  R.strength = { ...DEF.strength, ...(opts.R?.strength || {}) };
  R.enrage = { ...DEF.enrage, ...(opts.R?.enrage || {}) };
  const rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
  const U = (a, b) => a + (b - a) * rng();
  const sp0 = opts.sp || {};
  const sp = {
    power: num(sp0.power, 0.6), surgeEvery: Math.max(0.5, num(sp0.surgeEvery, 6)), surgeTime: Math.max(0.1, num(sp0.surgeTime, 0.7)),
    stamina: Math.max(0.5, num(sp0.stamina, 5)), sweet: Math.max(0.1, num(sp0.sweet, 1)), erratic: clamp(num(sp0.erratic, 0), 0, 1),
  };
  const behavior = opts.behavior || 'steady';
  const boss = opts.boss && Array.isArray(opts.boss.phases) && opts.boss.phases.length ? opts.boss : null;
  const phases = boss ? boss.phases.slice().sort((a, b) => num(a.at, 0) - num(b.at, 0)) : null;
  const legendary = !!opts.legendary || !!boss;
  const onEvent = typeof opts.onEvent === 'function' ? opts.onEvent : () => {};
  const n1 = makeNoise(rng() * 1000), n2 = makeNoise(rng() * 1000 + 50);
  const phi = rng() * Math.PI * 2;
  const str = num(R.strength[behavior], 1);

  // live gear (fishing refreshes these a few times a second)
  const gear = {
    LS: Math.max(0.2, num(opts.LS, 1)), RS: Math.max(0.05, num(opts.RS, 1)),
    sweetZone: Math.max(0.01, num(opts.sweetZone, 0.16)), slackTime: Math.max(0.2, num(opts.slackTime, 1.6)),
  };

  const r = {
    T: R.startTension, vT: 0,
    P: Math.max(opts.perfect ? R.perfectProgress : R.startProgress, num(opts.startP, 0)),
    slackT: 0, snapT: 0, time: 0, done: false, result: null,
    c: 0.5, w: 0.16, sweetMin: 0.42, sweetMax: 0.58, inSweet: false, inSafe: true, danger: 0,
    surge: false, surgeWarn: 0, surgeKind: null, surgeDur: 0, surgeStrength: 0,
    decoyMin: null, decoyMax: null, shards: null, bandsHidden: false,
    phaseIndex: boss ? 0 : -1, phaseName: boss ? (phases[0].name || '') : '', mechanic: boss ? (phases[0].mechanic || 'none') : 'none',
    enraged: false, lightMult: 1, pw: sp.power, target: 0,
    qSweet: 0, qHold: 0, qOver: 0, holdingTime: 0,
    gear,
  };

  // ---------------------------------------------------------------- surge scheduler
  const S = { mode: 'idle', timer: 0, next: 0, warnLen: 0.9, pairSecond: false, eclipseFlip: false };
  let darterOffset = 0, darterFrom = 0, darterTo = 0, darterT = 1;
  let decoySide = rng() < 0.5 ? -1 : 1;
  let phaseStart = 0;

  const phase = () => (boss ? phases[r.phaseIndex] || {} : {});
  function baseWarn() {
    const ph = phase();
    let w = behavior === 'darter' ? R.darterWarn : Math.max(R.warnMin, R.warnBase - R.warnErratic * sp.erratic);
    if (ph.mechanic === 'mixedSurge') w = num(ph.tell, 0.8);
    else if (ph.mechanic === 'eclipse') w = num(ph.warn, 0.6);
    else if (ph.mechanic === 'doubleSurge') w = num(ph.warn, 0.5);
    if (r.enraged) w = Math.max(R.enrage.warnFloor, w - R.enrage.warnCut);
    return w;
  }
  function every() {
    const w = baseWarn();
    return Math.max(sp.surgeEvery * (r.enraged ? R.enrage.surgeEvery : 1), (sp.surgeTime + w) / R.dutyCap);
  }
  function chooseKind() {
    const m = phase().mechanic;
    if (m === 'mixedSurge') return rng() < 0.5 ? 'leap' : 'dive';
    if (m === 'eclipse') { S.eclipseFlip = !S.eclipseFlip; return S.eclipseFlip ? 'pull' : 'leap'; }
    return behavior === 'leaper' ? 'leap' : 'pull';
  }
  S.next = every() * U(R.surgeJitter[0], R.surgeJitter[1]) + R.firstSurgeDelay + (opts.perfect ? R.perfectSurgeDelay : 0);

  function stepSurge(dt) {
    if (S.mode === 'idle') {
      S.next -= dt;
      if (S.next <= 0) {
        S.mode = 'warn'; S.timer = 0; S.warnLen = baseWarn();
        r.surgeKind = chooseKind();
        onEvent('surgeWarn', { kind: r.surgeKind, warn: S.warnLen });
      }
    } else if (S.mode === 'warn') {
      S.timer += dt;
      r.surgeWarn = clamp(S.timer / S.warnLen, 0, 1);
      if (S.timer >= S.warnLen) {
        S.mode = 'surge'; S.timer = 0;
        r.surgeDur = sp.surgeTime * U(R.surgeLenJitter[0], R.surgeLenJitter[1]);
        r.surgeStrength = r.pw * str;
        r.surge = true; r.surgeWarn = 0;
        onEvent('surge', { strength: r.surgeStrength, kind: r.surgeKind, duration: r.surgeDur });
      }
    } else if (S.mode === 'surge') {
      S.timer += dt;
      if (S.timer >= r.surgeDur) {
        const kind = r.surgeKind;
        S.mode = 'idle'; r.surge = false; r.surgeKind = null;
        const ph = phase();
        if (behavior === 'darter') {
          const mag = U(R.darterJump[0], R.darterJump[1]);
          const sign = darterOffset > 0.02 ? -1 : darterOffset < -0.02 ? 1 : (rng() < 0.5 ? -1 : 1);
          darterFrom = darterOffset; darterTo = sign * mag; darterT = 0;
        }
        if (ph.mechanic === 'decoy' && ph.swapOnSurge !== false) decoySide = -decoySide;
        if (ph.mechanic === 'doubleSurge' && !S.pairSecond) {
          S.pairSecond = true;
          S.next = Math.max(0, num(ph.gap, 0.9) - baseWarn());
        } else if (ph.mechanic === 'eclipse') {
          S.pairSecond = false;
          S.next = Math.max(0.2, num(ph.every, 3) - S.warnLen - r.surgeDur);
        } else {
          S.pairSecond = false;
          S.next = every() * U(R.surgeJitter[0], R.surgeJitter[1]);
        }
        onEvent('surgeEnd', { kind });
      }
    }
  }

  function updatePhase() {
    if (!boss) return;
    let idx = 0;
    for (let i = 0; i < phases.length; i++) if (r.P >= num(phases[i].at, 0)) idx = i;
    if (idx > r.phaseIndex) {   // phases only advance (a dive can't undo a phase)
      r.phaseIndex = idx; phaseStart = r.time;
      const ph = phases[idx];
      r.phaseName = ph.name || ''; r.mechanic = ph.mechanic || 'none';
      if (ph.mechanic === 'eclipse' && S.mode === 'idle') S.next = Math.min(S.next, 1.2);
      onEvent('phase', { index: idx, name: r.phaseName, mechanic: r.mechanic, phase: ph });
    }
  }

  // ---------------------------------------------------------------- per frame
  r.step = function step(dt, holding) {
    if (r.done || !(dt > 0)) return;
    dt = Math.min(dt, 0.1);
    r.time += dt;
    updatePhase();
    const ph = phase();
    const mech = ph.mechanic || 'none';
    if (boss && !r.enraged && r.time >= num(boss.enrage, Infinity)) { r.enraged = true; onEvent('enrage', {}); }
    const lastPhase = boss ? r.phaseIndex === phases.length - 1 : true;
    const tireOn = !legendary || (lastPhase && r.P >= num(ph.tireFrom, num(ph.at, 0)));
    const pw = sp.power * (1 - R.tire * r.P * (tireOn ? 1 : 0)) * (r.enraged ? R.enrage.power : 1);
    r.pw = pw;
    stepSurge(dt);
    const surging = r.surge;
    const leaping = surging && r.surgeKind === 'leap';
    const LS = gear.LS;

    // ---- tension
    let target;
    if (leaping) target = holding ? R.leapHold * pw / LS : R.leapRelease;
    else if (holding) target = R.riseBase * pw * (surging ? R.surgeHoldMult * Math.sqrt(str) : 1) / LS;
    else if (surging) target = R.surgeCreep * pw * str / (LS * Math.max(0.1, r.surgeDur));
    else target = -R.fallBase / (0.8 + 0.2 * pw);
    target += sp.erratic * R.jitter * n1(r.time * R.noiseHz);
    if (behavior === 'sinker') target += R.sinkerDrag * pw / LS;
    if (mech === 'drag') target += num(ph.drag, 0.08);
    r.target = target;
    r.vT += (target - r.vT) * (1 - Math.exp(-R.accel * dt));
    r.T = Math.max(0, r.T + r.vT * dt);

    // ---- bands
    const shrink = mech === 'shrink' ? 1 + (num(ph.sweetTo, 0.6) - 1) * clamp((r.P - num(ph.at, 0)) / Math.max(0.01, 1 - num(ph.at, 0)), 0, 1) : 1;
    const w = clamp(gear.sweetZone * sp.sweet * shrink, R.bandMin, R.bandMax);
    if (darterT < 1) { darterT = Math.min(1, darterT + dt / R.darterJumpTime); const e = darterT * darterT * (3 - 2 * darterT); darterOffset = darterFrom + (darterTo - darterFrom) * e; }
    const A = R.bandAmp + R.bandAmpErratic * sp.erratic, om = R.bandOmega + R.bandOmegaErratic * sp.erratic;
    let c = 0.5 + A * Math.sin(om * r.time + phi) + R.bandNoise * sp.erratic * n2(r.time * 0.35)
      + (behavior === 'sinker' ? R.sinkerBand : 0) + darterOffset + (mech === 'drag' ? num(ph.bandOffset, -0.1) : 0);
    c = clamp(c, R.safeMin + w / 2, R.safeMax - w / 2);
    r.c = c; r.w = w; r.sweetMin = c - w / 2; r.sweetMax = c + w / 2;
    const T = r.T;
    let inSweet;
    if (mech === 'brittle') {
      const ws = w * num(ph.shardWidth, 0.6), d = 0.1 + 0.04 * Math.sin(r.time * 0.9 + phi);
      const lo = R.safeMin + ws / 2, hi = R.safeMax - ws / 2;
      const c1 = clamp(c + d, lo, hi), c2 = clamp(c - d, lo, hi);
      if (!r.shards) r.shards = [{ min: 0, max: 0 }, { min: 0, max: 0 }];
      r.shards[0].min = c1 - ws / 2; r.shards[0].max = c1 + ws / 2;
      r.shards[1].min = c2 - ws / 2; r.shards[1].max = c2 + ws / 2;
      inSweet = Math.abs(T - c1) <= ws / 2 || Math.abs(T - c2) <= ws / 2;
    } else {
      r.shards = null;
      inSweet = Math.abs(T - c) <= w / 2;
    }
    if (mech === 'decoy') {
      const wd = w * num(ph.decoyWidth, 1.4);
      let dc = c + decoySide * (w / 2 + wd / 2 + 0.03);
      if (dc - wd / 2 < R.safeMin || dc + wd / 2 > R.safeMax) { decoySide = -decoySide; dc = c + decoySide * (w / 2 + wd / 2 + 0.03); }
      dc = clamp(dc, R.safeMin + wd / 2, R.safeMax - wd / 2);
      r.decoyMin = dc - wd / 2; r.decoyMax = dc + wd / 2;
    } else { r.decoyMin = null; r.decoyMax = null; }
    if (mech === 'flicker') {
      const ev = Math.max(0.5, num(ph.every, 8)), hide = num(ph.hide, 1.5);
      r.bandsHidden = ((r.time - phaseStart) % ev) > ev - hide;
    } else r.bandsHidden = false;
    r.lightMult = mech === 'eclipse' ? num(ph.lightMult, 0.5) : 1;
    r.inSweet = inSweet;

    // ---- progress
    const inSafe = T >= R.safeMin && T <= R.safeMax;
    r.inSafe = inSafe;
    if (holding) r.holdingTime += dt;
    if (holding && inSafe) {
      r.P += dt * gear.RS / sp.stamina * (inSweet ? R.sweetMult : 1);
      r.qHold += dt; if (inSweet) r.qSweet += dt;
    }
    const decayMult = num(ph.decayMult, 1);
    if (T < R.safeMin) r.P -= R.decaySlack * dt * decayMult;
    else if (decayMult > 1 && T > R.safeMax) r.P -= R.decaySlack * dt * decayMult;
    if (surging && !leaping && !holding) r.P -= R.decaySurge * dt;
    if (r.P < 0) r.P = 0;
    if (T > R.dangerLine) r.qOver += dt;

    // ---- outcomes
    if (r.P >= 1) { r.P = 1; finish('landed'); return; }
    const snapAt = mech === 'brittle' ? num(ph.snapAt, 0.92) : R.snapAt;
    r.snapAt = snapAt;
    if (T >= snapAt) { r.snapT += dt; if (r.snapT >= R.snapGrace) { finish('snap'); return; } }
    else r.snapT = 0;
    if (T < R.slackLine) r.slackT += dt; else r.slackT = Math.max(0, r.slackT - R.slackDecay * dt);
    if (r.slackT >= gear.slackTime) {
      if (boss?.noSlackEscape && !ph.slackEscapes) {
        const dive = boss.slackDive || {};
        r.P = Math.max(0, r.P + num(dive.progress, -0.12));
        r.T = num(dive.tension, 0.35); r.vT = 0; r.slackT = 0;
        onEvent('dive', {});
      } else { finish('slack'); return; }
    }
    r.danger = Math.max(smooth(R.dangerFrom, 1, r.T), clamp(r.slackT / gear.slackTime, 0, 1));
  };

  function finish(result) {
    r.done = true; r.result = result;
    r.surge = false; r.surgeWarn = 0;
    onEvent(result, {});
  }

  /** Debug/test: start the next surge warning now. */
  r.forceSurge = function forceSurge() { if (!r.done && S.mode === 'idle') S.next = 0; };
  r.spike = function spike(dT = 0.25) { if (!r.done) { r.T += dT; r.vT = Math.max(r.vT, 0.4); } };
  r.setGear = function setGear(g = {}) {
    if (Number.isFinite(g.LS)) gear.LS = Math.max(0.2, g.LS);
    if (Number.isFinite(g.RS)) gear.RS = Math.max(0.05, g.RS);
    if (Number.isFinite(g.sweetZone)) gear.sweetZone = Math.max(0.01, g.sweetZone);
    if (Number.isFinite(g.slackTime)) gear.slackTime = Math.max(0.2, g.slackTime);
  };
  /** Quality score from reel performance (DESIGN §5.8, before spot/bait/relic bonuses). */
  r.qualityScore = function qualityScore(Q = {}) {
    return r.qSweet / Math.max(1, r.qHold) + (opts.perfect ? num(Q.perfectHookBonus, 0.15) : 0) - num(Q.overDangerPenalty, 0.10) * r.qOver;
  };
  r.stamina = sp.stamina;
  r.species = sp;
  return r;
}
