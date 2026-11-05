#!/usr/bin/env node
// tools/validate-data.mjs — schema & consistency validation for src/data.js.
// Checks CONTRACT.md §8 (hybrid sail · fish · survive the swarm) plus the cross-references
// DESIGN.md relies on. Usage:  node tools/validate-data.mjs   (exit code 1 on any failure)
//
// Three passes: (1) the v1 tables with WALK_ENABLED and V3_ENABLED off — every v1 table must stay exactly as v1
// (QA §24.13 #1); (2) a child process with `--walk` re-checks every table with the walking build on and runs the v2
// map checks (DESIGN §24, CONTRACT §12); (3) a child process with `--v3` re-checks everything with the walking AND
// the v3 builds on (BRIEF-v3, DESIGN §25, CONTRACT §13) and runs the v3 rules. `--v1` skips passes 2–3; `--walk` runs
// pass 2 only; `--v3` runs pass 3 only.
const V3 = process.argv.includes('--v3');
const WALK = process.argv.includes('--walk') || V3;   // v3 is designed on top of §24: pass 3 runs both builds
if (WALK) globalThis.GW_WALK = true;
if (V3) globalThis.GW_V3 = true;
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

// ---------------------------------------------------------------------------- the flag-off fingerprint (passes 1 and 2)
// Every export of the c0e0ab9 data.js must hash identically with V3 off (v1 in pass 1, the walking build in pass 2): v3 may only
// add exports and act inside `if (V3_ENABLED)`. `--refresh-fingerprint` rewrites tools/tests/v1-exports.json from this build.
if (!V3) {
  const { fingerprint } = await import('./fingerprint.mjs');
  const fs = await import('node:fs');
  const FP_PATH = new URL('./tests/v1-exports.json', import.meta.url);
  const REF = JSON.parse(fs.readFileSync(FP_PATH, 'utf8'));
  const key = WALK ? 'walk' : 'v1', now = fingerprint(D, REF.names);
  if (process.argv.includes('--refresh-fingerprint')) {
    REF[key] = now; REF.refreshed = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(FP_PATH, JSON.stringify(REF, null, 1) + '\n'); console.log(`  fingerprint (${key}) refreshed`);
  } else {
    for (const n of REF.names) ok(now[n] === REF[key][n], `flag-off fingerprint: export ${n} changed from ${REF.from} in the ${key} build (v3 must stay behind V3_ENABLED; refresh only on purpose with --refresh-fingerprint)`);
  }
}
ok(D.V3_ENABLED === V3, `V3_ENABLED must be ${V3} in this pass`);

// ---------------------------------------------------------------------------- STATS (contract §8 list)
const STAT_KEYS = ['maxHp', 'maxOil', 'maxSatiety', 'oilDrain', 'satietyDrain', 'lightRadius', 'auraDps', 'flareCost',
  'flareRadius', 'flareCooldown', 'zapCost', 'zapDamage', 'damageMult', 'cooldownMult', 'critChance', 'moveSpeed',
  'pickupRadius', 'xpMult', 'luck', 'rerolls', 'dawnHeal', 'castMax', 'lineStrength', 'reelSpeed', 'sweetZone',
  'biteSpeed', 'hookWindow', 'rarityBonus', 'creelSize', 'sellMult', 'foodMult', 'oilYieldMult', 'armor', 'slackTime',
  'nibbleTells', ...(WALK ? ['stride'] : []), ...(V3 ? ['shock', 'absorb', 'pipBonus', 'dragAt'] : [])];   // v2 (walking): stride, + m/s on foot (DESIGN §24.3); v3: the fight stats tiers replace (CONTRACT §13.7)
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
  // optional Starlit keys (DESIGN §19.2): lamp / candle / nebula colours, stars brightness
  for (const k of ['lamp', 'candle', 'nebula']) if (z.palette && k in z.palette) ok(isNum(z.palette[k]) && z.palette[k] >= 0 && z.palette[k] <= 0xffffff, `${z.id}.palette.${k} must be a 0xRRGGBB number`);
  if (z.palette && 'stars' in z.palette) ok(isNum(z.palette.stars) && z.palette.stars >= 0 && z.palette.stars <= 3, `${z.id}.palette.stars must be 0–3`);
  // palette rule (DESIGN §19.1): no lake colour in the green/teal band (hue 65–195°) unless it is a near-grey
  for (const [k, v] of Object.entries(z.palette || {})) {
    if (k === 'fogDensity' || k === 'stars' || !isNum(v)) continue;
    const r = ((v >> 16) & 255) / 255, g = ((v >> 8) & 255) / 255, b = (v & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, sat = mx > 0 ? d / mx : 0;
    if (sat < 0.12 || d === 0) continue;
    let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    ok(!(h >= 65 && h < 195), `${z.id}.palette.${k} (#${v.toString(16).padStart(6, '0')}) sits in the green/teal band (hue ${h.toFixed(0)}°)`);
  }
  if (i > 0) ok(z.unlock.requires.some((r) => r.type === 'legendary' && r.id === D.ZONES[i - 1].legendary), `${z.id} gate must require ${D.ZONES[i - 1].legendary}`);
});

// ---------------------------------------------------------------------------- SPECIES
const RARITIES = ['common', 'uncommon', 'rare', 'legendary'];
const TIMES = ['any', 'calm', 'gloom'];
const BEHAVIORS = ['steady', 'darter', 'sinker', 'thrasher', 'leaper'];
const DIFF_KEYS = ['power', 'surgeEvery', 'surgeTime', 'stamina', 'sweet', 'erratic', 'window'];
const baitIds = new Set(D.BAITS.map((b) => b.id));
ok(JSON.stringify(D.FISH_SHAPES) === JSON.stringify(['minnow', 'perch', 'carp', 'pike', 'eel', 'angler', 'ray', 'puffer', 'jelly', 'crayfish', 'koi', 'ghost', 'leviathan', ...(V3 ? ['sturgeon'] : [])]), `FISH_SHAPES must match the contract list${V3 ? ' (+ sturgeon in v3)' : ''}`);
ok(JSON.stringify(D.CREATURE_KINDS) === JSON.stringify(['wisp', 'mite', 'moth', 'eel', 'hand', 'warden']), 'CREATURE_KINDS must match the contract list');
for (const s of D.SPECIES) {
  const id = s.id || '?';
  for (const f of ['id', 'name', 'zone', 'rarity', 'weight', 'value', 'food', 'oil', 'time', 'depth', 'bait', 'difficulty', 'behavior', 'model', 'lore'])
    ok(f in s, `species ${id} missing field ${f}`);
  ok(!('dist' in s), `species ${id} still uses 'dist' (hybrid uses 'depth')`);
  ok(ZONE_IDS.includes(s.zone) || (V3 && (s.zone === 'cove' || (s.zone === null && s.wanderer && s.zones.every((z) => ZONE_IDS.includes(z))))), `species ${id} bad zone ${s.zone}`);
  ok(RARITIES.includes(s.rarity), `species ${id} bad rarity ${s.rarity}`);
  ok(Array.isArray(s.weight) && s.weight.length === 2 && isNum(s.weight[0]) && s.weight[0] > 0 && s.weight[0] < s.weight[1], `species ${id} weight must be [min<max]`);
  ok(Array.isArray(s.depth) && s.depth.length === 2 && s.depth[0] >= 0 && s.depth[1] <= 1 && s.depth[0] < s.depth[1], `species ${id} depth must be [min<max] within 0..1`);
  for (const k of ['value', 'food', 'oil']) ok(isNum(s[k]) && (s[k] > 0 || (V3 && k === 'value' && s.noSale && s[k] === 0)), `species ${id}.${k} must be > 0`);
  ok(TIMES.includes(s.time) || (V3 && s.time === 'dawn'), `species ${id} bad time ${s.time}`);
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
const FINAL = V3 ? 'lantern_swallower' : 'pale_leviathan';   // renamed in v3 (RENAMES.species)
ok(D.SPECIES_BY_ID[FINAL]?.final === true, `${FINAL} must have final:true`);
ok(D.SPECIES_BY_ID[FINAL]?.zone === 'paleabyss', `${FINAL} must live in paleabyss`);
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
  if (r.special) ok(/^(startShells:\d+|startKit|shimmer:[\d.]+|memMult:[\d.]+|secondWick|waystone:(sporewood|glasswater|paleabyss)|lampRadius:\d+|shortcutStart:\d+|measuringCord|spyglass|rumourShell)$/.test(r.special) && (WALK || !/^(lampRadius|shortcutStart)/.test(r.special))
    && (V3 || !/^(measuringCord|spyglass|rumourShell)$/.test(r.special)), `relic ${r.id} special '${r.special}' unknown`);
  ok(Object.keys(r.effects || {}).length > 0 || !!r.special, `relic ${r.id} does nothing`);
}
for (const s of D.SUPPLIES) for (const k of Object.keys(s.give || {})) ok(['oil', 'satiety', 'hp', 'flareCharges', 'spots', ...(WALK ? ['stake'] : []), ...(V3 ? ['chum'] : [])].includes(k), `supply ${s.id} give key ${k}`);

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
if (V3) ok(D.CHALLENGES.length === 48, `CHALLENGES must hold 48 goals in v3 (30 + tier IV 10 + tier V 8), got ${D.CHALLENGES.length}`);
else ok(D.CHALLENGES.length >= 24 && D.CHALLENGES.length <= (WALK ? 40 : 30), `CHALLENGES must hold 24–${WALK ? 40 : 30} goals${WALK ? ' (v2: + tier IV Paths Underfoot)' : ''}`);
const COSMETIC_BY_ID = V3 ? Object.fromEntries(D.COSMETICS_V3.map((c) => [c.id, c])) : {};
const unlockTargetExists = (key) => {
  const [kind, id] = key.split(':');
  return ({ character: D.CHARACTER_BY_ID, boon: D.BOON_BY_ID, relic: D.RELIC_BY_ID, bait: D.BAIT_BY_ID, cosmetic: COSMETIC_BY_ID })[kind]?.[id];
};
for (const ch of D.CHALLENGES) {
  ok(isStr(ch.id) && isStr(ch.name) && isStr(ch.desc) && isStr(ch.type) && isObj(ch.params), `challenge ${ch.id} basics`);
  ok((V3 ? ch.scope === 'expedition' : ch.scope === 'run') || ch.scope === 'total', `challenge ${ch.id} scope ${ch.scope}`);
  ok(isObj(ch.reward) && isNum(ch.reward.memories), `challenge ${ch.id} reward.memories`);
  if (ch.reward?.unlock) {
    const target = unlockTargetExists(ch.reward.unlock);
    if (ok(!!target, `challenge ${ch.id} unlocks unknown ${ch.reward.unlock}`)) ok(target.unlock === ch.id, `${ch.reward.unlock}.unlock should name ${ch.id} (got ${target.unlock})`);
  }
}
// every gated item is unlocked by exactly the challenge it names
for (const [kind, list] of [['boon', D.BOONS], ['relic', D.RELICS], ['character', D.CHARACTERS], ['bait', D.BAITS], ...(V3 ? [['cosmetic', D.COSMETICS_V3]] : [])]) {
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

// ---------------------------------------------------------------------------- palette rule (DESIGN §19.1)
// Green and teal (hue 65–195°) only as rare trace accents: no data colour (fish, characters, lake palettes,
// rarity colours) may sit in that band with any real saturation. The Mossback Perch's breath of sage (≤ 0.13) passes.
const hsl = (n) => {
  const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d === 0) return { h: -1, s: 0, l };
  let h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  return { h, s: d / (1 - Math.abs(2 * l - 1)), l };
};
const PAL_MAX_SAT = 0.15;
const palCheck = (path, n) => {
  if (!isNum(n)) return;
  const { h, s } = hsl(n);
  ok(!(h >= 65 && h <= 195 && s >= PAL_MAX_SAT), `palette: ${path} #${n.toString(16).padStart(6, '0')} is green/teal (hue ${h.toFixed(0)}°, sat ${s.toFixed(2)}); DESIGN §19.1`);
};
for (const s of D.SPECIES) for (const k of ['body', 'belly', 'fin', 'glow']) palCheck(`species ${s.id}.model.${k}`, s.model?.[k]);
for (const c of D.CHARACTERS) for (const [k, v] of Object.entries(c.look || {})) if (k !== 'scale') palCheck(`character ${c.id}.look.${k}`, v);
for (const z of D.ZONES) for (const [k, v] of Object.entries(z.palette || {})) if (k !== 'fogDensity') palCheck(`zone ${z.id}.palette.${k}`, v);
for (const [k, v] of Object.entries(D.RARITY_COLORS || {})) palCheck(`RARITY_COLORS.${k}`, v);

// ---------------------------------------------------------------------------- originality scan (display strings)
const BANNED = /\b(hollow ?knight|hallownest|geo|soul|charms?|vessels?|grubs?|husks?|lumafly|dreamers?|mourner|greenpath|archives|masks?|shades?)\b/i;
const seen = new Set();
const scan = (v, path) => {
  if (typeof v === 'string') { if (BANNED.test(v)) errors.push(`originality: banned word in ${path}: "${v.slice(0, 80)}"`); return; }
  if (!v || typeof v !== 'object' || seen.has(v)) return;
  seen.add(v);
  for (const [k, c] of Object.entries(v)) if (!/^(id|icon|behavior|weapon|model|shape|type|trigger|mechanic)$/.test(k)) scan(c, `${path}.${k}`);
};
const V3_TEXT_EXPORTS = ['SPECIES_V3', 'FOUND_RELICS', 'AGE_MARKS', 'VISTAS', 'REMNANTS', 'MOSSMERE_V3', 'PLACES_V3', 'WALK_SYNC_V3', 'CONDITIONS', 'RUMOURS', 'TODAYS_RUMOUR', 'TACKLE', 'OUTFIT', 'LURES', 'EXPEDITION', 'LONG_DESCENT',
  'RELICS_V3', 'BOONS_V3', 'CHARACTERS_V3', 'CHALLENGES_V3', 'COSMETICS_V3', 'LEDGER', 'COVE', 'TEXT_V3', 'TIPS_V3', 'MERCHANT_LINES_V3', 'ELDER_NAMES'];
for (const k of ['ZONES', 'SPECIES', 'BAITS', 'UPGRADES', 'SUPPLIES', 'RELICS', 'ENEMIES', 'BOONS', 'CHARACTERS', 'CHALLENGES', 'BOUNTIES', 'TIPS', 'MERCHANT_LINES', 'EPITAPHS', 'TEXT', 'FORMATIONS', ...(WALK ? ['ARENA_V2', 'WALK_FORMATIONS', 'WALK_BOUNTIES'] : []), ...(V3 ? V3_TEXT_EXPORTS : [])]) scan(D[k], k);
checks++;

// ---------------------------------------------------------------------------- v2 (walking, DESIGN §24) — pass 2 only
if (WALK) {
  const WL = await import('./walk-lib.mjs');
  if (!ok(WL.D === D, 'walk-lib must share the walking data instance')) process.exit(1);
  const B = D.BALANCE, WB = B.walk, LB = B.lamps, PB = B.places, FB = B.combat.foot, F = D.WALK_FLAGS, EPS = WB.eps;
  const MODES = ['raft', 'mixed', 'foot'];
  const SHAPE_KINDS = ['disc', 'ring', 'rect', 'poly', 'path'];
  const SHAPE_TAGS = ['ground', 'ramp', 'jetty', 'bridge'];
  const RULES = ['rhythm', 'sequence', 'deed', 'targets', 'moving', 'drifters', 'cue', 'plumb', 'reflection', 'phaseWindow', ...(V3 ? ['sight', 'drift'] : [])];
  const MOD_KEYS = ['waitMult', 'rarity', 'quality', 'weightBias', 'surgeEveryMult', 'erraticMult', 'hookWindowMult', 'hookWindowAdd',
    'nibbleTells', 'bandAmpMult', 'bandNoiseMult', 'darterJumpMult', 'legendEnrageAdd', 'sweetAdd', 'surgeWarnAdd'];
  const COND_RULE = V3 ? D.KEPT_CONDS : { buff: 'sequence', deed: 'deed', reflection: 'reflection', plumbBottom: 'plumb', window: 'phaseWindow' };
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
  if (V3) Object.assign(EV, { 'hub:enter': null, 'fish:measured': null, 'farwater:dawn': null, 'resident:show': null, 'expedition:start': null, 'expedition:end': null });
  if (V3) EV['interact:change'] = [...EV['interact:change'], 'jetty', 'station', 'homeward'];
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
  for (const sp of D.SPECIES) if (sp.place) ok(placeIds.has(sp.place) || (V3 && sp.zone === 'mossmere' && D.MOSSMERE_V3.places.some((p) => p.id === sp.place)), `species ${sp.id} names unknown place ${sp.place}`);
  const mossPlacesIn = V3 ? (D.ZONES[0].arena.places || []).length : 0;   // v3: PLACES also holds the Mossmere's places in the build
  ok(D.PLACES.length === placeIds.size + mossPlacesIn && Object.keys(D.PLACE_BY_ID).length === placeIds.size + mossPlacesIn, 'PLACES / PLACE_BY_ID incomplete');
  ok(D.CHALLENGE_BY_ID.complete_chronicle?.params?.n === D.SPECIES.length, 'complete_chronicle must ask for every species');
  ok(D.CHALLENGE_BY_ID.every_still_place?.params?.n === placeIds.size, 'every_still_place must ask for every §24 place');
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

// ---------------------------------------------------------------------------- v3 (BRIEF-v3, DESIGN §25, CONTRACT §13) — pass 3 only
if (V3) {
  const WL = await import('./walk-lib.mjs');
  const WLY = await import('../src/world-layout.js');
  const T0 = Date.now();
  const near = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const within = (v, target, tol) => Math.abs(v - target) <= tol + 1e-9;
  const B3 = D.BALANCE_V3, SZ = B3.size, FV = B3.favour;
  const LAKES = ZONE_IDS;
  // a v1 reference instance (both flags off) for "unchanged" and "disjoint" rules
  const flags = [globalThis.GW_WALK, globalThis.GW_V3];
  globalThis.GW_WALK = false; globalThis.GW_V3 = false;
  const V1 = await import('../src/data.js?v3ref');
  globalThis.GW_WALK = true; globalThis.GW_V3 = false;
  const W2 = await import('../src/data.js?v3walkref');
  globalThis.GW_WALK = false; globalThis.GW_V3 = true;
  const NW = await import('../src/data.js?v3nowalk');   // v3 without §24
  [globalThis.GW_WALK, globalThis.GW_V3] = flags;
  ok(V1.V3_ENABLED === false && NW.V3_ENABLED === true && NW.WALK_ENABLED === false, 'reference instances evaluated with the intended flags');

  // ---- exports, the flag and the merge
  const V3_EXPORTS = ['V3_ENABLED', 'BALANCE_V3', 'SIZE_CLASSES', 'SPECIES_V3', 'SPECIES_V3_BY_ID', 'FISH_FAMILIES', 'FISH_STYLES', 'FISH_SHAPES_V3', 'WEATHER', 'KEPT_CONDS',
    'FISH_PALETTES', 'ELDER_NAMES', 'MOSSMERE_V3', 'PLACE_SYNC_V3', 'WALK_SYNC_V3', 'PLACES_V3', 'PLACE_V3_BY_ID', 'CONDITIONS', 'RUMOURS', 'TODAYS_RUMOUR', 'TACKLE', 'OUTFIT',
    'LURES', 'COMBAT_KIT', 'EXPEDITION', 'LONG_DESCENT', 'ECONOMY_V3', 'MEMORIES_V3', 'RELICS_V3', 'ANGLER_POOL', 'BOONS_V3', 'CHARACTERS_V3', 'GLOOM_TAB', 'CHALLENGES_V3',
    'CHALLENGE_TABS_V3', 'COSMETICS_V3', 'LEDGER', 'COVE', 'RENAMES', 'TEXT_V3', 'TIPS_V3', 'MERCHANT_LINES_V3', 'FOUND_RELICS', 'AGE_MARKS', 'VISTAS', 'REMNANTS',
    'sizeL50', 'sizeLength', 'sizeWeight', 'sizeClassOf', 'isAncient', 'maxZFor', 'reachOf', 'favourNotches', 'classOdds', 'fishValueV3', 'fishYieldV3', 'farWaterFor',
    'swarmTonight', 'swarmWindow', 'tallyFor', 'frameFor'];
  for (const k of V3_EXPORTS) ok(k in D && k in V1, `v3 export ${k} must exist in every build (inert when V3 is off)`);
  const MERGED = ['bite'];   // v3 keys merged into an existing v1 block (CONTRACT §13.8); every other BALANCE_V3 key is a new block
  for (const k of Object.keys(B3)) {
    if (MERGED.includes(k)) {
      ok(isObj(V1.BALANCE[k]) && Object.keys(B3[k]).every((q) => !(q in V1.BALANCE[k])), `BALANCE_V3.${k}: its keys must be new inside v1's BALANCE.${k}`);
      ok(Object.entries(V1.BALANCE[k]).every(([q, v]) => JSON.stringify(D.BALANCE[k][q]) === JSON.stringify(v)) && Object.keys(B3[k]).every((q) => D.BALANCE[k][q] === B3[k][q]), `BALANCE.${k}: v1 keys kept, v3 keys added`);
    } else {
      ok(!(k in V1.BALANCE) && !(k in W2.BALANCE), `BALANCE_V3.${k} would replace a v1/v2 BALANCE key`);
      ok(D.BALANCE[k] === B3[k], `BALANCE.${k} must be BALANCE_V3.${k} in the v3 build`);
    }
  }
  ok(!('size' in V1.BALANCE) && !('farWater' in W2.BALANCE), 'v3 BALANCE keys stay out of the v1 and v2 builds');
  ok(V1.SPECIES.length === 32 && W2.SPECIES.length === 40, 'the v1 / v2 rosters are untouched (32 / 40)');
  // with V3 off nothing of v3 leaks into a v1 / v2 table (the v3 exports exist, inert)
  for (const R of [V1, W2]) {
    const tag = R === V1 ? 'v1' : 'v2';
    ok(R.SPECIES.every((s) => !('size' in s) && !('style' in s) && !('family' in s)) && R.SPECIES_BY_ID.pale_leviathan && !R.SPECIES_BY_ID.lantern_swallower, `${tag}: species carry no v3 fields; the Pale Leviathan keeps its id`);
    ok(!R.ZONES[0].arena.places && !R.ZONES.some((z) => 'homeward' in z) && R.ZONES[0].arena.pillars.every((o) => o.kind !== 'hands') && !('accent' in R.MOSSMERE_V3 && R.ZONES[0].palette.accent === R.MOSSMERE_V3.palette.accent), `${tag}: the Mossmere arena, palette and zones are untouched`);
    ok(R.BAIT_BY_ID.pale_marrow && R.SUPPLY_BY_ID.tide_chart && R.RELIC_BY_ID.old_debt && !R.RELIC_BY_ID.measuring_cord && R.CHALLENGES.length === (R === V1 ? 30 : 40) && !R.BOON_BY_ID.long_cast, `${tag}: baits, supplies, relics, challenges and boons are untouched`);
    ok(!('bite' in R.BALANCE && 'pips' in R.BALANCE.bite) && !R.CHARACTERS.some((c) => 'fishing' in c) && !('v3' in R.TEXT) && R.FISH_SHAPES.length === 13, `${tag}: BALANCE.bite, characters, TEXT and FISH_SHAPES are untouched`);
    ok(R.PLACES.every((p) => !('holdsGiants' in p) && !('maxClass' in p)) && R.ARENA_V2.paleabyss.lamps.every((l) => !l.watch), `${tag}: §24 places and lamps carry no v3 fields`);
  }

  // ---- the roster (brief §6.5)
  const S = D.SPECIES_V3, byId = D.SPECIES_V3_BY_ID;
  ok(S.length === 53 && new Set(S.map((s) => s.id)).size === 53, `SPECIES_V3 must hold 53 unique species (got ${S.length})`);
  ok(D.SPECIES.length === 53 && D.SPECIES.every((s, i) => s.id === S[i].id), 'the v3 build replaces SPECIES with the 53-species roster');
  const lakeOf = (s) => s.zone;
  const COUNT = { mossmere: [4, 2, 5, 1, 3, 2], sporewood: [3, 3, 5, 1, 3, 2], glasswater: [3, 2, 7, 1, 4, 2], paleabyss: [3, 2, 7, 1, 5, 3] };   // C U R L kept nightOnly
  for (const z of LAKES) {
    const zs = S.filter((s) => lakeOf(s) === z), n = (r) => zs.filter((s) => s.rarity === r).length;
    const kept = zs.filter((s) => s.place).length, night = zs.filter((s) => s.rarity !== 'legendary' && s.time === 'gloom').length;
    const got = [n('common'), n('uncommon'), n('rare'), n('legendary'), kept, night];
    ok(JSON.stringify(got) === JSON.stringify(COUNT[z]), `${z}: commons/uncommons/rares/legend/kept/night-only ${got} (brief §6.5: ${COUNT[z]})`);
    ok(night >= 2, `${z}: ≥ 2 night-only species`);
    ok(zs.filter((s) => s.rarity !== 'legendary' && s.size.sigma >= SZ.giantTailSigma).length >= 2, `${z}: ≥ 2 giant-tail species (σ ≥ ${SZ.giantTailSigma})`);
    ok(zs.filter((s) => s.rarity !== 'legendary').length === (z === 'mossmere' || z === 'sporewood' ? 11 : 12), `${z}: 11 / 11 / 12 / 12 non-legendary species (one Long Wall frame each)`);
  }
  const GIANT = ['weeping_carp', 'bridgechain_sturgeon', 'nightbloom_carp', 'mildew_angler', 'mirror_pike', 'blind_scrivener', 'gilt_eyed_eel', 'candlewake_sturgeon'];
  ok(JSON.stringify(S.filter((s) => s.rarity !== 'legendary' && s.zone && LAKES.includes(s.zone) && s.size.sigma >= SZ.giantTailSigma).map((s) => s.id).sort()) === JSON.stringify(GIANT.slice().sort()), 'the giant-tail species are exactly the brief\'s eight');
  ok(S.filter((s) => s.wanderer).map((s) => s.id).join() === 'pilgrim_salmon,hearthfish' && S.filter((s) => s.wanderer).every((s) => s.rarity === 'rare'), 'two rare Wanderers: the Pilgrim Salmon and the Hearthfish');
  ok(S.filter((s) => s.cove).map((s) => s.id).join() === 'quayling', 'the Landing has one species, the Quayling');
  ok(S.filter((s) => s.place).length === 15 && S.filter((s) => s.rarity !== 'legendary' && s.time === 'gloom').length === 10, 'totals: 15 place-kept, 10 night-only');
  ok(S.filter((s) => s.rarity === 'common').length === 14 && S.filter((s) => s.rarity === 'uncommon').length === 9 && S.filter((s) => s.rarity === 'rare').length === 26 && S.filter((s) => s.rarity === 'legendary').length === 4, 'totals: 14 C · 9 U · 26 R · 4 L');
  // phasing: 32 → 36 (P2) → 44 (+ §24's 8) → 47 (P3) → 53 (P4)
  const ph = (p, walk = false) => S.filter((s) => s.phase <= p && (walk || s.src !== 'walk')).length;
  const p44 = S.filter((s) => s.phase <= 2 || s.src === 'walk').length;
  ok(ph(1) === 32 && ph(2) === 36 && p44 === 44 && ph(3, true) === 47 && ph(4, true) === 53, `phasing 32/36/44/47/53 (got ${ph(1)}/${ph(2)}/${p44}/${ph(3, true)}/${ph(4, true)})`);
  ok(S.filter((s) => s.src === 'walk').length === 8 && S.filter((s) => s.src === 'walk').every((s) => s.phase === 3), '§24\'s 8 place-kept fish arrive with the §24 lake builds');
  // existing species keep their reel core (the sims' numbers depend on it)
  const v1ids = new Set([...V1.SPECIES, ...V1.WALK_SPECIES].map((s) => s.id));
  for (const o of [...V1.SPECIES, ...V1.WALK_SPECIES]) {
    const id = D.RENAMES.species[o.id] || o.id, s = byId[id];
    if (!ok(!!s, `v1/§24 species ${o.id} missing from SPECIES_V3 (and not renamed)`)) continue;
    for (const k of ['zone', 'rarity', 'tier', 'value', 'behavior', 'time', 'depth', 'difficulty']) ok(JSON.stringify(s[k]) === JSON.stringify(o[k]), `species ${id}.${k} changed from v1 (the reel core and the brief's tables assume today's ${k})`);
    if (o.boss) ok(JSON.stringify(s.boss) === JSON.stringify(o.boss), `legend ${id} boss script changed`);
  }
  ok(S.filter((s) => !v1ids.has(s.id) && !s.renamedFrom).length === 13, '13 new species (4 Mossmere, 3 P3, 6 P4)');
  const PATTERNS = ['scales', 'stripes', 'bands', 'spots', 'none', 'marks'];
  for (const s of S) {
    const id = s.id, zone = s.zones?.[0] ?? s.zone;
    ok(D.FISH_STYLES.includes(s.style), `species ${id} style ${s.style}`);
    ok(['steady', 'darter', 'sinker', 'thrasher', 'leaper'].includes(s.behavior), `species ${id} behavior must stay a reel-core behaviour`);
    if (s.style === 'runner' || s.style === 'sulker') ok(s.behavior !== s.style, `species ${id}: runner/sulker fight as their base behaviour until the verb lands`);
    ok(D.FISH_FAMILIES.includes(s.family), `species ${id} family ${s.family} (insect | predator | bottom | glow)`);
    ok(D.FISH_SHAPES_V3.includes(s.model.shape) && PATTERNS.includes(s.model.pattern), `species ${id} model shape/pattern`);
    ok(['any', 'calm', 'gloom', 'dawn'].includes(s.time) && s.night === (s.time === 'gloom'), `species ${id} time / night flag`);
    ok([1, 2, 3, 4].includes(s.phase) && ['v1', 'walk', 'v3'].includes(s.src), `species ${id} phase / src`);
    if (s.maxClass) ok(s.maxClass in SZ.classMaxZ, `species ${id} maxClass ${s.maxClass}`);
    if (s.rarity === 'legendary') {
      ok(s.size.sigma === SZ.legend.sigma && isNum(s.size.W50) && within(s.size.k * s.size.L50 ** 3 / 1000, s.size.W50, s.size.W50 * 0.001), `legend ${id} authored size (σ 0.02, W50 = k·L50³)`);
      ok(!s.place && D.PLACE_V3_BY_ID[s.legendPlace]?.legend === true && D.PLACE_V3_BY_ID[s.legendPlace]?.zone === s.zone, `legend ${id} legendPlace must be its lake's legend place`);
      continue;
    }
    ok(D.WEATHER.includes(s.prefers), `species ${id} prefers (field-note condition) ${s.prefers}`);
    ok(s.oldTrick === SZ.reel.oldTrick.byStyle[s.style], `species ${id} old trick must follow its style`);
    ok(s.size.sigma >= SZ.sigma[0] - 1e-9 && s.size.sigma <= SZ.sigma[1] + 1e-9, `species ${id} σ ${s.size.sigma} outside ${SZ.sigma}`);
    ok(s.size.k === SZ.k[s.size.body], `species ${id} size.k must be the ${s.size.body} body constant`);
    const L50 = D.sizeL50(s, zone), ceil = D.sizeLength(s, SZ.reachZ, zone);
    ok(ceil / L50 <= SZ.maxReachRatio + 1e-9 && ceil / L50 >= 2.0 - 1e-9, `species ${id} ceiling ${(ceil / L50).toFixed(2)}× median (brief: 2.0–2.8×)`);
    const ek = D.sizeLength(s, SZ.elderKeeperRatio.elderZ, zone) / D.sizeLength(s, SZ.elderKeeperRatio.keeperZ, zone);
    ok(ek >= SZ.elderKeeperRatio.range[0] - 1e-9 && ek <= SZ.elderKeeperRatio.range[1] + 1e-9, `species ${id} Elder/Keeper length ${ek.toFixed(2)} outside ${SZ.elderKeeperRatio.range}`);
    ok(Array.isArray(s.weight) && s.weight[0] > 0 && s.weight[0] < s.weight[1], `species ${id} derived weight range`);
    for (const pid of Object.keys(s.spots || {})) ok(D.PLACE_V3_BY_ID[pid]?.zone === s.zone, `species ${id} spot ${pid} is not a place of its lake`);
    if (s.place) {
      const p = D.PLACE_V3_BY_ID[s.place];
      if (!ok(!!p && p.zone === s.zone, `kept species ${id} place ${s.place} unknown / not in its lake`)) continue;
      ok(s.rarity === 'rare' && !s.bait, `kept species ${id} must be a bait-free rare`);
      ok(s.depth[0] <= p.water.depth[1] && p.water.depth[0] <= s.depth[1], `kept species ${id} depth never overlaps ${p.id}`);
      if (s.cond) ok(D.KEPT_CONDS[s.cond] === p.rule?.type, `kept species ${id} cond '${s.cond}' needs a ${D.KEPT_CONDS[s.cond]} rule at ${p.id} (has ${p.rule?.type})`);
      if (s.weather) ok(D.WEATHER.includes(s.weather), `kept species ${id} weather ${s.weather}`);
      ok(!!(s.cond || s.weather || p.rule || s.time !== 'any'), `kept species ${id} must be tied to one condition (cond, weather, the place rule or its hour)`);
      if (s.src === 'v3' && s.zone !== 'mossmere') ok(s.proposal === true && (D.PLACE_SYNC_V3[s.place]?.kept || []).includes(id), `kept species ${id} on a §24 place must be a routed proposal (▲) listed in PLACE_SYNC_V3.${s.place}.kept`);
    }
  }
  ok(S.filter((s) => s.weather).map((s) => s.id).join() === 'bridgechain_sturgeon', 'condition-gated (weather) species: only the Bridgechain Sturgeon (Mirror Hush)');
  const ps = byId.pilgrim_salmon, L = ps.size.L50;
  ok(L.sporewood < L.glasswater && L.glasswater < L.paleabyss && !L.mossmere && ps.zones.join() === 'sporewood,glasswater,paleabyss', 'the Pilgrim Salmon grows each lake down, Sporewood and deeper');
  ok(within(D.sizeLength(ps, 3.6, 'paleabyss'), 206, 1), 'the Pilgrim Salmon reaches ≈ 206 cm in the Pallid Deep');
  ok(byId.hearthfish.zones.length === 4 && byId.hearthfish.minOilFrac === 0.75, 'the Hearthfish wanders every lake, oil ≥ 75%');
  const q = byId.quayling;
  ok(q.maxClass === 'keeper' && q.noSale && q.value === 0 && within(D.reachOf(q), 15.5, 0.1), 'the Quayling: Keeper cap (15.5 cm), never sold');
  ok(byId.lampwarden_angler.maxClass === 'trophy' && within(D.reachOf(byId.lampwarden_angler), 122, 0.6), 'the Lampwarden caps at Trophy (≈ 122 cm)');
  ok(byId.cupbearer.mm === true && D.sizeL50(byId.cupbearer) < 10, 'the Cupbearer is measured in millimetres');
  // legend rule: each legend ≥ 1.4 × the longest "said to reach" (z 3.6) in its lake
  for (const z of LAKES) {
    const lg = S.find((s) => s.zone === z && s.rarity === 'legendary');
    const longest = Math.max(...S.filter((s) => s.zone === z && s.rarity !== 'legendary').map((s) => D.sizeLength(s, SZ.reachZ, z)));
    const r = D.sizeL50(lg) / longest;
    ok(r >= SZ.legend.minRatio - 1e-9, `legend ${lg.id}: ${D.sizeL50(lg)} cm is ${r.toFixed(2)}× the lake's longest reach (≥ ${SZ.legend.minRatio}×)`);
  }
  ok(within(D.sizeL50(byId.lantern_swallower) / D.ceremony?.wickHeight || D.sizeL50(byId.lantern_swallower) / 100 / B3.ceremony.wickHeight, 10, 0.01), 'the Lantern-Swallower is 10 Wicks long');
  // recolours (brief §6.6) and the palette rule (stricter than the brief's 90–190° / 0.25: DESIGN §19.1's 65–195° / 0.15, run above on SPECIES)
  const RECOLOUR = { mossback_perch: { body: 0x585e66 }, reedjaw_pike: { body: 0x3e4a5c }, weeping_carp: { body: 0x646a74 }, dusk_minnow: { body: 0x7a8494 },
    gloam_eel: { body: 0x16142a, glow: 0xb9a8ff }, belled_matriarch: { body: 0x6a5a44, glow: 0xd8d0ff } };
  for (const [id, cols] of Object.entries(RECOLOUR)) for (const [k, v] of Object.entries(cols)) ok(byId[id].model[k] === v, `recolour ${id}.${k} must be #${v.toString(16)} (brief §6.6)`);
  for (const s of S.filter((x) => x.zone === 'glasswater')) { const g = s.model.glow; if (isNum(g)) { const { h, s: sat } = hsl(g); ok(!(h >= 150 && h <= 190 && sat > 0.25), `glasswater glow ${s.id} is aqua (brief: sapphire, not aqua)`); } }
  for (const [lake, P] of Object.entries(D.FISH_PALETTES)) for (const c of [...P.hues, P.glow].filter(isNum)) palCheck(`FISH_PALETTES.${lake}`, c);

  // ---- the size model (brief §6.1, §5.5)
  ok(JSON.stringify(D.SIZE_CLASSES.map((c) => c.id)) === '["small","keeper","prize","trophy","elder"]', 'one ladder: Small · Keeper · Prize · Trophy · Elder');
  ok(JSON.stringify(D.SIZE_CLASSES.slice(0, 4).map((c) => c.zMax)) === '[-0.25,1.04,1.88,2.65]' && SZ.ancient === 3.2 && SZ.reachZ === 3.6 && SZ.z.min === -2 && SZ.z.max === 3.6 && SZ.tail === 0.06, 'class cuts −0.25 / 1.04 / 1.88 / 2.65, Ancient 3.2, truncation [−2, 3.6], tail 0.06');
  ok(SZ.elsewhereMaxZ < 2.65 && SZ.classMaxZ.trophy < 2.65 && SZ.classMaxZ.prize < 1.88 && SZ.classMaxZ.keeper < 1.04, 'class caps sit just under their cuts');
  const ODDS = { 0: [38.7, 46.0, 12.2, 2.7, 0.4, 0.1], 0.5: [22.2, 48.2, 21.2, 6.9, 1.5, 0.3], 1.0: [10.5, 41.3, 29.6, 14.1, 4.5, 0.9], 1.5: [4.1, 28.8, 33.1, 23.1, 10.9, 2.7], 1.8: [2.1, 21.1, 32.0, 28.1, 16.8, 4.7] };
  for (const [mu, exp] of Object.entries(ODDS)) {
    const o = D.classOdds(+mu), got = [o.small, o.keeper, o.prize, o.trophy, o.elder, o.ancient].map((x) => 100 * x);
    ok(got.every((g, i) => within(g, exp[i], 0.11)), `class odds at μ ${mu}: ${got.map((g) => g.toFixed(1))} (brief ${exp})`);
  }
  ok(D.classOdds(1.8, SZ.elsewhereMaxZ).elder === 0, 'outside giant water z is clamped to a top Trophy (no Elders)');
  const dc = D.classOdds(0.55);
  ok(within(dc.prize * 100, 22, 0.6) && within(dc.trophy * 100, 7.4, 0.3) && within(dc.elder * 100, 1.7, 0.2), `the "decent cast" (μ 0.55): Prize ${(dc.prize * 100).toFixed(1)} Trophy ${(dc.trophy * 100).toFixed(1)} Elder ${(dc.elder * 100).toFixed(1)} (brief 22 / 7.4 / 1.7)`);
  // favour: notches, cap, examples
  ok(JSON.stringify(FV.notches) === '[0.15,0.45,0.8,1.2,1.6]' && FV.cap === 1.8, 'favour notches 0.15 / 0.45 / 0.8 / 1.2 / 1.6, cap 1.8');
  for (const e of FV.examples) {
    const mu = Math.min(FV.cap, e.terms.reduce((a, b) => a + b, 0));
    ok(within(mu, e.mu, 1e-9) && D.favourNotches(e.mu) === e.notches, `favour example "${e.name}": μ ${mu.toFixed(2)} → ${D.favourNotches(e.mu)} notches (brief ${e.notches})`);
  }
  ok(FV.place.inside === 0.15 && FV.place.astir === 0.35 && FV.hour.nightRise === 0.25 && FV.hour.dusk === 0.2 && FV.match.condition === 0.3 && FV.match.rumour === 0.3
    && FV.tackle.bait.ember_roe === 0.35 && FV.tackle.depthLowerThird === 0.25 && FV.tackle.cleanCast === 0.1 && FV.pressure.perCatch === -0.12 && FV.pressure.floor === -0.6
    && within(FV.pressure.quietAt, 3 * FV.pressure.perCatch, 1e-9), 'favour terms per brief §6.1 ("gone quiet" at 3 catches)');
  ok(Object.keys(FV.tackle.lure).every((id) => D.LURES.some((l) => l.id === id && l.favour === FV.tackle.lure[id])), 'favour lure terms match LURES');
  // value and yield
  ok(D.fishValueV3(byId.reedjaw_pike, 2.8) === 127, `Elder Reedjaw (z 2.8) is worth ${D.fishValueV3(byId.reedjaw_pike, 2.8)} Shells (brief 127)`);
  const VM = SZ.valueMix, Ez = (mu, cap) => { let num = 0, den = 0; for (let z = SZ.z.min; z <= cap; z += 0.002) { const p = Math.exp(-0.5 * (z - mu) ** 2); const cb = z >= 2.65 ? SZ.value.classBonus.elder : z >= 1.88 ? SZ.value.classBonus.trophy : 1; num += p * Math.min(SZ.value.clamp[1], Math.max(SZ.value.clamp[0], Math.exp(SZ.value.perZ * z))) * cb; den += p; } return num / den; };
  let mix = 0; for (const [mu, w] of VM.mu) mix += w * ((1 - VM.giantShare) * Ez(mu, SZ.elsewhereMaxZ) + VM.giantShare * Ez(mu, SZ.z.max));
  ok(within(mix, VM.multiplier, 0.005) && within(VM.sizeKMean / mix, SZ.value.factor, 0.005), `value factor: sizeK ${VM.sizeKMean} / mix ${mix.toFixed(3)} = ${(VM.sizeKMean / mix).toFixed(3)} (data ${SZ.value.factor})`);
  ok(within(VM.mu.reduce((a, [, w]) => a + w, 0), 1, 1e-9), 'value mix weights sum to 1');
  ok(D.fishValueV3(byId.pilgrim_salmon, 0, { zone: 'paleabyss' }) === Math.round(30 * 3.0 * 0.66), 'Wanderer values scale with the lake valueMult');
  // size → fight (brief §5.5 table)
  const F = SZ.fight, g = (z) => Math.exp(F.gPerZ * z);
  const FT = [[-0.8, 0.85, 0.77, 0.85, 0.92, 1.08, 0, 1.10], [0.4, 1.08, 1.14, 1.08, 1.04, 0.96, 0.03, 0.95], [1.4, 1.32, 1.57, 1.32, 1.15, 0.87, 0.11, 0.85],
    [2.2, 1.55, 2.02, 1.55, 1.25, 0.80, 0.18, 0.77], [2.95, 1.80, null, 2.15, 1.34, 0.75, 0.24, 0.70], [3.35, 1.95, null, 2.39, 1.40, 0.72, 0.27, 0.67]];
  for (const [z, gg, pw, st, surge, sweet, err, every] of FT) {
    const over = z > F.elderZ;
    ok(within(g(z), gg, 0.01) && (pw === null || within(g(z) ** F.powerExp, pw, 0.01)) && within(g(z) ** (over ? F.elderStaminaExp : F.staminaExp), st, 0.01)
      && within(g(z) ** F.surgeTimeExp, surge, 0.01) && within(g(z) ** F.sweetExp, sweet, 0.01) && within(F.erraticPerZ * Math.max(0, z), err, 0.01) && within(g(z) ** F.surgeEveryExp, every, 0.01),
    `size → fight at z ${z} matches the brief §5.5 table`);
  }
  ok(JSON.stringify(F.elderAge) === '{"mossmere":1.2,"sporewood":0.9,"glasswater":0.7,"paleabyss":0.35}' && F.elderStep === 1.08 && SZ.reel.staminaMult === 1.4 && SZ.reel.fatigue.elderFloor === 0.8
    && SZ.reel.oldTrick.at === 0.55 && SZ.reel.oldTrick.warnMult === 0.6 && SZ.reel.oldTrick.powerMult === 1.3, 'Elder age per lake, step 1.08, stamina × 1.4, fatigue floor 0.8, old trick 55% / × 0.6 warn / × 1.3 power');
  // residents (brief §7.0)
  const R3 = B3.residents, erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = (x) => 0.5 * (1 + erf((x - R3.z.mean) / R3.z.sd / Math.SQRT2)), top = Phi(R3.z.max) - Phi(R3.z.min);
  let mzSum = 0, dz = 0.001; for (let z = R3.z.min; z <= R3.z.max; z += dz) mzSum += z * Math.exp(-0.5 * ((z - R3.z.mean) / R3.z.sd) ** 2); let den = 0; for (let z = R3.z.min; z <= R3.z.max; z += dz) den += Math.exp(-0.5 * ((z - R3.z.mean) / R3.z.sd) ** 2);
  const eS = (Phi(R3.z.max) - Phi(2.65)) / top, aS = (Phi(R3.z.max) - Phi(SZ.ancient)) / top;
  ok(within(eS, R3.checks.elderShare, 0.002) && within(aS, R3.checks.ancientShare, 0.001) && within(mzSum / den, R3.checks.meanZ, 0.01), `resident z: Elder ${(eS * 100).toFixed(1)}%, Ancient ${(aS * 100).toFixed(1)}%, mean ${(mzSum / den).toFixed(2)} (brief 12.4 / 1.1 / 2.27)`);
  ok(R3.z.min === 1.88 && R3.reroll.afterInLakeDays === 3 && B3.markedFish.max === 6, 'residents always Trophy+, re-roll after 3 in-lake days; ≤ 6 Marked Fish');

  // ---- signs, bite, ceremony (brief §5.1–§5.8)
  ok(JSON.stringify(Object.keys(B3.signs.kinds)) === '["rise","boil","nervous","strike","bubbles","glow"]' && B3.signs.maxAlive === 6 && B3.signs.kinds.glow.night, 'six signs (≤ 6 alive; the glow trail is night only)');
  ok(JSON.stringify(D.SIZE_CLASSES.map((c) => c.bite)) === '["doublePop","plunge","dragUnder","flatSlide","dome"]', 'one bite tell per class');
  ok(B3.bite.pips.perfect === 3 && B3.bite.pips.normal === 2 && B3.bite.pips.rodBonusFrom === 3 && D.TACKLE.rod.every((r) => r.pips === (r.tier >= 3 ? 1 : 0)), 'hook-hold pips: 3 / 2, +1 from Rod T3');
  ok(JSON.stringify(D.SIZE_CLASSES.map((c) => c.ceremony)) === '[1.2,1.2,2.4,3.5,5]' && JSON.stringify(B3.ceremony.poses.map((p) => p.below)) === JSON.stringify([0.25, 0.85, 2.0, null].map((v) => v ?? Infinity)) || B3.ceremony.poses[3].below === Infinity, 'ceremony times and poses by length');
  const sealSpecies = S.filter((s) => D.sealsFor(s).length > 0), sealTotal = sealSpecies.reduce((a, s) => a + D.sealsFor(s).length, 0);
  ok(B3.ceremony.wickHeight === 0.85 && B3.records.oldLedgerZ === 2.3 && B3.records.seals.total === sealTotal && sealTotal === 143 && sealSpecies.length === 48, `the Wick is 0.85 m; Old Ledger at z 2.3; 48 species × 3 − the Lampwarden's Elder = ${sealTotal} seals (143)`);
  ok(S.every((s) => !s.maxClass || s.cove || D.sealsFor(s).length === (SZ.classMaxZ[s.maxClass] >= SZ.fight.elderZ ? 3 : B3.records.seals.classes.filter((c) => c !== 'elder').length)) && D.sealsFor(byId.lampwarden_angler).join() === 'prize,trophy', 'a species capped below Elder has no Elder seal');
  ok(S.filter((s) => s.rarity !== 'legendary' && !s.cove).length === B3.records.seals.species, 'the seal grid covers the 48 non-legendary lake and Wanderer species');

  // ---- oil, Far Water, the Live Well (brief §3.4)
  const O = B3.oil.context, P3 = D.EXPEDITION.phases, base = D.STATS.oilDrain.base;
  const dayOil = (zone, ctx, nightBurn = 1, calm = P3.calm) => base * D.ZONE_BY_ID[zone].drain.oil * (calm * O[ctx].calm + P3.dusk * O[ctx].dusk + P3.gloomtide * O[ctx].gloomtide * nightBurn + P3.dawn * O[ctx].dawn);
  ok(within(dayOil('mossmere', 'raft'), B3.oil.checks.mossmereDay, 0.05) && within(dayOil('mossmere', 'raft', 1, P3.calm + D.EXPEDITION.arrivalHush), B3.oil.checks.mossmereDay1, 0.05),
    `Mossmere day on the raft: ${dayOil('mossmere', 'raft').toFixed(1)} oil, day 1 ${dayOil('mossmere', 'raft', 1, P3.calm + 30).toFixed(1)} (brief 28.3 / 30.1)`);
  const footMin = (ph) => D.STATS.maxOil.base / (base * D.ZONE_BY_ID.glasswater.drain.oil * O.foot[ph]) / 60;
  ok(within(footMin('calm'), B3.oil.checks.footLantern.day, 0.05) && within(footMin('gloomtide'), B3.oil.checks.footLantern.night, 0.05), `a full lantern on foot in Glasswater lasts ${footMin('calm').toFixed(1)} min by day, ${footMin('gloomtide').toFixed(1)} at night (brief 7 / 5)`);
  ok(O.raft.gloomtide === 1.0 && O.foot.gloomtide === 1.4 && O.lamp.gloomtide === 0.7, 'raft night 1.0 in all modes; foot night 1.4; lamp night 0.7');
  for (const row of B3.farWater.table) {
    const f = D.farWaterFor(row.day);
    ok(within(f.favour, row.favour, 1e-9) && f.shows === row.shows && f.murk === row.murk && (row.oilPrice === null ? f.oilPrice === null : within(f.oilPrice, row.oilPrice, 1e-9))
      && within(f.render, row.render, 1e-9) && within(f.nightBurn, row.nightBurn, 1e-9), `Far Water day ${row.day}: formulas reproduce the brief table`);
  }
  ok(D.farWaterFor(1).favour === 0 && D.farWaterFor(1).murk && D.farWaterFor(7).murk && !D.farWaterFor(8).murk && within(D.farWaterFor(7).oilPrice, 3, 1e-9), 'Far Water starts at the first dawn; Murk odd days only after day 3');
  // a Mossmere common's rendered oil = mean species.oil × factor × E[clamp(e^(0.3z))] over the favour mix (brief ≈ 17)
  const YY = SZ.yield, Ey = (mu, cap) => { let nn = 0, dd = 0; for (let z = SZ.z.min; z <= cap; z += 0.002) { const p = Math.exp(-0.5 * (z - mu) ** 2); nn += p * Math.min(YY.clamp[1], Math.max(YY.clamp[0], Math.exp(YY.perZ * z))); dd += p; } return nn / dd; };
  let ymix = 0; for (const [mu, w] of VM.mu) ymix += w * ((1 - VM.giantShare) * Ey(mu, SZ.elsewhereMaxZ) + VM.giantShare * Ey(mu, SZ.z.max));
  ok(within(ymix, YY.mix, 0.002) && within(VM.sizeKMean / ymix, YY.factor, 0.002), `yield factor: sizeK ${VM.sizeKMean} / mix ${ymix.toFixed(3)} = ${(VM.sizeKMean / ymix).toFixed(3)} (data ${YY.factor} / ${YY.mix})`);
  const mossCommons = S.filter((s) => s.zone === 'mossmere' && s.rarity === 'common');
  const common = mossCommons.reduce((a, s) => a + s.oil, 0) / mossCommons.length * YY.factor * ymix;
  ok(within(common, B3.oil.checks.renderedCommon, 0.1), `a Mossmere common renders ${common.toFixed(2)} oil on average (brief ${B3.oil.checks.renderedCommon})`);
  ok(within(D.fishYieldV3({ oil: 10 }, 0), 10 * YY.factor * 1, 1e-9), 'fishYieldV3 applies the yield factor');
  B3.farWater.rendersPerDay.forEach((exp, i) => {
    const day = i + 1, f = D.farWaterFor(day), oil = dayOil('mossmere', 'raft', f.nightBurn, P3.calm + (day === 1 ? D.EXPEDITION.arrivalHush : 0));
    ok(within(oil / (common * f.render), exp, 0.06), `Mossmere commons rendered on day ${day}: ${(oil / (common * f.render)).toFixed(2)} (brief ${exp})`);
  });
  ok(JSON.stringify(B3.liveWell.nightsByCreel) === JSON.stringify(D.TACKLE.creel.map((c) => c.nights)), 'Live Well nights follow the Creel tiers (3 / 3 / 4 / 4 / 5)');

  // ---- night modes (brief §4)
  const NM = B3.nightModes;
  ok(NM.default === 'lantern' && NM.firstOuting === 'still' && NM.offeredFrom === 2 && JSON.stringify(NM.order) === '["still","lantern","gloomtide"]', 'Lantern by default from the 2nd expedition; the First Outing is still');
  ok(within((NM.lantern.window[1] - NM.lantern.window[0]) * P3.gloomtide, 40.5, 1e-9) && within((1 - NM.lantern.window[1]) * P3.gloomtide, NM.lantern.quietTail, 1e-9), 'Lantern window 0.05 → 0.50 (40.5 s); the last 45 s are quiet');
  ok([1, 2, 3, 4, 5, 6].map((n) => +D.swarmTonight('lantern', n)).join('') === '010101' && [1, 2, 3].every((n) => D.swarmTonight('gloomtide', n) && !D.swarmTonight('still', n) && !D.swarmTonight('gloomtide', n, 'first')), 'swarm nights: Lantern even nights, Gloomtide every night, Still and the First Outing never');
  ok(NM.gloomtide.growth === D.BALANCE.gloomGrowth && NM.gloomtide.max === D.BALANCE.gloomMax && NM.gloomtide.wardens.every === D.BALANCE.combat.director.bossEvery, 'Gloomtide keeps today\'s night growth, cap and Warden cadence');
  ok(JSON.stringify(NM.lantern.heatOffset) === '[0,2,4,6]' && JSON.stringify(NM.gloomtide.heatOffset) === '[0,4,8,12]' && JSON.stringify(D.EXPEDITION.deepStarts.heatOffset) === JSON.stringify({ lantern: NM.lantern.heatOffset, gloomtide: NM.gloomtide.heatOffset }), 'Heat arrival offsets per mode');
  ok(NM.lantern.threat.slamSnaps === false && NM.lantern.threat.whileHooked === false && NM.lantern.embersZero === 'scorched' && NM.lantern.scorched.oil === -30 && JSON.stringify(NM.lantern.snuffBy) === '["oil"]' && JSON.stringify(NM.still.snuffBy) === '["oil"]', 'Lantern never costs a hooked fish or the expedition (Scorched, oil-only snuffs)');
  ok(JSON.stringify(NM.lantern.mult) === '{"spawnRate":0.55,"hpMult":0.8,"maxAlive":0.6,"eliteEvery":2}' && NM.lantern.wardens.hpMult === 0.75 && NM.lantern.wardens.everySwarmNight === 2, 'Lantern intensity and Warden cadence');
  ok(NM.lampWatch.modes.join() === 'lantern' && NM.lampWatch.fishWithin === 10, 'lamp-watch: Lantern only, fish within 10 m');
  for (const z of LAKES) {
    const ids = D.WALK_SYNC_V3.watchLamps[z];
    ok(ids?.length === 2, `${z}: two watch-lamps`);
    if (z === 'mossmere') {
      const LM = WLY.buildLayout(D.ZONES[0]);
      ok(ids.every((id) => D.MOSSMERE_V3.watchLamps.some((l) => l.id === id)) && D.MOSSMERE_V3.watchLamps.every((l) => near(LM.docks[l.dock].buoy, l) < 0.1 && l.radius === NM.lampWatch.radius), 'the Mossmere watch-lamps are the drawn buoy-lamps of the south-east and west docks (dock + buoy offset), pool r 6');
    }
    else for (const id of ids) ok(D.ARENA_V2[z].lamps.some((l) => l.id === id && l.watch === true), `${z} watch-lamp ${id} must be a flagged sister-candle`);
  }
  // the hard rule: nothing fishing exists only with combat on
  const fishingThing = (key) => { const [kind, id] = String(key).split(':'); return kind === 'bait' || kind === 'lure' || (kind === 'boon' && (D.ANGLER_POOL.includes(id) || D.BOON_BY_ID[id]?.tags?.includes('fishing'))) || (kind === 'relic' && D.RELIC_BY_ID[id]?.shelf === 'fishing'); };
  ok(JSON.stringify(D.CHALLENGES.filter((c) => c.tab === 'gloom').map((c) => c.id).sort()) === JSON.stringify(D.GLOOM_TAB.slice().sort()) && D.GLOOM_TAB.length === 9, 'the Gloom tab holds exactly the brief\'s nine challenges');
  for (const c of D.CHALLENGES.filter((x) => x.tab === 'gloom')) ok(!c.reward.unlock || !fishingThing(c.reward.unlock), `Gloom challenge ${c.id} unlocks a fishing thing (${c.reward.unlock}): the hard rule`);
  for (const r of D.RELICS.filter((x) => x.shelf === 'gloom')) ok(!Object.keys(r.effects).some((k) => ['castMax', 'lineStrength', 'reelSpeed', 'sweetZone', 'biteSpeed', 'hookWindow', 'rarityBonus', 'slackTime', 'nibbleTells'].includes(k)), `Gloom-shelf relic ${r.id} gives a fishing stat`);
  for (const s of S) ok(!('mode' in s) && !('combatOnly' in s), `species ${s.id} depends on a night mode`);
  for (const p of D.PLACES_V3) ok(!('combatOnly' in p) && !('mode' in p), `place ${p.id} depends on a night mode`);
  for (const t of [...D.LURES, ...D.TACKLE.rod, ...D.TACKLE.line, ...D.TACKLE.reel, ...D.TACKLE.creel, ...D.OUTFIT]) ok(!('modes' in t), `tackle ${t.id} depends on a night mode`);

  // ---- tackle, outfit, lures (brief §5.6, §5.3)
  const PR = { rod: [0, 120, 450, 1400, 3200], line: [0, 120, 450, 1400, 3200], reel: [0, 120, 450, 1400, 3200], creel: [0, 70, 270, 840, 1920] };
  for (const slot of D.TACKLE.slots) {
    const tiers = D.TACKLE[slot];
    ok(tiers.length === 5 && tiers.every((t, i) => t.tier === i && isStr(t.id) && isStr(t.name)), `TACKLE.${slot}: tiers T0–T4`);
    ok(JSON.stringify(tiers.map((t) => t.price)) === JSON.stringify(PR[slot]), `TACKLE.${slot} prices ${tiers.map((t) => t.price)} (brief ${PR[slot]})`);
    ok(tiers.every((t) => t.tier < 2 ? t.proof === null : !!D.TACKLE.proofs[t.proof]), `TACKLE.${slot}: T2–T4 need a proof catch, T0–T1 none`);
    ok(tiers.every((t) => (t.tier <= 2 ? t.onSale === 'start' : t.onSale === (t.tier === 3 ? 'sporewood' : 'glasswater'))), `TACKLE.${slot}: T3 with Sporewood lit, T4 with Glasswater lit`);
    const STAT = { rod: ['castMax', 'hookWindow', 'slackTime', 'shock'], line: ['lineStrength'], reel: ['reelSpeed', 'sweetZone', 'absorb'], creel: ['creelSize', 'liveWell', 'nights'] }[slot];
    for (const k of STAT) ok(tiers.every((t, i) => i === 0 || t[k] >= tiers[i - 1][k]), `TACKLE.${slot}.${k} never drops with tier`);
    ok(D.TACKLE.catalogue[slot] === tiers.reduce((a, t) => a + t.price, 0), `TACKLE.catalogue.${slot}`);
  }
  ok(D.TACKLE.catalogue.total === 18610 && D.TACKLE.catalogue.total === D.TACKLE.slots.reduce((a, s) => a + D.TACKLE.catalogue[s], 0), 'tackle catalogue 18,610');
  ok(D.TACKLE.rod[0].castMax === D.STATS.castMax.base && D.TACKLE.line[0].lineStrength === D.STATS.lineStrength.base && D.TACKLE.reel[0].reelSpeed === D.STATS.reelSpeed.base
    && D.TACKLE.reel[0].sweetZone === D.STATS.sweetZone.base && D.TACKLE.creel[0].creelSize === D.STATS.creelSize.base, 'T0 tackle equals the STATS base');
  ok(D.TACKLE.creel[0].creelSize === 4 && D.TACKLE.creel[4].creelSize === 8, 'the creel range (4–8) equals today\'s per-run Woven Creel range');
  ok(JSON.stringify(D.TACKLE.drag.presets) === '{"light":0.7,"set":0.8,"firm":0.9}' && D.TACKLE.drag.fromReelTier === 2 && D.TACKLE.reel.every((r) => (r.tier >= 2) === (r.drag === 'presets')), 'drag presets from Reel T2');
  ok(D.OUTFIT.length === 4 && D.OUTFIT.every((o) => JSON.stringify(o.prices) === '[80,240,600]' && o.maxLevel === 3) && D.OUTFIT.reduce((a, o) => a + o.prices.reduce((x, y) => x + y, 0), 0) === 3680, 'outfit: 4 items × 80 / 240 / 600 (3,680)');
  for (const o of D.OUTFIT) { for (const k of Object.keys(o.effects)) ok(isStatKey(k), `outfit ${o.id} effect ${k} is not a STATS key`); ok(!!D.UPGRADE_BY_ID[o.from], `outfit ${o.id} from ${o.from}`); }
  ok(JSON.stringify(D.LURES.map((l) => l.price)) === '[40,90,120,260,1200]' && D.LURES.reduce((a, l) => a + l.price, 0) === 1710, 'lures 40 / 90 / 120 / 260 / 1,200 (1,710)');
  ok(D.LURES.every((l) => l.family === null || D.FISH_FAMILIES.includes(l.family)), 'lure families');
  for (const id of D.COMBAT_KIT.ids) ok(D.UPGRADE_BY_ID[id] && !D.OUTFIT.some((o) => o.from === id), `combat kit ${id}`);
  const KIT = { lantern_mantle: [22, 56, 120, 224], lantern_lens: [36, 80, 168], lantern_striker: [22, 60, 132], raft_hull: [44, 100, 208], raft_hearth: [104, 240] };
  for (const [id, exp] of Object.entries(KIT)) ok(JSON.stringify(D.UPGRADE_BY_ID[id].costs.map((c) => Math.round(c * D.COMBAT_KIT.priceMult))) === JSON.stringify(exp), `combat kit ${id} at 40%: ${exp}`);
  // rating: the matched-set table follows the gate table; the generated table agrees on matched sets
  const CL = ['small', 'keeper', 'prize', 'trophy', 'elder'];
  for (const z of LAKES) {
    const gate = D.TACKLE.gate[D.TACKLE.reference[z]];
    D.TACKLE.rating[z].forEach(([cls, nextP], t) => {
      const [P, T, E] = gate[t]; let c = 1, nxt = P;
      if (P >= 50) { c = 2; nxt = T; } if (P >= 50 && T >= 50) { c = 3; nxt = E; } if (P >= 50 && T >= 50 && E >= 50) { c = 4; nxt = E; }
      ok(cls === CL[c] && nextP === nxt, `${z} T${t} rating ${cls} (${nextP}%) must follow the gate table (${CL[c]}, ${nxt}%)`);
    });
  }
  const TR = B3.tackleRating;
  if (ok(isObj(TR) && TR.k >= 200 && LAKES.every((z) => TR.lakes[z]?.cls?.length === 125 && TR.lakes[z]?.next?.length === 125), 'BALANCE.tackleRating: 125 loadouts × 4 lakes (tools/sim/reel-v3.mjs --write-rating --apply)')) {
    for (const z of LAKES) {
      ok(TR.lakes[z].reference === D.TACKLE.reference[z], `tackleRating ${z} reference species`);
      for (let t = 0; t <= 4; t++) {
        const i = 31 * t, [cls, nextP] = D.TACKLE.rating[z][t];
        ok(TR.classes[+TR.lakes[z].cls[i]] === cls && within(TR.lakes[z].next[i], nextP, 2), `tackleRating ${z} matched T${t}: ${TR.classes[+TR.lakes[z].cls[i]]} ${TR.lakes[z].next[i]}% vs the brief ${cls} ${nextP}%`);
      }
      // near-monotone: upgrading one slot rarely lowers the rated class (sim noise at the 50% line; ≤ 3% of single-slot upgrades)
      let drops = 0, pairs = 0;
      for (let r = 0; r < 5; r++) for (let l = 0; l < 5; l++) for (let e = 0; e < 5; e++) {
        const i = r * 25 + l * 5 + e, c = +TR.lakes[z].cls[i];
        for (const j of [r < 4 ? i + 25 : -1, l < 4 ? i + 5 : -1, e < 4 ? i + 1 : -1]) if (j >= 0) { pairs++; if (+TR.lakes[z].cls[j] < c) drops++; }
      }
      ok(drops / pairs <= 0.03, `tackleRating ${z}: ${drops} of ${pairs} single-slot upgrades lower the rating (≤ 3%: noise at the 50% line)`);
    }
  }
  // the gear gate from the reel sim, within tolerance (brief §5.6; skilled; same seeds as the table, k 160)
  const SIM = await import('./sim/reel-v3.mjs');
  const KV = 160, TOL = 8;
  for (const z of LAKES) {
    const id = D.TACKLE.reference[z], sp = byId[id], gate = D.TACKLE.gate[id];
    for (const [t, ci, col] of [[2, 4, 2], [3, 4, 2], [4, 4, 2], [4, 5, 3], [1, 3, 1]]) {
      const c = SIM.CLASSES[ci], p = Math.round(100 * SIM.cell(sp, c.z, SIM.loadout(t), 'skilled', c.ci, KV).p);
      ok(within(p, gate[t][col], TOL), `reel sim: ${id} ${c.label} on T${t} lands ${p}% (gate table ${gate[t][col]}% ± ${TOL})`);
    }
    const e4 = gate[4][2], a4 = gate[4][3], TT = D.TACKLE.targets;
    ok(e4 >= TT.elderT4Reference[0] && e4 <= TT.elderT4Reference[1] + TT.elderT4Tolerance, `${id}: Elder on T4 ${e4}% (target ${TT.elderT4Reference} + ${TT.elderT4Tolerance})`);
    ok(a4 >= TT.ancientT4Reference[0] && a4 <= TT.ancientT4Reference[1], `${id}: Ancient on T4 ${a4}% (target ${TT.ancientT4Reference})`);
    ok(gate[0][2] <= TT.elderOnArrival[1] && gate[1][2] <= TT.elderOnArrival[1], `${id}: headline Elders are a wall on T0–T1 (≤ ${TT.elderOnArrival[1]}%)`);
  }
  const lev = byId.lantern_swallower, levP = Math.round(100 * SIM.cell(lev, 0, SIM.loadout(4), 'skilled', 0, KV).p);
  ok(within(levP, D.TACKLE.legends.lantern_swallower[4][1], TOL), `reel sim: the Lantern-Swallower on full T4 lands ${levP}% skilled (brief ${D.TACKLE.legends.lantern_swallower[4][1]}%)`);
  ok(D.TACKLE.legends.lantern_swallower.slice(0, 3).every((r) => r.every((v) => v === 0)), 'the Lantern-Swallower needs Line T4');

  // ---- the expedition and The Long Descent (brief §3)
  const E3 = D.EXPEDITION;
  ok(P3.calm + P3.dusk + P3.gloomtide + P3.dawn === 300 && E3.calmByMode.foot === 185 && E3.arrivalHush === 30, 'a day is 180 + 20 + 90 + 10 s (185 s calm in the foot lakes; +30 s Arrival Hush)');
  ok(JSON.stringify(E3.gates.tolls) === JSON.stringify(Object.fromEntries(D.ZONES.slice(1).map((z) => [z.id, z.unlock.shells]))), 'tolls 180 / 420 / 900 (unchanged, paid once)');
  ok(JSON.stringify(E3.deepStarts.picks) === '{"sporewood":3,"glasswater":6,"paleabyss":9}' && JSON.stringify(E3.deepStarts.draftLevels) === JSON.stringify(Object.fromEntries(Object.entries(D.BALANCE.economy.waystoneLevels).filter(([k]) => k !== 'mossmere'))), 'deep starts: 3 / 6 / 9 picks; the Kindling Draft keeps 9 / 18 / 28');
  ok(E3.tally.perDawn === 3 && E3.tally.perStillNight === 1 && E3.tally.perLanternSwarmNight === 4 && E3.tally.perLakeCrossed === 10 && E3.tally.perLedger === 2 && E3.tally.snuffedMult === 0.5, 'tally: 3 per dawn, 1 per still night, 4 per Lantern swarm night, 10 per lake crossed, 2 per Ledger request, × 0.5 if snuffed');
  ok(D.tallyFor({ dawns: 2, stillNights: 2, ledger: 1 }).total === 10, 'First Outing tally = 10 (brief §2.2)');
  ok(D.tallyFor({ dawns: 4, stillNights: 2, swarmNights: 2, ledger: 1 }).total === 24 && D.tallyFor({ dawns: 4, stillNights: 4, ledger: 1 }).total === 18, '4-day tally: Lantern 24, Still 18 (brief §9.4)');
  ok(D.tallyFor({ dawns: 4, stillNights: 4, ledger: 1, snuffed: true }).total === 9 && D.tallyFor({ mode: 'gloomtide', swarmNights: 3, zoneIndex: 2 }).total === 15, 'tally: snuffed halves; Gloomtide pays nightsSurvived × (3 + zone)');
  for (const [z, st] of Object.entries(E3.homeward.stones)) {
    const A = D.walkArenaFor(z);
    ok(near(st, A.spawn) >= E3.homeward.minPathFromSpawn, `${z} Homeward Waystone (${st.x}, ${st.z}) is ${near(st, A.spawn).toFixed(1)} m from the spawn in a straight line (≥ ${E3.homeward.minPathFromSpawn} m of path)`);
    ok(D.ZONE_BY_ID[z].homeward?.x === st.x, `${z}.homeward set in the v3 build`);
  }
  // beside, not on: clear of stands, slots, lamps, posts, buoys and barge pads; open raft water (Mossmere) or walkable ground that
  // still lets the Wick reach every mooring stand with the stone's block in place (§24 lakes)
  const HCL = E3.homeward.clearOf;
  const stoneClear = (zone, st, label) => {
    const A = D.walkArenaFor(zone), L = WLY.buildLayout(D.ZONE_BY_ID[zone]);
    const hits = [];
    for (const m of A.moorings || []) { if (near(st, m.stand) < HCL.stand) hits.push(`stand ${m.id}`); if (near(st, m.slot) < HCL.stand + 1) hits.push(`slot ${m.id}`); }
    for (const l of (D.ARENA_V2[zone]?.lamps || [])) if (near(st, l) < HCL.lamp) hits.push(`lamp ${l.id}`);
    for (const d of L.docks) { if (near(st, d) < HCL.bargePad) hits.push('barge pad'); if (near(st, d.buoy) < HCL.buoy) hits.push('buoy'); for (const p of d.posts) if (near(st, p) < HCL.post) hits.push('post'); }
    ok(hits.length === 0, `${label} Homeward stone (${st.x}, ${st.z}) is too close to ${hits.join(', ')}`);
    return L;
  };
  for (const [z, st] of Object.entries(E3.homeward.stones)) {
    const L = stoneClear(z, st, z);
    if (z === 'mossmere') ok(WLY.isOpenWaterL(L, [...L.obstacles, ...L.gateObstacles], st.x, st.z, E3.homeward.radius + 0.6), `mossmere Homeward stone must stand in open water`);
    else {
      const A = D.ARENA_V2[z], blocks = A.walk.blocks || (A.walk.blocks = []);
      blocks.push({ kind: 'disc', x: st.x, z: st.z, r: E3.homeward.radius, h: E3.homeward.block.h });
      const G = D.walkGridFor(z), M = WL.erode(G), dist = WL.walkDistances(G, D.ZONE_BY_ID[z], WL.footSeeds(G, D.ZONE_BY_ID[z], M), M);
      blocks.pop();
      let near4 = false; for (let k = 0; k < G.n * G.n; k++) if (M[k] && dist[k] < Infinity) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - st.x, zz - st.z) <= E3.homeward.range) { near4 = true; break; } }
      ok(near4, `${z} Homeward stone: no walkable cell within ${E3.homeward.range} m once it stands`);
      { const G0 = D.walkGridFor(z), M0 = WL.erode(G0), d0 = WL.walkDistances(G0, D.ZONE_BY_ID[z], WL.footSeeds(G0, D.ZONE_BY_ID[z], M0), M0); let lost = 0;
        for (let k = 0; k < G.n * G.n; k++) if (d0[k] < Infinity && !(dist[k] < Infinity) && M[k]) lost++;
        ok(lost === 0, `${z} Homeward stone cuts ${lost} walkable cells off the rest of the lake`); }
    }
  }
  ok(E3.homeward.radius === 0.6 && E3.homeward.block.h > 1, 'Homeward stones: r 0.6 lantern-stones that block');
  ok(E3.firstOuting.zone === 'mossmere' && E3.firstOuting.character === 'wick' && E3.firstOuting.nightMode === 'still', 'the First Outing: the Mossmere, The Wick, every night still');
  ok(E3.snuffed.loses.join() === 'creel,marked' && !E3.snuffed.keeps.includes('creel') && E3.snuffed.keeps.includes('records') && E3.snuffed.keeps.includes('shells'), 'Snuffed: lose the creel and the marked fish, never a record or banked Shells');
  const LD = D.LONG_DESCENT;
  ok(LD.unlock.waystonesLit === 4 && LD.nightMode === 'gloomtide' && LD.purse.start === D.BALANCE.economy.startShells && LD.purse.separate && LD.tackle === 'UPGRADES' && !LD.persistentTackle && !LD.farWater, 'The Long Descent: all four Waystones; Gloomtide; its own 20-Shell purse; per-run UPGRADES; no Far Water');
  ok(D.BALANCE.phases.calm === 120 && D.BALANCE.phases.dawn === 8, 'today\'s phases stay in BALANCE.phases for The Long Descent');

  // ---- economy (brief §9)
  const EC = D.ECONOMY_V3;
  for (const [z, r] of Object.entries(EC.income)) {
    ok(within(r.eaten + r.marked + r.sold, r.landed, 1e-9) && within(r.sold * r.perFish, r.fish, 1) && r.fish + r.ledger === r.gross && r.gross - r.bait === r.net && within(r.net * EC.daysPerHour, r.netHour, 1),
      `income ${z}: landed/sold/fish/gross/net/hour arithmetic (brief §9.1)`);
  }
  const cost = (key) => {
    const [kind, a, b] = key.split(':');
    if (kind in D.TACKLE && D.TACKLE.slots.includes(kind)) return D.TACKLE[kind][+a].price;
    if (kind === 'outfit') return D.OUTFIT.find((o) => o.id === a).prices[+b - 1];
    if (kind === 'lure') return D.LURES.find((l) => l.id === a).price;
    if (kind === 'bait') return EC.legendBaits[a];
    if (kind === 'toll') return E3.gates.tolls[a];
    if (kind === 'pond') return EC.pond.tiers.find((t) => t.tier === +a).price;
    return NaN;
  };
  const netAt = (h) => { let s = EC.startShells; for (const z of LAKES) { const [a, b] = EC.spans[z]; s += EC.income[z].netHour * Math.max(0, Math.min(h, b) - a); } return s; };
  const coverAt = (need) => { let lo = 0, hi = 40; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (netAt(m) >= need) hi = m; else lo = m; } return hi; };
  ok(within(netAt(1.5), 1096, 1) && within(netAt(4.5), 4660, 1) && within(netAt(8.5), 10952, 1) && within(netAt(14), 22661, 1) && within(netAt(16), 26919, 1), 'cumulative net 1,096 / 4,660 / 10,952 / 22,661 / 26,919 at h1.5 / 4.5 / 8.5 / 14 / 16');
  let spend = 0, lastH = 0, worst = 0;
  const SPENDS = [430, 590, 670, 850, 1300, 1750, 2200, 2470, 2720, 2900, 3060, 3360, 3780, 4260, 5660, 7060, 8460, 8800, 9700, 10800, 14000, 14640, 17840, 21040, 21520, 23920, 25120, 26320, 28240];
  EC.timeline.forEach(([h, items], i) => {
    const c = items.reduce((a, k) => a + cost(k), 0); spend += c;
    ok(Number.isFinite(c), `timeline h${h}: unknown item in ${items}`);
    ok(spend === SPENDS[i], `timeline h${h}: cumulative spend ${spend} (brief ${SPENDS[i]})`);
    const at = coverAt(spend); worst = Math.max(worst, Math.abs(at - h));
    ok(h >= lastH && within(at, h, EC.tolerance), `timeline h${h}: income first covers ${spend} at h${at.toFixed(2)} (± ${EC.tolerance} h)`);
    lastH = h;
  });
  ok(spend === EC.mainSinks && within(coverAt(EC.mainSinks), EC.meetsAt, EC.tolerance), `income and the main sinks (${EC.mainSinks}) meet at h${coverAt(EC.mainSinks).toFixed(2)} (brief ≈ h${EC.meetsAt})`);
  // gates along the timeline: tiers on sale only after their Waystone, legend baits before their gate opens
  const tollH = Object.fromEntries(EC.timeline.flatMap(([h, it]) => it.filter((k) => k.startsWith('toll:')).map((k) => [k.split(':')[1], h])));
  for (const [h, items] of EC.timeline) for (const k of items) {
    const [kind, a, b] = k.split(':');
    const sale = D.TACKLE.slots.includes(kind) ? D.TACKLE[kind][+a].onSale : kind === 'outfit' ? D.OUTFIT.find((o) => o.id === a).onSale : kind === 'lure' ? D.LURES.find((l) => l.id === a).onSale : kind === 'pond' && +a === 3 ? 'glasswater' : 'start';
    if (sale !== 'start') ok(h > tollH[sale], `timeline h${h}: ${k} is on sale only once ${sale} is lit (toll at h${tollH[sale]})`);
  }
  ok(EC.pond.tiers.map((t) => t.price).join() === '300,1200' && EC.pond.tiers.map((t) => t.slots).join() === '5,6' && EC.pond.tier1.slots === 3 && EC.pond.maxLength === 1.4, 'keep-pond: 3 → 5 (300) → 6 (1,200); fish ≤ 1.4 m');
  ok(EC.welcomePurse === 200 && D.RENAMES.welcomePurse === 200 && D.BALANCE.economy.welcomePurse === 200, 'the 200-Shell welcome purse on migration');
  ok(EC.modeMult.still === 1.03 && EC.modeMult.gloomtide === 0.92, 'mode income: Still +3%, Gloomtide −8%');

  // ---- Memories, relics, Boons, Wicks (brief §9.4, §4.4, §4.5)
  const M3 = D.MEMORIES_V3, chSum = (f) => D.CHALLENGES.filter(f).reduce((a, c) => a + c.reward.memories, 0);
  ok(chSum((c) => c.tier <= 3) === M3.challenges.v1 && chSum((c) => c.tier === 4) === M3.challenges.tier4 && chSum((c) => c.tier === 5) === M3.challenges.tier5 && chSum(() => true) === M3.challenges.total, `challenge Memories ${chSum((c) => c.tier <= 3)} + ${chSum((c) => c.tier === 4)} + ${chSum((c) => c.tier === 5)} = ${chSum(() => true)} (brief 831 + 185 + 155 = 1,170)`);
  const n48 = B3.records.seals.species, nPlaces = D.PLACES_V3.filter((p) => !p.secret).length;
  const sumSeals = (tab) => S.reduce((a, s) => a + D.sealsFor(s).reduce((x, c) => x + tab[c], 0), 0);
  const parts = { challenges: M3.challenges.total, species: S.length * M3.newSpecies, classFirsts: sumSeals(M3.classFirst),
    firstMounts: sumSeals(M3.firstMount), firstReleases: sumSeals(M3.firstRelease),
    places: nPlaces * (M3.place.found + M3.place.mastered), rumours: D.RUMOURS.length * M3.rumourSolved, oldLedger: n48 * M3.oldLedger, legends: 4 * M3.legend.first, ancients: 4 * M3.firstAncientPerLake };
  for (const [k, v] of Object.entries(parts)) ok(v === M3.pool.parts[k], `Memories pool ${k}: ${v} (brief ${M3.pool.parts[k]})`);
  const pool = Object.values(parts).reduce((a, b) => a + b, 0);
  ok(within(pool, M3.pool.total, M3.pool.total * 0.01), `one-time Memories pool ${pool} (brief ≈ ${M3.pool.total})`);
  ok(M3.perHour.midGame.still / M3.perHour.midGame.lantern >= 1 - M3.perHour.stillWithin, 'Still Memories/h within 15% of Lantern');
  ok(JSON.stringify(EXP_TALLY_CHECK()) === '[24,18]', 'mid-game tally per expedition (24 Lantern / 18 Still)');
  function EXP_TALLY_CHECK() { return [D.tallyFor({ dawns: 4, stillNights: 2, swarmNights: 2, ledger: 1 }).total, D.tallyFor({ dawns: 4, stillNights: 4, ledger: 1 }).total]; }
  const shelf = (s) => D.RELICS.filter((r) => r.shelf === s);
  const lv = (s) => shelf(s).reduce((a, r) => a + r.maxLevel, 0), baseCost = (s) => shelf(s).reduce((a, r) => a + r.baseCosts.reduce((x, y) => x + y, 0), 0), nowCost = (s) => shelf(s).reduce((a, r) => a + r.costs.reduce((x, y) => x + y, 0), 0);
  ok(lv('fishing') === M3.shelves.fishing.levels && baseCost('fishing') === M3.shelves.fishing.base && within(nowCost('fishing'), M3.shelves.fishing.base * M3.shelves.fishing.costMult, 60),
    `Fishing & Exploration shelf: ${lv('fishing')} levels, ${baseCost('fishing')} → ${nowCost('fishing')} (brief 46, 8,800 → ≈ 4,840)`);
  ok(lv('gloom') === M3.shelves.gloom.levels && baseCost('gloom') === M3.shelves.gloom.base && within(nowCost('gloom'), M3.shelves.gloom.base * M3.shelves.gloom.costMult, 30),
    `Gloom shelf: ${lv('gloom')} levels, ${baseCost('gloom')} → ${nowCost('gloom')} (brief 14, 3,125 → ≈ 2,190)`);
  ok(lv('fishing') + lv('gloom') === 60, 'the Shrine shows ≈ 60 drowned lanterns (total relic levels, read from data)');
  ok(M3.cut.every((id) => !D.RELIC_BY_ID[id] && V1.RELIC_BY_ID[id]) && D.RELIC_BY_ID.seven_knots.effects.lineStrength === 0.05, 'Waystone relics and Murk\'s Old Debt cut; Seven Knots halved');
  ok(D.ANGLER_POOL.length === 15 && D.ANGLER_POOL.every((id) => D.BOON_BY_ID[id]?.tags.includes('angler')), 'the Angler pool: 9 existing + 6 new Boons, all tagged');
  for (const b of D.BOONS_V3) ok(!Object.keys(b.effects).includes('favour') && !b.opens, `Angler Boon ${b.id}: no Boon adds favour or opens a place`);
  for (const c of D.CHARACTERS) ok(isObj(c.fishing) && isStr(c.fishing.name) && isStr(c.fishing.desc), `Wick ${c.id} needs a fishing half (brief §4.5)`);

  // ---- challenges (brief §11)
  const CH = D.CHALLENGE_BY_ID;
  ok(D.CHALLENGES.every((c) => c.scope !== 'run') && D.CHALLENGES.filter((c) => c.tier === 5).length === 8, 'no "run" scope left; 8 tier V challenges');
  ok(JSON.stringify(D.CHALLENGES.filter((c) => c.tier === 5).map((c) => c.reward.memories)) === '[5,10,20,15,30,40,20,15]', 'tier V rewards +5 / +10 / +20 / +15 / +30 / +40 / +20 / +15');
  ok(CH.first_prize.reward.unlock === 'relic:measuring_cord' && CH.ten_trophies.reward.unlock === 'relic:rumour_shell' && CH.old_ledger_five.reward.unlock === 'relic:murks_spyglass', 'tier V reveals the Measuring Cord, the Rumour Shell and Murk\'s Spyglass');
  ok(CH.heavy_catch.params.kg === 15 && CH.complete_chronicle.params.n === 53 && CH.every_still_place.params.n === 21 && CH.light_comes_up.params.id === 'lantern_swallower'
    && CH.many_flames.params.class === 'trophy' && CH.unwarded.alt?.params?.n === 3 && CH.kindle_one.alt?.params?.pool === 'angler' && CH.down_the_sluice.type === 'lightWaystone' && CH.the_long_way_round.scope === 'total', 'challenge rewrites (brief §11)');
  ok(CH.long_vigil.reward.unlock === 'character:tallow' && CH.long_vigil.type === 'nightsOut' && CH.unwarded.reward.unlock === 'character:ashwick', 'either-path Wick unlocks keep their challenges');
  const TYPES = new Set(['catch', 'nights', 'nightsOut', 'level', 'slayElite', 'journal', 'slay', 'boss', 'lightWaystone', 'reachZone', 'nightNoDamage', 'slayNight', 'boonLevel', 'nightCatch', 'perfectHooks', 'quality', 'weight',
    'shells', 'kindle', 'bossDistinct', 'classZoneCharacters', 'catchSpecies', 'victory', 'footAshore', 'placeFound', 'lampLit', 'placeSpecies', 'placeMastered', 'shortcutOpen', 'slayOnTag', 'nightNoLamp', 'lampLitZone',
    'classCatch', 'lakeSet', 'elderEveryLake', 'oldLedger', 'markedHome', 'nightSpeciesClass']);
  for (const c of D.CHALLENGES) { ok(TYPES.has(c.type) && (!c.alt || TYPES.has(c.alt.type)), `challenge ${c.id} type ${c.type}`); ok(Object.keys(D.CHALLENGE_TABS_V3).includes(c.tab), `challenge ${c.id} tab ${c.tab}`); }
  ok(D.LEDGER.slots === 3 && D.LEDGER.templates.filter((t) => t.modes).every((t) => t.modes.every((m) => m !== 'still')), 'Murk\'s Ledger: 3 slots; combat requests only in combat modes');

  // ---- places (brief §7): the Mossmere's 8 + 1, the §24 sync, giants and residents
  const PV = D.PLACES_V3, real = PV.filter((p) => !p.secret);
  ok(real.length === 29 && PV.filter((p) => p.secret).length === 1 && D.WALK_SYNC_V3.secrets.length === 3 && new Set(PV.map((p) => p.id)).size === PV.length, '29 places (+ 4 secrets: the Moon Cistern and three §24 proposals)');
  ok(D.MOSSMERE_V3.places.filter((p) => !p.secret).length === 8 && D.MOSSMERE_V3.places.every((p) => p.access === 'raft'), 'the Mossmere: 8 raft places + 1 secret');
  ok(Object.keys(D.PLACE_SYNC_V3).length === 21 && Object.keys(D.PLACE_SYNC_V3).every((id) => D.PLACE_BY_ID[id]), 'PLACE_SYNC_V3 covers §24\'s 21 places by id');
  const RULES3 = ['rhythm', 'sequence', 'deed', 'targets', 'moving', 'drifters', 'cue', 'plumb', 'reflection', 'phaseWindow', 'sight', 'drift'];
  for (const z of LAKES) {
    const zp = real.filter((p) => p.zone === z);
    const giants = zp.filter((p) => p.holdsGiants).map((p) => p.id);
    ok(giants.length === B3.placesV3.giantsPerLake, `${z}: exactly 3 holdsGiants places (got ${giants.join(', ')})`);
    ok(zp.filter((p) => p.legend).length === 1, `${z}: one legend place`);
    ok(zp.every((p) => !p.ownResident || p.holdsGiants), `${z}: residents only at holdsGiants places`);
    for (const p of zp) {
      ok(!p.rule || RULES3.includes(p.rule.type), `place ${p.id} rule type ${p.rule?.type}`);
      if (p.rule?.type === 'rhythm') ok(p.rule.period > p.rule.warn + p.rule.live && (!p.rule.periodDrip || p.rule.periodDrip > p.rule.warn + p.rule.live), `place ${p.id} rhythm period > warn + live`);
      if (p.maxClass) ok(p.maxClass in SZ.classMaxZ, `place ${p.id} maxClass ${p.maxClass}`);
      if (p.holdsGiants) ok(!p.maxClass || p.maxClass === 'elder', `place ${p.id} holds giants but caps below Elder`);
      // every place yields a no-bait species at its depth (calm, or at night for night places)
      const night = p.night || p.rule?.phases?.includes('gloomtide');
      const yields = S.filter((s) => s.zone === z && s.rarity !== 'legendary' && !s.bait && (!s.place || s.place === p.id) && (night || s.time !== 'gloom') && s.depth[0] <= p.water.depth[1] && p.water.depth[0] <= s.depth[1]);
      ok(yields.length >= 1, `place ${p.id} yields no bait-free species at its depth ${p.water.depth}${night ? ' at night' : ' in calm'}`);
      for (const sid of Object.keys(p.attract || {})) ok(byId[sid]?.zone === z, `place ${p.id} attracts ${sid}, not a ${z} species`);
    }
  }
  ok(['puffball_vent', 'votive_font'].every((id) => D.PLACE_V3_BY_ID[id].maxClass === 'prize'), 'fry water (the Puffball Vent, the Votive Font) caps at Prize');
  ok(D.PLACE_V3_BY_ID.lullaby.rule?.type === 'sight' && D.PLACE_V3_BY_ID.chain_garden.turnFavour === 0.6 && D.PLACE_V3_BY_ID.stilled_cascade.thaw?.time === 40, '§24 sync: the Lullaby becomes sight; the Chain Garden\'s Turn +0.6; the Stilled Cascade thaws 40 s in Shard-chime');
  ok(D.ARENA_V2.sporewood.places.find((p) => p.id === 'lullaby').rule?.type === 'sight' && W2.ARENA_V2.sporewood.places.find((p) => p.id === 'lullaby').rule === null, 'the sync is applied only in the v3 build');
  ok(D.ARENA_V2.paleabyss.lamps.find((l) => l.id === 'landing_lamp').name === 'Shore of Last Rafts' && W2.ARENA_V2.paleabyss.lamps.find((l) => l.id === 'landing_lamp').name === 'Landing of Last Rafts', '"Landing of Last Rafts" becomes "Shore of Last Rafts" in the v3 build only');
  // the Mossmere places on the arena: inside the lake, raft-reachable and castable (the walk / arena geometry helpers)
  const mz = D.ZONES[0], GM = D.walkGridFor(mz), RM = WL.raftMask(GM), RC = WL.component(GM, RM, GM.idx(mz.arena.spawn.x, mz.arena.spawn.z));
  ok(RC[GM.idx(mz.arena.spawn.x, mz.arena.spawn.z)] === 1, 'the Mossmere spawn is open raft water');
  const raftCells = []; for (let k = 0; k < GM.n * GM.n; k++) if (RC[k]) raftCells.push(WL.cellXZ(GM, k));
  const castMax0 = D.TACKLE.rod[0].castMax, minD = D.BALANCE.cast.minDist;
  for (const p of D.MOSSMERE_V3.places) {
    if (p.secret) { ok(Math.hypot(p.x, p.z) < mz.arena.radius + 8 && !!p.needs?.shoreNotch, `secret ${p.id} sits behind the shore and needs a shoreNotch`); continue; }
    const pts = []; const [x0, z0, x1, z1] = D.walkShapeBounds(p.water);
    for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (D.placeContains(p, x, zz) && Math.hypot(x, zz) < mz.arena.radius - 2) pts.push([x, zz]);
    const water = pts.filter(([x, zz]) => WL.isLakeWater(GM, GM.idx(x, zz)));
    const targets = p.dropIn ? pts : water;
    ok(pts.length > 0 && Math.hypot(p.x, p.z) < mz.arena.radius - 4, `Mossmere place ${p.id} must lie inside the lake`);
    ok(p.dropIn || water.length >= 4, `Mossmere place ${p.id} has only ${water.length} open water cells`);
    let castable = 0; for (const [x, zz] of targets) if (raftCells.some(([rx, rz]) => { const d = Math.hypot(rx - x, rz - zz); return d >= minD && d <= castMax0; })) castable++;
    ok(castable >= Math.min(3, targets.length), `Mossmere place ${p.id}: ${castable} cells castable from raft-reachable water on starter tackle (castMax ${castMax0})`);
    for (const t of p.rule?.targets || []) {
      const c = t.kind === 'rect' ? [t.x, t.z] : [t.x, t.z];
      ok(D.placeContains(p, c[0], c[1]), `Mossmere place ${p.id} target ${t.id} outside the place`);
      ok(p.dropIn || WL.isLakeWater(GM, GM.idx(c[0], c[1])), `Mossmere place ${p.id} target ${t.id} is not open water`);
      ok(raftCells.some(([rx, rz]) => { const d = Math.hypot(rx - c[0], rz - c[1]); return d >= minD && d <= castMax0; }), `Mossmere place ${p.id} target ${t.id} out of cast reach from the raft`);
    }
  }
  const realM = D.MOSSMERE_V3.places.filter((p) => !p.secret);
  for (let i = 0; i < realM.length; i++) for (let j = i + 1; j < realM.length; j++) {
    const a = realM[i], b = realM[j]; let overlap = false; const [x0, z0, x1, z1] = D.walkShapeBounds(a.water);
    for (let zz = z0; zz <= z1 && !overlap; zz += 0.5) for (let x = x0; x <= x1 && !overlap; x += 0.5) if (D.placeContains(a, x, zz) && D.placeContains(b, x, zz)) overlap = true;
    ok(!overlap || a.legend || b.legend, `Mossmere places ${a.id} and ${b.id} overlap`);
  }
  ok(near(D.MOSSMERE_V3.places.find((p) => p.id === 'cupped_hands'), D.MOSSMERE_V3.props[0]) < 0.01 && D.ZONES[0].arena.pillars.some((o) => o.kind === 'hands'), 'the Cupped Hands stand in the water as a new obstacle (v3 build)');
  ok(D.MOSSMERE_V3.places.find((p) => p.id === 'cupped_hands').rule.periodDrip === D.CONDITIONS.looks.mossmere.drip.aqueduct, 'in Drizzle the aqueduct coughs every 25 s');
  ok(D.ZONES[0].palette.accent === 0x8a4b3a && V1.ZONES[0].palette.accent !== 0x8a4b3a, 'the Mossmere leads with rust iron (v3 build only)');
  // names: brief names that echo §24 head nouns (warned, never renamed: the brief is the source of truth)
  const headN = (name) => { let s = String(name).replace(/\(.*?\)/g, '').trim(); const of = s.match(/^(.*?)\s+of\s+/i); if (of) s = of[1]; const w = s.split(/[\s-]+/).filter((x) => x && !/^(the|of|a|an|from|for|and|to|in|at|under)$/i.test(x)); return (w[w.length - 1] || '').replace(/['’]s$/, '').toLowerCase(); };
  const otherNouns = new Map();
  for (const z of D.ZONES.slice(1)) { const A = z.arena; for (const n2 of [...(A.walk?.shapes || []), ...(A.places || []), ...(A.lamps || []), ...(A.shortcuts || []), ...(A.deeds || []), ...(A.moorings || [])].map((x) => x.name).filter(Boolean)) otherNouns.set(headN(n2), `${z.id} "${n2}"`); }
  for (const p of D.MOSSMERE_V3.places) for (const nm of [p.name, p.rule?.name].filter(Boolean)) warn(!otherNouns.has(headN(nm)), `name: the Mossmere's "${nm}" shares the head noun '${headN(nm)}' with ${otherNouns.get(headN(nm))} (brief name kept)`);

  // ---- P4: Found Relics, age marks, Vistas, Remnants (brief §7.7, §6.4)
  const secretIds = [...D.MOSSMERE_V3.places.filter((p) => p.secret).map((p) => p.id), ...D.WALK_SYNC_V3.secrets.map((x) => x.id)];
  const rewards = [...D.MOSSMERE_V3.places.filter((p) => p.secret).map((p) => p.reward), ...D.WALK_SYNC_V3.secrets.map((x) => x.reward)];
  ok(D.FOUND_RELICS.length === 4 && D.FOUND_RELICS.every((r) => secretIds.includes(r.foundIn) && rewards.includes(r.id) && r.phase === 4), 'four Found Relics, one from each secret');
  ok(D.WALK_SYNC_V3.secrets.every((x) => D.FOUND_RELICS.some((r) => r.id === x.needs)) && D.FOUND_RELICS.find((r) => r.id === 'deep_line').underdepth.favour === 0.8, 'each secret needs the previous Found Relic; the Deep Line opens the Underdepth (+0.8)');
  ok(Object.keys(D.AGE_MARKS).length === 10 && Object.keys(D.AGE_MARKS).every((id) => byId[id] && byId[id].rarity !== 'legendary'), 'age marks on 10 headline species');
  ok(D.VISTAS.perLake === 2 && D.VISTAS.hold === 1.5 && D.VISTAS.sit === false && D.VISTAS.sketch === false && D.REMNANTS.total === D.REMNANTS.perLake * 4, 'Vistas: 2 per lake, raise the lantern 1.5 s, no sitting or sketching; 12 Remnants');

  // ---- conditions, rumours (brief §7.0–§7.1)
  ok(Object.values(D.CONDITIONS.odds).reduce((a, b) => a + b, 0) === 100 && D.CONDITIONS.odds.none === 40, 'conditions: none 40 · Hush 20 · Drip 20 · Mist 20');
  for (const z of LAKES) ok(D.WEATHER.every((w) => isStr(D.CONDITIONS.looks[z]?.[w]?.name)), `${z}: a look for every archetype`);
  ok(D.CONDITIONS.archetypes.hush.favour === FV.hour.hush && D.CONDITIONS.movesGeometry === false, 'Hush favour = the Hour term; no geometry-moving weather');
  ok(D.RUMOURS.length === 24 && new Set(D.RUMOURS.map((r) => r.id)).size === 24 && LAKES.every((z) => D.RUMOURS.filter((r) => r.zone === z).length === 6), '24 rumours, 6 per lake');
  for (const r of D.RUMOURS) {
    ok(Array.isArray(r.tiers) && r.tiers.length === 3 && r.tiers.every((t) => isStr(t) && t.length <= 120), `rumour ${r.id}: three tiers (vague → place → condition), ≤ 120 chars`);
    if (r.place) ok(D.PLACE_V3_BY_ID[r.place]?.zone === r.zone, `rumour ${r.id} place ${r.place}`);
    if (r.species) ok(byId[r.species]?.zone === r.zone, `rumour ${r.id} species ${r.species}`);
    if (r.secret) ok(D.WALK_SYNC_V3.secrets.some((s) => s.id === r.secret && s.zone === r.zone), `rumour ${r.id} secret ${r.secret}`);
    ok(!!(r.place || r.secret), `rumour ${r.id} points nowhere`);
  }
  for (const s of S.filter((x) => x.place)) ok(D.RUMOURS.some((r) => r.species === s.id), `kept species ${s.id} needs a rumour`);
  ok(D.TODAYS_RUMOUR.giantsOnly && D.TODAYS_RUMOUR.favour === FV.match.rumour, 'today\'s rumour names a giant place, favour +0.3');

  // ---- the Landing (brief §3.7)
  const C = D.COVE, CA = C.arena;
  ok(!D.ZONE_BY_ID.cove && !D.ZONES.some((z) => z.id === 'cove') && C.id === 'cove' && C.hub === true, 'COVE is not in ZONES / ZONE_BY_ID');
  const SN = CA.shoreNotch[0], legX = C.seaGate.legs.map((l) => l.x), archX = (legX[0] + legX[1]) / 2;
  ok(CA.radius === 42 && CA.seed === 7707 && CA.layout === 'cove' && CA.shoreNotch.length === 1 && isNum(SN.a) && isNum(SN.w) && isNum(SN.depth) && isNum(SN.len), 'the cove: R 42, seed 7707, one shoreNotch {a, w, depth, len}');
  ok(Math.abs(CA.radius * Math.cos(SN.a * Math.PI / 180) - archX) <= 0.5 && Math.sin(SN.a * Math.PI / 180) < -0.95, `the channel notch (a ${SN.a}°) lines up with the arch centre x ${archX} (x at R = ${(CA.radius * Math.cos(SN.a * Math.PI / 180)).toFixed(1)})`);
  ok(C.theme === 'cove' && C.index === -1, 'COVE carries theme "cove" (no Mossmere set-pieces by index fallback)');
  for (const k of [...PALETTE_KEYS, 'lamp']) ok(k in C.palette, `COVE.palette.${k}`);
  for (const [k, v] of Object.entries(C.palette)) if (k !== 'fogDensity') palCheck(`COVE.palette.${k}`, v);
  for (const k of Object.keys(D.ZONES[0].grade)) ok(k in C.grade, `COVE.grade.${k}`);
  for (const w of C.waystones) { palCheck(`COVE.waystones.${w.zone}`, w.colour); ok(LAKES.includes(w.zone), `waystone ${w.zone}`); }
  ok(JSON.stringify(C.waystones.map((w) => w.colour)) === JSON.stringify([0xb0603e, 0xffb46a, 0x5cbcff, 0xe8c66a]) && C.waystones.filter((w) => w.litAtStart).length === 1, 'Waystone colours rust / amber / sapphire / ember-gold; the Mossmere\'s lit from the start');
  const sum = (o) => Object.entries(o).filter(([k]) => !['total', 'cap'].includes(k)).reduce((a, [, v]) => a + v, 0);
  ok(sum(C.budget.high) === C.budget.high.total && C.budget.high.total <= C.budget.high.cap && sum(C.budget.low) === C.budget.low.total && C.budget.low.total <= C.budget.low.cap, `cove draw calls ${sum(C.budget.high)} / ${sum(C.budget.low)} (budget 140 / 100)`);
  ok(C.lights.max <= 4 && C.lights.list.length <= 4, '≤ 4 PointLights at the Landing');
  // walk layout: §24's rules on COVE.walk (reachability, enclosure, paths, 14 m south clearance)
  for (const sh of CA.walk.shapes) {
    if (sh.kind === 'path') {
      ok(sh.w >= 2.4 - 1e-9, `COVE walkway ${sh.id} narrower than 2.4 m`);
      for (let i = 0; i + 1 < sh.pts.length; i++) { const [ax, az, ay = sh.y ?? 0] = sh.pts[i], [bx, bz, by = sh.y ?? 0] = sh.pts[i + 1]; ok(Math.abs(by - ay) / Math.hypot(bx - ax, bz - az) <= D.BALANCE.walk.maxSlope + 1e-9, `COVE ramp ${sh.id} steeper than ${D.BALANCE.walk.maxSlope}`); }
    }
    const [x0, z0, x1, z1] = sh.kind === 'rect' && !sh.yaw ? [sh.x - sh.w / 2, sh.z - sh.d / 2, sh.x + sh.w / 2, sh.z + sh.d / 2] : D.walkShapeBounds(sh);
    ok(Math.max(Math.hypot(x0, z0), Math.hypot(x1, z0), Math.hypot(x0, z1), Math.hypot(x1, z1)) <= CA.radius - 1, `COVE shape ${sh.id} reaches the cliff`);
  }
  for (const openK of [false, true]) {
    const G = D.walkGridFor(C, { open: openK ? { cove_stair: true } : {} }), M = WL.erode(G);
    const seed = WL.snap(G, M, CA.spawn.x, CA.spawn.z, 1.5), dist = WL.walkDistances(G, C, [seed], M);
    const reach = (p, r = 0.8) => { const k = WL.snap(G, M, p.x, p.z, r); return k >= 0 ? dist[k] : Infinity; };
    const label = `COVE [stair ${openK ? 'open' : 'silted'}]`;
    ok(seed >= 0, `${label}: the hearth spawn fits the Wick`);
    for (const st of C.stations) {
      if (st.needs === 'cove_stair' && !openK) continue;
      if (st.id === 'murk') { let best = Infinity; for (let k = 0; k < G.n * G.n; k++) if (M[k] && dist[k] < Infinity) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - st.x, zz - st.z) <= st.range - 0.5) best = Math.min(best, dist[k]); } ok(best < Infinity, `${label}: no walkway within trade range of Murk's barge`); continue; }
      if (st.id === 'raft') { const m = CA.moorings[0]; ok(reach(m.stand) < Infinity && near(m.stand, m.slot) - D.BALANCE.move.raftRadius <= D.BALANCE.walk.board.range, `${label}: the raft mooring`); continue; }
      const d = reach(st, st.id === 'pond' ? CA.walk.holes[0].r + 1.2 : D.BALANCE.walk.interactRange + 0.4);
      ok(d < Infinity, `${label}: station ${st.id} unreachable`);
      if (!openK) ok(d <= 30, `${label}: station ${st.id} is ${d.toFixed(1)} m from the hearth (every station within ≈ 5 s at ${C.walkSpeed} m/s)`);
    }
    const gal = reach({ x: -20, z: -10 }), up = reach({ x: -20, z: -18.5 });
    ok(gal < Infinity, `${label}: the Lower Gallery is reachable (ramp)`);
    ok(openK ? up < Infinity : up === Infinity, `${label}: the Upper Gallery is ${openK ? 'reachable once the stair is dug out' : 'closed while the stair is silted'}`);
    // the lower and upper walls are viewable from their galleries
    ok(reach({ x: -24, z: -13.5 }) < Infinity && (!openK || reach({ x: -12, z: -20.5 }) < Infinity), `${label}: the walls are reachable from their galleries`);
    if (!openK) {
      let leaks = 0, cliff = 0, tall = 0; const F2 = D.WALK_FLAGS, n = G.n, O = C.lowSouth;
      for (let k = 0; k < n * n; k++) {
        if (G.flags[k] & F2.POOL) { const i = k % n, j = (k / n) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (G.flags[(j + dj) * n + i + di] & F2.WATER && !(G.flags[(j + dj) * n + i + di] & F2.GROUND)) leaks++; }
        if (!WL.isWalk(G, k) || !(dist[k] < Infinity)) continue;
        const [x, zz] = WL.cellXZ(G, k), y = G.top[k];
        for (let dzz = 0.5; dzz <= O.dist; dzz += 1) for (let dx = -O.halfW; dx <= O.halfW; dx += 1) {
          const q = G.idx(x + dx, zz + dzz); if (q < 0 || (G.flags[q] & F2.VOID)) { cliff++; continue; }
          if ((G.flags[q] & F2.GROUND) && G.top[q] > y + O.max + 1e-6) tall++;
        }
      }
      ok(leaks === 0, `COVE: the keep-pond is enclosed (${leaks} pool cells touch open water)`);
      ok(cliff === 0, `COVE: ${cliff} samples within ${O.dist} m south of a walkway hit the cliff (the portrait camera must stay inside the ring)`);
      ok(tall === 0, `COVE: ${tall} samples within ${O.dist} m south of a walkway rise > ${O.max} m above it`);
      const pond = CA.walk.holes[0];
      ok(near(pond, C.stations.find((s) => s.id === 'pond')) < 0.01 && pond.depth === 0.7 && pond.r === 2.8 && pond.rTier3 === 4.0, 'the keep-pond: centre (−16, 3.5), r 2.8 (4.0 at tier 3), depth 0.7');
    }
  }
  // the Long Wall: one frame per non-legendary species; every wing packs into 12 × 3.6 m as three rows, largest lowest
  for (const z of LAKES) {
    const sp = S.filter((s) => s.zone === z && s.rarity !== 'legendary');
    const fr = sp.map((s) => ({ id: s.id, ...D.frameFor(s) }));
    const boards = fr.filter((f) => f.id === 'board'), frames = [...fr.filter((f) => f.id !== 'board').map((f) => f.width), ...Array.from({ length: Math.ceil(boards.length / 4) }, () => C.frames[0].width)];
    ok(fr.every((f) => f.id !== 'great' || z === 'paleabyss'), `${z}: great arches only in the Pallid wing`);
    for (const f of fr.filter((x) => x.id !== 'board')) { const t = C.frames.find((c) => c.id === f.id); ok(f.width >= t.widthRange[0] - 0.01 && f.width <= t.widthRange[1] + 0.01, `frame ${f.id} for ${f.id === 'great' ? 'a great arch' : f.id}: ${f.width} m outside ${t.widthRange}`); }
    const W = C.wings[z].x[1] - C.wings[z].x[0];
    const items = [...fr.filter((f) => f.id !== 'board').map((f) => ({ w: f.width, h: f.height })), ...Array.from({ length: Math.ceil(boards.length / 4) }, () => ({ w: C.frames[0].width, h: C.frames[0].height }))];
    const rows = [0, 0, 0], counts = [0, 0, 0], heights = [0, 0, 0];
    for (const it of items.sort((a, b) => b.w - a.w)) { let placed = false; for (let r = 0; r < C.wing.rows && !placed; r++) { const need = rows[r] + (counts[r] ? C.wing.gap : 0) + it.w; if (need <= W + 1e-6) { rows[r] = need; counts[r]++; heights[r] = Math.max(heights[r], it.h); placed = true; } } ok(placed, `${z} wing: a ${it.w.toFixed(2)} m frame does not fit in 3 rows of ${W} m`); }
    const hSum = heights.reduce((a, b) => a + b, 0) + (C.wing.rows - 1) * C.wing.rowGap;
    ok(hSum <= C.wing.h + 1e-6, `${z} wing: rows ${heights.map((h) => h.toFixed(2)).join(' / ')} m tall need ${hSum.toFixed(2)} m (≤ ${C.wing.h})`);
    ok(fr.every((f) => isNum(f.height) && f.height > 0 && ['side', 'dorsal', 'hanging'].includes(f.view)), `${z}: every frame has a height and a mount view`);
  }
  ok(within(D.frameFor(byId.gilt_eyed_eel).width + D.frameFor(byId.candlewake_sturgeon).width + D.frameFor(byId.wax_bearer).width + 2 * C.wing.gap, 12.0, 0.05), 'the widest row: the Pallid\'s three great arches at 12.0 m');
  ok(JSON.stringify(C.walls.chimney.wanderers) === '["pilgrim_salmon","hearthfish"]', 'the two Wanderers hang on the chimney breast');
  { const ch = C.walls.chimney, cw = ch.x[1] - ch.x[0], wf = ch.wanderers.map((id) => D.frameFor(byId[id]));
    ok(cw >= 3 - 1e-9 && ch.wall === 'lower' && ch.x[0] <= C.stations.find((x) => x.id === 'hearth').x && ch.x[1] >= C.stations.find((x) => x.id === 'hearth').x, `the chimney breast is ${cw} m of the lower wall behind the hearth (≥ 3 m)`);
    ok(wf.every((f) => f.width <= cw + 1e-9) && wf.reduce((a, f) => a + f.height, 0) + C.wing.rowGap <= C.wing.h, `both Wanderer frames fit the chimney breast stacked (${wf.map((f) => `${f.width}×${f.height}`).join(', ')} m)`);
    ok(within(D.frameFor(byId.pilgrim_salmon).reach, D.reachOf(byId.pilgrim_salmon, 'paleabyss') / 100, 0.01), 'Wanderer frames size from their largest reach (the Pilgrim Salmon\'s Pallid 206 cm)');
    const wl = Object.values(C.wings).filter((w) => w.wall === 'lower').map((w) => w.x).concat([ch.x]).sort((a, b) => a[0] - b[0]);
    ok(wl.every((x, i) => i === 0 || within(x[0], wl[i - 1][1], 1e-9)) && within(wl[0][0], C.walls.lower.x[0], 1e-9) && within(wl[wl.length - 1][1], C.walls.lower.x[1], 1e-9), 'the lower wall is exactly Mossmere wing + chimney breast + Sporewood wing'); }
  ok(within(C.walkSpeed, D.BALANCE.walk.speedMult * D.STATS.moveSpeed.base, 0.01), `COVE.walkSpeed ${C.walkSpeed} must be §24's foot speed (${(D.BALANCE.walk.speedMult * D.STATS.moveSpeed.base).toFixed(2)} m/s)`);

  // ---- save migration (brief Pg3)
  const RN = D.RENAMES;
  for (const [a, b] of Object.entries(RN.species)) ok(V1.SPECIES_BY_ID[a] && D.SPECIES_BY_ID[b] && !D.SPECIES_BY_ID[a], `rename species ${a} → ${b}`);
  for (const [a, b] of Object.entries(RN.baits)) ok(V1.BAIT_BY_ID[a] && D.BAIT_BY_ID[b] && !D.BAIT_BY_ID[a] && D.SPECIES_BY_ID.lantern_swallower.bait === b, `rename bait ${a} → ${b}`);
  for (const [a, b] of Object.entries(RN.supplies)) ok(V1.SUPPLY_BY_ID[a] && D.SUPPLY_BY_ID[b] && !D.SUPPLY_BY_ID[a], `rename supply ${a} → ${b}`);
  for (const id of RN.relicsRefunded) ok(V1.RELIC_BY_ID[id] && !D.RELIC_BY_ID[id], `refunded relic ${id}`);
  for (const r of [...V1.RELICS, ...V1.WALK_RELICS]) ok(D.RELIC_BY_ID[r.id] || RN.relicsRefunded.includes(r.id), `relic ${r.id} neither kept nor refunded`);
  for (const s of [...V1.SPECIES, ...V1.WALK_SPECIES]) ok(D.SPECIES_BY_ID[s.id] || RN.species[s.id], `species ${s.id} neither kept nor renamed (saves would lose it)`);
  for (const b of V1.BAITS) ok(D.BAIT_BY_ID[b.id] || RN.baits[b.id], `bait ${b.id} neither kept nor renamed`);
  for (const s of V1.SUPPLIES) ok(D.SUPPLY_BY_ID[s.id] || RN.supplies[s.id], `supply ${s.id} neither kept nor renamed`);
  for (const c of [...V1.CHALLENGES, ...V1.WALK_CHALLENGES]) ok(!!D.CHALLENGE_BY_ID[c.id], `challenge ${c.id} lost (saves keep challenges by id)`);
  for (const c of [...V1.CHARACTERS, ...V1.WALK_CHARACTERS]) ok(!!D.CHARACTER_BY_ID[c.id], `Wick ${c.id} lost`);
  const upMap = [RN.upgradesToOutfit, RN.upgradesToTackle, RN.upgradesToLures].flatMap((m) => Object.keys(m));
  for (const u of [...V1.UPGRADES, ...V1.WALK_UPGRADES]) ok([...upMap, ...RN.upgradesCut, ...RN.combatKit].filter((x) => x === u.id).length === 1, `upgrade ${u.id} must map to exactly one of outfit / tackle / lures / cut / combat kit`);
  for (const [u, o] of Object.entries(RN.upgradesToOutfit)) ok(D.OUTFIT.some((x) => x.id === o && x.from === u), `outfit ${o} from ${u}`);
  for (const [u, l] of Object.entries(RN.upgradesToLures)) ok(D.LURES.some((x) => x.id === l && x.from === u), `lure ${l} from ${u}`);
  ok(JSON.stringify(RN.combatKit) === JSON.stringify(D.COMBAT_KIT.ids), 'the combat kit list matches');
  for (const [a, b] of Object.entries(RN.names)) ok(isStr(a) && isStr(b) && a !== b, `rename name ${a}`);

  // ---- originality guardrails (brief §13.3) on every v3 display string
  const G3 = [/\bpale\s+[A-Z][a-z]+/, /\bcollector\b/i, /bottled light/i, /\b(bronze|silver|gold|diamond)\s+(medal|tier|rank)\b/i, /\b(morphs?|aberrant|aberration|sanity|panic|spoil(ed|age)?)\b/i, /\bmarrow\b/i, /\bhallow/i];
  const seen3 = new Set();
  const scan3 = (v, path) => {
    if (typeof v === 'string') { for (const re of G3) if (re.test(v)) errors.push(`originality (v3): "${v.slice(0, 70)}" at ${path} matches ${re}`); return; }
    if (!v || typeof v !== 'object' || seen3.has(v)) return; seen3.add(v);
    for (const [k, c] of Object.entries(v)) if (!/^(id|icon|behavior|style|weapon|model|shape|type|trigger|mechanic|renamedFrom|from)$/.test(k)) scan3(c, `${path}.${k}`);
  };
  for (const k of V3_TEXT_EXPORTS.filter((x) => x !== 'RENAMES')) scan3(D[k], k);
  scan3(D.SPECIES.map((s) => ({ name: s.name, epithet: s.epithet, hint: s.hint, lore: s.lore })), 'SPECIES');
  checks++;

  // ---- phases (DESIGN §25.14.1, CONTRACT §13.0): each phase's build carries exactly its data, with and without §24
  const PH = {};
  { const f0 = [globalThis.GW_WALK, globalThis.GW_V3, globalThis.GW_V3_PHASE];
    for (const walk of [false, true]) for (const p of [1, 2, 3, 4]) {
      globalThis.GW_WALK = walk; globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = p;
      PH[`${walk ? 'w' : 'r'}${p}`] = await import(`../src/data.js?v3p${p}${walk ? 'w' : 'r'}`);
    }
    [globalThis.GW_WALK, globalThis.GW_V3, globalThis.GW_V3_PHASE] = f0; }
  const EXPECT = { species: { r: [32, 36, 39, 41], w: [40, 44, 47, 53] }, challenges: { r: [30, 30, 38, 38], w: [40, 40, 48, 48] }, mossPlaces: [0, 8, 8, 9] };
  for (const [key, R] of Object.entries(PH)) {
    const walk = key[0] === 'w', p = +key[1], tag = `v3 P${p}${walk ? ' + §24' : ' (raft)'}`;
    ok(R.V3_PHASE === p && R.WALK_ENABLED === walk, `${tag}: evaluated with the intended flags`);
    ok(R.SPECIES.length === EXPECT.species[key[0]][p - 1], `${tag}: ${R.SPECIES.length} species (expected ${EXPECT.species[key[0]][p - 1]})`);
    ok(R.SPECIES.every((s) => (s.src === 'walk' ? walk : s.phase <= p)), `${tag}: every species belongs to this phase (or arrives with §24)`);
    ok(R.CHALLENGES.length === EXPECT.challenges[key[0]][p - 1] && (p >= 3) === !!R.CHALLENGE_BY_ID.first_prize, `${tag}: challenges ${R.CHALLENGES.length} (v1 / §24 sets until P3, the 48 from P3)`);
    ok((p >= 3) === !R.RELIC_BY_ID.old_debt && (p >= 3) === !!R.RELIC_BY_ID.measuring_cord, `${tag}: relic cuts, shelves and costs only from P3 (the refund lands with Pg3)`);
    ok(Object.keys(R.BALANCE_V3).every((k) => ((R.V3_BLOCK_PHASE[k] ?? 1) <= p) === (k in R.BALANCE)), `${tag}: BALANCE_V3 blocks join BALANCE by V3_BLOCK_PHASE`);
    ok(R.FISH_SHAPES.includes('sturgeon') === (p >= 2), `${tag}: the sturgeon shape from P2`);
    ok((R.ZONES[0].arena.places || []).length === EXPECT.mossPlaces[p - 1] && R.ZONES[0].arena.pillars.some((o) => o.kind === 'hands') === (p >= 2), `${tag}: the Mossmere's places and props from P2 (the Moon Cistern P4)`);
    ok(R.ZONES.every((z) => !!z.homeward === (p >= 3)), `${tag}: Homeward stones from P3`);
    ok(R.BAIT_BY_ID.last_candle && !R.BAIT_BY_ID.pale_marrow && R.SPECIES_BY_ID.lantern_swallower && R.SUPPLY_BY_ID.murks_chum && R.BOUNTY_BY_ID.spot_catch.type === 'signCatch', `${tag}: renames (Pg0 migrates ids in P1), Murk's Chum and the sign bounty from P1`);
    ok(R.TIPS.filter((t) => t.id.startsWith('v3_')).every((t) => t.phase <= p), `${tag}: tips of later phases are not in the build`);
    ok(R.CHALLENGE_BY_ID.complete_chronicle.params.n === R.SPECIES.length, `${tag}: the Chronicle asks for every species in the build`);
    // every lake has exactly 3 giant sources (its holdsGiants places, else the raft stopgap) and 2 watch lamps
    for (const z of R.ZONES) {
      const gp = (z.arena.places || []).filter((q) => q.holdsGiants && !q.secret).length, gs = (z.arena.giantSpots || []).length;
      ok((gp > 0) !== (gs > 0) && (gp || gs) === 3, `${tag} ${z.id}: 3 giant sources (places ${gp}, stopgap ${gs})`);
      const lamps = z.id === 'mossmere' || !walk ? (z.arena.watchLamps || []) : (R.ARENA_V2[z.id]?.lamps || []).filter((l) => l.watch);
      ok(lamps.length === 2 && lamps.every((l) => l.radius === R.BALANCE_V3.nightModes.lampWatch.radius), `${tag} ${z.id}: two watch lamps with pool r 6 (got ${lamps.length})`);
      // lamp-watch costs the giants: no holdsGiants water (place or stopgap) within fishWithin of a watch lamp
      const fw = R.BALANCE_V3.nightModes.lampWatch.fishWithin;
      for (const l of lamps) {
        let dmin = Infinity;
        for (const q of (z.arena.places || []).filter((x) => x.holdsGiants && !x.secret)) { const [x0, z0, x1, z1] = R.walkShapeBounds(q.water, fw + 1); for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (R.placeContains(q, x, zz)) dmin = Math.min(dmin, Math.hypot(x - l.x, zz - l.z)); }
        for (const g of z.arena.giantSpots || []) dmin = Math.min(dmin, Math.max(0, Math.hypot(g.x - l.x, g.z - l.z) - (Array.isArray(g.r) ? g.r[1] : g.r)));
        ok(dmin >= fw, `${tag} ${z.id}: watch lamp ${l.id} is ${dmin.toFixed(1)} m from giant water (≥ ${fw} m: a lamp-watch costs the night's giants)`);
      }
    }
  }
  ok(!('V3_PHASE' in V1) || V1.V3_PHASE === 4, 'V3_PHASE defaults to 4 (tools see the whole design)');
  // raft fallbacks: open water, clear of docks and the gate; Homeward stones placed as the §24 ones are
  for (const [zid, F] of Object.entries(D.RAFT_FALLBACK_V3)) {
    const Z1 = V1.ZONE_BY_ID[zid], L = WLY.buildLayout(Z1), obs = [...L.obstacles, ...L.gateObstacles];
    ok(F.giants.length === 3 && F.giants[0].kind === 'ring' && near(F.giants[0], Z1.arena.legendPool) < 0.01, `${zid} stopgap: the legend-pool rim + 2 more giant waters`);
    for (const g of F.giants.slice(1)) {
      const r = g.r; let open = 0, n = 0;
      for (let a = 0; a < 360; a += 30) for (const rr of [0, r / 2, r]) { n++; if (WLY.isOpenWaterL(L, obs, g.x + rr * Math.cos(a * Math.PI / 180), g.z + rr * Math.sin(a * Math.PI / 180), 0.3)) open++; }
      ok(open / n >= 0.9 && !L.docks.some((d) => near(d, g) < r + 4) && near(g, L.spawn) >= 16, `${zid} stopgap ${g.id}: open water clear of docks and the spawn (${open}/${n})`);
    }
    if (zid === 'mossmere') { ok(F.until === 2, 'the Mossmere stopgap ends in P2'); continue; }
    for (const l of F.watchLamps) ok(near(L.docks[l.dock].buoy, l) < 0.1, `${zid} raft watch lamp ${l.id} is its dock's drawn buoy-lamp`);
    const st = F.homeward, A1 = Z1.arena;
    ok(near(st, L.spawn) >= E3.homeward.minPathFromSpawn && WLY.isOpenWaterL(L, obs, st.x, st.z, E3.homeward.radius + 0.6) && !L.docks.some((d) => near(d, st) < HCL.bargePad || near(d.buoy, st) < HCL.buoy || d.posts.some((q) => near(q, st) < HCL.post)), `${zid} raft Homeward stone (${st.x}, ${st.z}): open water ≥ 25 m from the spawn, clear of barge, buoy and posts`);
    ok(A1 && true, `${zid} raft arena`);
  }

  // ---- Elder seals: every species that can earn one has a route (kept place with giantsKept or holdsGiants; else a holdsGiants
  // place, or raft builds' stopgap water, whose depth band and hours it can use)
  const elderRoute = (R, sp, depthOfSpot) => {
    const zs = sp.zones?.length ? sp.zones : [sp.zone];
    const overlap = (band) => sp.depth[0] <= band[1] && band[0] <= sp.depth[1];
    const placesOf = (z) => (R.ZONE_BY_ID[z]?.arena?.places || []).filter((q) => !q.secret);
    if (sp.place) { const q = zs.flatMap(placesOf).find((x) => x.id === sp.place); return !!q && !!(q.holdsGiants || q.giantsKept) && overlap(q.water.depth); }
    for (const z of zs) {
      for (const q of placesOf(z)) if (q.holdsGiants && overlap(q.water.depth) && !(q.giantsDuring === 'moonfall' && sp.time === 'gloom')) return true;
      for (const g of R.ZONE_BY_ID[z]?.arena?.giantSpots || []) if (overlap(depthOfSpot(z, g))) return true;
    }
    return false;
  };
  const spotDepth = {};
  const depthOfSpot = (z, g) => {
    const key = `${z}:${g.id}`; if (spotDepth[key]) return spotDepth[key];
    const L = WLY.buildLayout(V1.ZONE_BY_ID[z]), obs = [...L.obstacles, ...L.gateObstacles], R2 = Array.isArray(g.r) ? g.r : [0, g.r]; let lo = 9, hi = -9;
    for (let a = 0; a < 360; a += 10) for (let r = R2[0]; r <= R2[1]; r += 0.5) { const x = g.x + r * Math.cos(a * Math.PI / 180), zz = g.z + r * Math.sin(a * Math.PI / 180); if (!WLY.isOpenWaterL(L, obs, x, zz, 0.3)) continue; const d = WLY.depthAt(L, x, zz); lo = Math.min(lo, d); hi = Math.max(hi, d); }
    return (spotDepth[key] = [lo, hi]);
  };
  for (const [R, tag] of [[D, 'v3 + §24'], [NW, 'v3 raft (no §24)']]) {
    const miss = R.SPECIES.filter((sp) => R.sealsFor(sp).includes('elder') && !elderRoute(R, sp, depthOfSpot)).map((sp) => sp.id);
    ok(miss.length === 0, `${tag}: Elder seals with no Elder water: ${miss.join(', ')}`);
  }
  ok(['cupped_hands', 'gatehouse_door'].every((id) => D.PLACE_V3_BY_ID[id].giantsKept) && ['drowned_greenhouse', 'veilwater', 'bell_window', 'stilled_cascade', 'long_pier', 'sunken_belfry', 'bier_barge'].every((id) => D.PLACE_V3_BY_ID[id].giantsKept) && D.PLACES_V3.filter((q) => q.giantsKept).every((q) => !q.holdsGiants && S.some((x) => x.place === q.id)), 'giantsKept on exactly the places whose kept species had no Elder water (and never on a giant place)');
  ok(JSON.stringify(D.PLACE_V3_BY_ID.lullaby.water.depth) === '[0.4,0.85]' && JSON.stringify(D.PLACE_V3_BY_ID.ferry_slip.water.depth) === '[0.45,0.95]' && JSON.stringify(D.ARENA_V2.paleabyss.places.find((q) => q.id === 'ferry_slip').water.depth) === '[0.45,0.95]' && JSON.stringify(W2.ARENA_V2.paleabyss.places.find((q) => q.id === 'ferry_slip').water.depth) !== '[0.45,0.95]', 'shallow giant water (▲): the Lullaby rim and the Ferry Slip ramp, applied only in v3');

  // ---- the Mossmere's places against world-layout (the arena the raft actually sails)
  { const LM = WLY.buildLayout(D.ZONES[0]), obsM = [...LM.obstacles, ...LM.gateObstacles], islands = LM.obstacles.filter((o) => o.kind === 'island');
    for (const q of D.MOSSMERE_V3.places.filter((x) => !x.secret)) {
      const w = q.water;
      if (w.kind === 'disc') for (const o of islands) ok(Math.hypot(o.x - w.x, o.z - w.z) >= o.r + w.r - (q.dropIn ? w.r : 0), `Mossmere place ${q.id} overlaps an island's collision (${o.x}, ${o.z})`);
      let n = 0, open = 0; const [x0, z0, x1, z1] = D.walkShapeBounds(w);
      for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (D.placeContains(q, x, zz)) { n++; if (WLY.isOpenWaterL(LM, obsM, x, zz, 0.3)) open++; }
      if (!q.dropIn) ok(open / n >= 0.8, `Mossmere place ${q.id}: only ${(100 * open / n).toFixed(0)}% of its water is open in world-layout (≥ 80%)`);
      for (const t of (q.dropIn ? q.rule.targets : [])) ok(WLY.isOpenWaterL(LM, obsM, t.x, t.z, B3.placesV3.dropIn.centreOpenMargin), `Mossmere dropIn target ${q.id}.${t.id}: its centre must be open water (margin ${B3.placesV3.dropIn.centreOpenMargin})`);
      ok(isObj(q.tallyAt) && WLY.isOpenWaterL(LM, obsM, q.tallyAt.x, q.tallyAt.z, 1.0) && !D.MOSSMERE_V3.places.some((x) => !x.secret && D.placeContains(x, q.tallyAt.x, q.tallyAt.z)), `Mossmere place ${q.id}: its Tally Post stone stands in open water outside every place`);
      ok(isObj(q.landmark) && isNum(q.landmark.y) && D.landmarkOf(q).x === q.landmark.x, `Mossmere place ${q.id} has a landmark for the trophy camera`);
    }
    const bowl = D.PLACE_V3_BY_ID.cupped_hands.bowl, hands = D.MOSSMERE_V3.props.find((o) => o.kind === 'hands');
    ok(bowl.dropIn && bowl.y === 0 && near(bowl, hands) + bowl.r <= hands.r, 'the Cupped Hands\' bowl is a water-level (y 0) dropIn pool inside the hands\' collision');
    const lane = D.PLACE_V3_BY_ID.sluice_run.rule.lane, gate = LM.gate;
    ok(Math.min(...lane.map(([x, zz]) => Math.hypot(x - gate.x, zz - gate.z))) >= gate.radius * 1.2 + 2.5, `the Sluice Run's lane starts ${Math.min(...lane.map(([x, zz]) => Math.hypot(x - gate.x, zz - gate.z))).toFixed(1)} m from the gate (clear of its pill and stone ring)`);
    const MF = D.MOSSMERE_V3.happening, discs = MF.clear.discs;
    ok(MF.owner === 'progression' && discs.length === 2 && discs.every((c) => { const q = D.PLACE_V3_BY_ID[c.place]; const [rx, rz, rw, rh] = c.paint.rect; return q && rx <= c.x - c.r + 1e-9 && rz <= c.z - c.r + 1e-9 && rx + rw >= c.x + c.r - 1e-9 && rz + rh >= c.z + c.r - 1e-9 && D.placeContains(q, c.x, c.z); }) && new Set(discs.map((c) => c.paint.cell)).size === 2, 'Moonfall: two clear discs in their places, each with its own painting cell covering it');
    ok(near(D.MOSSMERE_V3.cracks[0], D.PLACE_V3_BY_ID.ferry_market) < 0.01 && near(D.MOSSMERE_V3.landmarks.find((l) => l.id === 'moon_eye'), D.PLACE_V3_BY_ID.ferry_market) < 0.01, 'the Moon-Eye\'s authored crack and landmark stand over the Ferry-Market');
    ok(D.MOSSMERE_V3.redress.reduce((a, r) => a + r.calls, 0) === 4 && D.PLACE_V3_BY_ID.buoy_lights.build.includes('y 0'), 'the harbour re-dress (W9) is 4 calls; the buoy-lanterns draw at the surface'); }

  // ---- the reel: every species that can be an Elder lands an Ancient on full T4 inside ≈ 3 min (skilled, k 160)
  { const RT = SZ.reel.targets, KR = 160, slow = [];
    const mulR = (a) => function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (const sp of S.filter((x) => D.sealsFor(x).includes('elder') && !RT.knownGaps[x.id])) {
      const c = SIM.CLASSES[5], zone = sp.zone ?? sp.zones[0], d = SIM.scaleDifficulty(sp.difficulty, sp.behavior, c.z, zone), g = SIM.loadout(4);
      let seed = 0; for (const ch of sp.id + 'skilled' + g.id + c.z) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
      const rng = mulR(seed), ts = []; let to = 0;
      for (let i = 0; i < KR; i++) { const r = SIM.fight({ ...sp, zone }, d, g, SIM.SK.skilled, c.ci, c.z, rng); if (r.landed) ts.push(r.time); else if (r.reason === 'timeout') to++; }
      ts.sort((a, b) => a - b); const med = ts.length ? ts[ts.length >> 1] : Infinity;
      if (!(med <= RT.ancientMedian * RT.ancientTolerance) || to / KR >= RT.maxTimeouts) slow.push(`${sp.id} (median ${Math.round(med)} s, ${to} time-outs)`);
    }
    ok(slow.length === 0, `Ancients on full T4 (skilled) must land within ${RT.ancientMedian} × ${RT.ancientTolerance} s with < ${100 * RT.maxTimeouts}% time-outs: ${slow.join('; ')}`);
    ok(Object.keys(RT.knownGaps).every((id) => byId[id]), 'reel known gaps name real species'); }

  // ---- tackle stats and the P1–P2 tier mapping
  { const t0 = D.tackleStats({}), g0 = SIM.loadout(0), t4 = D.tackleStats({ rod: 4, line: 4, reel: 4, creel: 4 }, 'firm');
    ok(t0.slackTime === g0.slackTime && t0.shock === g0.shock && t0.absorb === g0.dragQ && t0.lineStrength === g0.LS && t0.reelSpeed === g0.RS && t0.pipBonus === g0.pipBonus && t0.dragAt === 0.8, 'tackleStats(T0) is the reel sim\'s T0 loadout (slack 1.4: tiers replace the STATS base)');
    ok(t4.dragAt === 0.9 && t4.creelSize === 8 && within(t4.slackTime, 2.4, 1e-9), 'tackleStats(T4, firm): drag preset from Reel T2, Silverthread adds slack');
    const ups = Object.fromEntries(D.UPGRADES.map((u) => [u.id, u.maxLevel]));
    ok(JSON.stringify(D.upgradeTiers({})) === '{"rod":0,"line":0,"reel":0,"creel":0}' && JSON.stringify(D.upgradeTiers(ups)) === '{"rod":4,"line":4,"reel":4,"creel":4}', 'upgradeTiers: no upgrades → T0, every level → T4');
    for (const k of ['shock', 'absorb', 'pipBonus', 'dragAt']) ok(k in D.STATS && !(k in V1.STATS) && !(k in W2.STATS), `STATS.${k} exists only in v3 builds`); }

  // ---- cameras: every framing preset carries render's full parameter set
  for (const [k, c] of Object.entries(B3.cameras)) {
    if (['night', 'fishFallback', 'vista', 'title'].includes(k)) continue;
    const need = ['elev', 'aim', 'aimY', 'fov', 'ahead', 'stiff', ...(['trophy', 'hang'].includes(k) ? ['base', 'perM', 'min', 'max'] : ['dist'])];
    ok(need.every((q) => isNum(c[q])), `BALANCE.cameras.${k} needs ${need.filter((q) => !isNum(c[q])).join(', ')} (render's elev / dist / aim / aimY / fov / ahead / stiff)`);
    if (c.portrait) ok(['elev', 'dist', 'fov'].every((q) => isNum(c.portrait[q])), `BALANCE.cameras.${k}.portrait {elev, dist, fov}`);
  }
  ok(B3.cameras.night.follows === 'swarmActive' && B3.cameras.trophy.yawMax <= 35 && isObj(B3.cameras.title.orbit) && B3.cameras.title.orbit.arcDeg[1] - B3.cameras.title.orbit.arcDeg[0] < 180, 'the night camera follows the swarm, the trophy yaw is limited, the title arc stays south');
  { const cv = B3.cameras.cove, pitch = Math.atan((cv.dist * Math.sin(cv.elev * Math.PI / 180) - cv.aimY) / (cv.dist * Math.cos(cv.elev * Math.PI / 180) + cv.aim)) * 180 / Math.PI;
    ok(within(pitch, 16.2, 0.3) && pitch - cv.fov / 2 < -8, `the cove camera (render's model): pitch ${pitch.toFixed(1)}°, top of frame ${(cv.fov / 2 - pitch).toFixed(1)}° above horizontal (the arch, stones and legends in view)`); }

  // ---- the Landing's water side: v0 posts, the test buoy, the Set Out glide
  { const G = D.walkGridFor(C), RMk = WL.raftMask(G), slot = CA.moorings[0].slot;
    let sk = -1, sd = Infinity; for (let k = 0; k < G.n * G.n; k++) if (RMk[k]) { const [x, zz] = WL.cellXZ(G, k), dd = Math.hypot(x - slot.x, zz - slot.z); if (dd < sd) { sd = dd; sk = k; } }
    const RC2 = WL.component(G, RMk, sk);
    const raftCells = []; for (let k = 0; k < G.n * G.n; k++) if (RC2[k]) raftCells.push(WL.cellXZ(G, k));
    ok(raftCells.length > 0 && sd <= 2.5, `the cove: raft water within ${sd.toFixed(1)} m of the mooring slot`);
    for (const p of C.v0.posts) ok(raftCells.some(([x, zz]) => Math.hypot(x - p.x, zz - p.z) <= C.v0.range), `Landing v0: post ${p.id} (${p.x}, ${p.z}) is out of the raft's ${C.v0.range} m reach`);
    ok(C.v0.posts.every((p, i) => C.v0.posts.every((o, j) => i === j || near(p, o) >= 3)) && ['map_table', 'lectern', 'hearth', 'trials', 'gear_bench', 'shrine', 'pond', 'wall'].every((id) => C.v0.posts.some((p) => p.id === id)), 'Landing v0: one post per land station, ≥ 3 m apart');
    const head = { x: 4, z: 2 }, tb = C.testBuoy, ang = Math.atan2(tb.x - head.x, -(tb.z - head.z)) * 180 / Math.PI;
    ok(Math.abs(ang) <= 50 && near(head, tb) >= D.BALANCE.cast.minDist && near(head, tb) <= D.TACKLE.rod[0].castMax && near(tb, C.stations.find((x) => x.id === 'murk')) >= 4, `the test buoy is ${near(head, tb).toFixed(1)} m from the jetty head at ${ang.toFixed(0)}° from up-screen (≤ 50°, in cast range, clear of the barge)`);
    const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(p.x - a[0] - t * dx, p.z - a[1] - t * dz); };
    const pathMin = (path, p) => Math.min(...path.slice(1).map((b, i) => segD(p, path[i], b)));
    const barge = C.stations.find((x) => x.id === 'murk'), rr = D.BALANCE.move.raftRadius;
    for (const [nm, path] of [['setOutPath', C.setOutPath], ['homeInPath', C.homeInPath]]) {
      ok(pathMin(path, barge) >= 2.3 + rr, `COVE.${nm} passes ${pathMin(path, barge).toFixed(1)} m from Murk's barge (≥ pad 2.3 + raft ${rr})`);
      ok(pathMin(path, tb) >= rr + 0.4, `COVE.${nm} clears the test buoy`);
      ok(C.waystones.every((w) => pathMin(path, w) >= 1.1 + 0.4), `COVE.${nm} threads the Waystone sill (≥ 1.5 m from every stone)`);
      ok(path.every(([x, zz]) => { const k = G.idx(x, zz); return k >= 0 && !(G.flags[k] & D.WALK_FLAGS.GROUND); }), `COVE.${nm} stays on water`);
    }
    const cross = C.setOutPath.find(([, zz]) => zz === C.archLineZ);
    ok(!!cross && cross[0] > legX[0] + 2 && cross[0] < legX[1] - 2, 'the Set Out glide crosses the arch line between its legs');
    ok(C.stations.filter((x) => x.opens === 'wall').length === 4 && C.stations.find((x) => x.id === 'raft').needs === 'pendingSetOut', 'four wall stations; Board needs a Set Out plan'); }

  // ---- v3 without §24 (V3 on, WALK off): nothing needs a §24 place, a walk challenge or a walk relic
  ok(NW.SPECIES.length === 41 && NW.SPECIES.every((s) => !s.place || NW.MOSSMERE_V3.places.some((p) => p.id === s.place)), `v3 without §24: 41 species, none kept at a §24 place (got ${NW.SPECIES.length})`);
  ok(NW.CHALLENGES.length === 38 && NW.CHALLENGES.every((c) => c.tier !== 4), 'v3 without §24: 38 challenges (no tier IV)');
  ok(NW.RELICS.every((r) => !r.needsWalk) && 'stride' in NW.STATS && NW.CHALLENGE_BY_ID.complete_chronicle.params.n === NW.SPECIES.length, 'v3 without §24: no walk relics; stride exists (Boots); the Chronicle asks for every species in the build');
  ok(NW.ZONES[0].arena.places?.length === 9, "v3 without §24 still has the Mossmere's places");

  console.log(`  v3: ${S.length} species (${S.filter((s) => s.place).length} kept, ${S.filter((s) => s.rarity !== 'legendary' && s.time === 'gloom').length} night-only), ${real.length} places (+4 secrets), ${D.RUMOURS.length} rumours, ${D.CHALLENGES.length} challenges, ${D.RELICS.length} relics; legend ratios ${LAKES.map((z) => { const lg = S.find((s) => s.zone === z && s.rarity === 'legendary'); return (D.sizeL50(lg) / Math.max(...S.filter((s) => s.zone === z && s.rarity !== 'legendary').map((s) => D.sizeLength(s, 3.6, z)))).toFixed(2); }).join(' / ')}; timeline worst ${worst.toFixed(2)} h; ${((Date.now() - T0) / 1000).toFixed(1)} s`);
}

// ---------------------------------------------------------------------------- report
for (const w of warnings) console.log('  warn:', w);
if (errors.length) {
  for (const e of errors.slice(0, 80)) console.log('  FAIL:', e);
  if (errors.length > 80) console.log(`  … and ${errors.length - 80} more`);
  console.log(`validate-data${V3 ? ' --v3' : WALK ? ' --walk' : ''}: ${errors.length} failure(s) in ${checks} checks`);
  process.exit(1);
}
console.log(`validate-data${V3 ? ' --v3 (V3_ENABLED and WALK_ENABLED on)' : WALK ? ' --walk (WALK_ENABLED on)' : ' (v1 tables, WALK_ENABLED off)'}: OK (${checks} checks; ${D.SPECIES.length} species, ${D.BOONS.length} boons, ${D.CHARACTERS.length} characters, ${D.CHALLENGES.length} challenges, ${D.RELICS.length} relics, ${D.UPGRADES.length} upgrades, ${D.ENEMIES.length} enemies)`);
if (!WALK && !process.argv.includes('--v1')) {
  const { spawnSync } = await import('node:child_process');
  for (const pass of ['--walk', '--v3']) {
    const r = spawnSync(process.execPath, [new URL(import.meta.url).pathname, pass, ...(pass === '--walk' && process.argv.includes('--refresh-fingerprint') ? ['--refresh-fingerprint'] : [])], { stdio: 'inherit' });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
  process.exit(0);
}
