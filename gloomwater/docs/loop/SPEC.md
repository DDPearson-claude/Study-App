# The Full Hold: catch, keep, sell, upgrade (binding spec, v5)

*Gloomwater's game loop after the user's redirect of 2026-11-13, rebuilt on the roster (`docs/loop/ROSTER.md`). This file is binding. Where it conflicts with DESIGN §1–§25 or CONTRACT §13 it wins (§12 lists what it replaces). Its numbers are proven by `tools/sim/clams.mjs` (74 checks); when the numbers here and the sim disagree, re-run the sim and fix this file. Design only: no `src/` file changed with this document.*

**How to read it.** §1–§3 are the game and its rules (§3.5 is the rare giants). §4 is every number. §5–§7 are maps, home and raft. §8 is every word on screen. §9–§12 say what happens to what exists. §13 is the build plan. §16 lists the questions only the user can answer. Appendix A lists every fish with its price.

**Vocabulary (always these words).** **clams** (the currency; "Shells" is retired) · **the hold** · **slot** · **Keep / Let go** · **good bites** and **quiet water** · **an evening** (one trip) · **Home** · **the tally** (Murk buying the hold) · **the Chart** (the Map Table's screen) · **map** (the one word on screen for a lake map and a place map; the lead's "spot map" is a place map) · **a water** (one of the 16 lakes and seas) · **day water, old water, night water, crown** (the kinds of place; on screen four glyphs, never words) · **a rare giant** (★: the descendant of an episode's main fish; *epic*, or *legendary* for a water's crown) · **a legend** (a legendary giant) · **value tier** (a water's price level, hidden) · **a reach** (four waters in a row: I the old kingdom, II the fresh waters, III the great rivers, IV the sea) · **Murk's orders** · **ink print** · **the Jetty** (the first, small home).

---

## 0. The user's words, and the lead's rulings

| # | the user, verbatim | ruling |
|---|---|---|
| 1 | "Who are we and what is the gameplay loop? I basically want to try and catch big and rare fish, the fish we keep i want to sell for clams and we use the clams to upgrade our gear, raft, homebase, bait, lures, buy maps of new locations to fish, which is the only way of discovering a new place is to buy the map." | §1–§2 the loop. Big and rare fish are worth far more than small ones, and the rare giants most of all (§4.1). Clams buy six things: gear, raft, home, bait, lures, maps (§4). Nothing is found by exploring: a map is the only way a water or a place becomes known and reachable (§5). |
| 2 | "for now park the creature attacks." | The swarm and everything that only serves it or makes failure possible is switched off behind one table of flags and kept in the code (§9). |
| 3 | "I just want to catch fish so we're limited buy storage for caught fish in our boat starting at 3 catch slots." | The hold: 3 slots at the start, 8 at the most (§3.1, §4.2). No food, no oil to manage. |
| 4 | "there's no way to fail, but once your boat is full you can't catch anymore fish and you might not catch a big one at all as its chance" | No fail state anywhere (§3.6). A full hold refuses the cast (§3.1). A big fish is a chance each evening, never a promise: 52% of first trips bring home no Prize or bigger, and a giant comes home on 2–15% of trips at its place on arrival tackle (§4.9, §3.5). |
| 5 | "Use all of these fish as inspiration for our game's fish" (on the researched list of every fish landed on a television fishing series; `docs/loop/research/`) | Every fish on the list is the ancestor of one original fish of ours (`docs/loop/ROSTER.md`, `roster.json`, checked by `tools/sim/roster-check.mjs`). **All 164 live on at least one map** (§5.2; the sim checks it). The series and its presenter are never named in the game. |
| 6 | "The main episode based fish he catches should be the rare giants" | The 49 rare giants (33 epic, 16 legendary) are the scarcest, largest, dearest and hardest fish of their waters, and **a map is the promise of a giant** (§3.5, §5.1 rule 9). |
| 7 | "Yes to all five loop rules" (13 November 2026, answering v4's five questions) | Decisions now: a kept fish is final; the water goes quiet; every trip is an evening; a map's card names one fish; raft only for now. |

**Decided by the lead (and why).** Rows 1–5 stand from v4 and the user confirmed them; rows 6–14 are new in v5.

| # | decision | why |
|---|---|---|
| 1 | **Kept stays kept.** A fish in the hold stays there until Murk buys it. | "Once your boat is full you can't catch anymore fish": a full boat is final. A swap is a bigger hold by another name. (User: yes.) |
| 2 | **The water goes quiet.** Every water has a few good bites an evening; every bite spends one (§3.3). | Without it "let everything go until the giants bite" brings 3.1–3.9 times the clams per trip. With it no patient strategy reaches the natural one per minute. (User: yes.) |
| 3 | **Every trip is an evening.** Dusk falls after 40 s on the water; night lasts until you turn for home (§3.4). | Night stays the big-fish hour without a clock or a skip button. (User: yes.) |
| 4 | **Clams are the only key.** No proof catches, no tolls, no legend gates. | One currency, one way to discover places. |
| 5 | **One lure and one bait at once.** | Both are on the user's list; with one slot for both a tin never beats a lure. |
| 6 | **Sixteen waters, all lake maps.** The roster's four built lakes come first; its twelve new waters are lake maps too, each with four places (six have a fifth). 15 lake maps and 70 place maps are for sale. | The roster gives every water its own look, places and legend. Each new water is built on one of the four arena layouts that exist (§5.3), so it is mostly data and landmark art. |
| 7 | **A giant lives at one place and is a fixed share of the bites there:** 6% in its hour, 2.5% outside it; its own giants' lure makes that ×1.5 (§3.5). | A share does not swing with what else bites. It keeps "the promise of a giant" honest: it comes, rarely. |
| 8 | **A giant is never Small, runs big (+0.3 favour), may be an Elder at its own place, and fights +10 harder than a rare** (+12 as an Elder). | The giants are "the top of the value ladder and the hardest fish to land". The sim checks both for every water (§4.9). |
| 9 | **Value is value tier × rarity × body × size.** Rarity ×1 / 2.4 / 5.5 / 12 (common to epic); body is the square root of the fish's typical length against 45 cm, clamped 0.6–1.6. | Big and rare fish, in the roster's own rarities and sizes. A giant sells for 1.7 times or more than the dearest other fish of its water at the same size class. |
| 10 | **Each water has its own value tier, tuned so it pays 1.2 times the water before it, fully mapped, on the same tackle.** | The next map is always worth having. Tiers are uneven (Lampmoss Slough 54, Pyrefall Gorge 124) because the waters' fish are uneven; the tier is hidden. |
| 11 | **Tackle T5 and T6.** Two tiers above the built five, on the shelf with Rushlight Fen (water 5) and the Inkwood (water 10). | Sixteen waters need the gear to keep growing; the new waters' giants are tuned against them. |
| 12 | **A tin is Murk's bait for one water;** its price is the bait's grade × that water's value tier. **Bait makes fish bigger and hold better; it no longer changes which fish bite** (except a fish that bites on one bait only). | A fixed tin price is free money in late waters; a bait that pulls in commons can lose clams (the sim showed −16%). |
| 13 | **An hour opens a window that runs into the next phase:** "day" bites by day and dusk, "dusk" at dusk and night, "night" at night. | The roster's hours, made playable in a 60-second evening. |
| 14 | **The long game is about 49 hours** to buy everything: 4 built lakes by hour 14.6, then a new water every 2.5–3 hours. | Long enough for 85 maps and 49 giants; each era is a few sessions. (Question 2, §16.) |

**Sources.** v4 (commit 1aa478c) reconciled three proposals: economy, maps, and trip-and-home (§15). v5 keeps v4's loop, hold rule, anti-grind rule, parked list, words on screen and slice structure, and rebuilds the fish values, the catalogue, the simulation's species tables and the build plan around the roster (commit d20aa74).

---

## 1. Who we are

You are **the Wick**: a small living candle, one of the last of a drowned kingdom. Home is **the Landing**, a cove where the trader **Old Murk** keeps his barge. You fish from a raft. Murk buys what you bring home and sells you everything else.

**The game in one breath.** Pick a water you own a map for. Sail out for the evening. Catch fish; keep one or let it go. When the hold is full, go home. Murk pays clams. Clams buy a bigger hold, better tackle, lures, bait, a better raft, a better home, and the next map, and every map promises a giant.

**Pillars (they replace §25.1's list; when two conflict, the higher wins).**

1. **Big and rare fish.** The rare giants are the dream. The size shows on the line; the species hides until the reveal.
2. **The hold decides.** Few slots, no promise. Every keep is final.
3. **A map opens every water.** The next map is always on Murk's shelf, with a giant drawn on it and a price.
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
| **a session** | 5–15 min | 2–4 trips and 1–4 purchases. A goal line shows the next one ("Next: Under the Span · 150"). |
| **an era** (one water) | 2.5–4 h | the lake map → its day water and old water → its giants' lure → its other places → the crown of the water before → the next lake map. |
| **the long game** | ≈ 49 h to buy everything | 16 waters, 70 places, tackle T6, hold 8, the raft and the home built up, 16 legends, about 90 giants and 74 Elders landed on the way. After that: the Journal's seals, the 49 giants' prints, records, legend rematches, the later sheets (§5.2). |

### 2.1 The first ten minutes (a fresh save, the game after slice 2)

| clock | where | beat |
|---|---|---|
| 0:00 | home | Murk: "Three slots in that hold. Fill them and come home." The Chart shows one sheet: the Mossmere. **Sail.** |
| 0:15 | the Mossmere, late day | First cast. A double pop: a Small. The player strikes anyway. A Dusk Minnow. The Wick holds it up. Card: **Keep · 2** / **Let go**. Let go. |
| 0:40 | | A plunge: a Keeper. A Weeping Carp: **Keep · 26**. One slot full. |
| 1:00 | dusk | The light turns. A Keeper Rustfin Sucker: **Keep · 9**. Two slots full. The float shows one good bite left. |
| 1:25 | night | A slow drag-under: a Prize. It lands (a Prize Reedjaw Pike lands 3 times in 10 on starter tackle): **Keep · 158**. The next cast is refused: "Hold's full." The Home pill pulses. |
| 1:40 | home | The tally: 26 + 9 + 158 = **+193**. Shelf: **Hold 4 · 30**, **Braided Gut · 50**, a map with a koi drawn on it, **60**. All three are bought. |
| 2:30 | | Trip 2 with four slots and a new place: the mist lifts off the Lily Maze. |
| 10:00 | | After 3–4 trips: hold 4, Line T1, the Lily Maze; 62 clams a trip on average. The next card on the shelf is **Under the Span · 150**, with a pike drawn on it longer than the Wick is tall. |

(The first trip above is a lucky one. The average first trip sells for 44 clams, and 52% of first trips have no Prize or bigger. The first giant comes home at about hour 1.8.)

---

## 3. The rules

### 3.1 The hold

| rule | value |
|---|---|
| slots at the start | **3** |
| slots at the most | **8** (five steps, bought in order, §4.2) |
| what takes a slot | one kept fish of any size; a giant, a legend and a curiosity take one slot each |
| a full hold | the cast is refused. One line: "Hold's full." The Home pill pulses. You cannot fish for sport with a full hold. |
| what empties it | only the tally at home. Murk buys everything in it. Nothing is carried over to the next trip. |
| on screen | a row of slot glyphs, top-left. A kept fish is a small ink fish in its slot, drawn bigger for a bigger class, gold-edged for a giant. |

### 3.2 Keep or let go

- The card opens after the Wick has held the fish up and paused. It has two buttons: **Keep** with the clam value, and **Let go**. From slice 3 a Small or a Keeper has a third, small one: **Cut bait** (3 Cut Strips, §4.5).
- **Kept stays kept.** There is no way to take a fish out of the hold on the water.
- **Let go is free and pays nothing.** No luck, no favour, no clams (§9).
- **The record is yours either way.** The Journal page, the personal best, the class seal, the Old Ledger and the ink print are written at the measure, before the card. Selling a fish or letting it go loses none of them.
- **Let it pass** stays: no tap during the bite, and the fish lets go; the bait comes back. It still spends a good bite (§3.3). A passed Prize or bigger lingers 45 s for one more cast (built); that cast spends a bite too.

### 3.3 The water goes quiet (the anti-grind rule)

**The rule.** A water's open water, and each place you own in it, has a few **good bites** each evening. Every bite spends one: struck or let pass, landed or lost, kept or let go. When they are spent that water is **quiet**: each further bite there has favour −0.15 (down to −1.2: almost all Smalls) and takes 30% longer to come (up to ×2.2). Only going home brings the water back.

| water | good bites an evening | favour there | what it is for |
|---|---|---|---|
| open water (the whole water, one pool) | **4**, +1 per Quiet Hull level (to 7) | 0 | where you start; later, the top-up |
| day water | **2** | +0.35 | its day fish |
| old water | **4** | +0.55 | **Elders bite here**, and most giants live here |
| night water | **3**, only after dark | +0.45 | the night fish, and night giants |
| crown (a legend's pool) | **2** | +0.35 | the legend, on her bait in her hour |

- A quiet place is still better than quiet open water for a bite or two. Nothing ever stops biting: the hold can always be filled.
- Legends, giants, the got-away note and a Marked Fish follow the same count. Nibbles and feints are not bites.
- **The player sees it.** When the float settles it shows its favour notches (built) and one small dot per good bite left. A bite puts a dot out. With none left the float dims and one line shows once per water: "Gone quiet." Quiet water spawns no rise rings.
- **Why going home is attractive.** Home is where the fish turn into clams, where the water comes back, and where the next purchase is. A trip costs about 45 s of sailing, selling and shopping, so half-empty trips pay badly, and so does sitting on quiet water.

**Proof** (sim section 2; clams per minute as a share of the natural rule: "let Smalls pass while good water is left, keep the rest, move on when a water goes quiet, go home"):

| stage | natural rule: clams · minutes | best rule found | keep what bites | wait for dark | Prize+ while fresh, then fill | only Prize+, home when quiet | **the giant hunt** (keep only giants and Trophy+, stay till full) | only Trophy+, stay till full |
|---|---|---|---|---|---|---|---|---|
| first trip: T0, hold 3, the Mossmere's open water (4 good bites) | 44 · 2.2 | 104% | 94% | 77% | 73% | 45% | 4% | 4% |
| 10 min: hold 4, the Lily Maze (6) | 69 · 2.8 | 100% | 96% | 83% | 74% | 59% | 5% | 5% |
| 1 h: T1, hold 5, three Mossmere places (14) | 202 · 3.4 | 105% | 96% | 83% | 73% | 78% | 13% | 12% |
| 5 h: T2, hold 6, four Sporewood places (18) | 403 · 3.8 | 100% | 99% | 84% | 79% | 84% | 17% | 16% |
| 20 h: T5, hold 8, three Thin Water places (15) | 2,693 · 4.5 | 100% | 99% | 78% | 67% | 79% | 12% | 13% |
| 40 h: T6, hold 8, four Salt Gate places (19) | 8,852 · 4.6 | 99% | 97% | 90% | 78% | 82% | 18% | 17% |

- **No patient strategy reaches the natural rule per minute** (the best is 90%). **The giant hunt earns 4–18%**: a giant is too rare to fill a hold with.
- **The natural rule is within 5% of the best rule found**, so playing by feel is playing well.
- **The rule is needed.** With quiet water switched off, "only Trophy+, stay till full" brings **3.1–3.9 times** the clams per trip at every stage, and the giant hunt 3–4 times; players would drift into them.
- Being choosy still has a place: from the first hour on, "Prize+ while fresh, then fill" brings 9–42% more clams per trip for 1.6–1.8 times the minutes. It is a slower way to play, never the only one.

### 3.4 Every trip is an evening

| phase | water time | favour | what bites |
|---|---|---|---|
| late day | the first **40 s** | 0 | fish whose hour is day or any |
| dusk (*Last Light*) | the next **20 s** | +0.2 | day, dusk and any fish |
| night (*Night Rise*) | **until you turn for home** | +0.25, +0.05 per Lantern level | dusk, night and any fish; night water opens |
| dawn | the sail home and the tally | — | you come home at first light |

- **A fish's hour is a window that runs into the next phase**: the roster's "day" bites by day and dusk; "dusk" at dusk and night; "night" at night; "day, dusk" and "dusk, night" as written; "any" always; "any, best at night" always, half as often again after dark.
- The clock runs on the water only. It stands still during a catch's ceremony and card (built: the cinematic freeze), in menus and at home. Nothing ends the night.
- Trips are counted as evenings ("Evening 14" on Journal entries), not days.
- With 3 slots and 4 good bites, 63% of first trips get a bite after dark. A bigger hold reaches deeper into the night.
- A legend keeps her hour for the sure bite (§3.5). Waiting for dark on purpose pays 77–90% of the natural rule per minute: allowed, never needed.

### 3.5 The rare giants

The roster's 49 giants (★) are the descendants of the episodes' main fish: 33 **epic** giants, one at each of 33 places, and 16 **legendary** giants, one in each water's crown.

| rule | value | why |
|---|---|---|
| **where** | an epic giant bites only at its own place (`placeName` in the roster), never in open water or elsewhere | a map is the promise of a giant: buying the place is the only way to meet it |
| **how often** | a fixed share of the bites at its place: **6% in its hour, 2.5% outside it**; its water's giants' lure makes the share ×1.5. Family lures do not draw giants. | it comes, but rarely; the share does not swing with what else bites in that hour |
| **how big** | never Small (z ≥ −0.25); its bites run big (favour +0.3); **it may be an Elder at its own place**, whatever the kind of place (roster ask 1). Every other fish reaches Elder only in old water. | the giants have the longest ladders in their waters (roster σ 0.16) |
| **how hard** | Fight +10 over a rare of its water, +12 as an Elder. On its water's arrival tackle a Prize giant lands 27–55% of the time, less than any other fish there (sim 4b checks every giant). | "the hardest fish to land, never certain" |
| **what it pays** | rarity ×12 (a rare is ×5.5). At the same size class the cheapest giant of a water sells for at least 1.7 times its dearest other fish (sim 1 checks every water). | "the top of the value ladder" |
| **when lost** | the got-away note names it and its rough size; the giant becomes a Marked Fish: it waits at its place, +6 Hold on its next hook, once (the built light Marked Fish) | no fail; the story continues |
| **on the map card** | the card of its place map names it and draws its silhouette life-size beside the Wick, with its hour glyph (§5.1 rule 9) | the promise is visible before you pay |

**How rare is the big one** (sim 4b: the natural rule at the water's arrival tackle, that place and open water only, hold 6; a few of the 33 rows):

| place | its giant | tackle | a Prize lands | it bites on | comes home on | with the giants' lure |
|---|---|---|---|---|---|---|
| Under the Span (the Mossmere) | Thousandcast Pike (dusk) | T1 | 27% | 7% of trips | 2.1% (1 in 48) | 5.9% (1 in 17) |
| The Buoy Lights (the Mossmere) | Hullkiss Lamprey (night) | T1 | 27% | 19% | 6.7% (1 in 14) | 14.8% |
| The Gill Harp (Sporewood) | Harpstring Eel | T2 | 31% | 23% | 9.2% | 21.1% |
| The Well of Ledgers (Glasswater) | Prismdrop Sturgeon | T3 | 32% | 22% | 8.7% | 19.4% |
| The Broken Weir (the Thin Water) | Weirflame | T5 | 53% | 23% | 13.6% | 23.2% |
| The Sluice Throat (the Salt Gate) | Sweetwater Shark (dusk, night) | T6 | 46% | 10% | 4.6% | 8.6% |
| The Fjord Floor (the Rime Sound) | Icedoor Flounder | T6 | 41% | 22% | 11.6% | 20.7% |

A giant whose hour is dusk or night at an old water bites less, because the natural route passes old water in daylight; the hour glyph on its card tells the player to come back at dusk. The Thousandcast Pike is the hardest giant to bring home in the game, as its journal line promises ("Follows the lure to the raft, looks at you, and leaves. Ten thousand times.").

**Legends.** The built legend rule stays for all 16: her bait, her hour and her pool give a sure bite; the land chance is never above 50% (the sim checks all 16 at T6 with wounds); each escape wounds her (+6 Hold, to +18, kept across trips). She needs a free slot and takes one. Her first landing pays her crown map's price; later landings pay 40%. **No legend opens anything** (§4.6).

### 3.6 No way to fail

- No health, no hunger, no oil to run out of, no death, no timer, nothing that takes a kept fish or a clam.
- The lantern always burns. It is light and atmosphere, and its level (§7) changes how far it reaches.
- Closing the game mid-trip loses nothing: *Continue* restores the hold, the bites spent, the clock and the raft's place (built autosave).
- The only loss in the game is the fish that got away, and its note names it.

---

## 4. The economy

All prices are in clams. Every table below is the draft table `LOOP` in `tools/sim/clams.mjs` (print it with `--json`); it moves into `src/data.js` with slice 1 and grows with each slice.

### 4.1 What a fish sells for

```
clams = max(1, round(tier[water] × rarity × body × clamp(e^(0.9·z), 0.4, 30) × classBonus))
  rarity: common 1 · uncommon 2.4 · rare 5.5 · epic 12        body = clamp(√(L50 / 45 cm), 0.6, 1.6)        classBonus: Trophy 1.25 · Elder 1.6
```

`z` is the size score the game already rolls (§25.7.1); `L50` is the fish's typical length (the roster's `sizeModel`, or the built size for a built species the roster keeps). There is no lake normaliser, no quality multiplier and no streak multiplier (§9). The card shows this number on **Keep**. A legend is not sold by size: her landing pays her crown's price (§4.6). A curiosity sells at its water's rare Keeper price (roster §6).

| at a class's typical size | Small | Keeper | Prize | Trophy | Elder | Ancient |
|---|---|---|---|---|---|---|
| size multiplier (it was 0.5 / 0.8 / 1.2 / 2.2 / 4.0 / 4.8 in §25.7.3) | ×0.5 | ×1.4 | ×3.5 | ×9.1 | ×22.8 | ×32.6 |

**The value tiers and what a fish is worth** (means over the water's fish; Appendix A lists every fish):

| water | value tier | a common Keeper | a rare Keeper | a giant Keeper | a giant Prize | a giant Trophy |
|---|---|---|---|---|---|---|
| 1. The Mossmere | 7 | 8 | 65 | 150 | 369 | 947 |
| 2. Sporewood Pools | 14 | 15 | 128 | 286 | 705 | 1,809 |
| 3. Glasswater Vault | 17 | 21 | 150 | 403 | 992 | 2,548 |
| 4. The Pallid Deep | 41 | 49 | 429 | — (its one giant is its legend) | — | — |
| 5. Rushlight Fen | 72 | 67 | — (no rare) | 1,393 | 3,425 | 8,796 |
| 6. The Thin Water | 67 | 81 | 605 | 1,359 | 3,343 | 8,585 |
| 7. Lampmoss Slough | 54 | 77 | 496 | 1,079 | 2,653 | 6,813 |
| 8. Pyrefall Gorge | 124 | 107 | 1,140 | 2,572 | 6,326 | 16,246 |
| 9. The Thunder Stair | 74 | 75 | — (no rare) | 1,534 | 3,773 | 9,689 |
| 10. The Inkwood | 159 | 154 | 1,239 | 2,943 | 7,238 | 18,588 |
| 11. The Siltway | 155 | 167 | 1,342 | 3,373 | 8,297 | 21,308 |
| 12. The Salt Gate | 109 | 122 | 1,156 | 2,805 | 6,900 | 17,719 |
| 13. Lanternroot Lagoon | 157 | 191 | 1,555 | 3,440 | 8,463 | 21,732 |
| 14. The Waxen Reef | 298 | 343 | 2,740 | 6,196 | 15,240 | 39,138 |
| 15. The Last Light | 180 | 232 | 2,179 | 4,586 | 11,279 | 28,964 |
| 16. The Rime Sound | 397 | 615 | 4,264 | 10,245 | 25,199 | 64,712 |

Worked values (tests in slice 1–2 use them): a Keeper Dusk Minnow (z 0.4) sells for **7**, a Keeper Weeping Carp **26**, a Prize Reedjaw Pike (z 1.4) **158**, a Trophy Reedjaw Pike (z 2.2) **406**, an Elder Reedjaw Pike (z 2.95) **1,022**, a Keeper Thousandcast Pike **150**, a Trophy Thousandcast Pike **944**.

**Two extras, both paid at the tally.** A fish that fills one of **Murk's orders** sells for double (§6.3). A fish that beats Murk's **Old Ledger** figure for its species (a mid-Trophy, built) sells for double, once per species.

### 4.2 The hold ladder

| hold | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|
| name | Wicker Creel | Lidded Creel | Double Creel | Wellbox | Ferry Hamper | Harbour Chest |
| price | start | **30** | **120** | **450** | **2,000** | **10,000** |
| bought at about (pacing run) | — | trip 1 | 0.5 h | 1.7 h | 4.5 h | 10.2 h |

One more slot is worth +10–36% clams per trip (the Mossmere with three places: hold 3 → 8 is 91 → 218 clams; the Thin Water 862 → 2,300) for about 0.5 minutes more per trip. The hold stops at 8 so trips stay under 5 minutes.

### 4.3 Tackle (Rod, Line, Reel: the global gear)

The tiers T0–T4, their names and their Hold are `TACKLE` as built (§25.6.6). Each slot is bought on its own. **Proof catches are gone.** T5 and T6 are new.

| tier | Rod · Line · Reel | Hold (rod / line / reel) | price per slot | on the shelf with |
|---|---|---|---|---|
| T0 | Willow Switch · Twine · Wooden Winch | 0 / 0 / 0 | start | — |
| T1 | Ashwood · Braided Gut · Brass Spool | 2 / 2 / 2 | **50** | start |
| T2 | Whalebone · Waxed Silk · Clockwork | 5 / 5 / 5 | **300** | start |
| T3 | Glassreed · Glass-Gut · Whisper Drag | 8 / 9 / 8 | **1,200** | the Sporewood map |
| T4 | Lantern-Spine · Silverthread · Tidewheel | 12 / 13 / 12 | **6,000** | the Glasswater map |
| **T5** | **Bellwether · Starthread · Moonwheel** | 15 / 16 / 15 | **24,000** | the Rushlight Fen map |
| **T6** | **Crown-Reed · Kingshair · Last Wheel** | 18 / 19 / 18 | **60,000** | the Inkwood map |

Tackle matters most where the fish fight hardest (sim section 3, clams per trip at hold 8, the water's ordinary places): the Mossmere 266 at T0 and 506 at T6 (+90%); the Pallid Deep 356 and 1,726 (×4.8); the Rime Sound 1,318 and 17,713 (×13). Each new water's Fight term (Rushlight Fen 28 rising to the Rime Sound 44; the built lakes 0 / 7 / 16 / 24) is set so its giants at Prize land about as often on arrival tackle as the built lakes' giants do.

### 4.4 Lures (permanent, one fitted)

Lures are bought once and kept for good; a snapped line never loses one. **Family lures** draw and help a family (built `LURES`, `CATCH_V3.items`): Feather Fly **50** (insect feeders, +5 Hold) · Glimmer Spoon **90** (predators, +6) · Bone Jig **110** (bottom feeders, +6) · Moth Popper **400** (night-only fish at night, +6; with the Sporewood map) · Lantern Lure **4,000** (glow fish, +8; with the Glasswater map). They do not draw giants.

**Giants' lures**, one per water, **+10 Hold** on the fish named and a ×1.5 share for its giants. The four built ones are **re-aimed at their lake's giants**; twelve are new. Each goes on the shelf with its water's map.

| lure | water | +10 Hold on | price |
|---|---|---|---|
| Harbour-Bell Spinner | The Mossmere | Thousandcast Pike, Hullkiss Lamprey, Reedjaw Pike | 180 |
| Spore-Lamp Fly | Sporewood Pools | Harpstring Eel, Festival Puffer, Emberbrood Snakehead | 500 |
| Mirror Shard | Glasswater Vault | Shardspine Eel, Wolfwake Trout, Prismdrop Sturgeon | 2,400 |
| Ferryman's Coin | The Pallid Deep | Gilt-Eyed Eel, Candlewake Sturgeon, the Clapper | 9,000 |
| Rushlight Spinner | Rushlight Fen | Packtooth | 6,600 |
| Weir Spoon | The Thin Water | Weirflame, Blotback Catfish | 8,000 |
| Moss-Lamp Jig | Lampmoss Slough | Weirshadow Catfish, Old Portcullis, Lampspot Snakehead | 9,400 |
| Ember Wobbler | Pyrefall Gorge | Pyregold Carp, the Unfinished, Lampspot Snakehead | 11,600 |
| Thunder Plug | The Thunder Stair | Lampeye Perch, Soapthief | 13,800 |
| Ink Fly | The Inkwood | Emberbelly, Nightcreek Hound, Smilejaw Bream, Gourdcracker | 19,300 |
| Silt Rattle | The Siltway | Sternlamp Catfish, Dapplewheel Ray, Millstone Catfish | 23,100 |
| Tide Spoon | The Salt Gate | Sweetwater Shark, Tideghost Shark, Inkmarble Eel, Longlash Ray | 27,500 |
| Root-Lamp Popper | Lanternroot Lagoon | Snagheart Bass, Votive Shark, Rootjaw Catfish, Stiltshadow Shark | 33,000 |
| Wax Jig | The Waxen Reef | Anvil Trevally, Spirewatch Pike, Mothlance Gar, Cabin Grouper | 39,100 |
| Lighthouse Feather | The Last Light | Nightsail Lancer, Castaway Pike, Starbar Lancer | 47,300 |
| Rime Pirk | The Rime Sound | Icedoor Flounder, Coalwing Skate | 56,700 |

(A new giants' lure names its water's epic giants and its longest rare; the names are drafts, to be confirmed when its sheet is scheduled, as roster ask 5 says.)

### 4.5 Bait (consumable, one fitted beside the lure)

- A **tin holds 10** and is **Murk's bait for one water**: its price is the bait's **grade × that water's value tier** (rounded to 5). One bait is spent per hooked fish (built: spent at the cast, refunded when the bite is let pass). With no bait you fish a bare hook; that is always allowed.
- A bait does two things: **every fish runs bigger** (its favour) and the fish it names hold better (its Hold, built; the roster's `favours` say which). It **does not change which fish bite**, except that a fish that bites on one bait only (the Gloam Eel on Lumen Moss, the Threadling Eel on Spore Cake) needs it. Where the lure and the bait both give Hold, the fish gets the larger, never both (built).

| bait | grade | favour | a tin for the Mossmere | Glasswater | Rushlight Fen | the Inkwood | the Rime Sound | first on the shelf with |
|---|---|---|---|---|---|---|---|---|
| Mire Worms | 1.43 | +0.3 | **10** | 25 | 105 | 225 | 570 | the Mossmere |
| Lumen Moss | 2.9 | +0.2 | **20** | 50 | 210 | 460 | 1,150 | the Mossmere |
| Spore Cake | 3.5 | +0.25 | 25 | 60 | 250 | 555 | 1,390 | Sporewood |
| Ember Roe | 6 | +0.35 | 40 | **100** | 430 | 955 | 2,380 | Sporewood |
| Glass Larvae | 1.6 | +0.4 | 10 | 25 | 115 | 255 | 635 | Glasswater |
| Shimmerfly | 4.8 | +0.4 | 35 | 80 | 345 | 765 | 1,905 | the Pallid Deep |
| **Windfall Plum** (new) | 4 | +0.3 | — | — | — | **635** | 1,590 | the Inkwood (its fruit eaters) |
| **Tallow Soap** (new) | 3.5 | +0.3 | — | — | — | 555 | 1,390 | the Thunder Stair (whiskered scavengers) |
| **Cut Strip** | free | +0.3 on predators, +4 Hold | — | — | — | — | — | **Cut bait** on the card turns a Small or a Keeper into 3 strips instead of keeping it. The roster's most-named bait (60 fish). |

Each water's **plain bait** (the tin its fish name most; the Bait Bed's free bait): Mire Worms for the Mossmere and nine of the new waters, Spore Cake for Sporewood, Ember Roe for Glasswater, the Pallid Deep, Lanternroot Lagoon and the Last Light, Windfall Plum for the Inkwood.

What a tin is worth (natural rule, net of the tins; sim section 4): +6% clams a minute at hour 1 (Mire Worms, the Mossmere; a tin earns 2.8 times its price), +11% at hour 5 (Spore Cake), +5% at hour 10 (Ember Roe, Glasswater), +17% at hour 20 (Mire Worms, the Thin Water; 6.0×), +10% at hour 40 (Mire Worms, the Salt Gate; 7.2×). **Worth buying, never a must.** Small fish have three uses: a slot when nothing better comes, an order, or Cut Strip.

### 4.6 Legends

| legend · crown | her bait, per try | first try lands (tackle) | tries expected | bait in all | first landing pays | later landings |
|---|---|---|---|---|---|---|
| The Belled Matriarch · the Bell Pool | Heartmoss Ball **60** | 27% (T1) | 2.8 | 169 | **500** | 200 |
| The Drifting Grove · the Mother's Cup | Glowcap Bulb **250** | 24% (T2) | 3.0 | 759 | **2,200** | 880 |
| The Glass Sovereign · the Fallen Chandelier | Prism Moth **1,000** | 21% (T3) | 3.2 | 3,221 | **7,500** | 3,000 |
| The Lantern-Swallower · the Bottomless | Last Candle **3,000** | 17% (T4) | 3.5 | 10,595 | **19,000** | 7,600 |
| The Long Thunder · the Dam Foot | Storm Candle **1,870** | 30% (T5) | 2.7 | 5,067 | **15,600** | 6,240 |
| The Buried Moon · the Moonbed | Lamp Snail **2,270** | 29% (T5) | 2.7 | 6,164 | **18,900** | 7,560 |
| The Last Sentry · the Sentry's Reach | Carp Cutlet **2,650** | 27% (T5) | 2.8 | 7,498 | **22,100** | 8,840 |
| The Ashen Guest · the Last Pyre | Charred Offering **3,280** | 27% (T5) | 2.8 | 9,301 | **27,300** | 10,920 |
| The Last Lock · the Throat | Wired Bream **3,900** | 25% (T5) | 3.0 | 11,558 | **32,500** | 13,000 |
| The Banked Fire · the Breathing Mere | Blossom Fly **5,460** | 28% (T6) | 2.8 | 15,112 | **45,500** | 18,200 |
| The Barge-Shadow · the Long Hole | Bargeman's Supper **6,550** | 27% (T6) | 2.8 | 18,532 | **54,600** | 21,840 |
| The Old Shipwright · the Slipway | Tide Mullet **7,800** | 27% (T6) | 2.8 | 22,118 | **65,000** | 26,000 |
| The Silver Regent · the Sighing Pool | Moth-Wing Fly **9,360** | 25% (T6) | 3.0 | 27,739 | **78,000** | 31,200 |
| The Waxen Abbot · the Abbot's Cellar | Lantern-Fry **11,080** | 25% (T6) | 3.0 | 32,915 | **92,300** | 36,920 |
| The Jetsam Shark · the Unlit Mile | Lighthouse Ration **13,420** | 22% (T6) | 3.1 | 42,102 | **111,800** | 44,720 |
| The Long Winter · the Half-Mile Line | Old Ration **16,070** | 22% (T6) | 3.1 | 50,547 | **133,900** | 53,560 |

- A new legend's Fight is her water's Fight term + 26 (the built four are `CATCH_V3.legend.fight` as built); her bait costs 12% of her crown map.
- **No legend opens anything.** A legend is a crown, never a key. Her print hangs under the sea-gate arch; her Waystone burns gold.

### 4.7 The raft and the home (the tables are in §7 and §6)

| what | levels | prices |
|---|---|---|
| Oars | I–III | 60 · 300 · 1,500 |
| Quiet Hull | I–III | 100 · 600 · 8,000 |
| Lantern | I–III | 100 · 500 · 3,500 |
| Murk's Order Board | I–III | 70 · 400 · 4,000 |
| Bait Bed | I–III | 120 · 700 · 9,000 |
| The Long Wall | 4 wings, one per reach | 250 · 10,000 · 25,000 · 50,000 |
| Landing lights | I–III | 200 · 1,200 · 14,000 |
| Looks (9) | — | 300 · 400 · 600 · 2,500 · 6,000 · 14,000 · 15,000 · 30,000 · 60,000 |

### 4.8 Maps (the catalogue is §5.2)

| water | lake map | day water | old water | fifth place | night water | crown |
|---|---|---|---|---|---|---|
| 1. The Mossmere | yours | 60 | 150 | — | 260 | 500 |
| 2. Sporewood Pools | **800** | 400 | 800 | 1,100 (old) | 1,200 | 2,200 |
| 3. Glasswater Vault | **5,000** | 2,000 | 3,200 | 4,000 (old) | 4,800 | 7,500 |
| 4. The Pallid Deep | **12,000** | 7,000 | 11,000 | — | 14,000 | 19,000 |
| 5. Rushlight Fen | **12,000** | 5,400 | 9,000 | — | 11,400 | 15,600 |
| 6. The Thin Water | **14,500** | 6,500 | 10,900 | — | 13,800 | 18,900 |
| 7. Lampmoss Slough | **17,000** | 7,700 | 12,800 | — | 16,200 | 22,100 |
| 8. Pyrefall Gorge | **21,000** | 9,500 | 15,800 | — | 20,000 | 27,300 |
| 9. The Thunder Stair | **25,000** | 11,300 | 18,800 | — | 23,800 | 32,500 |
| 10. The Inkwood | **35,000** | 15,800 | 26,300 | 29,800 (old) | 33,300 | 45,500 |
| 11. The Siltway | **42,000** | 18,900 | 31,500 | — | 39,900 | 54,600 |
| 12. The Salt Gate | **50,000** | 22,500 | 37,500 | 42,500 (night) | 47,500 | 65,000 |
| 13. Lanternroot Lagoon | **60,000** | 27,000 | 45,000 | 51,000 (night) | 57,000 | 78,000 |
| 14. The Waxen Reef | **71,000** | 32,000 | 53,300 | 60,400 (old) | 67,500 | 92,300 |
| 15. The Last Light | **86,000** | 38,700 | 64,500 | — | 81,700 | 111,800 |
| 16. The Rime Sound | **103,000** | 46,400 | 77,300 | — | 97,900 | 133,900 |

The four built lakes keep their order; the Mossmere keeps its prices; the other three are re-priced for the roster's values (the roster deferred prices to this spec). A new water's place maps are shares of its lake map: day 0.45, old 0.75, fifth 0.85, night 0.95, crown 1.3. A lake map costs about 25 minutes of its own water's target income.

**The whole catalogue** (the pacing run's 176 purchases): **3,785,037 clams**: maps 71%, lures 8%, tackle 7%, legend bait 7%, looks 3%, home 3%, raft and hold under 1%. The legends' first landings pay back 726,700 of it.

### 4.9 Pacing targets, and the proof

The pacing run (sim section 5) is an average player: 90% of the natural rule's clams, 25% more time per trip for looking around, plain bait from minute 30, +6% per order slot. It buys 176 things in a sensible order and always fishes the best of its three newest waters.

| mark | clams per trip | minutes per trip | trips per purchase | bought | where | state | target |
|---|---|---|---|---|---|---|---|
| **10 min** | 62 | 3.5 | 1.0 | 3 | the Mossmere | hold 4, Line T1, the Lily Maze | first purchase after trip 1; 2–5 bought; 40–90 clams |
| **1 h** | 211 | 4.3 | 0.7 | 16 | the Mossmere | T1, hold 5, three places | 100–240 clams; 0.5–2.6 trips; 11–19 bought |
| **5 h** | 784 | 5.2 | 2.7 | 48 | Sporewood | T3, hold 7, three waters, 10 places | 300–900 clams; 1.5–5 trips |
| **20 h** | 2,658 | 5.5 | 3.2 | 85 | Rushlight Fen | T5, hold 8, five waters, 21 places | 1.5–7 trips; 5–8 waters owned |
| **40 h** | 10,179 | 5.8 | 3.3 | 143 | the Salt Gate | T6, hold 8, 13 waters, 51 places | — |
| **the end** | — | — | — | 176 | | everything, at 49.3 h | 40–60 h |

| water | its map bought at | the best water to fish from | its legend landed at |
|---|---|---|---|
| 1. The Mossmere | start | 0.0 h | 2.0 h |
| 2. Sporewood Pools | **1.3 h** (target 1.2–2.0) | 1.3 h | 4.8 h |
| 3. Glasswater Vault | **4.3 h** (4.0–6.5) | 5.6 h | 12.1 h |
| 4. The Pallid Deep | **9.7 h** (8.5–13) | 11.2 h | 19.1 h |
| 5. Rushlight Fen | **14.6 h** (12–18) | 19.1 h | 21.8 h |
| 6. The Thin Water | 20.2 h | 20.9 h | 24.2 h |
| 7. Lampmoss Slough | 22.2 h | 23.3 h | 26.4 h |
| 8. Pyrefall Gorge | 24.6 h | 26.4 h | 28.8 h |
| 9. The Thunder Stair | 26.8 h | 26.8 h | 33.8 h |
| 10. The Inkwood | 29.4 h | 32.8 h | 36.7 h |
| 11. The Siltway | 34.7 h | 35.7 h | 38.8 h |
| 12. The Salt Gate | 37.2 h | 38.8 h | 42.0 h |
| 13. Lanternroot Lagoon | 39.7 h | 42.0 h | 44.6 h |
| 14. The Waxen Reef | 42.9 h | 43.5 h | 46.5 h |
| 15. The Last Light | 45.3 h | 45.3 h | 48.5 h |
| 16. The Rime Sound | 47.0 h | 47.7 h | 49.3 h |

| milestone | value | target |
|---|---|---|
| the longest wait for one purchase | **57 min** (Line T5) | ≤ 90 min |
| the first giant comes home | about **hour 1.8** (a Hullkiss Lamprey or a Thousandcast Pike) | hour 0.4–3 |
| giants landed and kept by the end | **about 90** | — |
| Elders landed by the end | **about 74** | — |
| every water, fully mapped, pays more per minute than the one before | 67 → 118 → 243 → 333 → 472 → … → 3,891 clams a minute | rises at every step |
| every water is the best water to fish for a while | yes, all 16 | yes |
| maps' share of all spending | **71%** | 50–75% |

**The first trip** (natural rule, 4,000 trips): 44 clams on average, 19–80 for most players (10th–90th percentile); 2.2 minutes; 98% come home full; **52% bring home no Prize or bigger**; 8% a Trophy; 27% of hooked fish get away; 63% get a bite after dark.

**The buying order of the pacing run** (hour · what · price; the full table with trips is printed by the sim):

| era | purchases in order |
|---|---|
| the Mossmere, 0–1.3 h | 0.04 Hold 4 · 30 → Line T1 · 50 → map: the Lily Maze · 60 → Rod T1 · 50 → Reel T1 · 50 → Oars I · 60 → Order Board I · 70 → 0.49 Hold 5 · 120 → map: Under the Span · 150 → Glimmer Spoon · 90 → Quiet Hull I · 100 → Bone Jig · 110 → 0.83 map: the Buoy Lights · 260 → Lantern I · 100 → Feather Fly · 50 → Harbour-Bell Spinner · 180 → Bait Bed I · 120 → **1.26 MAP: Sporewood Pools · 800** |
| Sporewood, 1.3–4.3 h | Line, Reel, Rod T2 · 300 each → 1.67 Hold 6 · 450 → map: the Lullaby · 400 → Long Wall wing 1 · 250 → map: the Bell Pool · 500 → the Matriarch hunt · 142 → map: the Gill Harp · 800 → Oars II · 300 → Order Board II · 400 → Spore-Lamp Fly · 500 → Landing lights I · 200 → 2.51 map: the Puffball Vent · 1,100 → Moth Popper · 400 → map: the Veilwater · 1,200 → Lantern II · 500 → Slate Cloak Dye · 300 → Quiet Hull II · 600 → Line T3 · 1,200 → Oxblood Pennant · 400 → Bait Bed II · 700 → Reel T3 · 1,200 → Amber Lantern Glass · 600 → 3.69 Rod T3 · 1,200 → **4.23 MAP: Glasswater Vault · 5,000** |
| Glasswater, 4.3–9.7 h | 4.45 Hold 7 · 2,000 → map: the Mother's Cup · 2,200 → the Grove hunt · 613 → map: the Stilled Cascade · 2,000 → map: the Mirror Nave · 3,200 → Mirror Shard · 2,400 → Oars III · 1,500 → Landing lights II · 1,200 → 6.10 map: the Well of Ledgers · 4,000 → Order Board III · 4,000 → Line T4 · 6,000 → Lantern Lure · 4,000 → map: the Broken Hymnal · 4,800 → Lantern III · 3,500 → Reel T4 · 6,000 → Painted Prow · 2,500 → 8.91 Rod T4 · 6,000 → **9.61 MAP: The Pallid Deep · 12,000** |
| the Pallid Deep, 9.7–14.6 h | 10.21 Hold 8 · 10,000 → map: the Bier Barge · 7,000 → map: the Chain Garden · 11,000 → Quiet Hull III · 8,000 → map: the Fallen Chandelier · 7,500 → the Sovereign hunt · 2,452 → Bait Bed III · 9,000 → Ferryman's Coin · 9,000 → map: the Sunken Belfry · 14,000 → Landing lights III · 14,000 → Bell Buoy · 6,000 → **14.60 MAP: Rushlight Fen · 12,000** |
| each new water, 14.6–49.3 h | its lake map → (Rushlight Fen: Line, Reel, Rod T5 · 24,000 each; the Inkwood: T6 · 60,000 each; Long Wall wings with waters 5, 9, 13) → its day water → its old water → its giants' lure → the crown and legend hunt of the water before → its fifth place → its night water. The Rime Sound's own crown and the Long Winter end the shelf at 49.3 h. |

**What the sim found that shaped the design.**

- **A giant's share must not depend on the pool.** With a fixed weight, a night water with little else biting gave its giant on 94% of bites; with family lures multiplying it, a giant came home on 55% of trips at hour 1. Hence the fixed share and "only its own giants' lure draws it" (§3.5).
- **A bait that pulls in commons loses clams** (Mire Worms −16% at hour 1, because the roster names them for many commons). Hence bait no longer changes the pool (§4.5).
- **A new water's open water pays less than the old water fully mapped,** so the player keeps fishing the old water for up to 4.5 hours after buying a lake map (Rushlight Fen, while T5 is bought; most waters 0–2 hours), until its day and old water are bought (the "best water" column). This is accepted: the place maps are on the shelf from the first day, and they are where the giants are. It was risk 3 in v4.
- **Each water needs its own value tier.** At one value point per tier the waters pay 6.7 to 19.1 clams a minute, because their fish, Fight and tackle differ. `node tools/sim/clams.mjs --calibrate` prints the tiers that make each water 1.2 times the one before on the same tackle; the table in §4.1 is its output, rounded.
- **What a place adds**, bought in order (clams per minute): the Mossmere: the Lily Maze +13%, Under the Span +35%, the Buoy Lights +10%; Glasswater: +13%, the Mirror Nave +44%, +15%, the Well of Ledgers +8%; the Thin Water: +4%, the Broken Weir +32%, +9%; the Siltway: +11%, the Sunk Ferry +54%, +16%. **Old water is the best buy in every water**: it is where the Elders and most giants are.
- The model's limits: no cast depth, no signs, no weather, no Marked Fish bonus, orders as a flat 6%, curiosities left out. Read every number as ±10%.

---

## 5. Maps: the only way to a new water

### 5.1 Rules

| # | rule | why |
|---|---|---|
| 1 | Two kinds of map, one word on screen. A **lake map** opens a water's open water. A **place map** opens one named water inside a water you own. | The four built arenas exist; a lake map sells in slice 1 with no world work. |
| 2 | **85 maps for sale**: 15 lake maps (the Mossmere is yours) and 70 place maps: four per water (**day water, old water, night water, crown**) and a **fifth** in the six waters whose fourth giant the roster put on a later sheet (the Puffball Vent, the Well of Ledgers, the Overhang, the Turning Tide, the Monsoon Cut, the Drowned Spire). | One pattern, four glyphs (sun, ring, moon, crown); every roster giant has a map. |
| 3 | Open water gives fish up to Trophy. **Elders bite only in old water, and a giant at its own place.** A place's own fish and its giant bite only at that place; a "night water" fish bites in any night water of its water. | Big and rare fish live on bought water. |
| 4 | **Clams are the only key.** A place map needs its water's lake map. A lake map needs the water before it. Nothing needs a legend, a catch or a count. | The map is the only way. Luck never blocks a purchase. |
| 5 | **A water you do not own is not in the world.** At home it is a rolled sheet on Murk's shelf, sealed with wax in the shape of its legend, with a price. | The big goal is in sight from the first minute. |
| 6 | **A place you do not own is standing mist**: a low lavender bank over that water, its landmark a dark shape inside, and on clear nights its giant's dark back turning in it. You can sail through it. A cast into it comes back ("Nothing bites in the mist."); the bait is kept and no bite is spent. On the Chart it is a blot with a glyph and a price, and no name. | The water sells the next map without a word. You know something is there and that it is big; you do not know what until you buy. |
| 7 | **Buying a place lifts the mist for good.** On the first evening there, the bank thins over 3 s, the camera frames the landmark and an ink title card names the place (1.2 s). | The purchase pays out as a view. This is what "discovering a place" now is. |
| 8 | Maps are sold only at home. **Murk shows at most three**: the two cheapest place maps you can buy, and the next lake. | Few cards, always a next one. |
| 9 | **A map card names one fish**, drawn life-size beside the Wick, with the hour glyph, one line and the price: **its giant** when the place has one (a crown names its legend), else the place's best fish. A lake map's card is its sealed sheet: the legend's seal. It does not name the place. | You buy a promise: a giant and an hour. (User: yes.) |
| 10 | A trip is one water and every place you own in it. It starts at the dock nearest the place you tapped on the Chart. | More maps mean more good bites and a longer evening. |

### 5.2 The catalogue

**The four built lakes.** Sites are built arena features (`ZONES[].arena`, `PLACES_V3`). The Mossmere's four places keep their §25.8.4 geometry (`MOSSMERE_V3.places`). The other built lakes' places are **re-sited as raft waters** (they were authored for walking layouts that are not built); the centres below are for the build to validate against `world-layout` (open water ≥ 80%, clear of islands, docks and the spawn). The Puffball Vent and the Well of Ledgers keep their `PLACES_V3` discs.

| map | kind | price | where (built feature · about x, z) | the card names | also there | the card's line |
|---|---|---|---|---|---|---|
| **The Mossmere** | lake | start | — | its seal: the Belled Matriarch | 12 open-water fish | — |
| The Lily Maze | day | 60 | lee of Mossbell Isle · (−40.5, 24.5) | Candlefin Koi (drawn ×3) | Weeping Carp (drawn ×1.5) | "Under the pads, the koi glow like lanterns under snow." |
| Under the Span | old | 150 | the Toppled Bridge's piers · (−29.5, 0.5) | ★ Thousandcast Pike (dusk) | Bridgechain Sturgeon (its own); Elders | "The bridge kept its chain. Something else kept the bridge." |
| The Buoy Lights | night | 260 | the west channel · (−48, −2) | ★ Hullkiss Lamprey | Gloam Eel (on Lumen Moss) | "The harbour lights never went out. They just went under." |
| The Bell Pool | crown | 500 | the Bell Pool · (−4, −14) | ★ the Belled Matriarch | — | "Twice a day the moon looks in on the old bell." |
| **Sporewood Pools** | lake | 800 | — | its seal: the Drifting Grove | 12 open-water fish | — |
| The Lullaby | day | 400 | the Lullaby Pool · (−28, −8) | Sleepspore Jelly (on Lumen Moss, drawn ×2) | Velvet Ray (drawn ×1.5) | "Some fish sleep with their mouths open." |
| The Gill Harp | old | 800 | the south-east stalks · (39, 27) | ★ Harpstring Eel | Elders | "Somewhere in the Pools a harp still knows one song." |
| The Puffball Vent | old (fifth) | 1,100 | the cap reef's vent · (0, −25) | ★ Emberbrood Snakehead | Elders | "Pink sparks at the surface, and something under them." |
| The Veilwater | night | 1,200 | lee of West Lily Cap · (−36, −36) | ★ Festival Puffer | Hushcap Koi (its own), Nightbloom Carp | "A koi that only glows in the dark it keeps." |
| The Mother's Cup | crown | 2,200 | the Grove Well · (28, −16) | ★ the Drifting Grove | — | "The Mother breathes, and big things breathe with her." |
| **Glasswater Vault** | lake | 5,000 | — | its seal: the Glass Sovereign | 11 open-water fish | — |
| The Stilled Cascade | day | 2,000 | lee of the Monolith of Tides · (−28, −40) | Rainglass Darter | Glassgill Perch, Prism Minnow | "Rain fell into the cascade the moment it froze." |
| The Mirror Nave | old | 3,200 | by the Monolith of Names · (−48, 0) | ★ Shardspine Eel (dusk, night) | the Unreflected (its own); Elders | "In the Nave, one fish has no reflection." |
| The Well of Ledgers | old (fifth) | 4,000 | the north-west shelf · (−41, 41) | ★ Prismdrop Sturgeon | the Footnote (its own); Elders | "Older than the Vault. It comes up to see if the sky came back." |
| The Broken Hymnal | night | 4,800 | by the Monolith of Hymns · (48, 0) | ★ Wolfwake Trout | Vesper Gar | "A chord that was never finished." |
| The Fallen Chandelier | crown | 7,500 | the North Trench · (0, −37) | ★ the Glass Sovereign | — | "The great light fell here, and something keeps it lit." |
| **The Pallid Deep** | lake | 12,000 | — | its seal: the Lantern-Swallower | 7 open-water fish | — |
| The Bier Barge | day | 7,000 | the Bier Barge wreck · (−10, −12) | the Wax-Bearer (its own) | — | "The dead were sent off with wax on their brows." |
| The Chain Garden | old | 11,000 | under the north rib · (0, −37) | Candlewake Sturgeon (its own, at night) | Gilt-Eyed Eel; Elders | "Its scutes are candles nobody lit." |
| The Sunken Belfry | night | 14,000 | by the Candle Barge · (50, 4) | the Clapper (its own) | Lampwarden Angler (on Ember Roe) | "When the bell rings below, everything listens." |
| The Bottomless | crown | 19,000 | the Well · (0, −52) | ★ the Lantern-Swallower | — | "The great lantern went down here. It is still going." |

The Pallid Deep's only giant is its legend (the roster gives it one main fish); its three place maps promise its built rares, which are its dearest fish after the legend.

**The twelve new waters.** Sites are authored with each water's arena (§5.3); the roster's water and giant descriptions (ROSTER §3) are the brief for each landmark. Every card's line is written with its sheet.

| water · lake map | day water | old water | night water | fifth place | crown |
|---|---|---|---|---|---|
| **5. Rushlight Fen** · 12,000 | the Reed Lanes · 5,400 · Foamnest Pike | the Run · 9,000 · ★ Packtooth | the Night Lanes · 11,400 · Reedwalker Catfish | — | the Dam Foot · 15,600 · ★ the Long Thunder |
| **6. The Thin Water** · 14,500 | the Marsh Lanes · 6,500 · Inkthumb | the Broken Weir · 10,900 · ★ Weirflame | the Lamp Ford · 13,800 · Blotback Catfish | — | the Moonbed · 18,900 · ★ the Buried Moon |
| **7. Lampmoss Slough** · 17,000 | the Straight Canal · 7,700 · Spotmail Gar | Under the Weir · 12,800 · ★ Weirshadow Catfish | the Lock Gate · 16,200 · ★ Old Portcullis (moved from the Mossmere) | — | the Sentry's Reach · 22,100 · ★ the Last Sentry |
| **8. Pyrefall Gorge** · 21,000 | the Alms Steps · 9,500 · Almsfed Carp | the Coin Run · 15,800 · ★ Pyregold Carp | the Boulder Garden · 20,000 · ★ the Unfinished | — | the Last Pyre · 27,300 · ★ the Ashen Guest |
| **9. The Thunder Stair** · 25,000 | the Step Pools · 11,300 · Cradlemouth Bream | the Cauldron · 18,800 · ★ Lampeye Perch | the Soap Landing · 23,800 · ★ Soapthief | — | the Throat · 32,500 · ★ the Last Lock |
| **10. The Inkwood** · 35,000 | the Windfall · 15,800 · Gourdcracker | the Kitchen Stair · 26,300 · ★ Emberbelly | Rootgate Creek · 33,300 · ★ Nightcreek Hound | the Overhang (old) · 29,800 · ★ Smilejaw Bream | the Breathing Mere · 45,500 · ★ the Banked Fire |
| **11. The Siltway** · 42,000 | the Seam · 18,900 · Snufferjaw | the Sunk Ferry · 31,500 · ★ Sternlamp Catfish | the Lamp Bar · 39,900 · ★ Dapplewheel Ray | — | the Long Hole · 54,600 · ★ the Barge-Shadow |
| **12. The Salt Gate** · 50,000 | the Bar · 22,500 · Sandblower | the Sluice Throat · 37,500 · ★ Sweetwater Shark | the Harbour Stump · 47,500 · ★ Inkmarble Eel | the Turning Tide (night) · 42,500 · ★ Tideghost Shark | the Slipway · 65,000 · ★ the Old Shipwright |
| **13. Lanternroot Lagoon** · 60,000 | the Bright Flats · 27,000 · Sandghost | the Sunken Orchard · 45,000 · ★ Snagheart Bass | the Stilt Shrine · 57,000 · ★ Votive Shark | the Monsoon Cut (night) · 51,000 · ★ Rootjaw Catfish | the Sighing Pool · 78,000 · ★ the Silver Regent |
| **14. The Waxen Reef** · 71,000 | the Chimney Gardens · 32,000 · Nebula Trout | the Broken Keel · 53,300 · ★ Anvil Trevally | Lamp Row · 67,500 · ★ Mothlance Gar | the Drowned Spire (old) · 60,400 · ★ Spirewatch Pike | the Abbot's Cellar · 92,300 · ★ the Waxen Abbot |
| **15. The Last Light** · 86,000 | the Lamp Rock · 38,700 · Soot Jack | the Drift Line · 64,500 · ★ Nightsail Lancer | the Beam · 81,700 · ★ Castaway Pike | — | the Unlit Mile · 111,800 · ★ the Jetsam Shark |
| **16. The Rime Sound** · 103,000 | the Net Racks · 46,400 · Emberspot Flounder | the Fjord Floor · 77,300 · ★ Icedoor Flounder | the Lantern Hole · 97,900 · Rosedeep Rockfish | — | the Half-Mile Line · 133,900 · ★ the Long Winter |

Each cell is the place · its price · what its card names. The other fish at each place (its kind's fish, and the curiosities of roster §6) are in Appendix A.

**Every roster fish has a map** (sim section 0 checks it): an open-water fish comes with its lake map, a "day / old / night water" fish with any place of that kind in its water, a giant with its own place, a legend with her crown. The Lampspot Snakehead lives in two waters (Lampmoss Slough and Pyrefall Gorge). The Gill Lodger is never hooked (roster ask 7: it rides in about 1 in 8 Prize-or-bigger Siltway catfish, shown on the card with its own Keep or Let go). Curiosities bite at the places roster §6 names and take a slot like a fish.

**What becomes of §25.8's other places.**

| | places | what happens |
|---|---|---|
| **in the catalogue** | the Puffball Vent, the Well of Ledgers (built lakes' fifth places, for their giants) | §5.2 above |
| **later sheets** (the second edition; no roster fish lives there) | the Sluice Run, the Cupped Hands, the Gatehouse Door · the Drowned Greenhouse · the Bell-Chapel Window · the Empty Ferry Slip, the Long Pier of Names | five built species wait for them: the Cupbearer, the Remembered Sun, the Sexton, the Unpaid Fare, the Namesake (Appendix A) |
| merged | the Ferry-Market into the Bell Pool (its Moonfall); the Burning Glass into the Fallen Chandelier | one place each |
| cut | the Votive Font (fry water); the Drowned Almshouse (species on demand breaks "the species hides") | — |
| parked | the four secrets, Found Relics, Vistas, Remnants, residents, Astir, weather, everything reached on foot | §9 |

**Rumours.** `RUMOURS`' three tiers become: tier 1, the line on the map's card; tier 2, Murk's one line when you buy it; tier 3, a note on the owned sheet once you have landed the named fish. Rumours pay nothing.

### 5.3 What a place and a new water are, in the 3D world

- **A place** is a small water (a disc or a lane, 5–8 m) inside a water's arena with its kind, its good bites and favour (§3.3), the fish it draws (at most two), its own fish, at most one giant, a landmark, a dock and its mist. Slice 2 ships places as this data. The twists of §25.8 (the bowl that overflows, threading the arches, Moonfall) are polish added per place afterwards; no place waits for its twist.
- **A new water** is a new `ZONES` entry built like the four that exist: one of the built layouts (`bowl`, `twoBasins`, `ringTrench`, `drop` in `world-layout.js`), its islands and pillars from the kit with **new island and pillar kinds** for its landmarks (`world-art.js`), its palette and grade in the Starlit family (roster §3 gives each water's colours; green only as a trace), its docks, its four or five places and its crown pool. A new water is mostly data plus its landmarks; each one's draw calls stay inside §25.8.8's per-lake line.
- On the **Chart** a new water is a new sheet; in the **Landing** a new Waystone at the sea-gate lights when its map is bought.

### 5.4 The Chart (the Map Table)

- One sheet per water you own, side by side by reach; the next water is the rolled, sealed sheet at the end with its price.
- A sheet is the water's outline in ink. Owned places are small vignettes with their glyph and name. Unowned places are mist blots with a glyph and a price. Under each owned place: your best fish there (species glyph, cm), and a gold ★ once you have landed its giant.
- **One action:** tap a water (a place, or open water), then **Sail**. Tapping a blot or the rolled sheet opens Murk's card for it.
- Below the sheet: the lure slot and the bait slot (two glyphs, a count on the bait), and the hold's slots.
- First it is a screen (slice 1: a list of sheets; slice 2: the drawn sheet). When the Landing is built it is the Map Table's top (§6.1).

---

## 6. Home: the Landing

### 6.1 The smallest honest home, and how it becomes the Landing

| stage | what home is | built from |
|---|---|---|
| **the Jetty** (slices 1–3) | A screen over the live scene: the water's first dock at dawn, Murk's barge moored, your raft tied up. Three ink tiles, one word each: **Murk** · **Chart** · **Journal**. Your clams, top-right. One goal line. Home upgrades you own are drawn on the tiles and in the scene. | Murk's barge and the docks (built: `actors-merchant`, `world.getMerchantDock`), the shop screen, the Journal |
| **the Landing, raft-mode** (slice 4) | The cove of §25.4 as its First Evening slice: quay, jetty, hearth, Murk's barge, the sea-gate and its Waystones. You stay on the raft; the three tiles become three posts you sail up to. Home upgrades are objects in the cove. | the cove world of §25.14.2b (FE-W1; `world.js SUPPORTS_COVE`), `player-cove.js` (built) |
| **the Landing, walked** (later, not planned here) | The full walkable cove of §25.4. | needs the foot controller (parked) |

Home is honest at every stage: it is where Murk is, where the fish become clams and where the water comes back. Only its look grows.

### 6.2 What grows at home without clams

| trigger | what shows |
|---|---|
| a lake map bought | its sheet is pinned beside the others; its Waystone lights at the sea-gate (the Landing; 16 Waystones in four arcs, one per reach) |
| a place map bought | its vignette is inked on the sheet |
| a species landed | its Journal page; its ink print (§6.4) |
| a giant landed | its print is framed in gold in the Journal; its place's vignette gets a gold ★ |
| a legend landed | her print hangs under the sea-gate arch; her Waystone burns gold |
| tackle, raft parts, looks | the rod on the rack, the raft at the jetty and the Wick wear what you own |

### 6.3 What clams build at home

| upgrade | level · price | what it does | what you see |
|---|---|---|---|
| **Murk's Order Board** | I 70 · II 400 · III 4,000 | Murk chalks 1 / 2 / 3 **orders**. An order names a fish from a water you own ("2 Dusk Minnows", "a Prize Weeping Carp"). Every fish that fills it **sells for double**. An order is replaced when filled, or after 3 evenings. Two orders in three ask for common or uncommon fish; orders never name a giant. | a chalk board on the barge; a bigger board; a board on the quay |
| **Bait Bed** | I 120 · II 700 · III 9,000 | Each evening you set out with at least 3 / 6 / 10 of the water's plain bait, free. It tops you up; it does not pile up. | a moss tub by the jetty; two; a planted bed |
| **The Long Wall** | wing I 250 · II 10,000 · III 25,000 · IV 50,000 | One wing per reach (four waters each). A wing hangs your best **ink print** of every fish of its four waters, at true size on its painted ruler (§25.4.3's frames); giants in gold frames. | bare wall, then frames filling with prints, a candle under each |
| **Landing lights** | I 200 · II 1,200 · III 14,000 | Looks only. | jetty lanterns; quay lanterns; the sea-gate beacon |
| **Looks** | Slate Cloak Dye 300 · Oxblood Pennant 400 · Amber Lantern Glass 600 · Painted Prow 2,500 · Bell Buoy 6,000 · Gilt Lantern 14,000 · Reed Sail 15,000 · Star Pennant 30,000 · Moon Lamp 60,000 | Looks only. The first three are `COSMETICS_V3`'s. | on the Wick, the raft and the jetty |

No home upgrade changes what a fish is worth except an order, and no upgrade anywhere adds a percentage to the sale.

### 6.4 Records without giving up the sale: the ink print

You sell what you keep, so nothing is mounted. Instead, at the measure (built: records are written at the seal stamp, before the card) the Wick takes an **ink print** of the fish. The print is yours whether the fish is kept or let go.

- The Journal keeps the best print per species (length, class seal, where, which evening), and a page of the 49 giants: a dark outline until landed, then its print in a gold frame.
- A Long Wall wing hangs those prints at true size. Until a wing is bought the prints live in the Journal only.
- The class seals (Prize, Trophy, Elder per species; §25.7.4) and the 49 giants are the long goals after the shelf is empty.
- The Live Well, "mark for home", mounts and the keep-pond are parked (§9).

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
- v3's outfit maps onto this: Long Oars → Oars; Thick-Glass Chimney → Lantern; the Rendering Brazier and the Cork-Soled Boots are parked.

---

## 8. Flows, and every word on screen

**The rule.** One line at a time. No panel of text. Numbers are prices, clams, centimetres and the count on a bait; from 10,000 a number shows as "12.4k" (and "1.2m"). Odds stay in the logs (§25.6.11). Murk speaks one line, rarely, and never during a bite.

### 8.1 On the water

| element | words | notes |
|---|---|---|
| the hold | none (slot glyphs) | top-left; a giant's slot is gold-edged |
| the Home pill | **Home** | bottom corner, ≥ 56 px. With an empty slot it asks once: "Head home? 2 slots empty." **Home** / **Stay**. With a full hold it goes at once. Not available during a play. |
| the float | none (favour notches, good-bite dots) | shown when the float settles, cleared at the strike (built) |
| quiet water | "Gone quiet." | once per water per evening |
| a full hold | "Hold's full." | on a cast; the Home pill pulses |
| mist | "Nothing bites in the mist." | on a cast into an unowned place |
| tackle | none (the lure glyph, the bait glyph with its count) | built selector |
| the Journal glyph | none | locked while a line is in the water (built) |
| gone from the HUD | the oil gauge, satiety, Embers, the level bar, the day counter, the night-mode glyph, the flare button, Far Water | §9 |

### 8.2 The catch card

After the Wick has held the fish up and paused: the built card (name, class stamp and length as the hero, the record kicker in a few words). A giant's card has a gold ★ before its name and its seal stamped in gold.

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
| **the tally** | the fish go onto Murk's scale one by one, biggest last; each value ticks up with a coin sound; then the total. A giant goes last, alone, with a longer pause. | fish names (small), values, "order ×2", "Old Ledger ×2", the total "+193", one button: **Sold** |
| an empty hold | nothing to weigh | Murk: "Nothing? The water keeps its own counsel. Go again." |
| the Jetty | three tiles and the goal line | **Murk** · **Chart** · **Journal** · "Next: Hold 4 · 30" |

### 8.4 Murk's shelf

Five tabs, a glyph and one word each: **Tackle** · **Raft** · **Bait** · **Maps** · **Home**. A card is a drawing, a name, one line and a price button.

| item | the one line |
|---|---|
| Hold 4 … 8 | "One more slot." |
| a rod | "Holds every fish better. Casts farther." |
| a line, a reel | "Holds every fish better." |
| a family lure | "+6 Hold against predators." (built gear line) |
| a giants' lure | "For the Packtooth." (its first-named giant) |
| Oars | "Faster." |
| Quiet Hull | "One more good bite in open water." |
| Lantern | "Better nights." |
| a tin | "10 baits for the Thin Water. Bigger fish." and, where true, "The Gloam Eel bites on nothing else." |
| a legend's bait | "For the Belled Matriarch. One try." |
| a map | the fish's name (★ for a giant), the hour glyph and the map's line (§5.2) |
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
| the first giant sold | "That one had a name before you met it." |
| a lake map first affordable | "I've a chart you can afford now." |
| a legend's first landing | "Her. You brought me her. Sit down, I'll count it twice." |
| sailing out (rotating, built lines kept) | "Bring me something with a story." · "The big ones come up at dusk. They always did." · "Back already? Good. Out you go." |

---

## 9. What is parked

"Parked" means switched off cleanly and kept in the code. One table in data says what is off:

```
data.LOOP_ENABLED  = globalThis.GW_LOOP === true            (needs V3_ENABLED; the loop runs on the phase-1 data and the automatic-fishing code)
data.PARKED        = LOOP_ENABLED ? { swarm, combat, levels, embers, hunger, oilAsLife, nightModes, death, farWater, liveWell,
                                      meta, tolls, longDescent, challenges, quality, mercy, passFavour, baitAttract, murkInLake, runShop,
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
| **Memories, relics, the Shrine**, Waystone relics | `progression.js`, the Shrine screen | nothing is granted, shown or applied; relic Hold is 0 | `meta.memories`, `meta.relics`, `meta.unlocks` kept in the save, never written; they work again if un-parked |
| **challenges** (48) and their unlocks | `progression-challenges.js` | not evaluated; the Trials screen is hidden | `meta.challenges` kept |
| **bounties in the lake**, Murk's Ledger | `progression-market.js` | replaced by Murk's orders, which reuse the bounty engine (§10) | `BOUNTIES`, `LEDGER` untouched |
| **tolls, descent gates, legend-gated lakes**, travel through the gate | `progression.js` `travel` | waters are reached from the Chart; the gate is scenery | `ZONES[].unlock` unused |
| **quality** (Fine, Shimmering) and the strike streak as value multipliers; release luck (`mercy`); let-it-pass favour; **a bait's attract** | `progression.js`, `fishing.js` | not applied (value is §4.1; a bait changes which fish bite only for its bait-only fish) | `QUALITY`, `BAITS[].bonus.attract` untouched (the attract list still says which fish a bait helps hold) |
| **Far Water, the Live Well, mark for home, mounts, the keep-pond, The Long Descent**, expeditions of several days | not built (P3) | stay unbuilt | `EXPEDITION`, `LONG_DESCENT` untouched |
| **residents, Astir, weather, rumours as quests, discovery by exploring, mastery, Tally Posts** | not built (P2) | stay unbuilt; places come from maps (§5) | `CONDITIONS`, `RUMOURS` kept (the lines are reused) |
| **walking** (§24), walked places, sister-candles, the Wayfarer | not built | `WALK_ENABLED` stays off | §24 data untouched |
| **proof catches** | `TACKLE.proofs` | not asked for | untouched |

**Saves.** The loop writes one new block and touches nothing else:

```
meta.loop = { v: 2, clams, evenings, hold, tackle: {rod, line, reel}, lures: [], fitted: {lure, bait}, bait: {waterId: {baitId: count}},
              maps: {lakes: [], places: []}, raft: {oars, hull, lantern}, home: {orders, baitBed, wall, lights}, looks: [], orders: [],
              legends: {id: landings}, giants: {id: {landed, marked}}, prints: {speciesId: {…}} }
```

- A trip is a run with `run.outing = 'trip'`: its creel is the hold, plus `run.bites = {waterId: n}` and `run.eveningT`. `run.shells` is not used.
- Journal entries, records, class seals, the Old Ledger, got-away lists, legend wounds and Marked Fish stay where they are (`meta`, built) and are shared with the old game.
- An old save opens in the loop with a fresh `meta.loop` and everything else kept. A v1 `meta.loop` (from a v4 build) is migrated: bait counts move under the water they were bought for, `giants` starts empty.

---

## 10. Every existing system

| system | status | the rule now |
|---|---|---|
| automatic fishing: cast, strike, the play, the reveal (§25.6) | **kept** | unchanged; the five promises hold |
| hidden odds, the logs, the gear log | **kept** | the gear log opens from Murk's shelf and the Journal |
| size shows, species hides; the night-ink proxy | **kept** | unchanged; a giant's tell is its size class like any fish |
| the size model and the five classes (§25.7.1) | **kept** | Elders bite in old water and as giants at their own place; the roster's sizes (§5 of the roster) replace the built L50s it re-founds |
| the species list | **changed** | the roster's 164 fish plus the 32 built species it keeps (`roster.json`); 21 built species are re-founded (roster §5); none retired |
| the got-away note, the Glimpsed page | **kept** | the roster's authored got-away lines (roster §6) are added |
| the light Marked Fish ("still out there") | **kept** | a lost Elder or a lost giant waits at its place; +6 Hold once |
| signs (rise rings, boils, glow trails) | **kept** | none spawn in quiet water; the six built signs only (roster §1) |
| let it pass, the lingering big bite | **changed** | no favour for passing; a pass spends a good bite |
| favour and the float's notches | **kept** | the float adds the good-bite dots |
| pressure (−0.12 per catch, reset at dawn) | **changed** | becomes §3.3: per bite, per evening, open water included, reset at home |
| the measuring ceremony, the landing's payoff, the catch show | **kept** | the card follows the show |
| the catch card | **changed** | Keep · value / Let go (/ Cut bait); a giant's card in gold |
| the creel | **changed** | it is the hold: 3 slots, bought to 8, sold whole at home |
| fish value (§25.7.3) | **changed** | §4.1 |
| food and oil from fish | **parked** | — |
| tackle tiers (§25.6.6) | **changed** | persistent, bought with clams at home, no proof catches, new prices; **T5 and T6 added** |
| outfit | **changed** | the raft's parts (§7) |
| lures | **changed** | permanent, new prices, fitted beside a bait; the four giants' lures re-aimed; twelve new giants' lures |
| baits | **changed** | a second slot; tins of 10 per water; each makes every fish bigger; attract parked; Windfall Plum and Tallow Soap added |
| legend baits, the legend rule, wounds, growth | **kept** | 16 legends; new prices; she needs her crown's map; she opens nothing; her first landing pays the map back |
| Old Murk | **changed** | he stays home; the tally and the shelf |
| bounties, Murk's Ledger | **changed** | Murk's orders (§6.3): fishing templates only (`catchSpecies`, `catchRarity`, `class`, `nightFish`), paid as double sale, never a giant |
| zones, gates, tolls | **changed** | maps (§5) |
| the four lake arenas | **kept** | as built; twelve more are built on their layouts (§5.3) |
| places (§25.8) | **changed** | 70 mapped places; mist; no discovery by exploring |
| rumours | **changed** | lines on map cards and sheets |
| day and night | **changed** | the evening (§3.4); the looks of each phase are kept |
| the Journal, records, class seals, the Old Ledger | **kept** | plus the Prints page, the giants' page and "Evening N"; an Old Ledger record pays double once |
| the Long Wall | **changed** | ink prints, bought by wing, one wing per reach (§6.4) |
| the five Wicks | **changed** | §10.1 |
| fish body plans (`FISH_SHAPES`) | **changed** | 15 new plans and 3 for curiosities, plus the named `sturgeon`, arrive with the slices that need them (§13) |
| curiosities (roster §6) | **new** | bite like fish, take a slot, sell at the water's rare Keeper price, write a *Not fish* page |
| challenges, Memories, relics, the Shrine | **parked** | — |
| the swarm, weapons, levels, Boons, health, hunger, oil as life, night modes, death, Far Water | **parked** | §9 |
| The Long Descent, the Live Well, the keep-pond, walking | **parked** (unbuilt) | — |
| the Landing as a 3D cove (§25.4) | **kept** | home's look; reached in stages (§6.1) |
| the First Evening (§25.4.8) | **kept** | three lines change (§11) |
| the opening cut scene | **kept** | unchanged (§11) |
| the Clear Night look, the Starlit palette, the UI style | **kept** | unchanged; the new waters' palettes follow roster §3 |
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
| Ashwick, Burned Once | +3 Hold on the first fish hooked after dark each evening (built `CATCH_V3.buffs.wicks`) | a giant landed |

They are chosen at home (the hearth, when the Landing exists; a row on the Journal's first page before). They ship in slice 9. Until then the game has one Wick.

---

## 11. How the user's earlier decisions fit

| earlier decision | in the Full Hold |
|---|---|
| **Automatic fishing on a land chance that is never 100%; odds only in the logs** (§25.6) | Unchanged. The land chance still comes from the fish, its class, the tackle, the lure or bait and the strike, by `catchParts`; a giant adds +10 Fight; the new waters add their Fight term; T5–T6 add Hold. Relic and Boon Hold are 0 while parked. |
| **Gear is global; bait and lures are fish-specific** | Unchanged, and now both are fitted at once (§4.4–§4.5). A bait is fish-specific through Hold; it no longer changes the pool. |
| **Bigger fish are harder; the size class shows; the species hides until the reveal** | Unchanged. A giant's tell is its class's tell. The card's clam value appears only after the reveal. A map card naming a giant is a promise about a place, not about a line (§5.1 rule 9). |
| **The got-away note** | Unchanged; a lost giant's note names it, and it becomes a Marked Fish. |
| **A very short tutorial at the Landing: the First Evening** (§25.4.8) | Kept as designed: the wake by the hearth, one cast, one strike, the play, the reveal, the card. It teaches fishing only. Three lines change: Murk's wake line becomes "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it."; the First Outing card shows the Mossmere, three empty slots and **Sail**; Murk's departure line becomes "Three slots in that hold. Fill them and come home." The Quayling is still not for sale (the tutorial's card has **Let go** only). Until the cove is built the game opens at the Jetty with the same departure line. |
| **An opening cut scene** | Kept. It plays before the First Evening, or before the Jetty while the cove is not built. |
| **On a catch the Wick holds the fish up, shows it, pauses, then the card opens** | Kept. A giant's show holds a beat longer (the built ceremony's longest class pose). The ink print is taken in the same beat. |
| **Very few words on screen** | §8 is the whole text of the loop. |
| **Art, atmosphere and fishing are the key drivers** | Every trip plays the game's best light. A new place is paid out as a view (the mist lifting). Sixteen waters, each its own palette and landmarks. |
| **The sharp Clear Night look, the lavender Starlit palette** | Kept. Mist banks are low (≤ 2.5 m), local and thin at the edge. |
| **Never a ring round the raft or the Wick; green only as a trace** | Kept. The lantern's light is an edgeless pool; the good bites are dots by the float. |
| **Original work only** | Kept (§25.15.3). Every fish is original (roster §1): no real species' name, never the series or its presenter. The hold is a row of slots, not a cargo grid; no spoilage, no storm timer, no panic. |
| **"Use all of these fish as inspiration"; "the main episode based fish … should be the rare giants"** | The roster is the species list; the giants rule is §3.5; every fish has a map (§5.2). |

---

## 12. Precedence over DESIGN §25 (and the roster)

While `LOOP_ENABLED`, this file overrides DESIGN §1–§25 and CONTRACT §13 wherever they conflict. With the flag off they stand as written.

| section | under the Full Hold |
|---|---|
| §25.0 decision log | kept; rows 11 and 12 added |
| §25.1 pillars | **replaced** by §1 here |
| §25.2 loops and sessions | **replaced** by §2 |
| §25.3 expeditions, Waystones as gates, tolls, Far Water, the Live Well, Snuffed, Homecoming, The Long Descent | **replaced** by trips (§2–§3) and the tally (§8.3); the rest parked |
| §25.4 the Landing | kept as home's look; its stations become Murk, the Chart and the Journal; §25.4.4's growth table **replaced** by §6; §25.4.8 kept with three lines changed (§11) |
| §25.5 night modes | **parked**; every night is still |
| §25.6 automatic fishing | **kept whole**, except: a lure and a bait together (§25.6.3), no favour for a pass (§25.6.4), parked buffs are 0 (§25.6.5), tackle by clams without proofs and with T5–T6 (§25.6.6), the card's choices (§25.6.8), the giants' Fight (§3.5) |
| §25.7 size | kept; §25.7.3's value rule **replaced** by §4.1; food and oil parked; Elders in old water and as giants; records kept and joined by the ink print |
| §25.8 world and locations | **replaced** by the map catalogue (§5); the Mossmere places' geometry and the place names are reused |
| §25.9 progression, §25.10 economy, §25.11 retention | **replaced** by §4 |
| §25.12–§25.13 supersession and sync | kept as history |
| §25.14 phase plan | **replaced** from here on by §13; what is built (P1, AF, the First Evening's logic) is the base; the P2–P4 lists are a parts bin |
| §25.15 risks, cuts, originality | the originality rules kept |
| §26.4 and `docs/loop/ROSTER.md` (the roster) | **binding for the fish**: names, looks, plays, sizes, rarities, hours, waters, places and giants. This spec is binding for where they bite in play, what they pay and what the maps cost; the roster deferred prices to it |
| v4 of this file (commit 1aa478c) | **replaced** by v5; its loop, rules and parked list carry over unchanged |
| §1–§24, Appendix A and B | as §25.12 says; everything about combat, survival and the meta is parked (§9) |
| CONTRACT §13 | binding for everything kept; a §14 for the loop's API is written with slice 1 |

---

## 13. The build plan

Nine slices. Each ends playable, behind `GW_LOOP`. **Every slice's gate:** `node tools/validate-data.mjs`, `node tools/check.mjs`, `node tools/sim/clams.mjs --quick` (from slice 1 it reads `data.LOOP`), `node tools/sim/roster-check.mjs`, the slice's browser scenario with no console errors, and the flag-off checks unchanged (the v1 golden trace, the flag-off scenario run). Sizes: S ≤ 2 days, M 3–6 days, L 1–2 weeks, one implementer per lane. From slice 3 each slice has a **fish lane** (body plans in `models-fish.js`, the species data) beside its systems lane.

**Two rules that let the roster arrive in pieces.** (1) A re-founded built species keeps its built model until its new plan ships (the Matriarch stays carp-shaped until the catfish plan). (2) A new roster species bites only once its body plan exists; until then it is not in the pool, and the sim's pacing for that slice is re-run on what ships.

### Slice 1: Three slots (M–L). The smallest thing that is already the user's game.

| | |
|---|---|
| **the player can** | Start at the Jetty. Sail to the Mossmere's open water for an evening. Catch fish automatically (as built). Keep or let go at the card, seeing the clams. Fill three slots; be refused a cast when full. Go home. Watch Murk's tally. Buy **Hold 4, Hold 5, Rod, Line and Reel T1 and T2**, and the **Sporewood map**. Pick a water on the Chart and sail again. Close the game mid-trip and continue. Never fail. |
| **waters and fish** | the Mossmere's open water and Sporewood's: every roster fish there on a built plan (the Mossmere: Dusk Minnow, Mossback Perch, Likely Chub, Overbold Bass, Rustfin Sucker, Milkeye Perch, Weeping Carp, Reedjaw Pike; Sporewood: Netcloud Fry, Threadling Eel, Velvet Ray on the built ray) and the built species the roster keeps there; the roster's re-founded sizes for the Mossmere and Sporewood. 5 new species. |
| **new body plans** | none |
| **reuses** | automatic fishing and its logs; the catch card, the ceremony and the landing's payoff; the creel (as the hold); the market's sell-all; `TACKLE` tiers and `getLoadout`; pressure (as quiet water); the Still night; the Journal; the built Mossmere and Sporewood arenas; Murk's barge at a dock |
| **modules** | `data.js` (`LOOP_ENABLED`, `PARKED`, `LOOP`: value rule and tiers, hold, water, evening, the tackle prices, the Sporewood map, `TEXT_LOOP`; `SPECIES_LOOP`: the slice's roster species) · `core.js` (the switch) · `main.js` (the trip flow: Jetty → Sail → Home → tally; no death flow) · new `progression-loop.js` (`meta.loop`, clams, the hold, the tally, the shelf, bites) wired from `progression.js` · `progression-market.js` (no Murk on the water) · `progression-af.js` (the loadout from persistent tiers; parked buffs 0) · `fishing.js` (bites and quiet water; the cast refused when full; no pass favour; no Elders in open water; hour windows) · `survival.js` (parked drains; the evening clock) · `combat.js` / `combat-modes.js` (parked) · `ui-hud-v3.js` (slots, Home, dots; parked gauges hidden) · `ui-screens.js` and new `ui-loop.js` (the card's buttons, the tally, the Jetty, the shelf, the Chart as a list) · `tools/validate-data.mjs` (LOOP rules) · `tools/sim/clams.mjs` (reads `data.LOOP` and the slice's species; its draft table is deleted) |
| **tests** (`tools/tests/loop.test.mjs`, browser scenario `loop-1`) | the hold: 3 slots, the 4th keep refused, the cast refused when full · keep and let go: both write the record; let go changes nothing else · bites: struck, passed, landed, lost and let-go bites each spend one; quiet after 4; −0.15 each to −1.2; no reset at dusk or night; reset at home · the evening: day 40 s, dusk 20 s, night holds; frozen in the ceremony; a "dusk" fish bites at night, not by day · value: a Keeper Dusk Minnow (z 0.4) 7, a Keeper Weeping Carp 26, a Prize Reedjaw Pike (z 1.4) 158, a Trophy Reedjaw Pike (z 2.2) 406, an Elder Reedjaw Pike (z 2.95) 1,022; clams persist; "12.4k" from 10,000 · the shelf: prices, the order of hold steps, a tier raises `catchChance`, the Sporewood map opens its sheet · parked: a night with no enemy, no change in oil, satiety or health, no death, no Memories, no Murk on the water · saves: continue mid-trip; an old save gains `meta.loop` and loses nothing · the scenario: fresh save → three fish → Home → +clams → Hold 4 → a second trip |
| **left out on purpose** | places, mist and giants; bait and lures (the built selector is hidden); orders; the other raft parts; home upgrades; legends; the cove, the First Evening and the cut scene (owned by the opening lane; the default build flips to the loop only when slice 1 and the opening are both in); the other Wicks; roster fish on unbuilt plans |

### Slice 2: The mist lifts (L). Places, maps and the first giants.

| | |
|---|---|
| **the player can** | See mist banks in the Mossmere, with a giant's back turning in one. Buy the Lily Maze, Under the Span, the Buoy Lights and the Bell Pool from a shelf of at most three map cards, each naming its fish. Watch the mist lift. Meet the **Thousandcast Pike** and the **Hullkiss Lamprey**; land one; see its gold card and the Journal's giants page. Meet Elders in old water. Hunt the Belled Matriarch with Heartmoss and be paid 500 for her. Use the drawn Chart. |
| **waters and fish** | the Mossmere's four places; its 2 epic giants and its legend; Kissmark Trout, Gloam Eel (night water), Bridgechain Sturgeon (Under the Span's own) |
| **new body plans** | **lamprey** (the eel with a mouth parameter: S), **sturgeon** (named, now built: M; Bridgechain first), **trout** (the minnow with a fatty fin and jaw: M; Kissmark Trout first) |
| **modules** | `data.js` (`LOOP.places` for the Mossmere from `MOSSMERE_V3` geometry; giant shares; map cards) · `world.js` / `world-v3.js` / `world-fx.js` (mist banks from the built mist material; the giant's back in the mist; the landmark silhouettes that exist) · `fishing.js` (`placeAt` from `LOOP.places`; good bites and favour by kind; draws; a place's own species; night water; Elders by kind and for giants; the giant's share, floor, favour and Fight; a cast into mist) · `models-fish.js` (three plans) · `render-camera.js` (the mist-lift shot) · `ui-loop.js` (the Chart's sheet, blots, the Maps tab, the gold card) · `progression-loop.js` (maps owned, giants landed, the legend's prize, wounds) |
| **tests** | a cast into mist returns and spends nothing · owning a map removes its mist and adds its good bites · Elders roll only in old water and for a giant at its own place · a giant never bites elsewhere and is never Small · over 20,000 bites at Under the Span the Thousandcast share is 6% ± 1 at dusk and night, 2.5% ± 0.7 by day · the Thousandcast at Prize lands less often than every other Mossmere fish on T1 · night water gives nothing before dark · the shelf never shows more than three maps · the Matriarch needs her pool, her bait, her hour and a free slot · draw calls inside §25.8.8's Mossmere line |
| **left out** | place twists, Moonfall, the harbour re-dress, the other waters' places |

### Slice 3: Bait, lures and the raft (M), and Sporewood's fish.

| | |
|---|---|
| **the player can** | Fit a lure and a bait. Buy tins for a water and permanent lures, among them the re-aimed Harbour-Bell Spinner. Cut a Small into bait at the card. Buy Oars, Quiet Hull and Lantern and see them on the raft. Buy the Order Board and fill Murk's orders for double. Read the gear log at the shelf. Catch all of Sporewood's open-water roster fish; see the Matriarch as a catfish and the Velvet Ray as a disc. |
| **waters and fish** | Sporewood's open water complete: Cindertail Catfish, Downcast Catfish, Falsesmile Barb, Lostsea Mackerel (4 new) |
| **new body plans** | **catfish** (31 fish; a new builder from the pike profile: L), **bream** (11; the perch with depth and jaw: M), **disc** (8; the built ray rounded: M), **tuna** (4; the minnow with finlets: M) |
| **modules** | `data.js` (`LOOP.lures`, `.bait` grades, `.raft`, `.home.orders`; the giants' lure lists) · `progression-loop.js` and `progression-market.js` (tins per water, orders on the bounty engine) · `progression-af.js` and `fishing.js` (two fitted items; bait favour; cut bait; bait attract parked) · `actors-raft.js` (the parts' models) · `player.js` (raft speed) · `models-fish.js` (four plans) · `ui-loop.js`, `ui-af.js` |
| **tests** | lure and bait Hold never stack (the larger counts) · a bait is spent per hooked fish and comes back on a pass · a bait changes the pool only for its bait-only fish · a tin's price is grade × the water's tier · Quiet Hull adds good bites to open water only · family lures do not raise a giant's share; its giants' lure does, ×1.5 · an order doubles exactly the fish that fill it and never names a giant · the sim's bait rows hold on real data |
| **left out** | the Bait Bed; new waters' baits |

### Slice 4: Home (L). The Landing in raft mode.

| | |
|---|---|
| **the player can** | Open the game with the cut scene and the First Evening (with the three changed lines). Come home to the cove at dawn and sail up to Murk, the Chart and the Journal. Buy the Bait Bed, the Landing lights, the first wing of the Long Wall and the looks, and see each in the cove. See a Waystone light for each water owned. Browse ink prints and the giants' page. |
| **needs** | the cove world (FE-W1, `SUPPORTS_COVE`), from the opening lane |
| **new body plans** (fish lane, ahead of slice 5) | **snakehead** (6; the eel thickened: M), **gar** (4; the pike with a snout: S) |
| **modules** | `world.js` (cove objects per home level; four Waystone arcs) · `main.js` and `first-evening.js` (the loop's lines and flow) · `player-cove.js` · `ui-loop.js` (posts for tiles; the Prints page) · `ui-fishart.js` (the print, the gold frame) · `progression-loop.js` (prints at the measure) · `models-fish.js` |
| **tests** | the First Evening ends in the first trip in under 60 s · a print is written for a kept and for a let-go fish · the best print per species wins · every home level changes the scene · the cove's draw calls inside §25.4.7 |
| **left out** | walking at home; wings II–IV (they come with their reaches) |

### Slice 5: The old kingdom, complete (L). The built lakes' places, T3–T4, three legends.

| | |
|---|---|
| **the player can** | Buy Glasswater and the Pallid Deep; buy all 14 remaining built places (Sporewood 5, Glasswater 5, the Pallid Deep 4), T3 and T4, the Spore-Lamp Fly, Mirror Shard and Ferryman's Coin, the Moth Popper and Lantern Lure, and hunt the Drifting Grove, the Glass Sovereign (now a sturgeon) and the Lantern-Swallower. Meet six more giants. The first reach is done. |
| **waters and fish** | Sporewood's places and giants (Harpstring Eel, Festival Puffer, Emberbrood Snakehead); Glasswater's fish (Rosefleck Trout, Duskbar Salmon, Redhome Salmon, Tremor Catfish, Pilgrim Salmon as a trout) and giants (Shardspine Eel, Wolfwake Trout, Prismdrop Sturgeon); the Pallid Deep's (Slipknot Eel) |
| **new body plans** | none (all of reach I's plans are in) |
| **modules** | `data.js` (14 re-sited places, validated against `world-layout`) · `world-art.js` (a landmark per place, in the lake's kit) · `fishing.js` (nothing new) · `tools/validate-data.mjs` (every place: open water ≥ 80%, a dock within reach, prices rising within a water, every giant has a place, every roster fish of the slice has a map) · `tools/sim/clams.mjs` (the pacing run on real data: §4.9's targets to the Pallid Deep are the gate) |
| **tests** | the pacing checks to hour 14 pass on `data.LOOP` · each built water's places exist, lift and fish · the species count per water matches Appendix A |
| **left out** | the later sheets |

### Slice 6: The fresh waters (L+). Waters 5–8.

| | |
|---|---|
| **the player can** | Buy Rushlight Fen, the Thin Water, Lampmoss Slough and Pyrefall Gorge, their 16 places, T5, four giants' lures and four legend baits, the Long Wall's second wing. Meet 6 giants (Packtooth, Weirflame, Weirshadow Catfish, Old Portcullis, Pyregold Carp, and the Unfinished, the gorge's one that got away) and 4 legends (the Long Thunder, the Buried Moon, the Last Sentry, the Ashen Guest). Find the Potlid Turtle and the Stone Lodger. |
| **waters and fish** | 4 arenas; 33 roster fish (Old Portcullis moves from the Mossmere's later sheet) and 2 curiosities |
| **new body plans** | **dogtooth** (6; the perch stretched with a teeth row: M); curiosities **softshell**, **salamander** (S each) |
| **arena work** | each water: a `ZONES` entry on a built layout, its island and pillar kinds (the dam, the broken weir, the lock gate, the pyres), palette and grade, docks, places, crown |
| **modules** | `data.js` (4 zones, 16 places, species, lures, baits, T5) · `world-art.js` (new kinds) · `world.js` (arena build for new zones) · `models-fish.js` · `models-kit.js` · `tools/validate-data.mjs` · `tools/sim/clams.mjs` |
| **tests** | the pacing checks to hour 30 · every new water's giant at Prize lands less often than its other fish on T5 · each water is the best water for a while · draw calls per water inside §25.8.8 |
| **left out** | reaches III–IV |

### Slice 7: The great rivers (L+). Waters 9–12.

| | |
|---|---|
| **the player can** | Buy the Thunder Stair, the Inkwood, the Siltway and the Salt Gate, their 18 places (two fifths: the Overhang, the Turning Tide), T6, Windfall Plum and Tallow Soap, four giants' lures and legend baits, the third wing. Meet 10 giants and 4 legends (the Last Lock, the Banked Fire, the Barge-Shadow, the Old Shipwright). Find Little Logjaw and the Mudlark Crab; glimpse the Long Coil; find a Gill Lodger in a big Siltway catfish. |
| **waters and fish** | 4 arenas; 48 roster fish, 3 curiosities and the Gill Lodger |
| **new body plans** | **shark** (7; a new builder: L), **sawfish** (1; the shark with a saw: M) |
| **modules** | as slice 6, plus `ui-loop.js` (the Gill Lodger's second card) |
| **tests** | the pacing checks to hour 42 · T6 on the shelf with the Inkwood · the Gill Lodger shows on about 1 in 8 Prize+ Siltway catfish and never bites on its own |
| **left out** | reach IV |

### Slice 8: The sea (L+). Waters 13–16.

| | |
|---|---|
| **the player can** | Buy Lanternroot Lagoon, the Waxen Reef, the Last Light and the Rime Sound, their 18 places (two fifths: the Monsoon Cut, the Drowned Spire), four giants' lures and legend baits, the fourth wing. Meet 9 giants and 4 legends (the Silver Regent, the Waxen Abbot, the Jetsam Shark, the Long Winter). Find the Paper-Lantern Jelly and the Guttering Squid; lose the Unlit Lance. Finish the shelf at about hour 49. |
| **waters and fish** | 4 arenas; 43 roster fish and 3 curiosities |
| **new body plans** | **jack** (5; M), **billfish** (3; the tuna with a bill: M), **cod** (5; M), **flatfish** (2; a new builder: M); curiosity **squid** (S) |
| **modules** | as slice 6 |
| **tests** | the full pacing run passes on `data.LOOP` (every check of §4.9) · `roster-check.mjs` and the sim's "every roster fish has a map" pass on the shipped data |
| **left out** | the later sheets |

### Slice 9: The long tail (each item ships alone, S–M).

The four other Wicks (§10.1) · the Old Ledger's double and its chalked names · one twist per place (the built §25.8 ideas) · the later sheets (seven places, five built species) · weather as "tonight's water" on the Chart · the ink-print beat in the catch show.

**If the swarm comes back.** It returns as a choice on the Chart ("a quiet evening" or "a Gloomtide evening") by clearing `PARKED.swarm`, `.combat`, `.levels` and `.embers`. Nothing in this spec has to move.

**What each slice brings** (roster fish that can bite at the end of it; giants include legends):

| slice | waters | roster fish | giants | new plans |
|---|---|---|---|---|
| 1 | the Mossmere's and Sporewood's open water | 11 | 0 | — |
| 2 | + the Mossmere's places | 16 | 3 | lamprey, sturgeon, trout |
| 3 | Sporewood's open water complete | 20 | 3 | catfish, bream, disc, tuna |
| 4 | — | 20 | 3 | snakehead, gar |
| 5 | reach I complete | 41 | 12 | — |
| 6 | reach II | 74 | 22 | dogtooth (+ softshell, salamander) |
| 7 | reach III | 122 | 36 | shark, sawfish |
| 8 | reach IV | 165 entries, all 164 fish | 49 | jack, billfish, cod, flatfish (+ squid) |

---

## 14. Risks, and the knobs

| # | risk | guard, and the knob |
|---|---|---|
| 1 | **Quiet water feels like being told to stop.** | It never stops the fishing; the dots make it readable; the first line comes from Murk as advice. Knobs: `LOOP.water.good` (per kind) and `stale.favour`. The sim's anti-grind checks say how far each can move. |
| 2 | **Twelve new arenas are the largest art cost in the plan** (slices 6–8). | Each is a built layout, kit pieces and new landmark kinds; places ship as data with mist first. If a reach slips, the shelf ends at the last shipped water and the giants' page shows the rest as outlines. (Question 1, §16.) |
| 3 | **A new water pays less than the old one until its places are bought** (up to 4.5 h). | The place maps are on the shelf from the first day; the day and old water cost 1.2 times the lake map together. Knob: `PLACE_SHARE.day` / `.old`. |
| 4 | **A dusk giant at old water bites rarely** (the Thousandcast Pike 1 in 48 trips on arrival tackle). | The hour glyph on its card; its giants' lure (1 in 17); the Marked Fish after a loss. Knob: `LOOP.giant.share`. |
| 5 | **Fourteen new body plans** (and four for curiosities) before the roster is whole. | Rule 2 of §13: a fish bites only once its plan exists, so no slice waits for all of them. Order by fish served: catfish, bream, disc, snakehead, shark. |
| 6 | **Late numbers are large** (a Trophy giant at the Rime Sound sells for about 65,000). | "12.4k" on screen; the tally counts up. Knob: the value tiers are a single table. |
| 7 | **Elders and giants are too hard without the parked relic and Boon Hold.** | The sim lands the first giant at about hour 1.8 and about 90 by the end. Knob: `LOOP.craft` (0–3 extra Hold on every fish), off at first; `LOOP.giant.fight` (10). |
| 8 | **The numbers rest on a model** (±10%, §4.9). | Slice 1 moves the tables into data and the sim reads them; slices 5–8 re-prove the pacing on the real game, reach by reach. |

---

## 15. Where the proposals disagreed

v4's rulings on the three proposals stand, and the roster brought new ones.

| question | economy | maps | trip and home (its sims) | decided | why |
|---|---|---|---|---|---|
| fish values | steep: e^(0.9·z), no normaliser | today's flat values | a placeholder ladder | **steep, and now tier × rarity × body** | "big and rare fish"; the roster's rarities and sizes |
| what quiets water | every bite; 4 good bites everywhere | each landed fish; about 3 per place | — | **every bite; 4 open, 2 day, 4 old, 3 night, 2 crown** | counting catches leaves free re-rolls; with 4 everywhere choosy play beats natural play per trip |
| the clock | a trip is day or night at random | "wait for dusk" at the table | a trip starts before dusk | **every trip is an evening; night holds** | no skip button, the best light every trip |
| the catalogue | 3 charts + 26 place maps | 3 lake maps + 16 place maps | — | **15 lake maps + 70 place maps** (v4: 3 + 16) | the roster's 16 waters; one pattern of four places, a fifth where a giant needs one |
| price scale | Sporewood 1,000 · Glasswater 7,000 · Pallid 28,000 | 400 · 1,200 · 2,800 | — | **800 · 5,000 · 12,000, then 12,000 … 103,000** | re-fitted to this sim; no wait above 90 min |
| a lake needs a place of the lake before | — | yes, one | — | **no** | clams are the only key |
| the hold | 3 → 10 | 3 → 7 | 3, 4, 5, 8 tried | **3 → 8** | trips stay under 5 minutes |
| raft parts | Oars, Quiet Hull, Lantern, Moss Lining (+5% sale) | hold, bait box, oars, lamp | — | **hold, Oars, Quiet Hull, Lantern** | no percentage on the sale anywhere |
| home | Order Board, Bait Bed, Long Wall, cosmetics | sheets pinned, Waystones lit | — | **both** | the user listed the home |
| a place you do not own | a named blank on Murk's table | standing mist | — | **mist in the world, with its giant's back; an unnamed blot on the Chart** | the water sells the map |
| legends | — | one per lake, behind the crown map; pays the map back | — | **kept, for all 16 waters** | a crown, never a key |
| **the roster: where giants live** | — | — | — | **one place each; the six later-sheet giants get fifth places** | "every roster fish lives on at least one map" |
| **the roster: built prices** | — | — | — | the roster said keep them; **this spec re-prices three lakes** | the roster deferred prices to the spec; the Mossmere's are kept |
| **the roster: new waters as lake maps or spot maps** | — | — | — | **lake maps; their places are the spot maps** | each water has its own look, legend and places in the roster |
| Murk on the water · records at the measure · kept stays kept · small fish as bait | agreed by all | | | **taken** | |

---

## 16. Questions only the user can answer (each with the default this spec builds)

v4's five questions were answered on 13 November 2026 ("Yes to all five loop rules") and are decisions now. The roster raises these:

1. **Should each of the twelve new waters be a full 3D lake of its own** (its own arena, palette and landmarks: the largest art job in the plan), or should some become places inside the four built lakes? **Default: all twelve are full waters, built on the four arena layouts that exist, in three reaches of four (slices 6–8).**
2. **Is about 49 hours to buy everything the right length** (the four built lakes by hour 14.6, then a new water every 2.5–3 hours)? **Default: yes.**
3. **May late fish sell for tens of thousands of clams** (a Trophy giant of the Rime Sound for about 65,000, shown as "64.7k")? The other way is to keep every price under 10,000 by flattening the late waters, which makes the late shelf feel the same as the early one. **Default: yes, with "k" on screen.**

---

## Appendix A. Every fish: where it bites and what it sells for

Clams at each class's typical size (`BALANCE_V3.size.simZ`). ★ a rare giant. "(built)": a built species the roster keeps beside its fish. "night water" and the like: any place of that kind in its water. A giant has no Small; an Elder price shows only where the fish can reach Elder (old water, open water through old water, or a giant at its own place). A legend shows what her first landing pays. Printed by `node tools/sim/clams.mjs --fish`.

**1. The Mossmere** (value tier 7)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Belled Matriarch | legendary | day, dusk | The Bell Pool | — | — | — | — | pays 500 |
| ★ Hullkiss Lamprey | epic | night | The Buoy Lights | — | 150 | 370 | 950 | 2,388 |
| ★ Thousandcast Pike | epic | dusk | Under the Span | — | 150 | 368 | 944 | 2,374 |
| Bridgechain Sturgeon (built) | rare | any | Under the Span | 23 | 69 | 169 | 435 | 1,093 |
| Gloam Eel | rare | night | night water | 21 | 61 | 149 | 383 | — |
| Reedjaw Pike | rare | any | open water | 22 | 64 | 158 | 406 | 1,022 |
| Candlefin Koi (built) | uncommon | day, dusk | open water | 8 | 24 | 60 | 154 | 387 |
| Kissmark Trout | uncommon | any | open water | 10 | 29 | 72 | 184 | 462 |
| Milkeye Perch | uncommon | dusk, night | open water | 9 | 26 | 64 | 164 | 413 |
| Weeping Carp | uncommon | any | open water | 9 | 26 | 64 | 164 | 413 |
| Dusk Minnow | common | any | open water | 2 | 7 | 17 | 43 | 109 |
| Gutter Crayfish (built) | common | any | open water | 2 | 7 | 16 | 41 | 104 |
| Lampsipper (built) | common | night | open water | 3 | 8 | 19 | 48 | 121 |
| Likely Chub | common | day, dusk | open water | 3 | 9 | 23 | 58 | 146 |
| Mossback Perch | common | any | open water | 3 | 8 | 20 | 50 | 126 |
| Overbold Bass | common | day, dusk | open water | 3 | 9 | 21 | 54 | 135 |
| Rustfin Sucker | common | any | open water | 3 | 9 | 23 | 58 | 146 |


**2. Sporewood Pools** (value tier 14)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Drifting Grove | legendary | day, dusk | The Mother's Cup | — | — | — | — | pays 2,200 |
| ★ Emberbrood Snakehead | epic | day, dusk | The Puffball Vent | — | 297 | 730 | 1,874 | 4,711 |
| ★ Festival Puffer | epic | night | The Veilwater | — | 242 | 596 | 1,529 | 3,845 |
| ★ Harpstring Eel | epic | any, best at night | The Gill Harp | — | 320 | 788 | 2,024 | 5,089 |
| Downcast Catfish | rare | day, dusk | open water | 49 | 145 | 356 | 915 | 2,300 |
| Hushcap Koi (built) | rare | night | The Veilwater | 40 | 116 | 286 | 735 | — |
| Lostsea Mackerel | rare | day, dusk | open water | 49 | 145 | 356 | 915 | 2,300 |
| Mildew Angler (built) | rare | night | open water | 43 | 127 | 313 | 805 | 2,024 |
| Nightbloom Carp | rare | night | night water | 48 | 141 | 347 | 890 | — |
| Sleepspore Jelly (built) | rare | day, dusk | open water | 32 | 95 | 232 | 597 | 1,501 |
| Cindertail Catfish | uncommon | any | open water | 18 | 54 | 133 | 342 | 861 |
| Threadling Eel | uncommon | any | open water | 20 | 58 | 143 | 368 | 924 |
| Velvet Ray | uncommon | any | open water | 17 | 50 | 123 | 315 | 791 |
| Capshell Crayfish (built) | common | any | open water | 5 | 15 | 36 | 93 | 233 |
| Falsesmile Barb | common | day, dusk | open water | 5 | 14 | 34 | 87 | 219 |
| Netcloud Fry | common | any | open water | 4 | 12 | 30 | 76 | 191 |
| Plumgill Perch (built) | common | any | open water | 6 | 19 | 47 | 119 | 300 |
| Sporebelly Puffer (built) | common | any | open water | 5 | 15 | 37 | 94 | 238 |


**3. Glasswater Vault** (value tier 17)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Glass Sovereign | legendary | night | The Fallen Chandelier | — | — | — | — | pays 7,500 |
| ★ Prismdrop Sturgeon | epic | any | The Well of Ledgers | — | 441 | 1,085 | 2,786 | 7,004 |
| ★ Shardspine Eel | epic | dusk, night | The Mirror Nave | — | 380 | 934 | 2,399 | 6,030 |
| ★ Wolfwake Trout | epic | dusk, night | The Broken Hymnal | — | 389 | 957 | 2,458 | 6,179 |
| Pilgrim Salmon | rare | dusk | open water | 53 | 156 | 384 | 987 | 2,482 |
| Rainglass Darter | rare | day, dusk | day water | 38 | 111 | 274 | 703 | — |
| The Blind Scrivener (built) | rare | any | open water | 54 | 160 | 393 | 1,010 | 2,538 |
| The Footnote (built) | rare | any | The Well of Ledgers | 48 | 143 | 351 | 901 | 2,265 |
| The Unreflected (built) | rare | any | The Mirror Nave | 53 | 155 | 381 | 977 | 2,457 |
| Vesper Gar | rare | night | night water | 59 | 173 | 424 | 1,090 | — |
| Chime Jelly (built) | uncommon | day, dusk | open water | 18 | 52 | 129 | 330 | 831 |
| Mirror Pike (built) | uncommon | any | open water | 26 | 75 | 186 | 477 | 1,199 |
| Redhome Salmon | uncommon | day, dusk | open water | 18 | 53 | 130 | 334 | 840 |
| Rosefleck Trout | uncommon | day, dusk | open water | 20 | 58 | 142 | 364 | 916 |
| Tremor Catfish | uncommon | night | open water | 22 | 66 | 162 | 416 | 1,045 |
| Duskbar Salmon | common | day, dusk | open water | 9 | 26 | 64 | 164 | 413 |
| Glassblown Puffer (built) | common | any | open water | 6 | 19 | 46 | 119 | 300 |
| Glassgill Perch (built) | common | any | open water | 8 | 24 | 59 | 150 | 378 |
| Prism Minnow | common | any | open water | 5 | 15 | 36 | 92 | 232 |


**4. The Pallid Deep** (value tier 41)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Lantern-Swallower | legendary | night | The Bottomless | — | — | — | — | pays 19,000 |
| Candlewake Sturgeon (built) | rare | night | The Chain Garden | 176 | 517 | 1,272 | 3,266 | 8,212 |
| Funeral Veil (built) | rare | night | open water | 106 | 312 | 768 | 1,972 | 4,958 |
| Lampwarden Angler (built) | rare | night | open water | 139 | 409 | 1,006 | 2,582 | 6,492 |
| The Clapper (built) | rare | night | The Sunken Belfry | 133 | 391 | 963 | 2,472 | — |
| The Wax-Bearer (built) | rare | any | The Bier Barge | 176 | 517 | 1,272 | 3,266 | — |
| Gilt-Eyed Eel | uncommon | any | old water | 77 | 226 | 555 | 1,425 | 3,583 |
| Shroud Ray (built) | uncommon | any | open water | 65 | 190 | 468 | 1,203 | 3,023 |
| Bonecrook Crayfish (built) | common | any | open water | 15 | 46 | 112 | 288 | 723 |
| Ossuary Fry (built) | common | any | open water | 14 | 42 | 103 | 265 | 667 |
| Pallid Wraithfin | common | any | open water | 20 | 59 | 146 | 374 | 940 |
| Slipknot Eel | common | any | open water | 16 | 48 | 117 | 302 | 758 |


**5. Rushlight Fen** (value tier 72)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Long Thunder | legendary | night | The Dam Foot | — | — | — | — | pays 15,600 |
| ★ Packtooth | epic | day, dusk | The Run | — | 1,393 | 3,425 | 8,796 | 22,112 |
| Foamnest Pike | uncommon | day | day water | 59 | 173 | 425 | 1,091 | — |
| Reedwalker Catfish | uncommon | dusk, night | night water | 98 | 289 | 711 | 1,826 | — |
| Basket Fry | common | day | open water | 21 | 62 | 152 | 391 | 983 |
| Blushing Bream | common | day, dusk | open water | 24 | 71 | 174 | 447 | 1,125 |
| Hingecreak | common | any | open water | 23 | 67 | 164 | 421 | 1,059 |


**6. The Thin Water** (value tier 67)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Buried Moon | legendary | day, dusk | The Moonbed | — | — | — | — | pays 18,900 |
| ★ Weirflame | epic | day, dusk | The Broken Weir | — | 1,359 | 3,343 | 8,585 | 21,583 |
| Blotback Catfish | rare | night | night water | 206 | 605 | 1,489 | 3,823 | — |
| Frostfleck Nipper | uncommon | any | open water | 48 | 140 | 344 | 884 | 2,223 |
| Grumbleplate | uncommon | any | open water | 65 | 190 | 468 | 1,202 | 3,023 |
| Slipwhisker | uncommon | dusk, night | open water | 78 | 231 | 568 | 1,457 | 3,664 |
| Thorntail Ray | uncommon | dusk, night | open water | 65 | 193 | 474 | 1,218 | 3,062 |
| Coinback Ray | common | any | open water | 32 | 93 | 229 | 589 | 1,480 |
| Flatbill Catfish | common | dusk, night | open water | 24 | 69 | 171 | 438 | 1,102 |
| Inkthumb | common | day | day water | 28 | 82 | 202 | 519 | — |


**7. Lampmoss Slough** (value tier 54)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Last Sentry | legendary | day, dusk | The Sentry's Reach | — | — | — | — | pays 22,100 |
| ★ Old Portcullis | epic | night | The Lock Gate | — | 1,062 | 2,611 | 6,706 | 16,859 |
| ★ Weirshadow Catfish | epic | any | Under the Weir | — | 1,095 | 2,694 | 6,919 | 17,395 |
| Lampspot Snakehead | rare | day, dusk | open water | 169 | 496 | 1,221 | 3,136 | 7,883 |
| Spotmail Gar | uncommon | day | day water | 71 | 211 | 518 | 1,330 | — |
| Tailwatch Mudfish | uncommon | any | open water | 65 | 191 | 471 | 1,209 | 3,040 |
| Hearsay Sunfish | common | day | open water | 17 | 51 | 125 | 320 | 805 |
| Scrapwhisker Catfish | common | any | open water | 29 | 87 | 213 | 548 | 1,377 |
| Startle Carp | common | day, dusk | open water | 32 | 94 | 230 | 592 | 1,487 |


**8. Pyrefall Gorge** (value tier 124)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Ashen Guest | legendary | night | The Last Pyre | — | — | — | — | pays 27,300 |
| ★ Pyregold Carp | epic | day, dusk | The Coin Run | — | 2,553 | 6,280 | 16,128 | 40,546 |
| ★ The Unfinished | epic | night | The Boulder Garden | — | 2,591 | 6,372 | 16,364 | 41,139 |
| Lampspot Snakehead | rare | day, dusk | open water | 387 | 1,140 | 2,804 | 7,201 | 18,102 |
| Almsfed Carp | uncommon | day, dusk | day water | 157 | 461 | 1,134 | 2,913 | — |
| Pipsqueak Catfish | common | any | open water | 36 | 107 | 262 | 674 | 1,693 |
| Puddle Snakehead | common | any | open water | 36 | 107 | 262 | 674 | 1,693 |


**9. The Thunder Stair** (value tier 74)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Last Lock | legendary | day, dusk | The Throat | — | — | — | — | pays 32,500 |
| ★ Lampeye Perch | epic | dusk, night | The Cauldron | — | 1,590 | 3,910 | 10,041 | 25,243 |
| ★ Soapthief | epic | night | The Soap Landing | — | 1,478 | 3,636 | 9,337 | 23,473 |
| Cocoon Sleeper | uncommon | any | open water | 111 | 328 | 806 | 2,069 | 5,201 |
| Swallowtail Catfish | uncommon | dusk, night | open water | 89 | 263 | 648 | 1,664 | 4,183 |
| Cradlemouth Bream | common | day | day water | 29 | 84 | 207 | 531 | — |
| Sidepool Snakehead | common | any | day water | 26 | 77 | 189 | 484 | — |
| Stairhopper | common | day | open water | 22 | 64 | 157 | 402 | 1,011 |


**10. The Inkwood** (value tier 159)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Banked Fire | legendary | day, dusk | The Breathing Mere | — | — | — | — | pays 45,500 |
| ★ Emberbelly | epic | day, dusk | The Kitchen Stair | — | 3,274 | 8,053 | 20,681 | 51,990 |
| ★ Nightcreek Hound | epic | night | Rootgate Creek | — | 2,862 | 7,041 | 18,080 | 45,454 |
| ★ Smilejaw Bream | epic | day, dusk | The Overhang | — | 2,692 | 6,621 | 17,003 | 42,745 |
| Gourdcracker | rare | day, dusk | day water | 421 | 1,239 | 3,049 | 7,829 | — |
| Inkside Nipper | uncommon | any | open water | 132 | 389 | 958 | 2,459 | 6,182 |
| Starback Ray | uncommon | any, best at night | open water | 183 | 540 | 1,327 | 3,408 | 8,569 |
| Windowtail Perch | uncommon | day | open water | 158 | 464 | 1,142 | 2,931 | 7,370 |
| Ditch Hound | common | any | open water | 59 | 173 | 425 | 1,092 | 2,745 |
| Gourdseed Minnow | common | any | open water | 46 | 137 | 336 | 864 | 2,171 |
| Petal Bream | common | day | open water | 51 | 151 | 372 | 955 | 2,400 |


**11. The Siltway** (value tier 155)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Barge-Shadow | legendary | night | The Long Hole | — | — | — | — | pays 54,600 |
| ★ Dapplewheel Ray | epic | night | The Lamp Bar | — | 3,462 | 8,516 | 21,870 | 54,979 |
| ★ Sternlamp Catfish | epic | any, best at night | The Sunk Ferry | — | 3,284 | 8,078 | 20,746 | 52,154 |
| Millstone Catfish | rare | dusk, night | open water | 484 | 1,425 | 3,505 | 9,001 | 22,627 |
| Snufferjaw | rare | day, dusk | day water | 433 | 1,274 | 3,133 | 8,046 | — |
| Tallyside Catfish | rare | night | night water | 450 | 1,326 | 3,262 | 8,376 | — |
| Boathook Catfish | uncommon | any | open water | 179 | 526 | 1,294 | 3,323 | 8,353 |
| Hullknock Perch | uncommon | dusk, night | open water | 160 | 471 | 1,158 | 2,974 | 7,478 |
| Waxcomb Ray | uncommon | any | open water | 165 | 485 | 1,192 | 3,062 | 7,698 |
| Bareface Catfish | common | day, dusk | day water | 60 | 176 | 433 | 1,113 | — |
| Lacework Catfish | common | night | open water | 50 | 147 | 362 | 931 | 2,340 |
| Silkwhisker | common | night | open water | 73 | 216 | 530 | 1,362 | 3,424 |
| Tallow Borer | common | any | open water | 45 | 133 | 328 | 842 | 2,117 |
| Vigil Catfish | common | any | open water | 55 | 161 | 395 | 1,014 | 2,549 |


**12. The Salt Gate** (value tier 109)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Old Shipwright | legendary | dusk, night | The Slipway | — | — | — | — | pays 65,000 |
| ★ Inkmarble Eel | epic | night | The Harbour Stump | — | 2,435 | 5,989 | 15,379 | 38,663 |
| ★ Sweetwater Shark | epic | dusk, night | The Sluice Throat | — | 3,000 | 7,378 | 18,947 | 47,632 |
| ★ Tideghost Shark | epic | night | The Turning Tide | — | 2,981 | 7,333 | 18,832 | 47,342 |
| Dusk Drummer | rare | night | night water | 373 | 1,097 | 2,699 | 6,932 | — |
| Longlash Ray | rare | any | open water | 465 | 1,369 | 3,367 | 8,646 | 21,736 |
| Old Breather | rare | dusk, night | open water | 340 | 1,002 | 2,465 | 6,330 | 15,912 |
| Creekling Shark | uncommon | any | open water | 154 | 453 | 1,114 | 2,862 | 7,194 |
| Embereye Bass | uncommon | dusk, night | open water | 169 | 496 | 1,221 | 3,136 | 7,884 |
| Kitewing Ray | uncommon | day, dusk | open water | 159 | 468 | 1,151 | 2,956 | 7,431 |
| Tidetable Ray | uncommon | any, best at night | open water | 105 | 310 | 762 | 1,956 | 4,918 |
| Brinewhisker | common | any | open water | 40 | 119 | 292 | 749 | 1,882 |
| Saltroot Bream | common | any | open water | 34 | 101 | 248 | 638 | 1,604 |
| Sandblower | common | day, dusk | day water | 50 | 147 | 362 | 930 | — |


**13. Lanternroot Lagoon** (value tier 157)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Silver Regent | legendary | day, dusk | The Sighing Pool | — | — | — | — | pays 78,000 |
| ★ Rootjaw Catfish | epic | night | The Monsoon Cut | — | 3,507 | 8,626 | 22,152 | 55,689 |
| ★ Snagheart Bass | epic | dusk, night | The Sunken Orchard | — | 3,136 | 7,714 | 19,810 | 49,801 |
| ★ Votive Shark | epic | night | The Stilt Shrine | — | 3,678 | 9,048 | 23,234 | 58,410 |
| Harbourdrum Grouper | rare | night | old water | 490 | 1,443 | 3,550 | 9,117 | 22,919 |
| Stiltshadow Shark | rare | dusk, night | night water | 566 | 1,666 | 4,097 | 10,521 | — |
| Sandghost | uncommon | day, dusk | day water | 185 | 544 | 1,337 | 3,434 | — |
| Wide-Eyed Stray | uncommon | any | open water | 181 | 533 | 1,311 | 3,366 | 8,461 |
| Flicker Trevally | common | day, dusk | open water | 61 | 178 | 439 | 1,127 | 2,834 |
| Frownlip Mullet | common | day, dusk | open water | 61 | 178 | 439 | 1,127 | 2,834 |
| Rootshade Snapper | common | any | open water | 74 | 217 | 534 | 1,372 | 3,448 |


**14. The Waxen Reef** (value tier 298)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Waxen Abbot | legendary | night | The Abbot's Cellar | — | — | — | — | pays 92,300 |
| ★ Anvil Trevally | epic | day, dusk | The Broken Keel | — | 6,136 | 15,093 | 38,760 | 97,441 |
| ★ Mothlance Gar | epic | night | Lamp Row | — | 6,226 | 15,314 | 39,327 | 98,866 |
| ★ Spirewatch Pike | epic | day, dusk | The Drowned Spire | — | 6,226 | 15,314 | 39,327 | 98,866 |
| Cabin Grouper | rare | any | old water | 930 | 2,740 | 6,738 | 17,305 | 43,503 |
| Nebula Trout | uncommon | day, dusk | day water | 376 | 1,108 | 2,726 | 7,000 | — |
| Picket Pike | uncommon | day, dusk | open water | 421 | 1,239 | 3,047 | 7,824 | 19,669 |
| Amberside Snapper | common | any | open water | 146 | 430 | 1,059 | 2,719 | 6,835 |
| Pebble Grouper | common | any | open water | 116 | 341 | 839 | 2,155 | 5,417 |
| Waxdrop Damsel | common | day, dusk | open water | 88 | 259 | 636 | 1,634 | 4,107 |


**15. The Last Light** (value tier 180)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Jetsam Shark | legendary | night | The Unlit Mile | — | — | — | — | pays 111,800 |
| ★ Castaway Pike | epic | dusk, night | The Beam | — | 4,217 | 10,373 | 26,638 | 66,967 |
| ★ Nightsail Lancer | epic | day, dusk | The Drift Line | — | 4,954 | 12,184 | 31,289 | 78,658 |
| Ambersickle Tuna | rare | dusk, night | open water | 709 | 2,088 | 5,135 | 13,186 | 33,150 |
| Starbar Lancer | rare | day, dusk | old water | 771 | 2,270 | 5,584 | 14,341 | 36,052 |
| Fadegold | uncommon | day, dusk | open water | 301 | 885 | 2,178 | 5,592 | 14,059 |
| Soot Jack | uncommon | day, dusk | day water | 207 | 611 | 1,503 | 3,859 | — |
| Grey Latchfin | common | day, dusk | day water | 72 | 213 | 523 | 1,344 | — |
| Pinstripe Tuna | common | day, dusk | open water | 94 | 277 | 681 | 1,748 | 4,395 |
| Scribbleback Mackerel | common | day, dusk | open water | 69 | 205 | 503 | 1,292 | 3,249 |


**16. The Rime Sound** (value tier 397)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Long Winter | legendary | any | The Half-Mile Line | — | — | — | — | pays 133,900 |
| ★ Icedoor Flounder | epic | day, dusk | The Fjord Floor | — | 10,245 | 25,199 | 64,712 | 162,683 |
| Bellrope Cod | rare | any | old water | 1,430 | 4,212 | 10,359 | 26,604 | 66,880 |
| Coalwing Skate | rare | any | old water | 1,466 | 4,316 | 10,617 | 27,264 | 68,542 |
| Bouldermouth | uncommon | day, dusk | open water | 564 | 1,661 | 4,086 | 10,494 | 26,382 |
| Hemstitch Cod | uncommon | any | open water | 501 | 1,477 | 3,632 | 9,326 | 23,446 |
| Rosedeep Rockfish | uncommon | any | night water | 458 | 1,347 | 3,314 | 8,510 | — |
| Ashline Cod | common | any | open water | 225 | 664 | 1,632 | 4,192 | 10,537 |
| Emberspot Flounder | common | any | day water | 198 | 582 | 1,432 | 3,677 | — |
| Greybeard Cod | common | any | open water | 280 | 823 | 2,025 | 5,200 | 13,073 |
| Thumbprint Cod | common | day, dusk | open water | 209 | 616 | 1,515 | 3,890 | 9,778 |
| Wickstripe Rockfish | common | any | open water | 133 | 391 | 961 | 2,467 | 6,202 |

Waiting for a later sheet (built, not roster fish): Cupbearer (cupped_hands), The Remembered Sun (drowned_greenhouse), The Sexton (bell_window), The Unpaid Fare (ferry_slip), The Namesake (long_pier).

Curiosities (roster §6) are outside these tables: each sells at its water's rare Keeper price.

## Appendix B. Re-running the proof

```
cd gloomwater
node tools/sim/clams.mjs              # everything, about 20 s; exits 1 if a target, a ladder rule or the anti-grind check fails
node tools/sim/clams.mjs --quick      # about 8 s
node tools/sim/clams.mjs --md         # the tables as markdown
node tools/sim/clams.mjs --fish       # Appendix A
node tools/sim/clams.mjs --json       # the LOOP draft tables
node tools/sim/clams.mjs --calibrate  # the value tiers that make each water pay 1.2× the one before, on the same tackle
```

It reads the fish from `docs/loop/roster.json` and the built species the roster keeps, and from `src/data.js` the size model, the land chance (`catchParts`), the lures and baits and the time model of a cast. It keeps its own draft `LOOP` table for everything this spec adds. It runs 74 checks: every roster fish has a map; one legend per water; one giant per place; the giants top every water's ladder; the anti-grind checks at six stages; the bait checks; every giant is the hardest fish of its water; every legend stays at or under a coin flip; the pacing targets of §4.9; every water pays more than the one before and is the best water for a while. Change a price in `LOOP`, run it, and it says which target moved.
