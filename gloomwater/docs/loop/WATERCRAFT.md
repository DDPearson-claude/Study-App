# Watercraft: where the fish are, what they take, and reading the water (the Mossmere; binding design, v2)

*Written 16 November 2026, after the user played the published preview (slice 1a, step 2's roster fish, the drawn Chart,
the Wick choice; its shelf the hold and Rod, Line and Reel). **Revision 2, the same evening, after two critics** (an angler
and a builder; §14 logs every finding and what was done with it). Binding with `SPEC.md` v8.7 (§0 rows 36 and 37,
decisions 93–104, §0.13) and `M1.md` revision 8. Scope: **Lake 1 only, the Mossmere**, by the user's word ("Just lake 1").
Every other water keeps SPEC §4.4–§4.5 until its own slice writes its own rows of these tables. Design only: no `src/` or
`tools/` file is changed by this document. Figures marked *measured* come from scratch scripts run against the live data and
layout of `gw-mvp-4` (the layout is `gw-m1-mvp`'s): the areas' shares and clearances (§2.1–§2.2), the fit (§2.4) and the
tables of §2.5 and §3.8 from this document's own rules applied to `data.placePool`. Figures marked *est.* come from
`tools/sim/clams.mjs --shipped=mossmere --quick` with a price factor added by hand, before the areas and the hook table. None
of them stands as proof until the watercraft build's own code and sim print it (§9).*

*Inputs: the user's two messages (§0), research notes on reading a still lake from generic angling sources (UK coarse-angling
magazines and tackle sites, US bass and fly sites, US state wildlife and extension pages; Appendix A lists them), an audit of
`gw-m1-mvp`, `gw-mvp-4`, `gw-mvp-5b-home`, `gw-mvp-5b-tow` and `gw-mvp-5c`, and the two critics' reviews. Never name any
television series or presenter in anything written from this document.*

---

## 0. The user's words, and what each becomes

> "Different areas of the lake should have different % chances of catching different species.
> When you lose a fish you should not be told what it was.
> You should be able to see the outline or silhouette of some fish under the lake and if you cast on that spot you have a
> chance of catching it. The silhouette should be proportionate to the size of the fish.
> You should be able to read the surface of the water or an area of the water to tell if you're likely to catch a fish.
> Not througg sparkly visuals but grounded in real life fish hunting techniques about knowing a fishes natural environment
> and actually reading the water.
> The cost of items in murks shop should be way higher. I did 2 runs just keeping whatever I caught and managed to buy
> everything he had to offer me at the published games current state." (16 November 2026, after playing the preview)

> "We should give some consideration to lure and bait options. For example if I've got a worm on as bait I am never going to
> catch a pike, so the % chance for catching a pike if a worm is on should be 1 or less" (16 November 2026, a few minutes later)

| the user said | it becomes | where |
|---|---|---|
| different areas, different chances | ten habitat **areas** of the Mossmere's open water, each with a weight for each fish, grounded in its real cousin's haunt and hour; the four places keep their pools | §2 |
| a worm never catches a pike | **the hook table**: every Lake 1 bait and lure (and the bare hook) against every Lake 1 fish. A fish that won't take what is on the hook is a **stray**: **at most 1 cast in 100 brings it, whatever else that cast carries** (a tell, a silhouette, a comeback). A good match raises the fish. The bare hook brings the small fish and the bottom fish, never the hunters past 1 in 100 | §3, §4 |
| read the surface, grounded, not sparkly | **the tells**: the v3 signs re-grounded as an angler's reads (the rise as a sip, a splash or a roll; the swirl; nervous water; fry spraying; the strike; carp fizz; pin-pricks), with mud clouds, tailing, moving pads and twitching reeds, one false tell (bed gas); a cast that obeys a tell gets a visible answer from the water and a quicker bite; and **the water's face**: the drop-off's shade, the inflow's seam, the wind lane, reed beds, lily beds, a heron. The glow sign and every gold mote, ring and ember on the water retire on Lake 1 | §5 |
| silhouettes, true to size, catchable | **silhouettes**: a few real fish seen as dark shapes, with their shadows, in clear, calm, shallow water; drawn at the fish's own length; they cruise, root and turn; a cast on top spooks one; a cast a little ahead gives a real chance at *that* fish | §6 |
| not told what got away | **the lost fish**: no note, no name, no class word or glyph, no weight, no mark on the Chart, no ember. The line, the sound and the water say only that something heavy or light went | §7 |
| Murk's prices way higher | **one factor on every price Murk asks**: ×3 on the Mossmere (consumables excepted). On an average evening two trips buy nothing; the first purchase comes on the third trip; Lake 1's shelf takes 4.5–7.5 hours for the blind caster, the water-reader and the stalker alike, not 2 | §8 |

Each ruling is the lead's design of the user's words; the questions only the user can answer are §12, each with the default
this document builds.

**The standing taste (binding, every lane).** "Art, atmosphere and fishing those are our key drivers." The Clear Night
(Starlit) palette; UI Drowned Filigree. **Never a drawn ring, disc, outline, reticle or marker round the raft, the Wick, the
barge, a silhouette or a tell; the water's own ripples, rings and wakes, drawn as water, are not markers.** Fishing is
automatic after the strike. **Odds and percentages are hidden**: never under a fish, never on the water, never on the
catalogue's fish; they appear only in the player's logs (the gear log, the Journal's odds block). No way to fail. Few words:
SPEC §8's and `TEXT_LOOP`'s only. Sizes in pounds and ounces. The player learns by watching, never by a tutorial wall.

---

## 1. The design on one page

1. **Where you cast decides who is there.** The bob lands in an area (§2): the margins, a reed line, a lily bed, the
   drowned stone and timber, the drop-off, a wind lane, open water, the deep, the inflow, the outflow; or a place you own.
   Each area weights each fish (perch on the stones, pike on the reed edge, trout in the deep, suckers on the inflow's
   gravel, carp and koi in the pads). Before the hook, the areas only move fish around: a player who casts anywhere meets
   today's mix, tilted by the hour.
2. **What is on the hook decides who takes it** (§3). Each Lake 1 fish grades the bare hook and each bait and lure: won't
   take it, takes it, likes it, the right bait. A fish that won't take it is a stray, **never more than 1 cast in 100**. A
   worm never brings a pike past that; a spoon never brings a carp or a crayfish; a bare hook never brings a hunter. A lure
   tipped with a bait is fished as the lure; a bait its taker also likes makes it keener.
3. **The water shows where the fish are, honestly** (§5). Every tell is made by a fish that is really there at that spot and
   hour. Casting by its rule brings its fish more often, and the water answers: the fizz turns onto the float, a bow wave
   comes, the stems knock. Nothing glows, nothing sparkles; one tell lies (bed gas), as the real water does.
4. **Some fish can be seen** (§6): dark shapes over a pale shallow bed, at their true length, by day and dusk; at night only
   where the lantern's light falls. Lead one and it may take; land on it and it bolts.
5. **A lost fish is a mystery** (§7): a slack line, a splash, a sound. Nothing names it, anywhere.
6. **Murk's prices are ×3** (§8), one key, `LOOP.cost.factor`, applied where every price is made, fitted once everything is
   merged so the shelf takes 4.5–7.5 hours for every kind of player.
7. **Built tonight in three lanes and one integration step** (§9): the roll and its proof (WC-1); the tells and the
   silhouettes (WC-2); the water's face, the lost fish and the gear log (WC-3); then Murk's prices and the fit (the
   integrator's step P).

---

## 2. The lake's areas (A)

### 2.1 The areas

The Mossmere is a bowl 60 m in radius (`ZONES[0].arena`): a shallow shelf round the shore and the islands, mid water, a deep
middle and the Bell Pool's hole; six islands, the Toppled Bridge's four piers, three pylons, three statues, five docks, the
home barge at its mooring, the Moss Sluice in the south and the Sluice Veil's spill on the east cliff. The ten open-water
areas are found from that geometry (§2.2) and from a few cheap props (§5.4); none is painted by hand on a texture.

| area (code id) | what it is, in the world | how `areaAt` finds it (§2.2's order) | share of open water *measured* | the grounding |
|---|---|---|---|---|
| **the inflow** (`inflow`) | the Sluice Veil's spill on the east shore: moving water, a foam seam, a pale gravel fan | within 9 m of (54, 4) | 1.8% | inflows carry food, oxygen and cooler water; suckers spawn on gravel where the water runs [S20, S21, S36] |
| **the outflow** (`outflow`) | the lip of the Moss Sluice: water sliding south, foam threads drawn to the gate | 4.5–11 m from the gate (0, −49) | 3.2% | an outflow dislodges small fish and hands perch an easy meal [S7] |
| **the drop-off** (`dropoff`) | the Bell Pool's rim, where the pale water falls to ink; and the shelf's lip all round the lake | 6–12 m from (−4, −14) (outside the Bell Pool place); or, after stones and reeds, depth 0.35–0.45 within 14 m of the shore or 6 m of an island | 10.7% | the colour change where the bed vanishes is the drop-off, prime for perch, pike and zander [S34, S7, S8] |
| **the lily beds** (`pads`) | four authored lily beds (§2.2), and their notched pads | inside a bed's disc | 2.9% | lilies hold tench and carp all day in their shade; pike and bass sit at the outer edge [S4, S5, S16] |
| **stone and timber** (`stones`) | the drowned street: the bridge piers' ends, the pylons, the statues, the docks and the barge's hull, the masonry rims of the Drowned Gatehouse and the Stair Isle, the drowned roots of Root Isle | within (r + 4) m of a pillar, 4 m of a dock, (r + 4) m of a hull circle (`data.loopMooring`), or 3.5 m outside a `tower`, `stair` or `roots` island | 11.7% | perch and bass hold on structure and the shaded side of docks and hulls; crayfish choose rock; chub run for snags [S7, S16, S17, S22–S24] |
| **the reed lines** (`reeds`) | reeds round the rock islands (Mossbell Isle, the Elder and Younger Sisters) and four reed beds along the shore (§2.2) | from a rock island's edge to 1.35 r + 1.5 m from its centre, or 0.5–6 m off the shore inside a reed arc | 5.8% | pike lie at reed points and drowned timber; carp push through the stems; rudd dimple by reeds [S8, S9, S19, S25] |
| **the margins** (`margin`) | the shallow shelf by every shore and island (depth < 0.35) not claimed above | depth < 0.35 | 23.7% | silty margins: carp tail and cloud there; small fish in the shallows on warm evenings [S1–S3, S25] |
| **the wind lane** (`lane`) | this evening's slick: a smooth strip 4 m wide and 50 m long across the ripple, a scum line on its downwind edge | inside the evening's strip (`laneFor(evening)`), depth ≥ 0.35; day and dusk only | 1.2% (day and dusk; 0 at night) | lanes carry and collect food; fish rise along their edges [S32, S33] |
| **the deep** (`deep`) | the bowl's dark middle, blank on top | depth ≥ 0.75 | 18.1% | lake trout hold deep; zander keep to deep water by day [S36; roster: Kissmark, Milkeye] |
| **open water** (`open`) | mid water with no cover | everything else | 21.0% | roach shoals roam; carp cruise; little holds fish for long |

The shares are measured on a 1 m grid over open water outside the four places and the barge's hull, the wind lane at its
mean over 100 seeded evenings, with §2.2's block. The **four places** of step 3a are areas too, and keep their pools exactly
(§2.3). A cast into an unowned place's mist is a mist cast, as built. The names above are this document's; **no area name
is ever shown on screen**. The player learns the areas by their looks.

### 2.2 The geometry (WC-1 copies this block into `src/watercraft.js`)

```js
// WATERCRAFT.mossmere.geometry — the Mossmere's areas (world metres; angles in degrees from +X toward +Z, as Math.atan2(z, x),
// taken in [0, 360)). Revision 2: two reed arcs and one lily bed moved clear of the Lily Maze and dock 3 (measured, §14 B2).
geometry: {
  inflow:  { x: 54, z: 4, r: 9 },                          // under the Sluice Veil (58, 4); the seam runs west from (56.5, 4)
  outflow: { x: 0, z: -49, r0: 4.5, r1: 11 },              // the Moss Sluice's lip, outside its stone ring
  rim:     { x: -4, z: -14, r0: 6, r1: 12 },               // the Bell Pool's drop-off, outside the place's 6 m disc
  lip:     { depth: [0.35, 0.45], shore: 14, island: 6 },  // the shelf's drop-off all round (tested after stones and reeds)
  beds: [                                                   // the lily beds (pads added by WC-3 in the pads' InstancedMesh)
    { x: -26, z: 34, r: 5 }, { x: 40, z: 28, r: 5 }, { x: -20, z: -50, r: 4.5 }, { x: -6, z: 52, r: 4.5 } ],
  reedArcs: [[100, 112], [120, 135], [232, 244], [318, 332]],   // shore reed beds, reedOff m off the shore
  reedOff: [0.5, 6],
  reedIslands: ['rock'], stoneIslands: ['tower', 'stair', 'roots'],
  stones: { pillar: 4, dock: 4, hull: 4, island: 3.5 },
  reedReach: { k: 1.35, plus: 1.5 },                        // a rock island's reeds: to k·r + plus from its centre
  margin: 0.35, deep: 0.75,
  lane: { w: 4, len: 50, within: 25, cx: 0, cz: -5, phases: ['day', 'dusk'] },   // laneFor(evening): a seeded point within 25 m of (0, −5) and a heading
}
// areaAt's order (first match wins; a point inside an owned, lifted place is that place, decided before areaAt is called):
// inflow → outflow → rim (dropoff) → pads → stones → reeds → lip (dropoff) → margin → lane → deep → open
```

*Measured clearances* (from the nearest dock post, place footprint, hull circle, the mooring's lane point, and the tow's
glide-in path: the segment 14 m out along the barge's line from its mooring, `LOOP.tow.glideIn` on `gw-mvp-5b-tow`, widened
3 m a side): reed arcs [100, 112] 22.8 m, [120, 135] 5.7 m (the Lily Maze), [232, 244] 8.2 m (dock 3), [318, 332] 9.5 m
(dock 2), each 99% open water; lily beds (−26, 34) 4.8 m (the Lily Maze), 100% open; (40, 28) 6.0 m (the glide-in), 95%;
(−20, −50) 18.6 m, 100%; (−6, 52) 14.4 m (the hull), 100%. The inflow's centre is water (depth 0.11).

`validate-data` checks (WC-1): every bed and reed arc is open water for ≥ 80% of its area and ≥ 3 m clear of every dock
post, every place's footprint, the mooring's hull circles and lane, and (when `LOOP.tow` is present) the glide-in path; the
inflow's centre is water; the baked shares (§2.4) sum to 1 and each is within ±3 points of the table above.

### 2.3 The four places, reconciled (their pools as built)

| place | its habitat | its pool (as built, unchanged) | what this document adds there |
|---|---|---|---|
| the Lily Maze (day, 60) | a lily bed in the lee of Mossbell Isle | the Candlefin Koi ×3 and the Weeping Carp ×1.5 (its `draws`), uncommons and rares ×1.5, commons ×0.5 | the hook table and the hour tilts; pin-pricks, moving pads, carp fizz; koi and carp silhouettes in its shallow half (§6); its static glow-buds retire (§5.7) |
| Under the Span (old, 150) | the bridge's piers and the drowned street's stones, shade under the arches | its own Bridgechain Sturgeon, the Thousandcast Pike's share, Elders, commons ×0.5 | the hook table, the hour tilts; fry spraying, strikes and swirls at the piers; mud clouds where the sturgeon digs; no silhouettes (too deep) |
| the Buoy Lights (night, 260; open water before dark) | the drowned harbour channel, in two rows of lamps | the Gloam Eel (on Lumen Moss only, ×2.5 there), the Hullkiss Lamprey's share, commons ×0.5; before dark its footprint is open water and gets its geometric area | the hook table, the hour tilts; at night, shapes crossing a drowned lamp's glow (§6.1) |
| the Bell Pool (crown, 500) | the deep hole, the drowned bell on its floor | the Belled Matriarch's sure bite on her bait in her hour; the open-water mix, commons ×0.5 | the hook table and the hour tilts for every other fish; its low gold glimmer retires (the bell is its mark); the rim around it is the drop-off |

The places are what the user bought maps for; their measured worth (each map +10% to +29% a minute) is kept by keeping their
pools. The area rows apply in open water only. (After M1, a habitat tilt inside a place may follow, re-measured; §13.)

### 2.4 The weights

**Raw weights** (a multiplier on each fish's built weight in that area; 1 is "as anywhere"). Each fish is normalised before
use (below), so only the shape of a row matters.

| fish (its real cousin) | margin | reeds | pads | stones | drop-off | lane | open | deep | inflow | outflow | the grounding |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Dusk Minnow (roach, rudd) | 2 | 1.8 | 1.8 | 0.8 | 0.5 | 2 | 1 | 0.3 | 1.5 | 1 | shoals in shallow, weedy water; dimples by reeds and pads on warm evenings [S25, S26] |
| Mossback Perch (perch) | 0.8 | 1.3 | 1 | 2.5 | 2 | 0.6 | 0.6 | 0.5 | 1.2 | 2 | structure, edges, drop-off tops, outflows [S7]; roster: "by stones and piers" |
| Gutter Crayfish (crayfish) | 1.2 | 0.6 | 0.4 | 3 | 0.5 | 0.2 | 0.3 | 0.2 | 1.5 | 1.5 | rock over mud or gravel; more stone, more crayfish [S22–S24] |
| Likely Chub (chub) | 1.3 | 1.5 | 1.2 | 2 | 0.4 | 1.2 | 0.5 | 0.2 | 2.5 | 1.5 | overhanging cover, snags, moving water, near the top [S17]; roster: "under overhanging stone and reeds" |
| Overbold Bass (smallmouth) | 1 | 1.5 | 1.5 | 2.5 | 1.5 | 0.5 | 0.5 | 0.4 | 1.2 | 1.5 | rock, docks' shade, edges where cover meets; herds fry [S16]; roster: "rocky shallows and drop-offs" |
| Rustfin Sucker (redhorse) | 1 | 0.5 | 0.4 | 1.2 | 0.6 | 0.6 | 1 | 0.8 | 3.5 | 2.5 | sucks the bottom over gravel; runs to inlets and outlets [S20, S21]; roster: "where water moves" |
| Lampsipper (a night riser) | 1.5 | 1.5 | 1.8 | 0.8 | 0.5 | 2 | 1 | 0.4 | 1 | 0.8 | takes insects from the film where they gather: pads, reeds, lanes [S25, S32] |
| Weeping Carp (common carp) | 2 | 2 | 2 | 0.4 | 0.8 | 1.8 | 1 | 0.8 | 0.5 | 0.5 | silty margins, weed and lily edges, reeds; follows the wind's food [S1–S3, S10–S13] |
| Candlefin Koi (a koi) | 1.5 | 1.2 | 3 | 0.3 | 0.3 | 0.8 | 0.6 | 0.2 | 0.5 | 0.3 | a lily fish, as tench are, feeding in the pads' shade [S4, S5]; the Lily Maze's own |
| Milkeye Perch (zander) | 0.3 | 0.4 | 0.3 | 1 | 2.5 | 0.8 | 1.3 | 2 | 0.8 | 1.5 | drop-offs and deep, hard ground; roster: "deep murky water by day, the shallows after dark" |
| Kissmark Trout (lake trout) | 0.2 | 0.2 | 0.1 | 0.5 | 2 | 1.5 | 1.2 | 3 | 2.5 | 1 | deep, cool, open water; inflows [S36]; roster: "the deepest open water" |
| Reedjaw Pike (pike) | 0.8 | 3 | 2 | 1.5 | 1.5 | 0.4 | 0.4 | 0.5 | 0.5 | 1.2 | reed points, the deep edge of weed and lilies, drowned timber [S8, S9]; roster: "reed edges and drowned timber" |

The place fish (the Bridgechain Sturgeon, the two giants, the Gloam Eel, the Matriarch) bite only at their places, as built;
they have no area row.

**After dark** (gloomtide) two rows change, as the roster and the research say: the Milkeye Perch's margin weight is 2.5
and its deep weight 1 (it comes up into the shallows); the Gutter Crayfish's margin weight is 1.8 and its stones weight 4.5.

**The hour tilts** (within a fish's built hour window; every other fish 1):

| fish | late day | dusk | night | the grounding |
|---|---|---|---|---|
| Gutter Crayfish | 0.6 | 1 | 1.8 | out at night to feed [S22, S24] |
| Weeping Carp | 0.9 | 1.4 | 1 | warm evenings, as the sun drops [S10] |
| Dusk Minnow | 0.9 | 1.4 | 0.8 | rudd and roach dimple on warm evenings [S26] |
| Reedjaw Pike | 1.2 | 1.1 | 0.6 | a sight hunter by day |
| Milkeye Perch | — | 1 | 1.3 | a low-light feeder |
| Kissmark Trout | 0.9 | 1.3 | 1 | rises as the light goes |
| Likely Chub | 1 | 1.2 | — | |
| Overbold Bass | 1 | 1.3 | — | busts fry at dusk [S16] |

**Normalisation (binding; revision 2).** The hour tilts change the mix on purpose (that is the hour); the areas must not.
For each fish and phase the build finds one factor `f` so that a player who casts anywhere, landing in each area as often as
its share of open water, gets **exactly the built open-water mix times the hour tilt, renormalised** (the *tilted target*),
before any hook: a fixed-point fit, `f ← f × target / blind`, 60 rounds. In open water the tilt lives inside `f` (a cast's
open-water weight is `w × f[phase][fish] × raw[fish][area]`); in a place the tilt is applied directly. *Measured*: the fit
converges to 0.000 points in all three phases on today's data.

**Baked, not computed at run time** (revision 2). `WATERCRAFT.mossmere.shares` (per phase) and `.factors` (per phase, per
fish) are constants in `src/watercraft.js`, printed by `node tools/tests/watercraft.test.mjs --bake` from the layout and the
fit; the test recomputes them and fails if a share moves more than 0.2 points or the blind pre-hook mix is more than 0.5
points off the tilted target. At run time only `areaAt` runs, once a cast and once a spawn, with a probe taken from the
world the game already built (`ctx.world.getDepth`, `ctx.world.getShoreRadius`); no second `buildLayout`.

**What "the areas add nothing" means, honestly.** Before the hook (§4 steps 4–6) the areas only move fish around: the blind
caster's mix is the tilted target within ±0.5 points (a fail check, §8.3). With a hook on, the areas and the hook multiply,
so a blind caster's mix on a lure differs from a no-area pool by up to about 6 points for one fish (*measured*: the trout on
a spoon at night, 19.0% against 24.7%, because most casts land where few trout are). The sim measures the real blind caster
with the real areas; nothing is claimed beyond that.

### 2.5 What it does (dusk; *measured* on today's pool with this document's tables; share of bites)

| where | on the bare hook | on a hook that suits it |
|---|---|---|
| a reed line | minnow 22%, chub 21%, bass 19%, perch 12%, crayfish 8%; the Reedjaw Pike 0.3% (a stray) | **Cut Strip**: chub 29%, bass 26%, crayfish 17%, perch 16%, **the Reedjaw Pike 6%** |
| stone and timber | crayfish 27%, bass 22%, chub 19%, perch 16%, sucker 7% | **Bone Jig**: bass 45%, perch 32%, chub 16%, zander 3% |
| the drop-off | bass 29%, perch 27%, crayfish 10%, minnow 9%, chub 8% | **Cut Strip**: bass 28%, perch 26%, crayfish 15%, **zander 12%** |
| the deep | sucker 24%, bass 17%, perch 15%, minnow 12%, carp 10% | **Glimmer Spoon**: **trout 39%**, bass 18%, perch 16%, zander 15% |
| a lily bed | minnow 23%, bass 20%, chub 17%, **koi 14%**, perch 9% | **Lumen Moss**: minnow 28%, **koi 27%**, chub 22%, carp 14% |
| the margins | minnow 24%, chub 18%, crayfish 16%, bass 13%, sucker 9% | **Mire Worms**: minnow 31%, chub 15%, crayfish 13%, sucker 11% |
| the inflow | chub 26%, sucker 23%, crayfish 15%, minnow 14%, bass 11% | **Mire Worms**: **sucker 28%**, chub 20%, minnow 17% |
| the wind lane | minnow 34%, chub 23%, carp 9%, bass 9% | **Feather Fly**: chub 39%, minnow 36%, bass 9%, trout 5% |
| open water | minnow 24%, sucker 18%, chub 14%, bass 13%, perch 11% | — |

The blind caster at dusk on the bare hook: minnow 18%, bass 17%, chub 15%, sucker 13%, perch 13%, crayfish 13%, carp 6%, koi
4%, the zander, the trout and the pike under 1% each (today: six commons 13.4% each, four uncommons 4.6%, the pike 1.1%).

### 2.6 Odds stay hidden

No area's name, weight or share is ever on screen, on the water, on a card or on the catalogue. The gear log's **Who bites**
block (§3.9) is the one place a share of bites shows, and it shows open water as a whole, the blind caster's mix over an
evening: reading the water stays the player's own skill.

---

## 3. Bait and lure (G)

### 3.1 The items (LANE 4 owns them; this table owns their effect on the bite)

| id | name | kind | owner | on the Mossmere's shelf |
|---|---|---|---|---|
| (none) | the bare hook | — | built | always (a fresh save's) |
| `mireworm` | Mire Worms | tin of 10 | LANE 4 (`LOOP.tins.mossmere`) | step 4 |
| `lumen_moss` | Lumen Moss | tin of 10 | LANE 4 | step 4 |
| `cut_strip` | Cut Strip | free: 3 from a Small or Keeper held at **Let go** | LANE 4 (`LOOP.cut`) | never sold |
| `heartmoss` | Heartmoss Ball | the legend's bait, one try | built (step 3a, `LOOP.legendBait`) | step 3 |
| `feather_fly` | Feather Fly | lure | LANE 4 (`LOOP.lures`) | step 4 |
| `glimmer_spoon` | Glimmer Spoon | lure | LANE 4 | step 4 |
| `bone_jig` | Bone Jig | lure | LANE 4 | step 4 |
| `bell_spinner` | Harbour-Bell Spinner | the giants' lure (`giants: thousandcast_pike, hullkiss_lamprey, reedjaw_pike`, `share` 1.5) | LANE 4 | step 4 |

### 3.2 The hook table

Grades: **0 won't take it** (a stray, §3.3) · **1 takes it** · **2 likes it** · **3 the right bait** · `null` not in the
table (the legend; a bait-only fish's bare hook, which `placePool` already leaves out).

| fish | bare hook | Mire Worms | Lumen Moss | Cut Strip | Feather Fly | Glimmer Spoon | Bone Jig | Harbour-Bell Spinner | why (what the real cousin takes) |
|---|---|---|---|---|---|---|---|---|---|
| Dusk Minnow | 1 | **3** | 2 | 0 | 2 | 0 | 0 | 0 | worms and bread; rudd take flies; too small for meat or a lure |
| Mossback Perch | 1 | **3** | 0 | 2 | 1 | 2 | **3** | 2 | the worm is the perch bait; small jigs and spoons; fish strips |
| Gutter Crayfish | 1 | 2 | 1 | **3** | 0 | 0 | 0 | 0 | meat and fish first, worms, scraps; never a lure |
| Likely Chub | 1 | 2 | 2 | 2 | **3** | 1 | 1 | 2 | eats everything: the dry fly in summer, meat, bread, worms, small spinners |
| Overbold Bass | 1 | 2 | 0 | 2 | 2 | 2 | **3** | 2 | jigs and crayfish lures, spinners, poppers, worms; no sweet bait |
| Rustfin Sucker | 1 | **3** | 1 | 0 | 0 | 0 | 0 | 0 | worms on the bottom; never a lure |
| Lampsipper | 1 | 1 | 2 | 0 | **3** | 0 | 0 | 0 | a night riser on insects |
| Weeping Carp | 1 | 2 | **3** | 0 | 0 | 0 | 0 | 0 | sweet baits first (bread, corn, paste), worms; never a lure |
| Candlefin Koi | 1 | 1 | **3** | 0 | 1 | 0 | 0 | 0 | sweet and floating baits |
| Milkeye Perch | **0** | 1 | 0 | **3** | 0 | 2 | **3** | 1 | deadbait strips and jigs are the zander's; a worm now and then; never a bare hook |
| Kissmark Trout | **0** | 1 | 0 | 2 | 2 | **3** | 2 | 2 | spoons fished deep, jigging, cut bait, a fly when it rises; never a bare hook |
| Reedjaw Pike | **0** | **0** | 0 | **3** | 0 | **3** | 2 | **3** | spoons, spinners, jigs, deadbait; **never a worm** (the user's rule) and never a bare hook |
| Bridgechain Sturgeon | 1 | **3** | 0 | **3** | 0 | 0 | 0 | 0 | worms, roe and cut fish on the bottom; never a lure |
| ★ Thousandcast Pike | **0** | 0 | 0 | **3** | 0 | 2 | 2 | **3** | big spinners; the roster's "takes the plainest bait": a strip of fish |
| ★ Hullkiss Lamprey | **0** | 0 | 0 | **3** | 0 | 1 | 0 | 2 | it latches onto meat; it kisses a flashing spinner as it kisses hulls |
| Gloam Eel | `null` | 0 | **3** | 0 | 0 | 0 | 0 | 0 | the game's own glow eel: Lumen Moss only, as built (its one bait is part of who it is) |
| ★ The Belled Matriarch | `null` | `null` | `null` | `null` | `null` | `null` | `null` | `null` | her rule only: the Heartmoss Ball in her pool in her hour, a sure bite |
| the Heartmoss Ball | as the bare hook to every fish but her (as built) | | | | | | | | |

Revision 2 changed six cells (§14): the bare hook is 0 for the five hunters (the two pikes, the zander, the trout, the
lamprey); the Kissmark Trout takes the Feather Fly at 2 (a fish that rises to flies likes the fly); the Reedjaw Pike and the
Thousandcast Pike take the Bone Jig at 2 (pike hit jigs readily); the Likely Chub takes Cut Strip at 2 (chub love meat).

The research's checks hold: worms are taken by perch, the carp, chub, crayfish, the small fish and the sturgeon, never a
pike; a spoon, a jig or a spinner by pike, perch, bass, chub and trout, never a carp, a koi, a sucker or a crayfish; meat
and fish strips by the hunters, the chub, the crayfish and the sturgeon; sweet bait by the carp, the koi, the small fish and
the chub; the fly by the risers.

### 3.3 From a grade to a weight; strays; the bare hook

```
grade 1 takes it ×1 · grade 2 likes it ×1.6 · grade 3 the right bait ×2.5 · grade 0 ×0.1, then capped     (WATERCRAFT.hook.mult = [0.1, 1, 1.6, 2.5])
the strays' cap, the last step of the pool (§4 step 12):   w' = min(w, 0.01 × S)
    S = the summed weight of every fish in this pool whose grade is 1 or more (the giant included when it takes the hook),
    after every multiplier. So each stray's share of the pool is w'/(S + Σ strays) < 1%, in every area, place, hour and kit.
every pool the game can draw has S > 0 (a fail check, §8.3; measured on the table: the smallest S is 14.6, a Bone Jig in the
    margins by day), so the water never stops biting and the cap always holds.
```

- **The bare hook** (revision 2; SPEC §16 question 38, the default changed): a plain hook with nothing on it, the fresh
  save's rig (SPEC §4.5: "with no bait you fish a bare hook; that is always allowed"). The small fish, the bottom fish, the
  carp and the koi nose at it (grade 1); **the five hunters never take it past 1 in 100** (the Reedjaw Pike, the Milkeye
  Perch, the Kissmark Trout, the Thousandcast Pike, the Hullkiss Lamprey: grade 0). A fresh save meets them by doing what
  Murk already tells it ("Small ones make good bait. Hold Let go.", LANE 4's `TEXT_LOOP.murk.firstSmall`): Cut Strip, free,
  is the right bait for every hunter. So the user's own example reads true both ways: take the worm off and the pike still
  does not come; put a strip of fish on and it does.
- **A bait-only fish** (the Gloam Eel) still needs its bait to be in the pool at all (as built, `placePool`'s `s.bait`, and
  as a gate before any pre-roll takes, §3.6); with its bait on, the table grades it as any fish.
- **The legend** is outside the table: her sure bite is her own rule (SPEC §3.5), and no other fish takes her bait.
- **A tin still gives favour +0.3** (every fish runs bigger) and the Hold of §3.7, as SPEC §4.5 says; what changes is that it
  now also changes who bites.
- **The rarity bonus** (Lumen Moss's built +0.1, a clean cast, the pity) applies as built, before the cap.

### 3.4 A lure tipped with a bait

Both slots stay (SPEC decision 5: one lure and one bait at once). Anglers tip a jig or a spoon with a worm or a strip; the
lure's action decides who strikes, the tip adds scent.

```
no lure:          the grade is the bait's (none: the bare hook's)
a lure, no bait:  the grade is the lure's
a lure and a bait: the grade is the lure's; where the lure's grade is 1 or more and the bait's is 2 or more, one step up (to 3 at most);
                  a lure's 0 stays 0 whatever the bait (a carp never takes a spoon, tipped or not); the bait never blocks a lure's taker
```

Examples: Glimmer Spoon + Mire Worms: perch 2→3, bass 2→3, chub 1→2, the pike 3 (the worm does not keep it off a spoon),
the carp a stray. Feather Fly + Lumen Moss: the minnow 2→3, the koi 1→2. Bone Jig + Cut Strip: the pike 2→3, the zander 3,
the trout 2→3. To fish for the Gloam Eel, fit Lumen Moss and take the lure off (`fit('lure', null)`, built by LANE 4).

### 3.5 Giants

A giant keeps SPEC §3.5's fixed share (6% in its hour, 2.5% outside; ×1.5 with its water's giants' lure; Taper ×1.3, never
above 12%). The table adds one rule: **a giant whose grade is 0 is a stray** (its weight ×0.1, then the strays' cap): the
Thousandcast Pike and the Hullkiss Lamprey never come to a bare hook, a worm or Lumen Moss past 1 bite in 100. Grades 2 and
3 do not raise a giant's share; only the giants' lure does, as built. *Measured*: the Thousandcast Pike is 6% of the bites at
Under the Span at dusk on Cut Strip or the spoon, 9% on the spinner; the Hullkiss Lamprey 6% at the Buoy Lights at night on
Cut Strip, 10% on the spinner.

### 3.6 Pre-rolled fish obey the hook, and the rule holds for the whole cast

A rise's, a swirl's or a silhouette's fish and Ashwick's comeback all obey the table:

```
takeChance(base, grade):  grade 0 → 0.01
                          grade 1 → base
                          grade 2 → max(base, min(0.9, base + 0.1))      (revision 2: never below the base; a rise's fish stays 1)
                          grade 3 → max(base, min(0.9, base + 0.2))
    a rise's fish: base 1 · a swirl's Prize+: base 0.6 · a silhouette's fish: base 0.45 (§6.6)
a bait-only fish (the Gloam Eel) pre-rolled on a hook without its bait never takes (as built: "its bait fits"), before takeChance
WHEN A PRE-ROLLED STRAY REFUSES (revision 2): that species is left out of this cast's pool. So the whole cast brings it with
    probability exactly 0.01 (its take) + 0.99 × 0 = 1%, never 1% + another 1% from the pool behind it.
```

- **The user's rule is a property of the whole cast** (revision 2): for every cast type (blind; obeying each tell; at a
  silhouette; Ashwick's comeback; Taper's first bite; the rarity bonus at its largest) and every hook, the chance that the
  cast brings a fish that won't take the hook is at most 1.00%, computed exactly by `castOdds` (§4), the same function the
  game draws from. No sampled test bounds it; a sampled test only checks the game draws what `castOdds` says.
- A silhouetted pike will not take a worm, past 1 time in 100: it noses the bait and turns away.
- **Ashwick's comeback** waits while the hook carries something it won't take: it keeps its turn at that water this evening
  and comes at the first cast whose hook it takes (grade ≥ 1), still a surprise (§7).
- **The pull** (SPEC §5.5 (d)) is modelled by the sim only (no pull is built in `fishing.js` on M1): it multiplies only a fish
  whose grade is 1 or more, and its sure bite waits for a hook the fish takes. If the game builds the pull later, it obeys
  the same rule. The list itself is unchanged (its members come from the bait-only rule, SPEC §5.5 (c)): the Mossmere's list
  stays 12; a fresh save reaches the hunters on it with Cut Strip, free from its own small fish (§3.3).
- **Murk's orders** are unchanged (an order for a pike is filled on a spoon or a strip).

### 3.7 Hold: which fish a bait's or lure's Hold helps

The items keep LANE 4's Hold values (the Feather Fly +5, the Glimmer Spoon and the Bone Jig +6, the Spinner +10, a tin +5,
Cut Strip +4; the larger of the lure's and the bait's, never both). **The fish they help become the fish that like the item
or better (grade 2 or 3)**, from `watercraft.gradeTargets(itemId)`, instead of a family: the Bone Jig helps the perch, bass,
zander, trout and pikes it brings, not the carp and suckers it never sees; **the Spinner keeps its named fish** (LANE 4's
`giants` list, each grade 2 or 3). The gear log's line says so and never names a fish the player has not met (§3.9).

### 3.8 The user's case, measured on the tables (*measured*, dusk, a reed line, the Reedjaw Pike's share of bites)

| on the hook | the bare hook | Mire Worms | Lumen Moss | Cut Strip | Feather Fly | Glimmer Spoon | Bone Jig | Harbour-Bell Spinner |
|---|---|---|---|---|---|---|---|---|
| the Reedjaw Pike | **0.3%** | **0.1%** | 0.2% | 6.2% | 0.2% | **8.6%** | 4.2% | 7.5% |

And a spoon in the margins: the carp, the koi, the crayfish, the sucker and the minnow 1.0% each at most (each at its cap),
the bass 36%, the chub 32%, the perch 20%, the pike 3.3%. The worst stray share over every pool the game can draw (ten areas
and four places × three phases × twelve hooks × the rarity bonus 0 and 0.5 × Taper's first bite or not × each tell's makers
tilt), before any pre-roll: **0.990%** (the Reedjaw Pike on worms at the stones by day, Taper's first bite and a strike's
tilt).

### 3.9 Where the player learns it

- **By watching**: what comes to which hook, the silhouettes that nose a bait and turn away (§6.6), the hunters that only
  ever come to a strip or a lure.
- **The shelf's one line** for each tin and lure (SPEC §8.11, replacing LANE 4's family lines): Mire Worms "Nearly every fish
  takes a worm." · Lumen Moss "Sweet. The Gloam Eel bites on nothing else." · Cut Strip (the bait slot's) "Meat, for the
  hunters." · Feather Fly "For the fish that rise." · Glimmer Spoon "Flash, for the hunters." · Bone Jig "Hopped on the
  bottom, for the hunters." · Harbour-Bell Spinner "For the Thousandcast Pike." (as built).
- **The gear log** (opened from a card's **Odds ›**, built): each tin and lure's line reads "+{n} Hold on the fish it suits
  ({m} you have met)."; and under it the **Who bites** block: each fish of this water the player has met, with its share of
  open water's bites over an evening on that item alone (the blind caster's mix, `watercraft.bitesTable`, whole percent,
  "<1%" for anything under one, so every stray reads "<1%"), beside the bare hook's; fish not yet met are counted, never
  named ("and 3 you have not met"). *Measured, dusk*: on Mire Worms the minnow 22%, perch 16%, sucker 16%, bass 13%, chub
  12%, crayfish 10%, carp 5%, trout 3%, zander 2%, koi 2%, the pike "<1%". The only percentages this document adds, and only
  there. The catalogue never shows a fish's rate (SPEC decision 62 as amended by the user).

### 3.10 The seam with LANE 4, by item id

LANE 4 owns the items: `LOOP.lures` (`feather_fly`, `glimmer_spoon`, `bone_jig`, `bell_spinner` with `giants` and `share`),
`LOOP.tins` (`mireworm`, `lumen_moss`), `LOOP.cut` (`cut_strip`), their prices, Hold values, slots, cards, art and the gear
log's screen. The watercraft build owns `WATERCRAFT.mossmere.hook` (the table keyed by those ids) and its use: on a trip on
the Mossmere, `fishing.js` draws a cast from `watercraft.castOdds` (§4), which applies the areas, the hour tilts, the grades,
the giants' lure share (read from `LOOP.lures[id].giants` and `.share`: LANE 4's `lurePool` rule moved inside `finishPool`)
and the strays' cap; **LANE 4's `lurePool` is no longer called by `fishing.js`** (it stays exported and unit-tested). A
species with no row in the table (every other water's) keeps the built family rule, so nothing past the Mossmere moves.

---

## 4. The bite roll, in order (binding; revision 2)

On a trip on the Mossmere, `rollBite`'s species path calls `rollSpeciesLoop`, which builds the cast's whole distribution with
**`watercraft.castOdds`** and draws from it **once**. The order:

| # | step | owner | rule |
|---|---|---|---|
| 0 | the legend's sure bite | built | her bait, her hour, her pool → her; nothing below applies |
| 1 | Ashwick's comeback | built, WC-1 | the same fish and z, if its grade on this hook is 1 or more (§3.6); else it waits for a later cast and the cast goes on below |
| 2 | the pre-rolled fish | WC-2 (sources: a rise, a swirl, a silhouette), WC-1 (take) | the cast met its tell's or its silhouette's rule: the bait-only gate; Taper's first bite refuses a pre-rolled common (built); else it takes with `takeChance(base, grade)` (§3.6). Its entry in the distribution has that probability; the pool below gets the rest, **without that species if its grade is 0** |
| 3 | the pool, built | built | `data.placePool`: the hour window, the place's rules (commons ×0.5, draws, own fish, kind fish), the bait-only fish, "best at night", the giant set apart |
| 4 | **the area** | WC-1 | open water only: × `factors[phase][fish] × raw[fish][area]` (§2.4; the tilt inside the factor) |
| 5 | **the hour tilt** | WC-1 | in a place only: × the fish's tilt for this phase (in open water step 4 holds it) |
| 6 | **the hook** | WC-1 | × `hook.mult[grade]` (§3.3), the tipped rule (§3.4); grade 0 marked a stray |
| 7 | the rarity bonus | built | uncommon ×(1 + 2rb), rare ×(1 + 4rb) |
| 8 | **the tell's tilt** | WC-2 (makes `rule.makers`, `rule.tilt`), WC-1 (applies it) | the makers of the tell the cast obeyed ×3 (§5.3), **only those whose grade is 1 or more**; the sign rule F17 is judged on the takers and drops a tilt that would name a fish (built rule) |
| 9 | Taper's first bite | built | judged on the takers: the commons zeroed where at least two takers that are not commons remain and none is above 80% (the built sign rule); else the rule waits |
| 10 | the giant's share | built + LANE 4, in `finishPool` | drawn last from the rest: in/off its hour, ×1.5 with its giants' lure, Taper ×1.3 under 12% (LANE 4's `lurePool` rule moved inside); a giant at grade 0 ×0.1 |
| 11 | **the strays' cap** | WC-1, in `finishPool` | every grade-0 fish, the giant included: `min(w, 0.01 × S)` (§3.3): the last word on the pool, so nothing above can lift a stray past 1% |
| 12 | the draw, the size roll, the wait | built + WC-1 (the wait lines) | one draw over the distribution's entries, each tagged `from: 'comeback' \| 'preroll' \| 'pool'`; the size: a comeback's or a pre-roll's z when the drawn entry is that one, else rolled as built; the wait: an obeyed rise ×0.5, any other obeyed tell ×0.65 (`rule.waitMult`, §5.3), a silhouette's take ×0.3 (`rule.takeWaitMult` when the pre-roll entry was drawn), a silhouette's spook ×1.5, quiet water and the Wick as built |

**The snag** (LANE 5C, `gw-mvp-5c`): as LANE 5C built it, its own block straight after `S.species = sp`, apart from the
species roll: about 1 bite in 20 is a find instead of the fish rolled here (never on evening 1, the tutorial or a legend's
cast). It only ever replaces a fish, so it can only lower a stray's share, and the 1% rule holds. WC-1 leaves 5C's block
exactly as it is.

**`castOdds(D, {pool, area, phase, lure, bait, wickId, rb, rule, taperFirst, preroll, comeback})`** returns
`{entries: [{sp, p, from, z?}], S}` with the `p` summing to 1. It is pure, in `src/watercraft.js`, and is built from the
id-level parts both pool builders call (§9.2): `areaWeight`, `tilt`, `gradeOf`, `hookWeights` (steps 4–6), `finishPool`
(steps 10–11) and `takeChance`. `tools/sim/clams.mjs`'s `poolFor` calls the same parts in the same order, and T104 (the
game's pool is the sim's) is extended to every place and area × phase × hook × Wick (§9.2).

**Two pools a lane may ask for** (WC-1's `loopPool` options form, from its first commit):
- **who is there**: `loopPool(bait, phase, place, {area, hook: false})`: steps 3–5 only (no hook, no rarity bonus, no tilt
  from a tell). WC-2's honest spawning and the silhouettes' pick read it: the water shows what lives there, not what takes
  your hook.
- **what this hook brings**: `loopPool(bait, phase, place, {area})`: steps 3–6, the entries `castOdds` finishes.

---

## 5. Reading the water (B)

### 5.1 Principles

1. **Every tell is a small physical disturbance of the water**: a ring, a bubble, a cloud, a stem, a wake, a slick, a back
   breaking the film. None glows. None is a marker drawn round anything.
2. **Honest**: a tell appears only where its makers really are at this spot at this hour, as often as they are (§5.5).
3. **Obeying a tell is answered** (revision 2): a cast made by a tell's rule gets a grounded response from the water within
   a second or two (the fizz turns onto the float, a bow wave comes, the stems by the float knock; §5.3) and a quicker bite
   (wait ×0.65; a rise ×0.5 as built). Breaking a rule (into the cloud's middle, onto the fry) visibly spooks it, as built.
   So a player who is not an angler learns the craft by watching what the water does.
4. **Repetition confirms**: several tells in one patch over a minute say more than one ring, as real anglers know [S1, S19].
5. **One false tell**: bed gas, single big bubbles bursting now and then in one fixed spot, never travelling [S1, S29].
   Learning to ignore it is reading.
6. **The water goes quiet**: quiet water spawns no tells and no silhouettes (built for signs), so the lake itself says "move".
7. **No word, no drawn ring, no number** on any tell. The float's favour notches and good-bite dots stay as built.

### 5.2 What happens to the six v3 signs (DESIGN §25.6.1) on Lake 1, under the loop

| v3 sign (code id kept) | becomes | change |
|---|---|---|
| rise (`rise`) | **the rise**, in forms by its fish: a *sip* (a small quiet ring, often repeated in one spot: the minnow, the Lampsipper, the koi, the carp at dusk), a *splash* (the film slapped: the chub, the bass, the trout) and, as a should, a *roll* (a back and a dorsal breaking the surface, then nothing: the carp and the sucker at dusk) | its fish is drawn from the form's makers only (the "surface feeder" depth filter, which passed every fish, is replaced by the makers list); its droplets are water-white, never gold |
| boil (`boil`) | **the swirl**: a heavy bulge where a big fish turned just under, no spray | makers: the pike, the zander, the trout, the bass, the carp, the chub, Prize+ only (as built) |
| nervous (`nervous`) | two forms: **nervous water** (*ruffle*: a patch of film ruffled from under by a shoal, no spray; makers the minnow by day and dusk, the Lampsipper at night) and **fry spraying** (*spray*: small fish leaping out of an edge in a frantic spray; makers the hunters) | spray only where small fish are (the minnow's raw weight in that area ≥ 1); the spook's words "The fry scatter" go (no words) |
| strike (`strike`) | **the strike**: one heavy slap at an edge, then quiet; at night heard more than seen | makers: the pike, the bass, the zander, the perch; a white spray, no gold burst |
| bubbles (`bubbles`) | **carp fizz**: a frothy fizz of mixed bubbles that travels along the bottom and dies quickly | makers: the Weeping Carp; cast at the leading edge, never behind it |
| glow (`glow`) | **retired on Lake 1** | never spawned on the Mossmere under the loop (it stays in code for the flag-off game and later waters); its night role goes to the lantern's silhouettes and the Buoy Lights' shapes (§6.1) |
| — | **pin-pricks** (`pinprick`, new) | a tight patch of tiny bubbles that stays in one gap between pads; makers: the Candlefin Koi (the tench's habit) [S4, S5] |
| — | **bed gas** (`gas`, new) | single big bubbles bursting at irregular intervals in one fixed spot over silt, never travelling; makers: none; no cast rule |
| — | **the mud cloud** (`cloud`, new) | a soft dark plume blooming off the bottom and drifting; makers: the carp, the sucker (as a puff of sand on the inflow's gravel), the Bridgechain Sturgeon at Under the Span [S1, S20] |
| — | **stems** (`stems`, new) | a pad knocked from below, a reed stem twitching, in a short run; makers: the carp and the koi in pads, the carp in reeds [S19] |
| — | **tailing** (a silhouette's behaviour, §6.4) | a tail or a back breaking the film in the shallows, head down: a rooting carp or sucker, catchable as its silhouette |

### 5.3 The tells: where, when, what a cast does, and how the water answers

| tell | areas | hours (weight: late day / dusk / night) | cast rule | obeyed: the water's answer · the bite |
|---|---|---|---|---|
| rise, sip (and roll) | margin, reeds, pads, lane, open, the Lily Maze (roll: margin, pads, open, dusk only) | 3 / 3.2 / 1.6 (night: the ring catches the sky's sheen) | within 2.5 m of the last ring, ≤ 3 s after it (built) | it rises once more beside the float · its fish takes with `takeChance(1, grade)`; wait ×0.5 |
| rise, splash | stones, reeds, pads, inflow, outflow | (shares the rise's weight by its makers) | within 3 m, ≤ 2 s | a second slap by the float · as the sip |
| swirl | reeds, pads, stones, drop-off, deep, the places | 1.3 / 1.6 / 1.1 | just beyond it and to the side it turned toward: within 3 m, ≤ 8 s (built) | a bow wave lifts toward the float · its Prize+ fish takes with `takeChance(0.6, grade)`; wait ×0.65 |
| nervous water | margin, reeds, pads, lane, open | 1.2 / 1.4 / 0.8 | at its edge, ≤ 10 s; into its middle it goes flat (a spook) | the ruffle drifts over the float · its makers ×3; wait ×0.65 |
| fry spraying | margin, reeds, pads, lane, open, inflow, outflow, Under the Span (only where the minnow's raw weight ≥ 1) | 1.8 / 1.4 / 0.4 | at the edge the fry burst from (0.55–1.6 m outside the patch, built); the centre spooks it | the fry spray again past the float · its makers ×3, favour +0.3; wait ×0.65 |
| strike | reeds, pads, stones, drop-off, outflow, Under the Span | 1 / 1.2 / 0.8 | within 4 m, ≤ 10 s (built) | a bow wave toward the float · its makers ×3, favour +0.6; wait ×0.65 |
| carp fizz | margin, reeds, pads, lane, open, the Lily Maze | 1.6 / 1.2 / 0.6 | within 2 m of the trail's head; behind the head nothing | the trail turns onto the float and fizzes there · the carp ×3, favour +0.2; wait ×0.65 |
| pin-pricks | pads, the Lily Maze | 1.2 / 1.4 / 0 | within 1.5 m of the patch's centre | the pin-pricks thicken round the float · the koi ×3, favour +0.2; wait ×0.65 |
| mud cloud | margin, open, inflow, Under the Span | 1.2 / 1 / 0 | within 2 m of its freshest edge, ≤ 15 s after it blooms; into its middle spooks it | a fresh puff blooms beside the float · its makers ×3, favour +0.2; wait ×0.65 |
| stems | pads, reeds, the Lily Maze | 1 / 1.2 / 0.3 (night: a rustle in the lantern's light) | within 2.5 m of the moving stems' edge, ≤ 8 s; into the middle of the bed spooks it | the stems by the float knock · its makers ×3; wait ×0.65 |
| bed gas | margin, open, deep | 0.5 / 0.4 / 0.3 | — | nothing: the cast rolls the pool as anywhere (that is how the player learns it lies) |

"×3" is the built sign tilt, now on the tell's makers (species ids, `rule.makers`, `rule.tilt` 3) instead of a family, and
only on makers that take the hook (§4 step 8). Each answer is drawn as water (white froth, a lifted bow wave, a ring of the
water's own ripple, a puff of mud), lasts 1–2 s, and plays only when the cast met the rule. Caps alive at once: rise 3,
swirl 2, nervous (both forms) 2, strike 1, fizz 2, pin-pricks 2, cloud 2, stems 2, gas 1; in all 2–4 alive by day and dusk,
2–3 at night, at most 6 (built), plus the silhouettes (§6.3).

### 5.4 The water's face: what the lake shows all evening

| read | what the player sees and hears | built by | its area |
|---|---|---|---|
| **the drop-off's shade** | at the Bell Pool's rim the pale water ends in ink along a soft line; along the shelf the margins read paler than the mid water | WC-3, the water shader's depth tint sharpened at the rim and the lip (a smoothstep on depth; 0 calls) | drop-off |
| **the inflow's seam** | a thread of foam running west from the Sluice Veil's spill, cleaner water over a pale gravel fan; a trickle on the east shore; with the re-dress on, the Veil itself | WC-3: foam and fan masks baked into spare channels of the existing depth texture (0 calls, no new sampler); the sound | inflow |
| **the outflow's pull** | foam threads slowly converging on the Moss Sluice, the water sliding | WC-3, the same baked masks (0 calls) | outflow |
| **the wind lane** | by day and dusk a smooth slick strip across the ripple, a scum line along its downwind edge; it lies along a different line each evening | WC-3, four water-shader uniforms from `laneFor(evening)` (0 calls) | lane |
| **reed beds** | four beds of reeds along the shore, thicker reeds round the rock islands; they twitch when the stems tell plays | WC-3, merged into the `fine` static (0 calls), a twitch term in its own material | reeds |
| **lily beds** | four beds of notched pads in the margins | WC-3, 12–16 pads a bed (8 on low) in the pads' InstancedMesh (same call), bobbed in the shader only | pads |
| **the heron** | a heron standing still at a reed edge or in the margins where small fish are, now and then stabbing; it lifts off with a croak if the raft comes within 8 m and lands again elsewhere; gone at dark | WC-3, a small merged mesh (+1 call on high and medium; none on low), built only if the re-measured budget allows (§10) | it stands only in a margin or reed spot whose minnow weight this phase is in the top third; it changes no odd |
| **stone and timber** | the piers, pylons, statues, docks, the barge's hull, the Gatehouse's wall, the Stair Isle's steps, Root Isle's roots: already built | — | stones |

### 5.5 Honest spawning (WC-2)

A sign is placed as built (a water point 6 m to cast range + 15 m from the raft, depth ≥ 0.2, ≥ 7 m apart, never in mist,
quiet water or the legend's pool), then:

```
area  = areaAt(point)                       (a place's id if inside an owned, lifted place)
pool  = who is there at that point and phase (loopPool(bait, phase, place, {area, hook: false}); §4 steps 3–5)
for each kind k allowed in that area (§5.3) and phase:  P(k) ∝ hourWeight(k, phase) × Σ share of k's makers in pool
       (bed gas: ∝ its weight alone; it needs no maker)
no kind possible → try another point (at most 4 tries a spawn)
its fish (rise, swirl): drawn from k's makers in that pool by their weights, never a giant (built pre-roll, `prerollAt`)
```

So a reed line at dusk throws fry spraying and strikes, the inflow mud puffs and splashy rises, the deep middle little but a
swirl now and then: **the pool's middle reads blank**, as the research says. The tells show who lives there, whatever is on
the hook: a pike's strike shows on a reed line even when the player has a worm on, and the worm still does not bring it.

### 5.6 Night

Night is read by ear and by the lantern: sips catching the sky's sheen, a slap in the dark, a swirl, the inflow's trickle,
stems rustling, and silhouettes only where the lantern's light falls (§6.1): crayfish shapes on the stones, a carp nosing the
margin, a perch hanging by a pier; at the Buoy Lights, a long shape crossing a drowned lamp.

### 5.7 Glitter retired on Lake 1 (under the loop; the flag-off game unchanged)

| the glitter | what replaces it | lane |
|---|---|---|
| the glow sign (a fish-shaped light with a comet wake) | the lantern's silhouettes; shapes crossing a drowned lamp at the Buoy Lights | WC-2 |
| gold droplets in rise and strike bursts drawn by the signs | water-white spray | WC-2 |
| gold droplets in `water.js`'s own splashes (`slapDrops`, the Glowtide's `GLOW_GOLD`) | water-white | WC-3 |
| the gold pulse when a cast lands in a pre-rolled sign | nothing (the water's answer of §5.3 when the rule is met) | WC-2 |
| **the two orange and gold rings at every bite** (`bite()`'s `fx.pulse` 0xff8a5a and 0xffc27a) | one water-white ripple (the float's own) | WC-2 |
| the gold double-dip tell before a real bite | the same double dip, a pale water ring | WC-2 |
| **Ashwick's comeback's ember** on the float (`fx.pulse` 0xd0643a) and its ember hiss | nothing: the comeback is a surprise (§7) | WC-2 (the pulse), WC-3 (the hiss in `audio.js`) |
| the Glowtide's gold glints on night wakes and ripples | moonlit and lantern-lit water only | WC-3 |
| the legend pool's low gold glimmer | the drowned bell (built decal) and a toll from below as she takes (the roster's sign, a sound) | WC-2 (the glimmer), WC-3 (the toll) |
| the Lily Maze's static candle-amber glow-buds | a koi's own candle fins, faint and warm on its silhouette at dusk (the Candlefin Koi's trait; §6.2) | WC-3 retires the buds, WC-2 draws the fins |
| the play's boss-phase toast (`{name}: {phase}`) if it fires on a trip | nothing on a trip (it would name the hooked fish) | WC-2 |

**The hue check's scope** (WC-2's and WC-3's gates): the water from the cast to the bite (the cast, the wait, the tells, the
silhouettes, the bite) has no gold, orange or lilac mark; a night frame's gold count is at or below the dressing-only figure
(the Buoy Lights' drowned lamps, the barge's and the raft's lights). From the strike on (the perfect strike's warm flash, the
leap reveal, the ceremony, the card) the play's and the show's own palette stands: that is the catch, not the water.

Kept, because they are the lore and not a tell: the Buoy Lights' drowned lamps (the place's dressing), a giant's dark back
turning in the mist, the gold ★ and gold seal on a giant's card after the catch (UI, never on the water).

---

## 6. Silhouettes (C)

### 6.1 Where and when a fish can be seen

- **Clear, calm, shallow water**: depth < 0.45 in the margins, the lily beds' gaps, the inflow's gravel fan, shallow stone
  and timber, a reed line's outer edge, and the Lily Maze's shallow half. **Never** in the deep, open water, the drop-off,
  a wind lane or Under the Span: there the bed is out of sight and the player reads the surface instead [S34, S19].
- **By day and dusk**, fainter at dusk. **At night only where the lantern's light falls** (revision 2): a shape's opacity is
  its day opacity × the lantern's intensity on the water at that point (the raft's light: 8 m, Stub ×1.5, the Lantern part
  +15% a level, with the light's own smooth falloff, no step), and a new one spawns only where that intensity is ≥ 0.25; so
  shapes fade in and out with the light and no edge or circle ever shows. At the Buoy Lights a shape may cross a drowned
  lamp's glow (a darker shape over a pale light, any depth there).
- Never in mist, never in quiet water (no new one; those alive drift away), and each keeps its own distance off the raft,
  **3–5 m by fish** (a small fish nearer, a big one farther, with a little jitter), so the clear water round the raft has no
  crisp edge either.

### 6.2 Which fish, and how big

| body outline | fish | how it shows |
|---|---|---|
| deep-bodied | Weeping Carp, Candlefin Koi, Rustfin Sucker | slow, broad; roots and tails in water < 0.3 (a tailing tell and a mud cloud where it digs); the koi's candle fins a faint warm edge at dusk |
| torpedo | Mossback Perch, Overbold Bass, Likely Chub, Milkeye Perch (night, lantern only) | patrols edges, turns sharply; the perch in twos and threes by a pier |
| long | Reedjaw Pike | lies still at a reed or pad edge for long stretches, then darts a few metres and stops |
| small, a shoal | Dusk Minnow, Lampsipper (night) | 3–5 small shapes wheeling together (one silhouette) |
| claw | Gutter Crayfish | at night only, in the lantern's light, a small dark shape on the stones |

Never a giant, the legend, the Bridgechain Sturgeon or the Kissmark Trout (they hold too deep), and never the Gloam Eel (a
bait-only fish is never in the who-is-there pick; its outline is after the MVP, §13). **Each silhouette is one real fish,
pre-rolled**: its species from the who-is-there pool at its point (§5.5's rule, weighted ×1.5 for deep-bodied and long
shapes, which show better), its size score z rolled as a bite there would roll it (the place's and the evening's favour, no
tackle), never above that water's class cap. **It is drawn at the fish's true length** (`data.sizeLength(species, z)`) and
in proportion (its outline's width by body type), softer and less distinct the deeper it is, never smaller. This reverses,
for silhouettes only, DESIGN §25.0.2b's "length can no longer name a species" and §25.6.10's `presentLength` (by the user's
word: "The silhouette should be proportionate to the size of the fish"). **A shape and a length tell body and heft, as real
water does; no word, card, colour or log names the fish.** (The long outline is only ever a pike and the claw only ever a
crayfish: an angler knows a pike's shape, and so will the player.)

### 6.3 How many, how often, how far

At most **4 alive on high and medium, 3 on low** (a shoal counts one); a new one every 12–30 s while fewer are alive and a
visible spot is in reach; each lives 40–90 s, then sinks out of sight (its shape fades with depth). **Its distance from the
raft scales with its length** (revision 2), so every shape is drawn big enough to read: under 25 cm, 6–12 m; 25–60 cm, 8–20
m; over 60 cm, 10–28 m (by day and dusk; at night inside the lantern's light, §6.1). They share the sign budget's spirit: a
few, never a crowd.

**Revision 3 (16 Nov 2026; the user's word, the lead's call, over the bands above).** Every silhouette is spawned where its
**true length reads through the live camera**: drawn at least about **24 px on a phone, 30 px on a desktop**, broadside as it is
first seen (`fishing-sight.js` `projectedLength`, `readableSpot`, through the camera's own matrices). The fish is rolled at a point
of visible water in the open part of the frame, then placed in that same water where it reads: a small fish near, on the camera's
side of the raft (never inside its own 3–5 m), a big one anywhere in view, as it reads farther; never behind a rock island, the
shore's boulders or the raft and its Wick (`sightBlocked`), and it keeps to the open frame as it swims (it turns back at the frame's
edge as at its water's). It is **never drawn bigger than the fish**: where the camera cannot draw that length at the mark anywhere in
view, it goes where it draws biggest, and under **0.65 of the mark** it is not seen at all on that screen (the pick rolls again), as a
real angler does not make out a hand-long perch at that range. At night the lantern's stronger light is tried first. With no camera
(node, a headless page) the bands become a fallback by length: under 30 cm 4.5–8 m, under 60 cm 5–11 m, under 1 m 6–15 m, bigger
7–20 m, leaning to the camera's side. The play camera sets the limit: at the sail framing (the one the player looks for fish under)
a 30 cm perch draws at most about 21 px at 1280x720, 16 at 960x540, 11 on a 390x844 phone and 9 on a 358x664 one; a fish reaches
the mark there only from about 44, 58, 67 and 84 cm, and is seen at all from 28, 38, 44 and 54 cm (with the line out, the fish
framing, from 26, 35, 46 and 57 cm to the mark). `tools/tests/fishing-sight-read.test.mjs` prints the table.
**How it is drawn (the same revision):** a darker, near-opaque core that softens to its edge, darkest down the back as a fish seen
from above is; the tail's fork and the pectoral and pelvic fins held to about a pixel so they survive small; its shadow on the bed
offset and fainter; a faint pale push of water just ahead of the head when it moves (a short arc, never closed). The play camera's low
angle would press a shape lying on the bed nearly flat, so the footprint is eased out along the line of sight by (1 / sin of the
view's angle)^0.75, at most 2× (`fishing-fx.js` SIGN_VS; `lookStretch`): the eye looking down into clear water. Across the view its
length is untouched; end on it never draws longer than it would across. No outline glow, no rim, no glitter, no ring. The float's
resting ripple on the Mossmere under the loop is the water's cool white and quieter (`actors.js`, `view.waterWhite`); a bite's red
cue is unchanged.

**Revision 4 (16 Nov 2026, the review of revision 3: on a phone small and medium fish were never shown, and the shown ones drew under
the mark).** The camera, not the spawn rule, set that limit: the sail framing stands 15 m off the raft, and a phone held upright widens
it (fov + 22°, dist × 1.38), so a 30 cm perch could draw 11 px at best on 390x844 and 9 on 358x664. So **the watch**
(`render-camera.js` `WATCH`, `portraitFit`; `render.js` `updateWatch`): on the Mossmere under the loop, once the raft has been at rest
0.8 s, the lens eases in (about 1.2 s; out in about 0.4 s as soon as the raft moves, held while a cast is charged) to the angler's
own look over the near water, as one stands still and peers into the shallows: on a landscape screen 10.5 m off at 24°, fov 42° (in
place of 15 m, fov 52°); on a phone held upright 11 m off at 28°, fov 46° (in place of its widened 20.7 m at 31°, fov 74°); with the
line out a phone's fish framing softens its widening (× 1.06, + 8°; the float stays framed), a landscape one is unchanged. The pose
is a balance measured on the real Mossmere (`fishing-wc2.test.mjs`, the watch section): nearer still and a big fish finds no water
in view past its own 4–5 m off the raft; farther and a small one draws under the floor. At rest, in the watch, **every Lake 1
silhouette species is seen on both phones and at 1280x720**: its biggest draws at about the mark or past it, its smallest at least at
the floor (the 16 cm crayfish and the 17 cm minnow shoal about 17–24 px on a phone, as an angler makes out a hand-long fish at a few
metres and no farther). One exception, by the camera's reach: at 960x540 (a 30 px mark) those two at their very smallest draw at most
15–17 px and are not shown there; from about 18 cm they are. While sailing the old framing holds, and the rule still places a shape
only where it reads. `fishing-sight-read.test.mjs` prints the table for the sail, watch, fish and fish-at-rest framings and holds the
watch to this; `fishing-wc2.test.mjs` places a Keeper carp, a Keeper perch and a pike by the game's rule at five raft spots on all four
screens and checks each whole shape.
The open frame on a phone keeps clear of the thumb: down to 0.72 of the height on the left (the touch stick's ring), to 0.87 on the
right, above the HOME band (`READ.framePortrait.low`). **No part of a shape behind a post:** the sight test runs on its head, its tail
and its shadow, not its centre alone (`shapePoints`, `shapeBlocked`), and a shape keeps its drawn half-length and 0.5 m clear of dock
posts, pillars and moored hulls as it spawns and swims. **At the Buoy Lights by night** a shape is placed through the same rule,
broadside, in a lamp's light but its drawn half-length and 0.6 m off the lamp, never under its flare. A shape in view keeps to the
frame as it swims (it turns back at the frame's edge). The push of water at the head fades out where it would span under about 4–8 px
(it would close into a pale bead, a glint), and on the Mossmere the nervous water's fry hop as dark flicks with no landing rings, no
specks and a quieter, broken rim (no glitter on the water).

### 6.4 How they move

Steered like a sign's travel (`fishing-signs.js` `travel`: a slowly turning heading, leashed), with a body-type style:

| outline | speed | habits |
|---|---|---|
| deep-bodied | 0.25–0.45 m/s | cruises a lazy line, stops 4–10 s to root (in water < 0.3 its tail breaks the film: tailing, with a mud cloud), turns back along the same route (cruisers patrol [S39]) |
| torpedo | 0.4–0.8 m/s | patrols an edge, turns sharply, holds a few seconds by a pier |
| long | 0 (70% of the time), darts 1.5 m/s for 1–2 s | holds at an edge, faces out |
| shoal | 0.5 m/s | wheels; the shapes keep 0.3–0.6 m apart |
| claw | 0.1 m/s | creeps, stops |

Each keeps to its area (turns back at the edge), keeps 1 m off islands and pillars, and keeps its 3–5 m off the raft. Its
shadow falls on the pale shallow bed, offset by the light (the low sun at late day, the sky at dusk, the lantern at night)
and by depth: closer and crisper in shallow water, always fainter and blurrier than the fish, so it never reads as a second
fish.

### 6.5 Spooking

- **A cast that lands on it** (within 0.6 m + half its length of its body), or **the raft coming within its distance**
  (3–5 m), or a splash within 2 m of a still fish: it bolts. A short V-wake and a swirl on the surface (water's tagged wake,
  as the boil's), 1.2 s, then it fades into depth. No new silhouette within 10 m for 30 s: **the spot goes quiet** [S31,
  S44]. The cast's own bite rolls the pool as anywhere, its wait ×1.5.
- A cast behind it, or wide of it, is ignored.

### 6.6 The take

- **A moving fish**: the bob lands **ahead of it on its line**: from 1 m + 1.6 m × its speed (m/s) to 3 m + 2.5 m × its
  speed along its heading, no more than 1.2 m to either side, and not on it [S39]. **A still or rooting fish**: 0.8–2 m from
  its head, beside it, never on it or on its tail.
- After the bob settles (0.5–1.5 s) the fish turns to the bait and swims to it, visibly. It takes with
  **`takeChance(0.45, grade)`**: 45% on a hook it takes, 55% on one it likes, 65% on its right bait, **1% on one it won't
  take**. If it takes: the bite is **that fish**, its species and z (the built pre-roll path, `S.prerollSp`, `S.prerollZ`),
  the wait ×0.3, the float's tell as built, then the strike. If not: it noses the bait and turns slowly away (no spook);
  the cast keeps its pool, **without that species if it won't take the hook** (§3.6).
- It spends a good bite like any bite; Taper's first bite refuses a common one (built pre-roll rule); Ashwick's comeback
  comes first (§4 step 1).

### 6.7 Hooked, and lost

The hooked fish's shape under the water keeps the silhouette's outline and true length through the play ("a fish you saw
stays the size you saw"); a fish hooked any other way keeps the built night-ink proxy at its class length. If it gets away,
the shape bolts and sinks, big or small, and nothing names it (§7).

### 6.8 How they are drawn (performance)

In the sign instance buffer of `fishing-fx.js`: `MAX_SIGNS` 10 → **20**; **one instance per silhouette** (revision 2): the
fish, its shadow and a shoal's 3–5 shapes are drawn inside one quad's SDF, new outline branches beside the shader's built
`fishSdf` (there is no sign atlas: `SIGN_FS` is procedural); **0 new draw calls**; four entities stepped a frame on the CPU.
The flag-off `spot-fish` mesh stays hidden in sign mode (built).

### 6.9 What they never do

Never a drawn ring, an outline glow, a marker, a reticle or a highlight round a silhouette; the lead window is invisible; no
word; no percentage. A silhouette is a fish in the water, nothing more.

---

## 7. The lost fish (D)

### 7.1 What the player gets

The line goes slack and the float pops up and settles; a splash and a wake sized by the fish (the hooked shape's length);
the cause's sound (a snap, a thrown hook's flick, the slurp of a fish pulling free); for a Trophy or bigger the low "got
away" sting (built, by class); the shape bolts and fades. **No note, no toast, no card, no name, no species art, no class
word or glyph, no weight, no size word, no place line, no cause line, no hint, no link, no mark on the Chart.** The sound and
the water tell heft, as a real line does: something heavy or light went; that is all.

### 7.2 Every place that told, and what it does now (on a trip, and on the Chart under the loop; the flag-off game unchanged)

| where (code) | today | now | lane |
|---|---|---|---|
| the got-away note (`ui-af.js` `gotAwayNote`; `ui-hud-v3.js` `showGotAway`, the queue) | a toast (Small–Prize) or a card (Trophy+, legends): the species, "{a} {class}, near {weight}", the cause, "It's still out there, {place}", a tackle hint, "Odds in your log" | **never shown on a trip** (`showGotAway` returns at once; the queue never fills) | WC-3 |
| the play's class stamp (`ui-hud-v3.js` `estimateClass` / `paintPlay`) | a seal and a class word during the play | **none on a trip** | WC-3 |
| the bite's tell word (`ui-hud-v3.js`, the first three of each class: "Prize?") | a class word at the float | **none on a trip** | WC-3 |
| the bite's tell glyph (`ui-hud-v3.js` `TELL_SVG[id]`, one picture per class: doublePop, plunge, dragUnder, flatSlide, dome) | a pictogram beside the float naming the class's dip | **one neutral glyph on a trip** (`plunge`) for every bite; the float's own dip in the water keeps its class's weight and rhythm (the water's heft, as a real float's) | WC-3 |
| the Chart's Marked ripple (`chart-draw.js`, from `ui-loop.js` `chartModel`'s `marked`) | an ink ripple beside the place whose giant got away (each place has one giant: it names it) | **never drawn** (`chartModel` passes `marked: false` under the loop; the save keeps the mark) | WC-3 |
| the bell's wound nicks (`chart-draw.js` `bell(wounds)`, from `chartModel`'s `wounds`) | a nick in the drowned bell for each time the Matriarch got away | **never drawn** (`wounds: 0` under the loop; the save keeps the count and its Hold) | WC-3 |
| Ashwick's comeback on the float (`fishing.js` the float's settle, `fx.pulse` 0xd0643a; `audio.js` `ember_hiss` on `fishing:comeback`) | an ember glow and a hiss: "the fish you lost is back" | **nothing** on the Mossmere under the loop: the returning fish is a surprise (the event still fires for progression) | WC-2 (the pulse), WC-3 (the hiss) |
| the play's boss-phase toast (`fishing.js` `emit('toast', '{name}: {phase}')`) | names the hooked fish if a plan has phases | **none on a trip** | WC-2 |
| the Journal (`progression-af.js` `onEscaped`) | Glimpsed page (`seen`), the Got-away list (last 5), `entry.escape`, the Elder Log's generated name, `m.lastAway` (the gear log's pin), `run.flags.gotAway`, `journal:seen` | on a trip: **none of these**; the catalogue's silhouette stays "· · ·"; the Got-away list is not drawn under the loop | WC-3 |
| the logs (`ui-af.js` `oddsView`) | "Marked" lines naming a lost fish's class and weight; the legend's "Wounded twice: +12" | **no Marked line and no wound line** under the loop; the odds cells stay the true odds | WC-3 |
| the loop's ledger (`progression-loop.js` `onEscaped`) | marks a giant lost at its place; stores Ashwick's comeback | **unchanged**, silent | — |
| audio (`audio.js`, `audio-af.js`) | the cause's sound; the sting for Trophy+, Ancient and legends | **unchanged** but the ember hiss (it is the water's voice, not a name) | — |
| `fishing.js` `sendGotAway` (fish:escaped) | the species, class, z, length, place, Marked, legendary | **unchanged on the bus** (CONTRACT §13.5): progression needs it; no screen may read it on a trip (§9.4's tests) | — |
| the HUD at the hook (`view.estimate`) | used by the stamp | unused on a trip | WC-3 |

### 7.3 What still happens, silently

- A giant lost at its place becomes a **Marked Fish** (+6 Hold on its next hook, once), as built; no mark on the Chart.
- The legend's **wound** (+6, to +18, kept across trips), as built; no nick on the bell.
- **Ashwick's comeback**: the next bite at that water whose hook it takes is the same fish, tired (+4 Hold), once; nothing
  on the water or in the sound says so; the player may guess, and the gear log's Hold line (a log) may name Ashwick's +4, as
  built.
- The lost fish's good bite stays spent.

### 7.4 Rulings this reverses

SPEC §3.5's "when lost: the got-away note names it and its rough size", §3.6's "its note names it", §11's "The got-away note:
unchanged"; DESIGN §25.0 A4 ("Yes, after it's gone") and §25.6.7, under the loop; `WICKS.md` §2.5's "How it shows" (the ember
glow and hiss, and "the got-away note already named it") on the Mossmere under the loop. The user's newer word wins.

---

## 8. Murk's prices (E)

### 8.1 The rule

```
Murk's price = loopCost(base) = nice(base × LOOP.cost.factor)          LOOP.cost = { factor: 3, consumables: 1 }
  base: the price tables of SPEC §4.2–§4.8 and M1 §2.5 as they stand (hold, tackle, maps, lures, raft, home, looks; after M1, tanks)
  a consumable (a tin; a legend's bait): nice(base × LOOP.cost.consumables) = its base
  nice(x): to 5 under 100, to 10 under 1,000, to 50 under 10,000, to 100 above
  applied ONCE, where a price is made:
    mapCards: each place card and an unsealed lake card (the Chart's mist blots and the shelf's map cards read it)
    the end of progression-loop's shelfItems: every other card of every tab (tackle, hold, LANE 4's gear, 5B-HOME's home cards),
      skipping the cards that came from mapCards (tab 'maps'), consumables and sealed cards
  buy() charges the card's price, never a base table
  a debug override for old scenarios: globalThis.GW_LOOP_COST (set from ?cost=N where the page reads ?redress) replaces the factor
```

`LOOP.cost` is a new key beside `LOOP.priceFactor` (which multiplies what fish and finds *sell* for and stays 1). One key, one
helper (`data.loopCost(base, {consumable})`), read by the game and the sim alike.

**Not scaled** (income): a fish's clams, an order's double, the Wick's firsts, a find's clams. **The legend's pay stays her
crown map's price, as Murk asks it**: 1,500 on her first landing, 600 after (SPEC §4.6's rule; the ratio to her map is
unchanged). **The tins stay 10 and the Heartmoss Ball 60**: a consumable is priced by what it earns; at ×3 a tin would earn
about 1.6 times its price, at ×4 about 1.2, and the user's own next words ask that bait matter. One key (`consumables`) flips
it if the lead or the user wants them dearer.

### 8.2 The Mossmere's shelf at ×3

| item | base | Murk asks |
|---|---|---|
| Hold 4 · 5 · 6 | 30 · 120 · 450 | **90 · 360 · 1,350** |
| Rod, Line, Reel T1 · T2 (each) | 50 · 300 | **150 · 900** |
| the Lily Maze · Under the Span · the Buoy Lights · the Bell Pool | 60 · 150 · 260 · 500 | **180 · 450 · 780 · 1,500** |
| Feather Fly · Glimmer Spoon · Bone Jig · Harbour-Bell Spinner | 50 · 90 · 110 · 180 | **150 · 270 · 330 · 540** |
| Oars I · II · Keel I · II · Lantern I · II | 60 · 300 · 100 · 600 · 100 · 500 | **180 · 900 · 300 · 1,800 · 300 · 1,500** |
| Murk's Order Board I · II | 70 · 400 | **210 · 1,200** |
| Bait Bed I · II · the Long Wall, wing I · Barge lights I | 120 · 700 · 250 · 200 | **360 · 2,100 · 750 · 600** |
| Slate Cloak Dye · Oxblood Pennant · Amber Lantern Glass | 300 · 400 · 600 | **900 · 1,200 · 1,800** |
| the 32 permanent items | 7,750 | **23,250** |
| a tin of Mire Worms or Lumen Moss · the Heartmoss Ball | 10 · 60 | 10 · 60 (consumables) |

The goal line reads "Next: Hold 4 · 90" (SPEC §8.3's form). Sporewood's sealed card shows no price, as built.

### 8.3 The new pacing targets (M1, `clams.mjs --shipped=mossmere --step=5`)

Three players are measured (revision 2): **the blind caster** (the no-passive pacing player, landing in areas by their
share), **the reader** (the same player casting in the best area for its kit and phase, obeyed tells' waits ×0.65 on 25% of
its casts, *est.* of §5.3's cadence) and **the stalker-reader** (the reader who also leads silhouettes, §9.2's model).

| check | today's target | the new target | measured *est.* at ×3 (×4), today's tree | kind |
|---|---|---|---|---|
| no purchase in the first two trips | — | the first purchase on trip 3 to 5, on an average evening: for the pacing player and the natural player's median fresh save keeping everything (a lucky evening may buy Hold 4 sooner: SPEC §2.1's lucky +193) | trip 3, 0.13 h (trip 4, 0.17 h) | **fail** |
| bought by 10 min · by 1 h | 2–5 · 11–19 (SPEC §4.9) | **0–1 · 4–9** (the blind caster) | 1 · 7 (0 · 5) | fail |
| the empty shelf | 1.5–4 h | **4.5–7.5 h for each of the blind caster, the reader and the stalker-reader** | blind **5.61 h, 91 trips** (7.49 h, 121) | fail |
| each Wick's empty shelf | ±10% of the five-Wick mean | unchanged | — | fail |
| the longest wait for one purchase | ≤ 30 min | **≤ 40 min** | 26 min, Bait Bed II (30 min, Keel II) | fail |
| the first giant comes home | hour 0.4–3 | **hour 0.5–3.5** | 2.2 (2.7) | fail |
| trips, the visit home included | ≤ 6 min | unchanged | 4.3 | fail |
| every place map | ≥ +5% a minute | unchanged (a price does not change a gain) | +22% / +28% / +10% | fail |
| every hold step and raft part pays its way | +3% a minute, or ≤ 2 trips' income | +3% a minute, or **≤ 2 × factor trips' income** (6 at ×3) | Oars I: +1.9%, 2.2 trips (passes the new rule, fails the old) | warn at steps 1–4, fail at 5 |
| the Mossmere's list | p95 ≤ 60, p99 ≤ 75 min | unchanged; the list player fishes Cut Strip while a hunter on its list is missing (§9.2) | 29, 34 (before the hook table) | fail |
| **the user's rule** | — | for every pool and cast type the game can draw (each area and place, phase, the 12 hooks, no Wick and Taper, Taper's first bite or not, the rarity bonus 0 and 0.5, each tell's makers tilt, each pre-roll source with each fish pre-rolled, the comeback), every grade-0 fish ≤ 1.00% of that cast, exactly, from `castOdds` | 0.990% before pre-rolls (§3.8); exactly 1.00% for a pre-rolled stray | **fail** |
| every pool bites | — | `S > 0` in every pool above | smallest S 14.6 | fail |
| every fish can be caught | — | every Mossmere fish has a hook the player can fit by step 5 (the bare hook, Cut Strip, or an item on M1's shelf) whose grade is ≥ 1 | yes (the table) | fail |
| the areas add nothing | — | before the hook (§4 steps 3–5), the blind caster's open-water mix within ±0.5 points of the tilted target, every fish and phase | 0.000 (the fit) | fail |
| reading pays | — | the reader earns +5% to +40% a minute over the blind caster at the 1 h and 2 h marks | — | report, warn outside |
| stalking stays fair | — | the stalker-reader earns at most +40% a minute over the blind caster at the 1 h and 2 h marks | — | report, warn above |
| a tin is worth fitting (Mire Worms, on the pacing kit) | +3–25% a minute, ≥ 1.3× its price (SPEC §4.5) | unchanged, with the hook table | — | fail |
| finds (`--step=5c` against `--finds=off`, 2,000 runs), if LANE 5C lands its finds model | p50 1.5–4 h and ±10%; p10 ≥ 1.5 h | **p50 4.5–7.5 h and ±10%; p10 ≥ 4 h**; finds' share 8–12% aimed, fail above 15% | — | fail |

*The ×3 and ×4 figures are scratch runs of today's step-5 tree (`--quick`, the price factor added by hand), before the areas,
the hook table and the bare hook's change: who bites changes with them (the bare hook alone gives up the hunters, about a
tenth of a fresh save's bite value, *est.*), so the factor is fitted after the merge (§8.4). At step 2 (the preview's shelf)
×3 gives 3.31 h and 60 trips, where the preview took 1.10 h and 20.*

**What the user did, re-read, and asked** (revision 2). The sim says the preview's shelf took about 20 trips. The user's "2
runs" can be read two ways: two sittings, or two trips out and back (this codebase calls a trip a run: `run:end`,
`run.flags`). If it meant two trips, the game pays roughly ten times what the sim says and ×3 is nowhere near "way higher".
So SPEC §16 question 39 asks the user which they meant, and **the browser tally is a blocking gate** (§8.4): a fresh save's
first two trips, played by the natural rule in the browser, must earn no more than 1.2 × the sim's natural player's first two
trips; if they earn more, the factor is not fitted and the gap goes to the lead.

### 8.4 The proof, and what the integrator re-runs

WC-1 builds the sim's side (§9.2): `price()` and the legend's prize read `D.loopCost` (with `--factor=F` to run before step P
lands), the three players, the new checks of §8.3. **The integrator's step P** (§9.5) applies the price in the game. **Once
every lane and step P are merged, the integrator runs, in this order:**

```
1. the browser tally (blocking): a fresh save's first five trips in the browser, natural rule, printed beside the sim's natural player;
   if trips 1–2 earn more than 1.2 × the sim's, STOP: no fit; the run goes to the lead (the user's "2 runs" may have been two trips)
2. node tools/sim/clams.mjs --shipped=mossmere --step=5            # every §8.3 check, the three players
3. node tools/sim/clams.mjs --shipped=mossmere --step=5 --wicks    # each Wick within ±10%
4. node tools/sim/clams.mjs --shipped=mossmere --step=5c           # if LANE 5C landed its finds model: against --finds=off
5. node tools/sim/clams.mjs --quick                                # the full road, its factor pinned to 1 (§8.5): every check as before
```

If an empty shelf leaves 4.5–7.5 h or a fail check fails, **the knobs, in order**: (1) `LOOP.cost.factor`, in steps of 0.25
within 2.5–4 (the smallest factor whose first purchase is on trip 3 or later and whose three players all land in the band);
(2) only if the stalker-reader's shelf is under 4.5 h at the factor that keeps the blind caster's at or under 7.5 h:
`WATERCRAFT.take.sight` 0.45 → 0.35, then at most one silhouette inside cast range at a time (`WATERCRAFT.sight.inRange` 1);
(3) otherwise, or a factor outside 2.5–4: the lead, with the run. **Never** the hook table's 1% rule, never quiet water (SPEC
§3.3), never a wall (SPEC §3.6), never the areas' weights. Then re-print M1 §6.2's table and SPEC §4.9's M1 view.

### 8.5 The full road (after M1)

Only the Mossmere ships (SPEC decision 39). The full road's pacing run (sim sections 5 and 7) models waters that are not in
the game yet; it **pins the factor to 1** and prints "prices before v8.7 (the Mossmere's factor applies in --shipped)", so
SPEC §4.9's full-road figures stand as a projection. When Sporewood ships, its balancing job re-derives the road with the
proposal of SPEC decision 103: every price ×factor and every water after the Mossmere's value tier ×factor, which keeps the
road after the Mossmere in today's minutes and moves the end by the Mossmere's extra hours (about 46.6 h → 50 h, inside
40–60 h, *est.*).

---

## 9. Tonight's build (F): three lanes and one integration step

### 9.1 The base, the order, and the seams with the four lanes already building

- **The WC base** (revision 2): LANE 4 (`gw-mvp-4`) and LANE 5B-HOME (`gw-mvp-5b-home`) are finished and committed, and they
  are first and second in tonight's merge order anyway. **Before the three WC lanes make their worktrees, the lead merges
  `gw-mvp-4` and then `gw-mvp-5b-home` into `gw-m1-mvp`** (in `.gw-wt/m1-mvp`, the lead's worktree; no lane ever edits it).
  Each lane then makes its worktree from that merge:
  `git -C /home/user/Study-App worktree add -b gw-mvp-wcN /home/user/Study-App/.gw-wt/mvp-wcN gw-m1-mvp` (N = 1, 2, 3). With
  LANE 4 on the base, its tins, lures, `fit('lure')`, `run.lure`, the Cut Strip button, the gear log and `lurePool` are real,
  and every edit of theirs below is an ordinary edit, not a merge conflict. WC-1 may write `src/watercraft.js` (pure; it
  needs no base) in a scratch file while the lead merges, and commits it as its first commit once its worktree exists.
- **Bring the docs**: each lane copies `WATERCRAFT.md`, `SPEC.md` and `M1.md` from branch `gw-mvp-wc-doc` (this revision's
  commit) into its worktree's `gloomwater/docs/loop/` in its first commit or reads them there.
- **WC-1's first commit** is `src/watercraft.js` alone with `tools/tests/watercraft.test.mjs`. WC-2 and WC-3 cherry-pick that
  one commit as soon as it lands on `gw-mvp-wc1` and never edit `src/watercraft.js` (they ask WC-1 for changes). Until it
  lands they code against §9.2's signatures with a fallback of area `'open'`, grade 1 and `takeChance(base, 1) = base`.
- **The lead merges**: (LANE 4 → 5B-HOME, before the WC lanes branch) → **5B-TOW → 5C → WC-1 → WC-3 → WC-2 → step P**
  (§9.5) → the runs (§8.4).
- **LANE 4**: owns the items and their cards by id (§3.10). WC-1 replaces its `lurePool` call in `fishing.js` and its seven
  `TEXT_LOOP.shelf` lines for the tins and lures; WC-3 changes `targetsOf` and `holdText` in `progression-af.js` to "the
  fish it suits" and wires **Who bites** into its gear log (`ui-gear.js`); step P passes its cards through `loopCost` in
  `shelfItems`.
- **LANE 5B-HOME**: its home cards' prices pass through `loopCost` at the end of `shelfItems` (step P). WC-3 keeps the reed
  beds, the lily beds and the heron clear of the barge.
- **LANE 5B-TOW** (the opening, the tow): its glide-in path (`LOOP.tow.glideIn`) is one of the validator's clearances (§2.2);
  WC-3's heron line in `main.js` merges beside its hook.
- **LANE 5C** (finds): its snag block in `rollBite` (just after `S.species = sp`) is untouched by WC-1 (§4). **`clams.mjs`
  has one owner tonight, WC-1**; if 5C adds its finds model (`--step=5c`, `--finds=off`) it puts the snag as one branch at the
  top of `trip()`'s bite and touches nothing else there, and WC-1 rebases onto it and moves only the 5c band's numbers (the
  lead tells 5C). Finds' values are income and are never scaled.

### 9.2 Lane WC-1: the roll and its proof (`gw-mvp-wc1`)

**Read**: this document's §2–§4, §6.3 and §8.3; SPEC v8.7 §3.7; CONTRACT §13.5 and §14.

**Builds (MVP).**

1. **`src/watercraft.js`** (new, pure, no three.js, no import of `data.js`; first commit, alone, with its tests):
   - `WATERCRAFT.mossmere`: `geometry` (§2.2's block), `shares` and `factors` (baked, §2.4), `raw` (§2.4's table), `night`
     (the after-dark rows), `tilts`, `hook` ({`table` keyed by fish id then item id, `bare` the bare hook's column; `null`
     where §3.2 says; `mult: [0.1, 1, 1.6, 2.5]`, `cap: 0.01`}), `take` ({`rise: 1`, `swirl: 0.6`, `sight: 0.45`, `stray:
     0.01`}), `waits` ({`rise: 0.5`, `tell: 0.65`, `sightTake: 0.3`, `spook: 1.5`}), `tells` (§5.3: each kind's forms, makers,
     areas, hour weights, caps), `sight` (§6: depth 0.45, counts 4/3, spawn 12–30 s, life 40–90 s, distance bands by length,
     raft distance 3–5 m, lead and still windows, `inRange: null`).
   - `lightOf(phase)`: calm, day, dawn → 'day'; dusk → 'dusk'; gloomtide, night → 'night'. Every entry point normalises.
   - `areaAt(x, z, probe, {lane, arena, hulls})` → an area id, open water only, in §2.2's order. `probe = {depth(x, z),
     fromShore(x, z)}`; in the game from `ctx.world.getDepth` and `ctx.world.getShoreRadius(Math.atan2(z, x)) −
     Math.hypot(x, z)`; the islands, pillars and docks from `arena = D.ZONES[0].arena`; `hulls` from `data.loopMooring`'s
     circles. In node tests the probe is built once from `world-layout.buildLayout(ZONES[0])`.
   - `laneFor(evening)`: seeded, deterministic; a point within 25 m of (0, −5), a heading, the strip 4 × 50 m; `null` at night.
   - `areaShares(probe, opts)` and `fitFactors(D, shares)`: the offline helpers the test uses to recompute and `--bake`.
   - `areaWeight(fishId, area, phase)` (`factors × raw`, night rows; 1 for a fish with no row), `tilt(fishId, phase)`,
     `gradeOf(fishId, {lure, bait})` (§3.3–§3.4; `undefined` for a species with no row: the caller keeps the built family
     rule), `takeChance(base, grade)` (§3.6, revision 2's max), `gradeTargets(itemId)` (§3.7).
   - `hookWeights(list, {area, place, phase, lure, bait, hook = true})` → `[{sp, w, g}]` (§4 steps 4–6).
   - `finishPool(entries, {giant, lure, phase, wickId, D})` → entries (§4 steps 10–11; LANE 4's giants' rule inside).
   - `castOdds(D, {pool, area, phase, lure, bait, wickId, rb, rule, taperFirst, preroll, comeback})` (§4).
   - `bitesTable(D, {lure, bait})` → `[{id, share, bare}]`: each fish's share of the blind open-water bites over an evening
     (the three phases weighted by `LOOP.evening`'s lengths) on that item alone, beside the bare hook's. WC-3 renders it.
2. **`fishing.js`**, only these regions: `castInfo` (stores `S.cast.area` from `areaAt` when the cast's place is null);
   `loopPool` (the options form of §4: `{area, hook}`; no longer calls `lurePool`); `rollSpeciesLoop` (builds `castOdds` with
   the cast's rule, Taper's first-bite flag, the pre-roll and the comeback, draws once with the seeded `rnd`, and sets
   `S.prerollSp`, `S.prerollZ`, `S.prerollTook`, `S.comeback` and `S.taperRule` from the drawn entry); `rollBite`'s species
   path (its pre-roll take and comeback blocks move into `castOdds`; the bait-only gate is kept; the comeback waits on a
   stray; `consumeComeback` only when its entry is drawn); and **the wait lines** (`rule.waitMult` for every obeyed tell, as
   built for the rise; `rule.takeWaitMult` when `S.prerollTook`). The rule object is CONTRACT's (below).
3. **`data.js`**: `LOOP.cost = {factor: 3, consumables: 1}`, `loopCost(base, {consumable})` and `nice()` (exported; read by
   the sim now, applied in the game by step P); `export loopLight` (the built `LOOP_LIGHT` lookup); `TEXT_LOOP.shelf`'s seven
   lines for the tins and lures (§3.9, replacing LANE 4's); `TEXT_LOOP.log` words "Who bites", "Bare hook", "<1%", "and {n}
   you have not met", and the gear line "+{n} Hold on the fish it suits ({m} you have met)." (WC-3 renders them).
4. **`tools/validate-data.mjs`** (its own checks): §2.2's geometry checks; the hook table names only real item and species
   ids, every Lake 1 fish, grades 0–3 or `null` only where §3.2 has it; `S > 0` in every pool of §8.3's list.
5. **`tools/sim/clams.mjs`** (owner tonight):
   - `poolFor(water, place, phase, lure, bait, …, area)` calls `watercraft.js`'s `hookWeights` and `finishPool` in §4's order
     on the sim's records (a thin adapter maps its species records to `{id, rarity, giant}`); `lureAttract`/`lureMatch` no
     longer apply to a species with a hook row; the pull multiplies only fish graded ≥ 1 and its sure bite waits for one.
   - `trip()`: each open-water cast lands in an area: the blind caster by the baked shares; `--readers` the best area for its
     kit and phase (the highest expected clams a bite there), its obeyed-tell waits ×0.65 on 25% of casts; `--stalkers` the
     reader who also leads silhouettes: per cast a silhouette is in range with the chance §6.3's rates give (≤ 4 alive, a new
     one every 12–30 s, 40–90 s life) times its area's visible share (the share of that area's water shallower than 0.45,
     0 in deep, open, drop-off and lane), and when one is, it leads the largest of the 1–2 in range: species from the
     who-is-there pool (×1.5 deep and long; never giants, the legend, the sturgeon, the trout, the eel), z as a bite there,
     `takeChance(0.45, grade)`, wait ×0.3 on a take; else the reader's cast.
   - **Cut Strip**: a free bait whose supply is the trip's own: with `kit.bait = 'cut_strip'` and no strip left, the next
     Small or Keeper landed is let go and cut into `LOOP.cut.strips` (3; a let-go as built, its refund and mercy); each hooked
     bite on a strip spends one; with no strip the cast fishes the bare hook.
   - The pacing player picks its best hook per water, measured, among the bare hook, each owned tin, Cut Strip, each owned
     lure and each lure with each of those baits. The list player fishes Cut Strip while a hunter on its list is missing.
   - `price(id)` and the legend's prize read `D.loopCost`; `--factor=F` overrides `D.LOOP.cost.factor` for a run; the full
     road (sections 5 and 7) pins the factor to 1 and prints "prices before v8.7".
   - The M1 check block: §8.3's rows replace M1's old band, wait, giant-hour and pays-its-way checks; add the user's rule
     (from `castOdds`, the whole list of §8.3), every pool bites, every fish catchable, the areas add nothing, the reader and
     stalker reports, the three players' empty shelves; and the 5c band if 5C's model is present.
   - **T104** extended: the game's pool (`data.placePool` → `hookWeights` → `finishPool`, as `fishing.js` builds it) equals
     `poolFor`'s for every place and area × phase × the 12 hooks (bare, Mire Worms, Lumen Moss, Cut Strip, the Heartmoss Ball,
     the four lures, spoon + worms, fly + moss, jig + strip) × {no Wick, Taper}.
6. **CONTRACT**: a new §14 subsection "Watercraft (the Mossmere)": `areaAt`, `castOdds`, `hookWeights`, `finishPool`,
   `takeChance`, `gradeTargets`, `bitesTable`, `loopCost`, `S.cast.area`, `loopPool`'s options, and the **rule object** (pinned
   now, for WC-2): `{kind, id, inSign, form?, waitMult?, takeWaitMult?, preroll?: {chance}, makers?: string[], tilt?: number,
   favour?, spook?, respond?: string, predators?, bottom?}` (`predators`/`bottom` the flag-off game's family tilt; on the
   Mossmere under the loop `makers` and `tilt` replace them).

**Files it owns**: `src/watercraft.js`, `tools/tests/watercraft.test.mjs`, `tools/sim/clams.mjs`, its checks in
`tools/validate-data.mjs`, and in shared files only: `fishing.js` (`castInfo`, `loopPool`, `rollSpeciesLoop`, `rollBite`'s
species path and its wait lines), `data.js` (`LOOP.cost`, `loopCost`, `nice`, `loopLight`'s export, the words above),
CONTRACT's watercraft subsection.

**Gate (MVP).** Node, `watercraft.test.mjs`: (a) `areaAt` on 24 authored points, each at least 1.5 m inside its area (its
eight neighbours at 1.2 m the same area), two or more per area and one in each place and the mist, gives the expected area
(robust examples: (54, 4) inflow · (0, −43) outflow · (−4, −4) drop-off · (−26, 34) pads · (−30, 21.5) reeds · (24, 34.5)
stones · (0, 10) deep · (0, 56) margin); the baked shares sum to 1 and match §2.1 within ±3 points and a recompute within
±0.2; (b) the fit: the blind pre-hook mix within ±0.5 points of the tilted target for every fish and phase; (c) **the user's
rule**: §8.3's whole list through `castOdds`, every grade-0 fish ≤ 1.00%; a worm everywhere leaves the Reedjaw Pike, the
Thousandcast Pike and the Hullkiss Lamprey ≤ 1%; a bare hook leaves the five hunters ≤ 1%; a spoon leaves the carp, the koi,
the crayfish, the sucker and the minnow ≤ 1%; `S > 0` everywhere; (d) the tip: spoon + worms gives the perch 3, the bass 3,
the chub 2, the pike 3 and the carp a stray; (e) a pre-rolled grade-0 fish's whole-cast probability is exactly 0.01, and
20,000 seeded casts through `fishing.js`'s draw agree with `castOdds` within ±0.3 points; `takeChance` never puts a taker
below its base (a rise's fish 1, 1, 1); (f) the comeback waits on a stray, comes on the next cast with a hook it takes, and is
never also marked; (g) Cut Strip brings each hunter (each ≥ 2% somewhere it lives); (h) T104 extended passes. The existing
suites stay green (`loop-places`, `loop-trip`, `loop-4` with its `lurePool` unit tests). Sim: §8.4's runs 2–5 with
`--factor=3`: the user's rule, every pool bites, every fish catchable, the areas add nothing, the list and T104 pass; the
pacing rows (the first purchase, the marks, the three shelves, the wait, the first giant) print, and are fitted at step P. Browser (one short run, desktop
1280×720 and phone 390×844, `debug.fishSeed`): with worms fitted, 40 casts at a reed edge bring no pike; with the bare hook,
40 casts there bring no pike; with Cut Strip, 40 casts there bring at least one.

### 9.3 Lane WC-2: the tells and the silhouettes (`gw-mvp-wc2`)

**Read**: this document's §4, §5, §6 and §7.2's rows marked WC-2; CONTRACT §13.5 and WC-1's watercraft subsection.

**Builds (MVP).**

1. **`src/fishing-signs.js`**: the kinds `pinprick`, `gas`, `cloud`, `stems` (rules, shows and cast rules of §5.3); the
   forms: `rise` sip and splash (roll is a should), `nervous` ruffle and spray; bed gas as single big bubbles in one spot;
   each cast rule returns the CONTRACT rule object with `makers`, `tilt: 3`, `waitMult` (0.5 rise, 0.65 the others),
   `respond` (the answer of §5.3) and its effect; a spook rule where §5.3 says; `KIND_WEIGHTS` and the allowed areas from
   `WATERCRAFT.mossmere.tells`; `glow` never picked when the loop's water is the Mossmere (kept for the flag-off game); the
   caps of §5.3.
2. **`src/fishing-sight.js`** (new, pure): the silhouettes of §6: `visibleAt` (with the lantern's intensity at night),
   `pickSight` (species from the who-is-there pool, ×1.5 deep and long, the exclusions of §6.2; z as a bite there; length
   `data.sizeLength(species, z)`), the five outlines, `stepSight` (§6.4's motion, leashed to its area, 1 m off islands and
   pillars, its 3–5 m off the raft), `spookTest`, `leadTest` (the moving and still windows), the spawn distance by length
   (§6.3), counts and lifetimes; the take through `watercraft.takeChance(0.45, grade)` (WC-1 applies it in `castOdds`; the
   silhouette hands it a pre-roll `{sp, z, base: 0.45}` and the rule `{preroll: {chance: 0.45}, takeWaitMult: 0.3}`).
3. **`fishing.js`**, only the signs' and silhouettes' regions and these presentational lines: `prerollAt`, `spawnSign`,
   `updateSigns`, the cast's landing hit-test, the nibble tells' colours, the update hook; honest spawning (§5.5, through
   `areaAt` and `loopPool(…, {area, hook: false})`); makers-filtered pre-rolls, never a giant; the silhouettes' spawn, step,
   cast test and hook-up through the built pre-roll path; the obeyed tells' answers (§5.3); the hooked proxy keeps a
   silhouette's outline and length (`view.proxy = {outline, length}`); on the Mossmere under the loop: no gold pulse on
   landing, a pale double-dip, no "The fry scatter" words, **`bite()`'s two orange and gold rings become one water-white
   ripple**, **no ember pulse on Ashwick's comeback**, **no boss-phase toast naming the fish**. The stems tell calls
   `world.stems?.nudge(x, z, k)` (WC-3's; absent, a ripple only).
4. **`src/fishing-fx.js`**: `MAX_SIGNS` 20; the new tells and answers in the sign instance buffer (the fizz's travelling
   froth, the pin-pricks' patch, the cloud's plume, the stems' ripples, the gas's bubbles, the bow wave); the silhouettes as
   one quad each with the fish, its fainter and blurrier shadow and a shoal's shapes in its SDF (new outline branches beside
   `fishSdf`), softened with depth, the koi's faint warm fin edge at dusk; white spray for rise and strike; the legend
   pool's gold glimmer off on the Mossmere under the loop. 0 new draw calls.
5. **`src/water-signs.js`**: no new ids (revision 2): the new marks reuse ids 1–6 (a pin-prick as a small-bucket rise; the
   cloud, the stems and the gas as plain ripples; the bolt and the bow wave as the boil's wake), so `water.js` and
   `water-shader.js` (WC-3's) need no change for them.
6. Tests: `tools/tests/fishing-signs.test.mjs` (extended) and `tools/tests/fishing-sight.test.mjs` (new); CONTRACT §13.5's
   `sign:*` kinds and forms.

**Files it owns**: `src/fishing-signs.js`, `src/fishing-sight.js`, `src/fishing-fx.js`, their tests, and in `fishing.js`
only the regions and lines named above. It reads `src/watercraft.js` and never edits it. It does not edit `water.js` or
`water-shader.js`.

**Gate (MVP).** Node: honest spawning (10,000 spawns per area and phase: a kind appears only where its makers are; fizz
never on the stones; pin-pricks only in pads and the Lily Maze; nothing at night of the cloud or pin-pricks; fry spraying
only where the minnow's raw weight ≥ 1; glow never on Lake 1 under the loop, still on the flag-off build); bed gas never
changes the roll; each cast rule's hit and miss geometry and its `respond`; the makers tilt with F17; silhouettes: never
where depth ≥ 0.45 or in the deep, open, drop-off or lane, never a giant, the legend, the sturgeon, the trout or the eel;
at night opacity follows the lantern's intensity and none spawns under 0.25; distance from the raft within its length's
band and its 3–5 m; true length equals `sizeLength(species, z)`; the lead window, the spook disc, the still fish's
beside-it window; the take rate by grade over 20,000 trials (45 / 55 / 65% and, through `castOdds`, a stray's whole cast
exactly 1%); ≤ 4 alive (≤ 3 low); none in quiet water or mist; ≤ 20 instances, one per silhouette. `clarity-perf --loop`
(desktop and `--mobile`): draw calls unchanged, `cpuMs` within +15% of the step-1 baseline. Browser (one short run,
desktop and phone): at dusk in the margins a carp silhouette cruises with its shadow; a cast a little ahead brings it
(seeded); a cast on it gives a V-wake and the spot goes quiet; a worm cast ahead of a silhouetted pike is nosed and refused;
a cast at the fizz's head turns the fizz onto the float; a Keeper common's shape is readable on the phone at its farthest
distance; a night frame at the Buoy Lights shows a shape crossing a lamp; **no gold on the water from cast to bite** (the
hue report, §5.7's scope); a night look sheet with no visible boundary where the lantern's light ends; no drawn ring round
any silhouette or tell (a look sheet).

### 9.4 Lane WC-3: the water's face, the lost fish and the gear log (`gw-mvp-wc3`)

**Read**: this document's §2.1–§2.2, §3.7, §3.9, §5.4, §5.7 and §7; CONTRACT §13.5.

**Builds (MVP).**

1. **Reeds and pads** (`src/world-art.js`): the four shore reed beds of §2.2 merged into the `fine` static (0 new calls),
   thicker reeds round the rock islands, thinner round the masonry ones; the `fine` static's own material clone with a
   twitch term (up to four twitch points, a uniform array); the four lily beds' pads (12–16 a bed, 8 on low) added to the
   pads' InstancedMesh (same call), left out of the CPU bob loop, bobbed and twitched in the shader only; `world.stems =
   {nudge(x, z, k)}` for WC-2.
2. **The Lily Maze** (`src/world-places.js`): its static candle-amber glow-buds retire under the loop (its pads stay at
   twice the density).
3. **The water's face** (`src/water-shader.js`, `src/water.js`), 0 new calls and no new sampler: the drop-off's shade (a
   smoothstep on depth at the Bell Pool's rim and the shelf's lip, in the depth tint); the inflow's seam and gravel fan and
   the outflow's converging threads as masks baked into spare channels of the existing depth texture (`uDepthTex` RG →
   RGBA, filled in the same few-rows-a-frame bake); the wind lane's slick and scum line from four uniforms set from
   `laneFor(evening)` (day and dusk); **the Glowtide's gold glints and `water.js`'s gold droplets (`slapDrops`, `GLOW_GOLD`)
   water-white on the Mossmere under the loop**. The low tier gets the rim, the seam and the lane; the fan's detail may drop
   there.
4. **The heron** (`src/actors-heron.js`, new, and one line in `main.js`): **built only if `clarity-perf --loop`, re-measured
   on the WC base with LANE 4's raft gear (and LANE 5C's props once merged), leaves at least one world call free on high and
   medium**; else it moves to after the MVP (§13). A small merged low-poly mesh (+1 call on high and medium, none on low);
   stands at a reed or margin spot in the top third for small fish this phase (from `WATERCRAFT`), stabs now and then,
   lifts off with a croak when the raft comes within 8 m and lands elsewhere, leaves at dark; changes no odd; never within
   6 m of the mooring, the tow's glide-in or a place's landmark frame.
5. **Sound** (`src/audio-mossmere.js`, and one line in `src/audio.js`): the inflow's trickle (spatial), the heron's croak
   (with the heron), the stems' rustle, a low bell toll from the Bell Pool's floor as the Matriarch takes, from the built
   synth voices; **the comeback's `ember_hiss` not played on the Mossmere under the loop** (`audio.js`'s `fishing:comeback`
   handler).
6. **The lost fish** (§7.2, on a trip; the flag-off game unchanged): `ui-hud-v3.js` (`showGotAway` returns at once; no class
   stamp in the play; no class word in the bite's tell; **the tell glyph one neutral `plunge` for every bite**);
   `progression-af.js` (`onEscaped` on a trip writes only the legend's wound and the Marked Fish, as built for those);
   `ui-af.js` `oddsView` (no Marked and no wound lines under the loop); `ui-screens.js` (the Got-away list not drawn under
   the loop); **`ui-loop.js` `chartModel`** (`marked: false` and `wounds: 0` under the loop; the save keeps both).
7. **The gear log** (after LANE 4, on the base): `ui-af.js` `bitesBlock(D, rows)` (a pure render of **Who bites** from
   `watercraft.bitesTable`: met fish by name, "<1%" under one, the **Bare hook** column, "and {n} you have not met"), wired
   into LANE 4's gear log for a tin or a lure (`ui-gear.js`, a few lines); `progression-af.js` `targetsOf` and `holdText`
   read `watercraft.gradeTargets(itemId)` on the Mossmere (the Spinner keeps its named fish) and the line names only met
   fish and counts them.
8. Tests: `tools/tests/watercraft-face.test.mjs` and `tools/tests/loop-lost.test.mjs` (both new); CONTRACT §13.5's note
   (fish:escaped on a trip: no screen reads it).

**Files it owns**: `src/world-art.js`, `src/world-places.js`, `src/water-shader.js`, `src/water.js`, `src/actors-heron.js`,
`src/audio-mossmere.js` and the one `audio.js` line, `src/ui-hud-v3.js`, `src/progression-af.js`, `src/ui-screens.js`,
`src/ui-loop.js` (`chartModel`'s two fields), in `src/ui-af.js` `oddsView` and `bitesBlock`, in `src/ui-gear.js` the Who
bites wiring, `main.js`'s one heron line, and their tests. It reads `src/watercraft.js` and never edits it. It does not
edit `fishing.js`.

**Gate (MVP).** Node, `watercraft-face.test.mjs`: the beds and reeds are where §2.2 says and clear of the mooring, the
docks, the lane, the glide-in and the places; `laneFor` is deterministic per evening and lies in deep or open water; the
heron (if built) stands only in margin or reed spots of the top third, lifts at 8 m, is gone at dark. Node,
`loop-lost.test.mjs` (no DOM in node: on the views' outputs and mocks): after a loss on a trip (each class, the legend, a
giant at its place, Ashwick), `showGotAway` is a no-op, `gotAwayNote` is never called, the HUD's tell glyph is `plunge`,
the Journal's `seen`, the Got-away list, the Elder Log and `m.lastAway` are unchanged, `oddsView` has no Marked and no
wound line, `chartModel` gives `marked: false` and `wounds: 0`, and the giant is still marked, the legend wounded and
Ashwick's comeback stored, silently; with the flag off the got-away note still shows. Node, the gear log: `bitesBlock`
names no unmet fish and prints "<1%" for the pike on worms; the Hold line names no unmet fish. `clarity-perf --loop`
(desktop and `--mobile`): world calls ≤ 54 high and ≤ 42 low (the heron +1 on high and medium only), `cpuMs` within +15%.
Browser (one short run, desktop and phone): the rim's shade reads at the Bell Pool; the inflow's seam and fan read at dusk;
the wind lane's slick reads at dusk and lies elsewhere the next evening; reeds twitch on `world.stems.nudge`; the heron
lifts as the raft comes (if built); a forced Trophy loss shows only a slack line, a big splash and the sting, and **a scan
of the page's text after it finds no species name, class word or weight**; the Chart after a forced giant loss and a forced
Matriarch loss draws no ripple and no nick; the gear log's Who bites shows the pike "<1%" on worms; the hue report shows no
gold on the night water.

### 9.5 The integrator's step P (Murk's prices) and checklist (once every lane is merged)

**Step P** (after WC-2 merges; about an hour; the lead or a builder it names):
1. `progression-loop.js`: `mapCards` prices each place card and an unsealed lake card with `D.loopCost(base)`; the end of
   `shelfItems` prices every other non-consumable, non-sealed card with `D.loopCost(base)` once, skipping tab `'maps'`;
   `buy()` is unchanged (it already charges the card's price); the legend's first-landing pay reads `D.loopCost(crown)`
   (1,500 at ×3, 600 after by the built rematch ratio).
2. `data.js`: `GW_LOOP_COST` replaces `LOOP.cost.factor` when set; the page sets it from `?cost=N` where it reads
   `?redress`.
3. Tests: `tools/tests/loop-fixture.mjs` `loadLoopData()` pins `LOOP.cost.factor = 1` unless called with `{cost}`, so the
   old suites (`loop`, `loop-trip`, `ui-loop`, `loop-evening`, `ui-catalogue`, `loop-4`, `loop-5b`) keep their base prices;
   the old browser scenarios that buy with given clams load with `?cost=1`; **new `tools/tests/loop-cost.test.mjs`**: every
   card is `nice(base × 3)` and every consumable its base, the Maps tab checked explicitly (the Lily Maze asks 180, never
   540), `buy` charges the card's price, `mapCards` and the Chart's blots agree, the legend pays 1,500 then 600.
4. Browser (desktop and phone, the default factor): the shelf shows ×3 prices and the goal line "Next: Hold 4 · 90"; then
   **§8.4's run 1, the blocking tally**.

**The checklist**:
1. `fishing.js`: one roll (WC-1's `castOdds`), LANE 4's `lurePool` not called; LANE 5C's snag block intact; WC-2's
   pre-rolls and silhouettes through WC-1's `castOdds` and `takeChance`.
2. Every card price through `loopCost` once (a grep for `price:` in `shelfItems`, LANE 4's gear items, the home cards,
   `mapCards`).
3. LANE 4's seven shelf lines replaced by §3.9's; the gear log shows Who bites.
4. §8.4's runs in order; fit with §8.4's knobs if needed; re-print M1 §6.2's table and SPEC §4.9's M1 view.
5. `tools/check --quick` (or the repo's node gate), `validate-data`, `clarity-perf --loop` and `--home`, the flag-off
   scenario and the v1 golden trace unchanged, `index.html` ≤ 3.3 MB.
6. One browser playthrough of the first three trips on a phone: on an average evening two trips buy nothing and the third
   buys Hold 4; a worm and a bare hook bring no pike, a strip does; a silhouette is caught by leading it; an obeyed tell
   answers; a lost fish is a mystery.

---

## 10. Budgets

| what | budget | where |
|---|---|---|
| signs and silhouettes | one instanced draw (unchanged), `MAX_SIGNS` 20, one instance per silhouette, ≤ 4 silhouettes (3 low) | `fishing-fx.js` |
| reeds and pads | 0 new calls (merged `fine` static; the pads' InstancedMesh, 12–16 pads a bed, 8 on low, shader-only bob) | `world-art.js` |
| the water's face | 0 new calls, no new sampler (four uniforms; masks in the depth texture's spare channels) | `water-shader.js`, `water.js` |
| the heron | +1 call on high and medium, 0 on low, only if the re-measured world line has room | `actors-heron.js` |
| frame and world calls | inside M1 §2.14: frame ≤ 200 / ≤ 150, world ≤ 54 / ≤ 42, re-measured on the WC base and after LANE 5C | `clarity-perf` |
| CPU | `cpuMs` ≤ +15% of the step-1 baseline at every tier; `areaAt` once a cast and a spawn; shares and factors baked (no fit, no grid at run time) | `clarity-perf` |
| bytes | a few kB of code and tables; `index.html` ≤ 3.3 MB | the build |

---

## 11. What this changes elsewhere

- **SPEC v8.7**: §0 rows 36–37, decisions 93–104, §0.13; §3.2 (Ashwick's comeback), §3.5 (a lost giant), §3.6 (the only
  loss), §3.7 (watercraft), §4.4–§4.5 (who a lure and a bait bring; the bare hook), §4.1 and §4.9 (Murk's factor; M1's
  targets), §8.1, §8.4 and §8.11 (words), §9 (bait attract un-parked as the hook table), §11, §12 (this file binding), §16
  questions 38–40.
- **M1 revision 8**: §0 (the user's words), §2.2–§2.5, §2.10, §2.14 (boxes), §4 (the watercraft step, tonight), §6.2 and
  §6.4 (the targets), §8 question 1 (superseded).
- **WICKS.md §2.5** ("How it shows"): reversed on the Mossmere under the loop by §7 (no ember, no hiss); its rule unchanged.
- **Precedence**: under the loop on the Mossmere this file overrides DESIGN §25.6.1 (the signs), §25.6.3's attract,
  §25.6.7 and §25.0 A4 (the got-away note), §25.6.10 and §25.0.2b for silhouettes (their true length), `WICKS.md` §2.5's
  ember, and CONTRACT §13.5's consumers of fish:escaped on a trip. Each lane updates CONTRACT for what it builds.

---

## 12. Questions only the user can answer (each with the default this document builds)

38. **Should a bare hook catch the hunters?** *Default (revision 2, changed): no. A bare hook brings the small fish, the
    bottom fish, the carp and the koi; the pikes, the zander, the trout and the lamprey take a strip of fish (Cut Strip,
    free from any small fish you let go) or a lure, and never a bare hook or a worm past 1 bite in 100.* The other way: a
    bare hook takes every fish alike, as the preview did; but then **a bare hook would catch a pike more often than a worm
    does** (at a reed line at dusk about 2.8% of bites against 0.1%, *measured* on the tables), which is your own example turned round.
39. **How much dearer, and what were your "2 runs"?** *Default ×3: the first purchase on the third trip on an average
    evening, Lake 1's shelf 4.5–7.5 hours (23,250 clams).* ×4: the fourth trip, about 7½ hours (31,000). **Did your 2 runs
    mean two trips out and back, or two sittings?** If two trips, the game paid far more than our numbers say, and Murk's
    prices go up by much more than ×3 once we have measured it. Tins and the Heartmoss Ball stay at their prices either way
    unless you say.
40. **The Lily Maze's koi glow.** *Default: the static glow under the pads goes; a koi seen there shows its candle fins as a
    faint warm edge at dusk, the koi's own body.* The other way: no glow at all on Lake 1.

---

## 13. After the MVP (could)

- The rise's *roll* form, if WC-2 does not reach it tonight.
- The heron, if tonight's re-measured budget has no room; a grebe diving over fry in open water (perch and zander below).
- The Gloam Eel's outline at the Buoy Lights (its pick would need the fitted bait's pool, which leaks the bait into what is
  seen; it waits for a ruling).
- The Thousandcast Pike's follow (its roster sign): at Under the Span, now and then a long shape slides under the float and
  turns away, no bite.
- A downwind margin richer in carp on a warm evening (the wind's food).
- A habitat tilt inside the places, re-measured.
- The got-away sting scaled with the hooked length rather than switching on at the Trophy class.
- The Journal's species page learns the glyphs of the baits and lures each fish has been landed on.
- The road's waters get their own areas and hook rows with their slices.

---

## 14. Review log (revision 2: the two critics of 16 November 2026)

Every blocker and major was checked against the code and the data; each holds unless marked. **Accepted, fixed in this
revision**:

| critic | finding | what was done | where |
|---|---|---|---|
| angler, major 1 | a refused pre-rolled stray left the cast's normal roll able to bring it again (≈ 2%); gate (e) allowed 1.2% | the refused stray is left out of that cast's pool; the whole cast is exactly 1%; the rule is checked exactly by `castOdds` over every cast type | §3.6, §4, §8.3, §9.2 (c), (e) |
| angler, major 2 | the default made a bare hook catch more pike than a worm | option (a): the five hunters are strays on the bare hook; Cut Strip (free) is their way in; the sim models Cut Strip's supply, the pacing and list players use it; question 38 re-asked with the fact stated | §3.2, §3.3, §3.6, §8.3, §9.2, §12 |
| angler, major 3 | three places still told of a lost fish: the Chart's Marked ripple, the bell's nicks, Ashwick's ember | all three silent on the Mossmere under the loop (counts and Hold kept); the comeback also loses its hiss, a surprise as the brief asks | §7.2, §7.3, §9.3, §9.4 |
| angler, major 4 | silhouettes were not in the sim; a stalker could cherry-pick big fish | a stalker-reader player in the sim; all three players' shelves in the band; a warn above +40%; two pre-decided knobs after the factor (the take 0.45 → 0.35, then one in range) | §8.3, §8.4, §9.2 |
| angler, major 5 | with the gold pulse gone, an obeyed tell got no visible answer | every obeyed tell gets a grounded answer from the water and wait ×0.65 (the rise ×0.5 as built) | §5.1, §5.3, §9.3 |
| angler, major 6 | "2 runs" may mean two trips (a trip is a run in this code) | question 39 asks; the browser tally is a blocking gate before any fit; "on an average evening" | §8.3, §8.4, §12 |
| angler, minors | the lantern's edge a circle; small shapes too small on a phone; four grades; bed gas; nervous water missing; two claims overstated; the ring rule's wording | night opacity follows the light's falloff, raft distance 3–5 m by fish; distance by length and a phone check; the trout's fly 2, both pikes' jig 2, the chub's strip 2; gas as single bubbles; nervous water as its own form (and the roll as a should); "shape and sound tell body and heft"; the rule reworded | §0, §3.2, §5.2, §6.1–§6.3, §7.1 |
| builder, blocker 1 | the cap sat inside `loopPool`, before the rarity bonus, the tilt and Taper; a stray could reach ≈ 4% | the pipeline split: `hookWeights` (steps 4–6) and `finishPool` (giant, cap) at the end; the tilt only on takers; Taper judged on takers; the gate calls the real draw with the largest bonus and every tilt | §4, §9.2 |
| builder, blocker 2 | two reed arcs and one bed failed their own clearance check | re-authored and measured: arcs [120, 135] and [232, 244] in place of [140, 160] and [215, 228]; the bed (−20, −50) in place of (−36, −30); every clearance ≥ 4.8 m; the shares re-measured | §2.1, §2.2 |
| builder, blocker 3 | the hour tilts and "the areas add nothing" contradicted each other | the fit's target is today's mix × the tilt; the check compares against that target, before the hook; the doc states what the hook does to a blind caster's mix | §2.4, §8.3 |
| builder, blocker 4 | WC-1 and WC-2 were based on a tree without LANE 4 | the lead merges LANE 4 and 5B-HOME first; all three lanes branch from that merge | §9.1 |
| builder, major | double pricing on the Maps tab | `mapCards` prices maps; `shelfItems`' pass skips tab 'maps'; the test checks the Lily Maze at 180 | §8.1, §9.5 |
| builder, major | old tests hard-code base prices | the fixture pins factor 1; `?cost=1` for old scenarios; one new cost test | §8.1, §9.5 |
| builder, major | `clams.mjs` had two writers | WC-1 owns it tonight; 5C's finds model, if it comes, is one branch at the top of `trip()`'s bite; 5C's real snag block in `fishing.js` is after `S.species = sp`, untouched | §4, §9.1 |
| builder, major | the game's and the sim's pools have different shapes; the pull is sim-only | id-level parts both builders call; `lureAttract` off for fish with a row; the pull marked sim-only | §3.6, §4, §9.2 |
| builder, major | the new water marks would need new shader ids | the new marks reuse ids 1–6; no shader change for them | §9.3 |
| builder, major | the WC-1/WC-2 seam (the pools, the wait, the rule object) was unpinned | `loopPool`'s options form (who is there / what the hook brings); the rule object pinned in CONTRACT; WC-1 owns the wait lines with `takeWaitMult` | §4, §9.2 |
| builder, major | a runtime grid and fit would land on the first cast | shares and factors baked; the probe from the world's own layout | §2.4, §10 |
| builder, major | the lost-fish list missed the Chart's ripple, the bell's nicks and the tell glyph | all three silent (the glyph one neutral `plunge`); WC-3's tests cover them at the model level | §7.2, §9.4 |
| builder, major | gold and rings no lane owned (`bite()`'s rings, `water.js`'s droplets, the leap reveal) | `bite()`'s rings to WC-2 (one white ripple); `water.js`'s droplets to WC-3; the hue check's scope stated: cast to bite, not the show | §5.7, §9.3, §9.4 |
| builder, major | the Hold targets and the gear line live in LANE 4's code in WC-3's file | `watercraft.gradeTargets`; WC-3 edits `targetsOf`/`holdText` and renders Who bites; no unmet name in the line | §3.7, §9.4 |
| builder, major | WC-1 was too large for one builder tonight | the prices' application moves to the integrator's step P (it must see every merged card anyway); `bitesBlock` and the Hold line move to WC-3; WC-1 keeps the roll and its proof | §9.2, §9.4, §9.5 |
| builder, minors | the eel's bait gate and outline; null cells and the 12 hooks; one quad per silhouette; pad counts; the low tier's masks; no DOM in node; budgets and the glide-in; phase words | the gate kept and the eel's outline after the MVP; nulls allowed and the 12 hooks listed; one instance per silhouette; 12–16 pads, shader bob; masks in the depth texture; the DOM scan in the browser; re-measure first, the heron conditional, the glide-in a clearance; `lightOf` and `loopLight` | §3.2, §6.2, §6.8, §9, §10 |

**Found in revision 2 by the designer**: `takeChance` as drafted gave a rise's fish 90% at grade 2 and 3 (below its base of
1); now never below the base (§3.6). The lip of the shelf is tested after stones and reeds, so structure on the lip reads as
structure (§2.2). Fry spraying listed areas where small fish are scarce; it now spawns only where the minnow's raw weight is
1 or more (§5.3). The barge's hull is stone and timber (§2.1). The boss-phase toast could name a hooked fish on a trip; it is
silent there (§5.7).

**Rejected or narrowed** (with the reason):
- *Angler major 5's "the float's dip comes sooner on every obeyed tell, ×0.6–0.7"*: taken at ×0.65 for every tell but the
  rise, which keeps its built ×0.5 (faster still: a rise is the surest read).
- *Angler minor, the sting scaled with length*: kept as built by class tonight (it is the water's heft, not a name); moved to
  §13.
- *Builder minor, drop the eel outline or read the fitted bait's pool*: dropped for the MVP; reading the fitted bait would let
  the shapes reveal the bait's effect, which is the gear log's job (§13).
- *Builder major, "5C puts the snag as a single early return at the top of rollBite's else-branch"*: not needed: 5C has since
  committed its snag as its own block after `S.species = sp`, apart from the species path; WC-1 leaves it as it is.
- *Builder major, a separate price lane (WC-1P)*: the brief allows at most three lanes; the price's application is the
  integrator's step P instead, because it must see every merged card and is the one knob the integrator re-runs.

---

## Appendix A. Sources of the grounding notes (search excerpts; no page bodies were fetched)

[S1] How to read the water: signs carp are in your swim (DNA Baits) · [S2] How to find carp (Angling Times) · [S3] How to spot
carp in silt (Carpology); fish bubbles explained (Advnture); Fishing Again on bubbles · [S4] How to catch your first tench
(Angling Times); Tackling tench (Fish and Fly) · [S5] Tench from weedy lakes (Angling Times); fishing for tench
(fisheries.co.uk) · [S6] Specimen bream (Dynamite Baits); bream (theangler.org) · [S7] Lure fishing for perch (Westin); more
perch (MeatEater); fall perch (Wired2Fish) · [S8] Finding pike all season (In-Fisherman); early season pike (MidWest Outdoors) ·
[S9] Pike fishing guide (Wired2Fish); fishingmagic pike · [S10] Summer carp (Fishing Again; Carpology) · [S11] Summer carp (CC
Moore); zigs and floaters (Carpology) · [S12] Undertows (Carpology) · [S13] Wind and fishing (Haith's); weather and winter carp
(Angling Times) · [S15] Chasing bait (California Fly Fisher); the bump and stun (MidWest Outdoors); summer schooling (Game &
Fish) · [S16] Edges for largemouth (Bass Pro); docks and grass (BassResource) · [S17] Stillwater chub (Fish and Fly); chub
tips; snaggy swims (Angling Times) · [S18] Eels (fishingmagic; FishingBooker) · [S19] Watercraft; nature's signs (Carpology;
AllOutdoor) · [S20] White sucker (Missouri Dept. of Conservation; USDA Forest Service) · [S21] White sucker (Newfoundland and
Labrador) · [S22] Crayfish in Illinois · [S23] Crayfish growth, Lake Tahoe; northern crayfish (Colorado Parks and Wildlife) ·
[S24] Crayfish (Virginia Cooperative Extension) · [S25] Rudd (Canal & River Trust) · [S26] Rudd (Angling Direct;
fisheries.co.uk) · [S27] Rise forms (Hatch Magazine) · [S28] Reading riseforms (Fly Fisherman; FAOL) · [S29] Methane in lakes
(Radboud University) · [S30] Nervous water (Deneki) · [S31] Ripples on the surface (BassResource forum) · [S32] Fishing lakes;
stillwater strategies (California Fly Fisher) · [S33] Wind lanes (Get the Drift) · [S34] Small lakes guide (British Columbia
Ministry of Environment) · [S35] Muddy water (FishUSA) · [S36] Locating stillwater trout (Fly Fisherman) · [S37] Seams (Gink &
Gasoline) · [S38] Spotting trout (Fly Fisherman) · [S39] Warmwater sight fishing (MidCurrent); spot and stalk (RiverBum) ·
[S40] Seeing fish (Deneki; theflyfisher.com.au) · [S41] Refraction (Scuba Tutor) · [S42] Underwater objects appear shallower
(BassResource) · [S43] Size distortion (BassResource forum) · [S44] Stalking; the margins (Carpology) · [S45] Stalking fish
(Fishing Again).

Caveats: angler field craft rather than controlled studies; where sources disagree (perch on or beside drop-offs, why carp
follow wind, which way refraction skews size) the tables take the middle; the koi's tench habit, the Gloam Eel's one bait,
the lamprey's spinner and the Lampsipper are the game's own fish, graded by their roster notes; bed gas comes up as single
bubbles in one spot, more when the air pressure falls [S29].
