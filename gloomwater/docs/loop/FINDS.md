# Finds from the water: treasures, barge parts and looks

*Binding design for what the line brings up that is not a fish (revision 2, 15 November 2026; revision 2 is the review's:
every barge part does one small, real thing at its water, §3.2; the rates' share of clams restated, §4.4; the catch path's
modules named, §12). Binding with `SPEC.md` v8.1
(§0 row 19, decisions 49–57, §3.1, §4.10, §6.2, §6.3, §8, §9, §13 step 5c, §16 questions 20–21), `M1.md` revision 4 (§2.16,
§4 step 5c), `LORE.md` v2.2 (each water's drowned works, §3; the guards, §10) and `WICKS.md` revision 3. The aquarium, whose
upgrades and looks are finds too, is `AQUARIUM.md`. Design only: no `src/` or `tools/` file changed with this document.
Every rate and value here is a starting number marked *(est.)* where it is a hand estimate; the balancing job sets the final
values in the sim (§10), and the sim's figures replace these when it prints them.*

---

## 0. The user's words, and the lead's defaults

> "We can catch things from the lake that sell for huge value or can upgrade our base or just be cosmetics" (15 November
> 2026)

**The lead's defaults** (this design improves their details, never their direction): a find takes a hold slot like a fish;
the Wick shows it like a catch (the show, with a find pose) and it gets its own card; a **Keepsakes** page in the Journal;
finds never count toward the catch key; three kinds: **treasures** (they sell, the rare ones for a lot), **barge parts**
(they upgrade the Slow Hearth, without breaking the shelf's pacing) and **cosmetics** (the user's word; on screen and in
these docs, **looks**, SPEC §6.3's word: worn by the Wick, the raft and the barge); each water its own themed set from its
drowned works; the jackpots are rare, and the clam sim models them so the 48-hour pacing and M1's shelf hold; a find is
hooked by automatic fishing, as a **snag** that comes up, with no new minigame; its odds hidden except in the logs; the M1
step that brings the Mossmere's finds is small.

**The standing rules this keeps.** You sell what you keep (SPEC §4, §6.4): a treasure is sold at the tally like a fish, and
a part or a look is kept instead of sold, so its slot is its price. Kept stays kept. No way to fail: a find never gets
away, never sinks the raft, never costs a clam. Automatic fishing: the same cast, strike and play, one tap. Odds only in the
logs. Very few words on screen. Nothing is fought; nothing is magic (`LORE.md` §2.13).

---

## 1. In one breath

Now and then the line comes up heavy and slow, with no fight in it: a **snag**. The Wick hauls it in and holds it up to the
light, dripping: a spoon, a coin, a lamp-glass, a bell, a purse. Its card says what it is. **Keep** it and it takes a slot
like a fish; at home Murk weighs it on his scale with the catch and pays for a treasure, or carries a part or a look
aboard, where it is fitted to the Slow Hearth, the raft or the Wick, and seen at every water from then on. A part also does
one small thing for good at the water it came from: a free tin, one more order, one more good bite. Each water gives
up its own things, from its own drowned works. Most are small. One in each water is somebody's whole fortune.

---

## 2. The rules

| rule | value | why |
|---|---|---|
| **what a find is** | an object of a water's drowned works, hooked on a bite; one of three kinds (§3) | the user's three: "sell for huge value", "upgrade our base", "just be cosmetics" |
| **how it is hooked** | **a snag**: any bite at a water may be a snag instead of a fish, at the water's snag rate (§4.1: 1 bite in 20 *(est.)*), in open water and at every place alike. Never on the first evening (the tutorial's trip stays a lesson in fish) and never on a legend's cast (her bait gives her sure bite) | automatic fishing as built: no new verb, no new minigame (DESIGN's cut "snag world tags" were obstacles that took the line; this is the opposite: a bite that brings something up) |
| **the tell** | the float slides under slowly and stays under, with no nibbles and no class tell; the rod bows steadily | the size shows, the species hides (SPEC §10): here what shows is "heavy and not alive", and what it is hides until it breaks the surface |
| **the strike** | as any bite: tap in the window ("Now. Tap." on evening 1 is never a snag, so the tip stays a fish's). Not struck, it stays down and is gone, like a passed fish | one input for everything |
| **the haul** | the play runs itself: a slow, steady wind with the rod bowed, no runs, **never lost** (its land chance is 1). 2 s for a pinch find, 3 s for one held in both hands, 4 s for one brought alongside (§6.2). Holding anywhere hurries it, as a small fish | a find is not a fish, so it never escapes; the only loss in the game stays the fish that got away |
| **good bites** | a snag is a bite: struck or passed, it spends one good bite of that water (SPEC §3.3). A find let go at its card gives its bite back but **adds no favour** (the favour is a fish's) | the anti-grind rule holds: a snag is never a free re-roll |
| **the show** | the Wick holds it up like a catch, in a **find pose** (§6.2): turned once to the lens, a glint, water running off; no flaps, no life; a held beat, then the card | the user's "show it like a catch" |
| **the card** | its own card (§6.3): its ink drawing, its name, one line, **Keep** and **Let go** | — |
| **the hold** | **Keep** takes one slot, like a fish. A full hold refuses the cast as always, so no find ever comes up with nowhere to go | the hold decides (SPEC §1 pillar 2) |
| **kept stays kept** | a kept find stays in the hold until the tally, like a fish | SPEC decision 1 |
| **let go** | **Let go** drops it back: the bite is refunded, no favour, no clams. A treasure let go may come up again another evening; a part or a look let go stays in the water's set and may come up again | nothing is lost by choosing |
| **the tally** | treasures go on Murk's scale after the fish, by value, the jackpot last and alone with a giant's pause, and are paid; parts and looks are carried aboard, no price (§6.4) | you sell what you keep |
| **parts and looks never repeat** | once you own one, it leaves its water's draw; a water's draw is then all treasure | a second bell for the bow is not a find |
| **what a find never does** | count toward the catch key (the three keys' catch seal, SPEC §5.5), the Journal's species, a record, a class seal, an ink print, the giants' page, Murk's orders, the Old Ledger, or a Wick's firsts; stand in for a shelf item; change a price, a payout, the odds, a slot count or the shelf; add a percentage anywhere. A barge part's one capped effect (§3.2) is the only number a find moves | the catch key and every fish record stay about fish; the shelf's 32 items and its gates stay as they are (§3.2) |
| **the Wicks' passives** | Taper's first bite is its first **fish** bite (a snag does not use it up); Stub's quicker waits are every bite's, a snag's too; Tallow's bigger hold holds finds like fish; Ashwick's comeback never applies (a find never gets away); the Wick's firsts never pay on a find | the passives stay about fish (`WICKS.md`); the balancing job's ±10% runs with finds on (§10) |
| **no way to fail** | a snag can be passed, hauled or let go; none of it costs anything but the slot you chose to fill | SPEC §3.6 |

---

## 3. The three kinds

### 3.1 Treasures (they sell)

Things of value from the drowned works: tableware, door-rings, lenses, coins, and once in each water somebody's whole
fortune. Murk buys them at the tally like fish, by a fixed price per item: **the water's value tier × the item's grade**
(SPEC §4.1's tier, hidden; §4.2 here). Every water has **five**, one of each grade: *plain*, *fine*, *precious*, *rare* and
the **jackpot** (the grade words are these docs' only; the screen shows only the price). The jackpot sells for about twice
its water's giant Trophy, the rare one for about a giant Prize.

*Why Murk buys them:* he buys fish for their stories and lets them go (`LORE.md` §6), and he buys a find the same way: a
thing that was somebody's is news of the road. It goes into his towering pack with the empty birdcages and the crooked
umbrella ("Everything here was somebody's last hope once.").

### 3.2 Barge parts (they upgrade the Slow Hearth)

Fittings from the drowned works that the Slow Hearth can wear for good: a bell for the bow post, glass for the cabin
windows, a stone bollard for the stern. Each water has **three**. A part is kept, never sold: it takes the slot a fish would
have filled that evening, and is fitted at the tally's end (Murk sees to it by first light).

**What a part does.** A part is a **found fitting**: an upgrade only finds give, fitted at the place of one of SPEC §6.3's
upgrades, and it does two things. It changes **what you see and hear at home and of home from the water** (a bell that rings
you home, warmer windows seen from farther across the night water, a bollard the raft ties to: every part changes the home
frame, a before-and-after pair as a test, like every shelf upgrade). And it does **one small, real thing**, of the kind of
the upgrade whose place it takes, capped at one:

| a part's kind | what it does, for good, **at its own water** | the shelf upgrade it sits beside | its cap |
|---|---|---|---|
| **bait** (a planter, a pot, a carved hollow) | **+1 free tin** of the water's plain bait each evening, on top of the Bait Bed's floor (with no Bait Bed, a floor of 1). It tops you up like the Bed; it never piles up | the Bait Bed (§6.3) | one tin a water |
| **order** (a bell, a slate, a board) | once **Order Board I** is owned, **one more order** on the board, always for a fish of the part's own water, chalked and filled only while the barge lies there (elsewhere it waits, unwiped, like any order). Before Order Board I it does nothing but ring | Murk's Order Board (§6.3) | one order a water |
| **bite** (a lamp, a glass, a light) | **+1 good bite** at its water's open water each evening (one more dot on the float; the hold ladder's own kind, SPEC §3.3) | the Barge lights' place (home's light; the lights themselves stay looks only) | one good bite a water |

**At its own water**, because home goes where you fish: the barge is always moored at the water you are fishing, so a
part works whenever you fish the water it came from, and each new water's parts are the ones you use most while it is the
best water. It also caps itself: at any water at most +1 tin, +1 order and +1 good bite, however many waters' parts you
own, so sixteen waters' parts never add up to a second shelf. Each water's three parts are **one of each kind** (§5), so a
water's set completes one small upgrade of each kind there.

**What a part never does.** It never stands in for a shelf item: the Bait Bed, the Order Board and the hold are still
bought, and a part only adds its one beside them. It never changes a price, a payout, the odds, a slot count or the shelf,
and adds no percentage to a sale. So the shelf's 32 items in M1, its 7,750 clams and the full game's 144 purchases and their
gates (decision 38) stay as they are; what moves is how fast the clams come, and the sim prices that (§4.4, §11) inside the
gates already set. After M1, the aquarium's fittings are parts of another kind: there a part grows the aquarium's world,
not a number (`AQUARIUM.md` §8).

The other way (parts that only look and sound, with no effect at all) is SPEC §16 question 21: it leaves the shelf's
pacing untouched, but makes "upgrade our base" a second kind of look.

### 3.3 Looks (the user's "cosmetics")

Things to wear and dress: a tassel for the Wick's rod, a vane for the raft's stern post, window boxes for the cabin. Each
water has **three**, one for each wearer (the Wick, the raft, the barge). A look is kept, never sold, and worn at once,
everywhere: home goes with you. Each look has its **place** (its slot: the Wick's rod, the raft's stern post, the barge's
window boxes, and so on), and a found look takes a place of its own wherever it can, so it never takes off a look you
bought (SPEC §6.3's stay as they are). Where two looks would share one place, one is worn at a time, the last one brought
home; in M1 no place holds two (§5.1), so M1 needs no choosing; from the first water after M1 that brings a second look for
a place, the Keepsakes page lets you tap an owned look to wear it (§6.5).

### 3.4 After M1: the aquarium's pieces

When the aquarium is built (`AQUARIUM.md`, after M1), each water's set gains **four well pieces** (two fittings, which grow
that water's room in the aquarium, and two dressings, which dress it), drawn like parts and looks. They are not in any
finds table before the aquarium ships, so nothing is found that has nowhere to go.

---

## 4. Rates and values

### 4.1 How often

| term | value *(est.)* | so |
|---|---|---|
| **the snag rate** | **1 bite in 20** (`LOOP.finds.snag.perBite` 0.05) at a water's open water and every place; 0 on the first evening and on a legend's cast | about 0.25 snags a trip at Hold 3–4 (about 5 bites), 0.4 at Hold 5–6 (about 8), 0.45 at Hold 8 |
| **the kind** | while the water has a part or a look you do not own: **35%** of its snags are one of them (each unowned one equally likely, never one already in this trip's hold), else a treasure; **a soft guarantee**: each snag that brings a treasure while some are unowned raises the share by **15 points** for that water (to 100%), and a part or a look brought up sets it back to 35%. Once you own them all, every snag is a treasure | a water's six parts and looks come over about 18 snags: about **85% of players** own the Mossmere's six by M1's end, against about 55% without the guarantee (*est.*, a hand Monte Carlo of §4.3's snag counts; the sim reports it, §11) |
| **the treasure's grade** | plain **50%** · fine **28%** · precious **15%** · rare **5.5%** · jackpot **1.5%** | the jackpot about 1 snag in 67 of treasure |

### 4.2 What a treasure sells for

`clams = round(tier[water] × grade.x × LOOP.priceFactor)`, the grade's multiplier: plain **×2** · fine **×6** · precious
**×15** · rare **×50** · jackpot **×250**. The mean treasure is about **×11.4 the tier** *(est.)*, about a rare Keeper's
worth: on average a treasure pays like a good fish, and the long tail is the dream.

| water | tier | plain | fine | precious | rare | **jackpot** | its giant Trophy (SPEC §4.1) |
|---|---|---|---|---|---|---|---|
| 1. The Mossmere | 7 | 14 | 42 | 105 | 350 | **1,750** | 947 |
| 2. Sporewood Pools | 11 | 22 | 66 | 165 | 550 | **2,750** | 1,421 |
| 3. Glasswater Vault | 16 | 32 | 96 | 240 | 800 | **4,000** | 2,398 |
| 4. The Pallid Deep | 35 | 70 | 210 | 525 | 1,750 | **8,750** | — (no epic giant; its rare Trophy about 2,300) |
| 5. The Rime Sound | 45 | 90 | 270 | 675 | 2,250 | **11,250** | 7,335 |
| 6. The Thin Water | 69 | 138 | 414 | 1,035 | 3,450 | **17,250** | 8,841 |
| 7. The Last Light | 62 | 124 | 372 | 930 | 3,100 | **15,500** | 9,976 |
| 8. Pyrefall Gorge | 118 | 236 | 708 | 1,770 | 5,900 | **29,500** | 15,460 |
| 9. The Waxen Reef | 167 | 334 | 1,002 | 2,505 | 8,350 | **41,750** | 21,933 |
| 10. The Thunder Stair | 203 | 406 | 1,218 | 3,045 | 10,150 | **50,750** | 26,580 |
| 11. Rushlight Fen | 336 | 672 | 2,016 | 5,040 | 16,800 | **84,000** | 41,047 |
| 12. The Salt Gate | 269 | 538 | 1,614 | 4,035 | 13,450 | **67,250** | 43,729 |
| 13. Lampmoss Slough | 608 | 1,216 | 3,648 | 9,120 | 30,400 | **152,000** | 76,707 |
| 14. The Siltway | 794 | 1,588 | 4,764 | 11,910 | 39,700 | **198,500** | 109,151 |
| 15. Lanternroot Lagoon | 866 | 1,732 | 5,196 | 12,990 | 43,300 | **216,500** | 119,872 |
| 16. The Inkwood | 1,675 | 3,350 | 10,050 | 25,125 | 83,750 | **418,750** | 195,818 |

A jackpot sells for **1.5–2.1 times its water's mean giant Trophy** (the Pallid Deep, with no epic giant, about 3.8 times its rare Trophy) (the Mossmere's Toll-Keeper's Purse, 1,750, against a
Trophy Thousandcast Pike's 944), more than its legend's first landing in the early waters (the Mossmere's 500) and below it
late (the Banked Fire's 580,300 against the Inkwood's 418,750). The tiers are uneven where SPEC §4.1's are (the Last Light
below the Thin Water, the Salt Gate below the Fen), for the same reason; each value follows its water's tier, so nothing is
priced by hand. From 10,000 a value shows as "12.4k" (SPEC §8).

### 4.3 How rare is rare *(est.: hand figures from the rates above; the sim's replace them)*

| | per snag | per trip at Hold 6 (0.4 snags) | in M1 (about 45 trips, about 18 snags) |
|---|---|---|---|
| any find | — | 1 trip in 2.5 | about 18 |
| a part or a look (while some are unowned) | 35% and rising (§4.1) | 1 trip in 7 or better | about 5.8 of the set's six (all six: about 85% of players) |
| a rare treasure | 3.6% | 1 trip in 70 | at least one rare or the jackpot: about half of players (about 11–12 treasures) |
| **the jackpot** (while parts and looks remain) | 1.0% (a little less while the share climbs) | 1 trip in 250 | about 1 player in 6 |
| **the jackpot** (the water's set owned) | 1.5% | 1 trip in 170 | — |

Over the whole road (about 700 trips) a player brings home two or three jackpots, each in a different water as often as
not: a dream that comes true a few times, never a promise. Hidden on screen; shown in the logs (§6.5).

### 4.4 What finds do to the pacing *(est.)*

A find fills a slot that a fish would have filled, so **a part or a look costs about one fish's sale** and a treasure pays
its price instead of one. On the Mossmere a slot is worth about 15–65 clams through M1 and a treasure about 80 on average,
so the treasures about pay for the parts and looks: over M1 the treasures bring about **+920** clams *(est.: about 11.5
treasures × 80)* against about **−990** for the 18 slots, about **±0**, with a wide spread (a jackpot at hour 1 brings the
empty shelf about 30–40 minutes sooner). **The parts' effects** are what moves M1: the Mossmere's three come at about hour
0.4–1.5 on most saves, and once all three are fitted they add about **+6–10% a minute** there *(est.: the Gate Lamp-Glass's
good bite about +3–4% at Hold 5–6, the Rust Buoy-Bell's order about +4–6% once Order Board I is owned (the pacing run's
+6% an order), the Moat Bollard's tin about 10 clams an evening, +1–4%)*, so M1's empty shelf comes about **4–7% sooner**
than without finds (*est.*), inside the ±10% gate. Late, when a water's parts and looks are owned, a snag pays about 1.7
times the slot it fills, and the water's three parts add about +5–8% a minute while it is the water you fish, so the full
run ends about 2–4% sooner (*est.*), inside its ±5% gate.

**Finds' share of the clams** *(est.)*: about **11%** of M1's (about 920 of 8,000–8,500 earned) and about **9%** late (0.45
snags a trip × ×11.4 the tier ≈ 5.1 tiers, against about 7.5 fish slots × 6.7 tiers ≈ 50). That is the share the user's
"huge value" asks for: finds are felt in the purse, and fishing still earns nine clams in ten. The sim's aim is **8–12%**
and it **fails above 15%** (§11); if it lands above 12%, the first knob is `perBite` (0.04 gives about 7–9%).

The sim's gates are §11's: the M1 empty shelf's p50 within ±10% of the finds-off run and inside 2–4 h, its p10 at or above
2 h; the full run within ±5% of the finds-off run's own end (v8's gated pacing run ends at 47.6 h, SPEC §4.9).

---

## 5. Each water's set, from its drowned works

### 5.1 The Mossmere, in full (eleven finds; M1 step 5c)

*The capital's moat and Gate: drowned stone, rust and brass; the Toppled Bridge, the drowned belfry, the buoy lights, the
lily maze, the harbour's toll-tower (`LORE.md` §3 Act I, DESIGN §25.8's W9). Names reuse the built game's relics and
keepsakes where they fit (`src/data.js` `RELICS`, `COSMETICS_V3`, the Waystones' keepsakes); none carries its old effect.
The worn last link stays on the Toppled Bridge and the Gate's eight lit slits stay lit: the story's clues are never finds.*

| id | name | kind · slot | grade · clams | its line (≤ 8 words) | pose | what you see |
|---|---|---|---|---|---|---|
| `tin_spoon` | **Bent Tin Spoon** (the relic's name) | treasure | plain · **14** | "Someone ate every meal with this, slowly." | pinch | a dented tin spoon, its bowl bent |
| `door_ring` | **Brass Door-Ring** | treasure | fine · **42** | "Off a door four Wicks tall." | both | a green-black brass ring the size of the Wick's head, its boss worn smooth |
| `salt_lens` | **Salt-Glass Lens** (the relic's name) | treasure | precious · **105** | "Fitted to a lantern long since drowned." | both | a thick round lens, salt-frosted, catching the lantern's light |
| `two_headed_coin` | **Two-Headed Coin** (the relic's name) | treasure | rare · **350** | "Lucky, they said. Heads every time." | pinch | a heavy gold coin, a head on both faces |
| `toll_purse` | **The Toll-Keeper's Purse** | treasure | **jackpot · 1,750** | "Full. Nobody came to collect." | both | a waterlogged leather purse with a brass clasp, coins showing at its mouth; its slot gold-edged |
| `buoy_bell` | **Rust Buoy-Bell** (the Waystone keepsake's) | part (order) · the barge's bow post, beside the Order Board's bow board | — | "It rang the boats home once." | both | at home: on the bow post; it rings once as the raft ties up at dawn, and Murk's hand bell answers. **Once Order Board I is owned, one more order on the board, for a Mossmere fish** |
| `gate_glass` | **Gate Lamp-Glass** | part (bite) · the cabin windows | — | "Amber, from the Gate's drowned lamps." | both | the cabin's small square windows glazed amber: home's glow is warmer and reads farther across the night water (emissive only, no PointLight). **+1 good bite at the Mossmere's open water each evening** (the Mossmere's fish still know the Gate's lamps) |
| `moat_bollard` | **Moat Bollard** | part (bait) · the stern deck | — | "Carved stone. Boats tied here for centuries." | alongside | a squat carved stone bollard on the stern deck; the raft ties up to it, a turn of line round its neck; wet moss in the hollow of its carved crown. **+1 free tin of Mire Worms each evening at the Mossmere** (the worms keep in its moss) |
| `rod_tassel` | **Knotted Rod Tassel** (`COSMETICS_V3`'s) | look · the Wick's rod | — | "Every knot, a fish someone was proud of." | pinch | a tassel of knotted cord at the rod's butt, swinging as the Wick casts |
| `toll_vane` | **Toll-Tower Vane** | look · the raft's stern post | — | "It still points into the wind." | both | a small iron weathervane (a fish, of course) on the raft's stern post, turning with the evening's breeze |
| `lily_boxes` | **Night-Lily Window Boxes** | look · the barge's windows | — | "A window box, still flowering." | both | two stone boxes under the cabin windows, pale night lilies opening at dusk (the Mossmere's green only as a trace) |

No slot holds two looks in M1: the Wick's rod and the raft's stern post have no bought look, and the window boxes hang
below the windows the Gate Lamp-Glass glazes (the glass does a thing, the boxes only dress: the part and the look stay
two kinds). The barge parts stay inside the home's ≤ 6 main-pass calls (merged into the
hull's per-material meshes, §7).

### 5.2 The other fifteen waters: their themes

Each water's set is authored with its slice (after M1), to the same shape: five treasures (one per grade), three parts
(one of each kind, §3.2: a bell, slate or board for the order part, a lamp or glass for the bite part, a planter, pot or
hollow for the bait part; its slice names which), three looks (one per wearer) and, from the aquarium, four well pieces. Its theme is its drowned works (`LORE.md` §3); its
look follows its lushness step (`WATERS.md`); its story clue (the last link, the stool and seven knots, the dam's baskets,
the canal bed's kettle and chair, the wax-ringed niches, the banked hearth) is never a find, and nothing human (no face,
no figure, no name plate) ever comes up.

| water | the drowned works | its treasures (the jackpot named) | its parts | its looks | the aquarium's theme |
|---|---|---|---|---|---|
| 2. Sporewood Pools | the gardens | seed jars, a bee-skep lid, a gardener's brass trowel; **the Seed-Keeper's Casket** | the Potted Amber Glowcap (the Waystone keepsake), a garden lantern, a trellis for the roof | a gardener's sash, a glowcap pennant, a moss-pot for the bow | the glowcap garden and its pots |
| 3. Glasswater Vault | the vault where light was shelved | crystal stoppers, a reading-glass, a shelf-lamp; **a Chandelier Heart-Drop** | the Singing Crystal (the keepsake, on the chart table), a crystal shelf-lamp for the cabin, prism panes | a prism bead for the rod, a crystal lantern glass, a hanging prism for the stern | crystal shelves and prisms |
| 4. The Pallid Deep | the place of remembrance (gently) | belfry brass, a dark-lantern ring, a pier lamp's chimney; **the Belfry's Silver Bell-Tongue** | a pier lantern, the belfry's small bell for the stern, pale stone steps | a pale cloak-clasp, a white pennant, a chain garland for the eaves | the chain garden and pale stones (no statues) |
| 5. The Rime Sound | the sea road out: bell-buoys, wardens' posts | wardens' buttons, a frost-bound flask, a buoy lamp; **a Warden's Silver Compass** | a frozen buoy-bell, a warden's stove door, a sea-chest for the deck | a fur-trimmed hood, a buoy-red pennant, a lamp of frosted glass | kelp and ice-rock (the Long Winter's room is the largest) |
| 6. The Thin Water | the broken weir, the sluice lamp | sluice-keeper's keys, a weir pin, a lamp hook; **the Weir-Warden's Ring** | a sluice wheel for the stern, a weir-plank deck, a lamp bracket | a keeper's key on a cord, a sand-coloured sail patch, a weir-iron bow plate | weir stones over pale sand |
| 7. The Last Light | the lighthouse on the sea road | a ship's spoon, jetsam brass, a lamp-room key; **a Lighthouse Lens-Prism** | a ship's bell for the bow, a lamp-room lantern, wreck-timber rails | a sailor's knot for the rod, a signal pennant, a lens-prism for the roof | lighthouse rocks and wreck timbers |
| 8. Pyrefall Gorge | the snow temple, the Coin Run | coins left for luck (somebody's, long ago), a taper-holder, a temple bowl; **a Gold Votive Bowl** | a temple lamp, prayer-flag lines for the rails, a stone step | a taper-holder for the rod, a saffron pennant, a fire-bowl for the bow | the temple's steps and coin-strewn gravel |
| 9. The Waxen Reef | the coral-grown port town, Lamp Row | coral-crusted door-knockers, a tavern cup, a Lamp Row lamp; **a Coral-Crusted Strongbox** | a Lamp Row lantern, a shop sign for the cabin, coral-crusted rails | a coral bead, a harbour pennant, coral window boxes | coral (the reef's) |
| 10. The Thunder Stair | the broken lock stair | lock-keepers' keys, a gate gear, a brass horn's mouthpiece; **the Lock-Keeper's Brass Horn** | a lock-keeper's lamp, a gate wheel, a tower bell | a keeper's horn on the Wick's back, a tower-blue pennant, a gear-wheel bow plate | lock stones and foam pools |
| 11. Rushlight Fen | the dam, the fishing match | painted floats, a fishing reel of old brass, a basket buckle; **the Fen Match Cup** (somebody won it, laughing) | a dam lamp, a fisher's rod rack, a reed blind | a painted float on the rod, a match pennant, a creel for the roof | papyrus and the dam's foot |
| 12. The Salt Gate | the sea-gate and the shipyard | shipwrights' rules, brass fittings, a caulking iron; **a Gilt Stern-Lamp** | the shipyard's best: a carved stern board, brass rail caps, a ship's wheel | a shipwright's pencil, a launch pennant, a carved bow board | hull ribs on the slipway |
| 13. Lampmoss Slough | the canal's summit pound | dropped things: a canal kettle's lid, a barge-master's buttons, a lock key; **a Barge-Master's Strongbox** | a canal lamp, a tiller for the stern, a lock-gate bench | a barge-master's cap, a canal-green pennant, a tow-rope fender | the lock gate and waterweed |
| 14. The Siltway | the barge road, its mile-posts and sunk barges | a ferry token, a mile-post plate, a barge's bell rope; **a Brass Ferry-Lamp** | the Slow Hearth's own kind: a barge-house stove door, a ferry bell, a deck-house window | a ferryman's scarf, a mile-post-white pennant, a barge road sign for the bow | the sunk barge and the floating meadow's roots |
| 15. Lanternroot Lagoon | the stilt village, where the orchard met the sea | (never the offerings) a stilt-house wind bell, a pearl button, a lantern frame; **a Pearl from the Orchard's Edge** | a paper lantern string, a stilt post, a porch bell | a paper-lantern charm, a lagoon pennant, lantern garlands for the eaves | mangrove roots and paper lanterns |
| 16. The Inkwood | the orchard forest, where it began | an orchard pruning knife, a honey jar of old wax, a gourd ladle; **the Beekeeper's Gold Smoker** | a gourd lantern, an orchard bench, a hive for the roof (bees hum at home) | a beeswax bead, an orchard pennant, gourd window boxes | orchard roots and lantern-gourds |

---

## 6. How a find is shown

### 6.1 On the water

The float slides under slowly and stays; no nibbles, no feints, no class tell; the rod bows steadily. Strike as any bite.
**The haul** (2–4 s, §2): a slow wind, the rod bowed, the line hissing, a dull knock as it nears the raft; no runs, no
pans, no tension beats; the hurry works. It breaks the surface as the reveal: the object, dark and streaming, then lit by
the lantern. The clock stands still through the show and the card, as for a catch.

### 6.2 The show: the find pose

The built show (`actors-show.js`) with a **find row** in place of a fish's life row: `data.showPoseFor` takes the find's
own `pose` (one of the built five: **pinch** for a coin or a tassel, **both** for a lens, a bell or a purse, **alongside**
for a bollard brought to the raft's side), never its length. In the find row the object does not flap, struggle or breathe:
the Wick lifts it, **turns it once to the lens** (a glint runs over it), water runs off it in a few drips, and the beat
holds (a pinch find 1.2 s, both 1.5 s, alongside 1.8 s; the jackpot holds a giant's longer beat). The jackpot's glint is
gold and the lens eases a little closer. Nothing about the Wick is new: the five poses as built, holding a prop instead of
a fish.

### 6.3 The card

The catch card's frame (SPEC §8.2) with the find's ink drawing as its hero, its name, and its one line (≤ 8 words); no
weight, no length line, no class stamp. In the seal's place a small stamp of its kind: a coin for a treasure (gold for the
jackpot), a hull for a part, a ribbon for a look.

| button | words |
|---|---|
| keep, a treasure | **Keep** · clam glyph · its value |
| keep, a part or a look | **Keep** · a small glyph of where it goes (the barge, the raft, the Wick) · no price |
| let go | **Let go** (no knife: a find is never bait) |

### 6.4 The hold, the tally and home

- **The hold row**: a kept find sits in its slot as a small ink object (a coin, a hull, a ribbon), the jackpot's slot
  gold-edged like a giant's.
- **The tally** (SPEC §8.3): the fish go on Murk's scale first, lightest to heaviest, the giant last; then the treasures by
  value, each with its name (small, dim ink) and its value ticking up with a coin; **the jackpot last of all, alone, with a
  giant's longer pause** (after the giant if both came home). Then each part and look, its glyph and its name, carried
  aboard with no price. Then the total, and **Sold**.
- **After Sold**: each part or look brought home is fitted or worn as home opens (the home camera holds on it 1.2 s, once
  each; reduced motion cuts to it), so every one is a before-and-after on the barge, the raft or the Wick. From then on it
  is there at every water.

### 6.5 The Keepsakes page (the Journal)

A Journal page beside *Not fish*, its tab **Keepsakes**, shown from the first find. One panel per water you own (nothing
unowned is drawn, decision 42's rule), its eleven finds in three short rows: the treasures, the barge's parts, the looks.
A find you have had is drawn in ink with its name (a treasure with its count, "×3"; a part with its kind's small glyph, a
tin, a chalk mark or a float, the same glyph the hold's bait, order and bite dots use, and no words); one you have not is a dark outline
with no name, so a water's set reads as a set without saying how it is found. The jackpot's outline is the one drawn in
gold. A small **Odds ›** opens the log (built: the gear log's panel): this water's snag rate, its kind share and its grades
(the only place a find's % shows), and each owned part's effect as a line in the log's built style ("+1 tin · the
Mossmere"). From the first water after M1 that brings a second look for one slot, the page's looks
row lets you tap an owned look to wear it (a tick), the slot's other looks greyed; in M1 every look is simply worn.

---

## 7. Art

- **The props** (`src/models-finds.js`, new): each find one merged mesh in the toon material (≤ 400 triangles; the bollard
  ≤ 800), in the Starlit palette with metal as warm accents (rust, brass, a little gold), never neon; the same prop serves the
  show, the hold's ink glyph (drawn from its silhouette), the card's ink drawing (`ui-fishart.js`'s pen on the prop's
  outline) and, for a part or a look, its object on the barge, the raft or the Wick.
- **On the barge**: every part merged into the Slow Hearth's per-material meshes when fitted (no new draw call; ≤ 2k
  triangles for M1's three), the Gate Lamp-Glass an emissive variant of the windows, so home stays at ≤ 6 main-pass calls,
  ≤ 2 mirror, ≤ 2 shadow and no PointLight (`M1.md` §2.14). Looks on the raft and the Wick merged into their meshes.
- The Mossmere keeps its palette: green only as a trace (the window boxes' leaves); the lilies pale.

## 8. Sound

The haul's own sounds: a low reel creak and a hiss of line, a dull knock of something hard nearing the raft, a streaming
splash as it breaks the surface; no class chime (a find is not a class). The reveal: a soft glint chime, warmer and longer
for the jackpot. At the tally: the coin for each treasure, a heavier clink for the jackpot; a soft wooden knock for each
part or look carried aboard. At home, the parts' own sounds (the Rust Buoy-Bell's one ring at dawn, Murk's hand bell
answering). All inside the −1.0 dBFS master; `audio-render --set=show` gains the find's haul, show and card.

---

## 9. Words

Every new string (each for the lead's sign-off; SPEC §8 holds the whole text):

| where | words |
|---|---|
| the Journal tab | **Keepsakes** |
| each find | its name and its one line (≤ 8 words; §5.1's eleven in M1) |
| the card | **Keep** · its value, or **Keep** with a where-it-goes glyph; **Let go** (both built words) |
| the tally | each treasure's name and value, each part's or look's name; no new word |
| Murk, the first treasure sold (once) | "The water keeps what it takes. Mostly." |
| Murk, the first part or look brought aboard (once) | "That'll fit her. I'll see to it by morning." |
| Murk, the first jackpot sold (once) | "Somebody's whole fortune. Now it's yours." |

---

## 10. Save and data

```
LOOP.finds = {
  snag:   { perBite: 0.05, firstEvening: 0, legendCast: 0 },
  kind:   { share: 0.35, step: 0.15 },                            // of snags, while the water has an unowned part or look;
                                                                  // +step after each treasure snag there, back to share on a part or look
  parts:  { bait: 1, order: 1, bite: 1 },                         // each kind's effect at its own water, capped at one (§3.2)
  grades: { plain: {share: 0.50, x: 2}, fine: {share: 0.28, x: 6}, precious: {share: 0.15, x: 15},
            rare: {share: 0.055, x: 50}, jackpot: {share: 0.015, x: 250} },
  haul:   { pinch: 2, both: 3, alongside: 4 },                    // s
  hold:   { pinch: 1.2, both: 1.5, alongside: 1.8 },              // the show's held beat, s
  items:  [ { id, water, kind: 'treasure' | 'part' | 'look' | 'well', grade, slot, pose, name, line,
              effect: 'bait' | 'order' | 'bite' /* parts only */ }, … ],
}
meta.loop.finds = { got: { findId: count }, worn: { slot: findId }, share: { waterId: kindShare } }   // a part with got ≥ 1 is fitted
run.hold[i] = { find: findId }                                        // beside the fish entries
lastTrip.lines[i] = { find: findId, value }                           // the tally replays it
```

`migrateLoop` seeds `finds` empty and steps `v`; `freshLoop` the same. The Journal, records and prints are untouched.
`validate-data --loop`: ids unique; every find's water is a shipped or later water; every water's set has five treasures
(one per grade), three parts (one of each effect) and three looks (four well pieces once the aquarium ships); grade shares sum to 1; every line
≤ 8 words and 36 characters; every slot known; no find named after a real brand, a person or anything the names rule bars
(SPEC §14 risk 16).

---

## 11. The sim requirement (for the balancing job, which owns `tools/sim/clams.mjs`)

This design edits no sim file. The balancing job builds **a finds table per water** (`LOOP.finds` once in `data.js`; until
then the sim's draft table mirrors §4 and §5) and models:

- **The snag**: every bite at a water is a snag with `perBite` (0 on the first evening and on a legend's cast); a snag
  spends a good bite like any bite and takes a slot when kept; its kind by `kind.share` (with the soft guarantee's `step`)
  among the water's unowned parts and looks, else a treasure; a treasure's grade by `grades`, its value `tier × x ×
  priceFactor`; a part or a look once owned leaves the draw.
- **The parts' effects** (§3.2), at their own water only: the bait part's +1 free plain tin an evening (the Bait Bed's
  floor + 1, or 1 with no Bed; the sim's bait cost model), the order part's +1 order once Order Board I is owned (the
  pacing run's +6% an order slot, at that water), the bite part's +1 good bite at open water (through `goodBitesFor`).
- **The players**: the natural and pacing players keep every find while a slot is free; the **choosy** player keeps every
  part and look but **lets go a treasure worth less than the water's mean fish** at its arrival kit (the let-go refunds the
  bite, no favour), and that strategy is held to the anti-grind check (it may not beat the natural rule a minute); the
  giant hunt keeps none (a find is not a giant).
- **What it prints, and gates**:
  - `--shipped=mossmere --step=5c` against `--finds=off`, over 2,000 runs: the empty shelf's hour, p10 / p50 / p90; **gate:
    p50 inside 2–4 h and within ±10% of finds-off; p10 at or above 2 h** (the low tail is where a jackpot or an early part
    bites); the longest wait ≤ 30 min; the first giant still hour 0.4–3; trips ≤ 6 min with the visit home; the
    Mossmere's parts and looks owned at the empty shelf (p50, and the share of players with all six; report, aimed ≥ 80%);
    the hour each part is fitted (p50; report); **finds' share of M1's clams** (report, aimed 8–12%, **fail above 15%**);
    the share of players with a rare or the jackpot by then (report).
  - **The full pacing run**: the end within 40–60 h and **within ±5% of the finds-off run's own end** (v8's gated run:
    47.6 h); the longest wait ≤ 90 min; every §4.9 mark inside its target; "a new water is the best water from the day its
    map is bought" still holds for all 15.
  - **Per water**: snags a trip, a rare-or-better 1 in N trips and the jackpot 1 in N trips at its arrival kit (report;
    aimed: the jackpot 1 in 120–300 once the set is owned); the jackpot ≥ 1.5× the water's mean giant Trophy (**fail**; the
    Pallid Deep against its rare Trophy); its three parts' gain a minute once fitted (report, aimed ≤ 10%); finds' share of
    all clams over the run (report, aimed 8–12%, **fail above 15%**).
  - `--wicks`: each Wick's full shelf within ±10% of the five-Wick mean with finds on (`WICKS.md` §3).
  - The checks that must not move: anti-grind (no patient strategy, the choosy finds rule included, reaches the natural
    rule a minute), let go (a let-go find refunds its bite and gives no favour), bait (no tin beats the plain bait; the bait
    part's free tin is plain bait), every hold step and raft part paying its way, and the shelf's 32 M1 items and 144 full-run
    purchases unchanged (no part stands in for one).
- **The knobs, in order**: `perBite`, `grades.jackpot.share`, `grades.*.x`, `parts` (the bite part to "after dark only"
  first, then the order part to "from Order Board II"), `kind.share` and `kind.step`.
- **The aquarium** (after M1): its well pieces join each water's draw when it ships, and the full run is re-proven then.

---

## 12. The M1 step: 5c, the Mossmere's finds (S–M)

**Where and why.** After step 5b, inside QUEUE job 13 (the lead may run it as its own job). A find's three kinds need
everything they land on: the hold and the card (step 1), the show (built), the shelf economy settled (step 4), and the
barge, its object variants and the looks (step 5), and the parts' effects need the Bait Bed and the Order Board (step 4).
Earlier, at step 3 or 4, the parts and the window boxes would have no
barge to go on, so either they would wait in a crate (a screen M1 does not need) or the step would ship treasures alone
and come back for the rest. After 5b, nothing is drawn that has nowhere to go, the sim's finds table is proven once on M1's
finished shelf, and the step touches one roll, one play plan, one card, the tally, one Journal page, the parts' three
effects and the barge's variants.

| | |
|---|---|
| **the player can** | Feel a slow heavy bite with no fight, strike it and watch the Wick haul up and hold out something that is not a fish; read its card; keep it or let it go. Sell the Mossmere's treasures at the tally (a spoon for 14 up to the Toll-Keeper's Purse for 1,750). Bring home its three barge parts and see each fitted to the Slow Hearth and doing its thing (the bell ringing them home and one more order on the board, the amber windows and one more good bite on the float, the stone bollard at the stern and one more free tin), and its three looks worn by the Wick, the raft and the barge. Turn the Journal to **Keepsakes** and see the Mossmere's eleven, found and outlined, with an **Odds ›** |
| **data** | `LOOP.finds` (§10) with the Mossmere's eleven; `TEXT_LOOP`'s words (§9) |
| **modules** | `fishing.js` (the snag roll per bite, 0 on evening 1 and on a legend's cast; the tell; the haul with land chance 1; the landing **bypasses the fish path**: no `progression.makeFish`, no measure, no class-length wipe, the prop shown at its own size; the refund on a let go without favour) · `fishing-play.js` (a **`find` plan** for `planPlay`: no runs, no pans, no tension beats, land chance 1, its haul time by the find's `pose`, §2) · `fishing-fx.js` (the slow slide-under and the haul) · **the events** (CONTRACT §13, a new line): `fishing:bite {waterKey, sizeClass: 'find'}` (counted as any bite; `ui-hud-v3.js`'s class estimate shows nothing for `'find'`, and `audio-v3.js`'s play beats and music rules play the haul's own sounds, §8, never a class's), then **`fishing:found {findId, waterKey}`** in place of `fishing:caught` (no `fish:measured`, no `fish:landed`), so `actors-measure.js` and `ui-measure.js` never run and no Journal entry, record, class seal or print is written (`progression`'s `makeFish` and print untouched); the find card listens for `fishing:found` · `models-finds.js` (new: the eleven props) · `actors-show.js` (the find row; `data.showPoseFor` by the find's `pose`) · `progression-loop.js` (`run.hold` find entries; `endTrip` values treasures, carries parts and looks to `meta.loop.finds`; `lastTrip.lines`; the kind share and its soft guarantee; **the parts' effects**: the bait floor + 1 at `Sail`, the order part's extra order on `meta.loop.orders`, the bite part through `goodBitesFor`; `migrateLoop`) · `ui-loop.js` (the find card; the tally's rows; the Keepsakes page, its effect glyphs and its Odds ›; the order board's bow order) · `ui-hud-v3.js` (the hold glyphs, the jackpot's gold edge; nothing for a `'find'` bite) · `ui-fishart.js` (the find's ink drawing) · `actors-home.js` (the three parts as merged variants) · `actors-raft.js`, `actors-wick.js` (the vane, the tassel) · `audio.js`, `audio-v3.js` (§8; the `'find'` bite) · `data.js` (`LOOP.finds`; `goodBitesFor` takes the bite part) · `tools/validate-data.mjs` (§10's checks) |
| **tests** | over 20,000 bites at the Mossmere the snag share is 5% ± 0.5, and 0 on evening 1 and on the Matriarch's cast · a snag's bite carries `sizeClass: 'find'`, its landing emits `fishing:found` and never `fishing:caught`, `fish:measured` or `fish:landed`, and the measure never opens · `planPlay` with the find plan has no runs and lands every time · the soft guarantee: the kind share climbs 15 points after each treasure snag while a part or look is unowned and returns to 35% on one · the parts' effects at the Mossmere only: the bollard sets out one more free Mire Worms tin than the Bait Bed's floor (1 with no Bed), the bell adds one order once Order Board I is owned (none before), the lamp-glass makes `goodBitesFor('open')` one more; none of them at another water (a fixture with Sporewood shipped); the shelf's 32 items and their prices unchanged · a snag spends a good bite; a let-go find refunds it and adds no favour · a snag is never lost (its haul always lands) · a kept find takes a slot; a full hold refuses the cast · the tally pays a treasure exactly `tier × x` once (a reload during the tally pays once) and carries a part aboard with no clams · a part or a look owned is never drawn again; with all six owned every snag is a treasure · a find never counts toward the catch seal, a species, a record, a print, an order or the Wick's firsts (Ashwick never brings one back) · every part changes the home frame (a before-and-after pair each) and home stays ≤ 6 main-pass calls with all three fitted (`clarity-perf --home`) · the Keepsakes page draws only owned waters' sets, the outlines unnamed, the jackpot's in gold · the show's find row: no flaps, the right pose for each of the eleven, the jackpot's longer beat · `clams.mjs --shipped=mossmere --step=5c` (§11) · the v3 scenarios and the flag-off run unchanged |
| **the user's look** | the haul, the show and the card for a spoon, the purse and the bollard; the barge with its three parts; the Keepsakes page; desktop and phone |
| **left out** | the looks' wear toggle (no slot holds two looks in M1); the well pieces (with the aquarium, after M1); every other water's set (with its slice) |
| **size** | **M** (re-checked with the catch path named: the eleven props and the find row are most of it; the find plan, the bypass of the measure path, the new event and the parts' three effects add about 2–3 days to the S–M first estimate) |

---

## 13. How it fits the story

- **What a find is, in the world**: a thing that sank with the kingdom's works and lay where it fell, now and then caught
  on a hook. Murk's "The water keeps what it takes" (`LORE.md` §2.7) is still true of almost everything; his first-find
  line admits the "mostly".
- **Not magic, not plot**: a find has no power (the relics' names come without their effects), tells no story the
  landmarks do not, and opens nothing. No find is a fish made of lost things, a relic for a collector's plot, or a clue
  (`LORE.md` §10's guards).
- **Nothing human**: no face, no figure, no name plate, no bones; the Pallid Deep's finds are belfry brass and pier lamps,
  gently. Nothing that was left on purpose (the Lagoon's offerings, the Inkwood's wax rings) ever comes up; the Coin Run's
  coins were left for luck centuries ago, and Murk would say luck is for spending.
- **The parts and the barge**: the Slow Hearth was a barge family's floating home (`LORE.md` §6); fitting it with the
  road's own fittings, water by water, is the household gathering the road as it goes, as the sill gathers its stones.

## 14. Risks, and the knobs

| risk | guard, and the knob |
|---|---|
| **A jackpot early makes M1 too short, or finds make the long game faster** | the sim's gates (§11: M1 p50 within ±10% and p10 ≥ 2 h, the full run within ±5%); the knobs in order: `perBite`, the jackpot's share, the multipliers |
| **Finds crowd out fish, and the evening stops being about fishing** | 1 bite in 20, never on evening 1, never on a legend's cast; a find is always optional (pass or let go); the knob `perBite` |
| **The haul reads as a lost fight or a dull wait** | 2–4 s, hurried by a hold, never lost, its own sounds; the knob `LOOP.finds.haul` |
| **The words grow** | one name and one line per find, three Murk lines in all, one tab word; the Keepsakes page draws, it does not explain |
| **Parts feel like no upgrade at all** | each does one real thing at its water (a tin, an order, a good bite), shown by a glyph on the Keepsakes page and felt on the float and the board, and changes the home frame and its life; SPEC §16 question 21 asks whether they should only look and sound |
| **The parts' effects move the pacing, or stack into a second shelf** | each capped at one a kind a water, working only at its own water; never a shelf item; the sim's gates (§11: M1 p50 within ±10% and p10 ≥ 2 h, the full run within ±5%); the knobs: the bite part to after dark, the order part from Order Board II |
| **Draw calls at home grow with every part** | parts merge into the hull's per-material meshes (no new call); `clarity-perf --home` gates it |

## 15. Questions for the user

SPEC §16 questions 20 (how rare and how big the jackpots are) and 21 (whether barge parts should each do one small thing,
the default, or only look and sound), each with the default this design builds.
