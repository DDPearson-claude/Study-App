#!/usr/bin/env node
// tools/validate-data.mjs — schema & consistency validation for src/data.js.
// Checks CONTRACT.md §8 (hybrid sail · fish · survive the swarm) plus the cross-references
// DESIGN.md relies on. Usage:  node tools/validate-data.mjs   (exit code 1 on any failure)
//
// Two passes: (1) the v1 tables with WALK_ENABLED off — every v1 table must stay exactly as v1 (QA §24.13 #1);
// (2) a child process with `--walk` re-checks every table with the walking build on and runs the v2 map
// checks (DESIGN §24, CONTRACT §12). `--v1` skips pass 2; `--walk` runs pass 2 only.
const WALK = process.argv.includes('--walk');
if (WALK) globalThis.GW_WALK = true;
const D = await import(WALK ? '../src/data.js?walk' : '../src/data.js');

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
  'nibbleTells', ...(WALK ? ['stride'] : [])];   // v2 (walking): stride, + m/s on foot (DESIGN §24.3)
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
  if (r.special) ok(/^(startShells:\d+|startKit|shimmer:[\d.]+|memMult:[\d.]+|secondWick|waystone:(sporewood|glasswater|paleabyss)|lampRadius:\d+|shortcutStart:\d+)$/.test(r.special) && (WALK || !/^(lampRadius|shortcutStart)/.test(r.special)), `relic ${r.id} special '${r.special}' unknown`);
  ok(Object.keys(r.effects || {}).length > 0 || !!r.special, `relic ${r.id} does nothing`);
}
for (const s of D.SUPPLIES) for (const k of Object.keys(s.give || {})) ok(['oil', 'satiety', 'hp', 'flareCharges', 'spots', ...(WALK ? ['stake'] : [])].includes(k), `supply ${s.id} give key ${k}`);

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
ok(D.CHARACTERS.length === 5 + (WALK ? D.WALK_CHARACTERS.length : 0), `need exactly ${5 + (WALK ? D.WALK_CHARACTERS.length : 0)} characters`);
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
ok(D.CHALLENGES.length >= 24 && D.CHALLENGES.length <= (WALK ? 40 : 30), `CHALLENGES must hold 24–${WALK ? 40 : 30} goals${WALK ? ' (v2: + tier IV Paths Underfoot)' : ''}`);
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
  ['CHALLENGE_BY_ID', 'CHALLENGES'], ['BOUNTY_BY_ID', 'BOUNTIES'], ['FORMATION_BY_ID', 'FORMATIONS'],
  ...(WALK ? [['PLACE_BY_ID', 'PLACES'], ['WALK_FORMATION_BY_ID', 'WALK_FORMATIONS'], ['WALK_BOUNTY_BY_ID', 'WALK_BOUNTIES']] : [])]) {
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
for (const k of ['ZONES', 'SPECIES', 'BAITS', 'UPGRADES', 'SUPPLIES', 'RELICS', 'ENEMIES', 'BOONS', 'CHARACTERS', 'CHALLENGES', 'BOUNTIES', 'TIPS', 'MERCHANT_LINES', 'EPITAPHS', 'TEXT', 'FORMATIONS', ...(WALK ? ['ARENA_V2', 'WALK_FORMATIONS', 'WALK_BOUNTIES'] : [])]) scan(D[k], k);
checks++;

// ---------------------------------------------------------------------------- v2 (walking, DESIGN §24) — pass 2 only
if (WALK) {
  const WL = await import('./walk-lib.mjs');
  if (!ok(WL.D === D, 'walk-lib must share the walking data instance')) process.exit(1);
  const B = D.BALANCE, WB = B.walk, LB = B.lamps, PB = B.places, FB = B.combat.foot, F = D.WALK_FLAGS, EPS = WB.eps;
  const MODES = ['raft', 'mixed', 'foot'];
  const SHAPE_KINDS = ['disc', 'ring', 'rect', 'poly', 'path'];
  const SHAPE_TAGS = ['ground', 'ramp', 'jetty', 'bridge'];
  const RULES = ['rhythm', 'sequence', 'deed', 'targets', 'moving', 'drifters', 'cue', 'plumb', 'reflection', 'phaseWindow'];
  const MOD_KEYS = ['waitMult', 'rarity', 'quality', 'weightBias', 'surgeEveryMult', 'erraticMult', 'hookWindowMult', 'hookWindowAdd',
    'nibbleTells', 'bandAmpMult', 'bandNoiseMult', 'darterJumpMult', 'legendEnrageAdd', 'sweetAdd', 'surgeWarnAdd'];
  const COND_RULE = { buff: 'sequence', deed: 'deed', reflection: 'reflection', plumbBottom: 'plumb', window: 'phaseWindow' };
  const DEED_KINDS = ['winch', 'strike', 'light', 'sequence', 'rope', 'offer'];
  const RESETS = ['run', 'day', 'dawn', 'dusk', 'never'];
  const MODE_RESET = { permanent: 'run', dawn: 'dawn', untilDusk: 'dusk', window: 'never' };
  const RAFT_MODES = ['free', 'skiff', 'beached', 'none'];
  const speed = WL.footSpeed();
  const near = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const halfStep = (v) => Math.abs((((v / WB.heightQuant) % 1) + 1) % 1 - 0.5) < 1e-6;

  // ---- BALANCE (v2) and the review rules that live in numbers
  for (const [k, o] of [['walk', WB], ['places', PB], ['lamps', LB], ['combat.foot', FB]]) ok(isObj(o), `BALANCE.${k} missing (v2)`);
  for (const k of ['speedMult', 'accel', 'decel', 'turnRate', 'radius', 'stepUp', 'stepDown', 'maxSlope', 'heightQuant', 'eps']) ok(isNum(WB[k]) && WB[k] > 0, `BALANCE.walk.${k}`);
  ok(WB.stepUp === WB.stepDown, 'steps must be symmetric (stepUp === stepDown); only authored drops are one-way');
  for (const [name, v] of [['walk.stepUp', WB.stepUp], ['walk.drop.max', WB.drop.max], ['walk.steepLine.from', WB.steepLine.from], ['combat.foot.crawl.climb', FB.crawl.climb],
    ['combat.foot.crawl.drop', FB.crawl.drop], ['combat.foot.eel.maxHeight', FB.eel.maxHeight], ['combat.foot.highGround.minHeight', FB.highGround.minHeight]])
    ok(halfStep(v), `height threshold ${name} = ${v} must sit on a half-step of heightQuant ${WB.heightQuant} (never within eps of a quantised height)`);
  ok(WB.eps < WB.heightQuant / 2 - 1e-9, 'eps must be < heightQuant / 2');
  // anticipation on foot (MF11): 90% speed no sooner than 0.35 s, a glide of at least 0.5 m
  ok(Math.log(10) / WB.accel >= 0.35 && (D.STATS.moveSpeed.base * WB.speedMult) / WB.decel >= 0.5, 'foot accel/decel too snappy (90% in ≥ 0.35 s, stop ≥ 0.5 m)');
  const hand = D.ENEMY_BY_ID.drowned_hand, ink = D.ENEMY_BY_ID.weeping_inkwell;
  ok(FB.hand.stainRadius === hand.telegraph.stainRadius, 'killers keep raft values: combat.foot.hand.stainRadius must equal the raft stain radius');
  ok(FB.warden.telegraphAdd === 0, 'killers keep raft values: combat.foot.warden.telegraphAdd must be 0');
  ok(JSON.stringify(FB.inkwell.hold) === JSON.stringify(ink.artillery.hold), 'killers keep raft values: inkwells hold at the raft distance');
  ok(!('globFlightAdd' in (FB.highGround || {})), 'no slower globs on high ground (killers keep raft values)');
  ok(FB.contactRadius >= 1.6 && FB.contactRadius <= B.damage.contactRadius, 'combat.foot.contactRadius in [1.6, raft]');
  ok(FB.flow.cell === (D.walkArenaFor('glasswater').walk.cell), 'the crawler flow field runs on the walk grid (same cell)');
  ok(FB.boonWeightRaftLake === 0, 'foot-tagged boons are never offered in raft-only lakes');
  ok(JSON.stringify(LB.hop.phases) === '["dawn"]' && LB.hop.perDay === 1, 'Flame-leap: dawn only, once a day');
  ok(LB.darknessShelter > 0 && LB.darknessShelter < 1, 'darkness shelter is partial (a rate multiplier in (0, 1))');
  ok(LB.stake.shelter === false, 'the Stake Lantern gives no darkness shelter');
  ok(LB.lightCost >= 12, 'sharing flame costs ≥ 12 × zone oil drain');
  ok(isObj(B.travel.arrivalHush) && (B.travel.arrivalHush.sporewood ?? 0) <= 10, 'Arrival Hush is per lake and ≤ 10 s in Sporewood');
  ok(D.ZONES[0].mode === 'raft' && !D.ARENA_V2.mossmere && !D.ZONES[0].arena.walk, 'the Mossmere stays raft-only (no walk layout)');
  for (const e of D.ENEMIES) ok(['fly', 'crawl', 'swim', 'static'].includes(D.ENEMY_MOVE[e.id]), `ENEMY_MOVE.${e.id} must be fly|crawl|swim|static`);
  for (const e of D.ENEMIES) if (D.ENEMY_MOVE[e.id] === 'crawl') ok(e.waterBound === true, `${e.id}: crawlers are the waterBound enemies`);
  ok(D.WALK_SHORE.pad + D.WALK_SHORE.cliffGap >= 2, 'land stays ≥ 2 m inside the cliff base (pad + cliffGap ≥ 2)');

  // ---- tips: every trigger is a real event + discriminator (ui matches `event` and `event:<phase|resource|reason|state|id>`)
  const EV = {
    'run:start': null, 'player:anchor': null, 'fishing:cast': null, 'fishing:nibble': null, 'fishing:hook': null, 'fishing:surge': null, 'fish:landed': null,
    'merchant:arrive': null, 'enemy:slain': null, 'levelup': null, 'lantern:out': null, 'enemy:steal': null, 'gate:open': null, 'boss:spawn': null,
    'journal:new': null, 'zone:unlock': null, 'lamp:lit': null, 'place:discover': null, 'walk:high': null, 'shortcut:open': null, 'foot:eelEdge': null, 'place:astir': null,
    'fishing:miss': ['early', 'late', 'moved'], 'fishing:escaped': ['slack', 'snap'], 'phase:change': ['calm', 'dusk', 'gloomtide', 'dawn'],
    'resource:low': ['oil', 'satiety', 'hp'], 'enemy:spawn': ['elite'], 'interact:change': ['merchant', 'gate', 'ashore', 'board', 'bell', 'lamp', 'hop', 'fishHere', 'stake', 'deed'],
    'player:mode': ['ashore', 'board', 'spawn'], 'lamp:snuffed': ['slam', 'moths', 'eclipse', 'legend'],
  };
  for (const t of D.TIPS) {
    const parts = t.trigger.split(':'), ev = parts.slice(0, 2).join(':'), disc = parts[2];
    ok(ev in EV, `tip ${t.id}: unknown trigger event ${ev}`);
    if (disc !== undefined) ok(Array.isArray(EV[ev]) && EV[ev].includes(disc), `tip ${t.id}: ${ev} has no discriminator '${disc}'`);
  }
  ok(!D.TIPS.some((t) => t.trigger === 'player:mode'), "no tip on bare 'player:mode' (it would fire on raft spawns)");

  // ---- names: no head noun reused across lakes (places, rules, landmarks, candles, deeds, shortcuts, moorings, vigils)
  const STOP = /^(the|of|a|an|from|for|and|to|in|at)$/i;
  const head = (name) => {
    let s = String(name).replace(/\(.*?\)/g, '').replace(/\b(I|II|III|IV|V)\b/g, '').trim();
    const of = s.match(/^(.*?)\s+of\s+/i); if (of) s = of[1];
    const w = s.split(/[\s-]+/).filter((x) => x && !STOP.test(x)); return (w[w.length - 1] || '').replace(/['’]s$/, '').toLowerCase();
  };
  const nouns = new Map();   // noun → Set(zone)
  const addName = (zid, name, what) => { if (!isStr(name)) return; const h = head(name); if (!h) return; if (!nouns.has(h)) nouns.set(h, new Map()); nouns.get(h).set(zid, `${what} "${name}"`); };
  for (const z of D.ZONES) {
    const A = z.arena;
    for (const o of [...(A.islands || []), ...(A.deepPools || [])]) addName(z.id, o.name, 'landmark');
    if (A.gate) addName(z.id, A.gate.name, 'gate'); if (A.legendPool) addName(z.id, A.legendPool.name, 'legend pool');
    if (!A.walk) continue;
    for (const s of A.walk.shapes) addName(z.id, s.name, 'shape');
    for (const p of A.places || []) { addName(z.id, p.name, 'place'); addName(z.id, p.rule?.name, 'rule'); addName(z.id, p.standName, 'stand'); addName(z.id, p.altStand?.name, 'stand'); }
    for (const l of A.lamps || []) addName(z.id, l.name, 'candle');
    for (const x of [...(A.deeds || []), ...(A.shortcuts || []), ...(A.moorings || []), ...(A.vigils || [])]) addName(z.id, x.name, 'name');
  }
  for (const [h, m] of nouns) ok(m.size <= 1, `head noun '${h}' reused across lakes: ${[...m.entries()].map(([z, w]) => `${z}: ${w}`).join(' / ')}`);

  // ---- per walking lake
  const placeIds = new Set();
  let walkCells = 0, gridChecks = 0;
  const speciesOk = (zid, place, d0, d1, phase) => D.SPECIES.filter((sp) => sp.zone === zid && sp.rarity !== 'legendary' && !sp.bait
    && (!sp.place || (sp.place === place && !sp.cond)) && (phase === 'calm' ? sp.time !== 'gloom' : true) && sp.depth[0] <= d1 && d0 <= sp.depth[1]);
  for (const z of D.ZONES) {
    const A = z.arena, R = A.radius, tag = `${z.id} (v2)`;
    ok(MODES.includes(z.mode), `${z.id}.mode must be raft|mixed|foot (got ${z.mode})`);
    if (z.phases) ok(isNum(z.phases.calm) && z.phases.calm >= B.phases.calm && z.phases.calm <= 150, `${tag} phases.calm override`);
    if (z.mode === 'raft') continue;
    const Wk = A.walk;
    if (!ok(isObj(Wk) && Array.isArray(Wk.shapes) && Wk.shapes.length > 0, `${tag} needs arena.walk.shapes`)) continue;
    ok(['raft', 'foot'].includes(A.spawnMode) && (z.mode === 'mixed' ? A.spawnMode === 'raft' : A.spawnMode === 'foot'), `${tag} spawnMode must be raft (mixed) / foot (foot)`);
    ok(isObj(A.raft) && RAFT_MODES.includes(A.raft.mode), `${tag} raft.mode must be one of ${RAFT_MODES}`);
    ok(z.mode !== 'mixed' || A.raft.mode === 'free', `${tag} a mixed lake needs a free raft`);
    if (A.raft.at) ok(isNum(A.raft.at.yawDeg) && !('yaw' in A.raft.at), `${tag} raft.at needs yawDeg (degrees), not yaw`);
    ok(D.shoreRFor(z)?.(1.23) === R, `${tag} shoreRFor must be the exact circle R on walking lakes`);
    // shapes
    const sids = new Set(), shortcutIds = new Set((A.shortcuts || []).map((c) => c.id));
    for (const sh of [...Wk.shapes, ...(Wk.holes || []), ...(Wk.blocks || [])]) {
      ok(SHAPE_KINDS.includes(sh.kind), `${tag} shape ${sh.id} kind ${sh.kind}`);
      const [x0, z0, x1, z1] = D.walkShapeBounds(sh);
      ok([x0, z0, x1, z1].every(isNum) && Math.max(Math.abs(x0), Math.abs(x1), Math.abs(z0), Math.abs(z1)) <= R + 12, `${tag} shape ${sh.id} far outside the lake`);
    }
    for (const sh of Wk.shapes) {
      ok(isStr(sh.id) && !sids.has(sh.id), `${tag} shape id ${sh.id} missing/duplicate`); sids.add(sh.id);
      ok(SHAPE_TAGS.includes(sh.tag), `${tag} shape ${sh.id} tag ${sh.tag}`);
      if (sh.needs) ok(shortcutIds.has(sh.needs), `${tag} shape ${sh.id} needs unknown shortcut ${sh.needs}`);
      if (sh.kind === 'path') {
        ok(sh.w >= 2.4 - 1e-9, `${tag} walkway ${sh.id} narrower than 2.4 m`);
        for (let i = 0; i + 1 < sh.pts.length; i++) {
          const [ax, az, ay = sh.y ?? 0] = sh.pts[i], [bx, bz, by = sh.y ?? 0] = sh.pts[i + 1];
          ok(Math.abs(by - ay) / Math.max(1e-6, Math.hypot(bx - ax, bz - az)) <= WB.maxSlope + 1e-9, `${tag} ramp ${sh.id} steeper than maxSlope ${WB.maxSlope}`);
        }
      }
      if (sh.kind === 'ring') ok(sh.r1 - sh.r0 >= 2.4 - 1e-9, `${tag} ring ${sh.id} narrower than 2.4 m`);
    }
    for (const h of Wk.holes || []) {
      ok(isNum(h.depth) && h.depth > 0 && h.depth <= 1, `${tag} hole ${h.id} depth`);
      if (h.lip) ok(isNum(h.lip.w) && h.lip.w > 0 && h.lip.y <= 1.0 + EPS && h.lip.y >= 0.35 && (h.lip.a1 ?? 150) - (h.lip.a0 ?? 30) >= 120 - 1e-9, `${tag} hole ${h.id} lip must be a ≥ 120° south band at y 0.35–1.0`);
    }
    for (const b of Wk.blocks || []) ok(isNum(b.h), `${tag} block at (${b.x},${b.z}) needs a height h`);
    const vids = new Set();
    for (const v of Wk.variants || []) {
      ok(isStr(v.id) && !vids.has(v.id) && isStr(v.name) && isNum(v.weight) && v.weight > 0, `${tag} variant ${v.id} id/name/weight`); vids.add(v.id);
      for (const s of v.fallen || []) ok(sids.has(s), `${tag} variant ${v.id} fells unknown shape ${s}`);
      for (const [sc, ids] of Object.entries(v.swap || {})) { ok(shortcutIds.has(sc), `${tag} variant ${v.id} swaps unknown shortcut ${sc}`); for (const s of ids) ok((v.fallen || []).includes(s), `${tag} variant ${v.id} raises ${s}, which is not fallen`); }
    }
    // deeds, shortcuts, drops
    const deedById = Object.fromEntries((A.deeds || []).map((d) => [d.id, d]));
    for (const c of A.shortcuts || []) {
      ok(!!deedById[c.deed] && deedById[c.deed].opens === c.id, `${tag} shortcut ${c.id} must be opened by its deed ${c.deed}`);
      ok(Wk.shapes.some((sh) => sh.needs === c.id), `${tag} shortcut ${c.id} gates no shape`);
    }
    for (const d of A.deeds || []) {
      ok(DEED_KINDS.includes(d.kind), `${tag} deed ${d.id} kind ${d.kind}`);
      ok((d.points ? d.points.length >= 2 : true) && (d.at || d.points), `${tag} deed ${d.id} needs at / points`);
      ok(['pill', 'touch'].includes(d.trigger), `${tag} deed ${d.id} trigger must be 'pill' or 'touch'`);
      if (d.trigger === 'touch') ok(isNum(d.touchR) && d.touchR > 0 && d.touchR <= 1.5, `${tag} touch deed ${d.id} needs touchR (0, 1.5]`);
      if (d.kind === 'sequence') ok(d.trigger === 'touch', `${tag} sequence deed ${d.id} is walked through (touch)`);
      ok(RESETS.includes(d.resets), `${tag} deed ${d.id} resets ${d.resets}`);
      if (d.opens) ok(shortcutIds.has(d.opens) && d.resets === 'run', `${tag} deed ${d.id} opens unknown ${d.opens} / must reset per run`);
      if (d.place) ok((A.places || []).some((p) => p.id === d.place), `${tag} deed ${d.id} names unknown place ${d.place}`);
    }
    const stands = [];   // {p, st, name}
    for (const p of A.places || []) for (const st of [p.stand, p.altStand].filter(Boolean)) if (p.access !== 'raft') stands.push({ p, st, alt: st === p.altStand });
    // moorings
    for (const m of A.moorings || []) {
      ok(isNum(m.yawDeg) && !('yaw' in m), `${tag} mooring ${m.id} needs yawDeg (degrees)`);
      ok(near(m.stand, m.slot) - B.move.raftRadius <= WB.board.range + 1e-9, `${tag} mooring ${m.id}: stand → slot ${near(m.stand, m.slot).toFixed(2)} m − raft radius > board.range ${WB.board.range}`);
    }
    // ---- grids: every reachability check on the body-eroded grid, shortcuts closed and open, every variant
    let G0 = null, M0 = null, dist0 = null;
    for (const vId of WL.variantsOf(z)) for (const openK of [false, true]) {
      const G = D.walkGridFor(z, { open: openK ? WL.openAll(z) : {}, variant: vId }), M = WL.erode(G);
      const seeds = WL.footSeeds(G, z, M), dist = WL.walkDistances(G, z, seeds, M);
      const label = `${tag} [${vId || 'base'}, shortcuts ${openK ? 'open' : 'closed'}]`;
      if (!vId && !openK) { G0 = G; M0 = M; dist0 = dist; }
      gridChecks++;
      ok(seeds.length === (A.spawnMode === 'foot' ? 1 : (A.moorings || []).length), `${label} spawn / mooring stands must fit the Wick`);
      const reach = (p, rr) => { const k = WL.snap(G, M, p.x, p.z, rr); return k >= 0 && dist[k] < Infinity; };
      for (const { p, st, alt } of stands) ok(reach(st, 0.6), `${label} place ${p.id}${alt ? ' altStand' : ''} stand (${st.x},${st.z}) unreachable for the Wick (r ${WB.radius})`);
      for (const l of A.lamps || []) ok(reach(l, WB.interactRange - 0.4), `${label} candle ${l.id} unreachable`);
      for (const d of A.deeds || []) for (const q of d.points || [d.at]) ok(reach(q, d.trigger === 'touch' ? d.touchR : WB.interactRange - 0.4), `${label} deed ${d.id} (${q.x},${q.z}) unreachable`);
      for (const m of A.moorings || []) ok(reach(m.stand, 0.6), `${label} mooring ${m.id} stand unreachable`);
      if (A.gate && A.gateAccess === 'foot') {
        let g = false;
        for (let k = 0; k < G.n * G.n && !g; k++) if (M[k] && dist[k] < Infinity) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - A.gate.x, zz - A.gate.z) <= A.gate.r + WB.gateFootRange) g = true; }
        ok(g, `${label} foot gate: no reachable cell within r + ${WB.gateFootRange} m of ${A.gate.name}`);
      }
      if (z.mode === 'foot') for (const d of A.docks || []) {
        const k0 = G.idx(d.x, d.z), r = Math.ceil(WB.tradeRange / G.cell); let nearW = false;
        for (let dj = -r; dj <= r && !nearW; dj++) for (let di = -r; di <= r && !nearW; di++) { const k = k0 + dj * G.n + di; if (M[k] && dist[k] < Infinity && Math.hypot(di, dj) * G.cell <= WB.tradeRange - 1) nearW = true; }
        ok(nearW, `${label} dock (${d.x},${d.z}) has no reachable walkway within trade range − 1 m`);
      }
    }
    const G = G0, M = M0, dist = dist0, { n } = G;
    // pools enclosed; shore; height rules
    let leaks = 0, beyond = 0, oneWay = 0, nearStep = 0, nearClimb = 0;
    for (let k = 0; k < n * n; k++) {
      const f = G.flags[k];
      if (!(f & F.VOID)) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x, zz) > R - D.WALK_SHORE.pad + 1e-9) beyond++; }
      if (f & F.POOL) { const i = k % n, j = (k / n) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (j + dj) * n + (i + di); if (G.flags[q] & F.WATER) leaks++; } }
      if (!WL.isWalk(G, k)) continue;
      const i = k % n, j = (k / n) | 0, t = G.top[k];
      for (const [di, dj] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
        const q = (j + dj) * n + (i + di); if (!WL.isWalk(G, q)) continue;
        if (D.walkStepOK(t, G.top[q]) !== D.walkStepOK(G.top[q], t)) oneWay++;
        if (Math.abs(Math.abs(G.top[q] - t) - WB.stepUp) <= EPS) nearStep++;
      }
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (WL.isLakeWater(G, (j + dj) * n + (i + di)) && Math.abs(t - FB.crawl.climb) <= EPS) nearClimb++;
    }
    ok(leaks === 0, `${tag} ${leaks} enclosed-pool cells touch open lake water (holes must sit inside ground)`);
    ok(beyond === 0, `${tag} ${beyond} cells beyond R − ${D.WALK_SHORE.pad} m are not VOID`);
    ok(oneWay === 0, `${tag} ${oneWay} one-way walkable pairs (only authored drops may be one-way)`);
    ok(nearStep === 0 && nearClimb === 0, `${tag} cells within eps of a threshold: ${nearStep} step pairs, ${nearClimb} climb edges`);
    for (const d of A.drops || []) {
      const a = G.idx(d.from.x, d.from.z), b = G.idx(d.to.x, d.to.z);
      ok(WL.isWalk(G, a) && WL.isWalk(G, b), `${tag} drop ${d.id} ends must be walkable`);
      const h = G.top[a] - G.top[b];
      ok(h > WB.stepUp + EPS && h <= WB.drop.max && Math.abs(h - WB.drop.max) > EPS, `${tag} drop ${d.id} height ${h.toFixed(2)} outside (stepUp, drop.max]`);
    }
    // every ramp can be walked end to end (painter's order: ramps after the platforms they climb onto)
    for (const sh of Wk.shapes) if (sh.kind === 'path' && sh.pts.some((p) => p.length > 2 && Math.abs(p[2] - sh.pts[0][2]) > WB.stepUp)) {
      const e0 = sh.pts[0], e1 = sh.pts[sh.pts.length - 1], a = WL.snap(G, M, e0[0], e0[1], 1.0), b = WL.snap(G, M, e1[0], e1[1], 1.0);
      const L = sh.pts.slice(1).reduce((s2, p, i) => s2 + Math.hypot(p[0] - sh.pts[i][0], p[1] - sh.pts[i][1]), 0);
      const dd = a >= 0 && b >= 0 ? WL.walkDistances(G, z, [a], M)[b] : Infinity;
      ok(dd <= 1.3 * L + 2, `${tag} ramp ${sh.id} cannot be walked end to end (${Number.isFinite(dd) ? dd.toFixed(1) + ' m' : 'cut'}; length ${L.toFixed(1)} m)`);
    }
    // candles: coverage
    ok((A.lamps || []).length >= 3, `${tag} needs ≥ 3 sister-candles`);
    const safePts = [...(A.lamps || []), ...(z.mode === 'mixed' ? (A.moorings || []).map((m) => m.stand) : [])];   // mixed lakes: the moored raft counts
    const lampDist = WL.walkDistances(G, z, safePts.map((l) => WL.snap(G, M, l.x, l.z, WB.interactRange)).filter((k) => k >= 0), M);
    let worst = 0, unreach = 0, walk = 0;
    for (let k = 0; k < n * n; k++) {
      if (!WL.isWalk(G, k) || (G.flags[k] & F.SILL)) continue; walk++;
      if (!M[k]) continue;
      if (dist[k] === Infinity) { unreach++; continue; }
      worst = Math.max(worst, lampDist[k]);
    }
    walkCells += walk;
    ok(worst <= LB.maxPathToLamp, `${tag} a reachable walkway is ${worst.toFixed(0)} m from the nearest sister-candle${z.mode === 'mixed' ? ' or mooring' : ''} (max ${LB.maxPathToLamp})`);
    warn(unreach / Math.max(1, walk) <= 0.06, `${tag} ${((100 * unreach) / Math.max(1, walk)).toFixed(1)}% of walkable cells unreachable (decor only)`);
    // pill separation and touch stations
    const lamps = A.lamps || [], pills = (A.deeds || []).filter((d) => d.trigger === 'pill').flatMap((d) => (d.points || [d.at]).map((q) => ({ ...q, id: d.id })));
    const touches = (A.deeds || []).filter((d) => d.trigger === 'touch').flatMap((d) => (d.points || [d.at]).map((q) => ({ ...q, id: d.id, r: d.touchR })));
    const standPts = [...stands.map(({ p, st }) => ({ ...st, id: p.id })), ...(A.moorings || []).map((m) => ({ ...m.stand, id: m.id }))];
    for (const l of lamps) {
      for (const s of standPts) {
        ok(near(l, s) >= LB.minFromStand - 1e-9, `${tag} candle ${l.id} is ${near(l, s).toFixed(1)} m from the ${s.id} stand (≥ ${LB.minFromStand}: pills overlap)`);
        ok(!(Math.abs(l.x - s.x) <= 1.5 && l.z - s.z > 0 && l.z - s.z <= 6), `${tag} candle ${l.id} stands south of the ${s.id} stand (camera line)`);
      }
      for (const q of pills) ok(near(l, q) >= 3 - 1e-9, `${tag} candle ${l.id} is ${near(l, q).toFixed(1)} m from deed ${q.id} (pills overlap)`);
      for (const d of A.docks || []) ok(near(l, d) >= LB.minFromDock - 1e-9, `${tag} candle ${l.id} too close to a dock`);
    }
    for (const q of pills) for (const s of standPts) ok(near(q, s) >= 3 - 1e-9, `${tag} deed ${q.id} is ${near(q, s).toFixed(1)} m from the ${s.id} stand (pills overlap)`);
    for (const t of touches) for (const s of [...standPts, ...lamps]) ok(near(t, s) >= t.r + 1 - 1e-9, `${tag} ${t.id} station (${t.x},${t.z}) is within touchR + 1 m of ${s.id}`);
    for (const d of A.docks || []) for (const s of standPts) ok(near(d, s) >= WB.tradeRange + 0.5 - 1e-9, `${tag} dock (${d.x},${d.z}) is ${near(d, s).toFixed(1)} m from the ${s.id} stand (trade pill would cover it)`);
    // vigil grounds: open ground within reach of every stand that is not a designated dead end
    const vigilCells = [];
    for (const v of A.vigils || []) {
      if (v.kind === 'disc') {
        let tot = 0, good = 0;
        for (let zz = v.z - v.r; zz <= v.z + v.r; zz += G.cell) for (let x = v.x - v.r; x <= v.x + v.r; x += G.cell) {
          if (Math.hypot(x - v.x, zz - v.z) > v.r) continue; tot++; const k = G.idx(x, zz); if (WL.isWalk(G, k) && dist[k] < Infinity) { good++; if (M[k]) vigilCells.push(k); }
        }
        ok(v.r >= WB.vigil.discMin && good / Math.max(1, tot) >= WB.vigil.discFill, `${tag} vigil ${v.id}: disc r ${v.r} only ${((100 * good) / Math.max(1, tot)).toFixed(0)}% open ground`);
      } else {
        let len = 0, bad = 0;
        for (let i = 0; i < v.pts.length; i++) {
          const [ax, az] = v.pts[i], [bx, bz] = v.pts[(i + 1) % v.pts.length], L = Math.hypot(bx - ax, bz - az); len += L;
          for (let s = 0; s <= L; s += 0.5) { const k = WL.snap(G, M, ax + (bx - ax) * (s / L), az + (bz - az) * (s / L), 0.8); if (k < 0 || dist[k] === Infinity) bad++; else vigilCells.push(k); }
        }
        ok(bad === 0 && len >= WB.vigil.loopMin, `${tag} vigil loop ${v.id}: ${bad} breaks, length ${len.toFixed(0)} m (≥ ${WB.vigil.loopMin})`);
      }
    }
    if (z.mode === 'mixed') for (const m of A.moorings || []) { const k = WL.snap(G, M, m.stand.x, m.stand.z, 0.6); if (k >= 0) vigilCells.push(k); }   // the raft is the open ground
    const vigDist = WL.walkDistances(G, z, vigilCells, M);
    for (const { p, st } of stands) if (!p.deadEnd) {
      const k = WL.snap(G, M, st.x, st.z, 0.6);
      ok(k >= 0 && vigDist[k] / speed <= WB.vigil.maxSeconds, `${tag} place ${p.id}: open ground is ${(vigDist[k] / speed).toFixed(1)} s away (≤ ${WB.vigil.maxSeconds} s, or mark it deadEnd)`);
    }
    // raft component
    const RM = WL.raftMask(G), raftStart = z.mode === 'mixed' ? G.idx(A.spawn.x, A.spawn.z)
      : A.raft.mode === 'skiff' ? G.idx(A.moorings.find((m) => m.id === A.raft.start)?.slot.x ?? 0, A.moorings.find((m) => m.id === A.raft.start)?.slot.z ?? 0) : -1;
    const RC = raftStart >= 0 ? WL.component(G, RM, raftStart) : null;
    if (z.mode === 'mixed') ok(RC && RC[raftStart], `${tag} raft spawn must be open water`);
    if (A.raft.mode === 'skiff') ok(A.moorings.some((m) => m.id === A.raft.start), `${tag} skiff start mooring`);
    for (const m of A.moorings || []) ok(RC && RC[G.idx(m.slot.x, m.slot.z)] === 1, `${tag} mooring ${m.id} slot not raft-reachable`);
    if (A.gate && A.gateAccess === 'raft') ok(RC && RC[G.idx(A.gate.x, A.gate.z)] === 1, `${tag} raft gate not raft-reachable`);
    if (z.mode === 'mixed') for (const d of A.docks || []) ok(WL.isLakeWater(G, G.idx(d.x, d.z)) && RC && RC[G.idx(d.x, d.z)] === 1, `${tag} dock (${d.x},${d.z}) not raft-reachable`);
    else for (const d of A.docks || []) ok(WL.isLakeWater(G, G.idx(d.x, d.z)), `${tag} dock (${d.x},${d.z}) must be open water`);
    // places
    ok(Array.isArray(A.places) && A.places.length >= 4, `${tag} needs ≥ 4 places`);
    ok((A.places || []).filter((p) => p.legend).length === 1, `${tag} exactly one place holds the legend pool`);
    const lampById = Object.fromEntries(lamps.map((l) => [l.id, l]));
    for (const p of A.places || []) {
      const pt = `${tag} place ${p.id}`;
      ok(isStr(p.id) && !placeIds.has(p.id), `${pt} id missing/duplicate`); placeIds.add(p.id);
      ok(isStr(p.name) && isStr(p.lore) && isStr(p.look), `${pt} name/lore/look`);
      ok(['foot', 'raft', 'both'].includes(p.access), `${pt} access`);
      ok(isObj(p.water) && SHAPE_KINDS.includes(p.water.kind) && Array.isArray(p.water.depth) && p.water.depth[0] >= 0 && p.water.depth[1] <= 1 && p.water.depth[0] <= p.water.depth[1], `${pt} water {kind, depth:[a,b]}`);
      if (p.lamp) ok(!!lampById[p.lamp], `${pt} candle ${p.lamp} unknown`);
      for (const sid of Object.keys(p.attract || {})) ok(D.SPECIES_BY_ID[sid]?.zone === z.id, `${pt} attracts ${sid} (not a ${z.id} species)`);
      for (const k of Object.keys({ ...(p.mods || {}), ...(p.standMods || {}), ...(p.altStand?.mods || {}) })) ok(MOD_KEYS.includes(k), `${pt} mods key ${k}`);
      if (p.stand === null) ok(p.rule?.type === 'moving' || p.access === 'raft', `${pt} only roaming or raft places may have no stand`);
      if (!p.legend && p.rule?.type !== 'moving') ok(isObj(p.alt), `${pt} needs an alt (B) twist`);
      if (p.alt) for (const k of Object.keys(p.alt)) ok(k in (p.rule || {}) || k in p || ['startStep', 'swap', 'cost', 'cooldown'].includes(k), `${pt} alt key ${k} overrides nothing`);
      if (p.deadEnd) ok(p.deadEnd === true, `${pt} deadEnd`);
      // fishing holes have low south rims (lips)
      for (const h of Wk.holes || []) if (D.placeContains(p, (h.x ?? 0) + (h.kind === 'ring' ? (h.r0 + h.r1) / 2 : 0), h.z ?? 0)) {
        const rim = []; const [x0, z0, x1, z1] = D.walkShapeBounds(h, 1);
        for (let zz = z0; zz <= z1; zz += G.cell) for (let x = x0; x <= x1; x += G.cell) {
          const k = G.idx(x, zz); if (!WL.isWalk(G, k) || Wk.shapes[G.shape[k]]?.tag === 'bridge') continue; const i = k % n, j = (k / n) | 0;   // footbridges excepted
          const adjPool = G.pool[(j - 1) * n + i] === Wk.holes.indexOf(h);   // the near rim: land whose northern neighbour is this pool
          if (!adjPool) continue; const [cx, cz] = WL.cellXZ(G, k); const a = ((Math.atan2(cz - (h.z ?? 0), cx - (h.x ?? 0)) / Math.PI * 180) + 360) % 360;
          if (a >= 30 && a <= 150) rim.push(G.top[k]);
        }
        ok(rim.length === 0 || Math.max(...rim) <= 1.0 + EPS, `${pt} hole ${h.id}: south rim up to ${Math.max(...rim).toFixed(1)} m above the water (≤ 1 m; add a lip)`);
      }
      // castable, visible, up-screen, the camera line south of the stand
      if (p.rule?.type !== 'moving') for (const st of [p.stand, p.altStand].filter(Boolean)) {
        if (p.access === 'raft') continue;
        const sname = st === p.altStand ? `${pt} altStand` : `${pt} stand`;
        const { sy, cells } = WL.castable(G, z, p, st);
        if (!ok(Number.isFinite(sy), `${sname} not on ground`)) continue;
        const vis = cells.filter((c) => c.vis).length;
        ok(cells.length >= 3, `${sname}: only ${cells.length} castable water cells (reach ${WL.castReach(sy).toFixed(1)} m, minDist ${B.cast.minDist}, arc clearance)`);
        ok(vis / Math.max(1, cells.length) >= PB.minVisible, `${sname}: the fish camera sees ${vis}/${cells.length} castable cells (≥ ${PB.minVisible * 100}%)`);
        let tx, tz;
        if (p.legend) { tx = A.legendPool.x; tz = A.legendPool.z; }
        else { tx = cells.reduce((a, c) => a + c.x, 0) / Math.max(1, cells.length); tz = cells.reduce((a, c) => a + c.z, 0) / Math.max(1, cells.length); }
        const ang = Math.abs(Math.atan2(tx - st.x, -(tz - st.z)) * 180 / Math.PI), dd = Math.hypot(tx - st.x, tz - st.z);
        ok(ang <= PB.upScreenDeg || dd <= PB.nearTarget, `${sname}: its water lies ${ang.toFixed(0)}° from up-screen at ${dd.toFixed(1)} m (≤ ${PB.upScreenDeg}° or ≤ ${PB.nearTarget} m)`);
        if (p.legend) {
          const LP = A.legendPool, inL = (x, zz) => Math.hypot(x - LP.x, zz - LP.z) <= LP.r;
          let tot = 0; for (let k = 0; k < n * n; k++) { if (!WL.isAnyWater(G, k) || (G.flags[k] & F.BRIDGE)) continue; const [x, zz] = WL.cellXZ(G, k); if (inL(x, zz)) tot++; }
          const good = WL.castable(G, z, p, st, inL).cells.filter((c) => c.vis).length;
          ok(good / Math.max(1, tot) >= 0.6, `${sname}: only ${good}/${tot} legend-pool cells have a clear arc and are seen by the camera (≥ 60%)`);
        }
        // nothing tall in the camera line south of a stand (props are occludable, the fish framing does not rely on it)
        const O = WB.occlusion; let tall = null;
        for (let dz = 0.5; dz <= O.lowSouthDist && !tall; dz += 0.5) for (let dx = -O.lowSouthHalfW; dx <= O.lowSouthHalfW && !tall; dx += 0.5) {
          const h = WL.solidHeight(G, z, st.x + dx, st.z + dz); if (h > sy + O.lowSouthMax) tall = `${h.toFixed(1)} m at (${st.x + dx}, ${st.z + dz})`;
        }
        ok(!tall, `${sname}: something ${tall} rises > ${O.lowSouthMax} m above the stand within ${O.lowSouthDist} m south`);
      }
      if (p.access !== 'foot' && p.raftStand) ok(RC && RC[G.idx(p.raftStand.x, p.raftStand.z)] === 1, `${pt} raftStand not raft-reachable`);
      ok(speciesOk(z.id, p.id, p.water.depth[0], p.water.depth[1], 'calm').length >= 1, `${pt} yields no species in calm`);
      if (p.legend) ok(D.placeContains(p, A.legendPool.x, A.legendPool.z) && A.legendPool.r <= 5, `${pt} must contain the legend pool`);
      const r = p.rule;
      if (r) {
        ok(RULES.includes(r.type) && isStr(r.name), `${pt} rule type ${r?.type}`);
        for (const k of Object.keys(r.mods || {})) ok(MOD_KEYS.includes(k), `${pt} rule mods key ${k}`);
        if (r.deed) ok(deedById[r.deed]?.place === p.id, `${pt} rule deed ${r.deed} must exist and name this place`);
        if (r.type === 'deed') ok(MODE_RESET[r.mode] === deedById[r.deed]?.resets, `${pt} rule mode ${r.mode} needs its deed to reset '${MODE_RESET[r.mode]}' (got ${deedById[r.deed]?.resets})`);
        if (r.type === 'deed' && r.mode === 'window') ok(isNum(deedById[r.deed]?.cooldown), `${pt} window deed needs a cooldown`);
        if (r.type === 'rhythm') ok(r.period > r.warn + r.live && r.live > 0, `${pt} rhythm period > warn + live`);
        if (r.type === 'sequence') ok(deedById[r.deed]?.kind === 'sequence' && deedById[r.deed]?.resets === 'day' && r.window > 0 && r.buff > 0, `${pt} sequence needs a daily sequence deed`);
        if (r.type === 'targets') {
          ok(['bed', 'hole'].includes(r.lockPicks), `${pt} targets lock picks 'bed' or 'hole'`);
          if (r.lit) ok(isNum(r.lit.chargeTol) && !('line' in r.lit), `${pt} lit rows: the bonus is a charge tick (chargeTol), not a lateral line the lock would give away`);
          for (const t of r.targets || []) {
            ok(D.placeContains(p, t.x, t.z), `${pt} target ${t.id} outside the place`);
            ok(WL.isAnyWater(G, G.idx(t.x, t.z)), `${pt} target ${t.id} is not water`);
            if (isNum(t.depth)) ok(speciesOk(z.id, p.id, t.depth, t.depth, 'any').length >= 1, `${pt} target ${t.id} yields nothing at depth ${t.depth}`);
          }
        }
        if (r.type === 'moving') ok(isObj(r.arc) && r.speed > 0 && r.r > 0, `${pt} moving arc/speed/r`);
        if (r.type === 'drifters') ok(r.lane.every(([x, zz]) => Math.hypot(x, zz) < R - 2) && r.perDay >= 1, `${pt} drifters lane inside the lake`);
        if (r.type === 'plumb') ok(r.depth[0] >= p.water.depth[0] - 1e-9 && r.depth[1] <= p.water.depth[1] + 1e-9, `${pt} plumb depth inside place depth`);
        if (r.type === 'reflection') {
          const area = p.water.kind === 'disc' ? Math.PI * p.water.r ** 2 : 1;
          ok(['flipX', 'flipZ'].includes(r.mirror) && (r.fish * Math.PI * r.hitR ** 2) / area <= 0.15, `${pt} reflection: mirror flipX|flipZ, hit circles ≤ 15% of the pool`);
        }
        if (r.type === 'phaseWindow') ok(isNum(r.perDescent) && r.perDescent >= 1, `${pt} phaseWindow needs perDescent (the Last Ferry is not a daily rare)`);
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
    const kept = D.SPECIES.filter((x) => x.place && x.zone === z.id).length;
    ok(isInt(PB.awake[z.id]) && PB.awake[z.id] >= 1 && PB.awake[z.id] <= kept, `${tag} awake place-kept species per descent in [1, ${kept}]`);
    if (A.spotStyle) {
      const S = A.spotStyle;
      ok(isNum(S.live) && isNum(S.warn) && Array.isArray(S.every) && isNum(S.walkSecondsMax) && isNum(S.castInset), `${tag} spotStyle (live, warn, every, walkSecondsMax, castInset)`);
      ok(isObj(S.tideChart) && S.countsAsSpot === true, `${tag} spotStyle must define the Tide Chart and count as a feeding spot (spot_catch bounties)`);
    }
    if (A.wayside) ok(isStr(A.wayside.kind) && isObj(A.wayside.give) && isNum(A.wayside.touchR), `${tag} wayside`);
  }
  for (const sp of D.SPECIES) if (sp.place) ok(placeIds.has(sp.place), `species ${sp.id} names unknown place ${sp.place}`);
  ok(D.PLACES.length === placeIds.size && Object.keys(D.PLACE_BY_ID).length === placeIds.size, 'PLACES / PLACE_BY_ID incomplete');
  ok(D.CHALLENGE_BY_ID.complete_chronicle?.params?.n === D.SPECIES.length, 'complete_chronicle must ask for every species');
  ok(D.CHALLENGE_BY_ID.every_still_place?.params?.n === D.PLACES.length, 'every_still_place must ask for every place');
  const TYPES4 = ['footAshore', 'placeFound', 'lampLit', 'placeSpecies', 'placeMastered', 'shortcutOpen', 'slayOnTag', 'nightNoLamp', 'lampLitZone'];
  for (const c of D.WALK_CHALLENGES) ok(c.tier === 4 && TYPES4.includes(c.type), `tier IV challenge ${c.id} type ${c.type}`);
  for (const b of D.WALK_BOONS) ok(b.tags.includes('foot'), `v2 boon ${b.id} must carry the foot tag (offer weighting)`);
  for (const f of D.WALK_FORMATIONS) {
    ok(!!D.ENEMY_BY_ID[f.enemy] && !D.FORMATION_BY_ID[f.id], `walk formation ${f.id} enemy / id clash`);
    ok(Array.isArray(f.modes) && f.modes.every((m) => MODES.includes(m) && m !== 'raft'), `walk formation ${f.id} modes`);
  }
  for (const b of D.WALK_BOUNTIES) ok(!D.BOUNTY_BY_ID[b.id] && isStr(b.text) && isNum(b.base) && Array.isArray(b.modes) && D.WALK_BOUNTY_TYPES.includes(b.type), `walk bounty ${b.id} (type ${b.type})`);
  ok(isNum(B.memories.placeNew) && D.memoriesFor({ placesNew: 3 }).total === 3 * B.memories.placeNew, 'memoriesFor counts placesNew');
  console.log(`  v2 walk: ${placeIds.size} places, ${walkCells} walkable cells, ${gridChecks} eroded grids (variants × shortcuts), ${D.SPECIES.filter((x) => x.place).length} place-kept species`);
}

// ---------------------------------------------------------------------------- report
for (const w of warnings) console.log('  warn:', w);
if (errors.length) {
  for (const e of errors.slice(0, 80)) console.log('  FAIL:', e);
  if (errors.length > 80) console.log(`  … and ${errors.length - 80} more`);
  console.log(`validate-data${WALK ? ' --walk' : ''}: ${errors.length} failure(s) in ${checks} checks`);
  process.exit(1);
}
console.log(`validate-data${WALK ? ' --walk (WALK_ENABLED on)' : ' (v1 tables, WALK_ENABLED off)'}: OK (${checks} checks; ${D.SPECIES.length} species, ${D.BOONS.length} boons, ${D.CHARACTERS.length} characters, ${D.CHALLENGES.length} challenges, ${D.RELICS.length} relics, ${D.UPGRADES.length} upgrades, ${D.ENEMIES.length} enemies)`);
if (!WALK && !process.argv.includes('--v1')) {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [new URL(import.meta.url).pathname, '--walk'], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}
