# The Full Hold: catch, keep, sell, upgrade (binding spec, v4)

*Gloomwater's game loop after the user's redirect of 2026-11-13. This file is binding. Where it conflicts with DESIGN §1–§25 or CONTRACT §13 it wins (§12 lists what it replaces). Its numbers are proven by `tools/sim/clams.mjs`; when the numbers here and the sim disagree, re-run the sim and fix this file. Design only: no `src/` file changed with this document.*

**How to read it.** §1–§3 are the game and its rules. §4 is every number. §5–§7 are maps, home and raft. §8 is every word on screen. §9–§12 say what happens to what exists. §13 is the build plan. §16 lists the five questions only the user can answer.

**Vocabulary (new, always these words).** **clams** (the currency; "Shells" is retired) · **the hold** (the raft's storage for caught fish) · **slot** · **Keep / Let go** · **good bites** and **quiet water** · **an evening** (one trip) · **Home** · **the tally** (Murk buying the hold) · **the Chart** (the Map Table's screen) · **map** (the one word on screen for a lake map and a place map) · **day water, old water, night water, crown** (the four kinds of place; on screen they are four glyphs, never words) · **Murk's orders** · **ink print** · **the Jetty** (the first, small home).

---

## 0. The user's words, and the lead's rulings

| # | the user, verbatim | ruling |
|---|---|---|
| 1 | "Who are we and what is the gameplay loop? I basically want to try and catch big and rare fish, the fish we keep i want to sell for clams and we use the clams to upgrade our gear, raft, homebase, bait, lures, buy maps of new locations to fish, which is the only way of discovering a new place is to buy the map." | §1–§2 the loop. Big and rare fish are worth far more than small ones (§4.1). Clams buy six things: gear, raft, home, bait, lures, maps (§4). Nothing is found by exploring: a map is the only way a lake or a place becomes known and reachable (§5). |
| 2 | "for now park the creature attacks." | The swarm and everything that only serves it or makes failure possible is switched off behind one table of flags and kept in the code (§9). |
| 3 | "I just want to catch fish so we're limited buy storage for caught fish in our boat starting at 3 catch slots." | The hold: 3 slots at the start, 8 at the most (§3.1, §4.2). No food, no oil to manage. |
| 4 | "there's no way to fail, but once your boat is full you can't catch anymore fish and you might not catch a big one at all as its chance" | No fail state anywhere (§3.5). A full hold refuses the cast (§3.1). A big fish is a chance each evening, never a promise: 54% of first trips bring home no Prize or bigger (§4.9). |

**Decided by the lead (and why).**

| decision | why |
|---|---|
| **Kept stays kept.** A fish in the hold stays there until Murk buys it. No swapping, no throwing back later. | "Once your boat is full you can't catch anymore fish": a full boat is final. A swap is a bigger hold by another name and removes the one decision the hold creates. (Question 1, §16.) |
| **The water goes quiet.** Every water has a few good bites an evening, and every bite spends one (§3.3). | Without it the best play is to let everything go until giants bite: the sim shows 3–4 times the clams per trip for that grind. With it, waiting never beats fishing naturally. No timer and no fail state are added. |
| **Every trip is an evening.** You sail late in the day; dusk falls after 40 s on the water; night lasts until you turn for home (§3.4). | Night stays the big-fish hour without a clock to watch or a button to skip to it. It gives the hold its shape: slots filled in daylight cannot hold what comes up after dark. |
| **Clams are the only key.** No proof catches, no tolls, no legend gates. | The user named one currency and one way to discover places. |
| **One lure and one bait at once.** | With one slot for both, a consumable bait never beats a permanent lure (the economy proposal's finding), and the user listed both as things to buy. |

**The three proposals.** The economy and the maps proposals arrived as text. The trip-and-home proposal's text did not reach the lead; its scratch sims did (`tools/out/loop/trip-and-home/`, untracked), and its idea, a trip that starts before dusk so "the last hook waits for the night", is taken as §3.4. §15 lists where the proposals disagreed and what was decided.

---

## 1. Who we are

You are **the Wick**: a small living candle, one of the last of a drowned kingdom. Home is **the Landing**, a cove where the trader **Old Murk** keeps his barge. You fish from a raft. Murk buys what you bring home and sells you everything else.

**The game in one breath.** Pick a water you own a map for. Sail out for the evening. Catch fish; keep one or let it go. When the hold is full, go home. Murk pays clams. Clams buy a bigger hold, better tackle, lures, bait, a better raft, a better home, and the next map.

**Pillars (they replace §25.1's list; when two conflict, the higher wins).**

1. **Big and rare fish.** Size is the prize. The size shows on the line; the species hides until the reveal.
2. **The hold decides.** Few slots, no promise. Every keep is final.
3. **A map opens every water.** The next map is always on Murk's shelf, with a price.
4. **Art, atmosphere and fishing.** The Clear Night look, the lavender Starlit palette, and very few words on screen.
5. **No way to fail.** Nothing is lost except the fish that got away.
6. **One thumb, short sessions.** A trip is 2–5 minutes. Everything is a tap or a hold.

---

## 2. The loop at every scale

| scale | length | the loop |
|---|---|---|
| **a cast** | 10–40 s | read the water → cast → wait → the tell shows the size → **strike**, or let it pass → the play runs itself → the reveal → the Wick holds the fish up → the card: **Keep** (it shows the clams) or **Let go**. A lost fish leaves the got-away note. Every bite spends one good bite of that water. |
| **a trip** (an evening) | 2–5 min | the Chart: tap a water you own → **Sail** → late day, dusk, night → fish your places first, open water to top up → the hold fills → **Home**. You may go home at any time. Nothing sends you home. |
| **a visit home** | 20–60 s | the tally: Murk buys the whole hold, fish by fish → the shelf: one thing is usually affordable → the Chart → Sail. |
| **a session** | 5–15 min | 2–4 trips and 1–4 purchases. A goal line shows the next one ("Next: Hold 4 · 30"). |
| **the long game** | ≈ 19 h to buy everything | 4 lakes, 16 places, tackle T4, hold 8, the raft and the home built up, 4 legends, about 25 Elders. After that: the Journal's seals, records, legend rematches, and the later sheets (§5.2). |

### 2.1 The first ten minutes (the Wick, a fresh save, the game after slice 2)

| clock | where | beat |
|---|---|---|
| 0:00 | home | Murk: "Three slots in that hold. Fill them and come home." The Chart shows one sheet: the Mossmere. **Sail.** |
| 0:15 | the Mossmere, late day | First cast. A double pop: a Small. The player strikes anyway. A Dusk Minnow. The Wick holds it up. Card: **Keep · 2** / **Let go**. Kept: one slot fills. |
| 0:40 | | A plunge: a Keeper. Lost: "A Mossback Perch spat the hook." |
| 1:00 | dusk | The light turns. A Keeper Weeping Carp lands: **Keep · 21**. Two slots full. The float shows one good bite left. |
| 1:25 | night | A slow drag-under: a Prize. It lands (a Prize Reedjaw lands 3 times in 10 on starter tackle): a Reedjaw Pike. **Keep · 120**. The next cast is refused: "Hold's full." The Home pill pulses. |
| 1:40 | home | The tally: 2 + 21 + 120 = **+143**. Shelf: **Hold 4 · 30**, **Braided Gut · 50**, a map with a koi drawn on it, **60**. All three are bought. |
| 2:30 | | Trip 2 with four slots and a new place: the mist lifts off the Lily Maze. |
| 10:00 | | After 3–4 trips: hold 4, Line T1, the Lily Maze; 64 clams a trip on average. Many trips bring no Prize at all. One in twelve brings a Trophy. |

(The first trip above is a lucky one. The average first trip sells for 45 clams, and 54% of first trips have no Prize or bigger.)

---

## 3. The rules

### 3.1 The hold

| rule | value |
|---|---|
| slots at the start | **3** |
| slots at the most | **8** (five steps, bought in order, §4.2) |
| what takes a slot | one kept fish of any size; a legend takes one slot too |
| a full hold | the cast is refused. One line: "Hold's full." The Home pill pulses. You cannot fish for sport with a full hold. |
| what empties it | only the tally at home. Murk buys everything in it. Nothing is carried over to the next trip. |
| on screen | a row of slot glyphs, top-left. A kept fish is a small ink fish in its slot, drawn bigger for a bigger class. |

### 3.2 Keep or let go

- The card opens after the Wick has held the fish up. It has two buttons: **Keep** with the clam value, and **Let go**. From slice 3 a Small or a Keeper has a third, small one: **Cut bait** (3 strips, §4.5).
- **Kept stays kept.** There is no way to take a fish out of the hold on the water.
- **Let go is free and pays nothing.** No luck, no favour, no clams. (v1's release luck and v3's let-it-pass favour are switched off, §9.)
- **The record is yours either way.** The Journal page, the personal best, the class seal, the Old Ledger and the ink print are written at the measure, before the card. Selling a fish or letting it go loses none of them.
- **Let it pass** stays: no tap during the bite, and the fish lets go; the bait comes back. It still spends a good bite (§3.3). A passed Prize or bigger still lingers 45 s for one more cast (built), and that cast spends a bite too.

### 3.3 The water goes quiet (the anti-grind rule)

**The rule.** A lake's open water, and each place you own in it, has a few **good bites** each evening. Every bite spends one: struck or let pass, landed or lost, kept or let go. When they are spent that water is **quiet**: each further bite there has favour −0.15 (down to −1.2: almost all Smalls) and takes 30% longer to come (up to ×2.2). Only going home brings the water back.

| water | good bites an evening | favour there | what it is for |
|---|---|---|---|
| open water (the whole lake, one pool) | **4**, +1 per Quiet Hull level (to 7) | 0 | where you start; later, the top-up |
| day water | **2** | +0.35 | its own fish of the daylight and dusk |
| old water | **4** | +0.55 | **the only water where Elders bite** |
| night water | **3**, only after dark | +0.45 | the night fish |
| crown (a legend's pool) | **2** | +0.35 | the legend, on her bait in her hour |

- A quiet place is still better than quiet open water for a bite or two (its favour starts higher). Nothing ever stops biting: the hold can always be filled. There is no fail state in this rule.
- Legends, the got-away note and a Marked Fish follow the same count. Nibbles and feints are not bites.
- **The player sees it.** When the float settles it shows its favour notches (built) and, beside them, one small dot per good bite left in this water. A bite puts a dot out. With none left the float dims and one line shows once per water: "Gone quiet." Quiet water also looks quiet: no rise rings spawn there.
- **Why going home is attractive.** Home is where the fish turn into clams, where the water comes back, and where the next purchase is. A trip costs about 45 s of sailing, selling and shopping, so half-empty trips pay badly, and so does sitting on quiet water.

**Proof** (`node tools/sim/clams.mjs`, section 2; clams per minute as a share of the natural rule, which is "let Smalls pass while good water is left, keep the rest, move on when a water goes quiet, go home"):

| stage | natural rule: clams · minutes | best rule found | keep what bites | Prize+ while fresh, then fill | wait for dark | only Prize+, home when quiet | only Prize+, stay till full | only Trophy+, stay till full |
|---|---|---|---|---|---|---|---|---|
| first trip: T0, hold 3, open water (4 good bites) | 45 · 2.2 | 102% | 97% | 74% | 77% | 45% | 18% | 4% |
| 10 min: hold 4, one place (6) | 72 · 2.8 | 103% | 100% | 69% | 77% | 59% | 20% | 6% |
| 1 h: T1, hold 5, three Mossmere places (14) | 141 · 3.3 | 101% | 100% | 72% | 81% | 81% | 45% | 14% |
| 5 h: T2, hold 6, three Sporewood places (14) | 351 · 3.8 | 102% | 101% | 72% | 88% | 80% | 38% | 13% |
| 20 h: T4, hold 8, four Pallid places (18) | 1,726 · 4.6 | 102% | 102% | 73% | 90% | 83% | 46% | 17% |

- **No patient strategy reaches the natural rule per minute** (the best is 90%). The giants-only grind earns 4–17%.
- **The natural rule is within 3% of the best rule found**, so playing by feel is playing well.
- **The rule is needed.** With quiet water switched off, "only Trophy+, stay till full" brings **2.9–3.9 times** the clams per trip at every stage (203 against 52 on the first trip), and players would drift into it.
- Being choosy still has a place: from the first hour on, "Prize+ while fresh, then fill" brings 20–28% more clams per trip for about 1.7 times the minutes. It is a slower way to play, never the only one.

### 3.4 Every trip is an evening

| phase | water time | favour | what bites |
|---|---|---|---|
| late day | the first **40 s** | 0 | day fish and all-hours fish |
| dusk (*Last Light*) | the next **20 s** | +0.2 | the same |
| night (*Night Rise*) | **until you turn for home** | +0.25, +0.05 per Lantern level | night fish and all-hours fish; night water opens |
| dawn | the sail home and the tally | — | you come home at first light |

- The clock runs on the water only. It stands still during a catch's ceremony and card (built: the cinematic freeze), in menus and at home.
- Nothing ends the night. There is no second day inside a trip.
- Trips are counted as evenings ("Evening 14" on Journal entries), not days.
- With 3 slots and 4 good bites, the first bite or two come in daylight, the next at dusk and the last after dark: 65% of first trips get a bite after dark. A bigger hold reaches deeper into the night.
- A legend keeps her hour: the Belled Matriarch and the Drifting Grove bite by day and dusk, so a hunt for them sails straight to the pool; the Glass Sovereign and the Lantern-Swallower bite after dark.
- Waiting for dark on purpose pays 77–90% of the natural rule per minute (§3.3): allowed, never needed.

### 3.5 No way to fail

- No health, no hunger, no oil to run out of, no death, no timer, nothing that takes a kept fish or a clam.
- The lantern always burns. It is light and atmosphere, and its level (§7) changes how far it reaches.
- Closing the game mid-trip loses nothing: *Continue* restores the hold, the bites spent, the clock and the raft's place (built autosave).
- The only loss in the game is the fish that got away, and its note names it.

---

## 4. The economy

All prices are in clams. Every table below is the draft table `LOOP` in `tools/sim/clams.mjs`; it moves into `src/data.js` with slice 1.

### 4.1 What a fish sells for

```
clams = max(1, round(species.value × clamp(e^(0.9·z), 0.4, 30) × classBonus))      classBonus: Trophy 1.25 · Elder 1.6
```

`z` is the size score the game already rolls (§25.7.1). There is no lake normaliser, no quality multiplier and no streak multiplier (§9). The card shows this number on **Keep**.

| at a class's typical size | Small | Keeper | Prize | Trophy | Elder | Ancient |
|---|---|---|---|---|---|---|
| multiplier (it was 0.5 / 0.8 / 1.2 / 2.2 / 4.0 / 4.8 in §25.7.3) | ×0.5 | ×1.4 | ×3.5 | ×9.1 | ×22.8 | ×32.6 |

| lake · rarity (species) | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|
| The Mossmere · common (4) | 3 | 10 | 24 | 61 | 154 |
| The Mossmere · uncommon (2) | 8 | 24 | 58 | 150 | 376 |
| The Mossmere · rare (5) | 21 | 63 | 154 | 397 | 997 |
| Sporewood Pools · common (3) | 6 | 19 | 46 | 118 | 296 |
| Sporewood Pools · uncommon (3) | 17 | 51 | 125 | 320 | 804 |
| Sporewood Pools · rare (5) | 35 | 103 | 254 | 652 | 1,639 |
| Glasswater Vault · common (3) | 13 | 37 | 92 | 235 | 592 |
| Glasswater Vault · uncommon (2) | 29 | 85 | 208 | 534 | 1,343 |
| Glasswater Vault · rare (7) | 66 | 195 | 481 | 1,235 | 3,105 |
| The Pallid Deep · common (3) | 21 | 64 | 157 | 404 | 1,016 |
| The Pallid Deep · uncommon (2) | 44 | 129 | 317 | 815 | 2,049 |
| The Pallid Deep · rare (7) | 109 | 320 | 788 | 2,024 | 5,088 |

One Trophy is worth six Keepers of its kind; one Elder sixteen. Appendix A lists every species.

**Two extras, both paid at the tally.** A fish that fills one of **Murk's orders** sells for double (§6.3). A fish that beats Murk's **Old Ledger** figure for its species (a mid-Trophy, built) sells for double, once per species.

### 4.2 The hold ladder

| hold | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|
| name | Wicker Creel | Lidded Creel | Double Creel | Wellbox | Ferry Hamper | Harbour Chest |
| price | start | **30** | **120** | **450** | **2,000** | **10,000** |
| bought at about (pacing run) | — | trip 1 | 0.5 h | 1.8 h | 5.2 h | 10.6 h |

One more slot is worth +15–25% clams per trip for +12–18% minutes per trip (sim section 3). The first step is bought with the first sale.

### 4.3 Tackle (Rod, Line, Reel: the global gear)

The tiers, their names and their Hold are `TACKLE` as built (§25.6.6). Each slot is bought on its own. **Proof catches are gone**: T3 goes on Murk's shelf with the Sporewood map, T4 with the Glasswater map.

| tier | Rod · Line · Reel | Hold of a matched set | price per slot | on the shelf |
|---|---|---|---|---|
| T0 | Willow Switch · Twine · Wooden Winch | 0 | start | — |
| T1 | Ashwood · Braided Gut · Brass Spool | 6 | **50** | start |
| T2 | Whalebone · Waxed Silk · Clockwork | 15 | **300** | start |
| T3 | Glassreed · Glass-Gut · Whisper Drag | 25 | **1,200** | with the Sporewood map |
| T4 | Lantern-Spine · Silverthread · Tidewheel | 37 | **7,500** | with the Glasswater map |

What tackle is worth (natural rule, clams per trip at hold 6, each lake with three places; sim section 3):

| | T0 | T1 | T2 | T3 | T4 |
|---|---|---|---|---|---|
| The Mossmere | 158 | 168 | 185 | 202 | 210 |
| Sporewood Pools | 265 | 304 | 352 | 389 | 413 |
| Glasswater Vault | 512 | 610 | 729 | 858 | 942 |
| The Pallid Deep | 491 | 655 | 881 | 1,089 | 1,276 |

Tackle matters most where the fish fight hardest: T0 to T4 is +33% in the Mossmere and +160% in the Pallid Deep.

### 4.4 Lures (permanent, one fitted)

Data, effects and Hold are `LURES` and `CATCH_V3.items` as built (§25.6.3). Lures are bought once and kept for good; a snapped line never loses one.

| lure | helps | price | on the shelf |
|---|---|---|---|
| Feather Fly | insect feeders: +5 Hold, bite ×2 | **50** | start |
| Glimmer Spoon | predators: +6 Hold, bite ×2.5, bigger | **90** | start |
| Bone Jig | bottom feeders: +6 Hold, bite ×2.5, bigger | **110** | start |
| Harbour-Bell Spinner | Reedjaw Pike, Weeping Carp, Bridgechain Sturgeon: +10 Hold | **180** | start |
| Moth Popper | night-only fish at night: +6 Hold, bite ×2, bigger | **400** | with the Sporewood map |
| Spore-Lamp Fly | Mildew Angler, Nightbloom Carp, Velvet Ray: +10 Hold | **500** | with the Sporewood map |
| Mirror Shard | Mirror Pike, the Blind Scrivener, Shardspine Eel: +10 Hold | **2,400** | with the Glasswater map |
| Lantern Lure | glow fish: +8 Hold, bite ×2.5, much bigger | **4,000** | with the Glasswater map |
| Ferryman's Coin | Gilt-Eyed Eel, Candlewake Sturgeon, Shroud Ray: +10 Hold | **12,000** | with the Pallid Deep map |

### 4.5 Bait (consumable, one fitted beside the lure)

- A **tin holds 10**. One bait is spent per hooked fish (built: spent at the cast, refunded when the bite is let pass). With no bait you fish a bare hook; that is always allowed.
- A bait does three things: its fish bite more often (its `attract` list, ×2.5, built), those fish hold better (its Hold, built), and **every fish runs bigger** (its favour, new). Where the lure and the bait both give Hold on a fish, the fish gets the larger one, never both (built rule for two items).
- Some fish bite on one bait only (built `species.bait`).

| bait | tin of 10 | every fish bigger by | role | on the shelf |
|---|---|---|---|---|
| Mire Worms | **10** | favour +0.3 | the Mossmere's plain bait | start |
| Lumen Moss | **20** | +0.2 | the Gloam Eel and the Sleepspore Jelly bite on nothing else | start |
| Spore Cake | **45** | +0.25 | Sporewood's plain bait; the Threadling Eel bites on nothing else | with the Sporewood map |
| Ember Roe | **150** | +0.35 | the predators' bait: the plain bait of Glasswater and the Pallid Deep; the Blind Scrivener and the Lampwarden Angler bite on nothing else | with the Sporewood map |
| Glass Larvae | **40** | +0.4 | a key, not an earner: the Chime Jelly bites on nothing else | with the Glasswater map |
| Shimmerfly | **200** | +0.4 | every fish: bigger, and +2 Hold | with the Pallid Deep map |
| Cut bait | free | +0.3 on predators, bite ×2, +4 Hold | **Cut bait** on the card turns a Small or a Keeper into 3 strips instead of keeping it | — |

What a tin is worth (natural rule, net of the tin; sim section 4):

| stage · bait | baits a trip | clams a trip without | with, net | a tin earns |
|---|---|---|---|---|
| 1 h · Mire Worms | 6.7 | 143 | 153 | 2.4× its price |
| 1 h · Lumen Moss | 6.7 | 143 | 155 | 1.9× |
| 5 h · Spore Cake | 7.8 | 354 | 415 | 2.7× |
| 10 h · Ember Roe | 9.5 | 1,008 | 1,284 | 2.9× |
| 20 h · Ember Roe | 10.0 | 1,734 | 2,125 | 3.6× |
| 20 h · Shimmerfly | 10.0 | 1,734 | 1,978 | 2.2× |

Bait is worth buying (it earns 1.9–3.6 times its price) and is never a must. Ember Roe in Sporewood (0.8×) and Glass Larvae (0.9×) are bought for their fish, not for clams. Small fish have three uses: a slot when nothing better comes, an order, or bait.

### 4.6 Legends

| legend · pool | her bait, per try | first try lands (tackle of her lake) | tries expected | bait in all | first landing pays | later landings pay |
|---|---|---|---|---|---|---|
| The Belled Matriarch · the Bell Pool | Heartmoss Ball **60** | 27% (T1) | 2.8 | 169 | **500** | 200 |
| The Drifting Grove · the Mother's Cup | Glowcap Bulb **250** | 24% (T2) | 3.0 | 759 | **2,200** | 880 |
| The Glass Sovereign · the Fallen Chandelier | Prism Moth **1,000** | 21% (T3) | 3.2 | 3,221 | **10,000** | 4,000 |
| The Lantern-Swallower · the Bottomless | Last Candle **3,500** | 17% (T4) | 3.5 | 12,361 | **28,000** | 11,200 |

- The built legend rule stays: her bait, her hour, her pool: a sure bite; the land chance is never above 50%; each escape wounds her (+6 Hold, to +18, kept across trips).
- She needs a free slot and takes one. Her first landing pays her pool's map back. Later landings pay 40%.
- **No legend opens anything.** A legend is a crown, never a key.

### 4.7 The raft and the home (the tables are in §7 and §6)

| what | levels | prices |
|---|---|---|
| Oars | I–III | 60 · 300 · 1,500 |
| Quiet Hull | I–III | 100 · 600 · 8,000 |
| Lantern | I–III | 100 · 500 · 3,500 |
| Murk's Order Board | I–III | 70 · 400 · 4,000 |
| Bait Bed | I–III | 120 · 700 · 9,000 |
| The Long Wall | 4 wings | 250 · 1,500 · 9,000 · 22,000 |
| Landing lights | I–III | 200 · 1,200 · 14,000 |
| Looks (6) | — | 300 · 400 · 600 · 2,500 · 6,000 · 14,000 |

### 4.8 Maps (the catalogue is §5.2)

| | The Mossmere | Sporewood Pools | Glasswater Vault | The Pallid Deep |
|---|---|---|---|---|
| the lake's map | yours at the start | **800** | **6,000** | **18,000** |
| day water | 60 | 500 | 3,000 | 12,000 |
| old water | 150 | 900 | 5,000 | 18,000 |
| night water | 260 | 1,200 | 7,000 | 24,000 |
| crown | 500 | 2,200 | 10,000 | 28,000 |

**The whole catalogue:** hold 12,600 · tackle 27,150 · lake maps 24,800 · place maps 112,770 · lures 19,730 · raft 14,660 · home 62,440 · looks 23,800 = **297,950 clams**, plus about 16,000 of legend bait. Maps are 44% of all clams spent.

### 4.9 Pacing targets, and the proof

The pacing run (sim section 5) is an average player: 90% of the natural rule's clams, 25% more time per trip for looking around, plain bait from minute 30, +6% per order slot. It buys 77 things in a sensible order.

| mark | clams per trip | minutes per trip (without the looking around) | trips per purchase | bought | state | target |
|---|---|---|---|---|---|---|
| **10 min** | 64 | 3.5 (2.8) | 1.0 | 3 | hold 4, Line T1, the Lily Maze | first purchase after trip 1; 2–5 bought; 40–90 clams |
| **1 h** | 146 | 4.3 (3.4) | 0.8 | 16 | T1, hold 5, three Mossmere places | 100–220 clams; 0.7–2.6 trips; 11–18 bought |
| **5 h** | 509 | 4.5 (3.6) | 2.0 | 42 | T3, hold 6, Sporewood with three places | 300–700 clams; 1.5–5 trips |
| **20 h** | 2,409 | 5.9 (4.7) | 6.8 | 77 (all, since 18.5 h) | T4, hold 8, every map | 1,400–3,000 clams; everything bought in 17–24 h |

| milestone | when | target |
|---|---|---|
| the Sporewood map | **1.4 h** | 1.2–2.0 h |
| the Glasswater map | **5.0 h** | 4.5–6.5 h |
| the Pallid Deep map | **10.1 h** | 9.5–13 h |
| the last purchase | **18.5 h**, trip 222 | 17–24 h |
| the longest wait for one purchase | **70 min** (the Bottomless) | ≤ 75 min |
| the first Elder landed | due at about **hour 3.1** | hour 2.5–9 |
| Elders landed by the last purchase | **about 25** | — |

**The first trip** (natural rule, 6,000 trips): 45 clams on average, 20–80 for most players (10th–90th percentile); 2.2 minutes; 97% come home full; **54% bring home no Prize or bigger**; 8% bring a Trophy; 27% of hooked fish get away; 65% get a bite after dark.

**How rare is the big one** (sim section 4b):

| stage | an Elder bites on | an Elder comes home on | with the giants' lure and bait |
|---|---|---|---|
| 1 h, the Mossmere (T1) | 21% of trips | 2.5% (one in 40 trips) | 3.1% |
| 5 h, Sporewood (T2) | 21% | 3.7% | 4.9% |
| 10 h, Glasswater (T3) | 24% | 5.4% | 6.8% |
| 20 h, the Pallid Deep (T4) | 25% | 8.1% (one in 12 trips) | 10.5% |

An Elder shows itself (the dome) about every fourth trip once you own old water. Landing one is a story until late tackle.

**The buying order of the pacing run** (hour · what · price; the full table with trips is printed by the sim):

| era | purchases in order |
|---|---|
| the Mossmere, 0–1.4 h | 0.05 Hold 4 · 30 → Line T1 · 50 → map: the Lily Maze · 60 → Rod T1 · 50 → Reel T1 · 50 → Oars I · 60 → Order Board I · 70 → 0.5 Hold 5 · 120 → map: Under the Span · 150 → Bone Jig · 110 → Quiet Hull I · 100 → Glimmer Spoon · 90 → 0.9 map: the Buoy Lights · 260 → Lantern I · 100 → Feather Fly · 50 → Bait Bed I · 120 → **1.4 MAP: Sporewood Pools · 800** |
| Sporewood, 1.4–5.0 h | Line, Reel, Rod T2 · 300 each → 1.8 Hold 6 · 450 → map: the Lullaby · 500 → Harbour-Bell Spinner · 180 → Long Wall wing 1 · 250 → map: the Bell Pool · 500 → the Matriarch hunt · 142 → Oars II · 300 → Order Board II · 400 → 2.5 map: the Gill Harp · 900 → Landing lights I · 200 → Moth Popper · 400 → map: the Veilwater · 1,200 → Lantern II · 500 → Spore-Lamp Fly · 500 → Slate Cloak Dye · 300 → Quiet Hull II · 600 → Line T3 · 1,200 → Oxblood Pennant · 400 → Bait Bed II · 700 → Reel T3 · 1,200 → Amber Lantern Glass · 600 → 4.1 Rod T3 · 1,200 → **5.0 MAP: Glasswater Vault · 6,000** |
| Glasswater, 5.0–10.1 h | Hold 7 · 2,000 → map: the Mother's Cup · 2,200 → the Grove hunt · 613 → Long Wall wing 2 · 1,500 → map: the Stilled Cascade · 3,000 → Mirror Shard · 2,400 → Oars III · 1,500 → Landing lights II · 1,200 → 6.5 map: the Mirror Nave · 5,000 → Order Board III · 4,000 → Line T4 · 7,500 → Lantern Lure · 4,000 → map: the Broken Hymnal · 7,000 → Lantern III · 3,500 → Reel T4 · 7,500 → Painted Prow · 2,500 → 9.2 Rod T4 · 7,500 → **10.1 MAP: The Pallid Deep · 18,000** |
| the Pallid Deep, 10.1–18.5 h | Hold 8 · 10,000 → map: the Bier Barge · 12,000 → Quiet Hull III · 8,000 → 12.5 map: the Chain Garden · 18,000 → Bait Bed III · 9,000 → map: the Fallen Chandelier · 10,000 → the Sovereign hunt · 2,452 → Long Wall wing 3 · 9,000 → Ferryman's Coin · 12,000 → Landing lights III · 14,000 → Bell Buoy · 6,000 → 15.9 map: the Sunken Belfry · 24,000 → Long Wall wing 4 · 22,000 → 18.0 map: the Bottomless · 28,000 → the Swallower hunt · 12,361 → Gilt Lantern · 14,000 |

**What the sim found that shaped the design.**

- A new lake's open water beats the lake before it fully mapped, for Sporewood and Glasswater. The Pallid Deep does not until its old water is bought (303 clams a minute against Glasswater's 375, on T4 with hold 8). The pacing run stays in Glasswater for 26 trips after buying the Pallid map. This is accepted and flagged (§14, risk 3); the Pallid shelf shows the Chain Garden from the first day.
- What a place adds to a lake's income, bought in that order: day water +15–18%, old water +29–43%, night water +6–13%, the crown under 4% plus its legend. Old water is the best buy in every lake, as it should be: it is where the giants are.
- The model's limits: no cast depth, no signs, no weather, no Wanderers, orders as a flat 6%. Read every number as ±10%.

---

## 5. Maps: the only way to a new water

### 5.1 Rules

| # | rule | why |
|---|---|---|
| 1 | Two kinds of map, one word on screen. A **lake map** opens a lake's open water. A **place map** opens one named water in a lake you own. | The four lake arenas are built; a lake map sells in slice 1 with no world work. |
| 2 | **19 maps for sale**: 3 lake maps (the Mossmere is yours) and 16 place maps, four per lake: **day water, old water, night water, crown**. | One pattern, four glyphs (sun, ring, moon, crown), no words. |
| 3 | Open water gives fish up to Trophy. **Elders bite only in old water.** A place's own species bites only at that place. | Big and rare fish live on bought water. |
| 4 | **Clams are the only key.** A place map needs its lake's map. A lake map needs the lake before it. Nothing needs a legend, a catch or a count. | The user: the map is the only way. Luck never blocks a purchase. |
| 5 | **A lake you do not own is not in the world.** At home it is a rolled sheet on Murk's shelf, sealed with wax in the shape of its legend, with a price. | The big goal is in sight from the first minute. |
| 6 | **A place you do not own is standing mist**: a low lavender bank over that water, its landmark a dark shape inside. You can sail through it. A cast into it comes back ("Nothing bites in the mist."); the bait is kept and no bite is spent. On the Chart it is a blot with a glyph and a price, and no name. | The lake sells the next map without a word. You know something is there; you do not know what until you buy. Mist also hides a place whose art is not built yet. |
| 7 | **Buying a place lifts the mist for good.** On the first evening there, the bank thins over 3 s, the camera frames the landmark and an ink title card names the place (1.2 s). | The purchase pays out as a view. This is what "discovering a place" now is. |
| 8 | Maps are sold only at home. **Murk shows at most three**: the two cheapest place maps you can buy, and the next lake. | Few cards, always a next one. In a new lake both the day water and the old water are on the shelf at once. |
| 9 | **A map card names one fish**, drawn life-size beside the Wick, with the hour glyph, one line and the price. It does not name the place. | You buy a promise: a fish and an hour. (Question 3, §16.) |
| 10 | A trip is one lake and every water you own in it. The trip starts at the dock nearest the water you tapped on the Chart. | More maps mean more good bites and a longer evening. |

### 5.2 The catalogue

Sites are built arena features (`ZONES[].arena`, checked against data). The Mossmere's four places keep their §25.8.4 geometry (`MOSSMERE_V3.places`). The twelve places of the other lakes are **re-sited as raft waters**: they were authored for walking layouts that are not built. The centres below are for the build to validate against `world-layout` (open water ≥ 80%, clear of islands, docks and the spawn).

| map | kind | price | where (built feature · about x, z) | names this fish on its card | also there | the card's line (from `RUMOURS`) |
|---|---|---|---|---|---|---|
| **The Mossmere** | lake | start | — | the Belled Matriarch (her seal) | 8 open-water species | — |
| The Lily Maze | day | 60 | lee of Mossbell Isle · (−40.5, 24.5) | Candlefin Koi | Weeping Carp | "Under the pads, the koi glow like lanterns under snow." |
| Under the Span | old | 150 | the Toppled Bridge's piers · (−29.5, 0.5) | Bridgechain Sturgeon (its own) | Reedjaw Pike, Mossback Perch; **Elders** | "The bridge kept its chain. Something else kept the bridge." |
| The Buoy Lights | night | 260 | the west channel · (−48, −2) | Gloam Eel (on Lumen Moss) | Lampsipper | "The harbour lights never went out. They just went under." |
| The Bell Pool | crown | 500 | the Bell Pool · (−4, −14) | **the Belled Matriarch** | Weeping Carp | "Twice a day the moon looks in on the old bell." |
| **Sporewood Pools** | lake | 800 | — | the Drifting Grove | 8 open-water species | — |
| The Lullaby | day | 500 | the Lullaby Pool · (−28, −8) | Sleepspore Jelly (on Lumen Moss) | Velvet Ray | "Some fish sleep with their mouths open." |
| The Gill Harp | old | 900 | the south-east stalks · (39, 27) | Harpstring Eel (its own) | Velvet Ray, Threadling Eel; **Elders** | "Somewhere in the Pools a harp still knows one song." |
| The Veilwater | night | 1,200 | lee of West Lily Cap · (−36, −36) | Mildew Angler | Hushcap Koi (its own; here it bites after dark) | "A koi that only glows in the dark it keeps." |
| The Mother's Cup | crown | 2,200 | the Grove Well · (28, −16) | **the Drifting Grove** | Velvet Ray, Plumgill Perch | "The Mother breathes, and big things breathe with her." |
| **Glasswater Vault** | lake | 6,000 | — | the Glass Sovereign | 8 open-water species | — |
| The Stilled Cascade | day | 3,000 | lee of the Monolith of Tides · (−28, −40) | Rainglass Darter (its own) | Glassgill Perch, Prism Minnow | "Rain fell into the cascade the moment it froze." |
| The Mirror Nave | old | 5,000 | by the Monolith of Names · (−48, 0) | the Unreflected (its own) | Mirror Pike; **Elders** | "In the Nave, one fish has no reflection." |
| The Broken Hymnal | night | 7,000 | by the Monolith of Hymns · (48, 0) | Vesper Gar | Shardspine Eel | "A chord that was never finished." |
| The Fallen Chandelier | crown | 10,000 | the North Trench · (0, −37) | **the Glass Sovereign** | Mirror Pike, Shardspine Eel | "The great light fell here, and something keeps it lit." |
| **The Pallid Deep** | lake | 18,000 | — | the Lantern-Swallower | 7 open-water species | — |
| The Bier Barge | day | 12,000 | the Bier Barge wreck · (−10, −12) | the Wax-Bearer (its own) | Pallid Wraithfin, Shroud Ray | "The dead were sent off with wax on their brows." |
| The Chain Garden | old | 18,000 | under the north rib · (0, −37) | Candlewake Sturgeon (its own, at night) | Gilt-Eyed Eel; **Elders** | "Its scutes are candles nobody lit." |
| The Sunken Belfry | night | 24,000 | by the Candle Barge · (50, 4) | the Clapper (its own) | Lampwarden Angler (on Ember Roe), Gilt-Eyed Eel | "When the bell rings below, everything listens." |
| The Bottomless | crown | 28,000 | the Well · (0, −52) | **the Lantern-Swallower** | Lampwarden Angler, Shroud Ray | "The great lantern went down here. It is still going." |

(The lines for the Lily Maze, the Bell Pool, the Fallen Chandelier and the Bottomless are new; the others are `RUMOURS` tier 1 as written.)

**What becomes of §25.8's other places.**

| | places | what happens |
|---|---|---|
| **later sheets** (9 more maps, after the 16 ship; each brings its own species) | the Sluice Run, the Cupped Hands, the Gatehouse Door · the Puffball Vent, the Drowned Greenhouse · the Well of Ledgers, the Bell-Chapel Window · the Ferry Slip, the Long Pier | a second edition of the catalogue; priced between their lake's night water and crown; seven species wait for them (Appendix A) |
| merged | the Ferry-Market into the Bell Pool (its Moonfall); the Burning Glass into the Fallen Chandelier | one place each |
| cut | the Votive Font (fry water); the Drowned Almshouse (species on demand breaks "the species hides") | — |
| parked | the four secrets, Found Relics, Vistas, Remnants, residents, Astir, weather, everything reached on foot | §9 |

**Rumours.** The three tiers of `RUMOURS` become: tier 1, the line on the map's card; tier 2, Murk's one line when you buy it; tier 3, a note on the owned sheet once you have landed the named fish. Rumours are no longer quests and pay nothing.

### 5.3 What a place is, in play

A place is a small water (a disc or a lane, 5–8 m) with: its kind, its good bites and favour (§3.3), the fish it draws (`attract`, ×1.5–3), at most one species of its own, a landmark, a dock, and its mist. Slice 2 ships places as this data. The twists of §25.8 (the bowl that overflows, threading the arches, sight casting, Moonfall) are polish added per place afterwards (slice 6); no place waits for its twist.

### 5.4 The Chart (the Map Table)

- One sheet per lake you own, side by side; the next lake is the rolled, sealed sheet at the end with its price.
- A sheet is the lake's outline in ink. Owned places are small vignettes with their glyph and name. Unowned places are mist blots with a glyph and a price. Under each owned place: your best fish there (species glyph, cm).
- **One action:** tap a water (a place, or open water), then **Sail**. Tapping a blot or the rolled sheet opens Murk's card for it.
- Below the sheet: the lure slot and the bait slot (two glyphs, a count on the bait), and the hold's slots.
- First it is a screen (slice 1: a list of sheets; slice 2: the drawn sheet). When the Landing is built it is the Map Table's top (§6.1).

---

## 6. Home: the Landing

### 6.1 The smallest honest home, and how it becomes the Landing

| stage | what home is | built from |
|---|---|---|
| **the Jetty** (slices 1–3) | A screen over the live scene: the lake's first dock at dawn, Murk's barge moored, your raft tied up. Three ink tiles, one word each: **Murk** · **Chart** · **Journal**. Your clams, top-right. One goal line. Home upgrades you own are drawn on the tiles and in the scene (the order board on the barge, the bait tub on the dock). | Murk's barge and the docks (built: `actors-merchant`, `world.getMerchantDock`), the shop screen, the Journal |
| **the Landing, raft-mode** (slice 4) | The cove of §25.4 as its First Evening slice: quay, jetty, hearth, Murk's barge, the sea-gate and the four Waystones. You stay on the raft; the three tiles become three posts you sail up to. Home upgrades are objects in the cove. | the cove world of §25.14.2b (FE-W1; `world.js SUPPORTS_COVE`), `player-cove.js` (built) |
| **the Landing, walked** (later, not planned here) | The full walkable cove of §25.4. | needs the foot controller (parked) |

Home is honest at every stage: it is where Murk is, where the fish become clams and where the water comes back. Only its look grows.

### 6.2 What grows at home without clams

| trigger | what shows |
|---|---|
| a lake map bought | its sheet is pinned beside the others; its Waystone lights at the sea-gate (the Landing) |
| a place map bought | its vignette is inked on the sheet |
| a species landed | its Journal page; its ink print (§6.4) |
| a legend landed | her print hangs under the sea-gate arch; her Waystone burns gold |
| tackle, raft parts, looks | the rod on the rack, the raft at the jetty and the Wick wear what you own |

### 6.3 What clams build at home

| upgrade | level · price | what it does | what you see |
|---|---|---|---|
| **Murk's Order Board** | I 70 · II 400 · III 4,000 | Murk chalks 1 / 2 / 3 **orders**. An order names a fish from a lake you own ("2 Dusk Minnows", "a Prize Weeping Carp"). Every fish that fills it **sells for double**. An order is replaced when filled, or after 3 evenings. Two orders in three ask for common or uncommon fish. | a chalk board on the barge; a bigger board; a board on the quay |
| **Bait Bed** | I 120 · II 700 · III 9,000 | Each evening you set out with at least 3 / 6 / 10 of that lake's plain bait, free (Mire Worms, Spore Cake, Ember Roe). It tops you up; it does not pile up. | a moss tub by the jetty; two; a planted bed |
| **The Long Wall** | wing 1 · 250 · wing 2 · 1,500 · wing 3 · 9,000 · wing 4 · 22,000 | One wing per lake you own a map for. A wing hangs your best **ink print** of every species of that lake, at true size on its painted ruler (§25.4.3's frames). | bare wall, then frames filling with prints, a candle under each |
| **Landing lights** | I 200 · II 1,200 · III 14,000 | Looks only. | jetty lanterns; quay lanterns; the sea-gate beacon |
| **Looks** | Slate Cloak Dye 300 · Oxblood Pennant 400 · Amber Lantern Glass 600 · Painted Prow 2,500 · Bell Buoy 6,000 · Gilt Lantern 14,000 | Looks only. The first three are `COSMETICS_V3`'s. | on the Wick, the raft and the jetty |

No home upgrade changes what a fish is worth except an order, and no upgrade anywhere adds a percentage to the sale.

### 6.4 Records without giving up the sale: the ink print

You sell what you keep, so nothing is mounted. Instead, at the measure (built: records are written at the seal stamp, before the card) the Wick takes an **ink print** of the fish. The print is yours whether the fish is kept or let go.

- The Journal keeps the best print per species (length, class seal, where, which evening). It is a new page of the built Journal.
- A Long Wall wing hangs those prints at true size. Until a wing is bought the prints live in the Journal only.
- The class seals (Prize, Trophy, Elder per species; §25.7.4) are the long goal after the shelf is empty.
- The Live Well, "mark for home", mounts and the keep-pond are parked (§9): they existed to carry a live fish home at risk.

---

## 7. The raft

| part | levels · price | what it does | what you see |
|---|---|---|---|
| **The hold** | 4–8 slots · 30 · 120 · 450 · 2,000 · 10,000 | one more slot each | a bigger creel on the deck, then a chest |
| **Oars** | I 60 · II 300 · III 1,500 | raft speed +1 m/s per level (6 → 9) | longer oars, a second pair |
| **Quiet Hull** | I 100 · II 600 · III 8,000 | one more good bite in open water per level (4 → 7) | a tarred hull, moss fenders |
| **Lantern** | I 100 · II 500 · III 3,500 | Night Rise +0.05 per level, and the pool of light reaches 15% farther per level | a taller lantern with clearer glass |

- The lantern's light is a soft pool with no edge. Nothing is ever drawn as a ring round the raft or the Wick.
- No raft part touches the land chance or the sale.
- v3's outfit maps onto this: Long Oars → Oars; Thick-Glass Chimney → Lantern (a new effect); the Rendering Brazier and the Cork-Soled Boots are parked.

---

## 8. Flows, and every word on screen

**The rule.** One line at a time. No panel of text. Numbers are prices, clams, centimetres and the count on a bait. Odds stay in the logs (§25.6.11). Murk speaks one line, rarely, and never during a bite.

### 8.1 On the water

| element | words | notes |
|---|---|---|
| the hold | none (slot glyphs) | top-left |
| the Home pill | **Home** | bottom corner, ≥ 56 px. With an empty slot it asks once: "Head home? 2 slots empty." **Home** / **Stay**. With a full hold it goes at once. Not available during a play. |
| the float | none (favour notches, good-bite dots) | shown when the float settles, cleared at the strike (built) |
| quiet water | "Gone quiet." | once per water per evening |
| a full hold | "Hold's full." | on a cast; the Home pill pulses |
| mist | "Nothing bites in the mist." | on a cast into an unowned place |
| tackle | none (the lure glyph, the bait glyph with its count) | built selector |
| the Journal glyph | none | locked while a line is in the water (built) |
| gone from the HUD | the oil gauge, satiety, Embers, the level bar, the day counter, the night-mode glyph, the flare button, Far Water | §9 |

### 8.2 The catch card

After the Wick has held the fish up and paused: the built card (name, class stamp and length as the hero, the record kicker in a few words).

| button | words |
|---|---|
| keep | **Keep** · clam glyph · the value |
| let go | **Let go** |
| cut (a Small or a Keeper, from slice 3) | **Cut bait** |
| an order is filled by this fish | a chalk tick and "Murk wants this." |

Gone from the card: Eat, Render, Release's luck, Mark for home, the Strike line (it moves to the Journal), the favour list (it folds behind the float, built).

### 8.3 Home

| step | what happens | words |
|---|---|---|
| the sail home | a 2 s glide; the sky pales to dawn | none |
| **the tally** | the fish go onto Murk's scale one by one, biggest last; each value ticks up with a coin sound; then the total | fish names (small), values, "order ×2", "Old Ledger ×2", the total "+146", one button: **Sold** |
| an empty hold | nothing to weigh | Murk: "Nothing? The water keeps its own counsel. Go again." |
| the Jetty | three tiles and the goal line | **Murk** · **Chart** · **Journal** · "Next: Hold 4 · 30" |

### 8.4 Murk's shelf

Five tabs, a glyph and one word each: **Tackle** · **Raft** · **Bait** · **Maps** · **Home**. A card is a drawing, a name, one line and a price button.

| item | the one line |
|---|---|
| Hold 4 … 8 | "One more slot." |
| a rod | "Holds every fish better. Casts farther." |
| a line, a reel | "Holds every fish better." |
| a lure | "+6 Hold against predators." (built gear line) |
| Oars | "Faster." |
| Quiet Hull | "One more good bite in open water." |
| Lantern | "Better nights." |
| a tin | "10 baits. Bigger fish." and, where true, "The Gloam Eel bites on nothing else." |
| a legend's bait | "For the Belled Matriarch. One try." |
| a map | the fish's name, the hour glyph and the map's line (§5.2) |
| Order Board | "Murk posts an order. Orders pay double." |
| Bait Bed | "Free bait every evening." |
| a wall wing | "Your best prints, on the wall." |
| lights, looks | no line |
| the button | the price. Too dear: the price dimmed and "42 short". Bought: "Yours." |
| tackle and lures | a small **Odds ›** opens the gear log (built), the only place a % shows |

### 8.5 Murk's lines (each once, unless noted)

| when | line |
|---|---|
| the first evening, at the Chart | "Three slots in that hold. Fill them and come home." |
| the first sale | "Clams. Spend them here. I'm the only shop left." |
| the first quiet water | "Quiet water. Move on, or go home." |
| the first Trophy sold | "Now that's a fish." |
| the first map bought | "It's in the mist. Go and look." |
| a lake map first affordable | "I've a chart you can afford now." |
| a legend's first landing | "Her. You brought me her. Sit down, I'll count it twice." |
| sailing out (rotating, built lines kept) | "Bring me something with a story." · "The big ones come up at dusk. They always did." · "Back already? Good. Out you go." |

---

## 9. What is parked

"Parked" means switched off cleanly and kept in the code. One table in data says what is off:

```
data.LOOP_ENABLED  = globalThis.GW_LOOP === true            (needs V3_ENABLED; the loop runs on the phase-1 data and the automatic-fishing code)
data.PARKED        = LOOP_ENABLED ? { swarm, combat, levels, embers, hunger, oilAsLife, nightModes, death, farWater, liveWell,
                                      meta, tolls, longDescent, challenges, quality, mercy, passFavour, murkInLake, runShop,
                                      residents, weather, walking: true … } : {}      (every key true)
```

`core.js` gets the same rollout switch as v3 (`?loop=1`, `localStorage gloomwater.loop`, a shipped default). Each module reads its own key once (`data.PARKED.swarm`), so one system can come back later by clearing one key. With the flag off the game is exactly today's (v1, or v3 as built): the v1 golden trace and the flag-off scenario run must stay unchanged.

| parked | modules | how it is switched off | its data and saves |
|---|---|---|---|
| **the swarm**: gloomlings, formations, elites, Wardens, Heat, the director | `combat.js`, `combat-enemies.js`, `combat-warden.js`, `combat-fx.js`, `models-swarm.js`, `models-creatures.js` | every trip's night mode is `still` (built: Still spawns nothing); the director never starts | `ENEMIES`, `FORMATIONS` untouched and still validated |
| **weapons**, the aura's damage, Flare, Zap, Burn-a-fish | `combat-weapons.js`, `combat.js`, `main.js` input | not created; Space, F and taps on the water do nothing but fish | `BOONS` untouched |
| **levels, Cinders, Boons, Kindles**, banked picks | `combat-levels.js`, level-up screens | XP is not granted; no offer ever opens | — |
| **Embers** (health), damage, armour, mending | `survival.js` | no source of damage; the gauge is hidden | — |
| **hunger**, Well-fed | `survival.js` | no drain; hidden; Well-fed's +2 Hold is not applied, so the log shows true odds | — |
| **oil as life**: burn, guttering, Snuffed, Last Flicker | `survival.js`, `survival-fx.js` | no drain; the lantern burns at its level's reach; the gauge is hidden | — |
| **Eat, Render** | `progression.js` `fishAction`, the card | not offered | species `food` / `oil` unused |
| **night modes** (Still / Lantern / Gloomtide), lamp-watch, Scorched | `combat-modes.js`, the mode cards | not shown; the mode is `still` | `BALANCE.nightModes` untouched |
| **death**, the Snuffed screen, Second Wick, epitaphs | `survival.js`, `ui-screens.js` | unreachable | — |
| **days**, the 5-minute day clock, dawn events | `survival.js` | the evening clock replaces it (§3.4) | `EXPEDITION.phases` untouched |
| **Murk in the lake**, selling on the water, his schedule | `progression-market.js` | he does not arrive during a trip | — |
| **the per-run shop** (`UPGRADES`), per-run lures at 40%, the combat kit, supplies (oil, food, chum) | `progression-market.js` | not offered; the shelf of §8.4 replaces it | `UPGRADES`, `SUPPLIES` untouched |
| **Memories, relics, the Shrine**, Waystone relics | `progression.js`, the Shrine screen | nothing is granted, shown or applied; relic Hold is 0 | `meta.memories`, `meta.relics`, `meta.unlocks` are kept in the save and never written; they work again if un-parked |
| **challenges** (48) and their unlocks | `progression-challenges.js` | not evaluated; the Trials screen is hidden | `meta.challenges` kept |
| **bounties in the lake**, Murk's Ledger | `progression-market.js` | replaced by Murk's orders, which reuse the bounty engine (§10) | `BOUNTIES`, `LEDGER` untouched |
| **tolls, descent gates, legend-gated lakes**, travel through the gate | `progression.js` `travel` | lakes are reached from the Chart; the gate is scenery | `ZONES[].unlock` unused |
| **quality** (Fine, Shimmering) and the strike streak as value multipliers; release luck (`mercy`); let-it-pass favour | `progression.js`, `fishing.js` | not applied (value is species × size); `LOOP` sets the two bonuses to 0 | `QUALITY` untouched |
| **Far Water, the Live Well, mark for home, mounts, the keep-pond, The Long Descent**, expeditions of several days | not built (P3) | stay unbuilt | `EXPEDITION`, `LONG_DESCENT` untouched |
| **residents, Astir, weather, rumours as quests, discovery by exploring, mastery, Tally Posts** | not built (P2) | stay unbuilt; places come from maps (§5) | `CONDITIONS`, `RUMOURS` kept (the lines are reused) |
| **walking** (§24), walked places, sister-candles, the Wayfarer | not built | `WALK_ENABLED` stays off | §24 data untouched |
| **proof catches** | `TACKLE.proofs` | not asked for | untouched |

**Saves.** The loop writes one new block and touches nothing else:

```
meta.loop = { v: 1, clams, evenings, hold, tackle: {rod, line, reel}, lures: [], fitted: {lure, bait}, bait: {id: count}, maps: {lakes: [], places: []},
              raft: {oars, hull, lantern}, home: {orders, baitBed, wall, lights}, looks: [], orders: [], legends: {id: landings}, prints: {speciesId: {…}} }
```

- A trip is a run with `run.outing = 'trip'`: its creel is the hold, plus `run.bites = {waterId: n}` and `run.eveningT`. `run.shells` is not used.
- Journal entries, records, class seals, the Old Ledger, got-away lists, legend wounds and Marked Fish stay where they are (`meta`, built) and are shared with the old game.
- An old save opens in the loop with a fresh `meta.loop` and everything else kept. A run in progress from the old game stays in the save and is offered again only with the flag off.

---

## 10. Every existing system

| system | status | the rule now |
|---|---|---|
| automatic fishing: cast, strike, the play, the reveal (§25.6) | **kept** | unchanged; the five promises hold |
| hidden odds, the logs, the gear log | **kept** | the gear log opens from Murk's shelf and the Journal |
| size shows, species hides; the night-ink proxy | **kept** | unchanged |
| the size model and the five classes (§25.7.1) | **kept** | Elders bite only in old water (it was three giant waters per lake) |
| the got-away note, the Glimpsed page | **kept** | unchanged |
| the light Marked Fish ("still out there") | **kept** | a lost Elder waits in that old water; +6 Hold once |
| signs (rise rings, boils, glow trails) | **kept** | none spawn in quiet water |
| let it pass, the lingering big bite | **changed** | no favour for passing; a pass spends a good bite |
| favour and the float's notches | **kept** | the float adds the good-bite dots |
| pressure (−0.12 per catch, reset at dawn) | **changed** | becomes §3.3: per bite, per evening, open water included, reset at home |
| the measuring ceremony, the landing's payoff, the catch show | **kept** | the card follows the show |
| the catch card | **changed** | Keep · value / Let go (/ Cut bait) |
| the creel | **changed** | it is the hold: 3 slots, bought to 8, sold whole at home |
| fish value (§25.7.3) | **changed** | §4.1 |
| food and oil from fish | **parked** | — |
| tackle tiers (§25.6.6) | **changed** | persistent, bought with clams at home, no proof catches, new prices |
| outfit | **changed** | the raft's parts (§7) |
| lures | **changed** | permanent, new prices, fitted beside a bait |
| baits | **changed** | a second slot; tins of 10; each makes every fish bigger |
| legend baits, the legend rule, wounds, growth | **kept** | new prices; she needs her pool's map; she opens nothing; her first landing pays the map back |
| Old Murk | **changed** | he stays home; the tally and the shelf |
| bounties, Murk's Ledger | **changed** | Murk's orders (§6.3): fishing templates only (`catchSpecies`, `catchRarity`, `class`, `nightFish`), paid as double sale |
| zones, gates, tolls | **changed** | maps (§5) |
| the four lake arenas | **kept** | as built |
| places (§25.8) | **changed** | 16 mapped places; mist; no discovery by exploring |
| rumours | **changed** | lines on map cards and sheets |
| day and night | **changed** | the evening (§3.4); the looks of each phase are kept |
| the Journal, records, class seals, the Old Ledger | **kept** | plus the Prints page and "Evening N"; an Old Ledger record pays double once |
| the Long Wall | **changed** | ink prints, bought by wing (§6.4) |
| the five Wicks | **changed** | §10.1 |
| challenges, Memories, relics, the Shrine | **parked** | — |
| the swarm, weapons, levels, Boons, health, hunger, oil as life, night modes, death, Far Water | **parked** | §9 |
| The Long Descent, the Live Well, the keep-pond, walking | **parked** (unbuilt) | — |
| the Landing as a 3D cove (§25.4) | **kept** | home's look; reached in stages (§6.1) |
| the First Evening (§25.4.8) | **kept** | three lines change (§11) |
| the opening cut scene | **kept** | unchanged (§11) |
| the Clear Night look, the Starlit palette, the UI style | **kept** | unchanged |
| the Tide Chart, Murk's Chum, supplies | **cut** | nothing to supply |
| the Votive Font, the Drowned Almshouse | **cut** | §5.2 |

### 10.1 The five Wicks

The Wick you start as is the Wick. The other four are candles of the Landing: each a look and one small fishing trait. Their combat stats are parked. No trait touches the hold, the sale or the good bites.

| Wick | trait (fishing only) | joins you when |
|---|---|---|
| The Wick | none: balanced | start |
| Taper, the Long Reach | casts 4 m farther; strike window +10% (its built `castMax` and `hookWindow`) | 12 species in the Journal |
| Stub, the Bright Little One | raft speed +1; the lantern reaches as if one level higher | the Sporewood map |
| Tallow, the Stout Candle | raft speed −0.8; +2 Hold on a Trophy or bigger | 5 Trophies landed |
| Ashwick, Burned Once | +3 Hold on the first fish hooked after dark each evening (built `CATCH_V3.buffs.wicks`) | a legend landed |

They are chosen at home (the hearth, when the Landing exists; a row on the Journal's first page before). They ship in slice 6. Until then the game has one Wick.

---

## 11. How the user's earlier decisions fit

| earlier decision | in the Full Hold |
|---|---|
| **Automatic fishing on a land chance that is never 100%; odds only in the logs** (§25.6) | Unchanged. The land chance still comes from the fish, its class, the tackle, the lure or bait and the strike. Relic and Boon Hold are 0 while parked, so the log's figures are a little lower than §25.6.6 prints for T1–T4 (by 1–3 Hold); the knob, if late Elders prove too hard, is one constant (§14). |
| **Gear is global; bait and lures are fish-specific** | Unchanged, and now both are fitted at once (§4.4–§4.5). |
| **Bigger fish are harder; the size class shows; the species hides until the reveal** | Unchanged. The card's clam value appears only after the reveal. A map card naming a fish is a promise about a water, not about a line (§5.1 rule 9). |
| **The got-away note** | Unchanged. |
| **A very short tutorial at the Landing: the First Evening** (§25.4.8) | Kept as designed: the wake by the hearth, one cast, one strike, the play, the reveal, the card. It teaches fishing only. Three lines change: Murk's wake line becomes "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it."; the First Outing card shows the Mossmere, three empty slots and **Sail**; Murk's departure line becomes "Three slots in that hold. Fill them and come home." The Quayling is still not for sale (the tutorial's card has **Let go** only). The hold, Home and the tally are taught by doing, on the first evening out (§2.1). Until the cove is built the game opens at the Jetty with the same departure line. |
| **An opening cut scene** | Kept. The Lantern Line's three lines stand ("…They fish to stay lit." is lore, and still true of the lantern at home). It plays before the First Evening, or before the Jetty while the cove is not built. |
| **On a catch the Wick holds the fish up, shows it, pauses, then the card opens** | Kept. The card of §8.2 opens after the pause. The ink print is taken in the same beat (a later polish: a sheet pressed and lifted). |
| **Very few words on screen** | §8 is the whole text of the loop: one word on the HUD ("Home"), two on the card, one line per shelf card. |
| **Art, atmosphere and fishing are the key drivers** | Every trip plays the game's best light: late day, dusk, the Clear Night. A new place is paid out as a view (the mist lifting). Quiet water looks quiet. |
| **The sharp Clear Night look, the lavender Starlit palette** | Kept. Mist banks are low (≤ 2.5 m), local and thin at the edge, so the air stays clear. |
| **Never a ring round the raft or the Wick; green only as a trace** | Kept. The lantern's light is an edgeless pool; the good bites are dots by the float, not a ring. |
| **Original work only** | Kept (§25.15.3). The hold is a row of slots, not a cargo grid; there is no spoilage, no storm timer, no panic. Names, places, fish and UI are ours. |

---

## 12. Precedence over DESIGN §25

While `LOOP_ENABLED`, this file overrides DESIGN §1–§25 and CONTRACT §13 wherever they conflict. With the flag off they stand as written.

| DESIGN section | under the Full Hold |
|---|---|
| §25.0 decision log | kept; row 11 added |
| §25.1 pillars | **replaced** by §1 here (pillars 2, 6 and 7 of §25.1 live on in it) |
| §25.2 loops and sessions | **replaced** by §2 |
| §25.3 expeditions, Waystones as gates, tolls, Far Water, the Live Well, Snuffed, Homecoming, The Long Descent | **replaced** by trips (§2–§3) and the tally (§8.3); the rest parked |
| §25.4 the Landing | kept as home's look; its stations become Murk, the Chart and the Journal; §25.4.4's growth table is **replaced** by §6; §25.4.8 kept with three lines changed (§11) |
| §25.5 night modes | **parked**; every night is still |
| §25.6 automatic fishing | **kept whole**, except: a lure and a bait together (§25.6.3), no favour for a pass (§25.6.4), parked buffs are 0 (§25.6.5), tackle by clams without proofs (§25.6.6), the card's choices (§25.6.8) |
| §25.7 size | kept; §25.7.3's value rule **replaced** by §4.1; food and oil parked; Elders only in old water; records kept and joined by the ink print |
| §25.8 world and locations | **replaced** by the map catalogue (§5); the Mossmere places' geometry and the place names are reused |
| §25.9 progression, §25.10 economy, §25.11 retention | **replaced** by §4 |
| §25.12–§25.13 supersession and sync | kept as history |
| §25.14 phase plan | **replaced** from here on by §13; what is built (P1, AF, the First Evening's logic) is the base; the P2–P4 lists are a parts bin |
| §25.15 risks, cuts, originality | the originality rules kept |
| §1–§24, Appendix A and B | as §25.12 says; and everything about combat, survival and the meta is parked (§9) |
| CONTRACT §13 | binding for everything kept; a §14 for the loop's API is written with slice 1 |

---

## 13. The build plan

Six slices. Each ends playable, behind `GW_LOOP`. **Every slice's gate:** `node tools/validate-data.mjs`, `node tools/check.mjs`, `node tools/sim/clams.mjs --quick`, the slice's browser scenario with no console errors, and the flag-off checks unchanged (the v1 golden trace, the flag-off scenario run). Sizes: S ≤ 2 days, M 3–6 days, L 1–2 weeks, one implementer.

### Slice 1: Three slots (M–L). The smallest thing that is already the user's game.

| | |
|---|---|
| **the player can** | Start at the Jetty. Sail to the Mossmere's open water for an evening. Catch fish automatically (as built). Keep or let go at the card, seeing the clams. Fill three slots; be refused a cast when full. Go home. Watch Murk's tally. Buy **Hold 4, Hold 5, Rod, Line and Reel T1 and T2**, and the **Sporewood map**. Pick a lake on the Chart and sail again. Close the game mid-trip and continue. Never fail. |
| **reuses** | automatic fishing and its logs; the catch card, the ceremony and the landing's payoff; the creel (as the hold); the market's sell-all; `TACKLE` tiers and `getLoadout`; pressure (as quiet water); the Still night; the Journal; the built lake arenas (the Mossmere and Sporewood are used); Murk's barge at a dock |
| **modules** | `data.js` (`LOOP_ENABLED`, `PARKED`, `LOOP`: value, hold, water, evening, the tackle prices, the Sporewood map, `TEXT_LOOP`) · `core.js` (the switch) · `main.js` (the trip flow: Jetty → Sail → Home → tally; no death flow) · new `progression-loop.js` (`meta.loop`, clams, the hold, the tally, the shelf, bites) wired from `progression.js` · `progression-market.js` (no Murk on the water) · `progression-af.js` (the loadout from persistent tiers; parked buffs 0) · `fishing.js` (bites and quiet water; the cast refused when full; no pass favour; no Elders in open water) · `survival.js` (parked drains; the evening clock) · `combat.js` / `combat-modes.js` (parked) · `ui-hud-v3.js` (slots, Home, dots; parked gauges hidden) · `ui-screens.js` and new `ui-loop.js` (the card's buttons, the tally, the Jetty, the shelf, the Chart as a list) · `tools/validate-data.mjs` (LOOP rules) · `tools/sim/clams.mjs` (reads `data.LOOP`; its draft table is deleted) |
| **data added** | `LOOP` (the tables of §4.1–§4.3, §3.3, §3.4), `PARKED`, `TEXT_LOOP` (§8) |
| **tests** (`tools/tests/loop.test.mjs`, browser scenario `loop-1`) | the hold: 3 slots, the 4th keep refused, the cast refused when full · keep and let go: both write the record; let go changes nothing else · bites: struck, passed, landed, lost and let-go bites each spend one; quiet after 4; −0.15 each to −1.2; no reset at dusk or night; reset at home · the evening: day 40 s, dusk 20 s, night holds; frozen in the ceremony · value: a Keeper Dusk Minnow (z 0.4) 7, a Trophy Reedjaw Pike (z 2.2) 308, an Elder Reedjaw Pike (z 2.95) 774; clams persist · the shelf: prices, the order of hold steps, a tier raises `catchChance`, the Sporewood map opens its sheet · parked: a night with no enemy, no change in oil, satiety or health, no death, no Memories, no Murk on the water · saves: continue mid-trip; an old save gains `meta.loop` and loses nothing · the scenario: fresh save → three fish → Home → +clams → Hold 4 → a second trip |
| **left out on purpose** | places and mist; bait and lures (the built selector is hidden); orders; the other raft parts; home upgrades; legends; the cove, the First Evening and the cut scene (owned by the opening lane; the default build flips to the loop only when slice 1 and the opening are both in); the other Wicks |

### Slice 2: The mist lifts (L). Places and maps.

| | |
|---|---|
| **the player can** | See mist banks in the Mossmere. Buy the Lily Maze, Under the Span, the Buoy Lights and the Bell Pool from a shelf of at most three map cards. Watch the mist lift. Fish each place's good bites; meet Elders in old water; hunt the Belled Matriarch with Heartmoss and be paid 500 for her. Use the drawn Chart. |
| **modules** | `data.js` (`LOOP.places` for the Mossmere from `MOSSMERE_V3` geometry; map cards) · `world.js` / `world-v3.js` / `world-fx.js` (mist banks from the built mist material; the landmark silhouettes that exist: the piers, Mossbell Isle, the buoy caps, the Bell Pool glimmer) · `fishing.js` (`placeAt` from `LOOP.places`; good bites and favour by kind; attract; a place's own species; night water; Elders by kind; a cast into mist) · `models-fish.js` (the sturgeon profile) · `render-camera.js` (the mist-lift shot) · `ui-loop.js` (the Chart's sheet, blots, the Maps tab) · `progression-loop.js` (maps owned, the legend's prize, wounds) |
| **data added** | 4 places, 4 map cards and lines, the Matriarch's bait price and prize |
| **tests** | a cast into mist returns and spends nothing · owning a map removes its mist and adds its good bites · Elders roll only in old water · night water gives nothing before dark · a place's own species bites nowhere else · the shelf never shows more than three maps · the Matriarch needs her pool, her bait, her hour and a free slot · draw calls inside §25.8.8's Mossmere line |
| **left out** | place twists, Moonfall, the harbour re-dress, the other lakes' places |

### Slice 3: Bait, lures and the raft (M).

| | |
|---|---|
| **the player can** | Fit a lure and a bait. Buy tins and permanent lures. Cut a Small into bait at the card. Buy Oars, Quiet Hull and Lantern and see them on the raft. Buy the Order Board and fill Murk's orders for double. Read the gear log at the shelf. |
| **modules** | `data.js` (`LOOP.lures`, `.bait`, `.raft`, `.home.orders`) · `progression-loop.js` and `progression-market.js` (tins, orders on the bounty engine) · `progression-af.js` and `fishing.js` (two fitted items; bait favour; cut bait) · `actors-raft.js` (the parts' models) · `player.js` (raft speed) · `ui-loop.js`, `ui-af.js` |
| **tests** | lure and bait Hold never stack (the larger counts) · a bait is spent per hooked fish and comes back on a pass · bait-only fish need their bait · Quiet Hull adds good bites to open water only · an order doubles exactly the fish that fill it · the sim's bait rows hold on real data |
| **left out** | lake-specific stock beyond Sporewood's; the Bait Bed |

### Slice 4: Home (L). The Landing in raft mode.

| | |
|---|---|
| **the player can** | Open the game with the cut scene and the First Evening (with the three changed lines). Come home to the cove at dawn and sail up to Murk, the Chart and the Journal. Buy the Bait Bed, the Landing lights, the first wing of the Long Wall and the looks, and see each in the cove. See a Waystone light for each lake owned. Browse ink prints. |
| **needs** | the cove world (FE-W1, `SUPPORTS_COVE`), from the opening lane |
| **modules** | `world.js` (cove objects per home level) · `main.js` and `first-evening.js` (the loop's lines and flow) · `player-cove.js` · `ui-loop.js` (posts for tiles; the Prints page) · `ui-fishart.js` (the print) · `progression-loop.js` (prints at the measure) |
| **tests** | the First Evening ends in the first trip in under 60 s · a print is written for a kept and for a let-go fish · the best print per species wins · every home level changes the scene · the cove's draw calls inside §25.4.7 |
| **left out** | walking at home; wings 2–4 (they come with their lakes) |

### Slice 5: Deeper water (L). Lakes two to four, complete.

| | |
|---|---|
| **the player can** | Buy all twelve remaining place maps, T3 and T4, the late lures and baits, and hunt three more legends. Finish the shelf. |
| **modules** | `data.js` (12 re-sited places, validated against `world-layout`) · `world-art.js` (twelve landmarks, one per place, in the lake's kit) · `fishing.js` (nothing new) · `tools/validate-data.mjs` (every place: open water ≥ 80%, a dock within reach, prices rising within a lake, every own-species has a place) · `tools/sim/clams.mjs` (the pacing run on real data; the targets of §4.9 are the gate) |
| **tests** | the pacing checks pass on `data.LOOP` · each lake's four places exist, lift and fish · the species count per lake matches Appendix A |
| **left out** | the later sheets |

### Slice 6: The long tail (each item ships alone, S–M).

The four other Wicks (§10.1) · the Old Ledger's double and its chalked names · one twist per place (the built §25.8 ideas: the overflowing bowl, threading the arches, Moonfall over the Bell Pool) · the nine later sheets · weather as "tonight's water" on the Chart · the ink-print beat in the catch show.

**If the swarm comes back.** It returns as a choice on the Chart ("a quiet evening" or "a Gloomtide evening") by clearing `PARKED.swarm`, `.combat`, `.levels` and `.embers`. Nothing in this spec has to move.

---

## 14. Risks, and the knobs

| # | risk | guard, and the knob |
|---|---|---|
| 1 | **Quiet water feels like being told to stop.** | It never stops the fishing; the dots make it readable; the first line comes from Murk as advice. Knobs: `LOOP.water.good` (per kind) and `stale.favour`. The sim's anti-grind checks say how far each can move. |
| 2 | **Two good bites at a bought place feels thin.** | A quiet place is still better than open water for two more bites; old water has four. More good bites pay the choosy player, not the natural one: with four at every place "only Prize+, home when quiet" brings 15–27% more clams per trip than the natural rule (it is −3% to +10% as specified) and natural play gains nothing. Two keeps natural play the best on both counts. Knob: `water.good.day` / `.night` / `.crown`. |
| 3 | **The Pallid Deep pays less than Glasswater on arrival.** | Its old water is on the shelf from the first day and fixes it. Knob: the Bier Barge's and the Chain Garden's prices, or +1 good bite in Pallid open water. |
| 4 | **Twelve places must be re-sited and dressed.** | They ship as data first (mist, a landmark, good bites); art and twists follow. If slice 5 slips, the gap between maps in hours 5–18 grows; the shelf's raft and home items fill it. |
| 5 | **Elders are too hard without the parked relic and Boon Hold.** | The sim lands the first Elder at about hour 3 and about 25 by hour 18. Knob: `LOOP.craft` (0–3 extra Hold on every fish), off at first. |
| 6 | **Night water is a weak buy on income alone** (+6–13%). | It is bought for its fish, which no other water has. Knob: `water.good.night` (3) and its favour. |
| 7 | **The shelf empties at about hour 19.** | The Journal's seals, records, rematches and orders carry on; the nine later sheets add about 8 hours of purchases. |
| 8 | **The numbers rest on a model** (±10%, §4.9). | Slice 1 moves the tables into data and the sim reads them; slice 5 re-proves the pacing on the real game. |

---

## 15. Where the proposals disagreed

| question | economy | maps | trip and home (from its sims) | decided | why |
|---|---|---|---|---|---|
| fish values | steep: e^(0.9·z), no normaliser | today's flat values | a placeholder ladder | **steep** | "big and rare fish": a Trophy must be worth many Keepers |
| what quiets water | every bite; 4 good bites in every water | each landed fish; about 3 catches per place | — | **every bite; 4 open, 2 day, 4 old, 3 night, 2 crown** | counting catches leaves free re-rolls; with 4 everywhere, choosy play brings 15–27% more per trip than natural play |
| the clock | a trip is day or night at random | "wait for dusk" at the table | a trip starts before dusk | **every trip is an evening; night holds** | no skip button, no wasted wait, the best light every trip |
| the catalogue | 3 charts + 26 place maps | 3 lake maps + 16 place maps, 9 later | — | **3 + 16, 9 later** | one pattern; only built arenas; fewer things to dress |
| price scale | Sporewood 1,000 · Glasswater 7,000 · Pallid 28,000 | 400 · 1,200 · 2,800 (flat values) | — | **800 · 6,000 · 18,000** | re-fitted to this sim; no wait above 75 min |
| a lake needs a place of the lake before | — | yes, one | — | **no** | clams are the only key |
| a crown needs old water and a Trophy sold | — | yes | — | **no** | no luck gate; the shelf's order does it |
| the hold | 3 → 10 | 3 → 7 | 3, 4, 5, 8 tried | **3 → 8** | trips stay under 5 minutes; each slot stays dear |
| raft parts | Oars, Quiet Hull, Lantern, Moss Lining (+5% sale) | hold, bait box, oars, lamp | — | **hold, Oars, Quiet Hull, Lantern** | no percentage on the sale anywhere; no carrying limit to manage |
| Quiet Hull | +1 good bite in every water | — | — | **open water only** | in every water, at level III, "only Prize+" reaches 92% of natural play per minute and 49% more per trip |
| home | Order Board, Bait Bed, Long Wall, cosmetics | sheets pinned, Waystones lit | — | **both**: four things clams build, four that grow free | the user listed the home among things to upgrade |
| a place you do not own | a named blank on Murk's table | standing mist | — | **mist in the world; an unnamed blot on the Chart** | the lake sells the map; the name is part of what you buy |
| slice 1's one map | "one map" | the Sporewood lake map | — | **the Sporewood lake map** | its arena is built; no world work |
| lure and bait | both at once | a cast costs a bait | — | **both at once; a bare hook is always allowed** | bait must be worth buying, and never required |
| Murk on the water · records at the measure · kept stays kept · small fish as bait | agreed by all | | | **taken** | |

---

## 16. Questions only the user can answer (each with the default this spec builds)

1. **Is a kept fish final?** Once a fish is in the hold, is it there until Murk buys it, with no throwing one back to make room for a better one? **Default: yes.**
2. **May the water go quiet?** Each water gives a handful of good bites an evening, and every bite counts, even one you let pass or let go; after that it is mostly small fish until you have been home. It is what stops "let everything go until giants bite" from being the best way to play. **Default: yes.**
3. **Is every trip an evening?** You always set out late in the day, dusk falls within a minute, and night lasts until you turn for home. The other way is a day and night that turn on their own while you fish. **Default: an evening.**
4. **May a map's card name one fish before you buy it?** Drawn life-size beside the Wick, with the hour it bites. The place's name and its other fish stay unknown until you own the map; on the line the species still hides. **Default: yes, one fish.**
5. **Are places you walk to still wanted later?** Your earlier wish was raft water in some lakes and walking in others. Walking is not built, and under this loop every place is a raft water. **Default: raft only for now; walking stays parked with the swarm.**

---

## Appendix A. Every fish: where it bites and what it sells for

Clams at each class's typical size (`BALANCE_V3.size.simZ`). "Later sheet": its place is one of the nine later maps (§5.2), so the fish cannot be caught until that map ships. The two Wanderers (Pilgrim Salmon, Hearthfish) and the Landing's Quayling are outside the pacing run.

**The Mossmere**

| fish | rarity | hour | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| Dusk Minnow | common | any | open water | 2 | 7 | 18 | 45 | 114 |
| Mossback Perch | common | any | open water | 3 | 10 | 25 | 63 | 159 |
| Gutter Crayfish | common | any | open water | 3 | 9 | 21 | 54 | 137 |
| Lampsipper | common | night | open water | 4 | 13 | 32 | 81 | 205 |
| Weeping Carp | uncommon | any | open water | 7 | 21 | 53 | 136 | 341 |
| Candlefin Koi | uncommon | day, dusk | open water | 9 | 26 | 63 | 163 | 410 |
| Reedjaw Pike | rare | any | open water | 17 | 49 | 120 | 308 | 774 |
| Gloam Eel | rare | night | open water, on Lumen Moss | 20 | 60 | 148 | 380 | 956 |
| Bridgechain Sturgeon | rare | any | Under the Span | 27 | 79 | 194 | 498 | 1,252 |
| Old Portcullis | rare | any | *later sheet* | 19 | 57 | 141 | 362 | 910 |
| Cupbearer | rare | day, dusk | *later sheet* | 23 | 69 | 169 | 435 | 1,092 |

**Sporewood Pools**

| fish | rarity | hour | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| Sporebelly Puffer | common | any | open water | 6 | 19 | 46 | 118 | 296 |
| Plumgill Perch | common | any | open water | 7 | 20 | 49 | 127 | 319 |
| Capshell Crayfish | common | any | open water | 6 | 17 | 42 | 109 | 273 |
| Velvet Ray | uncommon | any | open water | 16 | 46 | 113 | 290 | 728 |
| Threadling Eel | uncommon | any | open water, on Spore Cake | 17 | 49 | 120 | 308 | 774 |
| Nightbloom Carp | uncommon | night | open water | 19 | 57 | 141 | 362 | 910 |
| Mildew Angler | rare | night | open water | 32 | 95 | 233 | 598 | 1,502 |
| Sleepspore Jelly | rare | day, dusk | open water, on Lumen Moss | 30 | 89 | 219 | 561 | 1,411 |
| Harpstring Eel | rare | any | The Gill Harp | 36 | 106 | 261 | 670 | 1,684 |
| Hushcap Koi | rare | night (a night water's own fish keeps the water's hour) | The Veilwater | 38 | 112 | 275 | 706 | 1,775 |
| The Remembered Sun | rare | day, dusk | *later sheet* | 39 | 115 | 282 | 724 | 1,821 |

**Glasswater Vault**

| fish | rarity | hour | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| Prism Minnow | common | any | open water | 12 | 34 | 85 | 217 | 546 |
| Glassgill Perch | common | any | open water | 14 | 40 | 99 | 253 | 637 |
| Glassblown Puffer | common | any | open water | 13 | 37 | 92 | 235 | 592 |
| Chime Jelly | uncommon | day, dusk | open water, on Glass Larvae | 27 | 80 | 197 | 507 | 1,275 |
| Mirror Pike | uncommon | any | open water | 30 | 89 | 219 | 561 | 1,411 |
| Shardspine Eel | rare | night | open water | 63 | 186 | 458 | 1,177 | 2,959 |
| Vesper Gar | rare | night | open water | 66 | 193 | 476 | 1,222 | 3,073 |
| The Blind Scrivener | rare | any | open water, on Ember Roe | 58 | 172 | 423 | 1,086 | 2,731 |
| The Unreflected | rare | any | The Mirror Nave | 71 | 208 | 511 | 1,313 | 3,300 |
| Rainglass Darter | rare | day, dusk | The Stilled Cascade | 66 | 193 | 476 | 1,222 | 3,073 |
| The Footnote | rare | any | *later sheet* | 68 | 201 | 494 | 1,267 | 3,186 |
| The Sexton | rare | any | *later sheet* | 73 | 215 | 529 | 1,358 | 3,414 |

**The Pallid Deep**

| fish | rarity | hour | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| Ossuary Fry | common | any | open water | 20 | 60 | 148 | 380 | 956 |
| Pallid Wraithfin | common | any | open water | 23 | 69 | 169 | 435 | 1,092 |
| Bonecrook Crayfish | common | any | open water | 21 | 63 | 155 | 398 | 1,001 |
| Gilt-Eyed Eel | uncommon | any | open water | 45 | 132 | 324 | 833 | 2,094 |
| Shroud Ray | uncommon | any | open water | 43 | 126 | 310 | 797 | 2,003 |
| Funeral Veil | rare | night | open water | 92 | 272 | 670 | 1,720 | 4,324 |
| Lampwarden Angler | rare | night | open water, on Ember Roe | 102 | 301 | 740 | 1,901 | — (it stops at Trophy) |
| The Clapper | rare | any | The Sunken Belfry | 110 | 322 | 793 | 2,037 | 5,121 |
| The Wax-Bearer | rare | any | The Bier Barge | 107 | 315 | 776 | 1,992 | 5,007 |
| Candlewake Sturgeon | rare | night | The Chain Garden | 122 | 358 | 881 | 2,263 | 5,690 |
| The Unpaid Fare | rare | day, dusk | *later sheet* | 117 | 344 | 846 | 2,173 | 5,462 |
| The Namesake | rare | any | *later sheet* | 112 | 330 | 811 | 2,082 | 5,235 |

Elder values count only where the fish can reach old water: an open-water fish becomes an Elder by biting in its lake's old water.

## Appendix B. Re-running the proof

```
cd gloomwater
node tools/sim/clams.mjs            # everything, about 15 s; exits 1 if a target or the anti-grind check fails
node tools/sim/clams.mjs --quick    # about 6 s
node tools/sim/clams.mjs --md       # the tables as markdown
node tools/sim/clams.mjs --json     # the LOOP draft tables
```

It reads the species, the size model, the land chance, the lures and baits and the time model of a cast from `src/data.js`, and keeps its own draft `LOOP` table for everything this spec adds. It runs 47 checks: the anti-grind checks at five stages, the bait checks, the Elder checks and the pacing targets of §4.9. Change a price in `LOOP`, run it, and it says which target moved.
