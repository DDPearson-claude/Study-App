<!-- Design write-up produced on 2026-10-05 from a three-concept judge panel (2D side view 25, 3D paper diorama 18, 2D isometric 14), then re-synthesised with the author's steer: our own identity, flavours borrowed from other games, hybrid pad input, wrong-item humour. -->

# Pages: the recommended design for Doodle Life's puzzle mode

## 1. Recommendation

Build the 2D side view: all three judges rank it first (25 vs 18 vs 14) and their reasoning holds, since the stroke stays the collider, every behaviour he needs already exists in doodle-life.html, phones work unchanged and phase 1 fits in one session. The paper diorama is the right source of "strange" later: nothing below depends on the renderer, so an orthographic three.js skin (extruded cutouts, tilt-to-peek) can sit over the same 2D entities once the pages are proven. The isometric form should not be built, but we take its ghost preview, the pulsing failing obstacle and its "the room already holds half the answer" level.

## 2. Identity and player loop

**The page is the world.** A level is a sketchbook page: paper texture, a ruled margin, fixtures (walls, pits, plates, doors, clouds) pre-drawn in grey pencil so the player's ink stands out, eraser crumbs piling up when something dissolves. Sky drawings change the page as in the sandbox; a level transition is a page turn.

**He walks first.** The preloaded stick man heads for the exit, fails, and says what he lacks in a needs bubble: "gap. no.", "can't reach", "plate wants heavy", "I will not get wet", "that thing wants a fight". The failing fixture pulses; a second tap narrows the hint.

**Hybrid input.** *Level ink*: draw straight onto the page for structure (bridges, ramps, walls, plugs). The classifier runs as now, plus one nudge: an open line spanning a pit is always a platform. *Pad ink*: a scratch pad slides up with a stick-man silhouette for scale, a live "looks like: banana?" label with confidence, a type override and undo; releasing drops the doodle at a tapped spot with a ghost and a 1.5 s correction window. *Library*: about 120 ready-made doodles (tools, food, furniture, junk, instruments, weapons, vehicles, toys) and 10 weird characters (sentient teapot, moth that follows lights, very small knight, cloud on legs, worm in a hat, grumpy rock, two-headed duck, outline-only ghost, shrub with opinions, loaf-shaped cat). Entries are stroke lists, so they get the same mask, physics and behaviours as drawn things.

**Wrong items are the joke.** He needs a sword and gets a banana. Everything he is handed gets a dry line from a `REACT` table keyed by item id with per-tag fallbacks: "a banana. I asked for a sword. this is a banana." Most wrong items are useless; some are secretly right (a ladder is a bridge, a kettle is heavy, a carried umbrella is shelter). Each character has one behaviour: the knight fights, the moth loiters in lasers.

**Pen weight is material.** Stroke size sets `material`: thin (3 and under) is feather, light and fragile (half mass, snaps under him beyond a 1.5h span); medium is paper; thick (8 and up) is brick (double mass, blocks lasers, presses plates).

**The toolbox.** Every doodle you draw or pick, with its label and your corrections, is kept in `localStorage 'dl-toolbox'` as the first Library tab, so your banana follows you across pages. Corrections feed a per-user bias (feature bucket to label counts) that nudges the classifier: he learns your handwriting.

**Margin notes.** The narrator writes in the margin in the artist's hand, picked by (label, confidence, outcome, ink fraction), never on the solution: "a chair. 61% sure. it did not help." / "birds are not load-bearing." / "38% of your ink. bold." Low confidence gives him his own line ("...is it a dog?").

**Par and stars.** One ink budget per page (1 unit = 120 px of stroke; pad and Library items cost ink). Stars: exit; under par; one object. Failure is soft: a fall or laser crumples him and he is redrawn at spawn, doodles kept; out of ink offers a refunding reset.

## 3. First eight pages

| # | Page | Obstacle | Intended | Accepted alternatives | Teaches |
|---|---|---|---|---|---|
| 1 | A Gap | 1.2h pit before the exit | one line across (platform) | crate pushed in as a plug; Library baguette or ladder laid across (long things over a pit are platforms) | draw = ground, exit = goal |
| 2 | Up | 2h ledge | small box; push, climb | sloped line as ramp; two stacked lines; Library stool or suitcase | heights, push and climb |
| 3 | Heavy | plate 3h from the door, opens it while pressed | thick-pen crate on the plate | thin crate fails and the margin explains; Library anvil, kettle (carried onto it) or the grumpy rock | pen weight is mass |
| 4 | Drizzle | cloud over the middle third | roof line under the cloud | tall box pushed along as a roof; Library umbrella, carried | shelter |
| 5 | The Guard | grey scribble beast blocks the corridor | a sword drawn on the pad (override: weapon) | any Library weapon; the very small knight; a trumpet (loud) scares it; a banana does not, and he says so | the pad, handing items, the joke |
| 6 | Half the Answer | 2.5h pit, ink for a short bridge only, a grey crate on the near bank | push the crate in (free), then a short bridge | Library ladder across the remaining gap | the page holds half the answer; pushing is free |
| 7 | Lift | lift cycling to a 2.5h ledge; laser gate off while a plate is pressed | thick crate on the plate, he rides the lift | crate drawn on the lift so both go up; Library teapot sits on the plate | movers, holding a plate |
| 8 | The Whole Page | ledge, plate behind a laser, rain over the plate, pit before the exit | roof, thick crate, ramp, bridge | brick crate pushed through the laser (it burns only feather and paper); moth occupies the laser; stacked crates as a ladder | combination, stars |

## 4. Architecture on the existing file

Level JSON (h = stick-man heights):

```js
{ id:'p05', name:'The Guard', ink:10, par:6, allowed:'all',
  spawn:{x:60}, exit:{x:900},
  floor:[[0,400],[560,960]],   // walkable segments, pit between
  fixtures:[{k:'plate',x:700,mass:1,opens:'d1'},{k:'laser',x:520,h:1.3,off:'plate'},
            {k:'guard',x:640,fears:['weapon','loud','knight']},
            {k:'door',id:'d1',x:900}],
  seed:[/* grey S() strokes */], rules:['fade'], needs:{gap:'gap. no.'} }
```

New sections appended (about 900 lines): `PAGES` data; `loadPage`, `resetPage`, `makeFixture`; `updateFixtures(dt)` for plate, lift, laser, door, cloud, guard, fade; `goalPlanner(e)`; the pad (own canvas, silhouette, live label, override, ghost drop); `LIBRARY` (stroke lists with `tags`: weapon, loud, heavy, shelter, character) and its sheet UI with the toolbox tab; `REACT` and `handItem(e, item)`; margin narrator; ink meter, stars; localStorage progress.

Classifier: `classify` is unchanged, wrapped by `classifyWithBias(strokes)`, which exposes `conf` (score margin), adds the toolbox correction counts and applies the pit override. Library items carry a fixed label and tags and skip classification; pad items get tags from the override menu.

Creature AI: `decide()` gains one high-weight option when `world.page` is set. `goalPlanner` walks fixtures left to right, returns the next sub-target or a `reason` (gap, height, weight, rain, guard, locked) that drives the bubble and the pulse; wander, sleep and greet weights are zero on a page. New states: `use` (stand on a plate, or place the held item on it via the existing give/place code) and `fight` (held item tag matches `fears`). `rainedOn` is unchanged; shelter is `highestSurface` above his head. `makeEntity` multiplies area mass by the material factor; lasers poof feather and paper doodles and are blocked by brick.

Physics fixes before tuning pages (from the judges): `physics()` lands every body on the global `floorY` (lines 555 and 559), so the floor becomes segments with a pit and respawn; real jump reach is about 0.9h horizontally, not 1.6h, so 1.2h pits need a bridge; lifts need `support.vy` inheritance; the planner owns jump timing, not `handleStuck`.

Reused unchanged: stroke capture, `finalizePending`, `rasterize`, `buildMask`, `findShelves`, `makeEntity`, `physics`, `resolvePlatform`, `resolvePair`, `highestSurface`, the whole `updateCreature` state machine, `say`/`SAY`, `puff`/`burst`, theme, `resize`, the `S` seed helpers.

## 5. Build plan

**Phase 1 (one session):** page framing and grey fixtures, floor segments with pit and respawn, exit door, `goalPlanner` (walk, jump, climb, push), needs bubbles with pulse, ink meter, pen weight mass, ledge and plate, pages 1, 2, 3 and 6, a 20-item Library stub so the drop path exists early.

**Phase 2:** the scratch pad (silhouette, live label, override, ghost window); full Library with tags and the 10 characters; `REACT` table; guard, cloud, laser, lift; margin narrator; pages 4, 5 and 7; toolbox persistence.

**Phase 3:** page 8, fade rule with wall pictogram, par and stars, handwriting bias, character behaviours, eraser crumbs, mobile pass (44 px targets). Optional phase 4: the diorama renderer as a skin.

**Top risks and de-risking:** (1) The planner fights his autonomy: deterministic planner, seeded `rand` on a page, always the leftmost unsolved fixture. (2) Classifier errors when they matter: ghost with undo, pad override, pit rule. (3) Stacked things on lifts jitter in the positional resolver: cap drawn objects at six per page and run a scripted `S()` stacking harness. (4) Authoring volume: 120 stroke lists and 130 reaction lines. Generate most items from parametric templates (box plus handle is a mug), hand-draw the 10 characters, write per-tag fallbacks first, then specific lines for the 40 funniest.

## 6. Open questions

1. Should The Guard (sword and banana) be page 5, or earlier so the signature joke lands sooner?
2. Pen weight: three named pens (feather, paper, brick) in the tray, or keep the size slider and show the material label?
3. Do Library characters cost ink like items, or are they free with one per page?
4. Is the toolbox per device only, or do you want an export code that survives a browser change?
