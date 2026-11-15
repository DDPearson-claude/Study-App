# The far-water Wicks: tales from the other candles out on the water

*Design for the user's idea of 15 November 2026 and the four answers that followed it (§0). Revision 1, 15 November 2026.
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
- **Not keepers.** They tend nothing. Glim's lantern by the Lantern Hole is its own lantern, not a lamp it keeps for anyone;
  the lamps that burn unfed still have no keeper.
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
| **in one line** | It lay on the bottom a long while and knows who lives down there. | It likes the cold and the quiet, and counts the Long Winter's passing in knots. | It fishes the warm coast for the joy of it, and lets every fish go. | The cheapest candle in the kingdom, and the one that went farthest. |
| **wax and body** | tall and narrow as a dipped candle, the colour of old pearl, worn smooth and faintly banded like a river stone; a small snail shell stuck to one shoulder | small and round, white wax gone faintly blue-white, crazed all over with fine cracks from the cold | tall, honey-gold beeswax, softened by the warm coast so it leans to one side, and leans further toward whoever it is talking to | small and thin, a cheap tallow dip gone brown-yellow and uneven, its wick crooked |
| **cloak or hood** | a short hood and cape of old sailcloth the colour of wet sand, with dark tide lines | a quilted hood of faded rose, patched, pulled close | a loose, light shawl of faded ochre, knotted at the chest | a scrap of sacking grown over with pale lichen and a little moss: the forest has started on it |
| **flame** | small and very still, pale gold with a blue root | cold: nearly white with a lavender edge, as if the cold had got into it | rose-gold | small and yellow, with a thread of smoke |
| **its raft** | the shutter of its own window, its iron hinges still on | a sled-raft: planks on two bone runners, so it can be hauled up onto the ice; a tiny three-legged stool on it, the twin of the one by the Lantern Hole | fishing baskets lashed together, big ones and very small ones, like those stacked by the hundred on Rushlight's dam steps | a hatch cover from a sunk barge, poled; a small frog often rides on its edge (an animal, behaving as one) |
| **its kit, and how it fishes** | a short stiff rod of black bog-oak, its line weighted with an old iron key; a slit-lantern of tin (one slit of light). It fishes straight down over the deep, dead still: it knows the floor | a short bone ice rod, its line tied with knots; a lantern on a crook of driftwood. It sits on its stool and jigs, for hours, without moving | a long, light cane rod and a small basket creel; a brass lantern with one rose pane. It casts long and light all evening, and every fish goes back with a little laugh of its flame | a pole and a short rod; a paper lantern from the stilt village. It drifts with the current along the snags and poles from trunk to trunk |
| **its sound** (§3.6) | a single water drip, the creak of a hinge | the creak of ice, a clink of bone | the creak of wicker, a crackle of its flame like a laugh | one frog call, the knock of a pole on wood |
| **its greeting** (once, the first time it is met) | "I lay down there a long while." | "Quiet up here. Sit, if you like." | "Another one out! Oh, that's good." | "All this way? Me too." |

**Why these four.** One to each reach gives every era of the road its own far-water Wick, met first at the reach's first
water and through its four, so "periodically" is felt all the way down the road and each Wick is met often enough (about a
dozen times) to be somebody. Each is the voice of its reach: the drowned capital's own candle that lay under it; the cold
rim's ice fisher, whose stool, lantern and seven knots the player has already found (the seven knots are Glim's: one for
each time the Long Winter has passed under its hole; this stays in these docs and in a look, never in a line); the warm
coast's merry fisher among the people's baskets; and in the green heart the one who went farthest, mossed over. Four keeps
them distinct and the word budget small (§8). A fifth is not added without the user.

**Names.** Plain candle words, as the five are (a dip, a glim, a candle that leans, a farthing dip), checked against the
guards: no "Ashen" or "Ash-", no "Pale", "King", "royal", Soul, Charm, Vessel, Grub, Shade, Husk, Mask or Abyss, and no
clash with a Wick, a water, a place or a fish. On screen a name appears nowhere but in the player's ear: none of the four
says its name; the docs use them. (In these docs "one ink dip" is still the screen's transition; the Wick is always "Dip".)

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
| at least 4 evenings ended since the last meeting, anywhere | `gap: 4` | never two meetings close together; each stays special |
| the reach's far-water Wick has a ready tale: one of this water first, else the earliest ready of another water of its reach | — | a tale never waits on the player coming back to one water; it never strays out of its reach |
| tonight's roll: 1 in 2 on the first and second eligible evenings, certain on the third | `chance: 0.5`, `sureOn: 3` | "periodically", not like clockwork, and never more than three evenings late |

The roll is seeded by the save and the evening count, so a reload never changes tonight's lantern. A water's tales are told in
their order (A, B, C) when more than one is ready; the first meeting with each Wick opens with its greeting.

**How often** *(est.)*: the first meeting comes on about the Mossmere's 6th to 8th evening, about 25 minutes into a fresh
save; about three meetings at each water, spread through its era as its tales come ready; **48 in all, about one an hour of
play** over the 47.6 h road (SPEC §4.9). An M1 save that has already fished the Mossmere a long while meets Dip on its next
evening there.

### 3.3 The beat

| moment | what happens | time |
|---|---|---|
| dusk falls | the lantern lifts at its spot; a soft wooden "tock" carries across the water (the far rod's butt on its raft) and its own small sound (§3.6) | — |
| the tap | the raft sails there as to a place (the built sail and glide; the clock runs while it sails) | the sail |
| alongside | the rafts touch (a soft knock); **the clock stops** (as for a catch's ceremony); the camera eases to a low two-shot, side-on, the two candles facing and the far lantern between them; the two flames lean toward each other; the HUD fades to the hold row and a dimmed Home pill | 0.8 s |
| the greeting (the first meeting only) | its line on the feathered ink pool beside its raft, its small flame glyph before it in its own colour, no name | ≥ 2.4 s, or a tap |
| the tale | one or two lines, the same way, one at a time | ≥ 2.4 s each, 0.3 s apart, or a tap |
| the mark | a small knot inks itself beside the Journal glyph (the quill's sound, built), and fades | 0.8 s |
| out | it lowers its lantern a little and turns back to its line; the camera eases back; the clock runs; you fish on | 0.8 s |

About 6–9 s alongside *(est.)*, never more than three lines. The far-water Wick stays at its spot the rest of the evening,
fishing; tapping it again does nothing but a small dip of its lantern. At dawn it is gone. **Reduced motion**: cuts in place
of the eases, no lean. **The words** follow SPEC §8: one line at a time on the ink pool, 18 px on a 358 px phone on one line,
read aloud by the built live region.

### 3.4 Missing one is never a loss

- A lantern left alone goes when the raft goes home. Its tale stays ready, and the rules of §3.2 bring a lantern again on a
  later evening (within three eligible evenings).
- **Nothing a tale gives can be lost or taken back**: a tip is for good; a told secret stays on its page; a told place never
  closes. Nothing expires, nothing is counted against you, and no tale is ever withheld for having been missed.
- A reload during the beat keeps the tale told (it is written in the save as the first line shows) and never replays it; the
  line stays readable on its page (§4).

### 3.5 Why it feels special

It is the only other living flame you ever meet on the water, and it is rare (about once an hour). It comes at the hour the
game is made of, dusk. The meeting is wordless until the line, and the line is fisher's talk in a voice you have not heard
before. Every tale leaves a mark you can see: the knot, a silhouette that was not on the page this morning, or a corner of
the water opening out of the mist. And its payoff is a catch: the next time the tipped fish or the secret comes up, its card
carries a small pressed knot (§4.1, §4.2).

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

**Where it acts in the draw.** On the pool that will be drawn, **last**, after every built filter and tilt (hours, place,
bait, a lure's attract, Taper's first bite, a sign's tilt), through one pure export, `tipWeights(pool, tips)` (data.js),
which the game and the sim both call. **Stacking**: one tip per species, ever (a second tale never names it); two tips at a
water are two species; for a listed fish still missing, **the larger of the tip's factor and the pull's** (SPEC §5.5 (d)),
never both (the house rule, as with an order and the Old Ledger); a giant's fixed share is computed on the others' weight as
built, so it never moves.

**The caps.**
- **The sign rule** (`CATCH_V3.signRule`: at least 2 kinds, no share above 0.8). A tip never takes a fish's share of any drawn
  pool above **the larger of its untipped share and 0.8**: `tipWeights` lowers the factor to meet it. **Taper's first-bite
  rule and the sign rule are judged on the untipped pool**, so a tip never makes either wait, and the drawn pool still never
  shows a fish above 80% unless it already did. So a tip never gives away the species before the reveal.
- **The Hold caps** (`CATCH_V3.buffs`: relics ≤ 3, run buffs ≤ 4, all ≤ 6). The tip's +2 is **knowledge, not a run buff**,
  so it sits **beside the run cap, not inside it**: in the persistent bucket with the relics (`relicCap` 3; the relics are
  parked under the loop, so in play the tip is that bucket's only term), and inside the total `cap` 6. With Ashwick's tired
  comeback (+4, the run cap) a tipped fish has exactly the total cap, 6. And because it is persistent Hold, **it is in the
  log's figures**, where run buffs never are (`WICKS.md` §2.5): the number is where the user asked for it.

**How the player knows it took.**
- **On screen, during play: nothing.** No number, no glow, no sign on the float, no word on the HUD.
- **The catalogue**: the tipped fish's card gains a small inked **knot** in its corner (the notch's other corner), caught
  or not. No number, ever (SPEC §8.8).
- **The species page** (once caught): the tale's line once more, under its own lore line, in the handwriting of the card's
  notes, with the teller's small flame glyph.
- **The card**: the first landing after the tale carries a small pressed knot beside its name, 0.3 s after the class stamp
  (after the list seal, if that shows too), no words.
- **The player's own logs**: its odds block and the gear log's "Your odds" show the rise, plainly: "Told: ×3 until landed"
  then "Told: ×1.2 · +2 Hold", with the land chance computed with the +2.

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
| **where it bites** | at **one spot of its water**: its told place (four waters) or one place bought by map (twelve), in its hours, on any bait | a home, like a place's own fish; the tale names the spot in its words |
| **how often** | as **a rare of its spot's kind** (`RARITY_WEIGHTS.rare` × the place's `kindWeight`, 15 at a place; 6 in open water) | a secret stays special after the first: a treat, never a farm |
| **its first one** | until first landed, the pull's mercy (SPEC §5.5 (d)): ×min(6, 1 + n) for each evening ended at its water since the tale, never Small from the second, the sure bite at its spot from the ninth | it comes soon after the tale *(est. p50 1–2, p95 4 evenings fished at its spot)*; luck never keeps a told secret from you |
| **and it is tipped** | its tale counts as a tip on it (§4.1's +2 Hold and ×1.2 for good; the pull stands in for the ×3) | the teller told you how |
| **what it is** | **rare** (×5.5), never a giant (★), never a legend; its own plan's size, under its water's giants of that plan (the kin rule) and under its legend's 1.4× rule; it can reach Trophy anywhere and Elder only in old water | the giants stay the episodes' main fish and the top of each ladder |
| **what it sells for** | the value rule (SPEC §4.1), about its water's rare Keeper price at Keeper *(est.)* | a fine fish, not a jackpot: it is special for being told, not for its price |
| **gating** | **never on a list, never a key, never needed by anything** (a list is frozen at its first edition; SPEC §5.5 (c)); it counts for its own records like any fish | a secret is a gift, never a requirement |

**How the catalogue shows it** (SPEC §8.8): from its tale on, it appears **in its group** (its spot's heading, or open water's
group after the thin rule; never in the list section and never in the count), as a **hatched silhouette with "· · ·"** and a
small **knot** in its card's corner, with its glyphs (its hour glyphs; the heading is its place). Once caught: its ink drawing
and its name; the knot stays. Tapping its silhouette shows it large with its glyphs, its knot and the tale's line under it in
the notes' hand (the tale is all you know of it). Still **no percentage on any fish**.

**Its first card**: the built kicker ("A new name for the journal"), and the small pressed knot beside its name, 0.3 s after
the class stamp. At the tally, the first secret Murk ever weighs earns his line (§8).

### 4.3 A told place: a corner of a water no chart drew

**What it is.** Four in all, **one to each reach** (§5.5): water the chart-makers never saw, because the drowning made it after
their sheets were drawn (a window that was a window, a glacier's foot that was ice, a hull that was a ship, a tree that was a
tree). A chart is the kingdom's remembering; a far-water Wick who has fished such a corner is its only remembering, and
**its tale lifts the mist as a chart does** (`LORE.md` §2.11, v2.3: the mist is each flame's own forgetting; a water lifts
for the flame that carries its chart or is told its way by one who knows it). Maps stay the main way: every water, and every
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
| **its fish** | its secret (as §4.2), its kind's fish, open water's fish with commons at half (SPEC §3.3) | a place like any other, with something of its own |
| **snags** | at the water's built rate, from its water's set (`FINDS.md`): no new find | finds stay each water's eleven |
| **for good** | it never closes and is never undone | nothing expires |

**Where it shows on the catalogue**: among the places, in its kind's order after the mapped places of that kind, under a
heading of its kind glyph, its name and its knot.

### 4.4 The tales of a water

Every water has **three tales**, told by its reach's far-water Wick, in this order:

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
| **B** | **the Low Windows** (a told place, night water) and its secret, **the Casement Trout** | the Mossmere's list landed | "My window's still under the Gate." (33 · 6) / "A trout lives in it now. Go on." (31 · 8) |
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
| **A** | tip: the **Bellrope Cod** (rare, the Fjord Floor; on the list) | 3 evenings at the Sound | "Long cod lie deep. Let it sink." (31 · 7) |
| **B** | **the Ice Foot** (a told place, day water) and its secret, **the Snowmelt Cod** | the Sound's list landed | "The ice went back. Water wells up." (34 · 7) / "A cod comes to taste it, by day." (32 · 8) |
| **C** | tip: the **Coalwing Skate** (rare, the Lantern Hole's fish) | the Lantern Hole owned, 8 evenings | "My hole. Skates come up at night." (33 · 7) |

Tale C is where the player learns, in three words, whose stool and lantern sit by the Lantern Hole.

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
| **A** | tip: the **Harbourdrum Grouper** (rare, night, the Sunken Orchard; on the list) | 3 evenings at the lagoon | "The grouper drum at night. Listen." (34 · 6) |
| **B** | the secret, **the Hideaway Ray**, at the Bright Flats (day water; it comes with the lake map) | the lagoon's list landed | "Something's under the bright flats." (35 · 5) / "Only its eyes show. Look twice." (31 · 6) |
| **C** | tip: the **Stiltshadow Shark** (rare, the Stilt Shrine's night fish) | the Stilt Shrine owned, 8 evenings | "Sharks under the stilts, after dark." (36 · 6) |

**The Hideaway Ray** (draft; disc plan, with slice 3's Sporewood fish). Rare; day and dusk; the Bright Flats only. A round
sand-coloured ray dusted with darker freckles, its two eyes raised on little turrets, the only part of it you ever see first.
Typical 55–76 cm, record 135 (the lagoon's giants are perch, shark and catfish; the Silver Regent's 310 is over 1.4 × 135).
A Keeper about 8,000 clams *(est.)*. Journal: "It lies under the flats with only its eyes out, and has outwaited every tide
so far." Play: sinker (it clamps to the sand). Seed: a flats stingray, seen and never landed.

### 5.4 The sixteen secrets and their tips (drafts, confirmed when each water's sheet is scheduled)

Names are drafts in the roster's voice (plain English compounds, generic fish words), to be confirmed with each water's slice,
as the giants' lures are (SPEC §4.4). Every secret is rare, on a plan its water's slice already ships (SPEC §13 rule 2), and
sized under its water's giants of that plan and under its legend's 1.4× rule. The seeds are design notes and never ship.

| # | water · teller | tale A (tip; a list fish) | the secret (draft) · plan | its spot (kind) · hours | what it is | tale C (tip) | seed (design note) |
|---|---|---|---|---|---|---|---|
| 1 | the Mossmere · Dip | Milkeye Perch | **Casement Trout** · trout | **the Low Windows** (told; night) · night | keeps to the drowned windows and looks out | Bridgechain Sturgeon (Under the Span) | a cold-loch char, seen |
| 2 | Sporewood Pools · Dip | Downcast Catfish | **Overland Catfish** · catfish | the Veilwater (night) · night | crosses from pool to pool over the moss when nobody looks | Nightbloom Carp (the Veilwater) | a walking catfish, used as bait |
| 3 | Glasswater Vault · Dip | Pilgrim Salmon | **Shelfback Catfish** · catfish | the Mirror Nave (old) · dusk, night | sleeps on the crystal shelves | Vesper Gar (the Broken Hymnal) | a deep-lake giant catfish, seen |
| 4 | the Pallid Deep · Dip | Candlewake Sturgeon (the Chain Garden) | **Halfseen Eel** · eel | the Bier Barge (day) · night | nobody has seen all of it at once | the Clapper (the Sunken Belfry) | a deep-sea eel, hooked and lost unseen |
| 5 | the Rime Sound · Glim | Bellrope Cod | **Snowmelt Cod** · cod | **the Ice Foot** (told; day) · day, dusk | comes up only where the snow comes in | Coalwing Skate (the Lantern Hole) | a big-eyed deep fish, caught by others, unnamed |
| 6 | the Thin Water · Glim | Slipwhisker | **Thornjacket Catfish** · catfish | the Marsh Lanes (day) · dusk, night | armoured in spines it never uses unless lifted | Blotback Catfish (the Lamp Ford) | a spiny river catfish, caught by others |
| 7 | the Last Light · Glim | Starbar Lancer (the Lamp Rock) | **Standing Ribbon** · eel, with a ribbon crest | the Drift Line (old) · dusk, night | the upright ribbon seen beside the raft at sea, now catchable | Ambersickle Tuna (the Beam) | a deep-sea ribbonfish, seen |
| 8 | Pyrefall Gorge · Glim | Lampspot Snakehead | **Spadehead Catfish** · catfish | the Alms Steps (day) · day, dusk | lies flat under the temple steps | Almsfed Carp (the Alms Steps) | a flat-headed mountain catfish, seen at market |
| 9 | the Waxen Reef · Lean | Nebula Trout (the Chimney Gardens) | **Chimneysweep Eel** · eel | the Chimney Gardens (day) · dusk, night | lives in a drowned chimney | Cabin Grouper (Lamp Row) | a reef eel, caught by others |
| 10 | the Thunder Stair · Lean | Cocoon Sleeper (the Step Pools) | **Flagback Gar** · gar | the Step Pools (day) · any | a row of small flags down its back, and no hurry | Swallowtail Catfish | a finlet-backed old river fish, seen |
| 11 | Rushlight Fen · Lean | Foamnest Pike (the Reed Lanes) | **Hiccup Catfish** · catfish | the Night Lanes (night) · night | squeaks when lifted, like a laugh held in | Reedwalker Catfish (the Night Lanes) | a squeaking catfish, seen |
| 12 | the Salt Gate · Lean | Longlash Ray | **Broadbrow Shark** · shark | **the Ribs** (told; night) · night | its head is wider than it is long | Dusk Drummer (the Harbour Stump) | a wide-headed small shark, caught by others |
| 13 | Lampmoss Slough · Farthing | Spotmail Gar (the Straight Canal) | **Ladlenose Sturgeon** · sturgeon | the Straight Canal (day) · day, dusk | its nose is a ladle; it sieves the canal | Tailwatch Mudfish (the Lock Gate) | a paddle-snouted river fish, seen |
| 14 | the Siltway · Farthing | Snufferjaw (the Seam) | **Driftlog Catfish** · catfish | the Seam (day) · dusk, night | lies along the sunk timbers like one of them | Tallyside Catfish (the Lamp Bar) | a long flat-headed catfish, seen |
| 15 | Lanternroot Lagoon · Farthing | Harbourdrum Grouper | **Hideaway Ray** · disc | the Bright Flats (day) · day, dusk | buried with only its eyes out | Stiltshadow Shark (the Stilt Shrine) | a flats stingray, seen |
| 16 | the Inkwood · Farthing | Gourdcracker (the Windfall) | **Woodrasp Catfish** · catfish | **the Hive Hollow** (told; day) · day, dusk | rasps at the drowned orchard's wood, a mouthful a year | Starback Ray | an armoured wood-eating catfish, seen as bait |

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
   water (the Mossmere, the Rime Sound), it could fall under 1.05: the gate checks every water with the water before
   **fully mapped and fully told**, and the knobs (§6.4) are set to hold it.

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
  count, the gap, the seeded roll and the sure third evening, the reach rule, the tales' triggers on the run's own Journal and
  purchases); **the pacing player taps every lantern** (cost: its sail, about 6 s of the evening *(est.)*; the beat stops the
  clock); tips in `poolFor` through the same `tipWeights` the game calls (×3 until landed, then ×1.2, the larger of it and
  the pull, the clamp); the told Hold (+2) in `landP`; a secret in its spot's pool once told, with the pull until first
  landed; a told place as a place of its kind with 1 good bite (Tallow 2), in the natural and the Journal routes.
- **Gates** (all must pass; tales off, everything byte-identical):
  1. the full pacing run with tales **within −5% and 0% of the tales-off run's own end** (47.6 h), the longest wait ≤ 90 min,
     and every SPEC §4.9 mark inside its target (**the 1 h mark ≤ 240 clams a trip**);
  2. section 6's ladder rules at every water, the water before **fully mapped and fully told**: ≥ 1.05 on the map's day, ≥ 1.2
     fully mapped, no set of a water's places (told places included) paying more than the next water fully mapped; and "a new
     water is the best water from the day it opens";
  3. at any water, all its tales together add **≤ +3%** clams a minute (≤ +4% at a told place's water);
  4. `--tales --wicks`: the five Wicks' hours within ±5% of their mean and each within ±10% (`WICKS.md` §3.5);
  5. the anti-grind, let-go and bait checks (sections 2 and 2b) unchanged within their noise; the lists' p95 (section 7)
     never slower; the pull's windfall unchanged;
  6. a told secret's first landing within **4 evenings at its spot** for the slow player in twenty; a tip's ×3 ends within 3;
  7. no drawn pool with a tip has a fish above the larger of its untipped share and 0.8 (every pool, every phase);
  8. `--shipped=mossmere` byte-identical (M1 has no tales).
- **Reports**: meetings per era and per hour; the evening of the first meeting (median and p90); the share of evenings with a
  lantern; tales told by hours 1, 5, 20 and 40; each tip's and each told place's gain at its water; the secrets' share of all
  clams (*est.* about 0.3%); the ladder ratios with and without tales.
- **Knobs, in order**: `tip.bite` 1.2 → 1.1; `tip.hold` 2 → 1; a told place's good bite taken out of open water's count
  (so it moves a bite rather than adding one); a told place's favour to open water's; `meet.gap` 4 → 6; a told place's tale
  after its water's night map. **Never a knob**: a secret never bites before its tale; no number on screen; no fail; the
  knot.
- **`catch-v3.mjs`**: a `--tales` row per tipped species, its land chance with and without the +2 at each class on its
  water's arrival tackle *(est.* +3 to +5 points at mid odds).

---

## 7. Fit with everything built or designed

| system | how the tales fit |
|---|---|
| **the catalogue** (SPEC §8.8) | a secret is absent until told, then a hatched silhouette with "· · ·" and a knot in its group (never in the list or its count); a tipped fish's card gains a knot; a told place is a heading among the places, with its knot; **still no percentage, count or odd under any fish**; the finds row is unchanged |
| **the Chart** (SPEC §5.4) | a told place inks in on its sheet with its glyph, name and a knot, never a price; nothing of it is drawn before its tale ("nothing unowned is drawn" holds: an untold place is nobody's); no lantern, Wick or meeting is ever on the Chart |
| **the three keys** (SPEC §5.5) | no tale is a key and no key needs a tale; a secret is never on a list (lists are frozen at their first edition); a tip on a missing listed fish only speeds the list (the larger of it and the pull); no tale opens a water |
| **the five passives** (`WICKS.md`) | §6.3: the Wick's firsts include a secret's first; Taper's never-common first bite is judged before any tip and includes secrets at their spot; Tallow's +1 good bite holds at a told place; Ashwick's comeback and a tip reach the total cap together; Stub is untouched |
| **finds** (`FINDS.md`) | a told place snags at the built rate from its water's set; no tale names a find; no find counts for a tale; the 1% rule and the eleven per water stand |
| **the aquarium** (`AQUARIUM.md`) | a secret is rare, so it is eligible for the Well and swims in its water's room; a told place adds nothing to the rooms. With sixteen secrets the eligible kinds are 109, so the top tank (96) no longer holds one of every kind (listed for the lead, §13) |
| **giants and legends** | never tipped, never secret, never at a told place; their shares, their hours, their coin flip and the giants' page unchanged |
| **saves** (§9) | one new block, `meta.loop.tales`, and the trip's `run.meet`; the shared Journal holds a landed secret's entry; the flag-off game ignores it |
| **the words** (§8) | every new line is ≤ 8 words and ≤ 36 characters, at most three a meeting, never during a bite |
| **hidden odds** (SPEC decision 62) | a tip's number shows only in the player's logs; nothing in the play, the HUD, the card or the catalogue carries it |
| **no fail** (SPEC §3.6) | a missed lantern loses nothing; nothing expires; a told secret has the pull; a told place never closes |
| **Murk** | still the only trader and the only shop; never present at a meeting; two lines of his own about it (§8) |
| **the story** (`LORE.md`) | the mist is each flame's own forgetting (§2.11); Dip is a cold candle that caught again (§5.3 (4)); the Rime Sound's stool and seven knots are Glim's; the ending is untouched (no tale on a water's first evening, none at home, and the closing film never shows a far-water Wick) |
| **the art** | pinpoint lights only; no ring or disc; no new green light; the Mossmere byte-identical until its told place is told |

---

## 8. Words: every new line

The budget (SPEC §8.9, new): a far-water Wick's line is at most **8 words and 36 characters** (one line at 18 px on a 358 px
phone), one at a time, **at most three a meeting** (a greeting and two tale lines), each said once; it names no fish you have
not caught, carries no number, and speaks of fish, water and itself only. Every line is a `TEXT_LOOP` entry, scanned by the
build (length, words, numbers, the guards' word list, and a lore list: no "kingdom", "people", "fall", "great lantern",
"Murk", "hearth", "human").

| who | when | line | characters · words |
|---|---|---|---|
| Dip | its first meeting | "I lay down there a long while." | 30 · 7 |
| Glim | its first meeting | "Quiet up here. Sit, if you like." | 32 · 7 |
| Lean | its first meeting | "Another one out! Oh, that's good." | 33 · 6 |
| Farthing | its first meeting | "All this way? Me too." | 21 · 5 |
| Dip | the Mossmere, A | "The big-eyed perch rise at dusk." | 32 · 6 |
| Dip | the Mossmere, B | "My window's still under the Gate." · "A trout lives in it now. Go on." | 33 · 6 · 31 · 8 |
| Dip | the Mossmere, C | "The sturgeon sleeps by the chain." | 33 · 6 |
| Glim | the Rime Sound, A | "Long cod lie deep. Let it sink." | 31 · 7 |
| Glim | the Rime Sound, B | "The ice went back. Water wells up." · "A cod comes to taste it, by day." | 34 · 7 · 32 · 8 |
| Glim | the Rime Sound, C | "My hole. Skates come up at night." | 33 · 7 |
| Farthing | Lanternroot Lagoon, A | "The grouper drum at night. Listen." | 34 · 6 |
| Farthing | Lanternroot Lagoon, B | "Something's under the bright flats." · "Only its eyes show. Look twice." | 35 · 5 · 31 · 6 |
| Farthing | Lanternroot Lagoon, C | "Sharks under the stilts, after dark." | 36 · 6 |
| Lean | the Salt Gate, B (draft) | "There's a hull the night tide fills." · "Something wide-headed hunts inside." | 36 · 7 · 35 · 4 |
| Farthing | the Inkwood, B (draft) | "A hollow tree, and bees, still." · "Something gnaws its roots below." | 31 · 6 · 32 · 5 |
| Murk | the first tally after the first meeting, once | "Still out there, that lot? Good." | 32 · 6 |
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
  tip:    { first: 3, bite: 1.2, hold: 2, maxShare: 0.8 },        // hold: CATCH_V3.buffs.told (the persistent bucket)
  secret: { weight: 'kind', pull: true },                         // a rare of its spot's kind; the pull until first landed
  place:  { good: 1, kinds: ['day', 'night'] },
}
LOOP.tales = [          // in each water's order A, B, C; each slice adds the waters it ships
  { id: 'mossmere_a', water: 'mossmere', by: 'dip', kind: 'tip',    species: 'milkeye_perch',        after: { evenings: 3 } },
  { id: 'mossmere_b', water: 'mossmere', by: 'dip', kind: 'secret', species: 'casement_trout', place: 'low_windows', after: { list: true } },
  { id: 'mossmere_c', water: 'mossmere', by: 'dip', kind: 'tip',    species: 'bridgechain_sturgeon', after: { place: 'under_the_span', evenings: 8 } },
]
SECRETS = [ { id: 'casement_trout', name: 'Casement Trout', water: 'mossmere', spot: 'low_windows', plan: 'trout', rarity: 'rare',
              hours: ['night'], len: { typical: [50, 70], record: 125 }, play: 'sulker', look: '…', journal: '…' } ]   // the converter reads it beside the roster
arena.toldPlaces = [ { id: 'low_windows', kind: 'night', x, z, r, landmark: 'gate_low_windows', edge: 'rim' } ]          // the Mossmere's arena
arena.meets = [ { x, z }, … ]                                                                                              // 2–3 per water
TEXT_LOOP.farwicks = { greet: { dip, glim, lean, farthing }, tales: { mossmere_a: ['…'], mossmere_b: ['…', '…'], … }, places: { low_windows: 'the Low Windows', … } }
TEXT_LOOP.murk.firstMet, TEXT_LOOP.murk.firstSecretSold
CATCH_V3.buffs.told = { hold: 2 }        // counted with the relics (≤ relicCap 3), all buffs ≤ cap 6; in the log's figures
```

Pure helpers (`progression-loop`, the game and the sim alike): `talesReady(meta, D, waterId)`, `meetTonight(meta, D, waterId,
evening)` → `{wick, tale, spot} | null`, `tipOf(meta, D, waterId, speciesId)` → `{factor, hold} | null`, `toldSecretsAt`,
`toldPlacesAt`; `catalogueFor` gains the knots, the told secrets and the told places; `data.tipWeights(pool, tips)` (§4.1).

**The save** (one new block; nothing else touched):

```
meta.loop.tales = { told: [taleId], met: [wickId], last: evening, wait: n, lift: [placeId], landed: [taleId], pull: { speciesId: n } }
run.meet = { wick, tale, spot } | null       // tonight's lantern, chosen at dusk, restored by Continue
```

- `told`: every tale told, once, never undone; the tips, secrets and told places all derive from it and the data. Written in
  the same save as the beat's first line. `met`: the Wicks whose greeting has been said. `last`: the evening of the last
  meeting (the gap). `wait`: eligible evenings since the gap passed (the sure third). `lift`: told places whose mist lift has
  not played. `landed`: tips whose fish has been landed since the tale (×3 → ×1.2). `pull`: evenings at its water since its
  tale, for each told secret not yet landed.
- **Migration** (`migrateLoop`): a block without `tales` gains `{told: [], met: [], last: 0, wait: 0, lift: [], landed: [],
  pull: {}}`. An M1 save keeps everything and meets Dip on its next eligible evening.
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
  Veilwater; Glasswater's and the Pallid Deep's with slice 5; reach II with 6; III with 7; IV with 8.

### 10.2 Lanes and files (the slice)

| lane | owns |
|---|---|
| **A: the rules and the save** | `data.js` (`LOOP.farwicks`, `LOOP.tales`, the Mossmere's `SECRETS` row, `TEXT_LOOP.farwicks`, `tipWeights`, `CATCH_V3.buffs.told` and `catchBuffHold`'s told term) · `progression-loop.js` (the cadence and triggers, `told`, the pull for secrets, `tipOf`, the told places, `catalogueFor`'s told half, `endTrip`'s counters, `migrateLoop`) · `progression-af.js` (the told Hold in the log's figures) |
| **B: the water** | `fishing.js` (tips last in `rollSpecies`, clamped, and on the sign preroll; told secrets in pools; a told place as a place; no meeting tap during a bite) · `main.js` (the meeting inside a trip: tap, sail, the beat with the clock stopped, back) · new `actors-farwicks.js` (the rig with each look, the four rafts, the lantern) · `world.js` / `world-art.js` (the meet spots; the Low Windows' landmark from the Gate's kit and the edge parting) · `render.js` (the two-shot) · `audio.js` (§3.6) |
| **C: screens and words** | `ui-loop.js` (the lines on the ink pool with the speaker's flame glyph; the HUD knot; the catalogue's knots, told secrets and told place headings; the species page's re-read line; the card's knot stamp; the log lines) · `ui-icons.js` (the knot, four flame glyphs) · `chart-draw.js` (a told place's vignette with its knot) |
| **D: the fish and the art** | `src/roster-species.js` (the converter reads `SECRETS` beside the roster) · `models-fish.js` (the Casement Trout on the trout plan) · `ui-fishart.js` (its drawing and its hatch) · Dip's look and raft (the art lane) |
| **E: tools and tests** | `tools/validate-data.mjs` (below) · `tools/tests/loop-tales.test.mjs` (new, node) · `tests/farwicks.scenario.mjs` (new, browser) · `tools/audio-render.mjs --set=farwicks` · the balancing job's `clams.mjs --tales` and `catch-v3.mjs --tales` (§6.4); optionally `roster-check.mjs --secrets` (each secret's seed is a research animal with no roster descendant) |

**`validate-data --loop` adds**: every tale's water, teller (its reach), species and trigger exist; each water has A, B, C in
order; no tip names a giant or a legend; every secret's plan ships with its water, its name is original and unique, it is on
no list, its size is under its water's same-plan giants and its legend's 1.4× rule; every told place is a day or night water
with 1 good bite, no giant, at least 80% open water, inside its water's edge and clear of every place, dock and mooring; every
meet spot is open water at least 15 m clear (slack water on a river); every line meets §8's budget and scans.

### 10.3 Tests

- **The cadence**: no lantern before the save's 6th evening, in the tutorial, on a water's first evening, on a lift's
  evening, within 4 evenings of the last meeting, or without a ready tale; with a ready tale, a lantern within three eligible
  evenings; the roll seeded (a reload keeps tonight's lantern); a far-water Wick only in its own reach's waters; a tale of
  this water before another's; its greeting once.
- **The lantern and the beat**: it lifts at dusk at a meet spot in the camera's view; **no ring, disc or outline** (a pixel
  check round it and round both rafts); a tap sails only with the line in; never during a bite, a play, the show or a card;
  the clock frozen from alongside to out; at most three lines; a tap advances; the knot inks; reduced motion cuts.
- **Missing one**: home with the lantern untapped loses nothing; the tale stays ready and comes later; nothing expires.
- **Told once**: written at the first line; never told twice; a reload mid-beat keeps it told and does not replay it.
- **A tip**: ×3 until next landed, then ×1.2, at its water only; the larger of it and the pull, never both; in every drawn pool
  its share ≤ the larger of its untipped share and 0.8 (a property test over every pool and phase); Taper's rule and the
  sign rule give the same answer as untipped on seeded pools; +2 Hold in the persistent bucket, the total ≤ 6 with Ashwick's
  comeback; the log shows both; **nothing in the play, the HUD, the card or the catalogue shows a number** (a scan); the
  knot on its card; the knot stamp on the first landing after the tale; never on a giant or a legend.
- **A secret**: absent from the catalogue, every pool, signs, notes and the Journal before its tale; **never bites before
  its tale** (100,000 seeded bites at its spot); after, only at its spot and in its hours; the pull until first landed; on
  no list and no key; a first for the Wick; eligible for the Well; its knot stamp; Murk's line on the first sold.
- **A told place**: before its tale nothing on the Chart and only the edge in the world, a cast there a cast into the edge,
  and **the Mossmere byte-identical**; after, its vignette with its knot and no price, never on the shelf; its lift on the next
  evening there (3 s and the title card), replayed after a reload; 1 good bite (Tallow 2); no giant, no Elder; snags at the
  built rate.
- **Words**: every line ≤ 8 words and ≤ 36 characters; no number; the lore and guard scans; no uncaught fish named.
- **Saves**: an M1 save migrates with `tales` empty and loses nothing; the flag-off Journal ignores a secret's entry; the v1
  golden trace, the flag-off scenario run and the v3 scenarios unchanged.
- **Parity**: the game's `tipWeights` and the sim's agree on seeded pools; `--shipped=mossmere` byte-identical.
- **Phone and desktop**: the lantern's target ≥ 44 px; the line on one line at 18 px in 358 px; keyboard: Enter on the
  focused lantern sails, Enter or Space advances a line.
- **The user's look**, before the merge: a meeting with Dip at the Mossmere at dusk on desktop and on a phone, the Low
  Windows opening out of the mist, and the Casement Trout's card with its knot.

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
| **A tip gives the species away** | §4.1's clamp: never above 0.8 of a pool unless it already was; the rules judged untipped; no name for an uncaught fish |
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
29. **Their names: Dip, Glim, Lean and Farthing?** **Default: yes.** Any names you prefer cost nothing.
30. **Where does it go after M1?** **Default: right after the aquarium** (the engine and the Mossmere's tales), then each
    water's tales with the slice that ships that water. The other ways: before the aquarium; or with Sporewood.
31. **Should each far-water Wick keep to its own reach?** **Default: yes** (Dip in the old kingdom, Glim on the cold rim,
    Lean on the warm coast, Farthing in the green heart), so each era has its own. The other way: any of the four at any
    water you have opened, so you might meet Glim at the Mossmere.

---

## 13. What this changes elsewhere, and the log

**Amended in this branch** (each passage dated 15 November 2026):

| doc | what |
|---|---|
| `SPEC.md` → **v8.5** | §0 rows 24–28 (the user's idea and four answers) and decisions 71–80; §0.11 (what v8.5 changed); "maps are the only discovery" amended where SPEC states it (§0 row 1's ruling, §5.1 rule 12, §9's parked row); §8's rule, §8.1, §8.2, §8.6, §8.8 (the catalogue's secrets, told places and knots) and a new §8.9 (the far-water Wicks' words); §9's save; §13's after-M1 placement; §16 questions 26–31 |
| `LORE.md` → **v2.3** | the rules' line (the user's amendment to "the only way of discovering a new place"); §1; §2.11 (the mist is each flame's own; a tale as a remembering); §5.3 (the far-water Wicks met, the four, why they stayed out and why they tell); §6 (who speaks; who you meet); §9 (how the game tells it); §10's guards amended where the user's choice overrides them, and new guards for the far-water Wicks; §13's log |
| `LORE-BRIEF.md` | sections 2, 5, 6, 10, 12, 13 and the glossary, so the standalone brief is true again |
| `WORLD.md` | the Rime Sound's glacier and the Ice Foot (§5); a told place on the Chart (§10) |
| `M1.md` | one pointer line (§5): nothing of this is in M1 |

**Listed for the lead, not edited**: `QUEUE.md` (the lead's: the slice's place after M1, the default above); `AQUARIUM.md`
§6 and §8 (with sixteen secrets 109 kinds are eligible, so the Moon Pool's 96 no longer holds one of every kind: raise it to
112, or keep 96 as a choice); `WICKS.md` §1's list of earlier words ("maps are the only way to discover a place") stays as the
record of what was said then; `ROSTER.md` and `roster.json` unchanged (the secrets are not roster fish); `DESIGN.md` §19 and
CONTRACT unchanged until the build.

| revision | what changed, and why |
|---|---|
| 1 (15 November 2026) | written for the user's idea and four answers of 15 November 2026: four far-water Wicks, one to each reach (Dip, Glim, Lean, Farthing), met at dusk by a lantern you pull alongside, about once an hour, never missable; three tales a water: a tip (×3 until landed, then ×1.2 and +2 Hold for good, its number only in the logs), a secret fish on no page until told (sixteen, one a water), and four told places no chart drew; the knot as the one mark; the budget and `clams.mjs --tales`'s gates; built after M1 as its own slice after the aquarium, each later water's tales with its slice; six questions (SPEC §16 26–31). A docs job, one writer, no reviewer |
