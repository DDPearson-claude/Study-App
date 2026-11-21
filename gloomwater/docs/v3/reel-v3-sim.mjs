// tools/out/pivot/reel-v3-sim.mjs — BRIEF-v3 (final) reel numbers.
// A copy of angler-sim.mjs's fight loop changed to match the tackle and rules the brief specifies:
//   - tackle is per slot: Rod (slack grace, shock, hook window, +1 pip at T3+), Line (strength),
//     Reel (reel speed, sweet band, drag absorb). Any mixed loadout can be simulated.
//   - size scaling g = e^(0.2 z): power × g^1.6 (sinkers/sulkers 1.15), stamina × g, and ABOVE the Elder
//     cut (z > 2.65) power × g^(base + ELDER_PEXP·(z − 2.65)) and stamina × g^1.3
//   - fatigue clock after 60 s: pw × max(floor, 1 − 0.01·(t − 60)), floor 0.6 (Elders 0.8)
//   - every Elder plays one "old trick": when progress first passes 0.55, an unwarned-ish surge
//     (warning × 0.6, power × 1.2) of its style (pull, or a second leap for leapers)
//   - hook-hold pips (Prize+ only): perfect hook 3, normal 2, Rod T3+ +1; one pip lost each time tension
//     falls below 0.15 during a surge or leap; 0 pips = thrown hook (no "light hook" multiplier)
//   - NO net check (the brief cut the net QTE)
//   - easing by load (target = −0.55 / (0.8 + 0.2·pw/LS)), drag slip above dragAt (Set 0.80)
// Not simulated: runner and sulker surge kinds (P3/P4 work item T1), foul windows, signs, μ.
// Run from gloomwater/:  node tools/out/pivot/reel-v3-sim.mjs [--k 240] [--epx 0.8]
import { SPECIES, BALANCE } from '../../../src/data.js';
import { SKILLS } from '../../sim/model.mjs';

const R = BALANCE.reel;
const DT = 1 / 30;
const args = process.argv.slice(2);
const arg = (name, def) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : def; };
const K = arg('--k', 240);
const ELDER_PEXP = arg('--epx', 0.8);
// per-lake Elder age (extra power exponent per z above the Elder cut): old water keeps its oldest fish hard
const EPXL = (() => { const i = args.indexOf('--epxl'); return i >= 0 ? args[i + 1].split(',').map(Number) : [1.2, 0.9, 0.7, 0.35]; })();
const ZI = { mossmere: 0, sporewood: 1, glasswater: 2, paleabyss: 3 };
export const elderAge = (zone) => (EPXL ? EPXL[ZI[zone] ?? 0] : ELDER_PEXP);
const ELDER_SEXP = arg('--esx', 1.3);
const TRICK_POWER = arg('--trick', 1.3);
const ELDER_FLOOR = arg('--floor', 0.8);
const ELDER_STEP = arg('--estep', 1.08);
const TRICK_MIXED = arg('--tmix', 1) > 0;
const TRICK_DOUBLE = arg('--tdbl', 1) > 0;

export const SIZE = { gPerZ: 0.2, erraticPerZ: 0.08, surgeEveryExp: -0.6, staminaBase: 1.4, powerExp: 1.6, powerExpBy: { sinker: 1.15 }, elderZ: 2.65 };
export const CLASSES = [
  { id: 'small', label: 'Small', z: -0.8, ci: 0 },
  { id: 'keeper', label: 'Keeper', z: 0.4, ci: 1 },
  { id: 'prize', label: 'Prize', z: 1.4, ci: 2 },
  { id: 'trophy', label: 'Trophy', z: 2.2, ci: 3 },
  { id: 'elder', label: 'Elder', z: 2.95, ci: 4 },
  { id: 'ancient', label: 'Ancient', z: 3.35, ci: 4 },
];
export const ROD = [
  { slack: 1.4, shock: 0.00, hook: 1.00, pip: 0 },
  { slack: 1.6, shock: 0.08, hook: 1.04, pip: 0 },
  { slack: 1.8, shock: 0.15, hook: 1.08, pip: 0 },
  { slack: 2.0, shock: 0.22, hook: 1.12, pip: 1 },
  { slack: 2.2, shock: 0.30, hook: 1.16, pip: 1 },
];
export const LINE = [{ LS: 1.00 }, { LS: 1.15 }, { LS: 1.32 }, { LS: 1.52 }, { LS: 1.75, slack: 0.2 }];
export const REEL = [
  { RS: 1.00, SZ: 0.16, dragQ: 0.30 }, { RS: 1.12, SZ: 0.17, dragQ: 0.45 }, { RS: 1.25, SZ: 0.18, dragQ: 0.58 },
  { RS: 1.40, SZ: 0.19, dragQ: 0.68 }, { RS: 1.55, SZ: 0.20, dragQ: 0.76 },
];
export function loadout(rod, line = rod, reel = rod) {
  const r = ROD[rod], l = LINE[line], e = REEL[reel];
  return { id: `R${rod}L${line}E${reel}`, rodTier: rod, LS: l.LS, RS: e.RS, SZ: e.SZ, dragQ: e.dragQ, slackTime: r.slack + (l.slack || 0), shock: r.shock, hook: r.hook, pipBonus: r.pip };
}
const DRAG_AT = 0.80, SLIP_LOSS = 0.08;
const SK = {
  novice: { reel: { ...SKILLS.average.reel }, perfect: 0.30 },
  skilled: { reel: { ...SKILLS.skilled.reel }, perfect: 0.60 },
  expert: { reel: { rt: 0.11, noise: 0.015, warnNotice: 0.99, leapMisread: 0.03, mixedMisread: 0.05, decoyFooled: 0.05, lapseRate: 0.004, lapseTime: 0.25, panicAt: 0.88, sweetTrack: 0.99, bandHalf: 0.04 }, perfect: 0.80 },
};

export function scaleDifficulty(d, beh, z, zone) {
  const g = Math.exp(SIZE.gPerZ * z);
  const pBase = SIZE.powerExpBy[beh] ?? SIZE.powerExp;
  const over = Math.max(0, z - SIZE.elderZ);
  const out = { ...d };
  out.power = d.power * g ** (pBase + elderAge(zone) * over) * (over > 0 ? ELDER_STEP : 1);
  out.stamina = d.stamina * SIZE.staminaBase * g ** (over > 0 ? ELDER_SEXP : 1.0);
  out.surgeTime = d.surgeTime * g ** 0.5;
  out.sweet = Math.max(0.4, d.sweet * g ** -0.5);
  out.erratic = Math.min(0.9, d.erratic + SIZE.erraticPerZ * Math.max(0, z));
  out.surgeEvery = d.surgeEvery * g ** SIZE.surgeEveryExp;
  const warn = beh === 'darter' ? R.darterWarn : Math.max(R.warnMin, R.warnBase - R.warnErratic * d.erratic);
  out.surgeEvery = Math.max(out.surgeEvery, (out.surgeTime + warn) / R.dutyCap);
  return out;
}

function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function makeNoise(rng, hz) { const pts = []; return (t) => { const x = t * hz, i = Math.floor(x), f = x - i; while (pts.length <= i + 1) pts.push(rng() * 2 - 1); const s = f * f * (3 - 2 * f); return pts[i] * (1 - s) + pts[i + 1] * s; }; }
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const U = (rng, a, b) => a + (b - a) * rng();
const gauss = (rng) => { let u = 0; while (u === 0) u = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); };

export function fight(sp, d, g, skill, cls, z, rng) {
  const boss = sp.rarity === 'legendary' ? sp.boss : null;
  const beh = sp.behavior, sk = skill.reel;
  const elder = !boss && z > SIZE.elderZ;
  const str = R.strength[beh] ?? 1;
  const noise1 = makeNoise(rng, R.noiseHz), noise2 = makeNoise(rng, 0.7);
  const phi = rng() * Math.PI * 2;
  const A = R.bandAmp + R.bandAmpErratic * d.erratic, om = R.bandOmega + R.bandOmegaErratic * d.erratic;
  const baseWarn = beh === 'darter' ? R.darterWarn : Math.max(R.warnMin, R.warnBase - R.warnErratic * d.erratic);
  const perfect = rng() < Math.min(0.95, skill.perfect * g.hook);
  const usePips = cls >= 2 && !boss;
  let pips = usePips ? (perfect ? 3 : 2) + g.pipBonus : 99;
  const holdMult = R.surgeHoldMult * (1 - g.shock);
  let T = R.startTension, vT = 0, P = perfect ? R.perfectProgress : R.startProgress;
  let slackT = 0, snapT = 0, t = 0, darterOff = 0, darterGoal = 0, holding = true, slipped = 0, wasLow = false;
  let surgeStartT = 0, sState = 'idle', sTimer = 0, sLen = 0, sKind = 'pull', pendingDouble = false;
  let trickDone = !elder, trickSurge = false;
  const warnFor = (en) => (en ? Math.max(R.enrage.warnFloor, baseWarn - R.enrage.warnCut) : baseWarn);
  const everyFor = (en) => Math.max(d.surgeEvery * (en ? R.enrage.surgeEvery : 1), (d.surgeTime + warnFor(en)) / R.dutyCap);
  let nextSurge = everyFor(false) * U(rng, ...R.surgeJitter) + R.firstSurgeDelay + (perfect ? R.perfectSurgeDelay : 0);
  const hist = []; const delaySteps = Math.max(1, Math.round(sk.rt / DT));
  let noticed = false, noticeAt = 0, readLeap = true, lapseUntil = -1, trackingDecoy = false, trackSweet = true, trackRollAt = 0;
  while (t < 300) {
    const enraged = !!(boss && t > boss.enrage);
    let ph = null; if (boss) for (const p of boss.phases) if (P >= p.at) ph = p;
    const lastPhase = boss ? ph === boss.phases[boss.phases.length - 1] : true;
    const tireOn = !boss || (lastPhase && (ph.tireFrom == null || P >= ph.tireFrom));
    const mech = ph?.mechanic || 'none';
    const fatigue = boss ? 1 : t > 60 ? Math.max(elder ? ELDER_FLOOR : 0.6, 1 - 0.01 * (t - 60)) : 1;
    let pw = d.power * (1 - R.tire * P * (tireOn ? 1 : 0)) * (enraged ? R.enrage.power : 1) * fatigue;
    if (trickSurge && sState !== 'idle') pw *= TRICK_POWER;
    let shrink = 1;
    if (mech === 'shrink') shrink = 1 - (1 - (ph.sweetTo ?? 0.6)) * Math.min(1, (P - ph.at) / Math.max(0.01, 1 - ph.at));
    if (mech === 'brittle') shrink = ph.shardWidth ?? 0.6;
    const w = clamp(g.SZ * d.sweet * shrink, R.bandMin, R.bandMax);
    let c = 0.5 + A * Math.sin(om * t + phi) + R.bandNoise * d.erratic * noise2(t) + (beh === 'sinker' ? R.sinkerBand : 0) + darterOff;
    if (mech === 'drag') c += ph.bandOffset ?? -0.1;
    c = clamp(c, R.safeMin + w / 2, R.safeMax - w / 2);
    if (mech === 'brittle') { const c2 = clamp(1 - c, R.safeMin + w / 2, R.safeMax - w / 2); if (Math.abs(T - c2) < Math.abs(T - c)) c = c2; }
    const hidden = mech === 'flicker' && (t % (ph.every ?? 8)) > (ph.every ?? 8) - (ph.hide ?? 1.5);
    const startTrick = !trickDone && P >= 0.55 && sState === 'idle';
    if (sState === 'idle' && (t >= nextSurge || startTrick)) {
      trickSurge = startTrick; if (startTrick) trickDone = true;
      sState = 'warn'; sTimer = warnFor(enraged) * (trickSurge ? 0.6 : 1);
      sKind = beh === 'leaper' ? 'leap' : 'pull';
      const mixed = mech === 'mixedSurge' || mech === 'eclipse' || (trickSurge && TRICK_MIXED);
      if (mixed) sKind = rng() < 0.5 ? 'leap' : 'pull';
      noticed = rng() < sk.warnNotice; noticeAt = t + sk.rt + 0.05;
      const misreadP = mixed ? sk.mixedMisread : (sKind === 'leap' ? sk.leapMisread : 0.02);
      readLeap = rng() >= misreadP;
      if (mech === 'decoy' && ph.swapOnSurge) trackingDecoy = rng() < sk.decoyFooled;
    } else if (sState === 'warn') {
      sTimer -= DT;
      if (sTimer <= 0) { sState = 'surge'; surgeStartT = t; sLen = d.surgeTime * U(rng, ...R.surgeLenJitter); sTimer = sLen; }
    } else if (sState === 'surge') {
      sTimer -= DT;
      if (sTimer <= 0) {
        const wasTrick = trickSurge; sState = 'idle'; trickSurge = false;
        if (beh === 'darter') darterGoal = (rng() < 0.5 ? -1 : 1) * U(rng, ...R.darterJump);
        if ((mech === 'doubleSurge' || (wasTrick && TRICK_DOUBLE)) && !pendingDouble) { pendingDouble = true; nextSurge = t + (ph?.gap ?? 0.9); }
        else { pendingDouble = false; nextSurge = t + everyFor(enraged) * U(rng, ...R.surgeJitter); }
      }
    }
    darterOff += (darterGoal - darterOff) * Math.min(1, DT / R.darterJumpTime);
    const leaping = sState === 'surge' && sKind === 'leap';
    hist.push([T, c]);
    const [Tseen0, cseen] = hist.length > delaySteps ? hist[hist.length - 1 - delaySteps] : hist[0];
    if (hist.length > 64) hist.shift();
    const Tseen = Tseen0 + gauss(rng) * sk.noise;
    if (t > lapseUntil && rng() < sk.lapseRate * DT) lapseUntil = t + sk.lapseTime;
    if (t > lapseUntil) {
      const inWarn = sState === 'warn', inSurge = sState === 'surge';
      const knows = noticed && t >= noticeAt;
      const lateSeen = inSurge && (t - surgeStartT) > sk.rt + 0.2;
      const believed = readLeap ? sKind : (sKind === 'leap' ? 'pull' : 'leap');
      let decided = false;
      if ((inWarn && knows) || (inSurge && (knows || lateSeen))) {
        if (believed === 'pull') { holding = false; decided = true; } else if (inSurge) { holding = !(Tseen > 0.85); decided = true; }
      }
      if (!decided) {
        if (Tseen > sk.panicAt) holding = false;
        else {
          if (t >= trackRollAt) { trackSweet = rng() < sk.sweetTrack; trackRollAt = t + 1.5; }
          const goal = hidden || !trackSweet ? 0.5 : cseen;
          const half = Math.max(0.03, Math.min(sk.bandHalf, w * 0.45));
          if (holding && Tseen > goal + half) holding = false; else if (!holding && Tseen < goal - half) holding = true;
        }
      }
    }
    let target;
    if (leaping) target = holding ? R.leapHold * pw / g.LS : R.leapRelease;
    else if (holding) target = R.riseBase * pw * (sState === 'surge' ? holdMult * Math.sqrt(str) : 1) / g.LS;
    else if (sState === 'surge') target = R.surgeCreep * pw * str / (g.LS * Math.max(0.3, sLen));
    else target = -R.fallBase / (0.8 + 0.2 * pw / g.LS);
    target += d.erratic * R.jitter * noise1(t);
    if (beh === 'sinker') target += R.sinkerDrag * pw / g.LS;
    if (mech === 'drag') target += ph.drag ?? 0.08;
    vT += (target - vT) * (1 - Math.exp(-R.accel * DT));
    let dT = vT * DT;
    if (T > DRAG_AT && dT > 0) { const ab = dT * g.dragQ; dT -= ab; P -= SLIP_LOSS * ab; slipped += ab; }
    T = Math.max(0, T + dT);
    const inSafe = T >= R.safeMin && T <= R.safeMax;
    const inSweet = Math.abs(T - c) <= w / 2 && !(mech === 'decoy' && trackingDecoy);
    if (holding && inSafe) P += DT * g.RS / d.stamina * (inSweet ? R.sweetMult : 1);
    const decayMult = mech === 'shrink' && ph.decayMult ? ph.decayMult : 1;
    if (T < R.safeMin) P -= R.decaySlack * DT * decayMult;
    if (sState === 'surge' && !leaping && !holding) P -= R.decaySurge * DT;
    // hook-hold pips: lose one each time tension drops below 0.15 during a surge or leap
    const low = T < 0.15 && sState === 'surge';
    if (usePips && low && !wasLow) { pips--; if (pips <= 0) return { landed: false, reason: 'pips', time: t }; }
    wasLow = low;
    if (P <= 0 && slipped > 0.5) return { landed: false, reason: 'spooled', time: t };
    P = Math.max(0, P);
    const snapAt = mech === 'brittle' ? (ph.snapAt ?? 0.92) : R.snapAt;
    if (T >= snapAt) { snapT += DT; if (snapT >= R.snapGrace) return { landed: false, reason: 'snap', time: t, P }; } else snapT = 0;
    if (T < R.slackLine) slackT += DT; else slackT = Math.max(0, slackT - R.slackDecay * DT);
    if (slackT >= g.slackTime) {
      const noEscape = boss?.noSlackEscape && !(ph?.slackEscapes);
      if (noEscape) { P = Math.max(0, P + (boss.slackDive?.progress ?? -0.12)); T = boss.slackDive?.tension ?? 0.35; vT = 0; slackT = 0; }
      else return { landed: false, reason: 'thrown', time: t, P };
    }
    if (P >= 1) return { landed: true, time: t + R.landingTime };
    t += DT;
  }
  return { landed: false, reason: 'timeout', time: t };
}

export function cell(sp, z, g, skillId, ci, k = K) {
  const d = scaleDifficulty(sp.difficulty, sp.behavior, sp.rarity === 'legendary' ? 0 : z, sp.zone);   // legends: z 0 (only the global stamina × 1.4 applies)
  const skill = SK[skillId];
  let s = 0; for (const ch of sp.id + skillId + g.id + z) s = (s * 31 + ch.charCodeAt(0)) | 0;
  const rng = mul(s);
  let land = 0, time = 0; const why = {};
  for (let i = 0; i < k; i++) { const r = fight(sp, d, g, skill, ci, z, rng); if (r.landed) { land++; time += r.time; } else why[r.reason] = (why[r.reason] || 0) + 1; }
  return { p: land / k, time: land ? time / land : NaN, why };
}

const pct = (v) => `${Math.round(v * 100)}`;
const zones = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
export const REFERENCE = { mossmere: 'reedjaw_pike', sporewood: 'mildew_angler', glasswater: 'mirror_pike', paleabyss: 'gilt_eyed_eel' };

if (args.includes('--species')) {
  const sp = SPECIES.find((s) => s.id === args[args.indexOf('--species') + 1]);
  for (let t = 0; t <= 4; t++) console.log(`T${t}`, CLASSES.map((c) => { const r = cell(sp, c.z, loadout(t), 'skilled', c.ci); return `${c.label} ${pct(r.p)}% ${Number.isFinite(r.time) ? r.time.toFixed(0) + 's' : '-'}`; }).join(' · '));
} else if (args.includes('--gate')) {
  // reference species per lake, skilled, matched sets: Prize/Trophy/Elder/Ancient
  console.log('| reference species | T0 | T1 | T2 | T3 | T4 |');
  for (const zid of zones) {
    const sp = SPECIES.find((s) => s.id === REFERENCE[zid]);
    const row = [0, 1, 2, 3, 4].map((t) => [2, 3, 4, 5].map((c) => pct(cell(sp, CLASSES[c].z, loadout(t), 'skilled', CLASSES[c].ci).p)).join('/'));
    console.log(`| ${sp.name} (${zid}) | ${row.join(' | ')} |`);
  }
  for (const sp of SPECIES.filter((s) => s.rarity === 'legendary')) {
    const row = [0, 1, 2, 3, 4].map((t) => ['novice', 'skilled', 'expert'].map((k) => pct(cell(sp, 0, loadout(t), k, 0).p)).join('/'));
    console.log(`| ${sp.name} (legend) | ${row.join(' | ')} |`);
  }
  const lev = SPECIES.find((s) => s.rarity === 'legendary' && s.zone === 'paleabyss');
  for (const [r, l, e] of [[3, 4, 3], [4, 4, 3], [3, 4, 4]]) {
    const g = loadout(r, l, e);
    console.log(`| Leviathan on ${g.id} | ${['novice', 'skilled', 'expert'].map((k) => pct(cell(lev, 0, g, k, 0).p)).join('/')} |`);
  }
} else if (args.includes('--elders')) {
  // every non-legend species, skilled: Elder and Ancient on T(i), T(i+1), T4
  for (const [zi, zid] of zones.entries()) {
    for (const sp of SPECIES.filter((s) => s.zone === zid && s.rarity !== 'legendary')) {
      const row = [zi, Math.min(4, zi + 1), 4].map((t) => `T${t} ${pct(cell(sp, 2.95, loadout(t), 'skilled', 4).p)}/${pct(cell(sp, 3.35, loadout(t), 'skilled', 4).p)}`);
      console.log(zid, sp.id, row.join(' · '));
    }
  }
} else if (args.includes('--rating')) {
  // tackle rating: largest class the fitted matched set lands >= 50% (skilled) vs the lake's reference species
  const names = ['Small', 'Keeper', 'Prize', 'Trophy', 'Elder'];
  console.log('| set | ' + zones.join(' | ') + ' |');
  for (let t = 0; t <= 4; t++) {
    const cells = zones.map((zid) => {
      const sp = SPECIES.find((s) => s.id === REFERENCE[zid]);
      let best = 'none';
      for (const c of [0, 1, 2, 3, 4]) { if (cell(sp, CLASSES[c].z, loadout(t), 'skilled', CLASSES[c].ci).p >= 0.5) best = names[c]; else break; }
      return best;
    });
    console.log(`| T${t} | ${cells.join(' | ')} |`);
  }
} else {
  // per lake group averages: arrival tackle T(i) and on-curve T(i+1); classes × novice/skilled/expert
  for (let zi = 0; zi < 4; zi++) {
    const sps = SPECIES.filter((s) => s.zone === zones[zi] && s.rarity !== 'legendary');
    for (const t of (zi === 0 ? [0, 1, 4] : [zi, Math.min(4, zi + 1), 4])) {
      const g = loadout(t);
      for (const rar of ['common', 'uncommon', 'rare']) {
        const group = sps.filter((s) => s.rarity === rar);
        const row = CLASSES.map((c) => ['novice', 'skilled', 'expert'].map((k) => { let p = 0; for (const sp of group) p += cell(sp, c.z, g, k, c.ci).p; return pct(p / group.length); }).join('/'));
        console.log(`| ${zones[zi]} | T${t} | ${rar} | ${row.join(' | ')} |`);
      }
    }
  }
}
