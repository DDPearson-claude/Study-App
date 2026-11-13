# Lane B, "director and flow": what was built (hand-back to the merge agent)

Branch `gw-intro-flow`, on top of `gw-intro` (cf97b88). Read with `docs/v3/intro/SPEC.md`; section numbers below are the spec's.
Everything is v3-only; with the flag off `ctx.intro` is null, the view is not created, nothing here runs. `gloomwater/index.html`
was not rebuilt. `DESIGN.md`, `CONTRACT.md`, `SPEC.md`, the validator, the seam test and `check.mjs` were not edited.

## 0. Requests to the merge agent (read first)

1. **`water.rebakeDepth()` (lane A's file, one line).** A replay from a title that shows another lake swaps the world to the
   Mossmere with no `zone:change` (§7.4). The water bakes its depth map only at init and on `zone:change`, so after the silent
   swap it keeps the other lake's shoreline until the swap back. `main.js` already calls `ctx.water.rebakeDepth?.()` after each
   swap; add in `src/water.js` (an `INTRO LANE A` block of the API): `rebakeDepth() { startDepthBake(0); depthJob.again = 1.5; },`.
   Without it the replay still works (frames `desk-lake-film.png` / `phone-lake-film.png` show no obvious fault from the gate
   take), but the shore foam and the shallows are the wrong lake's.
2. **The film now wears the Mossmere's own grade.** `render` ignores `zone:change {intro: true}` wholesale, which also skipped the
   lake's grade (`ZONES.mossmere.grade`: saturation 1.04, exposure 1.04, violet tint .2), so the first run after the film would have
   played in the title's default grade (saturation .86) until the next lake. Main now applies the lake's grade **under the opening
   ink** (`INTRO.handoff.grade: 'ink'`), in the same hook that swaps the lake, and gives the title's grade back after a replay. The
   film is therefore graded exactly as the run is and nothing shifts at the hand-off. **Lane A judged its frames in the title's
   grade: re-shoot the strip after the merge** (`debug.intro('seek', t)` goes through the real flow now, so the strip scenario gets
   the grade by itself). If the stager prefers the title's grade for the film, set `INTRO.handoff.grade: 'ease'`: the film keeps the
   title's grade and the lake's eases in as control begins (built, one line in data).
3. **The stage is entered under the ink, never at the press** (see section 2 for the exact call order). SPEC §9 says "Begin does
   … `stage.enter()`"; the director does that only when the stage is prebuilt *and* there is nothing to do under the ink, and
   main always has something to do there (the grade, sometimes the lake). So the press costs a `closeAll`, a flow change and
   nothing else (measured: 3–6 ms of script), and `enter()` lands one frame after the ink was painted full (0.37–0.5 s).
4. **Two additions to the stage's `setTime` options**, both optional for the stage: `calm: true` under *reduced flashing* (the
   stage should quarter the contact flash, §3; the view makes the cut an ink dip), and under reduced motion the very last call is
   `setTime(INTRO.length)` (the end state), not the `home` still.
5. **`intro:beat` is emitted before the stage shows the new beat** (it was after, in the skeleton). The view needs the outgoing
   picture still on the canvas to copy it for the reduced-motion cross-fade.
6. **One program is compiled mid-film by the game's own scene** (not by the stage): on the desktop strip `renderer.info`
   goes 76 → 77 programs, 106 → 108 geometries, 31 → 32 textures between 2.9 s and 5.0 s of the `gate` take, with the stub stage
   owning none: something of the arena the title's orbit never drew is first drawn by the push-in. Lane A's `prebuild()` should
   warm the scene from the film's own camera poses (`renderer.compile(scene, camera)` at the `gate` and `shoulder` keys), not
   only its set. The hand-off itself compiles one more (77 → 78 was not seen; 76 → 77 at the hand-off when the film was skipped
   before 3 s): that is the run's own start, as on any new run.
7. **`water.js` `ambience()` runs only in flow `playing` / `title`**, so the lake's own random rings stop during the film (flow
   `intro`). If lane A wants them in the `lit` beat it is a one-word change in lane A's file.
8. **Docs to fold in** (CONTRACT §13.13, DESIGN §25.4.9, SPEC §7): the API in section 1 below, the `mode` field on `intro:done`,
   `start({underInk})`, `state.skip / entered / calm`, the new `INTRO` keys (section 4), `debug.audioIntro()`, the Skip word going
   over the last 0.5 s, and that `game.save()` is a no-op in flow `intro`.
9. `tools/audio-render.mjs` gained `--set=intro` (it is not on the "nobody edits" list). Nothing else outside the lane was touched.
10. Not my block, left alone: the fresh title still prints the meta line "No Wick has gone down yet · 0 of 33 species named"
    under Begin / Settings. It is the only other text on that screen; cutting it is a one-line change in `showTitle`.

## 1. What was built

| file | what |
|---|---|
| `src/intro.js` | the director: the film's clock (`stepClock`: real elapsed time, clamped to 0.1 s a frame, still while `document.hidden`, a 25 s valve that shows the end state before it hands over), the two skip paths, the under-ink entry of the stage, reduced motion's stills, every stage call wrapped. Pure exports added: `skipModeAt`, `skipWordAt`, `skipAllowed`, `cutDipAt`, `stillDipAt`, `inkFullAt`, `introSeen`, `markIntroSeen`, `replayOffered`, `soundEvents`, `soundEventsBetween`. No three.js, no DOM |
| `src/ui-intro.js` | the view: the words, the Skip word, the ink veil, the reduced-motion snapshot layer, the curtain. Pure exports `wordsBand`, `veilFor`. Created by `ui.js` (`ctx.ui.intro`), updated last in `ui.update` |
| `src/audio-intro.js` | the cue's synthesis (`createIntroCue`), no clock of its own |
| `src/audio.js` (4 marked blocks + 3 marked lines) | the cue's bus into the music gain, the title music out and held out, the film's clock playing the cue, a skip's fade, the hand-back |
| `src/main.js` (blocks `import`, `flow`, `create`, `keys`, `debug`, `frame` + 5 marked lines) | the trigger, flow `intro`, the hand-off, the replay and its lake, the keys, the save gate, the watchdog |
| `src/ui-screens.js` (block `title`) | Begin on a fresh save; the Prologue word |
| `src/ui.js` (4 marked blocks) | creates and updates the view |
| `src/ui.css` (block) | `.gw-intro-*`, `.gw-intro-on`, `.gw-title-replay` |
| `src/data.js` `INTRO` LANE B block | see section 4 |
| `tools/tests/intro.test.mjs` | 402 assertions (in `check.mjs` by its name) |
| `tools/tests/intro-flow.scenario.mjs` | the browser scenario, desktop and `--mobile` |
| `tools/audio-render.mjs --set=intro` | the cue rendered offline, its peak, a skip's fade |

**`game` (main):** `introPending()` · `introReplayOffered()` · `prewarmIntro()` · `beginIntro({reduced})` · `replayIntro({reduced})` ·
`skipIntro()`. **Flow `intro`:** no run, `gameDt` 0, `ctx.cinematic` held (main's rule that clears the flag outside `playing` /
`hub` now spares `intro`; main's 20 s valve needs `running`, which is false here), `game.save()` returns at once, keydown handles
only the skip keys and swallows the rest (browser chords and F-keys pass), nothing reaches the game.

**The trigger (A3).** `introPending()` = v3 + `INTRO` + flow `title` + `!FE_ON` + `introPending(…)` (the seam's rule). While it is
true `showTitle` prints **Begin** (autofocus, main style) and **Settings**, removes the premise paragraph and asks for a prewarm
(0.5 s later, in idle time, up to 8 idle slices). Begin calls `beginIntro()`: `closeAll`, `setFlow('intro')`, `ctx.cinematic = true`,
`ctx.intro.start({replay: false, underInk})`. No other click exists between Begin and play. Under `GW_DEBUG` with no opt-in
`pending()` is false and the title is byte for byte today's (no Prologue word either on an untouched save).

**The hand-off (§7.5).** `intro:done` is listened to by main *last* (registered after every module's init), so every module saw
the film end before the run starts; then, in the same task and the same frame: `markIntroSeen(meta, skipped)` →
`startNewRun({character: 'wick', nightMode: 'still', __intro: true})`. On the bus, in emit order: `intro:done` → `flow:change
{playing, prev: intro}` → `zone:change {mossmere, prev: null, intro: true}` → `run:start {continued: false}`, then the save. A
stage error hands over the same way (`seen: true`). If the hand-off itself throws, or a film ends with no hand-off, a watchdog
puts the game back on the title within 1.5 s.

**The replay (§7.4).** The title's lower line carries **Prologue** when `replayOffered` (v3, not pending, a save that has started
or seen the film). It is the same film with `replay: true`; it writes nothing (`game.save()` is gated by the flow; `meta` and the
stored string are compared in the scenario) and ends at the title. On another lake: under the opening's full ink
`world.setZone('mossmere', {instant, flash: false})`, `player.teleport(spawn)`, `water.setObstacles(null)`,
`water.rebakeDepth?.()`, the lake's grade; at the end the lake and the title's grade come back under a 0.3 s curtain of ink (a veil
skip already ends under full ink, so there it is done in the same frame); `game.toTitle()`, `wipeAll()` and `debug.intro('stop')`
put it back too. No `zone:change` for either swap.

**When the cove ships** (`world.SUPPORTS_COVE`): `introPending()` and the replay are **off while `FE_ON`** until the cove dressing
of the film is built (the world under the title is then the cove, and the stage's anchors are the Mossmere's). What to build is
SPEC §7.5 and `INTRO.cove`: G = the sea-gate arch, S = the hearth, the film's lines replace `FIRST_EVENING.text.lore`, and
`onIntroDone` calls `firstEvening.start()` at step `wake` instead of `startNewRun`.

**Skip (A2).** The Skip word (Marcellus SC 15 px, lavender at 70 %, top right at `max(12px, safe area)`, 64 × 44 px, no frame)
comes in 0.6 → 0.9 s and goes over the film's last 0.5 s; Esc, Enter, NumpadEnter, Space; ignored before 0.5 s and on key repeat
(a held Enter from Begin never skips); a press anywhere else only brightens the word for 2 s. `veil` (lit / fall / below): the
view's ink closes in 0.2 s, one painted frame of full ink, then the film jumps to its end and hands over; the hand-off frame is
drawn under full ink and the ink opens over the next 0.35 s. `finish` (wick / home): no ink, the words clear, the rest plays out
in 0.5 s. Both timers run on real time (0.25 s a frame at most), so a slow machine still ends in a few frames.

**Reduced motion (A8).** On by `prefers-reduced-motion`, `meta.settings.reducedMotion === true` or `start({reduced: true})`. The
stage gets one still per beat; at each change of beat the view calls `render.render()` and copies the canvas into a 2D layer that
fades out in 0.5 s (0.3 s at the cut) on the wall clock; if the copy ever fails the changes become ink dips (`stillDipAt`).
`reducedFlashing` alone leaves the film moving and makes the cut a 0.3 s ink dip (`cutDipAt`).

**Sound (A7).** One cue in D Dorian on its own bus (`voices → lowpass → level`) into `N.musicVol` with a send into
`N.musicWetVol`, so the master and music sliders apply. `intro:start`: `music.stopAll(0.3)` and no mood is picked until the film
ends. Events (`soundEvents(INTRO)`: every mark's `on`, a sustained section's `off`, one `note` per harp note) are played when
`ctx.intro.state.t` crosses them; a held (sought) film and a jump of more than 1 s play nothing. `ember_swell` and `flame_catch`
are the game's SFX on the SFX bus. A skip ramps the level to 0 in 0.25 s (linear, from where it is), fades the two SFX with it and
stops sources only after the ramp. The natural end lets the last harp note ring 3.2 s, then releases the nodes; the next mood pick
is the flow's (`calm` after the hand-off, `title` after a replay). Locked audio: nothing is built or logged; a context that is not
running schedules nothing past the film's first half second. `debug.audioLog` shows `intro_cue` with `why` = `start`, each mark,
`fade`, `end`. Offline: peak of the cue's bus −6.2 dBFS (at the contact, 8.0 s), 18 dB quieter than that nowhere it matters; a skip
at 3 / 7.95 / 16 s leaves no residue after 0.3 s and no step larger than the wave's own.

## 2. How the stage is called (exactly)

1. `createIntroStage(ctx)` once, lazily (the first `prewarm()` or `start()`); the same object serves every later play.
2. `prebuild()`: from the fresh title only, in idle time, again on each idle slice until it returns `true`. Never on a returning
   save's title (a replay builds in `enter()`).
3. `start()`: nothing is called on the stage at the press (main always passes `underInk`). `setTime(t, …)` is called every frame
   from the first one, **before `enter()`**, and must do nothing then (the seam test holds this).
4. One frame after the opening ink was first painted full (`t` 0.37–0.5; at the latest at 0.6): main's hook (lake and grade),
   then `enter({replay, reduced})`, then that frame's `setTime`. On a `seek` or a skip's jump: at once, in the same order.
5. Every frame of play: `setTime(t, {live: true, reduced, calm})`, `t` never decreasing; under reduced motion `t` is the beat's
   still (`INTRO.stills`), and the film's last call is `setTime(INTRO.length)`.
6. `setTime(t, {seek: true, reduced, calm})`: debug seeks; a veil skip's jump (`t = INTRO.length`); the valve.
7. `dispose()` before `intro:done` is emitted, on `stop()`, on any error. The stage must be reusable afterwards (a replay calls
   `enter()` again with no `prebuild()`). `exit()` is never called by the director itself.
8. A throw from `enter` / `setTime` ends the film: reported, `dispose()`, `intro:done {error: true}`.

## 3. Acceptance, as measured

Software GL, 4 shared cores: nothing was judged on real-time playback. The scenario holds the page's `requestAnimationFrame` and
calls the game's own frame callback on a synthetic clock (30 frames of film a second), drawing only the frames it shoots.

| | result |
|---|---|
| **A1** | unit: 144 / 60 / 30 / 20 / 10 fps all 18.0 s ± one frame; a 30 s frame moves the film 0.1 s; 2 fps ends by the valve at 25 s in the end state; hidden: clock, valve and stage stand still. Browser: 18.017 s of film between `intro:start` and `intro:done` (desktop and phone). Real clock with drawing off: the frames' time clamped to 0.1 s adds up to 17.92 s; on `performance.now()` 28.1 s on this machine, of which 7.0 s were seven frames of up to 3 s that the clamp gave up (so ± 0.5 s needs a machine that holds 10 fps: not verifiable here) |
| **A2** | the Skip word 64 × 44 px at 12 px from the top and right edges on 960 × 540 and 390 × 844, opacity 1 at 1.0 s, 0 inside the guard; a skip at 0.3 s ignored by call and by Enter / Space / Esc; taken at 0.6 s by the word, at 6.6 s by Esc, 10.2 s by Enter, 13.4 s by Space, 17.2 s by the word; `intro:skip` → `intro:done` ≤ 0.267 s (veil) / ≤ 0.517 s (finish) at 60 fps; unit: 101 skip moments across every beat, each one `intro:done`, each in the full play's end state; the end state compared item by item in the browser |
| **A3** | fresh + opt-in: Begin, Settings; one press → `intro:start` in the same task, no modal; afterwards Continue / New Descent and the Prologue word; a second new run plays nothing; the Prologue word plays it and leaves `JSON.stringify(meta)` and the stored string identical (full, skipped at 3 s, skipped at 13.5 s); a replay from a Sporewood title swaps to the Mossmere under ink and back; with no opt-in under `GW_DEBUG` the title is today's |
| **A4** | at every line and in `below`: flow `intro`, `ctx.cinematic`, `state.run` null, `time.gameT` unchanged, no HUD / toast / banner / modal; W held, E F P C J R Tab and a press on the picture change nothing (raft, fishing state, clock) and only brighten the Skip word |
| **A5** | 4 lines ≤ 47 characters; 19 px desktop / 18 px phone Alegreya italic; one row each at both sizes; boxes inside the band; no border, outline or box-shadow; contrast against the pixels behind the box, glyphs hidden: 13.5–15.6 : 1 on the frames, 10.2–11.0 : 1 over a flat candle-amber frame, 8.6–9.5 : 1 over flat pale gold (desktop; phone 13.8–16.0 / 10.8 / 9.3) |
| **A7** | unit, on the fake WebAudio: every mark once and in order, ≤ 12 voices (peak well under), the title layers ramp to 0 within 0.3 s, no mood under the cue, a skip ramps the bus to 0 in 0.25 s from its level and stops sources after it, locked = nothing, suspended = nothing queued, a replay hands back to `title`. Browser: rms > 0 with the cue, < 0.0005 with the master at 0, < 0.001 with the music slider at 0, the marks in order in `audioLog`, the bus level read back at 0 0.33 s after a skip, `calm` after the hand-off, no sting. Offline: −6.2 dBFS |
| **A8** | forced reduced: five stage times after the swap (the stills) then the end state, one camera pose per beat, the same lines at the same times, 18.0 s, 4 snapshots, the layer at opacity > 0.8 on the first frame of the new beat and gone within 0.6 s of wall clock, Esc skips into the same end state |
| **A9** (B's part) | the press: 3–6 ms of script; the hand-off (`startNewRun`): 10–12 ms; memory back to its baseline after a replay and after replays skipped both ways (the stub stage owns nothing: lane A's disposal is lane A's test) |
| **A10** | a stage that throws after 0.2 / 3 / 9 / 14 s: one `intro:done {error: true}`, the same end state, `seen: true`, the raft sails; resize 960 × 540 ↔ 390 × 844 in every beat: no error, the band follows; `pagehide` mid-film writes nothing and a reload at 9 s finds the stored save byte-identical and the film pending again |
| **A11** | see section 6 |

## 4. Numbers (the `INTRO` LANE B block)

No timing of the seam commit was changed (lines, `lineFade`, `skip.guard / showAt / veilIn / veilOut / finish`, `clock`, `stills`,
`stillFade`, the marks' times). Added:

| key | value | why |
|---|---|---|
| `skip.wordFade` | 0.3 | the Skip word comes in over 0.3 s from `showAt` (there by 0.9 s, inside A2's 1 s) |
| `skip.wordOut` | 0.5 | it goes over the film's last half second: the camera is at rest from 17.4 s and the last line is gone at 17.5 s, so nothing of the film's is on screen when the HUD arrives. The keys still skip to the end |
| `skip.poke` | 2 | §7.2's 2 s |
| `calm.cutDip` | 0.3 | §3's 0.3 s ink dip (the frozen `cut` block could not hold it) |
| `sound.wet`, `sound.endRing` | 0.5, 3.2 | the reverb send; how long the last note rings before the nodes go |
| marks: `cents`, `lowpass`, `partials`, `over`, `decay`, `volume`, `db` on `spark` | — | the recipes of §7.7's table, as data |
| `trigger.prewarm` | `{after: 0.5, tries: 8}` | the title's menu fades in from 1.9 s, so the build has finished before Begin can be pressed |
| `trigger.replay.hint`, `.veil` | "Watch the opening again", 0.3 | §7.4 |
| `handoff.grade` | `'ink'` | request 2 above |

Tuned by ear on the offline render (`tools/out/intro/audio/intro_cue.wav`, `.png`): the groan and the deep drone were 5 dB over
the contact in the first render (−1.2 dBFS on the bus); the groan was brought down to 0.42 × its nominal level, the deep drone to
0.85 ×, the harp to 1.55 ×, and the bus's make-up gain is 1.45 (`CUE_GAIN`), which puts the loudest moment, the contact, at −6.2 dBFS.

**The pool behind the words.** SPEC §2 says `rgba(10,12,25,.84)`. Round 1 used .9 at the centre and read as a dark lozenge on the
brighter frames (the `shoulder` take; and see `desk-line-2-amber.png` of that round). Browsers blend in gamma space, so the pool is
far darker in luminance than its alpha suggests: round 2 is .78 at the centre feathered to nothing well inside its own edge, and
still measures 10 : 1 over a flat candle-amber frame. On a phone held upright a pool would be cut by the screen's sides, so there
the picture's foot sinks into ink across the whole width instead (a 46 px feather above the words).

## 5. Cut

Nothing from §11's lane B rungs: the snapshot cross-fade works (the copy needs one extra `render.render()` in the task that
copies), Journal / Shrine / Trials are left off the fresh title, the groan and the chord's bend are in.

## 6. Regression

See the final commit's message and the summary handed back with it for the last run of each: `node tools/check.mjs`,
`node tools/validate-data.mjs` (three passes, the flag-off fingerprint untouched), `tools/scenario-run.mjs` on a flag-off dev
build, `tools/tests/run-v3.scenario.mjs` on the v3 build, `tools/tests/intro-flow.scenario.mjs` desktop and `--mobile`.

## 7. Captures

`gloomwater/tools/out/intro/` (not tracked): `flow/desk-*.png` and `flow-phone/phone-*.png` (the fresh and the returning title,
each line and the same line over flat candle amber, the ink at the swap, `below`, the last second, the hand-off, a skip's ink and
the frame after it, the reduced-motion still and cross-fade, reduced flashing's cut, the replay from a Sporewood title and back);
`flow-desk*.log`, `flow-phone.log`; `audio/intro_cue.wav|png` (the whole cue through the game's bus), `intro_bus.*` (the cue's own
bus), `intro_skip_*` (a skip's fade). The pictures show lane A's stub (the camera and the lake only): the set is not in them.

## 8. Known limits

- The words and the Skip word are drawn in the fallback serif in every capture (the build loads its fonts from the network, the
  sandbox has none). The measured boxes are a little wider than Alegreya's will be.
- `phone-*` frames were shot at the medium tier in a 390 × 844 touch context; no real device was used.
- The reduced-motion cross-fade costs one extra full render at each of the four changes of beat.
- The real-clock length (18 s ± 0.5 on `performance.now()`) could not be shown on this machine (it stalls for up to 3 s with
  drawing off); what was shown is that the film advances by each frame's real time clamped to 0.1 s.
