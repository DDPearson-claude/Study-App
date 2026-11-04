// tools/sim/model.mjs — the GLOOMWATER run model used by balance-sim.mjs.
// One run = days of (calm fishing economy → dusk → Gloomtide damage race → dawn) until death
// or victory. Every rule cites DESIGN.md; every number is read from src/data.js. Player skill
// lives in SKILLS (documented assumptions); strategies are flags for degenerate-strategy probes.
import * as D from '../../src/data.js';
import { fightSample } from './reel.mjs';

const B = D.BALANCE;
const DIR = B.combat.director;
const ZN = D.ZONES.length;

// ===================================================================================== RNG
export function mulberry32(a) {
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const U = (rng, a, b) => a + (b - a) * rng();
const gauss = (rng) => { let u = 0; while (u === 0) u = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); };
const expo = (rng, mean) => -Math.log(1 - rng()) * mean;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
function pickW(rng, items, wf) { let s = 0; for (const it of items) s += wf(it); let r = rng() * s; for (const it of items) { r -= wf(it); if (r <= 0) return it; } return items[items.length - 1]; }

// ===================================================================================== skills
// All player-skill assumptions in one place. "average" ≈ a first-time but attentive player;
// "skilled" ≈ a strong action-game player who reads tells and plays the economy well.
export const SKILLS = {
  average: {
    id: 'average',
    reel: { id: 'avg', rt: 0.22, noise: 0.05, warnNotice: 0.8, leapMisread: 0.3, mixedMisread: 0.35, decoyFooled: 0.4, lapseRate: 0.04, lapseTime: 0.5, panicAt: 0.82, sweetTrack: 0.5, bandHalf: 0.09 },
    rtMedian: 0.36, rtSigma: 0.28,          // hook-set reaction (lognormal), s
    spookNibble: 0.05, spookFeint: 0.25,    // early-tap chance per nibble / per feint
    cleanCast: 0.3, castTime: 1.5, inSpot: 0.55, deepBias: 1.0, sailEff: 0.7,
    merchantTrip: 16, duskFish: 4, battery: 0, duskTopUp: 0.6, burnAt: 0.25, burnRemember: 0.7,
    legendDay: 2, bountyComplete: 0.35, descend: 'cautious',
    zapRate: 0.22, zapFloor: 0.1, zapAim: 0.8, flareCrowd: 6, flareOilMin: 0.3, flareOnStain: 0.4,
    dodge: { gloomling: 0.12, inkmite: 0.06, sporeling: 0.10, silent_choir: 0.08, belljar_tick: 0.15, glob: 0.8, slam: 0.75, eel: 0.2 },
    kite: 0.97, cinderEff: 0.62, mothPeel: 2.6, eelZap: 0.45, inkwellHunt: 0, handFocus: 0.45,
    wardenInLight: 0.55, wardenFocus: 0.55, wardenHitEvery: 40,
    boonNoise: 30, rerollUse: 0.3, upgradeNoise: 0.35,
  },
  skilled: {
    id: 'skilled',
    reel: { id: 'sk', rt: 0.14, noise: 0.025, warnNotice: 0.95, leapMisread: 0.08, mixedMisread: 0.12, decoyFooled: 0.12, lapseRate: 0.01, lapseTime: 0.3, panicAt: 0.85, sweetTrack: 0.95, bandHalf: 0.05 },
    rtMedian: 0.27, rtSigma: 0.2,
    spookNibble: 0.012, spookFeint: 0.08,
    cleanCast: 0.65, castTime: 1.0, inSpot: 0.85, deepBias: 1.8, sailEff: 0.85,
    merchantTrip: 11, duskFish: 9, battery: 1, duskTopUp: 0.85, burnAt: 0.35, burnRemember: 1,
    legendDay: 1, bountyComplete: 0.55, descend: 'ready',
    zapRate: 0.4, zapFloor: 0.2, zapAim: 0.92, flareCrowd: 8, flareOilMin: 0.35, flareOnStain: 0.85,
    dodge: { gloomling: 0.32, inkmite: 0.18, sporeling: 0.28, silent_choir: 0.22, belljar_tick: 0.35, glob: 0.93, slam: 0.92, eel: 0.5 },
    kite: 0.88, cinderEff: 0.85, mothPeel: 1.2, eelZap: 0.8, inkwellHunt: 4, handFocus: 0.7,
    wardenInLight: 0.75, wardenFocus: 0.75, wardenHitEvery: 90,
    boonNoise: 6, rerollUse: 1, upgradeNoise: 0.05,
  },
};

/** A player who starts "average" and learns: blend t in [0,1] of the way toward "skilled". */
export function blendSkill(t, id = 'learner') {
  const a = SKILLS.average, b = SKILLS.skilled;
  const mix = (x, y) => (typeof x === 'number' && typeof y === 'number' ? x + (y - x) * t : (t < 0.5 ? x : y));
  const out = { id: `${id}${t.toFixed(2)}` };
  for (const k of Object.keys(a)) {
    if (k === 'id') continue;
    if (a[k] && typeof a[k] === 'object') { out[k] = {}; for (const kk of Object.keys(a[k])) out[k][kk] = mix(a[k][kk], b[k][kk]); }
    else out[k] = mix(a[k], b[k]);
  }
  out.reel.id = `r${Math.round(t * 10)}`;    // reel cache bucket
  out.battery = Math.round(out.battery);
  return out;
}

// ===================================================================================== stats
const LEVELLED = (list, levels) => list.filter((x) => levels[x.id]).map((x) => [x, levels[x.id]]);
export function computeStats(meta, run) {
  const s = {};
  for (const [k, v] of Object.entries(D.STATS)) s[k] = v.base;
  const add = (eff, n = 1) => { for (const [k, v] of Object.entries(eff || {})) if (k in s) s[k] += v * n; };
  add(D.CHARACTER_BY_ID[run.character]?.effects);
  for (const [u, l] of LEVELLED(D.UPGRADES, run.upgrades)) add(u.effects, l);
  for (const [r, l] of LEVELLED(D.RELICS, meta.relics)) add(r.effects, l);
  for (const [b, l] of LEVELLED(D.BOONS, run.boons)) if (b.kind === 'stat') add(b.effects, l);
  for (const z of D.ZONES) if (meta.perks?.[z.id]) add(D.JOURNAL_PERKS[z.id].effects);
  s.maxHp += run.heartwax || 0;
  s.rarityBonus += run.mercy || 0;
  for (const [k, v] of Object.entries(D.STATS)) if (v.min != null) s[k] = clamp(s[k], v.min, v.max);
  s.maxHp = Math.round(s.maxHp); s.creelSize = Math.round(s.creelSize);
  return s;
}
const relicLvl = (meta, id) => meta.relics[id] || 0;
const specialSum = (meta, key) => D.RELICS.reduce((a, r) => (r.special?.startsWith(key + ':') && meta.relics[r.id] ? a + parseFloat(r.special.split(':')[1]) * meta.relics[r.id] : a), 0);

// ===================================================================================== meta
export function newMeta() {
  return { memories: 0, memoriesTotal: 0, relics: {}, unlocks: {}, challenges: {}, journal: {}, perks: {}, totalFish: 0, totalSlain: 0,
    totalElites: 0, totalBosses: 0, wardensKilled: {}, bestDay: 0, bestLevel: 0, deepestZone: 0, runs: 0, victories: 0, shimmered: false, heavy: false, speciesCatches: {} };
}
const isUnlocked = (meta, key) => !!meta.unlocks[key];

// ===================================================================================== run
export function newRun(meta, opt = {}) {
  const ch = D.CHARACTER_BY_ID[opt.character || 'wick'];
  const run = {
    character: ch.id, day: 1, zone: opt.startZone || 0, nightInZone: 0, zoneEnteredDay: 1,
    shells: B.economy.startShells + specialSum(meta, 'startShells') + (ch.startKit?.shells || 0),
    bait: { ...(ch.startKit?.bait || {}) }, creel: [], upgrades: {}, boons: { [ch.startBoon]: 1 }, level: 1, xp: 0,
    heartwax: 0, mercy: 0, legendaries: {}, wounded: {}, legendBait: {}, flareCharges: 0, rerollsUsed: 0,
    streak: 0, lastFlickerDay: 0, pityUsed: false, secondWickUsed: false, bounties: [], bountiesDone: 0, kindleMiss: 0,
    stats: { fishCaught: 0, fishLost: 0, perfectHooks: 0, enemiesSlain: 0, elitesSlain: 0, bossesSlain: 0, shellsEarned: 0, newSpecies: 0,
      nightsSurvived: 0, nightsNoDamage: 0, damageTaken: 0, maxLevel: 1, slainNightMax: 0, kindled: false, weaponL5: false, perfectFish: 0, heavy: false },
    deepestEndured: -1, cause: null, won: false, dead: false, log: [], wardensKilled: {},
    shellsByZone: [0, 0, 0, 0], daysByZone: [0, 0, 0, 0], nightLog: [], trophies: [],
  };
  const bundle = relicLvl(meta, 'drifters_bundle');
  if (bundle >= 1) { run.bait.mireworm = (run.bait.mireworm || 0) + 8; run.bait.lumen_moss = (run.bait.lumen_moss || 0) + 3; }
  if (bundle >= 2) run.legendBait[D.ZONES[run.zone].legendary] = 1;
  if (run.zone > 0) { // Waystone start
    const zid = D.ZONES[run.zone].id;
    run.shells += B.economy.waystonePurse[zid] || 0;
    run.bankedLevels = B.economy.waystoneLevels[zid] || 0;
  }
  const st = computeStats(meta, run);
  run.hp = st.maxHp; run.oil = st.maxOil; run.sat = st.maxSatiety;
  return run;
}

function earnShells(run, n, src = 'other') { if (n <= 0) return; run.shells += n; run.stats.shellsEarned += n; run.shellsByZone[run.zone] += n; (run.shellSrc ||= {})[src] = (run.shellSrc[src] || 0) + n; }

// ===================================================================================== boons
const weaponCount = (run) => Object.keys(run.boons).filter((id) => D.BOON_BY_ID[id].kind === 'weapon').length;
const passiveCount = (run) => Object.keys(run.boons).filter((id) => D.BOON_BY_ID[id].kind === 'stat').length;
const WEAPON_BELIEF = { orbit: 0.95, motes: 1.0, trail: 0.85, hook: 1.0, spark: 1.1, bell: 1.0, nova: 1.15, mines: 1.05, vortex: 1.05, beam: 1.15 };
const PASSIVE_BELIEF = { searing_glow: 55, brighter_wick: 50, fierce_flame: 55, restless_hands: 48, kindling_heart: 75, hardened_wax: 45, slow_burn: 42,
  cinder_magnet: 38, swift_oars: 22, wildfire: 32, static_fingers: 18, steady_reel: 22, hungry_waters: 18, lucky_knot: 30, gutsfire: 30,
  lantern_on_the_line: 12, undying_ember: 95, moonless_calm: 95, gilded_hook: 30 };

function boonPool(meta, run) {
  const start = D.CHARACTER_BY_ID[run.character].startBoon;
  return D.BOONS.filter((b) => b.unlock === null || isUnlocked(meta, 'boon:' + b.id) || b.id === start);
}
function offerBoons(meta, run, st, rng, { n = 3, gift = false } = {}) {
  const wc = weaponCount(run), pc = passiveCount(run);
  const cand = [];
  for (const b of boonPool(meta, run)) {
    const lvl = run.boons[b.id] || 0;
    if (lvl >= b.maxLevel) {
      if (b.kind === 'weapon' && lvl === b.maxLevel && b.kindle && run.boons[b.kindle.requires]) cand.push({ b, kindle: true, rarity: 'legendary', lvl });
      continue;
    }
    if (!lvl && b.kind === 'weapon' && wc >= B.xp.maxWeapons) continue;
    if (!lvl && b.kind === 'stat' && pc >= B.xp.maxPassives) continue;
    if (gift && b.rarity === 'common') continue;
    cand.push({ b, kindle: false, rarity: b.rarity, lvl });
  }
  const wOf = (c) => B.xp.rarityWeights[c.rarity] * (1 + st.luck * B.xp.luckShift[c.rarity]) * (c.lvl && !c.kindle ? B.xp.ownedWeight : 1) * (c.kindle ? B.xp.kindleWeight : 1);
  const out = [];
  const pool = cand.slice();
  const take = (filter) => { const p = pool.filter(filter); if (!p.length) return false; const c = pickW(rng, p, wOf); out.push(c); pool.splice(pool.indexOf(c), 1); return true; };
  const kindles = pool.filter((c) => c.kindle);
  if (kindles.length && run.kindleMiss >= B.xp.kindleForceAfter) take((c) => c.kindle);
  if (run.level === 2 && !gift) { take((c) => c.b.kind === 'weapon' && !c.lvl); take((c) => c.b.kind === 'weapon' && !c.lvl); }
  if (run.level >= B.xp.weaponPityLevel && wc <= 1 && !out.some((c) => c.b.kind === 'weapon')) take((c) => c.b.kind === 'weapon');
  while (out.length < n && pool.length) take(() => true);
  return out;
}
function scoreBoon(c, run, st) {
  const b = c.b;
  if (c.kindle) return 140;
  if (b.kind === 'weapon') {
    if (c.lvl) return 60 + 6 * c.lvl;
    return [110, 95, 75, 55][Math.min(3, weaponCount(run))] * (WEAPON_BELIEF[b.weapon] || 1);
  }
  let v = PASSIVE_BELIEF[b.id] ?? 20;
  if (b.id === 'kindling_heart' && run.hp <= 2) v += 15;
  if (b.id === 'cinder_magnet' && (run.boons.cinder_magnet || 0) >= 2) v -= 13;
  if (b.id === 'steady_reel' && run.zone >= 1 && !run.legendaries[D.ZONES[run.zone].legendary]) v += 25;
  for (const [wid, wl] of Object.entries(run.boons)) { const w = D.BOON_BY_ID[wid]; if (w.kind === 'weapon' && wl >= 3 && w.kindle?.requires === b.id && !run.boons[b.id]) v += 20; }
  return v * Math.pow(0.92, c.lvl);
}
function levelUp(meta, run, sk, rng, ctx = {}) {
  const st = computeStats(meta, run);
  const n = ctx.n || 3;
  let opts = offerBoons(meta, run, st, rng, { n, gift: ctx.gift });
  const best = () => { let bc = null, bs = -1e9; for (const c of opts) { const s = scoreBoon(c, run, st) + gauss(rng) * sk.boonNoise; if (s > bs) { bs = s; bc = c; } } return [bc, bs]; };
  let [pick, score] = best();
  if (pick && score < 45 && run.rerollsUsed < st.rerolls && rng() < sk.rerollUse) { run.rerollsUsed++; opts = offerBoons(meta, run, st, rng, { n, gift: ctx.gift }); [pick] = best(); }
  if (!pick) { run.oil = Math.min(st.maxOil, run.oil + 30); return; }   // fallback: Oil Tears
  const hadKindle = opts.some((c) => c.kindle);
  if (pick.kindle) { run.boons[pick.b.id] = 6; run.stats.kindled = true; run.kindleMiss = 0; }
  else {
    run.boons[pick.b.id] = (run.boons[pick.b.id] || 0) + 1;
    if (hadKindle) run.kindleMiss++;
    if (pick.b.kind === 'weapon' && run.boons[pick.b.id] >= 5) run.stats.weaponL5 = true;
    const heal = pick.b.onPick?.heal || 0;
    if (heal) { const st2 = computeStats(meta, run); run.hp = Math.min(st2.maxHp, run.hp + heal); }
  }
}
function addXp(meta, run, sk, rng, amount, ctx) {
  run.xp += amount;
  let guard = 0;
  while (run.xp >= D.xpForLevel(run.level) && guard++ < 50) {
    run.xp -= D.xpForLevel(run.level);
    run.level++;
    run.stats.maxLevel = Math.max(run.stats.maxLevel, run.level);
    const first = ctx && !ctx.firstPickDone;
    if (ctx) ctx.firstPickDone = true;
    const quirk = D.CHARACTER_BY_ID[run.character].quirk;
    levelUp(meta, run, sk, rng, { n: first && quirk?.id === 'curious' ? quirk.choices : 3 });
  }
}

// ===================================================================================== fishing
const zoneOf = (run) => D.ZONES[run.zone];
const ZONE_SPECIES = D.ZONES.map((z) => D.SPECIES.filter((s) => s.zone === z.id && s.rarity !== 'legendary'));
function sampleDepth(run, sk, inSpot, rng) {
  const share = zoneOf(run).arena.depthShare || [33, 34, 33];
  const w = [share[0], share[1], share[2] * sk.deepBias];
  const band = pickW(rng, [0, 1, 2], (i) => w[i]);
  const [a, b] = [[0, 0.35], [0.35, 0.75], [0.75, 1]][band];
  return Math.max(inSpot ? B.spots.depthMin : 0, U(rng, a, b));
}
function baitBonus(run) { const b = D.BAIT_BY_ID[run.equippedBait]; return b && !b.legend && (run.bait[b.id] || 0) > 0 ? b.bonus : {}; }
function equipBait(run) {
  // best owned general bait: lumen moss > mire worms (moss raises rarity; worms speed bites)
  run.equippedBait = (run.bait.lumen_moss > 0 && run.zone >= 1) ? 'lumen_moss' : (run.bait.mireworm > 0 ? 'mireworm' : (run.bait.lumen_moss > 0 ? 'lumen_moss' : null));
}
function pickSpecies(run, st, depth, rb, gloom, rng) {
  const bb = baitBonus(run);
  const eq = run.equippedBait;
  const el = ZONE_SPECIES[run.zone].filter((s) => (s.time === 'any' || (s.time === 'calm' ? !gloom : gloom)) && s.depth[0] <= depth && depth <= s.depth[1] && (!s.bait || s.bait === eq));
  if (!el.length) return null;
  return pickW(rng, el, (s) => D.RARITY_WEIGHTS[s.rarity] * (s.rarity === 'uncommon' ? 1 + 2 * rb : s.rarity === 'rare' ? 1 + 4 * rb : 1)
    * ((bb.attract || []).includes(s.id) ? 2.5 : 1) * (s.bait && s.bait === eq ? 1.5 : 1));
}
function gearOf(st, starving) { return { LS: Math.round(st.lineStrength * 20) / 20, RS: Math.round(st.reelSpeed * (starving ? B.damage.starvation.reelMult : 1) * 20) / 20, SZ: Math.round(st.sweetZone * 200) / 200, slackTime: Math.round(st.slackTime * 10) / 10 }; }

/** One cast → bite → fight. Returns {time, fish|null, sp, perfect, lost}. */
function castOnce(meta, run, sk, st, rng, { gloom = false, legend = null } = {}) {
  const starving = run.sat <= 0;
  const pity = run.hp <= B.bite.pity.hp || run.oil / st.maxOil <= B.bite.pity.oilFrac;
  const clean = rng() < sk.cleanCast;
  const inSpot = !legend && rng() < sk.inSpot;
  const rare = inSpot && rng() < B.spots.rareChance;
  const bb = baitBonus(run);
  let time = sk.castTime + B.cast.flightBase + B.cast.flightPerM * 0.65 * st.castMax;
  let sp;
  if (legend) sp = legend;
  else {
    const depth = sampleDepth(run, sk, inSpot, rng);
    const rb = st.rarityBonus + (bb.rarityBonus || 0) + (inSpot ? (rare ? B.spots.rareRarity : B.spots.rarity) : 0) + (clean ? B.cast.cleanRarity : 0) + (pity ? B.bite.pity.rarity : 0);
    sp = pickSpecies(run, st, depth, rb, gloom, rng);
    if (!sp) return { time: time + 3, fish: null };
    if (run.equippedBait && run.bait[run.equippedBait] > 0) run.bait[run.equippedBait]--;
  }
  const biteSpd = st.biteSpeed + (bb.biteSpeed || 0);
  let W = (B.bite.waitBase + expo(rng, B.bite.waitMean)) / (biteSpd * (inSpot ? 1 / B.spots.waitMult : 1) * (gloom ? B.bite.gloomMult : 1));
  W *= (clean ? B.cast.cleanBiteMult : 1) * (pity ? B.bite.pity.waitMult : 1) * (legend ? B.spots.legend.waitMult : 1);
  W = clamp(W, B.bite.waitMin, B.bite.waitMax);
  time += W;
  // nibbles & feints → early taps
  const tells = st.nibbleTells + (bb.nibbleTells || 0);
  let nib = legend ? B.legend.nibbles : pickW(rng, [0, 1, 2, 3], (i) => B.bite.nibbles[i]) + (sp.rarity !== 'common' ? 1 : 0);
  let spookP = 1 - Math.pow(1 - sk.spookNibble * (tells >= 1 ? 0.3 : 1), nib);
  if (run.zone >= B.bite.feintZoneMin && sp.rarity === 'rare' && rng() < B.bite.feintChance) spookP = 1 - (1 - spookP) * (1 - sk.spookFeint * (tells >= 2 ? 0.3 : 1));
  if (rng() < spookP) { run.streak = 0; return { time: time - W * U(rng, 0, 0.6) + B.cast.spookReelIn, fish: null }; }
  const wounded = legend ? (run.wounded[legend.id] || 0) : 0;
  const win = clamp(sp.difficulty.window * (st.hookWindow + (bb.hookWindow || 0)) * (starving ? B.damage.starvation.windowMult : 1) + (wounded ? B.legend.windowBonus : 0), B.bite.windowMin, B.bite.windowMax);
  const RT = sk.rtMedian * (tells >= 1 ? 0.92 : 1) * Math.exp(gauss(rng) * sk.rtSigma);
  if (RT > win) { run.streak = 0; return { time: time + B.cast.reelInTime, fish: null, missed: true }; }
  const perfect = RT <= Math.max(B.bite.perfectMin, B.bite.perfectFrac * win);
  if (perfect) { run.stats.perfectHooks++; run.streak++; } else run.streak = 0;
  if (legend) run.legendBait[legend.id] = 0;            // legend bait is spent on hook
  const fight = fightSample(sp, gearOf(st, starving), sk.reel, perfect, wounded, rng);
  time += RT + fight.time;
  if (!fight.landed) {
    run.stats.fishLost++;
    if (legend) run.wounded[legend.id] = Math.min(B.legend.woundedMax, Math.max(wounded, B.legend.woundedCarry * fight.P));
    return { time, fish: null, lost: true, sp };
  }
  // quality, weight, value (DESIGN §5.8, §9.1)
  let q = fight.q + (perfect ? B.quality.perfectHookBonus : 0) + (inSpot ? (rare ? B.spots.rareQuality : B.spots.quality) : 0) + (bb.shimmer || 0) + specialSum(meta, 'shimmer');
  let tier = q >= D.QUALITY.perfect.threshold ? 'perfect' : q >= D.QUALITY.fine.threshold ? 'fine' : 'normal';
  if (tier === 'normal' && rng() < D.QUALITY.fine.chance) tier = 'fine'; else if (tier === 'fine' && rng() < D.QUALITY.perfect.chance) tier = 'perfect';
  const tt = Math.pow(rng(), B.economy.weightSkew / (1 + (bb.weightBias || 0)));
  const weight = sp.weight[0] + (sp.weight[1] - sp.weight[0]) * tt;
  const sizeK = B.economy.sizeK[0] + (B.economy.sizeK[1] - B.economy.sizeK[0]) * tt;
  const Q = D.QUALITY[tier];
  const fish = { sp, rarity: sp.rarity, legendary: sp.rarity === 'legendary', weight, quality: tier,
    value: Math.round(sp.value * sizeK * Q.valueMult * (1 + B.economy.streak.perStep * Math.min(run.streak, B.economy.streak.maxSteps))),
    food: Math.round(sp.food * sizeK * Q.yieldMult), oil: Math.round(sp.oil * sizeK * Q.yieldMult) };
  return { time, fish, perfect, sp };
}

function landFish(meta, run, sk, rng, fish, ctx) {
  run.stats.fishCaught++;
  meta.totalFish++;
  if (fish.quality === 'perfect') { run.stats.perfectFish++; meta.shimmered = true; }
  if (!fish.legendary && fish.weight > 8) meta.heavy = true;
  const id = fish.sp.id;
  meta.speciesCatches[id] = (meta.speciesCatches[id] || 0) + 1;
  if (!meta.journal[id]) {
    meta.journal[id] = true; run.stats.newSpecies++;
    if (!fish.legendary || B.economy.newSpeciesLegendary !== false) earnShells(run, Math.round(B.economy.newSpeciesShells * fish.sp.value), 'journal');
    const zid = fish.sp.zone;
    const inZone = D.SPECIES.filter((s) => s.zone === zid && meta.journal[s.id]).length;
    if (inZone === B.journal.halfZone) run.bonusMemories = (run.bonusMemories || 0) + B.journal.halfZoneMemories;
    if (inZone === 8) meta.perks[zid] = true;
  }
  if (meta.speciesCatches[id] === B.journal.masteryAt) run.bonusMemories = (run.bonusMemories || 0) + B.journal.masteryMemories;
  if (fish.legendary) {
    run.legendaries[id] = true;
    if (fish.sp.final) { run.won = true; }
  }
  const st = computeStats(meta, run);
  const quirk = D.CHARACTER_BY_ID[run.character].quirk;
  addXp(meta, run, sk, rng, D.fishXpFor(fish.rarity, run.zone) * st.xpMult * (quirk?.fishXpMult || 1), ctx);
}

/** Eat / render / keep (DESIGN §9; the task's decision rules). */
function decideCatch(meta, run, sk, strat, fish) {
  const st = computeStats(meta, run);
  if (fish.legendary) { run.creel.push(fish); return; }
  const eat = (f) => { run.sat = Math.min(st.maxSatiety, run.sat + f.food * st.foodMult); };
  const render = (f) => { run.oil = Math.min(st.maxOil, run.oil + f.oil * st.oilYieldMult); };
  if (strat.renderAll) { render(fish); return; }
  if (run.sat / st.maxSatiety < 0.4) { eat(fish); return; }
  if (run.oil / st.maxOil < 0.4) { render(fish); return; }
  run.creel.push(fish);
  if (run.creel.length > st.creelSize) {
    let lo = null;
    for (const f of run.creel) if (!f.legendary && (!lo || f.value < lo.value)) lo = f;
    run.creel.splice(run.creel.indexOf(lo), 1);
    if (run.oil / st.maxOil < 0.85) render(lo); else if (run.sat / st.maxSatiety < 0.85) eat(lo);   // else released
  }
}

// ===================================================================================== economy: shop
const NEED_LS = [1.0, 1.15, 1.3, 1.45];
function upgradeValue(u, run, st, sk) {
  const z = run.zone;
  const legendOpen = !run.legendaries[D.ZONES[z].legendary];
  const W = {
    castMax: 1.5, hookWindow: 50, slackTime: 12, lineStrength: (st.lineStrength < (z === 3 ? 1.9 : NEED_LS[Math.min(3, z + 1)]) && legendOpen ? 110 : 25),
    reelSpeed: legendOpen ? 70 : 25, sweetZone: 700, oilDrain: -900, maxOil: 0.45, auraDps: 48, lightRadius: 22, flareRadius: 3, flareCooldown: -3,
    flareCost: -1.2, zapDamage: 1.5, creelSize: st.creelSize < 6 ? 13 : 5, sellMult: 70, oilYieldMult: 38, foodMult: 14, armor: 260, moveSpeed: 7,
    pickupRadius: 3, maxHp: 50, maxSatiety: 0.15, rarityBonus: 110, biteSpeed: 22, nibbleTells: 6,
  };
  let v = 0;
  for (const [k, e] of Object.entries(u.effects)) v += (W[k] || 0) * e;
  return v;
}
function shopUpgrades(meta, run, sk, strat, rng, budget) {
  const st0 = computeStats(meta, run);
  let guard = 0;
  while (guard++ < 12) {
    const st = computeStats(meta, run);
    let best = null, bestR = 0;
    for (const u of D.UPGRADES) {
      if (strat.shopOnly && u.id !== strat.shopOnly) continue;
      if (u.zone && D.ZONE_BY_ID[u.zone].index > run.zone) continue;
      const lvl = run.upgrades[u.id] || 0;
      if (lvl >= u.maxLevel) continue;
      const price = u.costs[lvl];
      if (price > budget) continue;
      const r = upgradeValue(u, run, st, sk) / price * (1 + gauss(rng) * sk.upgradeNoise);
      if (r > bestR) { bestR = r; best = u; }
    }
    if (!best || (bestR < 0.06 && !strat.shopOnly)) break;
    const price = best.costs[run.upgrades[best.id] || 0];
    run.shells -= price; budget -= price;
    run.upgrades[best.id] = (run.upgrades[best.id] || 0) + 1;
  }
  void st0;
}
function trade(meta, run, sk, strat, rng) {
  const st = computeStats(meta, run);
  const z = run.zone, zone = D.ZONES[z];
  const smult = B.economy.supplyMult[z], bmult = B.economy.baitMult[z];
  const nextZone = D.ZONES[z + 1];
  const legendId = zone.legendary;
  const gateOpen = !!run.legendaries[legendId] && !!nextZone;
  // sell: everything non-legendary except `battery` cheapest fish (night oil)
  const keep = [];
  const sellable = run.creel.filter((f) => !f.legendary).sort((a, b) => a.value - b.value);
  for (let i = 0; i < Math.min(sk.battery, sellable.length); i++) keep.push(sellable[i]);
  for (const f of run.creel) {
    if (keep.includes(f)) continue;
    if (f.legendary) {
      const toll = nextZone?.unlock.shells ?? Infinity;
      if (run.shells < toll || !nextZone) { earnShells(run, Math.round(f.value * st.sellMult), 'legend'); continue; }   // Trophy or Toll
      keep.push(f); continue;
    }
    earnShells(run, Math.round(f.value * st.sellMult), 'sales');
  }
  run.creel = keep;
  // Murk's Pity
  if (!run.pityUsed && run.shells < B.merchant.pity.shells && run.oil / st.maxOil < B.merchant.pity.oilFrac) {
    run.pityUsed = true; run.oil = Math.min(st.maxOil, run.oil + 30); run.sat = Math.min(st.maxSatiety, run.sat + 30);
  }
  // bounties: up to `offer` new ones per visit, `maxActive` at once (completion rolled each calm)
  for (let i = Math.min(B.bounty.offer, B.bounty.maxActive - run.bounties.length); i > 0; i--) run.bounties.push({ due: run.day + B.bounty.durationDays });
  // reserve: toll if the gate is open, else the legend bait when we want to hunt
  const legendPrice = D.BAIT_BY_ID[D.SPECIES_BY_ID[legendId].bait].price;
  const wantLegend = !run.legendaries[legendId] && !run.legendBait[legendId] && run.day >= sk.legendDay;
  // supplies first: survival
  const oilTarget = sk.duskTopUp * st.maxOil;
  const flask = D.SUPPLY_BY_ID.oil_flask, cask = D.SUPPLY_BY_ID.oil_cask, cake = D.SUPPLY_BY_ID.moss_cake, loaf = D.SUPPLY_BY_ID.mushroom_loaf;
  const creelOil = run.creel.filter((f) => !f.legendary).reduce((a, f) => a + f.oil * st.oilYieldMult, 0);
  let g = 0;
  while (run.oil + creelOil < oilTarget && g++ < 6) {
    const s = z >= 1 && st.maxOil - run.oil > 80 ? cask : flask;
    const p = Math.round(s.price * smult);
    if (run.shells < p) break;
    run.shells -= p; run.oil = Math.min(st.maxOil, run.oil + s.give.oil);
  }
  g = 0;
  while (run.sat / st.maxSatiety < 0.5 && g++ < 4) {
    const s = z >= 1 ? loaf : cake;
    const p = Math.round(s.price * smult);
    if (run.shells < p) break;
    run.shells -= p; run.sat = Math.min(st.maxSatiety, run.sat + s.give.satiety);
  }
  // legend bait
  if (wantLegend && run.shells >= legendPrice) { run.shells -= legendPrice; run.legendBait[legendId] = 1; }
  // gate toll reserve
  const reserve = gateOpen ? (nextZone.unlock.shells) : (wantLegend && !run.legendBait[legendId] ? legendPrice : 0);
  // wax patch
  const wax = Math.round(D.SUPPLY_BY_ID.wax_patch.price * smult);
  if (run.hp <= st.maxHp - 2 && run.shells - wax >= reserve + 20) { run.shells -= wax; run.hp++; }
  // gear
  shopUpgrades(meta, run, sk, strat, rng, Math.max(0, run.shells - reserve - 10));
  // general bait
  const worm = D.BAIT_BY_ID.mireworm, moss = D.BAIT_BY_ID.lumen_moss;
  if ((run.bait.mireworm || 0) < 3 && run.shells - Math.round(worm.price * bmult) >= reserve + 15) { run.shells -= Math.round(worm.price * bmult); run.bait.mireworm = (run.bait.mireworm || 0) + worm.count; }
  if (z >= 1 && (run.bait.lumen_moss || 0) < 2 && run.shells - Math.round(moss.price * bmult) >= reserve + 40) { run.shells -= Math.round(moss.price * bmult); run.bait.lumen_moss = (run.bait.lumen_moss || 0) + moss.count; }
  equipBait(run);
}

// ===================================================================================== calm (day)
const drainCache = new Map();
function drainMultFor(day, zone) { const k = day * 8 + zone; let v = drainCache.get(k); if (v == null) { v = D.difficultyFor(day, zone, 0.5).drainMult; drainCache.set(k, v); } return v; }
function drainFor(meta, run, st, secs, phase) {
  const diff = { drainMult: drainMultFor(run.day, run.zone) };
  const zone = zoneOf(run);
  run.oil = Math.max(0, run.oil - st.oilDrain * B.drain.oilPhase[phase] * zone.drain.oil * diff.drainMult * secs);
  run.sat = Math.max(0, run.sat - st.satietyDrain * zone.drain.satiety * diff.drainMult * secs);
}
function fishFor(meta, run, sk, strat, rng, budget, ctx) {
  let used = 0;
  while (used < budget - 4) {
    const st = computeStats(meta, run);
    const r = castOnce(meta, run, sk, st, rng, {});
    const dt = r.time + (r.fish && rng() < sk.inSpot ? (U(rng, 10, 30) / (st.moveSpeed * sk.sailEff) + 2) : 1);
    used += dt;
    drainFor(meta, run, st, dt, 'calm');
    if (used > budget + 6) break;            // ran out of light mid-fight: still lands (fights may spill into dusk)
    if (r.fish) { landFish(meta, run, sk, rng, r.fish, ctx); decideCatch(meta, run, sk, strat, r.fish); }
  }
  return used;
}
function legendAttempt(meta, run, sk, strat, rng, ctx, gloom) {
  const zone = zoneOf(run);
  const sp = D.SPECIES_BY_ID[zone.legendary];
  if (run.legendaries[sp.id] || !run.legendBait[sp.id]) return 0;
  if ((sp.time === 'gloom') !== !!gloom) return 0;
  const st = computeStats(meta, run);
  let used = 0, tries = 0;
  while (run.legendBait[sp.id] && !run.legendaries[sp.id] && tries++ < 3) {
    const r = castOnce(meta, run, sk, st, rng, { legend: sp, gloom });
    used += r.time;
    if (r.fish) { landFish(meta, run, sk, rng, r.fish, ctx); decideCatch(meta, run, sk, strat, r.fish); }
    if (r.lost) break;
  }
  return used;
}
function simulateCalm(meta, run, sk, strat, rng) {
  const ctx = { firstPickDone: true };
  const calm = B.phases.calm;
  equipBait(run);
  // descend at calm start (DESIGN §14: calm or dawn)
  maybeDescend(meta, run, sk, strat);
  run.daysByZone[run.zone]++;
  let t = 0;
  // bounties completing today
  for (const b of run.bounties.slice()) {
    if (rng() < sk.bountyComplete) {
      earnShells(run, Math.round(36 * zoneOf(run).valueMult * (1 + B.bounty.dayGrowth * (run.day - 1))), 'bounty');
      run.bountiesDone++; run.bounties.splice(run.bounties.indexOf(b), 1);
    } else if (b.due < run.day) run.bounties.splice(run.bounties.indexOf(b), 1);
  }
  // calm legendaries: hunt first if the bait is in hand
  const travel = 14 / (computeStats(meta, run).moveSpeed / 6);
  if (run.legendBait[zoneOf(run).legendary] && D.SPECIES_BY_ID[zoneOf(run).legendary].time === 'calm') {
    t += travel; drainFor(meta, run, computeStats(meta, run), travel, 'calm');
    t += legendAttempt(meta, run, sk, strat, rng, ctx, false);
  }
  // calm stragglers: one creelsnatch raid per calm from lake 1 or day 5 (DESIGN §7.2)
  const sg = B.combat.stragglers;
  if ((run.zone >= sg.fromZone || run.day >= sg.fromDay) && run.creel.some((f) => !f.legendary) && rng() > sk.eelZap) {
    const st = computeStats(meta, run);
    if (rng() > sk.dodge.eel * 0.5) {
      const i = run.creel.findIndex((f) => !f.legendary); run.creel.splice(i, 1);
      if (rng() >= st.armor) { run.hp -= 1; run.stats.damageTaken++; if (run.hp <= 0) { run.dead = true; run.cause = 'gloom'; return; } }
    }
  }
  const merchantAt = Math.max(t, calm * 0.8 - sk.merchantTrip);
  if (merchantAt > t) t += fishFor(meta, run, sk, strat, rng, merchantAt - t, ctx);
  t += sk.merchantTrip; drainFor(meta, run, computeStats(meta, run), sk.merchantTrip, 'calm');
  trade(meta, run, sk, strat, rng);
  // a freshly bought calm-legend bait can be tried in what is left of the calm + dusk
  if (run.legendBait[zoneOf(run).legendary] && D.SPECIES_BY_ID[zoneOf(run).legendary].time === 'calm' && calm + B.phases.dusk - t > 25) {
    t += travel; t += legendAttempt(meta, run, sk, strat, rng, ctx, false);
  }
  if (t < calm + sk.duskFish) fishFor(meta, run, sk, strat, rng, calm + sk.duskFish - t, ctx);
  // dusk drains + top-up from the creel before the Gloomtide
  const st = computeStats(meta, run);
  drainFor(meta, run, st, B.phases.dusk, 'dusk');
  topUp(meta, run, sk);
}
function topUp(meta, run, sk) {
  const st = computeStats(meta, run);
  const fishList = () => run.creel.filter((f) => !f.legendary).sort((a, b) => a.value - b.value);
  let g = 0;
  while (run.oil / st.maxOil < sk.duskTopUp && fishList().length > sk.battery && g++ < 8) {
    const f = fishList()[0]; run.creel.splice(run.creel.indexOf(f), 1); run.oil = Math.min(st.maxOil, run.oil + f.oil * st.oilYieldMult);
  }
  g = 0;
  while (run.sat / st.maxSatiety < 0.5 && fishList().length > sk.battery && g++ < 4) {
    const f = fishList()[0]; run.creel.splice(run.creel.indexOf(f), 1); run.sat = Math.min(st.maxSatiety, run.sat + f.food * st.foodMult);
  }
}
function maybeDescend(meta, run, sk, strat) {
  const policy = strat.descend || sk.descend || 'asap';
  if (policy === 'never') return false;
  const zone = zoneOf(run), next = D.ZONES[run.zone + 1];
  if (!next || !run.legendaries[zone.legendary]) return false;
  if (policy === 'cautious') {   // average: wait one night in a new lake and descend with most Embers intact (or after 4 nights)
    const st = computeStats(meta, run);
    if (!(run.nightInZone >= 4 || (run.nightInZone >= 2 && run.hp >= 0.6 * st.maxHp))) return false;
  }
  if (policy === 'ready') {   // skilled: take the lake's Warden night first unless the build is clearly ahead; never overstay
    const last = run.nightLog[run.nightLog.length - 1];
    const st = computeStats(meta, run);
    const comfy = last && last.emberLost <= 1 && run.hp >= st.maxHp - 1;
    if (!(run.nightInZone >= 4 || (run.nightInZone >= 3 && comfy) || (run.nightInZone >= 2 && comfy && last.emberLost === 0))) return false;
  }
  // a sold legendary still counts (run.legendaries); pay the toll from Shells
  if (run.shells < next.unlock.shells) {
    const leg = run.creel.find((f) => f.legendary && f.sp.id === zone.legendary);
    if (leg && run.shells + leg.value >= next.unlock.shells) { run.creel.splice(run.creel.indexOf(leg), 1); earnShells(run, leg.value, 'legend'); }
    else return false;
  }
  run.shells -= next.unlock.shells;
  run.zone++; run.nightInZone = 0; run.zoneEnteredDay = run.day;
  meta.deepestZone = Math.max(meta.deepestZone, run.zone);
  return true;
}

// ===================================================================================== night (Gloomtide damage race)
const ENEMY = D.ENEMY_BY_ID;
const PROJ_EFF = 0.8;   // homing projectiles: travel time, volley overkill, misses on lunging targets
const CHAIN_AREA = Math.PI * (20 * 20 - 3 * 3) / 4;   // effective annulus area per chain search (enemies cluster toward the raft ≈ ×4 density)
function weaponParams(id, lvl) { const b = D.BOON_BY_ID[id]; return lvl >= 6 && b.kindle ? b.kindle.params : b.levels[Math.min(lvl, b.maxLevel) - 1]; }

export function simulateNight(meta, run, sk, strat, rng, opts = {}) {
  const z = run.zone, day = run.day, zone = zoneOf(run);
  run.nightInZone++;
  const L = D.gloomtideLength(day);
  const d0 = D.difficultyFor(day, z, 0.5, { nightInZone: run.nightInZone });
  const H = d0.heat, xpScale = d0.xpScale;
  const ctx = { firstPickDone: false };
  const dt = 0.25;
  const quirk = D.CHARACTER_BY_ID[run.character].quirk || {};
  let st = computeStats(meta, run);
  const statsDirty = () => { st = computeStats(meta, run); };
  const cohorts = [];
  const latched = [];
  const hands = [];
  let warden = null;
  let credit = 0, t = 0, iframes = 0, flareCd = 0, zapBudget = 0, flareBoost = 0, dimSlick = 0, dimSpore = 0, hushT = 0, darkT = -1, starveT = -1;
  let dripAt = B.combat.oilDrips.every, killsNight = 0, emberLost = 0, hitEvents = 0, burnArmed = rng() < sk.burnRemember, ashKills = 0, spinHurt = 0;
  const oilStart = run.oil;
  const wTimers = {};
  const floats = [];
  const vortices = [];
  const recentLost = [];
  let oilAcc = 0, oilMin = 1, oilStartFrac = run.oil / st.maxOil;
  let xpGained = 0, spawnedN = 0, anchT = 0, contactsN = 0, dodgedN = 0, iframeAbsorb = 0;
  const nextElite = d0.eliteEvery > 0 ? d0.eliteFirstAt * L : Infinity;
  let eliteAt = nextElite;
  const bossAt = d0.boss ? d0.bossAt * L + 3 : Infinity;
  const formAt = d0.formationAt.map((k) => k * L);
  // night legend fight (gloom-time legendaries, DESIGN §5.6, §5.9)
  const legSp = D.SPECIES_BY_ID[zone.legendary];
  let fight = null;
  if (legSp.time === 'gloom' && run.legendBait[legSp.id] && !run.legendaries[legSp.id]) fight = { start: 0.1 * L, end: Infinity, done: false };
  const gloomDraw = (D.BAIT_BY_ID[run.equippedBait]?.bonus?.gloomDraw || 0) + (fight ? (D.BAIT_BY_ID[legSp.bait]?.bonus?.gloomDraw || 0) : 0);

  const enemyHp = (e) => e.hp * d0.hpMult;
  function spawnCohort(e, n, dist, extra = {}) {
    const c = { e, id: e.id, n, hp: enemyHp(e), aoe: 0, st: 0, dist, stun: 0, slow: 0, slowT: 0, lunge: 0, paused: false, state: 'approach', timer: 0, fire: U(rng, 0, 4), speedMult: 1, ...extra };
    if (e.behavior === 'artillery') c.hold = U(rng, ...e.artillery.hold);
    cohorts.push(c);
    return c;
  }
  let aliveN = 0;
  const alive = () => aliveN + latched.length;
  const lightR = () => {
    if (run.oil <= 0) return B.light.emberGlow;
    const of = run.oil / st.maxOil;
    let dims = Math.pow(B.light.mothDim, latched.length) * (dimSlick > 0 ? B.light.slick : 1) * (dimSpore > 0 ? 0.85 : 1) * (hushT > 0 ? B.light.hush : 1) * (warden?.alive && warden.p2 ? 0.85 : 1);
    dims = Math.max(B.light.dimFloor, dims);
    return st.lightRadius * (B.light.floorRadius + (1 - B.light.floorRadius) * of) * dims * (flareBoost > 0 ? B.combat.flare.lightBoost : 1);
  };
  const dmgMul = (critMult = 2) => st.damageMult * (1 + Math.min(0.75, st.critChance) * (critMult - 1));
  const lvlScale = D.weaponScale(run.level);
  const anchored = () => fight && !fight.done && t >= fight.start && t < fight.end;
  const visible = (c, lr) => !(c.e.behavior === 'stalk' && c.dist > lr && !run.boons.lighthouse_beam) && !(c.e.behavior === 'leap' && c.state === 'circle');

  function kill(c, members) {
    if (members <= 0) return;
    members = Math.min(members, c.n);
    c.n -= members;
    killsNight += members; run.stats.enemiesSlain += members; meta.totalSlain += members;
    const eff = Math.min(0.97, sk.cinderEff + 0.03 * (st.pickupRadius - 4));
    const xp = c.e.xp * xpScale * st.xpMult * members;
    gainXp(xp * eff);
    recentLost.push([t, xp * (1 - eff)]);
    if (t >= dripAt) { dripAt = t + B.combat.oilDrips.every; run.oil = Math.min(st.maxOil, run.oil + B.combat.oilDrips.base + B.combat.oilDrips.perZone * z); }
    if (c.e.deathBurst && c.n > 0) c.aoe += c.e.deathBurst.damage * st.damageMult * 0.6 * members;
    if (quirk.id === 'cinder_heart') { ashKills += members; while (ashKills >= quirk.every) { ashKills -= quirk.every; aoe(quirk.radius, (B.combat.flare.damage * lvlScale * dmgMul()) * quirk.damageMult); } }
  }
  function resolve(c) {
    if (c.n <= 0) return;
    if (c.aoe >= c.hp) { kill(c, c.n); return; }
    while (c.n > 0 && c.aoe + c.st >= c.hp) { kill(c, 1); c.st = 0; }
  }
  function taken(c, src) {
    if (src === 'aura') return c.e.behavior === 'bulwark' ? (c.aoe + c.st > c.hp * 0.5 ? c.e.auraTakenCracked : c.e.auraTaken) : (c.e.auraTaken ?? 1);
    if (src === 'zap' && c.e.zapTaken) return c.e.zapTaken;
    return 1;
  }
  function aoe(radius, dmg, opts = {}) {   // full-circle AoE: every member within `radius` takes dmg
    for (const c of cohorts) if (c.n > 0 && c.dist <= radius && visible(c, radius + 50)) {
      c.aoe += dmg * (opts.src ? taken(c, opts.src) : 1) * (c.chill > 0 ? 1.3 : 1);
      if (opts.knock) c.dist += opts.knock;
      if (opts.stun) c.stun = Math.max(c.stun, opts.stun);
      if (opts.slow) { c.slow = opts.slow; c.slowT = opts.slowTime; if (opts.chill) c.chill = opts.slowTime; }
      resolve(c);
    }
    for (const m of latched) if (radius >= 0) m.dmg += dmg;
    if (hands.length) for (const h of hands) if (h.vuln) h.dmg += dmg * (h.stagger > 0 ? 1.5 : 1) * 0.8;
    if (warden?.alive && rng() < sk.wardenInLight) warden.dmg += dmg;
  }
  function single(dmg, range, lr, { chainN = 0, chainRange = 0, focusBoss = true, src = null, stun = 0 } = {}) {
    // focus: hands / warden draw a share of single-target shots
    if (focusBoss && warden?.alive && rng() < sk.wardenFocus) { warden.dmg += dmg; return; }
    if (focusBoss && hands.some((h) => h.vuln) && rng() < sk.handFocus) { const h = hands.find((x) => x.vuln); h.dmg += dmg * (h.stagger > 0 ? 1.5 : 1); return; }
    let best = null;
    for (const c of cohorts) if (c.n > 0 && c.dist <= range && visible(c, lr) && (!best || c.dist < best.dist)) best = c;
    if (!best) { if (latched.length) latched[0].dmg += dmg; return; }
    let cur = best, hits = 0;
    while (cur && hits <= chainN) {
      cur.st += dmg * (src ? taken(cur, src) : 1) * (cur.chill > 0 ? 1.3 : 1);
      if (stun) cur.stun = Math.max(cur.stun, stun);
      resolve(cur);
      hits++;
      if (hits > chainN) break;
      if (cur.n > 0 && chainRange >= 2 && rng() < 0.6) continue;   // next member of the same pack (packs spread ≈ 2.5 m)
      let nx = null, nNear = 0;
      for (const c of cohorts) if (c !== cur && c.n > 0 && Math.abs(c.dist - cur.dist) <= chainRange && visible(c, lr)) { nNear += c.n; if (!nx || c.dist < nx.dist) nx = c; }
      // enemies arrive from every side: a radial neighbour is only a spatial neighbour with probability ∝ density
      if (!nx || rng() > 1 - Math.exp(-nNear * Math.PI * chainRange * chainRange / CHAIN_AREA)) break;
      cur = nx;
    }
  }
  function gainXp(x) { xpGained += x; const before = run.level; addXp(meta, run, sk, rng, x, ctx); if (run.level !== before) statsDirty(); }
  function loseEmbers(n, cause) {
    if (n <= 0) return;
    run.hp -= n; emberLost += n; hitEvents++; run.stats.damageTaken += n;
    iframes = B.damage.iframes + (quirk.iframes || 0);
    spinHurt = 3;
    const r = B.damage.gutterBurst.radius * (quirk.burstRadiusMult || 1);
    for (const c of cohorts) if (c.dist <= r) { c.dist += B.damage.gutterBurst.push; c.stun = Math.max(c.stun, B.damage.gutterBurst.stun); }
    if (quirk.burstDamage) aoe(r, B.combat.flare.damage * lvlScale * dmgMul());
    if (run.hp <= 0) {
      if (relicLvl(meta, 'second_wick') && !run.secondWickUsed) { run.secondWickUsed = true; run.hp = 1; run.oil = Math.max(run.oil, 40); iframes = 2; flare(true); }
      else { run.dead = true; run.cause = cause; }
    }
  }
  const hitSrc = {};
  function hitPlayer(embersBase, oilBase, cause, { armorable = true, src = 'contact' } = {}) {
    const oilLoss = oilBase * d0.drainMult * (iframes > 0 ? B.damage.iframeOilMult : 1);
    run.oil = Math.max(0, run.oil - oilLoss);
    if (embersBase <= 0 || iframes > 0) return;
    if (armorable && rng() < Math.min(B.damage.armorCap, st.armor)) return;
    const n = Math.max(1, Math.floor(embersBase * d0.damageMult));
    hitSrc[src] = (hitSrc[src] || 0) + n;
    loseEmbers(n, cause);
  }
  function flare(free = false) {
    if (!free) {
      if (run.flareCharges > 0) run.flareCharges--; else run.oil = Math.max(0, run.oil - st.flareCost);
      flareCd = st.flareCooldown * st.cooldownMult;
    }
    const base = B.combat.flare.damage * lvlScale * dmgMul();
    for (const c of cohorts) if (c.n > 0 && c.dist <= st.flareRadius && !(c.e.behavior === 'leap' && c.state === 'circle')) {
      c.aoe += base + B.combat.flare.maxHpPct * c.hp; c.dist += B.combat.flare.knock; c.stun = Math.max(c.stun, B.combat.flare.stun); resolve(c);
    }
    for (const m of latched.splice(0)) { // flare clears latched moths
      const c = spawnCohort(ENEMY.duskmantle, 1, 6); c.aoe = m.dmg + base + B.combat.flare.maxHpPct * c.hp; c.stun = B.combat.flare.stun; resolve(c);
    }
    for (const h of hands) if (h.phase === 'stain' || h.phase === 'breach') { h.stagger = B.combat.flare.handStagger; h.skipSlam = true; }
    if (warden?.alive && rng() < 0.7) warden.dmg += base + B.combat.flare.bossHpPct * warden.hp;
    flareBoost = B.combat.flare.boostTime;
    iframes = Math.max(iframes, B.combat.flare.iframes);
  }

  // ---------------------------------------------------------------- main loop
  // a hooked legendary holds the Gloomtide open until the fight resolves (the hush spawns nothing)
  while ((t < L || (fight && !fight.done && fight.end !== Infinity && t < fight.end + 0.5)) && !run.dead) {
    const k = Math.min(1, t / L);
    const lr = lightR();
    const of = run.oil / st.maxOil;
    const dark = run.oil <= 0;
    const anch = anchored();
    const moving = anch ? 0 : 0.65;
    if (opts.debug && Math.abs(t % 5) < 1e-9) { let near = 99, inL = 0; for (const c of cohorts) { if (c.n > 0) { near = Math.min(near, c.dist); if (c.dist <= lr) inL += c.n; } } console.log(`t ${t} alive ${alive()} inLight ${inL} near ${near.toFixed(1)} lr ${lr.toFixed(1)} oil ${run.oil.toFixed(0)} hp ${run.hp} kills ${killsNight} contacts ${contactsN} hands ${hands.length}`); }
    if (anch) anchT += dt;
    oilAcc += of * dt; oilMin = Math.min(oilMin, of);
    // ---- legend fight bookkeeping
    if (fight && !fight.done && t >= fight.start && fight.end === Infinity) {
      const r = castOnce(meta, run, sk, st, rng, { legend: legSp, gloom: true });
      fight.legendary = true; fight.end = t + r.time; fight.result = r;
      const summon = legSp.boss?.phases?.find((p) => p.mechanic === 'summon');
      if (summon && r.time > 20) for (let i = 0; i < summon.count; i++) hands.push({ hp: enemyHp(ENEMY[summon.enemy]), dmg: 0, phase: 'stain', timer: 0.3 * r.time + i * summon.gap + 1.4, slams: 0, age: 0, vuln: false, stagger: 0, flareTried: false });
    }
    if (fight && !fight.done && t >= fight.end) {
      fight.done = true;
      if (!fight.result?.fish && run.legendBait[legSp.id] && t < 0.6 * L && (fight.tries || 1) < 2) {   // missed the hook-set: bait kept, cast again
        fight = { start: t + 5, end: Infinity, done: false, tries: (fight.tries || 1) + 1 };
      } else if (fight.result?.fish) {
        landFish(meta, run, sk, rng, fight.result.fish, ctx); decideCatch(meta, run, sk, strat, fight.result.fish); statsDirty();
        if (run.won) break;   // landing the Pale Leviathan ends the Gloomtide (victory)
      }
    }
    // ---- spawning
    const rate = DIR.baseRate * zone.gloom * (1 + DIR.ratePerHeat * H) * D.nightCurve(k, t)
      * (dark ? B.damage.darkness.spawnMult : 1) * (anch ? B.combat.legendFightRateMult : 1) * (warden?.alive ? DIR.bossRateMult : 1) * (1 + gloomDraw);
    credit = Math.min(10, credit + rate * dt);
    let guard = 0;
    while (credit >= 1 && guard++ < 20) {
      const e = ENEMY[pickW(rng, d0.kinds, (x) => x.w).id];
      let pack = e.pack || 1;
      if (e.packPerHeat) pack = Math.min(e.packMax || 10, Math.floor(pack + e.packPerHeat * H));
      let kindAlive = 0; if (e.maxAlive) for (const c of cohorts) if (c.id === e.id) kindAlive += c.n;
      const kindMax = e.maxAlive ? e.maxAlive + Math.floor((e.maxAlivePerHeat || 0) * H) : Infinity;
      if (alive() + pack > d0.maxAlive || (e.maxAlive && kindAlive + 1 > kindMax)) break;
      if (e.depthMin && zone.arena.depthShare && rng() > (zone.arena.depthShare[1] + zone.arena.depthShare[2]) / 100) { credit -= pack; continue; }
      spawnCohort(e, pack, U(rng, ...B.combat.spawnRing));
      spawnedN += pack; aliveN += pack;
      credit -= pack;
    }
    // ---- formations
    while (formAt.length && t >= formAt[0]) {
      formAt.shift();
      if (warden?.alive) continue;
      const av = D.FORMATIONS.filter((f) => (z > f.zoneMin || (z === f.zoneMin && day >= f.dayMin)) || (z === 0 && f.zone0DayMin && day >= f.zone0DayMin));
      if (!av.length) continue;
      const f = pickW(rng, av, (x) => x.weight);
      const eid = f.enemyByZone?.[zone.id] || f.enemy;
      const e = ENEMY[eid];
      if (f.id === 'encircle') { const n = f.count.base + f.count.perHeat * H; for (let i = 0; i < 6; i++) spawnCohort(e, Math.ceil(n / 6), f.ringRadius); }
      else if (f.id === 'tide') { const n = f.packSize.base + f.packSize.perHeat * H, np = Math.round(U(rng, ...f.packs)); for (let i = 0; i < np; i++) spawnCohort(e, Math.ceil(n / np), 24, { speedMult: f.speedMult }); }
      else if (f.id === 'dimming') { const n = f.count.base + Math.floor(H / 2) * f.count.perHeatHalf; for (let i = 0; i < n; i++) spawnCohort(e, 1, 22 + i * 0.5); }
      else if (f.id === 'volley') { for (let i = 0; i < f.count.base; i++) spawnCohort(e, 1, f.ringRadius); }
      else if (f.id === 'procession') { const n = Math.round(U(rng, f.count.min, f.count.max)); for (let i = 0; i < n; i++) spawnCohort(e, 1, 24 + i); spawnCohort(ENEMY[f.escort], 6, 24); }
      else if (f.id === 'hush') { for (let i = 0; i < f.count.trios; i++) spawnCohort(e, 3, 24); hushT = f.duration; }
    }
    // ---- elites (Drowned Hand)
    if (t >= eliteAt && !warden?.alive && !(anch && B.combat.legendPausesElites)) {
      eliteAt = t + d0.eliteEvery;
      const pair = !!ENEMY.drowned_hand.zoneMods?.[zone.id]?.pair;
      for (let i = 0; i < (pair ? 2 : 1); i++) hands.push({ hp: enemyHp(ENEMY.drowned_hand), dmg: 0, phase: 'stain', timer: ENEMY.drowned_hand.telegraph.stain + i, slams: 0, age: 0, vuln: false, stagger: 0, flareTried: false });
    }
    // ---- Warden
    if (t >= bossAt && !warden && !(fight && !fight.done && legSp.final)) {
      const we = ENEMY[d0.boss];
      warden = { e: we, hp: we.hp * (d0.bossHpMult ?? d0.hpMult), dmg: 0, alive: true, age: 0, brood: 0, hitT: 0, p2: false };
    }
    // ---- movement & behaviour
    for (const c of cohorts) {
      if (c.n <= 0) continue;
      if (c.chill > 0) c.chill -= dt;
      if (c.stun > 0) { c.stun -= dt; continue; }
      const e = c.e;
      let v = e.speed * d0.speedMult * c.speedMult * (anch ? 1 : sk.kite) * (dark ? B.damage.darkness.enemySpeed : 1);
      const inLight = c.dist <= lr;
      v *= inLight ? (e.behavior === 'latch' ? B.light.mothInside : B.light.insideSlow) : 1;
      if (c.slowT > 0) { c.slowT -= dt; v *= 1 - c.slow; }
      if (e.zigzag) v *= 0.85;
      if (c.held) { v *= 1 - c.held; c.held = 0; }
      if (e.behavior === 'chase' && c.dist <= e.telegraph.lungeAt) {
        if (!c.paused) { c.paused = true; c.stun = e.telegraph.pause; continue; }
        v = e.speed * d0.speedMult * e.telegraph.lungeMult;
      }
      if (e.behavior === 'orbitDive' && c.dist <= e.orbit.radius && c.state === 'approach') { c.state = 'orbit'; c.timer = e.orbit.time; }
      if (c.state === 'orbit') { c.timer -= dt; if (c.timer > 0) continue; c.state = 'dive'; }
      if (e.behavior === 'stalk' && of < e.rushBelowOil) v *= e.rushMult;
      if (e.behavior === 'artillery') {
        const hold = Math.max(c.hold, lr + 3) - sk.inkwellHunt;
        if (c.dist > hold) c.dist -= v * dt;
        c.fire -= dt;
        if (c.fire <= 0) {
          c.fire = e.artillery.every;
          const dodge = sk.dodge.glob * (anch ? 0.4 : 1);
          if (rng() > dodge) { hitPlayer(e.artillery.damage, 0, 'gloom', { src: 'glob' }); dimSlick = e.artillery.slick.time * 0.5; }
        }
        continue;
      }
      if (e.behavior === 'leap') {
        if (c.state === 'approach') { c.dist -= v * dt; if (c.dist <= 7.5) { c.state = 'circle'; c.timer = U(rng, ...e.telegraph.circle); } continue; }
        if (c.state === 'circle') { c.timer -= dt; if (c.timer <= 0) { c.state = 'surface'; c.timer = e.telegraph.surface + e.telegraph.leap; c.zapTried = false; } continue; }
        if (c.state === 'surface') {
          c.timer -= dt;
          if (!c.zapTried) { c.zapTried = true; if (rng() < sk.eelZap * (anch ? 0.6 : 1)) { c.st += st.zapDamage * lvlScale * dmgMul() * e.zapAirborneMult; run.oil = Math.max(0, run.oil - st.zapCost); resolve(c); } }
          if (c.timer <= 0 && c.n > 0) {
            if (rng() > sk.dodge.eel * (anch ? 0.3 : 1)) {
              hitPlayer(e.damage, 0, 'gloom', { src: 'eel' });
              const fishIdx = run.creel.findIndex((f) => !f.legendary);
              if (fishIdx >= 0) { c.stolen = run.creel.splice(fishIdx, 1)[0]; }
            }
            c.state = 'flee'; c.timer = e.fleeTime; c.dist = 12;
          }
          continue;
        }
        if (c.state === 'flee') { c.timer -= dt; if (c.timer <= 0) c.state = 'approach'; continue; }
      }
      c.dist -= v * dt;
    }
    // ---- contacts
    for (const c of cohorts) {
      if (c.n <= 0 || c.dist > B.damage.contactRadius || c.e.behavior === 'artillery' || c.e.behavior === 'leap') continue;
      const e = c.e;
      const dodgeP = (sk.dodge[e.id] ?? 0.1) * (anch ? 0.3 : 1);
      if (rng() < dodgeP) { dodgedN++; c.dist = 3.5; c.paused = false; continue; }
      if (run.boons.burning_wake >= 6 && !anch && rng() < 0.45) { c.aoe += 30 * dmgMul(); c.dist += 5; resolve(c); continue; }   // Comet Keel ram
      if (e.behavior === 'latch') {
        if (latched.length < (e.maxLatched || 4)) { latched.push({ hp: c.hp, dmg: c.aoe, age: 0 }); c.n--; c.dist += 0.6; }
        else c.dist = 3;
        continue;
      }
      contactsN++;
      hitPlayer(e.damage, e.oilDrain, 'gloom', { src: 'contact:' + e.id });
      if (e.contactDim) dimSpore = e.contactDim.time;
      if (e.burstOnContact) { c.n--; c.aoe = Math.min(c.aoe, c.hp * 0.99); c.st = 0; c.dist += 0.8; c.paused = false; }
      else { c.dist = (e.shove || 3); }
    }
    // ---- latched moths
    for (let i = latched.length - 1; i >= 0; i--) {
      const m = latched[i];
      m.age += dt;
      run.oil = Math.max(0, run.oil - ENEMY.duskmantle.oilDrain * d0.drainMult * dt);
      if (!dark) m.dmg += st.auraDps * (B.light.floorAura + (1 - B.light.floorAura) * of) * dmgMul() * ENEMY.duskmantle.auraTakenLatched * dt;
      if (m.age >= sk.mothPeel * (anch ? 1.6 : 1) && run.oil > 0) { m.dmg += st.zapDamage * lvlScale * dmgMul(); run.oil = Math.max(0, run.oil - st.zapCost) + ENEMY.duskmantle.latchedRefund; m.age = 0; }
      if (m.dmg >= m.hp) { latched.splice(i, 1); killsNight++; run.stats.enemiesSlain++; meta.totalSlain++; gainXp(ENEMY.duskmantle.xp * xpScale * st.xpMult); }
    }
    // ---- aura
    if (!dark) {
      const gut = run.gutsT > 0 ? run.gutsAura : 0;
      const fanned = quirk.id === 'fanned_flame' && !anch ? 1 + (quirk.auraMult - 1) * 0.55 : 1;
      const lotl = run.boons.lantern_on_the_line && anch ? D.BOON_BY_ID.lantern_on_the_line.proc.levels[run.boons.lantern_on_the_line - 1].auraMult : 1;
      const dps = (st.auraDps + gut) * (B.light.floorAura + (1 - B.light.floorAura) * of) * dmgMul() * fanned * lotl;
      for (const c of cohorts) if (c.n > 0 && c.dist <= lr && visible(c, lr)) { c.aoe += dps * taken(c, 'aura') * dt; resolve(c); }
      for (const h of hands) if (h.vuln) h.dmg += dps * dt * (h.stagger > 0 ? 1.5 : 1);
      if (warden?.alive) warden.dmg += dps * dt * sk.wardenInLight;
    }
    // ---- weapons
    const cdm = st.cooldownMult;
    for (const [id, lvl] of Object.entries(run.boons)) {
      const b = D.BOON_BY_ID[id];
      if (b.kind !== 'weapon') continue;
      const p = weaponParams(id, lvl);
      const dm = dmgMul(p.critMult || 2);
      wTimers[id] = (wTimers[id] || 0) + dt;
      const due = (cd) => { if (wTimers[id] >= cd * cdm) { wTimers[id] -= cd * cdm; return true; } return false; };
      switch (b.weapon) {
        case 'orbit': {
          const R = p.radius ?? p.radiusLightMult * lr;
          const per = p.damage * p.count * Math.min(p.spin / (2 * Math.PI), 1 / p.hitCooldown) * dm + (p.burnDps || 0) * dm;
          for (const c of cohorts) if (c.n > 0 && Math.abs(c.dist - R) <= 1.0) { c.aoe += per * dt; resolve(c); }
          if (warden?.alive) warden.dmg += per * dt * 0.25;
          for (const h of hands) if (h.vuln) h.dmg += per * dt * 0.5;
          wTimers[id] = 0; break;
        }
        case 'motes': {
          while (due(p.cooldown)) for (let i = 0; i < p.count; i++) if (rng() < PROJ_EFF) single(p.damage * dm, p.range, lr, { chainN: p.pierce || 0, chainRange: 2 });
          break;
        }
        case 'trail': {
          if (!moving) { wTimers[id] = 0; break; }
          const per = p.dps * dm * 0.35 * (1 + 0.4 * p.igniteTime / 1.2) * moving;
          for (const c of cohorts) if (c.n > 0 && c.dist <= 6) { c.aoe += per * dt; resolve(c); }
          if (warden?.alive) warden.dmg += per * dt * 0.3;
          wTimers[id] = 0; break;
        }
        case 'hook': {
          while (due(p.cooldown)) if (rng() < PROJ_EFF) single(p.damage * dm, 16, lr, { chainN: p.bounces + (p.returns ? 1 : 0), chainRange: p.bounceRange });
          break;
        }
        case 'spark': {
          while (due(p.cooldown)) for (let i = 0; i < (p.casts || 1); i++) single(p.damage * dm, p.range, lr, { chainN: p.chains, chainRange: p.chainRange, stun: p.stun });
          break;
        }
        case 'bell': {
          while (due(p.cooldown)) aoe(p.radius, p.damage * dm, { slow: p.slow, slowTime: p.slowTime, chill: !!p.chillVuln });
          break;
        }
        case 'nova': {
          while (due(p.cooldown)) {
            const before = killsNight;
            aoe(p.radiusMult * lr, p.damage * dm, { knock: p.knock });
            if (p.oilPerHit) run.oil = Math.min(st.maxOil, run.oil + Math.min(p.oilMaxPerPulse, (killsNight - before + 2) * p.oilPerHit));
          }
          break;
        }
        case 'mines': {
          if (due(p.cooldown) && floats.length < p.max) floats.push({ d: U(rng, ...p.toss), arm: p.arm, life: p.life });
          for (let i = floats.length - 1; i >= 0; i--) {
            const f = floats[i]; f.arm -= dt; f.life -= dt;
            if (f.life <= 0) { floats.splice(i, 1); continue; }
            if (f.arm > 0) continue;
            let n = 0; for (const c of cohorts) if (c.n > 0 && Math.abs(c.dist - f.d) <= p.trigger) n += c.n;
            if (n > 0 && rng() < Math.min(1, 0.6 * n * dt * 4)) {
              const cov = Math.min(1, (2 * p.blastRadius * 2.2 * (p.drift ? 1.5 : 1)) / (2 * Math.PI * Math.max(2, f.d)));
              for (const c of cohorts) if (c.n > 0 && Math.abs(c.dist - f.d) <= p.blastRadius) { c.aoe += p.damage * dm * Math.max(cov, 1 / Math.max(1, c.n)); resolve(c); }
              if (warden?.alive && rng() < 0.3) warden.dmg += p.damage * dm;
              for (const h of hands) if (h.vuln && rng() < 0.3) h.dmg += p.damage * dm;
              floats.splice(i, 1);
            }
          }
          break;
        }
        case 'vortex': {
          if (due(p.cooldown)) {
            const near = cohorts.filter((c) => c.n > 0 && c.dist <= p.range);
            if (near.length) { const ds = near.map((c) => c.dist).sort((a, b) => a - b); for (let i = 0; i < (p.count || 1); i++) vortices.push({ d: ds[Math.floor(ds.length / 2)], T: p.duration, p }); }
          }
          for (let i = vortices.length - 1; i >= 0; i--) {
            const v = vortices[i]; v.T -= dt;
            const cov = Math.min(1, (2 * v.p.radius * 2.5) / (2 * Math.PI * Math.max(2, v.d)));
            for (const c of cohorts) if (c.n > 0 && Math.abs(c.dist - v.d) <= v.p.radius) { c.aoe += v.p.dps * dm * cov * dt; c.held = Math.max(c.held || 0, cov); resolve(c); }
            if (warden?.alive) warden.dmg += v.p.dps * dm * 0.3 * dt;
            if (v.T <= 0) { if (v.p.endFlare) aoe(Math.min(lr, v.d + v.p.radius), B.combat.flare.damage * lvlScale * dm * cov); vortices.splice(i, 1); }
          }
          break;
        }
        case 'beam': {
          const range = lr + p.lengthAdd;
          const per = p.damage * Math.min(p.beams * p.turnSpeed * (spinHurt > 0 && p.spinOnHurt ? p.spinOnHurt.mult : 1) / (2 * Math.PI), 1 / p.hitCooldown) * dm;
          for (const c of cohorts) if (c.n > 0 && c.dist <= range && !(c.e.behavior === 'leap' && c.state === 'circle')) { c.aoe += per * dt; resolve(c); }
          if (warden?.alive) warden.dmg += per * dt;
          for (const h of hands) if (h.vuln) h.dmg += per * dt;
          wTimers[id] = 0; break;
        }
        default: break;
      }
    }
    // ---- zaps (tap): priority moths are handled above; then eels/inkwells/hands/warden/nearest
    zapBudget = Math.min(2, zapBudget + sk.zapRate * (strat.zapMult || 1) * (anch ? 0.5 : 1) * dt);
    while (zapBudget >= 1) {
      zapBudget -= 1;
      const waxZap = run.oil <= 0;
      if (!waxZap && of < sk.zapFloor) break;
      if (waxZap && run.sat < B.damage.darkness.waxZapSatiety) break;
      if (rng() > sk.zapAim) continue;
      const dmg = st.zapDamage * lvlScale * dmgMul() * (waxZap ? B.damage.darkness.waxZapDamage : 1);
      const ink = cohorts.find((c) => c.n > 0 && c.e.behavior === 'artillery' && c.dist <= B.combat.zap.range);
      const tick = cohorts.find((c) => c.n > 0 && c.e.behavior === 'bulwark' && c.dist <= lr + 4);
      const hand = hands.find((h) => h.vuln);
      if (ink) { ink.st += dmg; resolve(ink); }
      else if (hand) { hand.dmg += dmg * (hand.stagger > 0 ? 1.5 : 1); hand.zaps = (hand.zaps || 0) + 1; }
      else if (warden?.alive && rng() < 0.6) warden.dmg += dmg;
      else if (tick) { tick.st += dmg * tick.e.zapTaken; resolve(tick); }
      else single(dmg, B.combat.zap.range, lr, { focusBoss: false });
      if (waxZap) run.sat -= B.damage.darkness.waxZapSatiety; else run.oil = Math.max(0, run.oil - st.zapCost);
    }
    // ---- flare decision
    if (flareCd <= 0 && !dark && (run.oil >= st.flareCost || run.flareCharges > 0)) {
      let near = 0; for (const c of cohorts) if (c.dist <= st.flareRadius) near += c.n;
      const stain = hands.find((h) => h.phase === 'stain' && !h.flareTried);
      const emergency = (run.hp <= 2 && near >= 3) || latched.length >= 3;
      let go = emergency || ((near >= sk.flareCrowd || latched.length >= 2) && of >= sk.flareOilMin);
      if (stain) { stain.flareTried = true; if (rng() < sk.flareOnStain) go = true; }
      if (go) flare();
    }
    // ---- hands
    for (let i = hands.length - 1; i >= 0; i--) {
      const h = hands[i];
      h.age += dt; h.timer -= dt; if (h.stagger > 0) h.stagger -= dt;
      if (h.phase === 'stain' && h.timer <= 0) { h.phase = 'breach'; h.timer = ENEMY.drowned_hand.telegraph.breach; h.vuln = true; h.zaps = 0; }
      else if (h.phase === 'breach' && h.timer <= 0) {
        if (!h.skipSlam && (h.zaps || 0) < ENEMY.drowned_hand.zapStagger) {
          const dodge = sk.dodge.slam * (anch ? 0.35 : 1);
          if (rng() > dodge) hitPlayer(ENEMY.drowned_hand.damage, ENEMY.drowned_hand.oilDrain, 'gloom', { src: 'slam' });
        }
        h.skipSlam = false; h.zaps = 0; h.slams++;
        h.phase = 'linger'; h.timer = ENEMY.drowned_hand.telegraph.linger;
      } else if (h.phase === 'linger' && h.timer <= 0) {
        if (h.slams >= ENEMY.drowned_hand.telegraph.slams || h.age >= ENEMY.drowned_hand.telegraph.maxTime) { hands.splice(i, 1); continue; }
        h.phase = 'stain'; h.timer = ENEMY.drowned_hand.telegraph.stain; h.vuln = false; h.flareTried = false;
      }
      if (h.dmg >= h.hp) {
        hands.splice(i, 1);
        run.stats.elitesSlain++; meta.totalElites++; killsNight++; run.stats.enemiesSlain++; meta.totalSlain++;
        run.oil = Math.min(st.maxOil, run.oil + ENEMY.drowned_hand.oilDrop);
        earnShells(run, Math.round(ENEMY.drowned_hand.shells * zone.valueMult), 'elite');
        gainXp(ENEMY.drowned_hand.xp * xpScale * st.xpMult);
      }
    }
    // ---- Warden
    if (warden?.alive) {
      warden.age += dt;
      if (!warden.p2 && warden.dmg >= warden.hp * 0.5) warden.p2 = true;
      warden.hitT += dt;
      const hitEvery = sk.wardenHitEvery / (1 + 0.15 * z) * (anch ? 0.5 : 1);
      if (warden.hitT >= hitEvery * U(rng, 0.6, 1.4)) {
        warden.hitT = 0;
        const n = Math.min(B.damage.bossHitCap, Math.max(1, Math.floor(warden.e.damage * d0.damageMult)));
        run.oil = Math.max(0, run.oil - warden.e.oilDrain * d0.drainMult * 0.5);
        if (iframes <= 0 && rng() >= Math.min(B.damage.armorCap, st.armor)) { hitSrc.warden = (hitSrc.warden || 0) + n; loseEmbers(n, 'gloom'); }
      }
      const brood = warden.e.abilities.find((a) => a.id === 'brood' || a.id === 'reliquary');
      if (brood) { warden.brood += dt; if (warden.brood >= brood.every) { warden.brood = 0; const be = ENEMY[brood.enemy]; spawnCohort(be, brood.count, 12); } }
      if (warden.dmg >= warden.hp) {
        warden.alive = false; warden.killedAt = t;
        run.stats.bossesSlain++; meta.totalBosses++; meta.wardensKilled[warden.e.id] = true;
        if (!(B.heal.heartwaxOnce && run.wardensKilled[warden.e.id])) { run.heartwax++; statsDirty(); run.hp = Math.min(st.maxHp, run.hp + B.heal.heartwax); }
        run.wardensKilled[warden.e.id] = true;
        run.oil = Math.min(st.maxOil, run.oil + B.combat.wardenOil);
        earnShells(run, warden.e.shells, 'warden');
        gainXp(warden.e.xp * xpScale * st.xpMult);
        levelUp(meta, run, sk, rng, { gift: true }); statsDirty();
      }
    }
    // ---- drains, darkness, starvation
    run.oil = Math.max(0, run.oil - st.oilDrain * B.drain.oilPhase.gloomtide * zone.drain.oil * d0.drainMult * dt);
    run.sat = Math.max(0, run.sat - st.satietyDrain * zone.drain.satiety * d0.drainMult * dt);
    if (run.oil <= 0 && run.lastFlickerDay !== day) { run.lastFlickerDay = day; run.oil = B.damage.darkness.lastFlickerOil; }
    // burn a fish (quick action)
    const burnable = run.creel.filter((f) => !f.legendary);
    if (burnable.length && run.oil / st.maxOil < sk.burnAt && (burnArmed || run.oil <= 0)) {
      const f = burnable.sort((a, b) => a.value - b.value)[0];
      run.creel.splice(run.creel.indexOf(f), 1);
      run.oil = Math.min(st.maxOil, run.oil + f.oil * st.oilYieldMult);
      const g = run.boons.gutsfire; if (g) { const pl = D.BOON_BY_ID.gutsfire.proc.levels[g - 1]; run.gutsT = pl.time; run.gutsAura = pl.auraDps; }
    }
    if (run.gutsT > 0) run.gutsT -= dt;
    if (run.oil <= 0) { if (darkT < 0) darkT = 0; darkT += dt; if (darkT >= B.damage.darkness.grace + B.damage.darkness.interval) { darkT = B.damage.darkness.grace; hitSrc.dark = (hitSrc.dark || 0) + 1; loseEmbers(1, 'darkness'); } } else darkT = -1;
    if (run.sat <= 0) { if (starveT < 0) starveT = 0; starveT += dt; if (starveT >= B.damage.starvation.grace + B.damage.starvation.interval) { starveT = B.damage.starvation.grace; loseEmbers(1, 'starvation'); } } else starveT = -1;
    // timers
    iframes -= dt; flareCd -= dt; flareBoost -= dt; dimSlick -= dt; dimSpore -= dt; hushT -= dt; spinHurt -= dt;
    // prune
    { let w = 0; aliveN = 0; for (let i = 0; i < cohorts.length; i++) { const c = cohorts[i]; if (c.n > 0) { cohorts[w++] = c; aliveN += c.n; } } cohorts.length = w; }
    t += dt;
  }
  // dawn: lying cinders from the last 20 s auto-collect; survivors dissolve; a living Warden withdraws
  if (!run.dead) {
    let late = 0; for (const [tt, x] of recentLost) if (tt >= t - B.xp.cinderLife) late += x;
    gainXp(late);
  }
  const nl = { oilMean: oilAcc / Math.max(1, t), oilMin, oilStartFrac, wardenDps: warden ? warden.dmg / Math.max(1, warden.age) : null, wardenHp: warden?.hp, contacts: contactsN, dodged: dodgedN, hitSrc, maxHp: st.maxHp, spawned: spawnedN, anch: anchT, day, zone: z, heat: H, kills: killsNight, emberLost, oilNet: run.oil - oilStart, xp: xpGained, level: run.level, boss: d0.boss, bossKilled: !!(warden && !warden.alive), bossKillTime: warden?.killedAt != null ? warden.killedAt - bossAt : null, dead: run.dead };
  run.nightLog.push(nl);
  run.stats.slainNightMax = Math.max(run.stats.slainNightMax, killsNight);
  return nl;
}

// ===================================================================================== a whole run
export function simulateRun(meta, sk, strat = {}, rng, opt = {}) {
  const run = newRun(meta, opt);
  if (run.bankedLevels) for (let i = 0; i < run.bankedLevels; i++) { run.level++; levelUp(meta, run, sk, rng); }
  const maxDay = opt.maxDay || 40;
  while (!run.dead && !run.won && run.day <= maxDay) {
    simulateCalm(meta, run, sk, strat, rng);
    if (run.won || run.dead) break;
    const st0 = computeStats(meta, run);
    if (run.sat <= 0 && run.hp <= 1) { run.dead = true; run.cause = 'starvation'; break; }
    const nl = simulateNight(meta, run, sk, strat, rng);
    if (run.dead || run.won) break;
    void nl; void st0;
    // dawn
    const st = computeStats(meta, run);
    run.stats.nightsSurvived++;
    if (run.nightLog[run.nightLog.length - 1].emberLost === 0 && run.day >= 2) run.stats.nightsNoDamage++;
    run.deepestEndured = Math.max(run.deepestEndured, run.zone);
    run.hp = Math.min(st.maxHp, run.hp + st.dawnHeal + (run.sat / st.maxSatiety >= B.heal.wellFedAt ? B.heal.wellFed : 0));
    drainFor(meta, run, st, B.phases.dawn, 'dawn');
    run.mercy = 0;
    run.day++;
  }
  if (!run.dead && !run.won) run.cause = 'timeout';
  return run;
}

// ===================================================================================== meta: memories, challenges, relics
const CH_TEST = {
  first_light: (m) => m.totalFish >= 1, first_dawn: (m, r) => r.stats.nightsSurvived >= 1, ember_hoard: (m, r) => r.stats.maxLevel >= 8,
  three_nights: (m, r) => r.stats.nightsSurvived >= 3, break_a_hand: (m) => m.totalElites >= 1, steady_hands: (m) => m.totalFish >= 25,
  naturalist: (m) => Object.keys(m.journal).length >= 8, gloombreaker: (m) => m.totalSlain >= 500, unwarded: (m) => m.totalBosses >= 1,
  down_the_sluice: (m) => m.deepestZone >= 1, long_vigil: (m, r) => r.stats.nightsSurvived >= 5, untouched: (m, r) => r.stats.nightsNoDamage >= 1,
  bonfire_night: (m, r) => r.stats.slainNightMax >= 200, full_flame: (m, r) => r.stats.weaponL5, night_angler: () => false,
  perfect_10_run: (m, r) => r.stats.perfectHooks >= 10, kindled: (m, r) => r.stats.maxLevel >= 15, shimmering: (m) => m.shimmered,
  heavy_catch: (m) => m.heavy, catch_100: (m) => m.totalFish >= 100, shells_1000_run: (m, r) => r.stats.shellsEarned >= 1000,
  kindle_one: (m, r) => r.stats.kindled, cartographer: (m) => Object.keys(m.journal).length >= 16, lamplighter: (m) => m.totalSlain >= 2500,
  into_the_vault: (m) => m.deepestZone >= 2, pallid_arrival: (m) => m.deepestZone >= 3,
  four_silences: (m) => ['the_wickeater', 'the_veiled_gardener', 'the_shard_abbot', 'the_lightless_ferryman'].every((id) => m.wardensKilled[id]),
  many_flames: () => false, light_comes_up: (m, r) => r.won, complete_chronicle: (m) => Object.keys(m.journal).length >= 32,
};
const RELIC_W = { maxHp: 100, maxOil: 2.0, lightRadius: 50, auraDps: 130, armor: 800, creelSize: 30, moveSpeed: 40, lineStrength: 160, xpMult: 600,
  pickupRadius: 12, rarityBonus: 250, luck: 80, hookWindow: 120, sweetZone: 1500, flareCooldown: -14, flareRadius: 12, sellMult: 330,
  satietyDrain: -2200, maxSatiety: 0.6, nibbleTells: 12, rerolls: 22, dawnHeal: 80 };
function relicValue(r, lvl, meta) {
  let v = 0;
  for (const [k, e] of Object.entries(r.effects || {})) v += (RELIC_W[k] || 0) * e;
  if (r.special?.startsWith('startShells')) v += 32;
  if (r.special === 'startKit') v += lvl === 0 ? 28 : 45;
  if (r.special?.startsWith('memMult')) v += 45;
  if (r.special?.startsWith('shimmer')) v += 8;
  if (r.special === 'secondWick') v += 140;
  if (r.special?.startsWith('waystone')) v += 0;
  return v * Math.pow(0.85, lvl);
}
function relicRevealed(r, meta) {
  if (r.unlock && !meta.unlocks['relic:' + r.id]) return false;
  const q = r.requires || {};
  if (q.bestDay && meta.bestDay < q.bestDay) return false;
  if (q.runs && meta.runs < q.runs) return false;
  if (q.deepestZone && meta.deepestZone < q.deepestZone) return false;
  if (q.bestLevel && meta.bestLevel < q.bestLevel) return false;
  return true;
}
export function spendMemories(meta) {
  let guard = 0;
  while (guard++ < 60) {
    let best = null, bestR = 0;
    for (const r of D.RELICS) {
      const lvl = meta.relics[r.id] || 0;
      if (lvl >= r.maxLevel || !relicRevealed(r, meta)) continue;
      const cost = r.costs[lvl];
      if (cost > meta.memories) continue;
      const ratio = relicValue(r, lvl, meta) / cost;
      if (ratio > bestR) { bestR = ratio; best = r; }
    }
    if (!best) break;
    meta.memories -= best.costs[meta.relics[best.id] || 0];
    meta.relics[best.id] = (meta.relics[best.id] || 0) + 1;
  }
}
/** Bank a finished run into meta. Returns {memories, fromRun, fromChallenges, completed:[]} */
export function bankRun(meta, run) {
  meta.runs++;
  meta.bestDay = Math.max(meta.bestDay, run.day);
  meta.bestLevel = Math.max(meta.bestLevel, run.stats.maxLevel);
  meta.deepestZone = Math.max(meta.deepestZone, run.zone);
  if (run.won) meta.victories++;
  const trophies = run.creel.filter((f) => f.legendary && !f.sp.final).map((f) => D.ZONE_BY_ID[f.sp.zone].index);
  const summary = { day: run.day, zoneIndex: run.zone, fishCaught: run.stats.fishCaught, newSpecies: run.stats.newSpecies, legendaries: run.legendaries,
    bountiesDone: run.bountiesDone, enemiesSlain: run.stats.enemiesSlain, nightsSurvived: run.stats.nightsSurvived, deepestEnduredIndex: run.deepestEndured,
    bossesSlain: run.stats.bossesSlain, elitesSlain: run.stats.elitesSlain, trophies, victory: run.won, firstVictory: meta.victories <= 1,
    memMult: specialSum(meta, 'memMult') };
  const m = D.memoriesFor(summary);
  let fromCh = run.bonusMemories || 0;
  const completed = [];
  for (const ch of D.CHALLENGES) {
    if (meta.challenges[ch.id]) continue;
    if (CH_TEST[ch.id]?.(meta, run)) {
      meta.challenges[ch.id] = true; completed.push(ch.id);
      fromCh += ch.reward.memories;
      if (ch.reward.unlock) meta.unlocks[ch.reward.unlock] = true;
    }
  }
  const total = m.total + fromCh;
  meta.memories += total; meta.memoriesTotal += total;
  return { memories: total, fromRun: m.total, fromChallenges: fromCh, completed };
}
