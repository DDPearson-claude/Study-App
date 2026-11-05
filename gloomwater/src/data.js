// data.js — GLOOMWATER content & balance tables (design team).
// Pure ES module, no imports. Implements CONTRACT.md §8; every rule that reads these
// numbers is specified in DESIGN.md (section numbers in the table headers below).
// Conventions: colours are hex NUMBERS; times in seconds; distances in metres; speeds
// in m/s. Optional/extra fields beyond the contract are read with `?.` / `??`.
// Vocabulary: Embers = health (hearts), Cinders = XP dropped by gloomlings, Shells =
// run currency, Memories = meta currency, Relics = permanent upgrades.

// =====================================================================================
// STATS (DESIGN §6–§10) — every stat key the game reads. base = value before
// character, upgrades, relics, journal perks and stat boons (all ADDITIVE per level).
// min/max = clamps applied by progression.getStats() after summing.
// =====================================================================================
export const STATS = {
  maxHp:         { label: 'Embers',          base: 5,    fmt: 'int', min: 1,    max: 12 },
  maxOil:        { label: 'Lantern Oil',     base: 100,  fmt: 'int', min: 40,   max: 260 },
  maxSatiety:    { label: 'Satiety',         base: 100,  fmt: 'int', min: 40,   max: 220 },
  oilDrain:      { label: 'Oil Burn',        base: 0.17, fmt: 'num', min: 0.05, max: 1 },
  satietyDrain:  { label: 'Hunger',          base: 0.10, fmt: 'num', min: 0.04, max: 1 },
  lightRadius:   { label: 'Light Radius',    base: 8,    fmt: 'm',   min: 3,    max: 18 },
  auraDps:       { label: 'Lantern Burn',    base: 2.0,  fmt: 'num', min: 0,    max: 40 },
  flareCost:     { label: 'Flare Cost',      base: 16,   fmt: 'int', min: 6,    max: 60 },
  flareRadius:   { label: 'Flare Radius',    base: 10,   fmt: 'm',   min: 4,    max: 20 },
  flareCooldown: { label: 'Flare Cooldown',  base: 16,   fmt: 's',   min: 6,    max: 60 },
  zapCost:       { label: 'Zap Cost',        base: 1,    fmt: 'num', min: 0.3,  max: 10 },
  zapDamage:     { label: 'Zap Damage',      base: 6,    fmt: 'num', min: 1,    max: 60 },
  damageMult:    { label: 'Damage',          base: 1,    fmt: 'x',   min: 0.2,  max: 5 },
  cooldownMult:  { label: 'Cooldowns',       base: 1,    fmt: 'x',   min: 0.4,  max: 2 },
  critChance:    { label: 'Critical Chance', base: 0.05, fmt: 'pct', min: 0,    max: 0.75 },
  moveSpeed:     { label: 'Raft Speed',      base: 6,    fmt: 'num', min: 2,    max: 11 },
  pickupRadius:  { label: 'Cinder Magnet',   base: 4,    fmt: 'm',   min: 1,    max: 20 },
  xpMult:        { label: 'Cinder Gain',     base: 1,    fmt: 'x',   min: 0.2,  max: 4 },
  luck:          { label: 'Luck',            base: 0,    fmt: 'num', min: 0,    max: 2 },
  rerolls:       { label: 'Rerolls',         base: 1,    fmt: 'int', min: 0,    max: 9 },
  dawnHeal:      { label: 'Dawn Mending',    base: 1,    fmt: 'int', min: 0,    max: 5 },
  castMax:       { label: 'Cast Range',      base: 16,   fmt: 'm',   min: 8,    max: 30 },
  lineStrength:  { label: 'Line Strength',   base: 1,    fmt: 'x',   min: 0.5,  max: 2.5 },
  reelSpeed:     { label: 'Reel Speed',      base: 1,    fmt: 'x',   min: 0.4,  max: 2.2 },
  sweetZone:     { label: 'Sweet Band',      base: 0.16, fmt: 'pct', min: 0.06, max: 0.30 },
  biteSpeed:     { label: 'Bite Speed',      base: 1,    fmt: 'x',   min: 0.4,  max: 2 },
  hookWindow:    { label: 'Hook Window',     base: 1,    fmt: 'x',   min: 0.5,  max: 1.6 },
  rarityBonus:   { label: 'Rare Fish Luck',  base: 0,    fmt: 'pct', min: 0,    max: 0.6 },
  creelSize:     { label: 'Creel Slots',     base: 4,    fmt: 'int', min: 2,    max: 10 },
  sellMult:      { label: 'Sale Price',      base: 1,    fmt: 'x',   min: 0.5,  max: 2 },
  foodMult:      { label: 'Meal Value',      base: 1,    fmt: 'x',   min: 0.5,  max: 2 },
  oilYieldMult:  { label: 'Render Yield',    base: 1,    fmt: 'x',   min: 0.5,  max: 2 },
  armor:         { label: 'Ward',            base: 0,    fmt: 'pct', min: 0,    max: 0.6 },
  slackTime:     { label: 'Slack Grace',     base: 1.6,  fmt: 's',   min: 0.6,  max: 3 },
  nibbleTells:   { label: 'Nibble Sense',    base: 0,    fmt: 'int', min: 0,    max: 2 },
};

// =====================================================================================
// BALANCE — every timing / drain / damage / tuning constant referenced by DESIGN.md.
// =====================================================================================
export const BALANCE = {
  // ---- Day clock (DESIGN §6.1). gloomtide length = gloomtideLength(day) =
  // min(gloomMax, phases.gloomtide + gloomGrowth × (day − 1)) → 90, 96, 102 … 120 s.
  phaseOrder: ['calm', 'dusk', 'gloomtide', 'dawn'],
  phases: { calm: 120, dusk: 14, gloomtide: 90, dawn: 8 },
  gloomGrowth: 6,
  gloomMax: 120,

  // ---- Drains (DESIGN §6.2).
  // oil/s     = oilDrain × oilPhase[phase] × zone.drain.oil × diff.drainMult
  // satiety/s = satietyDrain × zone.drain.satiety × diff.drainMult (no phase multiplier)
  drain: {
    oilPhase: { calm: 1.0, dusk: 1.3, gloomtide: 1.8, dawn: 0.5 },
    duskForecastPad: 10,        // dusk toast if oil < projected gloomtide burn + pad
  },

  // ---- Lantern light & aura (DESIGN §8.1).
  // lightR = lightRadius × (floorRadius + (1−floorRadius)×oilFrac) × Π dims × flareBoost
  // aura   = auraDps × (floorAura + (1−floorAura)×oilFrac) × damageMult × crit × enemy.auraTaken
  // oil = 0 → lightR = emberGlow, aura = 0.
  light: {
    floorRadius: 0.55, floorAura: 0.30, emberGlow: 2.5,
    mothDim: 0.88,              // × per latched moth
    dimFloor: 0.5,              // the product of all dims never goes below this
    slick: 0.8, sporeVeil: 0.6, sporeCloud: 0.8, eclipse: 0.4, hush: 0.8,
    insideSlow: 0.75,           // enemy speed × inside the light
    mothInside: 1.15,           // moths speed UP inside the light
  },

  // ---- Damage to the Wick (DESIGN §6.4).
  damage: {
    iframes: 1.2,               // s after losing an Ember
    iframeOilMult: 0.5,         // contacts during i-frames still drain this share of their oil
    contactRadius: 1.8,         // m from raft centre
    armorCap: 0.6,
    emberRounding: 'floor',     // embers = max(1, floor(base × diff.damageMult)); boss hits ≤ bossHitCap
    bossHitCap: 3,
    gutterBurst: { radius: 4, push: 5, stun: 0.5 },   // free radial knock on every Ember lost (0 dmg)
    starvation: { grace: 5, interval: 20, reelMult: 0.75, windowMult: 0.85 },
    darkness: { grace: 3, interval: 8, enemySpeed: 1.3, spawnMult: 1.3, waxZapSatiety: 4, waxZapDamage: 0.5, lastFlickerOil: 12 },
  },

  // ---- Healing (DESIGN §6.5). Dawn: +stats.dawnHeal, +wellFed if satiety ≥ wellFedAt.
  heal: { wellFed: 1, wellFedAt: 0.7, kindleHeal: 1, heartwax: 1, heartwaxOnce: true },   // heartwaxOnce: only the FIRST kill of each Warden per run grants Heartwax

  // ---- resource:low edges (fraction of max; hp in Embers) with re-arm hysteresis.
  low: { oil: 0.25, oilRearm: 0.35, satiety: 0.20, satietyRearm: 0.30, hp: 2 },

  // ---- Raft handling (DESIGN §4.1, player.js).
  move: {
    accel: 3.0,                 // velocity lerp rate toward target (1/s): 0→90% in 0.77 s
    drag: 1.5,                  // lerp rate toward 0 with no input (1/s): boat glide ≈ 4 m
    backpaddle: 1.8,            // accel × this when dot(input, v̂) < backpaddleDot
    backpaddleDot: -0.2,
    turnRate: 5.0,              // rad/s heading slew toward velocity
    minHeadingSpeed: 0.4,       // heading follows velocity above this speed
    raftRadius: 1.6,            // world.collide radius
    bounceSpeed: 4, bounce: 0.3, bounceShake: 0.1,   // wall impact > bounceSpeed: reflect 30%, splash, shake
    anchorDrag: 6,              // lerp rate toward 0 while fishing is busy (charging…waiting) with no input
    anchorSpeed: 0.3,           // player:anchor {anchored:true} once speed < this while fishing
    cutLineHold: 0.6,           // s of movement input while reeling → cut the line
    slickMult: 0.6,             // target speed × inside an ink slick
    wakeEvery: 0.12,            // s between wake puffs at full speed
    paddleRipple: 0.45,         // s between paddle ripples
    interactRange: 5,           // merchant trade range (m)
    gateRange: 1.2,             // × gate radius to offer "Descend"
  },

  // ---- Levelling (DESIGN §10).
  xp: {
    curve: { base: 5, lin: 2.6, quad: 0.30 },          // xpForLevel(L) = round(base + lin(L−1) + quad(L−1)²)
    heatScale: 0.10,            // cinder value × (1 + heatScale × Heat)
    fishXp: { common: 3, uncommon: 5, rare: 10, legendary: 40 },   // × (1 + fishXpZone × zoneIndex) × xpMult
    fishXpZone: 0.5,
    choices: 3,
    maxWeapons: 4,
    maxPassives: 6,
    rarityWeights: { common: 60, rare: 28, epic: 10, legendary: 2 },
    luckShift: { common: 0, rare: 0.6, epic: 1.2, legendary: 2.0 },  // weight × (1 + luck × shift)
    ownedWeight: 1.4,           // owned, not-maxed boons are offered more often
    firstLevelWeapons: 2,       // the first level-up of a run offers ≥ 2 weapons
    weaponPityLevel: 6,         // at this level with ≤ 1 weapon owned, force a weapon card
    kindleWeight: 3,            // an eligible Kindle is weighted ×3 …
    kindleForceAfter: 2,        // … and forced if it was missed for 2 level-ups
    skipShells: 8,              // skip a pick: + skipShells × (1 + zoneIndex) Shells
    weaponScale: 0.06,          // g(L) = 1 + weaponScale × (level − 1): scales zap & flare
    cinderLife: 20,             // s before an uncollected cinder fades
    magnetSpeed: 14,            // m/s glide once inside pickupRadius
    mergeRadius: 1.5,           // nearby cinders merge into bigger motes
    cinderTiers: [1, 5, 25],    // small, bright, great
    dawnAutoCollect: true,
    fallback: [                 // offered when nothing else is eligible
      { id: 'fallback_shells', name: 'Spilled Shells', desc: '+15 Shells per zone depth.', give: { shells: 15, perZone: true } },
      { id: 'fallback_mend', name: 'A Warm Breath', desc: 'Mend 1 Ember.', give: { hp: 1 } },
      { id: 'fallback_oil', name: 'Oil Tears', desc: '+30 oil.', give: { oil: 30 } },
    ],
  },

  // ---- Swarm director & lantern combat (DESIGN §7–§8, combat.js).
  combat: {
    spawnRing: [22, 34],        // m from the raft
    behindShare: 0.35,          // max share of spawns placed behind the camera (+Z half)
    packSpread: 2.5,
    ringSamples: 12,            // ring samples before falling back to any water ≥ fallbackMinDist
    fallbackMinDist: 18,
    fadeIn: 0.6,                // s spawn fade-up from a ripple
    auraTick: 0.25,             // s between aura ticks (damage = aura dps × tick)
    separation: 0.9,            // m personal space between swarm members
    leash: { dist: 40, time: 4 },   // > dist from the raft for > time → moved back onto the spawn ring
    crit: { mult: 2 },
    zap: { cooldown: 0.2, pickPx: 48, pickPxTouch: 56, range: 26, stun: 0.25, knock: 1.2, airborneMult: 2, latchedRefund: 1 },
    flare: { damage: 10, maxHpPct: 0.15, bossHpPct: 0.03, knock: 6, stun: 1.5, lightBoost: 1.4, boostTime: 3, iframes: 0.3, clearsLatched: true, handStagger: 2 },
    dusk: { rateMult: 0.3, maxAlive: 6, kinds: ['gloomling', 'sporeling'] },
    night: { buildUntil: 0.12, buildMult: 0.5, crescendoFrom: 0.8, crescendoMult: 1.4, quietFrom: 0.93, swellPeriod: 20, swellAmp: 0.25 },
    director: {
      heatPerZone: 3,           // Heat H = (day − 1) + 3 × zoneIndex + linger
      lingerFrom: 4, lingerHeat: 1,   // linger = +1 Heat for every night in the same lake beyond the 4th (anti-camping)
      baseRate: 0.75,           // spawnRate = baseRate × zone.gloom × (1 + ratePerHeat×H) × nightCurve(k)
      ratePerHeat: 0.12,
      maxAliveBase: 30, maxAlivePerHeat: 6, maxAliveCap: 150,
      hpLin: 0.24, hpQuad: 0.025,                 // hpMult = 1 + 0.24H + 0.025H²
      bossHpLin: 0.3,                             // Wardens: hp = base × bossHpMult, bossHpMult = 1 + 0.3H (linear: kill time stays ≈ 45–65 s)
      speedPerHeat: 0.03, speedCap: 1.45,
      damageStep: 12, damageStepAdd: 0.5,         // damageMult = 1 + 0.5 × floor(H/12)
      drainPerHeat: 0.04,                          // drainMult = 1 + 0.04H
      eliteFromDay: 2, eliteBase: 42, elitePerHeat: 2, eliteMin: 22, eliteFirstAt: 0.25,
      bossEvery: 3,             // Warden on nightInZone 3, 6, 9 …
      bossAt: 0.35,             // gloomtide k at which the Warden rises (3 s banner before)
      bossRateMult: 0.6,        // spawn rate × while a Warden lives; no formations, elites paused
      formationsFromDay: 2, formationAt: [0.35, 0.65],
    },
    reelingRateMult: 0.8,       // spawn rate × while a fish is hooked at night
    legendFightRateMult: 0.65,  // … while a legendary is hooked
    legendPausesElites: true,   // no NEW elite hands rise while a legendary is hooked (its own summons still come)
    oilDrips: { every: 15, base: 3, perZone: 1.5 }, // the first kill after every 15 s of night drops an oil drip: 3 + 1.5z oil
    eliteOil: 15, wardenOil: 40,
    stragglers: { fromDay: 5, fromZone: 1, perCalm: 1, kind: 'creelsnatch', window: [0.3, 0.8] },   // calm raid
    maxLive: 150,
  },

  // ---- Cast (DESIGN §5.1, fishing.js).
  cast: {
    period: 1.6,                // ping-pong meter: 0→1→0 in one period (triangle wave)
    minDist: 3,                 // castDist = max(minDist, charge × castMax)
    tapIgnore: 0.12,            // presses shorter than this never cast
    cleanAt: 0.92,              // charge ≥ cleanAt = "Clean Cast"
    cleanBiteMult: 0.85,        // clean cast: wait × this …
    cleanRarity: 0.05,          // … and +0.05 rarityBonus for that cast
    maxRaftSpeed: 2.0,          // meter starts only once the raft is slower than this (anchor brake)
    flightBase: 0.45,           // s; flight = flightBase + flightPerM × dist
    flightPerM: 0.03,
    arcHeight: 0.25,            // × dist
    reelInTime: 0.6,
    spookReelIn: 1.5,
    lineBreakDist: 4,           // raft drifting > castDist + this from the bobber reels in
  },

  // ---- Waiting & biting (DESIGN §5.3).
  bite: {
    waitBase: 3, waitMean: 5.5, waitMin: 2, waitMax: 25,   // W = (waitBase + Exp(waitMean)) / mods
    gloomMult: 1.15,            // gloomtide: waits ÷ this
    nibbles: [0.2, 0.35, 0.3, 0.15],   // P(0..3 nibbles); +1 for uncommon and rarer
    nibbleDip: 0.06, nibbleDur: 0.22, nibbleGap: 0.7, lastNibbleLead: 0.6,
    feintChance: 0.3, feintDip: 0.12, feintZoneMin: 2,
    plunge: 0.25,
    windowMin: 0.35, windowMax: 1.4,
    perfectFrac: 0.4, perfectMin: 0.25,
    pity: { hp: 2, oilFrac: 0.15, waitMult: 0.7, rarity: 0.1 },
  },

  // ---- Reel tension model (DESIGN §5.5) — all constants of the per-frame model.
  reel: {
    safeMin: 0.15, safeMax: 0.85,
    slackLine: 0.08,            // T below this accumulates slack time
    slackDecay: 2,              // slack timer decays at this × dt when T ≥ slackLine
    snapAt: 1.0, snapGrace: 0.12,
    riseBase: 0.42,             // holding: target = riseBase × pw / LS
    fallBase: 0.55,             // released: target = −fallBase / (0.8 + 0.2 pw)
    surgeHoldMult: 2.2,         // holding in a surge: × surgeHoldMult × √str
    surgeCreep: 0.18,           // released in a surge: total creep surgeCreep × pw × str / LS
    leapHold: 0.25, leapRelease: -0.9,
    sinkerDrag: 0.06,
    jitter: 0.22, noiseHz: 1.5,
    accel: 9,                   // tension velocity easing (1/s) ≈ 110 ms
    tire: 0.25,                 // power × (1 − tire × P) once tiring is on
    decaySlack: 0.04,           // progress lost per s while T < safeMin
    decaySurge: 0.015,          // progress lost per s while released during a non-leap surge
    sweetMult: 2,
    startTension: 0.35, startProgress: 0.10, perfectProgress: 0.22,
    firstSurgeDelay: 1.5, perfectSurgeDelay: 1.5,
    dutyCap: 0.42,              // (surgeTime + warn) / surgeEvery ≤ dutyCap
    warnMin: 0.5, warnBase: 0.9, warnErratic: 0.2, darterWarn: 0.5,
    bandAmp: 0.08, bandAmpErratic: 0.14, bandOmega: 0.5, bandOmegaErratic: 0.9, bandNoise: 0.08,
    darterJump: [0.10, 0.18], darterJumpTime: 0.3, sinkerBand: -0.08,
    bandMin: 0.05, bandMax: 0.40,
    strength: { steady: 1, darter: 0.6, sinker: 1, thrasher: 1.3, leaper: 1 },
    enrage: { power: 1.25, surgeEvery: 0.75, warnCut: 0.15, warnFloor: 0.55 },
    dangerFrom: 0.72,
    landingTime: 1.2,           // s of 'landing' state before fishing:caught
    surgeJitter: [0.75, 1.25],  // next surge = surgeEvery × U(…)
    surgeLenJitter: [0.85, 1.15],
  },

  // ---- Feeding spots & legend pools (DESIGN §5.7).
  spots: {
    calmCount: [2, 4], gloomCount: [1, 2],
    ttl: [45, 75], respawn: [8, 16],
    radius: 2.6,
    minDist: 10, maxDist: 45,
    depthMin: 0.2,
    waitMult: 0.55, rarity: 0.10, quality: 0.08,
    rareChance: 0.15, rareRarity: 0.25, rareQuality: 0.15,
    legend: { radius: 3.2, waitMult: 0.7, minDistFromRaft: 18 },
    tideChart: { count: 2, rare: true },
  },

  // ---- Legendary rules (DESIGN §5.6).
  legend: { guaranteed: true, woundedCarry: 0.5, woundedMax: 0.4, rebiteDelay: 20, windowBonus: 0.1, bannerDelay: 0.4, nibbles: 2 },

  // ---- Catch quality from reel performance (see QUALITY for multipliers; DESIGN §5.8).
  quality: { perfectHookBonus: 0.15, overDangerPenalty: 0.10, dangerLine: 0.85 },

  // ---- Economy (DESIGN §9, progression.js).
  economy: {
    startShells: 20,
    waystonePurse: { mossmere: 0, sporewood: 160, glasswater: 450, paleabyss: 950 },
    waystoneLevels: { mossmere: 0, sporewood: 9, glasswater: 18, paleabyss: 28 },   // banked levels → Kindling Draft
    supplyMult: [1, 1.4, 1.9, 2.5],   // by current zone index
    baitMult: [1, 1.3, 1.6, 2.0],     // general baits only; legend baits fixed
    weightSkew: 1.6,                  // t = U^skew (heavy bait: skew / (1 + weightBias)); w = min + (max−min)·t
    sizeK: [0.75, 1.25],              // value/food/oil multiplier across t = 0..1
    newSpeciesShells: 1.0,            // first catch ever: +round(1.0 × species.value) Shells (non-legendary only)
    newSpeciesLegendary: false,       // legendaries pay no first-catch Shells (their sale already covers most of the next toll)
    mercy: { perRelease: 0.02, cap: 0.10 },   // release: +rarityBonus for the rest of the day
    streak: { perStep: 0.10, maxSteps: 5 },   // perfect-hook streak: value × (1 + 0.1 × min(streak, 5))
    trophyMemories: [10, 20, 35, 0],  // legendary still in the creel at run end (Leviathan: victory instead)
    legendTheftProof: true,
    burnFishTime: 0.8,                // Burn-a-fish quick action animation (s); does not pause
  },

  // ---- Old Murk (DESIGN §13).
  merchant: {
    day1ArriveAt: 20,                 // s into day 1 calm (after the first-cast tip)
    arriveAt: 0,                      // s into calm on later days
    warnAt: 0.85,                     // calm k → bell + "casting off soon"
    pity: { shells: 20, oilFrac: 0.25, give: { oil: 30, satiety: 30 }, perRun: 1 },
    stockByZone: true,                // stock never random: depends on zone index only
  },

  // ---- Journal rewards (DESIGN §16).
  journal: { halfZone: 4, newSpeciesMemories: 3, masteryAt: 10, masteryMemories: 2, halfZoneMemories: 10 },

  // ---- Memories per run (DESIGN §17.1, memoriesFor). Challenge rewards are paid separately.
  memories: { nightBase: 3, nightPerZone: 1.0, depth: [0, 10, 25, 45], fishPer: 2, legend: 15, slainPer: 50, elite: 1, warden: 15, victoryFirst: 150, victoryAfter: 100 },

  // ---- Descent Gate travel (DESIGN §14).
  travel: { phases: ['calm', 'dawn'], murkFollows: true, oneWay: true, descendTime: 2.5 },

  // ---- Bounty ledger (DESIGN §15).
  bounty: { offer: 2, maxActive: 3, durationDays: 2, dayGrowth: 0.04, memoriesEach: 2 },
};

// =====================================================================================
// ZONES (DESIGN §4.3, §14, §19) — four cavern lakes, index 0..3, centred on the origin.
// −Z = north = up-screen. arena: radius, seed, layout + depth recipe inputs, islands &
// pillars as collision circles {x, z, r, name?, kind}, deep pools, legend pool, gate,
// spawn, merchant docks (day 1 = docks[0]; yaw faces the lake centre).
// unlock = what the PREVIOUS zone's Descent Gate demands: requires[] opens the gate,
// shells is the toll paid at the whirlpool. gloom = spawn-rate factor for this lake.
// valueMult scales bounty rewards & elite Shell drops only (species values are final).
// =====================================================================================
export const ZONES = [
  {
    id: 'mossmere', index: 0, name: 'The Mossmere', subtitle: 'Shallows of the Sunken Gate',
    arena: {
      radius: 60, seed: 1307, layout: 'bowl', shelf: 9, depthShare: [35, 40, 25], noise: 0.08,
      deepPools: [{ name: 'Bell Pool', x: -4, z: -14, r: 13, depth: 0.9 }],
      legendPool: { x: -4, z: -14, r: 3.2, name: 'Bell Pool' },
      islands: [
        { name: 'Drowned Gatehouse', x: 22, z: -12, r: 8, kind: 'tower' },
        { name: 'Mossbell Isle', x: -30, z: 14, r: 6, kind: 'rock' },
        { name: 'Root Isle', x: 34, z: 20, r: 5, kind: 'roots' },
        { name: 'Stair Isle', x: -14, z: 28, r: 4, kind: 'stair' },
        { name: 'Elder Sister', x: -30, z: -24, r: 5, kind: 'rock' },
        { name: 'Younger Sister', x: -18, z: -34, r: 4, kind: 'rock' },
      ],
      pillars: [
        { x: -40, z: -4, r: 1.4, kind: 'pier' }, { x: -33, z: -1, r: 1.4, kind: 'pier' },
        { x: -26, z: 2, r: 1.4, kind: 'pier' }, { x: -19, z: 5, r: 1.4, kind: 'pier' },
        { x: 12, z: -5, r: 1.2, kind: 'pylon' }, { x: 10, z: -18, r: 1.2, kind: 'pylon' }, { x: 30, z: -25, r: 1.2, kind: 'pylon' },
        { x: 40, z: -20, r: 1.5, kind: 'statue' }, { x: -46, z: 22, r: 1.5, kind: 'statue' }, { x: 8, z: 36, r: 1.2, kind: 'statue' },
      ],
      gate: { name: 'The Moss Sluice', x: 0, z: -49, r: 4.5 },
      spawn: { x: 0, z: 46, yaw: 0 },
      docks: [{ x: 24, z: 38 }, { x: 49, z: 6 }, { x: 35, z: -40 }, { x: -36, z: -38 }, { x: -48, z: 14 }],
    },
    unlock: { shells: 0, requires: [] },
    drain: { oil: 1.0, satiety: 1.0 }, gloom: 1.0, valueMult: 1,
    legendary: 'belled_matriarch', warden: 'the_wickeater', gateName: 'The Moss Sluice',
    // "Starlit moat" (DESIGN §19.3): violet-dusk water under lavender mist, pale stone, candle-amber windows
    palette: { fog: 0x3a3070, fogDensity: 0.016, water: 0x2e2664, waterDeep: 0x0a081e, foam: 0xd8d6e6,
      glow: 0xbab2ee, accent: 0xd6d6e4, lamp: 0xb6b0f0, candle: 0xed9e3b, ambient: 0x4a3e88, ink: 0x08061a, far: 0x8c84bc, light: 0xd4d0f2,
      nebula: 0xd296ae, stars: 1.0 },
    grade: { exposure: 1.04, bloomStrength: 0.9, bloomRadius: 0.6, bloomThreshold: 0.7, tint: 0x40347e, tintAmount: 0.2, vignette: 0.38, saturation: 1.0, grain: 0.05 },
    description: 'The outer moat of the Lamplit Kingdom, drowned to the arches. Moss drinks the old stone and roots hang from the vault like the beards of sleeping giants. The fish here are forgiving. The dark, for now, only watches.',
  },
  {
    id: 'sporewood', index: 1, name: 'Sporewood Pools', subtitle: 'A Garden That Forgot the Sun',
    arena: {
      radius: 65, seed: 2711, layout: 'twoBasins', shelf: 8, depthShare: [30, 40, 30], noise: 0.08,
      reef: { x: 0, zFrom: -42, zTo: 38, width: 6, depth: 0.15 },   // shallow cap-reef mat splitting the basins
      deepPools: [
        { name: 'Lullaby Pool', x: -28, z: -8, r: 16, depth: 0.85 },
        { name: 'Grove Well', x: 28, z: -16, r: 14, depth: 0.95 },
      ],
      legendPool: { x: 28, z: -16, r: 3.2, name: 'Grove Well' },
      islands: [
        { name: 'Cap Reef I', x: 0, z: 32, r: 4.5, kind: 'cap' },
        { name: 'Cap Reef II', x: 0, z: 10, r: 5, kind: 'cap' },
        { name: 'Cap Reef III', x: 0, z: -14, r: 5, kind: 'cap' },
        { name: 'Cap Reef IV', x: 0, z: -36, r: 4.5, kind: 'cap' },
        { name: 'West Lily Cap', x: -44, z: -30, r: 5, kind: 'lily' },
        { name: 'East Lily Cap', x: 46, z: -2, r: 4, kind: 'lily' },
        { name: 'South Lily Cap', x: -16, z: 40, r: 4, kind: 'lily' },
      ],
      pillars: [
        { x: -41, z: 21, r: 1.6, kind: 'stalk' }, { x: -35, z: 22, r: 1.2, kind: 'stalk' }, { x: -38, z: 28, r: 2.0, kind: 'stalk' }, { x: -44, z: 27, r: 1.4, kind: 'stalk' },
        { x: 35, z: 23, r: 1.4, kind: 'stalk' }, { x: 41, z: 24, r: 2.0, kind: 'stalk' }, { x: 37, z: 30, r: 1.2, kind: 'stalk' }, { x: 43, z: 30, r: 1.6, kind: 'stalk' },
      ],
      gate: { name: 'The Mycelium Veil', x: 30, z: -47, r: 4.5 },
      spawn: { x: 0, z: 50, yaw: 0 },
      docks: [{ x: 20, z: 57 }, { x: 56, z: 18 }, { x: 52, z: -34 }, { x: -36, z: -50 }, { x: -57, z: 8 }],
    },
    unlock: { shells: 180, requires: [{ type: 'legendary', id: 'belled_matriarch', label: 'Land the Belled Matriarch' }] },
    drain: { oil: 1.2, satiety: 1.15 }, gloom: 1.13, valueMult: 1.5,
    legendary: 'drifting_grove', warden: 'the_veiled_gardener', gateName: 'The Mycelium Veil',
    // "Ember garden" (DESIGN §19.4): violet-magenta haze, autumn-ochre caps, gold spores, nebula-pink accents
    palette: { fog: 0x402258, fogDensity: 0.019, water: 0x2c1842, waterDeep: 0x0e0716, foam: 0xeed8e6,
      glow: 0xe8ac4c, accent: 0xe090bc, lamp: 0xc8aee6, candle: 0xed9e3b, ambient: 0x5c3a7c, ink: 0x0d0614, far: 0x9c74b8, light: 0xf2d8ea,
      nebula: 0xe48cbc, stars: 0.8 },
    grade: { exposure: 1.03, bloomStrength: 1.0, bloomRadius: 0.75, bloomThreshold: 0.68, tint: 0x5a2c78, tintAmount: 0.2, vignette: 0.4, saturation: 0.92, grain: 0.05 },
    description: 'Beneath the royal gardens the fungi kept growing long after the gardeners stopped. Towers of cap and gill rise from sweet, warm water, and the air is thick with spores that glow like embers that never learned to burn.',
  },
  {
    id: 'glasswater', index: 2, name: 'Glasswater Vault', subtitle: 'Where the Kingdom Kept Its Light',
    arena: {
      radius: 70, seed: 4421, layout: 'ringTrench', shelf: 7, depthShare: [30, 20, 50], noise: 0.06,
      plateau: { r: 22, depth: 0.2 },                               // shallow, eel-free centre
      trench: { rInner: 26, rOuter: 48, depth: 0.92 },              // the deep ring
      deepPools: [],
      legendPool: { x: 0, z: -37, r: 3.2, name: 'North Trench' },
      islands: [
        { name: 'Monolith of Hymns', x: 38, z: 0, r: 5, kind: 'monolith' },
        { name: 'Monolith of Ledgers', x: 19, z: 32.9, r: 4.5, kind: 'monolith' },
        { name: 'Monolith of Maps', x: -19, z: 32.9, r: 4.5, kind: 'monolith' },
        { name: 'Monolith of Names', x: -38, z: 0, r: 5, kind: 'monolith' },
        { name: 'Monolith of Tides', x: -19, z: -32.9, r: 6, kind: 'monolith' },
        { name: 'Monolith of Lamps', x: 19, z: -32.9, r: 6, kind: 'monolith' },
      ],
      pillars: [
        { x: 8.66, z: 5, r: 1.2, kind: 'reliquary' }, { x: 0, z: 10, r: 1.2, kind: 'reliquary' }, { x: -8.66, z: 5, r: 1.2, kind: 'reliquary' },
        { x: -8.66, z: -5, r: 1.2, kind: 'reliquary' }, { x: 0, z: -10, r: 1.2, kind: 'reliquary' }, { x: 8.66, z: -5, r: 1.2, kind: 'reliquary' },
        { x: 56, z: 0, r: 1.8, kind: 'shelf' }, { x: 28, z: 48.5, r: 1.8, kind: 'shelf' }, { x: -28, z: 48.5, r: 1.8, kind: 'shelf' },
        { x: -56, z: 0, r: 1.8, kind: 'shelf' }, { x: -28, z: -48.5, r: 1.8, kind: 'shelf' }, { x: 28, z: -48.5, r: 1.8, kind: 'shelf' },
      ],
      gate: { name: 'The Vault Seal', x: 0, z: 0, r: 5 },
      spawn: { x: 0, z: 58, yaw: 0 },
      docks: [{ x: 21.9, z: 60.1 }, { x: 64, z: -2.2 }, { x: 17.6, z: -61.5 }, { x: -53.1, z: -35.8 }, { x: -50.4, z: 39.4 }],
    },
    unlock: { shells: 420, requires: [{ type: 'legendary', id: 'drifting_grove', label: 'Land the Drifting Grove' }] },
    drain: { oil: 1.4, satiety: 1.3 }, gloom: 1.27, valueMult: 2.2,
    legendary: 'glass_sovereign', warden: 'the_shard_abbot', gateName: 'The Vault Seal',
    // "Sapphire orrery" (DESIGN §19.5): saturated cobalt-sapphire water, lilac crystal, the most starlight
    palette: { fog: 0x172a7c, fogDensity: 0.012, water: 0x10226e, waterDeep: 0x030921, foam: 0xd6defa,
      glow: 0xa0aaf8, accent: 0xd2baff, lamp: 0xb6c0ff, candle: 0xe8be77, ambient: 0x24409a, ink: 0x02051b, far: 0x5c78d4, light: 0xd8e0ff,
      nebula: 0xcc8ed0, stars: 1.5 },
    grade: { exposure: 1.06, bloomStrength: 1.15, bloomRadius: 0.55, bloomThreshold: 0.65, tint: 0x203ca8, tintAmount: 0.2, vignette: 0.35, saturation: 1.0, grain: 0.04 },
    description: 'Here the kingdom poured its light into crystal and shelved it like books. The water is cold and clear as a held breath. Every shard remembers a colour, and none remember why.',
  },
  {
    id: 'paleabyss', index: 3, name: 'The Pallid Deep', subtitle: 'Where the Kingdom Laid Its Light to Rest',
    arena: {
      radius: 78, seed: 9001, layout: 'drop', shelf: 6, depthShare: [10, 30, 60], noise: 0.06,
      causeway: { x: 0, zFrom: 30, zTo: 70, width: 8, depth: 0.2 },   // the only shallows
      deepPools: [{ name: 'The Well', x: 0, z: -52, r: 12, depth: 1.0 }],
      legendPool: { x: 0, z: -52, r: 3.2, name: 'The Well' },
      islands: [
        { name: 'The Kneeling West', x: -24, z: -44, r: 10, kind: 'giant' },
        { name: 'The Kneeling East', x: 24, z: -44, r: 10, kind: 'giant' },
        { name: 'Funeral Barge', x: -40, z: 10, r: 4, kind: 'wreck' },
        { name: 'Candle Barge', x: 42, z: 4, r: 4, kind: 'wreck' },
        { name: 'Bier Barge', x: -10, z: -20, r: 4, kind: 'wreck' },
      ],
      pillars: [   // the Rib Arches: 9 bone pillars on an arc r 32, −120°…+120° from north, open toward the causeway
        { x: -27.7, z: 16, r: 1.5, kind: 'rib' }, { x: -32, z: 0, r: 1.5, kind: 'rib' }, { x: -27.7, z: -16, r: 1.5, kind: 'rib' },
        { x: -16, z: -27.7, r: 1.5, kind: 'rib' }, { x: 0, z: -32, r: 1.5, kind: 'rib' }, { x: 16, z: -27.7, r: 1.5, kind: 'rib' },
        { x: 27.7, z: -16, r: 1.5, kind: 'rib' }, { x: 32, z: 0, r: 1.5, kind: 'rib' }, { x: 27.7, z: 16, r: 1.5, kind: 'rib' },
      ],
      gate: null,   // final lake: the Well is the finale
      spawn: { x: 0, z: 66, yaw: 0 },
      docks: [{ x: 48, z: 56 }, { x: -48, z: 56 }, { x: 70, z: 20 }, { x: -70, z: 20 }],
    },
    unlock: { shells: 900, requires: [{ type: 'legendary', id: 'glass_sovereign', label: 'Land the Glass Sovereign' }] },
    drain: { oil: 1.65, satiety: 1.45 }, gloom: 1.4, valueMult: 3.0,
    legendary: 'pale_leviathan', warden: 'the_lightless_ferryman', gateName: null,
    // "Candle requiem" (DESIGN §19.6): near-black violet, bone-pale stone, amber candles, few stars
    palette: { fog: 0x2c2448, fogDensity: 0.022, water: 0x1e183c, waterDeep: 0x07060e, foam: 0xe6e0d6,
      glow: 0xf0b45e, accent: 0xe6e0d6, lamp: 0xc6c0d8, candle: 0xed9e3b, ambient: 0x463e6c, ink: 0x030206, far: 0xa89ec8, light: 0xece2d2,
      nebula: 0xa87a98, stars: 0.7 },
    grade: { exposure: 0.97, bloomStrength: 0.95, bloomRadius: 0.8, bloomThreshold: 0.7, tint: 0x3a2c60, tintAmount: 0.18, vignette: 0.5, saturation: 0.85, grain: 0.07 },
    description: 'The deepest water. The kingdom set its dead adrift here with a candle each, and the candles went out long ago. Two veiled giants kneel in the mist, and the ribs of something larger than a cathedral arch overhead. Something below is breathing.',
  },
];

// =====================================================================================
// SPECIES (DESIGN §5.4, §5.6) — 32 fish, 8 per zone (3 common, 2 uncommon, 2 rare, 1 legendary).
// value/food/oil are at mean weight, normal quality, and FINAL (already zone-scaled).
// time: 'any' | 'calm' (any phase except gloomtide) | 'gloom' (gloomtide only).
// depth: band of world.getDepth() at the BOBBER (0 shallow … 1 deep). Every zone keeps at
// least one 'any'-time common reachable at every depth. bait: hard requirement (null = none).
// Legendaries never appear in normal rolls: they bite only through the legend rule (§5.6).
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
    model: { shape: 'minnow', body: 0x7a8494, belly: 0xdde2e8, fin: 0x3c4452, glow: null, pattern: 'scales', eyes: 'normal', scale: 0.45 },
    lore: 'They school beneath the raft like thrown pennies, each one wishing for nothing at all.' },
  { id: 'mossback_perch', name: 'Mossback Perch', zone: 'mossmere', rarity: 'common', tier: 1,
    weight: [0.3, 1.4], value: 7, food: 22, oil: 20, time: 'any', depth: [0.1, 1], bait: null, behavior: 'steady',
    difficulty: diff(1, 'steady'),
    model: { shape: 'perch', body: 0x585e56, belly: 0xd0d3c6, fin: 0x7e8474, glow: null, pattern: 'stripes', eyes: 'normal', scale: 0.8 },
    lore: 'Moss takes root on its back by its third winter. By its tenth, it is mostly a small, slow garden.' },
  { id: 'gutter_crayfish', name: 'Gutter Crayfish', zone: 'mossmere', rarity: 'common', tier: 1,
    weight: [0.1, 0.5], value: 6, food: 20, oil: 18, time: 'any', depth: [0, 0.45], bait: null, behavior: 'sinker',
    difficulty: diff(1, 'sinker'),
    model: { shape: 'crayfish', body: 0x5b4a3e, belly: 0xb8a07a, fin: 0x2f2620, glow: null, pattern: 'bands', eyes: 'normal', scale: 0.6 },
    lore: 'It hoards drowned buttons in its burrow. No one knows whose coat it is trying to finish.' },
  { id: 'weeping_carp', name: 'Weeping Carp', zone: 'mossmere', rarity: 'uncommon', tier: 2,
    weight: [1.5, 5.5], value: 15, food: 26, oil: 20, time: 'any', depth: [0.35, 1], bait: null, behavior: 'sinker',
    difficulty: diff(2, 'sinker'),
    model: { shape: 'carp', body: 0x646a74, belly: 0xe0e3e6, fin: 0x3c424c, glow: null, pattern: 'bands', eyes: 'normal', scale: 1.15 },
    lore: 'Old fishers swore the carp were mourning. The carp have never once said otherwise.' },
  { id: 'candlefin_koi', name: 'Candlefin Koi', zone: 'mossmere', rarity: 'uncommon', tier: 2,
    weight: [0.8, 3], value: 18, food: 18, oil: 28, time: 'calm', depth: [0.25, 0.85], bait: null, behavior: 'darter',
    difficulty: diff(2, 'darter'),
    model: { shape: 'koi', body: 0xe9e2cf, belly: 0xfff6e0, fin: 0xf2c98a, glow: 0xffe2a8, pattern: 'spots', eyes: 'normal', scale: 1.0 },
    lore: 'Its fins burn without heat. More than one Wick has mistaken it for kin, and leaned too far.' },
  { id: 'reedjaw_pike', name: 'Reedjaw Pike', zone: 'mossmere', rarity: 'rare', tier: 3,
    weight: [2.5, 9], value: 34, food: 30, oil: 26, time: 'any', depth: [0.55, 1], bait: null, behavior: 'thrasher',
    difficulty: diff(3, 'thrasher'),
    model: { shape: 'pike', body: 0x474e58, belly: 0xc8ccd2, fin: 0x272c36, glow: null, pattern: 'stripes', eyes: 'normal', scale: 1.3 },
    lore: 'It lies among the drowned reeds until it forgets it is not one. Then something swims by.' },
  { id: 'gloam_eel', name: 'Gloam Eel', zone: 'mossmere', rarity: 'rare', tier: 3,
    weight: [1, 4], value: 42, food: 22, oil: 36, time: 'gloom', depth: [0.4, 1], bait: 'lumen_moss', behavior: 'leaper',
    difficulty: diff(3, 'leaper'),
    model: { shape: 'eel', body: 0x161b2a, belly: 0x6a78a0, fin: 0x0b0e18, glow: 0xb4c4ff, pattern: 'spots', eyes: 'glow', scale: 1.25 },
    hint: 'Rises with the Gloomtide, in deep water. Drawn to the glow of Lumen Moss.',
    lore: 'It rises only when the Gloom does. Some say it is the Gloom, slowly learning to be a fish.' },
  { id: 'belled_matriarch', name: 'The Belled Matriarch', zone: 'mossmere', rarity: 'legendary', tier: 3,
    epithet: 'She Who Tolls for the Drowned',
    weight: [12, 30], value: 140, food: 60, oil: 60, time: 'calm', depth: [0.8, 1], bait: 'heartmoss', behavior: 'steady',
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
    model: { shape: 'carp', body: 0x50565e, belly: 0xdcdfe2, fin: 0x7a8494, glow: 0xd8e0ff, pattern: 'scales', eyes: 'glow', scale: 2.0 },
    hint: 'Listen for a bell beneath the calm, far out in deep water. She takes only Heartmoss.',
    lore: 'A temple bell sank into her when she was young. She has tolled for the drowned ever since.' },

  // ---------------------------------------------------------------- sporewood (z1)
  { id: 'sporebelly_puffer', name: 'Sporebelly Puffer', zone: 'sporewood', rarity: 'common', tier: 2,
    weight: [0.2, 0.9], value: 13, food: 22, oil: 26, time: 'any', depth: [0, 0.6], bait: null, behavior: 'thrasher',
    difficulty: diff(2, 'thrasher'),
    model: { shape: 'puffer', body: 0x7a4f6e, belly: 0xf0c9d8, fin: 0xe89a5a, glow: 0xff9fc4, pattern: 'spots', eyes: 'normal', scale: 0.7 },
    lore: 'Frightened, it swells and sighs out spores. In the quiet, the whole pool smells of lullabies.' },
  { id: 'plumgill_perch', name: 'Plumgill Perch', zone: 'sporewood', rarity: 'common', tier: 2,
    weight: [0.4, 1.8], value: 14, food: 26, oil: 24, time: 'any', depth: [0.15, 1], bait: null, behavior: 'steady',
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
    weight: [20, 45], value: 320, food: 70, oil: 70, time: 'calm', depth: [0.8, 1], bait: 'glowcap_bulb', behavior: 'leaper',
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
    model: { shape: 'minnow', body: 0x8fb8e8, belly: 0xeaf6ff, fin: 0x5cbcff, glow: 0x5cbcff, pattern: 'scales', eyes: 'normal', scale: 0.45 },
    lore: 'When the school turns at once, for an instant the water remembers the colour of the sky.' },
  { id: 'glassgill_perch', name: 'Glassgill Perch', zone: 'glasswater', rarity: 'common', tier: 3,
    weight: [0.5, 2], value: 28, food: 32, oil: 30, time: 'any', depth: [0.15, 1], bait: null, behavior: 'steady',
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
    model: { shape: 'eel', body: 0x1a1f4a, belly: 0x6a7ad0, fin: 0x5cbcff, glow: 0x5cbcff, pattern: 'bands', eyes: 'glow', scale: 1.35 },
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
      cue: 'The whole Vault rings like struck glass. The swarm keeps coming (spawn rate × legendFightRateMult).',
    },
    model: { shape: 'koi', body: 0xa8b8ff, belly: 0xf4f7ff, fin: 0x5cbcff, glow: 0x5cbcff, pattern: 'scales', eyes: 'glow', scale: 2.1 },
    hint: 'In the Gloomtide, in the deepest water, a Prism Moth draws a crown of light.',
    lore: 'It swallowed the Vault\'s last light and never let it go. Each scale is a window with no one behind it.' },

  // ---------------------------------------------------------------- paleabyss (z3)
  { id: 'ossuary_fry', name: 'Ossuary Fry', zone: 'paleabyss', rarity: 'common', tier: 3,
    weight: [0.05, 0.3], value: 42, food: 32, oil: 40, time: 'any', depth: [0, 0.6], bait: null, behavior: 'darter',
    difficulty: diff(3, 'darter'),
    model: { shape: 'minnow', body: 0xd8d2c0, belly: 0xf4f0e4, fin: 0x8a8270, glow: null, pattern: 'none', eyes: 'blind', scale: 0.45 },
    lore: 'Pale as the bones they nest in. They have never seen light and do not seem to miss it.' },
  { id: 'pallid_wraithfin', name: 'Pallid Wraithfin', zone: 'paleabyss', rarity: 'common', tier: 3,
    weight: [0.4, 2], value: 48, food: 38, oil: 42, time: 'any', depth: [0.1, 1], bait: null, behavior: 'steady',
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
    difficulty: { power: 2.5, surgeEvery: 6.2, surgeTime: 1.8, stamina: 44, sweet: 0.62, erratic: 0.55, window: 0.45 },  // hand-tuned
    boss: {
      enrage: 110,
      noSlackEscape: true,                 // phases I-III: slack makes it dive instead of escaping
      slackDive: { progress: -0.12, tension: 0.35 },
      phases: [
        { at: 0, name: 'Deep Pull', mechanic: 'drag', drag: 0.08, bandOffset: -0.10 },
        { at: 0.25, name: 'Grasping Dark', mechanic: 'summon', enemy: 'drowned_hand', zoneMod: 'paleabyss', count: 2, gap: 4 },
        { at: 0.5, name: 'Eclipse', mechanic: 'eclipse', lightMult: 0.5, every: 3, warn: 0.6 },
        { at: 0.8, name: 'Last Breath', mechanic: 'shrink', sweetTo: 0.6, decayMult: 2, slackEscapes: true },
      ],
      cue: 'The water goes very still. The Ferryman cannot rise while it is hooked. Landing it ends the Gloomtide and wins the run.',
    },
    model: { shape: 'leviathan', body: 0xd8d2c0, belly: 0xf6f2e6, fin: 0x8a8270, glow: 0xe8c66a, pattern: 'scales', eyes: 'glow', scale: 3.5 },
    hint: 'Only Drowned Marrow. Only in the Gloomtide. Only in the deepest water of the Pallid Deep.',
    lore: 'Older than the kingdom above. The kingdom fell into it the way a coin falls into a well.' },
];
// =====================================================================================
// BAITS (DESIGN §5.2–§5.3, §13.4) — consumed one charge per cast (legend baits: consumed only when
// the legendary is HOOKED; a missed hook-set keeps it). Species whose `bait` names a bait are hard-locked to it. `attract` ids get
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
  { id: 'pale_marrow', name: 'Drowned Marrow', price: 320, count: 1, zoneMin: 3, zone: 'paleabyss', unlock: null, legend: true, icon: 'bone',
    desc: 'The marrow of something that should not have died. Only one thing down here is hungry enough.', bonus: { gloomDraw: 0.35 } },
];

// =====================================================================================
// UPGRADES (DESIGN §13.2) — per-run gear bought from Old Murk with Shells. effects additive per level
// on STATS keys. costs.length === maxLevel. zone: appears once that zone is unlocked.
// =====================================================================================
export const UPGRADES = [
  { id: 'rod_ashwood', name: 'Ashwood Rod', category: 'rod', icon: 'rod', maxLevel: 3, costs: [40, 120, 300], zone: null,
    effects: { castMax: 3 }, desc: 'Longer, springier wood. Reach deeper water and farther spots.' },
  { id: 'rod_whalebone', name: 'Whalebone Tip', category: 'rod', icon: 'rod', maxLevel: 3, costs: [45, 130, 320], zone: null,
    effects: { hookWindow: 0.12, slackTime: 0.3 }, desc: 'Feels every twitch. More time to strike, more forgiveness on a slack line.' },
  { id: 'line_gut', name: 'Braided Gut Line', category: 'line', icon: 'line', maxLevel: 4, costs: [40, 110, 260, 520], zone: null,
    effects: { lineStrength: 0.15 }, desc: 'Twisted strands that take a surge without parting.' },
  { id: 'line_silver', name: 'Silverthread', category: 'line', icon: 'line', maxLevel: 2, costs: [480, 800], zone: 'glasswater',
    effects: { lineStrength: 0.25, slackTime: 0.2 }, desc: 'Spun from something that should not exist. Strong enough for the deepest thing.' },
  { id: 'reel_brass', name: 'Brass Spool Reel', category: 'reel', icon: 'reel', maxLevel: 4, costs: [50, 130, 280, 520], zone: null,
    effects: { reelSpeed: 0.15 }, desc: 'Gears from a drowned clock. Bring them in faster.' },
  { id: 'reel_drag', name: 'Whisper Drag', category: 'reel', icon: 'reel', maxLevel: 3, costs: [60, 150, 340], zone: null,
    effects: { sweetZone: 0.02 }, desc: 'A soft brake that widens the sweet band.' },
  { id: 'lantern_chimney', name: 'Thick-Glass Chimney', category: 'lantern', icon: 'lantern', maxLevel: 3, costs: [45, 130, 300], zone: null,
    effects: { oilDrain: -0.012, maxOil: 15 }, desc: 'Holds the heat in. The flame sips instead of gulps.' },
  { id: 'lantern_mantle', name: 'Searing Mantle', category: 'lantern', icon: 'flame', maxLevel: 4, costs: [55, 140, 300, 560], zone: null,
    effects: { auraDps: 0.4 }, desc: 'A mantle of salted wick. Your light burns harder at whatever enters it.' },
  { id: 'lantern_lens', name: 'Moth-Dust Lens', category: 'lantern', icon: 'lens', maxLevel: 3, costs: [90, 200, 420], zone: 'sporewood',
    effects: { lightRadius: 1.0, flareRadius: 1.0 }, desc: 'Glass dusted with powdered moth-wing. Throws your light, and your flare, wider.' },
  { id: 'lantern_striker', name: 'Flint Striker', category: 'lantern', icon: 'spark', maxLevel: 3, costs: [55, 150, 330], zone: null,
    effects: { flareCooldown: -1.5, flareCost: -2, zapDamage: 2 }, desc: 'Sharper sparks: cheaper, faster flares and harder zaps.' },
  { id: 'creel_wicker', name: 'Woven Creel', category: 'creel', icon: 'creel', maxLevel: 4, costs: [30, 90, 200, 420], zone: null,
    effects: { creelSize: 1 }, desc: 'One more slot. One more choice you do not have to make tonight.' },
  { id: 'creel_frost', name: 'Frost-Moss Lining', category: 'creel', icon: 'creel', maxLevel: 3, costs: [100, 240, 480], zone: 'sporewood',
    effects: { sellMult: 0.12 }, desc: 'Keeps the catch fresh. Old Murk pays more for fish that still look surprised.' },
  { id: 'raft_brazier', name: 'Rendering Brazier', category: 'raft', icon: 'brazier', maxLevel: 3, costs: [55, 140, 310], zone: null,
    effects: { oilYieldMult: 0.2, foodMult: 0.15 }, desc: 'Render and cook on board. More oil and more meal from every fish.' },
  { id: 'raft_hull', name: 'Barnacle Hull', category: 'raft', icon: 'hull', maxLevel: 3, costs: [110, 250, 520], zone: 'sporewood',
    effects: { armor: 0.07 }, desc: 'Crusted planks. Some blows glance off.' },
  { id: 'raft_oars', name: 'Long Oars', category: 'raft', icon: 'oar', maxLevel: 3, costs: [40, 110, 260], zone: null,
    effects: { moveSpeed: 0.5, pickupRadius: 0.5 }, desc: 'Reach the spots first. Outrun what follows. Sweep up cinders on the way.' },
  { id: 'raft_hearth', name: 'Ember Hearth', category: 'raft', icon: 'hearth', maxLevel: 2, costs: [260, 600], zone: 'glasswater',
    effects: { maxHp: 1, maxSatiety: 15 }, desc: 'A little hearth that keeps a spare Ember warm.' },
  { id: 'lure_glimmer', name: 'Glimmer Spoon', category: 'lure', icon: 'lure', maxLevel: 3, costs: [70, 190, 420], zone: null,
    effects: { rarityBonus: 0.05, biteSpeed: 0.08 }, desc: 'A bent spoon that catches the light. Rarer fish come to look.' },
  { id: 'lure_feather', name: 'Trembling Feather', category: 'lure', icon: 'feather', maxLevel: 2, costs: [80, 220], zone: null,
    effects: { nibbleTells: 1, hookWindow: 0.08 }, desc: 'It shivers a heartbeat before the real bite.' },
];

// =====================================================================================
// SUPPLIES (DESIGN §13.3) — consumables from Old Murk. price × BALANCE.economy.supplyMult[zoneIndex].
// give keys: oil, satiety, hp, flareCharges (next N flares cost no oil), spots (rare spots).
// =====================================================================================
export const SUPPLIES = [
  { id: 'oil_flask', name: "Murk's Lamp Oil", price: 18, give: { oil: 30 }, zoneMin: 0, limitPerVisit: 0, icon: 'oil',
    desc: 'Smells of frogs. Burns anyway.' },
  { id: 'oil_cask', name: 'Lamp-Oil Cask', price: 50, give: { oil: 100 }, zoneMin: 1, limitPerVisit: 0, icon: 'oil',
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
// RELICS (DESIGN §17.2) — permanent, bought with Memories at the Shrine of Drowned
// Lanterns. effects on STATS keys (per level) and/or `special` ('key' or 'key:value',
// applied per level): startShells:N  startKit  shimmer:N  memMult:N  secondWick
// waystone:<zoneId>. unlock: challenge id that reveals it (null = available);
// requires: meta thresholds that reveal it {bestDay, runs, deepestZone, bestLevel}.
// =====================================================================================
export const RELICS = [
  { id: 'oilskin_flask', name: 'Cracked Oilskin', icon: 'oil', maxLevel: 3, costs: [40, 110, 245], effects: { maxOil: 15 }, unlock: null,
    desc: 'It leaks, but only a little, and only when it is sad. +15 max oil.' },
  { id: 'salt_glass_lens', name: 'Salt-Glass Lens', icon: 'lens', maxLevel: 3, costs: [65, 170, 375], effects: { lightRadius: 0.6, auraDps: 0.15 }, unlock: null,
    desc: 'Fitted to a lantern long since drowned. The light it bends still finds its way back. +0.6 m light, +0.15 burn.' },
  { id: 'bent_tin_spoon', name: 'Bent Tin Spoon', icon: 'spoon', maxLevel: 3, costs: [40, 110, 245], effects: { maxSatiety: 15, satietyDrain: -0.006 }, unlock: null,
    desc: 'Someone ate every meal with this, slowly, to make it last.' },
  { id: 'mended_creel', name: 'Mended Creel', icon: 'creel', maxLevel: 2, costs: [50, 230], effects: { creelSize: 1 }, unlock: null,
    desc: "Patched with reed, ribbon, and a lock of someone's hair. +1 creel slot." },
  { id: 'old_debt', name: "Murk's Old Debt", icon: 'shell', maxLevel: 4, costs: [30, 80, 170, 340], effects: {}, special: 'startShells:30', unlock: null,
    desc: 'He owes you. He will not say for what. +30 starting Shells per level.' },
  { id: 'heartwood_oar', name: 'Heartwood Oar', icon: 'oar', maxLevel: 3, costs: [45, 125, 280], effects: { moveSpeed: 0.3 }, unlock: null,
    desc: 'Carved from the last tree that grew in sunlight. It still leans toward it. +0.3 raft speed.' },
  { id: 'seven_knots', name: 'Line of Seven Knots', icon: 'line', maxLevel: 3, costs: [45, 140, 310], effects: { lineStrength: 0.1 }, unlock: null,
    desc: 'Each knot was tied by a different Wick. None have come undone.' },
  { id: 'first_wick_stub', name: 'Stub of the First Wick', icon: 'ember', maxLevel: 2, costs: [140, 400], effects: { maxHp: 1 }, unlock: null, requires: { bestDay: 3 },
    desc: 'Barely a thumb of wax. It remembers being tall. +1 Ember.' },
  { id: 'two_headed_coin', name: 'Two-Headed Coin', icon: 'coin', maxLevel: 3, costs: [80, 220, 465], effects: { rarityBonus: 0.03, luck: 0.1 }, unlock: null, requires: { runs: 2 },
    desc: 'Lucky, they said. It came up heads every time. Even the last time.' },
  { id: 'drifters_bundle', name: "Drifter's Bundle", icon: 'bundle', maxLevel: 2, costs: [65, 185], effects: {}, special: 'startKit', unlock: null, requires: { runs: 2 },
    desc: "I: start with 8 Mire Worms and 3 Lumen Moss. II: also the starting zone's legend bait." },
  { id: 'tinderbox', name: "Grandsire's Tinderbox", icon: 'xp', maxLevel: 3, costs: [50, 140, 310], effects: { xpMult: 0.05, pickupRadius: 0.5 }, unlock: null, requires: { bestLevel: 8 },
    desc: 'Dry wood, flint, and the patience of someone long gone. +5% cinders, +0.5 m magnet.' },
  { id: 'steady_hook', name: "Grandmother's Hook", icon: 'hook', maxLevel: 3, costs: [45, 140, 310], effects: { hookWindow: 0.08, sweetZone: 0.012 }, unlock: 'perfect_10_run',
    desc: 'Blunted with use. It still remembers exactly when to bite.' },
  { id: 'barnacle_cloak', name: 'Barnacle Cloak', icon: 'ward', maxLevel: 3, costs: [90, 245, 530], effects: { armor: 0.05 }, unlock: 'untouched',
    desc: 'Heavy, wet, and very hard to bite through. +5% ward.' },
  { id: 'ember_in_resin', name: 'Ember in Resin', icon: 'flare', maxLevel: 3, costs: [65, 170, 375], effects: { flareCooldown: -1.5, flareRadius: 0.5 }, unlock: 'bonfire_night',
    desc: 'A spark from a flare that once saved someone. It is still warm.' },
  { id: 'shimmer_scale', name: 'Shimmering Scale', icon: 'scale', maxLevel: 3, costs: [80, 220, 465], effects: { rarityBonus: 0.02 }, special: 'shimmer:0.04', unlock: 'shimmering',
    desc: 'It never stops catching light. Neither, now, will your catches.' },
  { id: 'remembrance', name: 'Remembrance', icon: 'memory', maxLevel: 3, costs: [125, 310, 620], effects: {}, special: 'memMult:0.08', unlock: 'kindled',
    desc: 'The water remembers a little more of you each time. +8% Memories per level.' },
  { id: 'listening_bobber', name: 'The Listening Bobber', icon: 'bobber', maxLevel: 1, costs: [185], effects: { nibbleTells: 1 }, unlock: 'catch_100',
    desc: 'Painted with a small ear. It hears the difference between hunger and curiosity.' },
  { id: 'torn_ledger', name: 'Torn Ledger Page', icon: 'ledger', maxLevel: 3, costs: [70, 185, 400], effects: { sellMult: 0.06 }, unlock: 'shells_1000_run',
    desc: "A page from Old Murk's accounts. Your name is on it, crossed out, then written in again." },
  { id: 'gamblers_wick', name: "Gambler's Wick", icon: 'reroll', maxLevel: 2, costs: [90, 280], effects: { rerolls: 1 }, unlock: 'kindle_one',
    desc: 'Burns at both ends. One more chance to choose. +1 reroll per run.' },
  { id: 'second_wick', name: 'Second Wick', icon: 'revive', maxLevel: 1, costs: [465], effects: {}, special: 'secondWick', unlock: 'into_the_vault',
    desc: 'Once per run, a killing blow leaves you at 1 Ember with 40 oil and a free flare.' },
  { id: 'waystone_sporewood', name: 'Waystone: Sporewood', icon: 'waystone', maxLevel: 1, costs: [185], effects: {}, special: 'waystone:sporewood', unlock: null, requires: { deepestZone: 1 },
    desc: 'Charcoal pressed against a mossy stone. Begin a descent in Sporewood Pools with 160 Shells and 9 banked levels.' },
  { id: 'waystone_glasswater', name: 'Waystone: Glasswater', icon: 'waystone', maxLevel: 1, costs: [400], effects: {}, special: 'waystone:glasswater', unlock: null, requires: { deepestZone: 2 },
    desc: 'A rubbing of a cold, clear stone. Begin in the Glasswater Vault with 450 Shells and 18 banked levels.' },
  { id: 'waystone_paleabyss', name: 'Waystone: Pallid Deep', icon: 'waystone', maxLevel: 1, costs: [700], effects: {}, special: 'waystone:paleabyss', unlock: null, requires: { deepestZone: 3 },
    desc: 'A stone no Wick should have reached. It still points down. Begin in the Pallid Deep with 950 Shells and 28 banked levels.' },
];

// =====================================================================================
// ENEMIES (DESIGN §7) — the night swarm. model ∈ CREATURE_KINDS. hp/speed are BASE values
// (× difficultyFor hpMult/speedMult). damage = Embers per hit (× damageMult, floored,
// min 1). oilDrain = oil per contact, or per SECOND while latched/gripping (× drainMult).
// xp = cinder value (× (1 + 0.1·Heat) × xpMult). weights = spawn-bag weight per zone
// index (0 = never). dayMin applies only in the enemy's own zoneMin lake. pack = members
// per spawn event (each costs one spawn credit). flies: ignores islands/pillars.
// waterBound: steers around obstacles. auraTaken: × aura damage. variants: per-zone
// cosmetic re-skins (+ small mods). elite/boss enemies come from timers, not the bag.
// =====================================================================================
export const ENEMIES = [
  // ---------------------------------------------------------------- fodder & specialists
  { id: 'gloomling', name: 'Gloomling', model: 'wisp', zoneMin: 0, dayMin: 1, hp: 4, speed: 2.6, damage: 1, oilDrain: 2, xp: 1,
    behavior: 'chase', pack: 1, weights: [10, 6, 4, 3], flies: true, burstOnContact: true, auraTaken: 1,
    telegraph: { lungeAt: 3, pause: 0.35, lungeMult: 2.5, lungeTime: 0.5 }, tint: 0x07080d, eyeColor: 0xecf0f6, scale: 1,
    variants: { sporewood: { eyeColor: 0xffd9c4 }, glasswater: { eyeColor: 0xc9e8ff }, paleabyss: { eyeColor: 0xeae4d3 } },
    desc: 'A fist-sized curl of living ink with two pinprick eyes. It flares its eyes before it lunges.',
    lore: "It doesn't hate you. It's only cold, and you're the only warm thing for miles." },
  { id: 'inkmite', name: 'Inkmite', model: 'mite', zoneMin: 0, dayMin: 2, hp: 1.5, speed: 3.9, damage: 1, oilDrain: 1, xp: 0.5,
    behavior: 'pack', pack: 6, packPerHeat: 0.34, packMax: 10, weights: [5, 4, 3, 2], waterBound: true, burstOnContact: true, zigzag: 1.2, auraTaken: 1,
    tint: 0x0a0a10, eyeColor: 0xf2b6c8, scale: 0.8,
    variants: { sporewood: { name: 'Spore Tick', eyeColor: 0xff7fb0, tint: 0x150a14 }, glasswater: { name: 'Shard Mite', eyeColor: 0x5cbcff, tint: 0x0a0f24 }, paleabyss: { name: 'Ash Mite', eyeColor: 0xeae4d3, tint: 0x0c0b09 } },
    desc: 'Soot-black ticks that skitter in clutches, zig-zagging. Islands break the pack.',
    lore: 'Alone, a crumb of soot. Together, a tide that knows your name.' },
  { id: 'duskmantle', name: 'Duskmantle', model: 'moth', zoneMin: 0, dayMin: 2, hp: 3, speed: 3.4, damage: 0, oilDrain: 1.2, xp: 2,
    behavior: 'latch', pack: 1, weights: [3, 3, 2.5, 2], flies: true, maxLatched: 4, dim: 0.88, lightSpeedMult: 1.15, auraTaken: 1, auraTakenLatched: 0.5, latchedRefund: 1,
    tint: 0x6a5f78, eyeColor: 0xb8ccff, scale: 1,
    variants: { glasswater: { name: 'Veil Moth', eyeColor: 0xb48cff, tint: 0x2a2244 }, paleabyss: { name: 'Pyrewing', eyeColor: 0xe8c66a, tint: 0xd8d2c0, scale: 1.2 } },
    desc: 'A dusty moth with painted eye-spots. It speeds up in your light, latches on the lantern and drinks it.',
    lore: 'It does not bite. It only loves your light more than you do.' },
  { id: 'creelsnatch', name: 'Creelsnatch', model: 'eel', zoneMin: 0, dayMin: 3, hp: 8, speed: 4.5, damage: 1, oilDrain: 0, xp: 3,
    behavior: 'leap', pack: 1, weights: [2, 2, 2, 1.5], depthMin: 0.4, maxAlive: 2, maxAlivePerHeat: 0.167, steals: true, leapSpeed: 10,
    telegraph: { circle: [3, 6], circleRadius: [6, 9], surface: 1.0, leap: 0.6 }, fleeTime: 3, auraImmuneSubmerged: true, zapAirborneMult: 2, auraTaken: 1,
    tint: 0x07080d, eyeColor: 0xf2b6c8, scale: 1,
    variants: { glasswater: { name: 'Prism Eel', eyeColor: 0x5cbcff, tint: 0x05081a, feint: 0.8 } },
    desc: 'A ribbon of shadow with hook-teeth. It surfaces, hisses, then leaps the raft to steal from your creel.',
    lore: 'It has never once been hungry. It just likes holding things that were yours.' },
  { id: 'sporeling', name: 'Sporeling Drift', model: 'wisp', zoneMin: 1, dayMin: 1, hp: 6, speed: 2.8, damage: 1, oilDrain: 2, xp: 1.5,
    behavior: 'orbitDive', pack: 3, weights: [0, 6, 3, 2], flies: true, burstOnContact: true, auraTaken: 1,
    orbit: { radius: 9, time: 2, diveGap: 0.5 }, deathBurst: { radius: 2.2, damage: 3 }, contactDim: { mult: 0.85, time: 3 },
    tint: 0x1a0d1c, eyeColor: 0xffb46a, scale: 1,
    desc: 'Three puffball gloomlings that circle outside your light, then dive one by one. A popped one hurts its kin.',
    lore: 'They circle three times, the old way, before they come to pay respects.' },
  { id: 'weeping_inkwell', name: 'Weeping Inkwell', model: 'wisp', zoneMin: 0, dayMin: 6, hp: 11, speed: 1.8, damage: 0, oilDrain: 0, xp: 4,
    behavior: 'artillery', pack: 1, weights: [1.5, 2.5, 2.5, 2], flies: true, maxAlive: 3, maxAlivePerHeat: 0.125, auraTaken: 1,
    artillery: { hold: [13, 18], every: 5.0, flight: 1.2, lead: 0.6, ringRadius: 2.4, damage: 1, slick: { radius: 2.4, time: 6, speedMult: 0.6, lightMult: 0.8 } },
    tint: 0x07080d, eyeColor: 0xecf0f6, scale: 1.5,
    desc: 'A bowed figure with a swollen ink-sac. It keeps its distance and lobs ink: a dark ring marks where it lands.',
    lore: 'It never comes close. It only grieves at you from the dark, and its grief has weight.' },
  { id: 'belljar_tick', name: 'Bell-Jar Tick', model: 'mite', zoneMin: 1, dayMin: 8, hp: 28, speed: 1.7, damage: 1, oilDrain: 3, xp: 5,
    behavior: 'bulwark', pack: 2, weights: [0, 1.5, 3, 2.5], waterBound: true, burstOnContact: false,
    auraTaken: 0.25, auraTakenCracked: 0.6, crackedAt: 0.5, zapTaken: 1.5, shove: 3, rehit: 1.0,
    tint: 0x10131c, eyeColor: 0xc9e8ff, scale: 2.0,
    desc: 'A hound-sized tick under a cracked glass bell-jar. Light glances off it; weapons and zaps do not.',
    lore: 'Someone kept it on a shelf for a hundred years. Now it would like to keep you.' },
  { id: 'silent_choir', name: 'Silent Choir', model: 'wisp', zoneMin: 2, dayMin: 12, hp: 7, speed: 2.8, damage: 1, oilDrain: 4, xp: 2,
    behavior: 'stalk', pack: 3, weights: [0, 0, 1.5, 6], flies: true, burstOnContact: true, auraTaken: 1,
    invisibleOutsideLight: true, gatherCount: 3, rushBelowOil: 0.35, rushMult: 1.6,
    tint: 0x020202, eyeColor: 0xe8c66a, scale: 1.1,
    desc: 'Tall veiled figures. Outside your light only their gold eyes show. When your oil runs low, they rush.',
    lore: "They sing a hymn no one hears. You'll know the verse when your lantern dims." },

  // ---------------------------------------------------------------- elite (timer)
  { id: 'drowned_hand', name: 'Drowned Hand', model: 'hand', zoneMin: 0, dayMin: 2, hp: 60, speed: 0, damage: 2, oilDrain: 10, xp: 15,
    behavior: 'slam', pack: 1, weights: [0, 0, 0, 0], elite: true, eliteWeights: [1, 1, 1, 1], shells: 6, oilDrop: 15, auraTaken: 1,
    telegraph: { stain: 1.4, stainRadius: 3.2, breach: 0.6, linger: 3, slams: 3, maxTime: 16 },
    flareStagger: { time: 2, damageTaken: 1.5 }, zapStagger: 3, snapsLine: true, knock: 4,
    zoneMods: {
      sporewood: { name: 'Mould-Gloved Hand', sporeCloud: { lightMult: 0.8, time: 4 }, eyeColor: 0xffb46a },
      glasswater: { name: 'The Undertow Grasp', tipsCreel: 2, eyeColor: 0x5cbcff },
      paleabyss: { name: 'The Ringed Grasp', pair: true, pairGap: 1.0, tint: 0xd8d2c0, eyeColor: 0xe8c66a, grip: { time: 3, oilPerSec: 3, zapsToBreak: 3 } },
    },
    tint: 0x07080d, eyeColor: 0xecf0f6, scale: 1,
    desc: 'A colossal dripping hand. Ink stains the water under you first: move, or flare it while it rises.',
    lore: 'It reaches for the surface the way it reached for the lantern, the night everything fell.' },

  // ---------------------------------------------------------------- Wardens (boss nights)
  { id: 'the_wickeater', name: 'The Wickeater', model: 'warden', zoneMin: 0, dayMin: 1, hp: 1000, speed: 1.5, damage: 1, oilDrain: 20, xp: 60,
    behavior: 'warden', boss: true, zone: 'mossmere', shells: 40, weights: [0, 0, 0, 0], auraTaken: 1,
    abilities: [
      { id: 'inhale', every: 9, telegraph: 1.5, radius: 10, pull: 3.5, duration: 2, maw: 2.5, mawDamage: 2, mawOil: 25 },
      { id: 'brood', every: 12, enemy: 'gloomling', count: 6 },
    ],
    phase2: { at: 0.5, abilities: [{ id: 'snuff', radius: 6, lightMult: 0.6 }], inhaleEvery: 7 },
    tint: 0x05070a, eyeColor: 0xdbe2ff, scale: 1,
    desc: 'A colossal hooded gloom with a hollow, moon-lit maw and candle stubs in its hem like teeth. It inhales.',
    lore: 'It has eaten a thousand little flames. It remembers none of their names and all of their warmth.' },
  { id: 'the_veiled_gardener', name: 'The Veiled Gardener', model: 'warden', zoneMin: 1, dayMin: 1, hp: 1100, speed: 1.5, damage: 2, oilDrain: 20, xp: 90,
    behavior: 'warden', boss: true, zone: 'sporewood', shells: 80, weights: [0, 0, 0, 0], auraTaken: 1,
    abilities: [
      { id: 'veil', every: 10, telegraph: 1.2, radius: 6, duration: 4, lightMult: 0.6, auraMult: 0.6 },
      { id: 'charge', every: 14, telegraph: 1.2, length: 25, speed: 14, damage: 2 },
      { id: 'brood', every: 11, enemy: 'sporeling', count: 6 },
    ],
    phase2: { at: 0.5, veilDuration: 8, veilDrift: 1.5 },
    tint: 0x0b060d, eyeColor: 0xffb46a, scale: 1.1,
    desc: 'A towering figure draped in plum veils of mould, an amber glow where a face should be. It charges along a glowing line.',
    lore: 'It still walks the garden paths, carrying flowers that have become something else.' },
  { id: 'the_shard_abbot', name: 'The Shard Abbot', model: 'warden', zoneMin: 2, dayMin: 1, hp: 1200, speed: 1.6, damage: 2, oilDrain: 25, xp: 130,
    behavior: 'warden', boss: true, zone: 'glasswater', shells: 140, weights: [0, 0, 0, 0], auraTaken: 1,
    abilities: [
      { id: 'hymnRing', every: 8, telegraph: 1.0, count: 12, gaps: 2, speed: 7, damage: 1 },
      { id: 'reliquary', every: 14, enemy: 'belljar_tick', count: 2 },
    ],
    phase2: { at: 0.5, mirror: { every: 12, duration: 6, images: 2 } },
    tint: 0x03040e, eyeColor: 0x5cbcff, scale: 1.2,
    desc: 'Robed in shelved crystal like a walking library. It rings out expanding hymns of glass with gaps to slip through.',
    lore: 'It catalogued every light the kingdom kept. You are an omission it means to correct.' },
  { id: 'the_lightless_ferryman', name: 'The Lightless Ferryman', model: 'warden', zoneMin: 3, dayMin: 1, hp: 1400, speed: 1.7, damage: 2, oilDrain: 30, xp: 200,
    behavior: 'warden', boss: true, zone: 'paleabyss', shells: 220, weights: [0, 0, 0, 0], auraTaken: 1,
    abilities: [
      { id: 'poleSweep', every: 7, telegraph: 1.0, arcDeg: 120, length: 10, damage: 2 },
      { id: 'eclipse', every: 14, telegraph: 1.5, lightMult: 0.4, duration: 4 },
      { id: 'brood', every: 10, enemy: 'silent_choir', count: 6 },
    ],
    phase2: { at: 0.5, abilities: [{ id: 'inhale', every: 9, telegraph: 1.5, radius: 12, pull: 3.5, duration: 2, maw: 2.5, mawDamage: 2, mawOil: 25 }] },
    neverDuringLegend: 'pale_leviathan',
    tint: 0x020202, eyeColor: 0xe8c66a, scale: 1.35,
    desc: 'A hooded giant poling a boat that is not there, a dull gold coin for each eye. Its pole sweeps lit arcs across the water.',
    lore: 'It has carried every light across. It has saved a seat for yours.' },
];

// =====================================================================================
// FORMATIONS (DESIGN §7.3) — scripted swarm beats at gloomtide k = 0.35 and 0.65 from
// day 2 (one weighted pick each; skipped while a Warden lives). count may use H = Heat.
// =====================================================================================
export const FORMATIONS = [
  { id: 'encircle', name: 'The Closing Ring', zoneMin: 0, dayMin: 2, weight: 3, enemy: 'gloomling', enemyByZone: { sporewood: 'sporeling' },
    count: { base: 10, perHeat: 2 }, ringRadius: 18, banner: 'They close in a ring.', answer: 'Flare a gap, or burn through with area weapons.' },
  { id: 'tide', name: 'Mite Tide', zoneMin: 0, dayMin: 2, weight: 3, enemy: 'inkmite', packs: [3, 4], packSize: { base: 18, perHeat: 1 }, bandWidth: 24, speedMult: 1.25,
    banner: 'A tide of mites sweeps in.', answer: 'Sail perpendicular to it.' },
  { id: 'dimming', name: 'The Dimming', zoneMin: 0, dayMin: 3, weight: 2, enemy: 'duskmantle', count: { base: 5, perHeatHalf: 1 },
    banner: 'Wings, from one side.', answer: 'Zap them off, or flare.' },
  { id: 'volley', name: 'Inkwell Volley', zoneMin: 1, dayMin: 1, zone0DayMin: 6, weight: 2, enemy: 'weeping_inkwell', count: { base: 3 }, ringRadius: 16, shape: 'triangle',
    banner: 'Grief, from three sides.', answer: 'Keep moving and hunt them down.' },
  { id: 'procession', name: 'Bell-Jar Procession', zoneMin: 2, dayMin: 1, weight: 2, enemy: 'belljar_tick', count: { min: 4, max: 6 }, escort: 'inkmite',
    banner: 'Glass, clinking in a line.', answer: 'Weapons and zaps, not the aura. Kite them.' },
  { id: 'hush', name: 'The Hush', zoneMin: 3, dayMin: 1, weight: 3, enemy: 'silent_choir', count: { trios: 3 }, lightMult: 0.8, duration: 8,
    banner: 'The light thins. Something is listening.', answer: 'Keep oil above a third. The beam reveals them.' },
];

// =====================================================================================
// BOONS (DESIGN §10) — level-up picks (1 of 3). kind 'weapon' (levels[i] = full params at
// level i+1, `note` = what changed) or 'stat' (effects on STATS keys per level; optional
// onPick and proc). Weapon damage × damageMult and rolls critChance; weapon cooldowns ×
// cooldownMult. A weapon at L5 + its kindle.requires passive (any level) offers a
// legendary KINDLE card that becomes level 6 (params = kindle.params). unlock: challenge
// id (null = in the pool from run 1). Slots: 4 weapons, 6 passives (stat boons).
// Param meanings per weapon type: DESIGN §10.3.
// =====================================================================================
export const BOONS = [
  // ---------------------------------------------------------------- weapons (10)
  { id: 'circling_cinders', name: 'Circling Cinders', icon: 'orbit', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'orbit', unlock: null, tags: ['fire', 'area', 'close'],
    desc: 'Coals circle your lantern, scorching what they touch.', lore: 'A few coals that refuse to stray far from home.',
    levels: [
      { count: 2, damage: 4, radius: 2.8, spin: 2.4, hitCooldown: 0.6, note: 'Two coals circle the raft.' },
      { count: 3, damage: 4, radius: 2.8, spin: 2.4, hitCooldown: 0.6, note: '+1 coal.' },
      { count: 3, damage: 6, radius: 3.0, spin: 2.7, hitCooldown: 0.55, note: '+50% damage, faster spin.' },
      { count: 4, damage: 6, radius: 3.2, spin: 2.7, hitCooldown: 0.55, note: '+1 coal, wider ring.' },
      { count: 5, damage: 9, radius: 3.4, spin: 3.0, hitCooldown: 0.5, note: '+1 coal, +50% damage.' },
    ],
    kindle: { requires: 'searing_glow', name: 'Hearth Halo', desc: 'Seven coals ride the edge of your light and leave things burning.', lore: 'A ring of warmth as wide as a hearth, and as patient.',
      params: { count: 7, damage: 14, radiusLightMult: 0.6, spin: 3.0, hitCooldown: 0.5, burnDps: 3, burnTime: 2 } } },
  { id: 'drifting_motes', name: 'Drifting Motes', icon: 'motes', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'motes', unlock: null, tags: ['light', 'projectile', 'homing'],
    desc: 'Little lights drift out and seek the nearest gloomling.', lore: 'Little lights that go looking, as you once did.',
    levels: [
      { count: 2, damage: 6, cooldown: 1.5, speed: 9, range: 16, pierce: 0, note: 'Two seeking motes.' },
      { count: 2, damage: 8, cooldown: 1.4, speed: 9, range: 16, pierce: 0, note: '+33% damage.' },
      { count: 3, damage: 8, cooldown: 1.3, speed: 10, range: 16, pierce: 0, note: '+1 mote.' },
      { count: 3, damage: 11, cooldown: 1.2, speed: 11, range: 16, pierce: 0, note: '+38% damage, faster.' },
      { count: 4, damage: 14, cooldown: 1.0, speed: 12, range: 16, pierce: 1, note: '+1 mote; motes pierce once.' },
    ],
    kindle: { requires: 'brighter_wick', name: 'Lantern Moths', desc: 'Six winged motes, each striking three times and seeking anew after a kill.', lore: 'The motes grew wings and stopped needing you to aim.',
      params: { count: 6, damage: 14, cooldown: 1.0, speed: 12, range: 16, pierce: 2, reseek: true } } },
  { id: 'burning_wake', name: 'Burning Wake', icon: 'trail', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'trail', unlock: null, tags: ['fire', 'area', 'movement'],
    desc: 'While the raft moves it leaves a ribbon of fire on the water.', lore: 'Where you have been, the water remembers fire.',
    levels: [
      { dps: 5, life: 2.5, width: 1.4, minSpeed: 1.5, igniteTime: 2, note: 'A trail of fire behind the raft.' },
      { dps: 7, life: 2.5, width: 1.6, minSpeed: 1.5, igniteTime: 2, note: '+40% burn, wider.' },
      { dps: 7, life: 3.5, width: 1.8, minSpeed: 1.5, igniteTime: 2, note: 'Burns 1 s longer.' },
      { dps: 10, life: 3.5, width: 2.0, minSpeed: 1.5, igniteTime: 2, note: '+43% burn.' },
      { dps: 14, life: 4.5, width: 2.4, minSpeed: 1.0, igniteTime: 2, note: '+40% burn, lasts longer, lights at lower speed.' },
    ],
    kindle: { requires: 'swift_oars', name: 'Comet Keel', desc: 'A road of fire; at full speed the raft rams small gloomlings aside instead of being hit.', lore: 'The raft burns a road across the water, and anything on it.',
      params: { dps: 24, life: 4.5, width: 2.6, minSpeed: 1.0, igniteTime: 2, ram: { speedFrac: 0.8, damage: 30, knock: 5 } } } },
  { id: 'prodigal_hook', name: 'Prodigal Hook', icon: 'hook', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'hook', unlock: null, tags: ['projectile', 'ricochet'],
    desc: 'A barbed hook on a glowing thread ricochets between gloomlings and returns.', lore: 'Flung, forgiven, and always home before dark.',
    levels: [
      { damage: 10, bounces: 3, cooldown: 2.2, speed: 18, bounceRange: 7, returns: true, note: 'A ricocheting hook.' },
      { damage: 13, bounces: 3, cooldown: 2.0, speed: 18, bounceRange: 7, returns: true, note: '+30% damage, faster.' },
      { damage: 13, bounces: 4, cooldown: 1.8, speed: 18, bounceRange: 7, returns: true, note: '+1 bounce.' },
      { damage: 17, bounces: 5, cooldown: 1.6, speed: 18, bounceRange: 7, returns: true, note: '+1 bounce, +30% damage.' },
      { damage: 22, bounces: 6, cooldown: 1.4, speed: 18, bounceRange: 7, returns: true, note: '+1 bounce, +30% damage.' },
    ],
    kindle: { requires: 'fierce_flame', name: 'Gaff of the Drowned Crown', desc: 'Nine bounces, triple crits, and it drags its last victim into your light.', lore: 'It drags them into the light to look at you.',
      params: { damage: 30, bounces: 9, cooldown: 1.2, speed: 18, bounceRange: 7, returns: true, pull: 4, critMult: 3 } } },
  { id: 'forked_spark', name: 'Forked Spark', icon: 'spark', rarity: 'rare', maxLevel: 5, kind: 'weapon', weapon: 'spark', unlock: null, tags: ['light', 'chain'],
    desc: 'Lightning leaps from the lantern and forks from gloomling to gloomling.', lore: 'Lightning forgets nothing it has touched.',
    levels: [
      { damage: 8, chains: 3, cooldown: 2.0, range: 11, chainRange: 4.5, stun: 0.15, note: 'Lightning that forks 3 times.' },
      { damage: 8, chains: 4, cooldown: 1.8, range: 11, chainRange: 4.5, stun: 0.15, note: '+1 fork, faster.' },
      { damage: 12, chains: 4, cooldown: 1.7, range: 11, chainRange: 4.5, stun: 0.15, note: '+50% damage.' },
      { damage: 12, chains: 5, cooldown: 1.5, range: 11, chainRange: 5, stun: 0.15, note: '+1 fork, longer reach.' },
      { damage: 16, chains: 6, cooldown: 1.3, range: 11, chainRange: 5.5, stun: 0.15, note: '+1 fork, +33% damage.' },
    ],
    kindle: { requires: 'restless_hands', name: 'Stormglass', desc: 'Casts twice; struck gloomlings are charged and your next zap on them deals ×3.', lore: 'Twice the lightning. The dark never knows which was the warning.',
      params: { damage: 18, chains: 9, cooldown: 1.3, range: 11, chainRange: 5.5, stun: 0.15, casts: 2, charge: { time: 3, zapMult: 3 } } } },
  { id: 'tolling_bell', name: 'Tolling Bell', icon: 'bell', rarity: 'rare', maxLevel: 5, kind: 'weapon', weapon: 'bell', unlock: 'first_dawn', tags: ['area', 'slow', 'frost'],
    desc: 'A drowned bell rings from the raft. Gloomlings in its toll are hurt and slowed.', lore: 'Rung once for every Wick the water kept.',
    levels: [
      { damage: 4, radius: 8, slow: 0.35, slowTime: 2.5, cooldown: 6, note: 'A slowing toll.' },
      { damage: 5, radius: 9, slow: 0.40, slowTime: 2.5, cooldown: 5.5, note: 'Wider, stronger slow.' },
      { damage: 7, radius: 10, slow: 0.45, slowTime: 2.5, cooldown: 5, note: '+40% damage, wider.' },
      { damage: 9, radius: 11, slow: 0.50, slowTime: 2.5, cooldown: 4.5, note: '+30% damage, wider.' },
      { damage: 12, radius: 12, slow: 0.55, slowTime: 2.5, cooldown: 4, note: '+33% damage, wider, faster.' },
    ],
    kindle: { requires: 'hardened_wax', name: 'Requiem', desc: 'Chilled gloomlings take +30% from everything; every third toll roots them.', lore: 'The bell rings, and the dark forgets how to move.',
      params: { damage: 16, radius: 13, slow: 0.6, slowTime: 2.5, cooldown: 4, chillVuln: 0.3, rootEvery: 3, rootTime: 1 } } },
  { id: 'lantern_pulse', name: 'Lantern Pulse', icon: 'nova', rarity: 'rare', maxLevel: 5, kind: 'weapon', weapon: 'nova', unlock: 'three_nights', tags: ['light', 'area', 'knockback'],
    desc: 'Your light throbs outward, hurting and hurling back everything inside it.', lore: "Your flame's heartbeat, loud enough to frighten the dark.",
    levels: [
      { damage: 10, radiusMult: 0.9, cooldown: 5, knock: 2, note: 'A pulse across 90% of your light.' },
      { damage: 13, radiusMult: 0.95, cooldown: 4.6, knock: 2, note: '+30% damage.' },
      { damage: 17, radiusMult: 1.0, cooldown: 4.2, knock: 2.5, note: '+30% damage, fills your light.' },
      { damage: 21, radiusMult: 1.05, cooldown: 3.8, knock: 2.5, note: '+25% damage.' },
      { damage: 28, radiusMult: 1.15, cooldown: 3.2, knock: 3.5, note: '+33% damage, past your light.' },
    ],
    kindle: { requires: 'slow_burn', name: 'Heartbeat of the Deep', desc: 'A faster, heavier pulse that sips oil back from what it breaks.', lore: 'Each pulse sips a little oil from what it breaks.',
      params: { damage: 40, radiusMult: 1.15, cooldown: 2.4, knock: 3.5, oilPerHit: 0.5, oilMaxPerPulse: 3 } } },
  { id: 'smouldering_floats', name: 'Smouldering Floats', icon: 'mines', rarity: 'rare', maxLevel: 5, kind: 'weapon', weapon: 'mines', unlock: 'break_a_hand', tags: ['fire', 'area', 'trap'],
    desc: 'Cracked cork bobbers full of coal drop in your wake (or are tossed at crowds while anchored) and burst.', lore: 'Old bobbers stuffed with coal. The fish never bit. Something else will.',
    levels: [
      { damage: 18, blastRadius: 2.5, cooldown: 2.5, max: 3, arm: 0.6, trigger: 1.5, life: 12, toss: [4, 8], note: 'Up to 3 floats.' },
      { damage: 24, blastRadius: 2.8, cooldown: 2.2, max: 4, arm: 0.6, trigger: 1.5, life: 12, toss: [4, 8], note: '+1 float, bigger blast.' },
      { damage: 30, blastRadius: 3.0, cooldown: 2.0, max: 5, arm: 0.6, trigger: 1.5, life: 12, toss: [4, 8], note: '+1 float, +25% damage.' },
      { damage: 38, blastRadius: 3.2, cooldown: 1.8, max: 6, arm: 0.6, trigger: 1.5, life: 12, toss: [4, 8], note: '+1 float, +27% damage.' },
      { damage: 50, blastRadius: 3.6, cooldown: 1.5, max: 8, arm: 0.6, trigger: 1.5, life: 12, toss: [4, 8], note: '+2 floats, +32% damage.' },
    ],
    kindle: { requires: 'cinder_magnet', name: 'Lantern Fleet', desc: 'Ten floats that drift toward gloomlings; every blast pulls cinders to you.', lore: 'A drifting armada of little fires, each looking for company.',
      params: { damage: 60, blastRadius: 3.6, cooldown: 1.5, max: 10, arm: 0.6, trigger: 1.5, life: 12, toss: [4, 8], drift: 2, pullsCinders: true } } },
  { id: 'little_maelstrom', name: 'Little Maelstrom', icon: 'vortex', rarity: 'epic', maxLevel: 5, kind: 'weapon', weapon: 'vortex', unlock: 'full_flame', tags: ['water', 'control', 'area'],
    desc: 'A small whirlpool opens on the thickest crowd nearby and drags gloomlings into it.', lore: 'A small drowning, made to order.',
    levels: [
      { dps: 6, radius: 3, pull: 3, duration: 3, cooldown: 9, range: 14, note: 'A dragging whirlpool.' },
      { dps: 8, radius: 3.3, pull: 3.5, duration: 3.2, cooldown: 8.5, range: 14, note: 'Stronger pull.' },
      { dps: 10, radius: 3.6, pull: 4, duration: 3.5, cooldown: 8, range: 14, note: 'Bigger, longer.' },
      { dps: 13, radius: 4, pull: 4.5, duration: 3.8, cooldown: 7.5, range: 14, note: '+30% damage.' },
      { dps: 18, radius: 4.5, pull: 5.5, duration: 4.5, cooldown: 6.5, range: 14, note: '+38% damage, much stronger pull.' },
    ],
    kindle: { requires: 'wildfire', name: 'Undertow Bloom', desc: 'Two whirlpools, each closing in a free flare burst.', lore: 'The whirlpool closes like a flower made of flame.',
      params: { dps: 24, radius: 4.5, pull: 5.5, duration: 4.5, cooldown: 6.5, range: 14, count: 2, endFlare: true } } },
  { id: 'lighthouse_beam', name: 'Lighthouse Beam', icon: 'beam', rarity: 'epic', maxLevel: 5, kind: 'weapon', weapon: 'beam', unlock: 'lamplighter', tags: ['light', 'area', 'sweep'],
    desc: 'Hard shafts of light sweep the water around you. Reveals what hides in the dark.', lore: "A light meant to bring ships home, turned on everything that isn't.",
    levels: [
      { damage: 8, beams: 1, lengthAdd: 4, width: 0.9, turnSpeed: 1.2, hitCooldown: 0.4, note: 'One sweeping beam.' },
      { damage: 10, beams: 1, lengthAdd: 5, width: 1.0, turnSpeed: 1.3, hitCooldown: 0.4, note: '+25% damage, longer.' },
      { damage: 10, beams: 2, lengthAdd: 5, width: 1.0, turnSpeed: 1.3, hitCooldown: 0.4, note: '+1 beam.' },
      { damage: 13, beams: 2, lengthAdd: 6, width: 1.1, turnSpeed: 1.4, hitCooldown: 0.4, note: '+30% damage, longer.' },
      { damage: 18, beams: 3, lengthAdd: 8, width: 1.3, turnSpeed: 1.6, hitCooldown: 0.4, note: '+1 beam, +38% damage.' },
    ],
    kindle: { requires: 'kindling_heart', name: 'The Great Lantern', desc: 'Four scorching beams; losing an Ember spins them three times faster.', lore: 'For a moment, the drowned city remembers its lighthouse.',
      params: { damage: 24, beams: 4, lengthAdd: 8, width: 1.3, turnSpeed: 1.6, hitCooldown: 0.4, scorch: 1, spinOnHurt: { mult: 3, time: 3 } } } },

  // ---------------------------------------------------------------- passives (16)
  { id: 'brighter_wick', name: 'Brighter Wick', icon: 'light', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { lightRadius: 0.7 }, unlock: null, tags: ['light'],
    desc: '+0.7 m light radius: your aura, pulse and beam reach farther.', lore: 'Trim the wick. Stand a little taller.' },
  { id: 'searing_glow', name: 'Searing Glow', icon: 'flame', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { auraDps: 0.6 }, unlock: null, tags: ['fire', 'aura'],
    desc: '+0.6 lantern burn per second.', lore: 'Your warmth stops asking permission.' },
  { id: 'fierce_flame', name: 'Fierce Flame', icon: 'damage', rarity: 'rare', maxLevel: 5, kind: 'stat', effects: { damageMult: 0.08, critChance: 0.03 }, unlock: null, tags: ['damage'],
    desc: '+8% damage and +3% critical chance.', lore: 'A flame that has made up its mind.' },
  { id: 'restless_hands', name: 'Restless Hands', icon: 'cooldown', rarity: 'rare', maxLevel: 5, kind: 'stat', effects: { cooldownMult: -0.06 }, unlock: null, tags: ['cooldown'],
    desc: 'Flares and weapons recover 6% faster.', lore: 'Hands that cannot bear to wait.' },
  { id: 'swift_oars', name: 'Swift Oars', icon: 'oar', rarity: 'common', maxLevel: 4, kind: 'stat', effects: { moveSpeed: 0.45, pickupRadius: 0.4 }, unlock: null, tags: ['movement'],
    desc: '+0.45 m/s raft speed and +0.4 m cinder magnet.', lore: 'Row as if the dark is close. It is.' },
  { id: 'cinder_magnet', name: 'Cinder Magnet', icon: 'magnet', rarity: 'common', maxLevel: 4, kind: 'stat', effects: { pickupRadius: 1.5, xpMult: 0.05 }, unlock: null, tags: ['greed'],
    desc: '+1.5 m cinder magnet and +5% cinders.', lore: 'Every spark that falls is yours. Take them home.' },
  { id: 'slow_burn', name: 'Slow Burn', icon: 'oil', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { maxOil: 15, oilDrain: -0.012 }, unlock: null, tags: ['oil'],
    desc: '+15 max oil and the flame sips 0.012 less per second.', lore: 'Sip the oil. Make the night last less than you do.' },
  { id: 'hardened_wax', name: 'Hardened Wax', icon: 'ward', rarity: 'rare', maxLevel: 4, kind: 'stat', effects: { armor: 0.06 }, unlock: null, tags: ['survival'],
    desc: '+6% chance to ward off a blow (oil still drains).', lore: 'Old wax, set hard in the cold.' },
  { id: 'kindling_heart', name: 'Kindling Heart', icon: 'ember', rarity: 'epic', maxLevel: 3, kind: 'stat', effects: { maxHp: 1 }, onPick: { heal: 1 }, unlock: null, tags: ['survival'],
    desc: '+1 Ember, and mend 1 Ember now.', lore: 'Somewhere inside, a second flame catches from the first.' },
  { id: 'wildfire', name: 'Wildfire', icon: 'flare', rarity: 'rare', maxLevel: 4, kind: 'stat', effects: { flareRadius: 1.2, flareCost: -2, flareCooldown: -1.5 }, unlock: null, tags: ['flare'],
    desc: 'Flares burst 1.2 m wider, cost 2 less oil and recover 1.5 s sooner.', lore: "Flares that don't know when to stop." },
  { id: 'static_fingers', name: 'Static Fingers', icon: 'zap', rarity: 'common', maxLevel: 4, kind: 'stat', effects: { zapDamage: 3, zapCost: -0.15 }, unlock: null, tags: ['zap'],
    desc: 'Zaps deal +3 damage and cost 0.15 less oil.', lore: 'Your touch crackles. The dark flinches.' },
  { id: 'steady_reel', name: 'Steady Reel', icon: 'reel', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { reelSpeed: 0.10, lineStrength: 0.08, sweetZone: 0.01 }, unlock: null, tags: ['fishing'],
    desc: 'Reel 10% faster, +0.08 line strength, a slightly wider sweet band.', lore: 'The line hums, and does not part.' },
  { id: 'hungry_waters', name: 'Hungry Waters', icon: 'bite', rarity: 'common', maxLevel: 5, kind: 'stat', effects: { biteSpeed: 0.12, hookWindow: 0.06, rarityBonus: 0.02 }, unlock: null, tags: ['fishing'],
    desc: 'Fish bite sooner, hold the hook longer, and run a little rarer.', lore: "The fish come closer, as if they'd heard of you." },
  { id: 'lucky_knot', name: 'Lucky Knot', icon: 'luck', rarity: 'rare', maxLevel: 3, kind: 'stat', effects: { luck: 0.2, rarityBonus: 0.03, rerolls: 1 }, unlock: 'naturalist', tags: ['luck', 'fishing'],
    desc: 'Rarer boons and rarer fish, and +1 reroll.', lore: 'Tied by someone who wanted you to come back.' },
  { id: 'gutsfire', name: 'Gutsfire', icon: 'gut', rarity: 'rare', maxLevel: 5, kind: 'stat', effects: { oilYieldMult: 0.05 }, unlock: 'ember_hoard', tags: ['fishing', 'oil', 'fire'],
    desc: '+5% render yield. Rendering a fish makes your light surge for a few seconds.', lore: 'Nothing wasted. Not even the fish.',
    proc: { on: 'render', levels: [
      { time: 6, auraDps: 1.5, lightRadius: 1 }, { time: 7, auraDps: 2, lightRadius: 1.25 }, { time: 8, auraDps: 2.5, lightRadius: 1.5 },
      { time: 9, auraDps: 3, lightRadius: 1.75 }, { time: 10, auraDps: 4, lightRadius: 2 } ] } },
  { id: 'lantern_on_the_line', name: 'Lantern on the Line', icon: 'nightline', rarity: 'rare', maxLevel: 3, kind: 'stat', effects: {}, unlock: 'night_angler', tags: ['fishing', 'night'],
    desc: 'While reeling at dusk or night your aura burns hotter and the line itself scorches gloomlings.', lore: 'Hook something in the dark and the line itself catches light.',
    proc: { on: 'reel', phases: ['dusk', 'gloomtide'], levels: [
      { auraMult: 1.3, lineDps: 6, lineRadius: 1.5, lineSlow: 0.3 }, { auraMult: 1.45, lineDps: 9, lineRadius: 1.5, lineSlow: 0.3 },
      { auraMult: 1.6, lineDps: 12, lineRadius: 1.5, lineSlow: 0.3, flareOnNightLand: true } ] } },

  // ---------------------------------------------------------------- legendary passives (3, challenge unlocks)
  { id: 'undying_ember', name: 'Undying Ember', icon: 'ember', rarity: 'legendary', maxLevel: 1, kind: 'stat', effects: { maxHp: 2, dawnHeal: 1 }, onPick: { heal: 2 }, unlock: 'pallid_arrival', tags: ['survival'],
    desc: '+2 Embers (mended now) and +1 dawn mending.', lore: 'A flame that refuses.' },
  { id: 'moonless_calm', name: 'Moonless Calm', icon: 'moon', rarity: 'legendary', maxLevel: 1, kind: 'stat', effects: { auraDps: 1.5, lightRadius: 2 }, unlock: 'four_silences', tags: ['light', 'fire'],
    desc: 'Your light becomes a wall: +1.5 burn and +2 m radius.', lore: 'Nothing moves in it that you did not allow.' },
  { id: 'gilded_hook', name: 'Gilded Hook', icon: 'gold', rarity: 'legendary', maxLevel: 1, kind: 'stat', effects: { rarityBonus: 0.10, sellMult: 0.15, hookWindow: 0.10 }, unlock: 'cartographer', tags: ['fishing', 'luck'],
    desc: 'Rarer fish, a longer hook window, and Old Murk pays 15% more.', lore: 'Gold remembers being treasure. So do the fish.' },
];

// =====================================================================================
// CHARACTERS (DESIGN §11) — five playable Wicks. effects: flat STATS deltas. startBoon:
// granted at L1 (bypasses its unlock and joins the run's pool). startKit: {shells, bait}.
// quirk: unique rule (combat/fishing read quirk.id). look → actors.setCharacter().
// =====================================================================================
export const CHARACTERS = [
  { id: 'wick', name: 'The Wick', title: 'A Small, Stubborn Flame', unlock: null,
    desc: 'Balanced in all things. Fishes, sails and burns about as well as any candle can.',
    effects: {}, startBoon: 'drifting_motes', startKit: { shells: 0, bait: { mireworm: 4 } },
    quirk: { id: 'curious', name: 'Curious', desc: 'The first level-up of each night offers 4 cards instead of 3.', choices: 4 },
    look: { flame: 0xffb347, cloak: 0x4a2e24, eyes: 0xffb347, hat: 'none', wax: 0xe9dfc6, scale: 1 },
    lore: "A small, stubborn flame. No one ever told it that it couldn't." },
  { id: 'taper', name: 'Taper', title: 'The Long Reach', unlock: 'steady_hands',
    desc: 'Tall and thin. Casts far, reels true and finds rare fish, but its light burns weak and it carries little oil.',
    effects: { castMax: 4, reelSpeed: 0.15, hookWindow: 0.10, rarityBonus: 0.04, auraDps: -0.4, maxOil: -10 }, startBoon: 'prodigal_hook', startKit: { shells: 0, bait: { mireworm: 8, lumen_moss: 2 } },
    quirk: { id: 'anglers_ember', name: "Angler's Ember", desc: 'Fish give double cinders, and every landed fish refunds 25% of the flare cooldown.', fishXpMult: 2, flareRefund: 0.25 },
    look: { flame: 0xffd27a, cloak: 0x34404a, eyes: 0xffd27a, hat: 'tall', wax: 0xf2ead8, scale: 1.1 },
    lore: 'Long of reach, short of oil. It would rather be fishing.' },
  { id: 'stub', name: 'Stub', title: 'The Bright Little One', unlock: 'down_the_sluice',
    desc: 'Tiny, quick and fiercely bright. Sails fastest and shines widest; has fewest Embers and the smallest creel.',
    effects: { moveSpeed: 1.0, lightRadius: 1.5, pickupRadius: 1.5, maxHp: -1, creelSize: -1 }, startBoon: 'burning_wake', startKit: { shells: 30, bait: {} },
    quirk: { id: 'fanned_flame', name: 'Fanned Flame', desc: 'After 1.5 s at 80%+ top speed, the aura burns ×1.3 (fades over 1 s when slowing).', after: 1.5, speedFrac: 0.8, auraMult: 1.3, fade: 1 },
    look: { flame: 0xfff0a8, cloak: 0x5a3a1e, eyes: 0xfff0a8, hat: 'none', wax: 0xf6efd9, scale: 0.8 },
    lore: 'Burns twice as bright, and has heard how the saying ends.' },
  { id: 'tallow', name: 'Tallow', title: 'The Stout Candle', unlock: 'long_vigil',
    desc: 'Broad and slow. Extra Embers, a hard hide, a deep belly and a stronger dawn, but heavy on the oars and slow to recover.',
    effects: { maxHp: 2, armor: 0.10, dawnHeal: 1, maxSatiety: 25, moveSpeed: -0.8, cooldownMult: 0.10 }, startBoon: 'lantern_pulse', startKit: { shells: 0, bait: {} },
    quirk: { id: 'slow_melt', name: 'Slow Melt', desc: '+0.6 s i-frames; the Gutter-burst is 50% wider and deals flare damage.', iframes: 0.6, burstRadiusMult: 1.5, burstDamage: true },
    look: { flame: 0xff9a4a, cloak: 0x3e3a24, eyes: 0xffb347, hat: 'hood', wax: 0xe2d4b0, scale: 1.15 },
    lore: 'Slow to light. Slower to go out.' },
  { id: 'ashwick', name: 'Ashwick', title: 'Burned Once, Burns Back', unlock: 'unwarded',
    desc: 'A charred wick that hunts the dark: a fierce aura, sharp zaps and crits. It fishes badly and carries little.',
    effects: { auraDps: 0.8, damageMult: 0.15, critChance: 0.05, zapDamage: 3, zapCost: -0.3, hookWindow: -0.15, sweetZone: -0.02, maxOil: -15, creelSize: -1 }, startBoon: 'forked_spark', startKit: { shells: 0, bait: {} },
    quirk: { id: 'cinder_heart', name: 'Cinder Heart', desc: 'Every 12th kill in a night fires a free mini-flare (5 m, half flare damage).', every: 12, radius: 5, damageMult: 0.5 },
    look: { flame: 0xff6a3d, cloak: 0x1e1a1a, eyes: 0xff6a3d, hat: 'hood', wax: 0x8a8070, scale: 1 },
    lore: 'It went out once. It came back angry.' },
];

// =====================================================================================
// CHALLENGES (DESIGN §12) — the 30-goal checklist. scope 'run' = within one descent;
// 'total' = lifetime (meta.challengeProgress). type + params are read by progression
// (type → bus source table in DESIGN §12.2). tier = checklist section (1..3).
// =====================================================================================
export const CHALLENGES = [
  // ---- I. First Flickers (runs 1–3)
  { id: 'first_light', tier: 1, name: 'First Light', desc: 'Land your first fish.', type: 'catch', params: { n: 1 }, scope: 'total', reward: { unlock: null, memories: 5 } },
  { id: 'first_dawn', tier: 1, name: 'First Dawn', desc: 'Endure your first Gloomtide.', type: 'nights', params: { n: 1 }, scope: 'run', reward: { unlock: 'boon:tolling_bell', memories: 5 } },
  { id: 'ember_hoard', tier: 1, name: 'Kindling', desc: 'Reach level 8 in one descent.', type: 'level', params: { n: 8 }, scope: 'run', reward: { unlock: 'boon:gutsfire', memories: 8 } },
  { id: 'three_nights', tier: 1, name: 'Three Long Nights', desc: 'Endure 3 Gloomtides in one descent.', type: 'nights', params: { n: 3 }, scope: 'run', reward: { unlock: 'boon:lantern_pulse', memories: 10 } },
  { id: 'break_a_hand', tier: 1, name: 'Unclenched', desc: 'Break a Drowned Hand.', type: 'slayElite', params: { n: 1 }, scope: 'total', reward: { unlock: 'boon:smouldering_floats', memories: 8 } },
  { id: 'steady_hands', tier: 1, name: 'Steady Hands', desc: 'Land 25 fish across all descents.', type: 'catch', params: { n: 25 }, scope: 'total', reward: { unlock: 'character:taper', memories: 10 } },
  { id: 'naturalist', tier: 1, name: 'Naturalist', desc: 'Name 8 species in the Journal.', type: 'journal', params: { n: 8 }, scope: 'total', reward: { unlock: 'boon:lucky_knot', memories: 10 } },
  { id: 'gloombreaker', tier: 1, name: 'Gloombreaker', desc: 'Disperse 500 gloomlings across all descents.', type: 'slay', params: { n: 500 }, scope: 'total', reward: { unlock: null, memories: 15 } },
  // ---- II. The Long Vigil (runs 3–8)
  { id: 'unwarded', tier: 2, name: 'Unwarded', desc: 'Silence a Warden.', type: 'boss', params: { n: 1 }, scope: 'total', reward: { unlock: 'character:ashwick', memories: 15 } },
  { id: 'down_the_sluice', tier: 2, name: 'Down the Sluice', desc: 'Reach Sporewood Pools.', type: 'reachZone', params: { zone: 'sporewood' }, scope: 'total', reward: { unlock: 'character:stub', memories: 15 } },
  { id: 'long_vigil', tier: 2, name: 'The Long Vigil', desc: 'Endure 5 Gloomtides in one descent.', type: 'nights', params: { n: 5 }, scope: 'run', reward: { unlock: 'character:tallow', memories: 20 } },
  { id: 'untouched', tier: 2, name: 'Untouched', desc: 'Endure a Gloomtide (night 2 or later) without losing an Ember.', type: 'nightNoDamage', params: { n: 1, minDay: 2 }, scope: 'run', reward: { unlock: 'relic:barnacle_cloak', memories: 10 } },
  { id: 'bonfire_night', tier: 2, name: 'Bonfire Night', desc: 'Disperse 200 gloomlings in a single Gloomtide.', type: 'slayNight', params: { n: 200 }, scope: 'run', reward: { unlock: 'relic:ember_in_resin', memories: 20 } },
  { id: 'full_flame', tier: 2, name: 'Full Flame', desc: 'Raise a weapon Boon to level 5.', type: 'boonLevel', params: { kind: 'weapon', level: 5 }, scope: 'run', reward: { unlock: 'boon:little_maelstrom', memories: 15 } },
  { id: 'night_angler', tier: 2, name: 'Night Angler', desc: 'Land 3 fish during a single Gloomtide.', type: 'nightCatch', params: { n: 3 }, scope: 'run', reward: { unlock: 'boon:lantern_on_the_line', memories: 15 } },
  { id: 'perfect_10_run', tier: 2, name: 'Clockwork Wrist', desc: 'Set 10 perfect hooks in one descent.', type: 'perfectHooks', params: { n: 10 }, scope: 'run', reward: { unlock: 'relic:steady_hook', memories: 10 } },
  { id: 'kindled', tier: 2, name: 'Kindled', desc: 'Reach level 15 in one descent.', type: 'level', params: { n: 15 }, scope: 'run', reward: { unlock: 'relic:remembrance', memories: 20 } },
  { id: 'shimmering', tier: 2, name: 'Shimmering', desc: 'Land a Shimmering fish.', type: 'quality', params: { quality: 'perfect' }, scope: 'total', reward: { unlock: 'relic:shimmer_scale', memories: 5 } },
  { id: 'heavy_catch', tier: 2, name: 'Heavyweight', desc: 'Land a non-legendary fish over 8 kg.', type: 'weight', params: { kg: 8, excludeLegendary: true }, scope: 'total', reward: { unlock: 'bait:shimmerfly', memories: 10 } },
  { id: 'catch_100', tier: 2, name: 'Old Hand', desc: 'Land 100 fish across all descents.', type: 'catch', params: { n: 100 }, scope: 'total', reward: { unlock: 'relic:listening_bobber', memories: 20 } },
  { id: 'shells_1000_run', tier: 2, name: "Murk's Favourite", desc: 'Earn 1000 Shells in one descent.', type: 'shells', params: { n: 1000 }, scope: 'run', reward: { unlock: 'relic:torn_ledger', memories: 20 } },
  // ---- III. Deeper Water (runs 8–20+)
  { id: 'kindle_one', tier: 3, name: 'What the Flame Remembers', desc: 'Kindle a weapon (level 6).', type: 'kindle', params: { n: 1 }, scope: 'run', reward: { unlock: 'relic:gamblers_wick', memories: 30 } },
  { id: 'cartographer', tier: 3, name: 'Cartographer of Gills', desc: 'Name 16 species in the Journal.', type: 'journal', params: { n: 16 }, scope: 'total', reward: { unlock: 'boon:gilded_hook', memories: 25 } },
  { id: 'lamplighter', tier: 3, name: "Lamplighter's Vengeance", desc: 'Disperse 2500 gloomlings across all descents.', type: 'slay', params: { n: 2500 }, scope: 'total', reward: { unlock: 'boon:lighthouse_beam', memories: 30 } },
  { id: 'into_the_vault', tier: 3, name: 'Into the Vault', desc: 'Reach the Glasswater Vault.', type: 'reachZone', params: { zone: 'glasswater' }, scope: 'total', reward: { unlock: 'relic:second_wick', memories: 30 } },
  { id: 'pallid_arrival', tier: 3, name: 'Where the Light Was Laid', desc: 'Reach the Pallid Deep.', type: 'reachZone', params: { zone: 'paleabyss' }, scope: 'total', reward: { unlock: 'boon:undying_ember', memories: 40 } },
  { id: 'four_silences', tier: 3, name: 'Four Silences', desc: 'Silence all four Wardens.', type: 'bossDistinct', params: { ids: ['the_wickeater', 'the_veiled_gardener', 'the_shard_abbot', 'the_lightless_ferryman'] }, scope: 'total', reward: { unlock: 'boon:moonless_calm', memories: 60 } },
  { id: 'many_flames', tier: 3, name: 'Many Flames', desc: 'Reach the Glasswater Vault with 3 different Wicks.', type: 'reachZoneCharacters', params: { zone: 'glasswater', n: 3 }, scope: 'total', reward: { unlock: null, memories: 50 } },
  { id: 'light_comes_up', tier: 3, name: 'The Light Comes Up', desc: 'Land the Pale Leviathan.', type: 'victory', params: {}, scope: 'total', reward: { unlock: null, memories: 100 } },
  { id: 'complete_chronicle', tier: 3, name: 'The Complete Chronicle', desc: 'Name every species in the Journal.', type: 'journal', params: { n: 32 }, scope: 'total', reward: { unlock: null, memories: 200 } },
];

// =====================================================================================
// BOUNTIES (DESIGN §15) — Old Murk's ledger templates. reward Shells = round(base ×
// zone.valueMult × (1 + dayGrowth × (day − 1))) (+ perN × n where given). Up to 2 offered
// per visit, 3 active, auto-accepted, due at the end of day + 2; failing costs nothing.
// Each completed bounty adds BALANCE.bounty.memoriesEach Memories at run end.
// =====================================================================================
export const BOUNTIES = [
  { id: 'catch_species', type: 'catchSpecies', text: 'Bring me {n} {species}.', params: { n: [2, 3], rarities: ['common', 'uncommon'] }, base: 18, perN: 8, weight: 3, zoneMin: 0, dayMin: 1 },
  { id: 'catch_uncommon', type: 'catchRarity', text: 'Land {n} uncommon fish.', params: { rarity: 'uncommon', n: 2 }, base: 35, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'catch_rare', type: 'catchRarity', text: 'Land a rare fish.', params: { rarity: 'rare', n: 1 }, base: 45, weight: 2, zoneMin: 0, dayMin: 2 },
  { id: 'heavy', type: 'heavy', text: 'Land a {species} over {kg} kg.', params: { percentile: 0.75 }, base: 40, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'deep_water', type: 'depthCatch', text: 'Land {n} fish from deep water.', params: { n: 2, depthMin: 0.75 }, base: 30, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'perfect_hooks', type: 'perfectHooks', text: 'Set {n} perfect hooks.', params: { n: [3, 5] }, base: 30, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'streak', type: 'streak', text: 'Chain {n} perfect hooks in a row.', params: { n: [3, 4] }, base: 45, weight: 1, zoneMin: 0, dayMin: 2 },
  { id: 'unscathed', type: 'unscathed', text: "Endure tonight's Gloomtide without losing an Ember.", params: {}, base: 50, weight: 2, zoneMin: 0, dayMin: 2 },
  { id: 'disperse', type: 'slayNight', text: 'Disperse {n} gloomlings in one Gloomtide.', params: { nBase: 40, perHeat: 12 }, base: 30, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'no_flare', type: 'noFlare', text: 'Endure the Gloomtide without a single flare.', params: {}, base: 40, weight: 1, zoneMin: 1, dayMin: 1 },
  { id: 'quality', type: 'quality', text: 'Bring me a fine fish, or better.', params: { quality: 'fine' }, base: 35, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'night_fish', type: 'nightFish', text: 'Catch something that only rises in the Gloomtide.', params: {}, base: 40, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'sell_visit', type: 'sellVisit', text: 'Sell me {n} fish in a single visit.', params: { nBase: 3 }, base: 25, weight: 1, zoneMin: 0, dayMin: 2 },
  { id: 'spot_catch', type: 'spotCatch', text: 'Catch {n} fish from shimmering spots.', params: { n: 3 }, base: 30, weight: 2, zoneMin: 0, dayMin: 1 },
  { id: 'break_hand', type: 'slayElite', text: 'Break a hand that rises from the water.', params: { n: 1 }, base: 35, weight: 1, zoneMin: 0, dayMin: 2 },
  { id: 'warden', type: 'boss', text: 'A Warden rises tonight. Silence it.', params: { n: 1 }, base: 60, weight: 4, zoneMin: 0, dayMin: 1, bossNightOnly: true },
  { id: 'legend_hunt', type: 'legend', text: 'They say {legend} stirs. Land it.', params: {}, base: 60, weight: 0, zoneMin: 0, dayMin: 1, special: true, memories: 6 },
];

// =====================================================================================
// QUALITY (DESIGN §5.8) — catch quality from the reel score q. threshold = min q.
// chance = flat luck chance to bump one tier up (+ bait/relic shimmer bonuses).
// =====================================================================================
export const QUALITY = {
  normal:  { id: 'normal',  label: 'Common',     valueMult: 1,   yieldMult: 1,    threshold: 0,    chance: 0,    color: 0xd8d2c0 },
  fine:    { id: 'fine',    label: 'Fine',       valueMult: 1.4, yieldMult: 1.1,  threshold: 0.45, chance: 0.05, color: 0xa6c6e6 },
  perfect: { id: 'perfect', label: 'Shimmering', valueMult: 2.5, yieldMult: 1.25, threshold: 0.78, chance: 0.01, color: 0xffe2a8 },
};

// JOURNAL_PERKS (DESIGN §16) — permanent bonus for naming every species of a zone. Stored
// as meta.unlocks['perk:<zoneId>'] = true and added by getStats().
export const JOURNAL_PERKS = {
  mossmere:   { label: 'Moss-Reader', effects: { hookWindow: 0.08 }, desc: '+8% hook window, forever.' },
  sporewood:  { label: 'Spore-Cook', effects: { foodMult: 0.1, oilYieldMult: 0.1 }, desc: '+10% meal value and render yield, forever.' },
  glasswater: { label: 'Glass-Eye', effects: { rarityBonus: 0.04 }, desc: '+4% rare fish luck, forever.' },
  paleabyss:  { label: 'Bone-Counter', effects: { sellMult: 0.08 }, desc: '+8% sale price, forever.' },
};

export const FISH_SHAPES = ['minnow', 'perch', 'carp', 'pike', 'eel', 'angler', 'ray', 'puffer', 'jelly', 'crayfish', 'koi', 'ghost', 'leviathan'];
export const CREATURE_KINDS = ['wisp', 'mite', 'moth', 'eel', 'hand', 'warden'];
export const RARITY_WEIGHTS = { common: 70, uncommon: 24, rare: 6 };   // fish pool per species; uncommon ×(1+2rb), rare ×(1+4rb)
export const RARITY_COLORS = { common: 0xd8d2c0, uncommon: 0xa6c6e6, rare: 0xb48cff, epic: 0xff8fc0, legendary: 0xe8c66a };
export const DEPTH_BANDS = { shallow: [0, 0.35], mid: [0.35, 0.75], deep: [0.75, 1] };   // reticle label + colour (DESIGN §5.1)

// =====================================================================================
// TIPS (DESIGN §21.5) — first-run hints, each shown once (meta.seenTips), ≤ 90 chars.
// trigger = 'event' or 'event:<disc>' where disc = payload.phase ?? payload.resource ??
// payload.reason ?? payload.state ?? payload.id ?? (payload.enemy?.elite ? 'elite' : undefined).
// =====================================================================================
export const TIPS = [
  { id: 'sail_basics',   trigger: 'run:start',                text: 'Sail with WASD or the left stick. Shimmering water marks a feeding spot.' },
  { id: 'cast_basics',   trigger: 'player:anchor',            text: "Hold on the water to charge a cast. Release near the meter's peak." },
  { id: 'depth_read',    trigger: 'fishing:cast',             text: 'Deeper water holds rarer fish. The reticle shows how deep you are casting.' },
  { id: 'nibble_wait',   trigger: 'fishing:nibble',           text: 'Only a nibble. Wait for the bobber to plunge, then tap.' },
  { id: 'miss_early',    trigger: 'fishing:miss:early',       text: "Too eager. Nibbles are tests. Strike when the bobber sinks and '!' shows." },
  { id: 'miss_late',     trigger: 'fishing:miss:late',        text: 'Too slow. Tap the instant it plunges. A fast hook earns a finer catch.' },
  { id: 'miss_moved',    trigger: 'fishing:miss:moved',       text: 'Moving the raft pulls your line. Stay still while you fish.' },
  { id: 'reel_band',     trigger: 'fishing:hook',             text: 'Hold to reel, release to ease. Keep tension in the pale band; the bright core doubles it.' },
  { id: 'surge_release', trigger: 'fishing:surge',            text: 'It surges! Let go until the fury passes, or your line will snap.' },
  { id: 'escaped_slack', trigger: 'fishing:escaped:slack',    text: 'A slack line lets them slip free. Always keep a little tension.' },
  { id: 'escaped_snap',  trigger: 'fishing:escaped:snap',     text: 'Snapped. Release during surges. Old Murk sells stronger line.' },
  { id: 'catch_choice',  trigger: 'fish:landed',              text: 'Eat it for Satiety, Render it for Oil, or Keep it to sell to Old Murk.' },
  { id: 'merchant',      trigger: 'merchant:arrive',          text: 'A bell across the water. Old Murk has moored. Sail to his green lamp.' },
  { id: 'trade_prompt',  trigger: 'interact:change:merchant', text: 'Press E or tap Trade. Sell your creel, buy gear, take a bounty.' },
  { id: 'dusk_warn',     trigger: 'phase:change:dusk',        text: 'The light is thinning. Murk has gone. Fill your lantern while you can.' },
  { id: 'gloomtide',     trigger: 'phase:change:gloomtide',   text: 'Gloomtide. Your light burns what enters it. More oil, wider light.' },
  { id: 'enemy_zap',     trigger: 'enemy:spawn',              text: 'Tap a gloomling to zap it. Press F or Flare to burst everything near.' },
  { id: 'cinders',       trigger: 'enemy:slain',              text: 'Gloomlings leave cinders. Sail over them to grow your flame.' },
  { id: 'levelup',       trigger: 'levelup',                  text: 'Your flame grows. Choose a boon: it lasts the whole descent.' },
  { id: 'elite',         trigger: 'enemy:spawn:elite',        text: 'Ink spreads under you: a hand is rising. Move, or flare it as it breaches.' },
  { id: 'low_oil',       trigger: 'resource:low:oil',         text: 'Your lantern gutters. Tap Burn (R) to render a fish into oil, now.' },
  { id: 'lantern_out',   trigger: 'lantern:out',              text: 'Your light is out. Render any fish to relight it before the dark bites.' },
  { id: 'low_food',      trigger: 'resource:low:satiety',     text: 'Your wax runs thin with hunger. Eat something from the creel.' },
  { id: 'low_hp',        trigger: 'resource:low:hp',          text: 'Two Embers left. Dawn mends one, a full belly mends another.' },
  { id: 'steal',         trigger: 'enemy:steal',              text: 'Something stole from your creel! Kill it before it flees to get the fish back.' },
  { id: 'dawn',          trigger: 'phase:change:dawn',        text: 'You outlasted the Gloomtide. Each night it returns hungrier.' },
  { id: 'gate_open',     trigger: 'gate:open',                text: 'The Descent Gate churns open. Pay its toll at the whirlpool to go deeper.' },
  { id: 'warden',        trigger: 'boss:spawn',               text: 'A Warden rises. Watch its tells, kite it, and keep your light wide.' },
  { id: 'new_species',   trigger: 'journal:new',              text: 'A new name in the Journal. Some fish answer only to certain baits.' },
  { id: 'zone_unlock',   trigger: 'zone:unlock',              text: 'Deeper waters pay more, and the dark there bites harder.' },
];

// =====================================================================================
// Text banks (DESIGN §19–§21).
// =====================================================================================
export const MERCHANT_LINES = {
  arrive: [
    "Ding-a-ling. Still burning? Good. The dead don't haggle.",
    "Murk's here. Murk's always here, eventually.",
    'Smelled your lantern three bends back. Wasteful, little flame.',
    "Mind the barge. She bites when she's lonely.",
  ],
  browse: [
    "Look all you like. Looking's free. Light isn't.",
    'That one? Fished it off a Wick like you. Near enough like you.',
    "Everything here was somebody's last hope once.",
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
    "Tide's turning. Murk casts off soon.",
    "Last call, little flame. The barge won't wait for the dark.",
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
    "Your light's gone thin as soup. Buy oil, or render something. Quickly.",
    "I've seen that flicker before. Usually right before the quiet.",
    "Gutter like that and the Gloom comes calling. Oil's on the left.",
  ],
  warden: [
    'Heard something big moving under the dark last night. Bigger tonight, I expect.',
    "The Gloom sends its keepers every third night. Don't ask me how I know. I counted.",
  ],
  pity: ["Here. Don't make it a habit. Murk is not a charity. Murk is barely a toad."],
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
  tagline: 'Sail the drowned dark. Fish to keep your light. Burn back the swarm.',
  taglineAlts: [
    'Below the fallen kingdom, the water remembers.',
    'Every flame goes out. Make yours go out deep.',
    'A small light, a long line, a hungry dark.',
  ],
  premise: "Long ago the Lamplit Kingdom hung a great lantern over its lake. When the lantern fell, the kingdom followed it into the water. The Wicks are what is left of its candles: small, stubborn flames on rafts, fishing so they stay lit. Somewhere below, the Pale Leviathan carries the great lantern's last ember in its belly.",
  currency: { shells: 'Shells', memories: 'Memories', embers: 'Embers', cinders: 'Cinders', oil: 'Oil', satiety: 'Satiety' },
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
  bossWithdraw: '{name} sinks back into the dark.',
  formationBanner: '{name}',
  kindleBanner: ['{name}', 'The flame remembers'],
  legendaryHooked: '{name}: {epithet}',
  legendPoolToast: 'A golden stillness gathers far out. Something legendary is listening.',
  victoryHooked: 'The water goes very still.',
  gateOpenToast: 'The Descent Gate churns open.',
  gateSealed: 'The Gate is sealed. {requirement}',
  descendPrompt: 'Feed the whirlpool {toll} Shells and sink to {zone}?',
  deathTitle: { darkness: 'Your Light Went Out', starvation: 'The Wax Ran Thin', gloom: 'Taken by the Gloomtide', default: 'Extinguished' },
  memoriesHeader: 'What the Water Remembers',
  memoryLabels: {
    nights: 'Nights endured', depth: 'Deepest water endured', fish: 'Fish landed', species: 'New names in the Journal',
    legendaries: 'Legends hauled up', trophies: 'Trophies mounted', bounties: 'Bounties honoured', enemies: 'Gloomlings dispersed',
    elites: 'Hands broken', wardens: 'Wardens silenced', victory: 'The light came up', remembrance: 'Remembrance',
  },
  summaryFlavour: [
    { maxDay: 1, text: 'The first night is the hungriest. It usually wins.' },
    { maxDay: 3, text: 'A short flame, but an honest one.' },
    { maxDay: 6, text: "You learned the water's moods. The water learned yours." },
    { maxDay: 10, text: 'Few Wicks see a seventh dawn. Fewer remember it.' },
    { maxDay: 999, text: 'Old Murk will tell this one, badly, for years.' },
  ],
  records: { deepest: 'Deepest descent: {zone}', biggest: 'Biggest catch: {name}, {kg} kg', journal: 'The Journal holds {n} of {total} names.', level: 'Highest flame: level {n}' },
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
  kindlingDraft: 'The Waystone remembers your flame. Choose what it carried.',
  journalTitle: "The Wick's Journal",
  journalUnknown: 'An unfamiliar ripple. Something here has not yet been named.',
  challengesTitle: 'Trials of the Wick',
  challengeTiers: { 1: 'First Flickers', 2: 'The Long Vigil', 3: 'Deeper Water' },
  creelFull: 'Your creel is full. Eat, render, release, or let this one go.',
  newRecord: 'New record!',
  burnFish: 'Burn',
};

// =====================================================================================
// Functions (DESIGN §7.2, §10.1, §17.1).
// =====================================================================================
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const zoneIdx = (z) => Math.max(0, Math.min(ZONES.length - 1, z | 0));

/** Gloomtide length (s) on a given day: 90, 96, 102 … capped at 120. */
export function gloomtideLength(day = 1) {
  return Math.min(BALANCE.gloomMax, BALANCE.phases.gloomtide + BALANCE.gloomGrowth * (Math.max(1, day | 0) - 1));
}

/**
 * Gloom Heat: the single night-scaling axis. H = (day − 1) + 3 × zoneIndex + linger, where
 * linger = lingerHeat × max(0, nightInZone − lingerFrom). nightInZone = Gloomtides since the last
 * zone:change (1-based, tonight included); when omitted it is assumed on-pace (= day in the first
 * lake, 0 deeper), so callers that track it should pass it.
 */
export function heatFor(day = 1, zoneIndex = 0, nightInZone = null) {
  const D = BALANCE.combat.director, z = zoneIdx(zoneIndex), dayN = Math.max(1, day | 0);
  const niz = nightInZone ?? (z === 0 ? dayN : 0);
  return (dayN - 1) + D.heatPerZone * z + D.lingerHeat * Math.max(0, niz - D.lingerFrom);
}

/** Night intensity over gloomtide progress k (build-up, 20 s swell, crescendo, hush). t = seconds in. */
export function nightCurve(k = 0.5, t = null) {
  const N = BALANCE.combat.night;
  k = clamp01(k);
  if (k >= N.quietFrom) return 0;
  if (k < N.buildUntil) return N.buildMult;
  const secs = t ?? k * BALANCE.phases.gloomtide;
  const swell = 1 + N.swellAmp * Math.sin((2 * Math.PI * secs) / N.swellPeriod);
  return (k >= N.crescendoFrom ? N.crescendoMult : 1) * swell;
}

/** g(L): zap & flare damage scale with the Wick's level. */
export function weaponScale(level = 1) {
  return 1 + BALANCE.xp.weaponScale * (Math.max(1, level | 0) - 1);
}

/**
 * Night difficulty for a day, zone and gloomtide progress k (0..1). Contract fields:
 * spawnRate (individuals/s; pack members each cost one credit), maxAlive, hpMult,
 * speedMult, damageMult (on damage dealt TO the Wick), drainMult, kinds [{id, w}],
 * eliteEvery (s, 0 = none), boss (enemy id | null). Extras: elites [{id, w}], heat,
 * xpScale, formationAt, bossAt, eliteFirstAt, gloomtide (s). opts.nightInZone (Gloomtides
 * since the last zone:change, 1-based) picks boss nights; falls back to day.
 */
export function difficultyFor(day = 1, zoneIndex = 0, k = 0.5, opts = {}) {
  const D = BALANCE.combat.director;
  const z = zoneIdx(zoneIndex);
  const dayN = Math.max(1, day | 0);
  const H = heatFor(dayN, z, (opts && opts.nightInZone) || null);
  const L = gloomtideLength(dayN);
  const kk = clamp01(k ?? 0.5);
  const spawnRate = +(D.baseRate * ZONES[z].gloom * (1 + D.ratePerHeat * H) * nightCurve(kk, kk * L)).toFixed(3);
  const maxAlive = Math.min(D.maxAliveCap, D.maxAliveBase + D.maxAlivePerHeat * H);
  const hpMult = +(1 + D.hpLin * H + D.hpQuad * H * H).toFixed(3);
  const speedMult = +Math.min(D.speedCap, 1 + D.speedPerHeat * H).toFixed(3);
  const damageMult = 1 + D.damageStepAdd * Math.floor(H / D.damageStep);
  const drainMult = +(1 + D.drainPerHeat * H).toFixed(3);
  const available = (e) => z > e.zoneMin || (z === e.zoneMin && dayN >= (e.dayMin || 1));
  const kinds = [];
  const elites = [];
  for (const e of ENEMIES) {
    if (e.boss || !available(e)) continue;
    if (e.elite) { const w = e.eliteWeights?.[z] ?? 0; if (w > 0) elites.push({ id: e.id, w }); continue; }
    const w = e.weights?.[z] ?? 0;
    if (w > 0) kinds.push({ id: e.id, w });
  }
  const eliteEvery = dayN < D.eliteFromDay || !elites.length ? 0 : Math.max(D.eliteMin, D.eliteBase - D.elitePerHeat * H);
  const niz = Math.max(1, (opts && opts.nightInZone) || dayN);
  const boss = niz % D.bossEvery === 0 ? (ZONES[z].warden || null) : null;
  return {
    spawnRate, maxAlive, hpMult, speedMult, damageMult, drainMult, kinds, eliteEvery, boss,
    elites, heat: H, xpScale: +(1 + BALANCE.xp.heatScale * H).toFixed(3), bossHpMult: +(1 + D.bossHpLin * H).toFixed(3),
    formationAt: dayN >= D.formationsFromDay ? D.formationAt.slice() : [], bossAt: D.bossAt, eliteFirstAt: D.eliteFirstAt,
    gloomtide: L, day: dayN, zoneIndex: z, k: kk,
  };
}

/** Cinders (XP) needed to go from `level` to `level + 1`. */
export function xpForLevel(level = 1) {
  const c = BALANCE.xp.curve, L = Math.max(1, level | 0) - 1;
  return Math.round(c.base + c.lin * L + c.quad * L * L);
}

/** Cinders granted for landing a fish (before stats.xpMult and character quirks). */
export function fishXpFor(rarity = 'common', zoneIndex = 0) {
  return Math.round((BALANCE.xp.fishXp[rarity] ?? BALANCE.xp.fishXp.common) * (1 + BALANCE.xp.fishXpZone * zoneIdx(zoneIndex)));
}

const countOf = (v) => (Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : Number(v) || 0);

/**
 * Memories earned by a run. Reads {day, zoneIndex, fishCaught, newSpecies, legendaries,
 * bountiesDone, enemiesSlain, victory} plus optional {nightsSurvived, deepestEnduredIndex,
 * bossesSlain, elitesSlain, trophies:[zoneIndex], memMult, firstVictory}. legendaries /
 * bountiesDone may be numbers, arrays or objects. Depth only counts where a full
 * Gloomtide was endured (so a Waystone start followed by a quick death earns nothing there).
 */
export function memoriesFor(summary = {}) {
  const s = summary || {};
  const zi = zoneIdx(s.zoneIndex ?? 0);
  const day = Math.max(1, (s.day ?? 1) | 0);
  const nights = Math.max(0, s.nightsSurvived ?? (day - 1));
  const endured = s.deepestEnduredIndex ?? (nights > 0 ? zi : -1);
  const L = TEXT.memoryLabels;
  const M = BALANCE.memories;
  const rows = [
    { label: L.nights, value: Math.round(nights * (M.nightBase + M.nightPerZone * zi)) },
    { label: L.depth, value: endured >= 0 ? M.depth[Math.min(3, endured)] : 0 },
    { label: L.fish, value: Math.floor((s.fishCaught || 0) / M.fishPer) },
    { label: L.species, value: BALANCE.journal.newSpeciesMemories * (s.newSpecies || 0) },
    { label: L.legendaries, value: M.legend * countOf(s.legendaries) },
    { label: L.bounties, value: BALANCE.bounty.memoriesEach * countOf(s.bountiesDone) },
    { label: L.enemies, value: Math.floor((s.enemiesSlain || 0) / M.slainPer) },
    { label: L.elites, value: M.elite * (s.elitesSlain || 0) },
    { label: L.wardens, value: M.warden * (s.bossesSlain || 0) },
    { label: L.places || 'New places found', value: (M.placeNew || 0) * (s.placesNew || 0) },   // v2 (walking, §24.9): 0 unless WALK_ENABLED
  ];
  if (Array.isArray(s.trophies) && s.trophies.length) {
    rows.push({ label: L.trophies, value: s.trophies.reduce((a, t) => a + (BALANCE.economy.trophyMemories[t | 0] || 0), 0) });
  }
  if (s.victory) rows.push({ label: L.victory, value: s.firstVictory === false ? M.victoryAfter : M.victoryFirst });
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
// v2 (walking) — DESIGN §24 "Exploration on foot" (rev. 2). Everything below is ADDITIVE and
// INERT until WALK_ENABLED is true: with it off, every v1 table, arena field and text above is
// bit-identical to v1 (QA §24.13 #1 holds for all four lakes in an interim build). With it on,
// the v2 tables are merged into the v1 ones (SPECIES, BOONS, ZONES[].arena…) before the lookup
// maps are built. The walk layouts, BALANCE.walk / places / lamps / combat.foot and the pure
// helpers (walkGridFor, shoreRFor…) are always exported so tools can read them.
//
// Turn it on: set `globalThis.GW_WALK = true` before this module evaluates (tools/walk-on.mjs;
// template.html in the walking build), or flip the default below in the commit that lands
// world / player / fishing v2. world and data read only this one flag.
// =====================================================================================
export const WALK_ENABLED = globalThis.GW_WALK === true;

// ---- On-foot controller, crossings, cast-from-height, camera (§24.2–§24.5; player, render, fishing).
BALANCE.walk = {
  speedMult: 0.84,           // foot top speed = stats.moveSpeed × speedMult + stats.stride  (5.0 m/s base)
  accel: 6, decel: 8,         // 1/s lerp toward target / toward 0: 0→90% in 0.38 s; stops in ≈ 0.6 m (raft: 0.77 s / ≈ 4 m)
  turnRate: 12, faceMinSpeed: 0.15,
  radius: 0.4,                // foot body radius; every reachability check runs on the grid eroded by this body
  // Heights: walkGridFor quantises every surface to heightQuant (0.1 m); every height threshold below
  // sits on a half-step (…x5), so no rule ever compares within eps of a threshold (walkHeightLE / walkStepOK).
  heightQuant: 0.1, eps: 0.02,
  stepUp: 0.45, stepDown: 0.45, maxSlope: 0.5,   // symmetric: only authored drops are one-way; ramps ≤ 0.5 rise/run
  uphillSlow: 0.2,            // speed × (1 − uphillSlow × slope / maxSlope)
  push: { time: 0.4, cone: 35 },   // push-to-cross: 0.4 s of stick within 35° of the edge normal (rings, tips, drops)
  crossCooldown: 3,           // s between mode switches (Ashore / Board)
  nightPillOnly: true,        // at dusk and in the Gloomtide, drops and Ashore / Board work only through the pill or E
  drop: { max: 3.55, time: 0.35, perM: 0.08, iframes: 0.2 },   // one-way hop-downs (arena.drops), calm / dawn i-frames only
  moor: { range: 3.0, maxSpeed: 2.0, time: 0.6 },   // raft within range of a mooring slot and slower than maxSpeed
  board: { range: 3.0, time: 0.5 },                 // validated: |stand − slot| − raftRadius ≤ range
  hopIframes: 0.3, hopIframesNight: 0,              // i-frames while crossing; none at dusk / in the Gloomtide
  towBell: { speed: 6, etaMin: 3, etaMax: 12 },
  castStopSpeed: 1.0,         // the cast meter starts once foot speed < this (no anchor brake on foot)
  highCast: { from: 1.0, perM: 0.5, cap: 4 },       // castMax + min(cap, perM × (standY − from)) when standY > from
  steepLine: { from: 4.95, sweetAdd: -0.03, surgeWarnAdd: -0.1 },   // standing ≥ 5 m above the bobber: the line runs steep
  poolCast: 'firstRun',       // the meter maps onto the first contiguous water run along the aim ray when it is shorter than reach
  rodTip: 1.9,                // rod-tip height above the ground for the arc test (fishing, validator)
  aimAssist: { within: 2.0, pull: 1.0, lock: 1.6, lockKinds: ['hole'], off: ['reflection', 'drifters', 'moving'] },
  interactRange: 2.4,         // lamps, deeds, bells, Ashore / Board pills
  holdTime: { lamp: 1.0, deed: 0.6, fishHere: 0 },  // hold-to-act (player.interactHold)
  tradeRange: 5,              // = BALANCE.move.interactRange (Murk's barge, from foot or raft)
  gateFootRange: 2.5,         // foot gate: Descend within gate.r + this of the gate centre
  stepEvery: 0.34,            // s between player:step events at top speed
  lanternHeight: 1.55,        // lantern hook height above the ground on the Lantern Crook
  fallIntoWater: false,       // never: knockback slides along edges (the Wick is a candle)
  ring: { radius: 1.0, notch: true, rim: 0.06 },    // the Wick's ground ring on foot (heading notch) + thin amber rim
  vigil: { maxSeconds: 14, loopMin: 40, discMin: 8, discFill: 0.9 },   // open ground near every non-dead-end stand (validated)
  camera: {
    walk: { elev: 40, dist: 12.5, aim: 3.0, aimY: 0.9, fov: 50, ahead: 0.35, stiff: 4.4 },
    walkNight: { elev: 56, dist: 16.5, aim: 1.5, aimY: 0.4, fov: 52, ahead: 0.25, stiff: 4.6 },
    portrait: { walk: { elev: 44, dist: 12, fov: 60 }, walkNight: { elev: 58, dist: 15.5, fov: 62 } },   // replaces render's portrait widening on foot
    high: { from: 3, to: 5, dist: 1.5, elev: 3 },   // blend k = clamp((groundY − from)/(to − from)): dist + k·1.5, elev + k·3
    focusRate: 5, focusDeadband: 0.25,              // focus y follows ground y (spring), ignoring steps < deadband
    yawFixed: true,                                 // never turns on foot (shop and death too): controls stay screen-relative
    // fish / reel framing on walking lakes: elev = clamp(max(base, max_i atan((top_i + pad)/d_i) + add), base, cap), sampled
    // along +z (toward the camera) from the bobber every `step` m out to `reach`; when it lifts above base the focus moves to the bobber
    pool: { pad: 0.3, add: 8, cap: 75, step: 0.5, reach: 12 },
    clamp: { samples: 12, pad: 0.6, shoreIn: 2 },   // terrain clamp: raise elev / shorten dist so the camera stays above land and inside R − 2
  },
  occlusion: { nearR: 0.8, farR: 2.6, floorPad: 0.35, xray: 'proxy', lowSouthDist: 14, lowSouthMax: 3.5, lowSouthHalfW: 4 },
};

// ---- Places: the unique fishing locations (§24.7; fishing, progression, ui).
BALANCE.places = {
  base: { waitMult: 0.75, rarity: 0.10, quality: 0.06 },     // bobber inside any place's water
  astir: { waitMult: 0.55, rarity: 0.25, quality: 0.15 },    // today's Astir place (replaces base)
  astirPerDay: 1, astirFromZone: 1,                          // one per walking lake per day, seeded, never the legend place
  stackWithSpot: 'max',                                      // place vs feeding spot: per field, the stronger applies
  exclusiveWeight: 8,                                        // place-kept species: rare weight × this (only when awake)
  awake: { sporewood: 1, glasswater: 2, paleabyss: 1 },      // place-kept species awake per descent (seeded); 4 of 8
  twistB: 0.5,                                               // chance per descent that a non-legend place runs its `alt` twist
  discoverRadius: 8,                                         // discovery: Wick within 8 m of the stand or of the water shape, or a cast into it
  markerRange: 45, fishHereRange: 2.0,
  mastery: { catches: 4, minQuality: 'fine', memories: 10 }, // 4 catches in one descent incl. ≥ 1 fine → +10 Memories, Known Place
  depthOverride: true,                                       // world.getDepth inside place water stays within place.water.depth
  minVisible: 0.6,                                           // validated: ≥ 60% of castable place water visible to the fish camera
  upScreenDeg: 50, nearTarget: 6,                            // validated: water target within ±50° of up-screen or within 6 m
};

// ---- Sister-candles (internal id: lamps): fallen candles you relight with your own flame (§24.8–§24.9).
BALANCE.lamps = {
  shareTime: 1.0, lightCost: 12, costZoneScaled: true,       // "Share flame": oil = lightCost × zone.drain.oil (14.4 / 16.8 / 19.8)
  range: 2.4, radius: 6,                                     // share within range; cold light pool radius (m)
  slow: 0.7,                                                 // enemies inside a lit pool move × this (min with the lantern's 0.75)
  darknessShelter: 0.5,                                      // darkness ticks at × 0.5 inside a lit pool (interval × 2); never stops
  revealChoir: true,
  snuffSlamRadius: 4, snuffMoths: 3, snuffTime: 6,           // a slam within 4 m, or 3 latched moths for 6 s, snuffs it
  relightCost: 6,                                            // × zone.drain.oil, any phase (Kindred Flames never discounts relights)
  revealPlaces: 2,                                           // sharing marks the 2 nearest undiscovered places
  knownPlace: 'freeShare',                                   // a mastered place starts discovered and its candle's FIRST share is free (still walked to and held)
  hop: { phases: ['dawn'], perDay: 1, oil: 0, time: 2.0, angleTrue: true },   // "Flame-leap": once per dawn, free; the radial shows candles in their true map directions
  legendSnuffRadius: 30,                                     // a gloom legendary's first surge breathes in every candle within 30 m of its pool
  stake: { radius: 5, until: 'dawn', shelter: false, slow: true, revealChoir: true },   // Stake Lantern: slow + choir only, not a leap node
  maxPathToLamp: 68,                                         // map rule (validated): every reachable foot cell ≤ 68 m path from a candle
  minFromStand: 3, minFromDock: 2.5, postR: 0.35,            // validated pill separation; posts are walk blocks
  light: { colour: 'accent', flicker: false, decal: true },  // cold, steady, in the lake's accent colour; only the Wick's light is amber
};

// ---- The swarm on foot (§24.8; combat). Rates, hp, Heat and kinds are unchanged; killers keep raft values.
BALANCE.combat.foot = {
  contactRadius: 1.6, contactDy: 1.6,                        // vs 1.8 on the raft
  crawl: { climb: 1.25, drop: 3.55, haul: 0.8, haulAuraTaken: 1.5, landSpeed: 0.9 },
  spawn: { flyer: [22, 34], crawl: [16, 28], crawlPathMax: 40, flyerOverWater: 0.7, emerge: 0.9, emergeWithin: 18, fallbackMinDist: 16,
    unreachable: 'flyer', lakeOnly: true, raftWaterPathMax: 40 },   // crawlers never spawn in pools; raft nights in mixed / foot lakes: raft's water component only
  flow: { cell: 0.5, pathMax: 45, every: 0.35, frames: 3, cellsPerFrame: 9000, directWithin: 5, layers: ['water', 'land'],
    cost: { step: 2, diag: 3, haul: 6, land: 2 } },          // integer costs, bucket queue (Dijkstra) on the 0.5 m walk grid
  leashPath: 45,
  eel: { reach: 6, maxHeight: 3.05, poolMinR: 6, flop: 1.2, flopZapMult: 2 },
  calmRaid: { edgeOnly: true, reach: 6 },                    // the day's eel raid only leaps at a Wick within 6 m of open water
  inkwell: { hold: [13, 18], perchWalkWithin: 'zapRange-2' },   // raft hold distance; every perch has a walkway within zap range − 2 m
  hand: { stainRadius: 3.2 },                                // raft value
  warden: { telegraphAdd: 0, abbotAlignGap: true, sweepAlign: true, gardenerChargeAcross: true, eclipseSnuffRadius: 20 },
  highGround: { minHeight: 1.95, zapRangeAdd: 3 },
  pickupAdd: 0.5, cinderDrift: 2.0, cinderSameArea: 12, fishDrift: 1.0, settleInland: 0.5,
  shadowWithin: 10,                                          // contact shadows under every enemy within 10 m
  boonWeightRaftLake: 0,                                     // foot-tagged boons are never offered in raft-only lakes
};

// ---- Movement class per enemy on walking lakes (combat v2; v1 never reads it). Wardens fly; the Drowned Hand rises in place.
export const ENEMY_MOVE = {
  gloomling: 'fly', inkmite: 'crawl', duskmantle: 'fly', creelsnatch: 'swim', sporeling: 'fly', weeping_inkwell: 'fly',
  belljar_tick: 'crawl', silent_choir: 'fly', drowned_hand: 'static',
  the_wickeater: 'fly', the_veiled_gardener: 'fly', the_shard_abbot: 'fly', the_lightless_ferryman: 'fly',
};

// ---- Walk-grid constants and the shared height compare (world, player, combat flow, validator, tools).
export const WALK_FLAGS = { GROUND: 1, WATER: 2, POOL: 4, BLOCK: 8, RAFTPASS: 16, VOID: 32, BRIDGE: 64, SILL: 128 };
export const WALK_SHORE = { pad: 0.5, cliffGap: 1.5, cliffNoise: [0, 1.5], leanAbove: 9 };   // walking lakes: exact circle
/** The one height comparison every walk rule uses: a ≤ b within eps (heights are Float32 and quantised). */
export function walkHeightLE(a, b) { return a <= b + BALANCE.walk.eps; }
/** May a mover step from height a to height b? Symmetric (stepUp = stepDown); drops are separate. */
export function walkStepOK(a, b) { return walkHeightLE(Math.abs(b - a), BALANCE.walk.stepUp); }
/** Collision radius of a lake obstacle, shared by walkGridFor and world collision (v1: islands r·1.08 + 0.2). */
export function obstacleRadius(o, island = false) { return island ? o.r * 1.08 + 0.2 : o.r; }
/** Pure cavern edge. Walking lakes use the exact circle R; raft lakes return null (world keeps its v1 noisy shoreline). */
export function shoreRFor(zone) {
  const z = typeof zone === 'string' ? ZONES.find((q) => q.id === zone) : zone;
  if (!z || !ARENA_V2[z.id]) return null;
  const R = z.arena.radius;
  return () => R;
}

// ---- Zone modes, phase overrides, Arrival Hush.
export const ZONE_V2 = {
  mossmere: { mode: 'raft' },
  sporewood: { mode: 'mixed' },
  glasswater: { mode: 'foot' },
  paleabyss: { mode: 'foot' },
  // no calm overrides: the dawn Flame-leap and the places' bonuses pay for the walking (tools/balance-foot.mjs);
  // `phases: {calm}` stays supported as the first knob (120–140) if playtests find the days rushed.
};
const ARRIVAL_HUSH = { sporewood: 10, glasswater: 30, paleabyss: 30 };   // + s on the first calm in a newly entered lake, no calm raid that day

// ---- Walk layouts. Shapes (painter's order) → walkGridFor(). Angles in degrees: x = cx + r·cos a,
// z = cz + r·sin a (a = 90 is south / toward the camera, 270 is north). y = walk-surface height (m).
// Headings (`yawDeg`) use the player convention: 0 faces −Z (north), +90 faces −X (west).
// hole.lip = {a0, a1, w, y}: the south rim band (default 30°–150°, width w outside the hole) is a low
// sill at y ≤ 1 so the fixed camera sees into the water (validated: ≥ 60% of castable water visible).
const wp = (x, z) => ({ x, z });
const wr = (v) => Math.round(v * 100) / 100;
const wpolar = (cx, cz, r, a) => wp(wr(cx + r * Math.cos(a * Math.PI / 180)), wr(cz + r * Math.sin(a * Math.PI / 180)));
const wradial = (id, a, r0, r1, y0, y1, w, extra = {}) => {
  const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
  return { id, kind: 'path', pts: [[wr(c * r0), wr(s * r0), y0], [wr(c * r1), wr(s * r1), y1]], w, ...extra };
};
const LIP = (w, y = 0.8, a0 = 30, a1 = 150) => ({ a0, a1, w, y });

export const ARENA_V2 = {
  // ================================================================== Sporewood Pools — raft + walking
  sporewood: {
    // v1 arena fields replaced by the walk map (applied only with WALK_ENABLED)
    reef: { x: 0, zFrom: -30, zTo: 38, width: 6, depth: 0.15 },
    deepPools: [{ name: 'The Lullaby', x: -28, z: -1, r: 11, depth: 0.85 }, { name: 'Murmur Basin', x: 26, z: 4, r: 11, depth: 0.8 }],
    legendPool: { x: 32, z: -30, r: 3.2, name: "The Mother's Cup" },
    islands: [
      { name: 'Cap Reef I', x: 0, z: 32, r: 4.5, kind: 'cap' }, { name: 'Cap Reef II', x: 0, z: 10, r: 5, kind: 'cap' },
      { name: 'Cap Reef III', x: 0, z: -14, r: 5, kind: 'cap' }, { name: 'Cap Reef IV', x: 0, z: -34, r: 4, kind: 'cap' },
      { name: 'East Lily Cap', x: 46, z: -2, r: 4, kind: 'lily' }, { name: 'South Lily Cap', x: -16, z: 42, r: 3.5, kind: 'lily' },
    ],
    pillars: [   // the Lanternstalks stand on the two southern groves, clear of every stand's camera line
      { x: -40, z: 18, r: 1.4, kind: 'stalk' }, { x: -55, z: 22, r: 1.6, kind: 'stalk' }, { x: -33, z: 44, r: 2.0, kind: 'stalk' }, { x: -53, z: 28, r: 1.4, kind: 'stalk' },
      { x: 30, z: 20, r: 1.4, kind: 'stalk' }, { x: 54, z: 24, r: 2.0, kind: 'stalk' }, { x: 33, z: 44, r: 1.2, kind: 'stalk' }, { x: 46, z: 20, r: 1.6, kind: 'stalk' },
    ],
    gate: { name: 'The Mycelium Veil', x: 0, z: -53, r: 4.5 },
    spawn: { x: 0, z: 52, yaw: 0 },
    docks: [{ x: 20, z: 37.5 }, { x: -23, z: 31.5 }, { x: -16.7, z: -13.1 }, { x: 16.9, z: -12 }, { x: 26, z: 4 }],
    // walk map
    spawnMode: 'raft', gateAccess: 'raft',
    raft: { mode: 'free' },
    walk: {
      cell: 0.5,
      shapes: [
        { id: 'mc_isle', name: 'The Rootstool', kind: 'poly', y: 0.8, tag: 'ground', pts: [[12, -20], [24, -13], [40, -12], [54, -20], [62, -32], [50, -42], [36, -42], [28, -40], [18, -34], [13, -28]] },
        { id: 'mc_nave', name: 'The Root Cloister', kind: 'disc', x: 32, z: -30, r: 9.5, y: 2.4, tag: 'ground' },
        { id: 'mc_stair', name: 'Gill Climb', kind: 'path', pts: [[19.5, -24, 0.8], [24.2, -28, 2.4]], w: 3, tag: 'ramp' },   // arrives west of the lagoon's south lip
        { id: 'mc_ridge', name: 'Root Ridge', kind: 'path', pts: [[31, -38.5, 2.4], [21, -44, 6.0]], w: 3, tag: 'ramp' },
        { id: 'mc_anchor', name: 'Veil Anchor (east)', kind: 'disc', x: 17.5, z: -44, r: 3, y: 6.0, tag: 'ground' },
        { id: 'mc_jetty', name: 'Rootfoot Jetty', kind: 'path', pts: [[17, -18.5, 0.8], [10.5, -10.5, 0.8]], w: 2.6, tag: 'jetty' },
        { id: 'gb_isle', name: 'The Gillback', kind: 'poly', y: 0.8, tag: 'ground', pts: [[-12, -20], [-26, -13], [-44, -14], [-56, -24], [-62, -34], [-56, -44], [-44, -52], [-30, -48], [-18, -38], [-13, -28]] },
        { id: 'gb_crown', name: 'Gill Crown', kind: 'disc', x: -36, z: -36, r: 9, y: 4.2, tag: 'ground' },
        { id: 'gb_rampA', kind: 'path', pts: [[-27, -19.5, 0.8], [-31.5, -29, 4.2]], w: 3, tag: 'ramp' },
        { id: 'gb_rampB', kind: 'path', pts: [[-48.5, -21.5, 0.8], [-42, -30, 4.2]], w: 3, tag: 'ramp' },
        { id: 'gb_shrine', name: 'Veil Ledge', kind: 'disc', x: -41, z: -45.5, r: 5.5, y: 4.2, tag: 'ground' },
        { id: 'gb_ridge', name: 'Gill Ridge', kind: 'path', pts: [[-30, -42, 4.2], [-21, -44, 6.0]], w: 3, tag: 'ramp' },
        { id: 'gb_anchor', name: 'Veil Anchor (west)', kind: 'disc', x: -17.5, z: -44, r: 3, y: 6.0, tag: 'ground' },
        { id: 'gb_jetty', name: 'Gill Jetty', kind: 'path', pts: [[-16.5, -19.5, 0.8], [-10.5, -11.5, 0.8]], w: 2.6, tag: 'jetty' },
        { id: 'hy_west', kind: 'path', pts: [[-15, -44, 6], [-3.5, -44, 6]], w: 2.6, tag: 'bridge', raftPass: true },
        { id: 'hy_east', kind: 'path', pts: [[3.5, -44, 6], [15, -44, 6]], w: 2.6, tag: 'bridge', raftPass: true },
        { id: 'hy_mid', name: 'The Hyphae Strand', kind: 'path', pts: [[-3.5, -44, 6], [3.5, -44, 6]], w: 2.6, tag: 'bridge', raftPass: true, needs: 'hyphae_strand' },
        { id: 'lg_isle', name: 'Lanternstalk Grove', kind: 'poly', y: 0.8, tag: 'ground', pts: [[-26, 14], [-40, 11], [-56, 16], [-68, 30], [-50, 58], [-34, 46], [-27, 32]] },
        { id: 'lg_house', name: 'The Drowned Greenhouse', kind: 'rect', x: -44, z: 31, w: 13, d: 13, y: 1.0, tag: 'ground' },
        { id: 'lg_jetty', name: 'Stalk Jetty', kind: 'path', pts: [[-28, 25, 0.8], [-18.5, 24.5, 0.8]], w: 2.6, tag: 'jetty' },
        { id: 'bc_isle', name: 'Bellcap Copse', kind: 'poly', y: 0.8, tag: 'ground', pts: [[24, 18], [38, 14], [54, 18], [68, 30], [46, 58], [30, 46], [24, 32]] },
        { id: 'bc_harp', name: 'Harp Green', kind: 'disc', x: 43, z: 32, r: 9, y: 1.0, tag: 'ground' },
        { id: 'bc_jetty', name: 'Copse Jetty', kind: 'path', pts: [[25, 30.5, 0.8], [16.5, 31, 0.8]], w: 2.6, tag: 'jetty' },
      ],
      holes: [
        { id: 'cup_lagoon', kind: 'disc', x: 32, z: -30, r: 5, depth: 0.95, lip: LIP(2) },
        { id: 'veil_pool', kind: 'disc', x: -40, z: -45, r: 2.4, depth: 0.8, lip: LIP(2) },
        { id: 'gh_row1', kind: 'rect', x: -48.5, z: 30, w: 2, d: 9, depth: 0.45 },
        { id: 'gh_row2', kind: 'rect', x: -45.5, z: 30, w: 2, d: 9, depth: 0.45 },
        { id: 'gh_row3', kind: 'rect', x: -42.5, z: 30, w: 2, d: 9, depth: 0.45 },
        { id: 'gh_row4', kind: 'rect', x: -39.5, z: 30, w: 2, d: 9, depth: 0.45 },
        { id: 'harp_pool', kind: 'disc', x: 43, z: 32, r: 5.2, depth: 0.75 },
      ],
      blocks: [   // glass frames between the greenhouse rows
        { kind: 'rect', x: -47, z: 30, w: 1, d: 9, h: 2.4 }, { kind: 'rect', x: -44, z: 30, w: 1, d: 9, h: 2.4 }, { kind: 'rect', x: -41, z: 30, w: 1, d: 9, h: 2.4 },
      ],
      variants: [],
    },
    moorings: [
      { id: 'rootfoot', name: 'Rootfoot Jetty', stand: wp(10.9, -11.0), slot: wp(8.7, -8.0), yawDeg: 144, bell: true },
      { id: 'gill', name: 'Gill Jetty', stand: wp(-10.9, -12.0), slot: wp(-8.7, -9.0), yawDeg: -144, bell: true },
      { id: 'stalk', name: 'Stalk Jetty', stand: wp(-18.9, 24.5), slot: wp(-14.6, 24.4), yawDeg: -91, bell: true },
      { id: 'copse', name: 'Copse Jetty', stand: wp(17.2, 31.0), slot: wp(13.0, 31.1), yawDeg: 89, bell: true },
    ],
    lamps: [
      { id: 'cup_lamp', x: 25.0, z: -31.5, place: 'mothers_cup' },
      { id: 'crown_lamp', name: 'Gill Crown', x: -36, z: -36, place: 'veilwater' },
      { id: 'house_lamp', x: -40.5, z: 36.5, place: 'drowned_greenhouse' },
      { id: 'harp_lamp', x: 39.5, z: 39.2, place: 'gill_harp' },
      { id: 'anchor_lamp', name: 'Veil Anchor', x: 16.0, z: -42.0 },
    ],
    deeds: [
      { id: 'strand_counterweight', name: 'Swollen Counterweight', kind: 'winch', trigger: 'pill', at: wp(19.6, -45.4), opens: 'hyphae_strand', resets: 'run' },
      { id: 'sporelights', name: 'The Spent Sporelights', kind: 'light', trigger: 'pill', points: [wp(46, -22), wp(-38, 47), wp(56, 27)], resets: 'run', place: 'veilwater' },
      { id: 'harp_curtains', name: 'Gill Curtains', kind: 'sequence', trigger: 'touch', touchR: 1.2, points: [wpolar(43, 32, 7.2, 30), wpolar(43, 32, 7.2, 150), wpolar(43, 32, 7.2, 270)], resets: 'day', place: 'gill_harp' },
    ],
    shortcuts: [{ id: 'hyphae_strand', name: 'The Hyphae Strand', deed: 'strand_counterweight' }],
    drops: [{ id: 'crown_drop', name: 'Crown Lip', from: wp(-27.9, -33.5), to: wp(-25, -32.5) }],
    vigils: [
      { id: 'gill_crown', name: 'Gill Crown', kind: 'disc', x: -36, z: -36, r: 8 },
      { id: 'harp_round', name: 'Harp Green', kind: 'loop', pts: [0, 45, 90, 135, 180, 225, 270, 315].map((a) => [wpolar(43, 32, 7.1, a).x, wpolar(43, 32, 7.1, a).z]) },
    ],
    wayside: { kind: 'puffball', name: 'puffballs', perDay: 4, along: 'walk', touchR: 1.0, give: { satiety: 2 }, persist: 'day' },
    places: [
      { id: 'mothers_cup', name: "The Mother's Cup", access: 'foot', legend: true, lamp: 'cup_lamp', stand: wp(32, -21.8),
        water: { kind: 'disc', x: 32, z: -30, r: 5, depth: [0.9, 0.95] },
        attract: { velvet_ray: 2, plumgill_perch: 1.5 },
        rule: { type: 'rhythm', name: 'Root Breath', period: 16, warn: 1.5, live: 6, mods: { waitMult: 0.6 } },
        lore: 'The Mother Cap drinks here, ten breaths at a time.',
        look: 'An enclosed lagoon inside a cloister of root arches, its south rim broken into low water-steps. On each exhale the arches loosen and amber spores rain onto the water.' },
      { id: 'lullaby', name: 'The Lullaby', access: 'both', stand: wp(-32, 13.5), raftStand: wp(-28, 8),
        water: { kind: 'disc', x: -28, z: -1, r: 8, depth: [0.6, 0.85] },
        attract: { sleepspore_jelly: 3, velvet_ray: 1.5 },
        mods: { surgeEveryMult: 1.3, erraticMult: 0.6, hookWindowMult: 0.85 },
        rule: null, alt: { mods: { surgeEveryMult: 1.5, erraticMult: 0.5, hookWindowMult: 0.75 } },
        lore: 'Fish sleep here with their mouths open.',
        look: 'The open West Basin; a slow hum and drifting sleep-spores over violet water. Fished from the raft or from the north beach of Lanternstalk Grove, casting north.' },
      { id: 'puffball_vent', name: 'The Puffball Vent', access: 'raft', stand: null, raftStand: wp(0, -21.8),
        water: { kind: 'disc', x: 0, z: -25, r: 5, depth: [0.45, 0.55] },
        attract: { sporebelly_puffer: 3, capshell_crayfish: 1.5 },
        rule: { type: 'rhythm', name: 'Vent Burst', period: 20, warn: 2, live: 6, burst: true, mods: { rarity: 0.25, waitMult: 0.7 } },
        alt: { period: 14, warn: 1.5 },
        lore: 'Every twenty breaths the reef sneezes.',
        look: 'A ring of pink puffball pods on the reef mat. A hiss, a six-metre spore geyser, then settling water full of stunned fish.' },
      { id: 'drowned_greenhouse', name: 'The Drowned Greenhouse', access: 'foot', lamp: 'house_lamp', stand: wp(-44, 36.5),
        water: { kind: 'rect', x: -44, z: 30, w: 11, d: 9, depth: [0.4, 0.5] },
        attract: { capshell_crayfish: 2, plumgill_perch: 2, sporebelly_puffer: 1.5 },
        rule: { type: 'targets', name: 'The Lit Row', lock: 1.6, lockPicks: 'bed',
          targets: [
            { id: 'row1', kind: 'rect', x: -48.5, z: 30, w: 2, d: 9 }, { id: 'row2', kind: 'rect', x: -45.5, z: 30, w: 2, d: 9 },
            { id: 'row3', kind: 'rect', x: -42.5, z: 30, w: 2, d: 9 }, { id: 'row4', kind: 'rect', x: -39.5, z: 30, w: 2, d: 9 } ],
          lit: { every: 15, patchDrift: 0.6, chargeTol: 0.08, mods: { waitMult: 0.5, quality: 0.12 } } },
        alt: { lit: { every: 9 } },
        lore: 'Rows of glass, rows of water, and one row that still remembers the sun.',
        look: 'A roofless greenhouse of cracked panes. Four flooded beds run up-screen; one glows pink and a patch of old sunlight drifts along it. The meter shows a tick where the patch lies.' },
      { id: 'gill_harp', name: 'The Gill Harp', access: 'foot', lamp: 'harp_lamp', stand: wp(43, 39.2),
        water: { kind: 'disc', x: 43, z: 32, r: 5.2, depth: [0.7, 0.8] },
        attract: { velvet_ray: 2.5, threadling_eel: 2 },
        rule: { type: 'sequence', name: 'Serenade', deed: 'harp_curtains', window: 15, buff: 45, failDim: 5, mods: { waitMult: 0.5, nibbleTells: 1 } },
        alt: { window: 10, buff: 60 },
        lore: 'Walk the strings in the order she hums them.',
        look: 'A pool under the Bellcap, a 14 m pink-gilled cap. Three luminous gill-curtains hang around the green (east, west and north of the pool) and pulse in a new order each day.' },
      { id: 'veilwater', name: 'The Veilwater', access: 'foot', lamp: 'crown_lamp', stand: wp(-36.3, -45.2),
        water: { kind: 'disc', x: -40, z: -45, r: 2.4, depth: [0.75, 0.85] },
        attract: { mildew_angler: 2, sleepspore_jelly: 1.5 },
        rule: { type: 'deed', name: 'Burn the Veil', deed: 'sporelights', mode: 'permanent', gloomInCalm: true, mods: { rarity: 0.25, quality: 0.15 } },
        alt: { startStep: 1 },
        lore: 'A pool that kept its own night.',
        look: 'A veiled pool on a high ledge against the north wall; its south rim has fallen into low steps. Each sporelight relit on another island adds a strand of light to the veil; with all three it burns away.' },
    ],
  },

  // ================================================================== Glasswater Vault — mostly on foot
  glasswater: {
    plateau: { r: 20, depth: 0.45 },                 // the old plateau is the Orrery Floor (land); this is the moat shelf
    pillars: [   // reliquaries BETWEEN the Votive Font footbridges; bookcases on the Reading Terraces
      ...[0, 60, 120, 180, 240, 300].map((a) => ({ ...wpolar(0, 0, 10, a), r: 1.2, kind: 'reliquary' })),
      { x: 56, z: 0, r: 1.8, kind: 'shelf' }, { x: 51.96, z: 30, r: 1.8, kind: 'shelf' }, { x: -51.96, z: 30, r: 1.8, kind: 'shelf' },
      { x: -51.96, z: -30, r: 1.8, kind: 'shelf' }, { x: 0, z: -63.5, r: 1.8, kind: 'shelf' }, { x: 51.96, z: -30, r: 1.8, kind: 'shelf' },
    ],
    spawn: { x: 0, z: 51, yaw: 0 },
    docks: [{ x: 15, z: 43.5 }, { x: 44.5, z: 8 }, { x: 8, z: -44.5 }, { x: -44.5, z: 8 }, { x: -33.5, z: 32 }],
    spawnMode: 'foot', gateAccess: 'foot',
    raft: { mode: 'skiff', start: 'harbour' },     // the skiff is fenced into the east / south moat by the low spokes
    walk: {
      cell: 0.5,
      shapes: [
        { id: 'gw_terrace', name: 'Reading Terraces', kind: 'ring', x: 0, z: 0, r0: 54, r1: 66, a0: 105, a1: 435, y: 4.0, tag: 'ground' },
        { id: 'gw_gallery', name: 'Lower Gallery', kind: 'ring', x: 0, z: 0, r0: 48, r1: 54, y: 1.2, tag: 'ground' },
        ...[20, 60, 120, 160, 230, 270, 300, 340].map((a) => wradial(`gw_ramp${a}`, a, 49.5, 57.5, 1.2, 4.0, 3, { tag: 'ramp' })),
        { id: 'gw_bellchapel', name: 'Chapel of the Struck Hour', kind: 'disc', x: 60, z: 6, r: 4.2, y: 7.0, tag: 'ground' },
        { id: 'gw_bellramp', kind: 'path', pts: [[59.5, 18.5, 4.0], [60, 9.5, 7.0]], w: 3, tag: 'ramp' },   // ramps are painted after the platforms they climb onto
        { id: 'gw_ledgerlip', name: 'Ledger Stair', kind: 'disc', x: -41, z: 41, r: 5.5, y: 7.0, tag: 'ground' },
        { id: 'gw_ledgerramp', kind: 'path', pts: [[-48, 34, 4.0], [-43.6, 38.6, 7.0]], w: 3, tag: 'ramp' },   // ends 1.96 m inside the disc
        { id: 'gw_orrery', name: 'Orrery Floor', kind: 'disc', x: 0, z: 0, r: 20, y: 1.5, tag: 'ground' },
        // spokes: low bridges over the moat (they fence the skiff)
        wradial('sp90a', 90, 19.5, 23, 1.5, 1.45, 3.5, { tag: 'bridge' }),
        wradial('sp90m', 90, 23, 31, 1.45, 1.38, 3.5, { tag: 'bridge', name: 'The Sundered Span', needs: 'sundered_span' }),
        wradial('sp90b', 90, 31, 48.5, 1.38, 1.2, 3.5, { tag: 'bridge' }),
        wradial('sp30a', 30, 19.5, 26, 1.5, 1.43, 3.5, { tag: 'bridge' }),
        wradial('sp30b', 30, 40, 48.5, 1.29, 1.2, 3.5, { tag: 'bridge', name: 'The Broken Hymnal' }),
        wradial('sp330', 330, 19.5, 48.5, 1.5, 1.2, 3.5, { tag: 'bridge', name: "Copyists' Bridge" }),
        wradial('sp270a', 270, 19.5, 31.6, 1.5, 1.38, 3.5, { tag: 'bridge', name: 'Chandelier Causeway' }),
        wradial('sp270b', 270, 42.4, 48.5, 1.27, 1.2, 3.5, { tag: 'bridge' }),
        { id: 'crown_ring', name: 'The Coronet', kind: 'ring', x: 0, z: -37, r0: 3.6, r1: 6.0, y: 1.2, tag: 'bridge' },
        wradial('sp210a', 210, 19.5, 28, 1.5, 1.41, 3.5, { tag: 'bridge' }),
        wradial('sp210m', 210, 28, 40, 1.41, 1.29, 3.5, { tag: 'bridge', name: 'The Tuned Bridge', needs: 'tuned_bridge' }),
        wradial('sp210b', 210, 40, 48.5, 1.29, 1.2, 3.5, { tag: 'bridge' }),
        wradial('sp150', 150, 19.5, 48.5, 1.5, 1.2, 3.5, { tag: 'bridge', name: "Mapmakers' Bridge" }),
        ...[30, 90, 150, 210, 270, 330].map((a) => wradial(`font${a}`, a, 11.4, 15.8, 1.5, 1.5, 2.4, { tag: 'bridge' })),
      ],
      holes: [
        { id: 'vault_seal', kind: 'disc', x: 0, z: 0, r: 5, depth: 1.0 },
        { id: 'votive_font', kind: 'ring', x: 0, z: 0, r0: 12, r1: 14, depth: 0.25, lip: LIP(1.2) },
        { id: 'mirror_nave', kind: 'disc', x: -58.5, z: 0, r: 3.8, depth: 0.7, lip: LIP(2) },
        { id: 'ledger_well', kind: 'disc', x: -41, z: 41, r: 2.2, depth: 1.0, lip: LIP(3.3) },   // the shaft's broken south face, as geometry
        { id: 'cascade_basin', kind: 'disc', x: -29, z: -51, r: 4.2, depth: 0.85, lip: LIP(2) },
      ],
      blocks: [],
      // one of three bridges has fallen this descent (seeded); everything stays reachable under each (validated)
      variants: [
        { id: 'gw_mapmakers', name: "Mapmakers' Bridge has fallen", weight: 1, fallen: ['sp150'] },
        { id: 'gw_copyists', name: "Copyists' Bridge has fallen", weight: 1, fallen: ['sp330'] },
        { id: 'gw_tuned', name: 'The Tuning Pillar is cracked', weight: 1, fallen: ['sp210m'] },
      ],
    },
    moorings: [
      { id: 'harbour', name: 'The Harbour Steps', stand: wp(8, 48.6), slot: wp(8, 45), yawDeg: 0, bell: true },
      { id: 'skiff_steps', name: 'The Skiff Steps', stand: wp(5.2, 18.0), slot: wp(6.5, 22.2), yawDeg: 163, bell: true },
    ],
    lamps: [
      { id: 'harbour_lamp', name: 'Harbour Steps', x: 3, z: 50.5 },
      { id: 'orrery_lamp', name: 'Orrery Floor', x: -3.5, z: 16.3, place: 'votive_font' },
      { id: 'north_lamp', name: 'North Terrace', x: 0, z: -57.5, place: 'fallen_chandelier' },
      { id: 'mirror_lamp', x: -62, z: 6.5, place: 'mirror_nave' },
      { id: 'hour_lamp', x: 60, z: 3.5, place: 'bell_window' },
      { id: 'ledger_lamp', x: -37.6, z: 37.6, place: 'well_of_ledgers' },
      { id: 'cascade_lamp', x: -37.1, z: -49.6, place: 'stilled_cascade' },
      { id: 'hymnal_lamp', x: 43.3, z: 25, place: 'broken_hymnal' },
    ],
    deeds: [
      { id: 'span_winch', name: 'Span Winch', kind: 'winch', trigger: 'pill', at: wp(-6.5, 17.5), opens: 'sundered_span', resets: 'run' },
      { id: 'tuning_pillar', name: 'Tuning Pillar', kind: 'strike', trigger: 'pill', at: wpolar(0, 0, 50.5, 205), opens: 'tuned_bridge', resets: 'run' },
      { id: 'chandelier_arms', name: "The Chandelier's Arms", kind: 'light', trigger: 'touch', touchR: 0.9, points: [0, 60, 120, 180, 240, 300].map((a) => wpolar(0, -37, 4.8, a)), resets: 'dawn', place: 'fallen_chandelier' },
      { id: 'bell_rope', name: 'Bell Rope', kind: 'rope', trigger: 'pill', at: wp(61.8, 7.6), cooldown: 40, resets: 'never', place: 'bell_window' },
    ],
    shortcuts: [
      { id: 'sundered_span', name: 'The Sundered Span', deed: 'span_winch' },
      { id: 'tuned_bridge', name: 'The Tuned Bridge', deed: 'tuning_pillar' },
    ],
    drops: [],
    vigils: [
      { id: 'seal_round', name: 'Inside the Votive Font', kind: 'loop', pts: [0, 45, 90, 135, 180, 225, 270, 315].map((a) => [wpolar(0, 0, 7.4, a).x, wpolar(0, 0, 7.4, a).z]) },
      { id: 'gallery_round', name: 'Lower Gallery', kind: 'loop', pts: Array.from({ length: 24 }, (_, i) => [wpolar(0, 0, 51, i * 15).x, wpolar(0, 0, 51, i * 15).z]) },
    ],
    wayside: { kind: 'page', name: 'drifting pages', perDay: 6, along: 'walk', touchR: 1.0, give: { shells: [1, 2], lore: 0.25 }, persist: 'day' },
    places: [
      { id: 'fallen_chandelier', name: 'The Fallen Chandelier', access: 'foot', legend: true, lamp: 'north_lamp', stand: wp(0, -31.0),
        water: { kind: 'disc', x: 0, z: -37, r: 3.5, depth: [0.9, 0.95] },
        attract: { mirror_pike: 1.5, shardspine_eel: 1.5 },
        rule: { type: 'deed', name: 'Lit Arms', deed: 'chandelier_arms', mode: 'dawn', perStep: { rarity: 0.04 }, mods: { nibbleTells: 1, legendEnrageAdd: 15 } },
        lore: 'It fell in one breath. It has been holding that breath ever since.',
        look: 'A drowned chandelier whose coronet breaks the surface of the trench; you stand on its rim. Six arms relight as you walk past them.' },
      { id: 'mirror_nave', name: 'The Mirror Nave', access: 'foot', lamp: 'mirror_lamp', stand: wp(-58.5, 6.5),
        water: { kind: 'disc', x: -58.5, z: 0, r: 3.8, depth: [0.65, 0.75] },
        attract: { mirror_pike: 3 },
        rule: { type: 'reflection', name: 'Reflection', fish: 2, hitR: 0.9, wait: [2, 4], missWaitMult: 1.6, flash: 0.5, mirror: 'flipX', mods: { rarity: 0.2 } },
        alt: { fish: 3, hitR: 0.75 },
        lore: 'Nothing swims in the water. Everything swims in the ceiling.',
        look: 'The flooded nave of the Chapel of Unseen Hours under open crystal ribs. Two fish silhouettes swim along the ribs and show on the water mirrored across a north–south brass line.' },
      { id: 'bell_window', name: 'The Bell-Chapel Window', access: 'foot', lamp: 'hour_lamp', stand: wp(56.6, 6),
        water: { kind: 'disc', x: 44, z: -6, r: 4, depth: [0.85, 0.95] },
        attract: { chime_jelly: 3, mirror_pike: 2 },
        rule: { type: 'deed', name: 'The Struck Hour', deed: 'bell_rope', mode: 'window', window: 12, mods: { waitMult: 0.4 } },
        alt: { window: 8, cooldown: 25 },
        lore: 'Strike the hour and the water remembers.',
        look: 'A round window seven metres up in the west wall of the east chapel, looking north-west over the moat. Pull the rope: the bell tolls and a patch of water shivers.' },
      { id: 'well_of_ledgers', name: 'The Well of Ledgers', access: 'foot', lamp: 'ledger_lamp', stand: wp(-41, 37.2),
        water: { kind: 'disc', x: -41, z: 41, r: 2.2, depth: [0.5, 1.0] },
        attract: { blind_scrivener: 3, mirror_pike: 1.5 },
        rule: { type: 'plumb', name: 'Plumb Line', depth: [0.5, 1.0], bottomAt: 0.95, bottomMods: { rarity: 0.1 } },
        alt: { depth: [0.6, 1.0], bottomAt: 0.9 },
        lore: 'Every depth was written down.',
        look: 'A narrow shaft through shelved stone; its south face has fallen in, so the water shows far below. You stand on its north rim; the cast drops straight down and the charge chooses how deep.' },
      { id: 'stilled_cascade', name: 'The Stilled Cascade', access: 'foot', lamp: 'cascade_lamp', stand: wp(-33.6, -49.6),
        water: { kind: 'disc', x: -29, z: -51, r: 4.2, depth: [0.8, 0.9] },
        attract: { glassgill_perch: 2, prism_minnow: 1.5 },
        mods: { bandAmpMult: 0.25, bandNoiseMult: 0.3, darterJumpMult: 0.5, quality: 0.1, waitMult: 1.4 },
        rule: null, alt: { mods: { bandAmpMult: 0.35, bandNoiseMult: 0.4, darterJumpMult: 0.6, quality: 0.08, waitMult: 1.2 } },
        lore: 'The falls froze mid-word.',
        look: 'A basin under a waterfall turned to cyan crystal in mid-pour, open to the gallery on its south side. The water is so still the sweet band barely moves.' },
      { id: 'broken_hymnal', name: 'The Broken Hymnal', access: 'foot', lamp: 'hymnal_lamp', stand: wpolar(0, 0, 40.6, 30),
        water: { kind: 'disc', x: 30.5, z: 13.5, r: 6, depth: [0.85, 0.95] },
        attract: { prism_minnow: 2, mirror_pike: 1.5, shardspine_eel: 2 },
        rule: { type: 'cue', name: 'The Unfinished Chord', kind: 'chime', every: [3.5, 5], lead: 1.0, mods: { hookWindowAdd: 0.15, nibbleTells: 1 } },
        alt: { every: [2.5, 4], lead: 0.6 },
        lore: 'The bridge sang as it fell, and never quite finished.',
        look: 'The tilted outer stub of a collapsed crystal bridge. Shards still chime every few seconds, and fish bite exactly one second after a chime.' },
      { id: 'burning_glass', name: 'The Burning Glass', access: 'both', stand: null,
        water: { kind: 'ring', x: 0, z: 0, r0: 25.5, r1: 32.5, a0: 250, a1: 340, depth: [0.85, 0.95] },
        attract: {},
        rule: { type: 'moving', name: 'Focused Light', arc: { x: 0, z: 0, r: 29, a0: 250, a1: 340 }, speed: 0.65, r: 3.5, phases: ['calm'], mods: { rarity: 0.2, waitMult: 0.6, quality: 0.08 } },
        alt: { speed: 1.0, r: 2.8 },
        lore: 'A lens the size of a chapel, still trying to light the water.',
        look: 'A great lens hung high in the vault throws a 7 m pool of focused light that sweeps the north trench and back, about 70 s each way.' },
      { id: 'votive_font', name: 'The Votive Font', access: 'foot', lamp: 'orrery_lamp', stand: wp(0, 16.3),
        water: { kind: 'ring', x: 0, z: 0, r0: 12, r1: 14, depth: [0.2, 0.3] },
        attract: { prism_minnow: 2, glassblown_puffer: 2 },
        mods: { waitMult: 0.5, rarity: -0.1 },
        rule: null, alt: { mods: { waitMult: 0.4, rarity: -0.15 } },
        lore: 'Votive fry, small as wishes.',
        look: 'A shallow ring channel around the Vault Seal, crossed by six footbridges, its south rim sunk into a low step. Quick, cheap, eel-free fish one step from the hub.' },
    ],
  },

  // ================================================================== The Pallid Deep — mostly on foot
  paleabyss: {
    causeway: null,                                  // the shallow causeway is land now (the Spine)
    deepPools: [{ name: 'The Bottomless', x: 0, z: -52, r: 12, depth: 1.0 }],
    legendPool: { x: 0, z: -52, r: 3.2, name: 'The Bottomless' },
    islands: [   // the giants kneel at the north wall, facing the Brink and the camera
      { name: 'The Kneeling West', x: -25.5, z: -60.5, r: 10, kind: 'giant' },
      { name: 'The Kneeling East', x: 25.5, z: -60.5, r: 10, kind: 'giant' },
      { name: 'Funeral Barge', x: -42, z: 12, r: 4, kind: 'wreck' },
      { name: 'Candle Barge', x: 42, z: 4, r: 4, kind: 'wreck' },
    ],
    pillars: [165, 195, 225, 255, 285, 315, 345, 375].flatMap((a) => [28.5, 35.5].map((r) => ({ ...wpolar(0, 0, r, a), r: 1.2, kind: 'rib' }))),
    spawn: { x: 0, z: 68, yaw: 0 },
    docks: [{ x: 12, z: 58 }, { x: 34, z: 55.5 }, { x: -10.5, z: 25 }, { x: 10.5, z: 25 }, { x: -5.5, z: -35.5 }],
    spawnMode: 'foot', gateAccess: null,
    raft: { mode: 'beached', at: { x: 6, z: 72, yawDeg: 17 } },     // "Nothing floats in the Pallid Deep."
    spotStyle: { id: 'breath', name: 'The Breathing Deep', warn: 2, live: 12, every: [40, 70], missRespawn: 0.5, r: 3.5,
      walkSecondsMax: 8, castInset: 2, mods: { rarity: 0.3, weightBias: 0.5 }, tideChart: { count: 2, until: 'dusk' }, countsAsSpot: true },
    walk: {
      cell: 0.5,
      shapes: [
        { id: 'pd_landing', name: 'Landing of Last Rafts', kind: 'poly', y: 0.4, tag: 'ground', pts: [[-26, 60], [26, 60], [34, 68], [18, 74], [0, 76], [-18, 74], [-34, 68]] },
        { id: 'pd_spine', name: 'The Spine', kind: 'path', pts: [[0, 62, 0.6], [0, 31, 0.8]], w: 4, tag: 'ground' },
        { id: 'pd_plaza', name: 'Cairn Plaza', kind: 'disc', x: 0, z: 22, r: 9, y: 1.0, tag: 'ground' },
        { id: 'pd_pier', name: 'Long Pier of Names', kind: 'path', pts: [[2, 46, 0.7], [32, 50, 0.9]], w: 2.6, tag: 'ground' },
        { id: 'pd_pierend', kind: 'disc', x: 34, z: 50, r: 3, y: 0.9, tag: 'ground' },
        { id: 'pd_ribwalk', name: 'The Rib Walk', kind: 'ring', x: 0, z: 0, r0: 30.5, r1: 33.5, a0: 150, a1: 390, y: 1.0, tag: 'ground' },
        { id: 'pd_bearW', name: "Pallbearers' Walk (west)", kind: 'path', pts: [[-7, 18.5, 1.0], [-27.7, 16, 1.0]], w: 3, tag: 'ground' },
        { id: 'pd_bearE', name: "Pallbearers' Walk (east)", kind: 'path', pts: [[7, 18.5, 1.0], [27.7, 16, 1.0]], w: 3, tag: 'ground' },
        { id: 'pd_bierA', name: 'The Bier Road', kind: 'path', pts: [[-1, 13.5, 1.0], [-4.5, 2, 1.2]], w: 3, tag: 'ground' },
        { id: 'pd_bierM', name: 'The Sunken Road', kind: 'path', pts: [[-4.5, 2, 1.2], [-7, -8, 1.3]], w: 3, tag: 'ground', needs: 'sunken_road' },
        { id: 'pd_bierB', kind: 'path', pts: [[-7, -8, 1.3], [-9.5, -16.5, 1.5]], w: 3, tag: 'ground' },
        { id: 'pd_barge', name: 'The Bier Barge', kind: 'disc', x: -10, z: -20, r: 4.8, y: 1.5, tag: 'ground' },
        { id: 'pd_bierlink', kind: 'path', pts: [[-12, -22.5, 1.5], [-15.6, -27.6, 1.0]], w: 3, tag: 'ground' },
        { id: 'pd_stair', name: 'The Pilgrim Road', kind: 'path', pts: [[0, -33, 1.0], [0, -37.6, 1.0]], w: 3.5, tag: 'ground' },
        { id: 'pd_lip', name: 'The Brink', kind: 'ring', x: 0, z: -52, r0: 12, r1: 15, a0: 340, a1: 560, y: 1.0, tag: 'ground' },
        { id: 'pd_hands', name: 'The Joined Hands', kind: 'disc', x: 0, z: -61, r: 3.5, y: 6.0, tag: 'ground' },
        { id: 'pd_armW', name: 'West Forearm', kind: 'path', pts: [[-12.69, -56.62, 1.0], [-2.36, -60.18, 6.0]], w: 2.6, tag: 'ramp' },
        { id: 'pd_armE', name: 'East Forearm', kind: 'path', pts: [[12.69, -56.62, 1.0], [2.36, -60.18, 6.0]], w: 2.6, tag: 'ramp' },
        { id: 'pd_plank', name: 'Plank Walk', kind: 'path', pts: [[-32, -1.5, 1.0], [-50.5, -15.5, 2.5]], w: 2.6, tag: 'ground' },
        { id: 'pd_alms', name: 'The Drowned Almshouse', kind: 'rect', x: -58, z: -20, w: 16, d: 14, y: 2.5, tag: 'ground' },
        { id: 'pd_wallwalk', name: 'Wall Walk', kind: 'path', pts: [[-52.5, -26.5, 2.5], [-43, -40, 1.0]], w: 2.6, tag: 'ground' },
        { id: 'pd_slippath', name: 'Slip Path', kind: 'path', pts: [[-26.5, -19.5, 1.0], [-40, -40, 1.0]], w: 2.6, tag: 'ground' },
        { id: 'pd_sliphead', name: 'The Empty Ferry Slip', kind: 'disc', x: -42, z: -42, r: 3.5, y: 1.0, tag: 'ground' },
        { id: 'pd_slipW', kind: 'path', pts: [[-44, -44.5, 1.0], [-47, -57, 1.0]], w: 2.4, tag: 'ground' },
        { id: 'pd_slipE', kind: 'path', pts: [[-50, -44.5, 1.0], [-53, -56, 1.0]], w: 2.4, tag: 'ground' },
        { id: 'pd_belfrypier', name: 'Belfry Pier', kind: 'path', pts: [[32.5, -3, 1.0], [53, -20.4, 1.0]], w: 2.6, tag: 'ground' },
        { id: 'pd_belfry', name: 'The Sunken Belfry', kind: 'disc', x: 56, z: -22, r: 5.2, y: 1.0, tag: 'ground' },
        { id: 'pd_chainwalk', name: 'Chain Walk', kind: 'path', pts: [[27, -19.5, 1.0], [40, -37, 2.0]], w: 2.6, tag: 'ground' },
        { id: 'pd_plinth', name: 'The Chain Garden', kind: 'disc', x: 44, z: -42, r: 6, y: 2.0, tag: 'ground' },
        { id: 'pd_bellchain', name: 'Rust Walk', kind: 'path', pts: [[55, -26, 1.0], [47, -37.5, 2.0]], w: 2.6, tag: 'ground' },
        { id: 'pd_shroudW', name: 'Shroud Walk (west)', kind: 'path', pts: [[-14.6, -51.5, 1.0], [-28, -46, 1.0], [-39.6, -43.4, 1.0]], w: 2.6, tag: 'ground' },
        { id: 'pd_shroudE', name: 'Shroud Walk (east)', kind: 'path', pts: [[14.6, -51.5, 1.0], [28, -46, 1.5], [38.6, -44.4, 2.0]], w: 2.6, tag: 'ground' },
      ],
      holes: [
        { id: 'bier_hold', kind: 'disc', x: -10, z: -21.2, r: 1.6, depth: 0.8, lip: LIP(1.0) },
        { id: 'alms_cradle', kind: 'disc', x: -63, z: -24, r: 1.4, depth: 0.3, lip: LIP(0.6) },
        { id: 'alms_cookpot', kind: 'disc', x: -58, z: -24, r: 1.4, depth: 0.4, lip: LIP(0.6) },
        { id: 'alms_bed', kind: 'disc', x: -53, z: -23, r: 1.4, depth: 0.6, lip: LIP(0.6) },
        { id: 'alms_chest', kind: 'disc', x: -62, z: -16, r: 1.4, depth: 0.8, lip: LIP(0.6) },
        { id: 'alms_shrine', kind: 'disc', x: -55, z: -16, r: 1.4, depth: 0.7, lip: LIP(0.6) },
        { id: 'belfry_mouth', kind: 'disc', x: 56, z: -22, r: 2.2, depth: 0.9 },
      ],
      blocks: [{ kind: 'disc', x: 44, z: -42, r: 1.5, h: 6 }],   // the chain anchor post
      // either the Sunken Road is under water (default), or one Pallbearers' Walk is and the windlass raises that instead
      variants: [
        { id: 'pd_road', name: 'The Sunken Road is under water', weight: 2, fallen: [] },
        { id: 'pd_west', name: "The west Pallbearers' Walk is under water", weight: 1, fallen: ['pd_bearW'], swap: { sunken_road: ['pd_bearW'] } },
        { id: 'pd_east', name: "The east Pallbearers' Walk is under water", weight: 1, fallen: ['pd_bearE'], swap: { sunken_road: ['pd_bearE'] } },
      ],
    },
    moorings: [],
    lamps: [
      { id: 'landing_lamp', name: 'Landing of Last Rafts', x: -5, z: 66 },
      { id: 'plaza_lamp', name: 'Cairn Plaza', x: 4, z: 24 },
      { id: 'pier_lamp', x: 33.0, z: 47.6, place: 'long_pier' },
      { id: 'bier_lamp', x: -13.4, z: -17.6, place: 'bier_barge' },
      { id: 'lip_lamp', name: 'The Brink', x: 6, z: -39, place: 'the_bottomless' },
      { id: 'alms_lamp', x: -61.5, z: -20, place: 'drowned_almshouse' },
      { id: 'slip_lamp', x: -45.4, z: -41.6, place: 'ferry_slip' },
      { id: 'chain_lamp', x: 40, z: -40, place: 'chain_garden' },
      { id: 'belfry_lamp', x: 59.4, z: -18.6, place: 'sunken_belfry' },
    ],
    deeds: [
      { id: 'bone_windlass', name: 'Bone Windlass', kind: 'winch', trigger: 'pill', at: wp(-8.5, -11), opens: 'sunken_road', resets: 'run' },
      { id: 'bier_offer', name: 'The Bier', kind: 'offer', trigger: 'pill', at: wp(-6.8, -19.6), cost: { fish: 'lowest' }, resets: 'dusk', place: 'bier_barge' },
    ],
    shortcuts: [{ id: 'sunken_road', name: 'The Sunken Road', deed: 'bone_windlass' }],
    drops: [],
    vigils: [
      { id: 'plaza', name: 'Cairn Plaza', kind: 'disc', x: 0, z: 22, r: 8 },
      { id: 'landing', name: 'Landing of Last Rafts', kind: 'disc', x: 0, z: 67, r: 8 },
      { id: 'rib_round', name: 'The Rib Walk', kind: 'loop',
        pts: [...[150, 180, 210, 240, 270, 300, 330, 360, 390].map((a) => [wpolar(0, 0, 32, a).x, wpolar(0, 0, 32, a).z]), [17, 17.3], [0, 22], [-17, 17.3]] },
      { id: 'brink_round', name: 'The Brink and the Hands', kind: 'loop',
        pts: [[0, -38.5], [9.5, -42.5], [13.5, -52], [12.2, -56.8], [7, -58.6], [2.36, -60.18], [0, -59], [-2.36, -60.18], [-7, -58.6], [-12.2, -56.8], [-13.5, -52], [-9.5, -42.5]] },
    ],
    wayside: { kind: 'memorial', name: 'memorial candles', count: 48, along: 'walk', spacing: 6, touchR: 1.0, give: { oil: 0.5 }, persist: 'descent', victoryCascade: true },
    places: [
      { id: 'the_bottomless', name: 'The Bottomless', access: 'foot', legend: true, lamp: 'lip_lamp',
        stand: wp(0, -38.5), standName: 'The Brink', standMods: { sweetAdd: 0.03 },
        altStand: { x: 0, z: -57.9, name: 'The Joined Hands', mods: {} },          // the steep line (BALANCE.walk.steepLine) applies up here
        water: { kind: 'disc', x: 0, z: -52, r: 11.5, depth: [0.95, 1.0] },
        attract: { lampwarden_angler: 1.5, shroud_ray: 1.5 },
        rule: null,
        lore: 'Two who kneel. One who breathes below.',
        look: 'The black water before the kneeling giants. Fish from the low Brink (a flat line, but eels reach you) or climb a forearm to the Joined Hands (6 m up, eel-proof, a steep line).' },
      { id: 'long_pier', name: 'The Long Pier of Names', access: 'foot', lamp: 'pier_lamp', stand: wp(35.5, 50),
        water: { kind: 'disc', x: 39.8, z: 45.2, r: 6, depth: [0.75, 0.85] },
        attract: { shroud_ray: 1.5, gilt_eyed_eel: 1.5 },
        rule: { type: 'drifters', name: 'For the Named', lane: [[41, 34], [41, 62]], every: [20, 30], speed: 0.6, hitR: 1.5, perDay: 3, give: { oil: 6 }, nextBite: { rarity: 0.2 } },
        alt: { every: [14, 20], speed: 0.9, perDay: 4, give: { oil: 4 } },
        lore: "Every candle a promise someone couldn't keep.",
        look: 'A long pier lined with names. Little candle-rafts drift past its end; land your bobber beside one to relight it.' },
      { id: 'drowned_almshouse', name: 'The Drowned Almshouse', access: 'foot', lamp: 'alms_lamp', stand: wp(-58, -20),
        water: { kind: 'rect', x: -58, z: -20, w: 14, d: 12, depth: [0.3, 0.8] },
        attract: {},
        rule: { type: 'targets', name: 'Five Rooms', lock: 1.6, lockPicks: 'hole',
          targets: [
            { id: 'cradle', name: 'The Cradle', kind: 'disc', x: -63, z: -24, r: 1.4, depth: 0.3, attract: { ossuary_fry: 4 } },
            { id: 'cookpot', name: 'The Cookpot', kind: 'disc', x: -58, z: -24, r: 1.4, depth: 0.4, attract: { bonecrook_crayfish: 4 } },
            { id: 'bed', name: 'The Bed', kind: 'disc', x: -53, z: -23, r: 1.4, depth: 0.6, attract: { pallid_wraithfin: 3 } },
            { id: 'chest', name: 'The Chest', kind: 'disc', x: -62, z: -16, r: 1.4, depth: 0.8, attract: { gilt_eyed_eel: 3 } },
            { id: 'shrine', name: 'The Shrine', kind: 'disc', x: -55, z: -16, r: 1.4, depth: 0.7, attract: { funeral_veil: 3 } } ] },
        alt: { swap: [['cradle', 'chest'], ['cookpot', 'shrine']] },
        lore: 'Five rooms, five lives, and every one of them kept a fish.',
        look: 'A roofless upper floor with five holes in the boards, each over a different drowned room, each with a broken step on its south side. Aim near a hole and the reticle locks onto it.' },
      { id: 'chain_garden', name: 'The Chain Garden', access: 'foot', lamp: 'chain_lamp', stand: wp(44, -36.5),
        water: { kind: 'ring', x: 44, z: -42, r0: 6, r1: 12, depth: [0.85, 0.95] },
        attract: { gilt_eyed_eel: 1.5, lampwarden_angler: 1.5 },
        rule: { type: 'rhythm', name: 'The Thing Below Turns', period: 30, warn: 1.5, live: 8,
          near: { points: [wp(40, -51), wp(53, -44), wp(50, -50)], r: 4 }, mods: { weightBias: 0.6, rarity: 0.15 },
          foul: { chance: 0.15, spike: 0.15, warn: 0.3 } },
        alt: { period: 22, foul: { chance: 0.25, spike: 0.15, warn: 0.3 } },
        lore: 'Something turns over in its sleep.',
        look: 'A plinth with a great anchor post; three iron chains plunge into the water around it. Rust snows down and the chains groan before something below rolls over.' },
      { id: 'sunken_belfry', name: 'The Sunken Belfry', access: 'foot', lamp: 'belfry_lamp', stand: wp(56, -18.4), deadEnd: true,
        water: { kind: 'disc', x: 56, z: -22, r: 2.2, depth: [0.85, 0.95] },
        attract: { lampwarden_angler: 2, gilt_eyed_eel: 1.5 },
        rule: { type: 'cue', name: 'Rung from Below', kind: 'toll', noPlunge: true, lead: 0, mods: { hookWindowAdd: 0.1, rarity: 0.2 } },
        alt: { lead: 0.4 },
        lore: 'The bell rings when something touches it.',
        look: 'The crown of a drowned bell tower; you stand on its parapet over the bell-mouth. No plunge and no "!": the bell tolls and a bone-white ring pulses across the water.' },
      { id: 'bier_barge', name: 'The Bier Barge', access: 'foot', lamp: 'bier_lamp', stand: wp(-10, -17.0),
        water: { kind: 'disc', x: -10, z: -21.2, r: 1.6, depth: [0.75, 0.85] },
        attract: { funeral_veil: 2 },
        rule: { type: 'deed', name: 'Grave Goods', deed: 'bier_offer', mode: 'untilDusk', lockedBefore: true, gloomInCalm: true, mods: { rarity: 0.25, quality: 0.15 } },
        alt: { cost: { fish: 'highest' }, mods: { rarity: 0.35, quality: 0.2 } },
        lore: 'Give the dead a fish, and they open the hold.',
        look: 'A funeral barge with a lidded hold in its deck. Lay your cheapest fish on the bier and the lid slides back until dusk.' },
      { id: 'ferry_slip', name: 'The Empty Ferry Slip', access: 'foot', lamp: 'slip_lamp', stand: wp(-42, -42.5), deadEnd: true,
        water: { kind: 'path', pts: [[-47, -46], [-50, -55]], w: 3.5, depth: [0.85, 0.95] },
        attract: { shroud_ray: 1.5 },
        rule: { type: 'phaseWindow', name: 'The Last Ferry', phases: ['dusk'], firstCastOnly: true, guarantee: 'rare', wait: 2, perDescent: 1 },
        alt: { phases: ['dawn'] },
        lore: 'At dusk the ferry comes. It brings no one.',
        look: 'Two stone arms around an empty slip. Once a descent, at dusk, the water shows a boat that is not there; the first cast into it brings up something rare.' },
    ],
  },
};
export const PLACES = Object.entries(ARENA_V2).flatMap(([zid, a]) => (a.places || []).map((p) => ({ ...p, zone: zid })));

// ---- v2 content tables (merged into the v1 tables only when WALK_ENABLED).
export const WALK_STATS = {
  stride: { label: 'Stride', base: 0, fmt: 'num', min: -2, max: 3 },   // + m/s on foot (§24.3)
};
// Place-kept species: eligible ONLY in their place's water, under their `cond`, and only while awake this
// descent (BALANCE.places.awake). They count as rares everywhere else. Values ≈ +15% over each lake's rares.
export const WALK_SPECIES = [
  { id: 'harpstring_eel', name: 'Harpstring Eel', zone: 'sporewood', rarity: 'rare', tier: 3, place: 'gill_harp', cond: 'buff',
    weight: [0.6, 2.4], value: 74, food: 22, oil: 44, time: 'any', depth: [0.4, 0.85], bait: null, behavior: 'darter',
    difficulty: diff(3, 'darter'),
    model: { shape: 'eel', body: 0x3a1f3e, belly: 0xffc9de, fin: 0xff7fb0, glow: 0xff9fc4, pattern: 'stripes', eyes: 'glow', scale: 1.1 },
    hint: 'It only leaves the gill-strings while the Gill Harp sings.',
    lore: 'It lives between the gill-strings and comes out only when the chord is right. It has perfect pitch and no patience.' },
  { id: 'hushcap_koi', name: 'Hushcap Koi', zone: 'sporewood', rarity: 'rare', tier: 3, place: 'veilwater', cond: 'deed',
    weight: [1, 4], value: 78, food: 26, oil: 46, time: 'calm', depth: [0.6, 1], bait: null, behavior: 'darter',
    difficulty: diff(3, 'darter'),
    model: { shape: 'koi', body: 0x2b1b30, belly: 0xe9d6f0, fin: 0xffb46a, glow: 0xffd28a, pattern: 'spots', eyes: 'glow', scale: 1.05 },
    hint: 'In the Veilwater, once its veil has burned away.',
    lore: 'It glows only in the dark the pool keeps. Burn the veil and the dark comes up to look at you.' },
  { id: 'the_unreflected', name: 'The Unreflected', zone: 'glasswater', rarity: 'rare', tier: 4, place: 'mirror_nave', cond: 'reflection',
    weight: [1, 4], value: 145, food: 30, oil: 56, time: 'any', depth: [0.5, 1], bait: null, behavior: 'darter',
    difficulty: diff(4, 'darter'),
    model: { shape: 'pike', body: 0xc9e8ff, belly: 0xffffff, fin: 0x5062b0, glow: 0xa8d4ff, pattern: 'none', eyes: 'blind', scale: 1.1 },
    hint: 'Cast where its reflection swims, not where it seems to be.',
    lore: 'It has no reflection. In the Mirror Nave it is the only thing that does.' },
  { id: 'the_footnote', name: 'The Footnote', zone: 'glasswater', rarity: 'rare', tier: 4, place: 'well_of_ledgers', cond: 'plumbBottom',
    weight: [2, 6], value: 140, food: 40, oil: 54, time: 'any', depth: [0.9, 1], bait: null, behavior: 'sinker',
    difficulty: diff(4, 'sinker'),
    model: { shape: 'angler', body: 0x1b2246, belly: 0xd8e8ff, fin: 0x0b1030, glow: 0x5cbcff, pattern: 'bands', eyes: 'glow', scale: 1.15 },
    hint: 'At the very bottom of the Well of Ledgers. Only a perfect cast reaches it.',
    lore: 'Every ledger has one: a small thing at the very bottom that explains everything above it.' },
  { id: 'rainglass_darter', name: 'Rainglass Darter', zone: 'glasswater', rarity: 'rare', tier: 4, place: 'stilled_cascade',
    weight: [0.3, 1.2], value: 135, food: 20, oil: 60, time: 'calm', depth: [0.75, 0.95], bait: null, behavior: 'darter',
    difficulty: diff(4, 'darter'),
    model: { shape: 'minnow', body: 0xa8d4ff, belly: 0xffffff, fin: 0xb48cff, glow: 0xc9e8ff, pattern: 'spots', eyes: 'normal', scale: 0.6 },
    hint: 'Under the Stilled Cascade, while the light lasts.',
    lore: 'Rain that fell into the cascade the moment it froze, and decided to stay.' },
  { id: 'the_clapper', name: 'The Clapper', zone: 'paleabyss', rarity: 'rare', tier: 4, place: 'sunken_belfry',
    weight: [3, 9], value: 225, food: 46, oil: 70, time: 'any', depth: [0.8, 1], bait: null, behavior: 'thrasher',
    difficulty: diff(4, 'thrasher'),
    model: { shape: 'carp', body: 0x4a4436, belly: 0xe9e2cf, fin: 0x2a261c, glow: 0xe8c66a, pattern: 'bands', eyes: 'glow', scale: 1.3 },
    hint: 'It lives in the drowned bell. Listen for it.',
    lore: 'When it turns over in the bell, the bell rings, and everything else in the Deep goes quiet to listen.' },
  { id: 'wax_bearer', name: 'The Wax-Bearer', zone: 'paleabyss', rarity: 'rare', tier: 4, place: 'bier_barge', cond: 'deed',
    weight: [2, 6], value: 220, food: 30, oil: 80, time: 'any', depth: [0.7, 0.9], bait: null, behavior: 'leaper',
    difficulty: diff(4, 'leaper'),
    model: { shape: 'eel', body: 0xd8d2c0, belly: 0xfff6e0, fin: 0x8a8070, glow: 0xffe2a8, pattern: 'none', eyes: 'glow', scale: 1.2 },
    hint: 'In the hold of the Bier Barge, once the dead have been given something.',
    lore: 'It carries a drop of candle-wax on its brow, as the dead were sent off. No one knows whose.' },
  { id: 'the_unpaid_fare', name: 'The Unpaid Fare', zone: 'paleabyss', rarity: 'rare', tier: 4, place: 'ferry_slip', cond: 'window',
    weight: [4, 12], value: 240, food: 50, oil: 78, time: 'calm', depth: [0.8, 1], bait: null, behavior: 'sinker',
    difficulty: diff(4, 'sinker'),
    model: { shape: 'ghost', body: 0x2a2822, belly: 0xa8a18c, fin: 0x14130f, glow: 0xe8c66a, pattern: 'none', eyes: 'glow', scale: 1.35 },
    hint: 'It waits in the Empty Ferry Slip, but only for the Last Ferry.',
    lore: 'A coin-eyed fish that waits for a ferry that never brings anyone. It will settle for you.' },
];
export const WALK_BAITS = [
  { id: 'wick_worm', name: 'Wick-Worms', price: 30, count: 4, zoneMin: 1, unlock: 'strange_waters', legend: false, icon: 'worm',
    desc: 'Soft worms that glow like a stub of tallow. The fish of the hidden waters cannot leave them alone.',
    bonus: { rarityBonus: 0.06, attract: WALK_SPECIES.map((s) => s.id) } },
];
export const WALK_UPGRADES = [
  { id: 'boots_cork', name: 'Cork-Soled Boots', category: 'feet', icon: 'boots', maxLevel: 3, costs: [45, 120, 280], zone: 'sporewood',
    effects: { stride: 0.35 }, desc: 'Soles of drowned cork. Quieter on stone, quicker on the long way round. +0.35 m/s on foot.' },
];
export const WALK_SUPPLIES = [
  { id: 'stake_lantern', name: 'Stake Lantern', price: 40, give: { stake: 1 }, zoneMin: 1, limitPerVisit: 1, icon: 'lamp',
    desc: 'Plant it on any stone with the pill. Until dawn it slows what enters its light and shows the Silent Choir. It does not keep the dark off.' },
];
export const WALK_RELICS = [
  { id: 'roadworn_soles', name: 'Roadworn Soles', icon: 'boots', maxLevel: 3, costs: [45, 125, 280], effects: { stride: 0.2 }, unlock: 'first_footfall',
    desc: 'Worn through by someone who walked every road down here, and kept walking. +0.2 m/s on foot.' },
  { id: 'trimmers_shears', name: "The Trimmer's Shears", icon: 'lamp', maxLevel: 2, costs: [90, 245], effects: {}, special: 'lampRadius:1', unlock: 'a_place_that_knows',
    desc: 'A trimmed wick burns wider. Sister-candles you relight throw 1 m more light per level.' },
  { id: 'surveyors_chalk', name: "The Surveyor's Chalk", icon: 'map', maxLevel: 1, costs: [185], effects: {}, special: 'shortcutStart:1', unlock: 'the_long_way_round',
    desc: 'Chalk marks from a survey no one finished. In each walking lake, one way (the nearest to where you arrive) starts open.' },
];
export const WALK_BOONS = [
  { id: 'undertow_crook', name: 'Undertow Crook', icon: 'crook', rarity: 'common', maxLevel: 5, kind: 'weapon', weapon: 'crook', unlock: 'held_the_crossing', tags: ['foot', 'area', 'close'],
    desc: 'Your lantern crook sweeps a low arc and throws what climbs toward you back into the dark.', lore: 'Every drowned road needs someone to keep it clear.',
    levels: [
      { damage: 6, arc: 120, radius: 2.5, cooldown: 1.8, knock: 3.0, note: 'A 2.5 m sweep every 1.8 s. On foot it knocks crawlers off the walkway: they re-haul for 0.8 s, taking × 1.5 aura; a fall over 2 m stuns them for 1 s. On the raft it sweeps the deck edge.' },
      { damage: 8, arc: 140, radius: 2.6, cooldown: 1.7, knock: 3.2, note: '+33% damage, wider arc.' },
      { damage: 10, arc: 160, radius: 2.8, cooldown: 1.6, knock: 3.4, note: '+25% damage, faster.' },
      { damage: 12, arc: 180, radius: 3.0, cooldown: 1.45, knock: 3.7, note: '+20% damage, a half-circle sweep.' },
      { damage: 15, arc: 200, radius: 3.2, cooldown: 1.3, knock: 4.0, note: '+25% damage, faster, wider.' },
    ],
    kindle: { requires: 'vantage', name: 'Riptide Crook', desc: 'A full-circle sweep that hurls crawlers off any edge and stuns them where they land.', lore: 'The road is yours. Everything else goes back to the water.',
      params: { damage: 20, arc: 360, radius: 3.6, cooldown: 1.2, knock: 4.5, dropStun: 1.5, haulAuraMult: 2 } } },
  { id: 'vantage', name: 'Vantage', icon: 'height', rarity: 'common', maxLevel: 3, kind: 'stat', effects: {}, unlock: 'hidden_waters', tags: ['foot', 'light'],
    desc: 'On high ground your zaps reach farther, and crawlers hauling themselves up to you burn hotter in your light.', lore: 'The dark has to climb to reach you. Let it.',
    proc: { on: 'high', levels: [
      { zapRange: 2, haulAuraMult: 1.5 }, { zapRange: 4, haulAuraMult: 2.0 }, { zapRange: 6, haulAuraMult: 2.5, lightRadius: 0.5 } ] } },
  { id: 'kindred_flames', name: 'Kindred Flames', icon: 'lamp', rarity: 'rare', maxLevel: 3, kind: 'stat', effects: {}, unlock: 'shared_flame', tags: ['light', 'foot'],
    desc: 'Sister-candles burn with your flame: they scorch what enters them, and share faster and cheaper.', lore: 'Every candle you relit remembers whose flame it was.',
    proc: { on: 'lamp', levels: [
      { auraFrac: 0.4, shareTime: 0.7, firstShareCostMult: 0.75 }, { auraFrac: 0.6, shareTime: 0.45, firstShareCostMult: 0.5 },
      { auraFrac: 0.8, shareTime: 0.25, firstShareCostMult: 0, flarePerLampPerNight: 1 } ] } },
];
export const WALK_CHARACTERS = [
  { id: 'wayfarer', name: 'The Wayfarer', title: 'Who Walked Every Road', unlock: 'every_still_place',
    desc: 'Light on its feet and slow at the oars. Walks the long roads fastest and relights the first sister-candle in every lake for nothing.',
    effects: { stride: 0.8, moveSpeed: -1 }, startBoon: 'undertow_crook', startKit: { shells: 0, bait: { wick_worm: 2 } },
    quirk: { id: 'first_flame', name: 'First Flame', desc: 'The first sister-candle you share flame with in each lake costs no oil.', firstShareFree: true },
    look: { flame: 0xffc070, cloak: 0x3a3a2c, eyes: 0xffc070, hat: 'hood', wax: 0xd9ccb0, scale: 0.95 },
    lore: 'It never found the bottom. It found every road on the way.' },
];
export const WALK_CHALLENGES = [
  // ---- IV. Paths Underfoot (runs 2–20+)
  { id: 'first_footfall', tier: 4, name: 'First Footfall', desc: 'Step ashore from your raft.', type: 'footAshore', params: { n: 1 }, scope: 'total', reward: { unlock: 'relic:roadworn_soles', memories: 5 } },
  { id: 'hidden_waters', tier: 4, name: 'Hidden Waters', desc: 'Discover 6 Places.', type: 'placeFound', params: { n: 6 }, scope: 'total', reward: { unlock: 'boon:vantage', memories: 10 } },
  { id: 'shared_flame', tier: 4, name: 'Four Shared Flames', desc: 'Share your flame with 4 sister-candles in one descent.', type: 'lampLit', params: { n: 4 }, scope: 'run', reward: { unlock: 'boon:kindred_flames', memories: 15 } },
  { id: 'strange_waters', tier: 4, name: 'Strange Waters', desc: 'Land 3 different place-kept fish.', type: 'placeSpecies', params: { n: 3 }, scope: 'total', reward: { unlock: 'bait:wick_worm', memories: 15 } },
  { id: 'a_place_that_knows', tier: 4, name: 'A Place That Knows You', desc: 'Master a Place.', type: 'placeMastered', params: { n: 1 }, scope: 'total', reward: { unlock: 'relic:trimmers_shears', memories: 15 } },
  { id: 'the_long_way_round', tier: 4, name: 'The Long Way Round', desc: 'Open 3 shortcuts in one descent.', type: 'shortcutOpen', params: { n: 3 }, scope: 'run', reward: { unlock: 'relic:surveyors_chalk', memories: 10 } },
  { id: 'held_the_crossing', tier: 4, name: 'Held the Crossing', desc: 'Disperse 60 gloomlings on bridges in a single Gloomtide.', type: 'slayOnTag', params: { tag: 'bridge', n: 60 }, scope: 'run', reward: { unlock: 'boon:undertow_crook', memories: 20 } },
  { id: 'far_from_any_candle', tier: 4, name: 'Far From Any Candle', desc: "Endure a Gloomtide on foot in the Glasswater Vault or deeper without standing in a sister-candle's light.", type: 'nightNoLamp', params: { zoneMin: 2 }, scope: 'run', reward: { unlock: null, memories: 20 } },
  { id: 'every_candle', tier: 4, name: 'Every Candle in the Vault', desc: 'Share your flame with every sister-candle in the Glasswater Vault in one descent.', type: 'lampLitZone', params: { zone: 'glasswater' }, scope: 'run', reward: { unlock: null, memories: 25 } },
  { id: 'every_still_place', tier: 4, name: 'Every Still Place', desc: 'Master every Place in the three lower lakes.', type: 'placeMastered', params: { n: PLACES.length }, scope: 'total', reward: { unlock: 'character:wayfarer', memories: 50 } },
];
// Foot-only formations and bounty templates (combat v2 / progression v2 append these; v1 never reads them).
export const WALK_FORMATIONS = [
  { id: 'edgerise', name: 'The Stirring Edge', zoneMin: 1, dayMin: 2, weight: 3, modes: ['mixed', 'foot'], footOnly: true, enemy: 'gloomling', enemyByZone: { sporewood: 'sporeling' },
    count: { base: 6, perHeat: 1 }, ringRadius: [4, 10], telegraph: 1.2, requiresWaterShare: 0.5,
    banner: 'The water at your feet stirs.', answer: 'Step inland, or flare as they rise.' },
  { id: 'snuffers', name: 'Candle-Snuffers', zoneMin: 1, dayMin: 2, weight: 2, modes: ['mixed', 'foot'], footOnly: true, enemy: 'duskmantle',
    count: { base: 4, perHeatHalf: 1 }, target: 'lamp', lampWithin: 25,
    banner: 'Wings, drawn to a sister-candle.', answer: 'Zap them off the candle, or let it go dark.' },
];
export const WALK_BOUNTY_TYPES = ['placeCatch', 'placeSpecies', 'astirCatch', 'lampLit', 'nightInLamp'];
export const WALK_BOUNTIES = [
  { id: 'place_catch', type: 'placeCatch', text: 'Bring me {n} fish from {place}.', params: { n: [1, 2] }, base: 26, perN: 10, weight: 3, zoneMin: 1, dayMin: 1, modes: ['mixed', 'foot'] },
  { id: 'place_species', type: 'placeSpecies', text: 'They whisper of a {species} at {place}. Bring it to me.', params: { reachableOnly: true, awakeOnly: true }, base: 55, weight: 1, zoneMin: 1, dayMin: 1, modes: ['mixed', 'foot'] },
  { id: 'astir_catch', type: 'astirCatch', text: '{place} is astir today. Bring me {n} fish from it.', params: { n: 2 }, base: 34, weight: 2, zoneMin: 1, dayMin: 1, modes: ['mixed', 'foot'] },
  { id: 'light_lamp', type: 'lampLit', text: 'Share your flame with the sister-candle at {lamp} before dusk.', params: { unlitOnly: true }, base: 20, weight: 2, zoneMin: 1, dayMin: 1, modes: ['mixed', 'foot'] },
  { id: 'lamp_vigil', type: 'nightInLamp', text: "Keep tonight's vigil inside the light of {lamp}.", params: { share: 0.75 }, base: 50, weight: 1, zoneMin: 2, dayMin: 1, modes: ['foot'] },
];
// Tips: trigger = `event` or `event:disc`, where disc is the payload's first of phase / resource / reason / state / id (ui).
export const WALK_TIPS = [
  { id: 'moor_walk',   trigger: 'interact:change:ashore',  text: 'Push into a jetty, or tap Ashore, to step off. Some pools no raft can reach.' },
  { id: 'foot_basics', trigger: 'player:mode:ashore',      text: 'On foot you stop on a coin. The water is for fishing; the stone is for walking.' },
  { id: 'foot_spawn',  trigger: 'player:mode:spawn',       text: 'No raft can follow you here. Walk the stone; cast from its edge.' },
  { id: 'tow_bell',    trigger: 'interact:change:bell',    text: "Ring a jetty's bell to call your raft to it." },
  { id: 'lamp_light',  trigger: 'interact:change:lamp',    text: 'Hold E or Share flame to relight a sister-candle. It costs oil, and burns all descent.' },
  { id: 'lamp_hop',    trigger: 'lamp:lit',                text: 'At dawn you may flame-leap once, for free, to any sister-candle you have relit.' },
  { id: 'place_found', trigger: 'place:discover',          text: 'A Place: still water with its own rule and its own fish. Master it.' },
  { id: 'high_cast',   trigger: 'walk:high',               text: 'High ground casts farther, and only stairs bring the mites up to you.' },
  { id: 'shortcut',    trigger: 'shortcut:open',           text: 'A way is open. It stays open for the rest of this descent.' },
  { id: 'edge_eels',   trigger: 'foot:eelEdge',            text: 'Eels only reach you near open water. Step back from the edge, or zap.' },
  { id: 'astir',       trigger: 'place:astir',             text: 'Murk says a Place is astir today. Its water runs rich until dusk.' },
  { id: 'legend_snuff', trigger: 'lamp:snuffed:legend',    text: 'It breathes the candles in. Land it, and every one of them burns again.' },
];
export const WALK_TEXT = {
  ashore: 'Ashore', board: 'Board', ringBell: 'Ring Bell', light: 'Share flame', hop: 'Flame-leap', fishHere: 'Fish here', plantStake: 'Plant',
  winch: 'Turn', strike: 'Strike', rope: 'Pull', offer: 'Offer', candle: 'Sister-candle', candles: 'Sister-candles',
  placeFound: 'A new water: {name}', placeMastered: '{name} remembers you.', knownPlace: 'Known Place', placesTitle: 'Places',
  astirBanner: '{name} is astir today.', duskLamp: 'Nearest sister-candle {m} m · ≈ {s} s', openGround: 'Open ground {s} s',
  noLamp: 'No candle within reach. Find open ground, or plant a Stake Lantern.',
  shortcutOpen: '{name} is open.', lampSnuffed: 'The sister-candle at {name} goes dark.', legendSnuff: 'It breathes the candles in.',
  victoryCandles: 'Every candle in the Deep burns gold.', variant: '{name}.', asleep: 'It sleeps this descent.',
  raftBeached: 'Nothing floats in the Pallid Deep. The raft stays with the others.',
  raftSkiff: "Your raft can't climb stairs. It can still cross the moat to the Skiff Steps.",
  arrivalHush: 'The Gloom has not found you yet.',
};

// ---- Apply (only when the walking build is active).
if (WALK_ENABLED) {
  STATS.moveSpeed.label = 'Speed';                      // raft top speed; on foot × BALANCE.walk.speedMult (+ stride)
  Object.assign(STATS, WALK_STATS);
  SPECIES.push(...WALK_SPECIES); BAITS.push(...WALK_BAITS); UPGRADES.push(...WALK_UPGRADES); SUPPLIES.push(...WALK_SUPPLIES);
  RELICS.push(...WALK_RELICS); BOONS.push(...WALK_BOONS); CHARACTERS.push(...WALK_CHARACTERS); CHALLENGES.push(...WALK_CHALLENGES);
  const chron = CHALLENGES.find((c) => c.id === 'complete_chronicle'); if (chron) chron.params.n = SPECIES.length;
  TIPS.push(...WALK_TIPS);
  for (const z of ZONES) {
    if (ZONE_V2[z.id]) Object.assign(z, ZONE_V2[z.id]);
    if (ARENA_V2[z.id]) Object.assign(z.arena, ARENA_V2[z.id]);
  }
  BALANCE.travel.arrivalHush = ARRIVAL_HUSH;
  BALANCE.memories.placeNew = 2;                       // run-end Memories per Place discovered for the first time ever
  TEXT.challengeTiers[4] = 'Paths Underfoot';
  TEXT.memoryLabels.places = 'New places found';
  TEXT.walk = WALK_TEXT;
  MERCHANT_LINES.astir = [
    '{place} is stirring today. Go, before it remembers it is tired.',
    'Something woke at {place}. Bring me what it brings you.',
    '{place} has its mouth open today. I would not waste it.',
  ];
}
// memoriesFor() reads BALANCE.memories.placeNew ?? 0 and summary.placesNew (v1 summaries have none).

// ---- The walk grid (world builds from this; validate-data and tools read it too). Pure and
// deterministic: same zone + same open shortcuts + same variant → same grid. Painter's order: ground
// shapes (later overwrite earlier; `needs` unmet or `fallen` skipped) → holes (+ their low south lips)
// → bridges (over water, pools or ground) → obstacles (islands at obstacleRadius, pillars, walk.blocks,
// candle posts) block. Every top is quantised to BALANCE.walk.heightQuant. Cells beyond R − pad are VOID.
const DEG = Math.PI / 180;
function segDistT(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
  const t = L2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)) : 0;
  return [Math.hypot(px - (ax + dx * t), pz - (az + dz * t)), t];
}
function inPolygon(px, pz, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
const angIn = (a, a0, a1) => { let rel = (a - (((a0 % 360) + 360) % 360)); rel = ((rel % 360) + 360) % 360; return rel <= a1 - a0; };
/** Surface height of a walk shape at (x, z), or NaN outside it (disc|ring|rect|poly|path). */
export function walkShapeHeight(s, x, z) {
  switch (s.kind) {
    case 'disc': return Math.hypot(x - s.x, z - s.z) <= s.r ? (s.y ?? 0) : NaN;
    case 'ring': {
      const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz);
      if (d < s.r0 || d > s.r1) return NaN;
      if (s.a0 != null) { let a = Math.atan2(dz, dx) / DEG; if (a < 0) a += 360; if (!angIn(a, s.a0, s.a1)) return NaN; }
      return s.y ?? 0;
    }
    case 'rect': {
      const c = Math.cos((s.yaw || 0) * DEG), sn = Math.sin((s.yaw || 0) * DEG), dx = x - s.x, dz = z - s.z;
      return Math.abs(dx * c + dz * sn) <= s.w / 2 && Math.abs(-dx * sn + dz * c) <= s.d / 2 ? (s.y ?? 0) : NaN;
    }
    case 'poly': return inPolygon(x, z, s.pts) ? (s.y ?? 0) : NaN;
    case 'path': {
      let best = Infinity, by = NaN; const P = s.pts;
      for (let i = 0; i + 1 < P.length; i++) {
        const [d, t] = segDistT(x, z, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]);
        if (d < best) { best = d; const y0 = P[i][2] ?? s.y ?? 0, y1 = P[i + 1][2] ?? s.y ?? 0; by = y0 + (y1 - y0) * t; }
      }
      return best <= s.w / 2 ? by : NaN;
    }
    default: return NaN;
  }
}
/** Axis-aligned bounds [x0, z0, x1, z1] of a walk shape (pad m around it). */
export function walkShapeBounds(s, pad = 0) {
  switch (s.kind) {
    case 'disc': return [s.x - s.r - pad, s.z - s.r - pad, s.x + s.r + pad, s.z + s.r + pad];
    case 'ring': return [s.x - s.r1 - pad, s.z - s.r1 - pad, s.x + s.r1 + pad, s.z + s.r1 + pad];
    case 'rect': { const h = Math.hypot(s.w, s.d) / 2 + pad; return [s.x - h, s.z - h, s.x + h, s.z + h]; }
    case 'poly': case 'path': {
      const p2 = (s.kind === 'path' ? s.w / 2 : 0) + pad; let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
      for (const p of s.pts) { a = Math.min(a, p[0]); b = Math.min(b, p[1]); c = Math.max(c, p[0]); d = Math.max(d, p[1]); }
      return [a - p2, b - p2, c + p2, d + p2];
    }
    default: return [0, 0, 0, 0];
  }
}
/** Distance outside a hole's edge at (x, z) and the angle (deg) from its centre; used for lips. */
function lipBand(h, x, z) {
  if (h.kind === 'disc') { const d = Math.hypot(x - h.x, z - h.z); return [d - h.r, Math.atan2(z - h.z, x - h.x) / DEG]; }
  if (h.kind === 'ring') { const d = Math.hypot(x - h.x, z - h.z); return [d - h.r1, Math.atan2(z - h.z, x - h.x) / DEG]; }
  if (h.kind === 'rect') { const dz = z - (h.z + h.d / 2); return Math.abs(x - h.x) <= h.w / 2 && dz >= 0 ? [dz, 90] : [Infinity, 0]; }
  return [Infinity, 0];
}
/** True when (x, z) lies in a place's water area (place.water uses the walk-shape kinds). */
export function placeContains(place, x, z) { return !!place?.water && !Number.isNaN(walkShapeHeight(place.water, x, z)); }
/** The place whose water contains (x, z) in this zone, or null. */
export function placeAt(zone, x, z) {
  const id = typeof zone === 'string' ? zone : zone?.id;
  return (ARENA_V2[id]?.places || []).find((p) => placeContains(p, x, z)) || null;
}
/** The walk arena of a zone: v1 arena fields overlaid with ARENA_V2 (independent of WALK_ENABLED). */
export function walkArenaFor(zoneOrId) {
  const zone = typeof zoneOrId === 'string' ? ZONES.find((z) => z.id === zoneOrId) : zoneOrId;
  return zone ? { ...zone.arena, ...(ARENA_V2[zone.id] || {}) } : null;
}
/**
 * Rasterise a zone's walk layout. opts: {open: {shortcutId: true}, variant: variantId, cell}.
 * Returns {cell, n, ox, oz, top:Float32Array (NaN = no ground), flags:Uint8Array (WALK_FLAGS),
 * shape:Int16Array (painting shape index, −1), pool:Int16Array (hole index, −1), idx(x, z) → cell | −1}.
 */
export function walkGridFor(zoneOrId, opts = {}) {
  const zone = typeof zoneOrId === 'string' ? ZONES.find((z) => z.id === zoneOrId) : zoneOrId;
  const A = walkArenaFor(zone), W = A.walk, F = WALK_FLAGS, Q = BALANCE.walk.heightQuant;
  const cell = opts.cell ?? W?.cell ?? 0.5, R = A.radius, half = R + 2, edge = R - WALK_SHORE.pad;
  const n = Math.ceil((2 * half) / cell), ox = -half, oz = -half, N = n * n;
  const V = (W?.variants || []).find((v) => v.id === opts.variant) || null;
  const open = { ...(opts.open || {}) };
  const swapped = new Map();   // shapeId → shortcutId that raises it in this variant
  if (V?.swap) for (const [sc, ids] of Object.entries(V.swap)) for (const id of ids) swapped.set(id, sc);
  const top = new Float32Array(N).fill(NaN), flags = new Uint8Array(N), shape = new Int16Array(N).fill(-1), pool = new Int16Array(N).fill(-1);
  const q = (y) => Math.round(y / Q) * Q;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) flags[j * n + i] = Math.hypot(ox + (i + 0.5) * cell, oz + (j + 0.5) * cell) <= edge ? F.WATER : F.VOID;
  const present = (s) => {
    if (swapped.has(s.id)) return !!open[swapped.get(s.id)];                 // fallen this descent; the variant's shortcut raises it
    if (V?.fallen?.includes(s.id)) return false;
    if (!s.needs) return true;
    if (V?.swap && V.swap[s.needs]) return true;                            // its shortcut now raises something else: present from the start
    return !!open[s.needs];
  };
  const paint = (s, fn, pad = 0) => {
    const [x0, z0, x1, z1] = walkShapeBounds(s, pad);
    const i0 = Math.max(0, Math.floor((x0 - ox) / cell)), i1 = Math.min(n - 1, Math.ceil((x1 - ox) / cell));
    const j0 = Math.max(0, Math.floor((z0 - oz) / cell)), j1 = Math.min(n - 1, Math.ceil((z1 - oz) / cell));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const k = j * n + i; if (flags[k] & F.VOID) continue;
      fn(k, ox + (i + 0.5) * cell, oz + (j + 0.5) * cell);
    }
  };
  const shapes = W?.shapes || [];
  shapes.forEach((s, si) => {
    if (s.tag === 'bridge' || !present(s)) return;
    paint(s, (k, x, z) => { const y = walkShapeHeight(s, x, z); if (Number.isNaN(y)) return; top[k] = q(y); flags[k] = (flags[k] & ~F.WATER) | F.GROUND; shape[k] = si; });
  });
  (W?.holes || []).forEach((h, hi) => {
    paint(h, (k, x, z) => {
      if (Number.isNaN(walkShapeHeight(h, x, z)) || !(flags[k] & F.GROUND)) return;
      top[k] = NaN; flags[k] = (flags[k] & ~(F.GROUND | F.SILL)) | F.POOL; shape[k] = -1; pool[k] = hi;
    });
    if (h.lip) paint(h, (k, x, z) => {
      if (!(flags[k] & F.GROUND)) return;
      const [d, a] = lipBand(h, x, z); if (!(d > 0 && d <= h.lip.w)) return;
      if (!angIn(((a % 360) + 360) % 360, h.lip.a0 ?? 30, h.lip.a1 ?? 150)) return;
      const y = q(h.lip.y); if (!(top[k] > y)) return;
      top[k] = y; flags[k] |= F.SILL;
    }, h.lip.w);
  });
  shapes.forEach((s, si) => {
    if (s.tag !== 'bridge' || !present(s)) return;
    paint(s, (k, x, z) => {
      const y = walkShapeHeight(s, x, z); if (Number.isNaN(y)) return;
      const wet = flags[k] & (F.WATER | F.POOL);
      top[k] = q(y); flags[k] = (flags[k] | F.GROUND) & ~F.SILL; shape[k] = si;
      if (wet) { flags[k] |= F.BRIDGE; if (s.raftPass) flags[k] |= F.RAFTPASS; }
    });
  });
  const block = (o) => paint(o, (k, x, z) => { if (!Number.isNaN(walkShapeHeight(o, x, z))) flags[k] |= F.BLOCK; });
  for (const o of A.islands || []) block({ kind: 'disc', x: o.x, z: o.z, r: obstacleRadius(o, true) });
  for (const o of A.pillars || []) block({ kind: 'disc', x: o.x, z: o.z, r: obstacleRadius(o) });
  for (const o of W?.blocks || []) block(o.kind === 'rect' ? o : { kind: 'disc', x: o.x, z: o.z, r: o.r });
  for (const l of A.lamps || []) block({ kind: 'disc', x: l.x, z: l.z, r: BALANCE.lamps.postR });
  const idx = (x, z) => { const i = Math.floor((x - ox) / cell), j = Math.floor((z - oz) / cell); return i < 0 || j < 0 || i >= n || j >= n ? -1 : j * n + i; };
  return { cell, n, ox, oz, top, flags, shape, pool, idx, variant: V?.id ?? null };
}


// =====================================================================================
// v3 — "Expeditions from the Landing" (DESIGN §25, CONTRACT §13; source of truth: BRIEF-v3).
// Everything below is ADDITIVE and INERT until V3_ENABLED is true: with it off, every v1 and v2
// table above is bit-identical (validate-data passes 1 and 2 check it; pass 3 runs with V3 on).
// With it on, the block at the end of this section applies the v3 tables to the v1 ones
// (SPECIES → the 53-species roster, BALANCE gains the v3 keys, RELICS / CHALLENGES / BOONS /
// CHARACTERS / BAITS / SUPPLIES / TIPS are patched) before the lookup maps are built. The v3
// exports themselves are always present so tools (tools/sim/reel-v3.mjs, roster-v3.mjs,
// validate-data --v3) can read them in any build.
//
// Turn it on: set `globalThis.GW_V3 = true` before this module evaluates (tools import data as
// '../src/data.js?v3' after setting it), or flip the default below in the commit that lands the
// v3 code. v3 is designed on top of §24: the walking build (GW_WALK) is expected alongside it;
// with V3 on and WALK off, species and challenges that need §24's places are left out.
//
// Code names (brief §0): players see "the Landing"; code says `hub` (flow), `cove` (zone id,
// camera mode, COVE export) and `hub:enter` (event), because `landing` is a fishing state.
// =====================================================================================
export const V3_ENABLED = globalThis.GW_V3 === true;
// Which phase's data a v3 build carries (DESIGN §25.14.1, CONTRACT §13.0): 1 the feel shift · 2 the Mossmere's places
// and giants · 3 expeditions and the Landing · 4 wonder and depth. Set `globalThis.GW_V3_PHASE` (1–4) before this
// module evaluates; the default 4 carries everything, so tools see the whole design. Each phase's build sets it.
export const V3_PHASE = Math.max(1, Math.min(4, Math.floor(Number(globalThis.GW_V3_PHASE ?? 4)) || 4));
// BALANCE_V3 blocks that join BALANCE after P1 (every other block lands with P1's code; validated per phase).
export const V3_BLOCK_PHASE = { residents: 2, markedFish: 2, farWater: 3, liveWell: 3 };

const v3clone = (o) => JSON.parse(JSON.stringify(o));
const v3r = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const v3uniq = (...lists) => [...new Map(lists.flat().map((x) => [x.id, x])).values()];   // v1 + §24 lists (the walking merge may already have pushed §24 rows)

// ---- The size ladder (brief §6.1, §5.4, §5.8). One ladder everywhere: Small · Keeper · Prize · Trophy ·
// Elder. Classes are cut on the size score z (same rarity on every species); an Ancient is an Elder with
// z ≥ 3.2 (a gold thread on its seal), not a sixth rung. zMax = the class's upper cut (exclusive).
export const SIZE_CLASSES = [
  { id: 'small',  label: 'Small',  zMax: -0.25, bite: 'doublePop', seal: null,             ceremony: 1.2, chime: false },
  { id: 'keeper', label: 'Keeper', zMax: 1.04,  bite: 'plunge',    seal: null,             ceremony: 1.2, chime: false },
  { id: 'prize',  label: 'Prize',  zMax: 1.88,  bite: 'dragUnder', seal: 'inkStamp',       ceremony: 2.4, chime: true },
  { id: 'trophy', label: 'Trophy', zMax: 2.65,  bite: 'flatSlide', seal: 'oxbloodWax',     ceremony: 3.5, chime: true },
  { id: 'elder',  label: 'Elder',  zMax: Infinity, bite: 'dome',   seal: 'blackWaxRibbon', ceremony: 5.0, chime: true, named: true },
];

// ---- BALANCE_V3: merged into BALANCE when V3_ENABLED (the brief's `BALANCE.size`, `.farWater`,
// `.liveWell`, `.oil`, `.wellFed`, `.nightModes`, `.tackleRating`, `.cameras` …). Every block is new except
// `bite`, whose v3 keys are merged into v1's BALANCE.bite; no v1 / v2 key is ever replaced (validated),
// so The Long Descent keeps today's numbers.
export const BALANCE_V3 = {
  // ---- One size model (brief §6.1). z ~ Normal(μ, 1) truncated to [min, max];
  // L = L50 · e^(σz + tail · max(0, z − tailFrom)²) (cm); W = k · L³ (g, k per body shape, g/cm³).
  size: {
    z: { sd: 1, min: -2.0, max: 3.6 },
    tail: 0.06, tailFrom: 1.04,
    ancient: 3.2,                     // an Elder with z ≥ 3.2
    reachZ: 3.6,                      // "said to reach": the dotted ceiling on the ruler and the frame
    simZ: { small: -0.8, keeper: 0.4, prize: 1.4, trophy: 2.2, elder: 2.95, ancient: 3.35 },   // the z each class is simulated at (brief §5.5)
    giantsOnly: 2.65,                 // Elders roll only where giants live (holdsGiants places, residents, Marked Fish, P4 Underdepth) …
    elsewhereMaxZ: 2.64,              // … everywhere else z is clamped to a top Trophy
    classMaxZ: { keeper: 1.039, prize: 1.879, trophy: 2.64, elder: 3.6 },   // maxClass → z clamp (fry water: prize; Lampwarden: trophy)
    k: { minnow: 0.010, perch: 0.013, crayfish: 0.030, carp: 0.016, koi: 0.015, pike: 0.0075, eel: 0.0016, angler: 0.025,
      ray: 0.012, puffer: 0.030, jelly: 0.020, ghost: 0.010, sturgeon: 0.006 },
    sigma: [0.09, 0.175], giantTailSigma: 0.16, maxReachRatio: 2.8,       // validated: σ range, ≥ 2 giant tails per lake, ceiling ≤ 2.8 × median
    elderKeeperRatio: { elderZ: 3.0, keeperZ: 0.4, range: [1.58, 2.0] }, // an Elder is ≈ 1.6–2.0× a typical Keeper's length
    legend: { sigma: 0.02, minRatio: 1.4, growthWeight: 0.07, growthLength: 0.023, growthCap: 1.5 },   // authored; ≥ 1.4× the lake's longest reach; +7% per landing, cap × 1.5 weight
    // value / food / oil from z (brief §6.2): value = round(species.value × factor × clamp(e^(perZ·z)) × classBonus × QUALITY.valueMult × streak)
    value: { factor: 0.66, perZ: 0.45, clamp: [0.6, 6], classBonus: { trophy: 1.25, elder: 1.6 } },
    // food / oil = species.food|oil × factor × clamp(e^(0.3z)) × QUALITY.yieldMult (× Far Water on rendered oil). factor = sizeKMean /
    // mix (0.942 / 1.201) keeps the average yield at today's (a Mossmere common renders ≈ 17 oil, brief §3.4; validated from the mix).
    yield: { perZ: 0.3, clamp: [0.7, 2.5], factor: 0.784, mix: 1.201 },
    valueMix: { mu: [[0, 0.25], [0.3, 0.3], [0.6, 0.25], [1.0, 0.15], [1.5, 0.05]], giantShare: 1 / 3, sizeKMean: 0.942, multiplier: 1.428 },   // the normaliser behind 0.66 (roster-v3)
    // size → fight (brief §5.5), applied to species.difficulty BEFORE createReel; g = e^(gPerZ · z)
    fight: {
      gPerZ: 0.2, powerExp: 1.6, powerExpBy: { sinker: 1.15, sulker: 1.15 }, staminaExp: 1.0, surgeTimeExp: 0.5,
      sweetExp: -0.5, sweetMin: 0.4, erraticPerZ: 0.08, erraticMax: 0.9, surgeEveryExp: -0.6,
      elderZ: 2.65, elderStep: 1.08, elderStaminaExp: 1.3,              // above the Elder cut: power × 1.08 × g^(1.6 + age·(z − 2.65)), stamina × g^1.3
      elderAge: { mossmere: 1.2, sporewood: 0.9, glasswater: 0.7, paleabyss: 0.35 },   // old water keeps its oldest fish hard
      legendZ: 0,                                                         // legends fight at z 0 (only the global stamina × 1.4 applies)
    },
    // reel-model edits (fishing-reel.js; brief §5.5): stamina × 1.4 for every fish; easing uses load; fatigue clock
    reel: {
      staminaMult: 1.4,
      easeByLoad: { base: 0.8, perLoad: 0.2 },                            // released: target = −fallBase / (base + perLoad · pw / LS)
      fatigue: { after: 60, perS: 0.01, floor: 0.6, elderFloor: 0.8 },    // non-legendaries: power × max(floor, 1 − perS·(t − after))
      oldTrick: { at: 0.55, warnMult: 0.6, powerMult: 1.3, secondAfter: 0.9, mixedRead: true,   // every Elder, once, when progress first passes 55%
        byStyle: { runner: 'doubleRun', darter: 'doubleRun', sinker: 'sulk', sulker: 'sulk', leaper: 'secondLeap', thrasher: 'bore', steady: 'bore' } },
      // s on a phone, full tackle (T1 targets). "Ancients ≈ 3 min" is checked as median ≤ 180 × 1.15 (T4, skilled) with < 2%
      // time-outs for every species that can be an Elder (validated at k 160); knownGaps are the brief's own gaps, retuned with
      // their verbs (the runner P3, the sulker P4) or kept as an Ancient wall by the brief's own table.
      targets: { elderMedian: 120, ancientMedian: 180, ancientTolerance: 1.15, maxTimeouts: 0.02,
        knownGaps: { blind_scrivener: 'sulker (P4)', the_footnote: 'sulker (P4)', the_unpaid_fare: 'sulker (P4)', candlewake_sturgeon: 'runner (P3), retuned in P4',
          shardspine_eel: 'the brief\'s reel-v3-elders table: T4 Elder 60 / Ancient 1 (an Ancient wall by design)' } },
      // Drag (every fight from T0; the sims' land rates depend on it): while tension T > dragAt and rising, the reel absorbs
      // dT × absorb (Reel tier) and progress slips slipPerAbsorb per unit absorbed. Spooled = progress 0 with cumulative slip
      // > 0.5, any species (the runner only makes it likelier). dragAt = the fitted preset (Set 0.80 below Reel T2).
      drag: { from: 'TACKLE.drag', slipPerAbsorb: 0.08, spooled: { progress: 0, slip: 0.5, species: 'any' } },
      // fight verbs, one per lake (P3 runner, P4 sulker; simulated in tools/sim/reel-v3.mjs before their code)
      runner: { hissTell: 0.8, runTime: 'surgeTime × 2√g', holdTMult: 1.8, releaseLossPerS: 0.05, turnTime: 2, turnMult: 1.5, phase: 3 },
      sulker: { every: [10, 14], time: [4, 6], holdCreep: 0.3, minRelease: 0.3, liftGain: 0.04, phase: 4 },
      foul: { chance: 0.15, warn: 0.3, spike: 0.15 },                     // §24's foul rule, reused at the Gatehouse Door and the Chain Garden
    },
  },

  // ---- The float's favour μ (brief §5.1, §6.1): one formula, shown as 0–5 ink notches by family.
  favour: {
    cap: 1.8,
    notches: [0.15, 0.45, 0.8, 1.2, 1.6],          // μ < 0.15 → 0 notches … μ ≥ 1.6 → 5
    families: ['place', 'hour', 'match', 'tackle', 'signs', 'pressure'],
    place: { inside: 0.15, astir: 0.35, window: [0.2, 0.6] },            // astir replaces inside; a place's live window adds its own value (§7)
    hour: { dusk: 0.2, dawn: 0.2, nightRise: 0.25, hush: 0.2, farWaterPerDawn: 0.06, farWaterCap: 0.24 },
    match: { condition: 0.3, rumour: 0.3 },                               // the species' field-note condition; today's rumour (that species at that place)
    tackle: { bait: { ember_roe: 0.35 }, cutStrip: 0.3, lure: { glimmer_spoon: 0.2, bone_jig: 0.2, moth_popper: 0.2, lantern_lure: 0.4 },
      depthLowerThird: 0.25, cleanCast: 0.1 },
    signs: { strike: 0.6, nervous: 0.3, bubbles: 0.2, letItPass: 0.15, letItPassCap: 0.3 },
    pressure: { perCatch: -0.12, floor: -0.6, quietAt: -0.36, reset: 'dawn' },   // "The water here has gone quiet." at 3 catches
    // The float is shown before the bite, so it must not leak the rolled species: its μ = the species-independent terms
    // (place, hour incl. Far Water and Hush, signs, pressure, Clean Cast, a bait's or lure's base term) + each species-specific
    // term (depth lower third, family lures, Cut Strip, Match condition, today's rumour) taken as the maximum over the bait's
    // eligible pool at that point; a pinned rumour's species (or today's rumour species) is used instead when it is eligible
    // there. The roll then uses the full μ of the rolled species; the measuring card lists the terms that actually applied.
    float: { speciesTerms: 'maxOverEligible', prefer: ['pinnedRumour', 'todaysRumour'], card: 'rolledSpeciesTerms' },
    examples: [                                                           // validated against the notches and the class odds (brief §5.1, §6.1, §2)
      { name: 'decent', terms: [0.15, 0.2, 0.2], mu: 0.55, notches: 2 },
      { name: 'first Prize at the Cupped Hands', terms: [0.15, 0.4], mu: 0.55, notches: 2 },
      { name: 'Elder Mildew Angler setup', terms: [0.15, 0.25, 0.3, 0.35, 0.25], mu: 1.3, notches: 4 },
      { name: 'full setup', terms: [0.35, 0.4, 0.25, 0.3, 0.35, 0.25, 0.1], mu: 1.8, notches: 5 },
    ],
  },

  // ---- Reading the water: six signs replace the feeding-spot mote columns (brief §5.1).
  signs: {
    calmAlive: [2, 4], maxAlive: 6, within: 'castMax + 15', placeShare: 0.5,   // ≥ 50% inside place water on the walking lakes
    kinds: {
      rise:    { every: [4, 9], castR: 2.5, within: 3, waitMult: 0.5, ringScale: 'length', sound: ['plip', 'gulp'] },
      boil:    { castR: 3, within: 8, bite: 0.6, ellipse: 'class', prerolled: true, minClass: 'prize' },
      nervous: { castR: 'edge', predators: 3, favour: 0.3 },
      strike:  { castR: 4, within: 10, favour: 0.6, predators: 3, panned: true },
      bubbles: { castR: 'head', bottom: 2, favour: 0.2 },
      glow:    { night: true, lead: [1, 3], bite: 0.7, brightness: 'length' },
    },
    shadows: ['sight', 'clearWater', 'residents'],                       // visible shadows stay special; no approach shadow before every bite
    legendPool: { ring: 'still', column: 'lowGlimmer' },
  },

  // ---- The bite and the hook (brief §5.4). Merged INTO v1's BALANCE.bite (new keys only; v1's waiting rules stay).
  bite: {
    dragUnder: 0.4,                                   // Prize: a slow 0.4 s drag-under before the "!"
    holdMultFrom: 'prize', holdMult: 1.1,             // Prize+ fish hold the bait 10% longer
    // a lapsed bite (no hook attempt) refunds the cast's general bait (progression.refundBait) and adds +0.15 favour to the next
    // cast in the same water (the same place, or within 6 m of the lapsed bobber), cap +0.3, reset on a hook or after 60 s
    letItPass: { favour: 0.15, cap: 0.3, resetAfter: 60, keepsBait: 'refund', sameWater: { place: true, radius: 6 } },
    pips: { fromClass: 'prize', perfect: 3, normal: 2, rodBonusFrom: 3, lowTension: 0.15, legendaries: false },
    leapReveal: { fromClass: 'prize', time: 0.25, timescale: 0.35, rimFlash: true },
    // the class tells' float animations (s; fishing:tell `dur`): Small's double pop, Trophy's flat slide, Elder's dome (Keeper's
    // plunge has none; Prize's drag-under is `dragUnder` above). `lead` = how long before the bite the tell may begin (s).
    tells: { doublePop: 0.36, flatSlide: 0.5, dome: 0.6, lead: 0.6 },
  },

  // ---- Landing and measuring: the signature beat (brief §5.8, §6.3, §6.4).
  ceremony: {
    skipAfter: 0.6,
    beats: { scoop: [0, 0.6], pose: [0.6, 1.4], cord: [1.4, 2.8], banners: [2.8, 3.6] },
    poses: [{ id: 'palm', below: 0.25 }, { id: 'arms', below: 0.85 }, { id: 'hang', below: 2.0 }, { id: 'alongside', below: Infinity }],   // by length (m); legends always alongside
    alongside: { foot: 'walksLength', raft: 'cordUnrolls' },              // on the raft (deck ≈ 2 × 2.6 m) the Wick stays on deck; the cord unrolls along the fish and the camera tracks it
    // The ceremony is a cinematic state: gameplay modules freeze (survival's phase clock and drains, combat's enemies and
    // director, fishing's bite timers) while actors, render, ui and audio run in real time. During an active swarm window every
    // class plays the short 1.2 s variant so the arena is never hidden for long.
    cinematic: { freezes: ['survival', 'combat', 'fishingTimers'], realTime: ['actors', 'render', 'ui', 'audio'], duringSwarm: 1.2 },
    wickHeight: 0.85,
    camera: { base: 1.2, perM: 1.6, min: 1.6, max: 16, craneAbove: 4, craneElev: 50 },   // trophy distance clamp(1.2 + 1.6·L, 1.6, 16) m
    ancientThread: 'gold', mmBelow: 20,                                  // lengths under 20 cm print in mm (the Cupbearer, the Quayling's fry)
    nearMiss: { estimate: 0.08, fromClass: 'prize' },                    // near-miss card: estimated class and length ±8%
  },
  records: {
    oldLedgerZ: 2.3, oldLedgerMemories: 5,            // a figure "since before the Fall" at mid-Trophy for every species
    // 48 species × 3 classes, minus the Lampwarden's Elder seal (it caps at Trophy, brief §6.1, as the Quayling's Keeper cap
    // drops its seals) = 143, plus 4 legend seals. Every other Elder seal has a route (validated: kept place with giantsKept, or a
    // holdsGiants place whose water depth and hours the species can use).
    seals: { classes: ['prize', 'trophy', 'elder'], species: 48, total: 143, legend: 4, noElder: ['lampwarden_angler'] },
    escapeEstimate: 0.08,
    tallyPosts: { live: 2, canvas: [128, 64] },
    elderLog: ['name', 'cm', 'kg', 'place', 'expedition', 'day', 'wick', 'ancient', 'lost'],
  },

  // ---- Oil (brief §3.4): oil/s = stats.oilDrain × zone.drain.oil × context[phase] × Far Water night factor.
  oil: {
    context: {
      raft: { calm: 0.35, dusk: 0.5, gloomtide: 1.0, dawn: 0.35 },       // sailing or moored (raft night 1.0 in all modes)
      foot: { calm: 1.0, dusk: 1.0, gloomtide: 1.4, dawn: 1.0 },
      lamp: { calm: 0.35, dusk: 0.35, gloomtide: 0.7, dawn: 0.35 },      // inside a lit Waylamp's pool, or standing at the moored raft
    },
    lastFlicker: { oil: 12, perDay: 1 },
    gutter: { time: 25, light: 2.5, cast: false, renderRelights: true },
    snuffs: { still: ['oil'], lantern: ['oil'], gloomtide: ['oil', 'embers'] },
    checks: { mossmereDay: 28.3, mossmereDay1: 30.1, renderedCommon: 17, footLantern: { day: 7, night: 5 } },   // brief §3.4 arithmetic (validated)
  },
  // ---- Satiety → Well-fed (brief §9.1): no starvation, ever.
  wellFed: { drainMult: 0.5, at: 0.6, effects: { reelSpeed: 0.08, sweetZone: 0.01 }, dawnMendCombat: 1, starvation: false, glyph: true },

  // ---- Far Water (brief §3.4): both begin with the first dawn of an expedition (day 2).
  farWater: {
    favourPerDawn: 0.06, favourCap: 0.24,             // a lake-wide Hour favour
    showsPerDawn: 1, showsCap: 3,                     // resident shows per calm at each giant place
    murk: { always: [1, 2, 3], after: 'odd' },        // moors days 1–3, then odd days only (none on day 4)
    oilPrice: { from: 3, perDay: 0.5 },               // × (1 + 0.5 × max(0, day − 3)) when he moors (day 5: × 2.0)
    render: { perDay: 0.1, floor: 0.6 },              // rendered oil × max(0.6, 1 − 0.1 × (day − 1))
    nightBurn: { from: 2, perNight: 0.15 },           // night oil × (1 + 0.15 × max(0, day − 2))
    hud: { diamonds: 4, homeward: true },
    table: [                                           // brief §3.4, validated against the formulas above
      { day: 2, favour: 0.06, shows: 1, murk: true, oilPrice: 1.0, render: 0.9, nightBurn: 1.0 },
      { day: 3, favour: 0.12, shows: 2, murk: true, oilPrice: 1.0, render: 0.8, nightBurn: 1.15 },
      { day: 4, favour: 0.18, shows: 3, murk: false, oilPrice: null, render: 0.7, nightBurn: 1.3 },
      { day: 5, favour: 0.24, shows: 3, murk: true, oilPrice: 2.0, render: 0.6, nightBurn: 1.45 },
      { day: 6, favour: 0.24, shows: 3, murk: false, oilPrice: null, render: 0.6, nightBurn: 1.6 },
    ],
    rendersPerDay: [1.8, 1.9, 2.3, 2.8, 3.5, 3.7],     // Mossmere commons rendered per day 1–6 (validated)
    targets: { snuffHomeByDay3: 0.03, snuffPastDay4: [0.06, 0.10], lanternAdd: 0.02, medianDays: [3, 5], bargeShare: 0.25 },
  },
  // ---- The Live Well clock (brief §3.4): a marked fish keeps for N nights after it is marked (by Creel tier).
  liveWell: { nightsByCreel: [3, 3, 4, 4, 5], legendSlot: false, legendExpires: false, release: 'dawnAfterLast',
    spoilage: false, valueDecay: false, cargoGrid: false },

  // ---- Night modes (brief §4): chosen per expedition at the Map Table, locked for the expedition.
  nightModes: {
    order: ['still', 'lantern', 'gloomtide'],
    default: 'lantern', firstOuting: 'still', offeredFrom: 2, locked: true,          // flip `default` to 'still' if playtests say so (open question 1)
    still: {
      swarmNights: 'none', window: null, calmRaids: false, wardens: null, snuffBy: ['oil'], embersZero: null,
      xp: { fishMult: 1.4, zoneFactor: false, cinders: false }, kindles: false, pool: 'angler',
      tally: { stillNight: 1 }, snuffTarget: { homeByDay3: 0.03, pastDay4: [0.06, 0.10] }, fightShare: [0, 0],
      hud: { ring: 'never', embers: 'hidden', flare: 'hidden', burn: 'lowOil', wellFed: true },
    },
    lantern: {
      swarmNights: 'even', forecast: 'The Gloom stirs tonight.',
      window: [0.05, 0.50], quietTail: 45,                                 // night k 0.05 → 0.50 (40.5 s); the last 45 s are always quiet
      mult: { spawnRate: 0.55, hpMult: 0.8, maxAlive: 0.6, eliteEvery: 2 }, firstEliteHeat: 3, formationsPerSwarm: 1,
      wardens: { everySwarmNight: 2, hpMult: 0.75, withdrawAtClose: true, at: 0.10 }, calmRaids: false,   // at: night k the Warden rises (inside the 0.05–0.50 window)
      threat: { fodder: 'oil', creelsnatch: 'unmarkedOnly', whileHooked: false, slamSnaps: false, embersFrom: 'telegraphed',
        // the hard rule, closed: while fishing.state is reeling or landing no knockback or shove moves the Wick or the raft,
        // zap taps never release the reel, and a Scorched lets the fight finish before the forced lamp-watch anchors
        knockWhileHooked: false, zapReleasesReel: false, scorchedWhileHooked: 'fightFirst' },
      embersZero: 'scorched', scorched: { oil: -30, lampWatchR: 10, cinders: false, mendAtDawn: true },
      snuffBy: ['oil'], heatOffset: [0, 2, 4, 6], xp: { fishMult: 1.0, zoneFactor: true, cinders: 'swarmNights' }, kindles: true,
      pool: 'all', anglerCap: 'still', reelingSpawnMult: 0.8,
      tally: { stillNight: 1, swarmNight: 4 }, embersLostTarget: [0, 1], snuffTarget: { addToStill: 0.02 }, fightShare: [0.04, 0.07],
      hud: { ring: 'swarmDusk', embers: 'swarmOrHit', embersHitShow: 4, flare: 'swarmDusk', burn: 'lowOilOrSwarm', wellFed: true },
    },
    gloomtide: {
      swarmNights: 'all', window: [0, 1], growth: 6, max: 120, mult: { spawnRate: 1, hpMult: 1, maxAlive: 1, eliteEvery: 1 },
      wardens: { every: 3 }, calmRaids: true, threat: { slamSnaps: true, creelsnatch: 'unmarked', whileHooked: true },   // a fish marked for home is theft-proof in every mode
      embersZero: 'snuffed', snuffBy: ['oil', 'embers'], heatOffset: [0, 4, 8, 12],
      xp: { fishMult: 1.0, zoneFactor: true, cinders: true }, kindles: true, pool: 'all', anglerCap: 'still',
      tally: { night: 'nightsSurvived × (3 + zoneIndex)' }, snuffTarget: { early: [0.25, 0.55], later: [0.2, 0.35] }, fightShare: [0.28, 0.32],
      hud: { ring: 'calmRaidOrDusk', embers: 'always', flare: 'always', burn: 'always', wellFed: true },
    },
    // a watch lamp's pool is r 6; leaving it by more than 10 m during the night cancels the watch and the swarm window starts
    // at the current k (a forced Scorched watch is anchored and cannot be left)
    lampWatch: { modes: ['lantern'], at: 'duskEnd', radius: 6, fishWithin: 10, leaveCancels: 10, cinders: false, hudFromMurkBell: 0.85, perLake: 2 },
    legendQuiet: { glass_sovereign: 'noSpawns', lantern_swallower: { snags: 2, lead: 1.0, spike: 0.2 } },   // Still and Lantern
    hardRule: 'No species, place, size class, favour (μ) or fishing tool exists only with combat on.',
  },
  // ---- Levels and Boons per mode (brief §4.4).
  xpModes: {
    discovery: { species: 2, place: 4, classFirst: 2, dailyCap: 12 },
    banked: { while: ['fishing', 'sailing', 'walking'], offerAt: ['measuringCard', 'dawnBell'], swarmImmediate: true },
    levelsPerDay: { still: [3, 2, 1, 1], lantern: [3, 2.5, 1.5, 2] },
    deepStartPicks: { sporewood: 3, glasswater: 6, paleabyss: 9 }, draftNonAngler: true,
  },

  // ---- Cameras in render's own convention (render.js MODES / PARAM_KEYS; brief §3.7.5, §11 row 19): the camera orbits the
  // focus (the Wick's feet unless `focus` says otherwise) at `elev` degrees and `dist` metres, and looks at focus + aim metres
  // along the view + aimY metres up, so the pitch is atan((dist·sin elev − aimY) / (dist·cos elev + aim)), not elev. Every
  // preset carries all of elev, dist, aim, aimY, fov, ahead, stiff; `portrait` replaces render's v1 widening (fov + 22,
  // dist × 1.38, elev + 7) on foot and in the cove, as §24.5 does; raft presets keep v1's widening.
  cameras: {
    sail: { elev: 24, dist: 15, aim: 6.5, aimY: 1.4, fov: 52, ahead: 0.55, stiff: 3.6 },
    fish: { elev: 28, dist: 13, aim: -2.5, aimY: 0.4, fov: 48, ahead: 0.1, stiff: 3.0 }, fishFallback: { elev: 30, dist: 13.5 },
    reel: { elev: 25, dist: 10, aim: -3, aimY: 0.7, fov: 44, ahead: 0, stiff: 3.4, by: ['lineDistance', 'fightState'], neverBy: 'sizeClass' },
    // the night overview (render MODES.night) blends in only while combat.swarmActive is true (a swarm window or a Gloomtide
    // calm raid), never on the phase alone: Stillnights, Lantern's quiet nights and tail and lamp-watches keep sail / fish
    // framings with the night grade, so true-scale fish and glow trails stay readable at the big-fish hour
    night: { follows: 'swarmActive', blend: 1.6 },
    // trophy: distance clamp(1.2 + 1.6·L, 1.6, 16) m, crane to 50° above 4 m; yaw swings toward the place's landmark by at
    // most ±35° from north and eases back after the card. On foot the occlusion cone and terrain clamp stay on. No landmark
    // (P1, or no place) → no yaw change.
    trophy: { elev: 18, aim: 0, aimY: 0.6, fov: 44, ahead: 0, stiff: 2.4, base: 1.2, perM: 1.6, min: 1.6, max: 16, craneAbove: 4, craneElev: 50,
      yawTo: 'landmarkOf(place)', yawMax: 35, onFoot: { occlusion: true, terrainClamp: true } },
    // hub walk: camera 5.9 m above the Wick's feet and 12.1 m south; pitch ≈ 16°; top of frame ≈ 9° above horizontal
    cove: { elev: 26, dist: 13.5, aim: 0, aimY: 2.4, fov: 50, ahead: 0.2, stiff: 2.6, portrait: { elev: 33, dist: 14, fov: 60 } },
    // the arch close-up: only during the Set Out / Homecoming glides, or while the Wick stands at the look spot on the jetty
    // root with no line out and the fishing state idle (never while fishing or boarding)
    gate: { elev: 12, dist: 11, aim: 0, aimY: 5, fov: 50, ahead: 0, stiff: 2.0, portrait: { elev: 16, dist: 13, fov: 62 },
      triggers: ['glide', 'lookSpot'], lookSpot: { x: -3.5, z: 2, r: 1.5 } },
    // focus = the nearest wing's centre on its gallery floor; aimY = the wing's middle frame band (row 2) above that floor
    wall: { elev: 14, dist: 6, aim: 0, aimY: 2.1, fov: 46, ahead: 0, stiff: 2.4, portrait: { elev: 18, dist: 7.5, fov: 60 }, focus: 'nearestWing', within: 4 },
    // Homecoming close-up: focus = the frame's centre on the wall face (the Wick is placed at the wing's foot, never walked
    // there); distance clamp(1.2 + 1.6·L, 1.6, 7) m; then a 1.2 s pull back to `wall`
    hang: { elev: 10, aim: 0, aimY: 0, fov: 44, ahead: 0, stiff: 2.4, base: 1.2, perM: 1.6, min: 1.6, max: 7, then: 'wall', focus: 'frameCentre', wick: 'wingFoot' },
    pond: { elev: 55, dist: 6, aim: 0, aimY: 0, fov: 44, ahead: 0, stiff: 2.4, portrait: { elev: 62, dist: 7, fov: 58 }, focus: 'pondCentreY0' },
    setout: { elev: 10, dist: 14, aim: 0, aimY: 6, fov: 50, ahead: 0, stiff: 2.0, focus: 'raft' },
    // the boot overlay: a ping-pong arc over the southern half only (the cove is authored for a north-looking camera)
    title: { orbit: { centre: { x: -4, z: -6 }, radius: 24, height: 9, lookAt: { x: -4, y: 4.5, z: -12 }, arcDeg: [-55, 55], period: 90 }, fov: 42, stiff: 2.2 },
    vista: { phase: 4 },
  },

  // ---- Residents and Marked Fish (brief §7.0, §5.7).
  residents: {
    places: 3,                                         // one per holdsGiants place, persistent in meta.residents[lake][place] = {species, z}
    z: { mean: 1.6, sd: 0.6, min: 1.88, max: 3.6 },    // always Trophy or better: Elder 12.4%, Ancient 1.1%, mean z 2.27 (validated)
    weights: { common: 1, uncommon: 2, rare: 3, kept: 3 },
    shows: { calm: 2, dusk: 1, night: 1, kinds: ['boil', 'pass', 'leap'], castR: 3, within: 8, bite: 0.6 },
    reroll: { onLanding: 'nextSetOut', afterInLakeDays: 3 },
    stamp: 'Resident', checks: { elderShare: 0.124, ancientShare: 0.011, meanZ: 2.27 },
  },
  markedFish: { fromClass: 'trophy', max: 6, startProgress: 'min(0.3, 0.5 × pEscape)', replacesResident: true, glint: true },

  // ---- Place rules v3 (brief §7.0): two new rule types and five fields; pressure; Astir in the Mossmere.
  placesV3: {
    fields: ['holdsGiants', 'maxClass', 'resident', 'tally', 'weather'],
    rules: ['sight', 'drift'],
    sight: { biteR: 1.2, bite: [2, 4], spookOthers: 30, hushRangeMult: 2 },
    drift: { speed: 1.5, seamRarity: 0.08 },
    defaultMaxClass: 'trophy', fryMaxClass: 'prize',
    giantsPerLake: 3, mossmereAstirPerDay: 1,
    discovery: { radius: 8, memories: 2, titleCard: 1.2 }, mastery: { catches: 4, minQuality: 'fine', memories: 10 },
    tally: { mossmere: 'floodGauge', sporewood: 'capStem', glasswater: 'brassRuler', paleabyss: 'boneTablet' },
    shortcutsPersist: true, waylampsReset: true,
    // giantsKept: at a place with this flag its kept species alone may roll past the elsewhere clamp and the place's maxClass
    // (an Elder route for a kept rare at a place without residents); every other species there keeps both caps
    giantsKept: { field: 'giantsKept', appliesTo: 'kept species' },
    // the stopgap, per lake: a lake whose places are not in the build (the Mossmere before P2; the other three whenever §24's
    // builds are off) uses RAFT_FALLBACK_V3[zone].giants as its holdsGiants water (the legend-pool rim r 3.2–9, deep pools
    // ≥ 15 m from it, and authored discs to make 3), with one resident each; it ends per lake when that lake's places load
    stopgap: { from: 'RAFT_FALLBACK_V3', sources: 3, rim: [3.2, 9], endsWhen: 'lakePlacesLoaded', residents: true },
    // dropIn targets (the Cupped Hands' bowl, the Gatehouse Door): inside rule.lock of the target the cast lands at the target
    // centre at y 0 without the arc, obstacle and open-water tests; a hooked fish is held inside the target disc (+ hold m) and
    // is drawn only where it is outside obstacle collision; the line runs from the rod tip to the target
    dropIn: { lock: 'rule.lock', landsAt: 'targetCentre', skips: ['arc', 'obstacle', 'openWater'], hold: 0.7, centreOpenMargin: 0.5 },
  },

  // ---- P1–P2 and The Long Descent: effective tackle tiers from per-run UPGRADES (data.upgradeTiers): tier = floor(4 × levels / max
  // levels) over the slot's upgrades (rod 6 → T4 at 6; line 6; reel 7; creel 4). Fixes shock, pips, absorb and the rating index.
  upgradeTiers: { slots: { rod: ['rod_ashwood', 'rod_whalebone'], line: ['line_gut', 'line_silver'], reel: ['reel_brass', 'reel_drag'], creel: ['creel_wicker'] },
    uses: ['shock', 'pipBonus', 'absorb', 'dragAt', 'tackleRating'] },
  // v3 fight stats (STATS keys added by the v3 build; T0 values are the base, TACKLE tiers replace them)
  stats: { shock: { label: 'Shock', base: 0, fmt: 'pct', min: 0, max: 0.6 }, absorb: { label: 'Drag Absorb', base: 0.30, fmt: 'pct', min: 0, max: 0.95 },
    pipBonus: { label: 'Hook Pips', base: 0, fmt: 'int', min: 0, max: 2 }, dragAt: { label: 'Drag Set', base: 0.80, fmt: 'pct', min: 0.6, max: 0.95 } },

  // ---- Generated by tools/sim/reel-v3.mjs --write-rating (skilled, k 400): for each lake and each fitted
  // loadout index rod·25 + line·5 + reel, the largest class landed ≥ 50% against the lake's reference
  // species (0 Small … 4 Elder, −1 none) and the next class's land %. Placeholder until written: matched sets only.
  // @tackleRating-begin (written by `node tools/sim/reel-v3.mjs --write-rating --apply`; do not edit by hand)
  tackleRating: { k: 400, skill: 'skilled', index: 'rod * 25 + line * 5 + reel', classes: ['small','keeper','prize','trophy','elder'], lakes: {
    mossmere: { reference: 'reedjaw_pike', cls: '33333333333333433334333443333333333333343333433344333333333333334333443334433333333333333433344334443333333333333343334433444',
      next: [0, 0, 0, 1, 19, 0, 0, 3, 17, 33, 0, 5, 12, 26, 51, 4, 15, 27, 43, 59, 16, 23, 45, 56, 68, 0, 0, 0, 2, 20, 0, 0, 2, 14, 37, 1, 3, 14, 33, 55, 7, 14, 28, 43, 68, 13, 27, 40, 57, 71, 0, 0, 0, 1, 19, 0, 0, 3, 15, 33, 0, 5, 15, 29, 55, 5, 12, 28, 50, 64, 15, 25, 45, 59, 71, 0, 0, 0, 2, 31, 0, 0, 4, 22, 48, 1, 6, 17, 41, 62, 6, 20, 40, 55, 75, 21, 38, 55, 75, 82, 0, 0, 0, 3, 36, 0, 0, 4, 25, 46, 1, 7, 20, 42, 66, 10, 20, 35, 56, 78, 24, 31, 56, 70, 82] },
    sporewood: { reference: 'mildew_angler', cls: '22333223332233322333223341233322333233332333312334222332233322333233342233423333333333333433344333442233333333333343334433344',
      next: [20, 36, 0, 0, 0, 34, 48, 0, 3, 33, 33, 49, 9, 27, 41, 39, 46, 19, 32, 47, 40, 49, 22, 42, 54, 47, 41, 0, 0, 0, 28, 46, 0, 8, 28, 37, 1, 10, 24, 42, 42, 8, 18, 36, 49, 50, 48, 24, 42, 54, 21, 42, 49, 0, 0, 35, 47, 0, 8, 34, 44, 46, 12, 29, 45, 36, 9, 19, 36, 51, 37, 50, 28, 43, 52, 31, 0, 0, 0, 0, 0, 0, 1, 10, 42, 0, 3, 17, 48, 56, 7, 17, 32, 51, 72, 12, 27, 41, 57, 76, 32, 49, 0, 0, 0, 0, 0, 1, 11, 45, 0, 3, 15, 44, 60, 6, 17, 35, 55, 74, 16, 27, 45, 65, 75] },
    glasswater: { reference: 'mirror_pike', cls: '12233222332233323333233341223322333223332333433334123332233323333233343333422333233333333433334333442233323334333343334433444',
      next: [42, 32, 43, 0, 0, 30, 41, 49, 7, 24, 33, 43, 8, 20, 39, 41, 6, 14, 33, 49, 43, 14, 27, 40, 59, 46, 31, 47, 0, 1, 25, 40, 1, 8, 23, 34, 49, 7, 23, 39, 44, 7, 17, 36, 55, 6, 16, 27, 47, 63, 49, 35, 0, 0, 1, 24, 43, 1, 8, 29, 36, 1, 11, 26, 45, 47, 9, 18, 40, 52, 6, 14, 26, 47, 62, 27, 45, 0, 0, 2, 45, 0, 0, 15, 44, 0, 2, 16, 39, 62, 3, 13, 32, 49, 75, 12, 25, 46, 62, 78, 25, 47, 0, 0, 1, 47, 0, 1, 16, 52, 0, 4, 19, 44, 64, 4, 15, 34, 59, 74, 12, 30, 52, 63, 79] },
    paleabyss: { reference: 'gilt_eyed_eel', cls: '12233223332333323333333331223322333233333333333334122332233323333333333333322233223332333333334333441223322333233333333433334',
      next: [39, 7, 27, 0, 0, 13, 31, 0, 0, 5, 28, 0, 1, 7, 27, 45, 2, 9, 20, 37, 1, 8, 22, 35, 47, 41, 8, 27, 0, 0, 14, 27, 0, 0, 7, 29, 0, 0, 9, 30, 0, 2, 10, 28, 42, 3, 10, 18, 33, 50, 36, 10, 28, 0, 0, 13, 29, 0, 0, 4, 31, 0, 2, 9, 34, 0, 3, 10, 26, 39, 3, 8, 22, 37, 47, 2, 12, 36, 0, 0, 17, 38, 0, 0, 9, 44, 0, 1, 14, 40, 0, 2, 15, 37, 52, 4, 15, 28, 51, 66, 50, 10, 35, 0, 0, 19, 39, 0, 0, 6, 42, 0, 2, 14, 44, 1, 2, 18, 39, 55, 7, 16, 33, 49, 69] },
  } },
  // @tackleRating-end
};

// ---- The roster: 53 species (brief §6.5). Grammar per lake: 3–4 everyday commons → uncommons → rares
// (≥ 2 night-only) → 3–5 place-kept → 1 legendary; plus 2 Wanderers and the Landing's Quayling.
// Existing species keep their v1 / §24 id, tier, behavior and difficulty (the reel core) exactly, so
// tools/sim/reel-v3.mjs reproduces the brief's land rates; v3 adds:
//   size {L50 cm, sigma, body, k g/cm³} (legends: {L50, W50 kg, sigma 0.02}; Pilgrim Salmon: L50 by lake)
//   style  the v3 fight style (steady/darter/sinker/thrasher/leaper + runner (P3) / sulker (P4)); behavior
//          stays the reel core's base until those verbs land
//   family insect | predator | bottom | glow (read only by lures)    prefers  hush | drip | mist (the field-note
//   condition: Match favour +0.3)    oldTrick  from style    phase 1–4 (in the build from that phase)
//   src 'v1' | 'walk' | 'v3'    place / cond (place-kept: eligible only there, under that state)
//   weather (a hard condition gate)    spots {placeId: mult}    maxClass    zones (Wanderers)
// Kept-fish conds extend §24's (buff / deed / reflection / plumbBottom / window) with live (a rhythm's live
// window), target (inside a targets disc), litRow (a Clean Cast within 0.6 m of the Lit Row's centre line) and
// relit (after relighting 3 candle-rafts that day). The brief's `cond` for Hush / Drip / Mist is `weather`
// here, because §24 already uses SPECIES[].cond for place states.
export const FISH_FAMILIES = ['insect', 'predator', 'bottom', 'glow'];
export const FISH_STYLES = ['steady', 'darter', 'sinker', 'thrasher', 'leaper', 'runner', 'sulker'];
export const FISH_SHAPES_V3 = [...FISH_SHAPES, 'sturgeon'];   // + scutes and a shovel snout, from the leviathan profile (P2)
export const WEATHER = ['hush', 'drip', 'mist'];
export const KEPT_CONDS = { buff: 'sequence', deed: 'deed', reflection: 'reflection', plumbBottom: 'plumb', window: 'phaseWindow',
  live: 'rhythm', target: 'targets', litRow: 'targets', relit: 'drifters' };   // cond → the place rule type it needs

// Per-lake fish hue stories (brief §6.6): off-green, distinct per lake. Glows sapphire, never aqua.
export const FISH_PALETTES = {
  mossmere:   { story: 'slate, pewter, rust, ivory', hues: [0x585e66, 0x646a74, 0x7a8494, 0x8a4b3a, 0xe2ddd0], glow: 0xb9a8ff },
  sporewood:  { story: 'plum, amber, rose, cream', hues: [0x5a3d5e, 0x3e2944, 0xffb46a, 0xff7fb0, 0xe8d8b0], glow: 0xffb46a },
  glasswater: { story: 'indigo, ice, violet; glows sapphire, not aqua', hues: [0x1a1f4a, 0x3d4a8a, 0xa8d4ff, 0xb48cff], glow: 0x5cbcff },
  paleabyss:  { story: 'bone, ink, gold, one oxblood', hues: [0xd8d2c0, 0x14130f, 0xe8c66a, 0x8a3a3a], glow: 0xe8c66a },
  cove:       { story: 'pewter with rust fins (the Quayling)', hues: [0x7a8494, 0x9a5a40], glow: null },
};

const SZK = BALANCE_V3.size.k;
const v1sp = (id) => SPECIES.find((s) => s.id === id) || WALK_SPECIES.find((s) => s.id === id);
const sz = (L50, sigma, body) => ({ L50, sigma, body, k: SZK[body] });
// retunes for new species (reel-v3 at k 400, T4 skilled: Ancient 40–55% with a median ≤ 180 s; validated for every Elder-capable species)
const diffMul = (d, m) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, k in m ? Math.round(v * m[k] * 100) / 100 : v]));
const legendSize = (L50, W50) => ({ L50, W50, sigma: BALANCE_V3.size.legend.sigma, body: 'legend', k: v3r(W50 * 1000 / L50 ** 3, 6) });
// clone a v1 / §24 species (never aliased) and add the v3 fields
function sv3(srcId, v3, patch = {}) {
  const s = v3clone(v1sp(srcId));
  const out = { ...s, ...patch, ...v3 };
  if (patch.model) out.model = { ...s.model, ...patch.model };
  return out;
}
// derived fields shared by every row (style → oldTrick; night-only from time; v1 weight range from the size model)
function v3fin(s) {
  s.style = s.style || s.behavior;
  s.night = s.time === 'gloom';
  if (s.rarity !== 'legendary') s.oldTrick = BALANCE_V3.size.reel.oldTrick.byStyle[s.style];
  const L50 = typeof s.size.L50 === 'number' ? s.size.L50 : Math.min(...Object.values(s.size.L50));
  const L = (z) => L50 * Math.exp(s.size.sigma * z + BALANCE_V3.size.tail * Math.max(0, z - BALANCE_V3.size.tailFrom) ** 2);
  const zHi = BALANCE_V3.size.classMaxZ[s.maxClass] ?? BALANCE_V3.size.reachZ;
  const kg = (cm) => v3r((s.size.k * cm ** 3) / 1000, cm < 30 ? 3 : 2);
  if (s.rarity === 'legendary') s.weight = [s.size.W50, v3r(s.size.W50 * BALANCE_V3.size.legend.growthCap, 0)];
  else s.weight = [kg(L(BALANCE_V3.size.z.min)), kg(L(zHi))];   // v1-compatible [min, max] kg (z −2 … the class ceiling)
  return s;
}

export const SPECIES_V3 = [
  // ---------------------------------------------------------------- The Mossmere (12): slate, pewter, rust, ivory
  sv3('dusk_minnow', { size: sz(22, 0.12, 'minnow'), family: 'insect', prefers: 'drip', phase: 1, src: 'v1' },
    { model: { fin: 0x8a4b3a, pattern: 'scales' }, lore: 'They school beneath the raft like thrown pennies, pewter flecked with rust, each one wishing for nothing at all.' }),
  sv3('mossback_perch', { size: sz(36, 0.13, 'perch'), family: 'bottom', prefers: 'hush', phase: 1, src: 'v1' },
    { model: { body: 0x585e66, fin: 0x8a4b3a }, lore: 'A pale lichen tuft takes root on its back by its third winter, and blooms a little more every year it is not caught.' }),
  sv3('gutter_crayfish', { size: sz(19, 0.10, 'crayfish'), family: 'bottom', prefers: 'mist', phase: 1, src: 'v1' }),
  {
    id: 'lampsipper', name: 'Lampsipper', zone: 'mossmere', rarity: 'common', tier: 1, value: 9, food: 16, oil: 18, time: 'gloom',
    depth: [0, 0.5], bait: null, behavior: 'darter', difficulty: diff(1, 'darter'), lightAttract: 2,
    size: sz(26, 0.12, 'minnow'), family: 'insect', prefers: 'mist', phase: 2, src: 'v3',
    model: { shape: 'minnow', body: 0x6a6f7c, belly: 0xe2ddd0, fin: 0xa8644a, glow: 0xd8d0ff, pattern: 'spots', eyes: 'normal', scale: 0.5, mouth: 'up' },
    hint: 'Only at night, in the shallows. It rises to your own lantern.',
    lore: 'Two moth-wing spots on its flanks, an upturned mouth, and a weakness for lanterns. It drinks the light off the water like milk.' },
  sv3('weeping_carp', { size: sz(56, 0.16, 'carp'), family: 'bottom', prefers: 'drip', phase: 1, src: 'v1' },
    { lore: 'Pewter and ivory, streaked as if with tears. The oldest trail barbels like mourning ribbons. They have never once said they were not mourning.' }),
  sv3('candlefin_koi', { size: sz(46, 0.13, 'koi'), family: 'insect', prefers: 'hush', phase: 1, src: 'v1', spots: { lily_maze: 3 } }),
  sv3('reedjaw_pike', { size: sz(70, 0.15, 'pike'), family: 'predator', prefers: 'mist', phase: 1, src: 'v1', reference: true },
    { model: { body: 0x3e4a5c, fin: 0x1c2230, pattern: 'stripes' }, lore: 'Slate-blue, barred like reeds in ink. It lies among the drowned reeds until it forgets it is not one. The old ones carry pale scars from everyone who almost had them.' }),
  sv3('gloam_eel', { size: sz(72, 0.13, 'eel'), family: 'glow', prefers: 'drip', phase: 1, src: 'v1', spots: { buoy_lights: 2 } },
    { model: { body: 0x16142a, glow: 0xb9a8ff }, hint: 'Rises at night, in deep water. Drawn to the glow of Lumen Moss, and to the drowned buoy-lights.',
      lore: 'An ink eel strung with moon-violet lights. It rises only when the Gloom does. Some say it is the Gloom, slowly learning to be a fish.' }),
  {
    id: 'old_portcullis', name: 'Old Portcullis', zone: 'mossmere', rarity: 'rare', tier: 3, value: 40, food: 30, oil: 30, time: 'any',
    depth: [0.6, 1], bait: null, behavior: 'sinker', difficulty: diffMul(diff(3, 'sinker'), { stamina: 0.7 }), place: 'gatehouse_door', cond: 'target', foul: true,   // Ancient 43% / 172 s (was 2% / 289 s)
    size: sz(58, 0.15, 'carp'), family: 'bottom', prefers: 'mist', phase: 2, src: 'v3',
    model: { shape: 'carp', body: 0x5a4438, belly: 0xc8b8a0, fin: 0x2e2622, glow: null, pattern: 'spots', eyes: 'normal', scale: 1.15, barbels: 'long' },
    hint: 'Cast through the drowned door of the Gatehouse. Mind the chains.',
    lore: 'A catfish whose barbels hang like a broken portcullis, mottled with the rust of the gate it guards. It has not let anyone through since the Fall.' },
  {
    id: 'cupbearer', name: 'Cupbearer', zone: 'mossmere', rarity: 'rare', tier: 2, value: 48, food: 6, oil: 22, time: 'calm',
    depth: [0.3, 0.5], bait: null, behavior: 'darter', difficulty: diff(2, 'darter'), place: 'cupped_hands', cond: 'live', mm: true,
    size: sz(8, 0.09, 'minnow'), family: 'insect', prefers: 'drip', phase: 2, src: 'v3',
    model: { shape: 'minnow', body: 0xd8cfb8, belly: 0xf4eee0, fin: 0xb39ae8, glow: 0xe8c66a, pattern: 'none', eyes: 'normal', scale: 0.25, veil: true },
    hint: 'In the stone bowl of the Cupped Hands, while it is full.',
    lore: 'A thumb-sized fish with violet-gold veil fins that lives only in the giant\'s bowl. It is measured in millimetres, and very proud of every one.' },
  {
    id: 'bridgechain_sturgeon', name: 'Bridgechain Sturgeon', zone: 'mossmere', rarity: 'rare', tier: 3, value: 55, food: 34, oil: 30, time: 'any',
    depth: [0.6, 1], bait: null, behavior: 'sinker', difficulty: diffMul(diff(3, 'sinker'), { stamina: 0.7 }), place: 'under_the_span', weather: 'hush',   // Ancient 42% / 168 s (was 2% / 289 s)
    size: sz(70, 0.16, 'sturgeon'), family: 'bottom', prefers: 'hush', phase: 2, src: 'v3',
    model: { shape: 'sturgeon', body: 0x4a4e58, belly: 0xcfcabd, fin: 0x8a4b3a, glow: null, pattern: 'bands', eyes: 'normal', scale: 1.3 },
    hint: 'Under the broken bridge, but only when the water goes still as a mirror.',
    lore: 'Rust scutes run down its back like the links of the chain that held the bridge. The Mossmere\'s longest fish, and it knows it.' },
  sv3('belled_matriarch', { size: legendSize(260, 230), family: 'bottom', phase: 1, src: 'v1', legendPlace: 'bell_pool' },
    { model: { body: 0x6a5a44, glow: 0xd8d0ff, fin: 0x8a7a5c }, lore: 'A harbour bell grew into her skull when she was young. Her scales have gone the colour of tarnished bronze, and she has tolled for the drowned ever since.' }),

  // ---------------------------------------------------------------- Sporewood Pools (12): plum, amber, rose, cream
  sv3('sporebelly_puffer', { size: sz(25, 0.10, 'puffer'), family: 'insect', prefers: 'drip', phase: 1, src: 'v1', spots: { puffball_vent: 3 } }),
  sv3('plumgill_perch', { size: sz(40, 0.13, 'perch'), family: 'predator', prefers: 'hush', phase: 1, src: 'v1' }),
  sv3('capshell_crayfish', { size: sz(24, 0.10, 'crayfish'), family: 'bottom', prefers: 'mist', phase: 1, src: 'v1' }),
  sv3('velvet_ray', { size: sz(67, 0.14, 'ray'), family: 'bottom', prefers: 'hush', phase: 1, src: 'v1', style: 'runner', spots: { mothers_cup: 2, gill_harp: 2 } }),
  sv3('threadling_eel', { size: sz(86, 0.13, 'eel'), family: 'predator', prefers: 'drip', phase: 1, src: 'v1' }),
  {
    id: 'nightbloom_carp', name: 'Nightbloom Carp', zone: 'sporewood', rarity: 'uncommon', tier: 3, value: 40, food: 32, oil: 30, time: 'gloom',
    depth: [0.3, 1], bait: null, behavior: 'sinker', difficulty: diff(3, 'sinker'),
    size: sz(58, 0.17, 'carp'), family: 'bottom', prefers: 'mist', phase: 4, src: 'v3',
    model: { shape: 'carp', body: 0x4a2a4e, belly: 0xe6c8d8, fin: 0x7a4a72, glow: 0xffb46a, pattern: 'scales', eyes: 'normal', scale: 1.2 },
    hint: 'Anywhere in the Pools, but only at night, when its scales open.',
    lore: 'A plum carp whose scales open at night like amber spore-lamps. By day it is just a carp, and a little embarrassed about it.' },
  sv3('mildew_angler', { size: sz(60, 0.16, 'angler'), family: 'glow', prefers: 'mist', phase: 1, src: 'v1', reference: true, spots: { veilwater: 2 } },
    { hint: 'Its lure lights only at night, out where the water is deep.' }),
  sv3('sleepspore_jelly', { size: sz(33, 0.09, 'jelly'), family: 'glow', prefers: 'hush', phase: 1, src: 'v1', spots: { lullaby: 3 } }),
  sv3('harpstring_eel', { size: sz(82, 0.13, 'eel'), family: 'predator', prefers: 'drip', phase: 3, src: 'walk' }),
  sv3('hushcap_koi', { size: sz(50, 0.13, 'koi'), family: 'glow', prefers: 'hush', phase: 3, src: 'walk' }),
  {
    id: 'the_remembered_sun', name: 'The Remembered Sun', zone: 'sporewood', rarity: 'rare', tier: 3, value: 80, food: 26, oil: 46, time: 'calm',
    depth: [0.4, 0.5], bait: null, behavior: 'leaper', difficulty: diff(3, 'leaper'), place: 'drowned_greenhouse', cond: 'litRow', litRowR: 0.6,
    size: sz(45, 0.13, 'koi'), family: 'insect', prefers: 'drip', phase: 4, src: 'v3', proposal: true,
    model: { shape: 'koi', body: 0xe8d8b0, belly: 0xfff6e0, fin: 0xffb46a, glow: 0xffd28a, pattern: 'spots', eyes: 'normal', scale: 1.0, sunDisc: true },
    hint: 'On the Lit Row of the Drowned Greenhouse. Only a clean cast down the very middle of the row.',
    lore: 'The one warm fish in the Pools: a pale-gold disc on each flank, like a sun it has only heard about. The gardeners kept it for the greenhouse, and it kept the greenhouse.' },
  sv3('drifting_grove', { size: legendSize(300, 320), family: 'bottom', phase: 1, src: 'v1', legendPlace: 'mothers_cup' }),

  // ---------------------------------------------------------------- Glasswater Vault (13): indigo, ice, violet; sapphire glows
  sv3('prism_minnow', { size: sz(23, 0.12, 'minnow'), family: 'insect', prefers: 'drip', phase: 1, src: 'v1' },
    { lore: 'When the school turns at once, it flashes ice-blue, and for an instant the water remembers the colour of the sky.' }),
  sv3('glassgill_perch', { size: sz(43, 0.13, 'perch'), family: 'predator', prefers: 'hush', phase: 1, src: 'v1' }),
  sv3('glassblown_puffer', { size: sz(27, 0.10, 'puffer'), family: 'bottom', prefers: 'mist', phase: 1, src: 'v1' }),
  sv3('chime_jelly', { size: sz(36, 0.09, 'jelly'), family: 'glow', prefers: 'hush', phase: 1, src: 'v1', spots: { bell_window: 3 } }),
  sv3('mirror_pike', { size: sz(75, 0.17, 'pike'), family: 'predator', prefers: 'mist', phase: 1, src: 'v1', style: 'runner', reference: true, spots: { mirror_nave: 3 } }),
  sv3('shardspine_eel', { size: sz(85, 0.14, 'eel'), family: 'predator', prefers: 'drip', phase: 1, src: 'v1' },
    { hint: 'Hunts by the sound of breaking, and only at night.' }),
  {
    id: 'vesper_gar', name: 'Vesper Gar', zone: 'glasswater', rarity: 'rare', tier: 4, value: 135, food: 36, oil: 54, time: 'gloom',
    depth: [0.5, 1], bait: null, behavior: 'darter', difficulty: diff(4, 'darter'),
    size: sz(70, 0.15, 'pike'), family: 'predator', prefers: 'hush', phase: 4, src: 'v3', spots: { broken_hymnal: 3 },
    model: { shape: 'pike', body: 0x23285a, belly: 0xc8d0f0, fin: 0xb48cff, glow: 0xb48cff, pattern: 'scales', eyes: 'glow', scale: 1.25, snout: 'needle' },
    hint: 'Deep water at night, thickest where the Broken Hymnal leaves its chord unfinished.',
    lore: 'A needle-jawed gar with violet glass fins that ring on every turn. The copyists said it sang vespers. It only ever sang the one note.' },
  sv3('blind_scrivener', { size: sz(64, 0.16, 'angler'), family: 'glow', prefers: 'mist', phase: 1, src: 'v1', style: 'sulker', spots: { well_of_ledgers: 2 } }),
  sv3('the_unreflected', { size: sz(60, 0.13, 'perch'), family: 'insect', prefers: 'hush', phase: 3, src: 'walk' }),
  sv3('the_footnote', { size: sz(51, 0.13, 'perch'), family: 'bottom', prefers: 'mist', phase: 3, src: 'walk', style: 'sulker' }, { model: { pattern: 'marks' } }),
  sv3('rainglass_darter', { size: sz(39, 0.11, 'minnow'), family: 'insect', prefers: 'drip', phase: 3, src: 'walk' }),
  {
    id: 'the_sexton', name: 'The Sexton', zone: 'glasswater', rarity: 'rare', tier: 4, value: 150, food: 42, oil: 60, time: 'any',
    depth: [0.85, 0.95], bait: null, behavior: 'thrasher', difficulty: diffMul(diff(4, 'thrasher'), { stamina: 0.65 }), place: 'bell_window', cond: 'deed',   // Ancient 40% / 145 s (was 1% / 293 s)
    size: sz(66, 0.15, 'carp'), family: 'bottom', prefers: 'hush', phase: 4, src: 'v3', proposal: true,
    model: { shape: 'carp', body: 0x1e2350, belly: 0xd0d8f0, fin: 0x3a3f7a, glow: 0xa8d4ff, pattern: 'spots', eyes: 'glow', scale: 1.25, bellPatch: true },
    hint: 'Under the Bell-Chapel Window, during the Struck Hour.',
    lore: 'Deep indigo, with a pale bell-shaped patch on each flank. Every time it turns, something far below tolls, muffled, as if through a closed door.' },
  sv3('glass_sovereign', { size: legendSize(300, 210), family: 'glow', phase: 1, src: 'v1', legendPlace: 'fallen_chandelier' },
    { hint: 'At night, in the deepest water, a Prism Moth draws a crown of light.' }),

  // ---------------------------------------------------------------- The Pallid Deep (13): bone, ink, gold, one oxblood
  sv3('ossuary_fry', { size: sz(23, 0.12, 'minnow'), family: 'insect', prefers: 'mist', phase: 1, src: 'v1' }),
  sv3('pallid_wraithfin', { size: sz(46, 0.13, 'ghost'), family: 'predator', prefers: 'hush', phase: 1, src: 'v1' }),
  sv3('bonecrook_crayfish', { size: sz(27, 0.10, 'crayfish'), family: 'bottom', prefers: 'drip', phase: 1, src: 'v1' }),
  sv3('gilt_eyed_eel', { size: sz(131, 0.16, 'eel'), family: 'predator', prefers: 'mist', phase: 1, src: 'v1', reference: true }),
  sv3('shroud_ray', { size: sz(82, 0.14, 'ray'), family: 'bottom', prefers: 'hush', phase: 1, src: 'v1' }),
  sv3('funeral_veil', { size: sz(42, 0.09, 'ghost'), family: 'glow', prefers: 'drip', phase: 1, src: 'v1' },
    { hint: 'It follows the night the way a widow follows a cart.' }),
  sv3('lampwarden_angler', { size: sz(72, 0.14, 'angler'), family: 'glow', prefers: 'mist', phase: 1, src: 'v1', style: 'sulker', maxClass: 'trophy',
    spots: { sunken_belfry: 2, the_bottomless: 1.5 } }, { hint: 'Its lamp answers only Ember Roe, and only at night.' }),
  sv3('the_clapper', { size: sz(66, 0.15, 'carp'), family: 'bottom', prefers: 'drip', phase: 3, src: 'walk' }),
  sv3('wax_bearer', { size: sz(127, 0.13, 'eel'), family: 'glow', prefers: 'hush', phase: 3, src: 'walk' }),
  sv3('the_unpaid_fare', { size: sz(87, 0.14, 'ghost'), family: 'bottom', prefers: 'mist', phase: 3, src: 'walk', style: 'sulker' }),
  {
    id: 'candlewake_sturgeon', name: 'Candlewake Sturgeon', zone: 'paleabyss', rarity: 'rare', tier: 4, value: 250, food: 56, oil: 84, time: 'gloom',
    depth: [0.85, 0.95], bait: null, behavior: 'sinker', difficulty: diff(4, 'sinker'), place: 'chain_garden', cond: 'live',
    size: sz(133, 0.175, 'sturgeon'), family: 'bottom', prefers: 'mist', phase: 4, src: 'v3', style: 'runner', proposal: true,
    model: { shape: 'sturgeon', body: 0x2a2822, belly: 0xeae4d3, fin: 0x8a8070, glow: 0xe8c66a, pattern: 'bands', eyes: 'glow', scale: 1.6 },
    hint: 'In the Chain Garden at night, while the thing below turns.',
    lore: 'Its bone scutes stand along its back like candles nobody lit. They say one lights for every year it is not caught. The biggest fish in the Deep that is not a legend.' },
  {
    id: 'the_namesake', name: 'The Namesake', zone: 'paleabyss', rarity: 'rare', tier: 4, value: 230, food: 44, oil: 72, time: 'any',
    depth: [0.75, 0.85], bait: null, behavior: 'steady', difficulty: diff(4, 'steady'), place: 'long_pier', cond: 'relit', relitN: 3,
    size: sz(62, 0.13, 'perch'), family: 'predator', prefers: 'hush', phase: 4, src: 'v3', proposal: true,
    model: { shape: 'perch', body: 0xe0d8c4, belly: 0xf6f2e6, fin: 0x8a8070, glow: 0xe8c66a, pattern: 'marks', eyes: 'normal', scale: 1.1 },
    hint: 'By the Long Pier of Names, once three candle-rafts have been relit that day.',
    lore: 'Bone-white, with gold marks along its flank that look like handwriting. Each one you land is logged under a name from the pier. No two have ever had the same.' },
  sv3('pale_leviathan', { size: legendSize(850, 3200), family: 'bottom', phase: 1, src: 'v1', legendPlace: 'the_bottomless', renamedFrom: 'pale_leviathan' }, {
    id: 'lantern_swallower', name: 'The Lantern-Swallower', epithet: 'The Ember Under the Kingdom', bait: 'last_candle',
    hint: 'Only a Last Candle. Only at night. Only in the deepest water of the Pallid Deep.',
    lore: 'Older than the kingdom above. On the night the lantern fell it swallowed the great lantern whole, and the ember still glows in its belly.' }),

  // ---------------------------------------------------------------- Wanderers (2) and the Landing (1)
  {
    id: 'pilgrim_salmon', name: 'Pilgrim Salmon', zone: null, zones: ['sporewood', 'glasswater', 'paleabyss'], wanderer: true,
    rarity: 'rare', tier: 3, value: 30, valueByLake: true, food: 30, oil: 34, time: 'dawn', depth: [0.3, 0.8], bait: null,
    behavior: 'darter', difficulty: diff(3, 'darter'), homeward: { within: 20, calmSeconds: 30 }, perLakePerRealDay: 1,
    size: { L50: { sporewood: 66, glasswater: 76, paleabyss: 87 }, sigma: 0.13, body: 'pike', k: SZK.pike },
    family: 'predator', prefers: 'drip', phase: 3, src: 'v3', style: 'runner',
    model: { shape: 'pike', body: 0x6a4a3e, belly: 0xd8c4b0, fin: 0x8a4b3a, glow: null, pattern: 'scales', eyes: 'normal', scale: 1.2, jaw: 'hooked' },
    hint: 'At dawn, and for a little while after, near the stone that points home. Once a day in each lake.',
    lore: 'A rust-jawed salmon with frayed fins, always going down, never coming back. It grows a little with every lake it passes through.' },
  {
    id: 'hearthfish', name: 'Hearthfish', zone: null, zones: ['mossmere', 'sporewood', 'glasswater', 'paleabyss'], wanderer: true,
    rarity: 'rare', tier: 3, value: 28, valueByLake: true, food: 24, oil: 40, time: 'gloom', depth: [0, 1], bait: null,
    behavior: 'leaper', difficulty: diff(3, 'leaper'), ownLight: true, minOilFrac: 0.75,
    size: sz(32, 0.12, 'koi'), family: 'glow', prefers: 'hush', phase: 3, src: 'v3',
    model: { shape: 'koi', body: 0x2a2422, belly: 0x6a3a2a, fin: 0x4a3a32, glow: 0xff9a4a, pattern: 'none', eyes: 'glow', scale: 0.6 },
    hint: 'At night, in any lake, inside your own light, while your lantern is well fed.',
    lore: 'A coal glows in its belly and brightens when it nears a lantern, as if it remembers being warm. It follows good light from lake to lake.' },
  {
    id: 'quayling', name: 'Quayling', zone: 'cove', cove: true, rarity: 'common', tier: 1, value: 0, noSale: true, food: 4, oil: 4,
    time: 'any', depth: [0, 1], bait: null, behavior: 'darter', difficulty: diff(1, 'darter'), maxClass: 'keeper',
    size: sz(14, 0.10, 'minnow'), family: 'insect', prefers: 'drip', phase: 3, src: 'v3',
    model: { shape: 'minnow', body: 0x7a8494, belly: 0xdde2e8, fin: 0x9a5a40, glow: null, pattern: 'scales', eyes: 'normal', scale: 0.3, curiousEye: true },
    hint: 'Off the Landing\'s jetty. Old Murk will not buy it.',
    lore: 'A quayside minnow with rust-flecked fins and one curious eye. It lives in Murk\'s front yard and has opinions about him.' },
].map(v3fin);
export const SPECIES_V3_BY_ID = Object.fromEntries(SPECIES_V3.map((s) => [s.id, s]));
// Elder names (brief §5.8): "Old Ninefin". A name is pre + core + suffix, seeded by the fish; lakes lend the core.
export const ELDER_NAMES = {
  pre: ['Old', 'Grey', 'Widow', 'Mother', 'Father', 'Parson', 'Captain', 'Granny', 'Uncle', 'Lady'],
  core: {
    mossmere: ['Nine', 'Rust', 'Bell', 'Chain', 'Moon', 'Toll', 'Gate', 'Buoy'],
    sporewood: ['Hush', 'Spore', 'Plum', 'Lull', 'Root', 'Bloom', 'Gill', 'Cap'],
    glasswater: ['Glass', 'Chime', 'Ledger', 'Prism', 'Hymn', 'Frost', 'Quill', 'Mirror'],
    paleabyss: ['Bone', 'Wax', 'Coin', 'Shroud', 'Candle', 'Ash', 'Fare', 'Psalm'],
    any: ['Ember', 'Tallow', 'Ink', 'Slate'],
  },
  suffix: { minnow: ['fin', 'scale'], perch: ['back', 'fin'], crayfish: ['claw', 'shell'], carp: ['whisker', 'scale'], koi: ['fin', 'tail'], pike: ['jaw', 'tooth'],
    eel: ['tail', 'coil'], angler: ['lamp', 'wing'], ray: ['wing', 'cloak'], puffer: ['belly', 'spine'], jelly: ['bell', 'veil'], ghost: ['veil', 'fin'], sturgeon: ['scute', 'snout'] },
};

// Tally Post stones (flood gauges), one per Mossmere place: open water ≥ 1 m from any obstacle, outside every place, ≈ 1.2 m beyond
// the place's edge on its camera side where possible (validated); collision r 0.4 (world adds it with the place props in P2).
const TALLY_AT = { bell_pool: { x: -4, z: -6.8 }, under_the_span: { x: -31.5, z: 5.3 }, cupped_hands: { x: 16, z: 26.2 }, gatehouse_door: { x: 22, z: -0.6 },
  ferry_market: { x: -21.4, z: -21.5 }, sluice_run: { x: -3.2, z: -31.4 }, lily_maze: { x: -40.5, z: 33.2 }, buoy_lights: { x: -44.8, z: -10 } };
// ---- The Mossmere (raft only): 8 places + 1 secret on the existing arena (brief §7.3). Identity: the gate and
// the harbour, a drowned ferry harbour of rust, iron, barges, a toll-gate and buoy-lanterns. Same place schema
// as §24 (CONTRACT §12.4) plus the v3 fields: holdsGiants (Elders may roll; a resident lives here), giantsKept (only the
// kept species may roll Elders here), maxClass, tally (Tally Post style) and tallyAt (its flood-gauge stone, in open water,
// collision r 0.4), landmark (what the trophy camera frames), live (the place's live-window favour), happening (Moonfall).
// All access 'raft'. On every lake world.getDepth inside a place's water is clamped to place.water.depth (CONTRACT §13.7),
// so the authored bands hold whatever the recipe's depth noise says. Footprints stay clear of island collision (validated
// against world-layout: island discs never overlap a place disc; ≥ 80% of a place's water is open; dropIn targets have an
// open centre). Places, props and cracks join the arena in P2 (the Moon Cistern in P4); the watch-lamps from P1.
export const MOSSMERE_V3 = {
  palette: { accent: 0x8a4b3a },                     // rust iron leads (chains, bells, buoys, the gate, the bridge); moon-silver stays the glow
  landmarks: [
    { id: 'sunken_gate', name: 'The Sunken Gate', x: 0, z: -54, note: 'and its leaning toll-tower (N)' },
    { id: 'moon_eye', name: 'The Moon-Eye', x: -21.4, z: -25.9, note: 'a ceiling fissure; its silver shaft falls on the Ferry-Market (NW)' },
    { id: 'sluice_veil', name: 'The Sluice Veil', x: 58, z: 4, note: 'water spilling from a broken aqueduct down the east cliff' },
    { id: 'toppled_bridge', name: 'The Toppled Bridge', x: -29.5, z: 0.5, note: 'the in-lake landmark (W)' },
  ],
  props: [                                           // new collision added with the places (arena.pillars when V3 ≥ P2)
    { x: 16, z: 18, r: 2.2, kind: 'hands', name: 'The Cupped Hands' },
  ],
  // art-only props (no collision of their own: they sit inside existing collision) and the harbour re-dress (W9, P2)
  dressing: [
    { id: 'gatehouse_face', kind: 'gatehouseFace', x: 22, z: -3.6, yawDeg: 0, w: 4, h: 3.5, note: 'a stone wall-face with a flooded door frame on the Drowned Gatehouse\'s south rim (inside the island collision); the tower column art stays', calls: 0 },
  ],
  redress: [                                         // P2 world item W9; draw calls counted in DESIGN §25.8.8
    { id: 'span_arches', what: 'arch spans and a broken deck over the four bridge piers; the chains hang from the break', calls: 1 },
    { id: 'sluice_veil', what: 'the Sluice Veil: a scrolling water-curtain card down the east cliff and two aqueduct segments (the Cupped Hands\' spout hangs from the near one)', calls: 2 },
    { id: 'bollards', what: 'street lamp-posts on islands and the three lamp pylons become rust bollards and buoy-lanterns (the dock-buoy InstancedMesh; the lamp-post mesh is removed)', calls: 0 },
    { id: 'toll_tower', what: 'a leaning toll-tower on the Sunken Gate', calls: 1 },
  ],
  // the Moon-Eye's shaft is an authored crack (world-layout reads arena.cracks before its procedural ones)
  cracks: [{ id: 'moon_eye', x: -21.4, z: -25.9, width: 2.2, swing: { toward: 'bell_pool', deg: 14, time: 3 } }],
  happening: {                                        // the signature wow: Moonfall (P2). progression owns the schedule; world renders it
    id: 'moonfall', name: 'Moonfall', at: [0.25, 0.70], time: 20, timeMist: 30, place: 'ferry_market', reveal: ['bell_pool'], owner: 'progression',
    // two clear discs, each with its own floor painting: one 256² atlas with 2 cells (128² cells on low, radius × 0.7)
    clear: { k: 1, atlas: 256, atlasLow: 128, lowRadiusMult: 0.7,
      discs: [
        { place: 'ferry_market', x: -21.4, z: -25.9, r: 3.2, paint: { cell: 0, rect: [-24.6, -29.1, 6.4, 6.4], shows: 'moored barges, a toll-house clock stopped at the hour of the Fall, cart wheels' } },
        { place: 'bell_pool', x: -4, z: -14, r: 3.2, paint: { cell: 1, rect: [-7.2, -17.2, 6.4, 6.4], shows: 'the drowned harbour bell, verdigris on its crack' } },
      ] },
    fish: [3, 5], guaranteePrize: 1, trophyChance: 0.25,
  },
  // the watch-lamps are the two dock buoy-lamps as world-layout draws them (dock + buoy offset), pool r 6
  watchLamps: [{ id: 'se_buoy', name: 'South-East Buoy-Lamp', x: 19.8, z: 37.8, radius: 6, dock: 0 }, { id: 'w_buoy', name: 'West Buoy-Lamp', x: -46.7, z: 10.1, radius: 6, dock: 4 }],
  places: [
    { id: 'bell_pool', name: 'The Bell Pool', access: 'raft', stand: null, legend: true, x: -4, z: -14, phase: 2,
      water: { kind: 'disc', x: -4, z: -14, r: 6, depth: [0.8, 1] }, attract: { weeping_carp: 2 },
      rule: null, reveal: 'moonfall', maxClass: 'trophy', tally: 'floodGauge', tallyAt: TALLY_AT.bell_pool, build: 'existing',
      landmark: { x: -4, y: 2, z: -14 },
      lore: 'A harbour bell lies nine metres down. In Moonfall you can see her circling it, at whatever she weighs today.',
      look: 'the drowned harbour bell on the pool\'s floor, verdigris on its crack, seen only in Moonfall\'s second disc' },
    { id: 'under_the_span', name: 'Under the Span', access: 'raft', stand: null, x: -29.5, z: 0.5, phase: 2,
      water: { kind: 'path', pts: [[-40, -4], [-19, 5]], w: 8, depth: [0.45, 0.9] }, attract: { mossback_perch: 2, reedjaw_pike: 2 },   // brief 0.6–0.9; 0.45 adds the shallow lip under the broken deck, the night-only Lampsipper's only Elder water
      rule: { type: 'targets', name: 'Threading the Span', lock: 1.6, clean: { favour: 0.3, rarity: 0.2 },
        targets: [{ id: 'gap_w', kind: 'disc', x: -36.5, z: -2.5, r: 1.6 }, { id: 'gap_m', kind: 'disc', x: -29.5, z: 0.5, r: 1.6 }, { id: 'gap_e', kind: 'disc', x: -22.5, z: 3.5, r: 1.6 }] },
      holdsGiants: true, maxClass: 'elder', tally: 'floodGauge', tallyAt: TALLY_AT.under_the_span, build: 'the re-dressed bridge (W9: arch spans and deck over the existing piers) + merged chain strands',
      landmark: { x: -29.5, y: 3, z: 0.5 },
      lore: 'Rust chains hang from the break where the bridge went down. The fish hold in the dark under its three arches.',
      look: 'three dark arch gaps under hanging chains' },
    { id: 'cupped_hands', name: 'The Cupped Hands', access: 'raft', stand: null, x: 16, z: 18, phase: 2,
      water: { kind: 'disc', x: 16, z: 18, r: 7, depth: [0.35, 0.8] }, attract: { weeping_carp: 2, reedjaw_pike: 1 },
      // the hands cup a pool AT WATER LEVEL (y 0; §24.4's one water plane): the bowl is a dropIn target inside the hands'
      // collision; the aqueduct spout pours into it from above, and "overflow" is a spill ring (r 2.2–4) where the fry spill out
      bowl: { id: 'bowl', kind: 'disc', x: 16, z: 18, r: 0.5, y: 0, depth: [0.3, 0.5], attract: { dusk_minnow: 3 }, dropIn: true },
      spill: { r: [2.2, 4], during: 'live' },
      rule: { type: 'rhythm', name: 'The Aqueduct Coughs', period: 60, periodDrip: 25, warn: 3, live: 6, lock: 1.6, below: { waitMult: 0.5, ring: [2.2, 4] }, mods: { waitMult: 0.5 } },
      live: 0.4, maxClass: 'trophy', giantsKept: true, tally: 'floodGauge', tallyAt: TALLY_AT.cupped_hands, build: 'new: two stone hands 6 m tall cupping a water-level pool under the aqueduct spout (+1 call); the spout hangs from W9\'s aqueduct segment',
      landmark: { x: 16, y: 4, z: 18 },
      lore: 'A giant\'s hands hold a bowl under the broken aqueduct. When it coughs, the bowl overflows, the fry spill out, and the big fish wait below.',
      look: 'two stone hands rising from the water, a spout gurgling above them' },
    { id: 'gatehouse_door', name: 'The Gatehouse Door', access: 'raft', stand: null, x: 22, z: -2.5, phase: 2,
      water: { kind: 'disc', x: 22, z: -2.5, r: 0.7, depth: [0.6, 1] }, attract: { weeping_carp: 2 }, dropIn: true,
      rule: { type: 'targets', name: 'The Drowned Door', lock: 1.6, foul: { chance: 0.15, warn: 0.3, spike: 0.15 },
        targets: [{ id: 'door', kind: 'disc', x: 22, z: -2.5, r: 0.7 }] },
      maxClass: 'trophy', giantsKept: true, tally: 'floodGauge', tallyAt: TALLY_AT.gatehouse_door, build: 'the gatehouse_face dressing: a wall-face with a flooded door frame on the island\'s south rim (the door\'s threshold water is 10.5 m from the island centre, outside its 8.84 m collision)',
      landmark: { x: 22, y: 2, z: -3.6 },
      lore: 'Cast through a drowned door into the dark of a tower. Something in there clanks its chains when it turns.',
      look: 'a flooded doorway in the Gatehouse wall, chains trailing into the dark' },
    { id: 'ferry_market', name: 'The Ferry-Market', access: 'raft', stand: null, x: -21.4, z: -25.9, phase: 2,
      water: { kind: 'disc', x: -21.4, z: -25.9, r: 3.2, depth: [0.4, 0.7] }, attract: { candlefin_koi: 2, weeping_carp: 1.5 },
      rule: { type: 'sight', name: 'Moonfall', during: 'moonfall', fish: [3, 5], guaranteePrize: 1, trophyChance: 0.25 },
      holdsGiants: true, giantsDuring: 'moonfall', maxClass: 'elder', tally: 'floodGauge', tallyAt: TALLY_AT.ferry_market, build: 'Moonfall disc 0 (uClear + its atlas cell)',
      landmark: { x: -21.4, y: 6, z: -25.9 },
      lore: 'The drowned market lies three metres down: moored barges, a toll-house clock stopped at the hour of the Fall, cart wheels.',
      look: 'glass-clear water over barges and a stopped clock, in the moon\'s shaft' },
    { id: 'sluice_run', name: 'The Sluice Run', access: 'raft', stand: null, x: 0, z: -35, phase: 2,
      water: { kind: 'path', pts: [[0, -41], [0, -29]], w: 4, depth: [0.55, 0.9] }, attract: { reedjaw_pike: 2, gloam_eel: 2 },
      // the lane starts 8 m south of the gate centre: outside its Descend pill (5.4 m) and stone ring (6.6 m)
      rule: { type: 'drift', name: 'The Broken Teeth', lane: [[0, -41], [0, -29]], length: 12, speed: 1.5, seamRarity: 0.08, gloomInCalm: 'dusk' },
      holdsGiants: true, maxClass: 'elder', tally: 'floodGauge', tallyAt: TALLY_AT.sluice_run, build: 'pooled foam-seam decals',
      landmark: { x: 0, y: 4, z: -54 },
      lore: 'Water pours through the sluice\'s broken teeth in a lane of white seams. The bobber rides it, and so do the hunters.',
      look: 'white seams racing south from the Moss Sluice' },
    { id: 'lily_maze', name: 'The Lily Maze', access: 'raft', stand: null, x: -40.5, z: 24.5, phase: 2,
      water: { kind: 'disc', x: -40.5, z: 24.5, r: 7.5, depth: [0.3, 0.6] }, attract: { candlefin_koi: 3, weeping_carp: 1 },
      rule: { type: 'sight', name: 'Lanterns Under Snow', glowIsSize: true, heart: { r: 3, needs: 'reed_pole', phase: 4 } },
      maxClass: 'trophy', tally: 'floodGauge', tallyAt: TALLY_AT.lily_maze, build: 'existing instanced pads (local density × 2) + glow-buds',
      landmark: { x: -30, y: 3, z: 14 },
      lore: 'Notched pads in the lee of Mossbell Isle, and koi glowing under them like lanterns under snow. The size of the glow is the size of the fish.',
      look: 'notched lily pads with soft glows beneath' },
    { id: 'buoy_lights', name: 'The Buoy Lights', access: 'raft', stand: null, night: true, x: -48, z: -2, phase: 2,
      water: { kind: 'rect', x: -48, z: -2, w: 4, d: 24, depth: [0.4, 0.8] }, attract: { gloam_eel: 2, lampsipper: 2 },
      rule: { type: 'targets', name: 'The Old Channel', phases: ['gloomtide'], favour: 0.2, gloomMult: 2,
        targets: [{ id: 'row_w', kind: 'rect', x: -49.2, z: -2, w: 1, d: 24 }, { id: 'row_e', kind: 'rect', x: -46.8, z: -2, w: 1, d: 24 }], buoys: 24 },
      maxClass: 'trophy', tally: 'floodGauge', tallyAt: TALLY_AT.buoy_lights,
      // the lake plane is opaque (water.js), so nothing below y 0 shows: the "under-water" lanterns are on-surface, depth-tinted
      // glow decals (the pre-roll technique) under 24 small emissive float caps at y ≈ 0 (one InstancedMesh): 1 call
      build: 'on-surface depth-tinted glow decals + 24 emissive float caps at y 0 (one InstancedMesh, 1 call)',
      landmark: { x: -48, y: 1, z: -14 },
      lore: 'At night the drowned channel-buoys still burn under the water, in two rows, showing the way to a harbour mouth that is not there.',
      look: 'two rows of lanterns burning under the black water' },
    { id: 'moon_cistern', name: 'The Moon Cistern', access: 'raft', stand: null, secret: true, phase: 4, x: 58, z: 4,
      water: { kind: 'disc', x: 63, z: 4, r: 5, depth: [0.6, 1] }, attract: { reedjaw_pike: 3 },
      rule: { type: 'moving', name: 'The Wandering Beam', speed: 0.3, r: 1.5, beamOnly: true },
      holdsGiants: true, ownResident: true, maxClass: 'elder', tally: 'floodGauge', tallyAt: { x: 63, z: 8.4 }, reward: 'reed_pole',
      needs: { shoreNotch: { a: 0, w: 10, depth: 0.8, len: 12 }, veil: 'noCollision' }, clues: ['bubbles', 'rumour', 'dock (49, 6)'],
      landmark: { x: 63, y: 5, z: 4 },
      lore: 'Sail straight through the falling water into a round cistern lit by its own moonbeam.',
      look: 'a curtain of falling water, and silver light behind it' },
  ],
};
// §24's 21 places, kept by id; v3 changes are data-only proposals (▲) to the §24 owner, applied when V3 is on.
export const PLACE_SYNC_V3 = {
  mothers_cup:       { holdsGiants: true, giantsNonLegend: true, breathing: 'spores on the exhale, a ring of rises' },
  lullaby:           { holdsGiants: true, rule: { type: 'sight', name: 'The Sleepers', softCast: 0.5, canopy: 'lily-cap' }, waterDepth: [0.4, 0.85] },   // ▲ shallow sleepers' rim: the Capshell Crayfish's only Elder water
  puffball_vent:     { maxClass: 'prize', dripPeriodMult: 0.5 },
  drowned_greenhouse:{ kept: ['the_remembered_sun'], giantsKept: true },
  gill_harp:         { holdsGiants: true, giantsWhile: 'buff', beacon: 25 },
  veilwater:         { rumourAtNight: true, kept: ['hushcap_koi'], attractAdd: { mildew_angler: 2 }, giantsKept: true },
  fallen_chandelier: { holdsGiants: true, giantsNonLegend: true, giantsAt: 'trench rim' },
  mirror_nave:       { holdsGiants: true, reflections: 'prerolled, true size: pick the biggest' },
  bell_window:       { highCastPerch: true, tackleGate: false, kept: ['the_sexton'], giantsKept: true },
  well_of_ledgers:   { holdsGiants: true, giantsAt: 'bottomLedger' },
  stilled_cascade:   { thaw: { weather: 'drip', time: 40, waitMult: 0.4, favour: 0.3 }, giantsKept: true },
  broken_hymnal:     { attractAdd: { vesper_gar: 3 }, nightOnlyAdd: true },
  burning_glass:     { alignment: { phase: 4, band: 'brightest' } },
  votive_font:       { maxClass: 'prize' },
  the_bottomless:    { holdsGiants: true, giantsNonLegend: true, underdepth: { phase: 4 } },
  long_pier:         { kept: ['the_namesake'], giantsKept: true },
  drowned_almshouse: {},
  chain_garden:      { holdsGiants: true, turnFavour: 0.6, replaces: 'mods.weightBias', shadow: 9, kept: ['candlewake_sturgeon'] },
  sunken_belfry:     { lift: false, giantsKept: true },
  bier_barge:        { giantsKept: true },
  ferry_slip:        { holdsGiants: true, ghostFerry: 'dusk', waterDepth: [0.45, 0.95] },   // ▲ the slip's ramp runs up into the shallows: the Ossuary Fry's and the Bonecrook's Elder water
};
// §24 structural changes routed through its owner (▲): renames, watch lamps, Homeward Waystones, persistence.
export const WALK_SYNC_V3 = {
  renames: { 'paleabyss.lamp.landing_lamp': 'Shore of Last Rafts', 'paleabyss.shape.pd_landing': 'Shore of Last Rafts' },
  // ▲ no holdsGiants water within lampWatch.fishWithin (10 m) of a watch lamp (validated): the Sporewood's are the Greenhouse and
  // Gill Crown lamps (the Gill Harp lamp stood 3 m from a giant place, so a lamp-watch there cost nothing)
  watchLamps: { mossmere: ['se_buoy', 'w_buoy'], sporewood: ['house_lamp', 'crown_lamp'], glasswater: ['harbour_lamp', 'hymnal_lamp'], paleabyss: ['plaza_lamp', 'pier_lamp'] },
  shortcutsPersist: true, waylampsReset: true, knownPlaceStartsLit: true,
  breathingDeep: { live: 0.4 },
  secrets: [
    { id: 'seed_vault', zone: 'sporewood', name: 'The Seed Vault', needs: 'reed_pole', via: 'the Rootmat Shallows', reward: 'seedlight_glass', phase: 4 },
    { id: 'unlit_stacks', zone: 'glasswater', name: 'The Unlit Stacks', needs: 'seedlight_glass', via: 'a light-ink door under the Ledger Stair', reward: 'tuning_fork', phase: 4 },
    { id: 'lantern_hold', zone: 'paleabyss', name: 'The Lantern Hold', needs: 'tuning_fork', via: 'the Belfry note opens a §24 needs shape', reward: 'deep_line', phase: 4 },
  ],
};
// ---- P4 wonder and depth (brief §7.7, §6.4). Found Relics come from the four secrets and are never bought (a Shrine
// category shown as owned); each sends later expeditions back to an earlier lake.
export const FOUND_RELICS = [
  { id: 'reed_pole', name: 'Reed Pole', foundIn: 'moon_cistern', zone: 'mossmere', opens: ['lily_maze heart (r 3)', 'seed_vault (the Rootmat Shallows)'], phase: 4,
    desc: 'A ferryman\'s pole, long enough to push a raft through pads and roots.' },
  { id: 'seedlight_glass', name: 'Seedlight Glass', foundIn: 'seed_vault', zone: 'sporewood', opens: ['unlit_stacks (the light-ink door)'], glintAdd: 2, phase: 4,
    desc: 'A lens ground from a seed-pod. Glints show from 2 m farther, and light-ink becomes legible.' },
  { id: 'tuning_fork', name: 'Tuning Fork', foundIn: 'unlit_stacks', zone: 'glasswater', opens: ['lantern_hold (the Belfry note)'], extraMoonfall: { place: 'bell_pool', perDay: 1 }, phase: 4,
    desc: 'It hums the note the Belfry forgot. Struck at the Bell Pool, the moon looks in once more that day.' },
  { id: 'deep_line', name: 'Deep Line', foundIn: 'lantern_hold', zone: 'paleabyss', opens: ['the Underdepth'], underdepth: { castsPerLegendPoolPerDay: 1, favour: 0.8, elders: true }, phase: 4,
    desc: 'A line that remembers how deep the water goes. Once a day in each legend pool it reaches the Underdepth.' },
];
// Age marks: one detail grows with class on 10 headline species (models-fish, ui-fishart).
export const AGE_MARKS = {
  mossback_perch: 'lichen tuft blooms', weeping_carp: 'barbels become ribbons', gutter_crayfish: 'one more drowned button per class',
  capshell_crayfish: 'its mushroom hat grows', sporebelly_puffer: 'Trophy+ puff into a perfect sphere', reedjaw_pike: 'pale scars',
  shardspine_eel: 'the crystal crest grows', bonecrook_crayfish: 'a crown fragment at Trophy+', bridgechain_sturgeon: 'one more chain link per class',
  candlewake_sturgeon: 'one more scute-candle lit per class',
};
// Vistas (raise the lantern; never sit, never sketch) and Remnants: rules now, stands authored in P4 with the §24 owner.
export const VISTAS = { perLake: 2, hold: 1.5, reveals: 'places in line of sight get a "?" on the Chart', memories: 1, sit: false, sketch: false, camera: 'vista', phase: 4, list: [] };
export const REMNANTS = { perLake: 3, total: 12, gives: ['vignette', 'rumour'], optional: true, phase: 4, list: [] };
// Apply a §24 place's PLACE_SYNC_V3 entry in place (rule merged, waterDepth into water.depth); used by PLACES_V3 and the apply block.
function v3syncPlace(p) {
  const sync = PLACE_SYNC_V3[p.id]; if (!sync) return p;
  const { rule, waterDepth, ...rest } = v3clone(sync);
  Object.assign(p, rest);
  if (rule) p.rule = { ...(p.rule || {}), ...rule };
  if (waterDepth && p.water) p.water = { ...p.water, depth: waterDepth };
  return p;
}
// Raft-lake fallbacks (DESIGN §25.8.1, §25.14): what a lake uses when its places are not in the build — the Mossmere before P2,
// the other three whenever §24's lake builds are off (P1–P3 and Landing v0 may ship without §24). Authored on the v1 arenas with
// world-layout (open water, clear of docks, spawn and gate): `giants` = the stopgap holdsGiants water (the legend-pool rim, deep
// pools ≥ 15 m from it, discs to make 3), one resident each; `watchLamps` = two dock buoy-lamps (pool r 6) with no giant water
// within 10 m; `homeward` = a Homeward Waystone beside a dock ≥ 25 m from the spawn, ≥ 1.5 m from posts and buoys, ≥ 3.8 m from
// the barge pad (validated in the non-walk v3 pass).
export const RAFT_FALLBACK_V3 = {
  mossmere: {
    giants: [{ id: 'mm_legend_rim', kind: 'ring', x: -4, z: -14, r: [3.2, 9] }, { id: 'mm_deep_centre', kind: 'disc', x: 4, z: 6, r: 6 }, { id: 'mm_deep_west', kind: 'disc', x: -16, z: 14, r: 6 }],
    until: 2,   // the Mossmere's places replace it from P2; its watch-lamps and Homeward stone are MOSSMERE_V3's / EXPEDITION's in every build
  },
  sporewood: {
    giants: [{ id: 'sw_legend_rim', kind: 'ring', x: 28, z: -16, r: [3.2, 9] }, { id: 'sw_lullaby_pool', kind: 'disc', x: -28, z: -8, r: 16, deepPool: 'Lullaby Pool' }, { id: 'sw_deep_south', kind: 'disc', x: -27, z: 21, r: 6 }],
    watchLamps: [{ id: 'sw_dock0_buoy', x: 15.4, z: 54.2, radius: 6, dock: 0 }, { id: 'sw_dock1_buoy', x: 52.7, z: 20.5, radius: 6, dock: 1 }],
    homeward: { x: 50.8, z: 21, at: 'beside the east dock', radius: 0.6 },
  },
  glasswater: {
    giants: [{ id: 'gw_legend_rim', kind: 'ring', x: 0, z: -37, r: [3.2, 9] }, { id: 'gw_deep_west', kind: 'disc', x: -34, z: -34, r: 6 }, { id: 'gw_deep_south', kind: 'disc', x: -8, z: 36, r: 6 }],
    watchLamps: [{ id: 'gw_dock0_buoy', x: 17.9, z: 59, radius: 6, dock: 0 }, { id: 'gw_dock4_buoy', x: -50.6, z: 35.2, radius: 6, dock: 4 }],
    homeward: { x: -44.6, z: 41, at: 'beside the south-west dock', radius: 0.6 },
  },
  paleabyss: {
    giants: [{ id: 'pd_legend_rim', kind: 'ring', x: 0, z: -52, r: [3.2, 9] }, { id: 'pd_deep_east', kind: 'disc', x: 16, z: -12, r: 6 }, { id: 'pd_shelf_west', kind: 'disc', x: -58, z: -36, r: 6, note: 'a shelf disc from 0.26 to 0.82 deep: the Ossuary Fry and the Bonecrook have Elder water in raft builds' }],
    watchLamps: [{ id: 'pd_dock0_buoy', x: 42.4, z: 54.7, radius: 6, dock: 0 }, { id: 'pd_dock1_buoy', x: -47.6, z: 50.3, radius: 6, dock: 1 }],
    homeward: { x: 40.8, z: 55.9, at: 'beside the south-east dock', radius: 0.6 },
  },
};
// All 29 places (+4 secrets) with the v3 fields applied, for tools and the Journal (always computed; copies).
export const PLACES_V3 = [
  ...MOSSMERE_V3.places.map((p) => ({ ...v3clone(p), zone: 'mossmere' })),
  ...PLACES.map((p) => v3syncPlace(v3clone(p))),
];
export const PLACE_V3_BY_ID = Object.fromEntries(PLACES_V3.map((p) => [p.id, p]));

// ---- Conditions: one system, three archetypes, per-lake looks (brief §7.1). Rolled each calm, seeded by
// expedition, day and lake; Murk names tomorrow's at dawn; the Map Table shows day 1's for every lake.
export const CONDITIONS = {
  odds: { none: 40, hush: 20, drip: 20, mist: 20 },
  archetypes: {
    hush: { favour: 0.2, waitMult: 1.2, sightRangeMult: 2 },
    drip: { waitMult: 0.8, commonMult: 1.3, rhythmMult: 0.7 },
    mist: { rarity: 0.08, gloomInCalm: 0.3, beaconMult: 1.5 },
  },
  budget: { calls: 4, lowCalls: 2 }, movesGeometry: false,
  looks: {
    mossmere:   { hush: { name: 'Mirror Hush', swell: 0.2, reflections: 'sharp' }, drip: { name: 'Drizzle', streaks: 300, streaksLow: 120, aqueduct: 25 },
      mist: { name: 'Moonmist', mistCards: 3, moonfall: 30 } },
    sporewood:  { hush: { name: 'Damp Hush', greenhouse: 'fogged, every row glows dimly' }, drip: { name: 'Spore-fall', spores: 2, ventMult: 2 },
      mist: { name: 'Bloom-haze' } },
    glasswater: { hush: { name: 'Clear Hush', shafts: 1.5 }, drip: { name: 'Shard-chime', chord: true, cascadeThaw: 40 }, mist: { name: 'Prism-fog' } },
    paleabyss:  { hush: { name: 'Breathless', ash: 'still' }, drip: { name: 'Ash-fall', ash: 2, breathingDeep: 1.5 }, mist: { name: 'Pall', fog: 1.3 } },
  },
};

// ---- Rumours (brief §7.0): 24, 6 per lake; tiers vague → the place → the condition. Murk gives one per visit
// when you sell at least one fish (he prefers undiscovered places and unsolved conditions); the Well of Ledgers
// adds its own. Pin one at a time; solving one gives +3 Memories and a Journal stamp. Every kept species has one.
export const RUMOURS = [
  // The Mossmere
  { id: 'r_cupped_hands', zone: 'mossmere', place: 'cupped_hands', species: 'cupbearer', tiers: ['When the old aqueduct coughs, the stone hands overflow.', 'East of the bridge a giant holds out its hands. Something tiny lives in the bowl.', 'Cast into the bowl while it is full. In Drizzle it fills every few breaths.'] },
  { id: 'r_gatehouse', zone: 'mossmere', place: 'gatehouse_door', species: 'old_portcullis', tiers: ['Something in the Gatehouse still keeps the gate.', 'The Gatehouse door is flooded. Cast through it, not at it.', 'Listen for the chains. Ease off when they clank, or they take your line.'] },
  { id: 'r_span', zone: 'mossmere', place: 'under_the_span', species: 'bridgechain_sturgeon', tiers: ['The bridge kept its chain. Something else kept the bridge.', 'Thread the arches of the Toppled Bridge with a clean cast.', 'It only comes up through the arches when the water stills to a mirror.'] },
  { id: 'r_market', zone: 'mossmere', place: 'ferry_market', species: null, tiers: ['Twice a day the moon looks in on the old market.', 'Between the two Sisters the water goes clear as glass when the moon-shaft swings.', 'In Moonfall you can see them circling. Pick the one you want.'] },
  { id: 'r_buoys', zone: 'mossmere', place: 'buoy_lights', species: 'gloam_eel', tiers: ['The harbour lights never went out. They just went under.', 'Along the west shore, two rows of buoys still burn beneath the water.', 'Only at night. The eels follow the rows like a road home.'] },
  { id: 'r_cistern', zone: 'mossmere', place: 'moon_cistern', species: null, phase: 4, tiers: ['There is a moon behind the falling water.', 'Bubbles rise along the east cliff, by the dock no one uses.', 'Sail into the Sluice Veil. It is only water.'] },
  // Sporewood Pools
  { id: 'r_harp', zone: 'sporewood', place: 'gill_harp', species: 'harpstring_eel', tiers: ['Somewhere in the Pools a harp still knows one song.', 'The Gill Harp sings when its curtains are played in order.', 'While it sings, the striped eels leave the strings.'] },
  { id: 'r_veil', zone: 'sporewood', place: 'veilwater', species: 'hushcap_koi', tiers: ['A koi that only glows in the dark it keeps.', 'The Veilwater, past the Gill Crown, hides behind a veil.', 'Light the spent sporelights and the veil burns away. Then it comes up to look.'] },
  { id: 'r_sun', zone: 'sporewood', place: 'drowned_greenhouse', species: 'the_remembered_sun', phase: 4, tiers: ['The gardeners kept one warm thing down here.', 'In the Drowned Greenhouse, along the Lit Row.', 'A clean cast down the very middle of the row, while it is lit.'] },
  { id: 'r_lullaby', zone: 'sporewood', place: 'lullaby', species: 'sleepspore_jelly', tiers: ['Some fish sleep with their mouths open.', 'Under the lily-caps of the Lullaby you can see the sleepers.', 'Cast softly beside the one you want. A hard cast wakes them all.'] },
  { id: 'r_cup', zone: 'sporewood', place: 'mothers_cup', species: 'velvet_ray', tiers: ['The Mother breathes, and big things breathe with her.', 'At the rim of the Mother\'s Cup the rays grow old.', 'Fish the exhale, when the spores come down and the rises ring.'] },
  { id: 'r_vault', zone: 'sporewood', place: null, species: null, phase: 4, secret: 'seed_vault', tiers: ['The gardeners left seed for a spring that never came.', 'Past the Rootmat Shallows, where no raft goes.', 'A pole would get you through the mat.'] },
  // Glasswater Vault
  { id: 'r_unreflected', zone: 'glasswater', place: 'mirror_nave', species: 'the_unreflected', tiers: ['In the Nave, one fish has no reflection.', 'The Mirror Nave shows two of everything. Almost everything.', 'Cast where the reflection swims, not where the fish seems to be.'] },
  { id: 'r_footnote', zone: 'glasswater', place: 'well_of_ledgers', species: 'the_footnote', tiers: ['Every ledger has something at the very bottom.', 'The Well of Ledgers goes down further than the ledgers do.', 'Only a plumb-perfect cast reaches the bottom ledger.'] },
  { id: 'r_rainglass', zone: 'glasswater', place: 'stilled_cascade', species: 'rainglass_darter', tiers: ['Rain fell into the cascade the moment it froze.', 'Under the Stilled Cascade, while the light lasts.', 'In Shard-chime the falls thaw for a while. Be there.'] },
  { id: 'r_sexton', zone: 'glasswater', place: 'bell_window', species: 'the_sexton', phase: 4, tiers: ['Someone still rings the hour in the Vault.', 'Under the Bell-Chapel Window, where the rope hangs.', 'Pull the rope. While the Struck Hour lasts, it answers.'] },
  { id: 'r_hymnal', zone: 'glasswater', place: 'broken_hymnal', species: 'vesper_gar', phase: 4, tiers: ['A chord that was never finished.', 'At the Broken Hymnal the chimes keep trying.', 'At night the gars come to the chord. Strike on the chime.'] },
  { id: 'r_stacks', zone: 'glasswater', place: null, species: null, phase: 4, secret: 'unlit_stacks', tiers: ['There is a door written in light no one can read.', 'Under the Ledger Stair.', 'Some glass shows what lamps cannot.'] },
  // The Pallid Deep
  { id: 'r_clapper', zone: 'paleabyss', place: 'sunken_belfry', species: 'the_clapper', tiers: ['When the bell rings below, everything listens.', 'The Sunken Belfry rings from underneath.', 'Strike when it tolls. It gives no plunge.'] },
  { id: 'r_wax', zone: 'paleabyss', place: 'bier_barge', species: 'wax_bearer', tiers: ['The dead were sent off with wax on their brows.', 'In the hold of the Bier Barge.', 'Give the dead something first. The hold opens until dusk.'] },
  { id: 'r_fare', zone: 'paleabyss', place: 'ferry_slip', species: 'the_unpaid_fare', tiers: ['A fare still waits for a ferry.', 'At the Empty Ferry Slip, at the lake\'s edge.', 'Only at dusk, and only the first cast.'] },
  { id: 'r_candlewake', zone: 'paleabyss', place: 'chain_garden', species: 'candlewake_sturgeon', phase: 4, tiers: ['Its scutes are candles nobody lit.', 'In the Chain Garden, where the thing below turns.', 'At night, during the Turn, cast at the chains.'] },
  { id: 'r_namesake', zone: 'paleabyss', place: 'long_pier', species: 'the_namesake', phase: 4, tiers: ['Every name on the pier was somebody\'s.', 'By the Long Pier of Names.', 'Relight three candle-rafts in a day, and one more name comes up to be read.'] },
  { id: 'r_hold', zone: 'paleabyss', place: null, species: null, phase: 4, secret: 'lantern_hold', tiers: ['The great lantern had a hold, and the hold had a key.', 'Behind the Sunken Belfry.', 'Strike the right note at the Belfry.'] },
];
// Today's rumour: one per real date at the Map Table, always a holdsGiants place, often its resident (+0.3 there that day).
export const TODAYS_RUMOUR = { perRealDay: 1, giantsOnly: true, residentChance: 0.6, favour: 0.3,
  lines: ['An Elder {species} turns at {place}.', 'Something old feeds at {place} tonight.', '{place} is holding a giant. Murk swears it.'] };

// ---- Tackle: persistent, per slot, bought and fitted at the Gear Bench (brief §5.6). Stats are ABSOLUTE
// (they replace the STATS base for that key; Wicks, outfit, relics and Boons add on top). T2–T4 need a proof
// catch; T3 needs the Sporewood Waystone lit, T4 the Glasswater one. shock = the Rod's surge absorb
// (surgeHoldMult × (1 − shock)); pips = extra hook-hold pips; absorb = the Reel's drag absorb above dragAt.
export const TACKLE = {
  slots: ['rod', 'line', 'reel', 'creel'],
  rod: [
    { tier: 0, id: 'willow_switch', name: 'Willow Switch', castMax: 16, hookWindow: 1.00, slackTime: 1.4, shock: 0, pips: 0, price: 0, proof: null, onSale: 'start' },
    { tier: 1, id: 'ashwood_rod', name: 'Ashwood', castMax: 17.5, hookWindow: 1.04, slackTime: 1.6, shock: 0.08, pips: 0, price: 120, proof: null, onSale: 'start' },
    { tier: 2, id: 'whalebone_rod', name: 'Whalebone', castMax: 19, hookWindow: 1.08, slackTime: 1.8, shock: 0.15, pips: 0, price: 450, proof: 'mossmere_prize', onSale: 'start' },
    { tier: 3, id: 'glassreed_rod', name: 'Glassreed', castMax: 20.5, hookWindow: 1.12, slackTime: 2.0, shock: 0.22, pips: 1, price: 1400, proof: 'sporewood_trophy_or_glasswater_prize', onSale: 'sporewood' },
    { tier: 4, id: 'lantern_spine', name: 'Lantern-Spine', castMax: 22, hookWindow: 1.16, slackTime: 2.2, shock: 0.30, pips: 1, price: 3200, proof: 'glasswater_trophy', onSale: 'glasswater' },
  ],
  line: [
    { tier: 0, id: 'twine', name: 'Twine', lineStrength: 1.00, price: 0, proof: null, onSale: 'start' },
    { tier: 1, id: 'braided_gut', name: 'Braided Gut', lineStrength: 1.15, price: 120, proof: null, onSale: 'start' },
    { tier: 2, id: 'waxed_silk', name: 'Waxed Silk', lineStrength: 1.32, price: 450, proof: 'mossmere_prize', onSale: 'start' },
    { tier: 3, id: 'glass_gut', name: 'Glass-Gut', lineStrength: 1.52, clear: true, price: 1400, proof: 'sporewood_trophy_or_glasswater_prize', onSale: 'sporewood' },
    { tier: 4, id: 'silverthread', name: 'Silverthread', lineStrength: 1.75, slackAdd: 0.2, clear: true, price: 3200, proof: 'glasswater_trophy', onSale: 'glasswater' },
  ],
  reel: [
    { tier: 0, id: 'wooden_winch', name: 'Wooden Winch', reelSpeed: 1.00, sweetZone: 0.16, drag: 'fixed', absorb: 0.30, price: 0, proof: null, onSale: 'start' },
    { tier: 1, id: 'brass_spool', name: 'Brass Spool', reelSpeed: 1.12, sweetZone: 0.17, drag: 'fixed', absorb: 0.45, price: 120, proof: null, onSale: 'start' },
    { tier: 2, id: 'clockwork_reel', name: 'Clockwork', reelSpeed: 1.25, sweetZone: 0.18, drag: 'presets', absorb: 0.58, price: 450, proof: 'mossmere_prize', onSale: 'start' },
    { tier: 3, id: 'whisper_drag', name: 'Whisper Drag', reelSpeed: 1.40, sweetZone: 0.19, drag: 'presets', absorb: 0.68, price: 1400, proof: 'sporewood_trophy_or_glasswater_prize', onSale: 'sporewood' },
    { tier: 4, id: 'tidewheel', name: 'Tidewheel', reelSpeed: 1.55, sweetZone: 0.20, drag: 'presets', absorb: 0.76, price: 3200, proof: 'glasswater_trophy', onSale: 'glasswater' },
  ],
  creel: [
    { tier: 0, id: 'wicker_creel', name: 'Wicker', creelSize: 4, liveWell: 1, nights: 3, price: 0, proof: null, onSale: 'start' },
    { tier: 1, id: 'lidded_creel', name: 'Lidded', creelSize: 5, liveWell: 1, nights: 3, price: 70, proof: null, onSale: 'start' },
    { tier: 2, id: 'double_creel', name: 'Double', creelSize: 6, liveWell: 2, nights: 4, price: 270, proof: 'mossmere_prize', onSale: 'start' },
    { tier: 3, id: 'wellbox', name: 'Wellbox', creelSize: 7, liveWell: 2, nights: 4, price: 840, proof: 'sporewood_trophy_or_glasswater_prize', onSale: 'sporewood' },
    { tier: 4, id: 'ferry_hamper', name: 'Ferry Hamper', creelSize: 8, liveWell: 3, nights: 5, price: 1920, proof: 'glasswater_trophy', onSale: 'glasswater' },
  ],
  proofs: {
    mossmere_prize: [{ zone: 'mossmere', class: 'prize' }],
    sporewood_trophy_or_glasswater_prize: [{ zone: 'sporewood', class: 'trophy' }, { zone: 'glasswater', class: 'prize' }],
    glasswater_trophy: [{ zone: 'glasswater', class: 'trophy' }],
  },
  drag: { presets: { light: 0.70, set: 0.80, firm: 0.90 }, fixed: 'set', fromReelTier: 2, cycle: 'tapReelIcon', slipLoss: 0.08 },
  clearWater: { zones: ['glasswater'], belowLineTier: 3, waitMult: 1.12, favour: -0.1 },
  lostLureFrac: 0.25,
  catalogue: { rod: 5170, line: 5170, reel: 5170, creel: 3100, total: 18610 },
  reference: { mossmere: 'reedjaw_pike', sporewood: 'mildew_angler', glasswater: 'mirror_pike', paleabyss: 'gilt_eyed_eel' },
  // Matched-set tackle rating (brief §5.6; skilled ≥ 50% vs the reference species): [class, next class land %].
  rating: {
    mossmere:   [['trophy', 0], ['trophy', 0], ['trophy', 15], ['elder', 55], ['elder', 82]],
    sporewood:  [['prize', 20], ['prize', 46], ['trophy', 12], ['elder', 51], ['elder', 75]],
    glasswater: [['keeper', 42], ['prize', 40], ['trophy', 11], ['trophy', 49], ['elder', 79]],
    paleabyss:  [['keeper', 39], ['prize', 27], ['trophy', 2], ['trophy', 37], ['elder', 69]],
  },
  // The gear gate (reel-v3 --gate --k 400, skilled; Prize / Trophy / Elder / Ancient land %, T0…T4).
  gate: {
    reedjaw_pike:  [[77, 52, 0, 0], [89, 76, 0, 0], [94, 87, 15, 0], [100, 99, 55, 0], [100, 100, 82, 44]],
    mildew_angler: [[56, 20, 0, 0], [61, 46, 0, 0], [77, 58, 12, 0], [99, 88, 51, 0], [100, 94, 75, 51]],
    mirror_pike:   [[42, 14, 0, 0], [70, 40, 0, 0], [85, 72, 11, 0], [98, 94, 49, 0], [100, 98, 79, 46]],
    gilt_eyed_eel: [[39, 3, 0, 0], [68, 27, 0, 0], [85, 66, 2, 0], [96, 92, 37, 0], [100, 98, 69, 43]],
  },
  legends: {   // novice / skilled / expert, T0…T4 matched; the Lantern-Swallower also on mixed sets
    belled_matriarch:  [[56, 82, 85], [84, 90, 91], [99, 100, 100], [100, 100, 100], [100, 100, 100]],
    drifting_grove:    [[31, 76, 89], [64, 87, 95], [84, 94, 97], [97, 98, 99], [100, 100, 100]],
    glass_sovereign:   [[4, 47, 74], [20, 64, 86], [38, 80, 93], [85, 98, 99], [100, 100, 100]],
    lantern_swallower: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 14, 50], [27, 83, 98]],
    lanternSwallowerMixed: { R3L4E3: [5, 41, 78], R4L4E3: [6, 46, 85], R3L4E4: [20, 77, 97] },
  },
  // Land-rate targets for hooked fish (brief §5.9): [novice, skilled, expert] %, ranges as [lo, hi].
  targets: {
    commons: [97, 99, 100], keeperRares: [85, 95, 99], prize: [70, 90, 97], trophy: [45, 75, 90],
    elderOnCurve: [[0, 15], [15, 35], [25, 45]], elderOnArrival: [0, 10],
    elderT4Reference: [65, 80], ancientT4Reference: [40, 55], elderT4Tolerance: 2.5,
  },
};
// ---- Outfit: the four all-mode per-run upgrades, now persistent (brief §5.6). Effects are per level, in STATS units.
export const OUTFIT = [
  { id: 'chimney', name: 'Thick-Glass Chimney', from: 'lantern_chimney', maxLevel: 3, prices: [80, 240, 600], onSale: 'start', effects: { maxOil: 15, oilDrain: -0.0085 },
    desc: 'Max oil +15 and oil burn −5% per level.' },
  { id: 'brazier', name: 'Rendering Brazier', from: 'raft_brazier', maxLevel: 3, prices: [80, 240, 600], onSale: 'start', effects: { oilYieldMult: 0.10, foodMult: 0.10 },
    desc: 'Oil and food from rendering and eating +10% per level.' },
  { id: 'oars', name: 'Long Oars', from: 'raft_oars', maxLevel: 3, prices: [80, 240, 600], onSale: 'start', effects: { moveSpeed: 0.5, pickupRadius: 0.5 },
    desc: 'Raft speed +0.5 and pickup radius +0.5 per level.' },
  { id: 'boots', name: 'Cork-Soled Boots', from: 'boots_cork', maxLevel: 3, prices: [80, 240, 600], onSale: 'sporewood', effects: { stride: 0.35 },
    desc: 'Stride +0.35 m/s on foot per level.' },
];
// ---- Lures: permanent tackle (brief §5.3). You equip a lure or a bait; a snap loses the lure (replacement 25%).
export const LURES = [
  { id: 'feather_fly', name: 'Feather Fly', depth: 'surface', family: 'insect', attract: 2, favour: 0, riseWaitMult: 0.5, price: 40, onSale: 'start' },
  { id: 'glimmer_spoon', name: 'Glimmer Spoon', from: 'lure_glimmer', depth: 'mid', family: 'predator', attract: 2.5, favour: 0.2, price: 90, onSale: 'start' },
  { id: 'bone_jig', name: 'Bone Jig', depth: 'bottom', family: 'bottom', attract: 2.5, favour: 0.2, price: 120, onSale: 'start' },
  { id: 'moth_popper', name: 'Moth Popper', depth: 'surface', family: null, night: true, attract: 2, favour: 0.2, price: 260, onSale: 'sporewood' },
  { id: 'lantern_lure', name: 'Lantern Lure', depth: 'midDeep', family: 'glow', attract: 2.5, favour: 0.4, price: 1200, onSale: 'glasswater' },
];
// The five combat upgrades stay per expedition as Murk's combat kit, sold only in combat modes at 40% (brief §3.6, §9.3).
export const COMBAT_KIT = { ids: ['lantern_mantle', 'lantern_lens', 'lantern_striker', 'raft_hull', 'raft_hearth'], priceMult: 0.4, modes: ['lantern', 'gloomtide'] };

// ---- The expedition (brief §3.2–§3.5, §3.8). Phase names stay internal (`gloomtide` = night).
export const EXPEDITION = {
  phases: { calm: 180, dusk: 20, gloomtide: 90, dawn: 10 }, calmByMode: { raft: 180, mixed: 180, foot: 185 },
  arrivalHush: 30, hushOn: ['firstDay', 'firstCalmAfterGate'], dayMinutes: 5, day1Minutes: 5.5,
  murk: { day1ArriveAt: 20, warnAt: 0.85, sells: ['sell', 'bait', 'supplies', 'ledger'], combatKit: 'combatModes', tackle: false },
  // Set Out is two steps (CONTRACT §13.1, §13.4): the Map Table confirm stores a plan (meta.pendingSetOut; the chosen Waystone
  // flares); Board (or "Set Out now") walks the Wick to the raft, boards and glides COVE.setOutPath; at the arch line
  // game.setOut(plan) runs. Board is refused without a plan. The tray = meta.tray, filled at home (Murk's bait and supplies,
  // owned lures) and moved into the run at createExpedition; nothing in it comes back (it ends with the expedition).
  setOut: { needs: 'litWaystone', chooses: ['zone', 'character', 'nightMode', 'tray'], card: ['forecast', 'rumour', 'residents', 'marked', 'tackleRating'], glide: 3, autoWalk: 6,
    plan: 'meta.pendingSetOut', boardNeedsPlan: true, trigger: 'archLine', tray: { bait: 'counts', supplies: 'counts', lure: 'owned id or null', equipped: 'bait or lure id' } },
  firstOuting: { zone: 'mossmere', character: 'wick', nightMode: 'still', modeCards: false, line: 'Every night of your first outing is still.' },
  homeward: {
    // beside (not on) the dock, stand or lamp: ≥ 1.5 m from stands, slots, lamps, posts and buoys and ≥ 3.8 m from a barge pad
    // (validated). r 0.6 lantern-stone: raft lakes add a collision circle; walking lakes a walk BLOCK (h 1.4). Raft builds of the
    // §24 lakes use RAFT_FALLBACK_V3[zone].homeward.
    stones: { mossmere: { x: 27.9, z: 39, at: 'beside the south-east dock' }, sporewood: { x: 21.1, z: 30, at: 'at the landward end of the Copse Jetty' },
      glasswater: { x: 3.2, z: 18, at: 'beside the Skiff Steps' }, paleabyss: { x: 4, z: 26, at: 'beside the Cairn Plaza lamp' } },
    radius: 0.6, block: { h: 1.4 }, clearOf: { stand: 1.5, post: 1.5, lamp: 1.5, buoy: 1.5, bargePad: 3.8 },
    minPathFromSpawn: 25, range: 4, hold: 1, phases: ['calm', 'dawn'], rideHome: { phases: ['calm'], whileMoored: true },
  },
  gates: { open: 'forever', toll: 'once', tolls: { sporewood: 180, glasswater: 420, paleabyss: 900 },
    deeper: { phases: ['calm', 'dawn'], oneWay: true, needsLitWaystone: true, tally: 10, tallyNeedsFullCalm: true } },
  deepStarts: { picks: { sporewood: 3, glasswater: 6, paleabyss: 9 }, draftLevels: { sporewood: 9, glasswater: 18, paleabyss: 28 }, draftNonAngler: true,
    heatOffset: { lantern: [0, 2, 4, 6], gloomtide: [0, 4, 8, 12] } },
  linger: { fromNight: 4, heat: 1, modes: ['lantern', 'gloomtide'] },
  snuffed: { lastFlicker: 12, gutter: 25, wake: 'hearth', secondWickPerExpedition: 1, line: 'Murk found your raft drifting.',
    keeps: ['records', 'shells', 'memories', 'tackle', 'outfit', 'lures', 'relics', 'wicks', 'challenges', 'waystones', 'gates', 'shortcuts', 'knownPlaces', 'tallyPosts', 'residents', 'markedFish'],
    loses: ['creel', 'marked'], tallyMult: 0.5, ends: ['bait', 'supplies', 'combatKit', 'level', 'boons', 'kindles', 'heartwax', 'waylamps', 'astir', 'farWater'] },
  tally: { perDawn: 3, perStillNight: 1, perLanternSwarmNight: 4, gloomtide: { base: 3, perZone: 1 }, perLakeCrossed: 10, perLedger: 2, snuffedMult: 0.5, memMultAppliesTo: 'tally' },
  homecoming: { glide: 2, moor: 2, skippable: true, order: 'biggestFirst', actions: ['hang', 'pond', 'sell'], hangReplaces: 'longerOrHigherClass',
    firstMount: { prize: 2, trophy: 6, elder: 15 }, summary: ['days', 'nights', 'fish', 'pbs', 'classFirsts', 'places', 'tally', 'markedCreated', 'nextGoal'] },
  save: { every: 30, onPhase: true, onHidden: true, onPagehide: true, pos: ['x', 'z', 'y', 'mode', 'mooring'], gutterOnLoad: 'snuffed', snap: 'walkGridFor' },
  length: { days: [3, 5], minutes: [16, 26], oneDay: 6 },
};
// ---- The Long Descent: today's one-way roguelite as the prestige mode (brief §3.9; open question 2 = per-run gear).
export const LONG_DESCENT = {
  unlock: { waystonesLit: 4 }, nightMode: 'gloomtide', startZone: 'mossmere', oneWay: true, win: 'lantern_swallower',
  phases: 'BALANCE.phases', heat: 'difficultyFor', farWater: false,
  purse: { start: 20, separate: true }, tackle: 'UPGRADES', startRod: 'twig', persistentTackle: false, persistentOutfit: false,
  marked: false, mounts: false, victoryMount: { species: 'lantern_swallower', chain: 'gilded' },
  counts: ['journal', 'records', 'seals', 'elderLog', 'places', 'challenges', 'memories'],
  rewards: { firstWinMemories: 200, cosmetic: 'ashen_cloak', stone: 'a gilded fifth stone in the sea-gate', records: ['fewestDays', 'deepestSnuff'] },
};

// ---- Economy (brief §9). Persistent Shells; income per in-lake day (average player, Lantern).
export const ECONOMY_V3 = {
  persistentShells: true, welcomePurse: 200, startShells: 20, daysPerHour: 10.7,
  income: {   // landed = eaten + marked + sold; fish = sold × perFish; gross = fish + ledger; net = gross − bait; netHour = net × daysPerHour
    mossmere:   { landed: 5.0, eaten: 1.2, marked: 0.3, sold: 3.5, perFish: 17, fish: 60, ledger: 15, gross: 75, bait: 8, net: 67, netHour: 717 },
    sporewood:  { landed: 4.6, eaten: 1.4, marked: 0.3, sold: 2.9, perFish: 35, fish: 102, ledger: 25, gross: 127, bait: 16, net: 111, netHour: 1188 },
    glasswater: { landed: 4.2, eaten: 1.8, marked: 0.3, sold: 2.1, perFish: 69, fish: 145, ledger: 40, gross: 185, bait: 38, net: 147, netHour: 1573 },
    paleabyss:  { landed: 3.8, eaten: 1.8, marked: 0.3, sold: 1.7, perFish: 114, fish: 194, ledger: 60, gross: 254, bait: 55, net: 199, netHour: 2129 },
  },
  modeMult: { still: 1.03, lantern: 1.0, gloomtide: 0.92 }, qualityMult: 1.15,
  spans: { mossmere: [0, 1.5], sporewood: [1.5, 4.5], glasswater: [4.5, 8.5], paleabyss: [8.5, Infinity] },
  // §9.2: purchases in a sensible order, each placed at the first moment cumulative net covers it (validated ±0.1 h).
  timeline: [
    [0.6, ['rod:1', 'line:1', 'reel:1', 'creel:1']], [0.8, ['outfit:chimney:1', 'outfit:brazier:1']], [1.0, ['bait:heartmoss', 'bait:heartmoss']],
    [1.2, ['toll:sporewood']], [1.7, ['line:2']], [2.1, ['reel:2']], [2.4, ['rod:2']], [2.7, ['creel:2']],
    [2.9, ['lure:feather_fly', 'lure:glimmer_spoon', 'lure:bone_jig']], [3.0, ['bait:glowcap_bulb', 'bait:glowcap_bulb']],
    [3.2, ['outfit:oars:1', 'outfit:boots:1']], [3.4, ['pond:2']], [3.8, ['toll:glasswater']], [4.2, ['outfit:chimney:2', 'outfit:brazier:2']],
    [5.1, ['line:3']], [6.0, ['reel:3']], [6.9, ['rod:3']], [7.1, ['bait:prism_moth', 'bait:prism_moth']], [7.7, ['toll:paleabyss']],
    [8.4, ['lure:moth_popper', 'creel:3']], [10.0, ['line:4']], [10.3, ['bait:last_candle', 'bait:last_candle']], [11.8, ['reel:4']], [13.3, ['rod:4']],
    [13.5, ['outfit:oars:2', 'outfit:boots:2']], [14.6, ['outfit:chimney:3', 'outfit:brazier:3', 'outfit:oars:3', 'outfit:boots:3']],
    [15.2, ['pond:3']], [15.8, ['lure:lantern_lure']], [16.7, ['creel:4']],
  ],
  mainSinks: 28240, meetsAt: 16.7, tolerance: 0.1,
  pond: { tier1: { slots: 3, free: 'firstLivePrize' }, tiers: [{ tier: 2, price: 300, slots: 5, needsNamed: 15 }, { tier: 3, price: 1200, slots: 6, r: 4.0, needsWaystone: 'glasswater' }], maxLength: 1.4, r: 2.8 },
  legendBaits: { heartmoss: 40, glowcap_bulb: 90, prism_moth: 170, last_candle: 320 },
  chum: { id: 'murks_chum', name: "Murk's Chum", price: 30, perVisit: 1, sign: 'nervous', time: 30, replaces: 'tide_chart' },
  cutStrip: { strips: 3, predatorAttract: 2, favour: 0.3, free: true },
  cosmetics: { range: [200, 1500], total: 6000, fishingPower: false },
  sellAtHome: true, sellInLake: true,
};
// ---- Memories (brief §9.4): discoveries bank instantly; the expedition tally is paid on return (× 0.5 if snuffed).
export const MEMORIES_V3 = {
  newSpecies: 3, classFirst: { prize: 1, trophy: 4, elder: 12 }, firstAncientPerLake: 10,
  firstMount: { prize: 2, trophy: 6, elder: 15 }, firstRelease: { prize: 1, trophy: 3, elder: 8 },
  place: { found: 2, mastered: 10 }, rumourSolved: 3, oldLedger: 5, legend: { first: 15, rematch: 8 },
  challenges: { total: 1171, v1: 831, tier4: 185, tier5: 155 },   // the brief prints 1,170; 831 + 185 + 155 = 1,171
  // the one-time pool: 48 species' class rewards minus the Lampwarden's Elder ones (it caps at Trophy: −12 −15 −8); the brief's ≈ 4,600 → ≈ 4,550
  pool: { total: 4550, parts: { challenges: 1171, species: 159, classFirsts: 804, firstMounts: 1089, firstReleases: 568, places: 348, rumours: 72, oldLedger: 240, legends: 60, ancients: 40 } },
  // P1–P2 (today's run structure, before the expedition tally): discoveries bank instantly (new species, class firsts, first
  // releases, places, rumours, Old Ledger); the death screen still pays v1 memoriesFor(summary) with its species row removed
  // (new species already paid) and its nights row replaced per night by the v3 tally's values (a still night 1, a Lantern swarm
  // night 4, Gloomtide v1's nightBase + perZone). Relic costs, shelves and the relic cuts stay v1 until P3 (RELICS_V3 is P3 data).
  interim: { phases: [1, 2], instant: ['newSpecies', 'classFirst', 'firstRelease', 'place', 'rumourSolved', 'oldLedger'], runSummary: 'memoriesFor',
    drop: ['newSpecies'], nights: { still: 1, lanternStill: 1, lanternSwarm: 4, gloomtide: 'v1' }, relics: 'v1' },
  perHour: { target: [120, 180], stillWithin: 0.15, midGame: { lantern: 143, still: 127 } },
  shelves: { fishing: { costMult: 0.55, levels: 46, base: 8800 }, gloom: { costMult: 0.7, levels: 14, base: 3125 } },
  gloomRelics: ['salt_glass_lens', 'first_wick_stub', 'tinderbox', 'barnacle_cloak', 'ember_in_resin'],
  cut: ['old_debt', 'waystone_sporewood', 'waystone_glasswater', 'waystone_paleabyss'], refundOnMigration: true,
  lanterns: 'totalRelicLevels',
};
const RELIC_NEW_V3 = [
  { id: 'measuring_cord', name: 'Measuring Cord', icon: 'cord', maxLevel: 2, costs: [60, 180], effects: {}, special: 'measuringCord', unlock: 'first_prize', shelf: 'fishing',
    desc: 'A knotted cord that has measured a great many fish. L1: the bite tell also shows an estimated length. L2: Prize and bigger hooks get +1 hook-hold pip.' },
  { id: 'murks_spyglass', name: "Murk's Spyglass", icon: 'spyglass', maxLevel: 1, costs: [150], effects: {}, special: 'spyglass', unlock: 'old_ledger_five', shelf: 'fishing',
    desc: 'The forecast reaches two days ahead in every lake, and the Map Table marks the residents you know about.' },
  { id: 'rumour_shell', name: 'Rumour Shell', icon: 'shell', maxLevel: 2, costs: [120, 300], effects: {}, special: 'rumourShell', unlock: 'ten_trophies', shelf: 'fishing',
    desc: 'Hold it to your ear and the water talks. +1 rumour tier per visit to Murk, per level.' },
];
// Relic shelves: costs × 0.55 (Fishing & Exploration) or × 0.7 (Gloom), rounded to 5; cut relics refunded on migration.
export const RELICS_V3 = v3uniq(RELICS, WALK_RELICS, RELIC_NEW_V3)
  .filter((r) => !MEMORIES_V3.cut.includes(r.id))
  .map((r) => {
    const shelf = MEMORIES_V3.gloomRelics.includes(r.id) ? 'gloom' : 'fishing';
    const out = { ...v3clone(r), shelf, baseCosts: r.costs.slice(), costs: r.costs.map((c) => Math.max(5, Math.round((c * MEMORIES_V3.shelves[shelf].costMult) / 5) * 5)) };
    if (r.id === 'seven_knots') out.effects = { lineStrength: 0.05 };   // halved (brief §9.4)
    if (r.id === 'second_wick') out.perExpedition = 1;
    if (r.id === 'remembrance') out.memMultOn = 'tally';
    if (WALK_RELICS.some((w) => w.id === r.id)) out.needsWalk = true;
    return out;
  });
// ---- The Angler pool (brief §4.4): 9 existing fishing, movement and oil Boons + 6 new. No Boon adds favour or opens a place.
export const ANGLER_POOL = ['steady_reel', 'hungry_waters', 'lucky_knot', 'gutsfire', 'lantern_on_the_line', 'gilded_hook', 'swift_oars', 'slow_burn', 'brighter_wick',
  'long_cast', 'patient_line', 'feather_touch', 'night_eyes', 'wanderers_stride', 'quiet_hands'];
export const BOONS_V3 = [
  { id: 'long_cast', name: 'Long Cast', icon: 'cast', rarity: 'common', maxLevel: 3, kind: 'stat', effects: { castMax: 1.5 }, unlock: null, tags: ['fishing', 'angler'],
    desc: '+1.5 m cast range per level.', lore: 'Farther out, the water has not heard of you yet.' },
  { id: 'patient_line', name: 'Patient Line', icon: 'line', rarity: 'common', maxLevel: 3, kind: 'stat', effects: { slackTime: 0.2 }, unlock: null, tags: ['fishing', 'angler'],
    desc: '+0.2 s slack grace per level.', lore: 'A slack line is only a line that is waiting.' },
  { id: 'feather_touch', name: 'Feather Touch', icon: 'hook', rarity: 'common', maxLevel: 3, kind: 'stat', effects: { hookWindow: 0.06 }, unlock: null, tags: ['fishing', 'angler'],
    desc: '+0.06 hook window per level.', lore: 'Strike the way you would wake a friend.' },
  { id: 'night_eyes', name: 'Night Eyes', icon: 'eye', rarity: 'rare', maxLevel: 1, kind: 'stat', effects: {}, unlock: null, tags: ['fishing', 'night', 'angler'],
    proc: { on: 'night', levels: [{ glowTrailRangeMult: 1.5, nightBiteSpeed: 0.10 }] },
    desc: 'Glow trails show from 50% farther, and night fish bite 10% sooner.', lore: 'The dark is full of small lights, once you stop looking for big ones.' },
  { id: 'wanderers_stride', name: "Wanderer's Stride", icon: 'boots', rarity: 'common', maxLevel: 2, kind: 'stat', effects: { stride: 0.3 }, unlock: null, tags: ['movement', 'foot', 'angler'],
    proc: { on: 'foot', levels: [{ footOilMult: 0.9 }, { footOilMult: 0.8 }] },
    desc: '+0.3 m/s on foot and 10% less oil burned on foot, per level.', lore: 'Walk as if the road were glad of you.' },
  { id: 'quiet_hands', name: 'Quiet Hands', icon: 'hand', rarity: 'rare', maxLevel: 1, kind: 'stat', effects: {}, unlock: null, tags: ['fishing', 'angler'],
    proc: { on: 'cast', levels: [{ cleanAt: 0.88 }] },
    desc: 'The Clean Cast window widens: a charge of 0.88 or more counts as clean.', lore: 'Steady hands, quiet water.' },
];
// ---- Wicks (brief §4.5): every quirk gains a fishing half (all modes); the combat half is today's quirk. Either-path unlocks.
export const CHARACTERS_V3 = {
  wick:     { fishing: { id: 'curious_eyes', name: 'Curious', desc: 'Places reveal from 16 m, not 8. The first new species each day gives +1 reroll.', revealRadius: 16, newSpeciesReroll: 1 } },
  taper:    { fishing: { id: 'anglers_ember', name: "Angler's Ember", desc: 'Fish give double XP.', fishXpMult: 2 } },
  stub:     { fishing: { id: 'quick_feet', name: 'Quick Feet', desc: '+0.4 m/s on foot. A cast within 5 s of stopping counts as Clean from a charge of 0.8.', stride: 0.4, cleanAfterStop: 5, cleanAt: 0.8 } },
  tallow:   { fishing: { id: 'slow_melt_oil', name: 'Slow Melt', desc: 'Oil burns 20% slower on foot.', footOilMult: 0.8 } },
  ashwick:  { fishing: { id: 'burned_once', name: 'Burned Once', desc: 'The first surge of every fight is telegraphed 0.3 s longer.', firstSurgeWarnAdd: 0.3 } },
  wayfarer: { fishing: { id: 'shore_sense', name: 'Shore Sense', desc: 'On foot, signs show from 50% farther. The first sister-candle lit in each lake costs no oil.', signRangeMult: 1.5, firstShareFree: true }, needsWalk: true },
};

// ---- Challenges (brief §3.6, §11): today's 30 + §24's tier IV (10) + tier V "The Measure" (8) = 48. "Run" and
// "descent" scope become "expedition". Nine combat-only goals move to the Gloom tab and unlock only combat things.
// `alt` = an either-path requirement (any mode). tab: fishing (tiers I–III) | paths (IV) | measure (V) | gloom.
export const GLOOM_TAB = ['break_a_hand', 'gloombreaker', 'untouched', 'bonfire_night', 'full_flame', 'lamplighter', 'four_silences', 'held_the_crossing', 'far_from_any_candle'];
const CHALLENGE_REWRITES_V3 = {
  first_dawn:         { desc: 'Spend your first night out.', type: 'nightsOut', params: { n: 1 }, scope: 'expedition' },
  ember_hoard:        { desc: 'Reach level 8 in one expedition.', scope: 'expedition' },
  three_nights:       { desc: 'Spend 3 nights out in one expedition.', type: 'nightsOut', params: { n: 3 }, scope: 'expedition' },
  steady_hands:       { desc: 'Land 25 fish.' },
  gloombreaker:       { desc: 'Disperse 500 gloomlings.' },
  unwarded:           { desc: 'Silence a Warden, or land 3 night-only species at Prize or better.', alt: { type: 'nightSpeciesClass', params: { n: 3, class: 'prize' } } },
  down_the_sluice:    { name: 'Down the Sluice', desc: 'Light the Sporewood Waystone.', type: 'lightWaystone', params: { zone: 'sporewood' } },
  long_vigil:         { desc: 'Spend 5 nights out in one expedition.', type: 'nightsOut', params: { n: 5 }, scope: 'expedition' },
  untouched:          { desc: 'Endure a swarm night (night 2 or later) without losing an Ember.', scope: 'expedition' },
  bonfire_night:      { desc: 'Disperse 200 gloomlings in a single night.', scope: 'expedition' },
  full_flame:         { scope: 'expedition' },
  night_angler:       { desc: 'Land 3 fish during a single night.', scope: 'expedition' },
  perfect_10_run:     { desc: 'Set 10 perfect hooks in one expedition.', scope: 'expedition' },
  kindled:            { desc: 'Reach level 15 in one expedition.', scope: 'expedition' },
  heavy_catch:        { desc: 'Land a non-legendary fish over 15 kg.', params: { kg: 15, excludeLegendary: true } },
  catch_100:          { desc: 'Land 100 fish.' },
  shells_1000_run:    { desc: 'Earn 1000 Shells in one expedition.', scope: 'expedition' },
  kindle_one:         { desc: 'Kindle a weapon, or raise an Angler Boon to level 5.', scope: 'expedition', alt: { type: 'boonLevel', params: { pool: 'angler', level: 5 } } },
  lamplighter:        { desc: 'Disperse 2500 gloomlings.' },
  into_the_vault:     { name: 'Into the Vault', desc: 'Light the Glasswater Waystone.', type: 'lightWaystone', params: { zone: 'glasswater' } },
  pallid_arrival:     { desc: 'Light the Pallid Deep Waystone.', type: 'lightWaystone', params: { zone: 'paleabyss' } },
  many_flames:        { desc: 'Land a Trophy in the Glasswater Vault with 3 different Wicks.', type: 'classZoneCharacters', params: { zone: 'glasswater', class: 'trophy', n: 3 } },
  light_comes_up:     { desc: 'Land the Lantern-Swallower.', type: 'catchSpecies', params: { id: 'lantern_swallower' } },
  complete_chronicle: { desc: 'Name every species in the Journal.', params: { n: 53 } },
  shared_flame:       { desc: 'Share your flame with 4 sister-candles in one expedition.', scope: 'expedition' },
  the_long_way_round: { desc: 'Open 3 shortcuts.', scope: 'total' },
  held_the_crossing:  { scope: 'expedition' },
  far_from_any_candle:{ desc: "Endure a swarm night on foot in the Glasswater Vault or deeper without standing in a sister-candle's light.", scope: 'expedition' },
  every_candle:       { desc: 'Share your flame with every sister-candle in the Glasswater Vault in one expedition.', scope: 'expedition' },
  every_still_place:  { desc: 'Master every Place in the three lower lakes.', params: { n: 21 } },
};
const CHALLENGES_T5 = [
  { id: 'first_prize', tier: 5, name: 'First Prize', desc: 'Land your first Prize.', type: 'classCatch', params: { class: 'prize', n: 1 }, scope: 'total', reward: { unlock: 'relic:measuring_cord', memories: 5 } },
  { id: 'first_trophy', tier: 5, name: 'First Trophy', desc: 'Land your first Trophy.', type: 'classCatch', params: { class: 'trophy', n: 1 }, scope: 'total', reward: { unlock: null, memories: 10 } },
  { id: 'first_elder', tier: 5, name: 'First Elder', desc: 'Land your first Elder.', type: 'classCatch', params: { class: 'elder', n: 1 }, scope: 'total', reward: { unlock: null, memories: 20 } },
  { id: 'ten_trophies', tier: 5, name: 'Ten Trophies', desc: 'Land 10 Trophies.', type: 'classCatch', params: { class: 'trophy', n: 10 }, scope: 'total', reward: { unlock: 'relic:rumour_shell', memories: 15 } },
  { id: 'a_full_board', tier: 5, name: 'A Full Board', desc: 'Land a Prize of every non-legendary species in one lake.', type: 'lakeSet', params: { class: 'prize' }, scope: 'total', reward: { unlock: 'cosmetic:rod_tassel', memories: 30 } },
  { id: 'elders_everywhere', tier: 5, name: 'Elders of Every Water', desc: 'Land an Elder in every lake.', type: 'elderEveryLake', params: { n: 4 }, scope: 'total', reward: { unlock: null, memories: 40 } },
  { id: 'old_ledger_five', tier: 5, name: 'Older Than the Ledger', desc: 'Beat 5 Old Ledger records.', type: 'oldLedger', params: { n: 5 }, scope: 'total', reward: { unlock: 'relic:murks_spyglass', memories: 20 } },
  { id: 'brought_home', tier: 5, name: 'Brought Home', desc: 'Bring 3 marked fish home from one expedition.', type: 'markedHome', params: { n: 3 }, scope: 'expedition', reward: { unlock: null, memories: 15 } },
];
export const CHALLENGES_V3 = v3uniq(CHALLENGES, WALK_CHALLENGES, CHALLENGES_T5).map((c) => {
  const out = { ...v3clone(c), ...v3clone(CHALLENGE_REWRITES_V3[c.id] || {}) };
  if (CHALLENGE_REWRITES_V3[c.id]?.params) out.params = { ...v3clone(c.params || {}), ...CHALLENGE_REWRITES_V3[c.id].params };
  if (out.scope === 'run') out.scope = 'expedition';
  out.tab = GLOOM_TAB.includes(c.id) ? 'gloom' : c.tier === 5 ? 'measure' : c.tier === 4 ? 'paths' : 'fishing';
  if (c.tier === 4) out.needsWalk = true;
  return out;
});
export const CHALLENGE_TABS_V3 = { fishing: 'Fishing', paths: 'Paths Underfoot', measure: 'The Measure', gloom: 'Gloom' };
// Cosmetics (never fishing power): Gloom-tab and Measure rewards, the descent's cloak, Murk's post-game shelf.
export const COSMETICS_V3 = [
  { id: 'rod_tassel', name: 'Knotted Rod Tassel', kind: 'rod', unlock: 'a_full_board' },
  { id: 'ashen_cloak', name: 'Ashen Cloak', kind: 'cloak', unlock: null, source: 'longDescentWin' },
  { id: 'oxblood_pennant', name: 'Oxblood Pennant', kind: 'pennant', unlock: null, price: 400 },
  { id: 'slate_dye', name: 'Slate Cloak Dye', kind: 'dye', unlock: null, price: 300 },
  { id: 'amber_glass', name: 'Amber Lantern Glass', kind: 'lanternGlass', unlock: null, price: 600 },
];
// ---- Murk's Ledger (brief §10): 3 persistent requests; one refreshes per completed in-lake day, a lapsed slot after a
// real day; combat requests only in combat modes. +2 tally Memories each.
export const LEDGER = {
  slots: 3, refreshPerInLakeDay: 1, lapseAfterRealDay: true, tally: 2,
  templates: [
    { id: 'l_class', type: 'class', text: 'Bring me a {class} {species}. Alive or not, I want to see it.', class: ['prize', 'trophy'], base: 40, perClass: { prize: 1, trophy: 2.2 }, weight: 3 },
    { id: 'l_variety', type: 'variety', text: 'Three different fish from {zone}, in one expedition.', n: 3, base: 45, weight: 2 },
    { id: 'l_condition', type: 'condition', text: 'Land something in {weather}. The water talks then.', base: 35, weight: 2 },
    { id: 'l_release', type: 'release', text: 'Let a {class} go. The lake keeps count.', class: ['prize', 'trophy'], base: 30, weight: 1 },
    { id: 'l_home', type: 'bringHome', text: 'Bring a marked fish home. I want to see it on your wall.', base: 50, weight: 2 },
    { id: 'l_ledger', type: 'oldLedger', text: 'Beat one of my old figures. Any species.', base: 60, weight: 1 },
    { id: 'l_place', type: 'place', text: 'Two fish from {place}.', n: 2, base: 40, weight: 2 },
    { id: 'l_slay', type: 'slay', text: 'Thin the swarm by {n}.', n: [60, 120], base: 30, weight: 1, modes: ['lantern', 'gloomtide'] },
    { id: 'l_warden', type: 'warden', text: 'Silence the Warden of {zone}.', base: 80, weight: 1, modes: ['lantern', 'gloomtide'] },
  ],
  inLakeBounties: { fishingShare: 0.85, combatTemplates: 'combatModes' },
};

// ---- The Landing: a walkable 3D cove (brief §3.7). Not in ZONES or ZONE_BY_ID; entered by
// zone:change {zone: 'cove', hub: true}. x east, z south (−z = north, up-screen); y = walk height (m).
export const COVE = {
  id: 'cove', index: -1, hub: true, theme: 'cove', name: 'The Landing',   // theme 'cove': world-layout / world-art build no Mossmere set-pieces here (themeOf must not clamp −1 to the Mossmere) subtitle: 'A Drowned Ferry Cove', mode: 'foot',
  description: 'An old ferry landing tucked under the kingdom\'s outer wall: a sheltered pocket of still water behind a broken sea-gate. The ferrymen pinned their best catches to the harbour wall. It is bare now.',
  arena: {
    // shoreNotch (CONTRACT §13.8): a = centre angle in degrees, atan2(z, x) convention (270 = north at x 0); w = metres of arc at R;
    // depth = water depth along it; len = metres it runs beyond R (the cliff ring and its collision open over that width).
    // a 278° puts the notch at x ≈ 6, so the channel runs straight north through the arch (legs x −3 / 15, centre x 6).
    radius: 42, seed: 7707, layout: 'cove', shallows: [0.2, 0.5], channel: [0.6, 1.0], shoreNotch: [{ a: 278, w: 14, depth: 0.8, len: 12 }],
    parallax: 3, parallaxLow: 2, stalactites: true, shafts: 2,
    islands: [], pillars: [], deepPools: [], legendPool: null, gate: null,
    spawn: { x: -18, z: -2.5, yawDeg: 180, mode: 'foot', at: 'hearth' }, jettySpawn: { x: 3, z: 2, yawDeg: 0, mode: 'foot' },
    spawnMode: 'foot', docks: [{ x: 4, z: -6.5 }],
    walk: {
      cell: 0.5,
      shapes: [
        { id: 'cv_quay', name: 'The Lower Quay', kind: 'rect', x: -17, z: 1, w: 26, d: 14, y: 0.6, tag: 'ground' },
        { id: 'cv_gallery', name: 'The Lower Gallery', kind: 'rect', x: -19.75, z: -10, w: 27.5, d: 8, y: 1.8, tag: 'ground' },
        { id: 'cv_upper', name: 'The Upper Gallery', kind: 'rect', x: -19.75, z: -18.25, w: 27.5, d: 5.5, y: 6.0, tag: 'ground' },
        { id: 'cv_ramp', name: 'The Quay Ramp', kind: 'path', pts: [[-10, -2.5, 0.6], [-10, -6.5, 1.8]], w: 3, tag: 'ramp' },
        { id: 'cv_stair', name: 'The Silted Stair', kind: 'path', pts: [[-32, -7.5, 1.8], [-32, -17.5, 6.0]], w: 2.4, tag: 'ramp', needs: 'cove_stair' },   // brief: (−32, −6) → (−32, −16); 1.5 m north so its foot clears the gallery's south edge (§24 body erosion)
        { id: 'cv_jetty', name: 'The Jetty', kind: 'path', pts: [[-4, 2], [4, 2]], w: 2.6, y: 0.6, tag: 'jetty' },
        { id: 'cv_customs', name: 'The Customs Steps', kind: 'path', pts: [[-4, -3], [0, -5]], w: 2.4, y: 0.6, tag: 'jetty' },
      ],
      holes: [{ id: 'cv_pond', name: 'The Keep-Pond', kind: 'disc', x: -16, z: 3.5, r: 2.8, rTier3: 4.0, depth: 0.7 }],
      blocks: [
        { id: 'b_table', kind: 'rect', x: -9, z: 2, w: 2.2, d: 1.4, h: 0.9 },
        { id: 'b_lectern', kind: 'disc', x: -6.5, z: -2, r: 0.4, h: 1.0 },
        { id: 'b_hearth', kind: 'disc', x: -18, z: -4.6, r: 0.8, h: 0.9 },
        { id: 'b_bench', kind: 'rect', x: -26, z: -5.4, w: 2.4, d: 0.8, h: 1.0 },
        { id: 'b_trials', kind: 'rect', x: -23, z: -5.7, w: 1.6, d: 0.4, h: 1.0 },
      ],
    },
    shortcuts: [{ id: 'cove_stair', name: 'The Silted Stair', opens: 'glasswaterLit' }],
    moorings: [{ id: 'cove_jetty', name: 'The Jetty', stand: { x: 3.5, z: 2 }, slot: { x: 6, z: 2 }, yawDeg: 90, bell: false }],
  },
  lowSouth: { dist: 14, max: 1.0, halfW: 4 },          // nothing above 1 m within 14 m south of any walkway (validated)
  walkSpeed: 5.04, tapToWalk: true,                   // = §24's BALANCE.walk.speedMult 0.84 × raft speed 6 (the brief's 5.2 used an older 0.86)
  stations: [
    { id: 'map_table', name: 'Map Table', x: -9, z: 2, pill: 'Plan', opens: 'setOut', chart: 512 },
    { id: 'lectern', name: 'Journal Lectern', x: -6.5, z: -2, pill: 'Journal', opens: 'journal' },
    { id: 'hearth', name: 'Hearth', x: -18, z: -4.5, pill: 'Rest', opens: 'settings', light: 'accent1', respawn: true },
    { id: 'trials', name: 'Trials Board', x: -23, z: -5.4, pill: 'Trials', opens: 'challenges' },
    { id: 'gear_bench', name: 'Gear Bench', x: -26, z: -5, pill: 'Tackle', opens: 'tackle' },
    { id: 'shrine', name: 'Shrine of Drowned Lanterns', x: -30, z: 0, pill: 'Shrine', opens: 'shrine', lanterns: 'totalRelicLevels' },
    { id: 'murk', name: "Murk's Barge", x: 4, z: -6.5, pill: 'Trade', opens: 'shop', range: 5, tabs: ['sell', 'bait', 'supplies', 'ledger', 'rumours', 'cosmetics'] },
    { id: 'raft', name: 'Raft', x: 6, z: 2, pill: 'Board', opens: 'setOutGlide', needs: 'pendingSetOut' },
    // the walls: one station per wing, on its gallery facing the wall (range 4); taps on frames route through world.pickFrame
    { id: 'wall_mossmere', name: 'Mossmere wing', x: -24.75, z: -11.5, pill: 'Look', opens: 'wall', range: 4, wing: 'mossmere' },
    { id: 'wall_sporewood', name: 'Sporewood wing', x: -11.25, z: -11.5, pill: 'Look', opens: 'wall', range: 4, wing: 'sporewood' },
    { id: 'wall_glasswater', name: 'Glasswater wing', x: -24, z: -18.5, pill: 'Look', opens: 'wall', range: 4, wing: 'glasswater', needs: 'cove_stair' },
    { id: 'wall_paleabyss', name: 'Pallid wing', x: -12, z: -18.5, pill: 'Look', opens: 'wall', range: 4, wing: 'paleabyss', needs: 'cove_stair' },
    { id: 'jetty', name: 'Jetty', x: 3, z: 2, pill: null, opens: 'coveFishing' },
    { id: 'pond', name: 'Keep-Pond', x: -16, z: 3.5, pill: null, opens: 'pond', camera: 'pond' },
  ],
  // NNE of the jetty head (4, 2): 4.5 m away, 27° from up-screen (§24.5: cast water within ±50° of up-screen), clear of the
  // Set Out path and 4.9 m from Murk's barge; the practice fight is a Reedjaw at z 1.4 that cannot escape, capped at 20 s
  testBuoy: { x: 6, z: -2, fight: 'fixedPull', rewards: false, practice: { species: 'reedjaw_pike', z: 1.4, escape: false, cap: 20, shows: ['tensionBand', 'dragPreset', 'shock'] } },
  // scripted raft glides (player.glide): out under the arch through the Waystone sill's gap (W2 4.5 / W3 9 at z −15.3, stone r 0.4:
  // 3.7 m clear), east of Murk's barge (≥ 3.9 m from its pad centre); Homecoming runs it backwards and moors at the jetty
  setOutPath: [[6, 2], [11, 1], [11, -9], [6.75, -13], [6.75, -18], [6.75, -24]], archLineZ: -18, homeInPath: [[6.75, -24], [6.75, -13], [11, -9], [11, 1], [6, 2]],
  homecoming: { spawn: 'raftAtMooring', skipped: 'jettySpawn' },
  fishing: { species: ['quayling'], sale: false, memoriesFirstOnly: true },
  seaGate: { legs: [{ x: -3, z: -18 }, { x: 15, z: -18 }], crown: 9.5, span: 16, legendsY: [3.5, 6.5], swallowerY: 7, build: 'taperTube' },
  waystones: [
    { zone: 'mossmere', x: 0, z: -15, colour: 0xb0603e, colour2: 0xa9b9f0, litAtStart: true, keepsake: 'a rust buoy-bell' },
    { zone: 'sporewood', x: 4.5, z: -15.3, colour: 0xffb46a, keepsake: 'a potted amber glowcap', opensWing: 'sailcloth' },
    { zone: 'glasswater', x: 9, z: -15.3, colour: 0x5cbcff, keepsake: 'a singing crystal on the Map Table', opensWing: 'stair' },
    { zone: 'paleabyss', x: 13, z: -15, colour: 0xe8c66a, keepsake: '30 candle-rafts drifting in the cove', opensWing: 'sailcloth' },
  ],
  // The Long Wall: one framed slot per non-legendary species, a painted ruler 1.1 × the species' reach.
  // the hearth (−18, −4.5) sits on the quay against the z −6 retaining wall; its chimney breast is a 3 m stretch of the LOWER WALL
  // (x −19.5…−16.5) behind the Lower Gallery, carrying the stack to the Upper Gallery's parapet; both Wanderer frames hang on it,
  // one above the other. The lower wings shrink to 10.5 m either side; the upper wings keep 12 m (the Pallid row needs 12.0 m).
  walls: {
    lower: { z: -14.5, x: [-30, -6], y: [1.8, 6.0], from: 'cv_gallery' },
    upper: { z: -21.5, x: [-30, -6], y: [6.0, 10.0], from: 'cv_upper' },
    chimney: { x: [-19.5, -16.5], wall: 'lower', wanderers: ['pilgrim_salmon', 'hearthfish'], stacked: true },
  },
  wings: {
    mossmere: { wall: 'lower', x: [-30, -19.5], openAt: 'start' }, sporewood: { wall: 'lower', x: [-16.5, -6], openAt: 'sporewood', cover: 'sailcloth' },
    glasswater: { wall: 'upper', x: [-30, -18], openAt: 'glasswater', cover: 'stair' }, paleabyss: { wall: 'upper', x: [-18, -6], openAt: 'paleabyss', cover: 'sailcloth' },
  },
  wing: { h: 3.6, rows: 3, gap: 0.4, rowGap: 0.15, largestLowest: true },   // each wing's width is its x span; frames pack in 2D (width and height)
  // frame height by mount view: side profile (default) = ratio × reach + margin; rays dorsal-up (ratio 0.56); jellies hang bell-up
  // (height 1.1 × reach + 0.15, width max(0.66, 0.6 × reach + 0.2)). The Wick silhouette (0.85 m) is painted at true height beside
  // any frame shorter than it. Wanderer frames size from their largest reach over their lakes.
  frameHeight: { margin: 0.2, min: 0.45, ratio: { minnow: 0.22, perch: 0.3, carp: 0.32, koi: 0.3, pike: 0.18, eel: 0.09, angler: 0.35, ray: 0.56, puffer: 0.45,
    crayfish: 0.25, ghost: 0.25, sturgeon: 0.16, jelly: 1.1 }, views: { ray: 'dorsal', jelly: 'hanging' } },
  frames: [   // by "said to reach" length (m); width = 1.1 × reach (the specimen board holds up to 4 small species of one lake)
    { id: 'board', name: 'specimen board', maxReach: 0.6, width: 1.2, height: 0.6, holds: 4 },
    { id: 'plaque', name: 'plaque', maxReach: 1.4, widthRange: [0.66, 1.54] },
    { id: 'arch', name: 'arch', maxReach: 2.4, widthRange: [1.54, 2.64] },
    { id: 'great', name: 'great arch', maxReach: Infinity, widthRange: [2.64, 4.1] },
  ],
  seals: { prize: 'inkStamp', trophy: 'oxbloodWax', elder: 'blackWaxRibbon', ancient: 'goldThread' },
  rulerMarks: ['cm', 'classBands', 'oldLedger', 'wickSilhouette'], unknown: '?',
  pond: { slots: [3, 5, 6], maxLength: 1.4, live: 6, liveLow: 2, swim: 0.6, gate: 'firstLivePrize', silt: 3 },
  growth: [
    { on: 'start', shows: 'one lit hearth, two bollard lanterns, the Mossmere Waystone, 11 "?" frames, sailcloth over the Sporewood wing, a silted stair and pond, the Willow Switch' },
    { on: 'speciesNamed', shows: 'its frame inks the silhouette and name' },
    { on: 'fishHung', shows: 'the fish at true size, a candle beneath it, the seal upgrades; Elders get a name card' },
    { on: 'wingComplete', shows: 'the lintel lights in the lake colour; the Journal perk activates' },
    { on: 'firstLivePrize', shows: 'the silt-gate beat (3 s): the pond clears, its floor lamp lights' },
    { on: 'pondTier', shows: 'tier 2 steps and a second floor lamp; tier 3 a drowned-mosaic floor' },
    { on: 'waystoneLit', shows: 'the stone glows, one more bollard lantern, a keepsake, that lake\'s wing opens' },
    { on: 'legendHome', shows: 'it hangs under the sea-gate arch (the Lantern-Swallower along the lintel)' },
    { on: 'relicLevel', shows: 'one drowned lantern relights' },
    { on: 'tackleTier', shows: 'the rack, spools, reel and creel switch models; boots and chimney glass on pegs; the Long Oars on the raft' },
    { on: 'wickUnlocked', shows: 'another Wick dozes by the hearth' },
    { on: 'oldLedgerBeaten', shows: 'your name chalked over Murk\'s old figures' },
    { on: 'placeFound', shows: 'the chart inks a vignette, a star when mastered' },
    { on: 'wardenSilenced', shows: 'a keepsake on the mantel (cosmetic)' },
    { on: 'swallowerLanded', shows: 'a warm shaft opens through the ceiling; every lamp burns gold; the title card changes' },
  ],
  visibleChanges: 150,
  palette: { fog: 0x1d2230, fogDensity: 0.014, water: 0x1a1f2c, waterDeep: 0x06080d, foam: 0xd8dce6, glow: 0xffb347, accent: 0x8a3a3a,
    ambient: 0x404659, ink: 0x04050a, far: 0x6d7894, light: 0xe2d6c4, lamp: 0xffd8a0 },
  grade: { exposure: 1.0, bloomStrength: 0.9, bloomRadius: 0.6, bloomThreshold: 0.7, tint: 0x3a3048, tintAmount: 0.14, vignette: 0.42, saturation: 0.82, grain: 0.05 },
  greenBudget: { what: 'verdigris on Murk\'s hand bell', maxChroma: 0.02, shotIncludes: 'murk' },
  murkLook: { skin: 0x5a5444, moss: 0xb8b0a0, lichen: 0xc8c0b0, lamp: 0xffe2b0, tip: 'Sail to his lantern' },   // A10 (actors-merchant)
  lights: { max: 4, list: ['wick', 'murk', 'hearth', 'waystone'], streaks: 6 },
  budget: {
    high: { post: 15, water: 4, cliffs: 5, stalactites: 3, quay: 2, walls: 3, gate: 4, lamps: 3, hearth: 3, furniture: 3, keepsakes: 4, mantel: 1, wicks: 2, particles: 3,
      wickOnFoot: 15, raft: 4, murk: 8, mounts: 12, pond: 36, total: 130, cap: 140 },
    low: { post: 10, water: 4, cliffs: 4, stalactites: 2, quay: 2, walls: 3, gate: 4, lamps: 3, hearth: 2, furniture: 3, keepsakes: 3, mantel: 1, wicks: 2, particles: 2,
      wickOnFoot: 15, raft: 4, murk: 8, mounts: 9, pond: 12, total: 93, cap: 100 },
    pointLights: 4, buildMs: { desktop: 150, phone: 600 }, mountLodTris: 600, mountLodFrom: 12,
    // the mount batch is a near / far pair per wall: the wing in view at full detail (≤ 12 fish, ≈ 2.3k tris each with the outline)
    // + every other mount and legend at LOD (≤ 600 tris, 1.2k with the outline); pairs swap by wing distance (no rebuild)
    mountBatch: { near: 9, far: 3, maxTris: 80000, rebuildOn: ['homecoming', 'swap', 'pond:add', 'pond:release'] },
  },
  // the cove's land is built by direct extrusion of COVE.walk shapes (rect boxes, path ribbons, ramp wedges) in world-cove.js; it does
  // not need §24's grid mesher. walkGridFor (data) gives collision and tap-to-walk.
  land: 'extrude',
  fallback: 'landingV0',
  // Landing v0 (only while §24's foot controller is not in the build): world.getMode() = 'raft'; the Wick stays on the raft and
  // every land station is offered from a pill post (a bollard lantern) on the quay's south parapet, within the raft's 5 m interact
  // range of raft-reachable water (validated); the walls and the pond are shown by flying the wall / pond camera from a post; the
  // layout, the land builder and every asset are the full Landing's, so v0 needs no rework when the foot core lands.
  v0: {
    mode: 'raft', range: 5,
    posts: [
      { id: 'shrine', x: -29, z: 7.6 }, { id: 'gear_bench', x: -25.5, z: 7.6 }, { id: 'trials', x: -22, z: 7.6 }, { id: 'hearth', x: -18.5, z: 7.6 },
      { id: 'pond', x: -15.5, z: 7.6, camera: 'pond' }, { id: 'wall', x: -12, z: 7.6, camera: 'wall', opens: 'wall' }, { id: 'map_table', x: -9, z: 7.6 }, { id: 'lectern', x: -5.5, z: 7.6 },
    ],
    atWater: ['murk', 'raft', 'jetty'],
  },
};

// ---- Save migration (brief Pg3, §13.1): keep the Journal, records, relics, Wicks and challenges; refund cut
// relics; rename; a 200-Shell welcome purse; a run in progress ends at the next title as a "return home".
export const RENAMES = {
  version: 3,
  species: { pale_leviathan: 'lantern_swallower' },
  baits: { pale_marrow: 'last_candle' },                // the bait whose display name was "Drowned Marrow"
  supplies: { tide_chart: 'murks_chum' },
  names: { 'The Pale Leviathan': 'The Lantern-Swallower', 'Drowned Marrow': 'Last Candle', 'Landing of Last Rafts': 'Shore of Last Rafts', 'Tide Chart': "Murk's Chum" },
  relicsRefunded: ['old_debt', 'waystone_sporewood', 'waystone_glasswater', 'waystone_paleabyss'],
  upgradesToOutfit: { lantern_chimney: 'chimney', raft_brazier: 'brazier', raft_oars: 'oars', boots_cork: 'boots' },
  upgradesToTackle: { rod_ashwood: 'rod', rod_whalebone: 'rod', line_gut: 'line', line_silver: 'line', reel_brass: 'reel', reel_drag: 'reel', creel_wicker: 'creel' },
  upgradesToLures: { lure_glimmer: 'glimmer_spoon' },
  upgradesCut: ['lure_feather', 'creel_frost'],
  combatKit: ['lantern_mantle', 'lantern_lens', 'lantern_striker', 'raft_hull', 'raft_hearth'],
  welcomePurse: 200, runInProgress: 'returnHome', keep: ['journal', 'records', 'relics', 'wicks', 'challenges', 'memories', 'settings'],
  // Pg0 (P1): ids only (species, baits, supplies in journal keys, run.legendaries, run.bait, unlocks); marks meta.v3ids = true.
  // Pg3 (P3): the rest, once. core.loadSave() returns the envelope {version, meta, run}; schema is never merged from defaultMeta.
  pg0: ['species', 'baits', 'supplies'],
  detect: { legacy: 'version < 3 && (meta.runs > 0 || journal not empty)', fresh: 'otherwise' },
  fresh: { shells: 20, schema: 3, firstOutingDone: false },                    // a brand-new player: no welcome purse, the First Outing
  legacy: { welcomePurse: 200, firstOutingDone: true, schema: 3,               // a veteran never replays the First Outing
    runShells: 'addToMeta',                                                   // a v1 run in progress: its run.shells join meta.shells …
    runTally: 'memoriesFor',                                                  // … and it is paid by v1 memoriesFor (it had no expedition tally)
    gates: 'legendaryInJournal',                                              // gates (and Waystones) open only for lakes whose legendary meta.journal holds
    tackle: 'none' },                                                         // v1 upgrades were per run: persistent tackle and outfit start at T0 / level 0 for everyone
  // upgradesTo* say where each v1 catalogue entry went (validated: each maps once); they grant nothing on migration
  metaAdds: ['shells', 'tackle', 'outfit', 'lures', 'mounts', 'pond', 'landing', 'waystones', 'shortcuts', 'residents', 'markedFish', 'elderLog', 'places', 'ledger'],
};

// ---- Player-facing text (brief §2, §3, §4, §5). Original wording only (brief §13.3).
export const TEXT_V3 = {
  hubName: 'The Landing', setOut: 'Set Out', returnHome: 'Return home', rideHome: 'Ride home', homecoming: 'Homecoming',
  snuffedTitle: 'Snuffed', scorchedTitle: 'Scorched', stillnight: 'Stillnight', firstOuting: 'First Outing',
  premise: "Long ago the Lamplit Kingdom hung a great lantern over its lake. When the lantern fell, the kingdom followed it into the water. The Wicks are what is left of its candles: small, stubborn flames with a lantern and a rod, setting out from an old ferry landing to fish the drowned dark. Somewhere below, the Lantern-Swallower carries the great lantern's last ember in its belly.",
  modes: {
    still: { name: 'Still', line: 'No swarm. Every night is yours to fish.' },
    lantern: { name: 'Lantern', line: 'A light swarm on every other night, early on. It never costs a fish on your line.' },
    gloomtide: { name: 'Gloomtide', line: 'The full swarm, every night. The old stakes.' },
  },
  classes: { small: 'Small', keeper: 'Keeper', prize: 'Prize', trophy: 'Trophy', elder: 'Elder', ancient: 'Ancient' },
  quiet: 'The water here has gone quiet.', listless: 'It had grown listless. You let it go.', snuffedWake: 'Murk found your raft drifting.',
  sank: 'Sank with the creel, night {n}', stirs: 'The Gloom stirs tonight.', lastLight: 'The big ones come up at dusk.',
  markForHome: 'Mark for home?', liveWell: 'keeps {n} nights', farWater: 'Far Water', homewardDistance: 'Homeward stone {m} m',
  watchLamp: 'Nearest watch-lamp {m} m · ≈ {s} s',
  lampWatchStart: 'Lamp-watch. The Gloom keeps away tonight; fish within {m} m of the lamp.',   // survival, at dusk's end in a watch-lamp's pool
  lampWatchLeave: 'You left the lamp-watch. The Gloom stirs.',                                 // survival, > 10 m out of the pool
  lampWatchCast: 'On a lamp-watch you fish within {m} m of the lamp.',                          // fishing, a cast beyond the limit is refused
  nearMiss: '{cause} at {pct}%. Your tackle is rated {rating} here.',
  newBest: 'New best: {cm} cm (was {was})', classFirst: 'First {class} {species}', oldLedger: 'Old Ledger beaten',
  stillOutThere: 'still out there', resident: 'Resident', murkFrontYard: "Lives in my front yard. I don't buy those. The real water's through the gate.",
  causes: { snap: 'Snapped', thrown: 'Thrown hook', spooled: 'Spooled', fouled: 'Fouled' },
  tips: {
    snap: 'Let go on the hiss.', thrown: 'Keep the line tight through a leap.', spooled: 'Ease the drag before a runner turns.', fouled: 'Ease off when the chain clanks.',
  },
  // the v3 HUD's and screens' copy (ui reads TEXT_V3.x ?? its own fallback): the float's favour, the class tells, the status line
  hud: {
    favourBands: ['the water gives nothing away', 'a little favour', 'the water favours you', 'the water leans your way', 'the water is with you', 'everything is in your favour'],
    tellWords: {
      doublePop: { word: 'a quick double pop', short: 'pop, pop' }, plunge: { word: 'a clean plunge', short: 'a plunge' },
      dragUnder: { word: 'a slow drag under', short: 'a slow drag' }, flatSlide: { word: 'it lies flat, then slides', short: 'lies flat' },
      dome: { word: 'the water domes', short: 'a dome' },
    },
    watchHere: "In the watch-lamp's light · stay till dusk ends",
    lampWatch: 'Lamp-watch · the Gloom keeps away · fish within {m} m',
    scorchedWatch: 'Scorched · held here till dawn · fish within {m} m',
    stray: 'Stray no farther · the watch breaks at {m} m',
    gutter: 'Guttering · {s} s · render a fish to relight',
    gutterEmpty: 'Guttering · {s} s · the creel is empty: catch one, fast',
  },
  stillnightSub: 'Night Rise. The big ones come up',
  swarmOpen: ['The Gloom Stirs', 'Guard your light. It passes before the night is out.'],
  swarmClose: 'The swarm withdraws. The rest of the night is yours.',
  lampWatchBanner: ['Lamp-watch', 'The Gloom keeps away tonight. Fish near the lamp.'],
  nearMissKicker: 'The one that got away',
  snuffedEpitaphs: [
    'The oil ran out first. Then the light. Then the small flame that held the rod.',
    'It guttered for a long while, and fished the whole time.',
    'A thread of smoke over still water, and a rod still in the rest.',
  ],
};
export const TIPS_V3 = [
  { id: 'v3_walk', phase: 3, trigger: 'hub:enter', text: 'Walk the Landing. The jetty end glows: cast from it.' },
  { id: 'v3_cast_cove', phase: 3, trigger: 'interact:change:jetty', text: 'Hold on the water to cast.' },
  { id: 'v3_favour', phase: 1, trigger: 'fishing:cast', text: 'The notches on your float show how much the water favours you.' },
  { id: 'v3_mark', phase: 3, trigger: 'fish:measured', text: 'Mark a Prize or bigger for home. It must survive the nights.' },
  { id: 'v3_farwater', phase: 3, trigger: 'farwater:dawn', text: 'Far Water: the fishing gets better, the way home costs more.' },
  { id: 'v3_resident', phase: 2, trigger: 'resident:show', text: 'A resident giant showed itself. Cast within 3 m, quickly.' },
];
export const MERCHANT_LINES_V3 = {
  frontYard: ["Lives in my front yard. I don't buy those. The real water's through the gate."],
  forecast: ['{weather} in {zone} tomorrow.', 'Tomorrow brings {weather}. Plan for it.'],
  stirs: ['The Gloom stirs tonight.', 'Something wakes in the dark tonight. Keep your light close.'],
  homeward: ['The stone by the dock points home. Hold to it when you are done.', 'I cast off at the bell. Ride with me, or find your own way.'],
  ledger: ['Another figure beaten. I will need more chalk.', 'Your name looks better on the board than the old one did.'],
};

// ---- Pure v3 helpers (fishing, progression, ui, tools). Lengths in cm, weights in kg.
const SZB = BALANCE_V3.size;
/** L50 (cm) of a species in a lake (the Pilgrim Salmon grows each lake down). */
export function sizeL50(sp, zone = null) {
  const L = sp.size.L50;
  return typeof L === 'number' ? L : (L[zone] ?? L[Object.keys(L)[0]]);
}
/** Length (cm) at size score z: L50 · e^(σz + tail · max(0, z − tailFrom)²). Legends use σ 0.02 and no tail. */
export function sizeLength(sp, z, zone = null) {
  const tail = sp.rarity === 'legendary' ? 0 : SZB.tail;
  return sizeL50(sp, zone) * Math.exp(sp.size.sigma * z + tail * Math.max(0, z - SZB.tailFrom) ** 2);
}
/** Weight (kg) of a fish of length cm: W = k · L³ (k in g/cm³). */
export function sizeWeight(sp, cm) { return (sp.size.k * cm ** 3) / 1000; }
/** Size class id for z (Ancient is an Elder with isAncient(z)). */
export function sizeClassOf(z) { return SIZE_CLASSES.find((c) => z < c.zMax).id; }
export function isAncient(z) { return z >= SZB.ancient; }
/** Highest z a species may roll (its maxClass cap; the size ceiling otherwise). */
export function maxZFor(sp) { return SZB.classMaxZ[sp.maxClass] ?? SZB.reachZ; }
/** "Said to reach" (cm): the length at the ceiling z (or the class cap). Legends: fully grown (× 1.5 weight). */
export function reachOf(sp, zone = null) {
  if (sp.rarity === 'legendary') return sizeL50(sp) * Math.cbrt(SZB.legend.growthCap);
  return sizeLength(sp, maxZFor(sp), zone);
}
/** The float's favour notches (0–5) for μ. */
export function favourNotches(mu) { let n = 0; for (const t of BALANCE_V3.favour.notches) if (mu >= t) n++; return n; }
/** Class odds for z ~ N(μ, 1) truncated to [min, maxZ] (Elders capped where giants do not live). */
export function classOdds(mu, maxZ = SZB.z.max) {
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const P = (a) => 0.5 * (1 + erf((Math.min(a, maxZ) - mu) / Math.SQRT2));
  const lo = P(SZB.z.min), hi = P(maxZ), n = hi - lo, out = {};
  let prev = lo;
  for (const c of SIZE_CLASSES) { const p = P(c.zMax); out[c.id] = (p - prev) / n; prev = p; }
  out.ancient = Math.max(0, hi - P(SZB.ancient)) / n;
  return out;
}
/** Sale value (Shells) of a fish of size z (brief §6.2). opts: {zone, quality (QUALITY valueMult), streak}. */
export function fishValueV3(sp, z, opts = {}) {
  const V = SZB.value, cls = sizeClassOf(z);
  const lakeMult = sp.valueByLake ? (ZONES.find((q) => q.id === opts.zone)?.valueMult ?? 1) : 1;
  const sizeM = Math.min(V.clamp[1], Math.max(V.clamp[0], Math.exp(V.perZ * z)));
  return Math.round(sp.value * lakeMult * V.factor * sizeM * (V.classBonus[cls] ?? 1) * (opts.quality ?? 1) * (opts.streak ?? 1));
}
/** Food or oil from a fish of size z; rendered oil also takes Far Water's render factor (opts.day). */
export function fishYieldV3(sp, z, kind = 'oil', opts = {}) {
  const Y = SZB.yield, m = Math.min(Y.clamp[1], Math.max(Y.clamp[0], Math.exp(Y.perZ * z)));
  const fw = kind === 'oil' && opts.day ? farWaterFor(opts.day).render : 1;
  return sp[kind] * Y.factor * m * (opts.quality ?? 1) * fw;
}
/** Far Water on expedition day d (brief §3.4). */
export function farWaterFor(day = 1) {
  const F = BALANCE_V3.farWater, d = Math.max(1, day | 0), out = d - 1;
  const murk = F.murk.always.includes(d) || (d > Math.max(...F.murk.always) && d % 2 === 1);
  return {
    favour: Math.min(F.favourCap, F.favourPerDawn * out), shows: Math.min(F.showsCap, F.showsPerDawn * out), murk,
    oilPrice: murk ? 1 + F.oilPrice.perDay * Math.max(0, d - F.oilPrice.from) : null,
    render: Math.max(F.render.floor, 1 - F.render.perDay * out), nightBurn: 1 + F.nightBurn.perNight * Math.max(0, d - F.nightBurn.from),
  };
}
/** Does the swarm come on night n (1-based) in this mode? (First Outing: never.) */
export function swarmTonight(mode, night, outing = 'normal') {
  if (outing === 'first') return false;
  const m = BALANCE_V3.nightModes[mode]; if (!m) return false;
  return m.swarmNights === 'all' || (m.swarmNights === 'even' && night % 2 === 0);
}
/** The swarm window (night k range) on night n, or null when the night is still. */
export function swarmWindow(mode, night, outing = 'normal') { return swarmTonight(mode, night, outing) ? BALANCE_V3.nightModes[mode].window.slice() : null; }
/** Expedition tally Memories (brief §9.4), paid on return; memMult (Remembrance) multiplies the tally only. */
export function tallyFor(s = {}) {
  const T = EXPEDITION.tally, lines = [];
  lines.push({ id: 'dawns', value: T.perDawn * (s.dawns || 0) });
  lines.push({ id: 'stillNights', value: T.perStillNight * (s.stillNights || 0) });
  if (s.mode === 'gloomtide') lines.push({ id: 'swarmNights', value: (s.swarmNights || 0) * (T.gloomtide.base + T.gloomtide.perZone * (s.zoneIndex || 0)) });
  else lines.push({ id: 'swarmNights', value: T.perLanternSwarmNight * (s.swarmNights || 0) });
  lines.push({ id: 'lakesCrossed', value: T.perLakeCrossed * (s.lakesCrossed || 0) });
  lines.push({ id: 'ledger', value: T.perLedger * (s.ledger || 0) });
  const raw = lines.reduce((a, l) => a + l.value, 0) * (1 + (s.memMult || 0));
  return { total: Math.round(raw * (s.snuffed ? T.snuffedMult : 1)), raw, lines };
}
/** The Long Wall frame for a species (brief §3.7.3): {id, width, height (m), reach (m), view}. Wanderers size from their largest reach. */
export function frameFor(sp) {
  const reachM = Math.max(...(sp.zones?.length ? sp.zones : [sp.zone]).map((z) => reachOf(sp, z))) / 100;
  const f = COVE.frames.find((q) => reachM <= q.maxReach), H = COVE.frameHeight, shape = sp.model?.shape;
  const view = H.views[shape] || 'side';
  if (f.id === 'board') return { id: f.id, width: f.width, height: f.height, reach: v3r(reachM, 2), view };
  if (view === 'hanging') return { id: f.id, width: v3r(Math.max(0.66, 0.6 * reachM + 0.2), 2), height: v3r(1.1 * reachM + 0.15, 2), reach: v3r(reachM, 2), view };
  return { id: f.id, width: v3r(1.1 * reachM, 2), height: v3r(Math.max(H.min, (H.ratio[shape] ?? 0.3) * reachM + H.margin), 2), reach: v3r(reachM, 2), view };
}
/** Which seals a species can earn (brief §6.3): the Quayling none; a species capped below Elder loses its Elder seal. */
export function sealsFor(sp) {
  if (sp.cove || sp.rarity === 'legendary') return [];
  return BALANCE_V3.records.seals.classes.filter((c) => c !== 'elder' || !(BALANCE_V3.records.seals.noElder.includes(sp.id) || (sp.maxClass && SZB.classMaxZ[sp.maxClass] < SZB.fight.elderZ)));
}
/** The one place-membership helper for v3 consumers: the place of `zone` whose water contains (x, z), or null. Searches the zone's
 *  arena.places (the Mossmere's v3 places from P2; §24's places in walking builds) and then §24's ARENA_V2 (v2's placeAt stays for v2). */
export function placeAtV3(zone, x, z) {
  const id = typeof zone === 'string' ? zone : zone?.id;
  const list = ZONES.find((q) => q.id === id)?.arena?.places || ARENA_V2[id]?.places || [];
  return list.find((p) => placeContains(p, x, z)) || null;
}
/** What the trophy camera frames at a place: its authored landmark, else its own centre 2 m up (§24's places), else null. */
export function landmarkOf(place) {
  if (!place) return null;
  return place.landmark ? { ...place.landmark } : { x: place.x ?? place.water?.x ?? 0, y: 2, z: place.z ?? place.water?.z ?? 0 };
}
/** Fight stats of a tackle loadout (the reel sim and progression.getStats share it). TACKLE tier values REPLACE the STATS base for
 *  castMax, hookWindow, slackTime, lineStrength, reelSpeed, sweetZone and creelSize; Wick, relics, Boons and outfit then add. */
export function tackleStats(t = {}, drag = 'set') {
  const r = TACKLE.rod[t.rod | 0], l = TACKLE.line[t.line | 0], e = TACKLE.reel[t.reel | 0], c = TACKLE.creel[t.creel | 0];
  const preset = e.drag === 'presets' ? (TACKLE.drag.presets[drag] ?? TACKLE.drag.presets.set) : TACKLE.drag.presets[TACKLE.drag.fixed];
  return { castMax: r.castMax, hookWindow: r.hookWindow, slackTime: r.slackTime + (l.slackAdd || 0), shock: r.shock, pipBonus: r.pips,
    lineStrength: l.lineStrength, reelSpeed: e.reelSpeed, sweetZone: e.sweetZone, absorb: e.absorb, dragAt: preset, creelSize: c.creelSize };
}
/** P1–P2 and The Long Descent (per-run UPGRADES, no tiers): the effective tackle tier per slot from owned upgrade levels. Only shock,
 *  pips, absorb and the tackle rating come from it; the other stats stay computeStats(UPGRADES). */
export function upgradeTiers(levels = {}) {
  const T = BALANCE_V3.upgradeTiers, out = {};
  for (const [slot, ids] of Object.entries(T.slots)) {
    const n = ids.reduce((a, id) => a + (levels[id] | 0), 0), max = ids.reduce((a, id) => a + (UPGRADES.find((u) => u.id === id)?.maxLevel | 0), 0);
    out[slot] = Math.min(4, Math.floor((n * 4) / Math.max(1, max) + 1e-9));
  }
  return out;
}

// ---- Apply (only when the v3 build is active). Runs after the walking merge, before the lookup maps. Gated by V3_PHASE so each
// phase's build carries exactly its data (DESIGN §25.14.1 "which data lands when"; validate-data runs a pass per phase):
//   P1  BALANCE_V3 (minus V3_BLOCK_PHASE blocks), v3 STATS keys, the 32 P1 species (+ §24's 8 kept fish with §24), the renames
//       (Pg0 migrates the ids), Murk's Chum, Angler Boons and tags, the Wicks' fishing halves, P1 tips, text, the Mossmere's rust
//       accent and buoy watch-lamps, §24 place sync and watch lamps (when §24 is in), raft fallbacks (stopgap giants, watch lamps)
//   P2  + residents / Marked Fish blocks, the Mossmere's 8 places, props and Moon-Eye crack, the sturgeon shape, species → 36
//   P3  + farWater / liveWell, RELICS_V3 (cuts, shelves, costs), CHALLENGES_V3, Homeward stones, the welcome purse, species → 47
//   P4  + the Moon Cistern and the six P4 species (→ 53)
if (V3_ENABLED) {
  const P = V3_PHASE;
  const keepWalk = (x) => WALK_ENABLED || !x.needsWalk;
  const walkPlace = new Set(PLACES.map((p) => p.id));
  Object.assign(STATS, WALK_STATS);                                    // stride exists in v3 (Boots, Wanderer's Stride, Quick Feet) even without §24
  for (const [k, v] of Object.entries(BALANCE_V3.stats)) STATS[k] = { ...v };   // shock, absorb, pipBonus, dragAt (T0 values)
  for (const [k, v] of Object.entries(BALANCE_V3)) {                 // new blocks are assigned; an existing block (bite) gains the v3 keys only (validated)
    if ((V3_BLOCK_PHASE[k] ?? 1) > P) continue;
    if (BALANCE[k] && typeof BALANCE[k] === 'object' && !Array.isArray(BALANCE[k])) Object.assign(BALANCE[k], v); else BALANCE[k] = v;
  }
  // species: §24's kept fish come with §24's lake builds; everything else by phase; nothing kept at a §24 place without §24
  SPECIES.length = 0;
  SPECIES.push(...SPECIES_V3.filter((s) => (s.src === 'walk' ? WALK_ENABLED : s.phase <= P) && (WALK_ENABLED || !(s.src === 'walk' || (s.place && walkPlace.has(s.place))))));
  if (P >= 2) FISH_SHAPES.push('sturgeon');
  // renames (originality; Pg0 renames the ids in saves in P1) and the feeding-spot cut (Murk's Chum, the sign bounty)
  for (const b of BAITS) if (b.id === 'pale_marrow') Object.assign(b, { id: 'last_candle', name: 'Last Candle', desc: 'A candle-end that never quite went out. Something in the deepest water remembers what it was for.' });
  const tc = SUPPLIES.findIndex((s) => s.id === 'tide_chart');
  if (tc >= 0) SUPPLIES.splice(tc, 1, { id: 'murks_chum', name: "Murk's Chum", price: 30, give: { chum: 1 }, limitPerVisit: 1, icon: 'bait',
    desc: 'A pail of scraps. Your next cast stirs up nervous water for 30 s: a predator under a bait ball.' });
  const sb = BOUNTIES.find((x) => x.id === 'spot_catch');
  if (sb) Object.assign(sb, { type: 'signCatch', text: 'Catch {n} fish cast inside a sign on the water.' });
  if (P >= 3) { RELICS.length = 0; RELICS.push(...RELICS_V3.filter(keepWalk)); }
  BOONS.push(...BOONS_V3);
  for (const b of BOONS) if (ANGLER_POOL.includes(b.id) && !b.tags.includes('angler')) b.tags = [...b.tags, 'angler'];
  for (const c of CHARACTERS) if (CHARACTERS_V3[c.id]) c.fishing = v3clone(CHARACTERS_V3[c.id].fishing);
  if (P >= 3) {
    CHALLENGES.length = 0;
    CHALLENGES.push(...CHALLENGES_V3.filter(keepWalk));
    BALANCE.economy.welcomePurse = ECONOMY_V3.welcomePurse;
  }
  { const chron = CHALLENGES.find((c) => c.id === 'complete_chronicle'); if (chron) chron.params = { ...chron.params, n: SPECIES.length }; }
  TIPS.push(...TIPS_V3.filter((t) => (t.phase ?? 1) <= P));
  { const mt = TIPS.find((t) => t.id === 'merchant'); if (mt) mt.text = `A bell across the water. Old Murk has moored. ${COVE.murkLook.tip}.`; }   // A10: his lamp is candle-warm now, not green
  Object.assign(MERCHANT_LINES, MERCHANT_LINES_V3);
  TEXT.v3 = TEXT_V3; TEXT.premise = TEXT_V3.premise; TEXT.challengeTabs = CHALLENGE_TABS_V3;
  // the Mossmere: rust accent and buoy watch-lamps (P1); places, props and the Moon-Eye crack (P2; the Moon Cistern P4)
  const moss = ZONES[0];
  Object.assign(moss.palette, MOSSMERE_V3.palette);
  moss.arena.watchLamps = v3clone(MOSSMERE_V3.watchLamps);
  if (P >= 2) {
    moss.arena.places = MOSSMERE_V3.places.filter((p) => (p.phase ?? 2) <= P).map((p) => ({ ...v3clone(p), zone: 'mossmere' }));
    moss.arena.pillars.push(...MOSSMERE_V3.props.map((p) => ({ ...p })));
    moss.arena.cracks = v3clone(MOSSMERE_V3.cracks);
  }
  // raft fallbacks: a lake with no places in this build gets the stopgap giant water; §24's lakes without §24 get raft watch lamps
  // and a raft Homeward stone (CONTRACT §13.8)
  for (const z of ZONES) {
    const F = RAFT_FALLBACK_V3[z.id], hasPlaces = (z.arena.places || []).length > 0;
    if (!hasPlaces && F) z.arena.giantSpots = v3clone(F.giants);
    if (z.id !== 'mossmere' && !WALK_ENABLED && F) z.arena.watchLamps = v3clone(F.watchLamps);
    if (P >= 3) z.homeward = { ...((z.id !== 'mossmere' && !WALK_ENABLED) ? F.homeward : EXPEDITION.homeward.stones[z.id]), radius: EXPEDITION.homeward.radius };
    if (z.legendary === 'pale_leviathan') z.legendary = 'lantern_swallower';
  }
  // §24's lakes (walking builds): place sync ▲, watch lamps, renames
  for (const [zid, a] of Object.entries(ARENA_V2)) {
    for (const p of a.places || []) v3syncPlace(p);
    for (const l of a.lamps || []) if (WALK_SYNC_V3.watchLamps[zid]?.includes(l.id)) Object.assign(l, { watch: true, radius: BALANCE_V3.nightModes.lampWatch.radius });
  }
  for (const [path, name] of Object.entries(WALK_SYNC_V3.renames)) {
    const [zid, kind, id] = path.split('.'), A = ARENA_V2[zid];
    const hit = kind === 'lamp' ? A?.lamps?.find((l) => l.id === id) : A?.walk?.shapes?.find((s) => s.id === id);
    if (hit) hit.name = name;
  }
  // PLACES / PLACE_BY_ID: every place in this build with its v3 fields (§24's places only with §24; the Mossmere's from P2)
  PLACES.length = 0;
  PLACES.push(...(moss.arena.places || []), ...(WALK_ENABLED ? Object.entries(ARENA_V2).flatMap(([zid, a]) => (a.places || []).map((p) => ({ ...p, zone: zid }))) : []));
}
export const SPECIES_V3_COUNT = SPECIES_V3.length;   // 53

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
export const FORMATION_BY_ID = byId(FORMATIONS);
export const PLACE_BY_ID = byId(PLACES);                       // v2 (walking): every place, with .zone
export const WALK_FORMATION_BY_ID = byId(WALK_FORMATIONS);
export const WALK_BOUNTY_BY_ID = byId(WALK_BOUNTIES);
export const LEGENDARY_BY_ZONE = Object.fromEntries(ZONES.map((z) => [z.id, SPECIES.find((s) => s.zone === z.id && s.rarity === 'legendary')?.id || null]));
