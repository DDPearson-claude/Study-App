# The five Wicks: one powerful passive each

*Gloomwater's loop, `docs/loop/`. The judge's ruling on three proposals (§6), written 15 November 2026; **revision 2** the same
day, after a review of 49 findings (§7); **revision 3** the same day, after the user's answers to the five questions (§1.2,
§7.2): Tallow becomes the carrier (Broad Back, §2.4) and its old passive, Long Night, is kept whole in §6.4; and a critic's
review of revision 3 the same day (§7.3), which checked Tallow's figures against the run's record. Every number is a
**starting number** (a knob with its range), not a result: the sim run of §3 sets the final values after the three-keys rule
(SPEC v8 §5.5, branch `gw-loop-access`) lands and after `clams.mjs --wicks` is committed. Figures marked *(est.)* are hand
estimates or come from uncommitted scratch sims; none may be quoted as measured. This file amends nothing by itself. §5
lists what changes in SPEC, OPENING, PLAN and LORE, for the lead's docs commit.*

*The lead's rulings (15 November 2026) on the measured run (§3.5): each is written in its **Ruling** line there, and its
values are carried into §1.1, §2, §3.2, §3.3 and §4 (the Wick ×1.4, Taper's first bite once an evening, Stub ×0.78, Tallow's
good bite at every place and its 9 slots, Ashwick's `hold` range 2–4); `clams.mjs --wicks` checks them as ruled. Where §2
still shows a range, the value in force is §3.5's.*

*Revision 4 (16 November 2026), the user's words: "When choosing a wick, the passive bonus should be bigger in your view and
more obvious what it does. Could they be accompanied with a small image indicating what they do?" On New Descent the lit Wick's
passive is now a block of its own under the cards: a small ink picture of what it does, the passive's name and its one line,
larger than before. Four lines are made plainer; Ashwick's stands. On the first version the user said, the same day: "Make it
bigger on desktop and put icons on every portrait": the desktop block is larger again, and every portrait carries its passive's
small picture under its name. No rule, number or hook changes (§7.4).*

## 1. The user's words

> "You can choose any of the 5 wicks but each one has a powerful unique passive ability to help them catch fish or boost something else"
> (14 November 2026)

> "Default for all except 4 which i want yes"
> (15 November 2026, answering this file's five questions; §1.2)

**Earlier words that bind this design:** catch big and rare fish; the hold limits you (3 slots at the start); no way to fail;
maps are the only way to discover a place; "every catch should feel like a win"; the UI must not be cluttered ("too much
text on screen"); creature attacks parked (no combat); original work only. **The one exception is the user's own:** asked
whether they wanted a carrier Wick who starts with more hold (question 4, as the revision-2 run put it), the user said yes
(15 November 2026), so Tallow starts with 4 slots (§2.4). Every other Wick starts with 3, as the user first said.

**The lead's reading (binding), in short.** All five Wicks are free from the first New Descent. Each has **one** passive
(no button, always on) that is **powerful** (felt in the first evening, about 20–40% in its own domain or a rule-bending
effect) and **unique** (no two Wicks boost the same thing, as the player feels it). Balanced over the whole game: each Wick
buys everything within about ±10% of the others' time (the measured run holds it to ±5%, the lead's ruling, §3.5). No
passive breaks a rule. One short plain line on screen per Wick.
Each works in slice 1a (the Mossmere alone, 3 slots or Tallow's 4, Rod/Line/Reel T1–T2, Hold 4–5) and grows later.

**What "passive" replaces.** SPEC §10.1's small traits (Taper's cast and strike window, Stub's and Tallow's raft speed,
Tallow's +2 Hold on Trophies, Ashwick's +3 Hold on the first fish after dark) are retired on a trip. Stub's `lightRadius`
+1.5 stays as a **look** (only survival, water and world draw it). Taper's `castMax` +4 m is **dropped**: it set the cast's
reach, so its depth (`speciesPool` filters by `s.depth`) and the sign range (`castMax + 15`), a second power. Taper's look is
its height.

### 1.1 Who touches what

| Wick | passive | what it owns (no other Wick touches it) | the decision it changes | seen in the first evening (measured, §3.5) |
|---|---|---|---|---|
| The Wick | **Curious** | the sale of a **first**: a new kind, a first Prize, Trophy or Elder, a new personal best | what you keep | 2.8 first-sale ticks at the first tally (measured) |
| Taper | **Long Reach** | the rarity of **the first bite of each evening**; from slice 2, a giant's share of the bites | where you fish: one more water, one more place | 1 uncommon or rare card, every evening (measured 1.00) |
| Stub | **Moth-Bright** | the wait for a bite, and **quiet water** | how long you stay, and how choosy you are | every bite sooner (2.1 s, measured); quiet water keeps its pace |
| Tallow | **Broad Back** | **the hold's size** (one more slot at every step, 9 at Hold 8) and **the good-bite count** (at open water two more than another Wick at the same step: one comes with its slot, one is its own `good`; and its `good` at every place too) | how big a trip is: how much you bring home before the hold says go | a fourth empty slot on the first Chart, and 4 fish home on 96% of first trips (measured) |
| Ashwick | **Burns Back** | **a fish that got away** (not a giant, not a legend) | how hard you push a big tell | a comeback on 63% of first trips on T0 (0.90 a trip, measured), more as you push |

Giants home are Taper's domain among the passives (check 5, ×1.33 a trip): Ashwick's comeback skips giants, the Wick's
first sale skips giants, and Tallow's bigger trip and its extra good bites at every place bring more giants home as a side
effect, accepted by the lead (15 November 2026; ×1.20 an hour, its own limit ≤ 1.25, check 5). **No Wick moves the
clock:** every Wick's evening is SPEC §3.4's (day 40 s, dusk 20 s); Long Night is kept in §6.4. **The hold and the good
bites are Tallow's alone:** no other passive changes a slot or a good-bite count. **The passive names are shown on New
Descent** (revision 4, the user's "more obvious what it does", 16 November 2026): the lit Wick's block shows its small ink
picture, its name (Curious, Long Reach, Moth-Bright, Broad Back, Burns Back; `TEXT_LOOP.passives`) and its one line, and each
card carries its own passive's small picture under the Wick's name (the user's "put icons on every portrait"). The code
ids (`curious`, `broad_back` …) are never shown, and no name or picture is shown anywhere else.

### 1.2 The five questions, answered

The revision-2 run put five questions to the user, each with the default it built. The user answered on 15 November 2026:
**"Default for all except 4 which i want yes"**. All five are now answered; none is open. The questions below are worded
as the run's record put them (revision 2 itself did not print them); only the user's answer is quoted verbatim.

| # | the question (the run's wording) | the default | the answer | what this file does |
|---|---|---|---|---|
| 1 | Should a lost giant come back for Ashwick? | no: it becomes the built Marked Fish for every Wick, so giants stay Taper's | **default (no)** | unchanged (§2.5) |
| 2 | Should the Wick be "paid for every first" or "finishes catch lists fast"? | paid for firsts (a list-speed version copied the pull) | **default (paid for firsts)** | unchanged (§2.1) |
| 3 | Should Stub be the stayer (lively quiet water) or pure speed? | the stayer | **default (the stayer)** | unchanged (§2.3) |
| 4 | Do you want a carrier Wick who starts with more hold? | no, because of "3 slots at the start"; it stays the alternative | **yes** | the lead gives it to Tallow, the thick and sturdy candle, the doc's own pairing for the hauler (§6): **Broad Back**, 4 slots at the start, one more slot at every Hold step and +1 good bite at open water on top of its slot's (two more than another Wick at the same step; §2.4). Long Night leaves Tallow and is kept whole in §6.4 |
| 5 | Do the five lines read right? | as written | **default (as written)** | the four unchanged lines stand; Tallow's line is new with its new passive (§2.4), in the same style and under the same caps, for the lead's sign-off |

## 2. The five Wicks

**Every hook in this section runs only under `LOOP()` (fishing) or `loopRun(run)` (survival, progression), reads
`LOOP.wicks[run.character]` (at home, where there is no run, Tallow's slot count reads `meta.loop.wick` under
`LOOP_ENABLED`), changes no RNG draw count off the loop, and edits no v1 or v3 table or exported `data.js`
function outside the apply block's `if (LOOP_ENABLED)` (PLAN §4.1 rules 1, 2, 6, 7).** T75 and the proposed T76–T80 also run
with the flag off, as regression tests (the v1 golden trace goes through `rollBite` and `rollSpecies`).

### 2.1 The Wick: A Small, Stubborn Flame

- **Passive:** **Curious** (`curious`, the built quirk's name). **On screen:** "New kinds and new bests sell higher." (7 words, 36
  characters; revision 4, §7.4: was "Firsts and new bests sell higher.") **Picture:** a fish stamped with the first's star, the
  arrow rising from it to a clam.
- **Rule.** A **kept** fish that is a **first** in this New Descent sells for more at the tally. A first is any one of:
  a kind not yet caught; that kind's first **Prize, Trophy or Elder** (the built class seals, `sealsFor(sp)`), or its first
  Ancient; or a new **personal best** (longer than any of that kind caught before, the built `pb` record). The bonus is
  `max(round(firstFloor × tier), round((firstMult − 1) × base))`: `firstMult` ×**1.4** (range 1.3–1.6; the run's value, §3.5), `firstFloor`
  **0.4** × the water's value tier (range 0.3–0.6; +3 clams on the Mossmere, tier 7). One bonus per fish, however many
  firsts it is. Giants and legends are excluded (their prices are their own, and giants are Taper's). With one of Murk's
  orders or (from slice 9) the Old Ledger's double, **the larger applies, never both.** A fish let go keeps its records and
  pays nothing.
  - **The ledger is the loop's own**, `meta.loop.firsts = {seen, seals, best}`, cleared by New Descent and seeded empty on
    migration, so a player with an old Journal gets the same passive as a new one. `measure()` writes it in the same save
    as the Journal and sets `fish.first = true` on the hold fish, so Continue mid-trip neither loses the bonus nor pays it
    twice.
  - Unchanged: which fish bite, sizes, the hold, good bites, the land chance, the clock, the pull. **The card's Keep number
    is the base price for every Wick.**
- **Playstyle: the collector.** It keeps the first of every kind and every longer one, chases the Prize, Trophy and Elder of
  each kind, and reads the built seal and best stamps on the card to judge a slot. To master it: know what you still lack,
  and when a first Small (+3) beats a repeat Keeper.
- **First evening.** Nearly every fish is a first, so the first tally pays 2.8 bonus ticks (measured, §3.5; 63 clams against
  44): on the Mossmere a first Small goes from about 2 to 5 clams, a first Keeper from about 8 to 11.
- **Slice 1a.** All of it works: Journal records, seals and the `pb` record are built. The Mossmere in 1a has **6 kinds** a
  T0–T2 kit can reach (`dusk_minnow`, `mossback_perch`, `gutter_crayfish`, `weeping_carp`, `candlefin_koi`,
  `reedjaw_pike`; the `gloam_eel` needs bait 1a does not sell), so 6 new kinds and 18 Prize/Trophy/Elder seals. **In 1a the
  passive is mostly spent after the first hour or so** (the names and the early Prizes), and then lives on personal bests,
  which grow rarer. It grows from slice 2.
- **Later.** Each new water brings fresh kinds, seals and bests, and the Keel and better tackle keep bests coming, so the
  Wick is strongest on each arrival.
- **How it shows.** The card shows the base price and the built stamps (seal, best). At the tally a first's row shows the
  seal glyph, ticks up twice and plays a brighter coin (`coinBright`). The bonus always arrives as a gift, never as a
  lower price on a repeat. *Polish, after the reveal only:* the Wick's flame leans toward a first it holds.
- **Code hooks.** `data.js`: `LOOP.wicks.wick = {passive: 'curious', firstMult: 1.4, firstFloor: 0.4, stats: {}}`,
  `TEXT_LOOP.wicks.wick`. `progression.js` `measure()` (A): under `loopRun(r)` and `r.character === 'wick'`, compute
  `fish.first` from `meta.loop.firsts` (`isNew`, a newly stamped `cls` in `sealsFor(sp)` or the ancient seal, or a longer
  best) and update the ledger. `progression-loop.js` (A): `loop.priceOf(fish)` is unchanged (the base, the card's number);
  a new `loop.saleOf(fish) → {base, clams, first}` applies the bonus and the larger-of with an order or the Ledger;
  `endTrip`'s tally rows carry `{base, clams, first: true}`. `ui-loop.js` (C): the double tick from the row (no
  arithmetic) and `sfx('coinBright')`, falling back to `coin`. `audio` (B): `coinBright`.

### 2.2 Taper: The Long Reach

- **Passive:** **Long Reach** (`long_reach`). **On screen:** "Evenings start with a rarer fish." (6 words, 33 characters;
  revision 4, §7.4: was "First bites are never common fish.") **Picture:** a fish rising out of the water under the evening's
  crescent, a spark over it.
- **Rule.**
  - **(a) The first bite.** The first fish to bite **each evening** is drawn from that pool's **uncommon and rare** fish
    only (`firstBites` **1**, range 1–2; `perWater` **false**, the run's value, §3.5: once an evening, wherever it bites;
    `perWater: true`, once at each water and place, ran 10% ahead of the mean). The hidden-info rule holds: the rule applies
    only where that uncommon-and-rare pool has **at least two kinds and none above 80%** (`AUTOFISH.signRule`); otherwise
    it waits for a later bite that evening, at a pool where it does. A bait-only fish still needs its bait. Giants keep their
    own share (the giant roll comes first, unchanged); legends are excluded. It still needs its strike and its land roll. A
    spooked or passed first bite spends the rule, like any bite.
  - **The hook: a flag of its own, one per evening** (the lead, 15 November 2026). Slice 1a keeps Taper's own flag
    (`run.flags.taperFirst`): it is **set when a bite is served under the rule**, **reset at each evening's start**, and
    **never re-armed by a let-go refund**; while the pool fails the sign rule the flag stays clear and the rule waits. It is
    not read from `loop.favour(key).spent` (`spent === 0` could not wait for the sign rule, since the first bite spends it
    either way, and a let-go refund would re-arm it).
  - **(b) Giants (slice 2).** A giant's fixed share of the bites at its own place is ×**1.3** (`giantShare`, range
    1.1–1.4): 6% → 7.8% in its hour, 2.5% → 3.25% outside it, and with its giants' lure 9% → 11.7%. It is **never above 12%
    of bites** (`giantCap`). It is still a share, so a giant never bites for certain, and the land chance is untouched (a
    giant at Prize lands at most 50% of the time).
  - Unchanged: legends, sizes, Hold, the strike, good bites, the clock, prices. The built `hookWindow` +10%,
    `rarityBonus` and `castMax` +4 m are dropped: one passive only.
- **Playstyle: the rare-fish seeker and hopper.** Every water and every place starts its evening with a better fish, so
  Taper keeps moving: one more place, one more water, and from slice 2 the giants' places and hours. To master it: route an
  evening through the places, and judge when a rare Keeper beats waiting for the giant.
- **First evening.** The first card of every evening is an uncommon or rare frame. On the built 1a Mossmere by day
  (`RARITY_WEIGHTS` 70/24/6) the non-common share is 18.6% (20.5% on a deep cast), so a first trip of about 4–5 bites has
  about 0.9 non-common bites for other Wicks and about 1.7 for Taper *(est., ×1.9; the run measured ×1.76 in the 1a kit at one first bite an
  evening, §3.5)*. At night the built pool is thinner
  (Weeping Carp, and the Reedjaw Pike on a deep cast: 10–12.5%), and on a shallow night cast the carp alone fails the 80%
  rule, so the rule waits.
- **Slice 1a.** (a) works on the built phase-1 pools. (b) has nothing to act on until slice 2 brings giants (`PARKED.giantSpots`;
  `giantSpots()` returns `[]`): 1a stores `giantShare` and `giantCap` and checks only their ranges (T72).
- **Later.** One better first bite an evening, wherever the evening starts (the run's `perWater` false); giants come home
  more often (target +20–40%, check 5; measured ×1.33 a trip).
- **How it shows.** The first card each evening carries an uncommon or rare frame; later, more gold-edged giant glyphs in
  the hold row. *Polish, after the reveal only:* the tall flame stretches taller for a moment.
- **Code hooks.** `data.js`: `LOOP.wicks.taper = {passive: 'long_reach', firstBites: 1, perWater: false, giantShare: 1.3,
  giantCap: 0.12, stats: {}}`, `TEXT_LOOP.wicks.taper`, and one pure export over the whole pool,
  `wickPoolWeights(wickId, pool, weights, {firstBite, signRule})`, which returns new weights (commons zeroed when the rest
  passes the sign rule; otherwise the weights unchanged). `fishing.js` (B): in `rollSpecies`, under `LOOP()`, after the `w`
  map (and the `famMult` tilt) and before the draw, with `firstBite` from `loop.taperFirstOpen()` (A, a read of Taper's own flag, `run.flags.taperFirst`; the flag is set by
  `loop.spendTaperFirst()` when a bite is served under the rule, reset by `startTrip`, untouched by a refund);
  the same function inside `signTiltOk`'s weight sum and on the sign preroll (a pre-rolled common does not take the bait on
  Taper's first bite; the plain draw goes ahead). Zeroed weights keep the one draw, so the RNG count is unchanged.
  `clams.mjs` `poolFor` calls the same function. (b)'s hook goes where SPEC §3.5's giant share lands (slice 2).

### 2.3 Stub: The Bright Little One

- **Passive:** **Moth-Bright** (`moth_bright`). **On screen:** "Fish bite sooner and keep biting." (6 words, 33 characters;
  revision 4, §7.4: was "Quick bites, even on quiet water.") **Picture:** a float tugged under, the bite's marks over it,
  ripples, and a moth come to the light.
- **Rule.**
  - **(a) Quick bites.** The wait for a bite is ×**0.78** for Stub (`waitMul`, range 0.7–0.85; the run's value, §3.5). In
    the game the wait is `(waitBase 3 + Exp(5.5)) / mods`, mean about 8.5 s, so Stub's is about 6.6 s *(the sim's base is
    `AUTOFISH.time.wait` 7.5 s → 5.9 s)*. Not on a legend cast. The clock is **no** Wick's (Long Night is in §6.4): `waitMul` is tuned so that Stub's first
    trips see dark as often as anyone's (≥ 50%, check 4: 52% at 0.78, 48% at 0.75).
  - **(b) Quiet water stays lively.** Past a water's good bites, Stub's bites keep the fresh wait (no ×(1 + 0.3·over)
    growth) and lose **0.08** favour a bite instead of 0.15 (`quietStep`, range 0.05–0.1), to the same floor −1.2. Good
    bites, the quiet count and the let-go refund are unchanged.
  - Unchanged: which fish bite, sizes, the strike window, the play, the clock (day 40 s, dusk 20 s), the hold, prices. The
    built raft speed +1, pickup radius, Embers and creel malus are dropped; `lightRadius` +1.5 stays as the look.
- **Playstyle: the stayer.** Where Taper hops from water to water, Stub settles: it lets the small ones go and keeps
  fishing a water past the point where others would sail on or head home. To master it: know when a quiet water's smaller
  fish are still worth the casts, and when to be choosy.
- **First evening.** Bites come quickly after each cast (2.1 s sooner, measured). Most first trips have a bite or two past
  the good bites (a lost or let-go fish), and for Stub those come at the fresh pace with the favour notches barely dropping.
- **Slice 1a.** All of it: the bite timer and PLAN's `quietTerms` on the Mossmere's open water.
- **Later.** The same at every water and place; it matters more as holds grow (Hold 6–8) and evenings get longer.
- **How it shows.** The bite tell comes quickly after each cast; on quiet water the float's favour notches step down one at
  a time instead of falling. *Polish:* motes and moths stream into Stub's wide light.
- **Code hooks.** `data.js`: `LOOP.wicks.stub = {passive: 'moth_bright', waitMul: 0.78, quietStep: 0.08, quietWait: false,
  stats: {lightRadius: 1.5}}`, `TEXT_LOOP.wicks.stub`; PLAN's new `quietTerms(over, wickId)` takes the Wick (a new export,
  so the fingerprint does not move). `progression-loop.js` (A): `loop.favour(key)` passes `run.character`. `fishing.js` (B):
  in `rollBite`, under `LOOP()`, `W *= waitMul × quiet.waitMult` **before** the clamp (`waitMin` 2 s kept, which is above
  `lead0 + 0.5`); not when `S.legendCast`. The nibble scheduler is unchanged (it fits its events into the shorter `W`); B's
  test records the spook rate per Wick.

### 2.4 Tallow: The Stout Candle (the carrier)

*Revision 3: the user's answer to question 4, "Default for all except 4 which i want yes" (15 November 2026), and the lead's
ruling that the carrier is Tallow, the thick, sturdy candle. Revision 2's Long Night is kept whole in §6.4.*

- **Passive:** **Broad Back** (`broad_back`). **On screen:** "One more slot in the hold." (6 words, 26 characters; revision
  4, §7.4: was "Stout enough for one more fish.", the shelf's own "One more slot." words) **Picture:** a creel of
  fish with one tail more, and a plus.
- **Rule.** Tallow's hold is **one slot bigger than the hold bought, at every step**, its open water has **one more good
  bite than its slots give** (so two more than another Wick's at the same step), and **every place has one more good bite**
  than its built count (`everyWater`, the lead's ruling of 15 November 2026, §3.5 decision 4). Nothing else changes.
  - **(a) The slots.** Tallow's slot count is `holdSlots + slots`, `slots` **1** (fixed: it is the user's "yes", not a
    tuning knob). `meta.loop.holdSlots` stays what it is for every Wick, **the bought count** (3–8, SPEC §9): the save,
    `migrateLoop`'s clamp 3–8 and T51 are unchanged, and Tallow's slot is computed, never stored. So:

    | the step bought (SPEC §4.2) | start (Wicker Creel) | Hold 4 (Lidded Creel) | Hold 5 (Double Creel) | Hold 6 (Wellbox) | Hold 7 (Ferry Hamper) | Hold 8 (Harbour Chest) |
    |---|---|---|---|---|---|---|
    | slots, every other Wick | 3 | 4 | 5 | 6 | 7 | 8 |
    | **slots, Tallow** | **4** | **5** | **6** | **7** | **8** | **9** |
    | open water's good bites, every other Wick (one per slot, plus one) | 4 | 5 | 6 | 7 | 8 | 9 |
    | **open water's good bites, Tallow** | **6** | **7** | **8** | **9** | **10** | **11** |
    | **each place's good bites, Tallow** | built + 1 (day 3, old 4, night 3, crown 3) at every step | | | | | |

  - **The ladder and its cap.** Tallow buys **the same five steps, in the same order, at the same prices** (30, 120, 450,
    2,000, 3,500), and each still gives exactly one more slot. The ladder caps where it caps for everyone: at its fifth
    step, the Harbour Chest (`LOOP.hold.max` 8 is the bought count). Tallow's top is therefore **9 slots** (the lead's ruling,
    15 November 2026: no cap); no step is added, skipped or re-priced, and the slot never stacks twice. The Harbour Chest stays
    the Inkwood's gear key for every Wick, and gives Tallow its 9th slot. In slice 1a the shelf stops at Hold 5
    (`shelfMax`), so Tallow's hold is **4–6** slots in 1a, every other Wick's 3–5.
  - **The other reading of "capped as the ladder caps" (ruled out).** SPEC §4.2 says "The hold stops at 8 so trips stay
    under 6 minutes", and Tallow's 9 slots go past the hold that reason was set for. Revision 3 kept a fallback (Tallow's
    ladder ending at the Ferry Hamper) for trips past 6 minutes, and the run tried a cap at 8 slots with the Harbour Chest
    still bought (§3.5). **The lead ruled both out (15 November 2026):** Tallow keeps 9 slots at Hold 8, and its trips there
    may run to **6.1 min** (measured 6.07 min at 9 slots with its good bite at every place), Tallow's own trip ceiling
    at Hold 8 (§4 guard 3, §3.3 check 1).
  - **What "Hold N" means.** In docs, tests, the sim's printouts and item ids (`hold:4`), "Hold N" is always **the step
    bought** (N = `holdSlots`, the ladder's count): "Tallow's Hold 4" is the Lidded Creel, which gives Tallow 5 slots. On
    screen only, the goal line names the slots the next step gives the Wick (below). Every line of this file uses it so.
  - **(b) The good bite.** Open water's good bites are SPEC §3.3's "one per slot of your hold, plus one", counted on
    **Tallow's** slots (`holdSlots + 2`), **plus `good` 1** (range 0–2): **`holdSlots + 3`** for Tallow, against
    `holdSlots + 1` for every other Wick at the same step. So Tallow's open water has **two more good bites** than another
    Wick's at the same step: one comes with its slot, one is its own. It applies to the open water of every water (one per
    lake). **And its `good` applies at every place too** (`everyWater: true`, the lead's ruling, §3.5 decision 4): day 3,
    old 4, night 3, crown 3 against the built 2, 3, 2, 2. Revision 3's open-water-only rule took 48.0 h and earned less than
    no passive in some eras, which would have made the carrier the user asked for a weak pick. Every bite still spends one,
    the let-go refund is as built, and quiet water past the count is as built (Stub's milder quiet water stays Stub's).
  - **What ECONOMY measured, and what the run measured.** ECONOMY's scratch prototype sized the hold one bigger and gave
    `goodPlus` at **every** water, places included: that is the rule the lead adopted. Its "+1 slot alone" gave 48.3 h (no
    faster than 47.6 h). The committed run (§3.5) measured revision 3's open-water-only rule at 48.0 h, −4.1% to +1.3% a
    minute in every era (in the 1a kit, open water only, the two rules are the same: +9.6% a minute, 64 → 83 clams a trip,
    44 → 60 on the first trip), and the every-place rule at 43.6 h with 9 slots.
  - **Why both halves.** The good bite is what makes the slot pay: it lets the extra slot fill at good favour before the water
    goes quiet. The slot alone was no faster (above).
  - **What the hold still does.** A full hold refuses the cast at Tallow's count ("Hold's full.", the Home pill pulses), and
    only the tally empties it. The tally sells whatever is in it, one row per fish, as built. **Unchanged:** which fish bite,
    sizes, the strike, the land chance, the catch Hold stat (that is the fight's Hold, which Ashwick's comeback raises; this
    passive never touches it), the clock (SPEC §3.4 for every Wick), prices and the card. The built raft speed −0.8 and +2
    Hold on Trophies are dropped.
- **Playstyle: the hauler.** "Slow to light. Slower to go out": Tallow is the last to turn for home. It fishes the longest
  good evenings, brings home the biggest tallies and makes fewer trips for the same clams. To master it: plan a trip to fill
  every slot while the water is good, and judge when the last slot is worth a sail to a place rather than one more cast at
  open water.
- **First evening.** The first Chart shows **four** empty slots, and Murk says so (below). The open water has 6 good bites
  instead of 4, so the first trip brings home **4 fish instead of 3: 60 clams instead of 44 (+36%)** (measured, §3.5; the
  first trip is open water only). The fourth glyph in the hold row and the fourth tally row are the event, on every first
  trip that comes home full (96% of Tallow's first trips, against 98% for the no-passive player, SPEC §4.9). Tallow's first
  trips get a bite after dark on 94% (63% without a passive) and bring home no Prize or bigger on 41% (52%), measured: a
  longer trip reaches the night.
- **The tutorial's line for Tallow.** OPENING's chart beat reads, for Tallow only: **"Four slots in that hold. Fill them and
  come home."**, and four empty slots ink in under the Mossmere row (0.25 s apart, 1.0 s, inside the ≈ 3 s beat; the line is
  one character shorter, so `murkHold` and T72's budget do not grow). Every other Wick hears "Three slots in that hold. Fill
  them and come home." as built. The line names the slots the player has; it adds no word.
- **Slice 1a.** All of it: one pure count, read by the hold row, the full-hold refusal, the open water's good bites and the
  Chart. The shelf, its prices and the cards are as built.
- **Later.** The same at every step, at every water's open water and at every place, so a Tallow trip runs one fish longer
  at every era and its places stay good one bite longer. Late holds are the risk: at Hold 8 its trips run to 6.1 min, its
  own ceiling (§3.3 check 1, §4 guard 3).
- **How it shows.** **The HUD:** the hold row (`.gw-hold`, top-left) has Tallow's count of cells: 4 on the first trip, 6 at
  1a's top, 9 at the end. **The Chart:** Tallow's empty slots ink in under the water's row in the tutorial. **The shelf:** the
  hold card keeps the ladder's name and price and the built line "One more slot."; on screen only, the goal line's "Hold N"
  names the slots the next step gives this Wick (at the start, "Next: Hold 5 · 30" for Tallow's Lidded Creel, "Next: Hold
  4 · 30" for every other Wick), so it never reads one short. **The tally:** one more row. **The float:** two more
  good-bite dots at open water than another Wick has at the same step, and one more at every place (the built dots, no new
  sign; in 1a at most 8, under the built cap of 9; from Hold 7, 10 and 11, so the cap must grow, §5). **On the raft:** in 1a the hold is the
  HUD row only (no deck model is built). From the slice that draws SPEC §7's hold on the deck ("a bigger creel on the deck,
  then a chest"), Tallow's deck shows the same creel or chest as the bought step, with a small wicker basket lashed beside
  it, its one more slot (the same basket at every step, so it reads as Tallow's, not as a ladder step). *Polish:* Tallow's
  broad flame settles lower and steadier as the hold fills.
- **Code hooks.** `data.js` (A): `LOOP.wicks.tallow = {passive: 'broad_back', slots: 1, good: 1, everyWater: true, stats: {}}`,
  `TEXT_LOOP.wicks.tallow` (the line), `TEXT_LOOP.murk.firstChartBy = {tallow: 'Four slots in that hold. Fill them and come
  home.'}`; beside `loopWickId`, one pure count on numbers, **`wickSlots(holdSlots, wickId) = holdSlots +
  (LOOP.wicks[loopWickId(wickId)]?.slots || 0)`**, and its wrapper for a save, `loopSlots(metaLoop, wickId) =
  wickSlots(metaLoop.holdSlots, wickId)`; `goodBitesFor({kind, holdSlots, wickId})` takes the bought count as a number:
  open water `wickSlots(holdSlots, wickId) × openPerSlot + openExtra + (LOOP.wicks[loopWickId(wickId)]?.good || 0)`, a
  place its built count plus the Wick's `good` where its `everyWater` (Tallow's) (`goodBitesFor` and `wickSlots` are new 1a exports, so the v1 fingerprint does not move).
  `progression.js` `computeStats` (A): `out.creelSize = loopSlots(meta.loop, r.character)` in place of `holdSlots`.
  `progression-loop.js` (A): `hold().slots`, `holdFull()` (`run.creel.length >= loopSlots(meta.loop, run.character)`) and
  `bitesLeft(key)` read the Wick (on a trip `run.character`; at home `meta.loop.wick`). `ui-loop.js` (C): the hold row and
  the Chart draw `loop.hold().slots` cells (no Wick test in the view); `murkLineFor('firstChart', wick)` picks
  `firstChartBy[wick]` when it exists; `goalLine` names "Hold N" from `wickSlots(next step, wick)`. **`fishing.js` (B):
  nothing** (it reads `getBitesLeft`, which is already Wick-aware). No RNG draw, no v1 or v3 table, no exported v1 function
  changes.

### 2.5 Ashwick: Burned Once, Burns Back

- **Passive:** **Burns Back** (`burns_back`). **On screen:** "A fish that gets away comes back." (7 words, 33 characters;
  unchanged in revision 4: it already says plainly what changes) **Picture:** a fish, and an ember-warm arrow curling back the
  way it went.
- **Rule.** When a hooked fish gets away from Ashwick, **the next bite at that same water this evening is that same fish**:
  the same species, the same size `z`. It is **tired**: +**4** Hold (`hold`, range 2–4: the run cap, `CATCH_V3.buffs.runCap` 4), through the built per-Wick buff
  (inside the run cap). It **spends a good bite like any bite** (so a let-go comeback refunds as built), and it still needs
  its strike. It comes back **once**: if it gets away again, or the strike is missed or spooked, it is gone and the built
  got-away note stands.
  - **Not giants, not legends.** A lost giant becomes the built Marked Fish for Ashwick as for every Wick; legends keep
    their wound rule. A line cut by sailing away (`fishing:escaped {cut: true}`) makes no comeback.
  - **No double second chance.** Under the loop, a fish that will come back is not also marked: `onEscaped` skips
    `addMarkedFish` when it stores a comeback, and runs the built marking only if the comeback itself gets away. So an Elder
    lost once leaves no Marked Fish; lost twice, one.
  - **Lifetime.** A cast at another water keeps the comeback waiting for its own water; only `run:end` or a lake change drops
    it. It takes that water's wait (quiet included); its `z` is fixed. It is consumed and saved **when its bite is
    served**, before the land roll, so quitting mid-play and pressing Continue never brings it back again. If the lingering
    big bite (F16) ships, the two never fire on the same cast: a waiting comeback comes first and the linger keeps its 45 s.
  - The built "+3 Hold on the first fish after dark" is retired on a trip (v3 keeps it).
- **Playstyle (1a): a second chance at the big one.** Ashwick's loss is never final: the one that got away comes straight
  back, tired. **Later:** with places, Ashwick stays on a water after a big loss instead of sailing on.
- **First evening.** About one hooked fish in four gets away on T0, so 63% of first trips see a comeback (0.90 a trip,
  measured, §3.5); in the 1a kit the share of hooked fish lost for good falls from 20% to 4% (−78%).
- **Slice 1a.** All of it, for every built non-legend fish: the built escape event and got-away note, the comeback in run
  state. (No giants in 1a.)
- **Later.** The same at every water; as tackle improves fewer fish get away, but those that do are bigger. Giants stay
  exactly as rare and as hard to land for Ashwick as for anyone (Taper's domain).
- **How it shows.** After the built got-away note, the next float at that water settles with an **ember glow** (a red-orange
  `fx.pulse`, unlike any built sign) and a short **ember hiss**, and the returning bite shows the same size tell. This is the
  one bite whose species you know before the reveal; the got-away note already named it. *Polish:* the ember flame flares
  when the line goes slack.
- **Code hooks.** `data.js`: `LOOP.wicks.ashwick = {passive: 'burns_back', hold: 4, stats: {}}`, `TEXT_LOOP.wicks.ashwick`;
  in the apply block, **under `if (LOOP_ENABLED)` only**, `CATCH_V3.buffs.wicks.ashwick = {hold: LOOP.wicks.ashwick.hold}`
  (no `on`). Line 3588, the v3 quirk at about 4235 and `catchBuffHold` are **untouched** (its built line 4773 already adds
  `q.hold` whenever `q.on !== 'firstHookEachNight'` and `ctx.character` matches). **Lane A owns the comeback**
  (`progression-loop.js`): on `fish:escaped` (it carries `speciesId`, `z`, `place`, `zone`) set `run.comeback = {waterKey:
  loopWaterKey(e.place, e.zone), speciesId, z}` and save; expose `loop.comeback(key)` and `loop.consumeComeback()`; on a
  `fishing:bite {comeback: true}` `noteBite` spends as usual and sets `run.flags.openComeback = true` (cleared by
  `closeBite`); `getCatchBuffs(cls)` returns `character: 'ashwick'` only while it is set, null otherwise. `progression-af.js`
  `onEscaped` (A): the marking rule above. **Lane B reads** (`fishing.js`): in `rollBite`, under `LOOP()`, if
  `loop.comeback(key)` is set, `S.species` is that fish and `S.prerollSp/S.prerollZ` make the built `rollSize` reuse `z`;
  emit `fishing:bite {comeback: true}`; call `loop.consumeComeback()`; `fx.pulse(x, z, {color: 0xd0643a, …})` when the float
  settles, and the hiss (audio, B). `catchBuffsNow`'s fallback returns `character: null` under `LOOP()` unless fishing's own
  comeback flag is set (B's tests with a fake progression assert it). The logs keep their built rule (no run buffs), so the
  +4 is in no log.

## 3. The balance plan for the sim

**When.** After the three-keys rule lands (SPEC v8 §5.5, sim section 7 and the pull), and only once `clams.mjs --wicks` is
**committed**. No knob value here, and no common price factor, is adopted before that run. Lane A owns the run (PLAN §6.4).
**Run** on 15 November 2026 (QUEUE job 8, branch `gw-loop-balance`): §3.5 has the measured figures and the knob values the
run sets; where §3.2 and §3.4 carried an *(est.)* mark, the measured figure now stands in its place.

### 3.1 How each passive is modelled

`clams.mjs` gains a `--wicks` mode and `opts.wick` (an id from `LOOP.wicks`) on `trip()`, `run()` and the pacing run. The
"no passive" Wick (`none`) stays as the reference row. All Wicks read the same `data.js` functions the game does
(`wickPoolWeights`, `quietTerms`, `wickSlots`, `goodBitesFor`; the sim has no `meta.loop`, so it calls the numeric
`wickSlots`, never `loopSlots`).

| Wick | `clams.mjs` | `catch-v3.mjs` |
|---|---|---|
| The Wick | The **pacing run carries one `firsts` ledger** (seen, Prize/Trophy/Elder/Ancient seals exactly as `measure()` stamps them, best length) across the whole game; `trip()` marks each kept non-giant, non-legend fish that is a first and pays the bonus formula, larger-of with an order. Station rows start from the pacing run's ledger at that station's hour | — |
| Taper | `poolFor(…, wick, firstBite)` through `wickPoolWeights`; `trip()` tracks the first bite per water per evening; (slice 2) the giant's share × `giantShare`, capped at `giantCap` | — |
| Stub | `trip()`: `T.wait × waitMul` (not on legend bites); `quietTerms(over, 'stub')` (no wait growth, −0.08 a bite) | — |
| Tallow | **Tallow's run starts with 4 slots and 6 good bites at open water:** `trip()` keeps `kit.hold` as the bought count and sizes the hold by `wickSlots(kit.hold, 'tallow')` (`kit.hold + 1`, so 4 at the start and 9 at Hold 8), and the open water's fresh count by `goodBitesFor({kind: 'open', holdSlots: kit.hold, wickId: 'tallow'})` (`kit.hold + 3`, two more than the no-passive Wick's `kit.hold + 1`); places their built count + 1 (`everyWater`, the lead's ruling); quiet water, the clock and prices as built. A comparison row runs revision 3's open-water-only rule (`everyWater` false). The pacing run buys the same ladder in the same order at the same prices as every Wick, and prints Tallow's trip length and clams a trip at each mark beside its slots | — (no catch term: the catch Hold is untouched) |
| Ashwick | `trip()`: on a loss (not a giant, a legend, a cut line or a comeback) store `{sp, z, water}`; **`leave()` is false while a comeback waits** (Ashwick's policy always takes it); the next bite at that water reuses it, spends a good bite (`here++`) and lands with `landP(…, extraHold = hold)`; `landP` takes `extraHold` in its cache key | a **comeback** row: every non-giant species and class at the kit each water opens with and at its era's end, with +`hold`, stays under its class cap. The other Wicks add no term: their `catchChance` equals the no-passive Wick's |

Not modelled, measured elsewhere: the spook rate per Wick (B's fishing test, Stub's shorter `W` fits fewer nibbles), and the
1a targets on the **built** phase-1 pools (a node test against fishing's own `speciesPool`, not the roster): Taper's first
bite share by day and night, the Wick's count of firsts and its clams over the first 10 trips.

**As built** (the run of §3.5). The four helpers are not in `data.js` until slice 1a exports them: the sim carries stand-ins
with the same signatures, written to §2's rules, uses `data.js`'s own the moment it has one, and prints which it used.
The Wick's sale in the pacing run is the mean over 16 sampled players, each with its own ledger (the pacing run is an
expectation; one player's firsts would make it a lottery); its fishing is the no-passive player's. Taper's giant roll comes
first and keeps its share; `wickPoolWeights` acts on the rest. Ashwick's +`hold` reaches `catchParts` as a run buff, so it is
held to the run cap (`CATCH_V3.buffs.runCap` 4). Tallow's knob is a field of `LOOP.wicks.tallow`, read by `goodBitesFor`:
`everyWater` (its `good` at every place too: check 9's upward knob, adopted by the lead, §3.5 decision 4, with guard 9
amended). The run's `maxSlots` (a cap at 8 slots) is removed by the same ruling: Tallow keeps 9 slots at Hold 8. Revision 3's
rule is printed beside it as a comparison row. Every Wick's clams a minute in each era are measured
against the no-passive player **on the same kits** (the kits that Wick fishes). `catch-v3.mjs --wicks` prints the two rows.

### 3.2 Targets

- **Total time.** "Everything bought" per Wick within **±5%** of the five-Wick mean (**fail**: the balance check that
  matters, the lead's ruling, §3.5 decision 3; revision 3 had ±10% fail and ±5% aimed). **Tune the
  spread first**, with the per-Wick knobs, then put the mean back near **48 h** (§4.9's 40–60 h band) with one common
  factor, `LOOP.priceFactor`, applied inside `fishClams` / `priceOf` and the shelf. **In 1a the factor is ×1.0**: 1a ships
  the built phase-1 species, not the roster's, and tests T23–T25, T36, the shelf and the `Next: {name} · {price}` line
  assert 1a prices. It is tuned in 1b.
- **Per era.** Each Wick earns **+5–20%** clams a minute over the no-passive Wick in **every** era (a **warning**, the lead's
  ruling, §3.5 decision 3: the waters differ, and the fail-level balance is the total time's ±5%).
- **Domain gain and what is seen** (the 1a kit: the Mossmere open water, T1, Hold 4, natural rule, 4,000 trips; then each
  station). The "seen" floor is **at least 1 clearly visible event per first trip on average** for every Wick (check 4); a
  Wick under it fails whatever its clams a minute. **Ashwick's floor is a comeback seen on at least 60% of first trips** (the
  lead's ruling, §3.5 decision 1: measured 63%, 0.90 a trip).

| Wick | its own domain, target | seen per first trip (floor ≥ 1) |
|---|---|---|
| The Wick | clams from firsts: the first 10 trips +20–35%; at each new water's first 5 evenings **+12–32%** (the lead's band, §3.5 decision 2; it was +15–30%) | first-sale ticks at the tally (measured: 2.8 on trip 1, §3.5) |
| Taper | non-common share of bites ×1.6–2.0 in the 1a kit (built pools); (slice 2+) giants home per trip +20–40%, giant share ≤ 12% | 1 non-common first card per evening (measured 1.00; exactly 1 in 1a, when the pool allows) |
| Stub | bites a minute +10–15%; on quiet water, clams a minute past the good bites ×1.3–1.6 | every bite sooner; quiet bites at the fresh pace |
| Tallow | fish a trip +20–35% and clams a trip +20–35% in the 1a kit (Tallow's Hold 4 is 5 slots and 7 good bites, against 4 and 5); still +5% or more clams a minute at the last era (Hold 8: 9 slots, the lead's ruling, §3.5) | the fourth slot filled: 4 fish home on ≥ 90% of first trips (measured: 96%), the fourth glyph and the fourth tally row |
| Ashwick | fish lost for good −50% or more | a comeback on **≥ 60% of first trips** (its own floor, the lead's ruling; measured: 63%, 0.90 per first trip on T0) |

Ashwick, the Wick and (revision 3) Tallow are the front-runners early: **print their first-25-trip clams side by side**.
If Ashwick leads the five by more than 10% after the per-era tuning, its knob is "the first fish that gets away **each
evening** comes back" (once per evening), then `hold`. If Tallow does, its knob is `good` 1 → 0, never the starting slot
(that is the user's answer), nor its 9 slots at Hold 8 (the lead's ruling, §3.5: the cap fallback of §2.4 is ruled out).
`good` is a clams-a-minute knob, not a trip-length knob.

### 3.3 Checks to add (`--wicks`, each printed per Wick and as the five-Wick mean)

1. Pacing (section 5), once per Wick: the end time against §3.2 (**±5% of the five-Wick mean, fail**: the lead's ruling,
   §3.5 decision 3); every §4.9 mark per Wick (10 min 40–90 clams; 1 h 100–240; 5 h 300–900; trips ≤ 6 min; the longest
   wait for one purchase ≤ 90 min; the first giant at hour 0.4–3; the map arrival bands); every place map raises clams a
   minute by ≥ 5% for every Wick (a **warning** per Wick, with the map ladder: §3.5 decision 5). **The per-Wick absolute bands
   are warnings** (the lead, 15 November 2026): §4.9's marks (clams a trip at 10 min, 1 h and 5 h; purchases and maps by an
   hour; the last purchase in 40–60 h; a hold step's gain) are the no-passive curve's own levels, which a Wick that is
   +5–20% a minute must leave, so `--wicks` prints them as warnings (22 in the run of §3.5); the structural checks stay
   failures. **Tallow's clams-a-trip marks are read per slot** (its clams a trip × `holdSlots / wickSlots(holdSlots,
   'tallow')`, so a bigger hold is not a failure by design), and its trip length is held to **under 6 min with the visit
   home at every mark** (fail; a printed 6.0 fails, as ECONOMY's prototype marked it), **except at Hold 8, its 9 slots,
   where Tallow's own ceiling is 6.1 min** (the lead's ruling, §4 guard 3; measured 6.07 at the 40 h mark).
2. Domain gains (§3.2; the Wick's first 5 evenings at a new water +12–32%, fail) and clams a minute per era per Wick
   (+5–20%, a **warning**: the lead's ruling, §3.5 decision 3).
3. Anti-grind, per Wick: the giant hunt ≤ 75% of the natural rule; the grind ≤ the natural rule (**binding for Stub**, whose
   quiet water is gentler); wait-for-dark ≤ 100% (fail); choosy play 80–110% per
   Wick and 85–105% on the mean (Stub is the one to watch); for Taper, a pure hop policy (one bite per water, then on) ≤ 105%
   of Taper's natural rule.
4. First trip: ≥ 50% get a bite after dark, **for every Wick, Stub included** (the knob is `waitMul`, set at 0.78 by the
   run, never the bar); ≥ 90% come home full (**Tallow at 4 slots**); the "seen" floor of §3.2 (Ashwick's: a comeback on
   ≥ 60% of first trips).
5. Giants, against the **no-passive** player (not the mean): every Wick ≥ 0.85× giants home per trip and per hour; only Taper
   may exceed 1.15×, up to its +40% ceiling; Stub ≤ 1.15× per hour; **Tallow ≤ 1.25× per hour** (the lead's ruling, §3.5
   decision 4: a side effect of its good bite at every place, measured ×1.20; its per-trip count is reported against its fish
   a trip: a bigger hold brings more of every fish home, giants included). Taper's giant share ≤ 12% of bites at
   every place, hour and lure.
6. Legends: land chance and landing times the same for all five (within the run's noise); every class cap holds and every
   giant at Prize lands ≤ 50% for every Wick.
7. The three keys (section 7), per Wick: each list's p50 and p95 in **minutes**; p95 ≤ 60 min and p99 ≤ 75 min (fail).
8. The map ladder: per Wick a **warning** (the lead's ruling, §3.5 decision 5); the no-passive player's ladder (section 6)
   stays a failure. `--calibrate --wicks` prints each Wick's tiers and the highest of the five; they are **not adopted** (that
   would re-price the whole game).
9. The knobs, in order, if a Wick is out of band: the Wick `firstMult` then `firstFloor`; Taper `perWater`, then (slice 2)
   `giantShare`; Stub `waitMul` then `quietStep`; Tallow `good` for clams a minute (range 0–2; the starting slot is fixed by
   the user's answer), and `everyWater` (adopted, §3.5 decision 4); for Tallow's trip length, the visit home's share of
   `LOOP.time` (the cap fallback of §2.4 is ruled out: 9 slots at Hold 8, trips to 6.1 min there); Ashwick `hold`, then once per
   evening.

The model's limits stay as SPEC §4.9 says (±10%); the look (light radius) is printed "not modelled". **For the access
job:** the pull counts evenings ended at a water, so very short evenings (one cast, then home) raise it cheaply; counting it
in good bites spent at the water would close that, **but it would give Tallow more pull per open-water evening**: Tallow
spends 6 good bites there against 4 (7–11 against 5–9 later), about 1.5× at the start, in fewer minutes per bite than the
quiet bites others spend. The access job picks one: count only good bites at places (open water's count is Tallow's
alone); or cap each evening's count at the no-passive count for that hold; or accept it and rely on check 7's per-Wick p95
in minutes, with Tallow named as the one to watch. Today's rule (evenings ended) gives Tallow no extra pull.

### 3.4 The five, re-checked (revision 3; measured, §3.5)

Against §3.2's three targets and §1.1's "no two Wicks doing the same thing", with Tallow the carrier. Revision 3 had only
ECONOMY's scratch figures for Tallow (*est.*); the committed run (§3.5) measured all five, on the knobs it sets, and the
re-run after the lead's rulings re-measured Tallow at 9 slots. The figures below are that re-run's: the full run of
`clams.mjs --wicks`, no price factor (×1.0).

| Wick | clams a minute over the no-passive player (+5–20% every era: a warning) | everything bought (target ±5% of the mean, fail) | seen per first trip (floor ≥ 1) | the risk, as measured |
|---|---|---|---|---|
| The Wick | front-loaded: +41% on the first trip, +21.3% in the Mossmere's era, +4.7% to +11.5% in the eras after (3 of 16 out) | **43.5 h** (−1.1%) | **2.8** first-sale ticks | fades between arrivals; each new water's first 5 evenings +13.5% to +31.4% (all inside the lead's +12–32%) |
| Taper | +4.6% to +16.4% (Rushlight Fen out); ×1.76 non-common bites in the 1a kit | **43.6 h** (−0.9%) | **1.00** non-common first card | at one first bite a water it ran +28–48% in 7 eras: now one an evening (`perWater` false) |
| Stub | +5.7% to +12.8% (all 16 in); bites a minute +10.1% in 1a | **44.3 h** (+0.8%) | 5.3 bites, each 2.1 s sooner | its first trips' dark: 52% at `waitMul` 0.78 (48% at 0.75) |
| **Tallow** | −2.5% to +17.8% (Sporewood +3.5%, the Last Light +3.5% and the Waxen Reef −2.5% out); in the 1a kit +9.6% a minute, clams a trip **+29.9%** (64 → 83), fish a trip **+25.1%**; the first trip **+36%** (44 → 60) | **43.6 h** (−0.8%) with its good bite at every place and 9 slots (the lead's rulings, §3.5); revision 3's rule 48.0 h (+9.3%) | **4 fish home** on 96% of first trips, and the fourth slot on the first Chart | revision 3's rule earned nothing a minute (−4.1% to +1.3% in every era); at 9 slots its trips run to 6.07 min at the 40 h mark (its own ceiling 6.1); its giants ×1.20 an hour (its own limit 1.25); its Sporewood list p95 59.8 min (limit 60) |
| Ashwick | +0.5% to +11.9% (7 eras under +5%) | **44.8 h** (+2.0%) | **0.90** comebacks, on 63% of first trips | meets its own floor (≥ 60% of first trips); few late losses, and a comeback fills a slot a fresh bite would have filled |

- **Within ±5%** (the fail-level balance check, the lead's ruling). All five are within ±2.0% of their mean of 43.9 h. The mean is inside §4.9's
  40–60 h band, so no common price factor is applied (×1.0, as 1a needs). The no-passive player takes 47.6 h.
- **+5–20% a minute in every era** (a warning, the lead's ruling). Stub alone holds it in all 16 eras; 66 of the 80
  Wick-eras are inside. The misses and why are §3.5's list; none is a Wick far outside (the lowest is Tallow's −2.5% at the
  Waxen Reef, the highest the Wick's +21.3% in the Mossmere's first hour).
- **≥ 1 visible event per first trip.** Four of five; Ashwick meets its own floor, a comeback on ≥ 60% of first trips (63%;
  §3.5 decision 1).
- **No two the same.** As revision 3 set it, with the lead's Tallow: its good bite at **every** place, not only open water
  (guard 9 amended), and those extra bites at places bring more giants home (×1.20 an hour, inside Tallow's own limit of
  1.25): a side effect of its good bites, accepted by the lead (§3.5 decision 4); giants stay Taper's domain (×1.33 a trip). **Stub** still owns what
  happens past the count, **the Wick** the sale, **Ashwick** the lost fish and the catch Hold on its comeback, **Taper**
  which fish bite; **the clock** is no Wick's.

### 3.5 The measured run (QUEUE job 8, 15 November 2026)

*`node tools/sim/clams.mjs --wicks` on branch `gw-loop-balance` (the full run: 4,000 trips a station row, 1,500 a pacing
kit, 2,000 players a list; `--quick` moves the figures by a point or two). The knobs below are the run's; every other knob is
as §2 starts it. Where §2 still states a starting number this section's value supersedes it; the lead's docs commit carries
them into §2, SPEC §3.x and PLAN 1a. `catch-v3.mjs --wicks` prints the two catch rows (both pass).*

*The lead's rulings (15 November 2026) are in each **Ruling** line below and in "Also for the lead". The sim was changed to
match them and re-run (the full `--wicks` run, exit 0, 214 checks pass and 35 warnings); every figure that Tallow's 9 slots
touch is that re-run's, the rest are unchanged from the first run (it is deterministic).*

**The knobs the run sets** (the fewest and smallest that met §3.2, in check 9's order; Tallow's as the lead ruled them,
decision 4 below):

| Wick | knob | §2's start | the run's value | why |
|---|---|---|---|---|
| The Wick | `firstMult` | 1.5 | **1.4** | at 1.5 its first 10 trips paid +36% (target +20–35%) and the Mossmere's era +26%; `firstFloor` 0.4 stays (0.3 moved nothing measurable) |
| Taper | `perWater` | true | **false** | the first bite **of each evening** is never common. With one at every water and place Taper ran +28% to +48% a minute in 7 eras and finished 10% ahead of the mean. `giantShare` 1.3 stays (1.4 did not lift Rushlight Fen, 3.7%) |
| Stub | `waitMul` | 0.75 | **0.78** | at 0.75, 48–49% of its first trips saw a bite after dark (check 4: ≥ 50%, the knob not the bar); 0.77 gives 50.1%, 0.78 gives 52% with a margin; every era stays above +5% |
| Tallow | `everyWater` (new field) | — | **true** (ruled) | its `good` 1 at every place too (check 9's upward knob, ECONOMY's measured every-water version). Revision 3's rule earned −4.1% to +1.3% a minute in every era and took 48.0 h (+9.6%); `good` 2 at open water alone moved nothing (open water's count never binds a 9-slot trip). Guard 9 as written ("none at a place") forbids it, and its giants break check 5 (decision 4) |
| Tallow | `maxSlots` (new field) | — (9) | **removed** (ruled: 9 slots) | the run tried a cap at 8 slots with the Harbour Chest still bought, because with `everyWater` 9 slots made 6.05-minute trips at the 40 h mark. The lead ruled it out: Tallow keeps 9 slots at Hold 8 and the Harbour Chest gives Tallow its 9th slot; its trips at Hold 8 may run to 6.1 min, its own ceiling (§4 guard 3). Re-measured at 9 slots: 6.07 min, 43.6 h (at 8 slots 43.1 h) |
| Ashwick | `hold` | 4 | 4 | already the run cap (`CATCH_V3.buffs.runCap` 4): the range's 5 and 6 do nothing; "once per evening" only weakens it |

**Per Wick** (the re-run after the rulings: the five-Wick mean 43.9 h; the no-passive player 47.6 h; no price factor):

| | the Wick | Taper | Stub | Tallow | Ashwick |
|---|---|---|---|---|---|
| everything bought | 43.5 h (−1.1%) | 43.6 h (−0.9%) | 44.3 h (+0.8%) | 43.6 h (−0.8%) | 44.8 h (+2.0%) |
| its own domain, the 1a kit (§3.2) | first 10 trips +28.8% | non-common bites ×1.76 | bites a minute +10.1%; quiet water ×1.40 | fish a trip +25.1%, clams a trip +29.9% | lost for good −78% (4% of fish hooked, against 20%) |
| seen on the first trip | 2.8 first-sale ticks | 1.00 non-common first card | 5.3 bites, 2.1 s sooner each | 4 fish home on 96%; 4 slots on the Chart | **0.90 comebacks** (63% of trips) |
| first trip: clams; a bite after dark | 63; 63% | 54; 66% | 44; 52% | 60; 94% | 50; 62% |
| clams a minute, the six stations of section 2 | +41, +30, +15, +13, +11, +7% | +20, +14, +7, +11, +9, +5% | +8, +6, +6, +8, +7, +5% | +10, +11, +10, +5, +17, +7% | +12, +15, +7, +8, +6, +6% |
| clams a minute, the 16 eras | +4.7 to +21.3% | +4.6 to +16.4% | +5.7 to +12.8% | −2.5 to +17.8% | +0.5 to +11.9% |
| giants home a trip; an hour (÷ none) | ×1.00; ×1.00 | ×1.33; ×1.32 (share ≤ 12.0%) | ×1.01; ×1.09 | ×1.35; ×1.20 | ×0.95; ×0.95 |
| the first 25 pacing trips, clams a minute | +50% | +26% | +7% | +39% | +23% |
| lists: the worst p95 / p99 (min) | 54 / 62 | 53 / 61 | 50 / 57 | **59.8** / 71 (Sporewood) | 51 / 56 |
| longest trip at the marks; longest wait | 5.4 min; 73 min | 5.4; 68 | 5.1; 73 | **6.07** (Hold 8, 9 slots); 72 | 5.6; 74 |

**What passes** (the re-run after the rulings, exit 0): everything within ±2.0% of the mean (the ±5% balance check); every
domain target of the 1a kit; every anti-grind check at every station (the giant hunt, the grinds and waiting for dark under
their bars; choosy play 81–100% per Wick, the mean inside 85–105%; Taper's hop 68–100% of its natural rule); Taper's giants
+33% with no share above 12%; Tallow's ×1.20 an hour under its own 1.25; every class cap with the comeback's +4 (catch-v3:
closest 98.9% of a cap); no giant at Prize above 50%; every list p95 ≤ 60 (Tallow's Sporewood at 59.8, the margin to watch
below) and p99 ≤ 75; no map sealed; Tallow's trips under 6 min below Hold 8 and 6.07 at Hold 8 (its ceiling 6.1); the
Wick's first 5 evenings at every new water inside +12–32%; Ashwick's comeback on 63% of first trips (its floor 60%).

**What stays a warning** (35): the 22 per-Wick absolute bands of §4.9 ("Also for the lead" below; Ashwick's Hold 8 among
them, −4.3% a minute for 1.4 trips' income); the per-era band for four Wicks (decision 3: 14 of the 80 Wick-eras out); the
map ladder per Wick, 9 (decision 5: seven of section 6's rules and two "the best water within half an hour", Taper's Thunder
Stair 89 min and Tallow's Rime Sound 166 min).

**What failed in the first run** (16 checks): five decisions for the lead, each ruled below. No §3.3 knob cleared any of
them, and the run is deterministic, so a re-run moved none.

1. **Ashwick's seen floor** (check 4): 0.90 comebacks per first trip, against ≥ 1. A T0 first trip hooks only 3–4 fish and
   loses about one in four; `hold` is already at the run cap and raises no comebacks, and "once per evening" only lowers
   them. *Options:* (a) accept 0.90 for Ashwick (63% of first trips see the ember); (b) a stronger rule, a question for the
   user. **Ruling** (the lead, 15 November 2026): **accepted as measured.** Ashwick's floor becomes "a comeback seen on at
   least 60% of first trips" (measured 63%; 0.90 a trip). No rule change. The sim checks it so (`--wicks` and
   `--shipped=mossmere --wicks`: 63%, passes).
2. **The Wick's first 5 evenings at a new water** (check 2): +13.5% (the Waxen Reef) to +31.4% (the Pallid Deep), with
   Lampmoss Slough +13.8% the other low one. The waters differ more than the band is wide, and both knobs scale every water
   alike. *Options:* (a) widen the per-water band (all 15 waters lie in +13–32%); (b) accept the three waters out.
   **Ruling** (the lead, 15 November 2026): **the band widens to +12–32%** (the waters differ more than the old band was
   wide). It stays a failure-level check. Re-run: +13.5% to +31.4%, all 15 inside.
3. **Clams a minute per era** (check 2: 4 checks, 13 of the 80 Wick-eras out): the Wick in the Mossmere (+21.3%:
   everything is a first) and at the Waxen Reef and the Thunder Stair (+4.7%, +4.8%); Taper at Rushlight Fen (+4.6%: its
   thin pool rarely passes the sign rule, so the rule waits); Tallow at Sporewood (+3.5%) and the Waxen Reef (−2.4%: a
   place-heavy water whose last slots fill no faster); Ashwick in 7 eras (+0.5% to +4.5%): on good tackle few fish get
   away, and a comeback fills a slot a fresh bite would have filled. Ashwick has no upward knob inside the run cap.
   *Options:* (a) widen the per-era band (every era but Tallow's Waxen Reef lies in 0–22%); (b) accept the eras named.
   Tallow's two go with decision 4, Ashwick's with decision 1. **Ruling** (the lead, 15 November 2026): **the per-era band
   (+5–20% a minute) becomes a warning.** The failure-level balance check is the one that matters: each Wick's hours to buy
   everything within **±5%** of the five-Wick mean (it was ±10% fail, ±5% aimed). Re-run: all five within ±2.0% (−1.1% to
   +2.0%); 14 Wick-eras outside +5–20% (Tallow at 9 slots: Sporewood +3.5%, the Last Light +3.5%, the Waxen Reef −2.5%),
   printed as warnings.
4. **Tallow's every-water knob** (check 5, and against guard 9, guard 11 and §1.1): its giants come home ×1.20 an hour
   (check 5: Stub and Tallow ≤ 1.15), because its good bite at every place means more bites at a giant's place. That
   overlaps Taper's domain, against §1.1's "giants home are Taper's alone" and the user's "unique" passives. *Options:*
   (a) adopt `everyWater` and `maxSlots` 8 (43.1 h, −1.7%; giants ×1.20 an hour; guards 3 and 9 and §1.1 rewritten in the
   lead's docs commit; the cap's form chosen below); (b) drop both and keep revision 3's rule: 48.0 h (+9.6% of this mean,
   inside ±10%, outside the aim), trips at most 5.8 min at 9 slots, but −4.1% to +1.3% a minute in every era (check 2 fails
   for Tallow in all 16). **Ruling** (the lead, 15 November 2026): **keep `everyWater`** (Tallow's +1 good bite at every
   place). Revision 3's rule alone took 48.0 h and earned less than no passive in some eras, which would make the carrier the
   user asked for a weak pick. Tallow's giants home ×1.20 an hour is **accepted as a side effect** of its extra good bites
   (giants are still Taper's domain at ×1.33): check 5's limit for Tallow becomes **≤ 1.25**. Guard 9 is amended: Tallow's
   +1 good bite applies at open water and at every place. **The cap:** Tallow goes back to **9 slots**, one more slot at
   every step, as revision 3 and the shelf line say; the Harbour Chest stays the Inkwood's gear key and gives Tallow its 9th
   slot; `maxSlots` is removed from the sim. Tallow's trips at Hold 8 may run to **6.1 min**, its own trip ceiling there
   (§4 guard 3, §3.3 check 1). Re-measured at 9 slots: 43.6 h (−0.8%); the longest trip 6.07 min (the 40 h mark, Hold 8);
   giants ×1.35 a trip, ×1.20 an hour; −2.5% to +17.8% a minute by era; the Sporewood list p95 59.8 min, p99 70.9.
5. **The map ladder per Wick** (check 8, and its echoes in check 1: 9 checks): on the day a lake map is bought, Taper's
   Thunder Stair pays 0.99 and Tallow's Waxen Reef 0.94 of the water before (≥ 1.05); fully mapped, Taper's Thin Water 1.14,
   Stub's Siltway 1.17, Tallow's Rime Sound 1.13 and Ashwick's 1.15 (≥ 1.2); Ashwick's Veilwater adds +3.5% (≥ +5%); and the
   new water is the best water only after 89 min (Taper, the Thunder Stair) and 162 min (Tallow, the Rime Sound), against
   30. The tiers were calibrated on the no-passive player. `clams.mjs --calibrate --wicks` prints each Wick's tiers: the
   highest of the five is Taper's, from Glasswater on (17 against 16, up to the Inkwood's 2,706 against 1,675). *Options:*
   (a) adopt the highest-of-five tiers, as check 8 prescribes, then retune the price factor: a re-pricing of the whole game,
   outside this job's tuning; (b) keep the no-passive tiers and read the ladder checks on the no-passive player alone.
   The tiers are unchanged until the lead rules. **Ruling** (the lead, 15 November 2026): **the map ladder per Wick is a
   warning.** The `--calibrate --wicks` tiers are **not adopted** (that would re-price the whole game). The no-passive
   player's map ladder (section 6, and section 5's "the best water within half an hour") stays failure-level. Re-run (Tallow
   at 9 slots): Taper 0.99 on the day (the Thunder Stair) and 1.14 fully mapped (the Thin Water); Stub 1.17 (the Siltway);
   Tallow 0.95 and 1.09 (both the Rime Sound) and the Rime Sound the best water only after 166 min; Ashwick 1.15 (the Rime
   Sound) and its Veilwater +3.5%; Taper's Thunder Stair after 89 min: 9 warnings.

**Also for the lead** (each a ruling to record here, and carried into §2, §3.3, §4, SPEC §3.x and PLAN 1a by the lead's
docs commit):

- **The per-Wick marks of §4.9** (clams a trip at 10 min, 1 h and 5 h; purchases and maps by an hour; the last purchase in
  40–60 h; a hold step's gain) are the no-passive curve's own levels. A Wick that is +5–20% a minute must land outside some
  of them (the no-passive player's 1 h mark is 234 of the band's 240), so `--wicks` prints them as warnings (22), not
  failures; the ±5% of check 1 (as ruled, decision 3) and every structural check stay failures. This weakens §3.3 check 1
  as written, so it needs the lead's ruling, recorded in check 1. **Ruling** (the lead, 15 November 2026): **the 22
  per-Wick absolute-band warnings stay warnings**; recorded in §3.3 check 1.
- **The form of Tallow's cap**, if decision 4 adopts it: §2.4's fallback says the Harbour Chest is not offered to Tallow,
  but SPEC v8 made Hold 8 the Inkwood's gear key, so Tallow could never open the Inkwood. The run keeps the ladder whole
  (Tallow buys the Harbour Chest, the key, at its price) and stops Tallow's slots at 8: the form §2.4 did not propose, since
  that step then gives Tallow no slot, though its card reads "One more slot." *Options:* this cap; another key for the
  Inkwood; or 9 slots with 6.05-minute trips. **Ruling** (the lead, 15 November 2026, with decision 4): **9 slots**; the
  Harbour Chest stays the Inkwood's gear key and gives Tallow its 9th slot; Tallow's trips at Hold 8 may run to 6.1 min.
- **The guards.** `everyWater` conflicted with guard 9 as written ("none at a place"), and `maxSlots` 8 with guard 3.
  **Ruling** (the lead, 15 November 2026): guard 9 is amended (Tallow's +1 good bite at open water and at every place) and
  guard 3 keeps 9 slots, with Tallow's own trip ceiling of 6.1 min at Hold 8; guard 11 reads giants home as Taper's domain,
  with Tallow's ×1.20 an hour a side effect inside its ≤ 1.25 (§4).
- **Taper's hook**: §2.2 reads the first bite from `loop.favour(key).spent === 0`. That cannot wait for a bite where the
  pool passes the sign rule (the first bite spends it either way), a let-go refund would re-arm it, and with `perWater` false
  it is one flag an evening. The sim counts first bites served under the rule; slice 1a needs the same (a flag of its own).
  **Ruling** (the lead, 15 November 2026): slice 1a keeps **its own flag, one per evening**: set when a bite is served under
  the rule, reset at each evening's start, never re-armed by a let-go refund, and the rule waits until a pool passes the
  sign rule. Written into §2.2 and PLAN 1a (§0's passives row and §2.1 item 15), in place of `loop.isFirstBite` /
  `spent === 0`.
- **Ashwick's `hold` range** (2–6) is capped at 4 by the run cap; the range can read 2–4. **Ruling** (the lead, 15 November
  2026): **2–4** (the run cap); §2.5 fixed.
- **The margin to watch**: Tallow's Sporewood Pools list p95 was exactly **60 min** in the first full run, against a limit
  of ≤ 60 (check 7, a failure-level check), and 61 in `--quick`, which fails. **Re-measured after the rulings** (9 slots,
  the full run): **59.8 min** (p50 43.5, p99 70.9), 0.2 min inside the limit; the 9th slot does not reach Sporewood (Tallow
  has 6–7 slots there), so the figure barely moves. Re-measure it whenever a Tallow knob or the pull changes.
- **M1** ends under its 2–4 h band for every Wick (M1.md §6.2, for the lead and the user). **Ruling** (the lead, 15 November
  2026): the measured length (about 2 h; 1.7–2.0 h per Wick) is M1's default; the band becomes 1.5–4 h; lengthening it is
  an open question for the user (M1.md §6.2, §8 question 1).

## 4. Guards: what no passive may ever do

1. **Fight or hurt anything.** No combat term, ever.
2. **Fail you.** No passive can lose clams, a fish in the hold, a map or a save.
3. **Change the hold's size, beyond the user's one exception.** Every Wick but Tallow starts with 3 slots; Tallow starts with 4,
   one more at every step, 9 at the most (the user, 15 November 2026: "Default for all except 4 which i want yes"; §2.4; the lead's ruling, §3.5:
   no cap at 8). **Tallow's own trip ceiling at Hold 8 is 6.1 min** (its 9 slots; measured 6.07, §3.5); every other trip stays under 6 minutes. Every
   Wick buys the same ladder, in the same order, at the same prices. The hold still decides when a trip ends.
4. **Skip a key.** The map, the gear and the list are needed by every Wick. A passive may speed the list (Taper's first bites,
   Stub's pace); it never ticks a fish that was not landed, and never changes the pull's sure evening.
5. **Make a giant certain.** No passive gives a sure giant bite or catch. A giant's share is never above 12% of bites. A giant at
   Prize lands at most 50% of the time. No passive gives a giant a second try beyond the built Marked Fish.
6. **Touch a legend.** Their bites, waits, Fight, wounds and crown price are the same for all five.
7. **Show odds.** No passive adds a number, a percentage or a word on screen (New Descent's block, guard 12, is the one place a
   passive is named). No Wick term appears in `getOdds` or the gear log, and no code id (such as `broad_back`) reaches the DOM.
   Tallow's "Four slots" replaces "Three slots"; it is not an added word. The pictures (revision 4) carry no digit.
8. **Tell before the reveal.** No sign may reveal a fish's species or novelty before the reveal. Taper's rule tells only "not a
   common", and only where the uncommon-and-rare pool keeps ≥ 2 kinds and none above 80%. Ashwick's returning fish was already
   named by the got-away note.
9. **Add good bites, beyond Tallow's.** Only Tallow's passive changes a good-bite count: at open water, one with its extra slot
   and its own `good` 1, so two more than another Wick at the same step; **and its `good` 1 at every place** (the lead's
   ruling, §3.5 decision 4). Every bite spends one, for every
   Wick (Ashwick's comeback included).
10. **Stack sale doubles.** Only the Wick touches the sale; with an order or the Old Ledger, the larger applies. The card shows
    the base price for every Wick.
11. **Share a variable.** Each passive owns what §1.1 lists; no other Wick touches it. No Wick moves the clock; only Tallow
    changes the hold and the good bites; only Taper raises giants home as its domain (Tallow's extra good bites bring
    ×1.20 an hour as a side effect, accepted by the lead within its own limit of ×1.25, check 5).
12. **Add words or buttons.** One name and one line per Wick, the line **≤ 8 words and ≤ 36 characters** (one row of SPEC
    §8.10's budget; the `validate-data --loop` limits), with one small ink picture, all three only in the lit Wick's block under
    the cards on New Descent, and the picture alone, small, under each card's name there (revision 4, the user's words of 16
    November 2026). No passive has a button, a meter or a toggle.
13. **Depend on save history.** The Wick's ledger is the loop's own; Tallow's slot is computed from the bought `holdSlots`,
    never stored; every passive is the same on a fresh save and a migrated one.
14. **Run off the loop.** Every hook is gated, draws no RNG off the loop, and edits no v1 or v3 table or exported function
    outside the apply block (§2's opening rule).
15. **Copy.** Original names and fantasy; no other game's classes. (LORE §10 asks the lead to consider renaming Ashwick before
    ship; this file keeps the canon name.)

## 5. What changes elsewhere (listed, not edited)

*Revision 3 rewrites this list for Tallow the carrier. Every pointer revision 2 gave for Long Night (SPEC §3.4 Tallow's
evening, §8.5's Last Light delay, the §4.4 Lantern text change, `loopEvening` and its readers, Tallow's T-test) is
**withdrawn**; they are kept with Long Night in §6.4 in case it returns.*

**SPEC.md**
- §0: two decisions rows. (1) The user's words of 14 November ("a powerful unique passive"), pointing here. (2) The user's
  answers of 15 November 2026, verbatim, "Default for all except 4 which i want yes": the four defaults stand, and **the
  carrier is Tallow** (4 slots at the start, one more at every step, and at open water two more good bites than another Wick
  at the same step: its slot's and one of its own). Row 3's ruling ("3 slots at the start, 8 at the most") gains "(Tallow: 4
  and 9, the user's own exception of 15 November 2026; `WICKS.md` §2.4)". Row 4's figures ("52% of first trips bring home
  no Prize or bigger") are marked the no-passive player's; Tallow's (about 41%, *est.*) is printed by check 4.
- §2's evening example (line 156, Murk's "Three slots in that hold.") stays the default Wick's on purpose, with a note: for
  Tallow, "Four slots in that hold." (OPENING's chart beat). Line 165's "44 clams on average, and 52% … no Prize" is the
  no-passive player's.
- §3.1 the hold: "slots at the start | **3** (Tallow 4)"; "slots at the most | **8** (Tallow 9) (five steps, bought in order,
  §4.2)"; "a full hold" unchanged (it refuses at the Wick's count); "on screen" unchanged (the row has the Wick's count of
  glyphs).
- §3.3: open water's good bites "one per slot of your hold, plus one (4 to 9)" gains "**Tallow: two more at the same step**
  (6 to 11: one per slot of its bigger hold, plus one, plus its own one)". The places' counts gain one for Tallow
  (`everyWater`, the lead's ruling, §3.5 decision 4; carried into SPEC §3.3).
- §4.2: one line under the ladder: "Tallow's hold is one slot bigger at every step (4 to 9) at the same prices; the step's
  name is the ladder's." The per-step figures stay the no-passive player's. The sentence "The hold stops at 8 so trips stay
  under 6 minutes" gains "(Tallow: 9; its trips at Hold 8 may run to 6.1 min, its own ceiling, `WICKS.md` §4 guard 3)"
  (the lead's ruling, §3.5; carried into SPEC §4.2).
- §4.9: the pacing run per Wick (§3.3 check 1), with Tallow's clams-a-trip marks read per slot and its trips ≤ 6 min at 9
  slots (for the lead's sign-off); the price factor ×1.0 in 1a; the dark target unchanged for every Wick. The first-trip
  figures (line 530: "98% come home full", "52% bring home no Prize or bigger", "63% get a bite after dark"; line 252: "With
  3 slots and 4 good bites, 63% …") are marked the no-passive player's; Tallow's (about 99%, 41% and 94% in ECONOMY's run,
  *est.*) are printed by check 4.
- §15's hold row (line 1274, "3 → 8 · trips stay under 6 minutes") gains "(Tallow: 4 → 9; check 1 holds its trips to ≤ 6
  min)".
- §7 the raft's hold row: "what you see" gains "(Tallow: the same, with a small basket lashed beside it, its one more slot)".
- §8.1 the hold row: the Wick's count of cells. §8.3's Jetty row (line 797): the goal line "Next: Hold 4 · 30" gains
  "(Tallow: Next: Hold 5 · 30)", §2.4's on-screen rule. §8.6 Murk's first line: for Tallow, "Four slots in that hold. Fill
  them and come home." §11's tutorial row (line 1001): "the First Outing card shows the Mossmere, three empty slots (four
  for Tallow)", and Murk's departure line likewise.
- §9: `holdSlots` stays the bought count (3–8) for every Wick; a Wick's slot count is `loopSlots(meta.loop, wick)`
  (`wickSlots(holdSlots, wick)` on numbers).
- §10.1: the trait table becomes the five passives (name, line, rule in one line each; Tallow's: "Broad Back · Stout enough
  for one more fish. · one more slot at every step (4 to 9) and, at open water, two more good bites than another Wick at
  the same step"). "Each a look and one small
  fishing trait" becomes "each a look and one passive (`WICKS.md`)". "No trait touches the hold, the sale or the good bites"
  is struck and replaced by: "Only Tallow's passive changes the hold's size and a good-bite count (the user's carrier, 15
  November 2026); only the Wick's touches the sale; none touches a legend, the clock or the odds shown." The v6 "join over
  time" alternative stays.
- §8.5 (about line 835): the five trait lines become §2's lines (no Last Light delay: Tallow no longer moves the clock).
- §3.2 (Ashwick's comeback beside the let-go and the linger); §3.3 (Stub's wait and gentler quiet water); §3.5 (Taper's giant
  share ×1.3 under 12%; a lost giant is the Marked Fish for every Wick); §4.1 (the Wick's first bonus, larger-of with orders
  and the Ledger; `LOOP.priceFactor`); §13 slice 1a (the passives ship in 1a; Tallow's hold row is 4–6 cells in 1a; line
  1055, "the three empty slots" → "the empty slots (three; four for Tallow)" and "Fill three slots" → "Fill the hold (three
  slots; four for Tallow)"; line 1060's tests, "the hold: 3 slots, the 4th keep refused" → "the hold: 3 slots (Tallow 4),
  the next keep refused", "quiet after 4 (hold 3)" → "quiet after 4 at hold 3 (Tallow 6)", and the scenario's "three fish →
  Home" → "a full hold → Home"); §14 (the risks of §6.3).
- §10's "the five Wicks" row: still "changed", pointing here; §10's creel row "3 slots, bought to 8" gains "(Tallow 4 to 9)".

**OPENING.md**
- The lead's default paragraph (line 29): "one small fishing trait" → "one passive".
- §3's table (lines 103–109): the "line" and "trait" columns become §2's lines and passives (Tallow: "Stout enough for one more
  fish." · one more slot at every step, and two more good bites at open water than another Wick at the same step).
- Line 112, "No trait touches the hold, the sale or the good bites", is struck and replaced by SPEC §10.1's new sentence.
- **The chart beat** (the beat table's row 6, line 53; the beat detail, line 228; the phone mock, line 260): "the hold's
  three empty slots ink in" → "the hold's empty slots ink in (three; four for Tallow)"; Murk's line is "Three slots in that
  hold. Fill them and come home." or, for Tallow, **"Four slots in that hold. Fill them and come home."** The phone mock
  stays the default Wick's, with a note naming Tallow's line.
- §3's phone layout: the trait line is one line at 18 px on 358 px; `validate-data --loop` adds the ≤ 36 character cap beside
  the word cap, and D's phone screenshot of each lit Wick checks that the line is one line high.
- The New Descent words and layout are otherwise unchanged (one line, the lit Wick's).

**LORE.md** (for its owner)
- §5.3 item 2 (and the §1 answer, line 37) say the four Wicks "wake one at a time on SPEC §10.1's triggers". Under the lead's
  default all five are free, so both need the same "(or all at once, the lead's default)" note.
- Tallow's lore is unchanged (the Stout Candle, "Slow to light. Slower to go out"): nothing in LORE gave Tallow the night, so
  removing Long Night needs no edit. If the owner wants one line for the carrier, it fits §5.1's window candles: the thick
  kitchen candle that burned all night is the sturdiest of them. No lore line is required.

**For the access job** (`gw-loop-access`): count the pull in good bites spent at a water, not in evenings ended (§3.3). But
counting good bites gives Tallow about **1.5× the pull per open-water evening** (6 good bites against 4 at the start, 7–11
against 5–9 later), each in fewer minutes than a quiet bite. Pick one: count only good bites at places; or cap each
evening's count at the no-passive count for that hold (`goodBitesFor` with no Wick); or accept it and rely on check 7's
per-Wick p95 in minutes, with Tallow named as the one to watch.

**slice-1a/PLAN.md**
- §2.1 item 15, the `LOOP.wicks` shape:
  `{order: [...], wick: {passive: 'curious', firstMult: 1.4, firstFloor: 0.4, stats: {}}, taper: {passive: 'long_reach',
  firstBites: 1, perWater: false, giantShare: 1.3, giantCap: 0.12, stats: {}}, stub: {passive: 'moth_bright', waitMul: 0.78,
  quietStep: 0.08, quietWait: false, stats: {lightRadius: 1.5}}, tallow: {passive: 'broad_back', slots: 1, good: 1,
  everyWater: true, stats: {}}, ashwick: {passive: 'burns_back', hold: 4, stats: {}}}` (§3.5's values, as ruled; carried
  into PLAN); plus `LOOP.priceFactor: 1`, the pure exports
  `wickPoolWeights`, **`wickSlots(holdSlots, wickId)`** (numbers) and its save wrapper **`loopSlots(metaLoop, wickId)`**
  beside `loopWickId`, `quietTerms(over, wickId)`, and **`goodBitesFor({kind, holdSlots, wickId})`** (`holdSlots` a number;
  §3.1 of PLAN: "open water `wickSlots(holdSlots, wickId) × openPerSlot + openExtra + good`").
  `loopEvening` is **not** added (withdrawn with Long Night). `TEXT_LOOP.murk.firstChartBy = {tallow: 'Four slots in that
  hold. Fill them and come home.'}` beside `firstChart`.
- §2.1's `computeStats` item (about lines 266–272) and CHOICE 31: `out.creelSize = loopSlots(meta.loop, r.character)` (the
  bought `holdSlots` for every Wick but Tallow); the only stat is Stub's `lightRadius` look. Item 8 (about line 318):
  `catchBuffHold` is not edited; under the loop the apply block sets `CATCH_V3.buffs.wicks.ashwick = {hold}` and
  `getCatchBuffs` gates it (strike "Ashwick reads `ctx.comeback`").
- Item 13 (`getPhaseDurations` hard-coded `{calm: 40, dusk: 20}`) and CHOICE 21: **unchanged** (revision 2's
  `loopEvening(D, run.character)` is withdrawn; every Wick's evening is `LOOP.evening`).
- §3.2's loop API: `hold().slots`, `holdFull()` and `bitesLeft(key)` read `loopSlots` and the Wick (on a trip
  `run.character`; at home `meta.loop.wick`); CHOICE 19 ("the hold is `run.creel`, sized by `holdSlots`") gains "through
  `loopSlots`".
- `meta.loop` gains `firsts: {seen, seals, best}` (cleared by New Descent, seeded empty by `migrateSave`); `run` gains
  `comeback`; `run.flags` gains `openComeback`. `holdSlots` keeps its meaning (the bought count, 3–8).
- §2.5's seam table, new rows: (1) A owns `run.comeback`, `loop.comeback(key)`, `loop.consumeComeback()`,
  Taper's own flag (`run.flags.taperFirst`, `loop.taperFirstOpen()`, `loop.spendTaperFirst()`: one per evening, §2.2); B reads them in `rollBite` / `rollSpecies` and emits `fishing:bite {comeback: true}`. (2) B adds a
  `coinBright` sfx; C calls it on tally rows with `first: true`, falling back to `coin`. (3) A's `loop.saleOf(fish)`; C reads
  the tally rows' `{base, clams, first}`. (4) A's `loop.hold().slots` (Wick-aware); C draws that many cells on the HUD and the
  Chart and never tests the Wick.
- **The tutorial beat** (§5.5, the chart row at line 1261; CHOICE 37 at line 1516; the opening walk at lines 1204–1205;
  P14 at line 101): "the three empty slots" → "the hold's empty slots (`loop.hold().slots`: three, four for Tallow), inking
  in 0.25 s apart"; the line is `murkLineFor('firstChart', meta.loop.wick)`, so Tallow hears "Four slots in that hold. Fill
  them and come home."
- **R11** (Hold 6–8 overflow the phone's top-left row): Tallow reaches **6 cells at 1a's Hold 5**. D's phone screenshot of a
  Tallow trip at Hold 5 (6 cells, 358 px) must fit the row beside the right cluster; if it does not, the two-row wrap planned
  for slice 2 comes into 1a. `shelfMax` stays 5 for every Wick (the same ladder). R11's "8 × 36 px" becomes "9 × 36 px
  (Tallow's top)" for slice 2's two-row wrap.
- **The good-bite dots** (PLAN §2.3, ui-hud-v3 item 4, line 661: `min(9, bitesLeft)`): in 1a Tallow's open water has at most 8
  (Hold 5), so 1a is unchanged. From the slice that sells Hold 7, the cap becomes the largest `goodBitesFor` over the Wicks
  (11, Tallow at Hold 8), so every bite still puts a dot out (SPEC §3.3), and the phone check of the float covers 11 dots.
- **P5** (line 92): "Fill three slots" → "Fill the hold (three slots; four for Tallow)".
- **T10** (line 124): holds for every Wick but Tallow; for Tallow `goodBites('open:mossmere') === 6` at hold 3 and 7 at
  hold 4. The test reads the count through `goodBitesFor` with the run's Wick (or runs on the default Wick and adds the
  Tallow pair).
- **The scenario's main pass** (lines 778–790, `--wick=<id>`, run per Wick in the stager's step 4b): its hard-coded steps
  fail for Tallow (the goal line `Next: Hold 4 · 30`, keep 3, the 4th press refused, `buy hold:4` then `holdSlots === 4`
  and "4 empty cells", and T50's "1 of 3"). The main pass reads its counts from `loop.hold().slots` and its goal line from
  `goalLine` (Tallow: keep 4, the 5th refused, `Next: Hold 5 · 30`, then `holdSlots === 4` and 5 empty cells, T50 at 1 of
  4); or the stager skips the main pass for `--wick=tallow` and runs only lane D's Tallow step. The lead picks; the first is
  the default.
- The lanes. **A**: `data.js` (`LOOP.wicks`, `TEXT_LOOP.wicks`, `TEXT_LOOP.murk.firstChartBy`, the apply-block Ashwick buff,
  `wickPoolWeights`, `wickSlots` and `loopSlots`, `goodBitesFor`'s Wick, `quietTerms`' Wick), `progression.js` (`measure` → `fish.first` and
  the ledger; `computeStats`' `creelSize`), `progression-loop.js` (`saleOf`, the comeback, Taper's flag, `favour` with the
  Wick, `hold`/`holdFull`/`bitesLeft` through `loopSlots`), `progression-af.js` (`onEscaped`'s marking), `validate-data`
  (each knob in its range; each line ≤ 8 words and ≤ 36 characters; `firstChartBy` keys are Wick ids), `clams.mjs` and
  `catch-v3.mjs` (§3). **B**: `fishing.js` (Taper's first bite in `rollSpecies`, `signTiltOk` and the preroll; Stub's wait;
  Ashwick's comeback bite, ember pulse and the fallback; **nothing for Tallow**), audio (`coinBright`, the ember hiss);
  `survival.js` is **not** touched (withdrawn with Long Night). **C**: the tally's double tick and seal glyph, the five lines,
  the hold row and the Chart's cells from `loop.hold().slots`, `murkLineFor`'s Wick, the goal line's "Hold N" from
  `wickSlots` (the next step's). **D**: a per-Wick smoke step in the 1a scenario (each Wick's "seen" event appears: for Tallow, four cells on
  the Chart, Murk's "Four slots" line, and four fish home before "Hold's full."; the comeback and the linger never on the
  same cast; the trait line one line high on a phone; Tallow's 6 cells at Hold 5 on a phone). The flame flourishes
  (`actors.js`, `fishing-fx.js`) and Tallow's deck basket are owned by no 1a lane: they are polish.
- Tests: **T1** (the hold: 3 slots on a fresh `meta.loop` for every Wick but Tallow, **4 for Tallow**; `computeStats().creelSize
  === loopSlots(meta.loop, wick)`; `holdSlots` is 3 for every Wick on a fresh save; a Mended Creel or an upgrade changes
  nothing else); **T23/T24** (the shelf's prices and order are the same for Tallow; after `buy('hold')`, the Hold 4 step,
  `holdSlots === 4`, Tallow has 5 slots and its on-screen goal line reads "Next: Hold 6 · 120" for the Hold 5 step);
  **T36** (the scenario's "three fish → Home" is the default Wick's; the `--wick=tallow` pass and D's Tallow step bring
  four, above); **T53** (`character` is `'ashwick'` only on a comeback bite; null for every other Wick, and in
  the fallback); **T61** (the only stat is Stub's `lightRadius`; Taper's `castMax` and `hookWindow`, Tallow's moveSpeed and
  +2 Hold and Ashwick's built Holds are gone on a trip; `creelSize === loopSlots`; off the loop `computeStats` and
  `catchBuffHold` are unchanged); **T65/T67** (the chart beat with Tallow: four cells, the Tallow line, and the same on a
  reload in the chart beat); **T72** (the `LOOP.wicks` shape and ranges, Taper's `giantShare`/`giantCap` ranges only,
  Tallow's `slots === 1` and `good` 0–2; the tutorial budget with Tallow's line); **T75** rewritten as §3.3, run per Wick,
  also flag-off. New tests, numbered by the lead (proposed T76–T80):
  - the Wick: a first pays once, only on a sale, larger-of with an order; card value = the tally row's `base`, the row's
    `clams` = the amount paid, including after a reload with the card open; a migrated save's ledger starts empty;
  - Taper: on the built Mossmere pools, day and night, the first bite of the evening is never common where the pool allows,
    and the plain pool where it does not (the flag stays clear and the rule waits); the flag is set once a bite is served
    under the rule, reset by the next evening's start, and not re-armed by a let-go refund; for every Wick, every pool × tilt that passes `signTiltOk` has top share ≤ 0.8 with the
    Wick's weights;
  - Stub: `W` ×0.78 before the clamp, not on a legend cast; quiet water: no wait growth, −0.08 a bite to −1.2;
  - Tallow: `wickSlots(holdSlots, 'tallow')` is `holdSlots + 1` at every step (4 to 9) and `holdSlots` + 0 for the other
    four, and `loopSlots(meta.loop, w) === wickSlots(meta.loop.holdSlots, w)`; open water's `goodBitesFor` is `holdSlots + 3`
    for Tallow and `holdSlots + 1` for the others (two more at the same step), a place's count one more for Tallow
    (`everyWater`) and the built count for the other four;
    the cast is refused at Tallow's count and not one before; the tally pays every fish in a 4-fish hold; a save with
    `holdSlots: 8` gives Tallow 9 and `migrateLoop` still clamps the stored count to 3–8; no "broad back" string in the DOM;
  - Ashwick: same `z`; spends a bite; once; a spook spends it; a cast at another water keeps it; `run:end` or a lake change
    drops it; a cut line makes none; no comeback for a giant or legend; quit mid-play and Continue: the next bite is not the
    comeback; an Elder lost once leaves no Marked Fish, lost twice leaves one.
- §7.1, the user's questions: add "Do the five passives (`WICKS.md`) feel right?" (the five questions of this file are
  answered: §1.2).

**QUEUE.md** (the lead's): job 7's note (on the main branch since 8c12f89, not on this branch) records the answers, but its
list of passives still reads "Tallow: Long Night, an early night of bigger fish". It becomes "Tallow: Broad Back, one more
slot at every step and two more good bites at open water (Long Night kept in `WICKS.md` §6.4)". Job 8 (the balancing) runs
§3 with Tallow the carrier, and measures this rule's whole game (only its 1a figures are measured).

## 6. The judging

Three proposals (PLAYSTYLES, FANTASY AND LORE, ECONOMY FIRST) offered six mechanics among them. Each was scored 1–5 against the
seven tests: the user's words (powerful, unique), fun and a distinct way to play, fit with the Wick, balance in the sim, no rule
broken, works in 1a, one short line. The table is the first ruling's; revision 2's changes follow it.

| mechanic | offered as | words | fun | fit | sim | rules | 1a | line | total | given to |
|---|---|---|---|---|---|---|---|---|---|---|
| firsts: new kinds bite more, new seals sell higher | the Wick (PLAYSTYLES, FANTASY) | 4 | 4 | 5 | 4 | 5 | 5 | 4 | **31** | **the Wick** |
| the rarity mix (and giants) | Taper (PLAYSTYLES, FANTASY), Stub (ECONOMY) | 5 | 4 | 5 (Taper) | 4 | 4 | 4 | 5 | **31** | **Taper** |
| the bite wait | Stub (PLAYSTYLES, FANTASY), Taper (ECONOMY) | 4 | 4 | 5 (Stub) | 5 | 4 | 5 | 5 | **32** | **Stub** |
| early dark and bigger night fish | Ashwick (PLAYSTYLES, ECONOMY), Tallow (FANTASY) | 5 | 4 | 4 | 5 | 5 | 5 | 5 | **33** | **Tallow** (revision 3: kept in §6.4) |
| the fish that got away comes back | Tallow (PLAYSTYLES), Ashwick (FANTASY), the Wick (ECONOMY) | 5 | 5 | 5 (Ashwick) | 4 | 4 | 5 | 5 | **33** | **Ashwick** |
| +1 slot and +1 good bite | Tallow (ECONOMY) | 4 | 3 | 4 | 4 | 2 | 5 | 5 | 27 | not used (revision 3: Tallow) |

**Revision 2.** The review found that three of the five were not felt or not unique as written. The Wick keeps only its
sale (its novelty half copied the pull and did nothing on evening 1) and gains personal bests, which are built. Taper's
statistical rescale becomes a rule you can see: the first bite at each water is never common. Stub keeps a milder wait and
gains quiet water, so it changes a decision and no longer steals the night. Tallow's night bonus lifts the favour cap and day
fish keep the base clock, so it lasts all game and costs nothing. Ashwick loses giants (they stay Taper's) and spends a good
bite. Scored again on the same tests:

| revision 2 passive | words | fun | fit | sim | rules | 1a | line | total |
|---|---|---|---|---|---|---|---|---|
| the Wick: firsts and bests sell higher | 4 | 4 | 5 | 4 | 5 | 4 (fades after the first hour) | 5 | 31 |
| Taper: first bites never common | 5 | 4 | 5 | 4 | 5 | 5 | 5 | 33 |
| Stub: quick bites, lively quiet water | 4 | 4 | 5 | 4 | 4 (grind risk) | 5 | 5 | 31 |
| Tallow: early night, cap lifted | 5 | 4 | 4 | 4 | 5 | 5 | 5 | 32 |
| Ashwick: the comeback, no giants | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 34 |

The hauler stays at 27.

**Revision 3.** The user answered the five questions (§1.2): "Default for all except 4 which i want yes" (15 November
2026). Question 4's yes removes the hauler's one low score: it broke "3 slots at the start", and that rule now has the user's
own exception. The lead gives the carrier to Tallow, the doc's own pairing, so each Wick still has one passive: Long Night
leaves Tallow and is kept whole in §6.4. Scored again:

| revision 3 passive | words | fun | fit | sim | rules | 1a | line | total |
|---|---|---|---|---|---|---|---|---|
| Tallow: Broad Back (+1 slot at every step; at open water, its slot's good bite plus one more) | 5 (the user asked for it) | 4 | 5 | 4 | 4 (the per-trip marks read per slot) | 5 | 5 | 32 |

The other four are unchanged (31, 33, 31, 34).

### 6.1 Why each went where it went

- **The Wick: firsts.** "Curious" is its built quirk, and LORE makes it "the first to fish the whole road through": the collector,
  paid for every first. The comeback (ECONOMY's choice) fits "stubborn" less well than it fits Ashwick's title.
- **Taper: rarity.** Its built line is "finds rare fish" and its title is the Long Reach: it reaches the better fish first at every
  water. ECONOMY gave rarity to Stub (a light that draws rare fish), which is a weaker fit.
- **Stub: the wait and quiet water.** "Tiny, quick and fiercely bright": moths keep coming to a flame, even when the water has gone
  quiet. All three proposals agreed the wait is Stub's; revision 2 adds the half that changes a decision.
- **Ashwick: the comeback.** Two proposals gave the night to Ashwick (it "hunts the dark"). The judge followed FANTASY:
  "Burned Once, Burns Back" and "It went out once. It came back angry" describe the comeback almost word for word.
- **Tallow: the carrier (revision 3).** Revisions 1 and 2 gave Tallow the night ("Slow to light. Slower to go out" read as a
  short day and a long night) and kept the hauler as "the alternative if the user wants a carrier". The user wants one. It
  is the lead's own example, ECONOMY's version (+1 slot, +1 good bite) is measured in the 1a kit *(scratch sim, est.)*, where
  it is exactly this rule (its whole-game figures add +1 at every place too, §2.4), ECONOMY offered it for Tallow, and Tallow is the thick, sturdy candle, the Stout Candle: the one built to carry. Its quirk now reads
  as the hauler's evening: the last to turn for home. ECONOMY's fallback (the slot comes with the first Hold step) is not
  needed: the user's yes is to a Wick "who starts with more hold". FANTASY's other hauler (two Smalls or Keepers to a slot)
  gained too little a minute and stays out.

### 6.2 What was grafted from each

- **PLAYSTYLES:** the Wick's per-seal sale, lasting all game on built seals (now with bests, a floor and a loop ledger); the
  `measure()` flag; Taper's giant share (×1.4 tested, started at ×1.3) and the giant-hunter playstyle; the comeback's **same size
  `z`** and its Hold through `CATCH_V3.buffs.wicks` (inside the run cap); Stub's bite-wait measurements; the line style; the risk
  lists.
- **FANTASY AND LORE:** the Wick-to-passive mapping for Tallow and Ashwick; the passive names Curious, Long Reach, Moth-Bright,
  Long Night and Burns Back; Tallow's 20/15 clock and +0.3 night (with Long Night in §6.4 since revision 3); the comeback's once-only rule; **the larger multiplier applies,
  never both**; dropping Taper's `hookWindow` and `rarityBonus` (one passive only); signs only after the reveal.
- **ECONOMY FIRST:** the `landP(extraHold)` cache key; the `--wicks` mode and its checks (±10% fail and ±5% aim); the per-Wick
  `--calibrate` (the highest tier over the five); the common price factor (now `LOOP.priceFactor`, ×1.0 in 1a); choosy play
  80–110% per Wick and 85–105% on the mean; the guard that no forced giant bite appears from nothing; and, in revision 2,
  **giants excluded from the comeback**, which the first ruling had rejected. Taper's normalised share (`rareShare`) is kept
  only as the fallback if the lead prefers a statistical Taper; if restored, it must be `q' = max(q, min(rareCap, rareShare ×
  q))` so it never lowers a pool's rare share.

### 6.3 Rejected details, and the open risks

- **Rejected.** PLAYSTYLES' passive name "Far Water", a parked feature in SPEC §10. ECONOMY's Taper evening ×0.8, which touches
  the clock (Tallow's in revision 2; no Wick's now). ECONOMY's re-rolled comeback size. The Wick's flame leaning *before* the reveal (FANTASY). First-person
  lines (ECONOMY). Tallow's dusk +0.1 and an extra Lantern term. In revision 2: the Wick's "new kinds bite more" (a copy of the
  pull); Taper's ×1.3 rescale as the main rule (not felt); Stub's clock in step with its wait (it would touch Tallow's clock);
  Ashwick "once per evening" as the start (it would fail the "seen" floor; kept as the knob); a Small or Keeper seal (not built).
  In revision 3: ECONOMY's own passive name "The Stout Hold" and line "Stout. I carry one more fish." (first person, and
  "Hold" is also the fight's stat); the +1 good bite at every place (kept as the upward knob, check 9); a new deck model in
  1a (the hold is the HUD row in 1a).
- **Open risks, for the lead.**
  1. Every number is an estimate until `clams.mjs --wicks` is committed; the first ruling's scratch numbers are void.
  2. Taper's first bite may be too strong in 1a (one water, about ×1.9 non-common bites). The knob is `perWater: false` later;
     in 1a there is only one water, so the per-era band decides.
  3. Stub's gentler quiet water reopens a little of the "let everything go" strategy that quiet water closed. Check 3's grind
     and choosy limits are binding for Stub.
  4. The Wick fades in 1a after the first hour (6 kinds only) and is strongest on each new water later.
  5. Ashwick's comeback appears on 63% of first trips on T0 (measured, §3.5; its floor, as the lead ruled, is 60%); fewer
     as tackle improves.
  6. (revision 3) Tallow's bigger trips fail §4.9's clams-a-trip marks by design (ECONOMY's run: 1 h 284 against 100–240, 5 h
     911 against 300–900, *est.*; both for the every-water version, §2.4). In that run the longest trip at the pacing marks,
     the visit home included, was 6.0 min, which the prototype itself marked a fail (not under SPEC §4.2's "under 6
     minutes"); the late trip at Hold 8 (9 slots) was 4.9 min, and the slot alone gave 5.8 min. **For the lead:** confirm
     that Tallow's per-trip marks are read per slot and that its trip length is held to ≤ 6 min (check 1). If Tallow's trips
     pass 6 minutes, the fix is §2.4's fallback (Tallow's hold stops at 8 slots: its ladder ends at the Ferry Hamper), then
     the visit home's share of `LOOP.time`. `good` is not the trip-length knob: the record has more good bites giving
     longer trips (5.8 → 6.0 min), not shorter. The starting slot stays. **Ruled (§3.5 decision 4):** the marks are read
     per slot, the fallback is ruled out, and Tallow's trips at Hold 8 may run to 6.1 min (measured 6.07).
  7. Retiring the built `castMax` +4 m changes Taper's v3-era feel on a trip only; v3 keeps it.
  8. (revision 3) Tallow's 6 cells at 1a's Hold 5 may overflow the phone's hold row (PLAN R11); D's screenshot decides
     whether slice 2's two-row wrap comes into 1a.
  9. (revision 3) Tallow's late-era gain a minute rests on its good bite (SPEC §4.2: a slot past 4 adds little a minute);
     places' counts do not grow for it (only ECONOMY's every-water version, which this rule is not, was run late). Check 2
     fails it under +5% at any era; the knob is `good` 1 → 2, then the +1 at every place (check 9). **Ruled (§3.5):** the
     +1 at every place is adopted and the per-era band is a warning; Tallow's last six eras (the Thunder Stair to the Inkwood) run +5.7% to +17.2% a minute.

### 6.4 The alternatives, kept for later

Each is kept whole so it can return without a new design. Any of them returns only by **replacing** a Wick's passive (one
passive each) and by a new judging against §3.2.

1. **Long Night** (revision 2's Tallow passive, moved here whole in revision 3; the night pairing two proposals gave Ashwick
   and FANTASY gave Tallow). Its sim row, targets, checks, guards and pointers follow the rule as revision 2 wrote it.

   **The rule, as revision 2 wrote it:**

   - **Passive:** **Long Night** (`long_night`). **On screen:** "An early night, full of bigger fish." (7 words, 36 characters)
   - **Rule.**
     - **(a) Night falls early.** Tallow's evening is day **20 s** and dusk **15 s** (`evening`, day range 15–25 s), so night
       falls at 35 s of water time instead of 60 s. Night fish, night water and the Night Rise term open at 35 s. **The early
       dark only adds:** a fish that bites by day or dusk keeps its built window on the base clock (a day fish bites until
       0:40, a dusk fish as built), so Tallow loses no day fish and no day giant.
     - **(b) Bigger after dark.** After dark the built Night Rise term is +0.25 **+ 0.3** for Tallow (`nightFavour`, range
       0.2–0.4), and Tallow's favour cap after dark is the built 1.8 **+ `nightFavour`** (rule-bending; the late raft and bait
       already reach the cap, so a capped bonus would vanish after the first waters). Every class cap still holds, and a giant
       at Prize still lands at most 50% of the time (check 6).
     - Unchanged: good bites, the hold, the bite weights, the land chance, prices. The built raft speed −0.8 and +2 Hold on
       Trophies are dropped.
   - **Playstyle: the night specialist.** "Slow to light. Slower to go out." Tallow sails out to a short day and fishes mostly
     in the dark, where its fish run bigger. To master it: plan the evening around the early night, and know which places
     and giants come alive after dark.
   - **First evening.** The sky turns at 0:20 and it is night by 0:35, so every first trip fishes after dark (100%, against
     about 63% *est.*): about 3 of 4–5 bites after dark, against about 1. More Prizes and Trophies come home.
   - **Slice 1a.** All of it: the Mossmere's built night (the Still night). The Lantern term is 0 until the Lantern ships.
     **First trip only:** the Last Light cue waits until both teaching words ("Hold on the water. Let go to cast." and "Now.
     Tap.") have shown, so the first 35 s carry no stacked text.
   - **Later.** Night water opens at 0:35; night places and night giants are reached sooner and run bigger; the cap lift keeps
     the bonus alive at every water.
   - **How it shows.** The sky darkens early (the built evening grade); the built Last Light and Night Rise cues come sooner;
     the float's favour notches climb higher after dark. The long-press list reads "Night Rise" as built (no new words).
     *Polish:* Tallow's broad orange flame swells after dark.
   - **Code hooks.** `data.js`: `LOOP.wicks.tallow = {passive: 'long_night', evening: {calm: 20, dusk: 15}, nightFavour: 0.3,
     stats: {}}` (the keys of `LOOP.evening`), `TEXT_LOOP.wicks.tallow`, and one pure `loopEvening(D, wickId) = {...LOOP.evening,
     ...(LOOP.wicks[wickId]?.evening || {})}` beside `loopWickId`, so `night: null` and `nightLook` survive. Every reader uses
     it: `survival.js` `getPhaseDurations`, `v3PhaseDuration` and `getPhaseInfo` (B), CHOICE 21's derived `run.eveningT`
     (A), `clams.mjs`'s `E`, T55 and T68. `fishing.js` (B): the built `nightRise` term's **value** + `nightFavour` (the id
     stays, so `TERM_WORDS` shows "Night Rise"); the float's cap + `nightFavour` after dark; the loop's `timeOk` for Tallow
     (chosen once at create) is "Tallow's phase **or** the base phase at the same water time". `ui-loop.js` (C): the first
     trip's Last Light delay.

   **Its sim row (§3.1):** `trip()`: `E = loopEvening(D, 'tallow')`; the phase pool is the union of Tallow's phase and the
   base phase at the same water time; Night Rise + `nightFavour`; the favour cap + `nightFavour` after dark. `catch-v3.mjs`:
   a **cap-lift** row: every species and class at the night places and night water, at the arrival kit and the era's end,
   with Tallow's top favour, stays under its class cap (Elder and Ancient included).
   **Its targets (§3.2):** bites after dark per first trip ≥ ×2; Trophy-or-bigger trips ≥ +40%; still +5% or more at the last
   era (the cap lift); seen: night by 0:35, about 3 bites after dark.
   **Its checks (§3.3):** wait-for-dark ≤ 100% (it idles only about 21 s for the dark); check 6 with the cap lift (every
   class cap holds, every giant at Prize lands ≤ 50%); check 7's slowest day-only species against the median, failing above
   1.5× the other Wicks' p95; knobs `nightFavour` then the day length.
   **Its guards:** the only Wick that moves the clock; the only passive that raises a ceiling (risk: check 6 at every night
   place). **Its pointers:** SPEC §3.4 (Tallow's evening, day fish on the base clock), §8.5 (the first trip's Last Light cue
   waits for both teaching words), §4.4 (the Lantern's text "night fish run bigger" becomes "a wider light; a little more
   after dark", so it does not echo the line); PLAN item 13 and CHOICE 21 read `loopEvening(D, run.character)`; the lanes'
   `survival.js` phase readers and Tallow's Night Rise value, cap and `timeOk` (B), the Last Light delay (C); its test: night
   starts at 35 s and `k` stays finite and ≤ 0.85; a day fish still bites at 0:38; the Night Rise term's value is 0.55 after
   dark and 0 before; no "long night" string in the DOM.
2. **Taper's statistical rescale** (`rareShare`, ECONOMY): the fallback if the lead prefers a statistical Taper, with the
   corrected formula of §6.2.
3. **The hauler's fallback** (ECONOMY): Tallow's extra slot comes with the first Hold step (3 slots on the first trip),
   `good` +2 to compensate (about 49 h, *est.*). Not felt in the first evening, and not what the user's yes asked for.
4. **Two to a slot** (FANTASY's hauler): two Smalls or Keepers share a slot. It gained too little a minute.
5. **The Wicks join over time** (SPEC §10.1's v6 rule), if the user wants Wicks to join instead of all five free.

## 7. Review log

### 7.1 Revision 2 (49 findings)

49 findings were checked against the docs and the code (`data.js`, `fishing.js`, `progression.js`, `progression-af.js`,
`ui-v3.js`, `ui.css`, PLAN). **Accepted:** 46. **Accepted in part:** 1 (#5). **Moot after another change:** 2 (#18, #21).
None was found wrong on the facts; two suggested details were not taken (below).

| # | sev | finding | verdict | what changed |
|---|---|---|---|---|
| 1 | blocker | Taper not felt in the first evening | accepted | (a) is now "the first bite at each water is never common", under the sign rule; the rescale is cut |
| 2 | major | Stub changes no decision | accepted | Stub gains quiet water (no wait growth, −0.08 a bite); the stayer |
| 3 | major | Stub and Tallow share the night | accepted | Stub's `waitMul` 0.75 is tuned to keep ≥ 50% dark; only Tallow moves the clock |
| 4 | major | Taper and Ashwick share giants | accepted | no comeback for giants; check 5: only Taper above 1.15× |
| 5 | major | Ashwick the obvious best pick | in part | giants out, spends a good bite, side-by-side check with the Wick; "once per evening" rejected as the start (≈ 0.7 seen per first trip, under the floor) and kept as the knob |
| 6 | major | the Wick's novelty does nothing and copies the pull | accepted | cut |
| 7 | major | the sale reads as a loss on repeats | accepted | the card shows the base price; the bonus is a tally gift with a floor (0.4 × tier) |
| 8 | major | "powerful" argued only in percentages | accepted | §1.1 and §3.2 "seen" column; floor ≥ 1 in check 4 |
| 9 | minor | Tallow's line echoes the Lantern | accepted | new line; the Lantern's shop text change listed in §5 |
| 10 | minor | "First catches sell higher" is wrong | accepted | "Firsts and new bests sell higher." |
| 11 | minor | Ashwick's 1a playstyle | accepted | "a second chance at the big one"; stay-or-sail under Later |
| 12 | minor | comeback looks like the linger | accepted | ember pulse and hiss; never on the same cast (the linger is not built in 1a, PLAN line 40) |
| 13 | minor | Tallow's cues stack on the first trip | accepted | the Last Light cue waits for both teaching words |
| 14 | minor | Tallow's day window is a grind | accepted | day fish keep the base clock; check 7 fails above 1.5× |
| 15 | blocker | Tallow's night favour is capped late | accepted | cap + `nightFavour` after dark; day and dusk fish on the base clock |
| 16 | blocker | Ashwick's giant comeback breaks guard 5 | accepted | giants excluded; the sim's `leave()` waits for a comeback |
| 17 | blocker | check 5 cannot pass | accepted | restated against the no-passive player |
| 18 | major | Taper's `q'` can lower rare share | moot | the rescale is cut; the corrected formula is recorded in §6.2 |
| 19 | major | the comeback is a free good bite | accepted | it spends a bite; the refund is then legitimate |
| 20 | major | reload exploit | accepted | consumed and saved when served; tested |
| 21 | major | the Wick's novelty fades under the pull; Stub lists | moot / forwarded | novelty cut; lists measured in minutes per Wick; the pull's count sent to the access job |
| 22 | major | the Wick depends on `meta.journal` | accepted | `meta.loop.firsts`, cleared by New Descent |
| 23 | major | five Wicks move giants | accepted | Ashwick and the Wick skip giants; Stub ≤ 1.15× per hour; Tallow ≥ 0.85× |
| 24 | major | 45 day or dusk fish; the sail eats Tallow's day | accepted | the base clock for day and dusk fish; per-Wick place-map check |
| 25 | major | ±10% rests on scratch numbers | accepted | no knob or factor before `--wicks` is committed; spread first; per-era fail |
| 26 | minor | only the wait scales for Stub; legends | accepted | no quiet wait growth now; not on legend casts; Stub's grind is binding |
| 27 | minor | Stub's numbers contradict | accepted | `waitMul` 0.75; the ≥ 50% bar kept; figures marked est. |
| 28 | minor | wait-for-dark and short evenings | accepted | fail at 100%; the pull's count forwarded |
| 29 | blocker | the CATCH_V3 edit breaks the fingerprint | accepted | data.js 3588, 4235 and `catchBuffHold` untouched; the apply block sets `{hold}`; `getCatchBuffs` gates |
| 30 | major | no Small or Keeper seal is built | accepted | firsts are a new kind, Prize/Trophy/Elder/Ancient, and the built `pb` |
| 31 | major | a per-species weight cannot do Taper | accepted | one pure `wickPoolWeights` over the pool, its place in `rollSpecies` named |
| 32 | major | Stub's hook names the wrong wait | accepted | `W *= waitMul` before the clamp; nibbles follow `W`; game mean ≈ 6.4 s |
| 33 | major | card and tally disagree | accepted | reconciled with #7: `priceOf` is the base, `saleOf` adds the bonus, rows carry `{base, clams, first}` |
| 34 | major | two lanes own the comeback | accepted | A owns it; B reads; seam rows listed |
| 35 | major | the Marked Fish gives a double chance | accepted | marking only after the comeback is lost |
| 36 | major | `longNight` would print its id | accepted | Tallow adds to the built `nightRise` value |
| 37 | major | the Wick's line wraps on a phone | accepted | all lines ≤ 36 characters; the validator cap |
| 38 | major | signs skip or break the passive | accepted | `wickPoolWeights` in the preroll and `signTiltOk` |
| 39 | major | 1a figures come from the roster | accepted | built names and pools; 1a node targets |
| 40 | minor | no giant hook in 1a | accepted | (b) marked slice 2; ranges only in T72 |
| 41 | minor | `castMax` is not just a look | accepted | dropped |
| 42 | minor | Tallow's evening readers | accepted | `loopEvening(D, wickId)`; all readers listed |
| 43 | minor | comeback edge cases | accepted | spook, other water, `run:end`, lake change, quiet, cut line settled |
| 44 | minor | the glow is unowned | accepted | lane B, the existing `fx.pulse` |
| 45 | minor | the fallback gives Ashwick +4 everywhere | accepted | null under `LOOP()` unless fishing's comeback flag |
| 46 | minor | Stub fits fewer nibbles | accepted | recorded per Wick in B's test (the nibble count is not compressed) |
| 47 | minor | the price factor changes 1a prices | accepted | `LOOP.priceFactor`, ×1.0 in 1a, tuned in 1b |
| 48 | minor | the brighter coin is a cross-file request | accepted | §5 seam row: B `coinBright`, C calls it |
| 49 | minor | the hooks state no gate | accepted | one rule at the top of §2; guard 14 |

**Not taken.** Part of #5: Ashwick "once per evening" as the starting rule. With giants out and the comeback
spending a bite, the remaining edge is bounded by `hold`, and once per evening would drop Ashwick under the "seen" floor that
#8 asked for. It is the second knob if the side-by-side check shows Ashwick ahead. Also not taken: #2's suggested line
("Quiet water stays lively in its bright light.", 44 characters), which breaks #37's cap.

### 7.2 Revision 3 (the user's answers, 15 November 2026)

The user's words, verbatim: **"Default for all except 4 which i want yes"**. The lead's ruling on 4: the carrier is Tallow (4
slots at the start, one more at every Hold step, +1 good bite at open water; Long Night moves to the alternatives, kept whole).

| # | what | where | what changed |
|---|---|---|---|
| R3-1 | the answers recorded verbatim, with the date; the five questions marked answered | §1, §1.2 | new quote in §1; §1.2's table of the five questions, defaults and answers |
| R3-2 | "3 slots at the start" now has the user's own exception | §1, guard 3 | recorded with the user's words; every other Wick keeps 3 |
| R3-3 | Tallow becomes the carrier | §1.1, §2.4 | Broad Back: the rule (slots 4–9, the ladder unchanged and capped at its fifth step, open water's good bites `holdSlots + 3`), the line "Stout enough for one more fish." (6 words, 31 characters), the playstyle, the tutorial's "Four slots in that hold. Fill them and come home.", the look on the HUD, the Chart, the shelf, the tally and (later) the deck, the code hooks (`loopSlots`, `goodBitesFor`'s Wick; nothing in `fishing.js`) |
| R3-4 | the sim | §3.1, §3.2, §3.3 | Tallow's run starts with 4 slots and +1 good bite; its targets; check 1 reads its clams-a-trip marks per slot and holds its trips to ≤ 6 min; check 4 at 4 slots; check 5 ≤ 1.15× per hour; checks 6 and 7 lose Long Night's terms; check 9's knobs |
| R3-5 | the five re-checked against ±10%, +5–20% a minute, ≥ 1 seen, and the overlaps | §3.4 | ECONOMY's hauler numbers quoted as *est.* (+8.9% a minute, +29% a trip, 47.2 h against a 47.6 h mean, +38% on the first trip); Tallow and Stub split at the good-bite count; no Wick moves the clock |
| R3-6 | the guards | §4 (3, 7, 9, 11, 13) | the hold and the good bites are Tallow's alone; the clock is no Wick's; Tallow's slot is never stored |
| R3-7 | the pointers | §5 | rewritten: SPEC §0, §3.1, §3.3, §4.2, §4.9, §7, §8.1, §8.6, §9, §10.1, §11; OPENING's chart beat and line; PLAN 1a's `LOOP.wicks`, `loopSlots`, the tutorial beat, R11, the lanes and T1, T23/T24, T36, T61, T65/T67, T72, the Tallow test; LORE's Wicks. Every Long Night pointer is withdrawn |
| R3-8 | Long Night kept whole | §6.4 | its rule, sim row, targets, checks, guards, pointers and test, as revision 2 wrote them |
| R3-9 | the judging | §6, §6.1, §6.3 | the hauler rescored (32) and given to Tallow; three new open risks (the per-trip marks and the 6-minute ceiling, the phone row, the late eras) |

### 7.3 The critic's review of revision 3 (15 November 2026)

Twelve findings: one must, seven shoulds, four coulds. The must was settled from the run's record: ECONOMY's scratch
prototype of `clams.mjs` (its `trip()` and `freshOf`) and its report files. **Accepted:** all twelve.

| # | sev | finding | verdict | what changed |
|---|---|---|---|---|
| 1 | must | the good-bite count may not be what ECONOMY measured; "+1" reads as +1 against other Wicks | accepted | the record shows ECONOMY counted open water on Tallow's slots and added `goodPlus` at every water: open water `holdSlots + 3` is ECONOMY's, so the rule stands; "a slot without a good bite" is replaced (the slot alone already had its open-water bite); the 1a figures are this rule's exactly, the whole-game ones (47.2 h, 284, 911, 6.0 min) are the every-water version and this rule's whole game is unmeasured (§2.4, §3.4, §6.1); "two more than another Wick at the same step" in §1.1, §1.2, §2.4, guard 9, the dots, §3.1 and the SPEC, OPENING and QUEUE pointers |
| 2 | should | the 43.7 h inference mixes price scales | accepted | dropped: the record has no no-passive run at ×1.08 (the 47.6 h with no passive is the built ×1.0 run and only equals the ×1.08 mean); the late eras are unmeasured for this rule (§3.4, risk 9) |
| 3 | should | `loopSlots(kit, …)` would return NaN | accepted | one numeric `wickSlots(holdSlots, wickId)`; `loopSlots` wraps it; `goodBitesFor`, the goal line and the sim call `wickSlots` (§2.4, §3.1, §3.3, §5) |
| 4 | should | the 8-slot cap's 6-minute reason; the other reading of "capped as the ladder caps"; the knobs conflict | accepted | 9 stays the default; the fallback (Tallow's hold stops at 8: its ladder ends at the Ferry Hamper) is named in §2.4 and used if its trips pass 6 min; `good` is a clams-a-minute knob only (the record: more good bites, longer trips); the 6.0 min corrected (the longest trip at the pacing marks, a fail in the prototype; the 9-slot late trip was 4.9 min); the SPEC §4.2 sentence and §15's hold row added to §5 (the critic's "§16 table" is §15, line 1274) |
| 5 | should | the access-job claim about the pull is backwards | accepted | counting good bites gives Tallow about 1.5× the pull per open-water evening; three choices for the access job (§3.3, §5) |
| 6 | should | the scenario's `--wick` pass, T10 and P5 not covered | accepted | §5 PLAN pointers for P5, T10 (Tallow 6 and 7) and the main pass (counts from `loop.hold().slots`, or skip it for Tallow) |
| 7 | should | the dots cap of 9 | accepted | §5: the cap becomes 11 from the slice that sells Hold 7 (1a's top is 8, unchanged); R11's 8 × 36 px becomes 9 |
| 8 | should | SPEC lines missing | accepted | §8.3's Jetty row, §13's player row and tests (lines 1055, 1060), §2's line 156 (kept as the default Wick's), §0 row 4 and §4.9's first-trip figures (marked the no-passive player's; Tallow's about 99%, 41%, 94%, *est.*) |
| 9 | could | "Hold N" means two things | accepted | §2.4 states it once: the bought step everywhere but the on-screen goal line |
| 10 | could | the QUEUE pointer is stale | accepted | job 7's list of passives gets Tallow's Broad Back |
| 11 | could | question 4 quoted as if verbatim | accepted | §1 and §1.2 cite the run's wording without quotation marks; the user's answer stays verbatim |
| 12 | could | the first ruling's table has no revision-3 marker | accepted | "(revision 3: kept in §6.4)" and "(revision 3: Tallow)" |

`loopSlots` is kept as the save wrapper, since the hold row, `holdFull` and `computeStats` read a save.

### 7.4 Revision 4 (the user's words, 16 November 2026)

> "When choosing a wick, the passive bonus should be bigger in your view and more obvious what it does. Could they be
> accompanied with a small image indicating what they do?"

**What changed on screen.** New Descent keeps the five portraits, Back and Start. Under the cards, set apart on a deeper pool of
night, the lit Wick's passive is one block: a small ink picture (`ui-icons.js` `passiveIcon`, 64-grid, pale ink with one
candle-amber accent), the passive's name (`TEXT_LOOP.passives`) and its line, one row each. No other screen names a passive, so
the pictures appear nowhere else (the Journal's title names the Wick, not its passive). **What did not change:** every rule,
knob, hook and test of §2–§4; the code ids.

**The user on the first version (16 November 2026):** "Make it bigger on desktop and put icons on every portrait".

| on New Descent | first version | now |
|---|---|---|
| the lit Wick's block on a desktop (960 × 540) | picture 80 px, name 28 px, line 24 px | picture 112 px, name 36 px, line 30 px; a taller window grows them a little (at most 140, 46 and 38 px) |
| the block on a phone (390 × 844) | picture 64 px, name 21 px, line 19 px | unchanged |
| the cards | portrait and name | portrait, name and, under the name, the passive's picture (42 px; 32 on a phone): quiet on the unlit cards (dim ink at a little over half strength, a touch more on a phone), bright on the lit one |
| room for it on a desktop | cards 128 × 164, portrait 92 × 110 | cards 128 × 206, portrait 88 × 105; the panel's top padding and the gaps a little tighter, so the panel still fits a 540 px window |

The first version had set the card pictures aside as busier; drawn quiet (the unlit ones dim, the lit one bright) they let the
eye compare the five before lighting one, and the lit block still says it in words. The pictures are the first version's, not
redrawn. The panel is still five portraits, one block, Back and Start.

**The lines, checked against "more obvious what it does"** (each one row, ≤ 8 words and ≤ 36 characters, SPEC §8.10):

| Wick | was | now | why |
|---|---|---|---|
| the Wick | "Firsts and new bests sell higher." | "New kinds and new bests sell higher." | "Firsts" said first of what only to a player who knew; a new kind and a new best are what the card stamps (a first Prize, Trophy or Elder is almost always a new best too) |
| Taper | "First bites are never common fish." | "Evenings start with a rarer fish." | "First bites" did not say whose or when; the rule is the first bite of each evening, and "rarer" says no more than "not a common" (guard 8) |
| Stub | "Quick bites, even on quiet water." | "Fish bite sooner and keep biting." | "Quick bites" could read as bites that are quick to escape; the passive is the wait (sooner) and quiet water that keeps its pace (keep biting) |
| Tallow | "Stout enough for one more fish." | "One more slot in the hold." | "stout enough" described Tallow, not what changes; now the slot in the hold, plainly, in the shelf's own words ("One more slot.") |
| Ashwick | "A fish that gets away comes back." | unchanged | it already says what changes |
