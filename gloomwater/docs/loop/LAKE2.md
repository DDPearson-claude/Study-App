# Lake 2: Sporewood Pools under the loop, and the gear loop across waters (design v1)

*Design only: no file in `src/` or `tools/` changed with this document. Written 17 November 2026 on `gw-lake2-design`, from the dev
branch at 29cd74b (M1: the Mossmere and the home barge, shipped under `GW_LOOP`). It binds with SPEC v8.10, M1, WATERS v7.1, ROSTER,
GEAR-GATES, FINDS, LOST-TACKLE and WATERCRAFT; where it changes one of them, the change is named here and in §12, and the owner's lane
writes it into that file when it builds. Figures marked* measured* come from the scratch sim of §8; figures marked *est.* are hand
figures.*

*Revised on `gw-lake2` by lane D1 (17 November 2026, the data shape): the user's answers to §11 override this design where they differ;
§0A lists them and every section they change carries a note. Figures marked *measured (D1)* come from §8.3's scratch run.*

---

## 0. The user's words, and what each becomes

| # | the user, 17 November 2026 (verbatim) | what this design does |
|---|---|---|
| 1 | "Lake 2, the next water on the road, so play-testers have somewhere to go." | Sporewood Pools ships under the loop as a real second water: its open water, four places, two giants, its legend, its own shop, its own sound and its own look (§3–§7). The smallest build that does it (§9); later sheets and extras wait (§10) |
| 2 | "Make sure not very many fish repeat in each water." | No Mossmere fish lives at Sporewood. The one fish in both waters is the Nightbloom Carp, a rare guest of the Mossmere that a found notebook brings (as LOST-TACKLE already ships it). Three kept built species that would be a second puffer, a second koi and a fourth perch-built fish are left out of this edition (§2.2) |
| 3 | "And make sure each new fish looks completely different from any related version of that fish." | Every Sporewood fish with a relative in the Mossmere gets a different body plan or a different build of the plan: silhouette, head and mouth, fins, tail, markings, colour and size (§2.3). Three new plans (disc, bream, tuna) and new parameters on five built ones |
| 4 | "Make sure the next lake has more greenery than the moss mere also make sure its more of a natural shaped design not just a geometric shape. Its important to feel very different from the previous lake" (binding) | §1A, point by point: far more green, an irregular two-pool basin with coves, a neck, points, a spit and six islands, drawn so on the Chart, and different from the Mossmere in twelve named ways |
| 5 | "I think the gameplay loop from the gear purchase perspective is at the next lake you lose everything you bought but keep permanently a portion of the stats you got. Anything you found whilst fishing you keep permanently and you can change rods and reels at your leisure in an options menu. Gear from murk at the new location needs to perform a similar job but feel different. There should also be completely different lures etc on every new map." (binding, from Lake 2 on) | §5, the gear loop across waters: bought tackle stays behind and a third of its Hold (and of the rod's cast) is carried for good; found things travel; a Tackle screen; Murk's Sporewood shelf does the Mossmere's jobs in Sporewood's own materials; every lure and bait at Sporewood is new |

### 0A. The user's answers (17 November 2026), over this design's defaults

| # | the answer | what changes |
|---|---|---|
| 1 | The raft's parts (oars, keel, lantern) and the hold's slots **are bought gear**: they are left behind at the tow, with a share of their stats kept like the rest. The barge's own home items (the Order Board, the lights, the Bait Bed…) stay with the home | **§5's default is overridden** (§5.2's row "the raft's parts and the hold travel" and §11 question 2's "No"): at the first tow the bought Oars, Keel and Lantern levels and the bought hold slots stay at the water left; a third of each is carried (§5.3). Sporewood's shelf sells its own creels (Hold 4 to 7) and its own raft parts (§7.1), doing the same jobs in its own materials |
| 2 | Sporewood's first evenings must not punish: on the first evening at Sporewood at most about one hooked fish in five gets away, and a trip earns at least about 60% of the Mossmere's last pace; the carried share, Sporewood's early prices and values, its caps for the start kit and its first buys are the knobs | the first evenings at a water reached by a tow (`LOOP.arrival`): over the first three a fish over the gear's cap lands at the cap (GEAR-GATES' first-evening rule) and the water's Fight term is eased (−10, −6, −3 off its 7), then whole; the creels and the raft parts priced so the empty shelf stays inside 3–5 h. *Measured (D1)*: evening 1 loses **20%** of hooked fish and earns **73%** of the Mossmere's last trip (**119%** of its clams a minute) (§8.3). The carried share stays a third. *Measured on the game's tables (D2, §8.4)*: evening 1 loses **15%** of hooked fish and earns **65%** of the Mossmere's last trip (**102%** of its clams a minute), with Sporewood's value tier raised **11 → 12** (at 11: 57%) |
| 3 | The design's other defaults stand: about 12% green by day; Cut Strip at every water; on the way back the Mossmere's lures wait; the three repeating kept species left out; a third carried; the map at 2,800; Hold 7 on Sporewood's shelf; and no swapping fish, ever | as designed (§1A, §5.7, §6.3, §2.2, §5.3, §6.1, §7.1) |

Lane D1's renames (the names rule and the originality scan, which every word in `src/` passes): the plan written **tuna** here is
**`finlet`** in the code and in `roster.json` (the word is a research name, which `src/` never carries; ROSTER §4 notes it), and the glow
and night bait written *Amber Grubs* is **Amber Larvae** (`amber_larvae`; "grubs" is another game's word). The place ids are `lullaby`,
`gill_harp`, `veilwater` and `mothers_cup`.

---

## 1. What is there, and what the loop needs

### 1.1 Sporewood in the code today (29cd74b)

| part | where | state | under the loop |
|---|---|---|---|
| the zone | `data.js` `ZONES[1]` (`id: 'sporewood'`, "A Garden That Forgot the Sun") | built for the old game: `radius 65`, `layout: 'twoBasins'`, a straight line of four round "Cap Reef" islands down x = 0, three round lily caps, eight stalk pillars in two square groves, five docks, the Mycelium Veil gate | **its geometry is replaced** (§3.1): it is the geometric layout the user does not want. Its palette, grade, description and name stay |
| the walk map | `ARENA_V2.sporewood` (the Rootstool, the Gillback, Root Cloister…) | old walking layout, flag-gated | not used by the loop |
| the world theme | `world-art.js` `theme === 'sporewood'`: the `KIT` colours (rock, violet moss, cap ochre, gill glow), the mushroom builder (`P.mushroom`: stalk, cap, gills), pods, shelf fungus, lily caps, key light (−56°, 42°) | built and good | **kept**: the cap trees, the Lantern Stalks and the Mother Cap are built with it. The lily caps become leaf and lily rafts (§3.3) |
| world-layout | `world-layout.js` `buildLayout`: a **polar** shore, `shoreR(angle) = R·(1 + ring noise)`, plus one notch (the brook) | a star-shaped shore: every ray from the centre crosses it once | **cannot draw a neck, a cove that turns back, or a spit.** The loop needs an outline shore (§3.1, lane W1) |
| species (old game) | `SPECIES_V3`: Sporebelly Puffer, Plumgill Perch, Capshell Crayfish, Velvet Ray, Threadling Eel, Mildew Angler, Sleepspore Jelly, the Drifting Grove, Harpstring Eel (place), Hushcap Koi (place), Nightbloom Carp, the Remembered Sun | built records and built models on the old plans | roster fish re-founded by ROSTER §5; kept ones chosen in §2 |
| roster fish | `docs/loop/roster.json` §3.2: twelve fish | design data; only the Nightbloom Carp is exported (`src/roster-shipped.js`, as the Mossmere's guest) | the export grows by eleven (§2) |
| fish models | `models-fish.js`: minnow, perch, carp, koi, pike, eel, angler, puffer, ghost, leviathan, ray, crayfish, jelly; loop plans lamprey, sturgeon, trout, catfish | — | needs **disc, bream, tuna** and new parameters (§2.3) |
| gear and bait | built `LURES`: Spore-Lamp Fly, Moth Popper; built `BAITS`: Spore Cake, Glowcap Bulb; `TACKLE` T3 "on sale Sporewood" (Glassreed, Glass-Gut, Whisper Drag) | old game | the Spore-Lamp Fly, Spore Cake and the Glowcap Bulb are kept as Sporewood's own; everything else of Sporewood's shelf is new (§7) |
| sound | `audio-music.js` `sporewood` (the score), `audio-v3.js` lake multiplier | built | the score is kept; a Sporewood bed like `audio-mossmere.js` is new (§3.7) |
| the Chart | `chart-art.js` bakes sheet 1 only; Sporewood is the sealed sheet, "Coming soon" (`LOOP.shipped = 'mossmere'`); `tools/world-map/canon.mjs` draws Sporewood as four blobs | built | sheet 2 is baked; the blobs follow the new outline (§6.2) |
| keys and tow | `LOOP.access.gear.sporewood = 'rod:1'`, the list (`listFor`), the tow component (`playTow(leg)`, `LOOP_TOW`), `meta.loop.barge` | built and tested by the opening | used as built; the way back by the lamps is new (§6.3) |
| finds | FINDS §5.2 names Sporewood's set (seed jars, a bee-skep lid, a brass trowel, the Seed-Keeper's Casket; three parts; three looks) | design only | five treasures ship now; parts, looks and a lost-tackle set later (§7.4) |

### 1.2 What the loop needs that does not exist

1. **An outline shore** for a natural basin (the polar shore cannot), used by the water, the banks, collision, depth, the areas, the
   wildlife, the mooring checks and the Chart (W1).
2. **A greener world kit**: WATERS §5's vegetation kit is designed, not built (the Mossmere is lush 0). Sporewood needs moss carpets,
   ferns, reeds and grasses, lily and leaf rafts, hanging strands, bushes and fireflies (W2).
3. **Per-water gear**: today tackle is one global ladder (T0–T6), lures one global list, the hook table one set of columns
   (`watercraft.HOOK_ITEMS`). The loop needs each water's own tackle tiers, lures, tins and hook columns, the carry and the reset at
   the tow (D).
4. **A Tackle screen** to change rods, lines, reels and lures at leisure (G).
5. Sporewood's data under the loop: `LOOP.waters.sporewood`, its places, species, hook rows, areas, mooring, words, its sim mode (D).
6. Eleven fish records and fourteen looks (F), its Chart sheet and the way back (C), its shop, orders and finds words (S), its sound
   bed (A).

---

## 1A. Greener, natural, different (the user's second message, point by point)

### (1) More greenery than the Mossmere

The Mossmere stays exactly as approved (lush 0, a trace of green). Sporewood is pushed **well past WATERS' step 1** (its "a little
moss", 3% green by day): it takes about the green of the ramp's step 4–5.

| | the Mossmere | Sporewood Pools (this design) | WATERS step 1 (the old plan) |
|---|---|---|---|
| green share, day · dusk · night (hue-report, medium) | ≤ 1 · ≤ 1 · ≤ 1 | **12 · 10.5 · 6.5** (±10%, at least ±0.5) | 3 · 2.5 · 1.5 |
| new plant instances (high; medium 0.7×, low 0.4×) | 0 | **about 1,360** (table below) | 142 |
| new triangles (high) | 0 | about 23k | 2.4k |

What grows, and where (WATERS §5.1's archetypes; the counts on high):

| kind | variant here | count | where |
|---|---|---|---|
| ground tuft | **moss cushions and moss carpet** (the main green): soft domes of olive-to-green moss, merged into carpets on every bank top, island top, root and cap foot | 420 | 0–4 m up every bank; whole carpets on Mossback Isle, the Mother's Foot and the neck's banks; `mossG` vertex moss on every upward root and stump face |
| frond cluster | **ferns** (shuttlecock and curled fiddleheads; a few tree-ferns 2–3 m on the bluffs) | 150 | the Fern Bluff, the Seep's ravine, the neck's banks, under every cap tree |
| emergent blades | **reeds and tall grasses** (bronze-green reed, pale sedge with cream seed heads) | 360 clumps | the Reed Flats (the south shore, low and wide), the coves' heads, round the Tussock |
| floating pad | **lily rafts and leaf rafts** (round lily pads in rafts of 6–20, and big fallen cap-leaves floating); 30 cream and rose flowers that open at dusk | 150 + 30 | the Lullaby's cove, the Veil inlet's mouth, the Reed Flats' shallows |
| hanging strand | **vines, moss curtains and hanging roots** from cap rims and bank trees, over the water | 90 | the Veil (a whole curtain), the Gill Harp (the gills themselves, §3.4), the bluff trees |
| bush | **leafy shrubs and bramble mounds** (rounded, dark green, with cream blossom) | 40 | the bank tops between the cap trees, the Landing |
| tree | **cap trees** (the built mushroom builder, now moss-footed and fern-skirted) and **a few broadleaf bank trees** leaning over the water | 14 near caps + 6 broadleaf + 40 far crowns | the bluffs, the east pool's north shore, the far rim |
| (free) | `mossG` moss on every root, stump and stalk foot; a green weed film in the shallows (water shader); **fireflies** (pale lime, no light) | 120 fireflies | fireflies over the reeds and ferns from dusk, never over open water, never within 6 m of the raft |

**Green light under the caps**, honestly inside WATERS §3.1 (air and light are never green): the caps are lit from beneath by their
amber gills, the moss and fronds under them are backlit (the leaf-translucency term, `leafHi` × 0.3 at edges facing the key), and the
water under the caps mirrors the green banks. The green is on surfaces; the light stays Clear Night's.

**Kept from the ember garden**: the violet-magenta night haze, the plum water, the autumn-ochre caps with their amber gills, the gold
spores, the rose nebula, cream blossom. **Kept from Clear Night**: the violet-dusk sky, the lavender moon, the candle as the one
saturated warm light, sharp air (fog density 0.0065, inside 0.0042–0.0072).

**The phones' cost** (WATERS §5.2, §5.4): flora merged by material in culled cells (a 3 × 3 grid of about 60 m cells over the 170 m
basin; two materials a cell), opaque geometry (no alpha test), sway in the vertex shader only, all of it compiled out at lush 0 so
the Mossmere's programs and its geometry hash are unchanged. Budget: **main-pass world ≤ +14 calls on high, +9 medium, +4 low**
(low draws only the unmirrored material; fireflies one night mesh); medium **≤ 230 calls and ≤ 320k triangles** in all passes;
phone cpuMs on the Sporewood evening no worse than the Mossmere's with its four banks standing (T148's line). The place banks use
the low layer set (3 layers) on medium and low.

**The ramp** (WATERS §1): this breaks its "1.5–5 points a step" rule once, by the user's binding words. Default: Sporewood takes a
measured target of 12% by day and every later water is re-stepped from there when it ships (still rising, still never neon). Question
1 (§11).

### (2) A natural shape, not a geometric one

The Mossmere's sheet is a near-circle (R 60 with a small ring noise). Sporewood is **two pools of different size joined by a narrow
bent neck**, with coves, inlets, points, a spit and six islands of different sizes, and banks that rise and fall. The authored outline
(world metres, x east, z toward the camera at the spawn; a closed curve through 45 points, §3.1) measures:

| | the Mossmere | Sporewood Pools |
|---|---|---|
| outline | a near-circle (isoperimetric ratio about 0.98) | **0.37** (a long two-lobed shape; a circle is 1.0) |
| extent | 120 × 120 m | **170 × 90 m** (x −90…80, z −46…44) |
| water | about 11,300 m² | **about 8,700 m²** (8,960 less the islands) |
| shore | about 380 m | **about 550 m** (+45%: more bank in every frame, so more green) |
| islands | built isles and the Gatehouse | **six, of six sizes**: Mossback Isle (16 × 10 m), the Mother's Foot (r 5), Rootknot (r 3), the Two Stools (r 2.5 and 2), the Tussock (r 1.5) |
| the narrowest water | — | **the neck: 11 m** (the raft is 3.2 m) |

Its features, west to east: **the West Pool** (the larger, about 75 × 70 m, shallow and reedy to the south); **Lily Cove** (an inlet
north-west, the Lullaby); **the Fern Bluff** (a high mossy bank, 5–7 m, north-west); **the West Point** (a point of roots and moss);
**the Veil inlet** (a narrow backwater to the south-west, behind a curtain of moss: the Veilwater); **the Reed Flats** (the low south
shore, 0.3–0.8 m, wide reed beds, the Root Weir where the water leaves); **Mossback Isle**, **the Two Stools**, **the Tussock**;
**Harp Point** and **the neck** (25 m long, 11–13 m wide, bent, its banks 2–3 m and grown over, the cap trees' gills hanging down
over it: the Gill Harp); **the East Pool** (smaller, deeper, about 65 × 65 m); **the Tongue** (a spit of roots and sand reaching 16 m
south from its north shore); **Rootknot**; **the Mother's Foot** with **the Mother Cap** and **the Mother's Cup** (a deep sinkhole
under the cap: the only round thing in the water, and it is a natural well, not a drawn shape); **the Seep** (a small fall into a fern
ravine, north-east: the inflow); **Rootfoot Landing** (a low cove south-east: the mooring).

**The Chart shows the shape** (§6.2): the sheet is drawn from the same outline polygon (not 120 polar samples), the islands as their
own small outlines, the bluffs with hachures, the Reed Flats as reed hatching, the Seep and the Root Weir as the water's in and out,
and the world map's Sporewood blobs re-drawn to the same two pools and neck.

### (3) It must feel very different from the Mossmere

| | the Mossmere (approved, unchanged) | Sporewood Pools |
|---|---|---|
| **outline** | one round open moat | two pools and a bent neck; coves, a spit, points, six islands of six sizes |
| **scale** | wide: you see across the whole water from anywhere | intimate: banks near on two sides; **you never see both pools at once** (the neck hides one from the other) |
| **the way the light falls** | open moonlight over open water; lavender rims everywhere | light in **pools and shafts**: moon coins through gaps in the cap canopy (a static dapple in the water shader), amber light falling from the gills under each cap, backlit fronds; dark water between the pools of light |
| **colour script** | lavender, slate, pale stone, ochre reeds, candle amber | **plum water, amber gill glow, deep moss and fern green, rose nebula, cream blossom**, candle amber |
| **the sky / vault** | the whole star field over the moat | **a ragged window of sky framed by cap rims** at the top of the frame; fewer stars (0.8), the rose nebula low; at least 12% of every frame is still sky (WATERS §3.2) |
| **the banks** | low stone rims and ruins | banks that **rise and fall**: the 5–7 m Fern Bluff, the 0.3 m Reed Flats, the neck's 2–3 m green walls, the Seep's ravine; earth, root and moss, no cut stone |
| **vegetation** | dun-ochre reeds and 75 pads | about 1,360 plants: moss carpets, ferns, reeds and grasses, lily and leaf rafts, vines and moss curtains, shrubs, cap trees, fireflies |
| **the mist** | lavender mist banks standing over the places | **low warm spore-haze** lying in the coves at dusk, rose-cream, thin, with a few gold spores lifting through it; the places' banks are tinted this way and sit lower (§3.3) |
| **the sound bed** | water's air, reeds, chains, a far bell, the mere's low tones | **drips from caps, the Seep's trickle, frogs from dusk** (a chorus at night), soft spore pops, the Gill Harp's single hummed note, the Veil's whisper, the Mother's Cup's slow breath (§3.7) |
| **landmarks** | the Toppled Bridge, the Bell Pool's bell, the Drowned Gatehouse, the sluice towers: **stone works** | **living ones**: the Mother Cap (a 30 m mushroom tree over the east pool, its gills lit), the Gill Harp (gills hanging over the neck like strings), the Veil (a moss curtain), the Seep's fall, the Lantern Stalks (glowcap groves), the living-willow gate and root-post jetty at the Landing. **No stone ruin, bridge, bell or tower** |
| **wildlife** | wick-moths, lampbills, the heron | **spore moths** (cream and amber, plum eye-spots) round the Lantern Stalks, **lily frogs** that sit on the rafts and plop in as the raft nears, **fireflies** over the reeds; drifting gill-flakes on the outflow (§3.6) |
| **the camera on the water** | the sail camera high and open | a **lower, closer camera** (eye −20%, fov +4°), and in the neck it tucks lower still while fronds and gill-strings pass across the top of the frame; the water feels narrow and held |

---

## 2. The roster: Sporewood's fish, checked by the user's two rules

### 2.1 The fish of this edition (fourteen)

ROSTER §3.2 gives twelve fish; the old game kept seven built species beside them (ROSTER §5). This edition ships **eleven roster
fish and three kept species**. Hours: day, dusk, night or any. *Plan* is `models-fish.js`'s builder. Sizes are ROSTER's (cm, the
hidden truth; the game shows pounds).

| | fish | relative in the Mossmere | rarity | plan | typical / record | hours | where | value |
|---|---|---|---|---|---|---|---|---|
| ★ | **The Drifting Grove** | none (no ray there) | legendary | **disc** (new) | 300 → 345 | day, dusk | the Mother's Cup (crown) | first landing 4,400 (the crown map ×2), later 1,760 |
| ★ | **Harpstring Eel** | Gloam Eel (eel), Hullkiss Lamprey (lamprey) | epic | eel (new build) | 77–112 / 210 | any, best at night | the Gill Harp (old) | the water's top giant |
| ★ | **Festival Puffer** | none | epic | puffer (new build) | 44–64 / 120 | night | the Veilwater (night) | giant |
| | **Lostsea Mackerel** | none (Kissmark Trout is the nearest hunter) | rare | **tuna** (new) | 75–105 / 190 | day, dusk | open water | rare |
| | **Downcast Catfish** | the Belled Matriarch (catfish) | rare | catfish (new build) | 75–105 / 190 | day, dusk | open water, deep | rare |
| | **Nightbloom Carp** | Weeping Carp, Rustfin Sucker (carp), Candlefin Koi | rare | carp (new build; its guest model changes too) | 71–100 / 180 | night | night water and the Veilwater | rare |
| | **Mildew Angler** (kept) | none | rare | angler (built) | as built | night | open water, under the caps | rare |
| | **Sleepspore Jelly** (kept) | none | rare | jelly (built) | as built | day, dusk | the Lullaby's own (day) | rare |
| | **Threadling Eel** | Gloam Eel (eel) | uncommon | eel (new build) | 64–86 / 150 | any | open water, roots and margins | uncommon |
| | **Cindertail Catfish** | the Belled Matriarch (catfish) | uncommon | catfish (new build) | 55–74 / 130 | any | open water | uncommon |
| | **Velvet Ray** | none | uncommon | **disc** (new) | 47–63 / 110 | any | open water; drawn at the Lullaby | uncommon |
| | **Falsesmile Barb** | Overbold Bass, Mossback Perch (deep-ish perch builds) | common | **bream** (new) | 21–27 / 45 | day, dusk | open water | common |
| | **Netcloud Fry** | Dusk Minnow, Likely Chub (minnow) | common | minnow (new build) | 6.5–8.5 / 14 | any | open water, in clouds | common |
| | **Capshell Crayfish** (kept) | Gutter Crayfish (crayfish) | common | crayfish (new build) | as built | any | open water, roots | common |

The value tier is the sim's draft 11 (the Mossmere's 7; SPEC §4.1's rule unchanged), the Fight term 7 (built). **Giants**: the
Harpstring at the Gill Harp and the Festival Puffer at the Veilwater; **the legend** in the Mother's Cup. The Emberbrood Snakehead
waits for the Puffball Vent (a later sheet, §10).

### 2.2 Repeats, and the repeats cut

| fish | where else | ruling |
|---|---|---|
| Nightbloom Carp | the Mossmere, **as a guest only** (the Lily Gardener's Notebook, LOST-TACKLE §4.2: the lily beds, at night, 3% of those casts) | **kept as the one fish in two waters**: a rare guest a find brings, as the user's own rule allows. Its home is Sporewood; its one model changes (§2.3), so the guest changes with it |
| Pilgrim Salmon, Hearthfish (old Wanderers that swam the built lakes) | the old game | **not at Sporewood** (the Pilgrim lives in Glasswater by ROSTER §5; the Hearthfish stays off the loop) |
| Sporebelly Puffer (kept, common) | — | **left out of this edition**: a common puffer in the same water as the Festival Puffer reads as the giant's small copy |
| Hushcap Koi (kept, rare, the Veilwater's own) | — | **left out**: a second koi after the Mossmere's Candlefin Koi. The Veilwater's fish are now the Festival Puffer and the Nightbloom Carp |
| Plumgill Perch (kept, common) | — | **left out**: a fourth perch-built fish after the Mossback Perch, the Overbold Bass and the Milkeye Perch |
| The Remembered Sun, Emberbrood Snakehead | — | **later**, with the Drowned Greenhouse and the Puffball Vent (later sheets) |
| every fish planned for a later water | — | none of Sporewood's fourteen is planned for another water (ROSTER: one fish per water) |

Nothing built is deleted: the three left-out species keep their `SPECIES_V3` records for the flag-off game and stay out of the loop's
pool, the list and the Journal's Sporewood page. Question 5 (§11).

### 2.3 The looks: every relative made completely different

*Built by lane F (§9.4): each look below as written, but for the Harpstring's strings (painted into its skin, not lit tubes), the Grove's
whip (shorter, so her disc reads the raft's width) and the plan written* tuna *(built as `finlet`).*

Each look is a modeller's brief: plan and parameters for `models-fish.js` (`ROSTER_ART[id].model`, read only under the loop), the
silhouette at a glance, colours in the Clear Night palette (plum, amber, rose, cream; glow only where named). The relative's look is
quoted so the difference is checkable side by side.

**Eels: Harpstring and Threadling, against the Gloam Eel and the Hullkiss Lamprey.**

| | the Mossmere's | Harpstring Eel (giant) | Threadling Eel |
|---|---|---|---|
| silhouette | Gloam Eel: a classic eel, slim, ink-blue, a long fin round the tail, lavender glow spots; Hullkiss: an eel-length lamprey with a round toothed mouth and seven lit gill holes | **a rope as thick as the Wick's arm**, 1.5× the Gloam's girth along its whole length, the body squarish in section; **a flat, blunt paddle head** wider than the neck; **no back fin at all**; **one long ribbon fin under the belly** from the throat to the tail tip, rippling | **a cord**: half the Gloam's girth, no paired fins and **no fins at all except a skin fold at the tail**; a tiny pointed head with pin eyes; **the tail ends in a point** |
| `eel` parameters | — | `girth: 1.5, head: 'paddle', dorsal: 'none', ventral: 'ribbon_full', section: 'square'` | `girth: 0.5, pects: false, dorsal: 'none', ventral: 'fold', tail: 'point', eye: 0.5` |
| markings, colour | — | plum-dark back, rose throat; **three lit strings down each flank** (rose-amber, the whole length) that brighten in the hum; no spots | **root-mottled**: olive-brown and cream blotches like bark, a pale cream belly line; no glow (the built model's pale glow goes) |
| size at a glance | Gloam 52–74 cm | 77–112 cm, the biggest fish of the open pools after the legend | 64–86 cm but a third the bulk: it reads as a root |

The lamprey's lit row is seven lavender points at the head; the Harpstring's light is three continuous rose lines over its full length
and it has a jaw. No two read as one another.

**Catfish: Downcast and Cindertail, against the Belled Matriarch.**

| | the Belled Matriarch | Downcast Catfish | Cindertail Catfish |
|---|---|---|---|
| silhouette | vast flat shovel head, a door-wide mouth, two bell-rope whiskers, an eel-taper tail, bronze, a bell in the skull | **shark-like**: a deep, high-shouldered body, **a tall pointed back fin like a shark's**, **a deeply forked tall tail**, a blunt rounded snout, **a catfish's barbels** (two pairs; the art pass, §9.11) | **bullet head** with **four pairs of long whiskers** fanned forward; a tall back fin and a small fatty fin; **a deeply forked tail that is ember-red** |
| `catfish` parameters | `head: 'shovel', whiskers: 2 long, tail: 'eel'` | `head: 'bullet_round', whiskers: 4, body: 'deep', shoulder: 0.42, dorsal: 'sail', tail: 'fork_tall', eye: 'low'` (the eyes set **below** the mouth line: "it has only ever looked where it will sink") | `head: 'bullet', whiskers: 4 pairs long, dorsal: 'tall', fattyFin: true, tail: 'fork'` |
| colour | tarnished bronze, lavender eyes | a dark plum back carried low on the flank (`counterLine` −0.38), a pale pewter belly, no glow | ink-plum body, a cream line from gill to tail, **the tail ember-red to amber**, a faint warm glow at its tip only at night |
| size at a glance | 260 cm and more | 75–105 cm, deep | 55–74 cm, slim |

**Carp: the Nightbloom, against the Weeping Carp, the Rustfin Sucker and the Candlefin Koi.**

| | the Mossmere's | Nightbloom Carp |
|---|---|---|
| silhouette | Weeping Carp: a standard carp with barbels, grey; Rustfin: a slim sucker with a down-turned mouth; Candlefin: a koi with long fins | **a giant barb**: **a huge head (a third of its length)**, **a high arched back**, **no barbels**, a small upturned mouth, a short deep tail stalk and a broad forked tail |
| `carp` parameters | — | `head: 1.55, headLen: 0.48, back: 'arched', archK: 0.72, barbels: 'none', mouth: 'up', scales: 'giant'` (coin-sized scales, each outlined; the art pass, §9.11) |
| colour | — | dark plum scales **edged in cream like petals**; at night the edges glow faint amber, "a bloom" (replaces the guest's lavender flank glow) |

**Minnows: the Netcloud Fry, against the Dusk Minnow and the Likely Chub.** The Fry is **a glass fish**: a clear, slightly milky body
through which **the dark spine and the eye show**, a single amber spot at the tail root, eyes a third of the head, 6.5–8.5 cm (a
third of the Dusk Minnow). `minnow` parameters `body: 'glass', spine: true, eye: 1.6, tailSpot: 'amber'`. On its card and in the show
it comes as **a cloud of five** (the show holds one; the other four are sprites of the same mesh, cheap).

**Crayfish: the Capshell, against the Gutter Crayfish.** The Gutter is a classic brown crayfish with banded big claws. The Capshell
is **a cap with legs**: a broad **domed carapace like a mushroom cap**, ribbed with gills under its rim, that hides the body from
above; **tiny claws**; **very long antennae with amber tips**; a short fan tail. Cream-ochre cap with plum freckles. `crayfish`
parameters `carapace: 'dome', claws: 0.4, antennae: 1.8, tail: 'fan'`.

**Bream-built: the Falsesmile Barb, against the perch builds.** **A plate on edge**: as deep as it is long, a blunt rounded head,
a belly keel, **a mouth of square, human-looking teeth** that shows when it gapes (the reveal), a scythe tail. Rose-bronze flanks, a
cream belly, plum fins. New plan `bream` (`depth: 0.95, jaw: 'square_teeth', tail: 'scythe'`). Nothing in the Mossmere is shaped
like it.

**The rest** (no relative in the Mossmere): **Lostsea Mackerel** on the new `tuna` plan: a rigid teardrop, two back fins, **finlets**
above and below a thin keeled tail stalk, **a stiff crescent tail**, larger since the art pass (§9.11: slim, `girth` 0.82, `tailK` 1.32);
a near-black slate back over a hard countershade line, dark plum bars down it, a cream belly; a sea fish
in a forest pool. **Velvet Ray** on the new `disc` plan: a near-round velvet disc as wide as a lily pad, **a dozen cream eye-rings**
on a plum back, eyes on two small turrets, a stout short tail with one sting. **The Drifting Grove**: the same disc nearly as wide as
the raft, a pointed snout tip, a whip tail with one barb, and **a meadow on her back** (an extras mesh of moss tufts, ferns and tiny
caps whose gills glow amber); the kin rule holds (she outgrows the Velvet Ray many times). **Festival Puffer**: a puffer the size of a
lantern, round, **a beak of four fused teeth**, short prickles, **an amber-ringed eye-spot on each flank**; puffed in the show it
glows amber through its skin like a paper lantern. **Mildew Angler** and **Sleepspore Jelly**: as built (their plans have no relative
in the Mossmere); the jelly's palette is kept, the angler's lure keeps its amber.

### 2.4 How each is caught (the hook table and the gear gates)

Sporewood gets its own hook columns (§5.5): **bare · Spore Cake · Amber Grubs · Cut Strip · Spore Moth · Ember Minnow · Root Jig ·
Spore-Lamp Fly · Seedpod Twirl**, with the found Gate-Guard's Button as a rule (grade 2 for every fish but the giants, the legend and
the two bait-only fish) rather than a column. Grades: 0 won't take it (a stray, never past 1 in 100) · 1 takes it · 2 likes it · 3
the right bait. GEAR-GATES' caps apply: grade 1 lands up to Keeper, 2 Prize, 3 Elder (Elders only where the water allows); the bare
hook and the Seedpod Twirl up to Keeper, Cut Strip up to Prize; the line by its total Hold (§5.6).

| fish | bare | Spore Cake | Amber Grubs | Cut Strip | Spore Moth | Ember Minnow | Root Jig | Spore-Lamp Fly | Seedpod Twirl | needs |
|---|---|---|---|---|---|---|---|---|---|---|
| Netcloud Fry | 1 | 2 | 1 | 0 | **3** | 0 | 0 | 0 | 1 | nothing |
| Falsesmile Barb | 1 | **3** | 1 | 0 | 2 | 0 | 1 | 0 | 1 | nothing |
| Capshell Crayfish | 1 | **3** | 1 | 2 | 0 | 0 | 2 | 0 | 0 | nothing |
| Threadling Eel | 0 | **3** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Spore Cake only (the plain bait, so it is on the list) |
| Velvet Ray | 0 | 2 | 1 | 2 | 0 | 0 | **3** | 0 | 0 | a bait or the jig |
| Cindertail Catfish | 0 | 1 | 0 | **3** | 0 | **3** | 2 | 1 | 0 | a bait, strip or lure |
| Lostsea Mackerel | 0 | 0 | 0 | 2 | 1 | **3** | 0 | 2 | 0 | **strip or a lure** (a hunter: never the bare hook or the free lure) |
| Downcast Catfish | 0 | **3** | 1 | 1 | 0 | 0 | 2 | 2 | 0 | a bait or lure |
| Mildew Angler (night) | 0 | 1 | **3** | 2 | 0 | 1 | 0 | 0 | 0 | a bait |
| Sleepspore Jelly (the Lullaby) | 0 | 0 | **3** | 0 | 0 | 0 | 0 | 0 | 0 | Amber Grubs only (not on the list) |
| Nightbloom Carp (night water) | 0 | 2 | **3** | 0 | 0 | 0 | 1 | 2 | 0 | a bait |
| ★ Harpstring Eel (the Gill Harp) | 0 | 0 | 0 | 0 | 0 | 2 | 1 | **3** | 0 | **a bought lure** |
| ★ Festival Puffer (the Veilwater) | 0 | 0 | 0 | 0 | 0 | 1 | 2 | **3** | 0 | **a bought lure** |
| ★ The Drifting Grove | — | — | — | — | — | — | — | — | — | her bait only: the Glowcap Bulb |

**The start kit at Sporewood** (the Seedpod Twirl and a tin of Spore Cake) opens every common and uncommon but the Velvet Ray's top
and the hunters; Cut Strip (free) opens the Mackerel, as it opened the Reedjaw Pike. **Sporewood's list** (the catch key to
Glasswater, computed by `listFor` under SPEC §5.5 (c)): its open water and the Lullaby and Gill Harp fish that bite on Spore Cake:
Netcloud Fry, Falsesmile Barb, Capshell Crayfish, Threadling Eel, Velvet Ray, Cindertail Catfish, Lostsea Mackerel (on Cut Strip:
the list player fishes the strip for a missing hunter, as on the Mossmere), Downcast Catfish, Mildew Angler (night): **9 fish**. Not on
it: the Sleepspore Jelly (Amber Grubs only), the Nightbloom Carp (night water), the giants, the Grove. *Measured* p95 45 min (§8).

**The areas** (`WATERCRAFT.sporewood`): the same ten area kinds, authored to the outline (§3.1): margin (the shallow edge all
round), reeds (the Reed Flats and the cove heads), pads (the lily and leaf rafts), stones **shown as "the roots"** (root snags, cap
stumps, the Tongue, Rootknot), dropoff (the shelf's lip), lane (a drifting line of spores across the open water at dusk, in place
of the wind lane), open, deep (the two pools' middles), inflow (the Seep), outflow (the Root Weir). The raw weights (margin, reeds,
pads, roots, dropoff, lane, open, deep, inflow, outflow):

| fish | weights |
|---|---|
| Netcloud Fry | 2, 1.5, 1.8, 0.6, 0.4, 2.2, 1.2, 0.3, 1.5, 1 |
| Falsesmile Barb | 1.5, 1.2, 2.5, 1, 0.5, 1.5, 0.8, 0.3, 2, 1 |
| Capshell Crayfish | 1.2, 0.6, 0.5, 3, 0.6, 0.2, 0.3, 0.2, 1.2, 1.8 |
| Threadling Eel | 2.2, 2, 1, 2, 0.4, 0.2, 0.3, 0.3, 0.8, 1 |
| Cindertail Catfish | 0.6, 0.8, 0.6, 2.2, 2, 0.6, 1, 1.2, 1, 2 |
| Velvet Ray | 1.8, 0.4, 0.8, 0.6, 1.2, 0.6, 1.6, 0.8, 0.6, 0.8 |
| Lostsea Mackerel | 0.2, 0.2, 0.2, 0.4, 1.5, 2.5, 2.2, 1.6, 1, 0.8 |
| Downcast Catfish | 0.3, 0.3, 0.3, 0.8, 2.2, 0.6, 1.2, 3, 0.6, 1 |
| Mildew Angler | 0.6, 0.8, 1.2, 2.5, 1.2, 0.2, 0.4, 1.2, 0.4, 0.6 |

The shares are baked by `watercraft.test.mjs --bake` on Sporewood's layout as for the Mossmere; the user's 1% stray rule, "every pool
bites" and "every fish can be caught" are proved there and in the sim, as for the Mossmere. The tells (WATERCRAFT §5) reuse their kinds
with Sporewood's makers: sip (Fry, Barb), splash (Mackerel, Cindertail), roll (Downcast at dusk), the bow wave (the giants).

---

## 3. The water

### 3.1 The outline, the banks and the depth (for the world lane)

*(As built by lane W1, §9.3: the Veil inlet is a real backwater, 49 points; the Mother's Foot at (59, 12); the banks are the ground
built from the field, whose iso-lines are the outline's offsets.)*

**The shore is an authored outline** (`ZONES[1].arena.outline`, read by world-layout only under the loop; the flag-off game keeps
its own Sporewood): 45 control points of a closed centripetal Catmull-Rom curve, sampled every 1 m, turned once at build into a
signed-distance grid (1 m cells over 184 × 104 m: about 19k floats, under 1 ms). Points, clockwise from the neck's north bank:

```
(-6,-2) (-12,-10) (-18,-22) (-28,-30) (-40,-33) (-46,-42) (-58,-46) (-66,-38) (-70,-28) (-82,-24) (-86,-12) (-80,-2)
(-84,8) (-78,20) (-82,30) (-90,38) (-76,44) (-64,40) (-50,37) (-40,42) (-30,33) (-18,26) (-10,14) (0,12) (10,15)
(16,24) (26,30) (34,38) (46,34) (56,30) (68,22) (76,10) (78,-4) (74,-18) (80,-28) (70,-34) (58,-32) (46,-30) (45,-14)
(40,-28) (32,-32) (22,-26) (12,-14) (6,-4) (0,1)
```

(checked: no self-crossing; area 8,960 m²; perimeter 549 m; the neck 11 m at x = 0; Lily Cove at (−52, −40); the Veil inlet at
(−84, 34); the Tongue's tip (45, −14); Rootfoot cove at (34, 36); the Seep at (80, −28); the Root Weir on the Reed Flats at
(−66, 41)). **Islands** are small outlines of their own (8–12 points each, irregular): Mossback Isle about (−50, −6) 16 × 10 m with a
4 m fern hill and a leaning cap tree; the Two Stools (−28, 14) and (−24, 19); the Tussock (−62, 22); Rootknot (22, −12); the Mother's
Foot (56, 10), the Mother Cap's stalk on it.

**The banks rise and fall**: a height profile authored at the control points and eased between: the Fern Bluff 5–7 m, the West Point
2 m, the Veil inlet's sides 3 m, the Reed Flats 0.3–0.8 m with a broad shallow shelf (14 m), the neck's banks 2–3 m with a narrow
shelf (3 m), the East Pool's north shore 4–6 m with cap trees, the Seep's ravine 3 m deep with a 2.5 m fall, Rootfoot Landing 0.8 m.
Banks are earth, root and moss (`KIT` rock tones under `mossG`); no cut stone anywhere.

**Depth** (a new `layout: 'outline'` in `world-layout.depthAt`): shore distance through the shelf (its width from the profile), then
two bowls: the West Pool to 0.8 at (−46, 4), the East Pool to 0.85 at (40, −4), the neck 0.6 (the Harpstring's mid-deep channel), and
**the Mother's Cup** a natural sinkhole to 1.0 at (48, 6), radius 6, its rim a mossy lip under the water, never a ring drawn on it.

**Everything that read the polar shore reads the outline** through one function, `shoreDist(L, x, z)` (it already exists, with the
notch): world-layout (`insideShore`, placements, the cliff and the bank ring), world-art (the shore strip and cliff band are built by
offsetting the outline outward, not by angle), the water's foam bake, collision, the raft's glides, watercraft-face (the reed arcs
become reed **runs by arc length** along the outline), actors-heron and the wildlife, `loop-rules.mooringChecks`, `ui-chart.waterGeometry`
and `chart-draw`'s `sideOf`. `shoreR(angle)` stays for the Mossmere (its programs and its geometry hash do not change; T-hash).

### 3.2 The places of this edition

| place | kind | where (x, z), radius | the card names | also there | the card's line (≤ 8 words) | price (base · shown) |
|---|---|---|---|---|---|---|
| **Sporewood Pools** (the lake map) | lake | opens the open water, the Lullaby and the Gill Harp | ★ Harpstring Eel; its seal: the Drifting Grove | nine open-water fish | "A harp in the Pools knows one song." | 1,400 · **2,800** (§8) |
| **The Lullaby** | day | Lily Cove (−50, −36), r 7 | Sleepspore Jelly (its own) | Velvet Ray (drawn ×3), Netcloud Fry | "Something sleeps under every lily raft." | opened by the lake map |
| **The Gill Harp** | old | the neck (0, 6), r 5 | ★ Harpstring Eel | Elders; Cindertail Catfish (drawn ×2) | "The gills hang down. One of them hums." | opened by the lake map |
| **The Veilwater** | night | behind the Veil (−82, 33), r 5 | ★ Festival Puffer | Nightbloom Carp (drawn ×3) | "Behind the moss, a lantern floats." | 1,200 · **2,400** |
| **The Mother's Cup** | crown | the sinkhole under the Mother Cap (48, 6), r 6 | ★ the Drifting Grove | — | "The Mother breathes. Big things breathe with her." | 2,200 · **4,400** |

Each place keeps the Mossmere's rules (SPEC §5.1): its mist bank until bought (here the low rose-cream spore-haze, §3.3), the lift,
good bites, the giant's share at its own place, the giant's back (the Harpstring's lit strings turning under the neck at night, the
Puffer's amber globe under the Veil), the place's voice in earshot. The neck place must not block the way through: the raft sails
through the Gill Harp to reach the West Pool, and the bank's footprint lifts as the raft passes (as the Mossmere's banks already ease
to 0.35 opacity inside). **Later sheets** (§10): the Puffball Vent (fifth, old, the Emberbrood Snakehead) and the Drowned Greenhouse
(night, the Remembered Sun).

**Sail paths** (`LOOP.places[id].out`, the Lily Maze's kind of bend): from the mooring, every West Pool place goes through the neck:
the Lullaby `[[30,28],[12,8],[0,6],[-14,0],[-32,-20],[-46,-32]]`, the Veilwater `[[30,28],[12,8],[0,6],[-16,18],[-44,24],[-72,32]]`,
the Gill Harp `[[30,28],[12,8]]`, the Mother's Cup `[[34,24],[44,12]]`. About 120 m to the far places: 13–20 s at Oars I–II, near the
sim's 14 s `out`; `LOOP.time.out` is measured per water at the integration gate.

### 3.3 The look

The ember garden (WATERS §2) with its greenery pushed (§1A). Palette: `ZONES[1].palette` and `grade` **as built** (fog #402258 at
0.0065, water #2c1842, glow #e8ac4c, accent #e090bc, nebula #e48cbc, stars 0.8; grade tint #5a2c78 at 0.2, saturation 0.96); the
green only from materials. New look keys in `ZONE_LOOKS.sporewood` (WATERS §6; the leaf track at step 5's figures, inside the neon
cap): `lush: 0.33`, `leafDark #3f5a3c`, `leaf #566e48`, `leafHi #7f9a5a`, `moss2 #4d6a42`, `mossG #4d5a3b` with `mossGHi #7b8a59` at
amount 0.6 on every upward root, stump, bank top and stalk foot (the built violet `KIT.moss` stays under it), `bloom #f0e0d0` (cream)
and `#eeb0c8` (rose) for the flowers, fireflies `#e0e49c`.

**Light**: the key from upper-left behind (−56°, 42°, built), so the fronds are backlit; a **static dapple** in the water shader (a
baked low-frequency mask that darkens the moon's mirror between "moon coins", no animation, no glitter); the caps' gills glow amber
from beneath (built emissive), so pools of warm light lie under each cap on the water and the moss; the Lantern Stalks are the
water's lamps (amber glowcaps in five groves, the moths' lamps). **Mist**: the spore-haze, a thin rose-cream layer under 1.2 m in the
coves and the Reed Flats from dusk, with a few gold spores (one points mesh, ≤ 60 on high, none on low) lifting through it; the
place banks take its tint (`mist.tint`) and sit lower. **Sky**: the cap-rim window (a ring of far cap silhouettes on the far rim, 30–40
m up, framing the sky; at least 12% of the frame is sky).

**The colour script** (WATERS §8): `tools/loop-colour-script.py` gains Sporewood's frame (two pools, the neck, the Mother Cap, the
caps' amber pools, the green banks) and its new targets; it lints the leaf keys and paints and measures the frame at day, dusk and
night before a single model is built (the first commit of W2).

### 3.4 Landmarks (none of them stone)

| landmark | what it is | seen from |
|---|---|---|
| **the Mother Cap** | a mushroom tree 30 m tall on the Mother's Foot, its cap 22 m across overhanging the Mother's Cup, its gills lit amber, moss and ferns on its foot, vines hanging from its rim | everywhere in the East Pool and through the neck: the water's vertical landmark (the Mossmere's are low and horizontal) |
| **the Gill Harp** | two cap trees lean over the neck from both banks; their gills hang down in long strands (hanging strands, §1A) that the raft passes under | the neck, both pools' ends |
| **the Veil** | a curtain of moss and vine 12 m wide hung from a fallen cap stalk across the Veil inlet's mouth; it parts round the raft (strands bend away, as reeds do) | the West Pool's south-west |
| **the Seep** | a 2.5 m fall into the East Pool from a fern ravine; white water in a green cut | the East Pool's north-east |
| **the Lantern Stalks** | five groves of tall glowcaps (the built stalks) with amber caps, the spore moths circling them | round both pools |
| **Rootfoot Landing** | the gardeners' landing: a jetty on root-posts, an arch of living willow over its head, terracotta pots grown over with fern | home |

### 3.5 Home: the mooring after the tow

`LOOP.mooring.sporewood`: the Slow Hearth in **Rootfoot cove** (hull about (36, 34), its bow toward the west, the raft at its stern
on the root-post jetty, Murk's barge beside it to the east at about (44, 30)), the home camera looking north-west across the East Pool
to the Mother Cap on the right and the neck's mouth with the Gill Harp on the left (`cam`, `portrait`, `blend` as the Mossmere's,
fitted at 358 px and on the near-square phone and the 16:10 Legion Go). `mooringChecks` (both hulls and the raft clear of the islands,
the Tongue, the places and their banks, the shore, the spawn and the glides) on the outline's `shoreDist`.

### 3.6 Wildlife and ambient (the Mossmere's systems, Sporewood's creatures)

`LOOP.wildlife.sporewood` and `LOOP.ambient.sporewood` (art only, never in the fish pool, `?wild=0` turns them off):

- **Spore moths**: the wick-moth system as built with new colours (forewings cream #f0e2c8, hindwings amber #e8ac4c with a plum
  eye-spot) and the Lantern Stalks as their lamps (the `cap` lamp kind already exists). Palette only.
- **Lily frogs**: the lampbill behaviour (pairs and threes, flee at the raft, dive and surface) on a new small model, a squat frog
  (moss-green back #566e48, cream throat, amber eyes), sitting on the lily rafts and plopping in as the raft comes within 10 m, coming
  back up on another raft. One small model (S).
- **Fireflies** (the vegetation kit's night emitters, §1A).
- **Drifting gill-flakes**: the candle-boat lines as built, with no flame: pale ochre flakes of cap gill drifting on the outflow to
  the Root Weir, turning slowly, sinking there.
- No heron analogue in this edition (later: a stalking bird on the Reed Flats). Tiller, the snail on the Grove's back
  (CHARACTERS.md), is later.

### 3.7 The sound bed (`audio-sporewood.js`, the pattern of `audio-mossmere.js`)

| light | the bed |
|---|---|
| late day | the Seep's trickle (near the East Pool), slow drips from the caps (random, panned), soft spore pops, a few frog clicks |
| dusk | the frogs begin (a loose chorus that builds over the dusk), the drips thin, a low warm drone under it |
| night | the frog chorus full and low, a night insect pulse, the drone deeper |
| each place in earshot (full within 12 m, gone past 30 m) | the Lullaby: a soft music-box drip; the Gill Harp: **one hummed note**, felt more than heard; the Veilwater: the Veil's whisper; the Mother's Cup: a slow breath, rise and fall |
| the giant's back | the Harpstring's hum swells; the Puffer: a paper rustle |

The score is `audio-music.js`'s built `sporewood` theme. `tools/audio-render.mjs --set=sporewood` renders the bed for the gate. *As built (lane A): §9.9.*

---

## 4. Where each part of the brief is

What is there: §1. Greener, natural, different: §1A. The roster: §2. The water: §3. The gear loop across waters: §5. The road in:
§6. The shop: §7. Pacing: §8. The build plan: §9. Later: §10. The user's questions: §11.

---

## 5. The gear loop across waters (binding from Lake 2 on)

### 5.1 The rule in one breath

When the home is towed to a new water for the first time, **every rod, line and reel, every raft part (Oars, Keel, Lantern) and every
creel bought from Murk at the old water stays behind** (the user's answer 1, §0A), and **a third of what they gave is carried for
good** (the tackle's Hold and the rod's cast, the hold's bought slots, the raft parts' levels): the Wick's hands keep what they learned.
**The old water's lures and tins stay at that water** (they only work there, and they are there again on the way back). **Everything
found while fishing travels** with the home, and so do the raft itself, the barge and its home items. At the new water Murk
gives its own start kit and sells **its own tackle, lures and baits**, doing the same jobs in that water's materials. **The player is
told once, plainly, before buying the map and again before the tow.**

### 5.2 (a) Moving on: what stays, what goes, what is carried

| thing | at the tow to a new water | why |
|---|---|---|
| **bought rods, lines, reels** | **left behind**; a third of their Hold is carried (§5.3) | the user's rule |
| **bought lures** | **stay at their water** (filtered out of the tin, the screen and the sheet elsewhere; owned again on the way back) | "completely different lures on every map" |
| **bait tins** (counts) | **stay at their water** (`meta.loop.bait[water]` already keys them so) | as lures |
| the start tackle (Willow Switch, Twine, Wooden Winch) | **travels** (never bought) | so there is always a rod |
| **found tackle** (the Lamplighter's Pole, the Belfry Winch, the Ferrywife's Thread, the Gate-Guard's Button, both notebooks) | **travels, for good**; the Button works at every water (grade 2 for every fish but giants, legends and the bait-only fish); a notebook's boost and guest stay its water's own | (b) |
| **the raft's parts** (Oars, Keel, Lantern) and **the hold** (its bought slots) | **left behind**; a third of their levels and slots is carried (§5.3) | **the user's answer 1** (§0A), over this design's default (they travelled); the first evenings' rule (`LOOP.arrival`, §8.3) keeps the move from punishing |
| the barge and its home items, prints, the gallery, looks, barge parts | travel | the home goes where you go |
| clams | kept | money, not gear |
| the Journal, records, class seals, prints, the list's ticks, the keys | kept | the record |
| finds sold | sold (as any sale) | — |
| open orders | stay with their water (fill them on the way back); the new water rolls its own | orders ask for the old water's fish |
| a Marked giant, legend wounds | stay at their places | they live there |

**Told once, plainly** (no way to fail: nothing owned is lost without warning):

- **On the map card** (the shelf's Maps tab and the catalogue's map page), one line under the price: **"Moving on leaves your tackle."**
- **Before the tow** (the first Sail for a water not yet towed to): one card over the Chart, with the Wick's sheet glyphs:

  > **To Sporewood Pools**
  > Bought tackle, raft parts and creels stay here.
  > Your hands keep a third of it. *Carried +2 · +2 · +2*
  > Lures and bait wait here.
  > Found things come with you.
  > **[Tow]** **[Not yet]**

  (The words as lane D1 wrote them, `TEXT_LOOP.leave`, after the user's answer 1; the map card's line is `TEXT_LOOP.mapLeaves`,
  "Moving on leaves bought gear behind.") The carried figures are computed (§5.3) and drawn in the carried line's words. "Not yet" returns to the Chart; nothing changes until Tow. Tow writes `barge.towed`, then the carry
  and the reset, in one save (a reload lands at the new mooring with all of it written, SPEC §6.5's rule).

### 5.3 The carried portion

- **What is carried**: the **Hold of the rod, the line and the reel** (each slot alone) and **the rod's cast**. The line's size cap
  follows from the line's total Hold (§5.6), so it is carried too, softly. Hook windows, a found piece's trade-offs, lures' and baits'
  Hold are not.
- **How much**: at each first tow, per slot, **carry += ceil(H / 3)**, where H is the Hold of the best piece **bought at the water being
  left** (not counting what was already carried); the cast likewise: ceil((the best bought rod's cast − 16 m) / 3). Leaving the
  Mossmere with T2 everywhere (5 / 5 / 5, cast 19 m): **+2 / +2 / +2 Hold, +1 m cast**. With T1 only: +1 each. Never less than 0;
  a slot never bought carries nothing new.
- **The hold and the raft** (the user's answer 1): the hold's bought slots carry ceil(B / 3), B the slots bought at the water left
  (the Mossmere's Hold 6: +1, so Sporewood opens on Hold 4); each raft part carries its bought levels × ⅓, unrounded (the Mossmere's
  Oars II, Keel II and Lantern II: 0.67 of a level each: +1 m/s, +0.067 favour, +0.067 at night and +10% light). Sporewood's shelf
  sells its own creels from the step above the carried slots to Hold 7, and its own raft parts (`LOOP.gear.sporewood.hold`, `.raft`).
- **Stacking without breaking the ladder**: the carry only grows, by a third of each water's own bought gear, and **each water's
  tiers are authored on top of the carry a player who bought that water's top would bring** (the "expected carry"), so every water's
  top tier with that carry lands on SPEC §4.3's settled Hold for its era: Sporewood's top (+6 / +7 / +6) on +2 gives **8 / 9 / 8**,
  the old T3 that SPEC put on the shelf with the Sporewood map; leaving Sporewood adds ceil(6/3) / ceil(7/3) / ceil(6/3) = **+2 / +3
  / +2**, so Glasswater opens on +4 / +5 / +4 and authors its tiers to reach the old T4 (12 / 13 / 12). A player who skipped gear carries
  less and finds the first evenings harder, never stuck (the bare hook, the start kit and Cut Strip always land fish).
- **Where it shows** (logs only, few words): the Wick's sheet, at Tackle, one line above the plates: **"Carried +2 · +2 · +2"** (rod ·
  line · reel, the hand glyph); the Tackle screen's head the same; the gear log's slot lines add it to the Hold figures
  (`+5 Hold` reads the total). Never on the HUD, the shelf or a card.
- **The portion** is the measured choice (§8): a third gives Sporewood's first evening about 60% of the Mossmere's last trips and
  then full pace after three buys; none (0) or a quarter is punishing, a half or all of it makes the first evenings trivial.

### 5.4 (b) Found things

Everything found while fishing is **kept forever and travels with the home**: lost tackle (fitted at any water from the Tackle
screen), the notebooks (their boosts and guests stay their water's), barge parts (fitted on the barge), looks, treasures (until sold).
The tin's Kit row and the sheet show found pieces at every water.

### 5.5 (c) The Tackle screen

One screen, **Tackle**, building on the tin's drawer and the sheet's plates, for changing rod, line, reel, lure and bait at leisure.

- **Opened from**: the pause menu (a new item, *Tackle*), home (the rod rack target, which today opens the sheet at Tackle: it opens
  this screen, with a *Sheet* link), and on the water **when no line is out** (the tackle tin's button, `canChangeHook`; with a line
  out the tin shows as today).
- **Layout**: a head with the water's name and the carried line; five rows, **Rod · Line · Reel · Lure · Bait**, each a strip of
  engraved chips (the item's catalogue engraving, its name in two words at most), the fitted chip inked; a fixed foot with **Done**.
  Rows scroll sideways when they overflow; no text is ever cut (names wrap to two lines inside a chip at 358 px). Under the fitted
  chip, one line from the gear log (`+5 Hold.`, `Casts 22 m.`, `Lands up to Trophy.`), logs only.
- **What each row holds**: the start piece, every tier bought **at this water's shelf** (a lower tier can be fitted), and found
  pieces; the Lure row the water's own lures and the found lures; the Bait row the water's tins with any left, Cut Strip and the bare
  hook. "Bait or a lure, never both" (WATERCRAFT §3.4) holds: fitting one clears the other, as the tin does.
- **Input**: touch and mouse, tap a chip; a controller, the D-pad or stick moves rows and chips, A fits, B closes (the input-pad
  focus ring is the UI's own frame, never drawn in the world); keys, arrows, Enter, Esc. One sound per fit (the tin's).
- **Save**: `meta.loop.fit = { rod, line, reel }` (an item id or null for "the best bought"), beside `found` (which it replaces in
  reading: `found[slot]` is read as `fit[slot]` once, by the migration).

### 5.6 (d) Murk at each water: the same jobs, a different feel

| job | the Mossmere | Sporewood Pools (its materials: stalk, cap, root, moth silk, amber, spore) |
|---|---|---|
| the start lure (free, never on the shelf) | Bent Spoon: a kitchen spoon Murk bent and holed | **Seedpod Twirl**: a winged seedpod with a hook through it; spins down slowly like a falling key |
| the plain bait (the start kit's tin) | Mire Worms | **Spore Cake** |
| a first line that lifts the cap | Line T1, Braided Gut (Trophy) | **Rootthread** (Trophy) |
| the second line | Line T2, Waxed Silk (Elder) | **Mothsilk** (Elder) |
| rods | Ashwood · Whalebone | **Stalkwood** · **Amberheart** |
| reels | Brass Spool · Clockwork | **Capwheel** · **Burlwheel** |
| the insect fly | Feather Fly | **Spore Moth** |
| the hunting lure | Glimmer Spoon | **Ember Minnow** |
| the bottom lure | Bone Jig | **Root Jig** |
| the giants' lure | Harbour-Bell Spinner | **Spore-Lamp Fly** (the built name, re-aimed) |
| the glow and night bait | Lumen Moss | **Amber Grubs** |
| the legend's bait | Heartmoss Ball | **Glowcap Bulb** (built) |

**The line's cap by its total Hold** (one rule for every water, GEAR-GATES §4.1's line term generalised): `LOOP.gearCap.lineAt[water] =
{ trophy, elder }`, the cap Prize below `trophy`, Trophy below `elder`, else Elder, read on the fitted line's Hold plus the carry. The
Mossmere's `{ trophy: 2, elder: 5 }` reproduces today's Twine · T1 · T2 exactly; Sporewood's `{ trophy: 4, elder: 7 }`: the carried
+2 alone fishes at Prize, **Rootthread lifts it to Trophy** (2 + 3), Mothsilk to Elder (2 + 7). A water's tiers are its own
(`LOOP.gear[water]`), so the global T3–T6 of SPEC §4.3 stop being one ladder: each later water authors two or three tiers to its
era's settled Hold (§5.3).

### 5.7 (e) Lures and baits are new on every map

Sporewood's five lures and two tins share no item with the Mossmere's (the Glowcap Bulb, the Spore-Lamp Fly and Spore Cake were always
Sporewood's). Each has its own look, motion and fish (§7.1). The hook table (§2.4) and the gear gates apply to the new set: the giants
need a bought lure, the hunters a strip or a lure, the bait-only fish their tin, the free hooks cap at Keeper and Cut Strip at Prize.
**Cut Strip stays at every water**: it is never bought, it is cut from the trip's own Small and Keeper fish (question 3). The Mossmere's
lures and tins stay at the Mossmere.

---

## 6. The road in

### 6.1 The three keys (SPEC §5.5, as built)

| key | Sporewood's | state |
|---|---|---|
| **map** | the Sporewood Pools map, **2,800** shown (base 1,400; it was 2,600 base) so it is about 37 min of the Mossmere's last income after its empty shelf (§8) | on the shelf once the Mossmere is the last open water (as SPEC's rule) |
| **gear** | Rod T1, the Ashwood (`rod:1`), as built: a Mossmere rod, owned long before; it stays behind at the tow (its key is met at the Sail) | built |
| **catch** | the Mossmere's list, 12 fish (`listFor`), as built | built |

`LOOP.shipped = 'sporewood'` unseals the sheet: its map seal shows its price, the gear and catch seals press as today.

### 6.2 The Chart

- **Sheet 2 is baked** (`node tools/world-map/build.mjs --game --sheets=2`), its live layer from the game's geometry:
  `ui-chart.waterGeometry` returns the outline polygon itself (the islands as their polygons, the Mother's Cup as the one round deep),
  `chart-draw` draws the coast as one closed path, hachures on the bluffs (the Fern Bluff, the East Pool's north shore), reed hatching
  on the Reed Flats, the Seep and the Root Weir as the water's in and out, the four places' sites and leaders, and `sideOf` reads
  `shoreDist`.
- **The world map**: `canon.mjs`'s four Sporewood blobs become the two pools and the neck (about `[[511, 308, 6.6, 5.6, -10], [529,
  300, 5.6, 5, 15], [520, 304, 2.4, 1, -25]]`, fitted to the outline's proportions), so the overview and the sheet are one shape; the
  bake's decoded-pixel check is re-recorded (a new chart-art.js); bytes are measured against M1 §3.2 (*est.* +60–90 KB; index.html is
  already over its 3.3 MB line, the polish pass's job).
- The sheet's states are SPEC §5.4's (not bought, bought and sealed, open, towed); the Chart's pick works for Sporewood's places as for
  the Mossmere's.

### 6.3 The tow, and the way back

- **The tow** (SPEC §6.5, built as `playTow(leg)` for the opening): the leg on the Chart from the Mossmere to Sporewood along the Lamp
  Road (`road.mjs`'s forward leg; its locks and falls set its 4–6 s), the ink dip, the glide in to Rootfoot Landing (`LOOP.tow` gains
  Sporewood's glide-in lane and camera), then the mist lift on the first evening. Played once, never again.
- **The leaving card** (§5.2) comes first, on the Sail.
- **The way back by the lamps** (SPEC §6.5, "ships with the second water"): Sail for a towed water you are not at plays one ink dip
  (0.6 s) and the barge lies at that water's mooring. At the Mossmere, your current tackle (Sporewood's, plus the carry) is fitted,
  the Mossmere's own lures and tins are back in the tin, and its line cap reads the line's total Hold against the Mossmere's figures
  (so the Mossmere fishes easier; the Matriarch can still be finished, no way to fail).
- **Murk's shelf on the way back** (ruled at the integration's fix, 18 November 2026, as built): there is one gear water at a time, the
  last one towed to for the first time (`gearWater`), and its shelf travels with the barge. So at the Mossmere after the tow Murk sells
  Sporewood's tackle tiers, creels and raft parts (the gear water's, in its own engravings) beside the Mossmere's own lures and tins (the
  barge's water's). A Mossmere tier is never offered again after the tow, so nothing bought there is bought twice; the user's question
  stays open in §11 should they want the Mossmere's shelf to show its own lures and tins only.

### 6.4 Murk's lines (few; each said once)

| when | line (`TEXT_LOOP.murk`) |
|---|---|
| the Sporewood map bought | "New water, new tackle. Your hands keep a third." |
| the first evening home at Sporewood | "Spore Cake on the hook. They like it sweet here." |
| the first cap loss at Sporewood (GEAR-GATES' `firstAway`, per water) | "Lost a big one? Rootthread holds them." |

### 6.5 The first-play guide

One box for a new water, at the first cast there (`ui-guide.js`, the Mossmere's boxes untouched): **"New water: new lures and bait
at Murk's."** Nothing else; the leaving card and Murk's line carry the rest.

---

## 7. The shop

### 7.1 Sporewood's shelf (prices: base · as Murk asks, ×2; tins and the legend's bait at their consumable price)

| item | kind | base · **shown** | what it does | its look | its motion | shelf line (≤ 8 words, no odds) |
|---|---|---|---|---|---|---|
| Seedpod Twirl | start lure | free | grade 1–2 on the small fish; lands up to Keeper | a dried winged seedpod, cream and brown, a hook through its seed | spins down slowly like a falling key | (never on the shelf) |
| Spore Cake, a tin of 10 | plain bait | 20 · **40** (as Amber Larvae's; 15 · 30 before D2's tier 12) | the right bait of the barb, the crayfish, the Downcast; the Threadling takes nothing else | a crumbly plum-brown cake studded with gold spores | dissolves in a slow gold cloud | "Nearly everything here eats it." |
| Amber Larvae (written Amber Grubs before D1, §0A), a tin of 10 | glow bait | 20 · **40** (the game's tin price: tier 12 × 1.5, to 5, ×2; D2, §8.4) | the right bait of the night carp and the angler; the Sleepspore Jelly takes nothing else | fat cream larvae with softly lit amber segments | curl and uncurl on the hook | "For the Jelly and the night carp." |
| Rootthread | Line I | 300 · **600** | +3 Hold; lifts the cap to Trophy | brown line of twisted root hair | — | "Lands bigger fish." |
| Stalkwood | Rod I | 300 · **600** | +3 Hold, casts +2 m | a pale fungus-stalk rod ringed like a mushroom stem, a bark grip | — | "Light, and springs back." |
| Capwheel | Reel I | 300 · **600** | +3 Hold | a reel turned from a dried shelf-fungus cap, gills on its face | — | "Turned from a shelf cap." |
| Ember Minnow | hunting lure | 400 · **800** | the right lure of the Cindertail and the Mackerel; opens the Harpstring | a carved minnow of dark amber resin, a cinder inside that glows dull orange (no flash) | wobbles side to side at mid depth | "Wobbles warm, for the hunters." |
| Root Jig | bottom lure | 440 · **880** | the right lure of the Velvet Ray; likes the Puffer, the catfish, the crayfish | a knot of black root weighted with a pebble, a moss tuft tail | hops along the bottom, puffs of silt | "Hopped on the bottom, for rays." |
| Spore Moth | insect fly | 240 · **480** | the right fly of the Netcloud Fry; the barb likes it | a cream moth with plum eye-spots and a puff of amber spore dust | skates and twitches on the top | "Skates the top, for small risers." |
| Spore-Lamp Fly | giants' lure | 1,000 · **2,000** | the right lure of both giants (+10 Hold, ×1.5 their share) | a fly tied round a glowcap bud | drifts slow and deep, the bud pulsing rose-amber | "For the Pools' giants." |
| Mothsilk | Line II | 1,400 · **2,800** | +7 Hold; Elder | cream moth-spun silk, a soft sheen (no glitter) | — | "Lands the biggest fish." |
| Burlwheel | Reel II | 1,400 · **2,800** | +6 Hold | a root-burl reel bound in green-gone copper wire | — | "Cut from a root burl." |
| Amberheart | Rod II | 1,400 · **2,800** | +6 Hold, casts +4 m | a dark root-wood rod with an amber core seen through a window above the grip, faintly lit | — | "Amber at the heart. It holds." |
| the Veilwater | night place map | 1,200 · **2,400** | §3.2 | — | — | its card line |
| the Mother's Cup | crown place map | 2,200 · **4,400** | §3.2 | — | — | its card line |
| Glowcap Bulb | the legend's bait, one try | **250** | the Drifting Grove only | built | — | "For the Mother's Cup. One try." |
| Bark Creel · Rootwoven Creel · Mossbed Basket · Gardener's Hamper | the hold's steps (the user's answer 1: the slots are bought gear) | 300 · 500 · 1,000 · 2,000 (· **600 · 1,000 · 2,000 · 4,000**) | Hold 4 · 5 · 6 · 7 (a step at or under the carried slots is never offered) | woven root, moss-lined, a gardener's lidded hamper | — | "Room for one more." |
| Capleaf Oars I–II · Root Keel I–II · Glowcap Lantern I–II | the raft's parts (answer 1) | oars 100 · 500, keel 200 · 900, lantern 200 · 800 (×2 shown) | each level's job as the Mossmere's (+1.5 m/s; +0.1 favour; +0.1 at night, +15% light) | pressed-cap paddles, a root keel, a glowcap in the lantern | — | "Faster through the neck." · "Rides low. Bigger fish." · "Glowcap light. Bigger fish at night." |

Each item gets an engraving in Murk's catalogue (`murk-engrave.js`, his line-engraving style) and a mesh where it is seen on the
raft (lures on the rod tip, the reel on the rod; the tackle's meshes follow the built tiers' shapes in the new materials). Thirteen
permanent items, 25,160 shown (with Hold 7), beside two tins and the Glowcap Bulb; with the user's answer 1, also Hold 5 and Hold 6
again (3,000 shown) and the six raft-part levels (5,400 shown): 8,400 shown more. Home items: none new in this edition (§10); they travel.

### 7.2 Orders

Murk's Order Board rolls Sporewood's orders from Sporewood's fish while the barge is there (the built rules: two in three ask for a
common or uncommon; never a giant or the legend), and the Mossmere's open orders wait at the Mossmere. Data only.

### 7.3 Finds (FINDS §5.2)

**This edition ships Sporewood's five treasures** (one per grade, sold to Murk at Sporewood's tier by FINDS §4.2's rule; the 1% rule
holds for the jackpot): **a seed jar** (plain), **a bee-skep lid** (fine), **a gardener's brass trowel** (precious), **a glass cloche
handle** (rare), **the Seed-Keeper's Casket** (the jackpot). Five small models (`models-finds.js`), five names and card lines:

| find | card line (≤ 8 words) |
|---|---|
| Seed Jar | "Still sealed. Still waiting for spring." |
| Bee-Skep Lid | "Woven straw. The bees left long ago." |
| Gardener's Trowel | "Brass, worn bright on one side." |
| Cloche Handle | "From a glass bell over seedlings." |
| The Seed-Keeper's Casket | "Every seed the gardens ever kept." |

*As built (lane S, §9.8): the five ship as above, selling at tier 12 for 24 · 72 · 180 · 600 · 3,000.*

**Later**: Sporewood's three barge parts (the Potted Amber Glowcap, a garden lantern, a trellis), its three looks, its well pieces,
and a Sporewood lost-tackle set (a found rod, line, reel and a notebook). Until then a snag at Sporewood draws a treasure or nothing
(the finds share's soft guarantee keyed by water).

---

## 8. Pacing

### 8.1 Targets (in M1 §6.4's style, for `clams.mjs --shipped=sporewood`)

| mark | target |
|---|---|
| the Sporewood map after the Mossmere's empty shelf | ≤ 40 min of its last income |
| the first evening at Sporewood (the arrival kit) | 50–70% of the Mossmere's last clams a trip; never a dead end (every pool bites) |
| back to the Mossmere's pace | ≥ 100% of the Mossmere's last clams a trip within the first 6 trips |
| the first purchase | after trip 2–4 |
| the longest wait for one purchase | ≤ 40 min |
| the empty shelf (blind caster) | 3–5 h at Sporewood |
| the list (9 fish) | p95 ≤ 60 min, p99 ≤ 75 |
| the first giant at Sporewood | hour 0.5–2 there |
| trips | ≤ 6 min with the visit home |

### 8.2 Measured (the scratch sim)

The sim is `tools/sim/clams.mjs` at 29cd74b, copied outside the repo with five small hooks (the tackle's Hold read through a
per-water table with the carry, the carry in the land chance's cache key, a Sporewood line cap by total line Hold and the free hooks'
caps, the sim's tables exported) and a driver that fishes Sporewood's open water and places with the sim's own `run` and
`listStudy`, the roster of §2 (the three left-out kept species, the Emberbrood and the Puffball Vent removed), the best hook each
trip (a lure or a bait, never both), Spore Cake at 35 a tin, the pacing player's 0.9 clams and 1.25 time, and the buying order of
§7.1. The sim's Sporewood still uses SPEC §4.4's family rule for its lures (the new lures stand in for the Mossmere's family lures
of the same job: Spore Moth for the Feather Fly, Ember Minnow for the Glimmer Spoon, Root Jig for the Bone Jig, Amber Grubs for Lumen
Moss), so the figures are the shape of the answer; lane D's `--shipped=sporewood` replaces them with the hook table of §2.4.

**The Mossmere under the loop** (`clams.mjs --shipped=mossmere --quick`, unchanged by this design: the loop only adds the carry,
which is earned there): the empty shelf **5.20 h** (blind, 82 trips) · 4.57 (reader) · 4.55 (stalker-reader); 160 clams banked; the
last trips 347 clams in 4.8 min (72 a minute); the list p95 45 min. **The Sporewood map at 2,800 comes 37 min later**, so the tow at
about **5.8 h** (blind). (At SPEC's 2,600 base, 5,200 shown, it would be 70 min of fishing with nothing left to buy.) The one red
check is the pre-existing "Hold 4 pays its way" (the user's Hold prices).

**Sporewood, by carried portion** (Hold 6 kept, the raft kept; the shelf of §7.1):

| carry per slot (from the Mossmere's T2) | the first evening (best hook: Spore Cake) | lost of hooked (over the cap) | after the first three buys | the empty shelf | the longest wait | the list p95 |
|---|---|---|---|---|---|---|
| 0 (nothing kept) | 164 clams, 5.6 min (47%) | 53% (21%) | 212 at 0.80 h, trip 9 (61%: Rootthread alone stays at Prize) | 5.41 h, 68 trips | **50 min** (fails) | 49 min |
| +1 (a quarter) | 184 (53%) | 49% (22%) | 350 at 0.58 h, trip 7 (101%) | 3.77 h, 51 trips | 33 min | 47 min |
| **+2 (a third, rounded up: the default)** | **204 clams, 5.1 min (59%)** | **45% (22%)** | **368 at 0.48 h, trip 6 (106%)** | **3.45 h, 48 trips** | **33 min** | **45 min** (p50 30, p99 52) |
| +3 (a half) | 212 (61%) | 43% (23%) | 397 at 0.46 h, trip 6 (114%) | 3.15 h, 45 trips | 28 min | 43 min |
| +5 (everything kept) | 368 (106%) | 27% (3%) | 479 at 0.35 h, trip 5 (138%) | 2.69 h, 40 trips | 28 min | 41 min |
| +2 and **the hold reset** to 4 (3 + a third of the 3 bought; question 2's other way) | 141 clams, 3.9 min (41%) | 49% (25%) | 285 at 0.53 h, trip 9 (82%) | longer than the default by Hold 5 and Hold 6 bought again (3,000 more) | — | 45 min |

**The default, measured** (+2, the §7.1 prices): the first purchase (Rootthread) after **trip 3** (0.25 h); Stalkwood trip 5, Capwheel
trip 6; Ember Minnow 0.70 h, Root Jig 0.84; the Veilwater 1.27 h; Spore Moth 1.34; the Spore-Lamp Fly 1.71; Mothsilk 2.15, Burlwheel
2.50, Amberheart 2.84; the Mother's Cup 3.38 h and the Grove's hunt (2.5 tries of the Glowcap Bulb, 613 clams; her first landing pays
4,400); Hold 7 at **3.45 h, the empty shelf** (48 trips, the longest wait 33 min). Clams a trip 204 → 338 (Rootthread) → 455 (the
Veilwater) → 569 (T-II) → 653 (Hold 7), trips 4.1–5.1 min. The giants at the end kit: 0.46 giant bites and 0.33 landed a trip (*est.*:
the first giant home at about hour 1 at Sporewood, with the Ember Minnow). **The whole arc**: the Mossmere 5.2 h, the map 0.6 h,
Sporewood 3.5 h: **about 9.3 h** to Sporewood's empty shelf for the blind caster.

**Why a third**: with nothing carried the first evenings are punishing (more than half the hooked fish lost, a 50-minute wait) and the
Mossmere's tackle feels wasted; with half or all of it the reset is not felt (everything kept: the first evening out-earns the
Mossmere's last). A third makes the move felt for exactly one evening (59% of the old pace, one in five fish too big for the line,
the got-away line "Too heavy for your line." doing its job), and the first line (Rootthread) on trip 3 lifts it back to full pace by
trip 6. The carry's main effect is on losses, not on the shelf's length.

Commands (from `gloomwater/`, the scratch kept outside the repo; lane D ports it into `clams.mjs --shipped=sporewood`):

```
node <scratch>/sw-pace.mjs --carry=2 --pk=2 --list          # the default row
node <scratch>/sw-pace.mjs --carry=0|1|3 --pk=2 --list      # the other rows; --hold=4 the hold-reset row
node tools/sim/clams.mjs --shipped=mossmere --quick         # the Mossmere under the loop
```

### 8.3 Measured with everything bought reset (lane D1, the user's answers 1 and 2)

The scratch sim of §8.2 again (`tools/sim/clams.mjs` copied outside the repo, as the dev branch at 09106ba has it), with three more
hooks: a raft part's level may be a fraction (the carried ⅓ of a level), a fish over the gear's cap may land at the cap on an evening
the arrival rule covers, and Sporewood's Fight term (`CATCH_V3.lake.sporewood`, 7) eased per evening. The arrival kit: the Mossmere's
end (T2 5 / 5 / 5, Hold 6, Oars II, Keel II, Lantern II) left behind, **a third carried** (+2 Hold a slot, +1 m cast, Hold 3 + 1 = **4**,
0.67 of a level of each raft part), the Seedpod Twirl and a tin of Spore Cake, 160 clams banked. Sporewood's lures still stand in for
the Mossmere's family lures (the hook table of §2.4 is D2's to port), so the figures are the answer's shape; lane D2's
`clams.mjs --shipped=sporewood` re-measures them on the game's tables and moves the same knobs. The Mossmere's last trip: **347 clams in
4.8 min, 72 a minute** (§8.2).

| the first evenings at Sporewood (best hook: Spore Cake) | lost of hooked (over the cap) | clams a trip (of the Mossmere's 347) | clams a minute (of its 72) |
|---|---|---|---|
| this design's rule with the hold and raft reset (no arrival rule) | 44% (21%) | 134 (39%) | 36 (50%) |
| over-cap fish land at the cap on evening 1, Fight 7 | 33% (0%) | 201 (58%) | 60 (83%) |
| … and a half carried in place of a third (+3, Hold 5) | 28% (0%) | 256 (74%) | 69 (96%) |
| … a third, everything kept (+5, Hold 6, the raft whole) | 25% (0%) | 410 (118%) | 97 (135%) |
| **the arrival rule (`LOOP.arrival`): evening 1, Fight 7 − 10** | **20% (0%)** | **255 (73%)** | **86 (119%)** |
| evening 2, Fight 7 − 6 | 25% (0%) | 232 (67%) | 75 (105%) |
| evening 3, Fight 7 − 3 | 29% (0%) | 214 (62%) | 67 (93%) |
| from evening 4: Fight 7, the caps as GEAR-GATES' (Rootthread bought after trip 2) | — | 230 (66%) | 68 (94%) |

The carried share is a weak knob (a half carried, or everything kept, still loses a quarter of the hooked fish at Sporewood's Fight
term), so the first evenings' rule carries the user's target and the share stays a third. With the creels and the raft parts bought
again at the prices of §7.1, the walk (n = 1,200 a kit, the buying order Rootthread, Hold 5, Stalkwood, Capwheel, Oars I, the hunting
lure, Hold 6, Keel I, the bottom lure, Lantern I, the Veilwater, the insect fly, the Spore-Lamp Fly, Oars II, Mothsilk, Burlwheel,
Keel II, Amberheart, Lantern II, the Mother's Cup, the Grove's hunt, Hold 7): the first buy after **trip 2** (0.10 h); back to the
Mossmere's clams a trip at Hold 6 (trip 21, 1.28 h; its clams a minute from evening 1); the longest wait **32 min**; the empty shelf
**4.77 h, 71 trips** (inside §8.1's 3–5 h; the first draft's raft and creel prices, half as dear again, gave 5.10 h). Commands (from
the scratch folder):

```
node sw-pace2.mjs --share=0.3333 --ease=-10,-6,-3 --fen=3 --h5=500 --h6=1000 --o1=100 --o2=500 --k1=200 --k2=900 --l1=200 --l2=800
node sw-pace2.mjs --walk=0 --share=0.5 | --share=1 | --df=-7 …      # the other rows
```

### 8.4 Measured on the game's tables (lane D2: `clams.mjs --shipped=sporewood`)

`tools/sim/clams.mjs --shipped=sporewood` (the arc in `tools/sim/sporewood.mjs`) runs the Mossmere's shipped arc (§8.2's, unchanged:
the M1 run is byte-identical), the Sporewood map, **the tow by the game's own code** (`src/loop-carry.js` on the Mossmere's end), then
Sporewood as lane D1's data ships it: its fourteen fish (the sim's records checked equal to the game's), **the game's pools** (T104 on
Sporewood: `data.placePool` and `watercraft.castOdds` against the sim's `poolFor`, 300 pools, every share the same), its hook table
(§2.4; no areas until W1's geometry is baked: the hour tilt alone, as the game now draws it), the line's cap by its total Hold
(`lineAt`), its items' Hold the fish their row helps, and the first evenings' rule as `fishing.rollSize` has it (the size roll truncated
at the cap, so a fish over it lands at or under it; the Fight term eased). The pacing player (0.9 clams, 1.25 time), the Order Board
and the Bait Bed carried over as home items, tins at Murk's factor. Full run, ×2:

| the first evenings at Sporewood (best hook: Spore Cake) | lost of hooked (over the cap) | clams a trip (of the Mossmere's 325) | clams a minute (of its 73) |
|---|---|---|---|
| **evening 1: the cap lands, Fight 7 − 10** | **15% (0%)** | **210 (65%)** | **74 (102%)** |
| evening 2: Fight 7 − 6 | 18% (0%) | 205 (63%) | 70 (96%) |
| evening 3: Fight 7 − 3 | 23% (0%) | 203 (62%) | 67 (92%) |
| from evening 4: Fight 7, the caps as GEAR-GATES' (on the start line) | 43% (23%) | 175 (54%) | 48 (65%) |

**The knob that moved: Sporewood's value tier 11 → 12** (`LOOP.waters.sporewood.tier`; the user's answer 2's "Sporewood's early prices
and values"). The rows that chose it (`--quick`, the first evening): tier 11 **57%** a trip (16% lost); the Fight eased −14 · −8 · −4 at
tier 11, 58% (13% lost: the losses were never the limit, the Prize cap of the carried +2 is); `lineAt.trophy` 2 in place of 4 (the
carried line alone at Trophy), 71%, but then Rootthread lifts no cap and Murk's line "Rootthread holds them" is wrong, so not taken;
tier 12, **62%** (`--quick`) and **65%** (full). The carried share stays a third, `LOOP.arrival` −10 · −6 · −3, the shelf's prices as
§7.1; tins are 20 (40 shown) at tier 12. The walk (§8.3's order): the first buy (Rootthread) after **trip 3** (0.15 h), then Hold 5 at
0.44 h, Stalkwood 0.57, Capwheel 0.70, the Ember Minnow 0.89 (clams a trip 304 → 585: the hunting lure is the big step), Hold 6 1.14,
the Veilwater 1.58, Mothsilk 2.17, Amberheart 2.80, the Mother's Cup 3.21 and the Grove's hunt (2.5 tries of the Glowcap Bulb, 613
clams; her first landing pays 4,400), Hold 7 at **3.28 h, the empty shelf** (49 trips); the longest wait **18 min**; back to the
Mossmere's clams a trip at trip 16 (0.96 h); the first giant at about hour 1.6; trips ≤ 4.5 min. The whole arc: the Mossmere 5.26 h, the
map 0.57 h, Sporewood 3.28 h, **about 9.1 h**.

§8.1's targets: the map 34 min (≤ 40) · the first evening 65% (50–70%) · the first purchase after trip 3 (2–4) · the longest wait 18 min
(≤ 40) · the empty shelf 3.28 h (3–5) · the first giant hour 1.6 (0.5–2) · trips ≤ 6 min: **pass**. Two warnings: **the list** p95 105
min, p99 124 on the arrival kit (≤ 60 / 75; it is Glasswater's catch key, so it gates nothing until Glasswater ships: the Lostsea
Mackerel, a rare hunter that takes no Spore Cake and lands on Cut Strip about one trip in fifty, and the night's Mildew Angler are the
slow two; giving the mackerel Spore Cake at grade 1 makes it worse, since grade 1 caps it at Keeper), and **back to the Mossmere's
pace within 6 trips** (trip 16: with the hold and the raft left behind too, the user's answer 1, it comes after Hold 5 and the Ember
Minnow, by design).

**Re-measured with Sporewood's areas live (the integration's fix, §9.10; 18 November 2026, full run):** its open-water casts land in its
own baked areas (`WATERCRAFT.sporewood.shares` and `factors`, `watercraft.test.mjs --bake=sporewood`), the sim's casts as the game's
(the blind caster by the baked shares). The first evening at Sporewood **loses 15% of hooked fish (0% over the cap) and earns 209 clams a
trip, 64% of the Mossmere's last 325 (73.5 a minute, 101%)**; evenings 2 and 3: 207 (64%, 19% lost) and 203 (62%, 22% lost); from
evening 4: 176 (54%, 43% lost, 23% over the cap). The walk: the first buy after trip 3 (0.15 h), the longest wait **21 min** (the Mother's
Cup), the empty shelf at Sporewood **3.28 h** (49 trips; the whole arc 9.12 h), back to the Mossmere's clams a trip at trip 16 (0.95 h),
the first giant at hour 1.57; the list p95 108 min, p99 137 (the same warning). §8.1's targets pass; the user's answer 2 holds; no knob
moved. The Mossmere's run is byte-identical.

```
node tools/sim/clams.mjs --shipped=sporewood [--quick]              # the shipped figures (about 25 s; --quick about 15)
node tools/sim/clams.mjs --shipped=sporewood --quick --walk=0 --tier=11 | --ease=-14,-8,-4 | --lt=2 | --share=0.5 …   # the rows
```

---

## 9. The build plan (lanes, two at a time)

Sizes: S ≤ half a day of a builder, M about a day, L two days or more. Every lane ends green on `node tools/check.mjs`,
`validate-data --loop` (never `--refresh-fingerprint`), its own node tests and the flag-off fingerprint; visual lanes add one
browser run (desktop 1280×720 and 960×540, the near-square phone, 390×844, the Legion Go 1280×800 touch and controller) and two
look-and-fix rounds.

| lane | what | data keys and values | words | tests and scenarios | art | size | needs |
|---|---|---|---|---|---|---|---|
| **D1 · the data shape** | Sporewood under the loop, as data | `LOOP.waters.sporewood = { order: 2, tier: 11, prices: { night: 1200, crown: 2200 }, lake: 1400 }`; `LOOP.places` (the four of §3.2 with `out`, `card`, `giant`, `own`, `draws`, `legend`); `LOOP.species.sporewood` (the nine open-water fish); `LOOP.kept` += capshell_crayfish, mildew_angler, sleepspore_jelly; `LOOP.legendBait.sporewood = { id: 'glowcap_bulb', price: 250 }`; `LOOP.gear = { mossmere: TACKLE T0–T2, sporewood: [ +0, +3, +6/+7/+6, cast +2/+4, names ] }`; `LOOP.lures` the Sporewood five (`water: 'sporewood'`, `start` for the Twirl, `giants` for the Spore-Lamp Fly); `LOOP.tins.sporewood = ['spore_cake', 'amber_grubs']`; `LOOP.start.sporewood = { lures: ['seedpod_twirl'], bait: { spore_cake: 10 } }`; `LOOP.carry = { share: 1/3, round: 'up', castFrom: 16 }`; `LOOP.gearCap.lineAt = { mossmere: {trophy: 2, elder: 5}, sporewood: {trophy: 4, elder: 7} }`, `item` += seedpod_twirl keeper; `LOOP.hold.shelfMax` 7 with Sporewood; `LOOP.mooring.sporewood`; `LOOP.shipped` stays 'mossmere' until the gate; roster.json: the eleven fish's `favours` re-written to the new items, `roster-export` grows `src/roster-shipped.js`; `ROSTER_ART` the fourteen looks' keys (parameters filled by F); `watercraft.js` per-water `hookItems` and Sporewood's `HOOK_ROWS`, `RAW_ROWS`, geometry stub | `TEXT_LOOP.gearItems` (13 names), `shelf` (12 lines), `places` (4 card lines), `murk` (3 lines), `carry` ("Carried {r} · {l} · {c}"), `leave` (the card's 5 lines and 2 buttons), `mapLeaves` ("Moving on leaves bought gear behind.", as shipped: §5.2), `guide.newWater`; `textAllowed` | validate-data: every key, every item a water, no lure in two waters, hook rows complete (1% rule exact), `lineAt` reproduces GEAR-GATES' Mossmere caps, the list rule; existing tests unchanged with `LOOP.shipped = 'mossmere'` | — | **M** | — |
| **D2 · the logic and the sim** | the carry, the reset at the tow, per-water gear, the way back's gear, the save | `progression-loop`: `towTo(water)` (the carry: ceil(H/3) per slot from the best bought at the water left, the cast; `tackle` reset to 0, `gearWater`, `fitted` to the new start kit, `bait[water]` the start tin once, `startKit` per water), the shelf per water (`shelfItems` reads `LOOP.gear[water]`, `LOOP.lures` by water), `holdOf(slot)` = start + carry + the fitted piece, `gearCap` by `lineAt`, the tin and sheet filter lures by water (found ones always), orders keyed by water, `migrateLoop` (additive: `carry {0,0,0,0}`, `gearWater 'mossmere'`, `fit` from `found`; LOOP_SCHEMA stays 4, as built: §9.2); `clams.mjs --shipped=sporewood` (the scratch's hooks made real, the hook table of §2.4, the per-water caps, the arc from the Mossmere's end through the map and the tow, §8.1's checks) | — | `loop-carry.test.mjs` (the carry's arithmetic, stacking over two waters, nothing owned lost without the card, a reload mid-tow, the found pieces kept, lures back on the way back, the Mossmere caps unchanged), T104 on Sporewood's pools (the game's pool is the sim's), the save fixture (an M1-end save → the tow → +2/+2/+2) | — | **L** | D1 |
| **W1 · the outline shore** | the natural basin's engine | `arena.outline`, `arena.islands[].outline`, `arena.banks` (the height profile), `layout: 'outline'`; `buildLayout` builds the SDF grid; `shoreDist` everywhere §3.1 lists; `shoreR` kept for the Mossmere; the bank and cliff strip by outline offset; the water's foam bake from the SDF; collision; depth (two bowls, the neck, the Cup); `watercraft` reed runs by arc length; `mooringChecks` on the SDF; `ui-chart.waterGeometry` returns the polygon | — | the Mossmere's geometry hash unchanged (first commit, before any builder moves); `world-layout` tests on the outline (inside/outside, the neck's 11 m, islands, depth monotone to the Cup); `validate-data` world checks (places, docks, mooring clear; open water ≥ 70% of the basin); a top-down debug render of the shore and depth | grey-box only | **L** | — |
| **W2 · the world's art** | the ember garden made green, its landmarks and life | `ZONE_LOOKS.sporewood` (§3.3), the vegetation kit's six archetypes (prototypes, cells, sway, translucency, night emitters; behind `lush > 0`), the Mother Cap, the Gill Harp strands, the Veil (strands parting round the raft), the Seep (a falls card), the Lantern Stalks, the willow arch and root jetty, the cap-rim sky window, the dapple, the spore-haze and the banks' tint, the camera profile (`LOOP.camera.sporewood: { eye: 0.8, fov: +4, neck: lower }`), `LOOP.wildlife.sporewood` (moth colours, the lily frog model on the lampbill behaviour), `LOOP.ambient.sporewood` (gill-flakes) | — | `loop-colour-script.py` (its first commit: the Sporewood frame and targets), `hue-report` at three poses × three lights (§1A's targets, no cast, sky ≥ 12%, never neon), `clarity-perf --loop` on Sporewood (calls, triangles, phone cpuMs ≤ the Mossmere's banks-standing line), the arena build ≤ 250 ms desktop / 900 ms phone | the look: ≥ 3 look-and-fix rounds; a day/dusk/night sheet beside the Mossmere's for the user | **L** | W1 |
| **F · the fish** | the fourteen looks | new plans `disc`, `bream`, `tuna` in `LOOP_SHAPES`; parameters on eel, catfish, carp, minnow, crayfish, puffer (§2.3); the Grove's meadow extras; the Fry's cloud of five; `ROSTER_ART` values; body keys where a plan is off ±30% (`LOOP_BODY_K`: `bream`, `tuna`, `disc` from their cousins, by `roster-check.mjs`) | — | `models-plans.test.mjs` (every plan builds, tri budget per fish, no NaN), `roster-check.mjs` (weights ±30%), a look sheet of each Sporewood fish beside its Mossmere relative (`show-sheet.mjs`), the guest Nightbloom re-checked at the Mossmere | the looks: two look-and-fix rounds on the show's close-up and the catch card | **L** (M + M) | D1 (ids) |
| **C · the Chart, the tow, the keys** | the road in | sheet 2 baked (`build.mjs --game --sheets=2`), `canon.mjs` blobs (§6.2), chart-draw's polygon coast, hachures, reed hatching, in and out; `LOOP.tow` Sporewood's glide-in lane and camera; the leaving card on the first Sail; the way back's dip; `LOOP.shipped = 'sporewood'` at the gate | the card, the map line (from D1) | chart tests (the sheet's outline equals the world's polygon; no word crosses the shore at 358 px), the tow scenario (Mossmere → Sporewood, a reload mid-tow), the way-back scenario; chart-art's determinism and bytes | the sheet: two look rounds | **M** | W1, D2 |
| **G · the Tackle screen** | §5.5 | `meta.loop.fit`; `ui-tackle.js` (the screen), pause item, the rack target, the tin's button | "Tackle", "Done", the carried line (D1) | node: fit/clear rules through `canChangeHook`; scenario at every screen size, touch, mouse, keys and controller; no text cut or overlap (the 358 px and near-square checks) | chips from the engravings | **M** | D2 |
| **S · the shop, orders, finds** | §7 | the 13 engravings (`murk-engrave.js`), the lure and tackle meshes, the five treasures' models and `LOOP.finds.sporewood` (treasures only), orders by water | the find names and lines, the guide box | catalogue pagination with the 13 items; finds' 1% rule over 100,000 snags at Sporewood; orders' rules | engravings, five find models, lure meshes | **M** | D1 |
| **A · the sound** | §3.7 | `audio-sporewood.js` (pure tables), audio.js hooks, `audio-render.mjs --set=sporewood` | — | `audio-sporewood.test.mjs` | the bed | **S** | D1 (places) |

**Waves (two lanes at a time)**: 1. D1 alone (it is short and everything reads it). 2. **D2 ∥ W1**. 3. **F ∥ W2**. 4. **C ∥ G**.
5. **S ∥ A**. Then the gate. (F and S need only D1's ids and can move earlier if a builder is free; W2 needs W1; C needs W1's polygon
and D2's tow logic; G needs D2's `fit`.)

**The integration gate**: merge in wave order (check.mjs and validate-data after each); `clams.mjs --shipped=mossmere` and
`--shipped=sporewood` green on §8.1's targets; the full browser regression (the opening, the Mossmere M1 flows, the map buy with its
line, the leaving card, the tow, three Sporewood evenings, each place, both giants and the Grove's hunt forced by the debug hooks, the
Tackle screen, the way back to the Mossmere and its Matriarch, a reload mid-tow), at 1280×720, 960×540, the near-square phone, 390×844
and the Legion Go (touch and controller); `hue-report` and `clarity-perf` on Sporewood; the flag-off fingerprint unchanged; then
`LOOP.shipped = 'sporewood'`, `index.html` rebuilt, the user's look sheet (the two waters side by side, day, dusk, night) and a short
film of the tow and the first evening.

### 9.1 Lane D1 as built (gw-lake2)

Data only; `LOOP.shipped` stays `'mossmere'`, so no lake map, sheet, shelf card, Journal tab, gallery wing or trip reaches any of it,
and the Mossmere plays as before (the readers of a shared table keep to the shipped waters: the Chart's sheets and next water,
`mapCards`' frontier, the Journal's tabs, the gallery's wings, the gear log's tins and lures).

- **`src/data.js`**: `LOOP.waters.sporewood` (order 2, tier 11, its place prices, `lake` 1,400, `plainBait`, the `places` its lake map
  opens: the Lullaby and the Gill Harp); `LOOP.places` += `lullaby` (day, `lake`), `gill_harp` (old, `lake`, the Harpstring),
  `veilwater` (night, 1,200, the Festival Puffer), `mothers_cup` (crown, 2,200, the Drifting Grove), each with `out`, `card`, `draws`;
  `SPOREWOOD_LOOP.places` (their geometry and names, which `loopPlace` merges as MOSSMERE_V3's; W1 refits them); `LOOP.species.sporewood`
  (the nine); `LOOP.kept` += the Capshell, the Angler, the Jelly, `LOOP.keptAs` (the Jelly the Lullaby's own on Amber Larvae);
  `LOOP.leftOut.sporewood` (the three); `LOOP.legendBait.sporewood`; **`LOOP.gear`** (each water's tackle tiers, hold steps and raft
  parts: the Mossmere's read from TACKLE, LOOP.hold and LOOP.raft; Sporewood's §7.1 and §0A); **`LOOP.carry`** (share ⅓, round up,
  castFrom 16, tackle, cast, slots, raft); **`LOOP.arrival`** (§8.3); `LOOP.lures` += the five (`water: 'sporewood'`); `LOOP.tins.sporewood`;
  `LOOP.start.sporewood`; `LOOP.gearCap.lineAt`, `.item.seedpod_twirl`; `LOOP.mooring.sporewood` (the design's figures; validate-data
  checks it once the arena has its outline, a warning until then); `LOOP_BODY_K` += disc, bream, finlet, catfish (each a cousin's, for F
  to confirm); `ROSTER_ART` += the fourteen looks' keys (the §2.3 words; F builds and paints them). Under the loop the apply block adds the
  new items' LURES and BAITS rows, Sporewood's fourteen records in SPECIES after SPECIES_LOOP (the left-out three out; the Nightbloom its
  one guest record), the Spore-Lamp Fly re-aimed at the two giants and each Sporewood item's Hold targets from its hook table.
- **Words** (`TEXT_LOOP`): `gearItems` (the thirteen), `gearNamesAt.sporewood` (the raft parts), `shelf` (each item's line), `shelfAt.sporewood`
  (the creels' and the raft's lines), `maps` (the four places and the lake map), `murk.at.sporewood` (map, home, away), `leave`, `mapLeaves`,
  `carry`, `guide.newWater`.
- **`src/watercraft.js`**: `WATERCRAFT.sporewood` (`hookItems`, `raw`, `hook.table` with the Button's column made from `hook.button`'s
  rule, `mult` and `cap` as the Mossmere's, `giants`; `geometry`, `shares`, `factors`, `tells`, `sight` null for W1, D2 and the watercraft
  lanes), `HOOK_ITEMS_AT`, `LURE_IDS_AT`, `BAIT_IDS_AT`. Every reader still keeps to the Mossmere's tables: D2 threads the water through.
- **The roster**: `roster.json`'s eleven `favours` read Sporewood's items (the Threadling "bites on Spore Cake only", its body the swampeel's);
  `tools/roster-export.mjs` `NEXT` exports Sporewood's ten beside the Nightbloom.
- **Checks**: validate-data `--loop`'s "LAKE2 D1" block (every key above, the list rule, the repeats rule, the hook table, `lineAt`, the
  words, nothing on a fresh save's shelf or map cards).

### 9.2 Lane D2 as built (gw-l2-d2)

Logic and the sim; `LOOP.shipped` stays `'mossmere'` and the Mossmere's every figure is unchanged (its sim runs byte-identical; the
Mossmere's line caps by its total Hold equal its caps by tier for every fish, hook and tier).

- **`src/loop-carry.js`** (new, pure): `carryAdd` (ceil(H × ⅓) a slot from the best bought tier, the cast beyond 16 m, the hold's slots
  bought there, the raft parts' levels × ⅓ unrounded), `applyTow` (the carry grows; the tackle to the start pieces, a fitted tier off, the
  hold to its start + the carried slots, the raft to none, `gearWater` the new water; its start kit once: the Seedpod Twirl owned, a tin of
  Spore Cake, fitted; found pieces stay fitted), `leaveTerms` (the leaving card's figures and its carried line, nothing written),
  `tackleHold` / `castMaxOf` / `hookWindowOf` (the carry + the fitted piece), `raftLevels`, `lureHere` (a water's own lures, found ones
  everywhere), `arrivalOf` (the first evenings' rule by evenings fished at a towed water), `lineCapAt`.
- **The save** (additive; LOOP_SCHEMA stays 4): `carry {rod, line, reel, cast, slots, raft}`, `gearWater`, `fit {rod, line, reel}` (from
  `found` once; fitFound keeps them in step), `eveningsAt {water: n}` (from `evenings` for an older block; the tally counts each).
- **`progression-loop`**: `towTo(water)` (a first tow: the carry and the reset, written before one save; a towed water: the way back,
  only the barge moves); `towBarge` routes a later water's first tow to it (loop-tow's one call); `leaveTerms`, `carried`, `holdOf`,
  `fitTackle` (lane G's: a lower tier, a found piece, the best bought). The shelf is the gear water's tiers and hold ladder; lures and
  tins the barge's water's; the gate line and the Journal's hint read the fish's own water; a trip carries `run.arrival` on its first
  evenings; `fit('lure')` and `changeHook` refuse another water's lure.
- **`loop-gear`**: lures and tins by the barge's water; a later water's raft parts (prices, names, lines); `raftStats` / `raftTerms` with
  the carried fraction; Murk's orders keyed by water (an order without one is the first water's; each water fills its own board).
- **`watercraft`**: `water` threaded through `gradeOf`, `gradeTargets`, `hookWeights`, `finishPool`, `castOdds`, `lureStrike`, `gearCap`
  (left out: the Mossmere, as before); `gearCap`'s line term by `lineHold` against `LOOP.gearCap.lineAt[water]`.
- **`fishing`**: a water with its own hook table draws on it (`wcWater`; the areas stay the Mossmere's until W1's geometry is baked);
  the line's total Hold to the cap; on the first evenings the cap lands and the Fight term is eased (`catchParts` re-read, loop only).
- **`progression`, `progression-af`, `loop-sheet`, `ui-tackle`, `ui-gear`**: the stats, the loadout and the sheet read the carry and the
  gear water's tiers (the sheet's model carries `tackle.carried`, the carried line, for G); the tin and the lure slot show this water's.
- **`data.js`**: Sporewood's value tier 12 (§8.4), the one value moved.
- **The sim**: `clams.mjs --shipped=sporewood` (`shipSporewood` reshapes the draft Sporewood to the game's; small seams gated on a later
  water's kit: `kitHold`, the soft cap, the eased Fight, fractional raft parts, the list player's hooks) and `tools/sim/sporewood.mjs`.
- **Tests**: `loop-carry.test.mjs` (the arithmetic, stacking over two waters, nothing lost without the card, a reload mid-tow, the save
  fixture `fixtures/loop-save-m1-end.json` → +2 / +2 / +2, the shelf, the way back, the caps, the arrival rule, orders by water,
  fitTackle, T104 on Sporewood's pools); the fixture's `fakeLoop` carries the five new methods.

### 9.3 Lane W1 as built (gw-l2-w1): the outline shore

Grey-box; `LOOP.shipped` stays `'mossmere'`. **The Mossmere does not move**: `tools/tests/outline-shore.test.mjs` part 1 (the lane's first
commit, before any builder moved) pins its layout (the polar shore at 720 bearings, depth, shore distance and open water on a 1 m grid,
the obstacles, the docks, the cut), the world module's collision and shore queries, the Chart's water geometry and the built arena (high
and low) in the flag-off, v3, loop and `?redress=0` builds, and Sporewood off the loop: every hash as at gw-lake2's 87408ff.

- **The engine** (`src/world-outline.js`, pure): the shore a closed centripetal Catmull-Rom curve sampled every metre, each island its
  own curve; one signed-distance grid (1 m nodes over the basin and 28 m round it: 233 × 150; even-odd fill, the exact distance to the
  nearest segment within 3 cells, the nearest segment passed on to the rest, both ways twice), bilinear; each node's bank top, shelf
  and island-ness softened by about 3 m, so the ground behind two banks of different heights and the shallows between two shelves meet
  without a seam. Built with the layout: about 11 ms warm and 60–100 ms the first time (node, a machine shared with another lane).
  `sdfAt`, `sdfGrad`, `nearestAt`, `bankAt`, `groundAt`, `shoreAt` (by arc length), `arcAt`/`alongAt` (a control point's arc, the
  nearest shore point's control parameter), `polarShore`.
- **`world-layout.js`**: `layout: 'outline'` (`buildLayout` builds the field; R the farthest water from the centre, 105; `L.shoreR` the
  farthest water along a bearing, a fallback for the polar readers only, never the collision or the water); **`shoreDist(L, x, z)`**
  the one seam (the field, the islands in it); `fromShore` (the lake's own shore: radial on a polar one, as built), `groundAt`,
  `shoreAt`, `shoreArc`, `shoreAlong`, `sheetOf` (the Chart's). `isOpenWaterL`, `insideShore`, the docks' push and the light shafts read
  the field; an outline island's collision circle is its inscribed one (the field does the rest); an outline water with no gate has no
  standing stones. **Depth** (`outlineDepth`): the shore's distance through each bank's shelf, a floor, the bowls (the West Pool 0.8 at
  (−46, 4), the East Pool 0.85 at (40, −4), the neck's channel 0.6), the Mother's Cup blended to 1.0 (only deepening on the way in),
  remapped to `depthShare` 30 / 42 / 28.
- **The arena** (`data.js` `SPOREWOOD_ARENA`, under the loop `ZONES[1].arena`; the flag-off game keeps its twoBasins Sporewood): the
  design's 45 points with **the Veil inlet drawn as a real backwater** (its three points become seven: a mouth 12 m wide, a pocket that
  holds the Veilwater; 49 points), a bank profile [top, shelf] at each point, six islands each its own outline (**the Mother's Foot set at
  (59, 12)**, 3 m east of the design's, so the Mother's Cup is all water), the bowls, the Cup the legend's water, no gate, the spawn, one
  dock (Rootfoot's jetty). Measured: 9,137 m² inside the shore (8,869 of water, the islands out), 569 m round, isoperimetric 0.36,
  x −94…80, z −46…46, the neck 10.95 m at x = 0.
- **The places fitted** (`SPOREWOOD_LOOP.places`): the Lullaby (−51.5, −35) r 7, the Gill Harp (0, 6.5) **r 4.5** (it fills the neck:
  0.5 m off each bank; its bank's feather lies over the banks), the Veilwater (−86, 38) r 5 in the inlet's pocket, the Mother's Cup
  (48, 6) r 6; each ≥ 80% open water. **Their glides** (`LOOP.places[id].out`) leave Rootfoot along the mooring's lane, round Murk's
  barge, through the neck (every West Pool place), clear of every bank and island by the raft's radius + 0.3 m (the Veilwater's 157 m,
  the Lullaby's 126 m, the Gill Harp's 61 m, the Cup's 27 m); `LOOP.tutorial.outPath.sporewood` the open water's.
- **The mooring fitted** (`LOOP.mooring.sporewood`): the Mossmere's own (its raft, Murk, lane and both camera poses) turned and set
  down in Rootfoot cove with the barge's bow north-west into the East Pool (hull (32, 25), yaw 0.55): every one of validate-data's
  mooring checks (now on the field: `mooringChecks({shoreDist})`, the bodies 2 m off the bank, every glide off it by 1.9 m) and its
  frame checks at the 18 sizes pass. The home view looks across the barge toward the neck's mouth; the Mother Cap (§3.4) stands to the
  right, outside the landscape lens (the design's figures could not hold both the barge and the cap).
- **The readers**: `world.js` (the collision held off every bank up the field's slope; `getShoreDist`, `getFromShore`, `getGround`,
  `getShoreAlong`, `getOutline`; no gate and no gate ring on an outline water; W9's toll-tower and Sluice Veil the Mossmere's only);
  the water's bake reads `getShoreDist` as built (its half R + 8 = 113 m: about 1.4 m a texel); `watercraft.probeOf` (`getFromShore`,
  `along`), `areaAt({geo})` (a water's own geometry; reed runs `[u0, u1]` along the curve); `watercraft-face.reedPlan({geo})` (clumps by
  arc length); `actors-heron` (its margins by arc length); `fishing`'s sight (the field); `loop-rules.mooringChecks({shoreDist})`,
  `pathShore`; `ui-chart.waterGeometry` (the sheet is the world's outline every 2 m, each island its own, `shoreDist`); `chart-draw`'s
  `sideOf`. **The banks** (`world-art.js`, `buildBanks`): one mesh, the ground on a 2 m grid (3 m on low) out to R + 20 under the first
  ring, the waterline through its vertices (on the shore within 0.1 m), the deep bed left out, earth and moss in the kit's dark tones,
  smooth normals: 21.7k triangles on high, 9.7k on low; the shore's mist a band 1.5 m back along the curve.
- **`WATERCRAFT.sporewood.geometry`**: the inflow under the Seep, the outflow by the Root Weir, the drop-off round the Cup, three lily
  beds, reed runs (the Reed Flats, Lily Cove's head, the East Pool's south bank), the reed and root islands, the lane in the West Pool and
  its avoid list. The shares and factors wait for the water's threading through `laneFor`, `areaShares` and `fitFactors` (D2 or the gate).
- **Measured in the browser** (`tools/tests/lake2-w1.scenario.mjs`, the world put on Sporewood by `zone:change`): the raft driven at
  six banks stays 1.6 m off each; no error; at night on the West Pool 164 calls and 242k triangles in all passes at 1280 × 720 (high),
  155 and 203k at 390 × 844 (medium). `tools/outline-map.mjs` draws the basin top-down (the field, depth, ground, places, docks,
  mooring and glides).
- **Left for W2 and C**: the greenery and the landmarks (the hero caps are still the built Sporewood's, placed on the polar fallback;
  the places' dressing is world-places' generic one); the Chart's sheet 2 (the polygon is ready in `waterGeometry`; chart-draw's
  hachures and docks are still radial).

### 9.4 Lane F as built (gw-l2-f): the fourteen looks

Art; `LOOP.shipped` stays `'mossmere'`. **The Mossmere's fish do not move**: every new word is read only under the loop and only by a
species whose model carries it, and `tools/tests/models-plans.test.mjs` pins the geometry of sixteen Mossmere fish (each eel, carp, minnow,
crayfish, perch, pike, trout, the lamprey, the sturgeon, the Matriarch's catfish) at gw-lake2's 85e6fb6; off the loop a model carrying
Sporewood's words draws as its built plan, exactly.

- **Three new plans** (`models-fish.js` `LOOP_SHAPES`; `FISH_SHAPES` under the loop): **disc** (a river ray: a near-round lathe disc, eyes
  on two turrets with a spiracle behind each; `tail` 'sting' a stout tail with one bone sting, 'whip_barb' a whip with one barb near its
  root; `snout: 'point'`; `eyeRings` n cream rings with dark centres laid on the skin's normal; `meadow`: twenty moss tufts, seven curled
  ferns and nine tiny caps whose gill discs are the glow mesh); **bream** (a plate on edge, its height `depth` × its standard length, a blunt
  rounded head, a sawtooth keel, a long spiny dorsal, a scythe tail; `jaw: 'square_teeth'`: four square teeth above and four below in a dark
  mouth held a little open); **finlet** (a rigid teardrop, two dorsals tapering to points, six finlets above and six below the stalk, the
  stalk's keels, a long jaw line, a stiff crescent tail; `scribbles` painted over the back). The fin helpers gained `taper` (a pointed
  fin) and a tail's `sweep` and `root` (a crescent or a scythe); without them each card is the built one.
- **Five built plans' loop builds** (`loopVariant`, under the loop and only with the words): the **eel**'s girth, paddle head, square
  section, no back fin, a ribbon fin under the whole belly or only a skin fold at the tail, pin eyes, a pointed tail, `strings` (the
  Harpstring's three lines a flank, painted into its skin and its emissive map: a first build as glowing tubes bloomed like neon in the
  show and was dropped), `mottle` and `bellyLine` (the Threadling's bark); the **carp**'s head (× at the head, the gill a third of the length
  back), arched back, short deep stalk, no barbels, upturned mouth, coin-sized scales edged in cream with their edges lit faint amber (the
  Nightbloom, its glow at 0.45 of a lit fish's); the **minnow**'s `skin: 'glass'` (a translucent milky body, a dark spine with its comb of
  short spines, a silvered gut, the eye ×1.6, an amber tail spot) and `cloud` (the Netcloud Fry: four more of the same meshes and materials
  held round it, in the picture only while it is shown, `setWet`); the **crayfish**'s `carapace: 'dome'` (a freckled cream-ochre cap with
  a rolled rim and thirty gill ribs under it, tiny claws, antennae ×1.8 with amber tips: the Capshell); the **puffer**'s four-toothed beak,
  short prickles, an amber-ringed eye-spot each flank and its `lantern` (the Festival Puffer: its glow rests at 0.14 and rises with the
  puff, the show puffing it to 0.55, a paper lantern's ribs in the emissive map); and the **catfish**'s two bullet heads (`catfishBullet`;
  the Matriarch's shovel path untouched): the Downcast's shark build (deep, high-shouldered, a tall pointed back fin, a tall forked tail,
  no whiskers, the eyes below the mouth line) and the Cindertail's (four pairs of cream whiskers fanned forward, a tall dorsal, a fatty fin,
  a cream side line, the tail its own ember-to-amber mesh, `fins_tint`).
- **`ROSTER_ART`**: the fourteen painted (plum, amber, rose, cream; the Threadling's olive bark and the Grove's moss the brief's own); glow
  only on the Harpstring, the Festival Puffer, the Grove and the Nightbloom (and the kept Angler and Jelly as built). The Nightbloom's one
  record changes its look, so the Mossmere's notebook guest is the new barb too (its lavender flank glow gone).
- **The show** (`actors-show.js`, `actors.js`): the disc is held as the ray is (its back to the lens, its whip hanging). The Grove's whip
  was shortened (0.95 → 0.62 of the plan's length past the disc) so her disc reads nearly the raft's width.
- **The ink** (`ui-fishart.js`, every 2D drawing under the loop: the catch card, the Journal and its hatch, the shelf, orders and prints):
  the bream and the finlet profiles, `drawDisc`, the eel's, the puffer's and the Capshell's loop drawings, the catfish's two heads and the
  Nightbloom as loop profiles, and the Fry as a cloud of five.
- **Body keys** (`LOOP_BODY_K`, confirmed by `tools/sim/roster-check.mjs` on new docs-only refWeights in `roster.json`): the disc 0.012
  (+3%) and the catfish 0.011 (+2%, +14%) stand; the bream **0.016 → 0.026** (a plate-bodied fish of 21 cm weighs about 0.25 kg: D1's carp
  key was −39%) and the finlet **0.011 → 0.0086** (+28% on D1's trout key). Prices read the L50, never k: the sim's figures do not move.
- **Budgets** (z 0, every mesh and its ink outline): the Grove 12.0k triangles, the Velvet Ray 9.4k, the rest 3.0k–6.6k (the built
  sturgeon is 15.4k); at most 7 meshes a fish; the Fry's cloud adds four copies' draw calls in the show only.
- **Tests and frames**: `models-plans.test.mjs` (each of the fourteen on its plan, in budget, no NaN, its drawn length within 2% of the size
  model at three z, each unlike its relative by measure, the pins, the off-loop words ignored); validate-data `--loop`'s "LAKE2 F" block
  (the plans drawn shapes, every look painted, glow only where named, each pair unlike, the new keys within ±30%);
  `tools/tests/lake2-f-look.scenario.mjs` and `tools/lake2-f-sheet.mjs` (the show and the card of each fish beside its relative, forced
  bites on the Mossmere's open water, desktop 1280 × 720 and the 390 × 844 phone; two look-and-fix rounds: the Harpstring's tubes, the
  lantern's glare, the Fry's cloud spread, the Barb's teeth too small to read, the Grove's whip).

### 9.5 Lane W2 as built (gw-l2-w2): the ember garden made green

Art only; `LOOP.shipped` stays `'mossmere'`. **The Mossmere does not move**: nothing of it reads a look (`ZONE_LOOKS` has no Mossmere,
lush 0), so its programs, its draws and its geometry are as they were (outline-shore.test.mjs part 1 passes unchanged); off the loop
nothing reads `ZONE_LOOKS` at all (Sporewood's flag-off arena is its twoBasins one, pinned).

- **The colour script first** (`tools/loop-colour-script.py`, the lane's first commit): Sporewood's own frame (the East Pool toward the
  neck: the cap-rim window, the neck's green walls, the Gill Harp's strings, the Mother Cap and its amber pool, the near moss banks, lily
  rafts) at step 5's targets 12 · 10.5 · 6.5, fitted and measured, every lint and gate passing; the one exception to the step rule is
  its `EXCEPT` table (the step into Sporewood holds the lower bounds; the step out prints as pending until the later waters re-step).
  WATERS §1, §2, §5.3, §6 and §7 carry Sporewood's new row and the note.
- **The look** (`data.js` `ZONE_LOOKS.sporewood`): §3.3's keys (lush 0.33, the leaf keys, `mossG`/`mossGHi` at 0.6, `bloom`, fireflies)
  and three figures the frames needed: `gain` [0.82, 1.65, 0.62] and `albedo` 1.4 (Clear Night's violet light, ambient and shadow
  split-tone render an olive albedo violet-grey: the gain carries the leaf track through it, so a lit leaf lands near its own key),
  `floor` 0.17 by day and `night` {floor 0.3, trans 1.23} (WATERS §5.2's flora floor tint; the moon's light through the leaves). The
  palette, its air and its grade are as built: the green is on surfaces only.
- **The kit** (`src/world-flora.js`): six archetypes and the trees from prototypes stamped into merged meshes in 3 × 2 cells, two
  materials a cell (`flora`: blades, strands, shrubs, trees, mirrored and casting; `flora.low`: cushions, ferns, pads), one on low;
  opaque, double-sided, sway and the raft's parting in the vertex stage (reeds bend away, the Veil's curtain and the gill strings part
  round the raft), the backlit translucency and the floor in the fragment stage. On high: 420 moss cushions and carpets, 162 ferns (12
  tree-ferns), 252 reeds and 115 sedge, 150 lily and leaf rafts with 29 flowers, 42 shrubs, 6 broadleaf leaning over the water, 40 far
  crowns, about 140 strands (the trees', the Veil's 76, the Gill Harp's 32, the Mother's 18, the willow arch's), 120 fireflies: about
  28k triangles, 1,325 plants (medium 0.7×, low 0.4×). Reeds lie only on the water's reed runs and round the reed isles, the rafts on its
  lily beds, the frogs' beats and the shallows: the art is where the fishing reads it. Tall kinds keep off the lens's side of the water
  (the play lens is always south of the raft); the places, the mooring and every glide keep 2.4 m clear; fireflies only over the reeds,
  ferns and shrubs. The banks' moss: `mossG` in drifts over about 60% of every bank top (whole where they lie, earth between), with the
  kit's floor. Its own seeded stream (`L.artSeed ^ 0xF10A`).
- **The landmarks** (`src/world-sporewood.js`; none of them stone): the cap-rim window (12 far caps, 28–40 m, in the landmarks'
  statics), **the Mother Cap** on the Mother's Foot over the Cup (its cap 22 m across with lit gills, roots splaying into the water, 18
  vines; **20 m, not the design's 30**: the sail lens looks about 11° down with the top of its frame about 17° up, so a 30 m cap was
  never in a play frame), **the Gill Harp** (two caps leaning over the neck from both banks, the lens's side's foot 6.5 m back, their 32
  gill strings and moss threads hanging to 2.9 m over the water), **the Veil** (a fallen cap stalk across the inlet's narrowest crossing
  on the Veilwater's glide, 12.5 m, its broken cap half-sunk in the bank, a two-row curtain of 76 strands that parts round the raft),
  **the Seep** (its own scrolling card and broken foam at its foot, mossy boulders and ferns in its ravine), **five Lantern groves** of
  glowcaps and the two stools' caps (the spore moths' lamps), **14 cap trees** on the banks and the isles (Mossback's leaning cap,
  Rootknot's roots, the Tussock's grass), **Rootfoot Landing** (a plank jetty on root-posts, a living willow arch with hanging leaves,
  terracotta pots grown over with fern), the **spore-haze** (one mist-sheet draw in the coves and on the Reed Flats from dusk) and the
  places' banks in its rose-cream tint, sitting 0.7× as high. Stalks and caps join world-art's statics (0 draws); the see-through cut
  runs on Sporewood too, reading the Gill Harp's lens-side stalk and the willow arch.
- **The water** (`GW_LUSH`, a define set only on a lush water, so the Mossmere's program is as built): the moon coins' static dapple
  (the canopy's shade within 14 m of a bank, coins through its gaps; no animation, no glitter) and the shallows' weed film, baked in the
  depth texture's spare channels (no new sampler).
- **The lens** (`LOOP.camera.sporewood`, `render-camera.waterLens`): the sail framings × 0.8 and +4°; in the neck × 0.84 more and **5°
  steeper, not lower** (lower put the neck's 2.5 m south bank across the foot of the frame).
- **The life**: the spore moths are the wick-moths in Sporewood's colours (cream forewings, amber hindwings; the plum eye-spot is below a
  pixel at their size and is left out) round its glowcaps; the lily frogs keep the lampbills' ways on a frog of their own (moss-green
  back, cream throat, amber eyes) on the lily beds, plopping in within 10 m of the raft; the gill-flakes drift the outflow to the Root
  Weir as the candle-boats do, with no flame.
- **Measured** (`tools/tests/lake2-w2.scenario.mjs --hue --tier=medium`, 960 × 540, the spawn, the day water and the old water):
  green share **day 12.4** (11.3 · 15.4 · 10.6), **dusk 10.0** (9.0 · 12.7 · 8.2), **night 6.4** (5.3 · 7.7 · 6.1) against 12 · 10.5 ·
  6.5 (±10%): all three inside; teal ≤ 1.0% of every frame; the Mossmere's frame 0.0%. **The cost** (`clarity-perf --loop --sporewood`, 960 × 540, at night, the West Pool, the East Pool and the neck): medium 179–182
  calls and 236–238k triangles in all passes (≤ 230 and ≤ 320k), the world's own 32–34 calls, 6–8 fewer than the Mossmere's with its four
  banks standing (40), cpuMs 6.9–8.8k against that Mossmere frame's 20.8k; high 182–187 calls and 344–353k triangles. On the phone (390 × 844, `--mobile`): low 97–99 calls, 104–107k triangles, cpuMs
  1.7–2.0k against the Mossmere's banks frame's 4.9k; medium 178–181 calls, 230–240k triangles, cpuMs 2.6–2.8k against 5.6k. The kit is 14
  meshes (12 cells, the flowers, the fireflies), 28.8k triangles on high, 20.8k on medium; the arena builds in 150–260 ms warm on
  high (the Mossmere's 190) and 60–180 ms on low, the kit 27–94 ms of it (node, on the shared box).
- **Left for the gate and C**: `LOOP.shipped = 'sporewood'` (nothing reaches it in play until then: the scenario puts the world on
  Sporewood itself); the Chart's sheet 2; the sky's share measured on sky pixels (hue-report reads the whole frame); a look sheet beside
  the Mossmere's at the gate's index.html.

### 9.6 Lane G as built (gw-l2-g): the Tackle screen

§5.5, built over D2's ledger (`fitTackle`, `changeHook`, `canChangeHook`, `meta.loop.fit`); nothing of it reaches the flag-off game, and
the Mossmere fishes as before (the screen only fits what the tin, the sheet's chips and the Kit row already fitted).

- **`src/ui-tackle.js`, the pure half**: `tackleScreenModel(D, {metaLoop, run, line, canChange})` → the head (the water's name, the
  carried line from the first tow on, "After this fish." while a fish is on) and the five rows **Rod · Line · Reel · Lure · Bait**. A
  tackle row is the start piece, each tier bought at the gear water's shelf (a lower one can be fitted; the best bought is asked as `null`,
  so a tier bought later fits itself) and the owned found pieces; the Lure row the water's own owned lures in `LOOP.lures`' order, then
  the found ones (they travel); the Bait row the legend's ball, the water's tins and Cut Strip with any left, then the bare hook. At home
  the hook is the save's fit for the barge's water (what the next trip carries); on a trip the run's (a line out: the cast's bait). Under
  the fitted chip, its gear-log lines only: `+{n} Hold.` (the carry with the piece), `Casts {m} m.`, `Lands up to {class}.` (the line by
  `lineAt`, a lure's or a bait's own cap), a found piece's own lines. No odds. `screenCall(item)` is the tap's ledger call
  (`fitTackle(slot, pick)`; `changeHook({lure})`, `({bait})`, or both off for the bare hook: one thing on the hook). The start pieces keep
  their names at every water (they travel); a later water's tier is named by its item (`TEXT_LOOP.gearItems`).
- **The view**: `openScreen({from, pauseChild})`, `closeScreen`, `screenOpen`, `pauseItem`. A blocking modal (the evening waits): a veil
  over the water, the head, the rows (each a head and a strip of engraved chips; the fitted chip inked and brushed under its name), a fixed
  foot with **Done**. A strip that overflows scrolls sideways (a swipe, the wheel) with a fade at the edge it hides; on opening, and on
  a focus from the keys or the pad, it turns the chip whole into view clear of the right fade with **its left edge on a chip's own** (never
  part of a name at the left: the 32 px left fade lies over an engraving only; a spacer after the last chip lets it turn that far); a
  tap never moves a strip under the finger. A name over 14 letters breaks at the space that halves it best ("Harbour-Bell ·
  Spinner", "Gate-Guard's · Button"), so its chip is only as wide as its longer line. Up to 1,360 px wide (a row of six lures whole
  from 1,280 px); under 700 px wide a sheet from below with each row's head above its strip; under 500 px tall (a phone held sideways)
  the foot beside the head and the chips closer; the pause panels' items closer there too, so the closing flourish stays under
  Settings with the Tackle item and two lock lines. A trip's tips and
  Murk's lines wait under it and under the drawer (`.gw-tk-veiled`: both are quiet modals, which ui.js's `.gw-tipless` does not count).
  One sound a fit (the tin's lid click); a waiting line brought in quietly by a fit gives the reel's ratchet when the screen closes.
- **Ways in**: the barge's **rod rack** opens it (its accessible name "Tackle"), its foot carrying a link to the Wick's sheet at Tackle
  (what the rack opened before, SHEET.md §2.3); **both pause menus** carry a *Tackle* item after the tutorial (home: Resume · Sheet ·
  Tackle · Settings; the trip: Resume · Sheet · Tackle · Home · Settings), dimmed with "After this fish." while a fish is on (a tap: the
  denied sound, nothing opens); on the water the **tin's drawer** carries a door at its Lure row's head, *Rod · Line · Reel*, only while no
  line is out (a line out: the drawer as before). The screen opened from the tin closes when the trip ends.
- **Input**: touch and mouse tap a chip; the keys: the arrows (and WASD) move along a row and to the nearest chip of the next row, then
  the foot, Enter fits, Esc or B closes; a pad: input-pad's own focus (the UI's frame, never in the world) over the same buttons, the
  D-pad or stick moves, A fits, B closes.
- **The ledger**: `buy` of a tier fits it (a lower tier fitted on the screen gives way; a found piece stays fitted). The Wick's sheet
  shows the carried line above its plates (`.gw-sh-carry`, the hand glyph), and names the start pieces at a later water.
- **Words**: `TEXT_LOOP.tackle.screen = { rod, line, reel, done, hold }`; the title is the tin's ("Tackle"), the Lure and Bait heads the
  drawer's, the log lines the built ones (`TEXT_LOOP.lost.log.cast`, `TEXT_LOOP.gate.upTo`); the carried line D1's `TEXT_LOOP.carry`
  (added to the sheet's word list).
- **Tests**: `tools/tests/lake2-g-tackle.test.mjs` (80 checks through the real ledger: the rows at the Mossmere and after the tow, found
  pieces, the taps, a tier bought after a lower one, a trip with a line out and with a fish on, the way back, every word on the T43
  list); `tools/tests/lake2-g-tackle.scenario.mjs` (every way in, every input and the layout's checks at each size: each target ≥ 44 px,
  text ≥ 16 px, every name whole inside its chip, no two words over each other, nothing off screen, the five rows without a vertical
  scroll, each fitted chip in view, a turned strip's left edge on a chip's; the home pause with its new item on screen at each size, the
  trip pause with two lock lines at 844 × 390; the key's and the pad's chip whole in view; the tin's door, a line out, a fish on, no tip
  over the screen; after the tow the head, the rows and the sheet's carried line).
  `loop-5a` and `loop-sheet` read the rack's new screen and the pause menus' new item.
- **Measured** (the scenario; desktop 960 × 540, 1280 × 720, 900 × 1000, 1920 × 1080; `--mobile` 390 × 844, 358 × 664, 690 × 760,
  844 × 390 and the Legion Go's 1280 × 800 by touch): no layout fault at any size, no page or console error.
- **Left for lane S**: Sporewood's engravings. The chips draw `murk-engrave`'s plates, which know the Mossmere's items only: a later
  water's tier is drawn as the Mossmere's plate of its slot and level, the Seedpod Twirl as a spoon, the Spore Cake as the worm tin. The
  screen's art card for a later water's tier carries `itemId` and `gearWater` beside `slot` and `level`, ready for `plateKey`.

### 9.7 Lane C as built (gw-l2-c): the road in

`LOOP.shipped` stays `'mossmere'`: everything below waits unseen until the gate sets it, and nothing of it changes the Mossmere's game
before the tow (its Chart's 288 layouts, every size, fixture state and pick, are byte-for-byte the base's; `lake2-c.test.mjs` and a
scratch diff against gw-lake2).

- **Sheet 2, baked ahead** (`node tools/world-map/build.mjs --game`): `game.mjs`'s `shippedSheets` bakes the shipped waters' sheets and
  the next water `LOOP.waters` already holds, so the gate needs no second bake. The Chart draws a sheet only once its water is open,
  and decodes it only once the save owns its map (`ui-chart.prepare`, `sheetsFor`), so a phone pays nothing for it before then.
  Sporewood's crop: box 488, 228, 164 × 109 Chart units (902 × 600 px), **57.6 KB** raw WebP with alpha (76.8 KB as base64; its line
  100 KB). The live layer gains `more[2]` (the edge and wisp with two sheets owned); the veil fixture holds one grid per count owned.
  `canon.mjs`'s Sporewood is the outline's two pools and the bent neck (§6.2's three blobs), its ground's height guides kept at the
  first sketch's (`heights`). **Sheet 1 re-baked**: the global drainage routes a few thin streams on the Mossmere's sheet a little
  differently (3,631 of 835,670 px, all in its south-west, no lake, road, mark or word moved; its hash 2dd4a235 → bd0d732a).
- **The Chart for two waters** (`chart-draw.js`): `chartReach(model, art)` is the window over the owned sheets (their boxes' union;
  one water: the first sheet's own box, edges and wisp, exactly as M1 drew it); each owned water's mark on the window lays its own sheet
  beside it (`[data-sheet]`); the card is the picked water's. An outline water's sheet (`drawOutlineLake`, from `ui-chart.waterGeometry`:
  the world's own shore every 2 m with each sample's bank height and normal, its isles' coasts, its reed runs by arc length, the Seep
  and the Root Weir, its mooring) is one closed coast in the pen; hachures fall away from the water only where the bank stands high
  (the Fern Bluff, the East Pool's north shore), broken, longer where higher; reed hatching on the Reed Flats and round the reedy isles;
  the Seep comes down its ravine and the Root Weir lets the water out; the isles are their own small coasts (the Mother Cap on her
  foot); the Mother's Cup a dark well, never a ring; the root jetty, the Hearth where it lies, Murk's lily-pad barge. The four places
  draw their own vignettes (lily rafts, the harp's strings, the parted veil, the great cap). On an outline water a place's words never
  cross the pen: they letter on the water or out on the paper beyond the coast (the lake is fitted with a band of paper above and below
  it for a line of names); on the smallest sheets (358 × 364 and 354 × 372, all four owned) a name with no room waits unlettered, its
  mark alone, until it is the chosen place, lettered first (across the pen only if nothing else is free). Checked over 220 layouts,
  354–1200 px wide, with and without a next water's sealed sheet (`lake2-c.test.mjs`). The coast's water is the world's within 3% and every vertex lies on the SDF's shore.
- **The keys** (SPEC §5.5): `waterOpen(meta, D, water)` (progression-loop): a later water is drawn and sailed once its map is owned and
  shipped and its gear and catch keys are held, or once the home has lain there (towed: open for good though its rod stayed behind).
  `loop.isOpen`, `chartModel` and `chartNext` read it: a map bought with a key missing stays the sealed sheet, its map seal pressed. A
  shipped next water's sealed sheet carries its map's price where "Coming soon" stood; tapping it opens Murk's Maps at its card. Buying
  the lake map owns the places it opens (`LOOP.places`' `lake`: the Lullaby and the Gill Harp), as the sim already counted them.
- **The map card**: the shelf's sealed card and the catalogue's lake page show the map's line, **"Moving on leaves bought gear
  behind."** and the price, never clamped; buying it says Murk's line, "New water, new tackle. Your hands keep a third."
- **The leaving card** (`ui-tow.leave`, opened by `loop-home.sailAway` on the first Sail for a water not yet towed to): "To Sporewood
  Pools", the raft towing the Hearth in ink with Murk alongside, the four lines (`TEXT_LOOP.leave`), the hands' figures by the rod, line
  and reel glyphs from `loop.leaveTerms` (+2 · +2 · +2 from the Mossmere's top), **Not yet** and **Tow**. Nothing is written until Tow;
  Not yet, Escape and Back leave the Chart as it was.
- **The tow** (`LOOP.tow.legs.sporewood`: the Lockwater's piece, sailed against its flow from the Mossmere's lamp to Sporewood's, a fall
  and a lock: 4 s + 2 × 0.5 s; `LOOP.tow.glideIn.sporewood`: astern, `d` 14 m, the line 3 m): Tow writes the carry and the reset as the
  leg begins (D2's `towTo` through `towBarge`, one save), the leg plays over every sheet the road has inked from the water left, the
  world is put on Sporewood under the dip's full ink (`loop-tow` `show` → `loop-home.showWater`), and the Slow Hearth comes in stern
  first to Rootfoot Landing, the raft towing it by the stern (`towLeadPose(…, {astern})`), then the evening at Sporewood begins. No
  per-water camera key was needed: the glide in's camera frames from the mooring (§9.5's `LOOP.camera.sporewood` does the water's lens).
  A reload mid-leg lands at Rootfoot with the carry written once.
- **The way back by the lamps** (`loop-tow.wayBack`): the Sail for a water the home has lain at plays one ink dip (`LOOP.tow.dip`, held at
  full ink until the water's first frame): the barge moves there (`towBarge`, only the barge), the world is put on it, the raft at the
  stern's tie-up, and the glide out begins as the ink clears. No Chart, no leg, no words. Home after an evening is where the barge lies.
- **Murk's lines at a later water** (§6.4): `saleLineId({…, water, at})` and `sayOnce('at:<water>:<key>')` say `TEXT_LOOP.murk.at`'s
  first-evening line at home there, then its own first cap loss (GEAR-GATES' firstAway, per water), each once; the Mossmere's as built.
- **Bytes** (M1 §3.2): `chart-draw.js` + `ui-chart.js` 76.2 KB minified (M1's 62 KB + 16 KB for the second water's drawing);
  chart-art.js 190.6 KB in the bundle; the Chart in the built file **266.9 KB** against its line of 300 KB (M1's 200 KB and the later
  sheet's 100 KB); `ui-tow.js` 16.7 KB (+4.1 KB: the leaving card, the later leg, the way back).
- **Tests**: `tools/tests/lake2-c.test.mjs` (the art, `waterOpen`, the model's sealed and open sheets, `chartReach`, the outline sheet
  against the world, the names at every size, the Mossmere's layout as built, the lake map's places, Murk's lines);
  `loop-tow.test.mjs` (Sporewood's leg and its astern glide in; a later water's first tow and the way back's one dip);
  `ui-chart.test.mjs` (the byte lines per sheet); `validate-data --loop` (the ahead sheet, each leg from the water before it, each
  glide in); `tools/tests/lake2-c.scenario.mjs` (the lake map, the Chart with two sheets, the leaving card, Not yet, the tow, the first
  evening, home at Rootfoot, the way back both ways, a reload mid-leg; `--part=chart` for the Chart's and the card's frames at a size).
- **Run** (18 November 2026, a dev build, `LOOP.shipped` set in the page): the whole scenario green at 1280 × 720 and 390 × 844 (the
  lake map, the Chart, the leaving card, Not yet, the tow, the first evening at the Lullaby, home at Rootfoot, the way back both ways, a
  reload mid-leg; no page, console or game error), its Chart part green at 960 × 540, 358 × 664, 690 × 760 and 1280 × 800 touch; the
  bake re-run: both sheets decode the same twice and `chart-art.js` came out unchanged.
- **Left for the gate**: `LOOP.shipped = 'sporewood'` (the scenario sets it in the page); a look sheet of the Chart beside the world.
  Murk's map cards (`mapCards`) are not yet per water: with Sporewood's lake map owned, the Mossmere's shelf can offer the Veilwater's
  and the Mother's Cup's maps before the tow (harmless: owned maps wait for their water; lane S or the gate may keep them to their water).

---

### 9.8 Lane S as built (gw-l2-s): the shop, orders and finds

§7, §5.6–§5.7 and §6.5; `LOOP.shipped` stays `'mossmere'`, and nothing of it reaches the Mossmere before the tow: its shelf, book,
plates, glyphs, finds, orders, guide boxes, rack and raft are as built (the Mossmere's plate keys and raft triangles are pinned in
`lake2-s.test.mjs`; `homeVariants`' signature is its nine terms until a later water's rod is bought). (Lane A's own section, the sound,
is §9.9 on its branch: both sit before §10 at the merge.)

- **The finds** (`data.js` block "LAKE 2, lane S"; FINDS §5.2): Sporewood's five treasures, one a grade: the **Seed Jar** (plain, pinch,
  0.15 m), the **Bee-Skep Lid** (fine, both, 0.34 m), the **Gardener's Trowel** (precious, pinch, 0.28 m), the **Cloche Handle** (rare,
  pinch, 0.1 m), **the Seed-Keeper's Casket** (the jackpot, both, 0.3 m), with §7.3's names and lines. They sell at Sporewood's value
  tier 12 by FINDS §4.2's rule: **24 · 72 · 180 · 600 · 3,000**. With no part, look or lost tackle there yet, `findShares` gives a snag
  at Sporewood **54% · 29% · 12% · 4% · 1%**: every snag there is one of its treasures, the soft guarantee has nothing to climb, and
  `snagRoll` never brings a Mossmere find up at Sporewood (nor one of Sporewood's at the Mossmere), as the water key already ruled.
  **Measured**: over 100,000 seeded snags 53.84% · 29.24% · 11.94% · 3.98% · **0.99%** (the Casket inside the test's 1% ± 0.07); through the
  real ledger at Sporewood about 1 bite in 20 snags and all of them its own. The catalogue's finds row on Sporewood's page lists the five
  (names once had, "· · ·" before; the Casket gold). The pacing sims count no treasure at either water, so §8.4's figures stand; a
  treasure snag at Sporewood averages 109 clams (the Mossmere's 64), so its first evenings can only earn more than measured.
- **Their art**: five props in `models-finds.js` (one merged toon mesh each, ≤ 400 triangles, closed shapes so the show's turn never
  shows a hollow): a cream stoneware jar with an amber glaze band, plum wax and a twine tie; a straw skep lid in stepped coils; a brass
  trowel worn bright on one side, its turned handle; a bell-glass knob with a moss thread and a ragged collar of shards; a dark casket in
  brass bands, its low lid along it, amber seeds at its lip. Five ink outlines in `ui-finds.js` (the card, the hold, the tally, the
  catalogue's hatch). Looked at in the show and on the card at 1280 × 720 and 390 × 844 (two rounds: the lid and the trowel's blade first
  showed their hollow sides, the casket's lid lay across it).
- **The engravings** (`murk-engrave.js`): Sporewood's own make for every item its shelf, the Tackle screen and the Wick's sheet show:
  the thirteen (the **Seedpod Twirl** a winged seed with the hook through its seed; the **Spore Moth** a cream moth with plum eye-spots
  and spore dust; the **Ember Minnow** a carved resin minnow with its cinder; the **Root Jig** a knot of black root on a pebble with a
  moss tuft; the **Spore-Lamp Fly** a glowcap bud on the hook, its pulse in stipple and rays; **Spore Cake** and **Amber Larvae** in a
  turned burl pot with a bark band and a gilled cap lid, never a tin; the **Stalkwood** pale and ringed with a bark grip; the
  **Amberheart** dark root-wood with its amber window; **Rootthread** on a notched bark winder; **Mothsilk** a cocoon skein on a twig;
  the **Capwheel** a lobed, gilled shelf-cap; the **Burlwheel** a burl's eyes bound in copper wire), and the **Glowcap Bulb**, the four
  creels (bark slabs, woven roots, a moss-lined round basket, a gardener's lidded hamper) and the six raft-part levels (pressed-cap oar
  blades, a twisted root keel with a lashed stone at II, a lantern with a glowcap growing in it). Keys: `rod:stalkwood`, `hold:bark_creel`,
  `oars:1:sporewood`, `lure:root_jig`, `tin:spore_cake`, `bait:glowcap_bulb` (`plateKey` reads a card's `itemId` and `gearWater`; the
  shelf's cards now carry them through `shelfCards`, the sheet's plates through `loop-sheet`, as lane G's Tackle screen already did).
  Twenty-four plates, none of them the Mossmere's and none alike; the Mossmere's keys and plates as built. One look round on a plate
  sheet beside the Mossmere's (the moth spread as a pair, the larvae fat segmented grubs, not the worms' loops, the Stalkwood's rings and
  the Burlwheel's binding made to read), then the book in the browser.
- **The glyphs** (`ui-icons.js`: `seedpod`, `minnow`, `rootjig`; `ui-gear.js` `GEAR_GLYPH`, `loop-gear.js`' shelf `ART`): each of
  Sporewood's eight hooks its own glyph (the built `moth`, `fly`, `cake`, `larva`, `cap` for the rest), none a Mossmere hook's.
- **The meshes**: the game draws no lure on the line (GEAR-GATES §7, as built: a cast shows the float), so a lure's look is its engraving
  and glyph. The rack's rod (`actors-home.js`) is a later water's make once one is bought there (`homeVariants`' `rodAt`: the Stalkwood
  pale with stalk rings, the Amberheart dark with its amber window); the raft's parts bought at Sporewood (`actors-raft-gear.js`
  `raftGearParts({water})`): pale ringed looms with round pressed-cap blades, the root keel and its tendrils, a mossy stone for Root Keel
  II; still one merged mesh. The lantern keeps the built glass's growth.
- **The shelf by water** (`progression-loop`): Murk sells a water's **place maps** (`mapCards`) and its **legend's bait** at that water,
  where the barge lies, as D2 made him sell its lures and tins: at Sporewood the Veilwater's and the Mother's Cup's maps and the Glowcap
  Bulb; the Mossmere's maps and the Heartmoss Ball wait at the Mossmere for the way back (lane C's note: with Sporewood's map owned the
  Mossmere's shelf no longer offers Sporewood's place maps). Before the tow the Mossmere's shelf is as built.
- **Orders** (§7.2; D2 built them per water): checked here over 6,000 seeded rolls at Sporewood: every order a Sporewood fish of its
  list or an owned place's own (never a giant, the legend or an epic; each of the list's nine named 609–699 times), two in three common or
  uncommon (66.8%), counts, classes and
  weights as built; the board at Sporewood two of its own, never two of a fish; the Mossmere's open orders wait and a Sporewood fish
  never fills one; Murk says Sporewood's.
- **The guide** (`ui-guide.js`, §6.5): the new water's one box, "New water: new gear, lures and bait at Murk's." (D1's words), its own
  machine beside the ten (`WATER_BOX`, seen once a water under `newWater:<water>`), calm on a trip at a later water before the first
  cast there; never at the Mossmere, and off with the guide. The ten and their order as built.
- **Tests**: `tools/tests/lake2-s.test.mjs` (433 checks: the five finds, the 1% rule over 100,000 snags, the snag through the real
  ledger, the catalogue row, the props and ink, the twenty-four plates, the catalogue's pages with Sporewood's shelf just towed and bought
  out at seven sizes, the glyphs, the shelf by water, the orders, the guide, the rack and the raft's parts); validate-data `--loop`'s
  "LAKE2 S" lines (a later water may ship its treasures alone: its parts and looks are checked when they come);
  `tools/tests/lake2-s.scenario.mjs` (the tow, the guide box, five snags landed through the show and the card, the tally, Murk's book
  walked spread by spread, a buy, the Tackle screen, the board; `--part=shop` for the shop alone).
- **Run** (18 November 2026, a dev build, `LOOP.shipped` set in the page): the whole scenario at 1280 × 720 and 390 × 844, the shop part
  at 960 × 540, 358 × 664, 690 × 760 and the Legion Go's 1280 × 800 by touch: no word cut or under 16 px, no target under 44 px, no page
  or console error; the book's frames, the cards, the shows and the guide box looked at at each.
- **Left for the gate and later**: `LOOP.shipped = 'sporewood'`. Sporewood's place-map plates still draw its water from the polar
  fallback (`ui-catalogue-murk.placeGeo`: R and the isles), not the outline lane C draws on the Chart. The sealed next water's three seal
  buttons in the book are narrower than 44 px on a phone (lane C's card; the book's audit leaves them to the gate). Sporewood's barge
  parts, looks and lost tackle are §10's.

### 9.9 Lane A as built (gw-l2-a): the sound bed

Sound only; `LOOP.shipped` stays `'mossmere'`. **The Mossmere does not move**: its bed, its places' voices and its home sound are as
built (`audio-mossmere.test.mjs` passes unchanged); the one rule changed (`mossOn` at home) is true for every save until a tow. Nothing
of it runs off the loop, and Sporewood's voices join the sound table only the first time Sporewood sounds.

- **The rules and voices** (`src/audio-sporewood.js`, pure, the pattern of `audio-mossmere.js`): §3.7's table as built.
  - **The bed by light**: late day is the air under the caps (a pink band at 640 Hz, lower and narrower than the Mossmere's open-water
    air at 1,900 Hz and its reeds) and the leaves stirring overhead, with drips from the caps (a hollow plunk, 1.0 to 2.8 s apart), soft
    spore pops and a few dry frog clicks. At dusk the drips thin (3.8 to 8 s apart) and a warm drone on B♭2 comes in, two sines
    beating slowly. The lily frogs begin: a call every 6 to 10 s at the dusk's start, building with the dusk's progress to one every 0.9
    to 2.1 s. At night the chorus is full and low (every 0.45 to 1.15 s, two or three calls a frog, pitch ×0.88), a pulse of night
    insects (a 3.5 kHz band pulsing at 7.2 Hz) plays, and the drone deepens (B♭1 under the B♭2 pair). Each frog keeps its own pitch,
    throat and pulse through its calls: a low saw through a formant with a 15 to 23 Hz throat-pulse ("grunk"). The Stillnight bed's far
    frogs are silent here, as on the Mossmere; its crickets and drip stay.
  - **The Seep** (its foot measured on the outline at (80.2, −27.6), the voice on the water at (79.2, −27.6)) is its fall as a loop (a
    pink band at 1,250 Hz, churning) and the drops at its foot. It is full within 8 m and gone past 40 m, which is about a seventh of
    the open water (the East Pool's north-east). It is never heard at Rootfoot Landing, 71 m off.
  - **The places** (full within 12 m, gone past 30 m; heard through a standing bank low-passed at 1,100 Hz at ×0.45, as the Mossmere's):
    - The Lullaby's music-box drip: two to four notes of a slow falling figure on the B♭ minor pentatonic over B♭5 (the score's key).
      Each note is a tine's tone with its quick high partials; a real drip sometimes follows.
    - The Gill Harp's one hummed note: F1 (felt) and its octave F2 (heard on a phone's speaker), each swaying slowly, fullest at night.
    - The Veil's whisper: the draught through the moss curtain, a high band fluttering at 3.5 to 5.5 Hz, high-passed, with strands ticking.
    - The Mother's Cup's breath: a slow rise and fall through the well, a hollow note under it and bubbles out of the deep. It carries
      further than the others (full within 14 m, gone past 40 m), so at home it is heard through its bank.
  - **The giants' backs** (`world:giantBack`, at night): at the Gill Harp, `harp_swell` (F1, F2, C3 and F3 swelling, their brightness
    opening and closing), and the hum loop ×2.6 for 5.5 s. At the Veilwater, `puffer_rustle` (the paper lantern filling and settling).
    Another place gets the built roll.
  - **The lily frogs**: a frog's dive (`wild:frogDive`, emitted by `actors-wildlife.js` for the frogs only) plays `frog_plop` within
    24 m. The stems tell's reed rustle plays at Sporewood too. The lift and the seal sound as at every water.
- **Home at Sporewood** (`audio.js`'s `homeWater()`: the world's water, else where the barge lies) plays Sporewood's bed under home's
  own: the stove, the hulls, the far bell and Murk's hand bell. The hub mood plays in Sporewood's key (`zoneId()`: audio-music.js's
  built `sporewood` theme). The Mossmere's bed plays at home only while home is on the Mossmere.
- **The phone's cost**: at most six bed loops at a light (two by day, four at dusk, five at night), plus the hum's two near the Gill Harp
  and the fall's one near the Seep. A layer silent at the light for 6 s, the hum and the fall out of earshot for 3 s, are let go. The
  one-shots share one options object (no allocation per sound).
- **A fix on the way**: audio.js builds its voice tags when the module loads, so a voice added later has none and shares one
  count with every other late voice. Sporewood's voices get their own tags when they are added. The Mossmere's late voices (WC-3's,
  home's, the tow's) keep the shared count as built, since giving them tags would change the Mossmere's mix (left for the polish pass).
- **Measured** (`tools/audio-render.mjs --set=sporewood`; peak / rms dBFS, every peak under −1.0):
  - The beds against the Mossmere's at the same light: day −35.3 against −34.5; dusk −34.4 at its start and −34.3 at its end against
    −35.9; night −30.5 against −29.9. All are within 1.6 dB (the gate is 4 dB).
  - The places clear (banked): the Lullaby −17.5 / −33.3 (−24.2 / −41.8); the Gill Harp −26.4 / −32.2 (−33.4 / −39.2); the Veil
    −15.6 / −37.8 (−36.0 / −57.6); the Mother's Cup −15.1 / −28.8 (−22.0 / −35.7).
  - The Seep at 4 m −18.6 / −35.5, at 28 m −28.6 / −45.5.
  - The backs: the swell −6.8 / −16.7 and the rustle −10.4 / −31.7, against the Mossmere's roll at −3.7 / −17.1.
- **Tests**: `tools/tests/audio-sporewood.test.mjs` (87 checks: the rules, the bed by light and the chorus building over the dusk, the
  Seep, each place clear and banked, the hum, the backs, the plops, home at Sporewood and its key, and none of it on the Mossmere or off
  the loop). `tools/tests/lake2-a.scenario.mjs` passes at 1280 × 720 and on the phone (390 × 844), all 23 checks each. It runs the real
  game from the Mossmere's end through the tow to the evening at Sporewood: its bed, not the Mossmere's, and the score in its key; the
  Seep; the Lullaby; a frog plopping off its raft; the night's chorus, pulse and drone; the Gill Harp's hum and, forced, the
  Harpstring's back; home at Rootfoot Landing.
- **Left for the gate**: the world turns no giant's back at Sporewood yet: `LOOP.giantBack.places` is the Mossmere's two, and the back's
  look (the Harpstring's lit strings, the Puffer's globe) is art. The sound answers `world:giantBack` at `gill_harp` and `veilwater`
  once it comes (the debug hook `debug.world.giantBack('gill_harp')` plays it now). Adding the two ids to the list would not move the
  Mossmere (the back only picks among the current water's places). Also the user's listen: a short render of the three lights and each
  place is in `tools/out/l2a/render` after `--set=sporewood`.

### 9.10 The integration's fixes (gw-lake2, after the review of 7811584)

The reviews of the merged lanes found Sporewood's fishing not ready: its water fell back to the pre-watercraft visuals and its areas
were dead data. Fixed as follows; the Mossmere plays exactly as before (its sim byte-identical, its watercraft, WC-2 and outline-shore
part-1 tests unchanged and green).

- **Every water under the loop draws as the Mossmere does** (`fishing.js`'s gate is now any water with tells of its own,
  `WATERCRAFT[water].tells`, not the Mossmere's name): no pulse ring at the landing, the bite, the strike or a fight's phase, no gold or
  orange ring, no spot disc, no built sign (`pickKind`), the legend pool's glimmer off (`uGlim` 0), the water's own white marks, the
  silhouettes and the water's answers. The WC-2 readers take the water: honest spawning reads `WATERCRAFT[water].tells` (and the fry's
  raw row for the spray), the who-is-there pool its hook table, the silhouettes its own bodies (`fishing-sight.OUTLINE_AT` /
  `NEVER_AT`, the same as `WATERCRAFT.sporewood.sight`).
- **Sporewood's tells and silhouettes** (`WATERCRAFT.sporewood.tells`, `.sight`): §2.4's — the sip for the Fry and the Barb, the splash
  for the Mackerel and the Cindertail, the roll for the Downcast at dusk, the swirl and the strike answered by the bow wave (in the
  giants' places too, their own fish), the ruffle and the spray by the fry, the fizz by the catfish, the mud cloud by the Ray and the
  Capshell, the stems by the Barb, the bed gas. Silhouettes: the Barb, the Angler (night) and the Nightbloom deep-bodied, the Cindertail
  a torpedo, the Fry a shoal, the Capshell a claw (night, on the roots); never the giants, the legend, the Jelly, the Threadling, the Ray
  or the deep Mackerel and Downcast. The Lullaby's shallow lily water shows them.
- **Sporewood's areas are live**: `laneFor`, `areaShares`, `fitFactors`, `blindMix`, `tiltedTarget`, `openMix`, `bitesTable` take the
  water (`areasOf(water)`); `fishing.castArea`'s guard is lifted for any water whose geometry is authored and shares baked;
  `WATERCRAFT.sporewood.shares` and `factors` are baked by `watercraft.test.mjs --bake=sporewood` on its outline layout (margin 22%,
  reeds 4%, pads 2%, roots 7%, drop-off 14%, lane 2%, open 23%, deep 23%, inflow 2%, outflow 2%; the factors fitted on Spore Cake so the
  Threadling's is fitted too). The tests: baked = recompute, the blind pre-hook mix = the built mix within ±0.5 points, its lane in the
  West Pool, the user's 1% stray rule over every area and place, light, hook and tell (every grade-0 fish ≤ 1.00%), every pool bites,
  and T104 on its areas (the game's castOdds = the sim's poolFor in every area). The sim's casts land in its areas (§8.4 re-measured).
- **Sporewood's places fish as places**: its four records are in its loop arena (they were only the world's banks), so a cast in one is
  that place (its pool, its giant, its mist while not owned or not lifted).
- **The Netcloud Fry** has its own build: a blunt round head, a big eye ringed dark, a short body deepest behind the head, a thin stalk
  and a rounded fan of a tail (the Dusk Minnow's is a fork); cool milky glass (opacity 0.3, a fresnel edge, no scales or lateral line)
  with the spine, its comb, the silvered gut and the amber tail spot drawn after the glass so they read crisp; its card ink the same
  profile, see-through. The four of its cloud sit above and toward the lens, clear of the fist.
- **The leaving card fails closed**: a first tow never goes on unless the card has shown and Tow was pressed; a card that cannot show
  falls back to the plain question; with no answer nothing moves (`loop-tow.test.mjs`).
- Left for the gate or later, recorded here: the tests that pin the sealed state flip with `LOOP.shipped = 'sporewood'` (the gate's
  rewrite: done, below); the lures differ in play only by their engraving and glyph (no lure is drawn on the line and none of §7.1's motions is built:
  **a decision for the user**, §11); the Lostsea Mackerel and the Downcast still read alike in the show's warm light (a colour-only change
  of their backs was tried and shows no difference: the held flank is the belly's colour, so it needs a skin pass that moves the counter-
  shade line); the Gill Harp's dark silhouette, the banks' large-scale tint, the Veil's near stalk, the isles' near circles, the Skep
  Lid's hold and the Nightbloom's head are art passes not yet made.

**The release gate (18 Nov 2026, gw-lake2): Sporewood opens.** `index.html` is not rebuilt here (the integration step does: §9.12).

- **The dev branch merged** (9315346: the soft fish shadows): no textual conflict. `fishing-sight.js` holds both sides, Sporewood's
  own outlines and never-seen (`OUTLINE_AT`, `NEVER_AT`, the water through `outlineOf`, `pickSight`, `createSight`) and the glide (a
  turn of at most 0.7 rad/s, an eased pace, a calm bolt, about 1 s fades, two alive at most on every tier); `fishing.js` the eased
  visibility beside the per-water readers. `lake2-fishing.test.mjs` checks at Sporewood too: two alive at most, never over 0.8 m/s
  unbolted, never turning faster than the glide's rate. `index.html` is the dev branch's build taken whole (this branch never built it).
- **`LOOP.shipped = 'sporewood'`**: its lake map is priced on the Mossmere's shelf (Maps) and on the Chart's sealed sheet; Glasswater
  is the sealed "Coming soon" sheet once Sporewood is drawn; wing I of the gallery hangs both waters; the Mossmere's empty shelf's
  goal line is the Sporewood map. Three seams the switch showed, fixed:
  - the map seal carries **Murk's asking price** (`sealsOf`, the factor on the base), so the Chart's sheet and the shelf's card ask the
    same 2,800 in the game (the Chart had read the base 1,400 while the card asked 2,800);
  - **the empty shelf is the water's own cards** (`home-shelf.shelfBare`: the next water's lake card never counts), so Murk's
    empty-shelf line and the Mossmere's gilding still come with its own last purchase, never wait for the next water's map;
  - **the shelf's frontier is the Chart's** (`frontierOf` reads `waterOpen`): a lake map bought before its keys are held leaves its
    card sealed again, its map seal pressed, no price (never bought twice), as the Chart and the catalogue's head show it; Glasswater's
    card follows only once Sporewood is open. The shelf's sealed card of a shipped water says nothing where "Coming soon" stood.
- **The tests re-pinned to the shipped meaning**, each keeping the pre-gate state as a fixture (`LOOP.shipped` the Mossmere: Sporewood
  sealed, unpriced, never sold): `lake2-c` (3 + the Glasswater sheet and the priced sealed sheet), `loop-5b` (wing I; the real
  Mossmere shelf bare with the map its one card and goal, the water gilded), `loop-trip` (the step-2 save's card priced, not sailable),
  `loop` (the Maps tab, the empty shelf's goal, the map owned before and after its keys), `roster-species` (4), `ui-chart` (11: the
  priced sheet at every size, the fixture's "Coming soon" at every size), `ui-loop` (3 + the keys held: Glasswater next),
  `loop-places` (T108, T109, T116, which the review's crash hid: the walk, the refused and the bought map, the seals priced, the one
  price at ×2); `validate-data --loop`'s three (LOOP.shipped Sporewood, no water past it shipped; the map cards with the map priced,
  then sealed and pressed, then Glasswater's; the pre-gate fixture). `loop-carry` and `lake2-g-tackle` now put back the shipped value
  after a section (they put back 'mossmere' and ran the rest pre-gate); `fakeLoop` buys a lake map as the ledger does.
- **An old save at the Mossmere's end** (the M1-end fixture with its map never bought, the list landed, clams banked) through
  `migrateSave` and `normalizeSave` (`loop-carry`): everything kept, migrated additively and idempotently, the map priced with its
  keys held, bought with the banked clams (the Lullaby and the Gill Harp with it), both sheets drawn, +2 · +2 · +2 on the leaving card,
  the tow, a reload after it.
- **Re-bakes**: the Chart's art (`build.mjs --game`, sheets 1 and 2): `chart-art.js` unchanged, both sheets decode the same twice;
  `roster-export --check` current. No other table reads `LOOP.shipped`.
- **The gate's runs**: `check.mjs --quick` all green (83); `validate-data` plain, `--v3` and `--loop` OK (22,694 · 93,351 · 2,341
  checks). `clams.mjs --shipped=mossmere --quick` byte-identical before and after the switch (its one FAIL, the hold steps' clams a
  minute, and its stalking warning are older than the gate, in the review's baseline too). `clams.mjs --shipped=sporewood` all checks
  pass, byte-identical before and after: the first evening loses **15%** of hooked fish (at most about one in five) and earns **64%** of
  the Mossmere's last trip (at least about 60%; 101% a minute); the map 34 min after the empty shelf; Sporewood's empty shelf 3.28 h.
  Two warnings as before (the list's p95, the return to the Mossmere's pace at trip 16).
- **Browser** (a dev build of the gate's tree, `LOOP.shipped` from the source, never set in the page): `lake2-c` (the lake map at
  2,800 on the shelf and the sealed seal alike, bought; the Chart with both sheets and Glasswater's "Coming soon"; the leaving card,
  Not yet, Tow; the leg, the glide in, the first evening at Sporewood; home at Rootfoot; the way back both ways; a reload mid-leg) at
  **1280 × 800** and **390 × 844**: no failure, no page, console or game error; nothing cut or overlapping in the frames, no ring round
  the raft. `loop-1a` main (`--mobile` 820 × 900): no console or game error; its two failures are T59's phone grid, which at 820 px is
  the desktop row (older than the gate, GEAR-GATES' note), and the goal line now reads "Next: Braided Gut · 100" as built.
- **Left**: Glasswater has no gear key in `LOOP.access.gear` yet, so its sealed sheet's gear seal is a plain hollow rod seal (its
  water's data comes with it); the M1 docs' "Sporewood's card still reads Coming soon" (M1 §2.5) is the pre-gate state; the review's
  other findings (§11's lures, the art passes above) stand.

### 9.11 The art pass (gw-l2-art, after the review of §9.10)

**The greener palette** is commit 04e12c8 on gw-l2-art: Sporewood's air, light, water and leaves as first pulled to green (a green-gold
day, green fog and grade, lime-bright leaves, about 30% green by day). The user's word on it (18 Nov 2026): "possibly too much green,
we're making our way down the mountain so we want more green than the moss mere but not lots and lots of green yet", and "keep what
you've got but do a colour palette change". The palette below is the muted one that followed; everything else is as 04e12c8 built it.
To restore the greener palette, take `ZONE_LOOKS.sporewood`'s colour values and the WATERS row from 04e12c8.

The user's words on the current frames: too purple, the three lights alike, blocky shrubs, gold on the water, three fish that read as
one, a dark Gill Harp, a camouflage bank, a Veil that fills the lens, round isles. Fixed as follows, Sporewood only under the loop; the
Mossmere is untouched (outline-shore part 1's hashes pinned, its frames the same) and so is the flag-off game (ZONES as fingerprinted).

- **Its own air, Clear Night-led and never green** (`ZONE_LOOKS.sporewood.air`; the loop's apply block lays `air.palette` and
  `air.grade` over ZONES' Sporewood): fog #26343f, water #203444, ink #060c12, ambient #3a4a5a, far #8e9cae, light #ece2cc, lamp
  #e6dcbc, the nebula a plum-rose #a47a86 held low (the one accent in the cap-rim window's sky), the grade's tint a cool slate #3a4250.
  The amber glow, the candle and the rose accent as built; purple gone. `air.kit` gives the banks, stalks and roots slate and muted moss
  in place of world-art's violet ones (rock #1e2226, moss #2e3c30 / #4e5a44, stalks cream #c6b898, caps #6e4a24 / #c49448). The green
  is the leaves' and the moss's own, muted: moss, sage, olive and bottle green, never lime (leafDark #2c3e30, leaf #4a5c40, leafHi
  #727e56, moss #46503c / #66704f, albedo 1.25, `gain` [0.98, 1.1, 0.92]; it was [0.82, 1.65, 0.62] to carry the leaves through a
  violet light). WATERS §3.1's "air never green" holds for it again (validate-data checks its air, light, sky, water and grade); WATERS
  §1's row and the colour script (`AIR_EXCEPT`: its share a floor, its sky, water and cast reported) carry it.
- **Three lights apart** (`air.lights`, world.js `lit`): the mood gains a dusk weight from the phase (0 → 1 in the dusk's first 12%,
  easing out at its end and in the gloomtide's first 4%); each light sets the air (fog and the sky's base), the sky's low band
  (`horizon`), the key's colour, strength and height, the fill, the water's own colour, the grade's tint, exposure and saturation, the
  stars and the nebula, the glowcaps' light and the leaves' translucency, blended day (1 − d)(1 − n′), dusk d, night (1 − d)·n′. Day: a
  cream-gold key #f4e6c4 at 2.8 under a blue-grey air #3e5462 with a warm cream haze on the horizon #d4c8aa, a slate fill, a dark teal
  water #1e3a48, exposure 1.18, no stars (0.03); the soft green-gold is the light through the leaves under the caps. Dusk: an
  amber-rose key #ffb88a at 2.6 held low (its height × 0.35: long shadows) over a slate fill #3a4a52, a blue-slate air #2e3442 under a
  rose-amber horizon #f0a070 (the leaves turn olive-bronze), a rose grade tint barely there (0.05), exposure 0.98, few stars (0.12), the
  flowers open, the fireflies wake late in it. Night: a deep blue-teal air #0c2630, a silver moon key #a4b4c0 at 0.6, a dark teal water
  #0a1e2a, exposure 0.8, the glowcaps' amber at 1.8×, stars 0.65. Every other water: `lit` is null and none of it runs.
- **Soft leaves** (`world-flora.leafMass`): the shrubs', the broadleaf trees' and the far crowns' masses are lobed spheres (a few bumps
  push each into lobes; the shrubs' 11 × 8 segments, the crowns' 10 × 7, so a 4 m crown's outline is round) with smooth normals from the
  heart and a soft dapple that drifts over the mound (a per-vertex jitter had lit each triangle on its own: facets); leaf cards, most of
  them round the waist and shoulders where they break the outline into leaves (14 a shrub's mound), lighter at the tip and carrying the
  backlit term; the kit's toon in five steps, not three. The kit is 64.5k triangles on high (was 28.8k), 0.7× on medium, 0.4× on low,
  its draws unchanged.
- **No gold on the water**: what read as gold leaves on the water were mostly the lit cap undersides and gills mirrored near the eye,
  and the lantern's amber laid over the whole foot of the low lens's frame. On a lush water (`GW_LUSH`) a warm mirrored light (amber,
  gold: red over blue and at least as red as green) is dulled to a soft olive-ochre and held down to a quarter (the leaves' images are
  untouched); the light pools are 0.55× and drain only a fifth of the water's own colour (the Mossmere drains it all, against rose), so
  the water keeps its own dark teal and the warm light gathers round the raft and under the glowcaps; the glowcaps' anchors lay no thread
  of gold across the water (world.js streak 0 on a water with its own lights). The lantern's glitter path is off as on the loop's
  Mossmere, the mirror as calm (no key glitter, no glints: calmW 1); the fallen cap-leaves rarer (4%), smaller and a matte dull
  olive-ochre, the lily pads a step deeper; the gill-flakes 4 on high (8), 3 on medium, smaller, a matte ochre #86704a, no rim.
- **The banks' moss per pixel** (`world-flora.lushMoss`): the ground's 2 m grid carries only where moss may lie (`aMoss`); the drifts are
  cut in the fragment stage from value noise on the world position with an fwidth-wide edge, mottled between `mossG` and `mossGHi` with a
  fine speckle: crisp drifts at any distance, no camouflage blotch.
- **The fish** (the show's light had made all three a pale tan torpedo: the light a landed fish holds after the landing, `setRevealLight`,
  is a cream flood that drowns a dark skin; a loop model's `flood` now scales it, 0.3 on the Mackerel and the Downcast, 0.35 on the
  Nightbloom). **Lostsea Mackerel**: slim (`girth` 0.82), a near-black slate back #1c2230 over a hard countershade line (`counterLine`
  0.02, half-width 0.035), dark plum bars down its back to the line, a larger crescent (`tailK` 1.32). **Downcast Catfish**: deep and
  high-shouldered (`shoulder` 0.42), a large tall sail of a back fin (`dorsal: 'sail'`), low eyes, a dark plum back #2e1830 carried low on
  the flank (`counterLine` −0.38), two pairs of catfish barbels. **Nightbloom Carp**: its head a third of its length (`head` 1.55,
  `headLen` 0.48), a stronger arch (`archK` 0.72), a darker plum #2e1630, so the cream petal edges carry.
- **The Gill Harp and Rootknot**: every cap's underside and rim warm and light (a cream-ochre, lit by its gills); the gill strings cream
  (they were the caps' ochre: yellow sticks), the Harp's 24 (16), 6–8.6 m long, longer than the stalks' reach over the neck, hanging to
  2.4 m over the water; the stalks, roots and fallen logs take the moss's floor in their shade (the banks' `gwFloraFloor`) and, on a
  lush water, no ink hull (the tubes' hull drew over them: the Harp's stalks, the Veil's log and the cap trees read as black arches; the
  kit and the landmarks never had one, and it is one draw fewer), so a cream stalk seen from below reads as a stalk; Rootknot (what read as "a black spider on an islet": its seven dark arched
  roots) takes low, thin, moss-grown roots, a small cap on its stump with its own lit strings and a glowcap lamp, moss cushions and ferns.
- **The Skep Lid** is tipped back (its crown up and toward the lens, 54°), so the show sees coil over coil of a straw dome; square to the
  lens it read as a flat cream disc before the face. Its length (the size the show holds it by) is unchanged.
- **The Veil**: its broken cap small and sunk back into the bank behind the stalk's root; the Veilwater's lift frames the strand curtain
  broadside from the West Pool, low and back (`placeAnchor('veilwater')`: the Veil's mouth, 17 m, 8° up), so the stalk spans the top of
  the frame instead of filling it at the lens.
- **The isles**: the Mother's Foot and Rootknot take a broad lobe and a notch each, the Two Stools and the Tussock longer egg shapes (the
  outline's 1 m distance field keeps every island point within 0.18 m); Mossback as built. `WATERCRAFT.sporewood` shares and factors
  re-baked (`watercraft.test.mjs --bake=sporewood`: margin 22.1 → 22.6%, open 23.4 → 22.7%, the rest within 0.3 points); the Chart's
  sheet is drawn live from the outline (nothing to re-bake); world hashes are pinned for the Mossmere only (unchanged). The sim's §8.4
  figures move with the shares by a hair (not re-run here; the gate's `clams.mjs --shipped=sporewood` re-measures them).
- **The haze and the places' banks**: a warm cream (#e4dac6), slate-grey in shade and blue-grey at night, never lavender.

- **Not done** (named): the Skep Lid's tip is in its model (a node build of the prop) but was not seen in a browser frame (the art
  scenario's Sporewood could not force a Sporewood find); the Netcloud Fry's cloud centred in a cupped hand (the show holds a fry in a pinch; a cupped hand is a new pose
  in actors-show, left for a show pass); the near water inside the lantern's reach still reads warm under the low lens, most on a tall
  phone frame (the lantern's pool is the play's light; it is softer, and the water is dark teal beyond it); the dusk's and the night's
  green shares sit well under W2's 10.5 and 6.5: the amber-rose key turns the muted leaves bronze (the report's yellow and orange) and the
  moon's silver keeps them grey-green, as the user's palette asks; by eye both stay greener than the Mossmere's, which has none.
- **Measured** (`lake2-art.scenario.mjs --hue --tier=medium`, 960 × 540, W2's three poses: the spawn, the day water, the old water;
  `hue-report.mjs`, chromatic weight per band). Green share, the mean of the three poses, **the muted palette**: **day 11.1%** (12.2 ·
  16.8 · 4.4; W2's target 12), dusk 0.2% (0.1 · 0.2 · 0.2), night 1.8% (1.4 · 3.2 · 0.9; teal 2.5–10.9% more). **Violet and magenta
  0.0–0.3%** in every frame. The greener palette (04e12c8) measured 30.1 · 7.8 · 9.4; the build before the pass (9c5bf45) 4.9 · 4.1 · 2.3
  with violet and magenta at day 8.4 + 10.2, dusk 13.2 + 9.4, night 17.7 + 8.5. The three lights apart: day cream-gold over muted greens
  (chroma 0.13–0.21), dusk amber-rose (orange 84–94%), night dark blue-teal (chroma 0.11–0.21) with the glowcaps' amber. The Mossmere's
  frames (1280 × 800, its play lens and the moat, three lights) measure as before within the water's animation: pooled blue 45.6 / 45.5,
  violet 33.9 / 33.8, green 0.0 / 0.0 (after / before); its geometry hashes (outline-shore part 1) unchanged. **The cost**
  (`clarity-perf --loop --sporewood`, at night, the West Pool, the East Pool and the neck; the palette change is colour values only, so
  the draws and triangles are 04e12c8's): on the phone (390 × 844, `--mobile`) **low 96–98 calls**, 94–100k triangles, the world's own
  25–27 calls (the Mossmere's banks frame 32), cpuMs 1.8–2.5k against that frame's 4.4k; medium 177–178 calls, 239–256k triangles (≤ 230
  and ≤ 320k), cpuMs 2.6–2.7k against 5.2k; high 179–186 calls, 391–417k triangles, cpuMs 2.5–3.4k against 5.5k. At 960 × 540: low 97–98 calls, 99–102k triangles, cpuMs 2.7–8.7k against the Mossmere's banks frame's 15.4k (run alone; the browser
  closed at the medium tier's giant show, the shared box's old failure); medium 177–181 calls and 250–256k triangles (the draws and
  triangles from the run before the palette change, under load: its cpuMs are not a figure). The kit is
  64.5k triangles on high, 46.0k on medium, 26.8k on low, in 14 meshes on high and 7 on low (draws as W2's). A giant's show at night was
  not measured (the forced bite timed out at 240 s, as on the shared box before); it is a Mossmere case.
- **Frames**: the look sheet (Sporewood's three lights beside the Mossmere's, before and after), the set pieces before and after, the
  fish sheet (each changed fish beside its relative in Sporewood's show light, its card ink) and the phone frames: the lane's scratch
  folder `l2-art/` (look-sheet.jpg, set-pieces.jpg, fish-sheet.jpg, phone/).

### 9.12 The integration (gw-lake2, 18 Nov 2026): the gate and the art pass together, `index.html` built

- **Merged**: gw-l2-art (8f68973, then 45b2b73) into the gate's gw-lake2. One conflict, this file (§9.10's gate notes and §9.11 both
  kept); `data.js` and `validate-data.mjs` merged by git (`LOOP.shipped` and the gate's checks beside the art's `ZONE_LOOKS`,
  `ROSTER_ART` and isle outlines). No generated file in a conflict. The dev branch (9315346) is in gw-lake2 already.
- **The gate on the merged tree**: `check.mjs --quick` all green (83); `validate-data` plain, `--v3`, `--loop` OK (22,694 · 93,351 ·
  2,344 checks). `clams.mjs --shipped=sporewood` all pass, two warnings as before; with the art's re-baked isle shares the first
  evening loses **15%** of hooked fish and earns **64%** of the Mossmere's last trip (101% a minute); the map 34 min after the empty
  shelf, Sporewood's empty shelf 3.28 h, the first giant at hour 1.65 (1.57 before the re-bake). `clams.mjs --shipped=mossmere --quick`
  byte-identical to the gate's (its one older FAIL and warning). `build.mjs --game`: `chart-art.js` unchanged; `roster-export --check`
  current. `index.html` built by `node build.mjs` (two builds, the same bytes).
- **Two fixes the browser showed** (Sporewood only; the Mossmere's ring of shore mist as built): the shore mist band, 1.5 m back from an
  outline shore, folded back on itself at one tight bend (45.6, −15.4) and stood as a pale, hard-edged slab against the far bank in the
  first evening's view: the band thins to nothing there (`world-art.shoreBand`, its foot's v). And by Rootfoot's landing at night the
  band's foot, 10 m from the raft's lens, laid a pale arc across the water by Murk's barge: an outline water's band fades in from 14 m
  (`mistMaterial`'s `uNear`, 6 on the Mossmere as before), so it stays the far banks' mist.
- **Browser** (a dev build of this tree): `loop-1a` main (`--mobile` 820 × 900): no console or game error; its two failures are T59's
  phone grid, as at the gate. A Sporewood trip at **1280 × 800** and **390 × 844** (the Mossmere's end, the lake map bought, the Chart
  with Sporewood open, the leaving card, Tow, the first evening, a Nightbloom Carp landed and shown, Keep, Sporewood by day and by night,
  home at Rootfoot, the way back): no failure, no page, console or game error; no word cut or off the screen on the Chart, the leaving
  card or the catch card.
- **Left**: the near water under the lantern still reads amber on the play lens, most on a tall phone (§9.11's not done); at night a
  faint trace of the band's arc by Murk's barge remains (gone from 18 m; 14 keeps the near banks' mist); the first cast's tip ("Press on
  the water. Let go to cast.") sits unbacked on the bright far bank on a phone; the Skep Lid's tip and the Netcloud Fry's cupped hand
  (§9.11).

## 10. Left for later (named, not built)

The Puffball Vent (fifth place, the Emberbrood Snakehead) and the Drowned Greenhouse (night, the Remembered Sun) as later sheets;
Sporewood's three barge parts, three looks, aquarium pieces and a lost-tackle set; raft or home items new at Sporewood; a stalking
bird; Tiller (CHARACTERS.md); the Moth Popper; the Hushcap Koi, the Sporebelly Puffer and the Plumgill Perch (re-founded or moved
when their waters ship); the Glasswater list's consequences (Sporewood's list is computed now, it opens nothing until Glasswater
ships); WATERS' re-stepping of waters 3–16 after Sporewood's new figure.

---

## 11. Questions only the user can answer (each with the default this design builds)

| # | question | default |
|---|---|---|
| 1 | Sporewood's green pushed to about 12% of the frame by day (the old plan's step 4–5; the plan had 3%), with every later water re-stepped from there? | **Yes** (your binding words) |
| 2 | Do the raft's parts (oars, keel, lantern) and the hold's slots count as "bought gear" that stays behind? | ~~No: they travel with the raft and the home.~~ **Answered 17 Nov 2026: yes, they are bought gear** (left behind, a share kept); the first evenings tuned not to punish (§0A, §8.3) |
| 3 | Cut Strip (cut from your own small fish, never bought) at every water? | **Yes**, the one hook that is the same everywhere |
| 4 | Going back to the Mossmere: your new tackle works there and its old lures and tins are waiting there? | **Yes** |
| 5 | Leave the Sporebelly Puffer, the Hushcap Koi and the Plumgill Perch out of Sporewood (a second puffer, a second koi, a fourth perch-like fish)? | **Yes** (14 fish, none repeated) |
| 6 | The carried portion: a third (rounded up)? | **A third** (measured: a quarter or none punishing, a half or all trivial) |
| 7 | The Sporewood map at 2,800 (it was planned at 5,200 after the doubling) so it comes about 37 minutes after the Mossmere's shelf is empty? | **Yes** |
| 8 | Hold 7 (4,000) on Sporewood's shelf as its long goal? | **Yes** |
| 9 | (the integration's fix, 18 Nov 2026) The new lures differ in play only by their engraving, glyph and the fish they bring: no lure is drawn on the line and §7.1's motions (the Twirl's spin, the Moth's skate, the Jig's silt puffs…) are not built. Build a small mark and a retrieve of its own for each lure before Sporewood ships? | **Not built yet** (the gear does a similar job by its hook table; the look of each lure on the line is the next art pass if you want it) |
| 10 | (the integration's fix) At the Mossmere after the tow, Murk's shelf shows the gear water's tackle, creels and raft parts (Sporewood's) beside the Mossmere's own lures and tins? | **Yes, as built** (one gear water; its shelf follows the barge; §6.3) |

---

## 12. What this design changes elsewhere (for the lanes to write in)

- **SPEC**: §4.3 (tackle per water; the T3–T6 ladder becomes each water's own tiers), §4.4–§4.5 (lures and tins per water; Cut
  Strip universal), §4.8 and §5.2 (Sporewood's lake map 1,400 base; its places re-sited on the outline; the Veilwater's own fish),
  §5.5 (b) (Sporewood's gear key unchanged; later keys are named in the new water's tiers), §6.5 (the leaving card before the tow; the
  way back's gear), §8 (the new words), §9 (the save keys), §16 (the questions above); a new §4.11 "the gear loop across waters"
  summarising §5.
- **WATERS** §1, §5.3, §6 (Sporewood's row: lush 0.33, its kit counts, 12 · 10.5 · 6.5); §7's step rule notes the one exception.
- **ROSTER** §3.2 (the `favours` to the new items; the three kept species left out; the Nightbloom's look), §4 (disc, bream, tuna built
  with Sporewood).
- **GEAR-GATES** §4.1 (the line term by total Hold, `lineAt`), §5 (the Sporewood ladder); **WATERCRAFT** (per-water hook columns and
  areas; reed runs by arc length); **FINDS** §5.2 (the five treasures ship; the rest later); **LOST-TACKLE** (found tackle travels;
  the Button's rule at every water); **M1** §6.4 (the `--shipped=sporewood` mode beside the Mossmere's); **CONTRACT** §14 (the outline
  shore seam, `shoreDist`; the Tackle screen; `towTo`).

---

## 13. Risks

| risk | guard, and the knob |
|---|---|
| the outline shore touches every shore reader (W1) and could move the Mossmere | the Mossmere keeps `shoreR`; the geometry hash test lands first; `shoreDist` falls back to the polar shore when no outline is authored |
| the green costs too much on phones | merged cells, opaque, compiled out at lush 0; budgets in §1A; knobs: strands and reeds out of the mirror first, then counts ×0.7 on medium |
| the reset feels like a loss | told twice, plainly; the carried line on the sheet; Murk's line; the first line on trip 3 restores the pace (§8) |
| the sim's Sporewood is the family rule, not §2.4's hook table | done (D2, §8.4): `--shipped=sporewood` measures on the game's pools and tables; the knob moved was the value tier (11 → 12); W1's areas, once baked, move the figures again (re-run it at the gate) |
| Chart bytes (index.html already over 3.3 MB) | measure at C; the polish pass's byte work |
| the neck place's bank hides the way through | its footprint lifts inside (0.35, as built) and the raft's glide threads it; checked in W1's sail-path test |
