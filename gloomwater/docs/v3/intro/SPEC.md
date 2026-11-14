# The opening cut scene: "One Warm Light" (binding spec for both build lanes)

**Status: built and staged** (branch `gw-intro`; both lanes merged and tuned as one piece). Where the build departs from the plan
below, the numbers here were brought up to date and **§12 "As built"** lists every departure with its reason; `docs/v3/intro/LANE-A.md`
and `LANE-B.md` are the lanes' own records. What follows was written as the plan:
the lead's verdict on three storyboards, with the seam already in the tree (branch `gw-intro`): the `INTRO` table and its
validator rules, a director skeleton, a stage stub that already flies the film's camera, the render and world hooks, the lane
markers, a seam test and a seek-driven frame-strip scenario. **Lane A ("set and picture")** and **lane B ("director and flow")**
build from this document at the same time and do not talk to each other; a third agent merges them. Where this document and
`src/data.js` `INTRO` disagree on a number, data wins (the validator holds the limits). CONTRACT §13.13 is the API summary;
DESIGN §25.4.9 is the short design record.

The user: *"Create a cut scene intro for the start of a new game, which is skippable but is around 15-20s long."* Standing taste:
art, atmosphere and fishing first; very few words, one short line at a time, no boxes; the Clear Night look with the lake's
mirror as the showpiece; the Starlit palette, green only as a trace, one warm light in a cold world; never a ring or disc around
the raft; original (other games are mood only).

## 1. Verdict

Scores 1–5, criteria in judging order (the first weighs most).

| | "one-take" | "four-shots" | "ink-to-world" |
|---|---|---|---|
| 1 art and atmosphere in this engine, this look | 4 | **5** | 2 |
| 2 the story, to someone who knows nothing, in the fewest words | 3 | **5** | 4 |
| 3 the ending flows into play, no menu, no click | **5** | 4 | 4 |
| 4 cost and risk on a phone; how it degrades | 4 | 3 | 3 |
| 5 originality | **5** | 4 | 4 |

**Winner: "four-shots" (*One Warm Light*)**, rebuilt on "one-take"'s staging and hand-off. Why, from the code and from probe
frames shot on this branch (`docs/v3/intro/probe/*.jpg`, re-shootable with `probe.scenario.mjs`):

- The engine's best picture is exactly four-shots' first shot. With nothing but placeholder boxes, a great amber lantern and
  lit windows on the Sunken Gate, mirrored in the violet lake as broken gold columns, is already beautiful in landscape
  (`02`, `03`) and as a totem on a phone at the medium tier's ⅓-size mirror (`04`, `05`). It follows one warm light
  from start to end, which is the game's own rule, and it reads without a word.
- "one-take" puts the whole story *inside* the reflection. That is the most original idea on the table, but the story then
  lives in a ⅓-size, rippled buffer, does not exist at all on the low tier (no mirror), and asks the viewer to read a fall
  that travels *up* the frame. Its staging is right, though: the live Mossmere is the set, nothing is built, and the film ends by
  starting the run in place.
- "ink-to-world" spends 15.6 of 18 s on a procedurally painted 2D scroll. That is the fine-illustration risk the brief warns of,
  and it hides the look the user asked for until the last seconds.

**Grafted from "one-take":** the live lake as the set and the hand-off at the end event (`zone:change {intro: true}`, no fade, no
rebuild); the lake's *memory* (the windows' reflections stay lit a beat after the towers go dark, mirror-only meshes); no
three.js light and no shadow map; the lantern's gold path through `water.setLights`; the skip that simply finishes the move in
the last beats; *Begin* going straight in on a fresh save. **Grafted from "ink-to-world":** the fourth line, "You are one of
them." (already canon); the fish too big for the frame and never whole; every value a pure function of timeline time;
phone portrait composed down the centre axis, not cropped.

**The lead's changes** (each from reading the code):
1. **The lantern hangs over the lake, not in the gate.** The Sunken Gate stands 16 m *beyond* the north shore, behind the cliff
   ring (world-art.js `at(ga, 16)`: (0, −77.6); the shore is at −61.6). A lantern falling there vanishes behind rock (probe `08`).
   It hangs 44 m in front of the gate, over open water, on chains that run up out of frame, and falls into its own reflection.
2. **No second set under the lake.** The dark below is a camera-parented ink card with three things in front of it. The world
   is never hidden and nothing is built 60 m down.
3. **The pale fish is a shape, not the model.** A flank built from kit pieces, owned and disposed by the stage. The
   Lantern-Swallower's real model stays unseen until the endgame, and nothing is left in the fish factory's cache.
4. **The run is created at the end event, not under the dark shot** (the one departure from the lead's first direction; the
   picture is the same). Reasons: (a) there is nothing for the dark to cover today, the title's lake is already run 1's lake
   (`world.titleZone()`; `setZone` on the same zone returns early), so the last shot *is* the live opening; (b) every system keyed
   on flow `playing` or `run:start` (HUD, tips, banner, autosave, input, the phase clock) stays off without touching those
   modules; (c) a closed tab leaves the save untouched. The dark beat remains the cover slot for the day something must be
   built (§7.5).

## 2. The film (18.0 s)

Anchors: **S** = the raft's spawn `world.getSpawn()` (0, 46); **G** = the Sunken Gate `world.getHeroAnchor()` (0, −77.6);
[east, up, south] metres from the anchor, so −z is north. Landscape numbers first; the phone's are in the last column.
Exact keys: `INTRO.cameras`, `INTRO.set`, `INTRO.lines`, `INTRO.sound`.

| beat · t (s) | picture | camera | light and palette | line | sound | phone portrait (390 × 844) |
|---|---|---|---|---|---|---|
| **lit** 0–5.0 | 0–0.35 night ink closes over the title, its name and its two words still standing (DOM veil; they are taken away under the full ink, never faded by themselves); the stage swaps in under full ink at 0.45; ink lifts 0.6–1.4 on **the lit kingdom**: the gate's towers with 54 amber windows, the great lantern on its chains over the lake, all of it again in the water | take `gate`: from S + (0, 2.2, −12) looking at G + (0, −3.6, 0) (3° down), fov 46, one slow push to S + (0, 1.8, −21.5). The raft is behind the lens. Waterline 46–49 %, the lantern's mirror image ending at 82–83 % (clear of the words band) | violet-dusk water and sky as the lake has them; **amber only**: lantern glass ×2.6, windows ×2.0, one halo; on the low tier (no mirror) the lantern's broken gold path on the water; where the lake is a mirror the reflection itself is the gold and no pool is laid. The raft's own lantern is out (`setIntroKindle`): one warm light | L1 1.2–4.5 | title harp out in 0.3 s; bowed drone D2 + A2; one great bell D3 at 1.0; glass chord D–A–E from 1.4 | same position, fov 62, look G + (0, 4, 0): the whole gate, spires and all; waterline ≈ 53 %, the mirror lantern ending at 77–80 % |
| **fall** 5.0–8.2 | 5.6 a chain parts (a spark at the top of frame); 5.9 the lantern drops, tilting 0.22 rad; **its reflection climbs to meet it**; each row of windows gutters out as the lantern's base passes its height, top down, while **the reflections stay lit 1.2 s longer and sink** (medium / high); 7.9 contact: a pale-gold flash and one widening pale-gold ring; **hard cut** at 8.2 | same take, still pushing; fov 46 → 36 from 5.9 as the pair converges on the waterline | the frame loses its warmth row by row; at contact only the lantern is left | L2 4.8–8.1 | chain ping 5.6; the top voice falls a fifth and the drone a semitone 5.9–7.9; 7.9 sub thump + low bell, a 300 Hz lowpass closes | fov 62 → 50; the fall runs down the centre axis |
| **below** 8.2–12.4 | ink. Where the lantern went under, **the ember sinks** (frame (0.5, 0.12) → (0.5, 0.46) as fractions from the top-left, shrinking from 14 % to 3 % of the height, amber to deep orange) until 10.0. From 9.4 **a pale flank too big for the frame** slides across: an eye at 10.2, the body over the ember at 10.4, the ember glowing through its belly and travelling with it; gone by 12.2; 0.2 s of ink | the camera is already on the next take under the card | night ink #0A0C19 up to the lake's violet-dusk at the top (`inkTop` #3E2568, which the frame's grade lands at hue 252); 60 slow motes; pale stone #D6D6E4 flank with a violet-dusk shadow side; the ember is the only warm pixel | none (wordless) | sub drone D1 + A1 under the lowpass; `ember_swell` 9.0; one slow, patient groan 9.6 | the flank crosses on a 28° diagonal, lower-left to upper-right |
| **wick** 12.4–14.6 | 12.5 a spark at the Wick's head; the ink thins 12.6–13.8; **the flame catches, gutters, catches** (0 → 0.25 → 0.9 → 0.3 → 1 by 13.4); 13.5–14.2 its hanging lantern takes and its pool spreads on the water (feathered, no ring). Beyond: the gate, dark, eight candle slits left, mirrored | take `shoulder`: S + (2.6, 2.6, 5.2) looking at S + (−0.4, 2.0, −30), fov 40; a 0.3 m drift | the first run's opening light (`world.setIntroMood`): the lake as the player will have it; the Wick's flame is the one warm light | L3 12.7–15.1 | spark tick; `flame_catch` 12.8; the lowpass opens to 6 kHz in 0.8 s, the lake's water returns | S + (0.72, 2.6, 5.4) looking at S + (−0.2, 3.4, −30), fov 52: nearly straight behind the Wick, which stands whole in the lower-left third; the gate upper-centre |
| **home** 14.6–18.0 | the camera cranes back and up into **the play camera**; at rest from 17.0; the last line comes in under the raft as it settles; at 18.0 control begins: the lake's name rises as its banner, the HUD fades in (0.6 s) | take `home`: the pose's weight goes 1 → 0 (inOutSine, 14.6–17.0) into render's own settled `sail` rig (elev 24°, 15 m, fov 52), then 1 s at rest with the rig's own sway | unchanged: nothing pops when the run starts | L4 16.05–17.6 | solo harp, the Mossmere motif's first four notes (D4 F4 A4 G4, 58 BPM) from 14.6; the last rings into the calm bed | the rig's own portrait frame (fov 74, 20.7 m, elev 31°) |

**The lines** (`INTRO.text`; 46 / 47 / 34 / 20 characters; present tense; no % and no exclamation mark):

1. A kingdom hangs a great lantern over its lake.
2. The lantern falls. The kingdom follows it down.
3. Its last candles fish to stay lit.
4. You are one of them.

Type: Alegreya italic, 19 px desktop / 18 px phone (never under 16), pale ink `#ECEBF6` on a feathered night-ink pool
(`rgba(10,12,25,.78)` at its centre, the same pool as a lore toast; no box, no border; on a phone held upright the foot of the picture sinks into ink across the whole width instead), centred, at most two rows (line 1 or 2 may wrap on a
phone, `text-wrap: balance`), inside **the words band**: 86–95 % of the viewport height in landscape, 90–97 % in portrait
(`INTRO.words.band`, above the bottom safe area). Each fades in and out over 0.4 s on the film's clock. Each is announced once
through an `aria-live="polite"` region. Lane A keeps the lantern, its mirror image, the ember and the Wick's flame out of the band.

## 3. Timeline rules (A1)

- The film is `INTRO.length` = **18.0 s** from its first frame to `intro:done`. Its clock adds, each frame, the real elapsed time
  clamped to `INTRO.clock.maxDt` (0.1 s); it does not advance while `document.hidden`; a **safety valve** ends it after
  `INTRO.clock.valve` = 25 s of visible time (each frame counts at most `valveDt` 0.25 s), whatever the frame rate.
  `stepClock()` in `src/intro.js` is that rule, pure and tested.
- Everything on screen is a function of the film's `t` alone: the stage (`setTime(t)`), the words and the opening veil (the view
  reads `lineAt(t).k` and `veilAt(t)`), the stills. The sound is scheduled per mark as the clock crosses it (§7.7).
- One hard cut (8.2 s, contact → ink). Every other change is a move or a fade. Under reduced motion or `reducedFlashing` the cut
  is a 0.3 s ink dip and the contact flash is quartered.

## 4. The set (lane A)

Everything is added by the stage to its own group under `ctx.render.scene`; nothing in the live arena is edited, hidden or
dimmed. "Mirror" = the object carries `toon.REFLECT_LAYER` so the lake's planar reflection draws it (medium, high).

| # | piece | new / reused | where and how | calls main + mirror | triangles |
|---|---|---|---|---|---|
| 1 | **the great lantern** | new (`intro-models.js`): an eight-sided iron cage, a lathed roof with a wide eave, a base ring (one merged `toonMaterial` mesh, flat-shaded, `iron`; no inverted-hull outline at 60 m), one eight-sided block of amber glass (vertex colours × 2.6), one halo (`glowSprite`, 30 m, 0.55) | G + (0, 14.2, 44), 7.6 m tall (as built: bigger and lower, so its mirror image clears the words band); open water is checked at build (`world.isOpenWater(x, z, 4)`, else step 2 m south). `castShadow` false | 3 + 3 | ≈ 700 |
| 2 | its chains | new: three thin dark tubes (`taperTube` or `tube`) from the cap up to y 70, part of the lantern's group, so they trail it down | — | 1 + 1 | ≈ 300 |
| 3 | its light on the water | reused: `world.setIntroWaterLight({x, y, z, color, intensity 14, radius 27, streak 0.75})` **on the low tier only** (as built): the gold path there is the lantern's only reflection. Where the lake is a mirror (medium, high) no pool is laid (`intensityMirror` 0): from the film's lens it was one flat mustard band along the far shore. Follows the lantern down; 0 after contact | low | 0 | 0 |
| 4 | the windows "then" | new: 54 slits (3 columns × 9 rows per tower, 0.8 × 1.8 m boxes), one `InstancedMesh`, `glowMaterial(candle, 2.0)`; per-row brightness from the fall (`dark.follows: 'lantern'`, each row gutters out over 0.35 s). The lake's own 8 slits and 3 braziers are "now": never touched | on the towers' lake faces, by world-art's `r0` formula | 1 + 1 | 648 |
| 5 | their halos | reused: `world-fx.createHalos(64)`, one point each second window | — | 1 + 1 | points |
| 6 | **the lake's memory** | new: a twin of #4 on `REFLECT_LAYER` **only** (`layers.set`), lit 1.2 s longer than its row and rising 5 m in world space (so its mirror image sinks). Medium / high only. First piece to cut (§11) | — | 0 + 1 | 648 |
| 7 | the contact | new: one additive pale-gold ring (r 2 → 30 m in 1.6 s, opacity to 0) and the halo's flash, both functions of t; plus, only when `opts.live`, `water.splash(x, z, {size: 4, color: 0xf0d49c})` once | at the lantern's foot | 2 + 0 | ≈ 70 |
| 8 | **the ink card** | new: one quad parented to `ctx.render.camera`, sized from fov and aspect every frame, `fog: false`, in the transparent pass at `renderOrder` 900 (after everything of the world's), `depthFunc: AlwaysDepth` with `depthWrite` on: it covers the world **and resets the depth under it**, so the pieces in front of it sort among themselves and the world cannot cut into them. A vertical gradient `ink` → `inkTop` (vertex colours); opacity 1 from 8.2, 1 → 0 over 12.6–13.8, opening from the Wick's flame (a radial term in the fragment alpha; a plain fade is the fallback) | layer 0 only | 1 | 2 |
| 9 | motes | new: 60 `Points` in camera space, drifting up as a function of t | in front of #8 (`transparent`, `renderOrder` 901) | 1 | points |
| 10 | **the ember** | reused: two `glowSprite`s (a core and a soft halo), `ember` → `emberDeep`, `depthTest: false`, `renderOrder` 903 (it shows *through* the flank, dimmed 0.45, while covered) | camera space, from `set.below.ember` | 2 | 4 |
| 11 | **the pale flank** | new (`intro-models.js`): one lathed body 22 m × 5.2 m from a profile table (flat-shaded `toonMaterial`, `flank`, rim toward the key), one fin-and-ridge mesh, one eye (an ink disc with a pale-gold glint); rigid; it only translates, and never shows nose and tail in one frame | camera space, nearer than the card, materials flagged `transparent` (opacity 1) so they draw after it at `renderOrder` 902 with the depth test on | 3 | ≈ 2,400 |
| 12 | the spark | reused: one `glowSprite` at `actors.getHeadPos()`, 12.5–12.7 | world space | 1 | 2 |
| 13 | **the Wick's kindling** | new hook, lane A: `actors.setIntroKindle({wick, lantern} \| null)`: straight multipliers (0–1) on the head flame (scale, intensity, halo, eye glow) and on the raft lantern (light intensity, glass, halo, flame, the pool's `uK`), applied after the existing easing. 0 / 0 from the swap; `wick` from `set.wick.flame`; `lantern` 0 → 1 over 13.5–14.2; `null` on exit | actors.js, actors-wick.js | 0 | 0 |

- **Budget** (`INTRO.set.budget`, checked by the strip scenario from `stage.stats()`): the set's own cost in any frame, all passes,
  **≤ 30 draw calls and ≤ 10,000 triangles** (the acceptance ceiling is 60 / 40,000); **0 lights, 0 shadow maps, 0 render
  targets**; ≤ 2 textures of its own (shared: only `toon.glowTexture(128, 2.2)`, which the raft already uses and which is never
  disposed here). The peak is `fall`: #1–#7 ≈ 16 calls.
- **Tiers.** Low: no mirror, so #6 is not built and the lantern's reflection is the water's analytic gold streak under #3; no
  shadow map exists on low and the set adds none anywhere. Medium / high: as the table.
- **Purity.** `setTime(t)` sets every transform, colour, opacity and visibility from `t` (and the viewport aspect) alone. No
  `dt` integration, no `Math.random` at run time (seed tables at build). Allowed impurities: the world's own ambient motion
  (water, flames, stars), the damped mood, and the live-only splash.
- **Prebuild.** `prebuild()` builds geometry and materials and warms their programs with `renderer.compile(group, camera, scene)`
  under the title, in idle time; it adds nothing visible. Target ≤ 60 ms in total on a phone (`budget.prebuildMs`); if it is
  ever more, slice it. `enter()` builds synchronously whatever is missing (the opening ink covers it).
- **Disposal.** `dispose()` removes the group and frees every geometry, material and texture the stage created;
  `renderer.info.memory.geometries` and `.textures` return to their values before `prebuild()`.
- **Never:** a new ring, disc or halo around the raft or the Wick (the raft keeps only what the game already draws: its own
  feathered pool; the contact ring is 80 m away, at the lantern's foot); green or teal (`INTRO.set.colors` is hue-checked); an
  edit to the live arena.

## 5. Cameras (lane A)

`INTRO.cameras.takes`: `gate` (0.45–8.2, four keys), `shoulder` (8.2–14.6, two keys; under the ink card until 12.6), `home`
(14.6–18.0, `rig: 'sail'`, blend 14.6–17.0). `introCamera(INTRO, t, aspect)` in `src/intro-stage.js` evaluates them (Catmull-Rom through a take's
keys with zero velocity at its ends, `portrait` values blended in between aspect 1.1 and `portraitBelow` 0.9) and is already
tested; the stage resolves the anchors and calls `render.setIntroCamera({pos, look, fov, w})`.

- `render.setIntroCamera(pose)` lays the pose over the rig's own with weight `w` (at 1: exact, no sway, no roll) and **holds the
  rig in `sail`** while a pose is set, whatever the flow. So in `home` the weight simply runs to 0 and the picture *is* the play
  camera, sway included; when the run starts the mode does not change and nothing moves. `null` releases it.
- **Composition rules (binding; retune the keys freely inside them, judge on strips):** (a) from 1.4 s to the contact the lantern
  and its mirror image are both wholly in frame, the waterline between 46 % and 56 % of the height; (b) nothing the story needs
  sits in the words band; (c) the raft is not in the `gate` take; (d) in `wick` the Wick's flame sits in the lower-left third
  and the gate's two towers are both in frame; (e) the `home` blend ends at least 0.4 s before the end (validated) and starts
  from a pose with the Wick in frame; (f) portrait is composed with its own keys, not cropped: the fall on the centre axis.
- Starting numbers come from the probe: landscape `02`/`03` (lantern at y 20, z −30 put the mirror image at the frame's foot:
  hence y 17, z −33.6 and a 2° down tilt), portrait `04`/`05`.

## 6. The stage contract (lane A)

`src/intro-stage.js` (the stub's header is the contract): `createIntroStage(ctx)` → `{ prebuild(), ready, enter({replay,
reduced}), setTime(t, {live, seek, reduced}), exit(), dispose(), stats() }`, plus the pure exports `introCamera`, `introTake`,
`portraitWeight`, `introAnchors`, `resolvePoint`.

- Before `INTRO.swapAt` (0.45 s) `setTime` shows nothing, leaves the title camera and the world's mood alone; from the swap on
  the set is live, the camera is the film's, the raft's light is out and the world wears the first run's opening mood
  (`world.setIntroMood(true)`: night 0, warm 0.35, no title multipliers), so the last shot is lit exactly as the run is.
- `setTime(INTRO.length)` is the end state: the set invisible, the ink card clear, kindle 1 / 1, `w` 0. A skip jumps there.
- `exit()` gives back the camera, the mood, the water light and the kindle (`null`), and never throws. `dispose()` = `exit()` +
  free. Both are idempotent. The director calls `dispose()` at the end, after a skip, on `stop()` and on any error.
- The stage never reads a clock, listens for input, touches the DOM, plays a sound, writes `state`, emits on the bus, or
  creates a light or a render target.
- Hooks lane A owns in other files, all additive, all inside `// >>> INTRO LANE A` … `// <<< INTRO LANE A` blocks, all inert
  with the flag off: `render.setIntroCamera` / `getIntroCamera`, the rig held in `sail`, `zone:change {intro: true}` ignored by
  render (built in the seam commit); `world.setIntroMood`, `world.setIntroWaterLight`, `world.getHeroAnchor` (built);
  `actors.setIntroKindle` (to build). Optional: skipping `water.renderReflection` while the ink card is fully opaque.

## 7. Director and flow (lane B)

`src/intro.js` (the skeleton's header is the contract): `create(ctx, {debug, hasSavedRun})` → `ctx.intro` =
`{ init(), pending(), prewarm(), start({replay, reduced}), skip(), update(realDt), seek(t), resume(), stop(), isActive(), state,
setOptIn(on), stage }`, plus the pure exports `beatAt`, `lineAt`, `veilAt`, `stillAt`, `stepClock`, `introPending`, `introOptIn`.
Main calls `ctx.intro.update(rawDt)` once a frame **before** the module loop (wired). Events: §8.3.

### 7.1 The trigger (A3)

- `ctx.intro.pending()` = `introPending(...)`: v3 on, `INTRO` present, `meta.runs === 0`, `!meta.intro?.seen`, no run waiting,
  and **in a debug build only after an opt-in** (`globalThis.GW_INTRO === true` before the page's scripts, `?intro=1`, or
  `debug.intro('auto', true)`). The test harness sets `GW_DEBUG`, so no existing scenario ever sees the film.
- **The title while pending:** the primary word is **Begin** (autofocus, the main style) and calls `game.beginIntro()`: no New
  Descent panel (a fresh save has one Wick, one lake and one night card: nothing to choose). The premise paragraph is not shown
  (the film says it); Journal, Shrine and Trials (all empty) are left out; Settings stays. The title asks the director to
  `prewarm()` in idle time. With `pending()` false the title is today's, plus the replay word (§7.4).
- `game.beginIntro()`: the title's screen is closed for the game but its picture is kept standing (`ui.intro.takeTitle()`), then
  `ui.closeAll()`, `setFlow('intro')`, `ctx.cinematic = true`, `ctx.intro.start({replay: false, underInk})`. No other click exists
  between Begin and play.
- Once: `meta.intro = {seen: true, skipped}` is written at the end event and saved by the run's first save in the same task.
  Never on later runs (`meta.runs > 0`).

### 7.2 While it plays (A4)

- **Flow `intro`** (new): no run, `gameDt` 0, so player, fishing, survival, combat and progression do not tick; no HUD (it
  belongs to `playing`), no autosave, no pause, and `gameAcceptsInput()` is false, so nothing reaches the game.
  `ctx.cinematic` is held true for modules that read it: main's rule that clears the flag outside `playing` / `hub` gains
  `intro`, and main's 20 s valve does not apply (the film has its own).
- No toast, tip, banner or panel may show: the view sets `.gw-intro-on` on `#ui`, under which toasts, tips and banners are
  hidden, and `ui.isBlocking()` stays false. Tips are bus-triggered by events that cannot fire here.
- Keys: while the flow is `intro` main's keydown handles only the skip keys (after the guard) and swallows the rest (Space and
  Enter must never click a focused element); pointer presses on the canvas only brighten the Skip word for 2 s.

### 7.3 Skip (A2)

- The **Skip** word: Marcellus SC, dim lavender at 70 %, top-right at `max(12px, env(safe-area-inset-*))`, a target of at least
  44 × 44 px, fading in at 0.6 s (`skip.showAt`); **Esc, Enter, Space**; all ignored for the first 0.5 s (`skip.guard`: the
  stray second tap of Begin). One tap skips; there is no confirm.
- In `lit`, `fall`, `below` (`mode: 'veil'`): the ink veil closes in 0.25 s while the film runs on, the sound fades in 0.25 s;
  under full ink the film jumps to its end (`stage.setTime(length)`), `intro:done {skipped: true}` hands over, and the veil
  opens in 0.35 s on the play frame. 0.6 s in all.
- In `wick`, `home` (`mode: 'finish'`, from `skip.finishFrom`): no veil; the words clear at once and the rest of the film plays
  out in 0.5 s (the clock's rate = remaining / `skip.finish`; `stepClock`'s fourth argument), so the flame snaps lit and the
  camera finishes its move; the sound fades in 0.25 s.
- A skip and a full play run the same hand-off code and land in the same state (§7.5); only `meta.intro.skipped` differs.

### 7.4 Replay

- With `pending()` false on a v3 build, the title's lower line carries one quiet word, **Prologue** (`.gw-title-replay`:
  Marcellus SC 13.5 px, dim, a 44 px target, title "Watch the opening again") → `game.replayIntro()`.
- A replay is the same film with `replay: true`. It **writes nothing**: no `game.save()`, no change to `meta` or to a waiting
  run (asserted byte for byte). At `intro:done {replay: true}` the flow returns to `title` and `ui.showTitle()` fades back in
  over the last frame; the rig eases back to the title's orbit by itself.
- If the title's lake is not the Mossmere (a save whose deepest lake is further): under the opening's full ink, main calls
  `world.setZone('mossmere', {instant: true, flash: false})`, `player.teleport(spawn)`, `water.setObstacles(null)`; the veil
  holds until that is done; at the end it puts the title's lake back the same way under a 0.3 s veil. No `zone:change` is
  emitted for either swap.

### 7.5 The hand-off

**Today** (`world.SUPPORTS_COVE` false). On `intro:done` (not a replay), in one task: `meta.intro = {seen: true, skipped}` →
`game.startNewRun({character: 'wick', nightMode: 'still', __intro: true})`, which is today's function with one change: its
`zone:change` carries `{intro: true}` (render ignores it: no black fade, no grade snap; the world's `setZone` on the same lake
returns early; audio plays no sting). Order on the bus: `intro:done` → `flow:change {flow: 'playing', prev: 'intro'}` →
`zone:change {zone: 'mossmere', prev: null, intro: true}` → `run:start {continued: false}`, then the save.

**The state a full play and a skip both land in** (the flow scenario asserts every item): flow `playing`; `meta.runs` 1;
the run's character `wick`, `nightMode` `still`, `outing` `first`, zone `mossmere`, day 1, calm, `phaseTime` < 0.1 s; the raft
at `world.getSpawn()` facing north; fishing `idle`; `ctx.cinematic` false; `render.getIntroCamera()` null and the camera mode
`sail`; `ctx.intro.isActive()` false and the stage disposed; no `.gw-intro` element showing; `meta.intro.seen` true in
`localStorage`; `ctx.errors` empty. After it, the first run's own first-minute text follows by its existing rules (the lake's
banner, then one tip at a time); nothing of the film's is on screen (line 4 is gone 0.5 s before the end).

**On an error** (the stage throws, a build fails): the director reports it to `ctx.errors`, disposes the stage and emits
`intro:done {error: true}`; main hands over exactly as above (`seen: true`, so a broken device never loops).

**When the cove ships** (`world.SUPPORTS_COVE` true; written down, not built): Begin plays the same film, dressed at the
sea-gate arch (`COVE`'s arch for G, the hearth for S; the dark beat is where the hearth set is made ready), and
`intro:done` hands to `firstEvening.start()` **at step `wake`**: the `framing` step (the Lantern Line's 9 s camera move) is not
played, and the film's four lines replace `FIRST_EVENING.text.lore` (line 3 becomes "Its last candles come ashore here, to fish
and stay lit.", `INTRO.cove`). The `wick` beat's spark is the First Evening's own wake; the `home` take blends into render's
`cove` camera. `meta.intro.seen` is set at the hand-off as today; `meta.firstEvening` keeps its own rules.

### 7.6 Reduced motion (A8)

On when `matchMedia('(prefers-reduced-motion: reduce)')` matches or `meta.settings.reducedMotion === true` (read defensively;
no new Settings row), or forced by `start({reduced: true})`. Same clock, same length, same lines, same Skip. The stage is
shown **one still per beat** (`INTRO.stills`: 3.6, 7.2, 10.5, 14.2, 17.9 s; `stage.setTime(stillAt(t), {reduced: true})`; the
lake's own shimmer continues), and each change of still is a 0.5 s **cross-fade**: just before the change the view copies the
canvas into a 2D layer over it (`drawImage` in the same task as a render) and fades that layer out; if the copy fails, a
0.25 s + 0.25 s ink dip. The hard cut and the contact flash follow §3. `meta.settings.reducedFlashing` alone softens only those two.

### 7.7 The sound cue (A7)

One original cue, synthesised (WebAudio, no samples), in **D Dorian** (the Mossmere's key, DESIGN §20), on its own bus into the
music gain (so the master and music sliders and mute apply), peak ≤ −6 dBFS, ≤ 12 voices. Sections start when the film's clock
crosses their mark (`INTRO.sound.marks`), so a paused film pauses the score and a slow machine stays in step.

| t (s) | section | recipe (DESIGN §20's synths) |
|---|---|---|
| 0.0 | the title's harp out in 0.3 s | the title music's gain to 0; it stays out until the end |
| 0.0–8.2 | bowed drone D2 + A2 (73.4, 110 Hz) | two saws ±6 cents each, lowpass 420 Hz, a 1.2 s swell, −18 dB |
| 1.0 | one great bell, D3 (146.8 Hz) | partials 1 / 2.0 / 2.4 / 3.0 / 4.5, 6 s decay, −14 dB |
| 1.4–5.9 | glass chord D4–A4–E5 | sine partials 1 / 2.76 / 5.4, 0.4 s attack, −20 dB |
| 5.6 | the chain parts | a tick 2.2 → 1.6 kHz in 80 ms, −16 dB |
| 5.9–7.9 | the fall | the top voice E5 → A4 (a fifth down), the drone D2 → C♯2 |
| 7.9 | the contact | a sub thump 80 → 40 Hz, a low bell A1 (55 Hz), −12 dB; a 300 Hz lowpass closes on the bus in 0.15 s |
| 8.2–12.4 | the deep | sub drone D1 + A1 (36.7, 55 Hz), −20 dB; `ember_swell` at 9.0; one slow groan 70 → 52 Hz over 2.5 s at 9.6 (patient, never a sting) |
| 12.5 | the spark | a tiny tick; the lowpass opens to 6 kHz over 0.8 s; `flame_catch` at 12.8 |
| 14.6 | the harp | D4, F4, A4, G4 at 58 BPM (14.6, 15.63, 16.67, 17.70 s), 1.2 s decay, −12 dB; the G rings on |
| 18.0 | — | `run:start` brings the lake's `calm` bed in the same key and tempo; no sting |

Skip: the cue's bus ramps to 0 in 0.25 s (never a stop mid-wave), then its nodes are released. Audio locked (no gesture yet, or
the context suspended): silent, and nothing queues up to play later. A replay ends by handing back to the `title` mood.
`audio.audioLog` records `intro_cue` and each mark, for the tests.

### 7.8 Robustness (A10)

Every stage call from the director is wrapped; an exception ends the film through the normal `intro:done` (tested in the seam
test). Resize and rotation: the camera and the ink card read the aspect every frame; the words and the Skip word are CSS; the
portrait keys blend in between aspect 1.1 and 0.9. `game.toTitle()` and `game.wipeAll()` call `ctx.intro.stop()`. Closing the
tab mid-film leaves the save as it was: it plays again.

## 8. The lane seam

### 8.1 Who owns what

| | lane A "set and picture" (worktree `intro-set`, branch `gw-intro-set`) | lane B "director and flow" (worktree `intro-flow`, branch `gw-intro-flow`) |
|---|---|---|
| new files | `src/intro-stage.js` (exists: stub), `src/intro-models.js`, `tools/tests/intro-stage.test.mjs`, `tools/tests/intro-shots.scenario.mjs` (exists: seed), `docs/v3/intro/LANE-A.md` | `src/intro.js` (exists: skeleton), `src/ui-intro.js`, `src/audio-intro.js` (or additions to `audio-v3.js` / `audio-af.js`), `tools/tests/intro.test.mjs`, `tools/tests/intro-flow.scenario.mjs`, `docs/v3/intro/LANE-B.md` |
| existing files, only inside its own marked blocks | `src/render.js`, `src/world.js` (blocks exist); `src/actors.js`, `src/actors-wick.js`, `src/world-art.js`, `src/world-fx.js`, `src/toon.js`, `src/models-kit.js`, `src/water.js` (new `// >>> INTRO LANE A` blocks, additive helpers only) | `src/main.js`, `src/ui.css`, `src/ui-screens.js` (blocks exist); `src/ui.js`, `src/core.js`, `src/audio*.js`, `src/progression.js` (new `// >>> INTRO LANE B` blocks) |
| `src/data.js` `INTRO` | the `LANE A` block (`cameras`, `set`) | the `LANE B` block (`lines` timings, `lineFade`, `skip`, `clock`, `stills`, `stillFade`, `sound`, `trigger`, `handoff`, `cove`) |
| never | `main.js`, `ui*.js`, `ui.css`, `audio*.js`, `intro.js`, `core.js`, the DOM, the bus | `render.js`, `world*.js`, `actors*.js`, `water*.js`, `toon.js`, `models*.js`, `intro-stage.js`, three.js objects |

Nobody but the merge agent edits: `INTRO`'s `shared` block (length, beats, the four lines' text, the words band, the veil,
`swapAt`, the cut), `tools/validate-data.mjs`, `tools/tests/intro-seam.test.mjs`, `tools/check.mjs`, `tools/scenario-run.mjs`,
`DESIGN.md`, `CONTRACT.md`, this file, and `gloomwater/index.html` (the minified flag-off build: rebuilt last, by the stage
agent). A lane that needs one of them changed writes the request, with the reason, at the top of its `LANE-x.md`.

### 8.2 The marked blocks (line numbers at the seam commit)

| file | block | line | what goes there |
|---|---|---|---|
| `src/main.js` | `INTRO LANE B: import` | 13 | imports |
| | `INTRO LANE B: flow` | 308 | `game.introPending()`, `beginIntro()`, `replayIntro()`, flow `intro`, the `intro:done` hand-off, the replay's lake swap |
| | `INTRO LANE B: create` | 446 | `ctx.intro` (wired) |
| | `INTRO LANE B: debug` | 739 | `debug.intro` (wired: route `'play'` through the real flow) |
| | `INTRO LANE B: frame` | 773, 801 | `rawDt` and `ctx.intro.update(rawDt)` (wired) |
| | new blocks lane B adds | — | the cinematic rule for flow `intro`; `startNewRun`'s `{intro: true}`; the keydown and pointer guards; `stop()` in `toTitle` / `wipeAll` |
| `src/ui-screens.js` | `INTRO LANE B: title` | 336 | Begin while pending; the Prologue word |
| `src/ui.css` | `INTRO LANE B` | 2148 | every `.gw-intro-*` rule and `.gw-title-replay` |
| `src/render.js` | `INTRO LANE A: cut-scene camera` | 501, 512, 770, 801, 966, 1058 | the pose, the rig held in `sail`, the lens, `zone:change {intro}`, the API (all built) |
| `src/world.js` | `INTRO LANE A: stage hooks` | 259, 278, 319, 451, 701 | the opening mood, the hero anchor, the water light (all built) |
| `src/data.js` | `INTRO shared` / `LANE A` / `LANE B` | 3916 / 3941 / 3981 | three blocks with a blank line between, so the two lanes' edits never touch |

Every block is inert with `V3_ENABLED` off: `ctx.intro` is null, no hook is called, the flag-off fingerprint and the v1 fishing
trace do not move.

### 8.3 The contract between the lanes

- **Calls, one direction only:** director → stage (`prebuild`, `enter`, `setTime`, `exit`, `dispose`, `stats`). The stage
  calls nothing of lane B's and emits nothing.
- **Events** (`ctx.bus`, emitted by the director only): `intro:start {replay, reduced}` · `intro:beat {id, i, prev, t}` ·
  `intro:line {i, text, at, out}` and `{i: null}` · `intro:skip {t, mode: 'veil' | 'finish'}` · `intro:done {skipped, replay, t,
  error}` (exactly once per `start`). Lane B's view, audio and main listen; lane A listens to none.
- **Shared numbers:** `INTRO.length`, `INTRO.beats`, `INTRO.swapAt`, `INTRO.words.band` (lane A keeps the picture's subjects
  out of it; lane B draws the words in it), `INTRO.stills` (lane B picks the moments, lane A makes each one a good frame),
  `INTRO.cut`.
- **State:** `state.meta.intro = {seen: bool, skipped: bool}`, created by main at the hand-off, never by `core.defaultMeta()`,
  never read with the flag off; unknown to lane A.
- **The seam test** (`tools/tests/intro-seam.test.mjs`, run by `check.mjs`) holds all of this on fake games; both lanes keep
  it green without editing it.

### 8.4 Debug hooks (registered only under `GW_DEBUG`; `'intro'` is in `core.HIDDEN_DEBUG_HOOKS`)

`window.__gw.debug.intro(cmd, arg)`: no argument → `{phase, t, wall, beat, line, replay, reduced, skipped, hold, optIn,
pending, flow, seen, stage: stage.stats()}` · `'play', {replay, reduced}` · `'seek', t` (holds the clock at `t`, starts a
replay if idle, shows exactly that moment; the scenario then pumps the look modules and renders) · `'resume'` · `'skip'` ·
`'stop'` · `'auto', bool` (opt this page in to auto-play) · `'prewarm'`. Also `globalThis.GW_INTRO = true` before the page's
scripts, or `?intro=1`. `render.getIntroCamera()` and `debug.camera()` show the camera.

### 8.5 What each lane hands back

Commits on its own branch only; `node tools/validate-data.mjs` (three passes), `node tools/check.mjs` and its own scenario
green; no rebuild of `index.html`; a `docs/v3/intro/LANE-x.md` with: what was built, every number retuned and why, anything
cut (§11) with the strip that showed it, requests to the merge agent, and where its captures are
(`tools/out/intro/…`). The merge agent merges A then B (they share no hunk), runs the acceptance list (§10), folds the two
notes into DESIGN §25.4.9 and CONTRACT §13.13 and rebuilds `index.html` last.

## 9. Cost budget (A9)

- **The press.** Begin does `closeAll`, a flow change and `stage.enter()`: no build (prebuilt under the title), no world
  rebuild, no shader compile (warmed). Budget: no frame longer than 0.5 s on the low tier between the press and 1.4 s; target
  none over 100 ms. If the player presses before the idle prebuild ran, `enter()` builds under the full ink (0.35–0.6 s).
- **The film.** The set's own cost ≤ 30 calls / 10,000 triangles in any frame (§4); the frame around it is the title's (measured
  on this branch: 176 calls / 227 k triangles on high with the mirror and the shadow pass, 118–156 / 150–165 k on a phone at
  medium). No extra pass, light, shadow map or render target on any tier.
- **The hand-off.** `startNewRun` runs once, on a camera at rest, with no world rebuild; no frame over 0.5 s on low.
- **Memory.** After the end, a skip, a replay or an error: `renderer.info.memory.geometries` and `.textures` equal their values
  before `prebuild()` (measured across a replay, which returns to the same title).

## 10. Acceptance, made specific

| | test | where | owner |
|---|---|---|---|
| **A1** length | `INTRO.length` 15–20 (validator); `stepClock`: 60 fps → 18.0 s ± 0.05, a 5 s frame moves the film 0.1 s, a 2 fps machine ends at 25 s (seam test); in the browser `intro:start` → `intro:done` on `performance.now()` is 18 s ± 0.5 at ≥ 10 fps, and does not advance while `document.hidden` is forced | validator, seam test, `intro-flow` | B |
| **A2** skip | the Skip word's box ≥ 44 × 44 px and inside the safe area at 390 × 844 and 960 × 540, visible by 1.0 s; a skip at 0.3 s is ignored, at 0.6 s taken; Esc, Enter, Space each skip; from every beat `intro:skip` → `intro:done` ≤ 0.6 s; the end state equals a full play's item by item (§7.5) | `intro.test`, `intro-flow` | B |
| **A3** once, no extra click, replay | fresh save + opt-in: the title's primary word is Begin; one click → `intro:start` within a frame, no modal opens; after the end `meta.intro.seen`; back at the title the primary word is New Descent and the Prologue word shows; a second new run plays nothing; the Prologue word plays it and leaves `JSON.stringify(meta)` and the stored save identical; a replay on a save whose title shows another lake returns to that lake | `intro-flow` | B |
| **A4** nothing else | during the film: flow `intro`, `ctx.cinematic` true, `state.run` null, `time.gameT` unchanged, no `.gw-toast`, banner, tip or modal in the DOM, HUD hidden; movement keys and canvas presses change nothing (`player.position`, `fishing.state`) | `intro-flow` | B |
| **A5** words | ≤ 4 lines ≤ 60 characters, ≤ 17.5 characters a second, never two at once, none in `below` (validator, seam test); computed font size ≥ 16 px at 390 px; each line's box inside the words band and ≤ 2 rows; no border, outline or box-shadow; contrast: at least 7 : 1 between the text colour and the mean of the pixels behind each line's box (canvas and pool together), at every strip time the line is up | validator, `intro-flow`, strips | B (A for the picture under the band) |
| **A6** look | the strip (23 times, desktop high + phone medium + desktop low) reviewed by eye for at least two look-and-fix rounds: the rules of §5 measured on the frames (waterline, lantern and mirror in frame, the band clear); `tools/hue-report.mjs` on the strip ≤ 2 % green-teal per frame; no ring or disc around the raft in `wick` / `home`; nothing recognisable from another game | `intro-shots` | A |
| **A7** sound | `audio.audioLog` shows `intro_cue` and its marks in order; the title mood's gain is 0 by 0.3 s; with master 0 or mute the cue's bus is silent; a skip ramps the bus to 0 in ≤ 0.3 s (the gain param's scheduled ramp is read back); with the context locked nothing is scheduled; `tools/audio-render.mjs` renders the cue offline with no sample over −3 dBFS | `intro.test`, `intro-flow`, audio render | B |
| **A8** reduced motion | forced reduced: the camera pose is constant inside each beat (five poses over the film), the same four lines at the same times, the same length, the Skip word works; a cross-fade layer exists for ≤ 0.6 s at each beat change | `intro.test`, `intro-flow`, `intro-shots --reduced` | B (A for the stills) |
| **A9** cost | `stage.stats()` ≤ 30 calls / 10,000 triangles at every strip time, on low / medium / high; `renderer.info.programs` does not grow between the press and the end (warmed); longest frame from the press to 1.4 s and around the hand-off ≤ 0.5 s on low at a throttled CPU (the perf scenario's method); no light or shadow map added (`scene` light count and `renderer.shadowMap.enabled` unchanged); memory back to baseline after a replay, a skip and an error; the phone strip reviewed as its own composition | `intro-shots`, `intro-stage.test`, `intro-flow` | A (B for the press and the hand-off) |
| **A10** robust | a stage that throws at any `t` → one `intro:done {error: true}`, the game playable, `seen` true (seam test + a browser run with a patched stage); resize 960 × 540 ↔ 390 × 844 during every beat: no error, the frame still obeys §5; reload at 9 s: the stored save is byte-identical to before Begin and the film plays again | seam test, `intro-flow` | B |
| **A11** flags and regressions | `node tools/validate-data.mjs` (three passes, the flag-off fingerprint untouched); `node tools/check.mjs` green (includes `intro-seam`, `intro`, `intro-stage`); `tools/scenario-run.mjs` through `tools/playtest.mjs` prints "ALL INVARIANTS HOLD" with 0 page, console and ctx errors on the flag-off minified build and on a v3 build; every existing v3 scenario passes unchanged (under `GW_DEBUG` with no opt-in `pending()` is false and the title is today's) | both lanes, then the merge | A and B |

## 11. The scope-cut ladder

Cut from the top; each cut is recorded in the lane's notes with the strip that decided it. The film never drops below a lit
kingdom, a fall, a dark beat, a flame and the crane home.

1. **The lake's memory** (#6): if the lingering reflections do not read on the medium tier, drop them; the windows and their
   mirror images go dark together.
2. **The flank's eye and fins**: a plain pale body. Then **the whole flank**: the ember sinks, is eclipsed by a soft dark shape
   (one quad), reappears smaller further right, and winks out.
3. **The radial opening of the ink** in `wick`: a plain 1.2 s fade.
4. **The flame's gutter**: a single catch (0 → 1 over 0.6 s). Then **the kindling hook itself** (#13): the Wick is simply lit
   when the ink lifts.
5. **The chains' trail and the spark at the top of frame**: the lantern just drops.
6. **Row-by-row darkening**: all the windows gutter out together over the fall.
7. **The push-in**: a locked-off `gate` take (two equal keys).
8. Lane B, in order: the snapshot cross-fade under reduced motion (ink dips instead); hiding Journal / Shrine / Trials on the
   fresh title; the groan and the glass chord's bend (the drone, the bell, the thump and the harp are the cue's spine).

Not cuttable: the acceptance list, the four lines, the hard cut's timing against the contact, the hand-off with no fade, and
the replay.

## 12. As built (the stage's record)

The two lanes were merged (A, then B; no hunk in common) and tuned as one piece on seek-driven frames shot off the page, so the
words, the Skip word and the ink are judged over the picture as a player sees them (`tools/tests/intro-board.scenario.mjs`,
`tools/intro-board.py`). Data wins over every number quoted above; this section says where the build left the plan and why.
The lanes' own records are `LANE-A.md` (the set, every retuned number, six look-and-fix rounds) and `LANE-B.md` (the director,
the flow, the cue).

### 12.1 Changed while staging (four look-and-fix rounds on the merged picture)

| what | plan | built | why (the frames that showed it) |
|---|---|---|---|
| the title at the press | `ui.closeAll()`: the title fades by itself (0.22 s) while the ink closes | the title's screen is closed for the game but **its picture stands** until the ink has closed over it (`ui.intro.takeTitle()`, the kit's `closeModal(id, {hold})`); taken away one frame after the ink is full | the title carries its own dark veil: fading it lifted the lake's brightness by a third for a tenth of a second before the ink arrived (`r1/fine-a`: the press frame brighter than the title). Now the picture only darkens from the press (`r2/fine-a`; the press frame equals the title frame to 0.01 / 255) |
| the fresh title | Begin, Settings, the meta line | **Begin, Settings** and nothing else under the name and the tagline | "No Wick has gone down yet · 0 of 33 species named" was the only other text on that screen and counts nothing yet |
| line 3 | 12.9–15.4 | **12.7–15.1** | it comes with the catching flame and is gone before the crane has carried the raft under the words |
| line 4 | 15.7–17.5 | **16.05–17.6** | at 15.7–16.4 the raft crosses the words band: the line and its ink pool sat on the Wick (`r1/sb-bot` 16 s). Now it comes in under the raft as the play camera settles: the last line labels the thing the player is about to steer (`r2/fine-b`) |
| the crane home | blend 14.6–17.4, 0.6 s at rest | **14.6–17.0, 1 s at rest** | the raft has risen clear of the band by 16.2; a full second of the play camera at rest before control |
| the Skip word's exit | over the last 0.5 s | **over the last 0.4 s** | it goes after the last line (17.6), not with it |
| the ink's head (`inkTop`) | `#1D245D`, then lane A's `#251E5C` | **`#3E2568`** | the film now wears the Mossmere's grade (below), which crushed `#251E5C` to a pure blue (10, 10, 79; hue 240) beside a violet lake. `#3E2568` lands at (35, 16, 100), hue 252, between the lake's water (246) and its sky (254) (`tune/a-sheet`) |
| the lantern's pool on the water | every tier | **the low tier only** (`set.lantern.water.intensityMirror: 0`) | from 2 m up and 60 m away the pool is one flat mustard band along the far shore, at any strength the water's light model allows it stays a band, and under about a third of full strength it turns olive over the violet water (`tune/b-lines`, `e-lines`). Where the lake is a mirror the reflection is the gold. On the low tier the path is the lantern's only reflection and stays |
| the lake's own rings under the film | stop (flow `intro`) | **keep falling** (`water.js` runs its ambience in flow `intro` too) | nothing starts up at the hand-off |
| the prewarm | one `prebuild()` per idle callback, 8 tries | **as many slices as an idle period has time for** (6 ms left), 16 tries; the game's own smoke-and-ember pools are made under the title too | the stage takes 9 or 10 slices; the pools' one program was otherwise compiled 4 s after the title opened, which could fall inside the film |
| `water.rebakeDepth()` | — | **added** (lane B's request 1) | a replay from another lake's title bakes the Mossmere's depth map (shore foam, shallows) under the ink, and the title's again at the end |
| `setTime`'s `calm` | — | the stage treats **`calm` as `reduced`** for the flash and the cut | reduced flashing alone quarters the contact flash (lane B's request 4) |
| the flank's exit | it glides out at full brightness; the whole body fades 11.9–12.2 | **the dark takes the body first** (`uSink`, 11.0 → 11.9, to 92 % ink), the ember's glow inside it last: the beat ends on one warm light carried off into the dark, which the Wick's spark answers 0.4 s later | 11.4–12.0 s in landscape was a flat pale wall with nothing on it (lane A's weakest frame; `r3/desk` 11.5, 12.0). Now 11.4 is a dimming wall under a bright glow, 11.7 a dark shape with the glow at the frame's edge, 12.0 near black (`r3/fine`, `r3/pfine`) |
| the Wick's spark | 0.18 + 0.75 k m | **0.08 + 0.34 k m** (a 40 px point at its peak on a 960 px frame) | at the old size it was a 90 px soft orb, read as an out-of-focus light rather than a spark (`r3/q-spark`; `r4/spark`) |

### 12.2 Decisions taken by the lanes and kept

- **The stage goes live under the opening ink, never at the press** (LANE-B §0.3): the press costs a flow change and nothing else
  (measured: §12.4); `enter()` lands one frame after the ink was painted full (0.37–0.5 s of film).
- **The film wears the Mossmere's grade** from the swap on (`INTRO.handoff.grade: 'ink'`; LANE-B §0.2). Render ignores
  `zone:change {intro: true}` wholesale, so without this the first run would have played in the title's grade. Judged again on
  the merged strips (the ink's head above is the one thing it changed).
- **The film is off while the cove is on** (`FE_ON`), until its cove dressing is built (§7.5): today `world.SUPPORTS_COVE` is
  false and the film is on.
- The lantern bigger and lower (7.6 m at y 14.2), the gate take 3° down, the phone's shoulder take behind the Wick, the flank's own
  small shader (smooth, 4,880 triangles, one eye, a mouth seam, a gill, a side line; the ridge and the breast fin cut: scope
  ladder rung 2, in part), the ink card as a clip-space quad, the mirror-only twin as the windows' whole reflection, the kindle
  taking the brazier, the stage re-anchoring at the swap, the sliced `prebuild()`: all as LANE-A.md.
- Nothing else was cut from §11's ladder.

### 12.3 What a player sees, second by second (desktop; `tools/out/intro/storyboard.jpg`)

0 the title, its name and two words; the press. 0–0.35 ink closes over them. 0.6–1.4 ink lifts on the lit kingdom; the Skip word
is there by 0.9. 1.2–4.5 line 1 over the slow push. 4.8–8.1 line 2; 5.6 a chain parts; 5.9–7.9 the fall, the windows guttering
top-down, their reflections outliving them; 7.9 the flash; 8.2 the cut. 8.2–12.4 the dark: the ember sinks, the eye at 10.2, the
ember taken at 10.4, its glow through the belly; from 11.0 the dark takes the body and the glow leaves last, near black by 12.0; no words. 12.5 the spark; 12.6–13.8 the ink opens from the flame;
12.7–15.1 line 3; 13.5–14.2 the raft's lantern takes. 14.6–17.0 the crane home; 16.05–17.6 line 4 under the raft; 17.0–18.0 the
play camera at rest; 17.6–18.0 the Skip word goes. 18.0 control: the HUD fades in over 0.6 s, the lake's name rises.
