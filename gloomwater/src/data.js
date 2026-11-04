// data.js — GLOOMWATER content & balance tables (design team).
// Pure ES module, no imports. Implements CONTRACT.md §8; semantics in DESIGN.md.
// Conventions: colours are hex NUMBERS; times in seconds; distances in metres;
// optional/extra fields are read by consumers with `?.` / `??`.

// =====================================================================================
// STATS — every stat key the game reads. base = value before character, upgrades,
// relics and boons (all additive per level). min/max = clamps applied by getStats().
// =====================================================================================
export const STATS = {
  maxHp:        { label: 'Embers',            base: 5,    fmt: 'int', min: 1,    max: 12 },
  maxOil:       { label: 'Lantern Oil',       base: 100,  fmt: 'int', min: 40,   max: 260 },
  maxSatiety:   { label: 'Satiety',           base: 100,  fmt: 'int', min: 40,   max: 220 },
  oilDrain:     { label: 'Oil Burn',          base: 0.14, fmt: 'num', min: 0.05, max: 1 },
  satietyDrain: { label: 'Hunger',            base: 0.10, fmt: 'num', min: 0.04, max: 1 },
  lightRadius:  { label: 'Light Radius',      base: 8,    fmt: 'm',   min: 3,    max: 18 },
  auraDps:      { label: 'Lantern Burn',      base: 1.2,  fmt: 'num', min: 0,    max: 30 },
  flareCost:    { label: 'Flare Cost',        base: 18,   fmt: 'int', min: 8,    max: 60 },
  flareRadius:  { label: 'Flare Radius',      base: 10,   fmt: 'm',   min: 4,    max: 20 },
  flareCooldown:{ label: 'Flare Cooldown',    base: 20,   fmt: 's',   min: 6,    max: 60 },
  zapCost:      { label: 'Zap Cost',          base: 1,    fmt: 'num', min: 0.3,  max: 10 },
  zapDamage:    { label: 'Zap Damage',        base: 3,    fmt: 'num', min: 1,    max: 40 },
  damageMult:   { label: 'Damage',            base: 1,    fmt: 'x',   min: 0.2,  max: 5 },
  cooldownMult: { label: 'Cooldowns',         base: 1,    fmt: 'x',   min: 0.4,  max: 2 },
  critChance:   { label: 'Critical Chance',   base: 0.05, fmt: 'pct', min: 0,    max: 0.75 },
  moveSpeed:    { label: 'Raft Speed',        base: 6,    fmt: 'num', min: 2,    max: 11 },
  pickupRadius: { label: 'Cinder Magnet',     base: 4,    fmt: 'm',   min: 1,    max: 20 },
  xpMult:       { label: 'Cinder Gain',       base: 1,    fmt: 'x',   min: 0.2,  max: 4 },
  luck:         { label: 'Luck',              base: 0,    fmt: 'num', min: 0,    max: 2 },
  rerolls:      { label: 'Rerolls',           base: 1,    fmt: 'int', min: 0,    max: 9 },
  dawnHeal:     { label: 'Dawn Mending',      base: 1,    fmt: 'int', min: 0,    max: 5 },
  castMax:      { label: 'Cast Range',        base: 16,   fmt: 'm',   min: 8,    max: 30 },
  lineStrength: { label: 'Line Strength',     base: 1,    fmt: 'x',   min: 0.5,  max: 2.5 },
  reelSpeed:    { label: 'Reel Speed',        base: 1,    fmt: 'x',   min: 0.4,  max: 2.2 },
  sweetZone:    { label: 'Sweet Band',        base: 0.16, fmt: 'pct', min: 0.06, max: 0.30 },
  biteSpeed:    { label: 'Bite Speed',        base: 1,    fmt: 'x',   min: 0.4,  max: 2 },
  hookWindow:   { label: 'Hook Window',       base: 1,    fmt: 'x',   min: 0.5,  max: 1.6 },
  rarityBonus:  { label: 'Rare Fish Luck',    base: 0,    fmt: 'pct', min: 0,    max: 0.6 },
  creelSize:    { label: 'Creel Slots',       base: 4,    fmt: 'int', min: 2,    max: 10 },
  sellMult:     { label: 'Sale Price',        base: 1,    fmt: 'x',   min: 0.5,  max: 2 },
  foodMult:     { label: 'Meal Value',        base: 1,    fmt: 'x',   min: 0.5,  max: 2 },
  oilYieldMult: { label: 'Render Yield',      base: 1,    fmt: 'x',   min: 0.5,  max: 2 },
  armor:        { label: 'Ward',              base: 0,    fmt: 'pct', min: 0,    max: 0.6 },
  slackTime:    { label: 'Slack Grace',       base: 1.6,  fmt: 's',   min: 0.6,  max: 3 },
  nibbleTells:  { label: 'Nibble Sense',      base: 0,    fmt: 'int', min: 0,    max: 2 },
};

// =====================================================================================
// BALANCE — every timing / drain / damage / tuning constant referenced by DESIGN.md.
// =====================================================================================
export const BALANCE = {
  // Day clock. Gloomtide length grows: min(gloomMax, gloomtide + gloomGrowth*(day-1)).
  phases: { calm: 140, dusk: 16, gloomtide: 60, dawn: 10 },
  gloomGrowth: 5,
  gloomMax: 105,

  // Drains. oil/s = oilDrain*oilPhase*zone.drain.oil*diff.drainMult; satiety/s = satietyDrain*zone*diff.
  drain: {
    oilPhase: { calm: 1.0, dusk: 1.3, gloomtide: 1.8, dawn: 0.5 },
    satietyPhase: { calm: 1, dusk: 1, gloomtide: 1, dawn: 1 },
    lanternFloor: 0.4,        // lanternFactor = oil>0 ? floor + (1-floor)*oilFrac : 0 (scales light radius AND aura)
    mothDim: 0.12,            // each latched moth shrinks the light radius by this fraction
    matronDim: 0.30,
    maxDim: 0.6,
    duskForecastPad: 10,      // dusk toast if oil < projected gloomtide burn + pad
  },

  // Damage to the Wick.
  damage: {
    iframes: 1.0,             // s of invulnerability after losing an Ember
    iframeOilMult: 0.5,       // contacts during i-frames still drain this share of their oil
    contactRadius: 1.8,       // m from raft centre
    armorCap: 0.6,
    emberRounding: 'floor',   // embers = max(1, floor(base * diff.damageMult))
    starvation: { grace: 5, interval: 20, reelMult: 0.75, windowMult: 0.85 },
    darkness: { grace: 3, interval: 10, enemySpeed: 1.4, spawnMult: 1.33, waxZapSatiety: 4, lastFlickerOil: 12 },
  },

  // Healing.
  heal: { wellFed: 1, wellFedAt: 0.7, hearty: 1, heartyAt: 0.8, heartyPerDay: 1, kindleHeal: 1 },

  // resource:low edges (fraction of max; hp in Embers) with re-arm hysteresis.
  low: { oil: 0.25, oilRearm: 0.35, satiety: 0.20, satietyRearm: 0.30, hp: 2 },

  // Raft handling (player.js).
  move: {
    accel: 2.6,               // velocity lerp rate toward target (1/s)
    drag: 1.4,                // lerp rate toward 0 with no input (1/s) — boat glide
    turnRate: 4.0,            // rad/s heading slew
    raftRadius: 1.6,          // collision radius
    wakeEvery: 0.12,          // s between wake puffs at full speed
    paddleRipple: 0.45,       // s between paddle ripples
    interactRange: 5,         // merchant trade range (m)
    gateRange: 1.2,           // × gate radius to offer "Descend"
  },

  // Night progression (combat.js).
  xp: {
    curve: { base: 5, lin: 3.2, quad: 0.32 },  // see xpForLevel
    choices: 3,
    maxWeapons: 4,
    maxPassives: 6,
    rarityWeights: { common: 60, rare: 28, epic: 10, legendary: 2 },
    luckShift: { common: 0, rare: 0.5, epic: 1.0, legendary: 2.0 },  // weight *= 1 + luck*shift
    firstLevelWeapons: 2,     // first pick of a weaponless run offers >= 2 weapons
    cinderLife: 25,           // s before an uncollected cinder fades
    magnetSpeed: 14,          // m/s glide once inside pickupRadius
    dawnAutoCollect: true,
    fallback: [               // offered when every boon is maxed / capped
      { id: 'fallback_shells', name: 'A Pocket of Shells', desc: '+25 Shells', give: { shells: 25 } },
      { id: 'fallback_mend', name: 'A Warm Breath', desc: 'Mend 1 Ember', give: { hp: 1 } },
    ],
  },

  // Swarm & lantern combat (combat.js).
  combat: {
    spawnRing: [22, 34],      // m from the raft
    behindShare: 0.35,        // max share of spawns placed behind the camera (+Z half)
    packSpread: 2.5,
    auraTick: 0.2,            // s between aura damage ticks (damage = auraDps*tick*lanternFactor*damageMult)
    lightSlow: 0.7,           // enemy speed multiplier inside the light
    separation: 0.9,          // m personal space between swarm members
    crit: { mult: 2 },
    zap: { cooldown: 0.18, pickPx: 48, pickPxTouch: 56, range: 28, stun: 0.25, knock: 1.2, airborneMult: 2, latchedRefund: 1 },
    flare: { damage: 6, knock: 6, stun: 1.5, lightBoost: 1.5, boostTime: 3, clearsLatched: true, resetsHands: true },
    dusk: { rateMult: 0.25, maxAlive: 6, models: ['wisp', 'mite'] },
    night: { buildUntil: 0.15, buildMult: 0.6, crescendoFrom: 0.8, crescendoMult: 1.35, quietFrom: 0.93, swellPeriod: 15, swellAmp: 0.3 },
    reelingRateMult: 0.8,
    legendFightRateMult: 0.65,
    darknessRateMult: 1.33,
    bossAt: 0.4,              // gloomtide k at which a Warden rises on boss nights
    bossEvery: 3,             // boss night when day % bossEvery === 0
    eliteFirstAt: 0.25,
    stragglers: { fromDay: 5, fromZone: 2, perCalm: 1, kind: 'creelsnatch', window: [0.3, 0.8] },  // calm raid
    maxLive: 150,
  },

  // Cast (fishing.js).
  cast: {
    period: 1.6,              // ping-pong meter: 0->1->0 in one period
    minDist: 3,               // castDist = max(minDist, charge * castMax)
    tapIgnore: 0.12,          // presses shorter than this never cast
    cleanAt: 0.92,            // charge >= cleanAt = "Clean Cast"
    cleanBiteMult: 0.85,
    cleanRarity: 0.05,
    flightBase: 0.45,         // s; flight = flightBase + flightPerM * dist
    flightPerM: 0.03,
    arcHeight: 0.25,          // × dist
    reelInTime: 0.6,
    spookReelIn: 1.5,
  },

  // Waiting & biting (fishing.js).
  bite: {
    waitBase: 3, waitMean: 5.5, waitMin: 2, waitMax: 25,   // W = (waitBase + Exp(waitMean)) / mods
    gloomMult: 1.15,          // bite rate multiplier during gloomtide (waits divided by this)
    nibbles: [0.2, 0.35, 0.3, 0.15],   // P(0..3 nibbles); +1 for uncommon and rarer
    nibbleDip: 0.06, nibbleDur: 0.22, nibbleGap: 0.7, lastNibbleLead: 0.6,
    feintChance: 0.3, feintDip: 0.12, feintZoneMin: 2,
    plunge: 0.25,
    windowMin: 0.35, windowMax: 1.4,
    perfectFrac: 0.4, perfectMin: 0.25,
    pity: { hp: 2, oilFrac: 0.15, waitMult: 0.7, rarity: 0.1 },
  },

  // Reel tension model (fishing.js) — see DESIGN.md §4.6.
  reel: {
    safeMin: 0.15, safeMax: 0.85,
    slackLine: 0.08,          // T below this accumulates slack time
    slackDecay: 2,            // slack timer decays at this × dt when T >= slackLine
    snapAt: 1.0, snapGrace: 0.12,
    riseBase: 0.42,           // holding: target velocity = riseBase*pw/LS
    fallBase: 0.55,           // released: target = -fallBase/(0.8+0.2*pw)
    surgeHoldMult: 2.2,       // holding in a surge: × surgeHoldMult*sqrt(str)
    surgeCreep: 0.18,         // released in a surge: total creep surgeCreep*pw*str/LS
    leapHold: 0.25, leapRelease: -0.9,
    sinkerDrag: 0.06,
    jitter: 0.22, noiseHz: 1.5,
    accel: 9,                 // tension velocity easing (1/s) ~110 ms
    tire: 0.25,               // power × (1 - tire*P) once tiring is on
    decaySlack: 0.04,         // progress lost per s while T < safeMin
    decaySurge: 0.015,        // progress lost per s while released during a non-leap surge
    sweetMult: 2,
    startTension: 0.35, startProgress: 0.10, perfectProgress: 0.22,
    firstSurgeDelay: 1.5, perfectSurgeDelay: 1.5,
    dutyCap: 0.42,            // (surgeTime + warn) / surgeEvery <= dutyCap
    warnMin: 0.5, warnBase: 0.9, warnErratic: 0.2, darterWarn: 0.5,
    bandAmp: 0.08, bandAmpErratic: 0.14, bandOmega: 0.5, bandOmegaErratic: 0.9, bandNoise: 0.08,
    darterJump: [0.10, 0.18], darterJumpTime: 0.3, sinkerBand: -0.08,
    bandMin: 0.05, bandMax: 0.40,
    strength: { steady: 1, darter: 0.6, sinker: 1, thrasher: 1.3, leaper: 1 },
    enrage: { power: 1.25, surgeEvery: 0.75, warnCut: 0.15, warnFloor: 0.55 },
    dangerFrom: 0.72,
    landingTime: 1.2,         // s of 'landing' state before fishing:caught
  },

  // Feeding spots (fishing.js).
  spots: {
    calmCount: [2, 4], gloomCount: [1, 2],
    ttl: [45, 75], respawn: [8, 16],
    radius: 2.6,
    minDist: 10, maxDist: 45,
    depthMin: 0.2,
    waitMult: 0.55, rarity: 0.10, quality: 0.08,
    rareChance: 0.15, rareRarity: 0.25, rareQuality: 0.15,
    legend: { radius: 3.2, depthMin: 0.8, waitMult: 0.7, minDistFromRaft: 18 },
    tideChart: { count: 2, rare: true },
  },

  // Legendary rules.
  legend: { woundedCarry: 0.5, woundedMax: 0.4, rebiteDelay: 20, windowBonus: 0.1, bannerDelay: 0.4 },

  // Catch quality from reel performance (see QUALITY for multipliers).
  quality: { perfectHookBonus: 0.15, overDangerPenalty: 0.10, spotBonus: 'spots.quality' },

  // Economy (progression.js).
  economy: {
    startShells: 20,
    waystonePurse: { mossmere: 0, sporewood: 160, glasswater: 450, paleabyss: 950 },
    supplyMult: [1, 1.4, 1.9, 2.5],   // by current zone index
    baitMult: [1, 1.3, 1.6, 2.0],     // general baits only; legend baits fixed
    weightSkew: 1.6,                  // w = min + (max-min) * U^skew  (heavy bait: skew / (1+weightBias))
    sizeK: [0.75, 1.25],              // value/food/oil multiplier across the weight range
    newSpeciesShells: 1.5,            // first catch ever: +round(1.5 × species.value) Shells
    mercy: { perRelease: 0.02, cap: 0.10 },
    streak: { perStep: 0.10, maxSteps: 5 },
    trophyMemories: [15, 30, 50, 0],  // legendary still in the creel at run end (Leviathan counts via victory)
    legendTheftProof: true,
  },

  // Old Murk.
  merchant: { day1ArriveAt: 20, warnAt: 0.85, pity: { shells: 20, oilFrac: 0.25, give: { oil: 30, satiety: 30 } } },

  // Journal rewards.
  journal: { halfZone: 4, newSpeciesMemories: 3, masteryAt: 10, masteryMemories: 2, halfZoneMemories: 10 },

  // Descent Gate travel.
  travel: { phases: ['calm', 'dawn'], murkFollows: true, oneWay: true },

  // Bounty ledger.
  bounty: { offer: 2, maxActive: 3, durationDays: 2, dayGrowth: 0.04, memoriesEach: 4 },
};

// =====================================================================================
// ZONES — four cavern lakes. index 0..3. unlock = Descent Gate toll + requirements.
// valueMult scales bounty rewards & elite Shell drops (NOT fish: species values are
// final; Warden shells are final too). Palettes are hex numbers; fogDensity lives in the palette (FogExp2).
// =====================================================================================
export const ZONES = [
  {
    id: 'mossmere', index: 0, name: 'The Mossmere', subtitle: 'Shallows of the Sunken Gate',
    arena: { radius: 60, islands: 6, pillars: 10, seed: 1307 },
    unlock: { shells: 0, requires: [] },
    drain: { oil: 1.0, satiety: 1.0 }, gloom: 1.0, valueMult: 1,
    legendary: 'belled_matriarch', warden: 'the_wickeater', gateName: 'The Moss Sluice',
    palette: { fog: 0x1a3436, fogDensity: 0.016, water: 0x1f3d3b, waterDeep: 0x081719, foam: 0xbfe3d4,
      glow: 0x6ff5c8, accent: 0xd6f59a, ambient: 0x3d6662, ink: 0x050c0d, far: 0x5a9488, light: 0xcff7e6 },
    grade: { exposure: 1.0, bloomStrength: 0.85, bloomRadius: 0.6, bloomThreshold: 0.72, tint: 0x2e6b63, tintAmount: 0.18, vignette: 0.38, saturation: 0.85, grain: 0.05 },
    description: 'The outer moat of the Lamplit Kingdom, drowned to the arches. Moss drinks the old stone and roots hang from the vault like the beards of sleeping giants. The fish here are forgiving. The dark, for now, only watches.',
  },
  {
    id: 'sporewood', index: 1, name: 'Sporewood Pools', subtitle: 'A Garden That Forgot the Sun',
    arena: { radius: 65, islands: 7, pillars: 8, seed: 2711 },
    unlock: { shells: 120, requires: [{ type: 'legendary', id: 'belled_matriarch', label: 'Land the Belled Matriarch' }] },
    drain: { oil: 1.2, satiety: 1.15 }, gloom: 1.3, valueMult: 1.8,
    legendary: 'drifting_grove', warden: 'the_sporeshroud', gateName: 'The Mycelium Veil',
    palette: { fog: 0x2b1b30, fogDensity: 0.019, water: 0x2a1a2e, waterDeep: 0x0d0710, foam: 0xf3d3e0,
      glow: 0xffb46a, accent: 0xff7fb0, ambient: 0x5b3f63, ink: 0x0b060d, far: 0x80588a, light: 0xffd9c4 },
    grade: { exposure: 1.02, bloomStrength: 1.05, bloomRadius: 0.75, bloomThreshold: 0.68, tint: 0x6b3a6e, tintAmount: 0.2, vignette: 0.4, saturation: 0.9, grain: 0.05 },
    description: 'Beneath the royal gardens the fungi kept growing long after the gardeners stopped. Towers of cap and gill rise from sweet, warm water, and the air is thick with spores that glow like embers that never learned to burn.',
  },
  {
    id: 'glasswater', index: 2, name: 'Glasswater Vault', subtitle: 'Where the Kingdom Kept Its Light',
    arena: { radius: 70, islands: 6, pillars: 12, seed: 4421 },
    unlock: { shells: 300, requires: [{ type: 'legendary', id: 'drifting_grove', label: 'Land the Drifting Grove' }] },
    drain: { oil: 1.4, satiety: 1.3 }, gloom: 1.65, valueMult: 3.0,
    legendary: 'glass_sovereign', warden: 'the_shard_abbot', gateName: 'The Vault Seal',
    palette: { fog: 0x131a3c, fogDensity: 0.012, water: 0x131c3e, waterDeep: 0x04061a, foam: 0xc9e8ff,
      glow: 0x5ff2ff, accent: 0xb48cff, ambient: 0x2f3a78, ink: 0x03040e, far: 0x5062b0, light: 0xd8e8ff },
    grade: { exposure: 1.05, bloomStrength: 1.15, bloomRadius: 0.55, bloomThreshold: 0.65, tint: 0x2a3a8a, tintAmount: 0.2, vignette: 0.35, saturation: 0.95, grain: 0.04 },
    description: 'Here the kingdom poured its light into crystal and shelved it like books. The water is cold and clear as a held breath. Every shard remembers a colour, and none remember why.',
  },
  {
    id: 'paleabyss', index: 3, name: 'The Pallid Deep', subtitle: 'Where the Kingdom Laid Its Light to Rest',
    arena: { radius: 78, islands: 5, pillars: 9, seed: 9001 },
    unlock: { shells: 650, requires: [{ type: 'legendary', id: 'glass_sovereign', label: 'Land the Glass Sovereign' }] },
    drain: { oil: 1.65, satiety: 1.45 }, gloom: 2.0, valueMult: 4.5,
    legendary: 'pale_leviathan', warden: 'the_lightless_ferryman', gateName: null,
    palette: { fog: 0x1c1b18, fogDensity: 0.022, water: 0x14130f, waterDeep: 0x030302, foam: 0xe9e2cf,
      glow: 0xe8c66a, accent: 0xeae4d3, ambient: 0x3a3833, ink: 0x020202, far: 0xa8a18c, light: 0xf0dca0 },
    grade: { exposure: 0.95, bloomStrength: 0.9, bloomRadius: 0.8, bloomThreshold: 0.7, tint: 0x5a4e2a, tintAmount: 0.12, vignette: 0.5, saturation: 0.6, grain: 0.07 },
    description: 'The deepest water. The kingdom set its dead adrift here with a candle each, and the candles went out long ago. Two veiled giants kneel in the mist, and the ribs of something larger than a cathedral arch overhead. Something below is breathing.',
  },
];

// =====================================================================================
// SPECIES — 32 fish, 8 per zone (3 common, 2 uncommon, 2 rare, 1 legendary).
// value/food/oil are at mean weight, normal quality, and FINAL (already zone-scaled).
// time: 'any' | 'calm' (any phase except gloomtide) | 'gloom' (gloomtide only).
// depth: band of world.getDepth() at the bobber. bait: hard requirement (null = none).
// difficulty is derived from TIER × behaviour (× legendary) with the duty cap applied;
// the two finale fish are hand-tuned. Legendaries carry a `boss` script.
// =====================================================================================
export const DIFFICULTY_TIERS = {
  1: { power: 0.60, surgeEvery: 6.5, surgeTime: 0.70, stamina: 5,    sweet: 1.30, erratic: 0.05, window: 1.10 },
  2: { power: 0.85, surgeEvery: 5.2, surgeTime: 0.95, stamina: 7,    sweet: 1.10, erratic: 0.12, window: 0.90 },
  3: { power: 1.15, surgeEvery: 4.2, surgeTime: 1.20, stamina: 9.5,  sweet: 0.95, erratic: 0.20, window: 0.75 },
  4: { power: 1.50, surgeEvery: 3.4, surgeTime: 1.50, stamina: 12.5, sweet: 0.80, erratic: 0.30, window: 0.62 },
  5: { power: 1.95, surgeEvery: 2.7, surgeTime: 1.85, stamina: 16,   sweet: 0.68, erratic: 0.40, window: 0.52 },
};
export const BEHAVIOR_MODS = {
  steady:   {},
  darter:   { power: 0.9, surgeEvery: 0.6, surgeTime: 0.55, erraticAdd: 0.15 },
  sinker:   { power: 1.2, surgeEvery: 1.7, surgeTime: 1.1, stamina: 1.15, erraticAdd: -0.05 },
  thrasher: { power: 1.1, surgeEvery: 1.1, surgeTime: 1.5, erraticAdd: 0.05 },
  leaper:   { surgeEvery: 0.85, surgeTime: 0.8, sweet: 0.95, erraticAdd: 0.1 },
};
export const LEGENDARY_MODS = { power: 1.15, stamina: 1.9, surgeTime: 1.15, sweet: 0.88, window: 0.85, erraticAdd: 0.05 };

const r2 = (v) => Math.round(v * 100) / 100;
// warn time used by the duty cap (mirrors BALANCE.reel)
function warnFor(behavior, erratic) {
  const R = BALANCE.reel;
  return behavior === 'darter' ? R.darterWarn : Math.max(R.warnMin, R.warnBase - R.warnErratic * erratic);
}
function diff(tier, behavior, legendary = false) {
  const t = DIFFICULTY_TIERS[tier], b = BEHAVIOR_MODS[behavior] || {}, L = legendary ? LEGENDARY_MODS : {};
  const m = (k) => (b[k] ?? 1) * (L[k] ?? 1);
  const d = {
    power: t.power * m('power'),
    surgeEvery: t.surgeEvery * m('surgeEvery'),
    surgeTime: t.surgeTime * m('surgeTime'),
    stamina: t.stamina * m('stamina'),
    sweet: Math.max(0.5, t.sweet * m('sweet')),
    erratic: Math.min(0.9, Math.max(0, t.erratic + (b.erraticAdd || 0) + (L.erraticAdd || 0))),
    window: Math.max(0.42, t.window * m('window')),
  };
  if (behavior === 'darter') d.surgeTime = Math.max(0.4, d.surgeTime);
  d.surgeEvery = Math.max(d.surgeEvery, (d.surgeTime + warnFor(behavior, d.erratic)) / BALANCE.reel.dutyCap);
  for (const k of Object.keys(d)) d[k] = r2(d[k]);
  return d;
}

export const SPECIES = [
  // ---------------------------------------------------------------- mossmere (z0)
  { id: 'dusk_minnow', name: 'Dusk Minnow', zone: 'mossmere', rarity: 'common', tier: 1,
    weight: [0.05, 0.25], value: 5, food: 16, oil: 16, time: 'any', depth: [0, 0.55], bait: null, behavior: 'darter',
    difficulty: diff(1, 'darter'),
    model: { shape: 'minnow', body: 0x6f8f86, belly: 0xd9e8dc, fin: 0x34544f, glow: null, pattern: 'scales', eyes: 'normal', scale: 0.45 },
    lore: 'They school beneath the raft like thrown pennies, each one wishing for nothing at all.' },
  { id: 'mossback_perch', name: 'Mossback Perch', zone: 'mossmere', rarity: 'common', tier: 1,
    weight: [0.3, 1.4], value: 7, food: 22, oil: 20, time: 'any', depth: [0.1, 0.75], bait: null, behavior: 'steady',
    difficulty: diff(1, 'steady'),
    model: { shape: 'perch', body: 0x4f6b4a, belly: 0xc9d6a8, fin: 0x8a9f5a, glow: null, pattern: 'stripes', eyes: 'normal', scale: 0.8 },
    lore: 'Moss takes root on its back by its third winter. By its tenth, it is mostly a small, slow garden.' },
  { id: 'gutter_crayfish', name: 'Gutter Crayfish', zone: 'mossmere', rarity: 'common', tier: 1,
    weight: [0.1, 0.5], value: 6, food: 20, oil: 18, time: 'any', depth: [0, 0.45], bait: null, behavior: 'sinker',
    difficulty: diff(1, 'sinker'),
    model: { shape: 'crayfish', body: 0x5b4a3e, belly: 0xb8a07a, fin: 0x2f2620, glow: null, pattern: 'bands', eyes: 'normal', scale: 0.6 },
    lore: 'It hoards drowned buttons in its burrow. No one knows whose coat it is trying to finish.' },
  { id: 'weeping_carp', name: 'Weeping Carp', zone: 'mossmere', rarity: 'uncommon', tier: 2,
    weight: [1.5, 5.5], value: 15, food: 26, oil: 20, time: 'any', depth: [0.3, 0.9], bait: null, behavior: 'sinker',
    difficulty: diff(2, 'sinker'),
    model: { shape: 'carp', body: 0x5d6e66, belly: 0xdfe6d8, fin: 0x3a4a45, glow: null, pattern: 'bands', eyes: 'normal', scale: 1.15 },
    lore: 'Old fishers swore the carp were mourning. The carp have never once said otherwise.' },
  { id: 'candlefin_koi', name: 'Candlefin Koi', zone: 'mossmere', rarity: 'uncommon', tier: 2,
    weight: [0.8, 3], value: 18, food: 18, oil: 28, time: 'calm', depth: [0.25, 0.85], bait: null, behavior: 'darter',
    difficulty: diff(2, 'darter'),
    model: { shape: 'koi', body: 0xe9e2cf, belly: 0xfff6e0, fin: 0xf2c98a, glow: 0xffe2a8, pattern: 'spots', eyes: 'normal', scale: 1.0 },
    lore: 'Its fins burn without heat. More than one Wick has mistaken it for kin, and leaned too far.' },
  { id: 'reedjaw_pike', name: 'Reedjaw Pike', zone: 'mossmere', rarity: 'rare', tier: 3,
    weight: [2.5, 9], value: 34, food: 30, oil: 26, time: 'any', depth: [0.55, 1], bait: null, behavior: 'thrasher',
    difficulty: diff(3, 'thrasher'),
    model: { shape: 'pike', body: 0x3e5a4c, belly: 0xc4d1b0, fin: 0x253a30, glow: null, pattern: 'stripes', eyes: 'normal', scale: 1.3 },
    lore: 'It lies among the drowned reeds until it forgets it is not one. Then something swims by.' },
  { id: 'gloam_eel', name: 'Gloam Eel', zone: 'mossmere', rarity: 'rare', tier: 3,
    weight: [1, 4], value: 42, food: 22, oil: 36, time: 'gloom', depth: [0.4, 1], bait: 'lumen_moss', behavior: 'leaper',
    difficulty: diff(3, 'leaper'),
    model: { shape: 'eel', body: 0x14302c, belly: 0x5fa392, fin: 0x0b1c1a, glow: 0x6ff5c8, pattern: 'spots', eyes: 'glow', scale: 1.25 },
    hint: 'Rises with the Gloomtide, in deep water. Drawn to the glow of Lumen Moss.',
    lore: 'It rises only when the Gloom does. Some say it is the Gloom, slowly learning to be a fish.' },
  { id: 'belled_matriarch', name: 'The Belled Matriarch', zone: 'mossmere', rarity: 'legendary', tier: 3,
    epithet: 'She Who Tolls for the Drowned',
    weight: [12, 30], value: 140, food: 60, oil: 60, time: 'calm', depth: [0.75, 1], bait: 'heartmoss', behavior: 'steady',
    difficulty: diff(3, 'steady', true),
    boss: {
      enrage: 60,
      phases: [
        { at: 0, name: 'The Slow Toll', mechanic: 'none' },
        { at: 0.4, name: 'Double Toll', mechanic: 'doubleSurge', gap: 0.9, warn: 0.5 },
        { at: 0.75, name: 'Last Toll', mechanic: 'shrink', sweetTo: 0.6, tireFrom: 0.9 },
      ],
      cue: 'A bell tolls beneath the raft before every surge.',
    },
    model: { shape: 'carp', body: 0x4a5e4f, belly: 0xd8e0c6, fin: 0x6e8a5c, glow: 0x9ff0c0, pattern: 'scales', eyes: 'glow', scale: 2.0 },
    hint: 'Listen for a bell beneath the calm, far out in deep water. She takes only Heartmoss.',
    lore: 'A temple bell sank into her when she was young. She has tolled for the drowned ever since.' },

  // ---------------------------------------------------------------- sporewood (z1)
  { id: 'sporebelly_puffer', name: 'Sporebelly Puffer', zone: 'sporewood', rarity: 'common', tier: 2,
    weight: [0.2, 0.9], value: 13, food: 22, oil: 26, time: 'any', depth: [0, 0.6], bait: null, behavior: 'thrasher',
    difficulty: diff(2, 'thrasher'),
    model: { shape: 'puffer', body: 0x7a4f6e, belly: 0xf0c9d8, fin: 0xe89a5a, glow: 0xff9fc4, pattern: 'spots', eyes: 'normal', scale: 0.7 },
    lore: 'Frightened, it swells and sighs out spores. In the quiet, the whole pool smells of lullabies.' },
  { id: 'plumgill_perch', name: 'Plumgill Perch', zone: 'sporewood', rarity: 'common', tier: 2,
    weight: [0.4, 1.8], value: 14, food: 26, oil: 24, time: 'any', depth: [0.15, 0.8], bait: null, behavior: 'steady',
    difficulty: diff(2, 'steady'),
    model: { shape: 'perch', body: 0x5a3d5e, belly: 0xe2c7d8, fin: 0xc77aa0, glow: null, pattern: 'stripes', eyes: 'normal', scale: 0.85 },
    lore: 'Its gills are the colour of a bruise healing. It has been healing for a very long time.' },
  { id: 'capshell_crayfish', name: 'Capshell Crayfish', zone: 'sporewood', rarity: 'common', tier: 2,
    weight: [0.2, 0.9], value: 12, food: 26, oil: 22, time: 'any', depth: [0, 0.45], bait: null, behavior: 'sinker',
    difficulty: diff(2, 'sinker'),
    model: { shape: 'crayfish', body: 0x8a5a3c, belly: 0xe8c79a, fin: 0x4a2c22, glow: 0xffb46a, pattern: 'spots', eyes: 'normal', scale: 0.65 },
    lore: 'It wears a small mushroom for a hat. When the mushroom dies it mourns, then finds another.' },
  { id: 'velvet_ray', name: 'Velvet Ray', zone: 'sporewood', rarity: 'uncommon', tier: 3,
    weight: [2, 7], value: 32, food: 30, oil: 28, time: 'any', depth: [0.35, 0.9], bait: null, behavior: 'leaper',
    difficulty: diff(3, 'leaper'),
    model: { shape: 'ray', body: 0x3e2944, belly: 0xd6b8cf, fin: 0x8a5a8a, glow: null, pattern: 'spots', eyes: 'normal', scale: 1.2 },
    lore: 'It glides beneath the spore-rain like a shadow looking for the thing that cast it.' },
  { id: 'threadling_eel', name: 'Threadling Eel', zone: 'sporewood', rarity: 'uncommon', tier: 2,
    weight: [0.5, 2.2], value: 34, food: 22, oil: 36, time: 'any', depth: [0.3, 0.85], bait: 'spore_cake', behavior: 'darter',
    difficulty: diff(2, 'darter'),
    model: { shape: 'eel', body: 0xcbb8c4, belly: 0xf3e6ee, fin: 0x7a5a74, glow: 0xffd6a0, pattern: 'bands', eyes: 'blind', scale: 1.0 },
    hint: 'It feeds only on sweetness. Try Spore Cake.',
    lore: 'Mostly root, a little fish. It stitches the pool floor together while no one is watching.' },
  { id: 'mildew_angler', name: 'Mildew Angler', zone: 'sporewood', rarity: 'rare', tier: 3,
    weight: [3, 10], value: 66, food: 34, oil: 40, time: 'gloom', depth: [0.5, 1], bait: null, behavior: 'sinker',
    difficulty: diff(3, 'sinker'),
    model: { shape: 'angler', body: 0x2a1c2c, belly: 0x6e4f66, fin: 0x1a101c, glow: 0xffb46a, pattern: 'spots', eyes: 'glow', scale: 1.1 },
    hint: 'Its lure lights only in the Gloomtide, out where the water is deep.',
    lore: "Its lure is one soft mushroom, lit like a window left on for someone who isn't coming." },
  { id: 'sleepspore_jelly', name: 'Sleepspore Jelly', zone: 'sporewood', rarity: 'rare', tier: 3,
    weight: [0.4, 1.5], value: 62, food: 14, oil: 46, time: 'calm', depth: [0.2, 0.75], bait: 'lumen_moss', behavior: 'darter',
    difficulty: diff(3, 'darter'),
    model: { shape: 'jelly', body: 0xe8b3d0, belly: 0xfff0f6, fin: 0xff7fb0, glow: 0xff8fc0, pattern: 'none', eyes: 'blind', scale: 0.75 },
    hint: 'Drifts only in the calm, towards a gentle glow like Lumen Moss.',
    lore: "It drifts through other creatures' dreams to rest. Most never notice. Some wake up kinder." },
  { id: 'drifting_grove', name: 'The Drifting Grove', zone: 'sporewood', rarity: 'legendary', tier: 4,
    epithet: 'The Meadow That Swims',
    weight: [20, 45], value: 320, food: 70, oil: 70, time: 'calm', depth: [0.75, 1], bait: 'glowcap_bulb', behavior: 'leaper',
    difficulty: diff(4, 'leaper', true),
    boss: {
      enrage: 75,
      phases: [
        { at: 0, name: 'Grazing', mechanic: 'none' },
        { at: 0.35, name: 'False Bloom', mechanic: 'decoy', decoyWidth: 1.4, swapOnSurge: true },
        { at: 0.7, name: 'Spore Veil', mechanic: 'flicker', every: 8, hide: 1.5 },
      ],
      cue: 'Spores burst from the water whenever she breaches.',
    },
    model: { shape: 'ray', body: 0x3a2a40, belly: 0xe8cfe0, fin: 0x6e4a72, glow: 0xffb46a, pattern: 'spots', eyes: 'glow', scale: 2.3 },
    hint: 'When the pools are quiet, something vast grazes in the deep. It hungers for Glowcap Bulbs.',
    lore: 'A whole meadow rides on her back. When she dives, it blooms beneath the water, where no one sees.' },

  // ---------------------------------------------------------------- glasswater (z2)
  { id: 'prism_minnow', name: 'Prism Minnow', zone: 'glasswater', rarity: 'common', tier: 2,
    weight: [0.05, 0.3], value: 24, food: 26, oil: 32, time: 'any', depth: [0, 0.6], bait: null, behavior: 'darter',
    difficulty: diff(2, 'darter'),
    model: { shape: 'minnow', body: 0x8fb8e8, belly: 0xeaf6ff, fin: 0x5ff2ff, glow: 0x5ff2ff, pattern: 'scales', eyes: 'normal', scale: 0.45 },
    lore: 'When the school turns at once, for an instant the water remembers the colour of the sky.' },
  { id: 'glassgill_perch', name: 'Glassgill Perch', zone: 'glasswater', rarity: 'common', tier: 3,
    weight: [0.5, 2], value: 28, food: 32, oil: 30, time: 'any', depth: [0.15, 0.8], bait: null, behavior: 'steady',
    difficulty: diff(3, 'steady'),
    model: { shape: 'perch', body: 0x3d4a8a, belly: 0xcfe0ff, fin: 0x8ab8ff, glow: null, pattern: 'scales', eyes: 'normal', scale: 0.85 },
    lore: 'You can see its heart through its side. It beats slower when you watch.' },
  { id: 'glassblown_puffer', name: 'Glassblown Puffer', zone: 'glasswater', rarity: 'common', tier: 3,
    weight: [0.3, 1.2], value: 26, food: 28, oil: 34, time: 'any', depth: [0, 0.55], bait: null, behavior: 'thrasher',
    difficulty: diff(3, 'thrasher'),
    model: { shape: 'puffer', body: 0x6a7ad0, belly: 0xe6ecff, fin: 0xb48cff, glow: 0xb48cff, pattern: 'spots', eyes: 'normal', scale: 0.7 },
    lore: 'Puffed, it rings faintly like a wineglass. The Vault was full of them once, all ringing.' },
  { id: 'chime_jelly', name: 'Chime Jelly', zone: 'glasswater', rarity: 'uncommon', tier: 3,
    weight: [0.5, 2], value: 56, food: 18, oil: 50, time: 'calm', depth: [0.25, 0.85], bait: 'glass_larva', behavior: 'darter',
    difficulty: diff(3, 'darter'),
    model: { shape: 'jelly', body: 0xb6a6ff, belly: 0xf2eeff, fin: 0x7f6aff, glow: 0xb48cff, pattern: 'none', eyes: 'blind', scale: 0.8 },
    hint: 'It answers the hum of Glass Larvae, and only while the Vault is calm.',
    lore: 'It chimes when it brushes crystal. It is the only thing in the Vault still keeping time.' },
  { id: 'mirror_pike', name: 'Mirror Pike', zone: 'glasswater', rarity: 'uncommon', tier: 4,
    weight: [3, 10], value: 62, food: 38, oil: 40, time: 'any', depth: [0.5, 1], bait: null, behavior: 'darter',
    difficulty: diff(4, 'darter'),
    model: { shape: 'pike', body: 0x9aa8c8, belly: 0xf2f6ff, fin: 0x4a5aa8, glow: null, pattern: 'scales', eyes: 'normal', scale: 1.3 },
    lore: 'Its silver flank shows you yourself, a little more tired than you remember.' },
  { id: 'shardspine_eel', name: 'Shardspine Eel', zone: 'glasswater', rarity: 'rare', tier: 4,
    weight: [2, 6], value: 130, food: 36, oil: 56, time: 'gloom', depth: [0.4, 1], bait: null, behavior: 'thrasher',
    difficulty: diff(4, 'thrasher'),
    model: { shape: 'eel', body: 0x1a1f4a, belly: 0x6a7ad0, fin: 0x5ff2ff, glow: 0x5ff2ff, pattern: 'bands', eyes: 'glow', scale: 1.35 },
    hint: 'Hunts by the sound of breaking, and only in the Gloomtide.',
    lore: 'Crystal grows along its spine like frost on a window. It hunts by the sound of breaking.' },
  { id: 'blind_scrivener', name: 'The Blind Scrivener', zone: 'glasswater', rarity: 'rare', tier: 4,
    weight: [4, 12], value: 120, food: 44, oil: 52, time: 'any', depth: [0.6, 1], bait: 'ember_roe', behavior: 'sinker',
    difficulty: diff(4, 'sinker'),
    model: { shape: 'angler', body: 0x1c1f3a, belly: 0x4a5aa8, fin: 0x0a0c20, glow: 0xb48cff, pattern: 'spots', eyes: 'blind', scale: 1.15 },
    hint: 'A predator that reads the dark by smell. Ember Roe, in the deepest water.',
    lore: 'Eyeless, it carries one glowing lure, as if reading the dark a single line at a time.' },
  { id: 'glass_sovereign', name: 'The Glass Sovereign', zone: 'glasswater', rarity: 'legendary', tier: 5,
    epithet: "Keeper of the Vault's Last Light",
    weight: [18, 40], value: 600, food: 80, oil: 90, time: 'gloom', depth: [0.8, 1], bait: 'prism_moth', behavior: 'leaper',
    difficulty: { power: 2.0, surgeEvery: 5.0, surgeTime: 1.3, stamina: 30, sweet: 0.6, erratic: 0.5, window: 0.45 },   // hand-tuned
    boss: {
      enrage: 90,
      phases: [
        { at: 0, name: 'Glide', mechanic: 'none' },
        { at: 0.35, name: 'Glass Glide', mechanic: 'mixedSurge', tell: 0.8 },
        { at: 0.7, name: 'Brittle Line', mechanic: 'brittle', snapAt: 0.92, shards: 2, shardWidth: 0.6 },
      ],
      cue: 'The whole Vault rings like struck glass. The swarm keeps coming: it is a Gloomtide fight.',
    },
    model: { shape: 'koi', body: 0xa8b8ff, belly: 0xf4f7ff, fin: 0x5ff2ff, glow: 0x5ff2ff, pattern: 'scales', eyes: 'glow', scale: 2.1 },
    hint: 'In the Gloomtide, in the deepest water, a Prism Moth draws a crown of light.',
    lore: 'It swallowed the Vault\'s last light and never let it go. Each scale is a window with no one behind it.' },

  // ---------------------------------------------------------------- paleabyss (z3)
  { id: 'ossuary_fry', name: 'Ossuary Fry', zone: 'paleabyss', rarity: 'common', tier: 3,
    weight: [0.05, 0.3], value: 42, food: 32, oil: 40, time: 'any', depth: [0, 0.6], bait: null, behavior: 'darter',
    difficulty: diff(3, 'darter'),
    model: { shape: 'minnow', body: 0xd8d2c0, belly: 0xf4f0e4, fin: 0x8a8270, glow: null, pattern: 'none', eyes: 'blind', scale: 0.45 },
    lore: 'Pale as the bones they nest in. They have never seen light and do not seem to miss it.' },
  { id: 'pallid_wraithfin', name: 'Pallid Wraithfin', zone: 'paleabyss', rarity: 'common', tier: 3,
    weight: [0.4, 2], value: 48, food: 38, oil: 42, time: 'any', depth: [0.1, 0.8], bait: null, behavior: 'steady',
    difficulty: diff(3, 'steady'),
    model: { shape: 'ghost', body: 0xbfb9a6, belly: 0xeeeadc, fin: 0x6e6a5c, glow: 0xeae4d3, pattern: 'none', eyes: 'blind', scale: 0.9 },
    lore: 'Hold one too long and you begin to forget its weight. Then, slowly, your own.' },
  { id: 'bonecrook_crayfish', name: 'Bonecrook Crayfish', zone: 'paleabyss', rarity: 'common', tier: 3,
    weight: [0.3, 1.2], value: 44, food: 40, oil: 36, time: 'any', depth: [0, 0.5], bait: null, behavior: 'sinker',
    difficulty: diff(3, 'sinker'),
    model: { shape: 'crayfish', body: 0x3a362e, belly: 0xd8d0b8, fin: 0xe8dcb8, glow: null, pattern: 'bands', eyes: 'normal', scale: 0.7 },
    lore: 'It builds its shell from whatever the deep lets fall. Some of what it wears was once a crown.' },
  { id: 'gilt_eyed_eel', name: 'Gilt-Eyed Eel', zone: 'paleabyss', rarity: 'uncommon', tier: 4,
    weight: [2, 7], value: 92, food: 40, oil: 56, time: 'any', depth: [0.4, 1], bait: null, behavior: 'thrasher',
    difficulty: diff(4, 'thrasher'),
    model: { shape: 'eel', body: 0x141310, belly: 0x5a5440, fin: 0x2a2618, glow: 0xd9b45a, pattern: 'bands', eyes: 'glow', scale: 1.4 },
    lore: 'Two gold coins for eyes, as if someone paid its passage and it never left the ferry.' },
  { id: 'shroud_ray', name: 'Shroud Ray', zone: 'paleabyss', rarity: 'uncommon', tier: 4,
    weight: [4, 12], value: 88, food: 44, oil: 48, time: 'any', depth: [0.45, 1], bait: null, behavior: 'leaper',
    difficulty: diff(4, 'leaper'),
    model: { shape: 'ray', body: 0xd8d2c0, belly: 0xf4f0e4, fin: 0x9a9480, glow: null, pattern: 'stripes', eyes: 'normal', scale: 1.35 },
    lore: 'It drifts like a burial cloth that has lost its sleeper and is still looking.' },
  { id: 'funeral_veil', name: 'Funeral Veil', zone: 'paleabyss', rarity: 'rare', tier: 4,
    weight: [0.8, 3], value: 190, food: 24, oil: 74, time: 'gloom', depth: [0.3, 0.9], bait: null, behavior: 'darter',
    difficulty: diff(4, 'darter'),
    model: { shape: 'jelly', body: 0xe9dfb8, belly: 0xfffaf0, fin: 0xd9b45a, glow: 0xd9b45a, pattern: 'none', eyes: 'blind', scale: 0.9 },
    hint: 'It follows the Gloom the way a widow follows a cart.',
    lore: "Its threads are fine as a widow's veil. It follows the Gloom the way a widow follows a cart." },
  { id: 'lampwarden_angler', name: 'Lampwarden Angler', zone: 'paleabyss', rarity: 'rare', tier: 5,
    weight: [6, 16], value: 210, food: 50, oil: 70, time: 'gloom', depth: [0.6, 1], bait: 'ember_roe', behavior: 'sinker',
    difficulty: diff(5, 'sinker'),
    model: { shape: 'angler', body: 0x0c0b09, belly: 0x3a3628, fin: 0x1a1812, glow: 0xe8c66a, pattern: 'spots', eyes: 'glow', scale: 1.25 },
    hint: 'Its lamp answers only Ember Roe, and only in the Gloomtide.',
    lore: 'The last lamp of the kingdom hangs from its jaw. It is still waiting for someone to come home.' },
  { id: 'pale_leviathan', name: 'The Pale Leviathan', zone: 'paleabyss', rarity: 'legendary', tier: 5, final: true,
    epithet: 'The Well Beneath the Kingdom',
    weight: [120, 300], value: 2500, food: 100, oil: 150, time: 'gloom', depth: [0.85, 1], bait: 'pale_marrow', behavior: 'sinker',
    difficulty: { power: 2.5, surgeEvery: 6.2, surgeTime: 1.8, stamina: 38, sweet: 0.62, erratic: 0.55, window: 0.45 },  // hand-tuned
    boss: {
      enrage: 110,
      noSlackEscape: true,                 // phases I-III: slack makes it dive instead of escaping
      slackDive: { progress: -0.12, tension: 0.35 },
      phases: [
        { at: 0, name: 'Deep Pull', mechanic: 'drag', drag: 0.08, bandOffset: -0.10 },
        { at: 0.25, name: 'Grasping Dark', mechanic: 'summon', enemy: 'pale_grasp', count: 2, gap: 4 },
        { at: 0.5, name: 'Eclipse', mechanic: 'eclipse', lightMult: 0.5, every: 3, warn: 0.6 },
        { at: 0.8, name: 'Last Breath', mechanic: 'shrink', sweetTo: 0.6, decayMult: 2, slackEscapes: true },
      ],
      cue: 'The water goes very still. Landing it ends the Gloomtide and wins the run.',
    },
    model: { shape: 'leviathan', body: 0xd8d2c0, belly: 0xf6f2e6, fin: 0x8a8270, glow: 0xe8c66a, pattern: 'scales', eyes: 'glow', scale: 3.5 },
    hint: 'Only Pale Marrow. Only in the Gloomtide. Only in the deepest water of the Pallid Deep.',
    lore: 'Older than the kingdom above. The kingdom fell into it the way a coin falls into a well.' },
];

// =====================================================================================
// BAITS — consumed one charge per cast (legend baits: consumed when the legendary is
// HOOKED). Species whose `bait` names a bait are hard-locked to it. `attract` ids get
// weight ×2.5. Optional bonus keys beyond STATS: weightBias, shimmer (quality score),
// gloomDraw (extra enemy spawn rate while equipped). price × BALANCE.economy.baitMult.
// =====================================================================================
export const BAITS = [
  { id: 'mireworm', name: 'Mire Worms', price: 8, count: 8, zoneMin: 0, unlock: null, legend: false, icon: 'worm',
    desc: 'Fat, patient worms from the moat mud. Bottom-feeders cannot help themselves.',
    bonus: { biteSpeed: 0.3, attract: ['gutter_crayfish', 'mossback_perch', 'weeping_carp', 'capshell_crayfish', 'plumgill_perch', 'bonecrook_crayfish'] } },
  { id: 'lumen_moss', name: 'Lumen Moss', price: 18, count: 5, zoneMin: 0, unlock: null, legend: false, icon: 'moss',
    desc: 'A pinch of moss that glows like a held breath. Things that shine are drawn to it.',
    bonus: { rarityBonus: 0.10, attract: ['candlefin_koi', 'prism_minnow', 'funeral_veil', 'pallid_wraithfin'] } },
  { id: 'spore_cake', name: 'Spore Cake', price: 26, count: 5, zoneMin: 1, unlock: null, legend: false, icon: 'cake',
    desc: 'Pressed spores and old honey. It smells like a garden asleep.',
    bonus: { hookWindow: 0.15, attract: ['sporebelly_puffer', 'velvet_ray', 'plumgill_perch'] } },
  { id: 'ember_roe', name: 'Ember Roe', price: 36, count: 4, zoneMin: 1, unlock: null, legend: false, icon: 'roe',
    desc: 'Roe that keeps a little warmth. Predators come for it, and so does the Gloom.',
    bonus: { rarityBonus: 0.15, weightBias: 0.35, gloomDraw: 0.2, attract: ['reedjaw_pike', 'mildew_angler', 'mirror_pike', 'shardspine_eel', 'gilt_eyed_eel'] } },
  { id: 'glass_larva', name: 'Glass Larvae', price: 48, count: 4, zoneMin: 2, unlock: null, legend: false, icon: 'larva',
    desc: 'Translucent larvae that hum when the water tenses. You will feel the bite coming.',
    bonus: { nibbleTells: 1, shimmer: 0.05, attract: ['glassblown_puffer', 'glassgill_perch', 'prism_minnow', 'shroud_ray'] } },
  { id: 'shimmerfly', name: 'Shimmerfly', price: 40, count: 3, zoneMin: 0, unlock: 'heavy_catch', legend: false, icon: 'fly',
    desc: 'A fly with wings like spilled oil. Fish that take it come up gleaming.',
    bonus: { shimmer: 0.12, rarityBonus: 0.04, attract: [] } },
  // legend baits — one per zone, fixed price, single use (spent on HOOK)
  { id: 'heartmoss', name: 'Heartmoss Ball', price: 40, count: 1, zoneMin: 0, zone: 'mossmere', unlock: null, legend: true, icon: 'heart',
    desc: 'Moss rolled around a warm stone. Old fishers say it beats if you hold it long enough.', bonus: {} },
  { id: 'glowcap_bulb', name: 'Glowcap Bulb', price: 90, count: 1, zoneMin: 1, zone: 'sporewood', unlock: null, legend: true, icon: 'cap',
    desc: 'A swollen cap that glows from inside, like a lantern somebody forgot to blow out.', bonus: {} },
  { id: 'prism_moth', name: 'Prism Moth', price: 170, count: 1, zoneMin: 2, zone: 'glasswater', unlock: null, legend: true, icon: 'moth',
    desc: 'Its wings split light into seven sorrows. Keep it in the dark until you need it.', bonus: {} },
  { id: 'pale_marrow', name: 'Pale Marrow', price: 320, count: 1, zoneMin: 3, zone: 'paleabyss', unlock: null, legend: true, icon: 'bone',
    desc: 'The marrow of something that should not have died. Only one thing down here is hungry enough.', bonus: { gloomDraw: 0.35 } },
];

// =====================================================================================
// UPGRADES — per-run gear bought from Old Murk with Shells. effects additive per level
// on STATS keys. costs.length === maxLevel. zone: appears once that zone is unlocked.
// =====================================================================================
export const UPGRADES = [
  { id: 'rod_ashwood', name: 'Ashwood Rod', category: 'rod', icon: 'rod', maxLevel: 3, costs: [40, 120, 300], zone: null,
    effects: { castMax: 3 }, desc: 'Longer, springier wood. Reach deeper water and farther spots.' },
  { id: 'rod_whalebone', name: 'Whalebone Tip', category: 'rod', icon: 'rod', maxLevel: 3, costs: [45, 130, 320], zone: null,
    effects: { hookWindow: 0.12, slackTime: 0.3 }, desc: 'Feels every twitch. More time to strike, more forgiveness on a slack line.' },
  { id: 'line_gut', name: 'Braided Gut Line', category: 'line', icon: 'line', maxLevel: 4, costs: [40, 110, 260, 520], zone: null,
    effects: { lineStrength: 0.15 }, desc: 'Twisted strands that take a surge without parting.' },
  { id: 'line_silver', name: 'Silverthread', category: 'line', icon: 'line', maxLevel: 2, costs: [480, 800], zone: 'paleabyss',
    effects: { lineStrength: 0.25, slackTime: 0.2 }, desc: 'Spun from something that should not exist. Strong enough for the deepest thing.' },
  { id: 'reel_brass', name: 'Brass Spool Reel', category: 'reel', icon: 'reel', maxLevel: 4, costs: [50, 130, 280, 520], zone: null,
    effects: { reelSpeed: 0.15 }, desc: 'Gears from a drowned clock. Bring them in faster.' },
  { id: 'reel_drag', name: 'Whisper Drag', category: 'reel', icon: 'reel', maxLevel: 3, costs: [60, 150, 340], zone: null,
    effects: { sweetZone: 0.02 }, desc: 'A soft brake that widens the sweet band.' },
  { id: 'lantern_chimney', name: 'Thick-Glass Chimney', category: 'lantern', icon: 'lantern', maxLevel: 3, costs: [45, 130, 300], zone: null,
    effects: { oilDrain: -0.012, maxOil: 15 }, desc: 'Holds the heat in. The flame sips instead of gulps.' },
  { id: 'lantern_mantle', name: 'Searing Mantle', category: 'lantern', icon: 'flame', maxLevel: 4, costs: [55, 140, 300, 560], zone: null,
    effects: { auraDps: 0.35 }, desc: 'A mantle of salted wick. Your light burns what it touches.' },
  { id: 'lantern_lens', name: 'Moth-Wing Lens', category: 'lantern', icon: 'lens', maxLevel: 3, costs: [90, 200, 420], zone: 'sporewood',
    effects: { lightRadius: 1.0, flareRadius: 1.0 }, desc: 'Ground from a thousand wings. Throws your light wider.' },
  { id: 'lantern_striker', name: 'Flint Striker', category: 'lantern', icon: 'spark', maxLevel: 3, costs: [55, 150, 330], zone: null,
    effects: { flareCooldown: -2, flareCost: -2, zapDamage: 1 }, desc: 'Sharper sparks: cheaper, faster flares and harder zaps.' },
  { id: 'creel_wicker', name: 'Woven Creel', category: 'creel', icon: 'creel', maxLevel: 4, costs: [30, 90, 200, 420], zone: null,
    effects: { creelSize: 1 }, desc: 'One more slot. One more choice you do not have to make tonight.' },
  { id: 'creel_frost', name: 'Frost-Moss Lining', category: 'creel', icon: 'creel', maxLevel: 3, costs: [100, 240, 480], zone: 'sporewood',
    effects: { sellMult: 0.12 }, desc: 'Keeps the catch fresh. Old Murk pays more for fish that still look surprised.' },
  { id: 'raft_brazier', name: 'Rendering Brazier', category: 'raft', icon: 'brazier', maxLevel: 3, costs: [55, 140, 310], zone: null,
    effects: { oilYieldMult: 0.2, foodMult: 0.15 }, desc: 'Render and cook on board. More oil and more meal from every fish.' },
  { id: 'raft_hull', name: 'Barnacle Hull', category: 'raft', icon: 'hull', maxLevel: 3, costs: [110, 250, 520], zone: 'sporewood',
    effects: { armor: 0.07 }, desc: 'Crusted planks. Some blows glance off.' },
  { id: 'raft_oars', name: 'Long Oars', category: 'raft', icon: 'oar', maxLevel: 3, costs: [40, 110, 260], zone: null,
    effects: { moveSpeed: 0.6 }, desc: 'Reach the spots first. Outrun what follows.' },
  { id: 'raft_hearth', name: 'Ember Hearth', category: 'raft', icon: 'hearth', maxLevel: 2, costs: [260, 600], zone: 'glasswater',
    effects: { maxHp: 1, maxSatiety: 15 }, desc: 'A little hearth that keeps a spare Ember warm.' },
  { id: 'lure_glimmer', name: 'Glimmer Spoon', category: 'lure', icon: 'lure', maxLevel: 3, costs: [70, 190, 420], zone: null,
    effects: { rarityBonus: 0.05, biteSpeed: 0.08 }, desc: 'A bent spoon that catches the light. Rarer fish come to look.' },
  { id: 'lure_feather', name: 'Trembling Feather', category: 'lure', icon: 'feather', maxLevel: 2, costs: [80, 220], zone: null,
    effects: { nibbleTells: 1, hookWindow: 0.08 }, desc: 'It shivers a heartbeat before the real bite.' },
];

// =====================================================================================
// SUPPLIES — consumables from Old Murk. price × BALANCE.economy.supplyMult[zoneIndex].
// give keys: oil, satiety, hp, flareCharges (next N flares cost no oil), spots (rare spots).
// =====================================================================================
export const SUPPLIES = [
  { id: 'oil_flask', name: "Murk's Lamp Oil", price: 18, give: { oil: 30 }, zoneMin: 0, limitPerVisit: 0, icon: 'oil',
    desc: 'Smells of frogs. Burns anyway.' },
  { id: 'tallow_jar', name: 'Tallow Jar', price: 50, give: { oil: 100 }, zoneMin: 1, limitPerVisit: 0, icon: 'oil',
    desc: 'A whole night of light, if you are careful. You will not be careful.' },
  { id: 'moss_cake', name: 'Dried Moss Cake', price: 14, give: { satiety: 30 }, zoneMin: 0, limitPerVisit: 0, icon: 'food',
    desc: 'Tastes of nothing, which is better than most things down here.' },
  { id: 'mushroom_loaf', name: 'Mushroom Loaf', price: 38, give: { satiety: 90 }, zoneMin: 1, limitPerVisit: 0, icon: 'food',
    desc: 'Dense, warm, faintly glowing. Do not ask what rose it.' },
  { id: 'wax_patch', name: 'Wax Patch', price: 45, give: { hp: 1 }, zoneMin: 0, limitPerVisit: 1, icon: 'ember',
    desc: 'Smooth it over the cracks. Mends one Ember.' },
  { id: 'flare_powder', name: 'Flare Powder', price: 30, give: { flareCharges: 2 }, zoneMin: 0, limitPerVisit: 0, icon: 'flare',
    desc: 'Your next two flares cost no oil.' },
  { id: 'tide_chart', name: 'Tide Chart', price: 40, give: { spots: 2 }, zoneMin: 0, limitPerVisit: 1, icon: 'map',
    desc: 'Two rich feeding spots surface now and stay until dusk.' },
];

// =====================================================================================
// RELICS — permanent, bought with Memories at the Shrine of Drowned Lanterns.
// effects on STATS keys (per level) and/or `special` ('key' or 'key:value', per level):
//   startShells:N  startKit  shimmer:N  memMult:N  secondWick  waystone:<zoneId>
// unlock: challenge id that reveals it (null = available). requires: {deepestZone}.
// =====================================================================================
export const RELICS = [
  { id: 'first_wick_stub', name: 'Stub of the First Wick', maxLevel: 2, costs: [90, 260], effects: { maxHp: 1 }, unlock: null, requires: { bestDay: 3 },
    desc: 'Barely a thumb of wax. It remembers being tall. +1 Ember.' },
  { id: 'oilskin_flask', name: 'Cracked Oilskin', maxLevel: 3, costs: [25, 70, 160], effects: { maxOil: 15 }, unlock: null,
    desc: 'It leaks, but only a little, and only when it is sad. +15 max oil.' },
  { id: 'bent_tin_spoon', name: 'Bent Tin Spoon', maxLevel: 3, costs: [25, 70, 160], effects: { maxSatiety: 15, satietyDrain: -0.006 }, unlock: null,
    desc: 'Someone ate every meal with this, slowly, to make it last.' },
  { id: 'seven_knots', name: 'Line of Seven Knots', maxLevel: 3, costs: [30, 90, 200], effects: { lineStrength: 0.1 }, unlock: null,
    desc: 'Each knot was tied by a different Wick. None have come undone.' },
  { id: 'steady_hook', name: "Grandmother's Hook", maxLevel: 3, costs: [30, 90, 200], effects: { hookWindow: 0.08, sweetZone: 0.012 }, unlock: 'perfect_10_run',
    desc: 'Blunted with use. It still remembers exactly when to bite.' },
  { id: 'listening_bobber', name: 'The Listening Bobber', maxLevel: 1, costs: [120], effects: { nibbleTells: 1 }, unlock: 'catch_100',
    desc: 'Painted with a small ear. It hears the difference between hunger and curiosity.' },
  { id: 'salt_glass_lens', name: 'Salt-Glass Lens', maxLevel: 3, costs: [40, 110, 240], effects: { lightRadius: 0.6, auraDps: 0.15 }, unlock: null,
    desc: 'Fitted to a lantern long since drowned. The light it bends still finds its way back.' },
  { id: 'two_headed_coin', name: 'Two-Headed Coin', maxLevel: 3, costs: [50, 140, 300], effects: { rarityBonus: 0.03, luck: 0.1 }, unlock: null, requires: { runs: 2 },
    desc: 'Lucky, they said. It came up heads every time. Even the last time.' },
  { id: 'mended_creel', name: 'Mended Creel', maxLevel: 2, costs: [35, 150], effects: { creelSize: 1 }, unlock: null,
    desc: "Patched with reed, ribbon, and a lock of someone's hair." },
  { id: 'torn_ledger', name: 'Torn Ledger Page', maxLevel: 3, costs: [45, 120, 260], effects: { sellMult: 0.06 }, unlock: 'shells_1000_run',
    desc: "A page from Old Murk's accounts. Your name is on it, crossed out, then written in again." },
  { id: 'ember_in_resin', name: 'Ember in Resin', maxLevel: 3, costs: [40, 110, 240], effects: { flareCooldown: -1.5, flareRadius: 0.5 }, unlock: 'bonfire_night',
    desc: 'A spark from a flare that once saved someone. It is still warm.' },
  { id: 'old_debt', name: "Murk's Old Debt", maxLevel: 4, costs: [20, 50, 110, 220], effects: {}, special: 'startShells:30', unlock: null,
    desc: 'He owes you. He will not say for what. +30 starting Shells per level.' },
  { id: 'drifters_bundle', name: "Drifter's Bundle", maxLevel: 2, costs: [40, 120], effects: {}, special: 'startKit', unlock: null, requires: { runs: 2 },
    desc: 'I: start with 8 Mire Worms and 3 Lumen Moss. II: also the starting zone\'s legend bait.' },
  { id: 'barnacle_cloak', name: 'Barnacle Cloak', maxLevel: 3, costs: [60, 160, 340], effects: { armor: 0.05 }, unlock: 'untouched',
    desc: 'Heavy, wet, and very hard to bite through.' },
  { id: 'shimmer_scale', name: 'Shimmering Scale', maxLevel: 3, costs: [50, 140, 300], effects: { rarityBonus: 0.02 }, special: 'shimmer:0.04', unlock: 'shimmering',
    desc: 'It never stops catching light. Neither, now, will your catches.' },
  { id: 'gamblers_wick', name: "Gambler's Wick", maxLevel: 2, costs: [60, 180], effects: { rerolls: 1 }, unlock: null, requires: { bestLevel: 10 },
    desc: 'Burns at both ends. One more chance to choose. +1 reroll per run.' },
  { id: 'remembrance', name: 'Remembrance', maxLevel: 3, costs: [80, 200, 400], effects: {}, special: 'memMult:0.08', unlock: 'kindled',
    desc: 'The water remembers a little more of you each time. +8% Memories per level.' },
  { id: 'second_wick', name: 'Second Wick', maxLevel: 1, costs: [300], effects: {}, special: 'secondWick', unlock: 'into_the_vault',
    desc: 'Once per run, a killing blow leaves you at 1 Ember with 40 oil and a free flare.' },
  { id: 'waystone_sporewood', name: 'Waystone: Sporewood', maxLevel: 1, costs: [120], effects: {}, special: 'waystone:sporewood', unlock: null, requires: { deepestZone: 1 },
    desc: 'Charcoal pressed against a mossy stone. Begin a descent in Sporewood Pools with a purse of 160 Shells.' },
  { id: 'waystone_glasswater', name: 'Waystone: Glasswater', maxLevel: 1, costs: [260], effects: {}, special: 'waystone:glasswater', unlock: null, requires: { deepestZone: 2 },
    desc: 'A rubbing of a cold, clear stone. Begin in the Glasswater Vault with 450 Shells.' },
  { id: 'waystone_paleabyss', name: 'Waystone: Pallid Deep', maxLevel: 1, costs: [450], effects: {}, special: 'waystone:paleabyss', unlock: null, requires: { deepestZone: 3 },
    desc: 'A stone no Wick should have reached. It still points down. Begin in the Pallid Deep with 950 Shells.' },
];

// =====================================================================================
// ENEMIES — gloomlings of the night swarm. model ∈ CREATURE_KINDS. Numbers are base
// values (× difficultyFor hpMult/speedMult/damageMult). damage = Embers on contact;
// oilDrain = oil per contact (or per second while latched / gripping). weights =
// spawn weight per zone index (0 = never). dayMin applies only in the enemy's zoneMin.
// pack = members per spawn event. elite/boss are spawned by timers, not the bag.
// =====================================================================================
export const ENEMIES = [
  // ---- the Mossmere and everywhere
  { id: 'gloomling', name: 'Gloomling', model: 'wisp', zoneMin: 0, dayMin: 1, hp: 2, speed: 2.2, damage: 1, oilDrain: 2, xp: 1,
    behavior: 'chase', pack: 1, weights: [10, 6, 4, 3], burstOnContact: true,
    telegraph: { pause: 0.4, lungeMult: 3, lungeAt: 2.5 }, tint: 0x07080d, eyeColor: 0xe8f1f2, scale: 1,
    desc: 'A fist-sized curl of living ink with two pinprick eyes. It wants your warmth, a sip at a time.' },
  { id: 'inkmite', name: 'Inkmite', model: 'mite', zoneMin: 0, dayMin: 2, hp: 1, speed: 3.2, damage: 1, oilDrain: 1, xp: 0.5,
    behavior: 'pack', pack: 5, weights: [5, 4, 3, 2], burstOnContact: true, tint: 0x0a0a10, eyeColor: 0xd6f59a, scale: 0.8,
    desc: 'Skittering specks of shadow that come in clutches. One is nothing. Twelve is a problem.' },
  { id: 'duskmantle', name: 'Duskmantle', model: 'moth', zoneMin: 0, dayMin: 2, hp: 2, speed: 2.8, damage: 0, oilDrain: 1.0, xp: 2,
    behavior: 'latch', pack: 2, weights: [3, 4, 2, 1], maxLatched: 4, dim: 0.12, gutterAfter: 6, gutterAt: 3, tint: 0x6a5f78, eyeColor: 0x9fe8ff, scale: 1,
    desc: 'A dusty moth with eye-spots that glow. It does not bite. It simply drinks your light until there is none.' },
  { id: 'creelsnatch', name: 'Creelsnatch', model: 'eel', zoneMin: 0, dayMin: 3, hp: 4, speed: 4.5, damage: 1, oilDrain: 0, xp: 3,
    behavior: 'leap', pack: 1, weights: [2, 3, 2, 0], maxAlive: 2, steals: true, telegraph: { circle: [3, 6], surface: 1.2, leap: 0.6 }, fleeTime: 2.5,
    tint: 0x07080d, eyeColor: 0xd6f59a, scale: 1,
    desc: 'A ribbon of shadow with glowing hook-teeth. It leaps the raft to steal from your creel.' },
  { id: 'drowned_hand', name: 'Drowned Hand', model: 'hand', zoneMin: 0, dayMin: 2, hp: 30, speed: 0, damage: 2, oilDrain: 10, xp: 15,
    behavior: 'slam', pack: 1, weights: [0, 0, 0, 0], elite: true, eliteWeights: [10, 6, 2, 0], shells: 6,
    telegraph: { stain: 1.2, breach: 1.0, rear: 0.8, zapDelay: 0.5 }, snapsLine: true, tint: 0x07080d, eyeColor: 0xe8f1f2, scale: 1,
    desc: 'A colossal dripping hand that rises beside the raft. Ink stains the water first. Then the fingers.' },
  // ---- Sporewood Pools
  { id: 'sporeling', name: 'Sporeling Drift', model: 'wisp', zoneMin: 1, dayMin: 1, hp: 3, speed: 2.4, damage: 1, oilDrain: 2, xp: 1.5,
    behavior: 'orbitDive', pack: 3, weights: [0, 5, 3, 2], orbit: { radius: 8, time: 2, diveGap: 0.5 }, deathBurst: { damage: 2, radius: 2 },
    burstOnContact: true, tint: 0x1a0d1c, eyeColor: 0xffb46a, scale: 1,
    desc: 'Three drifting puffs that circle, then dive one by one. Burst one and its spores hurt the others.' },
  { id: 'spore_tick', name: 'Spore Tick', model: 'mite', zoneMin: 1, dayMin: 1, hp: 2, speed: 3.4, damage: 1, oilDrain: 1, xp: 0.75,
    behavior: 'pack', pack: 6, weights: [0, 4, 3, 2], burstOnContact: true, tint: 0x150a14, eyeColor: 0xff7fb0, scale: 0.85,
    desc: 'Ticks swollen with spore-light. They swarm in sixes and pop like seed pods.' },
  // ---- Glasswater Vault
  { id: 'prism_eel', name: 'Prism Eel', model: 'eel', zoneMin: 2, dayMin: 1, hp: 6, speed: 5, damage: 1, oilDrain: 6, xp: 4,
    behavior: 'leapFeint', pack: 1, weights: [0, 0, 3, 2], maxAlive: 2, steals: true, telegraph: { circle: [3, 5], surface: 1.2, leap: 0.6, feint: 0.8 }, fleeTime: 2.5,
    tint: 0x05081a, eyeColor: 0x5ff2ff, scale: 1.1,
    desc: 'Refracted cyan under the water. Its first leap is a lie. The second one takes a fish.' },
  { id: 'veil_matron', name: 'Veil Matron', model: 'moth', zoneMin: 2, dayMin: 1, hp: 10, speed: 1.8, damage: 0, oilDrain: 1.8, xp: 6,
    behavior: 'latchBrood', pack: 1, weights: [0, 0, 2, 1], maxAlive: 2, dim: 0.30, broodEvery: 5, brood: 'duskmantle', tint: 0x2a2244, eyeColor: 0xb48cff, scale: 1.8,
    desc: 'A great slow moth that settles over the lantern and lays more moths in the dark it makes.' },
  { id: 'shard_mite', name: 'Shard Mite', model: 'mite', zoneMin: 2, dayMin: 1, hp: 4, speed: 3.0, damage: 1, oilDrain: 1, xp: 1,
    behavior: 'pack', pack: 5, weights: [0, 0, 4, 3], armor: 0.3, burstOnContact: true, tint: 0x0a0f24, eyeColor: 0x5ff2ff, scale: 0.9,
    desc: 'Mites crusted in crystal. Light glances off them; a hard zap does not.' },
  { id: 'undertow_grasp', name: 'The Undertow Grasp', model: 'hand', zoneMin: 2, dayMin: 1, hp: 60, speed: 0, damage: 2, oilDrain: 15, xp: 25,
    behavior: 'slam', pack: 1, weights: [0, 0, 0, 0], elite: true, eliteWeights: [0, 0, 8, 3], shells: 10, tipsCreel: 2,
    telegraph: { stain: 1.5, breach: 1.2, rear: 0.8, zapDelay: 0.5 }, snapsLine: true, tint: 0x03040e, eyeColor: 0x5ff2ff, scale: 1.3,
    desc: 'The water blackens and a low rumble rises. If it closes, it tips fish from your creel.' },
  // ---- The Pallid Deep
  { id: 'silent_choir', name: 'Silent Choir', model: 'wisp', zoneMin: 3, dayMin: 1, hp: 5, speed: 2.6, damage: 1, oilDrain: 4, xp: 2,
    behavior: 'stalk', pack: 3, weights: [0, 0, 0, 6], invisibleOutsideLight: true, rushBelowOil: 0.3, rushMult: 1.5, burstOnContact: true,
    tint: 0x020202, eyeColor: 0xeae4d3, scale: 1.1,
    desc: 'Only pinprick eyes in the dark until they step into your light. When your oil runs low, they run.' },
  { id: 'pyrewing', name: 'Pyrewing Matron', model: 'moth', zoneMin: 3, dayMin: 1, hp: 12, speed: 2.6, damage: 1, oilDrain: 4, xp: 6,
    behavior: 'divePass', pack: 1, weights: [0, 0, 0, 2], maxAlive: 3, splitInto: { id: 'duskmantle', count: 2 }, tint: 0xd8d2c0, eyeColor: 0xe8c66a, scale: 1.7,
    desc: 'A bone-white moth with sickly-gold eye-spots. It dives in passes, and splits in two when slain.' },
  { id: 'pale_grasp', name: 'Pale Grasp', model: 'hand', zoneMin: 3, dayMin: 1, hp: 80, speed: 0, damage: 2, oilDrain: 15, xp: 35,
    behavior: 'gripSlam', pack: 2, weights: [0, 0, 0, 0], elite: true, eliteWeights: [0, 0, 0, 10], shells: 14,
    telegraph: { stain: 1.2, breach: 0.8, rear: 0.6, zapDelay: 0.5, pairGap: 1.0 }, grip: { oilPerSec: 3, tensionPerSec: 0.05, aimJitterDeg: 8, maxTime: 8 },
    snapsLine: true, tint: 0xd8d2c0, eyeColor: 0xe8c66a, scale: 1.4,
    desc: 'Bone-pale hands with tarnished rings, rising in pairs. A landed slam grips the raft and drinks.' },
  // ---- Wardens: one night boss per zone (boss nights: day % 3 === 0)
  { id: 'the_wickeater', name: 'The Wickeater', model: 'warden', zoneMin: 0, dayMin: 1, hp: 150, speed: 1.4, damage: 2, oilDrain: 20, xp: 60,
    behavior: 'warden', boss: true, zone: 'mossmere', shells: 40, weights: [0, 0, 0, 0],
    abilities: [{ id: 'inhale', every: 9, telegraph: 1.5, radius: 7, pull: 4, oil: 20 }, { id: 'summon', every: 12, enemy: 'gloomling', count: 6 }],
    tint: 0x050c0d, eyeColor: 0x6ff5c8, scale: 1,
    desc: 'A colossal hooded gloom with a hollow, glowing maw. It eats candles. It has eaten many.' },
  { id: 'the_sporeshroud', name: 'The Sporeshroud', model: 'warden', zoneMin: 1, dayMin: 1, hp: 300, speed: 1.5, damage: 2, oilDrain: 20, xp: 90,
    behavior: 'warden', boss: true, zone: 'sporewood', shells: 80, weights: [0, 0, 0, 0],
    abilities: [{ id: 'sporeCloud', every: 10, telegraph: 1.2, radius: 6, lightMult: 0.6, duration: 4 }, { id: 'summon', every: 11, enemy: 'sporeling', count: 6 }],
    tint: 0x0b060d, eyeColor: 0xffb46a, scale: 1.1,
    desc: 'A shroud of mould wearing the shape of a mourner. Where it breathes, light grows thin.' },
  { id: 'the_shard_abbot', name: 'The Shard Abbot', model: 'warden', zoneMin: 2, dayMin: 1, hp: 550, speed: 1.6, damage: 2, oilDrain: 25, xp: 130,
    behavior: 'warden', boss: true, zone: 'glasswater', shells: 140, weights: [0, 0, 0, 0],
    abilities: [{ id: 'shardRing', every: 8, telegraph: 1.0, count: 10, damage: 1, speed: 7 }, { id: 'summon', every: 12, enemy: 'shard_mite', count: 10 }],
    tint: 0x03040e, eyeColor: 0x5ff2ff, scale: 1.2,
    desc: 'Robed in shelved crystal, it hurls rings of glass. Each shard hums a different hymn.' },
  { id: 'the_lightless_ferryman', name: 'The Lightless Ferryman', model: 'warden', zoneMin: 3, dayMin: 1, hp: 900, speed: 1.7, damage: 3, oilDrain: 30, xp: 200,
    behavior: 'warden', boss: true, zone: 'paleabyss', shells: 220, weights: [0, 0, 0, 0],
    abilities: [{ id: 'inhale', every: 8, telegraph: 1.3, radius: 8, pull: 5, oil: 30 }, { id: 'eclipse', every: 14, telegraph: 1.5, lightMult: 0.4, duration: 4 }, { id: 'summon', every: 10, enemy: 'silent_choir', count: 6 }],
    tint: 0x020202, eyeColor: 0xe8c66a, scale: 1.35,
    desc: 'It poles a boat that is not there. It has come for every light the kingdom ever lit.' },
];

// =====================================================================================
// BOONS — level-up picks during the night (1 of 3). kind 'stat' (effects on STATS keys
// per level) or 'weapon' (levels[i] = full params at level i+1). unlock: challenge id.
// Caps: BALANCE.xp.maxWeapons distinct weapons, maxPassives distinct stat boons.
// =====================================================================================
export const BOONS = [
  // ---------------- weapons
  { id: 'circling_cinders', name: 'Circling Cinders', icon: 'orbit', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'orbit', unlock: null, tags: ['fire', 'area'],
    desc: 'Embers circle your lantern, scorching what they touch.',
    levels: [
      { count: 2, damage: 3, radius: 2.6, speed: 2.2, hitCooldown: 0.5 },
      { count: 3, damage: 3, radius: 2.6, speed: 2.2, hitCooldown: 0.5 },
      { count: 3, damage: 5, radius: 2.8, speed: 2.5, hitCooldown: 0.45 },
      { count: 4, damage: 5, radius: 3.0, speed: 2.5, hitCooldown: 0.45 },
      { count: 5, damage: 7, radius: 3.2, speed: 2.8, hitCooldown: 0.4 },
    ] },
  { id: 'drifting_motes', name: 'Drifting Motes', icon: 'motes', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'motes', unlock: null, tags: ['light', 'projectile'],
    desc: 'Little lights drift out and seek the nearest gloomling.',
    levels: [
      { count: 2, damage: 4, cooldown: 1.6, speed: 9, range: 14 },
      { count: 3, damage: 4, cooldown: 1.6, speed: 9, range: 14 },
      { count: 3, damage: 6, cooldown: 1.4, speed: 10, range: 15 },
      { count: 4, damage: 6, cooldown: 1.3, speed: 10, range: 16 },
      { count: 5, damage: 8, cooldown: 1.2, speed: 11, range: 17 },
    ] },
  { id: 'burning_wake', name: 'Burning Wake', icon: 'trail', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'trail', unlock: null, tags: ['fire', 'area', 'movement'],
    desc: 'While the raft moves, it leaves a ribbon of fire on the water.',
    levels: [
      { dps: 4, life: 2.5, width: 1.4, minSpeed: 1 },
      { dps: 6, life: 2.5, width: 1.5, minSpeed: 1 },
      { dps: 6, life: 3.5, width: 1.7, minSpeed: 1 },
      { dps: 9, life: 3.5, width: 1.9, minSpeed: 0.8 },
      { dps: 12, life: 4.0, width: 2.2, minSpeed: 0.5 },
    ] },
  { id: 'bone_harpoons', name: 'Bone Harpoons', icon: 'hook', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'hook', unlock: null, tags: ['projectile', 'pierce'],
    desc: 'The raft fires barbed bone hooks that pierce through the swarm.',
    levels: [
      { count: 1, damage: 10, pierce: 2, cooldown: 2.0, speed: 16, range: 18 },
      { count: 1, damage: 14, pierce: 3, cooldown: 2.0, speed: 16, range: 18 },
      { count: 2, damage: 14, pierce: 3, cooldown: 1.8, speed: 17, range: 19 },
      { count: 2, damage: 18, pierce: 4, cooldown: 1.6, speed: 18, range: 20 },
      { count: 3, damage: 22, pierce: 5, cooldown: 1.4, speed: 18, range: 22 },
    ] },
  { id: 'forked_spark', name: 'Forked Spark', icon: 'spark', rarity: 'rare', maxLevel: 5, kind: 'weapon', weapon: 'spark', unlock: null, tags: ['light', 'chain'],
    desc: 'Lightning leaps from the lantern and forks from gloomling to gloomling.',
    levels: [
      { damage: 6, chains: 2, cooldown: 2.2, range: 9, chainRange: 4 },
      { damage: 6, chains: 3, cooldown: 2.0, range: 9, chainRange: 4 },
      { damage: 9, chains: 3, cooldown: 1.8, range: 10, chainRange: 4.5 },
      { damage: 9, chains: 4, cooldown: 1.6, range: 10, chainRange: 4.5 },
      { damage: 12, chains: 5, cooldown: 1.4, range: 11, chainRange: 5 },
    ] },
  { id: 'lantern_pulse', name: 'Lantern Pulse', icon: 'nova', rarity: 'rare', maxLevel: 5, kind: 'weapon', weapon: 'nova', unlock: 'three_nights', tags: ['light', 'area', 'knockback'],
    desc: 'Every few heartbeats your lantern throbs, hurling back everything near.',
    levels: [
      { damage: 8, radius: 7, cooldown: 5, knock: 2 },
      { damage: 10, radius: 7.5, cooldown: 4.6, knock: 2 },
      { damage: 13, radius: 8, cooldown: 4.2, knock: 2.5 },
      { damage: 16, radius: 8.5, cooldown: 3.8, knock: 2.5 },
      { damage: 20, radius: 9.5, cooldown: 3.4, knock: 3 },
    ] },
  { id: 'tolling_bell', name: 'Tolling Bell', icon: 'bell', rarity: 'rare', maxLevel: 5, kind: 'weapon', weapon: 'bell', unlock: 'unwarded', tags: ['area', 'slow'],
    desc: 'A drowned bell rings from the raft. Gloomlings in its toll stagger and slow.',
    levels: [
      { damage: 4, radius: 8, slow: 0.4, slowTime: 2, cooldown: 6 },
      { damage: 5, radius: 9, slow: 0.45, slowTime: 2, cooldown: 5.5 },
      { damage: 7, radius: 10, slow: 0.5, slowTime: 2.5, cooldown: 5 },
      { damage: 9, radius: 11, slow: 0.55, slowTime: 2.5, cooldown: 4.5 },
      { damage: 12, radius: 12, slow: 0.6, slowTime: 3, cooldown: 4 },
    ] },
  { id: 'lighthouse_beam', name: 'Lighthouse Beam', icon: 'beam', rarity: 'epic', maxLevel: 5, kind: 'weapon', weapon: 'beam', unlock: 'lamplighter', tags: ['light', 'area'],
    desc: 'A slow-turning beam of hard light sweeps the water around you.',
    levels: [
      { dps: 10, length: 12, width: 0.8, turnSpeed: 1.2, beams: 1 },
      { dps: 13, length: 13, width: 0.9, turnSpeed: 1.3, beams: 1 },
      { dps: 13, length: 13, width: 0.9, turnSpeed: 1.3, beams: 2 },
      { dps: 17, length: 14, width: 1.0, turnSpeed: 1.4, beams: 2 },
      { dps: 22, length: 16, width: 1.1, turnSpeed: 1.5, beams: 3 },
    ] },
  // ---------------- stat boons
  { id: 'brighter_wick', name: 'Brighter Wick', icon: 'light', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { lightRadius: 0.8 }, unlock: null, tags: ['light'],
    desc: '+0.8 m light radius. Your aura reaches farther.' },
  { id: 'searing_glow', name: 'Searing Glow', icon: 'flame', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { auraDps: 0.5 }, unlock: null, tags: ['fire'],
    desc: '+0.5 lantern burn per second.' },
  { id: 'fierce_flame', name: 'Fierce Flame', icon: 'damage', rarity: 'rare', maxLevel: 5, kind: 'stat', effects: { damageMult: 0.12 }, unlock: null, tags: ['damage'],
    desc: '+12% damage from every source.' },
  { id: 'quick_hands', name: 'Quick Hands', icon: 'cooldown', rarity: 'rare', maxLevel: 5, kind: 'stat', effects: { cooldownMult: -0.07 }, unlock: null, tags: ['cooldown'],
    desc: 'Flares and weapons recover 7% faster.' },
  { id: 'keen_spark', name: 'Keen Spark', icon: 'crit', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { critChance: 0.06 }, unlock: null, tags: ['damage'],
    desc: '+6% chance to deal double damage.' },
  { id: 'swift_oars', name: 'Swift Oars', icon: 'oar', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { moveSpeed: 0.6 }, unlock: null, tags: ['movement'],
    desc: '+0.6 m/s raft speed.' },
  { id: 'cinder_magnet', name: 'Cinder Magnet', icon: 'magnet', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { pickupRadius: 1.2 }, unlock: null, tags: ['utility'],
    desc: 'Cinders drift to you from 1.2 m farther.' },
  { id: 'old_wisdom', name: 'Old Wisdom', icon: 'xp', rarity: 'rare', maxLevel: 5, kind: 'stat', effects: { xpMult: 0.1 }, unlock: null, tags: ['utility'],
    desc: '+10% cinders from every gloomling.' },
  { id: 'lucky_knot', name: 'Lucky Knot', icon: 'luck', rarity: 'rare', maxLevel: 3, kind: 'stat', effects: { luck: 0.15, rarityBonus: 0.02 }, unlock: null, tags: ['luck', 'fishing'],
    desc: 'Rarer boons and rarer fish come a little more often.' },
  { id: 'kindling_heart', name: 'Kindling Heart', icon: 'ember', rarity: 'epic', maxLevel: 3, kind: 'stat', effects: { maxHp: 1 }, unlock: null, tags: ['survival'],
    desc: '+1 Ember, and mend 1 Ember now.' },
  { id: 'slow_burn', name: 'Slow Burn', icon: 'oil', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { oilDrain: -0.012, maxOil: 10 }, unlock: null, tags: ['survival'],
    desc: 'The flame sips. -0.012 oil burn, +10 max oil.' },
  { id: 'hardened_wax', name: 'Hardened Wax', icon: 'ward', rarity: 'rare', maxLevel: 4, kind: 'stat', effects: { armor: 0.06 }, unlock: null, tags: ['survival'],
    desc: '+6% chance to ward off a blow.' },
  { id: 'wildfire', name: 'Wildfire', icon: 'flare', rarity: 'rare', maxLevel: 3, kind: 'stat', effects: { flareRadius: 1.5, flareCost: -2 }, unlock: null, tags: ['flare'],
    desc: 'Flares burst 1.5 m wider and cost 2 less oil.' },
  { id: 'static_fingers', name: 'Static Fingers', icon: 'zap', rarity: 'common', maxLevel: 4, kind: 'stat', effects: { zapDamage: 1.5, zapCost: -0.15 }, unlock: null, tags: ['zap'],
    desc: 'Zaps hit harder and cost less oil.' },
  { id: 'patient_line', name: 'Patient Line', icon: 'line', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { lineStrength: 0.1, slackTime: 0.15 }, unlock: null, tags: ['fishing'],
    desc: 'A steadier line: +0.1 strength, more slack grace.' },
  { id: 'nimble_reel', name: 'Nimble Reel', icon: 'reel', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { reelSpeed: 0.1, sweetZone: 0.01 }, unlock: null, tags: ['fishing'],
    desc: 'Reel 10% faster with a slightly wider sweet band.' },
  { id: 'hungry_waters', name: 'Hungry Waters', icon: 'bite', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { biteSpeed: 0.1, hookWindow: 0.06 }, unlock: null, tags: ['fishing'],
    desc: 'Fish bite sooner and hold the hook a moment longer.' },
  { id: 'dawnsong', name: 'Dawnsong', icon: 'dawn', rarity: 'epic', maxLevel: 2, kind: 'stat', effects: { dawnHeal: 1 }, unlock: null, tags: ['survival'],
    desc: 'Mend one more Ember every dawn.' },
  // ---------------- legendary boons (challenge unlocks)
  { id: 'undying_ember', name: 'Undying Ember', icon: 'ember', rarity: 'legendary', maxLevel: 1, kind: 'stat', effects: { maxHp: 2, dawnHeal: 1 }, unlock: 'pallid_arrival', tags: ['survival'],
    desc: '+2 Embers and +1 dawn mending. A flame that refuses.' },
  { id: 'moonless_calm', name: 'Moonless Calm', icon: 'moon', rarity: 'legendary', maxLevel: 1, kind: 'stat', effects: { auraDps: 1.5, lightRadius: 2 }, unlock: 'four_silences', tags: ['light', 'fire'],
    desc: 'Your light becomes a wall. +1.5 burn, +2 m radius.' },
  { id: 'gilded_hook', name: 'Gilded Hook', icon: 'gold', rarity: 'legendary', maxLevel: 1, kind: 'stat', effects: { rarityBonus: 0.1, sellMult: 0.15 }, unlock: 'five_clean', tags: ['fishing', 'luck'],
    desc: 'Rarer fish, and Old Murk pays 15% more for them.' },
];

// =====================================================================================
// CHARACTERS — playable Wicks. effects on STATS keys (flat). unlock: challenge id.
// =====================================================================================
export const CHARACTERS = [
  { id: 'wick', name: 'The Wick', title: 'A Small, Stubborn Flame', unlock: null,
    desc: 'Balanced in all things. Fishes, sails and burns about as well as any candle can.',
    effects: {}, startBoon: null, startKit: { shells: 0, bait: {} },
    look: { flame: 0xffb347, cloak: 0x4a2e24, eyes: 0xffb347, hat: 'none', wax: 0xe9dfc6 } },
  { id: 'taper', name: 'Taper', title: 'The Long Reach', unlock: 'steady_hands',
    desc: 'Thin and tall. Casts far and reels true, but carries little oil.',
    effects: { castMax: 4, reelSpeed: 0.1, maxOil: -15 }, startBoon: null, startKit: { shells: 0, bait: { mireworm: 8 } },
    look: { flame: 0xffd27a, cloak: 0x34404a, eyes: 0xffd27a, hat: 'tall', wax: 0xf2ead8 } },
  { id: 'stub', name: 'Stub', title: 'The Bright Little One', unlock: 'down_the_sluice',
    desc: 'Tiny, quick and fiercely bright. Light reaches farther; Embers are few.',
    effects: { lightRadius: 2, moveSpeed: 1, maxHp: -1, creelSize: -1 }, startBoon: 'swift_oars', startKit: { shells: 30, bait: {} },
    look: { flame: 0xfff0a8, cloak: 0x5a3a1e, eyes: 0xfff0a8, hat: 'none', wax: 0xf6efd9 } },
  { id: 'tallow', name: 'Tallow', title: 'The Stout Candle', unlock: 'week_of_gloom',
    desc: 'Broad and slow-burning. Extra Embers and a deep belly, but a heavy hand on the reel.',
    effects: { maxHp: 1, maxSatiety: 25, satietyDrain: -0.01, reelSpeed: -0.1, moveSpeed: -0.5 }, startBoon: null, startKit: { shells: 0, bait: {} },
    look: { flame: 0xff9a4a, cloak: 0x3e3a24, eyes: 0xffb347, hat: 'hood', wax: 0xe2d4b0 } },
  { id: 'ashwick', name: 'Ashwick', title: 'Burned Once, Burns Back', unlock: 'gloombreaker',
    desc: 'A charred wick that hunts the dark. Starts with Circling Cinders; fishes poorly.',
    effects: { auraDps: 0.5, damageMult: 0.1, hookWindow: -0.1, creelSize: -1 }, startBoon: 'circling_cinders', startKit: { shells: 0, bait: {} },
    look: { flame: 0xff6a3d, cloak: 0x1e1a1a, eyes: 0xff6a3d, hat: 'hood', wax: 0x8a8070 } },
  { id: 'glimmer', name: 'Glimmerwick', title: "The Fisher's Fortune", unlock: 'cartographer',
    desc: 'Lucky with rare fish and sharp at the market, but its light burns thin.',
    effects: { rarityBonus: 0.08, sellMult: 0.1, auraDps: -0.3 }, startBoon: 'lucky_knot', startKit: { shells: 0, bait: { lumen_moss: 3 } },
    look: { flame: 0x9fe8d8, cloak: 0x2a3e44, eyes: 0x9fe8d8, hat: 'brim', wax: 0xeae8dc } },
];

// =====================================================================================
// CHALLENGES — the checklist. scope 'run' = within one run; 'total' = lifetime.
// type + params are read by progression. reward.unlock keys 'character:<id>' etc.
// =====================================================================================
export const CHALLENGES = [
  { id: 'first_light', name: 'First Light', desc: 'Land your first fish.', type: 'catch', params: { n: 1 }, scope: 'total', reward: { unlock: null, memories: 5 } },
  { id: 'steady_hands', name: 'Steady Hands', desc: 'Land 25 fish across all descents.', type: 'catch', params: { n: 25 }, scope: 'total', reward: { unlock: 'character:taper', memories: 10 } },
  { id: 'catch_100', name: 'Old Hand', desc: 'Land 100 fish across all descents.', type: 'catch', params: { n: 100 }, scope: 'total', reward: { unlock: 'relic:listening_bobber', memories: 20 } },
  { id: 'naturalist', name: 'Naturalist', desc: 'Name 8 species in the Journal.', type: 'journal', params: { n: 8 }, scope: 'total', reward: { unlock: null, memories: 15 } },
  { id: 'cartographer', name: 'Cartographer of Gills', desc: 'Name 16 species in the Journal.', type: 'journal', params: { n: 16 }, scope: 'total', reward: { unlock: 'character:glimmer', memories: 25 } },
  { id: 'complete_chronicle', name: 'The Complete Chronicle', desc: 'Name every species in the Journal.', type: 'journal', params: { n: 32 }, scope: 'total', reward: { unlock: null, memories: 200 } },
  { id: 'three_nights', name: 'Three Long Nights', desc: 'Endure 3 Gloomtides in one descent.', type: 'nights', params: { n: 3 }, scope: 'run', reward: { unlock: 'boon:lantern_pulse', memories: 10 } },
  { id: 'week_of_gloom', name: 'A Week of Gloom', desc: 'Endure 7 Gloomtides in one descent.', type: 'nights', params: { n: 7 }, scope: 'run', reward: { unlock: 'character:tallow', memories: 25 } },
  { id: 'gloombreaker', name: 'Gloombreaker', desc: 'Disperse 500 gloomlings across all descents.', type: 'slay', params: { n: 500 }, scope: 'total', reward: { unlock: 'character:ashwick', memories: 15 } },
  { id: 'lamplighter', name: "Lamplighter's Vengeance", desc: 'Disperse 2500 gloomlings across all descents.', type: 'slay', params: { n: 2500 }, scope: 'total', reward: { unlock: 'boon:lighthouse_beam', memories: 30 } },
  { id: 'bonfire_night', name: 'Bonfire Night', desc: 'Disperse 150 gloomlings in a single Gloomtide.', type: 'slayNight', params: { n: 150 }, scope: 'run', reward: { unlock: 'relic:ember_in_resin', memories: 20 } },
  { id: 'unwarded', name: 'Unwarded', desc: 'Slay a Warden.', type: 'boss', params: { n: 1 }, scope: 'total', reward: { unlock: 'boon:tolling_bell', memories: 20 } },
  { id: 'four_silences', name: 'Four Silences', desc: 'Slay all four Wardens.', type: 'bossDistinct', params: { ids: ['the_wickeater', 'the_sporeshroud', 'the_shard_abbot', 'the_lightless_ferryman'] }, scope: 'total', reward: { unlock: 'boon:moonless_calm', memories: 60 } },
  { id: 'untouched', name: 'Untouched', desc: 'Endure a Gloomtide without losing an Ember.', type: 'nightNoDamage', params: { n: 1 }, scope: 'run', reward: { unlock: 'relic:barnacle_cloak', memories: 15 } },
  { id: 'perfect_10_run', name: 'Clockwork Wrist', desc: 'Set 10 perfect hooks in one descent.', type: 'perfectHooks', params: { n: 10 }, scope: 'run', reward: { unlock: 'relic:steady_hook', memories: 15 } },
  { id: 'five_clean', name: 'Five Clean Strikes', desc: 'Chain 5 perfect hooks in a row.', type: 'streak', params: { n: 5 }, scope: 'run', reward: { unlock: 'boon:gilded_hook', memories: 20 } },
  { id: 'down_the_sluice', name: 'Down the Sluice', desc: 'Reach Sporewood Pools.', type: 'reachZone', params: { zone: 'sporewood' }, scope: 'total', reward: { unlock: 'character:stub', memories: 20 } },
  { id: 'into_the_vault', name: 'Into the Vault', desc: 'Reach the Glasswater Vault.', type: 'reachZone', params: { zone: 'glasswater' }, scope: 'total', reward: { unlock: 'relic:second_wick', memories: 30 } },
  { id: 'pallid_arrival', name: 'Where the Light Was Laid', desc: 'Reach the Pallid Deep.', type: 'reachZone', params: { zone: 'paleabyss' }, scope: 'total', reward: { unlock: 'boon:undying_ember', memories: 40 } },
  { id: 'kindled', name: 'Kindled', desc: 'Reach level 15 in one descent.', type: 'level', params: { n: 15 }, scope: 'run', reward: { unlock: 'relic:remembrance', memories: 20 } },
  { id: 'shells_1000_run', name: "Murk's Favourite", desc: 'Earn 1000 Shells in one descent.', type: 'shells', params: { n: 1000 }, scope: 'run', reward: { unlock: 'relic:torn_ledger', memories: 20 } },
  { id: 'shimmering', name: 'Shimmering', desc: 'Land a Shimmering fish.', type: 'quality', params: { quality: 'perfect' }, scope: 'total', reward: { unlock: 'relic:shimmer_scale', memories: 10 } },
  { id: 'heavy_catch', name: 'Heavyweight', desc: 'Land a non-legendary fish over 8 kg.', type: 'weight', params: { kg: 8, excludeLegendary: true }, scope: 'total', reward: { unlock: 'bait:shimmerfly', memories: 10 } },
  { id: 'four_legends', name: 'Four Legends', desc: 'Land every legendary fish.', type: 'legendaries', params: { ids: ['belled_matriarch', 'drifting_grove', 'glass_sovereign', 'pale_leviathan'] }, scope: 'total', reward: { unlock: null, memories: 150 } },
  { id: 'light_comes_up', name: 'The Light Comes Up', desc: 'Land the Pale Leviathan.', type: 'victory', params: {}, scope: 'total', reward: { unlock: null, memories: 100 } },
];

// =====================================================================================
// BOUNTIES — Old Murk's ledger templates. reward Shells = round(base × zone.valueMult
// × (1 + dayGrowth × (day-1))). Up to 2 offered per visit, 3 active, due end of day+2.
// =====================================================================================
export const BOUNTIES = [
  { id: 'catch_species', type: 'catchSpecies', text: 'Bring me {n} {species}.', params: { n: [2, 3], rarities: ['common', 'uncommon'] }, base: 18, perN: 8, weight: 3, zoneMin: 0, dayMin: 1 },
  { id: 'catch_uncommon', type: 'catchRarity', text: 'Land {n} uncommon fish.', params: { rarity: 'uncommon', n: 2 }, base: 35, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'catch_rare', type: 'catchRarity', text: 'Land a rare fish.', params: { rarity: 'rare', n: 1 }, base: 45, weight: 2, zoneMin: 0, dayMin: 2 },
  { id: 'heavy', type: 'heavy', text: 'Land a {species} over {kg} kg.', params: { percentile: 0.75 }, base: 40, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'perfect_hooks', type: 'perfectHooks', text: 'Set {n} perfect hooks.', params: { n: [3, 5] }, base: 30, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'streak', type: 'streak', text: 'Chain {n} perfect hooks in a row.', params: { n: [3, 4] }, base: 45, weight: 1, zoneMin: 0, dayMin: 2 },
  { id: 'unscathed', type: 'unscathed', text: "Endure tonight's Gloomtide without losing an Ember.", params: {}, base: 50, weight: 2, zoneMin: 0, dayMin: 2 },
  { id: 'disperse', type: 'slayNight', text: 'Disperse {n} gloomlings in one Gloomtide.', params: { nBase: 25, perZone: 15, perDay: 3 }, base: 30, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'no_flare', type: 'noFlare', text: 'Endure the Gloomtide without a single flare.', params: {}, base: 40, weight: 1, zoneMin: 1, dayMin: 1 },
  { id: 'quality', type: 'quality', text: 'Bring me a fine fish, or better.', params: { quality: 'fine' }, base: 35, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'night_fish', type: 'nightFish', text: 'Catch something that only rises in the Gloomtide.', params: {}, base: 40, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'sell_visit', type: 'sellVisit', text: 'Sell me {n} fish in a single visit.', params: { nBase: 4 }, base: 25, weight: 1, zoneMin: 0, dayMin: 2 },
  { id: 'spot_catch', type: 'spotCatch', text: 'Catch {n} fish from shimmering spots.', params: { n: 3 }, base: 30, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'break_hand', type: 'slayElite', text: 'Break a hand that rises from the water.', params: { n: 1 }, base: 35, weight: 1, zoneMin: 0, dayMin: 2 },
  { id: 'legend_hunt', type: 'legend', text: 'They say {legend} stirs. Land it.', params: {}, base: 60, weight: 0, zoneMin: 0, dayMin: 1, special: true, memories: 6 },
];

// =====================================================================================
// QUALITY — catch quality from reel score q (see DESIGN.md §4.8). chance = flat luck
// chance to bump a catch one tier up (before shimmer bonuses).
// =====================================================================================
export const QUALITY = {
  normal:  { id: 'normal',  label: 'Common',     valueMult: 1,   yieldMult: 1,    threshold: 0,    chance: 0,    color: 0xd8d2c0 },
  fine:    { id: 'fine',    label: 'Fine',       valueMult: 1.4, yieldMult: 1.1,  threshold: 0.45, chance: 0.05, color: 0x9fe8d8 },
  perfect: { id: 'perfect', label: 'Shimmering', valueMult: 2.5, yieldMult: 1.25, threshold: 0.78, chance: 0.01, color: 0xffe2a8 },
};

// JOURNAL_PERKS — permanent bonus for naming every species of a zone. Stored as
// meta.unlocks['perk:<zoneId>'] = true and added by getStats().
export const JOURNAL_PERKS = {
  mossmere:   { label: 'Moss-Reader', effects: { hookWindow: 0.08 }, desc: '+8% hook window, forever.' },
  sporewood:  { label: 'Spore-Cook', effects: { foodMult: 0.1, oilYieldMult: 0.1 }, desc: '+10% meal value and render yield, forever.' },
  glasswater: { label: 'Glass-Eye', effects: { rarityBonus: 0.04 }, desc: '+4% rare fish luck, forever.' },
  paleabyss:  { label: 'Bone-Counter', effects: { sellMult: 0.08 }, desc: '+8% sale price, forever.' },
};

export const FISH_SHAPES = ['minnow', 'perch', 'carp', 'pike', 'eel', 'angler', 'ray', 'puffer', 'jelly', 'crayfish', 'koi', 'ghost', 'leviathan'];
export const CREATURE_KINDS = ['wisp', 'mite', 'moth', 'eel', 'hand', 'warden'];
export const RARITY_WEIGHTS = { common: 70, uncommon: 24, rare: 6 };   // fish pool; uncommon ×(1+2rb), rare ×(1+4rb)
export const RARITY_COLORS = { common: 0xd8d2c0, uncommon: 0x9fe8d8, rare: 0xb48cff, legendary: 0xe8c66a, epic: 0xff8fc0 };

// =====================================================================================
// TIPS — first-run hints. trigger = 'event' or 'event:<disc>' where disc =
// payload.phase ?? payload.resource ?? payload.reason ?? payload.state ?? payload.id.
// =====================================================================================
export const TIPS = [
  { id: 'sail_basics',   trigger: 'run:start',               text: 'Sail with WASD or the left stick. Shimmering water marks a feeding spot.' },
  { id: 'cast_basics',   trigger: 'player:anchor',           text: "Hold on the water to charge a cast. Release near the meter's peak." },
  { id: 'nibble_wait',   trigger: 'fishing:nibble',          text: 'Only a nibble. Wait for the bobber to plunge, then tap.' },
  { id: 'miss_early',    trigger: 'fishing:miss:early',      text: "Too eager. Nibbles are tests. Strike when the bobber sinks and '!' shows." },
  { id: 'miss_late',     trigger: 'fishing:miss:late',       text: 'Too slow. Tap the instant it plunges. A fast hook earns a finer catch.' },
  { id: 'miss_moved',    trigger: 'fishing:miss:moved',      text: 'Moving the raft pulls your line. Stay still while you fish.' },
  { id: 'reel_band',     trigger: 'fishing:hook',            text: 'Hold to reel, release to ease. Keep tension in the pale band; the bright core doubles it.' },
  { id: 'surge_release', trigger: 'fishing:surge',           text: 'It surges! Let go until the fury passes, or your line will snap.' },
  { id: 'escaped_slack', trigger: 'fishing:escaped:slack',   text: 'A slack line lets them slip free. Always keep a little tension.' },
  { id: 'escaped_snap',  trigger: 'fishing:escaped:snap',    text: 'Snapped. Release during surges. Old Murk sells stronger line.' },
  { id: 'catch_choice',  trigger: 'fish:landed',             text: 'Eat it for Satiety, Render it for Oil, or Keep it to sell to Old Murk.' },
  { id: 'merchant',      trigger: 'merchant:arrive',         text: "A bell across the water. Old Murk has moored. Sail to his lamp to trade." },
  { id: 'trade_prompt',  trigger: 'interact:change:merchant', text: 'Press E or tap Trade. Sell your creel, buy gear, take a bounty.' },
  { id: 'dusk_warn',     trigger: 'phase:change:dusk',       text: 'The light is thinning. Murk has gone. Fill your lantern while you can.' },
  { id: 'gloomtide',     trigger: 'phase:change:gloomtide',  text: 'Gloomtide. Your light burns what enters it. Keep oil high and the light stays wide.' },
  { id: 'enemy_zap',     trigger: 'enemy:spawn',             text: 'Tap a gloomling to zap it. Press F or Flare to burst everything near.' },
  { id: 'cinders',       trigger: 'enemy:slain',             text: 'Gloomlings leave cinders. Gather them to grow your flame.' },
  { id: 'levelup',       trigger: 'levelup',                 text: 'Your flame grows. Choose a boon: it lasts the whole descent.' },
  { id: 'low_oil',       trigger: 'resource:low:oil',        text: 'Your lantern gutters. Render a fish into Oil before the dark takes you.' },
  { id: 'low_food',      trigger: 'resource:low:satiety',    text: 'Your wax runs thin with hunger. Eat something from the creel.' },
  { id: 'low_hp',        trigger: 'resource:low:hp',         text: 'Two Embers left. A warm meal at dawn mends you; so does a Wax Patch.' },
  { id: 'steal',         trigger: 'enemy:steal',             text: 'Something stole from your creel! Zap it before it dives to get the fish back.' },
  { id: 'dawn',          trigger: 'phase:change:dawn',       text: 'You outlasted the Gloomtide. Each night it returns hungrier. Spend wisely.' },
  { id: 'gate_open',     trigger: 'gate:open',               text: 'The Descent Gate churns open. Pay the toll at the whirlpool to go deeper.' },
  { id: 'warden',        trigger: 'boss:spawn',              text: 'A Warden rises. Kite it, flare its brood, and keep your light wide.' },
  { id: 'new_species',   trigger: 'journal:new',             text: 'A new name in the Journal. Some fish answer only to certain baits; it remembers which.' },
  { id: 'zone_unlock',   trigger: 'zone:unlock',             text: 'Deeper waters pay more, and the dark there bites harder.' },
];

// =====================================================================================
// Text banks.
// =====================================================================================
export const MERCHANT_LINES = {
  arrive: [
    'Ding-a-ling. Still burning? Good. The dead don\'t haggle.',
    "Murk's here. Murk's always here, eventually.",
    'Smelled your lantern three bends back. Wasteful, little flame.',
    'Mind the barge. She bites when she\'s lonely.',
  ],
  browse: [
    "Look all you like. Looking's free. Light isn't.",
    'That one? Fished it off a Wick like you. Near enough like you.',
    'Everything here was somebody\'s last hope once.',
    "Take your time. I've had centuries. Fewer than I'd like.",
  ],
  buy: [
    'A fine choice. Mine again, eventually, when you sink.',
    'Shells, shells. They clink like little teeth.',
    "Pleasure. Truly. You'd be surprised how rarely.",
    "Spend it now. Shells don't float.",
  ],
  sell: [
    'Fresh enough. Fresher than me.',
    "I'll take it. Don't tell it what I'm going to do with it.",
    'Good weight. Good eyes. Good riddance.',
  ],
  poor: [
    'Your purse is lighter than your flame, little Wick.',
    'Credit? Ha. The drowned all asked for credit.',
    "Come back richer. Or come back at all. That'd be a start.",
  ],
  warn: [
    'Tide\'s turning. Murk casts off soon.',
    'Last call, little flame. The barge won\'t wait for the dark.',
  ],
  farewell: [
    "Tide's turning. Murk doesn't stay for the Gloom. Nobody sensible does.",
    'Burn slow, little flame.',
    "Same time tomorrow, if there is a tomorrow. There usually isn't.",
  ],
  legendary: [
    'You hauled THAT up? With those arms? The deep will be talking for weeks.',
    'Even old Murk takes his hat off to that. Metaphorically. The hat stays.',
    'Something enormous just stopped being a legend. Celebrate quietly. Things are listening.',
  ],
  lowOil: [
    'Your light\'s gone thin as soup. Buy oil, or render something. Quickly.',
    "I've seen that flicker before. Usually right before the quiet.",
    'Gutter like that and the Gloom comes calling. Oil\'s on the left.',
  ],
  pity: ['Here. Don\'t make it a habit. Murk is not a charity. Murk is barely a toad.'],
};

export const EPITAPHS = {
  darkness: [
    'Here a small flame flickered, and the dark, at last, leaned close.',
    'It burned to the very end of its wick. There was simply no more wick.',
    'The lantern went quiet first. Then the Wick did. Then the water.',
    'Darkness does not take. It only waits, and it is very good at waiting.',
  ],
  starvation: [
    'Surrounded by fish, it forgot to eat. The water does not forgive forgetting.',
    'Its flame grew thin as a whisper, then thinner, then not at all.',
    'Hunger is a quiet Gloom. It came without a single shadow.',
    'It traded every catch for Shells and kept nothing for itself.',
  ],
  gloom: [
    'The gloomlings came for the light, as they always do. This time they kept it.',
    'Too many hands in the dark, and only one small flame.',
    'The Gloomtide rose, and a little light went under with it.',
    'They say the Gloom is only the drowned, missing warmth. They missed this one most.',
  ],
  default: ['Another Wick drifts down to the Shrine. It will not be the last.'],
};

export const TEXT = {
  title: 'GLOOMWATER',
  tagline: 'Fish the drowned dark. Keep your little light alive.',
  taglineAlts: [
    'Below the fallen kingdom, the water remembers.',
    'Every flame goes out. Make yours go out deep.',
    'A small light, a long line, a hungry dark.',
  ],
  premise: 'Long ago the Lamplit Kingdom hung a great lantern over its lake. When the lantern fell, the kingdom followed it into the water. The Wicks are what is left of its candles: small, stubborn flames on rafts, fishing so they stay lit. Somewhere below, the Pale Leviathan carries the great lantern\'s last ember in its belly.',
  zoneEnter: {
    mossmere: 'The moat still holds the shape of the walls it guarded.',
    sporewood: 'The air here is sweet enough to sleep in. Do not.',
    glasswater: 'Your light comes back to you from a thousand shards, a little colder each time.',
    paleabyss: 'Somewhere below, something vast exhales. The water rises a finger-width, then falls.',
  },
  phaseBanner: {
    calm: ['Day {day}', 'The waters still'],
    dusk: ['The Light Thins', 'Gloomtide gathers at the edges'],
    gloomtide: ['The Gloomtide Rises', 'Guard your flame'],
    dawn: ['Grey Dawn', 'The dark withdraws, for now'],
  },
  bossBanner: ['{name}', 'A Warden rises from the Gloom'],
  legendaryHooked: '{name}: {epithet}',
  legendPoolToast: 'A golden stillness gathers far out. Something legendary is listening.',
  victoryHooked: 'The water goes very still.',
  gateOpenToast: 'The Descent Gate churns open.',
  deathTitle: { darkness: 'Your Light Went Out', starvation: 'The Wax Ran Thin', gloom: 'Taken by the Gloomtide', default: 'Extinguished' },
  memoriesHeader: 'What the Water Remembers',
  memoryLabels: {
    nights: 'Nights endured', depth: 'Deepest water reached', fish: 'Fish landed', species: 'New names in the Journal',
    legendaries: 'Legends hauled up', trophies: 'Trophies mounted', bounties: 'Bounties honoured', enemies: 'Gloomlings dispersed',
    wardens: 'Wardens silenced', victory: 'The light came up', remembrance: 'Remembrance',
  },
  summaryFlavour: [
    { maxDay: 1, text: 'The first night is the hungriest. It usually wins.' },
    { maxDay: 3, text: 'A short flame, but an honest one.' },
    { maxDay: 6, text: "You learned the water's moods. The water learned yours." },
    { maxDay: 10, text: 'Few Wicks see a seventh dawn. Fewer remember it.' },
    { maxDay: 999, text: 'Old Murk will tell this one, badly, for years.' },
  ],
  records: { deepest: 'Deepest descent: {zone}', biggest: 'Biggest catch: {name}, {kg} kg', journal: 'The Journal holds {n} of {total} names.' },
  victoryTitle: 'The Light Comes Up',
  victorySubtitle: 'The Pale Leviathan is landed.',
  victory: [
    'At the very end it stopped fighting, as if it had been waiting.',
    "In its belly glimmered the kingdom's last great ember: the light that fell so long ago and took everything down with it.",
    'One by one, the drowned candles of the Deep catch. Far above, something like morning.',
    'You are still very small. You are still burning.',
  ],
  victoryButtons: { title: 'Return to the Surface', endless: 'Keep Drifting' },
  shrineTitle: 'Shrine of Drowned Lanterns',
  shrineSubtitle: 'Every Wick that fell left something behind.',
  waystoneText: 'Waystones remember the way down. Begin your descent in any water you have reached before.',
  journalTitle: "The Wick's Journal",
  journalUnknown: 'An unfamiliar ripple. Something here has not yet been named.',
  challengesTitle: 'Trials of the Wick',
  creelFull: 'Your creel is full. Eat, render, release, or let this one go.',
  newRecord: 'New record!',
};

// =====================================================================================
// Functions.
// =====================================================================================
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Night intensity multiplier over gloomtide progress k (build-up, swell, crescendo, quiet). */
export function nightCurve(k = 0.5) {
  const N = BALANCE.combat.night;
  k = clamp01(k);
  if (k >= N.quietFrom) return 0;
  if (k < N.buildUntil) return N.buildMult;
  if (k >= N.crescendoFrom) return N.crescendoMult;
  return 1;
}

/**
 * Night difficulty for a given day, zone and gloomtide progress k (0..1).
 * spawnRate is enemies per second (pack members count individually). damageMult is
 * the multiplier on damage dealt TO the Wick. kinds = weighted spawn bag (no elites,
 * no bosses). elites = weighted elite pool used every `eliteEvery` seconds.
 */
export function difficultyFor(day = 1, zoneIndex = 0, k = 0.5) {
  const z = Math.max(0, Math.min(ZONES.length - 1, zoneIndex | 0));
  const dayN = Math.max(1, day | 0);
  const d0 = dayN - 1;
  const d = Math.min(d0, 14);                      // enemy escalation plateaus on day 15
  const g = ZONES[z].gloom;
  const spawnRate = +(0.55 * Math.pow(g, 0.8) * (1 + 0.12 * d) * nightCurve(k)).toFixed(3);
  const maxAlive = Math.min(BALANCE.combat.maxLive, Math.round(25 + 6 * d + 15 * z));
  const hpMult = +((1 + 0.10 * d) * (1 + 0.35 * z)).toFixed(3);
  const speedMult = +Math.min(1.6, (1 + 0.035 * d) * (1 + 0.07 * z)).toFixed(3);
  const damageMult = Math.min(2.25, 1 + 0.25 * Math.floor((d0 + 3 * z) / 5));   // uses d0: keeps rising in endless
  const drainMult = +(1 + 0.03 * d0).toFixed(3);                                  // never plateaus
  const available = (e) => z > e.zoneMin || (z === e.zoneMin && dayN >= (e.dayMin || 1));
  const kinds = [];
  const elites = [];
  for (const e of ENEMIES) {
    if (!available(e)) continue;
    if (e.boss) continue;
    if (e.elite) { const w = e.eliteWeights?.[z] ?? 0; if (w > 0) elites.push({ id: e.id, w }); continue; }
    const w = e.weights?.[z] ?? 0;
    if (w > 0) kinds.push({ id: e.id, w });
  }
  const eliteEvery = dayN < 2 || !elites.length ? 0 : Math.max(10, 45 - 3 * d - 5 * z);
  const boss = dayN % BALANCE.combat.bossEvery === 0 ? (ZONES[z].warden || null) : null;
  return { spawnRate, maxAlive, hpMult, speedMult, damageMult, drainMult, kinds, eliteEvery, boss, elites, day: dayN, zoneIndex: z, k };
}

/** Gloomtide length (s) on a given day. */
export function gloomtideLength(day = 1) {
  return Math.min(BALANCE.gloomMax, BALANCE.phases.gloomtide + BALANCE.gloomGrowth * (Math.max(1, day | 0) - 1));
}

/** Cinders (XP) needed to go from `level` to `level + 1`. */
export function xpForLevel(level = 1) {
  const c = BALANCE.xp.curve, L = Math.max(1, level | 0) - 1;
  return Math.round(c.base + c.lin * L + c.quad * L * L);
}

const countOf = (v) => (Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : Number(v) || 0);

/**
 * Memories earned by a run. Accepts {day, zoneIndex, fishCaught, newSpecies, legendaries,
 * bountiesDone, enemiesSlain, victory} plus optional {nightsSurvived, bossesSlain,
 * trophies:[zoneIndex], memMult, firstVictory}. legendaries / bountiesDone / trophies may
 * be numbers, arrays or objects.
 */
export function memoriesFor(summary = {}) {
  const s = summary || {};
  const zi = Math.max(0, Math.min(3, (s.zoneIndex ?? 0) | 0));
  const day = Math.max(1, (s.day ?? 1) | 0);
  const nights = Math.max(0, s.nightsSurvived ?? (day - 1));
  const L = TEXT.memoryLabels;
  const rows = [
    { label: L.nights, value: Math.round(nights * (3 + 1.5 * zi)) },
    { label: L.depth, value: [0, 15, 35, 60][zi] },
    { label: L.fish, value: Math.floor((s.fishCaught || 0) / 2) },
    { label: L.species, value: 3 * (s.newSpecies || 0) },
    { label: L.legendaries, value: 20 * countOf(s.legendaries) },
    { label: L.bounties, value: BALANCE.bounty.memoriesEach * countOf(s.bountiesDone) },
    { label: L.enemies, value: Math.floor((s.enemiesSlain || 0) / 25) },
    { label: L.wardens, value: 15 * (s.bossesSlain || 0) },
  ];
  if (Array.isArray(s.trophies) && s.trophies.length) {
    rows.push({ label: L.trophies, value: s.trophies.reduce((a, t) => a + (BALANCE.economy.trophyMemories[t | 0] || 0), 0) });
  }
  if (s.victory) rows.push({ label: L.victory, value: s.firstVictory === false ? 100 : 150 });
  let subtotal = rows.reduce((a, r) => a + r.value, 0);
  if (s.memMult > 0) {
    const extra = Math.round(subtotal * s.memMult);
    rows.push({ label: L.remembrance, value: extra });
    subtotal += extra;
  }
  const breakdown = rows.filter((r) => r.value > 0);
  return { total: subtotal, breakdown };
}

// =====================================================================================
// Lookup maps.
// =====================================================================================
const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
export const SPECIES_BY_ID = byId(SPECIES);
export const ZONE_BY_ID = byId(ZONES);
export const ENEMY_BY_ID = byId(ENEMIES);
export const UPGRADE_BY_ID = byId(UPGRADES);
export const RELIC_BY_ID = byId(RELICS);
export const BAIT_BY_ID = byId(BAITS);
export const SUPPLY_BY_ID = byId(SUPPLIES);
export const BOON_BY_ID = byId(BOONS);
export const CHARACTER_BY_ID = byId(CHARACTERS);
export const CHALLENGE_BY_ID = byId(CHALLENGES);
export const BOUNTY_BY_ID = byId(BOUNTIES);
export const LEGENDARY_BY_ZONE = Object.fromEntries(ZONES.map((z) => [z.id, SPECIES.find((s) => s.zone === z.id && s.rarity === 'legendary')?.id || null]));
