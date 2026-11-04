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
it observes. Player position is NOT saved (a continued run respawns at the zone spawn). *v2 (walking build): walking lakes save it in `run.flags.pos` (§12.2).*

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
| *v2 (walking)* | `player:mode`, `player:step`, `player:hop`, `raft:called/arrive`, `walk:high`, `foot:eelEdge`, `place:*`, `lamp:*`, `shortcut:open`, `deed:done` | see §12.3 |
| `ui:modal` | `{open, id}` | ui |

## 7. Module APIs

**Space.** Metres; **water surface y = 0**; each zone is a roughly circular cavern
lake centred on the origin, radius `zone.arena.radius` (~55–80 m) with obstacle
islands/pillars. The raft moves; `ctx.player.position` is the truth. **v2 (walking, §12.1):**
y = 0 stays the only water, but on foot `player.position.y` is the ground height (0 on the raft). Heading/yaw:
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

## 12. v2 (walking) — exploration on foot

Binding additions for DESIGN §24 (revision 2). Each item names its owner. Anything not stated here behaves as v1.

### 12.0 The walking build and compatibility

- **One flag.** `data.WALK_ENABLED` (true when `globalThis.GW_WALK === true` before data.js evaluates; the walking build sets it in template.html, or flips the default in the commit that lands world / player / fishing v2). With it off, every v1 table, arena field and text is bit-identical to v1 (validate-data pass 1 checks it), so merging the data before the code changes nothing. With it on, data merges `WALK_SPECIES / BAITS / UPGRADES / SUPPLIES / RELICS / BOONS / CHARACTERS / CHALLENGES / TIPS`, `ZONE_V2` and `ARENA_V2` into the v1 tables before the lookup maps are built.
- **Who reads the flag:** only data and world. Every other module asks `ctx.world.getMode?.()` (`'raft'|'mixed'|'foot'`, `'raft'` when world is v1 or the flag is off) and reads v2 fields defensively (`?.` / `??`). The Mossmere is `'raft'` in both builds and must behave identically to v1 (QA §24.13 #1).
- **Fishing v1 never needs a place filter**: place-kept species exist only when the flag is on, and the flag is turned on together with fishing v2. Fishing v2 makes a species with `place` eligible only in that place's water, under its `cond`, and only while it is awake this descent (`run.flags.awake`). Progression's Journal perk for a lake counts the species that exist in the current build.

### 12.1 Space (v2)

- **Water:** y = 0 is still the only water (one plane; pools are the same plane seen through holes in land).
- **Land heights:** walk surfaces are y 0.35–9 m, **quantised to 0.1 m** by `walkGridFor` (stored in a Float32Array). Every height threshold in data sits on a half-step (stepUp 0.45, crawler climb 1.25, drop 3.55, eel reach 3.05, high ground 1.95, steep line 4.95), and every module compares heights only through `walkHeightLE(a, b)` / `walkStepOK(a, b)` (eps 0.02). Steps are **symmetric** (stepUp = stepDown = 0.45); only authored drops are one-way.
- **Player position** is the truth: on foot `y` = the ground (`world.groundY`, a smooth bilinear height used for drawing and the camera); rules use cell tops. 0 on the raft.
- **Layers.** Where a bridge crosses water there are two surfaces. `world.surfaceY(x, z, 'water'|'land')` and `world.getFlow(x, z, layer, out)` take the layer explicitly. Swimmers, mites in the water, cinders and fish on the water, ripples, the bobber and the raft use `'water'` (y 0); walkers use `'land'`. A non-`raftPass` bridge is solid for swimmers and the raft; a `raftPass` bridge (the Hyphae Strand, y 6) is not.
- **Cavern edge.** Raft lakes keep v1's noisy shoreline. Walking lakes use the **exact circle R** (`data.shoreRFor(zone)` returns `() => R`): the grid is VOID beyond R − 0.5 (`WALK_SHORE.pad`), world's cliff base stands at ≥ R + 1.5 with outward-only noise and leans in only above y 9, so land always ends ≥ 2 m inside the cliff base. world uses the same function for the walk grid, raft collision, `getDepth`, the shore foam radius (`getShoreRadius`) and the cliff mesh.
- **Obstacles:** `data.obstacleRadius(o, isIsland)` (islands r·1.08 + 0.2 as in v1, pillars r) is used by the grid and by world collision alike.
- **Angles:** walk data uses degrees (x = cx + r·cos a, z = cz + r·sin a; a = 90° is +Z, south, toward the camera). Headings are `yawDeg` in the player convention (0 faces −Z, +90 faces −X). The camera yaw stays fixed (screen-up = −Z) on foot too, so `input.move` / `input.joy` stay screen-relative.

### 12.2 State (v2)

```js
// progression (saved)
state.run.flags.lamps     = { lampId: 'lit' | 'snuffed' }
state.run.flags.shortcuts = { shortcutId: true }                     // world re-bakes on change
state.run.flags.deeds     = { deedId: {done, step, day, at} }        // light counts, offering day, rope cooldown, sequence progress
state.run.flags.places    = { placeId: {found, catches, fine} }      // this descent's mastery count
state.run.flags.astir     = { zoneId: placeId }                      // re-picked each calm
state.run.flags.variant   = { zoneId: variantId }                    // rolled at zone entry (seeded); world bakes with it
state.run.flags.twists    = { placeId: 'B' }                         // per descent; absent = 'A'
state.run.flags.awake     = { speciesId: true }                      // place-kept species awake this descent
state.run.flags.day       = { day, drifters: {placeId: n}, phaseWindow: {placeId: true}, leapUsed, pages, puffballs }
state.run.flags.window    = { placeId: n }                           // phaseWindow uses this descent (Last Ferry perDescent)
state.run.flags.hush      = { zoneId: true }                         // Arrival Hush consumed (survival asks progression to set it)
state.run.flags.stake     = { x, z, until: 'dawn' } | null           // a planted Stake Lantern
state.run.flags.wayside   = { memorials: [index…] }                  // Pallid memorial candles lit this descent
state.run.stats.placesNew, lampsLit
state.meta.places = { placeId: {found, catches, mastered, biggest} } // Known Places = mastered
// player (written into run.flags on every autosave via player.writeSave(flags); read on continue)
state.run.flags.pos  = { zone, mode: 'raft'|'foot', x, z, mooringId }
state.run.flags.raft = { mooringId, x, z, yawDeg }
// ui
state.meta.settings.cameraXray = true
```
**Continue:** after `zone:change`, player calls `restore(run.flags.pos)`: snap to the nearest walkable cell (foot, body-eroded) or raft water (raft) within 6 m; if none, the nearest lit candle; else the zone spawn. The raft returns to `run.flags.raft` (moored at `mooringId` if set). Autosave cadence is unchanged (phase changes, catches, purchases, zone changes, every 30 s, hide / pagehide), so a quit-and-continue resumes where the Wick stood ≤ 30 s earlier: it is never a free escape and never a teleport to the spawn at night.

### 12.3 Events (v2)

| event | payload | emitter → main consumers |
|---|---|---|
| `player:mode` | `{mode:'raft'\|'foot', prev, mooring, reason:'ashore'\|'board'\|'spawn'}` — `spawn` only when a run or continue starts on foot (never on raft spawns) | player → actors, render, water, ui, audio, progression |
| `player:step` | `{surface:'mycel'\|'plank'\|'crystal'\|'bone'\|'stone', speed}` (≤ 4/s) | player → audio |
| `player:hop` | `{kind:'ashore'\|'board'\|'drop'\|'leap', from, to}` | player → actors, audio |
| `raft:called` / `raft:arrive` | `{mooring, eta?}` | player → actors, ui, audio |
| `walk:high` | `{y}` (first time on ground ≥ 1.95 m each zone) | player → ui (tip) |
| `foot:eelEdge` | `{}` (first eel surfacing near a Wick on foot) | combat → ui (tip) |
| `place:enter` / `place:leave` | `{id, name}` — proximity: the Wick within `places.discoverRadius` (8 m) of the stand or of the water shape; 5 Hz | player → ui, audio, progression (discovery) |
| `place:discover` | `{id, name, zone, first}` | progression → ui, audio, challenges |
| `place:astir` | `{id, name, zone}` (each calm on walking lakes) | progression → ui, fishing, world |
| `place:mastered` | `{id, name, zone}` | progression → ui, audio, challenges |
| `lamp:lit` | `{id, name, first, free, reason?:'victory'}` | progression → world, ui, audio, challenges |
| `lamp:snuffed` | `{id, reason:'slam'\|'moths'\|'eclipse'\|'legend'}` | progression (combat and fishing ask it) → world, ui, audio |
| `shortcut:open` | `{id, name}` | progression → world (re-bake), ui, audio, challenges |
| `deed:done` | `{id, kind, step, of}` | progression → world, fishing, ui, audio |
| `variant:roll` | `{zone, id, name}` at zone entry | progression → world (bake), ui (banner) |
| `wayside:take` | `{kind, give}` | progression → ui, audio |

Changed payloads (additive): `player:anchor` + `mode`; `interact:change` + `hold` (bool) and the new ids below; `fishing:land` / `fishing:caught` + `{place, mode, height, stance}`; `fish:landed` + `place`; `enemy:slain` + `tag` (world tag under it). **Tips** match `event` or `event:<disc>` where disc is the payload's first of `phase / resource / reason / state / id` (ui); validate-data checks every trigger.

### 12.4 Data schema (v2)

```js
export WALK_ENABLED; ZONE_V2 {zoneId: {mode, phases?}}; ARENA_V2 {zoneId: {...v1 arena replacements, ...walk map}}
ZONES[i].mode: 'raft'|'mixed'|'foot'; ZONES[i].phases?: {calm}          // merged when WALK_ENABLED (no lake overrides calm today)
ZONES[i].arena (+ ARENA_V2, merged when WALK_ENABLED):
  v1 replacements: islands, pillars, deepPools, legendPool, gate, spawn, docks, reef / plateau / causeway
  spawnMode: 'raft'|'foot'; gateAccess: 'raft'|'foot'|null
  raft: {mode:'free'|'skiff'|'beached'|'none', start?: mooringId, at?: {x, z, yawDeg}}
  walk: { cell: 0.5,
    shapes: [{id, name?, kind:'disc'|'ring'|'rect'|'poly'|'path', geometry…, y | per-point y, tag:'ground'|'ramp'|'jetty'|'bridge', raftPass?, needs?: shortcutId}],
            // painter's order: ramps are listed after the platforms they climb onto
    holes:  [{id, kind…, depth, lip?: {a0 = 30, a1 = 150, w, y ≤ 1}}],   // enclosed pools; lip = the low south rim band (a sill)
    blocks: [{kind:'disc'|'rect', …, h}],
    variants: [{id, name, weight, fallen: [shapeId], swap?: {shortcutId: [shapeId]}}] }   // one rolled per descent
  moorings:  [{id, name, stand:{x,z}, slot:{x,z}, yawDeg, bell}]
  lamps:     [{id, name?, x, z, place?}]                              // sister-candles; a lamp with a place shows the place's name
  deeds:     [{id, name, kind:'winch'|'strike'|'light'|'sequence'|'rope'|'offer', trigger:'pill'|'touch', touchR?, at?|points?, opens?, place?,
               resets:'run'|'day'|'dawn'|'dusk'|'never', cooldown?, cost?}]
  shortcuts: [{id, name, deed}]; drops: [{id, name, from, to}]
  vigils:    [{id, name, kind:'disc', x, z, r} | {id, name, kind:'loop', pts:[[x,z]…]}]   // open ground for the night
  wayside:   {kind:'puffball'|'page'|'memorial', perDay?|count?, along:'walk', touchR, give, persist:'day'|'descent', spacing?, victoryCascade?}
  places:    [{id, name, access:'foot'|'raft'|'both', stand:{x,z}|null, standName?, standMods?, raftStand?, altStand?: {x, z, name, mods},
               deadEnd?, legend?, lamp?, water:{kind…, depth:[d0,d1]}, attract:{speciesId: mult}, mods?:{…}, rule:{type, name, …}|null, alt?:{…}, lore, look}]
  spotStyle?: {id, name, warn, live, every, missRespawn, r, walkSecondsMax, castInset, mods, tideChart:{count, until}, countsAsSpot}
mods keys: waitMult, rarity, quality, weightBias, surgeEveryMult, erraticMult, hookWindowMult, hookWindowAdd, nibbleTells,
           bandAmpMult, bandNoiseMult, darterJumpMult, legendEnrageAdd, sweetAdd, surgeWarnAdd
SPECIES[].place?: placeId; SPECIES[].cond?: 'buff'|'deed'|'reflection'|'plumbBottom'|'window'
BALANCE.walk, BALANCE.places, BALANCE.lamps, BALANCE.combat.foot (always present, inert in v1); BALANCE.travel.arrivalHush {zoneId: s}; BALANCE.memories.placeNew
UPGRADES category 'feet'; SUPPLIES give.stake; RELICS special 'lampRadius:N' | 'shortcutStart:N'; BOONS proc.on 'high' | 'lamp', weapon 'crook', tag 'foot'
export WALK_STATS, WALK_SPECIES, WALK_BAITS, WALK_UPGRADES, WALK_SUPPLIES, WALK_RELICS, WALK_BOONS, WALK_CHARACTERS, WALK_CHALLENGES, WALK_TIPS, WALK_TEXT
export WALK_FORMATIONS, WALK_BOUNTIES, WALK_BOUNTY_TYPES, PLACES, PLACE_BY_ID, WALK_FORMATION_BY_ID, WALK_BOUNTY_BY_ID, ENEMY_MOVE {enemyId: fly|crawl|swim|static}
export WALK_FLAGS = {GROUND:1, WATER:2, POOL:4, BLOCK:8, RAFTPASS:16, VOID:32, BRIDGE:64, SILL:128}; WALK_SHORE
export walkGridFor(zoneOrId, {open, variant, cell}) -> {cell, n, ox, oz, top:Float32Array(NaN = no ground), flags:Uint8Array, shape:Int16Array, pool:Int16Array, idx(x,z), variant}
export walkArenaFor(zone); walkShapeHeight(shape, x, z); walkShapeBounds(shape, pad); placeContains(place, x, z); placeAt(zone, x, z)
export walkHeightLE(a, b); walkStepOK(a, b); obstacleRadius(o, isIsland); shoreRFor(zone)
```
`walkGridFor` is the single source of truth for land: world renders and collides from it, combat's flow fields run on it, and `tools/validate-data.mjs` / `tools/walkmap.mjs` / `tools/balance-foot.mjs` check, print and simulate it. Painter's order: ground shapes (later overwrite earlier, skipping unmet `needs` and this descent's `fallen`) → holes, then each hole's lip band → bridges → islands, pillars, blocks and candle posts set BLOCK. One walkable layer per cell.

### 12.5 Module APIs (v2)

**world** (owns land, collision, flow fields and every v2 visual; **owns no gameplay state**)
```
getMode() -> 'raft'|'mixed'|'foot'; hasTerrain (getter)
getWalkGrid() -> walkGridFor result for the current zone, open shortcuts and this descent's variant (re-baked on shortcut:open)
groundY(x, z) -> smooth y | NaN;  surfaceY(x, z, 'water'|'land') -> y | NaN;  getGround(x, z) -> {y, shapeId, tag, surface} | null
isWalkable(x, z, r = 0) -> bool
moveFoot(pos, dx, dz, {radius}) -> {moved, edge:{nx, nz}|null}        // dx, dz = displacement this frame (velocity × dt); mutates pos incl. y;
                                                                      // slides along edges; never leaves walkable ground; steps via walkStepOK
collide(p, r)          // v1, unchanged: raft lakes only
collideRaft(p, r)      // walking lakes: land, blocks and non-raftPass bridges are solid (distance-to-land field)
moveCrawler(e, dx, dz) -> {moved, hauling, dropped}   // grid + flow, climb ≤ 1.25 with a 0.8 s haul, drops ≤ 3.55, land speed × 0.9
settle(p, 'water'|'land', {from?}) -> p              // floats / cinders / stolen fish: drift on water, or settle on the nearest walkable cell of the Wick's area
castClear(from:Vector3, to:Vector3) -> bool           // the cast arc (rod tip + arcHeight · d) clears land and props
getFlow(x, z, layer, out) -> out (unit dir) | null    // layer 'land' (foot) or 'water' (raft nights: the raft's water component)
waterComponent(x, z) -> id; distToOpenWater(x, z) -> m
randomGroundPoint({from, minDist, maxDist, clearance, reachable, pathMax}); randomWaterPoint({…, nearWalk?, castable?, component?, pathMax?})
getSpawn() -> {position, yaw, mode}; getGate() -> {position, radius, access}; getMerchantDock(day) -> {position, yaw, stand|null}   // CHANGED (+fields)
getMoorings(); getLamps(); getPlaces(); placeAt(x, z); getDeeds(); getShortcuts(); getVigils(); getVariant(); getShoreRadius(a) (= R on walking lakes)
isOpenWater / getDepth: honour land, pools, raftPass and place depth (§24.4)
setLampState(id, 'unlit'|'lit'|'snuffed'); setDeedState(id, state); setWayside(state)   // visuals only; progression owns the state
```
Rendering rules: land meshes are generated **from the grid** (marching squares per height band, smoothed; sills drawn as broken steps), so visuals match collision; land draws **before** water (`renderOrder` below the water's); land materials are `occludable`; a lamp-light term in the land materials (a uniform array of ≤ 10 lit candles and the stake, cold accent colour, radius) plus **one instanced ink-edged decal** for their pools; one instanced "place FX" mesh and one Points cloud carry every place-rule visual; wayside props are instanced. Re-bake only the changed bounding box on `shortcut:open`.

**player**
```
mode ('raft'|'foot'); state ('sail'|'walk'|'hop'|'drop'); groundY; topSpeed; place (id of the place in proximity | null)
raft -> {position, heading, moored, mooringId, visible}
interact()                 // tap actions (E keydown, pill tap)
interactHold(down)         // hold actions: candle 1.0 s, deeds 0.6 s; ui pill pointerdown/up and E keydown/keyup; damage cancels
interactable ids += 'ashore'|'board'|'bell'|'lamp'|'hop'|'stake'|'deed:<id>'|'fishHere'                       CHANGED
ashore(mooringId?); board(); ringBell(mooringId); hopTo(lampId) -> {ok, msg} (dawn only, once a day, free); plantStake() -> {ok}
knock(dx, dz, dist); push(dx, dz, speed); pull(dx, dz, speed, dt); root(t); pushOut(x, z, r); pin(t, x, z)     // NEW: pushOut, pin
   // the only ways another module moves the Wick: on the raft as v1 (collide / collideRaft), on foot through world.moveFoot
writeSave(flags); restore(pos); tp(x, z)
```
Crossings: push-to-cross needs 0.4 s of stick within 35° of the edge normal; 3 s between mode switches; at dusk and in the Gloomtide, drops and Ashore / Board work only by pill or E; crossing i-frames only in calm and dawn.

**combat** — never writes `player.position`. These v1 call sites move to player APIs:

| v1 call site | v2 |
|---|---|
| `C.pullPlayer` (writes `p.x/p.z`, then `world.collide(p, raftRadius)`) | `ctx.player.pull(dx, dz, speed, dt)` |
| `C.pushPlayerOut` (writes `p.x/p.z`) | `ctx.player.pushOut(x, z, r)` |
| `updatePlayerEffects` pKnock fallback (writes `p.x/p.z`, then `collide`) | `ctx.player.knock(dx, dz, dist)` only |
| Grasp pin (`p.x = grip.x; p.z = grip.z`) | `ctx.player.pin(t, x, z)` |
| `combat-enemies` integrate → `world.collide` for waterBound enemies | `world.moveCrawler(e, dx, dz)` on walking lakes; v1 elsewhere |
| `combat-weapons` floats `world.collide(pt, 0.4)`; stolen fish `collide(p, 0.6)`; cinders | `world.settle(p, layer)` on walking lakes |

Movement class from data `ENEMY_MOVE[id]` (`fly|crawl|swim|static`; Wardens fly, the Drowned Hand is static). Raft lakes keep v1 circle steering. Walking lakes: crawlers follow `world.getFlow(…, 'land')` on foot; on raft nights in mixed and foot lakes crawlers and eels follow `getFlow(…, 'water')` over the raft's water component, and their spawns are restricted to that component with water-path ≤ 40 m. Summons (Ringed Grasps, the Abbot's ticks) go through the crawler spawn rule. Flyers keep y = max(ground + hover, approach blend). Spawn / leash / contact / aura per `BALANCE.combat.foot`; `WALK_FORMATIONS` appended on foot; foot-tagged boons never offered in raft lakes. Killers keep raft values (stain 3.2 m, telegraphs, inkwell hold 13–18 m with perches that keep a walkway within zap range − 2 m); on foot the Abbot's Hymn Ring keeps a gap aligned with the walkway, the Ferryman's Pole Sweep runs along it and the Gardener charges across it. Asks progression to snuff candles (`snuffLamps(x, z, r, reason)`). Draws contact shadows under every enemy within 10 m. Exposes `blockers -> [{x, z, r}]` (standing hands), reads `player.topSpeed`.

**fishing**
```
view.place, view.reach (incl. High Cast), view.stance ('stand'|'alt'|null), view.hint += 'blocked'|'high'|'locked'|'plumb'|'tick'
onPointerDown(opts?) {aimAt?: Vector3}; onPointerUp()      // the Fish-here pill calls both (ui), so the pill path never needs canvas events
```
Cast origin at the rod tip (ground + `walk.rodTip`); arc via `world.castClear`; locked targets (holes, greenhouse beds) and plumb **drop in** from above (no arc test); the meter maps onto the first contiguous water run along the aim ray when it is shorter than reach; aim assist is off for reflection, drifters and moving targets; the place kit (DESIGN §24.7) incl. `alt` twists, awake species, `standMods` / `altStand.mods` and the steep line (≥ 4.95 m above the bobber); the first surge of a gloom legendary asks progression to snuff every candle within `lamps.legendSnuffRadius`; landing it asks for `relightAll('victory')`; the Last Ferry respects `perDescent`; the Breathing Deep and Tide Chart follow `spotStyle`.

**render**: camera modes `walk`, `walkNight` and their portrait numbers (`BALANCE.walk.camera`, replacing the v1 portrait widening on foot); focus y spring; the **pool framing**: on walking lakes the fish / reel elevation is `clamp(max(base, max_i atan((top_i + 0.3)/d_i) + 8°), base, 75°)` sampled every 0.5 m from the bobber toward the camera (+z) to 12 m over `world.getWalkGrid()`, with the focus on the bobber whenever it lifts above base or the Wick stands ≥ 2 m above the water; the terrain clamp (sample grid tops along focus → camera; raise elevation or shorten distance; stay inside R − 2); fixed yaw on foot in every mode including shop and death; occlusion uniforms each frame; `pickSurface(ndc) -> {point, kind:'ground'|'water', id}|null`.
**toon** (integrator): `occludable(material)` chains `onBeforeCompile` and **sets its own program cache key** (`'gwToonRim|occ'`, `'gwOutline|occ'`) with a separate cached occludable outline material, so the Wick and enemies never share an occluding program; the dither uses an instancing-aware `vWorldPos` (includes `instanceMatrix`). The x-ray Wick is **one proxy** (a billboard or capsule) drawn after world opaques and before the Wick (`renderOrder`), or a stencil pass — never a depthFunc-Greater pass over the Wick's own meshes.
**water**: API unchanged. On walking lakes: land draws before water; `DEPTH_RES` 256 (or a land-distance channel at grid resolution); no shore fade inside POOL cells; hull foam and the fallback wake only in raft mode; `setLights` may carry up to two lit candles in the lake's accent colour (still ≤ 6).
**actors / models**: follow `player.mode` / `player.raft`; poses `walk`, `hop`, `drop`, `kindle`, `offer`, `sweep` (Undertow Crook); `getRodTip()` / `getLanternPos()` valid on foot; the lantern PointLight is re-parented, never added; on foot the ground ring grows to 1.0 m with a heading notch and the Wick gets a thin amber rim (both on the existing ring and outline); contact shadows ride the blob-shadow instancing; the Wayfarer's look is a re-tint.

**survival**: `getPhaseInfo() -> {phase, time, duration, day, hush}` is **the only source of phase length** (the HUD clock reads it); calm = `zone.phases?.calm ?? BALANCE.phases.calm` + Arrival Hush (`BALANCE.travel.arrivalHush[zoneId]` on the first calm in a newly entered lake, recorded through progression in `run.flags.hush`; no calm raid that day); darkness ticks at × `lamps.darknessShelter` inside a lit candle (never stops; the Stake Lantern gives no shelter); `spendOil(n, reason) -> bool`; dusk readout data `getDuskLamp() -> {lampId, meters, seconds}|null` and `getOpenGround() -> {vigilId, seconds}|null`.

**progression** (owns every v2 gameplay state)
```
getPlaces() -> [{...place, found, catches, mastered, astir, known, twist}]; getAstir(zoneId); getVariant(zoneId)
lightLamp(id) -> {ok, msg, cost}      // "Share flame": lightCost × zone oil drain via survival.spendOil; first share free for a Known Place
                                      // and for the Wayfarer's first candle per lake; Kindred Flames discounts first shares only
snuffLamps(x, z, r, reason); relightAll(reason); doDeed(id, opts) -> {ok, msg}; offerFish() -> Fish|null
isShortcutOpen(id); getLampState(id); getDeedState(id); takeWayside(kind, index)
rollDescent(zoneId)   // at zone entry: variant, twists, awake species; Known Places discovered; the Surveyor's Chalk opens the shortcut nearest the arrival
```
New challenge and bounty types (DESIGN §24.10), `placesNew` in the summary, mastery Memories, Journal Places tab data, asleep species shown in the Journal.

**ui**: pills for the new interactable ids (hold ring for `lamp` and `deed:*`); pill pointerdown / pointerup → `player.interactHold(true / false)`; the Fish-here pill → `fishing.onPointerDown({aimAt})` / `fishing.onPointerUp()`; pill priority `gate > merchant > board | ashore > deed | lamp | bell | hop | stake > fishHere`, except that `fishHere` outranks `hop` and a lit candle's pill within 2 m of a stand; the Flame-leap radial places each lit candle in its true map direction (keys 1–9); place / candle / raft edge markers; the Astir banner; the variant banner on arrival; the Journal Places tab (asleep species); the dusk readout ("Nearest sister-candle 34 m · ≈ 7 s", "Open ground 9 s"); reticle variants (locked hole, plumb depth, the lit-row tick); tier IV challenges. **audio**: SFX `step_mycel, step_plank, step_crystal, step_bone, step_stone, hop, land, winch, span_grow, harp_note, chime, toll_deep, lamp_kindle, lamp_snuff, lamp_hop, bell_rope, crook_sweep, page_turn, puffball, memorial` (procedural, same rules as §7).

**main**: pointerdown routing unchanged (zap → merchant → fishing); a press on ground aims the cast toward that point (fishing resolves it). `E` keydown → `player.interact()` and `player.interactHold(true)`; `E` keyup → `player.interactHold(false)`. Before every autosave: `ctx.player.writeSave?.(state.run.flags)`. No new keys outside ui's radial.

### 12.6 Performance (v2)

- Whole frame ≤ 150 draw calls at 150 enemies (limit 250), measured on a mid laptop **and a mid phone** (QA §24.13 #20); the per-lake ledger is DESIGN §24.12. **No new dynamic lights** (≤ 4); candles light land through the uniform array and one instanced decal; occlusion 0 draw calls, the x-ray proxy 1.
- Walk grid and derived fields ≈ 2.5 MB per walking lake (grid 0.9 MB + edge-distance, land-distance and open-water-distance fields + two flow layers); baked ≤ 60 ms desktop / 200 ms phone during the zone flash.
- Foot mover ≤ 0.15 ms / frame. Flow fields on the **0.5 m walk grid**, bounded to path ≤ 45 m (≈ 25k cells), a bucket queue with integer costs, ≤ 9k cells per frame over ≤ 3 frames at ≤ 3 Hz, double-buffered; they run at dusk and in the Gloomtide **in mixed and foot lakes in either mode** (the land layer on foot, the water layer on the raft); never in the Mossmere.

### 12.7 Debug hooks (v2)

world `walkGrid()`, `openShortcut(id)`, `variant(id)`; player `tp(x, z)`, `foot(on)`; progression `lightLamp(id)`, `discoverAll()`, `astir(id)`, `masterPlace(id)`, `twist(placeId, 'A'|'B')`, `wake(speciesId)`; fishing `place()` (the place under the reticle). `node tools/walkmap.mjs <zone> [--open] [--variant=id]` prints a lake's map and walk times; `node tools/validate-data.mjs` checks every v1 table (pass 1) and every v2 rule (pass 2); `node tools/balance-foot.mjs` runs the foot profile against v1.
