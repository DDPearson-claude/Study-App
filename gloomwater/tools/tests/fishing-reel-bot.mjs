// The reel sim's player bot (tools/sim/reel-v3.mjs fight(): reaction delay, noisy tension reads, surge warnings noticed or
// missed, pull / leap misreads, lapses, panic release, sweet-band tracking) driving the IN-GAME reel, so the game's reel can be
// checked against the sim (DESIGN §25.14.2 F2: "the in-game reel driven by the sim's skilled bot on a forced Elder Reedjaw, with
// stats from data.tackleStats(T0 / T2 / T4), lands within ±5 points of the sim"). Two drivers share one bot brain:
//   - botFight / gameCell: src/fishing-reel.js createReel with the v3 options fishing.js builds (scaleDifficultyV3, reelOptsV3);
//   - fishingFight / fishingCell: src/fishing.js itself on a fake ctx (tools/tests/fishing-env.mjs): forceBite → a tap timed for a
//     perfect or a normal hook → the bot presses and releases through fishing.onPointerDown / onPointerUp while fishing.update
//     steps the fight (hook path, size scaling, the reel's v3 options, the gear refresh from getStats, the result handling).
//
//   import { gameCell, fishingCell } from './fishing-reel-bot.mjs';
//   gameCell({ D, sp, z, stats: D.tackleStats({rod: 4, line: 4, reel: 4}), skill: SK.skilled, k: 400, zone }) -> {p, time, why, fights}
//   fishingCell({ D, sp, z, stats, skill, k, seed }) -> {p, time, why, fights}
//
// Not a test on its own (no .test.mjs suffix): tools/tests/fishing-v3.test.mjs uses it. CLI for bigger runs:
//   node tools/tests/fishing-reel-bot.mjs [--k 400] [--species reedjaw_pike] [--z 2.95] [--driver reel|fishing|both] [--tiers 0,2,4]
import { createReel, scaleDifficultyV3, reelOptsV3 } from '../../src/fishing-reel.js';

const DT = 1 / 30;
export function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (rng) => { let u = 0; while (u === 0) u = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); };

/**
 * The sim's bot as a brain: onWarn / onSurge at the reel's surge events, decide() once per frame before the reel steps.
 * decide({t, mode, T, c, w, kind, bandsHidden}) -> holding.
 */
export function makeBrain({ skill, botRng }) {
  const sk = skill.reel;
  let noticed = false, noticeAt = 0, readLeap = true, surgeStartT = 0;
  let lapseUntil = -1, trackSweet = true, trackRollAt = 0, holding = true;
  const hist = [];
  const delaySteps = Math.max(1, Math.round(sk.rt / DT));
  return {
    onWarn({ kind, trick, mech, time }) {
      const mixed = !!trick || mech === 'mixedSurge' || mech === 'eclipse';
      noticed = botRng() < sk.warnNotice; noticeAt = time + sk.rt + 0.05;
      const misreadP = mixed ? sk.mixedMisread : (kind === 'leap' ? sk.leapMisread : 0.02);
      readLeap = botRng() >= misreadP;
    },
    onSurge(time) { surgeStartT = time; },
    decide({ t, mode, T, c, w, kind, bandsHidden }) {
      hist.push([T, c]);
      const [Tseen0, cseen] = hist.length > delaySteps ? hist[hist.length - 1 - delaySteps] : hist[0];
      if (hist.length > 64) hist.shift();
      const Tseen = Tseen0 + gauss(botRng) * sk.noise;
      if (t > lapseUntil && botRng() < sk.lapseRate * DT) lapseUntil = t + sk.lapseTime;
      if (t > lapseUntil) {
        const inWarn = mode === 'warn', inSurge = mode === 'surge';
        const knows = noticed && t >= noticeAt;
        const lateSeen = inSurge && (t - surgeStartT) > sk.rt + 0.2;
        const k = kind || 'pull';
        const believed = readLeap ? k : (k === 'leap' ? 'pull' : 'leap');
        let decided = false;
        if ((inWarn && knows) || (inSurge && (knows || lateSeen))) {
          if (believed === 'pull') { holding = false; decided = true; } else if (inSurge) { holding = !(Tseen > 0.85); decided = true; }
        }
        if (!decided) {
          if (Tseen > sk.panicAt) holding = false;
          else {
            if (t >= trackRollAt) { trackSweet = botRng() < sk.sweetTrack; trackRollAt = t + 1.5; }
            const goal = bandsHidden || !trackSweet ? 0.5 : c;
            const half = Math.max(0.03, Math.min(sk.bandHalf, w * 0.45));
            if (holding && Tseen > goal + half) holding = false; else if (!holding && Tseen < goal - half) holding = true;
          }
        }
      }
      return holding;
    },
  };
}
const readOut = (reel) => ({ t: reel.time, mode: reel.surgeMode, T: reel.T, c: reel.c, w: reel.w, kind: reel.surgeKind, bandsHidden: reel.bandsHidden });

/**
 * One fight of the pure in-game reel, played by the sim's bot. `stats` = a tackleStats() loadout (lineStrength, reelSpeed, sweetZone,
 * slackTime, hookWindow, shock, pipBonus, absorb, dragAt). Returns {landed, time, reason, tricks, trickP (progress at the trick),
 * maxP, idleAt (the surge scheduler was idle with progress past the trick point), pipsLost, P}.
 */
export function botFight({ D, sp, z, zone, stats, skill, rng, botRng, tmax = 300 }) {
  const size = D.BALANCE.size, R = D.BALANCE.reel, bite = D.BALANCE.bite;
  const legendary = sp.rarity === 'legendary';
  const zFight = legendary ? (size.fight.legendZ ?? 0) : z;
  const d = scaleDifficultyV3(sp.difficulty, sp.behavior, zFight, zone || sp.zone, size, R);
  const perfect = botRng() < Math.min(0.95, skill.perfect * (stats.hookWindow ?? 1));
  const v3 = reelOptsV3({ size, bite, stats, z, legendary, perfect, style: sp.style || sp.behavior, sizeClass: D.sizeClassOf(z) });
  const brain = makeBrain({ skill, botRng });
  let tricks = 0, pipsLost = 0, trickP = null, maxP = 0, idleAt = false;
  const reel = createReel({
    R, sp: d, behavior: sp.behavior || 'steady', boss: sp.boss || null, legendary,
    LS: stats.lineStrength, RS: stats.reelSpeed, sweetZone: stats.sweetZone, slackTime: stats.slackTime, perfect, rng, v3,
    onEvent(type, p) {
      if (type === 'surgeWarn') brain.onWarn({ kind: p.kind, trick: p.trick, mech: reel.mechanic, time: reel.time });
      else if (type === 'surge') brain.onSurge(reel.time);
      else if (type === 'oldTrick') { tricks++; if (trickP == null) trickP = reel.P; }
      else if (type === 'pip') pipsLost++;
    },
  });
  while (!reel.done && reel.time < tmax) {
    if (reel.surgeMode === 'idle' && reel.P >= (v3.trick?.at ?? Infinity)) idleAt = true;   // the scheduler was free with progress past the trick point
    const holding = brain.decide(readOut(reel));
    reel.step(DT, holding);
    if (reel.P > maxP) maxP = reel.P;
  }
  return { landed: reel.result === 'landed', time: reel.time, reason: reel.result || 'timeout', tricks, trickP, maxP, idleAt, pipsLost, P: reel.P };
}

function cellSeed(sp, z, stats, seed) { let s = seed | 0; for (const ch of `${sp.id}|${z}|${JSON.stringify(stats)}`) s = (s * 31 + ch.charCodeAt(0)) | 0; return s; }
function summarise(fights) {
  let land = 0, time = 0; const why = {};
  for (const r of fights) { if (r.landed) { land++; time += r.time; } else why[r.reason] = (why[r.reason] || 0) + 1; }
  return { p: land / fights.length, time: land ? time / land : NaN, why, tricks: fights.map((f) => f.tricks), fights };
}

/** k seeded fights of the pure reel: {p (land rate), time (mean landed s), why: {reason: n}, tricks: [per fight], fights}. */
export function gameCell({ D, sp, z, zone = null, stats, skill, k = 400, seed = 1 }) {
  const s = cellSeed(sp, z, stats, seed);
  const rng = mul(s), botRng = mul(s ^ 0x5bd1e995);
  const fights = [];
  for (let i = 0; i < k; i++) fights.push(botFight({ D, sp, z, zone, stats, skill, rng, botRng }));
  return summarise(fights);
}

/**
 * One fight through src/fishing.js (env from tools/tests/fishing-env.mjs, with `stats` as progression's getStats): the bot hooks
 * perfectly with the sim's probability (a tap on the first frame of the bite) or late (a tap just past the perfect window), then
 * plays the fight through fishing.onPointerDown / onPointerUp, one fishing.update per frame. Same return shape as botFight.
 */
export function fishingFight({ env, sp, z, stats, skill, botRng, tmax = 300 }) {
  const { ctx, F } = env;
  env.reset();
  if (!ctx.debug.forceBite({ speciesId: sp.id, z }) || F.state !== 'bite') return { landed: false, time: 0, reason: 'nobite', tricks: 0, trickP: null, maxP: 0, idleAt: false, pipsLost: 0, P: 0 };
  const perfect = botRng() < Math.min(0.95, skill.perfect * (stats.hookWindow ?? 1));
  if (!perfect) {   // a normal hook: tap one frame past the perfect window (max(perfectMin, perfectFrac × window))
    const Bt = ctx.data.BALANCE.bite;
    env.tick(1);
    const elapsed = DT, w = elapsed / Math.max(1e-6, 1 - F.view.biteWindow);
    const perfectAt = Math.max(Bt.perfectMin ?? 0.25, (Bt.perfectFrac ?? 0.4) * w);
    let t = elapsed;
    while (t <= perfectAt + 1e-9 && F.state === 'bite') { env.tick(1); t += DT; }
  }
  F.onPointerDown();
  if (F.state !== 'reeling') return { landed: false, time: 0, reason: 'nohook', tricks: 0, trickP: null, maxP: 0, idleAt: false, pipsLost: 0, P: 0 };
  const reel = ctx.debug.fishReel();
  const trickAt = ctx.data.BALANCE.size.reel.oldTrick?.at ?? 0.55;
  const brain = makeBrain({ skill, botRng });
  let tricks = 0, pipsLost = 0, trickP = null, maxP = 0, idleAt = false, prevMode = reel.surgeMode, prevPips = reel.pips, prevTrickDone = reel.trickDone;
  let holding = true;
  while (F.state === 'reeling' && !reel.done && reel.time < tmax) {
    if (reel.surgeMode === 'idle' && reel.P >= trickAt && reel.trickDone === false) idleAt = true;
    const want = brain.decide(readOut(reel));
    if (want !== holding) { if (want) F.onPointerDown(); else F.onPointerUp(); holding = want; }
    env.tick(1);
    // the reel's surge events, read back the frame they happen (what fishing.view shows the player)
    const mode = reel.surgeMode;
    if (mode === 'warn' && prevMode !== 'warn') brain.onWarn({ kind: reel.surgeKind, trick: reel.trick, mech: reel.mechanic, time: reel.time });
    if (mode === 'surge' && prevMode !== 'surge') brain.onSurge(reel.time);
    if (reel.trickDone && !prevTrickDone) { tricks++; if (trickP == null) trickP = reel.P; }
    if (reel.pips != null && prevPips != null && reel.pips < prevPips) pipsLost += prevPips - reel.pips;
    prevMode = mode; prevPips = reel.pips; prevTrickDone = reel.trickDone;
    if (reel.P > maxP) maxP = reel.P;
  }
  const reason = reel.result || (F.state === 'reeling' ? 'timeout' : 'cancel');
  if (F.state === 'reeling') env.reset();
  return { landed: reel.result === 'landed', time: reel.time, reason, tricks, trickP, maxP, idleAt, pipsLost, P: reel.P };
}

/** k seeded fights through src/fishing.js; env = makeFishingEnv({data: D, stats, lean: true, …}). Same shape as gameCell. */
export function fishingCell({ env, sp, z, stats, skill, k = 400, seed = 1 }) {
  const s = cellSeed(sp, z, stats, seed);
  env.ctx.debug.fishSeed(s);
  const botRng = mul(s ^ 0x5bd1e995);
  const fights = [];
  for (let i = 0; i < k; i++) fights.push(fishingFight({ env, sp, z, stats, skill, botRng }));
  return summarise(fights);
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  const args = process.argv.slice(2);
  const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
  const D = await import('../../src/data.js?v3bot');
  const sim = await import('../sim/reel-v3.mjs');
  const { makeFishingEnv } = await import('./fishing-env.mjs');
  const k = Number(arg('--k', 400)), spId = arg('--species', 'reedjaw_pike'), z = Number(arg('--z', D.BALANCE.size.simZ.elder));
  const driver = arg('--driver', 'both'), tiers = String(arg('--tiers', '0,1,2,3,4')).split(',').map(Number);
  const sp = D.SPECIES.find((x) => x.id === spId);
  const spSim = sim.SPECIES.find((x) => x.id === spId);
  const pct = (c) => `${(100 * c.p).toFixed(1)}% (${Number.isFinite(c.time) ? c.time.toFixed(0) : '–'} s)`;
  for (const T of tiers) {
    const stats = D.tackleStats({ rod: T, line: T, reel: T });
    const c = sim.cell(spSim, z, sim.loadout(T), 'skilled', ['small', 'keeper', 'prize', 'trophy', 'elder'].indexOf(D.sizeClassOf(z)), k);
    const parts = [`T${T} sim ${pct(c)} ${JSON.stringify(c.why)}`];
    if (driver !== 'fishing') { const g = gameCell({ D, sp, z, stats, skill: sim.SK.skilled, k }); parts.push(`reel ${pct(g)} Δ ${(100 * (g.p - c.p)).toFixed(1)}`); }
    if (driver !== 'reel') {
      const env = makeFishingEnv({ data: D, stats, lean: true, raft: [4, 14.8], zoneId: sp.zone });
      const f = fishingCell({ env, sp, z, stats, skill: sim.SK.skilled, k });
      parts.push(`fishing.js ${pct(f)} ${JSON.stringify(f.why)} Δ ${(100 * (f.p - c.p)).toFixed(1)}`);
    }
    console.log(parts.join(' · '));
  }
}
