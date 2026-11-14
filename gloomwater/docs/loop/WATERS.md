# The Waters: the greening ramp and the rivers

*Binding with SPEC v7 (`docs/loop/SPEC.md` §5.2–§5.3). It answers the user's words of 14 November 2026: "I want the lakes to get progressively more and more lush and green. I also want some of the levels to be rivers similar to the rivers fishes in the [series]. As we unlock new lakes and rivers we need to slowly but progressively start getting more and more green and lush." Design only: no `src/` file changed with this document. Real places appear here as design notes only, like the roster's `inspiredBy`; nothing in this file's "modelled on" column, its section 4.1 or its section 9 ever ships.*

**The rule in one line.** The Mossmere keeps today's lavender night with green only as a trace. Every water you unlock after it is one visible step greener and lusher than the one before, slowly and steadily, until the last waters are deep green rainforest. The green arrives as **living things on surfaces** (moss, fern, reed, leaf, vine, root, weed), never as a colour laid over the air, the light or the frame. The violet-dusk sky, the lavender moon, the clear sharp air of Clear Night and the candle's one warm light are the same on every water.

**The journey.** The run goes from the kingdom's cold rim to its green heart. After the Pallid Deep the Wick sails out to the cold sound and the open sea, then up the rivers and into the warm drowned forest at the kingdom's centre. Six of the twelve new waters are rivers (slots 6, 8, 10, 12, 14 and 16). They alternate exactly with six stills (a sound, the open sea, a reef, a fen, a swamp and a lagoon), and the three lushest rivers come last.

**Why the order changed** (v6 → v7). In v6 the order ran fresh waters, then great rivers, then the sea and the far north last. That put the four waters with almost no land or plants (the Waxen Reef at 14, the Last Light at 15 with "no shore anywhere", and the Rime Sound at 16 with its sea ice) exactly where the user now wants the lushest green. Re-theming them into green places would have deleted their giants' homes: the Long Winter lives under the ice, the Lantern Hole is a hole in the ice, and the Jetsam Shark crosses the last of the light in open swell. So the cold and salt waters move early and the rainforest waters move late. Every fish keeps its home (ROSTER §3). Two waters whose looks banned green are rewritten (Lampmoss Slough's "green only as a trace on the pads" and the Inkwood's "Leaves are plum and dusk, never green"), and the others gain the green of their step.

**How to read it.** §1 is the ramp: one row per water. §2 says each water in the game's voice. §3 is how green is done and what never changes. §4 is the rivers. §5 is the vegetation kit and its cost. §6 is the gentle repaint of the built waters 2–4. §7 is how the ramp is measured and gated. §8 is the colour script. §9 lists the real looks behind the ramp (design notes).

---

## 1. The ramp

**Lushness step** runs 0 (the Mossmere) to 15 (the Inkwood), one step per water, so it rises strictly with unlock order. The engine reads it as `zone.lush = step / 15` (0 to 1). **Green share** is the target share of green (hue 65–160°) in the frame's chromatic weight (saturation × value, as `tools/hue-report.mjs` measures it), in per cent, averaged over three fixed capture poses per water (the spawn, the day water, the old water) at 960×540, for day, dusk and night. The measured share is binding; the instance counts are a starting point. **What grows** lists the kinds and the number of plant instances on high (low is 0.4×; §5). The colour cells are **day · dusk · night**: the sky at the horizon (the zenith is the shared violet sky), the fog, the water's own colour (never green: green on the water comes only from reflections, pads, weed and duckweed), the mid foliage tone (the shadow and lit tones follow §3.2), and the accent (flowers by day, the same under the rose dusk, fireflies or glow at night). The Mossmere's row is today's palette.

| # | water | kind | modelled on | step | green share | what grows | sky | fog | water colour | foliage | accent | landmark |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | The Mossmere | lake | still northern lake and loch | 0 | ≤ 1 · ≤ 1 · ≤ 1 | as built: dun-ochre reeds and 75 pads; violet lichen · 0 new | #7e81b4 · #9c7f9f · #2f2d65 | #3a3070 · #54407a · #1d193f | #2e2664 · #463a71 · #1d1c48 | #7a5e30 · #8a6a3c · #3a2f2d | #d6d6e4 · #e4c8d6 · #bab2ee | the Toppled Bridge and the Bell Pool |
| 2 | Sporewood Pools | lake | warm still forest pools | 1 | 3 · 3 · 2 | olive cushion moss on cap edges; curled ferns; bronze-olive pads · 142 | #8a78b4 · #a07c9f · #302a60 | #402258 · #593567 · #201334 | #2c1842 · #462e56 · #1c163a | #5e6440 · #78724b · #3f4a42 | #e090bc · #eeb0c8 · #e8ac4c | the cap reef and the Grove Well |
| 3 | Glasswater Vault | lake | cold clear lake below glacier rivers | 2 | 6 · 5 · 4 | cold moss on monolith tops; tree ferns in the broken arches; lichen beards · 252 | #7c86c0 · #9b81a3 · #272c68 | #172a7c · #3a3b83 · #0d1644 | #10226e · #2f377a · #101a4c | #3e5e4a · #5f6d53 · #3b4747 | #d2baff · #e0c4f0 · #a0aaf8 | the Monoliths and the Fallen Chandelier |
| 4 | The Pallid Deep | lake (deep) | the deep sea, as a black lake | 3 | 8 · 7 · 5 | pale sage moss on bone; ivy on four ribs; cedar spires; moonflowers · 367 | #8a82b0 · #a0809d · #2c2a5c | #2c2448 · #4a375b · #17142d | #1e183c · #3b2f51 · #161637 | #4a5c44 · #686b4f · #3d4644 | #e8e4f4 · #f0d8e0 · #9cc8a8 | the ribs and the Bottomless |
| 5 | The Rime Sound | sound (still) | fjord with sea ice at its head | 4 | 11 · 9 · 7 | black-green firs on the cliff shoulders; moss and lichen on stone; kelp under the ice hole · 608 | #8e8cb8 · #a284a0 · #2f3065 | #3a4070 · #544c7a · #1d203f | #22305a · #3e4269 · #182044 | #34503e · #57624a · #353f40 | #c8c4e8 · #e8c0d4 · #94c4a8 | the Lantern Hole in the ice |
| 6 | The Thin Water | river | wide braided sand river with floating islands | 5 | 14 · 12 · 8 | reed islands; floating meadows that drift; willow scrub on the old islands; marsh grass on the bars · 802 | #9a8ab8 · #a683a0 · #322f66 | #463a72 · #5e477b · #221e40 | #4a4278 · #5e5081 · #282750 | #4e6c3a · #6b7847 · #3b4f42 | #b8a0e8 · #d8b0d8 · #e0e49c | the broken royal weir |
| 7 | The Last Light | open sea | open ocean under a high green island | 6 | 16 · 14 · 10 | weed meadows on the Drift Line; turf, fern and one bent tree on the Lamp Rock; cloud forest on the far island · 997 | #a294b8 · #aa87a0 · #2e3067 | #34407a · #504c81 · #1a2043 | #1c2a6a · #3b3e76 · #151d4a | #52703c · #6e7b48 · #3c5143 | #d888a8 · #e8a8b8 · #a8d0bc | the lighthouse on its rock |
| 8 | Pyrefall Gorge | river | snowmelt gorge in the foothills | 7 | 19 · 16 · 11 | pines on the rim; hanging forest and bamboo on the walls; fern and moss in every spray crack; weed on the pool shelves · 1,213 | #a494b8 · #aa87a0 · #303066 | #3c3e76 · #564a7e · #1e1f42 | #545e7a · #676782 · #2d3351 | #3e5e34 · #5f6d42 · #36473f | #c87890 · #e0a0a8 · #e0e49c | the temple stairs and the floating pyres |
| 9 | The Waxen Reef | reef | coral reef, drop-off and wreck | 8 | 22 · 19 · 13 | palm and sea-grape keys on the roof ridges; vines down the spires; seagrass meadows under clear water · 1,412 | #ae9cb8 · #ae8aa0 · #2f3369 | #3a4a80 · #545486 · #1d2546 | #22466e · #415579 · #18294c | #3a6a3c · #5b7648 · #3b4e46 | #c070d0 · #dca0d0 · #e2e69a | the drowned spires and the wreck on the drop-off |
| 10 | The Thunder Stair | river | rapids and cataracts in spray forest | 9 | 24 · 20 · 14 | moss in sheets on the lock stones; fern banks; figs and palms over the pools; vines on the towers · 1,604 | #a898b8 · #ac88a0 · #313269 | #444680 · #5c5186 · #212346 | #4c4a62 · #615870 · #292b47 | #346a38 · #577645 · #394e46 | #d296ae · #e4aebc · #e6e0f4 | the broken lock stair and its two towers |
| 11 | Rushlight Fen | lake (fen) | papyrus delta above a dam | 10 | 27 · 23 · 16 | papyrus and reed walls with amber seed heads; palm and fig islands; lily meadows; sedge · 1,793 | #b0a0bc · #af8ba2 · #302f66 | #3c3a74 · #56477d · #1e1e41 | #4a5486 · #60608c · #282f56 | #4e7a3a · #6b8347 · #3f5647 | #b0a0e8 · #d8b0d8 · #e2e69a | the pale stone dam and its one lamp |
| 12 | The Salt Gate | river (tidal) | tidal river mouth with mangrove banks | 11 | 30 · 26 · 18 | mangroves on both banks; strangler figs over the quays; samphire and salt grass on the flats · 1,973 | #b49eb8 · #b18ba0 · #303166 | #3e4472 · #574f7b · #1f2240 | #46506a · #5d5d76 · #272d4a | #2f6a40 · #53764b · #394e48 | #c4a0d8 · #dcb0d0 · #e2e69a | the open sea-gate and the shipyard ribs |
| 13 | Lampmoss Slough | swamp | slow southern swamp, canal and lock | 12 | 32 · 27 · 19 | living swamp trees on flared knees; grey-green lamp-moss curtains; duckweed carpets; ferns and lilies · 2,148 | #b4a2ba · #b18ca1 · #2e2f62 | #363a62 · #51476f · #1b1e39 | #2a2c48 · #48415c · #1b1e3c | #3c6e36 · #5d7944 · #3b5045 | #e090bc · #eab0c8 · #e2e69a | the straight canal and the drowned lock |
| 14 | The Siltway | river | great brown lowland river with floating meadows | 13 | 35 · 30 · 21 | a forest wall in tiers; floating grass meadows; giant lilies; emergent trees · 2,324 | #b29cb6 · #b08a9f · #323065 | #484070 · #5f4c7a · #23203f | #5c5048 · #6e5d5b · #302d3c | #2e6a38 · #527645 · #394e47 | #f0e0ec · #f0c0d4 · #e4e898 | the Seam where the two waters run unmixed |
| 15 | Lanternroot Lagoon | lagoon | mangrove lagoon, creeks and flats | 14 | 37 · 31 · 22 | a mangrove forest on arched roots; palms; seagrass flats; blossom on the water · 2,496 | #bca4b8 · #b48da0 · #303165 | #3c4470 · #564f7a · #1e223f | #1e3444 · #3f4858 · #16213a | #2e7040 · #527b4b · #3c514b | #e48cbc · #eeb0c8 · #e4e898 | the stilt houses and their paper lanterns |
| 16 | The Inkwood | river (blackwater) | blackwater river through flooded rainforest | 15 | 40 · 34 · 24 | closed canopy; vines and hanging roots; ferns and epiphytes on every limb; moss on everything; leaves wider than the raft · 2,665 | #b4a0b4 · #b18b9f · #2f2c60 | #382c58 · #533d67 · #1c1734 | #241a22 · #43333d · #18162c | #367a40 · #58834b · #3f564d | #e48cbc · #f0b0c4 · #e4e898 | the drowned orchard and its lantern-gourds |

The green share by day climbs about 2.7 points a water, from a trace to 40%. Dusk holds 85% of the day's share (lit greens turn olive-bronze under the rose key, shadows blue-green) and night 60% (moonlit slate-greens with lavender rims, fireflies, glow-moss). The steps are even on purpose: every water is visibly greener than the one before when the two stand side by side, and no step is a jump.

**The four built waters gain a little green too** (§6). The Mossmere does not change at all.

---

## 2. The waters, in the game's voice

These are the looks the build paints and the roster keeps (ROSTER §3, `roster.json` `look`). Kinds of water, never real places.

**1. The Mossmere** (lake · step 0). As built: the starlit moat. Violet-dusk water under lavender mist, pale stone, the Toppled Bridge and the old harbour's bell, dun-ochre reeds and pads, candle-amber windows. Green only as a trace. This is the look the user approved, and it stays exactly as it is.

**2. Sporewood Pools** (lake · step 1). The ember garden, with its first moss. Olive cushion moss creeps round the edges of the cap reef and up the feet of the stalks; curled ferns open on the shore; a few bronze-olive pads float among the lily caps. The haze stays violet-magenta, the caps autumn-ochre, the spores gold. It reads as "a little moss", never as green.

**3. Glasswater Vault** (lake · step 2). Moss on the crystal. Cold green moss sits on the tops of the monoliths and the cliffs; tree ferns stand in the colonnade's broken arches; grey-green lichen hangs in beards from the chandelier chains. The sapphire water, the lilac crystal and the most starlight in the kingdom stay as they are. At night periwinkle glow-worm threads hang under the shelves.

**4. The Pallid Deep** (lake · step 3). The requiem garden. Moss has kept the vigil the candles could not: pale sage moss on the bone terraces and the cairns, ivy up four of the nine great ribs, dark cedar spires between the ruins of the funeral colonnade, moonflowers on the terraces that open at night, and pale jade glow-moss in the cracks after dark. The near-black water, the bone, the ink, the gold and the candles are unchanged.

**5. The Rime Sound** (sound · step 4). A drowned fjord between pale stone cliffs. The snow has gone from the cliff shoulders, and black-green firs stand there in ranks; moss and grey-green lichen grow on every ledge the spray can reach. Sea ice still lies across the head of the sound, with one fishing hole and a lantern beside it: amber on lavender snow, and olive kelp swaying in the black water under the hole. Frozen bell-buoys, a breath of mist, long nebula-pink ribbons in the sky. The water is black-violet and half a mile deep. At night pale glow-moss lights the cracks in the cliffs.

**6. The Thin Water** (river · step 5). Below a broken royal weir the river spreads wide and thin over pale sand: a hand deep over the bars, a pole deep in the channels between them, and always sliding. Islands of reed and floating meadow ride the current and catch on the bars. Willows grow on the old ones, and after dark one or two come loose and turn slowly past the raft, fireflies and all. By day the sand shows gold through the water, at dusk it holds the nebula pink, and by moonlight it is lavender, with rays lying on it like the shadows of moons. At the weir the whole river comes white over the sill under one amber sluice lamp, and something gold strikes in the foam.

**7. The Last Light** (open sea · step 6). Open sea. One lighthouse on a rock, the last lamp of the kingdom, its amber beam turning over a long violet swell under the whole star field. The rock wears a cap of turf and fern and one wind-bent tree. Where two currents meet lies the Drift Line: a floating meadow of olive and gold-green weed with wreckage caught in it, and things hunting under it. Far off a high green island stands in cloud, waterfalls white down its cliffs; there is no shore you can reach. At night the weed glows faintly where the swell turns it over.

**8. Pyrefall Gorge** (river · step 7). A cold river comes down out of the snow through a gorge of stone-white rock. Its water is milk-pale, clear to an arm's depth and then clouded with powdered stone, and it never stops talking. It pours over boulders and through one rapid after another, and between the rapids lie long still pools and beaches of pale sand. Temple stairs walk down into the water. On every step a floating pyre gutters candle amber, and ash drifts through the dusk. Green has taken the walls: dark pines on the rim, a hanging forest and stands of bamboo on the ledges, old terraces grown over with grass, and ferns and moss in every crack the spray can reach; the shelves of the pools are furred with weed. Something old turns in the pool below the last pyre, in the push of the current, and the ash above it circles the wrong way.

**9. The Waxen Reef** (reef · step 8). The roofs and spires of a drowned harbour town, grown over with pale coral like run candle wax. The ridges of the highest roofs stand above the water as small green keys of palm and sea-grape; vines hang down the spires; meadows of seagrass sway round the town in clear water, and the wax-coral roofs wear a fur of green algae. Sea fans in lavender and nebula pink. At night the polyps open as thousands of small amber flames below, and fireflies hang in the palms above. A wreck lies across the drop-off into violet dark.

**10. The Thunder Stair** (river · step 9). The kingdom's stair of locks is broken, and a great river falls down it. At the foot there is a broad calm reach, then the step pools, then the Throat, where the whole river squeezes through a gap no wider than the raft is long and comes out roaring into the Cauldron. The standing waves in the chutes stand still and never move on. Spray hangs over everything, and everything the spray touches is green: moss in sheets on the old lock stones, ferns in every crack, figs and palms leaning out over the pools, vines down the two lock towers whose amber signal lamps still burn. Heat lightning flickers in violet cloud, and it never rains. At night the spray turns silver, a pale moonbow stands in it, and the green walls drip.

**11. Rushlight Fen** (fen · step 10). A delta of bright channels above the kingdom's great dam: crystal water over white sand, between walls of green papyrus and reed whose seed heads still glow amber like rushlights. Islands of palm and fig stand in the channels; lilies open blue-violet in the still lanes. Pale birds by day, black lanes at dusk, and beyond them the pale stone dam with its one amber lamp and a black pool at its foot. At night fireflies drift over the reeds.

**12. The Salt Gate** (river, tidal · step 11). Here the river meets the sea at the kingdom's sea-gate, left open, and the two argue every evening. Through the day and the dusk the river runs out past the drowned sluices, brown and quick, and the mudflats come up shining. As night falls the whole reach stands still for one breath, then the tide turns and pushes back in. Mangroves crowd both banks on their stilts, roots slick and crowns a deep glossy green; strangler figs have the old quays; salt grass and samphire carpet the flats. A harbour stair goes down into the water, the stump of the harbour light still burns amber, and inside the gate a drowned shipyard keeps the ribs of unfinished hulls standing in rows. At the top of the reach, under a small fall, the water is sweet again. At night the mangroves fill with fireflies.

**13. Lampmoss Slough** (swamp · step 12). A drowned millstream that barely moves, under living swamp trees that stand on flared knees and wear long curtains of grey-green lamp-moss. Duckweed lies in soft yellow-green carpets in the still corners; ferns grow from every stump; nebula-pink lilies open on the pads. Violet-dusk water, lavender haze, fireflies caught in the moss like sparks. A straight stone canal, a broken weir, a drowned lock gate, and a log that is not a log.

**14. The Siltway** (river · step 13). The kingdom's barge road is a river so wide that the far bank is a green line. It is slow and heavy, the colour of candle tallow under violet dusk. Its banks are a wall of forest in tiers, standing knee-deep in the flood. In front of the forest float meadows of tall grass, whole fields rising and falling on the current, thick with giant lilies that are white at dusk and rose by night, and loud with frogs. Sandbars come and go. Sunk barges and pale stone mile-posts mark the channel, and one ferry under the water still has its lamp lit. Where the black river comes in from the forest, amber water runs beside ink water and will not mix, and the Long Hole goes down on the outside of the great bend.

**15. Lanternroot Lagoon** (lagoon · step 14). The drowned orchard has become a mangrove forest. It stands in brackish, glass-calm water on arched roots, its crowns a deep glossy green over palms and seagrass flats. Stilt houses hang paper lanterns low: candle amber on dusk water. Pale sand flats, ankle deep, go lavender under the stars, and blossom drifts nebula pink down the creeks. At night whole trees of fireflies flash together, over and over, like a slow heartbeat.

**16. The Inkwood** (river, blackwater · step 15). At the heart of the kingdom the forest drank its orchards whole. A black river, clear as tea when you hold it in a cup, winds slowly between trunks standing in water to their waists, and the canopy closes over it: green on green on green, leaves wider than the raft, curtains of vine and hanging root, ferns and pale flowers on every limb, moss on everything. The water is a mirror, so the forest is there twice. Lantern-gourds still ripen and drop in with a plop, and nebula-pink blossom turns on the surface. Narrow creeks slip away under the roots to hidden ponds where something big breathes, and sighs. At night the moon comes through in coins, fireflies hang in the green, and every leaf the lantern touches shines.

---

## 3. How green is done, and what never changes

### 3.1 Four channels: three carry green, one never does

| channel | carries green? | how |
|---|---|---|
| **Materials** (moss, foliage, floating meadows, weed beds) | yes, the main channel | new palette keys `leafDark / leaf / leafHi / moss2 / bloom`; the kit's moss recoloured; `colorRock`'s moss amount by step; the vegetation kit (§5) |
| **The mirror** (the planar reflection) | yes, for free | the water reflects the green banks; far grazing water still mirrors the violet sky, so the distance stays Starlit |
| **Night emitters** (glow-moss, fireflies, night-blooming flowers) | yes, small and dim | pale jade glow-moss, pale lime fireflies, white or lavender flowers that open at night; no point lights |
| **Air, light, sky, grade** (fog, ink, ambient, key light, nebula, lamp, glow, candle, grade tint) | **never** | they stay at hue ≥ 200° or near-grey on every water, so a green cast cannot happen by construction |

### 3.2 The rules

- **Constant on every water:** the clear sharp air of Clear Night (fog density stays in today's band, 0.0042–0.0072; humid waters are not foggier; spray only within 25 m of falls); the violet-dusk night sky (ink #0a0c19 → deep indigo #1d245d → violet dusk #433e74); the lavender moon #c4b8ff; the candle #ed9e3b as the one saturated warm light; original shapes; no ring or disc round the raft or the Wick.
- **Three value tiers on every green mass:** `leafDark`, `leaf`, `leafHi`. Early greens are few, muted olive and sage mixed with the old ochre; late greens are rich and varied, and from step 3 on yellow-green (65–100°), green (100–140°) and blue-green (140–195°) each carry at least 12% of the green.
- **Backlit leaves.** The key light stays upper-left behind the scene on every water, so foliage is mostly backlit. A leaf-translucency term adds `leafHi` × 0.3 at leaf edges facing the key, by day and dusk; at night the moon does the same in lavender. This is the strongest single lushness cue.
- **Aerial perspective is lavender:** green near, lavender far. Far greens blend to the fog with distance (ring 1 at 0.35, ring 2 at 0.6, rings 3+ as today), so the horizon is always Starlit.
- **Day, dusk and night.** By day: backlit leaves, moss on stone tops, the banks in the mirror. At dusk: the rose key turns lit greens olive-bronze (hue 60–90°) and shadows blue-green (140–170°); fireflies start at dusk k ≥ 0.5; glow-moss fades in from k 0.6; night flowers begin to open. At night: moonlit slate-greens (mean hue 120–175°, saturation 0.15–0.35, lit foliage luma ≥ 14/255), lavender rims, glow-moss, fireflies, night flowers; **never black**. The night key mixes toward the moon by 0.25 + 0.035 × step, so every night has the same lavender moon (the Mossmere's formula is unchanged at step 0).
- **Fireflies** are pale lime (#e0e49c to #e4e898, hue about 63°, saturation ≤ 0.4), carry no light, sit 0.4–4 m above banks and foliage, never over open water and never within 6 m of the raft, and are at most 0.6% of the frame height. They start at step 5 (the Thin Water); before that the built waters' own night glows (spores, glow-worm threads, glow-moss) do the twinkling. In the Lagoon whole trees flash together.
- **The candle stays the one warm light.** Lantern-gourds, paper lanterns, rushlights, pyres and polyp flames are `candle` pinpoints on wood and stone. Inside the lantern's pool, leaves go warm olive-gold, never yellow-neon (the pool's warm-drain rule extends to foliage).
- **Never neon, never teal UI.** Leaf keys: HSV saturation ≤ min(0.62, 0.25 + 0.04 × step), value ≤ 0.70. Glow-moss saturation ≤ 0.32. Duckweed and new leaves are soft yellow-green, never chartreuse. The water's own colour stays outside 65–195° (green on the water only from reflections, pads, duckweed film and weed beds). The UI is untouched.
- **Grade:** each water's `tint` stays violet (tintAmount ≤ 0.2) and `saturation` stays in 0.92–1.06; the grade never fakes lushness. The violet shadow split-tone keeps green shadows violet-green, the painter's violet shadow.

---

## 4. The rivers

### 4.1 The kinds of river the series fished (design notes only, never in the game)

The researched episodes (`docs/loop/research/river-monsters-fish.json`, field `location`) fished about sixteen kinds of water. These are the river kinds, and the waters that borrow their shape and feel. The game never names a real river, country, episode, the series or its presenter.

| kind | where it was fished (docs only) | from a raft | current | used by |
|---|---|---|---|---|
| wide sandy braided river with floating-island marsh | the Paraná, the Uruguay below its dam, the Iberá marshes, a Bolivian river below an old dam | wide thin water over pale sand, bars and islands, floating mats with shrubs on them that drift and block channels, white water at a weir | a steady sheet, fast under the weir | **the Thin Water** (6) |
| snowmelt gorge in the foothills | the Kali, the Karnali, the Babai, a foothill reservoir | milky water clear to about 2 m, bedrock and boulders, rapids between deep pools, white sand beaches, temple stairs and pyres on the banks | fast runs, deep still pools | **Pyrefall Gorge** (8) |
| rapids and cataracts | the Congo rapids and confluence, the narrow falls of the Nile, a Rift Valley lake | standing waves, a narrow throat, a cauldron pool, spray, spray-fed green walls, then a placid reach | violent in the chutes, slack in the pools | **the Thunder Stair** (10) |
| tidal river mouth (estuary) | the Breede mouth, the Fitzroy and King Sound (tides over 11 m), the Brisbane river, the Mae Klong, a Fijian river mouth | brown-green tide water, mudflats that show and drown, mangrove banks, a bar at the mouth, a sweet upper reach | reverses with the tide | **the Salt Gate** (12) |
| great brown lowland river with floating meadows | the Amazon main stem at Manaus, Óbidos and Leticia, the meeting of the waters, the Essequibo | milky tallow-brown water, a far green bank, forest standing in the flood, floating grass meadows, sandbars, deep holes | slow and heavy | **the Siltway** (14) |
| blackwater river through flooded rainforest | Rio Negro forest lakes, Guyana's hidden ponds, Suriname creeks, a Bolivian oxbow | a tea-black mirror, trunks in the water, closed canopy, hanging roots, narrow creeks to hidden ponds | slow, a little fall on the creeks | **the Inkwood** (16) |
| papyrus delta, gorge and dam lake | the Okavango, the Zambezi and its gorge, Kariba | crystal channels over white sand between papyrus, palm islands, a dam wall | gentle | Rushlight Fen (11), kept a still: a fen above the dam |
| warm slow southern river, canal and swamp | the Trinity, the Everglades canals, the Illinois, below an Ozark dam | muddy and still, swamp trees, canals and locks | barely moves | Lampmoss Slough (13), kept a still: a swamp |
| mangrove lagoon and brackish creek | Caribbean lagoons of Nicaragua, the Indian River Lagoon, a Solomon village lagoon, New Britain, Malaysia | glass-calm water, arched mangrove roots, flats, stilt houses | the tide's breath only | Lanternroot Lagoon (15), kept a lagoon |

The four built lakes already use the still northern lake, the warm still pools, the cold clear northern river (as a lake) and the deep sea. The reef, the open sea and the fjord stay stills. Real river shapes worth copying in our own forms: blackwater is tea-coloured, see-through and nearly sediment-free (clear to 60–120 cm), whitewater is milky and fertile (20–60 cm) and carries floating meadows; where they meet they run side by side unmixed for a long way (the Siltway's Seam). A meandering river has a sand point bar on the inside of each bend, a cut bank and a deep pool on the outside.

### 4.2 What a river level is

A river is a full 3D water: banks, bends, a current you can see, the raft on moving water. It is a new arena layout, `arena.layout: 'river'`, beside the four lake layouts (`bowl`, `twoBasins`, `ringTrench`, `drop`).

| item | rule |
|---|---|
| **shape** | An authored centreline (`arena.river.spine`, 6–10 Catmull-Rom points, upstream first) with a width along it (18–30 m typical; the Siltway up to 70 m, the Gorge's chutes 12 m). It runs **west to east across the screen**, its bends going up and down the frame, because the sail camera always looks north; no leg longer than 25 m runs toward the camera. The reach inside the arena (radius ≤ 85) is 190–300 m long, in one to three bends. The curvature radius is at least 1.5 × the half-width + 3 m. |
| **depth** | The meander rule: deep water on the **outside** of each bend (the crowns and old water sit there), a sand point bar on the **inside** (day water, bars), riffles and shallows on the straights. `calibrateDepth` and `depthShare` work unchanged. |
| **banks** | One terrain heightfield over the arena (2 m cells, about 11k triangles, one draw call, receives shadow, is mirrored); the opaque water plane hides it outside the channel. Banks are soft (mud, sand, pebble, reeds and overhangs), never a vertical face, except in a gorge. The old cliff ring becomes a low mossy bluff behind the canopy wall. |
| **one water level** | Every water has one level (y = 0, the planar mirror). Falls, cascades and rapid steps are set dressing (a scrolling card, a foam band), never a playable drop. |
| **the river field** | Built once at load on a 1 m grid (about 40 ms on desktop, 120–180 ms on a phone, 830 KB): per cell the signed distance to the bank, the distance along the river, the sideways offset, the flow and the depth. The layout answers `shoreDist`, `flowAt`, `sampleWater` and `river.pointAt/sAt`; lakes answer the same calls trivially, so fishing, casting and places never branch. `collide` pushes along the bank's gradient; `randomWaterPoint` picks a distance along the channel and an offset. |
| **ends** | Both ends are closed and hidden. Upstream is a fall, a weir or a rapid that cannot be climbed; downstream a bend into standing mist. Within 15 m of an end the raft's top speed eases to 40% (a soft wall), the last 30 m before each end is dead water, and 3–6 mist sheets stand there. The water plane visibly runs on into the mist. |

### 4.3 The current

| item | rule |
|---|---|
| **flow** | Along the centreline's tangent, fastest mid-channel (speed × (1 − (offset / half-width)²)), faster where the channel narrows. It flows round every rock and snag (tangent to every bank and stone). |
| **speeds** | Sailing lanes 0.2–1.2 m/s: at most 20% of the raft's base 6 m/s, so going upstream always works. White water (chutes, a weir sill, rapids) is a fenced no-sail strip edged with rocks and foam that the raft slides off softly. Places, docks, the spawn and the legend's pool are slack water (≤ 0.25 m/s). |
| **a current you can see** | A `GW_RIVER` water-shader variant (compiled only on river waters; lakes pay nothing): the chop scrolls along the river's own coordinates, foam lines run along the seams and banks (denser where faster), standing waves stand in the chutes, V-wakes trail every post and snag, and duckweed and weed film drift with the flow. About +40–60 instructions per water pixel on high and medium, +25 on low, no draw calls. Swell is halved on rivers. |
| **what drifts** | Two instanced meshes ride the current from the upstream mist to the downstream mist: each river's own leaves and petals and its own twigs and logs (60 + 20 on high, 30 + 10 on low). The Thin Water: seed fluff and loose floating islands. The Gorge: ash and silk-cotton fluff. The Stair: spray-wet leaves. The Salt Gate: weed and mangrove seedlings on the ebb. The Siltway: grass rafts and lily debris. The Inkwood: petals and dropped lantern-gourds. |
| **the tide** (the Salt Gate only) | The flow is a pure function of the evening clock: it ebbs seaward through the day (40 s) and the dusk (20 s), stands slack for about 5 s as night falls, then floods inland for the rest of the night (± 0.4–1.0 m/s). The level changes by at most 0.6 m, so the mudflats show at dusk and cover at night, and the docks always work. |

### 4.4 The raft on moving water

| state | what the current does |
|---|---|
| idle (no input for 1.5 s, no line out) | the raft drifts at half the local flow, at most 0.8 m/s, and turns slowly with it |
| paddling | adds a quarter of the flow: felt, never limiting |
| line out, a bite, a fish on, the measure, the card | **nothing**: the Wick drops a stone over the side (a plop and a ripple, no button, no words), so the anchor rule (< 0.3 m/s) and `lineBroken` work exactly as on a lake |
| arrival, Set Out and the sail home | nothing: the glide is scripted along the river and ignores the current |
| tap-to-sail or auto-sail (later) | commands the speed over the ground, so arrivals are on time |
| the float | stays where it landed, with a small V-wake showing the current (later: it may swing up to 1.5 m downstream, inside the 4 m line-break distance) |

### 4.5 Places along a river

A river has its four or five places 40–50 m apart along the channel, each 5–8 m across (a disc in a pool, an eddy or a seam, or a lane across the channel), each in slack water and at least 80% open water, measured along the channel. They come from the river's own forms: **a pool** (slack; crowns and old water), **an undercut bank** at an outer bend (deep, roots and canopy over it), **an eddy** behind a point or a rock, **a creek mouth**, **the tail-out below a rapid**, and **a ford or bar edge** (shallow; day water). Docks sit on the inner banks, on the point bars. The spawn is downstream, facing upstream, so the landmark (the weir, the pyres, the falls) is in view. An unowned place is a mist bank across the river's width that the raft sails through (SPEC §5.1 rule 6 unchanged).

### 4.6 No way to fail

Nothing can capsize, strand or carry off the raft. The flow is tangent to every bank and rock; no lane runs faster than 1.2 m/s; places, docks and the ends are slack; within 2.5 m of a bank a soft push turns the raft parallel to it (it slides, never bounces); and a raft that sits still for 2 s in flow over 0.3 m/s gets a gentle sideways nudge. **The validator proves it** for every river: the lane (the water shrunk by the raft's radius + 1 m) is one connected piece holding the spawn, every dock, every place and the legend's pool; every place is 80% open water; the flow limits hold; an idle raft dropped at 200 random lane points and left for 120 s never reaches an end and never sits against a bank in fast water for more than 3 s; and from 200 lane points at least 3 of 8 cast directions find open water 6 m out.

### 4.7 The six rivers

| river (slot) | subtype | reach · width | bends | current (lanes / white water) | upstream end | downstream end | places on the river's forms |
|---|---|---|---|---|---|---|---|
| **the Thin Water** (6) | braided | 260 m · 40–60 m, round 5 bars | 1 wide | 0.5–0.8 / the weir sill | the broken weir | braided channels thin into mist over sand | day on a bar edge (the Marsh Lanes) · old in the white water under the sill (the Broken Weir) · night at a ford (the Lamp Ford) · crown in the one deep pan on the outer bend (the Moonbed) |
| **Pyrefall Gorge** (8) | gorge | 220 m · 12–22 m between walls, pools wider | 2 tight | 0.8–1.2 in the runs, 0.1 in the pools / four rapids | a white cataract out of the snow (falls card) | the gorge closes in mist | day at the temple stairs (the Alms Steps) · old at a rapid's tongue (the Coin Run) · night in the slack behind boulders (the Boulder Garden) · crown in the pool below the last pyre (the Last Pyre) |
| **the Thunder Stair** (10) | gorge (stepped) | 200 m · a 30 m reach, a 6 m Throat | 1 | 0.3–0.9 / the stair chutes and the Throat | the Throat and the falls above (falls card) | a broad placid reach into mist | day in the step pools · old in the Cauldron under the falls · night at the Soap Landing · crown on the eddy line at the Throat's tail |
| **the Salt Gate** (12) | tidal | 260 m · 25 m up top, 60 m at the mouth | 2 | ±0.4–1.0 by tide / the sluice throat at full ebb | a sweet pool under a small fall | the bar at the open sea-gate, mist beyond | day on the bar · old in the Sluice Throat · night at the Harbour Stump and the Turning Tide (fifth) · crown at the Slipway in the shipyard |
| **the Siltway** (14) | meander | 300 m · 50–70 m | 1 long | 0.3–0.5 / none | where the black river joins (the Seam) | a far bend under mist | day on the Seam · old at the Sunk Ferry · night on the Lamp Bar · crown in the Long Hole on the outside of the great bend |
| **the Inkwood** (16) | oxbow and creeks | 240 m · 14–24 m, plus 2 blind creeks 5–8 m wide | 3 winding | 0.15–0.35 / a little fall at Rootgate Creek | the creek fall | the trunks close into mist | day where the gourds fall (the Windfall) · old at the Kitchen Stair and the Overhang (fifth) · night up Rootgate Creek · crown in the hidden pond, the Breathing Mere |

The first river (MVP, SPEC §13 slice 6b) is one spine, the `meander` and `braided` basics: the field, the banks, the ends, the current's look, drift, the raft rules and the validator. Gorge walls and rapids, the stepped stair, the tide, oxbows and creeks, two-phase flow normals, ripple drift and the float's swing come with their waters.

---

## 5. The vegetation kit

### 5.1 Seven archetypes (each water's theme picks its variants: shape and colour)

| archetype | variants (by water) | triangles each | sway | casts shadow | in the mirror | starts at lush | full count (lush 1, high) |
|---|---|---|---|---|---|---|---|
| floating pad | lily, lotus, giant lily, hyacinth raft, duckweed mat | 8 (flat fan; replaces the 48-triangle cylinder) | bob only | no | no | 0.03 | 220 (+50 flowers) |
| emergent blades | reed, rush, papyrus, eelgrass, mangrove seedling | 20 | 0.12 m | no | yes | 0.05 | 700 clumps |
| frond cluster | fern, sea-fern, cycad | 36 | 0.05 m | no | no | 0.12 | 240 |
| bush | shrub, sponge or anemone clump, bamboo stand | 60 | 0.03 m | no | yes | 0.20 | 160 |
| ground tuft | sedge, grass, moss cushion | 14 | 0.04 m | no | no | 0.25 | 900 |
| tree | broadleaf, willow, pine and fir, palm, mangrove (prop roots), buttress giant, swamp tree on knees | 110–380 near, 30 far | 0.04 m crown | **yes** (static) | yes | 0.30 (far 0.40) | 55 near + 140 far |
| hanging strand | vine, hanging root, moss curtain, kelp (rising) | 12 | 0.15 m, pendulum | no | yes | 0.45 | 200 |
| (free) | moss on stone and bone (vertex colour), weed beds and duckweed film (water shader), fireflies (one points preset) | 0 | — | — | fireflies yes | 0 | moss = lush; 260 fireflies |

A kind's count at a water is full × (0.12 + 0.88 × u^0.85), with u = (lush − start) / (1 − start), and 0 below its start: each new kind arrives small, so every step is visible and none is a jump. Rivers plant 0.8× a lake's count at the same step, because two near banks fill more of the frame; the sea plants on the rock, the far island and the weed only. **The measured green share is binding, not the count.**

**Where things grow** (one placement function for lakes and rivers): pads where the depth is under 0.25 and the flow under 0.3; reeds 0–2 m from the bank; ferns, bushes and tufts 0–4 m up the bank; trees 4–15 m back, leaning 10–25° over the water, with strands hanging from crowns over the water; far crowns up to the bluff. Lakes use cliff faces facing upward (normal y > 0.45) between 0.3 and 5 m up, island rims and tops, and the shallows. New lake waters from lush 0.3 may take a cliff terrace (`arena.shoreShelf`, 3–6 m wide) to plant on.

### 5.2 How it is built and drawn

- **Merged, not instanced.** Per material, every kind merges into one mesh split in three segments (thirds along a river, 120° sectors on a lake), each culled by its bounding sphere, so the camera usually draws one or two. Materials: `flora.tall` (mirrored), `flora.low` (not mirrored) and `canopy` (casts, mirrored, ink outline on high and medium only). Trunks join the existing `organics` mesh. About 1.8 MB at lush 1.
- **Sway** is a vertex attribute (weight by height, phase by root position) and shared uniforms for the wind and the raft's push (blades bend away from the raft). About 12 instructions per vertex; reflections sway too; canopy shadows stay still (a few centimetres of sway).
- **No alpha test and no transparency on foliage**: opaque blades and fronds with ink darkening baked into the vertex colour at bases and tips. It keeps early depth testing and avoids the software-GL discard cost; near the camera the fronds are solid low-poly geometry, so phones without MSAA stay sharp.
- **Night**: a flora floor tint (leaf shadows stay deep green-violet, not grey), moon translucency through the leaves, a lavender rim from the water's `light`, fireflies fading in with the night. Dusk needs no data: the warm key turns greens golden.
- **Determinism.** Flora uses its own seeded random stream (`makeRng(L.artSeed ^ 0xF10A)`) and runs after every existing builder, so the Mossmere (lush 0) builds byte-identical; a geometry hash test lands with the first flora commit.
- **Themes.** Each water names its kit (`zone.theme`) in a registry (`src/world-themes.js`: kit, key light, sky, pillar kinds and art, painter, floaters, flora variants). The index clamp in `themeOf` goes; an unknown theme falls back to a `generic` kit, never to the Pallid Deep's.

### 5.3 Instances per water (high; medium 0.7×, low 0.4×)

| slot | water | lush | pads | reeds | ferns | flowers | bushes | tufts | trees (near) | far crowns | strands | fireflies | new triangles (high) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | the Mossmere | 0 | 0 new | 0 new | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (today's look) |
| 2 | Sporewood Pools | 0.07 | 38 | 104 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2.4k |
| 3 | Glasswater Vault | 0.13 | 55 | 162 | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4.9k |
| 4 | the Pallid Deep | 0.20 | 70 | 212 | 56 | 10 | 19 | 0 | 0 | 0 | 0 | 0 (glow-moss 12) | 8.1k |
| 5 | the Rime Sound | 0.27 | 85 | 259 | 75 | 14 | 36 | 139 | 0 | 0 | 0 | 0 (glow-moss) | 12.8k |
| 6 | the Thin Water | 0.33 | 98 | 304 | 92 | 18 | 50 | 230 | 10 | 0 | 0 | 113 | 20.4k |
| 7 | the Last Light | 0.40 | 112 | 348 | 109 | 22 | 63 | 310 | 16 | 17 | 0 | 129 | 26.7k |
| 8 | Pyrefall Gorge | 0.47 | 125 | 390 | 124 | 25 | 75 | 384 | 21 | 36 | 33 | 145 | 32.8k |
| 9 | the Waxen Reef | 0.53 | 137 | 431 | 140 | 28 | 86 | 454 | 26 | 51 | 59 | 160 | 38.7k |
| 10 | the Thunder Stair | 0.60 | 150 | 471 | 155 | 32 | 97 | 522 | 30 | 65 | 82 | 175 | 44.0k |
| 11 | Rushlight Fen | 0.67 | 162 | 511 | 170 | 35 | 108 | 589 | 35 | 79 | 104 | 190 | 49.6k |
| 12 | the Salt Gate | 0.73 | 174 | 550 | 184 | 38 | 119 | 653 | 39 | 92 | 124 | 204 | 54.7k |
| 13 | Lampmoss Slough | 0.80 | 185 | 588 | 198 | 41 | 129 | 716 | 43 | 104 | 144 | 218 | 59.7k |
| 14 | the Siltway | 0.87 | 197 | 626 | 212 | 44 | 140 | 779 | 47 | 116 | 163 | 232 | 64.8k |
| 15 | Lanternroot Lagoon | 0.93 | 209 | 663 | 226 | 47 | 150 | 840 | 51 | 128 | 182 | 260 (synchronous) | 69.7k |
| 16 | the Inkwood | 1.00 | 220 | 700 | 240 | 50 | 160 | 900 | 55 | 140 | 200 | 260 | 74.6k |

The counts are the kit's ceiling at each step; a water plants the kinds its look names (§1, "what grows"): the sea has no reeds or tufts, the fjord's trees are firs on the far shoulders, the Mossmere's built reeds and pads stay dun-ochre.

### 5.4 The cost line (add to DESIGN §25.8.8; high / medium / low)

| item | technique | main pass | mirror | shadow | triangles (main, visible) |
|---|---|---|---|---|---|
| flora (`flora.tall`, `flora.low`, `canopy` + outline) | merged by material, 3 segments, sway | ≤ +6 / +5 / +3 | ≤ +4 / +4 / 0 | ≤ +2 / +2 / 0 | ≤ 45k / 32k / 18k at lush 1 |
| river banks | one heightfield, 2 m cells | +1 | +1 | 0 (receives only) | 11k |
| fireflies and glow | one points preset | +1 | +1 | 0 | 0 |
| drift (rivers) | two instanced meshes | +2 / +2 / +1 | 0 | 0 | < 1k |
| current, foam lines, rapids, weed film | the `GW_RIVER` water shader | 0 | 0 | 0 | +40–60 instructions per water pixel (+25 on low) |
| a falls card at a river's end (optional) | one scrolling card | +1 | +1 | 0 | — |
| **a river's world, in all** | today's 30–36 base, cliffs become a bluff, plus the lines above | **≤ 62 / 56 / 48** | **+ ≤ 8** | **+ ≤ 2** | — |
| **a lush lake's world, in all** | the Mossmere or walking-lake line + flora + fireflies | **≤ 62 / 54 (raft), ≤ 72 / 58 (walking)** | + ≤ 5 | + ≤ 2 | — |

**The frame at lush 1, a river, on high:** about 186 + 10 main + 8 mirror + 2 shadow ≈ 206 calls and about 270k triangles (under twice today). A mid laptop GPU pays about 1.0–1.5 ms more, a mid phone on medium 2–3 ms. Software GL at 960×540: high about 1.5 s → 1.9 s a frame (+25–30%), low 0.49 s → 0.56 s (+15%). A river frame and a lush-lake frame join `tests/clarity-perf.scenario.mjs`; captures of rivers run at low and medium. The auto-tier's fps check is unchanged. If the mirror costs too much on medium phones, reeds move to `flora.low` (unmirrored) first, then the canopy outline drops on medium.

---

## 6. The built waters 2–4: a gentle repaint

Their fog, water and grade stay exactly as they are, so the user-approved lake hues stay distinct. Green comes only from materials. Every new mechanism is gated by `lush > 0`, so the Mossmere is untouched.

| water | step | what changes | what stays | target green share (day / dusk / night) |
|---|---|---|---|---|
| **Sporewood Pools** | 1 | KIT keys `mossG` #4c5236 and `mossGHi` #7a7c4c on 15% of upward rock and the cap-reef edges; the shore's curled fronds become #5e6440 / #8a8a52 (60 of them); bronze-olive pads by the lily caps; 2–3 fern silhouettes in a far ring; no fireflies (the gold spores twinkle) | haze, water, ochre caps, gold spores, grade | 3 / 3 / 2 |
| **Glasswater Vault** | 2 | KIT moss #262f66 → #2e4a3c and mossHi #3c4a94 → #56785e, moss amount 0.25 on cliff and monolith tops; 10 tree ferns in the colonnade's broken arches and 80 fern cards; grey-green lichen beards (#8a9a8c, saturation ≤ 0.10) on the chandelier chains; periwinkle glow-worm threads (#a0aaf8) under the shelves at night | crystals, sapphire water, starlight, grade | 6 / 5 / 4 |
| **The Pallid Deep** | 3 | KIT moss #46424e → #6e7860 and mossHi #8a8494 → #9aa088 (pale sage moss on bone, amount 0.35 on terraces, cairns, rib roots, the giants' shoulders and veil hems); ivy (#2e4232 / #1e2a24) on 4 of the 9 ribs and the funeral colonnade; dark cedar spires (#1e2a24) between the ruins in rings 1–3; moonflowers (#e8e4f4) that open at night; 12 pale-jade glow-moss patches (#9cc8a8) at night; grade saturation 0.90 → 0.92 | fog, the darkest ink-violet water, bone, ink, gold, candles, the giants | 8 / 7 / 5 |

The Pallid Deep keeps its slot (4): it is built and priced, it closes the old kingdom, and its step is small enough for materials alone. It gains one line in its description: "Moss has kept the vigil the candles could not." **Before any new water is built, the four built lakes are shown side by side (day, dusk, night) for the user's approval** (SPEC §13 slice 1c): if Sporewood or Glasswater reads as "green" rather than "a little moss", the first step is too big.

---

## 7. Measuring the ramp, and the gates

The ramp is proven by numbers, not by eye alone.

| gate | where | rule |
|---|---|---|
| **the step** | `tools/validate-data.mjs` | every zone has `lush`; it rises strictly with unlock order; the Mossmere is 0 |
| **air never green** | `validate-data` | fog, ink, ambient, far, light, nebula, lamp, glow, candle, `skyDay` and the grade tint stay outside 65–195° (or saturation < 0.12) on every water, as today |
| **leaf caps** | `validate-data` | leaf keys saturation ≤ min(0.62, 0.25 + 0.04 × step), value ≤ 0.70; glow-moss saturation ≤ 0.32; fireflies hue 55–80°, saturation ≤ 0.40; the water's own colour outside 65–195° |
| **the share** | `tools/hue-report.mjs`, fixed poses | each water's green share is within ±20% of §1's target; the Mossmere and the Landing keep today's gate (≤ 1% pooled, ≤ 2% a frame) |
| **monotonic, never a jump** | `hue-report` | each water's day share is 1.5–5 points above the water before; dusk and night at least 1 point above; night ≥ 40% of day; the night emitters never fall from one water to the next |
| **no cast** | `hue-report` | the frame's mean Oklab a ≥ −0.006 by day and ≥ 0 at night; the top fifth of the frame (sky) ≤ 2% green; shadow pixels (luma < 0.10) green share ≤ 0.6× the frame's; pale stone and foam read lavender-grey |
| **never neon** | `hue-report` | ≤ 0.3% of pixels green with saturation > 0.6 and value > 0.6; mean green hue 85–135°; teal (160–195°) ≤ 2% of the frame and ≤ 10% of the green |
| **variety** | `hue-report`, from step 3 | yellow-green, green and blue-green each ≥ 12% of the green weight |
| **sign readability** | DESIGN c14 check | re-run on every greener water: fireflies, glow-moss and night flowers must not compete with the six signs, the float or the bite tell |

Captures wait for the shared machines to be free; no browser playtests run while other agents capture.

---

## 8. The colour script

`tools/loop-colour-script.py` (Python 3, Pillow) reads the ramp table in §1 and paints one image, a column per water and a row per phase (day, dusk, night). Each cell is a simple swatch landscape: the shared violet sky down to the water's horizon, the moon at night, a far bank (stone, with canopy creeping over it as the step rises, always lavender with distance), the near bank's foliage band (its height and cover follow the step; dark base, mid body, backlit rim), the water in its own colour with the bank in its mirror, pads or weed on still water, foam lines and a near bank on rivers, flowers by day and fireflies or glow at night, and the raft's one candle in every cell. A bar under each column shows the day's target green share.

```
cd gloomwater
python3 tools/loop-colour-script.py          # writes tools/out/loop/colour-script.png (untracked)
```

Read left to right it should look slow, steady and beautiful: the Mossmere exactly as today, a lavender night with a trace of ochre reeds; then moss, then ferns and firs, then reed islands and floating meadows, then hanging forest, spray forest, papyrus, mangroves, swamp, forest walls and finally the closed green hall of the Inkwood, under the same violet sky and the same lavender moon, with the same small candle on the raft.

---

## 9. Real looks behind the ramp (design notes only)

- **Across the ramp:** the Chinese blue-green landscape tradition (azurite to malachite, which is the ramp itself); Monet's water lilies (violet sky in green pads); Kawase Hasui's and Hiroshi Yoshida's night prints (indigo sky, one warm lantern, moonlit greens); Henri Rousseau's jungles under a moon; Frederic Edwin Church (green near, lavender distance); Martin Johnson Heade's marshes; the moonlit nocturnes of Grimshaw, Whistler and Kuindzhi.
- **Water by water:** 2, the moss garden of Saihō-ji; 3, New Zealand's glacier rivers through tree-fern forest and the Waitomo glow-worms; 4, Okunoin at Kōyasan and Ta Prohm; 5, Norwegian and Icelandic fjords with spruce on the shoulders; 6, the Paraná's floating islands and the Iberá marshes; 7, Ascension's Green Mountain, the Azores and the Na Pali cliffs seen from the sea, and floating sargassum; 8, the Kali and Karnali foothill gorges and terraces; 9, Palau's Rock Islands and Raja Ampat; 10, Murchison Falls and the Victoria Falls spray forest and moonbow; 11, the Okavango; 12, the Fitzroy and King Sound mangroves; 13, the Atchafalaya and Everglades cypress; 14, the Amazon main stem, the Meeting of the Waters, the várzea meadows and giant lilies; 15, Kuala Selangor's synchronous fireflies, Pearl Lagoon and a Bajau stilt village; 16, the Anavilhanas and Rio Negro igapó, and Guyana's jungle ponds.
- **Sources for the river shapes:** Junk et al. 2011 (white, black and clear water; flood depths); Aguas Amazónicas (blackwater, whitewater, várzea); Livingstone Falls and Murchison Falls descriptions; Earth Island and India Rivers Week on the Karnali and Kali; UNESCO and IUCN on the Okavango; Rewilding Argentina on the Iberá's floating islands; the ISRA factsheet and WA Water note 36 on the Fitzroy and King Sound; UNESCO and SEAFWA on the Trinity.
