# GLOOMWATER — Architecture Contract

This is the binding interface contract for every module of the game. Modules are
written in parallel by different authors; **if it's not in here, don't depend on it**.
If you must add something another module needs, add it as an *optional* extra and
call it defensively (`ctx.x.fn?.()`).

Game pitch: a lantern-lit 3D fishing survival roguelite. A tiny candle-headed
wanderer ("the Wick") drifts on a raft across drowned caverns beneath a fallen
kingdom. Fish to eat, render fish into lantern oil, sell fish for Shells, survive
the nightly **Gloomtide** when shadow creatures come for your light, and descend
through four zones toward the legendary **Pale Leviathan**. Death ends the run;
**Memories** earned carry over to buy permanent **Relics** at the Shrine.

---------------------------------------------------------------------------------

## 1. Files & ownership

```
gloomwater/
  build.mjs            bundler -> single-file index.html (integrator)
  index.html           BUILT OUTPUT – never edit by hand
  CONTRACT.md          this file
  DESIGN.md            game design doc (design team)
  src/template.html    page shell: canvas host, #ui root, fonts, loader  (integrator)
  src/main.js          bootstrap, loop, input routing, flow, debug API  (integrator)
  src/core.js          bus, rng, math, storage helpers                  (integrator)
  src/toon.js          shared toon/ink/glow material toolkit            (integrator)
  src/data.js          ALL content & balance tables                     (design team)
  src/render.js        renderer, camera rig, post-processing            (render author)
  src/water.js         water surface, ripples, splashes                 (render author)
  src/world.js         per-zone cavern environments, lighting, particles(world author)
  src/models.js        procedural fish + creature meshes                (actors author)
  src/actors.js        Wick, raft, lantern, rod/line/bobber, merchant   (actors author)
  src/fishing.js       fishing state machine, reel minigame, species pick (fishing author)
  src/survival.js      day/Gloomtide cycle, resources, enemies, combat  (survival author)
  src/progression.js   economy, creel, shop, zones, journal, bounties, relics (progression author)
  src/ui.js + ui.css   all DOM UI: HUD, menus, catch card, tips          (ui author)
  src/audio.js         procedural WebAudio music + SFX                  (audio author)
  tools/playtest.mjs   headless Chromium smoke test + screenshots
  tools/stub.js        universal stub for isolated builds
```

Rules:
- Edit **only your own files**. You may create extra helper files named
  `src/<yourmodule>-*.js` (e.g. `src/world-props.js`) imported only by your module.
- Imports allowed: `three`, `three/examples/jsm/...`, `./core.js`, `./toon.js`,
  `./data.js`, your own helper files, and (ui only) `./ui.css` (imported as a text
  string by the bundler: `import css from './ui.css'`).
- **Never import another gameplay module directly.** Reach other modules at runtime
  through `ctx` (`ctx.water.addRipple(...)`). This keeps the build modular and lets
  `build.mjs --stub=` replace any module.
- No network requests of any kind, no external assets. Everything is procedural
  (geometry, textures via canvas, audio via WebAudio). Google Fonts are linked in the
  template with serif fallbacks; never rely on them loading.
- Plain modern JS (ES2020), no TypeScript. three.js version **0.170.0** (WebGL2).
- `localStorage` only through `core.storage` / `core.loadSave` / `core.writeSave`
  (always wrapped in try/catch).
- Be robust: a missing optional call must never crash the frame. Guard with `?.`.

## 2. Module shape & lifecycle

Every module file exports:

```js
export function create(ctx) {
  // build objects, but do NOT touch other modules yet (they may not exist)
  return {
    init() {},          // called once after ALL modules are created (safe to use ctx.*)
    update(dt, t) {},   // called every frame (see dt semantics below)
    ...publicApi,
  };
}
```

`main.js` creates modules in this order and stores them on `ctx`:
`render, water, world, models, actors, progression, survival, fishing, audio, ui`.
Then calls every `init()`, then starts the loop. If a module's `create`/`init`
throws, main logs it and substitutes the universal stub so the game keeps running.

**dt semantics** (main passes):
| module | `dt` passed to `update(dt, t)` |
|---|---|
| render, water, world, models, actors, audio, ui | `ctx.time.dt` – real frame time (clamped ≤ 0.05 s). Visual ambience keeps living even while paused/menus are open. |
| fishing, survival, progression | `ctx.time.gameDt` – 0 whenever the game is paused, a blocking UI is open, or flow ≠ `'playing'`. Gameplay timers must use this. |

`t` is total real seconds. Also available: `ctx.time.gameT` (accumulated game time),
`ctx.time.timeScale` (debug speed-up, multiplies gameDt).

Frame order: input → fishing → survival → progression → actors → models → world →
water → audio → ui → render.update → render.render().

## 3. The `ctx` object

```js
ctx = {
  THREE,                 // the three namespace
  bus,                   // event bus (core.createBus): on/once/off/emit
  state: { meta, run },  // see §5 (run is null when not in a run)
  data,                  // the data.js namespace (import * as data)
  time: { dt, gameDt, t, gameT, timeScale, frame },
  flow: 'boot',          // 'boot' | 'title' | 'playing' | 'dead' | 'victory'
  paused: false,
  input: {               // pointer is unified mouse/touch/pen
    down: false, x: 0, y: 0,          // CSS px
    ndc: Vector2,                     // -1..1, y up
    pressed: false, released: false,  // true only on the frame it happened
    keys: Set<string>,                // currently held KeyboardEvent.code
  },
  game: { startNewRun({startZone}), continueRun(), endRun(cause), toTitle(),
          victory(), pause(), resume(), togglePause(), save(), wipeAll() },
  debug: {},             // modules may register debug/cheat functions here
  isMobile: boolean,     // coarse pointer / small screen
  // modules:
  render, water, world, models, actors, progression, survival, fishing, audio, ui,
}
window.__gw = ctx        // for tests / console
```

## 4. Flow, input routing, saving (main.js)

- Boot → `flow='title'`; `ui.showTitle()`. Title offers Continue (if a run save
  exists), New Descent (with Waystone start-zone choice when unlocked), Shrine,
  Journal, Settings. The 3D scene renders behind the title (camera mode `title`).
- `game.startNewRun({startZone})`: `state.run = progression.createRun({startZone})`,
  `flow='playing'`, emit `run:start {continued:false}`, save.
- `game.continueRun()`: restore saved run, `flow='playing'`, emit `run:start {continued:true}`.
- `game.endRun(cause)` (main calls this on `player:died`): `summary = progression.summarizeRun(cause)`
  (applies Memories + meta stats), `state.run.active=false`, `flow='dead'`, emit
  `run:end {summary}`, save (run cleared), `ui.showDeath(summary)`.
- `game.victory()` (main calls this on `victory` event): `flow` stays `'playing'` after
  the victory screen is dismissed (endless continue). ui.showVictory(summary).
- `game.toTitle()`: save, `flow='title'`, `ui.showTitle()`.
- main (not progression) increments `meta.runs` on new run and `meta.deaths`,
  `meta.bestDay` on death, `meta.victory/victories` on victory. `summarizeRun` handles
  Memories, journal-derived records, `deepestZone`, `totalFish`, `memoriesEarnedTotal`.
- Autosave: on `phase:change`, on `fish:landed`, on `shop:buy`, every 30 s of play,
  and on `visibilitychange` hidden / `pagehide`.

Input routing (pointer events on the canvas host; the `#ui` layer sits above with
`pointer-events:none` except on interactive elements):
1. First user gesture anywhere → `audio.unlock()`.
2. If `flow !== 'playing'` or `paused` or `ui.isBlocking()` → game ignores the pointer.
3. pointerdown: `if (survival.onPointerDown(ndc)) return;` (tap an enemy to zap it) →
   `if (actors.pickMerchant(ndc) && progression.canShop()) { ui.openShop(); return; }` →
   `fishing.onPointerDown()`.
4. pointermove: `fishing.onPointerMove?.(ndc)`.
5. pointerup / pointercancel: `fishing.onPointerUp()`.
Keyboard: `ui.handleKey(code)` first (returns true if consumed: menus, J/C/Esc...).
Else `Space` down/up acts as pointer down/up for fishing (aim = last pointer x),
`KeyF` → `survival.flare()`, `Escape`/`KeyP` → `game.togglePause()`.

## 5. State schema & ownership

```js
state.meta = {                // persists forever (core.defaultMeta)
  memories, memoriesEarnedTotal, relics:{relicId:level}, journal:{speciesId:{caught,biggest,firstDay,firstRun}},
  bestDay, deepestZone /*index*/, runs, deaths, victory, victories, totalFish,
  tutorialDone, seenTips:{tipId:true}, unlocks:{}, settings:{master,music,sfx,quality,screenShake}
}
state.run = {                 // one descent; null between runs
  active:true, id, seed, playTime,
  day:1, phase:'calm', phaseTime:0,          // owned by survival
  zone:'mossmere', zonesUnlocked:['mossmere'],// owned by progression
  hp, oil, satiety,                           // owned by survival (max = progression.getStats())
  shells, bait:{baitId:count}, equippedBait,  // owned by progression
  creel:[Fish], upgrades:{upgradeId:level}, legendaries:{speciesId:true},
  bounties:[Bounty], stats:{ fishCaught, fishLost, perfectHooks, enemiesSlain,
    shellsEarned, biggest:{speciesId,weight}|null, newSpecies, damageTaken },
  flags:{}
}
Fish = { uid, speciesId, weight /*kg*/, quality:'normal'|'fine'|'perfect', value, food, oil, caughtDay }
```
Only the owner mutates a field; others call the owner's API
(e.g. eating → `survival.addSatiety(n)`, never `run.satiety += n` from progression).
Exception: `run.stats.*` counters may be incremented by whoever observes the event.

## 6. Events (bus)

Emit exactly these names/payloads (add new ones only as optional extras).
| event | payload | emitted by |
|---|---|---|
| `run:start` | `{continued}` | main |
| `run:end` | `{summary}` | main |
| `phase:change` | `{phase, prev, day}` phases: `calm`→`dusk`→`gloomtide`→`dawn`→(day+1) `calm` | survival |
| `day:start` | `{day}` | survival |
| `resource:low` | `{resource:'oil'|'satiety'|'hp'}` (edge-triggered) | survival |
| `player:damage` | `{amount, source}` | survival |
| `player:heal` | `{amount}` | survival |
| `player:died` | `{cause}` cause: `'darkness'|'starvation'|'gloom'|...` | survival |
| `lantern:out` / `lantern:lit` | `{}` | survival |
| `flare` | `{position:Vector3, radius}` | survival |
| `enemy:spawn` | `{enemy}` | survival |
| `enemy:hit` | `{enemy, position}` | survival |
| `enemy:slain` | `{enemy, position}` | survival |
| `enemy:steal` | `{enemy, fish}` (a fish taken from the creel) | survival |
| `fishing:state` | `{state, prev}` | fishing |
| `fishing:cast` | `{power, target:Vector3}` | fishing |
| `fishing:land` | `{position}` bobber touched water | fishing |
| `fishing:nibble` | `{}` | fishing |
| `fishing:bite` | `{speciesId}` | fishing |
| `fishing:hook` | `{speciesId, perfect}` | fishing |
| `fishing:miss` | `{reason:'early'|'late'}` | fishing |
| `fishing:surge` | `{strength}` | fishing |
| `fishing:caught` | `{speciesId, weight, quality}` | fishing |
| `fishing:escaped` | `{speciesId, reason:'slack'|'snap'}` | fishing |
| `fish:landed` | `{fish, isNew, isRecord, species}` after progression processed a catch | progression |
| `fish:action` | `{action:'keep'|'eat'|'render'|'sell'|'release', fish, gained}` | progression |
| `shells:change` | `{shells, delta}` | progression |
| `merchant:arrive` / `merchant:leave` | `{}` | progression |
| `shop:buy` | `{itemId, item}` | progression |
| `zone:unlock` | `{zone}` | progression |
| `zone:change` | `{zone, prev}` (zone ids) | progression (on travel) & main (on run start, prev=null) |
| `journal:new` | `{speciesId}` | progression |
| `bounty:new` / `bounty:complete` | `{bounty}` | progression |
| `relic:buy` | `{relicId, level}` | progression |
| `victory` | `{}` (final legendary landed) | progression |
| `toast` | `{text, kind:'info'|'good'|'bad'|'lore'}` | anyone → ui shows |
| `ui:modal` | `{open, id}` | ui |

## 7. Module APIs

Coordinates: metres, **water surface y = 0**, raft centred on origin, the Wick stands
at about `(0, 0.35, 0.2)` facing **−Z** (out over the lake). The camera sits behind
(+Z) and above. Casts land in front: `z ∈ [-4, -castMax]`, aimed within ±35° of −Z.
The merchant's barge moors at about `(4.2, 0, -1.5)` (screen right). All models face
**+Z** (so `object.lookAt(target)` points them at the target), up is +Y.
Enemies approach from the dark at 20–40 m. Cavern walls/background from ~30 m to
~150 m; ceiling ~25–40 m up.

### render (`render.js`)
```
renderer, scene, camera, canvas
setQuality('low'|'medium'|'high'|'auto')
setGrade({ exposure, bloomStrength, bloomRadius, bloomThreshold, tint:hex, tintAmount,
           vignette, saturation, grain })          // partial objects merge
shake(intensity=0.3, duration=0.35)                 // respects meta.settings.screenShake
flash(hex=0xffffff, strength=0.5, duration=0.25)    // full-screen additive flash
projectToScreen(vec3) -> {x, y, visible}            // CSS px in viewport
raycast(ndc, objects, recursive=true) -> Intersection[]
getCameraMode() -> string
render()                                            // composer render (main calls last)
```
- Owns `scene.fog` (`FogExp2`) and the clear colour; world sets `scene.fog.color/density`.
- Camera mode is auto-selected each frame from ctx: flow `title`→`title` (slow drifting
  wide shot), `dead`→`death` (slow rising crane), fishing state `reeling`→`reel`
  (closer, framed toward `ctx.fishing.bobberPos`), shop open (`ctx.ui.isShopOpen?.()`)
  →`shop` (look toward merchant), otherwise `fish` (over-the-shoulder, lake ahead).
  Smoothly blend between modes; subtle raft sway; portrait screens widen FOV so the
  raft + lake stay readable on phones.
- Post chain: RenderPass → UnrealBloomPass → custom grade pass (vignette, film grain,
  split-tone tint, gentle chromatic fringe at edges, faint paper texture) → OutputPass.
  `low` quality: pixelRatio ≤1, half-res bloom or none. Auto: mobile→low/medium.

### water (`water.js`)
```
mesh
getHeight(x, z) -> y                // gentle swell, used to bob raft/bobber/props
addRipple(x, z, strength=1)          // expanding ring(s) (≥16 concurrent)
splash(x, z, {size=1, color, count}) // droplet particles + ring
setPalette({deep, shallow, foam, glow, fogColor})   // hex numbers
setLights([{position:Vector3, color:hex|Color, intensity}])  // ≤6 lights reflected as
                                     // glittering streaks (lantern, merchant lamp, glows)
```
Stylised (not realistic): dark ink water, banded fresnel toward fog colour, streaky
painted light reflections, soft caustic shimmer, ripple rings, foam lines at the raft.

### world (`world.js`)
```
group
setZone(zoneId, {instant=false})   // cross-fade/rebuild environment for a zone
getZone() -> zone data object
```
Listens to `zone:change`; reads `ctx.survival.getPhaseInfo()` every frame to darken
and cool the scene through dusk/Gloomtide and warm it at dawn. Owns hemisphere,
directional "crack-light", and ≤3 accent point lights; sets `scene.fog`, calls
`ctx.render.setGrade(...)` and `ctx.water.setPalette(...)` for its zone; feeds glow
positions to `ctx.water.setLights(...)` together with `ctx.actors.lanternLight`.
Builds per-zone: layered parallax silhouettes (4–6 depth layers of cavern
architecture), ceiling stalactites, shoreline props, floating set pieces, drifting
particles (spores/motes/embers), light shafts. Uses InstancedMesh for repeats.

### models (`models.js`)
```
createFish(speciesOrId, weightKg) -> FishVisual
createCreature(kind) -> CreatureVisual      // kind: 'wisp' | 'eel' | 'moth' | 'hand'
FishVisual    = { object3d, length, update(dt, t, {swim=1, struggle=0, flop=0}), setGlow(k), dispose() }
CreatureVisual= { object3d, radius, update(dt, t, {state:'idle'|'move'|'attack'|'hurt'|'die', k}), hit(), dispose() }
```
Fish shapes (data `model.shape`): `minnow, perch, carp, pike, eel, angler, ray, puffer,
jelly, crayfish, koi, ghost, leviathan`. Params: `{shape, body, belly, fin, glow|null,
pattern:'none'|'stripes'|'spots'|'scales'|'bands', eyes:'normal'|'glow'|'blind', scale}`.
Visual size scales with weight relative to the species range. Creatures: `wisp` inky
flying shade with pale pinprick eyes & trailing tendrils; `eel` long shadow eel that
leaps from water; `moth` dusty grey-violet moth with glowing eye-spots; `hand` a huge
dripping shadow hand/claw rising from the water (late-game threat).

### actors (`actors.js`)
```
group, raft, wick, lanternLight (PointLight)
getRodTip() -> Vector3 (new vector, world space)
setLine({visible, end:Vector3|null, tension:0..1, slack:0..1})   // fishing line rod-tip → end
setBobber({visible, position:Vector3, state:'flying'|'floating'|'nibble'|'bite'|'hooked'})
setPose(name)   // 'idle'|'charge'|'cast'|'wait'|'hookset'|'reel'|'strain'|'catch'|'eat'|'flare'|'hurt'|'die'|'celebrate'
setCharge(k)    // 0..1 wind-up amount while charging
setReel(k, lateral)   // reel effort 0..1, lateral pull -1..1
setAim(angle)   // radians, 0 = straight ahead (−Z), + = right
setLanternLevel(k)    // 0..1 oil fraction -> light intensity/radius/flame size; 0 = out
setLightRadius(m)     // gameplay safe-radius hint (visual light distance)
setVitality(k)  // 0..1 hp fraction -> the Wick's head-flame size/colour
showCatch(fishVisual|null)   // Wick holds the fish up; null hides/clears
merchant: { arrive(), leave(), present, position:Vector3, object3d }
pickMerchant(ndc) -> bool
setRaftLevel(n) // 0..3 cosmetic raft upgrades
```
The Wick (ORIGINAL character): small round-bodied candle-creature, dark cloak/mantle,
a living candle flame on top of its head (flame = vitality), two small glowing amber
eyes in a shadowed face, little stubby legs, holds a long bent rod. The raft: lashed
dark planks, a crooked pole with a hanging iron lantern (main light), a tiny brazier,
a wicker creel. Merchant "Old Murk": a hunched mossy toad with a towering pack of
wares and a dim green lamp, riding a lily-barge, rings a bell on arrival.

### fishing (`fishing.js`)
```
state            // 'idle'|'charging'|'casting'|'waiting'|'bite'|'reeling'|'landing'|'lost'
view = { charge, castDist, aim, tension, sweetMin, sweetMax, danger, progress, surge,
         surgeWarn, stamina, biteWindow, speciesId|null, rarity|null, hint }   // read by ui
bobberPos        // Vector3 | null
spots            // [{position:Vector3, radius, strength, ttl}] shimmering hot spots
onPointerDown(), onPointerMove(ndc), onPointerUp(), cancel(reason)
isBusy() -> bool // anything but idle
```
Flow: hold → charge (ping-pong meter, timing matters) with aim from pointer x →
release casts (ballistic bobber, splash, ripples) → waiting (nibbles = small dips;
tapping on a nibble spooks the fish) → bite (bobber plunges + `!`; tap within the
reaction window; perfect early tap = bonus) → reeling minigame (hold to reel/raise
tension, release to ease; progress only within the safe band, double in the sweet
zone; telegraphed surges spike tension → release or snap; zero tension too long →
slack escape) → landing (fish lifted, `fishing:caught`) → idle. Species chosen with
`data` weights by zone, distance, phase, bait, spots and `progression.getStats()`.
Owns hooked-fish visuals (via `ctx.models.createFish`, splashes/leaps during surges),
spot visuals, cast aim reticle on the water. Drives actors (pose, line, bobber, aim).

### survival (`survival.js`)
```
getPhaseInfo() -> { phase, day, time, duration, k /*0..1*/, isNight, nextPhase }
damage(n, source), heal(n), addOil(n), addSatiety(n)
flare() -> bool       // lantern burst: costs oil, cooldown, kills/knocks back enemies in radius
onPointerDown(ndc) -> bool   // tap enemy to zap it (costs a little oil); true if consumed
enemies              // live enemy list [{id, kind, position, hp, ...}]
```
Runs the clock (phase durations from data), resource drains (scaled by phase/zone/
stats/difficulty), starvation & darkness damage, i-frames, death (`player:died`),
enemy spawning/AI/visuals (via `ctx.models.createCreature`), flare VFX. Calls
`ctx.actors.setLanternLevel`, `setLightRadius`, `setVitality` every frame. Emits
`resource:low` edge events. Debug: `ctx.debug.skipPhase()`, `ctx.debug.god(on)`,
`ctx.debug.spawn(kind)`.

### progression (`progression.js`)
```
getStats(run = ctx.state.run) -> Stats            // all data.STATS keys, base + upgrades + relics
createRun({startZone='mossmere'}) -> run          // fresh run with relic start bonuses applied
summarizeRun(cause) -> RunSummary                 // applies Memories & meta records
makeFish(speciesId, weight, quality) -> Fish
addToCreel(fish) -> bool, removeFromCreel(uid) -> Fish|null
fishAction(fishOrUid, action) -> {ok, msg, gained}  // 'keep'|'eat'|'render'|'sell'|'release'
canShop() -> bool                                  // merchant present & run active
shop: { getItems() -> ShopItem[], buy(itemId) -> {ok, msg} }
getZones() -> [{...zone, unlocked, current, canTravel, reason}], travel(zoneId) -> {ok, msg}
getJournal() -> [{species, discovered, caught, biggest}]
getBounties() -> Bounty[]
getRelics() -> [{...relic, level, nextCost, canBuy, maxed}], buyRelic(id) -> {ok, msg}
getWaystones() -> zoneId[]                         // zones available as run start points
equipBait(baitId) -> {ok,msg}
```
Listens to `fishing:caught` → builds Fish, updates journal/records/bounties → emits
`fish:landed`. Controls merchant arrival/departure on phase changes
(`ctx.actors.merchant.arrive()/leave()`), emits `victory` on landing the final
legendary. RunSummary = `{cause, day, zone, fishCaught, shellsEarned, newSpecies,
enemiesSlain, legendaries, memories, breakdown:[{label, value}], records:[string]}`.
ShopItem = `{id, name, desc, category, price, level, maxLevel, canBuy, reason}`.

### ui (`ui.js`, `ui.css`)
```
isBlocking() -> bool    // any modal open (pauses gameplay)
isShopOpen() -> bool
handleKey(code) -> bool
showTitle(), showDeath(summary), showVictory(summary)
openShop(), openCreel(), openJournal(), openShrine(), openSettings(), openPause(), closeAll()
showCatch(fish, {isNew, isRecord, species})   // catch card: Keep / Eat / Render / Release
toast(text, kind), floatText(worldPos, text, cssColor), banner(title, subtitle)
```
Builds everything inside `#ui`. Listens to bus (`fish:landed` → catch card,
`zone:change` → area title banner, `phase:change` → "Gloomtide rises" banners,
`toast`, damage vignette pulses, first-run contextual tips stored in `meta.seenTips`).
HUD: embers (hearts as small flames), lantern oil gauge, satiety gauge, shells,
day + phase clock, zone name, bait, creel count, buttons for Creel/Journal/Pause
and "Trade" when the merchant is present. Fishing UI reads `ctx.fishing.view`
(charge meter, bite prompt at the bobber, reel tension gauge with sweet band,
surge warnings, progress). Must work with touch (≥44px targets) and keyboard.

### audio (`audio.js`)
```
unlock()                      // resume AudioContext on first gesture
play(name, {volume=1, pitch=1, pan=0})
setMood(mood)                 // optional manual override; otherwise auto from ctx
applySettings()               // read meta.settings volumes
```
SFX names: `ui_click, ui_hover, ui_open, ui_close, cast_whoosh, bobber_plop, nibble,
bite, hook, reel_tick, line_strain, line_snap, splash_small, splash_big,
catch_fanfare, new_species, coin, buy, eat, render_oil, flare, enemy_spawn,
enemy_hit, enemy_die, player_hurt, heartbeat, gloom_rise, dawn, merchant_bell,
zone_travel, death, victory, denied`.
Moods (auto-picked each frame from flow/phase/fishing): `title, calm, dusk, gloom,
reel, boss, death, victory`. Subscribes to the bus to trigger most SFX itself.
Fully procedural (oscillators, filtered noise, generated reverb impulse). Melancholic,
sparse, original music: soft plucked/harp-like minor-key motifs, low drones, drips.

## 8. Data schema (`data.js`)

```js
export const STATS = { key: { label, base, fmt:'int'|'pct'|'x'|'m'|'s'|'num' } }
// Required keys (exact names):
// maxHp, maxOil, maxSatiety, oilDrain, satietyDrain, lightRadius, flareCost,
// flareRadius, flareCooldown, zapCost, zapDamage, castMax, lineStrength, reelSpeed,
// sweetZone, biteSpeed, hookWindow, rarityBonus, creelSize, sellMult, foodMult,
// oilYieldMult, armor, slackTime, nibbleTells
export const BALANCE = { phases:{calm,dusk,gloomtide,dawn} /*seconds*/, ... }
export const ZONES = [{ id, name, subtitle, index, unlock:{shells, requires?}, drain:{oil, satiety},
  gloom /*enemy multiplier*/, valueMult, palette:{ fog, fogDensity, water, waterDeep, foam, glow,
  accent, ambient, ink, far, light }, description }]
export const SPECIES = [{ id, name, zone, rarity:'common'|'uncommon'|'rare'|'legendary',
  weight:[min,max], value, food, oil, time:'any'|'calm'|'gloom', dist:[min,max] /*0..1 of castMax*/,
  bait:null|baitId, difficulty:{ power, surgeEvery, surgeTime, stamina, sweet /*mult*/,
  erratic, window /*s*/ }, behavior:'steady'|'darter'|'sinker'|'thrasher'|'leaper',
  model:{shape, body, belly, fin, glow, pattern, eyes, scale}, lore }]
export const BAITS = [{ id, name, desc, price, bonus:{...} }]
export const UPGRADES = [{ id, name, desc, category, maxLevel, costs:[], effects:{statKey: perLevel}, zone? }]
export const SUPPLIES = [{ id, name, desc, price, give:{oil|satiety|hp|...} }]
export const RELICS = [{ id, name, desc, maxLevel, costs:[], effects:{statKey: perLevel} | special }]
export const ENEMIES = [{ id, name, model:'wisp'|'eel'|'moth'|'hand', zoneMin, hp, speed, damage,
  oilDrain, behavior, ... }]
export const BOUNTIES = [ templates ]
export const TIPS = [{ id, text, trigger }]
export function difficultyFor(day, zoneIndex) -> { spawnInterval, maxEnemies, hpMult, speedMult,
  damageMult, drainMult, kinds:[enemyId] }
export function memoriesFor(summaryLike) -> { total, breakdown:[{label, value}] }
```
Effects are additive per level on the STATS keys.

**STATS semantics** (all modules must agree):
| key | meaning |
|---|---|
| maxHp | max Embers (hearts, integer) |
| maxOil / maxSatiety | gauge capacity |
| oilDrain | oil units/s during `calm` (× phase, zone, difficulty multipliers) |
| satietyDrain | satiety units/s (× zone, difficulty) |
| lightRadius | metres of protective lantern light at full oil (scaled by oil fraction) |
| flareCost / flareRadius / flareCooldown | oil per flare, burst radius m, seconds |
| zapCost / zapDamage | oil per tap-zap on an enemy, damage per zap |
| castMax | max cast distance m |
| lineStrength | tension capacity multiplier (higher = tension rises slower, snaps later) |
| reelSpeed | reel progress multiplier |
| sweetZone | sweet-band width as a fraction of the tension gauge (before species `sweet` mult) |
| biteSpeed | divides waiting time before bites |
| hookWindow | multiplies the bite reaction window |
| rarityBonus | additive luck shifting weights toward rarer species (0 = none) |
| creelSize | creel slots |
| sellMult / foodMult / oilYieldMult | multipliers on Shells / satiety / oil from fish |
| armor | chance 0..0.6 to negate an incoming hit |
| slackTime | seconds at ~zero tension before a hooked fish slips away |
| nibbleTells | ≥1: real bites get an early visual tell (nibbles become readable) |

**Species `difficulty` semantics**: `power` (0.5–3) tension gain multiplier while
reeling and surge strength; `surgeEvery` mean seconds between surges; `surgeTime`
seconds a surge lasts; `stamina` seconds of safe-band reeling needed at reelSpeed 1
(sweet zone counts double); `sweet` multiplier on sweet-band width (<1 harder);
`erratic` 0..1 noise/jitter in tension & movement; `window` bite reaction seconds
(× hookWindow). `behavior` flavours the pattern: steady (regular surges), darter
(short frequent surges, lateral dashes), sinker (constant heavy pull, few surges),
thrasher (long violent surges), leaper (surges = leaps out of the water; slack risk).

## 9. Art direction — "hand-inked melancholy" (inspired by, never copying, Hollow Knight)

Look: a hand-painted 2.5D storybook rendered in 3D.
- **Silhouette first.** Foreground props and characters read as near-black ink shapes
  with pale rim light (`toon.toonMaterial({rim})` + `toon.addOutline`). Faces are
  minimal: glowing eyes only.
- **Layered depth.** 4–6 parallax planes of cavern architecture (arches, spires,
  roots, hanging chains, broken bridges, giant fungi/crystals per zone) that fade
  from ink-dark near layers to luminous misty far layers in the zone's fog colour.
- **Limited palettes.** Each zone = one dominant desaturated hue + one bioluminescent
  accent + bone-white highlights. Mossmere: teal/moss green. Sporewood Pools:
  dusky plum + amber/pink spores. Glasswater Vault: indigo + cyan/violet crystals.
  The Pale Abyss: near-black + bone-white + sickly gold.
- **Light is life.** The warm amber lantern is the only warm light in a cold world.
  Bloom on glows, drifting motes, soft light shafts from cracks above, vignette,
  fine grain.
- **UI:** thin ornate bone-white linework, serif display type (Cinzel /
  Cormorant Garamond with Georgia fallback), ink-wash panels, elegant flourishes,
  restrained motion (fades, slow rises).
- **Originality:** do NOT reproduce Hollow Knight characters (no white horned
  masks), names (Hallownest, Geo, Soul, Charms, Masks, etc.), locations, music, or
  its HUD layout (mask icons + soul vessel). Use our own names: Shells, Embers,
  Memories, Relics, the Wick, Old Murk, the Gloom.

## 10. Performance budget

60 fps on a mid laptop, playable on phones. ≤ ~250 draw calls, ≤ 4 dynamic point
lights total (lantern + merchant + ≤2 world accents), no shadow maps (use blob
shadows), InstancedMesh for repeats, particles as a few `THREE.Points` systems,
dispose what you remove, no per-frame allocations in hot paths (reuse vectors).

## 11. Testing

- `node build.mjs` → `index.html`. `--dev` for readable traces. `--only=fishing,actors`
  builds with every other module stubbed; `--out=tools/out/x.html` to avoid clobbering.
- `node tools/playtest.mjs [--html=path] [--shots=dir] [--script=file.mjs]` launches
  headless Chromium (software WebGL), reports console errors, page errors, and takes
  screenshots. Look at the screenshots (they are PNG files you can Read).
- Debug API in the page: `window.__gw` (= ctx), `ctx.debug.*` cheats, e.g.
  `__gw.game.startNewRun({})`, `__gw.time.timeScale = 8`.
