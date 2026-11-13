# The opening cut scene, lane A: the set and the picture

Branch `gw-intro-set`, on top of the seam (`gw-intro`). Built to `docs/v3/intro/SPEC.md` §4–§6; this note is what §8.5 asks
for: what was built, every number retuned and why, what was cut, what the merge needs to do, and where the strips are.

## Requests to the merge agent (files lane A may not edit)

1. **SPEC §2 / §4 / §5 and DESIGN §25.4.9 quote numbers that moved** (all in `INTRO`'s LANE A block; data wins, as the spec says).
   The list is in "Numbers retuned" below. The ones a reader will trip on: the lantern is 7.6 m tall at y 14.2 (was 6.5 at 17),
   the gate take looks 3° down (was 2°), the phone's shoulder take stands nearly behind the Wick, `inkTop` is `#251E5C`.
2. **CONTRACT §13.13**: add the two hooks this lane made, and the sliced prebuild:
   - `actors.setIntroKindle({wick, lantern} | null)`: multipliers 0–1 on the Wick's head flame (size, light, halo, eyes) and on
     the raft's fire (the lantern's light, glass, halo and flame, the pool on the water, **and the brazier**), laid over the
     game's own values each frame; `null` gives them back.
   - `render.warmPrograms(object3d) → bool`: compiles an object's programs inside the frame's own HDR target with the scene's
     lights and fog, without drawing it (three's `renderer.compile`). The stage calls it once per part of the set.
   - `stage.prebuild()` does **one slice per call** and returns `true` when everything is ready (9 slices on medium / high, 8 on
     low: the models, then one warm-up per part). `stage.stats()` also reports `lights` (always 0), `steps: [done, of]`,
     `buildMs` and `tier`.
3. **Validator** (optional, nothing fails without it): the new LANE A fields have no rule yet. Suggested: `fall.lurch` 0–0.15,
   `fall.sink` > 0, `dark.from < dark.to ≤ 0.66` (with `gutter` and `jitter`, every window must be out by the contact: the
   stage test asserts it), `memory.fade ≤ memory.linger`, `below.flank.frame[0] > 1` and `frame[1] >` the phone's aspect (too
   big for the frame), `lantern.water.radius` < the lantern's distance to the far shore (28 m).
4. **`tools/tests/intro-seam.test.mjs` pins the first pose** (`S + (0, 2.2, −12)`) and the lens at t = 3 (46° / 62°). Both
   still hold; they are why the retune moved the look target and the later keys and not the first key or the lens.

## What the director must call (lane B, the merge)

```
const stage = createIntroStage(ctx)            // once
stage.prebuild()                               // under the fresh title, in idle time, ONE CALL PER IDLE SLICE until it returns
                                               // true (ctx.intro.prewarm() must be called repeatedly, not once)
stage.enter({ replay, reduced })               // on Begin / Prologue; builds at once whatever is left (the opening ink covers it)
stage.setTime(t, { live: true, reduced })      // every frame, BEFORE the module loop (main already calls ctx.intro.update there:
                                               // actors, world and render read this frame's kindle, water light and pose)
stage.setTime(stillAt(t), { live: true, reduced: true })   // reduced motion: the beat's still
stage.setTime(t, { seek: true })               // a seek, and the jump of a veil-skip: setTime(INTRO.length, {seek: true})
                                               // (`seek` also snaps render's rig, so the play camera is at rest when the veil opens)
stage.dispose()                                // at the end, after a skip, on stop() and on any error (exit() + free)
```

- `reduced` does two things only: the contact flash is quartered and the hard cut becomes a 0.3 s dip into the ink. That is
  exactly SPEC §3's rule for `reducedFlashing`, so pass `reduced: true` when **either** reduced motion **or**
  `meta.settings.reducedFlashing` is on.
- `live` without `seek` lets the stage ask the lake for one splash as the clock crosses the contact (garnish; nothing waits on it).
- The stage needs nothing from lane B. It reads `ctx.render` (`scene`, `camera`, `renderer`, `quality`, `setIntroCamera`,
  `snapCamera`, `warmPrograms`), `ctx.world` (`getSpawn`, `getHeroAnchor`, `isOpenWater`, `setIntroMood`, `setIntroWaterLight`),
  `ctx.actors` (`setIntroKindle`, `getHeadPos`), `ctx.water` (`reflection.on`, `splash`) and `ctx.data.INTRO`.
- Words: the lantern's mirror image ends at 82–83 % of the height in landscape (band from 86 %) and 77–80 % on a phone (band
  from 90 %); the ember never goes below 65 %; the Wick's flame sits at 77–84 % (landscape; it sways with the Wick) and ≈ 75 % (phone). On the low tier
  the lantern's gold path on the water runs under the band in `lit` / `fall`: the words' ink pool is needed there.

## What was built

`src/intro-stage.js` is three layers, top to bottom of the file:

1. **The score** (pure numbers): `introCamera` (from the seam), **`introScore(INTRO, t, {aspect, reduced}, out)`**: every piece
   of the set at t, and **`introWindow(INTRO, t, row, seed, out)`**: one window. Every time and size of `INTRO` is read here.
2. **The models** (`src/intro-models.js`): builders that return three.js objects at rest and touch nothing else.
3. **The stage** (`createIntroStage`): builds in slices, lays the score on the models, drives the hooks.

| # (SPEC §4) | built as | calls main + mirror | triangles |
|---|---|---|---|
| 1 the great lantern | an eight-sided iron cage (base ring, drop finial, eight corner bars, one band, collar, a lathed roof with a wide eave and a knob): one flat-shaded `toonMaterial` mesh. The glass is one eight-sided block of amber with its hottest band a little under the middle and the roof's underside catching its light (vertex colours, × 2.6). One halo sprite | cage 1 + 1, glass 1 + 1, halo 1 + 1 | 256 + 80 + 2 |
| 2 its chains | real links (a box a metre, every other one turned), so they read as chain at 60 m. Each chain is two parts: the **stub** that stays on the lantern (one mesh, sheared each frame so the stubs hang true whatever the tilt, with a little whip) and the **run above the break** (two meshes: the first to part, then the other two), which whips up out of frame | stubs 1 + 1, uppers 2 + 2 | 240 + 912 |
| 3 its light on the water | `world.setIntroWaterLight`, following the lantern down, a surge at the contact, then off | 0 | 0 |
| 4 the windows "then" | 54 slits, one `InstancedMesh` with a colour per slit; the middle column sits half a row up and no two slits are the same size (masonry, not a grid); a hand behind the lake's own eight slits, so those stay in front when the kingdom is dark | 1 + 0 (low: 1) | 648 |
| 5 their halos | `world-fx.createHalos`, 27 points | 1 + 1 | points |
| 6 the lake's memory | a mirror-only twin of #4 (medium / high). **The twin is the windows' whole reflection** (the mesh itself is not mirrored on those tiers): identical until a window gutters, then lit 1.2 s longer and rising 5 m | 0 + 1 | 648 |
| 7 the contact | one flat feathered ring (2 → 30 m), the halo's flash to pale gold, the live splash | 1 | 224 |
| 8 the ink card | one clip-space quad at a fixed view depth (60 m), `AlwaysDepth` + depth write, `renderOrder` 900; night ink to the lake's violet at the head, a breath of lit water overhead that falls away as the ember sinks; it opens from the Wick's flame (found by projecting `actors.getHeadPos()` through the film's own pose) | 1 | 2 |
| 9 motes | 60 points in picture space, rising as a function of t | 1 | points |
| 10 the ember | two sprites, drawn through the flank | 2 | 4 |
| 11 the pale flank | one smooth lathed body (60 stations × 40 round, most of them in the head) with the tail merged in, and one eye (ink disc, a lid, a pale-gold glint) | 2 | 4,804 + 70 |
| 12 sparks | one at the Wick's head (12.5), one where each chain parts (5.6, 5.9) | 1 each | 2 |
| 13 the kindling | `actors.setIntroKindle` (actors.js, actors-wick.js) | 0 | 0 |

**Measured** (`tools/out/intro/*/strip.json`, 47 frames each; `stats()` equals what `renderer.info` says the set costs, frame by
frame, by drawing each frame with and without it):

| | peak calls | peak triangles | prebuild (software GL) | programs: before → warmed → end of film | memory after dispose |
|---|---|---|---|---|---|
| desktop high (mirror ½) | 17 at 5.68 s | 4,880 at 10 s | 9 slices, 54 ms in all, longest 22 ms | 77 → 85 → 85 | = baseline, twice |
| desktop low (no mirror) | 9 at 5.68 s | 4,880 at 10 s | 8 slices, 23 ms, longest 15 ms | 96 → 107 → 107 | = baseline, twice |
| phone medium (mirror ⅓) | 17 at 5.68 s | 4,880 at 10 s | 9 slices, 9–30 ms, longest 6–17 ms | 77 → 85 → 85 | = baseline, twice |

Budget 30 calls / 10,000 triangles (ceiling 60 / 40,000). No light, no shadow caster, no render target, **no texture of its own**
(the sprites share `toon.glowTexture(128, 2.2)`; the toon ramp is the game's). Nothing is compiled once the film runs. The
prebuild's longest slice is the models (geometry on the CPU); the eight warm-ups are a few milliseconds each.

**Memory, how the baseline is taken.** Two things that are not the set's would be counted against it on a cold title: the
game builds its smoke and ember pools at the first puff (the Wick's first wax drip, 4 s into any title: 2 geometries, 1 texture,
1 program), and the film's cameras are the first to see parts of the world on a phone (5 geometries). The scenario therefore
fires one puff and flies a dry pass of the film's cameras with the set hidden before it reads the baseline. From there:
build, 47 frames, dispose → the baseline exactly; build, two frames, dispose → the baseline again.

## Numbers retuned (INTRO, LANE A block) and why

| what | seam | now | why (strip) |
|---|---|---|---|
| `lantern.at` y | 17 | **14.2** | at 17 the mirror image's foot (the cap and its knob) fell at 86–90 % in landscape: inside the words band. Computed first, then confirmed on `strip/i-03.60`, `i-05.00` (82.0 %, 83.0 %) |
| `lantern.height` / `radius` / `halo.size` | 6.5 / 2.4 / 26 | **7.6 / 2.9 / 30** | at 5 % of the frame's width it was a prop; it is the film's subject (`r0/i-03.60` vs `r1/i-02.40`) |
| `lantern.chainTop` | 70 | **48** | nothing above 42 m is ever in frame (phone, fov 62); 660 fewer triangles of links |
| `lantern.water.radius`, `+ streakLow` | 40, — | **27, 0.75** | at 40 the pool reached the far shore (28 m) and lit it as one hard yellow line across the frame (`strip-phone` first pass); on low the streak is the lantern's only reflection and at 2 it went cream in the words band |
| gate take, look y | −1.7, −1.7, −2.2, −3.2 | **−3.6, −3.6, −3.8, −2.6** | 3° down keeps the mirror image over the band through the push; the last key comes back up because the narrowing lens (46 → 36) was pushing the waterline to 44 % (rule 46–56 %) |
| gate take, pos | y 2.2 → 2.0, z −12 → −23 | **y 2.2 → 1.8, z −12 → −21.5** | a little lower and a shorter push: the mirror is more nearly the lantern's twin, and the image stays in frame. The first key is pinned by the seam test |
| shoulder take, portrait pos x | 1.5 → 1.6 | **0.72 → 0.8** | at 1.5 the Wick stood half out of the frame's left edge (the frame is 2.4 m wide there; probe `07`); now whole, flame at 30 %, 75 % |
| `fall.restY`, `+ lurch`, `+ sink` | 3.2 | **4.0, 0.06, 5** | the taller lantern's finial meets the water with its middle at 4.0; the lurch when the first chain parts; how fast it goes under |
| `dark` `+ from / to / jitter` | — | **0.02 / 0.6 / 0.1** | SPEC's "as the lantern's base passes its height" cannot be literal (the base starts below most rows): the dark sweeps the towers top to bottom over the fall's own progress, and with `to` 0.6 the lowest row is out 0.03 s before the contact |
| `memory` `+ fade` | — | **0.5** | the twin's last half second |
| `below.flank` `+ frame`, `+ rise` | — | **[1.15, 0.5], [0.13, 0.12]** | see "the flank" below |
| `colors.inkTop` | `#1D245D` | **`#251E5C`** | beside the lake's violet the indigo read as a blue from another film (`r1/i-10.30`) |

Unchanged: every time (the beats, the fall's marks, the flank's marks, the flame keys, the lift), the lens, the landscape
shoulder take, the home take, the budget.

## Where the build departs from SPEC §4, and why

- **The flank has its own small shader, not `toonMaterial`** (#11). It stands in camera space: under the scene's moon and
  vault it was lit from wherever the camera happened to point, and the ember's glow has to come *through the belly at one
  place*, which a toon material's single emissive colour cannot do. The shader is the game's ramp by hand (four flat bands
  with narrow soft edges, light from above), plus the dark closing over its far end and the ember's glow.
- **It is smooth, not flat-shaded, and 4,880 triangles, not ≈ 2,400.** Flat facets on a body that fills the frame came out as
  loose grey rectangles (`r0/i-10.30`), and a profile eased key to key showed its keys as a polygon (`r2/i-10.30`). It is now a
  Catmull-Rom profile with the ellipse's own normals. Still under half the triangle budget, in a beat that draws nothing else.
- **Too big for the frame, for real.** At a girth of 0.74 picture heights it was a whole friendly whale (`r1`). At 1.15 (0.5
  on a phone, where the frame is 0.46 wide) the picture holds one eye, one mouth seam and one belly line; the back is out of
  frame, the tail is in the dark. The middle line passes 0.13 girths above the ember, so the ember meets the mouth.
- **Cut (scope ladder 2, in part): the ridge and the breast fin.** They read as teeth and a slash (`r1/i-10.80`). Kept: the
  eye. Added in the shader instead: one mouth seam, one gill crescent, one long line down the side (it gives the glide its speed).
- **The card is not parented to the camera** (#8): a clip-space quad at a view depth does the same with no per-frame sizing.
- **The real windows are not in the mirror on medium / high** (#4, #6): the twin alone is, so the two never fight for depth.
- **The kindle also takes the brazier** (#13): its coals and flame were a second warm thing in the dark frame before the spark.
- **The ink hesitates.** While the flame gutters (13.05 s) the opening holds a moment before it runs out to the corners.
- Not done (optional in §6): skipping `water.renderReflection` under the opaque card. The dark beat is already the cheapest.

## Purity

`setTime(t)` sets every transform, colour, opacity, uniform and visibility from `t`, the aspect and `reduced`. Proven three
ways: `intro-stage.test.mjs` digests every object of the set at 73 times going forwards, then backwards, then after jumps; the
strip scenario does the same in the browser at five times; the director's seam test still passes. Allowed impurities, as the
spec lists them: the world's own motion, the damped mood, the Wick's idle sway (the spark and the opening of the ink follow its
head), the live splash.

## Tests

- `node tools/tests/intro-stage.test.mjs` (in `check.mjs`): 151 assertions: the score beat by beat, §5's rules (a)–(f) by
  projection in 16:9 and 390 × 844, the window layout, the stage on a real three.js scene with a fake game (slices, purity,
  the budget on three tiers, no light, no own texture, the hooks, the live splash, disposal, a second life).
- `tools/tests/intro-shots.scenario.mjs`: the strip (47 moments: every second, each beat's start, middle and end, the stills,
  the marks) and, measured in the browser: cost against `renderer.info`, lights and shadow maps unchanged, the prebuild's
  slices, programs, memory, purity, and §5 (a)–(d) by projection through the camera as rendered. It drives the stage itself
  (`ctx.intro.stage`); `--via=director` seeks through `debug.intro` instead, for the merge; `--ui` leaves the DOM on.

## Captures

`tools/out/intro/` (untracked): `strip/` desktop 960 × 540 high · `strip-low/` desktop low · `strip-phone/` 390 × 844 medium ·
`strip-phone-low/` phone low; each with `strip.json` (per frame: the whole frame's calls and triangles, the set's, the
projections) and `sheet-*.jpg` contact sheets. Earlier rounds, for the record of what was changed and why: `r0` … `r4`.

Five look-and-fix rounds: `r0` first light (kept: the lantern, the windows, the contact frame); `r1` a bigger, more amber
lantern, staggered windows, stubs that hang true, the flank re-lit; `r2` the flank's light the right way up, the card to
violet; `r3` the smooth dark flank and its seams, the leak hunt; `r4` single-sided flank (a fade was blending its far side
through in stripes), the phone's shoulder take, the water light short of the shore, the low tier's streak.

## What is still weakest

1. **11.4–12.0 s in landscape** is a pale wall with one line on it; it lives on the eye that just passed and the glow leaving.
2. **The phone's first 0.2 s of the flank** (10.2–10.4): a blunt wedge from the left edge before the eye arrives.
3. **Landscape crops the towers' spires** in `lit` / `fall`: the lens is pinned at 46° and the mirror image must clear the
   words band, so the frame is spent on the lantern and its twin. The phone has the whole gate.
4. **The low tier has no mirrored lantern**: the gold path on the water stands in for it (it reads, but it is not the showpiece).
5. The contact ring is seen edge-on from 2 m up: a pale streak along the waterline, not a ring. The flash carries the moment.
6. The spark where the chain parts is a glint at the very top of a 540-line frame.
