# The far-water Wicks: tales from the other candles out on the water

*Design for the user's idea of 15 November 2026 and the four answers that followed it (§0). Revision 2, 15 November 2026 (the two critics' review, §14).
**Written now, built after M1**: nothing here is in M1, and M1's steps, shelf, budgets, pacing and done-list change in
nothing (`M1.md` §5 carries one pointer line). Binding with `SPEC.md` v8.5 (§0 rows 24–28, decisions 71–80, §5.1 rule 12,
§8.8, §8.9, §13, §16 questions 26–31), `LORE.md` v2.3 (§2.11, §5.3, §6, §9, §10), `WICKS.md` revision 3, `FINDS.md` revision
3, `AQUARIUM.md` revision 2 and `ROSTER.md`. Design only: no `src/` or `tools/` file changed with this document. Every
number is a starting number (a knob with its range) for the build to measure; figures marked *(est.)* are hand estimates
from the committed sim's tables and pool weights (no sim was run for this design), and none may be quoted as measured until
the balancing job's `clams.mjs --tales` (§6.4) prints them.*

---

## 0. The user's words, the four answers, and what binds

> "Could there be other fishermen we meet periodically that give us information on certain species that can increase our
> percent chance to catch? Even tell us about fish we dont know exist or have as a silhouette, super special unlocks you gain
> through information only" (15 November 2026)

The lead asked four questions; **the user's answers (15 November 2026) bind**:

| # | the question | the user's answer | what it means here |
|---|---|---|---|
| 1 | Who are the fishermen? | **"Far-water Wicks"** | other living candles who woke long ago and stayed out fishing (`LORE.md` §5.3: the stool, the lantern and the seven knots at the Rime Sound are theirs). You spot one's lantern across the water and pull alongside (§3) |
| 2 | What do they give? | **"Both"** | **tips** that raise your chance at a species you know (the rise real, its number only in your own logs, never on screen during play and never on the catalogue), **and tales of secret fish** that are not on the catalogue at all until you are told ("super special unlocks you gain through information only") (§4.1, §4.2) |
| 3 | Can a tale reveal a place? | **"Tales can reveal places too"** | a far-water Wick's tale can uncover a hidden spot no map shows. The old rule "maps are the only discovery" is amended by the user: **maps stay the main way** (every water, and every place a chart drew); **tales add four secret places and the secret fish** (§4.3, SPEC §5.1 rule 12) |
| 4 | When is it built? | **"After the Mossmere"** | M1 (the Mossmere and the home barge) is finished first as planned and changes in nothing; this is built after M1, across the waters (§10) |

**The standing taste, binding on every line below.** "Art, atmosphere and fishing those are our key drivers." No way to
fail; every catch feels like a win; missing a meeting is never a loss (a Wick comes again; nothing expires). Automatic
fishing. Never a ring or disc drawn around the raft or the player, or around anything else. Few words: a far-water Wick may
now speak, like Murk, a few short lines (at most 8 words and 36 characters a line, SPEC §8's budget), only when you meet,
never during a bite. Murk stays the only trader and the only shop. No quest log, no text reveal panels, no puzzles: a tale is
a line or two and a mark in the Journal or on the Chart. No real species names; original names only. The TV series and its
presenter are never named. No AI model names anywhere.

**What this design settles** (each with its reason, in the section named): four far-water Wicks, one to each reach (§2); a
lantern at dusk on some evenings, about one meeting an hour of play, never missable for good (§3); three tales at every water,
a tip, a secret and a second tip, and at four waters the secret lives in a told place (§4, §5); a tip's rise, its length,
its stacking and its caps (§4.1); the sixteen secrets and the four told places (§5); the budget and the sim's gate (§6); the
fit with everything built or designed (§7); every new line and its length (§8); the save and the data (§9); its own slice
after the aquarium, then each water's tales folded into the slice that ships that water (§10).

---

## 1. In one breath

Some evenings, as the light turns, a small warm point lifts across the water: a lantern raised on a pole, and under it
another raft with another candle on it, fishing. It is one of **the far-water Wicks**, the few candles who woke long ago,
went out on the water and never came home. Tap the lantern and the raft drifts alongside; the two flames lean toward each
other; it says a line or two, fisher to fisher, and goes back to its line. What it tells you is a **tale**: a **tip** (that
fish you have seen comes to your hook more often here, and lands a little easier, for good), a **secret** (a fish that is on
no page until you are told, and then a hatched silhouette with a small knot by it, waiting to be caught), or, at four waters,
a **told place** (a corner of the water no chart ever drew, which opens out of the mist the next evening). A small inked knot
marks every tale, on the catalogue and on the Chart. If you never sail over, nothing is lost: it comes again another
evening.

---

## 2. Who: the four far-water Wicks

### 2.1 What a far-water Wick is

A window candle that woke and stayed out on the water (`LORE.md` §5.1, §5.3). Four of them are met, one keeping to each
reach of the road, so the cast is small enough that each is somebody: met first at its reach's first water, met again
through that reach, and missed a little when you sail on. They are **not playable**, never aboard the Slow Hearth, never by
the stove, never at the tally. They are fishers: they fish all evening, let every fish go (they have no use for clams and no
one to sell to), and know their waters the way only someone who has fished them for centuries can.

**The reconcile, openly.** `LORE.md` v2.2 §5.3 said of the far-water Wicks: "You never meet one, never hear one, and no
quest leads to one." **The user has chosen to meet them.** What changes: they are **met** (now and then, on the water) and
**heard** (a line or two when you pull alongside). What stays: they are **never sought** (no marker, no quest, no count and
no way to call one; a Wick comes when it has something to tell you); never at home; never playable; and the five playable
Wicks stay five. `LORE.md` v2.3 and the lore brief are amended to match (§13).

### 2.2 Why they never came home

- **Dip** never washed ashore. On the night of the fall it went down with its window into the Mossmere and lay cold on the
  bottom, as the cold ones in the water do (`LORE.md` §5.3 (4)); a long while later it caught again where it lay. It
  climbed onto its window's shutter and has fished the old kingdom since. It never knew there was a cove or a stove to go
  home to. (It is the one proof the player meets that "a cold candle can catch again some day".)
- **Glim, Lean and Farthing** woke by Murk's banked stove in his first years in the cove, while the waters were still
  remembered and no mist lay on them, and went out on the water the way every waking Wick does. Most who woke fished the
  near waters and dozed again; these three kept going down the road until each found the water it would rather be on, and
  stayed. A fisher stays out while the fish are rising, and nothing called them back: home had no one awake in it.

None of them is sad about it. They are where they want to be.

### 2.3 Why they tell you what they know, and what they never are

**Why they tell.** A window candle was set in a window so that whoever was out on the water could find the way. Telling
another small fisher where the fish lie is the same light, given the only way a candle on a raft can give it. And fishers
talk: that is all a tale is. They ask nothing back, ever.

**What they never are** (each a guard in `LORE.md` §10):
- **Not keepers.** They tend nothing. The lantern on the ice by the Lantern Hole is Glim's own fishing lantern, the same one
  it lifts when you meet it: Glim leaves it burning by its hole as a fisher leaves a rod, and on an evening Glim is met at the
  Rime Sound the lantern is on Glim's crook and the hole is dark. It is no lamp kept for anyone; the lamps that burn unfed
  still have no keeper.
- **Not guides.** They never lead you anywhere, escort you, wait for you or follow you. They tell, once, and fish on.
- **Not quest-givers.** No tale asks you to do anything; nothing is owed, checked, counted or rewarded for doing it.
- **Not traders.** No clams, no goods, no swaps. Murk is the only shop.
- **Not rivals.** They never take a fish you could catch, never race you to a place, never fish your places.
- **Not tellers of the story.** They talk of fish, water and themselves; never of the fall, the people, the great lantern,
  Murk's past or the road's end. The story stays told by things (`LORE.md` §9).
- **Never during a bite**, a play, the show, a card, the opening, the tutorial, the tow or a water's first evening.

### 2.4 The four

Each fits the art direction (`LORE.md` §11, the lore brief §11): the playable Wick's egg-shaped body and fat candle head with
its melted rim and hollow face recess holding two small glowing eyes, a cloak or a hood, a living flame on top, no mask, no
horns, no black oval eyes, no grey-blue cloak. **Their light is a pinpoint**: only the player's lantern lights the water;
a far-water Wick's flame and lantern light nothing around them and their reflections are threads, never columns. No new
green light (a living lichen on a cloak is a living thing, not a light).

| | **Dip** | **Glim** | **Lean** | **Farthing** |
|---|---|---|---|---|
| **its reach** | I, the old kingdom: waters 1–4 | II, the cold rim: waters 5–8 | III, the falls and the gate: waters 9–12 | IV, the green heart: waters 13–16 |
| **in one line** | It lay on the bottom a long while and knows who lives down there. | It likes the cold and the quiet, and counts the Long Winter's passing in knots. | It fishes the warm coast for the joy of it, and laughs at every fish, landed or lost. | The cheapest candle in the kingdom, and the one that went farthest. |
| **wax and body** | middling height, worn by the bottom's slow water into a flat oval like a river stone stood on end (broad from the front, thin from the side), the colour of old pearl and faintly banded grey; a small snail shell stuck to one shoulder | small and round, white wax gone faintly blue-white, crazed all over with fine cracks from the cold | tall (the only tall one of the four), honey-gold beeswax, softened by the warm coast so it leans to one side, and leans further toward whoever it is talking to | small and thin, made from the dregs of the orchard wax, remelted: brown-yellow and uneven, its wick crooked |
| **cloak or hood** | a short hood and cape of old sailcloth the colour of wet sand, with dark tide lines | a quilted hood of faded rose, patched, pulled close | a loose, light shawl of faded ochre, knotted at the chest | a scrap of sacking grown over with pale lichen and a little moss: the forest has started on it |
| **flame** | small and very still, river-blue at the root and white above, gold only at its very tip | cold: nearly white with a lavender edge, as if the cold had got into it | rose-gold | small and yellow, with a thread of smoke |
| **its raft** | the shutter of its own window, its iron hinges still on | a sled-raft: planks on two bone runners, so it can be hauled up onto the ice; a tiny three-legged stool on it, the twin of the one by the Lantern Hole | fishing baskets lashed together, big ones and very small ones, like those stacked by the hundred on Rushlight's dam steps | a hatch cover from a sunk barge, poled; a small frog often rides on its edge (an animal, behaving as one) |
| **its kit, and how it fishes** | a short stiff rod of black bog-oak, its line weighted with an old iron key; a slit-lantern of tin (one slit of light). It fishes straight down over the deep, dead still: it knows the floor | a short bone ice rod, its line tied with knots; a lantern on a crook of driftwood (the one left burning by the Lantern Hole, §2.3). It sits on its stool and jigs, for hours, without moving | a long, light cane rod and a small basket creel; a brass lantern with one rose pane. It casts long and light all evening, and every fish goes back with a little laugh of its flame | a pole and a short rod; a paper lantern from the stilt village. It drifts with the current along the snags and poles from trunk to trunk |
| **its sound** (§3.6) | a single water drip, the creak of a hinge | the creak of ice, a clink of bone | the creak of wicker, a crackle of its flame like a laugh | one frog call, the knock of a pole on wood |
| **its greeting** (once, the first time it is met) | "I lay down there a long while." | "Quiet up here. Sit, if you like." | "Another one out! Oh, that's good." | "All this way? Me too." |

**Why these four.** One to each reach gives every era of the road its own far-water Wick, met first at the reach's first
water and through its four, so "periodically" is felt all the way down the road and each Wick is met often enough (about a
dozen times) to be somebody. Each is the voice of its reach: the drowned capital's own candle that lay under it; the cold
rim's ice fisher, whose stool, lantern and seven knots the player has already found (the seven knots are Glim's: one for
each time the Long Winter has passed under its hole; this stays in these docs and in a look, never in a line); on the
falls and the gate, the warm coast's merry fisher among the people's baskets, the one who laughs; and in the green heart the one who went farthest, mossed over. Four keeps
them distinct and the word budget small (§8). A fifth is not added without the user.

**Names.** Plain candle words, as the five are (a dip, a glim, a candle that leans, a farthing dip), checked against the
guards: no "Ashen" or "Ash-", no "Pale", "King", "royal", Soul, Charm, Vessel, Grub, Shade, Husk, Mask or Abyss, and no
clash with a Wick, a water, a place or a fish. **The names are for the docs only**: on screen a name appears nowhere, and
none of the four says its name. On screen each is known by its look, its flame's colour and its small flame glyph. (In these docs "one ink dip" is still the screen's transition; the Wick is always "Dip".)

### 2.5 The art

- **One rig, four looks.** Each far-water Wick is the playable Wick's actor rig (body, head, flame, cloak) with its own wax,
  cloak, flame colour, proportions and props, so no new skeleton or animation set is built. Its few motions: fishing idle
  (its own manner, above), the lantern lifted and lowered, the lean toward you, a turn back to its line; now and then,
  rarely, its rod bends and it lifts a small fish, looks at it and lets it go (pure atmosphere: that fish is from no pool).
- **Four rafts** (a shutter, a sled, a basket raft, a hatch cover) from the raft kit's planks, rope and props.
- **Budget**: one far-water Wick and its raft ≤ 8 draw calls and ≤ 6k triangles on high, ≤ 5 calls on low; its lantern an
  emissive sprite with the water's built thread reflection; no PointLight; no shadow. Built during the day phase of a meeting
  evening (off the bite path, ≤ 30 ms), disposed at dawn. Only one is ever on the water.

---

## 3. Meeting them

### 3.1 Where and when

- **At dusk.** As the evening turns from late day to dusk (SPEC §3.4's 40 s mark), the far-water Wick's lantern lifts across
  the water: a small warm pinpoint raised on its pole, its reflection a thread on the water, the shape of a raft and a
  candle under it. Window candles are lit at dusk; so is this one.
- **Across the water.** At one of its water's **meeting spots** (`arena.meets`, two or three per water: open water at least
  15 m from every place, dock, mooring and mist bank; on a river, in slack water), the one in the sail camera's view, 25–45 m
  from the raft. It stays there, fishing, until the raft goes home.
- **You pull alongside.** The lantern is a tap target (at least 44 px on a phone, with **no ring, disc or outline drawn**:
  only its own light). A tap is a sail, as a tap on a place is: it is taken only while the line is in, and never during a
  bite, a play, the show or a card. The beat (§3.3) starts when the raft is alongside.
- **Never**: on a water's first evening (its mist lift and, at a new water, its tow are that evening's beat), on an evening a
  told place's lift plays, in the opening or the tutorial, at home, on the Chart, in the goal line, or anywhere but on the
  water. Nothing marks a lantern on the Chart or the HUD; nothing counts meetings.

### 3.2 What decides when one comes

**A far-water Wick comes when it has something to tell you.** Each water has three tales, each ready when its moment comes
(§4.4: the first after three evenings there; the secret once the water's list is landed; the second tip once its fish's
place is owned and the water fished a while). An evening at a water is a **meeting evening** when all of these hold:

| rule | value (`LOOP.farwicks.meet`) | why |
|---|---|---|
| the save has ended at least 5 evenings, and the tutorial is over | `fromEvening: 6` | the first trips are the game's own (SPEC §4.9's first trip and 10-minute mark untouched) |
| not the water's first evening; no told place's lift tonight | — | one beat an evening |
| at least 4 evenings ended since the last lantern lifted, anywhere, **tapped or not** (`last` is the evening a lantern lifted) | `gap: 4` | never two lanterns close together, so a player who ignores them is not shown one most evenings; each stays special |
| the reach's far-water Wick has a ready tale: one of this water first, else the earliest ready of another **open** water of its reach | — | a tale never waits on the player coming back to one water; it never strays out of its reach |
| tonight's roll: 1 in 2 on the first and second eligible evenings, certain on the third | `chance: 0.5`, `sureOn: 3` | "periodically", not like clockwork, and never more than three evenings late |

**Readiness is checked once, at the start of the evening** (as the trip begins): a tale that becomes ready during the evening
(a list landed before dusk) waits for a later evening. **The roll** is a hash of (`tales.seed`, `meta.loop.evenings`,
`waterId`), where `tales.seed` is drawn once by `migrateLoop` or `freshLoop` (§9), so a reload at any point of the evening
gives the same `run.meet`, and two saves never share every roll. A water's tales are told in their order (A, B, C) when more
than one is ready, and the water the player is on comes before another water of the reach; a tale of another water is told
only when that water is open, and its told place (if any) lifts on the next evening at its own water (`tales.lift`). The
first meeting with each Wick opens with its greeting. **An ignored lantern**: the tale stays ready and comes back after the
gap and the roll, so a player who never taps sees at most about one lantern every 5–7 evenings *(est.)*, and still loses
nothing.

**How often** *(est.)*: the first meeting comes on about the Mossmere's 6th to 8th evening, about 25 minutes into a fresh
save; about three meetings at each water, spread through its era as its tales come ready; **48 in all, about one an hour of
play** over the 47.6 h road (SPEC §4.9). An M1 save that has already fished the Mossmere a long while meets Dip within its
next three eligible evenings there (the gap permitting), and hears A, B and C at least four evenings apart, never at once.

### 3.3 The beat

| moment | what happens | time |
|---|---|---|
| dusk falls | the lantern lifts at its spot; a soft wooden "tock" carries across the water (the far rod's butt on its raft) and its own small sound (§3.6) | — |
| the tap | the raft sails there as to a place (the built sail and glide; the clock runs while it sails) | the sail |
| alongside | the rafts touch (a soft knock); **the clock stops** (as for a catch's ceremony); the camera eases to a low two-shot, side-on, the two candles facing and the far lantern between them; the two flames lean toward each other; the HUD fades to the hold row and a dimmed Home pill | 0.8 s |
| the greeting (the first meeting only) | its line on the feathered ink pool beside its raft, its small flame glyph before it in its own colour, no name | ≥ 2.4 s, or a tap |
| the tale | one or two lines, the same way, one at a time | ≥ 2.4 s each, 0.3 s apart, or a tap |
| the mark | a small knot inks itself beside the Journal glyph (the quill's sound, built), and fades | 0.8 s |
| out | it lowers its lantern a little and turns back to its line; the camera eases back; the clock runs; **the raft glides back to where it was** (the built glide, the clock running), so a meeting never costs the player their place | 0.8 s, then the glide back |

About 6–9 s alongside *(est.)*, never more than three lines; with the sail out and the glide back (25–45 m each way at
the built 6 m/s, 4–8 s each), about 15–25 s of the player's real time a meeting, all charged to the trip's minutes in the
sim (§6.4). The clock stops only for the beat alongside: the dusk's 20 s phase runs on during both sails. The far-water Wick stays at its spot the rest of the evening,
fishing; tapping it again does nothing but a small dip of its lantern. At dawn it is gone. **Reduced motion**: cuts in place
of the eases, no lean. **The words** follow SPEC §8: one line at a time on the ink pool, 18 px on a 358 px phone on one line,
read aloud by the built live region.

### 3.4 Missing one is never a loss

- A lantern left alone goes when the raft goes home. It counts for the gap (§3.2), its tale stays ready, and the rules of
  §3.2 bring a lantern again on a later evening (after the gap, within three eligible evenings).
- **Nothing a tale gives can be lost or taken back**: a tip is for good; a told secret stays on its page; a told place never
  closes. Nothing expires, nothing is counted against you, and no tale is ever withheld for having been missed.
- A reload during the beat keeps the tale told (it is written in the save as the first line shows) and never replays it; the
  line stays readable on its page (§4).

### 3.5 Why it feels special

It is the only other living flame you ever meet on the water, and it is rare (about once an hour). It comes at the hour the
game is made of, dusk. The meeting is wordless until the line, and the line is fisher's talk in a voice you have not heard
before. Every tale leaves a mark you can see: the knot, a silhouette that was not on the page this morning, or a corner of
the water opening out of the mist. And its payoff is a catch: the next time the tipped fish or the secret comes up, its card
carries the teller's knot (§4.1, §4.2).

### 3.6 Sound

- **The lantern lifting**: a soft wooden tock across the water, panned to it, once, with its own small sound: Dip a single
  water drip and a hinge's creak, Glim a creak of ice and a clink of bone, Lean a creak of wicker, Farthing one frog call and
  a pole's knock.
- **Alongside**: wood (or wicker, or bone runners) touching; the two flames' small flutter, a breath; the evening's music
  thins to its bed.
- **Each line**: a soft crackle of the speaker's flame (as Murk's throat sound goes with his), Lean's a little like a laugh.
- **The mark**: the built quill.
- **Out**: its lantern's creak; the water.
- Inside the −1.0 dBFS master; `audio-render --set=farwicks` renders the four lanterns' lifts and one beat for the gate.

---

## 4. The three kinds of tale

### 4.1 A tip: a species you know comes more often, and lands easier

**What it names.** A fish of the water that is on its catalogue (§7): one you have caught, or one you have seen only as a
hatched silhouette. **Never a giant or a legend**: their share and their coin flip stay the dream, and giants are Taper's
domain among the passives (`WICKS.md` §1.1). A far-water Wick **never names a fish you have not caught**: it describes it,
the way fishers do ("The big-eyed perch rise at dusk."), and the knot on the catalogue shows which card it meant. So the
catalogue's rule (a name only once caught, SPEC §8.8) holds.

**What it does** (`LOOP.farwicks.tip`; at that water only, where the tale was told):

| | the rule | the knob (range) | why |
|---|---|---|---|
| **until you land it** | its bites ×**3** until it is next landed after the tale (kept or let go; once) | `first` 3 (2–4) | the tip is felt: the fish comes to you within an evening or two *(est. p50 1, p95 3 evenings at its place)*, and that landing is the tale coming true |
| **for good** | after that, its bites ×**1.2** | `bite` 1.2 (1.1–1.3) | the knowledge stays: it is a little easier to meet there for good, and nothing expires |
| **and it lands easier** | **+2 Hold** on it, from the tale on, for good | `hold` 2 (1–3) | "how to land it" is part of a fisher's tip; +2 Hold is about +3 to +5 points of land chance at mid odds *(est.)* |

**Where it acts in the draw** (one order, in words and in the shared function, so the game and the sim cannot resolve it
differently). `tipWeights(list, tips, ctx)` (data.js) takes the pool in the sim's form, an array of `[species, w]` pairs
(the form `clams.mjs` `poolFor` builds; the game's `rollSpecies` hands its pool over in the same form), and returns the same
form. The steps, in order:
1. the built weights of the **non-giant** fish, after hours, place, bait, a lure's attract, Taper's first-bite rule and a
   sign's tilt;
2. the multipliers: each tipped fish × its factor (×3 until next landed, then ×1.2); each listed fish still missing × the
   pull's factor (SPEC §5.5 (d)), as built; a fish that is both gets **the larger of the two**, never both (the house rule,
   as with an order and the Old Ledger);
3. **the giant's weight recomputed from the tipped total**, as built: others × share / (1 − share), with Taper's `giantShare`
   ×1.3 and `giantCap` 0.12, so a giant keeps its fixed share (6%, or 2.5%) exactly and a tip never dilutes it;
4. the **biteRule clamp** (below).

A tip never touches `pool.sure` (the pull's sure bite is the missing listed fish alone, and stays so). **Stacking**: one tip
per species, ever (a second tale never names it); two tips at a water are two species.

**The caps.**
- **The bite rule** (`AUTOFISH.biteRule`, the built rule for the bite itself: at most `maxShare` 0.75 for one species, or
  `maxShareItem` 0.85 with a chosen bait or lure, with its named `accepted` cells). A tip never takes a fish's share of any
  drawn pool above **the larger of its untipped share and that cap** (0.75, or 0.85 with a chosen bait or lure):
  `tipWeights` lowers the factor to meet it. Because tips depend on the save, the static `biteCells` check cannot see them, so
  `validate-data --loop` runs `biteCells` once more with every tip of each water applied at its full factor (the worst case),
  against the same `accepted` list (§10.2).
- **The sign rule** (`CATCH_V3.signRule`: at least 2 kinds, no share above 0.8) governs the sign pre-roll alone, and is still
  checked there. **Taper's first-bite rule and the sign rule are judged on the untipped pool**, so a tip never makes either
  wait. So a tip never gives away the species before the reveal.
- **The Hold caps** (`CATCH_V3.buffs`: relics ≤ 3, run buffs ≤ 4, all ≤ 6). The tip's +2 is **knowledge, not a run buff**,
  and it has **its own line** in `catchBuffHold`: `told` ≤ `tip.hold`, persistent, beside the relics' and the run buffs'
  buckets and inside the total `cap` 6: `min(cap, min(relicCap, relics) + min(runCap, run) + min(tip.hold, told))`. So the
  relics (parked under the loop) or a later persistent Hold such as `LOOP.craft` can never quietly swallow it. With Ashwick's
  tired comeback (+4, the run cap) a tipped fish has exactly the total cap, 6. And because it is persistent Hold, **it is in
  the log's figures**, where run buffs never are (`WICKS.md` §2.5): the number is where the user asked for it. **The sim**
  passes the Hold to `landP` as `{ run: comeback, told }` and through the same `catchBuffHold` object path, so the game and
  the sim use one function (a parity test, §10.3).

**How the player knows it took.**
- **On screen, during play: nothing.** No number, no glow, no sign on the float, no word on the HUD.
- **The catalogue**: the tipped fish's card gains the teller's **knot** in its corner (the notch's other corner), caught or
  not. No number, ever, on the catalogue page, its cards, or any enlarged silhouette, tipped or told (SPEC §8.8).
- **The species page** (once caught): the tale's line once more, under its own lore line, in the handwriting of the card's
  notes, with the teller's small flame glyph.
- **The card**: the first landing after the tale carries the teller's knot beside its name, 0.3 s after the class stamp
  (after the list seal, if that shows too), no words. **The knot glyph** is drawn as a loose loop tied in the teller's flame
  colour, never as a knot of the card's measuring cord, so the two cannot be mistaken; checked beside the cord in the user's
  look before the merge (§10.3).
- **The player's own logs**: its odds block and the gear log's "Your odds" show the rise, plainly: "Told: ×3 until landed"
  then "Told: ×1.2 · +2 Hold", with the land chance computed with the +2. The Told line lives only there: the odds block is
  the player's own log (SPEC v8.4), reached from a caught fish's species page, and nothing else on that page or the catalogue
  carries a number.

### 4.2 A secret: a fish on no page until you are told

**What it is.** Each water has **one** (sixteen in all, §5.4): an original fish of that water that is **not on its
catalogue, never in a pool, never a sign, a got-away note or a Journal entry, and never bites, until its tale is told**. The
user's "super special unlocks you gain through information only", literally: the only way to it is the tale. Its seed is a
fish the research saw or lost and never landed (§5.4), so it is not a roster fish: `roster.json`, its 164 fish and
`roster-check.mjs` do not change, and the secrets live in their own table (`SECRETS`, §9).

**Before its tale**: nothing. No silhouette, no space kept for it on the page, no count, no bite; the sim's pools hold it only
under `--tales` and only once told.

**After its tale:**

| | the rule | why |
|---|---|---|
| **where it bites** | at **one spot of its water**: its told place (four waters) or one place bought by map (twelve), in its hours, on any bait. Its hours always share at least one full phase with its spot's kind (a day water's secret bites by day; `validate-data`, §10.2) | a home, like a place's own fish; the tale names the spot in its words |
| **how often** | as **a rare of its spot's kind** (`RARITY_WEIGHTS.rare` × the place's `kindWeight`, 15 at a place) | a secret stays special after the first: a treat, never a farm |
| **its first one** | until first landed, the pull's mercy (SPEC §5.5 (d)): ×min(6, 1 + n) for each evening ended at its water since the tale, never Small from the second, the sure bite at its spot from the ninth; and **the told route** (below) takes the Wick to its spot in its hours | it comes soon after the tale *(est. p50 1–2, p95 4 evenings at its water)*; luck never keeps a told secret from you |
| **and it is tipped** | its tale counts as a tip on it (§4.1's +2 Hold and ×1.2 for good; the pull stands in for the ×3) | the teller told you how |
| **what it is** | **rare** (×5.5), never a giant (★), never a legend; its own plan's size, under its water's giants of that plan (the kin rule) and under its legend's 1.4× rule; it can reach Trophy anywhere and Elder only in old water | the giants stay the episodes' main fish and the top of each ladder |
| **what it sells for** | the value rule (SPEC §4.1), about its water's rare Keeper price at Keeper *(est.)* | a fine fish, not a jackpot: it is special for being told, not for its price |
| **gating** | **never on a list, never a key, never needed by anything**. This is said outright, not left to the freeze: SPEC §5.5 (c)'s "never on a list" clause names **a secret (`SECRETS`)**, and `listFor` (the game's and the sim's, and the sim's `listMark`) leaves every `SECRETS` id out explicitly. (The freeze alone would not do it: for waters 2–16 a secret ships with its water's first edition, and several sit at the day or old water its lake map opens, so the computed rule would put them on the list; tale B waits for the list, so the list could never finish.) The converter marks each secret `secret: true`, so the catalogue test (absent until told), the bite rule's static cells (untold secrets left out), the `--fish` appendix and the aquarium's count all handle it. It counts for its own records like any fish | a secret is a gift, never a requirement |

**The told route** (the game's guidance and the sim's, like the Journal route): while a told secret is unlanded, the Wick
reads its knotted silhouette's place and hour glyphs, fishes its spot when it bites, and waits there for its hour; the
natural and Journal routes resume once it is landed. The player sees only what the catalogue already shows (the place's
heading and the hour glyphs).

**How the catalogue shows it** (SPEC §8.8): from its tale on, it appears **in its group** (its spot's heading; never in the
list section and never in the count), as a **hatched silhouette with "· · ·"** and the teller's **knot** in its card's
corner, with its glyphs (its hour glyphs; the heading is its place). Once caught: its ink drawing and its name; the knot
stays. Tapping its silhouette shows it large with its glyphs, its knot and the tale's line under it in the notes' hand (the
tale is all you know of it). Still **no percentage, count or number on any fish**, its card or its enlarged silhouette.

**Its first card**: the built kicker ("A new name for the journal"), the teller's knot beside its name 0.3 s after the class
stamp, and one touch of its own: the teller's small flame glyph pressed beside the knot, in its colour, so a secret's first
card is the only card that carries who told you. At the tally, the first secret Murk ever weighs earns his line (§8).

### 4.3 A told place: a corner of a water no chart drew

**What it is.** Four in all, **one to each reach** (§5.5): water the chart-makers never saw, because the drowning, or the long years
since, made it after their sheets were drawn (a window that was a window, a glacier's foot that was ice, a hull that was a ship, a tree that was a
tree). A chart is the kingdom's remembering; a far-water Wick who has fished such a corner is its only remembering, and
**its tale lifts the mist as a chart does** (`LORE.md` §2.11, v2.3: a water lifts
for any flame that carries its chart or has fished it, and a told corner for any flame told its way by one who knows it). Maps stay the main way: every water, and every
place a chart drew, is still found only by buying its map, and **no tale ever tells the way to a water** (a water's way is
too long to tell; only a chart holds it).

**Before its tale**: not a place at all. No mist bank of its own, no blot on the Chart, no glyph, no price: it lies behind
what already hides the edge of its water (the rim mist on a lake, the floe and the head's mist on the Sound, the mangroves on
the Salt Gate's yard bank, the Inkwood's curtains of vine and root). A cast toward it is a cast into the edge: the float
sinks into it and comes back, the bait kept and no bite spent, as anywhere at the edge. **The Mossmere builds and draws
byte-identical** until the Low Windows' tale is told (its landmark is not built; its rim mist is as built), so the
Mossmere's identity test holds on every save without the tale.

**After its tale:**

| | the rule | why |
|---|---|---|
| **on the Chart** | the next time the Chart opens, its vignette inks in on its water's sheet (0.8 s, the quill), at its arena site: its glyph, its name and **a small knot where a price would be**. It is never on Murk's shelf and never priced | it was told, not bought |
| **in the world** | on the next evening at its water, the edge parts there as a bought place's mist lifts (SPEC §5.1 rule 7): it thins over 3 s, the camera frames its landmark, and an ink title card names it (1.2 s). A pending lift is saved (`tales.lift`), so a reload replays it | the purchase grammar the player already knows: discovery is a view |
| **what kind** | a **day water** or a **night water** (two of each), never an old water or a crown | so no Elders, no giant and no legend live there: its prize is its secret fish |
| **its good bites** | **1** an evening (Tallow 2, its good bite at every place); after it, quiet as any place | a small hidden spot, room for one good cast; it adds a better bite to an evening, not a longer evening |
| **its fish** | its secret (as §4.2), its kind's fish, open water's fish with commons at half (`LOOP.placeCommon` 0.5, as at every place; SPEC §13 slice 2) | a place like any other, with something of its own |
| **snags** | at the water's built rate, from its water's set (`FINDS.md`): no new find | finds stay each water's eleven |
| **for good** | it never closes and is never undone | nothing expires |

**Where it shows on the catalogue**: among the places, in its kind's order after the mapped places of that kind, under a
heading of its kind glyph, its name and its knot.

### 4.4 The tales of a water

Every water has **three tales**, told by its reach's far-water Wick, in this order (each `after` checked at the start of an
evening, §3.2):

| tale | what | ready when (`after`) | why then |
|---|---|---|---|
| **A** | a tip on one of its **list** fish (a slow or a dear one) | 3 evenings ended at the water | the first evenings are the water's own; the tip then helps finish its list |
| **B** | its **secret** (and at four waters, the told place it lives in) | the water's **list is landed** (the Journal, SPEC §5.5 (c)) and the secret's spot is owned (a told place needs nothing) | the secret is the reward for knowing the water: once you have met every fish on its list, its Wick tells you what is not on it |
| **C** | a tip on a fish of a **place bought later** (its night water or a place's own fish), or a second list fish | that place owned, and 8 evenings ended at the water | a tip about a fish you cannot reach yet would be useless; this spreads the third tale into the era |

The Inkwood's list opens nothing (a Journal seal), and still readies its secret. **48 tales in all**: 32 tips, 16 secrets,
4 of them in told places.

---

## 5. The tales, water by water

### 5.1 The Mossmere (Dip; in full; the first slice after M1)

| tale | what | ready when | its lines (characters · words) |
|---|---|---|---|
| greeting | Dip's, before its first tale | its first meeting | "I lay down there a long while." (30 · 7) |
| **A** | tip: the **Milkeye Perch** (uncommon, dusk and night, open water; on the list) | 3 evenings at the Mossmere | "The big-eyed perch rise at dusk." (32 · 6) |
| **B** | **the Low Windows** (a told place, night water) and its secret, **the Casement Trout** | the Mossmere's list landed | "My window's still under the Gate." (33 · 6) / "A trout lives in it now." (24 · 6) |
| **C** | tip: the **Bridgechain Sturgeon** (rare, Under the Span's own fish) | Under the Span owned, 8 evenings at the Mossmere | "The sturgeon sleeps by the chain." (33 · 6) |

**The Low Windows.** The lowest row of the Sunken Gate's windows, where the capital's window candles stood at evening; dry
when the court surveyors drew the moat, under the water since the drowning. A row of dark arched recesses just under the
surface at the Gate's foot, a trace of weed on their sills (the Mossmere's green stays a trace), and in one an empty iron
candle-ring: Dip's. No light in them: the eight lit slits stay above, their reflections lying over the dark windows. Night
water, after dark only, 1 good bite. Sited by the build along the Gate's drowned face, inside the rim mist, clear of the
four places, the later-sheet places' sites and the Jetty.

**The Casement Trout** (draft name; trout plan, shipped in M1 step 3 with the Kissmark Trout). Rare; night; the Low Windows
only. A slim, dark trout with pale window-pane markings along its flank, four to a side, and an eye that catches the slits'
amber. Typical 50–70 cm, record 125 *(the kin and legend rules hold: no trout giant at the Mossmere; the Matriarch's 260 is
over 1.4 × 125)*. A Keeper sells for about 60 clams *(est.)*. Its journal line: "It keeps to the old windows under the Gate
and watches the water, as if it were waiting for someone." Play: sulker (it backs into its window). Seed: a cold-loch char,
seen and never landed.

### 5.2 The Rime Sound (Glim; in full; with slice 6)

| tale | what | ready when | its lines |
|---|---|---|---|
| greeting | Glim's | its first meeting | "Quiet up here. Sit, if you like." (32 · 7) |
| **A** | tip: the **Bellrope Cod** (rare, the Fjord Floor; on the list) | 3 evenings at the Sound | "Long cod lie deep and bite slow." (32 · 7) |
| **B** | **the Ice Foot** (a told place, day water) and its secret, **the Snowmelt Cod** | the Sound's list landed | "The ice went back. Water wells up." (34 · 7) / "A cod comes to taste it, by day." (32 · 8) |
| **C** | tip: the **Coalwing Skate** (rare, the Lantern Hole's fish) | the Lantern Hole owned, 8 evenings | "Mine, that stool. Skates at night." (34 · 6) |

Tale C is where the player learns, in three words, whose stool sits by the Lantern Hole; the rest (the lantern on its crook,
the knots on its line) is in a look.

**The Ice Foot.** At the head of the Sound the glacier has drawn back since the sea-road wardens drew their sheet, and at its
foot meltwater wells up into a round pool of fresh water lying on the salt (`WORLD.md` §5, v2.3's line). An arch of old blue
ice over the pool; by day the light comes through the ice (daylight, no new light); at night the head's pale glow-moss. Day
water, 1 good bite.

**The Snowmelt Cod** (draft; cod plan, with slice 5's fish lane). Rare; day and dusk; the Ice Foot only. A deep-bodied cod
with huge pale eyes and a skin of fine silver frost-flecks, cold to look at. Typical 70–98 cm, record 175 (under the Long
Winter's 1.4× rule). A Keeper about 475 clams *(est.)*, the Sound's rare Keeper price. Journal: "It comes up only where the
snow comes in, to taste what the mountain sends down." Play: runner. Seed: a big-eyed deep fish caught by others on a long
line and never named.

### 5.3 Lanternroot Lagoon (Farthing; in full; with slice 8)

| tale | what | ready when | its lines |
|---|---|---|---|
| greeting | Farthing's | its first meeting | "All this way? Me too." (21 · 5) |
| **A** | tip: the **Harbourdrum Grouper** (rare, night, the Sunken Orchard; on the list) | 3 evenings at the lagoon | "The big grouper feed after dark." (32 · 6) |
| **B** | the secret, **the Hideaway Ray**, at the Bright Flats (day water; it comes with the lake map) | the lagoon's list landed | "Something's under the bright flats." (35 · 5) / "Only its eyes show, if anything." (32 · 6) |
| **C** | tip: the **Stiltshadow Shark** (rare, the Stilt Shrine's night fish) | the Stilt Shrine owned, 8 evenings | "Sharks under the stilts, after dark." (36 · 6) |

**The Hideaway Ray** (draft; disc plan, with slice 3's Sporewood fish). Rare; day and dusk; the Bright Flats only. A round
sand-coloured ray dusted with darker freckles, its two eyes raised on little turrets, the only part of it you ever see first.
Typical 55–76 cm, record 135 (the lagoon's giants are perch, shark and catfish; the Silver Regent's 310 is over 1.4 × 135).
A Keeper about 8,000 clams *(est.)*. Journal: "It lies under the flats with only its eyes out, and has outwaited every tide
so far." Play: sinker (it clamps to the sand). Seed: a flats stingray, seen and never landed.

### 5.4 The sixteen secrets and their tips (drafts, confirmed when each water's sheet is scheduled)

Names are drafts in the roster's voice (plain English compounds, generic fish words), to be confirmed with each water's slice,
as the giants' lures are (SPEC §4.4). Every secret is rare, on a plan its water's slice already ships (SPEC §13 rule 2), and
sized under its water's giants of that plan and under its legend's 1.4× rule. **Each is a different kind of fish from the
last**: twelve plans over the sixteen, no plan carries more than three, and no two secrets in a row share one, so every tale
B is a new shape on the page, not the same reward again (the plans in order: trout, catfish, sturgeon, eel, cod, puffer,
angler, flatfish, eel, gar, catfish, shark, sturgeon, pike, disc, catfish). A day water's secret bites by day; a night
water's by night. The seeds are design notes and never ship.

| # | water · teller | tale A (tip; a list fish) | the secret (draft) · plan | its spot (kind) · hours | what it is | tale C (tip) | seed (design note) |
|---|---|---|---|---|---|---|---|
| 1 | the Mossmere · Dip | Milkeye Perch | **Casement Trout** · trout | **the Low Windows** (told; night) · night | keeps to the drowned windows and looks out | Bridgechain Sturgeon (Under the Span) | a cold-loch char, seen |
| 2 | Sporewood Pools · Dip | Downcast Catfish | **Overland Catfish** · catfish | the Veilwater (night) · night | crosses from pool to pool over the moss when nobody looks | Nightbloom Carp (the Veilwater) | a walking catfish, used as bait |
| 3 | Glasswater Vault · Dip | Pilgrim Salmon | **Shelfback Sturgeon** · sturgeon | the Mirror Nave (old) · dusk, night | sleeps on the crystal shelves, its back plates like cut glass | Vesper Gar (the Broken Hymnal) | a deep-lake sturgeon, seen |
| 4 | the Pallid Deep · Dip | Candlewake Sturgeon (the Chain Garden) | **Halfseen Eel** · eel | the Bier Barge (day) · day, dusk | nobody has seen all of it at once | the Clapper (the Sunken Belfry) | a deep-sea eel, hooked and lost unseen |
| 5 | the Rime Sound · Glim | Bellrope Cod | **Snowmelt Cod** · cod | **the Ice Foot** (told; day) · day, dusk | comes up only where the snow comes in | Coalwing Skate (the Lantern Hole) | a big-eyed deep fish, caught by others, unnamed |
| 6 | the Thin Water · Glim | Slipwhisker | **Thornjacket Puffer** · puffer | the Marsh Lanes (day) · day, dusk | swells into a ball of thorns, but only when lifted | Blotback Catfish (the Lamp Ford) | a freshwater pufferfish, seen |
| 7 | the Last Light · Glim | Starbar Lancer (the Lamp Rock) | **Weedwalker** · angler | the Drift Line (old) · dusk, night | a fist of drifting weed that walks on its fins | Ambersickle Tuna (the Beam) | a weed-drift frogfish, seen |
| 8 | Pyrefall Gorge · Glim | Lampspot Snakehead | **Almsplate Flounder** · flatfish | the Alms Steps (day) · day, dusk | lies flat as an alms plate under the temple steps | Almsfed Carp (the Alms Steps) | a river sole that lies under stones, seen |
| 9 | the Waxen Reef · Lean | Nebula Trout (the Chimney Gardens) | **Chimneysweep Eel** · eel | the Chimney Gardens (day) · day, dusk | lives in a drowned chimney | Cabin Grouper (Lamp Row) | a reef eel, caught by others |
| 10 | the Thunder Stair · Lean | Cocoon Sleeper (the Step Pools) | **Flagback Gar** · gar | the Step Pools (day) · any | a row of small flags down its back, and no hurry | Swallowtail Catfish | a finlet-backed old river fish, seen |
| 11 | Rushlight Fen · Lean | Foamnest Pike (the Reed Lanes) | **Hiccup Catfish** · catfish | the Night Lanes (night) · night | squeaks when lifted, like a laugh held in | Reedwalker Catfish (the Night Lanes) | a squeaking catfish, seen |
| 12 | the Salt Gate · Lean | Longlash Ray | **Broadbrow Shark** · shark | **the Ribs** (told; night) · night | its head is wider than it is long | Dusk Drummer (the Harbour Stump) | a wide-headed small shark, caught by others |
| 13 | Lampmoss Slough · Farthing | Spotmail Gar (the Straight Canal) | **Ladlenose Sturgeon** · sturgeon | the Straight Canal (day) · day, dusk | its nose is a ladle; it sieves the canal | Tailwatch Mudfish (the Lock Gate) | a paddle-snouted river fish, seen |
| 14 | the Siltway · Farthing | Snufferjaw (the Seam) | **Driftlog Pike** · pike | the Seam (day) · day, dusk | lies along the sunk timbers, as still as one of them | Tallyside Catfish (the Lamp Bar) | a log-still river hunter, seen |
| 15 | Lanternroot Lagoon · Farthing | Harbourdrum Grouper | **Hideaway Ray** · disc | the Bright Flats (day) · day, dusk | buried with only its eyes out | Stiltshadow Shark (the Stilt Shrine) | a flats stingray, seen |
| 16 | the Inkwood · Farthing | Gourdcracker (the Windfall) | **Woodrasp Catfish** · catfish | **the Hive Hollow** (told; day) · day, dusk | rasps at the drowned orchard's wood, a mouthful a year | Starback Ray | an armoured wood-eating catfish, seen as bait |

**The Last Light's secret** was the Standing Ribbon in revision 1 (the upright ribbon seen beside the raft at the Unlit Mile,
told and then catchable). `ROSTER.md` §6 keeps that ribbon as atmosphere only, never hooked, and this design does not amend
ROSTER, so the Weedwalker takes its row. The payoff ("you saw it; now you are told") is offered to the lead as an option: with
ROSTER's atmosphere line amended (the ribbon stays a sight at the Unlit Mile; a told Standing Ribbon is hooked at the Drift
Line), it can return on the eel plan, where it would be the road's third eel and not next to another (§14).

Tale A often names a fish the sim already finds slow to land (the Candlewake Sturgeon, the Starbar Lancer, the Snufferjaw:
SPEC decision 21), so the tips land where the player needs them.

### 5.5 The four told places

| place | water · teller | kind | why no chart shows it | its landmark | hidden before by | its fish |
|---|---|---|---|---|---|---|
| **the Low Windows** | the Mossmere · Dip | night | the Gate's lowest windows were dry when the court surveyors drew the moat | a row of dark arched windows just under the water at the Gate's foot; one holds an empty iron candle-ring | the rim mist at the Gate's foot | the Casement Trout |
| **the Ice Foot** | the Rime Sound · Glim | day | the glacier has drawn back since the sea-road wardens' sheet; meltwater wells up at its foot | an arch of old blue ice over a round fresh pool, lit through the ice by day | the floe ice and the mist at the Sound's head | the Snowmelt Cod |
| **the Ribs** | the Salt Gate · Lean | night | an unfinished hull up the yard, beyond the slipway, that only the night flood reaches: a ship, not water, when the harbour-masters sounded | the great curved ribs of a hull on its stocks, the tide pouring in between them after dark (the Salt Gate's tide turns as night falls) | the mangroves on the yard bank | the Broadbrow Shark |
| **the Hive Hollow** | the Inkwood · Farthing | day | a drowned orchard tree gone hollow: the orchard plan shows trees, not water | a hollow trunk standing in the black water, a wild bees' hive high in what is left of its crown; the bees hum at dusk | the curtains of vine and hanging root | the Woodrasp Catfish |

Their B lines, drafts with the two waters' slices: the Ribs, "There's a hull the night tide fills." (36 · 7) / "Something
wide-headed hunts inside." (35 · 4); the Hive Hollow, "A hollow tree, and bees, still." (31 · 6) / "Something gnaws its
roots below." (32 · 5). **Why these four**: one to each reach, so every far-water Wick has one; two day and two night; each
is water the drowning made (the design's reason no chart could show it); two sit at waters whose ladder has room after
them (the Salt Gate, before Lampmoss Slough's step from tier 269 to 608; the Inkwood, with no water after it) and two at
waters the sim must check closely (the Mossmere and the Rime Sound, §6.2). Each is "the only place you ever ..." in a small
way: the dark windows under the lit slits, daylight through the ice, a ship you can sail inside, and bees close by.

---

## 6. The economy and the balance

### 6.1 What each tale is worth *(est.)*

From the sim's pool weights (`RARITY_WEIGHTS` per species: common 70, uncommon 24, rare 6; a place's commons ×0.5, its kind's
fish ×2.5, its own fish ×3 × 0.5) and SPEC §4.1's values, at the water where it is told:

| tale | its effect on clams a minute there, once told | notes |
|---|---|---|
| a tip, until landed (×3) | a windfall of about one fish | the tipped fish within an evening or two; the pull's windfall precedent (SPEC §4.9: ≤ 15 min of income an era) |
| a tip, for good (×1.2, +2 Hold) | **+0.3 to +1%** | an open-water list fish at the low end; a place's rare at the high end |
| a secret, after its first landing | **+0.2 to +0.6%** | a rare at one place (5–6% of that place's bites) |
| a told place (1 good bite) | **+1 to +2%** | its one bite is a place's (commons halved, its secret, its favour) in place of a quiet or open-water bite |
| a water's three tales together | **+1.5 to +3%** (+2.5 to +4% at a told place's water) | arriving from about its 6th evening to the middle of its era |

The road's end *(est.)*: tales come early in each era, so the shelf empties about **1–2% sooner**, about 46.6–47.2 h against
47.6 h (no passive), and the five Wicks move together (§6.3).

### 6.2 The budget, and why it holds

The five Wicks' balance (`WICKS.md` §3.5: hours to buy everything within ±5% of their mean, each within ±10%) and SPEC §4.9's
pacing hold because tales are **the same for every Wick** and **small at every water**: a tip moves one fish's share, a secret
is one rare at one spot, a told place is one good bite. The two places it could bite, named plainly:

1. **The 1 h mark** (SPEC §4.9: 234 clams a trip against a top of 240). By hour 1 a fresh save has Dip's tale A and often
   the Low Windows (*est.* +1.5–2.5%, about 237–240). Tight: the gate checks it.
2. **The ladder** (SPEC decision 10: on the day a lake map is bought, its open, day and old water pay ≥ 1.05× the water before,
   fully mapped; today 1.07–1.11). A water fully told pays a little more, and the next water's tales come only from its 6th
   evening, so the ratio narrows by the tales' gain (*est.* 1.5–4%). Where today's margin is smallest, or at a told place's
   water (the Mossmere, the Rime Sound, whose 1.20 floor after the Pallid Deep has a calibrate margin of only 0.4 points,
   SPEC §14 risk 30), it could fall under its floor. The gate checks each rule in a named tale state on both sides (§6.4
   gate 2), the knobs are set to hold it, and if the knobs run out there is a named last resort.

### 6.3 The five Wicks

| Wick | how the tales touch its passive | effect *(est.)* |
|---|---|---|
| the Wick (Curious) | a secret's first landing is a first (a new kind) and sells ×1.4; its first Prize, Trophy or Elder too | sixteen more firsts on the road: a few hundred clams early, thousands late; about +0.1% |
| Taper (Long Reach) | secrets are rare, so they are in its first-bite pool at their spot; a tip acts after its rule (judged untipped, §4.1) | Taper may land a told secret a little sooner; about +0.1% |
| Stub (Moth-Bright) | none | — |
| Tallow (Broad Back) | its good bite at every place gives a told place 2 good bites | about +0.2% at four waters |
| Ashwick (Burns Back) | a lost secret or tipped fish comes back once, tired, as any ordinary fish; the comeback's +4 and a tip's +2 reach the total cap 6 together | none measurable |

The spread between the five stays inside ±1% of today's *(est.)*, well inside the ±5% gate.

### 6.4 The sim requirement (`clams.mjs --tales`; the balancing job's, which owns `tools/sim/clams.mjs`)

This design edits no tool. The balancing job adds:

- **What it models**: `LOOP.farwicks`, `LOOP.tales` and `SECRETS` from `data.js`; the cadence of §3.2 (the save's evening
  count, readiness at the start of the evening, the gap counted from every lantern lifted, the seeded roll and the sure
  third evening, the reach rule, the tales' triggers on the run's own Journal and purchases); **the pacing player taps every
  lantern**, and the sim charges the sail out, the beat's real seconds and the glide back to the trip's minutes (about
  15–25 s a meeting *(est.)*; the beat stops only the water clock); the cost to the pacing player's dusk bites is reported;
  tips in `poolFor` through the same `tipWeights` the game calls, in §4.1's order (non-giant weights, the factor or the
  pull's, the giant recomputed, the biteRule clamp); the told Hold in `landP` as `{ run, told }` through `catchBuffHold`; a
  secret in its spot's pool once told, with the pull until first landed, and **the told route** (§4.2) in the pacing
  player's routing; a told place as a place of its kind with 1 good bite (Tallow 2), in the natural, Journal and told
  routes. `listFor` and `listMark` leave every `SECRETS` id out.
- **The sim's helpers are save-free** (the sim has no `meta.loop`, as with `wickSlots` and `loopSlots`): it calls numeric
  forms through `fromData`: `talesReadyAt({ evenings, listLanded, owned }, D, waterId)`, `meetRoll(seed, evening, waterId,
  wait, gap)` and `tipFactor(told, landed)`; the game's save forms (§9) are thin wrappers over the same functions, with a
  parity test.
- **Gates** (all must pass; tales off, everything byte-identical):
  1. the full pacing run with tales **within −5% and 0% of the tales-off run's own end** (47.6 h), the longest wait ≤ 90 min,
     and every SPEC §4.9 mark inside its target (**the 1 h mark ≤ 240 clams a trip**), with the meetings' total minutes
     counted and reported;
  2. section 6's ladder rules at every water, each in a stated tale state on both sides: **on the map's day** (≥ 1.05; today
     1.07–1.11, SPEC §4.9), the water before **fully mapped and fully told** against the new water
     **untold**; **fully mapped** (≥ 1.2; the Rime Sound's 1.20 floor after the Pallid Deep included), both waters **fully
     told**, and again both **untold**; no set of a water's places (told places included) paying more than the next water
     fully mapped; and "a new water is the best water from the day it opens";
  3. at any water, all its tales together add **≤ +3%** clams a minute (≤ +4% at a told place's water);
  4. `--tales --wicks`: the five Wicks' hours within ±5% of their mean and each within ±10% (`WICKS.md` §3.5);
  5. the anti-grind, let-go and bait checks (sections 2 and 2b) unchanged within their noise; the lists' p95 (section 7)
     never slower; the pull's windfall unchanged;
  6. a told secret's first landing within **4 evenings at its water** (the told route on) for the slow player in twenty; a
     tip's ×3 ends within 3;
  7. no drawn pool with a tip has a fish above the larger of its untipped share and **biteRule's** cap (0.75, or 0.85 with a
     chosen bait or lure), every pool, every phase; and the sign pre-roll still meets signRule's 0.8;
  8. `--shipped=mossmere` with tales off, byte-identical (M1 has no tales: the M1 check);
  9. **`--shipped=mossmere --tales [--wicks]`** (the arc the slice actually ships, if it ships while the Mossmere, or the
     Mossmere and Sporewood, is the whole game: SPEC §13's rule that the sim runs on what ships): `M1.md` §6.2's marks
     inside their bands (the first trip and the first ten minutes unchanged, since no lantern comes before the 6th evening;
     the 1 h mark within +3% of M1's measured 268 clams a trip), the Mossmere list's p95 never slower than 29 min (tale B
     waits for the list, so it must never slow it), and the empty shelf within −5% and 0% of 2.04 h, and each Wick's within
     −5% and 0% of its own.
- **Reports**: meetings per era and per hour; the evening of the first meeting (median and p90); the share of evenings with a
  lantern (and with an ignoring player); tales told by hours 1, 5, 20 and 40; each tip's and each told place's gain at its
  water; the secrets' share of all clams (*est.* about 0.3%); the ladder ratios with and without tales, in each state of
  gate 2; the meetings' minutes and their cost in dusk bites.
- **Knobs, in order**: `tip.bite` 1.2 → 1.1; `tip.hold` 2 → 1; a told place's good bite taken out of open water's count
  (so it moves a bite rather than adding one); a told place's favour to open water's; `meet.gap` 4 → 6; a told place's tale
  after its water's night map. **If the knobs run out** (the 1 h mark or a ladder floor still fails): the balancing job's
  `clams.mjs --calibrate --tales`, with the value tiers of SPEC §4.1 and Appendix A re-derived by that job (they are its
  lane, not this design's); or, by the lead's ruling, a water's tale C held until the next water's map is owned. **Never a
  knob**: a secret never bites before its tale; no number on screen; no fail; the knot.
- **`catch-v3.mjs`**: a `--tales` row per tipped species, its land chance with and without the +2 at each class on its
  water's arrival tackle *(est.* +3 to +5 points at mid odds).

---

## 7. Fit with everything built or designed

| system | how the tales fit |
|---|---|
| **the catalogue** (SPEC §8.8) | a secret is absent until told, then a hatched silhouette with "· · ·" and a knot in its group (never in the list or its count); a tipped fish's card gains a knot; a told place is a heading among the places, with its knot; **still no percentage, count or odd under any fish**, its card or any enlarged silhouette (tipped or told); the finds row is unchanged |
| **the Chart** (SPEC §5.4) | a told place inks in on its sheet with its glyph, name and a knot, never a price; nothing of it is drawn before its tale ("nothing unowned is drawn" holds: an untold place is nobody's); no lantern, Wick or meeting is ever on the Chart |
| **the three keys** (SPEC §5.5) | no tale is a key and no key needs a tale; a secret is never on a list, by name in SPEC §5.5 (c)'s clause and in `listFor` (not by the freeze, which would not cover waters 2–16, §4.2); a tip on a missing listed fish only speeds the list (the larger of it and the pull); no tale opens a water |
| **the five passives** (`WICKS.md`) | §6.3: the Wick's firsts include a secret's first; Taper's never-common first bite is judged before any tip and includes secrets at their spot; Tallow's +1 good bite holds at a told place; Ashwick's comeback and a tip reach the total cap together; Stub is untouched |
| **finds** (`FINDS.md`) | a told place snags at the built rate from its water's set; no tale names a find; no find counts for a tale; the 1% rule and the eleven per water stand |
| **the aquarium** (`AQUARIUM.md`) | a secret is rare, so it is eligible for the Well and swims in its water's room; a told place adds nothing to the rooms. With sixteen secrets the eligible kinds are 109, so the top tank (96) no longer holds one of every kind (listed for the lead, §13) |
| **giants and legends** | never tipped, never secret, never at a told place; their shares, their hours, their coin flip and the giants' page unchanged |
| **saves** (§9) | one new block, `meta.loop.tales`, and the trip's `run.meet`; the shared Journal holds a landed secret's entry; the flag-off game ignores it |
| **the words** (§8) | every new line is ≤ 8 words and ≤ 36 characters, at most three a meeting, never during a bite |
| **hidden odds** (SPEC decision 62) | a tip's number shows only in the player's logs; nothing in the play, the HUD, the card or the catalogue carries it |
| **no fail** (SPEC §3.6) | a missed lantern loses nothing; nothing expires; a told secret has the pull; a told place never closes |
| **Murk** | still the only trader and the only shop; never present at a meeting; two lines of his own about it (§8) |
| **the story** (`LORE.md`) | a water lifts for any flame that carries its chart or has fished it, and a tale is a remembering told (§2.11); Dip is a cold candle that caught again (§5.3 (4)); the Rime Sound's stool and seven knots are Glim's; the ending is untouched (no tale on a water's first evening, none at home, and the closing film never shows a far-water Wick) |
| **the art** | pinpoint lights only; no ring or disc; no new green light; the Mossmere byte-identical until its told place is told |

---

## 8. Words: every new line

The budget (SPEC §8.9, new): a far-water Wick's line is at most **8 words and 36 characters** (one line at 18 px on a 358 px
phone), one at a time, **at most three a meeting** (a greeting and two tale lines), each said once; it names no fish you have
not caught, carries no number, speaks of fish, water and itself only, and **gives the player no instruction**: a tale line
is a fisher's observation, never a command (fishing is automatic, and nothing in a tale is a thing to do). An invitation
such as Glim's "Sit, if you like." is not a command. Every line is a `TEXT_LOOP` entry, scanned by the
build (length, words, numbers, the guards' word list, a lore list: no "kingdom", "people", "fall", "great lantern",
"Murk", "hearth", "human"; and an imperative list for tale lines: no line opens with a bare verb such as "Go", "Look",
"Listen", "Let", "Try", "Wait", "Cast" or "Follow").

| who | when | line | characters · words |
|---|---|---|---|
| Dip | its first meeting | "I lay down there a long while." | 30 · 7 |
| Glim | its first meeting | "Quiet up here. Sit, if you like." | 32 · 7 |
| Lean | its first meeting | "Another one out! Oh, that's good." | 33 · 6 |
| Farthing | its first meeting | "All this way? Me too." | 21 · 5 |
| Dip | the Mossmere, A | "The big-eyed perch rise at dusk." | 32 · 6 |
| Dip | the Mossmere, B | "My window's still under the Gate." · "A trout lives in it now." | 33 · 6 · 24 · 6 |
| Dip | the Mossmere, C | "The sturgeon sleeps by the chain." | 33 · 6 |
| Glim | the Rime Sound, A | "Long cod lie deep and bite slow." | 32 · 7 |
| Glim | the Rime Sound, B | "The ice went back. Water wells up." · "A cod comes to taste it, by day." | 34 · 7 · 32 · 8 |
| Glim | the Rime Sound, C | "Mine, that stool. Skates at night." | 34 · 6 |
| Farthing | Lanternroot Lagoon, A | "The big grouper feed after dark." | 32 · 6 |
| Farthing | Lanternroot Lagoon, B | "Something's under the bright flats." · "Only its eyes show, if anything." | 35 · 5 · 32 · 6 |
| Farthing | Lanternroot Lagoon, C | "Sharks under the stilts, after dark." | 36 · 6 |
| Lean | the Salt Gate, B (draft) | "There's a hull the night tide fills." · "Something wide-headed hunts inside." | 36 · 7 · 35 · 4 |
| Farthing | the Inkwood, B (draft) | "A hollow tree, and bees, still." · "Something gnaws its roots below." | 31 · 6 · 32 · 5 |
| Murk | the first tally after the first meeting with Glim (the first far-water Wick he knows: Glim, Lean and Farthing woke by his stove; Dip he never met, so Dip's meetings never trigger it), once | "Still out there, that lot? Good." | 32 · 6 |
| Murk | the first secret sold, once | "Never weighed one of those. Who told you?" | 41 · 8 (Murk's lines keep §8.6's own length) |

**Also new on screen**: the four told places' names, on the Chart and on their title card once ("the Low Windows", "the Ice
Foot", "the Ribs", "the Hive Hollow"); each secret's name once caught, and its one journal line (the roster's style, one or
two sentences; the three in §5 are written); no new button and no new word in any menu. The other 37 tales' lines (two of
them drafted above) are written with each water's slice under this budget and listed here when written. In all, about **70
lines, about 450 words, over the whole road**, one meeting an hour: the largest addition to the game's words since the opening, so it is
held to this table and its scan.

---

## 9. Saves and data

**Data** (`data.js`, after M1; the build writes it):

```
LOOP.farwicks = {
  wicks: { dip:      { reach: 1, waters: ['mossmere', 'sporewood', 'glasswater', 'paleabyss'] },
           glim:     { reach: 2, waters: ['rime_sound', 'thin_water', 'last_light', 'pyrefall_gorge'] },
           lean:     { reach: 3, waters: ['waxen_reef', 'thunder_stair', 'rushlight_fen', 'salt_gate'] },
           farthing: { reach: 4, waters: ['lampmoss_slough', 'siltway', 'lanternroot_lagoon', 'inkwood'] } },   // looks: §2.4, in the actor
  meet:   { fromEvening: 6, gap: 4, chance: 0.5, sureOn: 3, at: 'dusk', spotFrom: [25, 45], clear: 15 },
  tip:    { first: 3, bite: 1.2, hold: 2 },        // the clamp is AUTOFISH.biteRule's (maxShare 0.75, maxShareItem 0.85); hold: CATCH_V3.buffs.told
  secret: { weight: 'kind', pull: true },                         // a rare of its spot's kind; the pull until first landed
  place:  { good: 1, kinds: ['day', 'night'] },
}
LOOP.tales = [          // in each water's order A, B, C; each slice adds the waters it ships
  { id: 'mossmere_a', water: 'mossmere', by: 'dip', kind: 'tip',    species: 'milkeye_perch',        after: { evenings: 3 } },
  { id: 'mossmere_b', water: 'mossmere', by: 'dip', kind: 'secret', species: 'casement_trout', place: 'low_windows', after: { list: true } },
  { id: 'mossmere_c', water: 'mossmere', by: 'dip', kind: 'tip',    species: 'bridgechain_sturgeon', after: { place: 'under_the_span', evenings: 8 } },
]
SECRETS = [ { id: 'casement_trout', name: 'Casement Trout', water: 'mossmere', spot: 'low_windows', plan: 'trout', rarity: 'rare',
              hours: ['night'], len: { typical: [50, 70], record: 125 }, play: 'sulker', look: '…', journal: '…' } ]
              // the converter reads it beside the roster and marks each `secret: true`; listFor, listMark, the catalogue test,
              // biteRule's static cells, the --fish appendix and the aquarium count all read that flag
arena.toldPlaces = [ { id: 'low_windows', kind: 'night', x, z, r, landmark: 'gate_low_windows', edge: 'rim' } ]          // the Mossmere's arena
arena.meets = [ { x, z }, … ]                                                                                              // 2–3 per water
TEXT_LOOP.farwicks = { greet: { dip, glim, lean, farthing }, tales: { mossmere_a: ['…'], mossmere_b: ['…', '…'], … }, places: { low_windows: 'the Low Windows', … } }
TEXT_LOOP.murk.firstMet, TEXT_LOOP.murk.firstSecretSold
CATCH_V3.buffs.told = { hold: 2 }        // its own line in catchBuffHold: told ≤ tip.hold, persistent, inside cap 6; in the log's figures
```

Pure helpers (`progression-loop`). **Save-free cores**, which the sim calls through `fromData` (it has no `meta.loop`):
`talesReadyAt({ evenings, listLanded, owned }, D, waterId)` → taleId[], `meetRoll(seed, evening, waterId, wait, gap)` →
boolean, `tipFactor(told, landed)` → number. **The game's save forms**, thin wrappers over them: `talesReady(meta, D,
waterId)`, `meetTonight(meta, D, waterId, evening)` → `{wick, tale, spot} | null`, `tipOf(meta, D, waterId, speciesId)` →
`{factor, hold} | null`, `toldSecretsAt`, `toldPlacesAt`; `catalogueFor` gains the knots, the told secrets and the told
places; `data.tipWeights(list, tips, ctx)` over `[species, w]` pairs (§4.1); `catchBuffHold` gains the `told` term, which
the sim reaches through `landP(…, { run, told })`.

**The save** (one new block; nothing else touched):

```
meta.loop.tales = { seed: n, told: [taleId], met: [wickId], last: evening, wait: n, lift: [placeId], landed: [taleId], secretPull: { speciesId: n } }
run.meet = { wick, tale, spot } | null       // tonight's lantern, chosen at dusk, restored by Continue
```

- `seed`: drawn once by `migrateLoop` or `freshLoop`; tonight's roll is a hash of (`seed`, `meta.loop.evenings`, `waterId`),
  so a reload at any point of the evening gives the same `run.meet`. `told`: every tale told, once, never undone; the tips, secrets and told places all derive from it and the data. Written in
  the same save as the beat's first line. `met`: the Wicks whose greeting has been said. `last`: the evening the last
  lantern lifted, tapped or not (the gap). `wait`: eligible evenings since the gap passed (the sure third). `lift`: told places whose mist lift has
  not played. `landed`: tips whose fish has been landed since the tale (×3 → ×1.2). `secretPull`: evenings at its water since its
  tale, for each told secret not yet landed (named apart from `meta.loop.pull`, the list pull's evenings per water).
- **Migration** (`migrateLoop`): a block without `tales` gains `{seed, told: [], met: [], last: 0, wait: 0, lift: [], landed:
  [], secretPull: {}}`, with a fresh `seed`, and `meta.loop.v` steps by one (as `migrateLoop` does whenever it adds a block).
  An M1 save keeps everything and meets Dip within its next three eligible evenings (the gap permitting), hearing A, B and C
  at least four evenings apart.
- **The shared Journal**: a landed secret writes its entry like any species. The flag-off game (v1, or v3 as built) ignores
  entries for species it does not know, so its Journal, the v1 golden trace and the flag-off scenario run are unchanged.
- **The boot rule** (the flag off): unchanged; a saved trip's `run.meet` is dropped with the run.

---

## 10. The build (after M1)

### 10.1 Where it goes, and why

**Its own slice for the engine and the Mossmere's tales, then each later water's tales folded into the slice that ships that
water.**

- **The slice: "the far-water Wicks"** (L), after M1, **right after the aquarium** (the default; SPEC §16 question 30):
  everything built once (the lantern, the meeting beat, the far-water Wick actor and Dip's look, the tales' rules and save,
  tips in the draw, secrets in the pools and the catalogue, a told place's reveal, the knots, the logs, the sim's `--tales`),
  proven on the Mossmere's three tales (two tips, the Low Windows and the Casement Trout). Why its own slice: the engine is
  one thing to build, review and play once, and the Mossmere alone shows all three kinds of tale. Why then: it needs M1's
  catalogue (step 3a), drawn Chart (3b), trout plan (3), places and home barge (5), all in M1; and it is half code, which the
  user asked to come first ("focus on all code based jobs first"). It changes nothing in M1.
- **Each later water's tales** (S each, inside its own slice): its three tales, its secret on a plan that slice already ships,
  its lines, and at three waters a told place's site and landmark; each far-water Wick's look arrives with its reach (Glim
  with slice 6, Lean with slice 7, Farthing with slice 8; Dip with this slice). Why folded: a water's tales are data, one
  fish and three lines, cheap beside its fish lane and arena work, and its secret's plan and told place's site need that
  water's arena anyway; a tale ships with the slice that ships everything it needs (its water, its fish, its spot). So
  Sporewood's tale A comes with slice 1b's Sporewood half, its secret (at the Veilwater) with slice 5, which sells the
  Veilwater; Glasswater's and the Pallid Deep's with slice 5; reach II with 6; III with 7; IV with 8. **The fallback**: if a
  water ships before the far-water slice does (Sporewood, say, if the lead's order puts slice 1b's Sporewood half first;
  SPEC §16 questions 23 and 30), that water's tales whose needs are already shipped ship with the far-water slice itself.

### 10.2 Lanes and files (the slice)

| lane | owns |
|---|---|
| **A: the rules and the save** | `data.js` (`LOOP.farwicks`, `LOOP.tales`, the Mossmere's `SECRETS` row, `TEXT_LOOP.farwicks`, `tipWeights`, `CATCH_V3.buffs.told` and `catchBuffHold`'s told term) · `progression-loop.js` (the cadence and triggers, `told`, the pull for secrets, `tipOf`, the told places, `catalogueFor`'s told half, `endTrip`'s counters, `migrateLoop`) · `progression-af.js` (the told Hold in the log's figures) |
| **B: the water** | `fishing.js` (tips last in `rollSpecies`, clamped, and on the sign preroll; told secrets in pools; a told place as a place; no meeting tap during a bite) · `main.js` (the meeting inside a trip: tap, sail, the beat with the clock stopped, back) · new `actors-farwicks.js` (the rig with each look, the four rafts, the lantern) · `world.js` / `world-art.js` (the meet spots; the Low Windows' landmark from the Gate's kit and the edge parting) · `render.js` (the two-shot) · `audio.js` (§3.6) |
| **C: screens and words** | `ui-loop.js` (the lines on the ink pool with the speaker's flame glyph; the HUD knot; the catalogue's knots, told secrets and told place headings; the species page's re-read line; the card's knot stamp; the log lines) · `ui-icons.js` (the knot, four flame glyphs) · `chart-draw.js` (a told place's vignette with its knot) |
| **D: the fish and the art** | `src/roster-species.js` (the converter reads `SECRETS` beside the roster) · `models-fish.js` (the Casement Trout on the trout plan) · `ui-fishart.js` (its drawing and its hatch) · Dip's look and raft (the art lane) |
| **E: tools and tests** | `tools/validate-data.mjs` (below) · `tools/tests/loop-tales.test.mjs` (new, node) · `tests/farwicks.scenario.mjs` (new, browser) · `tools/audio-render.mjs --set=farwicks` · the balancing job's `clams.mjs --tales` and `catch-v3.mjs --tales` (§6.4); optionally `roster-check.mjs --secrets` (each secret's seed is a research animal with no roster descendant) |

**`validate-data --loop` adds**: every tale's water, teller (its reach), species and trigger exist; each water has A, B, C in
order; no tip names a giant or a legend; every secret's plan ships with its water, its name is original and unique, no plan
carries more than three secrets and no two secrets in a row share a plan, its size is under its water's same-plan giants
and its legend's 1.4× rule, and its hours share at least one full phase with its spot's kind; **no water's `listFor`
contains a `SECRETS` id**; `biteCells` run once more with every tip of each water applied at its full factor, against the
same `accepted` list (§4.1); every told place is a day or night water with 1 good bite and no giant, inside its water's
edge and clear of every place, dock and mooring; every meet spot is open water at least 15 m clear (slack water on a river);
every line meets §8's budget and scans (the imperative list included).

### 10.3 Tests

- **The cadence**: no lantern before the save's 6th evening, in the tutorial, on a water's first evening, on a lift's
  evening, within 4 evenings of the last lantern (tapped or not), or without a ready tale; with a ready tale, a lantern
  within three eligible evenings; an ignored lantern counts for the gap and its tale comes back; readiness checked at the
  start of the evening (a list landed before dusk readies its tale for the next evening); the roll seeded by `tales.seed`
  (a reload at any point of the evening gives the same `run.meet`; two fresh saves differ); a far-water Wick only in its own reach's waters; a tale of
  this water before another's; its greeting once.
- **The lantern and the beat**: it lifts at dusk at a meet spot in the camera's view; **no ring, disc or outline** (a pixel
  check round it and round both rafts); a tap sails only with the line in; never during a bite, a play, the show or a card;
  the clock frozen from alongside to out; at most three lines; a tap advances; the knot inks; the raft glides back to where
  it was; reduced motion cuts.
- **Missing one**: home with the lantern untapped loses nothing; the tale stays ready and comes later; nothing expires.
- **Told once**: written at the first line; never told twice; a reload mid-beat keeps it told and does not replay it.
- **A tip**: ×3 until next landed, then ×1.2, at its water only; the larger of it and the pull, never both; the giant's
  share exactly as untipped (Taper's 1.3 and 0.12 included); `pool.sure` untouched; in every drawn pool its share ≤ the
  larger of its untipped share and biteRule's cap (0.75, or 0.85 with a chosen bait or lure; a property test over every
  pool and phase); Taper's rule and the sign rule give the same answer as untipped on seeded pools; +2 Hold on its own
  `told` line, the total ≤ 6 with Ashwick's comeback, and the game's `catchBuffHold` and the sim's `landP(…, { run, told })`
  agree (a parity test on the combined Hold); the log shows both; **nothing in the play, the HUD, the card or the catalogue shows a number** (a scan); the
  knot on its card; the knot stamp on the first landing after the tale; never on a giant or a legend.
- **A secret**: absent from the catalogue, every pool, signs, notes and the Journal before its tale; **never bites before
  its tale** (100,000 seeded bites at its spot); after, only at its spot and in its hours; the pull until first landed; on
  no list and no key (**a water whose secret sits at its lake-map day or old water keeps the list size it had without the
  secret, and its tale B becomes ready**); a first for the Wick; eligible for the Well; its knot stamp and the teller's
  glyph; the told route takes the Wick to its spot in its hours; Murk's line on the first sold.
- **A told place**: before its tale nothing on the Chart and only the edge in the world, a cast there a cast into the edge,
  and **the Mossmere byte-identical**; after, its vignette with its knot and no price, never on the shelf; its lift on the next
  evening there (3 s and the title card), replayed after a reload; 1 good bite (Tallow 2); no giant, no Elder; snags at the
  built rate.
- **Words**: every line ≤ 8 words and ≤ 36 characters; no number; the lore, guard and imperative scans; no uncaught fish
  named; Murk's "Still out there" only after the first meeting with Glim.
- **Saves**: an M1 save migrates with `tales` empty and loses nothing; the flag-off Journal ignores a secret's entry; the v1
  golden trace, the flag-off scenario run and the v3 scenarios unchanged.
- **Parity**: the game's `tipWeights` and the sim's agree on seeded pools; the save-free helpers and their save wrappers
  agree; `--shipped=mossmere` byte-identical with tales off.
- **Phone and desktop**: the lantern's target ≥ 44 px; the line on one line at 18 px in 358 px; keyboard: Enter on the
  focused lantern sails, Enter or Space advances a line.
- **The user's look**, before the merge: a meeting with Dip at the Mossmere at dusk on desktop and on a phone, the Low
  Windows opening out of the mist, and the Casement Trout's card with its knot (checked beside the measuring cord, so the
  two are never mistaken).

### 10.4 The scope-cut ladder (the slice, if it runs long; cut in this order)

1. the species page's re-read line (the knot stays);
2. the far rod's tock, its own lift sound and the leaving drift (polish);
3. the two-shot camera (the beat plays on the sail camera, eased closer);
4. Murk's two lines;
5. the Low Windows (the Casement Trout moves to the Buoy Lights, night water, for this slice, and the told place comes with
   the next slice that touches the Mossmere).

**Never cut**: the lantern, pulling alongside and the line; the knot; a tip's real effect and its number in the logs; the
secret fish; nothing missable; the save.

### 10.5 What M1 must leave for it

**Nothing.** M1 changes in nothing: no hook, flag, field, data row or placeholder is added to M1 for this. Everything it needs
is already in M1 for M1's own reasons (the catalogue's groups and hatch, the drawn Chart's vignettes, the trout plan, the
Mossmere's places and rim mist, the pull, the persistent Hold bucket, the card's stamps), and the slice adds to them.

---

## 11. Risks, and the knobs

| risk | guard, and the knob |
|---|---|
| **The ladder or the 1 h mark** (§6.2) | the gate checks both with every water fully told; knobs in §6.4's order |
| **Too many words** (about 70 lines over the road) | §8's budget and scan; at most three lines a meeting, about one meeting an hour; the other waters' lines written with their slices under the same table; a cut: one tip a water (two meetings a water) |
| **Tales read as quests or a story dump** | no tale asks anything; no line speaks of the story (the lore scan); nothing tracks or lists tales; the only marks are knots |
| **A meeting interrupts the fishing** | only at dusk, only when tapped, only with the line in, never during a bite; the clock stops; the beat is under 10 s |
| **It feels like a chore to chase** | nothing is missable; a lantern comes again within three eligible evenings; the pacing player taps every one, the casual player loses nothing by tapping none (the tales wait) |
| **A tip gives the species away** | §4.1's clamp: never above biteRule's 0.75 (0.85 with a chosen item) of a pool unless it already was; the rules judged untipped; no name for an uncaught fish |
| **A secret blocks a list** | named in SPEC §5.5 (c)'s "never on a list" clause and left out of `listFor` explicitly; validate-data asserts it; a test that tale B becomes ready |
| **The far-water Wicks crowd the art** | one at a time, pinpoint light, ≤ 8 calls, built only on a meeting evening |
| **A told place changes the Mossmere the user approved** | byte-identical until told; afterwards one small landmark inside the rim mist, shown to the user before the merge |

---

## 12. Questions for the user (each with the default this design builds)

SPEC §16 questions 26–31:

26. **How often should a far-water Wick come?** **Default: about once an hour of play**: three tales at each water, each
    when its moment comes, never two meetings within four evenings. The other ways: more often (a fourth tale a water) or
    rarer (one tip a water).
27. **What should a tip do?** **Default: both**: the fish bites three times as often until you next land it, then a little
    more often for good, and it lands a little easier for good. The other way: it only bites more (no land rise).
28. **How many secrets and told places?** **Default: one secret fish a water (sixteen), and four told places, one to each
    reach.** The other ways: a second secret at the four told places; or more told places (each a little more clams and
    more art).
29. **Their names: Dip, Glim, Lean and Farthing?** **Default: yes.** The names are for the docs only: on screen each Wick is
    known by its look, its flame's colour and its glyph, and none says its name. Any names you prefer cost nothing.
30. **Where does it go after M1?** **Default: right after the aquarium** (the engine and the Mossmere's tales), then each
    water's tales with the slice that ships that water. The other ways: before the aquarium; or with Sporewood.
31. **Should each far-water Wick keep to its own reach?** **Default: yes** (Dip in the old kingdom, Glim on the cold rim,
    Lean on the falls and the gate, Farthing in the green heart), so each era has its own. The other way: any of the four at any
    water you have opened, so you might meet Glim at the Mossmere.

---

## 13. What this changes elsewhere, and the log

**Amended in this branch** (each passage dated 15 November 2026):

| doc | what |
|---|---|
| `SPEC.md` → **v8.5** | §0 rows 24–28 (the user's idea and four answers) and decisions 71–80; §0.11 (what v8.5 changed); "maps are the only discovery" amended where SPEC states it (§0 row 1's ruling, §5.1 rule 12, §9's parked row); §8's rule, §8.1, §8.2, §8.6, §8.8 (the catalogue's secrets, told places and knots) and a new §8.9 (the far-water Wicks' words); §9's save; §13's after-M1 placement; §16 questions 26–31 |
| `LORE.md` → **v2.3** | the rules' line (the user's amendment to "the only way of discovering a new place"); §1; §2.11 (a water lifts for any flame that carries its chart or has fished it; a tale as a remembering); §5.3 (the far-water Wicks met, the four, why they stayed out and why they tell); §6 (who speaks; who you meet); §9 (how the game tells it); §10's guards amended where the user's choice overrides them, and new guards for the far-water Wicks; §13's log |
| `LORE-BRIEF.md` | sections 2, 5, 6, 10, 12, 13 and the glossary, so the standalone brief is true again |
| `WORLD.md` | the Rime Sound's glacier and the Ice Foot (§5); a told place on the Chart (§10) |
| `M1.md` | one pointer line (§5): nothing of this is in M1 |

**Listed for the lead, not edited**: `QUEUE.md` (the lead's: the slice's place after M1, the default above); `AQUARIUM.md`
§6 and §8 (with sixteen secrets 109 kinds are eligible, so the Moon Pool's 96 no longer holds one of every kind: raise it to
112, or keep 96 as a choice); `WICKS.md` §1's list of earlier words ("maps are the only way to discover a place") stays as the
record of what was said then; `ROSTER.md` and `roster.json` unchanged (the secrets are not roster fish; the Standing Ribbon
option of §5.4 would need ROSTER §6's atmosphere line amended, the lead's call); `DESIGN.md` §19 and CONTRACT unchanged until
the build. **One line budget for every speaking character** (the lead's call): QUEUE's "Five characters to meet" job gives
its named characters lines "under 60 characters"; the far-water Wicks keep SPEC §8.5's passives' budget (8 words, 36
characters) because they speak on the water, on the ink pool beside a raft, where one line at 18 px on a 358 px phone is 36
characters; Murk's lines keep §8.6's own length. The characters job should either adopt 36 for anyone who speaks on the
water or record why its characters keep 60. The lore brief now words "who speaks" as the creator's call, character by
character, so that job can add voices without the brief contradicting it.

| revision | what changed, and why |
|---|---|
| 2 (15 November 2026) | the two critics' review (§14): 2 musts, 16 shoulds and 16 coulds, every one applied or answered. Secrets kept off every list by name, not by the freeze; the tip clamped to `AUTOFISH.biteRule`, applied in a fixed order with the giant recomputed, on its own `told` Hold line; the sixteen secrets spread over twelve plans (no plan more than three, none twice in a row), the Standing Ribbon replaced; every tale line an observation, never a command; Glim's C line reworded; Murk's "Still out there" after the first meeting with Glim; Farthing bee wax, Dip moved off Taper's silhouette, Lean given its laugh; an ignored lantern counts for the gap; the seed; the raft glides back after a meeting and the sim charges it; the told route; a Mossmere-only gate with tales on; the ladder's tale states and a last resort; save-free helpers for the sim; the branch rebased onto the moved base. The user's four answers unchanged |
| 1 (15 November 2026) | written for the user's idea and four answers of 15 November 2026: four far-water Wicks, one to each reach (Dip, Glim, Lean, Farthing), met at dusk by a lantern you pull alongside, about once an hour, never missable; three tales a water: a tip (×3 until landed, then ×1.2 and +2 Hold for good, its number only in the logs), a secret fish on no page until told (sixteen, one a water), and four told places no chart drew; the knot as the one mark; the budget and `clams.mjs --tales`'s gates; built after M1 as its own slice after the aquarium, each later water's tales with its slice; six questions (SPEC §16 26–31). A docs job, one writer, no reviewer |

---

## 14. Review log (revision 2, 15 November 2026)

Two critics read revision 1: **lore and feel** (no musts; 9 shoulds, 8 coulds) and **systems and economy** (2 musts, 7
shoulds, 8 coulds). Each finding was checked against the docs and the built code (`src/data.js`'s `AUTOFISH.biteRule`,
`CATCH_V3.buffs` and `catchBuffHold`; `tools/sim/clams.mjs`'s `poolFor` and `landP`; SPEC §5.5 (c), §9, §14; `ROSTER.md` §6;
`LORE.md` §2.11, §3, §5.1, §6; `WICKS.md`; `M1.md` §6; `QUEUE.md`). Every one held; none was rejected. The user's four
answers are unchanged.

### Lore and feel

| # | level | the finding | checked | what was done |
|---|---|---|---|---|
| L1 | should | 7 of the 16 secrets are catfish (3 more eels); "super special" flattens | held (§5.4 r1) | §5.4: Shelfback → **Shelfback Sturgeon**, Thornjacket → **Thornjacket Puffer**, Spadehead → **Almsplate Flounder**, Driftlog → **Driftlog Pike**; the Standing Ribbon → **Weedwalker** (angler; L2). Twelve plans, none more than three (catfish 3: Overland, Hiccup, Woodrasp), none twice in a row; each on a plan its slice ships; a validate-data rule. A secret's first card also carries the teller's flame glyph (§4.2) |
| L2 | should | the Standing Ribbon is an animal ROSTER says is never hooked, and sits at the Drift Line, not the Unlit Mile | held (ROSTER §6) | replaced by the Weedwalker at the Drift Line; ROSTER not amended; the ribbon's payoff kept as an option for the lead with ROSTER's line amended (§5.4, §13) |
| L3 | should | Glim's "My hole." can read as crude, on the design's best reveal | held | "Mine, that stool. Skates at night." (34 · 6); the lantern and knots stay in a look (§5.2, §8) |
| L4 | should | imperatives ("Let it sink.", "Listen.", "Look twice.", "Go on.") read as instructions; "Listen." promises an unbuilt drum sound | held | "Long cod lie deep and bite slow." (32 · 7) · "The big grouper feed after dark." (32 · 6; no sound promised) · "Only its eyes show, if anything." (32 · 6) · "A trout lives in it now." (24 · 6). §8's budget and SPEC §8.9: no instruction to the player; an imperative scan in validate-data; "Sit, if you like." stays as an invitation |
| L5 | should | Murk's "Still out there, that lot? Good." plays after the first meeting, always Dip, whom he never met | held (LORE §6) | it plays at the first tally after the first meeting with **Glim**; §8, SPEC §8.6, LORE §6 and the lore brief match |
| L6 | should | Farthing is tallow, against "every Wick is orchard-bee wax", and blurs with Tallow; Dip shares Taper's tall, pale-gold silhouette, and Lean is tall too | held (LORE §5.1, WICKS) | Farthing: the dregs of the orchard wax, remelted, brown-yellow and uneven. Dip: a flat oval like a river stone stood on end, pearl banded grey, a flame river-blue at the root, white above, gold only at the tip. Lean: the only tall one (§2.4, LORE §5.3, the lore brief) |
| L7 | should | an ignored lantern's effect on the 4-evening gap is undefined; lanterns would nag | held | a lantern lifted counts for the gap, tapped or not (`last`); the tale stays ready and returns after the gap and the roll, about one lantern in 5–7 evenings for an ignoring player *(est.)*; SPEC decision 72, §3.2, §3.4, §9, tests |
| L8 | should | the lore brief now forbids new talking characters, against QUEUE's adopted "Five characters to meet"; 36 vs 60 budgets | held (QUEUE) | the brief words speech as the creator's call, character by character, "so far Murk at home and the four far-water Wicks on the water"; "nothing else speaks", "a new character has no dialogue" and "the only voice at home" dropped; LORE §5.3 (3)'s "nobody else is met" and §6 reworded likewise; the 36 vs 60 budgets flagged for the lead (§13) |
| L9 | should | LORE §2.11's first paragraph still says a map is "the only way to find a new place" | held | "the only way to find a new water, and the main way to find a new place (see below)" |
| L10 | could | "a water lifts for the flame that carries its chart, and for no other" is a new mist rule the user did not ask for; the Ice Foot was not made by the drowning | held | softened in LORE §2.11, §4.3 and the brief: a water lifts for any flame that carries its chart or has fished it (the charts are the household's, so all five playable Wicks share them); corners made "by the drowning or the long years since" |
| L11 | could | the brief's "Not: a heron that shows you a hidden pool" now reads as a contradiction | held | "*Not:* a heron that leads you to a hidden pool (only a far-water Wick's tale shows a hidden corner, and it never leads you there)" |
| L12 | could | "lets every fish go" is not Lean's alone | held | all four let fish go (§2.1); Lean's own line is that it **laughs at every fish, landed or lost** (§2.4, LORE, the brief) |
| L13 | could | reach III is "the falls and the gate" elsewhere, "the warm coast" here | held | the reach is named "the falls and the gate" (§2.4, Q31, SPEC Q31, the summary); "the warm coast" only as description |
| L14 | could | the names never appear on screen; "in the player's ear" is unclear | held | §2.4: "the names are for the docs only"; Q29 says so (SPEC Q29 too) |
| L15 | could | Glim's lantern vs the lit lantern on the ice at the Lantern Hole | held (LORE §3 Act II) | the same lantern: left burning by the hole as a fisher leaves a rod; on an evening Glim is met at the Sound it is on Glim's crook and the hole is dark (§2.3, §2.4, LORE §5.3) |
| L16 | could | the card's pressed knot may be mistaken for the measuring cord's knots | held | the tale knot is a loose loop tied in the teller's flame colour; checked beside the cord in the user's look (§4.1, §10.3, SPEC §8.2) |
| L17 | could | tapping sails the raft off its place, a small cost | held | after the beat the raft glides back to where it was; the sim charges both sails (§3.3, §6.4) |

### Systems and economy

| # | level | the finding | checked | what was done |
|---|---|---|---|---|
| S1 | **must** | "never on a list because lists are frozen" fails for waters 2–16: their secrets ship with the first edition, several at lake-map day or old water; tale B waits for the list, so the catch key deadlocks | held (SPEC §5.5 (c), Appendix A's list column) | SPEC §5.5 (c)'s "never on a list" clause names **a secret (`SECRETS`)**; `listFor`, the sim's `listFor` and `listMark` exclude `SECRETS` explicitly; the converter marks `secret: true` for the catalogue test, biteRule's static cells, the `--fish` appendix and the aquarium count; validate-data asserts no list holds a secret; a test that tale B becomes ready (§4.2, §7, §9, §10.2, §10.3; SPEC decision 75) |
| S2 | **must** | the 0.8 clamp is signRule's (sign pre-rolls); the bite's rule is `AUTOFISH.biteRule` (0.75, 0.85 with an item), which static `biteCells` cannot check on save-dependent tips | held (`data.js` biteRule) | the clamp is biteRule's: the larger of the untipped share and 0.75 (0.85 with a chosen bait or lure); signRule's 0.8 still checks the sign pre-roll; validate-data re-runs `biteCells` with every tip at its full factor against the same `accepted` list; gate 7, the property test and SPEC decision 74 say biteRule (§4.1, §6.4, §10.2, §10.3) |
| S3 | should | "applied last" vs "the giant's share never moves" conflict with the built order | held (`poolFor`: giant = others × s / (1 − s)) | one order, in words and in the function: non-giant weights after every built filter, the tip (or the pull's, the larger), the giant recomputed from the tipped total (Taper's 1.3 / 0.12), then the biteRule clamp; `tipWeights(list, tips, ctx)` over `[species, w]` pairs; `pool.sure` untouched (§4.1) |
| S4 | should | the shipped arc after the slice (the Mossmere with Dip's tales) is not gated against M1's figures | held (M1 §6.2) | gate 9: `--shipped=mossmere --tales [--wicks]`: M1 §6.2's marks (the 1 h mark within +3% of M1's measured 268 a trip; SPEC §4.9's ≤ 240 is the full road's and stays in gate 1), the list's p95 ≤ 29 min, the empty shelf within −5% and 0% of 2.04 h and each Wick's of its own; gate 8 (tales off, byte-identical) stays the M1 check (§6.4) |
| S5 | should | gate 2 does not say each side's tale state; no knob acts at the map's moment; no last resort | held (SPEC §4.9, §14 risk 30) | gate 2 states them: on the map's day, the water before fully mapped and told against the new water untold; fully mapped, both told and both untold. Last resort: `clams.mjs --calibrate --tales` with the tiers re-derived by the balancing job, or the lead holding a water's tale C until the next map is owned (§6.2, §6.4) |
| S6 | should | "seeded by the save" is undefined: no seed field | held (SPEC §9's shape) | `tales.seed`, drawn once by `migrateLoop` or `freshLoop`; the roll a hash of (seed, evenings, waterId); a reload test (§3.2, §9, §10.3; SPEC §9) |
| S7 | should | the meeting's cost is under-modelled: dusk's 20 s, the sail out, being left in open water, the beat's real seconds | held (SPEC §3.4) | the raft glides back after the beat; the sim charges the sail out, the beat and the glide back to trip minutes (about 15–25 s *(est.)*), reports the dusk-bite cost, and gate 1 counts the meetings' minutes (§3.3, §6.4) |
| S8 | should | nothing routes the pacing player to a told secret's spot in its hours; several secrets' hours clash with their spot's kind | held | **the told route** in the game's guidance and the sim (§4.2); gate 6 measures evenings at the water; every day-water secret now bites by day (the Halfseen Eel, the Chimneysweep Eel and the swapped secrets), and validate-data checks a full phase of overlap (§5.4, §10.2) |
| S9 | should | the helpers take a save; the sim has none; the told Hold summed ad hoc beside `extraHold` | held (`clams.mjs` 241–247, `landP`) | save-free cores (`talesReadyAt`, `meetRoll`, `tipFactor`) through `fromData`, with save wrappers; `landP(…, { run, told })` through `catchBuffHold`'s object path; a parity test on the combined Hold (§6.4, §9, §10.3) |
| S10 | could | §3.2 and §9 disagree on when an M1 save meets Dip | held | "within its next three eligible evenings (the gap permitting)", A, B and C at least four evenings apart (§3.2, §9) |
| S11 | could | a tale of another water urges the player elsewhere; same-evening readiness unspecified | held | readiness at the start of the evening; another water's tale only when that water is open, its lift waiting in `tales.lift`; the water you are on first; "Go on." dropped (§3.2, §4.4) |
| S12 | could | the told +2 shares `relicCap` with parked relics and a possible `LOOP.craft` | held | its own `told` line in `catchBuffHold`, inside the total cap 6 (§4.1, §9; SPEC decision 74) |
| S13 | could | "6 in open water" left over; "commons at half (SPEC §3.3)" points to the anti-grind rule; "80% open water" unclear | held | the open-water figure dropped; the commons rule points to `LOOP.placeCommon` (SPEC §13 slice 2); the 80% condition removed (§4.2, §4.3, §10.2) |
| S14 | could | the Told line is one tap under the catalogue; nothing says enlarged silhouettes stay number-free | held (SPEC v8.4) | §4.1, §4.2, §7 and SPEC §8.8: the catalogue page, its cards and every enlarged silhouette (tipped or told) carry no number; the Told line lives only in the odds block and the gear log; the number scan extends to them |
| S15 | could | the tales block does not step `meta.loop.v`; `tales.pull` reuses `meta.loop.pull`'s name | held | `v` steps with the block; renamed `tales.secretPull` (§9; SPEC §9) |
| S16 | could | Sporewood's tale A assumes the slice ships before slice 1b's Sporewood half | held (QUEUE items 15–16) | the fallback: a water that ships first has its tales ship with the far-water slice itself (§10.1) |
| S17 | could | the branch base moved (c1ddd74 → 9ad7339), so a two-dot diff shows QUEUE losing "Five characters to meet" | held | `gw-loop-farwicks` rebased onto 9ad7339 (no conflict; QUEUE.md is untouched by this branch); the one line budget for every speaking character is listed for the lead (§13) |

**Not changed, and why.** No number of the economy was re-estimated beyond the meeting's cost: no sim was run (another
heavy job holds the machine), so every figure stays *(est.)* until the balancing job's `clams.mjs --tales` prints it. SPEC
§2.1, §3.3, §4.2 and §4.9, QUEUE.md and M1.md (beyond its one pointer line) are untouched. The aquarium's sizing (109
eligible kinds against the top tank's 96) stays listed for the lead (§13).
