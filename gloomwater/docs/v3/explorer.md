# GLOOMWATER pivot: the Explorer & World Wonder lens

*Panel proposal, lens 3 of 4. Answers request 5: "finding cool locations with interesting fish species and big sizes". Builds on DESIGN §19 (art), the §24 v2 draft (raft / raft+walk / foot lakes, 21 places, Waylamps) and the slate palette now merged in the palette worktree. Nothing in the repo was edited.*

---

## 0. The proposal in six lines

1. **The world is already prettier than the game shows.** The first and cheapest fix is framing: a lower day camera, no combat readouts on the day screen, and something alive on the water near the raft.
2. **Keep the hand-authored lakes** (§24 decision 3). Variety comes from *conditions*: time of day × cavern weather × the Astir place × rumours. A place you know becomes a different place in Moonmist.
3. **Each lake gets 6–8 Places, 1–2 secrets, 2 Vistas and one signature "wow" happening.** The Mossmere gets 6 raft Places. §24 leaves it with only the Bell Pool, yet the first two hours of play happen there.
4. **The discovery chain:** Signs (glints, sounds, fish signs) → Rumours → the Chart → the Place → your record **inked into the world** on a Tally Post at that Place.
5. **Metroidvania-lite across runs:** four **Found Relics** (tools found in secrets, never bought) stay with you for good. Each one opens paths in its own lake *and in the earlier lakes*. The last one, the Deep Line, reopens every legend pool for giant-class fish after the first win.
6. **The Gloomtide becomes a bioluminescent event.** The water glows wherever it is disturbed, night-only Places open, and night species show as moving lights under the water. Fighting is the extra layer for players who leave combat on.

**Where I agree and disagree with the guiding hypotheses.** I agree with all six. Two refinements:
- **Combat:** a mode toggle is fine, but the world should also offer a skip. Spending the night at a lit Waylamp or the moored raft lets you **keep vigil**: the swarm stays at bay and you fish the lamp's water through a calm, glowing night. Preparing the map becomes a way out of the fight. This is the combat lens's call; my requirement is only that the night is worth looking at.
- **Maps:** I argue against procedural maps per run. Discovery only pays off if the knowledge persists, so the maps stay fixed and the conditions change.

I also want to reverse one §24 cut: the **chart screen** should come back. In a game about finding places, the filled-in map *is* the collection.

---

## 1. What the screenshots say (and the cheap fix)

In `palette-final/iter2/p02–p05` and `showcase/s02–s05`, the horizon sits in the top 12–15% of the frame. Another 65–70% is flat dark water plus the dashed lantern-aura ring, a combat readout that stays on screen all day. The hero set pieces (Sunken Gate, Mother Cap, Orrery, Two Who Kneel) stand 90–140 m north, mostly lost in fog. The title shot (`s01`, elevation 15°) shows the arcades and the light shaft, and it is lovely. The world exists; the camera hides it.

| change | now (render `MODES`) | proposed | why |
|---|---|---|---|
| `sail` (calm) | elev 32°, dist 16.5, aimY 0.6, fov 50 | elev **24°**, dist 15, aimY **1.4**, fov 52 | horizon moves to ≈ 30% from the top; the hero and the parallax rings get ≈ 2.5× more screen |
| `fish` | 34° / 14 | 28° / 13 | the reticle and bobber stay readable; the landmark stays in shot |
| `walk` (§24) | 40° / 12.5 | 34° / 12.5 | same reasoning on foot; keep §24's occlusion cone |
| **`vista`** (new) | — | elev 9°, dist 19, aimY 3.5, fov 56, 3.5 s; input is never locked for more than 1.2 s | Vistas, first discoveries |
| **`trophy`** (new) | — | elev 12°, dist 6.5, yaw toward `place.landmark` | landing a fish of class L or bigger frames the fish against the Place's landmark |
| aura ring | always drawn | hidden in calm and dawn; fades in through dusk; always on in combat | takes the combat UI off the day screen |
| near water | empty | fish signs, floaters, clear-water windows (§6) | there is always something to look at within 15 m |

Rule: every lake gets **one landmark inside the lake** (the Toppled Bridge, the Cap Reef, the Monoliths, the Spine), not only beyond the shore. That way silhouettes cross the water at mid-distance and show in the water's cliff reflection.

---

## 2. The explorer's loop

**Sense → Follow → Find → Read the water → Hook → Land & measure → Record → Open the next path.**

*A day-2 example in the Mossmere:* the dawn banner reads *"Drip-rain over the Mossmere."* Yesterday Old Murk said: *"When the ceiling weeps, the stone hands overflow, and something waits for what spills."* You sail past the Toppled Bridge. A Grey Stilt lifts off and flaps toward the east, so you follow it. A **boil** (a dark back the width of the raft) breaks beside the giant **Cupped Hands**. The bowl overflows every 25 s, spilling fry; you time a cast into the spill and land a 4.6 kg Weeping Carp. The `trophy` camera frames it against the stone thumbs, and the Tally Post on the wrist now reads *Weeping Carp 4.6 kg*. The rumour is stamped "solved", and the Chart inks the eastern shallows you sailed through.

---

## 3. Lake identities

Palette rule: no lake reads green. Green and teal appear only as **verdigris on old bronze** (≤ 2% of chromatic weight, checked by the existing hue report). The Mossmere and the Glasswater are both "blue", so they are separated by **saturation and value**: the Mossmere is low-saturation pewter with rust, the Glasswater is saturated, deep sapphire.

| | **The Mossmere** | **Sporewood Pools** | **Glasswater Vault** | **The Pallid Deep** |
|---|---|---|---|---|
| chapter of the Fall | *The gate and the town*: the night the lantern fell, the town ran for the gate and the water followed | *The gardens*: the gardeners kept everything growing after the sun went out | *The keepers of light*: the kingdom bottled its light and shelved it here | *The farewells*: where the kingdom sent its dead, and finally itself |
| mood | hushed, silver, dripping | warm, drowsy, overgrown | crisp, echoing, exact | vast, still, reverent |
| dominant / glow / accent | pewter-slate water #232b3a / moon-silver #a9b9f0 / lavender #c4b8ec; warm counterpoint **rust iron #8a4b3a** (chains, bells, buoys); verdigris only on the cracked bell | plum #2a1a2e / amber #ffb46a / rose #ff7fb0; rare cream-white mycelium | indigo #141b46 / sapphire #5cbcff / violet #b48cff; a **full spectrum appears only during the Alignment** | near-black #14130f / ember-gold #e8c66a / bone #eae4d3; one oxblood ribbon colour |
| navigation landmarks (seen from anywhere) | Sunken Gate + Leaning Bell Tower (N), the **Moon-Eye** ceiling fissure and its silver shaft (NW, over the Sisters), the **Weeping Curtain** waterfall (E cliff), the Toppled Bridge (W) | Mother Cap (NE), Hyphae Bridge (N), the 14 m Bellcap (SE), Lanternstalks (SW) | Prism Orrery (centre, high), Stilled Cascade (NW), Bell Chapel (E), Ledger Stair (SW) | the Two Who Kneel (N), Old Ribcage (ceiling), Long Pier of Names (E), Sunken Belfry (NE) |
| light sources | Moon-Eye shaft; bell-snail dots on piers; dead rust buoy-lamps that relight at dusk | glow pools under caps, lanternstalk bulbs, the Greenhouse's "remembered sun" (the game's only warm daylight) | the Orrery's heart crystal, refracted triple shafts, shelves of bottled-light vials | the gold crack-light, memorial candles, Breathing Deep domes |
| silhouettes | round arches, a tower leaning 12°, arcades bearded with **silver lichen** (not moss green) | tiered caps, curled fronds, trellises | needle spires, pointed arches, the fallen chandelier | veiled giants, ribs, chains running into the water |
| Vistas (2) | *The Gate's Shadow* (sail under the arch); *Under the Moon-Eye* (only during Moonfall) | *Veil Anchor* (Hyphae Bridge, y 6, facing the Mother Cap); *Gill Crown* | *Bell-Chapel Window* (y 7); *North Terrace* | *The Joined Hands* (y 6); *Belfry Parapet* |
| **signature wow** | **Moonfall** | **The Bloom** | **The Alignment** | **The Candle Tide** |
| weather (+ one event per descent) | Drip-rain, Moonmist · *Highwater* | Spore-fall, Damp Hush | Resonance, Lightfall | Ash-fall · *The Low Breath* |
| ambient life | water striders, drift-moths, bell-snails, **the Grey Stilt** | cap-crabs, spore-bats, bobbing puffballs | page-moths, glass snails with light trails | candle-flies, bone-crabs, paper boats |
| night (Glowtide) | silver plankton in every wake; drowned harbour lamps glow *under* the water | falling spores glow on the water like embers on ink | crystals go dark far to near; prism plankton; chimes | the Candle Tide gathers around the Well; gold motes rise |
| sound beacon | drip-plinks, a far bell, wind in the gate | wooden chimes, the harp's music-box | glass harmonics, page rustle | a deep breathing hum, a distant toll |

### How each wow moment is built cheaply

| wow | what the player sees | build (phone-safe) |
|---|---|---|
| **Moonfall** (Mossmere, twice per calm at 25% and 70%, 20 s; 30 s in Moonmist) | the Moon-Eye shaft swings onto the Sisters' channel, and the water there turns **glass-clear**: drowned roofs, a fountain, the Bell Pool's temple bell and circling fish | water shader: `uClear[2]` (x, z, r, k) discs blend toward a **256² canvas "floor painting"** per lake (streets, roofs, bell), sampled at world xz with view-ray parallax × depth. Fish use the existing circling silhouettes, drawn under. **0 draw calls**, one texture sample inside the disc. The shaft is the existing additive quad. |
| **The Bloom** (Sporewood, at dusk) | the Mother Cap's gills light from stem to crown in 6 s, then amber spores fall and hundreds of fish rise on the surface | emissive uniform `uBloomK` swept by vertex y (0 calls); the existing spore system flips to falling ×2; rises go through `water.addRipple` at 6 per second; one instanced surface-glint mesh of 200 quads (1 call) |
| **The Alignment** (Glasswater, every 90 s of calm, 15 s) | the Orrery ring locks onto the main shaft and the beam splits into a **7-band spectrum fan** that sweeps the moat; the brightest band is the Burning Glass place | 3 additive quads with a canvas spectrum gradient, merged (1 call); the Orrery's rotation is already animated; the bands write into `uClear` at k 0.3 so fish show in the light |
| **The Candle Tide** (Pallid, from dusk) | 600 memorial candle-rafts push off the bone terraces, drift on slow currents and gather around the Well in the Gloomtide | one InstancedMesh (raft and wick merged, 600 high / 200 low), path = f(seed, time) in the vertex shader, flicker in the fragment shader (1 call); the victory "every candle lights gold" reuses the same uniform |

---

## 4. Places: the unique fishing locations

**Rule kit additions** (on top of §24.7's 10 rules):
- **`sight`:** fish are *visible* (in clear water, under pads, asleep). Each one has a species and weight rolled in advance and drawn at its true scale. Landing within 1.2 m of a fish means that fish bites. This is how big sizes become something you can *see and choose*.
- **`drift`:** the bobber drifts along a current lane at 1.5 m/s. Each seam it crosses adds +0.08 rarity, and bites are rolled while it drifts.
- **`cond.weather`:** a rule or place-kept species is live only in a given weather.
- **`resident`:** each Place has one trophy-class individual (top 3% weight). It shows itself now and then (a boil, a pass, a leap), and landing it is a Place record.

### The Mossmere (raft only), 6 Places + 2 secrets (new)

| # | place | where (x, z) | why it's cool | fish & sizes | twist (rule) | access |
|---|---|---|---|---|---|---|
| a | **The Bell Pool** *(legend)* | (−4, −14) | a drowned temple bell lies 9 m down, revealed in Moonfall with the Matriarch circling it | Weeping Carp ×2, Reedjaw ×1.5; Belled Matriarch | legend rule unchanged; her silhouette in Moonfall is drawn at **today's rolled weight** (12–30 kg), so you can see how big she is today | day 1 |
| b | **Under the Span** | the Toppled Bridge's 3 arch gaps (−36.5, −2.5), (−29.5, 0.5), (−22.5, 3.5) | chains hang from the break; fish hold in the arches' shade | Mossback ×2, Reedjaw ×2 | `targets` lock at 1.6 m; **threading an arch** with a Clean Cast gives rarity +0.2 and weightBias +0.3 | day 1 |
| c | **The Cupped Hands** | (16, 18), stone hands 6 m tall | a giant's hands hold a bowl that fills with ceiling drip; when it overflows, fry spill out and the big fish wait below | Dusk Minnow ×3 (in the bowl); Weeping Carp ×2, Reedjaw (below) | `rhythm` (period 25 s in Drip-rain, 60 s otherwise; 6 s live): wait ×0.5, weightBias +0.4 | day 1 |
| d | **The Sunken Street** | between the Sisters (−24, −29) r 5 | the old high street lies 3 m down: roofs, a fountain, a lamp-post | Candlefin Koi ×2, Weeping Carp ×1.5 | `sight` during Moonfall: 3–5 visible fish; cast to the one you want | day 1 (when Moonfall comes) |
| e | **The Sluice Run** | lane (0, −44) → (0, −31) | water pours through the Moss Sluice's broken teeth; a lane of white seams | Reedjaw ×2, Gloam Eel ×2 at dusk | `drift` 12 m; reverses during Highwater | day 1; the lane stills once the gate opens |
| f | **The Lily Maze** | lee of Mossbell Isle (−38, 22) r 8 | a choke of notched pads with koi glowing under them like lanterns under snow | Candlefin ×3, **Lilyshade Carp** (place-kept, suggested) | `sight`: the size of the glow is the size of the fish | **Reed Pole** |
| S1 | **The Moon Cistern** *(secret)* | behind the Weeping Curtain, E cliff (58, 4) | you sail straight through a waterfall that looks like rock into a round cistern lit by its own moonbeam | **Moon-Eyed Koi** (kept, suggested); Reedjaw residents | bites only inside a beam that wanders at 0.3 m/s | no tool: a bubble trail, Murk's rumour and the dock at (49, 6) all point here. **Reward: Reed Pole** |
| S2 | **The Drowned Arcade** *(secret)* | W shore (−54, −14) | a colonnade's flooded aisle; a root curtain hides the back chapel | Gloam Eel in calm (`gloomInCalm`) | `deed`: burn the curtain open for good; inside, rarity +0.25 | **Seedlight Glass**, or Highwater (backtrack) |

### Sporewood Pools: verdicts on the 6 §24 places + 1 secret

| place | verdict | the upgrade, in one line |
|---|---|---|
| The Grove Well *(legend)* | keep | make Root Breath *visible*: the nave's arches tighten, and on the exhale spores rain down with a ring of rises; Velvet Ray weightBias +0.3 on the exhale |
| The Lullaby Pool | **upgrade** | becomes `sight`: sleepers float visibly under a lily-cap canopy, mouths open; a **soft cast** (charge < 0.5 lands quietly) beside the one you want; big sleepers are rare and obvious |
| The Puffball Vent | keep | the geyser becomes a 6 m amber plume worth watching; it fires twice as often in Spore-fall |
| The Drowned Greenhouse | keep | the Lit Row is "remembered sun", the game's only warm daylight shaft; in Damp Hush the glass fogs and every row glows dimly |
| The Gill Harp | keep | the curtains' music-box notes carry 25 m: a sound beacon |
| The Spore Shrine | keep | Three Lanterns is already a tour of every island |
| **The Seed Vault** *(secret)* | new | through the **Rootmat Shallows** west of the Gillback (needs the Reed Pole): a cistern lined with rows of glowing seed-pods; **Sproutback Carp** (kept, suggested). **Reward: Seedlight Glass** |

### Glasswater Vault: verdicts on the 8 §24 places + 1 secret

| place | verdict | the upgrade, in one line |
|---|---|---|
| The Fallen Chandelier *(legend)* | keep | the Alignment's fan ends on it; Lit Arms plus the beam set the stage for the Sovereign |
| The Mirror Pool | keep | the ceiling silhouettes now show their **true size**: pick the biggest reflection |
| The Bell-Chapel Window | keep, **becomes a Vista** | the lake's main overlook and High Cast perch |
| The Well of Ledgers | keep | its ledger lines join the Remnant lore |
| The Stilled Cascade | **upgrade** | in Resonance the frozen falls thaw for 40 s and fish pour down with the water: wait ×0.4, weightBias +0.3; the Rainglass Darter bites only then |
| The Broken Hymnal | keep | its chimes are the wing's sound beacon |
| The Burning Glass | **upgrade** | folded into the Alignment as the fan's brightest band; Lightfall adds a second lens |
| The Font Ring | **upgrade → The Wishing Font** | coins glint on its clear bottom; toss 1 Shell and your next cast here is Fine or better; still the quick food tap |
| **The Unlit Stacks** *(secret)* | new | under the Ledger Stair, a door written in light-ink that only the **Seedlight Glass** shows; flooded aisles between black shelves; **Inkwrit Eel** (kept, suggested; letters glow along its flank in your light). **Reward: Tuning Fork** |

### The Pallid Deep: verdicts on the 7 §24 places + 1 secret

| place | verdict | the upgrade, in one line |
|---|---|---|
| The Well *(legend)* | keep | the Candle Tide circles it at night; Underdepth giants after the first win (Deep Line) |
| The Long Pier of Names | keep | in the Candle Tide, drifters come 3× as often at night |
| The Drowned Almshouse | keep | its five rooms are five Remnants: one household's story |
| The Chain Garden | **upgrade** | at the Turn a ≥ 12 m shadow passes under the plinth (the lake's Resident); casting at the chains during the pass gives weightBias +0.8 |
| The Sunken Belfry | keep | strike its note with the Tuning Fork and the secret opens |
| The Bier Barge | keep | — |
| The Empty Ferry Slip | keep | the boat that isn't there is drawn as a faint additive outline at dusk |
| The Breathing Deep | keep | 1.5× as many domes in Ash-fall |
| **The Lantern Hold** *(secret)* | new | the Tuning Fork's note lifts the Belfry 2 m on its chains and uncovers a bell-cellar pool ringed with lit lanterns; **The Lantern-Swallower** (kept, suggested: an angler carrying a stolen ember). **Reward: Deep Line** |

**Totals:** 27 Places (6 / 6 / 8 / 7) + 5 secrets + 8 Vistas. Place-kept species: §24's 8 plus 6 suggested here, so the Journal grows to 46 (final names are the species lens's call).

---

## 5. Found Relics: metroidvania-lite across runs

Found Relics are a new Relic category: shown at the Shrine as owned and never bought. Each one opens something in *every* lake, so later runs send you back to earlier lakes with new eyes.

| Found Relic | found in | opens in its own lake | opens in other lakes | also |
|---|---|---|---|---|
| **Reed Pole** | Moon Cistern (Mossmere) | the Lily Maze | the Rootmat Shallows → Seed Vault (Sporewood) | the raft pushes through reed and lily mats at 0.5× speed |
| **Seedlight Glass** (chimney glass grown from a seed-pod) | Seed Vault (Sporewood) | Spore Shrine strands show the route to each lantern | Drowned Arcade (Mossmere); the light-ink door → Unlit Stacks (Glasswater) | your lantern shows glints and Remnants from +2 m further away |
| **Tuning Fork** | Unlit Stacks (Glasswater) | the Bridge of Names grows instantly; Resonance on demand once a day | Belfry → Lantern Hold (Pallid); strike it at the Bell Pool to call one extra Moonfall a day (Mossmere) | — |
| **Deep Line** (weighted plumb line) | Lantern Hold (Pallid) | the **Underdepth** in the Well | the Underdepth in the Bell Pool, Grove Well and Chandelier trench: giant size class (max weight ×1.5, weightBias +0.8), one Underdepth cast per pool per day | the post-game: go back to every lake for giants |

---

## 6. Discovery mechanics

### 6.1 Signs that lead you on

| sign | what it means | range | build |
|---|---|---|---|
| rises (dimples) | small fish feeding | 20 m | existing `addRipple` |
| **boil** | a big fish turning; the boil's size shows its weight class (S / M / L / Trophy) | 35 m | dark ellipse decal + 2 ripples + a low "glunk" (pooled, 1 call) |
| leaper | a fish clears the water; its silhouette shows shape and size | 45 m | pooled fish model, 0.6 s arc + `water.splash` |
| bait-ball | about 40 silver fry flicker while predators slash | 40 m | 1 InstancedMesh |
| moth column | feeding spot (existing §5.7) | lake-wide | existing |
| bubble trail | a line of bubbles leading to something hidden (a secret or a Remnant) | 15 m | ripple chain |
| **Grey Stilt** | a long-legged wader standing where fish shoal; when you approach it flies to the next shoal or Place | 50 m silhouette | 1 procedural mesh, sine-driven legs (2 calls) |
| sound beacon | each Place's audio signature (harp, chime, toll, plink), panned | 25–30 m | audio-sfx loop per Place, ≤ 2 live |
| glint | a Remnant or a secret door catches your lantern light | light radius (+2 m with Seedlight Glass) | shared `uLantern` uniform in toon materials → emissive mask (0 calls) |

### 6.2 Rumours
- **Sources:** Old Murk (one per visit when you sell at least one fish; he prefers undiscovered Places and unsolved conditions; about 10 per lake), Remnants (24, one each) and the Well of Ledgers' lines. About 40 rumours in all.
- **Form:** a riddle line, a "?" sketch on the Chart (r 12 m around the target) and a condition glyph (moon, rain, mist, spores, chime, ash, night).
- **Examples:** *"The toy boats all drift to the weeping wall."* (Moon Cistern) · *"Strike the hour and the water remembers."* (Bell-Chapel) · *"Under the pads the koi keep lanterns, but you need a pole to reach them."* (Lily Maze, Reed Pole).
- **Solving one** (the species, Place and condition it names): +3 Memories and a stamp on its Journal page. You can **pin** one rumour at a time, which gives it an edge marker.

### 6.3 The Chart (reinstated from §24.14's cuts)
- One hand-inked map per lake on a 512² canvas, drawn from the arena data and `walkGridFor` (the same pure function `tools/walkmap.mjs` uses), in the toon ink style.
- **Fog of war:** a 64×64 bit mask per lake (512 bytes) in `meta`. The map inks everything within 18 m of where the Wick has been, plus everything in line of sight up to 60 m from a Vista. It persists across runs.
- **It shows:** Place vignettes, rumour "?" marks, your biggest fish per Place, weather glyphs, and Found Relic gates as dotted lines with the relic's icon ("you'll need something here"). The completion % per lake is a meta goal.
- **No HUD minimap.** The world is the map. Edge markers appear only for the Astir Place and your pinned rumour.

### 6.4 The discovery moment, Vistas and Tally Posts
- **First discovery** (coming within 8 m or casting in): the camera eases toward the Place for 1.2 s (input stays live), an ink title card appears (*"The Cupped Hands"*) with a one-line vignette, the sound beacon swells and the Chart stamps it. Later visits get no fanfare.
- **Vista:** the Wick sits and sketches (`vista` camera, 3.5 s). The Chart inks everything in line of sight, undiscovered Places in view become "?", and today's weather and Astir show at a glance. +1 Memory the first time.
- **Tally Posts:** every Place has a lake-styled marker: flood-gauge stones (Mossmere), notched cap stems (Sporewood), brass rulers (Glasswater), bone tablets (Pallid). Your personal best at that Place is inked on it (species glyph and kg) and persists across runs. *The world remembers your fish.* Each is a 128×64 canvas, built on approach, at most 2 live.
- **The catch card** paints the fish (ui-fishart) over a silhouette strip of the Place's landmark, so every record looks like a postcard of where you caught it.

### 6.5 Environmental storytelling: Remnants
Six glinting objects per lake (24 in all). Each gives a one-line vignette and a rumour (+1 Memory).

| lake | Remnants | the story they tell |
|---|---|---|
| Mossmere | toy boat with a wax sail · ferry toll board · flood-gauge post with years carved · guard's lantern-hook · market awning "EELS, FRESH, ASK FOR TAMSIN" · a child's drawing in a bottle | a town that ran for the gate |
| Sporewood | watering can grown through with caps · head gardener's seed ledger · trellis swing · greenhouse thermometer stuck at "warm" · garden bell · a letter pressed in a gill | love kept tending after hope |
| Glasswater | a vial of bottled light with a date · a librarian's spectacles · index card "LIGHT, KEEPING OF: see LANTERN" · an orrery key · an overdue slip · a pinned page-moth | keepers who could not let go |
| Pallid | a paper boat with a name · a lantern with no wick · a holed coin · a cradle-bell · a list of candles owed · tiny shoes on a bone raft | the last farewells |

---

## 7. Dynamic states

### 7.1 Cavern weather
Each calm rolls one weather per lake (seeded by run, day and lake): **Clear 50% · A 30% · B 20%.** The dawn banner names today's weather and Murk names tomorrow's (*"The ceiling's sweating. Rain tomorrow."*), so you can plan. **The water plane never moves** (§24 decision 2): a "rise" or "fall" moves props and collision and paints a wet band in vertex colour.

| lake | weather | look (build) | what changes |
|---|---|---|---|
| Mossmere | **Drip-rain** | 300 streaks in one InstancedMesh animated in the vertex shader (120 on low) + 4 ripples/s | Cupped Hands rhythm drops to 25 s; commons rise (wait ×0.85); Candlefin rarity +0.1 |
| | **Moonmist** | +3 low mist cards, fog ×1.4 lifted toward silver | silhouettes stand out; sound beacon range ×1.5; Moonfall lasts 30 s; Gloam Eel bites in calm |
| | ***Highwater*** (once per descent, day 3–5, forecast) | props and islands sink 0.6 m; collision rings shrink | the Arcade aisle opens without the relic; the Sluice Run reverses; lake-wide weightBias +0.2 |
| Sporewood | **Spore-fall** | spores ×2, falling; 200 surface glints | Puffball Vent ×2; shallow species weightBias +0.2 |
| | **Damp Hush** | swell amplitude ×0.2, sharp mirror reflections | `sight` range ×2 at the Lullaby Pool, but fish are shy (wait ×1.2) |
| Glasswater | **Resonance** | crystal emissive pulses in a chord (uniform) | the Stilled Cascade thaws; the Hymnal chimes every 2 s; Chime Jelly rarity +0.1 |
| | **Lightfall** | shafts ×1.5, slowly sweeping | a second Burning Glass lens; Mirror Pool hit radius +0.3 |
| Pallid | **Ash-fall** | ash motes ×2, fog ×1.3 | Breathing Deep ×1.5; Funeral Veil rarity +0.1 |
| | ***The Low Breath*** (once per descent) | props rise 0.8 m; a wet band on every walkway | the Sunken Span surfaces by itself; the Chain Garden turns every 15 s |

### 7.2 The Gloomtide as the Glowtide
The phase response stays as it is (§19.1: ambient ×0.45, tint #1c1838). On top of it:
1. **Water sparkle:** a noise term × (ripple + wake energy) × `uGlowtide` in the water shader. Wakes, rain rings, the bobber and a thrashing fish all light up (about 8 ALU, 0 calls).
2. **Night species show as light:** fish with a `glow` colour draw as a moving eye-pair plus a faint body glow under the water, so night fish signs are *lights*.
3. **Each lake's night life** (see the table in §3).
4. **On a quiet night** (combat off, or keeping vigil), gloomlings are only ink drifts far out, silhouettes against the glow. The combat lens decides the details.

**Night Places:** *The Lantern Wake* (Mossmere, new: rows of drowned harbour lamps glow under the west shore and Gloam Eels hunt along them; `targets` on the lamp rows), the Spore Shrine (Sporewood), the Fallen Chandelier and Broken Hymnal (Glasswater), and the Long Pier during the Candle Tide plus the Sunken Belfry (Pallid).

---

## 8. Ambient life

| lake | creature | behaviour | also serves as | build |
|---|---|---|---|---|
| Mossmere | water striders | skate in groups of 6–10 and scatter from the raft | rings show calm shallows | 1 InstancedMesh, CPU boids ≤ 40 |
| | drift-moths | circle lamps and the Wick | dusk cue | sprites |
| | **Grey Stilt** | wades where fish shoal and flies on ahead of you | guide (§6.1) | procedural mesh |
| Sporewood | cap-crabs | walk the cap rims and drop into the water when you near | marks the cap reef | instanced |
| | spore-bats | hang from caps and take off at dusk | dusk cue | instanced flap shader |
| Glasswater | page-moths | loose pages fluttering like moths | story | instanced quads |
| | glass snails | leave fading light trails on pillars | ink the path back to the hub | emissive trail decal |
| Pallid | candle-flies | gather at unlit candles | lead you to Remnants | sprites |
| | bone-crabs, paper boats | scuttle on the shore; drift | scale and loneliness | instanced |

---

## 9. Discovery pacing across runs

| point | Places found (of 27) | secrets | Found Relics | Chart % |
|---|---|---|---|---|
| run 1 (Mossmere, 25–35 min) | 3–4 | Moon Cistern ≈ 35% chance | 0–1 | 40% of Mossmere |
| run 3 (≈ 1.5 h) | 8–10 | 1 | Reed Pole | 25% overall |
| run 8 (≈ 5 h) | 16–18 | 2 | + Seedlight Glass (Arcade backtrack) | 50% |
| run 15 (≈ 12 h) | 23–25 | 3–4 | + Tuning Fork | 75% |
| first win / post-game (≈ 20–30 h) | 27 | 5 | + Deep Line → Underdepth giants | 100% |

**Memories added (one-time):** 6 new Places × (2 + 10) = 72; secrets 5 × 15 = 75; Vistas 8; Remnants 24; rumours 40 × 3 = 120; Chart 100% per lake 4 × 25 = 100; **≈ 400 in all.** The progression lens should balance the relic sinks against this.

---

## 10. Tech budget

| item | technique | draw calls | low tier |
|---|---|---|---|
| camera / aura ring | presets only | 0 | same |
| clear-water windows | `uClear[2]` + one 256² floor painting per lake | 0 | disc radius ×0.7 |
| Glowtide | water-shader term | 0 | on |
| weather | 1 instanced mesh + ≤ 3 mist cards | ≤ 4 | 120 streaks, 1 card |
| wow happenings | listed in §3 | 1 each, one lake at a time | Candle Tide 200 |
| ambient life | 1–2 instanced meshes + the Stilt | ≤ 4 | 50% counts |
| fish signs | pooled decals and sprites + existing ripples | ≤ 2 | same |
| Tally Posts, Remnants | small canvas sprites, ≤ 2 live; Remnants merged into world rings | ≤ 3 | same |
| new Place props (Mossmere ×6, secrets) | merged per lake into the existing ring geometry | +6–8 | small props dropped |
| lantern-revealed glints | shared toon uniform | 0 | on |

**Target:** world ≤ 46 draw calls on high (today 30–36) and ≤ 34 on low. No new PointLights (lamps keep using `water.setLights`, ≤ 6 in total). The exploration-default night spawns far fewer than the ≈ 106 calls of a 150-gloomling swarm, which more than pays for the Glowtide.

---

## 11. Changes to existing systems

| change | keep / modify / cut / new | module(s) | effort |
|---|---|---|---|
| day camera (`sail` / `fish` / `walk`) lower; new `vista` and `trophy` modes | modify / new | render | S |
| aura ring hidden in calm and dawn | modify | combat-fx / ui-hud | S |
| Mossmere: 6 Places + Moon Cistern + Drowned Arcade + Lantern Wake | new | data (places), world-art, world-layout | L |
| §24 places: keep 15, upgrade 6 (Lullaby, Stilled Cascade, Burning Glass, Font Ring, Chain Garden, Grove Well visuals) | keep / modify | data, fishing, world-fx | M |
| secrets in Sporewood / Glasswater / Pallid (Seed Vault, Unlit Stacks, Lantern Hold) | new | data, world-art | M |
| place rules `sight`, `drift`, `cond.weather`, `resident` | new | fishing, data | M |
| cavern weather (2 per lake + 2 events), forecast via banner and Murk | new | world-fx, data, ui, progression-market (lines) | M |
| clear-water windows + floor paintings | new | water-shader, world-paint | M |
| Glowtide water sparkle; night fish as light | new | water-shader, fishing-fx | S |
| four signature wow happenings | new | world-fx, world-art | L (M each) |
| fish signs: boils, leapers, bait-balls, bubble trails | new | fishing-fx | M |
| ambient life + Grey Stilt guide | new | actors / world-fx | M |
| rumours (Murk, Remnants, Ledgers), pin → edge marker | new | progression, ui, data `MERCHANT_LINES` / `TEXT` | M |
| Chart screen with a persistent fog mask (reverses a §24 cut) | new | ui-screens, progression (meta) | M |
| Remnants (24) | new | world, data `TEXT` | S |
| Vistas (8) | new | world, render, progression | S |
| Found Relics (4) as a found-only Relic category; gates in all lakes | new | progression, data `RELICS`, world | M |
| Underdepth (Deep Line): giant size class in the 4 legend pools | new | fishing, data | S |
| Tally Posts (Place records shown in the world) | new | world, progression (records) | S |
| catch card with a Place landmark backdrop | new | ui-fishart, ui | M |
| lantern-revealed glints (`uLantern` uniform) | new | toon.js | S |
| per-lake signature hue pairs; verdigris as the only green | modify | data `ZONES` (with the palette rework) | S |
| one in-lake landmark per lake; enlarged Cupped Hands | modify | world-art | M |
| Waylamps, Astir, discovery, mastery (§24.9) | keep | — | — |
| Journal Places page: vignette, record, rumour stamps | modify | ui-screens | M |
| feeding spots: in foot lakes they appear as fish signs near Places | modify | fishing | S |
| calm 180 s / Gloomtide 60–75 s in the exploration default (panel decision) | modify | survival, data | S |
| calm raids (day combat) off in the exploration default | modify | combat | S |
| §19 hero set pieces and gloom tells | keep | world-art | — |
