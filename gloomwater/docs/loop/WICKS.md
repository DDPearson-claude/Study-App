# The five Wicks: one powerful passive each

*Gloomwater's loop, `docs/loop/`. The judge's ruling on three proposals (§6), written 15 November 2026. Every number is a
**starting number** (a knob with its range), not a result: the sim run of §3 sets the final values after the three-keys
rule (SPEC v8 §5.5, branch `gw-loop-access`) lands. This file amends nothing by itself. §5 lists what changes in SPEC,
OPENING and PLAN, for the lead's docs commit.*

## 1. The user's words

> "You can choose any of the 5 wicks but each one has a powerful unique passive ability to help them catch fish or boost something else"
> (14 November 2026)

**Earlier words that bind this design:** catch big and rare fish; the hold limits you (3 slots at the start); no way to fail;
maps are the only way to discover a place; "every catch should feel like a win"; the UI must not be cluttered ("too much
text on screen"); creature attacks parked (no combat); original work only.

**The lead's reading (binding), in short.** All five Wicks are free from the first New Descent. Each has **one** passive
(no button, always on) that is **powerful** (felt in the first evening, about 20–40% in its own domain or a rule-bending
effect) and **unique** (no two Wicks touch the same variable). Balanced over the whole game: each Wick buys everything
within about ±10% of the others' time. No passive breaks a rule. One short plain line on screen per Wick. Each works in
slice 1a (the Mossmere alone, 3 slots, Rod/Line/Reel T1–T2, Hold 4–5) and grows later.

**What "passive" replaces.** SPEC §10.1's small traits (Taper's cast and strike window, Stub's and Tallow's raft speed,
Tallow's +2 Hold on Trophies, Ashwick's +3 Hold on the first fish after dark) are retired. Taper's `castMax` +4 m and Stub's
`lightRadius` +1.5 stay as **looks** that show the passive. They are not a second power, and the sim does not count them.

### 1.1 Who touches what

| Wick | passive | the one variable it touches | the decision it changes |
|---|---|---|---|
| The Wick | **Curious** | the Journal: species not yet in it, and seals not yet stamped | what you keep, and when you move on |
| Taper | **Long Reach** | the rarity mix of the bite pool, and a giant's share of the bites | what you chase |
| Stub | **Moth-Bright** | the wait for a bite | how fast an evening goes |
| Tallow | **Long Night** | the evening clock, and favour after dark | when you fish |
| Ashwick | **Burns Back** | the fish that got away | how hard you push |

The passive names are design names and code ids. They are **never shown**: the New Descent screen shows only the one line.

## 2. The five Wicks

### 2.1 The Wick: A Small, Stubborn Flame

- **Passive:** **Curious** (`curious`, the built quirk's name). **On screen:** "New kinds bite more. First catches sell higher." (8 words)
- **Rule.**
  - **(a) New kinds bite more.** In the species roll, a species with no Journal entry bites ×**2** (`novel`, range 1.5–2.5).
    Giants (they keep their fixed share), legends and curiosities are excluded. A fish that bites only on one bait still
    needs its bait. With the three keys' pull (SPEC v8 §5.5 (d), ×min(6, 1 + evenings) on a listed fish not yet landed), the
    two multiply, and the product is capped at the pull's own cap (×6). So the Wick is never pulled less than any other
    Wick. The pull's "sure from the ninth evening" is unchanged. The Wick speeds the catch key and never skips it.
  - **(b) First catches sell higher.** A **kept** fish whose measure stamped a **new Journal seal** sells for ×**1.35** at the
    tally, rounded (`sealMult`, range 1.25–1.5). A new seal means a new species, or that species' first Small, Keeper,
    Prize, Trophy, Elder or Ancient (the built class seals). It is paid once per seal per save, and only on a sale. A fish
    let go keeps its seal and loses the bonus, so the Wick's keep-or-let-go is a real choice. Giants are included and
    legends are excluded (their crown price is fixed). With one of Murk's orders or (from slice 9) the Old Ledger's double,
    **the larger multiplier applies, never both.**
  - Unchanged: the hold, sizes, good bites, the land chance, the clock.
- **Playstyle: the collector and wanderer.** It keeps the first of every kind, chases each species' Trophy and Elder seal,
  and sails on as soon as a water's list is done. To master it: know which seals you still lack, and when a new Small is
  worth a slot.
- **First evening.** Every fish is a first, so the first tally pays about 58 clams instead of 44 (+32%). Over the first 25
  Mossmere trips, about +22% clams a minute. The Mossmere's 12 open-water species take a median of 17 trips instead of 31
  (90th percentile 43 instead of 84). Both measured without the pull; with the pull, both lists finish sooner.
- **Slice 1a.** All of it works. Journal entries and class seals are built. The sale needs one flag, `newSeal`, set where
  `measure()` already writes the records and carried on the hold fish, and the tally multiplies it. The pull's term is ×1
  until the three keys ship.
- **Later.** Each new water brings a fresh set of names and seals, so it keeps working all game (estimated +7–15% clams a
  minute per era). With the three keys it is the fastest Wick to open each water. A giant's first Keeper, Prize or Trophy
  seal pays ×1.35 of a giant's price, so a giant seal is worth chasing.
- **How it shows.** The built seal stamp lands on the card, and the card's **Keep** number already includes the bonus
  ("Keep · 35" where a repeat reads "Keep · 26"). At the tally a bonus fish ticks up twice, with one brighter coin chime.
  *Polish, after the reveal only:* the Wick's flame leans toward a fish it has never held. It never leans before the
  reveal, because that would tell you the species is new.
- **Code hooks.** `data.js`: `LOOP.wicks.wick = {passive: 'curious', novel: 2, sealMult: 1.35, stats: {}}` and
  `TEXT_LOOP.wicks.wick`. `fishing.js`: the species roll's weight (reads the Journal through `ctx.progression`; one
  pure `wickBiteWeight(wickId, sp, ctx)` in `data.js` beside `loopWickId`, shared with Taper). `progression.js`
  `measure()`: sets `fish.newSeal`. `progression-loop.js`: the tally (`value × sealMult` for `newSeal`, then max with an
  order's double). `ui-loop.js`: the double tick. Audio: the chime.

### 2.2 Taper: The Long Reach

- **Passive:** **Long Reach** (`long_reach`). **On screen:** "Fewer common fish. More rare ones." (6 words)
- **Rule.**
  - **(a) The rarity mix.** In every bite pool (open water and every place), the share of bites that are uncommon or rare
    fish is ×**1.3** (`rareShare`, range 1.2–1.4), capped at 85% (`rareCap`). It is applied as one factor `f` on the weights
    of non-common, non-giant, non-legend fish: `f = q'(1 − q) / (q(1 − q'))`, where `q` is that pool's own non-common share
    and `q' = min(0.85, 1.3q)`. So the gain is the same everywhere, whatever a water lists. The rescale goes after the hour,
    bait, lure and pull terms and before the giant's share.
  - **(b) Giants.** A giant's fixed share of the bites at its own place is ×**1.3** (`giantShare`, range 1.1–1.4): 6% → 7.8% in
    its hour, 2.5% → 3.25% outside it, and with its giants' lure 9% → 11.7%. It is **never above 12% of bites**
    (`giantCap`). It is still a share, so a giant never bites for certain, and the land chance is untouched (a giant at Prize
    still lands at most 50% of the time).
  - Unchanged: legends (their own bite rule), sizes, Hold, the strike, good bites, the clock, prices. The built `hookWindow`
    +10% and `rarityBonus` are dropped: one passive only.
- **Playstyle: the rare-fish and giant seeker.** Evenings are richer in kinds and leaner in small fry. Taper buys the
  giants' place maps first, fits the giants' lure and waits for the giant's hour. To master it: route by the giants' hours
  and lures, and judge when a rare Keeper beats waiting for the giant.
- **First evening.** On the Mossmere's open water about 1 bite in 4.4 is an uncommon or rare (Weeping Carp, Kissmark Trout,
  Candlefin Koi, Milkeye Perch, the Reedjaw Pike) instead of 1 in 5.7 (17.5% → 22.4%). About +9–13% clams a minute in the 1a kit.
- **Slice 1a.** (a) works on the Mossmere's built open-water fish. (b) has nothing to act on until slice 2 brings giants.
- **Later.** Places draw their better fish on top (the day water's ×1.5, the kinds of place). Giants come home about 20–30%
  more often a trip (estimated from a ×1.4 test: +28–42%).
- **How it shows.** More uncommon and rare frames on the card, and later more gold-edged giant glyphs in the hold row. The
  float lands visibly farther out (the built `castMax`, the look). *Polish, after the reveal only:* the tall flame stretches
  taller for a moment when Taper holds up an uncommon or rare.
- **Code hooks.** `data.js`: `LOOP.wicks.taper = {passive: 'long_reach', rareShare: 1.3, rareCap: 0.85, giantShare: 1.3,
  giantCap: 0.12, stats: {castMax: 4}}` and `TEXT_LOOP.wicks.taper`; `wickBiteWeight` (as for the Wick). `fishing.js`: the
  species roll (the rescale) and the giant's fixed-share term (SPEC §3.5). `catch-v3.mjs`: nothing (no Hold change).

### 2.3 Stub: The Bright Little One

- **Passive:** **Moth-Bright** (`moth_bright`). **On screen:** "Fish bite sooner at its bright light." (7 words)
- **Rule.** The wait for a bite after the float settles (`AUTOFISH.time.wait`, 7.5 s) is ×**0.65** for Stub, about 4.9 s
  (`waitMul`, range 0.6–0.75). Quiet water's longer wait (+30% per stale bite, up to ×2.2) is multiplied the same way, so
  quiet water stays slower than fresh water, by the same ratio. The nibble schedule shortens to match. Unchanged: which
  fish bite, sizes, the strike window, the play, the clock (day 40 s, dusk 20 s), good bites, the hold, prices. The built raft
  speed +1, pickup radius, Embers and creel malus are dropped; `lightRadius` +1.5 stays as the look.
- **Playstyle: the sprinter.** Short, bright evenings and more of them: it fills the hold before dark, sails home and goes
  again. It meets mostly day and dusk fish, which suits short sessions. To master it: spend the good bites fast, and judge
  when one more place is worth the sail.
- **First evening.** The float settles and a bite comes almost at once. The first trip is about 1.9 min instead of 2.2, with the
  same clams: +11% clams a minute. Fewer first trips reach the dark (about 43%, against 63%): Stub is the day flame.
- **Slice 1a.** All of it, on the bite timer alone.
- **Later.** The same everywhere, so it grows with every water: +8–15% clams a minute per era (measured). A quiet place
  costs Stub less time. It never changes what bites, so giants stay exactly as rare per bite.
- **How it shows.** The bite tell comes quickly after each cast; the good-bite dots by the float go out faster. *Polish:*
  motes and moths stream into Stub's wide light, and the little flame pulses brighter at each bite.
- **Code hooks.** `data.js`: `LOOP.wicks.stub = {passive: 'moth_bright', waitMul: 0.65, stats: {lightRadius: 1.5}}` and
  `TEXT_LOOP.wicks.stub`. `fishing.js`: the bite-wait draw and the nibble scheduler multiply by the Wick's `waitMul`.

### 2.4 Tallow: The Stout Candle

- **Passive:** **Long Night** (`long_night`). **On screen:** "Night comes early. Night fish run bigger." (7 words)
- **Rule.** Tallow's evening is day **20 s** and dusk **15 s** (`evening`, day range 15–25 s), so night falls at 35 s of water
  time instead of 60 s. The night still holds until you turn for home. After dark, every bite gets favour **+0.3**
  (`nightFavour`, range 0.25–0.4) on top of the built night term (+0.25, and the Lantern's +0.1 a level), under the built
  favour cap. The hour windows follow Tallow's clock, so dusk and night fish and night water open sooner, and day-only fish
  get 20 s of day. Unchanged: good bites, the hold, the bite weights, the land chance, prices. The built raft speed −0.8 and
  +2 Hold on Trophies are dropped.
- **Playstyle: the night specialist.** "Slow to light. Slower to go out." Tallow fishes through a short day, takes the dusk
  fish early and stays out in the dark, where the big fish run. It gives up some day-hour fish and day giants: that is its trade.
  To master it: plan the evening around a 20-second day, and know which maps' giants bite after dark.
- **First evening.** The sky turns at 0:20 and it is night by 0:35, so every first trip fishes after dark (100%, against
  63%). About 59% of first trips bring home a Prize or bigger instead of 47%, and 13.6% a Trophy or bigger instead of 8%.
  About +14% clams on the first trip, +15% a minute in the 1a kit. (Measured with an extra dusk +0.1 term this ruling drops;
  T75 re-measures.)
- **Slice 1a.** All of it: the Mossmere's built night (the Still night), and its dusk and night species open earlier. The
  Lantern term is 0 until the Lantern part ships.
- **Later.** Night water opens at 0:35; dusk and night giants (the Hullkiss Lamprey, the night places' giants) are reached
  sooner and run bigger; the Lantern's levels stack. Day giants come home less often, because their light is short.
- **How it shows.** The sky darkens early (the built evening grade); the built Last Light and Night Rise cues come sooner;
  the float's built favour notches show the bigger night favour. *Polish:* Tallow's broad orange flame swells after dark.
- **Code hooks.** `data.js`: `LOOP.wicks.tallow = {passive: 'long_night', evening: {day: 20, dusk: 15}, nightFavour: 0.3,
  stats: {}}` and `TEXT_LOOP.wicks.tallow`. `survival.js`: `getPhaseDurations` and the phase clock read the trip's Wick
  (`LOOP.evening` per Wick). `fishing.js`: the favour list (the `hour` family, beside `nightRise`, about line 446) adds
  `{family: 'hour', id: 'longNight'}` after dark.

### 2.5 Ashwick: Burned Once, Burns Back

- **Passive:** **Burns Back** (`burns_back`). **On screen:** "A fish that gets away comes back." (7 words)
- **Rule.** When a hooked fish of any class gets away from Ashwick (giants included, legends excluded), **the next bite at
  that same water this evening is that same fish**: the same species, the same size `z`. It is **tired**: +**4** Hold
  (`hold`, range 2–6), through the built per-Wick buff (`CATCH_V3.buffs.wicks.ashwick`, inside the run cap). The returning bite
  **spends no good bite** (like a fish let go), and it still needs its strike. It comes back **once**: if it gets away again,
  or the strike is missed, it is gone and the built got-away note stands. Sailing to another water or going home drops it.
  A lost giant comes back first; if the comeback is lost too, the giant becomes the built Marked Fish at its place (the
  Holds do not stack). Legends keep their own wound rule. The built "+3 Hold on the first fish after dark" is retired.
- **Playstyle: the bold striker.** Ashwick strikes every big tell, even on starter tackle, and holds its water after a loss,
  because the fish will be back. It turns the game's only loss into a second chance: "every catch should feel like a win".
  To master it: stay on the water after a big one gets away, instead of sailing on.
- **First evening.** About one hooked fish in four gets away on T0. With Ashwick, the share lost for good falls from 26% to
  about 8%. A lost Prize comes back on the next cast with the same size tell. About +16% clams on the first trip.
- **Slice 1a.** All of it, for every built fish: the built escape event and got-away note, and the stored comeback in run
  state, so Continue keeps it. No giants until slice 2: for now it is the second chance at Prizes and Trophies.
- **Later.** A lost Thousandcast Pike comes back the same evening: giants come home about +20–30% more often a trip.
  Bites are unchanged, so giants stay rare and a comeback only follows a giant that already bit by chance.
- **How it shows.** After the built got-away note, the next float settles at that water with a small ember glow, and the
  returning bite shows the same size tell. The card is the normal card. *Polish:* the ember-red flame flares when the line
  goes slack, and a curl of smoke drifts where the fish went. This is the one bite whose species you know before the reveal;
  the got-away note had already named it, so nothing new is revealed.
- **Code hooks.** `data.js`: `LOOP.wicks.ashwick = {passive: 'burns_back', comeback: {hold: 4, once: true}, stats: {}}`,
  `CATCH_V3.buffs.wicks.ashwick = {hold: 4, on: 'comeback'}` (replaces `firstHookEachNight`; `catchBuffHold` reads
  `ctx.comeback`), the old quirk line at about 4235 retired, and `TEXT_LOOP.wicks.ashwick`. `fishing.js`: on escape, store
  `run.comeback = {waterKey, speciesId, z}`; the next bite at that `waterKey` uses it; emit `fishing:bite {comeback: true}`.
  `progression-loop.js`: `getBitesLeft` does not spend a comeback bite; the save carries `run.comeback`; the Marked Fish rule
  runs only after a second loss. `progression` `getCatchBuffs`: `character: 'ashwick'` only on a comeback bite. The logs
  keep their built rule (no run buffs), so the +4 is in no log.

## 3. The balance plan for the sim

**When.** After the three-keys rule lands (SPEC v8 §5.5, sim section 7 and the pull), because the Wick's novelty multiplies
the pull and Tallow's short day changes how fast day-only fish fill a list. Lane A owns the run (PLAN §6.4).

### 3.1 How each passive is modelled

`clams.mjs` gains a `--wicks` mode and `opts.wick` (an id from `LOOP.wicks`) on `trip()`, `run()` and the pacing run. The
"no passive" Wick (`none`) stays as the reference row.

| Wick | `clams.mjs` | `catch-v3.mjs` |
|---|---|---|
| The Wick | `poolFor` takes the missing-Journal set (as the pull does, in its cache key) and multiplies those weights by `min(cap, novel × pull)`. `trip()` returns each kept fish's seal (`species|class`) and pays `× sealMult` on a seal not yet in the save's seal set. The **pacing run carries one Journal and one seal set across the whole game** (exact). Station rows (section 2) start from the pacing run's Journal at that station's hour, not from empty | — |
| Taper | `poolFor(…, wick)`: the rescale `f` on non-common weights, then the giant's share × `giantShare`, capped at `giantCap`; the Wick in the cache key | — |
| Stub | `trip()`: `T.wait × waitMul` (quiet growth untouched, so it scales with it) | — |
| Tallow | `trip()`: `E = LOOP.wicks.tallow.evening`; `mu += nightFavour` at night | — |
| Ashwick | `trip()`: on a loss (not a legend, not already a comeback) store `{sp, z}`; the next bite at that water reuses it without `here++`, runs the policy's strike, and lands with `landP(…, extraHold = 4)`; leaving the water drops it. `landP` takes `extraHold` and adds it to its cache key | a **comeback** row: every species and class at the kit each water opens with and at its era's end, with +4 Hold, stays under its class cap, and every giant at Prize stays ≤ 50%. The other four Wicks add no term: `catchChance` for them equals the no-passive Wick's |

### 3.2 Targets

- **Total time.** "Everything bought" per Wick within **±10%** of the five-Wick mean (fail), aim **±5%** (warn). The proposals
  measured all five at about +9–15% clams a minute over today's trait-less player (43–45 h against 48.9 h). So the five-Wick
  mean is put back near **48 h** with **one common price factor** on every `LOOP` price, bait tins included (start ×**1.10**;
  the proposals found 1.08–1.11), retuned after the per-Wick runs. The mean must stay in §4.9's 40–60 h band.
- **Domain gain** (the 1a kit: the Mossmere open water, T1, Hold 4, natural rule, 4,000 trips; then each station):

| Wick | its own domain, target | clams a minute over no passive |
|---|---|---|
| The Wick | the Mossmere list's median trips ≤ 0.65× (without the pull); the first 25 trips +20–35% clams | +5–20% in every era |
| Taper | non-common share of bites ×1.25–1.4; (slice 2+) giants home per trip +20–40%, giant share ≤ 12% of bites | +5–20% |
| Stub | wait from settle to bite −30 to −40%; bites a minute ≥ +12% | +5–20% |
| Tallow | bites after dark per first trip ≥ ×2; Trophy-or-bigger trips ≥ +40% | +5–20% |
| Ashwick | fish lost for good −50% or more; (slice 2+) giants home +15–30% | +5–20% |

### 3.3 Checks to add (`--wicks`, each printed per Wick and as the five-Wick mean)

1. Pacing (section 5), once per Wick: the end time against §3.2; every §4.9 mark per Wick (10 min 40–90 clams; 1 h 100–240;
   5 h 300–900; trips ≤ 6 min; the longest wait for one purchase ≤ 90 min; the first giant at hour 0.4–3; the map arrival bands).
2. Domain gains (§3.2) and clams a minute per era per Wick.
3. Anti-grind, per Wick: the giant hunt ≤ 75% of the natural rule (Ashwick is the tight one: 71% at the 40 h station in a
   test); the grind ≤ the natural rule; wait-for-dark ≤ 105% (Tallow); choosy play 80–110% per Wick and 85–105% on the mean.
4. First trip: ≥ 50% get a bite after dark (**Stub: ≥ 40%**, the day flame; for the lead's ruling); ≥ 90% come home full.
5. Giants: kept by the end within ±15% of the mean; Taper's giant share ≤ 12% of bites at every place, hour and lure.
6. Legends: their land chance and landing times are the same for all five Wicks (within the run's noise).
7. The three keys (section 7), per Wick: each list's p95 ≤ 60 min and p99 ≤ 75 min; the Wick's lists finish fastest; for
   Tallow, the day-only fish on each list are reported on their own.
8. The map ladder: `--calibrate` takes, for each water, the highest tier over the five Wicks (a ladder rule must hold for
   every Wick), then the price factor is retuned.
9. The knobs, in order, if a Wick is out of band: the Wick `sealMult` then `novel`; Taper `giantShare` then `rareShare`;
   Stub `waitMul`; Tallow `nightFavour` then the day length; Ashwick `hold` (or a Keeper-and-bigger floor on the comeback).

The model's limits stay as SPEC §4.9 says (±10%); the looks (cast distance, light radius) are printed "not modelled".

## 4. Guards: what no passive may ever do

1. **Fight or hurt anything.** No combat term, ever.
2. **Fail you.** No passive can lose clams, a fish in the hold, a map or a save.
3. **Change the hold's size.** Every Wick starts with 3 slots and buys the same ladder. The hold still decides when a trip ends.
4. **Skip a key.** The map, the gear and the list are needed by every Wick. A passive may speed the list (the Wick, Ashwick, a
   little); it never ticks a fish that was not landed, and never changes the pull's sure evening.
5. **Make a giant certain.** No passive gives a sure giant bite or catch. A giant's share is never above 12% of bites. A giant at
   Prize lands at most 50% of the time, comeback included. A comeback only follows a giant that already bit by chance.
6. **Touch a legend.** Their bites, Fight, wounds and crown price are the same for all five.
7. **Show odds.** No passive adds a number, a percentage or a word on screen. No Wick term appears in `getOdds` or the gear log.
8. **Tell before the reveal.** No sign may reveal a fish's species, rarity or novelty before the reveal. The Wick's lean and
   Taper's stretch come only after it. The one exception is Ashwick's returning fish, which the got-away note has already named.
9. **Add good bites.** No passive changes a water's good-bite count. Ashwick's comeback is one free bite per lost fish, like a
   fish let go.
10. **Stack sale doubles.** Only the Wick touches the sale; with an order or the Old Ledger, the larger applies.
11. **Share a variable.** Each passive owns the variable of §1.1; no other Wick touches it.
12. **Add words or buttons.** One line per Wick (≤ 8 words, the `TEXT_LOOP` validator's limit), only under the cards on New
    Descent. No passive has a button, a meter or a toggle.
13. **Copy.** Original names and fantasy; no other game's classes. (LORE §10 asks the lead to consider renaming Ashwick before
    ship; this file keeps the canon name.)

## 5. What changes elsewhere (listed, not edited)

**SPEC.md**
- §0: a decisions row for the user's words of 14 November ("a powerful unique passive"), pointing here.
- §10.1: the trait table becomes the five passives (name, line, rule in one line each). The sentence "each a look and one small
  fishing trait" becomes "each a look and one passive (`WICKS.md`)". The sentence "No trait touches the hold, the sale or the good
  bites" is struck and replaced by: "No passive changes the hold's size, a water's good bites, a legend or the odds shown; only the
  Wick's touches the sale." The v6 "join over time" alternative stays.
- §8.5 (about line 835): the five trait lines become §2's lines.
- §3.3 (Stub's wait, and Ashwick's free comeback bite beside the let-go refund); §3.4 (Tallow's evening); §3.5 (Taper's giant share
  ×1.3 under 12%; Ashwick's comeback before the Marked Fish); §4.1 (the Wick's seal bonus, larger-of with orders and the Ledger);
  §4.9 (the pacing run per Wick, the common price factor, and Stub's first-trip dark target); §13 slice 1a (the passives ship in
  1a); §14 (the risks of §6.3).
- §10's "the five Wicks" row: still "changed", pointing here.

**OPENING.md**
- The lead's default paragraph (line 29): "one small fishing trait" → "one passive".
- §3's table (lines 103–109): the "line" and "trait" columns become §2's lines and passives.
- Line 112, "No trait touches the hold, the sale or the good bites", is struck, as in SPEC.
- The New Descent words and layout are unchanged (one line, the lit Wick's).

**LORE.md** (for its owner)
- §5.3 item 2 says the four Wicks "wake one at a time on SPEC §10.1's triggers". Under the lead's default all five are free, so it
  needs the same "(or all at once, the lead's default)" note.

**slice-1a/PLAN.md**
- §2.1 item 15, the `LOOP.wicks` shape:
  `{order: [...], wick: {passive: 'curious', novel: 2, sealMult: 1.35, stats: {}}, taper: {passive: 'long_reach', rareShare: 1.3,
  rareCap: 0.85, giantShare: 1.3, giantCap: 0.12, stats: {castMax: 4}}, stub: {passive: 'moth_bright', waitMul: 0.65, stats:
  {lightRadius: 1.5}}, tallow: {passive: 'long_night', evening: {day: 20, dusk: 15}, nightFavour: 0.3, stats: {}}, ashwick:
  {passive: 'burns_back', comeback: {hold: 4, once: true}, stats: {}}}`, plus `wickBiteWeight` beside `loopWickId`.
- §2.1's `computeStats` item (about lines 270–272) and CHOICE 31: the stats are only the two looks; `creelSize = holdSlots` for all.
  Item 8 (about line 318): `catchBuffHold` no longer needs a class for Tallow; Ashwick reads `ctx.comeback`.
- The lanes. **A**: `data.js` (`LOOP.wicks`, `TEXT_LOOP.wicks`, `CATCH_V3.buffs.wicks.ashwick`, `wickBiteWeight`), `progression.js`
  (`measure` → `newSeal`), `progression-loop.js` (the tally's seal pay; `getBitesLeft` and the comeback; `run.comeback` in the save),
  `validate-data` (each knob in its range; each line ≤ 8 words), `clams.mjs` and `catch-v3.mjs` (§3). **B**: `fishing.js` (the species
  roll for the Wick and Taper; the giant share; the bite wait for Stub; the comeback for Ashwick; the night favour term for Tallow),
  `survival.js` (`getPhaseDurations` per Wick), audio (the tally chime). **C**: the card's Keep number (it shows progression's value),
  the tally's double tick, the five lines. **D**: a per-Wick smoke step in the 1a scenario. The flame flourishes (`actors.js`,
  `fishing-fx.js`) are owned by no 1a lane: they are polish for a later job, and 1a's effects show without them.
- Tests: **T53** (`character` is `'ashwick'` only on a comeback bite; null for every other Wick); **T61** (stats are only Taper's
  `castMax` and Stub's `lightRadius`; Tallow's and Ashwick's built Holds are gone); **T72** (the `LOOP.wicks` shape and ranges);
  **T75** rewritten as §3.3, run per Wick. New tests, numbered by the lead (proposed T76–T80): the Wick's seal pay (once per seal,
  only on a sale, larger-of with an order); Taper's pool (share ×1.3, giant ≤ 12%); Stub's wait (×0.65, quiet growth kept);
  Tallow's clock (night at 35 s; the night term only after dark); Ashwick's comeback (same `z`, free bite, once, dropped on sailing,
  saved across Continue, a giant marked only after a second loss).
- §7.1, the user's questions: add "Do the five passives (`WICKS.md`) feel right?".

## 6. The judging

Three proposals (PLAYSTYLES, FANTASY AND LORE, ECONOMY FIRST) offered six mechanics among them. Each was scored 1–5 against the
seven tests: the user's words (powerful, unique), fun and a distinct way to play, fit with the Wick, balance in the sim, no rule
broken, works in 1a, one short line.

| mechanic | offered as | words | fun | fit | sim | rules | 1a | line | total | given to |
|---|---|---|---|---|---|---|---|---|---|---|
| firsts: new kinds bite more, new seals sell higher | the Wick (PLAYSTYLES, FANTASY) | 4 | 4 | 5 | 4 | 5 | 5 | 4 | **31** | **the Wick** |
| the rarity mix (and giants) | Taper (PLAYSTYLES, FANTASY), Stub (ECONOMY) | 5 | 4 | 5 (Taper) | 4 | 4 | 4 | 5 | **31** | **Taper** |
| the bite wait | Stub (PLAYSTYLES, FANTASY), Taper (ECONOMY) | 4 | 4 | 5 (Stub) | 5 | 4 | 5 | 5 | **32** | **Stub** |
| early dark and bigger night fish | Ashwick (PLAYSTYLES, ECONOMY), Tallow (FANTASY) | 5 | 4 | 4 | 5 | 5 | 5 | 5 | **33** | **Tallow** |
| the fish that got away comes back | Tallow (PLAYSTYLES), Ashwick (FANTASY), the Wick (ECONOMY) | 5 | 5 | 5 (Ashwick) | 4 | 4 | 5 | 5 | **33** | **Ashwick** |
| +1 slot and +1 good bite | Tallow (ECONOMY) | 4 | 3 | 4 | 4 | 2 | 5 | 5 | 27 | not used |

### 6.1 Why each went where it went

- **The Wick: firsts.** "Curious" is its built quirk, and LORE makes it "the first to fish the whole road through": the collector
  who opens waters fastest. The comeback (ECONOMY's choice) fits "stubborn" less well than it fits Ashwick's title.
- **Taper: the rarity mix.** Its built line is "finds rare fish" and its title is the Long Reach. ECONOMY gave rarity to Stub (a
  light that draws rare fish), which is a weaker fit, and it moved Taper to the wait.
- **Stub: the wait.** "Tiny, quick and fiercely bright": moths to a flame. All three proposals agree it is the cleanest passive
  to model.
- **Tallow: the night; Ashwick: the comeback.** Two proposals gave the night to Ashwick (it "hunts the dark"). The judge followed
  FANTASY: "Burned Once, Burns Back" and "It went out once. It came back angry" describe the comeback almost word for word.
  Tallow's "Slow to light. Slower to go out" reads as a short day and a long night. Both pairings are good; this one gives each
  Wick the passive its name already says.
- **The hauler, not used.** It is the lead's own example, and ECONOMY's version (+1 slot, +1 good bite) is well measured. But
  it starts Tallow with 4 slots, against the user's "3 slots at the start". Its fallback (the slot comes with the first Hold step)
  is not felt in the first evening. FANTASY's other hauler (two Smalls or Keepers to a slot) gained too little a minute. It stays
  as the alternative if the user wants a carrier.

### 6.2 What was grafted from each

- **PLAYSTYLES:** the Wick's per-seal sale (once per seal per save, lasting all game, built seals) over FANTASY's per-species ×1.5
  first sale, which was front-loaded (+48% on the first trip, a risk to the 10-minute mark); `novel` ×2; the `newSeal` flag in
  `measure()`. Taper's giant share (×1.4 tested, started here at ×1.3) and the giant-hunter playstyle. The comeback's **same size `z`**
  and its +4 Hold through `CATCH_V3.buffs.wicks` (inside the run cap, so the giant hunt keeps its headroom). Stub's bite-wait
  measurements; the line style; the risk lists (giant hunt at 71%, Stub's dark target).
- **FANTASY AND LORE:** the Wick-to-passive mapping for Tallow and Ashwick; the passive names Curious, Long Reach, Moth-Bright,
  Long Night and Burns Back; Stub's ×0.65 with quiet growth multiplied; Tallow's 20/15 clock and +0.3 night; the comeback's free bite
  and its once-only rule; **the larger multiplier applies, never both** for the Wick's sale; dropping Taper's `hookWindow` and
  `rarityBonus` (one passive only); signs only after the reveal.
- **ECONOMY FIRST:** Taper's **normalised share** (`rareShare` 1.3, cap 85%). ECONOMY found that the raw ×1.5/×2 weights broke the
  map ladder (Pyrefall's open water 0.84), so the normalised form is required. The `landP(extraHold)` cache key; the `--wicks` mode
  and its checks (±10% fail and ±5% aim, giants kept ±15% of the mean); the per-Wick `--calibrate` (the highest tier over the five);
  the common price factor (×1.08 tested); choosy play 80–110% per Wick and 85–105% on the mean; and the guard that no forced giant
  bite ever appears from nothing.

### 6.3 Rejected details, and the open risks

- **Rejected.** PLAYSTYLES' passive name "Far Water", which is a parked feature in SPEC §10. ECONOMY's Taper evening ×0.8, which
  touches the clock (Tallow's variable). ECONOMY's re-rolled comeback size, because "the one that got away" should be the same fish.
  ECONOMY's exclusion of giants from the comeback (a lost giant coming back is the passive's best moment; guard 5 keeps giants
  rare). The Wick's flame leaning *before* the reveal (FANTASY), because it would tell you the species is new. A novelty cap of ×3
  with the pull (PLAYSTYLES), which would pull the Wick less than the other Wicks late in a list. First-person lines (ECONOMY).
  Tallow's dusk +0.1 and an extra Lantern term (one term only).
- **Open risks, for the lead.**
  1. Stub misses SPEC §4.9's "≥ 50% of first trips see dark" (about 43%). Either the lead accepts ≥ 40% for Stub, or `waitMul` goes to 0.75 (+9%).
  2. Ashwick's giant hunt was 71% of the natural rule at the 40 h station in a test (limit 75%). The knobs are +4 → +3, or a Keeper-and-bigger floor.
  3. The Wick and Taper both change *which species bite*, by different triggers (the Journal against rarity). Early at a new water
     the missing fish are often the rare ones, so the effects overlap a little. The Wick's sale half carries most of its value.
  4. The Wick's sale is the only passive that touches prices; with the Old Ledger (slice 9) "larger applies" trims it late.
  5. Every number here comes from three scratch copies of `clams.mjs` (in a session scratchpad that may be cleared), at slightly
     different settings. None is committed, and the 1a numbers use the roster species, not the built phase-1 ones. T75 re-measures all of them.
  6. All five beat today's trait-less pacing player by about 10%. The common price factor changes every price in SPEC §4.
  7. Tallow's short day slows the day-only fish on a list, which the pull should cover. Check 7 reports it.
