# Work queue (the lead's running list)

The user asked on 14 November 2026: "Let's pause and focus on one task at a time." Then: "Just choose the next job and run continuously until all queued work is complete." One job runs at a time; the lead picks the order below and starts each the moment the one before is merged, without stopping to ask.

## The order (the lead's choice, re-ordered by the user's words of 15 November 2026)

The user, 15 November 2026: "Once this visual job has ran, focus on all code based jobs first as they're much faster". Then, asked what it takes to get map 1 and the home base "fully 100% finished and playable", the user said **"Yes"** to the lead's re-cut: **finish the Mossmere and the home base first** (milestone M1, "the Mossmere and the Landing, complete"); everything for Sporewood and the later waters waits until M1 is done. The design and code jobs still run first (2–7); then M1's builds in order (8–13); then the rest.

1. ~~The catch show~~ *(DONE 15 November: merged at 32c7133 with the cut scene; the preview updated; the film with its sound sent)*
2. The world map and the story (run `wf_83a11939-9e7`): LORE.md, WORLD.md, the continent map (a 2D generator and page); publish the map; answer the user's questions. *(running)*
3. **Pounds** (the user, 15 November 2026: "I know this is a weird unit of measurement change but we always use pounds as a gauge of fish size can we have that as our unit of measurement please"). A fish's size is told in pounds everywhere the player sees it: the card's headline and its count, records and personal bests, the Journal and ledger, bounties and challenges, the play's estimate, Murk's lines. Format (the lead's default, the UK angler's way): under 1 lb in ounces ("11 oz"; under 1 oz to the nearest quarter, "¾ oz"); 1 lb to under 100 lb as "4 lb 6 oz"; 100 lb and up in whole pounds ("212 lb"). Length stays the hidden truth (the model's scale, the show's pose, the classes) and is kept only as a detail line on the card. The species' weights are audited against their real-world cousins so the pounds ring true. v3 and the loop only; the flag-off v1 game keeps parity.
4. **The M1 plan, with the Chart** (design): re-cut SPEC §13 and the slice PLANs into M1 (the slices' Mossmere halves, the cove pulled forward, Sporewood's sheet sealed "coming soon"); the world map as the in-game Chart (SPEC §5.4, §13, the Chart lane, the three seals, the tutorial's last beat on the map, the SPEC pointers); the sim's pacing for a Mossmere-only arc (`--shipped`); M1's done-list.
5. The three keys (resume `wf_1c95633f-092`).
6. The Wicks' passives, design (resume `wf_91d42619-6b9`).
7. The Wicks' balancing in the sim.

**M1: the Mossmere and the Landing, complete** (each step built, reviewed, merged and previewed before the next)

8. Slice 1a: the core loop at the Jetty (the opening with the five Wicks, the tutorial, three slots, the tally, the tackle shelf, saves), its PLAN amended by 3–7; the cut scene's new line 3 put in and re-timed; the catch show's backlog below.
9. The Mossmere's roster fish (slice 1b's Mossmere half): the eight at roster sizes, the converter, the allow-list.
10. *(visual)* The Mossmere's places, giants and legend (slice 2's Mossmere half): the four places in mist, the Thousandcast Pike and the Hullkiss Lamprey, the Belled Matriarch, Elders in old water, Kissmark Trout, Gloam Eel, Bridgechain Sturgeon, the lamprey / sturgeon / trout plans, the drawn Chart.
11. Bait, lures, the raft parts and Murk's orders (slice 3 without Sporewood's fish), and the catfish plan so the Matriarch is a catfish.
12. *(visual)* The cove built (FE-W1, `SUPPORTS_COVE`), then the Landing as home (slice 4): the posts, the home upgrades in the scene, the Waystones, the prints and the giants' page.
13. The polish pass: the show's sound mix, phone performance, one full playthrough from a fresh save to an empty shelf, the new cut-scene video with its sound.

**After M1**

14. *(visual)* The ramp is the land (resume `wf_f7bccff9-e78`) and the rest of slice 1c; slice 1d, the river spike.
15. Sporewood and onward (the slices' other halves, then 5–9).

## Running

- **The world map and the story** (job 2; resumes run `wf_83a11939-9e7` on `gw-loop-world`).

## Backlog for slice 1a (job 8) (found on the catch show's merge; small, code only; lane B unless named)

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
| Rewrite the cut scene's line 3 ("Its last candles fish to stay lit.") so it fits the new loop and points toward the journey | "Yes, rewrite line 3 once the story's done" (14 November 2026) | the words drafted in LORE.md by job 2; put in and re-timed in job 8 (slice 1a); the new video in job 13 |
| The world map becomes the in-game Chart | "Yes make the map our in-game Chart" | job 4 (the M1 plan, with the Chart) |
| Wick balancing in the sim | "each one has a powerful unique passive ability" | job 7 |
| Slice 1a build (three slots on the built fish, the opening, the Chart) | — | job 8, the start of M1 |
| Finish the Mossmere and the home base first (M1) | "What do we need to do to get map 1 and the home base fully 100% finished and playable" · "Yes" (15 November 2026) | jobs 4 and 8–13 |
