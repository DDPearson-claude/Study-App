// The reel sim's player bot (tools/sim/reel-v3.mjs fight(): reaction delay, noisy tension reads, surge warnings noticed or
// missed, pull / leap misreads, lapses, panic release, sweet-band tracking) driving the IN-GAME reel (src/fishing-reel.js
// createReel with the v3 options fishing.js builds), so the game's reel can be checked against the sim (DESIGN §25.14.2 F2:
// "the in-game reel driven by the sim's skilled bot on a forced Elder Reedjaw, with stats from data.tackleStats(T0 / T2 / T4),
// lands within ±5 points of the sim").
//
//   import { gameCell } from './fishing-reel-bot.mjs';
//   gameCell({ D, sp, z, loadout: D.tackleStats({rod: 4, line: 4, reel: 4}), skill: SK.skilled, k: 400, zone }) -> {p, time, why}
//
// Not a test on its own (no .test.mjs suffix): tools/tests/fishing-v3.test.mjs uses it. CLI for bigger runs:
//   node tools/tests/fishing-reel-bot.mjs [--k 400] [--species reedjaw_pike] [--z 2.95]
import { createReel, scaleDifficultyV3, reelOptsV3 } from '../../src/fishing-reel.js';

const DT = 1 / 30;
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (rng) => { let u = 0; while (u === 0) u = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); };

/**
 * One fight of the in-game reel, played by the sim's bot. `stats` = a tackleStats() loadout (lineStrength, reelSpeed, sweetZone,
 * slackTime, hookWindow, shock, pipBonus, absorb, dragAt). Returns {landed, time, reason, tricks, trickP (progress at the trick),
 * maxP, idleAt (the surge scheduler was idle with progress past the trick point), pipsLost, P}.
 */
export function botFight({ D, sp, z, zone, stats, skill, rng, botRng, tmax = 300 }) {
  const size = D.BALANCE.size, R = D.BALANCE.reel, bite = D.BALANCE.bite;
  const legendary = sp.rarity === 'legendary';
  const zFight = legendary ? (size.fight.legendZ ?? 0) : z;
  const d = scaleDifficultyV3(sp.difficulty, sp.behavior, zFight, zone || sp.zone, size, R);
  const sk = skill.reel;
  const perfect = botRng() < Math.min(0.95, skill.perfect * (stats.hookWindow ?? 1));
  const v3 = reelOptsV3({ size, bite, stats, z, legendary, perfect, style: sp.style || sp.behavior, sizeClass: D.sizeClassOf(z) });
  let noticed = false, noticeAt = 0, readLeap = true, surgeStartT = 0, mixed = false;
  let lapseUntil = -1, trackSweet = true, trackRollAt = 0, holding = true, tricks = 0, pipsLost = 0, trickP = null, maxP = 0, idleAt = false;
  const reel = createReel({
    R, sp: d, behavior: sp.behavior || 'steady', boss: sp.boss || null, legendary,
    LS: stats.lineStrength, RS: stats.reelSpeed, sweetZone: stats.sweetZone, slackTime: stats.slackTime, perfect, rng, v3,
    onEvent(type, p) {
      if (type === 'surgeWarn') {
        const mech = reel.mechanic;
        mixed = !!p.trick || mech === 'mixedSurge' || mech === 'eclipse';
        noticed = botRng() < sk.warnNotice; noticeAt = reel.time + sk.rt + 0.05;
        const misreadP = mixed ? sk.mixedMisread : (p.kind === 'leap' ? sk.leapMisread : 0.02);
        readLeap = botRng() >= misreadP;
      } else if (type === 'surge') surgeStartT = reel.time;
      else if (type === 'oldTrick') { tricks++; if (trickP == null) trickP = reel.P; }
      else if (type === 'pip') pipsLost++;
    },
  });
  const hist = [];
  const delaySteps = Math.max(1, Math.round(sk.rt / DT));
  while (!reel.done && reel.time < tmax) {
    const t = reel.time, mode = reel.surgeMode;
    if (mode === 'idle' && reel.P >= (v3.trick?.at ?? Infinity)) idleAt = true;   // the scheduler was free with progress past the trick point
    hist.push([reel.T, reel.c]);
    const [Tseen0, cseen] = hist.length > delaySteps ? hist[hist.length - 1 - delaySteps] : hist[0];
    if (hist.length > 64) hist.shift();
    const Tseen = Tseen0 + gauss(botRng) * sk.noise;
    if (t > lapseUntil && botRng() < sk.lapseRate * DT) lapseUntil = t + sk.lapseTime;
    if (t > lapseUntil) {
      const inWarn = mode === 'warn', inSurge = mode === 'surge';
      const knows = noticed && t >= noticeAt;
      const lateSeen = inSurge && (t - surgeStartT) > sk.rt + 0.2;
      const kind = reel.surgeKind || 'pull';
      const believed = readLeap ? kind : (kind === 'leap' ? 'pull' : 'leap');
      let decided = false;
      if ((inWarn && knows) || (inSurge && (knows || lateSeen))) {
        if (believed === 'pull') { holding = false; decided = true; } else if (inSurge) { holding = !(Tseen > 0.85); decided = true; }
      }
      if (!decided) {
        if (Tseen > sk.panicAt) holding = false;
        else {
          if (t >= trackRollAt) { trackSweet = botRng() < sk.sweetTrack; trackRollAt = t + 1.5; }
          const goal = reel.bandsHidden || !trackSweet ? 0.5 : cseen;
          const half = Math.max(0.03, Math.min(sk.bandHalf, reel.w * 0.45));
          if (holding && Tseen > goal + half) holding = false; else if (!holding && Tseen < goal - half) holding = true;
        }
      }
    }
    reel.step(DT, holding);
    if (reel.P > maxP) maxP = reel.P;
  }
  return { landed: reel.result === 'landed', time: reel.time, reason: reel.result || 'timeout', tricks, trickP, maxP, idleAt, pipsLost, P: reel.P };
}

/** k seeded fights: {p (land rate), time (mean landed s), why: {reason: n}, tricks: [per fight]}. */
export function gameCell({ D, sp, z, zone = null, stats, skill, k = 400, seed = 1 }) {
  let s = seed | 0; for (const ch of `${sp.id}|${z}|${JSON.stringify(stats)}`) s = (s * 31 + ch.charCodeAt(0)) | 0;
  const rng = mul(s), botRng = mul(s ^ 0x5bd1e995);
  let land = 0, time = 0; const why = {}, tricks = [], fights = [];
  for (let i = 0; i < k; i++) {
    const r = botFight({ D, sp, z, zone, stats, skill, rng, botRng });
    if (r.landed) { land++; time += r.time; } else why[r.reason] = (why[r.reason] || 0) + 1;
    tricks.push(r.tricks); fights.push(r);
  }
  return { p: land / k, time: land ? time / land : NaN, why, tricks, fights };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  const args = process.argv.slice(2);
  const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
  const D = await import('../../src/data.js?v3bot');
  const sim = await import('../sim/reel-v3.mjs');
  const k = Number(arg('--k', 400)), spId = arg('--species', 'reedjaw_pike'), z = Number(arg('--z', D.BALANCE.size.simZ.elder));
  const sp = D.SPECIES.find((x) => x.id === spId);
  const spSim = sim.SPECIES.find((x) => x.id === spId);
  for (const T of [0, 1, 2, 3, 4]) {
    const stats = D.tackleStats({ rod: T, line: T, reel: T });
    const g = gameCell({ D, sp, z, stats, skill: sim.SK.skilled, k });
    const c = sim.cell(spSim, z, sim.loadout(T), 'skilled', ['small', 'keeper', 'prize', 'trophy', 'elder'].indexOf(D.sizeClassOf(z)), k);
    console.log(`T${T} game ${(100 * g.p).toFixed(1)}% (${g.time.toFixed(0)} s) ${JSON.stringify(g.why)} · sim ${(100 * c.p).toFixed(1)}% (${c.time.toFixed(0)} s) ${JSON.stringify(c.why)} · Δ ${(100 * (g.p - c.p)).toFixed(1)}`);
  }
}
