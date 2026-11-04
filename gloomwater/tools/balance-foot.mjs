#!/usr/bin/env node
// tools/balance-foot.mjs — the FOOT PROFILE for the balance simulation (DESIGN §24.14 and Appendix B).
//
//   node tools/balance-foot.mjs              v1 baseline vs walking build, same seeds (≈ 3 min)
//   node tools/balance-foot.mjs --quick      smaller samples (≈ 1.5 min)
//   node tools/balance-foot.mjs --kin        kinematic dodge table only (raft vs foot, both skills)
//   node tools/balance-foot.mjs --route      per-lake day routes from the walk maps only
//   node tools/balance-foot.mjs --reel       The Pale Leviathan from the Brink vs the Joined Hands
//
// It drives the unmodified v1 model (tools/sim/model.mjs) and changes, per lake and only in the walking
// build, exactly the inputs that walking changes. Every number comes from src/data.js; the assumptions the
// maps cannot give (how much of a night is spent inside a candle or on a narrow road) are in FOOT_ASSUME.
//  • Days: the bot walks a day plan on the body-eroded walk grid (dawn candle → today's Astir place → the
//    nearest other place → Murk's dock of the day → a vigil candle), path time × 1.2 (human factor). Walk
//    time replaces the raft's relocation and Murk trips; places count as feeding spots by their strength;
//    sharing flame costs oil (12 × zone drain per candle, Known Places free); calm 125 s + Arrival Hush.
//  • Nights: kinematic dodges (raft accel 3/s, top 6 m/s, glide; foot accel 6/s, top 4.9 m/s, walkway
//    pinning = one-dimensional escapes) scale the model's calibrated raft dodge rates by the ratio of
//    kinematic failures; contact 1.6 m; crawlers arrive by path at × 0.9 land speed; eels only near open
//    water; partial darkness shelter inside candles; corridor pinning slows kiting.
//  • Campaigns: Known Places accumulate run to run (free first shares). The new tier IV relics are not
//    bought (their Memories go to v1 relics), which errs toward harder.
import { SKILLS, blendSkill, newMeta, simulateRun, bankRun, spendMemories, mulberry32 } from './sim/model.mjs';
import { fightStats } from './sim/reel.mjs';
import * as D from '../src/data.js';

const WL = await import('./walk-lib.mjs');   // walking-build instance for the maps
const V2 = WL.D;
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const QUICK = !!args.quick, SEED = +(args.seed ?? 20261104);
const RUNS = +(args.runs ?? (QUICK ? 160 : 320)), CAMPAIGNS = +(args.campaigns ?? (QUICK ? 16 : 30)), LEN = 13;
const pct = (a, p) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : '—'), f0 = (v) => (Number.isFinite(v) ? Math.round(v).toString() : '—'), pc = (v) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : '—');
function table(head, rows) {
  const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
  const line = (r) => '| ' + r.map((c, i) => String(c).padEnd(w[i])).join(' | ') + ' |';
  return [line(head), '|' + w.map((x) => '-'.repeat(x + 2)).join('|') + '|', ...rows.map(line)].join('\n');
}

// ===================================================================================== assumptions
// Shares the maps cannot give. avg / skilled. Sporewood nights are half on the raft (mixed lake).
const FOOT_ASSUME = {
  footNight: { sporewood: 0.5, glasswater: 1, paleabyss: 1 },
  narrow: { sporewood: 0.15, glasswater: 0.3, paleabyss: 0.5 },        // share of a night on walkways < 4 m wide (1-D escapes)
  eelReach: { sporewood: 0.8, glasswater: 0.55, paleabyss: 0.85 },      // share of a night within 6 m of open water and ≤ 3 m above it
  pathRatio: { sporewood: 0.85, glasswater: 0.8, paleabyss: 0.75 },     // straight / path distance for crawler arrival
  inCandle: { average: 0.3, skilled: 0.5 },                              // share of a night inside a lit sister-candle
  placeCasts: { average: 0.6, skilled: 0.85 }, astirCasts: { average: 0.2, skilled: 0.35 },   // share of casts landing in a place (incl. the Astir one) / in the Astir place
  placeEq: 0.6, astirEq: 1.2,                                            // spot-equivalents: base place (wait × 0.75, +0.10, +0.06) / Astir (× 0.55, +0.25, +0.15) vs a feeding spot
  spotCastsOnFoot: 0.3,                                                  // outside places, feeding spots near walkways take this share of a v1 spot-chaser's casts (place and spot never stack)
  candlesPerStay: { average: 2, skilled: 4 }, daysPerStay: { sporewood: 3, glasswater: 3.5, paleabyss: 3 },
  knownPerVisit: 0.2,                                                    // share of a lake's candles that become Known (free first share) per earlier visit
  humanFactor: 1.2,
  islandSail: 0.6,                                                       // Sporewood: share of v1's per-catch sailing still spent sailing between islands
};
const LAKES = ['sporewood', 'glasswater', 'paleabyss'];
const near = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ===================================================================================== kinematics
const KIN = {
  raft: { V: D.STATS.moveSpeed.base, ka: D.BALANCE.move.accel, moving: 0.7 },
  foot: { V: D.STATS.moveSpeed.base * V2.BALANCE.walk.speedMult, ka: V2.BALANCE.walk.accel, moving: 0.6 },
};
const KILLERS = {
  slam: { R: D.ENEMY_BY_ID.drowned_hand.telegraph.stainRadius, T: D.ENEMY_BY_ID.drowned_hand.telegraph.stain + D.ENEMY_BY_ID.drowned_hand.telegraph.breach, lead: 0 },
  glob: { R: D.ENEMY_BY_ID.weeping_inkwell.artillery.ringRadius, T: D.ENEMY_BY_ID.weeping_inkwell.artillery.flight, lead: D.ENEMY_BY_ID.weeping_inkwell.artillery.lead },
  // Warden attacks are lanes and rings with gaps; on foot they are aligned so the walkway is the escape line (§24.8),
  // so the escape is one-dimensional for raft and foot alike: leave a 1.5 m half-lane within 1.0 s.
  warden: { R: 1.5, T: 1.0, lead: 0, lane: true },
};
function escapeProb(mode, killer, sk, oneD, rng) {
  const M = KIN[mode], K = KILLERS[killer], N = 1200, dt = 1 / 60;
  let ok = 0;
  for (let i = 0; i < N; i++) {
    const tau = Math.exp(Math.log(sk.rtMedian * 1.5) + sk.rtSigma * Math.sqrt(-2 * Math.log(rng() || 1e-9)) * Math.cos(2 * Math.PI * rng()));
    const missed = rng() > sk.reel.warnNotice;
    const th = rng() * Math.PI * 2, sp = rng() < M.moving ? M.V * (0.5 + 0.5 * rng()) : 0;
    const axis = rng() * Math.PI * 2;                               // walkway direction when one-dimensional
    let vx = sp * Math.cos(th), vz = sp * Math.sin(th);
    if (oneD) { const c = Math.cos(axis), s = Math.sin(axis), u = vx * c + vz * s; vx = u * c; vz = u * s; }
    const cx = K.lead * vx, cz = K.lead * vz;                       // impact centre (globs lead the Wick)
    const lane = K.lane, oneDim = oneD || lane;                     // lanes: only the lane normal (= the walkway, by design) matters
    const dirs = oneDim ? [[Math.cos(axis), Math.sin(axis)], [-Math.cos(axis), -Math.sin(axis)]] : Array.from({ length: 16 }, (_, j) => [Math.cos(j * Math.PI / 8), Math.sin(j * Math.PI / 8)]);
    let best = -Infinity;
    for (const [dx, dz] of missed ? [[0, 0]] : dirs) {
      let x = 0, z = 0, ux = vx, uz = vz;
      for (let t = 0; t < K.T; t += dt) {
        if (t >= tau && !missed) { const a = 1 - Math.exp(-M.ka * dt); ux += (dx * M.V - ux) * a; uz += (dz * M.V - uz) * a; }
        x += ux * dt; z += uz * dt;
      }
      best = Math.max(best, lane ? Math.abs(x * Math.cos(axis) + z * Math.sin(axis)) : Math.hypot(x - cx, z - cz));
    }
    if (best > K.R) ok++;
  }
  return ok / N;
}
const KTAB = {};
function kinTable() {
  const rng = mulberry32(SEED ^ 0x9e3779b9);
  for (const sk of [SKILLS.average, SKILLS.skilled]) for (const k of Object.keys(KILLERS)) {
    const raft = escapeProb('raft', k, sk, false, rng), free = escapeProb('foot', k, sk, false, rng), one = escapeProb('foot', k, sk, true, rng);
    KTAB[`${sk.id}:${k}`] = { raft, free, one };
  }
}
/** Foot dodge for a calibrated raft dodge, given the share of the night on narrow walkways. */
function footDodge(skId, killer, raftDodge, narrow) {
  const t = KTAB[`${skId}:${killer}`]; if (!t) return raftDodge;
  const pf = (1 - narrow) * t.free + narrow * t.one, failRatio = (1 - pf) / Math.max(1e-3, 1 - t.raft);
  return Math.max(0, Math.min(0.995, 1 - (1 - raftDodge) * failRatio));
}

// ===================================================================================== day routes from the walk maps
const ROUTE = {};
function routes() {
  const speed = WL.footSpeed(), rng = mulberry32(SEED ^ 0x51ed27);
  for (const id of LAKES) {
    const z = V2.ZONE_BY_ID[id], A = z.arena;
    const res = { a: [], b: [], c: [], d: [] };
    for (const openK of [false, true]) {
      const G = V2.walkGridFor(z, { open: openK ? WL.openAll(z) : {} }), M = WL.erode(G);
      const field = new Map();
      const distFrom = (p) => { const key = `${p.x},${p.z}`; if (!field.has(key)) field.set(key, WL.walkDistances(G, z, [WL.snap(G, M, p.x, p.z, 2.5)], M)); return field.get(key); };
      const at = (dd, p) => { const k = WL.snap(G, M, p.x, p.z, 2.5); return k >= 0 ? dd[k] : Infinity; };
      const places = A.places.filter((p) => p.stand && p.access !== 'raft' && !p.legend);
      const lamps = A.lamps;
      const dockWalk = (d) => { const k0 = G.idx(d.x, d.z); let best = null, bd = Infinity; for (let dj = -10; dj <= 10; dj++) for (let di = -10; di <= 10; di++) { const k = k0 + dj * G.n + di; if (!M[k]) continue; const [x, zz] = WL.cellXZ(G, k), dd = Math.hypot(x - d.x, zz - d.z); if (dd < bd && dd <= V2.BALANCE.walk.tradeRange) { bd = dd; best = { x, z: zz }; } } return best; };
      for (let s = 0; s < 120; s++) {
        const astir = places[Math.floor(rng() * places.length)];
        const startLamp = lamps.reduce((b, l) => (at(distFrom(l), astir.stand) < at(distFrom(b), astir.stand) ? l : b), lamps[0]);   // Flame-leap at dawn
        const dA = at(distFrom(startLamp), astir.stand);
        const other = places.filter((p) => p !== astir).reduce((b, p) => (at(distFrom(astir.stand), p.stand) < at(distFrom(astir.stand), b.stand) ? p : b));
        const dB = at(distFrom(astir.stand), other.stand);
        const nearDocks = (A.docks || []).slice().sort((d1, d2) => near(d1, astir.stand) - near(d2, astir.stand)).slice(0, V2.BALANCE.places.murkNearAstir || (A.docks || []).length);
        const dock = dockWalk(nearDocks[Math.floor(rng() * nearDocks.length)]);
        let dC = dock ? at(distFrom(other.stand), dock) : 0;
        if (z.mode === 'mixed') dC = 0;                              // Sporewood: Murk is reached by raft, as in v1
        const dD = Math.min(...lamps.map((l) => at(distFrom(dock || other.stand), l)));
        if (![dA, dB, dC, dD].every(Number.isFinite)) continue;
        // Sporewood: places sit on different islands; the walking legs are jetty → stand and back
        const k = z.mode === 'mixed' ? 0.5 : 1;
        res.a.push(dA * k / speed); res.b.push(dB * k / speed); res.c.push(dC / speed); res.d.push(dD * k / speed);
      }
    }
    const h = FOOT_ASSUME.humanFactor;
    ROUTE[id] = { a: mean(res.a) * h, b: mean(res.b) * h, c: mean(res.c) * h, d: mean(res.d) * h };
    ROUTE[id].total = ROUTE[id].a + ROUTE[id].b + ROUTE[id].c + ROUTE[id].d;
  }
}

if (args.kin) {
  kinTable();
  const rows = [];
  for (const sk of ['average', 'skilled']) for (const k of Object.keys(KILLERS)) {
    const t = KTAB[`${sk}:${k}`], raft = SKILLS[sk].dodge[k] ?? (sk === 'average' ? 0.5 : 0.75);
    rows.push([sk, k, pc(t.raft), pc(t.free), pc(t.one), pc(raft), pc(footDodge(sk, k, raft, 0)), pc(footDodge(sk, k, raft, 0.5))]);
  }
  console.log(table(['skill', 'killer', 'raft escape', 'foot open', 'foot walkway', 'model raft dodge', 'foot dodge (open)', 'foot dodge (50% walkways)'], rows));
  process.exit(0);
}
if (args.route) {
  routes();
  console.log(table(['lake', 'dawn candle → Astir', 'Astir → next place', 'place → Murk', 'Murk → vigil candle', 'walking per day'],
    LAKES.map((id) => [id, ...['a', 'b', 'c', 'd', 'total'].map((k) => `${f1(ROUTE[id][k])} s`)])));
  process.exit(0);
}
if (args.reel) {
  const sp = D.SPECIES_BY_ID.pale_leviathan, R = D.BALANCE.reel, W2 = V2.BALANCE.walk, brink = V2.PLACE_BY_ID.the_bottomless;
  const base = { LS: 1.9, RS: 1.45, SZ: 0.2, slackTime: 1.6 };
  const stances = [
    ['raft (v1 reference)', 0, 0],
    ['the Brink (flat line)', brink.standMods.sweetAdd, 0],
    ['the Joined Hands (steep line)', W2.steepLine.sweetAdd, W2.steepLine.surgeWarnAdd],
  ];
  const rows = [];
  const keep = { warnBase: R.warnBase, warnMin: R.warnMin, darterWarn: R.darterWarn };
  for (const [name, sweet, warn] of stances) {
    R.warnBase = keep.warnBase + warn; R.warnMin = keep.warnMin + warn; R.darterWarn = keep.darterWarn + warn;
    const g = { ...base, SZ: Math.round((base.SZ + sweet) * 200) / 200 };
    const a = fightStats({ ...sp, id: sp.id + name }, g, SKILLS.average.reel), s = fightStats({ ...sp, id: sp.id + name }, g, SKILLS.skilled.reel);
    rows.push([name, `${g.SZ}`, `${warn}`, pc(a.pLand), f0(a.time), pc(s.pLand), f0(s.time)]);
  }
  Object.assign(R, keep);
  console.log(table(['stance', 'sweet zone', 'surge warning Δ s', 'avg land', 'avg s', 'skilled land', 'skilled s'], rows));
  process.exit(0);
}

// ===================================================================================== hooks into the model (walking build only)
kinTable(); routes();
let FOOT = false, CUR = 0, SKID = 'average', RUNIDX = 0, VISITS = [0, 0, 0, 0];
const lakeOf = (i) => (i >= 1 ? LAKES[i - 1] : null);
const zoneTrack = {};
D.ZONES.forEach((z, i) => {
  for (const key of ['legendary', 'drain', 'valueMult']) {
    const v = z[key];
    Object.defineProperty(z, key, { configurable: true, enumerable: true, get() { CUR = i; return v; }, set(x) { /* immutable in sims */ } });
  }
});
// calm length (+ Arrival Hush, recognised one calm late: the model reads it before descending; same economy)
const phases = D.BALANCE.phases, calm0 = phases.calm;
let lastCalmZone = 0, hushGiven = new Set();
Object.defineProperty(phases, 'calm', { configurable: true, enumerable: true, get() {
  if (!FOOT || CUR === 0) return calm0;
  const lake = lakeOf(CUR), calm = V2.ZONE_V2[lake]?.phases?.calm ?? calm0;
  let hush = 0; if (CUR !== lastCalmZone && !hushGiven.has(CUR)) { hush = V2.BALANCE.travel.arrivalHush?.[lake] ?? 0; hushGiven.add(CUR); }
  lastCalmZone = CUR; return calm + hush;
} });
// oil spent sharing flame, spread over the calm
const oilPhase = D.BALANCE.drain.oilPhase, calmOil0 = oilPhase.calm;
Object.defineProperty(oilPhase, 'calm', { configurable: true, enumerable: true, get() {
  if (!FOOT || CUR === 0) return calmOil0;
  const lake = lakeOf(CUR), zone = V2.ZONE_BY_ID[lake], L = V2.BALANCE.lamps, cost = L.lightCost * zone.drain.oil;
  const known = Math.min(1, FOOT_ASSUME.knownPerVisit * VISITS[CUR]);
  const perDay = (FOOT_ASSUME.candlesPerStay[SKID] * cost * (1 - known)) / FOOT_ASSUME.daysPerStay[lake];
  const wayside = lake === 'paleabyss' ? (V2.ARENA_V2.paleabyss.wayside.count * V2.ARENA_V2.paleabyss.wayside.give.oil) / FOOT_ASSUME.daysPerStay[lake] : 0;
  const perSec = D.STATS.oilDrain.base * zone.drain.oil * D.difficultyFor(3, CUR, 0.5).drainMult;
  return calmOil0 + (perDay - wayside) / (perSec * (V2.ZONE_V2[lake]?.phases?.calm ?? calm0));
} });
// contact radius, darkness shelter
const dmg = D.BALANCE.damage, contact0 = dmg.contactRadius, dark = dmg.darkness, darkInt0 = dark.interval;
Object.defineProperty(dmg, 'contactRadius', { configurable: true, enumerable: true, get() {
  if (!FOOT || CUR === 0) return contact0; const s = FOOT_ASSUME.footNight[lakeOf(CUR)];
  return contact0 * (1 - s) + V2.BALANCE.combat.foot.contactRadius * s;
} });
Object.defineProperty(dark, 'interval', { configurable: true, enumerable: true, get() {
  if (!FOOT || CUR === 0) return darkInt0; const s = FOOT_ASSUME.footNight[lakeOf(CUR)] * FOOT_ASSUME.inCandle[SKID];
  return darkInt0 / (1 - s * (1 - V2.BALANCE.lamps.darknessShelter));
} });
// crawlers arrive by path at land speed
for (const e of D.ENEMIES.filter((x) => x.waterBound)) {
  const v0 = e.speed;
  Object.defineProperty(e, 'speed', { configurable: true, enumerable: true, get() {
    if (!FOOT || CUR === 0) return v0; const lake = lakeOf(CUR), s = FOOT_ASSUME.footNight[lake];
    return v0 * (1 - s + s * V2.BALANCE.combat.foot.crawl.landSpeed * FOOT_ASSUME.pathRatio[lake]);
  } });
}
// per-lake skill (relocation, Murk trips, place casts, dodges, kiting, eels)
const BASE_CATCH = {};   // catches per day per zone in the v1 baseline (filled by the baseline pass)
function spotEq(t) {   // share of casts with a feeding-spot-strength bonus on foot
  const A = FOOT_ASSUME, place = A.placeCasts[SKID], astir = A.astirCasts[SKID];
  return Math.min(0.95, (place - astir) * A.placeEq + astir * A.astirEq + (1 - place) * t.inSpot * A.spotCastsOnFoot);
}
function footSkill(sk) {
  const dodgeP = new Proxy(sk.dodge, { get(t, k) {
    const v = t[k]; if (!FOOT || CUR === 0 || typeof v !== 'number') return v;
    const lake = lakeOf(CUR), s = FOOT_ASSUME.footNight[lake], nar = FOOT_ASSUME.narrow[lake];
    if (k === 'slam' || k === 'glob') return v * (1 - s) + footDodge(SKID, k, v, nar) * s;
    if (k === 'eel') return v * (1 - s) + (1 - (1 - v) * FOOT_ASSUME.eelReach[lake]) * s;
    return v;
  } });
  return new Proxy(sk, { get(t, k) {
    const v = t[k];
    if (k === 'dodge') return dodgeP;
    if (!FOOT || CUR === 0) return v;
    const lake = lakeOf(CUR), R = ROUTE[lake], A = FOOT_ASSUME, s = A.footNight[lake];
    if (k === 'merchantTrip') return lake === 'sporewood' ? v : R.c + 2;
    if (k === 'inSpot') { const eq = spotEq(t); return Math.min(0.95, lake === 'sporewood' ? (t.inSpot + eq) / 2 : eq); }
    if (k === 'sailEff') {   // relocation per in-spot catch = the day's walking spread over the day's catches
      const catches = Math.max(4, BASE_CATCH[CUR] || 8), inSpot = spotEq(t);
      // foot lakes: walking replaces the raft's relocation; Sporewood: the walking legs come on top of sailing between islands
      const walkPer = (R.a + R.b + R.d) / (catches * inSpot), raftPer = 20 / (D.STATS.moveSpeed.base * v) + 2;
      const per = lake === 'sporewood' ? raftPer * A.islandSail + walkPer : walkPer;   // sailing between ~2 islands a day replaces part of v1's spot-chasing
      return per > 2.2 ? 20 / (D.STATS.moveSpeed.base * (per - 2)) : 3;
    }
    if (k === 'kite') { const nar = A.narrow[lake] * s; return v + (1 - v) * nar * 0.5; }
    if (k === 'wardenHitEvery') { const tt = KTAB[`${SKID}:warden`], pf = (1 - A.narrow[lake]) * tt.free + A.narrow[lake] * tt.one; return v * ((1 - tt.raft) / Math.max(1e-3, 1 - pf)) * s + v * (1 - s); }
    return v;
  } });
}
// catches per zone: meta.totalFish counts every landed fish
function trackMeta(meta, tally) {
  let n = meta.totalFish;
  Object.defineProperty(meta, 'totalFish', { configurable: true, enumerable: true, get() { return n; }, set(x) { if (tally && x > n) tally[CUR] = (tally[CUR] || 0) + (x - n); n = x; } });
  return meta;
}
const learnerSkill = (r) => blendSkill(Math.min(0.6, 0.06 * r));
function runOne(meta, sk, rng, skId, tally) {
  SKID = skId; hushGiven = new Set(); lastCalmZone = 0; CUR = 0;
  const run = simulateRun(trackMeta(meta, tally), footSkill(sk), {}, rng);
  for (let z = 1; z <= run.zone; z++) VISITS[z]++;
  return run;
}
function campaign(skKey, rng) {
  const meta = newMeta(), snaps = {}, runs = [];
  VISITS = [0, 0, 0, 0];
  for (let r = 0; r < LEN; r++) {
    if (r === 8) snaps[8] = { meta: structuredClone(meta), visits: VISITS.slice() };
    RUNIDX = r;
    const sk = skKey === 'learner' ? learnerSkill(r) : SKILLS[skKey];
    const run = runOne(meta, sk, rng, skKey === 'skilled' ? 'skilled' : 'average', null);
    bankRun(meta, run); spendMemories(meta);
    runs.push({ zone: run.zone, won: run.won, day: run.day });
  }
  return { snaps, runs };
}
function evaluate(skKey, metas, n, rng) {
  const out = { deaths: [], wins: 0, zones: [0, 0, 0, 0], n, causes: {}, darkByZone: [0, 0, 0, 0], deathByZone: [0, 0, 0, 0], shells: [0, 0, 0, 0], days: [0, 0, 0, 0], fish: [0, 0, 0, 0],
    hitsZone: [[], [], [], []], oilZone: [[], [], [], []], cadence: [] };
  for (let i = 0; i < n; i++) {
    const m = metas[i % metas.length]; VISITS = (m.visits || [0, 0, 0, 0]).slice();
    const tally = {};
    const run = runOne(structuredClone(m.meta || m), SKILLS[skKey], rng, skKey, tally);
    for (let z = 0; z <= run.zone; z++) out.zones[z]++;
    if (run.won) out.wins++; else { out.deaths.push(run.day); out.causes[run.cause] = (out.causes[run.cause] || 0) + 1; out.deathByZone[run.zone]++; if (run.cause === 'darkness') out.darkByZone[run.zone]++; }
    for (let z = 0; z < 4; z++) { out.shells[z] += run.shellsByZone[z]; out.days[z] += run.daysByZone[z]; out.fish[z] += tally[z] || 0; }
    run.nightLog.forEach((nl, j) => {
      out.hitsZone[nl.zone].push(nl.emberLost); if (!nl.dead) out.oilZone[nl.zone].push(nl.oilNet);
      const prev = j ? run.nightLog[j - 1].level : null;
      if (j < 3 && prev != null && nl.level > prev && !nl.dead) out.cadence.push(D.gloomtideLength(nl.day) / (nl.level - prev));
    });
  }
  return out;
}

// ===================================================================================== run both builds on the same seeds
// --seeds=a,b pools several seeds (default: two) so per-lake night numbers are not one seed's noise.
const SEEDS = String(args.seeds ?? `${SEED},7`).split(',').map(Number);
const t0 = Date.now();
const report = {};
const merge = (A, B) => { if (!A) return B; for (const k of Object.keys(B)) { if (Array.isArray(B[k]) && Array.isArray(A[k]) && Array.isArray(B[k][0])) B[k].forEach((v, i) => A[k][i].push(...v)); else if (Array.isArray(B[k])) A[k] = typeof B[k][0] === 'number' && k !== 'deaths' && k !== 'cadence' ? A[k].map((v, i) => v + B[k][i]) : A[k].concat(B[k]); else if (typeof B[k] === 'number') A[k] += B[k]; else if (k === 'causes') for (const [c, v] of Object.entries(B[k])) A[k][c] = (A[k][c] || 0) + v; } return A; };
for (const build of ['v1', 'walk']) {
  FOOT = build === 'walk';
  const camp = { skilled: [], learner: [] };
  let avg0 = null, sk0 = null, sk8 = null;
  for (const sd of SEEDS) {
    const c1 = { skilled: [], learner: [] };
    for (const key of ['skilled', 'learner']) { const rng = mulberry32(sd ^ (key === 'skilled' ? 0x5bd1e995 : 0x27d4eb2f)); for (let c = 0; c < CAMPAIGNS; c++) c1[key].push(campaign(key, rng)); }
    camp.skilled.push(...c1.skilled); camp.learner.push(...c1.learner);
    avg0 = merge(avg0, evaluate('average', [newMeta()], RUNS, mulberry32(sd + 3)));
    sk0 = merge(sk0, evaluate('skilled', [newMeta()], RUNS, mulberry32(sd + 7)));
    sk8 = merge(sk8, evaluate('skilled', c1.skilled.map((c) => c.snaps[8]), RUNS, mulberry32(sd + 815)));
    if (!FOOT) for (const r of [avg0, sk0]) for (let z = 0; z < 4; z++) if (r.days[z] > 20) BASE_CATCH[z] = Math.max(BASE_CATCH[z] || 0, r.fish[z] / r.days[z]);
  }
  const first = (key, test) => pct(camp[key].map((c) => { const i = c.runs.findIndex(test); return i < 0 ? Infinity : i + 1; }), 0.5);
  const wonBy = (n) => camp.skilled.filter((c) => c.runs.slice(0, n).some((x) => x.won)).length / camp.skilled.length;
  report[build] = { avg0, sk0, sk8, firstWin: first('skilled', (x) => x.won), wonBy8: wonBy(8), wonBy13: wonBy(13), learnerPallid: first('learner', (x) => x.zone >= 3), learnerGlass: first('learner', (x) => x.zone >= 2) };
}
const R1 = report.v1, R2 = report.walk;
const out = [];
const P = (s = '') => out.push(s);
P(`GLOOMWATER foot profile — seeds ${SEEDS.join(', ')} pooled, ${RUNS} runs/profile and ${CAMPAIGNS} campaigns × ${LEN} runs per seed (${((Date.now() - t0) / 1000).toFixed(0)} s). v1 = raft everywhere (today); walk = DESIGN §24.`);
P();
P('## Day routes (walk grid, × 1.2 human factor)');
P(table(['lake', 'dawn candle → Astir', 'Astir → next place', 'place → Murk', 'Murk → vigil', 'walking per day'], LAKES.map((id) => [id, ...['a', 'b', 'c', 'd', 'total'].map((k) => `${f1(ROUTE[id][k])} s`)])));
P();
P('## Kinematic dodges (escape probability once the tell is seen)');
P(table(['skill', 'killer', 'raft', 'foot, open', 'foot, walkway'], Object.entries(KTAB).map(([k, t]) => [...k.split(':'), pc(t.raft), pc(t.free), pc(t.one)])));
P();
P('## Outcomes');
const row = (name, r) => { const nd = r.deaths.length || 1; return [name, `${f0(pct(r.deaths, 0.5))} (${f0(pct(r.deaths, 0.1))}–${f0(pct(r.deaths, 0.9))})`, `${pc(r.zones[1] / r.n)} / ${pc(r.zones[2] / r.n)} / ${pc(r.zones[3] / r.n)}`, pc(r.wins / r.n), pc((r.causes.darkness || 0) / nd), f0(pct(r.cadence, 0.5))]; };
P(table(['profile', 'death day med (p10–p90)', 'reach Spore / Glass / Pallid', 'win %', 'darkness deaths', 'level-up every (s)'],
  [row('v1 · average fresh', R1.avg0), row('walk · average fresh', R2.avg0), row('v1 · skilled fresh', R1.sk0), row('walk · skilled fresh', R2.sk0), row('v1 · skilled after 8', R1.sk8), row('walk · skilled after 8', R2.sk8)]));
P(`First victory (median run, skilled campaigns): v1 ${f0(R1.firstWin)} (won by run 8: ${pc(R1.wonBy8)}, by 13: ${pc(R1.wonBy13)}) · walk ${f0(R2.firstWin)} (${pc(R2.wonBy8)}, ${pc(R2.wonBy13)}). Learner first Glasswater / Pallid: v1 ${f0(R1.learnerGlass)} / ${f0(R1.learnerPallid)} · walk ${f0(R2.learnerGlass)} / ${f0(R2.learnerPallid)}.`);
P();
P('## Per lake (skilled fresh + after 8 runs pooled): catches / Shells per day, Embers lost per night, darkness share of deaths');
const pool = (b, key, z) => { const a = report[b].sk0, c = report[b].sk8; return key === 'fish' ? (a.fish[z] + c.fish[z]) / Math.max(1, a.days[z] + c.days[z]) : key === 'shells' ? (a.shells[z] + c.shells[z]) / Math.max(1, a.days[z] + c.days[z]) : key === 'hits' ? mean([...a.hitsZone[z], ...c.hitsZone[z]]) : key === 'oil' ? mean([...a.oilZone[z], ...c.oilZone[z]]) : (a.darkByZone[z] + c.darkByZone[z]) / Math.max(1, a.deathByZone[z] + c.deathByZone[z]); };
const rel = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b !== 0 ? `${a >= b ? '+' : ''}${Math.round((a / b - 1) * 100)}%` : '—');
const lakeRows = [];
for (const z of [0, 1, 2, 3]) lakeRows.push([D.ZONES[z].name, `${f1(pool('v1', 'fish', z))} → ${f1(pool('walk', 'fish', z))} (${rel(pool('walk', 'fish', z), pool('v1', 'fish', z))})`, `${f0(pool('v1', 'shells', z))} → ${f0(pool('walk', 'shells', z))} (${rel(pool('walk', 'shells', z), pool('v1', 'shells', z))})`,
  `${f1(pool('v1', 'hits', z))} → ${f1(pool('walk', 'hits', z))} (${rel(pool('walk', 'hits', z), pool('v1', 'hits', z))})`, `${f0(pool('v1', 'oil', z))} → ${f0(pool('walk', 'oil', z))}`, `${pc(pool('v1', 'dark', z))} → ${pc(pool('walk', 'dark', z))}`]);
P(table(['lake', 'catches / day', 'Shells / day', 'Embers lost / night', 'oil net / night', 'darkness deaths'], lakeRows));
P();
const checks = [];
const chk = (name, val, ok) => checks.push([name, val, ok ? 'PASS' : 'MISS']);
const a0 = R2.avg0, s0 = R2.sk0, s8 = R2.sk8;
chk('average fresh: median death day 4 (p10–p90 3–5)', `${f0(pct(a0.deaths, 0.5))} (${f0(pct(a0.deaths, 0.1))}–${f0(pct(a0.deaths, 0.9))})`, pct(a0.deaths, 0.5) === 4 && pct(a0.deaths, 0.1) >= 3 && pct(a0.deaths, 0.9) <= 5);
chk('average fresh: Glasswater reach ≈ 1–2% (≤ 3%)', pc(a0.zones[2] / a0.n), a0.zones[2] / a0.n <= 0.03);
chk('skilled fresh: median death day 7', f0(pct(s0.deaths, 0.5)), pct(s0.deaths, 0.5) === 7);
chk('skilled after 8 runs: win 10–40%', pc(s8.wins / s8.n), s8.wins / s8.n >= 0.10 && s8.wins / s8.n <= 0.40);
chk('skilled campaigns: first win in runs 7–9', f0(R2.firstWin), R2.firstWin >= 7 && R2.firstWin <= 9);
chk('learner: first Pallid Deep at run ≥ 12', f0(R2.learnerPallid), R2.learnerPallid >= 12);
for (const z of [2, 3]) {
  chk(`${D.ZONES[z].name}: darkness share of deaths does not drop`, `${pc(pool('v1', 'dark', z))} → ${pc(pool('walk', 'dark', z))}`, pool('walk', 'dark', z) >= pool('v1', 'dark', z) - 0.02);
  chk(`${D.ZONES[z].name}: Embers lost per night within ±10% of v1`, rel(pool('walk', 'hits', z), pool('v1', 'hits', z)), Math.abs(pool('walk', 'hits', z) / pool('v1', 'hits', z) - 1) <= 0.10);
}
for (const z of [1, 2, 3]) {
  chk(`${D.ZONES[z].name}: catches per day within ±10% of v1`, rel(pool('walk', 'fish', z), pool('v1', 'fish', z)), Math.abs(pool('walk', 'fish', z) / pool('v1', 'fish', z) - 1) <= 0.10);
  chk(`${D.ZONES[z].name}: Shells per day within ±10% of v1`, rel(pool('walk', 'shells', z), pool('v1', 'shells', z)), Math.abs(pool('walk', 'shells', z) / pool('v1', 'shells', z) - 1) <= 0.10);
}
chk('level-up cadence nights 2–3 within ±10% (skilled)', `${f0(pct(R1.sk0.cadence, 0.5))} → ${f0(pct(s0.cadence, 0.5))} s`, Math.abs(pct(s0.cadence, 0.5) / pct(R1.sk0.cadence, 0.5) - 1) <= 0.10);
P('## Acceptance (walking build)');
P(table(['target', 'sim', 'result'], checks));
console.log(out.join('\n'));
if (args.json) console.log(JSON.stringify({ route: ROUTE, kin: KTAB, checks }, null, 1));
