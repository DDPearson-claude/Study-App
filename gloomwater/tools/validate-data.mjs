#!/usr/bin/env node
// tools/validate-data.mjs — schema & consistency validation for src/data.js.
// Checks CONTRACT.md §8 (hybrid sail · fish · survive the swarm) plus the cross-references
// DESIGN.md relies on. Usage:  node tools/validate-data.mjs   (exit code 1 on any failure)
import * as D from '../src/data.js';
import * as WL from './walk-lib.mjs';

const errors = [];
const warnings = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) errors.push(msg); return !!cond; };
const warn = (cond, msg) => { if (!cond) warnings.push(msg); };
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isInt = (v) => Number.isInteger(v);
const isStr = (v) => typeof v === 'string' && v.length > 0;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// ---------------------------------------------------------------------------- exports
const REQUIRED_EXPORTS = ['STATS', 'BALANCE', 'ZONES', 'SPECIES', 'BAITS', 'UPGRADES', 'SUPPLIES', 'RELICS', 'ENEMIES',
  'BOONS', 'CHARACTERS', 'CHALLENGES', 'BOUNTIES', 'TIPS', 'MERCHANT_LINES', 'EPITAPHS', 'TEXT', 'QUALITY',
  'FISH_SHAPES', 'CREATURE_KINDS', 'difficultyFor', 'xpForLevel', 'memoriesFor',
  'SPECIES_BY_ID', 'ZONE_BY_ID', 'ENEMY_BY_ID', 'UPGRADE_BY_ID', 'RELIC_BY_ID', 'BAIT_BY_ID', 'SUPPLY_BY_ID',
  'BOON_BY_ID', 'CHARACTER_BY_ID', 'CHALLENGE_BY_ID'];
for (const k of REQUIRED_EXPORTS) ok(k in D, `missing export ${k}`);

// ---------------------------------------------------------------------------- STATS (contract §8 list)
const STAT_KEYS = ['maxHp', 'maxOil', 'maxSatiety', 'oilDrain', 'satietyDrain', 'lightRadius', 'auraDps', 'flareCost',
  'flareRadius', 'flareCooldown', 'zapCost', 'zapDamage', 'damageMult', 'cooldownMult', 'critChance', 'moveSpeed',
  'pickupRadius', 'xpMult', 'luck', 'rerolls', 'dawnHeal', 'castMax', 'lineStrength', 'reelSpeed', 'sweetZone',
  'biteSpeed', 'hookWindow', 'rarityBonus', 'creelSize', 'sellMult', 'foodMult', 'oilYieldMult', 'armor', 'slackTime',
  'nibbleTells',
  'stride'];   // v2 (walking): + m/s on foot (DESIGN §24.3)
const FMTS = new Set(['int', 'pct', 'x', 'm', 's', 'num']);
for (const k of STAT_KEYS) {
  const s = D.STATS[k];
  if (!ok(isObj(s), `STATS.${k} missing`)) continue;
  ok(isNum(s.base), `STATS.${k}.base not numeric`);
  ok(isStr(s.label), `STATS.${k}.label missing`);
  ok(FMTS.has(s.fmt), `STATS.${k}.fmt invalid (${s.fmt})`);
  if (isNum(s.min) && isNum(s.max)) ok(s.min <= s.base && s.base <= s.max, `STATS.${k} base outside [min,max]`);
}
for (const k of Object.keys(D.STATS)) warn(STAT_KEYS.includes(k), `STATS.${k} is not a contract key`);
ok(D.STATS.armor?.max <= 0.6, 'STATS.armor max must be ≤ 0.6 (contract)');
const isStatKey = (k) => k in D.STATS;

// ---------------------------------------------------------------------------- BALANCE
const B = D.BALANCE;
for (const k of ['phases', 'drain', 'damage', 'move', 'xp', 'reel', 'cast', 'combat']) ok(isObj(B?.[k]), `BALANCE.${k} missing`);
for (const p of ['calm', 'dusk', 'gloomtide', 'dawn']) ok(isNum(B.phases?.[p]) && B.phases[p] > 0, `BALANCE.phases.${p} invalid`);
for (const k of ['accel', 'drag', 'turnRate']) ok(isNum(B.move?.[k]), `BALANCE.move.${k} missing`);

// ---------------------------------------------------------------------------- ZONES
const ZONE_IDS = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
ok(D.ZONES.length === 4, 'ZONES must have exactly 4 entries');
const PALETTE_KEYS = ['fog', 'fogDensity', 'water', 'waterDeep', 'foam', 'glow', 'accent', 'ambient', 'ink', 'far', 'light'];
D.ZONES.forEach((z, i) => {
  ok(z.id === ZONE_IDS[i], `ZONES[${i}].id must be ${ZONE_IDS[i]} (got ${z.id})`);
  ok(z.index === i, `ZONES[${i}].index must be ${i}`);
  ok(isStr(z.name) && isStr(z.subtitle) && isStr(z.description), `ZONES[${i}] name/subtitle/description`);
  const a = z.arena;
  if (ok(isObj(a), `${z.id}.arena missing`)) {
    ok(isNum(a.radius) && a.radius >= 55 && a.radius <= 80, `${z.id}.arena.radius must be 55–80`);
    ok(isNum(a.seed), `${z.id}.arena.seed`);
    ok(Array.isArray(a.islands) && Array.isArray(a.pillars), `${z.id}.arena islands/pillars arrays`);
    const obs = [...(a.islands || []), ...(a.pillars || [])];
    for (const o of obs) {
      ok(isNum(o.x) && isNum(o.z) && isNum(o.r) && o.r > 0, `${z.id} obstacle has bad geometry`);
      ok(Math.hypot(o.x, o.z) + o.r < a.radius - 2, `${z.id} obstacle (${o.x},${o.z}) pokes out of the lake`);
    }
    for (let p = 0; p < obs.length; p++) for (let q = p + 1; q < obs.length; q++) {
      const A = obs[p], C = obs[q];
      ok(Math.hypot(A.x - C.x, A.z - C.z) >= A.r + C.r + 1.5, `${z.id} obstacles overlap / no raft gap: (${A.x},${A.z}) & (${C.x},${C.z})`);
    }
    const clearOf = (pt, pad) => obs.every((o) => Math.hypot(pt.x - o.x, pt.z - o.z) >= o.r + pad);
    if (ok(isObj(a.spawn), `${z.id}.arena.spawn`)) ok(clearOf(a.spawn, 3) && Math.hypot(a.spawn.x, a.spawn.z) < a.radius - 3, `${z.id} spawn blocked`);
    if (a.gate) ok(clearOf(a.gate, a.gate.r + 1) && Math.hypot(a.gate.x, a.gate.z) + a.gate.r < a.radius - 3, `${z.id} gate blocked`);
    else ok(i === 3, `${z.id} needs a gate (only the final lake has none)`);
    if (ok(isObj(a.legendPool), `${z.id}.arena.legendPool`)) ok(clearOf(a.legendPool, a.legendPool.r + 1), `${z.id} legend pool blocked`);
    ok(Array.isArray(a.docks) && a.docks.length >= 3, `${z.id} needs ≥ 3 docks`);
    for (const d of a.docks || []) ok(clearOf(d, 2.5) && Math.hypot(d.x, d.z) < a.radius - 1, `${z.id} dock (${d.x},${d.z}) blocked / outside`);
  }
  ok(isObj(z.unlock) && isNum(z.unlock.shells) && Array.isArray(z.unlock.requires), `${z.id}.unlock {shells, requires[]}`);
  ok(isObj(z.drain) && isNum(z.drain.oil) && isNum(z.drain.satiety), `${z.id}.drain`);
  ok(isNum(z.gloom) && isNum(z.valueMult), `${z.id}.gloom / valueMult`);
  for (const k of PALETTE_KEYS) ok(isNum(z.palette?.[k]), `${z.id}.palette.${k} must be a number`);
  if (i > 0) ok(z.unlock.requires.some((r) => r.type === 'legendary' && r.id === D.ZONES[i - 1].legendary), `${z.id} gate must require ${D.ZONES[i - 1].legendary}`);
});

// ---------------------------------------------------------------------------- SPECIES
const RARITIES = ['common', 'uncommon', 'rare', 'legendary'];
const TIMES = ['any', 'calm', 'gloom'];
const BEHAVIORS = ['steady', 'darter', 'sinker', 'thrasher', 'leaper'];
const DIFF_KEYS = ['power', 'surgeEvery', 'surgeTime', 'stamina', 'sweet', 'erratic', 'window'];
const baitIds = new Set(D.BAITS.map((b) => b.id));
ok(JSON.stringify(D.FISH_SHAPES) === JSON.stringify(['minnow', 'perch', 'carp', 'pike', 'eel', 'angler', 'ray', 'puffer', 'jelly', 'crayfish', 'koi', 'ghost', 'leviathan']), 'FISH_SHAPES must match the contract list');
ok(JSON.stringify(D.CREATURE_KINDS) === JSON.stringify(['wisp', 'mite', 'moth', 'eel', 'hand', 'warden']), 'CREATURE_KINDS must match the contract list');
for (const s of D.SPECIES) {
  const id = s.id || '?';
  for (const f of ['id', 'name', 'zone', 'rarity', 'weight', 'value', 'food', 'oil', 'time', 'depth', 'bait', 'difficulty', 'behavior', 'model', 'lore'])
    ok(f in s, `species ${id} missing field ${f}`);
  ok(!('dist' in s), `species ${id} still uses 'dist' (hybrid uses 'depth')`);
  ok(ZONE_IDS.includes(s.zone), `species ${id} bad zone ${s.zone}`);
  ok(RARITIES.includes(s.rarity), `species ${id} bad rarity ${s.rarity}`);
  ok(Array.isArray(s.weight) && s.weight.length === 2 && isNum(s.weight[0]) && s.weight[0] > 0 && s.weight[0] < s.weight[1], `species ${id} weight must be [min<max]`);
  ok(Array.isArray(s.depth) && s.depth.length === 2 && s.depth[0] >= 0 && s.depth[1] <= 1 && s.depth[0] < s.depth[1], `species ${id} depth must be [min<max] within 0..1`);
  for (const k of ['value', 'food', 'oil']) ok(isNum(s[k]) && s[k] > 0, `species ${id}.${k} must be > 0`);
  ok(TIMES.includes(s.time), `species ${id} bad time ${s.time}`);
  ok(s.bait === null || baitIds.has(s.bait), `species ${id} bait ${s.bait} unknown`);
  ok(BEHAVIORS.includes(s.behavior), `species ${id} bad behavior ${s.behavior}`);
  for (const k of DIFF_KEYS) ok(isNum(s.difficulty?.[k]), `species ${id}.difficulty.${k} not numeric`);
  const d = s.difficulty || {};
  ok(d.power >= 0.5 && d.power <= 3, `species ${id} power ${d.power} outside 0.5–3`);
  ok(d.erratic >= 0 && d.erratic <= 1, `species ${id} erratic outside 0..1`);
  ok(d.surgeEvery > d.surgeTime && d.stamina > 0 && d.sweet > 0 && d.window > 0, `species ${id} difficulty sanity`);
  const warnT = s.behavior === 'darter' ? B.reel.darterWarn : Math.max(B.reel.warnMin, B.reel.warnBase - B.reel.warnErratic * d.erratic);
  ok((d.surgeTime + warnT) / d.surgeEvery <= B.reel.dutyCap + 0.011, `species ${id} violates the surge duty cap`);
  const m = s.model || {};
  ok(D.FISH_SHAPES.includes(m.shape), `species ${id} model.shape ${m.shape} not in FISH_SHAPES`);
  for (const c of ['body', 'belly', 'fin']) ok(isNum(m[c]), `species ${id} model.${c} colour must be a number`);
  ok(m.glow === null || isNum(m.glow), `species ${id} model.glow must be a number or null`);
  ok(isNum(m.scale) && m.scale > 0, `species ${id} model.scale`);
  if (s.rarity === 'legendary') {
    ok(isObj(s.boss) && Array.isArray(s.boss.phases) && s.boss.phases.length > 0, `legendary ${id} needs a boss script`);
    ok(s.bait && D.BAIT_BY_ID[s.bait]?.legend === true, `legendary ${id} must require a legend bait`);
    ok(D.ZONE_BY_ID[s.zone]?.legendary === id, `legendary ${id} is not its zone's .legendary`);
  } else {
    ok(!s.final, `non-legendary ${id} marked final`);
    ok(!s.bait || !D.BAIT_BY_ID[s.bait]?.legend, `non-legendary ${id} requires a legend bait`);
  }
}
for (const z of ZONE_IDS) {
  const zs = D.SPECIES.filter((s) => s.zone === z);
  ok(zs.filter((s) => s.rarity === 'legendary').length === 1, `zone ${z} must have exactly one legendary`);
  // every depth must have an always-available (any-time, no-bait) common
  for (let dd = 0; dd <= 1.0001; dd += 0.01) {
    ok(zs.some((s) => s.rarity === 'common' && s.time === 'any' && !s.bait && s.depth[0] <= dd + 1e-9 && dd - 1e-9 <= s.depth[1]),
      `zone ${z} has no any-time common at depth ${dd.toFixed(2)}`);
  }
}
ok(D.SPECIES_BY_ID.pale_leviathan?.final === true, 'pale_leviathan must have final:true');
ok(D.SPECIES_BY_ID.pale_leviathan?.zone === 'paleabyss', 'pale_leviathan must live in paleabyss');
ok(D.SPECIES.filter((s) => s.final).length === 1, 'exactly one species may be final');

// ---------------------------------------------------------------------------- BAITS
const BAIT_EXTRA = new Set(['attract', 'weightBias', 'shimmer', 'gloomDraw']);
for (const b of D.BAITS) {
  ok(isStr(b.id) && isStr(b.name) && isNum(b.price) && b.price > 0 && isInt(b.count) && b.count > 0, `bait ${b.id} basics`);
  for (const k of Object.keys(b.bonus || {})) ok(isStatKey(k) || BAIT_EXTRA.has(k), `bait ${b.id} bonus key ${k} unknown`);
  for (const sid of b.bonus?.attract || []) ok(!!D.SPECIES_BY_ID[sid], `bait ${b.id} attracts unknown species ${sid}`);
  if (b.unlock) ok(!!D.CHALLENGE_BY_ID[b.unlock], `bait ${b.id} unlock ${b.unlock} is not a challenge`);
}

// ---------------------------------------------------------------------------- UPGRADES / RELICS / SUPPLIES
const checkLevelled = (list, name) => {
  for (const u of list) {
    ok(isInt(u.maxLevel) && u.maxLevel >= 1, `${name} ${u.id} maxLevel`);
    ok(Array.isArray(u.costs) && u.costs.length === u.maxLevel, `${name} ${u.id} costs.length !== maxLevel`);
    ok((u.costs || []).every((c, i, a) => isNum(c) && c > 0 && (i === 0 || c >= a[i - 1])), `${name} ${u.id} costs must be positive & non-decreasing`);
    for (const [k, v] of Object.entries(u.effects || {})) ok(isStatKey(k) && isNum(v), `${name} ${u.id} effect ${k} not a STATS key / number`);
  }
};
checkLevelled(D.UPGRADES, 'upgrade');
checkLevelled(D.RELICS, 'relic');
for (const u of D.UPGRADES) ok(u.zone === null || u.zone === undefined || ZONE_IDS.includes(u.zone), `upgrade ${u.id} zone ${u.zone}`);
for (const r of D.RELICS) {
  ok(r.unlock === null || !!D.CHALLENGE_BY_ID[r.unlock], `relic ${r.id} unlock ${r.unlock} is not a challenge`);
  if (r.special) ok(/^(startShells:\d+|startKit|shimmer:[\d.]+|memMult:[\d.]+|secondWick|waystone:(sporewood|glasswater|paleabyss)|lampRadius:[\d.]+|placesRevealed)$/.test(r.special), `relic ${r.id} special '${r.special}' unknown`);
  ok(Object.keys(r.effects || {}).length > 0 || !!r.special, `relic ${r.id} does nothing`);
}
for (const s of D.SUPPLIES) for (const k of Object.keys(s.give || {})) ok(['oil', 'satiety', 'hp', 'flareCharges', 'spots', 'lampPlace'].includes(k), `supply ${s.id} give key ${k}`);

// ---------------------------------------------------------------------------- ENEMIES
for (const e of D.ENEMIES) {
  ok(D.CREATURE_KINDS.includes(e.model), `enemy ${e.id} model ${e.model} not in wisp|mite|moth|eel|hand|warden`);
  for (const k of ['hp', 'speed', 'damage', 'oilDrain', 'xp']) ok(isNum(e[k]) && e[k] >= 0, `enemy ${e.id}.${k} must be a number ≥ 0`);
  ok(e.hp > 0 && isStr(e.behavior) && ZONE_IDS[e.zoneMin] !== undefined, `enemy ${e.id} hp/behavior/zoneMin`);
  ok(Array.isArray(e.weights) && e.weights.length === 4, `enemy ${e.id} weights[4]`);
  if (e.boss) ok(D.ZONE_BY_ID[e.zone]?.warden === e.id, `warden ${e.id} not referenced by its zone`);
}
ok(D.ENEMIES.some((e) => e.elite), 'need at least one elite enemy');
for (const z of D.ZONES) ok(D.ENEMY_BY_ID[z.warden]?.boss === true, `zone ${z.id} warden ${z.warden} is not a boss enemy`);

// ---------------------------------------------------------------------------- BOONS
const BOON_RARITY = ['common', 'rare', 'epic', 'legendary'];
for (const b of D.BOONS) {
  ok(isStr(b.id) && isStr(b.name) && isStr(b.desc) && isStr(b.icon), `boon ${b.id} id/name/desc/icon`);
  ok(BOON_RARITY.includes(b.rarity), `boon ${b.id} rarity ${b.rarity}`);
  ok(isInt(b.maxLevel) && b.maxLevel >= 1, `boon ${b.id} maxLevel`);
  ok(b.kind === 'stat' || b.kind === 'weapon', `boon ${b.id} kind`);
  ok(Array.isArray(b.tags), `boon ${b.id} tags[]`);
  ok(b.unlock === null || !!D.CHALLENGE_BY_ID[b.unlock], `boon ${b.id} unlock ${b.unlock} is not a challenge`);
  if (b.kind === 'weapon') {
    ok(isStr(b.weapon), `weapon boon ${b.id} missing weapon type`);
    ok(Array.isArray(b.levels) && b.levels.length === b.maxLevel, `weapon boon ${b.id} levels.length !== maxLevel`);
    for (const [i, L] of (b.levels || []).entries()) {
      const nums = Object.entries(L).filter(([k]) => k !== 'note');
      ok(nums.length > 0 && nums.every(([, v]) => isNum(v) || typeof v === 'boolean' || Array.isArray(v)), `weapon ${b.id} level ${i + 1} params`);
      ok(isNum(L.damage) || isNum(L.dps), `weapon ${b.id} level ${i + 1} has no damage/dps`);
    }
    if (b.kindle) ok(D.BOON_BY_ID[b.kindle.requires]?.kind === 'stat' && isObj(b.kindle.params), `weapon ${b.id} kindle.requires must be a stat boon`);
  } else {
    ok(isObj(b.effects), `stat boon ${b.id} effects{}`);
    for (const [k, v] of Object.entries(b.effects || {})) ok(isStatKey(k) && isNum(v), `stat boon ${b.id} effect ${k} not a STATS key`);
    ok(Object.keys(b.effects || {}).length > 0 || !!b.proc, `stat boon ${b.id} does nothing`);
    if (b.proc?.levels) ok(b.proc.levels.length === b.maxLevel, `stat boon ${b.id} proc.levels.length !== maxLevel`);
  }
}

// ---------------------------------------------------------------------------- CHARACTERS
ok(D.CHARACTERS.length === 5, 'need exactly 5 characters');
ok(D.CHARACTERS.filter((c) => c.unlock === null).length === 1, 'exactly one character must be unlocked from the start');
for (const c of D.CHARACTERS) {
  ok(c.startBoon === null || !!D.BOON_BY_ID[c.startBoon], `character ${c.id} startBoon ${c.startBoon} unknown`);
  ok(c.unlock === null || !!D.CHALLENGE_BY_ID[c.unlock], `character ${c.id} unlock ${c.unlock} is not a challenge`);
  for (const k of Object.keys(c.effects || {})) ok(isStatKey(k), `character ${c.id} effect ${k} not a STATS key`);
  ok(isObj(c.startKit) && isObj(c.look), `character ${c.id} startKit/look`);
  for (const bid of Object.keys(c.startKit?.bait || {})) ok(baitIds.has(bid), `character ${c.id} kit bait ${bid}`);
  for (const k of ['flame', 'cloak', 'eyes']) ok(isNum(c.look?.[k]), `character ${c.id} look.${k} must be a number`);
}

// ---------------------------------------------------------------------------- CHALLENGES (+ unlock cross-refs)
ok(D.CHALLENGES.length >= 24 && D.CHALLENGES.length <= 40, 'CHALLENGES must hold 24–40 goals (v2: + tier IV Paths Underfoot)');
const unlockTargetExists = (key) => {
  const [kind, id] = key.split(':');
  return ({ character: D.CHARACTER_BY_ID, boon: D.BOON_BY_ID, relic: D.RELIC_BY_ID, bait: D.BAIT_BY_ID })[kind]?.[id];
};
for (const ch of D.CHALLENGES) {
  ok(isStr(ch.id) && isStr(ch.name) && isStr(ch.desc) && isStr(ch.type) && isObj(ch.params), `challenge ${ch.id} basics`);
  ok(ch.scope === 'run' || ch.scope === 'total', `challenge ${ch.id} scope`);
  ok(isObj(ch.reward) && isNum(ch.reward.memories), `challenge ${ch.id} reward.memories`);
  if (ch.reward?.unlock) {
    const target = unlockTargetExists(ch.reward.unlock);
    if (ok(!!target, `challenge ${ch.id} unlocks unknown ${ch.reward.unlock}`)) ok(target.unlock === ch.id, `${ch.reward.unlock}.unlock should name ${ch.id} (got ${target.unlock})`);
  }
}
// every gated item is unlocked by exactly the challenge it names
for (const [kind, list] of [['boon', D.BOONS], ['relic', D.RELICS], ['character', D.CHARACTERS], ['bait', D.BAITS]]) {
  for (const it of list) if (it.unlock) ok(D.CHALLENGE_BY_ID[it.unlock]?.reward?.unlock === `${kind}:${it.id}`, `${kind} ${it.id} is gated by ${it.unlock}, which does not unlock it`);
}

// ---------------------------------------------------------------------------- functions
let prev = -Infinity;
for (let L = 1; L <= 60; L++) {
  const x = D.xpForLevel(L);
  ok(isNum(x) && x > prev, `xpForLevel(${L}) = ${x} not finite / strictly increasing`);
  prev = x;
}
const DIFF_FIELDS = ['spawnRate', 'maxAlive', 'hpMult', 'speedMult', 'damageMult', 'drainMult', 'eliteEvery'];
for (let day = 1; day <= 40; day++) for (let z = 0; z <= 3; z++) for (const k of [0, 0.5, 1]) {
  for (const opts of [undefined, { nightInZone: ((day - 1) % 7) + 1 }]) {
    const r = D.difficultyFor(day, z, k, opts);
    const tag = `difficultyFor(${day},${z},${k}${opts ? ',niz' : ''})`;
    for (const f of DIFF_FIELDS) ok(isNum(r?.[f]) && r[f] >= 0, `${tag}.${f} not a finite number ≥ 0`);
    ok(r.hpMult >= 1 && r.speedMult >= 1 && r.damageMult >= 1 && r.drainMult >= 1 && r.maxAlive > 0, `${tag} multipliers < 1`);
    ok(Array.isArray(r.kinds) && r.kinds.length > 0, `${tag}.kinds empty`);
    for (const kd of r.kinds || []) {
      const e = D.ENEMY_BY_ID[kd.id];
      ok(!!e && !e.boss && !e.elite && isNum(kd.w) && kd.w > 0, `${tag} kind ${kd.id} invalid`);
    }
    ok(r.boss === null || D.ENEMY_BY_ID[r.boss]?.boss === true, `${tag}.boss ${r.boss} invalid`);
  }
}
// monotone escalation at mid-night
for (let z = 0; z <= 3; z++) for (let day = 2; day <= 40; day++) {
  const a = D.difficultyFor(day - 1, z, 0.5), b = D.difficultyFor(day, z, 0.5);
  ok(b.hpMult >= a.hpMult && b.maxAlive >= a.maxAlive, `difficultyFor not monotone at day ${day}, z ${z}`);
}
// optional balance extras (DESIGN §23.2): linger Heat, Warden hp scaling, Memories constants
const DIR = B.combat.director;
for (const k of ['lingerFrom', 'lingerHeat', 'bossHpLin']) if (k in DIR) ok(isNum(DIR[k]) && DIR[k] >= 0, `BALANCE.combat.director.${k}`);
if (B.memories) for (const [k, v] of Object.entries(B.memories)) ok(Array.isArray(v) ? v.length === 4 && v.every(isNum) : isNum(v), `BALANCE.memories.${k}`);
for (let z = 0; z <= 3; z++) for (let day = 1; day <= 30; day++) {
  let prevH = -1;
  for (let niz = 1; niz <= day; niz++) { const H = D.heatFor(day, z, niz); ok(isNum(H) && H >= prevH && H >= day - 1 + 3 * z, `heatFor(${day},${z},${niz}) not monotone in nightInZone`); prevH = H; }
  const r = D.difficultyFor(day, z, 0.5, { nightInZone: 1 });
  if ('bossHpMult' in r) ok(isNum(r.bossHpMult) && r.bossHpMult >= 1, `difficultyFor(${day},${z}).bossHpMult`);
}
const memCases = [{}, { day: 1, zoneIndex: 0 }, { day: 5, zoneIndex: 1, fishCaught: 20, newSpecies: 4, legendaries: { belled_matriarch: true }, bountiesDone: 3, enemiesSlain: 400, nightsSurvived: 4, bossesSlain: 1, elitesSlain: 3, memMult: 0.16 },
  { day: 14, zoneIndex: 3, victory: true, legendaries: 4, trophies: [0, 1], nightsSurvived: 13, deepestEnduredIndex: 3 }];
for (const s of memCases) {
  const m = D.memoriesFor(s);
  ok(isObj(m) && isNum(m.total) && Array.isArray(m.breakdown), `memoriesFor(${JSON.stringify(s)}) shape`);
  ok(m.breakdown.every((r) => isStr(r.label) && isNum(r.value)), 'memoriesFor breakdown rows {label, value}');
  ok(Math.abs(m.breakdown.reduce((a, r) => a + r.value, 0) - m.total) < 1e-9, 'memoriesFor total ≠ Σ breakdown');
}


// ---------------------------------------------------------------------------- v2 (walking, DESIGN §24)
const MODES = ['raft', 'mixed', 'foot'];
const SHAPE_KINDS = ['disc', 'ring', 'rect', 'poly', 'path'];
const SHAPE_TAGS = ['ground', 'ramp', 'jetty', 'bridge'];
const RULES = ['rhythm', 'sequence', 'deed', 'targets', 'moving', 'drifters', 'cue', 'plumb', 'reflection', 'phaseWindow'];
const MOD_KEYS = ['waitMult', 'rarity', 'quality', 'weightBias', 'surgeEveryMult', 'erraticMult', 'hookWindowMult', 'hookWindowAdd',
  'nibbleTells', 'bandAmpMult', 'bandNoiseMult', 'darterJumpMult', 'legendEnrageAdd'];
const COND_RULE = { buff: 'sequence', deed: 'deed', reflection: 'reflection', plumbBottom: 'plumb', window: 'phaseWindow' };
const DEED_KINDS = ['winch', 'strike', 'light', 'sequence', 'rope', 'offer'];
const WB = B.walk, LB = B.lamps;
for (const [k, o] of [['walk', B.walk], ['places', B.places], ['lamps', B.lamps]]) ok(isObj(o), `BALANCE.${k} missing (v2)`);
ok(isObj(B.combat.foot) && isNum(B.combat.foot.contactRadius), 'BALANCE.combat.foot missing (v2)');
for (const k of ['speedMult', 'accel', 'decel', 'turnRate', 'radius', 'stepUp', 'stepDown', 'maxSlope']) ok(isNum(WB?.[k]) && WB[k] > 0, `BALANCE.walk.${k}`);
ok(isNum(B.travel?.arrivalHush) && B.travel.arrivalHush >= 0, 'BALANCE.travel.arrivalHush');
ok(D.ZONES[0].mode === 'raft' && !D.ZONES[0].arena.walk, 'the Mossmere stays raft-only (no walk layout)');
const placeIds = new Set();
const castBase = D.STATS.castMax.base;
const highCast = (y) => (y > WB.highCast.from ? Math.min(WB.highCast.cap, WB.highCast.perM * (y - WB.highCast.from)) : 0);
const ptIn = (p, R) => p && isNum(p.x) && isNum(p.z) && Math.hypot(p.x, p.z) < R;
const speciesOk = (zid, place, d0, d1, phase) => D.SPECIES.filter((sp) => sp.zone === zid && sp.rarity !== 'legendary' && !sp.bait
  && (!sp.place || (sp.place === place && !sp.cond)) && (phase === 'calm' ? sp.time !== 'gloom' : true) && sp.depth[0] <= d1 && d0 <= sp.depth[1]);
let walkCells = 0;
for (const z of D.ZONES) {
  const A = z.arena, R = A.radius, tag = `${z.id} (v2)`;
  ok(MODES.includes(z.mode), `${z.id}.mode must be raft|mixed|foot (got ${z.mode})`);
  if (z.phases) ok(isNum(z.phases.calm) && z.phases.calm >= B.phases.calm && z.phases.calm <= 150, `${tag} phases.calm override`);
  if (z.mode === 'raft') continue;
  const W = A.walk;
  if (!ok(isObj(W) && Array.isArray(W.shapes) && W.shapes.length > 0, `${tag} needs arena.walk.shapes`)) continue;
  ok(['raft', 'foot'].includes(A.spawnMode) && (z.mode === 'mixed' ? A.spawnMode === 'raft' : A.spawnMode === 'foot'), `${tag} spawnMode must be raft (mixed) / foot (foot)`);
  ok(isObj(A.raft) && ['free', 'ferry', 'beached', 'none'].includes(A.raft.mode), `${tag} raft.mode`);
  ok(z.mode !== 'mixed' || A.raft.mode === 'free', `${tag} a mixed lake needs a free raft`);
  // ---- shapes
  const sids = new Set(), shortcutIds = new Set((A.shortcuts || []).map((c) => c.id));
  for (const sh of [...W.shapes, ...(W.holes || []), ...(W.blocks || [])]) {
    ok(SHAPE_KINDS.includes(sh.kind), `${tag} shape ${sh.id} kind ${sh.kind}`);
    const [x0, z0, x1, z1] = D.walkShapeBounds(sh);
    ok([x0, z0, x1, z1].every(isNum) && Math.max(Math.abs(x0), Math.abs(x1), Math.abs(z0), Math.abs(z1)) <= R + 12, `${tag} shape ${sh.id} far outside the lake`);
  }
  for (const sh of W.shapes) {
    ok(isStr(sh.id) && !sids.has(sh.id), `${tag} shape id ${sh.id} missing/duplicate`); sids.add(sh.id);
    ok(SHAPE_TAGS.includes(sh.tag), `${tag} shape ${sh.id} tag ${sh.tag}`);
    if (sh.needs) ok(shortcutIds.has(sh.needs), `${tag} shape ${sh.id} needs unknown shortcut ${sh.needs}`);
    if (sh.kind === 'path') {
      ok(sh.w >= 2.4 - 1e-9, `${tag} walkway ${sh.id} narrower than 2.4 m`);
      for (let i = 0; i + 1 < sh.pts.length; i++) {
        const [ax, az, ay = sh.y ?? 0] = sh.pts[i], [bx, bz, by = sh.y ?? 0] = sh.pts[i + 1];
        ok(Math.abs(by - ay) / Math.max(1e-6, Math.hypot(bx - ax, bz - az)) <= WB.maxSlope + 1e-9, `${tag} ramp ${sh.id} steeper than maxSlope`);
      }
    }
    if (sh.kind === 'ring') ok(sh.r1 - sh.r0 >= 2.4 - 1e-9, `${tag} ring ${sh.id} narrower than 2.4 m`);
  }
  for (const h of W.holes || []) ok(isNum(h.depth) && h.depth > 0 && h.depth <= 1, `${tag} hole ${h.id} depth`);
  // ---- shortcuts, deeds, drops
  const deedById = Object.fromEntries((A.deeds || []).map((d) => [d.id, d]));
  for (const c of A.shortcuts || []) {
    ok(!!deedById[c.deed] && deedById[c.deed].opens === c.id, `${tag} shortcut ${c.id} must be opened by its deed ${c.deed}`);
    ok(W.shapes.some((sh) => sh.needs === c.id), `${tag} shortcut ${c.id} gates no shape`);
  }
  for (const d of A.deeds || []) {
    ok(DEED_KINDS.includes(d.kind), `${tag} deed ${d.id} kind ${d.kind}`);
    ok((d.points ? d.points.length >= 2 : true) && (d.at || d.points), `${tag} deed ${d.id} needs at / points`);
    if (d.opens) ok(shortcutIds.has(d.opens), `${tag} deed ${d.id} opens unknown ${d.opens}`);
    if (d.place) ok((A.places || []).some((p) => p.id === d.place), `${tag} deed ${d.id} names unknown place ${d.place}`);
  }
  // ---- grids
  const G = D.walkGridFor(z), GO = D.walkGridFor(z, { open: WL.openAll(z) });
  const seeds = WL.footSeeds(G, z);
  ok(seeds.length > 0 && seeds.every((k) => WL.isWalk(G, k)), `${tag} spawn / mooring stands must be walkable`);
  const dist = WL.walkDistances(G, z, seeds), distO = WL.walkDistances(GO, z, WL.footSeeds(GO, z));
  const reach = (p, g = G, dd = dist) => { const k = g.idx(p.x, p.z); return k >= 0 && WL.isWalk(g, k) && dd[k] < Infinity; };
  const yAt = (p) => G.top[G.idx(p.x, p.z)];
  for (const d of A.deeds || []) for (const q of d.points || [d.at]) ok(reach(q), `${tag} deed ${d.id} point (${q.x},${q.z}) not reachable on foot (shortcuts closed)`);
  for (const d of A.drops || []) {
    const a = G.idx(d.from.x, d.from.z), b = G.idx(d.to.x, d.to.z);
    ok(WL.isWalk(G, a) && WL.isWalk(G, b), `${tag} drop ${d.id} ends must be walkable`);
    const h = G.top[a] - G.top[b];
    ok(h > WB.stepDown && h <= WB.drop.max + 1e-6, `${tag} drop ${d.id} height ${h.toFixed(2)} outside (stepDown, drop.max]`);
  }
  // pools must be enclosed (never 4-adjacent to lake water)
  const { n } = G;
  let leaks = 0;
  for (let k = 0; k < n * n; k++) {
    if (!(G.flags[k] & D.WALK_FLAGS.POOL)) continue;
    const i = k % n, j = (k / n) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (j + dj) * n + (i + di); if (G.flags[q] & D.WALK_FLAGS.WATER) leaks++; }
  }
  ok(leaks === 0, `${tag} ${leaks} enclosed-pool cells touch open lake water (holes must sit inside ground)`);
  // raft component
  const RM = WL.raftMask(G), raftStart = z.mode === 'mixed' ? G.idx(A.spawn.x, A.spawn.z)
    : A.raft.mode === 'ferry' ? G.idx(A.moorings.find((m) => m.id === A.raft.start)?.slot.x ?? 0, A.moorings.find((m) => m.id === A.raft.start)?.slot.z ?? 0) : -1;
  const RC = raftStart >= 0 ? WL.component(G, RM, raftStart) : null;
  if (z.mode === 'mixed') ok(RC && RC[raftStart], `${tag} raft spawn must be open water`);
  if (A.raft.mode === 'ferry') ok(A.moorings.some((m) => m.id === A.raft.start), `${tag} ferry raft start mooring`);
  for (const m of A.moorings || []) {
    ok(reach(m.stand), `${tag} mooring ${m.id} stand not walkable/reachable`);
    ok(RC && RC[G.idx(m.slot.x, m.slot.z)] === 1, `${tag} mooring ${m.id} slot not raft-reachable`);
    ok(Math.hypot(m.stand.x - m.slot.x, m.stand.z - m.slot.z) <= WB.moor.range + 2, `${tag} mooring ${m.id} stand too far from its slot`);
  }
  // gate
  if (A.gate) {
    if (A.gateAccess === 'raft') ok(RC && RC[G.idx(A.gate.x, A.gate.z)] === 1, `${tag} raft gate not raft-reachable`);
    else {
      let gok = false;
      for (let k = 0; k < n * n && !gok; k++) if (WL.isWalk(G, k) && dist[k] < Infinity) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - A.gate.x, zz - A.gate.z) <= A.gate.r + WB.gateFootRange) gok = true; }
      ok(gok, `${tag} foot gate has no reachable cell within r + ${WB.gateFootRange} m`);
    }
  }
  // docks: on foot lakes every dock is within trade range of a reachable walkway; on mixed lakes raft-reachable
  for (const d of A.docks || []) {
    let near = false;
    const k0 = G.idx(d.x, d.z), r = Math.ceil(WB.tradeRange / G.cell);
    for (let dj = -r; dj <= r && !near; dj++) for (let di = -r; di <= r && !near; di++) {
      const k = k0 + dj * n + di; if (WL.isWalk(G, k) && dist[k] < Infinity && Math.hypot(di, dj) * G.cell <= WB.tradeRange - 1) near = true;
    }
    ok(WL.isLakeWater(G, k0), `${tag} dock (${d.x},${d.z}) must be open water`);
    if (z.mode === 'foot') ok(near, `${tag} dock (${d.x},${d.z}) has no reachable walkway within trade range`);
    else ok(RC && RC[k0] === 1, `${tag} dock (${d.x},${d.z}) not raft-reachable`);
  }
  // lamps
  const lampById = Object.fromEntries((A.lamps || []).map((l) => [l.id, l]));
  ok((A.lamps || []).length >= 3, `${tag} needs ≥ 3 Waylamps`);
  for (const l of A.lamps || []) ok(reach(l), `${tag} lamp ${l.id} not reachable on foot (shortcuts closed)`);
  const lampDist = WL.walkDistances(G, z, (A.lamps || []).map((l) => G.idx(l.x, l.z)));
  let worst = 0, unreach = 0, walk = 0;
  for (let k = 0; k < n * n; k++) {
    if (!WL.isWalk(G, k)) continue; walk++;
    if (dist[k] === Infinity) { unreach++; continue; }
    worst = Math.max(worst, lampDist[k]);
  }
  walkCells += walk;
  ok(worst <= LB.maxPathToLamp, `${tag} a reachable walkway is ${worst.toFixed(0)} m from the nearest Waylamp (max ${LB.maxPathToLamp})`);
  warn(unreach / Math.max(1, walk) <= 0.06, `${tag} ${((100 * unreach) / Math.max(1, walk)).toFixed(1)}% of walkable cells unreachable (decor only)`);
  // places
  ok(Array.isArray(A.places) && A.places.length >= 4, `${tag} needs ≥ 4 places`);
  const legendPlaces = (A.places || []).filter((p) => p.legend);
  ok(legendPlaces.length === 1, `${tag} exactly one place holds the legend pool`);
  for (const p of A.places || []) {
    const pt = `${tag} place ${p.id}`;
    ok(isStr(p.id) && !placeIds.has(p.id), `${pt} id missing/duplicate`); placeIds.add(p.id);
    ok(isStr(p.name) && isStr(p.lore) && isStr(p.look), `${pt} name/lore/look`);
    ok(['foot', 'raft', 'both'].includes(p.access), `${pt} access`);
    ok(isObj(p.water) && SHAPE_KINDS.includes(p.water.kind) && Array.isArray(p.water.depth) && p.water.depth[0] >= 0 && p.water.depth[1] <= 1 && p.water.depth[0] <= p.water.depth[1], `${pt} water {kind, depth:[a,b]}`);
    if (p.lamp) ok(!!lampById[p.lamp], `${pt} lamp ${p.lamp} unknown`);
    for (const sid of Object.keys(p.attract || {})) ok(D.SPECIES_BY_ID[sid]?.zone === z.id, `${pt} attracts ${sid} (not a ${z.id} species)`);
    for (const k of Object.keys(p.mods || {})) ok(MOD_KEYS.includes(k), `${pt} mods key ${k}`);
    // water cells inside the place area
    const wcells = [];
    const [x0, z0, x1, z1] = D.walkShapeBounds(p.water);
    for (let zz = z0; zz <= z1; zz += G.cell) for (let x = x0; x <= x1; x += G.cell) if (D.placeContains(p, x, zz)) { const k = G.idx(x, zz); if (WL.isAnyWater(G, k) && !(G.flags[k] & D.WALK_FLAGS.BRIDGE)) wcells.push([x, zz]); }
    ok(wcells.length >= 3, `${pt} has no fishable water inside its area`);
    if (p.stand === null) ok(p.rule?.type === 'moving' || p.access === 'raft', `${pt} only roaming or raft places may have no stand`);
    if (p.access !== 'raft' && p.stand !== null) {
      if (ok(p.stand && reach(p.stand), `${pt} stand not walkable / reachable on foot (shortcuts closed)`)) {
        const reachM = castBase + highCast(yAt(p.stand));
        const nearest = Math.min(...wcells.map(([x, zz]) => Math.hypot(x - p.stand.x, zz - p.stand.z)));
        ok(nearest <= reachM, `${pt} water ${nearest.toFixed(1)} m from its stand > base reach ${reachM.toFixed(1)} m`);
        if (p.lamp) { const ld = WL.walkDistances(G, z, [G.idx(p.stand.x, p.stand.z)])[G.idx(lampById[p.lamp].x, lampById[p.lamp].z)]; ok(ld <= 35, `${pt} its lamp is ${ld.toFixed(0)} m away (≤ 35)`); }
      }
    }
    if (p.access !== 'foot' && p.raftStand) ok(RC && RC[G.idx(p.raftStand.x, p.raftStand.z)] === 1, `${pt} raftStand not raft-reachable`);
    // species: ≥ 1 calm-eligible species, per target too
    ok(speciesOk(z.id, p.id, p.water.depth[0], p.water.depth[1], 'calm').length >= 1, `${pt} yields no species in calm`);
    if (p.legend) ok(D.placeContains(p, A.legendPool.x, A.legendPool.z) && A.legendPool.r <= 5, `${pt} must contain the legend pool`);
    const r = p.rule;
    if (r) {
      ok(RULES.includes(r.type) && isStr(r.name), `${pt} rule type ${r?.type}`);
      for (const k of Object.keys(r.mods || {})) ok(MOD_KEYS.includes(k), `${pt} rule mods key ${k}`);
      if (r.deed) ok(deedById[r.deed]?.place === p.id, `${pt} rule deed ${r.deed} must exist and name this place`);
      if (r.type === 'rhythm') ok(r.period > r.warn + r.live && r.live > 0, `${pt} rhythm period > warn + live`);
      if (r.type === 'sequence') ok(deedById[r.deed]?.kind === 'sequence' && r.window > 0 && r.buff > 0, `${pt} sequence needs a sequence deed`);
      if (r.type === 'targets') for (const t of r.targets || []) {
        ok(D.placeContains(p, t.x, t.z), `${pt} target ${t.id} outside the place`);
        const k = G.idx(t.x, t.z); ok(WL.isAnyWater(G, k), `${pt} target ${t.id} is not water`);
        if (isNum(t.depth)) ok(speciesOk(z.id, p.id, t.depth, t.depth, 'any').length >= 1, `${pt} target ${t.id} yields nothing at depth ${t.depth}`);
      }
      if (r.type === 'moving') ok(isObj(r.arc) && r.speed > 0 && r.r > 0, `${pt} moving arc/speed/r`);
      if (r.type === 'drifters') ok(r.lane.every(([x, zz]) => Math.hypot(x, zz) < R - 2) && r.perDay >= 1, `${pt} drifters lane inside the lake`);
      if (r.type === 'plumb') ok(r.depth[0] >= p.water.depth[0] - 1e-9 && r.depth[1] <= p.water.depth[1] + 1e-9, `${pt} plumb depth inside place depth`);
    }
  }
  // place-kept species
  for (const sp of D.SPECIES.filter((x) => x.place && x.zone === z.id)) {
    const p = (A.places || []).find((q) => q.id === sp.place);
    if (!ok(!!p, `species ${sp.id} place ${sp.place} is not a ${z.id} place`)) continue;
    ok(sp.rarity === 'rare' && !sp.bait, `species ${sp.id} (place-kept) must be a bait-free rare`);
    ok(sp.depth[0] <= p.water.depth[1] && p.water.depth[0] <= sp.depth[1], `species ${sp.id} depth never overlaps ${p.id}`);
    if (sp.cond) ok(COND_RULE[sp.cond] === p.rule?.type, `species ${sp.id} cond '${sp.cond}' needs a ${COND_RULE[sp.cond]} rule at ${p.id}`);
  }
  if (A.spotStyle) ok(isNum(A.spotStyle.live) && isNum(A.spotStyle.warn) && Array.isArray(A.spotStyle.every), `${tag} spotStyle`);
  // shortcuts open: everything still reachable
  for (const p of A.places || []) if (p.stand) ok(reach(p.stand, GO, distO), `${tag} place ${p.id} unreachable with shortcuts open`);
}
for (const sp of D.SPECIES) if (sp.place) ok(placeIds.has(sp.place), `species ${sp.id} names unknown place ${sp.place}`);
ok(D.PLACES.length === placeIds.size && Object.keys(D.PLACE_BY_ID).length === placeIds.size, 'PLACES / PLACE_BY_ID incomplete');
ok(D.CHALLENGE_BY_ID.complete_chronicle?.params?.n === D.SPECIES.length, 'complete_chronicle must ask for every species');
const masterAll = D.CHALLENGES.find((c) => c.id === 'every_still_place');
if (masterAll) ok(masterAll.params.n === D.PLACES.length, 'every_still_place must ask for every place');
for (const f of D.WALK_FORMATIONS || []) {
  ok(!!D.ENEMY_BY_ID[f.enemy] && !D.FORMATION_BY_ID[f.id], `walk formation ${f.id} enemy / id clash`);
  ok(Array.isArray(f.modes) && f.modes.every((m) => MODES.includes(m) && m !== 'raft'), `walk formation ${f.id} modes`);
}
for (const b of D.WALK_BOUNTIES || []) ok(!D.BOUNTY_BY_ID[b.id] && isStr(b.text) && isNum(b.base) && Array.isArray(b.modes), `walk bounty ${b.id}`);
for (const k of ['placeNew']) ok(isNum(B.memories[k]), `BALANCE.memories.${k}`);
ok(D.memoriesFor({ placesNew: 3 }).total === 3 * B.memories.placeNew, 'memoriesFor counts placesNew');
checks++;
console.log(`  v2 walk: ${placeIds.size} places, ${walkCells} walkable cells, ${D.SPECIES.filter((x) => x.place).length} place-kept species`);

// ---------------------------------------------------------------------------- lookups, tips, text
for (const [map, arr] of [['SPECIES_BY_ID', 'SPECIES'], ['ZONE_BY_ID', 'ZONES'], ['ENEMY_BY_ID', 'ENEMIES'], ['UPGRADE_BY_ID', 'UPGRADES'],
  ['RELIC_BY_ID', 'RELICS'], ['BAIT_BY_ID', 'BAITS'], ['SUPPLY_BY_ID', 'SUPPLIES'], ['BOON_BY_ID', 'BOONS'], ['CHARACTER_BY_ID', 'CHARACTERS'],
  ['CHALLENGE_BY_ID', 'CHALLENGES'], ['BOUNTY_BY_ID', 'BOUNTIES'], ['FORMATION_BY_ID', 'FORMATIONS'], ['PLACE_BY_ID', 'PLACES'],
  ['WALK_FORMATION_BY_ID', 'WALK_FORMATIONS'], ['WALK_BOUNTY_BY_ID', 'WALK_BOUNTIES']]) {
  if (!D[map] || !D[arr]) continue;
  const ids = D[arr].map((x) => x.id);
  ok(new Set(ids).size === ids.length, `${arr} has duplicate ids`);
  ok(Object.keys(D[map]).length === ids.length && ids.every((id) => D[map][id] === D[arr].find((x) => x.id === id)), `${map} incomplete`);
}
ok(Array.isArray(D.TIPS) && D.TIPS.length > 0, 'TIPS');
for (const t of D.TIPS) {
  ok(isStr(t.id) && isStr(t.trigger) && isStr(t.text), `tip ${t.id} needs string id/trigger/text`);
  ok(t.text.length <= 90, `tip ${t.id} longer than 90 chars`);
}
ok(new Set(D.TIPS.map((t) => t.id)).size === D.TIPS.length, 'duplicate tip ids');

// ---------------------------------------------------------------------------- originality scan (display strings)
const BANNED = /\b(hollow ?knight|hallownest|geo|soul|charms?|vessels?|grubs?|husks?|lumafly|dreamers?|mourner|greenpath|archives|masks?|shades?)\b/i;
const seen = new Set();
const scan = (v, path) => {
  if (typeof v === 'string') { if (BANNED.test(v)) errors.push(`originality: banned word in ${path}: "${v.slice(0, 80)}"`); return; }
  if (!v || typeof v !== 'object' || seen.has(v)) return;
  seen.add(v);
  for (const [k, c] of Object.entries(v)) if (!/^(id|icon|behavior|weapon|model|shape|type|trigger|mechanic)$/.test(k)) scan(c, `${path}.${k}`);
};
for (const k of ['ZONES', 'SPECIES', 'BAITS', 'UPGRADES', 'SUPPLIES', 'RELICS', 'ENEMIES', 'BOONS', 'CHARACTERS', 'CHALLENGES', 'BOUNTIES', 'TIPS', 'MERCHANT_LINES', 'EPITAPHS', 'TEXT', 'FORMATIONS', 'WALK_FORMATIONS', 'WALK_BOUNTIES']) scan(D[k], k);
checks++;

// ---------------------------------------------------------------------------- report
for (const w of warnings) console.log('  warn:', w);
if (errors.length) {
  for (const e of errors.slice(0, 80)) console.log('  FAIL:', e);
  if (errors.length > 80) console.log(`  … and ${errors.length - 80} more`);
  console.log(`validate-data: ${errors.length} failure(s) in ${checks} checks`);
  process.exit(1);
}
console.log(`validate-data: OK (${checks} checks; ${D.SPECIES.length} species, ${D.BOONS.length} boons, ${D.CHARACTERS.length} characters, ${D.CHALLENGES.length} challenges, ${D.RELICS.length} relics, ${D.UPGRADES.length} upgrades, ${D.ENEMIES.length} enemies)`);
