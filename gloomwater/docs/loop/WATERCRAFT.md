# Watercraft: where the fish are, what they take, and reading the water (the Mossmere; binding design, v1)

*Written 16 November 2026, after the user played the published preview (slice 1a, step 2's roster fish, the drawn Chart,
the Wick choice; its shelf the hold and Rod, Line and Reel). Binding with `SPEC.md` v8.7 (§0 rows 36 and 37, decisions
93–104, §0.13) and `M1.md` revision 8. Scope: **Lake 1 only, the Mossmere**, by the user's word ("Just lake 1"). Every other
water keeps SPEC §4.4–§4.5 until its own slice writes its own rows of these tables. Design only: no `src/` or `tools/`
file is changed by this document. Figures marked *est.* come from scratch runs against the live data of `gw-m1-mvp`
(`b5ace47`): `tools/sim/clams.mjs --shipped=mossmere --quick` with a price factor added by hand, and `data.placePool` with
this document's tables applied by hand. None may be quoted as measured until the watercraft build's sim prints it (§9).*

*Inputs: the user's two messages (§0), research notes on reading a still lake from generic angling sources (UK coarse-angling
magazines and tackle sites, US bass and fly sites, US state wildlife and extension pages; Appendix A lists them), and an
audit of `gw-m1-mvp` and LANE 4's branch `gw-mvp-4`. Never name any television series or presenter in anything written from
this document.*

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
| different areas, different chances | ten habitat **areas** of the Mossmere's open water, each with a weight for each fish, grounded in its real cousin's habitat and hour; the four places keep their pools | §2 |
| a worm never catches a pike | **the hook table**: every Lake 1 bait and lure against every Lake 1 fish. A fish that won't take what is on the hook is a **stray**: at most 1 bite in 100. A good match raises the fish | §3 |
| read the surface, grounded, not sparkly | **the tells**: the v3 signs re-grounded as real angler's reads (rises, swirls, fry spraying, a strike, carp fizz, tench-like pin-pricks), with mud clouds, tailing, moving pads and twitching reeds, a false tell (bed gas), and **the water's face**: the drop-off's shade, the inflow's seam, the wind lane, reed beds, lily beds, a heron. The glow sign and every gold mote on the water retire on Lake 1 | §5 |
| silhouettes, true to size, catchable | **silhouettes**: a few real fish seen as dark shapes, with their shadows, in clear, calm, shallow water; drawn at the fish's own length; they cruise, root and turn; a cast on top spooks one; a cast a little ahead gives a real chance at *that* fish | §6 |
| not told what got away | **the lost fish**: no note, no name, no class, no weight, no word. The line, the sound and the water say only that something big or small went | §7 |
| Murk's prices way higher | **one factor on every price Murk asks**: ×3 on the Mossmere (consumables excepted). Two trips buy nothing; the first purchase comes on the third trip; Lake 1's shelf takes about 5½ hours, not 2 | §8 |

Each ruling is the lead's design of the user's words; the questions only the user can answer are §12, each with the default
this document builds.

**The standing taste (binding, every lane).** "Art, atmosphere and fishing those are our key drivers." The Clear Night
(Starlit) palette; UI Drowned Filigree. **Never a ring or a disc drawn round the raft, the Wick, the barge, a silhouette or a
tell.** Fishing is automatic after the strike. **Odds and percentages are hidden**: never under a fish, never on the water,
never on the catalogue's fish; they appear only in the player's logs (the gear log, the Journal's odds block). No way to
fail. Few words: SPEC §8's and `TEXT_LOOP`'s only. Sizes in pounds and ounces. The player learns by watching, never by a
tutorial wall.

---

## 1. The design on one page

1. **Where you cast decides who is there.** The bob lands in an area (§2): the margins, a reed line, a lily bed, the
   drowned stone and timber, the drop-off, a wind lane, open water, the deep, the inflow, the outflow; or a place you own.
   Each area weights each fish (perch on the stones, pike on the reed edge, trout in the deep, suckers on the inflow's
   gravel, carp and koi in the pads). Over the whole lake the areas only move fish around: a player who casts anywhere
   catches today's mix.
2. **What is on the hook decides who takes it** (§3). Each Lake 1 fish grades each bait and lure: won't take it, takes it,
   likes it, the right bait. A fish that won't take it is a stray, **never more than 1 bite in 100**. A worm never brings a
   pike past that; a spoon never brings a carp or a crayfish. A lure tipped with a bait is fished as the lure; a bait its
   taker also likes makes it keener. The bare hook takes every fish alike, as today.
3. **The water shows where the fish are, honestly** (§5). Every tell is made by a fish that is really there in the pool at
   that spot and hour. Reading it and casting by its rule brings its fish. Nothing glows, nothing sparkles; one tell lies
   (bed gas), as the real water does.
4. **Some fish can be seen** (§6): dark shapes over a pale shallow bed, at their true length, by day and dusk; at night only
   in the lantern's light. Lead one and it may take; land on it and it bolts.
5. **A lost fish is a mystery** (§7): a slack line, a splash, a sound. Nothing names it, anywhere.
6. **Murk's prices are ×3** (§8), one key, `LOOP.cost.factor`, applied where every price is made. The sim proves the new
   pacing; the integrator re-runs it once every lane is merged.
7. **Built tonight in three lanes** (§9): the roll, the price and the sim (WC-1); the tells and the silhouettes (WC-2); the
   water's face and the lost fish (WC-3).

---

## 2. The lake's areas (A)

### 2.1 The areas

The Mossmere is a bowl 60 m across (`ZONES[0].arena`): a shallow shelf round the shore and the islands, mid water, a deep
middle and the Bell Pool's hole; six islands, the Toppled Bridge's four piers, three pylons, three statues, five docks, the
Moss Sluice in the south and the Sluice Veil's spill on the east cliff. The ten open-water areas are found from that
geometry (§2.2) and from a few cheap props (§5.4); none is painted by hand on a texture.

| area (code id) | what it is, in the world | how `areaAt` finds it (first match wins, after the places) | share of open water *est.* | the grounding |
|---|---|---|---|---|
| **the inflow** (`inflow`) | the Sluice Veil's spill on the east shore: moving water, a foam seam, a pale gravel fan | within 9 m of (54, 4) | 2% | inflows carry food, oxygen and cooler water; suckers spawn on gravel where the water runs [S20, S21, S36] |
| **the outflow** (`outflow`) | the lip of the Moss Sluice: water sliding south, foam threads drawn to the gate | 4.5–11 m from the gate (0, −49) | 4% | an outflow dislodges small fish and hands perch an easy meal [S7] |
| **the drop-off** (`dropoff`) | the Bell Pool's rim, where the pale water falls to ink; and the shelf's lip all round the lake | 6–12 m from (−4, −14) (outside the Bell Pool place), or depth 0.35–0.45 within 14 m of the shore or 6 m of an island | 10% | the colour change where the bed vanishes is the drop-off, prime for perch, pike and zander [S34, S7, S8] |
| **the lily beds** (`pads`) | four authored lily beds in the margins (§2.2), and their notched pads | inside a bed's disc | 3% | lilies hold tench and carp all day in their shade; pike and bass sit at the outer edge [S4, S5, S16] |
| **stone and timber** (`stones`) | the drowned street: the bridge piers' ends, the pylons, the statues, the docks and the barge, the masonry rims of the Drowned Gatehouse and the Stair Isle, the drowned roots of Root Isle | within (r + 4) m of a pillar, 4 m of a dock, or 3.5 m outside a `tower`, `stair` or `roots` island | 10% | perch and bass hold on structure and the shaded side of docks; crayfish choose rock; chub run for snags [S7, S16, S17, S22–S24] |
| **the reed lines** (`reeds`) | reeds round the rock islands (Mossbell Isle, the Elder and Younger Sisters) and four new reed beds along the shore (§2.2) | from a rock island's edge to 1.35 r + 1.5 m, or 0.5–6 m off the shore inside a reed arc | 6% | pike lie at reed points and drowned timber; carp push through the stems; rudd dimple by reeds [S8, S9, S19, S25] |
| **the margins** (`margin`) | the shallow shelf by every shore and island (depth < 0.35) not claimed above | depth < 0.35 | 24% | silty margins: carp tail and cloud there; small fish in the shallows on warm evenings [S1–S3, S25] |
| **the wind lane** (`lane`) | this evening's slick: a smooth strip 4 m wide and 50 m long across the ripple, a scum line on its downwind edge, laid by the evening's wind | inside the evening's strip (`laneFor(evening)`), depth ≥ 0.35; day and dusk only | 1–2% | lanes carry and collect food; fish rise along their edges [S32, S33] |
| **the deep** (`deep`) | the bowl's dark middle, blank on top | depth ≥ 0.75 | 18% | lake trout hold deep; zander keep to deep water by day [S36; roster: Kissmark, Milkeye] |
| **open water** (`open`) | mid water with no cover | everything else | 23% | roach shoals roam; carp cruise; little holds fish for long |

The **four places** of step 3a are areas too, and keep their pools exactly (§2.3). A cast into an unowned place's mist is a
mist cast, as built. The names above are this document's; **no area name is ever shown on screen**. The player learns the
areas by their looks.

### 2.2 The geometry (the build copies this block into `src/watercraft.js`)

```js
// WATERCRAFT.mossmere.geometry — the Mossmere's areas (world metres; angles in degrees from +X toward +Z, as Math.atan2(z, x))
geometry: {
  inflow:  { x: 54, z: 4, r: 9 },                          // under the Sluice Veil (58, 4); the seam runs west from (56.5, 4)
  outflow: { x: 0, z: -49, r0: 4.5, r1: 11 },              // the Moss Sluice's lip, outside its stone ring
  rim:     { x: -4, z: -14, r0: 6, r1: 12 },               // the Bell Pool's drop-off, outside the place's 6 m disc
  lip:     { depth: [0.35, 0.45], shore: 14, island: 6 },  // the shelf's drop-off all round
  beds: [                                                   // the lily beds (pads added by WC-3 in the pads' InstancedMesh)
    { x: -26, z: 34, r: 5 }, { x: 40, z: 28, r: 5 }, { x: -36, z: -30, r: 4.5 }, { x: -6, z: 52, r: 4.5 } ],
  reedArcs: [[140, 160], [215, 228], [318, 332], [100, 112]],   // shore reed beds, 0.5–6 m off the shore
  reedIslands: ['rock'], stoneIslands: ['tower', 'stair', 'roots'],
  stones: { pillar: 4, dock: 4, island: 3.5 },
  margin: 0.35, deep: 0.75,
  lane: { w: 4, len: 50, within: 25, phases: ['calm', 'dusk'] },   // laneFor(evening): a seeded point within 25 m of (0, −5) and a heading
}
```

`validate-data` checks (WC-1): every bed and reed arc is open water for ≥ 80% of its area, ≥ 3 m clear of a dock, the
mooring's lane, the glide-out paths and every place's footprint; the inflow's centre is water; `areaShares()` sums to 1 and
each share is within ±3 points of the table above (the builder prints the measured shares into this table's column).

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

**Raw weights** (a multiplier on each fish's built weight in that area; 1 is "as anywhere"). Each row is normalised before
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
| Milkeye Perch (zander) | 0.3 | 0.4 | 0.3 | 1 | 2.5 | 0.8 | 1.3 | 2 | 0.8 | 1.5 | drop-offs and deep, hard ground; roster: "deep murky water by day, the shallows after dark" (§2.5) |
| Kissmark Trout (lake trout) | 0.2 | 0.2 | 0.1 | 0.5 | 2 | 1.5 | 1.2 | 3 | 2.5 | 1 | deep, cool, open water; inflows [S36]; roster: "the deepest open water" |
| Reedjaw Pike (pike) | 0.8 | 3 | 2 | 1.5 | 1.5 | 0.4 | 0.4 | 0.5 | 0.5 | 1.2 | reed points, the deep edge of weed and lilies, drowned timber [S8, S9]; roster: "reed edges and drowned timber" |

The place fish (the Bridgechain Sturgeon, the two giants, the Gloam Eel, the Matriarch) bite only at their places, as built;
they have no area row.

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

**After dark** (gloomtide) two rows change, as the roster and the research say: the Milkeye Perch's margin weight is 2.5
and its deep weight 1 (it comes up into the shallows); the Gutter Crayfish's margin and stones weights are ×1.5.

**Normalisation (binding).** For each fish the build finds one factor so that a player who casts anywhere, landing in each
area as often as its share of open water (`areaShares()`, a 1 m grid over open water, the wind lane at its mean share over
100 seeded evenings), gets **exactly today's open-water mix**: a fixed-point fit, `f ← f × today / blind` per fish and
phase, 30 rounds, every fish within ±0.5 points. **The areas move fish around the lake; they never add or remove one.** So a
blind caster's clams are unchanged by the areas, and every figure the sim measured before stands until the hook table moves
it; reading the water is what pays.

### 2.5 What it does (dusk, a bare hook; *est.*, from the tables above on today's pool, before the hour tilts)

| where | the most likely bites, in order (share of bites) |
|---|---|
| anywhere (today, and the blind caster) | six commons about 13% each; carp, koi, zander, trout about 4.6% each; the Reedjaw Pike 1.1% |
| a reed line | minnow 20%, chub 19%, bass 16%, perch 13% … the Reedjaw Pike **2.9%** |
| stone and timber | crayfish 27%, bass 18%, chub 17%, perch 17%, sucker 10%; zander 2.1% |
| the drop-off | perch 25%, bass 20%, zander 9.6%, trout 7.6% |
| the deep | sucker 20%, trout 19.5%, zander 13% |
| the inflow | sucker 28%, chub 21%, crayfish 13% |
| a lily bed | minnow 20%, koi 17%, bass 16%, chub 16%; the pike 2% at its edge |
| the margins | minnow 21%, chub 16%, crayfish 16%, sucker 12%, koi 8%, carp 7% |

### 2.6 Odds stay hidden

No area's name, weight or share is ever on screen, on the water, on a card or on the catalogue. The gear log's **Who bites**
block (§3.9) is the one place a share of bites shows, and it shows open water as a whole, the blind caster's mix: reading the
water stays the player's own skill.

---

## 3. Bait and lure (G)

### 3.1 The items (LANE 4 owns them; this table owns their effect on the bite)

| id | name | kind | owner | on the Mossmere's shelf |
|---|---|---|---|---|
| (none) | the bare hook | — | built | always (a fresh save's) |
| `mireworm` | Mire Worms | tin of 10 | LANE 4 (`LOOP.tins.mossmere`) | step 4 |
| `lumen_moss` | Lumen Moss | tin of 10 | LANE 4 | step 4 |
| `cut_strip` | Cut Strip | free, 3 from a Small or Keeper held at **Let go** | LANE 4 (`LOOP.cut`) | never sold |
| `heartmoss` | Heartmoss Ball | the legend's bait, one try | built (step 3a, `LOOP.legendBait`) | step 3 |
| `feather_fly` | Feather Fly | lure | LANE 4 (`LOOP.lures`) | step 4 |
| `glimmer_spoon` | Glimmer Spoon | lure | LANE 4 | step 4 |
| `bone_jig` | Bone Jig | lure | LANE 4 | step 4 |
| `bell_spinner` | Harbour-Bell Spinner | the giants' lure | LANE 4 | step 4 |

### 3.2 The hook table

Grades: **0 won't take it** (a stray, §3.3) · **1 takes it** · **2 likes it** · **3 the right bait**.

| fish | bare hook | Mire Worms | Lumen Moss | Cut Strip | Feather Fly | Glimmer Spoon | Bone Jig | Harbour-Bell Spinner | why (what the real cousin takes) |
|---|---|---|---|---|---|---|---|---|---|
| Dusk Minnow | 1 | **3** | 2 | 0 | 2 | 0 | 0 | 0 | worms and bread; rudd take flies; too small for meat or a lure |
| Mossback Perch | 1 | **3** | 0 | 2 | 1 | 2 | **3** | 2 | the worm is the perch bait; small jigs and spoons; fish strips |
| Gutter Crayfish | 1 | 2 | 1 | **3** | 0 | 0 | 0 | 0 | meat and fish first, worms, scraps; never a lure |
| Likely Chub | 1 | 2 | 2 | 1 | **3** | 1 | 1 | 2 | eats everything: the dry fly in summer, bread, worms, small spinners |
| Overbold Bass | 1 | 2 | 0 | 2 | 2 | 2 | **3** | 2 | jigs and crayfish lures, spinners, poppers, worms; no sweet bait |
| Rustfin Sucker | 1 | **3** | 1 | 0 | 0 | 0 | 0 | 0 | worms on the bottom; never a lure |
| Lampsipper | 1 | 1 | 2 | 0 | **3** | 0 | 0 | 0 | a night riser on insects |
| Weeping Carp | 1 | 2 | **3** | 0 | 0 | 0 | 0 | 0 | sweet baits first (bread, corn, paste), worms; never a lure |
| Candlefin Koi | 1 | 1 | **3** | 0 | 1 | 0 | 0 | 0 | sweet and floating baits |
| Milkeye Perch | 1 | 1 | 0 | **3** | 0 | 2 | **3** | 1 | deadbait strips and jigs are the zander's; a worm now and then |
| Kissmark Trout | 1 | 1 | 0 | 2 | 1 | **3** | 2 | 2 | spoons fished deep, jigging, cut bait |
| Reedjaw Pike | 1 | **0** | 0 | **3** | 0 | **3** | 1 | **3** | spoons, spinners, deadbait; **never a worm** (the user's rule) |
| Bridgechain Sturgeon | 1 | **3** | 0 | **3** | 0 | 0 | 0 | 0 | worms, roe and cut fish on the bottom; never a lure |
| ★ Thousandcast Pike | 1 | 0 | 0 | **3** | 0 | 2 | 1 | **3** | big spinners; the roster's "takes the plainest bait": a strip of fish |
| ★ Hullkiss Lamprey | 1 | 0 | 0 | **3** | 0 | 1 | 0 | 2 | it latches onto meat; it kisses a flashing spinner as it kisses hulls |
| Gloam Eel | — | 0 | **3** | 0 | 0 | 0 | 0 | 0 | the game's own glow eel: Lumen Moss only, as built (its one bait is part of who it is) |
| ★ The Belled Matriarch | — | — | — | — | — | — | — | — | her rule only: the Heartmoss Ball in her pool in her hour, a sure bite |
| the Heartmoss Ball | as the bare hook to every fish but her (as built) | | | | | | | | |

The research's checks hold: worms are taken by perch, the carp, chub, crayfish, the small fish and the sturgeon, never a
pike; a spoon, a jig or a spinner by pike, perch, bass, chub and trout, never a carp, a koi, a sucker or a crayfish; meat
and fish strips by the hunters, the crayfish and the sturgeon; sweet bait by the carp, the koi, the small fish and the chub;
the fly by the risers.

### 3.3 From a grade to a weight; strays; the bare hook

```
grade 1 takes it ×1 · grade 2 likes it ×1.6 · grade 3 the right bait ×2.5          (WATERCRAFT.hook.mult = [0, 1, 1.6, 2.5])
grade 0 won't take it — a STRAY:  w' = min(w × 0.1, 0.01 × S)
    S = the summed weight of every fish in this pool whose grade is 1 or more, after every multiplier but the strays' own.
    So each stray is at most 1% of the bites, in every area, place, hour and kit, whatever else is in the pool.
    A pool where nothing takes the hook (S = 0) bites its strays at w × 0.1 among themselves: the water never stops biting.
```

- **The bare hook** takes every fish at grade 1: today's pool, no stray, no favour, no Hold. It is the Wick's plain rig, a
  poor bait for every fish alike, and the fresh save's (SPEC §4.5: "with no bait you fish a bare hook; that is always
  allowed"). §12 question 38 asks the user whether the hunters should refuse it.
- **A bait-only fish** (the Gloam Eel) still needs its bait to be in the pool at all (as built, `placePool`'s `s.bait`); with
  its bait on, the table grades it as any fish.
- **The legend** is outside the table: her sure bite is her own rule (SPEC §3.5), and no other fish takes her bait.
- **A tin still gives favour +0.3** (every fish runs bigger) and the Hold of §3.7, as SPEC §4.5 says; what changes is that it
  now also changes who bites.
- **The rarity bonus** (Lumen Moss's built +0.1) applies as built, after the grades.

### 3.4 A lure tipped with a bait

Both slots stay (SPEC decision 5: one lure and one bait at once). Anglers tip a jig or a spoon with a worm or a strip; the
lure's action decides who strikes, the tip adds scent.

```
no lure:          the grade is the bait's (none: the bare hook's 1)
a lure, no bait:  the grade is the lure's
a lure and a bait: the grade is the lure's; where the lure's grade is 1 or more and the bait's is 2 or more, one step up (to 3 at most);
                  a lure's 0 stays 0 whatever the bait (a carp never takes a spoon, tipped or not); the bait never blocks a lure's taker
```

Examples: Glimmer Spoon + Mire Worms: perch 2→3, bass 2→3, chub 1→2, the pike 3 (the worm does not keep it off a spoon),
the carp a stray. Feather Fly + Lumen Moss: the minnow 2→3, the koi 1→2. To fish for the Gloam Eel, fit Lumen Moss and take
the lure off (`fit('lure', null)`, built by LANE 4).

### 3.5 Giants

A giant keeps SPEC §3.5's fixed share (6% in its hour, 2.5% outside; ×1.5 with its water's giants' lure; Taper ×1.3, never
above 12%). The table adds one rule: **a giant whose grade is 0 is a stray** (its share becomes `min(share × 0.1, 0.01)`):
the Thousandcast Pike and the Hullkiss Lamprey never come to a worm or Lumen Moss past 1 bite in 100. Grades 2 and 3 do not
raise a giant's share; only the giants' lure does, as built.

### 3.6 Pre-rolled fish obey the hook

A rise's, a swirl's or a silhouette's fish, Ashwick's comeback and the pull all obey the table:

```
takeChance(base, grade):  grade 0 → 0.01 · grade 1 → base · grade 2 → min(0.9, base + 0.1) · grade 3 → min(0.9, base + 0.2)
    a rise's fish: base 1 (grades 1–3 all 1, as built) · a swirl's Prize+: base 0.6 · a silhouette's fish: base 0.45 (§6.6)
```

- A silhouetted pike will not take a worm, past 1 time in 100: it noses the bait and turns away.
- **Ashwick's comeback** waits while the hook carries something it won't take: it keeps its turn at that water this evening
  and comes at the first cast whose hook it takes (grade ≥ 1), still a surprise (§7).
- **The pull** (SPEC §5.5 (d)) multiplies only a fish whose grade is 1 or more; its sure bite ("the first bite wherever it
  can bite") waits for a hook the fish takes. The list itself is unchanged: its members still come from the bait-only rule
  (SPEC §5.5 (c)), so the Mossmere's list stays 12 and the fresh save's bare hook reaches all of them.
- **Murk's orders** are unchanged (an order for a pike is filled on a spoon or a strip).

### 3.7 Hold: which fish a bait's or lure's Hold helps

The items keep LANE 4's Hold values (the Feather Fly +5, the Glimmer Spoon and the Bone Jig +6, the Spinner +10, a tin +5 or
its built Hold, Cut Strip +4; the larger of the lure's and the bait's, never both). **The fish they help become the fish that
like the item or better (grade 2 or 3)**, instead of a family: the Bone Jig helps the perch, bass, zander and trout it
brings, not the carp and suckers it never sees; the Spinner keeps its named fish (all grade 2 or 3). The gear log's line
says so (§3.9).

### 3.8 The user's case, measured on the tables (*est.*, dusk, a reed line, the Reedjaw Pike's share of bites)

| on the hook | the bare hook | Mire Worms | Lumen Moss | Cut Strip | Feather Fly | Glimmer Spoon | Bone Jig | Harbour-Bell Spinner |
|---|---|---|---|---|---|---|---|---|
| the Reedjaw Pike | 2.9% | **0.2%** | 0.3% | 7.4% | 0.2% | **9.2%** | 2.9% | 8.2% |

And a spoon in the margins: the carp, the koi, the crayfish, the sucker and the minnow 1.0% each at most, the bass 32%, the
chub 31%, the perch 24%.

### 3.9 Where the player learns it

- **By watching**: what comes to which hook, the silhouettes that nose a bait and turn away (§6.6).
- **The shelf's one line** for each tin and lure (SPEC §8.4, replacing LANE 4's family lines): Mire Worms "Nearly every fish
  takes a worm." · Lumen Moss "Sweet. The Gloam Eel bites on nothing else." · Cut Strip (the bait slot's) "Meat, for the
  hunters." · Feather Fly "For the fish that rise." · Glimmer Spoon "Flash, for the hunters." · Bone Jig "Hopped on the
  bottom, for the hunters." · Harbour-Bell Spinner "For the Thousandcast Pike." (as built).
- **The gear log** (opened from a card's **Odds ›**, built): each tin and lure's line reads "+6 Hold on the fish it suits
  ({n} you have met)."; and under it the **Who bites** block: each fish of this water the player has met, with its share of
  open water's bites over an evening on that item alone (the blind caster's mix, whole percent, "<1%" for a stray), beside
  the bare hook's; fish not yet met are counted, never named ("and 3 you have not met"). The only percentages this document
  adds, and only there. The catalogue never shows a fish's rate (SPEC decision 62 as amended by the user).

### 3.10 The seam with LANE 4, by item id

LANE 4 owns the items: `LOOP.lures` (`feather_fly`, `glimmer_spoon`, `bone_jig`, `bell_spinner` with `giants` and `share`),
`LOOP.tins` (`mireworm`, `lumen_moss`), `LOOP.cut` (`cut_strip`), their prices, Hold values, slots, cards, art and the gear
log's screen. The watercraft build owns `WATERCRAFT.hook` (the table keyed by those ids) and its use: on a trip on the
Mossmere, `fishing.js`'s `loopPool` calls `watercraft.hookPool(D, data.placePool(...), {area, phase, lure, bait, wickId})`,
which applies the areas, the hour tilts, the grades, the giants' lure share (read from `LOOP.lures[id].giants` and `.share`,
LANE 4's rule moved inside) and the strays' cap; **LANE 4's `lurePool` is no longer called by `fishing.js`** (it stays
exported and tested). A fish with no row in the table (every other water's) keeps the built family rule, so nothing past the
Mossmere moves.

---

## 4. The bite roll, in order (binding)

On a trip, `rollBite` → `rollSpeciesLoop` applies, in this order:

| # | step | owner | rule |
|---|---|---|---|
| 0 | the legend's sure bite | built | her bait, her hour, her pool → her; nothing below applies |
| 1 | **the snag** | LANE 5C | 1 bite in 20 is a find (SPEC §4.10); unchanged by area or hook; a snag skips 2–9 |
| 2 | Ashwick's comeback | built, WC-1 | the same fish, if the hook is one it takes (§3.6); else it waits |
| 3 | the pre-rolled fish | WC-2 (sources), WC-1 (take) | a rise's, a swirl's or a silhouette's fish whose cast rule the cast met: it takes with `takeChance(base, grade)` (§3.6); Taper's first bite: a pre-rolled common does not take (built) |
| 4 | the pool, built | built | `data.placePool`: the hour window, the place's rules (commons ×0.5, draws, own fish, kind fish), the bait-only fish, "best at night", the giant set apart |
| 5 | **the area** | WC-1 | open water only: × the area's normalised weight for each fish (§2.4); a place keeps its pool |
| 6 | **the hour tilt** | WC-1 | × the fish's tilt for this phase, and the after-dark rows (§2.4) |
| 7 | **the hook** | WC-1 | × the grade's multiplier (§3.3), the tipped rule (§3.4); grade 0 marked a stray |
| 8 | the rarity bonus | built | uncommon ×(1 + 2rb), rare ×(1 + 4rb) |
| 9 | **the tell's tilt** | WC-2 (makes it), WC-1 (applies it) | the makers of the tell the cast obeyed ×3 (§5.3); the sign rule F17 drops a tilt that would name a fish (built) |
| 10 | Taper's first bite | built | commons zeroed where the rest passes the sign rule |
| 11 | the giant's share | built + LANE 4 | drawn last from the rest: in/off its hour, ×1.5 with its giants' lure, Taper ×1.3 under 12%; grade 0 → stray (§3.5) |
| 12 | **the strays' cap** | WC-1 | every grade-0 fish, the giant included, `min(w × 0.1, 0.01 × S)` (§3.3): the last word, so nothing above can lift a stray past 1% |
| 13 | the draw, the size roll, the wait | built | one draw; the wait: a rise ×0.5, a silhouette's take ×0.3 (§6.6) |

`tools/sim/clams.mjs`'s `poolFor` applies steps 4–12 in the same order, from the same `src/watercraft.js` functions, and
T104 (the game's pool is the sim's) is extended to every area × phase × hook (§9.2).

---

## 5. Reading the water (B)

### 5.1 Principles

1. **Every tell is a small physical disturbance**: a ring, a bubble, a cloud, a stem, a wake, a slick. None glows.
2. **Honest**: a tell appears only where its makers really are in this spot's pool at this hour, as often as they are
   (§5.5). Reading it right brings its fish; reading it wrong costs nothing but the cast.
3. **Repetition confirms**: several tells in one patch over a minute say more than one ring, as real anglers know [S1, S19].
4. **One false tell**: bed gas, a fixed steady stream that never travels [S1, S29]. Learning to ignore it is reading.
5. **The water goes quiet**: quiet water spawns no tells and no silhouettes (built for signs), so the lake itself says "move".
6. **No word, no ring, no number** on any tell. The float's favour notches and good-bite dots stay as built.

### 5.2 What happens to the six v3 signs (DESIGN §25.6.1) on Lake 1, under the loop

| v3 sign (code id kept) | becomes | change |
|---|---|---|
| rise (`rise`) | **the rise**, in two forms by its fish: a *sip* (a small quiet ring, often repeated in one spot: the minnow, the Lampsipper, the koi, the carp at dusk) or a *splash* (the film slapped: the chub, the bass, the trout) | its fish is drawn from the risers only (the "surface feeder" depth filter, which passed every fish, is replaced by the makers list); its droplets are water-white, never gold |
| boil (`boil`) | **the swirl**: a heavy bulge where a big fish turned just under, no spray | makers: the pike, the zander, the trout, the bass, the carp, the chub, Prize+ only (as built) |
| nervous (`nervous`) | **fry spraying**: small fish leaping out of an edge in a frantic spray, the patch restless | makers: the hunters (perch, bass, pike, zander, trout, chub); only where small fish are (the minnow's weight there ≥ 1); the spook's words "The fry scatter" go (no words) |
| strike (`strike`) | **the strike**: one heavy slap at an edge, then quiet; at night heard more than seen | makers: the pike, the bass, the zander, the perch; a white spray, no gold burst |
| bubbles (`bubbles`) | **carp fizz**: a frothy fizz of mixed bubbles that travels along the bottom and dies quickly | makers: the Weeping Carp; cast at the leading edge, never behind it |
| glow (`glow`) | **retired on Lake 1** | never spawned on the Mossmere under the loop (it stays in code for the flag-off game and later waters); its night role goes to the lantern's silhouettes and the Buoy Lights' shapes (§6.1) |
| — | **pin-pricks** (`pinprick`, new) | a tight patch of tiny bubbles that stays in one gap between pads; makers: the Candlefin Koi (the tench's habit) [S4, S5] |
| — | **bed gas** (`gas`, new) | a thin, steady stream from one fixed spot over silt; makers: none; no cast rule |
| — | **the mud cloud** (`cloud`, new) | a soft dark plume blooming off the bottom and drifting; makers: the carp, the sucker (as a puff of sand on the inflow's gravel), the Bridgechain Sturgeon at Under the Span [S1, S20] |
| — | **stems** (`stems`, new) | a pad knocked from below, a reed stem twitching, in a short run; makers: the carp and the koi in pads, the carp in reeds [S19] |
| — | **tailing** (a silhouette's behaviour, §6.4) | a tail or a back breaking the film in the shallows, head down: a rooting carp or sucker, catchable as its silhouette |

### 5.3 The tells: where, when, and what a cast does

| tell | areas | hours (weight: late day / dusk / night) | cast rule | effect |
|---|---|---|---|---|
| rise, sip | margin, reeds, pads, lane, open, the Lily Maze | 3 / 3.2 / 1.6 (night: the ring catches the sky's sheen) | within 2.5 m of the last ring, ≤ 3 s after it (built) | wait ×0.5; its fish takes with `takeChance(1, grade)` |
| rise, splash | stones, reeds, pads, inflow, outflow | (shares the rise's weight by its makers) | within 3 m, ≤ 2 s | as the sip |
| swirl | reeds, pads, stones, drop-off, deep, the places | 1.3 / 1.6 / 1.1 | just beyond and to the side it turned toward: within 3 m, ≤ 8 s (built) | its Prize+ fish takes with `takeChance(0.6, grade)` |
| fry spraying | margin, reeds, pads, stones, drop-off, outflow, Under the Span | 1.8 / 1.4 / 0.4 | at the edge the fry burst from (0.55–1.6 m outside the patch, built); the centre spooks it | its makers ×3, favour +0.3 |
| strike | reeds, pads, stones, drop-off, outflow, Under the Span | 1 / 1.2 / 0.8 | within 4 m, ≤ 10 s (built) | its makers ×3, favour +0.6 |
| carp fizz | margin, reeds, pads, lane, open, the Lily Maze | 1.6 / 1.2 / 0.6 | within 2 m of the trail's head; behind the head nothing | the carp ×3, favour +0.2 |
| pin-pricks | pads, the Lily Maze | 1.2 / 1.4 / 0 | within 1.5 m of the patch's centre | the koi ×3, favour +0.2 |
| mud cloud | margin, open, inflow, Under the Span | 1.2 / 1 / 0 | within 2 m of its freshest edge, ≤ 15 s after it blooms; into its middle spooks it | its makers ×3, favour +0.2 |
| stems | pads, reeds, the Lily Maze | 1 / 1.2 / 0.3 (night: a rustle in the lantern's light) | within 2.5 m of the moving stems' edge, ≤ 8 s; into the middle of the bed spooks it | its makers ×3 |
| bed gas | margin, open, deep | 0.5 / 0.4 / 0.3 | — | nothing (a cast there rolls the pool as anywhere) |

"×3" is the built sign tilt, now on the tell's makers (species ids) instead of a family; the sign rule F17 drops it where it
would name a fish (built). Caps alive at once: rise 3, swirl 2, fry 2, strike 1, fizz 2, pin-pricks 2, cloud 2, stems 2, gas
1; in all 2–4 alive by day and dusk, 2–3 at night, at most 6 (built), plus the silhouettes (§6.3).

### 5.4 The water's face: what the lake shows all evening

| read | what the player sees and hears | built by | its area |
|---|---|---|---|
| **the drop-off's shade** | at the Bell Pool's rim the pale water ends in ink along a soft line; along the shelf the margins read paler than the mid water | WC-3, the water shader's depth tint sharpened at the rim and the lip (0 calls) | drop-off |
| **the inflow's seam** | a thread of foam running west from the Sluice Veil's spill, cleaner water over a pale gravel fan; a trickle on the east shore; with the re-dress on, the Veil itself | WC-3: foam in the water shader, the fan in the bed tint, the sound (0 calls; the Veil's card is W9's) | inflow |
| **the outflow's pull** | foam threads slowly converging on the Moss Sluice, the water sliding | WC-3, water shader (0 calls) | outflow |
| **the wind lane** | by day and dusk a smooth slick strip across the ripple, a scum line along its downwind edge; it lies along a different line each evening | WC-3, water shader uniforms from `laneFor(evening)` (0 calls) | lane |
| **reed beds** | four new beds of reeds along the shore, thicker reeds round the rock islands; they twitch when the stems tell plays | WC-3, merged into the `fine` static (0 calls), a twitch term in its own material | reeds |
| **lily beds** | four new beds of notched pads in the margins | WC-3, more instances in the pads' InstancedMesh (0 calls) | pads |
| **the heron** | a heron standing still at a reed edge or in the margins where small fish are, now and then stabbing; it lifts off with a croak if the raft comes within 8 m and lands again elsewhere; gone at dark | WC-3, a small merged mesh (+1 call, high and medium; none on low) | it stands only in a margin or reed spot whose minnow weight this phase is in the top third; it changes no odd |
| **stone and timber** | the piers, pylons, statues, docks, the Gatehouse's wall, the Stair Isle's steps, Root Isle's roots: already built | — | stones |

### 5.5 Honest spawning (WC-2)

A sign is placed as built (a water point 6 m to cast range + 15 m from the raft, depth ≥ 0.2, ≥ 7 m apart, never in mist,
quiet water or the legend's pool), then:

```
area  = areaAt(point)                     (a place's id if inside an owned place)
pool  = the bare-hook pool at that point and phase (§4 steps 4–6, 8; no hook, no tilt)
for each kind k allowed in that area (§5.3) and phase:  P(k) ∝ hourWeight(k, phase) × Σ share of k's makers in pool
       (bed gas: ∝ its weight alone; it needs no maker)
no kind possible → try another point (at most 4 tries a spawn)
its fish (rise, swirl): drawn from k's makers in that pool by their weights, never a giant (built pre-roll, `prerollAt`)
```

So a reed line at dusk throws fry spraying and strikes, the inflow mud puffs and splashy rises, the deep middle little but a
swirl now and then: **the pool's middle reads blank**, as the research says.

### 5.6 Night

Night is read by ear and by the lantern: sips catching the sky's sheen, a slap in the dark, a swirl, the inflow's trickle,
stems rustling, and silhouettes only in the lantern's light (§6.1): crayfish shapes on the stones, a carp nosing the
margin, a perch hanging by a pier; at the Buoy Lights, a long shape crossing a drowned lamp.

### 5.7 Glitter retired on Lake 1 (under the loop; the flag-off game unchanged)

| the glitter | what replaces it | lane |
|---|---|---|
| the glow sign (a fish-shaped light with a comet wake) | the lantern's silhouettes; shapes crossing a drowned lamp at the Buoy Lights | WC-2 |
| gold droplets in rise and strike bursts | water-white spray | WC-2 |
| the gold pulse when a cast lands in a pre-rolled sign | nothing: the bite tells | WC-2 |
| the gold double-dip tell before a real bite | the same double dip, a pale water ring | WC-2 |
| the Glowtide's gold glints on night wakes and ripples | moonlit and lantern-lit water only | WC-3 |
| the legend pool's low gold glimmer | the drowned bell (built decal) and a toll from below as she takes (the roster's sign, a sound) | WC-2 (the glimmer), WC-3 (the toll) |
| the Lily Maze's static candle-amber glow-buds | a koi's own candle fins, faint and warm on its silhouette at dusk (the Candlefin Koi's trait; §6.2) | WC-3 retires the buds, WC-2 draws the fins |

Kept, because they are the lore and not a tell: the Buoy Lights' drowned lamps (the place's dressing), a giant's dark back
turning in the mist, the gold ★ and gold seal on a giant's card after the catch (UI, never on the water).

---

## 6. Silhouettes (C)

### 6.1 Where and when a fish can be seen

- **Clear, calm, shallow water**: depth < 0.45 in the margins, the lily beds' gaps, the inflow's gravel fan, shallow stone
  and timber, a reed line's outer edge, and the Lily Maze's shallow half. **Never** in the deep, open water, the drop-off,
  a wind lane or Under the Span: there the bed is out of sight and the player reads the surface instead [S34, S19].
- **By day and dusk**, fainter at dusk. **At night only in the lantern's light**: within the raft's light radius (8 m,
  Stub ×1.5, the Lantern part +15% a level), any depth < 0.45; and at the Buoy Lights, where a shape may cross a drowned
  lamp's glow (a darker shape over a pale light, any depth there).
- Never in mist, never in quiet water (no new one; those alive drift away), never within 4 m of the raft (they keep off it).

### 6.2 Which fish, and how big

| body outline | fish | how it shows |
|---|---|---|
| deep-bodied | Weeping Carp, Candlefin Koi, Rustfin Sucker | slow, broad; roots and tails in water < 0.3 (a tailing tell and a mud cloud where it digs); the koi's candle fins a faint warm edge at dusk |
| torpedo | Mossback Perch, Overbold Bass, Likely Chub, Milkeye Perch (night, lantern only) | patrols edges, turns sharply; the perch in twos and threes by a pier |
| long | Reedjaw Pike | lies still at a reed or pad edge for long stretches, then darts a few metres and stops |
| small, a shoal | Dusk Minnow, Lampsipper (night) | 3–5 small shapes wheeling together (one silhouette) |
| claw | Gutter Crayfish | at night only, in the lantern's light, a small dark shape on the stones |
| eel | Gloam Eel | at the Buoy Lights only, crossing a lamp |

Never a giant, the legend, the Bridgechain Sturgeon or the Kissmark Trout (they hold too deep). **Each silhouette is one
real fish, pre-rolled**: its species from the bare-hook pool at its point (§5.5's rule, weighted ×1.5 for deep-bodied and
long shapes, which show better), its size score z rolled as a bite there would roll it (the place's and the evening's
favour, no tackle), never above that water's class cap. **It is drawn at the fish's true length** (`data.sizeLength(species,
z)`) and in proportion (its outline's width by body type), softer and less distinct the deeper it is, never smaller.
This reverses, for silhouettes only, DESIGN §25.0.2b's "length can no longer name a species" and §25.6.10's `presentLength`
(by the user's word: "The silhouette should be proportionate to the size of the fish"). A shape and a length say what kind
of fish it might be, as in real water; they never say its name, and no word, colour or detail says more.

### 6.3 How many, how often

At most **4 alive on high and medium, 3 on low** (a shoal counts one); a new one every 12–30 s while fewer are alive and a
visible spot lies 7–28 m from the raft by day and dusk (inside the cast range), or between 4 m and the light's edge at
night; each lives 40–90 s, then sinks out of sight (its shape fades
with depth). They share the sign budget's spirit: a few, never a crowd.

### 6.4 How they move

Steered like a sign's travel (`fishing-signs.js` `travel`: a slowly turning heading, leashed), with a body-type style:

| outline | speed | habits |
|---|---|---|
| deep-bodied | 0.25–0.45 m/s | cruises a lazy line, stops 4–10 s to root (in water < 0.3 its tail breaks the film: tailing, with a mud cloud), turns back along the same route (cruisers patrol [S39]) |
| torpedo | 0.4–0.8 m/s | patrols an edge, turns sharply, holds a few seconds by a pier |
| long | 0 (70% of the time), darts 1.5 m/s for 1–2 s | holds at an edge, faces out |
| shoal | 0.5 m/s | wheels; the shapes keep 0.3–0.6 m apart |
| claw | 0.1 m/s | creeps, stops |

Each keeps to its area (turns back at the edge), keeps 1 m off islands and pillars, and keeps 4 m off the raft. Its shadow
falls on the pale shallow bed, offset by the light (the low sun at late day, the sky at dusk, the lantern at night) and by
depth: closer and crisper in shallow water.

### 6.5 Spooking

- **A cast that lands on it** (within 0.6 m + half its length of its body), or **the raft passing within 4 m**, or a splash
  within 2 m of a still fish: it bolts. A short V-wake and a swirl on the surface (water's tagged wake, built), 1.2 s, then
  it fades into depth. No new silhouette within 10 m for 30 s: **the spot goes quiet** [S31, S44]. The cast's own bite rolls
  the pool as anywhere, its wait ×1.5.
- A cast behind it, or wide of it, is ignored.

### 6.6 The take

- **A moving fish**: the bob lands **ahead of it on its line**: from 1 m + 1.6 m × its speed (m/s) to 3 m + 2.5 m × its
  speed along its heading, no more than 1.2 m to either side, and not on it [S39]. **A still or rooting fish**: 0.8–2 m from
  its head, beside it, never on it or on its tail.
- After the bob settles (0.5–1.5 s) the fish turns to the bait and swims to it, visibly. It takes with
  **`takeChance(0.45, grade)`**: 45% on a hook it takes, 55% on one it likes, 65% on its right bait, **1% on one it won't
  take**. If it takes: the bite is **that fish**, its species and z (the built pre-roll path, `S.prerollSp`, `S.prerollZ`),
  the wait ×0.3, the float's tell as built, then the strike. If not: it noses the bait and turns slowly away (no spook), and
  the cast keeps its normal roll.
- It spends a good bite like any bite; Taper's first bite refuses a common one (built pre-roll rule); Ashwick's comeback
  comes first (§4 step 2).

### 6.7 Hooked, and lost

The hooked fish's shape under the water keeps the silhouette's outline and true length through the play ("a fish you saw
stays the size you saw"); a fish hooked any other way keeps the built night-ink proxy at its class length. If it gets away,
the shape bolts and sinks, big or small, and nothing names it (§7).

### 6.8 How they are drawn (performance)

In the sign instance buffer of `fishing-fx.js`: `MAX_SIGNS` 10 → **20** (each silhouette two quads, the fish and its
shadow; a shoal up to five small quads), one atlas of six soft ink outlines in the sign shader; **0 new draw calls**; four
entities stepped a frame on the CPU. The flag-off `spot-fish` mesh stays hidden in sign mode (built).

### 6.9 What they never do

Never a ring, an outline glow, a marker, a reticle or a highlight round a silhouette; the lead window is invisible; no word;
no percentage. A silhouette is a fish in the water, nothing more.

---

## 7. The lost fish (D)

### 7.1 What the player gets

The line goes slack and the float pops up and settles; a splash and a wake sized by the fish (the hooked shape's length);
the cause's sound (a snap, a thrown hook's flick, the slurp of a fish pulling free); for a Trophy or bigger the low
"got away" sting (built, by class); the shape bolts and fades. **No note, no toast, no card, no name, no species art, no
class, no weight, no size word, no place line, no cause line, no hint, no link.** Something big or small went; that is all.

### 7.2 Every place that told, and what it does now (on a trip; the flag-off game unchanged)

| where (code) | today | now | lane |
|---|---|---|---|
| the got-away note (`ui-af.js` `gotAwayNote`; `ui-hud-v3.js` `showGotAway`, the queue) | a toast (Small–Prize) or a card (Trophy+, legends): the species, "{a} {class}, near {weight}", the cause, "It's still out there, {place}", a tackle hint, "Odds in your log" | **never shown on a trip** (`showGotAway` returns at once; the queue never fills) | WC-3 |
| the play's class stamp (`ui-hud-v3.js` `estimateClass` / `paintPlay`) | a seal and a class word during the play | **none on a trip** | WC-3 |
| the bite's tell word (`ui-hud-v3.js`, the first three of each class: "Prize?") | a class word at the float | **none on a trip**; the float's own tell (the dip's weight and rhythm) stays | WC-3 |
| the Journal (`progression-af.js` `onEscaped`) | Glimpsed page (`seen`), the Got-away list (last 5), `entry.escape`, the Elder Log's generated name, `m.lastAway` (the gear log's pin), `run.flags.gotAway`, `journal:seen` | on a trip: **none of these**; the catalogue's silhouette stays "· · ·"; the Got-away list is not drawn under the loop | WC-3 |
| the logs (`ui-af.js` `oddsView`) | "Marked" lines naming a lost fish's class and weight; the legend's "Wounded twice: +12" | **no Marked line and no wound line** under the loop; the odds cells stay the true odds | WC-3 |
| the loop's ledger (`progression-loop.js` `onEscaped`) | marks a giant lost at its place; stores Ashwick's comeback | **unchanged**, silent | — |
| audio (`audio.js`, `audio-af.js`) | the cause's sound; the sting for Trophy+, Ancient and legends | **unchanged** (it is the water's voice, not a name) | — |
| `fishing.js` `sendGotAway` (fish:escaped) | the species, class, z, length, place, Marked, legendary | **unchanged on the bus** (CONTRACT §13.5): progression needs it; no screen may read it on a trip (the test of §9.4) | — |
| the HUD at the hook (`view.estimate`) | used by the stamp | unused on a trip | WC-3 |

### 7.3 What still happens, silently

- A giant lost at its place becomes a **Marked Fish** (+6 Hold on its next hook, once), as built.
- The legend's **wound** (+6, to +18, kept across trips), as built.
- **Ashwick's comeback**: the next bite at that water whose hook it takes is the same fish, tired (+4 Hold), once; it says
  nothing; the player may guess.
- The lost fish's good bite stays spent.

### 7.4 Rulings this reverses

SPEC §3.5's "when lost: the got-away note names it and its rough size", §3.6's "its note names it", §11's "The got-away note:
unchanged"; DESIGN §25.0 A4 ("Yes, after it's gone") and §25.6.7, under the loop. The user's newer word wins.

---

## 8. Murk's prices (E)

### 8.1 The rule

```
Murk's price = loopCost(base) = nice(base × LOOP.cost.factor)          LOOP.cost = { factor: 3, consumables: 1 }
  base: the price tables of SPEC §4.2–§4.8 and M1 §2.5 as they stand (hold, tackle, maps, lures, raft, home, looks; after M1, tanks)
  a consumable (a tin; a legend's bait): nice(base × LOOP.cost.consumables) = its base
  nice(x): to 5 under 100, to 10 under 1,000, to 50 under 10,000, to 100 above
  applied ONCE, where a price is made: progression-loop's shelfItems (every card of every tab, LANE 4's and 5B-HOME's included)
  and mapCards (the Chart's blots and the shelf's map cards read it); buy() charges the card's price, never a base table
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

### 8.3 The new pacing targets (M1, `clams.mjs --shipped=mossmere --step=5`, the no-passive pacing player)

| check | today's target | the new target | measured *est.* at ×3 (×4) | kind |
|---|---|---|---|---|
| no purchase in the first two trips | — | the first purchase on trip 3 to 5, for the pacing player and for the natural player's median fresh save keeping everything | trip 3, 0.13 h (trip 4, 0.17 h) | **fail** |
| bought by 10 min · by 1 h | 2–5 · 11–19 (SPEC §4.9) | **0–1 · 4–9** | 1 · 7 (0 · 5) | fail |
| the empty shelf | 1.5–4 h | **4.5–7.5 h** (several times today's 2.05 h) | **5.61 h, 91 trips** (7.49 h, 121) | fail |
| each Wick's empty shelf | ±10% of the five-Wick mean | unchanged | — | fail |
| the longest wait for one purchase | ≤ 30 min | **≤ 40 min** | 26 min, Bait Bed II (30 min, Keel II) | fail |
| the first giant comes home | hour 0.4–3 | **hour 0.5–3.5** | 2.2 (2.7) | fail |
| trips, the visit home included | ≤ 6 min | unchanged | 4.3 | fail |
| every place map | ≥ +5% a minute | unchanged (a price does not change a gain) | +22% / +28% / +10% | fail |
| every hold step and raft part pays its way | +3% a minute, or ≤ 2 trips' income | +3% a minute, or **≤ 2 × factor trips' income** (6 at ×3) | Oars I: +1.9%, 2.2 trips (passes the new rule, fails the old) | warn at steps 1–4, fail at 5 |
| the Mossmere's list | p95 ≤ 60, p99 ≤ 75 min | unchanged | 29, 34 | fail |
| **the user's rule** | — | every stray ≤ 1.00% of the bites in every pool the game can draw (each area, place, phase, hook, Wick) | — | **fail** |
| every fish can be caught | — | every Mossmere fish has a hook on M1's shelf (the bare hook included) whose grade is ≥ 1 | — | fail |
| the areas add nothing | — | the blind caster's open-water mix within ±0.5 points of the pre-watercraft mix, every fish and phase | — | fail |
| reading pays | — | the area-reading player earns +5% to +40% a minute over the blind caster at the 1 h and 2 h marks | — | report, warn outside |
| a tin is worth fitting (Mire Worms, on the pacing kit) | +3–25% a minute, ≥ 1.3× its price (SPEC §4.5) | unchanged, with the hook table | — | fail |
| finds (`--step=5c` against `--finds=off`, 2,000 runs) | p50 1.5–4 h and ±10%; p10 ≥ 1.5 h | **p50 4.5–7.5 h and ±10%; p10 ≥ 4 h**; finds' share 8–12% aimed, fail above 15% | — | fail |

*The ×3 and ×4 figures are scratch runs of today's step-5 tree (`--quick`, the price factor added by hand), before the
areas and the hook table: who bites changes with them, so the factor is fitted after the merge (§8.4). At step 2 (the
preview's shelf) ×3 gives 3.31 h and 60 trips, where the preview took 1.10 h and 20.*

**What the user did, re-read.** The sim says the preview's shelf took about 20 trips; the user's "2 runs" are read as two
sittings. At ×3, two trips of keeping everything buy nothing, and two sittings of about an hour each buy about 14 of the 32
items, about a fifth of the clams. To test that reading, WC-1's browser run prints a fresh save's first five trips' tallies
beside the sim's natural player; if the game pays more than 20% above the sim, the gap goes to the lead before the factor is
fitted, because then the user's "2 runs" may have been two trips and the factor would have to be larger.

### 8.4 The proof, and what the integrator re-runs

WC-1 builds it (§9.2): `price(id)` in `pacing()` reads `D.loopCost`, the legend's prize too; the new checks of §8.3; the
`--readers` report. **Once every lane is merged, the integrator runs:**

```
node tools/sim/clams.mjs --shipped=mossmere --step=5            # every §8.3 check
node tools/sim/clams.mjs --shipped=mossmere --step=5 --wicks    # each Wick within ±10%
node tools/sim/clams.mjs --shipped=mossmere --step=5c           # with LANE 5C's finds, against --finds=off
node tools/sim/clams.mjs --quick                                # the full road, its factor pinned to 1 (§8.5): every check as before
```

If the empty shelf leaves 4.5–7.5 h or a fail check fails, **the knob is `LOOP.cost.factor`**, in steps of 0.25 (the
smallest factor whose first purchase is on trip 3 or later and whose empty shelf is in the band); never the hook table's
1% rule, never quiet water (SPEC §3.3) and never a wall (SPEC §3.6). A factor outside 2.5–4 goes to the lead with the run.

### 8.5 The full road (after M1)

Only the Mossmere ships (SPEC decision 39). The full road's pacing run (sim sections 5 and 7) models waters that are not in
the game yet; it **pins the factor to 1** and prints "prices before v8.7 (the Mossmere's factor applies in --shipped)", so
SPEC §4.9's full-road figures stand as a projection. When Sporewood ships, its balancing job re-derives the road with the
proposal of SPEC decision 103: every price ×factor and every water after the Mossmere's value tier ×factor, which keeps the
road after the Mossmere in today's minutes and moves the end by the Mossmere's extra hours (about 46.6 h → 50 h, inside
40–60 h, *est.*).

---

## 9. Tonight's build (F): three lanes

### 9.1 Order, branches, seams with the four lanes already building

- **Branches**: `gw-mvp-wc1`, `gw-mvp-wc2`, `gw-mvp-wc3`, each a worktree off `gw-m1-mvp` (never edit
  `.gw-wt/m1-mvp`). WC-1 commits `src/watercraft.js` (the tables of §2–§3, `areaAt`, `hookGrade`, `hookPool`, `takeChance`)
  first, alone, with its tests; WC-2 and WC-3 cherry-pick that one commit as soon as it lands and build on it.
- **The lead merges**: LANE 4 → 5B-HOME → 5B-TOW → 5C → **WC-1 → WC-3 → WC-2**, then the integrator's checklist (§9.5).
- **LANE 4** (tins and lures, the raft, orders, all 17 biting, the Matriarch a catfish): owns the items and their cards by id
  (§3.10); after its merge WC-1's `loopPool` replaces its `lurePool` call in `fishing.js`; WC-1's shelf lines replace its
  seven `TEXT_LOOP.shelf` lines for the tins and lures (§3.9); WC-1's "fish it suits" replaces the family test in the Hold of
  its items (§3.7); WC-1's **Who bites** block is wired into its gear log entry for a tin or a lure (a render helper in
  `ui-af.js`, three lines in LANE 4's `ui-gear.js` at merge). Its prices pass through `loopCost` in `shelfItems`.
- **LANE 5B-HOME** (the barge's upgrades, prints, gallery): its home cards' prices pass through `loopCost` (they are
  `shelfItems` cards; if a home card is assembled anywhere else, that place calls `loopCost` too). No other seam.
- **LANE 5B-TOW** (the opening, the tow): no seam (no fishing, no price).
- **LANE 5C** (finds): its snag roll is §4's step 1, before everything here; the snag rate, the finds' values and the
  catalogue's finds row are unchanged; its `--step=5c` gate's numbers move to §8.3's band (WC-1 edits the sim; 5C's code
  does not change).

### 9.2 Lane WC-1: the roll, the price and the sim

**Builds (MVP).**
1. `src/watercraft.js` (new, pure, no three.js): `WATERCRAFT.mossmere` with §2.2's geometry, §2.4's weights, hour tilts and
   after-dark rows, §3.2's hook table keyed by item id, `hook.mult [0, 1, 1.6, 2.5]`, `stray {mult: 0.1, cap: 0.01}`,
   `take {rise: 1, swirl: 0.6, sight: 0.45}`, §5.3's makers and hour weights (WC-2 reads them); and `areaAt(geo, probe, x, z,
   {lane})` (`probe = {depth(x, z), fromShore(x, z), islandEdge(x, z)}`, from `world-layout`'s `buildLayout(zone)` once,
   lazily), `areaShares(...)`, `laneFor(evening)` (seeded, deterministic), `areaFactors()` (the §2.4 fit), `hookGrade(speciesId,
   {lure, bait})` (with §3.4's tip), `hookPool(D, pool, {area, phase, lure, bait, wickId})` (§4 steps 5–7 and 11–12, the
   giants' lure share from `LOOP.lures`), `takeChance(base, grade)`, `bitesTable(D, {water, lure, bait})` (the gear log's
   block). A species with no row keeps the built family rule.
2. `fishing.js`, the roll's region only: `castInfo` stores `S.cast.area` (`areaAt` when the cast's place is null);
   `loopPool` calls `hookPool` (and no longer `lurePool`); `rollSpeciesLoop` applies the tell's makers tilt (`rule.makers`,
   `rule.tilt`; the family tilt stays for a rule without makers); `rollBite`'s pre-roll take uses `takeChance` instead of
   "its bait fits"; the comeback waits on a stray (§3.6).
3. `data.js`: `LOOP.cost = {factor: 3, consumables: 1}`, `loopCost(base, {consumable})`, `nice()`; `TEXT_LOOP.shelf`'s seven
   lines (§3.9) and `TEXT_LOOP.log.bites` ("Who bites", "Bare hook", "<1%", "and {n} you have not met"); the items' Hold
   targets as "the fish it suits" (§3.7) where the catch parts read an item's targets on a trip; the gear line "+{n} Hold on
   the fish it suits ({m} you have met)."; re-export `watercraft.js`'s helpers if the sim and tests prefer one import.
4. `progression-loop.js`: `loopCost` at the end of `shelfItems` (every non-consumable card) and in `mapCards`; the legend's
   pay reads her crown map's asked price; nothing else.
5. `ui-af.js`: `bitesBlock(D, rows)` (the gear log's block, pure render; wired into LANE 4's gear log at merge).
6. `tools/sim/clams.mjs`: `poolFor` gains `area` and applies `watercraft.js`'s steps 5–7, 11–12 in §4's order; the trip's open
   water casts land in areas by share (the blind caster) or in the best area for the kit (`--readers`, the reader report);
   the pacing player picks its best lure and its best bait (none, each owned tin), measured; `price()` and the legend's
   prize read `D.loopCost` (the full road pins the factor to 1, §8.5); the checks of §8.3 replace M1's old band, wait, giant
   and pays-its-way checks, and add the user's rule, the every-fish rule, the areas-add-nothing rule and the reader report;
   T104 runs over every place and area × phase × {bare, worms, moss, each lure, spoon + worms, Heartmoss}.
7. `tools/validate-data.mjs`: §2.2's geometry checks; the hook table names only real item and species ids and every Lake 1
   fish; every grade is 0–3.
8. `tools/tests/watercraft.test.mjs` (new) and CONTRACT §14: `areaAt`, `hookPool`, `loopCost`, `S.cast.area`, the rule
   object's `makers`.

**Files it owns**: `src/watercraft.js`, `tools/tests/watercraft.test.mjs`, `tools/sim/clams.mjs`, `tools/validate-data.mjs`
(its checks), and in shared files only these regions: `fishing.js` (`castInfo`, `loopPool`, `rollSpeciesLoop`, `rollBite`'s
species path), `data.js` (`LOOP.cost`, `loopCost`, the words above, the Hold targets), `progression-loop.js` (`shelfItems`'s
end, `mapCards`, the legend's pay), `ui-af.js` (`bitesBlock`).

**Gate (MVP).** Node: `watercraft.test.mjs`: (a) `areaAt` on 24 authored points (one or more per area, the places, the
mist) gives the expected area; `areaShares` sums to 1 and matches §2.1 within ±3 points; (b) the fit: the blind mix within
±0.5 points of `placePool`'s for every fish and phase; (c) **the user's rule**: every grade-0 fish ≤ 1.00% in every pool
(open water × 10 areas × 3 phases, 4 places × their phases, × 12 hooks, × no Wick and Taper), and a worm in every area and
hour leaves the Reedjaw Pike, the Thousandcast Pike and the Hullkiss Lamprey ≤ 1%; a spoon leaves the carp, the koi, the
crayfish, the sucker and the minnow ≤ 1%; (d) the tip: spoon + worms gives the perch 3 and the carp a stray; (e)
`takeChance`: a grade-0 pre-rolled fish takes ≤ 1.2% of 20,000 trials; (f) the comeback waits on a stray and comes on the
next fitting cast; (g) every shelf card's price is `nice(base × 3)` and every consumable its base, `buy` charges the card's
price, `mapCards` agree, the legend pays 1,500 then 600; (h) T104 extended passes; the existing suites stay green
(`loop-places`, `loop-trip`, LANE 4's `loop-4` once merged, with its lurePool unit tests). Sim: §8.4's four runs, every
fail check passing. Browser (one short run, desktop 1280×720 and phone 390×844): the shelf shows ×3 prices and the goal line
"Next: Hold 4 · 90"; with worms fitted, 40 casts at a reed edge (`debug.fishSeed`) bring no pike; the gear log's Who bites
shows the pike "<1%" on worms; a fresh save's first five trips' tallies printed beside the sim's (§8.3).

### 9.3 Lane WC-2: the tells and the silhouettes

**Builds (MVP).**
1. `src/fishing-signs.js`: the kinds `pinprick`, `gas`, `cloud`, `stems` (rules, shows and cast rules of §5.3); `rise`'s two
   forms; each cast rule returns `{makers, tilt: 3}` with its effect; `KIND_WEIGHTS` from §5.3 (read from `WATERCRAFT`);
   `glow` never picked when the loop's water is the Mossmere; caps of §5.3.
2. `src/fishing-sight.js` (new, pure): the silhouettes' rules of §6: visibility (`visibleAt`), the pick (species, z, outline),
   motion by outline (`stepSight`), spook (`spookTest`), the take window (`leadTest`), the take (via `watercraft.takeChance`),
   counts and lifetimes.
3. `fishing.js`, the signs' region only (`prerollAt`, `spawnSign`, `updateSigns`, the cast's landing hit-test, the nibble
   tells): honest spawning (§5.5) through `watercraft.areaAt`; makers-filtered pre-rolls; the silhouettes' spawn, step, cast
   test and hook-up through the built pre-roll path (`S.prerolls`, `S.prerollSp`, `S.prerollZ`); the hooked proxy keeps a
   silhouette's outline and length (`view.proxy = {outline, length}`); no gold pulse on landing, a pale double-dip, no
   "The fry scatter" words; calls `world.stems?.nudge(x, z)` for the stems tell (WC-3's; absent, a ripple only).
4. `src/fishing-fx.js`: `MAX_SIGNS` 20; the new tells drawn in the sign instance buffer (the fizz's travelling froth, the
   pin-pricks' patch, the cloud's plume, the stems' ripples, the gas's thread) and the silhouettes (six outlines in the sign
   atlas, the shadow quad, depth softening, the koi's warm fin edge at dusk); white spray for rise and strike; the legend
   pool's gold glimmer off on Lake 1 under the loop.
5. `src/water-signs.js`: tags for the new tells' ripples and the bolt's wake (the fishing → water protocol; no change to
   `water.js`).
6. Tests: `tools/tests/fishing-signs.test.mjs` (extended) and `tools/tests/fishing-sight.test.mjs` (new); CONTRACT §13.5's
   `sign:*` kinds.

**Files it owns**: `src/fishing-signs.js`, `src/fishing-sight.js`, `src/fishing-fx.js`, `src/water-signs.js`, their tests, and
in `fishing.js` only the signs' and the silhouettes' region (`prerollAt`, `spawnSign`, `updateSigns`, the landing hit-test,
the nibble tells' colours, the update hook). It reads `src/watercraft.js` (WC-1's) and never edits it.

**Gate (MVP).** Node: honest spawning (10,000 spawns per area and phase: a kind appears only where its makers are; fizz never
on the stones, pin-pricks only in pads and the Lily Maze, nothing at night of the cloud or pin-pricks; glow never on Lake 1
under the loop, still on the flag-off build); bed gas has no effect on the roll; each cast rule's hit and miss geometry; the
makers tilt and F17; silhouettes: never where depth ≥ 0.45 or in the deep, open, drop-off or lane, never a giant, the
legend, the sturgeon or the trout; at night only inside the light radius (and the Buoy Lights' lamps); true length equals
`sizeLength(species, z)`; the lead window, the spook disc, the still fish's beside-it window; the take rate by grade over
20,000 trials (45 / 55 / 65 / ≤ 1.2%); ≤ 4 alive (≤ 3 low); none in quiet water or mist; the instance count ≤ 20.
`clarity-perf --loop` (desktop and `--mobile`): draw calls unchanged, `cpuMs` within +15% of the step-1 baseline. Browser
(one short run, desktop and phone): at dusk in the margins a carp silhouette cruises with its shadow; a cast a little ahead
brings it (seeded); a cast on it gives a V-wake and the spot goes quiet; a worm cast ahead of a silhouetted pike is nosed
and refused; a night frame at the Buoy Lights shows a shape crossing a lamp; **no gold on the water at night** (the hue
report's gold count on a night frame ≤ today's dressing-only figure); no ring round any silhouette or tell (a look sheet).

### 9.4 Lane WC-3: the water's face and the lost fish

**Builds (MVP).**
1. **Reeds and pads** (`src/world-art.js`): the four shore reed beds of §2.2 merged into the `fine` static (0 new calls),
   thicker reeds round the rock islands, thinner round the masonry ones; the `fine` static's own material clone with a
   twitch term (up to four twitch points, a uniform array); the four lily beds' pads added to the pads' InstancedMesh (same
   call), with a bob term for the same twitch points; `world.stems = {nudge(x, z, k)}` for WC-2.
2. **The Lily Maze** (`src/world-places.js`): its static candle-amber glow-buds retire under the loop (its pads stay at
   twice the density).
3. **The water's face** (`src/water-shader.js`, `src/water.js`): the drop-off's shade (a sharper pale-to-ink step at the Bell
   Pool's rim and along the shelf's lip, in the depth tint); the inflow's seam (a foam thread) and gravel fan (a paler bed
   tint); the outflow's converging foam threads; the wind lane's slick and scum line from `laneFor(evening)` (uniforms; day
   and dusk); **the Glowtide's gold glints off on Lake 1 under the loop**. 0 new draw calls; the low tier gets the rim, the
   seam and the lane, without the fan's detail if its texture budget is tight.
4. **The heron** (`src/actors-heron.js`, new): a small merged low-poly mesh (+1 call on high and medium, none on low); stands
   at a reed or margin spot in the top third for small fish this phase (from `WATERCRAFT`), stabs now and then, lifts off with
   a croak when the raft comes within 8 m and lands elsewhere, leaves at dark; changes no odd; never within 6 m of the
   mooring or a place's landmark frame.
5. **Sound** (`src/audio-mossmere.js`): the inflow's trickle (spatial), the heron's croak, the stems' rustle, and a low bell
   toll from the Bell Pool's floor as the Matriarch takes (the roster's sign, in place of her pool's gold glimmer), from the
   built synth voices.
6. **The lost fish** (§7.2): `ui-hud-v3.js` (`showGotAway` returns on a trip; no class stamp in the play, no class word in the
   bite's tell, on a trip); `progression-af.js` (`onEscaped` on a trip writes only the legend's wound and the Marked Fish, as
   built for those; nothing else); `ui-af.js` `oddsView` (no Marked and no wound lines under the loop); `ui-screens.js` (the
   Got-away list not drawn under the loop).
7. Tests: `tools/tests/watercraft-face.test.mjs` (new) and `tools/tests/loop-lost.test.mjs` (new); CONTRACT §13.5's note
   (fish:escaped on a trip: no screen reads it).

**Files it owns**: `src/world-art.js`, `src/world-places.js`, `src/water-shader.js`, `src/water.js`, `src/actors-heron.js`,
`src/audio-mossmere.js`, `src/ui-hud-v3.js`, `src/progression-af.js`, `src/ui-screens.js`, `oddsView` in `src/ui-af.js`
(WC-1 owns `bitesBlock` in the same file), `main.js`'s one line creating the heron, and their tests. It reads
`src/watercraft.js` and never edits it.

**Gate (MVP).** Node: the beds and reeds are where §2.2 says and clear of the mooring, the docks, the lanes and the places;
`laneFor` is deterministic per evening and lies in the deep or open water; the heron stands only in margin or reed spots of
the top third, lifts at 8 m, is gone at dark; **the lost fish**: after a loss on a trip (each class, the legend, a giant at
its place, Ashwick), no DOM text contains the species' name, its class word or a weight; the Journal's `seen`, the Got-away
list, the Elder Log and `m.lastAway` are unchanged; the oddsView has no Marked and no wound line; the giant is marked, the
legend wounded and Ashwick's comeback comes, silently; the flag-off game's got-away note still shows (unchanged).
`clarity-perf --loop` (desktop and `--mobile`): world calls ≤ 54 high and ≤ 42 low (the heron +1 on high only), `cpuMs`
within +15%. Browser (one short run, desktop and phone): the rim's shade reads at the Bell Pool, the inflow's seam and fan
read at dusk, the wind lane's slick reads at dusk and lies elsewhere the next evening, reeds twitch on `world.stems.nudge`, the
heron lifts as the raft comes; a lost Trophy (forced) shows only a slack line, a big splash and the sting: no word; the hue
report shows no gold glints on the night water.

### 9.5 The integrator's checklist (once every lane is merged)

1. `fishing.js`: one `loopPool` (WC-1's `hookPool`), LANE 4's `lurePool` not called; LANE 5C's snag before it; WC-2's
   pre-rolls through WC-1's `takeChance`.
2. Every card price through `loopCost` once (a grep for `price:` in `shelfItems`, `gearItems`, the home cards, `mapCards`).
3. LANE 4's seven shelf lines replaced by §3.9's; the gear log shows Who bites.
4. The sim runs of §8.4; fit `LOOP.cost.factor` if needed (§8.4); re-print M1 §6.2's table and SPEC §4.9's M1 view.
5. `tools/check --quick` (or the repo's node gate), `validate-data`, `clarity-perf --loop` and `--home`, the flag-off
   scenario and the v1 golden trace unchanged, `index.html` ≤ 3.3 MB.
6. One browser playthrough of the first three trips on a phone: two trips buy nothing; the third buys Hold 4; a worm brings
   no pike; a silhouette is caught by leading it; a lost fish is a mystery.

---

## 10. Budgets

| what | budget | where |
|---|---|---|
| signs and silhouettes | one instanced draw (unchanged), `MAX_SIGNS` 20, ≤ 4 silhouettes (3 low) | `fishing-fx.js` |
| reeds and pads | 0 new calls (merged `fine` static; the pads' InstancedMesh) | `world-art.js` |
| the water's face | 0 new calls (shader uniforms, the depth texture) | `water-shader.js` |
| the heron | +1 call on high and medium, 0 on low | `actors-heron.js` |
| frame and world calls | inside M1 §2.14: frame ≤ 200 / ≤ 150, world ≤ 54 / ≤ 42 (low has 2–4 free; this design uses 0 there) | `clarity-perf` |
| CPU | `cpuMs` ≤ +15% of the step-1 baseline at every tier; `areaAt` once a cast and a spawn | `clarity-perf` |
| bytes | a few kB of code and tables; `index.html` ≤ 3.3 MB | the build |

---

## 11. What this changes elsewhere

- **SPEC v8.7**: §0 rows 36–37, decisions 93–104, §0.13; §3.2 (Ashwick's comeback), §3.5 (a lost giant), §3.6 (the only
  loss), §3.7 (new: watercraft), §4.4–§4.5 (who a lure and a bait bring), §4.1 and §4.9 (Murk's factor; M1's targets), §8.1,
  §8.4 and §8.11 (words), §9 (bait attract un-parked as the hook table), §11, §12 (this file binding), §16 questions 38–40.
- **M1 revision 8**: §0 (the user's words), §2.2–§2.5, §2.10, §2.14 (boxes), §4 (the watercraft step, tonight), §6.2 and
  §6.4 (the targets), §8 question 1 (superseded).
- **Precedence**: under the loop on the Mossmere this file overrides DESIGN §25.6.1 (the signs), §25.6.3's attract,
  §25.6.7 and §25.0 A4 (the got-away note), §25.6.10 and §25.0.2b for silhouettes (their true length), and CONTRACT §13.5's
  consumers of fish:escaped on a trip. Each lane updates CONTRACT for what it builds.

---

## 12. Questions only the user can answer (each with the default this document builds)

38. **Should a bare hook still catch the hunters** (the pikes, the zander, the trout, the lamprey)? *Default: yes, as today:
    the bare hook is a poor bait for every fish alike, so a fresh save can meet every fish on its list.* The alternative: the
    hunters only on a lure or a strip of fish (Cut Strip is free from any small fish), which is truer, and makes the first
    evenings commons and carp.
39. **How much dearer?** *Default ×3: the first purchase on the third trip, Lake 1's shelf about 5½ hours (23,250 clams).*
    ×4: the fourth trip, about 7½ hours (31,000). Tins and the Heartmoss Ball stay at their prices either way unless you say.
40. **The Lily Maze's koi glow.** *Default: the static glow under the pads goes; a koi seen there shows its candle fins as a
    faint warm edge at dusk, the koi's own body.* The alternative: no glow at all on Lake 1.

---

## 13. After the MVP (could)

- The Thousandcast Pike's follow (its roster sign): at Under the Span, now and then a long shape slides under the float and
  turns away, no bite.
- A grebe diving over fry in open water (perch and zander below); diving birds scattering where a big fish rose.
- A downwind margin richer in carp on a warm evening (the wind's food).
- A habitat tilt inside the places, re-measured.
- The Journal's species page learns the glyphs of the baits and lures each fish has been landed on.
- The road's waters get their own areas and hook rows with their slices.

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
the lamprey's spinner and the Lampsipper are the game's own fish, graded by their roster notes.
