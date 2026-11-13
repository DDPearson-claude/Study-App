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
  flow: 'boot'|'title'|'playing'|'dead', paused: false,   // v3 adds 'hub' (the Landing, §13.1)
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

*v3: the hub flow, Set Out / return home / Snuffed / Continue orders and the v3 save triggers are in §13.1, §13.4 and §13.6; this section stays for P1–P2 runs and The Long Descent.*

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
it observes. Player position is NOT saved (a continued run respawns at the zone spawn). *v2 (walking build): walking lakes save it in `run.flags.pos` (§12.2). v3: expeditions save `run.pos` in every lake, and meta gains the persistent fields of §13.2.*

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
| *v3* | `expedition:start/end`, `hub:enter`, `fish:measured`, `fish:marked`, `fish:escaped-big`, `mount:hang`, `pond:add/release`, `resident:*`, `farwater:dawn`, `condition:change`, `moonfall`, `sign:*`, `lampwatch:*`, `player:scorched`, `swarm:window`, `waystone:lit`, `tackle:*`, `levelup:banked`, `rumour:*`, `ledger:*` | see §13.5 |
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
  // a light flash mixes in a perceptual (sqrt) space so darks stay dark; a black flash is a linear fade.
  // The lantern flare calls no full-screen flash: its light is local (DESIGN §19.1)
projectToScreen(vec3) -> {x, y, visible}; raycast(ndc, objects, recursive=true)
groundPoint(ndc, y=0) -> Vector3|null     // pointer ray ∩ horizontal plane (fishing aim)
getCameraMode(); getYaw() -> camera yaw (for screen-relative movement)
render()
clarity -> {shadow, shadowEvery, shadowBox, reflect}   // Clear Night tier settings (DESIGN §19.8): the key light's
  // shadow-map size (0 = none), its refresh beat and box half-size, the lake's reflection scale (0 = analytic water)
```
`toon.js` (Clear Night, DESIGN §19.8): `toonMaterial` also takes `detail` ('stone' | 'wood'), `detailAmount`,
`gloss`, `shine`, `wet`, `grain`, `plank`, `floor`; `setupSurface(root, {cast, receive, reflect})` marks a
group's toon meshes as shadow receivers / casters and puts everything but outlines on `REFLECT_LAYER`
(opt out with `userData.noReflect` / `noCast`); `setToonFloor(color)` (world) and `setToonTier(name)`
(render) drive the shared vault glow and the per-tier detail; `evenOutline(mat)` evens an inverted-hull
outline. A module that builds its own scenery opts in with `setupSurface`; what it leaves unmarked
neither casts nor is mirrored (the line, the float, fish, enemies).
Owns `scene.fog` (FogExp2) + clear colour (world sets colour/density). Camera modes,
auto-selected each frame and smoothly blended, all following `ctx.player.position`:
`title` (slow cinematic orbit of the raft), `sail` (default: elevated 3/4 chase,
~13 m back/9 m up, pitch ~35°, horizon & layered cavern visible), `fish` (closer,
framing raft + `ctx.fishing.bobberPos`), `reel` (tighter, dramatic), `night`
(higher/wider during gloomtide so the swarm is readable), `shop` (toward merchant),
`death` (slow rising crane). Portrait screens widen FOV/pull back. Subtle sway.
Post: RenderPass → UnrealBloomPass (emitters only, a tight halo) → grade pass (clamped
sharpen, split-tone, tinted ink floor, contrast, light vignette, dither grain; a chromatic
fringe only on hits; as the last pass it also tone-maps with ACES and encodes to sRGB:
there is no OutputPass). Low quality: pixelRatio ≤1, cheaper bloom. Auto quality: mobile→low/medium; drop a tier if fps < 40 sustained.

### water (`water.js`)
```
mesh; getHeight(x, z) -> y; addRipple(x, z, strength=1); splash(x, z, {size, color, count})
addWake(x, z, dirX, dirZ, strength)      // V-wake / foam streak behind the moving raft
setPalette({deep, shallow, foam, glow, fogColor}); setLights([{position, color, intensity}]) // ≤6
setSky({stars, density, color, nebula, nebulaVeil, nebulaK, neb1, neb2, band})   // extra: starlight
```
`setLights` entries may also carry `radius` (lit pool, m; else `distance`) and `streak`; world passes
the lantern with `radius = survival.lightRadius`. A light's pool fades out softly at its reach: **no
light ever draws a reach ring on the water** (a legacy `ring` field is accepted and ignored; DESIGN
§19.1). `setSky` (world calls it with the vault dome's values, DESIGN §19.1 Starlight): `stars`
brightness (0 = off), `density` star-count multiplier, `color` base star colour, `nebula` / `nebulaVeil`
colours and `nebulaK` strength, `neb1` / `neb2` Vector4 (unit direction xyz, strength w), `band`
Vector3 normal of the milky-way great circle; the water mirrors those stars and nebulae (round
points, nudged a pixel or two and broken up by the ripples; world thins them at night, faded under light pools, behind mirrored silhouettes and in
foam). Brightness eases; directions snap. The shore foam follows `world.getShoreRadius(angle)` when
world provides it.
Clear Night (DESIGN §19.8) adds `renderReflection(renderer, scene, camera, tier)`: render calls it once a
frame before the main render; on medium / high (`tier.reflect` > 0) water draws the scene mirrored about
y = 0 into its own reduced target (only objects on `toon.REFLECT_LAYER`) and its shader looks that up
(`GW_REFL`); on low it does nothing and the analytic water stays. `setKeyLight(light)` hands over the
key DirectionalLight (world calls it): its direction and colour drive the glitter and its shadow map
shades the water (`GW_SHADOW`). `reflection` (getter, extra) → `{on, shadow, width, height, calls, triangles}`.
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
for dusk/gloomtide and warm at dawn; owns hemisphere + the directional key light (the moon /
vault glow: a fixed direction per lake, the one shadow caster, its shadow box following the raft;
DESIGN §19.8) + ≤2 accent point lights; drives `scene.fog`, `render.setGrade` (incl. the warm split-tone colour),
`water.setPalette`, `water.setSky` (the vault's stars and nebulae, DESIGN §19.1 Starlight) and
`water.setLights` (merge `ctx.actors.lanternLight`, the merchant lamp, its own glows).
Art: islands/pillars/wrecks/roots/fungi/crystals per zone (toon + ink outlines,
InstancedMesh), cliffs ringing the lake, **4–6 parallax silhouette rings** beyond the
cliffs (ink-dark near → luminous misty far, painted canvas alpha textures or shapes),
ceiling stalactites, drifting particles, light shafts, the gate whirlpool. The vault dome is a
starlit night sky (`starlight-glsl.js`, shared with the water; no extra draw calls).

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
game's one deliberate green trace) on a withered bronze lily-barge, rings a bell. *v3 (§13.7 actors, DESIGN §25.4.5 A10):
skin #5a5444, lichen flecks #b8b0a0, lamp glow, halo and PointLight warm white #ffe2b0; no green on him except his bell's verdigris.*

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
  palette:{fog, fogDensity, water, waterDeep, foam, glow, accent, ambient, ink, far, light, lamp?, candle?, nebula?, stars?},
  grade:{exposure, bloomStrength, bloomRadius, bloomThreshold, tint, tintAmount, vignette, saturation, grain}, description }]
// palette.lamp (optional, falls back to glow): the cold light of lamps ON THE WATER: dock/decor
// buoys and the dock halos (world). Keep it cold (Mossmere #b6b0f0) so nothing at water level
// competes with the Wick's lantern, its pool or the Cinders. UI may read it as --zone-lamp.
// palette.candle (optional, falls back to lamp): the warm amber pinpoints ON STONE: the parallax
// rings' lit windows, hero-landmark windows and braziers, island lamp heads, statue orbs and
// candles on ruins (world-art); their accent lights lean pale gold (candle mixed 35% toward light).
// palette.nebula (optional, default #d296ae): the vault's nebula glow, its haze on the far rings
// and its reflection in the water. palette.stars (optional, 0–3, default 1): starlight brightness
// and density (vault dome + water reflection; world brightens the vault's toward night and thins the
// water's, fades both at dawn). Each lake keeps its own fog/water hue at night (world darkens toward
// the lake's colour, not a shared blue-black); the two blue lakes stay ≥ 15° apart in hue.
// No palette colour may sit in the green/teal band, hue 65–195° (validate-data enforces it).
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
- **Limited palettes ("Starlit", DESIGN §19):** every cave vault is a starry indigo night sky that
  the water mirrors. The Mossmere violet-dusk + lavender mist + pale stone + candle amber; Sporewood
  Pools violet-magenta + autumn-ochre caps + gold spores + nebula pink; Glasswater Vault cobalt
  sapphire + lilac crystal, the most starlight; The Pallid Deep near-black violet + bone-pale stone +
  amber candles. **Palette rule:** green/teal (hue 65–195°) only as a rare trace accent (Murk's sage
  lamp; v3: his lamp turns warm white #ffe2b0 and the only green left is the verdigris on his bell and
  the Mossmere's cracked bell, DESIGN §25.4.5); glows stay at hue ≥ 200° or in the amber/gold band (DESIGN §19.1).
- **Light is life:** the warm amber lantern is the only warm light that lights the water; candle
  amber elsewhere stays as small pinpoints on stone (windows, candles, braziers). Its pool is a soft
  wash that fades out at the reach: never a ring (no persistent ring around the raft at all). A
  flare blooms warm pale gold around the raft and fades; it never flashes the whole screen. Bloom on glows, drifting motes, light shafts,
  vignette, fine grain. The swarm reads as ink against the lantern's warm pool.
- **UI ("Drowned Filigree", DESIGN §21.6):** no boxes; words float on soft night-ink veils with a
  filigree crest and flourish, twin hook curls that draw in on the chosen item; Marcellus SC titles and
  labels, Alegreya reading text; the catch card is an ink-wash field-journal page (line-art fish,
  handwritten pale-gold note, red stamp). Restrained motion.
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

## 13. v3 (fishing first: sizes, favour, places, expeditions, the Landing)

Binding additions for DESIGN §25 (from the brief's §12 and §12.1). Each item names its owner. **Renames** apply to every section when v3 is active: the Pale Leviathan → the Lantern-Swallower (`lantern_swallower`), Drowned Marrow → Last Candle (`last_candle`, was `pale_marrow`), the Tide Chart → Murk's Chum (`murks_chum`), "Landing of Last Rafts" → "Shore of Last Rafts" (display name only). Anything not stated here behaves as v1 (§1–§11) and v2 (§12). Where this section and §1–§12 disagree, this section wins whenever v3 is active (§13.0). Player-facing name: **the Landing**; code names: flow `hub`, zone id and camera mode `cove`, event `hub:enter` (`landing` is already a fishing state in eight modules). **Since 2026-11-05 v3 fishing is automatic** (DESIGN §25.0.2a, §25.6): the strike, one hidden roll and the automatic play are binding in §13.7a, which wins over any manual-reel API still named below; a new game opens with the First Evening (§13.12).

### 13.0 The v3 build, rollout and compatibility

- **One data flag and a phase.** `data.V3_ENABLED` (true when `globalThis.GW_V3 === true` before data.js evaluates; the v3 build sets it in template.html) and `data.V3_PHASE` (1–4, from `globalThis.GW_V3_PHASE`, default 4 so tools see the whole design; each phase's build sets its number). With the flag off every v1 / v2 export hashes identically to c0e0ab9 (validate-data passes 1 and 2 compare `tools/tests/v1-exports.json`). With it on, data applies the v3 tables before the lookup maps are built, **phase by phase**, so a phase's build never carries a later phase's content:

| lands in | data patch (applied inside `if (V3_ENABLED)`) |
|---|---|
| **P1** | `BALANCE` gains every `BALANCE_V3` block except `residents` (P2), `farWater`, `liveWell` (P3) (`V3_BLOCK_PHASE`; `markedFish` moved to P1 with automatic fishing's light Marked Fish); the v3 `bite` keys merge into v1's `BALANCE.bite`; `STATS` gains `stride` (D1′ retired `shock`, `absorb`, `pipBonus`, `dragAt`); `SPECIES` = the 32 phase-1 lake species and the cove-only Quayling (33; FE-D1) (+ §24's 8 kept fish when `WALK_ENABLED`); the renames (`pale_leviathan` → `lantern_swallower`, `pale_marrow` → `last_candle`, `tide_chart` → Murk's Chum; Pg0 renames the ids in saves); the `spot_catch` bounty becomes `signCatch`; the 6 Angler Boons and the `angler` tags; each Wick's `fishing` half; P1 tips, text and Murk's lines; the Mossmere's rust accent and its two buoy watch-lamps; §24's place sync ▲ and watch lamps (with §24); `arena.giantSpots` (the stopgap, `RAFT_FALLBACK_V3`) in every lake whose places are not in the build, and raft watch lamps for §24's lakes without §24 |
| **P2** | `residents` (Marked Fish move to places); `ZONES[mossmere].arena.places` (the 8), the Cupped Hands' collision in `arena.pillars`, `arena.cracks` (the Moon-Eye); the `sturgeon` shape; species → 36 (→ 44 with §24) |
| **P3** | `farWater`, `liveWell`; `RELICS` = `RELICS_V3` (cuts, shelves, × 0.55 / × 0.7 costs, 3 new); `CHALLENGES` = `CHALLENGES_V3`; `ZONES[].homeward`; the welcome purse; species → 39 (→ 47 with §24) |
| **P4** | the Moon Cistern; the six P4 species (→ 41 / 53) |
| **AF, FE** (ship **together** at `V3_PHASE` 1, after P1 and before P2: no user-facing build carries AF without FE or its fallback F0; DESIGN §25.14.2a–b) | nothing is patched into v1 tables: `CATCH_V3`, `AUTOFISH`, `FIRST_EVENING`, `TACKLE[].hold`, the four giants' lures in `LURES` (sold per run at 40% in P1–P2, `AUTOFISH.runLures`), the `catch*` helpers, `upgradeHold`, `presentLength` and the `COVE` fixes are v3 exports read only when `V3_ENABLED`; `BALANCE.markedFish` joins at P1. D1′ (done on the spec branch, ahead of AF-0) moved `AUTOFISH.text.tips` into `TIPS_V3`, set `BALANCE.wellFed.effects` to `{hold: 2}` and retired, in one commit, `BALANCE_V3.stats` (shock, absorb, pipBonus, dragAt), `BALANCE.tackleRating`, `TACKLE.rating / gate / legends / targets`, `BALANCE_V3.size.fight / reel`, `bite.pips`, species `oldTrick` and `TEXT_V3.nearMiss / causes / tips`; FE-D1 (done on the spec branch) moved the Quayling to phase 1 (cove-only: in no lake's pool), made the First Evening's lines `TEXT_V3.firstEvening` and its tips directed `TIPS_V3` entries (`firstEvening:line:<id>`), so validate-data's per-phase species counts are 33 / 37 / 39 / 41 raft and 41 / 45 / 47 / 53 with §24 |

  `PLACES` / `PLACE_BY_ID` are rebuilt to hold every place in the build with its v3 fields (the Mossmere's from P2; §24's with §24). validate-data runs every phase with and without §24 (§13.10). The v3 exports themselves (§13.8) always exist, so tools can read them in any build.
- **Who reads the flag:** data, main (hub entry, below) and tools. Every other module feature-detects v3 fields (`species.size`, `place.holdsGiants`, `BALANCE.nightModes`…) with `?.` / `??` and behaves as v1 / v2 without them.
- **Rollout by phase (DESIGN §25.14).** P1 and P2 run **inside today's run flow** (title → New Descent → run → death screen): `ctx.game.startNewRun({character, nightMode})` → `progression.createRun({…, nightMode, outing})` with `outing: 'first'` and every night still when `meta.runs === 0`, else Lantern preselected on the New Descent mode cards; a snuff ends the run through today's death flow (the death screen is titled *Snuffed*; Lantern's Embers at 0 show the *Scorched* card and the run continues); records bank at the measuring moment; P2's residents, Marked Fish, places and Tally records persist in meta. Gear in P1–P2 (and inside The Long Descent) is today's per-run `UPGRADES`; the v3 fight stats that `UPGRADES` lack (shock, pips, absorb, drag) and the tackle rating come from `data.upgradeTiers(levels)`; after AF each slot's Hold for `catchChance` comes from `data.upgradeHold(levels)` (every level counts; the rounded tier gives only the rating words) and legends use `CATCH_V3.legend.fightRun` (`mods.perRun`) (§13.7 progression, §13.7a). Memories in P1–P2 follow `MEMORIES_V3.interim` (discoveries instantly; the death screen pays v1 `memoriesFor` without its species row and with the v3 per-night values); relic costs stay v1 until P3. **Pg0** (P1) migrates only the renamed ids in saves (§13.2). **P3** switches to the hub flow by feature detection: main uses §13.1 when `data.V3_ENABLED && data.COVE && ctx.progression.createExpedition` all exist; otherwise today's flow stays.
- **The place kit is built in P2, raft-first.** The Mossmere's places use §24's place schema and rule engine (`targets`, `rhythm`, `foul`, `dropIn`, place membership, kept-species gating by `place` / `cond`, discovery, mastery, Astir, Known Places). No §24 code exists yet, so P2 builds that kit (DESIGN §25.14.3 F14, Pg11, U16) against `data.placeAtV3`; §24's walking lakes then reuse it unchanged.
- **Landing v0** (only while §24's foot controller is missing; DESIGN §25.4.7). `world.getMode()` returns `'raft'` in the cove; the Wick stays on the raft. Land stations are offered from **pill posts on the quay's south parapet** (`COVE.v0.posts`, each within the raft's 5 m interact range of raft-reachable water, validated); Murk, the raft mooring and the jetty are already at the water. The walls and the pond are shown by flying the `wall` / `pond` camera from a post (the camera does not follow the Wick there). The quay, galleries and walls are drawn by the cove's own extrusion builder (`COVE.land: 'extrude'`, world-cove.js), which needs neither §24's grid mesher nor its foot controller. The APIs below are unchanged; when the foot core lands, `getMode()` returns `'foot'` and the posts are hidden.
- **The Long Descent** is a run with `run.outing === 'descent'`. Inside it every module behaves as v1 / v2 (phases `BALANCE.phases`, oil `BALANCE.drain.oilPhase`, the Embers death model, per-run `UPGRADES` and `run.shells`, `memoriesFor`, per-descent §24 state) while v3 fishing (size, favour, classes, ceremony, records) applies. Modules branch on `run.outing` and `run.nightMode`, never on the flag alone.
- **Precedence of position fields:** v3 expeditions save `run.pos` (§13.2); `player.restore()` reads `run.pos ?? run.flags.pos` (v2's field stays for The Long Descent).

### 13.1 Flow `hub`, ctx and main

```js
ctx.flow: 'boot' | 'title' | 'hub' | 'playing' | 'dead'      // + 'hub' (the Landing)
ctx.game += {
  planSetOut({zone, nightMode, character, outing}) -> {ok, msg},   // Map Table confirm (ui): stores meta.pendingSetOut, the Waystone flares; no zone change
  cancelSetOut(),                                // clears the plan (Map Table "Change plan")
  setOut(plan),                                  // called by player when the Set Out glide crosses COVE.archLineZ → §13.4 Set Out
  returnHome({via: 'stone' | 'barge'}),          // player / progression after the Homeward hold or Ride home → §13.4 Return home
  startLongDescent({character}),                 // Map Table, once all four Waystones are lit (no glide plan: it runs at once)
  toHub(),                                       // after Homecoming / Snuffed summaries close (ui)
  slowmo(seconds, scale),                        // the leap reveal (0.25 s at 0.35): main owns ctx.time.timeScale and restores it
  // kept: continueRun() (resumes a saved expedition), toTitle(), save(), pause(), resume(), togglePause(), wipeAll(), hasSavedRun()
  // kept for P1–P2 and inside The Long Descent: startNewRun({character, nightMode}), endRun(cause), victory()
}
```
- **Main loop:** `running = (flow === 'playing' || flow === 'hub') && !paused && !blocking`. In the hub, player, actors, models, world, water, render, audio, ui, progression and fishing (cove mode) get the real dt; **survival and combat return early** when `ctx.flow === 'hub'`. The 30 s autosave timer runs only in `playing`. **`core.inWorld(ctx)`** (`flow === 'playing' || flow === 'hub'`) is the one helper player, fishing, render, actors, ui-hud and audio use for "the world is live" (today they read `playing` in ≈ 22 places); survival, combat and the autosave stay on `'playing'`.
- **Every run sets out from the Landing** (P1–P2, AF + FE; DESIGN §25.4.8): New Descent → `zone:change {zone: 'cove', hub: true, from: 'title'}` with the raft at `COVE.arena.moorings[0].slot` → the 3 s glide along `COVE.setOutPath` (tap to skip after the first) with one rotating Murk line (`FIRST_EVENING.everyRun`) → at the arch line `startNewRun(...)`. A Snuff cuts to the hearth for 3 s (`FIRST_EVENING.snuffed`) before the Snuffed summary. `run:start` never fires without the glide.
- **Input priority during the bite** (every flow and mode): while `ctx.fishing.state === 'bite'`, `pressAction` routes the pointer and Space / Enter to `fishing` first (before `combat.onPointerDown`, `actors.pickMerchant` and Flare); F stays Flare.
- **Debug:** `core.debugEnabled()` is true for `?debug=1`, the localStorage key `gw.debug === '1'` or `globalThis.GW_DEBUG === true` (the scenario runner sets it). Hooks that return hidden state (§13.11) register only when it is on; `window.__gw` may stay, but a release build exposes no species, roll, plan or pre-roll on it.
- **The measuring ceremony is a cinematic state** (`ctx.cinematic = true` from `fishing.startCeremony` until the card opens). While it is set, main gives **survival and combat dt 0** (no phase clock, drains, enemies, director or swarm window progress) and fishing freezes its bite timers; actors, render, ui and audio get real dt. During an active swarm window every class plays the short 1.2 s variant (`BALANCE.ceremony.cinematic.duringSwarm`). The catch card that follows is today's blocking modal.
- **Boot:** `core.loadSave()` returns the raw envelope `{version, meta, run}` (`schema` is never filled in from `defaultMeta()`), then `progression.migrateSave(save)` (§13.2) → flow `title` → `zone:change {zone: 'cove', hub: true, prev: null, from: 'boot'}` (world builds the cove so the title orbits it) → `ui.showTitle()`. The boot overlay offers **Begin** (no saved expedition) or **Continue** (a saved expedition), plus Settings. Begin → flow `hub` → `hub:enter {from: 'boot'}`; on a save without `meta.firstEvening.done` Begin starts **the First Evening** instead (§13.12; in P1–P2 FE builds its arch crossing starts today's run). Continue → §13.4 Continue.
- **`toTitle()`** from the hub: save, flow `title`, overlay (no zone change); Begin then emits `hub:enter {from: 'title'}`. From an expedition: save the run (with `run.pos`), set `state.run = null` in memory (the run stays in the save), `zone:change {zone: 'cove', hub: true, prev, from: 'title'}`, flow `title`, overlay with Continue.
- **Pointer routing in the hub:** (during a bite, the strike first, as above) pointerdown → `ui` station glyph (tap-to-walk, `player.walkTo(stationId)`) → `world.pickFrame(ndc)` (only in the `wall` camera: opens `ui.openMount(speciesId)`) → `actors.pond.pick(ndc)` (only in the `pond` camera: `ui.openPond(uid)`; a tap on the pond never reaches fishing) → `actors.pickMerchant(ndc)` (Trade) → `fishing.onPointerDown()` (jetty cast and the test buoy, only while the Wick stands on the jetty or the raft). No zap in the hub (`combat.onPointerDown` is not called). Keyboard: `E` → `player.interact()` / `interactHold` as §12.5.
- **Autosave** (main): §13.6.

### 13.2 State (v3)

```js
// progression owns everything here unless marked. Shapes are binding; extra fields are optional extensions.
state.meta.schema      = 3
state.meta.shells      = number                                   // persistent purse (expeditions); The Long Descent uses run.shells
state.meta.tackle      = { rod, line, reel, creel }                // owned tier per slot, 0–4 (TACKLE)
state.meta.fitted      = { rod, line, reel, creel }                // fitted tier per slot (≤ owned); `drag` is cut with the manual reel (§13.7a): ignore it if present
state.meta.outfit      = { chimney, brazier, oars, boots }         // levels 0–3 (OUTFIT)
state.meta.lures       = { lureId: true }                          // owned (LURES, from P3); a snapped line never loses a lure under automatic fishing (TACKLE.lostLureFrac 0)
state.meta.mounts      = { speciesId: MountEntry }                 // the fish hung in each species' frame; legends under the arch
state.meta.mountBook   = { speciesId: [MountEntry] }               // every fish ever brought home (for Swap)
MountEntry             = { uid, speciesId, z, length, weight, sizeClass, ancient, name?, place, zone, expedition, day, character }
state.meta.pond        = { tier: 0..3, fish: [MountEntry] }        // tier 0 = silted; slots [3, 5, 6]; length ≤ 1.4 m
state.meta.landing     = { pondCleared, wingsComplete: {zoneId: true}, keepsakes: {key: true}, swallowerHome, seenStations: {stationId: true} }
state.meta.waystones   = { zoneId: true }                          // lit (the Mossmere's from the start)
state.meta.gates       = { zoneId: true }                          // Descent Gate open for good (that lake's legendary landed)
state.meta.shortcuts   = { shortcutId: true }                      // persistent (v3 replaces run.flags.shortcuts in expeditions)
state.meta.residents   = { zoneId: { placeId: { speciesId, z, rolledExpedition, inLakeDays } } }
state.meta.markedFish  = [ { id, speciesId, z, zone, place, x, z0, expedition, rehooked?: bool } ]   // "still out there" (P1, AF): open-water Elder+ (anchored within 8 m of
                         // the escape, x / z0) and, from P2, Trophy+ at places (place set; P2 moves P1 anchors to the nearest place ≤ 25 m); ≤ 6, ≤ 2 per lake (oldest
                         // in that lake replaced); re-hooked once at +6 Hold (CATCH_V3.markedFish)
state.meta.legendWounds = { speciesId: n }                         // escapes since the last landing: +6 Hold per escape on the next attempt, ≤ +18 (CATCH_V3.legend); The Long Descent uses run.legendWounds
state.meta.firstEvening = { done, step, skipped, legacy, offerSeen? }   // §13.12 (offerSeen: the legacy save's "A new first evening" ribbon was used or dismissed)
state.meta.elderLog    = [ { name, speciesId, length, weight, z, ancient, place, zone, expedition, day, character, lost?: string } ]
state.meta.places[id] += { tally: { speciesId, length, weight } | null }               // the Tally Post record (v2 field extended)
state.meta.ledger      = { slots: [LedgerReq, LedgerReq, LedgerReq], refreshedOnDay, lastRealDate }
LedgerReq              = { id, templateId, text, zone?, place?, speciesId?, sizeClass?, n, progress, reward: {shells}, modes? }
state.meta.journal[speciesId] += { pbLength, pbWeight, pbZ, bestSetup: [{family, id, value}], seals: {prize, trophy, elder, ancient},
                                   oldLedger: bool, lastLengths: [cm ≤ 12], escape: {length, sizeClass} | null,
                                   mounted: {prize, trophy, elder}, released: {prize, trophy, elder},
                                   seen: bool /* Glimpsed: lost before it was ever landed; odds shown, no naming Memories */,
                                   gotAway: [{sizeClass, length /*±8% estimate, cm*/, place, zone, day, reason}] /* last 5 */ }
state.meta.rumours     = { rumourId: 0..3 | 'solved' }, state.meta.pinnedRumour = rumourId | null
state.meta.expeditions = number;  state.meta.firstOutingDone = bool
state.meta.pendingSetOut = { zone, nightMode, character, outing } | null    // the Map Table plan, until the glide crosses the arch line (§13.4)
state.meta.tray        = { bait: {baitId: n}, supplies: {supplyId: n}, lure: lureId|null, equipped: baitId|lureId|null }
                         // filled at home (Murk's Bait / Supplies tabs, owned lures) and by the Set Out tray step; moved into run.bait /
                         // run.flags.supplies / run.lure at createExpedition and emptied; nothing in it ever comes back (a Snuff loses it too)
state.meta.v3ids       = bool                                             // Pg0 (P1) renamed the ids
state.meta.records    += { legendGrowth: { speciesId: [{expedition, weight}] }, longDescent: { fewestDays, deepestSnuff } }
state.meta.cosmetics   = { id: true }, state.meta.equipped = { cloak?, pennant?, lanternGlass?, rodTassel? }   // rodTassel: the Knotted Rod Tassel (rod_tassel)
state.meta.relicsFound = { reed_pole?, seedlight_glass?, tuning_fork?, deep_line? }   // P4 Found Relics
state.meta.chartFog    = { zoneId: string }                        // P4: 64×64 bit mask per lake (base64)
// ui
state.meta.settings   += { favourDetails: bool, strikeRing: 'always'|'firstExpedition'|'never', hurry: bool }   // long-press list default; §13.7a, §13.12

state.run (expeditions; null in the hub)  — v1 fields stay unless noted
state.run.outing     = 'first' | 'normal' | 'descent'
state.run.nightMode  = 'still' | 'lantern' | 'gloomtide'           // locked for the run
state.run.startZone  = zoneId;  state.run.expedition = number      // meta.expeditions at Set Out
state.run.marked     = [ { uid, fish: Fish, markedNight, nightsLeft } ]   // fish marked for home, in Live Well slots (legendaries: no slot, no expiry)
state.run.pos        = { zone, x, z, y, mode: 'raft'|'foot', mooring }    // player writes it on every autosave (player.writeSave)
state.run.farWater   = { dawns, murkToday: bool }                  // dawns reached in this expedition (day − 1)
state.run.tally      = { dawns, stillNights, swarmNights, lakesCrossed: [{zone, fullCalm}], ledger }
state.run.conditions = { zoneId: { day, today, tomorrow } }        // archetype ids from CONDITIONS
state.run.pressure   = { placeId: catchesToday }                   // reset at dawn
state.run.levelBank  = number                                      // banked level-ups (combat)
state.run.scorched   = { night, x, z } | null                      // Lantern: forced lamp-watch until dawn (survival)
state.run.lampWatch  = { lampId, x, z, forced } | null             // tonight's lamp-watch (survival)
state.run.shells     // absent in expeditions (Murk pays into meta.shells); present in The Long Descent
state.run.lures      = { lureId: true }                            // P1–P2: lures bought from Murk this run at 40% (AUTOFISH.runLures); gone when the run ends
state.run.equipped   = baitId | lureId | null                       // the one item on the line; the item at the CAST counts for that cast (catchChance)
state.run.legendWounds = { speciesId: n }                          // The Long Descent only: wounds count per descent (CATCH_V3.legend.woundScope)
Fish += { z, sizeClass, ancient, length /*cm*/, weight /*kg*/, name? /*Elders*/, favours: [{family, id, value}], place, marked: bool }
```

**Ownership:** progression writes meta and `run.marked / tally / conditions / pressure / farWater`; survival writes `run.scorched / lampWatch` and the phase clock; combat writes `run.levelBank`; player writes `run.pos` through `writeSave`.

**Save schema and migration** (progression, `migrateSave(save) -> save`, called by main at boot before anything reads meta). `core.loadSave()` returns the raw envelope `{version, meta, run}`; `defaultMeta()` is merged **after** migration and never supplies `schema`. Data: `RENAMES`.
- **Pg0 (P1): ids only.** If `!meta.v3ids`: rename ids everywhere they appear (journal keys, `run.legendaries`, `run.bait`, unlocks such as `bait:pale_marrow`): `pale_leviathan` → `lantern_swallower`, `pale_marrow` → `last_candle`, `tide_chart` → `murks_chum`; set `meta.v3ids = true`. Nothing else changes in P1–P2 (relics, challenges and the run stay v1).
- **The First Evening's legacy step (AF + FE; a separate, idempotent step, not part of Pg0):** only while `meta.firstEvening === undefined`: `meta.runs > 0` or a journal entry for any non-cove species → `{done: true, legacy: true}`; anything else → `{done: false, step: null}`. Also set when the First Evening starts. (Pg0 runs only when `!meta.v3ids`, which a P1-era v3 save already has; and a mid-First-Evening save holds a Quayling entry, which is not legacy.)
- **Pg3 (P3): the rest, once** (`core.VERSION = 3`, same `SAVE_KEY`). **Detection:** `version < 3 && (meta.runs > 0 || meta.journal has any entry)` → **legacy**; otherwise **fresh**.
  - **Fresh:** `meta.shells = 20`, `schema = 3`, `firstOutingDone = false` (no welcome purse; the First Outing plays).
  - **Legacy:** 1. **keep** `journal` (caught counts; `biggest` kg becomes `pbWeight`, `pbLength` = (W / k)^(1/3) from the species' body k; no class seals are granted from legacy catches), records, relics, Wicks (`unlocks`), challenges and their progress, Memories, settings, `seenTips`; 2. run Pg0 if it has not run; 3. **refund** the Memories spent on the cut relics `old_debt`, `waystone_sporewood`, `waystone_glasswater`, `waystone_paleabyss` (sum of the costs of the owned levels), then remove them; 4. **add** the new meta fields with their defaults: `tackle` / `fitted` all 0 and `outfit` all 0 (v1 upgrades were per run, so the `RENAMES.upgradesTo*` maps grant nothing: they record where each catalogue entry went), the Mossmere Waystone lit, and the Waystone and gate of each deeper lake **lit / open only if `meta.journal` holds the legendary of the lake before it**; the **welcome purse** of 200 Shells (once); `firstOutingDone = true` (a veteran never replays the First Outing); `schema = 3`; 5. **a run in progress** ends at the next title as a "return home": its `run.shells` are added to `meta.shells`, its creel is sold at standard price into `meta.shells`, it is paid by v1 `memoriesFor(summary)` (it has no expedition tally), and it is cleared; no fish marked for home exist in a legacy run.

### 13.3 Zone `cove` and the `zone:change` guard

The hub is entered by `zone:change {zone: 'cove', hub: true, prev, from: 'boot' | 'home' | 'snuffed' | 'title'}`. `COVE` is a data export that is **not in `ZONES`** and not in `ZONE_BY_ID`; nothing may fall back to `ZONES[0]` for it. `world.getZone()` returns `COVE` in the hub. Every `zone:change` listener branches on `hub`:

| module | on `zone:change {hub: true}` | on the next lake `zone:change` (prev `'cove'`) |
|---|---|---|
| world | build `COVE` (`setZone('cove')` resolves `data.COVE`, never `ZONES[0]`): world-layout and world-art use theme `'cove'` (`themeOf` returns `zone.theme` when set), so no islands, hero landmarks, lamp-posts, lily pads or dock buoys of a lake are built; `gate === null && !legendPool` gives `{none: true}` and gate state `'hidden'`; a `'cove'` depth recipe; the land by extrusion (`COVE.land`; the FE slice: quay, jetty, customs steps and one lower-wall slab); **rect and capsule obstacles** (walk shapes, blocks, the barge pad, the breakwaters) in `collide` and `isOpenWater`, so the raft never enters land and casts onto land are refused; apply growth states from meta (`setGrowth`) | dispose the cove; build the lake as now |
| water | `applyZonePalette(COVE.palette)`; `setPondHole({x, z, r})`; Moonfall discs off | `setPondHole(null)` |
| render | grade `COVE.grade`; mode `cove`; the title orbit uses the cove (`BALANCE.cameras.title.orbit`, southern arc only) | as now |
| ui | hide the lake HUD, show the hub HUD and the station pill (`hud.setVisible` follows `hub` too, not only `playing`) | lake HUD |
| audio | no `descend` sting; play `homecoming` (from `home`) or the snuff motif (from `snuffed`); start the cove ambience | play the `setout` sting instead of `descend` (`prev === 'cove'`) |
| actors | place Murk at the home dock with `merchant.arrive(dock, yaw, {instant: true})` **after** this event (the leave-on-zone-change branch skips when `hub`); raft at the mooring; freeze both; spawn pond fish (`actors.pond.set(meta.pond.fish)`) | as now (Murk follows at 0:20) |
| progression | no zone discovery, challenge zone hooks, Waystone or gate logic; the expedition summary is already banked; `canShop()` is false in the hub until P3 (Murk is moored, not trading) | `createExpedition` already ran; `market.reset()` runs on `prev ∈ {null, 'cove'}` (so Murk moors on day 1 after the glide) |
| challenges | ignore | as now |
| player | foot mode (Landing v0: `world.getMode()` returns `COVE.v0.mode` `'raft'` while §24's foot core is missing, and the raft spawns at `COVE.arena.moorings[0].slot` (7, 2), yaw 90); foot: spawn at the hearth (`boot`, `snuffed`), on the raft at the mooring for the Homecoming glide-in (`home`; on the jetty when the glide is skipped), or on the jetty (`title`); no drains; the raft collides with `COVE.arena.closure.breakwaters` and the soft wall across the arch (passed only by a glide) | spawn at `arena.spawn` (new expedition) or at the saved `run.pos` (Continue) |
| fishing | cove mode: species pool = `COVE.fishing.species` (the Quayling; the cove is exempt from the hidden-species rule); the test buoy (P3; off during the First Evening; capture radius `testBuoy.r`); sales refused; run-less: T0 tackle, no item, no bait spend or refund | as now |
| survival / combat | idle (return early in `hub`) | as now |

`prev` is the zone being left: `null` only for the boot build. A Continue that follows the title orbit therefore carries `prev: 'cove'`; listeners use `continued: true`, never `prev === null`, to recognise a Continue; a listener that keys on "a new run" accepts `prev ∈ {null, 'cove'}` (render's `applyZoneDefaults(zone, !prev || prev === 'cove')`; ui's zone toast timing; progression's market reset). The ui zone banner is guarded while `hub && flow === 'title'`.

### 13.4 Event order

- **Set Out (two steps):** Map Table confirm (ui) → `game.planSetOut(config)` stores `meta.pendingSetOut` (the chosen Waystone flares; save) → the player taps *Board* on the raft (refused without a plan) or *Set Out now* on the card → `player.walkTo('raft')` (foot) → board → `player.glide(COVE.setOutPath, {duration: EXPEDITION.setOut.glide})` with render's `setout` (then `gate`) camera → when the raft crosses `COVE.archLineZ`, player calls `game.setOut(plan)` → `progression.createExpedition({zone, nightMode, character, outing})` sets `state.run` (moving `meta.tray` into the run) and clears the plan → `expedition:start {zone, nightMode, character, outing: 'first' | 'normal' | 'descent'}` → flow `playing` → `zone:change {zone, prev: 'cove'}` → `run:start {continued: false}` (legacy alias, removed once listeners migrate) → save. A reload with a plan but no run lands at the hub with the plan kept.
- **Return home:** Homeward stone hold complete, or Ride home → `game.returnHome({via})` → `expedition:end {result: 'home', summary}` → `run:end {summary}` (legacy) → `progression.bankExpedition(summary)` banks the summary into meta (creel sold, tally paid, marked fish moved to a pending Homecoming list) and sets `state.run = null` → flow `hub` → `zone:change {zone: 'cove', hub: true, prev, from: 'home'}` (the Wick spawns on the raft at the start of `COVE.homeInPath`) → `hub:enter {from: 'home', summary}` → `player.glide(COVE.homeInPath)` and moor (skippable: the Wick snaps to the jetty) → Homecoming (ui; each choice calls `progression.hangFish / keepInPond / sellMarked`, emitting `mount:hang` / `pond:add`; the `hang` camera frames the frame and places the Wick at the wing's foot, it does not walk) → save.
- **Snuffed:** `lantern:out` → 25 s guttering (survival `guttering`) → `player:died {cause: 'snuffed'}` (v3 expeditions; `progression.tryRevive()` first: Second Wick once per expedition) → `expedition:end {result: 'snuffed', summary}` → `run:end` → bank (creel and fish marked for home lost, Elder Log lines marked lost, tally × 0.5) → flow `hub` → `zone:change {…, from: 'snuffed'}` → `hub:enter {from: 'snuffed', summary}` → Snuffed summary → save.
- **Scorched** (Lantern only): Embers reach 0 → survival emits `player:scorched {night, x, z}` instead of `player:died` → combat `killAll('scorched')` and stops the director until dawn → survival `spendOil(30, 'scorched')`, sets `run.scorched` and a forced `run.lampWatch` (anchored within 10 m of x, z; fishing allowed; no Cinders) → `lampwatch:start {forced: true}` → at dawn: `lampwatch:end`, Embers mend, `run.scorched = null`. If a fish is hooked when Embers hit 0, the swarm still withdraws and the oil is still spent at once, but the anchor point is taken where the Wick stands when the fight ends (landed or lost): the fight is never cut short. No flow change; save on the phase change.
- **Continue:** boot → a saved run → restore it → flow `playing` → `zone:change {zone, prev, continued: true}` → `run:start {continued: true}` → the player snaps to `run.pos` (or resolves Snuffed, §13.6, if the save was guttering or at 0 oil). No saved run → flow `hub` → `hub:enter {from: 'boot'}`.
- **Gate passage within an expedition** (calm or dawn): `progression.travel(nextZone)` (toll on the first passage; `waystone:lit {zone}` the first time) → `zone:change {zone, prev}` (survival adds the Arrival Hush to that lake's first calm) → save. The +10 tally is credited at the end of the first full calm in the new lake.
- **The Long Descent:** `game.startLongDescent({character})` → `progression.createExpedition({zone: 'mossmere', nightMode: 'gloomtide', character, outing: 'descent'})` (which builds today's run shape: `run.shells` = 20, per-run `UPGRADES`, the twig rod) → `expedition:start {outing: 'descent', nightMode: 'gloomtide'}` → flow `playing` → `zone:change {zone: 'mossmere', prev: 'cove'}` → `run:start` → save. Death → `player:died` → v1 `endRun` → death summary → `game.toHub()` → `zone:change {…, hub: true, from: 'snuffed'}` → `hub:enter {from: 'snuffed', summary}`. Victory → `victory` → victory screen; closing it → `game.toHub()` with `from: 'home'` (the Lantern-Swallower is hung on its gilded chain).

### 13.5 Events (v3)

| event | payload | emitter → main consumers |
|---|---|---|
| `expedition:start` | `{zone, nightMode, character, outing: 'first'\|'normal'\|'descent'}` | main → progression, ui, audio, challenges |
| `expedition:end` | `{result: 'home'\|'snuffed', summary: ExpeditionSummary}` | main → progression, ui, audio, challenges |
| `hub:enter` | `{from: 'boot'\|'home'\|'snuffed'\|'title', summary?}` | main → ui (Homecoming / Snuffed / nothing), audio, actors, player |
| `fish:measured` | `{speciesId, z, sizeClass, ancient, length, weight, favours, records: [{kind:'pb'\|'classFirst'\|'place'\|'oldLedger'\|'elderLog'\|'bestSetup'\|'resident', …}], name?, place, fish, cove: bool}` — fired **at the seal stamp** by `progression.measure(fish)`; records are already written and saved; `fish:landed {measured: true}` follows at once and opens the card | progression (fishing calls `measure` at the stamp) → ui (banners), audio (bell), challenges, world (Tally Post), main (save) |
| `fish:marked` | `{uid, speciesId, nights}` (marked for home) / `fish:released-listless` `{uid, speciesId}` (the Live Well clock ran out) | progression → ui |
| `fish:escaped` | `{speciesId, sizeClass, z, approxLength, reason: 'snapped'\|'thrown'\|'spat'\|'spooled'\|'fouled'\|'staggered', place, x, zPos, markedFish: bool, name?, grade, legendary}` — **after** the loss and its 0.6 s quiet beat, every class (§13.7a); drives the got-away note (toast Small–Prize, card Trophy+). `markedFish` is true for an open-water Elder+ or, from P2, a Trophy+ at a place. Replaces `fish:escaped-big` (retired; its listeners filter on `sizeClass`) | fishing → ui (toast / card; the gear log pins it), progression (Marked Fish, Glimpsed page, Got away list, Elder name, legend wounds), challenges, audio |
| `tip:show` | `{id}` — a **directed tip** (D1′): the module that knows the moment emits it and ui shows the `TIPS` entry whose trigger is `tip:show:<id>`, once per save (`meta.seenTips`). `af_changed` (progression or the First Evening: a legacy save's first v3 bite), `af_letpass` (fishing: the first Prize+ tell), `af_hurry` (fishing: the first Small / Keeper play from the 2nd run), `af_strikeReminder` (the First Evening: the first lake bite after a fumbled tutorial strike) | fishing, progression, first-evening → ui |
| `mount:hang` | `{speciesId, z, frame, replaced: MountEntry\|null}` | progression → world (mount batch rebuild), ui, audio |
| `pond:add` / `pond:release` | `{speciesId, z}` | progression → actors (pond), ui |
| `resident:show` | `{place, zone, kind: 'boil'\|'pass'\|'leap', x, z, sizeClass, sizeZ}` (no species: a resident's name comes only from rumours and the Map Table; `leap` only if its species leaps) | fishing → audio, ui (edge marker); fishing-fx draws it as a night-ink proxy (a `leap` as a backlit proxy inside the pre-roll's +1 call) |
| `resident:landed` / `resident:roll` | `{place, zone, speciesId, z}` | progression → ui, world (Tally Post) |
| `farwater:dawn` | `{day, favour, murk, oilPrice, render, nightBurn}` | progression → ui (HUD gauge), survival, fishing |
| `condition:change` | `{zone, day, archetype, tomorrow}` (each calm start; `tomorrow` at dawn) | progression → world, water, fishing, audio, ui |
| `moonfall` | `{state: 'start'\|'end', place: 'ferry_market', reveal: ['bell_pool']}` | progression (owns the schedule: 25% and 70% of the calm, 20 s, 30 s in Moonmist; the Tuning Fork's extra one) → world (renders: shaft swing, `water.setClear`), fishing (sight fish), audio |
| `sign:spawn` / `sign:end` | `{id, kind: 'rise'\|'boil'\|'nervous'\|'strike'\|'bubbles'\|'glow', x, z, sizeClass?}` — informational (audio, tips, ui); fishing-fx draws signs and pre-rolled fish itself and asks water only for ripples and wakes (`addRipple` / `addWake`) | fishing → audio, ui |
| `lampwatch:start` / `lampwatch:end` | `{lampId, zone, forced}` | survival → combat (no swarm tonight), ui, audio |
| `player:scorched` | `{night, x, z}` (Lantern, Embers at 0) | survival → combat, ui, audio, progression |
| `swarm:window` | `{state: 'open'\|'close', night, mode}` | combat → ui (Embers arc, Flare), audio, world |
| `waystone:lit` | `{zone}` | progression → world (growth), ui, audio |
| `tackle:buy` / `tackle:fit` | `{slot, tier}` · `outfit:buy {item, level}` · `lure:buy {lureId}` (the four giants' lures included) | progression → actors (bench models), ui (the gear log re-reads `getGearLog`), audio |
| `levelup:banked` | `{count, level, added}` | combat → ui (the next measuring card / the dawn bell), progression (meta.bestLevel) |
| `fishing:tell` | `{sizeClass, biteTell: 'doublePop'\|'plunge'\|'dragUnder'\|'flatSlide'\|'dome', lead, dur, lastDip: 0.25}` — `lead` s before the bite; `dur` the float animation's length, always ending in the same 0.25 s last dip (P1; **no species**, §13.7a; legends add `{legendary: true, speciesId}`) | fishing → ui (U2), audio (the class's bite sound) |
| `fishing:strike` | `{grade: 'clean'\|'struck'\|'early'\|'late', sizeClass}` (AF; legends add `{legendary: true, speciesId}`) | fishing → ui (the strike word and ring burst), audio, actors, first-evening |
| `fishing:reel` | `{phase: 'take'\|'gain'\|'run'\|'hold'\|'surge'\|'glimpse'\|'leap'\|'scare'\|'place'\|'lastStand'\|'still'\|'lift'\|'loss', kind?: 'skitter'\|'grind'\|'lilies'\|'chains'\|'glassClear', sizeClass, t, dur, strength, tier, length?}` — the automatic play's beats (AF; class, z, the mean fitted `tier` and the place only, never species; `length` = `data.presentLength(lake, z)`, never the true length; legends add `{legendary: true, speciesId}`) | fishing → render (camera shake, leap slow-motion via `game.slowmo`), actors (the Wick's effort, rod bend, tow), audio (ratchet, hiss, hum, splash, music), ui (the class estimate on the first Prize+ glimpse or the Small skitter) |
| `fishing:landing` | `{sizeClass, ancient, legend, dur}` — the landing's payoff begins (polish, 2026-11-13): the play has run and the reveal's wipe starts (`dur` s of game time, `AUTOFISH.landing[class].wipe`). Class only: no species, name, rarity or length (the species is known at `fishing:caught`, when the wipe ends) | fishing → audio (the swell; its chime resolves on `fishing:caught`) |
| `ui:screen` | `{id: 'journal'\|'gear'\|'shop'\|…, open: bool}` (AF + FE) — a screen opened or closed | ui → first-evening (the odds step), tips |
| `fish:action` | `{action: 'keep'\|'eat'\|'render'\|'release'\|'mark', speciesId}` (kept from v1; FE uses card close = `release` in the cove) | ui → progression, first-evening |
| `journal:seen` | `{speciesId}` — a lost species not yet named gets its Glimpsed page | progression → ui |
| `fishing:pip` · `fishing:oldTrick` · `fishing:snag` | the manual v3 reel's (P1) — **retired on the v3 path by AF**: pips are cut, the old trick is the class-generic `fishing:reel {phase: 'lastStand'}`, and the Lantern-Swallower's Grasping Dark is two staged `fishing:reel` beats (combat still draws the hand) | fishing → ui, audio, combat |
| `rumour:new` / `rumour:solved` | `{id, tier}` | progression → ui |
| `ledger:refresh` / `ledger:complete` | `{slot, req}` | progression → ui |

**Changed payloads (additive):** `zone:change` + `hub`, `from`, `continued`; `fishing:bite` + `{sizeClass, biteTell}` and, on the v3 path, **no species** (§13.7a; legends `{legendary: true, speciesId}`); `fishing:hook` + `{grade, sizeClass}` and no species (AF: `pips` gone; `perfect` = a Clean strike, for the streak; legends `{legendary: true, speciesId}`); `fishing:surge` stays v1-only; `fishing:miss` reason + `'passed'` `{refunded, favour, lingers: bool}` (a lapsed bite let pass: refundBait, keeps the streak; `lingers` for a Prize+ fish that stays 45 s, §13.7a) and, on the v3 path, `'spooked'` for a tap during the nibbles (v1's `'early'` stays v1-only: `early` is now a strike grade); P1b's `fishing:reveal` is **dropped** (a leap no longer reveals; the reveal is `fishing:caught`); `fishing:escaped` on the v3 path `{reason, sizeClass}` with reasons `'snapped'`, `'thrown'`, `'spat'`, `'spooled'`, `'fouled'`, `'staggered'` and no species (the species follows on `fish:escaped`); `fishing:caught` + `{fish, z, sizeClass, ancient, length, favours, grade}` (`weight` stays kg; **informational only**: fishing already holds the Fish from `progression.makeFish`, and nothing is written on it); `fish:landed` + `{measured: true}` (it follows `fish:measured`); `player:died` cause + `'snuffed'`; `phase:change` + `{nightMode, swarm: bool}` on the night; `run:start` / `run:end` kept as legacy aliases of `expedition:start` / `expedition:end` until every listener migrates. **Tips** may trigger on any v3 event (`event` or `event:<disc>` as §12.3).

`ExpeditionSummary = { result, outing, nightMode, zone, startZone, days, nights, fishCaught, pbs: [speciesId], classFirsts: [{speciesId, sizeClass}], places: [placeId], marked: [Fish], creel: [Fish], creelShells, tally: {dawns, stillNights, swarmNights, lakesCrossed, ledger, total, mult}, memories, shellsEarned, markedFishCreated: [id], gotAway: [string] /* was nearMisses */, nextGoal: string, records: [string], challengesCompleted }`.

### 13.6 Saving (v3)

- **In expeditions** (main): every 30 s of play, on every `phase:change`, on `visibilitychange: hidden` and on `pagehide`, on **`fish:measured`** (so a reload after the stamp keeps the PB and class first), plus v1's `fish:landed`, `shop:buy`, `relic:buy`, `zone:change`. **Nothing is saved during a play** (§13.7a): the roll lives in memory only, so closing the tab mid-play loses that fish with no record and the bait already spent; a reload gains nothing. `fish:escaped` saves the Glimpsed page, the Got away list, Marked Fish and legend wounds. P1–P2 runs use the same triggers. Before every autosave main calls `ctx.player.writeSave?.(state.run)` (writes `run.pos {zone, x, z, y, mode, mooring}`; on walking lakes also `run.flags.raft`). Oil and the phase clock are in `run` already (survival).
- **In the hub:** on `hub:enter`, after Homecoming resolves, on every purchase (tackle, outfit, lure, pond tier, relic, home bait and supplies into `meta.tray`), on `planSetOut` / `cancelSetOut`, on `mount:hang` / `pond:add` / `pond:release`, on `fish:measured` (cove), on `firstEvening:step` (§13.12; not in a replay), and on `visibilitychange` / `pagehide`. The 30 s timer does not run.
- **Load rules:** `player.restore(run.pos ?? run.flags.pos)` snaps to the nearest walkable cell (foot, body-eroded) or water cell (raft) by `walkGridFor` within 6 m, else the nearest lit sister-candle, else the zone spawn. A save made while **guttering or at 0 oil resolves as Snuffed** on load (§13.4 Snuffed, from `expedition:end`). Closing the tab never moves you closer to home.

### 13.7 Module APIs (v3)

**main** (integrator): §13.1; the guard of §13.3 for its own state; calls `progression.migrateSave`, `createExpedition`, `bankExpedition`, `summarizeExpedition`.

**progression** (owns every v3 gameplay state and meta)
```
migrateSave(save) -> save                                   // §13.2
createExpedition({zone, nightMode, character, outing}) -> run   // 'descent' builds today's run shape (run.shells, UPGRADES)
summarizeExpedition(result) -> ExpeditionSummary;  bankExpedition(summary)        // bank sets state.run = null
getStats(run = ctx.state.run) -> Stats                      // P3 expeditions and the hub: data.tackleStats(meta.fitted) REPLACES the STATS base for castMax,
                                                            //   hookWindow (the strike-window multiplier) and creelSize, and carries `hold: {rod, line, reel}`
                                                            //   (automatic fishing, §13.7a); Wick, relics, Boons and outfit add as today. P1–P2 runs and The
                                                            //   Long Descent: today's computeStats(UPGRADES) plus `hold` from data.upgradeHold(run.upgrades)
                                                            //   (interpolated: every level counts; upgradeTiers gives only the rating). shock / pipBonus / absorb / dragAt
                                                            //   are retired (D1′); slackTime, lineStrength, reelSpeed and sweetZone have no effect in v3 fishing, and v3
                                                            //   builds drop them from Boon, relic, per-run tackle and Wick effects (data.DESC_V3)
getLoadout() -> {rod, line, reel, hold?, item, itemLevel, upgrade?}   // what catchChance reads. P3 expeditions / hub: fitted tiers + the equipped bait or lure.
                                                            //   P1–P2 runs and The Long Descent: {hold: data.upgradeHold(run.upgrades)} (every level counts),
                                                            //   item = run.equipped AT THE CAST (a bait or a run lure), upgrade = {id: 'lure_glimmer', level}
                                                            //   (never stacks with the item: the larger counts); run-less (the cove) = T0, no item
getCatchBuffs(speciesSizeClass?) -> {wellFed, boons, relics, character, firstHookTonight}   // the buff context for catchChance (relics ≤ 3, run buffs ≤ 4, ≤ 6 together)
// the logs (automatic fishing: the only place a % is shown; ui prints data.catchDisplay(p), rounded down)
getOdds(speciesId, {fitted = meta.fitted, item = equipped} = {}) -> {known: 'unseen'|'glimpsed'|'caught', odds: {small…ancient: p|null} | {legend: p},
        withBest: {item, odds} | null, marked: [{name, sizeClass, approxLength, p}], wounds: n}   // reference strike, OWNED RELICS IN (CATCH_V3.display.reference.buffs
                                                            //   'relics'), no run buffs; 'unseen' → odds null ("?"); P1–P2: the run's Hold and held baits / run lures
getGearLog() -> [{id, kind: 'rod'|'line'|'reel'|'bait'|'lure', name, tier?, hold, emphasis?, targets: [speciesId met] | 'all' | {family}|{night}, price, owned, proof?}]
                                                            //   + pinned: {speciesId, sizeClass, reason} = the last fish that got away (auto), or the player's pin
compareOdds(speciesId, sizeClass, loadoutA, loadoutB) -> {a: p, b: p}   // the gear log's pinned-species compare
shells (getter: meta.shells in expeditions, run.shells in The Long Descent); addShells(n, reason)
// size, records, measuring
makeFish(speciesId, z, quality, {favours, place, grade}) -> Fish   // CHANGED: called by FISHING directly at the landing (it returns the Fish, with uid);
                                                            //   z replaces weight; length / weight / value / food / oil from data helpers (fishYieldV3 applies yield.factor);
                                                            //   automatic fishing: value, food, oil and fish XP × CATCH_V3.economy.norm[lake] (AF)
measure(fish) -> {records}                                  // called by fishing at the seal stamp. Does every duty v1's landFish did on fishing:caught:
                                                            //   journal (count, PB, class first, seals, Old Ledger, best setup, last lengths), Elder Log,
                                                            //   place Tally and mastery, instant Memories (MEMORIES_V3 / interim), XP, bounty / challenge /
                                                            //   Ledger hooks, the gate and victory; adds the Fish to the creel; then emits fish:measured
                                                            //   and fish:landed {measured: true} (ui opens the card). In the cove (no run): journal and
                                                            //   records only, no creel; the card offers Release only.
refundBait(baitId) -> bool                                  // fishing on a lapsed bite under "let it pass" (the cast's general bait comes back)
markForHome(uid) -> {ok, msg, nights};  unmark(uid)          // needs a free Live Well slot (TACKLE creel liveWell); legendaries need none
getLiveWell() -> {slots, used, fish: [{uid, speciesId, nightsLeft}]}
cutStrip(uid) -> {ok, strips: 3}                            // creel screen: a fish → 3 Cut Strip baits
// Homecoming
getHomecoming() -> [Fish];  hangFish(uid) -> {ok, replaced, ask?: 'shorterOrLowerClass'};  keepInPond(uid);  sellMarked(uid)
swapMount(speciesId, mountUid); emptyMount(speciesId); releasePond(uid)
// tackle and outfit (Gear Bench)
getTackle() -> {owned, fitted, catalogue: TACKLE, proofs: {tier: {done, label}}, rating: {zoneId: {reference, held, next, word}}}   // words only (catchRating)
buyTackle(slot, tier) -> {ok, msg};  fitTackle(slot, tier)     // setDrag is cut with the manual reel (AF)
buyOutfit(item) -> {ok, msg};  buyLure(lureId) -> {ok, msg};  equipLure(lureId) | equipBait(baitId)   // a lure OR a bait (incl. the four giants' lures)
getTackleRating(zoneId, loadout = getLoadout()) -> {reference, held, next, word}   // data.catchRating: words, never a % (AF; BALANCE.tackleRating retired)
// Set Out (P3): the plan lives in meta between the Map Table and the arch line
planSetOut({zone, nightMode, character, outing}) -> {ok, msg};  getPendingSetOut() -> plan|null;  cancelSetOut()
getTray() / addToTray({bait|supply|lure, id, n})            // home purchases; createExpedition moves meta.tray into the run and empties it
// the Moonfall schedule (P2): progression emits `moonfall` (§13.5); world only renders
getMoonfall() -> {active, k, place, nextAt}
// lakes, Waystones, travel
getWaystones() -> [{zone, lit, gateOpen, toll}]             // CHANGED meaning (sea-gate stones)
travel(zoneId) -> {ok, msg}                                 // within an expedition: open gate, lit Waystone or first-time toll
getHomeward() -> {x, z, distance, canUse, reason}           // the lake's Homeward Waystone
canRideHome() -> bool
// places, residents, Marked Fish, rumours, conditions
getPlaces(zoneId?) -> [{...place, found, mastered, astir, known, twist, holdsGiants, resident, tally}]   // v2 + v3 fields (Mossmere incl.)
getResidents(zoneId) -> [{place, speciesId, z, shows}];  rollResident(zoneId, placeId)
getMarkedFish(zoneId?) -> [MarkedFish];  addMarkedFish(escape)                 // ≤ 6 and ≤ 2 per lake (that lake's oldest replaced); from fish:escaped with markedFish
                                                            //   (open water Elder+, places Trophy+ from P2); P1 anchors within 8 m of the escape;
                                                            //   +6 Hold on its re-hook, once
addLegendWound(speciesId); clearLegendWounds(speciesId)    // fish:escaped of a legend → +1 (≤ 3 counted); a landing clears them (CATCH_V3.legend); The Long Descent: run.legendWounds
getRumours() -> [{id, tier, pinned, solved}];  pinRumour(id);  getTodaysRumour() -> {date, zone, place, speciesId|null, line}
getCondition(zoneId, day?) -> archetype;  getForecast() -> {zoneId: archetype}  // tomorrow per lake (two days with Murk's Spyglass)
getFarWater() -> {dawns, favour, shows, murkToday, oilPriceMult, renderMult, nightBurnMult}   // data farWaterFor(day)
getPressure(placeId) -> favour (≤ 0)
// Murk, Ledger, challenges, relics
canShop() (in the hub: false until P3, then true within 5 m of the barge; in a lake unchanged; P1–P2 lakes add Murk's per-run lure tab at 40%, AUTOFISH.runLures); shop.getItems() tabs: home 'sell'|'bait'|'supplies'|'ledger'|'rumours'|'cosmetics', lake 'sell'|'bait'|'supplies'|'ledger'|'kit' (combat modes)
getLedger() -> [LedgerReq];  turnIn(slot)
getChallenges() -> [{...challenge, tab: 'fishing'|'paths'|'measure'|'gloom', done, progress, target}]
getRelics() -> [{...relic, shelf: 'fishing'|'gloom', level, found?}];  buyRelic(id)
getLanding() -> {growth flags, frames: [{speciesId, frame, state: 'unknown'|'named'|'mounted', seal}], pond, waystones, legends}
tryRevive()  // CHANGED: Second Wick once per expedition, every mode
```
**The catch hand-off:** fishing calls `makeFish(…)` when the fish is landed and holds the returned Fish → `fishing:caught {fish, …}` (informational; progression writes nothing on it) → `fishing.startCeremony(fish)` → at the stamp fishing calls `progression.measure(fish)` → `fish:measured` → `fish:landed {measured: true}` → ui opens the card (Keep / Eat / Render / Mark for home in expeditions; Release only in the cove) → main saves on `fish:measured`. Owns the expedition tally, Far Water day state, the Live Well clock (decrements at each dawn, releases with `fish:released-listless`), residents (re-roll on the next Set Out after a landing, or after 3 in-lake days), Marked Fish, pressure (−0.12 per catch, floor −0.6, reset at dawn), rumours and today's rumour (seeded by the real date), conditions (seeded by expedition, day and lake), Murk's in-lake days (1, 2, 3, then odd days), the oil price and the crossing tally rule. Banks discoveries instantly (Memories) and the tally on return.

**fishing**
```
view += { favour: {mu, notches, terms: [{family, id, value}], quiet: bool},     // notches 0–5 (favourNotches)
          sizeClass: null|'small'|'keeper'|'prize'|'trophy'|'elder',           // null until the first breach (Prize+) or the landing
          ancient: bool,                                                       // pips are cut (AF)
          speciesId: null, rarity: null,                                       // null from the cast until the reveal (§13.7a); legends exempt (view.legendary)
          strike: null|'clean'|'struck'|'early'|'late',
          play: {t, dur, phase, k /*presentation progress 0–1*/, line /*presentation tension 0–1*/, bend, glimpse: bool, leap: bool}|null,   // AF; class and z only
          biteTell: null|'doublePop'|'plunge'|'dragUnder'|'flatSlide'|'dome',
          measure: {phase: 'scoop'|'pose'|'cord'|'banners'|'card', length, sizeClass, seal}|null,
          lure: lureId|null, place, cove: bool }                               // no odds field exists on the view, ever; `drag` is cut
rollSize(species, mu, {place, maxClass}) -> z               // z ~ N(mu, 1) truncated [−2, 3.6], clamped by maxZFor / giant water
favourAt(point, species?) -> {mu, terms}                    // the one formula (BALANCE.favour). With a species: its full μ (the roll). Without: the
                                                            //   float's μ = species-independent terms + each species-specific term as the max over the
                                                            //   bait's eligible pool at that point (a pinned / today's rumour species instead when eligible),
                                                            //   so the float never reveals the rolled species (BALANCE.favour.float)
preroll({species, z, pos, path}) -> handle; dropPreroll(handle)   // the one "see the big one" primitive (rise rings, boils, glow trails, residents, sight, Moonfall,
                                                            //   reflections, Marked Fish). ONE owner: fishing-fx draws every sign and pre-rolled fish from a
                                                            //   per-fish instance buffer of NIGHT-INK PROXIES (position, heading, length; no species tint or glow;
                                                            //   ≤ 10 live, +1 call) and asks water only for ripples / wakes (addRipple, addWake); a resident's leap is
                                                            //   the same proxy as a backlit silhouette (only if its species leaps)
signs -> [{id, kind, position, ttl, prerolled?}]            // replaces `spots` (kept as an alias for one release)
armChum()                                                   // Murk's Chum (market, on purchase): the next cast spawns a 30 s nervous sign at the bobber
letItPass state; the strike, the hidden roll and the play (§13.7a; replaces pips, old tricks and the runner / sulker surge kinds)
planPlay(sizeClass, z, seed, {leapChance, tiers, place, legendId}) -> Plan   // pure (new fishing-play.js): beats, durations, glimpse / leap / scare / last-stand
                                                            //   windows from AUTOFISH.play; leap counts from AUTOFISH.leap.count[class]; never sees a species id
                                                            //   (fishing passes AUTOFISH.leaps[id] as leapChance; legends pass legendId → AUTOFISH.legendPlays)
                                                            //   and AUTOFISH.leaps (the species' leap entry is read here, never exposed); outcome applied after
partLine(reason: 'staggered')                               // combat only (Gloomtide hand slam that lands, non-legendary): the one call that ends a play
                                                            //   outside the roll; no player input ends a play (no cut: DESIGN §25.0.2c)
setTutorial(opts|null)                                      // §13.7a / §13.12: waits and presentation only; throws on outcome / class / chance / z / species
startCeremony(fish) -> Promise                              // sets ctx.cinematic; the reveal → scoop → pose → cord → stamp (calls progression.measure) → banners → card
cove mode: species = COVE.fishing.species; testBuoy cast → COVE.testBuoy.practice (the practice float: a bite every ≈ 3 s with the strike grade
                                                            //   shown, a sample play of any class on request; no fish, no rewards, no odds)
```
*The manual v3 reel (P1 as built; superseded on the v3 path by §13.7a when AF lands, kept here as the record):* Size scales the species' `difficulty` before `createReel` (`BALANCE.size.fight`, Elder age by lake); the reel model adds stamina × 1.4, easing by load, the fatigue clock (Elder floor 0.8), the old trick (`BALANCE.size.reel`; its kind is a 50/50 pull / leap read dressed by the species' style, `mixedRead`) and **drag on every fight from T0** (`BALANCE.size.reel.drag`): while tension T > `stats.dragAt` and rising, the reel absorbs dT × `stats.absorb` and progress slips 0.08 per unit absorbed; **Spooled** = progress 0 with cumulative slip > 0.5, any species. Rod `shock` scales the hold multiplier (× (1 − shock)); `pips` = 3 / 2 (+ `stats.pipBonus`). The 1.45× mid-fight mesh boost is removed (`fishing.js:663`), and so are the 0.12 m floor and the 6 m cap on the fish length used for splash and wake (`fishing.js:662`; a 0.08 m Cupbearer and an 8.5–9.7 m legend size their splash truly). Night Rise and every favour term come from `BALANCE.favour`; place membership from `data.placeAtV3`; place caps from `place.maxClass` / `species.maxClass` (a `giantsKept` place lifts both caps for its kept species only); Elders roll only in `holdsGiants` water, `arena.giantSpots` (the stopgap), at residents and Marked Fish (and the P4 Underdepth). **dropIn targets** (`BALANCE.placesV3.dropIn`): inside `rule.lock` of the target the cast lands at its centre at y 0 without the arc, obstacle and open-water tests; the hooked fish is held inside the target disc + 0.7 m and drawn only outside obstacle collision. **Let it pass:** a lapsed bite with no hook attempt calls `progression.refundBait(id)` and banks +0.15 favour for the next cast in the same place or within 6 m of the lapsed bobber (cap +0.3, reset on a hook or after 60 s). *Kept under automatic fishing:* **The hard rule:** in Still and Lantern a slam never parts the line; while `state ∈ {reeling, landing, lost}` no knockback or shove moves the Wick or the raft, a tap during a play is never read by combat, and `lineBroken()` ignores distance added by combat; in Gloomtide a hand slam that lands during a play calls `partLine('staggered')` on a non-legendary fish; **a creelsnatch never acts while a fish is hooked and never takes a fish marked for home (every mode)**. The slack budget applies only in combat modes. Asks progression for every record.

**survival**
```
getPhaseInfo() -> {phase, day, time, duration, k, isNight, nextPhase, hush, guttering, swarm}   // + guttering, swarm (tonight's swarm in the run's mode)
duration source: with V3 on, every run except The Long Descent (P1–P2 runs included) uses EXPEDITION.phases
                 (calm = EXPEDITION.calmByMode[zone.mode] + EXPEDITION.arrivalHush on day 1 and on the first calm after a gate);
                 The Long Descent and V3-off builds use BALANCE.phases (+ §24's BALANCE.travel.arrivalHush)
oilContext -> 'raft'|'foot'|'lamp'                           // BALANCE.oil.context; 'lamp' inside a lit sister-candle's light or at the moored raft
guttering (bool), gutterLeft (s)                            // 0 oil → Last Flicker (+12, once per day) → 25 s guttering (light 2.5 m, no casting) → snuffed
lampWatch -> {lampId, forced}|null                          // checked at dusk end (Lantern only): inside a watch lamp's pool (r 6, world.getWatchLamps) → no swarm
                                                            //   tonight; casts beyond 10 m refused; leaving the pool by > 10 m cancels it (lampwatch:end) and the
                                                            //   swarm window starts at the current k; a forced (Scorched) watch is anchored
spendOil(n, reason) -> bool (v2, unchanged); scorch() (internal; §13.4 Scorched)
```
In the hub: returns early (no clock, no drains). Satiety → Well-fed (`BALANCE.wellFed`: no starvation; ≥ 60% gives +2 Hold under automatic fishing (`BALANCE.wellFed.effects {hold: 2}` since D1′), read through `progression.getCatchBuffs` (P1 as built: reelSpeed +0.08, sweetZone +0.01), +1 dawn mend in combat modes). Only oil snuffs in Still and Lantern (`BALANCE.nightModes[mode].snuffBy`); Embers at 0 in Lantern → Scorched. Night oil × the Far Water night factor.

**combat**
```
nightMode (getter: run.nightMode); swarmTonight (bool); swarmActive (bool: inside the window now, or a Gloomtide calm raid; render's night camera follows it)
pendingOptions / chooseBoon unchanged; bankedLevels (= run.levelBank); offerBanked() -> BoonOption[]|null   // ui calls it on the measuring card or at the dawn bell
                                                            //   (it sets pendingOptions; chooseBoon(id) / skip() spend exactly one banked level, synchronously)
presentation {aura 0..1, embers, flare}; auraShown, embersShown, flareShown   // §25.5.7 by night mode (the day screen carries no combat UI);
                                                            //   flare() / canFlare() refuse, free, where the mode's table hides the Flare
```
Lantern's Warden rises at `BALANCE.nightModes.lantern.wardens.at` of the swarm window (0.10).
Director: `difficultyFor()` × `BALANCE.nightModes[mode].mult`, only inside `swarmWindow(mode, night, outing)` (data helper; Lantern k 0.05 → 0.50 on even nights, Gloomtide whole night, Still never, First Outing never); Lantern first elite at Heat ≥ 3, one formation per swarm, Wardens every 2nd swarm night (nights 4, 8) at hp × 0.75 withdrawing when the window closes; calm raids only in Gloomtide; Heat = max(day − 1, arrival offset) + 3 × zone with offsets from `EXPEDITION.deepStarts.heatOffset`; the linger rule in combat modes. Lantern threat model: fodder contact drains oil not Embers, a creelsnatch takes one fish not marked for home and never acts while a fish is hooked, slams never snap, Embers lost only to telegraphed hits; **while `fishing.state ∈ {reeling, landing}` no knockback (`knockPlayer`, slam knock) or Bulwark shove moves the Wick or the raft**, and `combat.onPointerDown` does not release the reel (in Still and Lantern a tap while hooked is ignored by combat); Scorched per §13.4. Gloomtide keeps today's slams and creelsnatch, except that a fish marked for home is never taken (`threat.creelsnatch: 'unmarked'`). XP per mode (`BALANCE.xpModes`, Still fish XP × 1.4 with no zone factor, discovery XP ≤ +12 per day); **level-ups earned while fishing, sailing or walking are banked** (`levelup:banked`), immediate only during a swarm; Angler-tagged offers capped at the Still rate in combat modes; Kindles only in combat modes; deep-start picks and Draft levels non-Angler. Still / Lantern legend fights: the Glass Sovereign without spawns; the Lantern-Swallower's Grasping Dark as two telegraphed snags (hand silhouette 1 s ahead), which under automatic fishing are staged beats of the legend's play (`fishing:reel`; no tension, no input, no change to the odds). Gloomtide: a hand slam that lands while `fishing.state === 'reeling'` calls `fishing.partLine('staggered')` (non-legendary). During the bite `combat.onPointerDown` is not called (main routes the tap to the strike, §13.1). **Fish XP owner:** `fishXpForMode` multiplies fish XP by `CATCH_V3.economy.norm[lake]` on the v3 path. In the hub: returns early.

**player**
```
interactable ids += 'station:<stationId>' | 'homeward' | 'rideHome'                 CHANGED
walkTo(stationId) -> bool                                  // hub only: BFS on the cove's walk grid (tap-to-walk); stations only (incl. the four wall_* wing stations)
glide(path, {duration, onLine?: {z, fn}}) -> Promise        // scripted raft travel along waypoints (COVE.setOutPath / homeInPath): no input, no collision,
                                                            //   camera by render's setout / gate; onLine fires once when the raft crosses z (game.setOut at COVE.archLineZ)
writeSave(run) / restore(pos)                              // CHANGED: run.pos {zone, x, z, y, mode, mooring}
getMode() -> 'foot' | 'raft'                               // in the cove 'raft' while §24's foot controller is missing (Landing v0)
```
Hub mode: foot movement (§24's foot controller: DESIGN §25.14.4 S0 builds it in P3 if §24 has not), no drains, spawn per §13.3, station pills within `COVE.stations` ranges (Murk 5 m, wall wings 4 m, others interact range); *Board* needs `meta.pendingSetOut`. Landing v0: on the raft, pills from `COVE.v0.posts` within 5 m. The **Homeward Waystone**: within 4 m during calm or dawn, a 1 s hold → `game.returnHome({via: 'stone'})`; **Ride home** from Murk's barge while moored in calm → `game.returnHome({via: 'barge'})`.
**The anchor (AF, every v3 build and mode; §13.7a):** while `fishing.state ∈ {reeling, landing, lost}` player ignores movement input (not buffered; v1's 0.6 s movement cut `BALANCE.move.cutLineHold` is never read on the v3 path), `knock / push / pull / pushOut / pin` leave the Wick and the raft where they are, and only fishing's tow of the play moves the raft.

**world**
```
setZone('cove')                                            // builds COVE (never ZONES[0]); getZone() -> COVE in the hub
getStations() -> [{id, name, position, pill, range}];  getHomeward() -> {position, radius} (the lake's stone: ZONES[].homeward; a r 0.6
                                                            //   lantern-stone with a raft collision circle on raft lakes and a walk BLOCK (h 1.4) on foot lakes)
getWatchLamps() -> [{id, x, z, position, radius, lit, name, dock, kind: 'buoy'|'candle'}]   // P1: ZONES[].arena.watchLamps (the Mossmere's drawn dock
                                                            //   buoy-lamps; raft fallbacks for §24's lakes without §24) or §24 lamps with watch: true; radius 6
                                                            //   (BALANCE.nightModes.lampWatch.radius); the same array every call; ids stable (se_buoy, w_buoy);
                                                            //   a §24 sister-candle reports lit:false until lit, and survival and ui skip entries with lit === false
getGiantSpots() -> [{id, kind, x, z, r}]                   // the stopgap's holdsGiants water in a lake whose places are not in the build (arena.giantSpots); copies
getDepth(x, z)                                             // CHANGED (every lake, raft lakes too): inside a place's water clamped to place.water.depth (as §24.4)
pickFrame(ndc) -> speciesId|null                           // hub, `wall` camera only: raycast against the mount batch and the frame atlas quads
setGrowth(landing)                                         // visibility / emissive only: frames, wings, sailcloth, stair, lanterns, keepsakes, legends
setMounts(entries)                                         // asks models.buildMountBatch; rebuilt on Homecoming, Swap, pond:add and pond:release
setCondition(archetype)                                    // particles, fog, uniforms; no geometry movement
setMoonfall({state, k}) ; setTallyPost(placeId, record)    // render-only (progression owns the schedule and emits `moonfall`); Tally Posts stand at
                                                            //   place.tallyAt (raft places: a flood-gauge stone, collision r 0.4) or the place's stand (§24); ≤ 2 live canvas sprites
getPlaces() includes the Mossmere's 8 (+ the P4 secret) with v3 fields
```
Owns the cove build (§25.4.6 reuse table, budget §25.4.7; the land by extrusion of `COVE.walk` shapes in world-cove.js, theme `'cove'`), the Mossmere place props (the Cupped Hands with their water-level bowl, chains, the `gatehouse_face` dressing, the buoy-lantern row as surface glow decals + float caps), the Mossmere re-dress (`MOSSMERE_V3.redress`: bridge arch spans and deck, the Sluice Veil card and aqueduct segments, bollards and buoy-lanterns in place of street lamp-posts, the toll-tower), authored cracks (`arena.cracks`, read before the procedural ones: the Moon-Eye), the condition presets, Moonfall's rendering (shaft swing + `water.setClear`) and P4's wow happenings; no gameplay state (progression owns it, Moonfall's schedule included).

**water**
```
applyZonePalette(COVE.palette) on zone:change {hub: true}  // no ZONES[0] fallback
setPondHole({x, z, r} | null)                              // one vec4 uPondHole; the discard is compiled only under material.defines.POND_HOLE, set on
                                                            //   zone:change {hub: true} and removed on leaving (needsUpdate), so no lake shader carries a discard
setClear([{x, z, r, k, paint: {atlas, cell, rect: [x0, z0, w, h]}}] | [])   // uClear[2]; each disc samples its own cell of one painting atlas (256², 2 cells;
                                                            //   128² and radius × 0.7 on low), mapped by its world rect (MOSSMERE_V3.happening.clear)
setBand({x, z, angle, width, k} | null)                    // P4 the Alignment: one vec4 + vec2 band-mask uniform (not uClear discs)
setGlowtide(k 0..1 | null)                                 // night sparkle; off on low. In a v3 run water eases it from survival.getPhaseInfo() itself (calm 0,
                                                            //   a dusk glimmer, night 1, the dawn fade; not in The Long Descent); k overrides, null hands it back.
                                                            //   It exists in every build (a no-op in v1 / v2)
signKinds: ['rise','boil','nervous','strike','bubbles','glow'] // v3 builds only (undefined in v1 / v2): fishing feature-detects tagged marks with Array.isArray
addRipple(x, z, strength, {kind, size (m) | length | sizeClass, delay, noSplash}?)   // kept; the tag makes a sign mark (broken arcs, ink troughs; the strike
addWake(x, z, dirX, dirZ, strength, {kind: 'glow'}?)                               //   throws its own spray crown unless noSplash). Untagged = v1. fishing
                                                            //   paints the signs (fishing-fx owns sign linework and the pre-rolled fish; water only its marks)
setCondition({swell, rain})                                // Hush swell × 0.2, Drizzle rings
```
The pond surface (transparent, after the pond fish, no depth write) and the floor disc at y −0.7 are water's (+2 calls).

**render**
```
modes += 'trophy' | 'cove' | 'gate' | 'wall' | 'hang' | 'pond' | 'setout' | 'prologue' (FE, §13.12) | 'vista' (P4)   // every number in BALANCE.cameras / FIRST_EVENING.shot, in render's convention
setTrophyTarget({length (m), landmark, position?, place?})                                // landmark = data.landmarkOf(place) | null; null at the card
```
The trophy subject is `actors.getMeasureFocus()` while a measuring pose is up; after `setTrophyTarget(null)` the framing holds while `ui.isBlocking()` (the catch card) and eases back 0.6 s after. Landscape keeps the distance rule exactly; a phone held upright may step back up to 1.6× it (fov capped at 66°).
`BALANCE.cameras` presets carry render's full parameter set (`elev, dist, aim, aimY, fov, ahead, stiff`; pitch = atan((dist·sin elev − aimY) / (dist·cos elev + aim)), not elev) and a `portrait {elev, dist, fov}` that replaces v1's widening on foot and in the cove; raft presets keep v1's widening. sail 24° / 15 m / aim 6.5 / aimY 1.4 / fov 52; fish 28° / 13 m; `walk` 34° (§24.5 v3); the reel camera follows line distance and fight state only, never size class; **the night overview blends in only while `combat.swarmActive`** (quiet nights, Stillnights and lamp-watches keep sail / fish with the night grade); `trophy` distance `clamp(1.2 + 1.6·L, 1.6, 16)` m, crane to 50° above 4 m, yaw toward the landmark by at most ±35° from north (on foot the occlusion cone and terrain clamp stay on; no landmark → no yaw change); `gate` only during glides or at its look spot on the jetty root with no line out; `wall` focuses the nearest wing (aimY = its middle frame band); `hang` focuses the frame centre; the title orbits a southern arc of the cove. The leap reveal's slow motion goes through `ctx.game.slowmo(0.25, 0.35)` (main owns `ctx.time.timeScale`).

**models**
```
createFish(speciesOrId, {z, zone?, lengthCm?} | weightKg) -> FishVisual   // CHANGED: {z} → true length L in metres (sizeLength at arg.zone, else the run's),
                                                            //   no ±22% scaling; the 0.12 m floor drops to 0.04 m; {lengthCm} sizes any model exactly (a bare shape too)
FishVisual += length (m), trueScale, setSilhouette(k 0..1)   // 1 = the unidentified fish of the bite and the play: a night-ink shape at its true size, no colour,
                                                            //   pattern, glow or eye of its species; 0 gives every part back (the landing). Nothing but fishing
                                                            //   toggles a held fish's visibility (never forced visible while fishing holds it)
buildMountBatch(entries: [{speciesId, z, position, yaw, frame, view}]) -> {near: Object3D[], far: Object3D, dispose()}
                                                            // per wall: one full-detail batch per wing (≤ 12 fish) + one LOD batch (≤ 600 tris per fish) for
                                                            //   everything else; world swaps them by wing distance (no rebuild); ≤ 12 calls, ≤ 80k tris in view;
                                                            //   mount view per frame: side profile, rays dorsal-up, jellies hanging (data.frameFor(sp).view)
fish shapes += 'sturgeon'; params += pattern 'marks', barbels, needleSnout; age marks (P4) by sizeClass
```

**actors**
```
setPose(name) += 'measurePalm' | 'measureArms' | 'measureHang' | 'measureAlongside';  showCord(lengthM, k 0..1)
showCatch(fishVisual | null)                               // the landed fish handed over for the ceremony (fishing calls it; the pose follows its length)
measurePoseFor(lengthM, {legendary}) -> pose name ; measurePose (getter) ; getCordInfo() -> {k, length, start, end, radius} | null
getMeasureFocus(out) -> {center, radius, pose, fish?: {center, axis (snout → tail, unit), length}} | null   // the trophy camera's
                                                            //   subject (render) while a measuring pose is up. An alongside fish lies along the raft's flank,
                                                            //   or across its near end when the raft's long axis points at the camera (never end-on); in a
                                                            //   close-up the raft's pole, hanging lantern and pennant step aside when they stand in front of it
merchant.arrive(position, yaw, {instant}); merchant.freeze(on); raft.freeze(on)   // ≈ 26 → 8 and → 4 calls
pond: { set(entries), update(dt), pick(ndc) -> uid|null }  // ≤ 6 live (2 on low), looping paths inside the hole; pick only in the `pond` camera
setDozingWicks({lit: [characterId], cold: [characterId]})  // one merged static silhouette: unlocked Wicks lit, locked ones as cold candles (FE / P3)
playWake(); setLantern(k 0..1)                              // the First Evening's wake beat; the Wick's lantern 0.7 → 1.0 at Set Out (§13.12)
setEffort(sizeClass, beat)                                  // automatic fishing: the Wick's effort and flame by class and beat (from fishing:reel); never species
setBench({tackle, outfit})                                 // rod rack, spools, reel, creel, pegs; the Long Oars on the raft
```
Murk's look follows `COVE.murkLook` (A10): skin #5a5444, lichen flecks #b8b0a0, lamp glow, halo and PointLight #ffe2b0.

**ui**
```
showTitle() (boot overlay: Begin | Continue | Settings over the cove)
showSetOut() / openTackle() (the gear log: progression.getGearLog) / showHomecoming(summary) / showSnuffed(summary) / showGotAway(fish:escaped payload)
  (Small / Keeper: a one-line toast; Prize+: the card with the "Odds in your log" link; replaces showNearMiss) / openMount(speciesId) / openPond()
openLog({speciesId, section: 'odds'|'field'|…}) (the Journal's Your odds block from progression.getOdds; refused while a line is out: AUTOFISH.logLock)
automatic fishing (AF): no reel bar; the strike word under the float and the strike ring (meta.settings.strikeRing); the class estimate on the first Prize+ glimpse;
  the card's "Strike: …" line; the Set Out rating in words; a "%" only inside the Journal and the gear log; nothing names the hooked species before the reveal
showMeasure(view.measure) (overlay, during ctx.cinematic) ; catch card += favours, banked Boon pick; Mark for home (nights) from P3 (in P1–P2 nothing is marked:
  every creel fish is "not marked" and the legendary trophy slot stays theft-proof)
P1–P2: New Descent mode cards (run 1: the First Outing card only; from run 2 Still / Lantern / Gloomtide with Lantern preselected); the death screen titled Snuffed;
  the Scorched card (Lantern, Embers at 0)
hub HUD (Shells, Memories, station pill, tap-to-walk glyphs) ; lake HUD by mode (BALANCE.nightModes[mode].hud) ; the float's favour (notches, long-press list, "gone quiet")
HUD += Far Water ◆ gauge, the Homeward stone's distance, Live Well nights ; Journal += ruler, seal grid, best setup, Elder Log, mount book, Places, rumours
Challenges tabs: Fishing | Paths | The Measure | Gloom ; pause += quick links (in the hub: every station screen, Set Out, Title; in a lake: Journal,
  Challenges, Settings, Title only, because tackle and outfit are only fitted at home)
```
No modal opens while the Wick moves or has a line out (banked level-ups wait for the card or the dawn bell).

**audio**: SFX `cord_tick, class_chime, seal_stamp, bite_doublepop, bite_plunge, bite_dragunder, bite_flat, bite_dome, rise_plip, rise_gulp, boil_glunk, strike_slap, night_rise, stillnight_bed, moonfall_shimmer, hook_clink, mount_sting, homecoming, setout, cove_ambience, murk_bell_far, line_hiss, reel_scream, foul_clank`; automatic fishing (AF): `strike_clean, strike_struck, strike_early, strike_late`, the play's beats by class and length (ratchet, hiss, hum, splash, leap slap, strain), loss sounds by reason (`loss_snap, loss_thrown, loss_spat, loss_spooled, loss_fouled`), species voices only on `fishing:caught`, music by class from `fishing:reel`; the First Evening: `ember_swell, flame_catch, murk_grumble` (§13.12); `pump_thud` is cut; moods `hub`, `stillnight`; no `descend` on hub transitions (`setout` instead).

### 13.7a Automatic fishing: the strike, the hidden roll, the play (binding; DESIGN §25.6)

The user's direction of 2026-11-05 (DESIGN §25.0.2a), as revised by the four-critic review (DESIGN §25.0.2b). On the v3 path in **every** v3 build and phase (P1–P2 runs, expeditions, the cove, The Long Descent) fishing is automatic; with `V3_ENABLED` off the v1 hold-to-reel game (§1–§11) is untouched and bit-identical (the flag-off fingerprint and the v1 golden fishing trace, §13.10). Where §13.5 / §13.7 above still name the manual v3 reel (pips, old tricks, drag, `fishing:pip`, `fishing:oldTrick`, the reel-sim tackle rating), **this section wins**; that code stays only until the AF build removes it (DESIGN §25.14.2a). The AF build starts from the P1b branches merged at pinned SHAs (AF-0).

**One formula, one owner.** `data.catchChance(speciesId, sizeClass, loadout, mods) -> p | null` is the only land-chance computation (pure; `CATCH_V3`; `catchParts` returns its terms). Fishing calls it once, at the strike, for the fish that bit; progression calls it for the logs and the tackle rating; nothing else computes or stores a chance.
```
loadout = { rod, line, reel, hold?: {rod, line, reel}, item?, itemLevel?, upgrade?: {id, level} }
          // fitted tiers 0–4 (fractional tiers interpolate Hold); P1–P2 / Long Descent: hold = data.upgradeHold(run.upgrades);
          // item = the ONE bait or lure on the line AT THE CAST (a swap after the cast changes nothing until the next cast);
          // upgrade = a per-run upgrade lure (lure_glimmer): the fish gets max(item Hold, upgrade Hold), never both
mods    = { lake?, strike?: 'clean'|'struck'|'early'|'late' (default 'struck'), buffs?: number | {wellFed, boons, relics, character, firstHookTonight},
            marked?, wounds?, landings?, night?, perRun? }        // perRun: legends use CATCH_V3.legend.fightRun (tiers from UPGRADES)
p = max(CATCH_V3.floor, CATCH_V3.cap[class] · σ(CATCH_V3.scale · (Hold − Fight)))      // every cap < 1: p < 1 always (validated)
```

**Phases** (`fishing.state` names kept): `idle → charging → casting → waiting → bite → reeling (the play) → landing (the reveal and the ceremony) | lost (the quiet beat, then the note) → idle`.

| phase | fishing does | emits (v3 payloads; **no species field anywhere in this column**; legends add `{legendary: true, speciesId}`) |
|---|---|---|
| waiting | nibbles from `BALANCE.bite.nibbles` only (count, times and the feint chance never depend on species or rarity); wait time never depends on species; a lingering passed fish (below) is offered first | `fishing:nibble` (as v1, no species) |
| bite | the class tell ending in the 0.25 s last dip; the strike window `clamp(AUTOFISH.strike.window[class] × getStats().hookWindow × (1 + bait.bonus.hookWindow) × place.hookWindowMult + place.hookWindowAdd (+ a wounded legend's windowBonus), AUTOFISH.strike.clamp)` (`BALANCE.bite.holdMult` is not applied); **input priority** (§13.1) | `fishing:bite {sizeClass, biteTell}` · `fishing:tell {sizeClass, biteTell, lead, dur, lastDip}` |
| strike | grades the tap after subtracting `AUTOFISH.strike.latencyComp[input]`: `'spooked'` (a nibble) / `early` / `clean` / `struck` / `late` / passed (no tap: `progression.refundBait`, favour +0.15; a Prize+ fish **lingers** 45 s within 6 m and is offered first to the next cast there with p 0.5, once, its species and z kept, `AUTOFISH.letPass`) | `fishing:strike {grade, sizeClass}` · `fishing:miss {reason: 'spooked'\|'passed', refunded?, favour?, lingers?}` · `fishing:hook {grade, perfect: grade === 'clean', sizeClass}` |
| roll (instant, at the strike) | `p = catchChance(species, class, progression.getLoadout(), {strike, buffs: getCatchBuffs(), marked, wounds, landings, lake, night, perRun})`; then **always, in this order**, `[planSeed, u, causeU, momentU]` from `S.rng` (outcome = u < p; cause from `AUTOFISH.loss`; moment ≥ `loss.minAt`), so a land and a loss on one seed share a plan; `debug.fishOutcome` overrides `u` only. Held in memory only; never on the view, an event or the save; **never derived from saved state** (a reload re-randomises; only the debug `fishSeed` repeats) | — |
| reeling (the play) | `planPlay(sizeClass, z, seed, {leapChance: AUTOFISH.leaps[id] ?? 0, tiers, place, legendId})` (pure module `fishing-play.js`; built **before** the outcome is applied; a loss overwrites the plan from the loss moment on, on a leap or a scare by `loss.onLeap` / `loss.onScare`); leap counts by class (`AUTOFISH.leap.count`), each at random in `leap.when`; scares by class; the fitted tackle (`play.tackle`); a place's beat (P2); inputs: pan and hurry (Small / Keeper, from the 2nd run) only; **no input changes the odds or ends a play** (no cut, DESIGN §25.0.2c); **the anchor** (`AUTOFISH.play.anchor`, every mode, from the strike until the card or the note): player ignores movement input (not buffered) and nothing moves the Wick or the raft but the plan's tow | `fishing:reel {phase, kind?, sizeClass, t, dur, strength, tier, length?}` (`length` = `data.presentLength(lake, z)`, on glimpse / leap / scare; render, actors, audio and ui listen; replaces `fishing:surge`, `fishing:oldTrick`, `fishing:pip` on v3) |
| landing | at plan fraction 1.0 (after the latest possible spat) the scoop; the reveal (the proxy's ink lifts in `AUTOFISH.revealWipe` while it eases from its class length to its true length; **`models.createFish(species)` is first called here**) → `progression.makeFish` / `startCeremony` / `measure` as §13.7 | `fishing:caught {speciesId, fish, z, sizeClass, ancient, length, favours, grade}` **when the wipe ends** (the species first appears here; nothing species-derived renders before it) → `fish:measured` → `fish:landed` |
| lost | the loss beat (the flee or drop-back is the proxy), then `AUTOFISH.loss.quietBeat` (0.6 s) with no UI; Marked Fish (`AUTOFISH.gotAway.markedFrom`), Elder names, legend wounds | `fishing:escaped {reason, sizeClass}` (at the loss; no species) → after the quiet beat **`fish:escaped`** `{speciesId, sizeClass, z, approxLength, reason, place, x, zPos, markedFish, name?, grade, legendary}` (the got-away note; `approxLength` = true length × U(1 ± AUTOFISH.gotAway.estimate), rounded per `gotAway.round`) |

**Loss reasons:** `'snapped' | 'thrown' | 'spat' | 'spooled' | 'fouled' | 'staggered'` (v1's `'snap'`, `'slack'` stay v1-only; there is no `'cut'`). `staggered` comes only from combat in Gloomtide (and The Long Descent): `fishing.partLine('staggered')` when a hand slam lands during a play on a non-legendary fish; it is the one event that ends a play outside the roll. **No player input ends a play** (the user's decision 3, DESIGN §25.0.2c: fully automatic after the strike). A snapped line costs the bait only (`TACKLE.lostLureFrac` 0).

**The anchor** (`AUTOFISH.play.anchor`; replaces the movement leash): while `fishing.state ∈ {reeling, landing, lost}` (from the strike until the card or the got-away note), in **every** night mode and in the hub (the First Evening's run-less play), player ignores movement input (stick, keys, tap-to-move; not buffered) and keeps the raft (on foot: the planted Wick) where it is; combat's `knock / push / pull / pushOut / pin` and the Bulwark shove are no-ops on the Wick and the raft (Gloomtide included; its hits still cost Embers); the only motion is the play's own tow (`AUTOFISH.play[class].tow`, planned by `planPlay`). In Gloomtide a tap during a play may still zap, and Flare, Burn and the weapons work; a hand slam that lands calls `partLine('staggered')`.

**The hidden-information rule** (binding for every module): **from `fishing:cast` until `fishing:caught` or `fish:escaped`, no species-identifying data reaches ui, audio, render, actors, combat, challenges or tips**: no species id, name, rarity, family, style, colour, glow, model, voice, stamina, true length or species-derived timing on any event payload or on `fishing.view`, and no odds anywhere. Concretely:
- `view.speciesId`, `view.rarity` are `null`; for legends they are set from the hook and every bite / tell / hook / strike / reel payload carries `{legendary: true, speciesId}` (non-legends carry neither field); consumers (the legend bait spend, the legend banner, combat's `legendQuiet`) key on `legendary`.
- **Length:** everything length-scaled before the reveal uses `data.presentLength(lake, z)` (a stylised ladder by size class, `AUTOFISH.proxy`; it takes no species): the proxy mesh, the shadow decal, splash, wake and spray, glimpse rings, leap height / arc / slap, every pitch or weight of sound, the Wick's effort, the rise-ring radius, boil ellipse and glow-trail brightness, visible / pre-rolled / resident proxies, `fishing:reel.length` and `signs[].prerolled`. True length first appears at the reveal and in the got-away note.
- The hooked fish is the one night-ink proxy (`AUTOFISH.proxy`: unlit, a plain wake, no light even for a glow species at night); no species model exists in the scene before the reveal. Leap counts and windows are class-level; the leap silhouette is the proxy.
- Strike windows, nibbles, feints, wait times, play length and every presentation parameter come from class, z, the fitted tackle and the place; species voices play at the reveal; aria labels name no species.
- **Signs:** a sign's tilt (rise, glow, nervous, strike, bubbles) is dropped, and its fish pre-rolled from the blind pool at that point, wherever the tilted pool would hold < 2 species or one above 80% (`AUTOFISH.signRule`), checked on every pre-roll.
- Fishing keeps the species privately (`S.species`) for the roll and the reveal. Pre-cast reading of the water (the bait's pool, a place's kept species) is allowed. **Exempt** (already named): legends; a Marked Fish (its note named it); a resident once a rumour, the chart or the Spyglass has named it (before that it shows class and z only); the cove's Quayling (one species).
- Debug hooks that return hidden state exist only when `core.debugEnabled()` (§13.1, §13.11).
- **The test that holds it:** species-swap invariance (§13.10).

**The logs** (the only place a % is shown): progression's `getOdds` / `getGearLog` (§13.7) feed the Journal and the gear log; ui prints `data.catchDisplay(p)` (rounded down; owned relics in). ui must not open the Journal or the gear log while `fishing.state ∈ {charging, casting, waiting, bite, reeling, landing}` or in `lost` before the note shows (`AUTOFISH.logLock`; every route in `AUTOFISH.logLockRoutes`: J, pause → Journal, the ledger entry, the Gear Bench, Murk's lure and bait rows, the First Evening's log glyph, the got-away link; the button reads "Reel in first."), and no view highlights the hooked species. The Set Out card and the Gear Bench show `catchRating` in words only.

**The tutorial seam** (the First Evening, §13.12): `fishing.setTutorial(opts | null)` accepts only `{nibbleAt, biteAt, retryBiteAt, retryNibbles, strikeRing, estimate}` (waits and presentation) and **throws** on any outcome, class, chance, z or species field (`FIRST_EVENING.tutorialApi`).

### 13.8 Data schema (v3) and the data-exports table

**Applied to the v1 / v2 tables when `V3_ENABLED` is on**, by `V3_PHASE` (§13.0's table; data owns the patch; consumers read the patched tables):
```js
SPECIES[] += { size: {L50 /*cm*/, sigma, body, k /*g/cm³*/} | legends {L50, W50 /*kg*/, sigma: 0.02} | Pilgrim Salmon {L50: {zoneId: cm}},
               style: 'steady'|'darter'|'sinker'|'thrasher'|'leaper'|'runner'|'sulker',   // behavior stays the reel core's base until runner / sulker land
               family: 'insect'|'predator'|'bottom'|'glow',   // read only by lures
               prefers?: 'hush'|'drip'|'mist',                 // the field-note condition (Match favour +0.3)
               weather?: 'hush'|'drip'|'mist',                 // a hard condition gate (DESIGN §25.8.1; the brief's `cond`)
               maxClass?: 'prize'|'trophy', spots?: {placeId: mult}, zones?: [zoneId] /*Wanderers*/, phase: 1..4, src: 'v1'|'walk'|'v3' }
               // automatic fishing reads species through catchChance (style, rarity, family, night, place, maxClass) and AUTOFISH.leaps[id]; no new SPECIES field
               // §24's place / cond stay; kept-fish conds add 'live' | 'target' | 'litRow' | 'relit' (KEPT_CONDS)
ZONES[mossmere].arena.places = MOSSMERE_V3.places (8 from P2 + the P4 secret); .arena.cracks = [{id, x, z, width, swing}] (P2)
ZONES[].arena.watchLamps = [{id, name?, x, z, radius: 6, dock}]  // P1: the Mossmere's drawn dock buoy-lamps; §24's lakes without §24: RAFT_FALLBACK_V3
ZONES[].arena.giantSpots = [{id, kind: 'ring'|'disc', x, z, r}]  // the stopgap holdsGiants water in a lake whose places are not in the build (3 per lake)
palette.accent = 0x8a4b3a (Mossmere)
ZONES[].homeward = {x, z, at, radius: 0.6}                       // P3: the Homeward Waystone, a blocking lantern-stone (≥ 25 m from spawn, clear of stands,
                                                                 //   slots, lamps, posts and buoys by 1.5 m and of barge pads by 3.8 m; validated)
places[] (Mossmere and §24 via PLACE_SYNC_V3) += { holdsGiants?, giantsKept?, giantsNonLegend?, giantsWhile?, giantsAt?, giantsDuring?, maxClass?, tally?,
               tallyAt?: {x, z} (raft places; §24 places use their stand), landmark?: {x, y, z} (data.landmarkOf), weather?, live?, secret?, ownResident?,
               kept?: [speciesId], attractAdd?, turnFavour?, reveal?, happening?, dropIn?, bowl?: {…, y: 0, dropIn}, spill?: {r: [r0, r1]} }
               // giantsKept: only the place's kept species may roll past the elsewhere clamp and the place's maxClass there
               // dropIn: a locked target inside obstacle collision (BALANCE.placesV3.dropIn); its centre must be open water (margin 0.5)
               // PLACE_SYNC_V3 waterDepth: [lo, hi] replaces a §24 place's water.depth (▲ the Lullaby 0.4–0.85, the Ferry Slip 0.45–0.95)
               rule.type += 'sight' {biteR, bite, spookOthers, glowIsSize?, softCast?} | 'drift' {lane, speed, seamRarity}
arena.lamps[] += { watch?: true, radius?: 6 }                    // two per walking lake (WALK_SYNC_V3.watchLamps), no holdsGiants water within 10 m
arena.shoreNotch = [{a, w, depth, len}]                          // a: centre angle in degrees, atan2(z, x) (270 = north at x 0); w: metres of arc at R;
                                                                 //   depth: water depth along it; len: metres beyond R. world-layout cuts the noisy
                                                                 //   shoreR, the cliff ring and its collision over that width (COVE: a 278°, the Moon Cistern a 0°)
// (D1′: v3 adds no STATS key; the manual reel's fight stats shock / absorb / pipBonus / dragAt are retired. Automatic fishing reads
//  TACKLE[].hold, upgradeHold and CATCH_V3.buffs; the v1 reel stats reelSpeed / lineStrength / sweetZone / slackTime are never read
//  on the v3 path, and v3 builds drop them from Boon, relic, per-run tackle and Wick effects: DESC_V3)
BALANCE += BALANCE_V3 keys (every key new; v3 keys for an existing block are merged into it, never replacing v1 keys: see `bite` below)
BAITS: pale_marrow → { id: 'last_candle', name: 'Last Candle' }; SUPPLIES: tide_chart → murks_chum
RELICS[] += { shelf: 'fishing'|'gloom', baseCosts, perExpedition?, memMultOn? } (costs × 0.55 / × 0.7); cut: old_debt, waystone_*   // P3 (with Pg3's refund)
BOUNTIES spot_catch → { type: 'signCatch', text: 'Catch {n} fish cast inside a sign on the water.' }   // P1 (feeding spots are cut)
BOONS += BOONS_V3 (6 Angler boons); tags += 'angler' on ANGLER_POOL
CHARACTERS[].fishing = { id, name, desc, …effect keys }          // the fishing half of each quirk
CHALLENGES = CHALLENGES_V3 (P3; 48 with WALK on): tab, alt (either-path), scope 'expedition'|'total'; new types nightsOut, lightWaystone,
             nightSpeciesClass, classCatch, lakeSet, elderEveryLake, oldLedger, markedHome, classZoneCharacters, catchSpecies
TIPS += TIPS_V3; MERCHANT_LINES += MERCHANT_LINES_V3; TEXT.v3 = TEXT_V3; TEXT.challengeTabs
```

**The data-exports table.** These are the names consumers import. The data author's names are used exactly where data.js already has them (checked against the working tree on 2026-11-04); "to add" rows are names this contract chooses for blocks the brief implies but data does not have yet.

| export | contents | brief block | phase | main consumers | status |
|---|---|---|---|---|---|
| `V3_ENABLED` | the v3 flag (`globalThis.GW_V3 === true`) | — | P1 | data, main, tools | in data |
| `V3_PHASE`, `V3_BLOCK_PHASE` | the phase a build carries (1–4, `globalThis.GW_V3_PHASE`, default 4); BALANCE_V3 blocks that land after P1 | — | P1 | data, tools | in data |
| `RAFT_FALLBACK_V3` | per lake: `giants` (the stopgap's 3 holdsGiants waters), `watchLamps` and `homeward` for raft builds of §24's lakes | §7.0 stopgap | P1 / P3 | data (applied), world, fishing, survival, player, validator | in data |
| `SIZE_CLASSES` | `[{id, label, zMax, bite, seal, ceremony, chime, named?}]` small → elder | §6.1, §5.4, §5.8 | P1 | fishing, ui, progression | in data |
| `BALANCE.size` | z (sd, min, max), tail, ancient, reachZ, giant clamp, `classMaxZ`, k by body, value / yield, legend sizes (D1′ retired the manual reel's `fight` and `reel` blocks) | `BALANCE.size` | P1 | fishing, fishing-reel, models, progression, tools | in data (`BALANCE_V3.size`) |
| `BALANCE.favour` | cap 1.8, notches, families and every term | §5.1, §6.1 | P1 | fishing, ui, tools | in data |
| `BALANCE.signs` | six sign kinds and their rules | §5.1 | P1 | fishing, water | in data |
| `BALANCE.bite` (v3 keys) | dragUnder, holdMult, letItPass, leapReveal (D1′ retired `pips`) | §5.4 | P1 | fishing, ui | in data as `BALANCE_V3.bite`: **must be merged into v1 `BALANCE.bite`** (v1 keys kept), not assigned over it |
| `BALANCE.ceremony` | beats, poses, wick height, trophy camera, mm below 20 cm (the near-miss card's config is retired: `AUTOFISH.gotAway`) | §5.8 | P1 | fishing, actors, render, ui | in data |
| `BALANCE.records` | Old Ledger z 2.3 (+5), seals 143 + 4 (the Lampwarden caps at Trophy: no Elder seal), escape estimate, Tally Posts, Elder Log fields | §6.3 | P1 / P2 | progression, ui, world | in data |
| `BALANCE.oil` | the context table (raft / foot / lamp × phase), Last Flicker, gutter, snuffBy, checks | §3.4 | P1 | survival | in data |
| `BALANCE.wellFed` | drain × 0.5, at 0.6, effects `{hold: 2}` (a run buff through `getCatchBuffs`; not a STATS key), dawn mend in combat, no starvation | §9.1 | P1 | survival, ui | in data |
| `BALANCE.farWater` | favour / shows / Murk / oil price / render / night burn rules + the day table + targets | §3.4 | P3 | progression, survival, fishing, ui, tools | in data |
| `BALANCE.liveWell` | nights by Creel tier [3, 3, 4, 4, 5]; legend rules | §3.4 | P3 | progression, ui | in data |
| `BALANCE.nightModes` | order, `default: 'lantern'`, firstOuting, per-mode window / mult / Wardens / threat / Scorched / XP / tally / HUD, `lampWatch`, `legendQuiet`, the hard rule | §4.1–§4.8 | P1 | combat, survival, fishing, ui | in data |
| `BALANCE.xpModes` | discovery XP, banked offers, levels per day, deep-start picks | §4.4 | P1 / P3 | combat | in data |
| `BALANCE.cameras` | every preset in render's convention (elev, dist, aim, aimY, fov, ahead, stiff, portrait), the night rule (follows `swarmActive`), trophy yaw limit, gate triggers, wall / hang focus, the title orbit | §3.7.5, §11 row 19 | P1 / P3 | render | in data (the brief's "cameras") |
| `BALANCE.residents` / `BALANCE.markedFish` | resident z, weights, shows, re-roll; Marked Fish (≤ 6, start progress) | §7.0, §5.7 | P2 | fishing, progression | in data |
| `BALANCE.placesV3` | new fields and rules, `sight` / `drift` numbers, giants per lake, discovery / mastery, Tally styles, persistence flags, the P1 stopgap | §7.0 | P1 / P2 | fishing, world, progression, tools | in data |
| `BALANCE.economy.startShells` | 20 (The Long Descent purse) | §3.9 | P3 | progression | in data (v1) |
| `SPECIES_V3`, `SPECIES_V3_BY_ID`, `SPECIES_V3_COUNT` | the 53-species roster with v3 fields | §6.5 | P1–P4 | data (applied), tools, ui (Journal) | in data |
| `FISH_FAMILIES`, `FISH_STYLES`, `FISH_SHAPES_V3`, `WEATHER`, `KEPT_CONDS`, `FISH_PALETTES` | vocabularies; `sturgeon` shape; per-lake fish hue stories | §5.3, §5.5, §6.6, §7.1 | P1–P2 | models, fishing, validator | in data |
| `ELDER_NAMES` | per-species syllable tables for Elder names ("Old Ninefin") | §5.8 | P1 | progression | in data |
| `MOSSMERE_V3` | palette accent, landmarks, props, the Moonfall happening, `watchLamps`, the 8 places + the Moon Cistern | §7.3 | P2 | world, fishing, water | in data |
| `PLACE_SYNC_V3`, `WALK_SYNC_V3` | ▲ field changes on §24's 21 places; renames, watch lamps, persistence flags, the Breathing Deep's live favour, the 3 P4 secrets | §7.4–§7.6 | P2 / P3 | data (applied), world, fishing, validator | in data |
| `PLACES_V3`, `PLACE_V3_BY_ID` | all 29 places (+ 4 secrets) with v3 fields applied | §7 | P2 | tools, ui (Journal, Chart) | in data |
| `CONDITIONS` | odds 40 / 20 / 20 / 20, archetypes, per-lake looks, budget | §7.1 | P2 | progression, world, water, fishing | in data |
| `RUMOURS`, `TODAYS_RUMOUR` | 24 rumours (6 per lake, three tiers); today's-rumour rules and lines | §7.0 | P2 | progression, ui | in data |
| `TACKLE` | per-slot tiers with **`hold`** (Rod 0/2/5/8/12, Line 0/2/5/9/13, Reel 0/2/5/8/12: automatic fishing's tackle term) and castMax, hookWindow, creel; prices, proofs, `clearWater`, `lostLureFrac` 0, `reference` per lake (D1′ retired the manual reel's per-tier stats, `drag`, `rating`, `gate`, `legends`, `targets`) | §5.6 | P3 | progression, fishing, ui, tools | in data |
| `OUTFIT`, `LURES`, `COMBAT_KIT` | outfit items (`chimney`, `brazier`, `oars`, `boots`); 9 lures: 5 family / night lures (the Feather Fly 120) + the four **giants' lures** (`bell_spinner`, `sporelamp_fly`, `mirror_shard`, `ferry_coin`: `species: [...]`, 220 / 480 / 950 / 1,600); the per-expedition combat kit (40% prices, combat modes) | §5.3, §5.6, §3.6 | P3 (lures: per run at 40% from P1 with AF, `AUTOFISH.runLures`) | progression, ui | in data |
| `EXPEDITION` | phases and `calmByMode`, Arrival Hush, Murk, Set Out, First Outing, Homeward stones, gates, deep starts, linger, Snuffed, tally, Homecoming, save, length | §3.2–§3.8 | P1 / P3 | survival, progression, player, main, ui | in data |
| `LONG_DESCENT` | unlock, Gloomtide, today's phases and Heat, its own purse, per-run UPGRADES, rewards | §3.9 | P3 | progression, combat, survival | in data |
| `ECONOMY_V3` | income per lake-day, the tackle timeline, welcome purse, cosmetics | §9.1–§9.3 | P3 | progression, tools (T3) | in data |
| `MEMORIES_V3` | every Memories source, the pool (≈ 4,550), per-hour targets, relic shelves, Gloom relics, cut relics, `interim` (the P1–P2 rule) | §9.4 | P1 / P3 | progression, tools | in data |
| `RELICS_V3` | relics with shelves and v3 costs (+ the 3 new) | §9.4 | P3 | data (applied), progression, ui | in data |
| `ANGLER_POOL`, `BOONS_V3` | the 15-boon Angler pool; the 6 new boons | §4.4 | P1 | combat, ui | in data |
| `CHARACTERS_V3` | fishing halves per Wick | §4.5 | P1 | combat, fishing, survival, ui | in data |
| `GLOOM_TAB`, `CHALLENGES_V3`, `CHALLENGE_TABS_V3` | the 9 Gloom-tab ids; 48 challenges with rewrites and tier V; tab names | §3.6, §11 | P3 | progression, ui | in data |
| `COSMETICS_V3` | the Knotted Rod Tassel (`rod_tassel`), the Ashen Cloak, Murk's cosmetic shelf | §3.9, §9.2, §11 | P3 | progression, ui | in data |
| `LEDGER` | 3 slots, refresh rules, templates (combat ones mode-gated), in-lake bounty share | §10, §15 | P3 | progression, ui | in data |
| `COVE` | the Landing: arena (shoreNotch a 278°) and walk, theme `'cove'`, stations (+ four wall wings), the test buoy and its practice fight, `setOutPath` / `homeInPath` / `archLineZ`, cove fishing, sea-gate, Waystones, walls / wings (lower 10.5 + chimney breast 3 + 10.5; upper 12 + 12) / frames and `frameHeight`, seals, pond, growth, palette, grade, green budget, Murk's look, lights, budget (mount batch near / far), `land: 'extrude'`, `v0` (Landing v0 posts) | §3.7 | P3 | world, water, render, player, actors, ui, fishing, validator | in data |
| `RENAMES` | save migration: Pg0 ids (P1); Pg3 detection (legacy / fresh), fresh purse 20, legacy rules (welcome purse 200, `firstOutingDone`, run shells and tally, gates by journal legendaries, no tackle grants), refunded relics, where each upgrade went, combat kit, meta additions | Pg0 / Pg3 | P1 / P3 | progression (`migrateSave`) | in data |
| `TEXT_V3`, `TIPS_V3`, `MERCHANT_LINES_V3`, `DESC_V3` | player-facing text (modes, Set Out, Homecoming, Snuffed, tips incl. the directed automatic-fishing tips `tip:show:<id>`, Murk's lines); `DESC_V3`: v3 wording and effects for the Boons, relics, per-run tackle and Wicks that named a reel stat | §2–§5 | P1–P3 | ui | in data |
| helpers `sizeL50`, `sizeLength`, `sizeWeight`, `sizeClassOf`, `isAncient`, `maxZFor`, `reachOf`, `favourNotches`, `classOdds`, `fishValueV3`, `fishYieldV3`, `farWaterFor`, `swarmTonight`, `swarmWindow`, `tallyFor`, `frameFor` | pure functions (lengths in cm, weights in kg); `swarmWindow(mode, night, outing)` returns `[k0, k1]` or null; `fishYieldV3` applies `size.yield.factor` 0.784; `frameFor` returns `{id, width, height, reach, view}` (Wanderers from their largest reach) | §3.4, §4.1, §5.1, §6.1–§6.2, §3.7.3 | P1–P3 | fishing, progression, combat, ui, models, tools | in data |
| `CATCH_V3` | the catch model (DESIGN §25.6.5): `scale`, `floor`, `cap` per class (all < 1), `wick`, Fight terms (`lake`, `rarity`, `style`, `headline`, `kept`, `fouled` / `fouledSpecies`, `class`, `elderStep`, `elderRarity`), `emphasis` per style (×1.6 / ×0.7 / ×0.7), `strike` (clean / struck / early / late), `items` (every bait and lure: Hold and whom it helps: `attract`, `all`, `night`, `family` or `species`; `lure_glimmer` an upgrade term), `buffs` (cap +6, `relicCap` 3, `runCap` 4), `markedFish`, `legend` (Fight, `fightRun` for per-run gear, style, wounds and `woundScope`, growth), `gloomtide`, `economy.norm` (fish XP: combat), `display` (owned relics in the log), `targets` (incl. `relicHoldByTier`, `levelGain`, `perRunSwallower`, `noviceCleanSmall`, `deepHeadlineT4Item`) | 2026-11-05 | AF (`V3_PHASE` 1) | fishing (the roll), progression (the logs, the rating), ui, tools | in data |
| `AUTOFISH` | automatic fishing's presentation and rules: `strike` (class windows, Clean part ≥ 0.3 s, grace, `lastDip`, `latencyComp`, `priority`, the reaction model, ring, haptics), `play` (per class: durations, runs, surges, glimpses, last stands, tow, bend, shake, music; `tackle`, `scare`, `placeBeats`; `inputs` {pan, hurry, endsEarly: false}: no cut; `anchor` {states, modes, hub, moveInput 'ignored', combatMoves false, towOnly, gloomtide}), `legendPlays`, `leap` (class `count` table, one `when` window, the proxy silhouette) / `leaps` (per species: one chance) / `leapRule` (by class) / `biteRule` (with `accepted`) / `signRule`, `loss` (windows ≥ 0.5, causes by style and class, `onLeap`, `onScare`, the draw order, hints), `proxy` (the class-length ladder, `lakeMult`, `zStretch`), `revealWipe`, `letPass`, `gotAway` (toasts to Prize, `markedFrom`), `rating` (words), `logLock` / `logLockRoutes`, `ceremony` (cord knots), `runLures`, `quality`, `text`, `time`, `player` (incl. `hurry`) | 2026-11-05 | AF | fishing, fishing-fx, actors, render, audio, ui, tools | in data |
| `FIRST_EVENING` | the opening and tutorial (DESIGN §25.4.8): `shipsWith: 'AF'`, steps and their times (`stepSec`, `stepAnim`, `stepMurk`: each step fits its Murk line), budget (card ≤ 50 s, lake ≤ 60 s), the Lantern Line's shots, line timings, the ember (z −34), the wake, the wait tip on the settled float, bite timings, the tutorial API (accepts / rejects), strike ring and estimate, odds (glow until opened), gate (the cove's closure), Set Out (auto-sail + glide), `everyRun` (the glide and Murk lines for every later run), `snuffed` (the hearth), resume, skip, legacy (the idempotent step and the offer ribbon), replay (writes nothing), tips marked seen, First Light, every string | 2026-11-05 | FE (`V3_PHASE` 1) | first-evening, ui, render, actors, player, fishing, progression, audio, tools | in data |
| helpers `catchChance`, `catchParts`, `catchOdds`, `catchItemHold`, `catchItemTargets`, `catchBuffHold`, `catchBestItem`, `catchRating`, `catchDisplay`, `catchClassAllowed`, `catchHomeLake`, `tackleHoldAt`, `upgradeHold`, `upgradeTierFrac`, `presentLength`, `leapCountsFor` | **the one land-chance formula** (pure): `catchChance(speciesId, sizeClass, loadout, mods) -> p|null` (§13.7a); its terms; the Journal row; an item's Hold and target list; the buff context (sub-caps); the best item for a species; the tackle rating in words; the logs' rounding (down); a fractional tier's Hold; P1–P2 / Long Descent Hold from owned levels; **`presentLength(lake, z)`: the length shown before the reveal (no species input)**; the class leap distribution | 2026-11-05 | AF | fishing, progression, ui, tools | in data |
| helpers `placeAtV3`, `landmarkOf`, `sealsFor`, `tackleStats`, `upgradeTiers` | **the one place-membership helper** for v3 (`placeAtV3(zone, x, z)`: the zone's `arena.places`, then §24's; v2's `placeAt` stays for v2 code); the trophy camera's target; the seals a species can earn; a fitted loadout's stats (castMax, hookWindow, creel, Live Well and `hold` per slot for catchChance); P1–P2 / Long Descent effective tiers from `UPGRADES` levels (the rating's words; Hold from `upgradeHold`) | §5.6, §6.3, §7 | P1–P3 | fishing, progression, render, ui, tools | in data |
| `FOUND_RELICS` | Reed Pole `reed_pole`, Seedlight Glass `seedlight_glass`, Tuning Fork `tuning_fork`, Deep Line `deep_line` (where found, what they open) | §7.7 | P4 | progression, world, fishing, ui | in data |
| `VISTAS` | 2 per lake: `{id, zone, x, z, name}`; hold 1.5 s; +1 Memory the first time | §7.7 | P4 | player, world, render, progression | in data (rules; stands authored in P4 with the §24 owner) |
| `REMNANTS` | 12 (3 per lake): `{id, zone, x, z, vignette, rumour}` | §7.7 | P4 | world, progression, ui | in data (rules; positions authored in P4) |
| `AGE_MARKS` | the 10 headline species' growing detail by class | §6.4 | P4 | models, ui-fishart | in data |

**Resolved data notes:** `BALANCE_V3.bite` merges into v1's `BALANCE.bite` (v1 keys kept; validated). `COVE.walkSpeed` is §24's 0.84 × 6 = 5.04 m/s. The Moon Cistern's `holdsGiants` makes four giant places in the Mossmere from P4: the "exactly 3 per lake" rule counts non-secret places only.

### 13.9 Performance (v3)

- Whole frame ≤ 150 draw calls (limit 250) in every scenario, measured on a mid laptop and a mid phone. **The Landing** (perf scenario `cove`): ≈ 130 high / ≈ 93 low with the pond, the lower wall and the arch in one view (budgets 140 / 100; DESIGN §25.4.7). **In-lake worlds**: raft lakes ≤ 50 / 39 (Sporewood ≤ 62 / 49), walking lakes ≤ 66 / 52 (§25.8.8); the worst case (night on foot in the Pallid, Lantern swarm, 2 Tally Posts, the Candle Tide) = 132.
- **No new dynamic lights** (≤ 4: the Wick's lantern, Murk's lamp, two world accents; at the Landing the hearth and the selected Waystone). Lamps, frame candles, shrine lanterns and pond lamps are emissive plus `water.setLights` streaks (≤ 6).
- The mount batch is a near / far pair per wall (the wing in view at full detail, everything else at ≤ 600-triangle LOD), swapped by wing distance without a rebuild: ≤ 12 calls and ≤ 80k triangles in view; it is rebuilt only on Homecoming, Swap, `pond:add` and `pond:release`. The pond hole's `discard` is compiled only under `POND_HOLE` while in the cove, so no lake's big opaque water draw loses early-Z on tile-based phone GPUs; `tools/perf.mjs` measures a raft lake, a walking lake and the cove with and without the define. The cove builds in ≤ 150 ms desktop / ≤ 600 ms phone under the zone flash. Signs reuse the ripple and wake arrays (no new uniform arrays); `uClear[2]`, `uPondHole` and `uGlowtide` are the only new water uniforms. One wow happening active per lake, ≤ 1 call each. Pre-rolled fish and Tally Posts add ≤ 3 calls.

### 13.10 Testing and validation (v3)

- `node tools/validate-data.mjs`: passes 1 and 2 compare every export of the flag-off builds with `tools/tests/v1-exports.json` (generated from c0e0ab9; `--refresh-fingerprint` only on purpose). Pass 3 also builds **every phase with and without §24** and checks what each carries (species 33 / 37 / 39 / 41 raft and 41 / 45 / 47 / 53 with §24, the cove's Quayling from P1 and in no lake's pool; challenges; relic cuts from P3; BALANCE blocks by `V3_BLOCK_PHASE`; places, props, homeward, the sturgeon shape), **3 giant sources and 2 watch lamps per lake in every build**, no holdsGiants water within 10 m of a watch lamp, **an Elder route for every Elder seal** (kept place with `giantsKept` / holdsGiants, or holdsGiants / stopgap water whose depth band and hours the species can use), the Mossmere's places against world-layout (no island overlap, ≥ 80% open, open dropIn centres, Tally stones, landmarks, the Sluice lane clear of the gate), Moonfall's discs and atlas cells, the reel (every Elder-capable species lands an Ancient on full T4 within 180 × 1.15 s with < 2% time-outs, known gaps listed), `tackleStats` against the sim's loadouts, camera presets in render's convention, the Landing's water side (v0 posts in raft reach, the test buoy within ±50° of up-screen, the glide paths clear of the barge, the buoy and the Waystones), the yield factor from the favour mix. The v3 pass (data's `--v3`, run with `GW_V3`): σ 0.09–0.175; ceiling ≤ 2.8× median; ≥ 2 giant-tail species per lake; legend length ≥ 1.4× the lake's longest ceiling; no green-teal fish colours (the existing guard: hue 65–195° with saturation ≥ 0.15); favour cap 1.8 and the worked examples; every place has a no-bait calm species; every kept species has a rumour and a condition; exactly 3 `holdsGiants` places per lake (non-secret), in reachable water; every Homeward stone ≥ 25 m of path from spawn; two watch lamps per lake; `COVE.walk` passes §24's rules (reachability, enclosure, 14 m south clearance); every wall wing packs in its own width × 3.6 m in 2D (frame heights by mount view); catalogue totals (18,610 / 3,680 / 5,040 lures); no `BALANCE_V3` key replaces a v1 key's contents. Passes 1 and 2 stay bit-identical with the flag off.
- **Automatic fishing (v3 pass; revised by the review):** every `CATCH_V3.cap` < 1 and > the floor; **every per-run rod, line and reel level adds Hold and raises the Reedjaw's Trophy chance by ≥ 1 point**; fractional tiers interpolate; the Lantern-Swallower on per-run gear 15–25% (R3 / L2 / E3) and ≤ 45% (T4); relics ≤ 3 and run buffs ≤ 4 under the +6 cap, owned relics in the log; a per-run upgrade lure never stacks with the item; the strike: clean > struck > early = late, a mistimed tap ≤ 3 Hold under the log, the last dip, latency compensation, a novice Clean ≥ 20% on Smalls; **`presentLength` takes no species, rises with z in every lake, and an Ancient's pass is longer than the raft**; leap counts are class distributions and `leaps[id]` one chance; the **bite rule** over every phase's roster (≤ 75% / 85%, accepted cells named with reasons and checked to be real); the sign rule's fallback cells reported; the let-pass linger, **no cut** (`play.inputs` holds only pan and hurry, `loss.external` only `staggered`, no `cut` key anywhere in the automatic-fishing data) and **the anchor** in every mode, scares, the draw order, Prize toasts, Marked Fish from open-water Elders, no lure lost to a snap, per-run lures at 40%; bigger classes never have a higher cap or a lower Fight; `TACKLE[].hold` rises strictly (matched sets 0 / 6 / 15 / 25 / 37) and `tackleStats().hold` reads it; every style has an emphasis averaging 1; clean > struck > 0 > early = late; strike windows by class, never shorter for a bigger class; **every bait and lure target exists** (each `CATCH_V3.items` entry is a real bait / lure / upgrade, helps ≥ 1 species, names only real non-legendary species and real families; every lure and non-legend bait has an entry; exactly one global bait); **no item, strike, buff, Marked Fish or wound makes any p reach its cap** (every species × class × item at T4 with every bonus; and `catchDisplay(p)` < cap × 100); **every Elder at matched T0 ≤ 10%** with or without any single bait or lure; Mossmere commons on T0 in 60–80%; the early headline Elders ≤ 10% on T0–T2 and 45–70% on T4 with their best item; no Ancient or legend ever reaches 50%; the tutorial Quayling 85–95%; play durations rise by class without overlap; every loss window starts at ≥ 0.5 of the play; loss weights per style sum to 1; every `AUTOFISH.leaps` id is a real lake species that can reach Keeper, with sane values; ≥ 5 leaping species per lake; **the leap ambiguity rule** over all eight phase rosters (P1–P4, with and without §24: no cell with exactly one leaper; none above 70% of expected leaps, 80% with a bait or lure); every First Evening and automatic-fishing string ≤ 90 characters with no % and no "!"; the First Evening's step times sum to its budget (≈ 54.5 s; the card ≤ 50 s, the lake ≤ 60 s; skip-framing ≈ 45.5 s) and **every step fits its animation and its Murk line** (2.4 s + 0.05 s per character); no Murk line in the wait or strike steps; the every-run lines, the snuff line and the offer ribbon exist; the tutorial API rejects outcome, chance and class; **the cove is closed** (no raft path from the mooring crosses the arch line except by a glide; the breakwaters and the soft wall), the mooring slot clears the jetty by the raft radius and the glides start there, the Map Table post is within reach of closed-cove water, **the Set Out auto-sail** (FE-T1: from every closed-cove raft-water point in the post's reach, via `FIRST_EVENING.gate.via` to `joinAt` and into the glide at `COVE.setOutPath[gate.glideFrom]`) stays on raft water and clears the jetty, the barge and the Waystones by the raft radius + 0.3 m, `COVE.subtitle` / `mode` are real fields, the test buoy has a radius and is off during the First Evening, the ember sits in front of the channel card.
- **Species-swap invariance** (AF's F17, in `tools/tests/` and `scenario-run`): for any two species eligible in the same cell, with the same seed, class and z (and their leap chance patched equal), everything observable from `fishing:cast` to the reveal or loss is identical: bus payloads, `fishing.view` snapshots, `audio.audioLog`, fx / actors / render calls and the camera. It catches nibbles, strike windows, style-driven motion, glow bursts and any new channel.
- **The v1 golden fishing trace** (AF-0): `tools/tests/v1-fishing-trace.json` (flag-off data, a seeded `Math.random` shim, a scripted hold / release bot over 40 casts, plus main's boot → title → New Descent order with no cove `zone:change`) is asserted after every AF and FE commit, beside the flag-off export fingerprint.
- `tools/sim/catch-v3.mjs` (the catch model: targets, per-lake / species / class tables at T0–T4 with and without the best bait or lure, items, legends, favour, landings per outing and the economy normaliser, the leap rule: `--all`, `--lake`, `--species`, `--leaps`, `--md`, `--json`, `--strike`), the pacing sim (T5) and the balance sim's expedition model (T3) per DESIGN §25.14. `tools/sim/reel-v3.mjs` (the manual v3 reel's sim) was retired with its data by D1′; `tools/sim/reel.mjs` stays as the v1 reference.
- `tools/perf.mjs` scenarios `cove` (T4) and `night-foot` (T6); `tools/hue-report.mjs` on a Landing shot that includes Murk's barge (≤ 2% green-teal chroma) and on each lake.
- `tools/scenario-run.mjs` traces the §13.4 event orders (Set Out, return home, Snuffed, Scorched, Continue, gate passage, The Long Descent) on the bus and fails on any reordering.

### 13.11 Debug hooks (v3)

fishing `forceBite({speciesId, z, place})` (extends v1's `forceBite()`), `instantCatch(speciesId?, {z})`, `setFavour(mu | null)`, `sign(kind)`, `preroll(speciesId, z)`; survival `setDay(n)` (Far Water), `snuff()`, `scorch()`, `lampWatch(lampId)`; combat `mode(name)` (test only: switches `run.nightMode`), `swarmNow()`; progression `giveTackle(slot, tier)`, `giveOutfit(item, level)`, `lightWaystone(zone)`, `openGateFor(zone)`, `rollResident(zone, place, z?)`, `addMarkedFish(speciesId, z, place)`, `condition(zone, archetype)`, `todaysRumour(id)`, `migrate(saveJson)`, `homecoming()`; world `growth(flags)`, `giantSpots()`, `cove()`, `v0(on)` (force Landing v0); progression `moonfall()` (fires the next Moonfall now), `planSetOut(plan)`, `phase()` (reads `data.V3_PHASE`); player `walkTo(stationId)`; ui `ui()` += `{hub, screen}`. `window.__gw.debug.v3()` returns `{flow, outing, nightMode, day, farWater, favour, pressure, liveWell, residents}`. **Automatic fishing (AF)** — every hook that returns hidden state (species, z, roll, plan, pre-roll) is registered **only when `core.debugEnabled()`** (§13.1), including P1's `fishing()` species fields: fishing `fishOutcome('land' | 'lose' | null, reason?)` (overrides `u` only; test-only, never called by the game), `fishStrike(grade)` (a scripted tap at that grade), `fishPlan()` (the current plan's beats), `fishChance()` (the current roll's p; dev overlay only), `fishSeed(n)` (seeds the roll and the plan stream; the only way rolls repeat), `fishLinger()` (the lingering passed fish, if any); progression `odds(speciesId, loadout?)`, `wound(speciesId, n)`, `marked()` (Marked Fish with anchors). **The First Evening (FE):** `firstEvening(step | 'reset' | 'done')`, `firstEveningLosses(n)`; main `freshSave()`.

**Built in P1** (the P1 staging merge, additive to the list above): fishing `forceBite({speciesId, z, place, wait})` (`wait`: land and let the tell play), `fishHook(speciesId, {z})`, `fishSeed(n | null)` (seeds the size roll), `fishPressure()`, `fishReel()` (the live reel), `fishing()` += `{z, sizeClass, ancient, length, mu, terms, tell, place, giant, pressureKey, letPass, extShift, hookSafe, nightMode, clean}`; survival `gutter()`, `hush(day)`, `lampWatch(lampId | null)` (S6: starts tonight's watch at that lamp, `null` ends a non-forced one; Lantern only), `survival()` += `{v3, nightMode, oilContext, wellFed, guttering, gutterLeft, scorched, lampWatch, durations}`; combat `combatV3()` (mode, window, difficulty readout), `snag()` (a Grasping Dark snag on the hooked legend); audio `audioLog(n)` → `[{name, at, t, pan, why}]` (`at` the audio time a sound was issued, `t` its scheduled start), `audio()` += `{time, auto, nightMode, cord, loops.bed}`; main `setV3(on, phase)`, `beats()`, `timeScale(x)` (the base time scale `slowmo` restores). Audio's Au1 sounds are `cord_tick`, `class_chime`, `seal_stamp`, `bite_doublepop`, `bite_plunge`, `bite_dragunder`, `bite_flat`, `bite_dome`, `rise_plip`, `rise_gulp`, `night_rise`, `stillnight_bed`, `murk_bell_far` (the Old Ledger bell on `fish:measured`) and the `stillnight` mood (`audio.v3Names`, `audio.v3Moods`); `fishing:oldTrick` and `fishing:snag` reuse `surge_warn` / `line_strain`.

**Built in P1b** (the gw-p1-full staging merge, additive): fishing `sign(kind, {x, z, speciesId, size, ttl, heading})`, `preroll(speciesId, z)`, `fishSigns()`, `ceremony()` → `{active, t, stamped, posed, pose, dur, beats, L, legendary, uid, cinematic}`, `cerRate(k)` (the ceremony clock for screenshots on software GL; keep ≥ 0.25), `fishing()` += `{meshVisible, veiled, silhouette}`; render `camera()` → `{v3, mode, prevMode, cur, tgt, yawDeg, fov, pitchDeg, presetPitchDeg, focus, pos, camToFocus, nightK, swarmActive, aspect, presets, trophy: {on, hold, t, length, dist, crane, yawDeg, landmark, place, radius, subject, camToSubject} | null}`; water `water()` → `{tier, v3, glowtide, glowTarget, glowManual, glowLive, lowDefine, ripN, wakeN, signRipN, signWakeN, signMarks, signWakes, uniforms, maxRip, maxWake, particles}`; world `watchLamps()`, `worldV3()` (v3 only); combat `combatV3()` += `{present, auraShown}`; ui `measureDebug()` (the overlay: `{t, plan, cls, f5, stamped, done, length, max, records, skippable}`).

### 13.12 The First Evening: state, events and seams (DESIGN §25.4.8)

A new game opens at the Landing with the First Evening; it is never a cold start in a lake. It ships as the FE slice right after automatic fishing (DESIGN §25.14.2b, `V3_PHASE` 1, before P2) and is extended, not replaced, by P3. Data: `FIRST_EVENING` (steps, timings, shots, lines, tips, budgets, the tutorial API). With `V3_ENABLED` off nothing here runs.

**State** (progression owns it; added lazily in v3, `core.defaultMeta()` untouched; `meta.tutorialDone` stays unread):
```js
state.meta.firstEvening = { done: bool, step: 'framing'|'wake'|'cast'|'wait'|'strike'|'play'|'measure'|'odds'|'gate'|'plan'|'setout'|null,
                            skipped: bool, legacy: bool, offerSeen?: bool }
// a separate idempotent step (not Pg0), only while meta.firstEvening is undefined: meta.runs > 0 or a non-cove journal entry →
// {done: true, legacy: true}; anything else → {done: false, step: null}; also set at First Evening start (§13.2)
state.meta.settings += { strikeRing: 'always'|'firstExpedition'|'never', hurry: bool }        // ui (AUTOFISH.strike.ring; hurry from the 2nd expedition)
```

**The director** (new `src/first-evening.js`, `ctx.firstEvening`, created by main when `data.V3_ENABLED && data.FIRST_EVENING`):
```
start({replay = false}) -> void        // from Begin on a save without meta.firstEvening.done (or Settings → Replay, or the legacy offer ribbon: a sandbox in which
                                       //   makeFish / measure, the save and challenges write nothing; meta is byte-identical afterwards)
skip() -> void                         // two taps on the Skip word: jump to 'plan', meta.firstEvening.skipped = true, nothing granted
isActive() -> bool;  step -> id|null   // read by ui, fishing, player, audio
allowsTip(tipId) -> bool               // ui asks before any tip: only the current step's tip passes while active
resume() -> void                       // boot with meta.firstEvening.step set: before the catch → 'cast' (Murk's wake line, no framing); after → 'gate'
```
Steps advance on bus events only (`fishing:cast`, the float settled, `fishing:bite`, `fishing:strike`, `fishing:miss`, `fishing:caught`, `fish:escaped`, the card closed = `fish:action {action: 'release'}`, the log = `ui:screen {id: 'journal', open}`, `interact:change {id: 'station:map_table'}` (player's station naming), the arch crossing). **A step never ends before its Murk line has played out** (`FIRST_EVENING.stepMurk`; 2.4 s + 0.05 s per character). Three losses (`FIRST_EVENING.bite.maxLosses`) jump to `gate` and set the deferred lessons (the measuring tip at the first lake landing, Murk's odds line at his first in-lake visit). The director never touches the outcome: it calls `fishing.setTutorial({...})` (§13.7a) on `cast` and `fishing.setTutorial(null)` on `setout`.

**Events** (director → ui, audio, render, actors, progression, main):

| event | payload | notes |
|---|---|---|
| `firstEvening:step` | `{id, prev, replay}` | on every step change; main saves `meta.firstEvening.step` on it (not in replay) |
| `firstEvening:line` | `{kind: 'lore'\|'murk'\|'tip', key, text}` | one at a time per kind; ui renders (lore lower third, Murk under his lantern, tips bottom-centre); audio plays Murk's grumble; **no lore or Murk line in the strike window; the only tip allowed in it is `fe_strike`** |
| `firstEvening:done` | `{skipped, replay, losses}` | at the arch crossing (or the replay's end); progression sets `done`; main starts the run |

**Seams by module** (FE work list, DESIGN §25.14.2b):
- **main:** boot builds the cove under the title (`zone:change {zone: 'cove', hub: true, prev: null, from: 'boot'}`) in v3 builds that carry `COVE`; a minimal flow `hub` (§13.1: `core.inWorld(ctx)`; survival and combat return early, no 30 s autosave); *Begin* on a fresh save → `firstEvening.start()`; on `firstEvening:done` → `game.startNewRun({character: 'wick', nightMode: 'still'})` (P1–P2; the First Outing by `meta.runs === 0`) or `game.setOut(plan)` (P3). **Every later run** sets out from the Landing too (the raft at the mooring, the glide, one `FIRST_EVENING.everyRun` Murk line; §13.1), and **a Snuff** cuts to the hearth for 3 s before the summary. No run in any build emits `run:start` without the glide. On a legacy save's first v3 boot the title shows the offer ribbon (`FIRST_EVENING.legacy.offer`). Pointer priority while active: the Skip word → fishing's strike (anywhere in the world view) → pills.
- **world:** `setZone('cove')` resolves `COVE` (§13.3: `themeOf` from `zone.theme`, the gate `{none: true}`, rect and capsule obstacles), the trimmed land by extrusion (quay, jetty, customs steps, one lower-wall slab with the chimney breast), the arch and Waystones (only the Mossmere's lit), **the breakwaters** (`COVE.arena.closure`), the hearth and **cold candles** (`setDozingWicks({lit: [unlocked ids], cold: [locked ids]})`), the Map Table v0 post, the ember sprite in front of the channel-mouth card at z −34 (`setEmber({pulse: true})`; hidden when `meta.landing.swallowerHome`); no test buoy during the First Evening.
- **render:** mode `prologue` from `FIRST_EVENING.shot` (eased keyframes; reduced motion = three cross-faded stills), then `cove` / fish / `setout` as §13.3.
- **actors:** Murk moored at home (not trading in the hub until P3); the wake beat on one silhouette (`playWake()`, 2.6 s, skippable); the Wick's lantern intensity `setLantern(k)` (0.7 → 1.0 over 0.8 s at Set Out).
- **player:** cove raft mode (Landing v0: `getMode()` returns `COVE.v0.mode` `'raft'`, no drains); the raft spawns at `COVE.arena.moorings[0].slot` (7, 2), yaw 90; the v0 post as an interact target (`interact:change {id: 'station:map_table', label: 'Plan'}`); the breakwaters as obstacles and the soft wall across the arch span (`COVE.arena.closure.softWall`) except during a glide; Set Out = an input-locked auto-sail at raft speed from the post straight to each `FIRST_EVENING.gate.via` point, then to `gate.joinAt`, then `glide([joinAt, ...COVE.setOutPath.slice(gate.glideFrom)], {duration: 3, onLine})` (the lane is validated clear of the quay, the jetty, the barge and the Waystones from anywhere in the post's reach) (the first departure glide is not skippable; later runs' glides are).
- **fishing:** cove mode (the Quayling pool, sales refused, Release only, exempt from the hidden-species rule, run-less T0 loadout); `setTutorial` (§13.7a); the class estimate on Small / Keeper for the first two plays (`FIRST_EVENING.estimate`; the Small skitter at the lift).
- **progression:** `meta.firstEvening`; the run-less `measure` for the Quayling (Journal, records, its first-catch Memories, First Light; nothing written in a replay); `getOdds('quayling', …)` for the log glyph; the legacy step (§13.2); `canShop()` false in the hub; `market.reset()` on `prev ∈ {null, 'cove'}`.
- **ui:** the fresh-save title (*Begin*, Settings, no premise paragraph); lore, Murk and tip layers (≤ 1 tip and ≤ 1 Murk line at a time, never in the same screen third on a phone; the wait tip as the float settles); the Skip word (≥ 44 px) and its confirm; the log glyph's glow (until the log is first opened) and `openLog({speciesId: 'quayling', section: 'odds'})` on a "The Landing" Journal tab; the First Outing card from the post; Settings → *Replay the first evening*; the legacy offer ribbon ("A new first evening (1 min)" / "Not now"); `ui:screen` events; `aria-live="polite"` for every line; the zone banner guarded on the title.
- **audio:** the cove bed, the ember swell, the flame catching, Murk's grumble per line, the `setout` sting (never `descend`) on every glide into a lake (`zone:change {prev: 'cove'}`).

**Testing:** browser scenario `first-evening` in `tools/scenario-run.mjs` (desktop and 390 px portrait; the reference, skip, three-loss, resume, returning, offer-ribbon, replay, later-run and snuff paths) checks the event order `firstEvening:step` framing → … → setout → `firstEvening:done` → `zone:change {zone: 'mossmere', prev: 'cove'}` → `run:start`, **no `run:start` without the glide in any run**, Murk moored on day 1 after the glide, `setout` and no `descend` in the audio log, the time budget (`FIRST_EVENING.budget`: card ≤ 50 s, lake ≤ 60 s), one line at a time and none in the strike window but `fe_strike`, no "%" outside the log, a byte-identical meta after a replay, and that 2,000 seeded tutorial strikes per class land at the log's figure ± 2 points (Small 91.9%, Keeper 90.5%).
