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
  oilDrain:      { label: 'Oil Burn',        base: 0.14, fmt: 'num', min: 0.05, max: 1 },
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
      hpLin: 0.20, hpQuad: 0.025,                 // hpMult = 1 + 0.20H + 0.025H²
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
    newSpeciesLegendary: false,       // legendaries pay no first-catch Shells (their sale already ≈ the next toll)
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
  memories: { nightBase: 3, nightPerZone: 1.5, depth: [0, 15, 35, 60], fishPer: 2, legend: 15, slainPer: 25, elite: 2, warden: 15, victoryFirst: 150, victoryAfter: 100 },

  // ---- Descent Gate travel (DESIGN §14).
  travel: { phases: ['calm', 'dawn'], murkFollows: true, oneWay: true, descendTime: 2.5 },

  // ---- Bounty ledger (DESIGN §15).
  bounty: { offer: 2, maxActive: 3, durationDays: 2, dayGrowth: 0.04, memoriesEach: 4 },
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
    palette: { fog: 0x1a3436, fogDensity: 0.016, water: 0x1f3d3b, waterDeep: 0x081719, foam: 0xbfe3d4,
      glow: 0x6ff5c8, accent: 0xd6f59a, ambient: 0x3d6662, ink: 0x050c0d, far: 0x5a9488, light: 0xcff7e6 },
    grade: { exposure: 1.0, bloomStrength: 0.85, bloomRadius: 0.6, bloomThreshold: 0.72, tint: 0x2e6b63, tintAmount: 0.18, vignette: 0.38, saturation: 0.85, grain: 0.05 },
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
    palette: { fog: 0x2b1b30, fogDensity: 0.019, water: 0x2a1a2e, waterDeep: 0x0d0710, foam: 0xf3d3e0,
      glow: 0xffb46a, accent: 0xff7fb0, ambient: 0x5b3f63, ink: 0x0b060d, far: 0x80588a, light: 0xffd9c4 },
    grade: { exposure: 1.02, bloomStrength: 1.05, bloomRadius: 0.75, bloomThreshold: 0.68, tint: 0x6b3a6e, tintAmount: 0.2, vignette: 0.4, saturation: 0.9, grain: 0.05 },
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
    palette: { fog: 0x131a3c, fogDensity: 0.012, water: 0x131c3e, waterDeep: 0x04061a, foam: 0xc9e8ff,
      glow: 0x5ff2ff, accent: 0xb48cff, ambient: 0x2f3a78, ink: 0x03040e, far: 0x5062b0, light: 0xd8e8ff },
    grade: { exposure: 1.05, bloomStrength: 1.15, bloomRadius: 0.55, bloomThreshold: 0.65, tint: 0x2a3a8a, tintAmount: 0.2, vignette: 0.35, saturation: 0.95, grain: 0.04 },
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
    palette: { fog: 0x1c1b18, fogDensity: 0.022, water: 0x14130f, waterDeep: 0x030302, foam: 0xe9e2cf,
      glow: 0xe8c66a, accent: 0xeae4d3, ambient: 0x3a3833, ink: 0x020202, far: 0xa8a18c, light: 0xf0dca0 },
    grade: { exposure: 0.95, bloomStrength: 0.9, bloomRadius: 0.8, bloomThreshold: 0.7, tint: 0x5a4e2a, tintAmount: 0.12, vignette: 0.5, saturation: 0.6, grain: 0.07 },
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
    model: { shape: 'minnow', body: 0x6f8f86, belly: 0xd9e8dc, fin: 0x34544f, glow: null, pattern: 'scales', eyes: 'normal', scale: 0.45 },
    lore: 'They school beneath the raft like thrown pennies, each one wishing for nothing at all.' },
  { id: 'mossback_perch', name: 'Mossback Perch', zone: 'mossmere', rarity: 'common', tier: 1,
    weight: [0.3, 1.4], value: 7, food: 22, oil: 20, time: 'any', depth: [0.1, 1], bait: null, behavior: 'steady',
    difficulty: diff(1, 'steady'),
    model: { shape: 'perch', body: 0x4f6b4a, belly: 0xc9d6a8, fin: 0x8a9f5a, glow: null, pattern: 'stripes', eyes: 'normal', scale: 0.8 },
    lore: 'Moss takes root on its back by its third winter. By its tenth, it is mostly a small, slow garden.' },
  { id: 'gutter_crayfish', name: 'Gutter Crayfish', zone: 'mossmere', rarity: 'common', tier: 1,
    weight: [0.1, 0.5], value: 6, food: 20, oil: 18, time: 'any', depth: [0, 0.45], bait: null, behavior: 'sinker',
    difficulty: diff(1, 'sinker'),
    model: { shape: 'crayfish', body: 0x5b4a3e, belly: 0xb8a07a, fin: 0x2f2620, glow: null, pattern: 'bands', eyes: 'normal', scale: 0.6 },
    lore: 'It hoards drowned buttons in its burrow. No one knows whose coat it is trying to finish.' },
  { id: 'weeping_carp', name: 'Weeping Carp', zone: 'mossmere', rarity: 'uncommon', tier: 2,
    weight: [1.5, 5.5], value: 15, food: 26, oil: 20, time: 'any', depth: [0.35, 1], bait: null, behavior: 'sinker',
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
    model: { shape: 'minnow', body: 0x8fb8e8, belly: 0xeaf6ff, fin: 0x5ff2ff, glow: 0x5ff2ff, pattern: 'scales', eyes: 'normal', scale: 0.45 },
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
      cue: 'The whole Vault rings like struck glass. The swarm keeps coming (spawn rate × legendFightRateMult).',
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
  { id: 'oilskin_flask', name: 'Cracked Oilskin', icon: 'oil', maxLevel: 3, costs: [35, 95, 215], effects: { maxOil: 15 }, unlock: null,
    desc: 'It leaks, but only a little, and only when it is sad. +15 max oil.' },
  { id: 'salt_glass_lens', name: 'Salt-Glass Lens', icon: 'lens', maxLevel: 3, costs: [55, 150, 325], effects: { lightRadius: 0.6, auraDps: 0.15 }, unlock: null,
    desc: 'Fitted to a lantern long since drowned. The light it bends still finds its way back. +0.6 m light, +0.15 burn.' },
  { id: 'bent_tin_spoon', name: 'Bent Tin Spoon', icon: 'spoon', maxLevel: 3, costs: [35, 95, 215], effects: { maxSatiety: 15, satietyDrain: -0.006 }, unlock: null,
    desc: 'Someone ate every meal with this, slowly, to make it last.' },
  { id: 'mended_creel', name: 'Mended Creel', icon: 'creel', maxLevel: 2, costs: [45, 200], effects: { creelSize: 1 }, unlock: null,
    desc: "Patched with reed, ribbon, and a lock of someone's hair. +1 creel slot." },
  { id: 'old_debt', name: "Murk's Old Debt", icon: 'shell', maxLevel: 4, costs: [25, 70, 150, 295], effects: {}, special: 'startShells:30', unlock: null,
    desc: 'He owes you. He will not say for what. +30 starting Shells per level.' },
  { id: 'heartwood_oar', name: 'Heartwood Oar', icon: 'oar', maxLevel: 3, costs: [40, 110, 245], effects: { moveSpeed: 0.3 }, unlock: null,
    desc: 'Carved from the last tree that grew in sunlight. It still leans toward it. +0.3 raft speed.' },
  { id: 'seven_knots', name: 'Line of Seven Knots', icon: 'line', maxLevel: 3, costs: [40, 120, 270], effects: { lineStrength: 0.1 }, unlock: null,
    desc: 'Each knot was tied by a different Wick. None have come undone.' },
  { id: 'first_wick_stub', name: 'Stub of the First Wick', icon: 'ember', maxLevel: 2, costs: [120, 350], effects: { maxHp: 1 }, unlock: null, requires: { bestDay: 3 },
    desc: 'Barely a thumb of wax. It remembers being tall. +1 Ember.' },
  { id: 'two_headed_coin', name: 'Two-Headed Coin', icon: 'coin', maxLevel: 3, costs: [70, 190, 405], effects: { rarityBonus: 0.03, luck: 0.1 }, unlock: null, requires: { runs: 2 },
    desc: 'Lucky, they said. It came up heads every time. Even the last time.' },
  { id: 'drifters_bundle', name: "Drifter's Bundle", icon: 'bundle', maxLevel: 2, costs: [55, 160], effects: {}, special: 'startKit', unlock: null, requires: { runs: 2 },
    desc: "I: start with 8 Mire Worms and 3 Lumen Moss. II: also the starting zone's legend bait." },
  { id: 'tinderbox', name: "Grandsire's Tinderbox", icon: 'xp', maxLevel: 3, costs: [45, 120, 270], effects: { xpMult: 0.05, pickupRadius: 0.5 }, unlock: null, requires: { bestLevel: 8 },
    desc: 'Dry wood, flint, and the patience of someone long gone. +5% cinders, +0.5 m magnet.' },
  { id: 'steady_hook', name: "Grandmother's Hook", icon: 'hook', maxLevel: 3, costs: [40, 120, 270], effects: { hookWindow: 0.08, sweetZone: 0.012 }, unlock: 'perfect_10_run',
    desc: 'Blunted with use. It still remembers exactly when to bite.' },
  { id: 'barnacle_cloak', name: 'Barnacle Cloak', icon: 'ward', maxLevel: 3, costs: [80, 215, 460], effects: { armor: 0.05 }, unlock: 'untouched',
    desc: 'Heavy, wet, and very hard to bite through. +5% ward.' },
  { id: 'ember_in_resin', name: 'Ember in Resin', icon: 'flare', maxLevel: 3, costs: [55, 150, 325], effects: { flareCooldown: -1.5, flareRadius: 0.5 }, unlock: 'bonfire_night',
    desc: 'A spark from a flare that once saved someone. It is still warm.' },
  { id: 'shimmer_scale', name: 'Shimmering Scale', icon: 'scale', maxLevel: 3, costs: [70, 190, 405], effects: { rarityBonus: 0.02 }, special: 'shimmer:0.04', unlock: 'shimmering',
    desc: 'It never stops catching light. Neither, now, will your catches.' },
  { id: 'remembrance', name: 'Remembrance', icon: 'memory', maxLevel: 3, costs: [110, 270, 540], effects: {}, special: 'memMult:0.08', unlock: 'kindled',
    desc: 'The water remembers a little more of you each time. +8% Memories per level.' },
  { id: 'listening_bobber', name: 'The Listening Bobber', icon: 'bobber', maxLevel: 1, costs: [160], effects: { nibbleTells: 1 }, unlock: 'catch_100',
    desc: 'Painted with a small ear. It hears the difference between hunger and curiosity.' },
  { id: 'torn_ledger', name: 'Torn Ledger Page', icon: 'ledger', maxLevel: 3, costs: [60, 160, 350], effects: { sellMult: 0.06 }, unlock: 'shells_1000_run',
    desc: "A page from Old Murk's accounts. Your name is on it, crossed out, then written in again." },
  { id: 'gamblers_wick', name: "Gambler's Wick", icon: 'reroll', maxLevel: 2, costs: [80, 245], effects: { rerolls: 1 }, unlock: 'kindle_one',
    desc: 'Burns at both ends. One more chance to choose. +1 reroll per run.' },
  { id: 'second_wick', name: 'Second Wick', icon: 'revive', maxLevel: 1, costs: [405], effects: {}, special: 'secondWick', unlock: 'into_the_vault',
    desc: 'Once per run, a killing blow leaves you at 1 Ember with 40 oil and a free flare.' },
  { id: 'waystone_sporewood', name: 'Waystone: Sporewood', icon: 'waystone', maxLevel: 1, costs: [160], effects: {}, special: 'waystone:sporewood', unlock: null, requires: { deepestZone: 1 },
    desc: 'Charcoal pressed against a mossy stone. Begin a descent in Sporewood Pools with 160 Shells and 9 banked levels.' },
  { id: 'waystone_glasswater', name: 'Waystone: Glasswater', icon: 'waystone', maxLevel: 1, costs: [350], effects: {}, special: 'waystone:glasswater', unlock: null, requires: { deepestZone: 2 },
    desc: 'A rubbing of a cold, clear stone. Begin in the Glasswater Vault with 450 Shells and 18 banked levels.' },
  { id: 'waystone_paleabyss', name: 'Waystone: Pallid Deep', icon: 'waystone', maxLevel: 1, costs: [610], effects: {}, special: 'waystone:paleabyss', unlock: null, requires: { deepestZone: 3 },
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
    telegraph: { lungeAt: 3, pause: 0.35, lungeMult: 2.5, lungeTime: 0.5 }, tint: 0x07080d, eyeColor: 0xe8f1f2, scale: 1,
    variants: { sporewood: { eyeColor: 0xffd9c4 }, glasswater: { eyeColor: 0xc9e8ff }, paleabyss: { eyeColor: 0xeae4d3 } },
    desc: 'A fist-sized curl of living ink with two pinprick eyes. It flares its eyes before it lunges.',
    lore: "It doesn't hate you. It's only cold, and you're the only warm thing for miles." },
  { id: 'inkmite', name: 'Inkmite', model: 'mite', zoneMin: 0, dayMin: 2, hp: 1.5, speed: 3.9, damage: 1, oilDrain: 1, xp: 0.5,
    behavior: 'pack', pack: 6, packPerHeat: 0.34, packMax: 10, weights: [5, 4, 3, 2], waterBound: true, burstOnContact: true, zigzag: 1.2, auraTaken: 1,
    tint: 0x0a0a10, eyeColor: 0xd6f59a, scale: 0.8,
    variants: { sporewood: { name: 'Spore Tick', eyeColor: 0xff7fb0, tint: 0x150a14 }, glasswater: { name: 'Shard Mite', eyeColor: 0x5ff2ff, tint: 0x0a0f24 }, paleabyss: { name: 'Ash Mite', eyeColor: 0xeae4d3, tint: 0x0c0b09 } },
    desc: 'Soot-black ticks that skitter in clutches, zig-zagging. Islands break the pack.',
    lore: 'Alone, a crumb of soot. Together, a tide that knows your name.' },
  { id: 'duskmantle', name: 'Duskmantle', model: 'moth', zoneMin: 0, dayMin: 2, hp: 3, speed: 3.4, damage: 0, oilDrain: 1.2, xp: 2,
    behavior: 'latch', pack: 1, weights: [3, 3, 2.5, 2], flies: true, maxLatched: 4, dim: 0.88, lightSpeedMult: 1.15, auraTaken: 1, auraTakenLatched: 0.5, latchedRefund: 1,
    tint: 0x6a5f78, eyeColor: 0x9fe8ff, scale: 1,
    variants: { glasswater: { name: 'Veil Moth', eyeColor: 0xb48cff, tint: 0x2a2244 }, paleabyss: { name: 'Pyrewing', eyeColor: 0xe8c66a, tint: 0xd8d2c0, scale: 1.2 } },
    desc: 'A dusty moth with painted eye-spots. It speeds up in your light, latches on the lantern and drinks it.',
    lore: 'It does not bite. It only loves your light more than you do.' },
  { id: 'creelsnatch', name: 'Creelsnatch', model: 'eel', zoneMin: 0, dayMin: 3, hp: 8, speed: 4.5, damage: 1, oilDrain: 0, xp: 3,
    behavior: 'leap', pack: 1, weights: [2, 2, 2, 1.5], depthMin: 0.4, maxAlive: 2, maxAlivePerHeat: 0.167, steals: true, leapSpeed: 10,
    telegraph: { circle: [3, 6], circleRadius: [6, 9], surface: 1.0, leap: 0.6 }, fleeTime: 3, auraImmuneSubmerged: true, zapAirborneMult: 2, auraTaken: 1,
    tint: 0x07080d, eyeColor: 0xd6f59a, scale: 1,
    variants: { glasswater: { name: 'Prism Eel', eyeColor: 0x5ff2ff, tint: 0x05081a, feint: 0.8 } },
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
    tint: 0x07080d, eyeColor: 0xe8f1f2, scale: 1.5,
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
      glasswater: { name: 'The Undertow Grasp', tipsCreel: 2, eyeColor: 0x5ff2ff },
      paleabyss: { name: 'The Ringed Grasp', pair: true, pairGap: 1.0, tint: 0xd8d2c0, eyeColor: 0xe8c66a, grip: { time: 3, oilPerSec: 3, zapsToBreak: 3 } },
    },
    tint: 0x07080d, eyeColor: 0xe8f1f2, scale: 1,
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
    tint: 0x050c0d, eyeColor: 0x6ff5c8, scale: 1,
    desc: 'A colossal hooded gloom with a hollow, teal-lit maw and candle stubs in its hem like teeth. It inhales.',
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
    tint: 0x03040e, eyeColor: 0x5ff2ff, scale: 1.2,
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
  { id: 'naturalist', tier: 1, name: 'Naturalist', desc: 'Name 8 species in the Journal.', type: 'journal', params: { n: 8 }, scope: 'total', reward: { unlock: 'boon:lucky_knot', memories: 15 } },
  { id: 'gloombreaker', tier: 1, name: 'Gloombreaker', desc: 'Disperse 500 gloomlings across all descents.', type: 'slay', params: { n: 500 }, scope: 'total', reward: { unlock: null, memories: 15 } },
  // ---- II. The Long Vigil (runs 3–8)
  { id: 'unwarded', tier: 2, name: 'Unwarded', desc: 'Silence a Warden.', type: 'boss', params: { n: 1 }, scope: 'total', reward: { unlock: 'character:ashwick', memories: 20 } },
  { id: 'down_the_sluice', tier: 2, name: 'Down the Sluice', desc: 'Reach Sporewood Pools.', type: 'reachZone', params: { zone: 'sporewood' }, scope: 'total', reward: { unlock: 'character:stub', memories: 20 } },
  { id: 'long_vigil', tier: 2, name: 'The Long Vigil', desc: 'Endure 5 Gloomtides in one descent.', type: 'nights', params: { n: 5 }, scope: 'run', reward: { unlock: 'character:tallow', memories: 20 } },
  { id: 'untouched', tier: 2, name: 'Untouched', desc: 'Endure a Gloomtide (night 2 or later) without losing an Ember.', type: 'nightNoDamage', params: { n: 1, minDay: 2 }, scope: 'run', reward: { unlock: 'relic:barnacle_cloak', memories: 15 } },
  { id: 'bonfire_night', tier: 2, name: 'Bonfire Night', desc: 'Disperse 200 gloomlings in a single Gloomtide.', type: 'slayNight', params: { n: 200 }, scope: 'run', reward: { unlock: 'relic:ember_in_resin', memories: 20 } },
  { id: 'full_flame', tier: 2, name: 'Full Flame', desc: 'Raise a weapon Boon to level 5.', type: 'boonLevel', params: { kind: 'weapon', level: 5 }, scope: 'run', reward: { unlock: 'boon:little_maelstrom', memories: 15 } },
  { id: 'night_angler', tier: 2, name: 'Night Angler', desc: 'Land 3 fish during a single Gloomtide.', type: 'nightCatch', params: { n: 3 }, scope: 'run', reward: { unlock: 'boon:lantern_on_the_line', memories: 15 } },
  { id: 'perfect_10_run', tier: 2, name: 'Clockwork Wrist', desc: 'Set 10 perfect hooks in one descent.', type: 'perfectHooks', params: { n: 10 }, scope: 'run', reward: { unlock: 'relic:steady_hook', memories: 15 } },
  { id: 'kindled', tier: 2, name: 'Kindled', desc: 'Reach level 15 in one descent.', type: 'level', params: { n: 15 }, scope: 'run', reward: { unlock: 'relic:remembrance', memories: 20 } },
  { id: 'shimmering', tier: 2, name: 'Shimmering', desc: 'Land a Shimmering fish.', type: 'quality', params: { quality: 'perfect' }, scope: 'total', reward: { unlock: 'relic:shimmer_scale', memories: 10 } },
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
  fine:    { id: 'fine',    label: 'Fine',       valueMult: 1.4, yieldMult: 1.1,  threshold: 0.45, chance: 0.05, color: 0x9fe8d8 },
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
export const RARITY_COLORS = { common: 0xd8d2c0, uncommon: 0x9fe8d8, rare: 0xb48cff, epic: 0xff8fc0, legendary: 0xe8c66a };
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
export const LEGENDARY_BY_ZONE = Object.fromEntries(ZONES.map((z) => [z.id, SPECIES.find((s) => s.zone === z.id && s.rarity === 'legendary')?.id || null]));
