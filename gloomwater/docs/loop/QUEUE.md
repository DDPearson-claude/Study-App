# Work queue (the lead's running list)

The user asked on 14 November 2026: "Let's pause and focus on one task at a time." Then: "Just choose the next job and run continuously until all queued work is complete." One job runs at a time; the lead picks the order below and starts each the moment the one before is merged, without stopping to ask.

## The order (the lead's choice, re-ordered by the user's word of 15 November 2026)

The user, 15 November 2026: "Once this visual job has ran, focus on all code based jobs first as they're much faster". So once the catch show is merged, every code, data, sim and design job runs before the two jobs that must render the 3D game in software to be judged (jobs 8 and 9). A code job keeps its browser runs to the regression it needs; no look-and-fix art rounds unless the job is about how something looks.

1. ~~The catch show~~ *(DONE 15 November: merged at 32c7133 with the cut scene; the preview updated; the film with its sound sent)*
2. The world map and the story (resume `wf_83a11939-9e7`): LORE.md, WORLD.md, the continent map (a 2D generator and page, not a game render); publish the map; answer the user's questions.
3. The Chart-integration plan: the world map as the in-game Chart (SPEC §5.4, §13, PLAN's Chart lane, the three seals, the tutorial's last beat on the map, the SPEC pointers).
4. The three keys (resume `wf_1c95633f-092`).
5. The Wicks' passives, design (resume `wf_91d42619-6b9`).
6. The Wicks' balancing in the sim.
7. Slice 1a, built (its PLAN, amended by 3–6), then the preview with the loop on.
8. *(visual)* The cut scene's line 3, rewritten from the story; re-timed, re-checked, a new video with sound.
9. *(visual)* The ramp is the land (resume `wf_f7bccff9-e78`).

## Running

- **The world map and the story** (job 2; resumes run `wf_83a11939-9e7` on `gw-loop-world`).

## Backlog for slice 1a (found on the catch show's merge; small, code only; lane B unless named)

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
| Rewrite the cut scene's line 3 ("Its last candles fish to stay lit.") so it fits the new loop and points toward the journey | "Yes, rewrite line 3 once the story's done" (14 November 2026) | job 8: after the code jobs (the user's word of 15 November); the words can be drafted with the story |
| The world map becomes the in-game Chart | "Yes make the map our in-game Chart" | a Chart-integration plan after the world map job, before slice 1a is built |
| Wick balancing in the sim | "each one has a powerful unique passive ability" | job 6, after the three keys and the passives |
| Slice 1a build (three slots on the built fish, the opening, the Chart) | — | after the above are merged |
