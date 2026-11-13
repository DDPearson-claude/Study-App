# The Full Hold: catch, keep, sell, upgrade (binding spec, v6)

*Gloomwater's game loop after the user's redirect of 2026-11-13, rebuilt on the roster (`docs/loop/ROSTER.md`) and revised after two critics (§0.1). This file is binding. Where it conflicts with DESIGN §1–§25 or CONTRACT §13 it wins (§12 lists what it replaces). Its numbers are proven by `tools/sim/clams.mjs` (89 checks); when the numbers here and the sim disagree, re-run the sim and fix this file. Design only: no `src/` file changed with this document.*

**How to read it.** §0.1 says what v6 changed and why. §1–§3 are the game and its rules (§3.5 is the rare giants). §4 is every number. §5–§7 are maps, home and raft. §8 is every word on screen. §9–§12 say what happens to what exists. §13 is the build plan. §16 lists the questions only the user can answer. Appendix A lists every fish with its price.

**Vocabulary (always these words).** **clams** (the currency; "Shells" is retired) · **the hold** · **slot** · **Keep / Let go** · **good bites** and **quiet water** · **an evening** (one trip) · **Home** · **the tally** (Murk buying the hold) · **the Chart** (the Map Table's screen) · **map** (the one word on screen for a lake map and a place map; a lake map opens a water's open water, its day water and its old water; a place map opens one more place) · **a water** (one of the 16 lakes and seas) · **day water, old water, night water, crown** (the kinds of place; on screen four glyphs, never words) · **a rare giant** (★: the descendant of an episode's main fish; *epic*, or *legendary* for a water's crown) · **a legend** (a legendary giant) · **value tier** (a water's price level, hidden) · **a reach** (four waters in a row: I the old kingdom, II the fresh waters, III the great rivers, IV the sea) · **Murk's orders** · **ink print** · **the Jetty** (the first, small home).

---

## 0. The user's words, and the lead's rulings

| # | the user, verbatim | ruling |
|---|---|---|
| 1 | "Who are we and what is the gameplay loop? I basically want to try and catch big and rare fish, the fish we keep i want to sell for clams and we use the clams to upgrade our gear, raft, homebase, bait, lures, buy maps of new locations to fish, which is the only way of discovering a new place is to buy the map." | §1–§2 the loop. Big and rare fish are worth far more than small ones, and the rare giants most of all (§4.1). Clams buy six things: gear, raft, home, bait, lures, maps (§4). Nothing is found by exploring: a map is the only way a water or a place becomes known and reachable (§5). |
| 2 | "for now park the creature attacks." | The swarm and everything that only serves it or makes failure possible is switched off behind one table of flags and kept in the code (§9). |
| 3 | "I just want to catch fish so we're limited buy storage for caught fish in our boat starting at 3 catch slots." | The hold: 3 slots at the start, 8 at the most (§3.1, §4.2). No food, no oil to manage. |
| 4 | "there's no way to fail, but once your boat is full you can't catch anymore fish and you might not catch a big one at all as its chance" | No fail state anywhere (§3.6). A full hold refuses the cast (§3.1). A big fish is a chance each evening, never a promise: 52% of first trips bring home no Prize or bigger, and a giant comes home on 4–11% of trips at its place on arrival tackle (§4.9, §3.5). |
| 5 | "Use all of these fish as inspiration for our game's fish" (on the researched list of every fish landed on a television fishing series; `docs/loop/research/`) | Every fish on the list is the ancestor of one original fish of ours (`docs/loop/ROSTER.md`, `roster.json`, checked by `tools/sim/roster-check.mjs`). **All 164 live on at least one map** (§5.2; the sim checks it). The series and its presenter are never named in the game, and the roster's design notes never ship (§13, slice 1b). |
| 6 | "The main episode based fish he catches should be the rare giants" | The 49 rare giants (33 epic, 16 legendary) are the scarcest, largest, dearest and hardest fish of their waters. **49 of the 55 maps promise a giant**, and every map but the first names a fish you cannot meet elsewhere (§3.5, §5.1 rule 9). |
| 7 | "Yes to all five loop rules" (13 November 2026, answering v4's five questions) | Decisions now: a kept fish is final; the water goes quiet; every trip is an evening; a map's card names one fish; raft only for now. |

**Decided by the lead (and why).** Rows 1–5 stand from v4 and the user confirmed them; rows 6–14 came with v5; v6 revised 2, 6, 10, 11, 12 and 14 and added 15–21 (§0.1).

| # | decision | why |
|---|---|---|
| 1 | **Kept stays kept.** A fish in the hold stays there until Murk buys it. | "Once your boat is full you can't catch anymore fish": a full boat is final. A swap is a bigger hold by another name. (User: yes.) |
| 2 | **The water goes quiet, and let go forgives.** Every water has a few good bites an evening; every bite you strike or let pass spends one (§3.3). A fish let go at the card gives its bite back, and the next bites at that water run bigger (§3.2). | Without quiet water, "let everything go until the giants bite" brings 2.1–3.9 times the clams per trip. With it, no patient strategy reaches the natural rule per minute (the best is 89%). With the forgiving let go, letting a fish go is a real choice: choosy play earns 88–95% of the natural rule per minute (it was 67–79%). (User: yes to quiet water.) |
| 3 | **Every trip is an evening.** Dusk falls after 40 s on the water; night lasts until you turn for home (§3.4). | Night stays the big-fish hour without a clock or a skip button. (User: yes.) |
| 4 | **Clams are the only key.** No proof catches, no tolls, no legend gates. | One currency, one way to discover places. |
| 5 | **One lure and one bait at once.** | Both are on the user's list; with one slot for both a tin never beats a lure. |
| 6 | **Sixteen waters, 55 maps.** 15 lake maps and 40 place maps. A lake map opens a water's open water, its day water and its old water. Place maps open its night water, its crown and, in six waters, a fifth place. The Mossmere is yours from the start, with four place maps. | In v5 a lake map was a step down: 14 of 15 lowered your income on the day you bought them, because a water's places carry most of its worth. Opening the day and old water with the lake makes the new water better than the old one from its first evening, without inflating every price (§4.9). |
| 7 | **A giant lives at one place and is a fixed share of the bites there:** 6% in its hour, 2.5% outside it; its own giants' lure makes that ×1.5 (§3.5). | A share does not swing with what else bites. It keeps "the promise of a giant" honest: it comes, rarely. |
| 8 | **A giant is never Small, runs big (+0.3 favour), may be an Elder at its own place, and fights +10 harder than a rare** (+12 as an Elder). | The giants are "the top of the value ladder and the hardest fish to land". The sim checks both for every water (§4.9). |
| 9 | **Value is value tier × rarity × body × size.** Rarity ×1 / 2.4 / 5.5 / 12 (common to epic); body is the square root of the fish's typical length against 45 cm, clamped 0.6–1.6. | Big and rare fish, in the roster's own rarities and sizes. A giant sells for 1.7 times or more than the dearest other fish of its water at the same size class. |
| 10 | **Each water's value tier is set by two rules.** On the day you buy its map, its open, day and old water pay at least 1.05 times the water before it, fully mapped. Fully mapped, it pays at least 1.2 times the water before it. | The next map is always worth having, from its first evening (sim section 6). The tier is hidden; it ranges from 7 (the Mossmere) to 1,247 (the Rime Sound). |
| 11 | **Tackle T5 and T6.** T5 is on the shelf with the Pallid Deep map, T6 with the Inkwood map. | Sixteen waters need the gear to keep growing. Each lake map is judged on the tackle you own when you can buy it. |
| 12 | **Every tin gives the same favour and costs the same in a water** (1.5 × its value tier). Tins differ only in which fish they help hold, and in the few fish that bite on one bait only. **Bait does not change which fish bite.** | In v5 one tin beat every other everywhere. Now picking a tin means picking a fish, and no tin beats the water's plain bait (sim section 4). |
| 13 | **An hour opens a window that runs into the next phase:** "day" bites by day and dusk, "dusk" at dusk and night, "night" at night. | The roster's hours, made playable in a 60-second evening. |
| 14 | **The long game is about 48 hours** to buy everything: the four built lakes by hour 16, then a new water every 2–3 hours. | Long enough for 55 maps and 49 giants; each era is a few sessions. (Question 2, §16.) |
| 15 | **Every place map earns its price.** Bought in price order, each raises clams a minute by at least 5% (8–32%), and no set of a water's places pays more than the next water fully mapped. | In v5 some maps made you poorer (the Last Light's Drift Line −13%, the Beam −29%), so stopping short was the best play. |
| 16 | **A place's own fish are worth the sail.** At any place commons bite half as often; a day water draws its water's uncommon and rare fish 1.5 times as often. Eleven roster fish bite at a kind of place in play (§5.2), so no map card names a common. | v5's weak maps put a common on the card (the Marsh Lanes, the Bar, the Net Racks, the Step Pools). |
| 17 | **The hold past 4 is a bigger evening, not a faster one, and it is priced like one.** Hold 5–8 add 8–20% a trip at about the same clams a minute, for one or two trips' income each (§4.2). | Quiet water limits the good bites, so a bigger hold cannot honestly be a multiplier. Pretending would make the grind pay. |
| 18 | **The raft is Oars I–II, the Keel I–III and the Lantern I–II.** Quiet Hull is cut. The Keel makes every fish run bigger (§7). | Quiet Hull did nothing measurable (+0.3% at 1 h, −0.2% at 40 h). Each part now pays its way or costs at most two trips. |
| 19 | **Orders never expire.** An order stays until it is filled, or until you wipe it. | An order that vanished after 3 evenings was a countdown. |
| 20 | **Fewer words.** Home is a press-and-hold pill; "Gone quiet." is gone; orders and the Old Ledger are glyphs; a dear price is only dimmed; Cut bait is a long-press on Let go; a map's line is at most 8 words (§8). | "The UI is really cluttered, there's too much text on screen." |
| 21 | **The natural route waits for a dusk giant.** On an old water whose giant bites only from dusk, the Wick waits there for the light to turn. | Without it the old water was fished in daylight and its dusk giant came home on 1 trip in 143 (the Thousandcast Pike); with it, 1 in 21. |

**Sources.** v4 (commit 1aa478c) reconciled three proposals: economy, maps, and trip-and-home (§15). v5 (commit 3fc4a12) rebuilt the fish values, the catalogue and the build plan around the roster (commit d20aa74). v6 is v5 revised after the player's-advocate and builder critics (§0.1).

### 0.1 What v6 changed (the critics' findings)

Every finding was checked against the sim or the code. "Done" means the fix is in this file and, where it is a number, in the sim.

| finding | verdict | what changed |
|---|---|---|
| A lake map is a downgrade on the day you buy it (14 of 15) | **must, done another way** | The critic's fix (tune the tiers so a new water's open water alone pays 1.05× the old water fully mapped) was tried: the tiers grow about 1.8× per water and the Rime Sound's tier reaches 65,000, with fully mapped incomes of 700,000 clams a minute. Every price would be in the millions. A water's places carry 30–100% of its worth, so open water alone cannot beat a mapped water without that inflation. Instead **a lake map opens the open water, the day water and the old water** (decision 6), and the binding rule is the critic's: those three pay ≥ 1.05× the old water fully mapped on the day you buy the map (sim: 1.07–1.28). Full against full stays ≥ 1.2 (1.22–1.55). T5 moved onto the shelf with the Pallid Deep. A new water is the best water to fish from the day its map is bought (sim: 0 min for all 15; v5: up to 4.5 h). |
| Buying more place maps makes you poorer at the Last Light; 21 maps have no giant | **must, done** | Both checks added: every place map in price order adds ≥ 5% (worst now +8%); no set of a water's places beats the next water fully mapped (closest 0.83). The Last Light's night water has its own night fish (Ambersickle Tuna). The weak maps have fish of their own, never a common (decision 16, §5.2). §1 now says "every map but the first names a fish you cannot meet elsewhere, and 49 of the 55 promise a giant". |
| Let go is never the right choice | should, done | Let go gives back its good bite and adds +0.2 favour at that water, to +0.4 (§3.2). Choosy play: 88–95% of the natural rule per minute (check: 85–105%); the giant hunt stays at 9–50% (check: ≤ 75%). The critic's +0.15/+0.3 alone reached only 72–85%. |
| Hold past 5, Quiet Hull, early Lantern and Oars add nothing | should, done | Open water's good bites now grow with the hold (one per slot, plus one). Quiet Hull cut; the Keel added (+0.1 favour a level). Oars and Lantern cut to two levels each, stronger. The check: every hold step and raft part adds ≥ 3% a minute when bought, or is priced as a look (≤ 2 trips' income, ≤ 3% a minute lost). Hold 5–8 are honest "bigger evenings" (+8–20% a trip). Pillar 6 says 2–6 minutes, the visit home included (pacing trips: 3.5–5.5 min). The time at home is measured in slice 1a. |
| One bait beats every other | should, done | Every tin gives +0.3 favour and costs 1.5 × the water's tier (decision 12). The critic's check (no tin beats the plain bait by more than 3 points a minute) passes with 0.0 points. |
| Orders expire after 3 evenings | should, done | Orders stay until filled or wiped (§6.3). |
| Episode titles and real names could ship | should, done | Slice 1b imports an allow-list of roster fields; validate-data fails on `giantOf`, `inspiredBy` or any research name in `src/` (§13). |
| Words on screen | should, done | §8 rewritten (decision 20). |
| The first giant a map promises rarely comes home (the Thousandcast Pike, dusk) | could, done another way | The roster's hours are binding, so the fish is not retimed. The natural route waits at a dusk giant's old water for dusk (decision 21): 4.6% of trips on T1 (v5: 2.1%). |
| Bait figures drifted from the sim | could, done | §4.5 is re-pasted from sim section 4; the sim's comment is fixed. |
| measure() keeps the fish before the card | must, done | §3.2 "How the built code changes" and slice 1a. |
| Abandon and New Descent throw away a full hold | must, done | §3.6 and §8.5: Home replaces Abandon; the title offers only Continue while a trip is out. |
| createRun ignores maps and turns a trip into a Lantern night | must, done | Slice 1a names `createRun` and its rules. |
| The switch contradicts itself and does not pin the phase | must, done | §9: `LOOP_ENABLED = V3_ENABLED && GW_LOOP`, phase 1 pinned, stopgap giant spots and watch lamps off, a LOOP pass in validate-data. The sim now sets all three flags. |
| No roster-to-species converter | should, done | One shared converter, `src/roster-species.js`, with its rules (slice 1b). |
| Save fields duplicated or vague | should, done | `meta.loop.tackle` read by `getLoadout` with `perRun: false`; `holdSlots`; bait copied in and out of the run (§9). Tests for the legends' first-try odds. |
| The tally cannot reuse the market; no home flow | should, done | `progression-loop.endTrip()` pays once and saves before any animation; a `home` flow (§6.1, slice 1a). |
| Slice 1 is the riskiest slice | should, done | Split into 1a (three slots on the built fish, with a node trip harness first) and 1b (the roster's first fish). |
| The gate misses v3 regressions and loop saves opened with the flag off | should, done | v3 scenarios added to every slice's gate; a boot rule for a trip saved with the flag off (§9, §13). |
| The Arrival Hush and an endless night break the clock | could, done | §3.4: no hush; the night has no end and no HUD clock. |
| The Old Ledger double ships before slice 9 and shares a flag | could, done | Marked "from slice 9", with its own `meta.loop.ledgerPaid` (§4.1). |
| Two owners for the good-bite count | could, done | Progression owns it, as with pressure; fishing emits one event per bite (§3.3, slice 1a). |

---

## 1. Who we are

You are **the Wick**: a small living candle, one of the last of a drowned kingdom. Home is **the Landing**, a cove where the trader **Old Murk** keeps his barge. You fish from a raft. Murk buys what you bring home and sells you everything else.

**The game in one breath.** Pick a water you own a map for. Sail out for the evening. Catch fish; keep one or let it go. When the hold is full, go home. Murk pays clams. Clams buy a bigger hold, better tackle, lures, bait, a better raft, a better home, and the next map. Every map names a fish you cannot meet elsewhere, and 49 of the 55 promise a giant.

**Pillars (they replace §25.1's list; when two conflict, the higher wins).**

1. **Big and rare fish.** The rare giants are the dream. The size shows on the line; the species hides until the reveal.
2. **The hold decides.** Few slots, no promise. Every keep is final, and every let go is forgiven.
3. **A map opens every water.** The next map is always on Murk's shelf, with its fish drawn on it and a price, and it is never a step down.
4. **Art, atmosphere and fishing.** The Clear Night look, the lavender Starlit palette, and very few words on screen.
5. **No way to fail.** Nothing is lost except the fish that got away.
6. **One thumb, short sessions.** A trip is 2–6 minutes, the visit home included. Everything is a tap or a hold.

---

## 2. The loop at every scale

| scale | length | the loop |
|---|---|---|
| **a cast** | 10–40 s | read the water → cast → wait → the tell shows the size → **strike**, or let it pass → the play runs itself → the reveal → the Wick holds the fish up → the card: **Keep** (it shows the clams) or **Let go**. A lost fish leaves the got-away note. Every bite you strike or pass spends one good bite of that water; a fish let go gives it back. |
| **a trip** (an evening) | 2–5 min on the water | the Chart: tap a water you own → **Sail** → late day, dusk, night → fish your places first, open water to top up → the hold fills → **Home**. You may go home at any time. Nothing sends you home. |
| **a visit home** | 30–60 s | the tally: Murk buys the whole hold, fish by fish → the shelf: one thing is usually affordable → the Chart → Sail. |
| **a session** | 5–15 min | 2–4 trips and 1–4 purchases. A goal line shows the next one ("Next: Under the Span · 150"). |
| **an era** (one water) | 2–5 h | the lake map (its open, day and old water) → its giants' lure → the crown of the water before → its night water and fifth place → the next lake map. |
| **the long game** | ≈ 48 h to buy everything | 16 waters, 55 maps, tackle T6, hold 8, the raft and the home built up, 16 legends, about 70 giants and 64 Elders landed on the way. After that: the Journal's seals, the 49 giants' prints, records, legend rematches, the later sheets (§5.2). |

### 2.1 The first ten minutes (a fresh save, the game after slice 2)

| clock | where | beat |
|---|---|---|
| 0:00 | home | Murk: "Three slots in that hold. Fill them and come home." The Chart shows one sheet: the Mossmere. **Sail.** |
| 0:15 | the Mossmere, late day | First cast. A double pop: a Small. The player strikes anyway. A Dusk Minnow. The Wick holds it up. Card: **Keep · 2** / **Let go**. Let go: the bite comes back, and the next fish here will run a little bigger. |
| 0:40 | | A plunge: a Keeper. A Weeping Carp: **Keep · 26**. One slot full. |
| 1:00 | dusk | The light turns. A Keeper Rustfin Sucker: **Keep · 9**. Two slots full. The float shows one good bite left. |
| 1:25 | night | A slow drag-under: a Prize. It lands (a Prize Reedjaw Pike lands 3 times in 10 on starter tackle): **Keep · 158**. The next cast is refused: "Hold's full." The Home pill pulses. |
| 1:40 | home | The tally: 26 + 9 + 158 = **+193**. Shelf: **Hold 4 · 30**, **Braided Gut · 50**, a map with a koi drawn on it, **60**. All three are bought. |
| 2:30 | | Trip 2 with four slots and a new place: the mist lifts off the Lily Maze. |
| 10:00 | | After 3–4 trips: hold 4, Line T1, the Lily Maze; 71 clams a trip on average. The next card on the shelf is **Under the Span · 150**, with a pike drawn on it longer than the Wick is tall. |

(The first trip above is a lucky one. The average first trip sells for 44 clams, and 52% of first trips have no Prize or bigger. The first giant comes home at about hour 1.4.)

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

- The card opens after the Wick has held the fish up and paused. It has two buttons: **Keep** with the clam value, and **Let go**. From slice 3, holding **Let go** on a Small or a Keeper cuts it into 3 Cut Strips (§4.5) instead of letting it go; the button shows a knife while it is held. There is no third button.
- **Kept stays kept.** There is no way to take a fish out of the hold on the water.
- **Let go forgives.** A fish let go gives back the good bite it spent (§3.3), and every later bite at that water this evening runs bigger: favour +0.2 for each fish let go there, to at most +0.4. It pays no clams. Moving to another water starts again at 0.
- **Why.** In v5 letting go was never right: choosy play earned 67–79% of the natural rule per minute. Now it earns 88–95%, and 38–75% more clams a trip for 1.5–2 times the minutes, while the giant hunt stays at 9–50% (§3.3). Being choosy is a way to play, not a trap and not the best way.
- **The record is yours either way.** The Journal page, the personal best, the class seal and the ink print are written at the measure, before the card. Selling a fish or letting it go loses none of them. (The Old Ledger's double is paid only on a sale, from slice 9; §4.1.)
- **Let it pass** stays: no tap during the bite, and the fish lets go; the bait comes back. It spends a good bite, and nothing gives it back. A passed Prize or bigger lingers 45 s for one more cast (built); that cast spends a bite from the place where the fish first bit.

**How the built code changes (slice 1a).** Under `LOOP`:

| built today | under the loop |
|---|---|
| `measure()` puts the fish in the creel at the seal stamp (`progression.js`), and pays first-catch Shells | `measure()` writes the records only. It never touches `run.hold` and pays nothing (the first-catch Shells are parked). |
| the card's Keep says "Already in the creel" | `fishAction('keep')` adds the fish to `run.hold` if a slot is free; otherwise the button is dimmed. |
| Release, with mercy luck and Memories | `fishAction('letgo')` is the old release with mercy and Memories parked; it refunds the bite and adds the favour above. |
| Continue keeps any fish still on the card (`restorePending`) | Continue with a card open reopens the card: Keep / Let go. |
| a legend's card has no Release, and `sellAll` skips legends | a legend's card shows **Keep · her price** / **Let go**. She takes a slot and is paid at the tally like any fish (first landing: her crown map's price; later: 40%). |

Tests: measure leaves the hold unchanged; a let-go fish refunds its bite and adds +0.2 favour at that water; Continue with the card open reopens it; a kept Belled Matriarch is sold at the tally for 500.

### 3.3 The water goes quiet (the anti-grind rule)

**The rule.** A water's open water, and each place you own in it, has a few **good bites** each evening. Every bite you strike or let pass spends one, landed or lost. A fish let go at the card gives its bite back (§3.2). When the good bites are spent, that water is **quiet**: each further bite there has favour −0.15 (down to −1.2: almost all Smalls) and takes 30% longer to come (up to ×2.2). Only going home brings the water back.

| water | good bites an evening | favour there | what it is for |
|---|---|---|---|
| open water (the whole water, one pool) | **one per slot of your hold, plus one** (4 to 9) | 0 | where you start; later, the top-up |
| day water | **2** | +0.55 | its day fish; its water's uncommon and rare fish, drawn 1.5 times as often |
| old water | **3** | +0.55 | **Elders bite here**, and most giants live here |
| night water | **2**, only after dark | +0.45 | the night fish, and night giants |
| crown (a legend's pool) | **2** | +0.35 | the legend, on her bait in her hour |

- **At any place, commons bite half as often**: the place's own fish crowd out the small fry. That is what makes the sail to a place worth it.
- A quiet place is still better than quiet open water for a bite or two. Nothing ever stops biting: the hold can always be filled.
- Legends, giants, the got-away note and a Marked Fish follow the same count. Nibbles and feints are not bites. A spooked bite (a tap during the nibbles) spends one.
- **The player sees it.** When the float settles it shows its favour notches (built) and one small dot per good bite left. A bite puts a dot out; a fish let go lights it again. With none left the float dims. There is no line on screen; Murk's first quiet-water line teaches it once (§8.6). Quiet water spawns no rise rings.
- **Who counts.** As with the built pressure: `fishing` emits `fishing:bite {waterKey}` once per bite (passed, struck, spooked or lingering), `progression-loop` owns and saves `run.bites`, and `fishing` reads it through `getBitesLeft(key)`.
- **Why going home is attractive.** Home is where the fish turn into clams, where the water comes back, and where the next purchase is. A trip costs about 45 s of sailing, selling and shopping, so half-empty trips pay badly, and so does sitting on quiet water.

**Proof** (sim section 2; clams per minute as a share of the natural rule: "let Smalls pass while good water is left, keep the rest, move on when a water goes quiet, go home"):

| stage | natural rule: clams · minutes | best rule found | keep what bites | wait for dark | **choosy**: Prize+ while fresh, then fill | only Prize+, home when quiet | **the giant hunt** (keep only giants and Trophy+, stay till full) | only Trophy+, stay till full |
|---|---|---|---|---|---|---|---|---|
| first trip: T0, hold 3, the Mossmere's open water (4 good bites) | 44 · 2.2 | 104% | 94% | 77% | 94% | 45% | 9% | 4% |
| 10 min: hold 4, the Lily Maze (7) | 81 · 2.8 | 101% | 100% | 83% | 88% | 63% | 11% | 6% |
| 1 h: T1, hold 5, three Mossmere places (13) | 244 · 3.3 | 104% | 97% | 86% | 91% | 76% | 21% | 11% |
| 5 h: T2, hold 6, four Sporewood places (17) | 406 · 3.7 | 99% | 100% | 80% | 93% | 79% | 29% | 15% |
| 20 h: T5, hold 8, three Thin Water places (16) | 3,797 · 4.3 | 102% | 100% | 72% | 92% | 79% | 30% | 14% |
| 40 h: T6, hold 8, four Salt Gate places (18) | 24,959 · 4.5 | 102% | 100% | 89% | 95% | 85% | 50% | 21% |

- **No patient strategy reaches the natural rule per minute** (the best is 89%). **The giant hunt earns 9–50%**: a giant is too rare to fill a hold with, even when every let-go fish gives its bite back.
- **The natural rule is within 4% of the best rule found**, so playing by feel is playing well.
- **The rule is needed.** With quiet water switched off, "only Trophy+, stay till full" brings **2.1–3.9 times** the clams per trip; players would drift into it.
- **Choosy play is a real choice**: 88–95% of the natural rule per minute, and 38–75% more clams a trip for 1.5–2 times the minutes.

### 3.4 Every trip is an evening

| phase | water time | favour | what bites |
|---|---|---|---|
| late day | the first **40 s** | 0 | fish whose hour is day or any |
| dusk (*Last Light*) | the next **20 s** | +0.2 | day, dusk and any fish |
| night (*Night Rise*) | **until you turn for home** | +0.25, +0.1 per Lantern level | dusk, night and any fish; night water opens |
| dawn | the sail home and the tally | — | you come home at first light |

- **A fish's hour is a window that runs into the next phase**: the roster's "day" bites by day and dusk; "dusk" at dusk and night; "night" at night; "day, dusk" and "dusk, night" as written; "any" always; "any, best at night" always, half as often again after dark.
- **The natural route.** Old water first, then day water while it is light, night water when dark falls, open water to top up. An old water whose giant bites only from dusk (its card's hour glyph) is fished at dusk: the Wick waits there for the light to turn.
- The clock runs on the water only. It stands still during a catch's ceremony and card (built: the cinematic freeze), in menus and at home. Nothing ends the night.
- **Two built clock rules change.** v3's 30 s Arrival Hush on day 1 is 0 under the loop (every trip would otherwise open with +0.2 the sim does not model). The night's length is `null`, read as "no end": `getPhaseDurations` reports the night as open, the HUD draws no clock, and the oil "need" sum is not computed (oil is parked). Tests: no hush term on a trip's first cast; no NaN in `getPhaseInfo` after 10 minutes of night.
- Trips are counted as evenings ("Evening 14" on Journal entries), not days.
- With 3 slots and 4 good bites, 63% of first trips get a bite after dark. A bigger hold reaches deeper into the night.
- A legend keeps her hour for the sure bite (§3.5). Waiting for dark on purpose pays 72–89% of the natural rule per minute: allowed, never needed.

### 3.5 The rare giants

The roster's 49 giants (★) are the descendants of the episodes' main fish: 33 **epic** giants, one at each of 33 places, and 16 **legendary** giants, one in each water's crown.

| rule | value | why |
|---|---|---|
| **where** | an epic giant bites only at its own place (`placeName` in the roster), never in open water or elsewhere | a map is the promise of a giant: buying its map is the only way to meet it |
| **how often** | a fixed share of the bites at its place: **6% in its hour, 2.5% outside it**; its water's giants' lure makes the share ×1.5. Family lures do not draw giants. | it comes, but rarely; the share does not swing with what else bites in that hour |
| **how big** | never Small (z ≥ −0.25); its bites run big (favour +0.3); **it may be an Elder at its own place**, whatever the kind of place (roster ask 1). Every other fish reaches Elder only in old water. | the giants have the longest ladders in their waters (roster σ 0.16) |
| **how hard** | Fight +10 over a rare of its water, +12 as an Elder. On its water's arrival tackle a Prize giant lands 27–55% of the time, less than any other fish there (sim 4b checks every giant). | "the hardest fish to land, never certain" |
| **what it pays** | rarity ×12 (a rare is ×5.5). At the same size class the cheapest giant of a water sells for at least 1.7 times its dearest other fish (sim 1 checks every water). | "the top of the value ladder" |
| **when lost** | the got-away note names it and its rough size; the giant becomes a Marked Fish: it waits at its place, +6 Hold on its next hook, once (the built light Marked Fish) | no fail; the story continues |
| **on the map card** | a lake map's card names its old water's giant; a place map's card names its own giant (a crown names its legend). The giant is drawn life-size beside the Wick, with its hour glyph (§5.1 rule 9). | the promise is visible before you pay |

**How rare is the big one** (sim 4b: the natural rule at the water's arrival tackle, that place and open water only, hold 6; a few of the 33 rows):

| place | its giant | tackle | a Prize lands | it bites on | comes home on | with the giants' lure |
|---|---|---|---|---|---|---|
| Under the Span (the Mossmere) | Thousandcast Pike (dusk) | T1 | 27% | 18% of trips | 4.6% (1 in 21) | 13.1% (1 in 7) |
| The Buoy Lights (the Mossmere) | Hullkiss Lamprey (night) | T1 | 27% | 12% | 4.3% (1 in 23) | 9.9% |
| The Gill Harp (Sporewood) | Harpstring Eel | T2 | 31% | 19% | 7.3% | 15.7% |
| The Well of Ledgers (Glasswater) | Prismdrop Sturgeon | T3 | 32% | 16% | 6.7% | 14.7% |
| The Broken Weir (the Thin Water) | Weirflame | T5 | 53% | 18% | 10.6% | 19.6% |
| The Sluice Throat (the Salt Gate) | Sweetwater Shark (dusk, night) | T6 | 46% | 17% | 7.3% | 17.3% |
| The Fjord Floor (the Rime Sound) | Icedoor Flounder | T6 | 41% | 16% | 7.5% | 17.1% |

The Mossmere's two giants are the hardest to bring home (about 1 trip in 22 on T1), as the Thousandcast Pike's journal line promises ("Follows the lure to the raft, looks at you, and leaves. Ten thousand times."). A dusk or night giant at an old water bites at dusk because the Wick waits for it (§3.4); the hour glyph on its card says when to come.

**Legends.** The built legend rule stays for all 16: her bait, her hour and her pool give a sure bite; the land chance is never above 50% (the sim checks all 16 at T6 with wounds); each escape wounds her (+6 Hold, to +18, kept across trips). Her odds are the persistent-gear ones (`CATCH_V3.legend.fight`, `perRun: false`; §9). She needs a free slot and takes one. She is paid at the tally: her first landing pays her crown map's price; later landings pay 40%. **No legend opens anything** (§4.6).

### 3.6 No way to fail

- No health, no hunger, no oil to run out of, no death, no timer, nothing that takes a kept fish or a clam.
- The lantern always burns. It is light and atmosphere, and its level (§7) changes how far it reaches.
- Closing the game mid-trip loses nothing: *Continue* restores the hold, the bites spent, the clock and the raft's place (built autosave).
- **A trip ends only at home.** The built pause menu's *Abandon Descent* and the title's *New Descent* would throw a full hold away and count a death. Under the loop the pause menu offers **Home** (the tally) in their place, and while a trip is out the title offers only **Continue**. A trip ends only through `endRun('home')`: no deaths, no best day, no summary, no death screen. Slice 1a test: no path from the pause menu or the title empties a hold without selling it.
- The only loss in the game is the fish that got away, and its note names it.

---

## 4. The economy

All prices are in clams. Every table below is the draft table `LOOP` in `tools/sim/clams.mjs` (print it with `--json`); it moves into `src/data.js` with slice 1a and grows with each slice.

### 4.1 What a fish sells for

```
clams = max(1, round(tier[water] × rarity × body × clamp(e^(0.9·z), 0.4, 30) × classBonus))
  rarity: common 1 · uncommon 2.4 · rare 5.5 · epic 12        body = clamp(√(L50 / 45 cm), 0.6, 1.6)        classBonus: Trophy 1.25 · Elder 1.6
```

`z` is the size score the game already rolls (§25.7.1); `L50` is the fish's typical length (the roster's `sizeModel`, or the built size for a built species the roster keeps). There is no lake normaliser, no quality multiplier and no streak multiplier (§9). The card shows this number on **Keep**. A legend is not sold by size: she pays her crown's price at the tally (§4.6). A curiosity sells at its water's rare Keeper price (roster §6).

| at a class's typical size | Small | Keeper | Prize | Trophy | Elder | Ancient |
|---|---|---|---|---|---|---|
| size multiplier (it was 0.5 / 0.8 / 1.2 / 2.2 / 4.0 / 4.8 in §25.7.3) | ×0.5 | ×1.4 | ×3.5 | ×9.1 | ×22.8 | ×32.6 |

**The value tiers and what a fish is worth** (means over the water's fish; Appendix A lists every fish):

| water | value tier | a common Keeper | a rare Keeper | a giant Keeper | a giant Prize | a giant Trophy |
|---|---|---|---|---|---|---|
| 1. The Mossmere | 7 | 8 | 65 | 150 | 369 | 947 |
| 2. Sporewood Pools | 11 | 12 | 101 | 225 | 553 | 1,421 |
| 3. Glasswater Vault | 16 | 20 | 141 | 379 | 934 | 2,398 |
| 4. The Pallid Deep | 35 | 42 | 366 | — (its one giant is its legend) | — | — |
| 5. Rushlight Fen | 86 | 80 | — (no rare) | 1,663 | 4,091 | 10,506 |
| 6. The Thin Water | 74 | 90 | 669 | 1,501 | 3,692 | 9,482 |
| 7. Lampmoss Slough | 103 | 147 | 947 | 2,058 | 5,060 | 12,995 |
| 8. Pyrefall Gorge | 223 | 192 | 2,050 | 4,626 | 11,378 | 29,217 |
| 9. The Thunder Stair | 166 | 168 | — (no rare) | 3,441 | 8,464 | 21,735 |
| 10. The Inkwood | 245 | 237 | 1,910 | 4,535 | 11,153 | 28,642 |
| 11. The Siltway | 309 | 332 | 2,675 | 6,725 | 16,541 | 42,478 |
| 12. The Salt Gate | 238 | 267 | 2,524 | 6,125 | 15,066 | 38,690 |
| 13. Lanternroot Lagoon | 454 | 553 | 4,496 | 9,949 | 24,471 | 62,843 |
| 14. The Waxen Reef | 1,060 | 1,221 | 9,745 | 22,041 | 54,210 | 139,215 |
| 15. The Last Light | 920 | 1,183 | 11,137 | 23,437 | 57,645 | 148,035 |
| 16. The Rime Sound | 1,247 | 1,932 | 13,394 | 32,180 | 79,151 | 203,263 |

The tiers are uneven (Pyrefall Gorge 223, the Thunder Stair 166) because the waters' fish are uneven: each is set by the two ladder rules of decision 10, so each water pays what the next map promises.

Worked values (tests in slices 1a–2 use them): a Keeper Dusk Minnow (z 0.4) sells for **7**, a Keeper Weeping Carp **26**, a Prize Reedjaw Pike (z 1.4) **158**, a Trophy Reedjaw Pike (z 2.2) **406**, an Elder Reedjaw Pike (z 2.95) **1,022**, a Keeper Thousandcast Pike **150**, a Trophy Thousandcast Pike **944**.

**Two extras, both paid at the tally.** A fish that fills one of **Murk's orders** sells for double (§6.3). **From slice 9**, a fish that beats Murk's **Old Ledger** figure for its species (a mid-Trophy, built) sells for double, once per species. The loop keeps its own record of it, `meta.loop.ledgerPaid: [speciesId]`, written only when that species is sold, because the built `entry.oldLedger` is set at the measure (kept or not) and an old save has already used it. A record fish let go keeps its record but not the double.

### 4.2 The hold ladder

| hold | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|
| name | Wicker Creel | Lidded Creel | Double Creel | Wellbox | Ferry Hamper | Harbour Chest |
| price | start | **30** | **120** | **450** | **2,000** | **3,500** |
| bought at about (pacing run) | — | trip 1 | 0.4 h | 2.5 h | 6.8 h | 10.7 h |
| clams a minute, when bought | — | +9% | +3% | +1% | +1% | −2% |
| clams a trip, when bought | — | +32% | +20% | +18% | +15% | +8% |
| price, in trips of income then | — | 0.8 | 1.6 | 1.1 | 1.5 | 1.5 |

Open water's good bites grow with the hold (one per slot, plus one), so a bigger hold is a longer good evening, not a longer quiet one. Even so, only Hold 4 makes you faster: past it, each new slot is filled from open water, which is poorer than your places, so clams a minute stay about level while each evening grows. **Hold 5–8 are bigger evenings, priced like looks**: one or two trips each. The hold stops at 8 so trips stay under 6 minutes. (A slower visit home makes bigger holds worth more per minute; slice 1a measures it.)

### 4.3 Tackle (Rod, Line, Reel: the global gear)

The tiers T0–T4, their names and their Hold are `TACKLE` as built (§25.6.6). Each slot is bought on its own. **Proof catches are gone.** T5 and T6 are new.

| tier | Rod · Line · Reel | Hold (rod / line / reel) | price per slot | on the shelf with |
|---|---|---|---|---|
| T0 | Willow Switch · Twine · Wooden Winch | 0 / 0 / 0 | start | — |
| T1 | Ashwood · Braided Gut · Brass Spool | 2 / 2 / 2 | **50** | start |
| T2 | Whalebone · Waxed Silk · Clockwork | 5 / 5 / 5 | **300** | start |
| T3 | Glassreed · Glass-Gut · Whisper Drag | 8 / 9 / 8 | **1,200** | the Sporewood map |
| T4 | Lantern-Spine · Silverthread · Tidewheel | 12 / 13 / 12 | **6,000** | the Glasswater map |
| **T5** | **Bellwether · Starthread · Moonwheel** | 15 / 16 / 15 | **32,000** | the Pallid Deep map |
| **T6** | **Crown-Reed · Kingshair · Last Wheel** | 18 / 19 / 18 | **100,000** | the Inkwood map |

Tackle matters most where the fish fight hardest (sim section 3, clams per trip at hold 8, the water's ordinary places): the Mossmere 308 at T0 and 535 at T6 (+74%); the Pallid Deep 365 and 1,714 (×4.7); the Rime Sound 3,836 and 66,998 (×17). Each new water's Fight term (Rushlight Fen 28 rising to the Rime Sound 44; the built lakes 0 / 7 / 16 / 24) is set so its giants at Prize land about as often on arrival tackle as the built lakes' giants do.

### 4.4 Lures (permanent, one fitted)

Lures are bought once and kept for good; a snapped line never loses one. **Family lures** draw and help a family (built `LURES`, `CATCH_V3.items`): Feather Fly **50** (insect feeders, +5 Hold) · Glimmer Spoon **90** (predators, +6) · Bone Jig **110** (bottom feeders, +6) · Moth Popper **400** (night-only fish at night, +6; with the Sporewood map) · Lantern Lure **4,000** (glow fish, +8; with the Glasswater map). They do not draw giants.

**Giants' lures**, one per water, **+10 Hold** on the fish named and a ×1.5 share for its giants. The four built ones are **re-aimed at their lake's giants**; twelve are new, each priced at 0.3 of its lake map. Each goes on the shelf with its water's map.

| lure | water | +10 Hold on | price |
|---|---|---|---|
| Harbour-Bell Spinner | The Mossmere | Thousandcast Pike, Hullkiss Lamprey, Reedjaw Pike | 180 |
| Spore-Lamp Fly | Sporewood Pools | Harpstring Eel, Festival Puffer, Emberbrood Snakehead | 500 |
| Mirror Shard | Glasswater Vault | Shardspine Eel, Wolfwake Trout, Prismdrop Sturgeon | 2,400 |
| Ferryman's Coin | The Pallid Deep | Gilt-Eyed Eel, Candlewake Sturgeon, the Clapper | 9,000 |
| Rushlight Spinner | Rushlight Fen | Packtooth | 10,000 |
| Weir Spoon | The Thin Water | Weirflame, Blotback Catfish | 12,200 |
| Moss-Lamp Jig | Lampmoss Slough | Weirshadow Catfish, Old Portcullis, Lampspot Snakehead | 17,500 |
| Ember Wobbler | Pyrefall Gorge | Pyregold Carp, the Unfinished, Lampspot Snakehead | 21,500 |
| Thunder Plug | The Thunder Stair | Lampeye Perch, Soapthief | 26,400 |
| Ink Fly | The Inkwood | Emberbelly, Nightcreek Hound, Smilejaw Bream, Gourdcracker | 43,500 |
| Silt Rattle | The Siltway | Sternlamp Catfish, Dapplewheel Ray, Millstone Catfish | 53,400 |
| Tide Spoon | The Salt Gate | Sweetwater Shark, Tideghost Shark, Inkmarble Eel, Longlash Ray | 72,300 |
| Root-Lamp Popper | Lanternroot Lagoon | Snagheart Bass, Votive Shark, Rootjaw Catfish, Stiltshadow Shark | 111,900 |
| Wax Jig | The Waxen Reef | Anvil Trevally, Spirewatch Pike, Mothlance Gar, Cabin Grouper | 148,800 |
| Lighthouse Feather | The Last Light | Nightsail Lancer, Castaway Pike, Starbar Lancer | 181,500 |
| Rime Pirk | The Rime Sound | Icedoor Flounder, Coalwing Skate | 221,400 |

(A new giants' lure names its water's epic giants and its longest rare; the names are drafts, to be confirmed when its sheet is scheduled, as roster ask 5 says.)

### 4.5 Bait (consumable, one fitted beside the lure)

- A **tin holds 10** and is **Murk's bait for one water**. **Every tin in a water costs the same: 1.5 × that water's value tier** (rounded to 5). One bait is spent per hooked fish (built: spent at the cast, refunded when the bite is let pass). With no bait you fish a bare hook; that is always allowed.
- **Every tin does the same two things**: every fish runs bigger (favour +0.3), and the fish that favour it hold better (+5 Hold; the built tins keep their built Hold; the roster's `favours` say which fish). Where the lure and the bait both give Hold, the fish gets the larger, never both (built). **A tin does not change which fish bite**, except that a fish that bites on one bait only (the Gloam Eel on Lumen Moss, the Threadling Eel on Spore Cake, the Chime Jelly on Glass Larvae) needs it. So picking a tin is picking the fish you are after.

| a tin of 10 | the Mossmere | Sporewood | Glasswater | the Pallid Deep | Rushlight Fen | the Thin Water | the Inkwood | the Salt Gate | the Rime Sound |
|---|---|---|---|---|---|---|---|---|---|
| any bait | **10** | 15 | 25 | 55 | 130 | 110 | 370 | 355 | 1,870 |

| bait | helps hold | first on the shelf with |
|---|---|---|
| Mire Worms | bottom feeders and insect eaters the roster names | the Mossmere |
| Lumen Moss | glow fish; the Gloam Eel bites on nothing else | the Mossmere |
| Spore Cake | Sporewood's spore feeders; the Threadling Eel bites on nothing else | Sporewood |
| Ember Roe | predators the roster names | Sporewood |
| Glass Larvae | Glasswater's glass fish; the Chime Jelly bites on nothing else | Glasswater |
| Shimmerfly | night risers | the Pallid Deep |
| **Windfall Plum** (new) | the Inkwood's fruit eaters | the Inkwood |
| **Tallow Soap** (new) | whiskered scavengers | the Thunder Stair |
| **Cut Strip** (free) | +0.3 favour on predators, +4 Hold. Holding **Let go** on a Small or a Keeper cuts it into 3 strips (from slice 3). The roster's most-named bait (60 fish). The sim does not model it. | — |

Each water's **plain bait** (the tin its fish name most; the Bait Bed's free bait): Mire Worms for the Mossmere and nine of the new waters, Spore Cake for Sporewood, Ember Roe for Glasswater, the Pallid Deep, Lanternroot Lagoon and the Last Light, Windfall Plum for the Inkwood.

What a tin is worth (natural rule, net of the tins; sim section 4): +10% clams a minute at hour 1 (Mire Worms, the Mossmere; a tin earns 4.9 times its price), +21% at hour 5 (Spore Cake, Sporewood; 8.9×), +14% at hour 10 (Ember Roe, Glasswater; 7.5×), +12% at hour 20 (Mire Worms, the Thin Water; 5.8×), +8% at hour 40 (Mire Worms, the Salt Gate; 7.3×). **Worth buying, never a must.** **No tin is the one to buy**: at hours 10, 20 and 40 no other tin beats the water's plain bait (the check allows 3 points a minute; the best is 0.0). Small fish have four uses: a slot when nothing better comes, an order, a let go that makes the next fish bigger, or Cut Strip.

### 4.6 Legends

| legend · crown | her bait, per try | first try lands (tackle) | tries expected | bait in all | first landing pays | later landings |
|---|---|---|---|---|---|---|
| The Belled Matriarch · the Bell Pool | Heartmoss Ball **60** | 27% (T1) | 2.8 | 169 | **500** | 200 |
| The Drifting Grove · the Mother's Cup | Glowcap Bulb **250** | 24% (T2) | 3.0 | 759 | **2,200** | 880 |
| The Glass Sovereign · the Fallen Chandelier | Prism Moth **1,000** | 21% (T3) | 3.2 | 3,221 | **7,500** | 3,000 |
| The Lantern-Swallower · the Bottomless | Last Candle **3,000** | 17% (T4) | 3.5 | 10,595 | **19,000** | 7,600 |
| The Long Thunder · the Dam Foot | Storm Candle **2,350** | 30% (T5) | 2.7 | 6,368 | **19,600** | 7,840 |
| The Buried Moon · the Moonbed | Lamp Snail **2,880** | 29% (T5) | 2.7 | 7,820 | **24,000** | 9,600 |
| The Last Sentry · the Sentry's Reach | Carp Cutlet **4,140** | 27% (T5) | 2.8 | 11,713 | **34,500** | 13,800 |
| The Ashen Guest · the Last Pyre | Charred Offering **5,090** | 27% (T5) | 2.8 | 14,434 | **42,400** | 16,960 |
| The Last Lock · the Throat | Wired Bream **6,240** | 25% (T5) | 3.0 | 18,493 | **52,000** | 20,800 |
| The Banked Fire · the Breathing Mere | Blossom Fly **10,270** | 28% (T6) | 2.8 | 28,424 | **85,600** | 34,240 |
| The Barge-Shadow · the Long Hole | Bargeman's Supper **12,600** | 27% (T6) | 2.8 | 35,649 | **105,000** | 42,000 |
| The Old Shipwright · the Slipway | Tide Mullet **17,060** | 27% (T6) | 2.8 | 48,377 | **142,200** | 56,880 |
| The Silver Regent · the Sighing Pool | Moth-Wing Fly **26,410** | 25% (T6) | 3.0 | 78,269 | **220,100** | 88,040 |
| The Waxen Abbot · the Abbot's Cellar | Lantern-Fry **35,110** | 25% (T6) | 3.0 | 104,301 | **292,600** | 117,040 |
| The Jetsam Shark · the Unlit Mile | Lighthouse Ration **42,840** | 22% (T6) | 3.1 | 134,401 | **357,000** | 142,800 |
| The Long Winter · the Half-Mile Line | Old Ration **52,250** | 22% (T6) | 3.1 | 164,349 | **435,400** | 174,160 |

- A new legend's Fight is her water's Fight term + 26 (the built four are `CATCH_V3.legend.fight` as built, never `fightRun`); her bait costs 12% of her crown map.
- **No legend opens anything.** A legend is a crown, never a key. Her print hangs under the sea-gate arch; her Waystone burns gold.
- Tests: the game's first-try chance on the Belled Matriarch at T1 equals the sim's 27% (slice 2); the Lantern-Swallower's at T4 equals 17% (slice 5).

### 4.7 The raft and the home (the tables are in §7 and §6)

| what | levels | prices |
|---|---|---|
| Oars | I–II | 60 · 300 |
| Keel | I–III | 100 · 600 · 3,000 |
| Lantern | I–II | 100 · 500 |
| Murk's Order Board | I–III | 70 · 400 · 4,000 |
| Bait Bed | I–III | 120 · 700 · 9,000 |
| The Long Wall | 4 wings, one per reach | 250 · 30,000 · 80,000 · 150,000 |
| Landing lights | I–III | 200 · 1,200 · 14,000 |
| Looks (9) | — | 300 · 400 · 600 · 2,500 · 6,000 · 40,000 · 50,000 · 100,000 · 200,000 |

### 4.8 Maps (the catalogue is §5.2)

| water | lake map (opens its open, day and old water) | night water | fifth place | crown |
|---|---|---|---|---|
| 1. The Mossmere | yours (day water 60 · old water 150 are place maps) | 260 | — | 500 |
| 2. Sporewood Pools | **2,000** | 1,200 | 1,100 (old) | 2,200 |
| 3. Glasswater Vault | **10,200** | 4,800 | 4,000 (old) | 7,500 |
| 4. The Pallid Deep | **26,000** | 14,000 | — | 19,000 |
| 5. Rushlight Fen | **33,300** | 14,300 | — | 19,600 |
| 6. The Thin Water | **40,700** | 17,500 | — | 24,000 |
| 7. Lampmoss Slough | **58,400** | 25,100 | — | 34,500 |
| 8. Pyrefall Gorge | **71,800** | 30,900 | — | 42,400 |
| 9. The Thunder Stair | **88,100** | 37,900 | — | 52,000 |
| 10. The Inkwood | **145,000** | 62,400 | 56,600 (old) | 85,600 |
| 11. The Siltway | **178,000** | 76,500 | — | 105,000 |
| 12. The Salt Gate | **241,000** | 103,600 | 94,000 (night) | 142,200 |
| 13. Lanternroot Lagoon | **373,000** | 160,400 | 145,500 (night) | 220,100 |
| 14. The Waxen Reef | **496,000** | 213,300 | 193,400 (old) | 292,600 |
| 15. The Last Light | **605,000** | 260,200 | — | 357,000 |
| 16. The Rime Sound | **738,000** | 317,300 | — | 435,400 |

The four built lakes keep their order; the Mossmere keeps its prices; the other three are re-priced (each lake map is v5's lake map plus its day and old water). A new water's lake map costs about 42 minutes of its own income fully mapped; its place maps are shares of it: night 0.43, fifth 0.39, crown 0.59.

**The whole catalogue** (the pacing run's 144 purchases): **9,497,785 clams**: maps 71%, lures 10%, legend bait 7%, tackle 4%, looks 4%, home 3%, raft and hold under 1%. The legends' first landings pay back 1,839,600 of it.

### 4.9 Pacing targets, and the proof

The pacing run (sim section 5) is an average player: 90% of the natural rule's clams, 25% more time per trip for looking around, plain bait from minute 30, +6% per order slot. It buys 144 things in a sensible order and always fishes the best of its three newest waters.

| mark | clams per trip | minutes per trip | trips per purchase | bought | where | state | target |
|---|---|---|---|---|---|---|---|
| **10 min** | 71 | 3.5 | 1.0 | 3 | the Mossmere | hold 4, Line T1, the Lily Maze | first purchase after trip 1; 2–5 bought; 40–90 clams |
| **1 h** | 234 | 4.1 | 0.8 | 14 | the Mossmere | T1, hold 5, three places | 100–240 clams; 0.5–2.6 trips; 11–19 bought |
| **5 h** | 777 | 4.6 | 3.7 | 46 | Glasswater | T3, hold 6, three waters, 11 places | 300–900 clams; 1.5–5 trips |
| **20 h** | 3,742 | 5.4 | 6.5 | 75 | Rushlight Fen | T5, hold 8, five waters, 21 places | 1.5–7 trips; 5–8 waters owned |
| **40 h** | 29,661 | 5.5 | 4.8 | 120 | Lanternroot Lagoon | T6, hold 8, 13 waters, 53 places | — |
| **the end** | — | — | — | 144 | | everything, at 48.1 h | 40–60 h |

| water | its map bought at | the best water to fish from | its legend landed at |
|---|---|---|---|
| 1. The Mossmere | start | 0.0 h | 1.8 h |
| 2. Sporewood Pools | **1.4 h** (target 1.2–2.0) | 1.4 h | 4.8 h |
| 3. Glasswater Vault | **4.5 h** (4.0–6.5) | 4.5 h | 9.5 h |
| 4. The Pallid Deep | **9.0 h** (8.5–13) | 9.0 h | 19.5 h |
| 5. Rushlight Fen | **16.1 h** (12–18) | 16.1 h | 21.2 h |
| 6. The Thin Water | 20.4 h | 20.4 h | 24.1 h |
| 7. Lampmoss Slough | 22.4 h | 22.4 h | 26.0 h |
| 8. Pyrefall Gorge | 25.1 h | 25.1 h | 28.5 h |
| 9. The Thunder Stair | 27.0 h | 27.0 h | 33.0 h |
| 10. The Inkwood | 29.8 h | 29.8 h | 35.7 h |
| 11. The Siltway | 34.3 h | 34.3 h | 37.7 h |
| 12. The Salt Gate | 36.8 h | 36.8 h | 40.7 h |
| 13. Lanternroot Lagoon | 39.3 h | 39.3 h | 43.2 h |
| 14. The Waxen Reef | 42.3 h | 42.3 h | 45.7 h |
| 15. The Last Light | 44.5 h | 44.5 h | 47.4 h |
| 16. The Rime Sound | 46.6 h | 46.6 h | 48.1 h |

| milestone | value | target |
|---|---|---|
| the longest wait for one purchase | **80 min** (the Inkwood map) | ≤ 90 min |
| the first giant comes home | about **hour 1.4** (a Thousandcast Pike or a Hullkiss Lamprey) | hour 0.4–3 |
| giants landed and kept by the end | **about 70** | — |
| Elders landed by the end | **about 64** | — |
| a new water is the best water to fish | **from the day its map is bought**, all 15 | within 30 min |
| on the day you buy a lake map, its open, day and old water ÷ the water before, fully mapped | **1.07–1.28** | ≥ 1.05 |
| every water, fully mapped ÷ the one before | **1.22–1.55** (86 → 17,600 clams a minute) | ≥ 1.2 |
| every place map, bought in price order | **+8% to +32%** clams a minute | ≥ +5% |
| the best set of a water's places ÷ the next water fully mapped | **at most 0.83** | < 1 |
| trips at the pacing marks, the visit home included | **3.5–5.5 min** | ≤ 6 |
| maps' share of all spending | **71%** | 50–75% |

**The first trip** (natural rule, 4,000 trips): 44 clams on average, 19–80 for most players (10th–90th percentile); 2.2 minutes; 98% come home full; **52% bring home no Prize or bigger**; 8% a Trophy; 27% of hooked fish get away; 63% get a bite after dark.

**The buying order of the pacing run** (hour · what · price; the full table with trips is printed by the sim):

| era | purchases in order |
|---|---|
| the Mossmere, 0–1.4 h | 0.05 Hold 4 · 30 → Line T1 · 50 → map: the Lily Maze · 60 → Rod T1 · 50 → Reel T1 · 50 → Oars I · 60 → Order Board I · 70 → 0.43 Hold 5 · 120 → map: Under the Span · 150 → Glimmer Spoon · 90 → Bone Jig · 110 → 0.76 map: the Buoy Lights · 260 → Feather Fly · 50 → Bait Bed I · 120 → **1.38 MAP: Sporewood Pools · 2,000** |
| Sporewood, 1.4–4.5 h | Harbour-Bell Spinner · 180 → Lantern I · 100 → Line, Reel, Rod T2 · 300 each → Long Wall wing 1 · 250 → map: the Bell Pool · 500 → the Matriarch hunt · 142 → Oars II · 300 → Keel I · 100 → Order Board II · 400 → Spore-Lamp Fly · 500 → Landing lights I · 200 → 2.18 map: the Puffball Vent · 1,100 → Moth Popper · 400 → map: the Veilwater · 1,200 → Hold 6 · 450 → Lantern II · 500 → Slate Cloak Dye · 300 → Keel II · 600 → Line T3 · 1,200 → Oxblood Pennant · 400 → Bait Bed II · 700 → Reel T3 · 1,200 → Amber Lantern Glass · 600 → 3.39 Rod T3 · 1,200 → **4.52 MAP: Glasswater Vault · 10,200** |
| Glasswater, 4.5–9.0 h | map: the Mother's Cup · 2,200 → the Grove hunt · 613 → Mirror Shard · 2,400 → Landing lights II · 1,200 → 5.37 map: the Well of Ledgers · 4,000 → Order Board III · 4,000 → Line T4 · 6,000 → Lantern Lure · 4,000 → map: the Broken Hymnal · 4,800 → Hold 7 · 2,000 → Reel T4 · 6,000 → Painted Prow · 2,500 → 7.60 Rod T4 · 6,000 → **8.96 MAP: The Pallid Deep · 26,000** |
| the Pallid Deep, 9.0–16.1 h | Keel III · 3,000 → map: the Fallen Chandelier · 7,500 → the Sovereign hunt · 2,452 → Bait Bed III · 9,000 → Ferryman's Coin · 9,000 → map: the Sunken Belfry · 14,000 → Hold 8 · 3,500 → Landing lights III · 14,000 → Bell Buoy · 6,000 → 12.78 Line, Reel, Rod T5 · 32,000 each → **16.05 MAP: Rushlight Fen · 33,300** |
| each new water, 16.1–48.1 h | its lake map → (Long Wall wings with waters 5, 9, 13; T6 · 100,000 each with the Inkwood; a look with waters 5, 7, 11, 15) → its giants' lure → the crown and legend hunt of the water before → its fifth place → its night water. The Rime Sound's own crown and the Long Winter end the shelf at 48.1 h. |

**What the sim found that shaped the design.**

- **A giant's share must not depend on the pool.** With a fixed weight, a night water with little else biting gave its giant on 94% of bites; with family lures multiplying it, a giant came home on 55% of trips at hour 1. Hence the fixed share and "only its own giants' lure draws it" (§3.5).
- **A bait that pulls in commons loses clams** (Mire Worms −16% at hour 1). Hence bait never changes the pool (§4.5). **A tin with more favour for less money beats every other**: hence one favour and one price per water.
- **Open water alone cannot beat a mapped water.** A water's places hold 30–100% of its worth: its Elders, its giants and its best fish. To make a new water's open water beat the old water fully mapped, every tier would have to grow about 1.8 times per water (the Rime Sound's tier 65,000, its fully mapped income 700,000 clams a minute). **Opening the day and old water with the lake** does it with tiers that end at 1,247 (the Rime Sound; v5 397), where a giant Trophy sells for about 203,000.
- **A place earns its sail only if its fish are better than open water's.** With every common still biting, a day water added 0–5% and some places lost clams. Halving commons at places, drawing a day water's better fish 1.5 times, and giving each weak place a fish of its own makes every place map worth +8% or more.
- **The last place bought adds little if the places' good bites already fill the hold.** Hence fewer good bites per place (day 2, old 3, night 2) and more in open water, which grow with the hold.
- **A bigger hold is not a faster one.** Under quiet water, each slot past 4 is filled from open water, poorer than your places. Hold 5–8 are priced as bigger evenings, not multipliers (§4.2).
- **Each water needs its own value tier.** At one value point per tier the waters pay very different amounts, because their fish, Fight and tackle differ. `node tools/sim/clams.mjs --calibrate` prints the tiers that satisfy decision 10, with a 2-point margin so a noisy run still clears it; the table in §4.1 is its output.
- The model's limits: no cast depth, no signs, no weather, no Marked Fish bonus, no Cut Strip, orders as a flat 6%, curiosities left out, 44 s for sailing out and the visit home. Read every number as ±10%.

---

## 5. Maps: the only way to a new water

### 5.1 Rules

| # | rule | why |
|---|---|---|
| 1 | Two kinds of map, one word on screen. A **lake map** opens a water: its open water, **its day water and its old water**. A **place map** opens one more place inside a water you own: its night water, its crown, or a fifth place. | A new water is better than the old one from its first evening (decision 6). The four built arenas exist; a lake map sells in slice 1b with no world work. |
| 2 | **55 maps for sale**: 15 lake maps (the Mossmere is yours) and 40 place maps: the Mossmere's four (day, old, night, crown), and in each other water a night water and a crown, plus a **fifth** in the six waters whose fourth giant the roster put on a later sheet (the Puffball Vent, the Well of Ledgers, the Overhang, the Turning Tide, the Monsoon Cut, the Drowned Spire). | One pattern, four glyphs (sun, ring, moon, crown); every roster giant has a map. |
| 3 | Open water gives fish up to Trophy. **Elders bite only in old water, and a giant at its own place.** A place's own fish and its giant bite only at that place; a "night water" fish bites in any night water of its water. | Big and rare fish live on mapped water. |
| 4 | **Clams are the only key.** A place map needs its water's lake map. A lake map needs the water before it. Nothing needs a legend, a catch or a count. | The map is the only way. Luck never blocks a purchase. |
| 5 | **A water you do not own is not in the world.** At home it is a rolled sheet on Murk's shelf, sealed with wax in the shape of its legend, with a price. | The big goal is in sight from the first minute. |
| 6 | **A place you do not own is standing mist**: a low lavender bank over that water, its landmark a dark shape inside, and on clear nights its giant's dark back turning in it. You can sail through it. A cast into it comes back with no line on screen (the float sinks into the mist and rises again); the bait is kept and no bite is spent. On the Chart it is a blot with a glyph and a price, and no name. | The water sells the next map without a word. You know something is there and that it is big; you do not know what until you buy. |
| 7 | **Buying a map lifts the mist for good.** On the first evening there, the bank thins over 3 s, the camera frames the landmark and an ink title card names the place (1.2 s). A lake map lifts two banks, its day and old water, one after the other. | The purchase pays out as a view. This is what "discovering a place" now is. |
| 8 | Maps are sold only at home. **Murk shows at most three**: the two cheapest place maps you can buy, and the next lake. | Few cards, always a next one. |
| 9 | **A map card names one fish**, drawn life-size beside the Wick, with the hour glyph, a line of at most 8 words and the price. A lake map's card names **its old water's giant** and bears its legend's wax seal. A place map's card names its giant (a crown names its legend), or else the place's own fish. **No card names a common**, and every card but the Lily Maze's names a fish you cannot meet elsewhere. | You buy a promise: a fish and an hour. 49 of the 55 cards promise a giant. (User: yes.) |
| 10 | A trip is one water and every place you own in it. It starts at the dock nearest the place you tapped on the Chart. | More maps mean more good bites and a richer evening. |

### 5.2 The catalogue

**The four built lakes.** Sites are built arena features (`ZONES[].arena`, `PLACES_V3`). The Mossmere's four places keep their §25.8.4 geometry (`MOSSMERE_V3.places`). The other built lakes' places are **re-sited as raft waters** (they were authored for walking layouts that are not built); the centres below are for the build to validate against `world-layout` (open water ≥ 80%, clear of islands, docks and the spawn). The Puffball Vent and the Well of Ledgers keep their `PLACES_V3` discs.

| map | kind | price | where (built feature · about x, z) | the card names | also there | the card's line (≤ 8 words) |
|---|---|---|---|---|---|---|
| **The Mossmere** | lake | start | — | its seal: the Belled Matriarch | 12 open-water fish | — |
| The Lily Maze | day | 60 | lee of Mossbell Isle · (−40.5, 24.5) | Candlefin Koi (drawn ×3) | Weeping Carp (drawn ×1.5) | "Koi glow under the pads like lanterns." |
| Under the Span | old | 150 | the Toppled Bridge's piers · (−29.5, 0.5) | ★ Thousandcast Pike (dusk) | Bridgechain Sturgeon (its own); Elders | "The bridge kept its chain. Something kept it." |
| The Buoy Lights | night | 260 | the west channel · (−48, −2) | ★ Hullkiss Lamprey | Gloam Eel (on Lumen Moss) | "The harbour lights went under, still lit." |
| The Bell Pool | crown | 500 | the Bell Pool · (−4, −14) | ★ the Belled Matriarch | — | "The moon looks in on the old bell." |
| **Sporewood Pools** | lake | 2,000 | opens the Lullaby (day) · (−28, −8) and the Gill Harp (old) · the south-east stalks (39, 27) | ★ Harpstring Eel; its seal: the Drifting Grove | 12 open-water fish; Sleepspore Jelly (on Lumen Moss) and Velvet Ray drawn at the Lullaby; Elders at the Gill Harp | "A harp in the Pools knows one song." |
| The Puffball Vent | old (fifth) | 1,100 | the cap reef's vent · (0, −25) | ★ Emberbrood Snakehead | Elders | "Pink sparks at the surface. Something under them." |
| The Veilwater | night | 1,200 | lee of West Lily Cap · (−36, −36) | ★ Festival Puffer | Hushcap Koi (its own), Nightbloom Carp | "A koi that only glows in the dark." |
| The Mother's Cup | crown | 2,200 | the Grove Well · (28, −16) | ★ the Drifting Grove | — | "The Mother breathes. Big things breathe with her." |
| **Glasswater Vault** | lake | 10,200 | opens the Stilled Cascade (day) · lee of the Monolith of Tides (−28, −40) and the Mirror Nave (old) · by the Monolith of Names (−48, 0) | ★ Shardspine Eel (dusk, night); its seal: the Glass Sovereign | 11 open-water fish; Rainglass Darter, Glassgill Perch, Prism Minnow at the Cascade; the Unreflected (its own) and Elders in the Nave | "In the Nave, one fish has no reflection." |
| The Well of Ledgers | old (fifth) | 4,000 | the north-west shelf · (−41, 41) | ★ Prismdrop Sturgeon | the Footnote (its own); Elders | "Older than the Vault. Waiting for the sky." |
| The Broken Hymnal | night | 4,800 | by the Monolith of Hymns · (48, 0) | ★ Wolfwake Trout | Vesper Gar | "A chord that was never finished." |
| The Fallen Chandelier | crown | 7,500 | the North Trench · (0, −37) | ★ the Glass Sovereign | — | "The great light fell. Something keeps it lit." |
| **The Pallid Deep** | lake | 26,000 | opens the Bier Barge (day) · the Bier Barge wreck (−10, −12) and the Chain Garden (old) · under the north rib (0, −37) | Candlewake Sturgeon (its own, at night); its seal: the Lantern-Swallower | 7 open-water fish; the Wax-Bearer (its own) at the Barge; Gilt-Eyed Eel and Elders in the Garden | "Its scutes are candles nobody lit." |
| The Sunken Belfry | night | 14,000 | by the Candle Barge · (50, 4) | the Clapper (its own) | Lampwarden Angler (on Ember Roe) | "When the bell rings below, all listen." |
| The Bottomless | crown | 19,000 | the Well · (0, −52) | ★ the Lantern-Swallower | — | "The great lantern went down. Still going." |

The Pallid Deep's only giant is its legend (the roster gives it one main fish); its lake map and night water promise its built rares, its dearest fish after the legend.

**The twelve new waters.** Sites are authored with each water's arena (§5.3); the roster's water and giant descriptions (ROSTER §3) are the brief for each landmark. Every card's line (≤ 8 words) is written with its sheet.

| water · its lake map | opens (day · old) | the lake card names | night water | fifth place | crown |
|---|---|---|---|---|---|
| **5. Rushlight Fen** · 33,300 | the Reed Lanes · the Run | ★ Packtooth | the Night Lanes · 14,300 · Reedwalker Catfish | — | the Dam Foot · 19,600 · ★ the Long Thunder |
| **6. The Thin Water** · 40,700 | the Marsh Lanes · the Broken Weir | ★ Weirflame | the Lamp Ford · 17,500 · Blotback Catfish | — | the Moonbed · 24,000 · ★ the Buried Moon |
| **7. Lampmoss Slough** · 58,400 | the Straight Canal · Under the Weir | ★ Weirshadow Catfish | the Lock Gate · 25,100 · ★ Old Portcullis (moved from the Mossmere) | — | the Sentry's Reach · 34,500 · ★ the Last Sentry |
| **8. Pyrefall Gorge** · 71,800 | the Alms Steps · the Coin Run | ★ Pyregold Carp | the Boulder Garden · 30,900 · ★ the Unfinished | — | the Last Pyre · 42,400 · ★ the Ashen Guest |
| **9. The Thunder Stair** · 88,100 | the Step Pools · the Cauldron | ★ Lampeye Perch | the Soap Landing · 37,900 · ★ Soapthief | — | the Throat · 52,000 · ★ the Last Lock |
| **10. The Inkwood** · 145,000 | the Windfall · the Kitchen Stair | ★ Emberbelly | Rootgate Creek · 62,400 · ★ Nightcreek Hound | the Overhang (old) · 56,600 · ★ Smilejaw Bream | the Breathing Mere · 85,600 · ★ the Banked Fire |
| **11. The Siltway** · 178,000 | the Seam · the Sunk Ferry | ★ Sternlamp Catfish | the Lamp Bar · 76,500 · ★ Dapplewheel Ray | — | the Long Hole · 105,000 · ★ the Barge-Shadow |
| **12. The Salt Gate** · 241,000 | the Bar · the Sluice Throat | ★ Sweetwater Shark | the Harbour Stump · 103,600 · ★ Inkmarble Eel | the Turning Tide (night) · 94,000 · ★ Tideghost Shark | the Slipway · 142,200 · ★ the Old Shipwright |
| **13. Lanternroot Lagoon** · 373,000 | the Bright Flats · the Sunken Orchard | ★ Snagheart Bass | the Stilt Shrine · 160,400 · ★ Votive Shark | the Monsoon Cut (night) · 145,500 · ★ Rootjaw Catfish | the Sighing Pool · 220,100 · ★ the Silver Regent |
| **14. The Waxen Reef** · 496,000 | the Chimney Gardens · the Broken Keel | ★ Anvil Trevally | Lamp Row · 213,300 · ★ Mothlance Gar | the Drowned Spire (old) · 193,400 · ★ Spirewatch Pike | the Abbot's Cellar · 292,600 · ★ the Waxen Abbot |
| **15. The Last Light** · 605,000 | the Lamp Rock · the Drift Line | ★ Nightsail Lancer | the Beam · 260,200 · ★ Castaway Pike | — | the Unlit Mile · 357,000 · ★ the Jetsam Shark |
| **16. The Rime Sound** · 738,000 | the Net Racks · the Fjord Floor | ★ Icedoor Flounder | the Lantern Hole · 317,300 · Coalwing Skate | — | the Half-Mile Line · 435,400 · ★ the Long Winter |

Each cell is the place · its price · what its card names. The other fish at each place (its kind's fish, and the curiosities of roster §6) are in Appendix A.

**Where eleven roster fish bite in play.** The roster gives each fish a kind of place; this spec decides where it bites in play (§12). Eleven fish are moved so that every place earns its price and no card names a common (decision 16). Their looks, names, sizes and hours are the roster's.

| fish | rarity | water | roster | in play | why |
|---|---|---|---|---|---|
| Ambersickle Tuna | rare | the Last Light | open water | night water | the Beam had no night fish (it made you 29% poorer) |
| Starbar Lancer | rare | the Last Light | old water | day water | the Lamp Rock had nothing worth the sail |
| Cabin Grouper | rare | the Waxen Reef | old water | night water | Lamp Row had no night fish |
| Picket Pike | uncommon | the Waxen Reef | open water | the Drowned Spire (its own) | a second old water needs a fish of its own |
| Coalwing Skate | rare | the Rime Sound | old water | night water (the Lantern Hole's card) | the Lantern Hole's card was an uncommon for 97,900 |
| Bouldermouth | uncommon | the Rime Sound | open water | day water | the Net Racks' card was a common |
| Grumbleplate | uncommon | the Thin Water | open water | day water | the Marsh Lanes' card was a common |
| Cocoon Sleeper | uncommon | the Thunder Stair | open water | day water | the Step Pools' card was a common |
| Kitewing Ray | uncommon | the Salt Gate | open water | day water | the Bar's card was a common |
| Lampspot Snakehead | rare | Lampmoss Slough, Pyrefall Gorge | open water | day water | the Straight Canal added 3% |
| Tailwatch Mudfish | uncommon | Lampmoss Slough | open water | night water | the Lock Gate had no night fish |

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
- First it is a screen (slice 1a: a list of sheets; slice 2: the drawn sheet). When the Landing is built it is the Map Table's top (§6.1).

---

## 6. Home: the Landing

### 6.1 The smallest honest home, and how it becomes the Landing

| stage | what home is | built from |
|---|---|---|
| **the Jetty** (slices 1a–3) | A screen over the live scene: the last water's first dock at dawn, Murk's barge moored, your raft tied up. Three ink tiles, one word each: **Murk** · **Chart** · **Journal**. Your clams, top-right. One goal line. Home upgrades you own are drawn on the tiles and in the scene. | Murk's barge and the docks (built: `actors-merchant`, `world.getMerchantDock`), the shop screen, the Journal |
| **the Landing, raft-mode** (slice 4) | The cove of §25.4 as its First Evening slice: quay, jetty, hearth, Murk's barge, the sea-gate and its Waystones. You stay on the raft; the three tiles become three posts you sail up to. Home upgrades are objects in the cove. | the cove world of §25.14.2b (FE-W1; `world.js SUPPORTS_COVE`), `player-cove.js` (built) |
| **the Landing, walked** (later, not planned here) | The full walkable cove of §25.4. | needs the foot controller (parked) |

Home is honest at every stage: it is where Murk is, where the fish become clams and where the water comes back. Only its look grows.

**The trip's end, in the code (slice 1a).** The built market cannot pay the tally: `sellAll` needs Murk moored on the water and a live run, and pays `run.shells`; the cove's `hub` flow exists only with `SUPPORTS_COVE`. So:

- `progression-loop.endTrip()` does the whole sale in one step and one save, **before any animation**: it values `run.hold` by §4.1 plus the doubles, adds the total to `meta.loop.clams`, adds one to `evenings`, ends the run and writes the save. The tally screen only replays the stored result. Test: a reload during the tally pays exactly once.
- A new flow, **`home`**: the last water's scene stays loaded at dawn, survival and combat idle, input goes to the three tiles. `Sail` starts the next trip from it.

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
| **Murk's Order Board** | I 70 · II 400 · III 4,000 | Murk chalks 1 / 2 / 3 **orders**. An order names a fish from a water you own ("2 Dusk Minnows", "a Prize Weeping Carp"). Every fish that fills it **sells for double**. **An order stays until it is filled.** Tap an order to wipe it, and Murk chalks a new one. Nothing counts evenings. Two orders in three ask for common or uncommon fish; orders never name a giant. | a chalk board on the barge; a bigger board; a board on the quay |
| **Bait Bed** | I 120 · II 700 · III 9,000 | Each evening you set out with at least 3 / 6 / 10 of the water's plain bait, free. It tops you up; it does not pile up. | a moss tub by the jetty; two; a planted bed |
| **The Long Wall** | wing I 250 · II 30,000 · III 80,000 · IV 150,000 | One wing per reach (four waters each). A wing hangs your best **ink print** of every fish of its four waters, at true size on its painted ruler (§25.4.3's frames); giants in gold frames. | bare wall, then frames filling with prints, a candle under each |
| **Landing lights** | I 200 · II 1,200 · III 14,000 | Looks only. | jetty lanterns; quay lanterns; the sea-gate beacon |
| **Looks** | Slate Cloak Dye 300 · Oxblood Pennant 400 · Amber Lantern Glass 600 · Painted Prow 2,500 · Bell Buoy 6,000 · Gilt Lantern 40,000 · Reed Sail 50,000 · Star Pennant 100,000 · Moon Lamp 200,000 | Looks only. The first three are `COSMETICS_V3`'s. | on the Wick, the raft and the jetty |

No home upgrade changes what a fish is worth except an order, and no upgrade anywhere adds a percentage to the sale.

### 6.4 Records without giving up the sale: the ink print

You sell what you keep, so nothing is mounted. Instead, at the measure (records are written at the seal stamp, before the card) the Wick takes an **ink print** of the fish. The print is yours whether the fish is kept or let go.

- The Journal keeps the best print per species (length, class seal, where, which evening), and a page of the 49 giants: a dark outline until landed, then its print in a gold frame.
- A Long Wall wing hangs those prints at true size. Until a wing is bought the prints live in the Journal only.
- The class seals (Prize, Trophy, Elder per species; §25.7.4) and the 49 giants are the long goals after the shelf is empty.
- The Live Well, "mark for home", mounts and the keep-pond are parked (§9).

---

## 7. The raft

| part | levels · price | what it does | clams a minute, when bought (pacing) | what you see |
|---|---|---|---|---|
| **The hold** | 4–8 slots · 30 · 120 · 450 · 2,000 · 3,500 | one more slot each; open water gets one more good bite with each | +9% (Hold 4); Hold 5–8 about level (−2% to +3%) but +8–20% a trip | a bigger creel on the deck, then a chest |
| **Oars** | I 60 · II 300 | raft speed +1.5 m/s per level (6 → 9) | +3%, +2% | longer oars, a second pair |
| **Keel** | I 100 · II 600 · III 3,000 | every fish runs a little bigger: favour +0.1 everywhere per level | +4%, +3%, +4% | a deeper keel, then a weighted one with a brass shoe |
| **Lantern** | I 100 · II 500 | night fish run bigger: favour +0.1 after dark per level; the pool of light reaches 15% farther per level | +2%, +2% | a taller lantern with clearer glass |

- **Every part pays its way** (sim section 5 checks it): it adds at least 3% a minute when bought, or it costs at most two trips' income and loses no more than 3% a minute. Quiet Hull is cut; Oars III and Lantern III are cut (each added about 1%).
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
| the Home pill | **Home** | bottom corner, ≥ 56 px. **Press and hold** (0.6 s; a ring of ink fills the pill) to go home; with a full hold a tap is enough. No dialog. Not available during a play. |
| the float | none (favour notches, good-bite dots) | shown when the float settles, cleared at the strike (built) |
| quiet water | none | the float dims; Murk's first quiet-water line teaches it once (§8.6) |
| a full hold | "Hold's full." | on a cast; the Home pill pulses |
| mist | none | a cast into mist sinks the float into the bank and brings it back |
| tackle | none (the lure glyph, the bait glyph with its count) | built selector |
| the Journal glyph | none | locked while a line is in the water (built) |
| gone from the HUD | the oil gauge, satiety, Embers, the level bar, the day counter, the night-mode glyph, the flare button, Far Water | §9 |

### 8.2 The catch card

After the Wick has held the fish up and paused: the built card (name, class stamp and length as the hero, the record kicker in a few words). A giant's card has a gold ★ before its name and its seal stamped in gold.

| button | words |
|---|---|
| keep | **Keep** · clam glyph · the value |
| let go | **Let go** (held on a Small or a Keeper from slice 3: a knife glyph, and it cuts bait) |
| an order is filled by this fish | a chalk-tick glyph beside the value, no words |

Gone from the card: Eat, Render, Release's luck, Mark for home, the Strike line (it moves to the Journal), the favour list (it folds behind the float, built), the third button.

### 8.3 Home

| step | what happens | words |
|---|---|---|
| the sail home | a 2 s glide; the sky pales to dawn | none |
| **the tally** | the fish go onto Murk's scale one by one, biggest last; each value ticks up with a coin sound; then the total. A giant goes last, alone, with a longer pause. A fish that filled an order shows a chalk tick and its value doubles; from slice 9 a ledger glyph does the same for the Old Ledger. | fish names (small), values, the total "+193", one button: **Sold** |
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
| Keel | "Bigger fish." |
| Lantern | "Bigger fish at night." |
| a tin | "For the Thin Water." and, where true, "The Gloam Eel bites on nothing else." |
| a legend's bait | "For the Belled Matriarch. One try." |
| a map | the fish's name (★ for a giant), the hour glyph and the map's line (≤ 8 words, §5.2) |
| Order Board | "Orders pay double." |
| Bait Bed | "Free bait every evening." |
| a wall wing | "Your best prints, on the wall." |
| lights, looks | no line |
| the button | the price. Too dear: the price dimmed, nothing else. Bought: "Yours." |
| tackle and lures | a small **Odds ›** opens the gear log (built), the only place a % shows |

### 8.5 The pause menu and the title

| screen | under the loop |
|---|---|
| the pause menu | **Resume** · **Home** (the tally, as from the pill) · the built settings. *Abandon Descent* is not offered. |
| the title, a trip out | **Continue** only. *New Descent* is not offered while a trip is out. |
| the title, at home | **Continue** (the Jetty) |

### 8.6 Murk's lines (each once, unless noted)

| when | line |
|---|---|
| the first evening, at the Chart | "Three slots in that hold. Fill them and come home." |
| the first sale | "Clams. Spend them here. I'm the only shop left." |
| the first quiet water | "Quiet water. Move on, or go home." |
| the first fish let go | "Let one go and the water remembers." |
| the first Small kept (from slice 3) | "Small ones make good bait. Hold Let go." |
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
data.LOOP_ENABLED  = V3_ENABLED && globalThis.GW_LOOP === true
data.PARKED        = LOOP_ENABLED ? { swarm, combat, levels, embers, hunger, oilAsLife, nightModes, death, farWater, liveWell,
                                      meta, tolls, longDescent, challenges, quality, mercy, passFavour, baitAttract, murkInLake, runShop,
                                      residents, weather, walking, giantSpots, watchLamps, arrivalHush: true … } : {}      (every key true)
```

- **The switch.** `core.js` gets the same rollout switch as v3 (`?loop=1`, `localStorage gloomwater.loop`, a shipped default). When the loop is on, `core.js` also writes `GW_V3 = true` and **`GW_V3_PHASE = 1`** before `data.js` is imported: the loop runs on the phase-1 data and the automatic-fishing code, never on v1 code and never on phase 2–4 data (phase 2 would add the Mossmere's eight built places; phase 3 the relics, the challenges and the welcome purse). Tools (the sim, `validate-data`, the tests) set all three flags themselves; `tools/sim/clams.mjs` already does.
- **Under the loop, `RAFT_FALLBACK_V3`'s stopgap `arena.giantSpots` are never applied** (they would make the Mossmere's open water Elder water), and the watch lamps and lamp-watch are off. Test: on loop data, no Elder rolls anywhere in the Mossmere's open water.
- `validate-data` gets a **LOOP pass in its own process** (`data.js` evaluates once per process).
- Each module reads its own key once (`data.PARKED.swarm`), so one system can come back later by clearing one key. With the flag off the game is exactly today's (v1, or v3 as built): the v1 golden trace, the flag-off scenario run and the v3 scenarios must stay unchanged (§13's gate).

| parked | modules | how it is switched off | its data and saves |
|---|---|---|---|
| **the swarm**: gloomlings, formations, elites, Wardens, Heat, the director | `combat.js`, `combat-enemies.js`, `combat-warden.js`, `combat-fx.js`, `models-swarm.js`, `models-creatures.js` | every trip's night mode is `still` (built: Still spawns nothing at dusk, by day or at night); the director never starts | `ENEMIES`, `FORMATIONS` untouched and still validated |
| **weapons**, the aura's damage, Flare, Zap, Burn-a-fish | `combat-weapons.js`, `combat.js`, `main.js` input | not created; Space, F and taps on the water do nothing but fish | `BOONS` untouched |
| **levels, Cinders, Boons, Kindles**, banked picks | `combat-levels.js`, level-up screens | XP is not granted; no offer ever opens | — |
| **Embers** (health), damage, armour, mending | `survival.js` | no source of damage; the gauge is hidden | — |
| **hunger**, Well-fed | `survival.js` | no drain; hidden; Well-fed's +2 Hold is not applied, so the log shows true odds | — |
| **oil as life**: burn, guttering, Snuffed, Last Flicker | `survival.js`, `survival-fx.js` | no drain; the lantern burns at its level's reach; the gauge is hidden | — |
| **Eat, Render** | `progression.js` `fishAction`, the card | not offered | species `food` / `oil` unused |
| **night modes** (Still / Lantern / Gloomtide), lamp-watch, Scorched | `combat-modes.js`, the mode cards | not shown; the mode is `still` | `BALANCE.nightModes` untouched |
| **death**, the Snuffed screen, Second Wick, epitaphs, *Abandon Descent*, *New Descent* while a trip is out | `survival.js`, `ui-screens.js`, `main.js endRun` | unreachable; a trip ends only through `endRun('home')` (§3.6) | — |
| **days**, the 5-minute day clock, dawn events, the Arrival Hush | `survival.js` | the evening clock replaces it (§3.4) | `EXPEDITION.phases` untouched |
| **Murk in the lake**, selling on the water, his schedule | `progression-market.js` | he does not arrive during a trip | — |
| **the per-run shop** (`UPGRADES`), per-run lures at 40%, the combat kit, supplies (oil, food, chum), start Shells, the waystone purse, a Wick's start kit | `progression-market.js`, `progression.js createRun` | not offered, never granted (old saves' challenge specials included) | `UPGRADES`, `SUPPLIES` untouched |
| **Memories, relics, the Shrine**, Waystone relics | `progression.js`, the Shrine screen | nothing is granted, shown or applied; relic Hold is 0 | `meta.memories`, `meta.relics`, `meta.unlocks` kept in the save, never written; they work again if un-parked |
| **challenges** (48) and their unlocks | `progression-challenges.js` | not evaluated; the Trials screen is hidden | `meta.challenges` kept |
| **bounties in the lake**, Murk's Ledger | `progression-market.js` | replaced by Murk's orders, which reuse the bounty engine (§10) | `BOUNTIES`, `LEDGER` untouched |
| **tolls, descent gates, legend-gated lakes**, travel through the gate | `progression.js` `travel` | waters are reached from the Chart; the gate is scenery | `ZONES[].unlock` unused |
| **quality** (Fine, Shimmering) and the strike streak as value multipliers; release luck (`mercy`); let-it-pass favour; **a bait's attract**; first-catch Shells | `progression.js`, `fishing.js` | not applied (value is §4.1; a bait changes which fish bite only for its bait-only fish; let go has its own forgiving rule, §3.2) | `QUALITY`, `BAITS[].bonus.attract` untouched (the attract list still says which fish a bait helps hold) |
| **Far Water, the Live Well, mark for home, mounts, the keep-pond, The Long Descent**, expeditions of several days | not built (P3) | stay unbuilt | `EXPEDITION`, `LONG_DESCENT` untouched |
| **residents, Astir, weather, rumours as quests, discovery by exploring, mastery, Tally Posts** | not built (P2) | stay unbuilt; places come from maps (§5) | `CONDITIONS`, `RUMOURS` kept (the lines are reused) |
| **walking** (§24), walked places, sister-candles, the Wayfarer | not built | `WALK_ENABLED` stays off | §24 data untouched |
| **proof catches** | `TACKLE.proofs` | not asked for | untouched |

**Saves.** The loop writes one new block and touches nothing else:

```
meta.loop = { v: 3, clams, evenings, holdSlots, tackle: {rod, line, reel}, lures: [], fitted: {lure, bait}, bait: {waterId: {baitId: count}},
              maps: {lakes: [], places: []}, raft: {oars, keel, lantern}, home: {orders, baitBed, wall, lights}, looks: [], orders: [],
              legends: {id: landings}, giants: {id: {landed, marked}}, prints: {speciesId: {…}}, ledgerPaid: [] }
```

- `holdSlots` is the slot count (3–8), not a ladder level.
- **The loadout.** Under the loop `getLoadout` reads `meta.loop.tackle` and `meta.loop.lures` with `perRun: false`; the built `meta.fitted` and `meta.lures` belong to the old game and are left alone. So a legend uses `CATCH_V3.legend.fight` (the Lantern-Swallower fights at 56, as the sim assumes), never `fightRun`.
- A trip is a run with `run.outing = 'trip'` and night mode `still`: its creel is the hold (`run.hold`), plus `run.bites = {waterKey: n}`, `run.mercy = {waterKey: favour}` and `run.eveningT`. `run.shells` is not used. At **Sail**, `run.bait` is copied from `meta.loop.bait[water]` (plus the Bait Bed's free tins); the tally writes what is left back.
- Journal entries, records, class seals, got-away lists, legend wounds and Marked Fish stay where they are (`meta`, built) and are shared with the old game. The Old Ledger's double has its own `ledgerPaid` (§4.1).
- An old save opens in the loop with a fresh `meta.loop` and everything else kept. A v1 or v2 `meta.loop` (from a v4 or v5 build) is migrated: bait counts move under the water they were bought for, `hold` becomes `holdSlots`, `hull` is refunded as clams at its price, the Mossmere's places are kept, and a lake map owned also owns its day and old water.
- **Boot rule (the flag off).** With the flag off, a saved run with `outing: 'trip'` is not continued: its hold is sold into `meta.loop` as at a tally and the run is dropped; `meta.loop` is otherwise left alone. Test in `loop.test.mjs`.

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
| release and its luck (mercy) | **changed** | **Let go forgives**: the bite comes back and the next bites there run bigger (§3.2); mercy luck parked |
| favour and the float's notches | **kept** | the float adds the good-bite dots |
| pressure (−0.12 per catch, reset at dawn) | **changed** | becomes §3.3: per bite, per evening, open water included, reset at home |
| the measuring ceremony, the landing's payoff, the catch show | **kept** | the card follows the show |
| the catch card | **changed** | Keep · value / Let go (held: Cut bait); a giant's card in gold |
| the creel | **changed** | it is the hold: 3 slots, bought to 8, sold whole at home |
| fish value (§25.7.3) | **changed** | §4.1 |
| food and oil from fish | **parked** | — |
| tackle tiers (§25.6.6) | **changed** | persistent, bought with clams at home, no proof catches, new prices; **T5 and T6 added** |
| outfit | **changed** | the raft's parts (§7): Oars, the Keel, the Lantern |
| lures | **changed** | permanent, new prices, fitted beside a bait; the four giants' lures re-aimed; twelve new giants' lures |
| baits | **changed** | a second slot; tins of 10 per water, one price and one favour per water (§4.5); attract parked; Windfall Plum and Tallow Soap added |
| legend baits, the legend rule, wounds, growth | **kept** | 16 legends; new prices; she needs her crown's map; she opens nothing; her first landing pays the map back |
| Old Murk | **changed** | he stays home; the tally and the shelf |
| bounties, Murk's Ledger | **changed** | Murk's orders (§6.3): fishing templates only (`catchSpecies`, `catchRarity`, `class`, `nightFish`), paid as double sale, never a giant, never expiring |
| zones, gates, tolls | **changed** | maps (§5) |
| the four lake arenas | **kept** | as built; twelve more are built on their layouts (§5.3) |
| places (§25.8) | **changed** | 70 places: 30 open with their lake maps, 40 by place maps; mist; no discovery by exploring; eleven roster fish move to a kind of place (§5.2) |
| rumours | **changed** | lines on map cards and sheets |
| day and night | **changed** | the evening (§3.4); the looks of each phase are kept |
| the Journal, records, class seals, the Old Ledger | **kept** | plus the Prints page, the giants' page and "Evening N"; from slice 9 an Old Ledger record pays double once, when sold |
| the Long Wall | **changed** | ink prints, bought by wing, one wing per reach (§6.4) |
| the five Wicks | **changed** | §10.1 |
| fish body plans (`FISH_SHAPES`) | **changed** | 15 new plans and 3 for curiosities, plus the named `sturgeon`, arrive with the slices that need them (§13) |
| curiosities (roster §6) | **new** | bite like fish, take a slot, sell at the water's rare Keeper price, write a *Not fish* page |
| challenges, Memories, relics, the Shrine | **parked** | — |
| the swarm, weapons, levels, Boons, health, hunger, oil as life, night modes, death, Far Water | **parked** | §9 |
| The Long Descent, the Live Well, the keep-pond, walking | **parked** (unbuilt) | — |
| the Landing as a 3D cove (§25.4) | **kept** | home's look; reached in stages (§6.1); the Jetty and a `home` flow first |
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
| **Gear is global; bait and lures are fish-specific** | Unchanged, and now both are fitted at once (§4.4–§4.5). A bait is fish-specific through Hold; it no longer changes the pool, and every tin gives the same favour, so picking a tin is picking a fish. |
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
| §25.0 decision log | kept; rows 11–13 added |
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
| §26.4 and `docs/loop/ROSTER.md` (the roster) | **binding for the fish**: names, looks, plays, sizes, rarities, hours, waters, places and giants. This spec is binding for where they bite in play (eleven fish move, §5.2), what they pay and what the maps cost; the roster deferred prices to it |
| v4 and v5 of this file (commits 1aa478c, 3fc4a12) | **replaced** by v6; the loop, the hold rule and the parked list carry over |
| §1–§24, Appendix A and B | as §25.12 says; everything about combat, survival and the meta is parked (§9) |
| CONTRACT §13 | binding for everything kept; a §14 for the loop's API is written with slice 1a |

---

## 13. The build plan

Ten slices. Each ends playable, behind `GW_LOOP`. **Every slice's gate:** `node tools/validate-data.mjs` (its LOOP pass included), `node tools/check.mjs`, `node tools/sim/clams.mjs --quick` (from slice 1a it reads `data.LOOP`), `node tools/sim/roster-check.mjs`, the slice's browser scenario with no console errors, and **the flag-off checks unchanged**: the v1 golden trace, the flag-off scenario run, and the v3 browser scenarios `run-v3`, `m1-v3` and `af-progression` with the loop off (the loop edits v3's code paths: measure, the loadout, the v3 clock, the v3 card). Sizes: S ≤ 2 days, M 3–6 days, L 1–2 weeks, one implementer per lane. From slice 3 each slice has a **fish lane** (body plans in `models-fish.js`, the species data) beside its systems lane.

**Two rules that let the roster arrive in pieces.** (1) A re-founded built species keeps its built model until its new plan ships (the Matriarch stays carp-shaped until the catfish plan). (2) A new roster species bites only once its body plan exists; until then it is not in the pool, and the sim's pacing for that slice is re-run on what ships.

### Slice 1a: Three slots on the built fish (M). The smallest thing that is already the user's game.

Before any UI, a **node-level trip harness** (`tools/tests/loop-trip.test.mjs`) drives `progression-loop` with a fake `ctx`: cast, bite, measure, keep, let go, `endTrip`, buy. It proves the rules below without a browser.

| | |
|---|---|
| **the player can** | Start at the Jetty. Sail to the Mossmere's open water for an evening. Catch fish automatically (as built). Keep or let go at the card, seeing the clams. Fill three slots; be refused a cast when full. Go home (press and hold). Watch Murk's tally. Buy **Hold 4, Hold 5, Rod, Line and Reel T1 and T2**. Sail again. Close the game mid-trip and continue. Never fail. |
| **waters and fish** | the Mossmere's open water, on the **built phase-1 species** and their built sizes; §4.1 uses the built L50 |
| **new body plans** | none |
| **reuses** | automatic fishing and its logs; the catch card, the ceremony and the landing's payoff; the creel (as the hold); `TACKLE` tiers and `getLoadout`; pressure (as quiet water's pattern); the Still night; the Journal; the built Mossmere arena; Murk's barge at a dock |
| **modules** | `data.js` (`LOOP_ENABLED`, `PARKED`, `LOOP`: value rule and the Mossmere's tier, hold, water, evening, the tackle prices, `TEXT_LOOP`) · `core.js` (the switch; writes `GW_V3` and `GW_V3_PHASE = 1`) · `main.js` (the `home` flow; Jetty → Sail → Home → tally; no death flow; the pause menu and title of §8.5; the boot rule of §9) · new `progression-loop.js` (`meta.loop`, clams, the hold, `endTrip`, the shelf, `run.bites`, `run.mercy`) · `progression.js` (**`measure()` writes records only** and pays no first-catch Shells; **`fishAction('keep' | 'letgo')`** as §3.2; `restorePending` reopens the card; **`createRun` under LOOP**: the zone must be in `meta.loop.maps.lakes`, outing `trip`, night mode `still`, no start Shells, kit, purse or Wick start kit, bait from `meta.loop.bait`) · `progression-market.js` (no Murk on the water) · `progression-af.js` (`getLoadout` from `meta.loop.tackle`, `perRun: false`; parked buffs 0) · `fishing.js` (emits `fishing:bite`; reads `getBitesLeft`; the cast refused when full; no pass favour; no Elders in open water; hour windows) · `survival.js` (parked drains; the evening clock; no hush; the open night) · `combat.js` / `combat-modes.js` (parked) · `ui-hud-v3.js` (slots, the Home pill, dots; parked gauges hidden) · `ui-screens.js` and new `ui-loop.js` (the card's buttons, the tally, the Jetty, the shelf, the Chart as a list) · `tools/validate-data.mjs` (the LOOP pass) · `tools/sim/clams.mjs` (reads `data.LOOP`; its draft table for what has moved is deleted) |
| **tests** (`tools/tests/loop.test.mjs`, the trip harness, browser scenario `loop-1a`) | the hold: 3 slots, the 4th keep refused, the cast refused when full · keep and let go: both write the record; measure leaves the hold unchanged; let go refunds its bite and adds +0.2 favour there, to +0.4; Continue with the card open reopens it · bites: struck, passed, landed, lost and spooked bites each spend one; a lingering re-cast spends from where the fish first bit; quiet after 4 (hold 3); −0.15 each to −1.2; no reset at dusk or night; reset at home · the evening: day 40 s, dusk 20 s, night holds; frozen in the ceremony; a "dusk" fish bites at night, not by day; no hush; no NaN after 10 min of night · value: a Keeper Dusk Minnow (z 0.4) 7 on the built L50 (the roster's sizes arrive in 1b), clams persist; "12.4k" from 10,000 · the tally: `endTrip` pays once; a reload during the tally pays exactly once · the shelf: prices, the order of hold steps, a tier raises `catchChance` · parked: a night with no enemy, no change in oil, satiety or health, no death, no Memories, no Murk on the water, no giant spot in the Mossmere's open water · no path from the pause menu or the title empties a hold without selling it · saves: continue mid-trip; an old save gains `meta.loop` and loses nothing; an old save with start-kit challenges starts a trip with no free bait; a trip saved with the flag on and opened with it off is sold and dropped · the scenario: fresh save → three fish → Home → +clams → Hold 4 → a second trip · **measure the visit home** (the tally fish by fish, the glide, the Jetty, the shelf, the Chart) and write it into `LOOP.time`; re-run the sim |
| **left out on purpose** | roster species and sizes (1b); places, mist and giants; bait and lures (the built selector is hidden); orders; the other raft parts; home upgrades; legends; the cove, the First Evening and the cut scene (owned by the opening lane; the default build flips to the loop only when slice 1b and the opening are both in); the other Wicks |

### Slice 1b: The roster's first fish (S–M), and the Sporewood map.

| | |
|---|---|
| **the player can** | Catch the roster's Mossmere and Sporewood fish at their roster sizes. Buy the **Sporewood map** and sail to Sporewood's open water. Pick a water on the Chart. |
| **waters and fish** | every roster fish of the Mossmere and Sporewood on a built plan (the Mossmere: Dusk Minnow, Mossback Perch, Likely Chub, Overbold Bass, Rustfin Sucker, Milkeye Perch, Weeping Carp, Reedjaw Pike; Sporewood: Netcloud Fry, Threadling Eel, Velvet Ray on the built ray) and the built species the roster keeps there; the roster's re-founded sizes. 11 roster fish. (Sporewood's day and old water open with its map from slice 2, when places exist.) |
| **the converter** | one shared module, **`src/roster-species.js`**, `rosterSpecies(roster, builtSpecies)`, imported by `data.js` and by `tools/sim/clams.mjs` so the game and the sim cannot drift. Its rules are the table below. |
| **the allow-list** | the converter copies only `id, name, look, journal, haunt, play, sizes, hours, place, rarity, family, bodyPlan` (and `water`, `placeName`, `giant`). **`giantOf`, `inspiredBy`, `draft` and every research field stay in `docs/`.** `validate-data` fails if `giantOf`, `inspiredBy`, any episode title or any research common name appears anywhere in `src/` (the game ships as one HTML file). |
| **modules** | `src/roster-species.js` (new) · `data.js` (`SPECIES_LOOP` from the converter; the Sporewood map and tier) · `progression-loop.js` (maps owned; `createRun` starts in the water tapped) · `ui-loop.js` (the Chart's list of sheets) · `tools/validate-data.mjs` (the allow-list rule; every map card's named fish exists in loop `SPECIES`) · `tools/sim/clams.mjs` (imports the converter) |
| **tests** | the worked values of §4.1 on the roster sizes (Weeping Carp 26, Reedjaw Pike 158 / 406 / 1,022) · Sail with the Sporewood map starts in Sporewood · no forbidden field in `src/` · the converter's output equals the sim's species table for the slice's fish |

**The converter's rules.**

| roster field | game species field | rule |
|---|---|---|
| `play` ("Sulker. …") | `style` | the first word, lower case (`sulker`, `darter`, `steady`, …); a legend keeps `CATCH_V3.legend.style` |
| `hours` | `time` (a window list) | "day" → day, dusk · "dusk" → dusk, night · "night" → night · "day, dusk" and "dusk, night" as written · "any" → all · "any, best at night" → all, ×1.5 after dark (§3.4) |
| `haunt` | `depth` | any depth under the loop (the sim has no cast depth); the haunt text stays for the Journal |
| `favours` | `baits` (Hold list) and `bait` (bait-only) | a tin named in the text is a Hold bait; "bites on X only" makes X its only bait |
| `sizeModel` | `size` | `L50`, σ and the class ladder as the roster gives them |
| `water` (a list) | `zones` (a list) | a fish of two waters (the Lampspot Snakehead) has both |
| `place`, `placeName`, `giant` | `kind`, `place`, `giant` | as the roster, except the eleven moves of §5.2 |
| built `cond` (§25.8 place conditions: deed, reflection, plumbBottom …) | — | ignored under the loop |
| built `src: 'walk'` | — | the kept walk species the map cards name (the Wax-Bearer, the Clapper, the Unreflected, the Footnote, Hushcap Koi) are included under the loop |

### Slice 2: The mist lifts (L). Places, maps and the first giants.

| | |
|---|---|
| **the player can** | See mist banks in the Mossmere, with a giant's back turning in one. Buy the Lily Maze, Under the Span, the Buoy Lights and the Bell Pool from a shelf of at most three map cards, each naming its fish. Watch the mist lift. Meet the **Thousandcast Pike** and the **Hullkiss Lamprey**; land one; see its gold card and the Journal's giants page. Meet Elders in old water. Hunt the Belled Matriarch with Heartmoss and be paid 500 for her at the tally. Use the drawn Chart. Sporewood's map now lifts its two banks: the Lullaby and the Gill Harp. |
| **waters and fish** | the Mossmere's four places; its 2 epic giants and its legend; Kissmark Trout, Gloam Eel (night water), Bridgechain Sturgeon (Under the Span's own); Sporewood's day and old water and the Harpstring Eel |
| **new body plans** | **lamprey** (the eel with a mouth parameter: S), **sturgeon** (named, now built: M; Bridgechain first), **trout** (the minnow with a fatty fin and jaw: M; Kissmark Trout first) |
| **modules** | `data.js` (`LOOP.places` for the Mossmere from `MOSSMERE_V3` geometry, and Sporewood's two; giant shares; map cards; place pools: commons ×0.5, a day water's draw ×1.5) · `world.js` / `world-v3.js` / `world-fx.js` (mist banks from the built mist material; the giant's back in the mist; the landmark silhouettes that exist) · `fishing.js` (`placeAt` from `LOOP.places`; good bites and favour by kind; draws; a place's own species; night water; Elders by kind and for giants; the giant's share, floor, favour and Fight; a cast into mist) · `models-fish.js` (three plans) · `render-camera.js` (the mist-lift shot) · `ui-loop.js` (the Chart's sheet, blots, the Maps tab, the gold card) · `progression-loop.js` (maps owned, giants landed, the legend's prize at the tally, wounds) |
| **tests** | a cast into mist returns and spends nothing · owning a map removes its mist and adds its good bites · a lake map lifts its day and old water · Elders roll only in old water and for a giant at its own place · a giant never bites elsewhere and is never Small · over 20,000 bites at Under the Span the Thousandcast share is 6% ± 1 at dusk and night, 2.5% ± 0.7 by day · the Thousandcast at Prize lands less often than every other Mossmere fish on T1 · night water gives nothing before dark · the shelf never shows more than three maps · the Matriarch needs her pool, her bait, her hour and a free slot · her first-try chance at T1 equals the sim's 27% · draw calls inside §25.8.8's Mossmere line |
| **left out** | place twists, Moonfall, the harbour re-dress, the other waters' places |

### Slice 3: Bait, lures and the raft (M), and Sporewood's fish.

| | |
|---|---|
| **the player can** | Fit a lure and a bait. Buy tins for a water and permanent lures, among them the re-aimed Harbour-Bell Spinner. Cut a Small into bait by holding Let go. Buy Oars, the Keel and the Lantern and see them on the raft. Buy the Order Board and fill Murk's orders for double. Read the gear log at the shelf. Catch all of Sporewood's open-water roster fish; see the Matriarch as a catfish and the Velvet Ray as a disc. |
| **waters and fish** | Sporewood's open water complete: Cindertail Catfish, Downcast Catfish, Falsesmile Barb, Lostsea Mackerel (4 new) |
| **new body plans** | **catfish** (31 fish; a new builder from the pike profile: L), **bream** (11; the perch with depth and jaw: M), **disc** (8; the built ray rounded: M), **tuna** (4; the minnow with finlets: M) |
| **modules** | `data.js` (`LOOP.lures`, `.baitRule`, `.raft`, `.home.orders`; the giants' lure lists) · `progression-loop.js` and `progression-market.js` (tins per water, orders on the bounty engine, no expiry) · `progression-af.js` and `fishing.js` (two fitted items; bait favour; cut bait; bait attract parked) · `actors-raft.js` (the parts' models) · `player.js` (raft speed) · `models-fish.js` (four plans) · `ui-loop.js`, `ui-af.js` |
| **tests** | lure and bait Hold never stack (the larger counts) · a bait is spent per hooked fish and comes back on a pass · a bait changes the pool only for its bait-only fish · every tin in a water costs 1.5 × its tier · the Keel adds +0.1 favour a level everywhere · family lures do not raise a giant's share; its giants' lure does, ×1.5 · an order doubles exactly the fish that fill it, never names a giant and never expires · the sim's bait rows hold on real data |
| **left out** | the Bait Bed; new waters' baits |

### Slice 4: Home (L). The Landing in raft mode.

| | |
|---|---|
| **the player can** | Open the game with the cut scene and the First Evening (with the three changed lines). Come home to the cove at dawn and sail up to Murk, the Chart and the Journal. Buy the Bait Bed, the Landing lights, the first wing of the Long Wall and the looks, and see each in the cove. See a Waystone light for each water owned. Browse ink prints and the giants' page. |
| **needs** | the cove world (FE-W1, `SUPPORTS_COVE`), from the opening lane |
| **new body plans** (fish lane, ahead of slice 5) | **snakehead** (6; the eel thickened: M), **gar** (4; the pike with a snout: S) |
| **modules** | `world.js` (cove objects per home level; four Waystone arcs) · `main.js` and `first-evening.js` (the loop's lines and flow; the `home` flow moves into the cove) · `player-cove.js` · `ui-loop.js` (posts for tiles; the Prints page) · `ui-fishart.js` (the print, the gold frame) · `progression-loop.js` (prints at the measure) · `models-fish.js` |
| **tests** | the First Evening ends in the first trip in under 60 s · a print is written for a kept and for a let-go fish · the best print per species wins · every home level changes the scene · the cove's draw calls inside §25.4.7 |
| **left out** | walking at home; wings II–IV (they come with their reaches) |

### Slice 5: The old kingdom, complete (L). The built lakes' places, T3–T5, three legends.

| | |
|---|---|
| **the player can** | Buy Glasswater and the Pallid Deep (each lifting its day and old water); buy the eight remaining built place maps (Sporewood 3, Glasswater 3, the Pallid Deep 2), T3, T4 and T5, the Spore-Lamp Fly, Mirror Shard and Ferryman's Coin, the Moth Popper and Lantern Lure, and hunt the Drifting Grove, the Glass Sovereign (now a sturgeon) and the Lantern-Swallower. Meet six more giants. The first reach is done. |
| **waters and fish** | Sporewood's places and giants (Harpstring Eel, Festival Puffer, Emberbrood Snakehead); Glasswater's fish (Rosefleck Trout, Duskbar Salmon, Redhome Salmon, Tremor Catfish, Pilgrim Salmon as a trout) and giants (Shardspine Eel, Wolfwake Trout, Prismdrop Sturgeon); the Pallid Deep's (Slipknot Eel) |
| **new body plans** | none (all of reach I's plans are in) |
| **modules** | `data.js` (the re-sited places, validated against `world-layout`) · `world-art.js` (a landmark per place, in the lake's kit) · `fishing.js` (nothing new) · `tools/validate-data.mjs` (every place: open water ≥ 80%, a dock within reach, prices rising within a water, every giant has a place, every roster fish of the slice has a map) · `tools/sim/clams.mjs` (the pacing run on real data: §4.9's targets to the Rushlight Fen map are the gate, with section 6's ladder checks) |
| **tests** | the pacing checks to hour 16 pass on `data.LOOP` · each built water's places exist, lift and fish · the species count per water matches Appendix A · the Lantern-Swallower's first-try chance at T4 equals the sim's 17% |
| **left out** | the later sheets |

### Slice 6: The fresh waters (L+). Waters 5–8.

| | |
|---|---|
| **the player can** | Buy Rushlight Fen, the Thin Water, Lampmoss Slough and Pyrefall Gorge, their 8 place maps, four giants' lures and four legend baits, the Long Wall's second wing. Meet 6 giants (Packtooth, Weirflame, Weirshadow Catfish, Old Portcullis, Pyregold Carp, and the Unfinished, the gorge's one that got away) and 4 legends (the Long Thunder, the Buried Moon, the Last Sentry, the Ashen Guest). Find the Potlid Turtle and the Stone Lodger. |
| **waters and fish** | 4 arenas; 33 roster fish (Old Portcullis moves from the Mossmere's later sheet) and 2 curiosities |
| **new body plans** | **dogtooth** (6; the perch stretched with a teeth row: M); curiosities **softshell**, **salamander** (S each) |
| **arena work** | each water: a `ZONES` entry on a built layout, its island and pillar kinds (the dam, the broken weir, the lock gate, the pyres), palette and grade, docks, places, crown |
| **modules** | `data.js` (4 zones, 16 places, species, lures, baits) · `world-art.js` (new kinds) · `world.js` (arena build for new zones) · `models-fish.js` · `models-kit.js` · `tools/validate-data.mjs` · `tools/sim/clams.mjs` |
| **tests** | the pacing and ladder checks to hour 30 · every new water's giant at Prize lands less often than its other fish on T5 · each new water is the best water from the day its map is bought · draw calls per water inside §25.8.8 |
| **left out** | reaches III–IV |

### Slice 7: The great rivers (L+). Waters 9–12.

| | |
|---|---|
| **the player can** | Buy the Thunder Stair, the Inkwood, the Siltway and the Salt Gate, their 10 place maps (two fifths: the Overhang, the Turning Tide), T6, Windfall Plum and Tallow Soap, four giants' lures and legend baits, the third wing. Meet 10 giants and 4 legends (the Last Lock, the Banked Fire, the Barge-Shadow, the Old Shipwright). Find Little Logjaw and the Mudlark Crab; glimpse the Long Coil; find a Gill Lodger in a big Siltway catfish. |
| **waters and fish** | 4 arenas; 48 roster fish, 3 curiosities and the Gill Lodger |
| **new body plans** | **shark** (7; a new builder: L), **sawfish** (1; the shark with a saw: M) |
| **modules** | as slice 6, plus `ui-loop.js` (the Gill Lodger's second card) |
| **tests** | the pacing and ladder checks to hour 42 · T6 on the shelf with the Inkwood · the Gill Lodger shows on about 1 in 8 Prize+ Siltway catfish and never bites on its own |
| **left out** | reach IV |

### Slice 8: The sea (L+). Waters 13–16.

| | |
|---|---|
| **the player can** | Buy Lanternroot Lagoon, the Waxen Reef, the Last Light and the Rime Sound, their 10 place maps (two fifths: the Monsoon Cut, the Drowned Spire), four giants' lures and legend baits, the fourth wing. Meet 9 giants and 4 legends (the Silver Regent, the Waxen Abbot, the Jetsam Shark, the Long Winter). Find the Paper-Lantern Jelly and the Guttering Squid; lose the Unlit Lance. Finish the shelf at about hour 48. |
| **waters and fish** | 4 arenas; 43 roster fish and 3 curiosities |
| **new body plans** | **jack** (5; M), **billfish** (3; the tuna with a bill: M), **cod** (5; M), **flatfish** (2; a new builder: M); curiosity **squid** (S) |
| **modules** | as slice 6 |
| **tests** | the full pacing run passes on `data.LOOP` (every check of §4.9 and sim section 6) · `roster-check.mjs` and the sim's "every roster fish has a map" pass on the shipped data |
| **left out** | the later sheets |

### Slice 9: The long tail (each item ships alone, S–M).

The four other Wicks (§10.1) · the Old Ledger's double (`ledgerPaid`) and its ledger glyph · one twist per place (the built §25.8 ideas) · the later sheets (seven places, five built species) · weather as "tonight's water" on the Chart · the ink-print beat in the catch show.

**If the swarm comes back.** It returns as a choice on the Chart ("a quiet evening" or "a Gloomtide evening") by clearing `PARKED.swarm`, `.combat`, `.levels` and `.embers`. Nothing in this spec has to move.

**What each slice brings** (roster fish that can bite at the end of it; giants include legends):

| slice | waters | roster fish | giants | new plans |
|---|---|---|---|---|
| 1a | the Mossmere's open water (built species) | 0 | 0 | — |
| 1b | + Sporewood's open water | 11 | 0 | — |
| 2 | + the Mossmere's places, Sporewood's day and old water | 17 | 4 | lamprey, sturgeon, trout |
| 3 | Sporewood's open water complete | 21 | 4 | catfish, bream, disc, tuna |
| 4 | — | 21 | 4 | snakehead, gar |
| 5 | reach I complete | 41 | 12 | — |
| 6 | reach II | 74 | 22 | dogtooth (+ softshell, salamander) |
| 7 | reach III | 122 | 36 | shark, sawfish |
| 8 | reach IV | 165 entries, all 164 fish | 49 | jack, billfish, cod, flatfish (+ squid) |

---

## 14. Risks, and the knobs

| # | risk | guard, and the knob |
|---|---|---|
| 1 | **Slice 1a changes how the built game works** (measure, the card, `createRun`, the loadout, the clock) and is the riskiest slice, not the art. | Split from the roster's species (1b); the node trip harness before any UI; the v3 scenarios in every gate; the boot rule for a loop save opened with the flag off. |
| 2 | **Quiet water feels like being told to stop.** | It never stops the fishing; the dots make it readable; the first quiet water is taught by Murk as advice; a fish let go lights its dot again. Knobs: `LOOP.water.good` (per kind), `openExtra`, `stale.favour`, `letGo`. The sim's anti-grind and choosy checks say how far each can move. |
| 3 | **Twelve new arenas are the largest art cost in the plan** (slices 6–8). | Each is a built layout, kit pieces and new landmark kinds; places ship as data with mist first. If a reach slips, the shelf ends at the last shipped water and the giants' page shows the rest as outlines. (Question 1, §16.) |
| 4 | **Late numbers are large** (a Trophy giant at the Rime Sound sells for about 203,000; its lake map costs 738,000). | "12.4k" and "1.2m" on screen; the tally counts up. Knob: the value tiers are a single table set by the two ladder rules; lowering the open-water rule from 1.05 to 1.0 makes the late numbers about 30% smaller (the Rime Sound's tier 882). (Question 3, §16.) |
| 5 | **The visit home is longer than the sim's 44 s.** A slower home makes bigger holds and choosy play worth more per minute, and every pacing number moves. | Slice 1a measures it and writes it into `LOOP.time`; the sim is re-run before slice 2. |
| 6 | **Fourteen new body plans** (and four for curiosities) before the roster is whole. | Rule 2 of §13: a fish bites only once its plan exists, so no slice waits for all of them. Order by fish served: catfish, bream, disc, snakehead, shark. |
| 7 | **Elders and giants are too hard without the parked relic and Boon Hold.** | The sim lands the first giant at about hour 1.4 and about 70 by the end. Knob: `LOOP.craft` (0–3 extra Hold on every fish), off at first; `LOOP.giant.fight` (10). |
| 8 | **The numbers rest on a model** (±10%, §4.9). | Slice 1a moves the tables into data and the sim reads them; slices 5–8 re-prove the pacing and the ladder on the real game, reach by reach. |

---

## 15. Where the proposals disagreed

v4's rulings on the three proposals stand, the roster brought new ones, and v6 revised four (§0.1).

| question | economy | maps | trip and home (its sims) | decided | why |
|---|---|---|---|---|---|
| fish values | steep: e^(0.9·z), no normaliser | today's flat values | a placeholder ladder | **steep, and now tier × rarity × body** | "big and rare fish"; the roster's rarities and sizes |
| what quiets water | every bite; 4 good bites everywhere | each landed fish; about 3 per place | — | **every bite but a let go; open water one per slot plus one, 2 day, 3 old, 2 night, 2 crown** (v6) | counting catches leaves free re-rolls; with 4 everywhere choosy play beats natural play per trip |
| the clock | a trip is day or night at random | "wait for dusk" at the table | a trip starts before dusk | **every trip is an evening; night holds** | no skip button, the best light every trip |
| the catalogue | 3 charts + 26 place maps | 3 lake maps + 16 place maps | — | **15 lake maps + 40 place maps; a lake map opens its day and old water** (v6; v5: 15 + 70; v4: 3 + 16) | the roster's 16 waters; one pattern of four places, a fifth where a giant needs one |
| price scale | Sporewood 1,000 · Glasswater 7,000 · Pallid 28,000 | 400 · 1,200 · 2,800 | — | **2,000 · 10,200 · 26,000, then 33,300 … 738,000** (v6: lake maps that open three places) | re-fitted to this sim; no wait above 90 min |
| a lake needs a place of the lake before | — | yes, one | — | **no** | clams are the only key |
| the hold | 3 → 10 | 3 → 7 | 3, 4, 5, 8 tried | **3 → 8** | trips stay under 6 minutes, the visit home included |
| raft parts | Oars, Quiet Hull, Lantern, Moss Lining (+5% sale) | hold, bait box, oars, lamp | — | **hold, Oars, Keel, Lantern** (v6: Quiet Hull cut) | no percentage on the sale anywhere |
| home | Order Board, Bait Bed, Long Wall, cosmetics | sheets pinned, Waystones lit | — | **both** | the user listed the home |
| a place you do not own | a named blank on Murk's table | standing mist | — | **mist in the world, with its giant's back; an unnamed blot on the Chart** | the water sells the map |
| legends | — | one per lake, behind the crown map; pays the map back | — | **kept, for all 16 waters** | a crown, never a key |
| **the roster: where giants live** | — | — | — | **one place each; the six later-sheet giants get fifth places** | "every roster fish lives on at least one map" |
| **the roster: built prices** | — | — | — | the roster said keep them; **this spec re-prices three lakes** | the roster deferred prices to the spec; the Mossmere's are kept |
| **the roster: new waters as lake maps or spot maps** | — | — | — | **lake maps; their places are the spot maps** | each water has its own look, legend and places in the roster |
| Murk on the water · records at the measure · kept stays kept · small fish as bait | agreed by all | | | **taken** | |

---

## 16. Questions only the user can answer (each with the default this spec builds)

v4's five questions were answered on 13 November 2026 ("Yes to all five loop rules") and are decisions now. The roster and v6 raise these:

1. **Should each of the twelve new waters be a full 3D lake of its own** (its own arena, palette and landmarks: the largest art job in the plan), or should some become places inside the four built lakes? **Default: all twelve are full waters, built on the four arena layouts that exist, in three reaches of four (slices 6–8).**
2. **Is about 48 hours to buy everything the right length** (the four built lakes by hour 16, then a new water every 2–3 hours)? **Default: yes.**
3. **May late fish sell for hundreds of thousands of clams** (a Trophy giant of the Rime Sound for about 203,000, shown as "203k"; its lake map 738k)? The other way is to let a new water's first evening only match the old water (not beat it by 5%), which makes the late numbers about 30% smaller. **Default: yes, with "k" and "m" on screen.**
4. **Should a lake map open its day water and old water at once** (two mist banks lift on the first evening, and the shelf has 55 maps), or should those stay separate place maps (70 maps) and the first evenings on a new water be poorer than on the old one? **Default: they open with the lake.**

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


**2. Sporewood Pools** (value tier 11)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Drifting Grove | legendary | day, dusk | The Mother's Cup | — | — | — | — | pays 2,200 |
| ★ Emberbrood Snakehead | epic | day, dusk | The Puffball Vent | — | 233 | 573 | 1,472 | 3,701 |
| ★ Festival Puffer | epic | night | The Veilwater | — | 190 | 468 | 1,202 | 3,021 |
| ★ Harpstring Eel | epic | any, best at night | The Gill Harp | — | 252 | 619 | 1,590 | 3,998 |
| Downcast Catfish | rare | day, dusk | open water | 39 | 114 | 280 | 719 | 1,807 |
| Hushcap Koi (built) | rare | night | The Veilwater | 31 | 91 | 225 | 577 | — |
| Lostsea Mackerel | rare | day, dusk | open water | 39 | 114 | 280 | 719 | 1,807 |
| Mildew Angler (built) | rare | night | open water | 34 | 100 | 246 | 632 | 1,590 |
| Nightbloom Carp | rare | night | night water | 38 | 111 | 272 | 700 | — |
| Sleepspore Jelly (built) | rare | day, dusk | open water | 25 | 74 | 183 | 469 | 1,179 |
| Cindertail Catfish | uncommon | any | open water | 14 | 43 | 105 | 269 | 676 |
| Threadling Eel | uncommon | any | open water | 16 | 46 | 112 | 289 | 726 |
| Velvet Ray | uncommon | any | open water | 13 | 39 | 96 | 247 | 622 |
| Capshell Crayfish (built) | common | any | open water | 4 | 12 | 28 | 73 | 183 |
| Falsesmile Barb | common | day, dusk | open water | 4 | 11 | 27 | 68 | 172 |
| Netcloud Fry | common | any | open water | 3 | 9 | 23 | 60 | 150 |
| Plumgill Perch (built) | common | any | open water | 5 | 15 | 37 | 94 | 236 |
| Sporebelly Puffer (built) | common | any | open water | 4 | 12 | 29 | 74 | 187 |


**3. Glasswater Vault** (value tier 16)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Glass Sovereign | legendary | night | The Fallen Chandelier | — | — | — | — | pays 7,500 |
| ★ Prismdrop Sturgeon | epic | any | The Well of Ledgers | — | 415 | 1,021 | 2,622 | 6,592 |
| ★ Shardspine Eel | epic | dusk, night | The Mirror Nave | — | 357 | 879 | 2,258 | 5,675 |
| ★ Wolfwake Trout | epic | dusk, night | The Broken Hymnal | — | 366 | 901 | 2,313 | 5,816 |
| Pilgrim Salmon | rare | dusk | open water | 50 | 147 | 362 | 929 | 2,336 |
| Rainglass Darter | rare | day, dusk | day water | 36 | 105 | 257 | 661 | — |
| The Blind Scrivener (built) | rare | any | open water | 51 | 150 | 370 | 950 | 2,389 |
| The Footnote (built) | rare | any | The Well of Ledgers | 46 | 134 | 330 | 848 | 2,132 |
| The Unreflected (built) | rare | any | The Mirror Nave | 49 | 146 | 358 | 920 | 2,313 |
| Vesper Gar | rare | night | night water | 55 | 162 | 399 | 1,026 | — |
| Chime Jelly (built) | uncommon | day, dusk | open water | 17 | 49 | 121 | 311 | 782 |
| Mirror Pike (built) | uncommon | any | open water | 24 | 71 | 175 | 449 | 1,128 |
| Redhome Salmon | uncommon | day, dusk | open water | 17 | 50 | 122 | 314 | 790 |
| Rosefleck Trout | uncommon | day, dusk | open water | 18 | 54 | 134 | 343 | 862 |
| Tremor Catfish | uncommon | night | open water | 21 | 62 | 152 | 391 | 984 |
| Duskbar Salmon | common | day, dusk | open water | 8 | 24 | 60 | 155 | 389 |
| Glassblown Puffer (built) | common | any | open water | 6 | 18 | 44 | 112 | 282 |
| Glassgill Perch (built) | common | any | open water | 8 | 22 | 55 | 142 | 356 |
| Prism Minnow | common | any | open water | 5 | 14 | 34 | 87 | 218 |


**4. The Pallid Deep** (value tier 35)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Lantern-Swallower | legendary | night | The Bottomless | — | — | — | — | pays 19,000 |
| Candlewake Sturgeon (built) | rare | night | The Chain Garden | 150 | 441 | 1,086 | 2,788 | 7,010 |
| Funeral Veil (built) | rare | night | open water | 91 | 267 | 656 | 1,684 | 4,233 |
| Lampwarden Angler (built) | rare | night | open water | 119 | 349 | 858 | 2,204 | 5,542 |
| The Clapper (built) | rare | night | The Sunken Belfry | 113 | 334 | 822 | 2,111 | — |
| The Wax-Bearer (built) | rare | any | The Bier Barge | 150 | 441 | 1,086 | 2,788 | — |
| Gilt-Eyed Eel | uncommon | any | old water | 65 | 193 | 474 | 1,217 | 3,059 |
| Shroud Ray (built) | uncommon | any | open water | 55 | 163 | 400 | 1,027 | 2,581 |
| Bonecrook Crayfish (built) | common | any | open water | 13 | 39 | 96 | 245 | 617 |
| Ossuary Fry (built) | common | any | open water | 12 | 36 | 88 | 227 | 570 |
| Pallid Wraithfin | common | any | open water | 17 | 51 | 124 | 319 | 803 |
| Slipknot Eel | common | any | open water | 14 | 41 | 100 | 257 | 647 |


**5. Rushlight Fen** (value tier 86)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Long Thunder | legendary | night | The Dam Foot | — | — | — | — | pays 19,600 |
| ★ Packtooth | epic | day, dusk | The Run | — | 1,663 | 4,091 | 10,506 | 26,412 |
| Foamnest Pike | uncommon | day | day water | 70 | 206 | 508 | 1,304 | — |
| Reedwalker Catfish | uncommon | dusk, night | night water | 117 | 345 | 849 | 2,181 | — |
| Basket Fry | common | day | open water | 25 | 74 | 182 | 467 | 1,174 |
| Blushing Bream | common | day, dusk | open water | 29 | 85 | 208 | 534 | 1,343 |
| Hingecreak | common | any | open water | 27 | 80 | 196 | 503 | 1,265 |


**6. The Thin Water** (value tier 74)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Buried Moon | legendary | day, dusk | The Moonbed | — | — | — | — | pays 24,000 |
| ★ Weirflame | epic | day, dusk | The Broken Weir | — | 1,501 | 3,692 | 9,482 | 23,838 |
| Blotback Catfish | rare | night | night water | 227 | 669 | 1,644 | 4,223 | — |
| Frostfleck Nipper | uncommon | any | open water | 53 | 155 | 380 | 977 | 2,455 |
| Grumbleplate | uncommon | any | day water | 71 | 210 | 517 | 1,328 | — |
| Slipwhisker | uncommon | dusk, night | open water | 87 | 255 | 627 | 1,610 | 4,047 |
| Thorntail Ray | uncommon | dusk, night | open water | 72 | 213 | 524 | 1,345 | 3,382 |
| Coinback Ray | common | any | open water | 35 | 103 | 253 | 650 | 1,635 |
| Flatbill Catfish | common | dusk, night | open water | 26 | 77 | 189 | 484 | 1,217 |
| Inkthumb | common | day | day water | 31 | 91 | 223 | 574 | — |


**7. Lampmoss Slough** (value tier 103)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Last Sentry | legendary | day, dusk | The Sentry's Reach | — | — | — | — | pays 34,500 |
| ★ Old Portcullis | epic | night | The Lock Gate | — | 2,025 | 4,981 | 12,791 | 32,157 |
| ★ Weirshadow Catfish | epic | any | Under the Weir | — | 2,090 | 5,139 | 13,198 | 33,180 |
| Lampspot Snakehead | rare | day, dusk | day water | 322 | 947 | 2,329 | 5,981 | — |
| Spotmail Gar | uncommon | day | day water | 136 | 402 | 988 | 2,536 | — |
| Tailwatch Mudfish | uncommon | any | night water | 124 | 365 | 898 | 2,307 | — |
| Hearsay Sunfish | common | day | open water | 33 | 97 | 238 | 611 | 1,535 |
| Scrapwhisker Catfish | common | any | open water | 56 | 165 | 407 | 1,045 | 2,627 |
| Startle Carp | common | day, dusk | open water | 61 | 179 | 439 | 1,128 | 2,837 |


**8. Pyrefall Gorge** (value tier 223)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Ashen Guest | legendary | night | The Last Pyre | — | — | — | — | pays 42,400 |
| ★ Pyregold Carp | epic | day, dusk | The Coin Run | — | 4,592 | 11,295 | 29,005 | 72,917 |
| ★ The Unfinished | epic | night | The Boulder Garden | — | 4,659 | 11,460 | 29,429 | 73,984 |
| Lampspot Snakehead | rare | day, dusk | day water | 696 | 2,050 | 5,043 | 12,949 | — |
| Almsfed Carp | uncommon | day, dusk | day water | 282 | 829 | 2,040 | 5,239 | — |
| Pipsqueak Catfish | common | any | open water | 65 | 192 | 472 | 1,211 | 3,045 |
| Puddle Snakehead | common | any | open water | 65 | 192 | 472 | 1,211 | 3,045 |


**9. The Thunder Stair** (value tier 166)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Last Lock | legendary | day, dusk | The Throat | — | — | — | — | pays 52,000 |
| ★ Lampeye Perch | epic | dusk, night | The Cauldron | — | 3,566 | 8,771 | 22,525 | 56,627 |
| ★ Soapthief | epic | night | The Soap Landing | — | 3,316 | 8,156 | 20,945 | 52,656 |
| Cocoon Sleeper | uncommon | any | day water | 250 | 735 | 1,807 | 4,641 | — |
| Swallowtail Catfish | uncommon | dusk, night | open water | 201 | 591 | 1,454 | 3,733 | 9,384 |
| Cradlemouth Bream | common | day | day water | 64 | 189 | 464 | 1,192 | — |
| Sidepool Snakehead | common | any | day water | 58 | 172 | 423 | 1,086 | — |
| Stairhopper | common | day | open water | 48 | 143 | 351 | 902 | 2,267 |


**10. The Inkwood** (value tier 245)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Banked Fire | legendary | day, dusk | The Breathing Mere | — | — | — | — | pays 85,600 |
| ★ Emberbelly | epic | day, dusk | The Kitchen Stair | — | 5,045 | 12,409 | 31,866 | 80,111 |
| ★ Nightcreek Hound | epic | night | Rootgate Creek | — | 4,411 | 10,849 | 27,860 | 70,038 |
| ★ Smilejaw Bream | epic | day, dusk | The Overhang | — | 4,148 | 10,202 | 26,200 | 65,865 |
| Gourdcracker | rare | day, dusk | day water | 649 | 1,910 | 4,697 | 12,063 | — |
| Inkside Nipper | uncommon | any | open water | 204 | 600 | 1,476 | 3,789 | 9,526 |
| Starback Ray | uncommon | any, best at night | open water | 282 | 831 | 2,045 | 5,252 | 13,203 |
| Windowtail Perch | uncommon | day | open water | 243 | 715 | 1,759 | 4,517 | 11,356 |
| Ditch Hound | common | any | open water | 90 | 266 | 655 | 1,683 | 4,230 |
| Gourdseed Minnow | common | any | open water | 72 | 211 | 518 | 1,331 | 3,346 |
| Petal Bream | common | day | open water | 79 | 233 | 573 | 1,471 | 3,699 |


**11. The Siltway** (value tier 309)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Barge-Shadow | legendary | night | The Long Hole | — | — | — | — | pays 105,000 |
| ★ Dapplewheel Ray | epic | night | The Lamp Bar | — | 6,902 | 16,977 | 43,598 | 109,604 |
| ★ Sternlamp Catfish | epic | any, best at night | The Sunk Ferry | — | 6,548 | 16,105 | 41,358 | 103,972 |
| Millstone Catfish | rare | dusk, night | open water | 965 | 2,841 | 6,987 | 17,943 | 45,109 |
| Snufferjaw | rare | day, dusk | day water | 862 | 2,539 | 6,246 | 16,039 | — |
| Tallyside Catfish | rare | night | night water | 898 | 2,644 | 6,502 | 16,698 | — |
| Boathook Catfish | uncommon | any | open water | 356 | 1,049 | 2,579 | 6,624 | 16,652 |
| Hullknock Perch | uncommon | dusk, night | open water | 319 | 939 | 2,309 | 5,930 | 14,907 |
| Waxcomb Ray | uncommon | any | open water | 328 | 966 | 2,377 | 6,104 | 15,346 |
| Bareface Catfish | common | day, dusk | day water | 119 | 351 | 864 | 2,218 | — |
| Lacework Catfish | common | night | open water | 100 | 294 | 723 | 1,856 | 4,665 |
| Silkwhisker | common | night | open water | 146 | 430 | 1,057 | 2,715 | 6,827 |
| Tallow Borer | common | any | open water | 90 | 266 | 654 | 1,679 | 4,220 |
| Vigil Catfish | common | any | open water | 109 | 320 | 787 | 2,022 | 5,082 |


**12. The Salt Gate** (value tier 238)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Old Shipwright | legendary | dusk, night | The Slipway | — | — | — | — | pays 142,200 |
| ★ Inkmarble Eel | epic | night | The Harbour Stump | — | 5,316 | 13,076 | 33,580 | 84,420 |
| ★ Sweetwater Shark | epic | dusk, night | The Sluice Throat | — | 6,550 | 16,110 | 41,371 | 104,004 |
| ★ Tideghost Shark | epic | night | The Turning Tide | — | 6,510 | 16,012 | 41,118 | 103,370 |
| Dusk Drummer | rare | night | night water | 814 | 2,396 | 5,894 | 15,135 | — |
| Longlash Ray | rare | any | open water | 1,015 | 2,989 | 7,352 | 18,879 | 47,461 |
| Old Breather | rare | dusk, night | open water | 743 | 2,188 | 5,382 | 13,820 | 34,744 |
| Creekling Shark | uncommon | any | open water | 336 | 989 | 2,433 | 6,249 | 15,709 |
| Embereye Bass | uncommon | dusk, night | open water | 368 | 1,084 | 2,666 | 6,848 | 17,214 |
| Kitewing Ray | uncommon | day, dusk | day water | 347 | 1,022 | 2,513 | 6,454 | — |
| Tidetable Ray | uncommon | any, best at night | open water | 230 | 676 | 1,663 | 4,271 | 10,738 |
| Brinewhisker | common | any | open water | 88 | 259 | 637 | 1,635 | 4,110 |
| Saltroot Bream | common | any | open water | 75 | 220 | 542 | 1,393 | 3,501 |
| Sandblower | common | day, dusk | day water | 109 | 322 | 791 | 2,031 | — |


**13. Lanternroot Lagoon** (value tier 454)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Silver Regent | legendary | day, dusk | The Sighing Pool | — | — | — | — | pays 220,100 |
| ★ Rootjaw Catfish | epic | night | The Monsoon Cut | — | 10,141 | 24,944 | 64,057 | 161,036 |
| ★ Snagheart Bass | epic | dusk, night | The Sunken Orchard | — | 9,069 | 22,307 | 57,285 | 144,011 |
| ★ Votive Shark | epic | night | The Stilt Shrine | — | 10,637 | 26,163 | 67,187 | 168,906 |
| Harbourdrum Grouper | rare | night | old water | 1,417 | 4,174 | 10,266 | 26,363 | 66,277 |
| Stiltshadow Shark | rare | dusk, night | night water | 1,636 | 4,817 | 11,847 | 30,423 | — |
| Sandghost | uncommon | day, dusk | day water | 534 | 1,572 | 3,867 | 9,930 | — |
| Wide-Eyed Stray | uncommon | any | open water | 523 | 1,541 | 3,790 | 9,732 | 24,466 |
| Flicker Trevally | common | day, dusk | open water | 175 | 516 | 1,269 | 3,260 | 8,194 |
| Frownlip Mullet | common | day, dusk | open water | 175 | 516 | 1,269 | 3,260 | 8,194 |
| Rootshade Snapper | common | any | open water | 213 | 628 | 1,544 | 3,966 | 9,971 |


**14. The Waxen Reef** (value tier 1060)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Waxen Abbot | legendary | night | The Abbot's Cellar | — | — | — | — | pays 292,600 |
| ★ Anvil Trevally | epic | day, dusk | The Broken Keel | — | 21,828 | 53,687 | 137,871 | 346,603 |
| ★ Mothlance Gar | epic | night | Lamp Row | — | 22,147 | 54,472 | 139,887 | 351,671 |
| ★ Spirewatch Pike | epic | day, dusk | The Drowned Spire | — | 22,147 | 54,472 | 139,887 | 351,671 |
| Cabin Grouper | rare | any | night water | 3,309 | 9,745 | 23,969 | 61,553 | — |
| Nebula Trout | uncommon | day, dusk | day water | 1,339 | 3,942 | 9,696 | 24,901 | — |
| Picket Pike | uncommon | day, dusk | The Drowned Spire | 1,496 | 4,406 | 10,837 | 27,830 | 69,963 |
| Amberside Snapper | common | any | open water | 520 | 1,531 | 3,766 | 9,671 | 24,312 |
| Pebble Grouper | common | any | open water | 412 | 1,213 | 2,984 | 7,664 | 19,267 |
| Waxdrop Damsel | common | day, dusk | open water | 312 | 920 | 2,263 | 5,811 | 14,609 |


**15. The Last Light** (value tier 920)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Jetsam Shark | legendary | night | The Unlit Mile | — | — | — | — | pays 357,000 |
| ★ Castaway Pike | epic | dusk, night | The Beam | — | 21,555 | 53,017 | 136,150 | 342,277 |
| ★ Nightsail Lancer | epic | day, dusk | The Drift Line | — | 25,318 | 62,273 | 159,920 | 402,032 |
| Ambersickle Tuna | rare | dusk, night | night water | 3,624 | 10,670 | 26,244 | 67,396 | — |
| Starbar Lancer | rare | day, dusk | day water | 3,941 | 11,604 | 28,542 | 73,297 | — |
| Fadegold | uncommon | day, dusk | open water | 1,537 | 4,525 | 11,130 | 28,582 | 71,855 |
| Soot Jack | uncommon | day, dusk | day water | 1,060 | 3,122 | 7,680 | 19,722 | — |
| Grey Latchfin | common | day, dusk | day water | 369 | 1,087 | 2,675 | 6,868 | — |
| Pinstripe Tuna | common | day, dusk | open water | 480 | 1,415 | 3,480 | 8,936 | 22,466 |
| Scribbleback Mackerel | common | day, dusk | open water | 355 | 1,046 | 2,572 | 6,605 | 16,605 |


**16. The Rime Sound** (value tier 1247)

| fish | rarity | bites | where | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|
| ★ The Long Winter | legendary | any | The Half-Mile Line | — | — | — | — | pays 435,400 |
| ★ Icedoor Flounder | epic | day, dusk | The Fjord Floor | — | 32,180 | 79,151 | 203,263 | 510,997 |
| Bellrope Cod | rare | any | old water | 4,493 | 13,230 | 32,540 | 83,563 | 210,075 |
| Coalwing Skate | rare | any | night water | 4,604 | 13,558 | 33,348 | 85,639 | — |
| Bouldermouth | uncommon | day, dusk | day water | 1,772 | 5,219 | 12,836 | 32,963 | — |
| Hemstitch Cod | uncommon | any | open water | 1,575 | 4,638 | 11,407 | 29,294 | 73,644 |
| Rosedeep Rockfish | uncommon | any | night water | 1,437 | 4,232 | 10,409 | 26,731 | — |
| Ashline Cod | common | any | open water | 708 | 2,084 | 5,127 | 13,166 | 33,098 |
| Emberspot Flounder | common | any | day water | 621 | 1,829 | 4,498 | 11,550 | — |
| Greybeard Cod | common | any | open water | 878 | 2,586 | 6,361 | 16,334 | 41,064 |
| Thumbprint Cod | common | day, dusk | open water | 657 | 1,934 | 4,757 | 12,217 | 30,714 |
| Wickstripe Rockfish | common | any | open water | 417 | 1,227 | 3,017 | 7,749 | 19,480 |

Waiting for a later sheet (built, not roster fish): Cupbearer (cupped_hands), The Remembered Sun (drowned_greenhouse), The Sexton (bell_window), The Unpaid Fare (ferry_slip), The Namesake (long_pier).

Curiosities (roster §6) are outside these tables: each sells at its water's rare Keeper price.

## Appendix B. Re-running the proof

```
cd gloomwater
node tools/sim/clams.mjs              # everything, about 25 s; exits 1 if any of the 89 checks fails
node tools/sim/clams.mjs --quick      # about 20 s
node tools/sim/clams.mjs --md         # the tables as markdown
node tools/sim/clams.mjs --fish       # Appendix A
node tools/sim/clams.mjs --json       # the LOOP draft tables
node tools/sim/clams.mjs --calibrate  # the value tiers that satisfy decision 10's two ladder rules, with a 2-point margin
```

It reads the fish from `docs/loop/roster.json` and the built species the roster keeps, and from `src/data.js` (loaded as the loop will load it: `GW_V3`, `GW_V3_PHASE = 1`, `GW_LOOP`) the size model, the land chance (`catchParts`), the lures and baits and the time model of a cast. It keeps its own draft `LOOP` table for everything this spec adds. It runs 89 checks: every roster fish has a map; one legend per water; one giant per place; the giants top every water's ladder; the anti-grind and choosy checks at six stages; the bait checks, and no tin beats the plain bait; every giant is the hardest fish of its water; every legend stays at or under a coin flip; the pacing targets of §4.9; every hold step and raft part pays its way; a new water is the best water from the day its map is bought; no lake map is a downgrade; every water pays 1.2 times the one before; every place map adds 5%; no stopping short. Change a price in `LOOP`, run it, and it says which target moved.
