# GLOOMWATER, brief v3: Expeditions from the Landing

*Lead-designer decision document for DESIGN §25 and the code that follows. Final revision, after two adversarial reviews. Inputs: DESIGN §1–§23 and Appendix A, the §24 walking draft (design-walk worktree, re-read for this revision), the four panel proposals (`angler.md`, `naturalist.md`, `explorer.md`, `structure.md`), the current screenshots (`palette-compare`, `palette-baseline`, `showcase`) and three scripts in this folder: `reel-v3-sim.mjs` (land rates for the tackle this brief specifies), `roster-v3.mjs` (every size in §6.5, the legend-length rule, the value normaliser, the class odds) and the angler's original `angler-sim.mjs`. Nothing in the repository or any worktree was edited.*

**Settled by the user, not re-argued here:**
1. *"Go with the expeditions and home base idea."* Out-and-back **Expeditions** launched from a persistent home, **the Landing**, replace the one-way descent as the default structure. The full one-way descent survives as the prestige mode **The Long Descent** (§3.9).
2. *"Yes, make the home base a 3D cove."* The Landing is a small, walkable, lantern-lit 3D cove (§3.7). It is not a menu.
3. Request 5 sets the priorities: **fishing, beautiful and interesting places, interesting species, big sizes.** Combat is a nice-to-have.
4. Request 3 still holds: the Mossmere is raft-only, Sporewood is raft and walking, Glasswater and the Pallid Deep are mostly on foot (§24).
5. Request 4 still holds: no green-dominant environment. That includes the fish, the glows, Old Murk and the home cove.

**How to read the numbers.** Every number is a target for `src/data.js`. Land rates come from `reel-v3-sim.mjs` (run from `gloomwater/`: `--gate`, `--rating`, `--elders`, or no flag for lake tables). Sizes, odds and the value factor come from `roster-v3.mjs`. Where no sim exists yet, the arithmetic is shown so the balance sim (T3) and the pacing sim (T5) can replace it. "Hour" always means **hours of play**, not hours of fishing.

**Code names vs player names.** Players see *the Landing*. Code uses `hub` (the flow), `cove` (the zone id and camera mode) and `hub:enter` (the event), because `landing` is already a fishing state in eight modules.

---

## 0. Pitch

You are a Wick, a small stubborn candle with a lantern and a rod, living at **the Landing**: a drowned ferry cove under the kingdom's outer wall, where an old toad merchant's barge is moored, a bare specimen board waits on a long harbour wall, and a silted keep-pond waits for something worth keeping. You can cast from its jetty on your first minute. From there you set out on **expeditions** through the cove's sea-gate into four strange cavern lakes, sailing and walking to remarkable places: a giant's stone hands that overflow when a broken aqueduct coughs, a drowned ferry-market seen through moonlit water, a pool where fish sleep with their mouths open. You read the water and the conditions (the float tells you how much the water favours you), and you hook fish whose **size you can see**. The biggest specimens demand the right place, the right hour, the right tackle and a steady hand. Every fish is measured with a knotted cord and stamped into your Journal the moment it lands, and that record can never be lost. What you **bring home** is another matter: a marked Trophy must survive the nights, the far water and the lantern's thirst, and the longer you stay out the better the water gets and the harder the way home. Bring it back and it hangs on your wall at its true size against a painted ruler, or swims in your pond. The Landing fills with light, colour and fish until your collection is complete. Night is when the giants rise; the swarm that comes with it is a choice you make each time you set out.

---

## 1. Pillars (ranked)

When pillars conflict, the higher one wins.

1. **Remarkable places, remarkable fish.** Every lake is a set of hand-authored *places*, each with a twist, a story and, at three per lake, a resident giant. Exploration means finding them, and fishing means solving them.
2. **Size is the challenge, and you can see it.** Ordinary catches stay relaxing (common species land ≥ 97% of the time for a novice). The challenge of request 1 lives in **Prize, Trophy and Elder** fish, which need place, conditions, presentation, tackle and skill all at once. The setup is readable (the float's favour notches, §5.1) and size is honest at every stage: the bite, the breach, the fight, the measuring cord, the wall.
3. **Home grows with what you bring back.** The Landing is the visible spine of progression: one framed slot per species on the Long Wall, a pond of living trophies, lit Waystones in each lake's colour, a tackle rack, a shrine of relit lanterns. Records are written at the measuring moment and kept forever. Mounts must survive the trip home.
4. **How far you dare to go.** Oil still equals light, and light still equals life, but oil and the Live Well now measure *how long and how far* an expedition runs. **Far Water** makes every extra day out both more rewarding and more expensive, in every mode.
5. **Night is the big-fish hour, and the swarm is optional.** **Night Rise** brings giants shallow in every mode. Fighting is a per-expedition choice (Still, Lantern or Gloomtide) and never gates a fish, a place, a size class or the odds.
6. **Hand-inked melancholy, ours alone.** Silhouettes, rim light, ink outlines and bioluminescence, with original names, places, systems and HUD. Not Hollow Knight's content, not Dredge's loop, not a real fishing game's signature systems (§13.3).
7. **One thumb, one button.** Hold-to-reel stays the only core fight input. At most one new fight verb per lake, introduced one at a time, and everything playable one-handed on a phone.

### Where I depart from the guiding hypotheses (and why)

| hypothesis | verdict | reason |
|---|---|---|
| Night is "also" a fishing opportunity | **go further** | Night is the *climax* of every day. Night Rise (favour +0.25), night-only species (≥ 2 per lake), glow trails. In the default mode the swarm takes only the first half of every second night; the last 45 s of every night are always uninterrupted fishing. |
| Persistent collection is the main long-term progression | **yes, made visible** | Over the first 15 hours the *felt* spine is three tracks: **tackle tiers** (what you can hold), **Waystones** (where you can go) and **the Landing filling up**. The collection is the long tail, and the Long Wall gives it a visible slot per species until the end. |
| Reuse what is built | **yes, and cut panel ideas that fight it** | Cut: the mid-fight drag dial, rod sweep, diver/snag world tags, count-down sink rigs, the net QTE, pointer-target scatter casting, lure sizes, diet tags, morphs, geometry-moving weather. Each adds a verb or a system that the phone, the originality rules or the merged ring geometry cannot afford. |
| Big sizes are a headline | **yes, honestly and stretched** | True scale (a 22 cm minnow *looks* small next to a 0.85 m Wick), a stretched size tail so an Elder is 1.6–2.0× a typical Keeper's length, legendaries ≥ 1.4× anything else in their lake, frames sized to each species, and a camera that never zooms by class. The 1.45× mid-fight mesh boost goes. |
| Failure should sting without wiping the collection | **yes, defined precisely** | §3.5: you lose the creel, the marked fish you were carrying and half the expedition tally. You never lose a record, a species, banked Shells, tackle, outfit, places, shortcuts or access. |
| Challenge comes mainly from fishing | **yes, and it stays** | Elder fights get steeper above the Elder cut and every Elder plays one "old trick", so even full tackle lands headline Elders only 69–82% of the time (skilled) and the rare Ancients 43–51% (§5.6). |

---

## 2. Core loop and a typical session

### 2.1 The loops

| scale | loop |
|---|---|
| **cast** (5 s – 3 min) | read signs and the float's favour → cast → wait (the bite tell shows the class) → hook → fight (size-scaled) → **measure** (cord, chime, seal; records written) → keep / eat / render / release / **mark for home** |
| **day** (5 min) | calm 180 s: sail or walk to places, follow signs, Murk moors · dusk 20 s: *Last Light*, big fish start to rise · night 90 s: **Night Rise**, night species, the swarm only if your mode calls it · dawn 10 s: Murk's bell, tomorrow's forecast, banked Boon picks |
| **expedition** (3–5 days, 16–26 min) | at the Landing: choose lake, Wick, night mode (from the 2nd expedition), tray → **Set Out** through the sea-gate → days in the lake (optionally pass an open gate one lake deeper) → each dawn the water improves and the way home costs more (**Far Water**) → **Return home** at the lake's Homeward Waystone or on Murk's barge, *or* the lantern gutters (**Snuffed**) |
| **home** (1–3 min) | **Homecoming**: hang marked fish in their species' frames or release them into the keep-pond; Murk buys the rest; the tally is paid · fit tackle and outfit at the Gear Bench, try it on the test buoy from the jetty · relics at the Shrine · plan at the Map Table |
| **campaign** (15–40 h) | land each lake's legendary → its gate opens → pass through once (toll) → the next lake's Waystone lights at home · tackle tiers gated by **proof catches** · Elders and Ancients in every lake · the Long Wall's four wings fill · The Long Descent |

### 2.2 First session, minute by minute (The Wick; the game as it stands at the end of P3)

| clock | where | beat |
|---|---|---|
| 0:00 | Landing | Title overlay over a slow orbit of the cove: one lit hearth, a bare specimen board on the harbour wall, a silted pond, the raft at the jetty. "Begin." |
| 0:05 | Landing | The Wick wakes by the hearth. Tip: *walk*. The jetty end glows; a test buoy bobs beyond it. |
| 0:15 | jetty | Tip: *hold on the water to cast*. The first cast goes into the cove. |
| 0:22 | jetty | A quick **double pop** (Small). A 4 s fight, then the **measuring moment**: palm pose, the cord ticks to 13 cm, "Quayling, Small". First Journal page (+3 Memories). Murk, from his barge: "Lives in my front yard. I don't buy those. The real water's through the gate." |
| 0:40 | Landing | Map Table → the **First Outing** card, fixed: The Mossmere · The Wick · "Every night of your first outing is still." No mode choice yet. Set Out. |
| 0:50 | Landing | The Wick boards the raft. A 3 s glide under the bare sea-gate arch, past the lit Mossmere Waystone. Zone flash. |
| 1:05 | Mossmere | Spawn in the south (day 1 calm: 180 + 30 s Arrival Hush). The Homeward Waystone glints at the south-east dock, 25 m away. |
| 1:20 | | Murk's bell. He moors at that dock, beside the Homeward stone. |
| 1:30 | | First lake bite: a Dusk Minnow (Small). |
| 1:40–3:40 | | 3–4 species. A **boil** near the Cupped Hands draws you east: first place ("The Cupped Hands", ink title card, 1.2 s). The aqueduct coughs, the bowl overflows, fry spill, and the float shows **◆◆◇◇◇** (place 0.15 + live window 0.4). A slow **drag-under** tell: the first **Prize**, a 31 cm Dusk Minnow (≈ 55% of players have a Prize within 5 minutes of the lake). Ink-stamp seal; record written; "Mark for home?" (1 Live Well slot, "keeps 3 nights"). |
| 3:50 | | Murk: rumour tier 1 ("When the old aqueduct coughs, the stone hands overflow."). Sell 2 fish. |
| 4:20 | dusk | *Last Light*: "The big ones come up at dusk." |
| 4:40–6:10 | night 1 | Still. Glowtide: wakes sparkle and a night fish shows as a moving light. Night Rise. *Lampsipper* rises to your lantern (new species). |
| 6:10 | dawn | Murk: "Moonfall twice tomorrow." Far Water ◆◇◇◇. |
| 6:20–9:20 | day 2 | **Moonfall** at 25% of the calm: the Ferry-Market goes glass-clear (moored barges, a toll-house clock, cart wheels). Four fish circle at true scale; you cast to the biggest, a 65 cm **Trophy** Candlefin (oxblood wax). The Belled Matriarch is visible in the Bell Pool. Under the Span is discovered. Heartmoss bought (40). |
| 9:40–11:10 | night 2 | Still (First Outing). A Gloam Eel (Prize) follows a glow trail. |
| 11:20–14:20 | day 3 | Matriarch attempt (sim on starter tackle: 56% novice / 82% skilled). Under the Span, a Trophy Reedjaw escapes at 84%: **near-miss card** ("Snapped at 84%. Your tackle is rated Trophy here, and that was a big one. Let go on the hiss."). It becomes a **Marked Fish**, still under the bridge. |
| ≈ 14:30 | | **Ride home** on Murk's barge (day 3 is a Murk day; he casts off at 85% of the calm, ≈ 14:53), or hold at the Homeward stone. |
| ≈ 15:00 | Landing | **Homecoming**: the Prize Dusk Minnow goes onto the Mossmere specimen board (close-up at 1.7 m with the Wick beside it, then a pull back to the whole wing); the Trophy Candlefin fills its plaque. Murk buys the creel. Memories ≈ 18: tally 10 (2 dawns × 3, 2 still nights, a Ledger request 2) + first mounts 8 (Prize 2, Trophy 6). Gear Bench: buy and fit **Braided Gut (Line T1, 120)** and try it on the test buoy. |
| ≈ 16:00 | | The Map Table now offers night modes (Lantern preselected). The session ends with two fish on the wall and a Marked Fish waiting "under the bridge". |

Notable events: ≈ 22 in 16 minutes (8 species, 4 places, 3 class firsts, PBs, two mounts, the first legend attempt), one every ≈ 45 s. Named species in the first 30 minutes stay ≤ 9 (Quayling, Dusk Minnow, Mossback, Crayfish, Weeping Carp, Candlefin, Reedjaw, Lampsipper, Gloam Eel).

### 2.3 A mid-game session (≈ hour 5, Sporewood, Still mode, Tallow)

| clock | beat |
|---|---|
| 0:00–1:30 | Landing: a Trophy Plumgill goes into its plaque. Map Table: today's rumour says *an Elder Mildew Angler turns at the Mother's Cup rim*; the forecast says *Spore-fall tomorrow*. Fit Line T3 (Glass-Gut; proof was a Sporewood Trophy). Two test-buoy pulls. Set Out: Sporewood, Still. |
| 1:30–5:00 | Day 1 (210 s): moor at the Copse Jetty, walk to the Gill Harp, play the curtains (sequence), land a Harpstring Eel (Prize). Light two Waylamps. |
| 5:00–6:50 | Dusk and night at the Mother's Cup rim (a giant place) with Ember Roe at the bottom of the band: float **◆◆◆◆◇** (place 0.15 + Night Rise 0.25 + rumour 0.3 + bait 0.35 + depth 0.25 = 1.3 → Trophy 19%, Elder 9%). A water-dome tell: an Elder. With Line T3 on a T2 Rod and Reel a skilled player lands it ≈ 15–30% of the time (between the T2 and T3 rows of §5.6): it escapes at 71% and becomes a Marked Fish ("Old Hushwing, ~110 cm"). |
| 7:00–12:00 | Day 2: Spore-fall doubles the Puffball Vent. Far Water ◆◇◇◇ (+0.06). The Lullaby's sleepers: a Trophy Velvet Ray chosen by sight. Pressure (the float says "The water here has gone quiet") pushes you on every 3–4 catches. One Old Ledger record (Murk's bell rings across the lake). |
| 12:00–14:20 | Day 3, a Murk day. The Live Well holds the Velvet Ray (night 1 of 4) and a Prize Harpstring Eel. Staying to day 5 would mean no Murk on day 4 and oil at ×2 on day 5. You **ride home** at ≈ 14:20. |
| 14:40–16:10 | Homecoming: the Velvet Ray fills its arch, the Harpstring Eel goes to the pond. Memories ≈ 28 (tally 10, first mounts 8, the Old Ledger record 5, class firsts ≈ 5). The Map Table marks Old Hushwing at the Mother's Cup. |

### 2.4 Time budget of a 4-day expedition (4 full days, 20.5 min in the lake + ≈ 2 min at the Landing)

| mode | exploring (sail, walk, places, lamps) | fishing (cast → measure, incl. night) | fighting | menus and ceremonies | fight share of play |
|---|---|---|---|---|---|
| **Still** | 7.5 min | 10.5 | 0 | 2.5 | 0% |
| **Lantern** (default from the 2nd expedition) | 7.5 | 9.6 | 1.35 (two 40.5 s swarm windows) | 2.05 | ≈ 6% |
| **Gloomtide** (21.1 min in the lake: nights 90/96/102/108 s) | 6.0 | 6.3 | 6.8 (four full nights + calm raids) | 2.0 | ≈ 29% |

---

## 3. Macro structure

### 3.1 The decision, stated to the user

The one-way roguelite descent of request 2 becomes **out-and-back expeditions**. Per-expedition risk, per-expedition Boons and levels, and an optional swarm are kept. **Tackle, outfit, Shells, the Journal, records, places, shortcuts and lake access persist.** The original one-way descent is kept intact as **The Long Descent** (§3.9). The hybrid of request 2 (raft fishing by day, a survivors-like night, roguelite meta) is all still here. What changes is that the meta now has a *home* you walk around in, and trophy hunting no longer resets every run.

### 3.2 Reaching the four lakes: unlock order, travel, Waystones

| step | rule |
|---|---|
| **Waystones** (vocabulary kept, meaning sharpened) | Four standing stones at the foot of the Landing's sea-gate, one per lake. A lit Waystone is a lake you can **start an expedition in**. The Mossmere's is lit from the start. Waystone relics (purse, banked levels) are cut. |
| **Opening the next lake** | Land a lake's legendary (legend rule unchanged, DESIGN §5.6) → its **Descent Gate opens for good**. |
| **Lighting the next Waystone** | During any expedition, pass through that open gate once and pay its **toll once** (180 / 420 / 900 Shells, unchanged). You arrive in the new lake *on that expedition*, and its Waystone lights at home for every later expedition. The first visit to each lake is always a journey, never a menu jump. |
| **Going deeper mid-expedition** | Any open gate whose Waystone is lit is a free passage one lake deeper: one-way within an expedition, calm or dawn only. **+10 tally per lake crossed, paid only if the expedition then completes a full calm in the destination lake** (no gate-hopping for Memories). The deeper lake's drains, Heat and fish apply. |
| **Travel out** | Map Table → Set Out (the chosen Waystone flares) → board the raft → sail (or auto-glide, 3 s) north under the sea-gate arch → zone flash → that lake's spawn. Murk follows and moors at 0:20 of day 1. |
| **Travel home** | **Homeward Waystone**: one lantern-stone per lake, **≥ 25 m of path from the spawn** (validated), beside a dock or walkway: Mossmere at the south-east dock (24, 38); Sporewood at the Copse Jetty stand (17, 31); Glasswater at the Skiff Steps (5, 18); the Pallid Deep at the Cairn Plaza lamp (4, 24). Within 4 m during **calm or dawn**, hold the pill for 1 s. Or **Ride home** from Murk's barge while he is moored (calm only). Both sleep through dusk and night, like the gate. |
| **Deep starts** | Starting in a deeper lake gives **3 / 6 / 9 banked Boon picks** (Sporewood / Glasswater / Pallid) in every mode: Angler-pool picks in Still; in Lantern and Gloomtide the full pool, with Angler-tagged picks capped at the same 3 / 6 / 9. Gloomtide also keeps today's Kindling Draft (9 / 18 / 28 levels), but **Draft levels may only take non-Angler offers**. |
| **Heat on deep starts** (combat modes) | Heat = max(day − 1, arrival offset) + 3 × zone, with offsets 0 / 4 / 8 / 12 by lake in Gloomtide and 0 / 2 / 4 / 6 in Lantern, so a Pallid start faces today's arrival Heat (≥ 18 in Gloomtide), not day-1 Heat. |

### 3.3 The expedition

| phase | what happens |
|---|---|
| **First Outing** (expedition 1 only) | Fixed card: the Mossmere, The Wick, every night still. No mode cards. From expedition 2 the Map Table shows the three mode cards with **Lantern** preselected and a one-line explanation under each. |
| **Set Out** (Map Table) | Choose a lake (lit Waystones only), a Wick (unlocked), a **night mode** (Still / Lantern / Gloomtide, locked for the expedition) and a bait/lure tray. The card shows tomorrow's condition per lake, today's rumour, known residents and Marked Fish, and the **tackle rating** of your fitted set in that lake ("Mossmere: Trophy · Elders 15%"). |
| **Days** | Calm 180 s (185 s in the two foot lakes; +30 s Arrival Hush on day 1 and on the first calm after passing a gate), dusk 20 s, night 90 s (Gloomtide: 90 + 6/day, max 120), dawn 10 s: 5 min per day, 5.5 min for day 1. Murk moors in the lake (days 1 and 2, then odd days only, §3.4): buys fish, sells bait, supplies and, in combat modes only, the combat kit; posts in-lake bounties; takes Ledger turn-ins. **Tackle and outfit are only sold and fitted at home.** |
| **Return home** | Homeward Waystone or Murk's barge, calm or dawn → Homecoming (§3.8). |
| **Snuffed** | Oil hits 0 → *Last Flicker* (+12, once per day) → 25 s of **guttering** (light 2.5 m; no casting because you cannot see the bobber; you can still move and render a fish to relight) → snuffed. **Only oil can snuff you in Still and Lantern.** In Gloomtide, Embers reaching 0 also snuffs (today's stakes). The *Second Wick* relic relights once per expedition in every mode. The Wick wakes at the Landing's hearth: "Murk found your raft drifting." |
| **Length** | Open-ended, shaped by Far Water. Built for 3–5 days (16–26 min); a one-day outing (≈ 6 min) is a first-class phone session. Combat modes keep the linger rule (+1 Heat per night after the 4th night in one lake). |
| **Saving** | Autosave every 30 s, on every phase change, on `visibilitychange: hidden` and on `pagehide`, including the Wick's position (`run.pos {x, z, y, mode, mooring}`), oil and the phase clock. *Continue* restores you exactly where you were (snapped to the nearest walkable or water cell by `walkGridFor`). A save made while guttering or at 0 oil resolves as Snuffed on load. Closing the tab never moves you closer to home. |

### 3.4 Far Water: why "one more day" is a real decision (every mode)

The lake forgets you are there, and the lantern remembers how far you are from home. Both begin with the first dawn of an expedition (day 2).

| | rule | day 2 | day 3 | day 4 | day 5 | day 6+ |
|---|---|---|---|---|---|---|
| **reward** | lake-wide favour (a new *Hour* favour, §5.1) | +0.06 | +0.12 | +0.18 | +0.24 (cap) | +0.24 |
| | resident shows per calm at each giant place (§7.0) | +1 | +2 | +3 (cap) | +3 | +3 |
| **cost** | Murk moors | yes | yes | **no** | yes | odd days only |
| | Murk's oil price | × 1.0 | × 1.0 | — | × 2.0 | + 0.5 per day after day 3 |
| | oil from rendering a fish | 90% | 80% | 70% | 60% (floor) | 60% |
| | night oil burn (night n) | × 1.0 | × 1.15 | × 1.30 | × 1.45 | + 0.15 per night |
| HUD | the Homeward stone's distance and **Far Water ◆◆◇◇** next to the oil gauge | | | | | |

**The oil table that makes it bite** (`BALANCE.oil`; oil/s = 0.17 × zone oil drain × context × night factor):

| context | calm / dawn | dusk | night |
|---|---|---|---|
| on the raft (sailing or moored) | 0.35 | 0.5 | **1.0** (all modes) |
| on foot | 1.0 | 1.0 | 1.4 |
| inside a lit Waylamp's pool, or standing at the moored raft | 0.35 | 0.35 | 0.7 |

*Mossmere check (raft only):* a day burns 10.7 (calm) + 1.7 (dusk) + 15.3 (night) + 0.6 (dawn) = **28.3 oil** (30.1 on day 1). A rendered Mossmere common gives ≈ 17 oil at 100%. Commons you must render per day: 1.8 (day 1) · 1.9 (day 2) · 2.3 (day 3) · 2.8 (day 4) · 3.5 (day 5) · 3.7 (day 6), out of ≈ 5 fish landed. By day 5 you are eating most of your catch, with no Murk on day 4 and double-price oil on day 5. *Glasswater check:* 53 oil per day if you spend the night at a lit lamp, 68 in the open; a full 100-oil lantern on foot away from lamps lasts 7 min by day and 5 min at night.

**The Live Well clock.** A marked fish is alive and must reach home alive. It keeps for **3 nights** (Creel T0–T1), **4** (T2–T3) or **5** (T4) after it is marked. At the dawn after its last night you release it ("It had grown listless. You let it go."): the record stays, the mount does not happen. Legendaries need no Live Well slot and never expire. There is no spoilage, no value decay and no cargo grid (§13.3).

**Targets for the balance sim (T3):** snuffed ≤ 3% of expeditions for players home by day 3 and 6–10% for players who push past day 4 (Still); Lantern +2 points; median expedition still 3–5 days; ≥ 25% of expeditions end on Murk's barge.

### 3.5 Exactly what persists across a failed expedition

| thing | written when | kept if you return | kept if **Snuffed** |
|---|---|---|---|
| Journal names, field notes (incl. your best setup per species), class seals, personal bests (cm and kg), Old Ledger records, the **Elder Log** entry | at the **measuring moment** (the seal stamp) | yes | **yes**: an Elder lost on the way home keeps the line "*Sank with the creel, night 4*" |
| Shells | the moment Murk pays (in-lake sale, bounty, Warden) | yes | **yes** (no unbanked Shells exist) |
| Memories from discoveries (species, class firsts, places, rumours, Old Ledger, legends, challenges, first releases) | the moment it happens | yes | **yes** |
| Tackle tiers, outfit tiers, lures owned, relics, Wicks, challenges, Waystones, open gates, **opened shortcuts**, Known Places, Tally Post records, residents, Marked Fish | on purchase or event | yes | **yes** |
| **Creel** (unsold fish) | — | sold to Murk at home | **lost** (it sinks) |
| **Marked fish** (Prize+ you chose to bring home; theft-proof; in Live Well slots) | — | hung in their species' frame or released into the keep-pond (first-mount Memories) | **lost**, with no mount and no first-mount Memories |
| **Expedition tally** (dawns, nights, lakes crossed, Ledger requests) | on return | 100% | **50%** |
| Bait, consumed lures, supplies, combat kit, level, Boons, Kindles, Heartwax, lit Waylamps, the lake's Astir state, Far Water | — | end with the expedition | end with the expedition |

A typical snuff costs **less than a day's catch plus whatever you chose to carry home**. The sting lands on *the fish you were proudest of*, never on the collection.

### 3.6 How the existing roguelite systems map onto expeditions

| system | in v3 |
|---|---|
| **Memories → Relics** | Same currency and the same Shrine (now a 3D alcove at the Landing). Discoveries bank instantly; the expedition tally is paid on return. Relics split into a **Fishing & Exploration shelf** and a **Gloom shelf** (effects that only matter in combat modes). Cut: Waystone relics × 3 and Murk's Old Debt; their Memories are refunded on save migration. New relics: §9.4. |
| **Boons and Kindles** | Per expedition (they reset at home). Levels come from fish and discovery XP in every mode, and from Cinders in combat modes. **Level-ups earned while fishing, sailing or walking are banked** and offered on the next measuring card or at the dawn bell, never as a modal while you move or have a line in the water. Level-ups during a swarm keep today's immediate offer. **Angler pool**: the 9 existing fishing, movement and oil boons plus 6 new (§4.4). Kindles exist only in combat modes. |
| **Wicks (6)** | Chosen per expedition at the Map Table. Stats unchanged. Every quirk gets a fishing half (§4.5), including §24's sixth Wick, the Wayfarer. Unlocks get either-path requirements. |
| **Challenges** | Today's 30, plus §24's tier IV (10) and a new tier V *The Measure* (8) = **48**. "Run" scope becomes "expedition" scope. **Nine** combat-only challenges move to a **Gloom** tab and unlock only combat things (§11). |
| **Waystones** | The Landing's sea-gate stones (§3.2). |
| **Wardens, Heat, formations, elites** | Unchanged inside Gloomtide; scaled inside Lantern (§4.1); absent in Still. Heat uses the arrival offset (§3.2). |
| **Trophy or Toll** | Generalised into **Mark for home**: any Prize+ fish, and every legendary, can be marked. |
| **Records** (meta) | Extended: per species (length, weight, class firsts, best setup), per place (Tally Posts), the Elder Log (with Ancients), the Old Ledger, legend growth lines. |
| **The death screen** | Becomes the **Snuffed** summary: what was kept, what sank, near-miss lines, one tip. |
| **Per-run upgrades from Murk** | The four all-mode ones become persistent **outfit** tiers at the Gear Bench (§5.6). The five combat ones stay per expedition as Murk's **combat kit**, sold only in combat modes at 40% of today's prices. |

### 3.7 The Landing: a 3D cove you walk around in

**Name.** *The Landing* is kept: plain, a little sad, and doubly true (where the last Wicks landed, and where you land fish). In code the flow is `hub` and the zone is `cove`.

**Fiction.** An old ferry landing tucked under the kingdom's outer wall: a sheltered pocket of still water behind a broken **sea-gate arch**. The four Waystones stand at the arch's feet, and a channel beyond them runs out into the dark toward every lake. The harbour wall above the quay was where the ferrymen pinned their best catches; it is bare now. Old Murk keeps his barge here between expeditions. The Wicks who are not out on the water doze by the hearth.

#### 3.7.1 Layout

Coordinates follow the game's convention: x east, z south, −z is north (up-screen). The camera yaw is fixed, looking north, as everywhere else, so **everything you want to look at faces south**: the harbour wall (the Long Wall) on the land side and the sea-gate arch on the water side, **side by side**, 4 m apart.

```
                         N (up-screen)                 channel out into the dark (shoreNotch)
   cliff ─────────────────────────────────────────────┐          ║
   ┌─ UPPER GALLERY y 6.0 ── UPPER WALL z −21.5 ──────┐ │          ║
   │  [ Glasswater wing ][ Pallid wing ]  (sailcloth) │ │ ╔══ SEA-GATE ARCH z −18 ══╗  span x −2…14, crown y 9.5
   └──────────────────────────────────────────────────┘ │ ║ legends hang y 3.5–7.5  ║
  stair x −32 (silted until Glasswater lights)          │ ║ ◆W1  ◆W2   ◆W3  ◆W4     ║  Waystones on a sill, z −15
   ┌─ LOWER GALLERY y 1.8 ── LOWER WALL z −14.5 ──────┐ │ ╚═════════════════════════╝
   │  [ Mossmere wing ] ▮hearth stack▮ [ Sporewood ]  │ │
   └────────────── ramp x −10 ────────────────────────┘ │      THE COVE (raft water, depth 0.2–1.0)
   LOWER QUAY  y 0.6    [S]  [B] [T] [H]earth  [L] [M]ap      ▣ Murk's barge (4, −6.5)
                              (o) keep-pond          ═══ jetty ═══▶ raft (6, 2)    ⊙ test buoy (10, 6)
   ───── low parapet, bollard lanterns ≤ 1 m; shallows; nothing above 1 m for ≥ 14 m south ─────
```

| element | position (x, z) · height | notes |
|---|---|---|
| arena | **R 42** round cavern, seed 7707, layout `cove` (shallows 0.2–0.5, channel 0.6–1.0), one `shoreNotch` at the north for the channel | world's existing cliff ring, 3 parallax rings (2 on low), stalactites, 2 shafts |
| **Lower Quay** (walk `rect`) | x −30…−4, z −6…+8, y 0.6 | the main floor. A 1.2 m retaining wall along z −6 holds the hearth, bench and Trials Board; the south edge has a low parapet and bollard lanterns (≤ 1 m) |
| **Lower Gallery** (walk `rect`) | x −33.5…−6, z −14…−6, y 1.8 | viewing floor for the lower wall; ramp `path` (−10, −2.5, 0.6) → (−10, −6.5, 1.8), w 3 (slope 0.30) |
| **Lower wall** | south face z −14.5, x −30…−6, y 1.8 → 6.0 | **Mossmere wing** x −30…−18 and **Sporewood wing** x −18…−6, either side of the hearth's chimney stack; 3 rows of frames each |
| **Upper Gallery** (walk `rect`) | x −33.5…−6, z −21…−15.5, y 6.0 | cut into the cliff. Stair `path` (−32, −6, 1.8) → (−32, −16, 6.0), w 2.4 (slope 0.42); silted shut until the Glasswater Waystone lights |
| **Upper wall** | south face z −21.5, x −30…−6, y 6.0 → 10.0 | **Glasswater wing** x −30…−18 and **Pallid wing** x −18…−6 |
| **Sea-gate arch** | legs at x −3 and 15, z −18; crown y 9.5 | new geometry (§3.7.6). Three legendaries hang on chains beneath it at y 3.5–6.5; the Lantern-Swallower (8.5 m) hangs lengthwise above them at y ≈ 7 inside the 16 m span. You sail out beneath your legends on every expedition. |
| **Waystones** W1–W4 | (0, −15) (4.5, −15.3) (9, −15.3) (13, −15) on a low stone sill | each glows its lake's colour when lit |
| **Jetty** and **raft mooring** | `path` (−4, 2) → (4, 2), w 2.6; raft at (6, 2) | §24 board / ashore with one mooring ring. **You can cast from the jetty** (§3.7.2). A **test buoy** is moored at (10, 6). |
| **Murk's barge** | (4, −6.5), Customs Steps `path` (−4, −3) → (0, −5) | trade within 5 m; his chalk tally board stands on deck |
| **Keep-pond** (walk `hole`, depth 0.7) | centre (−16, 3.5), r 2.8 (r 4.0 at pond tier 3), stone rim at y 0.6 | rendered by its own pond pass (§3.7.6) |
| **Map Table** + **Journal lectern** | (−9, 2) and (−6.5, −2) | the table top is a 512² chart canvas on its own material |
| **Hearth** | (−18, −4.5), chimney stack up the lower wall at x −18 | the cove's one warm PointLight; respawn point after a snuff; dozing Wicks; the two Wanderers' frames hang on the chimney breast |
| **Trials Board** | (−23, −5.4) on the retaining wall | pinned challenge cards |
| **Gear Bench** | (−26, −5) on the retaining wall | rod rack, line spools, reel vice, creel and Live Well, outfit pegs: all show your owned tiers |
| **Shrine of Drowned Lanterns** | (−30, 0), a small roofless alcove at the quay's west end | an iron frame with **one drowned lantern per relic level** (≈ 60, counted from data; one InstancedMesh) |

Walking distances from the hearth at 5.2 m/s (§24 walk speed 0.86 × 6): Trials Board 5 m, Gear Bench 8 m, keep-pond 8 m, Map Table 11 m, Shrine 12.8 m, Murk 14 m, the raft 25 m, the lower wall ≈ 12 m, the upper wall ≈ 26 m. Every station is within ≈ 5 s. **Tap-to-walk** (hub only): tap a station's glyph to auto-walk there (BFS on the tiny walk grid). `validate-data` runs §24's rules on `COVE.walk`: reachability, enclosure, and nothing above 1 m within 14 m south of any walkway (the quay's south edge is 21 m from the cliff at x −30; the portrait camera, 15.6 m behind the Wick, stays ≥ 5 m inside the ring).

#### 3.7.2 Stations, interactions and the screens they open

| station | interaction (one contextual pill, ≥ 56 px; E on desktop) | opens / does |
|---|---|---|
| **Map Table** | *Plan* | **Set Out** screen (replaces New Descent: First Outing card, then lake, Wick, night mode, tray, forecast, rumour, tackle rating). The chart of the selected lake shows discovered places, residents, Marked Fish, rumour "?" marks and your best fish per place. |
| **Raft** | *Board* / *Cast off* | after Set Out: board, then sail out under the arch past the chosen Waystone. "Set Out now" on the card auto-walks, boards and glides (≈ 6 s). |
| **Jetty** | cast (as in any lake) | **cove fishing**: one cove-only species, the **Quayling** (Small–Keeper only, a Journal entry, Memories only for its first catch, never sold), so the first cast and the first measuring moment happen at ≈ 0:20. Cast at the **test buoy** for a fixed-pull practice fight that shows your fitted tackle's tension band, drag preset and shock (no rewards). |
| **Murk's barge** | *Trade* | the existing **Shop** screen, minus the Gear tab: Sell · Bait · Supplies · **Murk's Ledger** (3 persistent requests) · Rumours · Cosmetics (post-game). |
| **Gear Bench** | *Tackle* | **Tackle** screen (built from the Shop's Gear tab): buy and fit Rod / Line / Reel / Creel tiers and the four outfit items, lures, proof-catch status, tackle rating per lake, drag preset (Reel T2+). |
| **Shrine** | *Shrine* | the existing **Shrine** screen (relics). The 3D lanterns mirror relic levels. |
| **Journal lectern** | *Journal* | the existing **Journal** (also on the HUD everywhere): field guide, size rulers, class seals, best setups, Elder Log, places, mount book. |
| **Trials Board** | *Trials* | the existing **Challenges** screen with tabs Fishing / Paths / The Measure / Gloom. |
| **The walls** | walk within 4 m of a wing | `wall` camera. Tap a frame: plaque (species, cm, kg, class, place, expedition, day, Wick; Elders show their name), *Swap* (another mounted fish of that species from the mount book) or *Empty*. |
| **Keep-pond** | walk to the rim | `pond` camera. Tap a fish: name card, *Release to the cove* (frees a slot; the record stays). |
| **Hearth** | *Rest* | Settings, save, swap to a dozing Wick (the same as choosing at the Map Table). |
| **Pause menu** | — | quick links to every station screen (accessibility and phone fast path), *Set Out*, *Title*. |

The **title screen** is now only the boot overlay ("Begin" / "Continue" / Settings) over a slow orbit of the cove. *Continue* resumes a saved expedition at its saved position, or drops you at the hearth.

#### 3.7.3 The Long Wall: one framed slot per species

Each of the four wings holds **one frame per non-legendary species of its lake** (11 / 11 / 12 / 12; the two Wanderers hang on the chimney breast). Every frame is a **painted ruler** for its species: width = 1.1 × the species' "said to reach" length, cm ticks, the Prize / Trophy / Elder bands in ink wash, the Old Ledger mark and a Wick-height silhouette (0.85 m). Until you name the species the frame shows a "?" ink silhouette; once named, its silhouette and name; once you bring one home, **your fish at true size** against the ruler. The frame's seal shows the best class mounted: an ink stamp (Prize), oxblood wax (Trophy), black wax with a ribbon (Elder), plus a gold thread for an **Ancient** (z ≥ 3.2).

| frame | used for species whose "said to reach" is | size | count |
|---|---|---|---|
| **specimen board** | ≤ 0.6 m | 1.2 × 0.6 m, up to 4 species of one lake | 1 per lake (+1 Wanderer) |
| **plaque** | 0.6–1.4 m | 0.7–1.5 m wide | 2–4 per lake |
| **arch** | 1.4–2.4 m | 1.5–2.6 m wide | 4–6 per lake |
| **great arch** | > 2.4 m | 3.3–4.1 m wide (Gilt-Eyed Eel, Wax-Bearer, Candlewake Sturgeon) | Pallid only |

Packing check (from `roster-v3.mjs`): each wing fits in 12 × 3.6 m as three rows with the largest frames lowest; the widest row is the Pallid's three great arches at 12.0 m. `validate-data` packs every wing from data. In hour 1 the specimen board and a plaque fill first, so the first Homecoming shows a small fish on a small frame, not a speck in an empty arch.

#### 3.7.4 How the Landing grows (visible, tied to progress, never bought except the pond)

| trigger | what changes in the cove |
|---|---|
| **start** | One lit hearth and two bollard lanterns. The Mossmere Waystone glows rust and moon-silver; the other three are dark. The **Mossmere wing** shows 11 "?" frames; the Sporewood wing is under lashed sailcloth; the upper stair is silted shut. The keep-pond is silted and dark. The Map Table shows only the Mossmere. The rod rack holds the Willow Switch. |
| **each species named** | its frame inks in the species' silhouette and name |
| **each fish hung** | it appears at true size against its ruler, with a small candle beneath it (instanced emissive), so the wall literally glows brighter as it fills; the seal upgrades with class; Elders get a hand-lettered name card |
| **a wing completed** (every species of that lake mounted at Prize or better) | the wing's lintel lights in the lake's colour; the lake's Journal perk activates (same rule as today's perks) |
| **first live Prize+ brought home** | the Wick pulls the silt-gate (a 3 s beat): the pond clears and its floor lamp lights. Pond tier 1 holds **3** fish. |
| **pond tiers** (the only Landing purchases) | Tier 2: **5** fish, 300 Shells, needs 15 species named; stone steps, a second floor lamp. Tier 3: **6** fish and r 4.0, 1,200 Shells, needs the Glasswater Waystone; a painted drowned-mosaic floor. Pond fish are capped at **1.4 m** (bigger fish go to the wall). |
| **each Waystone lit** | the stone glows its lake's colour (Mossmere rust #b0603e with moon-silver #a9b9f0, amber #ffb46a, sapphire #5cbcff, ember-gold #e8c66a); one more bollard lantern; a keepsake from that lake (a rust buoy-bell, a potted amber glowcap, a singing crystal on the Map Table, 30 candle-rafts drifting in the cove); and **that lake's wing opens** (Sporewood: the sailcloth drops; Glasswater: the upper stair is dug out and the Upper Gallery opens; Pallid: its sailcloth drops) |
| **each legendary brought home** | it hangs under the sea-gate arch (the Lantern-Swallower along the lintel). Rematch landings update its weight plaque. |
| **relic levels** | one drowned lantern relights per relic level |
| **tackle and outfit tiers** | the rod rack, line spools, reel and creel switch to the owned tier's model (the rod geometry from `actors-wick`, retinted and rescaled); boots and chimney glass hang on pegs; the Long Oars appear on the moored raft |
| **Wicks unlocked** | they doze around the hearth as ink silhouettes (one merged static mesh) |
| **Old Ledger records beaten** | your name is chalked over the old figures on Murk's tally board |
| **places discovered / mastered** | the Map Table's chart inks vignettes and stars |
| **Wardens silenced** (combat modes) | a keepsake for each on the hearth mantel (cosmetic only) |
| **the Lantern-Swallower landed** | the ember from its belly: a warm shaft opens through the cove ceiling (the game's one warm daylight). Every lamp burns gold, and the title card changes. |

About **150 visible changes over 25–40 hours** (48 frames that fill and upgrade, ≈ 60 lanterns, 4 legends, 4 wings opening, keepsakes, pond tiers). The home keeps growing until the collection is done.

#### 3.7.5 Look, inside the less-green palette

**"Lamplit slate, hearth amber, oxblood wax."** Slate-ink water and stone, bone-white ink trim, umber wood, rust iron. The hearth's amber (#ffb347) is the one warm light, the same rule as the lakes. Oxblood (#8a3a3a) is the accent: wax seals, Murk's awning, the raft pennant. The only saturated colours are the lit Waystones and completed wing lintels, which are earned. Green and teal: **only** verdigris on Murk's hand bell (≤ 2% chromatic weight, checked by the hue report on a Landing screenshot **that includes Murk's barge**).

| `COVE.palette` key | value | | `COVE.grade` | value |
|---|---|---|---|---|
| fog / fogDensity | #1d2230 / 0.014 | | exposure | 1.0 |
| water / waterDeep | #1a1f2c / #06080d | | bloom str / radius / thr | 0.9 / 0.6 / 0.7 |
| foam | #d8dce6 | | tint × amount | #3a3048 × 0.14 (ink-violet) |
| glow (hearth) | #ffb347 | | vignette | 0.42 |
| accent (oxblood) | #8a3a3a | | saturation | 0.82 |
| ambient / ink / far | #404659 / #04050a / #6d7894 | | grain | 0.05 |
| light (crack light) / lamp | #e2d6c4 / #ffd8a0 | | | |

**Old Murk is recoloured (A10, P1):** skin #4d5a3f → grey-umber #5a5444; moss #5f7d36 → pale lichen flecks #b8b0a0; lichen #b9c79a → #c8c0b0; lamp glow, halo and PointLight #8fd47a → warm white #ffe2b0; the tip "Sail to his green lamp" becomes "Sail to his lantern".

**Mood.** No day/night clock at the Landing: a fixed "lamplit hush" grade. After a snuff it opens in a grey-dawn grade for the summary, then eases back.

**Lights (≤ 4 PointLights, unchanged budget):** the Wick's lantern, Murk's lamp, the hearth (world accent 1), and a Waystone light (world accent 2, coloured like the lake selected at the Map Table). Bollard lanterns, frame candles, shrine lanterns and pond lamps are emissive plus `water.setLights` streaks (≤ 6).

**Cameras (render `MODES`):** `cove` (hub walk: elev 26°, dist 13.5, aimY 2.4, fov 50; portrait +7° and fov 60, as render already does), `gate` (within 6 m of the jetty head: elev 12°, dist 11, aimY 5, the whole arch, stones and legends), `wall` (elev 14°, dist 6, aimY at the frame row, fov 46), `hang` (Homecoming close-up, distance clamp(1.2 + 1.6·L, 1.6, 7) m with the Wick beside the frame, then a pull back to `wall`), `pond` (elev 55°, dist 6, aimY 0, fov 44), `setout` (elev 10°, dist 14, aimY 6, looking up at the arch during the glide), `title` (slow orbit). *Visibility check:* from the quay, `cove` puts the camera ≈ 8.9 m up and 12 m south of the Wick with the top of the frame 1° below horizontal, so at the arch (≈ 30 m ahead) you see up to y ≈ 8.4: the stones, the hung legends (y 3.5–7.5) and the lower wall's frames. The upper wall reads from the Lower Gallery; the full arch reads from the jetty (`gate`) and in every glide. A phone-portrait screenshot is part of the P3 gate (T4).

#### 3.7.6 How it is built cheaply (reuse table)

| need | reuse / build |
|---|---|
| the cove itself | `world.setZone('cove')` resolves a new `COVE` export in data.js: a zone's shape (arena, palette, grade, walk layout) that **is not in `ZONES`**. Every `zone:change` listener branches on `hub: true` (CONTRACT, §12) so nothing falls back to `ZONES[0]`. world-art's builders cover cliffs, parallax rings (3; 2 on low), stalactites, shafts, mist, particles and foam rings. The `shoreNotch` for the channel ships with the cove (P3). |
| quay, galleries, ramp, stair | the §24 walk-shape extrusion (land meshes extend down to y −2), the same code as the walking lakes, merged into 2 meshes |
| the two walls | one procedural merged geometry (wall slabs, buttresses, chimney stack), toon + outline: 2 calls. Frames: one merged mesh using a 1024² canvas atlas of painted rulers (silhouette, ticks, bands, seal): 1 call |
| sea-gate arch | **new** geometry from world-art's `taperTube` helper and the ink material (the Mossmere hero arch is a far, broken silhouette with towers 26 m apart and no crown, so it is not reused): 2 calls |
| Waystones | **new** small builder: 4 stones using the gate stones' geometry recipe, glyphs as vertex colours, and a per-stone emissive attribute driven by a 4-float uniform for lit state and colour (`buildGate` merges all glyphs into one zone-coloured material, so it cannot do per-stone colours): 2 calls |
| lamps, frame candles, shrine lanterns | dock lantern-post geometry and the raft lantern as InstancedMeshes: 3 calls |
| hearth | the raft brazier mesh at 2×, a flame sprite and the existing ember particles: 3 calls |
| bench, table, lectern, Trials Board, Murk's chalk board | models-kit box/plank builders, merged: 2 calls. The Map Table chart is its own material (512² canvas): +1 call |
| keep-pond | a §24 `hole` plus a stone torus rim, and **the pond pass** (Wa5): the global water shader discards fragments inside the pond disc (one `vec4 uPondHole`), a floor-painting disc sits at y −0.7 (1 call), the pond fish swim between (normal opaque meshes, depth-tested), and a small transparent pond-surface mesh with ripples, fresnel reflection and a depth tint draws after them (1 call, no depth write). Without this the opaque lake plane (renderOrder −10, depth-writing at y 0) would hide the fish. |
| pond fish | `models.createFish(species, {z})` at true length (≤ 1.4 m), swum by **actors** on looping paths inside the hole (uSwim 0.6). Up to 6 (2 live on low; the rest rest on the floor, baked into the mount batch, visible through the pond pass). |
| mounted fish | **`models.buildMountBatch(entries)`** (new): every mounted fish and legend is built from its stored {species, z}, frozen in a mounting pose and merged by material: body skins packed into one 1024² atlas (skins are 256×128, 32 slots; a second atlas page past 32), an emissive atlas for skins that glow, fins on the shared fin atlas with colour in vertex colours, one translucent material for jelly and ghost bodies, bones and their outline, eyes, one outline (per-fish thickness in a vertex attribute), and lure glows as one instanced quad mesh. **≈ 9–12 draw calls whatever the count.** LOD: ≤ 600 triangles per fish beyond 12 m. Rebuilt only on Homecoming or Swap. |
| Murk at home | `actors.merchant.arrive(dock, yaw, {instant:true})` plus a new `merchant.freeze()` that merges his static pack and barge (≈ 26 → ≈ 8 calls). Freeze also applies in the lakes whenever he is moored and the Wick is > 12 m away. |
| raft at the mooring | `actors.raft.freeze()` (≈ 4 calls) while the Wick is on foot |
| the Wick on foot | §24's foot controller, Lantern Crook, walk camera and occlusion cone. The Landing is the simplest possible consumer (flat, three levels, one ramp, one stair, one hole, no drops or bridges), so it is the ideal first integration target for §24's foot core. |
| dozing Wicks | `setCharacter` looks rendered once, merged into one static silhouette mesh (2 calls) |
| survival, combat | idle in the hub (no phase clock, no drains, no swarm) |

#### 3.7.7 Phone budget (measured by `tools/perf.mjs` scenario `cove`)

| item | high | low |
|---|---|---|
| post-processing | 15 | 10 |
| water + pond pass (floor disc, pond surface) | 4 | 4 |
| cliffs and parallax rings | 5 | 4 |
| stalactites, shafts | 3 | 2 |
| quay, galleries, ramp, stair | 2 | 2 |
| walls + frame atlas | 3 | 3 |
| sea-gate arch + Waystones | 4 | 4 |
| lamps, frame candles, shrine lanterns | 3 | 3 |
| hearth (brazier, flame, embers) | 3 | 2 |
| bench, table, lectern, boards + Map Table chart | 3 | 3 |
| lake keepsakes (bell, glowcap, crystal, candle-rafts) | 4 | 3 |
| mantel keepsakes | 1 | 1 |
| dozing Wicks | 2 | 2 |
| particles (mist, motes, foam rings) | 3 | 2 |
| Wick on foot + lantern pool | 15 | 15 |
| moored raft (frozen) | 4 | 4 |
| Murk and barge (frozen) | 8 | 8 |
| mount batch (walls + legends) | 12 | 9 |
| pond fish (6 live high; 2 live low) | 36 when in view | 12 |
| **total (worst case: pond, lower wall and arch in one view)** | **≈ 130 (budget 140)** | **≈ 93 (budget 100)** |
| PointLights | 4 | 4 |
| zone build time | ≤ 150 ms desktop / ≤ 600 ms phone, hidden by the zone flash | |

**Fallback** (only if §24's foot core slips past the start of P3): *Landing v0*. The Wick stays on the raft, every station sits on the water's edge, and you sail up to each one (the same pills). The layout and every asset are identical, so v0 becomes the walking cove with no rework once §24 lands.

### 3.8 Homecoming

1. The raft glides in under the arch (2 s, `setout` camera reversed) and moors (2 s). Skippable at any point to step 4.
2. **Each marked fish**, biggest first: *Hang* (its species' frame; it replaces the mounted fish only if longer or of a higher class, otherwise the game asks), *Keep-pond* (≤ 1.4 m, if a slot is free) or *Sell*. Hanging plays the `hang` close-up (the Wick stands beside the frame, an iron-hook clink, a candle lights, then the pull back to the whole wing). The first time a species is brought home at a class (hung or kept in the pond): Prize +2 / Trophy +6 / Elder +15 Memories. Legendaries always hang under the arch.
3. Murk buys the rest of the creel at standard price (shown).
4. **Summary card**: days, nights, fish landed, PBs, class firsts, places, the tally lines, Marked Fish created, and one "next goal" line (e.g. "Line T2 needs a Mossmere Prize: done. 450 Shells."). Then you are free to walk, fish from the jetty, or try new tackle on the test buoy.

### 3.9 The Long Descent (prestige mode)

| rule | value |
|---|---|
| unlock | all four Waystones lit |
| shape | **today's game**: Gloomtide every night, start in the Mossmere, descend through each gate, land the Lantern-Swallower to win. No return home except victory or snuff. Today's phases (calm 120, dusk 14, night 90 + 6/day, dawn 8), today's Heat and `difficultyFor`, no Far Water. |
| purse | its own: starts at **20 Shells** (`BALANCE.economy.startShells`). Shells earned in the descent stay in it; persistent Shells neither enter nor leave. |
| tackle | today's per-run UPGRADES catalogue from Murk (twig rod start). Persistent tackle and outfit are ignored (open question 2). |
| fish | marked fish and mounts are off, except that a victorious run brings the Lantern-Swallower home on a gilded chain |
| what still counts | Journal, records, class seals, Elder Log, places, challenges, Memories (today's `memoriesFor` plus discoveries) |
| rewards | +200 Memories on the first win, the *Ashen Cloak* cosmetic for every Wick, a gilded fifth stone rising in the sea-gate, and its own records board (fewest days, deepest snuff) at the Trials Board |

---

## 4. Combat's place

### 4.1 Three night modes, chosen per expedition at the Map Table (from the 2nd expedition)

The phase stays `gloomtide` internally, so gloom-time species, music and fishing rules keep working. The UI calls a quiet night a **Stillnight**. Modes cannot be switched mid-expedition (otherwise players would flip to Still while carrying a trophy). The First Outing is always all-still.

| | **Still** | **Lantern** (default) | **Gloomtide** (classic) |
|---|---|---|---|
| swarm nights | none | even nights (2, 4, 6…); Murk forecasts it at dawn: "The Gloom stirs tonight." | every night |
| swarm window | 0 | **night k 0.05 → 0.50** (40.5 s). The last 45 s of every night are always quiet: Night Rise and glow trails, uninterrupted. | the whole night (90 s + 6 s per day, max 120), as now |
| intensity vs `difficultyFor()` | — | spawnRate × 0.55, hpMult × 0.8, maxAlive × 0.6, elite interval × 2 (first elite at Heat ≥ 3), 1 formation per swarm | × 1.0 (DESIGN §7) |
| Wardens | none | every 2nd swarm night (nights 4, 8) at hp × 0.75; it withdraws when the window closes | nights 3, 6, 9, as now |
| what the swarm threatens | — | **your light and your unmarked fish, never a fight in progress**: fodder contact drains oil (not Embers); a creelsnatch takes one *unmarked* fish and **never acts while a fish is hooked**; a hand slam costs Embers and knockback but **never snaps the line**; Embers are lost only to telegraphed hits | Embers first (today's death model), then oil and the creel; slams snap non-legendary lines, as now |
| Embers reach 0 | — | **Scorched**, never Snuffed: the swarm withdraws for the night, the lantern loses 30 oil, you keep a forced lamp-watch until dawn (anchored within 10 m of where you stand; fishing allowed; no Cinders), Embers mend at dawn | Snuffed, as now |
| night fishing | the full 90 s, with Night Rise | 4.5 s before the window, inside it (spawn × 0.8 while hooked, as now) and 45 s after | inside the swarm, as now |
| calm raids (day combat) | off | off | on, as now |
| Embers lost per swarm night (on-curve) | — | 0–1 | DESIGN §18.4 table |
| snuffed per expedition (target) | ≤ 3% home by day 3; 6–10% past day 4 | Still + 2 points | 25–55% (first 5 h), 20–35% later |
| fight share of play | 0% | ≈ 6% (target 4–7%) | ≈ 29% (target 28–32%) |

### 4.2 Lamp-watch: the in-world skip

(Renamed from "vigil" so it does not clash with §24's *vigil grounds*, which are where you fight.) At the moment dusk ends, if the Wick is **inside one of the lake's two watch-lamps' pools**, that night's swarm does not come. The Mossmere's watch-lamps are the buoy-lamps at the south-east and west docks; in the other lakes the §24 owner flags two Waylamps per lake `watch` (▲). You may fish only within 10 m of the lamp (Night Rise still applies), and you earn no Cinders. The cost is the location: the night's giants are where they are, and you are pinned to two spots per lake. Lantern mode only; Gloomtide ignores lamp-watch. Every other Waylamp keeps §24's rules exactly (shelter from darkness, slower fodder, never a safe night). The HUD shows "Nearest watch-lamp 34 m · ≈ 7 s" from Murk's 85% bell (§24.8's dusk line, reused).

### 4.3 The hard rule

> **No species, place, size class, favour (μ) or fishing tool exists only with combat on.**

- **Cut:** Gloom-fed (structure's best-of-2 weight roll) and Ashwick's best-of-3.
- **Levels are normalised** across modes (§4.4), Angler-tagged offers are capped at the Still rate in combat modes, and Kindling Draft levels may only take non-Angler offers (§3.2).
- **Combat pays in combat-shaped things only:** Cinders and levels, +4 tally Memories per Lantern swarm night endured (Gloomtide: today's `nightsSurvived × (3 + zoneIndex)`), Wardens (Heartwax, Warden's Gift, Shells 40 / 80 / 140 / 220, Gloom-shelf relic reveals), Gloom-tab challenges (combat boons, Gloom relics, cosmetics: cloak dyes, raft pennants, Warden keepsakes on the Landing's mantel). The tally difference keeps Still's Memories/h within 15% of Lantern's (§9.4).
- **Murk's Ledger** offers combat requests only in combat modes.

### 4.4 Levels and Boons in each mode

| | Still | Lantern | Gloomtide |
|---|---|---|---|
| XP sources | fish XP × 1.4 with **no zone factor**; discoveries +2 per new species, +4 per new place, +2 per class first (≤ +12 per day) | fish XP × 1.0 (zone factor kept), Cinders on swarm nights, the same discoveries | as now (Cinders, fish XP × 1), the same discoveries |
| level-ups per day of an expedition | ≈ 3 · 2 · 1 · 1 on days 1–4 (Mossmere: 5 fish ≈ 29 XP a day against `xpForLevel` 5, 7.9, 11.4, 15.5, 20.2 …) | ≈ 3 · 2.5 · 1.5 · 2 (swarm nights add Cinders) | today's cadence |
| when offered | banked: on the next measuring card or at the dawn bell | banked while fishing; immediate during a swarm | as Lantern |
| offer pool | Angler pool and non-combat passives only | weapons join from the first swarm night; Angler-tagged offers capped at the Still rate | today's pool, same cap |
| Kindles | — | yes | yes |

**Angler pool** = Steady Reel, Hungry Waters, Lucky Knot, Gutsfire, Lantern on the Line, Gilded Hook, Swift Oars, Slow Burn, Brighter Wick, plus 6 new: **Long Cast** (castMax +1.5 per level), **Patient Line** (slack grace +0.2 s), **Feather Touch** (hook window +0.06), **Night Eyes** (glow trails visible 50% farther; night bite speed +10%), **Wanderer's Stride** (stride +0.3; foot oil burn −10%), **Quiet Hands** (the Clean Cast window widens from charge ≥ 0.92 to ≥ 0.88). No boon adds favour directly or opens a place.

### 4.5 Wick quirks get a fishing half (all modes)

| Wick | unlock (either-path) | fishing half (new) | combat half (combat modes, unchanged) |
|---|---|---|---|
| The Wick | free | *Curious*: places reveal from 16 m (not 8); the first new species each day gives +1 reroll | first level-up of each night offers 4 cards |
| Taper | Steady Hands (land 25 fish) | *Angler's Ember*: fish give double XP (as now) | flare cooldown refund (as now) |
| Stub | Down the Sluice (light the Sporewood Waystone) | *Quick Feet*: stride +0.4; a cast within 5 s of stopping counts as Clean at charge ≥ 0.8 | Fanned Flame |
| Tallow | The Long Vigil: **spend 5 nights out in one expedition** (any mode) | *Slow Melt*: oil burn × 0.8 on foot | i-frames, Gutter-burst |
| Ashwick | Unwarded: **silence a Warden or land 3 night-only species at Prize or better** | *Burned Once*: the first surge of every fight is telegraphed 0.3 s longer | Cinder Heart |
| The Wayfarer (§24) | Every Still Place: master every place in the three lower lakes (21) | *Shore Sense*: on foot, signs show from 50% farther; the first Waylamp lit in each lake costs no oil (§24's First Flame) | §24's start boon (Undertow Crook) |

### 4.6 Legend fights without a swarm

In Still and Lantern, the Glass Sovereign's night fight runs without spawns, and the Lantern-Swallower's *Grasping Dark* becomes **two telegraphed snags**: a hand silhouette rises under the water 1 s ahead, then a +0.2 tension spike; release through it as you would a surge. In Gloomtide both fights are unchanged.

### 4.7 The day screen carries no combat UI

| element | Still | Lantern | Gloomtide |
|---|---|---|---|
| lantern-aura ring | never | hidden in calm and dawn; fades in through dusk on swarm nights only | hidden in calm and dawn except during calm raids; on from dusk |
| Embers arc | hidden | shown from dusk on swarm nights, or for 4 s after any hit | always |
| Flare button | hidden | shown from dusk on swarm nights | always |
| Burn button | shown only when oil < 25% (as *Relight*) | same, plus during swarms | always |
| satiety bar | replaced by a small **Well-fed** glyph | same | same |

### 4.8 The default: Lantern from the 2nd expedition, under four conditions

1. **The First Outing is all still**, so a new player's first ≈ 16 minutes are pure fishing, places and the first Homecoming.
2. **Still is offered without stigma**: an equal card on Set Out with a one-line explanation, no fishing penalty, and Memories within 15%.
3. **Lamp-watch is an in-world skip** (§4.2).
4. **In Lantern, combat never costs a hooked fish or the expedition**: no line snaps, no theft while hooked, Scorched instead of Snuffed, and the last 45 s of every night are quiet.

If playtests show players opting out in droves, flip the default to Still (open question 1). It is one data constant.

---

## 5. Fishing craft

### 5.1 Reading the water: six signs and the float's favour

The **feeding-spot mote columns are cut** (in the screenshots they turn reading the water into "sail to the pillar" and add teal pillars). In their place, a single vocabulary of **six signs**, each with a fixed meaning. At most 6 are alive at once, built from pooled decals plus the existing ripple and wake arrays: no new uniform arrays, no lights.

| sign | looks and sounds like | tells you | cast rule | effect |
|---|---|---|---|---|
| **Rise ring** | rings every 4–9 s; **ring radius ∝ the fish's length**; a "plip" (small) or deep "gulp" (big) | a surface feeder, and its class from the ring size | land within 2.5 m, ≤ 3 s after a rise | wait × 0.5; that pre-rolled fish bites |
| **Boil** | a dark back turns the surface; ellipse size = class (Prize / Trophy / Elder); a low "glunk" | **one big fish** (a pre-rolled Prize+, or a place's resident) | within 3 m in the next 8 s | that fish bites with 60% chance |
| **Nervous water** | fry skitter out of a patch | a predator under a bait ball | at the patch edge | predators × 3, favour +0.3 |
| **Strike splash** | one heavy slap, heard off-screen and panned | a big runner or leaper just fed | within 4 m in the next 10 s | favour +0.6, predators × 3 |
| **Bubble trail** | strings of bubbles creeping along the bottom | a bottom feeder or sulker (P4: also leads to secrets) | at the head of the trail | bottom feeders × 2, favour +0.2 |
| **Glow trail** *(night only)* | a moving light under the surface; brightness ∝ size | a pre-rolled night fish | lead it by 1–3 m | that fish bites 70% |

- **Spawn:** 2–4 signs alive in calm (the same slots, counts and lifetimes as `BALANCE.spots`), within castMax + 15 m of the Wick, favouring places (≥ 50% inside place water in the walking lakes).
- **Visible shadows** stay special: inside `sight` places, in Glasswater's clear water, and as residents surfacing. Blind casting while reading signs is the main mode; there is no approach shadow before every bite.
- **The Pallid Deep** keeps the Breathing Deep domes (§24) as its sign style. **Legend pools** keep the faint still ring and the edge marker; the tall golden column becomes a low gold glimmer.
- **Murk's Chum** (supply, replaces the Tide Chart): 30 Shells × supplyMult, 1 per visit. Your next cast creates a nervous-water sign for 30 s.

**The float's favour (U13, P1).** The size odds the player is meant to master are shown, not hidden. When the bobber settles, the float icon shows **0–5 ink notches** for the current favour μ (bands < 0.15 · 0.15–0.45 · 0.45–0.8 · 0.8–1.2 · 1.2–1.6 · ≥ 1.6). Long-press (or hover) lists the active favours by family in plain words: "*Place: Astir · Hour: Night Rise, Far Water · Match: today's rumour · Tackle: Ember Roe, deep band.*" When a place's pressure reaches −0.36 (three catches there today) the float shows a dimmed glyph and the line "*The water here has gone quiet.*" The **measuring card prints the favours that applied** to that fish, and each species' Journal field note stores **your best setup** (the favours present when you set its PB). `fishing.view.favour = {mu, notches, terms: [{family, id, value}]}`. The families and values are in §6.1.

### 5.2 Casting (kept)

The ping-pong meter (charge = distance), the depth reticle, the Clean Cast (charge ≥ 0.92: wait × 0.85, rarity +0.05, favour +0.1) and §24's pool-scaled meter, aim assist and locks are all unchanged. Pointer-target scatter casting and count-down sink rigs are **cut**.

### 5.3 Bait and lures

- **Baits** stay consumables (existing BAITS, attract lists and legend baits). One addition: **Cut Strip**. In the creel screen, turn any fish into 3 strips; predators: attract × 2, favour +0.3. This gives "catch small to catch big" without a new system.
- **Lures** are permanent tackle. You equip a lure *or* a bait. A snap loses the lure, and a new one costs 25% of its price. Each species gets **one** `family` tag (insect / predator / bottom / glow), read only by lures.

| lure | depth | family attract | favour | price | sold from |
|---|---|---|---|---|---|
| Feather Fly | surface | insect × 2; rise-ring casts get wait × 0.5 | — | 40 | start |
| Glimmer Spoon (was an upgrade) | mid | predator × 2.5 | +0.2 on predators | 90 | start |
| Bone Jig | bottom | bottom × 2.5 | +0.2 on bottom feeders | 120 | start |
| Moth Popper | surface | night species × 2 | +0.2 at night | 260 | Sporewood lit |
| Lantern Lure | mid–deep | glow × 2.5 | +0.4 | 1,200 | Glasswater lit |

### 5.4 The bite and the hook

| class | bite tell (bobber animation + sound, readable with sound off) |
|---|---|
| Small | quick **double pop** |
| Keeper | the classic plunge (as now) |
| Prize | a slow 0.4 s **drag-under** before the "!" |
| Trophy | the bobber **lies flat**, then slides away |
| Elder | a **dome of water bulges up** under the bobber first |

- **Let it pass:** if the bite window lapses with no tap, the bait is kept and the next cast in the same water gets favour +0.15 (cap +0.3, reset on a hook or after 60 s). It turns the bite tell into a decision without slowing ordinary play.
- **Window:** Prize+ fish hold the bait 10% longer. The perfect-hook rule (≤ 0.4 × window) is unchanged; the Rod's hook-window multiplier widens it.
- **Hook-hold pips** (Prize+ only, shown on the hook icon): a perfect hook gives 3, a normal hook 2, and Rod T3+ adds +1. A pip is lost each time tension drops below 0.15 during a surge or leap. At 0 the hook is thrown. The existing slack escape stays. The pips make "almost had it" visible and fair.
- Nibbles, gold double-dip tells, feints and the spook rule are unchanged.

### 5.5 The fight

**Size scales the species before `createReel`** (the reel core is unchanged). With g = e^(0.2·z):

| class (z used in the sim) | g | power × g^1.6 (sinkers, sulkers g^1.15) | stamina | surge time × √g | sweet band × g^−0.5 | erratic + 0.08·z | surge interval × g^−0.6 |
|---|---|---|---|---|---|---|---|
| Small (−0.8) | 0.85 | 0.77 | × g = 0.85 | 0.92 | 1.08 | 0 | 1.10 |
| Keeper (0.4) | 1.08 | 1.14 | 1.08 | 1.04 | 0.96 | 0.03 | 0.95 |
| Prize (1.4) | 1.32 | 1.57 | 1.32 | 1.15 | 0.87 | 0.11 | 0.85 |
| Trophy (2.2) | 1.55 | 2.02 | 1.55 | 1.25 | 0.80 | 0.18 | 0.77 |
| **Elder** (2.95) | 1.80 | **× 1.08 × g^(1.6 + age·(z − 2.65))** | **× g^1.3** = 2.15 | 1.34 | 0.75 | 0.24 | 0.70 |
| **Ancient** (3.35) | 1.95 | (same rule) | × g^1.3 = 2.39 | 1.40 | 0.72 | 0.27 | 0.67 |

**Above the Elder cut, fights get steeper and every Elder has one old trick.**
- *Elder age* is per lake: Mossmere 1.2 · Sporewood 0.9 · Glasswater 0.7 · Pallid Deep 0.35. Old water keeps its oldest fish hard: an early lake's Elders need late tackle, and a deep lake's Elders are already hard by species.
- *Fatigue clock* (all non-legendaries): after 60 s, power × max(0.6, 1 − 0.01·(t − 60)). For Elders the floor is **0.8**, so an Elder never simply gives up.
- *Old trick* (every Elder, once, when progress first passes 55%): a short-warning surge (warning × 0.6, power × 1.3) whose kind the player must read, followed 0.9 s later by a second surge. Each species' style dresses it: a **double run** (runners, darters), a **sulk under the place's feature** (sinkers, sulkers; at the Gatehouse Door and the Chain Garden a foul window), a **second leap after the reveal** (leapers), a **head-down bore** (thrashers, steady).

**Reel-model edits (fishing-reel.js, S):** global stamina × 1.4 (fights were 5–10 s, too short to have an arc; legends too); easing uses load, `target = −0.55 / (0.8 + 0.2·pw/LS)`, so a better line really lets you ease a big fish; the fatigue clock above. Fight lengths on full tackle (sim, skilled): Trophies 20–40 s, Elders ≈ 1–2 min, Ancients ≈ 3 min, the longest non-legend fights in the game (T1 targets: Elder median ≤ 120 s, Ancient ≤ 180 s on a phone, tuned by the stamina exponent above the cut). **Leap reveal:** the first breach of a Prize+ fish plays 0.25 s at timescale 0.35 with a rim-light flash; the size of what you have hooked is revealed there.

**Fight styles, one new verb per lake.** Hold-to-reel stays the only core input. Nothing is added mid-fight in the Mossmere.

| lake | styles in play | what is new | phase |
|---|---|---|---|
| The Mossmere | steady, darter, sinker, thrasher, leaper (all existing) | size scaling, bite tells, pips, old tricks; the **fouled line** at the Gatehouse Door (§24's existing `foul` rule: a clank 0.3 s before a +0.15 tension spike; release through it as you would a surge) | P1–P2 |
| Sporewood Pools | + **runner** (Velvet Ray, Pilgrim Salmon) | *let it run*: a 0.8 s line-hiss tell, then a run of surgeTime × 2√g. Holding drives T × 1.8 into drag slip; releasing loses progress at 0.05·pw/LS per s; after the run, 2 s of × 1.5 progress ("it turns"). Simulated in `tools/sim/reel.mjs` first. | **P3, never cut** |
| Glasswater Vault | + **sulker** (Blind Scrivener, The Footnote) | *pump*: every 10–14 s a 4–6 s × √g sulk (the line goes still, a low thud, a ◆ glyph). Holding gains nothing and T creeps +0.3·pw/LS; release ≥ 0.3 s then hold, and each lift gives +0.04·RS/√g progress. | P4 |
| The Pallid Deep | heavy runners (Candlewake Sturgeon), heavy sulkers (Lampwarden, Unpaid Fare), fouled lines at the Chain Garden, toll cues | combinations, not new inputs | P4 |

**Drag** is a tackle setting, never a dial. Reel T0–T1 is fixed at *Set*. From T2, choose **Light / Set / Firm** (dragAt 0.70 / 0.80 / 0.90) at the bench, or tap the reel icon before casting (one tap cycles). Light makes runners safe but slow; Firm is fast but risky.

**Cut from the panel:** the mid-fight drag dial, rod sweep on the joystick, divers and snags (they need world tags and a simulated fish position), the cut-line button (cutting stays "hold movement 0.6 s"), the net ring QTE, the thrasher head-shake.

### 5.6 Gear: tackle tiers and outfit (persistent, bought and fitted at the Gear Bench)

Tackle is sold **per slot**, so a tackle or outfit purchase lands every ≈ 15–90 minutes (§9.2). Tiers are kept forever. **T2–T4 need a proof catch.** Gear is earned by fishing, not grinding. `reel-v3-sim.mjs` simulates any mixed loadout; the numbers below are matched sets unless stated.

| tier | **Rod** (castMax · hook window · slack grace · **shock** · pips) | **Line** (strength) | **Reel** (reelSpeed · sweet band · drag · absorb) | **Creel** (slots · Live Well slots · nights kept) | price per slot (Rod / Line / Reel · Creel) | proof catch | on sale |
|---|---|---|---|---|---|---|---|
| T0 | Willow Switch 16 · ×1.00 · 1.4 s · 0 · — | Twine 1.00 | Wooden Winch 1.00 · .16 · fixed Set · .30 | Wicker 4 · 1 · 3 | start | — | — |
| T1 | Ashwood 17.5 · ×1.04 · 1.6 s · .08 · — | Braided Gut 1.15 | Brass Spool 1.12 · .17 · fixed Set · .45 | Lidded 5 · 1 · 3 | 120 · 70 | — | start |
| T2 | Whalebone 19 · ×1.08 · 1.8 s · .15 · — | Waxed Silk 1.32 | Clockwork 1.25 · .18 · presets · .58 | Double 6 · 2 · 4 | 450 · 270 | any **Mossmere Prize** | start |
| T3 | Glassreed 20.5 · ×1.12 · 2.0 s · .22 · +1 pip | **Glass-Gut** 1.52 (invisible in clear water) | Whisper Drag 1.40 · .19 · presets · .68 | Wellbox 7 · 2 · 4 | 1,400 · 840 | a **Sporewood Trophy** or a **Glasswater Prize** | Sporewood lit |
| T4 | Lantern-Spine 22 · ×1.16 · 2.2 s · .30 · +1 pip | Silverthread 1.75 (+0.2 s slack) | Tidewheel 1.55 · .20 · presets · .76 | Ferry Hamper 8 · 3 · 5 | 3,200 · 1,920 | a **Glasswater Trophy** | Glasswater lit |

*Shock* is the Rod's surge absorb (`surgeHoldMult × (1 − shock)`). *Nights kept* is the Live Well clock (§3.4).

**Outfit** (the four all-mode per-run upgrades, now persistent; no proof catch):

| item | per level | prices (levels I / II / III) | on sale |
|---|---|---|---|
| Thick-Glass Chimney | max oil +15, oil burn −5% | 80 / 240 / 600 | start |
| Rendering Brazier | oil and food from rendering and eating +10% | 80 / 240 / 600 | start |
| Long Oars | raft speed +0.5, pickup radius +0.5 | 80 / 240 / 600 | start |
| Cork-Soled Boots | stride +0.35 m/s on foot (§24) | 80 / 240 / 600 | Sporewood lit |

- **Catalogues:** tackle 18,610 Shells (Rod, Line and Reel 5,170 each, Creel 3,100); outfit 3,680; lures 1,710.
- **Clear water (Glasswater):** lines below Glass-Gut get wait × 1.12 and favour −0.1, so the clear lake asks for its own line.
- The creel range (4–8 slots) equals today's per-run Woven Creel range, so persistence adds no carrying power to Gloomtide.

**Tackle rating** (shown on the Gear Bench and the Set Out card): for your *fitted* set, the largest class a skilled player lands ≥ 50% of the time against the lake's **reference species** (Reedjaw Pike · Mildew Angler · Mirror Pike · Gilt-Eyed Eel), plus the land rate of the next class (from `--gate --k 400`; Glasswater T3 sits on the 50% line and reads Elder in some seeds). A generated table (`BALANCE.tackleRating`, 125 loadouts × 4 lakes, written by `tools/sim/reel.mjs`) holds mixed loadouts.

| matched set | Mossmere | Sporewood | Glasswater | Pallid Deep |
|---|---|---|---|---|
| T0 | Trophy (Elder 0%) | Prize (Trophy 20%) | Keeper (Prize 42%) | Keeper (Prize 39%) |
| T1 | Trophy (Elder 0%) | Prize (Trophy 46%) | Prize (Trophy 40%) | Prize (Trophy 27%) |
| T2 | Trophy (Elder 15%) | Trophy (Elder 12%) | Trophy (Elder 11%) | Trophy (Elder 2%) |
| T3 | Elder (55%) | Elder (51%) | Trophy (Elder 49%) | Trophy (Elder 37%) |
| T4 | Elder (82%) | Elder (75%) | Elder (79%) | Elder (69%) |

**The gear gate is real** (`reel-v3-sim.mjs --gate --k 400`, skilled; Prize / Trophy / Elder / Ancient land %):

| reference species | T0 | T1 | T2 | T3 | T4 |
|---|---|---|---|---|---|
| Reedjaw Pike (Mossmere) | 77/52/0/0 | 89/76/0/0 | 94/87/15/0 | 100/99/55/0 | 100/100/82/44 |
| Mildew Angler (Sporewood) | 56/20/0/0 | 61/46/0/0 | 77/58/12/0 | 99/88/51/0 | 100/94/75/51 |
| Mirror Pike (Glasswater) | 42/14/0/0 | 70/40/0/0 | 85/72/11/0 | 98/94/49/0 | 100/98/79/46 |
| Gilt-Eyed Eel (Pallid Deep) | 39/3/0/0 | 68/27/0/0 | 85/66/2/0 | 96/92/37/0 | 100/98/69/43 |

Full tackle lands headline Elders **69–82%** and Ancients **43–51%** (the Mossmere's 82% sits 2 points over the 65–80% target band, inside the sim's ±2.5% at k 400; T1 re-checks it once each Elder's real old trick is simulated). Not every species is this hard: commons and uncommons are landable as Elders on their own lake's tackle (Mossmere commons on T1: 64 / 84 / 89% novice / skilled / expert), which is where most first Elders come from. The **return trip** is real: with full tackle, the Mossmere's Elder Reedjaw is still a one-in-five loss and its Ancients a coin flip.

**Legendaries** (authored fights; novice / skilled / expert):

| legend | T0 | T1 | T2 | T3 | T4 | notes |
|---|---|---|---|---|---|---|
| The Belled Matriarch | 56/82/85 | 84/90/91 | 99/100/100 | 100 | 100 | fair on starter tackle |
| The Drifting Grove | 31/76/89 | 64/87/95 | 84/94/97 | 97/98/99 | 100 | |
| The Glass Sovereign | 4/47/74 | 20/64/86 | 38/80/93 | 85/98/99 | 100 | |
| The Lantern-Swallower | 0 | 0 | 0 | 0/14/50 | 27/83/98 | T3 Rod and Reel + **Line T4**: 5/41/78 · + Reel T4: 20/77/97 |

### 5.7 Failure that teaches

| failure | readable cause | what you see |
|---|---|---|
| Snapped | T ≥ 1.0 for 0.12 s (as now) | the line whips, the lure is lost |
| Thrown hook | pips reach 0, or slack longer than the grace | the hook flies back with a glint |
| Spooled | progress reaches 0 during a runner's run with the drag slipping | the reel screams empty |
| Fouled | a chain wrap during a foul window (Gatehouse Door, Chain Garden) | the line goes dead, then parts |

- **Near-miss card** (always, for Prize+): silhouette, estimated class and length (±8%), % landed, cause, the tackle rating here, one tip. Example: "Reedjaw Pike · Trophy · ~108 cm. Snapped at 84%. Your tackle is rated Trophy here (Elders 0%). Let go on the hiss."
- **Marked Fish ("still out there")**: an escaped **Trophy+** fish keeps its z and lives at the place it escaped from, behaving like a resident there (§7.0; it replaces that place's resident if there is one), with a hook-glint on its shows. Its next fight starts at `min(0.3, 0.5 × P_escape)` (the legendary `wounded` rule, reused). Up to **6** persist in meta; the Map Table marks them.

### 5.8 Landing and measuring: the signature beat

| t | beat (Small/Keeper ≈ 1.2 s, tap to skip · Prize ≈ 2.4 s · Trophy ≈ 3.5 s · Elder ≈ 5 s, skippable after 0.6 s) |
|---|---|
| 0.0–0.6 s | **scoop**: a water sheet and a splash at true scale; the `trophy` camera eases in to `clamp(1.2 + 1.6·L, 1.6, 16)` m and frames fish and Wick against the place's landmark |
| 0.6–1.4 s | **pose by length** (the Wick is 0.85 m): **Palm** < 0.25 m (cupped, close-up) · **Arms** 0.25–0.85 m (held up, as now) · **Hang** 0.85–2.0 m (head-up from the rod tip) · **Alongside** > 2.0 m and every legendary (it lies beside the raft or pier while the Wick walks its length; above 4 m the camera cranes to 50°) |
| 1.4–2.8 s | **the knotted cord** unrolls along the fish. The centimetres tick up with rising pitch, a chime rings as the count crosses each class threshold, and the **seal stamps**: Prize = a bone-white **ink stamp** of a knotted cord · Trophy = an **oxblood wax seal** · Elder = a **black wax seal with a ribbon** (Ancient: a gold thread), and the fish gets a name ("Old Ninefin", from per-species syllable tables) |
| at the stamp | **records are written** (PB, class first, place record, Old Ledger, Elder Log, best setup): never lost after this instant |
| 2.8–3.6 s | banners: "New best: 112 cm (was 97)" · "First Trophy Reedjaw" · "Old Ledger beaten" (Murk's bell rings across the lake) |
| card | the favours that applied (§5.1) · **Keep** (Prize+: a "Mark for home" ribbon toggle; needs a free Live Well slot, shows its nights) · **Eat** · **Render** · **Release** (+luck, as now; the first release of a species at Prize / Trophy / Elder banks +1 / +3 / +8 Memories) · a banked Boon pick if one is waiting. Cut Strip lives in the creel screen. |

P4 adds the **postcard catch card**: the ui-fishart plate painted over a silhouette strip of the place's landmark.

### 5.9 Target land rates (hooked fish)

Lake columns are the sim's averages for that lake's *rare* species (novice / skilled / expert), today's 32-species data, on the lake's curve tackle T(i + 1) unless stated.

| class | target | Mossmere T1 | Sporewood T2 | Glasswater T3 |
|---|---|---|---|---|
| Small and Keeper, commons | **≥ 97** / 99 / 100 | 100/100/100 | 100/100/100 | 100/100/100 |
| Keeper, rares | 85 / 95 / 99 | 97/97/99 | 99/100/100 | 98/100/98 |
| Prize | 70 / 90 / 97 | 77/93/95 | 88/87/91 | 92/91/94 |
| Trophy | 45 / 75 / 90 | 50/89/92 | 77/74/76 | 72/85/88 |
| Elder on curve tackle | **0–15 / 15–35 / 25–45** | 2/21/23 | 13/29/41 | 0/14/29 |
| Elder on arrival tackle T(i) | ≈ 0–10 (a wall: it becomes a Marked Fish) | T0: 0/14/21 | T1: 0/9/13 | T2: 0/0/0 |
| Elder on T4, reference species, skilled | **65–80** | 82 | 75 | 79 (Pallid: 69) |
| Ancient on T4, reference species, skilled | **40–55** | 44 | 51 | 46 (Pallid: 43) |

Known gaps (the sim says so): Keeper rares are too easy for novices until the runner (P3) and sulker (P4) land; the Blind Scrivener's Elder (33% on T4) and the Lampwarden (capped at Trophy, 65% on T4) are retuned when the sulker is simulated. Runner and sulker are added to `tools/sim/reel.mjs` **before** their code.

---

## 6. Species and the size system

### 6.1 One size model

On the bite, roll a **size score** `z ~ Normal(μ, 1)`, truncated to [−2.0, 3.6]. Then:

```
length L = L50 · e^(σ·z + 0.06·max(0, z − 1.04)²)     σ = the species' length spread (0.09 … 0.175)
weight W = k · L³                                     (k per body shape, so weight has the long tail)
class    = z < −0.25 Small · < 1.04 Keeper · < 1.88 Prize · < 2.65 Trophy · ≥ 2.65 Elder   (Ancient: an Elder with z ≥ 3.2)
```

The squared term **stretches the top of the curve**, so big fish look big: an Elder (z 3.0) is **1.6–2.0× the length of a typical Keeper** (z 0.4) for every species, and the "said to reach" ceiling (z 3.6) is 2.0–2.8× the median. Classes are cut on **z**, so a class means the same rarity on every species. **One ladder everywhere** (data, UI, Murk's lines, challenges): **Small · Keeper · Prize · Trophy · Elder.** An Elder always gets a name; an Ancient is an Elder with a gold thread on its seal, not a sixth rung.

| μ | Small | Keeper | Prize | Trophy | Elder* | (of which Ancient) | what it looks like |
|---|---|---|---|---|---|---|---|
| 0 | 38.7% | 46.0 | 12.2 | 2.7 | 0.4 | 0.1 | blind casting in open water |
| 0.5 | 22.2 | 48.2 | 21.2 | 6.9 | 1.5 | 0.3 | a place at dusk with the right bait |
| 1.0 | 10.5 | 41.3 | 29.6 | 14.1 | 4.5 | 0.9 | right place, right window, right lure |
| 1.5 | 4.1 | 28.8 | 33.1 | 23.1 | 10.9 | 2.7 | Astir place, condition matched, night, bottom of the band |
| 1.8 (cap) | 2.1 | 21.1 | 32.0 | 28.1 | 16.8 | 4.7 | everything at once |

\* **Elders exist only where giants live:** places flagged `holdsGiants` (3 per lake, §7), their **residents**, Marked Fish, and P4's Underdepth casts. Everywhere else z is clamped to 2.64 (a top Trophy). Fry water (the Puffball Vent, the Votive Font) caps at Prize; the Lampwarden caps at Trophy. **Finding where the giants live is the exploration goal.** *P1 stopgap:* until the Mossmere's places exist (P2), the existing legend-pool rims (non-legend casts) and `deepPools` of every lake are `holdsGiants`, so Elders exist from the first build.

**Favour μ** (one formula, shown on the float by family, §5.1):

| family | source | favour |
|---|---|---|
| **Place** | inside any place / today's **Astir** place (instead) | +0.15 / +0.35 |
| | a place's live window (rhythm live, sight fish, the Turn, a dome…) | +0.2 … +0.6 (per place, §7) |
| **Hour** | dusk *Last Light* or dawn | +0.2 |
| | night: **Night Rise** (every mode) | +0.25 |
| | **Hush** condition (lake-wide, §7.1) | +0.2 |
| | **Far Water** (§3.4) | +0.06 per dawn out (cap +0.24) |
| **Match** | the species' field-note condition | +0.3 |
| | **today's rumour** target (that species at that place) | +0.3 |
| **Tackle** | bait / lure | Ember Roe +0.35 · Cut Strip +0.3 (predators) · Glimmer Spoon, Bone Jig, Moth Popper +0.2 (their family) · Lantern Lure +0.4 |
| | bobber in the lower third of the species' depth band | +0.25 |
| | Clean Cast | +0.1 |
| **Signs** | strike splash / nervous water / bubble trail | +0.6 / +0.3 / +0.2 |
| | let it pass | +0.15 per lapsed bite (cap +0.3) |
| **Pressure** | each catch from this place today | **−0.12** (floor −0.6, reset at dawn) |
| **cap** | | **+1.8** |

**Arithmetic check.** A *decent* cast (place 0.15 + dusk 0.2 + family lure 0.2 = 0.55, ◆◆◇◇◇) gives Prize 22%, Trophy 7.4%, Elder 1.7% where giants live. A *full setup* (Astir 0.35 + window 0.4 + night 0.25 + condition 0.3 + Ember Roe 0.35 + depth 0.25 + clean 0.1 = 2.0, capped at 1.8, ◆◆◆◆◆) gives Elder 16.8%, Ancient 4.7%. **Setup is what you master, and the float tells you how you are doing.**

**Pacing, in hours of play** (the pacing sim T5 owns these, with the setup-favour distribution and residents included): ≈ 65 casts per hour of play (≈ 27 min of fishing at ≈ 25 s per cast incl. fight and ceremony); about a third in giant water at an average favour ≈ 0.5 gives ≈ 0.3 Elder bites per hour; residents add ≈ 0.3–0.5 (≈ 1–1.5 resident hooks per expedition × 12.4% Elder × 2.67 expeditions per hour). So **≈ 0.6–0.8 Elder hooks per hour of play**. Targets: first Elder hooked h1–3; first Elder landed h2–6 (usually a common or uncommon species at a giant place); first headline-predator Elder (a lake's reference species) h6–10; first Ancient h12+.

**Legendaries** are single individuals with **authored** sizes (σ 0.02, so their records are to the gram), **each ≥ 1.4× the longest "said to reach" in its lake** (a `validate-data` rule). Each later landing is **+7% heavier** (length +2.3%), capped at × 1.5 weight.

### 6.2 Value, food and oil from size

```
fish.value = round(species.value × 0.66 × clamp(e^(0.45·z), 0.6, 6) × classBonus × QUALITY.valueMult × streak)
             classBonus: Trophy 1.25, Elder 1.6, otherwise 1
fish.food / fish.oil = species.food / oil × clamp(e^(0.3·z), 0.7, 2.5) × QUALITY.yieldMult  (× Far Water on rendered oil)
```

The factor 0.66 is normalised against the **real favour mix**, not μ = 0: over an assumed mix (25% of sold fish at μ 0, 30% at 0.3, 25% at 0.6, 15% at 1.0, 5% at 1.5; a third in giant water) the size × class multiplier averages **1.428**, and today's `sizeK` averages 0.942, so 0.942 / 1.428 = 0.66 keeps income per fish equal to today's (`roster-v3.mjs`). The balance sim (T3) recomputes it per lake from simulated favour. Example: an Elder Reedjaw (z 2.8) = 34 × 0.66 × 3.53 × 1.6 ≈ **127 Shells**, about two days of early Mossmere income from one fish. `sizeK` is cut. Quality tiers (Fine, Shimmering) and the perfect-hook streak are kept.

### 6.3 Records (all written at the measuring moment, all permanent)

| record | rule |
|---|---|
| personal best | per species, length and weight; "New best: 112 cm (was 97)" |
| best setup | the favours present when you set the PB, stored in the species' field note |
| class seals | Journal grid: 48 non-legendary lake and Wanderer species × Prize / Trophy / Elder = **144 seals**, plus 4 legend seals (the Quayling has no seals: it never grows past Keeper) |
| **Elder Log** | every Elder: generated name, cm, kg, place, expedition number, day, Wick; Ancients marked. Lost-on-the-way-home Elders keep their line ("Sank with the creel, night 4"). |
| **Old Ledger** | a figure in Murk's ledger "since before the Fall" at **z 2.3** (mid-Trophy) for every species. Beating it rings Murk's bell across the lake and gives +5 Memories; your Wick's name is chalked over the old one on his barge at home. |
| said to reach | the ceiling (z 3.6), drawn as a dotted silhouette on the Journal ruler and on the species' wall frame once you land a Trophy of that species |
| the one that got away | biggest escape per species (estimated ±8%) |
| place records | your best fish per place, inked on that place's **Tally Post** in the world (§7.0) |
| legend growth | a growth line per legend ("Expedition 3: 241 kg · Expedition 9: 296 kg") |

### 6.4 Size you can see (3D and UI)

| moment | what shows the size | cost |
|---|---|---|
| **bite** | class bite tells (§5.4); rise-ring radius, boil ellipse and glow-trail brightness scale with the pre-rolled fish | bobber animation variants; pooled decals |
| **fight** | **the 1.45× mid-fight boost is cut** (`fishing.js:663`). The model is the true length in metres (`createFish(species, {z})` → the stretched L). Splash (`0.6 + L·0.6`, existing), wake and the under-water shadow decal scale with length. **The reel camera pulls back by line distance and fight state only, never by class**, so an Elder looks bigger on screen than a Keeper. | 0 calls |
| **breach** | leap reveal for Prize+: 0.25 s at timescale 0.35, rim flash, a thump pitched by size | 1 tween |
| **landing** | pose by length (palm / arms / hang / alongside), the knotted cord with class chimes, the `trophy` camera at `clamp(1.2 + 1.6·L, 1.6, 16)` m framing fish and Wick against the place's landmark | actors poses + 1 cord mesh |
| **age marks** (P4) | one detail grows with class on 10 headline species: Mossback's lichen tuft blooms · Weeping Carp's barbels become ribbons · Gutter Crayfish gains buttons · Capshell's hat grows · Sporebelly becomes a perfect sphere · Reedjaw's scars · Shardspine's crest · Bonecrook's crown fragment · Bridgechain gains chain links · Candlewake lights one more scute-candle per class | parameters in `models-fish` and `ui-fishart` |
| **Journal** | per-species ruler: class bands in ink wash, ticks for your last 12 catches, your best, the Old Ledger mark, the dotted "said to reach". Plates show a small Wick silhouette at true relative scale. | canvas |
| **home** | your fish at true size against its species' painted ruler on the Long Wall; legends under the arch; pond fish swimming at true size | §3.7 |

*Scale note:* the built Wick is **0.85 m**. All "Wicks long" framing uses 0.85 m. An Elder Reedjaw (122–178 cm) is 1.4–2.1 Wicks; the Lantern-Swallower (850 cm) is 10 Wicks.

### 6.5 The roster: 53 species

**Grammar** (learnable per lake): 3–4 everyday commons → uncommons → rares, of which **≥ 2 are night-only** → **3–5 place-kept** fish, each tied to one place and one condition → 1 legendary. Plus 2 Wanderers and the Landing's Quayling. **No filler: every new fish is tied to a place, a condition or the night.** Morphs (colour-variant checklists) are cut outright (they echo Dredge's aberrant collection and real hunting games' morph lists). Each lake has **two giant-tail species** (σ ≥ 0.16), whose Elders are about twice a Keeper's length.

| lake | commons | uncommons | rares (incl. kept) | legend | total | place-kept | night-only (non-legend) | giant-tail |
|---|---|---|---|---|---|---|---|---|
| The Mossmere | 4 | 2 | 5 | 1 | 12 | 3 | 2 (Lampsipper, Gloam Eel) | Weeping Carp, Bridgechain Sturgeon |
| Sporewood Pools | 3 | 3 | 5 | 1 | 12 | 3 | 2 (Nightbloom Carp, Mildew Angler) | Nightbloom Carp, Mildew Angler |
| Glasswater Vault | 3 | 2 | 7 | 1 | 13 | 4 | 2 (Shardspine Eel, Vesper Gar) | Mirror Pike, Blind Scrivener |
| The Pallid Deep | 3 | 2 | 7 | 1 | 13 | 5 | 3 (Funeral Veil, Lampwarden, Candlewake) | Gilt-Eyed Eel, Candlewake Sturgeon |
| Wanderers | | | 2 | | 2 | | 1 (Hearthfish) | |
| the Landing | 1 | | | | 1 | | | |
| **total** | 14 | 9 | 26 | 4 | **53** | **15** | **10** | 8 |

**Phasing:** today's 32 → **36** in P2 (the Mossmere's 4 new fish with its places) → **44** with §24's 8 place-kept fish (the §24 lake builds) → **47** in P3 (2 Wanderers and the Quayling) → **53** in P4 (6 more, each hung on an existing §24 place or the night).

Columns (all sizes from `roster-v3.mjs`): median = L50 / W50 · σ = length spread · Trophy from = z 1.88 · Elder from = z 2.65 · said to reach = z 3.6 (legends: fully grown, × 1.5 weight) · E/K = Elder (z 3.0) length ÷ Keeper (z 0.4) length · value = base Shells before × 0.66 and size. Styles in *italics* are re-mapped. Place references use §24 place ids. All palettes off-green (§6.6).

| # | species | lake · where / condition | rarity · time · depth | style | median | σ | Trophy from | Elder from | said to reach | E/K | value | look (signature trait · palette) | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Dusk Minnow | Mossmere · anywhere | C · any · 0–.55 | darter | 22 cm / 106 g | .12 | 29 / 238 g | 35 / 441 g | 50 / 1.3 kg | 1.72 | 5 | pewter schools flecked rust like thrown pennies | recolour |
| 2 | Mossback Perch | Mossmere · anywhere | C · any · .1–1 | steady | 36 / 607 g | .13 | 48 / 1.4 kg | 59 / 2.7 kg | 85 / 8.0 kg | 1.77 | 7 | slate perch; a pale lichen tuft that blooms with class (age mark) | recolour |
| 3 | Gutter Crayfish | Mossmere · shallows | C · any · 0–.45 | sinker | 19 / 206 g | .10 | 24 / 411 g | 29 / 727 g | 40 / 2.0 kg | 1.63 | 6 | drowned buttons on the shell, one more per class (age mark) | existing |
| 4 | **Lampsipper** | Mossmere · shallows, × 2 inside your light | C · **night** · 0–.5 | darter | 26 / 176 g | .12 | 34 / 393 g | 42 / 728 g | 59 / 2.1 kg | 1.72 | 9 | upturned mouth, two moth-wing eye-spots; rises to your lantern | new · P2 |
| 5 | Weeping Carp | Mossmere · mid–deep | U · any · .35–1 | sinker | 56 / 2.8 kg | .16 | 79 / 7.9 kg | 100 / 16 kg | 148 / 52 kg | 1.91 | 15 | pewter and ivory, tear-streaks; barbels lengthen into ribbons (age mark) | recolour · giant tail |
| 6 | Candlefin Koi | Mossmere · calm; × 3 Lily Maze | U · calm · .25–.85 | darter | 46 / 1.5 kg | .13 | 61 / 3.5 kg | 76 / 6.5 kg | 109 / 19 kg | 1.77 | 18 | ivory koi, fin edges lit with heatless flame | existing |
| 7 | Reedjaw Pike | Mossmere · deep | R · any · .55–1 | thrasher | 70 / 2.6 kg | .15 | 97 / 6.8 kg | 122 / 13.5 kg | 178 / 42 kg | 1.86 | 34 | slate-blue, reed-barred in ink; old ones carry pale scars (age mark) | recolour · reference species |
| 8 | Gloam Eel | Mossmere · deep · Lumen Moss; × 2 Buoy Lights | R · night · .4–1 | leaper | 72 / 597 g | .13 | 96 / 1.4 kg | 119 / 2.7 kg | 170 / 7.9 kg | 1.77 | 42 | ink eel with **moon-violet** photophores (was mint) | recolour, resized |
| 9 | **Old Portcullis** | Mossmere · **Gatehouse Door** target | R · any · .6–1 | sinker + fouled line | 58 / 3.1 kg | .15 | 80 / 8.3 kg | 101 / 16 kg | 147 / 51 kg | 1.86 | 40 | catfish whose barbels hang like a broken portcullis; iron-rust mottle | new · P2 (kept) |
| 10 | **Cupbearer** | Mossmere · **Cupped Hands** bowl (1 m disc) while it is full | R · calm · .3–.5 | darter | 80 mm / 5 g | .09 | 99 mm / 10 g | 119 mm / 17 g | 164 mm / 44 g | 1.59 | 48 | thumb-sized, violet-gold veil fins; **measured in millimetres** | new · P2 (kept) |
| 11 | **Bridgechain Sturgeon** | Mossmere · **Under the Span**, in Mirror Hush | R · any · .6–1 | sinker | 70 / 2.1 kg | .16 | 99 / 5.8 kg | 125 / 12 kg | 185 / 38 kg | 1.91 | 55 | rust scutes in a line like chain links (age mark); the Mossmere's longest | new · P2 (kept) · giant tail |
| 12 | The Belled Matriarch | Mossmere · Bell Pool · Heartmoss | L · calm | steady (boss) | 260 / 230 kg | — | — | — | 298 / 345 kg | — | 140 | a harbour bell grown into her skull; tarnished-bronze scales, pale moon glow (was mint) | recolour, resized (1.41× the lake's longest) |
| 13 | Sporebelly Puffer | Sporewood · shallows; × 3 Puffball Vent | C · any · 0–.6 | thrasher | 25 / 469 g | .10 | 31 / 935 g | 38 / 1.7 kg | 53 / 4.5 kg | 1.63 | 13 | sighs spores; Trophy+ puff into a perfect sphere (age mark) | existing |
| 14 | Plumgill Perch | Sporewood · anywhere | C · any · .15–1 | steady | 40 / 832 g | .13 | 53 / 2.0 kg | 66 / 3.7 kg | 95 / 11 kg | 1.77 | 14 | bruise-plum gills | existing |
| 15 | Capshell Crayfish | Sporewood · shallows | C · any · 0–.45 | sinker | 24 / 415 g | .10 | 30 / 828 g | 37 / 1.5 kg | 51 / 4.0 kg | 1.63 | 12 | wears a mushroom hat that grows with it (age mark) | existing |
| 16 | Velvet Ray | Sporewood · mid–deep; × 2 `mothers_cup`, `gill_harp` | U · any · .35–.9 | *runner* | 67 / 3.6 kg | .14 | 91 / 9.0 kg | 113 / 18 kg | 164 / 53 kg | 1.81 | 32 | plum velvet wings, pale eye-rings | existing |
| 17 | Threadling Eel | Sporewood · Spore Cake | U · any · .3–.85 | darter | 86 / 1.0 kg | .13 | 115 / 2.4 kg | 142 / 4.6 kg | 203 / 13.5 kg | 1.77 | 34 | blind, root-like, stitched bands | existing, resized |
| 18 | **Nightbloom Carp** | Sporewood · anywhere | U · **night** · .3–1 | sinker | 58 / 3.1 kg | .17 | 83 / 9.2 kg | 106 / 19 kg | 158 / 64 kg | 1.96 | 40 | plum carp whose scales open like amber spore-lamps at night | new · P4 · giant tail |
| 19 | Mildew Angler | Sporewood · deep; × 2 `veilwater` | R · night · .5–1 | sinker | 60 / 5.4 kg | .16 | 85 / 15 kg | 107 / 31 kg | 158 / 99 kg | 1.91 | 66 | its lure is one soft lit mushroom | existing · reference · giant tail |
| 20 | Sleepspore Jelly | Sporewood · Lumen Moss; × 3 `lullaby` | R · calm · .2–.75 | darter | 33 / 719 g | .09 | 41 / 1.4 kg | 49 / 2.3 kg | 68 / 6.2 kg | 1.59 | 62 | pink-white bell with a sleeping fry inside | existing |
| 21 | Harpstring Eel | Sporewood · `gill_harp` while it sings | R · any · .4–.85 | darter | 82 / 882 g | .13 | 109 / 2.1 kg | 135 / 4.0 kg | 194 / 12 kg | 1.77 | 74 | rose-striped; its fins hum on the line | §24 (kept) |
| 22 | Hushcap Koi | Sporewood · `veilwater`, its deed done | R · calm · .6–1 | darter | 50 / 1.9 kg | .13 | 67 / 4.4 kg | 82 / 8.4 kg | 118 / 25 kg | 1.77 | 78 | dusk-dark koi, lit only in the dark the place keeps | §24 (kept) |
| 23 | **The Remembered Sun** | Sporewood · `drowned_greenhouse`, Clean Cast within 0.6 m of the Lit Row's centre line | R · calm · .4–.5 | leaper | 45 / 1.4 kg | .13 | 60 / 3.2 kg | 74 / 6.1 kg | 106 / 18 kg | 1.77 | 80 | the one warm fish in the Pools: a pale-gold sun-disc on its flank | new · P4 (kept ▲) |
| 24 | The Drifting Grove | Sporewood · `mothers_cup` · Glowcap Bulb | L · calm | leaper (boss) | 300 / 320 kg | — | — | — | 344 / 480 kg | — | 320 | a meadow on her back that blooms when she dives | resized (1.47×) |
| 25 | Prism Minnow | Glasswater · shallows | C · any · 0–.6 | darter | 23 / 122 g | .12 | 30 / 272 g | 37 / 504 g | 52 / 1.4 kg | 1.72 | 24 | schools flash ice-blue at once (sapphire, not aqua) | recolour glow |
| 26 | Glassgill Perch | Glasswater · anywhere | C · any · .15–1 | steady | 43 / 1.0 kg | .13 | 57 / 2.4 kg | 71 / 4.6 kg | 102 / 14 kg | 1.77 | 28 | a heart visible through its side | existing |
| 27 | Glassblown Puffer | Glasswater · shallows | C · any · 0–.55 | thrasher | 27 / 590 g | .10 | 34 / 1.2 kg | 41 / 2.1 kg | 57 / 5.7 kg | 1.63 | 26 | rings like a wineglass when it puffs | existing |
| 28 | Chime Jelly | Glasswater · Glass Larvae; × 3 `bell_window` | U · calm · .25–.85 | darter | 36 / 933 g | .09 | 44 / 1.8 kg | 53 / 3.0 kg | 74 / 8.0 kg | 1.59 | 56 | chimes when it brushes crystal | existing |
| 29 | Mirror Pike | Glasswater · deep; × 3 `mirror_nave` | U · any · .5–1 | *runner* | 75 / 3.2 kg | .17 | 108 / 9.4 kg | 137 / 20 kg | 205 / 65 kg | 1.96 | 62 | mirror flank that shows a tired little candle | existing · reference · giant tail |
| 30 | Shardspine Eel | Glasswater · deep | R · night · .4–1 | thrasher | 85 / 983 g | .14 | 115 / 2.5 kg | 144 / 4.8 kg | 208 / 15 kg | 1.81 | 130 | crystal frost along the spine; the crest grows (age mark) | existing, resized |
| 31 | **Vesper Gar** | Glasswater · deep; × 3 `broken_hymnal` | R · **night** · .5–1 | darter | 70 / 2.6 kg | .15 | 97 / 6.8 kg | 122 / 13.5 kg | 178 / 42 kg | 1.86 | 135 | needle jaw; violet glass fins ring on every surge | new · P4 |
| 32 | The Blind Scrivener | Glasswater · Ember Roe; `well_of_ledgers` | R · any · .6–1 | *sulker* | 64 / 6.6 kg | .16 | 90 / 18 kg | 114 / 37 kg | 169 / 120 kg | 1.91 | 120 | eyeless, one violet lure | existing · giant tail |
| 33 | The Unreflected | Glasswater · `mirror_nave`, reflection hit | R · any · .5–1 | darter | 60 / 2.8 kg | .13 | 80 / 6.6 kg | 99 / 13 kg | 142 / 37 kg | 1.77 | 145 | ice-pale and blind; casts no reflection | §24 (kept) |
| 34 | The Footnote | Glasswater · `well_of_ledgers`, bottom ledger | R · any · .9–1 | *sulker* | 51 / 1.7 kg | .13 | 68 / 4.1 kg | 84 / 7.7 kg | 121 / 23 kg | 1.77 | 140 | tiny script-like marks along the flank | §24 (kept) |
| 35 | Rainglass Darter | Glasswater · `stilled_cascade` | R · calm · .75–.95 | darter | 39 / 593 g | .11 | 50 / 1.3 kg | 61 / 2.3 kg | 86 / 6.3 kg | 1.68 | 135 | raindrop spots that catch the light | §24 (kept) |
| 36 | **The Sexton** | Glasswater · `bell_window` during the Struck Hour | R · any · .85–.95 | thrasher | 66 / 4.6 kg | .15 | 91 / 12 kg | 115 / 24 kg | 168 / 76 kg | 1.86 | 150 | deep indigo, a pale bell-shaped patch per flank; a muffled toll each surge | new · P4 (kept ▲) |
| 37 | The Glass Sovereign | Glasswater · `fallen_chandelier` · Prism Moth | L · night | leaper (boss) | 300 / 210 kg | — | — | — | 344 / 315 kg | — | 600 | each scale a window with no one behind it | resized (1.44×) |
| 38 | Ossuary Fry | Pallid · shallows; Almshouse Cradle | C · any · 0–.6 | darter | 23 / 122 g | .12 | 30 / 272 g | 37 / 504 g | 52 / 1.4 kg | 1.72 | 42 | bone-pale and blind | existing |
| 39 | Pallid Wraithfin | Pallid · anywhere | C · any · .1–1 | steady | 46 / 973 g | .13 | 61 / 2.3 kg | 76 / 4.4 kg | 109 / 13 kg | 1.77 | 48 | ghost-ribbon fins | existing |
| 40 | Bonecrook Crayfish | Pallid · shallows; Almshouse Cookpot | C · any · 0–.5 | sinker | 27 / 590 g | .10 | 34 / 1.2 kg | 41 / 2.1 kg | 57 / 5.7 kg | 1.63 | 44 | a shell of fallen things; a crown fragment at Trophy+ (age mark) | existing |
| 41 | Gilt-Eyed Eel | Pallid · deep | U · any · .4–1 | thrasher | 131 / 3.6 kg | .16 | 185 / 10 kg | 234 / 21 kg | 345 / 66 kg | 1.91 | 92 | two gold coins for eyes | existing · reference · giant tail |
| 42 | Shroud Ray | Pallid · deep | U · any · .45–1 | leaper | 82 / 6.6 kg | .14 | 111 / 17 kg | 139 / 32 kg | 201 / 98 kg | 1.81 | 88 | burial-cloth wings | existing |
| 43 | Funeral Veil | Pallid · mid; Almshouse Shrine | R · night · .3–.9 | darter | 42 / 741 g | .09 | 52 / 1.4 kg | 62 / 2.4 kg | 86 / 6.4 kg | 1.59 | 190 | widow-veil threads | existing |
| 44 | Lampwarden Angler | Pallid · Ember Roe; `sunken_belfry`, `the_bottomless` | R · night · .6–1 | *sulker* | 72 / 9.3 kg | .14 | 98 / 23 kg | — (caps at Trophy) | 122 / 45 kg (cap) | — | 210 | the last lamp hangs from its jaw | existing, capped |
| 45 | The Clapper | Pallid · `sunken_belfry` toll cue | R · any · .8–1 | thrasher | 66 / 4.6 kg | .15 | 91 / 12 kg | 115 / 24 kg | 168 / 76 kg | 1.86 | 225 | bell-bronze carp; the bell rings when it turns | §24 (kept) |
| 46 | The Wax-Bearer | Pallid · `bier_barge`, hold open | R · any · .7–.9 | leaper | 127 / 3.3 kg | .13 | 169 / 7.7 kg | 209 / 15 kg | 300 / 43 kg | 1.77 | 220 | a drop of candle-wax on its brow | §24 (kept) |
| 47 | The Unpaid Fare | Pallid · `ferry_slip` at dusk | R · calm · .8–1 | *sulker* | 87 / 6.6 kg | .14 | 118 / 17 kg | 147 / 32 kg | 213 / 97 kg | 1.81 | 240 | coin-eyed, dark ghost-ribbon body | §24 (kept) |
| 48 | **Candlewake Sturgeon** | Pallid · `chain_garden` during the Turn | R · **night** · .85–.95 | runner | 133 / 14 kg | .175 | 193 / 43 kg | 247 / 91 kg | 370 / 304 kg | 1.98 | 250 | bone scutes like unlit candles, one lit per class (age mark); the biggest non-legendary | new · P4 (kept ▲) · giant tail |
| 49 | **The Namesake** | Pallid · `long_pier` after relighting 3 candle-rafts that day | R · any · .75–.85 | steady | 62 / 3.1 kg | .13 | 83 / 7.3 kg | 102 / 14 kg | 147 / 41 kg | 1.77 | 230 | bone-white with gold calligraphic marks; each catch logged under a name from the pier | new · P4 (kept ▲) |
| 50 | **The Lantern-Swallower** (was the Pale Leviathan) | Pallid · `the_bottomless` · Last Candle (was Drowned Marrow) | L · night | sinker (boss) | 850 / 3,200 kg | — | — | — | 973 / 4,800 kg | — | 2,500 | older than the kingdom; it swallowed the great lantern, and the ember still glows in its belly | renamed, resized (10 Wicks; 2.3×) |
| 51 | **Pilgrim Salmon** | Wanderer · Sporewood and deeper: dawn and the first 30 s of calm within 20 m of the lake's Homeward Waystone; once per lake per **real day** | R · dawn · .3–.8 | runner | 66 / 2.2 kg (Sporewood) · 76 / 3.3 kg · 87 / 4.9 kg | .13 | 88 / 5.1 kg | 109 / 9.7 kg | 156 / 29 kg (Pallid: 206 cm) | 1.77 | 30 × lake valueMult | rust hooked jaw, frayed fins; grows each lake down | new · P3 |
| 52 | **Hearthfish** | Wanderer · any lake: cast inside your own light with oil ≥ 75% | R · night · any | leaper | 32 / 492 g | .12 | 42 / 1.1 kg | 51 / 2.0 kg | 73 / 5.8 kg | 1.72 | 28 × lake valueMult | a coal-glow in its belly that brightens near your lantern | new · P3 |
| 53 | **Quayling** | the Landing · cast from the jetty | C · any · any | darter | 14 / 27 g | .10 | — | — | 15.5 cm / 37 g (Keeper cap) | — | 0 (Murk won't buy it) | a quayside minnow with rust-flecked fins and one curious eye | new · P3 (cove only) |

Place-kept fish follow §24's rule: eligible only at their place and condition, rolled as rare with weight × 8, no bait needed (Wick-Worms attract them all). ▲ = a data-only addition to a §24 place, routed through the §24 owner. Weights use W = k·L³ per body shape (minnow .010, perch .013, crayfish .030, carp .016, koi .015, pike .0075, eel .0016, angler .025, ray .012 incl. tail, puffer .030, jelly .020, ghost .010, sturgeon .006 g/cm³). **Legend rule check** (`roster-v3.mjs`): Matriarch 260 cm vs the Mossmere's longest ceiling 185 cm = 1.41×; Drifting Grove 300 vs 203 = 1.47×; Glass Sovereign 300 vs 208 = 1.44×; Lantern-Swallower 850 vs 370 = 2.30×. New shape needed: `sturgeon` (scutes and a shovel snout, from the leviathan profile; P2). Old Portcullis uses `carp` with long barbels, Vesper Gar uses `pike` with a needle snout, The Namesake and The Footnote share a `marks` pattern.

### 6.6 Fish palettes: off-green, distinct per lake

| lake | fish hue story | changes |
|---|---|---|
| The Mossmere | slate, pewter, rust, ivory | Mossback 0x4f6b4a → slate 0x585e66, rust fins; Reedjaw 0x3e5a4c → slate-blue 0x3e4a5c, ink bars; Weeping Carp 0x5d6e66 → pewter 0x646a74; Dusk Minnow 0x6f8f86 → pewter 0x7a8494; Gloam Eel body 0x14302c → ink 0x16142a, glow 0x6ff5c8 → moon-violet 0xb9a8ff; Matriarch 0x4a5e4f / glow 0x9ff0c0 → bronze 0x6a5a44 / pale moon 0xd8d0ff |
| Sporewood Pools | plum, amber, rose, cream | unchanged |
| Glasswater Vault | indigo, ice, violet; glows **sapphire, not aqua** | every glow in hue 150–190° (0x5ff2ff) → sapphire 0x5cbcff or violet 0xb48cff |
| The Pallid Deep | bone, ink, gold, one oxblood | unchanged |
| the Landing | the Quayling: pewter with rust fins | new |

`validate-data` rule: no species model colour (body / belly / fin / glow) with hue 90–190° and saturation > 0.25. Green survives only as a pale lichen fleck in the Mossback's texture.

---

## 7. World and locations

### 7.0 Principles and the shared kit

- **Fixed, hand-authored lakes** (§24 decision 3). Variety comes from **conditions × Astir × residents × night × rumours × Far Water**, so knowledge persists and pays.
- **Places carry the size game:** `holdsGiants` (3 per lake), one persistent **resident** at each of those three, and per-place **pressure**.
- **§24's 21 places are kept**, keyed by their ids (`mothers_cup`, `lullaby`, `puffball_vent`, `drowned_greenhouse`, `gill_harp`, `veilwater` · `fallen_chandelier`, `mirror_nave`, `bell_window`, `well_of_ledgers`, `stilled_cascade`, `broken_hymnal`, `burning_glass`, `votive_font` · `the_bottomless`, `long_pier`, `drowned_almshouse`, `chain_garden`, `sunken_belfry`, `bier_barge`, `ferry_slip`). Changes to them are **data-only proposals** to the §24 owner (▲), to be re-synced against the draft before it merges. This brief adds only the Mossmere's raft places. Secrets in other lakes and the Chart's fog-of-war are P4 proposals that need the §24 owner's sign-off.
- **Routed to §24 (▲, structural):** opened **shortcuts persist across expeditions** (`meta.shortcuts`; the lakes are fixed and every expedition starts at the same spawn, so re-opening the Sundered Span on every Glasswater trip would be a chore). **Lit Waylamps still reset** each expedition, so their oil stays a range decision; Known Places keep their Waylamp starting lit, as in §24. Two Waylamps per lake are flagged `watch` (§4.2). The Pallid spawn area "Landing of Last Rafts" is renamed **"Shore of Last Rafts"** (name clash with the Landing). Lamp hops follow the current draft (§24 now calls the lamps *sister-candles*; hops are dawn-only, once a day). Day lengths follow this brief (calm 180 / 185).
- **Budget:** §7.8. No new PointLights (lamps use `water.setLights`, ≤ 6), **one wow happening active per lake**, a low-tier off switch for floor paintings and the night sparkle. **No geometry-moving weather** (Highwater, The Low Breath and the Belfry lift are cut).

**New place fields and rules** (two new rule types and five fields):

| field / rule | meaning |
|---|---|
| `holdsGiants` | Elders may roll here (§6.1); 3 per lake; this place has a resident |
| `maxClass` | default `trophy` outside giant places; fry water `prize` |
| `resident` | **only at the 3 `holdsGiants` places**, persistent in `meta.residents[lake][place] = {species, z}`. Species from the place's favoured list (weights common 1, uncommon 2, rare or kept 3). **z ~ N(1.6, 0.6) truncated to [1.88, 3.6]**: always Trophy or better, **Elder 12.4%, Ancient 1.1%**, mean z 2.27. It shows itself twice per calm, once at dusk and once at night (+1 per calm per dawn out with Far Water, cap +3): a boil, a pass or a leap. A cast within 3 m of a show in the next 8 s gives it a 60% bite chance. Landing it gives the place record and a "Resident" stamp; **a new resident is rolled on your next Set Out to that lake**. A resident not landed re-rolls after **3 in-lake days spent in that lake** (counted across expeditions). A Marked Fish at a place replaces its resident. |
| `tally` | the Tally Post style (flood-gauge stone / notched cap stem / brass ruler / bone tablet) |
| rule `sight` | the place's fish are **visible** and pre-rolled (species and z), drawn at true size. Landing within 1.2 m of one means it bites in 2–4 s; others spook for 30 s. |
| rule `drift` | the bobber drifts along a lane at 1.5 m/s; each seam crossed +0.08 rarity; bites roll during the drift |
| `cond` on rules or species | live only in a named condition archetype (Hush / Drip / Mist) |

**One pre-rolled fish primitive** (fishing): `preroll({species, z, pos, path})`, drawn with the existing circling silhouettes and the shadow decal sized by length, **on top of the water** with a depth tint (the existing spot-fish technique; the lake plane is opaque). It drives rise rings, boils, glow trails, residents, `sight` places, Moonfall, the Mirror Nave's reflections and Marked Fish. One implementation serves every "see the big one" moment.

**Tally Posts.** Each place gets a lake-styled marker on which your best fish there is inked (species glyph, cm, kg). It persists across expeditions. Each is a 128×64 canvas sprite built on approach, at most 2 live. *The world remembers your fish.*

**Discovery** (§24.9, kept): within 8 m or casting in → a 1.2 s ink title card, the sound beacon swells, the Journal's Places page fills (+2 Memories, instantly). Mastery (4 catches in one expedition, one Fine+) → +10 and a Known Place.

**Astir:** §24's daily Astir place in the walking lakes, plus one Mossmere place per day (new).

**Rumours** (≈ 24, 6 per lake): three tiers, vague → the place → the condition. Sources: Murk (one per visit when you sell at least one fish; he prefers undiscovered places and unsolved conditions) and the Well of Ledgers' lines (plus Remnants in P4). Pin one at a time (edge marker). Solving one gives +3 Memories and a Journal stamp. Plus **today's rumour** (one per real date, at the Map Table, always naming a `holdsGiants` place and often its resident: "An Elder Velvet Ray turns in the Lullaby", favour +0.3 for that species at that place that day).

### 7.1 Conditions: one system, three archetypes, per-lake looks

Each calm rolls: **none 40% · Hush 20% · Drip 20% · Mist 20%**, seeded by expedition, day and lake. Every lake rolls every archetype; none is a lake's identity. Murk names tomorrow's at dawn, and the Map Table shows day 1's for every lake. The build is one fishing uniform set, a particle preset and a fog tweak (≤ 4 draw calls). Nothing moves geometry.

| archetype | effect | Mossmere | Sporewood | Glasswater | Pallid Deep |
|---|---|---|---|---|---|
| **Hush** | favour +0.2 lake-wide, wait × 1.2, `sight` range × 2 | *Mirror Hush* (swell × 0.2, sharp reflections) | *Damp Hush* (the Greenhouse glass fogs, every row glows dimly) | *Clear Hush* (shafts × 1.5) | *Breathless* (ash hangs still) |
| **Drip** | wait × 0.8, commons × 1.3, rhythm places faster | *Drizzle* (300 instanced streaks, 120 on low; the aqueduct coughs every 25 s) | *Spore-fall* (spores × 2 falling; Puffball Vent × 2) | *Shard-chime* (crystals pulse in a chord; ▲ the Stilled Cascade thaws for 40 s) | *Ash-fall* (ash × 2; Breathing Deep × 1.5) |
| **Mist** | rarity +0.08; gloom species may bite in calm at weight × 0.3; sound beacons × 1.5 | *Moonmist* (3 low mist cards; Moonfall lasts 30 s) | *Bloom-haze* | *Prism-fog* | *Pall* (fog × 1.3) |

### 7.2 Night: the big-fish hour in every mode

- **Night Rise:** favour +0.25 on every night cast. Dusk *Last Light*: +0.2.
- **Glowtide visuals:** a water-shader sparkle term (noise × ripple and wake energy × `uGlowtide`, ≈ 8 ALU, 0 draw calls, off on low). Wakes, rain rings, the bobber and a thrashing fish light up. Night fish show as **glow trails**.
- **Night places:** the Buoy Lights (Mossmere, new), `veilwater` (Sporewood), `fallen_chandelier` and `broken_hymnal` (Glasswater), `long_pier` during the Candle Tide and `sunken_belfry` (Pallid).
- On a quiet night (Still, a Lantern still night, the Lantern window's quiet tail, a lamp-watch), gloomlings appear only as ink drifts far out, silhouettes against the glow.

### 7.3 The Mossmere (raft only): 8 places + 1 secret

**Identity:** *the gate and the harbour.* The night the lantern fell, the ferries never left: the harbour drowned with its barges still moored, its bells still hung, its toll-gate still shut. Hushed, iron, tidal. **Palette** (the slate-and-rust rework): pewter-slate water #232b3a, **rust iron #8a4b3a as the leading accent** (chains, bells, buoys, the gate, the bridge), moon-silver #a9b9f0 as the secondary glow (Moonfall), lavender only in the Cupbearer's fins, verdigris only on the cracked bell. Distinct from Glasswater by saturation and value (low-saturation pewter and rust vs saturated sapphire and indigo). **Landmarks:** the Sunken Gate and its leaning toll-tower (N), the **Moon-Eye** ceiling fissure and its silver shaft (NW, over the Ferry-Market), the **Sluice Veil** (a curtain of water spilling from a broken aqueduct down the E cliff), the Toppled Bridge (W, the in-lake landmark).

**Signature wow: Moonfall** (P2). Twice per calm (at 25% and 70%), 20 s (30 s in Moonmist), the Moon-Eye shaft swings onto the Ferry-Market. The water there turns **glass-clear** over a drowned **ferry-market**: moored cargo barges, a toll-house clock stopped at the hour of the Fall, cart wheels, bollards and rust buoy-bells, with the Bell Pool's harbour bell at its edge, and fish circling at true scale. *Build:* water shader `uClear[2]` discs (x, z, r, k) blending toward a 256² canvas floor painting sampled at world xz with view-ray parallax × depth (128² on low, radius × 0.7). The circling fish are pre-rolled silhouettes drawn as depth-tinted decals on top of the water (§7.0). The shaft is the existing additive quad.

| # | place | where (x, z) | why it is cool | fish and giants | twist (rule) | class cap | build |
|---|---|---|---|---|---|---|---|
| a | **The Bell Pool** *(legend)* | (−4, −14) | a drowned harbour bell 9 m down, revealed in Moonfall with the Matriarch circling it **at today's rolled weight** | Weeping Carp × 2; the Belled Matriarch (legend rule unchanged) | Moonfall reveal; legend rule | Trophy | existing |
| b | **Under the Span** | the Toppled Bridge's 3 arch gaps (−36.5, −2.5), (−29.5, 0.5), (−22.5, 3.5) | rust chains hang from the break; fish hold in the arches' shade | Mossback × 2, Reedjaw × 2; **Bridgechain Sturgeon** (kept, Mirror Hush) | `targets` lock at 1.6 m on each gap; threading a gap with a Clean Cast: favour +0.3, rarity +0.2 | **Elder (holdsGiants)** | existing piers + merged chain strands |
| c | **The Cupped Hands** | (16, 18), stone hands 6 m tall | a giant's hands hold a bowl under the broken aqueduct; when it coughs, the bowl overflows, fry spill, and the big fish wait below | the bowl (1 m `targets` disc): Dusk Minnow × 3, **Cupbearer** (kept, while full); below: Weeping Carp × 2, Reedjaw | `rhythm` 60 s (25 s in Drizzle), 3 s warning (the spout gurgles), 6 s live: below the hands wait × 0.5, favour +0.4 | Trophy | **new** geometry: two hands, a bowl and the aqueduct spout (inside W4, +1 call) |
| d | **The Gatehouse Door** | the Drowned Gatehouse's flooded doorway (22, −3.5), 1.4 m disc | cast through a drowned door into the dark of a tower | **Old Portcullis** (kept), Weeping Carp × 2 | `targets` + §24's `foul` (15% per surge: a clank 0.3 s before a +0.15 spike) | Trophy | a door frame cut into the existing island mesh |
| e | **The Ferry-Market** | between the Sisters (−24, −29), r 5 | the drowned market lies 3 m down: barges, the toll-house clock, cart wheels | in Moonfall: 3–5 pre-rolled fish (Candlefin × 2, Weeping Carp × 1.5; one Prize+ guaranteed, 25% one Trophy+); its resident circles among them | `sight` during Moonfall: pick the one you want | **Elder (holdsGiants, in Moonfall)** | uClear disc + floor painting |
| f | **The Sluice Run** | lane (0, −44) → (0, −31) below the Moss Sluice | water pours through the sluice's broken teeth: a lane of white seams | Reedjaw × 2; Gloam Eel × 2 at dusk (`gloomInCalm` at dusk) | `drift` 12 m along the lane | **Elder (holdsGiants)** | pooled foam-seam decals |
| g | **The Lily Maze** | lee of Mossbell Isle (−38, 22), r 8 | notched pads with koi glowing under them like lanterns under snow | Candlefin × 3, Weeping Carp | `sight`: **the size of the glow is the size of the fish**. Open from day 1 at its edge; P4: the Reed Pole lets the raft push into the heart (r 3). | Trophy | existing instanced pads (local density × 2) + glow-buds |
| h | **The Buoy Lights** *(night)* | the old channel along the west shore, x −50…−46, z −14…+10 | at night the drowned channel-buoys' lanterns still burn *under* the water, in two rows | Gloam Eel × 2, Lampsipper × 2 | `targets` on the buoy rows, night only: favour +0.2, gloom species × 2 | Trophy | one InstancedMesh of 24 emissive buoy-lanterns (1 call) |
| S1 | **The Moon Cistern** *(secret, P4)* | behind the Sluice Veil, E cliff (58, 4) | you sail straight through the falling water into a round cistern lit by its own moonbeam | its own resident (Reedjaw-weighted) | bites only inside a beam wandering at 0.3 m/s | Elder | an arena `shoreNotch` (data) + a veil without collision. Clues: a bubble trail, Murk's rumour, the dock at (49, 6). **Reward: the Reed Pole.** |

The first hour now has 8 places to find, solve and record: request 3's raft-only lake is kept, and it is no longer empty.

### 7.4 Sporewood Pools (raft and walking): §24's 6 places

**Identity:** *the gardens*, kept growing after the sun went out. Warm, drowsy, overgrown. **Palette:** plum #2a1a2e, amber #ffb46a, rose #ff7fb0, rare cream mycelium. **Signature wow: The Bloom** (P4, at dusk): the Mother Cap's gills light from stem to crown in 6 s, amber spores fall, and hundreds of fish rise across the reef channels for 20 s (wait × 0.6, favour +0.2). *Build:* an emissive uniform swept by vertex y (0 calls), the existing spore system flipped to falling × 2, rises through `water.addRipple` at 6 per second, one instanced 200-quad glint mesh (1 call).

| §24 place | verdict | v3 change |
|---|---|---|
| `mothers_cup` The Mother's Cup *(legend)* | keep | ▲ `holdsGiants` for non-legend casts (Velvet Ray and Mildew Elders); its breathing made visible (spores rain on the exhale, with a ring of rises) |
| `lullaby` The Lullaby | **modify ▲** | becomes `sight`: sleepers float visibly under a lily-cap canopy, mouths open; a soft cast (charge < 0.5) beside the one you want. ▲ `holdsGiants`. |
| `puffball_vent` The Puffball Vent | keep | `maxClass` Prize (fry water). Fires twice as often in Spore-fall. |
| `drowned_greenhouse` The Drowned Greenhouse | keep | ▲ kept species **The Remembered Sun** on the Lit Row (P4) |
| `gill_harp` The Gill Harp | keep | ▲ `holdsGiants` while it sings; its music-box notes carry 25 m as a sound beacon |
| `veilwater` The Veilwater | keep | Hushcap Koi (kept), Mildew Angler × 2; today's-rumour favourite at night |
| *The Seed Vault* (secret, P4 ▲) | new | through the Rootmat Shallows (needs the Reed Pole); rows of glowing seed-pods. **Reward: Seedlight Glass.** |

### 7.5 Glasswater Vault (mostly on foot): §24's 8 places

**Identity:** *the keepers of light*, who could not let go. Crisp, echoing, exact. **Palette:** indigo #141b46, sapphire #5cbcff (not aqua), violet #b48cff; a full spectrum appears only during the Alignment. **Signature wow: The Alignment** (P4, every 90 s of calm, 15 s): the Orrery ring locks onto the main shaft and the beam splits into a 7-band fan that sweeps the moat. The brightest band is the Burning Glass. The bands write into `uClear` at k 0.3, so fish show in the light. *Build:* 3 merged additive quads with a canvas spectrum gradient (1 call); the Orrery already rotates.

| §24 place | verdict | v3 change |
|---|---|---|
| `fallen_chandelier` The Fallen Chandelier *(legend)* | keep | ▲ `holdsGiants` (trench rim, non-legend) |
| `mirror_nave` The Mirror Nave | **modify ▲** | the reflections are pre-rolled fish drawn **at their true size**: pick the biggest reflection. ▲ `holdsGiants`. |
| `bell_window` The Bell-Chapel Window | keep | High Cast perch (no tackle gate); ▲ kept species **The Sexton** during the Struck Hour (P4) |
| `well_of_ledgers` The Well of Ledgers | keep | ▲ `holdsGiants` on the bottom ledger (Clean Cast plumb) |
| `stilled_cascade` The Stilled Cascade | **modify ▲** | in Shard-chime the frozen falls thaw for 40 s (a material scroll, no geometry): wait × 0.4, favour +0.3 |
| `broken_hymnal` The Broken Hymnal | keep | Vesper Gar × 3 at night (P4) |
| `burning_glass` The Burning Glass | keep | P4: folded into the Alignment as the fan's brightest band |
| `votive_font` The Votive Font | keep | `maxClass` Prize; the quick food tap |
| *The Unlit Stacks* (secret, P4 ▲) | new | a door in light-ink under the Ledger Stair that only the Seedlight Glass shows. **Reward: the Tuning Fork.** |

### 7.6 The Pallid Deep (mostly on foot): §24's 7 places + the Breathing Deep

**Identity:** *the farewells*: where the kingdom sent its dead, and finally itself. Vast, still, reverent. **Palette:** near-black #14130f, ember-gold #e8c66a, bone #eae4d3, one oxblood ribbon colour. **Signature wow: The Candle Tide** (P4, from dusk): 600 memorial candle-rafts (200 on low) push off the bone terraces, drift on slow currents and gather around the Bottomless at night. The Long Pier's drifters come 3× as often. *Build:* one InstancedMesh with paths in the vertex shader and flicker in the fragment shader (1 call). The victory "every candle lights gold" reuses the uniform.

| §24 place | verdict | v3 change |
|---|---|---|
| `the_bottomless` The Bottomless *(legend, the finale)* | keep | ▲ `holdsGiants` (non-legend casts); P4: the Underdepth |
| `long_pier` The Long Pier of Names | keep | ▲ kept species **The Namesake** after relighting 3 candle-rafts in a day (P4) |
| `drowned_almshouse` The Drowned Almshouse | keep | species on demand (five rooms) |
| `chain_garden` The Chain Garden | **modify ▲** | at the Turn, the Lantern-Swallower passes under the plinth as a 9 m shadow; casting at the chains during the pass: favour +0.6 (replaces weightBias +0.6). ▲ kept **Candlewake Sturgeon** at night (P4). ▲ `holdsGiants`. |
| `sunken_belfry` The Sunken Belfry | keep | no lift (geometry-moving events are cut) |
| `bier_barge` The Bier Barge | keep | — |
| `ferry_slip` The Empty Ferry Slip | keep | at dusk the absent ferry is drawn as a faint additive outline; ▲ `holdsGiants` (a dead end at the lake's edge: the farthest water holds the biggest fish) |
| The Breathing Deep (sign style) | keep | its domes are live windows (favour +0.4) |
| *The Lantern Hold* (secret, P4 ▲) | new | opened by the Tuning Fork's note at the Belfry through a §24 `needs` shape (a walk-grid toggle, nothing moves). **Reward: the Deep Line.** |

### 7.7 P4: Found Relics, Vistas, the Chart, Remnants

- **Found Relics** (found in secrets, never bought; a Shrine category shown as owned): **Reed Pole** (the Lily Maze heart; the Rootmat Shallows), **Seedlight Glass** (glints from +2 m; the light-ink door), **Tuning Fork** (the Belfry note; one extra Moonfall a day when struck at the Bell Pool), **Deep Line** (the **Underdepth**: one cast per legend pool per day in all four legend pools, favour +0.8 with Elders allowed). They give later expeditions reasons to return to earlier lakes.
- **Vistas** (2 per lake): **raise the lantern** (hold 1.5 s at a vista stand). The light sweeps out, places in line of sight get a "?" on the chart, +1 Memory the first time. *There is no sitting and no sketching* (too close to Hollow Knight's bench-and-quill ritual).
- **The Chart** at the Map Table. P3: the static lake outline (from arena data and `walkGridFor`) with discovered places, residents, Marked Fish, rumour marks and best fish. P4 ▲: fog-of-war **inked live as you move** (a 64×64 mask per lake in meta). Never updated at a rest point.
- **Remnants** (optional, 12: 3 per lake): a glinting object, a one-line vignette and a rumour.

### 7.8 World budget (in-lake draw calls, high / low)

| item | technique | raft lakes (Mossmere; Sporewood's water) | walking lakes (Glasswater, Pallid) |
|---|---|---|---|
| today's world | — | 30–36 / 24–28 | 30–36 / 24–28 |
| §24 land (walkways, rails, lamps, place and deed props) | §24's own line | — (Sporewood's islands ≤ 12 / 10) | ≤ 20 / 16 |
| Mossmere place props (hands, chains, door, buoy row) | merged into the ring geometry; one instanced buoy row | +4 / +3 | (inside §24's land line) |
| signs | pooled decals + the existing ripple and wake arrays | +2 / +2 | +2 / +2 |
| residents, `sight` fish, glow trails, Moonfall fish | the existing silhouettes and shadow decal, on top of the water | +1 / +1 | +1 / +1 |
| conditions | 1 instanced streak mesh + ≤ 3 mist cards | ≤ +4 / +2 | ≤ +4 / +2 |
| wow happening (one per lake) | §7.3–7.6 | +1 / +1 | +1 / +1 |
| Tally Posts | canvas sprites, ≤ 2 live | +2 / +2 | +2 / +2 |
| Moonfall, Glowtide, Alignment light in water | water-shader terms | 0 / off or reduced | 0 |
| **world total** | | **≤ 50 / 39** (Sporewood ≤ 62 / 49) | **≤ 66 / 52** |

**Frame check, the worst case** (night on foot in the Pallid, Lantern swarm, 2 Tally Posts, the Candle Tide): post 15 + water 2 + world 66 + Wick on foot 15 + beached raft (frozen) 4 + Murk (frozen beyond 12 m) 8 + hooked fish 6 + swarm 10 + combat fx 6 = **132 ≤ 150** (CONTRACT §10's frame target). T6 adds this scenario to `tools/perf.mjs`.

---

## 8. Progression and the challenge curve

### 8.1 The tracks

| track | currency / gate | what you see | full by |
|---|---|---|---|
| **Tackle** (Rod, Line, Reel, Creel) | Shells + proof catches | the bench rack; tackle ratings per lake | Rod, Line and Reel T4 ≈ h13.3 (Creel T4 ≈ h16.7) |
| **Outfit** (Chimney, Brazier, Oars, Boots) | Shells | pegs at the bench, oars on the raft | ≈ h14.6 |
| **Waystones** (lake access) | land the legendary + pay the toll once | stones lit in the sea-gate, bollard lanterns, keepsakes, wings opening | Pallid lit ≈ h7.7; the Lantern-Swallower h10–14 |
| **The Landing** | bringing fish home | 48 frames filling and upgrading, 4 legends under the arch, a 6-fish pond, ≈ 150 visible changes | h25–40 |
| **Collection** | catching | 53 species, 144 class seals, the Elder Log (with Ancients), 29 places (+4 secrets), Old Ledger × 48, Tally Posts | h25–40 |
| **Relics** | Memories | the Shrine's ≈ 60 lanterns relight | fishing shelf ≈ h35; Gloom shelf extra |
| **Wicks, boons, baits** | challenges (either-path) | dozing Wicks at the hearth | ≈ h8 (the Wayfarer ≈ h15–20) |

### 8.2 Gates

| gate | requirement |
|---|---|
| next lake | its legendary landed (gate opens for good) → pass through on an expedition, toll once (180 / 420 / 900) |
| tackle T2 / T3 / T4 | Shells + proof (a Mossmere Prize / a Sporewood Trophy or Glasswater Prize / a Glasswater Trophy) + the lake lit (T3 Sporewood, T4 Glasswater) |
| Elders | a `holdsGiants` place or resident + a favour setup + tackle: commons and uncommons are landable as Elders on their own lake's curve; **headline Elders need T3+** (≥ 50% skilled) and stay hard on T4 |
| legendaries | the legend rule + tackle: Matriarch fair on T0, Grove T1–T2, Sovereign T2–T3, **the Lantern-Swallower needs Line T4** (with T3 Rod and Reel 5 / 41 / 78%; full T4 27 / 83 / 98%) |
| pond tiers | species named + Shells; tier 3 also needs Glasswater lit |
| The Long Descent | all four Waystones lit |
| secrets | Found Relics (P4) |

### 8.3 Hour 1 / hour 5 / hour 15

| | **Hour 1** | **Hour 5** | **Hour 15** |
|---|---|---|---|
| where | the Landing and the Mossmere (raft): the First Outing + 2 expeditions | Sporewood (raft + walking), a first look at Glasswater | the Pallid Deep, plus Elder and Ancient hunts back in earlier lakes; The Long Descent unlocked |
| tackle | T0 → T1 | T2 set, Line T3 (h5.1) | Rod, Line and Reel T4 (h13.3), outfit III (h14.6) |
| the Landing | the Mossmere board and 1–2 plaques filled, pond cleared, 1 Waystone lit | Mossmere wing ≈ 70% filled, Sporewood wing open, pond 3–5, 2–3 stones lit, ≈ 10 lanterns | all four wings open, ≈ 30–35 of 48 frames filled, 2–3 legends under the arch, pond 6, ≈ 25 lanterns |
| what is hard | reading signs and the float's favour, bite tells, first Prize and Trophy fights on starter tackle (Mossmere rare Trophies on T1: 50 / 89% novice / skilled); headline Elders are a wall (Reedjaw 0% on T1) and become Marked Fish; the Matriarch (56 / 82% on T0) | **conditions and places**: rhythm, sequence and deed twists; finding the kept fish (condition-locked); the runner verb; Trophies one tier under (Mildew Trophy 46% skilled on T1 → 58% on T2 → 88% on T3); Sporewood Elders (12% on T2); the Drifting Grove; **Far Water** decisions; saving 420 for the toll while buying T2 | **Elder recipes** (giant place + favour ≥ 1.2 + T4) and **Elder fights that stay hard on full tackle** (headline Elders 69–82%, Ancients 43–51%, each with an old trick); the Lantern-Swallower (27 / 83 / 98% on full T4); legend rematches that grow +7% each landing; deep-lake Old Ledger records; range on foot (5 min of lantern at night away from Waylamps); long Pallid expeditions under Far Water |
| typical failure | a late hook; holding through a surge; a Prize thrown at its last pip; an Elder Reedjaw snapping on starter tackle | a Trophy snapped one tier under; no kept species (wrong condition); a marked Trophy released at its last night because you stayed for day 5 | an Elder lost to its old trick at 60–80%; an Ancient snapped; guttering far from a lamp; the Brittle Line phase |
| land rate of hooked fish | commons ≥ 97%, Prize 77–93%, Trophy 50–89% | Keepers ≥ 95%, Trophy 58–90%, Elder on curve 15–35% | Trophy ≥ 90%, headline Elders 65–80% (T4), Ancients 40–55% |
| new species / hour | ≈ 8 | ≈ 3 | ≈ 1 (53 by ≈ h20) |
| something notable | every ≈ 1 min | every 2–4 min | every 6–10 min at random, plus 1–2 headline goals per session (today's rumour, the Ledger, Old Ledger records, Marked Fish, empty frames) |
| snuffed | ≈ 1–3% (short expeditions, still nights) | ≈ 4–8% (Lantern) | ≈ 6–10% (Lantern, long foot expeditions) |

### 8.4 What keeps it challenging

1. **Big fish are hard and stay hard.** Size scales the fight, Elders get steeper above the cut (per-lake Elder age, a fatigue floor of 0.8) and every Elder plays an old trick. Full tackle lands headline Elders 69–82% and Ancients 43–51%; the return trip to the Mossmere's Elder Reedjaw is still a one-in-five loss on T4.
2. **Giants live in specific places, under specific conditions.** Residents persist until landed; pressure (−0.12 per catch) stops camping; the float shows how good your setup is, so the recipe is learnable rather than luck.
3. **Gear is earned by fishing.** Proof catches make each tier a feat, not a purchase.
4. **Bringing it home is a risk in every mode.** Far Water squeezes oil and Murk's visits, the Live Well clock runs, and oil range matters on foot. Combat adds Scorched oil loss in Lantern and today's full stakes in Gloomtide.
5. **Legend fights are gear-and-skill walls** (the Lantern-Swallower: 27% for a novice even on full T4), and each one grows on rematch.
6. **Visible ceilings:** the Old Ledger mark (z 2.3) for every species, Elders (0.4% at base), Ancients (0.1%), and the dotted "said to reach" (z 3.6), a near-asymptote you see on the page and on the wall.
7. **Opt-in difficulty:** Lantern → Gloomtide → The Long Descent, each with its own records.
8. **Never hopeless:** commons always land, the bare hook is free, Last Flicker comes once a day, pity bites at low oil, Murk's Pity once per expedition, the near-miss card always names the cause and a fix, and Marked Fish come back weakened.

### 8.5 QA pacing targets

| metric | target |
|---|---|
| expedition length | median 20 min (3–5 days); a one-day outing ≈ 6 min; a home visit ≤ 2.5 min median |
| first cast and first measuring moment | ≤ 0:30 (the Landing's jetty) |
| first Prize / first Trophy | ≤ 5 min in the Mossmere for ≥ 55% of players / ≤ h1 for ≥ 60% |
| first Elder hooked / landed / headline-predator Elder / Ancient | h1–3 / h2–6 / h6–10 / h12+ (owned by T5) |
| legendaries (first landing) | 0.6–1.2 / 2.5–4 / 5–7 / 10–14 h |
| species named | ≤ 9 in the first 30 min · 44 by h12 · 53 by h20+ |
| notable events | every 1–3 min in hour 1; personal bests ≈ 2–4 per 20-min session until h10 (a 1/n record process; T5 measures); ≥ 1 Trophy per 2 sessions from h3 |
| places | Mossmere 6 of 8 by h2; all 29 by h14; first mastery by h2 |
| fight share | Still 0% · Lantern 4–7% · Gloomtide 28–32% |
| snuffed per expedition | Still ≤ 3% (home by day 3) / 6–10% (past day 4) · Lantern Still + 2 · Gloomtide 25–55% early |
| Memories / h | 120–180 (Still within 15% of Lantern) |
| Shells / h | §9.1 (Still +3%, Gloomtide −8%) |
| shortest profitable loop | no loop earns > 1.5× the median Memories/h or Shells/h (T3 checks gate hops, one-day outings, Ledger refreshes, the Pilgrim Salmon, cove fishing) |
| land rates | §5.9 per mode (the reel sim runs once per night mode, since combat interrupts fishing) |

---

## 9. Economy

### 9.1 Income and expense per in-lake day (average player, Lantern)

Assumptions: a 5-minute day; a 4-day expedition plus 2 min at home = **10.7 in-lake days per hour**. Fish landed per day include night fishing and fall with depth (longer fights, more walking). Commons go to oil and food first. Shells per sold fish = the lake's sold-species mix × 0.66 × 1.428 (size and class, at the real favour mix, §6.2) × ≈ 1.15 (quality), which keeps income per fish equal to today's.

| lake | fish landed / day | eaten or rendered | marked for home | sold | Shells / sold fish | fish Shells | Ledger and bounties | gross | bait and supplies | **net / day** | **net / hour** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| The Mossmere | 5.0 | 1.2 | 0.3 | 3.5 | 17 | 60 | 15 | 75 | 8 | **67** | **717** |
| Sporewood Pools | 4.6 | 1.4 | 0.3 | 2.9 | 35 | 102 | 25 | 127 | 16 | **111** | **1,188** |
| Glasswater Vault | 4.2 | 1.8 | 0.3 | 2.1 | 69 | 145 | 40 | 185 | 38 | **147** | **1,573** |
| The Pallid Deep | 3.8 | 1.8 | 0.3 | 1.7 | 114 | 194 | 60 | 254 | 55 | **199** | **2,129** |

Mode adjustments: Still +3% (no combat kit); Lantern as shown (combat kit ≈ 60–120 Shells per expedition, roughly offset by Warden Shells); Gloomtide −8% (more kit, less fishing time). Long expeditions render more of the catch under Far Water (§3.4); the balance sim (T3) owns the per-day curve. **Satiety:** drain 0.10 × 0.5 × zone, so 15 per Mossmere day; one eaten common keeps you ≥ 60% (Well-fed: reelSpeed +0.08, sweetZone +0.01, +1 dawn mend in combat modes). There is never a starvation penalty.

### 9.2 Cumulative Shells and the tackle timeline (check)

Lake time spans (average player): Mossmere 0–1.5 h, Sporewood 1.5–4.5 h, Glasswater 4.5–8.5 h, Pallid 8.5 h+. Cumulative net (incl. the 20 starting Shells): 1,096 at h1.5 · 4,660 at h4.5 · 10,952 at h8.5 · 22,661 at h14 · 26,919 at h16. Purchases in a sensible order, each placed at the first moment income covers it:

| hour | cumulative net | purchase | cumulative spend |
|---|---|---|---|
| 0.6 | 450 | T1 Line, Rod, Reel, Creel | 430 |
| 0.8 | 594 | Outfit: Chimney I + Brazier I | 590 |
| 1.0 | 701 | Heartmoss × 2 | 670 |
| 1.2 | 880 | Sluice toll | 850 |
| 1.7 | 1,333 | T2 Line (proof: a Mossmere Prize) | 1,300 |
| 2.1 / 2.4 / 2.7 | 1,808 / 2,224 / 2,521 | T2 Reel, T2 Rod, T2 Creel | 1,750 / 2,200 / 2,470 |
| 2.9 | 2,759 | Feather Fly, Glimmer Spoon, Bone Jig | 2,720 |
| 3.0 | 2,937 | Glowcap × 2 | 2,900 |
| 3.2 | 3,115 | Outfit: Oars I + Boots I | 3,060 |
| 3.4 | 3,412 | Pond tier 2 | 3,360 |
| 3.8 | 3,828 | Glasswater toll | 3,780 |
| 4.2 | 4,303 | Outfit: Chimney II + Brazier II | 4,260 |
| 5.1 | 5,682 | **T3 Line** (proof: a Sporewood Trophy) | 5,660 |
| 6.0 / 6.9 | 7,098 / 8,513 | T3 Reel, T3 Rod → the Sovereign at 85 / 98% | 7,060 / 8,460 |
| 7.1 | 8,828 | Prism Moth × 2 | 8,800 |
| 7.7 | 9,772 | Pallid toll | 9,700 |
| 8.4 | 10,873 | Moth Popper, T3 Creel | 10,800 |
| 10.0 | 14,039 | **T4 Line** (proof: a Glasswater Trophy) | 14,000 |
| 10.3 | 14,677 | Last Candle × 2 → Lantern-Swallower attempts (5 / 41 / 78%) | 14,640 |
| 11.8 / 13.3 | 17,871 / 21,064 | T4 Reel, T4 Rod (27 / 83 / 98%) | 17,840 / 21,040 |
| 13.5 | 21,597 | Outfit: Oars II + Boots II | 21,520 |
| 14.6 | 23,938 | Outfit III × 4 | 23,920 |
| 15.2 | 25,216 | Pond tier 3 | 25,120 |
| 15.8 | 26,387 | Lantern Lure | 26,320 |
| 16.7 | 28,303 | T4 Creel | 28,240 |

Income and the main sinks (28,240) meet at ≈ h16.7. Post-game Shells go to legend rematch baits and a **cosmetic shelf** at Murk (raft pennants, cloak dyes, lantern-glass tints, 200–1,500 each, ≈ 6,000 in all). These never touch fishing power.

### 9.3 Price list

| item | price |
|---|---|
| tackle T1 / T2 / T3 / T4 per slot | Rod, Line, Reel 120 / 450 / 1,400 / 3,200 · Creel 70 / 270 / 840 / 1,920 (catalogue 18,610) |
| outfit (4 items × 3 levels) | 80 / 240 / 600 each (catalogue 3,680) |
| lures (permanent) | Feather Fly 40 · Glimmer Spoon 90 · Bone Jig 120 · Moth Popper 260 · Lantern Lure 1,200 (a lost lure costs 25% to replace) |
| baits | as today (Mire Worms 8 … Glass Larvae 48; × baitMult per lake) · Wick-Worms 30 (§24) · Cut Strip free (from a fish) |
| legend baits (per attempt) | Heartmoss 40 · Glowcap Bulb 90 · Prism Moth 170 · **Last Candle** 320 (was Drowned Marrow) |
| tolls (once per lake, forever) | 180 / 420 / 900 |
| supplies (× supplyMult; oil × Far Water from day 5) | oil flask 18 · oil cask 50 · moss cake 14 · mushroom loaf 38 · Stake Lantern 40 (§24) · **Murk's Chum** 30 (1 per visit) · combat modes only: Wax Patch 45, Flare Powder 30 |
| combat kit (per expedition, combat modes only, at 40% of today's prices) | Searing Mantle 22 / 56 / 120 / 224 · Moth-Dust Lens 36 / 80 / 168 · Flint Striker 22 / 60 / 132 · Barnacle Hull 44 / 100 / 208 · Ember Hearth 104 / 240 |
| moved to persistent tackle and outfit (removed from the run shop) | Ashwood Rod, Whalebone Tip, Braided Gut, Silverthread, Brass Spool, Whisper Drag, Woven Creel, Glimmer Spoon, Thick-Glass Chimney, Rendering Brazier, Long Oars, Cork-Soled Boots · cut: Trembling Feather, Frost-Moss Lining (the Torn Ledger relic covers sellMult) |
| the Landing | keep-pond tier 2: 300 · tier 3: 1,200 |

### 9.4 Memories

| source | Memories | banked |
|---|---|---|
| new species | 3 | instantly |
| class first per species | Prize 1 · Trophy 4 · Elder 12 | instantly |
| first Ancient in each lake | 10 | instantly |
| first mount per species and class (hung or kept in the pond) | Prize 2 · Trophy 6 · Elder 15 | on return |
| first release per species and class | Prize 1 · Trophy 3 · Elder 8 | instantly |
| place discovered / mastered | 2 / 10 | instantly |
| rumour solved · Old Ledger beaten | 3 · 5 | instantly |
| legendary: first landing / rematch | 15 / 8 | instantly |
| challenges (48) | ≈ 1,170 in all (today's 831 + tier IV 185 + tier V 155) | instantly |
| **expedition tally** | 3 per dawn reached in the lake · 1 per still night (Still, the First Outing, a still Lantern night, a lamp-watch) or **4 per Lantern swarm night** (Gloomtide: `nightsSurvived × (3 + zoneIndex)`) · 10 per lake crossed (only if a full calm follows in that lake) · 2 per Ledger request | on return (× 0.5 if snuffed) |

**Mid-game hour (≈ h5):** species 9 + class firsts 13 + places 9 + rumours 3 + Old Ledger 4 + first mounts 8 + first releases 3 + tally 64 (Lantern: 12 + 10 + 2 = 24 per 4-day expedition × 2.67; Still: 18 × 2.67 = 48) + challenges ≈ 25 + legends ≈ 5 = **≈ 143/h in Lantern, ≈ 127/h in Still** (−11%, inside the ±15% target).

**Totals and the relic curve.** The one-time pool is ≈ 4,600 Memories (challenges 1,170 · species 159 · class firsts 816 · first mounts 1,104 · first releases 576 · places 348 · rumours 72 · Old Ledger 240 · legends 60 · Ancients 40), plus the tally (≈ 48–64/h). Estimate: ≈ 2,700 earned by h15 and ≈ 4,800 by h35 (the Elder-heavy third of the pool comes late). **Relic shelves:** the Fishing & Exploration shelf (kept relics plus §24's and the new ones, ≈ 46 levels) costs ≈ 8,800 at today's prices; **× 0.55 → ≈ 4,840**, so its first 25 levels (≈ 2,000) arrive by ≈ h12 and the shelf completes ≈ h35 if nothing is spent on the Gloom shelf. The Gloom shelf (Salt-Glass Lens, Stub of the First Wick, Grandsire's Tinderbox, Barnacle Cloak, Ember in Resin; ≈ 14 levels) costs ≈ 3,125 × 0.7 ≈ **2,190**, an extra sink for combat players (swarm-night tally, Wardens, 9 Gloom challenges ≈ 220). The Shrine's lantern count is the total relic levels, **read from data** (≈ 60). **Remembrance's** `memMult` multiplies the **expedition tally only**. **New relics:** *Measuring Cord* (60 / 180: L1 the bite tell also shows an estimated length; L2 Prize+ hooks get +1 pip) · *Murk's Spyglass* (150: forecast two days ahead in every lake; the Map Table marks known residents) · *Rumour Shell* (120 / 300: +1 rumour tier per Murk visit). *Second Wick* relights once per expedition in every mode. Seven Knots is halved (lineStrength +0.05 per level). **Cut and refunded on migration:** Murk's Old Debt, Waystone: Sporewood / Glasswater / Pallid Deep.

---

## 10. Retention hooks

| hook | rule | why it pulls |
|---|---|---|
| **The empty frame** | one frame per species on the Long Wall, a "?" until named, an ink silhouette until filled, a seal that upgrades Prize → Trophy → Elder (gold thread for an Ancient) | there is always a visible gap on the wall until the collection is complete |
| **Marked Fish: "still out there"** | escaped Trophy+ fish persist (≤ 6) at their place, with their size and progress, and come back weakened | the strongest one-more-expedition hook: "the 131 cm Reedjaw that broke your Braided Gut" |
| **Residents** | three giants per lake that stay until you land them (or 3 in-lake days pass), shown on the Map Table | a named target waiting at a known place |
| **Far Water** | each dawn out improves the water and raises the cost of the way home | "one more day" is a real decision every expedition |
| **Old Ledger records** | one figure per species at z 2.3; Murk's bell rings across the lake when you beat it; your name is chalked on his barge at home | concrete targets anchored to a character |
| **Today's rumour** (real date) | one Elder target per calendar day at the Map Table, always at a giant place, favour +0.3 there | a reason to play today |
| **Murk's Ledger** | 3 persistent requests (class, variety, condition, release, bring-home, Old Ledger); **one refreshes per completed in-lake day**, a lapsed slot after a real day; combat requests only in combat modes | medium-term goals that survive any snuff |
| **Rumours** | tiered (vague → place → condition), one pinned | the treasure map to places and kept fish |
| **The forecast** | Murk names tomorrow's condition ("Drizzle in the Mossmere tomorrow: the stone hands overflow every 25 s") | plan the next expedition before you leave this one |
| **Tally Posts** | your best fish inked on every place's post | "the world remembers your fish" |
| **Proof catches and the test buoy** | the Homecoming card names the next tier's proof and price; new tackle can be felt on the test buoy at once | gear progress always has a fishing goal and an immediate payoff |
| **Legend rematches** | each later landing +7% (cap × 1.5), with a growth line | bosses worth fighting again, with melancholy |
| **Collection** | 53 species, 144 seals, the Elder Log with Ancients, 29 places (+4 secrets), Old Ledger × 48 | the long tail |
| **The Landing grows** | ≈ 150 visible changes (§3.7.4) until the end | progress you can walk around in |
| **The Long Descent** | today's roguelite, with its own records | the prestige run for request-2 players |

---

## 11. Changes versus the current DESIGN, section by section

| § | section | verdict | change |
|---|---|---|---|
| header | vocabulary | modify | add: the Landing, expedition, First Outing, Set Out, Homecoming, Snuffed, Scorched, Still / Lantern / Gloomtide (modes), Night Rise, Far Water, favour, size classes (Small / Keeper / Prize / Trophy / Elder; Ancient), Elder Log, Old Ledger, Marked Fish, resident, Tally Post, Long Wall, frame, keep-pond, Gear Bench, outfit, Map Table, Homeward Waystone, Live Well, lamp-watch, tackle rating, The Long Descent, Well-fed, Quayling. Keep every existing term. |
| 1 | vision and pillars | **rewrite** | §1 of this brief. The premise is kept; the loop sentence becomes "set out, find remarkable places, land remarkable fish, bring them home". |
| 2 | core loop | **rewrite** | §2 of this brief (cast, day, expedition, home, campaign). |
| 3 | controls | modify | add Landing walking (§24 controls), tap-to-walk in the hub, the station pill, long-press on the float (favour list), the reel-icon drag preset (Reel T2+). No new mid-fight inputs. Cutting stays "hold movement 0.6 s". |
| 4 | sailing and arenas | modify | raft handling kept. Mossmere `arena.places` (8) and the buoy-lantern row. Feeding spots replaced by signs. Gates permanent. A Homeward Waystone per lake (≥ 25 m from spawn). Murk docks kept; days 1–2 then odd days. |
| 5.1–5.3 | aim, species roll, bite | modify | cast kept; favour and place caps feed the roll; class bite tells; let it pass; pips |
| 5.4 | species | **modify** | 32 → 53 with `size {L50, sigma, k}`, `family`, recolours, resizes (§6.5) |
| 5.5 | reel model | modify | size scaling before `createReel` with Elder age, step and stamina; stamina × 1.4; easing by load; fatigue clock (Elder floor 0.8); old tricks; runner (P3) and sulker (P4) |
| 5.6 | legendaries | modify | authored sizes ≥ 1.4× the lake's longest; +7% growth per landing; Still and Lantern snags for the Lantern-Swallower; legend rule unchanged |
| 5.7 | feeding spots | **cut / replace** | mote columns cut → six signs (§5.1); Tide Chart → Murk's Chum |
| 5.8 | weight and quality | **replace weight**, keep quality | stretched z model; value / food / oil from z (× 0.66); `sizeK` cut |
| 5.9 | night fishing | modify | Night Rise in every mode; the slack budget only matters in combat modes |
| 5.10 | `fishing.view` | modify | add `favour`, `sizeClass` (after the first breach), `pips`, `biteTell` |
| 6.1 | day phases | modify | 180 (185 foot lakes) / 20 / 90 / 10; +30 s Arrival Hush on expedition day 1; no clock at the Landing |
| 6.2–6.5 | drains, damage, healing | **modify** | oil context table (raft / foot / lamp × calm / dusk / night; raft night 1.0 in all modes) and Far Water; satiety → Well-fed, starvation cut; Embers only in combat modes |
| 6.7 | death | **replace** | Snuffed (oil only in Still and Lantern; Embers too in Gloomtide), Scorched in Lantern (§3.3, §4.1); wake at the Landing's hearth; Second Wick relights once |
| 6.8 | anti-frustration | keep | plus Murk's Pity once per expedition |
| 7 | night swarm | keep (demoted) | night-mode multipliers on `difficultyFor`, `swarmWindow(k)` (Lantern k 0.05 → 0.50), the Lantern Warden cadence, fodder → oil in Lantern, no snaps or hooked theft in Lantern, Heat arrival offsets |
| 8 | lantern combat | keep | aura ring hidden in calm and dawn (§4.7); Flare and Embers hidden in Still |
| 9 | economy and creel | **rewrite** | persistent Shells; §9 of this brief; creel = carry capacity with Live Well slots and nights; Trophy-or-Toll → Mark for home; per-run upgrades → outfit (persistent) and combat kit (per expedition) |
| 10 | boons and levelling | modify | the Angler pool (+6), XP per mode, Angler-offer cap, banked level-ups, deep-start picks, Kindles only in combat modes |
| 11 | Wicks | modify | quirks gain fishing halves (incl. §24's Wayfarer); either-path unlocks; Ashwick's Gloom-fed variant does not exist |
| 12 | challenges | modify | 30 → 48 (+§24 tier IV, + tier V *The Measure*), a Gloom tab (9), rewrites (list below) |
| 13 | merchant and shop | **modify** | Murk at home (Sell, Bait, Supplies, Ledger, Rumours) and in the lake (Sell, Bait, Supplies, Ledger turn-ins, combat kit in combat modes); tackle and outfit move to the Gear Bench; Murk recoloured off green |
| 14 | zones and gates | modify | gates open for good; toll once; Waystones lit by legend + toll; crossing tally rule; `COVE` hub zone (not in `ZONES`) |
| 15 | bounties | modify | in-lake bounties ≈ 85% fishing templates (combat templates only in combat modes) + Murk's 3-slot persistent Ledger |
| 16 | Journal | **modify** | field guide: ruler, class seals, field notes and best setup from your own catches, Elder Log, places page, rumours, mount book; lake perks need a Prize of every non-legendary species in that lake (= a completed wing) |
| 17 | meta | modify | instant Memories; expedition tally (crossing rule); relic shelves (× 0.55 / × 0.7); lantern count from data; memMult tally-only; Waystone relics and Old Debt cut and refunded; records extended (§6.3) |
| 18 | pacing targets | **rewrite** | §2.2, §8.3, §8.5 of this brief |
| 19 | art direction | modify | the palette rework (other team) applies; fish recolours (§6.6); the Mossmere as rust-and-iron harbour (§7.3); the Landing palette (§3.7.5); camera presets (sail 24° / 15 m / aimY 1.4 / fov 52, fish 28° / 13 m, walk 34°, plus `trophy`, `cove`, `gate`, `wall`, `hang`, `pond`, `setout`, `vista`); per-lake hue pairs with verdigris ≤ 2% |
| 20 | audio | modify | measuring cord ticks and class chimes, seal stamp, bite-tell sounds, Night Rise motif, Stillnight bed, cove ambience, Homecoming and mount stings, sign sounds, condition loops; no "descend" sting on hub transitions |
| 21 | UI | modify | day HUD by mode; the float's favour; Far Water and Live Well readouts; new screens: Set Out, Tackle, Homecoming, Snuffed, near-miss card, measuring overlay, mount and pond dialogs; title becomes the boot overlay over the Landing |
| 22 | originality | modify | add §13.3 of this brief; rename Drowned Marrow → Last Candle and the Pale Leviathan → the Lantern-Swallower; the Mossmere's harbour re-theme |
| 23 | implementation | modify | `createExpedition` replaces `createRun` (copies `meta.tackle` and `meta.outfit` into stats via `getStats`); flow `hub`; the CONTRACT additions in §12 |
| 24 | exploration on foot | keep (owner) with **routed changes ▲** | calm → 180 / 185; Arrival Hush on expedition day 1; **shortcuts persist across expeditions**, lit Waylamps reset; 2 `watch` lamps per lake; "Shore of Last Rafts"; place fields `holdsGiants` / `maxClass` / `resident` / `tally`; rules `sight` and `drift`; 4 kept-species additions (P4); a static Chart (P3) and fog-of-war (P4); 3 secrets (P4); all keyed by place id and re-synced before merge |
| App. A | balance sim | modify | add the expedition and fishing-economy model with per-mode profiles (T3); the reel sim becomes `reel-v3-sim.mjs` (T1); the pacing sim (T5) |

**Challenge rewrites** ("run" or "descent" scope = expedition scope):

| # | challenge | v3 |
|---|---|---|
| 2 | First Dawn | "Spend your first night out" (any mode) |
| 4 / 11 | Three Long Nights / The Long Vigil | nights out in one expedition, any mode (11 still unlocks Tallow) |
| 9 | Unwarded | either path: silence a Warden **or** land 3 night-only species at Prize or better (Ashwick) |
| 10 / 25 / 26 | reach a lake | "Light the … Waystone" |
| 15 | Night Angler | land 3 fish during a single night (any mode) |
| 19 | Heavyweight | "Land a non-legendary fish over 15 kg" (Shimmerfly bait) |
| 21 | Murk's Favourite | earn 1,000 Shells in one expedition |
| 22 | What the Flame Remembers | either path: Kindle a weapon **or** raise an Angler boon to level 5 (Gambler's Wick) |
| 28 | Many Flames | "Land a Trophy in the Glasswater Vault with 3 different Wicks" |
| 29 | The Light Comes Up | "Land the Lantern-Swallower" |
| 30 | The Complete Chronicle | 53 names |
| §24: 33 / 36 / 39 | Four Shared Flames / The Long Way Round / Every Candle | 33 and 39 per expedition; 36 becomes "Open 3 shortcuts" (they now persist) |
| §24: 40 | Every Still Place | master every place in the three lower lakes (21 places); unlocks the Wayfarer |
| **Gloom tab** (combat-only, combat rewards only; 9) | 5 Unclenched, 8 Gloombreaker, 12 Untouched, 13 Bonfire Night, 14 Full Flame, 24 Lamplighter's Vengeance, 27 Four Silences, §24's 37 Held the Crossing, 38 Far From Any Candle | |
| **tier V *The Measure*** (new, 8) | 41 First Prize (+5, reveals Measuring Cord) · 42 First Trophy (+10) · 43 First Elder (+20) · 44 Ten Trophies (+15, reveals Rumour Shell) · 45 a Prize of every non-legendary species in one lake (+30, rod charm) · 46 an Elder in every lake (+40) · 47 beat 5 Old Ledger records (+20, reveals Murk's Spyglass) · 48 bring 3 marked fish home from one expedition (+15) | |

---

## 12. Per-module work list

Effort: **S** ≤ 2 days · **M** 3–6 days · **L** 1–2 weeks (one implementer).

**Phases.** The places come before the home: request 5 is "finding cool locations with interesting fish species and big sizes", and the Mossmere's raft places need nothing from §24's foot controller, while the cove does. Each phase ends at a gate: the hue report (≤ 2% green-teal chroma per lake and on the Landing, Murk included), the draw-call scenarios, the reel-sim land-rate targets (§5.9), `validate-data`, and from P3 the balance sim.

| phase | goal | length (parallel modules) |
|---|---|---|
| **P1: the feel shift** | angler-first inside today's run structure, testable at once: cameras, no combat UI by day, honest stretched size, the z model with the **float's favour**, bite tells, pips, steeper Elders with old tricks, the ceremony, night modes (Lantern window, no snaps, Scorched), the oil table, Well-fed, signs, recolours (Murk too), banked level-ups, and the **`holdsGiants` stopgap** (legend-pool rims and deep pools) so Elders exist from the first build | ≈ 2–3 weeks |
| **P2: the Mossmere's places and giants** | the 8 places and their props, `holdsGiants`, persistent residents, `sight` and `drift`, the pre-roll primitive, `uClear` and **Moonfall**, conditions, rumours, today's rumour, forecasts, Tally Posts, Marked Fish and the near-miss card, the Mossmere's 4 new species (→ 36) | ≈ 3 weeks (no §24 dependency) |
| **P3: expeditions and the Landing** | the hub flow and contract, the cove, the walls and mount batch, the pond pass, Homecoming and Snuffed, persistence, tackle and outfit at the Gear Bench, Far Water and the Live Well, First Outing and Set Out, Continue with position, the Ledger, 48 challenges, relic shelves, The Long Descent, save migration, cove fishing, **the runner** with Sporewood, §24's place data ▲, species → 47 | ≈ 4–5 weeks (needs §24's foot core; fallback Landing v0) |
| **P4: wonder and depth** | the sulker, the other three wow happenings, species → 53, age marks, Found Relics and secrets, Vistas, the Chart's fog, legend growth, Remnants, the postcard card | ≈ 4–6 weeks (content) |

| module | id | item | phase | effort | depends on |
|---|---|---|---|---|---|
| **render** | R1 | camera presets: sail 24° / 15 m / aimY 1.4 / fov 52; fish 28° / 13 m; **the reel camera follows line distance and fight state only, never size class** | P1 | S | — |
| | R2 | `trophy` mode (distance `clamp(1.2 + 1.6L, 1.6, 16)` m, yaw toward `place.landmark`, crane to 50° above 4 m); a timescale hook for the leap reveal | P1 | S | F3 |
| | R3 | `cove`, `gate`, `wall`, `hang`, `pond`, `setout` modes; `title` orbits the cove; phone-portrait check of arch visibility | P3 | S | W2 |
| | R4 | `vista` mode (raise the lantern) | P4 | S | — |
| **water** | Wa1 | Glowtide sparkle term with a low-tier switch | P1 | S | — |
| | Wa2 | sign decals through the existing ripple and wake arrays (no new uniform arrays) | P1 | S | F6 |
| | Wa3 | `uClear[2]` discs + a 256² floor-painting sampler (128² and radius × 0.7 on low); Moonfall first, then the Alignment | P2 | M | — |
| | Wa4 | condition hooks (Hush swell × 0.2, Drizzle ripples) | P2 | S | W5 |
| | Wa5 | **pond pass**: `uPondHole` discard in the lake shader, floor-painting disc at y −0.7, transparent pond surface drawn after the pond fish (+2 calls) | P3 | S | W2 |
| | Wa6 | `applyZonePalette` resolves `COVE` on `zone:change {hub:true}` (no `ZONES[0]` fallback) | P3 | S | D2 |
| **world** | W1 | remove the mote-column visuals; the legend pool's column becomes a low glimmer | P1 | S | F6 |
| | W2 | **COVE builder**: `world.setZone('cove')` resolves `COVE` (R 42, the channel `shoreNotch`); quay, galleries, ramp and stair from the walk-shape extrusion; the two walls and the frame atlas; the new sea-gate arch (`taperTube`); 4 new Waystones (per-stone emissive); instanced lamps, candles and shrine lanterns; hearth, bench, table, lectern, boards, the chart material; pond rim; keepsakes. Budget §3.7.7. | P3 | L | §24 foot core, Wa5, A4 |
| | W3 | Landing growth states from meta flags (visibility and emissive only: frames, wings, sailcloth, stair, lanterns, keepsakes) | P3 | M | Pg3 |
| | W4 | Mossmere place props (the new Cupped Hands with the aqueduct spout, chains, the door, the buoy-lantern row), Tally Post sprites | P2 | M | D3 |
| | W5 | conditions: 3 archetypes × 4 lake presets (particles, fog, uniforms), no geometry movement | P2 | M | D3 |
| | W6 | Moonfall (shaft swing, `uClear` discs, the Ferry-Market floor painting) | P2 | M | Wa3, F9 |
| | W7 | The Bloom, The Alignment, The Candle Tide (one per lake, ≤ 1 call each) | P4 | L | Wa3 |
| | W8 | secrets (`shoreNotch`, §24 `needs` shapes), 12 Remnants | P4 | M | §24 owner |
| **actors / models** | A1 | honest stretched scale: `createFish(species, {z})` → L50·e^(σz + 0.06·max(0, z − 1.04)²) in metres; remove the ±22% weight scaling | P1 | S | D1 |
| | A2 | measuring poses palm / arms / hang / alongside; the knotted-cord prop | P1 | M | — |
| | A3 | recolour the green fish and glows (data) | P1 | S | D1 |
| | A10 | **Old Murk off green**: skin #5a5444, lichen flecks #b8b0a0, lamp glow, halo and PointLight #ffe2b0; the merchant tip says "his lantern" | P1 | S | — |
| | A4 | **`models.buildMountBatch(entries)`**: frozen mounting pose; body and emissive atlases, fins on the shared atlas with vertex colours, one translucent material, bones and outline, per-fish outline thickness attribute, instanced lure glows; LOD ≤ 600 triangles beyond 12 m; ≈ 9–12 calls | P3 | M | A1 |
| | A5 | `raft.freeze()` and `merchant.freeze()` (≈ 26 → 8 and → 4 calls): at home, and in lakes whenever moored with the Wick > 12 m away | P2 | S | — |
| | A6 | `actors.pond`: up to 6 fish (≤ 1.4 m) on looping paths inside the pond hole (2 live on low, the rest resting in the batch) | P3 | M | A1, A4, Wa5 |
| | A7 | dozing Wicks: one merged static silhouette | P3 | S | — |
| | A8 | `sturgeon` shape, `marks` pattern, barbel and needle-snout flags | P2 | M | — |
| | A9 | age marks on 10 headline species | P4 | M | A1 |
| **fishing** | F1 | stretched z model (replaces `rollWeight`), the favour stack by family, classes and Ancient, place caps, pressure, the `holdsGiants` stopgap | P1 | M | D1 |
| | F2 | size → difficulty before `createReel` (Elder age per lake, step × 1.08, stamina g^1.3, old tricks); reel edits (stamina × 1.4, easing by load, fatigue clock with the Elder floor 0.8) | P1 | M | T1 |
| | F3 | cut the 1.45× boost (`fishing.js:663`); leap reveal for Prize+ | P1 | S | A1 |
| | F4 | class bite tells, let it pass, hook-hold pips | P1 | M | F1 |
| | F5 | ceremony orchestration; records written at the seal stamp (`fish:measured`); favours on the card; best setup per species | P1 | M | A2, U3, Pg1 |
| | F6 | signs replace feeding spots | P1 | M | Wa2 |
| | F7 | Night Rise; mode rules (Lantern: slams never snap, no creelsnatch while hooked; the slack budget only in combat modes) | P1 | S | C1 |
| | F13 | `fishing.view.favour {mu, notches, terms[]}`; the "gone quiet" flag at pressure ≤ −0.36 | P1 | S | F1 |
| | F8 | near-miss data; Marked Fish (the `wounded` rule; ≤ 6 in meta; resident behaviour at their place) | P2 | S | Pg3 (meta) |
| | F9 | the pre-rolled fish primitive (decals on top of the water); rules `sight` and `drift`; **persistent residents** (N(1.6, 0.6) truncated at 1.88; re-roll on landing or after 3 in-lake days); `holdsGiants` | P2 | M | D3 |
| | F10 | runner (P3, simulated first) and sulker (P4) surge kinds | P3 / P4 | M | T1 |
| | F11 | legend growth (+7% per landing, cap × 1.5) | P4 | S | Pg3 |
| | F12 | cove fishing: the Quayling pool, the test-buoy practice fight, no sale | P3 | S | S4 |
| **player / survival** | S1 | phases 180 (185) / 20 / 90 / 10, +30 s on expedition day 1 | P1 | S | D1 |
| | S2 | the oil context table; guttering → snuffed; only oil snuffs in Still and Lantern | P1 | S | D1 |
| | S3 | satiety → Well-fed (no starvation) | P1 | S | D1 |
| | S6 | lamp-watch detection at dusk end (2 watch-lamps per lake) | P1 | S | C1 |
| | S4 | hub mode (no clock or drains), foot movement, tap-to-walk, station pills, spawn at the hearth or jetty by `from` | P3 | M | §24 foot core |
| | S5 | Homeward Waystone (≥ 25 m from spawn) and Ride home; gate passage within an expedition; the crossing tally rule | P3 | S | Pg2 |
| | S7 | **Far Water** (favour, resident shows, Murk's odd days, oil price, rendered oil, night burn) and the **Live Well clock** | P3 | M | Pg2 |
| | S8 | save and restore `run.pos`, oil and the phase clock on autosave, phase change, `visibilitychange` and `pagehide`; snap with `walkGridFor`; guttering or 0 oil → Snuffed on load | P3 | S | Pg2 |
| **combat** | C1 | night modes: `difficultyFor` multipliers, `swarmWindow(k)` (Lantern 0.05 → 0.50), the Lantern Warden cadence, fodder → oil, lamp-watch; the First Outing all still | P1 | M | D1 |
| | C2 | aura ring hidden in calm and dawn; Flare and Embers by mode | P1 | S | U1 |
| | C3 | XP per mode (Still × 1.4, no zone factor, discovery cap), the Angler-offer cap, 6 new Angler boons, **banked level-ups** outside swarms | P1 | M | D1 |
| | C4 | Still and Lantern legend snags (the Lantern-Swallower) | P1 | S | — |
| | C6 | Lantern stakes: **Scorched** (oil −30, forced lamp-watch, no Cinders), slams never snap, no creelsnatch while hooked (P1); Heat arrival offsets, deep-start picks, Draft levels non-Angler (P3) | P1 / P3 | S | C1 |
| | C5 | off in the hub; The Long Descent = Gloomtide + per-run UPGRADES + its own purse | P3 | S | Pg8 |
| **progression** | Pg1 | value / food / oil from z (× 0.66); class firsts; instant Memories; first-release Memories | P1 | M | F1 |
| | Pg9 | persistent places, Tally records, rumours, today's rumour, forecasts | P2 | M | D3 |
| | Pg3 | meta: residents and Marked Fish (P2); shells, tackle, outfit, lures, mounts, pond, Landing flags, Waystones, shortcuts, Elder Log, places, Ledger (P3); **save migration** (keep the Journal and records; refund cut relics; rename `pale_leviathan` → `lantern_swallower` and `drowned_marrow` → `last_candle`; welcome purse 200 Shells; a run in progress ends at the next title as a "return home") | P2 / P3 | M | — |
| | Pg2 | **expedition lifecycle**: `createExpedition`, First Outing, Set Out, Homecoming, Snuffed summary, gate passage, tally rules; event order per the CONTRACT below | P3 | L | Pg3, S4 |
| | Pg4 | tackle tiers and outfit, proof catches, `BALANCE.tackleRating` | P3 | M | T1 |
| | Pg5 | Murk's 3-slot Ledger (refresh per completed in-lake day); in-lake bounties re-weighted (combat templates by mode) | P3 | M | — |
| | Pg6 | 48 challenges, rewrites, the Gloom tab (9) | P3 | M | — |
| | Pg7 | relic shelves (× 0.55 fishing, × 0.7 Gloom), new relics, lantern count from data, `memMult` on the tally only | P3 | S | — |
| | Pg8 | The Long Descent | P3 | S | Pg2 |
| | Pg10 | Found Relics; the Chart's fog mask | P4 | M | W8 |
| **ui** | U1 | day HUD by mode (no ring, Embers or Flare in calm; the Well-fed glyph) | P1 | S | — |
| | U2 | bite-tell legibility, pips, a class estimate after the breach, catch card (class, cm, kg, favours, Mark for home with its nights) | P1 | M | F4 |
| | U3 | measuring overlay (cord ticks, seals, record banners) | P1 | M | — |
| | U13 | **the float's favour**: 0–5 ink notches, long-press list by family, the "gone quiet" line | P1 | S | F13 |
| | U14 | banked Boon picks on the measuring card and at the dawn bell (never a modal while moving or with a line out) | P1 | S | C3 |
| | U4 | near-miss card (with the tackle rating) | P2 | S | F8 |
| | U11 | Places page and rumours (P2); the Chart at the Map Table (P3) | P2 / P3 | M | Pg9 |
| | U5 | hub HUD (Shells, Memories), the station pill, tap-to-walk glyphs | P3 | M | S4 |
| | U6 | **Set Out** screen (First Outing card; modes from the 2nd expedition) | P3 | M | Pg2 |
| | U7 | **Tackle** screen (tiers, outfit, tackle rating per lake) | P3 | M | Pg4 |
| | U8 | Homecoming and Snuffed summaries; mount and pond dialogs | P3 | M | Pg2 |
| | U9 | Journal: ruler, seal grid, best setup, Elder Log, field notes, mount book | P3 | M | Pg1 |
| | U10 | the title as the boot overlay over the cove; pause quick links | P3 | S | R3 |
| | U15 | HUD: Far Water ◆ gauge, the Homeward stone's distance, Live Well nights | P3 | S | S7 |
| | U12 | postcard catch card (landmark strip) | P4 | S | — |
| **audio** | Au1 | cord ticks and class chimes, seal stamp, bite-tell sounds ("plip" vs "gulp"), Night Rise motif, Stillnight bed | P1 | S | — |
| | Au3 | condition loops, sign sounds (a panned strike slap), Moonfall shimmer, place beacons (≤ 2 live) | P2 | S | — |
| | Au2 | cove ambience (hearth, lapping water, far bell, harp motif), Homecoming and mount stings; no `descend` sting on hub transitions | P3 | S | — |
| **data.js** | D1 | `BALANCE.size` (cuts, tail 0.06, truncation, favour table, value factor 0.66, Elder age per lake, step, stamina exponent, fatigue floor, old trick), species `size` / `family`, phases, the oil context table, `wellFed`, `nightModes`, cameras, recolours, `holdsGiants` stopgap flags | P1 | M | — |
| | D3 | Mossmere places; conditions; `holdsGiants` / `maxClass` / `resident` / `tally`; ≈ 24 rumours; species → 36 | P2 | M | — |
| | D2 | `TACKLE`, `OUTFIT`, `LURES`, `COVE` (arena, walk, palette, grade, wall wings, growth table), `BALANCE.farWater`, `liveWell`, relic shelves, 48 `CHALLENGES`, Ledger templates, the tally, the Quayling and Wanderers (→ 47), `tackleRating` | P3 | M | — |
| | D4 | species → 53; secrets; Found Relics; Vistas | P4 | M | §24 owner |
| **tools** | T1 | `tools/sim/reel.mjs` adopts `reel-v3-sim.mjs` (z scaling, Elder age / step / stamina, fatigue, old tricks, pips, Rod shock, per-slot loadouts, no net check) and writes `BALANCE.tackleRating` (P1); runner (P3) and sulker (P4) simulated before their code | P1 / P3 / P4 | M | — |
| | T2 | `validate-data`: σ 0.09–0.175; ceiling ≤ 2.8× median; ≥ 2 giant-tail species per lake; legend length ≥ 1.4× the lake's longest ceiling; no green-teal fish colours; favour cap; every place has a no-bait calm species; every kept species has a rumour and a condition; exactly 3 `holdsGiants` places per lake, in reachable water; Homeward stone ≥ 25 m of path from spawn; `COVE.walk` passes §24's rules (reachability, enclosure, 14 m south clearance); every wall wing packs | P1–P3 | S | — |
| | T5 | pacing sim (the naturalist's roster sim on the places, conditions, residents and the favour distribution): first Elder, PBs per session, Trophies per session (Mossmere in P2; all lakes in P3) | P2 / P3 | M | D3 |
| | T3 | `balance-sim`: expedition and economy model with Still / Lantern / Gloomtide profiles (Shells/h, Memories/h, snuff rate by expedition length, fight share, the tackle timeline, Far Water, the value factor per lake, the **shortest profitable loop**) | P3 | L | D2 |
| | T4 | perf scenario `cove` (≤ 140 / ≤ 100 calls), the hue report on Landing shots including Murk's barge, a phone-portrait screenshot | P3 | S | W2 |
| | T6 | perf scenario night on foot (Pallid, Lantern swarm, Tally Posts, the wow event): ≤ 150 calls | P3 | S | W7 or a stub |

### 12.1 CONTRACT additions (new section: the hub and expeditions)

**Flow `hub`** (player-facing: the Landing). `main.js`: `running = (flow === 'playing' || flow === 'hub') && !paused && !blocking`. In the hub, player, actors, models, world, water, render, audio, ui, progression and fishing (cove mode) get the real dt; **survival and combat return early** when `ctx.flow === 'hub'`. The 30 s autosave timer runs only in `playing`.

**State.** `state.run = null` in the hub. `getStats()` with no run = STATS base + the selected Wick + `meta.tackle` + `meta.outfit` + relics (no Boons). Everything the hub shows reads `state.meta`.

**Zone.** The hub is entered by `zone:change {zone: 'cove', hub: true, prev, from: 'boot' | 'home' | 'snuffed' | 'title'}`. `COVE` is a data export that is **not in `ZONES`** and not in `ZONE_BY_ID`. Every `zone:change` listener branches on `hub`:

| module | on `zone:change {hub: true}` | on the next lake `zone:change` (prev `'cove'`) |
|---|---|---|
| world | build `COVE` (never fall back to `ZONES[0]`) | build the lake as now |
| water | `applyZonePalette(COVE.palette)`; set `uPondHole`; Moonfall discs off | clear `uPondHole` |
| render | grade `COVE.grade`; mode `cove`; title orbit uses the cove | as now |
| ui | hide the lake HUD, show the hub HUD and station pill (`hud.setVisible` follows `hub` too, not only `playing`) | lake HUD |
| audio | no `descend` sting; play `homecoming` (from home) or the snuff motif; start the cove ambience | play the `setout` sting instead of `descend` |
| actors | place Murk at the home dock with `merchant.arrive(dock, yaw, {instant: true})` **after** this event (the leave-on-zone-change branch skips when `hub`); raft at the mooring; freeze both; spawn pond fish | as now (Murk follows at 0:20) |
| progression | no zone discovery, challenge zone hooks, Waystone or gate logic; the expedition summary is already banked | `createExpedition` already ran |
| challenges | ignore | as now |
| player | foot mode; spawn at the hearth (`boot`, `snuffed`) or on the jetty (`home`, `title`); no drains | spawn at `arena.spawn` (new expedition) or at the saved `run.pos` (Continue) |
| fishing | cove mode: species pool = Quayling; the test buoy; sales refused | as now |
| survival / combat | idle | as now |

**Event order.**
- *Set Out:* Set Out confirmed → `progression.createExpedition({zone, nightMode, character, outing})` sets `state.run` → `expedition:start {zone, nightMode, character, outing: 'first' | 'normal' | 'descent'}` → flow `playing` → `zone:change {zone, prev: 'cove'}` → `run:start {continued: false}` (legacy alias, removed once listeners migrate) → save.
- *Return home:* Homeward stone hold complete, or Ride home → `expedition:end {result: 'home', summary}` → `run:end` (legacy) → progression banks the summary into meta and sets `state.run = null` → flow `hub` → `zone:change {zone: 'cove', hub: true, prev, from: 'home'}` → `hub:enter {from: 'home', summary}` → Homecoming → save.
- *Snuffed:* `lantern:out` → 25 s guttering → `expedition:end {result: 'snuffed', summary}` → `run:end` → bank (creel and marked fish lost, tally × 0.5) → flow `hub` → `zone:change {…, from: 'snuffed'}` → `hub:enter {from: 'snuffed'}` → Snuffed summary → save.
- *Continue:* boot → a saved run → restore it with `run.pos` → flow `playing` → `zone:change {zone, prev: null, continued: true}` → `run:start {continued: true}` → the player snaps to `run.pos` (or resolves Snuffed if the save was guttering or at 0 oil). No saved run → flow `hub` → `hub:enter {from: 'boot'}`.

**Saving.** In expeditions: every 30 s, on every phase change, on `visibilitychange: hidden` and on `pagehide`, including `run.pos {x, z, y, mode, mooring}`, oil and the phase clock. In the hub: on `hub:enter`, after Homecoming resolves, on every purchase (tackle, outfit, pond, relic), on mount and pond changes, on `fish:measured` (cove), and on `visibilitychange` / `pagehide`.

**New events and APIs:** `expedition:start`, `expedition:end`, `hub:enter`, `fish:measured {speciesId, z, sizeClass, ancient, length, weight, favours, records}`, `mount:hang {speciesId, z, frame}`, `pond:add {speciesId, z}`, `resident:show {place}`, `farwater:dawn {day}` · `world.setZone('cove')` · `models.buildMountBatch` · `actors.pond`, `actors.raft.freeze`, `actors.merchant.freeze` · `fishing.view.favour / sizeClass / pips / biteTell` · `state.meta.{shells, tackle, outfit, lures, mounts, pond, landing, waystones, shortcuts, residents, markedFish, elderLog, places, ledger}` · `state.run` gains `nightMode`, `startZone`, `outing`, `marked[]` (with nights), `pos`, `farWater`.

**External dependencies:** §24's foot core (`walkGridFor`, `world.moveFoot`, the player foot state, walk camera, board / ashore) for S4 and W2 (fallback: Landing v0, §3.7.7) · §24's lake builds for every non-Mossmere place change · the palette rework for lake palettes (Murk's recolour is now A10 here).

---

## 13. Risks and cut list

### 13.1 Risks

| risk | mitigation |
|---|---|
| §24's foot controller lands late, and the Landing cannot be walked | Landing v0 (raft-and-quay, the same assets). The Landing is also the simplest first consumer of §24's controller, so integrate it there first. P1 and P2 do not depend on §24 at all. |
| Scope: 53 species, 29 places, 4 wow happenings, the cove | Phasing. **P1 + P2 deliver request 5 inside today's run structure** (fishing-first feel, readable size odds, the Mossmere's places and giants, Moonfall, optional combat); **P3 delivers the user's expeditions-and-home decision**; P4 is content on a working loop. |
| Landing draw calls (pond, wall and arch in one view) | The mount batch (A4) is the linchpin, so measure it in week 1 of P3. Fallback: the 12 nearest mounts in 3D, the rest as painted plates in the frame atlas. |
| The pond pass misbehaves on some GPUs (discard in the lake shader) | The alternative is ready: draw pond fish after the water with depth test off, clipped to the pond disc, with a depth tint via `onBeforeCompile`. |
| True scale makes small fish hard to read in the water | Splash and wake by length, bite tells, the `trophy` camera, the palm pose, the float's favour; a phone QA pass in P1 |
| The lower camera hurts cast-distance judgement on phones | Phone QA in P1; fallback fish preset 30° / 13.5 m; the depth reticle and range ring stay |
| Steeper Elders feel unfair on arrival tackle | The bite tell (water dome) and the tackle rating warn first; *let it pass* keeps the bait; an escaped Elder becomes a Marked Fish that comes back weakened; commons and uncommons stay landable as Elders early |
| Far Water and the Live Well read as punishment | Both are shown on the HUD from day 2, the reward side is shown first (favour, resident shows), and the knobs are data (`BALANCE.farWater`, `liveWell`) with T3 targets |
| Persistent Shells inflate | Tackle 18,610 + outfit 3,680 + lures, tolls, pond and legend baits (28,240) meet income at ≈ h16.7 (§9.2); a post-game cosmetic shelf; T3 owns the numbers |
| Gloomtide balance drifts with persistence | Heat arrival offsets, Draft levels non-Angler, the creel range equals today's, combat kit stays per expedition, The Long Descent has its own purse and ignores persistent tackle |
| Drift toward Dredge (home port, sell, night danger, lose cargo, encyclopedia) | Selling is *not* why you go home (Murk buys in every lake). Home is a walkable cove of mounts at true size and living fish. No grid, no aberrant fish or morphs, no panic or sanity, no spoilage or value decay (the Live Well limits nights for a living fish). Size classes, the measuring ceremony, on-foot places, legend boss fights, run Boons and lantern oil as light come first. |
| The snuff sting is too soft or too harsh | Knobs: the tally loss (0.5), marked-fish loss (100%), Live Well nights, Far Water costs |
| Lantern as default annoys players who want calm | The First Outing is all still; one constant flips the default to Still (open question 1) |
| Save migration for current players | Keep the Journal, records, relics, Wicks and challenges; refund cut relics; renames mapped; a 200-Shell welcome purse; the current run ends at the next title as a "return home" |
| Novice Keeper rares stay too easy until P3 and P4 (sim) | Runner in P3, sulker in P4, both simulated first; until then the challenge sits on Prize+ as designed |
| Tone of mounting fish in a tender world | Mounts are framed as keeping a memory (a candle under each frame, plaques with the Wick's name); a "likeness" fiction is a writing choice, not a system change |

### 13.2 Already cut (decided in this brief)

Morphs (all 56) · geometry-moving weather (Highwater, The Low Breath, the Belfry lift) · the mid-fight drag dial · rod sweep · divers and snags · the cut-line button · count-down sink rigs · the net ring QTE (and the sim's net check) · pointer-target scatter casting · lure sizes and diet tags · the Live Fry well · Lamp Moths · moth fall · the thrasher head-shake · Gloom-fed and Ashwick's best-of-3 · approach shadows on every bite · the "Raise Lantern to reveal shadows" verb · the taxidermy fee · a Homecoming currency · Grand Astir · Waystone relics and Murk's Old Debt · per-expedition outfit purchases · line snaps and hooked theft in Lantern · the Bell-Chapel tackle gate · sit-and-sketch Vistas · the Wishing Font · the Moon-Eyed Koi · the Grey Stilt guide and the ambient-life set (optional later) · 40 rumours (now ≈ 24) · 36 commissions (now 3 Ledger slots) · satiety starvation · the feeding-spot mote columns · the Mossmere's "drowned high street" imagery (fountain, street lamp-posts), the Weeping Curtain and rain as its identity · the name "the Pale Leviathan".

### 13.3 Originality guardrails

- **Hollow Knight:** the mood only (ink, rim light, silhouettes, melancholy). No rest-point map updating, no buying maps, no sit-and-sketch ritual (the Vista is *raising the lantern*; the Chart inks live). The Mossmere is a **drowned ferry harbour** (rust, iron, barges, a toll-gate, buoy-lanterns), not a rain-soaked city: no fountain, no street lamp-posts, no perpetual rain as a lake's identity (Drip is one condition every lake can roll). No "Pale + noun" names (the finale is the Lantern-Swallower), no masks, no "Archives". Avoid "bottled light" phrasing in new text.
- **Dredge:** no grid cargo, no mutated or aberrant fish (morphs cut), no panic or sanity meter, no spoilage or value decay, and Murk is never called a "collector". Drowned Marrow → Last Candle ("Marrow" echoes Dredge's home-port names now that we too have a home).
- **Real fishing games:** no bronze / silver / gold / diamond medal ladder (our seals are an ink stamp, oxblood wax and black wax with a ribbon), no per-species leucistic or melanistic morph checklist, and shadow-picking is never the main loop (blind casting plus signs and the float's favour is). The Live Well and drag presets are genre conventions.

### 13.4 Cut order if the schedule slips

1. Remnants · 2. Vistas · 3. the Chart's fog (keep the static chart) · 4. secrets and Found Relics (and the Underdepth) · 5. The Candle Tide, The Alignment, The Bloom (Moonfall stays) · 6. the six P4 species (Nightbloom Carp, The Remembered Sun, Vesper Gar, The Sexton, Candlewake Sturgeon, The Namesake; if Candlewake goes, the Unpaid Fare moves to σ 0.16 as the Pallid's second giant-tail species) · 7. age marks · 8. the sulker (size scaling and old tricks still carry Glasswater) · 9. the pond's tier-3 floor painting · 10. today's rumour · 11. legend growth.

**Never cut:** **the Mossmere's places and giants** (P2, including Moonfall and persistent residents); all of P1, including the float's favour and the steeper Elders; the size model and the ceremony; the Landing's core (Long Wall frames, keep-pond and its pond pass, Map Table, Gear Bench, Murk, raft, sea-gate, jetty casting); Far Water and the Live Well; night modes and the hard rule; the runner.

---

## 14. Open questions for the user (each with a recommended default)

1. **Default night mode from the 2nd expedition.** Your first outing is always calm. After that, should a new expedition default to **Lantern** (a light swarm on every other night, about 6% of play, in the first half of the night only, never costing a fish on your line, skippable at a watch-lamp) or to **Still** (no combat unless you pick it)? *Recommended default: Lantern,* so the built night combat is seen as a light, optional spice, with Still offered side by side and no fishing penalty.
2. **Tackle in The Long Descent.** Should the prestige descent use **today's per-run gear** (start with a twig rod and its own purse, buy upgrades from Murk as you go: a pure roguelite) or **your persistent tackle**? *Recommended default: per-run gear,* so The Long Descent stays the challenge it is today and its records mean something.
3. **How hard should the biggest fish of the early lakes stay?** Should a lake's headline giants need late-game tackle (an Elder Reedjaw in the Mossmere lands about 0% on starter tackle, 55% on tier-3 tackle and 82% on the best tackle, so coming back for it later is a real trip) or be catchable on that lake's own gear? *Recommended default: they stay hard,* because it keeps the progression challenging and makes return trips worth it; smaller species' Elders stay catchable early, so first Elders still arrive in the first few hours.
