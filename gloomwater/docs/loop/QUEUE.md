# Work queue (the lead's running list)

The user asked on 14 November 2026: "Let's pause and focus on one task at a time." Then: "Just choose the next job and run continuously until all queued work is complete." One job runs at a time; the lead picks the order below and starts each the moment the one before is merged, without stopping to ask.

## How jobs are run (the user's "Yes", 15 November 2026)

The user asked why changing a unit of weight took so long and cost so many tokens, and said **"Yes"** to sizing each job to the work. This amends the user's job template of 14 November ("Outsource all coding and building tasks to fable 5.2 extra high, things that you dont think need as much heavy labour give to opus 5.5 on high"):

| size | for example | how it runs |
|---|---|---|
| **small** | a unit, wording, a rename, a number, a docs amendment | **one agent** at **high** effort (Fable for code, Opus for docs); no separate spec, review or fix agents; only the tests that touch the change; the full regression once, by the lead, at the merge |
| **medium** | a new screen, a system change, a sim re-tune | a **build agent** (Fable, extra high) and **one reviewer** (Opus, high); a fix agent only if the review finds a must |
| **large** | a slice build, the cove, an art job | the full pipeline as before: spec, lanes, stage, reviews, fix |

If Fable's usage runs out, every Fable agent switches to **Opus 5.5 at the same effort** (the user, 15 November 2026: "If we run out of fable usage just switch to a similar opus 5.5 model and effort level"); new workflow scripts wrap each Fable agent so a usage-limit failure re-runs it on Opus at the same effort, and a running job that stops on the limit is resumed with its Fable agents switched to Opus.

Also binding: **no scope the user did not ask for** (if something extra looks worth doing, ask first); the full browser regression runs **once**, at the merge, not in every agent; one machine-heavy job at a time, design jobs beside it.

## The order (the lead's choice, re-ordered by the user's words of 15 November 2026)

The user, 15 November 2026: "Once this visual job has ran, focus on all code based jobs first as they're much faster". Then, asked what it takes to get map 1 and the home base "fully 100% finished and playable", the user said **"Yes"** to the lead's re-cut: **finish the Mossmere and the home base first** (milestone M1, "the Mossmere and the Landing, complete"); everything for Sporewood and the later waters waits until M1 is done. The design and code jobs still run first (2–7); then M1's builds in order (8–13); then the rest.

1. ~~The catch show~~ *(DONE 15 November: merged at 32c7133 with the cut scene; the preview updated; the film with its sound sent)*
2. ~~The world map and the story~~ *(DONE 15 November: merged at ad8461d; LORE.md v2 and WORLD.md v2, the Waxwold; the map published as the artifact "The Waxwold"; the new line 3 proposed: "Its last candles fish from lamp to lamp.")*
3. ~~**Pounds**~~ *(DONE 15 November: merged; preview updated; the play's estimate stays a class word (a weight during a play would name the fish); "over 18 lb 0 oz" and "said to reach" are the build's wording)* (the user, 15 November 2026: "I know this is a weird unit of measurement change but we always use pounds as a gauge of fish size can we have that as our unit of measurement please"). A fish's size is told in pounds everywhere the player sees it: the card's headline and its count, records and personal bests, the Journal and ledger, bounties and challenges, the play's estimate, Murk's lines. Format (the lead's default, the UK angler's way): under 1 lb in ounces ("11 oz"; under 1 oz to the nearest quarter, "¾ oz"); 1 lb to under 100 lb as "4 lb 6 oz"; 100 lb and up in whole pounds ("212 lb"). Length stays the hidden truth (the model's scale, the show's pose, the classes) and is kept only as a detail line on the card. The species' weights are audited against their real-world cousins so the pounds ring true. v3 and the loop only; the flag-off v1 game keeps parity.
4. ~~**The Lamp Road re-routed**~~ *(DONE 15 November: merged at 475abd8; WORLD/LORE v2.1, the forward-road check in tools/world-map/road.mjs; the map republished to the same link, version 2)* (the user, 15 November 2026, on the published map: "Going from 7, back on yourself to 8 then back on yourself massively to 9 makes no sense"). The unlock order stays (the ramp, the kinds and the sims are built on it); the waters move on the continent so **the road only goes forward**: every water lies further along than the one before; a side water up a river or fjord may be a short out-and-back of its own length, never a return past an earlier water. Known breaks: 7→8→9 (the Last Light out at sea, back inland up to Pyrefall's snow temple, back out and down the Long Coast to the Reef: Pyrefall moves to a gorge coming down to the west coast at the Spine's south end, just past the Last Light, its temple the last stop before the long voyage south); 5→6→7 (up the Thin Water at the Sound's head, back down the whole Sound: the Thin Water meets the Sound near its mouth, on the way out to sea); 14→15→16 (the Inkwood lies back between the Siltway and the lagoon: it moves beyond the lagoon so it stays the road's far end). WORLD.md and LORE.md (each water's "from" leg, coordinates, regions, story lines) and the map generator are revised; the map is re-baked and republished to the same link; a validator in the generator fails any leg that runs back past an earlier water.
5. **The M1 plan, with the Chart** *(running, beside pounds)* (design): re-cut SPEC §13 and the slice PLANs into M1 (the slices' Mossmere halves, the cove pulled forward, Sporewood's sheet sealed "coming soon"); the world map as the in-game Chart (SPEC §5.4, §13, the Chart lane, the three seals, the tutorial's last beat on the map, the SPEC pointers); the sim's pacing for a Mossmere-only arc (`--shipped`); M1's done-list.
6. The three keys (resume `wf_1c95633f-092`).
7. ~~The Wicks' passives, design~~ *(DONE 15 November: `docs/loop/WICKS.md`, merged; the Wick: Curious, firsts sell higher; Taper: Long Reach, first bites never common; Stub: Moth-Bright, quick bites; Tallow: Long Night, an early night of bigger fish; Ashwick: Burns Back, a lost fish comes back once. The user's answers (15 November 2026): "Default for all except 4 which i want yes": giants do not come back for Ashwick; the Wick is paid for firsts; Stub is the stayer; the five lines as written; and **yes to a carrier Wick**: the lead gives it to Tallow (4 slots at the start and +1 good bite; Long Night moves to the alternatives); WICKS.md revision 3 merged: Tallow's passive is Broad Back, "Stout enough for one more fish.", 4 to 9 slots, +1 good bite at open water)*
8. The Wicks' balancing in the sim.

**M1: the Mossmere and the Landing, complete** (each step built, reviewed, merged and previewed before the next)

9. Slice 1a: the core loop at the Jetty (the opening with the five Wicks, the tutorial, three slots, the tally, the tackle shelf, saves), its PLAN amended by 3–8; the cut scene's new line 3 put in and re-timed; the catch show's backlog below.
10. The Mossmere's roster fish (slice 1b's Mossmere half): the eight at roster sizes, the converter, the allow-list.
11. *(visual)* The Mossmere's places, giants and legend (slice 2's Mossmere half): the four places in mist, the Thousandcast Pike and the Hullkiss Lamprey, the Belled Matriarch, Elders in old water, Kissmark Trout, Gloam Eel, Bridgechain Sturgeon, the lamprey / sturgeon / trout plans, the drawn Chart.
12. Bait, lures, the raft parts and Murk's orders (slice 3 without Sporewood's fish), and the catfish plan so the Matriarch is a catfish.
13. *(visual)* The cove built (FE-W1, `SUPPORTS_COVE`), then the Landing as home (slice 4): the posts, the home upgrades in the scene, the Waystones, the prints and the giants' page.
14. The polish pass: the show's sound mix, phone performance, one full playthrough from a fresh save to an empty shelf, the new cut-scene video with its sound.

**After M1**

15. *(visual)* The ramp is the land (resume `wf_f7bccff9-e78`) and the rest of slice 1c; slice 1d, the river spike.
16. Sporewood and onward (the slices' other halves, then 5–9).

## Running

The user, 15 November 2026: "Can we run anything else in parallel without slowing the process down?" The lead's rule since: **one machine-heavy job at a time** (any job that runs the game's browser tests or long sims: the code builds, the sim re-tunes, the balancing); **design and writing jobs may run beside it**, because their work happens off this machine, and any bake or render they do runs under `nice -n 15` so it yields to the heavy job. More agents at once spends the usage allowance faster; if a limit is hit, the heavy job keeps priority.

- **The three keys** (job 6, MEDIUM; the heavy job; branch `gw-loop-access`).
- **The M1 plan, with the Chart** (job 5; beside; branch `gw-loop-m1`; run `wf_89700e40-adc`): M1.md, SPEC §13 re-cut, the Chart, the WICKS / OPENING / LORE pointers applied, PLAN 1a amended.
- ~~The names audit~~ (cancelled 15 November: the user, "I dont care if they're named after real rivers or lakes"; the rule since: real river and lake names are allowed in the world and on the map; the TV series and its presenter are still never named in anything that ships).

## Backlog for slice 1a (job 9) (found on the catch show's merge; small, code only; lane B unless named)

The merge review (15 November) found no regression a player would see; these are the leftovers, carried into slice 1a's build because it opens the same files:

- **The grade under a replayed film:** `render.js` trophyK eases toward the trophy grade while `showCam.w > 0.5` even when the film's camera is set, so a Prologue started straight from a show's card opens with the trophy vignette and saturation for about 2 s. The film should own the grade as it owns the lens.
- **The card's stamp under the film:** a card closed before its stamp still emits `card:stamp` next frame; `audio.js`'s handler has no flow guard, so a seal and its duck can sound under the film's first frame. Guard it by the flow (or drop the stamp when the card's panel left the play).
- **A trial completing on a catch rings inside the show** (`challenge_complete`, `unlock`): a new player's first fish ("First Light") would hear them in the still pause while their toasts are rightly held. Hold the sounds with the toasts until the card.
- **The show's sound mix** (the film's listen, `tools/out/show-merge` on `gw-show-merge`): the present is not the loudest beat (the caught instant's chime + splash + haul is); an Elder's card out-shouts its show (three class chimes at -2.9 dBFS, the black-wax stamp the loudest sample at -1.5); the Small's cord ticks sit at bed level; a lake rise can gulp on the card's first frame (hush rises during the landing as the rings are hushed); the unfold has only the generic `ui_open`. Audio lane, by ear and by the offline render (`node tools/audio-render.mjs --set=show`).

## Paused (work saved on their branches; each resumes from its workflow run)

| job | run | branch | where it stopped |
|---|---|---|---|
| The ramp is the land (physical greening) | `wf_f7bccff9-e78` | `gw-loop-nature` | critics |
| The world map and the story (LORE.md, WORLD.md, the continent map) | `wf_83a11939-9e7` | `gw-loop-world` | the judge, writing LORE.md and WORLD.md |
| The three keys to a new water | `wf_1c95633f-092` | `gw-loop-access` | the sim re-tune |
| The Wicks' passives | `wf_91d42619-6b9` | `gw-loop-wicks` | the proposals |

## Queued, with the user's decision

| item | the user's words | when |
|---|---|---|
| Rewrite the cut scene's line 3 ("Its last candles fish to stay lit.") so it fits the new loop and points toward the journey | "Yes, rewrite line 3 once the story's done" (14 November 2026) | drafted in LORE.md §12 by job 2: "Its last candles fish from lamp to lamp." (the alternate: keep the old line); put in and re-timed in job 9 (slice 1a); the new video in job 14 |
| The world map becomes the in-game Chart | "Yes make the map our in-game Chart" | job 5 (the M1 plan, with the Chart) |
| Wick balancing in the sim | "each one has a powerful unique passive ability" | job 8 |
| Slice 1a build (three slots on the built fish, the opening, the Chart) | — | job 9, the start of M1 |
| Finish the Mossmere and the home base first (M1) | "What do we need to do to get map 1 and the home base fully 100% finished and playable" · "Yes" (15 November 2026) | jobs 5 and 9–14 |
