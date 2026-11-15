# The five Wicks: one powerful passive each

*Gloomwater's loop, `docs/loop/`. The judge's ruling on three proposals (§6), written 15 November 2026; **revision 2** the same
day, after a review of 49 findings (§7). Every number is a **starting number** (a knob with its range), not a result: the sim
run of §3 sets the final values after the three-keys rule (SPEC v8 §5.5, branch `gw-loop-access`) lands and after
`clams.mjs --wicks` is committed. Figures marked *(est.)* are hand estimates or come from uncommitted scratch sims; none may
be quoted as measured. This file amends nothing by itself. §5 lists what changes in SPEC, OPENING and PLAN, for the lead's
docs commit.*

## 1. The user's words

> "You can choose any of the 5 wicks but each one has a powerful unique passive ability to help them catch fish or boost something else"
> (14 November 2026)

**Earlier words that bind this design:** catch big and rare fish; the hold limits you (3 slots at the start); no way to fail;
maps are the only way to discover a place; "every catch should feel like a win"; the UI must not be cluttered ("too much
text on screen"); creature attacks parked (no combat); original work only.

**The lead's reading (binding), in short.** All five Wicks are free from the first New Descent. Each has **one** passive
(no button, always on) that is **powerful** (felt in the first evening, about 20–40% in its own domain or a rule-bending
effect) and **unique** (no two Wicks boost the same thing, as the player feels it). Balanced over the whole game: each Wick
buys everything within about ±10% of the others' time. No passive breaks a rule. One short plain line on screen per Wick.
Each works in slice 1a (the Mossmere alone, 3 slots, Rod/Line/Reel T1–T2, Hold 4–5) and grows later.

**What "passive" replaces.** SPEC §10.1's small traits (Taper's cast and strike window, Stub's and Tallow's raft speed,
Tallow's +2 Hold on Trophies, Ashwick's +3 Hold on the first fish after dark) are retired on a trip. Stub's `lightRadius`
+1.5 stays as a **look** (only survival, water and world draw it). Taper's `castMax` +4 m is **dropped**: it set the cast's
reach, so its depth (`speciesPool` filters by `s.depth`) and the sign range (`castMax + 15`), a second power. Taper's look is
its height.

### 1.1 Who touches what

| Wick | passive | what it owns (no other Wick touches it) | the decision it changes | seen in the first evening *(est.)* |
|---|---|---|---|---|
| The Wick | **Curious** | the sale of a **first**: a new kind, a first Prize, Trophy or Elder, a new personal best | what you keep | about 3 first-sale ticks at the first tally |
| Taper | **Long Reach** | the rarity of **the first bite at each water** each evening; from slice 2, a giant's share of the bites | where you fish: one more water, one more place | 1 uncommon or rare card, every evening |
| Stub | **Moth-Bright** | the wait for a bite, and **quiet water** | how long you stay, and how choosy you are | every bite sooner; quiet water keeps its pace |
| Tallow | **Long Night** | **when night falls**, and favour after dark | when you fish | about 3 of 4–5 bites after dark (about 1 for others) |
| Ashwick | **Burns Back** | **a fish that got away** (not a giant, not a legend) | how hard you push a big tell | about 1 comeback in 3 of 4 first trips on T0, more as you push |

Giants home are Taper's alone among the passives (check 5): Ashwick's comeback skips giants, the Wick's first sale skips
giants, and only Tallow decides when night falls. The passive names are design names and code ids. They are **never
shown**: the New Descent screen shows only the one line.

## 2. The five Wicks

**Every hook in this section runs only under `LOOP()` (fishing) or `loopRun(run)` (survival, progression), reads
`LOOP.wicks[run.character]`, changes no RNG draw count off the loop, and edits no v1 or v3 table or exported `data.js`
function outside the apply block's `if (LOOP_ENABLED)` (PLAN §4.1 rules 1, 2, 6, 7).** T75 and the proposed T76–T80 also run
with the flag off, as regression tests (the v1 golden trace goes through `rollBite` and `rollSpecies`).

### 2.1 The Wick: A Small, Stubborn Flame

- **Passive:** **Curious** (`curious`, the built quirk's name). **On screen:** "Firsts and new bests sell higher." (6 words, 33 characters)
- **Rule.** A **kept** fish that is a **first** in this New Descent sells for more at the tally. A first is any one of:
  a kind not yet caught; that kind's first **Prize, Trophy or Elder** (the built class seals, `sealsFor(sp)`), or its first
  Ancient; or a new **personal best** (longer than any of that kind caught before, the built `pb` record). The bonus is
  `max(round(firstFloor × tier), round((firstMult − 1) × base))`: `firstMult` ×**1.5** (range 1.3–1.6), `firstFloor`
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
- **First evening.** Nearly every fish is a first, so the first tally pays about 3 bonus ticks *(est.)*: on the Mossmere a
  first Small goes from about 2 to 5 clams, a first Keeper from about 8 to 12.
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
- **Code hooks.** `data.js`: `LOOP.wicks.wick = {passive: 'curious', firstMult: 1.5, firstFloor: 0.4, stats: {}}`,
  `TEXT_LOOP.wicks.wick`. `progression.js` `measure()` (A): under `loopRun(r)` and `r.character === 'wick'`, compute
  `fish.first` from `meta.loop.firsts` (`isNew`, a newly stamped `cls` in `sealsFor(sp)` or the ancient seal, or a longer
  best) and update the ledger. `progression-loop.js` (A): `loop.priceOf(fish)` is unchanged (the base, the card's number);
  a new `loop.saleOf(fish) → {base, clams, first}` applies the bonus and the larger-of with an order or the Ledger;
  `endTrip`'s tally rows carry `{base, clams, first: true}`. `ui-loop.js` (C): the double tick from the row (no
  arithmetic) and `sfx('coinBright')`, falling back to `coin`. `audio` (B): `coinBright`.

### 2.2 Taper: The Long Reach

- **Passive:** **Long Reach** (`long_reach`). **On screen:** "First bites are never common fish." (6 words, 34 characters)
- **Rule.**
  - **(a) The first bite.** The first fish to bite at each water each evening (open water and each place: one `waterKey`,
    `loop.favour(key).spent === 0`) is drawn from that pool's **uncommon and rare** fish only (`firstBites` **1**, range
    1–2; or `perWater: false` to apply it once an evening, the downward knob). The hidden-info rule holds: the rule applies
    only where that uncommon-and-rare pool has **at least two kinds and none above 80%** (`AUTOFISH.signRule`); otherwise
    it waits for the next bite at that water where it does. A bait-only fish still needs its bait. Giants keep their own
    share (the giant roll comes first, unchanged); legends are excluded. It still needs its strike and its land roll. A
    spooked or passed first bite spends the rule, like any bite.
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
  about 0.9 non-common bites for other Wicks and about 1.7 for Taper *(est., ×1.9)*. At night the built pool is thinner
  (Weeping Carp, and the Reedjaw Pike on a deep cast: 10–12.5%), and on a shallow night cast the carp alone fails the 80%
  rule, so the rule waits.
- **Slice 1a.** (a) works on the built phase-1 pools. (b) has nothing to act on until slice 2 brings giants (`PARKED.giantSpots`;
  `giantSpots()` returns `[]`): 1a stores `giantShare` and `giantCap` and checks only their ranges (T72).
- **Later.** Each place is its own water, so a lake with four places gives up to five better first bites an evening; giants
  come home more often (target +20–40%, check 5).
- **How it shows.** The first card each evening carries an uncommon or rare frame; later, more gold-edged giant glyphs in
  the hold row. *Polish, after the reveal only:* the tall flame stretches taller for a moment.
- **Code hooks.** `data.js`: `LOOP.wicks.taper = {passive: 'long_reach', firstBites: 1, perWater: true, giantShare: 1.3,
  giantCap: 0.12, stats: {}}`, `TEXT_LOOP.wicks.taper`, and one pure export over the whole pool,
  `wickPoolWeights(wickId, pool, weights, {firstBite, signRule})`, which returns new weights (commons zeroed when the rest
  passes the sign rule; otherwise the weights unchanged). `fishing.js` (B): in `rollSpecies`, under `LOOP()`, after the `w`
  map (and the `famMult` tilt) and before the draw, with `firstBite` from `loop.isFirstBite(key)` (A, a read of `spent`);
  the same function inside `signTiltOk`'s weight sum and on the sign preroll (a pre-rolled common does not take the bait on
  Taper's first bite; the plain draw goes ahead). Zeroed weights keep the one draw, so the RNG count is unchanged.
  `clams.mjs` `poolFor` calls the same function. (b)'s hook goes where SPEC §3.5's giant share lands (slice 2).

### 2.3 Stub: The Bright Little One

- **Passive:** **Moth-Bright** (`moth_bright`). **On screen:** "Quick bites, even on quiet water." (6 words, 33 characters)
- **Rule.**
  - **(a) Quick bites.** The wait for a bite is ×**0.75** for Stub (`waitMul`, range 0.7–0.85). In the game the wait is
    `(waitBase 3 + Exp(5.5)) / mods`, mean about 8.5 s, so Stub's is about 6.4 s *(the sim's base is `AUTOFISH.time.wait`
    7.5 s → 5.6 s)*. Not on a legend cast. The clock is **not** Stub's: `waitMul` is tuned so that Stub's first trips see
    dark as often as anyone's (≥ 50%, check 4).
  - **(b) Quiet water stays lively.** Past a water's good bites, Stub's bites keep the fresh wait (no ×(1 + 0.3·over)
    growth) and lose **0.08** favour a bite instead of 0.15 (`quietStep`, range 0.05–0.1), to the same floor −1.2. Good
    bites, the quiet count and the let-go refund are unchanged.
  - Unchanged: which fish bite, sizes, the strike window, the play, the clock (day 40 s, dusk 20 s), the hold, prices. The
    built raft speed +1, pickup radius, Embers and creel malus are dropped; `lightRadius` +1.5 stays as the look.
- **Playstyle: the stayer.** Where Taper hops from water to water, Stub settles: it lets the small ones go and keeps
  fishing a water past the point where others would sail on or head home. To master it: know when a quiet water's smaller
  fish are still worth the casts, and when to be choosy.
- **First evening.** Bites come quickly after each cast (about 2 s sooner, *est.*). Most first trips have a bite or two past
  the good bites (a lost or let-go fish), and for Stub those come at the fresh pace with the favour notches barely dropping.
- **Slice 1a.** All of it: the bite timer and PLAN's `quietTerms` on the Mossmere's open water.
- **Later.** The same at every water and place; it matters more as holds grow (Hold 6–8) and evenings get longer.
- **How it shows.** The bite tell comes quickly after each cast; on quiet water the float's favour notches step down one at
  a time instead of falling. *Polish:* motes and moths stream into Stub's wide light.
- **Code hooks.** `data.js`: `LOOP.wicks.stub = {passive: 'moth_bright', waitMul: 0.75, quietStep: 0.08, quietWait: false,
  stats: {lightRadius: 1.5}}`, `TEXT_LOOP.wicks.stub`; PLAN's new `quietTerms(over, wickId)` takes the Wick (a new export,
  so the fingerprint does not move). `progression-loop.js` (A): `loop.favour(key)` passes `run.character`. `fishing.js` (B):
  in `rollBite`, under `LOOP()`, `W *= waitMul × quiet.waitMult` **before** the clamp (`waitMin` 2 s kept, which is above
  `lead0 + 0.5`); not when `S.legendCast`. The nibble scheduler is unchanged (it fits its events into the shorter `W`); B's
  test records the spook rate per Wick.

### 2.4 Tallow: The Stout Candle

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

### 2.5 Ashwick: Burned Once, Burns Back

- **Passive:** **Burns Back** (`burns_back`). **On screen:** "A fish that gets away comes back." (7 words, 33 characters)
- **Rule.** When a hooked fish gets away from Ashwick, **the next bite at that same water this evening is that same fish**:
  the same species, the same size `z`. It is **tired**: +**4** Hold (`hold`, range 2–6), through the built per-Wick buff
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
- **First evening.** About one hooked fish in four gets away on T0 *(est.)*, so about 3 first trips in 4 see a comeback;
  the share lost for good falls from about 26% to about 10% *(est.)*.
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

### 3.1 How each passive is modelled

`clams.mjs` gains a `--wicks` mode and `opts.wick` (an id from `LOOP.wicks`) on `trip()`, `run()` and the pacing run. The
"no passive" Wick (`none`) stays as the reference row. All Wicks read the same `data.js` functions the game does
(`wickPoolWeights`, `quietTerms`, `loopEvening`).

| Wick | `clams.mjs` | `catch-v3.mjs` |
|---|---|---|
| The Wick | The **pacing run carries one `firsts` ledger** (seen, Prize/Trophy/Elder/Ancient seals exactly as `measure()` stamps them, best length) across the whole game; `trip()` marks each kept non-giant, non-legend fish that is a first and pays the bonus formula, larger-of with an order. Station rows start from the pacing run's ledger at that station's hour | — |
| Taper | `poolFor(…, wick, firstBite)` through `wickPoolWeights`; `trip()` tracks the first bite per water per evening; (slice 2) the giant's share × `giantShare`, capped at `giantCap` | — |
| Stub | `trip()`: `T.wait × waitMul` (not on legend bites); `quietTerms(over, 'stub')` (no wait growth, −0.08 a bite) | — |
| Tallow | `trip()`: `E = loopEvening(D, 'tallow')`; the phase pool is the union of Tallow's phase and the base phase at the same water time; Night Rise + `nightFavour`; the favour cap + `nightFavour` after dark | a **cap-lift** row: every species and class at the night places and night water, at the arrival kit and the era's end, with Tallow's top favour, stays under its class cap (Elder and Ancient included) |
| Ashwick | `trip()`: on a loss (not a giant, a legend, a cut line or a comeback) store `{sp, z, water}`; **`leave()` is false while a comeback waits** (Ashwick's policy always takes it); the next bite at that water reuses it, spends a good bite (`here++`) and lands with `landP(…, extraHold = hold)`; `landP` takes `extraHold` in its cache key | a **comeback** row: every non-giant species and class at the kit each water opens with and at its era's end, with +`hold`, stays under its class cap. The other Wicks add no term: their `catchChance` equals the no-passive Wick's |

Not modelled, measured elsewhere: the spook rate per Wick (B's fishing test, Stub's shorter `W` fits fewer nibbles), and the
1a targets on the **built** phase-1 pools (a node test against fishing's own `speciesPool`, not the roster): Taper's first
bite share by day and night, the Wick's count of firsts and its clams over the first 10 trips.

### 3.2 Targets

- **Total time.** "Everything bought" per Wick within **±10%** of the five-Wick mean (fail), aim **±5%** (warn). **Tune the
  spread first**, with the per-Wick knobs, then put the mean back near **48 h** (§4.9's 40–60 h band) with one common
  factor, `LOOP.priceFactor`, applied inside `fishClams` / `priceOf` and the shelf. **In 1a the factor is ×1.0**: 1a ships
  the built phase-1 species, not the roster's, and tests T23–T25, T36, the shelf and the `Next: {name} · {price}` line
  assert 1a prices. It is tuned in 1b.
- **Per era.** Each Wick earns **+5–20%** clams a minute over the no-passive Wick in **every** era (fail, not a report).
- **Domain gain and what is seen** (the 1a kit: the Mossmere open water, T1, Hold 4, natural rule, 4,000 trips; then each
  station). The "seen" floor is **at least 1 clearly visible event per first trip on average** for every Wick (check 4); a
  Wick under it fails whatever its clams a minute.

| Wick | its own domain, target | seen per first trip (floor ≥ 1) |
|---|---|---|
| The Wick | clams from firsts: the first 10 trips +20–35%; at each new water's first 5 evenings +15–30% | first-sale ticks at the tally (est. about 3 on trip 1) |
| Taper | non-common share of bites ×1.6–2.0 in the 1a kit (built pools); (slice 2+) giants home per trip +20–40%, giant share ≤ 12% | 1 non-common first card per water (exactly 1 in 1a, when the pool allows) |
| Stub | bites a minute +10–15%; on quiet water, clams a minute past the good bites ×1.3–1.6 | every bite sooner; quiet bites at the fresh pace |
| Tallow | bites after dark per first trip ≥ ×2; Trophy-or-bigger trips ≥ +40%; still +5% or more at the last era (the cap lift) | night by 0:35; about 3 bites after dark |
| Ashwick | fish lost for good −50% or more | comebacks (est. about 1.1 per first trip on T0, in about 3 trips of 4) |

Ashwick and the Wick are the two front-runners: **print their first-25-trip clams side by side**. If Ashwick leads the
five by more than 10% after the per-era tuning, its knob is "the first fish that gets away **each evening** comes back"
(once per evening), then `hold`.

### 3.3 Checks to add (`--wicks`, each printed per Wick and as the five-Wick mean)

1. Pacing (section 5), once per Wick: the end time against §3.2; every §4.9 mark per Wick (10 min 40–90 clams; 1 h 100–240;
   5 h 300–900; trips ≤ 6 min; the longest wait for one purchase ≤ 90 min; the first giant at hour 0.4–3; the map arrival
   bands); **every place map raises clams a minute by ≥ 5% for every Wick**.
2. Domain gains (§3.2) and clams a minute per era per Wick (+5–20%, fail).
3. Anti-grind, per Wick: the giant hunt ≤ 75% of the natural rule; the grind ≤ the natural rule (**binding for Stub**, whose
   quiet water is gentler); wait-for-dark ≤ 100% (fail; Tallow idles only about 21 s for the dark); choosy play 80–110% per
   Wick and 85–105% on the mean (Stub is the one to watch); for Taper, a pure hop policy (one bite per water, then on) ≤ 105%
   of Taper's natural rule.
4. First trip: ≥ 50% get a bite after dark, **for every Wick, Stub included** (the knob is `waitMul` 0.75 → 0.8, never the
   bar); ≥ 90% come home full; the "seen" floor of §3.2.
5. Giants, against the **no-passive** player (not the mean): every Wick ≥ 0.85× giants home per trip and per hour; only Taper
   may exceed 1.15×, up to its +40% ceiling; Stub ≤ 1.15× per hour. Taper's giant share ≤ 12% of bites at every place,
   hour and lure.
6. Legends: land chance and landing times the same for all five (within the run's noise); with Tallow's cap lift, every
   class cap holds and every giant at Prize lands ≤ 50%.
7. The three keys (section 7), per Wick: each list's p50 and p95 in **minutes**; p95 ≤ 60 min and p99 ≤ 75 min (fail);
   Tallow's slowest day-only species reported against the median, failing above 1.5× the other Wicks' p95.
8. The map ladder: `--calibrate` takes, for each water, the highest tier over the five Wicks (a ladder rule must hold for
   every Wick), then the price factor is retuned.
9. The knobs, in order, if a Wick is out of band: the Wick `firstMult` then `firstFloor`; Taper `perWater`, then (slice 2)
   `giantShare`; Stub `waitMul` then `quietStep`; Tallow `nightFavour` then the day length; Ashwick `hold`, then once per
   evening.

The model's limits stay as SPEC §4.9 says (±10%); the look (light radius) is printed "not modelled". **For the access
job:** the pull counts evenings ended at a water, so very short evenings (one cast, then home) raise it cheaply; counting it
in good bites spent at the water would close that.

## 4. Guards: what no passive may ever do

1. **Fight or hurt anything.** No combat term, ever.
2. **Fail you.** No passive can lose clams, a fish in the hold, a map or a save.
3. **Change the hold's size.** Every Wick starts with 3 slots and buys the same ladder. The hold still decides when a trip ends.
4. **Skip a key.** The map, the gear and the list are needed by every Wick. A passive may speed the list (Taper's first bites,
   Stub's pace); it never ticks a fish that was not landed, and never changes the pull's sure evening.
5. **Make a giant certain.** No passive gives a sure giant bite or catch. A giant's share is never above 12% of bites. A giant at
   Prize lands at most 50% of the time. No passive gives a giant a second try beyond the built Marked Fish.
6. **Touch a legend.** Their bites, waits, Fight, wounds and crown price are the same for all five.
7. **Show odds.** No passive adds a number, a percentage or a word on screen. No Wick term appears in `getOdds` or the gear log,
   and no code id (such as `long_night`) reaches the DOM.
8. **Tell before the reveal.** No sign may reveal a fish's species or novelty before the reveal. Taper's rule tells only "not a
   common", and only where the uncommon-and-rare pool keeps ≥ 2 kinds and none above 80%. Ashwick's returning fish was already
   named by the got-away note.
9. **Add good bites.** No passive changes a water's good-bite count, and every bite spends one (Ashwick's comeback included).
10. **Stack sale doubles.** Only the Wick touches the sale; with an order or the Old Ledger, the larger applies. The card shows
    the base price for every Wick.
11. **Share a variable.** Each passive owns what §1.1 lists; no other Wick touches it. Only Tallow moves the clock; only Taper
    raises giants home.
12. **Add words or buttons.** One line per Wick, **≤ 8 words and ≤ 36 characters** (the `validate-data --loop` limits), only
    under the cards on New Descent. No passive has a button, a meter or a toggle.
13. **Depend on save history.** The Wick's ledger is the loop's own; every passive is the same on a fresh save and a migrated one.
14. **Run off the loop.** Every hook is gated, draws no RNG off the loop, and edits no v1 or v3 table or exported function
    outside the apply block (§2's opening rule).
15. **Copy.** Original names and fantasy; no other game's classes. (LORE §10 asks the lead to consider renaming Ashwick before
    ship; this file keeps the canon name.)

## 5. What changes elsewhere (listed, not edited)

**SPEC.md**
- §0: a decisions row for the user's words of 14 November ("a powerful unique passive"), pointing here.
- §10.1: the trait table becomes the five passives (name, line, rule in one line each). "Each a look and one small fishing trait"
  becomes "each a look and one passive (`WICKS.md`)". "No trait touches the hold, the sale or the good bites" is struck and
  replaced by: "No passive changes the hold's size, a water's good bites, a legend or the odds shown; only the Wick's touches the
  sale." The v6 "join over time" alternative stays.
- §8.5 (about line 835): the five trait lines become §2's lines; Tallow's first trip delays the Last Light cue until both
  teaching words have shown.
- §3.2 (Ashwick's comeback beside the let-go and the linger); §3.3 (Stub's wait and gentler quiet water); §3.4 (Tallow's
  evening, day fish on the base clock); §3.5 (Taper's giant share ×1.3 under 12%; a lost giant is the Marked Fish for every
  Wick); §4.1 (the Wick's first bonus, larger-of with orders and the Ledger; `LOOP.priceFactor`); §4.4 the Lantern's text
  "night fish run bigger" becomes "a wider light; a little more after dark", so it does not echo Tallow's line; §4.9 (the
  pacing run per Wick, the price factor ×1.0 in 1a, the dark target unchanged for every Wick); §13 slice 1a (the passives
  ship in 1a); §14 (the risks of §6.3).
- §10's "the five Wicks" row: still "changed", pointing here.

**OPENING.md**
- The lead's default paragraph (line 29): "one small fishing trait" → "one passive".
- §3's table (lines 103–109): the "line" and "trait" columns become §2's lines and passives.
- Line 112, "No trait touches the hold, the sale or the good bites", is struck, as in SPEC.
- §3's phone layout: the trait line is one line at 18 px on 358 px; `validate-data --loop` adds the ≤ 36 character cap beside
  the word cap, and D's phone screenshot of each lit Wick checks that the line is one line high.
- The New Descent words and layout are otherwise unchanged (one line, the lit Wick's).

**LORE.md** (for its owner)
- §5.3 item 2 says the four Wicks "wake one at a time on SPEC §10.1's triggers". Under the lead's default all five are free, so it
  needs the same "(or all at once, the lead's default)" note.

**For the access job** (`gw-loop-access`): count the pull in good bites spent at a water, not in evenings ended (§3.3).

**slice-1a/PLAN.md**
- §2.1 item 15, the `LOOP.wicks` shape:
  `{order: [...], wick: {passive: 'curious', firstMult: 1.5, firstFloor: 0.4, stats: {}}, taper: {passive: 'long_reach',
  firstBites: 1, perWater: true, giantShare: 1.3, giantCap: 0.12, stats: {}}, stub: {passive: 'moth_bright', waitMul: 0.75,
  quietStep: 0.08, quietWait: false, stats: {lightRadius: 1.5}}, tallow: {passive: 'long_night', evening: {calm: 20, dusk: 15},
  nightFavour: 0.3, stats: {}}, ashwick: {passive: 'burns_back', hold: 4, stats: {}}}`; plus `LOOP.priceFactor: 1`, the pure
  exports `wickPoolWeights` and `loopEvening` beside `loopWickId`, and `quietTerms(over, wickId)`.
- §2.1's `computeStats` item (about lines 270–272) and CHOICE 31: the only stat is Stub's `lightRadius` look; `creelSize =
  holdSlots` for all. Item 8 (about line 318): `catchBuffHold` is not edited; under the loop the apply block sets
  `CATCH_V3.buffs.wicks.ashwick = {hold}` and `getCatchBuffs` gates it (strike "Ashwick reads `ctx.comeback`").
- Item 13 (`getPhaseDurations` hard-coded `{calm: 40, dusk: 20}`) and CHOICE 21: read `loopEvening(D, run.character)`.
- `meta.loop` gains `firsts: {seen, seals, best}` (cleared by New Descent, seeded empty by `migrateSave`); `run` gains
  `comeback`; `run.flags` gains `openComeback`.
- §2.5's seam table, new rows: (1) A owns `run.comeback`, `loop.comeback(key)`, `loop.consumeComeback()`,
  `loop.isFirstBite(key)`; B reads them in `rollBite` / `rollSpecies` and emits `fishing:bite {comeback: true}`. (2) B adds a
  `coinBright` sfx; C calls it on tally rows with `first: true`, falling back to `coin`. (3) A's `loop.saleOf(fish)`; C reads
  the tally rows' `{base, clams, first}`.
- The lanes. **A**: `data.js` (`LOOP.wicks`, `TEXT_LOOP.wicks`, the apply-block Ashwick buff, `wickPoolWeights`, `loopEvening`,
  `quietTerms`' Wick), `progression.js` (`measure` → `fish.first` and the ledger), `progression-loop.js` (`saleOf`, the
  comeback, `isFirstBite`, `favour` with the Wick), `progression-af.js` (`onEscaped`'s marking), `validate-data` (each knob in
  its range; each line ≤ 8 words and ≤ 36 characters), `clams.mjs` and `catch-v3.mjs` (§3). **B**: `fishing.js` (Taper's first
  bite in `rollSpecies`, `signTiltOk` and the preroll; Stub's wait; Tallow's Night Rise value, cap and `timeOk`; Ashwick's
  comeback bite, ember pulse and the fallback), `survival.js` (the three phase readers), audio (`coinBright`, the ember hiss).
  **C**: the tally's double tick and seal glyph, the five lines, Tallow's first-trip Last Light delay. **D**: a per-Wick smoke
  step in the 1a scenario (each Wick's "seen" event appears; the comeback and the linger never on the same cast; the trait line
  one line high on a phone). The flame flourishes (`actors.js`, `fishing-fx.js`) are owned by no 1a lane: they are polish.
- Tests: **T53** (`character` is `'ashwick'` only on a comeback bite; null for every other Wick, and in the fallback); **T61**
  (the only stat is Stub's `lightRadius`; Taper's `castMax` and `hookWindow`, Tallow's and Ashwick's built Holds are gone on a
  trip; off the loop `computeStats` and `catchBuffHold` are unchanged); **T72** (the `LOOP.wicks` shape and ranges, Taper's
  `giantShare`/`giantCap` ranges only); **T75** rewritten as §3.3, run per Wick, also flag-off. New tests, numbered by the lead
  (proposed T76–T80):
  - the Wick: a first pays once, only on a sale, larger-of with an order; card value = the tally row's `base`, the row's
    `clams` = the amount paid, including after a reload with the card open; a migrated save's ledger starts empty;
  - Taper: on the built Mossmere pools, day and night, the first bite at a water is never common where the pool allows, and
    the plain pool where it does not; for every Wick, every pool × tilt that passes `signTiltOk` has top share ≤ 0.8 with the
    Wick's weights;
  - Stub: `W` ×0.75 before the clamp, not on a legend cast; quiet water: no wait growth, −0.08 a bite to −1.2;
  - Tallow: night starts at 35 s and `k` stays finite and ≤ 0.85; a day fish still bites at 0:38; the Night Rise term's value
    is 0.55 after dark and 0 before; no "long night" string in the DOM;
  - Ashwick: same `z`; spends a bite; once; a spook spends it; a cast at another water keeps it; `run:end` or a lake change
    drops it; a cut line makes none; no comeback for a giant or legend; quit mid-play and Continue: the next bite is not the
    comeback; an Elder lost once leaves no Marked Fish, lost twice leaves one.
- §7.1, the user's questions: add "Do the five passives (`WICKS.md`) feel right?".

## 6. The judging

Three proposals (PLAYSTYLES, FANTASY AND LORE, ECONOMY FIRST) offered six mechanics among them. Each was scored 1–5 against the
seven tests: the user's words (powerful, unique), fun and a distinct way to play, fit with the Wick, balance in the sim, no rule
broken, works in 1a, one short line. The table is the first ruling's; revision 2's changes follow it.

| mechanic | offered as | words | fun | fit | sim | rules | 1a | line | total | given to |
|---|---|---|---|---|---|---|---|---|---|---|
| firsts: new kinds bite more, new seals sell higher | the Wick (PLAYSTYLES, FANTASY) | 4 | 4 | 5 | 4 | 5 | 5 | 4 | **31** | **the Wick** |
| the rarity mix (and giants) | Taper (PLAYSTYLES, FANTASY), Stub (ECONOMY) | 5 | 4 | 5 (Taper) | 4 | 4 | 4 | 5 | **31** | **Taper** |
| the bite wait | Stub (PLAYSTYLES, FANTASY), Taper (ECONOMY) | 4 | 4 | 5 (Stub) | 5 | 4 | 5 | 5 | **32** | **Stub** |
| early dark and bigger night fish | Ashwick (PLAYSTYLES, ECONOMY), Tallow (FANTASY) | 5 | 4 | 4 | 5 | 5 | 5 | 5 | **33** | **Tallow** |
| the fish that got away comes back | Tallow (PLAYSTYLES), Ashwick (FANTASY), the Wick (ECONOMY) | 5 | 5 | 5 (Ashwick) | 4 | 4 | 5 | 5 | **33** | **Ashwick** |
| +1 slot and +1 good bite | Tallow (ECONOMY) | 4 | 3 | 4 | 4 | 2 | 5 | 5 | 27 | not used |

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

### 6.1 Why each went where it went

- **The Wick: firsts.** "Curious" is its built quirk, and LORE makes it "the first to fish the whole road through": the collector,
  paid for every first. The comeback (ECONOMY's choice) fits "stubborn" less well than it fits Ashwick's title.
- **Taper: rarity.** Its built line is "finds rare fish" and its title is the Long Reach: it reaches the better fish first at every
  water. ECONOMY gave rarity to Stub (a light that draws rare fish), which is a weaker fit.
- **Stub: the wait and quiet water.** "Tiny, quick and fiercely bright": moths keep coming to a flame, even when the water has gone
  quiet. All three proposals agreed the wait is Stub's; revision 2 adds the half that changes a decision.
- **Tallow: the night; Ashwick: the comeback.** Two proposals gave the night to Ashwick (it "hunts the dark"). The judge followed
  FANTASY: "Burned Once, Burns Back" and "It went out once. It came back angry" describe the comeback almost word for word.
  Tallow's "Slow to light. Slower to go out" reads as a short day and a long night.
- **The hauler, not used.** It is the lead's own example, and ECONOMY's version (+1 slot, +1 good bite) is well measured. But
  it starts Tallow with 4 slots, against the user's "3 slots at the start". Its fallback (the slot comes with the first Hold step)
  is not felt in the first evening. FANTASY's other hauler (two Smalls or Keepers to a slot) gained too little a minute. It stays
  as the alternative if the user wants a carrier.

### 6.2 What was grafted from each

- **PLAYSTYLES:** the Wick's per-seal sale, lasting all game on built seals (now with bests, a floor and a loop ledger); the
  `measure()` flag; Taper's giant share (×1.4 tested, started at ×1.3) and the giant-hunter playstyle; the comeback's **same size
  `z`** and its Hold through `CATCH_V3.buffs.wicks` (inside the run cap); Stub's bite-wait measurements; the line style; the risk
  lists.
- **FANTASY AND LORE:** the Wick-to-passive mapping for Tallow and Ashwick; the passive names Curious, Long Reach, Moth-Bright,
  Long Night and Burns Back; Tallow's 20/15 clock and +0.3 night; the comeback's once-only rule; **the larger multiplier applies,
  never both**; dropping Taper's `hookWindow` and `rarityBonus` (one passive only); signs only after the reveal.
- **ECONOMY FIRST:** the `landP(extraHold)` cache key; the `--wicks` mode and its checks (±10% fail and ±5% aim); the per-Wick
  `--calibrate` (the highest tier over the five); the common price factor (now `LOOP.priceFactor`, ×1.0 in 1a); choosy play
  80–110% per Wick and 85–105% on the mean; the guard that no forced giant bite appears from nothing; and, in revision 2,
  **giants excluded from the comeback**, which the first ruling had rejected. Taper's normalised share (`rareShare`) is kept
  only as the fallback if the lead prefers a statistical Taper; if restored, it must be `q' = max(q, min(rareCap, rareShare ×
  q))` so it never lowers a pool's rare share.

### 6.3 Rejected details, and the open risks

- **Rejected.** PLAYSTYLES' passive name "Far Water", a parked feature in SPEC §10. ECONOMY's Taper evening ×0.8, which touches
  the clock (Tallow's). ECONOMY's re-rolled comeback size. The Wick's flame leaning *before* the reveal (FANTASY). First-person
  lines (ECONOMY). Tallow's dusk +0.1 and an extra Lantern term. In revision 2: the Wick's "new kinds bite more" (a copy of the
  pull); Taper's ×1.3 rescale as the main rule (not felt); Stub's clock in step with its wait (it would touch Tallow's clock);
  Ashwick "once per evening" as the start (it would fail the "seen" floor; kept as the knob); a Small or Keeper seal (not built).
- **Open risks, for the lead.**
  1. Every number is an estimate until `clams.mjs --wicks` is committed; the first ruling's scratch numbers are void.
  2. Taper's first bite may be too strong in 1a (one water, about ×1.9 non-common bites). The knob is `perWater: false` later;
     in 1a there is only one water, so the per-era band decides.
  3. Stub's gentler quiet water reopens a little of the "let everything go" strategy that quiet water closed. Check 3's grind
     and choosy limits are binding for Stub.
  4. The Wick fades in 1a after the first hour (6 kinds only) and is strongest on each new water later.
  5. Ashwick's comeback appears in about 3 first trips in 4 on T0 (est.), near the "seen" floor; fewer as tackle improves.
  6. Tallow's cap lift is the only passive that raises a ceiling; check 6 must pass at every night place.
  7. Retiring the built `castMax` +4 m changes Taper's v3-era feel on a trip only; v3 keeps it.

## 7. Review log (revision 2)

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
