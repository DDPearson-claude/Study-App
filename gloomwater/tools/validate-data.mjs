#!/usr/bin/env node
// tools/validate-data.mjs — schema & consistency validation for src/data.js.
// Checks CONTRACT.md §8 (hybrid sail · fish · survive the swarm) plus the cross-references
// DESIGN.md relies on. Usage:  node tools/validate-data.mjs   (exit code 1 on any failure)
import * as D from '../src/data.js';

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
  'nibbleTells'];
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
  if (r.special) ok(/^(startShells:\d+|startKit|shimmer:[\d.]+|memMult:[\d.]+|secondWick|waystone:(sporewood|glasswater|paleabyss))$/.test(r.special), `relic ${r.id} special '${r.special}' unknown`);
  ok(Object.keys(r.effects || {}).length > 0 || !!r.special, `relic ${r.id} does nothing`);
}
for (const s of D.SUPPLIES) for (const k of Object.keys(s.give || {})) ok(['oil', 'satiety', 'hp', 'flareCharges', 'spots'].includes(k), `supply ${s.id} give key ${k}`);

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
ok(D.CHALLENGES.length >= 24 && D.CHALLENGES.length <= 30, 'CHALLENGES must hold 24–30 goals');
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

// ---------------------------------------------------------------------------- lookups, tips, text
for (const [map, arr] of [['SPECIES_BY_ID', 'SPECIES'], ['ZONE_BY_ID', 'ZONES'], ['ENEMY_BY_ID', 'ENEMIES'], ['UPGRADE_BY_ID', 'UPGRADES'],
  ['RELIC_BY_ID', 'RELICS'], ['BAIT_BY_ID', 'BAITS'], ['SUPPLY_BY_ID', 'SUPPLIES'], ['BOON_BY_ID', 'BOONS'], ['CHARACTER_BY_ID', 'CHARACTERS'],
  ['CHALLENGE_BY_ID', 'CHALLENGES'], ['BOUNTY_BY_ID', 'BOUNTIES'], ['FORMATION_BY_ID', 'FORMATIONS']]) {
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
for (const k of ['ZONES', 'SPECIES', 'BAITS', 'UPGRADES', 'SUPPLIES', 'RELICS', 'ENEMIES', 'BOONS', 'CHARACTERS', 'CHALLENGES', 'BOUNTIES', 'TIPS', 'MERCHANT_LINES', 'EPITAPHS', 'TEXT', 'FORMATIONS']) scan(D[k], k);
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
