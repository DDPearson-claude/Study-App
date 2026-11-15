# The World: the Evenland, and the Lamp Road through it (binding, v1)

*Binding with `LORE.md` (the story), SPEC v7.1 §5.2 (the sixteen waters and their order), `WATERS.md` (the greening ramp) and `ROSTER.md` §2–§3 (every place and giant). It answers the user's words of 14 November 2026: "Draw out a huge continent shaped map. This map is the whole world and it shows how each lake and river is actually connected to one another. So It feels like we're actually journeying through a world when we unlock new maps etc. Make it feel natural and real and that it follows our story arc." Design only: no `src/` file changed. Real-world comparisons in this file are design notes only and never ship.*

**The continent in three sentences.** The Evenland is one continent of two lobes, a cold, high, stony north lobe (the old kingdom's highland under the Spine and its ice field) and a broad, low, wet south lobe (the Green Heart's forest basin and the great brown Siltway), joined by a long middle of steppe and desert coast with sea on every side. The Lamp Road, the people's old water road and the Wick's route in unlock order, climbs from the Landing on the cold north coast up the Kingsflow into the stone highland, runs out through a mountain gap to a glacier fjord and the open sea, goes back up the cold road to its snow, then voyages south down the long cold coast into the warm, dry west, up the Great Step and down to the sea-gate, and crosses a swamp gap by canal onto the barge road and into the forest at the heart. Every leg is a real river, canal, lock stair or stretch of coast that runs downhill the way water does, and the land greens because the road really runs from cold stone through dryness into rain.

**Coordinates.** The canvas is 1000 × 1400; x grows east, y grows south. The land fills about x 110–950 and y 130–1340. The margins (x < 60, x > 955, y < 110, y > 1345) stay blank: "the world beyond the map". The only land drawn in them is the far isle (55, 495).

---

## 1. The Chart is a road chart, not a survey (scale, latitude and the Fold)

A continent that runs from glacier fjords to rainforest must span at least forty degrees of latitude, so the real Evenland is huge: about **6,000 km from the Cold Coast to the Low Horn** and about 1,700 km across the south lobe. A chart that drew it evenly would make the four old-kingdom lakes a speck and the empty middle a desert of paper. The kingdom's chart-makers drew it the way road charts were drawn: **the waters large, the empty miles short**. The Chart keeps their drawing, and this table is the truth behind it, for the art and for the physics.

| part of the Chart | where | about how far one Chart unit is | what it means |
|---|---|---|---|
| **The kingdom inset** | the highland, x 330–640, y 160–470 (reach I and the Landing) | 0.25 km | the capital and its basins drawn about four times larger than the land round them, as people draw home |
| **The north lobe** | the rest of y < 640 (the Spine, the fjord coast, the Pale Flats, the Pyre) | 1 km | the cold rim at an honest scale |
| **The Fold** | the band y 640–740, coast to coast | about 45 km north to south | some 4,500 km of empty steppe, cold desert coast and the long Morning Gulf, which the kingdom crossed only by sea and never settled, folded to a hand's width; the chart-makers mark it with a ribbon of small repeated wave and dune marks, their sign for "this goes on a long time" |
| **The south lobe** | y > 740 | 2 km | the warm west, the Low Gap, the Siltway basin and the Green Heart |

**Latitude (true, approximate).** The Cold Coast lies at about 51.5°N, the Landing at 51°N, the highland lakes between 50.9° and 50.6°N, the Rime Sound at 50.4°N, the Last Light at 49.6°N, Pyrefall Gorge at 49°N. The Fold carries the coast from about 48°N to 7°N. The Waxen Reef lies at about 6°N, Rushlight Fen at 4.4°N, the Salt Gate at 1.7°N, Lampmoss Slough at 0.7°N, Lanternroot Lagoon at 2.1°N, the Inkwood at 2.3°N. **The equator runs at about y 1100**, through the Siltway's great bend. The Low Horn's tip is at about 4°S.

**The long evening and the climate.** Why the sun never rises is myth, not physics, and the game never says (`LORE.md` §2.1). For the map, the climate is drawn as if the sun still warms the world from just below the rim: the south is warm, the north cold, and the winds and currents run as they would on a turning world.

**How a raft crosses it in an evening.** It does not sail the real miles. Out past the Landing's ferry gate the channel runs into the mist, and in the mist every remembered water lies one evening from home; a lit Waystone remembers the way (`LORE.md` §2.12). The Chart shows the real road and how far it really is. The whole Lamp Road, with reach II's way out and back, is about **8,000 km** long.

---

## 2. Shape, regions and relief

**Shape.** Two lobes joined at a long waist. The **north lobe** is cold, high and stony: the old kingdom's highland, with the Spine along its west side. The **south lobe** is a broad, low, wet basin. The **Morning Gulf** bites in from the east almost to x 650, narrowing the waist on the Chart (in truth it is a long sea running thousands of kilometres into the continent). The **Grey Horn** points north-east, the **Low Horn** points south, and the Siltway's delta bulges into the eastern sea.

**Outline** (clockwise from the north-west cape; draw it as ink, not as a polygon): (118,285) (140,232) (182,196) (236,174) (292,158) the White Crown's ice cliffs (350,168) (410,160) (470,172) (528,190) (566,196) the outer wall (586,186) [the Landing's cove (600,180)] (614,186) (636,196) (690,182) (748,166) (800,150) [the Grey Horn, tip (858,132)] (872,160) (846,210) (858,262) (842,330) (856,400) (838,460) (852,520) [the Morning Gulf: north shore (820,568) (760,600) (704,632), head (660,670) (646,712), south shore (676,746) (732,760) (792,772) (846,792)] (880,832) (888,880) (876,930) [the lagoon barrier (860,952), the tidal inlet (856,985)] (866,1012) (900,1032) [the Siltway's delta lobes (934,1050) (948,1085) (930,1120)] (905,1150) (860,1190) (800,1225) (735,1255) (668,1270) [the Low Horn (640,1300), tip (612,1336), (588,1300)] (548,1285) (470,1300) (400,1290) (338,1262) (285,1215) (248,1160) (228,1100) (214,1050) [the Salt Gate's estuary: (212,1020) in to (262,1004), out at (205,992)] (196,940) (184,880) (176,828) [the Reef Bay: south headland (200,812), bay head (214,798), north headland (178,778) (146,768)] (150,735) (168,690) (160,640) (150,590) (138,530) (130,470) (140,410) (148,362) [the Rime Sound's mouth (146,333), the fjord running in to its head at (290,302)] (140,318) (128,300). The fjord coast north of y 470 is broken into skerries.

**Islands.** The Lamp Rock (110,440); the far isle (55,495); the northern isles (450,118); the Morning Isle (947,638); the delta's barrier isles (950,1140); the south-west isle (215,1242); the reef keys (132,752).

**Regions.**

| region | where | what it is |
|---|---|---|
| **The Cold Coast** | the north coast, x 140–860, y 140–200 | sea cliffs, the kingdom's outer wall, the Landing; cold maritime, grey sea, bare stone |
| **The highland (the old kingdom)** | x 330–640, y 200–520, 300–550 m | the capital's plateau east of the Spine; ends at the north coast in walled sea cliffs, slopes south-west to the Pallid Deep's trough; four basins, the Kingsflow, the Hundred Tarns |
| **The Spine** | (292,165) (300,235) (306,310) (305,375), the Pale Gap (305,385), (305,395) (298,460) (288,530) the Pyre Peaks (262,628), on through the Fold as a coastal range | the main range, 2,500–3,800 m, the Pyre Peaks about 4,200 m; wet west face (fjords, rainforest), rain-shadow east face |
| **The White Crown** | x 250–345, y 180–295, about 2,800 m | the ice field on the Spine's north end: calves into the Rime Sound's head, feeds the Thin Water's ice-lake on the west and Glasswater's melt on the east |
| **The fjord coast** | x 120–300, y 230–470 | the Spine's wet west face, drowned valleys, skerries, temperate rainforest under the westerlies |
| **The Pale Flats** | x 340–470, y 470–600, 560–700 m | dry outwash steppe of gravel and sand in the Spine's rain shadow; the Pyre crosses it in one milky channel down to the Pallid Deep |
| **The Eastern Downs** | x 640–850, y 250–640, 400–900 m | rolling heath east of the kingdom, draining to the gulf and the north coast; never on any sheet |
| **The Fold (the long middle)** | y 640–740 | 4,500 km of steppe, cold desert coast and gulf shore, unsettled; the Long Coast runs down its west side |
| **The Great Step** | (245,720) (238,780) (246,850) (255,920) (268,985) | a 600 m escarpment along the west coast, dying out into the Low Gap near the Salt Gate |
| **The Terrace** | x 260–470, y 720–990, 650–900 m | a dry tableland behind the Step, with salt pans; green only along the Rush, the fen and the Sweetwater |
| **The Middle Hills** | around (505,790), about 1,400 m | the waist's uplands and the rain divide: the wet east side feeds the Inkwood, the dry west side sends the Rush onto the Terrace |
| **The Low Gap** | around (300,1070), a few metres high | a swampy saddle between the Step's end and the Southern Hills: the only low way from the west coast into the basin, and the first country the eastern rains reach |
| **The Green Heart** | x 520–800, y 840–1060 | a flat, low, flooded forest basin; the people's first home and their orchards; drained by the Inkwood to the Siltway |
| **The Siltway basin** | x 300–940, y 1040–1150 | the great brown river's lowland, floating meadows, oxbows, the delta |
| **The Southern Hills** | x 300–520, y 1150–1290, about 1,200 m | close the basin to the south-west and hold the Siltway's sources |
| **The Grey Horn** | tip (858,132) | the north-east peninsula, a ruined watchtower at its tip |
| **The Low Horn** | tip (612,1336) | the southern peninsula, tropical hills and savanna |

---

## 3. Seas, winds, currents and climate

**Seas.** The **Lampless Sea** to the west, beyond the Last Light: the side the sun went down, where the kingdom sent its dead. The **Morning Sea** to the east. The **Cold Sea** off the north coast. The **Warm Sea** to the south.

**Currents.**
- A **cold current** runs south along the west coast from the fjords. It carries the Rime Sound's milky outflow to the Drift Line, keeps the Last Light cool, and dries the coast it passes the way real cold currents make desert coasts. At the **Turn**, the Reef Bay's north headland (around (160,775)), it swings out to sea.
- A **warm countercurrent** comes north along the coast from the equator as far as the Turn, so the Reef Bay and everything south of it lie in warm, clear water. (Design note: as on real desert coasts where a warm current hugs an arid shore and reefs grow off it.)
- A **warm current** runs north along the east coast and into the Morning Gulf.

**Winds.** Westerlies bring rain and snow to the north lobe's west coast, which is why the fjords carry temperate rainforest and the White Crown is fed. Easterly trade winds bring rain to the south lobe's east side and through the Low Gap, which gives the basin its rainforest. The Terrace and the west coast between the Turn and the Low Gap lie in the trades' lee and the Middle Hills' rain shadow: dry.

**Climate bands, from north to south** (Chart y; true latitude):

| band | Chart y | true latitude | what it is | waters (lushness step) |
|---|---|---|---|---|
| cold maritime coast | < 200 | 51–51.5°N | grey sea, bare stone, sea ice in the coves in winter | the Landing |
| cold highland | 200–520 | 50.6–51°N | stone plateau, tarns, thin moss; warm springs in one volcanic hollow | 1–4 (0–3) |
| wet fjord coast | west of the Spine, 230–470 | 49.6–51°N | westerly rain, temperate rainforest, glaciers to the sea | 5–7 (4–6) |
| cool steppe and snow peaks | 470–640 | 48–49.5°N | rain-shadow steppe; cloud forest on the peaks' foothills | 8 (7) |
| the Fold | 640–740 | 48–7°N | cold desert coast, steppe, gulf shore; unsettled | (the voyage only) |
| dry tropical west | 740–1000 | 2–6°N | desert coast and tableland; green only where sea, spray or river water reaches | 9–11 (8–10) |
| wet equatorial | 1000–1220 | 3°N–2°S | the Low Gap swamp, the Siltway basin, the Green Heart, the mangrove coast | 12–16 (11–15) |
| tropical hills | > 1220 | 2–4°S | the Southern Hills and the Low Horn | — |

**Why the land greens in unlock order.** The road runs from the cold coast and the stone highland (steps 0–3), through the wet fjord coast under the westerlies (4–6) and a cloud-kept gorge above dry steppe (7), into the dry tropical west greened only by sea, spray and river (8–11), and then into the windward wet tropics: swamp, great river, mangroves, rainforest (12–15). Every drowned work is about four hundred years old, but each is overgrown at its climate's speed: bare stone in the cold north, coral and spray-moss in the dry west, forest swallowing everything in the wet south. The greening ramp is the land itself. Only living things carry the green; the violet-dusk sky, the lavender moon and the clear night air are the same over the whole continent (SPEC §5.3).

---

## 4. Rivers, canals and basins

| water road | course (Chart points) | what it is |
|---|---|---|
| **The Sluice Run** | (585,250) (592,222) (600,188) | the Mossmere's outflow, ~15 km; falls about 300 m through the outer wall into the Landing's cove over the great sluice the lantern's fall shut; the kingdom's ferry stair (a flight of locks) climbs beside it |
| **The Kingsflow** | (476,360) (495,335) (520,305) (550,280) (585,250), then the Sluice Run | the kingdom's own river, north-east from Glasswater (500 m) through Sporewood (420 m) and the Mossmere (300 m) to the sea; reach I climbs it |
| **The King's Cut** | (404,420) (424,402) (440,380) (455,368) | a level summit canal, ~20 km, from the Pallid Deep's east shore over the divide to Glasswater, ending in the Stilled Cascade's lock flight (+20 m); fed by the Pallid Deep; the Lantern-Swallower's way to the Mossmere |
| **Glasswater's melt** | (330,280) (380,320) (440,350) | the White Crown's east melt, settling clear in Glasswater's North Trench |
| **The Pale Run** | (350,418) (325,400) the Pale Gap (305,385) (282,360) (262,336) (256,312) | the Pallid Deep's natural outlet, ~110 km, west through a breached gap in the Spine, dropping 520 m in falls and rapids into the Rime Sound's south wall, the kingdom's slipway (portage) beside the falls |
| **The Thin Water** | the ice-lake (228,205), the royal weir (236,222), (240,245) (246,262) (252,285) (258,306) | a braided outwash river, ~100 km, from a proglacial lake under the White Crown's west glacier to the Rime Sound's north shore over a sand delta |
| **The Pyre** | the Pyre Peaks' icefall (262,625) (285,605), Pyrefall Gorge (312,580), the gorge mouth (335,545), across the Pale Flats (352,505) (368,470), into the Pallid Deep's south end (376,452) | snowmelt, milky with glacial flour, ~140 km; "the head of the river that feeds the Pallid Deep"; the kingdom's funeral river |
| **The Rush** | (482,770) (450,790) (410,815) (372,835), the delta head (352,845), Rushlight Fen (322,852), the great dam (272,822), the Dam Foot (262,818), the falls and the Throat (250,812), the Cauldron (243,808), the step pools (234,804), the foot reach (222,800), the Reef Bay (205,797) | rain from the wet Middle Hills carried across the dry Terrace, then down the Great Step by the broken lock stair |
| **The Sweetwater** | (318,872) (305,915) (290,955), the small fall at the fall line (272,993), the Salt Gate's sweet pool and tidal reach (250,1006), the sea (218,1014) | the fen's second, natural outlet, ~320 km south across the Terrace |
| **The Straight Canal** | (252,1010) (280,1035), the summit at Lampmoss Slough (318,1062), (355,1080), the Canal Mouth (398,1094) | the kingdom's canal, ~150 km to the summit and ~180 km down to the Siltway, across the Low Gap from the sea-gate to the barge road |
| **The Siltway** | the Southern Hills (300,1175) (340,1130) (372,1105), the Canal Mouth (398,1094), (450,1092) (510,1108) (575,1112) (640,1095) (700,1072) (745,1066), the Seam (758,1068), the great bend and the Long Hole (775,1092), (805,1085), the delta head (842,1070), the main mouths (900,1050) to (940,1070) | the great brown lowland river, about 1,300 km, falling only about 10 m below the Canal Mouth; the kingdom's barge road with pale mile-posts; north arm to the lagoon (842,1070) (848,1040) (838,1012); south arm (842,1070) (890,1100) (925,1120) |
| **The Inkwood** | (560,830) (600,872) (645,912) (688,950) (712,975) (740,1000) (756,1032), the Seam (758,1068) | the blackwater river of the Green Heart, from the Middle Hills' south-east foot through the flooded forest to the Siltway |
| **The Monsoon Cut** | (745,1002) (780,996) (812,990) | the Inkwood's wet-season overflow, ~140 km, east through the drowned orchard rows and the mangroves to the lagoon's head |

**Basins.** The highland's four basins (the Mossmere's moat basin; Sporewood's volcanic hollow; Glasswater's granite trough; the Pallid Deep's glacial trough, floor below sea level); the Green Heart (the inland end of the orchard plain); the Siltway's lowland; Lanternroot's lagoon behind its barrier spit (the seaward end of the same orchard plain, so there is one orchard plain and two drowned ends of it).

---

## 5. The sixteen waters

Each water's coordinates, its true latitude, its setting and the leg that joins it to the water before it. Places, landmarks and giants are SPEC §5.2's and ROSTER §3's; the clue each water shows is `LORE.md` §3's.

| # | water | x, y | lat | reach · step |
|---|---|---|---|---|
| — | **The Landing** (home) | 600, 190 | 51.0°N | — |
| 1 | The Mossmere | 585, 250 | 50.9°N | I · 0 |
| 2 | Sporewood Pools | 520, 305 | 50.8°N | I · 1 |
| 3 | Glasswater Vault | 455, 368 | 50.7°N | I · 2 |
| 4 | The Pallid Deep | 378, 428 | 50.6°N | I · 3 |
| 5 | The Rime Sound | 220, 312 (head 290, 302; mouth 146, 333) | 50.4°N | II · 4 |
| 6 | The Thin Water | 246, 262 (weir 236, 222) | 50.9°N | II · 5 |
| 7 | The Last Light | 100, 452 (the Lamp Rock 110, 440) | 49.6°N | II · 6 |
| 8 | Pyrefall Gorge | 312, 580 | 49.0°N | II · 7 |
| 9 | The Waxen Reef | 138, 758 | 6.2°N | III · 8 |
| 10 | The Thunder Stair | 228, 800 | 5.4°N | III · 9 |
| 11 | Rushlight Fen | 322, 852 | 4.4°N | III · 10 |
| 12 | The Salt Gate | 240, 1008 | 1.7°N | III · 11 |
| 13 | Lampmoss Slough | 318, 1062 | 0.7°N | IV · 12 |
| 14 | The Siltway | 760, 1080 (the Seam 758, 1068; the great bend 775, 1092) | 0.4°N | IV · 13 |
| 15 | Lanternroot Lagoon | 830, 985 | 2.1°N | IV · 14 |
| 16 | The Inkwood | 712, 975 | 2.3°N | IV · 15 |

**The Landing (home, 600, 190).** An old ferry landing in a sea cave at the foot of the kingdom's outer wall on the Cold Coast, directly under the Sluice Run's fall. The kingdom's ferry stair met the sea here. When the capital drowned, the window candles were carried out on the rising water, down the Sluice Run, and came ashore here, on the first dry stone below the drowning; that is why the game begins here. Its broken arch, **the ferry gate**, faces north to the dark Cold Coast; the channel beyond runs out into the mist toward every water. It has a real ceiling. Green only as a trace: it is the coldest coast the road touches.

**1. The Mossmere (585, 250).** The capital's moat lake on the highland's north lip, about 300 m up, with the Sunken Gate on its north shore and the outer wall and the cliffs beyond. The great lantern hung over its open water, 44 m in front of the Gate, its weight holding the great sluice open; when it fell, the sluice dropped shut and the lake rose over the city to the arches (`LORE.md` §2.4). Cold, bare, drowned stone under broken vaulting. *Joined:* from the Landing, south and up, by the Sluice Run and the ferry stair's locks (~15 km, +300 m). It comes first because it is the door the last candles came out of: the nearest water to home.

**2. Sporewood Pools (520, 305).** The next basin up the Kingsflow, about 420 m, in an old volcanic hollow. Warm springs and the vents (the Puffball Vent's pink sparks) keep its water mild in the cold highland: giant mushrooms, warm-water fish, first moss. The royal gardens. *Joined:* up the Kingsflow from the Mossmere's south end, south-west and up, a short reach of rapids with one kingdom lock (~20 km, +120 m).

**3. Glasswater Vault (455, 368).** A deep, clear, cold lake in a granite and crystal basin, about 500 m, the head lake of the Kingsflow, fed clear by the White Crown's east melt (the North Trench). The Stilled Cascade on its west shore is the King's Cut's lock flight; its overflow fall stopped when the Cut's gates were shut. *Joined:* up the Kingsflow again, south-west, through a narrow granite throat (~20 km, +80 m). It is the source of the river you have been climbing.

**4. The Pallid Deep (378, 428).** The highest and deepest lake of the kingdom: a glacial trough at the Spine's east foot, surface about 520 m, its floor gouged below sea level (the Bottomless). The Pyre feeds it from the south-west out of the snow; it drains west through the Pale Gap to the sea, not into the kingdom. The funeral lake, and the hub of reach II. *Joined:* west over the King's Cut, the summit canal: up the Stilled Cascade's lock flight (+20 m) to the summit pound, then level west to the Deep's east shore (404,420) (~20 km). The Cut crosses the kingdom's divide: the lakes behind you drain north to the Landing, the Pallid Deep drains west to the sea.

**5. The Rime Sound (220, 312).** A fjord cut by ice into the Spine's wet west face, about 145 km from its mouth (146,333) to its head (290,302), half a mile deep behind a sill at the mouth. A tidewater glacier from the White Crown comes down at the head (the Lantern Hole's floe ice). Temperate rainforest on its walls under westerly rain; the Pale Run falls white into the south wall near the head; the Thin Water's sand fan comes in on the north shore. Frozen bell-buoys mark the kingdom's sea road out. *Joined:* down the Pale Run, west and down through the Pale Gap, past its falls by the kingdom's slipway (~110 km, −520 m), to the Sound's south shore (256,312). The first water outside the walls, and the first salt.

**6. The Thin Water (246, 262).** A braided outwash river on a sand valley between the White Crown and the north-west coast. A western outlet glacier feeds an ice-lake (228,205) that the kingdom's royal weir (236,222) held; below the broken weir the river spreads wide and thin over pale sand for ~100 km to the Sound. Willows on the old bars, reeds, fireflies, floating meadows. *Joined:* from the Sound's head, north and upstream into the Thin Water's own mouth over the sand delta just west of the glacier front (258,306), and up over the bars to the weir.

**7. The Last Light (100, 452).** Open sea on the shelf off the fjord coast round the Lamp Rock (110,440), the turf-and-fern sea stack that carries the kingdom's last lighthouse. The far isle stands in cloud to the west (55,495) at the Chart's edge, and nothing beyond it is drawn. The **Drift Line** (around (120,420)) is a real front where the Sound's cold, milky, fresher outflow meets the southward coastal current; weed and wreckage gather on it. Reef breakers foam on the shoal ring round the islands. Beyond lies the Lampless Sea. *Joined:* downstream all the way: down the Thin Water, down the Sound's whole length and out over its sill, then south-west on the cold current about 110 km to the Lamp Rock. The Thin Water's own milky water makes the same voyage and becomes the Drift Line.

**8. Pyrefall Gorge (312, 580).** The Pyre's upper river, cut through the Pyre Peaks' north-east foothills. Snowmelt from the peaks' icefall pours milk-pale through the gorge; cloud trapped against the peaks and the spray keep its walls green (pines, hanging forest, bamboo) while the Pale Flats below lie in rain shadow. Temple stairs and pyres on the banks, the Coin Run where the kingdom's coins were thrown for the dead. The ash and the biers floated down the Pyre to the Pallid Deep. *Joined:* back up the cold road to its source: in past the Sound's mouth, up the Pale Run, across the Pallid Deep to its south end, then south-west up the Pyre across the Pale Flats into the foothills (~140 km). The mist at the Pallid Deep's head since map 4 was this gorge all along. Reach II closes where the kingdom's water begins, in the snow.

**9. The Waxen Reef (138, 758).** The drowned harbour town on the Reef Bay's north headland: the kingdom's west port at the foot of the Thunder Stair, built on land won from the sea behind a mole. When the mole went unkept the sea took the town back, and coral took the roofs. It is the first warm water: the headland is the Turn, where the cold current swings offshore, and the bay lies in the warm countercurrent, clear because the dry coast sends no silt. Palm keys stand on the highest ridges (132,752); the wreck lies across the drop-off. *Joined:* down the Pyre and the whole cold road to the sea, then south down the **Long Coast** on the cold current, about 4,700 km through the Fold from (100,452) to (160,780), until the headland breaks the current and the water warms. This is the hinge where the journey leaves the cold.

**10. The Thunder Stair (228, 800).** Where the Rush comes off the Great Step. The kingdom's lock stair, now broken, carried barges down the escarpment between its two towers, and the river falls down it now: the Throat below the great dam's foot at the top, the Cauldron, the step pools and a short calm foot reach to the bay. It never rains here (the Step's rain shadow, cold water just to the north): everything green lives on the spray. The heat lightning is real, from storms over the Middle Hills. *Joined:* east across the Reef Bay and up the Rush's short lower course (~40 km) to the broad calm reach at the Step's foot. The reef town and the stair were one port.

**11. Rushlight Fen (322, 852).** An inland delta on the dry Terrace: the Rush comes down from the wet Middle Hills and spreads into bright channels over white sand where it enters the great dam's reservoir (272,822). Papyrus lives on river water in a dry land. The Dam Foot's black pool lies under the dam on the Step's lip. The fen has two outlets: the dam (down the Stair) and the Sweetwater (south), a natural spillway the dam was built to feed. *Joined:* up the Great Step, east and up (~20 km, +600 m): the broken locks cannot be sailed, so the raft is hauled up the towers' haul-way past the Throat to the Dam Foot's pool, then lifted through the great dam's barge lock into the delta.

**12. The Salt Gate (240, 1008).** The kingdom's great sea-gate: the tidal estuary where the Sweetwater meets the sea at the Great Step's low southern end. Its funnel mouth amplifies the tide, so the reach ebbs and floods hard every evening. A small fall at the fall line (272,993) caps the reach, with sweet water above it. Below are the drowned sluices, the shipyard of unfinished hulls and the gate's two towers (222,1012), left open. Mangroves on the near-equatorial coast. *Joined:* downstream, south then west: the Sweetwater leaves the fen's south channels (318,872), crosses the Terrace (~320 km) with rapids, and drops by the small fall into the sweet pool; the raft takes the side lock and rides the ebb down to the gate.

**13. Lampmoss Slough (318, 1062).** The summit pound of the Straight Canal in the Low Gap's swamp, a saddle a few metres high. The canal's stone cut, the drowned millstream that fed it, the broken weir and the lock gate lie in still water under living swamp trees. It is the first country the eastern rains reach. *Joined:* from inside the sea-gate, south-east and inland by a lock (252,1010) into the Straight Canal, climbing gently (~150 km) to its summit. The kingdom's link from its sea-gate to its barge road, and the way the people turned for home.

**14. The Siltway (760, 1080).** The barge road: the great brown lowland river of the basin, flowing east about 1,300 km from the Southern Hills to its delta on the Morning Sea, so wide the far bank is a green line. The sailed reach runs from the Seam (758,1068), where the black Inkwood comes in, to the great bend (775,1092) with the Long Hole on its outside. Mile-posts, sunk barges, the lit ferry under the water, floating meadows loud with frogs. *Joined:* down the canal's eastern locks to the Canal Mouth (398,1094), then downstream east along the barge road (~720 km) to the Seam and the great bend.

**15. Lanternroot Lagoon (830, 985).** A brackish lagoon behind the barrier spit north of the Siltway's delta: the delta's north arm brings sweet water, the tidal inlet (856,985) brings salt. The seaward end of the kingdom's orchard plain sank as the delta's edge went unbanked, and mangroves grew through it. The stilt village (830,985) hangs its lanterns. The Monsoon Cut leaves its head westward toward the Inkwood. *Joined:* downstream past the great bend to the delta head (842,1070) (~140 km), then north up the delta's north arm (848,1040) (~70 km) into the lagoon. Where the barge road meets the sea and the orchard.

**16. The Inkwood (712, 975).** The blackwater river of the Green Heart. It rises at the Middle Hills' south-east foot (560,830) and winds south-east through the flat, flooded forest basin, the inland end of the orchard plain, to the Seam. Sandy soil, tannin and little silt make tea-black mirror water; the orchards stood on dikes, and when the dikes went the forest flooded and took them. Creeks lead to hidden ponds (the Breathing Mere). The lowest, wettest, greenest land the road reaches, at the heart of the south lobe. *Joined:* west from the lagoon's head up the Monsoon Cut (812,990) to (745,1002) (~140 km), through the drowned orchard rows into the Inkwood's lower reach, then upstream north-west under the closed canopy. It is the black river first seen pouring in at the Seam on map 14: the road closes its loop at the heart.

---

## 6. The route (the Lamp Road, in unlock order)

The people carried their fire north along this road, lighting a lamp at each water; the Wick walks it the other way, from the capital back to the hearth.

- **Reach I, the old kingdom** (up one river and one canal, south-west and uphill; ~75 km): the Landing → up the Sluice Run and the ferry stair → **1 the Mossmere** → up the Kingsflow through one lock → **2 Sporewood Pools** → up the Kingsflow → **3 Glasswater Vault** → west over the King's Cut's summit by the Stilled Cascade's lock flight, crossing the divide → **4 the Pallid Deep**.
- **Reach II, the cold rim** (one water road, the Pyre → the Pallid Deep → the Pale Run → the Rime Sound → the sea, explored outward from the Pallid Deep in both directions): down the Pale Run west through the Pale Gap, past its falls by the slipway → **5 the Rime Sound** → north up the sand delta to the broken weir → **6 the Thin Water** → downstream all the way, out over the Sound's sill and south-west on the cold current → **7 the Last Light** → back up the whole cold road, across the Pallid Deep and up the Pyre over the Pale Flats → **8 Pyrefall Gorge**.
- **Reach III, the falls and the gate** (from the sea up the Great Step and down to the sea-gate): down the cold road and the Long Coast, through the Fold, to the warm Reef Bay → **9 the Waxen Reef** → east across the bay and up the Rush's foot → **10 the Thunder Stair** → up the Step by the haul-way and through the great dam's barge lock → **11 Rushlight Fen** → down the Sweetwater across the Terrace, past the small fall by its side lock, down the tidal reach → **12 the Salt Gate**.
- **Reach IV, the green heart** (across the Low Gap into the wet basin, then to its heart): by lock into the Straight Canal and up to its summit → **13 Lampmoss Slough** → down the canal's eastern locks and east down the barge road → **14 the Siltway** → down to the delta head and up the north arm → **15 Lanternroot Lagoon** → west up the Monsoon Cut through the drowned orchard → **16 the Inkwood**.

**Overall direction.** From the cold north coast up into the stone highland; west and out along the cold road to the sea and back up to its snow; south down the long cold coast into the warm, dry west; up the Step and down to the sea-gate; east through the swamp gap and down the great river; then in to the forest at the heart. Cold, high and drowned to warm, low and lush, in unlock order.

**Sea ways from the Landing** (for the Chart; every trip starts at home): west along the Cold Coast (600,180) (520,150) (400,145) (290,140) (180,180) (120,250) (140,325) to the Sound's mouth and the Long Coast; or east round the Grey Horn and down the Morning Sea coast (760,140) (880,150) (875,450) (900,700) (910,850) (940,1050) to the Siltway's delta. The kingdom used both; the people went home by the west.

---

## 7. The Landing and the Waystones

**The Landing** is described in §5. It is the one point from which every water can be reached by real water (up the Sluice Run, or by sea west and south, or east and south), and the one place the mist's way home always leads.

**The Waystones (603, 186).** Sixteen stones in four arcs, one arc per reach, on the sill under the ferry gate's arch. Each is carved with its water's glyph, in road order, so the sill reads as the journey in miniature. A stone lights when its lake map is bought, and burns gold when its legend is landed. On the Chart they are drawn as four small arcs at the Landing's corner of the sheet, mirroring the road.

---

## 8. Places that make the world feel big (none playable)

| place | kind | x, y | note |
|---|---|---|---|
| The Sunken Gate | ruin (the capital) | 585, 238 | the capital's gate and towers on the Mossmere's north shore; the great lantern hung in front of it |
| The outer wall | ruin (wall on sea cliffs) | 600, 200 | the kingdom's wall along the highland's north cliffs, x 520–690; the Sluice Run and the ferry stair pass through it |
| The great sluice | ruin (sluice gate) | 594, 214 | in the outer wall under the Sluice Run's fall; shut since the night the lantern fell |
| The Hundred Tarns | lakes (glacial tarns) | 470, 455 | rock-basin tarns on the highland south of Glasswater, iced in winter |
| A highland tarn | lake | 660, 262 | east of the Mossmere, behind the outer wall |
| A crater lake | lake | 730, 330 | an old volcanic crater on the Eastern Downs, kin to Sporewood's vents |
| The ice-lake and the royal weir | lake and ruin | 230, 212 | the proglacial lake (228,205) held by the royal weir (236,222); the Thin Water's upstream end |
| The Pale Gap | pass | 305, 385 | a glacier-breached notch in the Spine, lower than the Pallid Deep, so the Deep drains west |
| The Pyre Peaks | snow massif | 262, 628 | about 4,200 m; their glaciers feed the Pyre |
| The temple stairs and pyres | ruin (shrine) | 312, 580 | Pyrefall Gorge's stairs into the river, where the kingdom burned its dead |
| The Lamp Rock and the last lighthouse | island | 110, 440 | the kingdom's last lamp; its beam turns over the Lampless Sea |
| The far isle | island | 55, 495 | higher, in cloud, with waterfalls; nothing beyond it is drawn |
| The northern isles | islands | 450, 118 | small bare islands off the Cold Coast, seen from the ferry gate |
| West-face streams | rivers | 200, 470 | short steep rainforest rivers off the Spine's west face, e.g. (290,460) (220,470) (140,470) and (250,640) (210,660) (165,665) |
| The Long Coast | coast and sea passage | 145, 600 | from the Last Light to the Reef Bay through the Fold: (100,452) (115,520) (125,600) (140,680) (138,740) (160,780); skerries and fjords in the north, cold desert cliffs in the south |
| The Turn | sea front | 165, 775 | the Reef Bay's north headland, where the cold current swings out to sea and the warm countercurrent meets it |
| The Reef Bay | bay | 185, 790 | where the Rush comes off the Step; the reef keys at (132,752) |
| The lock stair and its two towers | ruin | 240, 806 | the broken barge stair down the Great Step; the haul-way portage beside it |
| The great dam | ruin | 272, 822 | the fen's dam on the Step's lip, one amber lamp, its barge lock |
| The salt pans | seasonal lakes | 400, 930 | shallow pans on the Terrace that fill after storms and dry white |
| An empty town by the salt pans | ruin | 418, 912 | a kingdom town whose wells failed; on no sheet |
| The sea-gate towers and shipyard | ruin (port) | 225, 1010 | the great sea-gate across the Salt Gate's mouth, the drowned sluices and the unfinished hulls |
| The barge road's mile-posts | ruin (markers) | 600, 1102 | pale stone posts from the Canal Mouth to the delta; their numbers count down toward the forest |
| The Seam | confluence | 758, 1068 | black Inkwood beside brown Siltway, unmixed for miles |
| Siltway oxbows | lakes | 605, 1118 | cut-off meanders at (560,1125) and (650,1112) |
| The clear river | river | 482, 960 | a clear-water tributary from the Middle Hills' south slope to the Siltway: (470,880) (482,960) (500,1040) (520,1104). Brown main stem, black Inkwood, clear tributary: the basin's three waters |
| The Southern Hills' river | river | 500, 1180 | (470,1250) (500,1180) (540,1112), into the Siltway's south bank |
| A southern lake | lake | 430, 1210 | in the Southern Hills |
| The Siltway delta | delta | 900, 1080 | lobes and barrier isles (950,1140) on the Morning Sea; the old toads dig clams in its beds |
| The stilt village | village (lanterns lit) | 830, 985 | Lanternroot's stilt houses; Murk's kin, unseen |
| A small lake in the Middle Hills | lake | 520, 770 | at the rain divide |
| The Middle Hills' gulf river | river | 590, 735 | (540,760) (590,735) (640,705), into the gulf's head |
| The east-coast forest river | river | 720, 815 | (640,830) (720,815) (800,800) (860,810), to the Morning Sea through wet forest |
| The Morning Gulf | sea (gulf) | 760, 680 | a long warm-current sea deep into the continent; on no sheet |
| A drowned town at the gulf head | ruin | 662, 690 | roofs under the gulf's head waters; room for a later sheet |
| The Morning Isle | island | 947, 638 | off the gulf's mouth, at the Chart's edge |
| The Downs river | river | 712, 470 | (640,300) (680,380) (712,470) (735,560) (748,610), into the gulf |
| A north-flowing stream | river | 720, 210 | (700,250) (720,210) (740,170), to the Cold Coast |
| The Grey Horn's watchtower | ruin | 858, 140 | at the north-east peninsula's tip |
| The Low Horn | peninsula | 612, 1312 | tropical hills and savanna; on no sheet |
| The south-west isle | island | 215, 1242 | off the Low Gap's south coast |

The east (the Eastern Downs, the Morning Gulf, the east-coast forest, the Morning Isle), the Low Horn and the world beyond the far isle stay blank on the Chart for good: room for later sheets, never a promise of anyone there.

---

## 9. Hydrology and physical checks

1. **Every river runs downhill and crosses no ridge.** The Kingsflow falls from Glasswater (500 m) to the sea. The Pyre falls from the Pyre Peaks' icefall across the Pale Flats (560–700 m) to the Pallid Deep (520 m). The Pale Run falls from the Pallid Deep through the Pale Gap to the sea. The Thin Water falls from the ice-lake (~120 m) to the Sound. The Rush falls from the Middle Hills (1,400 m) to the fen (~640 m) and over the Step to the sea; the Sweetwater takes the gentler way south. The Siltway falls only about 10 m over its last ~720 km, a great-lowland gradient. The canals are the kingdom's own works, and they cross divides only at low summits fed by water (the King's Cut by the Pallid Deep; the Straight Canal by its millstream), as real summit canals do.
2. **The Pallid Deep drains west through the range.** It is a glacially overdeepened trough on the range's dry lee side, floor below sea level (the Bottomless), draining through a breached gap to the wet coast, as some real lee-side lakes drain through their range to fjords.
3. **Pyrefall can be greener than the lake it feeds** (step 7 against step 3) because cloud banks against the Pyre Peaks and the spray keep the gorge's walls wet while the steppe below is in rain shadow.
4. **The Rime Sound is a true fjord**: an ice-carved valley drowned by the sea on a westerly-facing coast, a sill at its mouth, deep inside, with a tidewater glacier at its head fed by a high ice field and westerly snow at about 50°N (design note: as on real cold-current, high-ice coasts at that latitude).
5. **The Thin Water braids because it is ice-fed**: plenty of sand, discharge that swings with the melt, a low gradient across an outwash valley, entering the fjord head over a sand delta beside the glacier.
6. **The Drift Line** is a convergence front where the Sound's cold, fresher outflow meets the southward coastal current; weed and wreckage gather on such fronts.
7. **The west coast is dry** from the Turn to the Low Gap because the Terrace and the coast lie in the trades' lee and the Middle Hills' rain shadow, with cold water just to the north. That is why the Thunder Stair has heat lightning and no rain and lives on spray, why the bay is clear (no silt) and why the fen's papyrus is an oasis of river water.
8. **The reef lives where coral can**: on the warm side of the Turn, in the countercurrent's clear warm water at about 6°N, up-current of the Rush's mouth so the river's silt is carried away.
9. **Rushlight Fen is an inland delta** formed where the Rush slows on the flat Terrace and drops its sand at the reservoir's head; it has two outlets because the kingdom built the dam on one and fed the other, the Sweetwater, to supply its sea-gate.
10. **The Salt Gate is a funnel estuary** at the fall line where the Step dies out; the funnel amplifies the tide (the hard ebb and flood that turn each evening), the water above the fall is sweet, and the brackish tropical coast grows mangroves.
11. **Lampmoss Slough is a canal summit** across a swampy watershed a few metres high; summit water barely moves, which is why the millstream "barely moves", and the easterly rains reaching through the gap make its swamp forest real.
12. **The Siltway** is brown with silt from the Southern Hills and the Step's end, slow and meandering (the oxbows), with floating meadows on its banks, crossing a wet basin to a delta on the windward coast. At the Seam the black and brown waters run side by side unmixed because they differ in silt, warmth and density.
13. **Lanternroot is brackish** behind a barrier spit with one tidal inlet (salt) and the delta's north arm (fresh). Its orchard drowned because a delta's edge sinks when nobody banks it.
14. **The Inkwood is a true blackwater river**: a flat forested basin on sandy soils gives little silt and much tannin from leaf litter; its forest floods each wet season; the Monsoon Cut is the kind of seasonal overflow that links a river and a lagoon across a flat coastal plain.
15. **The drowning is physical everywhere.** The kingdom held its water back, and every drowned work is one that went unkept: the great sluice that shut when the lantern fell (the Mossmere), the broken royal weir (the Thin Water), the broken lock stair (the Thunder Stair), the mole that let the sea back over reclaimed land (the Waxen Reef), the open sea-gate and drowned sluices (the Salt Gate), the canal's broken weir and lock (Lampmoss Slough), sunk barges on an unkept barge road (the Siltway), the unbanked delta edge (Lanternroot), the broken dikes in the forest (the Inkwood). "The water rose to look for it" is a folk saying; this list is how it happened.
16. **Age.** Every drowned work is about four hundred years old. Coral over a harbour town and a forest through an orchard need centuries, which agrees with DESIGN's "long ago".
17. **The river ends match their layouts** (`WATERS.md` §4.7): the Thin Water ends at the weir upstream and in mist over the sand delta downstream; Pyrefall Gorge at the icefall upstream and where the gorge closes toward the flats downstream; the Thunder Stair at the Throat and the falls below the dam's foot upstream and at the calm reach toward the bay downstream; the Salt Gate at the sweet pool under the fall line upstream and at the bar downstream; the Siltway at the Seam upstream and past the great bend into mist downstream; the Inkwood at Rootgate Creek's little fall upstream and where the trunks close toward the Seam downstream.

**What this file fixed in the map lane's geography.**
- **Scale.** A compact, evenly scaled continent cannot run from tidewater glaciers to rainforest, and an evenly scaled continental chart would put the four old-kingdom lakes hundreds of kilometres apart. Fixed by the road-chart scale (§1): the kingdom inset, the north lobe, the Fold and the south lobe, with true distances and latitudes.
- **The north is cold maritime, not polar** (about 51°N, a cold current and a high ice field), which is enough for a tidewater glacier and keeps the Landing's coast real. **The equator moves to about y 1100**, through the Siltway's great bend.
- **The reef.** Coral does not grow on a cold-current coast; a warm countercurrent now meets the cold current at the Turn, and the reef lies on its warm side.
- **The Pale Flats** sit at 560–700 m, above the Pallid Deep, so the Pyre really runs down into it.
- **The drowning** is given a physical cause at every water (item 15), and the Mossmere's in particular (the lantern's weight held the great sluice open; its fall shut it).
- **Reaching a far water in an evening**: the mist's way (§1), so the real distances can stay real.
- **Two gates**: the Landing's arch is the ferry gate; the great sea-gate is the Salt Gate's.

---

## 10. The Chart: how the map is revealed, and a style brief

**How it is revealed** (`LORE.md` §9.10; SPEC §5.1 rule 5 holds throughout: a water you do not own is not drawn).
- **The first sheet.** The Landing, the outer wall, a strip of the Cold Coast and the Sluice Run up to the Mossmere, on bare paper under a lavender wash. No coastline, no names elsewhere.
- **Each lake map** is pinned at its true place on the continent with a short ink stroke: its water, its landmark drawn small, its places' vignettes and glyphs, its lamp as an amber dot, its Waystone glyph, the road from the water before it (a spine with flow arrows; the lock stair and the haul-way as small hatched steps; a sea passage as a dotted sailing line), and the coast and relief that water can see.
- **The continent assembles in road order**: the stone highland after reach I; the Spine, the White Crown, the fjord coast and the sea out to the far isle's cloud after reach II; the Long Coast through the Fold, the dry west coast, the Great Step and the Terrace after reach III; the Low Gap, the whole southern basin, the delta and the Green Heart after reach IV.
- **Where an owned road runs on** into a water not yet bought, it fades into a small lavender wisp with no name and no shape. The next water is the rolled, sealed sheet on Murk's shelf.
- **Each reach's sheets are in a different hand** (court surveyors, funeral priests, harbour-masters, barge pilots, and Murk's own last sheet), and a wordless border picture is added when a reach's fourth lake map is bought (`LORE.md` §9.10).
- **At the ending** the amber lamp dots light gold one by one from the Inkwood back to the Landing.

**Style brief: an old hand-drawn chart in the game's palette.**
- **Paper and wash.** Old vellum, cool and pale, under a soft lavender wash that is deepest over the north and over unknown paper. The sea is laid in night-violet washes, darkest offshore (the deep sky and water family of `WATERS.md` §1: about #2f2d65 to #7e81b4), with a pale lavender coastline halo (about #bab2ee). No hard digital edges; the ink feathers a little where it meets the wash.
- **Ink.** One sepia-umber line weight for coasts and rivers, finer for contours and hatching; hand lettering in the game's ink style, small capitals for regions, italic for waters. Names appear only on owned sheets.
- **The north.** Night-violet and lavender: stone drawn as fine grey hatching, the White Crown as stippled white, the Spine as old-style hachured ridges, the tarns as small violet ovals. Green only as a trace (a few moss ticks at Sporewood).
- **The greening.** Green lives **only in the ink of living things**, never in the paper, the washes, the lines, the lettering or any button, so the Chart keeps SPEC §11's rule that green never enters the UI (the lead should confirm this reading). The plant marks thicken and green step by step along the road, following the foliage track of `WATERS.md` §1 (olive about #58634b in the highland, through #537347 at the gorge and #4b7a45 at the fen, to deep green about #3e8747 in the Inkwood): first a few moss ticks, then fir marks on the fjord walls, then reed and papyrus strokes, palm stars on the reef keys, mangrove knots along the Salt Gate and the lagoon, and finally the Green Heart drawn as a dense canopy of tiny tree crowns over black water.
- **Candle amber** (about #e8ac4c): the route and the Wicks' lights. The Lamp Road is a fine amber line along the waters you own; each kept lamp is a small amber dot with a soft glow; the Landing's hearth is the warmest point on the sheet. At the ending they turn gold.
- **The one green light.** Murk's lamp is drawn as a tiny sage-green dot at the Landing, and its twin at Lanternroot once that sheet is owned: the only green that is a light.
- **The Fold** is a narrow band of small repeated wave marks on the sea and dune marks on the land, drawn across the continent, the chart-makers' "this goes on a long time".
- **No ring or disc** round any mark, the raft or the Wick, ever. No scale bar; each sheet's hand is its scale.
- **Margins.** Blank vellum beyond the drawn sheets: no sea monsters, no compass flourishes beyond one small, plain compass rose in the corner by the Waystone arcs.
