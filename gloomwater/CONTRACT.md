# GLOOMWATER — Architecture Contract (hybrid: sail · fish · survive the swarm)

This is the binding interface contract for every module. Modules are written in
parallel by different authors; **if it's not in here, don't depend on it**. If you
need something extra from another module, call it defensively (`ctx.x.fn?.()`) and
degrade gracefully.

**Pitch.** A lantern-lit 3D fishing-survival roguelite. A tiny candle-headed wanderer,
**the Wick**, sails a raft across drowned cavern lakes beneath a fallen kingdom.
- **Day (calm):** sail freely around the lake, chase shimmering fishing spots, anchor
  and fish (skill-based cast → bite → tension reel). Eat fish (hunger), render fish
  into lantern oil (light), or keep them to sell to **Old Murk**, the toad merchant
  whose barge moors somewhere on the lake each day.
- **Night (Gloomtide):** a Megabonk/survivors-style swarm. Shades pour in from the
  dark; the lantern's light **auto-burns** anything inside it, the **flare** is the
  active skill, taps **zap** single shades. Slain shades drop **embers** (XP) →
  level up → **pick 1 of 3 Boons** (stat boosts and lantern "weapons" like orbiting
  wisps or chain sparks). Survive until dawn. Nights escalate every day.
- **Run:** four zones, each a new lake; a **Descent Gate** (whirlpool) opens when the
  zone's requirements are met (e.g. land its legendary). Final legendary: the
  **Pale Leviathan**. Death ends the run.
- **Meta:** **Memories** buy permanent **Relics** at the Shrine; **Challenges**
  (Megabonk-style checklist) unlock new **Wicks** (characters), new Boons, Relics and
  baits; a fish **Journal** to complete; **Waystones** to start deeper.

---------------------------------------------------------------------------------

## 1. Files & ownership

```
gloomwater/
  build.mjs            bundler -> single-file index.html (integrator)
  index.html           BUILT OUTPUT – never edit by hand
  CONTRACT.md          this file
  DESIGN.md            game design doc (design team) – implement it faithfully
  src/template.html    page shell (integrator)
  src/main.js          bootstrap, loop, input routing, flow, debug API (integrator)
  src/core.js          bus, rng, math, storage helpers (integrator)
  src/toon.js          shared toon/ink/glow material toolkit (integrator)
  src/data.js          ALL content & balance tables (design team)
  src/render.js        renderer, camera rig, post-processing        (render author)
  src/water.js         water surface, ripples, splashes, wakes      (render author)
  src/world.js         per-zone lake arenas: layout, collision, environment art (world author)
  src/models.js        procedural fish, creatures, instanced swarms  (actors author)
  src/actors.js        Wick, raft, lantern, rod/line/bobber, merchant (actors author)
  src/player.js        raft movement controller, interactions        (survival author)
  src/survival.js      day/night clock, oil/satiety/embers, damage, death (survival author)
  src/combat.js        swarm director, enemy AI, aura/zap/flare, XP, boons & weapons (combat author)
  src/fishing.js       fishing state machine, reel minigame, spots, species pick (fishing author)
  src/progression.js   stats, economy, creel, shop, zones/gate, journal, bounties, relics,
                       characters, challenges, unlocks (progression author)
  src/ui.js + ui.css   all DOM UI (ui author)
  src/audio.js         procedural WebAudio music + SFX (audio author)
  tools/playtest.mjs   headless Chromium smoke test + screenshots
  tools/scenario-full.mjs  full-flow integration scenario
  tools/stub.js        universal stub for isolated builds
```

Rules:
- Edit **only your own files**. You may add helper files `src/<yourmodule>-*.js`
  imported only by your module.
- Imports allowed: `three`, `three/examples/jsm/...`, `./core.js`, `./toon.js`,
  `./data.js`, your own helpers, and (ui only) `./ui.css` (imported as a text string).
- **Never import another gameplay module.** Reach others at runtime through `ctx`.
- No network, no external assets: geometry, textures (canvas), audio (WebAudio) are
  all procedural. Google Fonts are linked with serif fallbacks; never rely on them.
- Plain ES2020 JS. three.js **0.170.0** (WebGL2).
- `localStorage` only through `core.storage` / `loadSave` / `writeSave`.
- Robust: a missing optional call must never crash the frame. Guard with `?.`.

## 2. Module shape & lifecycle

```js
export function create(ctx) {      // build objects; do NOT touch other modules yet
  return { init() {}, update(dt, t) {}, ...publicApi };
}
```
Creation order: `render, water, world, models, actors, progression, survival, player,
combat, fishing, audio, ui`. Then every `init()` (safe to use `ctx.*`), then the loop.
A module whose `create`/`init` throws is replaced by a universal stub.

**dt semantics**
| modules | `dt` passed to `update(dt, t)` |
|---|---|
| render, water, world, models, actors, audio, ui | `ctx.time.dt` — real frame time (≤ 0.05 s); ambience keeps living while paused |
| player, fishing, survival, combat, progression | `ctx.time.gameDt` — 0 when paused, a blocking UI is open (shop, level-up picker…), or flow ≠ `'playing'` |

`t` = total real seconds; `ctx.time.gameT` = accumulated game time; `ctx.time.timeScale`.

Frame order: input → player → fishing → survival → combat → progression → actors →
models → world → water → audio → ui → render.update → render.render().

## 3. The `ctx` object

```js
ctx = {
  THREE, bus, data,                      // data = import * as data from './data.js'
  state: { meta, run },                  // §5 (run null between runs)
  time: { dt, gameDt, t, gameT, timeScale, frame },
  flow: 'boot'|'title'|'playing'|'dead', paused: false,
  input: {
    down, x, y, ndc: Vector2, pressed, released,   // primary pointer (mouse/touch/pen)
    keys: Set<code>,
    move: Vector2,   // keyboard WASD/arrows, x right, y up(=forward on screen), length ≤ 1
    joy: Vector2,    // virtual joystick (ui writes it on touch), same convention
  },
  game: { startNewRun({startZone, character}), continueRun(), endRun(cause), toTitle(),
          victory(), pause(), resume(), togglePause(), save(), wipeAll(), hasSavedRun() },
  debug: {}, isMobile, errors: [],
  render, water, world, models, actors, progression, survival, player, combat, fishing, audio, ui,
}
window.__gw = ctx
```
Movement input is **screen-relative**: `move`/`joy` up = away from the camera.
`player` converts it to world space using the camera yaw.

## 4. Flow, input routing, saving (main.js)

- Boot → `flow='title'`; `ui.showTitle()` (Continue / New Descent with character +
  Waystone choice / Shrine / Challenges / Journal / Settings). Scene renders behind.
- `startNewRun({startZone, character})`: `run = progression.createRun(...)`,
  `flow='playing'`, emit `zone:change {zone, prev:null}` then `run:start {continued:false}`.
  main increments `meta.runs`.
- `continueRun()`: restore saved run; same events with `continued:true`.
- `endRun(cause)` (on `player:died`): `summary = progression.summarizeRun(cause)`;
  main updates `meta.deaths`, `meta.bestDay`; `run.active=false`; `flow='dead'`;
  emit `run:end {summary}`; save; `ui.showDeath(summary)`.
- `victory()` (on `victory`): `meta.victory=true`, `meta.victories++`, `ui.showVictory(summary)`;
  play continues (endless) after the screen closes.
- `toTitle()`: save, `flow='title'`, `ui.showTitle()`.
- Autosave on `phase:change`, `fish:landed`, `shop:buy`, `relic:buy`, `zone:change`,
  every 30 s of play, on `visibilitychange` hidden and `pagehide`.

**Pointer** (events on the canvas host; `#ui` sits above with `pointer-events:none`
except interactive elements — the touch joystick zone is a UI element, so joystick
touches never reach the canvas):
1. First gesture → `audio.unlock()`.
2. Ignore if `flow!=='playing'`, `paused`, or `ui.isBlocking()`.
3. pointerdown: `combat.onPointerDown(ndc)` (zap a shade) → if false:
   `actors.pickMerchant(ndc) && progression.canShop()` → `ui.openShop()` → else
   `fishing.onPointerDown()` (fishing reads `ctx.input.ndc` to aim at the water).
4. pointermove → `fishing.onPointerMove(ndc)`; pointerup/cancel → `fishing.onPointerUp()`.
5. Multi-touch: main tracks the pointer whose press reached `fishing.onPointerDown()`; only that
   pointer's move/up/cancel go to fishing. Other pointers zap / open the shop and never reach
   fishing while that hold lasts. `input.ndc`/`input.down` follow that (primary) pointer.
`ctx.isMobile` = touch device (`(pointer: coarse)`), never inferred from the viewport size.

**Keyboard**: `ui.handleKey(code)` first (true = consumed). Else: `WASD`/arrows →
`input.move` (main recomputes every frame); `Space` or `KeyF` → `combat.flare()`;
`KeyE` → `player.interact()`; `Escape`/`KeyP` → pause toggle.

## 5. State schema & ownership

```js
state.meta = {
  memories, memoriesEarnedTotal, relics:{relicId:level},
  journal:{speciesId:{caught, biggest, firstDay, firstRun}},
  challenges:{challengeId:true}, challengeProgress:{challengeId:number},  // progression
  unlocks:{ 'character:<id>':true, 'boon:<id>':true, 'relic:<id>':true, 'bait:<id>':true },
  bestDay, deepestZone /*index*/, runs, deaths, victory, victories, totalFish, totalSlain,
  bestLevel, tutorialDone, seenTips:{tipId:true}, lastCharacter,
  settings:{ master, music, sfx, quality, screenShake, damageNumbers },
}
state.run = {
  active:true, id, seed, playTime, character:'<characterId>',
  day:1, phase:'calm', phaseTime:0,              // survival
  hp, oil, satiety,                              // survival (max from getStats)
  zone:'mossmere', zonesUnlocked:['mossmere'], gateOpen:false,   // progression
  shells, bait:{baitId:count}, equippedBait, creel:[Fish], upgrades:{id:level},
  legendaries:{speciesId:true}, bounties:[Bounty],                // progression
  level:1, xp:0, xpNext, boons:{boonId:level}, rerollsUsed:0,     // combat
  stats:{ fishCaught, fishLost, perfectHooks, enemiesSlain, elitesSlain, bossesSlain,
          shellsEarned, biggest:{speciesId,weight}|null, newSpecies, damageTaken,
          nightsSurvived, nightsNoDamage, maxLevel },
  flags:{},
}
Fish = { uid, speciesId, weight, quality:'normal'|'fine'|'perfect', value, food, oil, caughtDay }
```
Only the owner mutates a field; others call the owner's API (e.g. eating →
`survival.addSatiety(n)`). Any module may increment `run.stats.*` counters for events
it observes. Player position is NOT saved (a continued run respawns at the zone spawn).

## 6. Events (bus)

| event | payload | emitter |
|---|---|---|
| `boot` / `flow:change` | `{}` / `{flow, prev}` | main |
| `run:start` | `{continued}` | main |
| `run:end` | `{summary}` | main |
| `phase:change` | `{phase, prev, day}` — `calm`→`dusk`→`gloomtide`→`dawn`→ (day+1) `calm` | survival |
| `day:start` | `{day}` | survival |
| `resource:low` | `{resource:'oil'|'satiety'|'hp'}` edge-triggered | survival |
| `player:damage` | `{amount, source}` | survival |
| `player:heal` | `{amount}` | survival |
| `player:died` | `{cause:'darkness'|'starvation'|'gloom'|...}` | survival |
| `lantern:out` / `lantern:lit` | `{}` | survival |
| `player:anchor` | `{anchored}` | player |
| `interact:change` | `{id:'merchant'|'gate'|null, label}` | player |
| `enemy:spawn` | `{enemy}` | combat |
| `enemy:hit` | `{enemy, position, amount, crit}` | combat |
| `enemy:slain` | `{enemy, position}` | combat |
| `enemy:steal` | `{enemy, fish}` | combat |
| `boss:spawn` / `boss:slain` | `{enemy}` | combat |
| `flare` | `{position, radius}` | combat |
| `xp:gain` | `{amount, total}` (throttled/aggregated ≤ 10/s) | combat |
| `levelup` | `{level, options:[BoonOption]}` | combat |
| `boon:chosen` | `{boonId, level}` | combat |
| `fishing:state` | `{state, prev}` | fishing |
| `fishing:cast` | `{power, target:Vector3}` | fishing |
| `fishing:land` | `{position}` | fishing |
| `fishing:nibble` / `fishing:bite` | `{}` / `{speciesId}` | fishing |
| `fishing:hook` | `{speciesId, perfect}` | fishing |
| `fishing:miss` | `{reason:'early'|'late'|'moved'}` | fishing |
| `fishing:surge` | `{strength}` | fishing |
| `fishing:caught` | `{speciesId, weight, quality}` | fishing |
| `fishing:escaped` | `{speciesId, reason:'slack'|'snap'}` | fishing |
| `fish:landed` | `{fish, isNew, isRecord, species}` | progression |
| `fish:action` | `{action, fish, gained}` | progression |
| `shells:change` | `{shells, delta}` | progression |
| `merchant:arrive` / `merchant:leave` | `{}` | progression |
| `shop:buy` | `{itemId, item}` | progression |
| `gate:open` | `{zone}` (next zone now reachable) | progression |
| `zone:unlock` | `{zone}` | progression |
| `zone:change` | `{zone, prev}` | progression (travel) & main (run start) |
| `journal:new` | `{speciesId}` | progression |
| `bounty:new` / `bounty:complete` | `{bounty}` | progression |
| `challenge:complete` | `{challenge}` | progression |
| `unlock` | `{key, label}` e.g. `character:ashwick` | progression |
| `relic:buy` | `{relicId, level}` | progression |
| `victory` | `{}` | progression |
| `toast` | `{text, kind:'info'|'good'|'bad'|'lore'}` | anyone → ui |
| `ui:modal` | `{open, id}` | ui |

## 7. Module APIs

**Space.** Metres; **water surface y = 0**; each zone is a roughly circular cavern
lake centred on the origin, radius `zone.arena.radius` (~55–80 m) with obstacle
islands/pillars. The raft moves; `ctx.player.position` is the truth. Heading/yaw:
radians about +Y, **yaw 0 faces −Z**, positive yaw turns toward −X (three.js
convention: `object.rotation.y = yaw`). All models face **+Z** locally (so
`lookAt(target)` points them at it) — the raft/Wick group is rotated so the raft's
bow faces its heading. The **camera keeps a fixed world yaw by default** (looking
toward −Z), elevated behind/above the raft, so screen-up ≈ world −Z.

### render (`render.js`)
```
renderer, scene, camera, canvas
setQuality('low'|'medium'|'high'|'auto'); setGrade({exposure, bloomStrength, bloomRadius,
  bloomThreshold, tint, tintAmount, vignette, saturation, grain})   // partial merge, eased
shake(intensity=0.3, duration=0.35); flash(hex=0xffffff, strength=0.5, duration=0.25)
projectToScreen(vec3) -> {x, y, visible}; raycast(ndc, objects, recursive=true)
groundPoint(ndc, y=0) -> Vector3|null     // pointer ray ∩ horizontal plane (fishing aim)
getCameraMode(); getYaw() -> camera yaw (for screen-relative movement)
render()
```
Owns `scene.fog` (FogExp2) + clear colour (world sets colour/density). Camera modes,
auto-selected each frame and smoothly blended, all following `ctx.player.position`:
`title` (slow cinematic orbit of the raft), `sail` (default: elevated 3/4 chase,
~13 m back/9 m up, pitch ~35°, horizon & layered cavern visible), `fish` (closer,
framing raft + `ctx.fishing.bobberPos`), `reel` (tighter, dramatic), `night`
(higher/wider during gloomtide so the swarm is readable), `shop` (toward merchant),
`death` (slow rising crane). Portrait screens widen FOV/pull back. Subtle sway.
Post: RenderPass → UnrealBloomPass → grade pass (vignette, film grain, split-tone,
edge chromatic fringe, faint paper texture) → OutputPass. Low quality: pixelRatio ≤1,
cheaper bloom. Auto quality: mobile→low/medium; drop a tier if fps < 40 sustained.

### water (`water.js`)
```
mesh; getHeight(x, z) -> y; addRipple(x, z, strength=1); splash(x, z, {size, color, count})
addWake(x, z, dirX, dirZ, strength)      // V-wake / foam streak behind the moving raft
setPalette({deep, shallow, foam, glow, fogColor}); setLights([{position, color, intensity}]) // ≤6
```
`setLights` entries may also carry `radius` (lit pool, m; else `distance`), `streak`, `ring` (0..1 reach
ring); world passes the lantern with `radius = survival.lightRadius, ring: 0.5`. The shore foam
follows `world.getShoreRadius(angle)` when world provides it.
Water must cover the whole arena (follow the camera/player or be large); getHeight
must match the shader's displacement. Stylised: ink-dark water, banded fresnel toward
fog colour, painterly streak reflections of lights, caustic shimmer, ≥24 ripple rings,
foam where water meets islands (optional), wakes.

### world (`world.js`)
```
group
setZone(zoneId, {instant})          // build the zone's lake arena + environment (dispose old)
getZone() -> zone data
bounds -> {radius}
getSpawn() -> {position:Vector3, yaw}
getDepth(x, z) -> 0..1              // 0 shallow shore … 1 deepest; drives species depth bands
collide(position:Vector3, radius) -> Vector3   // pushes position out of obstacles/shore (mutates+returns)
isOpenWater(x, z, radius) -> bool
randomWaterPoint({from, minDist=0, maxDist=Infinity, depthMin=0, depthMax=1, clearance=1}) -> Vector3
getMerchantDock(day) -> {position, yaw}       // mooring spot (varies by day)
getGate() -> {position, radius}               // Descent Gate whirlpool location
setGateState('hidden'|'sealed'|'open')        // visual state of the gate
getObstacles() -> [{x, z, r}]                 // collision circles (for AI steering)
getShoreRadius(angle) -> m                    // extra: the noisy cliff line (water's shore foam)
```
Layout comes from `zone.arena` (islands/pillars arrays, gate, spawn, docks, deepPools, layout recipe,
depthShare; DESIGN §4.3–4.6); procedural placement only fills fields that are missing.
`getMerchantDock(day)`: day 1 → `docks[0]`, then `(seed + 2·day) % n`, never yesterday's dock.
Listens to `zone:change`. Reads `ctx.survival.getPhaseInfo()` each frame to darken/cool
for dusk/gloomtide and warm at dawn; owns hemisphere + directional crack-light + ≤2
accent point lights; drives `scene.fog`, `render.setGrade`, `water.setPalette`, and
`water.setLights` (merge `ctx.actors.lanternLight`, the merchant lamp, its own glows).
Art: islands/pillars/wrecks/roots/fungi/crystals per zone (toon + ink outlines,
InstancedMesh), cliffs ringing the lake, **4–6 parallax silhouette rings** beyond the
cliffs (ink-dark near → luminous misty far, painted canvas alpha textures or shapes),
ceiling stalactites, drifting particles, light shafts, the gate whirlpool.

### models (`models.js`)
```
createFish(speciesOrId, weightKg) -> FishVisual
createCreature(kind) -> CreatureVisual                 // any kind, individually animated
createSwarm(kind, max) -> Swarm                        // instanced hordes: 'wisp'|'mite'|'moth'|'eel'
FishVisual     = { object3d, length, update(dt,t,{swim=1, struggle=0, flop=0}), setGlow(k), dispose() }
CreatureVisual = { object3d, radius, update(dt,t,{state:'idle'|'move'|'attack'|'hurt'|'die', k}), hit(), dispose() }
Swarm          = { object3d, max, setCount(n), set(i, position, yaw, scale=1, hurt=0, fade=0, phase=0),
                   update(dt, t), dispose() }           // hurt 0..1 = white flash, fade 0..1 = dissolve
```
Creature kinds: `wisp` (inky shade, pale pinprick eyes, trailing tendrils), `mite`
(tiny skittering shadow tick, packs), `moth` (dusty violet moth, glowing eye-spots,
eats light), `eel` (shadow eel arcing out of the water), `hand` (huge dripping shadow
hand rising from the water — elite), `warden` (colossal hooded shade with a hollow
glowing maw — night boss). Fish shapes: `minnow, perch, carp, pike, eel, angler, ray,
puffer, jelly, crayfish, koi, ghost, leviathan`; params `{shape, body, belly, fin, glow,
pattern, eyes, scale}`. Swarms ≤ 3–4 draw calls each (body + outline + eyes instanced).

### actors (`actors.js`)
```
group, raft, wick, lanternLight (PointLight)
getRodTip() -> Vector3 (new, world)
setLine({visible, end, tension, slack}); setBobber({visible, position, state})  // states: flying|floating|nibble|bite|hooked
setPose(name)  // idle|paddle|charge|cast|wait|hookset|reel|strain|catch|eat|flare|zap|hurt|die|celebrate|levelup
setCharge(k); setReel(k, lateral); setAim(worldYaw|null)   // Wick turns to face cast direction
setLanternLevel(k 0..1); setLightRadius(m); setVitality(k 0..1)
setCharacter(characterData)     // look: flame colour, cloak colour, hat/hood variant, eye colour
showCatch(fishVisual|null)
merchant: { arrive(position, yaw), leave(), present, position, object3d }
pickMerchant(ndc) -> bool
setRaftLevel(n 0..3)
```
Each frame actors places the raft group at `ctx.player.position`, `rotation.y =
ctx.player.heading`, adds wave bob/tilt (water.getHeight) and lean from velocity,
paddle animation when moving. The Wick (ORIGINAL): small round candle-creature, dark
cloak, a living flame on its head (= vitality), two glowing amber eyes in a shadowed
face, stubby legs, long bent rod. Raft: lashed dark planks, crooked pole with a
hanging iron lantern (main light), tiny brazier, wicker creel, oar. Old Murk: hunched
umber toad with rust-moss and ochre lichen, a towering pack and a dim sage-green lamp (the
game's one deliberate green trace) on a withered bronze lily-barge, rings a bell.

### player (`player.js`)
```
position (Vector3, live), velocity (Vector3), heading (yaw), speed, anchored (bool)
getForward() -> Vector3; teleport(position, yaw)
interactable -> {id:'merchant'|'gate', label} | null; interact() -> bool
isNear(id) -> bool
```
Movement: combine `input.move` + `input.joy` (screen-relative, rotate by
`render.getYaw()`), accelerate toward `dir * stats.moveSpeed` with boat-like inertia
& drag, heading turns toward velocity, `world.collide`. Anchored (no movement) while
`fishing.state` ∈ {bite, reeling, landing}; movement input while charging/casting/
waiting → `fishing.cancel('moved')`. Emits wakes (`water.addWake`) and paddle ripples.
Interactions: within ~5 m of the moored merchant → `merchant` ("Trade"); within the
open gate radius → `gate` ("Descend"). `interact()` → `ui.openShop()` /
`ui.openDescend()`. Respawn at `world.getSpawn()` on `zone:change`.

### survival (`survival.js`)
```
getPhaseInfo() -> {phase, day, time, duration, k, isNight, nextPhase}
damage(n, source) ; heal(n); addOil(n); addSatiety(n)
isInvulnerable() -> bool
lightRadius      // current effective light/aura radius in metres
```
Clock (phase durations from data), drains (× phase/zone/difficulty/stats), starvation
& darkness damage, i-frames + armor, dawn heal per design, death → `player:died`.
Each frame: `actors.setLanternLevel(oil/maxOil)`, `actors.setLightRadius(r)` where
r = `stats.lightRadius × f(oil)`, `actors.setVitality(hp/maxHp)`. `resource:low` edges.
Debug: `ctx.debug.skipPhase()`, `ctx.debug.god(on)`, `ctx.debug.setPhase(name)`.
Extras others use: `setPhase(name)` (public; the Leviathan landing jumps to dawn), `lanternOut`,
`appliesCombatLight = true` (lightRadius already folds in `combat.lightMult` and `combat.lightAdd`),
`holdingGloomtide` (a gloom-time legendary on the line holds the Gloomtide in its hush until it
resolves), `damage()` returns the Embers actually lost (0 when warded / i-framed).

### combat (`combat.js`)
```
enemies -> [{id, kind, enemyId, position, hp, maxHp, elite, boss}]
onPointerDown(ndc) -> bool        // tap/click a shade within ~48 px → zap it (costs oil)
flare() -> bool; flareReady() -> 0..1
addXp(n); level, xp, xpNext (getters on run)
pendingOptions -> BoonOption[] | null; chooseBoon(boonId); reroll() -> BoonOption[]|null
getBoons() -> [{boon, level}]
killAll(reason)
BoonOption = { boonId, name, desc, rarity, level /*the level it will become*/, isNew, icon }
```
Extras others use: `lightMult` (= `lightDims × flareBoost`; `lightDims` includes the legendary
Eclipse `fishing.lightMult` under the shared dim floor), `lightAdd` (Gutsfire), `auraRadius`,
`freeFlare()` (a free burst: no oil, no cooldown — the Second Wick revive), `pendingCount`,
`levelUpKind` ('level'|'gift'|'draft'), `speedMult`, `rooted`. `addXp(n)` also feeds `xp:gain`.
Spawn director from `data.difficultyFor(day, zoneIndex, k)` during dusk (sparse) and
gloomtide (full), spawn points via `world.randomWaterPoint` on a ring 22–34 m from the
player, steering around `world.getObstacles()`. Enemy behaviours per data (wisp chase,
mite packs, moth latches onto the lantern draining oil, eel leaps to bite/steal a fish
via `progression.removeFromCreel`, hand elite with telegraph, warden boss). **Aura:**
enemies within `survival.lightRadius` take `stats.auraDps` × oil-fraction per second.
Zap & flare per stats; boon weapons (`data.BOONS` with `weapon`) implemented here with
VFX (toon glows/lines). Embers drop from slain enemies, glide to the raft inside
`stats.pickupRadius`, grant XP × `stats.xpMult`; on level-up compute 3 options from
`data.BOONS` (respect unlocks, maxLevel, rarity weights, `stats.luck`) → set
`pendingOptions`, emit `levelup` (ui shows picker; game paused while open).
Dawn: remaining shades dissolve (`killAll('dawn')`), embers auto-collect. Calls
`survival.damage()` for hits; uses `models.createSwarm` for hordes and
`createCreature` for elites/bosses. Debug: `ctx.debug.spawn(idOrKind)`,
`ctx.debug.killAll()`, `ctx.debug.levelUp()`, `ctx.debug.giveBoon(id)`.

### fishing (`fishing.js`)
```
state   // idle|charging|casting|waiting|bite|reeling|landing|lost
view = { charge, castDist, aim, tension, sweetMin, sweetMax, danger, progress, surge,
         surgeWarn, stamina, biteWindow, speciesId|null, rarity|null, hint }
bobberPos (Vector3|null); spots [{position, radius, strength, ttl, rare}]
onPointerDown(); onPointerMove(ndc); onPointerUp(); cancel(reason); isBusy()
```
Aim: `render.groundPoint(ndc)` → direction from raft to that point (world yaw) and
shown as a reticle + range ring around the raft; hold → ping-pong charge meter
(timing skill) → release casts (distance = charge × castMax, ballistic bobber,
splash/ripples). Bite logic, reel tension model, surges, snap/slack, legendary boss
mechanics, quality — exactly as DESIGN.md. Species by zone, **depth at the bobber
(`world.getDepth`)**, phase, bait, spots and stats. Spots spawn via
`world.randomWaterPoint` and are visible from afar (shimmering mote columns) so the
player sails to them. Owns hooked-fish visuals (models.createFish, leaps/splashes),
reticle, spot visuals. Calls `progression.consumeBait()` per cast.
Debug: `ctx.debug.forceBite()`, `ctx.debug.instantCatch(speciesId?)`.

### progression (`progression.js`)
```
getStats(run = ctx.state.run) -> Stats   // base + character + upgrades + relics + boons (stat boons)
createRun({startZone='mossmere', character}) -> run
summarizeRun(cause) -> RunSummary        // applies Memories & meta records & challenge progress
makeFish(speciesId, weight, quality) -> Fish
addToCreel(fish) -> bool; removeFromCreel(uid?) -> Fish|null   // no uid = random fish (eel theft)
fishAction(fishOrUid, action) -> {ok, msg, gained}   // keep|eat|render|sell|release
canShop() -> bool                         // merchant present & player near
shop: { getItems() -> ShopItem[], buy(itemId) -> {ok, msg} }
getZones() -> [{...zone, unlocked, current, canTravel, reason}]; travel(zoneId) -> {ok, msg}
getGateInfo() -> {open, nextZone, requirements:[{label, done}]}
getJournal(); getBounties(); getRelics(); buyRelic(id)
getCharacters() -> [{...character, unlocked, reason}]
getChallenges() -> [{...challenge, done, progress, target}]
getWaystones() -> zoneId[]; equipBait(id); getEquippedBait(); consumeBait() -> baitId|null
isUnlocked(key) -> bool
```
RunSummary = `{cause, day, zone, character, level, fishCaught, shellsEarned, newSpecies,
enemiesSlain, legendaries, memories, breakdown:[{label, value}], records:[string],
challengesCompleted:[challenge]}`. ShopItem = `{id, name, desc, category, price, level,
maxLevel, canBuy, reason}`.
Listens to `fishing:caught` → Fish, journal, records, bounties → `fish:landed`.
Merchant: arrives at `calm` start at `world.getMerchantDock(day)` (calls
`actors.merchant.arrive(pos, yaw)`, emits `merchant:arrive`), leaves at dusk. Gate:
evaluates zone requirements → `run.gateOpen`, `world.setGateState`, `gate:open`.
Challenges tracked from bus events (run-scope and lifetime) → `challenge:complete`
+ `unlock`. Emits `victory` on landing the final legendary.
Debug: `ctx.debug.addShells(n)`, `addMemories(n)`, `unlockZone(id)`, `giveFish(id)`,
`openGate()`, `completeChallenge(id)`.

### ui (`ui.js`, `ui.css`)
```
isBlocking(); isShopOpen(); handleKey(code) -> bool
showTitle(); showDeath(summary); showVictory(summary)
openShop(); openCreel(); openJournal(); openShrine(); openChallenges(); openSettings();
openPause(); openDescend(); openLevelUp(options); closeAll()
showCatch(fish, {isNew, isRecord, species}); toast(text, kind); floatText(worldPos, text, css);
damageNumber(worldPos, amount, crit); banner(title, subtitle)
```
Everything inside `#ui`. HUD: Embers (flames), oil gauge, satiety gauge, shells,
day/phase clock, zone, XP bar + level, owned boon icons, bait, creel count, flare
button with cooldown (essential on touch), Creel/Journal/Pause buttons, interaction
prompt button (from `player.interactable`), off-screen edge markers for the merchant,
the open gate and fishing spots. Touch: floating virtual joystick in the lower-left
zone writing `ctx.input.joy`. Fishing UI from `ctx.fishing.view` (charge meter, bite
prompt at bobber, reel tension gauge with sweet band, surges, progress). Level-up:
1-of-3 Boon cards (+ reroll if available) → `combat.chooseBoon`. Catch card (Keep / Eat /
Render / Release). Title: character select (locked ones show their challenge),
Waystones, Challenges checklist, Shrine, Journal, Settings. Death/victory summaries.
Area-title banners, tips (`data.TIPS`, `meta.seenTips`). ≥44 px touch targets.
The level-up picker opens automatically on `levelup` (listen to the bus).
Debug: `ctx.debug.ui()` → `{openModal, tips}`.

### audio (`audio.js`)
```
unlock(); play(name, {volume, pitch, pan}); setMood(mood); applySettings()
```
SFX: `ui_click, ui_hover, ui_open, ui_close, cast_whoosh, bobber_plop, nibble, bite,
hook, reel_tick, line_strain, line_snap, splash_small, splash_big, catch_fanfare,
new_species, coin, buy, eat, render_oil, flare, zap, aura_burn, enemy_spawn, enemy_hit,
enemy_die, player_hurt, heartbeat, gloom_rise, dawn, merchant_bell, xp_pickup, levelup,
boon_pick, paddle, anchor, boss_roar, challenge_complete, unlock, gate_open, descend,
death, victory, denied`. Moods auto-picked from ctx: `title, calm, dusk, gloom, reel,
boss, death, victory` (+ per-zone colour). Subscribes to the bus for most SFX
(throttle high-frequency ones like enemy_hit / xp_pickup). Procedural only;
melancholic, original.

## 8. Data schema (`data.js`)

```js
export const STATS = { key: { label, base, fmt:'int'|'pct'|'x'|'m'|'s'|'num' } }
export const BALANCE = { phases:{calm,dusk,gloomtide,dawn}, drain:{...}, damage:{...},
  move:{accel, drag, turnRate}, xp:{...}, reel:{...}, cast:{...}, combat:{...}, ... }
export const ZONES = [{ id, name, subtitle, index, arena:{radius, islands, pillars, seed},
  unlock:{shells, requires:[...]}, drain:{oil, satiety}, gloom, valueMult,
  palette:{fog, fogDensity, water, waterDeep, foam, glow, accent, ambient, ink, far, light, lamp?},
  grade:{exposure, bloomStrength, bloomRadius, bloomThreshold, tint, tintAmount, vignette, saturation, grain}, description }]
// palette.lamp (optional, falls back to glow): the cold light of island lamps, dock/decor buoys,
// statue orbs and the rings' lit windows (world-art) and the dock halos (world). Keep it cold
// (Mossmere #c8d2f0) so no lamp competes with the Wick's lantern or the Cinders. UI may read it
// as --zone-lamp.
export const SPECIES = [{ id, name, zone, rarity:'common'|'uncommon'|'rare'|'legendary',
  weight:[min,max], value, food, oil, time:'any'|'calm'|'gloom', depth:[min,max] /*0..1*/,
  bait:null|baitId, difficulty:{power, surgeEvery, surgeTime, stamina, sweet, erratic, window},
  behavior:'steady'|'darter'|'sinker'|'thrasher'|'leaper', model:{...}, lore, final?, boss? }]
export const BAITS, UPGRADES, SUPPLIES, RELICS   // costs.length === maxLevel; effects on STATS keys
export const ENEMIES = [{ id, name, model:'wisp'|'mite'|'moth'|'eel'|'hand'|'warden', zoneMin, hp,
  speed, damage, oilDrain, xp, behavior, elite?, boss? }]
export const BOONS = [{ id, name, desc, icon, rarity:'common'|'rare'|'epic'|'legendary', maxLevel,
  kind:'stat'|'weapon', effects?:{statKey: perLevel}, weapon?:'orbit'|'spark'|'motes'|'trail'|'nova'|'beam'|...,
  levels?:[{...per-level weapon params}], unlock:null|'<challengeId>', tags:[] }]
export const CHARACTERS = [{ id, name, title, desc, unlock:null|'<challengeId>', effects:{...},
  startBoon:null|boonId, startKit:{shells, bait:{}, ...}, look:{flame, cloak, eyes, hat} }]
export const CHALLENGES = [{ id, name, desc, type, params:{...}, scope:'run'|'total',
  reward:{ unlock:'character:<id>'|'boon:<id>'|'relic:<id>'|'bait:<id>'|null, memories } }]
export const BOUNTIES, TIPS = [{id, text, trigger}], MERCHANT_LINES, EPITAPHS, TEXT, QUALITY,
  FISH_SHAPES, CREATURE_KINDS, lookup maps *_BY_ID
export function difficultyFor(day, zoneIndex, k /*0..1 through the night*/) -> { spawnRate /*enemies/s*/,
  maxAlive, hpMult, speedMult, damageMult, drainMult, kinds:[{id, w}], eliteEvery /*s|0*/, boss:enemyId|null }
export function xpForLevel(level) -> xp needed to go from level to level+1
export function memoriesFor(summary) -> { total, breakdown:[{label, value}] }
```

**STATS keys & semantics** (exact names; effects are additive per level):
| key | meaning |
|---|---|
| maxHp | max Embers (hearts, integer) |
| maxOil / maxSatiety | gauge capacity |
| oilDrain | oil/s during calm (× phase, zone, difficulty) |
| satietyDrain | satiety/s (× zone, difficulty) |
| lightRadius | metres of lantern light at full oil (scaled by oil fraction); aura range |
| auraDps | damage/s dealt to enemies inside the light (× oil fraction) |
| flareCost / flareRadius / flareCooldown | oil per flare, burst radius m, seconds |
| zapCost / zapDamage | oil per tap-zap, damage per zap |
| damageMult | multiplier on all damage dealt to enemies |
| cooldownMult | multiplier on flare & weapon cooldowns (<1 faster) |
| critChance | 0..1 chance for double damage |
| moveSpeed | raft top speed m/s |
| pickupRadius | ember magnet radius m |
| xpMult | XP multiplier |
| luck | shifts boon option rarity upward |
| rerolls | level-up rerolls per run |
| dawnHeal | Embers restored at dawn |
| castMax | max cast distance m |
| lineStrength | tension capacity multiplier |
| reelSpeed | reel progress multiplier |
| sweetZone | sweet-band width fraction (× species `sweet`) |
| biteSpeed | divides waiting time |
| hookWindow | multiplies bite reaction window |
| rarityBonus | additive luck toward rarer fish |
| creelSize | creel slots |
| sellMult / foodMult / oilYieldMult | multipliers on Shells / satiety / oil from fish |
| armor | chance 0..0.6 to negate a hit |
| slackTime | seconds at ~zero tension before a fish slips |
| nibbleTells | ≥1: real bites get an early visual tell |

**Species `difficulty`**: `power` (0.5–3) tension gain while reeling & surge strength;
`surgeEvery` mean s between surges; `surgeTime` surge length s; `stamina` s of safe-band
reeling at reelSpeed 1 (sweet counts double); `sweet` × sweet-band width; `erratic`
0..1 jitter; `window` bite reaction s (× hookWindow). `behavior`: steady, darter
(short frequent surges, lateral dashes), sinker (heavy constant pull), thrasher (long
violent surges), leaper (surges = leaps; slack risk).

## 9. Art direction — "hand-inked melancholy" (inspired by, never copying, Hollow Knight)

- **Silhouette first:** near-black ink shapes with pale rim light (`toon.toonMaterial`
  + `toon.addOutline`); minimal faces — glowing eyes.
- **Layered depth:** 4–6 parallax silhouette rings of cavern architecture fading from
  ink-dark to luminous mist in the zone's fog colour.
- **Limited palettes:** Mossmere moonlit slate + silver with a lilac-silver accent; Sporewood Pools dusky plum +
  amber/pink spores; Glasswater Vault saturated indigo + ice-blue/violet crystals; Pale Abyss
  near-black + bone-white + sickly gold. **Palette rule:** green/teal (hue 65–195°) only as rare
  trace accents (Murk's sage lamp); glows stay at hue ≥ 200° (DESIGN §19.1).
- **Light is life:** the warm amber lantern is the only warm light in a cold world.
  Bloom on glows, drifting motes, light shafts, vignette, fine grain. The swarm reads
  as ink against the lantern's warm pool.
- **UI:** thin ornate bone-white linework, serif type (Cinzel / Cormorant Garamond,
  Georgia fallback), ink-wash panels, restrained motion.
- **Originality:** no Hollow Knight characters (no white horned masks), names
  (Hallownest, Geo, Soul, Charms, Masks…), places, music or HUD layout.

## 10. Performance budget

60 fps mid laptop, playable on phones. ≤ ~250 draw calls; ≤ 4 dynamic point lights
(lantern, merchant, ≤ 2 world accents); no shadow maps (blob shadows); InstancedMesh
for repeats & hordes (up to ~150 live enemies); Points for particles/embers; reuse
vectors; dispose removed objects; spatial loops kept O(enemies × weapons).

## 11. Testing

- `node build.mjs` → `index.html`; `--dev` readable; `--only=a,b` stubs the rest;
  `--out=tools/out/x.html`.
- `node tools/playtest.mjs [--html=] [--shots=] [--script=] [--mobile]` — headless
  Chromium (software WebGL), reports errors, takes screenshots (Read the PNGs).
- `window.__gw` = ctx. Required debug hooks (registered in `init()`):
  fishing `forceBite()`, `instantCatch(speciesId?)`; survival `skipPhase()`, `god(on)`,
  `setPhase(name)`; combat `spawn(idOrKind)`, `killAll()`, `levelUp()`, `giveBoon(id)`;
  progression `addShells(n)`, `addMemories(n)`, `unlockZone(id)`, `giveFish(id)`,
  `openGate()`, `completeChallenge(id)`; ui `ui()`.
