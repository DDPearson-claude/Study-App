# Lake 2: Sporewood Pools under the loop, and the gear loop across waters (design v1)

*Design only: no file in `src/` or `tools/` changed with this document. Written 17 November 2026 on `gw-lake2-design`, from the dev
branch at 29cd74b (M1: the Mossmere and the home barge, shipped under `GW_LOOP`). It binds with SPEC v8.10, M1, WATERS v7.1, ROSTER,
GEAR-GATES, FINDS, LOST-TACKLE and WATERCRAFT; where it changes one of them, the change is named here and in §12, and the owner's lane
writes it into that file when it builds. Figures marked* measured* come from the scratch sim of §8; figures marked *est.* are hand
figures.*

---

## 0. The user's words, and what each becomes

| # | the user, 17 November 2026 (verbatim) | what this design does |
|---|---|---|
| 1 | "Lake 2, the next water on the road, so play-testers have somewhere to go." | Sporewood Pools ships under the loop as a real second water: its open water, four places, two giants, its legend, its own shop, its own sound and its own look (§3–§7). The smallest build that does it (§9); later sheets and extras wait (§10) |
| 2 | "Make sure not very many fish repeat in each water." | No Mossmere fish lives at Sporewood. The one fish in both waters is the Nightbloom Carp, a rare guest of the Mossmere that a found notebook brings (as LOST-TACKLE already ships it). Three kept built species that would be a second puffer, a second koi and a fourth perch-built fish are left out of this edition (§2.2) |
| 3 | "And make sure each new fish looks completely different from any related version of that fish." | Every Sporewood fish with a relative in the Mossmere gets a different body plan or a different build of the plan: silhouette, head and mouth, fins, tail, markings, colour and size (§2.3). Three new plans (disc, bream, tuna) and new parameters on five built ones |
| 4 | "Make sure the next lake has more greenery than the moss mere also make sure its more of a natural shaped design not just a geometric shape. Its important to feel very different from the previous lake" (binding) | §1A, point by point: far more green, an irregular two-pool basin with coves, a neck, points, a spit and six islands, drawn so on the Chart, and different from the Mossmere in twelve named ways |
| 5 | "I think the gameplay loop from the gear purchase perspective is at the next lake you lose everything you bought but keep permanently a portion of the stats you got. Anything you found whilst fishing you keep permanently and you can change rods and reels at your leisure in an options menu. Gear from murk at the new location needs to perform a similar job but feel different. There should also be completely different lures etc on every new map." (binding, from Lake 2 on) | §5, the gear loop across waters: bought tackle stays behind and a third of its Hold (and of the rod's cast) is carried for good; found things travel; a Tackle screen; Murk's Sporewood shelf does the Mossmere's jobs in Sporewood's own materials; every lure and bait at Sporewood is new |

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
| silhouette | vast flat shovel head, a door-wide mouth, two bell-rope whiskers, an eel-taper tail, bronze, a bell in the skull | **shark-like**: a deep, high-shouldered body, **a tall pointed back fin like a shark's**, **a deeply forked tall tail**, a blunt rounded snout, **no whiskers** (two stubs at most) | **bullet head** with **four pairs of long whiskers** fanned forward; a tall back fin and a small fatty fin; **a deeply forked tail that is ember-red** |
| `catfish` parameters | `head: 'shovel', whiskers: 2 long, tail: 'eel'` | `head: 'bullet_round', whiskers: 0, body: 'deep', dorsal: 'shark', tail: 'fork_tall', eye: 'low'` (the eyes set **below** the mouth line: "it has only ever looked where it will sink") | `head: 'bullet', whiskers: 4 pairs long, dorsal: 'tall', fattyFin: true, tail: 'fork'` |
| colour | tarnished bronze, lavender eyes | pale pewter-cream flanks, a plum back, no glow | ink-plum body, a cream line from gill to tail, **the tail ember-red to amber**, a faint warm glow at its tip only at night |
| size at a glance | 260 cm and more | 75–105 cm, deep | 55–74 cm, slim |

**Carp: the Nightbloom, against the Weeping Carp, the Rustfin Sucker and the Candlefin Koi.**

| | the Mossmere's | Nightbloom Carp |
|---|---|---|
| silhouette | Weeping Carp: a standard carp with barbels, grey; Rustfin: a slim sucker with a down-turned mouth; Candlefin: a koi with long fins | **a giant barb**: **a huge head (a third of its length)**, **a high arched back**, **no barbels**, a small upturned mouth, a short deep tail stalk and a broad forked tail |
| `carp` parameters | — | `head: 1.35, back: 'arched', barbels: 'none', mouth: 'up', scales: 'giant'` (coin-sized scales, each outlined) |
| colour | — | plum scales **edged in cream like petals**; at night the edges glow faint amber, "a bloom" (replaces the guest's lavender flank glow) |

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
above and below a thin keeled tail stalk, **a stiff crescent tail**; slate-blue back with plum scribbles, cream belly; a sea fish
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

The score is `audio-music.js`'s built `sporewood` theme. `tools/audio-render.mjs --set=sporewood` renders the bed for the gate.

---

## 4. Where each part of the brief is

What is there: §1. Greener, natural, different: §1A. The roster: §2. The water: §3. The gear loop across waters: §5. The road in:
§6. The shop: §7. Pacing: §8. The build plan: §9. Later: §10. The user's questions: §11.

---

## 5. The gear loop across waters (binding from Lake 2 on)

### 5.1 The rule in one breath

When the home is towed to a new water for the first time, **every rod, line and reel bought from Murk at the old water stays
behind**, and **a third of the Hold they gave (and of the rod's cast) is carried for good**: the Wick's hands keep what they learned.
**The old water's lures and tins stay at that water** (they only work there, and they are there again on the way back). **Everything
found while fishing travels** with the home, and so do the raft, the hold, the barge and everything on it. At the new water Murk
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
| **the raft's parts** (Oars, Keel, Lantern) and **the hold** (its slots) | **travel** (default; question 2) | they are the raft and its creel, towed with home; resetting the hold too measured punishing (§8) |
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
  > Bought rods, lines and reels stay here.
  > Your hands keep a third: **+2 Hold** each.
  > Lures and bait wait at the Mossmere.
  > Found things come with you.
  > **[Tow]** **[Not yet]**

  The **+2** is computed (§5.3). "Not yet" returns to the Chart; nothing changes until Tow. Tow writes `barge.towed`, then the carry
  and the reset, in one save (a reload lands at the new mooring with all of it written, SPEC §6.5's rule).

### 5.3 The carried portion

- **What is carried**: the **Hold of the rod, the line and the reel** (each slot alone) and **the rod's cast**. The line's size cap
  follows from the line's total Hold (§5.6), so it is carried too, softly. Hook windows, a found piece's trade-offs, lures' and baits'
  Hold are not.
- **How much**: at each first tow, per slot, **carry += ceil(H / 3)**, where H is the Hold of the best piece **bought at the water being
  left** (not counting what was already carried); the cast likewise: ceil((the best bought rod's cast − 16 m) / 3). Leaving the
  Mossmere with T2 everywhere (5 / 5 / 5, cast 19 m): **+2 / +2 / +2 Hold, +1 m cast**. With T1 only: +1 each. Never less than 0;
  a slot never bought carries nothing new.
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
| Spore Cake, a tin of 10 | plain bait | 15 · **35** | the right bait of the barb, the crayfish, the Downcast; the Threadling takes nothing else | a crumbly plum-brown cake studded with gold spores | dissolves in a slow gold cloud | "Nearly everything here eats it." |
| Amber Grubs, a tin of 10 | glow bait | 15 · **35** | the right bait of the night carp and the angler; the Sleepspore Jelly takes nothing else | fat cream grubs with softly lit amber segments | curl and uncurl on the hook | "For the Jelly and the night carp." |
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
| Hold 7, the Ferry Hamper | the hold ladder | 2,000 · **4,000** | 7 slots (it travels) | built ladder | — | built line |

Each item gets an engraving in Murk's catalogue (`murk-engrave.js`, his line-engraving style) and a mesh where it is seen on the
raft (lures on the rod tip, the reel on the rod; the tackle's meshes follow the built tiers' shapes in the new materials). Thirteen
permanent items, 25,160 shown (with Hold 7), beside two tins and the Glowcap Bulb. Raft and home items: none new in this edition (§10).

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

---

## 9. The build plan (lanes, two at a time)

Sizes: S ≤ half a day of a builder, M about a day, L two days or more. Every lane ends green on `node tools/check.mjs`,
`validate-data --loop` (never `--refresh-fingerprint`), its own node tests and the flag-off fingerprint; visual lanes add one
browser run (desktop 1280×720 and 960×540, the near-square phone, 390×844, the Legion Go 1280×800 touch and controller) and two
look-and-fix rounds.

| lane | what | data keys and values | words | tests and scenarios | art | size | needs |
|---|---|---|---|---|---|---|---|
| **D1 · the data shape** | Sporewood under the loop, as data | `LOOP.waters.sporewood = { order: 2, tier: 11, prices: { night: 1200, crown: 2200 }, lake: 1400 }`; `LOOP.places` (the four of §3.2 with `out`, `card`, `giant`, `own`, `draws`, `legend`); `LOOP.species.sporewood` (the nine open-water fish); `LOOP.kept` += capshell_crayfish, mildew_angler, sleepspore_jelly; `LOOP.legendBait.sporewood = { id: 'glowcap_bulb', price: 250 }`; `LOOP.gear = { mossmere: TACKLE T0–T2, sporewood: [ +0, +3, +6/+7/+6, cast +2/+4, names ] }`; `LOOP.lures` the Sporewood five (`water: 'sporewood'`, `start` for the Twirl, `giants` for the Spore-Lamp Fly); `LOOP.tins.sporewood = ['spore_cake', 'amber_grubs']`; `LOOP.start.sporewood = { lures: ['seedpod_twirl'], bait: { spore_cake: 10 } }`; `LOOP.carry = { share: 1/3, round: 'up', castFrom: 16 }`; `LOOP.gearCap.lineAt = { mossmere: {trophy: 2, elder: 5}, sporewood: {trophy: 4, elder: 7} }`, `item` += seedpod_twirl keeper; `LOOP.hold.shelfMax` 7 with Sporewood; `LOOP.mooring.sporewood`; `LOOP.shipped` stays 'mossmere' until the gate; roster.json: the eleven fish's `favours` re-written to the new items, `roster-export` grows `src/roster-shipped.js`; `ROSTER_ART` the fourteen looks' keys (parameters filled by F); `watercraft.js` per-water `hookItems` and Sporewood's `HOOK_ROWS`, `RAW_ROWS`, geometry stub | `TEXT_LOOP.gearItems` (13 names), `shelf` (12 lines), `places` (4 card lines), `murk` (3 lines), `carry` ("Carried {r} · {l} · {c}"), `leave` (the card's 5 lines and 2 buttons), `mapLeaves` ("Moving on leaves your tackle."), `guide.newWater`; `textAllowed` | validate-data: every key, every item a water, no lure in two waters, hook rows complete (1% rule exact), `lineAt` reproduces GEAR-GATES' Mossmere caps, the list rule; existing tests unchanged with `LOOP.shipped = 'mossmere'` | — | **M** | — |
| **D2 · the logic and the sim** | the carry, the reset at the tow, per-water gear, the way back's gear, the save | `progression-loop`: `towTo(water)` (the carry: ceil(H/3) per slot from the best bought at the water left, the cast; `tackle` reset to 0, `gearWater`, `fitted` to the new start kit, `bait[water]` the start tin once, `startKit` per water), the shelf per water (`shelfItems` reads `LOOP.gear[water]`, `LOOP.lures` by water), `holdOf(slot)` = start + carry + the fitted piece, `gearCap` by `lineAt`, the tin and sheet filter lures by water (found ones always), orders keyed by water, `migrateLoop` (additive: `carry {0,0,0,0}`, `gearWater 'mossmere'`, `fit` from `found`; LOOP_SCHEMA stays 3); `clams.mjs --shipped=sporewood` (the scratch's hooks made real, the hook table of §2.4, the per-water caps, the arc from the Mossmere's end through the map and the tow, §8.1's checks) | — | `loop-carry.test.mjs` (the carry's arithmetic, stacking over two waters, nothing owned lost without the card, a reload mid-tow, the found pieces kept, lures back on the way back, the Mossmere caps unchanged), T104 on Sporewood's pools (the game's pool is the sim's), the save fixture (an M1-end save → the tow → +2/+2/+2) | — | **L** | D1 |
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

---

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
| 2 | Do the raft's parts (oars, keel, lantern) and the hold's slots count as "bought gear" that stays behind? | **No: they travel with the raft and the home.** Resetting the hold too measured punishing (41% of the old pace on the first evening, and 3,000 clams of Hold 5 and 6 to buy again) |
| 3 | Cut Strip (cut from your own small fish, never bought) at every water? | **Yes**, the one hook that is the same everywhere |
| 4 | Going back to the Mossmere: your new tackle works there and its old lures and tins are waiting there? | **Yes** |
| 5 | Leave the Sporebelly Puffer, the Hushcap Koi and the Plumgill Perch out of Sporewood (a second puffer, a second koi, a fourth perch-like fish)? | **Yes** (14 fish, none repeated) |
| 6 | The carried portion: a third (rounded up)? | **A third** (measured: a quarter or none punishing, a half or all trivial) |
| 7 | The Sporewood map at 2,800 (it was planned at 5,200 after the doubling) so it comes about 37 minutes after the Mossmere's shelf is empty? | **Yes** |
| 8 | Hold 7 (4,000) on Sporewood's shelf as its long goal? | **Yes** |

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
| the sim's Sporewood is the family rule, not §2.4's hook table | D2's `--shipped=sporewood` re-measures with the table before the gate; the knobs are the tier prices and `lineAt` |
| Chart bytes (index.html already over 3.3 MB) | measure at C; the polish pass's byte work |
| the neck place's bank hides the way through | its footprint lifts inside (0.35, as built) and the raft's glide threads it; checked in W1's sail-path test |
