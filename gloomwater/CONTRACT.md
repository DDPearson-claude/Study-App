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
stems -> {nudge(x, z, k), points()} | null   // WC-3 (WATERCRAFT §5.4): the reeds' and lily pads' twitch on the Mossmere under the loop (WC-2's stems tell calls it; ≤ 4 points, the oldest replaced); null elsewhere
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
- **The show is a cinematic state** (§13.7b; it replaced the measuring ceremony): `ctx.cinematic = true` from `fishing:caught` (the end of the reveal, where `fishing.startShow` runs; `startCeremony` is its alias) until the card's turn. While it is set, main gives **survival and combat dt 0** (no phase clock, drains, enemies, director or swarm window progress) and fishing freezes its bite timers; actors, render, ui and audio get real dt. During an active swarm window every class plays the short variant after its reveal (`AUTOFISH.show.swarm`: 1.2 s in all, = `BALANCE.ceremony.cinematic.duringSwarm`). The catch card that follows is today's blocking modal. Main's valve releases a flag held past `AUTOFISH.show.valve` + 4 s; fishing's own valve opens the card at `AUTOFISH.show.valve` s from the fish breaking the surface. Space / Enter during the show go to `fishing.hurryShow()`.
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
state.meta.intro = { seen, skipped }                                      // §13.13: the opening cut scene has played (or was skipped); main writes it at intro:done; a replay writes nothing
state.meta.elderLog    = [ { name, speciesId, length, weight, z, ancient, place, zone, expedition, day, character, lost?: string } ]
state.meta.places[id] += { tally: { speciesId, length, weight } | null }               // the Tally Post record (v2 field extended)
state.meta.ledger      = { slots: [LedgerReq, LedgerReq, LedgerReq], refreshedOnDay, lastRealDate }
LedgerReq              = { id, templateId, text, zone?, place?, speciesId?, sizeClass?, n, progress, reward: {shells}, modes? }
state.meta.journal[speciesId] += { pbLength, pbWeight, pbZ, bestSetup: [{family, id, value}], seals: {prize, trophy, elder, ancient},
                                   oldLedger: bool, lastLengths: [cm ≤ 12], escape: {length, sizeClass} | null,
                                   mounted: {prize, trophy, elder}, released: {prize, trophy, elder},
                                   seen: bool /* Glimpsed: lost before it was ever landed; odds shown, no naming Memories */,
                                   gotAway: [{sizeClass, length /*±8% estimate, cm; told as a near weight*/, place, zone, day, reason}] /* last 5 */ }
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

**A fish's size on screen is its weight in pounds** (DESIGN §25.7.1 "Shown as weight"; `docs/v3/pounds/SPEC.md`). Internals stay kg and cm (`Fish.weight`, `journal.pbWeight`, `biggest`, the Elder Log's `weight`, a bounty's `kg`); **display**: `data.fishWeight(sp, fish)` (the weight of the fish's `length` with the species' `k`, rounded as a Fish's weight is; the stored kg only when no length is known, so a retune of `k` reaches old saves) → `data.fmtWeight(kg)` ("11 oz", "4 lb 6 oz", "212 lb"). v3 ui and v3 text never print `fish.weight`, kg, or a length as a fish's size; the one length shown is the catch card's `length` line (`data.fmtCm`, cm). Every v3 comparison of sizes the player can see uses `data.weightOz` (the ounces the card shows, exactly the figure `fmtWeight` prints: quarters under 1 oz, whole ounces to under 100 lb, whole pounds beyond; 0 for no weight): a heavy bounty (`b.targetOz`; one saved in kg by an older build takes `targetOz = weightOz(b.kg)` when its words are re-told), the Heavyweight (`params.lb × 16`), and a personal best. **A personal best is kept by `pbLength` and told by weight**: `progression.measure` moves the mark for any longer fish, but sends the `pb` record, `isRecord: true` and the summary's record line only when `weightOz` of the new fish is above `weightOz` of the old mark (a fish a hair longer that reads the same figure is no best; `ui-v3.recordLines` drops such a record too). A target is worded by `fmtWeight` ("over 1 lb 8 oz", "over 9 lb 0 oz", "over 33 lb 0 oz"), never in another form. Across species "biggest" is the heaviest by `fishWeight` (`run.stats.biggest`). Flag off, every one of these lines keeps its v1 arm (marked `// v1` in src; `tools/tests/pounds.test.mjs` scans for a kg figure outside one).

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
| `fish:measured` | `{speciesId, z, sizeClass, ancient, length, weight, favours, records: [{kind:'pb'\|'classFirst'\|'place'\|'oldLedger'\|'elderLog'\|'bestSetup'\|'resident', …}], name?, place, fish, cove: bool}` — fired **at the present of the show** (§13.7b; it was the seal stamp) by `progression.measure(fish)`; records are already written and saved; `fish:landed {measured: true}` follows at once and queues the card, which opens when the show's pause ends | progression (fishing calls `measure` at the stamp) → ui (banners), audio (bell), challenges, world (Tally Post), main (save) |
| `fish:marked` | `{uid, speciesId, nights}` (marked for home) / `fish:released-listless` `{uid, speciesId}` (the Live Well clock ran out) | progression → ui |
| `fish:escaped` | `{speciesId, sizeClass, z, approxLength, reason: 'snapped'\|'thrown'\|'spat'\|'spooled'\|'fouled'\|'staggered', place, x, zPos, markedFish: bool, name?, grade, legendary}` — **after** the loss and its 0.6 s quiet beat, every class (§13.7a); drives the got-away note (toast Small–Prize, card Trophy+). The payload is unchanged by pounds: `approxLength` stays a length in cm (±8%, rounded by `AUTOFISH.gotAway.round`), and the ui words it as a weight, `ui-af.nearWeight(D, species, approxLength)` = `data.fmtWeightNear(sizeWeight(species, cm), AUTOFISH.gotAway.roundLb)` ("near 9 lb"); allowed because the species is named here, after the loss. `markedFish` is true for an open-water Elder+ or, from P2, a Trophy+ at a place. Replaces `fish:escaped-big` (retired; its listeners filter on `sizeClass`). **On a trip (WATERCRAFT §7.2, WC-3) no screen consumes `fish:escaped`**: the payload stays on the bus unchanged for progression (the Marked giant, the legend's wound, Ashwick's comeback) and audio (the cause's sound, the sting); the HUD queues no note (`showGotAway` returns at once), progression-af writes no Glimpsed page, Got away list, Elder name or gear-log pin, and any other ui listener reads no payload (`tools/tests/loop-lost.test.mjs`) | fishing → ui (toast / card; the gear log pins it), progression (Marked Fish, Glimpsed page, Got away list, Elder name, legend wounds), challenges, audio |
| `tip:show` | `{id}` — a **directed tip** (D1′): the module that knows the moment emits it and ui shows the `TIPS` entry whose trigger is `tip:show:<id>`, once per save (`meta.seenTips`). `af_changed` (progression or the First Evening: a legacy save's first v3 bite), `af_letpass` (fishing: the first Prize+ tell), `af_hurry` (fishing: the first Small / Keeper play from the 2nd run), `af_strikeReminder` (the First Evening: the first lake bite after a fumbled tutorial strike) | fishing, progression, first-evening → ui |
| `mount:hang` | `{speciesId, z, frame, replaced: MountEntry\|null}` | progression → world (mount batch rebuild), ui, audio |
| `pond:add` / `pond:release` | `{speciesId, z}` | progression → actors (pond), ui |
| `resident:show` | `{place, zone, kind: 'boil'\|'pass'\|'leap', x, z, sizeClass, sizeZ}` (no species: a resident's name comes only from rumours and the Map Table; `leap` only if its species leaps) | fishing → audio, ui (edge marker); fishing-fx draws it as a night-ink proxy (a `leap` as a backlit proxy inside the pre-roll's +1 call) |
| `resident:landed` / `resident:roll` | `{place, zone, speciesId, z}` | progression → ui, world (Tally Post) |
| `farwater:dawn` | `{day, favour, murk, oilPrice, render, nightBurn}` | progression → ui (HUD gauge), survival, fishing |
| `condition:change` | `{zone, day, archetype, tomorrow}` (each calm start; `tomorrow` at dawn) | progression → world, water, fishing, audio, ui |
| `moonfall` | `{state: 'start'\|'end', place: 'ferry_market', reveal: ['bell_pool']}` | progression (owns the schedule: 25% and 70% of the calm, 20 s, 30 s in Moonmist; the Tuning Fork's extra one) → world (renders: shaft swing, `water.setClear`), fishing (sight fish), audio |
| `heron:lift` | `{x, z}` — WC-3 (WATERCRAFT §5.4): the Mossmere's heron lifts off (the raft within 8 m) or leaves at dark, from where it stood; under the loop only. No species, no odd (the heron changes nothing in the roll) | actors-heron (main) → audio (the croak) |
| `sign:spawn` / `sign:end` | `{id, kind: 'rise'\|'boil'\|'nervous'\|'strike'\|'bubbles'\|'glow', x, z, sizeClass?}` — informational (audio, tips, ui); fishing-fx draws signs and pre-rolled fish itself and asks water only for ripples and wakes (`addRipple` / `addWake`) | fishing → audio, ui |
| `sign:spawn` / `sign:show` / `sign:end` on the Mossmere under the loop (WC-2, WATERCRAFT §5–§6) | `sign:spawn {id, kind, form, x, z, sizeClass?}`: `kind` one of `'rise'` (forms `'sip'`, `'splash'`, `'roll'`), `'boil'` (`'swirl'`), `'nervous'` (`'ruffle'`, `'spray'`), `'strike'` (`'strike'`), `'bubbles'` (`'fizz'`), `'pinprick'`, `'cloud'`, `'stems'`, `'gas'` (the false tell), `'sight'` (a silhouette; `form` its outline: `'deep'`, `'torpedo'`, `'long'`, `'shoal'`, `'claw'`); never `'glow'` there. `sign:show {id, kind, x, z, form?, bolt?}` for a swirl, a strike, the gas, the cloud, the stems and a silhouette's bolt (`bolt: 'cast'\|'raft'\|'splash'`). `sign:end {id, kind, x, z}`. **No species, no size of a silhouette, no area** on the bus (a silhouette's fish stays hidden as a pre-roll's does). The cast's rule object (§14's watercraft subsection) carries `form`, `makers`, `tilt` (3 on the tells whose answer tilts their makers; 1 on a rise, a swirl and a silhouette), `waitMult` (0.5 a rise, 0.65 every other obeyed tell, 1.5 a silhouette's spook), `respond` (the water's answer: `'rise'`, `'splash'`, `'bow'`, `'ruffle'`, `'spray'`, `'fizz'`, `'pinprick'`, `'cloud'`, `'stems'`, `'take'`), and for a silhouette `preroll: {chance: 0.45}`, `takeWaitMult: 0.3`, `lead: 'lead'\|'still'`; `predators`/`bottom` are the flag-off game's only | fishing → audio, ui |
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
| `fishing:show` | `{phase: 'lift' \| 'hold' \| 'pause' \| 'card', cls, pose, …}` — the show's beats (§13.7b), each once per fish, in order: `lift` at `fishing:caught` `{cls, pose, dur: {lift, hold, pause}, sizeClass, ancient, legendary, speciesId, length}`; `hold` at the present, right after `fish:measured` and `fish:landed` `{isNew, records}`; `pause`; `card` `{origin: {x, y}}` (CSS px of the held fish's centre: the card unfolds from it) | fishing → ui (the clean frame, the card's turn and origin), audio (the haul, the flourish), first-evening |
| `show:beat` | `{kind: 'take' \| 'present' \| 'flap' \| 'settle' \| 'drip', strength 0..1, cls}` — the Wick's and the fish's own beats inside the show, for sound | actors → audio |
| `ui:screen` | `{id: 'journal'\|'gear'\|'shop'\|…, open: bool}` (AF + FE) — a screen opened or closed | ui → first-evening (the odds step), tips |
| `fish:action` | `{action: 'keep'\|'eat'\|'render'\|'release'\|'mark', speciesId}` (kept from v1; FE uses card close = `release` in the cove) | ui → progression, first-evening |
| `journal:seen` | `{speciesId}` — a lost species not yet named gets its Glimpsed page | progression → ui |
| `fishing:found` | `{findId, waterKey, uid, kind, grade, entry}` — **M1 step 5c** (the loop only, `docs/loop/FINDS.md` §12): a snag's find broke the surface. It is emitted **in place of** `fishing:caught` (no `progression.makeFish`, no `fish:measured`, no `fish:landed`, no measure, no class-length wipe, no Journal entry, record, class seal or print); its bite was `fishing:bite {sizeClass: 'find', biteTell: 'sinkUnder', waterKey}` (counted as any bite; no class estimate on the HUD) and every play event of it carries `sizeClass: 'find'`. `entry` is the hold entry the find card offers (`loop.noteFound`'s); the show follows (`fishing:show {…, find}`), then the card at `fishing:show {phase: 'card', uid}` (with no show, at once). **`restored: true`** (from `progression.restorePendingTrip` on Continue, a microtask after `run:start`): the find whose card was open when the page closed (`run.flags.pendingFind`, saved by `noteFound` until Keep or Let go), offered again on its card with no show and no glint; its bite stays spent until the card is answered | fishing → ui (the find card, `ui-finds.js`), audio; progression → ui (restored) |
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
**The catch hand-off:** fishing calls `makeFish(…)` when the fish is landed and holds the returned Fish → `fishing:caught {fish, …}` (informational; progression writes nothing on it) → `fishing.startShow(fish)` (the show, §13.7b) → at the present fishing calls `progression.measure(fish)` → `fish:measured` → `fish:landed {measured: true}` → the pause → ui opens the card (Keep / Eat / Render / Mark for home in expeditions; Release only in the cove) → main saves on `fish:measured`. Owns the expedition tally, Far Water day state, the Live Well clock (decrements at each dawn, releases with `fish:released-listless`), residents (re-roll on the next Set Out after a landing, or after 3 in-lake days), Marked Fish, pressure (−0.12 per catch, floor −0.6, reset at dawn), rumours and today's rumour (seeded by the real date), conditions (seeded by expedition, day and lake), Murk's in-lake days (1, 2, 3, then odd days), the oil price and the crossing tally rule. Banks discoveries instantly (Memories) and the tally on return.

**fishing**
```
view += { favour: {mu, notches, terms: [{family, id, value}], quiet: bool},     // notches 0–5 (favourNotches)
          sizeClass: null|'small'|'keeper'|'prize'|'trophy'|'elder',           // null until the first breach (Prize+) or the landing
          ancient: bool,                                                       // pips are cut (AF)
          speciesId: null, rarity: null,                                       // null from the cast until the reveal (§13.7a); legends exempt (view.legendary)
          strike: null|'clean'|'struck'|'early'|'late',
          play: {t, dur, phase, k /*presentation progress 0–1*/, line /*presentation tension 0–1*/, bend, glimpse: bool, leap: bool}|null,   // AF; class and z only
          biteTell: null|'doublePop'|'plunge'|'dragUnder'|'flatSlide'|'dome',
          measure: null,                                                       // the measuring overlay is retired (§13.7b): always null on the v3 path
          show: {phase: 'reveal'|'lift'|'hold'|'pause'|'card', cls, pose, t, poseT, dur, hurried, protected, swarm, sizeClass, ancient,
                 legendary, speciesId /* from 'lift' */, length /* cm, from 'lift' */, uid}|null,   // §13.7b: T0 → the card's close
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
startShow(fish, opts) -> Promise                            // §13.7b: sets ctx.cinematic; lift → the present (calls progression.measure) → hold → pause → card
hurryShow() -> bool ; inShow (getter)                       // a tap's hurry (§13.7b). startCeremony / skipCeremony / inCeremony stay as aliases
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
setShowTarget({cls, pose?, length (m), landmark?, position?, place?} | null)              // §13.7b: the show camera, from T0; null at the card (the framing holds behind it)
```
The show camera (§13.7b) fits the named points of `actors.getShowFocus()` inside the frame at the pose's fov and elevation (`AUTOFISH.show.camera`), on the play's yaw (with the trophy's landmark swing), from the first frame of the reveal; `setTrophyTarget` and the trophy rule below stay as its fallback. While the card is up the framing holds (`camera.behindCard`): an upright screen lifts the subject into the open top (`portraitUp`); a wide one fits it into the left of the frame, the right `landscapeSide` of the width kept clear for the docked card (ui adds `gw-cc-side` to the card's panel on a show's card when the viewport is wider than 1.2 × its height). `getShowFocus().keep` also carries `body` (the Wick's cloak either side of its feet and shoulders: a row that lists it never cuts the Wick). A row may name `tinyElev` (the lens's elevation for a pinch under `grip.pinch.tinyBelow`), `lowElev` / `lowAbove` (a lens that comes down when the flame stands more than `lowAbove` m over the catch) and `marginPortrait`. The way back (`camera.out`, `outPerM`) runs at an even rate of zoom (`render-camera.showOutEase`). `FishVisual` (models) gains `setShown(k)` (the show's exposure: the light on the skin under a knee, the fins lit through; 0 restores) and `setBend({…, side: [hinge, arc, angle]})` (the tail hangs sideways); `fx.glory(…, {lake})` thins the billboard where it meets the water.
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
setPose(name) += 'showPinch' | 'showBoth' | 'showHug' | 'showHang' | 'showAlongside'      // the show's poses (§13.7b; AUTOFISH.show.poseNames)
showFish(fishVisual, {cls, pose?, sizeClass, ancient, legend, beats: {lift, hold, pause}, special}) -> {pose, id, hands, side} | null
setShowTime(t) ; getShowFocus(out?) -> {pose, id, t, lift, fish, head, feet, hands, rodTip, keep, center, radius} | null
endShow({action?}) ; showPose (getter)                      // §13.7b has the shapes; showCatch(null) still means endShow()
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

**ui** — pounds (`docs/v3/pounds/SPEC.md`): `ui-v3.js` re-exports `fmtWeight`, `fishWeight` and `fmtCm` from data and adds `weightCount(w, W)` (the catch card's count toward the final weight W kg: ounces, then pounds and ounces; a final of 100 lb or more counts in whole pounds from "0 lb"; lands exactly on `fmtWeight(W)`) `weightSizer(W)` (the longest figure that count shows, by characters), `weightSizers(W)` (the figures that size the hero's box, the final first: with it "(P − 1) lb 15 oz" for a pounds-and-ounces final, and the quarter figures a final under a pound passes) and `weightHtml(text)` (a printed weight as markup, each unit in `<i class="gw-u">`: the stylesheet sets the units in the body face, because the hand's "lb" reads "eb"; used by the hero, the handwritten note and a full card's creel rows); `recordLines(D, {records, isNew, species, length, weight, max})` words a personal best in weight ("New best: 4 lb 6 oz (was 3 lb 12 oz)", sub "10 oz past your old mark": the difference of the two figures as they read) and returns no line for a `pb` record whose two figures read the same. `ui-af.js` adds `nearWeight(D, species, cm)` and `WEIGHT_RE`; `gotAwayNote(D, p, {speciesName, placeName, species})` and `oddsView(D, res, {…, species})` word a size as a near weight; `leakScan(text, {allowWeight: false})` also flags a weight (a weight is `k·L³`: shown while a line is out it would name the body). `K` (ui.js's kit) carries `fmtWeight` and `fishWeight` beside the v1 `fmtKg`. The card's markup: `<b class="gw-cc-hero[ gw-cc-hero--long]" aria-label="{weight}"><i class="gw-cc-hero-sizer" aria-hidden="true"><i>{sizer}</i>…</i><i class="gw-cc-hero-n">{weightHtml(weight)}</i></b>` (the sizer's figures are laid one over another, hidden, so the box is as wide as the widest; the live figure lies over the sizer, out of the flow: a figure with other digits may run a pixel or two past the box, over nothing; `.gw-cc-hero-n`'s `textContent` is the plain figure) and `.gw-cc-len` holds the length line. The Journal's Weight fact is `<span class="gw-facts-range">{min} – {top}</span>` and, when the ceiling is above the top, `<small class="gw-facts-sub">said to reach {reach}</small>` (`data.weightSpan`, `TEXT_V3.saidToReach`).
```
showTitle() (boot overlay: Begin | Continue | Settings over the cove)
showSetOut() / openTackle() (the gear log: progression.getGearLog) / showHomecoming(summary) / showSnuffed(summary) / showGotAway(fish:escaped payload)
  (Small / Keeper: a one-line toast; Prize+: the card with the "Odds in your log" link; replaces showNearMiss) / openMount(speciesId) / openPond()
openLog({speciesId, section: 'odds'|'field'|…}) (the Journal's Your odds block from progression.getOdds; refused while a line is out: AUTOFISH.logLock)
automatic fishing (AF): no reel bar; the strike word under the float and the strike ring (meta.settings.strikeRing); the class estimate on the first Prize+ glimpse;
  the card's "Strike: …" line; the Set Out rating in words; a "%" only inside the Journal and the gear log; nothing names the hooked species before the reveal
(showMeasure, the measuring overlay, is retired by the show, §13.7b: nothing is drawn over the picture from the fish breaking the surface to the card;
  the HUD is hidden and toasts, tips and banners are held while fishing.view.show is up; the card opens when view.show.phase is 'card', unfolding from
  fishing:show's origin, its length counting up, its stamp pressing, your best and the Old Ledger as two knots on its ruler) ; catch card += favours, banked Boon pick; Mark for home (nights) from P3 (in P1–P2 nothing is marked:
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

**Phases** (`fishing.state` names kept): `idle → charging → casting → waiting → bite → reeling (the play) → landing (the reveal and the show, §13.7b) | lost (the quiet beat, then the note) → idle`.

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

### 13.7b The show: the Wick presents its catch (binding; DESIGN §25.6.8, `docs/v3/show/SPEC.md`)

The user (2026-11-13): "When a fish is caught, it should be an animation of our character holding the fish and showing it to us. Then after a pause the fish card opens up." The show replaces the measuring ceremony's poses, cord and overlay on the automatic-fishing path. Every number is in `AUTOFISH.show`; `data.showPlan(cls, {swarm, hurried, protected})`, `data.showPoseFor(lengthM, {sizeClass, ancient, legend, shape})`, `data.showClassOf(fish)` and `data.showRevealSeconds(cls)` are the one place the clock and the pose are decided.

**Phases** (`fishing.view.show.phase`; T0 = `fishing.state` becomes `landing`): `reveal` (T0 → `fishing:caught`; `AUTOFISH.landing`'s wipe, on the game's clock) → `lift` (the swing-in, the turn to the lens, the present) → `hold` → `pause` (≥ `show.minPause` 0.6 s) → `card`. T0 → card: 2.0 / 2.1 / 3.0 / 3.5 / 4.97 / 5.26 s (small … ancient; a legend plays the ancient row); in a swarm window the reveal + 1.2 s.

**Order, once per fish:** `fishing:landing` → `fishing:caught` → `fishing:show {lift}` → `fish:measured` → `fish:landed {measured: true}` → `fishing:show {hold}` → `fishing:show {pause}` → `fishing:show {card}` → the card (`ui:modal`). `progression.measure` is called at **the present** (pose time = the lift's length), never later than the valve; main saves on `fish:measured`. `ctx.cinematic`: `fishing:caught` → the card's turn. A reset, a run's end or a zone change mid-show measures the fish if it was not (once), clears `ctx.cinematic`, releases the camera and the Wick, and opens no card.

**Hurry:** a tap (pointer, Space, Enter) from T0 on: the reveal is never cut; the rest of the lift runs × `hurry.liftRate`; the card opens once the fish has been presented for `hurry.hold` s, or `hurry.protectedHold` s (0.8) when `fish:landed.isNew` or a `pb` record came back from `measure`. **Valve:** `show.valve` s of the real clock from T0.

**The clean frame:** from T0 until the card nothing of the UI is drawn over the picture (no overlay, HUD, toast, tip, banner or hint); `ui.showMeasure` is not called and `view.measure` is null.

**actors** (the Wick and the fish):
```
showFish(fishVisual, {cls, pose?, sizeClass, ancient, legend, beats: {lift, hold, pause}, special}) -> {pose, id, hands: 1|2, side: ±1} | null
    // once, at fishing:caught. cls = data.showClassOf; pose id defaults to data.showPoseFor(fishVisual.length, …); beats = data.showPlan's
    // (the swarm row in a window). Pose time 0 = the start of the lift. Actors takes the fish from where fishing left it (world space,
    // true size) and owns its transform until endShow; fishing owns and disposes the FishVisual.
setShowTime(t)       // pose time (s since showFish), every frame of the show from fishing (faster when hurried); never runs back; a frame
                     // without a call advances by actors' own dt
getShowFocus(out?) -> null | {pose, id, t, lift /*0..1*/, fish: {center, axis /*tail → snout*/, up, length, depth}, head: {center, radius, flame /*its core*/},
                              feet, hands: [right, left], rodTip | null,
                              keep: {fish: [snout, tail, back, belly], head: [4], flame: [1], hands: [..], feet: [1], rodTip: [1] | []},
                              center, radius}
    // world space (THREE.Vector3). From the lift's first frame it is the SETTLED layout (where each point will be at the present), steady
    // to 6 cm through lift, hold and pause, so the camera eases to a still target. getMeasureFocus() returns its center / radius meanwhile.
endShow({action?: 'keep'|'eat'|'render'|'release'})     // the fish leaves the hands (≤ 0.6 s), the Wick returns to play; showCatch(null) = endShow()
showPose (getter) -> 'showPinch' | 'showBoth' | 'showHug' | 'showHang' | 'showAlongside' | null
emits show:beat {kind, strength, cls}
```
The Wick faces the lens from `env.camYaw` (the world yaw from the Wick to `ctx.render.camera`, computed by actors each frame; null without a camera) and reads `env.show {pose, t, lift, hold, pause, cls, life, lenB, depthB, shape, special, side}`; both are internal to actors. The fish shows its flank to the lens (a ray its back) at true size; nothing is held above the Wick's head.

**fishing** (the sequence): `view.show` (above), `startShow` / `hurryShow` / `inShow`, the events above; at T0 `render.setShowTarget({cls, length})`; at `fishing:caught` `ctx.cinematic = true`, `actors.showFish`, `setLine(false)`; every frame `actors.setShowTime(poseT)`; at the present `progression.measure`, then the landing's climax (`fishing-fx` glory on the show focus, `render.pulse` / `kick`, `actors.flareFlame`, the haptic); at the card `ctx.cinematic = false`, `render.setShowTarget(null)`; on `fish:action` (or the card's close) `actors.endShow({action})`, the model disposed 0.6 s later, `view.show = null`. Without `actors.showFish` (a fake, an older build) the Wick gets the plain catch hold (`setPose('catch')` + `showCatch`) and render the trophy shot of `getMeasureFocus`; no measuring pose stands in. `fishing:show` also carries `swarm, hurried, uid, protected, special, t`, and its `card` phase `origin {x, y}` (CSS px).

**render** (the camera): `setShowTarget(t, opts)` (above; it returns `{yaw}` and takes `(null, {abort: true})`). One rig with the play's (no cut, no new pass): the fitted pose is blended over the play's rig by **one eased weight timed from `fishing.view.show`, arriving exactly at the present** (whatever the class, a hurry or a swarm window; `show.camera.settle` / `settleSwarm` are only the validator's floor); it fits the `keep` names of `show.camera.pose[pose]`, plus the fish box's corners (`finRoom`) and the flame's tip (`flameTip`, or the row's own; none for a tiny pinch), inside the safe area (`margin`, a row's `headroom` / `footroom`), never nearer than `minLens`; an alongside fish is framed by what stands above the lake (its kept points clamped to the surface, no box corners); `fovPortrait` upright, with the rake for an alongside fish over `rakeAbove` m; a far jump of the target moves the lens at no more than `maxSpeed` m/s at its peak; the target freezes `settleBefore` s before the pause and rides the Wick's feet on the swell (still against the Wick, < `still` of its distance per second); holds behind the card; eases out over `out` s (or `outPerM` s a metre) when the card closes.

**Debug** (only when `core.debugEnabled()`): `ctx.debug.show()` → the show's state, `ctx.debug.showRate(k)` (its clock; `cerRate` is its alias; `ceremony()` keeps answering for older scenarios), `ctx.debug.showPose({speciesId, z, lengthCm?, cls?, pose?, character?, heading?, t, beats?, special?, from?})`, `showPoseTime(t)`, `showPoseEnd({action})`, `showPoseInfo()` (the S5 / S6 numbers), `showPoseHull()` (the bent fish's hull), `showFocus()` and `wickJoints()` (actors: the pose viewer); `ctx.debug.showSwarm(on)` and `instantCatch(id, {z, show: true})` (fishing).

**ui ↔ audio** (the card): `card:count {dur}` as the weight counts up (the cord's ticks; the count is driven by the length, `cm = L·e(k)`, exactly as before, so the bead, the knots and the ticks are unchanged, and the hero shows the weight of that length, `W·(cm / L)³`, through `ui-v3.weightCount`) and `card:stamp {records, isNew, seal}` as the class stamp presses (the seal).

### 13.8 Data schema (v3) and the data-exports table

**Applied to the v1 / v2 tables when `V3_ENABLED` is on**, by `V3_PHASE` (§13.0's table; data owns the patch; consumers read the patched tables):
```js
SPECIES[] += { size: {L50 /*cm*/, sigma, body, k /*g/cm³ = BALANCE.size.k[body]: minnow perch crayfish carp koi pike eel angler ray puffer jelly ghost sturgeon + trout gar greateel swampeel (a key is a plain family or build word, never a real species' own name)*/} | legends {L50, W50 /*kg, authored from a real cousin*/, sigma: 0.02} | Pilgrim Salmon {L50: {zoneId: cm}},
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
| `BALANCE.ceremony` | beats, poses, wick height, trophy camera, mm below 20 cm (the near-miss card's config is retired: `AUTOFISH.gotAway`). Since the show (§13.7b) only legacy paths read its beats and poses; `cinematic.duringSwarm` and `wickHeight` stay live; `mmBelow` is read by `ui-v3.fmtLength` only, which no player-facing line calls since pounds | §5.8 | P1 | fishing, actors, render, ui | in data |
| `AUTOFISH.show` · `showPlan` · `showPoseFor` · `showClassOf` · `showRevealSeconds` · `SHOW_CLASSES` | the show (§13.7b): phases, per-class beats, `about` / `max`, the swarm row, the hurry, the valve, the pose ladder by length with its class and shape rules, grips, facing, life, the camera, the card, the sounds; the pure helpers both lanes call | the user, 2026-11-13 | P1 | fishing, actors, render, ui, audio, tools | in data |
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
| helpers `sizeL50`, `sizeLength`, `sizeWeight`, `sizeClassOf`, `isAncient`, `maxZFor`, `reachOf`, `favourNotches`, `classOdds`, `fishValueV3`, `fishYieldV3`, `farWaterFor`, `swarmTonight`, `swarmWindow`, `tallyFor`, `frameFor`; **the weight the player reads**: `LB_PER_KG`, `OZ_PER_KG`, `fmtWeight(kg, {nbsp})`, `weightOz(kg)`, `fishWeight(sp, fish)`, `fmtWeightNear(kg, steps)`, `weightTarget(kg, capKg)` → `{oz, kg, text}` (a round unit, never above the cap, `text` = `fmtWeight` of the target), `weightSpan(sp)` → `{min, top, reach}` (kg: a species' smallest, a top Trophy at `size.elsewhereMaxZ` and its ceiling; the Journal's Weight fact), `fmtCm(cm)` | pure functions (lengths in cm, weights in kg; the pounds helpers are flag-free plain exports outside the v1 fingerprint's name list, and nothing in v1 calls them). `fmtWeight` rounds once to whole ounces (quarters under 1 oz, never below ¼) and then picks the band: "¼ oz" … "15 oz" · "1 lb 0 oz" … "99 lb 15 oz" · "100 lb" … "7,055 lb"; "—" for no weight; never "16 oz", "1 lb 16 oz" or "100 lb 0 oz". Other pounds data: `AUTOFISH.gotAway.roundLb` (the near steps), `AUTOFISH.text.size` / `.log.marked` take `{size}`, `TEXT_V3.newBest` takes `{w}` and `{was}`, `TEXT_V3.saidToReach` takes `{w}`, the heavy bounty's text takes `{w}` and stores `b.targetOz`, `heavy_catch.params.lb` (18 in P1–2, 33 from P3; no `kg`; its `desc` words the target as `fmtWeight` does, "over 18 lb 0 oz"), `BALANCE.records.elderLog` leads with `weight`; `swarmWindow(mode, night, outing)` returns `[k0, k1]` or null; `fishYieldV3` applies `size.yield.factor` 0.784; `frameFor` returns `{id, width, height, reach, view}` (Wanderers from their largest reach) | §3.4, §4.1, §5.1, §6.1–§6.2, §3.7.3 | P1–P3 | fishing, progression, combat, ui, models, tools | in data |
| `CATCH_V3` | the catch model (DESIGN §25.6.5): `scale`, `floor`, `cap` per class (all < 1), `wick`, Fight terms (`lake`, `rarity`, `style`, `headline`, `kept`, `fouled` / `fouledSpecies`, `class`, `elderStep`, `elderRarity`), `emphasis` per style (×1.6 / ×0.7 / ×0.7), `strike` (clean / struck / early / late), `items` (every bait and lure: Hold and whom it helps: `attract`, `all`, `night`, `family` or `species`; `lure_glimmer` an upgrade term), `buffs` (cap +6, `relicCap` 3, `runCap` 4), `markedFish`, `legend` (Fight, `fightRun` for per-run gear, style, wounds and `woundScope`, growth), `gloomtide`, `economy.norm` (fish XP: combat), `display` (owned relics in the log), `targets` (incl. `relicHoldByTier`, `levelGain`, `perRunSwallower`, `noviceCleanSmall`, `deepHeadlineT4Item`) | 2026-11-05 | AF (`V3_PHASE` 1) | fishing (the roll), progression (the logs, the rating), ui, tools | in data |
| `AUTOFISH` | automatic fishing's presentation and rules: `strike` (class windows, Clean part ≥ 0.3 s, grace, `lastDip`, `latencyComp`, `priority`, the reaction model, ring, haptics), `play` (per class: durations, runs, surges, glimpses, last stands, tow, bend, shake, music; `tackle`, `scare`, `placeBeats`; `inputs` {pan, hurry, endsEarly: false}: no cut; `anchor` {states, modes, hub, moveInput 'ignored', combatMoves false, towOnly, gloomtide}), `legendPlays`, `leap` (class `count` table, one `when` window, the proxy silhouette) / `leaps` (per species: one chance) / `leapRule` (by class) / `biteRule` (with `accepted`) / `signRule`, `loss` (windows ≥ 0.5, causes by style and class, `onLeap`, `onScare`, the draw order, hints), `proxy` (the class-length ladder, `lakeMult`, `zStretch`), `revealWipe`, `letPass`, `gotAway` (toasts to Prize, `markedFrom`), `rating` (words), `logLock` / `logLockRoutes`, `ceremony` (cord knots), `runLures`, `quality`, `text`, `time`, `player` (incl. `hurry`) | 2026-11-05 | AF | fishing, fishing-fx, actors, render, audio, ui, tools | in data |
| `FIRST_EVENING` | the opening and tutorial (DESIGN §25.4.8): `shipsWith: 'AF'`, steps and their times (`stepSec`, `stepAnim`, `stepMurk`: each step fits its Murk line), budget (card ≤ 50 s, lake ≤ 60 s), the Lantern Line's shots, line timings, the ember (z −34), the wake, the wait tip on the settled float, bite timings, the tutorial API (accepts / rejects), strike ring and estimate, odds (glow until opened), gate (the cove's closure), Set Out (auto-sail + glide), `everyRun` (the glide and Murk lines for every later run), `snuffed` (the hearth), resume, skip, legacy (the idempotent step and the offer ribbon), replay (writes nothing), tips marked seen, First Light, every string | 2026-11-05 | FE (`V3_PHASE` 1) | first-evening, ui, render, actors, player, fishing, progression, audio, tools | in data |
| `INTRO` | the opening cut scene (DESIGN §25.4.9, §13.13; `docs/v3/intro/SPEC.md`): `length` 18 (validated 15–20), `beats` (contiguous), `text` (≤ 4 lines of ≤ 60 characters), `words.band`, `veil`, `swapAt`, `cut` (the frozen block); `cameras` (takes of keys in [anchor, east, up, south] metres, `portrait` values, the last take's blend into render's sail rig) and `set` (the lantern, the windows, the fall, the dark below, the Wick's kindling, colours, the budget) for lane A; `lines` (timings), `skip`, `clock`, `stills`, `sound`, `trigger`, `handoff`, `cove` for lane B. Always exported, read only by the v3 build | 2026-11-13 | the opening cut scene (`V3_PHASE` 1) | intro, intro-stage, ui-intro, main, render, world, actors, audio, tools | in data |
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
- **Pounds** (`docs/v3/pounds/SPEC.md` §7): `tools/tests/pounds.test.mjs` (the formatter's table word for word, its bands and carries over 0.1 g to 500 kg, the near steps, bounty targets, the card's count for every species at every class top against its sizer, the retune's anchors, no kg / `{cm} cm` / `{len}` in any v3 table at phases 1, 3 and 4, the v1 tables against the fingerprint, and a static scan: every line of `src/` that prints or asks for kg is a kept v1 arm marked `// v1`); validate-data's v3 pass repeats the table, the anchors (a 61 cm carp 8 lb 0 oz, a 112 cm pike 23 lb 4 oz, a 90 cm eel 3 lb 9 oz, every legend 200 lb or more) and the text scan, and checks `heavy_catch.params.lb` per phase; `progression-v3.test.mjs` (a PB told in weight, the run's biggest by weight, a heavy bounty's words / `targetOz` / cap and its check an ounce either side, an old kg bounty re-told, the Heavyweight at 18 and 33 lb, and flag off the v1 kg words); the hidden-information scans count a weight as a leak (`ui-af.leakScan`, `af-ui.scenario.mjs`); `tools/tests/pounds-shots.scenario.mjs` captures the card (a perch, a small minnow, a trophy carp) on a desktop and a phone and checks the hero, the length line, the count and the layout in the DOM. The catch, clams and roster sims read no weight: their output is unchanged by a retune of `k`.
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

### 13.13 The opening cut scene: the lane seam, state, events and hooks (DESIGN §25.4.9)

"One Warm Light": 18 s, skippable, once on a fresh save's first new game, ending inside the first run. **Built and staged** (both lanes merged). The binding build document is `docs/v3/intro/SPEC.md` (storyboard, set list, cameras, rules, acceptance, the scope-cut ladder; its §12 is the as-built record); this section is the API as built. Data: `INTRO` (always exported, inert until `V3_ENABLED`; three marked blocks: `shared` frozen, `LANE A`, `LANE B`). With `V3_ENABLED` off `ctx.intro` is null and nothing here runs. Two lanes build it at the same time: **lane A "set and picture"** (everything drawn in 3D) and **lane B "director and flow"** (time, words, sound, input, the title and the hand-off).

**State** (main writes it at the hand-off; added lazily, `core.defaultMeta()` untouched; never read with the flag off):
```js
state.meta.intro = { seen: bool, skipped: bool }     // set at intro:done of a non-replay; a replay writes nothing
ctx.flow = 'intro'                                   // new flow value while the film plays: no run, gameDt 0, ctx.cinematic held true
```

**The stage** (`src/intro-stage.js`, lane A; a pure function of timeline time):
```
createIntroStage(ctx) -> {
  prebuild() -> bool                     // ONE slice of building per call (the models, one warm-up per part, then the lake's own arena, world-art's `arena:<zone id>`, so nothing of the world first seen by the film's lens compiles under it: 10 slices on medium / high, 9 on low);
                                         //   true once everything is ready; nothing visible; false (no throw) while the world has no anchors yet.
                                         //   The fresh title calls it in idle time until it returns true
  ready -> bool
  enter({replay, reduced}) -> void       // the set goes live (builds at once whatever prebuild left); idempotent. The director calls it under the opening's full ink
  setTime(t, {live, seek, reduced, calm})// EVERYTHING it draws, and the camera, at timeline time t (0 … INTRO.length); before enter() and before INTRO.swapAt: nothing.
                                         //   live: a played frame (the lake's one splash at the contact); seek: the moment was jumped to (render's rig is snapped too);
                                         //   reduced (reduced motion) or calm (reduced flashing): the contact flash quartered, the cut a 0.3 s dip.
                                         //   At the first call past swapAt it re-reads the world's anchors and rebuilds if the lake changed (a replay from another lake's title)
  exit() -> void                         // gives back the camera, the mood, the water light, the Wick's kindling; idempotent; never throws
  dispose() -> void                      // exit() + frees every geometry and material it created (it owns no texture); reusable afterwards
  stats() -> {built, live, t, take, w, anchors, calls, triangles, geometries, textures, lights, steps: [done, of], buildMs, tier}
}
introCamera(INTRO, t, aspect) -> null | {take, pos: [anchor, x, y, z], look: [...], fov, w, rig}    // pure; anchors 'S' (the spawn) and 'G' (the Sunken Gate)
```
The stage never reads a clock, listens for input, touches the DOM, plays a sound, writes state or emits on the bus; it creates no light, no shadow map, no render target and no texture. Its own cost: ≤ 30 draw calls and ≤ 10,000 triangles in any frame, all passes (`INTRO.set.budget`); measured peak 17 calls (9 on low) and 4,880 triangles.

**The director** (`src/intro.js`, lane B; `ctx.intro`, created by main when `data.V3_ENABLED && data.INTRO`):
```
pending() -> bool                        // would the title's primary button play it now? v3, a fresh save (meta.runs === 0, !meta.intro.seen), no run waiting,
                                         //   and in a debug build only after an opt-in (GW_INTRO === true, ?intro=1, debug.intro('auto', true))
prewarm() -> bool                        // one stage.prebuild() slice; true once the stage is ready (main's game.prewarmIntro() repeats it in idle time)
start({replay = false, reduced, underInk}) -> bool   // from t = 0 (a replay writes nothing to the save). `underInk` (main's): called once under the opening's
                                         //   full ink, before stage.enter(): the film's lake and grade go on there. With it the stage is never entered at the press
skip() -> bool                           // honoured after INTRO.skip.guard (0.5 s), once; never on a held (sought) film
update(realDt) -> void                   // main, once a frame, BEFORE the module loop; real elapsed time clamped to INTRO.clock.maxDt, paused while hidden, a 25 s valve
seek(t) -> state                         // debug / tests: hold the clock at t and show exactly that moment (starts a replay if idle)
resume() -> state                        // let a held film run on
stop() -> void                           // hard abort, no event (toTitle, wipeAll)
isActive() -> bool;  setOptIn(on);  stage
state -> {phase: 'idle'|'playing', t, wall, beat, line, replay, reduced, calm, skipped, hold, optIn, failed, entered, skip: null | {mode, k, w}}
```
Pure helpers (exported, tested): `beatAt`, `lineAt`, `veilAt`, `stillAt`, `stepClock`, `introPending`, `introOptIn`, `skipModeAt`, `skipWordAt`, `skipAllowed`, `cutDipAt`, `stillDipAt`, `inkFullAt`, `introSeen`, `markIntroSeen`, `replayOffered`, `soundEvents`, `soundEventsBetween`.

**How the director drives the stage:** `prebuild()` slices under the fresh title only; nothing at the press; `setTime(t, …)` every frame from the first (a no-op until entered); one frame after the opening ink was painted full (t 0.37–0.5, at the latest 0.6): main's `underInk` hook, then, if the stage is not built yet (Begin pressed before the idle slices finished, or a replay), the rest of `prebuild()` ONE slice a frame with the film's clock held at the full ink (at most 48 frames), then `enter()`, then that frame's `setTime`; every played frame `setTime(t, {live: true, reduced, calm})` with t never decreasing (under reduced motion t is the beat's still, and the film's last call is `setTime(INTRO.length)`); `setTime(t, {seek: true})` on debug seeks, a veil skip's jump and the valve; `dispose()` before `intro:done` is emitted, on `stop()` and on any error.

**Events** (the director emits; lane B's view, audio and main listen; the stage listens to none):

| event | payload | notes |
|---|---|---|
| `intro:start` | `{replay, reduced, calm}` | the view shows; audio fades the title music in ≤ 0.3 s and starts the cue |
| `intro:beat` | `{id, i, prev, t}` | `lit` → `fall` → `below` → `wick` → `home`; emitted **before** the stage shows the new beat (under reduced motion the view copies the outgoing picture for its cross-fade). The cue is played by the film's clock crossing its marks (`soundEvents`), not by this event |
| `intro:line` | `{i, text, at, out}` \| `{i: null}` | one line at a time; the view fades it by the film's clock (`lineAt(t).k`) and announces it once |
| `intro:skip` | `{t, mode: 'veil' \| 'finish'}` | `veil` in lit / fall / below (ink 0.25 s, jump to the end, ink off 0.35 s); `finish` in wick / home (the rest plays out in 0.5 s) |
| `intro:done` | `{skipped, replay, t, error, mode}` | exactly once per `start`; `mode`: the skip's (`'veil'` \| `'finish'`) or null; main hands over (it listens last, after every module) |

**Order at the hand-off** (not a replay; today, `world.SUPPORTS_COVE` false): `intro:done` → main sets `meta.intro = {seen: true, skipped}` and calls `game.startNewRun({character: 'wick', nightMode: 'still', __intro: true})` → `flow:change {flow: 'playing', prev: 'intro'}` → `zone:change {zone: 'mossmere', prev: null, intro: true}` → `run:start {continued: false}` → the save. `zone:change {intro: true}` means "this lake is already on screen": render applies no zone defaults and no black fade, the world's `setZone` returns early (same zone), audio plays no sting. A replay ends with `flow:change {flow: 'title'}` and `ui.showTitle()`; no `zone:change`, no save. An error inside the film ends through the same `intro:done` with `{error: true}` and the same hand-off. **When the cove ships** the same `intro:done` starts the First Evening at step `wake` (its `framing` step is not played and `INTRO.text` replaces `FIRST_EVENING.text.lore`).

**Hooks in other modules** (additive, inside `// >>> INTRO LANE A|B` … `// <<<` blocks; inert unless the film calls them):
- **render** (lane A): `setIntroCamera({pos: [x, y, z], look: [x, y, z], fov, w} | null)`: the pose is laid over the rig's own with weight `w` (1 = the pose exactly, no sway or roll; 0 = the rig) and **the rig is held in `sail`** while a pose is set, whatever the flow, so the film's last move settles into the play camera and nothing changes when the run starts. **The film's lens wins over the show's** (§13.7b): the pose is laid over the rig *and* over a show's fitted lens (place, look point and fov alike), so at `w` 1 the camera is the film's whatever weight a show still has; a show cannot begin under the film (flow `intro` has no run) and render lets a show's target go outside `playing` / `hub`, so its weight eases out under the film and none is left when the film ends. `getIntroCamera()`.
- **render** (lane A, added): `warmPrograms(object3d) -> bool`: compiles an object's programs inside the frame's own HDR target with the scene's lights and fog, without drawing it (three's `renderer.compile`); the stage calls it once per part of the set, so nothing is compiled once the film runs.
- **world** (lane A): `getHeroAnchor() -> {x, z, face, theme, zone}` (the lake's hero landmark as world-art places it: the Mossmere's Sunken Gate); `setIntroMood(on)` (the first run's opening mood: night 0, warm 0.35, no title multipliers); `setIntroWaterLight({x, y, z, color, intensity, radius, streak} | null)` (one more entry in the water's light list: the great lantern's gold path. The stage lays it on the low tier only; where the lake is a mirror the reflection is the gold, `INTRO.set.lantern.water.intensityMirror` 0).
- **water**: `rebakeDepth()` (the depth map baked again for the lake now on screen: a replay's silent lake swap); the lake's ambient rings keep falling in flow `intro`.
- **actors** (lane A): `setIntroKindle({wick: 0–1, lantern: 0–1} | null)`: straight multipliers on the Wick's head flame (size, light, halo, eyes) and on the raft's fire (the lantern's light, glass, halo and flame, the pool on the water, and the brazier), laid over the game's own values each frame; `null` = the game's own.
- **main** (lane B): `game.introPending()`, `introReplayOffered()`, `prewarmIntro()` (the stage's slices in idle time under the fresh title, as many as an idle period has time for; the game's smoke-and-ember pools are made then too), `beginIntro({reduced})`, `replayIntro({reduced})`, `skipIntro()`; flow `intro` (no run, `gameDt` 0, `ctx.cinematic` held, `game.save()` returns at once, keydown handles only the skip keys and swallows the rest; after a skip's hand-off the skip keys are swallowed for `INTRO.skip.after` s more, so a double Esc never opens the pause menu); a director whose `update()` throws, or a film still up `INTRO.clock.valve` + 2 s of visible wall time after it started (a debug seek's hold is not counted), is stopped by main and handed over as `intro:done {skipped: true, error: true}` would be (A10); `startNewRun({__intro: true})`; `ctx.intro.update(rawDt)` before the module loop. Under the opening's full ink main puts the film's lake on screen (a replay from another lake's title: `world.setZone` with no `zone:change`, the raft at its spawn, `water.rebakeDepth()`) and the lake's own grade (`INTRO.handoff.grade: 'ink'`: the film is graded as the run is; `'ease'` keeps the title's grade and eases the lake's in at the hand-off). Both are put back after a replay. The film and the replay are off while the cove is on (`FE_ON`) until the cove dressing is built.
- **ui** (lane B): `src/ui-intro.js` (`ctx.ui.intro`): the words (inside `INTRO.words.band`, ≥ 16 px, no box), the Skip word (64 × 44 px, safe-area aware, in by 0.9 s, out over the film's last 0.4 s), the ink veil, the reduced-motion cross-fade layer, `curtain({in, out, onFull})`, `sync()`, `debug()`, and **`takeTitle()`**: at the press the title's screen is closed for the game (the kit's `closeModal(id, {hold: true})`: the stack and the events, not the picture) and its picture stands, inert, until the opening ink has closed over it, so the picture only darkens from the press. The title: *Begin* and Settings alone while `pending()` (no premise paragraph, no count line); the quiet *Prologue* word otherwise.
- **audio** (lane B): the cue (`src/audio-intro.js`, `INTRO.sound`: D Dorian, on its own bus into the music gain, ≤ 0.3 s fades, silent when locked), played by the film's clock; `audioLog` records `intro_cue` and its marks; `debug.audioIntro()` (v3 debug builds) reads the bus.

**Debug hook** (registered by main only when `core.debugEnabled()`; `'intro'` is in `core.HIDDEN_DEBUG_HOOKS`): `debug.intro()` → the readout `{phase, t, wall, beat, line, replay, reduced, skipped, hold, optIn, pending, flow, seen, stage}`; `debug.intro('play', {replay, reduced})`, `('seek', t)`, `('resume')`, `('skip')`, `('stop')`, `('auto', bool)`, `('prewarm')`. Under `GW_DEBUG` (the test harness) the film never plays by itself unless a scenario opts in, so every existing v3 scenario is unaffected.

**Testing:** `tools/tests/intro-seam.test.mjs` (the seam: `INTRO`'s frozen block, both APIs, the events, purity, the trigger rule, the lane markers; neither lane edits it), `tools/tests/intro.test.mjs` (lane B's director), `tools/tests/intro-stage.test.mjs` (lane A's stage), all run by `tools/check.mjs`; browser scenarios through `tools/playtest.mjs`: `tools/tests/intro-shots.scenario.mjs` (lane A: a seek-driven frame strip on every tier, desktop and 390 × 844; the set's budget, purity, memory), `tools/tests/intro-flow.scenario.mjs` (lane B: Begin → the film → play, every skip path, the replay, reduced motion, the end state), `tools/tests/intro-board.scenario.mjs` (the stage: the film as the player sees it, canvas and DOM together, frame by frame; `tools/intro-board.py` makes the storyboard sheets and the video from its frames), `tools/tests/intro-length.scenario.mjs` (the film on the real clock, and the script cost of the press and the hand-off) and `tools/tests/intro-show-seam.scenario.mjs` (the film and the catch show in one page: a fresh game's film to its hand-off, the first catch shown, then the film replayed over a show's lens; the camera rules above, frame by frame). The data rules (length 15–20 s, contiguous beats, ≤ 4 lines of ≤ 60 characters, the skip and clock limits, the set's ceilings) are in `tools/validate-data.mjs` and run in all three passes.

---------------------------------------------------------------------------------

## 14. The Full Hold (the loop: catch, keep, sell, upgrade; `docs/loop/SPEC.md`, slice 1a)

Binding for the loop (SPEC v8.4 §3, §4, §8, §9, §12; the build plan `docs/loop/slice-1a/PLAN.md` §3, which this section states as
built). It is the seam every lane codes against: data and core names are imported directly; the ctx objects (`ctx.progression.loop`,
`ctx.game.*`, `ctx.ui.loop`, `ctx.fishing.waterAt`, `view.favour.bitesLeft`) are read with optional chaining and a strict type test
(`=== true`, `typeof x === 'number'`, `?.() ?? builtValue`): an absent neighbour means the built behaviour, never a throw. Where this
section and §13 disagree, this section wins **only under `data.LOOP_ENABLED`**; with the loop off every path is v1's or v3's as
built (§14.0).

### 14.0 The switch, the build and the rules every module follows

- **One switch, read once.** `data.LOOP_ENABLED = V3_ENABLED && globalThis.GW_LOOP === true`. Every loop branch reads it (or a module
  constant built from it once) or a `data.PARKED.<key>`, never `globalThis.GW_LOOP`. `data.PARKED` is frozen: `{}` off the loop, and
  on the loop exactly these 31 keys, all true: `swarm combat levels embers hunger oilAsLife nightModes death days farWater liveWell
  meta tolls longDescent challenges quality mercy passFavour baitAttract murkInLake runShop residents weather walking giantSpots
  watchLamps arrivalHush eatRender bounties firstCatchShells proofs`. Under `GW_LOOP` data evaluates at **`V3_PHASE` 1** whatever
  `GW_V3_PHASE` says (without `GW_LOOP` the phase expression is v3's, byte for byte).
- **The page switch** (`core.js`, declared above `V3_FLAGS` so it writes first): `LOOP_ROLLOUT = {on: false}`, `LOOP_FLAG_KEY =
  'gloomwater.loop'`, `resolveLoopFlags({preset, search, stored, rollout}) → {on, source, apply}` (a preset `GW_LOOP` boolean wins;
  a preset `GW_V3 === false` keeps the loop off; then `?loop` / `?loop=1|on|true|0|off|false`; then localStorage; then the rollout;
  `?loop=1` beats `?v3=0` and `?v3phase`), `applyLoopFlags(g)` (a page only: when on, writes `GW_LOOP = true`, `GW_V3 = true`,
  `GW_V3_PHASE = 1`; node writes nothing), `setLoopFlag(on | null)`, `LOOP_FLAGS`. `'loop'` is in `HIDDEN_DEBUG_HOOKS`.
- **Inside a trip only.** Behaviour on the water is keyed on `run.outing === 'trip'`, which only `progression-loop`'s `createTrip`
  writes. Loop branches are an early `if (…) return …` or a guarded line; no built statement is reordered; new event fields are added
  only under the loop (flag-off and v3 payloads are the same objects); `meta.loop` is written only under the loop (and by the
  flag-off boot rule, only for a trip envelope or a parked descent, which only a loop build writes); no v1 or v3 table is mutated
  outside the apply block's `if (LOOP_ENABLED)`, and no exported v1 / v3 function of `data.js` is edited (the v1 fingerprint and
  `tools/tests/v3-exports.json` prove it in validate-data passes 1–3, which also assert `LOOP_ENABLED === false`, `PARKED` `{}` and
  no `TEXT.loop`).
- **The one change that runs with the flag off** is the boot rule (`sellStrandedTrip`, §14.3): a no-op unless `save.run.outing ===
  'trip'` or `meta.loop.parkedRun` exists.

### 14.1 data.js exports (always exported; read by built code only under the loop)

| export | what |
|---|---|
| `LOOP_ENABLED`, `PARKED` | §14.0 |
| `LOOP` | the tables (SPEC §3, §4): `value` (perZ 0.9, clamp 0.4–30, classBonus Trophy 1.25 · Elder 1.6, rarity 1 · 2.4 · 5.5 · 12, body √(L50/45) clamped 0.6–1.6, legendRematch 0.4), `priceFactor` (1), `hold` (start 3, max 8, shelfMax 6 (1a: 5; M1 step 3a: Hold 6, §14.11), the ladder 4–8 at 30 · 120 · 450 · 2,000 · 3,500 with its names), `water` (good bites day 2 · old 3 · night 2 · crown 2; open water one per slot + 1; quiet −0.15 a bite to −1.2, waits ×(1 + 0.3·over) to ×2.2), `letGo` (+0.2 to +0.4, the bite back), `evening` (day 40, dusk 20, night `null` = no end, never read through `num()`; nightLook 90), `hours` (the roster's hour strings only), `tackle` (price per tier 0 · 50 · 300 · 1,200 · 6,000 · 32,000 · 100,000; T5–T6 Hold and names; `shelfAt`), `access` (v8: `gear`, `list`, `pull`; inert in 1a), `waters` (the Mossmere: order 1, tier 7, place prices, crown 500), `time` (the sim's trip legs; `show` 0), `wicks` (§14.8), `tutorial` (§14.8) |
| `TEXT_LOOP` | every word the loop shows (SPEC §8; the opening's are §8.5's table); `TEXT.loop === TEXT_LOOP` under the loop. `settings` is `{label: 'Settings', ringFirst, hurry}` |
| `fishClams(sp, z, {zone, tier})` | SPEC §4.1 on the built size model: `max(1, round(tier × rarity × body(L50) × clamp(e^(0.9·z)) × classBonus × priceFactor))`; a legend → `null` |
| `loopWaterKey(placeId, zoneId)` | the bite-count key: a place's id, or `open:<zoneId>` |
| `loopWickId(id)` | a `LOOP.wicks.order` id, else `'wick'` (the only implementation) |
| `wickSlots(holdSlots, wickId)`, `loopSlots(metaLoop, wickId = metaLoop.wick)` | a Wick's slots: the bought count + the Wick's `slots` (Tallow 1) |
| `goodBitesFor({kind = 'open', holdSlots, wickId})` | open water `wickSlots × openPerSlot + openExtra + good`; a place its built count `+ good` where the Wick's `everyWater` (Tallow's) |
| `quietTerms(over, wickId)` | `{over, favour, waitMult}` for a bite `over` bites past the good count (the caller counts `over`; §14.4 `favour`); Stub: −`quietStep` a bite and no slower waits |
| `wickPoolWeights(wickId, pool, weights, {firstBite, signRule})` | Taper's first bite: the commons zeroed where the uncommon-and-rare rest passes `AUTOFISH.signRule`; otherwise **the same array** (the rule waits) |
| `sailPlan(dock, centre, T = LOOP.tutorial, lake)` | the glide out: `{from, to, yaw, path}` (`T.outPath[lake]` when given, else `T.outDist` m toward the centre; yaw in the player's heading convention, `atan2(−dx, −dz)`) |

The apply block, under `if (LOOP_ENABLED)` only: `TEXT.loop = TEXT_LOOP`; `CATCH_V3.buffs.wicks.ashwick = {hold: LOOP.wicks.ashwick.hold}`
(no `on`: `getCatchBuffs` names Ashwick only while a comeback bite is open; there is no Tallow buff); `INTRO.text[2] =
INTRO.cove.text[2] = TEXT_LOOP.introLine3`; and under `PARKED` no watch lamps and no stopgap `arena.giantSpots` in any lake (T30).

### 14.2 progression-loop.js: the pure exports (no data import; data is passed in)

| export | what |
|---|---|
| `LOOP_SCHEMA` (3), `LOOP_METHODS` | the save block's version; the 36 method names of §14.4 (createLoop and the fixture's `fakeLoop` carry exactly these) |
| `freshLoop(D)` | §14.5's block: 3 slots, T0, the Mossmere owned, `wick` and `tutorial` null, `firsts` empty; the start kit (`startKit(D)`, `LOOP.start`, GEAR-GATES §2.1): `lures: ['bent_spoon']`, `bait: {mossmere: {mireworm: 10}}`, `fitted.bait: 'mireworm'`; `migrateLoop` adds a missing start lure to any save (never a bait, never taking anything away) |
| `gateLine(D, metaLoop, fishId)` | GEAR-GATES §5.1: the Journal species page's line: `{kind: 'upTo', cls, text}` (the best `watercraft.gearCap` over the save's hooks that take the fish, on its line) or `{kind: 'needs', item, text}` (the cheapest shelf item that takes it); null for the legend or a fish with no hook row |
| `migrateLoop(meta, D, {hasTrip})` | idempotent, in place: creates the block, fills missing keys, clamps `holdSlots` 3–8 and tiers 0–6, a v1/v2 draft block gets SPEC §9's five rules; a block that has played (`evenings > 0`, a `lastTrip`, or `hasTrip`) with no tutorial gets `{done: true, step: null}` and the Wick `'wick'` |
| `tallyLines(creel, {D, saleOf})` | the rows `{uid, speciesId, sizeClass, length, base, clams, first, giant, legend}`, lightest first by the weight the card shows (`data.weightOz(fishWeight)`; ties by clams, then catch order), legends after, a giant last; a row keeps the **length**, never a weight |
| `tallyBook(metaLoop, creel, run, opts)` | one tally's bookkeeping, shared by `endTrip` and the boot rule: clams, evenings + 1, `legends[id]`, `giants[id].landed`, `bait[run.zone]`; → `{lines, total}` |
| `sellStrandedTrip(save)` | the flag-off boot rule (re-exported by `progression.js` beside `migrateSave`): a saved trip is sold at its stamped prices (a card still open was never kept: not sold) into `meta.loop.lastTrip {…, boot: true, seen: true}` and dropped; then a `parkedRun` goes back into `save.run`; idempotent by `lastTrip.id`; → `{save, sold, restored}` |
| `shelfItems(D, metaLoop, session)` | the shelf's cards `{id ('rod:1' \| 'hold:4'), tab, slot, level, name, goalName ('Hold 4' or the tier's name), line, price, bought}`: per tackle slot the next tier on the shelf, the next hold step up to `shelfMax`; a card in `session` reads bought in place; the last step a 1a shelf offers (Hold 5, T2), once owned, a permanent bought card |
| `goalOf(items)` | the cheapest card not bought: `{id, name, price, slot, level}` or null (the view names "Hold N" from `wickSlots` of `level` for Tallow) |
| `stampFirst(firsts, sp, fish, {cls, seals})` | the Wick's ledger (WICKS §2.1): a kind not seen, its first Prize / Trophy / Elder seal or Ancient, or a longer best; → `{kind, seal, best, first}` (`first` never for a giant or a legend) |
| `listFor(D, waterId)`, `listCount(meta, D, waterId)` | v8: a water's list by SPEC §5.5 (c) (computed, never listed; 1a: the Mossmere's six), and `{have, need}` counting `caught > 0` only |
| `createLoop(S)` | §14.4 |

### 14.3 progression.js under the loop

`create(ctx)` builds `createLoop(S)` after `createAutofish(S)` when `data.LOOP_ENABLED` and exposes it as **`progression.loop`** (null
off the loop); **`progression.getBitesLeft(key)`** = `loop.bitesLeft(key)` (null off the loop). On a trip:

- `createRun(opts)` → `loop.createTrip(opts)` for every run of a loop build.
- `computeStats(out, r)` (keyed on the argument): the STATS bases, the rod's absolute `castMax` / `hookWindow` (`TACKLE.rod[min(tier,
  4)]` for `meta.loop.tackle.rod`), then `LOOP.wicks[r.character].stats` (Stub's `lightRadius` +1.5, the look), clamped;
  `creelSize = loopSlots(meta.loop, r.character)`; `hold` = the loop tackle's Hold. No CHARACTERS effects, upgrades, boons, Heartwax,
  release luck, relics or journal perks.
- `makeFish` stamps `fish.waterKey = loopWaterKey(place, run.zone)`.
- `measure(fish)` writes the **records only** (journal count, PB, best setup, last lengths, class seals, the Old Ledger flag, the Elder
  Log, first Ancients, legend wounds cleared, a Marked Fish removed, `meta.totalFish`, the run's counters), plus `entry.firstEvening =
  run.evening` (new and on first catch), the Wick's ledger (`stampFirst`, the Wick only; `fish.first`) and `fish.measured = true`;
  the fish goes **on the card** (`pending`, saved as `run.flags.pendingCatch`), never into the hold. No Memories, Shells, XP, toasts,
  journal milestones, Murk's line, bounties, trials, gate or victory; a record's `memories` figure is 0. `fish:measured` is
  unchanged; `fish:landed` adds `clams` (`loop.priceOf`) and `holdFull`, with `firstShells: 0, xp: 0`. A fish that already carries
  `measured` is never measured again.
- `fishAction(fish, 'keep')` → `loop.keep`; `'letgo'` / `'release'` → `loop.letGo`; `'eat' | 'render' | 'burn' | 'sell'` → `{ok:
  false, msg: ''}`.
- Continue: `restorePending` first refunds an open bite (`loop.refundOpenBite()`), puts each saved card fish back on the card (never
  in the hold), and in a microtask after every `run:start` listener emits `fish:landed {…, measured: true, records: [], restored: true,
  clams, holdFull}` for each; it never calls `measure`. No auto-keep on a trip (a card waits for the player).
- `run:start` on a trip normalises `run.bites`, `run.mercy` (objects), `run.evening` (a number), `flags.openBite`,
  `flags.openComeback`, `flags.taperFirst`, `run.comeback`. Pressure is off (`notePressure` returns, `getPressure` 0).
- **The gate is scenery** (`PARKED.tolls`): `evaluateGate` and `openGate` return at once, `travel` → `{ok: false, msg: ''}`,
  `syncGateVisual` pushes `'sealed'` (or `'hidden'` with no next lake).
- `syncCharacter` on `flow:change 'title'` and at init reads `loopWickId(meta.loop.wick)` (after actors' own `lastCharacter` pass,
  so the title shows the chosen Wick).
- The listeners (registered only under `LOOP_ENABLED`): `fishing:bite` → `loop.noteBite`; `fishing:miss {reason: 'spooked'}` →
  `loop.noteBite` (a spook spends one); `fishing:miss` (any), `fishing:escaped`, `fish:measured` → `loop.closeBite`; `fish:escaped`
  → Ashwick's comeback first, then the built got-away side (`af.onEscaped(e, {comeback})`: a fish that will come back is not also a
  Marked Fish); `ui:modal {id: 'shelf'}` (open or close), `home:enter` and a trip's `run:start` end the shelf's session (§14.4
  `shelf`); `zone:change` to another lake drops a waiting comeback.
- `progression-v3.migrateSave(D, save)` runs `migrateLoop(save.meta, D, {hasTrip: save.run?.outing === 'trip'})` under the loop
  (after the built steps; the `!v3On(D)` early return stays first).
- `progression-af.js`: on a trip **and at home** (no run) under the loop, `getLoadout()` is `{rod, line, reel}` from
  `meta.loop.tackle`, `hold` from `tackleHoldAt` (T0–T4) or `LOOP.tackle.extraHold` (T5–T6), `item: null`, `itemLevel: 1`, `perRun:
  false` (`runless: true` at home), so a legend fights at `CATCH_V3.legend.fight`; `ownedRelics()` is `{}` under `PARKED.meta`;
  **`getCatchBuffs(cls?)`** (the class is optional; off a trip it is ignored) is `{wellFed: false, boons: {}, relics: {}, character:
  'ashwick' only while Ashwick's comeback bite is open, else null}`; per-run lures are off; `getFishingCounters()` counts the
  **evening** (`run.evening`, or `meta.loop.evenings + 1` at home) as `expedition`, `firstExpedition` = evening 1, the hurry from
  evening 2, and adds `evening`; the gear log reads the loop's tiers (owned / fitted from `meta.loop.tackle`, `LOOP.tackle.price`, no
  proof catches) and shows no bait on the 1a shelf. The logs keep their built rule: tackle odds, owned relics (none under the loop),
  no run buffs, so no Wick's passive is in a log.
- `progression-market.js`: `arrive` and `update` return at once under `PARKED.murkInLake`; `offerBounties`, `expireBounties`,
  `bountyEvent` under `PARKED.bounties`. `progression-challenges.js`: under `PARKED.challenges` `evaluate` → `[]`, `complete` →
  false and every `hooks.*` is a no-op (`meta.challenges` is kept as it is).

### 14.4 `ctx.progression.loop` (null off the loop)

Every method makes `meta.loop` whole first (a lazy `migrateLoop`: `wipeAll` resets meta). On a trip the Wick is `run.character`; at
home it is `meta.loop.wick`. The hold **is** `run.creel`.

| method | what |
|---|---|
| `state()` | the save block `meta.loop` |
| `hold()` → `{slots, fish, full}` | `slots` = `loopSlots(meta.loop, wick)` (Tallow one more; at home too), `fish` = the hold (`[]` at home). The view draws `slots` cells and never tests the Wick |
| `holdFull()` | on a trip `run.creel.length >= slots`; else false |
| `priceOf(fish)` | the card's number: `fish.clams` when stamped; else `fishClams(sp, z, {zone: run.zone})`; a legend her crown (`LOOP.waters[sp.zone].prices.crown`) on her first landing (none sold before and none already in the hold), later × `legendRematch` (500, then 200) |
| `saleOf(fish)` → `{base, clams, first}` | what the tally pays: the base, plus for the Wick (Curious) on a kept first (`fish.first`) `max(round(firstFloor × tier), round((firstMult − 1) × base))`; never on a giant or a legend; with an order or the Old Ledger (later slices) the larger applies |
| `keep(fish)` → `{ok, full?, msg, gained: {clams}}` | refused when full (`loop:holdFull {via: 'keep'}`, `msg` = `TEXT_LOOP.holdFull`); else stamps `fish.clams = priceOf(fish)`, into the hold, the card closed, `fish:action {action: 'keep', fish, gained: {clams}}`, a save |
| `letGo(fish)` → `{ok, gained: {bite, favour}}` | `run.bites[key] − 1` (floor 0) and `run.mercy[key] + 0.2` (to 0.4) at `fish.waterKey`; the fish is gone; `fish:action {action: 'release', letgo: true, fish, gained}` (`gained` holds what was actually given back); a save. A fish in the hold cannot be let go (kept stays kept). Never touches `run.flags.mercy`, pays nothing |
| `noteBite({waterKey, comeback?, reason?})` | `run.bites[key] + 1`; opens `run.flags.openBite = key` (not for a spook); `comeback: true` opens `run.flags.openComeback`; a missing key counts at `open:<zone>` and is reported once (R8) |
| `bitesSpent(key)`, `bitesLeft(key)` | spent; `max(0, goodBitesFor(kind, holdSlots, wick) − spent)` (a place's kind from `PLACE_BY_ID`) |
| `favour(key)` → `{favour, waitMult, over, good, spent, mercy, quiet}` | exactly these field names (T11): `over = max(0, spent + 1 − good)` (at 4 good bites the 5th bite is already quiet, PLAN CHOICE 17), `favour` and `waitMult` = `quietTerms(over, wick)`, `mercy` the let-go favour there, `quiet = spent >= good`. Fishing adds `{family: 'quiet', value: favour}` and `{family: 'letGo', value: mercy}` |
| `closeBite()`, `refundOpenBite()` | the open bite (PLAN CHOICE 27): closed when the play reaches its card, is lost or passes; on Continue a bite still open with no card fish carrying its key is given back (→ true) |
| `taperFirstOpen()`, `spendTaperFirst()` | Taper's first bite, one an evening (`run.flags.taperFirst`): open while the Wick is Taper and fewer than `firstBites` were served under the rule this evening; set by `spendTaperFirst()` when fishing serves a bite under the rule; never re-armed by a let-go refund; a new trip starts it afresh |
| `comeback(key)`, `consumeComeback()` | Ashwick's waiting comeback at a water (`{waterKey, speciesId, z, zone, sizeClass}`) or null; consumed (and saved) when fishing serves its bite. Stored on `fish:escaped` for Ashwick only: never a giant, a legend, a cut line or the comeback itself; dropped by a lake change and by the end of the trip |
| `isOpen(waterId)`, `listCount(waterId)` | v8: in 1a true only for the Mossmere; `{have, need}` on this save |
| `createTrip({startZone, character})` → Run | the built run skeleton with `outing 'trip'`, `nightMode 'still'`, the zone (`isOpen`, else the first owned), `character = loopWickId(meta.loop.wick ?? character)`, `shells 0`, no boons, upgrades, lures, kit, start boon or purse, `bait` = `meta.loop.bait[zone]`, an empty hold, `bites {}`, `mercy {}`, `evening = evenings + 1`, `comeback null`, the flags' `openBite`, `openComeback`, `taperFirst`, the maxima from `computeStats` |
| `endTrip()` → TallyResult \| null | null off a trip; `{…lastTrip, already: true}` for a run already paid; else stamps each hold fish, `tallyBook` with `saleOf`, `lastTrip = {id, evening, zone, total, lines, seen: false}`, empties the hold and the card, ends the run (`active: false`), **saves at once** (`ctx.game.save()`), then `loop:tally {…lastTrip}` |
| `lastTrip()`, `markTallySeen(id)` | the replayable tally; Sold marks it seen |
| `shelf()` → `{tabs: [{id, items}]}`, `goal()`, `buy(id)` → `{ok, msg, clams}` | the shelf by tab (only tabs with a card: 1a Tackle and Raft); the goal line's item; a buy (`'hold'` = the next step, or a card id) refused out of order or too dear, else spends, sets, invalidates the stats, **saves at once**, `loop:buy {item, price, clams}`. Works at home with no run. The session (cards reading **Yours.** in place) ends when the `shelf` modal opens or closes (`ui:modal`), at `home:enter` and at a trip's start |
| `sayOnce(id)` | `TEXT_LOOP.murk[id]` the first time, then null (`firstChart` is the Wick's own count, `firstChartBy[wick]`); `'sailOut'` rotates and never returns null |
| `parkRun(run)` | a saved non-trip descent → `meta.loop.parkedRun` (never resumed under the loop; the flag-off boot puts it back) |
| `debugGive(n)` | debug builds only (`core.debugEnabled()`): `meta.loop.clams += n` |
| `wick()`, `setWick(id \| null)` | the save's Wick (`'wick'` when unset); New Descent's Start sets it (on a fresh save the Wick's ledger is cleared with it); `null` clears it (a first film abandoned to the title) |
| `tutorial()`, `beginTutorial()`, `setTutorialStep(id)`, `tutorialDone()` | `{done, step}` or null; `{done: false, step: 'arrive'}` when null (a running record is left alone); a readout (a resume always starts at the wake); `{done: true, step: null}` and `said.firstChart = true`, **saved at once** (the first Sail, before anything moves) |
| `resetTutorial()` | debug builds only (`debug.loop.tutorial('reset')`): `{done: false, step: 'arrive'}` again and `said.firstChart` cleared; returns the record |

### 14.5 The save

`meta.loop` (SPEC §9; written only under the loop; `core.defaultMeta()` gains no key):

```
{ v: 3, clams, evenings, holdSlots (the bought count, 3–8, for every Wick), tackle: {rod, line, reel}, lures: [], fitted: {lure, bait},
  bait: {waterId: {baitId: n}}, maps: {lakes: ['mossmere'], places: []}, raft: {oars, keel, lantern}, home: {orders, baitBed, wall, lights},
  looks: [], orders: [], legends: {id: n}, giants: {id: {landed, marked}}, prints: {}, ledgerPaid: [],
  said: {lineId: true, sailOut: index}, lastTrip: {id, evening, zone, total, lines: [TallyLine], seen, boot?} | null,
  wick: WickId | null, tutorial: {done, step} | null, firsts: {seen: [id], seals: ['id|class'], best: {id: cm}},
  parkedRun?: Run }                      // only while an old descent waits (PLAN CHOICE 5)
```

A trip (`save.run`): the built run plus `outing: 'trip'`, `nightMode: 'still'`, `evening`, `creel: [Fish & {clams, measured, waterKey,
first?}]` (the hold), `bites: {waterKey: n}`, `mercy: {waterKey: favour}`, `comeback: {…} | null`, `flags.pendingCatch: [Fish]` (a card
open), `flags.openBite`, `flags.openComeback`, `flags.taperFirst`, and the built `phase`, `phaseTime`, `pos`. `run.shells` is 0 and
unused; `run.eveningT` is derived (calm + dusk + `phaseTime`), never stored. **Never written under the loop:** `meta.runs`,
`meta.lastCharacter`, `meta.deaths`, `meta.bestDay`, `meta.memories`, `meta.memoriesEarnedTotal`, `meta.relics`, `meta.unlocks`,
`meta.challenges`, `meta.fitted`, `meta.lures`. Written as built (shared with the old game): the Journal, `meta.totalFish`, the Elder
Log, first Ancients, legend wounds, Marked Fish, `meta.intro`, `meta.seenTips`. **No weight is ever saved**: a tally row stores the
fish's length and every screen derives the weight (`data.fmtWeight(data.fishWeight(species, line))`).

`endTrip` writes the paid meta and the ended run in one `writeSave` (which drops an inactive run), so a reload sees either the trip
still out (nothing paid) or the paid meta and no run, with the unseen `lastTrip` to replay.

### 14.6 main's game API and `loop-rules.js` (lane B)

`game.startNewRun(opts)` (under the loop: `opts.__intro` → `enterHome('intro')`, else `startTrip(opts)`); `game.sail({water, place}) →
boolean` (refused while a trip is saved or outside `home` / `title`, or for a water not open; the first Sail calls `tutorialDone()`;
`ui.closeAll`; the 3 s glide out; then `startTrip({water, at})`); `game.canGoHome({fromPause}) → {ok, why}` (`why` ∈ `'play' | 'show' |
'card' | 'note' | 'flow' | null`); `game.goHome() → boolean` (a waiting line is reeled in, then `endRun('home')`: `endTrip` pays and
saves, then the 2 s glide home); `game.toHome()`; `game.atHome()`; `game.hasSavedRun()` (true only for a saved trip); `game.endRun(cause)`
(anything but `'home'` is reported and refused); `game.beginIntro({character, reduced})`; `game.loopFresh()`. `src/loop-rules.js`
(pure): `tripEndAllowed(cause)`, `tripStartAllowed({flow, hasSavedTrip})`, `goHomeAllowed({…}) → {ok, why}`, `startRoute({loopOn,
intro})`, `tripKeyAllowed(code)`, `loopFreshSave(meta, hasSavedTrip)`, `filmAllowed({intro, debug, optIn})`. Debug (debug builds
only): `ctx.debug.loop = {state, giveClams, bites, home, sail, tutorial, wick}`.

### 14.7 Events and ctx fields

| event | emitter | payload |
|---|---|---|
| `fishing:bite` | fishing | built payload `+ waterKey` (and `comeback: true` on Ashwick's returning fish) |
| `fishing:miss` | fishing | `{reason: 'spooked', waterKey}` for a spooked bite (no second `fishing:bite`) |
| `loop:holdFull` | fishing (a refused cast), progression (a refused keep) | `{via: 'cast' \| 'keep'}`; the toast and pulse on `'cast'` only |
| `fish:measured`, `fish:landed` | progression | built payloads; `fish:landed` adds `clams`, `holdFull` (and `restored: true` on Continue) |
| `fish:action` | progression | `{action: 'keep', fish, gained: {clams}}` · `{action: 'release', letgo: true, fish, gained: {bite, favour}}` |
| `loop:tally` | progression, inside `endTrip`, after the save | the TallyResult |
| `loop:buy` | progression | `{item, price, clams}` |
| `zone:change` | main at a Sail | `{zone, prev: null, sail: true}` (render: no flash; audio: `setout`; ui: no banner) |
| `run:end` | main | `{summary: null, cause: 'home'}` |
| `home:enter` | main, after `run:end` | `{from: 'trip' \| 'title' \| 'intro' \| 'new', tally: TallyResult \| null}` |
| `flow:change` | main | the new flow `'home'` (never `'hub'`) |
| `player:glide` | player | `{state: 'start' \| 'end', kind: 'home' \| 'sailOut'}` for the loop's glides |
| `loop:tutorial`, `firstEvening:line {kind: 'murk', key, text, hold, loop: true}` | the tutorial machine (lane C) | `{step, prev}`; the grumble's line |

ctx fields: `ctx.progression.loop`, `ctx.progression.getBitesLeft(key)`, `ctx.fishing.waterAt({x, z}) → {giant, waterKey, placeId}`,
`ctx.fishing.view.favour.bitesLeft` (a number on a trip) and `.quiet`, `ctx.survival.getPhaseInfo().open` (true on a trip's night),
`ctx.ui.loop` (lane C's view), `ctx.ui.isCatchOpen()`, `ctx.debug.loop`. DOM hooks: `[data-loop=home|jetty|tally|shelf|chart|homepause]`,
`[data-tile=murk|chart|journal]`, `[data-action=keep|letgo|sold|sail|start]`, `[data-buy="hold:4"|"rod:1"|…]`, `.gw-hold
.gw-slot[data-filled]`, `.gw-home.gw-pulse`, `button.gw-char[data-wick=…]`, `.gw-loop-trait`, `.gw-cue`, `.gw-dim`; modal ids
`jetty`, `tally`, `shelf`, `chart`, `catch`, `newdescent`, `homepause`.

### 14.8 The five Wicks and the opening's data (`docs/loop/WICKS.md` §2, §5; `docs/loop/OPENING.md`)

`LOOP.wicks = {order: ['wick', 'taper', 'stub', 'tallow', 'ashwick'], wick: {passive: 'curious', firstMult: 1.4, firstFloor: 0.4},
taper: {passive: 'long_reach', firstBites: 1, perWater: false, giantShare: 1.3, giantCap: 0.12}, stub: {passive: 'moth_bright',
waitMul: 0.78, quietStep: 0.08, quietWait: false, stats: {lightRadius: 1.5}}, tallow: {passive: 'broad_back', slots: 1, good: 1,
everyWater: true}, ashwick: {passive: 'burns_back', hold: 4}}` (each with `stats`; the values the lead ruled on 15 November 2026). Who
reads what: progression (the Wick's ledger and sale, Tallow's slots and good bites, Taper's flag, Ashwick's comeback and its buff,
Stub's quiet terms through `favour`); fishing (Taper's pool through `wickPoolWeights` while `taperFirstOpen()`, Stub's wait ×`waitMul`
not on a legend cast, Ashwick's returning bite; nothing for Tallow); the views (the hold's `slots`, the tally rows' `{base, clams,
first}`, `murkLineFor('firstChart', wick)`). No Wick term reaches a log or the DOM's words beyond `TEXT_LOOP.wicks`.

`LOOP.tutorial = {arrive: 3, out: 3, chartWait: 3, slotInk: 0.25, castTipAfter: 1.5, outDist: 15, outPath: {mossmere: [[24, 38], [16,
25.3]]}, budget: {reference: 20, tapThrough: 8, max: 45}}`. validate-data's `--loop` pass checks the arrive glide and every lake's
glide out (`sailPlan`) clear every island, pillar and gate stone by the raft radius + 0.3 m, and the tutorial's budget.

### 14.9 The names the spec uses → the names built

| the spec says | built as |
|---|---|
| `run.hold` | `run.creel` (PLAN CHOICE 19), sized by `loopSlots(meta.loop, run.character)` through `computeStats().creelSize` |
| `getBitesLeft(key)` | `ctx.progression.getBitesLeft(key)`, an alias of `ctx.progression.loop.bitesLeft(key)` |
| `fishing:bite {waterKey}` for a spooked bite | `fishing:miss {reason: 'spooked', waterKey}` (PLAN CHOICE 22; a second `fishing:bite` would play the bite tell) |
| `run.eveningT` | derived: calm + dusk + `run.phaseTime` (PLAN CHOICE 21), never stored |

The same four lines go to the lead as a one-line SPEC errata request with the slice's commit.

### 14.10 Testing and validation

`node tools/validate-data.mjs` runs four passes: v1, `--walk`, `--v3` (each asserting the loop is off; pass 3 also asserts the
v3-without-loop fingerprint) and **`--loop`** (§4.3 of the plan: the build, `PARKED`, no giant water or watch lamps, the ladder, the
tackle prices and Hold, quiet water, the evening, `fishClams(dusk_minnow, 0.4) === 7`, the crown, the v8 keys, the Wicks' knobs in
their ranges, every `TEXT_LOOP` word, the glides' clearance and the tutorial's budget). `node tools/check.mjs` runs
`tools/tests/loop.test.mjs` (data, the switch, the pure module, saves, the shelf, the list) and `tools/tests/loop-trip.test.mjs` (a real
progression on the loop's data: the hold, keep, let go, quiet water, the tally paid once, Continue, the open bite, the shelf at home,
the parked systems, the counters and WICKS' T76–T80), with lanes B's and C's loop tests. `tools/tests/loop-fixture.mjs` is the shared
fixture (`loadLoopData`, `freshLoopMeta`, `tripRun`, `fakeLoop`). The economy is `node tools/sim/clams.mjs` (it reads `data.LOOP`'s
moved tables and `data.quietTerms`, and fails if a moved key is drafted again, T42); M1's gate is `clams.mjs --shipped=mossmere --step=1`.

**The CSP check (the full gate runs it).** The app the user plays in serves the page under a Content-Security-Policy that refuses
`fetch()` of a `data:` URI (`connect-src`) while images stay allowed: an image decode must never fetch a `data:` URI (decode through an
`<img>`; the user's phone, 16 Nov 2026, showed the Landing's sheet blank and the Chart as its list). `node tools/csp-copy.mjs
--html=<built page>` writes the page's copy with `<meta http-equiv="Content-Security-Policy" content="connect-src 'self'
https://fonts.googleapis.com https://fonts.gstatic.com">` before any script (`HOST_CSP`, `cspHtml`, `cspCopy`), and
**`tools/tests/csp-art.scenario.mjs`** runs on it (it makes the copy itself when given a plain build): a fresh save through the opening
(New Descent → Start → the film skipped) to the Landing, where the tow view's art must be `'ready'` and its sheet drawn, then the tow to the
chart beat, where the drawn Chart's art must be `'ready'` and the Chart open drawn (never the list), with no policy violation in the page.
`nice -n 10 node tools/playtest.mjs --html=<built page> --script=tools/tests/csp-art.scenario.mjs --width=960 --height=540`; it prints
`CSP_ART {size, failures, notes}` and ends with page errors 0, console errors 0, ctx.errors 0.

### 14.16 (placed before 14.11 to merge cleanly beside the lanes' appended sections) Watercraft (the Mossmere; WC-1, `docs/loop/WATERCRAFT.md` rev. 2 §2–§4, §8.1, §9.2)

Under the loop, on the Mossmere only, where a cast lands decides who is there (ten open-water areas) and what is on the hook decides who
takes it (the hook table); every other water keeps the built family rule. Odds stay hidden: no area name, weight or share is ever on
screen (the gear log's **Who bites** is the one place a share shows).

**`src/watercraft.js`** (new, pure: no three.js, no `data.js` import; `D`, the data module, is passed in where a rule needs it). WC-2 and
WC-3 read it and never edit it.

| export | contract |
|---|---|
| `WATERCRAFT.mossmere` | `geometry` (§2.2's block), `laneAvoid`, `shares[light][area]` and `factors[light][fishId]` (baked by `node tools/tests/watercraft.test.mjs --bake`), `raw`, `night`, `tilts`, `hook` (`table[fishId][itemId]`, items `bare`, `mireworm`, `lumen_moss`, `cut_strip`, `feather_fly`, `glimmer_spoon`, `bone_jig`, `bell_spinner`; grades 0–3, `null` for the legend and the eel's bare cell; `mult` [0.1, 1, 1.6, 2.5]; `cap` 0.01), `take` {rise 1, swirl 0.6, sight 0.45, stray 0.01}, `waits` {rise 0.5, tell 0.65, sightTake 0.3, spook 1.5}, `tells` (§5.3: per kind and form the makers, areas, hours, caps, cast rule, `respond`), `sight` (§6; `inRange` null) |
| `AREAS`, `HUNTERS`, `HOOK_ITEMS`, `LURE_IDS`, `BAIT_IDS` | the ten area ids (`margin`, `reeds`, `pads`, `stones`, `dropoff`, `lane`, `open`, `deep`, `inflow`, `outflow`); the five hunters; the hook's item ids |
| `lightOf(phase)` | `'day'` (calm, day, dawn) · `'dusk'` · `'night'` (gloomtide, night) |
| `areaAt(x, z, probe, {lane, arena, hulls, docks})` | the area of an open-water point in §2.2's order (inflow → outflow → rim → pads → stones → reeds → lip → margin → lane → deep → open), or `null` where it is not water. A place is decided before it is called. `probe = {depth(x, z), fromShore(x, z)}` (`probeOf(ctx.world)`: `getDepth`, `getShoreRadius(atan2(z, x)) − hypot(x, z)`; never a second `buildLayout`); `arena` `ZONES[0].arena`; `hulls` `data.loopMooring`'s circles (`world.getMooring().circles`); `docks` `world.getDocks()` (a dock's stones are its two mooring posts) |
| `laneFor(evening, phase?)` | this evening's wind lane `{x, z, h, w: 4, len: 50, evening}`, seeded and deterministic, its centre within 25 m of (0, −5) clear of `laneAvoid`; `null` when `phase` is night. `inLane(lane, x, z)` |
| `areaShares(probe, opts)`, `fitFactors(D, shares)`, `blindMix`, `tiltedTarget` | offline helpers (the test's recompute, `--bake`, the sim's and the validator's proofs) |
| `areaWeight(fishId, area, phase)` · `rawWeight` · `tilt(fishId, phase)` | the open-water weight (factor × raw, the night rows; 1 for a fish with no row) · the hour tilt |
| `gradeOf(fishId, {lure, bait})` | §3.3–§3.4: no lure → the bait's (an unknown bait or the legend's ball: the bare hook's); a lure → its grade, one step up when the lure's is ≥ 1 and the bait's ≥ 2 (3 at most); `undefined` for a species with no row (the caller keeps the built family rule) |
| `takeChance(base, g)` | 0 → 0.01; 1 → base; 2 → max(base, min(0.9, base + 0.1)); 3 → max(base, min(0.9, base + 0.2)); no grade → base |
| `gradeTargets(itemId, D?)` | the fish an item alone grades 2–3 (the Hold it helps); the Harbour-Bell Spinner keeps `LOOP.lures.bell_spinner.giants` |
| `hookWeights(list, {area, place, phase, lure, bait, hook = true})` | §4 steps 4–6 on a `placePool` list → `[{sp, w, g}]`: open water × `areaWeight` (no area: the tilt), a place × the tilt, × `hook.mult[g]`; `hook: false` stops before the hook (**who is there**) |
| `finishPool(entries, {giant, lure, bait, phase, wickId, D})` | §4 steps 10–11: the giant's share drawn last from the rest (in or off its hour; ×`LOOP.lures[lure].share` with the giants' lure that names it; Taper ×`giantShare` under `giantCap`: LANE 4's `lurePool` rule moved here; a grade-0 giant ×0.1), then every grade-0 entry `min(w, 0.01 × S)`, S the takers' (grade ≥ 1, or no row) summed weight. `takersSum(entries)` |
| `castOdds(D, {pool, area, phase, lure, bait, wickId, rb, rule, taperFirst, preroll, comeback})` | the cast's whole distribution → `{entries: [{sp, p, from: 'comeback' \| 'preroll' \| 'pool', z?, g, giant?}], S, taper, waited}`, the `p` summing to 1. The comeback `{sp, z}`: p 1 when its grade is ≥ 1 and its bait fits, else it waits (`waited`). The pre-roll `{sp, z, base}`: the bait-only gate, Taper's refusal of a common, then `takeChance(base, g)`; the pool gets the rest, without that species when its grade is 0 (a stray's whole cast is exactly 1%). The pool: `hookWeights`, the rarity bonus (uncommon ×(1 + 2rb), rare ×(1 + 4rb)), the rule's makers ×`tilt` on takers only (a rule without makers: the flag-off `predators` / `bottom` family tilt), F17 judged on the takers, Taper's first bite judged on the takers (`taper`: the rule served), `finishPool`. `drawOdds(odds, r)` draws one entry; `castShare(odds, id)` |
| `gearCap(D, fishId, {lure, bait, line})` | GEAR-GATES §4.1: `{cls, z, by}` the largest class this hook and line land (the lowest of `LOOP.gearCap.grade[grade]` (a stray 'keeper'), `.item[the free hook]` and `.line[min(tier, 2)]`; ties item, line, grade; z `classMaxZ[cls]`, Elder the size top), or null (no row, the legend, no `LOOP.gearCap`). fishing's `rollSize` sets `S.overCap` above it (evening 1 and the tutorial clamp to it instead); the strike's land chance is then 0 with the cause `snapped` (by the line) or `thrown`; `fish:escaped` carries `overCap: {by, cls, z, key}` (`key` the `TEXT_LOOP.gate.away` line; ui-hud-v3 shows it in the "Hook set" slot on a trip); the ledger's `onEscaped` stores Ashwick's comeback at `z − 0.001` and `run.flags.capLost` (→ `lastTrip.away`, Murk's `firstAway`) |
| `bitesTable(D, {lure, bait})` | `[{id, share, bare}]`: each fish's share of open water's bites over an evening (the lights weighted by `LOOP.evening`) on that item alone, beside the bare hook's; WC-3 renders it |

**The rule object** (pinned for WC-2; a sign's or a silhouette's cast rule, `S.signHit.rule`): `{kind, id, inSign, form?, waitMult?,
takeWaitMult?, preroll?: {chance}, makers?: string[], tilt?: number, favour?, spook?, respond?: string, predators?, bottom?}`. `makers`
and `tilt` (3) are the tell's species tilt on the Mossmere under the loop; `predators` / `bottom` the flag-off game's family tilt.
`waitMult` multiplies the wait of every cast that met the rule (a rise 0.5, the other tells 0.65, a silhouette's spook 1.5);
`takeWaitMult` (a silhouette's 0.3) when its pre-rolled fish took. A pre-roll is `S.prerolls.get(sign.id)` = `{sp, z, base?}` (`base`
falls back to `rule.preroll.chance`).

**`src/fishing.js`** (WC-1's regions): `castInfo` stores **`S.cast.area`** (the open water's `areaAt`, with the world's probe, docks,
hulls and `laneFor(run.evening, phase)`; `null` in a place, the mist or another water). **`loopPool(baitId, phase, placeId, {area,
hook})`**: on the Mossmere `{...placePool, list (the step's weights), entries ([{sp, w, g}]), area, hook}`: `hook: false` is who is there
(steps 3–5), else what this hook brings (steps 3–6, the fitted lure); omitted `area`, the tilt alone; every other water keeps
`lurePool`. `rollSpeciesLoop` draws once from `castOdds` with the seeded `rnd` and sets `S.prerollSp`, `S.prerollZ`, `S.prerollTook`,
`S.comeback` (so `consumeComeback` runs only when the comeback's entry is drawn) and `S.taperRule` from the drawn entry. LANE 5C's snag
block after `S.species = sp` is untouched. Debug: `fishOdds()` (the last cast's odds, never on screen) and `fishPoolRoll`'s `shares`.

**`src/data.js`**: `LOOP.cost = {factor, shipped: LOOP_COST_SHIPPED (2), consumables: 1}`. `shipped` is the factor the game plays
at (the user, 16 Nov 2026: "For now just double the original costs"; WATERCRAFT.md §8 designed ×3, the sim fits ×4: the lead's one
number to change). **`loopCostFactor(g)`** (pure) gives `factor` for a load: a preset `GW_LOOP_COST` (a positive number) wins; else a
browser page (a `document` and a `location`) plays at its `?cost=N` (a positive number) or at `shipped`; node tools and tests play at
×1 (base prices) unless they preset `GW_LOOP_COST`. Old browser scenarios that buy with given clams load with `?cost=1`.
**`loopCost(base, {consumable})`** = `nice(base × factor)` (a consumable × `consumables`; a factor of 1 gives the base); **`nice(x)`**
(to 5 under 100, 10 under 1,000, 50 under 10,000, 100 above); **`loopLight(phase)`**. The game applies the factor at step P
(progression-loop's `mapCards`, the end of `shelfItems`, the legend's pay); the sim prices M1 at `shipped` (`clams.mjs --factor=F`
overrides; a preset `GW_LOOP_COST` is kept; the full road keeps the prices before v8.7). `TEXT_LOOP.shelf`'s seven tin
and lure lines (SPEC §8.11) and `TEXT_LOOP.log` {`whoBites`, `bare`, `under` ("<1%", the gear log's one share word), `unmet`, `gear`}.

**Tests**: `tools/tests/watercraft.test.mjs` (the areas, the bake, the fit, the user's rule over every pool and cast type, the tip,
pre-rolls, the comeback, Cut Strip); `tools/tests/loop-watercraft.test.mjs` (through `fishing.js`); `validate-data --loop`'s WC-1 checks;
`tools/sim/clams.mjs --shipped=mossmere --step=5` (the three players, the user's rule, every pool bites, every fish catchable, the areas
add nothing, T104 extended).

### 14.19 (placed before 14.11 to merge cleanly beside the sections appended after 14.15) The tackle tin: bait and lures changed on the lake

The user's words (16 November 2026, play-testing): "We should have an option to equip bait or change lures whilst out on the lake". It
supersedes SPEC §16 answer 43's "at home only" for the hook. The ledger already let `fit('bait', id)` and `fit('lure', id)` write the run's
line on a trip; this adds the rule of *when*, the one call that changes the hook, fishing's quiet reel-in, and the tin on the trip's HUD.

**The rule (pure, `progression-loop.js`)**: `HOOK_BUSY` (`['bite', 'reeling', 'landing']`) and `hookChangeable({trip, state, fishOn,
card})`: at home always; on a trip unless a fish is on, from its class tell and the bite through the hook, the play, the show and its
card (a catch's `flags.pendingCatch` or progression's pending card, a find's `flags.pendingFind`). Idle, charging, casting, waiting
before the tell and the reel-in after a pass or a loss may change.

**`ctx.progression.loop` (two methods, in `LOOP_METHODS` and the fixture's `fakeLoop`)**
- `canChangeHook()` → boolean (`hookChangeable` on `fishing.hookLine()` and the card; false off the loop).
- `changeHook({bait, lure})` → `{ok, changed, reeled, bait, lure, count}` or `{ok: false, reason: 'fish' | 'bait' | 'lure' | 'off'}`.
  `bait`: a bait the bag holds (the legend's ball, a tin of the water, Cut Strip: what `fit('bait')` takes), `null` a bare hook, or
  `undefined` to leave it; `lure`: an owned lure, `null` none, `undefined` to leave it. Every check runs before anything moves (the
  cast's own bait counts whole). A line out with no fish on it comes in first through `fishing.reelInQuiet()`; then the existing paths
  `fit('bait', …)` and `fitLure(…)` write `meta.loop.fitted` (saved at once: what the Chart shows at home) and the run's line
  (`run.equippedBait`, `run.lure`), so the next cast carries the new choice. A bare hook takes the run's line bare even when the bag had
  moved it onto another bait. Emits `loop:hook {bait, lure, reeled}` on a change (beside fit's `bait:change` and `loop:fit`). At home it is
  the Chart's fit. **The one API for every view**: the Chart's slots may keep calling `fit`; Taper's Sheet (`gw-mvp-sheet`, its tap-to-fit
  home only today) switches to `canChangeHook` / `changeHook` at merge, so a tap on the sheet on the lake changes the hook as the tin does.

**`fishing.js` (two API methods; `debug.fishing()` adds `castInfoBait` and `castBait`)**
- `hookLine()` → `{state, out, fishOn, castBait}`: `fishOn` from the class tell (`S.tell` while waiting) and the bite through the hook,
  the play, the show and its card (`view.show.phase === 'card'`); `out` a line in the water with no fish on it (casting, or waiting
  before the tell; never a mist cast); `castBait` the bait out on it (`S.castBait`).
- `reelInQuiet()` → `{ok, refunded, baitId}`: only while `out`. The cast's bait goes back through `progression.refundBait` (once a cast,
  its own guard; a legend's ball is spent only at her hook, so nothing comes back for it); the float reels in as after a pass
  (`toLost(reelInTime)`); `fishing:reelIn {quiet: true, refunded, baitId}` for the sound. No `fishing:miss`, no `fishing:escaped`, no
  lost-fish line, no bite counted (`noteBite` runs at the bite), no favour, mercy or streak touched; Taper's first bite and Ashwick's
  comeback are spent only at a bite, so they wait for the next cast. The hook table and its 1% cap are untouched: they read the bait at
  the cast (`castInfo`), and the next cast's `castInfo.baitId` is the new bait.

**The view (`src/ui-tackle.js`, built by `ui-loop.js`'s `createLoopView`; its CSS `#gw-tackle-css`)**: `createTackleView({K, L, D})` →
`{update, toggle, paint, isOpen, open, close, tin, debug}`; `ui.loop.tackle`. The tin sits in the HUD's top-left corner under the hold
row (the old gear glyphs, `.gw-gear-hud`, make way: `.gw-hud.gw-tk-on`), on a trip once `loop.tutorial().done`; its compartments show
the bait on the hook (the cast's while a line is out) with its count left and the lure (a bare hook and no lure drawn plainly). A tap, a
click or **B** (ui-loop's `handleKey` gives B to the tin before `tripKeySwallow`) opens the drawer: modal `'tackle'` (blocking: the
evening waits; quiet: no `ui:modal`), anchored under the tin on a desktop, a bottom sheet when the window is under 700 px wide or a touch
screen under 560 px tall. Two rows, **Bait** and **Lure** (`tackleModel(D, {run, metaLoop, line})`, pure): each item a button with its
engraving (`murk-engrave.engrave`, `artCard`), its name (the shelf's) and, for a bait, its count; the one on the hook `aria-pressed`.
While a fish is on the tin's contents dim (`.gw-busy`) and a tap or B gives `denied` and one line, `TEXT_LOOP.tackle.after`. Sounds:
`ui_click` (low) as the lid opens and on a change; `reel_ratchet` (light) as a reeled-in line comes in when the drawer closes. No odds,
no percentage, no "likes" anywhere on it (those live in the logs).

Selectors: `[data-loop=tin]` (the tin; `data-bait`, `data-lure` carry what it shows, `''` for none), `[data-loop=tackle]` (the drawer),
`[data-row=bait|lure]`, `[data-bait=<id>]` / `[data-lure=<id>]` (an item; `''` the bare hook / no lure), `[data-action=close]`.
**Words**: `TEXT_LOOP.tackle {tin, bait, lure, bare, none, after}`. **Tests**: `tools/tests/loop-tackle.test.mjs` (the rule across the
states, a change mid-wait, refusals, the lure, the bare hook, the last bait out, the ball, home, the real `fishing.js` half, the model and
its words); `tools/tests/loop-tackle.scenario.mjs` (the browser: desktop 960×540, 1280×720, 900×1000; `--mobile` 390×844, 358×664,
844×390).

### 14.11 M1 step 3a's seam: the places, the giants, the legend, the catalogue (`docs/loop/m1-step3a/PLAN.md` §2.0, §3)

The seam commit's names, so lanes B, C and D code against names that exist (PLAN §3's stub rule: data and pure helpers are imported
directly; a neighbour's runtime object is read through optional chaining, an absent one meaning the built behaviour).

**data.js** (always exported; read by built code only under the loop):

| export | what |
|---|---|
| `LOOP.places` | the Mossmere's four in the Chart's order, `{water, kind, price, card, giant?, own?, draws?, legend?}`: `lily_maze` (day, 60, the Candlefin Koi; draws koi ×3, carp ×1.5), `under_the_span` (old, 150, the Thousandcast Pike, its giant; its own the Bridgechain), `buoy_lights` (night, 260, the Hullkiss Lamprey, its giant), `bell_pool` (crown, 500, the Belled Matriarch, its legend). Never `LOOP.waters[w].places` (a lake map's, migrateLoop rule 5) |
| `LOOP.place` | the place pool's weights (the sim's): `common` 0.5, `dayDraw` 1.5, `kindWeight` 2.5, `kept {weight 3, live 0.5}`, `favour {base 0.15, window {day 0.4, old 0.4, night 0.3, crown 0.2}}` |
| `LOOP.giant` | `share {inHour 0.06, offHour 0.025}`, `favour` 0.3, `minZ` −0.25, `fight` 10, `elderFight` 2, `markedHold` 6 |
| `LOOP.legendBait`, `LOOP.lift`, `LOOP.giantBack`, `LOOP.mist`, `LOOP.redress` | `{mossmere: {id: 'heartmoss', price: 60}}`; `{thin 3, title 1.2, back 0.6}` s; `{every [25, 45], dur 2, phases ['gloomtide'], places [under_the_span, buoy_lights]}`; `{inside 0.35, ease 0.8}` (a bank's whole opacity while the raft is inside it); `LOOP_ENABLED && GW_REDRESS === true` (false unless `?redress=1`) |
| `LOOP.hold.shelfMax`, `LOOP.species.mossmere`, `LOOP.kept` | 6 (Hold 6, the Wellbox, 450); the open water's twelve (+ the Kissmark Trout); + `bridgechain_sturgeon` |
| `TEXT_LOOP` | + `maps.{lily_maze, under_the_span, buoy_lights, bell_pool}` (SPEC §5.2's lines), `shelf.heartmoss`, `comingSoon`, `murk.{firstMap, firstGiant, legendFirst, listComplete}` (SPEC §8.6's strings), `tabs.giants` (the ★ tab's accessible name) |
| `LOOP_PLACE_KEYS` | the fields a loop place keeps of its `MOSSMERE_V3` record: `id name x z access stand water landmark look build` |
| `loopPlace(id)` | `LOOP.places[id]` over its `MOSSMERE_V3` record, a fresh object: the geometry fields, `area` (the record's `water` footprint), `zone` and `water` (the water's id), and LOOP's fields; `null` for an unknown id |
| `loopPlaceIds(waterId = 'mossmere')` | the water's places in the Chart's order |
| `loopHours(sp)` | a species' window in the sim's words (`['day', 'dusk']` …): a roster `time` by `HOUR_WINDOWS`, a built one (calm, gloom, dawn) by the built words |
| `giantShare(sp, phase, wickId)` | inHour in its hours, offHour outside; a Wick's `giantShare` (Taper ×1.3) never above its `giantCap` (0.12) |
| `placePool(species, {placeId, phase, bait, wickId, water})` | the sim's pool rule (the fixed `poolFor`) on the game's records: `{list: [[sp, w]] (every fish but the giant), giant: {sp, share, weight} \| null, tot, place}`; a night place before `gloomtide` is open water |
| `ROSTER_ART` | + the Thousandcast Pike (`bars: 'upright', eyeRim: 'amber'`), the Hullkiss Lamprey (`mouth: 'disc', teeth: 'amber', gills: 7, gillGlow`), the Kissmark Trout (`fattyFin, jaw: 'plain', spots: 'stars', scar`), each in its `model`; `bridgechain_sturgeon.model` `{scutes: 'rust', snout: 'shovel'}`, merged over its built model under the loop |
| `LOOP_BODY_K` | + `lamprey` 0.0022 |
| `LOOP.places[id].out` | a place's own glide out from the Jetty, `[[x, z], …]` from `docks[0]`: only the Lily Maze's (`[[24, 38], [18, 32.5], [11, 31]]`, 15.3 m: the straight glide toward its centre passes the statue at (8, 36) 0.5 m from its collision) |
| `loopSailPlan(dock, {water, place}, T = LOOP.tutorial)` | the glide out of a Sail (PLAN CHOICE 7), `sailPlan`'s shape `{from, to, yaw, path}`: a place's own `out` path, else `T.outDist` (15) m toward its centre; no place (or an unknown one): the water's glide (`sailPlan` with the lake, 1a's T66 unchanged). `validate-data --loop` (T118) proves each clears every island and pillar by the raft's radius + 0.3 m. Lane B's `sail({water, place})` calls it |

The land chance by id (M1 step 3a): `catchChance`, `catchParts`, `catchOdds` and `catchClassAllowed` resolve a species id through
`SPECIES_BY_ID` first under the loop (the converter's roster records, which `SPECIES_V3_BY_ID` lacks or holds as built), else
`SPECIES_V3_BY_ID`; off the loop as before. (On M the Likely Chub, the Overbold Bass, the Rustfin Sucker and the Milkeye Perch read
`null` by id, and fishing's `catchChance(sp.id, …)` fell back to `CATCH_V3.floor`.)

The apply block, under `if (LOOP_ENABLED)` only: `SPECIES_LOOP` is the twelve, then each place's own fish and giant (the Bridgechain
lifted, its `weather` dropped; the Thousandcast and the Hullkiss, epic, `giant: true`, `place` from the converter's `placeIdOf`); the
Gloam Eel's SPECIES record is a copy in its slot with `kind: 'night'`; `FISH_SHAPES` += `lamprey`, `sturgeon`, `trout`;
`CATCH_V3.rarity.epic = rare + LOOP.giant.fight − CATCH_V3.kept` (a giant is not a place-kept fish: its net Fight is the sim's rare +
10) and `elderRarity.epic = rare's + elderFight`; `AUTOFISH.show.poseRules.thin` += `lamprey`; `ZONES[0].arena.places` (and so
`PLACES`, `PLACE_BY_ID`) are the four through `LOOP_PLACE_KEYS` plus `kind` and `zone`: no `rule`, `attract`, `maxClass`,
`holdsGiants`, `giantsKept`, `reveal`, `tally` or `tallyAt` reaches a built reader. `BAITS`' Heartmoss Ball keeps its built price.

**core.js**: `resolveRedressFlag({preset, search}) → {on, source, apply}`, `applyRedressFlag(g)` (a page only: `?redress=1` writes
`GW_REDRESS = true`), `REDRESS_FLAGS` (declared beside `LOOP_FLAGS`, before data.js evaluates).

**roster-species.js**: `placeIdOf(name)`; a rare giant's record carries `place`. **roster-shipped.js**: + `kissmark_trout`,
`thousandcast_pike`, `hullkiss_lamprey` (`tools/roster-export.mjs` `SHIPPED`).

**progression-loop.js** (pure): `listFor` (a fish of a place, or of a non-open `kind`, counts only when its water's lake map opens that
place or kind: the Mossmere's list is its twelve) · `mapCards(D, metaLoop, {meta}) → [{id: 'place:<id>', placeId, kind, price, fish,
line, hours}, …(≤ 2), {id: 'lake:<id>', waterId, sealed, price, seals}]` · `sealsOf(meta, D, waterId = 'sporewood') → {map: {held,
price, shipped}, gear: {held, slot, tier, item}, catch: {held, have, need}}` (a superset of 3b's `chartNext` seals) · `liftDue(D,
metaLoop) → placeId[]` (owned, not lifted, in price order) · `catalogueFor(meta, D, waterId) → {head: {waterId, name, have, need,
seals | null}, list: Entry[], groups: [{placeId, kind, owned, name | null, entries}], finds: null}`, Entry `{id, caught, giant, legend,
hours: ('sun' | 'dusk' | 'moon')[], place: 'open' | 'day' | 'old' | 'night' | 'crown' | null, bait}` (never a number).

**`ctx.progression.loop`** (`LOOP_METHODS` += these): `fit(slot, id) → {ok}` · `fitted() → {lure, bait}` · `spendBait(id) → bool` ·
`refundBait(id) → bool` · `liftDue() → string[]` · `markLifted(id)` · `lifted() → string[]` · `markGiant(id)` · `takeGiantMark(id) →
bool` · `noteBest(fish, key)` · `setPick({water, place})` · `pick() → {water, place} | null` · `mapCards()` · `seals(waterId)` ·
`catalogue(waterId)`. In the seam commit the reads were real and the writers inert stubs; the ledger's delivery (lane A) makes every
one real:

- `fit('bait', id | null) → {ok, id, count}`: the bait slot takes a legend's bait (`LOOP.legendBait`; 3a: the Heartmoss Ball only) that
  the bag holds (the trip's `run.bait` on a trip, else `meta.loop.bait[its water]`), or `null` to unfit; refused (`{ok: false}`) with
  none left, for any other bait and for the lure slot (step 4). Saved in `fitted.bait` at once; `loop:fit {slot, id}`; on a trip the
  line carries it (`run.equippedBait`, `run.equipped`, `bait:change`). `createTrip` puts the fitted ball on the line when the bag holds
  one; the tally takes a ball with none left off the slot.
- `spendBait(id) → bool`: on a trip, one of a legend's bait out of `run.bait`, **once a bite** (`run.flags.biteN`, counted by
  `noteBite`; a second call in the same bite is `true` and spends nothing): progression's `fishing:hook {speciesId}` of a legend spends
  through it, so fishing may call it too at her hook. `refundBait(id) → bool`: gives back only the ball this bite spent (a pass), once,
  and puts it back on the line if it is fitted. The cast never spends a legend's bait (the built `consumeBait`).
- `markLifted(id) → bool`: an owned `LOOP.places` id not yet lifted: `lifted` gains it, saved at once (`game.save`).
- `markGiant(id) → bool`: a giant (`giant: true`, not the legend): `giants[id].marked = 1`. progression's `fish:escaped` calls it for a
  giant lost at its own place (`e.place === sp.place`), for every Wick, at any class; Ashwick's comeback never takes a giant.
  `takeGiantMark(id) → bool`: the mark, once (fishing adds `mods.marked`, +`LOOP.giant.markedHold` Hold, on that hook).
- `noteBest(fish, key?) → bool`: the key is `key`, else `fish.waterKey`, else `loopWaterKey(fish.place, zone)`, and counts only when it is
  a `LOOP.places` id or `open:<water>`; written as `{speciesId, length}` when the fish is the heaviest there by `data.fishWeight`.
  progression's `measure` calls it on a trip, and sets `fish.giant = true` on a giant's fish (the hold's gold edge, the tally's last).
- `setPick({water, place}) → {ok, pick}`: an open water (`isOpen`) and `null` or a `LOOP.places` id of that water the save owns; refused
  otherwise. 3b's `ui-chart.js` may write the same shape to `meta.loop.chartPick` itself; `pick()` reads either.
- **The shelf** (`shelf()`, `buy()`; pure `shelfItems(D, metaLoop, session, {meta})`): the Bait tab's `{id: 'bait:heartmoss', tab:
  'bait', slot: 'bait', baitId, water, name, line: TEXT_LOOP.shelf.heartmoss, price: 60, count, consumable: true, bought: false}` (always
  on the shelf of its owned water; never "Yours."; `buy` adds one to the bag); the Maps tab is `mapCards`'s cards, a place card `{id:
  'place:<id>', slot: 'place', placeId, kind, name, line, price, fish, hours, bought}` (`buy` adds it to `maps.places`; bought while the
  shelf is open it keeps its slot as `bought: true` and the next card takes the slot when the shelf closes: never more than three), the
  next water's `{id: 'lake:<id>', slot: 'lake', waterId, name, sealed, seals, price: null while sealed}` (`buy` refused while sealed).
  `goalOf` skips consumables and sealed cards. Hold 6 (450) after Hold 5 is the shelf's last hold step.

**The save** (`LOOP_SCHEMA` stays 3; the fill gives every block the new keys): `meta.loop.lifted: []` (place ids whose lift has played),
`best: {}` (`<placeId | open:<water>>` → `{speciesId, length}`, never a weight), `chartPick: null` (`{water, place}` once picked; filled
as `null`, never an object, and a non-object is read as `null`). `maps.places`, `bait.mossmere.heartmoss`, `fitted.bait`,
`giants[id].marked` and `said` are 1a's fields, now used. `tools/tests/fixtures/loop-save-m1s2.json` is the step-2 save every 3a save
test opens.

**Events and APIs** (PLAN §3.4): `place:lift {placeId, phase: 'start' | 'title' | 'end', name}` (B) · `fishing:mist {placeId}` (B) ·
`world:giantBack {placeId, x, z}` (D) · `chart:pick {water, place}` (C) · `loop:fit {slot, id}` (A) · `loop:buy` items `place:<id>`,
`hold:6`, `bait:heartmoss` · `loop:seal {seal: 'catch'}` (C) · `world.setPlaces({lifted, owned})`, `world.liftMist(id, s) → bool`,
`world.placeAnchor(id) → {x, y, z}` (D) · `render.frameLandmark(p, {dur, back}) → bool` (D) · `game.sail({water, place})`,
`game.lifting() → placeId | null` (B) · `ui.loop.openShelf({tab, focus})`, `screens.openJournal({from: 'chart', zone})` (C) ·
`ctx.debug.ui.chartList(on)`, `ctx.debug.ui.hatchProbe(id, w, h)` (C) · `ctx.debug.world.places()` (D).

**Lanes B, C and D as delivered** (the stage, M1 step 3a):

- **main's game API** (B): `game.sail({water, place})`: a `place` key given (a place id, or `null` for open water) is saved as the
  pick (`loop.setPick`); with no `place` key the Chart's saved pick of that water is sailed to (3b writes it on a tap). An owned
  place's glide out is `data.loopSailPlan(dock, {water, place})`, kept only while it clears the live obstacles by the raft's radius +
  0.3 m (else `loop-rules.placeGlide`, its bearing turned the least that clears; none: open water's glide); a place not owned: open
  water's glide. `game.lifting() → placeId | null` (the lift playing now). The lift (`loop-home.js`): after the glide out and
  `run:start` (never on a Continue), each `liftDue()` place in price order: `ctx.cinematic` on, `place:lift {placeId, phase: 'start',
  name}`, `world.liftMist(id, LOOP.lift.thin)` and `render.frameLandmark(world.placeAnchor(id) ?? its landmark, {dur, back})`, at 3 s
  `{phase: 'title'}`, at 4.2 s `{phase: 'end'}`, `markLifted`, `world.setPlaces`; a tap or a skip key ends it at once
  (`liftMist(id, 0)`, `frameLandmark(null, {back})`); reduced motion skips the thinning; no cast, no raft move and no Home during it.
  `world.setPlaces({owned, lifted})` at `run:start`, `home:enter`, `loop:buy` and after each lift.
- **Fishing** (B): on a trip `rollSpecies` draws `data.placePool` at the cast's place (the giant's share set last, so it stays exact;
  `speciesPool` and the signs never carry a giant); `waterAt(p).mist === true` over a place not owned or not yet lifted; a cast into a
  bank emits `fishing:mist {placeId}`, the float sinks into it and rises (`fishing-fx` `setMistFloat(visible, x, y, z, alpha)`,
  `mistWisps(x, z, k)`), idle again in about 2 s, no bite, the bait kept; `capZ`'s loop branch (Elders in old water, or a giant at its
  own place); a giant lost at any class is `fish:escaped {markedFish: true, place}`; her hook spends the ball through
  `loop.spendBait`, a Marked giant's hook takes `loop.takeGiantMark` (`mods.marked`). Under the loop the legend pool's still ring is
  never drawn (no ring round the raft) and the built legend toast never shows.
- **`loop-rules.js`** (B): `glideClearance(path, obstacles) → m` · `placeGlide(sailPlan, dock, centre, T, obstacles, {clear, step,
  max}) → plan | null`.
- **Sound** (B): `src/audio-mossmere.js` (pure: `mossLight`, `mossOn`, `bedLevels`, `bedBreath`, `PLACE_VOICES`, `EARSHOT`,
  `voiceGain`, `BANK`, `bankVoice`, `placeVoiceAt`, `giantRollOn`, `ROLL_EARSHOT`, `MOSS_EVENTS` …); `audio-sfx.js` `SFX_MOSS` /
  `MOSS_SFX` (ten sounds); `giant_roll` on `world:giantBack` at night, `mist_lift` on `place:lift {phase: 'start'}`, `seal_press` on
  `loop:seal`. `tools/audio-render.mjs --set=mossmere`.
- **The screens** (C): `ui.loop.openShelf({tab, focus})` (`tab` tackle · raft · bait · maps; `focus` a place id or a card id); the
  view's `renderChartList`, `baitSlot(model, {onFit})` (`[data-slot=bait]`), `placeBaitSlot(root, model, entry)` (before
  `[data-action=sail]` in whichever Chart's foot is drawn: the list's, or 3b's drawn foot), `sealRow`, `chartList(on)`; the list's
  rows `[data-place]` and `[data-action=catalogue]`; `screens.openJournal({from: 'chart', zone})` is the catalogue under the loop
  (cards `[data-species]`); `chart:pick {water, place}` and `loop:seal {seal: 'catch'}` emitted; the lift's title card on `place:lift
  {phase: 'title'}`. Pure (`ui-loop.js`): `chartNext` (one: 3b's rule, its seals `sealsOf`'s) · `chartPlacesOf` · `chartRows` ·
  `baitSlotModel` · `mapArtSizes` · `MAP_ART` · `catalogueView` · `giantsView` · `liftTitle` · `saleLineId`. `ui-fishart.js`:
  `setLoopArt(on)` (the loop's 2D `trout`, `sturgeon`, `lamprey` plans), `drawFish(…, {hatch: true})`, `hatchProbe(sp, w, h)`.
- **The world** (D): `src/world-places.js` (built only under the loop); `world.setPlaces({owned, lifted})`, `world.liftMist(id, s)`
  (`s` 0: at once), `world.placeAnchor(id) → {x, y, z, r, face?, side?, elev?, dist?}` (the place's water centre and radius; a path's `face`, its unit normal, turns the lift's lens to its broadside: the stage; a place's own crane, the Bell Pool's: `side` [x, z] the lens's side, `elev` deg, `dist` m, looking at its bell: the fix pass), `world.places()`
  (its `dressing` {pads, caps, decals, chains, piers, …} and `cut`, the Span's cutaway); under the loop world.js holds the legend pool's gold glimmer while
  `placesVis.openAt(x, z)` is false (its place's bank standing or lifting);
  `world:giantBack {placeId, x, z}` (at `gloomtide`, in a standing Under the Span or Buoy Lights bank); `world-art.js` `opts.redress`
  (W9's rest, only with `LOOP.redress`); `render.frameLandmark(p | null, {dur, back})` (null: ease back now; p carries the anchor's
  `r`, `face`, `side`, `elev`, `dist`; `render-camera.js` `landmarkShot(raft, p, {yaw, aspect, obstacles})`, `shotBlocked(pos, look,
  obstacles, {clear, cone, vhalf})`, `landmarkWeight`; render passes `world.getObstacles()`, and the lens steps round an island in its
  line or frame: the fix pass); `models-fish.js` `lamprey`, `sturgeon`, `trout` (read only under the loop). `ctx.ui.loop.debug()` adds
  `titleClash` (a Murk line on screen with a lift's title card or a legend's name card: never, the fix pass).
- **Debug hooks** (debug builds, the loop only): `ctx.debug.loop.own(id | 'all')`, `.lift(id | 'all', {play})`, `.giveBait(id, n,
  {fit})`, `.at(placeId)`, `.places()`, `.chart(cmd, arg)` (3b), `.homeState()` (+ `sailPlace`, `lift`) · `ctx.debug.fishPoolRoll(n,
  {place, bait, rb})` · `ctx.debug.audioMoss()` · `ctx.debug.ui.chartList(on)`, `.hatchProbe(id, w, h) → {pixels, offHue, maxInk,
  inner}`, `.catalogue()` · `ctx.debug.world.places()`, `.giantBack(id, near)`.

**The sim** (`tools/sim/clams.mjs`): `poolFor` gives a giant at its place its share whatever the hour (its offHour share outside its
hours; PLAN CHOICE 27), and `data.placePool` is the same rule; its data check compares `SPECIES_LOOP`'s fifteen with its own table.
`MOVED` += `place`, `giant` (read from `data.LOOP`; T42); T104 prints the check of `data.placePool` against `poolFor` in every mode
(90 pools, every share within 1e-9, each giant's share exact).

**The fixture** (`tools/tests/loop-fixture.mjs`): `placesMeta(D, {own, lifted, balls, holdSlots, tackle, caught})`; `fakeLoop` carries
every new method on its own state (`fitted`, `bag`, `lifted`, `marked`, `best`, `chartPick`; `mapCards`, `seals`, `catalogue` through
the real pure functions).

### 14.15 (placed before 14.12 to merge cleanly beside lanes 4 and 5B's appended sections) M1 step 5c: the Mossmere's finds (lane 5C; `docs/loop/FINDS.md` §12, M1.md §2.16, §2.17)

The seam as built (MVP), additive to everything above; under `data.LOOP_ENABLED` only.

| where | what |
|---|---|
| `data.js` | `LOOP.finds` (`FINDS.md` §10: `snag {perBite 0.05, firstEvening 0, legendCast 0}`, `kind {share 0.35, step 0.15, cap 0.8}`, `parts`, `grades` (shares of ALL the water's snags, the jackpot exactly 0.01), `haul`, `hold` (+ `jackpot`), `tin`, `items` (the Mossmere's eleven: `{id, water, kind, grade?, effect?, slot?, wearer?, pose, size, bait?}`)); `TEXT_LOOP.finds {snags, biteIn, items: {id: {name, line}}}`, `TEXT_LOOP.murk.firstTreasure / firstPart / firstJackpot`; **`findShares(meta, D, waterId, {exclude})`** (the one draw: the roll and the catalogue); `goodBitesFor({…, extra})` (a bite part's +1, open water only; default 0) |
| `loop-finds.js` (new, pure) | `findsOf`, `findById`, `findName`, `findLine`, `findValue` (`tier × x × priceFactor`), `findPose`, `findHaul`, `findHoldBeat`, `fillFinds`, `owned`, `findShares`, `drawFind`, `snagChance`, `noteSnag` (the soft guarantee), `findBiteBonus`, **`findOrderBonus(metaLoop, D, waterId = barge.water)`** and `findOrderWater` (the bell's order: see below), `findBaitFloor(metaLoop, D, waterId, bedFloor)`, `holdEntry`, `findTallyLine`, `findTallyGroup`, `bookFinds`, `findCatalogue` (catalogueFor's finds half), `fmtRate`, `snagHeading` |
| `progression-loop.js` | `meta.loop.finds = {got: {findId: n}, worn: {slot: findId}, share: {waterId: kindShare}}` (in `freshLoop`, filled by `migrateLoop` for every block: **no schema step**); a find in the hold is `run.creel[i] = {uid, find, kind, grade, clams, waterKey, water}`; `tallyLines` puts finds after the fish (treasures by value, the jackpot last, then parts and looks), `tallyBook` counts each into `finds.got`; `catalogueFor(…).finds`; the ledger's new methods (in `LOOP_METHODS`): `snagRoll({legendCast, tutorial, rng, force})`, `noteFound({findId, waterKey})` (the guarantee moves, the open bite closes, the entry is saved as `run.flags.pendingFind` until the card is answered; → the hold entry), `restoreFind()` (Continue: the saved card's entry to reopen, or null; an unknown find gives its bite back), `keepFind(entry)`, `letGoFind(entry)` (the bite back, no favour; both clear `pendingFind`; `endTrip` clears it too), `finds()`, `findShares(waterId)`, `findCatalogue(waterId)`; `goodAt` passes the bite part's `extra`; `createTrip` tops the bag of the bollard's bait up to `findBaitFloor` (the Bed's floor in baits: `LOOP.home.baitBed.floor[level − 1]` when lane 5B's table exists, else 0) |
| `fishing.js` | **the snag roll is its own step** right after the species roll in `rollBite` (`S.find`; the species roll above it may change freely); a snag has no nibbles, its tell is `sinkUnder`, its bite `sizeClass: 'find'`, its land chance 1 and its plan `fishing-play.findPlan(dur, seed)` (no runs; `LOOP.finds.haul` by pose; hurried as a small fish); `caught()` → `caughtFind()`: `fishing:found`, then the show with the prop (`models-finds.createFindProp`) in its pose and beat; `presentShow` / `abortShow` never measure a find; debug: `ctx.debug.forceFind(id, opts)` (debug builds only) |
| scene | `models-finds.js` (new: the eleven props, ≤ 400 triangles each), `actors-show.js` (a find row: no flaps), `actors-finds.js` (new: `findHomeParts` merged into the barge's timber and glow by `actors-home.js`'s `setVariants` (two lines); `createFindLooks` (the raft's vane, the rod's tassel) hooked in `actors.js`) |
| screens | `ui-finds.js` (new: the find card as the `catch` modal, opened at the show's card; `drawFindArt` (ink or the hatch); `findsRowView`; `renderFindsRow`; `ctx.debug.finds = {force, give, take, state, keep, letgo, catalogue}` in debug builds); `ui-loop.js` (the hold's find cells, the tally's find rows, `catalogueView(…).finds`, Murk's three find lines in `saleLineId`, the finds row's words on the allow-list); `ui-screens.js` (the finds row before Odds ›); `ui.js` builds the view (`K.finds`, `ctx.ui.finds`) |
| **the bell's order (lane 4's seam)** | lane 4's order engine (`src/loop-gear.js`) counts the board as `orderCount(D, metaLoop) + findOrderBonus(metaLoop, D)`: 1 more order once Order Board I is owned (`home.orders ≥ 1`) and the Rust Buoy-Bell is fitted (`finds.got.buoy_bell ≥ 1`), only while the barge lies at the bell's water (`barge.water`); the extra order names a fish of `findOrderWater(metaLoop, D)` |
| tools | `validate-data --loop` (FINDS §10's checks), `tools/tests/loop-finds.test.mjs` (FINDS §12's node tests, the 1% rule), `tools/tests/loop-5c.scenario.mjs` |

### 14.12 The home barge and its mooring (M1 step 5a; `docs/loop/M1.md` §4 step 5a, SPEC §6.1, §6.5)

Under the loop only (`data.LOOP_ENABLED`); off it none of this is built or read.

| where | what |
|---|---|
| `data.js` | `LOOP.barge = {length: 12, beam: 3.6, keel: {n: 5, r: 1.8, step: 2.4}, murkR, reach, arc}`; `LOOP.mooring[water] = {dock, hull: {x, z, yaw}, murk: {x, z, yaw}, lane: [[x, z]], cam: {pos, look, fov, portrait}}` (the raft's tie-up at the stern **is** `docks[dock]`); `loopMooring(water, docks)` → `{water, dock, raft, hull, murk, lane, cam, circles}` (the keel circles and Murk's, `{x, z, r, kind: 'hull' \| 'murk'}`); `TEXT_LOOP.jetty.wall` (the doorway's accessible name only) |
| `data.js` (the home camera at any screen shape; the integration's lanes A and C) | `homeCamAt(cam, aspect, {pull, tow})` → `{pos, look, fov, k}` (pure; render's `homePose` and the validator's `frameCheck` share it): `k` 0 the portrait pose … 1 the landscape, eased (smoothstep) between `LOOP.mooring[water].cam.blend = [a0, a1]` (W / H; default `[0.85, 1.7]`); `cam.portrait.across` (an aspect: from it on the portrait lens keeps its across angle, so a square window frames the barge as the phone does); `cam.portrait.tight` (the lens's factor, 0.86) and `cam.portrait.lift` (m on the look's height, 0.8) eased in over 0.4 of an aspect from `across` and out with `k`, so a phone under `across` and a wide screen from `a1` are exactly as before; `pull` 0..1 the tow's glide in: the pose drawn back `LOOP_TOW.cam.pull` times and turned `LOOP_TOW.cam.turn`° round its look (`LOOP_TOW.cam.portrait.{pull, turn}` for the portrait pose, eased by the same `k`); null without a pose |
| `home-targets.js` (the words; lane int-C) | `layoutTargets(rects, {…, wordSize, avoid, gap 16, boxGap 8})`: each word's own box (`wordSize[id] = {w, h, hook}`, ui-loop measures the drawn word and its hooks; `wordMetrics(text, WORD_TYPE.desk \| phone)` estimates it for the validator) ≥ 16 px from every other word and from each `avoid` rect (the Wick: `wickCorners(M)`, `WICK_BOX` round the raft), ≥ 8 px off the other buttons; the hooks dropped when the hooked word would come close, then the word nudged along its band (or a little below / above it) → each item's `wordBox`, `hooks`, `dx`, `dy`; ui-loop sets `--tw-dx` / `--tw-dy` and `.gw-jetty-target--nohk`, and a tap on the word is its target's. `frameCheck` checks the word boxes too (`apart(a, b)` the clear distance) |
| `world` | `setLayout` pushes the mooring's circles into `layout.obstacles` (the raft's collision, the water's foam, `getObstacles()`); `getMooring()` → the resolved mooring or null; the barge's windows add one streak to the water's light list (no PointLight) |
| `actors` | `actors.home` (`actors-home.js`, the Slow Hearth: `moor({x, z, yaw})`, `show(on)`, `setVariants(homeVariants(meta.loop))`, `targetBoxes()`, `levels`, `waterLight`, `calls()` → `{main: 3, mirror: 2, shadow: 1}`, `stats()`); `actors.merchant.moor(pos, yaw, {zone})` (the `moored` mode: the lamp's PointLight held at 0, no turning to the raft, the ledger's idle; `leave()` keeps him unless `{unmoor: true}`), `.mode`, `.lampLit`; at home the raft's heading eases to its tie-up |
| `render` | camera mode `'home'` (flow home under the loop, a mooring with a `cam`, no glide running): the mooring's pose blended over the sail rig by one weight eased 1.2 s (in on the tie-up, out as the glide out begins), its fov through the rig; in flow home the rig's yaw is the pose's side of the raft (the sail home's glide, the rest, the glide out's first 0.6 s), turned to and from the north in one 2.4 s smoothstep orbit round the raft, the way that keeps the lens off the hull circles; `snapCamera()` puts both fully in; `debug.camera().homeW`, `.homeSwing` |
| `loop-home.js` | `moorMurk()` (exported) moors Murk at the slot at every `enterHome`, `startTrip` (which no longer calls `merchant.leave`) and main's loop Continue; the sail home's glide (LOOP.time.home s) ends at the stern through `loop-rules.glideInPath` (straight in, through the lane, or the last `LOOP.barge.reach` m of the lane's line with the raft and the camera put there first); the film's hand-off reaches the stern the same way; the hand-off and Start-with-no-film call `loop.towBarge(lake)` |
| `loop-rules.js` | `glideInPath(from, M, {reach, pad, obstacles})`, `pathClearance(pts, circles)`, `footprintDistance(x, z, area)`, `mooringChecks(M, {...})` (pure) |
| `home-targets.js` | the targets' boxes (`TARGET_BOXES`, `BARGE_LOCAL`), `targetCorners(M)`, `project`, `rectOf`, `layoutTargets(rects, o)`, `frameCheck(M, cam, o)` (pure: the actor, ui-loop and the validator share them) |
| `ui-loop.js` | with a mooring the Jetty's tiles are DOM buttons over their objects' projected bounds (`button.gw-tile.gw-jetty-target[data-tile=murk\|chart\|journal]`, then `[data-tile=wall]` from wing I, no word): each frame `placeTargets()` lays them out (≥ 44 px, the word under, clear of the purse, the pause glyph and the goal line, never overlapping); `homeTargetIds(metaLoop)`; `ui.loop.placeTargets()`, `ui.loop.debug().targets`; the doorway opens the Journal until step 5b's cabin |
| `progression-loop.js` | `LOOP_SCHEMA` 4; `meta.loop.barge = {water, towed}` (its own field; `freshLoop` `{first water, []}`; `migrateLoop` gives a schema < 4 block `{first water, [first water]}`); `loop.barge()`, `loop.towBarge(water)` |
| tools | `validate-data --loop`: the mooring checks and the home camera's frame at 358 × 664 … 1920 × 1080; `tools/tests/loop-5a.test.mjs`, `tools/tests/loop-5a.scenario.mjs`; `clarity-perf.scenario.mjs --home` (`clarity-perf-home.mjs`) |

### 14.20 (placed after 14.12, the barge it extends) The Slow Hearth inside, first person, and the stern line (M1 step 5d, after tonight's merge and the sheet's lane; `docs/loop/BARGE-INSIDE.md` revision 2)

The seam as designed (16 November 2026; built by one seed commit and lanes I-1 to I-4, `BARGE-INSIDE.md` §9), additive to §14.12,
§14.14 and §14.15; under `data.LOOP_ENABLED` only, and never while `meta.loop.tutorial.done` is false (the tutorial's third-person
home view is unchanged).

| where | what |
|---|---|
| the seed (on the integration branch `gw-inside`, at the user's answers of 17 November 2026; merged first) | `aboard-layout.js` (new, pure but for home-targets' projection: every interior box at a person's scale, the places' eyes at a person's eye (1.50 m standing; the Deck 1.38 m under the awning; the Bench seated), `DOOR_GLIDE` with its stoop, `aboardFrameCheck`; `BARGE-INSIDE.md` §3.0–§3.2, Appendix A.2; I-1 owns its boxes afterwards); `LOOP.aboard`, `LOOP.stern` and `TEXT_LOOP.aboard` in `data.js`; `actors.setAboard(on)` (the Wick, its rod and its flame hidden); `render`'s camera mode `'aboard'` and `render.afterCamera(fn)`; `debug.aboard = {go(place), close(id), pose()}`; **the barge target** `[data-tile=barge]` on the view from the water (`home-targets.js` `TARGET_ORDER`'s last, `TARGET_BOXES.barge`; `ui-loop.js` `homeTargetIds(metaLoop, {aboard})`, shown once the tutorial is done); **a stand-in director** (`aboard.js`, below); `validate-data --loop`'s aboard frame check at four sizes, the arrival frame with the barge target and the tutorial's without it |
| `data.js` (I-2) | `LOOP.aboard = {near: {place, close}, far, roll, shake, bob, glide: {step, door, turn, rungs, close, back, dip, settle, sillDip}, look: {degPerPx, touchSweep, spring, damp, cursor, idleHint, markFade, closeCone}, first: {lookAstern, turn}, places: {deck, hearth, wall, rail, balcony, bench, roof: {eye, look \| yaw/pitch, fov, portrait: {eye?, look?, fov}, cone: [yawLo, yawHi, pitchLo, pitchHi], track?, mirror?, fade?, targets, go, lamp?}}, close: {…}}` in barge-local metres; `LOOP.stern = {bites: 3, from: 1, light: 'day', revisit: true, arc: {minDist, half, raftPad, poleClear}, raftAboard: {pole}, bring: {bearing, dist, from}, spawn: {margin, ahead, clear}, present}`; `TEXT_LOOP.aboard` (accessible names only, never drawn) |
| `actors` (I-1) | `actors.home`: the interior merged into its timber, glow and ink (no new material but the print atlas); the stern gallery and the Wicks' bench; `toWorld(x, y, z, out)`, `bob`; `parts.set(id, {lift, angle, glint})` (pivots and axes baked into vertex attributes, one vec4 per part in a 24-slot uniform array: no draw call); `atlas(canvas, rects)`; the indoor term (`gwWarm.z`); the ink drawn after the timber while aboard; `calls()` derived from its meshes, the budget `{main: 6, mirror: 2, shadow: 2}` gated on the measured share |
| `actors` (I-3) | `getRodTip()`, the line's start and its bend read the first-person rod (`actors-rod-fp.js`: the rod and hands, one merged mesh and its ink, placed through `render.afterCamera`) while the stern line is on; the raft's heading aboard (`LOOP.stern.raftAboard`) set under the dip in and restored under the dip out |
| `render`, `water` (I-2) | camera mode `'aboard'` (flow `home`, the director active): the director's world pose applied after the floor clamp and exactly (no sway, no title roll; the barge's roll × `LOOP.aboard.bob`; the trauma shake × `LOOP.aboard.shake`; none under reduced motion); `getYaw()` returns the director's look yaw while aboard; `near` and `far` from `LOOP.aboard`; no pixel-ratio change in motion; `water`'s `uReflW` eases the mirror off in a place with `mirror: false` and the reflection render is skipped at 0, with no define changed and no target disposed (no program compiled across the door); the water's render order after the timber while aboard |
| `aboard.js` (new; I-2) | the director `createAboard({ctx, data, report})` → `ctx.game.aboard = {place(), go(id), close(id, {onArrive, onBack}), back(), active(), eye(), look(), yaw(), follow(point, k), lock(on), key(code), enter(), leave(), debug(cmd)}`; events `aboard:enter {place}`, `aboard:place {place, prev}`, `aboard:close {id}`, `aboard:leave`; the dip on **the barge's tap** (the first time looking astern, then turning to the Deck's look; the user's answer to question 46: never on Sold), Back and Escape at the Deck stepping off to the view from the water, the dip out at Sail, Continue on the view from the water; the Bench's state driving `world.setMorning` (question 47); the seed's stand-in is `{enter(), leave(), go(place), close(id), back(), active(), place(), pose()}` with cuts for glides and a wordless Back mark, which I-2 grows into the whole; the Deck's lamp mark glides to the Rail and opens the shelf, its close glides back |
| `ui-aboard.js` (new; I-2) | one input layer inside the Jetty's body (pointer capture for drags; a water tap to `fishing.sternPress`; a press while `fishing.state` is `'bite'` to the strike first); the place's new targets `[data-aboard=<id>]` (wordless) and marks `[data-go=<place>]`, Turn and Back at the bottom centre, the fade at the Bench and the waiting Balcony; focus order the built tiles first; its own veil; the Jetty's chrome reserved; the modal id stays `jetty` (so `LOOP_MODALS`, `TUTORIAL_TOPS` and `top() === 'jetty'` hold) |
| `ui-loop.js` (I-2's two hunks) | a projector hook in `placeTargets`: aboard the director places the Jetty's own tile elements (`[data-tile=murk\|chart\|journal\|wall]` and the sheet's `rack`), so no element is duplicated; the Jetty's `onKey` and `onEscape` hand the key to `ctx.game.aboard.key(code)` first and fall back to `jettyKeys` and `openHomePause` |
| `world.js` (I-1, one hunk) | `world.setMorning(k)` (question 47: 0 first light … 1 the risen morning; the fog's density, the key and hemisphere light, the sky's low band, the mist banks, the lanterns' level; uniforms only, no clock moved, no program compiled) |
| `loop-home.js`, `main.js` (I-2) | `enterHome`'s `arrive` unchanged; the tally's **Sold** unchanged (the view from the water stays); the barge target hands to `aboard.enter()`; `sail()` calls `aboard.leave()` first; at home, while `biting()`, a press and Space or Enter go to the strike before the Jetty's keys; `ctx.cinematic` is kept in flow `home` while `fishing.sternActive()` |
| `fishing` (I-3) | an explicit mode `'trip' \| 'stern' \| null`, read at every site of the audit table (every `LOOP()`, `run()` and `playing()` site marked same, off or variant at the stern, locked by a node test); `fishing.setOrigin(o \| null)` (o = `{pos, yaw, arc, key: 'stern:<water>', light: 'day', stern: true}`; null reels in), `fishing.sternPress(e)`, `fishing.sternActive()` (the bite, the play, the present and the card only); `origin()` for the cast, the line, the aim, the ray, the preview, the break and the play, and `raft()` for the ring rule; the arc without the raft's pole and lantern; the revisit pool (Journal `caught > 0`); the lure and bait from `meta.loop.fitted`; the play led round to the port quarter; `ringOk` with the hull circles and the gallery; the tells' and silhouettes' spawn in the arc ahead of the eye; at the stern no hold, no snag, no pull, no evening passive but Stub's waits |
| `progression-loop.js`, `progression.js` (I-3) | `meta.loop.stern = {evening, spent, seen, boarded}` (`freshLoop` and `migrateLoop`, after the sheet's line, no schema step; `spent` resets when `evening ≠ evenings`; a bite counted and saved as it opens; one open at a reload given back); `LOOP_METHODS` += `sternBitesLeft()`, `noteSternBite(e)`, `closeSternBite()`, `sternLetGo(fish)` (no bite back, no favour), `markSternSeen()`; `measure(fish, {stern: true})`: the best, the class seals and the print (`notePrint` with `meta.loop.evenings`), never Memories, toasts, challenges, the `cove` flag, `meta.runs`, the firsts ledger or the hold |
| `ui.js`, the HUD, the stern card (I-3) | the catch queue drains in flow `home` while `fishing.sternActive()` and `flow:change` no longer empties it at home; the HUD's fishing layer (the float's dots, the strike tip) at the Balcony; the teaching captions never at the stern; `ui-screens.js` `showCatch`'s stern branch and `ui-loop.js` `cardActions({stern: true})` → **Let go** only, a tap on the card letting go after the measure's beat, both calling `loop.sternLetGo` |
| screens (I-4) | `aboard-touch.js` (new: each target's behaviour, the close looks' screens, the pleasures; replaces I-2's stand-in openers); `home-prints-atlas.js` (new: wing I's prints into one 1024 × 1024 canvas, redrawn after the present or at the next Long Wall visit); `home-prints.js` `galleryModel(meta, D, {blanks: true})`; `ui-prints.js` (the print card; the 2D gallery out of the home flow); `ui-loop.js` (the openers exported; the fallback's wall target opens the Journal's Prints page); `ui-screens.js` (the Journal at a species from a print); the ledger and the rack call `screens.openSheet` (`SHEET.md` §2.3) |
| `audio-home.js` (I-4) | the aboard beds by place (the outdoor bed low-passed inside), a glide's creak, each pleasure's sound; `audio-render.mjs --set=home` gains them |
| the sheet's lane | merges before the seed; its hunks of `actors-home.js`, `home-targets.js`, `ui-loop.js`, `ui-screens.js` and `progression-loop.js` are named in `BARGE-INSIDE.md` §9.5, and step 5d's lanes touch only theirs |
| tools | `validate-data --loop` (each place's eye inside its room, its targets ≥ 44 px and never overlapping, raw or laid out, at 358 × 664, 390 × 844, 1280 × 720 and 1920 × 1080, clear of the Jetty's chrome; each glide's path clear and through the door; the stern arc's water and the raft's pose aboard at every mooring); `tools/tests/aboard-scene.test.mjs`, `aboard.test.mjs`, `stern-line.test.mjs` (the audit table, the 300-bite guard with `listCount` unchanged, the rings), `aboard-touch.test.mjs`; `loop-aboard.scenario.mjs`, `loop-aboard-look.scenario.mjs`, `loop-stern.scenario.mjs`, `loop-aboard-screens.scenario.mjs`; `loop-5a.scenario.mjs`'s "no cast at home" reversed; the seven home-tile scenarios through `debug.aboard.go`; `clarity-perf.scenario.mjs --aboard` (calls and cpuMs per place) |

### 14.13 M1 step 4: the tins and lures, the raft's parts, Murk's orders, the Matriarch a catfish (the MVP's lane 4; `docs/loop/M1.md` §4 step 4)

Under the loop only (`data.LOOP_ENABLED`); off it nothing here is built or read (the v3 fingerprint is untouched: `LOOP` and `TEXT_LOOP`
are not in it; `BAITS`, `CATCH_V3`, `LURES`, `BALANCE_V3` and `SPECIES` are changed only in the apply block's own `if (LOOP_ENABLED)`).

| where | what |
|---|---|
| `data.js` (a block after `TEXT_LOOP`) | `LOOP.lures` (the Mossmere's four: `{water, price, family}`; the Spinner `{giants, share 1.5, hold 10}`), `LOOP.baitRule {grade 1.5, favour 0.3, tin 10}`, `LOOP.tins {mossmere: [mireworm, lumen_moss]}`, `LOOP.cut {strips 3, classes [small, keeper], hold 0.6}`, `LOOP.raft {oars, keel, lantern}` (`prices`, `with` = the water order whose map shelves a level: Keel III the Pallid Deep's), `LOOP.home.orders {prices, with, count}` (`LOOP.home` is `Object.assign`ed, so step 5b's keys can join it), `LOOP.orders` (the engine's rules); `TEXT_LOOP.shelf.*` (SPEC §8.4's lines), `.gearNames`, `.gearItems`, `.orderWords`, `.murk.firstSmall`. The apply block: a `BAITS` row for Cut Strip, the tins' favour in `BALANCE_V3.favour.tackle.bait`, the tins' Hold on the roster fish that favour them (`bonus.attract`), the Spinner re-aimed at the giants (`CATCH_V3.items`, `LURES`), `FISH_SHAPES += catfish` and the Matriarch's `model.shape: 'catfish'` (her size, Fight and play as built: her land chance unchanged) |
| `src/loop-gear.js` (pure, new) | `gearItems(D, metaLoop, session)` (the shelf's step-4 cards in `shelfItems`' shape: `lure:<id>`, `tin:<id>` consumables, `oars:N`, `keel:N`, `lantern:N`, `orders:N`), `applyGear`, `tinPrice`, `lureOf`, `tinWater`, `gearName`, `lurePool(D, placePool result, {lure, phase, wickId})` (the sim's draw), `raftTerms(D, metaLoop, phase)`, `raftStats`, the orders engine: `orderCount`, `orderPool`, `newOrder`, `refillOrders`, `orderMatches`, `assignOrders`, `orderPhrase`, `orderPhraseOk`, `pluralName` |
| `progression-loop.js` | `shelfItems` appends `gearItems`; `buy` applies them (the board chalks its orders at once); `fit('lure', id)` (an owned lure) and `fit('bait', tin \| 'cut_strip')`; `createTrip` puts the fitted lure on `run.lure`; `saleOf` doubles a fish that fills an order (the larger of that and the Wick's first); `endTrip` settles the orders in the tally's order (`fish.order`, `line.order: true`), drops the filled ones and refills (new at each visit home); `LOOP_METHODS` += `orders() → [{id, speciesId, kind, n, have, cls?, oz?, text}]`, `wipeOrder(id)`, `orderFor(fish) → orderId \| null` (the card's tick, counting the hold first), `cutBait(fish)` (a Small or Keeper on the card → `run.bait.cut_strip += 3`, no bite back, `fish:action {action: 'release', cut: true}`); the catalogue's `bait` glyph names a tin (the Gloam Eel's Lumen Moss) |
| `progression.js`, `progression-af.js` | a trip's stats: `moveSpeed += 1.5 × oars`, `lightRadius × (1 + 0.15 × lantern)`; no "Out of …" toast on a trip; `getLoadout()` under the loop: `item` the fitted lure, `upgrade` the cast's bait (`catchParts` takes the larger, never both); the gear log lists the water's lures and tins |
| `fishing.js` | `loopPool` passes `data.placePool`'s result through `lurePool` (the fitted lure); the trip's cast terms add `raftTerms` (Keel everywhere, Lantern after dark) |
| `actors.js`, `src/actors-raft-gear.js` (new) | `actors.raftGear` `{sync, levels, debug}`: the Oars, Keel and Lantern on the raft (one merged mesh, rebuilt on a level change; the Lantern's glass and halo laid over actors' per-frame values) |
| `models-fish.js`, `ui-fishart.js` | `LOOP_SHAPES.catfish` (3D) and `SHAPES_LOOP.catfish` (2D, its whiskers): only the Matriarch rides on it in M1 |
| `ui-loop.js`, `src/ui-gear.js` (new), `ui-screens.js` | `createGearView` (one line in `createLoopView`): the bait slot cycles the bag's ball, tins and Cut Strip once the bag holds a tin; the lure slot `[data-slot=lure]` beside it (both from `placeBaitSlot`); Murk's chalk board `[data-loop=orders] [data-order=<id>]` under his line on the shelf (tap: wipe); Murk's first-Small line; `cardHooks` (one call in the loop card): Keep's `.gw-chalk-tick` when `orderFor(fish)`, a held Let go (`LOOP.cut.hold` s) on a Small or Keeper shows `.gw-cut-knife` and calls `cutBait`; the tally's rows: `.gw-chalk-tick` on `line.order`, counted up like a first; `textAllowed` takes `orderPhrase`'s forms; `shelfCards` reads an item's `art` |
| tools | `tools/tests/loop-4.test.mjs` (data = the sim's drafts, the shelf and the `with` gate, fit and the never-stacked Hold, the raft's terms, the lures' draw, every one of the 17 biting, the Gloam Eel's tin glyph, the orders through the real progression, Cut Strip, the Matriarch's 27%), `models-plans.test.mjs` (the catfish), `tools/tests/loop-4.scenario.mjs` (the browser walk) |

Seams left for step 5: the Order Board on Murk's barge and the bow board are 5b's (`actors-home.js`); its orders are `loop.orders()`. The
barge part "one more order" (5c) can raise `orderCount`'s result. The sim (`tools/sim/clams.mjs`) still drafts its own copies of these
tables (`familyLures`, `giantsLures`, `baitRule`, `bait`, `raft`, `home`): `loop-4.test.mjs` checks that they agree; moving them into
`MOVED` is left to the lead.


### 14.14 The tow and the opening at the Landing (M1 step 5b, the tow lane; `docs/loop/OPENING.md` §6.2 rev. 5, SPEC §6.5)

Under the loop only (`data.LOOP_ENABLED`); off it none of this is built or read. One component every water's first tow reuses:
its leg on the Chart, one ink dip, the glide in to the water's mooring. In M1 only the opening plays it (the Landing to the Mossmere).

| where | what |
|---|---|
| `data.js` | `LOOP.tow = {opening, leg: {base 4, crossing 0.5, max 6, reducedHold 1.5}, dip 0.6, glide 3, landing: {dip, arrive, kindle, wakeAfter}, legs: {[water]: {from, piece, reverse, crossings: [{kind: 'locks' \| 'fall' \| 'sea', at}]}}, glideIn: {[water]: {d}}}` (also `LOOP_TOW`); pure `towLegSeconds(leg, {reduced})`, `towPlan(water, {reduced})` → `{water, leg, legS, dip, glide, total}` or null, `towGlidePose(M, u, {d, ease})`, `towOpeningDue(metaLoop, water)` |
| `loop-tow.js` | the director: `createLoopTow({ctx, data, report, home, save})` → `{opening({from, arrive}), playTow(water, {onDone}), update(dt), tap(), state(), active(), phase, debug(cmd)}`; pure `towLeadPose(M, u, {d, line, length})` (the glide in: the raft leads on its line ahead of the bow, cast off and tied at the stern at the mooring), `legProgress`, `towPhases`, `TOW_PHASES`; `camPull()` (`dipIn`, `dipOut`, `arrive`, `wake`, `leg`, `dip`, `dipHold`, `dipClear`, `glide`, `done`). The tow's begin writes first: `loop.towBarge(water)`, the tutorial's step `'tow'`, `meta.loop.chartPick` (the opening), the save; so a reload mid-tow lands at the mooring on the chart beat. It never strands: the flow leaving home drops it; the tutorial marked done under it, or its screen closed by another (`ui.closeAll`), cuts it to the mooring (written as begun, `home:enter` as usual) |
| `ui-tow.js` | the view: `createTowView(K)` → `ctx.ui.loop.tow` = `{open({water, opening, onTap}), paint(state), dip(alpha), close(), isTop(), isOpen(), prepare(), debug()}`; the modal `'tow'` (`[data-loop=tow]`, a full screen, `button[data-loop=homepause]`, Murk's wake line in `.gw-murk-line`); pure `towFrame`, `legPoint`, `towMarks` |
| `audio-tow.js` | `SFX_TOW` (`tow_oars`, `tow_creak`, `tow_lock`, `tow_fall`), `registerTowSfx()` (adds them to `audio-sfx.SFX` under the loop only) |
| `loop-home.js` | `enterHome('intro' \| 'new' \| 'title')` hands the opening to the tow while `towOpeningDue` (deps.tow); its `arrive` ends the glide in (`home:enter`, the save); `glideHome(path, o)` (the tow's glide in, a home glide: a tap or a skip key ends it at the mooring) |
| `loop-tutorial.js` | `LANDING_BEATS` (`arrive`, `wake`, `tow`, `glideIn`); `landingBeat(step)` (the wake says Murk's line: `firstEvening:line`); `start()` after the tow (`barge.towed` holds the first water) opens on the chart beat at once (`moored`) |
| `main.js` | `game.playTow(water, o)`, `game.towing()` → the phase or null, `game.towCam()` → the glide in's camera pull; the tow's clock each frame (real time); `debug.loop.tow()` the readout, `tow('tap')`, `tow('cut')` |
| `render.js` | camera mode `'sail'` while the tow's Chart is up (`dipIn` … `leg`: the film's framing holds under the first dip) and `'home'` while it is in the water (`dip`, `dipHold`, `dipClear`, `glide`); `homePose()` draws the mooring's framing back by `game.towCam()` (1 at the dip → 0 at the mooring): `LOOP.tow.cam = {pull 2.2, portrait: {pull 1.9, turn −30°}}`, the sight lines node-tested clear of every island and pillar |
| `actors.js` | the barge shown at its mooring only once `meta.loop.barge.towed` holds the water (or while the tow is in the water): never on a fresh save's title or under the film |
| events | `loop:tow {phase, water, opening}` at each phase; `loop:tutorial {step, prev, landing: true}` for the Landing's beats |
| tools | `validate-data --loop`: the tow's parts, each leg's piece and crossings, the opening untouched within the tutorial's budget; `tools/tests/loop-tow.test.mjs`; `tools/tests/loop-tow.scenario.mjs` (`--only=film,taps,reload`); `loop-1a.scenario.mjs`'s opening path through the Landing and the tow (`--until=sail` stops the main pass after the first Sail) |

### 14.17 Murk's catalogue: the shelf as a printed book (renumbered from a second 14.15 at the MVP merge) (the user's words of 16 November 2026)

"Let's make buying things from murk look like an actual brochure we browse the pages of to buy items." The shelf's modal (`'shelf'`, `ui-loop.js` `openShelf({tab, focus})`) draws a book in place of its cards; what it sells, its prices (the price factor), its buy (`progression.loop.buy`), the session's "Yours.", the goal, the Maps tab's three cards, the Bait tab's counts, Murk's orders and the gear log are the shelf's, unchanged. The cards (`renderShelf`) stay as the fallback if the book throws.

| module | what it owns |
|---|---|
| `murk-catalogue.js` (pure) | `bookLayout(vw, vh)` ('desktop' spread / 'phone' page; a landscape screen under `BOOK.lowH` tall, at least `BOOK.lowMinW` 600 px wide and wider than 1.5 : 1 is always a spread, 667 × 375 and 740 × 360 included) · `bookSizes(vw, vh, layout)` → `{pw, ph, size, narrow?}` (the page's px and the spread's grid: `'full'`; `'short'` when a spread's page is under `BOOK.shortPage` 520 px tall, 960 × 540: an item to a half-page row, its engraving beside its words, a map plate a page; `'low'` under `BOOK.lowH` 480 px, a phone turned to landscape: an item a page, Murk's line and the purse in a column beside the book; the integration's review, 16 Nov; `narrow: true` under `BOOK.lowNarrow` 800 px wide: the fore-edge tabs as glyphs and a 160 px side column, pages down to `BOOK.lowMinPage` 180 px) · `bookPages(tabs, {layout, size, odds, goal})` (the frontispiece and cover, one chapter per shelf tab in the shelf's order, `BOOK[layout].per` items a page (a desktop's Maps chapter two map plates a page, side by side and the page's full height), the gear log's page last, an end leaf to keep a desktop's spreads whole; the page count depends only on how many items each chapter holds) · `spreadOf` · `spreadPages` · `turnTo` · `focusPage` · `orderText` |
| `murk-engrave.js` (pure strings) | `engrave(card)` (an engraved SVG plate for every item: ink line, hatching, cross-hatching, stipple; ink is `currentColor`, paper knock-outs `.cat-pp`), `plateKey`, `frontispiece` (Murk's barge), `ledgerPlate`, `endPlate`, `wickInk` |
| `ui-catalogue-murk.js` | `createMurkBook(deps)` → `{render, onKey, debug, slow, go, pageOf}`; its CSS (`#gw-mb-css`, classes `gw-book*`, `gw-mb-*`, `gw-plate*`); the page's sound `book_page` added to the sfx table under the loop only |

Selectors (the scenarios'): `[data-loop=shelf]` (the book), `[data-item=<id>]` (a plate; its tap marks it), `[data-buy=<id>]` (the order line "Buy · <price>" in the book's foot, the buy), `[role=tab].gw-tab[data-chapter]` (the fore-edge tabs: the tab words and `Odds ›`), `.gw-murk-line`, `[data-loop=orders]` (lane 4's slate, on the cover), `.gw-shelf-odds` (on the gear log's page), `[data-seal]`, `[data-place]`, `[data-sealed]`, `[data-action=prev|next|close]`. Keys: ←/→ and PageUp/PageDown turn a leaf, Home/End the cover and the last page, `[`/`]` a chapter. `ctx.ui.loop.murkBook.debug()` → `{layout, page, spread, count, chapters, goalPage, marked, turning}`. Words: `TEXT_LOOP.goods` (`name`, `buy`), on `textAllowed` and checked by `validate-data --loop`. Tests: `tools/tests/murk-catalogue.test.mjs` (with `bookSizes` and the short and low grids); `tools/tests/murk-catalogue-look.scenario.mjs` (it also walks every spread at its size: no name, kicker or place cut, no numeral on a name, the ribbon on no letter, the running head clear of the corners, an engraving a third of its plate or more; run at 960 × 540, `--mobile` and `--mobile --width=844 --height=390`); `loop-1a`'s `K.buyBox` (find the plate, tap it, return the order line), `loop-4`, `loop-5b`, `loop-4-look`.

### 14.18 The Wick's sheet, "Taper's Sheet" (`docs/loop/SHEET.md` v2; SPEC v8.8 §8.12, decisions 105–110; the user's answers 41–43)

- **`src/loop-sheet.js`** (pure; imports `watercraft.js`, `fishing-reel.js`, `loop-gear.js`, `loop-finds.js`, `home-shelf.js` only):
  `sheetModel(meta, D, {run, view, live, cast, shelf, stats})` → the page in ids and numbers (§7.1's `Sheet`); `sheetKeys(metaLoop, D)`;
  `sizeOdds(mu, {min, cap, classes, ancient})` (the size roll's truncated normal; `classOdds` at the floor −2); `favourHere(D, metaLoop,
  {place, light, bait, lure, quiet, mercy})`; `moveOf`; `passiveExact(D, wickId, waterId)`; `whoBites(D, {place, area, light, lure, bait,
  wickId, rb})`; `plainRb`; `LIGHT_PHASE` (day → `'calm'`, dusk → `'dusk'`, night → `'gloomtide'`: every call takes the game's phase).
- **`watercraft.openMix(D, {light, lure, bait, wickId, rb})`**: the blind caster's open-water mix at one hour with the rarity bonus;
  the private `eveningMix` sums it at rb 0, so `bitesTable` is unchanged.
- **The hook's chips** (`[data-fit=lure:<id>]`, `[data-fit=bait:<id>]`, an empty id the bare hook or no lure) tap
  `loop.changeHook({bait} | {lure})` (§14.19) at home and on a trip: the user's answer 43 ("at home only") superseded on 16 Nov 2026.
  `sheetModel`'s `canChange` option (the ledger passes `loop.canChangeHook()`) sets `tackle.hook.canFit`; the chips are dead only while a
  fish is on. On a trip the hook's plates read `run.lure` and `run.equippedBait` after the change.
- **`ctx.progression.loop.sheet(view, live, cast)`** (the model on the live save and run, Murk's shelf passed in) and
  **`loop.markSheetSeen(keys)`** (owned keys only, each once); both in `LOOP_METHODS` and `fakeLoop`. **`meta.loop.sheetSeen`**:
  `[]` on a fresh save; `migrateLoop` seeds it at its top with `sheetKeys` (an older save opens with no marks).
- **The Hold rule** (SHEET §8.1): a loop-only data patch in `data.js`'s loop apply block gives each hook item's `CATCH_V3.items` record a
  `species` list (its `watercraft.gradeTargets`, then every species with no hook row by the built rule); `catchItemHold`'s text is
  untouched; `family` and `attract` stay for the sim's fallback. `catchParts` equals the sim's `landP` (S3).
- **`fishing.lastCastArea()`** (read-only, the user's answer 41: "where you last cast"): the last landed cast on a trip
  `{area, place, water}` or null. The sheet opens its Odds there once a spot has been fished and never names the area.
- **`ctx.ui.openSheet({from, section, pin, view})`** (`screens.openSheet`): `from` ∈ `pause`, `ledger`, `rack`, `odds`, `species`,
  `book`; `section` `'odds'` | `'tackle'`; refused while a line is out. The interiors' seam (BARGE-INSIDE §4.3): the ledger calls
  `openSheet({from: 'ledger'})`, the rod rack `openSheet({from: 'rack', section: 'tackle'})`. `ctx.ui.sheet.model(view)` (debug and
  scenarios). `screens.openTackle` under the loop opens the sheet's Odds; `screens.sheetItem(o)` the pause menus' item.
- **The home target `rack`** (`home-targets.TARGET_ORDER` after `journal`; `TARGET_BOXES.rack` from deck + 1.0; no word slot in
  `frameCheck` or `placeTargets`; `actors-home.targetBoxes`; `ui-loop.homeTargetIds` → `['murk', 'chart', 'journal', 'rack', …wall]`).
- **Words**: `TEXT_LOOP.sheet` (the title, two heads, five exact lines, the cast line, the effect words, the moves, the size labels,
  "Where you last cast", "Quiet water", accessible names); `ui-loop.textAllowed(t, {screen: 'sheet'})` passes its number forms and its
  filled templates. Odds live on this page and nowhere else.
- **The picks** (`ui-sheet.pickSession()`, pure): the class lasts the session; Where and the hour are dropped at `run:start`, `run:end`,
  `home:enter` and each `fishing:land`, so `sheetModel`'s defaults (the raft's water and hour, "Where you last cast") hold again.
- **A phone's Journal** on the sheet: the row `.gw-tabs--sheet` (the sheet's tab the portrait alone, its label `.gw-tab-lab` hidden;
  `.gw-tabs--tight` drops the count badges while the row would scroll sideways) and the panel's head "{name}'s Sheet" clear of the X.
- **Files**: `src/loop-sheet.js`, `src/ui-sheet.js`, `tools/tests/loop-sheet.test.mjs` (S1–S16), `tools/tests/loop-sheet.scenario.mjs`.

### 14.21 The first-play guide (the user's ask of 17 November 2026: plain boxes that walk a new player through what and why)
- **The view** (`src/ui-guide.js`, `ctx.ui.loop.guide`; built by ui.js beside the loop view, so never off the loop): ten boxes in
  `GUIDE_ORDER` (welcome, chart, cast, bite, fight, card, tackle, home, murk, away), each shown once a save at its moment
  (`guideCond`: the Landing's arrive or home; the Chart; the water before the first cast; the settled float; the first hook; the
  catch card after its count; the line back after a cast, once the save owns a lure and a bait (`ownsKit`); the hold full; the Jetty after a trip; idle after `fish:escaped`, the lost
  fish's event, which GEAR-GATES' got-away also emits). Never in a bite, the strike gauge, the show, a lift or a pause; two due together
  queue in `GUIDE_ORDER`, each after `GUIDE_WAIT[id]` calm seconds. A box is a **blocking, quiet modal** `'guide'` (the game, the
  tutorial's and the tow's clocks wait; every tap and key goes to it; no `ui:modal`), placed beside its `GUIDE_TARGETS` target with a
  small arrow, never over it (the catch card's box also keeps off the card's words, and may sit free of it); while one is up
  `.gw-guide-on` hides the in-world lines (`.gw-loop-tip`, `.gw-teach`, `.gw-murk-line`) and, for home and tackle, lifts the HUD's
  dimming so the target is in plain view.
  Emits `loop:guide {id}`. Debug: `debug()`, `show(id)`, `close(how)`.
- **Words**: `TEXT_LOOP.guide` (`tag`, `ok`, `skip`, `boxes[id]` ≤ 30 words each, `touch[id]` a box's touch words where they differ
  (the cast box's sailing), `settings`); `tackle` and `away` are GEAR-GATES'.
- **The save**: `meta.guide = {on, seen: {id: true}}`, made on its first read (`guideRecord`): on for a new save, off for one that has
  landed a fish (`landedAny`). Settings (under the loop) adds "Guide tips" (on/off) and "Replay guide" (clears `seen`, turns it on).
- **The switch**: `?guide=0|1` (wins), else a preset `GW_GUIDE` boolean; `tools/playtest.mjs` and `tools/chart-shots.mjs` preset it
  off, so every scenario but `loop-guide.scenario.mjs` (which loads `?guide=1`) plays as before.
- **Files**: `src/ui-guide.js`, `tools/tests/ui-guide.test.mjs`, `tools/tests/loop-guide.scenario.mjs`.

### 14.22 A game controller (the user's ask of 17 November 2026: a Windows handheld's controllers; standard Gamepad API mapping)
- **Where**: `src/input-pad.js`, attached by main under the loop only and polled once a frame right after the keys' move (no DOM, no
  CSS and no change for a mouse, keyboard or touch player until a pad is used). Every connected pad (`readPads`: a handheld's idle
  virtual copy hides nothing): a button pressed on any counts, each axis from the pad pushing it furthest; with a `standard` pad
  connected only those count, with none the others' buttons only (never their axes). Rumble goes to the pad that changed last.
- **On the water**: the left stick and the D-pad add to `ctx.input.move` (as WASD and the touch stick); A held is main's own pointer
  press (`pointerType 'pad'`, a key's strike latency) and its release the pointer's release, so the swing-out-and-back cast, the strike,
  the show's hurry and a lure's retrieve are a tap's. `ctx.input.padAim = {on, x, z}`: while A is held, fishing's `updateAim` takes it
  instead of the pointer (ahead of the raft, `player.heading`; the right stick turns it camera-relative).
- **Screens** (the top `.gw-modal` that is not leaving): D-pad / left stick move a focus by screen position between its buttons; A
  clicks; on a slider left / right are its own arrow key, down and up (no key left held in `input.keys`); B is a synthetic Escape (on the catch / find card: Let go, its pointer press and release, so holding B cuts as holding Let
  go does); LB / RB the tabs; the right stick scrolls `.gw-scroll`. The focus is `.gw-padfocus`, wearing every `:focus-visible` rule
  twinned for it. Anywhere: Start = KeyP (Escape on the pauses and the Jetty), Y = KeyJ (the Jetty's JOURNAL; closes the Journal),
  X = KeyB. The intro: A / B / Start skip.
- **While the last input was the pad** (`html.gw-pad-on`; a real pointerdown, keydown or wheel clears it): the touch stick hidden;
  A / B glyphs (`.gw-padg`) beside the focus and the way back (Let go, the close), placed clear of every word and button (`clearAt`:
  beside the label, then beside the button's outer box, never astride an edge; nowhere clear, no glyph); in the menus of ui.css's
  "only one item is chosen" rule the pad's focus alone wears the hooks, whatever the cursor rests on; Settings
  shows "Controller hints" (`settings.padHints`) once a pad has been seen (`ctx.input.padSeen`).
- **Rumble**: `vibrationActuator.playEffect('dual-rumble')`, guarded: soft at `fishing:strike`, the heart's beats (`heartBeats`) at a
  `fishing:hookset` on an Elder / Ancient; none with reduced motion or `haptics` / `vibration` / `screenShake` off.
- **Debug**: `ctx.debug.pad()`. **Files**: `src/input-pad.js`, `tools/tests/input-pad.test.mjs`, `tools/tests/loop-pad.scenario.mjs`.

### 14.23 The gear loop across waters (LAKE 2, lane D2; `docs/loop/LAKE2.md` §5, §8.4, §9.2)

The user's rule from Lake 2 on: at the first tow to a new water everything bought at the water left (tackle, raft parts, creels) stays
there and a third of it is kept for good; found things travel; each water's lures and tins are its own.
- **Pure** (`src/loop-carry.js`, no imports): `carryAdd(D, ml)`, `applyTow(D, ml, water)`, `leaveTerms(D, ml, water)` → `{to, from,
  first, add, carry, line}`, `tackleHold(D, ml, found)`, `castMaxOf`, `hookWindowOf`, `fittedTier`, `raftLevels(ml)`, `lureHere(D, id,
  water)`, `arrivalOf(D, ml, water)` → `{k, cap, fight}` or null, `lineCapAt(D, water, lineHold)`, `startKitAt(D, water)`.
- **The ledger** (`ctx.progression.loop`, LOOP_METHODS): `towTo(water)` → `{ok, first, water, add, carry}` or `{ok: false, reason: 'water'
  | 'map'}` (a first tow writes the carry and the reset before one save; a towed water only moves the barge; `loop:tow {water, first, add}`);
  `towBarge(water)` (loop-tow's call) is `towTo` for a later water's first tow; `leaveTerms(water)` (the leaving card: nothing written);
  `carried()` → the carry with its log line (`TEXT_LOOP.carry`, null with nothing carried) and `gearWater`; `holdOf()` → `{rod, line,
  reel, cast, carry}`; `fitTackle(slot, id | null)` (a found piece, a tier of the gear water at or below the bought one, or the best bought;
  refused while a fish is on; `loop:found`).
- **The save** (additive, LOOP_SCHEMA 4): `meta.loop.carry`, `gearWater`, `fit`, `eveningsAt`; a trip's `run.arrival` on a towed
  water's first `LOOP.arrival.evenings` evenings (fishing reads it: the cap lands, the Fight term eased).
- **Readers take a water**: `watercraft.gradeOf / gradeTargets / hookWeights / finishPool / castOdds / lureStrike / gearCap` take an
  optional `water` (left out: the Mossmere); `gearCap` takes `lineHold` (the line's total Hold) against `LOOP.gearCap.lineAt[water]`.
  The shelf is the gear water's tiers, hold ladder and raft parts and the barge's water's lures and tins; orders carry `water` (an order
  without one is the first water's).
- **The sim**: `node tools/sim/clams.mjs --shipped=sporewood` (`tools/sim/sporewood.mjs`); `clams.mjs` exports `shipSporewood`, `WATER`,
  `PLACE`, `SP`, `kitHold` for it and for T104 on Sporewood (`tools/tests/loop-carry.test.mjs`).

### 14.24 The outline shore: a natural basin (LAKE 2, lane W1; `docs/loop/LAKE2.md` §3.1, §9.3)
- **Where**: `src/world-outline.js` (pure: the curve, the signed-distance field, the bank profile, the ground, arc length), read through
  `src/world-layout.js`. An arena with `layout: 'outline'` and `outline: [[x, z], …]` (Sporewood under the loop: `data.js`
  `SPOREWOOD_ARENA`) has `L.outline`; every other arena is as built (`L.outline` undefined) and every function below answers for it
  exactly as the polar shore did (`tools/tests/outline-shore.test.mjs` part 1 pins the Mossmere).
- **The seam**: `shoreDist(L, x, z)` (m, + in the water; on an outline water the field, its islands land in it). `fromShore(L, x, z)`
  the lake's own shore without a cut; `groundAt(L, x, z)` the ground's height (null on a polar shore); `shoreAt(L, s)` the shore at arc
  length s ({x, z, nx, nz into the land, h, shelf}); `shoreArc(L, u)`, `shoreAlong(L, x, z)` (a control parameter's arc; the nearest
  shore point's control parameter, −1 nearer an island); `sheetOf(L)` the Chart's. `L.shoreR(a)` stays on an outline water as the
  farthest water along a bearing: a fallback for the polar readers only, never a collision or a water test.
- **world**: `collide` holds a point off every bank up the field's slope; `getShoreDist`, `getFromShore`, `getGround`, `getShoreAlong`,
  `getOutline` (null on a polar shore); an outline water with no gate (`arena.gate: null`) has its gate hidden, no stones and no ring.
- **Readers that take a water's own geometry**: `watercraft.areaAt(x, z, probe, {geo})` (reed runs `[u0, u1]` in control points, read
  through `probe.along`), `watercraft-face.reedPlan(L, rng, {geo})`; `watercraft.probeOf(world)` reads `getFromShore` and `getShoreAlong`;
  `loop-rules.mooringChecks(M, {shoreDist})` and `pathShore(pts, shoreDist)`; `ui-chart.waterGeometry` (on an outline water `outline:
  true`, `shoreDist`, `bbox`, the shore every 2 m and each island's `outline`).
- **Debug and tools**: `tools/outline-map.mjs` (a top-down PNG of an outline water), `tools/tests/lake2-w1.scenario.mjs` (the world put
  on Sporewood in the browser, the raft driven at its banks, frames by day, dusk and night).

### 14.25 A lush water's look: the vegetation kit and Sporewood's landmarks (LAKE 2, lane W2; `docs/loop/LAKE2.md` §1A, §3.3–§3.6, §9.5)
- **The switch**: `data.ZONE_LOOKS[zone]` (Sporewood only: `lush` 0.33, the leaf keys, `mossG`, `bloom`, `fireflies`, `gain`, `floor`,
  `night`, `flora` counts, `tiers`, `haze`, `mist`, `dapple`, `weed`). `world-flora.lushLook(D, zoneId)` is the look under the loop with
  lush > 0, else null; everything below is built only for an outline water with a look. The Mossmere has none: its programs, its draws
  and its geometry are as they were (outline-shore.test.mjs part 1); off the loop nothing reads ZONE_LOOKS.
- **`src/world-flora.js`** (the kit): `floraPlan(L, look, {tier, avoid, glides, geo, lens, caps, extra, rafts})` (pure, seeded,
  `L.artSeed ^ 0xF10A`) and `buildFlora(L, look, {tier, low, K, rimC, plan})` → `{group, meshes, update(dt, t, focus, renderer),
  applyMood(env), stats()}`; `lushColor`, `lushFloor`, `lushMasks` (the water's dapple and weed, baked by water.js); `FLORA` the figures.
- **`src/world-sporewood.js`** (the landmarks): `buildSporewoodArt({ctx, L, look, kit, hero, P, K, PL, halos, addAnchor, low, inkC})` →
  `{extra, caps, lamps, cuts, falls, haze, info}`: its stalks and caps join world-art's statics (0 draws), its strands and ferns are
  the kit's items; the Seep's card and the spore-haze one draw each. `landAlong`, `narrowest` (pure).
- **world-art**: `arena.lush` ({flora: stats, art: info}) and `arena.capLamps` (the glowcaps, the spore moths' lamps; world's
  `getLampSpots` lists them); the see-through cut on a lush water too, reading `lushArt.cuts` (the Gill Harp's lens-side stalk, the
  willow arch). world's `debugInfo().lush`.
- **water**: on a lush water the depth texture's spare B and A carry `lushMasks` (the moon coins' dapple, the shallows' weed film) under
  the `GW_LUSH` define (set when its bake starts; `uLushWeed`, `uLushDapple` added the first time). The Mossmere's program is as built.
- **render**: `render-camera.waterLens(tgt, LOOP.camera[water], raft)` in fillTargets for the sail and night framings on the water
  (Sporewood: × 0.8 and +4°; closer and 5° steeper in the neck). A water with no profile is untouched.
- **world-places**: `mist.lit/litN/shade/shadeN/low` (a lush water's look's `mist`, merged by world.js) tint the banks and sit them
  lower; LOOP.mist alone (the Mossmere) is as built.
- **wildlife and ambient**: `LOOP.wildlife.sporewood` (the moths' colours per water; the lily frogs: `createLampbills(D, rng, n, C)` on
  their own data, `actors-wildlife` `frogs` in its state) and `LOOP.ambient.sporewood.flakes` (`createBoats(D, rng, n, C)`, no flame).
- **Tests and tools**: `tools/tests/lake2-w2.test.mjs`; `tools/tests/lake2-w2.scenario.mjs` (`--hue --tier=medium`: the hue-report's
  nine frames); `clarity-perf.scenario.mjs --loop --sporewood`; `tools/loop-colour-script.py` (Sporewood's frame and the exception).

### 14.26 The Tackle screen: rod, line, reel, lure and bait at leisure (LAKE 2, lane G; `docs/loop/LAKE2.md` §5.5, §9.6)
- **`src/ui-tackle.js`** (beside the tin and its drawer, CONTRACT §14.19): `tackleScreenModel(D, {metaLoop, run, line, canChange})` (pure)
  → `{water, waterName, gearWater, carried, busy, words, rows}`, the five rows `rod`, `line`, `reel`, `lure`, `bait`, each item `{kind,
  key, pick, name, on, art | find | plain, count?, log}`; `screenCall(item)` → the ledger call `['fitTackle', slot, pick]` or
  `['changeHook', {…}]`, or null for the item already fitted; `screenWords(D)`. The view (`createTackleView`'s return) adds
  `openScreen({from: 'pause' | 'rack' | 'tin', pauseChild})`, `closeScreen()`, `screenOpen()`, `pauseItem({pauseChild})` (null before
  the tutorial is done) and `debug().screen` (`{from, rows: {slot: [{key, on}]}}`). The modal is `tacklescreen` (blocking, dismissable);
  its box `[data-loop=tackle-screen]`, a chip `.gw-ts-chip[data-slot][data-key]`, the sheet's link `[data-loop=tackle-sheet]` (from the
  rack only), the pause item `[data-loop=tackle-item]`, the drawer's door `[data-loop=tackle-door]` (no line out).
- **Seams**: ui-loop's rack target calls `tackle.openScreen({from: 'rack'})` (else the sheet at Tackle, as before) and its aria-label
  is `TEXT_LOOP.tackle.tin`; the home pause and ui-screens' trip pause append `tackle.pauseItem(...)` after the Wick's sheet's item
  (ui-screens reads it as `K.loop.tackle`). `progression-loop.buy` of a tier sets `fit[slot]` back to null (the tier bought is fitted)
  unless a found piece is fitted there. `loop-sheet.sheetModel` names the start pieces by TACKLE at every water; ui-sheet draws
  `tackle.carried` as `.gw-sh-carry` above the plates.
- **Words**: `TEXT_LOOP.tackle.screen = {rod, line, reel, done, hold}` (data.js, block "LAKE 2, lane G"); `TEXT_LOOP.carry` joins
  `ui-loop`'s sheet word list.
- **Tests**: `tools/tests/lake2-g-tackle.test.mjs`; `tools/tests/lake2-g-tackle.scenario.mjs` (`--sizes=WxH,…`, `--skip=trip,tow`,
  `--noshots`; prints `LAKE2_G`).

### 14.27 The road in: the Chart for two waters, the leaving card, the tow to a new water and the way back (LAKE 2, lane C; `docs/loop/LAKE2.md` §5.2, §6, §9.7)

`LOOP.shipped` stays `'mossmere'` until the gate: the Mossmere's game, its Chart included, is as built until the tow.

- **chart-art.js** (generated): the shipped waters' sheets and the next one baked ahead (`tools/world-map/game.mjs` `shippedSheets`);
  `live.more[n]` = `{edges, wisp}` with the first n sheets owned. `tools/tests/fixtures/chart-veil.json`: one grid per count owned.
- **chart-draw.js**: `chartReach(model, art)` → `{n, sheets, box, edges, wisp, pieces, waters}` (pure; one water: the first sheet's own);
  `layoutChart` lays the window over the owned sheets, the picked water's card, a `sheet` target per other owned water
  (`[data-sheet]`), `out.reach`, and on an outline water (`geo.outline`) fits the card to its shape (`lake.ox/oz`), keeps every word off
  the pen (paper spots beyond the coast; an unfittable name waits unlettered until chosen) and the book's whole target clear;
  `drawOutlineLake` (internal) draws an outline water's sheet; `PLACE_DRAW` gains `rafts`, `harp`, `veil`, `cup`. A shipped next water's
  sealed sheet carries `sealed.price`.
- **ui-chart.js**: `waterGeometry` adds, for an outline water, `banks` ({nx, nz, h} per shore sample), `len`, `reeds` (arc lengths),
  `inflow`, `outflow`, `mooring`; `placeSites` and `chartPlaces` read a later water's places through `D.loopPlace`;
  `SHIPPED_VIGNETTES[2]`; `prepare` decodes the first sheet and the owned waters' sheets, `sheetsFor(model)` the rest when first drawn;
  `openSealed` for a shipped next water opens Murk's Maps at its lake card.
- **progression-loop.js**: `waterOpen(meta, D, water)` (pure: the map owned and shipped and the gear and catch keys held, or towed);
  `loop.isOpen` reads it; `buy('lake:<w>')` also owns the places that map opens (`LOOP.places[id].lake`); `sayOnce('at:<water>:<key>')`
  says `TEXT_LOOP.murk.at[water][key]` once.
- **ui-loop.js**: `chartModel` and `chartNext` draw a later water only once `waterOpen`; `saleLineId({…, water, at})` orders a later
  water's own lines (home, then its first cap loss); the shelf's sealed card for a shipped lake map shows its line, `mapLeaves` and its
  buy button (`lakeBuy`); buying it says `TEXT_LOOP.murk.at[w].map`.
- **ui-catalogue-murk.js**: a shipped lake map's plate is sold (marked and bought as any plate), its line and `mapLeaves` never clamped.
- **ui-tow.js**: `leave({water, terms, onTow})` (the leaving card, `[data-loop=leave]`, buttons `[data-action=stay]`/`[data-action=tow]`;
  → whether it opened); a later water's leg drawn over every inked sheet from the water left; `prepare(upTo)` decodes the sheets a leg
  crosses.
- **loop-tow.js**: `towLeadPose(M, u, {…, astern})`; `wayBack(water, {onDone})` (phases `backDip`, `backHold`, `backClear`; one ink dip,
  `towBarge` and `show(water)` at full ink, `onDone` as it clears); deps `show(waterId)` (default `home().showWater`); a later water's
  tow puts the world on it under the dip.
- **loop-home.js**: `sail(plan)` from home for a water the barge does not lie at goes through `sailAway`: the leaving card first
  (`plan.leave === true` skips it, the card's Tow), then `playTow`; a water towed to before: `wayBack`. `showWater(id)` exposed; home
  after an evening opens at the water the barge lies at.
- **data.js** (block "LAKE 2, lane C"): `LOOP.tow.legs.sporewood`, `LOOP.tow.glideIn.sporewood` (`astern: true`).
- **Tests**: `tools/tests/lake2-c.test.mjs`, `loop-tow.test.mjs` (Lake 2 sections), `ui-chart.test.mjs` (byte lines per sheet),
  `validate-data --loop` (the ahead sheet; each later leg from the water before it; each glide in); `tools/tests/lake2-c.scenario.mjs`.

### 14.28 Murk at a later water: its make, its finds, its maps (LAKE 2, lane S; `docs/loop/LAKE2.md` §5.6–§5.7, §6.5, §7, §9.8)

- **`murk-engrave.plateKey(card)`**: a card whose `itemId` is one of Sporewood's tiers or creels draws as `${slot}:${itemId}`; a raft part
  whose `gearWater` is `'sporewood'` as `${slot}:${level}:sporewood`; `lure:<id>`, `tin:<id>` and `bait:<id>` as before, Sporewood's ids
  their own plates. Any other card (and every Mossmere card) keys as built. `ui-loop.shelfCards` passes `itemId` and `gearWater` through
  when the shelf item has them; `loop-sheet`'s tackle, hold and raft plates carry them at a later gear water and `ui-sheet` hands them to
  the engraving.
- **Finds**: `LOOP.finds.items` holds Sporewood's five treasures (`water: 'sporewood'`); `loop-finds` reads every water's set by its
  `water` (no change). validate-data accepts a later water with treasures only.
- **`mapCards(D, metaLoop)`** offers the place maps of the water the barge lies at (`metaLoop.barge.water`, else the first water) and
  **`shelfItems`**' legend's bait card is that water's only; the next water's sealed or priced card as before.
- **Glyphs**: `ui-gear.GEAR_GLYPH` and `loop-gear`'s shelf `ART` name Sporewood's hooks; `ui-icons` gains `seedpod`, `minnow`, `rootjig`.
- **`ui-guide`**: `WATER_BOX` ('newWater'), `WATER_WAIT`, `waterBoxKey(water)`, `newWaterOf(D, zone)`; the snapshot's `newWater` (the
  trip's water when it is a later water); `createGuide().open(id, key)`; the view's `debug.show('newWater')` on such a trip. Seen once a
  water under `meta.guide.seen['newWater:<water>']`.
- **Scene**: `actors-home.homeVariants(metaLoop).rodAt` (the gear water, a later one) and the rack's rod in its make; `actors-raft-gear
  .raftGearParts({oars, keel, water})`, the raft gear's sync reading `meta.loop.gearWater`.
- **Tests**: `tools/tests/lake2-s.test.mjs`; `tools/tests/lake2-s.scenario.mjs` (`--part=shop`).

