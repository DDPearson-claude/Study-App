# The Full Hold: catch, keep, sell, upgrade (binding spec, v8.1)

*Gloomwater's game loop after the user's redirect of 2026-11-13, rebuilt on the roster (`docs/loop/ROSTER.md`), revised after two critics (§0.1), and re-ordered into a greening ramp with rivers after the user's words of 14 November 2026 (§0.2; the waters' looks are `docs/loop/WATERS.md`), revised after three critics of v7 (§0.3; `WATERS.md` §10 logs every finding), and re-cut to the milestone M1 with the world map as the in-game Chart and the five Wicks' passives after the user's words of 14 and 15 November 2026 (v7.2, §0.5; `docs/loop/M1.md`, `docs/loop/WICKS.md`), and given a home that travels, the home barge, after the user's words of 15 November 2026 (v7.3, §0.6), and gated by three keys after the user's words of 14 November 2026 (v8, §0.4, §5.5), and given finds from the water and an aquarium written for after M1, after the user's words of 15 November 2026 (v8.1, §0.7; `docs/loop/FINDS.md`, `docs/loop/AQUARIUM.md`). This file is binding. Where it conflicts with DESIGN §1–§25 or CONTRACT §13 it wins (§12 lists what it replaces). Its numbers are proven by `tools/sim/clams.mjs` (166 checks: v7.1's 140 and 26 for the three keys); v8's figures (the three keys, §4.9 and §5.5) are the sim's own, from its section 7 and its gated pacing run. When the numbers here and the sim disagree, re-run the sim and fix this file. Design only: no `src/` file changed with this document.*

**How to read it.** §0.7 says what v8.1 changed (finds, the barge review's shoulds, and the aquarium after M1), §0.6 what v7.3 changed (the home barge), §0.5 what v7.2 changed (M1, the Chart, the five passives), §0.4 what v8 changed (the three keys to a new water; §5.5 is the whole rule), §0.3 what v7.1 changed, §0.2 what v7 changed and why (§0.1 what v6 changed). §1–§3 are the game and its rules (§3.5 is the rare giants). §4 is every number. §5–§7 are maps, home (the home barge) and raft. §8 is every word on screen. §9–§12 say what happens to what exists. §13 is the build plan. §16 lists the questions only the user can answer. Appendix A lists every fish with its price.

**Vocabulary (always these words).** **clams** (the currency; "Shells" is retired) · **the hold** · **slot** · **Keep / Let go** · **good bites** and **quiet water** · **an evening** (one trip) · **Home** · **the tally** (Murk buying the hold) · **the Chart** (the Map Table's screen) · **map** (the one word on screen for a lake map and a place map; a lake map inks a water on the Chart, and with its gear and the list of the water before it opens that water's open water, its day water and its old water; a place map opens one more place) · **the three keys** (map, gear, catch: what a new water needs before you can sail there; §5.5) · **sealed** (a water whose map you own but cannot sail to yet) and **open** (all three keys held; for good) · **the list** (a water's Journal list: the fish that count toward the next water's catch key) · **the pull** (the hidden mercy that brings a listed fish you have not met to the hook) · **a water** (one of the 16 lakes, rivers and seas) · **a river** (a water built on the river layout: banks, bends and a current; §5.3) · **lushness step** (0 to 15: how green and lush a water is; one step per water, §5.2) · **day water, old water, night water, crown** (the kinds of place; on screen four glyphs, never words) · **a rare giant** (★: the descendant of an episode's main fish; *epic*, or *legendary* for a water's crown) · **a legend** (a legendary giant) · **value tier** (a water's price level, hidden) · **a reach** (four waters in a row: I the old kingdom, II the cold rim, III the falls and the gate, IV the green heart) · **Murk's orders** · **ink print** · **the home barge** (the Slow Hearth: the Wick's own old barge-house, towed from water to water; §6) · **a mooring** (the one fixed place a water's home barge lies; §6.5) · **the tow** (the one-time voyage that first brings the home to a water; §6.5) · **the Jetty** (the Mossmere's mooring; slice 1a's small home screen there) · **the Landing** (the sea cave where the game starts; not home) · **M1** (the milestone: the Mossmere and the home barge, complete; it was "and the Landing" until v7.3; §13, `docs/loop/M1.md`) · **a passive** (a Wick's one always-on fishing power; §10.1) · **Coming soon** (the sealed sheet of a water past the last shipped one; §5.4) · **a find** (a thing the line brings up that is not a fish: a **treasure**, a **barge part** or a **look**; §4.10, `docs/loop/FINDS.md`) · **a snag** (the bite that brings a find up) · **Keepsakes** (the Journal's page of finds) · **the Well** (the aquarium under the home barge, after M1; `docs/loop/AQUARIUM.md`).

---

## 0. The user's words, and the lead's rulings

| # | the user, verbatim | ruling |
|---|---|---|
| 1 | "Who are we and what is the gameplay loop? I basically want to try and catch big and rare fish, the fish we keep i want to sell for clams and we use the clams to upgrade our gear, raft, homebase, bait, lures, buy maps of new locations to fish, which is the only way of discovering a new place is to buy the map." | §1–§2 the loop. Big and rare fish are worth far more than small ones, and the rare giants most of all (§4.1). Clams buy six things: gear, raft, home, bait, lures, maps (§4). Nothing is found by exploring: a map is the only way a water or a place becomes known and reachable (§5). |
| 2 | "for now park the creature attacks." | The swarm and everything that only serves it or makes failure possible is switched off behind one table of flags and kept in the code (§9). |
| 3 | "I just want to catch fish so we're limited buy storage for caught fish in our boat starting at 3 catch slots." | The hold: 3 slots at the start, 8 at the most (§3.1, §4.2) (Tallow: 4 and 9, the user's own exception of 15 November 2026, row 12; `WICKS.md` §2.4). No food, no oil to manage. |
| 4 | "there's no way to fail, but once your boat is full you can't catch anymore fish and you might not catch a big one at all as its chance" | No fail state anywhere (§3.6). A full hold refuses the cast (§3.1). A big fish is a chance each evening, never a promise: 52% of first trips bring home no Prize or bigger (the no-passive player's figure; each Wick's is printed by `WICKS.md` check 4, Tallow's about 41%, *est.*), and a giant comes home on 4–11% of trips at its place on arrival tackle (§4.9, §3.5). |
| 5 | "Use all of these fish as inspiration for our game's fish" (on the researched list of every fish landed on a television fishing series; `docs/loop/research/`) | Every fish on the list is the ancestor of one original fish of ours (`docs/loop/ROSTER.md`, `roster.json`, checked by `tools/sim/roster-check.mjs`). **All 164 live on at least one map** (§5.2; the sim checks it). The series and its presenter are never named in the game, and the roster's design notes never ship (§13, slice 1b). |
| 6 | "The main episode based fish he catches should be the rare giants" | The 49 rare giants (33 epic, 16 legendary) are the scarcest, largest, dearest and hardest fish of their waters. **49 of the 55 maps promise a giant**, and every map but the first names a fish you cannot meet elsewhere (§3.5, §5.1 rule 9). |
| 7 | "Yes to all five loop rules" (13 November 2026, answering v4's five questions) | Decisions now: a kept fish is final; the water goes quiet; every trip is an evening; a map's card names one fish; raft only for now. |
| 8 | "Yes to all four defaults and the let-go rule." (14 November 2026, answering §16) | Decisions now: the twelve new waters are full 3D waters; about 48 hours to buy everything (the pacing run: 48.9 h); late prices run into the hundreds of thousands, shown as "196k" (a Trophy giant of the Inkwood sells for about 196,000 on average and 218,000 at most, an Elder Emberbelly about 548,000; the last lake map is 984k); a lake map opens two places at once (its day and old water); a fish let go returns its good bite and adds +0.2 favour there, to +0.4. |
| 9 | "I want the lakes to get progressively more and more lush and green. I also want some of the levels to be rivers similar to the rivers fishes in the river monsters series. As we unlock new lakes and rivers we need to slowly but progressively start getting more and more green and lush." (14 November 2026) | **A ramp, not a switch** (§5.2, `WATERS.md`). The Mossmere keeps today's look exactly: lavender night, green only as a trace. From water 2 on, each water you unlock is one visible lushness step greener than the one before (0 to 15, one per water), slowly and steadily, until the last waters are deep green rainforest. Green lives on things (moss, fern, reed, leaf, vine, root, weed), never in the air, the light or the grade; the violet-dusk sky, the lavender moon, the clear air and the candle's one warm light never change; each water has a day, dusk and night look, and the green reads in all three. **Six of the twelve new waters are rivers** (slots 6, 8, 10, 12, 14, 16), modelled by type and feel on the kinds of river the series fished: a wide braided sand river, a snowmelt gorge, cataracts, a tidal mouth, a great brown lowland river and a blackwater river through flooded forest. They alternate with six stills, and the lushest come last. A river is a full 3D water: banks, bends, a current you can see, the raft on moving water (§5.3). The series, its presenter and its episodes stay in `docs/` only (v7.2, row 17: real river and lake names may ship). |
| 10 | "To access a new area we should need a few pre requisite really. We need the map, the appropriate rod or gear and have caught one of each fish species in the current area." (14 November 2026) | **Three keys open a water** (§5.1 rule 11, §5.5). The map is still bought with clams and is still the only way to discover a water: buying it inks the water on the Chart. You can sail there once you also hold its **gear** (one piece of tackle or raft, named per water and always on Murk's shelf before you need it) and have landed **one of each fish on the list of the water you are in now**, kept or let go (the Journal entry counts). Giants and legends are never on a list; they stay the dream. A hidden pull on the fish you have not met yet (§5.5) keeps luck from holding a water shut, so there is still no way to fail. The details were the lead's defaults (decisions 32–37); **the user then said "Yes to all those defaults"** (14 November 2026): giants and legends are not on the catch list; a fish let go still counts; a mercy rule (uncaught species bite more the longer you fish there, and their hours still apply); places inside a water keep clams as their only key; three small seals on the Chart; at most two Murk lines (§16 questions 8–12 record which questions that settles). On the Chart they are **three small seals per sheet** (§5.4). In M1 they show on Sporewood's sealed sheet and fill as they are earned; its map seal stays hollow ("Coming soon") until Sporewood ships (decision 39). |
| 11 | "You can choose any of the 5 wicks but each one has a powerful unique passive ability to help them catch fish or boost something else" (14 November 2026) | **Five passives**, one a Wick, each powerful in its own domain and balanced over the whole game within ±10% (`WICKS.md`, §10.1): the Wick, Curious (firsts sell higher); Taper, Long Reach (first bites are never common; giants ×1.3, under 12%); Stub, Moth-Bright (quick bites, lively quiet water); Tallow, Broad Back (row 12); Ashwick, Burns Back (a lost fish comes back once). The built small traits are retired on a trip. |
| 12 | "Default for all except 4 which i want yes" (15 November 2026, answering `WICKS.md`'s five questions) | The four defaults stand (no giant comes back for Ashwick; the Wick is paid for firsts; Stub is the stayer; the five lines as written), and **the carrier is Tallow**: 4 slots at the start, one more at every Hold step (4 to 9), and at open water two more good bites than another Wick at the same step (its slot's and one of its own). Long Night is kept whole in `WICKS.md` §6.4. |
| 13 | "Yes make the map our in-game Chart" (14 November 2026) | **The world map is the Chart** (§5.4, decision 40, `docs/loop/M1.md` §3): the generator's bake reused as per-sheet crops in the HTML, its live layer drawn by one module shared with the published page, each water's sheet drawn by the game from its arena; a list in slice 1a, the drawn Chart from M1 step 3. |
| 14 | Asked "What do we need to do to get map 1 and the home base fully 100% finished and playable": "Yes" to the lead's re-cut (15 November 2026) | **M1 first** (§13, decision 41, `docs/loop/M1.md`): slice 1a, the Mossmere halves of slices 1b and 2, slice 3 without Sporewood's fish, the cove (FE-W1) and slice 4, then a polish pass (QUEUE jobs 9–14; v7.3: step 5 is the home barge instead of the cove, row 18). Everything for Sporewood and the later waters waits; Sporewood's sheet shows sealed, "Coming soon", until then. |
| 15 | "I know this is a weird unit of measurement change but we always use pounds as a gauge of fish size can we have that as our unit of measurement please" (15 November 2026) | **Pounds**: every size on screen is a weight in pounds and ounces (`docs/v3/pounds/SPEC.md`, branch `gw-pounds`; §8). Length stays the hidden truth behind value. |
| 16 | "Yes, rewrite line 3 once the story's done" (14 November 2026); the new line put in during slice 1a (15 November 2026) | **The film's line 3** under the loop is `LORE.md` §12's: "Its last candles fish from lamp to lamp." (§11; slice 1a's lane B; the new video in M1 step 6). |
| 17 | "I dont care if they're named after real rivers or lakes" (15 November 2026) | **Real river and lake names may ship**, in the world and on the map. The TV series and its presenter are never named in anything that ships; episode titles and the roster's research fields stay in `docs/` (slice 1b's allow-list). |
| 18 | "Should our home base actually be a floating caravan style base that moors in a specific location at each water, but then it makes sense as we move on that our base stays the same because it follows us. Otherwise we'd have to buil 17 individually home cave locations which would cost a fortune at each new water. Where as if we tow it with us when we move that makes sense" (15 November 2026) | **Yes: the home barge** (§6, decisions 43–48). Home is the Wick's own old barge-house, the Slow Hearth, found at the Landing in the opening and moored at **one mooring per water** (data per arena, never a home built per water); Murk's trading barge moors alongside it at every water. The first time a new water opens the Wick **tows** the home there (a one-time voyage on the Chart's leg of the road, short and skippable); going back to an earlier water is one ink dip, because a kept lamp remembers the way. The Chart picks the evening's water and the home goes with the choice. Home upgrades become the barge's; the hold stays on the raft. The Landing is where the game starts, not home. The ending travels with it. M1 step 5 is the home barge, not the cove (`docs/loop/M1.md` revision 3). |
| 19 | "We can catch things from the lake that sell for huge value or can upgrade our base or just be cosmetics" (15 November 2026) | **Yes: finds** (§4.10, decisions 49–57, `docs/loop/FINDS.md`). Now and then a bite is a **snag** that brings up something that is not a fish; the Wick hauls it in and holds it up like a catch, it has its own card, and **Keep** takes a hold slot like a fish. Three kinds: **treasures** sell at the tally (each water's jackpot for about twice its giant Trophy), **barge parts** upgrade the Slow Hearth (found fittings that change how home looks and sounds, never a number on the shelf), and **looks** (the user's cosmetics) are worn by the Wick, the raft and the barge. Each water has its own set from its drowned works; the Journal gains a **Keepsakes** page; finds never count toward the catch key; the odds stay in the logs; the sim models them so the pacing holds. M1 step 5c brings the Mossmere's eleven. |
| 20 | "We also need to have an aquarium feature that we can dive into as a 3d world. The character doesn't need to be in it, just a camera that can swim around the 3d aquarium world. This is attached to our barge and we can fish items to upgrade it and cosmetics from each location. This doesn't need to be built properly yet but it could do with he written about." (15 November 2026) | **Yes: the aquarium, written now, built after M1** (decision 58, `docs/loop/AQUARIUM.md`): **the Well**, the Slow Hearth's old wet well under a glass hatch; at home, tap the hatch and swim a camera, with no Wick, through an underwater world under the barge, one room for each water the barge has moored at. **Every species you have landed swims there** (kept or let go), drawn from the Journal at your best print's size, so no sale is given up and "you sell what you keep" stays whole. Its upgrades (fittings) and looks (dressings) are finds, each water its own themed set (the Mossmere's drowned stone, Glasswater's crystal, the reef's coral). |

**Decided by the lead (and why).** Rows 1–5 stand from v4 and the user confirmed them; rows 6–14 came with v5; v6 revised 2, 6, 10, 11, 12 and 14 and added 15–21 (§0.1); v7 revised 10, 11 and 14 and added 22–27 (§0.2); v7.1 revised 2, 10, 15, 23, 25 and 26 and added 28–31 (§0.3); v7.2 added 38–42 (§0.5); v7.3 added 43–48 and revised 38 (§0.6); v8 revised 4, 11 and 21 and added 32–37 (§0.4); v8.1 added 49–58 (§0.7).

| # | decision | why |
|---|---|---|
| 1 | **Kept stays kept.** A fish in the hold stays there until Murk buys it. | "Once your boat is full you can't catch anymore fish": a full boat is final. A swap is a bigger hold by another name. (User: yes.) |
| 2 | **The water goes quiet, and let go forgives.** Every water has a few good bites an evening; every bite you strike or let pass spends one (§3.3). A fish let go at the card gives its bite back, and the next bites at that water run bigger (§3.2). | Without quiet water, "let everything go until the giants bite" brings 2.1–3.9 times the clams per trip. With it, no patient strategy reaches the natural rule per minute (the best is 89%). With the forgiving let go, letting a fish go is a real choice: choosy play earns 88–95% of the natural rule per minute at the six stations and 87–104% on every new water at its arrival kit (it was 67–79%). (User: yes to quiet water.) |
| 3 | **Every trip is an evening.** Dusk falls after 40 s on the water; night lasts until you turn for home (§3.4). | Night stays the big-fish hour without a clock or a skip button. (User: yes.) |
| 4 | **Clams buy; three keys open** (v8). Every purchase needs only clams. A new water opens for sailing with three keys: its lake map, its gear key and the list of the water before it landed (§5.5). Place maps need only clams and an open water. No proof catches, no tolls, no legend gates; a giant or a legend is never on a list. | One currency, one way to discover a water (its map), and the user's rule of 14 November 2026 for sailing there (§0 row 10). |
| 5 | **One lure and one bait at once.** | Both are on the user's list; with one slot for both a tin never beats a lure. |
| 6 | **Sixteen waters, 55 maps.** 15 lake maps and 40 place maps. A lake map opens a water's open water, its day water and its old water. Place maps open its night water, its crown and, in six waters, a fifth place. The Mossmere is yours from the start, with four place maps. | In v5 a lake map was a step down: 14 of 15 lowered your income on the day you bought them, because a water's places carry most of its worth. Opening the day and old water with the lake makes the new water better than the old one from its first evening, without inflating every price (§4.9). |
| 7 | **A giant lives at one place and is a fixed share of the bites there:** 6% in its hour, 2.5% outside it; its own giants' lure makes that ×1.5 (§3.5). | A share does not swing with what else bites. It keeps "the promise of a giant" honest: it comes, rarely. |
| 8 | **A giant is never Small, runs big (+0.3 favour), may be an Elder at its own place, and fights +10 harder than a rare** (+12 as an Elder). | The giants are "the top of the value ladder and the hardest fish to land". The sim checks both for every water (§4.9). |
| 9 | **Value is value tier × rarity × body × size.** Rarity ×1 / 2.4 / 5.5 / 12 (common to epic); body is the square root of the fish's typical length against 45 cm, clamped 0.6–1.6. | Big and rare fish, in the roster's own rarities and sizes. A giant sells for 1.7 times or more than the dearest other fish of its water at the same size class. |
| 10 | **Each water's value tier is set by two rules.** On the day you buy its map, its open, day and old water pay at least 1.05 times the water before it, fully mapped. Fully mapped, it pays at least 1.2 times the water before it. | The next map is always worth having, from its first evening (sim section 6). The tier is hidden; it ranges from 7 (the Mossmere) to 1,675 (the Inkwood). |
| 11 | **Tackle T5 and T6.** T5 is on the shelf with the Pallid Deep map, T6 with the slot-9 map (v8: the Waxen Reef, so that Rod T6, the Thunder Stair's gear key, can be bought before the Thunder Stair's map; v7 put T6 with the slot-10 map). | Sixteen waters need the gear to keep growing. Each lake map is judged on the tackle you own when you can buy it. |
| 12 | **Every tin gives the same favour and costs the same in a water** (1.5 × its value tier). Tins differ only in which fish they help hold, and in the few fish that bite on one bait only. **Bait does not change which fish bite.** | In v5 one tin beat every other everywhere. Now picking a tin means picking a fish, and no tin beats the water's plain bait (sim section 4). |
| 13 | **An hour opens a window that runs into the next phase:** "day" bites by day and dusk, "dusk" at dusk and night, "night" at night. | The roster's hours, made playable in a 60-second evening. |
| 14 | **The long game is about 48 hours** to buy everything: the four built lakes by hour 16, then a new water every 2–3 hours. | Long enough for 55 maps and 49 giants; each era is a few sessions. (Question 2, §16.) |
| 15 | **Every place map earns its price.** Bought in price order, each raises clams a minute by at least 5% (8–29%), and no set of a water's places pays more than the next water fully mapped. | In v5 some maps made you poorer (the Last Light's Drift Line −13%, the Beam −29%), so stopping short was the best play. |
| 16 | **A place's own fish are worth the sail.** At any place commons bite half as often; a day water draws its water's uncommon and rare fish 1.5 times as often. Eleven roster fish bite at a kind of place in play (§5.2), so no map card names a common. | v5's weak maps put a common on the card (the Marsh Lanes, the Bar, the Net Racks, the Step Pools). |
| 17 | **The hold past 4 is a bigger evening, not a faster one, and it is priced like one.** Hold 5–8 add 8–20% a trip at about the same clams a minute, for one or two trips' income each (§4.2). | Quiet water limits the good bites, so a bigger hold cannot honestly be a multiplier. Pretending would make the grind pay. |
| 18 | **The raft is Oars I–II, the Keel I–III and the Lantern I–II.** Quiet Hull is cut. The Keel makes every fish run bigger (§7). | Quiet Hull did nothing measurable (+0.3% at 1 h, −0.2% at 40 h). Each part now pays its way or costs at most two trips. |
| 19 | **Orders never expire.** An order stays until it is filled, or until you wipe it. | An order that vanished after 3 evenings was a countdown. |
| 20 | **Fewer words.** Home is a press-and-hold pill; "Gone quiet." is gone; orders and the Old Ledger are glyphs; a dear price is only dimmed; Cut bait is a long-press on Let go; a map's line is at most 8 words (§8). | "The UI is really cluttered, there's too much text on screen." |
| 21 | **The natural route waits for a dusk giant.** On an old water whose giant bites only from dusk, the Wick waits there for the light to turn. v8 widens it: an old water whose own fish bites only from dusk is fished at dusk too, and while a water's list has fish missing the Wick first fishes where and when one of them bites (the Journal route, §3.4). | Without it the old water was fished in daylight and its dusk giant came home on 1 trip in 143 (the Thousandcast Pike); with it, 1 in 21. v8: the Pallid Deep's lake-card fish, the Candlewake Sturgeon (night only, the Chain Garden), was landed on 0 of 2,000 natural-route trips, and day-water day fish (the Nebula Trout, the Snufferjaw, the Starbar Lancer) on 0–2%; under the catch key that would be a wall. With the fix the Sturgeon is landed on 6.7% of natural-route trips (sim); the day-water day fish still wait for the Journal route (the Snufferjaw 0.4%, the Starbar Lancer 1.8%). The fix moves the Pallid Deep a little, inside decision 10's rules: on its map's day it pays 1.09× Glasswater fully mapped (it was 1.11), and the Rime Sound after it pays 1.11× on its map's day and 1.20× fully mapped (they were 1.13 and 1.23). |
| 22 | **The greening ramp.** Every water has a lushness step, 0 (the Mossmere) to 15 (the Inkwood), one per water in unlock order. Green share, foliage and night emitters rise with it; the air, the sky, the moon, the grade and the candle never change (`WATERS.md` §1, §3). | The user's words (§0 row 9). A ramp keeps the Mossmere the user approved and makes every new map a visible step greener, never a jump. |
| 23 | **The cold rim first, the green heart last.** v7's order: 5 the Rime Sound, 6 the Thin Water, 7 the Last Light, 8 Pyrefall Gorge, 9 the Waxen Reef, 10 the Thunder Stair, 11 Rushlight Fen, 12 the Salt Gate, 13 Lampmoss Slough, 14 the Siltway, 15 Lanternroot Lagoon, 16 the Inkwood. | v6 put the ice fjord, the open sea and the reef last, where the lushest green must be. Re-theming them green would have taken away their giants' homes (the Long Winter under the ice, the Lantern Hole, the Jetsam Shark's open swell). Re-ordering keeps every home. v7.1 keeps the order, re-themes the Rime Sound as a temperate-rainforest fjord (the ice only at its head) and starts the Last Light under a near lighthouse island, so each is a real step greener (`WATERS.md` §2). The cost (the two largest legends come at hours 21–26) is §16 question 6. |
| 24 | **Six rivers, alternating with six stills**, the rivers at 6, 8, 10, 12, 14 and 16. | "Some of the levels" are rivers, so lakes stay. Alternating gives a pleasing run; the three lushest river kinds (the tidal mouth with mangroves, the great lowland river, the blackwater forest) come last. |
| 25 | **A river is a new layout** (`arena.layout: 'river'`) on an authored strip, seen up its channel by a camera that follows the river, with one water level, a current capped at 1.2 m/s in the lanes, white water that never cuts the lane, slack water at every place and dock, and the raft holding still while a line is out (§5.3, `WATERS.md` §4). | Moving water must not change how fishing feels or create a way to fail. |
| 26 | **Prices follow the slot by the v6 rule, re-derived.** A lake map costs 42 minutes of its water's own income fully mapped (the rule behind v6's ladder); its place maps are the same shares (night 0.43, fifth 0.39, crown 0.59). The value tiers are re-calibrated for each water in its new slot. | One rule for every slot. Kept as it was, v6's lake ladder by slot gave 53.8 h and a 98-minute wait on v7's tiers (failing the 90-minute check); on v7.1's tiers it would give 49.2 h and an 82-minute wait. The 42-minute rule gives 48.9 h and a longest wait of 76 min, with all 140 checks passing. A slot's night water, crown, fifth place and legend bait also never cost less than 1.05× the slot before's (v7.1). |
| 27 | **The built waters 2–4 gain a little green** (Sporewood step 1, Glasswater 2, the Pallid Deep 3) from materials only; their fog, water and grade stay. The Mossmere does not change at all. v7.1: the repaint ships switched off (`LOOP.lush`) until the user approves it side by side. | Monotonic from water 1: the ramp needs them to step up, gently (`WATERS.md` §6). Nothing the user approved changes before the user says yes. |
| 28 | **Every new water is checked on its own** (v7.1, sim section 2b): the anti-grind, let-go and bait checks run on each of the twelve at the kit it is bought with, not only at the 20 h and 40 h stations. | v7 moved Pyrefall Gorge to slot 8 because it failed at slot 6; it still failed at 8, where no station looked. |
| 29 | **Three fish bite where their water needs them** (v7.1): the Lampspot Snakehead in Pyrefall Gorge's open water (its roster kind), drawn ×2.5 at the Coin Run and the Boulder Garden; the Reedwalker Catfish in Rushlight Fen's open water, drawn ×2.5 at the Night Lanes. No fish changes water. | The Gorge's open water had two commons, so let-go play earned 81%; the Fen's thin pool forced a tier the Salt Gate after it halved (−51% for its giants). Now 87% and +7%. |
| 30 | **The plain bait and the giants' lures earn their place** (v7.1): the Last Light's and Lanternroot Lagoon's plain bait is Shimmerfly, the Inkwood's Mire Worms; a new giants' lure names its giants and its two biggest rare or uncommon fish, and the Lighthouse Feather is also a predator's lure; the player fits whichever lure pays best. | A tin beat the Last Light's plain bait by 4.1 points and the Inkwood's by 3.9; the Thunder Plug cost the pacing player 18% a trip. Now no other tin is more than 1.8 points better anywhere, and every giants' lure earns 2–29% more than the best family lure. |
| 31 | **A new water's giant lands a Prize 39–50% of the time on the tackle it is bought with** (v7.1: the Rime Sound's, the Thin Water's and the Thunder Stair's Fight terms raised). | The Icedoor Flounder landed 57%, above the legends' coin flip. The built lakes' giants land 27–34%; new tackle is a small reward, never a sure thing. |
| 32 | **The keys gate sailing, not buying** (v8; the lead's default, §16 question 8). Murk sells the next lake map for clams once the water before it is open. Buying it inks the water on the Chart, still sealed; it opens when its gear key and the list are also held. At most one sealed water waits on the Chart. **Opening is for good**: a list that grows when a later slice ships a fish never closes an open water. | "Luck never blocks a purchase" stays true word for word, and the map is still the one way to discover a water. A purchase gated on a catch would block spending on luck. |
| 33 | **One gear key per water, all existing items** (v8; the lead's default, §16 question 10): the rod tier its fish fight at for most still waters, the cold-water reel for the fjord, the second oars for the first river, the brass-shod keel for the open sea, and raft parts for reach IV (§5.5 (b)). No new item is added. | Every key is on the shelf before its map is offered, and the pacing run already owns all but Rod T6 before the map (decision 37 moves it). A new item would add a purchase and lengthen the 48 h for no new play. |
| 34 | **The list: a water's ordinary fish** (v8; the lead's default, §16 question 9). Its open-water fish plus the fish of the day water and old water its lake map opens (their own fish included), counted only if they bite in the shipped data on the water's plain bait. Never on a list: giants, legends, night-water, crown and fifth-place fish, a fish that bites only on a tin other than the plain bait (the Gloam Eel, the Sleepspore Jelly, the Chime Jelly), curiosities and the Gill Lodger. The Mossmere's list is its open water only (its places are place maps). A fish counts once it has been landed (Journal `caught > 0`), kept or let go, catches from before the loop included (§16 question 12); a Glimpsed fish does not. | "One of each fish species in the current area", read as the area its lake map opens. The dream fish and the places you buy later stay outside the gate, so a gate never asks for luck at a giant or for a purchase. A tin would otherwise be a hidden fourth key. |
| 35 | **The pull: luck never holds a water shut** (v8; §5.5 (d)). A listed fish not yet landed bites more often the more evenings you spend at its water (×min(6, 1 + evenings)), from the second evening there never bites Small, and from the ninth evening the first bite wherever it can bite is one of the missing. **The first evening at a water is untouched** (the sim's one re-tune, §5.5 (d): a floor from the first evening filled a fresh save's hold early, and 39% of first trips got a bite after dark instead of 63%). Its hours, places and bait still hold. It is never shown. (The user: yes to the mercy rule, §0 row 10.) | "No way to fail" and "every catch should feel like a win". Without it the slow player in twenty needs over 10 h to finish Sporewood's list and 3.8–8.6 h at four other waters; with it, 16–53 min at the 15 waters whose list is a key (the Inkwood's Journal seal 54; sim section 7). |
| 36 | **Places keep clams as their only key** (v8; the lead's default, §16 question 11). A place map needs only clams and its water open. | The three keys are about reaching a new area; a place is inside the area you already reached. One set of seals per water keeps the Chart clean. |
| 37 | **T6 goes on the shelf with the slot-9 map** (v8, decision 11). | Rod T6 is the Thunder Stair's gear key: the pacing run buys it at 29.3 h, 1.2 h before that map, and the water opens the moment the map is bought. Bought only after the map (all v7.1's shelf allowed), the Thunder Stair would wait sealed 57 min while the rod is saved for (sim; the designers' scratch run, which bought Line and Reel T6 first, found 155). |
| 38 | **The shelf grows with the road.** Every shelf item has an "on the shelf with" map (§4.2, §4.7): Hold 4–6, tackle T1–T2, the raft's and the home's first two levels, the Long Wall's first wing and the first three looks are on the shelf from the start; Hold 7, Order Board III, Barge lights II and the Painted Prow come with the Glasswater map; Hold 8, Keel III, Bait Bed III, Barge lights III and the Bell Buoy with the Pallid Deep map; the other four looks with waters 5, 7, 11 and 15; tackle and lures as §4.3–§4.4. | Each gate is the era in which the pacing run buys the item (§4.9), so the full game's pacing does not move (a sim check keeps it so). On the Mossmere alone (M1) the late items would be hours of grinding on the cheapest water for things meant for later waters. |
| 39 | **`LOOP.shipped`: the last shipped water.** No lake map past it is offered; the next water's sheet is sealed "Coming soon" (no price, its map seal hollow, §5.4); the sim's `--shipped` runs on it. M1: the Mossmere. | One switch for "what is built", generalising slice 6's `LOOP.chainSkip`; the player sees where the road goes next and never meets a dead button. |
| 40 | **The world map is the Chart** (§5.4): the generator's bake as per-sheet crops (≤ 150 KB a sheet in reach I; ≤ 300 KB for M1's Chart in all), its live layer in one shared module (`src/chart-draw.js`, which the generator's page also inlines), each water's sheet drawn by the game from its arena. | The user's words (row 13). Embedding the published page would double the game and draw unowned waters; redrawing the continent at runtime would be slow on phones and drift from the published map. |
| 41 | **M1 first** (§13): the six steps of QUEUE jobs 9–14, then the rest, in QUEUE's order. | The user's words (row 14). |
| 42 | **The giants' page shows the giants of the waters you own** (in M1 the Mossmere's three), each a dark outline until landed; a water's giants join it with its lake map, all 49 by the end. | `WORLD.md` §10: nothing unowned is drawn. 46 outlines of fish you cannot yet meet would read as a list of locks. |
| 43 | **Home is one barge that goes where you go** (§6): the Slow Hearth, the Wick's own old barge-house, with Murk's trading barge moored alongside it at every water. Its upgrades are bought once and seen everywhere; the hold stays on the raft. | The user's words (row 18). A home built at each water is sixteen (with the Landing, seventeen) homes to build and keep in step; one barge is one actor. The shop goes where you go, so no visit home is ever a journey. |
| 44 | **One mooring per water, as data** (§6.5): `arena.mooring` where authored, else `docks[0]`, checked by `validate-data --loop`. The Mossmere's is the Jetty. | Like the built docks: a new water costs one checked entry, never a home. The Jetty is already home in slice 1a (PLAN CHOICE 44), so 1a's work stands and grows into the barge in place. |
| 45 | **The home goes with the water you choose** (§6.5): the Chart picks the evening's water; you come home at dawn to the barge at the water you fished; a new water's first Sail plays the tow, once; an earlier water is one ink dip. | One choice (the Chart's) instead of a second "move home" screen; the journey is felt once per water and never becomes a chore; the save holds two fields. |
| 46 | **The tow is the Chart's own leg, then the glide in** (§6.5): the forward road's leg, the raft towing the barge, the new sheet inking in (its one ink-in: buying the map does not ink it first, §6.2); then one ink dip and, in the water, the raft towing the barge in to its mooring. The leg 4 s (+0.5 s for each lock flight, fall or sea passage, at most 6 s), the dip 0.6 s, the glide in 3 s: each part skippable and gated on its own, so never over 10 s; no words; the opening is its first use (v7.3, the barge review). | It reuses the map the user asked for and the road the user had straightened; a 3D voyage per leg would be fifteen more scenes to build. |
| 47 | **The cove leaves M1, parked, not retired** (§10, §13): the Landing is where the game starts (drawn on the Chart in the opening), not home; the built cove stays off (`world.SUPPORTS_COVE` false). | Kept, because it is built code the dormant v3 First Evening needs, it costs nothing while off, and it is the ready 3D stage if the user wants the opening's Landing in 3D (§16 question 18). Not in M1, because it would be a place seen for one minute at the price of the old step 5a (L). |
| 48 | **The ending travels with the home** (`LORE.md` §8): Murk's banked fire is aboard the barge; the first time home from the Inkwood, at its mooring at the Inkwood's old landing below the Kitchen Stair (clear of the stair's place, as every mooring is, §6.5), Murk rakes it open. Still triggered by the road, never by a fish. | There is no Landing to go back to; the fire came the whole road with you. |
| 49 | **Finds come up on a snag.** About one bite in 20 at a water is a snag instead of a fish (*est.*; never on the first evening, never on a legend's cast). It is struck as any bite and hauled in by the automatic play, never lost; it spends a good bite like any bite, and a find let go refunds it without favour (`FINDS.md` §2). | The user's row 19, by the game's one verb: no new minigame, and the anti-grind rule holds (a snag is never a free re-roll). |
| 50 | **A find takes a slot, has its own show and card, and counts for no fish record.** The Wick shows it in a find pose (the built five, holding a prop: no flaps); its card has **Keep** and **Let go**; kept stays kept; it never counts toward the catch key (§5.5), a species, a record, a class seal, a print, an order, the Old Ledger or a Wick's firsts (`FINDS.md` §2, §6). | The hold decides; the keys and every record stay about fish. |
| 51 | **Three kinds, and you sell what you keep.** A **treasure** is sold at the tally for its water's value tier × its grade (×2, 6, 15, 50 or 250); a **barge part** and a **look** are kept instead of sold (their slot is their price), never come twice, and are fitted or worn at every water (§4.10, `FINDS.md` §3). | "Sell for huge value or can upgrade our base or just be cosmetics", without a second currency or a sale given up. |
| 52 | **Each water its own set of eleven**, from its drowned works (`LORE.md` §3): five treasures (one per grade), three barge parts, three looks (one each for the Wick, the raft and the barge); the aquarium adds four well pieces (decision 58). Story clues and anything human are never finds. The Mossmere's eleven are `FINDS.md` §5.1. | Each water its own; the road's things gathered aboard as the sill gathers its stones. |
| 53 | **The jackpots are rare and huge** (*est.*): a water's jackpot comes home about 1 trip in 170–250 there and sells for 1.5–2.1 times its water's giant Trophy (the Mossmere's Toll-Keeper's Purse, 1,750); a rare treasure about 1 trip in 70, like a giant Prize. | "Huge value" as a dream that comes true a few times on the road (two or three jackpots in about 700 trips), never a promise (§16 question 20). |
| 54 | **A barge part never stands in for a shelf item and never changes a number.** It is a found fitting at an upgrade's place (§6.3) that changes how home looks and sounds, at home and from the water. | The shelf's 32 items in M1, its gates (decision 38) and the 48.9-hour pacing do not move; the sim needs no new price (§16 question 21). |
| 55 | **A find's odds are in the logs only**: the Keepsakes page's **Odds ›** shows its water's snag rate, kind share and grades. | §25.6.11's rule, as for every fish. |
| 56 | **The sim models finds and the pacing holds** (`FINDS.md` §11; the balancing job builds the finds table): M1's empty shelf within ±10% of a finds-off run and inside 2–4 h; the full run within ±5% of 48.9 h; finds at most 10% of all clams. | Finds must be felt and must not shorten the road. |
| 57 | **M1 step 5c brings the Mossmere's finds** (S–M), after 5b (§13). | A find's kinds land on the hold, the card, the settled shelf, the barge and its looks; after 5b nothing is found that has nowhere to go. |
| 58 | **The aquarium is the Slow Hearth's wet well, written now and built after M1** (`AQUARIUM.md`): a glass hatch at home; a swimming camera, no Wick; one room per water the barge has moored at; every species landed swims there, drawn from the Journal at the best print's size; its fittings and dressings are finds. | The user's row 20. Drawing from the Journal gives up no sale and keeps letting go a free choice; placing one fish per species would cost a sale per species and a second hold to manage (§16 question 22). |

**Sources.** v4 (commit 1aa478c) reconciled three proposals: economy, maps, and trip-and-home (§15). v5 (commit 3fc4a12) rebuilt the fish values, the catalogue and the build plan around the roster (commit d20aa74). v6 is v5 revised after the player's-advocate and builder critics (§0.1).

### 0.7 What v8.1 changed (finds from the water, and the aquarium after M1; 15 November 2026)

The user's words of 15 November 2026 (§0 rows 19–20) and the lead's defaults on them (QUEUE, "Finds from the water, and the aquarium"). §0.4, decisions 32–37, §5.5 and §8.7 are the three keys' and are not touched; finds never count toward the catch key.

| change | where | why |
|---|---|---|
| **The user's words**, verbatim, with the rulings | §0 rows 19–20, decisions 49–58 | they bind |
| **Finds**: the snag, the find show and card, a slot like a fish; treasures sold at the tally, barge parts and looks kept and fitted or worn; each water's set of eleven; the Keepsakes page; odds in the logs | §1, §3.1, §4.10 (new), §6.2, §6.3, §8.1, §8.2, §8.3, §8.6, §9 (save), §10, §12 | row 19; `docs/loop/FINDS.md` |
| **The sim requirement**: a finds table per water, its gates | §4.9, §4.10 | decision 56 |
| **M1 step 5c**: the Mossmere's finds | §13, `M1.md` §2.16 and §4 | decision 57 |
| **The aquarium** (the Well): written now, built after M1 | §6.3, §10, §12, §13 (after M1) | row 20; `docs/loop/AQUARIUM.md` |
| **Four new questions** for the user | §16 questions 20–23 | — |

### 0.6 What v7.3 changed (the home barge; 15 November 2026)

The user's words of 15 November 2026 (§0 row 18) and the lead's ruling on them: home is a barge that travels (QUEUE, "The home barge"; `docs/loop/M1.md` revision 3). §0.4, decisions 32–37, §5.5 and §8.7 are the three keys' and are not touched; the tow waits on a water's keys as §5.5 sets them.

| change | where | why |
|---|---|---|
| **The user's words**, verbatim, with the ruling | §0 row 18, decisions 43–48 | they bind |
| **Home is the home barge**, the Slow Hearth: one actor, moored at one mooring per water, Murk's barge alongside; the Jetty is the Mossmere's mooring, so slice 1a's home grows into it in place | §1, §2, §6 (rewritten), §10, §12 | the user's "it follows us" |
| **The mooring, the tow and the way back**: `LOOP.mooring`, the Chart picks the water and the home goes with it, the one-time tow on the Chart's leg, the ink dip back by the lamps | §5.3, §5.4, §6.5, §8.3, §9 (save) | "if we tow it with us when we move that makes sense" |
| **The raft tows the home** (a look and a scene, never a part) | §7 | — |
| **Home upgrades become the barge's**: the Bait Bed's roof planters, the Barge lights (was Landing lights; its key `home.lights` unchanged) on the rails, the Long Wall as the cabin's print gallery, the Order Board on Murk's barge, the looks on the barge, the raft and the Wick, the sill's sixteen stones, the legends' prints over the cabin door | §4.6, §4.7, decision 38, §4.9 (the item's name; the sim's print label in `clams.mjs` follows with its owner), §6.2, §6.3 | — |
| **M1 step 5 is the home barge** (5a M: the barge, its mooring, the home flow in the water scene; 5b L: slice 4 on it, the opening at the Landing and the first tow); it was the cove and the Landing (L + L) | §13 | the ruling |
| **The cove leaves M1, parked** | §10, §12, §13, decision 47 | — |
| **The ending travels**: Murk's banked fire aboard, raked open at the Inkwood's mooring | decision 48, `LORE.md` §8 | — |
| **Two new questions** for the user | §16 questions 18–19 | — |
| **The barge review's shoulds** (applied with the finds job, 15 November 2026): Murk's barge moored (its PointLight held at 0, no turning to the raft, never sent away on a trip); the opening shows the tow's 3D glide in; one reveal (the tow is the sheet's one ink-in); the hulls as circle obstacles; the barge's own save field `meta.loop.barge`; the ending's mooring clear of the Kitchen Stair; the tow's timing split and gated part by part | decisions 46, 48; §2.1, §5.4, §6.1, §6.2, §6.5, §8.3, §8.5, §9, §13 steps 1 and 5, §14 risk 22, §16 question 18 | `M1.md` §10.3 |

### 0.5 What v7.2 changed (M1, the Chart, the five passives; 15 November 2026)

The M1 plan (QUEUE job 5; `docs/loop/M1.md` is the milestone's done-list, build order, Chart plan and pacing). §0.4, decisions 32–37, §5.5 and §8.7 are kept for the three keys (v8, `gw-loop-access`), which lands after this revision; this one leaves clear hooks for it and decides none of its numbers. **M1's revision 2** (the two critics' review, `M1.md` §10) amended §3.5's giant rate, §5.4 (Murk's three on the Chart, the bait slot, the frozen catch list), §8.6 (two lines), §10's First Evening row, §13's M1 steps and §16 (questions 14–17) in place.

| change | where | why |
|---|---|---|
| **The user's words of 14 and 15 November 2026**, verbatim, with their rulings | §0 rows 10–17 | they bind M1 |
| **M1 first**: §13 re-cut into M1's six steps (QUEUE jobs 9–14), each slice's post-M1 part after them, marked "after M1" | §13, decision 41, `M1.md` §4 | the user's "Yes" (row 14) |
| **The world map is the Chart**: the bake as per-sheet crops, the live layer one shared module (`src/chart-draw.js`), each water's sheet the game's own; a list in slice 1a, drawn from M1 step 3; the tutorial's chart beat on it; the Map Table's top in the Landing | §5.4, §6.1, §6.2, §11, decision 40, `M1.md` §3 | "Yes make the map our in-game Chart" (row 13) |
| **Sealed until shipped**: `LOOP.shipped`; Sporewood's sheet "Coming soon" with its three seals until M1 is done | §5.4, §8.3, §8.6, §13, decision 39 | the re-cut; a road the player can see, and no dead button |
| **The shelf grows with the road**: an "on the shelf with" map for every hold step, raft part, home upgrade and look, set from the pacing run's eras | §4.2, §4.7, decision 38 | M1's arc ends at about 2.5–3 h (*est.*, `M1.md` §6) without grinding the cheapest water for later items; the full game's pacing does not move |
| **The five passives** (`WICKS.md` revision 3, its §5's pointers): Tallow the carrier (4 slots at the start, 4 to 9; at open water two more good bites than another Wick at the same step); the Wick's firsts; Taper's first bites and giants; Stub's waits and quiet water; Ashwick's comeback; their five lines | §0 rows 3, 4, 11, 12; §2; §3.1–§3.5; §4.1; §4.2; §4.9; §7; §8.1; §8.3; §8.5; §8.6; §9; §10; §10.1; §11; §13; §14; §15 | rows 11–12 |
| **The opening's pointers** (PLAN §7.2: "the Chart-integration docs commit"): §2.1's first rows; §8.1, §8.3 and §8.6 point to §8.5's opening table; §10's film row | §2.1, §8, §10 | `OPENING.md` |
| **The film's line 3** under the loop: "Its last candles fish from lamp to lamp." | §8.5, §10, §11, §13 step 1 | row 16 |
| **Pounds** in §8's number rule (the rest of pounds is `gw-pounds`'s; its §5.4 and §6.4 wording is carried here verbatim) | §5.4, §6.4, §8 | row 15 |
| **Names**: real river and lake names may ship | §0 row 9, §11, §14 risk 16 | row 17 |
| **The giants' page** shows the giants of the waters you own | §6.2, §6.4, decision 42 | nothing unowned is drawn |
| F16's "(built)" struck from §3.2 | §3.2 | PLAN §7.2, the lead's ruling 1 |
| **Two new questions** for the user | §16 questions 13–14, `M1.md` §8 | — |

### 0.4 What v8 changed (the user's rule of 14 November 2026: three keys to a new water)

Three designers worked on the rule (an audit of this spec and the sim, the economy and the mercy, the player's view). Their first figures came from patched scratch copies of `tools/sim/clams.mjs`. **The committed sim now models the gate** (its section 7, and the gated pacing run of section 5; 15 November 2026) **and every v8 figure in this file is its measurement** (§4.9, §5.5 (d) and (e)). The sim moved one knob: the pull's Keeper floor starts on the second evening at a water (decision 35). No price, tier or gear key moved.

| change | where | why |
|---|---|---|
| **Three keys open a water**: its lake map, its gear key and one of each fish on the list of the water before it. The keys gate sailing, never buying; opening is for good | §0 row 10, decisions 4, 32, §1, §2, §5.1 rules 1, 4, 5, 7, 8, 10, new rule 11, §5.5 | the user's words (§0 row 10) |
| **The gear table**: one existing item per water, no new item; T6 moves onto the shelf with the slot-9 map | decisions 11, 33, 37, §4.3, §7, §5.5 (b), slice 7 | every key is on the shelf before its map; the Thunder Stair would otherwise wait sealed |
| **The list rule and the 16 lists** (4 to 12 fish), marked in Appendix A | decision 34, §5.5 (c), Appendix A | "one of each fish species in the current area", without asking for giants, legends, later places or a hidden tin |
| **The pull**, the mercy that keeps luck from holding a water shut | decision 35, §3.6, §5.5 (d), §14 | "no way to fail"; without it the slowest lists take 4 to over 10 h at the 95th percentile (sim) |
| **Two route fixes** the gate exposed: an old water whose own fish bites only at night is fished from dusk; while a list is open the Wick fishes where and when a missing fish bites (the Journal route) | decision 21, §3.4 | the Candlewake Sturgeon was never landed on the natural route (6.7% of trips with the fix); day-water day fish on 0–2% of trips |
| **The bait-only fish named in full** (six, as the sim already had them; v7.1 named three) | §4.5 | the list rule needs the true set |
| **The words on screen**: three seals on the Chart, one number form ("7/12"), two Murk lines (one names the keys; one when a catch list completes, v7.2's, so three became two), the Journal's list page, a small seal on the card | §5.4, §5.5 (f), §8 | the user's "the UI must not be cluttered": no labels, one number |
| **The save**: `opened`, `pull`, `reveal`; the lists count the shared Journal, so catches from before the loop count | §9, §5.5 (c) | opening is stored and permanent |
| **The build plan**: the data shape and the Mossmere's Journal count in 1a; the rest where M1's plan places it; the live gate with Sporewood, after M1; each later slice opens its waters by the keys (§13 itself is v7.2's, unchanged) | §5.5 (h), `slice-1a/PLAN.md` | 1a's behaviour does not change; the gate goes live with Sporewood, after M1 |
| **Pacing**: kept at about 48 h, measured: the gated run buys everything in 47.6 h, the same as without the keys, and no water waits sealed | §4.9 | the sim's full run (166 checks); v7.1's 48.9 h became 47.6 h when the catch show was built (its seconds are counted once now), before the keys were added |
| **Five new questions** for the user, each with the default this spec builds | §16 questions 8–12 | — |

### 0.3 What v7.1 changed (three critics of v7)

Three critics reviewed v7: the art and the ramp, the engine and the rivers, the economy. Every finding was checked; 47 are applied, two partly; `WATERS.md` §10 lists each with its one-line reason.

| change | where | why |
|---|---|---|
| **The colour script measures and gates.** It paints each water in the camera's frame, measures each cell as `hue-report` does and fails on any gate; the ramp's targets (day +2.5 points a water, to 38%; dusk 0.88 and night 0.55 of day) are the measured, reachable values | `WATERS.md` §1, §7, §8 | v7's picture contradicted its own ramp (three reversals, two jumps) and its night targets were unreachable |
| **One foliage track**, inside the neon caps; the mirror never turns the water green; the sky gate is on sky pixels; no disc round the candle | `WATERS.md` §1, §3 | the first green the user would see broke the caps; the late waters' water turned green |
| **The Rime Sound and the Last Light re-themed** to be real steps up: a rainforest fjord with the ice only at its head; a near lighthouse island with a turf-and-fern cliff, reef breakers round the water | §5.2, `WATERS.md` §2, ROSTER §3 | they fought their slots (a step back after the requiem garden; a green sea) |
| **The rivers rebuilt**: an authored strip arena (reaches 170–240 m), a camera that follows the river and looks up the channel, the landmark at the first bend, white water that never cuts the lane, places in slack water beside it, a tide that moves no geometry, two-phase flow in the first river, casts along the channel, gorge walls as swept meshes, every polar consumer listed | §5.3, `WATERS.md` §4 | the reaches could not fit their arena; white water split the lane; the rivers would have been seen side-on |
| **The kit and its cost**: the Mossmere's built pads and reeds untouched, every new shader term compiled out at lush 0, cells on a grid, prototypes stamped, the cost line re-derived per pass and gated in slice 5 | `WATERS.md` §5 | the byte-identity test and the budget could not pass as written |
| **The build plan**: slice 1c ships switched off and in its own export; a river spike (1d) right after it; slice 6 re-scoped so every slice ships consecutive waters; `LOOP.chainSkip`; the river work split and re-estimated | §13 | 6a could not sell the Last Light without the Thin Water; a slipping river would freeze every later still |
| **The economy re-proven per water**: sim section 2b; three fish placed where their water needs them; plain baits, giants' lures, Fight terms and a price floor fixed; tiers and prices re-derived | §0 rows 28–31, §4, §5.2, Appendix A | Pyrefall Gorge and the Last Light failed checks no station ran; Rushlight Fen's tier halved at the Salt Gate |
| **The legends' trade put to the user** | §16 question 6, SUMMARY | the biggest legends now come at hours 21–26; the user had not been told |

### 0.2 What v7 changed (the user's words of 14 November 2026)

| change | where | why |
|---|---|---|
| The user answered §16: yes to all four defaults and the let-go rule | §0 row 8, §16 | they are decisions now |
| **The greening ramp**: a lushness step per water, 0 to 15, rising with unlock order; green on things, never in the air | §0 rows 9, 22; §5.2; §5.3; §11; `WATERS.md` | "progressively more and more lush and green" |
| **Six rivers** (the Thin Water, Pyrefall Gorge, the Thunder Stair, the Salt Gate, the Siltway, the Inkwood) on a new river layout with a visible current | §0 rows 9, 24, 25; §5.3; `WATERS.md` §4 | "some of the levels to be rivers" |
| **The twelve new waters re-ordered**: the cold rim first (the Rime Sound, the Thin Water, the Last Light, Pyrefall Gorge), the falls and the gate next (the Waxen Reef, the Thunder Stair, Rushlight Fen, the Salt Gate), the green heart last (Lampmoss Slough, the Siltway, Lanternroot Lagoon, the Inkwood) | §0 row 23; §5.2 | the sea and the ice sat where the lushest green must be |
| **Looks rewritten for the ramp**: every new water gains the green of its step; Lampmoss Slough's "green only as a trace on the pads" and the Inkwood's "Leaves are plum and dusk, never green" are gone; the Last Light gains a weed meadow, a turf-capped rock and a far green island ("no shore you can reach"); the built waters 2–4 gain first moss, moss on crystal and the requiem garden | ROSTER §2–§3, `roster.json` `look`, `WATERS.md` §2 | each water's look must match its step and kind |
| **No fish moved.** Every giant keeps its place, hour and share; all 164 fish keep their waters | ROSTER §3 | every giant's haunt is a pool, run, chute, eddy, bar, wreck, hole or ice hole its water keeps |
| **Every new-water number re-derived**: value tiers re-calibrated in the new slots; lake maps at 42 minutes of each water's income; T6 with the slot-10 map; Tallow Soap with the Thunder Stair (slot 10), Windfall Plum with the Inkwood (slot 16) | §4, §5.2, Appendix A, `tools/sim/clams.mjs` | the sim's 89 checks pass; the long game is 48.5 h |
| The sim's two late stations follow the slot (the 20 h station is slot 6, the 40 h station slot 12), and the "first new water" check reads slot 5 | `tools/sim/clams.mjs` | a re-order must not leave a check pointing at the wrong water |
| **Build plan**: slice 1c (first moss on the built waters, an art lane beside 1b); the vegetation kit in slice 5; slice 6 split into 6a (the first green new waters on lake layouts) and 6b (the river layout, first on the Thin Water); the slices renamed by reach; body plans re-sequenced | §13 | the greening lands as early as it can without touching slice 1a |
| Risks: phones and software GL, a green cast, the first step too big, moving water, the tide, Pyrefall Gorge's thin open water | §14 | — |

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

You are **the Wick**: a small living candle, one of the last of a drowned kingdom. Home is **the Slow Hearth**, an old barge-house of the kingdom that you found at the Landing and tow with you from water to water; the trader **Old Murk** moors his barge alongside it wherever it lies. You fish from a raft. Murk buys what you bring home and sells you everything else.

**The game in one breath.** Pick a water you have opened. Sail out for the evening. Catch fish; keep one or let it go. When the hold is full, go home. Murk pays clams. Clams buy a bigger hold, better tackle, lures, bait, a better raft, a better home, and the next map. When a new water opens, you tow your home there. Every map names a fish you cannot meet elsewhere, and 49 of the 55 promise a giant. A new water opens when you hold its map and its gear, and have landed one of each fish on the list of the water before. Now and then the line brings up a find instead of a fish: a treasure Murk buys, a part that upgrades the barge, or a look for the barge, the raft or the Wick (§4.10).

**Pillars (they replace §25.1's list; when two conflict, the higher wins).**

1. **Big and rare fish.** The rare giants are the dream. The size shows on the line; the species hides until the reveal.
2. **The hold decides.** Few slots, no promise. Every keep is final, and every let go is forgiven.
3. **Three keys open every water.** Its map (always on Murk's shelf, with its fish drawn on it and a price, and never a step down), the gear its fish call for, and one of each fish of the water before in the Journal.
4. **Art, atmosphere and fishing.** The Clear Night look, the lavender Starlit palette, waters that grow greener and lusher with every map, and very few words on screen.
5. **No way to fail.** Nothing is lost except the fish that got away.
6. **One thumb, short sessions.** A trip is 2–6 minutes, the visit home included. Everything is a tap or a hold.

---

## 2. The loop at every scale

| scale | length | the loop |
|---|---|---|
| **a cast** | 10–40 s | read the water → cast → wait → the tell shows the size → **strike**, or let it pass → the play runs itself → the reveal → the Wick holds the fish up → the card: **Keep** (it shows the clams) or **Let go**. A lost fish leaves the got-away note. Every bite you strike or pass spends one good bite of that water; a fish let go gives it back. |
| **a trip** (an evening) | 2–5 min on the water | the Chart: tap a water you have opened (the home goes with it, §6.5) → **Sail** → late day, dusk, night → fish your places first, open water to top up → the hold fills → **Home**. You may go home at any time. Nothing sends you home. |
| **a visit home** | 30–60 s | at the barge, moored on the water you fished: the tally: Murk buys the whole hold, fish by fish → the shelf: one thing is usually affordable → the Chart → Sail. |
| **a session** | 5–15 min | 2–4 trips and 1–4 purchases. A goal line shows the next one ("Next: Under the Span · 150"). |
| **an era** (one water) | 2–5 h | the lake map (its open, day and old water) → the tow: the home goes to the new water, once → its giants' lure → the crown of the water before → its night water and fifth place → the next lake map; with the next water's gear and the last fish of this water's list, the next water opens. |
| **the long game** | ≈ 48 h to buy everything | 16 waters, 55 maps, 16 Journal lists, tackle T6, hold 8, the raft and the barge built up, the home towed the whole road, 16 legends, about 68 giants and 66 Elders landed on the way. After that: the Journal's seals, the 49 giants' prints, records, legend rematches, the later sheets (§5.2). |

### 2.1 The first ten minutes (a fresh save, the game after M1 step 3; the default Wick)

| clock | where | beat |
|---|---|---|
| before 0:00 | the title | **New Descent** → the five Wicks, the lit one's line → **Start** → the film "One Warm Light" (18 s; line 3 "Its last candles fish from lamp to lamp.") → the 3 s glide home → Murk's wake line → the Chart (about 17.5 s at home untouched, about 5 s tapping through; `OPENING.md` §1). From M1 step 5: one ink dip to the Landing, drawn on the Chart → Murk's wake line there → the first tow (its leg up the Sluice Run on the Chart, 5 s; one ink dip; the raft towing the barge in to the Jetty, 3 s) → the Chart beat over the moored barge (about 25 s untouched; `OPENING.md` §6.2) |
| 0:00 | home | Murk: "Three slots in that hold. Fill them and come home." The Chart shows one sheet: the Mossmere (its first sheet inks in, the hold's empty slots ink in under it). **Sail.** (Tallow: "Four slots in that hold. Fill them and come home." and four slots; `WICKS.md` §2.4. The rest of this table is the default Wick's, the Wick's firsts aside.) |
| 0:15 | the Mossmere, late day | First cast. A double pop: a Small. The player strikes anyway. A Dusk Minnow. The Wick holds it up. Card: **Keep · 2** / **Let go**. Let go: the bite comes back, and the next fish here will run a little bigger. |
| 0:40 | | A plunge: a Keeper. A Weeping Carp: **Keep · 26**. One slot full. |
| 1:00 | dusk | The light turns. A Keeper Rustfin Sucker: **Keep · 9**. Two slots full. The float shows one good bite left. |
| 1:25 | night | A slow drag-under: a Prize. It lands (a Prize Reedjaw Pike lands 3 times in 10 on starter tackle): **Keep · 158**. The next cast is refused: "Hold's full." The Home pill pulses. |
| 1:40 | home | The tally: 26 + 9 + 158 = **+193**. Shelf: **Hold 4 · 30**, **Braided Gut · 50**, a map with a koi drawn on it, **60**. All three are bought. |
| 2:30 | | Trip 2 with four slots and a new place: the mist lifts off the Lily Maze. |
| 10:00 | | After 3–4 trips: hold 4, Line T1, the Lily Maze; 71 clams a trip on average. The next card on the shelf is **Under the Span · 150**, with a pike drawn on it longer than the Wick is tall. |

(The first trip above is a lucky one. The average first trip sells for 44 clams, and 52% of first trips have no Prize or bigger: the no-passive player's figures; each Wick's are `WICKS.md` check 4's. The first giant comes home at about hour 1.4.)

---

## 3. The rules

### 3.1 The hold

| rule | value |
|---|---|
| slots at the start | **3** (Tallow 4: §10.1) |
| slots at the most | **8** (Tallow 9) (five steps, bought in order, §4.2) |
| what takes a slot | one kept fish of any size; a giant, a legend and a curiosity take one slot each; **a find** (§4.10) takes one slot like a fish |
| a full hold | the cast is refused. One line: "Hold's full." The Home pill pulses. You cannot fish for sport with a full hold. |
| what empties it | only the tally at home. Murk buys every fish and every treasure in it; a barge part or a look is carried aboard and fitted or worn (§4.10). Nothing is carried over to the next trip. |
| on screen | a row of slot glyphs, top-left. A kept fish is a small ink fish in its slot, drawn bigger for a bigger class, gold-edged for a giant. A kept find is a small ink object (a coin for a treasure, a hull for a part, a ribbon for a look), gold-edged for a jackpot. |

### 3.2 Keep or let go

- The card opens after the Wick has held the fish up and paused. It has two buttons: **Keep** with the clam value, and **Let go**. From slice 3, holding **Let go** on a Small or a Keeper cuts it into 3 Cut Strips (§4.5) instead of letting it go; the button shows a knife while it is held. There is no third button.
- **Kept stays kept.** There is no way to take a fish out of the hold on the water.
- **Let go forgives.** A fish let go gives back the good bite it spent (§3.3), and every later bite at that water this evening runs bigger: favour +0.2 for each fish let go there, to at most +0.4. It pays no clams. Moving to another water starts again at 0.
- **Why.** In v5 letting go was never right: choosy play earned 67–79% of the natural rule per minute. Now it earns 88–95%, and 38–75% more clams a trip for 1.5–2 times the minutes, while the giant hunt stays at 9–50% (§3.3). Being choosy is a way to play, not a trap and not the best way.
- **The record is yours either way.** The Journal page, the personal best, the class seal and the ink print are written at the measure, before the card. Selling a fish or letting it go loses none of them. (The Old Ledger's double is paid only on a sale, from slice 9; §4.1.)
- **Let it pass** stays: no tap during the bite, and the fish lets go; the bait comes back. It spends a good bite, and nothing gives it back. A passed Prize or bigger lingering 45 s for one more cast (F16) is not built and is dropped for slice 1a (the lead's ruling, PLAN §7.2); were it built, that cast would spend a bite from the place where the fish first bit.
- **Ashwick's comeback** (`WICKS.md` §2.5): a hooked fish that gets away from Ashwick (not a giant, not a legend, not a line cut by sailing away) is the next bite at that water this evening, the same fish, tired (+4 Hold), once. It spends a good bite like any bite (a let-go comeback refunds as built), and a fish that will come back is not also marked.

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
| open water (the whole water, one pool) | **one per slot of your hold, plus one** (4 to 9; **Tallow: two more at the same step**, 6 to 11: one per slot of its bigger hold, plus one, plus its own one) | 0 | where you start; later, the top-up |
| day water | **2** | +0.55 | its day fish; its water's uncommon and rare fish, drawn 1.5 times as often |
| old water | **3** | +0.55 | **Elders bite here**, and most giants live here |
| night water | **2**, only after dark | +0.45 | the night fish, and night giants |
| crown (a legend's pool) | **2** | +0.35 | the legend, on her bait in her hour |

- **At any place, commons bite half as often**: the place's own fish crowd out the small fry. That is what makes the sail to a place worth it.
- A quiet place is still better than quiet open water for a bite or two. Nothing ever stops biting: the hold can always be filled.
- **Stub's waits** (`WICKS.md` §2.3): every wait for a bite is ×0.75 (not on a legend cast); past the good bites Stub's bites keep the fresh wait and lose 0.08 favour a bite instead of 0.15, to the same −1.2. Only Tallow changes a good-bite count; only Stub changes quiet water.
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
| 20 h: T5, hold 8, three Thin Water places (16) | 3,585 · 4.3 | 103% | 102% | 75% | 94% | 81% | 30% | 15% |
| 40 h: T6, hold 8, four Salt Gate places (18) | 28,209 · 4.5 | 102% | 100% | 89% | 95% | 85% | 50% | 21% |

- **No patient strategy reaches the natural rule per minute** (the best is 89%). **The giant hunt earns 9–50%**: a giant is too rare to fill a hold with, even when every let-go fish gives its bite back.
- **The natural rule is within 4% of the best rule found**, so playing by feel is playing well.
- **The rule is needed.** With quiet water switched off, "only Trophy+, stay till full" brings **2.1–3.9 times** the clams per trip; players would drift into it.
- **Choosy play is a real choice**: 88–95% of the natural rule per minute, and 38–75% more clams a trip for 1.5–2 times the minutes. On every new water at the kit it is bought with (sim section 2b, over 6,000 trips): 87–104%.

### 3.4 Every trip is an evening

| phase | water time | favour | what bites |
|---|---|---|---|
| late day | the first **40 s** | 0 | fish whose hour is day or any |
| dusk (*Last Light*) | the next **20 s** | +0.2 | day, dusk and any fish |
| night (*Night Rise*) | **until you turn for home** | +0.25, +0.1 per Lantern level | dusk, night and any fish; night water opens |
| dawn | the sail home and the tally | — | you come home at first light |

- **A fish's hour is a window that runs into the next phase**: the roster's "day" bites by day and dusk; "dusk" at dusk and night; "night" at night; "day, dusk" and "dusk, night" as written; "any" always; "any, best at night" always, half as often again after dark.
- **The natural route.** Old water first, then day water while it is light, night water when dark falls, open water to top up. An old water whose giant bites only from dusk (its card's hour glyph) is fished at dusk: the Wick waits there for the light to turn. v8: so is an old water whose own fish bites only from dusk (the Pallid Deep's Chain Garden and its Candlewake Sturgeon).
- **The Journal route** (v8). While the water's list has fish missing (§5.5), the Wick first fishes a place where a missing fish bites in the current light, waits there for dark when its missing fish bite only at night, and tops up in open water. It is the player reading the Journal's silhouettes, whose place and hour glyphs say where and when each one bites. The sim models it; the plain natural route is printed beside it as a contrast.
- The clock runs on the water only. It stands still during a catch's ceremony and card (built: the cinematic freeze), in menus and at home. Nothing ends the night.
- **Two built clock rules change.** v3's 30 s Arrival Hush on day 1 is 0 under the loop (every trip would otherwise open with +0.2 the sim does not model). The night's length is `null`, read as "no end": `getPhaseDurations` reports the night as open, the HUD draws no clock, and the oil "need" sum is not computed (oil is parked). Tests: no hush term on a trip's first cast; no NaN in `getPhaseInfo` after 10 minutes of night.
- Trips are counted as evenings ("Evening 14" on Journal entries), not days.
- With 3 slots and 4 good bites, 63% of first trips get a bite after dark (the no-passive player; Tallow's 6 good bites about 94%, *est.*; every Wick ≥ 50%, `WICKS.md` check 4). A bigger hold reaches deeper into the night.
- A legend keeps her hour for the sure bite (§3.5). Waiting for dark on purpose pays 72–89% of the natural rule per minute: allowed, never needed.

### 3.5 The rare giants

The roster's 49 giants (★) are the descendants of the episodes' main fish: 33 **epic** giants, one at each of 33 places, and 16 **legendary** giants, one in each water's crown.

| rule | value | why |
|---|---|---|
| **where** | an epic giant bites only at its own place (`placeName` in the roster), never in open water or elsewhere | a map is the promise of a giant: buying its map is the only way to meet it |
| **how often** | a fixed share of the bites at its place: **6% in its hour, 2.5% outside it**; its water's giants' lure makes the share ×1.5. Family lures do not draw giants. Taper's passive makes it ×1.3, never above 12% of bites (`WICKS.md` §2.2). | it comes, but rarely; the share does not swing with what else bites in that hour |
| **how big** | never Small (z ≥ −0.25); its bites run big (favour +0.3); **it may be an Elder at its own place**, whatever the kind of place (roster ask 1). Every other fish reaches Elder only in old water. | the giants have the longest ladders in their waters (roster σ 0.16) |
| **how hard** | Fight +10 over a rare of its water, +12 as an Elder. On its water's arrival tackle a Prize giant lands 27–34% of the time in the built lakes and 39–50% in the new waters, less than any other fish there and never more than a legend's coin flip (sim 4b checks every giant: 30–50% for the new waters). | "the hardest fish to land, never certain" |
| **what it pays** | rarity ×12 (a rare is ×5.5). At the same size class the cheapest giant of a water sells for at least 1.7 times its dearest other fish (sim 1 checks every water). | "the top of the value ladder" |
| **when lost** | the got-away note names it and its rough size; the giant becomes a Marked Fish: it waits at its place, +6 Hold on its next hook, once (the built light Marked Fish), for every Wick: Ashwick's comeback never applies to a giant (`WICKS.md` §2.5) | no fail; the story continues |
| **on the map card** | a lake map's card names its old water's giant; a place map's card names its own giant (a crown names its legend). The giant is drawn life-size beside the Wick, with its hour glyph (§5.1 rule 9). | the promise is visible before you pay |

**How rare is the big one** (sim 4b: the natural rule at the water's arrival tackle, that place and open water only, hold 6; a few of the 33 rows):

| place | its giant | tackle | a Prize lands | it bites on | comes home on | with the giants' lure |
|---|---|---|---|---|---|---|
| Under the Span (the Mossmere) | Thousandcast Pike (dusk) | T1 | 27% | 18% of trips | 4.6% (1 in 21) | 13.1% (1 in 7) |
| The Buoy Lights (the Mossmere) | Hullkiss Lamprey (night) | T1 | 27% | 12% | 4.3% (1 in 23) | 9.9% |
| The Gill Harp (Sporewood) | Harpstring Eel | T2 | 31% | 19% | 7.3% | 15.7% |
| The Well of Ledgers (Glasswater) | Prismdrop Sturgeon | T3 | 32% | 16% | 6.7% | 14.7% |
| The Broken Weir (the Thin Water) | Weirflame | T5 | 48% | 18% | 10.1% | 17.9% |
| The Sluice Throat (the Salt Gate) | Sweetwater Shark (dusk, night) | T6 | 46% | 17% | 7.3% | 17.3% |
| The Fjord Floor (the Rime Sound) | Icedoor Flounder | T5 | 50% | 17% | 10.3% | 18.8% |
| The Kitchen Stair (the Inkwood) | Emberbelly | T6 | 39% | 16% | 8.2% | 16.8% |

The Mossmere's two giants are the hardest to bring home (about 1 trip in 21 and 1 in 23 on T1, the table above), as the Thousandcast Pike's journal line promises ("Follows the lure to the raft, looks at you, and leaves. Ten thousand times."). A dusk or night giant at an old water bites at dusk because the Wick waits for it (§3.4); the hour glyph on its card says when to come.

**Legends.** The built legend rule stays for all 16: her bait, her hour and her pool give a sure bite; the land chance is never above 50% (the sim checks all 16 at T6 with wounds); each escape wounds her (+6 Hold, to +18, kept across trips). Her odds are the persistent-gear ones (`CATCH_V3.legend.fight`, `perRun: false`; §9). She needs a free slot and takes one. She is paid at the tally: her first landing pays her crown map's price; later landings pay 40%. **No legend opens anything** (§4.6).

### 3.6 No way to fail

- No health, no hunger, no oil to run out of, no death, no timer, nothing that takes a kept fish or a clam.
- The lantern always burns. It is light and atmosphere, and its level (§7) changes how far it reaches.
- Closing the game mid-trip loses nothing: *Continue* restores the hold, the bites spent, the clock and the raft's place (built autosave).
- **A trip ends only at home.** The built pause menu's *Abandon Descent* and the title's *New Descent* would throw a full hold away and count a death. Under the loop the pause menu offers **Home** (the tally) in their place, and while a trip is out the title offers only **Continue**. A trip ends only through `endRun('home')`: no deaths, no best day, no summary, no death screen. Slice 1a test: no path from the pause menu or the title empties a hold without selling it.
- The only loss in the game is the fish that got away, and its note names it.
- **Luck never holds a water shut** (v8). A listed fish not yet in the Journal is pulled toward the hook a little more each evening you fish its water, and from the ninth evening it is the first bite wherever it can bite (§5.5 (d)). The 95th-percentile player lands a whole list well within the time they spend at that water anyway. A giant or a legend is never on a list.

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
| 5. The Rime Sound | 45 | 70 | 483 | 1,161 | 2,856 | 7,335 |
| 6. The Thin Water | 69 | 84 | 623 | 1,400 | 3,443 | 8,841 |
| 7. The Last Light | 62 | 79 | 751 | 1,580 | 3,885 | 9,976 |
| 8. Pyrefall Gorge | 118 | 101 | 1,085 | 2,448 | 6,021 | 15,460 |
| 9. The Waxen Reef | 167 | 192 | 1,535 | 3,472 | 8,541 | 21,933 |
| 10. The Thunder Stair | 203 | 205 | — (no rare) | 4,208 | 10,350 | 26,580 |
| 11. Rushlight Fen | 336 | 310 | — (no rare) | 6,499 | 15,984 | 41,047 |
| 12. The Salt Gate | 269 | 302 | 2,853 | 6,923 | 17,028 | 43,729 |
| 13. Lampmoss Slough | 608 | 867 | 5,590 | 12,144 | 29,870 | 76,707 |
| 14. The Siltway | 794 | 854 | 6,873 | 17,281 | 42,504 | 109,151 |
| 15. Lanternroot Lagoon | 866 | 1,055 | 8,575 | 18,978 | 46,678 | 119,872 |
| 16. The Inkwood | 1,675 | 1,618 | 13,057 | 31,002 | 76,252 | 195,818 |

The tiers are uneven (Rushlight Fen 336, the Salt Gate 269; Pyrefall Gorge 118, the Last Light 62) because the waters' fish are uneven: each is set by the two ladder rules of decision 10, so each water pays what the next map promises. **No water's giants are a step down**: a Keeper giant sells for at least 0.8× the water before's (the sim checks it; the worst is 1.07, Rushlight Fen to the Salt Gate, where v7 had 0.65). A thin pool forces a high tier, so the water after it would look poorer; v7.1 thickened the Fen's pool (decision 29) instead of hiding it.

Worked values (tests in slices 1a–2 use them): a Keeper Dusk Minnow (z 0.4) sells for **7**, a Keeper Weeping Carp **26**, a Prize Reedjaw Pike (z 1.4) **158**, a Trophy Reedjaw Pike (z 2.2) **406**, an Elder Reedjaw Pike (z 2.95) **1,022**, a Keeper Thousandcast Pike **150**, a Trophy Thousandcast Pike **944**.

**Two extras, both paid at the tally.** A fish that fills one of **Murk's orders** sells for double (§6.3). **From slice 9**, a fish that beats Murk's **Old Ledger** figure for its species (a mid-Trophy, built) sells for double, once per species. The loop keeps its own record of it, `meta.loop.ledgerPaid: [speciesId]`, written only when that species is sold, because the built `entry.oldLedger` is set at the measure (kept or not) and an old save has already used it. A record fish let go keeps its record but not the double.

**The Wick's firsts** (`WICKS.md` §2.1). When the Wick is the Wick (Curious), a kept fish that is a first in this New Descent (a kind not caught before; its first Prize, Trophy, Elder or Ancient; a new personal best) sells for more at the tally: `max(round(0.4 × tier), round(0.5 × base))` (`firstMult` ×1.5, `firstFloor` 0.4), one bonus a fish, never on a giant or a legend; with an order or the Old Ledger the larger applies, never both. The card's **Keep** shows the base price for every Wick; the tally row ticks the bonus. `LOOP.priceFactor` (×1.0 in 1a) is the balancing job's one common price factor (`WICKS.md` §3.2).

### 4.2 The hold ladder

| hold | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|
| name | Wicker Creel | Lidded Creel | Double Creel | Wellbox | Ferry Hamper | Harbour Chest |
| price | start | **30** | **120** | **450** | **2,000** | **3,500** |
| bought at about (pacing run) | — | trip 1 | 0.4 h | 2.5 h | 6.8 h | 10.7 h |
| clams a minute, when bought | — | +9% | +3% | +1% | +1% | −2% |
| clams a trip, when bought | — | +32% | +20% | +18% | +15% | +8% |
| price, in trips of income then | — | 0.8 | 1.6 | 1.1 | 1.5 | 1.5 |

Open water's good bites grow with the hold (one per slot, plus one), so a bigger hold is a longer good evening, not a longer quiet one. Even so, only Hold 4 makes you faster: past it, each new slot is filled from open water, which is poorer than your places, so clams a minute stay about level while each evening grows. **Hold 5–8 are bigger evenings, priced like looks**: one or two trips each. The hold stops at 8 (Tallow: 9; its trips held to ≤ 6 min by `WICKS.md` check 1, or its hold stops at 8, §2.4's fallback) so trips stay under 6 minutes. (A slower visit home makes bigger holds worth more per minute; slice 1a measures it.) Tallow's hold is one slot bigger at every step (4 to 9) at the same prices; the step's name is the ladder's (`WICKS.md` §2.4); the figures above are the no-passive player's. **On the shelf with** (decision 38): Hold 4–6 from the start, Hold 7 with the Glasswater map, Hold 8 with the Pallid Deep map.

### 4.3 Tackle (Rod, Line, Reel: the global gear)

The tiers T0–T4, their names and their Hold are `TACKLE` as built (§25.6.6). Each slot is bought on its own. **Proof catches are gone.** T5 and T6 are new. **Some single pieces are a water's gear key** (v8, §5.5 (b)): the last column names the water each one opens, with its map and the list of the water before.

| tier | Rod · Line · Reel | Hold (rod / line / reel) | price per slot | on the shelf with | the gear key to (v8) |
|---|---|---|---|---|---|
| T0 | Willow Switch · Twine · Wooden Winch | 0 / 0 / 0 | start | — | — |
| T1 | Ashwood · Braided Gut · Brass Spool | 2 / 2 / 2 | **50** | start | Rod: Sporewood |
| T2 | Whalebone · Waxed Silk · Clockwork | 5 / 5 / 5 | **300** | start | — |
| T3 | Glassreed · Glass-Gut · Whisper Drag | 8 / 9 / 8 | **1,200** | the Sporewood map | Rod: Glasswater |
| T4 | Lantern-Spine · Silverthread · Tidewheel | 12 / 13 / 12 | **6,000** | the Glasswater map | Rod: the Pallid Deep |
| **T5** | **Bellwether · Starthread · Moonwheel** | 15 / 16 / 15 | **32,000** | the Pallid Deep map | Reel: the Rime Sound · Line: Pyrefall Gorge · Rod: the Waxen Reef |
| **T6** | **Crown-Reed · Kingshair · Last Wheel** | 18 / 19 / 18 | **100,000** | the slot-9 map (the Waxen Reef; v8, decision 37; v7.1: the slot-10 map) | Rod: the Thunder Stair · Line: Rushlight Fen · Reel: the Salt Gate |

Tackle matters most where the fish fight hardest (sim section 3, clams per trip at hold 8, the water's ordinary places): the Mossmere 308 at T0 and 535 at T6 (+74%); the Pallid Deep 367 and 1,821 (×5.0; v8: its Chain Garden is fished from dusk, decision 21); the Inkwood 4,858 and 74,953 (×15). Each new water's Fight term follows its slot: 30–32 on the T5 waters (the Rime Sound 31, the Thin Water 31, the Last Light 30, Pyrefall Gorge 30, the Waxen Reef 32) and 39–44 on the T6 waters (the Thunder Stair 40 rising to the Inkwood 44); the built lakes are 0 / 7 / 16 / 24. It is set so a new water's giant at Prize lands **39–50%** of the time on the tackle the water is bought with (sim section 4b checks 30–50%), a little above the built lakes' giants (27–34%): the new tackle is a small reward, and no giant lands more often than a legend's coin flip.

### 4.4 Lures (permanent, one fitted)

Lures are bought once and kept for good; a snapped line never loses one. **Family lures** draw and help a family (built `LURES`, `CATCH_V3.items`): Feather Fly **50** (insect feeders, +5 Hold) · Glimmer Spoon **90** (predators, +6) · Bone Jig **110** (bottom feeders, +6) · Moth Popper **400** (night-only fish at night, +6; with the Sporewood map) · Lantern Lure **4,000** (glow fish, +8; with the Glasswater map). They do not draw giants.

**Giants' lures**, one per water, **+10 Hold** on the fish named and a ×1.5 share for its giants. The four built ones are **re-aimed at their lake's giants**; twelve are new, each priced at 0.3 of its lake map. Each goes on the shelf with its water's map.

| lure | water | +10 Hold on | price |
|---|---|---|---|
| Harbour-Bell Spinner | The Mossmere | Thousandcast Pike, Hullkiss Lamprey, Reedjaw Pike | 180 |
| Spore-Lamp Fly | Sporewood Pools | Harpstring Eel, Festival Puffer, Emberbrood Snakehead | 500 |
| Mirror Shard | Glasswater Vault | Shardspine Eel, Wolfwake Trout, Prismdrop Sturgeon | 2,400 |
| Ferryman's Coin | The Pallid Deep | Gilt-Eyed Eel, Candlewake Sturgeon, The Clapper | 9,000 |
| Rime Pirk | The Rime Sound | Icedoor Flounder, Coalwing Skate, Bellrope Cod | 8,900 |
| Weir Spoon | The Thin Water | Weirflame, Blotback Catfish, Slipwhisker | 11,000 |
| Lighthouse Feather | The Last Light | Nightsail Lancer, Castaway Pike, Starbar Lancer, Ambersickle Tuna; draws every predator as the Glimmer Spoon does | 13,700 |
| Ember Wobbler | Pyrefall Gorge | Pyregold Carp, The Unfinished, Lampspot Snakehead, Almsfed Carp | 18,000 |
| Wax Jig | The Waxen Reef | Anvil Trevally, Spirewatch Pike, Mothlance Gar, Cabin Grouper, Picket Pike | 25,500 |
| Thunder Plug | The Thunder Stair | Lampeye Perch, Soapthief, Cocoon Sleeper, Swallowtail Catfish | 39,500 |
| Rushlight Spinner | Rushlight Fen | Packtooth, Reedwalker Catfish, Foamnest Pike | 60,400 |
| Tide Spoon | The Salt Gate | Sweetwater Shark, Tideghost Shark, Inkmarble Eel, Longlash Ray, Dusk Drummer | 82,800 |
| Moss-Lamp Jig | Lampmoss Slough | Weirshadow Catfish, Old Portcullis, Lampspot Snakehead, Spotmail Gar | 108,300 |
| Silt Rattle | The Siltway | Sternlamp Catfish, Dapplewheel Ray, Millstone Catfish, Tallyside Catfish | 132,200 |
| Root-Lamp Popper | Lanternroot Lagoon | Snagheart Bass, Votive Shark, Rootjaw Catfish, Stiltshadow Shark, Harbourdrum Grouper | 200,100 |
| Ink Fly | The Inkwood | Emberbelly, Nightcreek Hound, Smilejaw Bream, Gourdcracker, Starback Ray | 295,100 |

(A new giants' lure names its water's epic giants and its two biggest rare or uncommon fish, rares first (v7.1; it named only the longest rare, so the Thunder Plug, in a water with no rare, named two fish and cost the pacing player 18% a trip). The Lighthouse Feather is also a predator's lure: in the open sea, where nearly every fish is a predator, it draws them as the Glimmer Spoon does. The player fits whichever lure pays best, measured, and the sim checks that every giants' lure, fitted on the tackle you settle with, earns at least 97% of the best family lure: they earn 2–29% more. The names are drafts, to be confirmed when each sheet is scheduled, as roster ask 5 says.)

### 4.5 Bait (consumable, one fitted beside the lure)

- A **tin holds 10** and is **Murk's bait for one water**. **Every tin in a water costs the same: 1.5 × that water's value tier** (rounded to 5). One bait is spent per hooked fish (built: spent at the cast, refunded when the bite is let pass). With no bait you fish a bare hook; that is always allowed.
- **Every tin does the same two things**: every fish runs bigger (favour +0.3), and the fish that favour it hold better (+5 Hold; the built tins keep their built Hold; the roster's `favours` say which fish). Where the lure and the bait both give Hold, the fish gets the larger, never both (built). **A tin does not change which fish bite**, except that a fish that bites on one bait only needs it: the Gloam Eel and the Sleepspore Jelly on Lumen Moss, the Threadling Eel on Spore Cake, the Chime Jelly on Glass Larvae, the Blind Scrivener and the Lampwarden Angler on Ember Roe (v8 names all six, as the sim and the built `bait` field always had them; v7.1 named three). So picking a tin is picking the fish you are after. A bait-only fish whose bait is its water's plain bait (the Threadling Eel, the Blind Scrivener, the Lampwarden Angler) is on its water's list; one that needs another tin is not, so no tin is a hidden key (§5.5 (c)).

| a tin of 10 | the Mossmere | Sporewood | Glasswater | the Pallid Deep | the Rime Sound | the Thin Water | Rushlight Fen | the Salt Gate | the Inkwood |
|---|---|---|---|---|---|---|---|---|---|
| any bait | **10** | 15 | 25 | 55 | 70 | 105 | 505 | 405 | 2,515 |

| bait | helps hold | first on the shelf with |
|---|---|---|
| Mire Worms | bottom feeders and insect eaters the roster names | the Mossmere |
| Lumen Moss | glow fish; the Gloam Eel and the Sleepspore Jelly bite on nothing else | the Mossmere |
| Spore Cake | Sporewood's spore feeders; the Threadling Eel bites on nothing else | Sporewood |
| Ember Roe | predators the roster names; the Blind Scrivener and the Lampwarden Angler bite on nothing else | Sporewood |
| Glass Larvae | Glasswater's glass fish; the Chime Jelly bites on nothing else | Glasswater |
| Shimmerfly | night risers | the Pallid Deep |
| **Windfall Plum** (new) | the Inkwood's fruit eaters (a tin you pick for them; the Inkwood's plain bait is Mire Worms) | the Inkwood (slot 16) |
| **Tallow Soap** (new) | whiskered scavengers | the Thunder Stair (slot 10) |
| **Cut Strip** (free) | +0.3 favour on predators, +4 Hold. Holding **Let go** on a Small or a Keeper cuts it into 3 strips (from slice 3). The roster's most-named bait (60 fish). The sim does not model it. | — |

Each water's **plain bait** (the tin its fish name most, unless another tin beats it; the Bait Bed's free bait): Mire Worms for the Mossmere and ten of the new waters (the Inkwood among them: its fruit eaters are few), Spore Cake for Sporewood, Ember Roe for Glasswater and the Pallid Deep, Shimmerfly for the Last Light and Lanternroot Lagoon (their fish favour no one tin).

What a tin is worth (natural rule, net of the tins; sim section 4): +10% clams a minute at hour 1 (Mire Worms, the Mossmere; a tin earns 4.9 times its price), +21% at hour 5 (Spore Cake, Sporewood; 8.9×), +14% at hour 10 (Ember Roe, Glasswater; 7.5×), +13% at hour 20 (Mire Worms, the Thin Water; 6.1×), +8% at hour 40 (Mire Worms, the Salt Gate; 7.3×), and on every new water at the kit it is bought with +10–17% (4.4–9.1×; sim section 2b). **Worth buying, never a must.** **No tin is the one to buy**: at hours 10, 20 and 40, and on every new water, no other tin beats the water's plain bait by more than 1.8 points a minute (the check allows 3). Small fish have four uses: a slot when nothing better comes, an order, a let go that makes the next fish bigger, or Cut Strip.

### 4.6 Legends

| legend · crown | her bait, per try | first try lands (tackle) | tries expected | bait in all | first landing pays | later landings |
|---|---|---|---|---|---|---|
| The Belled Matriarch · the Bell Pool | Heartmoss Ball **60** | 27% (T1) | 2.8 | 169 | **500** | 200 |
| The Drifting Grove · the Mother's Cup | Glowcap Bulb **250** | 24% (T2) | 3.0 | 759 | **2,200** | 880 |
| The Glass Sovereign · the Fallen Chandelier | Prism Moth **1,000** | 21% (T3) | 3.2 | 3,221 | **7,500** | 3,000 |
| The Lantern-Swallower · the Bottomless | Last Candle **3,000** | 17% (T4) | 3.5 | 10,595 | **19,000** | 7,600 |
| The Long Winter · the Half-Mile Line | Old Ration **3,150** | 27% (T5) | 2.8 | 8,932 | **20,000** | 8,000 |
| The Buried Moon · the Moonbed | Lamp Snail **3,310** | 27% (T5) | 2.8 | 9,386 | **21,600** | 8,640 |
| The Jetsam Shark · the Unlit Mile | Lighthouse Ration **3,480** | 27% (T5) | 2.8 | 9,846 | **26,900** | 10,760 |
| The Ashen Guest · the Last Pyre | Charred Offering **4,240** | 28% (T5) | 2.8 | 11,761 | **35,300** | 14,120 |
| The Waxen Abbot · the Abbot's Cellar | Lantern-Fry **6,020** | 26% (T5) | 2.9 | 17,466 | **50,200** | 20,080 |
| The Last Lock · the Throat | Wired Bream **9,310** | 26% (T6) | 2.9 | 26,949 | **77,600** | 31,040 |
| The Long Thunder · the Dam Foot | Storm Candle **14,240** | 27% (T6) | 2.8 | 40,289 | **118,700** | 47,480 |
| The Old Shipwright · the Slipway | Tide Mullet **19,540** | 27% (T6) | 2.8 | 55,409 | **162,800** | 65,120 |
| The Last Sentry · the Sentry's Reach | Carp Cutlet **25,550** | 25% (T6) | 3.0 | 75,720 | **212,900** | 85,160 |
| The Barge-Shadow · the Long Hole | Bargeman's Supper **31,210** | 23% (T6) | 3.1 | 95,444 | **260,100** | 104,040 |
| The Silver Regent · the Sighing Pool | Moth-Wing Fly **47,220** | 22% (T6) | 3.1 | 148,143 | **393,500** | 157,400 |
| The Banked Fire · the Breathing Mere | Blossom Fly **69,640** | 21% (T6) | 3.2 | 224,293 | **580,300** | 232,120 |

- A new legend's Fight is her water's Fight term + 26 (the built four are `CATCH_V3.legend.fight` as built, never `fightRun`); her bait costs 12% of her crown map, and never less than 1.05× the slot before's (v7.1).
- **No legend opens anything.** A legend is a crown, never a key. Her print hangs along the home barge's cabin eaves, above the door; her stone on its sill is gilded (§6.2).
- Tests: the game's first-try chance on the Belled Matriarch at T1 equals the sim's 27% (slice 2); the Lantern-Swallower's at T4 equals 17% (slice 5).

### 4.7 The raft and the home (the tables are in §7 and §6)

| what | levels | prices | on the shelf with (decision 38) |
|---|---|---|---|
| Oars | I–II | 60 · 300 | the start |
| Keel | I–III | 100 · 600 · 3,000 | I–II the start · III the Pallid Deep map |
| Lantern | I–II | 100 · 500 | the start |
| Murk's Order Board | I–III | 70 · 400 · 4,000 | I–II the start · III the Glasswater map |
| Bait Bed | I–III | 120 · 700 · 9,000 | I–II the start · III the Pallid Deep map |
| The Long Wall | 4 wings, one per reach | 250 · 30,000 · 80,000 · 150,000 | wing I the start · II–IV their reach's first lake map (waters 5, 9, 13) |
| Barge lights | I–III | 200 · 1,200 · 14,000 | I the start · II the Glasswater map · III the Pallid Deep map |
| Looks (9) | — | 300 · 400 · 600 · 2,500 · 6,000 · 40,000 · 50,000 · 100,000 · 200,000 | the first three the start · the Painted Prow the Glasswater map · the Bell Buoy the Pallid Deep map · the Gilt Lantern, the Reed Sail, the Star Pennant and the Moon Lamp waters 5, 7, 11 and 15 |

Each gate is the era in which the pacing run of §4.9 buys the item, so the full game's buying order is unchanged; the sim checks that no pacing purchase comes before its gate. In M1 (the Mossmere alone) the shelf is therefore 32 permanent items, 7,750 clams (`docs/loop/M1.md` §2.5, §6). The home and raft items are first sold in M1's steps (§13): the raft parts and the Order Board in step 4, the Bait Bed, the lights, the wing and the looks in step 5, on the home barge.

### 4.8 Maps (the catalogue is §5.2)

| water | lake map (opens its open, day and old water) | night water | fifth place | crown |
|---|---|---|---|---|
| 1. The Mossmere | yours (day water 60 · old water 150 are place maps) | 260 | — | 500 |
| 2. Sporewood Pools | **2,000** | 1,200 | 1,100 (old) | 2,200 |
| 3. Glasswater Vault | **10,200** | 4,800 | 4,000 (old) | 7,500 |
| 4. The Pallid Deep | **26,000** | 14,000 | — | 19,000 |
| 5. The Rime Sound | **29,700** | 14,700 | — | 20,000 |
| 6. The Thin Water | **36,600** | 15,700 | — | 21,600 |
| 7. The Last Light | **45,600** | 19,600 | — | 26,900 |
| 8. Pyrefall Gorge | **59,900** | 25,800 | — | 35,300 |
| 9. The Waxen Reef | **85,100** | 36,600 | 33,200 (old) | 50,200 |
| 10. The Thunder Stair | **131,600** | 56,600 | — | 77,600 |
| 11. Rushlight Fen | **201,200** | 86,500 | — | 118,700 |
| 12. The Salt Gate | **275,900** | 118,600 | 107,600 (night) | 162,800 |
| 13. Lampmoss Slough | **360,900** | 155,200 | — | 212,900 |
| 14. The Siltway | **440,800** | 189,500 | — | 260,100 |
| 15. Lanternroot Lagoon | **667,000** | 286,800 | 260,100 (night) | 393,500 |
| 16. The Inkwood | **983,500** | 422,900 | 383,600 (old) | 580,300 |

The four built lakes keep their order; the Mossmere keeps its prices; the other three are re-priced (each lake map is v5's lake map plus its day and old water). A new water's lake map costs about 42 minutes of its own income fully mapped; its place maps are shares of it: night 0.43, fifth 0.39, crown 0.59. v7 re-derived these for each water in its new slot (§0 decision 26), and v7.1 again after its fixes: the lake maps rise every slot, from 29,700 to 983,500, and **so does every other price**: a slot's night water, crown, fifth place and legend bait cost at least 1.05× the slot before's (v7.1 added the floor: the Rime Sound's night water, crown and legend bait were below the Pallid Deep's). The Rime Sound's lake map is only 1.14× the Pallid Deep's and less than one T5 slot (32,000): the first new water comes within reach while the T5 tackle is still being bought (§14 risk 17).

**v8.** Buying a lake map inks its water on the Chart, sealed. The water opens for sailing when its gear key and the list of the water before are also held (§5.5); a lake map is offered only once the water before it is open. The prices are unchanged: in the sim's gated pacing run the gate costs no time, with Rod T6 on the slot-9 shelf and bought before the Thunder Stair's map (§4.9).

**The whole catalogue** (the pacing run's 144 purchases): **10,447,307 clams**: maps 73%, lures 10%, legend bait 7%, tackle 4%, looks 4%, home 3%, raft and hold under 1%. The legends' first landings pay back 1,989,100 of it.

### 4.9 Pacing targets, and the proof

The pacing run (sim section 5) is an average player: 90% of the natural rule's clams, 25% more time per trip for looking around, plain bait from minute 30, +6% per order slot. It buys 144 things in a sensible order and always fishes the best of its three newest waters (v8: its three newest **open** waters; a lake map waits until the water before it is open). **Every figure in this section is the no-passive player's.** The balancing job (`WICKS.md` §3, QUEUE job 8) runs the pacing once per Wick (`clams.mjs --wicks`): each Wick buys everything within ±10% of the five-Wick mean, Tallow's clams-a-trip marks are read per slot and its trips held to ≤ 6 min at 9 slots, the price factor ×1.0 in 1a. **M1's own arc** (the Mossmere alone, its 32-item shelf, about 2.5–3 h to an empty shelf, *est.*) is `docs/loop/M1.md` §6, proven by `clams.mjs --shipped=mossmere`.

**v8: the gate in the pacing run** (sim sections 5 and 7; the full run of 15 November 2026). The pacing run is gated as the game is: a lake map is bought only once the water before it is open, a water is fished only once it is open, and a gear key is bought before its map (that moves Rod T6 alone, decision 37). A list counts as landed once the player has fished that water for its **95th-percentile** list time on the kit the water opened with (§5.5 (d)), so the pacing player is the slow one in twenty. **What the gate costs: nothing.** Every water opens the moment its map is bought (sealed 0 min at all 15) and the shelf ends at **47.6 h**, the same as the same sim without the keys; all 166 checks pass. The one map that moves by more than 0.1 h is the Thunder Stair's, from 29.6 h to 30.5 h, because Rod T6 is bought first at 29.3 h; by Rushlight Fen the run is level again (33.9 h both ways). Bought only after its map, as v7.1 ordered it, the rod would leave the Thunder Stair sealed for 57 min. **Where v7.1's 48.9 h went:** when the catch show was built its seconds moved into the built ceremony and the sim's separate 1.5 s allowance was dropped (`LOOP.time.show`, PLAN CHOICE 15); that made the run 47.6 h before the keys were added. The tables below are the gated run. No price, value tier or gear key changed in v8; the one knob the sim moved is the pull's Keeper floor, which starts on the second evening at a water (§5.5 (d)).

**The M1 view** (the user's re-cut of 15 November 2026; §13, `docs/loop/M1.md`). M1 builds the Mossmere and the home barge only. The three keys still govern every gate; in M1 the only gate is the Mossmere → Sporewood one, and Sporewood's sheet is **shown sealed until after M1** ("Coming soon": no price and a hollow map seal, decision 39). Its other two seals can both be pressed in M1: the gear is the Ashwood rod (Rod T1, 50 clams, on M1's shelf) and the catch is the Mossmere's list, so a player who finishes M1 sees two pressed seals beside the hollow one (`M1.md` §5). The Mossmere's rows here are M1's: on the starting kit its list of 12 is landed in 22 min on average and in 29 min by the slow player in twenty (34 by the slowest in a hundred), a small part of M1's 2.5–3 h. (In the full game the Sporewood map is affordable after 81 min of fishing, at 1.4 h.) M1's own run is `clams.mjs --shipped=mossmere` (`M1.md` §6.4), which is to report the list's time on M1's shelf; this sim exports `listStudy` for it.

| mark | clams per trip | minutes per trip | trips per purchase | bought | where | state | target |
|---|---|---|---|---|---|---|---|
| **10 min** | 71 | 3.4 | 1.0 | 3 | the Mossmere | hold 4, Line T1, the Lily Maze | first purchase after trip 1; 2–5 bought; 40–90 clams |
| **1 h** | 234 | 4.0 | 0.8 | 14 | the Mossmere | T1, hold 5, three places | 100–240 clams; 0.5–2.6 trips; 11–19 bought |
| **5 h** | 778 | 4.5 | 3.5 | 46 | Glasswater | T3, hold 6, three waters, 11 places | 300–900 clams; 1.5–5 trips |
| **20 h** | 3,753 | 5.3 | 4.2 | 77 | the Thin Water | T5, hold 8, six waters, 23 places | 1.5–7 trips; 5–8 waters owned |
| **40 h** | 40,745 | 5.4 | 4.2 | 124 | Lampmoss Slough | T6, hold 8, 13 waters, 55 places | — |
| **the end** | — | — | — | 144 | | everything, at 47.6 h | 40–60 h (v8, sim section 7: 45–52) |

| water | its map bought at | it opens at (v8: its three keys held) | the best water to fish from | its legend landed at |
|---|---|---|---|---|
| 1. The Mossmere | start | start | 0.0 h | 1.8 h |
| 2. Sporewood Pools | **1.4 h** (target 1.2–2.0) | 1.4 h | 1.4 h | 4.6 h |
| 3. Glasswater Vault | **4.4 h** (4.0–6.5) | 4.4 h | 4.4 h | 9.2 h |
| 4. The Pallid Deep | **8.6 h** (8.5–13) | 8.6 h | 8.6 h | 18.7 h |
| 5. The Rime Sound | **15.4 h** (12–18) | 15.4 h | 15.4 h | 20.5 h |
| 6. The Thin Water | 19.5 h | 19.5 h | 19.5 h | 23.2 h |
| 7. The Last Light | 21.4 h | 21.4 h | 21.4 h | 25.1 h |
| 8. Pyrefall Gorge | 24.2 h | 24.2 h | 24.2 h | 28.1 h |
| 9. The Waxen Reef | 26.2 h | 26.2 h | 26.2 h | 32.7 h |
| 10. The Thunder Stair | 30.5 h (its key, Rod T6, at 29.3 h) | 30.5 h | 30.5 h | 35.3 h |
| 11. Rushlight Fen | 33.9 h | 33.9 h | 33.9 h | 37.3 h |
| 12. The Salt Gate | 36.4 h | 36.4 h | 36.4 h | 39.9 h |
| 13. Lampmoss Slough | 38.7 h | 38.7 h | 38.7 h | 41.7 h |
| 14. The Siltway | 40.9 h | 40.9 h | 40.9 h | 44.2 h |
| 15. Lanternroot Lagoon | 42.9 h | 42.9 h | 42.9 h | 46.6 h |
| 16. The Inkwood | 45.8 h | 45.8 h | 45.8 h | 47.6 h |

| milestone | value | target |
|---|---|---|
| the longest wait for one purchase | **76 min** (Line T5, hour 12.4) | ≤ 90 min |
| the first giant comes home | about **hour 1.4** (a Thousandcast Pike or a Hullkiss Lamprey) | hour 0.4–3 |
| giants landed and kept by the end | **about 73** | — |
| Elders landed by the end | **about 70** | — |
| a new water is the best water to fish | **from the day it opens**, all 15 (v8: measured from the opening; every water opens the day its map is bought) | within 30 min |
| v8: the longest a bought lake map waits sealed (its gear or the list not yet held) | **0 min at every water** (each gear key is owned before its map; each list is landed long before the map is affordable). 57 min at the Thunder Stair if Rod T6 is bought after its map | ≤ 30 min |
| v8: the 95th-percentile time to land a water's whole list, at the kit it opens with, on the Journal route with the pull | **16–53 min** (p99 18–61) at the 15 waters whose list is a key; the Inkwood's Journal seal 54 (62). The table is §5.5 (d) | ≤ 60 min (p99 ≤ 75), and less than that water's era |
| v8: players whose list is still open when the next map and its gear are owned | **none of 2,000 at any water** (the shortest era is the Mossmere's 81 min of fishing; the tightest, the Siltway's 119 min against a p99 of 59) | < 5% at every water; the expected extra wait ≤ 5 min (it is 0) |
| v8: the pull's windfall in each era | **−3.5 to +8.1 min of income** (while a list is open the Journal route with the pull earns 80–137% of the natural rule's clams a minute, for 9–39 min on average; the Mossmere is the +8.1). All 16 eras together: +9.2 min, which the pacing run leaves out | ≤ 15 min of income |
| on the day you buy a lake map, its open, day and old water ÷ the water before, fully mapped | **1.07–1.11** | ≥ 1.05 |
| every water, fully mapped ÷ the one before | **1.20–1.53** (88 → 24,000 clams a minute; the 1.20 is the Rime Sound after the Pallid Deep, decision 21) | ≥ 1.2 |
| every place map, bought in price order | **+8% to +29%** clams a minute | ≥ +5% |
| the best set of a water's places ÷ the next water fully mapped | **at most 0.87** | < 1 |
| trips at the pacing marks, the visit home included | **3.4–5.4 min** | ≤ 6 |
| maps' share of all spending | **73%** | 50–75% |

**The first trip** (natural rule, 4,000 trips): 44 clams on average, 19–80 for most players (10th–90th percentile); 2.1 minutes; 98% come home full; **52% bring home no Prize or bigger**; 8% a Trophy; 27% of hooked fish get away; 63% get a bite after dark. (The no-passive player; Tallow's first trip, *est.* in `WICKS.md` §2.4: about 61 clams, 99% full, 41% with no Prize or bigger, 94% a bite after dark.) v8: the pull leaves the first trip exactly so (it starts on the second evening at a water; the sim checks a fresh save's first trip with the whole list missing).

**The buying order of the pacing run** (hour · what · price; the full table with trips is printed by the sim):

| era | purchases in order |
|---|---|
| the Mossmere, 0–1.4 h | 0.04 Hold 4 · 30 → Line T1 · 50 → map: the Lily Maze · 60 → Rod T1 · 50 (v8: Sporewood's gear key) → Reel T1 · 50 → Oars I · 60 → Order Board I · 70 → 0.42 Hold 5 · 120 → map: Under the Span · 150 → Glimmer Spoon · 90 → Bone Jig · 110 → 0.74 map: the Buoy Lights · 260 → Feather Fly · 50 → Bait Bed I · 120 → **1.35 MAP: Sporewood Pools · 2,000** |
| Sporewood, 1.4–4.4 h | Harbour-Bell Spinner · 180 → Lantern I · 100 → Line, Reel, Rod T2 · 300 each → Long Wall wing 1 · 250 → map: the Bell Pool · 500 → the Matriarch hunt · 142 → Oars II · 300 → Keel I · 100 → Order Board II · 400 → Spore-Lamp Fly · 500 → Barge lights I · 200 → 2.13 map: the Puffball Vent · 1,100 → Moth Popper · 400 → map: the Veilwater · 1,200 → Hold 6 · 450 → Lantern II · 500 → Slate Cloak Dye · 300 → Keel II · 600 → Line T3 · 1,200 → Oxblood Pennant · 400 → Bait Bed II · 700 → Reel T3 · 1,200 → Amber Lantern Glass · 600 → 3.25 Rod T3 · 1,200 → **4.36 MAP: Glasswater Vault · 10,200** |
| Glasswater, 4.4–8.6 h | map: the Mother's Cup · 2,200 → the Grove hunt · 613 → Mirror Shard · 2,400 → Barge lights II · 1,200 → 5.12 map: the Well of Ledgers · 4,000 → Order Board III · 4,000 → Line T4 · 6,000 → Lantern Lure · 4,000 → map: the Broken Hymnal · 4,800 → Hold 7 · 2,000 → Reel T4 · 6,000 → Painted Prow · 2,500 → 7.37 Rod T4 · 6,000 → **8.60 MAP: The Pallid Deep · 26,000** |
| the Pallid Deep, 8.6–15.4 h | Keel III · 3,000 → map: the Fallen Chandelier · 7,500 → the Sovereign hunt · 2,452 → Bait Bed III · 9,000 → Ferryman's Coin · 9,000 → map: the Sunken Belfry · 14,000 → Hold 8 · 3,500 → Barge lights III · 14,000 → Bell Buoy · 6,000 → 12.39 Line, Reel, Rod T5 · 32,000 each → **15.44 MAP: The Rime Sound · 29,700** |
| each new water, 15.4–47.6 h | its lake map → (Long Wall wings with waters 5, 9, 13; v8: Rod T6 · 100,000 at 29.3 h, on the shelf with the slot-9 map and bought before the slot-10 map, the Thunder Stair at 30.5 h, whose key it is; Line and Reel T6 at 31.2 and 31.9 h, after the Thunder Stair map and before Rushlight Fen's at 33.9 h; a look with waters 5, 7, 11, 15) → its giants' lure → the crown and legend hunt of the water before → its fifth place → its night water. The Inkwood's own crown and the Banked Fire end the shelf at 47.6 h. |

**What the sim found that shaped the design.**

- **A giant's share must not depend on the pool.** With a fixed weight, a night water with little else biting gave its giant on 94% of bites; with family lures multiplying it, a giant came home on 55% of trips at hour 1. Hence the fixed share and "only its own giants' lure draws it" (§3.5).
- **A bait that pulls in commons loses clams** (Mire Worms −16% at hour 1). Hence bait never changes the pool (§4.5). **A tin with more favour for less money beats every other**: hence one favour and one price per water.
- **Open water alone cannot beat a mapped water.** A water's places hold 30–100% of its worth: its Elders, its giants and its best fish. To make a new water's open water beat the old water fully mapped, every tier would have to grow about 1.8 times per water (the last water's tier about 65,000, its fully mapped income 700,000 clams a minute). **Opening the day and old water with the lake** does it with tiers that end at 1,675 (v7.1: the Inkwood; v7 1,347, v6 1,247, v5 397), where a giant Trophy sells for about 196,000 on average and 218,000 at most (an Elder Emberbelly about 548,000).
- **A place earns its sail only if its fish are better than open water's.** With every common still biting, a day water added 0–5% and some places lost clams. Halving commons at places, drawing a day water's better fish 1.5 times, and giving each weak place a fish of its own makes every place map worth +8% or more.
- **The last place bought adds little if the places' good bites already fill the hold.** Hence fewer good bites per place (day 2, old 3, night 2) and more in open water, which grow with the hold.
- **A bigger hold is not a faster one.** Under quiet water, each slot past 4 is filled from open water, poorer than your places. Hold 5–8 are priced as bigger evenings, not multipliers (§4.2).
- **A re-order needs re-derived prices, and every water needs its own checks** (v7, v7.1). v7's claim that v6's lake prices made the long game 53 h with a 92-minute wait did not reproduce exactly: kept by slot on v7's tiers, v6's lake ladder gives 53.8 h and a 98-minute wait (the Thunder Stair map), failing the 90-minute check; on v7.1's tiers it would give 49.2 h and 82 minutes. The 42-minute rule gives 48.9 h and 76 minutes. v7 tried Pyrefall Gorge at slot 6, where it failed two checks at the 20 h station, and moved it to slot 8, where no station looked; the critics found it still failing there (choosy play 82%), and the Last Light failing "no tin is the one to buy" at slot 7 (Shimmerfly 4.1 points better). **Sim section 2b now runs the anti-grind, let-go and bait checks on every new water at the kit it is bought with**; choosy play is measured over a fixed 6,000 trips, because at 1,200 trips the ratio moves by ±5 points. The fixes are in the waters, not in the checks (decisions 28–31).
- **A thin pool forces a high tier, and the water after it looks poorer** (v7.1). Rushlight Fen (seven fish, no rare in play, one giant) needed a tier of 421 to pass the open-water rule, so the Salt Gate after it (tier 205) sold its giants for 35% less. Drawing the Reedwalker Catfish into the Fen's open water and its Night Lanes thickens the pool: the Fen's tier is 336, and the Salt Gate's giants now sell for 1.07× the Fen's. A new check keeps every water's giants at ≥ 0.8× the water before's.
- **A lure chosen by a rule of thumb can cost clams** (v7.1). Fitting the Thunder Plug (two giants named, no rare) instead of the Glimmer Spoon cost the pacing player 18% a trip for the rest of the era. The pacing player now fits whichever lure pays best, measured, and every giants' lure names its two biggest rare or uncommon fish.
- **Each water needs its own value tier.** At one value point per tier the waters pay very different amounts, because their fish, Fight and tackle differ. `node tools/sim/clams.mjs --calibrate` prints the tiers that satisfy decision 10, with a 2-point margin so a noisy run still clears it; the table in §4.1 is its output. (v8: the Rime Sound's margin is now 0.4 points, §14 risk 30.)
- **The three keys cost no time, and the mercy is why** (v8). Gated, the run ends at 47.6 h with every water opening the moment its map is bought. Without the pull the slow player in twenty needs 3.8 h to over 10 h for a list at five waters (section 7's contrast column), and a gated run with the pull switched off ends at about 61 h with bought maps waiting sealed for up to 14.5 h (a quick scratch run). The sure bite carries the limit: without it Sporewood's slow player in twenty needs about 130 min, with it 53 (§14 risk 24). **A floor from the first evening would have changed the first trip** (48 clams in 1.9 min, and a bite after dark on 39% of first trips instead of 63%); from the second evening it costs the lists nothing.
- The model's limits: no cast depth, no signs, no weather, no Marked Fish bonus, no Cut Strip, orders as a flat 6%, curiosities left out, 44 s for sailing out and the visit home. Read every number as ±10%. **Finds** (§4.10) are outside these figures until the balancing job's finds table is in the sim; §4.10 states how far they may move them.

### 4.10 Finds: what they sell for, how often, and the sim (`docs/loop/FINDS.md` §4, §11)

```
a snag:   perBite 0.05 at every place and open water (est.); 0 on the first evening and on a legend's cast; it spends a good bite
its kind: while the water has an unowned barge part or look, 35% of snags are one of them (each equally likely), else a treasure
a grade:  plain 50% ×2 · fine 28% ×6 · precious 15% ×15 · rare 5.5% ×50 · jackpot 1.5% ×250
clams = round(tier[water] × grade.x × LOOP.priceFactor)            (a treasure; a part or a look is never sold)
```

| water | tier | plain | fine | precious | rare | jackpot |
|---|---|---|---|---|---|---|
| 1. The Mossmere | 7 | 14 | 42 | 105 | 350 | **1,750** |
| 4. The Pallid Deep | 35 | 70 | 210 | 525 | 1,750 | **8,750** |
| 8. Pyrefall Gorge | 118 | 236 | 708 | 1,770 | 5,900 | **29,500** |
| 12. The Salt Gate | 269 | 538 | 1,614 | 4,035 | 13,450 | **67,250** |
| 16. The Inkwood | 1,675 | 3,350 | 10,050 | 25,125 | 83,750 | **418,750** |

(Every water's row is `FINDS.md` §4.2.) The mean treasure is about ×11.4 the tier, a rare Keeper's worth; a jackpot is 1.5–2.1 times its water's mean giant Trophy. A part or a look costs only the slot it fills, so on the Mossmere the treasures about pay for the parts and looks: over M1 the finds net about ±0 clams on average, with a wide spread (a jackpot at hour 1 brings the empty shelf 30–40 minutes sooner); late, with a water's parts and looks owned, a snag pays about 1.7 times the slot it fills, about +1% a trip at hour 20 and +3.5% at hour 40 (*est.*, `FINDS.md` §4.4). A water's jackpot comes home about 1 trip in 250 there while its parts and looks remain and 1 in 170 after (*est.*).

**The sim requirement** (the balancing job, which owns `tools/sim/clams.mjs`, builds a **finds table per water**, `LOOP.finds`, with these rates and values; this spec edits no tool): every bite may be a snag; a snag spends a good bite and takes a slot when kept; the natural, choosy and pacing players keep every find while a slot is free; a part or a look once owned leaves the draw. **Gates**: `--shipped=mossmere --step=5c` against `--finds=off` over 2,000 runs, the empty shelf's p50 inside 2–4 h and within ±10% (p10 and p90 reported); the full pacing run within 40–60 h and within ±5% of 48.9 h, the longest wait ≤ 90 min, every §4.9 mark and "a new water is the best water from the day its map is bought" still holding; each water's jackpot ≥ 1.5× its mean giant Trophy (the Pallid Deep against its rare Trophy); finds at most 10% of all clams over the run (aimed ≤ 6%); `--wicks` within ±10% with finds on; the anti-grind, let-go and bait checks unchanged. Reports per water: snags a trip, a rare 1 in N trips, the jackpot 1 in N trips. Knobs, in order: `perBite`, the jackpot's share, the grades' multipliers, the kind share.

---

## 5. Maps: the only way to discover a water, and the three keys to sail there

### 5.1 Rules

| # | rule | why |
|---|---|---|
| 1 | Two kinds of map, one word on screen. A **lake map** inks a water on the Chart; when the water opens (rule 11) its open water, **its day water and its old water** open together. A **place map** opens one more place inside a water that is open: its night water, its crown, or a fifth place. | A new water is better than the old one from its first evening (decision 6). The four built arenas exist; a lake map sells in slice 1b with no world work. |
| 2 | **55 maps for sale**: 15 lake maps (the Mossmere is yours) and 40 place maps: the Mossmere's four (day, old, night, crown), and in each other water a night water and a crown, plus a **fifth** in the six waters whose fourth giant the roster put on a later sheet (the Puffball Vent, the Well of Ledgers, the Overhang, the Turning Tide, the Monsoon Cut, the Drowned Spire). | One pattern, four glyphs (sun, ring, moon, crown); every roster giant has a map. |
| 3 | Open water gives fish up to Trophy. **Elders bite only in old water, and a giant at its own place.** A place's own fish and its giant bite only at that place; a "night water" fish bites in any night water of its water. | Big and rare fish live on mapped water. |
| 4 | **Clams buy every map; three keys open a water** (v8, the user's rule; it replaces "Clams are the only key … Nothing needs a legend, a catch or a count"). **Every purchase needs only clams**: a place map needs its water open; a lake map needs the water before it open, so at most one sealed water waits on the Chart. No purchase needs a legend, a catch or a count. **Sailing to a new water needs three keys** (rule 11): its lake map, its gear key, and one of each fish on the list of the water before it (§5.5). No key is a legend, a giant, a toll or a place. | The map is still the only way to discover a water, and luck never blocks a purchase. The gear and the list make the journey through the waters feel earned ("the appropriate rod or gear and … one of each fish species in the current area"), and the pull (§5.5 (d)) keeps luck from blocking a water for long. |
| 5 | **A water you do not own is not in the world.** At home it is a rolled sheet on Murk's shelf, sealed with wax in the shape of its legend, with a price. A water whose map you own but which is not open yet is **sealed**: inked on the Chart with its three seals (§5.4), still not in the world, and you cannot sail there. | The big goal is in sight from the first minute, and so is everything it asks for. |
| 6 | **A place you do not own is standing mist**: a low lavender bank over that water, its landmark a dark shape inside, and on clear nights its giant's dark back turning in it. You can sail through it. A cast into it comes back with no line on screen (the float sinks into the mist and rises again); the bait is kept and no bite is spent. On the Chart it is a blot with a glyph and a price, and no name. | The water sells the next map without a word. You know something is there and that it is big; you do not know what until you buy. |
| 7 | **Buying a map lifts the mist for good.** On the first evening there (for a lake map: the first evening after the water opens), the bank thins over 3 s, the camera frames the landmark and an ink title card names the place (1.2 s). A lake map lifts two banks, its day and old water, one after the other. | The purchase pays out as a view. This is what "discovering a place" now is. |
| 8 | Maps are sold only at home. **Murk shows at most three**: the two cheapest place maps of open waters, and the next lake once the water before it is open. | Few cards, always a next one. |
| 9 | **A map card names one fish**, drawn life-size beside the Wick, with the hour glyph, a line of at most 8 words and the price. A lake map's card names **its old water's giant** and bears its legend's wax seal. A place map's card names its giant (a crown names its legend), or else the place's own fish. **No card names a common**, and every card but the Lily Maze's names a fish you cannot meet elsewhere. | You buy a promise: a fish and an hour. 49 of the 55 cards promise a giant. (User: yes.) |
| 10 | A trip is one open water and every place you own in it. It starts at the dock nearest the place you tapped on the Chart. | More maps mean more good bites and a richer evening. |
| 11 | **The three keys** (v8). A water opens **for good** when you hold (1) its lake map, (2) its **gear key** (one named piece of tackle or raft, §5.5 (b)) and (3) **one of every fish on the list of the water before it** (§5.5 (c)), each landed at least once, kept or let go (its Journal entry). Opening is permanent: a list that grows when a later slice ships a fish never closes a water. The Mossmere is open from the start. The Inkwood's list opens nothing; it is a Journal seal. | The user's rule (§0 row 10). |

### 5.2 The catalogue

**The sixteen waters, in unlock order** (v7). *Kind*: a lake, a river (built on the river layout, §5.3), or another still (a sound, the open sea, a reef, a fen, a swamp, a lagoon, built on the lake layouts). *Lushness step*: how green and lush the water is (0 to 15, one step per water; `WATERS.md` §1 has its green share, foliage, colours and landmark). Prices follow the slot (§4.8).

| # | water | kind | lushness step | lake map | v6 slot | why it sits here |
|---|---|---|---|---|---|---|
| 1 | The Mossmere | lake | 0 | yours | 1 | built; the look the user approved, unchanged: lavender night, green only as a trace |
| 2 | Sporewood Pools | lake | 1 | 2,000 | 2 | built; first moss on the ember garden |
| 3 | Glasswater Vault | lake | 2 | 10,200 | 3 | built; moss on the crystal |
| 4 | The Pallid Deep | lake (deep) | 3 | 26,000 | 4 | built and priced, closes the old kingdom; re-themed gently as the requiem garden (moss, ivy, cedars, moonflowers) rather than moved |
| 5 | **The Rime Sound** | sound | 4 | 29,700 | 16 | **moved from 16**: ice and stone are the least green thing we have, and its giants need the ice (the Long Winter, the Lantern Hole). Its green: firs on the cliff shoulders, moss and lichen, kelp |
| 6 | **The Thin Water** | **river** (braided sand) | 5 | 36,600 | 6 | the first river: pale sand for miles, with reed islands, floating meadows and willow scrub |
| 7 | **The Last Light** | open sea | 6 | 45,600 | 15 | **moved from 15**: almost no land, so before most rivers with real banks. **Its green (v7.1)**: the raft sets out under a near lighthouse island whose turf-and-fern cliff fills the near side of the view, the Drift Line's weed meadow, a far green island; reef breakers bound the water |
| 8 | **Pyrefall Gorge** | **river** (gorge) | 7 | 59,900 | 8 | a rocky snowmelt river with hanging forest on its walls. (Its open water is thin: v7.1 lets the Lampspot Snakehead bite there; §4.9) |
| 9 | **The Waxen Reef** | reef | 8 | 85,100 | 14 | **moved from 14**: the drowned town's roof ridges become green keys of palm, with seagrass meadows and vines down the spires |
| 10 | **The Thunder Stair** | **river** (cataracts) | 9 | 131,600 | 9 | spray forest: everything the spray touches is green. Rod T6 (on the shelf with the Waxen Reef map, v8) is its gear key |
| 11 | **Rushlight Fen** | fen | 10 | 201,200 | 5 | **moved from 5**: re-themed from lavender rushes to a papyrus delta with palm islands, which belongs in the green half |
| 12 | **The Salt Gate** | **river** (tidal mouth) | 11 | 275,900 | 12 | the first mangroves; the tide turns as night falls |
| 13 | **Lampmoss Slough** | swamp | 12 | 360,900 | 7 | **moved from 7**: re-themed from dead trees to living swamp forest hung with grey-green moss |
| 14 | **The Siltway** | **river** (great lowland) | 13 | 440,800 | 11 | forest walls and floating meadows on a river so wide the far bank is a green line |
| 15 | **Lanternroot Lagoon** | lagoon | 14 | 667,000 | 13 | a full mangrove forest, synchronous fireflies |
| 16 | **The Inkwood** | **river** (blackwater) | 15 | 983,500 | 10 | **moved from 10**: the green heart, a closed rainforest canopy over a black mirror; its "never green" look is gone |

Rivers alternate exactly with stills from slot 5, and the three lushest river kinds come last. The reaches are renamed: **I the old kingdom** (1–4), **II the cold rim** (5–8), **III the falls and the gate** (9–12), **IV the green heart** (13–16). Every fish keeps its water and its place: no giant's haunt needed the old order.

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

| water · its lake map | kind · step | opens (day · old) | the lake card names | night water | fifth place | crown |
|---|---|---|---|---|---|---|
| **5. The Rime Sound** · 29,700 | sound · 4 | the Net Racks · the Fjord Floor | ★ Icedoor Flounder | the Lantern Hole · 14,700 · Coalwing Skate | — | the Half-Mile Line · 20,000 · ★ the Long Winter |
| **6. The Thin Water** · 36,600 | river · 5 | the Marsh Lanes · the Broken Weir | ★ Weirflame | the Lamp Ford · 15,700 · Blotback Catfish | — | the Moonbed · 21,600 · ★ the Buried Moon |
| **7. The Last Light** · 45,600 | open sea · 6 | the Lamp Rock · the Drift Line | ★ Nightsail Lancer | the Beam · 19,600 · ★ Castaway Pike | — | the Unlit Mile · 26,900 · ★ the Jetsam Shark |
| **8. Pyrefall Gorge** · 59,900 | river · 7 | the Alms Steps · the Coin Run | ★ Pyregold Carp | the Boulder Garden · 25,800 · ★ the Unfinished | — | the Last Pyre · 35,300 · ★ the Ashen Guest |
| **9. The Waxen Reef** · 85,100 | reef · 8 | the Chimney Gardens · the Broken Keel | ★ Anvil Trevally | Lamp Row · 36,600 · ★ Mothlance Gar | the Drowned Spire (old) · 33,200 · ★ Spirewatch Pike | the Abbot's Cellar · 50,200 · ★ the Waxen Abbot |
| **10. The Thunder Stair** · 131,600 | river · 9 | the Step Pools · the Cauldron | ★ Lampeye Perch | the Soap Landing · 56,600 · ★ Soapthief | — | the Throat · 77,600 · ★ the Last Lock |
| **11. Rushlight Fen** · 201,200 | fen · 10 | the Reed Lanes · the Run | ★ Packtooth | the Night Lanes · 86,500 · Reedwalker Catfish | — | the Dam Foot · 118,700 · ★ the Long Thunder |
| **12. The Salt Gate** · 275,900 | river · 11 | the Bar · the Sluice Throat | ★ Sweetwater Shark | the Harbour Stump · 118,600 · ★ Inkmarble Eel | the Turning Tide (night) · 107,600 · ★ Tideghost Shark | the Slipway · 162,800 · ★ the Old Shipwright |
| **13. Lampmoss Slough** · 360,900 | swamp · 12 | the Straight Canal · Under the Weir | ★ Weirshadow Catfish | the Lock Gate · 155,200 · ★ Old Portcullis (moved from the Mossmere) | — | the Sentry's Reach · 212,900 · ★ the Last Sentry |
| **14. The Siltway** · 440,800 | river · 13 | the Seam · the Sunk Ferry | ★ Sternlamp Catfish | the Lamp Bar · 189,500 · ★ Dapplewheel Ray | — | the Long Hole · 260,100 · ★ the Barge-Shadow |
| **15. Lanternroot Lagoon** · 667,000 | lagoon · 14 | the Bright Flats · the Sunken Orchard | ★ Snagheart Bass | the Stilt Shrine · 286,800 · ★ Votive Shark | the Monsoon Cut (night) · 260,100 · ★ Rootjaw Catfish | the Sighing Pool · 393,500 · ★ the Silver Regent |
| **16. The Inkwood** · 983,500 | river · 15 | the Windfall · the Kitchen Stair | ★ Emberbelly | Rootgate Creek · 422,900 · ★ Nightcreek Hound | the Overhang (old) · 383,600 · ★ Smilejaw Bream | the Breathing Mere · 580,300 · ★ the Banked Fire |

On a river, each place sits on one of the river's own forms (a pool, an undercut bank, an eddy, a creek mouth, the tail of a rapid, a bar edge) in slack water; `WATERS.md` §4.7 places them. Each cell is the place · its price · what its card names. The other fish at each place (its kind's fish, and the curiosities of roster §6) are in Appendix A.

**Where eleven roster fish bite in play.** The roster gives each fish a kind of place; this spec decides where it bites in play (§12). Eleven fish are moved so that every place earns its price and no card names a common (decision 16), and v7.1 draws two fish to the places their water needs (decision 29). Their looks, names, sizes and hours are the roster's.

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
| Lampspot Snakehead | rare | Pyrefall Gorge, Lampmoss Slough | open water | **open water** (v7.1; v7 had moved it to the day water), drawn ×2.5 at the Gorge's Coin Run and Boulder Garden | the Gorge's open water had only two commons, so let-go play there earned 81% of the natural rule; now 87%. The Straight Canal still adds ≥ 5% without it |
| Reedwalker Catfish | uncommon | Rushlight Fen | night water | **open water** (v7.1), drawn ×2.5 at the Night Lanes, whose card it still is | the Fen's thin pool forced a tier the Salt Gate after it halved |
| Tailwatch Mudfish | uncommon | Lampmoss Slough | open water | night water | the Lock Gate had no night fish |

**Every roster fish has a map** (sim section 0 checks it): an open-water fish comes with its lake map, a "day / old / night water" fish with any place of that kind in its water, a giant with its own place, a legend with her crown. The Lampspot Snakehead lives in two waters (Pyrefall Gorge, where the player meets it first, and Lampmoss Slough). The Gill Lodger is never hooked (roster ask 7: it rides in about 1 in 8 Prize-or-bigger Siltway catfish, shown on the card with its own Keep or Let go). Curiosities bite at the places roster §6 names and take a slot like a fish.

**What becomes of §25.8's other places.**

| | places | what happens |
|---|---|---|
| **in the catalogue** | the Puffball Vent, the Well of Ledgers (built lakes' fifth places, for their giants) | §5.2 above |
| **later sheets** (the second edition; no roster fish lives there) | the Sluice Run, the Cupped Hands, the Gatehouse Door · the Drowned Greenhouse · the Bell-Chapel Window · the Empty Ferry Slip, the Long Pier of Names | five built species wait for them: the Cupbearer, the Remembered Sun, the Sexton, the Unpaid Fare, the Namesake (Appendix A) |
| merged | the Ferry-Market into the Bell Pool (its Moonfall); the Burning Glass into the Fallen Chandelier | one place each |
| cut | the Votive Font (fry water); the Drowned Almshouse (species on demand breaks "the species hides") | — |
| parked | the four secrets, Found Relics, Vistas, Remnants, residents, Astir, weather, everything reached on foot | §9 |

**Rumours.** `RUMOURS`' three tiers become: tier 1, the line on the map's card; tier 2, Murk's one line when you buy it; tier 3, a note on the owned sheet once you have landed the named fish. Rumours pay nothing.

### 5.3 What a place, a new water and a river are, in the 3D world

- **A place** is a small water (a disc or a lane, 5–8 m) inside a water's arena with its kind, its good bites and favour (§3.3), the fish it draws (at most two), its own fish, at most one giant, a landmark, a dock and its mist. Slice 2 ships places as this data. The twists of §25.8 (the bowl that overflows, threading the arches, Moonfall) are polish added per place afterwards; no place waits for its twist.
- **A new still water** (a sound, the sea, a reef, a fen, a swamp, a lagoon) is a new `ZONES` entry built like the four that exist: one of the lake layouts (`bowl`, `twoBasins`, `ringTrench`, `drop` in `world-layout.js`), its islands and pillars from the kit with **new island and pillar kinds** for its landmarks (`world-art.js`), its docks, its four or five places and its crown pool. It names its theme (`zone.theme`, from a theme registry `src/world-themes.js`; the index clamp in `themeOf` goes, so no new water silently borrows the Pallid Deep's kit).
- **A river** is the same, on the new **river layout** (`arena.layout: 'river'`; `WATERS.md` §4): an **authored strip** (`arena.bounds` {x: ±60, z: ±150}) with a centreline running from the spawn (downstream, south) up to its head, reaches of 170–240 m, one to three bends, a deep pool on the outside of each bend and a sand bar on the inside, soft banks (one terrain heightfield; gorge walls as swept wall meshes), and closed ends hidden by a fall or a weir and standing mist. **It is seen as a river**: on a river the sail camera yaws toward the channel 20 m ahead (±60° from north), so the channel recedes up the frame to its landmark at the first bend; the camera-side bank grows only low plants. **One water level** (falls and rapid steps are set dressing). **A current you can see**: the chop (with two-phase flow, so it never shears) and the foam lines move with the flow, standing waves stand in the chutes, V-wakes trail every snag, and small drift rides from mist to mist. Lanes run at 0.2–1.2 m/s (at most a fifth of the raft's speed); **white water never cuts the lane** (a 5.2 m sneak lane beside it, or a foam band the raft is carried through at a crawl), and the water above any fence is slack; every place, dock, the spawn and the legend's pool sit in slack water. **The raft on moving water** drifts at half the flow when idle and is nudged toward slack water, holds still from the cast to the card (the Wick drops a stone: no button, no words), and is never carried, stranded or capsized; the ends are dead water. Casts aim along the channel; a hooked fish's run is kept off the banks. The Salt Gate's current turns with the evening clock (ebb by day and dusk, slack as night falls, flood at night); no geometry moves: its mudflats sink and the shore line moves in the shader. The validator proves for every river: the spine fits its strip; one connected lane holding every dock, place and pool; every place 80% open water; the flow limits and no flow into a fence; dock widths; the drift sim on the real integrator (both tides); casts that find open water. Every system that is polar about the arena centre today (the shore radius, collide, the cliff and boulder rings, the mist and parallax rings, the depth bake, `uArenaR`, `randomWaterPoint`, the dock push, `calibrateDepth`) moves onto the strip in slice 6 (`WATERS.md` §4.2 lists them).
- **Every water's look is its lushness step** (§5.2, `WATERS.md`): the Starlit sky, the lavender moon, the clear Clear Night air and the candle's one warm light, and the green of its step, carried by moss, foliage, floating plants, weed beds, the mirror and, at night, glow-moss and fireflies, never by fog, sky, light or grade. Each water has `lush` (step ÷ 15) and its day, dusk and night palette in `ZONE_LOOKS` (read only with the loop on, §13 slice 1c); `tools/validate-data.mjs` checks that `lush` rises with unlock order and that air keys stay out of green, and `tools/hue-report.mjs` checks the green share ladder, the step test, the sky and the water band, no cast and no neon (`WATERS.md` §7). (This replaces "palette in the Starlit family; green only as a trace", which now holds for the Mossmere alone.)
- **The vegetation kit** (`WATERS.md` §5): seven archetypes (floating pads, emergent blades, fronds, bushes, ground tufts, trees, hanging strands) plus free moss, weed film and fireflies; each water picks its variants and plants by the step, built once per variant and stamped by matrix copy, merged by material into culled cells (a 3 × 3 grid on a lake, near and far bank strips on a river), swaying, opaque (no alpha test), on its own seeded random stream after every existing builder. **The Mossmere is not touched**: its built pads and reeds keep their builders, and every new shader term is compiled out at lush 0, so it builds and draws byte-identical.
- **The cost line** (`WATERS.md` §5.4; to DESIGN §25.8.8 once measured): calls = materials × visible cells + outline, per pass. Flora adds about +15 / +10 / +5 main-pass calls (high / medium / low), +4 mirror and +4 shadow; river banks +1 and +1 mirror; gorge walls +1 in each pass; night emitters +1; drift +2. A lush lake's world is ≤ 68 / 52 / 46 main-pass calls, a lush river's ≤ 72 / 58 / 48; the whole frame at lush 1 on high about 211 calls (a lake) and 220 (a river), against today's measured 186, and about 370k and 340k triangles in all passes (today 236k). **Slice 5 measures it before any slice-6 arena is authored**: medium ≤ 230 calls and ≤ 320k triangles in all passes, high ≤ 250, and software GL on low ≤ 0.6 s a frame at 960×540; the software-GL cost on high is not measured yet.
- On the **Chart** a new water is a new sheet once its map is bought (sealed until it opens, §5.5; a river's sheet is a schematic: a gently bent spine at a fixed width, its places as vignettes at least 44 px across in their order along the river, its flow arrows along the spine); a new water gets its **mooring** (data, §6.5: `arena.mooring`, else `docks[0]`; on a river in slack water), and its stone on the home barge's sill is inked the first time the home is towed there (v8: so only once the water is open, since only an open water can be sailed to).

### 5.4 The Chart (the Map Table)

*The user, 14 November 2026: "Yes make the map our in-game Chart" (§0 row 13). The Chart is the world map: `WORLD.md` §10 holds its look and its reveal, `tools/world-map/` its art, `docs/loop/M1.md` §3 its build plan.*

- **It is the map.** The Chart is the Waxwold of `WORLD.md` §10, revealed sheet by sheet: the paper, and for each water you own its sheet of the continent at its true place (its coast and relief, its landmark vignette, its lamp, its road from the water before as an amber line with flow arrows, its mooring), the Landing (its arch and the old ferry stone where the candles came ashore, where the road starts) with the road's stones as four small arcs at its corner (they mirror the barge's sill, §6.2), the home barge drawn at the mooring where it lies now (its hearth the warmest point on the sheet, Murk's barge and his sage-green dot alongside), and the border (each of its four cartouches drawn once its reach can fill it). **Nothing unowned is drawn** (rule 5 holds): no coast, river, name or marker of a water you do not own.
- **How it is built** (decision 40). The generator's bake is reused as **per-sheet crops** embedded in the HTML (`tools/world-map/build.mjs --game` writes the generated `src/chart-art.js`: ≤ 150 KB a sheet in reach I, at 5.5 px a Chart unit; ≤ 100 KB a sheet in reaches II–IV; **≤ 300 KB for M1's Chart in all**, all estimates until M1 step 3b's export spike measures them and re-sets them). Its live layer (the road, lamps, vignettes, lettering, frame and the sheets' ink-in) is one module, `src/chart-draw.js`, which the generator's page also inlines, so the published map and the Chart never drift. Each water's own sheet (below) is drawn by the game from its arena data and pinned beside its true place with a short ink stroke. The game never bakes.
- A sheet is the water's outline in ink. Owned places are small vignettes with their glyph and name. Unowned places are mist blots with a glyph, and a price only while their map is one of Murk's three (rule 8); any other blot shows its glyph alone and opens nothing, so the Chart never sells past the shelf. Under each owned place: your best fish there (species glyph, its weight in pounds: across species the best is the heaviest, `data.fishWeight`), and a gold ★ once you have landed its giant.
- Places sit at their arena sites, so the Chart matches the mist in the world. Where two vignettes would overlap (Under the Span and the Buoy Lights are 18.7 m apart) they are pushed apart along the shore with a fine ink leader; no two tap targets overlap at 358 px. On a phone the best-fish line shows for the chosen place only.
- **The next water** is a rolled sheet sealed with its legend's wax, at the end of a nameless lavender wisp where the owned road runs on, with the three keys' **three small seals** beside it (the map, the gear, the catch; §5.5 sets what each holds and how it reads). **A water past the last shipped one** (`LOOP.shipped`, decision 39; in M1, Sporewood) reads **"Coming soon"**: no price, its map seal hollow, no buy button; its gear and catch seals still fill as they are earned, and nothing earned is lost when it ships. **A water's catch list is frozen at its first edition** (a requirement on §5.5, the three keys' job): a later sheet's species join the Journal but never the list, so a pressed catch seal never un-presses. While the tutorial runs, blots show no price and the wisp and the sealed sheet are not drawn.
- **One action:** tap a water (a place, or open water), then **Sail**; the home goes with the water chosen (§6.5). The tap targets are DOM buttons over the canvas (they carry the selectors and the accessible names). Tapping a priced blot or the rolled sheet opens Murk's card for it (the sealed sheet's card: its wax, its seals enlarged, "Coming soon" where the price would be). A place map bought re-inks its vignette on the next open (0.8 s); a landed giant's ★ appears on the next open. Reduced motion draws every ink-in at once.
- Below the sheet: the bait slot (from M1 step 3, the Heartmoss Ball its only item; the tins from step 4, with a count) and the lure slot (from step 4), and the hold's slots (the Wick's count).
- **By step** (`M1.md` §3.6). **Slice 1a: a list** on the Chart's screen (one row, the Mossmere, its open water chosen, the hold's slots, **Sail**), drawn from the pure `chartModel(meta, D, opts)`. **M1 step 3b: the drawn Chart** (the first sheet, the Mossmere's sheet, the sealed sheet), with the tutorial's chart beat on it: the first time the Chart ever opens its first sheet inks in (1.2 s, under Murk's line), then the hold's empty slots ink in, three, or four for Tallow (§11, `OPENING.md` §6). Step 3: the bait slot; step 4: the lure slot. **Step 5: the chart table** under the home barge's awning opens the Chart, and its top shows it, drawn by the same code into a texture (§6.1); the opening's Landing and the first tow's leg are drawn on the Chart, and the tow ends in the water with its glide in to the Jetty (§6.5, `OPENING.md` §6.2). After M1: pan and zoom with the second sheet, river sheets as schematics (§5.3), the cartouches as reaches fill.

### 5.5 The three keys (v8)

The user's rule (§0 row 10): *"To access a new area we should need a few pre requisite really. We need the map, the appropriate rod or gear and have caught one of each fish species in the current area."* Every choice below that the user's words do not settle is the lead's default (decisions 32–37), for the user to overrule (§16 questions 8–12).

**(a) The keys in one table.**

| key | what it is | how you get it | gates | on the Chart |
|---|---|---|---|---|
| **map** | the water's lake map | bought with clams at Murk's shelf, offered once the water before it is open (§4.8) | sailing there; buying it **inks** the water on the Chart (the discovery) | its legend's wax seal, with the price until bought |
| **gear** | one named piece of tackle or raft (table (b)) | bought with clams; always on the shelf before the map is offered | sailing there | the item's glyph, its tier as pips |
| **catch** | one of every fish on the **list of the water before it** (table (c)), each landed at least once, kept or let go | fishing; the pull (d) keeps it from being luck | sailing there | a fish glyph and the count, "7/12" |

The keys gate **sailing, never buying** (decision 32). A water opens for good when all three are held; a list that grows later never closes it. Places inside an open water keep clams as their only key (decision 36).

**The M1 view** (the user's re-cut of 15 November 2026: the Mossmere and the home barge are finished first; §13, `docs/loop/M1.md` §5). The three keys still govern every gate. In M1 the only gate is the **Mossmere → Sporewood** one, and Sporewood's sheet is **shown sealed until after M1**: it reads "Coming soon", with no price and its map seal hollow (`LOOP.shipped`, decision 39, §5.4), so nothing opens in M1. The other two seals are live and both can be pressed there: the gear seal by the Ashwood rod (Rod T1, 50 clams), the catch seal by the Mossmere's list (6 fish in 1a, 11 at M1's step 2, 12 from step 3, when the Kissmark Trout ships). A player who finishes M1 sees two pressed seals and one hollow one; when Sporewood ships its map seal shows its price, and the sheet opens the moment the map is bought. Nothing earned in M1 is lost. The rule, the tables and the sim below are for all 16 waters and do not change with the re-cut.

**(b) The gear key of every lake map** (decision 33). One existing item per water, chosen so the journey feels natural: still waters ask for the rod their fish fight at, the cold fjord for the cold-water reel, the first river for the second pair of oars, the open sea for the brass-shod keel, the rocky and white-water rivers for line and rod, and the green heart's waters for raft parts. **No new item is added**, and no item gains an effect: a key is an item you would buy anyway, now with one more meaning.

| # | water (kind, Fight) | gear key | item | price | on the shelf with | the gated pacing run owns it at · buys its map at (sim section 7) | why it fits |
|---|---|---|---|---|---|---|---|
| 2 | Sporewood Pools (lake, 7) | **Rod T1** | the Ashwood | 50 | start | 0.2 h · 1.4 h | the first water whose fish pull back: the first real rod |
| 3 | Glasswater Vault (lake, 16) | **Rod T3** | the Glassreed | 1,200 | the Sporewood map | 3.2 h · 4.4 h | a glass rod for the glass vault |
| 4 | The Pallid Deep (deep lake, 24) | **Rod T4** | the Lantern-Spine | 6,000 | the Glasswater map | 7.4 h · 8.6 h | a rod with a lantern in its spine, for the dark |
| 5 | The Rime Sound (sound, 31) | **Reel T5** | the Moonwheel | 32,000 | the Pallid Deep map | 13.5 h · 15.4 h | the cold-water reel, for the fjord and the ice at its head |
| 6 | The Thin Water (the first river, 31) | **Oars II** | the second pair of oars | 300 | the raft shelf | 1.8 h · 19.5 h | the first river: rowing against a current |
| 7 | The Last Light (the open sea, 30) | **Keel III** | the brass-shod keel | 3,000 | the raft shelf | 8.8 h · 21.4 h | the open sea: a keel that holds in the swell |
| 8 | Pyrefall Gorge (rocky river, 30) | **Line T5** | the Starthread | 32,000 | the Pallid Deep map | 12.4 h · 24.2 h | a boulder river: a line that does not fray on rock |
| 9 | The Waxen Reef (reef, 32) | **Rod T5** | the Bellwether | 32,000 | the Pallid Deep map | 14.5 h · 26.2 h | a drowned bell town asks for the bell rod |
| 10 | The Thunder Stair (cataracts, 40) | **Rod T6** | the Crown-Reed | 100,000 | **the Waxen Reef map** (v8, decision 37) | 29.3 h (1.2 h before its map) · 30.5 h | the first water whose fish fight at T6: the crown rod for the falls |
| 11 | Rushlight Fen (fen, 39) | **Line T6** | the Kingshair | 100,000 | the Waxen Reef map | 31.2 h (after the Thunder Stair map) · 33.9 h | long reed lanes: the longest line |
| 12 | The Salt Gate (tidal river, 40) | **Reel T6** | the Last Wheel | 100,000 | the Waxen Reef map | 31.9 h (after the Thunder Stair map) · 36.4 h | the sharks of the river mouth run hardest |
| 13 | Lampmoss Slough (swamp, 41) | **Lantern I** | the taller lantern | 100 | the raft shelf | 1.4 h · 38.7 h | the dark under the moss curtains |
| 14 | The Siltway (great river, 42) | **Keel II** | the deeper keel | 600 | the raft shelf | 2.6 h · 40.9 h | a river so wide the far bank is a green line |
| 15 | Lanternroot Lagoon (lagoon, 43) | **Lantern II** | the clearer glass | 500 | the raft shelf | 2.5 h · 42.9 h | the mangrove forest at night, under its fireflies |
| 16 | The Inkwood (blackwater river, 44) | **Hold 8** | the Harbour Chest | 3,500 | the hold ladder | 10.3 h · 45.8 h | the last water's fish are the biggest: room for them |

- **Every key is on the shelf before its map is offered** (the sim checks it, and validate-data will once `LOOP.access` is in `data.js`: a key's "on the shelf with" water is the one before, or earlier). **In the gated pacing run every key is owned when its map is bought** (the sim checks that too), so no water waits on its gear: 12 keys are bought hours before, as v7.1's order already had them; Rod T6 is bought 1.2 h before the Thunder Stair's map (decision 37), and Line and Reel T6 2.7 h and 4.5 h before the maps they open. The pacing player buys a key before its map because the three seals show it from the first visit; bought after it, the rod would leave the Thunder Stair sealed for 57 min.
- **The honest caveat** (§14 risk 28): the keys of waters 6, 7 and 13–16 are on every raft long before their maps. Their seals stop only a player who skipped that part, and they are lit the moment the sheet appears. The gear seal is real news mainly at the Thunder Stair, the T5 waters and for a player who skipped tackle. The user may prefer real late gear (§16 question 10).
- Item ids in `LOOP.access.gear` are the shelf's buy ids: `rod:1`, `rod:3`, `rod:4`, `reel:5`, `oars:2`, `keel:3`, `line:5`, `rod:5`, `rod:6`, `line:6`, `reel:6`, `lantern:1`, `keel:2`, `lantern:2`, `hold:8`. A key is held when the owned level is at least the key's.

**(c) The list of every water** (decision 34). **The rule:** a water's list is its open-water fish, plus the fish of the day water and old water its lake map opens (their own fish included), **counted only if they bite in the shipped data on the water's plain bait**. Never on a list: giants (★), legends, night-water fish, crown and fifth-place fish, a fish that bites only on a tin other than the water's plain bait, curiosities and the Gill Lodger. The Mossmere has no lake map, so its list is its open water only (its day and old water are place maps). **The list is computed from the shipped data, never hand-written**: `listFor(D, waterId)` in `progression-loop`, the same function in the sim. Appendix A marks every fish (the "list" column).

**What counts:** a species counts once the Journal has it landed (`caught > 0`): kept and let go both count, because the record is written at the measure (§3.2). A Glimpsed fish (lost before it landed) does not. One Journal entry per species serves every list it is on: the Lampspot Snakehead is on Pyrefall Gorge's and Lampmoss Slough's lists, and landing it in the Gorge ticks it in the Slough too. **Catches from before the loop count** (the Journal is shared with the old game, §9; the user's yes, §16 question 12), including those on pages the loop hides until their water ships (`M1.md` §2.11): an old save's Sporewood catches are waiting in Sporewood's list when Sporewood ships, and an old save that has landed the Mossmere's list opens with its catch seal already pressed.

| # | water | its list (the next water's catch key) | count | not on the list (its other fish) |
|---|---|---|---|---|
| 1 | The Mossmere → opens Sporewood | Dusk Minnow, Mossback Perch, Gutter Crayfish, Rustfin Sucker, Likely Chub, Overbold Bass, Lampsipper (night), Weeping Carp, Candlefin Koi, Kissmark Trout, Milkeye Perch (dusk, night), Reedjaw Pike | **12** (1a: **6**, the built phase-1 fish: Dusk Minnow, Mossback Perch, Gutter Crayfish, Weeping Carp, Candlefin Koi, Reedjaw Pike; M1 step 2: **11**; step 3: **12**, when the Kissmark Trout ships with its trout plan) | Bridgechain Sturgeon (Under the Span, a place map), Gloam Eel (night water; Lumen Moss), two giants, the Matriarch |
| 2 | Sporewood Pools → Glasswater | Netcloud Fry, Capshell Crayfish, Plumgill Perch, Sporebelly Puffer, Falsesmile Barb, Cindertail Catfish, Velvet Ray, Threadling Eel (on Spore Cake, the plain bait), Downcast Catfish, Lostsea Mackerel, Mildew Angler (night) | **11** | Sleepspore Jelly (Lumen Moss only), Hushcap Koi (the Veilwater), Nightbloom Carp (night water), three giants, the Drifting Grove |
| 3 | Glasswater Vault → the Pallid Deep | Prism Minnow, Glassblown Puffer, Glassgill Perch, Duskbar Salmon, Mirror Pike, Redhome Salmon, Rosefleck Trout, Tremor Catfish (night), Pilgrim Salmon (dusk), the Blind Scrivener (on Ember Roe, the plain bait), Rainglass Darter (day water), the Unreflected (the Mirror Nave) | **12** | Chime Jelly (Glass Larvae only), the Footnote (the Well of Ledgers), Vesper Gar (night water), three giants, the Glass Sovereign |
| 4 | The Pallid Deep → the Rime Sound | Ossuary Fry, Bonecrook Crayfish, Pallid Wraithfin, Slipknot Eel, Shroud Ray, Funeral Veil (night), Lampwarden Angler (night; on Ember Roe, the plain bait), Gilt-Eyed Eel (old water), the Wax-Bearer (the Bier Barge), Candlewake Sturgeon (night; the Chain Garden) | **10** | the Clapper (the Sunken Belfry), the Lantern-Swallower |
| 5 | The Rime Sound → the Thin Water | Ashline Cod, Greybeard Cod, Thumbprint Cod, Wickstripe Rockfish, Hemstitch Cod, Emberspot Flounder (day water), Bouldermouth (day water), Bellrope Cod (old water) | **8** | Coalwing Skate, Rosedeep Rockfish (night water), the Icedoor Flounder, the Long Winter |
| 6 | The Thin Water → the Last Light | Coinback Ray, Flatbill Catfish, Frostfleck Nipper, Slipwhisker, Thorntail Ray, Grumbleplate (day water), Inkthumb (day water, day) | **7** | Blotback Catfish (night water), Weirflame, the Buried Moon |
| 7 | The Last Light → Pyrefall Gorge | Scribbleback Mackerel, Pinstripe Tuna, Fadegold, Grey Latchfin, Soot Jack, Starbar Lancer (all three day water) | **6** | Ambersickle Tuna (night water), two giants, the Jetsam Shark |
| 8 | Pyrefall Gorge → the Waxen Reef | Pipsqueak Catfish, Puddle Snakehead, Lampspot Snakehead, Almsfed Carp (day water) | **4** | two giants, the Ashen Guest |
| 9 | The Waxen Reef → the Thunder Stair | Waxdrop Damsel, Pebble Grouper, Amberside Snapper, Nebula Trout (day water) | **4** | Cabin Grouper (night water), Picket Pike (the Drowned Spire), three giants, the Waxen Abbot |
| 10 | The Thunder Stair → Rushlight Fen | Stairhopper, Swallowtail Catfish, Cradlemouth Bream, Sidepool Snakehead, Cocoon Sleeper (all three day water) | **5** | two giants, the Last Lock |
| 11 | Rushlight Fen → the Salt Gate | Basket Fry, Blushing Bream, Hingecreak, Reedwalker Catfish, Foamnest Pike (day water) | **5** | the Packtooth, the Long Thunder |
| 12 | The Salt Gate → Lampmoss Slough | Brinewhisker, Saltroot Bream, Creekling Shark, Embereye Bass, Tidetable Ray, Longlash Ray, Old Breather, Sandblower, Kitewing Ray (both day water) | **9** | Dusk Drummer (night water), three giants, the Old Shipwright |
| 13 | Lampmoss Slough → the Siltway | Hearsay Sunfish, Scrapwhisker Catfish, Startle Carp, Lampspot Snakehead, Spotmail Gar (day water) | **5** | Tailwatch Mudfish (night water), two giants, the Last Sentry |
| 14 | The Siltway → Lanternroot Lagoon | Tallow Borer, Vigil Catfish, Lacework Catfish, Silkwhisker, Boathook Catfish, Waxcomb Ray, Hullknock Perch, Millstone Catfish, Bareface Catfish, Snufferjaw (both day water) | **10** | Tallyside Catfish (night water), the Gill Lodger, two giants, the Barge-Shadow |
| 15 | Lanternroot Lagoon → the Inkwood | Flicker Trevally, Frownlip Mullet, Rootshade Snapper, Wide-Eyed Stray, Sandghost (day water), Harbourdrum Grouper (old water) | **6** | Stiltshadow Shark (night water), three giants, the Silver Regent |
| 16 | The Inkwood (opens nothing; a Journal seal) | Ditch Hound, Gourdseed Minnow, Petal Bream, Inkside Nipper, Starback Ray, Windowtail Perch, Gourdcracker (day water) | **7** | three giants, the Banked Fire |

The lists grow only while a water's **first edition** is still shipping (rule 2 of §13): the Mossmere 6 (1a) → 11 (M1 step 2) → 12 (M1 step 3, the Kissmark Trout); Sporewood about 7 with its map → 11 with slice 3's four fish. A water once opened stays open, and the new fish arrive as new silhouettes on the list page. **A list is frozen at its first edition** (`M1.md` §5's requirement, §5.4): a species that a later sheet adds (the Cupbearer, with the Cupped Hands) joins the Journal and never a list, so a pressed catch seal never un-presses. The rule above already keeps such a fish off (a later sheet's fish is a place's own, and a place bought later is never on a list); the freeze makes it a promise, whatever a second edition adds.

**(d) The pull: the mercy** (decision 35). A listed fish not yet in the Journal is pulled toward the hook, honestly and without a word on screen.

| rule | value | why |
|---|---|---|
| the counter | `n` = evenings ended at that water while its list had fish missing (`meta.loop.pull[waterId]`); only the water you fished counts; it stops when the list is complete | time spent there, never time spent elsewhere |
| the weight | each missing listed fish bites at weight × **min(6, 1 + n)**, applied after the hours, place and bait filters | the more you fish a water, the sooner its last fish comes |
| the Keeper floor | **from the second evening there (n ≥ 1)** a missing listed fish never bites Small (z ≥ −0.25) | its tell then always invites the strike; "every catch should feel like a win". The first evening at a water is the natural rule untouched (the sim's re-tune, below) |
| the sure bite (the hard cap) | from **n ≥ 8**, the first bite at each place and in open water, in any phase where a missing fish can bite there, is one of the missing, drawn by weight | the expected time to finish is capped: no list waits on luck past the ninth evening |
| what it never touches | giants and legends (a giant's share is fixed, §3.5), the land chance, prices, quiet water's count, hours and places (a night fish still bites only at night; a day-water fish only at its day water), a bait-only fish's bait | the rules stay true; only the draw is kinder |
| what the player sees | nothing; the Journal's built odds block, the one place a % may show, includes it so the logs stay honest | no clutter |
| knobs | `LOOP.access.pull = { perEvening: 1, cap: 6, keeperFloor: -0.25, floorFrom: 1, sureFrom: 8 }` | §14 risk 24 |

It cannot be farmed: the species hides until the reveal, so a player cannot keep a list open on purpose, and it ends when the list is done.

**Measured** (sim section 7, the full run: 2,000 players a water, each fishing the water from its first evening on the kit the gated pacing run opens it with, the natural rule on the Journal route of §3.4, with the pull; pacing minutes, the visit home included. "To land" is the list less the fish already landed for an earlier list. The two contrast columns are 200 players each, stopped after 150 evenings; "over" means more than one player in twenty was still not done.)

| water | the kit it opens with | to land | mean / median (min) | p95 / p99 with the pull (min) | without the pull: median / p95 | the plain natural route, with the pull: median / p95 | its era: minutes fished there before the next map and its gear are owned | clams a minute while the list is open ÷ the natural rule | windfall (min of income) |
|---|---|---|---|---|---|---|---|---|---|
| 1. The Mossmere | T0, hold 3 | 12 of 12 | 22 / 22 | **29 / 34** | 72 / 337 | 23 / 32 | 81 | 137% | +8.1 |
| 2. Sporewood Pools | T1, hold 5 | 11 of 11 | 39 / 39 | **53 / 61** | 258 / over 639 | 40 / 57 | 181 | 102% | +0.7 |
| 3. Glasswater Vault | T3, hold 6 | 12 of 12 | 37 / 38 | **49 / 54** | 172 / 516 | 38 / 49 | 254 | 103% | +1.2 |
| 4. The Pallid Deep | T4, hold 7 | 10 of 10 | 31 / 30 | **47 / 53** | 87 / 226 | 32 / 50 | 410 | 116% | +5.1 |
| 5. The Rime Sound | T5, hold 8 | 8 of 8 | 24 / 22 | **39 / 48** | 41 / 130 | 49 / 105 | 245 | 103% | +0.8 |
| 6. The Thin Water | T5, hold 8 | 7 of 7 | 18 / 16 | **28 / 34** | 27 / 71 | 48 / 99 | 112 | 90% | −1.7 |
| 7. The Last Light | T5, hold 8 | 6 of 6 | 27 / 26 | **45 / 51** | 56 / 154 | 82 / 160 | 169 | 102% | +0.5 |
| 8. Pyrefall Gorge | T5, hold 8 | 4 of 4 | 17 / 16 | **32 / 39** | 25 / 82 | 31 / 91 | 122 | 80% | −3.5 |
| 9. The Waxen Reef | T5, hold 8 | 4 of 4 | 11 / 11 | **18 / 23** | 12 / 32 | 25 / 74 | 255 | 96% | −0.5 |
| 10. The Thunder Stair | Rod T6, Line and Reel T5, hold 8 | 5 of 5 | 19 / 17 | **33 / 38** | 25 / 65 | 17 / 34 | 205 | 98% | −0.3 |
| 11. Rushlight Fen | T6, hold 8 | 5 of 5 | 9 / 10 | **16 / 18** | 10 / 20 | 21 / 55 | 151 | 88% | −1.2 |
| 12. The Salt Gate | T6, hold 8 | 9 of 9 | 26 / 25 | **41 / 48** | 55 / 147 | 25 / 40 | 137 | 94% | −1.6 |
| 13. Lampmoss Slough | T6, hold 8 | 4 of 5 | 9 / 10 | **16 / 21** | 10 / 21 | 20 / 58 | 133 | 105% | +0.5 |
| 14. The Siltway | T6, hold 8 | 10 of 10 | 35 / 35 | **53 / 59** | 96 / 320 | 81 / 170 | 119 | 104% | +1.6 |
| 15. Lanternroot Lagoon | T6, hold 8 | 6 of 6 | 20 / 18 | **33 / 41** | 32 / 73 | 22 / 38 | 173 | 106% | +1.3 |
| 16. The Inkwood | T6, hold 8 | 7 of 7 | 32 / 30 | **54 / 62** | 78 / 329 | 58 / 120 | 112 (to the end of the shelf) | 94% | −1.8 |

The limits are p95 ≤ 60 min and p99 ≤ 75: the slowest list is Sporewood's (53 / 61) and the tightest against its era the Siltway's (a p99 of 59 min in an era of 119). Of 2,000 players a water, **none** still had a list open when the pacing run owned the next map and its gear, so the catch key does not hold back a player who reads the Journal. Two contrasts the sim prints but does not check: **with the pull but on the plain natural route**, the slow player in twenty needs 160–170 min at the Last Light and the Siltway and 91–105 min at the Rime Sound, the Thin Water and Pyrefall Gorge, about three times the Journal route's time (the Pallid Deep's 50 min is decision 21's late-route fix at work: before it the Candlewake Sturgeon was never landed on the natural route); **without the pull**, Sporewood's p95 is over 10 h and Glasswater's 8.6 h. So the silhouettes' place and hour glyphs and the Journal route are part of the mercy, not optional. While a list is open, the Journal route with the pull earns 80–137% of the natural rule's clams a minute, for the 9–39 minutes a list is open on average: between 3.5 minutes of income lost (Pyrefall Gorge, where the route gives up good water for its four fish) and 8.1 gained (the Mossmere, where on the starting kit a pulled Reedjaw Pike or Kissmark Trout is worth several commons); all 16 eras together +9.2 min.

**The sim's one re-tune: the Keeper floor starts on the second evening** (15 November 2026; `floorFrom: 1`). As first written the floor held from the first cast. On a fresh save every fish of the Mossmere's list is missing, so no bite of the first trip was Small: the hold filled in 1.9 min instead of 2.1, for 48 clams instead of 44, and only **39%** of first trips got a bite after dark, against §3.4's 63% (target ≥ 50%). With the floor from the second evening the first trip is exactly the natural rule's (the sim checks it with the whole list missing), which is also how the mercy was put to the user: uncaught species bite more the longer you fish there (§0 row 10). The lists are no slower for it: Sporewood's, the slowest, is 53 / 61 min (p95 / p99) with the floor from the second evening and 52 / 63 from the first. Nothing else in `LOOP.access` moved, and no price.

**(e) What the sim proves** (`tools/sim/clams.mjs`: section 7, "the three keys", and the gate in section 5; 26 checks, 166 in all). **What it models:** `LOOP.access` in the draft table (`--json`); `listFor`, `listMark` and `gearKey` compute the lists and the keys, and `--fish` prints Appendix A with its list column; `trip()` records every fish landed (kept or let go) and takes the missing set, with the pull in `poolFor` (the missing set and the factor in its cache key; a giant's share unchanged), the Keeper floor, the sure bite, the Journal route and decision 21's late-route fix; `listStudy` fishes a water evening after evening until its list is landed. **The pacing run is gated:** a lake map is bought only when the water before it is open; a gear key is bought before its map (straight after it, if it could not be); a water is fished only once it is open; a list counts as landed at its 95th-percentile time on the kit the water opened with; while a bought map waits on the list alone, the player fishes that list's water. **Checks:** every gear key is on the shelf before its map is offered, and owned in the pacing run when the map is bought; every list has ≥ 4 fish; each listed fish bites on its water's plain bait, in its hours, in open water or at a place its lake map opens; each of the 16 lists has p95 ≤ 60 min and p99 ≤ 75 min at the kit it opens with (2,000 players; 600 with `--quick`); fewer than 5% of players still have a list open when the pacing run owns the next map and its gear, and the expected extra wait is ≤ 5 min; the pull's windfall is ≤ 15 min of income an era; no bought map waits sealed more than 30 min; a new water is the best water within 30 min of opening (section 5); a fresh save's first trip, fished with the whole list missing, keeps section 2's targets; the long game is 45–52 h, and the longest wait ≤ 90 min (section 5). The contrast columns (no pull; the plain natural route) are printed, not checked. **What the model leaves out:** the windfall is not added to the pacing run's income (+9.2 min over the whole game); a list's time is measured on the arrival kit, though the kit grows during the era; the Journal route is one fixed plan an evening (it does not re-plan when a fish lands); a list that ships short (the Mossmere's 6 in 1a, 11 at M1's step 2) is not modelled here: M1's own run (`clams.mjs --shipped=mossmere`, `M1.md` §6.4) is to report the Mossmere's list on M1's shelf, and `listStudy` is exported for it. `roster-check.mjs` and `roster.json` do not change: the lists are derived.

**(f) How the player sees it: the Chart, the Journal, the card, the shelf, Murk.** Every word is in §8.

- **The three seals** (§5.4 places them beside the next water's rolled sheet; v8 wrote this in §5.4, and it moved here when v7.2 rewrote that section around the world map). In the user's order: the **map** (its legend's wax, with its price until bought), the **gear** (the item's own glyph, with its tier as pips) and the **catch** (a fish glyph and the count, "7/12"). Each seal is a hollow ink outline until held and pressed wax with a small tick after, so shape tells it as well as colour. Once the map is bought the sheet is inked (the discovery) but stays sealed, with no **Sail**; when all three seals are held they break (one beat, §5.5 (f)) and the sheet joins the others with **Sail**. Only open waters can be sailed to; a tap on a sealed sheet enlarges its seals in place (the gear seal opens the shelf at its card, the catch seal opens the Journal at the current water's list). There is no padlock anywhere. The seals are tap targets of at least 44 px at 390 px wide.
- **The Chart, four states of the next water** (§5.4). (1) *Not bought*: under the lavender mist, its legend's wax, its price, and the three seals beside it, so the whole errand is in sight from the first visit (the map seal shows the price, dimmed when too dear). (2) *Map bought, a key missing*: the region is inked (outline, name, its day and old water as named vignettes), the route from the current water stays a faint dotted line under a thin band of mist, and there is no **Sail**. (3) *The opening*: the first time the Chart opens after the last key is held, the three seals press one after another (0.25 s apart), the mist band on the route thins and drifts off (1.2 s), and the route is inked from the current water's dock to the new water's first dock (1.2 s, the quill sound); the new water is then selected with **Sail** live, and its first **Sail** tows the home there (§6.5). Under 3 s, skipped by a tap; reduced motion: a 0.4 s cross-fade. A pending opening is saved (`meta.loop.reveal`), so a reload replays it. If the map is the last key, the ink-in and the opening play as one beat of about 4 s. The world's own first-evening lift (§5.1 rule 7) still plays there. (4) *Open*: an ordinary sheet, for good. Only the frontier water (the newest open water, whose list gates the next) shows a count; older sheets show nothing extra. A water past the last shipped one (`LOOP.shipped`, decision 39; in M1, Sporewood) stays in state 1 with "Coming soon" in place of its price and its map seal hollow, while its gear and catch seals fill as they are earned (§5.4).
- **The Journal.** On the water it opens on that water's tab; at home on the frontier water's; from the Chart's catch seal on the current list with the first missing fish selected. Under the loop the tab's badge counts **the list** ("7/12"), not every species. The list's cards come first, each with a small notch in its corner (an empty ring until landed, pressed after). A missing listed fish shows its silhouette (as built), the name "· · ·" (built), its hour glyphs (sun, dusk, moon, lit for its windows after the converter's rule) and one place glyph (open water, or the day or old water glyph from the map cards); nothing else: no name until it is caught, no bait glyph (no listed fish needs a tin other than the plain bait), no lore and no hint sentence (the built `hintFor()` line is not shown under the loop). `M1.md` §2.3 draws the list page the same way. The water's other fish (place fish, night-water fish, giants, the legend) follow after a thin ink rule, outside the count; giants keep their gold-frame page. A Glimpsed fish keeps the built Glimpsed page and an empty notch.
- **The catch card.** When a fish lands for the first time and is on the current water's list, a small pressed seal with the new count ("8/12") is stamped beside its name, 0.3 s after the class stamp, never near **Keep** and **Let go**. Because it shows before the choice, the player learns that letting it go is safe. The list's last fish gets the same seal with the full count, a little bigger (not gold: gold stays for giants). The built kicker "A new name for the journal" stays; no word is added. The opening itself waits for home and the Chart, never a bite.
- **The shelf.** An item that is a water's gear key carries that water's small seal glyph on its card, no words.
- **Murk** (§8.6): two lines about the keys, the user's "at most two" (§16), each said once a save. At the shelf, right after the first lake map bought while a key is still missing, the one that names the keys: "One of every fish here first. And the right gear." When a water's catch list completes and its catch seal presses (the first time, the Mossmere's in M1, `M1.md` §2.5): "Every fish in this water. I'll write that down." The opening itself has no line: the seals, the mist and the inked route say it. If the first lake map completes all three keys at once, the first line is not said. No line ever names the missing fish or nags about the count.

**(g) In the code.**

```
data.LOOP.access = {
  gear: { sporewood: 'rod:1', glasswater: 'rod:3', paleabyss: 'rod:4', rime_sound: 'reel:5', thin_water: 'oars:2', last_light: 'keel:3',
          pyrefall_gorge: 'line:5', waxen_reef: 'rod:5', thunder_stair: 'rod:6', rushlight_fen: 'line:6', salt_gate: 'reel:6',
          lampmoss_slough: 'lantern:1', siltway: 'keel:2', lanternroot_lagoon: 'lantern:2', inkwood: 'hold:8' },   // each slice adds the waters it ships
  list: { kinds: ['open', 'day', 'old'], plainBaitOnly: true },    // the rule of (c); the members are computed, never listed
  pull: { perEvening: 1, cap: 6, keeperFloor: -0.25, floorFrom: 1, sureFrom: 8 },   // floorFrom: the evening count from which the Keeper floor holds
}
progression-loop (pure): listFor(D, waterId) → speciesId[] · listCount(meta, D, waterId) → { have, need }   (journal caught > 0 only)
progression-loop (ctx.progression.loop): accessOf(waterId) → { map, gear, catch: { have, need }, open } · isOpen(waterId) · pullOf(waterId) → n
meta.loop: opened: [waterId] (the Mossmere from the start) · pull: { waterId: n } · reveal: waterId | null      (§9)
```

The built Journal's `caughtOf()` counts an entry with `caught 0` and no `seen` flag as known; the gate and the count read `caught > 0` only. The Journal is shared with the old game, so its catches count, on every page, drawn or hidden (§5.5 (c)). Under `LOOP.chainSkip` (slice 6), should a water slip, its sheet stays sealed and the next built water's map **and catch key** use the last built water; the sim's `--shipped` mode models the gate too.

**(h) Where the keys land in the build.** §13 is v7.2's and carries none of this; here is what each part of the keys needs, for the plans to place. `slice-1a/PLAN.md` already carries the first row (its v8 additions, T81–T84). Where the next two rows land inside M1, M1's plan places them (`M1.md`); after M1, each half or slice ships the keys of the waters it ships.

| part | what it needs | its tests |
|---|---|---|
| **the data shape and the Journal's count** (slice 1a, `slice-1a/PLAN.md` lanes A and C) | `LOOP.access` with the shape of (g); in 1a `gear` holds only `sporewood: 'rod:1'` (Rod T1 is on 1a's shelf) and the `list` and `pull` rules; `LOOP.tackle.shelfAt` becomes `[1, 1, 1, 2, 3, 4, 9]` (decision 37; no 1a shelf change, T6 is not sold in 1a) · `progression-loop`: the pure `listFor` and `listCount` (the Journal's `caught > 0`), and `isOpen` (in 1a the Mossmere only, so `createRun`'s "the zone must be open" is the same set as today) · the Journal under `loopOn()`: the Mossmere tab's badge counts the list ("n/6"), the list's cards first with their notch, a missing one as the built silhouette with "· · ·", its hour glyphs and its place glyph (f), the other species after a thin rule; off the loop the built Journal | `listFor('mossmere')` on loop data is exactly the six built phase-1 open-water fish, computed (not the Gloam Eel, not the Matriarch) · `listCount` counts `caught > 0`: a Glimpsed entry does not count, a fish let go does, an old save's catch does · the badge equals `listCount` under the loop and the built count off it · `validate-data --loop`: every `LOOP.access.gear` id names a shelf item |
| **the pull and the card's list seal** (M1's plan places them) | `fishing.js`: the weight ×min(6, 1 + n), the Keeper floor from n ≥ 1 and the sure bite from n ≥ 8 on a missing listed fish, after the hours, place and bait filters; a giant's share unchanged · `progression-loop`: `pull`, the evening count at `endTrip` · the card's list seal (§8.2) | the count rises on a fish let go as on a kept one, never on a Glimpsed one · a listed fish already in an old save's Journal counts · the pull is ×min(6, 1 + n), never on a giant, never outside a fish's hours or off its bait, never Small from the second evening, and gives the sure bite from n ≥ 8 · a fresh save's first trip is the natural rule's · T43's allow-list admits the count form `/^\d+\/\d+$/` on the Chart, the Journal and the card · sim section 7 passes for the Mossmere on `data.LOOP` |
| **the seals on the drawn Chart** (M1's plan places them; `M1.md` §3 and §5 draw Sporewood's sealed sheet) | the three seals of (f) beside the sealed sheet, the map seal hollow under "Coming soon" · the Mossmere's list grows to 12 with the Kissmark Trout, which arrives as a new silhouette · Murk's list line and the catch seal's stamp (§8.6) | the gear and catch seals press as their keys are held, the map seal stays hollow · the catch seal opens the Journal at the list · Murk's list line is said once |
| **the gate** (with Sporewood's half of slice 1b, after M1) | the player buys the Sporewood map and sees its seals; sails to Sporewood's open water once Rod T1 is owned and the Mossmere's list is in the Journal, and watches the seals break · `data.js`: `TEXT_LOOP.murk.firstSealed` (§8.6) · `progression-loop`: `createRun` starts only in an open water; `accessOf`, `isOpen`, `meta.loop.opened` and `reveal`; the next lake map offered only once the water before is open; `migrateLoop` rule 6 · the Chart: the sealed sheet with no **Sail**, the opening beat of (f) · `validate-data`: every gear key is on the shelf before its map is offered; every list ≥ 4 fish, each listed fish biting on its water's plain bait in some phase · the sim: section 7 and the gated pacing run (e) | Sail with the Sporewood map starts in Sporewood once Sporewood is open · Sail to Sporewood is refused until all three keys are held (the Chart shows no **Sail**; `game.sail` and `createTrip` refuse too) · buying the Sporewood map does not put Glasswater's map on the shelf before Sporewood opens · opening survives a list that grows (a synthetic species added to the Mossmere's list) · the opening beat plays once and survives a reload · the keys' line is said once · a place map needs only clams and an open water · a v3 `meta.loop` with Sporewood owned migrates to `opened: ['mossmere', 'sporewood']` · sim section 7 passes for waters 1–2 on `data.LOOP` |
| **each later water** (slice 2's Sporewood half to slice 8) | its gear key added to `LOOP.access.gear`, its list computed · Sporewood's list reaches 11 with slice 3's four fish · Glasswater and the Pallid Deep open with Rod T3 and Rod T4 and the list of the water before (slice 5) · T6 on the shelf with the Waxen Reef map: Rod T6 is the Thunder Stair's gear key, Line T6 Rushlight Fen's, Reel T6 the Salt Gate's (slice 7) · under `LOOP.chainSkip` (slice 6), a water that slips leaves the next built water's map **and catch key** on the last built water, and the `--shipped` run re-runs the three keys on what ships | an open water stays open as lists grow, a new fish arriving as a new silhouette · each list's members equal Appendix A's list column · sim section 7 passes on `data.LOOP` for the waters shipped (1–4 with slice 5, all 16 with slice 8), with the Candlewake Sturgeon landed on the natural route (decision 21) · each shipped water's gear key is in `LOOP.access.gear` and its seals open in the shipped data · each new water is the best water from the day it **opens** (v7.1: its map is bought) · T6 is on the shelf with the Waxen Reef and the Thunder Stair opens only with Rod T6 · every water opens by its three keys on the shipped data |

---

## 6. Home: the home barge

*The user, 15 November 2026: "Should our home base actually be a floating caravan style base that moors in a specific location at each water, but then it makes sense as we move on that our base stays the same because it follows us. Otherwise we'd have to buil 17 individually home cave locations which would cost a fortune at each new water. Where as if we tow it with us when we move that makes sense" (§0 row 18). Home is one barge that goes where you go, never a place built at each water.*

### 6.1 What home is, and how slice 1a's Jetty grows into it

**The home barge is the Slow Hearth**, an old barge-house of the kingdom's barge road (`LORE.md` §6): a broad, low hull about 12 m by 3.6 m, a timber cabin with small square windows and a stove pipe, a rail round the deck, a flat roof under a patched awning, and a cabin door whose sill carries the road's sixteen stones (§6.2). The Wick finds it at the Landing in the opening, Murk's banked fire in its stove and the other Wicks dozing by it, and tows it up the Sluice Run to the Mossmere (§6.5). From then on it is home: it lies at one fixed **mooring** on the water you fish, with Murk's trading barge moored alongside and your raft tied at its stern. Murk is wherever the barge is, so the shop goes where you go. The hold stays on the raft.

| stage | what home is | built from |
|---|---|---|
| **the Jetty** (M1 steps 1–4: slice 1a to slice 3) | A screen over the live scene: the Mossmere's mooring (`docks[0]`, the Jetty) at dawn, Murk's barge moored, your raft tied up. Three ink tiles, one word each: **Murk** · **Chart** · **Journal**. Your clams, top-right. One goal line. Home upgrades you own are drawn on the tiles. | Murk's barge and the docks (built: `actors-merchant`, `world.getMerchantDock`), the shop screen, the Journal |
| **the home barge** (M1 step 5) | The same flow `home`, in the same water scene, at the same mooring: the Slow Hearth moored at the Jetty, Murk's barge alongside, the raft at its stern. The home camera frames it at first light. The three tiles become the barge's own places, each tapped where it is, with its tile's word under it: **Murk** (his barge: the shelf), **Chart** (the chart table under the awning: the Chart), **Journal** (the lectern by the cabin door); from the Long Wall's first wing, the cabin's lit doorway, with no word (the camera moves inside to the gallery). Home upgrades are objects on the barge (§6.3). No zone change, no ink dip and no posts to sail to. | a new actor (`actors-home.js`), `LOOP.mooring` (§6.5), the home camera, the in-scene targets (§13 step 5) |
| **aboard, walked** (later, not planned here) | The Wick steps off the raft and walks the deck and the cabin. | needs the foot controller (parked) |

Home is honest at every stage: it is where Murk is, where the fish become clams and where the water comes back. Only its look grows, and it is built once: every water gets a mooring (data), never a home of its own.

**The trip's end, in the code (slice 1a).** The built market cannot pay the tally: `sellAll` needs Murk moored on the water and a live run, and pays `run.shells`; the cove's `hub` flow exists only with `SUPPORTS_COVE`. So:

- `progression-loop.endTrip()` does the whole sale in one step and one save, **before any animation**: it values `run.hold` by §4.1 plus the doubles, adds the total to `meta.loop.clams`, adds one to `evenings`, ends the run and writes the save. The tally screen only replays the stored result. Test: a reload during the tally pays exactly once.
- A new flow, **`home`**: the last water's scene stays loaded at dawn, survival and combat idle, input goes to the three tiles. `Sail` starts the next trip from it.

**The home flow on the barge (M1 step 5).** Slice 1a's flow `home` already runs in the water scene (the Jetty is a screen over it), so the barge needs no zone change: the sail home's 2 s glide heads for the mooring and the raft is tied at the barge's stern as the tally opens; the home camera eases from `'sail'` to the mooring's framing (`LOOP.mooring[water].cam`, 1.2 s); the four targets are DOM buttons over the objects' projected bounds, carrying the tiles' words, selectors and focus order, so the tutorial and its tests read the same; a press anywhere else at home does nothing, and never casts; **Sail** closes the screens and the glide out unties the raft from the stern. The barge and Murk's barge stay moored and lit while you fish the evening, so from out on the water home is the warm windows by the Jetty: emissive only, no PointLight, so the Wick's candle stays the one warm light on the water, and never a ring or disc. **Murk's barge is moored too**: the built merchant actor in a new `moored` mode at the mooring's `murk` slot, its lamp's PointLight held at 0 (its glow mesh and halo only), Murk not turning to track the raft (his breath, blink and ledger idle only), and `startTrip` no longer sends him away (from step 5 it does not call `merchant.leave`). He has no Trade pill on the water, and nothing on the barges can be tapped during a trip.

### 6.2 What grows at home without clams

| trigger | what shows |
|---|---|
| a lake map bought | what the purchase shows on the Chart is §5.5's (v8: its sheet inked at its true place with its mooring marked, sealed, with its three seals); its first tow (§6.5) plays its leg over that sheet and adds no ink-in of its own; its giants join the Journal's giants' page as dark outlines (decision 42) |
| a water opens (v8: its three keys held) | its seals break and its route is inked (§5.5 (f)); on the first evening there its two banks lift |
| the home towed to a water for the first time (§6.5) | the tow; that water's stone on the barge's door sill (its Waystone) is inked (16 stones in four arcs, one per reach, each carved with its water's glyph and a one-word leg mark in road order, so the sill reads as the journey; an arc's stones are set when its reach ships, so M1 has arc I's four, the Mossmere's inked in the opening); on the Chart the barge is drawn at that water's mooring |
| a water's list completed | its catch seal presses on the next water's sheet; the list page's count is full |
| a place map bought | its vignette is inked on the sheet |
| a species landed | its Journal page; its ink print (§6.4) |
| a giant landed | its print is framed in gold in the Journal; its place's vignette gets a gold ★ |
| a legend landed | her print hangs along the cabin's eaves above the door (the Lantern-Swallower's along one eave, the Banked Fire's along the other, facing it across the roof; the others on the awning's beam between); her stone on the sill is gilded |
| tackle, raft parts, looks | the rod on the barge's rack, the raft at the stern and the Wick wear what you own |
| a find brought home (§4.10, from M1 step 5c) | a barge part fitted on the Slow Hearth, or a look worn by the Wick, the raft or the barge, seen at every water from then on (the home camera holds on it once, 1.2 s); the Journal's Keepsakes page draws it |

### 6.3 What clams build at home

| upgrade | level · price | what it does | what you see (on the barge) |
|---|---|---|---|
| **Murk's Order Board** | I 70 · II 400 · III 4,000 | Murk chalks 1 / 2 / 3 **orders**. An order names a fish from a water you have opened ("2 Dusk Minnows", "a Prize Weeping Carp"). Every fish that fills it **sells for double**. **An order stays until it is filled.** Tap an order to wipe it, and Murk chalks a new one. Nothing counts evenings. Two orders in three ask for common or uncommon fish; orders never name a giant. | a chalk board on Murk's barge; a bigger board; a second board on the Slow Hearth's bow rail, facing his |
| **Bait Bed** | I 120 · II 700 · III 9,000 | Each evening you set out with at least 3 / 6 / 10 of the water's plain bait, free. It tops you up; it does not pile up. | a moss planter on the barge's roof; two planters; the whole roof a planted bed |
| **The Long Wall** | wing I 250 · II 30,000 · III 80,000 · IV 150,000 | One wing per reach (four waters each). A wing hangs your best **ink print** of every fish of its four waters, at true size on its painted ruler (§25.4.3's frames); giants in gold frames. | the cabin's print gallery: bare boards, then frames filling with prints, a candle under each (wing I the cabin's port wall, II its starboard wall, III lines strung under the roof's awning, IV along the hull's long side under the eaves; the longest print, the Long Winter's 560 cm, fits the cabin's 8 m wall) |
| **Barge lights** (was Landing lights) | I 200 · II 1,200 · III 14,000 | Looks only. | lanterns on the rails; lanterns along the roof's edge; a beacon on the bow |
| **Looks** | Slate Cloak Dye 300 · Oxblood Pennant 400 · Amber Lantern Glass 600 · Painted Prow 2,500 · Bell Buoy 6,000 · Gilt Lantern 40,000 · Reed Sail 50,000 · Star Pennant 100,000 · Moon Lamp 200,000 | Looks only. The first three are `COSMETICS_V3`'s. | on the Wick (the cloak), the raft (the pennant, the lantern glass, the Gilt Lantern, the Reed Sail) and the barge (the Painted Prow on its bow, the Star Pennant at its stern, the Moon Lamp on its roof, the Bell Buoy moored off its bow) |
| **Found parts** (finds, §4.10; `FINDS.md` §3.2) | three a water, never sold, never on the shelf | **Found fittings**, an upgrade only finds give, each fitted at one of the upgrades' places above; each changes how home looks and sounds, at home and from the water, and never a number | the Mossmere's (M1 step 5c): the **Rust Buoy-Bell** on the bow post (it rings once as the raft ties up at dawn), the **Gate Lamp-Glass** in the cabin windows (warmer, seen farther across the night water; emissive only), the **Moat Bollard** on the stern deck (the raft ties up to it) |

No home upgrade changes what a fish is worth except an order, and no upgrade anywhere adds a percentage to the sale. A found part changes nothing but the look and life of home, and stands in for no shelf item (decision 54). **Found looks** (`FINDS.md` §3.3: three a water, one each for the Wick, the raft and the barge; the Mossmere's the Knotted Rod Tassel, the Toll-Tower Vane and the Night-Lily Window Boxes) each take a place of their own where they can, so none takes off a look you bought; where two looks would share one place, one is worn at a time, the last brought home (the Keepsakes page lets you choose, after M1). **After M1** the barge's wet well becomes the aquarium, **the Well** (`AQUARIUM.md`), entered by a glass hatch amidships, its fittings and dressings found too. Every home upgrade is bought once and seen at every water, because home goes with you.

### 6.4 Records without giving up the sale: the ink print

You sell what you keep, so nothing is mounted. Instead, at the measure (records are written at the seal stamp, before the card) the Wick takes an **ink print** of the fish. The print is yours whether the fish is kept or let go.

- The Journal keeps the best print per species (weight in pounds, with the length as its small line in cm; class seal, where, which evening), and a page of the giants: those of every water you own (decision 42; all 49 by the end), each a dark outline until landed, then its print in a gold frame.
- A Long Wall wing hangs those prints at true size in the home barge's cabin (§6.3). Until a wing is bought the prints live in the Journal only.
- The class seals (Prize, Trophy, Elder per species; §25.7.4) and the 49 giants are the long goals after the shelf is empty.
- The Live Well, "mark for home", mounts and the keep-pond are parked (§9).

### 6.5 The mooring, the tow and the way back

- **One mooring per water, as data** (like the built docks): `arena.mooring` where authored, else `docks[0]`; `LOOP.mooring[water] = {dock, yaw, raft, murk, cam}` places the barge's hull, Murk's barge beside it, the raft at the stern and the home camera's framing. **The Mossmere's mooring is the Jetty**, `docks[0]` (x 24, z 38), already slice 1a's home (PLAN CHOICE 44) and Murk's day-1 dock: 25.3 m from the spawn, about 15 m clear of the nearest statue (x 8, z 36) and of Root Isle, and 59 m or more from every place (the Bell Pool's the nearest). Later waters author theirs at their own lamp, the old landing of that water (`LORE.md` §2.2); on a river, in slack water (§5.3). `validate-data --loop` checks each: both hulls and the raft clear of every island, pillar, place, mist bank and the shore; clear of the spawn, the glide in and the glide out; the camera's frame holding the barge and its four targets at 358 px.
- **Picking the water for an evening is the Chart**, as it was: tap a water you own (a place or its open water), then **Sail**. **The home goes with the choice**: you come home at dawn to the barge moored at the water you fished. The save holds the barge's own field, `meta.loop.barge = {water, towed}` (where it lies; the waters it has been towed to), apart from `meta.loop.home`, which keeps the upgrades (§9).
  - **The same water**: the glide out from the stern (§8.5).
  - **A new water, the first time** (it is open: its three keys met, §5.5, whose numbers are the keys job's): **the tow** (below), and the evening begins at the new water's mooring, the barge already behind you.
  - **An earlier water** (after M1): **the way back by the lamps**: one ink dip (0.6 s, held until the water's first frame), and the barge lies at that water's mooring as the glide out begins. A kept lamp remembers the way (`LORE.md` §2.12), so going back is never a voyage and never a wait; the Chart still shows the real road.
- **The tow** is a one-time voyage, played the first time you Sail for a water and never again, in two halves (`main.js` `playTow(leg)`). **The leg, on the Chart**: the view follows that water's leg of the Lamp Road (its road line, flow arrows, lock flights and sea passages as the Chart draws them, on `tools/world-map/road.mjs`'s forward road) from the water before to the new one: the raft's mark towing the barge's on a line, Murk's barge alongside, the new sheet inking in as they arrive (its reveal, §5.4, and its one ink-in, §6.2). **The glide in, in the water**: one ink dip into the water at late day, then the raft is seen towing the barge in on its line, Murk's barge alongside, to the mooring, where the barge moors and the raft ties up at its stern; the evening begins with the mist lift (§5.1 rule 7). **Its timing, each part gated on its own**: the leg 4 s, plus 0.5 s for each lock flight, fall or sea passage on it, at most 6 s; the dip 0.6 s (held until the water's first frame is drawn); the glide in 3 s; so never more than 10 s. A tap ends the leg (the sheet inked at once, then the dip) and a tap ends the glide in (at the mooring); reduced motion inks the leg at once and holds 1.5 s, and cuts the glide in to the mooring. It is felt, never read: no words; the tow line's creak and the oars, the leg's own sound passing (lock gates, surf, falls, frogs), the lantern's glow running along the line. It replaces `LORE.md` §2.12's earlier 2–3 s leg glimpse.
- **The opening is the first tow** (M1 step 5; `OPENING.md` §6.2): from the Landing to the Mossmere, up the Sluice Run and its locks (one lock flight and one fall: the leg 5 s), then its glide in to the Jetty and the chart beat over the moored barge.
- **No way to fail.** The tow cannot be lost, missed or left half done (a reload during it lands at the new mooring with `barge.towed` written); the barge never sinks, drifts or needs keeping; moving costs no clams, and nothing waits behind it.
- **In M1** only the Mossmere ships, so the tow plays once (the opening) and the way back has nowhere to go: the tow is built in step 5b as the one component the opening and every later water use, **both halves** (`playTow(leg)`: the Chart's leg and the glide in), and both are played and tested in M1 by the opening; the way back ships with the second water (Sporewood, after M1).

---

## 7. The raft

| part | levels · price | what it does | clams a minute, when bought (pacing) | what you see |
|---|---|---|---|---|
| **The hold** | 4–8 slots · 30 · 120 · 450 · 2,000 · 3,500 | one more slot each; open water gets one more good bite with each. v8: Hold 8 is the Inkwood's gear key | +9% (Hold 4); Hold 5–8 about level (−2% to +3%) but +8–20% a trip | a bigger creel on the deck, then a chest (Tallow: the same, with a small basket lashed beside it, its one more slot) |
| **Oars** | I 60 · II 300 | raft speed +1.5 m/s per level (6 → 9). v8: Oars II is the Thin Water's gear key | +3%, +2% | longer oars, a second pair |
| **Keel** | I 100 · II 600 · III 3,000 | every fish runs a little bigger: favour +0.1 everywhere per level. v8: Keel II is the Siltway's key, Keel III the Last Light's | +4%, +3%, +4% | a deeper keel, then a weighted one with a brass shoe |
| **Lantern** | I 100 · II 500 | night fish run bigger: favour +0.1 after dark per level; the pool of light reaches 15% farther per level. v8: Lantern I is Lampmoss Slough's key, Lantern II Lanternroot Lagoon's | +2%, +2% | a taller lantern with clearer glass |

- **Every part pays its way** (sim section 5 checks it): it adds at least 3% a minute when bought, or it costs at most two trips' income and loses no more than 3% a minute. Quiet Hull is cut; Oars III and Lantern III are cut (each added about 1%). v8 gives five parts and Hold 8 a second meaning as a water's gear key (§5.5 (b)) and none a new effect; no part is added.
- The lantern's light is a soft pool with no edge. Nothing is ever drawn as a ring round the raft or the Wick.
- No raft part touches the land chance or the sale.
- **The raft tows the home** (§6.5): a tow line from a post on the raft's stern to the barge's bow, seen in the tow and in the glide in to a new mooring; at home the raft lies tied at the barge's stern. It is a look and a scene, never a part: no raft part changes the tow, and nothing about it can fail.
- v3's outfit maps onto this: Long Oars → Oars; Thick-Glass Chimney → Lantern; the Rendering Brazier and the Cork-Soled Boots are parked.

---

## 8. Flows, and every word on screen

**The rule.** One line at a time. No panel of text. Numbers are prices, clams, a fish's weight in pounds ("11 oz", "4 lb 6 oz", "212 lb"; §8.2; the only length shown is the card's small line in cm), the count on a bait and (v8) the count of a water's list ("7/12", one form only, on the Chart, the Journal and the card); from 10,000 a number shows as "12.4k" (and "1.2m"). Odds stay in the logs (§25.6.11). Murk speaks one line, rarely, and never during a bite. The opening's words and the first trip's two tips are §8.5's opening table; §8.1, §8.3 and §8.6 point to it.

### 8.1 On the water

| element | words | notes |
|---|---|---|
| the hold | none (slot glyphs) | top-left; the Wick's count of cells (Tallow one more: 4 at the start, 7 at Hold 6; two rows past 6 on a phone); a giant's slot is gold-edged |
| the Home pill | **Home** | bottom corner, ≥ 56 px. **Press and hold** (0.6 s; a ring of ink fills the pill) to go home; with a full hold a tap is enough. No dialog. Not available during a play. |
| the float | none (favour notches, good-bite dots) | shown when the float settles, cleared at the strike (built) |
| a snag (from M1 step 5c) | none | the float slides under slowly and stays, with no nibbles and no class tell; strike as any bite; the haul brings it up (2–4 s, never lost); `FINDS.md` §6.1 |
| quiet water | none | the float dims; Murk's first quiet-water line teaches it once (§8.6) |
| a full hold | "Hold's full." | on a cast; the Home pill pulses |
| mist | none | a cast into mist sinks the float into the bank and brings it back |
| tackle | none (the lure glyph, the bait glyph with its count) | built selector |
| the Journal glyph | none | locked while a line is in the water (built) |
| gone from the HUD | the oil gauge, satiety, Embers, the level bar, the day counter, the night-mode glyph, the flare button, Far Water | §9 |
| evening 1 only | "Hold on the water. Let go to cast." and "Now. Tap." / "Now. Click.", once each per save | §8.5's opening table |

### 8.2 The catch card

**Every size on screen is a weight in pounds** (the user, 15 November 2026: "we always use pounds as a gauge of fish size"; `docs/v3/pounds/SPEC.md` §5, DESIGN §25.7.1): `11 oz`, `4 lb 6 oz`, `212 lb`, from the one formatter `data.fmtWeight` on `data.fishWeight(species, fish)`. That holds for the card, the tally, the ink print, the Chart's best fish, any size a hold slot shows and any size in a Murk's order (a round target from `data.weightTarget`, worded as the card words a weight, "over 9 lb 0 oz", and checked on the ounces the card shows). A personal best is kept by length and told only when the weight the card shows rises. Length stays the hidden truth: value (§4.1) still reads `L50` and z, never weight, and the one length shown is the card's small line in cm.

After the Wick has held the fish up and paused: the built card (name, class stamp and **weight** as the hero, counting up; the length as a small line in cm; the record kicker in a few words). A giant's card has a gold ★ before its name and its seal stamped in gold.

| button | words |
|---|---|
| keep | **Keep** · clam glyph · the value |
| let go | **Let go** (held on a Small or a Keeper from slice 3: a knife glyph, and it cuts bait) |
| an order is filled by this fish | a chalk-tick glyph beside the value, no words |
| v8: the first landing of a fish on the current water's list | a small pressed seal and the count ("8/12") beside the name, after the class stamp; no words (§5.5 (f)) |

**A find's card** (from M1 step 5c; `FINDS.md` §6.3): the card's frame with the find's ink drawing as its hero, its name and its one line (≤ 8 words); no weight and no class stamp; in the seal's place a small stamp of its kind (a coin, gold for the jackpot; a hull; a ribbon). Its buttons: **Keep** · clam glyph · the value (a treasure), or **Keep** with a small glyph of where it goes, the barge, the raft or the Wick (a part or a look; no price); **Let go** (never a knife: a find is never bait).

Gone from the card: Eat, Render, Release's luck, Mark for home, the Strike line (it moves to the Journal), the favour list (it folds behind the float, built), the third button.

### 8.3 Home

| step | what happens | words |
|---|---|---|
| the sail home | a 2 s glide toward the mooring; the sky pales to dawn (from M1 step 5 the raft is tied at the barge's stern as the tally opens) | none |
| **the tally** | the fish go onto Murk's scale one by one, lightest first and **heaviest** last (by the weight the card shows, `data.weightOz`; two that read the same go by value, then in the order caught); each shows its weight (small, dim ink) and its value ticks up with a coin sound; then the total. A giant goes last, alone, with a longer pause. `endTrip()` stores each fish's **length** with the result (slice 1a's PLAN §3.4, `lastTrip.lines`), never a weight: the tally reads `fmtWeight(fishWeight(species, line))` on the first showing and on a replay, as every other screen derives a weight from a length (`docs/v3/pounds/SPEC.md` D5). A fish that filled an order shows a chalk tick and its value doubles; from slice 9 a ledger glyph does the same for the Old Ledger. | fish names and weights (small), values, the total "+193", one button: **Sold** |
| the tally's finds (from M1 step 5c) | after the fish (the giant last of them), the treasures go on the scale by value, each with its name and its value ticking up; the jackpot last of all, alone, with a giant's pause; then each part and look is carried aboard, its glyph and name, no price; then the total | find names (small), values; no new word |
| an empty hold | nothing to weigh | Murk: "Nothing? The water keeps its own counsel. Go again." |
| the Jetty (M1 steps 1–4; from step 5, the home barge: the same three words, each under its object on the barge, and the cabin's gallery from wing I, §6.1) | three tiles and the goal line; the goal line names the slots the next step gives this Wick (Tallow: "Next: Hold 5 · 30" for the Lidded Creel); no goal line while the tutorial runs or once the shelf is empty; Murk's wake line is §8.5's | **Murk** · **Chart** · **Journal** · "Next: Hold 4 · 30" |
| the Chart (§5.4) | the first sheet, the water's sheet with its places, the sealed next sheet, the lure and bait slots, the hold's slots | water and place names, prices, weights, the bait's count, "Coming soon" (a water past `LOOP.shipped`), **Sail** |
| the tow (the first Sail for a water; from M1 step 5 the opening's, §6.5) | the leg on the Chart, the raft towing the barge, the new sheet inking in; an ink dip; in the water, the raft towing the barge in to its mooring, Murk's barge alongside | none |
| the way back (Sail for an earlier water; after M1) | one ink dip; the barge at that water's mooring; the glide out | none |
| the Journal's **Keepsakes** page (from the first find; `FINDS.md` §6.5) | one panel per water you own: its eleven finds in three rows (treasures, the barge's parts, the looks), each one had drawn and named (a treasure with its count), each one not yet had a dark unnamed outline, the jackpot's outline in gold; a small **Odds ›** to the log | **Keepsakes**, the finds' names, "×3", **Odds ›** |
| the Well (after M1; `AQUARIUM.md`) | at home, the glass hatch (no word); inside, a swimming camera; tap a fish to follow it | **Back**; the followed fish's name and weight; a room's water name once |

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
| v8: an item that is a water's gear key | its usual line, and that water's small seal glyph on the card; no words |
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
| the title, a fresh save *(14 November 2026, the user's ruling; Settings is the lead's ruling that it is reachable everywhere)* | **New Descent** · **Settings** (quiet). No tagline, premise, counts, Begin, Journal, Shrine or Trials. "Fresh" = the loop has not begun: no trip out, no Wick chosen, no tutorial record, no evening sold |
| **New Descent** *(14 November 2026, the user's ruling; the one trait line under the cards and **Back** are the plan's wording, PLAN CHOICEs 29 and 42, for the lead's sign-off)* | the five Wicks (a portrait and a name each), the lit Wick's one line (its passive, §10.1), **Back** · **Start**. Nothing else: one game mode, so no night modes, waters, trials, locks, boons, kits or Shells. **Start** plays the opening cut scene at once (§11) |
| the title, a trip out | **Continue** · **Settings** (quiet) · the quiet **Prologue** word (replays the cut scene). *New Descent* is not offered while a trip is out. *(14 November 2026, the user's ruling as the lead read it: Settings by the lead's ruling that it is reachable everywhere, Prologue kept by the lead; v6 said "Continue only".)* |
| the title, at home | **Continue** (home: the Jetty, from M1 step 5 the barge) · **Settings** · **Prologue**. *New Descent* is not offered once the loop has begun; starting over is Settings' **Forget everything** (two in-page confirms). *(14 November 2026, the user's ruling as the lead read it; no New Descent at home is PLAN CHOICE 33; v6 said "Continue".)* |
| Escape at home *(the lead's ruling)* | **Resume** · **Settings**. On a phone the same panel opens from a quiet pause glyph (no word) in the corner at home. |
| Settings, under the loop *(the plan's wording, PLAN CHOICE 43, for the lead's sign-off)* | as built, but no **Damage numbers** row and no flare line under Reduced flashing; the strike ring's first option reads "First evening" and the hurry row's line "From your second evening, hold anywhere to hurry a small fish in. It never changes the outcome"; Forget everything's line reads "Clams, gear, the Journal. There is no undo." and its first confirm "Every clam, every piece of gear and every name in the Journal will be lost." |

The passives' lines *(`WICKS.md` §2; the user said yes to the lines as written on 15 November 2026, §0 row 12; Tallow's new line is the lead's, for sign-off)*:
The Wick "Firsts and new bests sell higher." · Taper "First bites are never common fish." · Stub "Quick bites, even on quiet water." · Tallow "Stout enough for one more fish." · Ashwick "A fish that gets away comes back." (each ≤ 8 words and ≤ 36 characters: one line at 18 px on a 358 px phone)

**The opening and the first trip's words** *(14 November 2026, the user's ruling; every word the opening puts on screen, so
§8 stays the whole text of the loop)*:

| when | where | words |
|---|---|---|
| the film (Start) | the film | its four lines as built, but line 3 under the loop: "Its last candles fish from lamp to lamp." (§11, `LORE.md` §12) |
| the hand-off glide (the film's last shot → the Jetty's dock, 3 s; from M1 step 5, one ink dip → the Landing, drawn on the Chart) | the water; from step 5 the Chart | none |
| the first morning (the tutorial's wake) | the Jetty (from M1 step 5: the Landing, on the Chart) | Murk: "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it." (§11) |
| the tutorial's Chart, every time before the first Sail | the Chart | Murk: "Three slots in that hold. Fill them and come home." (§8.6's first line; Tallow: "Four slots in that hold. Fill them and come home.") |
| the first tow (from M1 step 5, after the wake: the Landing to the Mossmere, §6.5) | the Chart, then the water (its glide in to the Jetty) | none |
| the sail out (every Sail, a 3 s glide from the dock to open water; from M1 step 5 from the barge's stern) | the water | none |
| evening 1, once per save, the line idle | the water | "Hold on the water. Let go to cast." (built tip `fe_cast`) |
| evening 1, once per save, the first bite's strike window | the water | "Now. Tap." on touch, "Now. Click." with a mouse (built tip `fe_strike`) |

The opening, step by step, is `docs/loop/OPENING.md`.

### 8.6 Murk's lines (each once, unless noted)

| when | line |
|---|---|
| the first evening, at the Chart (the tutorial's: §8.5's opening table) | "Three slots in that hold. Fill them and come home." (Tallow: "Four slots in that hold. Fill them and come home.") |
| the first sale | "Clams. Spend them here. I'm the only shop left." |
| the first quiet water | "Quiet water. Move on, or go home." |
| the first fish let go | "Let one go and the water remembers." |
| the first Small kept (from slice 3) | "Small ones make good bait. Hold Let go." |
| the first Trophy sold | "Now that's a fish." |
| the first map bought (v8: a place map, or a lake map whose water opens at once) | "It's in the mist. Go and look." |
| v8: the first lake map bought while a key is still missing (at the shelf; one of the two lines about the keys, §16) | "One of every fish here first. And the right gear." |
| the first giant sold | "That one had a name before you met it." |
| a lake map first affordable (never for a water past `LOOP.shipped`, so never in M1) | "I've a chart you can afford now." |
| a legend's first landing | "Her. You brought me her. Sit down, I'll count it twice." |
| the first treasure sold (from M1 step 5c) | "The water keeps what it takes. Mostly." |
| the first barge part or look brought aboard | "That'll fit her. I'll see to it by morning." |
| the first jackpot sold | "Somebody's whole fortune. Now it's yours." |
| the last item of the shelf bought (M1: the 32nd) | "Shelf's bare. Keep the rest; the road goes on." |
| a water's catch list complete (its catch seal presses; the second line about the keys, §16) | "Every fish in this water. I'll write that down." |
| sailing out (rotating, built lines kept) | "Bring me something with a story." · "The big ones come up at dusk. They always did." · "Back already? Good. Out you go." |

### 8.7 The Chart and the Journal (v8: the three keys)

| element | words | notes |
|---|---|---|
| the next water's three seals (the Chart) | none, except the map seal's price and the catch seal's count ("7/12") | map, gear, catch, in that order; a hollow outline until held, pressed wax with a tick after; no padlock (§5.4, §5.5 (f)) |
| a sealed water (map bought) | its name, as any inked sheet | no **Sail**; the route stays a dotted line under a thin band of mist |
| the opening | none | seals press, the mist band drifts off, the route is inked; under 3 s; a tap skips |
| the Journal tab of a water | its name and the count ("7/12") | the count is the list's, not every species' |
| a listed fish not yet landed | "· · ·" (built) | its silhouette, its hour glyphs and one place glyph; no hint sentence |
| a listed fish landed | its name (built) | the notch in its card's corner is pressed |
| the water's other fish | as built | after a thin ink rule, outside the count |
| the card's list seal | the count ("8/12") | §8.2 |
| a gear key's shelf card | its usual line | the water's small seal glyph (§8.4) |
| Murk | two lines for the keys, each once a save (§8.6: a lake map bought while a key is missing; a water's catch list complete) | never names a missing fish. The user's "at most two Murk lines" (§16): the first opening has no line of its own |


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
| **tolls, descent gates, legend-gated lakes**, travel through the gate | `progression.js` `travel` | waters are reached from the Chart; the gate is scenery. v8: the three keys are not the built gate; they live in `LOOP.access` and `progression-loop` (`accessOf`, `isOpen`) | `ZONES[].unlock` unused |
| **quality** (Fine, Shimmering) and the strike streak as value multipliers; release luck (`mercy`); let-it-pass favour; **a bait's attract**; first-catch Shells | `progression.js`, `fishing.js` | not applied (value is §4.1; a bait changes which fish bite only for its bait-only fish; let go has its own forgiving rule, §3.2) | `QUALITY`, `BAITS[].bonus.attract` untouched (the attract list still says which fish a bait helps hold) |
| **Far Water, the Live Well, mark for home, mounts, the keep-pond, The Long Descent**, expeditions of several days | not built (P3) | stay unbuilt | `EXPEDITION`, `LONG_DESCENT` untouched |
| **residents, Astir, weather, rumours as quests, discovery by exploring, mastery, Tally Posts** | not built (P2) | stay unbuilt; places come from maps (§5) | `CONDITIONS`, `RUMOURS` kept (the lines are reused) |
| **walking** (§24), walked places, sister-candles, the Wayfarer | not built | `WALK_ENABLED` stays off | §24 data untouched |
| **proof catches** | `TACKLE.proofs` | not asked for | untouched |

**Saves.** The loop writes one new block and touches nothing else:

```
meta.loop = { v: 3, clams, evenings, holdSlots, tackle: {rod, line, reel}, lures: [], fitted: {lure, bait}, bait: {waterId: {baitId: count}},
              maps: {lakes: [], places: []}, raft: {oars, keel, lantern}, home: {orders, baitBed, wall, lights}, barge: {water, towed: []}, looks: [], orders: [],
              legends: {id: landings}, giants: {id: {landed, marked}}, prints: {speciesId: {…}}, ledgerPaid: [], finds: {got: {findId: n}, worn: {slot: findId}},
              opened: ['mossmere'], pull: {waterId: evenings}, reveal: waterId | null }      // v8 (§5.5 (h): M1's plan places them)
```

- **v8: the three keys in the save.** `opened` lists the open waters; opening is stored and never undone, so a list that grows in a later slice never closes a water. `pull` is the pull's evening count per water (§5.5 (d)). `reveal` is an opening the Chart has not played yet. The lists need no field of their own: they count the shared Journal's `caught > 0` (§5.5 (c)), so an old save's catches count. **Migration (`migrateLoop` rule 6, with the gate):** a block without `opened` gains `opened` = every lake it owns (grandfathered: nothing is taken away, whatever gear or list it holds), `pull: {}` and `reveal: null`. The boot rule (the flag off) is unchanged.

- `holdSlots` is the bought slot count (3–8) for every Wick, not a ladder level; a Wick's slot count is `loopSlots(meta.loop, wick)` (`wickSlots(holdSlots, wick)` on numbers: Tallow +1). Slice 1a adds `wick`, `tutorial`, `said` and `lastTrip` (`OPENING.md` §10, PLAN §3.4) and `firsts: {seen, seals, best}` (the Wick's ledger, cleared by New Descent, seeded empty on migration); the run adds `comeback` (Ashwick) and `flags.openComeback`; M1 step 3 adds `chartPick` (the Chart's last chosen place); M1 step 5 adds `barge: {water, towed}` (the water the barge lies at; the waters it has been towed to), the barge's own field beside `home`'s upgrades (v8.1, the barge review); `migrateLoop` steps `v` and gives an older save `{water: 'mossmere', towed: ['mossmere']}`, as if the opening's tow had played (`M1.md` §2.11). `LOOP.shipped` (decision 39) and `LOOP.mooring` (§6.5) are data, never save.
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
| the creel | **changed** | it is the hold: 3 slots, bought to 8 (Tallow 4 to 9), sold whole at home |
| fish value (§25.7.3) | **changed** | §4.1 |
| food and oil from fish | **parked** | — |
| tackle tiers (§25.6.6) | **changed** | persistent, bought with clams at home, no proof catches, new prices; **T5 and T6 added**; v8: a single piece may be a water's gear key (§5.5) |
| outfit | **changed** | the raft's parts (§7): Oars, the Keel, the Lantern |
| lures | **changed** | permanent, new prices, fitted beside a bait; the four giants' lures re-aimed; twelve new giants' lures |
| baits | **changed** | a second slot; tins of 10 per water, one price and one favour per water (§4.5); attract parked; Windfall Plum and Tallow Soap added |
| legend baits, the legend rule, wounds, growth | **kept** | 16 legends; new prices; she needs her crown's map; she opens nothing; her first landing pays the map back |
| Old Murk | **changed** | he stays home, and home travels: his barge moors alongside the home barge at every water (§6); the tally and the shelf |
| bounties, Murk's Ledger | **changed** | Murk's orders (§6.3): fishing templates only (`catchSpecies`, `catchRarity`, `class`, `nightFish`), paid as double sale, never a giant, never expiring |
| zones, gates, tolls | **changed** | maps, gear and the Journal list: the three keys (§5.1 rule 11, §5.5) |
| the four lake arenas | **kept** | as built; twelve more are built on their layouts (§5.3) |
| places (§25.8) | **changed** | 70 places: 30 open with their lake maps, 40 by place maps; mist; no discovery by exploring; eleven roster fish move to a kind of place (§5.2) |
| rumours | **changed** | lines on map cards and sheets |
| day and night | **changed** | the evening (§3.4); the looks of each phase are kept |
| the Journal, records, class seals, the Old Ledger | **kept** | plus the Prints page, the giants' page and "Evening N"; from slice 9 an Old Ledger record pays double once, when sold; v8: each water's tab counts its list, listed fish first with silhouettes for the missing ones (§5.5 (f)) |
| the Long Wall | **changed** | ink prints, bought by wing, one wing per reach, hung in the home barge's cabin (§6.3, §6.4) |
| the five Wicks | **changed** | five passives, all free from the first New Descent (§10.1, `WICKS.md`) |
| fish body plans (`FISH_SHAPES`) | **changed** | 15 new plans and 3 for curiosities, plus the named `sturgeon`, arrive with the slices that need them (§13) |
| curiosities (roster §6) | **new** | bite like fish, take a slot, sell at the water's rare Keeper price, write a *Not fish* page |
| challenges, Memories, relics, the Shrine | **parked** | — |
| the swarm, weapons, levels, Boons, health, hunger, oil as life, night modes, death, Far Water | **parked** | §9 |
| The Long Descent, the Live Well, the keep-pond, walking | **parked** (unbuilt) | — |
| the home barge | **new** | home (§6): the Slow Hearth at one mooring per water, Murk's barge alongside, the tow and the way back (§6.5) |
| the Landing as a 3D cove (§25.4) | **parked** (built, off) | not home under the loop (decision 47): the game starts at the Landing, drawn on the Chart in the opening (§6.5); the built cove stays off (`world.SUPPORTS_COVE` false) through M1 and is kept, not retired: the dormant v3 First Evening needs it, it costs nothing while off, and it is the stage for a 3D Landing if the user asks (§16 question 18) |
| the First Evening (§25.4.8) | **kept** for the v3 build, dormant | under the loop it is not used (§11): the loop's own opening runs on the Chart and the barge; its fishing lesson and the Quayling stay the v3 build's, and with the cove off they stay dormant exactly as today |
| the opening cut scene | **kept** | the film is kept; under the loop its trigger and its hand-off change and its line 3 reads "Its last candles fish from lamp to lamp." (§11, `LORE.md` §12) |
| the Clear Night look, the Starlit palette, the UI style | **kept** | unchanged; the new waters' palettes follow roster §3 |
| the Tide Chart, Murk's Chum, supplies | **cut** | nothing to supply |
| the world map (`tools/world-map/`, `WORLD.md` §10) | **new** | it is the Chart (§5.4): its bake and its live layer in the game |
| the Votive Font, the Drowned Almshouse | **cut** | §5.2 |
| finds: the snag, treasures, barge parts, looks, the Keepsakes page | **new** (M1 step 5c) | §4.10, `docs/loop/FINDS.md`: a bite may bring up a find; it takes a slot, has its own show and card, and counts for no fish record. The built relics', keepsakes' and `COSMETICS_V3`'s names are reused for finds where they fit, without their effects (the relics and the Shrine stay parked) |
| the aquarium (the Well) | **new, after M1** | `docs/loop/AQUARIUM.md`: the Slow Hearth's wet well; every landed species, from the Journal |

### 10.1 The five Wicks

*(14 November 2026, the user: "When you press new descent, make sure there aren't any other options to choose from other than different characters", and "You can choose any of the 5 wicks but each one has a powerful unique passive ability to help them catch fish or boost something else"; 15 November 2026: "Default for all except 4 which i want yes" (§0 rows 11–12). That all five are free is the lead's default, which the user may overrule.)* The five Wicks are candles of the Landing, **all five free from the first New Descent**: each a look and **one passive**, always on, with no button (`docs/loop/WICKS.md` is binding for them: each rule, its knobs and ranges, its hooks and its tests). You choose one on the New Descent screen (§8.5) and it is the Wick of every trip (`meta.loop.wick`) until a start-over. Their combat stats, quirks, start boons and kits are parked, and their built small traits (Taper's cast and strike window, Stub's and Tallow's raft speed, Tallow's +2 Hold on a Trophy, Ashwick's +3 Hold after dark) are retired on a trip; Stub's light radius stays as a look. **Only Tallow's passive changes the hold's size and a good-bite count (the user's carrier, 15 November 2026); only the Wick's touches the sale; none touches a legend, the clock or the odds shown.** Every number below is a starting number; the balancing job (`WICKS.md` §3, QUEUE job 8) sets the final values.

| Wick | passive | on screen | the rule, in one line |
|---|---|---|---|
| The Wick, a Small, Stubborn Flame | Curious | "Firsts and new bests sell higher." | a kept first (a new kind; its first Prize, Trophy, Elder or Ancient; a new best) sells for ×1.5, at least +0.4 × the water's tier; never a giant or a legend; the larger of it and an order (§4.1) |
| Taper, the Long Reach | Long Reach | "First bites are never common fish." | the first bite at each water each evening is drawn from its uncommon and rare fish where the pool allows (two kinds at least, none above 80%); from slice 2 a giant's share ×1.3, never above 12% (§3.5) |
| Stub, the Bright Little One | Moth-Bright | "Quick bites, even on quiet water." | every wait ×0.75 (not on a legend cast); past the good bites no slower waits and −0.08 favour a bite instead of −0.15 (§3.3) |
| Tallow, the Stout Candle (the carrier) | Broad Back | "Stout enough for one more fish." | one more slot at every step (4 to 9; `holdSlots` stays the bought count) and, at open water, two more good bites than another Wick at the same step (§3.1, §3.3) |
| Ashwick, Burned Once | Burns Back | "A fish that gets away comes back." | the next bite at that water is the same fish, tired (+4 Hold), once; never a giant or a legend (§3.2) |

They ship in slice 1a, so §13 slice 9's "The four other Wicks" item is struck. The choice lasts for the save in 1a; whether it can be changed later without starting over is a question for the user (PLAN §7.1 asks it, with the cheap build: a Wick row on the Journal's first page). *v6's rule, kept as the alternative if the user wants Wicks to join over time:* the Wick is free and the others join when 12 species are in the Journal (Taper), the Sporewood map is bought (Stub), 5 Trophies are landed (Tallow) and a giant is landed (Ashwick); they are then chosen at home (the hearth when the Landing exists, a row on the Journal's first page before), and New Descent shows the one free Wick and **Start**, the others hidden. In 1a only Tallow's join can be met.

---

## 11. How the user's earlier decisions fit

| earlier decision | in the Full Hold |
|---|---|
| **Automatic fishing on a land chance that is never 100%; odds only in the logs** (§25.6) | Unchanged. The land chance still comes from the fish, its class, the tackle, the lure or bait and the strike, by `catchParts`; a giant adds +10 Fight; the new waters add their Fight term; T5–T6 add Hold. Relic and Boon Hold are 0 while parked. |
| **Gear is global; bait and lures are fish-specific** | Unchanged, and now both are fitted at once (§4.4–§4.5). A bait is fish-specific through Hold; it no longer changes the pool, and every tin gives the same favour, so picking a tin is picking a fish. |
| **Bigger fish are harder; the size class shows; the species hides until the reveal** | Unchanged. A giant's tell is its class's tell. The card's clam value appears only after the reveal. A map card naming a giant is a promise about a place, not about a line (§5.1 rule 9). |
| **The got-away note** | Unchanged; a lost giant's note names it, and it becomes a Marked Fish. |
| **A very short tutorial at the Landing: the First Evening** (§25.4.8) | **Under the loop it is not used**: there is no fishing lesson at home and no cast in the cove (`M1.md` §2.6); the loop's opening is `OPENING.md` §6's beats, at the Jetty and from M1 step 5 at the Landing (drawn on the Chart), the first tow and the barge. What follows is the v3 build's, kept dormant (`M1.md` §2.15): the wake by the hearth, one cast, one strike, the play, the reveal, the card. It teaches fishing only. Three lines change: Murk's wake line becomes "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it."; the First Outing card shows the Mossmere, three empty slots (four for Tallow) and **Sail**; Murk's departure line becomes "Three slots in that hold. Fill them and come home." The Quayling is still not for sale (the tutorial's card has **Let go** only). *(14 November 2026, the user: "then you move into the tutorial at the home base. Which ends with being shown how to head out to the lake".)* Until the cove is built the tutorial is **at the Jetty** (slice 1a; `docs/loop/OPENING.md`), Murk's dock and the only shop left: DESIGN §25.4.8's fallback F0, not yet the lore's Landing where the last Wicks came ashore, which M1 step 5 brings (a known gap until then; from step 5 the wake is at the Landing, drawn on the Chart, the first tow brings the barge to the Jetty, and the Jetty is home because the home is moored there; the First Evening's fishing lesson is not used under the loop). The raft glides from the cut scene's last shot to Murk's dock at dawn; Murk's wake line; the **Chart** tile is cued; the Chart shows the Mossmere, the hold's empty slots (three; four for Tallow) and Murk's departure line (Tallow's names four; from M1 step 3 on the drawn Chart, whose first sheet inks in the first time it opens, §5.4); you press **Sail** and the raft glides out to open water (every Sail glides out the same way). One line at a time, no Skip word, every beat ends on a tap or a short wait (under 45 s; about 17 s untouched), never again once done. Fishing is taught on the first trip by the built light hints (the key glyphs, the strike ring) and two words once each: "Hold on the water. Let go to cast." and "Now. Tap." / "Now. Click." (§8.5 lists every word the opening shows). |
| **An opening cut scene** | Kept; under the loop its trigger and its hand-off change, and its line 3 is `LORE.md` §12's, "Its last candles fish from lamp to lamp." (the user, 14 November 2026: "Yes, rewrite line 3 once the story's done"; put in during slice 1a, under the loop only, so the v3 film keeps its line). `INTRO.cove.text[2]` (an unbuilt cove variant) is retired under the loop: the Landing's opening plays the same film with the same line. It plays before the First Evening, or before the Jetty while the cove is not built. *(14 November 2026, the user: "After youve pressed start, it should immediately go into the cut scene".)* Under the loop it is started by New Descent's **Start** (no other click, no loading screen; Skip as built), shows the Wick you chose, and hands off to the Jetty (from M1 step 5: through one ink dip to the Landing, drawn on the Chart, and the first tow), not to the lake. The title's **Prologue** word replays it. |
| **On a catch the Wick holds the fish up, shows it, pauses, then the card opens** | Kept. A giant's show holds a beat longer (the built ceremony's longest class pose). The ink print is taken in the same beat. |
| **Very few words on screen** | §8 is the whole text of the loop. |
| **Art, atmosphere and fishing are the key drivers** | Every trip plays the game's best light. A new place is paid out as a view (the mist lifting). Sixteen waters, each its own palette and landmarks, each a step greener than the one before, six of them rivers. |
| **The sharp Clear Night look, the lavender Starlit palette** | Kept. Mist banks are low (≤ 2.5 m), local and thin at the edge. |
| **Never a ring round the raft or the Wick** | Kept. The lantern's light is an edgeless pool; the good bites are dots by the float; fireflies keep 6 m from the raft. |
| **"Far too many green hues" (the early look); green only as a trace** | **Became the greening ramp** after the user's words of 14 November 2026: "I want the lakes to get progressively more and more lush and green … As we unlock new lakes and rivers we need to slowly but progressively start getting more and more green and lush." The Mossmere keeps green only as a trace, exactly as approved; each later water is one lushness step greener (§5.2, `WATERS.md`). Green never enters the air, the sky, the light, the grade or the UI, so the early complaint (green hues washing the frame) cannot come back. The built waters 2–4 step up first, gently, and are shown side by side for approval before any new water is built (§13 slice 1c). |
| **Original work only** | Kept (§25.15.3). Every fish is original (roster §1): no real species' name, never the series or its presenter. Real river and lake names may ship (§0 row 17). The hold is a row of slots, not a cargo grid; no spoilage, no storm timer, no panic. |
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
| §25.4 the Landing | **not home under the loop** (v7.3): home is the home barge (§6), the Landing is where the game starts (drawn on the Chart), and the built cove is parked, off; §25.4.4's growth table **replaced** by §6; §25.4.8 kept for the v3 build with three lines changed (§11) |
| §25.5 night modes | **parked**; every night is still |
| §25.6 automatic fishing | **kept whole**, except: a lure and a bait together (§25.6.3), no favour for a pass (§25.6.4), parked buffs are 0 (§25.6.5), tackle by clams without proofs and with T5–T6 (§25.6.6), the card's choices (§25.6.8), the giants' Fight (§3.5) |
| §25.7 size | kept; §25.7.3's value rule **replaced** by §4.1; food and oil parked; Elders in old water and as giants; records kept and joined by the ink print |
| §25.8 world and locations | **replaced** by the map catalogue (§5); the Mossmere places' geometry and the place names are reused |
| §25.9 progression, §25.10 economy, §25.11 retention | **replaced** by §4 and §5.5 (the three keys) |
| §25.12–§25.13 supersession and sync | kept as history |
| §25.14 phase plan | **replaced** from here on by §13; what is built (P1, AF, the First Evening's logic) is the base; the P2–P4 lists are a parts bin |
| §25.15 risks, cuts, originality | the originality rules kept |
| §26.4 and `docs/loop/ROSTER.md` (the roster) | **binding for the fish**: names, looks, plays, sizes, rarities, hours, waters, places and giants. This spec is binding for where they bite in play (eleven fish move, §5.2), what they pay and what the maps cost; the roster deferred prices to it |
| v4, v5 and v6 of this file (commits 1aa478c, 3fc4a12, 85f78ae) | **replaced** by v7; the loop, the hold rule and the parked list carry over |
| `docs/loop/WATERS.md` (the ramp and the rivers) | **binding for each water's look**: its lushness step, green share, foliage, palette by phase, landmark, and the river rules. DESIGN §19.1's palette rule (green and teal as rare trace accents) holds for the Mossmere and the Landing; for the other waters `WATERS.md` §3 and §7 replace it |
| `docs/loop/WICKS.md` (the five passives) | **binding for the Wicks**: each passive's rule, its knobs and ranges, its hooks and its tests; the balancing job sets the final values |
| `docs/loop/OPENING.md` | **binding for the opening**: the title, New Descent, Start, the hand-off, the tutorial and the first trip's words |
| `docs/loop/M1.md` | **binding for M1**: its done-list, its build order, its Chart plan and its pacing |
| `docs/loop/WORLD.md` §10 and `tools/world-map/` | **binding for the Chart's look and its reveal**; the generator's bake and `src/chart-draw.js` are the Chart's art |
| §1–§24, Appendix A and B | as §25.12 says; everything about combat, survival and the meta is parked (§9) |
| `docs/loop/FINDS.md` | **binding for finds**: the snag, the kinds, the sets, the rates and values (the balancing job sets the final numbers), the show, the card, the Keepsakes page, the M1 step |
| `docs/loop/AQUARIUM.md` | **binding for the aquarium's design**, built after M1 |
| CONTRACT §13 | binding for everything kept; a §14 for the loop's API is written with slice 1a |

---

## 13. The build plan

> **The user's re-cut (15 November 2026, binding).** Asked what it takes to get map 1 and the home base "fully 100% finished and playable", the user said "Yes" to finishing **the Mossmere and the Landing first**: milestone **M1** is slice 1a, the Mossmere halves of slices 1b and 2, slice 3 without Sporewood's fish, the cove (FE-W1) and slice 4, then a polish pass. Sporewood's content, slices 1c and 1d and everything after wait until M1 is done; Sporewood's sheet shows sealed until then. **v7.3** (the user's words of 15 November 2026, §0 row 18): M1 step 5 is now **the home barge** and slice 4 on it; the cove leaves M1 (parked, decision 47), and M1 is "the Mossmere and the home barge, complete". **v7.2 re-cuts the slices here** (the M1 plan, QUEUE job 5; `docs/loop/M1.md` holds the milestone's done-list, build order, Chart plan and pacing): M1's six steps first (QUEUE jobs 9–14), then each slice's part after M1, marked **after M1**, in QUEUE's order (jobs 15–16).

Twelve slices, cut into M1's six steps and the parts after M1. Each step ends playable, behind `GW_LOOP`; the default build flips to the loop at the end of M1 step 2 (the opening and the Mossmere's roster fish both in, as slice 1a's rule says). **Every slice's gate:** `node tools/validate-data.mjs` (its LOOP pass included), `node tools/check.mjs`, `node tools/sim/clams.mjs --quick` (from slice 1a it reads `data.LOOP`), `node tools/sim/roster-check.mjs`, the slice's browser scenario with no console errors, and **the flag-off checks unchanged**: the v1 golden trace, the flag-off scenario run, and the v3 browser scenarios `run-v3`, `m1-v3` and `af-progression` with the loop off (the loop edits v3's code paths: measure, the loadout, the v3 clock, the v3 card). **From slice 1c every slice that touches a water's look also passes** the Mossmere byte-identity test (its rocks, organics, fine and floater geometry hash, its shader programs and a frame fingerprint unchanged), the `lush` and palette rules of `validate-data`, and the `hue-report` gates for every water it ships, **the step test against its neighbours included** (`WATERS.md` §7), with `python3 tools/loop-colour-script.py` re-run when a palette moves. **Every slice that ships a river also passes** the river validator, the drift sim and the cast sim (`WATERS.md` §4.6). **From M1 step 1 the sim's gate is also** `node tools/sim/clams.mjs --shipped=<the last shipped water> --step=<the step>` (M1: `--shipped=mossmere`; `docs/loop/M1.md` §6.4), once the balancing jobs (QUEUE jobs 6 and 8, which own `clams.mjs`) have committed it; until then `--quick`. Captures run only when the shared machines are free. Sizes: S ≤ 2 days, M 3–6 days, L 1–2 weeks, one implementer per lane. From slice 3 each slice has a **fish lane** (body plans in `models-fish.js`, the species data) beside its systems lane.

**Two rules that let the roster arrive in pieces.** (1) A re-founded built species keeps its built model until its new plan ships (the Matriarch stays carp-shaped until the catfish plan). (2) A new roster species bites only once its body plan exists; until then it is not in the pool, and the sim's pacing for that slice is re-run on what ships. (3) **A water past `LOOP.shipped` is sealed** (decision 39): no lake map past it is on the shelf, its sheet on the Chart reads "Coming soon", and the sim runs on what ships.

### M1: the Mossmere and the home barge, complete (QUEUE jobs 9–14)

| step | QUEUE job | what ships | from | size |
|---|---|---|---|---|
| 1 | 9 | the core loop at the Jetty, the opening, the five Wicks and their passives, the film's line 3, the catch show's leftovers | slice 1a, whole | L |
| 2 | 10 | the Mossmere's roster fish at roster sizes; the converter and the allow-list; `LOOP.shipped` | slice 1b's Mossmere half | S |
| 3 | 11 *(visual)* | the Mossmere's four places in mist, its two giants and its legend, Elders in old water, the Kissmark Trout, the Gloam Eel's water, the Bridgechain Sturgeon, the lamprey, sturgeon and trout plans, each place's own dressing, the bait slot with the Heartmoss Ball (3a); **the drawn Chart** (3b) | slice 2's Mossmere half | L+ (3a L, 3b M) |
| 4 | 12 | the tins, the lure slot and lures, Cut Strip, Oars, the Keel and the Lantern, Murk's orders, the gear log; the catfish plan, so the Matriarch is a catfish | slice 3 without Sporewood's fish | M |
| 5 | 13 *(visual)* | **the home barge** (5a: one actor, its mooring at the Jetty, the home flow live in the water scene), then slice 4 on it (5b): the barge's four places, the home upgrades as objects on it, the sill's stones, the prints, the giants' page, the opening at the Landing (drawn on the Chart) and the first tow | slice 4 | M + L |
| 5c | 13 | **the Mossmere's finds**: the snag, the find show and card, treasures at the tally, three barge parts and three looks, the Keepsakes page (`FINDS.md` §12) | — (new) | S–M |
| 6 | 14 | the polish pass: the show's sound mix, phone performance, a full playthrough from a fresh save to an empty shelf, the new cut-scene video | — | M |

Each step is built, reviewed, merged and previewed before the next. Before step 1: pounds merged (`gw-pounds`), the three keys (v8, QUEUE job 6) and the Wicks' balancing (QUEUE job 8, `clams.mjs --wicks`) committed. **M1 is done** when every box of `docs/loop/M1.md` §2 is ticked on the default build, desktop and phone, from a fresh save.

### M1 step 1 (QUEUE job 9). Slice 1a: Three slots on the built fish (L). The smallest thing that is already the user's game.

Before any UI, a **node-level trip harness** (`tools/tests/loop-trip.test.mjs`) drives `progression-loop` with a fake `ctx`: cast, bite, measure, keep, let go, `endTrip`, buy. It proves the rules below without a browser.

| | |
|---|---|
| **the player can** | *(14 November 2026, the user:)* Press **New Descent** and choose one of the five Wicks, nothing else; press **Start** and go straight into the cut scene; glide to the Jetty and be shown, in a very short tutorial, the hold's empty slots (three; four for Tallow) and how to head out (the Chart, **Sail**, the glide out). Start at the Jetty. Sail to the Mossmere's open water for an evening. Catch fish automatically (as built). Keep or let go at the card, seeing the clams. Fill the hold (three slots; four for Tallow); be refused a cast when full. Go home (press and hold). Watch Murk's tally. Buy **Hold 4, Hold 5, Rod, Line and Reel T1 and T2**. Sail again. Close the game mid-trip and continue. Never fail. *(15 November 2026, §0 rows 11, 12, 15 and 16:)* Play a Wick whose one passive works from the first evening (§10.1); watch the film with its new line 3; read each fish's weight in pounds on the card and on Murk's scale. |
| **waters and fish** | the Mossmere's open water, on the **built phase-1 species** and their built sizes; §4.1 uses the built L50 |
| **new body plans** | none |
| **reuses** | automatic fishing and its logs; the catch card, the ceremony and the landing's payoff; the creel (as the hold); `TACKLE` tiers and `getLoadout`; pressure (as quiet water's pattern); the Still night; the Journal; the built Mossmere arena; Murk's barge at a dock |
| **modules** | *(14 November 2026, the user: the opening)* new `loop-tutorial.js` (the Jetty tutorial's beats) · `ui-screens.js` (the title of §8.5 and the Wick-only New Descent) · `ui-intro.js` (the New Descent panel held under the cut scene's ink) · `progression-loop.js` (`meta.loop.wick`, `meta.loop.tutorial`) · `main.js` (`beginIntro` with the chosen Wick, the hand-off glide to the Jetty, the glide out on every Sail) · `data.js` (`LOOP_ENABLED`, `PARKED`, `LOOP`: value rule and the Mossmere's tier, hold, water, evening, the tackle prices, `TEXT_LOOP`; *14 November 2026:* `LOOP.wicks`, `LOOP.tutorial`, the opening's words) · `core.js` (the switch; writes `GW_V3` and `GW_V3_PHASE = 1`) · `main.js` (the `home` flow; Jetty → Sail → Home → tally; no death flow; the pause menu and title of §8.5; the boot rule of §9) · new `progression-loop.js` (`meta.loop`, clams, the hold, `endTrip`, the shelf, `run.bites`, `run.mercy`) · `progression.js` (**`measure()` writes records only** and pays no first-catch Shells; **`fishAction('keep' | 'letgo')`** as §3.2; `restorePending` reopens the card; **`createRun` under LOOP**: the zone must be in `meta.loop.maps.lakes`, outing `trip`, night mode `still`, no start Shells, kit, purse or Wick start kit, bait from `meta.loop.bait`) · `progression-market.js` (no Murk on the water) · `progression-af.js` (`getLoadout` from `meta.loop.tackle`, `perRun: false`; parked buffs 0) · `fishing.js` (emits `fishing:bite`; reads `getBitesLeft`; the cast refused when full; no pass favour; no Elders in open water; hour windows) · `survival.js` (parked drains; the evening clock; no hush; the open night) · `combat.js` / `combat-modes.js` (parked) · `ui-hud-v3.js` (slots, the Home pill, dots; parked gauges hidden) · `ui-screens.js` and new `ui-loop.js` (the card's buttons, the tally, the Jetty, the shelf, the Chart as a list) · `tools/validate-data.mjs` (the LOOP pass) · `tools/sim/clams.mjs` (reads `data.LOOP`; its draft table for what has moved is deleted) |
| **tests** (`tools/tests/loop.test.mjs`, the trip harness, browser scenario `loop-1a`) | the hold: 3 slots (Tallow 4), the next keep refused, the cast refused when full · keep and let go: both write the record; measure leaves the hold unchanged; let go refunds its bite and adds +0.2 favour there, to +0.4; Continue with the card open reopens it · bites: struck, passed, landed, lost and spooked bites each spend one; a lingering re-cast spends from where the fish first bit; quiet after 4 at hold 3 (Tallow 6); −0.15 each to −1.2; no reset at dusk or night; reset at home · the evening: day 40 s, dusk 20 s, night holds; frozen in the ceremony; a "dusk" fish bites at night, not by day; no hush; no NaN after 10 min of night · value: a Keeper Dusk Minnow (z 0.4) 7 on the built L50 (the roster's sizes arrive in 1b), clams persist; "12.4k" from 10,000 · the tally: `endTrip` pays once; a reload during the tally pays exactly once · the shelf: prices, the order of hold steps, a tier raises `catchChance` · parked: a night with no enemy, no change in oil, satiety or health, no death, no Memories, no `merchant:arrive` and no Trade pill on a trip, no giant spot in the Mossmere's open water · no path from the pause menu or the title empties a hold without selling it · saves: continue mid-trip; an old save gains `meta.loop` and loses nothing; an old save with start-kit challenges starts a trip with no free bait; a trip saved with the flag on and opened with it off is sold and dropped · *(14 November 2026, the user)* the opening: New Descent shows only the five Wicks and Start; Start plays the cut scene at once; the chosen Wick is the film's and every trip's; the film hands to the Jetty; the tutorial's beats each end on a tap or a short wait, it is under 45 s, it ends with Sail and the glide out, a reload resumes it, a done save never sees it; the first trip's two words once each; flag-off and v3-without-loop openings unchanged · the scenario: fresh save → New Descent → a Wick → Start → the cut scene (skipped) → the tutorial → Sail → a full hold → Home → +clams → Hold 4 → a second trip · **measure the visit home** (the tally fish by fish, the glide, the Jetty, the shelf, the Chart) and write it into `LOOP.time`; re-run the sim |
| **left out on purpose** | roster species and sizes (1b); places, mist and giants; bait and lures (the built selector is hidden); orders; the other raft parts; home upgrades; legends; the cove and the cove's First Evening (the default build flips to the loop only when slice 1b and the opening are both in). *(14 November 2026, the user:)* the cut scene, the Jetty tutorial and the five Wicks are **in** slice 1a; changing Wick after the first New Descent is left out (a question for the user, PLAN §7.1) |
| **the five passives** *(15 November 2026)* | `WICKS.md` §2 and §5: `LOOP.wicks` in its shape; `wickSlots` and `loopSlots`; `goodBitesFor` and `quietTerms` with the Wick; `wickPoolWeights`; the Wick's `firsts` ledger and `loop.saleOf`; Ashwick's comeback; `coinBright`; Tallow's hold row (4–6 cells in 1a) and its chart line; tests T76–T80 (proposed there) and T1, T10, T23/T24, T36, T53, T61, T65/T67, T72, T75 as amended (PLAN revision 6). Every Wick's built small trait is retired on a trip; Stub's light radius stays as a look |
| **the film's line 3** | under the loop only (the apply block), `INTRO.text[2]` = "Its last candles fish from lamp to lamp." (`LORE.md` §12) and `INTRO.cove.text[2]` the same; its timing `INTRO.lines[2]` kept (12.5–14.85 s: 40 characters at 17.0 a second, under the film's 17.5 rule), re-checked by `intro-length` and the A5 words test and moved by at most 0.15 s if either fails; the v3-without-loop film keeps its line (the v3 fingerprint). Lane B (PLAN §2.2 item 26). The new video is M1 step 6's |
| **the catch show's leftovers** (QUEUE's backlog for job 9) | lane B (PLAN §2.2 item 25): the film owns the grade under a replayed film; the card's stamp guarded by the flow; a trial's sounds held with its toasts until the card; the show's measured mix faults (the offline render's gates). The by-ear mix is M1 step 6's |
| **pounds** | from `gw-pounds`, merged first: the card's weight as its hero; the tally's rows on Murk's scale, lightest first and heaviest last, each with its weight (`endTrip` stores it); no length on a loop screen but the card's small line |
| **the Chart** | a list (one row, the Mossmere, its open water chosen, the hold's slots, **Sail**), drawn from the pure `chartModel(meta, D)` that M1 step 3 draws as the drawn Chart (§5.4; `M1.md` §3.6). No Sporewood row |
| **the gate, added** | the per-Wick smoke pass (PLAN lane D); `intro-length` and A5 with line 3; the offline show render's gates (on a committed fixture of `show-seq`'s audio log); `show-seq` and `intro-show-seam` re-baselined for the show's fixes alone, the one sanctioned flag-off change (`M1.md` §2.15); `clams.mjs --shipped=mossmere --step=1` once committed |

### M1 step 2 (QUEUE job 10). Slice 1b's Mossmere half: the roster's first fish (S).

| | |
|---|---|
| **the player can** | Catch the Mossmere's roster fish at their roster sizes, told in pounds. Sporewood's map is not on the shelf (`LOOP.shipped` is the Mossmere). |
| **waters and fish** | the Mossmere's open water: the eight roster fish on built plans (Dusk Minnow, Mossback Perch, Likely Chub, Overbold Bass, Rustfin Sucker, Milkeye Perch, Weeping Carp, Reedjaw Pike) and the three built species the roster keeps there (Gutter Crayfish, Candlefin Koi, Lampsipper, its phase-2 record lifted past the loop's phase gate by `SPECIES_LOOP`): 11 fish, the Mossmere's list as it stands at 1b (§5.5) |
| **the converter** | one shared module, **`src/roster-species.js`**, `rosterSpecies(roster, builtSpecies)`, imported by `data.js` and by `tools/sim/clams.mjs` so the game and the sim cannot drift. Its rules are the table below. |
| **the allow-list** | the converter copies only `id, name, look, journal, haunt, play, sizes, hours, place, rarity, family, bodyPlan` (and `water`, `placeName`, `giant`). **`giantOf`, `inspiredBy`, `refWeight`, `draft` and every research field stay in `docs/`.** `validate-data` fails if `giantOf`, `inspiredBy`, any episode title, any research common name, the series or its presenter appears anywhere in `src/` (the game ships as one HTML file). Real river and lake names are allowed (§0 row 17). |
| **`LOOP.shipped`** | `'mossmere'` (decision 39): no lake map past it on the shelf; the Chart (from step 3) seals the next sheet "Coming soon"; the sim runs `--shipped=mossmere` |
| **modules** | `src/roster-species.js` (new) · `data.js` (`SPECIES_LOOP` from the converter for the Mossmere; `LOOP.shipped`) · `tools/validate-data.mjs` (the allow-list and the names rule; every shipped fish on its plan; every map card's named fish exists in loop `SPECIES`) · `tools/sim/clams.mjs` (imports the converter; owned by the balancing jobs) |
| **tests** | the worked values of §4.1 on the roster sizes (Weeping Carp 26, Reedjaw Pike 158 / 406 / 1,022) · no forbidden field or name in `src/` · the converter's output equals the sim's species table for the 11 · the Sporewood map is never offered while `LOOP.shipped` is the Mossmere · every weight within its body plan's ±30% (pounds) |
| **left out** | Sporewood's map, water and fish (after M1); the Kissmark Trout and the Bridgechain Sturgeon (step 3, with their plans); the Gloam Eel (step 3's night water, step 4's bait); places |

**The converter's rules.**

| roster field | game species field | rule |
|---|---|---|
| `play` ("Sulker. …") | `style` | the first word, lower case (`sulker`, `darter`, `steady`, …); a legend keeps `CATCH_V3.legend.style` |
| `hours` | `time` (a window list) | "day" → day, dusk · "dusk" → dusk, night · "night" → night · "day, dusk" and "dusk, night" as written · "any" → all · "any, best at night" → all, ×1.5 after dark (§3.4) |
| `haunt` | `depth` | any depth under the loop (the sim has no cast depth); the haunt text stays for the Journal |
| `favours` | `baits` (Hold list) and `bait` (bait-only) | a tin named in the text is a Hold bait; "bites on X only" makes X its only bait |
| `sizeModel` | `size` | `L50`, σ and the class ladder as the roster gives them. **`size.k` is the body plan's**: `BALANCE.size.k[bodyPlan]` (validate-data keeps "a species' k equals its body constant"), each plan's constant set from a real cousin's weight at the plan's typical length (`docs/v3/pounds/SPEC.md` §6.4). A fish whose own cousin is more than ±30% off its plan gets **its own named body key** (as `trout`, `gar`, `greateel` and `swampeel` were split off: a plain family or build word, never a real species' own name, which `roster-check.mjs` `REAL_NAMES` lists), never a per-fish number in `roster.json`. A legend carries an authored `W50` (kg, the cousin's weight at its first-landing length) through `legendSize(L50, W50)`, re-derived as `k·L50³` when the roster's `L50` differs from the built one. The cousin's reference weight lives in a docs-only roster field, `refWeight: {cm, kg, source}`, which is **not** on the allow-list; `roster-check.mjs` gains the ±30% rule |
| `water` (a list) | `zones` (a list) | a fish of two waters (the Lampspot Snakehead) has both |
| `place`, `placeName`, `giant` | `kind`, `place`, `giant` | as the roster, except the eleven moves of §5.2 |
| built `cond` (§25.8 place conditions: deed, reflection, plumbBottom …) | — | ignored under the loop |
| built `src: 'walk'` | — | the kept walk species the map cards name (the Wax-Bearer, the Clapper, the Unreflected, the Footnote, Hushcap Koi) are included under the loop |

### M1 step 3 (QUEUE job 11, visual). Slice 2's Mossmere half: the mist lifts, and the drawn Chart (L+: 3a L, 3b M).

| | |
|---|---|
| **the player can** | See mist banks over the Mossmere's four places, with a giant's back turning in Under the Span's and the Buoy Lights'. Buy the Lily Maze (60), Under the Span (150), the Buoy Lights (260) and the Bell Pool (500) from a shelf of at most three map cards, each naming its fish. Watch the mist lift. Meet Elders in old water. Meet the **Thousandcast Pike** and the **Hullkiss Lamprey**; land one; see its gold card, its ★ on the Chart and the Journal's giants' page. Fit the Heartmoss Ball in the bait slot, hunt the Belled Matriarch with it and be paid 500 for her at the tally. Catch the Kissmark Trout and the Bridgechain Sturgeon. Buy Hold 6. See each place's own dressing once its mist lifts (`M1.md` §2.2). **Use the drawn Chart** (§5.4; step 3b): the first sheet, the Mossmere's sheet with its places, Sporewood's sealed sheet with its three seals and "Coming soon". |
| **waters and fish** | the Mossmere's four places; its 2 epic giants and its legend; the Kissmark Trout (open water), the Bridgechain Sturgeon (Under the Span's own), the Gloam Eel's night water (it bites from step 4, on Lumen Moss): 16 of the Mossmere's 17 fish bite |
| **new body plans** | **lamprey** (the eel with a mouth parameter: S), **sturgeon** (named, now built: M; Bridgechain first), **trout** (the minnow with a fatty fin and jaw: M; Kissmark Trout first). The Matriarch stays carp-shaped until step 4 |
| **the Chart** (3b, its own lane, after the export spike measures the crop and the code) | `M1.md` §3: the generator's game export of sheet 1 (`tools/world-map/build.mjs --game` → the generated `src/chart-art.js`), the shared drawing module `src/chart-draw.js` (the generator's page inlines it), `src/ui-chart.js` (the screen; the Mossmere's sheet from its arena; blots, vignettes, best fish, ★; the sealed sheet and its seals from §5.5's data); the tutorial's chart beat on it (§11) |
| **each place's dressing, and the re-dress** | each place's own `build` (the Lily Maze's pads ×2 and glow-buds; Under the Span's arch spans, deck and chains, W9's `span_arches` moved here; the Buoy Lights' 24 caps and glow decals; the Bell Pool's bell as a depth-tinted shape, seen without Moonfall), on under the loop; the rest of DESIGN §25.8's W9 (buoy-lanterns for the street lamp-posts, the leaning toll-tower, the Sluice Veil card with no spout until the Cupped Hands exist; inside §25.8.8's Mossmere line) behind `LOOP.redress`, off until the user's yes (§16 question 14) |
| **modules** | `data.js` (`LOOP.places` for the Mossmere from `MOSSMERE_V3` geometry; giant shares; map cards; place pools: commons ×0.5, a day water's draw ×1.5; Hold 6) · `world.js` / `world-v3.js` / `world-fx.js` (mist banks from the built mist material; the giant's back in the mist; the landmark silhouettes; W9) · `fishing.js` (`placeAt` from `LOOP.places`; good bites and favour by kind; draws; a place's own species; night water; Elders by kind and for giants; the giant's share, floor, favour and Fight; Taper's ×1.3; a cast into mist) · `models-fish.js` (three plans) · `render-camera.js` (the mist-lift shot) · `ui-loop.js` (the Maps tab, the gold card, the giants' page) · `ui-hud-v3.js` (the hold row in two rows past 6 cells) · `progression-loop.js` (maps owned, giants landed, the legend's prize at the tally, wounds) · the Chart's three files and the generator's export |
| **tests** | a cast into mist returns and spends nothing · owning a map removes its mist and adds its good bites · Elders roll only in old water and for a giant at its own place · a giant never bites elsewhere and is never Small · over 20,000 bites at Under the Span the Thousandcast share is 6% ± 1 at dusk and night, 2.5% ± 0.7 by day · the Thousandcast at Prize lands less often than every other Mossmere fish on T1 · night water gives nothing before dark · the shelf never shows more than three maps · the Matriarch needs her pool, her bait, her hour and a free slot · the Heartmoss Ball is spent only by her bite · her first-try chance at T1 equals the sim's 27% · draw calls inside §25.8.8's Mossmere line · the Chart: nothing unowned drawn (the sheet-2 region of every Chart frame is bare paper), the byte budget (≤ 300 KB of Chart in `index.html`), no two tap targets overlapping at 358 px, the sealed sheet with no price and no buy button, only Murk's three blots priced (a Chart case of the three-cards test), the tutorial's beat (T65) unchanged on the drawn Chart · `clams.mjs --shipped=mossmere --step=3` |
| **the user's look** | the frames (the four mist banks, a lift, each giant's show, the Matriarch, the Chart on desktop and phone; W9 side by side) before the merge |
| **left out** | Sporewood's day and old water and the Harpstring Eel (after M1); place twists and Moonfall (slice 9's "one twist per place"); the harbour re-dress beyond W9; pan and zoom on the Chart |

### M1 step 4 (QUEUE job 12). Slice 3 without Sporewood's fish: bait, lures, the raft and Murk's orders, and the Matriarch a catfish (M).

| | |
|---|---|
| **the player can** | Fit a lure beside the bait (the bait slot is step 3's). Buy the Mossmere's tins (Mire Worms, Lumen Moss: 10 a tin of 10) and its four lures (Feather Fly, Glimmer Spoon, Bone Jig and the re-aimed Harbour-Bell Spinner). Cut a Small or a Keeper into bait by holding Let go. Catch the Gloam Eel on Lumen Moss. Buy Oars I–II, the Keel I–II and the Lantern I–II and see them on the raft. Buy the Order Board I–II and fill Murk's orders for double. Read the gear log at the shelf. See the Matriarch as a catfish. |
| **waters and fish** | the Mossmere: all 17 fish bite |
| **new body plans** | **catfish** (a new builder from the pike profile; M in M1, where only the Matriarch rides on it; its other 30 fish are checked against it after M1) |
| **modules** | `data.js` (`LOOP.lures`, `.baitRule`, `.raft`, `.home.orders`; the giants' lure lists) · `progression-loop.js` and `progression-market.js` (tins per water, orders on the bounty engine, no expiry) · `progression-af.js` and `fishing.js` (two fitted items; bait favour; cut bait; bait attract parked) · `actors-raft.js` (the parts' models) · `player.js` (raft speed) · `models-fish.js` (the catfish plan) · `ui-loop.js`, `ui-af.js`, `ui-chart.js` (the lure slot under the sheet; the tins in the bait slot) |
| **tests** | lure and bait Hold never stack (the larger counts) · a bait is spent per hooked fish and comes back on a pass · a bait changes the pool only for its bait-only fish (the Gloam Eel) · every tin in a water costs 1.5 × its tier · the Keel adds +0.1 favour a level everywhere · family lures do not raise a giant's share; its giants' lure does, ×1.5 · an order doubles exactly the fish that fill it, never names a giant and never expires · the sim's bait rows hold on real data · no item is offered before its "on the shelf with" (decision 38) · `clams.mjs --shipped=mossmere --step=4` · the Matriarch's first-try chance at T1 is still 27% on her new body · `clams.mjs --shipped=mossmere --step=3` |
| **left out** | Sporewood's four fish and the bream, disc and tuna plans (after M1); the Moth Popper and the Lantern Lure (with their maps); the Bait Bed (step 5); Keel III and Order Board III (with their maps) |

### M1 step 5 (QUEUE job 13, visual). The home barge, then slice 4 on it (M + L).

*v7.3 (the user's words of 15 November 2026, §0 row 18): this step was "the cove, then slice 4: the Landing as home" (L + L). The cove leaves M1, parked (decision 47); home is one barge moored at the Jetty, in the water scene slice 1a already runs.*

| | |
|---|---|
| **the barge** (5a, M) | **One actor**, `actors-home.js`: the Slow Hearth (§6.1) as one merged static mesh per material (hull, cabin, roof and rails; the windows and the stove's banked glow emissive), its upgrade objects as variants switched by `meta.loop.home` and `meta.loop.looks`, the sill's four stones of arc I; with every M1 home object ≤ 6 main-pass draw calls, ≤ 2 mirror, ≤ 2 shadow, no PointLight. **Its mooring**: `LOOP.mooring.mossmere` on `docks[0]`, the Jetty (§6.5), with Murk's barge (the built merchant actor in a new `moored` mode at the mooring's `murk` slot: its PointLight held at 0, the lamp's glow mesh and halo only; no turning to track the raft; no Trade pill) and the raft's place at the stern, the hulls as rows of circle obstacles in `layout.obstacles` (the built `{x, z, r}` circles that the raft's collision, the water's foam and the validator already read), checked by `validate-data --loop`. **The home flow live in the water scene** (main, render, ui-loop; §6.1): the sail home's glide ends at the stern; the home camera (`render` mode `'home'` from the mooring's `cam`, eased in 1.2 s); the targets as DOM buttons over the objects' projected bounds with the tiles' words, selectors and focus order (`[data-tile=murk\|chart\|journal]`, and `wall` from wing I); home presses go to them, never to `fishing.onPointerDown`; the glide out unties the raft from the stern; the barge stays moored and lit through the evening. **The save**: `meta.loop.barge = {water, towed}`, its own field (not inside `home`), `migrateLoop` setting it to the Mossmere on an older save. **Main**: `startTrip` no longer calls `merchant.leave` (Murk stays moored through the evening); `enterHome` and Continue moor him at the slot. 5a can merge alone, with the Jetty's tiles drawn over the barge, if 5b slips |
| **the player can** (5b, slice 4, L) | Come home at first light to the barge at the Jetty, the raft tied at its stern. Tap Murk's barge (the shelf), the chart table under the awning (the Chart; its top shows it), the lectern by the cabin door (the Journal) and, from the first wing, the cabin (the gallery). Be shown the opening at the Landing and the first tow (`OPENING.md` §6.2: the film's hand-off through one ink dip to the Landing on the Chart, Murk's wake line there, the tow's leg up the Sluice Run on the Chart, one ink dip, the raft towing the barge in to the Jetty, then the chart beat over the moored barge and Sail). Buy the Bait Bed I–II, Barge lights I, the Long Wall's first wing and the three looks, and see each on the barge or the raft; see the Order Board on Murk's barge, the raft's parts on the raft at the stern, the rod on the barge's rack. See the Mossmere's stone inked on the door sill, gilded once the Matriarch is home, and her print over the cabin door. Browse ink prints and the giants' page. From out on the water at night, see home's windows by the Jetty. |
| **needs** | 5a; M1 step 3b (the opening's Landing and the tow are drawn on the drawn Chart) |
| **new body plans** | none in M1 (slice 4's snakehead and gar serve later waters: after M1) |
| **modules** | `actors-home.js` (new: the barge, its upgrade variants, the sill's stones, the gallery's frames, the tow line) · `actors-merchant.js` (5a: the `moored` mode at the mooring's `murk` slot, its PointLight held at 0, no turn toward the raft) · `world.js` (the mooring from `arena.mooring` or `docks[0]`; the hulls as rows of circle obstacles in `layout.obstacles`) · `data.js` (`LOOP.mooring`, `LOOP.tow` timings: the leg 4 s + 0.5 s a crossing, ≤ 6 s; the dip 0.6 s; the glide in 3 s; no new words) · `main.js` (5a: the home flow's targets and camera in `home`, `startTrip` without `merchant.leave`, Murk moored at `enterHome` and Continue; 5b: the film's hand-off through one ink dip to the Chart's Landing; `playTow(leg)`, both halves; the glide in to the stern and the glide out from it) · `render.js` (the `'home'` camera; the cabin's gallery shot) · `audio.js` (home's bed: the stove, water against the hull, a far bell, Murk's hand bell; the tow's sounds) · `ui-loop.js` (the targets for the tiles; the Prints page; the giants' page in gold) · `ui-chart.js` and `chart-draw.js` (`drawToTexture` for the chart table's top; `chartLeg(leg)`, the tow's first half: the leg's view, the two marks on their line, the new sheet's ink-in; the Landing's vignette with the barge-house in the cove) · `ui-fishart.js` (the print, the gold frame) · `progression-loop.js` (prints at the measure; `barge.water`, `barge.towed`) · `loop-tutorial.js` (the opening's beats at the Landing and the tow, then the chart beat) · `tests/clarity-perf.scenario.mjs` (`--home`: the Mossmere at first light with the barge and every M1 home object, and at night from open water). `first-evening.js`, the cove and `world.SUPPORTS_COVE` are not touched |
| **tests** | the opening ends in the first trip in under 60 s · a print is written for a kept and for a let-go fish · the best print per species wins · every home level changes the scene (a before-and-after pair each) · a home scenario: each target opens its screen, a press anywhere else at home never casts, Sail unties the raft and glides out, the barge is at its mooring when seen from open water at night · the tow plays once (a second Sail never replays it), both halves in the opening (the Chart's leg and the glide in), each part's length gated on its own (the leg 4 s + 0.5 s a crossing and ≤ 6 s, the Sluice Run's 5 s; the dip 0.6 s; the glide in 3 s), a tap ends the leg and a tap ends the glide in at the mooring, a reload during it lands at the mooring with `barge.towed` written, reduced motion inks the leg at once · Murk moored: his lamp's PointLight at 0 at home and on the water, no turn toward the raft, no `merchant:arrive` and no Trade pill on a trip · the mooring's validator checks on the Mossmere · the home frame's draw calls with every M1 home object and the barge's share of the evening's frame by `clarity-perf --home` (`M1.md` §2.14) · the tutorial's T65, T67 and T72 with the Landing, the tow and the targets · `world.SUPPORTS_COVE` still false and the v3 scenarios unchanged · the visit home measured at the barge and written into `LOOP.time`, then `clams.mjs --shipped=mossmere --step=5` |
| **the user's look** | the barge at first light and with its first lights, at night from out on the water, the opening's Landing and the first tow, desktop and phone, before the merge |
| **left out** | walking aboard; casting at home (§16 question 17); the cove (FE-W1 and its neighbours, `SUPPORTS_COVE`: parked; built only if the user asks for a 3D Landing, §16 question 18); the First Evening's fishing lesson and the Quayling (the v3 build's); the keep-pond, the Shrine and the Trials Board; the way back by the lamps (it needs a second water: with Sporewood); wings II–IV and arcs II–IV (with their reaches) |

### M1 step 5c (QUEUE job 13, after 5b). The Mossmere's finds (S–M).

*v8.1 (the user's words of 15 November 2026, §0 row 19). `docs/loop/FINDS.md` §12 holds the step whole; this is its summary.*

| | |
|---|---|
| **the player can** | Feel a slow heavy bite with no fight, strike it and watch the Wick haul up and hold out something that is not a fish; read its card; keep it or let it go. Sell the Mossmere's five treasures at the tally (the Bent Tin Spoon for 14 up to the Toll-Keeper's Purse for 1,750). Bring home its three barge parts and see each fitted to the Slow Hearth, and its three looks worn by the Wick, the raft and the barge. Turn the Journal to **Keepsakes** |
| **needs** | 5b (the barge, its variants, the looks) |
| **modules** | `fishing.js`, `fishing-fx.js` (the snag, its tell, the haul) · `models-finds.js` (new: the eleven props) · `actors-show.js` (the find row) · `progression-loop.js` (find entries in the hold, the tally, `meta.loop.finds`) · `ui-loop.js` (the card, the tally's rows, the Keepsakes page) · `ui-hud-v3.js` · `ui-fishart.js` · `actors-home.js`, `actors-raft.js`, `actors-wick.js` (the parts and looks) · `audio.js` · `data.js` (`LOOP.finds`) · `tools/validate-data.mjs` |
| **tests** | `FINDS.md` §12's: the snag share 5% ± 0.5 over 20,000 bites and 0 on evening 1 and on a legend's cast; a snag spends a good bite and a let-go find refunds it without favour; never lost; a slot each; the tally pays a treasure once and carries a part aboard for nothing; parts and looks never repeat; no find counts toward the catch seal, a record, a print, an order or a first; every part changes the home frame and home stays ≤ 6 main-pass calls; the Keepsakes page draws only owned waters · `clams.mjs --shipped=mossmere --step=5c` (§4.10's gates) |
| **left out** | the looks' wear toggle (no slot holds two looks in M1); the well pieces (with the aquarium); every other water's set (with its slice) |

### M1 step 6 (QUEUE job 14). The polish pass (M).

| | |
|---|---|
| **the show's sound mix** | by ear and by the offline render (`tools/audio-render.mjs --set=show` on the committed fixture, `--set=mossmere` from step 3, and `--set=home`, new work here, for the tally and the barge): every class's show, the giant's and the legend's; the card; the tally; the mist lift; the cove bed. Gates: the present the loudest beat of every show; no card sound louder than its show's present; the master's peak ≤ −1.0 dBFS; nothing under the film from a show or a card |
| **phone performance** | `M1.md` §2.14's budgets: on the shared software-GL machines `clarity-perf`'s draw calls and `cpuMs` per tier (`--mobile`), never a wall-clock frame time; on real phones (an iPhone in Safari, a mid-range Android in Chrome) p95 ≤ 33 ms on the water, in the show and at home on the barge, and boot ≤ 3 s; fixed where they fail |
| **the playthrough** | three parts (`M1.md` §4 step 6; the machines cannot play it at speed, since main clamps a frame's dt to 0.05 s): the economy headless for all five Wicks on the node trip harness (`loop-m1-economy.test.mjs`), each purchase's hour beside the sim's; a real-speed browser spine (`loop-m1.scenario.mjs`: a fresh save, the tutorial, each step's content once, the giants and the Matriarch through debug hooks, the last purchase); a person's full playthrough at real speed on a real phone (§16 question 16). M1 is done on the user's yes after playing it |
| **the new cut-scene video** | the 18 s film with line 3 and its sound, rendered as the intro stage's deliverables (desktop and phone mp4s, the storyboards), sent to the user |
| **tests** | every box of `M1.md` §2; the user's yes |

### After M1 (QUEUE jobs 15–16)

**After M1: the aquarium, the Well (L)** (v8.1, §0 row 20, decision 58; `docs/loop/AQUARIUM.md` §13). Written now, built after M1: the Slow Hearth's wet well under a glass hatch, a swimming camera with no Wick, one room per water the barge has moored at, every landed species from the Journal, its fittings and dressings found (each water's four well pieces join its finds table when it ships, and the full pacing run is re-proven then). Its own budget (≤ 120 / 80 / 50 calls by tier, its own small scene) and its own gate (`clarity-perf --well`). Where it sits in the order after M1 is §16 question 23 (default: the first job after M1's polish pass).

In QUEUE's order: job 15, the ramp is the land (`wf_f7bccff9-e78`) and the rest of slice 1c, then slice 1d (the river spike); job 16, Sporewood and onward: slice 1b's, 2's and 3's Sporewood parts and slice 4's fish lane, then slices 5–9. Each moves `LOOP.shipped` forward as its water ships.

### After M1: Slice 1c: First moss (S–M, an art lane beside 1b). The ramp's first steps on the built waters, switched off until the user says yes.

The greening of the built waters 2–4 lands as early as it can: it touches only `world-art.js`, `world-paint.js`, `world-fx.js`, a new `data.js` export and the tools, and runs in its own lane beside slice 1b, so it never blocks or changes slice 1a. **It ships switched off.** Its data lives in a new export, `ZONE_LOOKS` (keyed by zone id), read by `world-art.js` only when the loop flag is on and the `LOOP.lush` switch is set; `ZONES`, the flag-off game and its fingerprint (`tools/tests/v1-exports.json`) stay byte-identical, and DESIGN's ≤ 2% green-teal gate still holds for the flag-off game. `LOOP.lush` turns on only after the user's yes.

| | |
|---|---|
| **the player sees** | with `LOOP.lush` on: Sporewood with its first moss and ferns, Glasswater with moss on the crystal and tree ferns in the arches, the Pallid Deep as the requiem garden (pale moss on bone, ivy on four ribs, cedar spires, moonflowers and glow-moss at night). The Mossmere exactly as today. With it off: everything exactly as today |
| **data** | `ZONE_LOOKS`: `lush` (0, 1/15, 2/15, 3/15), `flora` (which kinds, which variants), the leaf keys (`leafDark / leaf / leafHi / moss2 / bloom / glowMoss`), the new `mossG` layer of `WATERS.md` §6 (the built violet `KIT.moss` stays), `flora.cliffMoss` as data (a hard-coded 0.45 today) · `LOOP.lush` (off) |
| **engine** | **first commit: the Mossmere geometry-hash and program test**, before any builder is touched. Then the flora pass scaffolding: its own seeded random stream, run after every existing builder; the reeds and pads builders generalised for lush > 0 only (the Mossmere's `theme === 'mossmere'` pad and reed branches stay as they are); the flat 8-triangle pad; one fern frond and a simple cedar spire; ivy as hanging strands on the ribs; the night-emitter mesh (glow-moss and moonflowers with a night uniform, +1 call; the shared `glowMat` untouched); `mossG` in `colorRock` and the cliff band; the ring-0 canopy blend in the far rings (0 calls); every new shader term behind a define absent at lush 0; the night lavender share by step (0.25 + 0.035 × step; the Mossmere's formula unchanged) |
| **tools** | `validate-data`: `lush` rises with unlock order, the Mossmere is 0, the air keys stay out of green, the leaf caps and the track · `hue-report`: per-water targets for waters 1–4, the step test, the sky-pixel gate, the water band, no cast, no neon, fixed capture poses, medium as the gating tier and the low-tier order check · `tools/loop-colour-script.py` (its lint and gates) |
| **tests** | the Mossmere byte-identity test (rocks, organics, fine and floater hashes, its shader programs, a frame fingerprint) · the flag-off fingerprint unchanged · each built water's draw calls inside §25.8.8 (+2 / +2 / +3 calls) · green share by day 3 / 5.5 / 8% (±10%, at least ±0.5 points) for waters 2–4, the Mossmere ≤ 1% · **the step test for waters 1→2→3→4** (day 1.5–5 points a step, dusk and night rising) · sign readability (DESIGN c14) on waters 2–4 |
| **the user's approval** | the four built lakes side by side by day, dusk and night, for the user's yes **before any new water is built and before `LOOP.lush` turns on** (if Sporewood or Glasswater reads as "green" rather than "a little moss", the step shrinks and the ramp is re-spaced) |
| **left out** | the full vegetation kit (slice 5), the river layout (slice 1d, then slice 6) |

### After M1: Slice 1d: The river spike (S–M, an engine lane right after 1c). A river you can sail, with no fish.

The riskiest new engine work in the plan is proven first, on a test strip behind its own flag (`GW_RIVER_SPIKE`), long before the river waters are built.

| | |
|---|---|
| **the player sees** (the spike's scenario, shown to the user like 1c) | a raft on a test river: the channel receding up the frame to a bend, the camera following the river, banks with placeholder plants, the current's look (chop with two-phase flow, foam lines, V-wakes), the raft drifting when idle and holding still with a line out, white water with its sneak lane |
| **engine** | `world-layout.js`: layout `river` on `arena.bounds`, one spine, the 1 m field (bank distance, along, across, flow, depth), `shoreDist`, `flowAt`, `sampleWater`, `river.pointAt/sAt` · `world.js`: `collide` along the bank gradient, `getShoreDist`, `getFlow`, `getRiver` · `render.js`: the river camera rule (`BALANCE.cameras.sail.river`) · `water.js` / `water-shader.js`: `GW_RIVER` with two-phase flow, the rectangular depth bake with G from `getShoreDist` · `player.js`: idle drift, the nudge toward slack, the stone (`LOOP.river.holdStates`) |
| **tools** | the validator's spine, lane, flow-into-fence and dock checks; the drift sim on `player.js`'s integrator through a pure shim; the cast sim; a river test strip in `tests/clarity-perf.scenario.mjs` (it writes the river's numbers for slice 5's cost gate) |
| **the user's look** | the spike's frames (landscape and portrait), for a yes on "it reads as a river" before slice 6 builds one |
| **left out** | fish, places, docks, drift meshes, subtypes (gorge, stair, tide, oxbow) |

### After M1: slice 1b's Sporewood half (S). The Sporewood map.

| | |
|---|---|
| **the player can** | Buy the **Sporewood map** (2,000) once the three keys are held (§5.5) and sail to Sporewood's open water; pick a water on the Chart (pan and zoom arrive with the second sheet). |
| **waters and fish** | Sporewood's open-water roster fish on built plans (Netcloud Fry, Threadling Eel, Velvet Ray on the built ray) and the built species the roster keeps there. (Its day and old water open with its map from slice 2's Sporewood half.) |
| **modules** | `data.js` (the Sporewood map and tier; Sporewood's `SPECIES_LOOP`; `LOOP.shipped` to Sporewood) · `progression-loop.js` (`createRun` starts in the water tapped) · `ui-chart.js` (the second sheet; pan and zoom) · the generator's export of sheet 2 |
| **tests** | Sail with the Sporewood map starts in Sporewood · the converter's output equals the sim's species table for Sporewood's fish · nothing of sheet 3 or beyond is drawn |

### After M1: slice 2's Sporewood half (M). The Lullaby, the Gill Harp and the Harpstring Eel.

| | |
|---|---|
| **the player can** | Watch Sporewood's map lift its two banks, the Lullaby (day) and the Gill Harp (old); meet the Harpstring Eel. |
| **modules** | `data.js` (`LOOP.places` for Sporewood's two), the rest as M1 step 3 |
| **tests** | as M1 step 3, for Sporewood's two places and its giant |

### After M1: slice 3's Sporewood fish (M).

| | |
|---|---|
| **the player can** | Catch all of Sporewood's open-water roster fish; see the Velvet Ray as a disc; buy the Moth Popper (with the Sporewood map). |
| **waters and fish** | Sporewood's open water complete: Cindertail Catfish, Downcast Catfish, Falsesmile Barb, Lostsea Mackerel (4 new) |
| **new body plans** | **bream** (11; the perch with depth and jaw: M), **disc** (8; the built ray rounded: M), **tuna** (4; the minnow with finlets: M); the catfish plan checked against its Sporewood fish |

### After M1: slice 4's fish lane (M), ahead of slice 5.

| | |
|---|---|
| **new body plans** | **snakehead** (6; the eel thickened: M), **gar** (4; the pike with a snout: S) |

### After M1: Slice 5: The old kingdom, complete (L). The built lakes' places, T3–T5, three legends.

| | |
|---|---|
| **the player can** | Buy Glasswater and the Pallid Deep (each lifting its day and old water); buy the eight remaining built place maps (Sporewood 3, Glasswater 3, the Pallid Deep 2), T3, T4 and T5, the Spore-Lamp Fly, Mirror Shard and Ferryman's Coin, the Moth Popper and Lantern Lure, and hunt the Drifting Grove, the Glass Sovereign (now a sturgeon) and the Lantern-Swallower. Meet six more giants. The first reach is done. |
| **waters and fish** | Sporewood's places and giants (Harpstring Eel, Festival Puffer, Emberbrood Snakehead); Glasswater's fish (Rosefleck Trout, Duskbar Salmon, Redhome Salmon, Tremor Catfish, Pilgrim Salmon as a trout) and giants (Shardspine Eel, Wolfwake Trout, Prismdrop Sturgeon); the Pallid Deep's (Slipknot Eel) |
| **new body plans** (fish lane, ahead of slice 6) | **cod** (5; M), **flatfish** (2; a new builder: M), **jack** (2; M): the cold rim's fish arrive early now that it is reach II |
| **the vegetation kit** (art lane, M, about 1.5–2 weeks) | the seven archetypes of `WATERS.md` §5 (pads, blades, fronds, bushes, tufts, trees, strands), merged by material into three culled segments, the `GW_SWAY` vertex term and the raft's push, the flora floor tint and leaf translucency in `toonMaterial`, the planting bands, the tier multipliers, `arena.shoreShelf`, the fireflies preset, the theme registry `src/world-themes.js` (the `themeOf` clamp goes). Proven on the built waters first: the Pallid Deep's ivy and cedars move onto the kit with no visible change. Prototypes stamped by matrix copy (no per-piece `prep()`) |
| **the cost gate** (before any slice-6 arena is authored) | a lush-1 test lake and slice 1d's river strip write their measured numbers into DESIGN §25.8.8 and pass: medium ≤ 230 calls and ≤ 320k triangles in all passes, high ≤ 250 calls, software GL on low ≤ 0.6 s a frame at 960×540, and the arena build ≤ 250 ms on desktop and ≤ 900 ms on a phone at lush 1, the river field included. CONTRACT §13's frame target is amended with these numbers |
| **modules** | `data.js` (the re-sited places, validated against `world-layout`) · `world-art.js` (a landmark per place, in the lake's kit) · `fishing.js` (nothing new) · `tools/validate-data.mjs` (every place: open water ≥ 80%, a dock within reach, prices rising within a water, every giant has a place, every roster fish of the slice has a map) · `tools/sim/clams.mjs` (the pacing run on real data: §4.9's targets to the Rushlight Fen map are the gate, with section 6's ladder checks) |
| **tests** | the pacing checks to hour 16 pass on `data.LOOP` · each built water's places exist, lift and fish · the species count per water matches Appendix A · the Lantern-Swallower's first-try chance at T4 equals the sim's 17% |
| **left out** | the later sheets |

### After M1: Slice 6: The cold rim (L+). Waters 5–8: the first green new water, the first river, the sea and the gorge.

Each half ships **consecutive** waters, so the chain of lake maps (§5.1 rule 4) never skips and the pacing checks run on what ships. **`LOOP.chainSkip`**: should a water slip, its sheet stays sealed on Murk's shelf and the next built water's map needs the last built water instead; the sim gains a `--shipped` mode with this slice (the pacing and ladder checks re-run on the waters actually shipped), and that run is the slice's gate.

**6a. The Rime Sound and the Thin Water (L).** The first green new water and the first river, finishing slice 1d's engine.

| | |
|---|---|
| **the player can** | Buy the Rime Sound and the Thin Water, their 4 place maps, two giants' lures and two legend baits, the Long Wall's second wing. Meet 2 giants (Icedoor Flounder, Weirflame) and 2 legends (the Long Winter, the Buried Moon). Sail a river: the Thin Water's sand bars, anchored reed islands and floating meadows, its current, the weir's foam band. |
| **waters and fish** | 2 arenas; 22 roster fish |
| **new body plans** | **shark** (the Long Winter here, 7 in all; a new builder: L), **dogtooth** (1; M); the cod and flatfish came with slice 5's fish lane |
| **arena work** | the Rime Sound on `drop` as a temperate-rainforest fjord (spruce to the tideline, fern ledges, waterfalls; the glacier front, the floe ice and the Lantern Hole at its head; kelp); the Thin Water on the river layout (braided subtype, the weir at the first bend) |
| **the river finish** (M) | drift (small things only; big floating things anchored; pushed off the raft, docks and places; mirrored on high), the docks on the bank rule, casts along the channel and runs clamped by `getShoreDist`, the arrival glide and mist-lift shot up the channel, the camera-side planting band and the culled near-bank canopy mesh, braids, the shore band by half-width |
| **tests** | the step test 4→5→6 (and the Rime Sound's share, sky and night with glow-moss) · on the Thin Water: a cast, a bite and the anchor rule behave exactly as on a lake; no idle raft reaches an end; no line breaks while the raft drifts; a 10-minute soak capture at low and medium (no shear) · the pacing and ladder checks to hour 22 on the shipped waters |

**6b. The Last Light and Pyrefall Gorge (L).**

| | |
|---|---|
| **the player can** | Buy the Last Light and Pyrefall Gorge, their 4 place maps, two giants' lures and two legend baits. Meet 4 giants (Nightsail Lancer, Castaway Pike, Pyregold Carp, the Unfinished) and 2 legends (the Jetsam Shark, the Ashen Guest). Find the Guttering Squid, the Potlid Turtle and the Stone Lodger; lose the Unlit Lance. |
| **waters and fish** | 2 arenas; 17 roster fish (the Lampspot Snakehead met first here) and 4 curiosities (the Guttering Squid, the Unlit Lance, the Potlid Turtle, the Stone Lodger) |
| **new body plans** | **billfish** (2; the tuna with a bill: M); the jack came with slice 5's fish lane; curiosities **squid**, **softshell**, **salamander** (S each) |
| **arena work** | the Last Light on `bowl`, `kind: sea`: the near Lamp Rock island with its turf-and-fern cliff at the spawn, the Drift Line's weed meadow, the far green island; the cliff ring off and **reef breakers** (a ring of foam and rocks) bounding the water in clear air · Pyrefall Gorge on the river layout's `gorge` subtype: swept wall meshes with hanging forest, three rapids each with a sneak lane, pool heads, the temple stairs at the first bend, a falls card beyond |
| **tests** | the step test 6→7→8; the Last Light's share proved on its own frame before its arena is dressed · the pacing and ladder checks to hour 30 · every new water's giant at Prize lands 30–50% and less often than its other fish on T5 · each new water is the best water from the day its map is bought · draw calls per water inside §5.3's cost line · the Gorge: flow into every fence ≤ 0.25 m/s, no place in white water |

Sizes, re-estimated (v7.1): slice 1d is S–M; the river finish in 6a is M; each river arena is M (the Thin Water, the Gorge), each still arena M. Slices 7 and 8 are re-planned on 6a's measured pace before they start.

### After M1: Slice 7: The falls and the gate (L+). Waters 9–12.

| | |
|---|---|
| **the player can** | Buy the Waxen Reef, the Thunder Stair, Rushlight Fen and the Salt Gate, their 10 place maps (two fifths: the Drowned Spire, the Turning Tide), **T6** (with the Thunder Stair), Tallow Soap, four giants' lures and legend baits, the third wing. Meet 9 giants and 4 legends (the Waxen Abbot, the Last Lock, the Long Thunder, the Old Shipwright). Find the Paper-Lantern Jelly and the Mudlark Crab. Watch the Salt Gate's tide turn as night falls. |
| **waters and fish** | 4 arenas (two rivers); 39 roster fish and 2 curiosities |
| **new body plans** | **sawfish** (1; the shark with a saw: M) |
| **river work** | the Thunder Stair: a stepped gorge (step pools joined by sailable chute foam bands, the Cauldron's eddy, the 10 m Throat as scenery past the sailing water, a falls card, the moonbow at night); the Salt Gate: the `tidal` subtype (the flow a pure function of the evening clock; no geometry moves: the mudflat mesh sinks and the shader's shore line moves; the sluice's sneak lane) |
| **arena work** | the Waxen Reef on `twoBasins` with its green keys and seagrass; Rushlight Fen on `twoBasins` as a papyrus delta with palm islands, the dam and its pool |
| **modules** | as slice 6, plus `survival.js` / the evening clock feeding the tide |
| **tests** | the pacing and ladder checks to hour 41 · T6 on the shelf with the Thunder Stair · the tide: slack within 5 s of nightfall, docks always reachable, no place leaves slack water at any tide, the drift sim on both tides · the step test for waters 8→12 |
| **left out** | reach IV |

### After M1: Slice 8: The green heart (L+). Waters 13–16.

| | |
|---|---|
| **the player can** | Buy Lampmoss Slough, the Siltway, Lanternroot Lagoon and the Inkwood, their 10 place maps (two fifths: the Monsoon Cut, the Overhang), Windfall Plum, four giants' lures and legend baits, the fourth wing. Meet 10 giants and 4 legends (the Last Sentry, the Barge-Shadow, the Silver Regent, the Banked Fire). Find Little Logjaw; glimpse the Long Coil; find a Gill Lodger in a big Siltway catfish. Finish the shelf at about hour 48. |
| **waters and fish** | 4 arenas (two rivers); 45 roster fish, 2 curiosities, the Long Coil's sighting and the Gill Lodger |
| **new body plans** | none: every plan is in, so the fish lane polishes and the art lane carries the densest foliage |
| **river work** | the Siltway: a `meander` with the Seam (two waters side by side, unmixed), anchored floating meadows and giant lilies, a low far bank and mist so 36–40 m of water reads as wide; the Inkwood: the `oxbow` subtype with two blind creeks at least 11 m wide to ponds of at least 16 m, a little fall at Rootgate Creek, closed canopy with gaps and moon coins (≥ 6% sky) and fireflies at night |
| **arena work** | Lampmoss Slough on `bowl` with its canal strip, living swamp trees and moss curtains; Lanternroot Lagoon on `ringTrench` as a mangrove forest with synchronous fireflies |
| **modules** | as slice 6, plus `ui-loop.js` (the Gill Lodger's second card) |
| **tests** | the full pacing run passes on `data.LOOP` (every check of §4.9 and sim section 6) · `roster-check.mjs` and the sim's "every roster fish has a map" pass on the shipped data · the Gill Lodger shows on about 1 in 8 Prize+ Siltway catfish and never bites on its own · the step test for waters 12→16 (night ≥ 25% of day, the night emitters never fewer) · the lush-1 frame inside slice 5's measured budget on medium phones and software GL |
| **left out** | the later sheets |

### After M1: Slice 9: The long tail (each item ships alone, S–M).

~~The four other Wicks (§10.1)~~ (moved to slice 1a by the user's ruling of 14 November 2026) · the Old Ledger's double (`ledgerPaid`) and its ledger glyph · one twist per place (the built §25.8 ideas) · the later sheets (seven places, five built species) · weather as "tonight's water" on the Chart · the ink-print beat in the catch show.

**If the swarm comes back.** It returns as a choice on the Chart ("a quiet evening" or "a Gloomtide evening") by clearing `PARKED.swarm`, `.combat`, `.levels` and `.embers`. Nothing in this spec has to move.

**What each step and slice brings** (roster fish that can bite at the end of it; giants include legends):

| step or slice | waters | roster fish | giants | new plans | lushness |
|---|---|---|---|---|---|
| M1 step 1 (slice 1a) | the Mossmere's open water (built species) | 0 | 0 | — | — |
| M1 step 2 (1b's Mossmere half) | the Mossmere's open water | 8 | 0 | — | — |
| M1 step 3 (2's Mossmere half) | + the Mossmere's four places | 12 | 3 | lamprey, sturgeon, trout | — |
| M1 step 4 (3 without Sporewood's fish) | — (the Gloam Eel bites) | 13 | 3 | catfish | — |
| M1 step 5 (the home barge, then 4) | + the home barge at the Jetty | 13 | 3 | — | — |
| M1 step 6 (polish) | — | 13 | 3 | — | — |
| after M1: 1b's Sporewood half | + Sporewood's open water | 16 | 3 | — | — |
| after M1: 1c | (art lane) | — | — | — | the built waters 2–4 at steps 1–3, switched off until the user's yes; the Mossmere unchanged |
| after M1: 1d | (engine lane) | — | — | — | the river spike: a test strip, no fish |
| after M1: 2's Sporewood half | + Sporewood's day and old water | 17 | 4 | — | — |
| after M1: 3's Sporewood fish | Sporewood's open water complete | 21 | 4 | bream, disc, tuna | — |
| after M1: 4's fish lane | — | 21 | 4 | snakehead, gar | — |
| 5 | reach I complete | 41 | 12 | cod, flatfish, jack (fish lane, ahead) | the vegetation kit |
| 6 | reach II, the cold rim (6a: waters 5–6; 6b: 7–8) | 80 | 22 | shark, billfish, dogtooth (+ squid, softshell, salamander) | steps 4–7; the first river finished, then the gorge |
| 7 | reach III, the falls and the gate | 119 | 35 | sawfish | steps 8–11; the stair and the tide |
| 8 | reach IV, the green heart | 165 entries, all 164 fish | 49 | — | steps 12–15; the oxbow and creeks |

---

## 14. Risks, and the knobs

| # | risk | guard, and the knob |
|---|---|---|
| 1 | **Slice 1a changes how the built game works** (measure, the card, `createRun`, the loadout, the clock) and is the riskiest slice, not the art. | Split from the roster's species (1b); the node trip harness before any UI; the v3 scenarios in every gate; the boot rule for a loop save opened with the flag off. |
| 2 | **Quiet water feels like being told to stop.** | It never stops the fishing; the dots make it readable; the first quiet water is taught by Murk as advice; a fish let go lights its dot again. Knobs: `LOOP.water.good` (per kind), `openExtra`, `stale.favour`, `letGo`. The sim's anti-grind and choosy checks say how far each can move. |
| 3 | **Twelve new arenas are the largest art cost in the plan** (slices 6–8), and six of them are rivers on a new layout. | Each still is a built layout, kit pieces and new landmark kinds; each river is the river layout plus its subtype; places ship as data with mist first. The river engine is proven first, on a test strip, in slice 1d; each half of slice 6 ships consecutive waters (6a the Rime Sound and the Thin Water, 6b the Last Light and the Gorge), so the chain of lake maps never skips; should a water slip, `LOOP.chainSkip` seals its sheet and the next built water's map needs the last built water, and the sim's `--shipped` run gates the slice. The body plans start in slice 5's fish lane. If a reach slips, the shelf ends at the last shipped water and the giants' page shows the rest as outlines. (Question 1, §16.) |
| 4 | **Late numbers are large** (a Trophy giant of the Inkwood sells for about 196,000 on average and 218,000 at most, an Elder Emberbelly about 548,000; its lake map costs 983,500). | "12.4k" and "1.2m" on screen; the tally counts up. Knob: the value tiers are a single table set by the two ladder rules; lowering the open-water rule from 1.05 to 1.0 makes the late numbers about 30% smaller (the last tier about 1,200). (The user said yes: question 3, §16.) |
| 5 | **The visit home is longer than the sim's 44 s.** A slower home makes bigger holds and choosy play worth more per minute, and every pacing number moves. | Slice 1a measures it and writes it into `LOOP.time`; the sim is re-run before slice 2. |
| 6 | **Fourteen new body plans** (and four for curiosities) before the roster is whole. | Rule 2 of §13: a fish bites only once its plan exists, so no slice waits for all of them. Order by fish served: catfish, bream, disc, snakehead, shark. |
| 7 | **Elders and giants are too hard without the parked relic and Boon Hold.** | The sim lands the first giant at about hour 1.4 and about 70 by the end. Knob: `LOOP.craft` (0–3 extra Hold on every fish), off at first; `LOOP.giant.fight` (10). |
| 8 | **The numbers rest on a model** (±10%, §4.9). | Slice 1a moves the tables into data and the sim reads them; slices 5–8 re-prove the pacing and the ladder on the real game, reach by reach. |
| 9 | **Lush waters are slow on phones and on the shared software-GL capture machines** (up to about 1,000+ plant instances, a heavier mirror, canopy shadows). | Merged segments with culling, no alpha test, solid near fronds, reeds unmirrored first, the canopy outline off on medium, tier multipliers (low 0.4×), cells drawn near to far, and §5.3's cost line **measured in slice 5 with pass/fail thresholds** (medium ≤ 230 calls and ≤ 320k triangles in all passes, software GL on low ≤ 0.6 s at 960×540) before any slice-6 arena is authored. Knobs: the archetypes' full counts, `flora.low`'s share, the canopy in the mirror, the firefly count. The software-GL cost on high is not measured yet; captures run at low and medium and only when the machines are free. |
| 10 | **A green cast, neon, or the user's "far too many green hues" coming back.** | Green lives only on things: the air, sky, light, grade and UI keys are banned from green by `validate-data` on every water; `hue-report` fails a frame whose sky, water and stone drift green, whose water is more than 0.6× as green as its banks, whose sky pixels are green, or with neon or teal (`WATERS.md` §7); the colour script proves the targets meet every gate at once. The Mossmere and the Landing keep today's ≤ 1% gate. |
| 11 | **The first step is too big**: Sporewood or Glasswater reads as "green", not "a little moss". | Slice 1c shows the four built lakes side by side for the user's yes before any new water is built. Knob: the share targets of waters 2–4 (3 / 6 / 8%) and the step size; the ramp can be re-spaced without moving any water. |
| 12 | **Moving water breaks the fishing feel or reads as a soft fail** (the float drifts, the raft creeps or is pushed into a bank or a fence, a line breaks, a fish runs into the bank). | Every place, dock and pool is slack water; white water always leaves a sneak lane or carries the raft through, and the water above a fence is slack; the raft holds still from the cast to the card; the idle nudge points to slack water; lanes are capped at 1.2 m/s; banks push softly; the ends are dead water; casts aim along the channel and runs are clamped off the banks; the validator, the drift sim (on the real integrator) and the cast sim (§5.3). Knob: the lane cap and the idle drift share (0.5). If the current should matter in play, it becomes a place rule (the built "drift" rule), never a stronger push. |
| 13 | **The Salt Gate's tide adds state** (docks, mist banks and the crown's footprint could clip). | The flow is a pure function of the evening clock; **no geometry moves** (the mudflat mesh sinks and the shader's shore line moves); the tests check every place stays slack at every tide and the drift sim runs on both. |
| 14 | **Pyrefall Gorge's open water is thin** (two commons), so choosy play earned 81–83% there in v7, at slot 6 and at slot 8 alike. | Fixed in the water (v7.1): the Lampspot Snakehead bites in its open water and hunts the Coin Run and the Boulder Garden, and the Gorge's Fight is 30; choosy play earns 87% (sim section 2b, which now checks every new water). It is still the thinnest margin in the run. Knobs: the Lampspot's draw (×2.5), the Gorge's Fight term, or a plain bait override (Shimmerfly). |
| 15 | **Big legends now come early**: the two largest legends (the Long Winter, 560 cm, landed at about hour 21; the Jetsam Shark, 480 cm, about hour 26) come in the cold rim, and the last legend (the Banked Fire, 325 cm) is not the biggest. | **Put to the user** (§16 question 6), with the other way beside it. Until they answer: a legend's value follows its slot, so the climax is the dearest, not the longest, and the last crown leads with spectacle (the Breathing Mere's sigh in the green hall). |
| 16 | **Name leaks**: an episode, the series or its presenter slipping into a place name, lure, bait, Murk line or code (v7.2: real river and lake names may ship, §0 row 17). | Episode titles and the research fields live only in `docs/` (`echoes`, `inspiredBy`, `refWeight`, `WATERS.md`'s "modelled on" column); slice 1b's allow-list and `validate-data`'s forbidden-name rule cover `src/`; reviewers check every new name. |
| 17 | **The first new map is close in price to the last old one.** The Rime Sound's lake map (29,700) is 1.14× the Pallid Deep's and less than one T5 slot (32,000), because the Rime Sound's own income is modest (its tier 45). | Every other price at slot 5 is floored above slot 4's (1.05×), and the player meets the map while buying T5, so it reads as the next goal, not a bargain. Knob: a floor on the lake map too (1.2× the slot before), which moves the pacing by minutes. |
| 18 | **The river engine is the largest new system** (the field, the camera rule, the shader, collide, the depth bake, drift, the validator and its sims, every polar consumer). | Proven first in slice 1d on a test strip (S–M), finished in 6a (M), each river arena then M; slices 7–8 re-planned on 6a's measured pace. |
| 19 | **The five passives drift apart, or one Wick is plainly best** (Tallow's late holds and 6-minute trips; Taper strong in 1a; Ashwick and the Wick front-loaded) | `WICKS.md` §3's checks per Wick, §6.3's risks and §3.3's knobs in order; Tallow's cap fallback (its hold stops at 8). |
| 20 | **M1 ends flat, slips, or its Chart costs too much** | `docs/loop/M1.md` §7 (fourteen risks with their guards); decision 38's column is the size knob, never a price |
| 21 | **The home barge reads as a box, or costs too much on every water** (it stays moored, lit, through the evening) | one merged mesh per material, emissive windows and no PointLight; ≤ 6 main-pass calls with every M1 home object, measured by `clarity-perf --home` in step 5; the user's look at first light and at night. Knobs: the upgrade objects merged into the hull at low tier, the barge drawn without its mirror pass beyond 40 m |
| 22 | **The tow reads as a loading screen, or as a chore** | it plays once per water, never on a return; it has the leg's own sounds and the new sheet's reveal; the leg ≤ 6 s, the dip 0.6 s and the glide in 3 s, each ended by a tap, so ≤ 10 s. Knobs: the leg's 4 s base and its 0.5 s a crossing, the glide in's 3 s, the leg sounds |
| 23 | **"A kept lamp remembers the way" stretches the world's one rule about magic** | it is the same wonder the Waystones had, moved, and the only one in how home travels (`LORE.md` §2.13); the Chart always shows the real road |
| 24 | **A luck wall** (v8): the last listed fish of a water will not come, and a player is stuck. | The pull, with its sure bite from the ninth evening (§5.5 (d)); the silhouettes' place and hour glyphs; sim section 7 checks p95 ≤ 60 min, p99 ≤ 75 min and the share still open at the next map (< 5%). Knobs: `LOOP.access.pull` (`perEvening` 1, `cap` 6, `floorFrom` 1, `sureFrom` 8). The sure bite carries the limit. Sporewood's list, the slowest, p95 / p99 on its arrival kit (T1, hold 5), 2,000 players: **53 / 61 min** as built (§5.5 (d)); in a scratch copy of the committed sim with only `LOOP.access.pull` changed (the same kit, players and seed), without the sure bite 132 / 177; at half strength as well (0.5 an evening, cap ×4) 187 / 253; at half strength with the sure bite 54 / 62. |
| 25 | **Some listed fish are near-unreachable on the plain natural route** (v8): before decision 21's fix the Candlewake Sturgeon came on 0% of trips (6.7% with it); day-water day fish (the Snufferjaw 0.4%, the Starbar Lancer and the Grey Latchfin 1.8%) still do. A player who ignores the Journal may feel stuck. | Decision 21 widened (the late-route fix) and the Journal route (§3.4); the hour and place glyphs on each silhouette; the sure bite where a missing fish can bite. The sim prints the plain natural route as a contrast row. |
| 26 | **"I bought it, why can't I go?"** (v8). Two moments (the ink-in and the opening) could read as a double sell. | The three seals are in sight before the map is bought; the sealed sheet has a misted route and no **Sail**; Murk's one line teaches it once. The alternative (the map not sold until the gear and the list are held) is §16 question 8. |
| 27 | **Lists grow under the player** (v8): the Mossmere's is 6 in 1a, 11 at M1 step 2, 12 from M1 step 3; a complete seal turning back to 6/11 could read as lost progress. | Opening is stored and permanent (`meta.loop.opened`); new fish arrive as visible new silhouettes; the count shows only on the frontier water. |
| 28 | **Many gear keys are already owned** (v8): the gated pacing run owns every one before it buys the map, 12 of them hours before, and reach IV's keys (Lantern I, Keel II, Lantern II, Hold 8) from hour 10.3. | An honest decoration for most players, a real gate for one who skipped that piece. Put to the user (§16 question 10) with the alternatives: a river anchor for the first river, real late gear for reach IV. |
| 29 | **The continent world-map Chart** (another job) may squeeze the seals into clutter on a phone. | The seals are one row of three glyphs and one count, at least 44 px each at 390 px wide; only the frontier water shows them. |
| 30 | **The Rime Sound has lost its calibration margin** (v8): decision 21's late-route fix made the Pallid Deep pay more fully mapped, so the Rime Sound pays 1.204× it against the rule's 1.2 (0.4 points, not the 2 that `--calibrate` aims for). A small change elsewhere could fail section 6's ladder check. | Watch it at every sim run; the figures stand for now. Knob: the Rime Sound's value tier, raised by `--calibrate` (a tier is not a price; re-check the pacing). |
| 31 | **Finds shorten the road, or crowd fishing out of the evening** (a jackpot early, a snag too often) | 1 bite in 20, never on the first evening or a legend's cast, always optional; the sim's gates (§4.10: M1 within ±10%, the full run within ±5%, finds ≤ 10% of clams). Knobs: `LOOP.finds.snag.perBite`, the jackpot's share, the grades' multipliers |
| 32 | **The aquarium costs too much on phones, or reads as a second hold** | its own small scene with the lake not drawn, three tiers (low ≤ 50 calls, 8 fish), measured by `clarity-perf --well`; it draws only from the Journal, so no fish is placed, kept or taken (`AQUARIUM.md` §10, §14) |

---

## 15. Where the proposals disagreed

v4's rulings on the three proposals stand, the roster brought new ones, and v6 revised four (§0.1).

| question | economy | maps | trip and home (its sims) | decided | why |
|---|---|---|---|---|---|
| fish values | steep: e^(0.9·z), no normaliser | today's flat values | a placeholder ladder | **steep, and now tier × rarity × body** | "big and rare fish"; the roster's rarities and sizes |
| what quiets water | every bite; 4 good bites everywhere | each landed fish; about 3 per place | — | **every bite but a let go; open water one per slot plus one, 2 day, 3 old, 2 night, 2 crown** (v6) | counting catches leaves free re-rolls; with 4 everywhere choosy play beats natural play per trip |
| the clock | a trip is day or night at random | "wait for dusk" at the table | a trip starts before dusk | **every trip is an evening; night holds** | no skip button, the best light every trip |
| the catalogue | 3 charts + 26 place maps | 3 lake maps + 16 place maps | — | **15 lake maps + 40 place maps; a lake map opens its day and old water** (v6; v5: 15 + 70; v4: 3 + 16) | the roster's 16 waters; one pattern of four places, a fifth where a giant needs one |
| price scale | Sporewood 1,000 · Glasswater 7,000 · Pallid 28,000 | 400 · 1,200 · 2,800 | — | **2,000 · 10,200 · 26,000, then 29,700 … 983,500** (v6: lake maps that open three places; v7 and v7.1: re-derived for the new order) | re-fitted to this sim; no wait above 90 min |
| a lake needs a place of the lake before | — | yes, one | — | **no**; clams are the only key to buying, and since v8 sailing to a new water needs three keys (its map, its gear, the list of the water before) | one currency; the user's rule of 14 November 2026 for access |
| the hold | 3 → 10 | 3 → 7 | 3, 4, 5, 8 tried | **3 → 8** (Tallow: 4 → 9) | trips stay under 6 minutes, the visit home included (`WICKS.md` check 1 holds Tallow's to ≤ 6 min) |
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

v4's five questions were answered on 13 November 2026 ("Yes to all five loop rules") and are decisions now. **v6's four questions below were answered by the user on 14 November 2026: "Yes to all four defaults and the let-go rule."** They are decisions now (§0 row 8).

1. ~~Should each of the twelve new waters be a full 3D lake of its own?~~ **Answered: yes, all twelve are full 3D waters** (v7: six of them rivers, on the river layout).
2. ~~Is about 48 hours to buy everything the right length?~~ **Answered: yes.** The pacing run ends at 47.6 h (v8, gated; 48.9 h in v7.1, §4.9).
3. ~~May late fish sell for hundreds of thousands of clams, shown with "k" and "m"?~~ **Answered: yes.** v7.1: a Trophy giant of the Inkwood about 196k (218k at most), an Elder Emberbelly about 548k; the last lake map 984k.
4. ~~Should a lake map open its day water and old water at once?~~ **Answered: yes, two mist banks lift on the first evening.**
5. (v6's let-go rule) ~~A fish let go returns its good bite and adds +0.2 favour there, up to +0.4?~~ **Answered: yes.**

**v7.2.** The user answered `WICKS.md`'s five questions on 15 November 2026 ("Default for all except 4 which i want yes", §0 row 12) and said yes to the map as the Chart and to M1 (§0 rows 13–14); they are decisions now. PLAN §7.1's question about the Jetty as home is answered by M1 (v7.3: the home barge moors at the Jetty from step 5); its other user questions stay open on their defaults (no line under the logotype; the Wick fixed until a start-over). Questions 8–12 are kept for the three keys (v8). M1 asks two (13–14, below; `docs/loop/M1.md` §8).

**v7 raises two smaller questions** (the build goes ahead on the defaults):

6. **Is the new order right, given what it costs?** v7 put the cold, salt waters early and the rainforest waters late, so the greenest waters come last and every giant keeps its home. **The trade, plainly: the new order brings the two largest legends (the Long Winter, 560 cm, and the Jetsam Shark, 480 cm) to hours 21–26, and the last legend, the Banked Fire (325 cm), is smaller than both.** The climax is the dearest legend, not the biggest. The other ways: (a) **v6's order, every water re-themed lush where it stands**: a temperate-rainforest fjord at slot 16 (moss-hung spruce, waterfalls, its ice only at the head, round the Lantern Hole and the Long Winter) and the Jetsam Shark's swell beside a high green island at 15, the fen, the slough and the Inkwood early and less green than now; the biggest legends come last, but the late steps are the hardest to make lush; (b) **the new order with the legends' sizes swapped in the roster** (not proposed: the roster's giants follow their episodes). **Default: the new order** (v7.1 makes the Rime Sound a rainforest fjord and gives the Last Light its green island, so both are real steps up).
7. **Is the first step small enough?** Slice 1c shows the four built lakes side by side (day, dusk, night) with their first moss before any new water is built, and the repaint stays switched off until the user says yes. **Default: the steps of `WATERS.md` §1 (green share by day 3, 5.5 and 8% for waters 2–4), shrunk if the user says it reads as green.**

**v8 raised five questions about the three keys** (§5.5). **The user, 14 November 2026: "Yes to all those defaults"**, the defaults being: giants and legends are not on the catch list; a fish let go still counts; a mercy rule (uncaught species bite more the longer you fish there, and their hours still apply); places inside a water keep clams as their only key; three small seals on the Chart; at most two Murk lines. That answers questions 9, 11 and 12 and confirms the pull (decision 35) and §5.5 (f)'s seals. **The Murk lines are answered too: at most two about the keys.** v8 had written two and v7.2 (`M1.md` §2.5) a third; the spec keeps the two that do the most (§8.6): "One of every fish here first. And the right gear." (the one that names the keys, said at the shelf when a lake map is bought while a key is missing) and "Every fish in this water. I'll write that down." (when a water's catch list completes, M1's ending beat). v8's "The way's clear. Go and look." is dropped: the opening beat shows it without a word. Questions 8 and 10 were not among the defaults, so theirs stand as the lead's:

8. **Do the keys stop you sailing, or stop you buying the map?** *(the lead's default; still the user's to overrule)* **Default: sailing.** Murk always sells the next lake map for clams; buying it inks the new water on the Chart (the discovery), and you sail there once you also hold its gear and have landed the list of the water you are in. The other way: the map is not sold until the gear and the list are held (simpler to read, but a purchase would then wait on luck, which the loop has ruled out so far).
9. ~~Which fish count as "one of each fish species in the current area"?~~ **Answered: yes to the default** (giants and legends are not on the list). **The water's ordinary fish**: those of its open water and of the day and old water its map opens, 4 to 12 a water (§5.5 (c)). **The giants and the legend never count**: they stay the dream, never a gate. Nor do the fish of places you buy later (night water, crown, fifth place), nor a fish that bites only on a tin other than the water's plain bait (the Gloam Eel, the Sleepspore Jelly, the Chime Jelly), so no purchase and no tin is a hidden key. The other ways: also count the place fish once their map is owned; or count every non-giant fish of the water (longer, and it would make buying the night water part of the gate).
10. **Is the gear table right?** *(the lead's default; still the user's to overrule)* **Default: §5.5 (b)**: the Ashwood rod for Sporewood, the Glassreed for Glasswater, the Lantern-Spine for the Pallid Deep, the cold-water reel for the fjord, the second oars for the first river, the brass-shod keel for the open sea, line and rod for the gorge and the reef, the crown rod for the falls, then line, reel, lanterns, keel and the biggest hold; **no new item**, and T6 moves onto the shelf one map earlier. The honest catch: most of these are bought long before their map anyway, so their seal is lit the moment it appears; the green heart's four (Lantern I, Keel II, Lantern II, Hold 8) are on every raft by about hour 10 (sim: no water waits on its gear). The other ways: (a) a new **river anchor** (about 4,500 clams) as the first river's key, and the Reed Sail look (re-priced to 30,000) as the open sea's, which a designer estimated at about ±15 min on the long game; (b) **real new top gear** for the last four waters, which adds purchases and lengthens the 48 hours.
11. ~~Do places inside a water need anything but clams?~~ **Answered: no; clams are their only key.** The three keys are for reaching a new water; a place map needs only clams and its water open. The other way: each place asks for its own fish or gear (more seals on the Chart, and more clutter).
12. ~~What counts as "caught"?~~ **Answered: yes to the default.** **Landed at least once, kept or let go** (the Journal entry is written at the measure, so letting a fish go is never a lost tick), and **catches from before the loop count** (the Journal is shared), including those on pages the loop hides until their water ships (`M1.md` §2.11). A fish that got away before it landed does not count. A fish of two waters (the Lampspot Snakehead) counts for both once landed in either.

**v7.2 raises five** (M1 builds the defaults; 15–17 from M1's revision 2):

13. **Is about 2.5–3 hours the right size for "the Mossmere and the home barge, complete"?** M1's shelf ends with the hold at 6 (Tallow 7), tackle T2, the raft's and the home's first two levels, the Long Wall's first wing and the first three looks; the bigger hold steps, Keel III, the third Order Board and Bait Bed, the brighter Barge lights and the dearer looks come with the later waters where the full game buys them (decision 38). **Default: yes, as planned.** The other way: bring Hold 7 and Keel III into M1 (about +45 minutes on the Mossmere).
14. **The Mossmere's harbour re-dress** (DESIGN W9: buoy-lanterns in place of the street lamp-posts, a leaning toll-tower, a water-curtain down the east cliff) changes the look the user approved, to take out the last of the "drowned high street". Under the Span's arch spans and deck are now that place's own dressing and ship with it. **Asked before M1 step 3. Default: the arches ship with Under the Span; the rest is built behind `LOOP.redress` and shown side by side; on only after the user's yes.**
15. **The Mossmere's second edition** (`M1.md` §8 question 3): three later-sheet places (the Cupped Hands, the Gatehouse Door, the Sluice Run) and the Cupbearer, Moonfall, the place twists, weather, the Old Ledger's double and the ink-print beat wait for after M1. **Default: they wait, as the re-cut said; the catch list is frozen at the first edition; the Bell Pool shows its bell without Moonfall.** The other way: Moonfall at the Bell Pool in step 3 (about +1–2 weeks).
16. **Who plays the full playthrough at real speed on a real phone?** **Default: the user, on the preview at the end of step 6, with a short notes list; M1 is done on the user's yes.**
17. **Fishing at home?** **Default: no cast from the barge under the loop** (the Quayling stays the v3 build's). The other way: the Quayling as a let-go-only home fish off the barge's stern (about +3–5 days).

**v7.3 raises two** (the user's words of 15 November 2026, §0 row 18; M1 builds the defaults):

18. **The Landing in the opening: on the Chart, or in 3D?** The game starts at the Landing, where the Wick wakes by Murk's banked fire aboard the old barge-house and tows it out. **Default: drawn on the Chart** (one ink dip from the film to the Landing's vignette in the Chart's hand, Murk's wake line there, then the first tow, its leg up the Sluice Run on the Chart and its glide in to the Jetty in the Mossmere's own scene: about 9 s, no new 3D place). The other way: the Landing in 3D, the parked cove built for one minute of the opening (the wake by the stove, the barge-house in the cove, the tow out under the arch), about +1–2 weeks.
19. **The barge's name.** **Default: the Slow Hearth** (in the world's plain style, for what it carries; painted on its stern, and on screen nowhere else: home is still **Home**). Any name the user prefers costs nothing.

**v8.1 raises four** (the user's words of 15 November 2026, §0 rows 19–20; the build goes ahead on the defaults):

20. **How rare, and how huge, is "huge value"?** **Default: each water's jackpot comes home about 1 trip in 170–250 at that water and sells for about twice its giant Trophy** (the Mossmere's Toll-Keeper's Purse, 1,750, against a Trophy Thousandcast Pike's 944; the Inkwood's about 419k); a rare treasure about 1 trip in 70, like a giant Prize; most finds are small (a spoon for 14). About 1 player in 6 finds the Mossmere's jackpot in M1, and two or three jackpots come home over the whole road (*est.*, the sim confirms). The other way: about twice as often at half the price (the same clams on average, less of a dream), or rarer and bigger.
21. **Should barge parts do something, or only look and sound like home?** **Default: look and life only** (a bell that rings you home, warmer windows, a bollard the raft ties to), so the shelf and the 48-hour pacing do not move; after M1 the aquarium's fittings are where finds grow a world. The other way: some parts do a small thing with a number (one more free tin from the Bait Bed, one more order on the board), with a sim re-tune of the shelf (about +2–3 days).
22. **The aquarium's fish: every species you have landed, or one you keep back?** **Default: every species you have landed (kept or let go) swims there, drawn from the Journal at your best print's size**, so no sale is ever given up. The other way: you choose one fish of each species at its card to keep back from Murk and place in the Well (a sale given up for each, a placing screen and its words, about +1 week).
23. **When is the aquarium built?** **Default: the first job after M1's polish pass** (it grows the home barge M1 finishes, and the Mossmere's room and fish are enough to open it; each later water adds its room as the barge first moors there). The other way: after Sporewood or later, once more waters' rooms can open with it.

---

## Appendix A. Every fish: where it bites and what it sells for

Clams at each class's typical size (`BALANCE_V3.size.simZ`). ★ a rare giant. **list** (v8, §5.5 (c)): ✓ the fish is on its water's list (the next water's catch key); "tin" a bait-only fish that needs a tin other than its water's plain bait (off the list); — off the list (a giant, a legend, or a fish of a place you buy later). The heading gives the list's count; the sim's `--fish` prints the column once section 7 is in. "(built)": a built species the roster keeps beside its fish. "night water" and the like: any place of that kind in its water. A giant has no Small; an Elder price shows only where the fish can reach Elder (old water, open water through old water, or a giant at its own place). A legend shows what her first landing pays. Printed by `node tools/sim/clams.mjs --fish`.

**1. The Mossmere** (value tier 7 · its list: 12)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Belled Matriarch | legendary | day, dusk | The Bell Pool | — | — | — | — | — | pays 500 |
| ★ Hullkiss Lamprey | epic | night | The Buoy Lights | — | — | 150 | 370 | 950 | 2,388 |
| ★ Thousandcast Pike | epic | dusk | Under the Span | — | — | 150 | 368 | 944 | 2,374 |
| Bridgechain Sturgeon (built) | rare | any | Under the Span | — | 23 | 69 | 169 | 435 | 1,093 |
| Gloam Eel | rare | night | night water | — | 21 | 61 | 149 | 383 | — |
| Reedjaw Pike | rare | any | open water | ✓ | 22 | 64 | 158 | 406 | 1,022 |
| Candlefin Koi (built) | uncommon | day, dusk | open water | ✓ | 8 | 24 | 60 | 154 | 387 |
| Kissmark Trout | uncommon | any | open water | ✓ | 10 | 29 | 72 | 184 | 462 |
| Milkeye Perch | uncommon | dusk, night | open water | ✓ | 9 | 26 | 64 | 164 | 413 |
| Weeping Carp | uncommon | any | open water | ✓ | 9 | 26 | 64 | 164 | 413 |
| Dusk Minnow | common | any | open water | ✓ | 2 | 7 | 17 | 43 | 109 |
| Gutter Crayfish (built) | common | any | open water | ✓ | 2 | 7 | 16 | 41 | 104 |
| Lampsipper (built) | common | night | open water | ✓ | 3 | 8 | 19 | 48 | 121 |
| Likely Chub | common | day, dusk | open water | ✓ | 3 | 9 | 23 | 58 | 146 |
| Mossback Perch | common | any | open water | ✓ | 3 | 8 | 20 | 50 | 126 |
| Overbold Bass | common | day, dusk | open water | ✓ | 3 | 9 | 21 | 54 | 135 |
| Rustfin Sucker | common | any | open water | ✓ | 3 | 9 | 23 | 58 | 146 |


**2. Sporewood Pools** (value tier 11 · its list: 11)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Drifting Grove | legendary | day, dusk | The Mother's Cup | — | — | — | — | — | pays 2,200 |
| ★ Emberbrood Snakehead | epic | day, dusk | The Puffball Vent | — | — | 233 | 573 | 1,472 | 3,701 |
| ★ Festival Puffer | epic | night | The Veilwater | — | — | 190 | 468 | 1,202 | 3,021 |
| ★ Harpstring Eel | epic | any, best at night | The Gill Harp | — | — | 252 | 619 | 1,590 | 3,998 |
| Downcast Catfish | rare | day, dusk | open water | ✓ | 39 | 114 | 280 | 719 | 1,807 |
| Hushcap Koi (built) | rare | night | The Veilwater | — | 31 | 91 | 225 | 577 | — |
| Lostsea Mackerel | rare | day, dusk | open water | ✓ | 39 | 114 | 280 | 719 | 1,807 |
| Mildew Angler (built) | rare | night | open water | ✓ | 34 | 100 | 246 | 632 | 1,590 |
| Nightbloom Carp | rare | night | night water | — | 38 | 111 | 272 | 700 | — |
| Sleepspore Jelly (built) | rare | day, dusk | open water | tin | 25 | 74 | 183 | 469 | 1,179 |
| Cindertail Catfish | uncommon | any | open water | ✓ | 14 | 43 | 105 | 269 | 676 |
| Threadling Eel | uncommon | any | open water | ✓ | 16 | 46 | 112 | 289 | 726 |
| Velvet Ray | uncommon | any | open water | ✓ | 13 | 39 | 96 | 247 | 622 |
| Capshell Crayfish (built) | common | any | open water | ✓ | 4 | 12 | 28 | 73 | 183 |
| Falsesmile Barb | common | day, dusk | open water | ✓ | 4 | 11 | 27 | 68 | 172 |
| Netcloud Fry | common | any | open water | ✓ | 3 | 9 | 23 | 60 | 150 |
| Plumgill Perch (built) | common | any | open water | ✓ | 5 | 15 | 37 | 94 | 236 |
| Sporebelly Puffer (built) | common | any | open water | ✓ | 4 | 12 | 29 | 74 | 187 |


**3. Glasswater Vault** (value tier 16 · its list: 12)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Glass Sovereign | legendary | night | The Fallen Chandelier | — | — | — | — | — | pays 7,500 |
| ★ Prismdrop Sturgeon | epic | any | The Well of Ledgers | — | — | 415 | 1,021 | 2,622 | 6,592 |
| ★ Shardspine Eel | epic | dusk, night | The Mirror Nave | — | — | 357 | 879 | 2,258 | 5,675 |
| ★ Wolfwake Trout | epic | dusk, night | The Broken Hymnal | — | — | 366 | 901 | 2,313 | 5,816 |
| Pilgrim Salmon | rare | dusk | open water | ✓ | 50 | 147 | 362 | 929 | 2,336 |
| Rainglass Darter | rare | day, dusk | day water | ✓ | 36 | 105 | 257 | 661 | — |
| The Blind Scrivener (built) | rare | any | open water | ✓ | 51 | 150 | 370 | 950 | 2,389 |
| The Footnote (built) | rare | any | The Well of Ledgers | — | 46 | 134 | 330 | 848 | 2,132 |
| The Unreflected (built) | rare | any | The Mirror Nave | ✓ | 49 | 146 | 358 | 920 | 2,313 |
| Vesper Gar | rare | night | night water | — | 55 | 162 | 399 | 1,026 | — |
| Chime Jelly (built) | uncommon | day, dusk | open water | tin | 17 | 49 | 121 | 311 | 782 |
| Mirror Pike (built) | uncommon | any | open water | ✓ | 24 | 71 | 175 | 449 | 1,128 |
| Redhome Salmon | uncommon | day, dusk | open water | ✓ | 17 | 50 | 122 | 314 | 790 |
| Rosefleck Trout | uncommon | day, dusk | open water | ✓ | 18 | 54 | 134 | 343 | 862 |
| Tremor Catfish | uncommon | night | open water | ✓ | 21 | 62 | 152 | 391 | 984 |
| Duskbar Salmon | common | day, dusk | open water | ✓ | 8 | 24 | 60 | 155 | 389 |
| Glassblown Puffer (built) | common | any | open water | ✓ | 6 | 18 | 44 | 112 | 282 |
| Glassgill Perch (built) | common | any | open water | ✓ | 8 | 22 | 55 | 142 | 356 |
| Prism Minnow | common | any | open water | ✓ | 5 | 14 | 34 | 87 | 218 |


**4. The Pallid Deep** (value tier 35 · its list: 10)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Lantern-Swallower | legendary | night | The Bottomless | — | — | — | — | — | pays 19,000 |
| Candlewake Sturgeon (built) | rare | night | The Chain Garden | ✓ | 150 | 441 | 1,086 | 2,788 | 7,010 |
| Funeral Veil (built) | rare | night | open water | ✓ | 91 | 267 | 656 | 1,684 | 4,233 |
| Lampwarden Angler (built) | rare | night | open water | ✓ | 119 | 349 | 858 | 2,204 | 5,542 |
| The Clapper (built) | rare | night | The Sunken Belfry | — | 113 | 334 | 822 | 2,111 | — |
| The Wax-Bearer (built) | rare | any | The Bier Barge | ✓ | 150 | 441 | 1,086 | 2,788 | — |
| Gilt-Eyed Eel | uncommon | any | old water | ✓ | 65 | 193 | 474 | 1,217 | 3,059 |
| Shroud Ray (built) | uncommon | any | open water | ✓ | 55 | 163 | 400 | 1,027 | 2,581 |
| Bonecrook Crayfish (built) | common | any | open water | ✓ | 13 | 39 | 96 | 245 | 617 |
| Ossuary Fry (built) | common | any | open water | ✓ | 12 | 36 | 88 | 227 | 570 |
| Pallid Wraithfin | common | any | open water | ✓ | 17 | 51 | 124 | 319 | 803 |
| Slipknot Eel | common | any | open water | ✓ | 14 | 41 | 100 | 257 | 647 |


**5. The Rime Sound** (value tier 45 · its list: 8)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Long Winter | legendary | any | The Half-Mile Line | — | — | — | — | — | pays 20,000 |
| ★ Icedoor Flounder | epic | day, dusk | The Fjord Floor | — | — | 1,161 | 2,856 | 7,335 | 18,440 |
| Bellrope Cod | rare | any | old water | ✓ | 162 | 477 | 1,174 | 3,016 | 7,581 |
| Coalwing Skate | rare | any | night water | — | 166 | 489 | 1,203 | 3,090 | — |
| Bouldermouth | uncommon | day, dusk | day water | ✓ | 64 | 188 | 463 | 1,190 | — |
| Hemstitch Cod | uncommon | any | open water | ✓ | 57 | 167 | 412 | 1,057 | 2,658 |
| Rosedeep Rockfish | uncommon | any | night water | — | 52 | 153 | 376 | 965 | — |
| Ashline Cod | common | any | open water | ✓ | 26 | 75 | 185 | 475 | 1,194 |
| Emberspot Flounder | common | any | day water | ✓ | 22 | 66 | 162 | 417 | — |
| Greybeard Cod | common | any | open water | ✓ | 32 | 93 | 230 | 589 | 1,482 |
| Thumbprint Cod | common | day, dusk | open water | ✓ | 24 | 70 | 172 | 441 | 1,108 |
| Wickstripe Rockfish | common | any | open water | ✓ | 15 | 44 | 109 | 280 | 703 |


**6. The Thin Water** (value tier 69 · its list: 7)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Buried Moon | legendary | day, dusk | The Moonbed | — | — | — | — | — | pays 21,600 |
| ★ Weirflame | epic | day, dusk | The Broken Weir | — | — | 1,400 | 3,443 | 8,841 | 22,227 |
| Blotback Catfish | rare | night | night water | — | 212 | 623 | 1,533 | 3,937 | — |
| Frostfleck Nipper | uncommon | any | open water | ✓ | 49 | 144 | 355 | 911 | 2,289 |
| Grumbleplate | uncommon | any | day water | ✓ | 67 | 196 | 482 | 1,238 | — |
| Slipwhisker | uncommon | dusk, night | open water | ✓ | 81 | 238 | 584 | 1,501 | 3,773 |
| Thorntail Ray | uncommon | dusk, night | open water | ✓ | 67 | 199 | 488 | 1,254 | 3,153 |
| Coinback Ray | common | any | open water | ✓ | 33 | 96 | 236 | 606 | 1,524 |
| Flatbill Catfish | common | dusk, night | open water | ✓ | 24 | 71 | 176 | 451 | 1,135 |
| Inkthumb | common | day | day water | ✓ | 29 | 85 | 208 | 535 | — |


**7. The Last Light** (value tier 62 · its list: 6)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Jetsam Shark | legendary | night | The Unlit Mile | — | — | — | — | — | pays 26,900 |
| ★ Castaway Pike | epic | dusk, night | The Beam | — | — | 1,453 | 3,573 | 9,175 | 23,067 |
| ★ Nightsail Lancer | epic | day, dusk | The Drift Line | — | — | 1,706 | 4,197 | 10,777 | 27,093 |
| Ambersickle Tuna | rare | dusk, night | night water | — | 244 | 719 | 1,769 | 4,542 | — |
| Starbar Lancer | rare | day, dusk | day water | ✓ | 266 | 782 | 1,923 | 4,940 | — |
| Fadegold | uncommon | day, dusk | open water | ✓ | 104 | 305 | 750 | 1,926 | 4,842 |
| Soot Jack | uncommon | day, dusk | day water | ✓ | 71 | 210 | 518 | 1,329 | — |
| Grey Latchfin | common | day, dusk | day water | ✓ | 25 | 73 | 180 | 463 | — |
| Pinstripe Tuna | common | day, dusk | open water | ✓ | 32 | 95 | 235 | 602 | 1,514 |
| Scribbleback Mackerel | common | day, dusk | open water | ✓ | 24 | 70 | 173 | 445 | 1,119 |


**8. Pyrefall Gorge** (value tier 118 · its list: 4)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Ashen Guest | legendary | night | The Last Pyre | — | — | — | — | — | pays 35,300 |
| ★ Pyregold Carp | epic | day, dusk | The Coin Run | — | — | 2,430 | 5,977 | 15,348 | 38,584 |
| ★ The Unfinished | epic | night | The Boulder Garden | — | — | 2,465 | 6,064 | 15,572 | 39,148 |
| Lampspot Snakehead | rare | day, dusk | open water | ✓ | 368 | 1,085 | 2,668 | 6,852 | 17,226 |
| Almsfed Carp | uncommon | day, dusk | day water | ✓ | 149 | 439 | 1,079 | 2,772 | — |
| Pipsqueak Catfish | common | any | open water | ✓ | 34 | 101 | 250 | 641 | 1,611 |
| Puddle Snakehead | common | any | open water | ✓ | 34 | 101 | 250 | 641 | 1,611 |


**9. The Waxen Reef** (value tier 167 · its list: 4)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Waxen Abbot | legendary | night | The Abbot's Cellar | — | — | — | — | — | pays 50,200 |
| ★ Anvil Trevally | epic | day, dusk | The Broken Keel | — | — | 3,439 | 8,458 | 21,721 | 54,606 |
| ★ Mothlance Gar | epic | night | Lamp Row | — | — | 3,489 | 8,582 | 22,039 | 55,405 |
| ★ Spirewatch Pike | epic | day, dusk | The Drowned Spire | — | — | 3,489 | 8,582 | 22,039 | 55,405 |
| Cabin Grouper | rare | any | night water | — | 521 | 1,535 | 3,776 | 9,698 | — |
| Nebula Trout | uncommon | day, dusk | day water | ✓ | 211 | 621 | 1,528 | 3,923 | — |
| Picket Pike | uncommon | day, dusk | The Drowned Spire | — | 236 | 694 | 1,707 | 4,384 | 11,022 |
| Amberside Snapper | common | any | open water | ✓ | 82 | 241 | 593 | 1,524 | 3,830 |
| Pebble Grouper | common | any | open water | ✓ | 65 | 191 | 470 | 1,207 | 3,035 |
| Waxdrop Damsel | common | day, dusk | open water | ✓ | 49 | 145 | 357 | 916 | 2,302 |


**10. The Thunder Stair** (value tier 203 · its list: 5)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Last Lock | legendary | day, dusk | The Throat | — | — | — | — | — | pays 77,600 |
| ★ Lampeye Perch | epic | dusk, night | The Cauldron | — | — | 4,361 | 10,726 | 27,546 | 69,249 |
| ★ Soapthief | epic | night | The Soap Landing | — | — | 4,055 | 9,974 | 25,614 | 64,393 |
| Cocoon Sleeper | uncommon | any | day water | ✓ | 305 | 899 | 2,210 | 5,675 | — |
| Swallowtail Catfish | uncommon | dusk, night | open water | ✓ | 245 | 723 | 1,778 | 4,565 | 11,476 |
| Cradlemouth Bream | common | day | day water | ✓ | 78 | 231 | 568 | 1,457 | — |
| Sidepool Snakehead | common | any | day water | ✓ | 71 | 210 | 517 | 1,328 | — |
| Stairhopper | common | day | open water | ✓ | 59 | 175 | 429 | 1,103 | 2,772 |


**11. Rushlight Fen** (value tier 336 · its list: 5)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Long Thunder | legendary | night | The Dam Foot | — | — | — | — | — | pays 118,700 |
| ★ Packtooth | epic | day, dusk | The Run | — | — | 6,499 | 15,984 | 41,047 | 103,191 |
| Foamnest Pike | uncommon | day | day water | ✓ | 274 | 806 | 1,983 | 5,093 | — |
| Reedwalker Catfish | uncommon | dusk, night | open water | ✓ | 458 | 1,349 | 3,318 | 8,521 | 21,421 |
| Basket Fry | common | day | open water | ✓ | 98 | 289 | 711 | 1,825 | 4,588 |
| Blushing Bream | common | day, dusk | open water | ✓ | 112 | 331 | 813 | 2,088 | 5,249 |
| Hingecreak | common | any | open water | ✓ | 106 | 311 | 766 | 1,966 | 4,943 |


**12. The Salt Gate** (value tier 269 · its list: 9)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Old Shipwright | legendary | dusk, night | The Slipway | — | — | — | — | — | pays 162,800 |
| ★ Inkmarble Eel | epic | night | The Harbour Stump | — | — | 6,009 | 14,779 | 37,954 | 95,416 |
| ★ Sweetwater Shark | epic | dusk, night | The Sluice Throat | — | — | 7,403 | 18,208 | 46,759 | 117,551 |
| ★ Tideghost Shark | epic | night | The Turning Tide | — | — | 7,358 | 18,097 | 46,474 | 116,834 |
| Dusk Drummer | rare | night | night water | — | 920 | 2,708 | 6,661 | 17,107 | — |
| Longlash Ray | rare | any | open water | ✓ | 1,147 | 3,378 | 8,309 | 21,338 | 53,643 |
| Old Breather | rare | dusk, night | open water | ✓ | 840 | 2,473 | 6,083 | 15,621 | 39,270 |
| Creekling Shark | uncommon | any | open water | ✓ | 380 | 1,118 | 2,750 | 7,062 | 17,755 |
| Embereye Bass | uncommon | dusk, night | open water | ✓ | 416 | 1,225 | 3,014 | 7,739 | 19,457 |
| Kitewing Ray | uncommon | day, dusk | day water | ✓ | 392 | 1,155 | 2,841 | 7,295 | — |
| Tidetable Ray | uncommon | any, best at night | open water | ✓ | 260 | 764 | 1,880 | 4,828 | 12,137 |
| Brinewhisker | common | any | open water | ✓ | 99 | 293 | 719 | 1,848 | 4,645 |
| Saltroot Bream | common | any | open water | ✓ | 85 | 249 | 613 | 1,574 | 3,957 |
| Sandblower | common | day, dusk | day water | ✓ | 123 | 364 | 894 | 2,296 | — |


**13. Lampmoss Slough** (value tier 608 · its list: 5)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Last Sentry | legendary | day, dusk | The Sentry's Reach | — | — | — | — | — | pays 212,900 |
| ★ Old Portcullis | epic | night | The Lock Gate | — | — | 11,954 | 29,402 | 75,506 | 189,819 |
| ★ Weirshadow Catfish | epic | any | Under the Weir | — | — | 12,334 | 30,337 | 77,907 | 195,856 |
| Lampspot Snakehead | rare | day, dusk | open water | ✓ | 1,898 | 5,590 | 13,748 | 35,306 | 88,758 |
| Spotmail Gar | uncommon | day | day water | ✓ | 805 | 2,370 | 5,830 | 14,972 | — |
| Tailwatch Mudfish | uncommon | any | night water | — | 732 | 2,156 | 5,302 | 13,616 | — |
| Hearsay Sunfish | common | day | open water | ✓ | 194 | 571 | 1,404 | 3,605 | 9,062 |
| Scrapwhisker Catfish | common | any | open water | ✓ | 332 | 976 | 2,402 | 6,168 | 15,506 |
| Startle Carp | common | day, dusk | open water | ✓ | 358 | 1,055 | 2,594 | 6,661 | 16,746 |


**14. The Siltway** (value tier 794 · its list: 10)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Barge-Shadow | legendary | night | The Long Hole | — | — | — | — | — | pays 260,100 |
| ★ Dapplewheel Ray | epic | night | The Lamp Bar | — | — | 17,736 | 43,624 | 112,029 | 281,636 |
| ★ Sternlamp Catfish | epic | any, best at night | The Sunk Ferry | — | — | 16,825 | 41,383 | 106,272 | 267,164 |
| Millstone Catfish | rare | dusk, night | open water | ✓ | 2,479 | 7,300 | 17,954 | 46,107 | 115,911 |
| Snufferjaw | rare | day, dusk | day water | ✓ | 2,216 | 6,525 | 16,049 | 41,214 | — |
| Tallyside Catfish | rare | night | night water | — | 2,307 | 6,793 | 16,708 | 42,907 | — |
| Boathook Catfish | uncommon | any | open water | ✓ | 915 | 2,695 | 6,628 | 17,021 | 42,789 |
| Hullknock Perch | uncommon | dusk, night | open water | ✓ | 819 | 2,412 | 5,933 | 15,237 | 38,305 |
| Waxcomb Ray | uncommon | any | open water | ✓ | 843 | 2,483 | 6,108 | 15,686 | 39,434 |
| Bareface Catfish | common | day, dusk | day water | ✓ | 306 | 903 | 2,220 | 5,701 | — |
| Lacework Catfish | common | night | open water | ✓ | 256 | 755 | 1,857 | 4,768 | 11,987 |
| Silkwhisker | common | night | open water | ✓ | 375 | 1,105 | 2,717 | 6,978 | 17,542 |
| Tallow Borer | common | any | open water | ✓ | 232 | 683 | 1,680 | 4,313 | 10,843 |
| Vigil Catfish | common | any | open water | ✓ | 279 | 822 | 2,023 | 5,195 | 13,059 |


**15. Lanternroot Lagoon** (value tier 866 · its list: 6)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Silver Regent | legendary | day, dusk | The Sighing Pool | — | — | — | — | — | pays 393,500 |
| ★ Rootjaw Catfish | epic | night | The Monsoon Cut | — | — | 19,345 | 47,580 | 122,188 | 307,175 |
| ★ Snagheart Bass | epic | dusk, night | The Sunken Orchard | — | — | 17,299 | 42,550 | 109,270 | 274,700 |
| ★ Votive Shark | epic | night | The Stilt Shrine | — | — | 20,290 | 49,905 | 128,159 | 322,187 |
| Harbourdrum Grouper | rare | night | old water | ✓ | 2,704 | 7,962 | 19,582 | 50,288 | 126,422 |
| Stiltshadow Shark | rare | dusk, night | night water | — | 3,120 | 9,188 | 22,598 | 58,032 | — |
| Sandghost | uncommon | day, dusk | day water | ✓ | 1,018 | 2,999 | 7,376 | 18,942 | — |
| Wide-Eyed Stray | uncommon | any | open water | ✓ | 998 | 2,939 | 7,229 | 18,564 | 46,669 |
| Flicker Trevally | common | day, dusk | open water | ✓ | 334 | 984 | 2,421 | 6,218 | 15,631 |
| Frownlip Mullet | common | day, dusk | open water | ✓ | 334 | 984 | 2,421 | 6,218 | 15,631 |
| Rootshade Snapper | common | any | open water | ✓ | 407 | 1,198 | 2,946 | 7,565 | 19,019 |


**16. The Inkwood** (value tier 1675 · its list: 7)

| fish | rarity | bites | where | list | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|---|---|---|
| ★ The Banked Fire | legendary | day, dusk | The Breathing Mere | — | — | — | — | — | pays 580,300 |
| ★ Emberbelly | epic | day, dusk | The Kitchen Stair | — | — | 34,492 | 84,836 | 217,863 | 547,698 |
| ★ Nightcreek Hound | epic | night | Rootgate Creek | — | — | 30,155 | 74,169 | 190,470 | 478,834 |
| ★ Smilejaw Bream | epic | day, dusk | The Overhang | — | — | 28,358 | 69,750 | 179,121 | 450,303 |
| Gourdcracker | rare | day, dusk | day water | ✓ | 4,434 | 13,057 | 32,115 | 82,473 | — |
| Inkside Nipper | uncommon | any | open water | ✓ | 1,393 | 4,101 | 10,088 | 25,906 | 65,127 |
| Starback Ray | uncommon | any, best at night | open water | ✓ | 1,930 | 5,685 | 13,982 | 35,906 | 90,267 |
| Windowtail Perch | uncommon | day | open water | ✓ | 1,660 | 4,889 | 12,026 | 30,882 | 77,636 |
| Ditch Hound | common | any | open water | ✓ | 619 | 1,821 | 4,480 | 11,505 | 28,922 |
| Gourdseed Minnow | common | any | open water | ✓ | 489 | 1,440 | 3,543 | 9,099 | 22,874 |
| Petal Bream | common | day | open water | ✓ | 541 | 1,593 | 3,917 | 10,059 | 25,288 |

Waiting for a later sheet (built, not roster fish): Cupbearer (cupped_hands), The Remembered Sun (drowned_greenhouse), The Sexton (bell_window), The Unpaid Fare (ferry_slip), The Namesake (long_pier).

Curiosities (roster §6) are outside these tables: each sells at its water's rare Keeper price.

## Appendix B. Re-running the proof

```
cd gloomwater
node tools/sim/clams.mjs              # everything, about 80 s; exits 1 if any of the 166 checks fails (v8: section 7, the three keys, and the gated pacing run; §5.5 (e))
node tools/sim/clams.mjs --quick      # about 55 s
node tools/sim/clams.mjs --md         # the tables as markdown
node tools/sim/clams.mjs --fish       # Appendix A
node tools/sim/clams.mjs --json       # the LOOP draft tables
node tools/sim/clams.mjs --calibrate  # the value tiers that satisfy decision 10's two ladder rules, with a 2-point margin
node tools/sim/roster-check.mjs       # the roster's coverage and ladder rules
python3 tools/loop-colour-script.py   # the waters' colour script (WATERS.md §8): lint, paint, measure and gate; tools/out/loop/colour-script.png; exit 1 on a failure
```

**After a re-order** (v7): re-order `NEW_WATER` and `roster.json`'s `waters` together (the sim maps places and giants by position, and exits 1 if the two lists' names or orders disagree), move the slot-bound bait (`at`), run `--calibrate` and put its tiers in `NEW_WATER`, set each lake price to 42 × the water's fully mapped clams a minute (the calibrate line prints it), then run the sim and fix this file.

It reads the fish from `docs/loop/roster.json` and the built species the roster keeps, and from `src/data.js` (loaded as the loop will load it: `GW_V3`, `GW_V3_PHASE = 1`, `GW_LOOP`) the size model, the land chance (`catchParts`), the lures and baits and the time model of a cast. It keeps its own draft `LOOP` table for everything this spec adds. It runs 166 checks (v8 adds 26 for the three keys, listed in §5.5 (e)): the roster and the sim agree on the waters' order; every roster fish has a map; one legend per water; one giant per place; the giants top every water's ladder and are never a step down from the water before; the anti-grind and choosy checks at six stages and on every new water at its arrival kit; every giants' lure earns its place; every new water's giant lands a Prize 30–50% on arrival tackle; the bait checks, and no tin beats the plain bait; every giant is the hardest fish of its water; every legend stays at or under a coin flip; the pacing targets of §4.9; every hold step and raft part pays its way; a new water is the best water from the day it opens; no lake map is a downgrade; every water pays 1.2 times the one before; every place map adds 5%; no stopping short. Change a price in `LOOP`, run it, and it says which target moved.
