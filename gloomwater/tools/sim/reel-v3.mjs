#!/usr/bin/env node
// LEGACY (2026-11-05). v3 fishing is AUTOMATIC: one land chance per hooked fish from tools/sim/catch-v3.mjs / data.catchChance
// (DESIGN §25.6, the user's direction). This manual tension-reel sim no longer gates any v3 number (land rates, the gear gate,
// the tackle rating, §25.6.9). It is kept only (a) as the history of the manual v3 reel that the P1 build still runs until the AF
// build removes it, and (b) beside tools/sim/reel.mjs as the reference for the v1 hold-to-reel game, which stays bit-identical
// with V3_ENABLED off. validate-data still runs its Ancient-length check while BALANCE_V3.size.reel exists; AF retires both.
// tools/sim/reel-v3.mjs — the v3 reel sim (BRIEF-v3 §5.5–§5.9; T1). Port of tools/out/pivot/reel-v3-sim.mjs that
// reads every number from src/data.js instead of private copies:
//   tackle tiers per slot      TACKLE.rod / line / reel (slackTime, shock, hookWindow, pips; lineStrength, slackAdd;
//                              reelSpeed, sweetZone, absorb) — any mixed loadout can be simulated
//   size → fight               BALANCE_V3.size.fight (g = e^(0.2 z): power × g^1.6 (sinkers/sulkers 1.15), stamina × g,
//                              above the Elder cut power × 1.08 × g^(1.6 + age·(z − 2.65)), stamina × g^1.3)
//   reel edits                 BALANCE_V3.size.reel (stamina × 1.4, easing by load, the fatigue clock with the Elder floor
//                              0.8, one old trick per Elder at 55% progress: warning × 0.6, power × 1.3, a second surge 0.9 s later)
//   hook-hold pips             BALANCE_V3.bite.pips (Prize+: perfect 3, normal 2, Rod T3+ +1; one lost per surge dip below 0.15)
//   drag                       TACKLE.drag (Set 0.80, slip loss 0.08); the class z per class from BALANCE_V3.size.simZ
//   the reel core              BALANCE.reel (unchanged v1 tension model)
// Not simulated yet: runner (P3) and sulker (P4) surge kinds, foul windows, signs, μ. No net check (cut).
//
// Run from gloomwater/:
//   node tools/sim/reel-v3.mjs                 lake tables (arrival T(i), curve T(i+1), T4) × classes × novice/skilled/expert
//   node tools/sim/reel-v3.mjs --gate          reference species P/T/E/A on matched T0–T4 + legends   (brief §5.6: --k 400)
//   node tools/sim/reel-v3.mjs --rating        matched-set tackle rating per lake
//   node tools/sim/reel-v3.mjs --elders        every species' Elder / Ancient on T(i), T(i+1), T4
//   node tools/sim/reel-v3.mjs --species id    one species, every class, T0–T4
//   node tools/sim/reel-v3.mjs --write-rating [--apply]   BALANCE.tackleRating: 125 loadouts × 4 lakes (default --k 400);
//                                              --apply writes it into src/data.js between the @tackleRating markers
// Options: --k N (fights per cell, default 240) · --roster v1|v3 (default v1 = today's 32 species, which is what the
// brief's tables were run on; v3 = the 53-species roster) · overrides --epxl a,b,c,d --esx --trick --floor --estep --tmix 0|1 --tdbl 0|1
// Outputs are deterministic: every cell seeds its own RNG from (species, skill, loadout, z).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as D from '../../src/data.js';
import { SKILLS } from './model.mjs';

const R = D.BALANCE.reel;
const S3 = D.BALANCE_V3.size, F3 = S3.fight, RE = S3.reel, PIPS = D.BALANCE_V3.bite.pips;
const DT = 1 / 30;
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const arg = (name, def) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : def; };
const K = arg('--k', has('--write-rating') ? 400 : 240);
const ROSTER = (() => { const i = args.indexOf('--roster'); return i >= 0 ? args[i + 1] : 'v1'; })();
export const SPECIES = ROSTER === 'v3' ? D.SPECIES_V3 : D.SPECIES;
const ZONES = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
const EPXL = (() => { const i = args.indexOf('--epxl'); return i >= 0 ? args[i + 1].split(',').map(Number) : ZONES.map((z) => F3.elderAge[z]); })();
export const elderAge = (zone) => EPXL[Math.max(0, ZONES.indexOf(zone))];
const ELDER_SEXP = arg('--esx', F3.elderStaminaExp);
const TRICK_POWER = arg('--trick', RE.oldTrick.powerMult);
const TRICK_WARN = RE.oldTrick.warnMult, TRICK_AT = RE.oldTrick.at, TRICK_GAP = RE.oldTrick.secondAfter;
const ELDER_FLOOR = arg('--floor', RE.fatigue.elderFloor);
const ELDER_STEP = arg('--estep', F3.elderStep);
const TRICK_MIXED = arg('--tmix', RE.oldTrick.mixedRead ? 1 : 0) > 0;
const TRICK_DOUBLE = arg('--tdbl', 1) > 0;
const FAT = RE.fatigue;

export const CLASSES = [
  { id: 'small', label: 'Small', z: S3.simZ.small, ci: 0 },
  { id: 'keeper', label: 'Keeper', z: S3.simZ.keeper, ci: 1 },
  { id: 'prize', label: 'Prize', z: S3.simZ.prize, ci: 2 },
  { id: 'trophy', label: 'Trophy', z: S3.simZ.trophy, ci: 3 },
  { id: 'elder', label: 'Elder', z: S3.simZ.elder, ci: 4 },
  { id: 'ancient', label: 'Ancient', z: S3.simZ.ancient, ci: 4 },
];
const PIP_FROM = CLASSES.find((c) => c.id === PIPS.fromClass).ci;
export function loadout(rod, line = rod, reel = rod) {
  const r = D.TACKLE.rod[rod], l = D.TACKLE.line[line], e = D.TACKLE.reel[reel];
  return { id: `R${rod}L${line}E${reel}`, rodTier: rod, LS: l.lineStrength, RS: e.reelSpeed, SZ: e.sweetZone, dragQ: e.absorb,
    slackTime: r.slackTime + (l.slackAdd || 0), shock: r.shock, hook: r.hookWindow, pipBonus: r.pips };
}
const DRAG_AT = D.TACKLE.drag.presets[D.TACKLE.drag.fixed], SLIP_LOSS = D.TACKLE.drag.slipLoss;
export const SK = {
  novice: { reel: { ...SKILLS.average.reel }, perfect: 0.30 },
  skilled: { reel: { ...SKILLS.skilled.reel }, perfect: 0.60 },
  expert: { reel: { rt: 0.11, noise: 0.015, warnNotice: 0.99, leapMisread: 0.03, mixedMisread: 0.05, decoyFooled: 0.05, lapseRate: 0.004, lapseTime: 0.25, panicAt: 0.88, sweetTrack: 0.99, bandHalf: 0.04 }, perfect: 0.80 },
};

/** species.difficulty scaled by size before createReel (brief §5.5). */
export function scaleDifficulty(d, beh, z, zone) {
  const g = Math.exp(F3.gPerZ * z);
  const pBase = F3.powerExpBy[beh] ?? F3.powerExp;
  const over = Math.max(0, z - F3.elderZ);
  const out = { ...d };
  out.power = d.power * g ** (pBase + elderAge(zone) * over) * (over > 0 ? ELDER_STEP : 1);
  out.stamina = d.stamina * RE.staminaMult * g ** (over > 0 ? ELDER_SEXP : F3.staminaExp);
  out.surgeTime = d.surgeTime * g ** F3.surgeTimeExp;
  out.sweet = Math.max(F3.sweetMin, d.sweet * g ** F3.sweetExp);
  out.erratic = Math.min(F3.erraticMax, d.erratic + F3.erraticPerZ * Math.max(0, z));
  out.surgeEvery = d.surgeEvery * g ** F3.surgeEveryExp;
  const warn = beh === 'darter' ? R.darterWarn : Math.max(R.warnMin, R.warnBase - R.warnErratic * d.erratic);
  out.surgeEvery = Math.max(out.surgeEvery, (out.surgeTime + warn) / R.dutyCap);
  return out;
}

function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function makeNoise(rng, hz) { const pts = []; return (t) => { const x = t * hz, i = Math.floor(x), f = x - i; while (pts.length <= i + 1) pts.push(rng() * 2 - 1); const s = f * f * (3 - 2 * f); return pts[i] * (1 - s) + pts[i + 1] * s; }; }
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const U = (rng, a, b) => a + (b - a) * rng();
const gauss = (rng) => { let u = 0; while (u === 0) u = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); };

/** One fight. Returns {landed, time, reason?}. */
export function fight(sp, d, g, skill, cls, z, rng) {
  const boss = sp.rarity === 'legendary' ? sp.boss : null;
  const beh = sp.behavior, sk = skill.reel;
  const elder = !boss && z > F3.elderZ;
  const str = R.strength[beh] ?? 1;
  const noise1 = makeNoise(rng, R.noiseHz), noise2 = makeNoise(rng, 0.7);
  const phi = rng() * Math.PI * 2;
  const A = R.bandAmp + R.bandAmpErratic * d.erratic, om = R.bandOmega + R.bandOmegaErratic * d.erratic;
  const baseWarn = beh === 'darter' ? R.darterWarn : Math.max(R.warnMin, R.warnBase - R.warnErratic * d.erratic);
  const perfect = rng() < Math.min(0.95, skill.perfect * g.hook);
  const usePips = cls >= PIP_FROM && !boss;
  let pips = usePips ? (perfect ? PIPS.perfect : PIPS.normal) + g.pipBonus : 99;
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
    const fatigue = boss ? 1 : t > FAT.after ? Math.max(elder ? ELDER_FLOOR : FAT.floor, 1 - FAT.perS * (t - FAT.after)) : 1;
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
    const startTrick = !trickDone && P >= TRICK_AT && sState === 'idle';
    if (sState === 'idle' && (t >= nextSurge || startTrick)) {
      trickSurge = startTrick; if (startTrick) trickDone = true;
      sState = 'warn'; sTimer = warnFor(enraged) * (trickSurge ? TRICK_WARN : 1);
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
        if ((mech === 'doubleSurge' || (wasTrick && TRICK_DOUBLE)) && !pendingDouble) { pendingDouble = true; nextSurge = t + (ph?.gap ?? TRICK_GAP); }
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
    else target = -R.fallBase / (RE.easeByLoad.base + RE.easeByLoad.perLoad * pw / g.LS);
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
    const low = T < PIPS.lowTension && sState === 'surge';
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

/** k fights of one species at size z on loadout g. Legends fight at z 0 (only the global stamina × 1.4 applies). */
export function cell(sp, z, g, skillId, ci, k = K) {
  const d = scaleDifficulty(sp.difficulty, sp.behavior, sp.rarity === 'legendary' ? F3.legendZ : z, sp.zone);
  const skill = SK[skillId];
  let s = 0; for (const ch of sp.id + skillId + g.id + z) s = (s * 31 + ch.charCodeAt(0)) | 0;
  const rng = mul(s);
  let land = 0, time = 0; const why = {};
  for (let i = 0; i < k; i++) { const r = fight(sp, d, g, skill, ci, z, rng); if (r.landed) { land++; time += r.time; } else why[r.reason] = (why[r.reason] || 0) + 1; }
  return { p: land / k, time: land ? time / land : NaN, why };
}

const pct = (v) => `${Math.round(v * 100)}`;
export const REFERENCE = D.TACKLE.reference;
const byId = (id) => SPECIES.find((s) => s.id === id);
/** Largest class landed ≥ 50% (skilled) vs a species on a loadout, and the next class's land %. */
export function rate(sp, g, k = K) {
  let best = -1, next = 0;
  for (const c of [0, 1, 2, 3, 4]) {
    const p = cell(sp, CLASSES[c].z, g, 'skilled', CLASSES[c].ci, k).p;
    if (p >= 0.5) { best = c; if (c === 4) next = Math.round(p * 100); }   // rated Elder: report the Elder land % itself
    else { next = Math.round(p * 100); break; }
  }
  return [best, next];
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
function main() {
  if (has('--species')) {
    const sp = byId(args[args.indexOf('--species') + 1]);
    for (let t = 0; t <= 4; t++) console.log(`T${t}`, CLASSES.map((c) => { const r = cell(sp, c.z, loadout(t), 'skilled', c.ci); return `${c.label} ${pct(r.p)}% ${Number.isFinite(r.time) ? r.time.toFixed(0) + 's' : '-'}`; }).join(' · '));
  } else if (has('--gate')) {
    console.log('| reference species | T0 | T1 | T2 | T3 | T4 |');
    for (const zid of ZONES) {
      const sp = byId(REFERENCE[zid]);
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
  } else if (has('--elders')) {
    for (const [zi, zid] of ZONES.entries()) {
      for (const sp of SPECIES.filter((s) => s.zone === zid && s.rarity !== 'legendary')) {
        const row = [zi, Math.min(4, zi + 1), 4].map((t) => `T${t} ${pct(cell(sp, CLASSES[4].z, loadout(t), 'skilled', 4).p)}/${pct(cell(sp, CLASSES[5].z, loadout(t), 'skilled', 4).p)}`);
        console.log(zid, sp.id, row.join(' · '));
      }
    }
  } else if (has('--rating')) {
    const names = ['Small', 'Keeper', 'Prize', 'Trophy', 'Elder'];
    console.log('| set | ' + ZONES.join(' | ') + ' |');
    for (let t = 0; t <= 4; t++) {
      const cells = ZONES.map((zid) => {
        const sp = byId(REFERENCE[zid]);
        let best = 'none';
        for (const c of [0, 1, 2, 3, 4]) { if (cell(sp, CLASSES[c].z, loadout(t), 'skilled', CLASSES[c].ci).p >= 0.5) best = names[c]; else break; }
        return best;
      });
      console.log(`| T${t} | ${cells.join(' | ')} |`);
    }
  } else if (has('--write-rating')) {
    writeRating();
  } else {
    for (let zi = 0; zi < 4; zi++) {
      const sps = SPECIES.filter((s) => s.zone === ZONES[zi] && s.rarity !== 'legendary');
      for (const t of (zi === 0 ? [0, 1, 4] : [zi, Math.min(4, zi + 1), 4])) {
        const g = loadout(t);
        for (const rar of ['common', 'uncommon', 'rare']) {
          const group = sps.filter((s) => s.rarity === rar);
          const row = CLASSES.map((c) => ['novice', 'skilled', 'expert'].map((k) => { let p = 0; for (const sp of group) p += cell(sp, c.z, g, k, c.ci).p; return pct(p / group.length); }).join('/'));
          console.log(`| ${ZONES[zi]} | T${t} | ${rar} | ${row.join(' | ')} |`);
        }
      }
    }
  }
}

// BALANCE.tackleRating (brief §5.6): for each lake and loadout index rod·25 + line·5 + reel, the largest class a skilled
// player lands ≥ 50% against the lake's reference species (0 Small … 4 Elder, −1 none) and the next class's land %.
function writeRating() {
  const t0 = Date.now();
  const out = { k: K, skill: 'skilled', index: 'rod * 25 + line * 5 + reel', classes: ['small', 'keeper', 'prize', 'trophy', 'elder'], lakes: {} };
  for (const zid of ZONES) {
    const sp = D.SPECIES.find((s) => s.id === REFERENCE[zid]);
    const cls = [], next = [];
    for (let r = 0; r < 5; r++) for (let l = 0; l < 5; l++) for (let e = 0; e < 5; e++) { const [c, n] = rate(sp, loadout(r, l, e), K); cls.push(c); next.push(n); }
    out.lakes[zid] = { reference: sp.id, cls: cls.map((c) => (c < 0 ? '-' : String(c))).join(''), next };
    process.stderr.write(`  ${zid}: ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
  }
  const lines = [
    `  tackleRating: { k: ${out.k}, skill: '${out.skill}', index: '${out.index}', classes: ${JSON.stringify(out.classes).replace(/"/g, "'")}, lakes: {`,
    ...ZONES.map((z) => `    ${z}: { reference: '${out.lakes[z].reference}', cls: '${out.lakes[z].cls}',\n      next: [${out.lakes[z].next.join(', ')}] },`),
    '  } },',
  ].join('\n');
  if (has('--apply')) {
    const file = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/data.js');
    const src = readFileSync(file, 'utf8');
    const re = /(\/\/ @tackleRating-begin[^\n]*\n)[\s\S]*?(\n\s*\/\/ @tackleRating-end)/;
    if (!re.test(src)) throw new Error('tackleRating markers not found in src/data.js');
    writeFileSync(file, src.replace(re, (m, a, b) => a + lines + b));
    console.log(`wrote BALANCE_V3.tackleRating into src/data.js (k ${K}, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  } else console.log(lines);
}
