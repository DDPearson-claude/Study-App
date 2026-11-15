# Slice 1a build plan: Three slots on the built fish

The build plan for SPEC v6 §13 slice 1a (`docs/loop/SPEC.md`). The spec is binding; this file says who builds what, against
which seam, and how it is proven. Where the spec is silent the plan takes the smallest reading and marks it **PLAN CHOICE**
(the list is in §7). On-screen words are the spec's (§8). Revision 3's opening adds a few; each is listed in SPEC §8.5's
opening table and, where this plan composed it, put to the lead in §7.1 (rev. 4). The opening's own words (**Begin**, the film's
lines, Skip) are `gw-intro`'s, which SPEC §10 keeps "unchanged"; they are listed for the lead in §7 (PLAN CHOICE 12).
Revision 2 applies the two critics' review; the **Review log** at the end lists every finding and what was done with it.
**Revision 3 (14 November 2026) applies the user's ruling on the opening** (§7.3; the design is `docs/loop/OPENING.md`): one
game mode, so New Descent is the choice of Wick and **Start** only; Start plays the cut scene; the film hands to the Jetty, where
a very short tutorial ends with **Sail** and a glide out to the Mossmere. Its new words (the five Wicks' names and trait lines,
**Start**, **New Descent**, Murk's wake line from SPEC §11, the two first-trip tips) are listed in §7.3; those this plan
composed (the five trait lines, **Back**, the Forget-everything lines, the Settings words of CHOICE 43) are proposals for the
lead's sign-off (§7.1). It adds P12–P17, T59–T72, PLAN CHOICEs 29–41 and §5.5, and amends §1.2 T36/T43/T44/T53, §2.1–§2.5,
§3.3–§3.6, §5.1, §6 and PLAN CHOICEs 2, 8 and 12 in place (each amended passage says "(rev. 3)").
**Revision 4 (14 November 2026) applies the critics' review of revision 3** (the **Review log (revision 4)** at the end): the
Jetty's lore gap stated, Escape at home given a lane and a touch path, home fixed at `docks[0]`, the departure line owned by
the tutorial, `loopWickId` and `sailPlan` moved into `data.js`, the first film abandoned to the title, Settings under the
loop, and T73–T75 and PLAN CHOICEs 42–46 added (each amended passage says "(rev. 4)").
**The pounds amendment (15 November 2026) applies the user's ruling on the unit** ("we always use pounds as a gauge of fish
size"; SPEC §8.2's first paragraph, `docs/v3/pounds/SPEC.md` §5; built on `gw-pounds`, which the merged base must carry before
lane A's seam commit). Every size the loop shows is a weight from `data.fmtWeight(data.fishWeight(species, fish))`: the card's
hero is the **weight** (its count, its sizer and its unit letters are `gw-pounds`' and stay untouched), the length is the card's
one small `length` line in cm, and the tally shows each fish's weight and runs **lightest first, heaviest last**. Lengths stay
the stored truth (`lastTrip.lines[].length`); no weight is ever saved. It amends §1.2 T43, §2.3 (the tally, the card), §3.3
(`tallyLines`), §3.4 and §5.2 in place (each amended passage says "(pounds)").

**Revision 6 (15 November 2026) applies the M1 plan** (`docs/loop/M1.md`, QUEUE job 5; SPEC v7.2): slice 1a is **M1 step 1**
(QUEUE job 9), and it now carries `WICKS.md` revision 3 (the five passives, Tallow the carrier), the film's new line 3, the
catch show's four leftovers from QUEUE's backlog, pounds on the tally, the Chart's 1a part and the M1 sim gate. The list is
§0 below; each amended passage elsewhere says "(rev. 6)". It runs after pounds (`gw-pounds`) has merged and after the three
keys (QUEUE job 6) and the Wicks' balancing (QUEUE job 8, `clams.mjs --wicks`) are committed, so S2's data has its numbers.

**Revision 7 (15 November 2026) follows M1's revision 2** (`M1.md` §10): slice 1a is sized L (four lanes in parallel, about
two weeks); item 25's four show fixes are v3 fixes too and the one sanctioned flag-off change, with a committed `show-seq`
sound fixture for the offline render (§2.2 item 25, "(rev. 7)"); the M1 sim gate is `--step=1` (M1's step numbers).

**The merged base (M) and the seam (S).** (rev. 4) M = `ccr-87831d14-8jseye` + `gw-show`, merged by the stager first. The
base is now 3292886, which already carries `gw-intro` (3b2009d) and `gw-loop-waters` (SPEC v7.1); §6.3 step 0 lists the
three conflicts with `gw-show`. Lane A then writes the **seam commit S** on M (§2.0: the data tables, the switch,
`fmtClams`, the pure module and a shared test fixture); the stager merges it, and **B, C and D branch from M+S**, so every
static import and every test fixture they need exists from their first commit. A keeps building on its own branch from S.
Line numbers below marked plainly are **base** line numbers at 85f78ae (the base before `gw-intro` merged), checked for
revisions 1–2; `gw-show:N` and `M:N` mark line numbers in those trees, and revision 4's new citations say `base:N` (3292886)
or `M:N` (a trial merge of 3292886 and `gw-show`). In M, find code by its function name, never by the number.

**Facts this plan rests on (checked).**

- `world.js:31 SUPPORTS_COVE = false` on the base and on both branches, so `FE_ON` is false. `first-evening.js`, `enterHub`,
  `departFromLanding` and the cove raft mode are dormant in 1a, and the loop never routes through them.
- `gw-show` starts the show at the reveal: `startRevealAF` → `beginShow` sets `S.show` (gw-show:1641, 2143). So
  `fishing.inShow` (gw-show:3449) is true from T0, the reveal included. `ctx.cinematic` is set only from the lift (`startShow`,
  gw-show:2265) to the card (`finishShow`, gw-show:2370). `measure()` runs once, at the present (`presentShow`, gw-show:2329),
  and on `abortShow` while the run lives (gw-show:2381).
- The catch card is a blocking modal (`ui.js` `openModal` default `blocking: true`), so main already gives `gameDt` 0 while it
  is open.
- The lingering big bite (F16) is **not built**: `fishLinger: () => null` (base 3443, gw-show:3570). SPEC §3.2 calls it built.
- `progression.measure` (base 871–1034) puts the fish in the creel at the measure (`addToCreel` at 973) and pays first-catch
  Shells (966–969). Neither in-flight branch touches `progression*.js`.
- The phase-1 Mossmere (`?v3` phase 1) has 3 `giantSpots`, 2 `watchLamps` and 0 places. Its species are `dusk_minnow`,
  `mossback_perch`, `gutter_crayfish` (common, any), `weeping_carp` (uncommon, any), `candlefin_koi` (uncommon, calm),
  `reedjaw_pike` (rare, any), `gloam_eel` (rare, gloom) and `belled_matriarch` (legendary, calm). No species uses `dusk`.
- On the built L50, `round(7 × 1 × clamp(√(22/45)) × e^(0.9·0.4)) = 7` for a Keeper Dusk Minnow at z 0.4 (§4.1's worked
  value holds). The other worked values in §4.1 use the roster's L50 and belong to 1b.
- `gw-show` rewrites `AUTOFISH.time.ceremony` as "the reveal + the show" (gw-show data.js:3968–3971). `tools/sim/clams.mjs`
  `trip()` charges `T.ceremony[cls] + L.time.show + T.card`, so after the merge `LOOP.time.show` (1.5 s) counts the show twice.
- The `gw-intro` hand-off (`onIntroDone`, gw-intro main.js:396–421) calls `markIntroSeen(meta)` and then
  `game.startNewRun({character: 'wick', nightMode: 'still', __intro: true})`. `introPending` is
  `meta.runs === 0 && !meta.intro.seen` (gw-intro intro.js:99–103).
- The title tagline is `TEXT.tagline` (data.js:1462): "Sail the drowned dark. Fish to keep your light. Burn back the swarm."
- `tools/sim/clams.mjs --quick` passes all 89 checks on the base. **On M it fails one** ("1 h: 241 clams per trip (target
  100–240)", checked on a trial merge), because the show is counted twice; lane A's `LOOP.time.show = 0` (PLAN CHOICE 15)
  clears it. The gate is therefore red on M before any lane, as expected.
- (rev. 4) The trial merge of M (3292886 + `gw-show`) conflicts in `DESIGN.md`, `index.html` (both branches rebuilt it)
  and twice in `render.js` (the FOV line and the API list; §6.3 step 0 gives the resolutions). Every other file merges
  cleanly. On it `clams.mjs --quick` still fails exactly the one "1 h: 241" check.
- (rev. 4) Three built facts the opening relies on: `player.glide(path, {duration, onLine, skippable, v0})` always starts
  its glide with `kind: 'glide'` (base:648–654) and snaps the raft to the path's first point; `gameAcceptsInput()`
  (base:691) is true only in flow `playing` (or the FE hub), so `pressAction` returns at once in flow `home`;
  `progression-af.getCatchBuffs()` (base:163) takes no argument (CONTRACT §13.7 names it `getCatchBuffs(sizeClass?)`, and
  `fishing.js` already calls it with the class, base:1163), and `getCatchMods` calls it with none.
- `render.pickMode` (M) returns `'title'` whenever `ctx.state.run` is null, and `world.moodTargets` and `isTitle` treat
  `!run` as the title; `water.js` runs the lake's ambience only in `playing | title | intro`; `audio.js` picks the `title`
  mood whenever flow is not `playing`. A flow `home` with no run would therefore show the orbiting title camera, the title's
  mood and silence unless lane B adds a `home` branch to each (§2.2 items 16, 18).
- The built counters read `meta.runs`: the hurry (`fishing.hurryAllowed`, `fromRun: 2`), the strike ring
  (`fishing.strikeRingOn`, `runs ≤ 1`), `progression-af.getFishingCounters` and ui's `gw-hints` (`runs ≤ 1`). The loop never
  writes `meta.runs`, so each needs a trip branch that reads the evening instead (§2.1 item 8, §2.2 item 12, §2.3 item 1).
- The Descent Gate stays reachable on a trip: `player.js` offers `{id: 'gate', label: 'Descend'}` near it, E or the pill
  opens `openDescend` (Shells, Boons, Heat), and `progression.update` runs `evaluateGate` every 0.5 s (a legend landed on
  the run opens it with a toast naming Shells; `requirementDone('legendary')` reads the run's own `r.legendaries`, so an old
  save's legend does not). Lanes A, B and C make it scenery (§2.1 item 14, §2.2 item 19, §2.3 item 3).
- A forced z (`debug.forceBite({z})`) skips the water's cap (`capZ`) entirely, so T30 tests the cap path, not a forced z.
- The built hour rule `timeOk`: `'calm'` bites in every phase but `gloomtide` (so already at dusk), `'gloom'` only in
  `gloomtide`, anything else always. Only the roster's strings need the loop's window table.

## 0. Revision 6: what M1 step 1 adds (15 November 2026)

| what | lane | the work | proved by |
|---|---|---|---|
| **the five passives** (`WICKS.md` §2, §5) | A | `data.js` (S2): `LOOP.wicks` in WICKS §5's shape (§2.1 item 15, rev. 6), `LOOP.priceFactor: 1`, the pure exports `wickPoolWeights`, `wickSlots(holdSlots, wickId)`, `loopSlots(metaLoop, wickId)`, `quietTerms(over, wickId)` and `goodBitesFor({kind, holdSlots, wickId})` (open water `wickSlots(holdSlots, wickId) × openPerSlot + openExtra + good`), `TEXT_LOOP.wicks` (the five lines), `TEXT_LOOP.murk.firstChartBy = {tallow: 'Four slots in that hold. Fill them and come home.'}`, the apply block's `CATCH_V3.buffs.wicks.ashwick = {hold: LOOP.wicks.ashwick.hold}` under `if (LOOP_ENABLED)` only (no Tallow buff); `progression.js` (`measure` → `fish.first` and the `firsts` ledger; `computeStats`' `creelSize = loopSlots(meta.loop, r.character)`; the only stat is Stub's `lightRadius` look); `progression-loop.js` (`saleOf`, the comeback, `isFirstBite`, `favour` with the Wick, `hold().slots` / `holdFull` / `bitesLeft` through `loopSlots`; `meta.loop.firsts`, `run.comeback`, `run.flags.openComeback`); `progression-af.js` (`onEscaped`'s marking); `validate-data` (each knob in its range; each line ≤ 8 words and ≤ 36 characters; `firstChartBy` keys are Wick ids); `clams.mjs` and `catch-v3.mjs` are the balancing job's | T1, T10, T23/T24, T53, T61, T72, T75 as `WICKS.md` §5 rewrites them; T76–T80 (WICKS's proposed tests: the Wick, Taper, Stub, Tallow, Ashwick) |
| | B | `fishing.js`: Taper's first bite in `rollSpecies`, `signTiltOk` and the preroll; Stub's wait (`W *= waitMul × quiet.waitMult` before the clamp; not on a legend cast); Ashwick's comeback bite (`rollBite` reuses `z` through `S.prerollSp/S.prerollZ`; `fishing:bite {comeback: true}`; `loop.consumeComeback()`; the ember `fx.pulse` when the float settles); **nothing for Tallow**. Audio: `coinBright`, the ember hiss. `survival.js` is not touched (Long Night is withdrawn) | B's fishing tests per Wick (the spook rate recorded) |
| | C | the tally's double tick and seal glyph for a first (`sfx('coinBright')`, falling back to `coin`); the five lines under New Descent; the hold row and the Chart's cells from `loop.hold().slots` (never a Wick test in the view); `murkLineFor('firstChart', wick)`; the goal line's "Hold N" from `wickSlots` of the next step (Tallow at the start: "Next: Hold 5 · 30") | T23/T24, T59, T65/T67 with Tallow (four cells, its line, the same on a reload) |
| | D | a per-Wick smoke step (each Wick's "seen" event: the Wick's first-sale ticks; Taper's non-common first card; Stub's quick bite; for Tallow, four cells on the Chart, Murk's "Four slots" line and four fish home before "Hold's full."; Ashwick's ember-glow comeback; the comeback and the linger never on one cast); the line one line high on a phone; Tallow's 6 cells at Hold 5 on a phone. The main pass reads its counts from `loop.hold().slots` and its goal line from `goalLine` (Tallow: keep 4, the 5th refused, `Next: Hold 5 · 30`, then `holdSlots === 4` and 5 empty cells, T50 at 1 of 4) | T36 (the default Wick's "three fish" becomes "a full hold"), the `--wick=<id>` passes |
| **the film's line 3** (SPEC §0 row 16, `LORE.md` §12) | B (with A's apply-block line, §2.5) | §2.2 item 26 | `intro-length`, the A5 words test, the v3 fingerprint unchanged |
| **the catch show's leftovers** (QUEUE's backlog for job 9) | B | §2.2 item 25 | the offline show render's gates (on the committed `show-seq` sound fixture); `intro-show-seam` and `show-seq` re-baselined for these fixes alone (`M1.md` §2.15) |
| **pounds** (`gw-pounds`, merged first) | A, C | A: `endTrip` stores each fish's weight with the result (`data.fishWeight`); C: the tally's rows lightest first, heaviest last, each with its weight small (`fmtWeight`); the card is `gw-pounds`' as merged | T21, T22 with weights; T43's allow-list takes a weight |
| **the Chart's 1a part** (SPEC §5.4, `M1.md` §3.6) | C | the Chart is a list drawn from a new pure `chartModel(meta, D)` (§2.3 item 2, rev. 6), which M1 step 3's drawn Chart draws instead; no Sporewood row; the row `[data-water=mossmere]`, its cells `.gw-slot`, Sail `[data-action=sail]` | `ui-loop.test` (`chartModel` on a fresh save: one sheet, no places, no next); T65 unchanged |
| **the M1 sim gate** | A | `clams.mjs --shipped=mossmere --step=1` once the balancing jobs commit it (`M1.md` §6.4); until then `--quick` | §6.2 |
| **§7.1** | — | the Jetty question is answered by M1 (the Landing is built in step 5); "Do the five passives feel right?" is added | — |

The R11 phone check grows with Tallow: 6 cells at 1a's Hold 5 must fit the top-left row beside the right cluster; if they do
not, slice 2's two-row wrap comes into 1a. The good-bite dots stay `min(9, bitesLeft)` in 1a (Tallow's open water has at most
8 at Hold 5).

---

## 1. Scope

### 1.1 The player can (SPEC §13 slice 1a)

| id | the player can | lane | proved by |
|---|---|---|---|
| P1 | Start at the Jetty | B (the `home` flow, its camera, mood and sound), C (the Jetty screen) | T36 (scenario), T44, T56, T57, T73 |
| P2 | Sail to the Mossmere's open water for an evening | A (`createTrip`), B (`game.sail` → `startTrip`), C (the Chart) | T36, T45 |
| P3 | Catch fish automatically (as built) | B (fishing, unchanged except the guards) | T36, T52, T55; v3 fishing tests unchanged |
| P4 | Keep or let go at the card, seeing the clams | A (`fishAction`, `priceOf`), C (the card's buttons) | T4–T6, T36, T54 |
| P5 | Fill the hold (three slots; four for Tallow, rev. 6); be refused a cast when full | A (`holdFull`), B (the cast refusal), C (the slots, the line, the pulse) | T1–T3, T36 |
| P6 | Go home (press and hold) | B (`goHome`, `endRun('home')`), C (the Home pill) | T21, T31, T36, T49, T50 |
| P7 | Watch Murk's tally | A (`endTrip`), C (the tally screen) | T21, T22, T36 |
| P8 | Buy Hold 4, Hold 5, Rod, Line and Reel T1 and T2 | A (`loop.buy`, `loop.shelf`), C (the shelf) | T23–T25, T36, T53 |
| P9 | Sail again | B, C | T36 |
| P10 | Close the game mid-trip and continue | A (`restorePending`, the open bite, saves), B (`continueRun`, raft place) | T7, T32, T36, T48 |
| P11 | Never fail | B (survival, combat parked), A (parked rewards), A+B+C (the gate is scenery) | T26–T29, T46, T58 |
| P12 | (rev. 3) Press **New Descent** on a fresh save and choose only a Wick: five Wicks, all free, each a look, a name and one fishing trait line; then **Start** | C (the title, the panel), A (`LOOP.wicks`, `TEXT_LOOP.wicks`, `meta.loop.wick`, the traits) | T59, T61, T62, T71 |
| P13 | (rev. 3) Press Start and go straight into the cut scene (Skip works), the chosen Wick in it, then glide to the Jetty | B (`beginIntro` under the loop, `enterHome('intro')`), C (the panel held under the ink) | T60, T63, T64, T71 |
| P14 | (rev. 3) Be shown home in a very short tutorial at the Jetty: Murk's wake line, the Chart, the hold's empty slots (three; four for Tallow, rev. 6), Murk's departure line (Tallow's names four), Sail; never trapped | C (`loop-tutorial.js`, the Jetty and Chart cues), A (`meta.loop.tutorial`), B (the glides) | T65, T67, T73 |
| P15 | (rev. 3) Sail and watch the raft glide out to the Mossmere's open water; on the first trip, the built light hints and two short tips teach the cast and the strike | B (the glide out), C (the two tips), A (`LOOP.tutorial`) | T66, T68, T72 |
| P16 | (rev. 3) Come back later and never see the tutorial again; close the game mid-tutorial and resume it at home | A, B, C | T62, T67 |
| P17 | (rev. 3) Reach Settings from every title and start over only through Settings' **Forget everything** (in-page confirms); (rev. 4) reach Settings at home too (Escape or the quiet pause glyph), with no parked rows under the loop | C | T62, T69, T73, T74 |

### 1.2 Tests (SPEC §13 slice 1a, and the rule tests of §3.2, §3.4 and §9)

Files: `tools/tests/loop.test.mjs` (A: data, switch, saves, value, shelf), `tools/tests/loop-trip.test.mjs` (A: the node trip
harness of §13), `tools/tests/loop-evening.test.mjs` (B: survival, fishing, combat under the loop),
`tools/tests/ui-loop.test.mjs` (C: pure UI helpers), `tools/tests/loop-1a.scenario.mjs` (D: the browser scenario),
`tools/validate-data.mjs --loop` (A).

| id | test | lane · file |
|---|---|---|
| T1 | the hold: 3 slots on a fresh `meta.loop`; `computeStats().creelSize === meta.loop.holdSlots` (a Wick, a Mended Creel or an upgrade does not change it) | A · loop-trip |
| T2 | the 4th keep is refused: `fishAction(f4, 'keep')` → `{ok: false, full: true}`, the hold stays 3, `loop:holdFull {via: 'keep'}` | A · loop-trip |
| T3 | the cast is refused when full: with `holdFull() === true`, a press from `idle` and from `lost` never enters `charging`; `loop:holdFull {via: 'cast'}` fires once | B · loop-evening (fishing-env) |
| T4 | keep and let go both write the record (journal count, PB, seal, `lastLengths`; `entry.firstEvening`) | A · loop-trip |
| T5 | `measure` leaves the hold unchanged; it pays nothing (`run.shells`, `meta.memories` unchanged; `combat.addXp` not called) | A · loop-trip |
| T6 | let go refunds its bite (`run.bites[key]` − 1, floor 0) and adds +0.2 favour there, to +0.4 (`run.mercy[key]`); another water's mercy stays 0 | A · loop-trip |
| T7 | Continue with the card open reopens it: the saved `flags.pendingCatch` fish re-enters `pending`, `fish:landed {restored: true}` fires after `run:start`, `measure` is not called again, the hold is unchanged | A · loop-trip |
| T8 | struck, passed, landed, lost and spooked bites each spend one (`fishing:bite {waterKey}` ×4 kinds + `fishing:miss {reason: 'spooked', waterKey}`) | A · loop-trip (counting); B · loop-evening (fishing emits each once, with the key) |
| T9 | a lingering re-cast spends from where the fish first bit. **Needs the lead's ruling before the lanes branch (PLAN CHOICE 1, §6.3 step −1).** Ruling "build": B builds F16 (§2.2 item 12) and T9 asserts the re-cast's `fishing:bite` carries the first bite's `waterKey` and spends there. Ruling "drop" (the default if no ruling comes): T9 asserts `fishLinger()` is null and a re-cast after a pass is a new bite at its own cast's `waterKey`, and the lead strikes "(built)" and this test from SPEC §3.2 and §13 | B · loop-evening |
| T10 | quiet after 4 at hold 3 (`goodBites('open:mossmere') === 4`; 5 at hold 4) | A · loop-trip |
| T11 | −0.15 each to −1.2; wait ×(1 + 0.3·over) to ×2.2 (`quietTerms`); the field names of `loop.favour(key)` are exactly §3.3's (`favour`, `waitMult`, `over`, `good`, `spent`, `mercy`, `quiet`) | A · loop.test (pure, the object), B · loop-evening (fishing-env with the same object literal: the `quiet` term's value equals `favour`, `waitDur` at fixed seeds) |
| T12 | no reset at dusk or night (phase changes leave `run.bites`); reset at home (the next trip starts at `{}`) | A · loop-trip |
| T13 | the evening: day 40 s, dusk 20 s, night holds (no `phase:change` past `gloomtide`, no `day:start`) | B · loop-evening (real survival) |
| T14 | frozen in the ceremony: `run.phaseTime` does not move while `fishing.inShow` (from T0) nor while `ctx.cinematic`; across a whole show + card it moves < 0.1 s | B · loop-evening |
| T15 | a "dusk" fish bites at night, not by day (a synthetic species `time: 'dusk'` in a cloned SPECIES); the built `candlefin_koi` (`'calm'`) still bites at dusk and not at night (the built rule, unchanged) | B · loop-evening |
| T16 | no hush: `getPhaseInfo().hush === 0` on a trip's first calm, and no `hush` term in `baseTerms` on the first cast | B · loop-evening |
| T17 | no NaN in `getPhaseInfo()` after 10 min of night (`setPhase('gloomtide')`, tick 600 s) | B · loop-evening |
| T18 | value: a Keeper Dusk Minnow (z 0.4) is 7 on the built L50 (`fishClams`) | A · loop.test |
| T19 | clams persist (a kept fish's `clams` survives a JSON round-trip; `meta.loop.clams` survives normalizeSave) | A · loop-trip |
| T20 | "12.4k" from 10,000, "1.2m" from 1,000,000; `9,999` below (`core.fmtClams`) | A · loop.test |
| T21 | the tally: `endTrip` pays once; a second `endTrip` on the same run returns `{already: true}` and pays nothing | A · loop-trip |
| T22 | a reload during the tally pays exactly once (the save `endTrip` writes has `run: null` and the paid clams; a boot from it pays nothing more; the replayed tally reads `lastTrip`) | A · loop-trip |
| T23 | the shelf: prices (Hold 4 30, Hold 5 120; T1 50, T2 300 per slot) | A · loop.test |
| T24 | the order of hold steps (Hold 5 refused before Hold 4; a tier refused before the one below it) | A · loop.test |
| T25 | a tier raises `catchChance` (rod T1 over T0 for the same fish and class, through `getLoadout` with `perRun: false`); at home (`ctx.state.run = null`) after `loop.buy('rod:1')`, `getLoadout().rod === 1` and the gear log shows the T1 hold | A · loop-trip |
| T26 | parked: a night with no enemy (`combat.update` spawns nothing for 120 s of night on a trip) | B · loop-evening |
| T27 | no change in oil, satiety or health, no death (`setOil`/`hurt`/`snuff` debug hooks are no-ops on a trip) | B · loop-evening |
| T28 | no Memories (`meta.memories`, `memoriesEarnedTotal` unchanged through measure, keep, let go, endTrip) | A · loop-trip |
| T29 | no Murk on the water (`market.update` over 300 s of calm on a trip: no `merchant:arrive`) | A · loop-trip |
| T30 | no giant spot in the Mossmere's open water: `ZONES[0].arena.giantSpots` and `watchLamps` empty on loop data (A); B, through the cap path, never a forced z (a forced z skips `capZ` by design): at each old `RAFT_FALLBACK_V3.mossmere.giants` centre and at 20 seeded open-water points, `fishing.waterAt(p).giant === false` and `capZ({species, place: null, giantWater: false, size})` ≤ `classMaxZ.trophy` (2.64) for every Mossmere species; and 2,000 seeded `fishing.rollSize(sp, 1.8, {giant: waterAt(p).giant})` (the most favour) give no `elder`. `forceBite`'s z is untouched | A · validate-data --loop; B · loop-evening |
| T31 | no path from the pause menu or the title empties a hold without selling it: `endRun(cause)` for every cause but `'home'` is refused under the loop (`tripEndAllowed`); `startTrip` is refused while a trip is saved (`tripStartAllowed`); the DOM has no Abandon / New Descent | B · loop-evening (main's pure guards, see §3.5); D · scenario (DOM) |
| T32 | continue mid-trip: hold, `run.bites`, `run.mercy`, `run.phase`/`phaseTime` and `run.pos` survive a reload | A · loop-trip (state); D · scenario (raft place) |
| T33 | an old save gains `meta.loop` and loses nothing (every other meta key byte-identical after `migrateSave`) | A · loop.test |
| T34 | an old save with start-kit challenges starts a trip with no free bait (`run.bait` `{}`, no `startBoon`, `shells` 0) | A · loop-trip |
| T35 | a trip saved with the flag on and opened with it off is sold and dropped (`sellStrandedTrip` on a v1 and a v3 envelope), with the tally's own bookkeeping (`tallyBook`: a kept Matriarch gives `legends.belled_matriarch === 1`); a v3 descent saved, then a loop Sail (parked), then a flag-off boot: the same descent is back in `save.run` and `meta.loop.parkedRun` is gone | A · loop.test |
| T36 | the scenario (rev. 3: it starts from a fresh save): the title (**New Descent** · **Settings**) → New Descent → a Wick → **Start** → the film (skipped) → the Jetty tutorial → Sail → the glide out → three fish → Home → +clams → Hold 4 (its card reads **Yours.** until the shelf closes) → a second trip; after every Sail `debug.ui().stack` is empty (desktop 960×540 and phone 390×844) | D · loop-1a.scenario |
| T37 | measure the visit home and write it into `LOOP.time`; re-run the sim | D (measures), stager (writes, re-runs) |
| T38 | a kept Belled Matriarch is sold at the tally for 500 (constructed with `makeFish`; a second one in the same trip 200) | A · loop-trip |
| T39 | flag-off parity: every loop API is null or inert on v1 data and on v3-without-loop data; `sellStrandedTrip` is a no-op on a non-trip envelope | A · loop.test, loop-trip; B, C in their files |
| T40 | the switch: `resolveLoopFlags` precedence; `applyLoopFlags` on a fake page writes `GW_LOOP`, `GW_V3`, `GW_V3_PHASE = 1`; in node it writes nothing | A · loop.test |
| T41 | `validate-data --loop` (§3.1 rules) and the v3-without-loop fingerprint | A · validate-data |
| T42 | the sim reads `data.LOOP` and fails if a moved key is still drafted | A · clams.mjs |
| T43 | no `/shells?/i`, no "Memories", no "Descent" in the DOM on a loop trip, at the gate, at the Jetty, on the shelf, on the tally, in the pause menu and on the Journal's species page; and an **allow-list**: on the water's HUD, the card, the tally, the Jetty, the shelf, the Chart, the title and the pause menu, every visible text node is a `TEXT_LOOP` string, a species name, a size-class label, a number (a weight as `data.fmtWeight` prints it, with its "lb" / "oz"; the card's one length with "cm"; or a number with a clam glyph: (pounds) no "kg", and no "cm" anywhere but the card's length line), a built record kicker or the card's built "length" label (the logotype and the Settings panel are exempt). (rev. 3) The allow-list also takes a water's name (the Chart's row), the five Wicks' `CHARACTERS[].name`, `TEXT_LOOP.wicks.*`, `TEXT_LOOP.start`, `TEXT_LOOP.newDescent`, `TEXT_LOOP.murk.wake`, `TEXT_LOOP.back`, the built **Prologue** word (`INTRO.trigger.replay.word`) and `FIRST_EVENING.tips.fe_cast` / `fe_strike`; the New Descent panel joins the scanned screens; "New Descent" is allowed on the fresh title and the panel only. (rev. 4) The home pause (`homepause`, **Resume** · **Settings**) joins the scanned screens; the Settings panel stays exempt | D · scenario; C · ui-loop (the allow-list helper) |
| T44 | (rev. 3) a fresh loop save: New Descent → `[data-wick]` → Start → the film → the Jetty in flow `home`, the raft at the first dock, the wake line at the Jetty and Murk's first line at the Chart | D · scenario; B · loop-evening (`startRoute({loopOn: true, intro: true}) === 'home'`, `startRoute({loopOn: true}) === 'trip'`, `startRoute({loopOn: false})` is the built route) |
| T45 | `createTrip` refuses a water not in `meta.loop.maps.lakes` (falls back to `maps.lakes[0]`) | A · loop-trip |
| T46 | the gate is scenery: with the raft at the gate on a trip, `player.interact()` opens no modal and returns false, `player.interactable` is null for the gate and Murk's barge, no `gate:open` over 60 s (even with `run.legendaries.belled_matriarch` set), `getGateInfo().open === false`; `ui.openDescend()` does nothing while `loopOn()` | B · loop-evening; A · loop-trip (`evaluateGate`/`openGate`/`travel` inert); C · ui-loop |
| T47 | the Journal's species page on the loop: an entry with `firstEvening: 3` reads "Evening 3" and contains no "Day" and no "descent"; off the loop the built line is unchanged | C · ui-loop |
| T48 | a reload in the middle of a play loses no bite: `noteBite` opens `run.flags.openBite`; a save taken in the reveal or the lift and reloaded refunds it (`bitesSpent` equals the value before the bite); a save taken with the card open reopens the card and refunds nothing | A · loop-trip |
| T49 | `goHomeAllowed` returns `ok: false` with the right `why` for each blocking state (bite, reeling, landing → `'play'`; `inShow` or `cinematic` → `'show'`; card open or blocking → `'card'`; a got-away note pending → `'note'`; paused without `fromPause`, or flow ≠ `playing`, or not a trip → `'flow'`) and `ok: true` in `idle`, `charging`, `casting` and `waiting` | B · loop-evening |
| T50 | press and hold: with 1 of 3 slots full a 0.3 s press does nothing and a 0.7 s hold opens the tally; with a full hold a tap does; a press on the pill never starts a cast charge (`fishing.state` stays `idle`); the pill's timer fires at 0.6 s | D · scenario; C · ui-loop (the timer) |
| T51 | `migrateLoop` on a synthetic v2 block: flat bait counts move under `bait.mossmere`, `hold: 2` becomes `holdSlots: 5`, `raft.hull: 2` is refunded as 700 clams and removed, places are kept, a second migrate changes nothing | A · loop.test |
| T52 | quiet water on a trip: no sign spawns once `bitesLeft` is 0; `baseTerms` has no `letPass`, `pressure` or `hush` term; `view.favour.bitesLeft` goes 4 → 3 on a bite and back to 4 on a let go | B · loop-evening |
| T53 | parked buffs on a trip: `getCatchBuffs(cls)` has `wellFed: false`, no boons, no relics; (rev. 3) `character` is the trip's Wick only where its trait applies (`'ashwick'` with `firstHookTonight` as built; `'tallow'` for a Trophy, Elder or legend; else null); with the Wick, `getOdds` equals `catchChance` with no buff terms | A · loop-trip |
| T54 | a legend's card on a trip renders exactly two buttons, **Keep** (her price, 500 on a first landing) and **Let go**; no weight row, no Strike row, no favour row | C · ui-loop |
| T55 | the counters read the evening on a trip: evening 1 shows the strike ring and the key hints and refuses the hurry; evening 2 allows the hurry; `getFishingCounters()` reports the evening | B · loop-evening; A · loop-trip; C · ui-loop (`gw-hints`) |
| T56 | home's camera, mood and sound: `render.getCameraMode()` stays `'sail'` from the film's last frame into the Jetty and through the sail home; `world`'s mood targets in flow `home` are the dawn midpoint (not the title's); the audio mood in `home` is `'hub'` and the water bed is on | B · loop-evening (pure `loopHomeMood` and `zoneSting` cases; `pickMode` through the D scenario), D · scenario |
| T57 | Escape never strands the player at home: Esc (or a scrim tap) on the tally skips to its end and leaves Sold; (rev. 4, the lead's ruling 12) Esc on the Jetty opens the home pause **Resume** · **Settings** (modal `homepause`; the tutorial clock waits under it) and Resume or Esc returns to the Jetty as it was; Esc on the shelf or the Chart returns to the Jetty | C · ui-loop (the modal options); D · scenario |
| T58 | the parked keys on a trip: R, B and C do nothing and put nothing on screen; E does nothing; F and Space (outside a bite or a show) do nothing | C · ui-loop (`handleKey`); B · loop-evening (main's key guard, through `loop-rules.tripKeyAllowed`) |
| T59 | (rev. 3) the New Descent panel under the loop: exactly five `button.gw-char[data-wick]` in `LOOP.wicks` order, all enabled; no `.gw-locked`, `.gw-mode`, `.gw-ways`, `.gw-cd-row`, `.gw-chips`, `.gw-rating`, `.gw-lore`, no panel heading or sub-line; its visible words are the five names, one trait line (the lit Wick's), **Back** and **Start**; ← → and 1–5 move the selection, Enter presses Start; (rev. 4) the panel has no ✕ (`close: false`); at ≤ 480 px wide the cards are a 3 + 2 grid of 104 px cards and no name is truncated (each name's `scrollWidth ≤ clientWidth`); off the loop the built panel is unchanged | C · ui-loop (`descentModel`, the key map); D · scenario (DOM, both sizes) |
| T60 | (rev. 3) Start carries the Wick: `beginIntro({character: 'stub'})` writes `meta.loop.wick = 'stub'` and calls `actors.setCharacter('stub')` before `startIntro`; an unknown or missing id gives `'wick'` (`data.loopWickId`, rev. 4: the one export, reading `LOOP.wicks.order`); the first trip's `run.character === 'stub'`; a reload shows Stub on the title (progression's `syncCharacter` reads `meta.loop.wick` after actors' own `lastCharacter` pass); `meta.lastCharacter` is never written; (rev. 4) a first film abandoned to the title clears the in-memory Wick (the title is fresh again, and a save then writes `wick: null`) | A · loop.test (`loopWickId`), loop-trip (`createTrip`, `syncCharacter`, `setWick(null)`); D · scenario (`__gw.debug.intro('stop')` from a first play) |
| T61 | (rev. 3) the Wicks' traits on a trip: for each id, `computeStats(out, trip)` equals the trip's tackle stats plus `LOOP.wicks[id].stats` exactly (Taper's `castMax` 4 m and `hookWindow` +0.10 over the rod's absolute values; Stub `moveSpeed` +1, `lightRadius` +1.5; Tallow `moveSpeed` −0.8); `creelSize === holdSlots`, `maxOil`, `rarityBonus` and every combat stat as for the Wick; Tallow +2 Hold for a Trophy and not for a Prize; Ashwick +3 on the first hook in `gloomtide` and 0 by day; off the loop `computeStats` and `catchBuffHold` are unchanged (the v3 fingerprint) | A · loop-trip, validate-data |
| T62 | (rev. 3) the title: `loopFreshSave(meta, hasSavedTrip)` is true only with no trip saved, `meta.loop.wick` unset, `meta.loop.tutorial` null and `evenings` 0 (an old v3 save with `runs > 0` and no loop block is fresh); fresh → **New Descent** (focused) · **Settings**; otherwise **Continue** · **Settings** (quiet) and **Prologue** when `introReplayOffered()`; never Begin, Journal, Shrine, Trials, a tagline, the premise, the counts or a "Day N" sub-line under the loop; Continue at home → the Jetty | B · loop-evening (`loopFreshSave`); C · ui-loop (`titleModel`); D · scenario |
| T63 | (rev. 3) Start → the film in one press: after the click, in the same task, flow is `intro` (no extra screen, no loading screen); Skip works; with no film (`filmAllowed` false: a debug build without the opt-in) Start goes to flow `home` with the raft at the first dock, the tutorial at the wake, `meta.intro` untouched | B · loop-evening (`filmAllowed`); D · scenario (both passes) |
| T64 | (rev. 3) the hand-off: `intro:done` → flow `home`, `render.getCameraMode() === 'sail'` from the film's last frame, a 3 s glide (`player:glide {kind: 'home'}`, the `kind` option of §2.2 item 15) from the film's last place to `docks[0]`; a tap, Enter, Space or Escape ends it at the dock (a press inside `INTRO.skip.after` of a film skip is swallowed); Murk's barge is moored when it starts; the save written at its start holds `meta.intro.seen`, `meta.loop.wick` and `meta.loop.tutorial {done: false}`; then `home:enter {from: 'intro'}` | B · loop-evening (fake player); D · scenario |
| T65 | (rev. 3) the tutorial machine (pure): beats `arrive → wake → chart → out` in order; the wake ends on a Chart tap or opens the Chart `LOOP.tutorial.chartWait` (3 s) after the line; a tap elsewhere only ends the line; Escape on the Chart goes back to the Chart cue; Sail is live from the Chart's first frame and the machine never presses it; the clock waits while another screen is on top; one Murk line at a time, each from `TEXT_LOOP.murk`; the reference run (no taps, Sail pressed 2.5 s after the Chart opens) ≤ 20 s and the tap-through ≤ 8 s, both ≤ `LOOP.tutorial.budget.max` (45 s); `cue()` only ever names a tile or a button; (rev. 4) after `onEscapeChart()` the Chart never opens itself again, however long the player waits (only the tile's cue remains); before the first Sail the departure line is the machine's on every Chart open (`TEXT_LOOP.murk.firstChart`, read directly; `sayOnce('firstChart')` is never called while the tutorial runs) | C · loop-tutorial.test |
| T66 | (rev. 3) the glide out: Sail → `loop.tutorialDone()` saved (first Sail) → `ui.closeAll` → a 3 s glide in flow `home` (`player:glide {kind: 'sailOut'}`) from the dock to `sailPlan(dock, centre).to` → `startTrip`; `run:start` never fires before the glide ends; after `run:start` the raft is at the glide's end (no respawn jump); a tap ends the glide at its end; every later Sail glides too; a blocking screen left open never freezes it (the screens close first); (rev. 4) after a trip that ended near `docks[2]`, the sail home leaves the raft at `docks[0]` and the next Sail's glide starts within 0.5 m of the raft (no teleport) | A · loop.test (`data.sailPlan`); B · loop-evening (a fake player and clock); D · scenario |
| T67 | (rev. 3) resume and return: a reload during arrive, wake or chart → Continue → the Jetty → the tutorial at the wake (the line again, no glide); with `tutorial.done` no `.gw-cue` anywhere and the goal line drawn; `migrateLoop` gives a block with `evenings > 0` `tutorial {done: true}` and `wick 'wick'`; `freshLoop` has both null; (rev. 4) a reload in the chart beat, then Continue → Chart shows the departure line again; Continue with `wick` set and `tutorial` null begins the tutorial at the wake and nothing throws; `migrateLoop` also marks `tutorial.done` for a block with a `lastTrip` or a saved trip (`{hasTrip: true}`) | A · loop.test; C · ui-loop; D · scenario |
| T68 | (rev. 3) the first trip's words: on evening 1, `fe_cast` once, 1.5 s after `run:start` while fishing is `idle`, gone on `fishing:cast`; `fe_strike` (the touch or desktop form) in the first bite's window, gone on `fishing:strike` or `fishing:miss`; each marks `meta.seenTips`; neither on evening 2 or with the tip seen; every other tip, banner and greet stays suppressed (CHOICE 8) | C · ui-loop; D · scenario |
| T69 | (rev. 3) start over: Settings → **Forget everything** under the loop shows the loop's sub-lines (`TEXT_LOOP.forget`), two in-page confirms (`.gw-confirm`, never `window.confirm`), then a fresh title with **New Descent**; off the loop the built words | C · ui-loop; D · scenario |
| T70 | (rev. 3) flag-off and v3-without-loop: the title, New Descent (Wick detail, night-mode step, waystones, locks), Begin → film → First Outing and every tip are as built (`ui-screens-v3`, `ui-v3` and the intro tests unchanged; the `intro-flow` scenario with the loop off) | B, C (their files); stager (§4.2) |
| T71 | (rev. 3) the panel under the ink: at Start, ui-intro holds the `newdescent` panel's picture with the title's (`takeTitle`), both inert and removed under the full ink; no frame shows the title without the panel before the ink | C · ui-loop (a fake K stack); D · scenario (a screenshot 0.1 s after Start) |
| T72 | (rev. 3) the paths: `validate-data --loop` checks the arrive path (spawn → `docks[0]`) and (rev. 4) every lake's glide out from `docks[0]` through `data.sailPlan` (its `outPath`, or the `outDist` rule) stay ≥ raft radius + 0.3 m from every island and pillar of their lake's layout, and that `arrive + murkHold(wake) + chartWait + murkHold(firstChart) + out ≤ budget.max` | A · validate-data |
| T73 | (rev. 4) Escape and Settings at home: on the Jetty (and during the tutorial's wake and chart beats) Esc opens `homepause` with exactly **Resume** and **Settings**; on a phone the quiet pause glyph (`[data-loop=homepause]`, the built pause glyph, no word, ≥ 44 px, top-left under `--sat`) opens the same panel; Settings opens over it and Done returns to it; Resume returns to the Jetty; the tutorial's clock does not move while `homepause` or `settings` is on top; a home glide (arrive or sail out) is skipped, not paused, by Esc | C · ui-loop (the modal options, the clock rule with `loop-tutorial`); D · scenario (both sizes) |
| T74 | (rev. 4) Settings under the loop: no **Damage numbers** row, no "Softer flares and hit flashes" line; the strike-ring option reads `TEXT_LOOP.settings.ringFirst` ("First evening") and the hurry row's line `TEXT_LOOP.settings.hurry`; the Forget row's words are `TEXT_LOOP.forget`; off the loop every row and word is as built | C · ui-loop; D · scenario |
| T75 | (rev. 4) the Wicks in the sim: `clams.mjs` runs its 1 h clams check and its choosy check once per `LOOP.wicks` entry, applying the traits the sim models (Taper's strike window, Tallow's and Ashwick's Hold); every Wick passes the same bands; the traits it cannot model (cast distance, raft speed, light) are printed as "not modelled" | A · clams.mjs |

---

## 2. Lanes

Four lanes, built at once in four worktrees: A off S, and B, C, D off M+S. Each owns its files outright. A lane that needs a
line in a file it does not own files a **cross-file request** (§2.5), which the stager applies after merging the owner.

### 2.0 The seam commit S (lane A, first, before B, C and D branch)

A short first delivery, so that no lane codes against a name that does not exist yet (a static `import { fmtClams } from
'./core.js'` fails at ESM link time and in esbuild; B's and C's tests need the real loop data). Two commits on A's branch
off M, merged by the stager into M:

- **S1** (data.js untouched): `validate-data --write-v3-fingerprint` and `tools/tests/v3-exports.json` generated from M's
  `data.js` (§4.3).
- **S2**: `data.js` §2.1 items 1–3 complete (the flags, `PARKED`, `LOOP`, `TEXT_LOOP`, `fishClams`, `loopWaterKey`,
  `quietTerms`, `goodBitesFor`, the `V3_PHASE` line, the two apply-block gates); `core.js` §2.1 item 4 complete (the switch,
  `fmtClams`, `'loop'` in `HIDDEN_DEBUG_HOOKS`); `src/progression-loop.js` with every **pure** export of §3.3 implemented and
  `createLoop(S)` returning an object with every method of §3.3 as an inert stub (`null`, `false`, `0` or `{ok: false}`),
  not yet wired into `progression.js`; and **`tools/tests/loop-fixture.mjs`** (owned by A): `loadLoopData()` (sets
  `GW_V3 = true`, `GW_V3_PHASE = 1`, `GW_LOOP = true`, imports `src/data.js?loop`), `freshLoopMeta(D)`, `tripRun(D, over)`,
  and `fakeLoop(over)`, an object with §3.3's methods that B's and C's tests pass where `ctx.progression.loop` goes.
  (rev. 3) S2 also carries the opening's data (§2.1 item 15: `LOOP.wicks`, `LOOP.tutorial`, the new `TEXT_LOOP` words) and
  `fakeLoop` gains `wick`, `setWick`, `tutorial`, `beginTutorial` (rev. 4), `setTutorialStep` and `tutorialDone`, so C's
  tutorial and B's hand-off tests run from their first commit. (rev. 4) S2 also delivers the two pure helpers both B and A's
  validator read: `data.loopWickId(id)` and `data.sailPlan(dock, centre, T, lake)` (§2.1 item 15).

S must leave the gate green except the one sim check M already fails (§6.3 step 0); it passes `validate-data` (the built
passes, with pass 3 now checking the new v3 fingerprint; the `--loop` pass comes later in A) and `check.mjs --quick`. After S, nothing in B, C or D needs a stub for A's names: they import and read them directly
(`D().TEXT_LOOP.home`, `core.fmtClams`). The runtime stub rule of §3 still holds for ctx objects (`ctx.progression.loop`,
`ctx.game.*`, `ctx.ui.loop`), which arrive with the other lanes.

### 2.1 Lane A: the ledger

**Owns:** `src/data.js`, `src/core.js`, `src/progression.js`, `src/progression-v3.js`, `src/progression-af.js`,
`src/progression-market.js`, `src/progression-challenges.js`, new `src/progression-loop.js`, `tools/validate-data.mjs`,
`tools/sim/clams.mjs`, `tools/fingerprint.mjs` (read only unless needed), new `tools/tests/v3-exports.json`, new
`tools/tests/loop-fixture.mjs`, new `tools/tests/loop.test.mjs`, new `tools/tests/loop-trip.test.mjs`, `CONTRACT.md` (a new
§14 appended at the end), and the SPEC figures the sim moves (a separate docs commit, §6.4).

**First commits:** S1 and S2 (§2.0). S1 generates the v3-without-loop fingerprint from M's untouched `data.js` (§4.3).

**Work.**

1. **data.js, flags** (after `V3_BLOCK_PHASE`, base 2636):
   - `V3_PHASE` (base 2634): when `V3_ENABLED && globalThis.GW_LOOP === true` it is **1**; otherwise the expression is byte
     for byte today's. (A tool that sets `GW_LOOP` without `GW_V3_PHASE` still gets the loop's phase-1 data.)
   - `export const LOOP_ENABLED = V3_ENABLED && globalThis.GW_LOOP === true;`
   - `export const PARKED = Object.freeze(LOOP_ENABLED ? {…the 31 keys of §3.1, all true} : {});`
   - Both are declared above the apply block (base 4693), which reads them (a `const` read before its declaration throws).
2. **data.js, tables** (a new block after `MERCHANT_LINES_V3`, base 4418, before "Pure v3 helpers", base 4426; clear of
   `gw-intro`'s INTRO at 3904 and `gw-show`'s AUTOFISH hunks and its functions after `presentLength`): `LOOP`, `TEXT_LOOP`,
   `fishClams`, `loopWaterKey`, `quietTerms`, `goodBitesFor` exactly as §3.1. They are always exported (plain data that tools
   read in any build) and never read by built code off the loop.
3. **data.js, apply block** (`if (V3_ENABLED)`, base 4693): `if (!PARKED.watchLamps) moss.arena.watchLamps = …` (4735);
   `if (!hasPlaces && F && !PARKED.giantSpots) z.arena.giantSpots = …` (4745); `if (… && !PARKED.watchLamps) z.arena.watchLamps
   = …` (4746); after `TEXT.v3 = TEXT_V3` (4731): `if (LOOP_ENABLED) TEXT.loop = TEXT_LOOP;`. Nothing else in the apply block
   changes. `TACKLE`, `BALANCE_V3.size.value`, `fishValueV3` are untouched (no T5/T6 rows in `TACKLE`).
4. **core.js, the switch** (beside the v3 switch, base 91–169): `LOOP_ROLLOUT`, `LOOP_FLAG_KEY`, `resolveLoopFlags`,
   `applyLoopFlags`, `setLoopFlag`, `LOOP_FLAGS` (declared **above** `V3_FLAGS`, base 169), `fmtClams`; and `'loop'` in
   `HIDDEN_DEBUG_HOOKS` (base 200; `gw-intro` adds `'intro'` to the same list). Signatures in §3.2.
5. **progression-loop.js** (new): `createLoop(S)` and the pure module exports of §3.3. It takes data from `S`/`ctx.data`, never
   by importing `data.js` (tests evaluate `data.js?loop` as a separate module instance).
6. **progression.js**: build `createLoop(S)` after `createAutofish(S)` (base 253); expose it as the `loop` key of the
   returned API (null off the loop). Module-level re-exports `sellStrandedTrip` (beside `migrateSave`, base 31). Under the loop
   (`LOOP()` = `D().LOOP_ENABLED === true && run()?.outing === 'trip'` or, for run-less calls, `D().LOOP_ENABLED === true`):
   - `createRun` (309): first line `if (D().LOOP_ENABLED === true) return loop.createTrip({startZone, character})`. `createTrip`
     builds the built run skeleton (the `r` literal at 330–344, `uid('run')`) and then sets: zone = `startZone` if in
     `meta.loop.maps.lakes` else `maps.lakes[0]`; `outing 'trip'`; `nightMode 'still'`; (rev. 3) `character = D().loopWickId(meta.loop.wick)` (a `LOOP.wicks` id, else `'wick'`;
     never through `characterUsable`'s trial check); `shells 0`;
     `boons {}`; `upgrades {}`; `lures {}`; `bait = {...meta.loop.bait[zone]}` (empty in 1a); `equippedBait = null`;
     `equipped = null`; `creel []`; `bites {}`; `mercy {}`; `evening = meta.loop.evenings + 1`; `tally {dawns: 0, stillNights:
     0, swarmNights: 0}`; `flags.nightLog []`; hp, oil and satiety at the computed maxima. It never calls
     `challenges.specialSum`, never reads `CHARACTERS[].startKit` or `startBoon`, never adds a waystone purse.
   - `computeStats(out, r)` (133): the branch is keyed on the **argument** `r?.outing === 'trip' && D().LOOP_ENABLED ===
     true`, never on `run()` (createRun calls it before `ctx.state.run` is set). After the built body, `out.creelSize =
     meta.loop.holdSlots`; `castMax` and `hookWindow` from `TACKLE.rod[Math.min(t, TACKLE.rod.length - 1)]` for `t =
     meta.loop.tackle.rod` (TACKLE has tiers 0–4; the absolute values the TACKLE comment at data.js:3451 defines; **PLAN
     CHOICE 13**); relic and journal-perk effects are skipped (`PARKED.meta`); `flags.mercy` is not added. (rev. 3) The
     built `character(r.character).effects` are **not** added on a trip; instead `LOOP.wicks[r.character].stats` is added
     **after** the tackle's absolute `castMax`/`hookWindow` (so Taper's +4 m and +0.10 are not overwritten) and before
     `creelSize = holdSlots` (PLAN CHOICE 31).
   - (rev. 3) `syncCharacter` (1509): its `flow:change 'title'` call (1867) and its init call (1872) read
     `D().loopWickId(meta.loop?.wick)` under `D().LOOP_ENABLED === true`, `meta.lastCharacter` otherwise. Progression's
     listener runs after actors' own `lastCharacter` pass (actors.js 218, 224), so the title shows the chosen Wick with no edit
     to `actors.js` (T60 proves the order).
   - `makeFishV3` (398): on a trip, stamps `fish.waterKey = D().loopWaterKey(place, r.zone)` (fishing already passes
     `place`), so `letGo` never needs its fallback.
   - `measure` (871): the records only (journal, PB, best setup, last lengths, seals, Old Ledger flag, Elder Log,
     legend-wound clear, Marked Fish removal, `meta.totalFish`, run counters), plus `entry.firstEvening = run.evening` (new
     and on first catch) and `fish.measured = true`; on a trip it returns at once for a fish that already carries `measured`
     (the in-memory `measured` Map is cleared on `run:start`, so after a reload the flag is the only guard). Skipped: `bank`/`addMemories` (all sources), first-catch Shells,
     `fishXpV3` and `combat.addXp`, journal milestones and mastery Memories, the Memories and Shells toasts, Murk's legendary
     line, `market.bountyEvent`, `challenges.hooks.fish`, `evaluateGate`, the victory check. **Always**
     `pending.set(fish.uid, {fish, t: 0}); syncPending();` and never `addToCreel`, **before** the `fish:measured` emit
     (main saves on it, so the saved run carries `flags.pendingCatch`). `fish:landed` keeps today's payload with
     `firstShells: 0, xp: 0` and adds `clams: loop.priceOf(fish)`, `holdFull: loop.holdFull()`. Emit order unchanged.
   - `fishAction` (510): `'keep'` → `loop.keep(fish)`; `'letgo'` and `'release'` → `loop.letGo(fish)`; `'eat'`, `'render'`,
     `'burn'`, `'sell'` → `{ok: false, msg: ''}`.
   - `restorePending` (459): first `loop.refundOpenBite()` (PLAN CHOICE 27); re-inserts each saved fish into `pending` (not the creel), then in a microtask (after every
     `run:start` listener, because ui's `run:start` clears its catch queue) emits `fish:landed {…, measured: true, records:
     [], restored: true, clams}` for each. It never calls `measure`.
   - `update` (the `AUTO_KEEP_AFTER` loop, 1877–1897): skipped; a card waits for the player.
   - `onRunStart` (1515): normalises `run.bites`, `run.mercy` (objects) and `run.evening` (number) on a trip.
   - `notePressure`/`getPressure` (1049/1057): return at once / 0 on a trip (quiet water replaces pressure).
   - `init` (1811): register the loop's listeners only `if (D().LOOP_ENABLED === true)`: `fishing:bite` and `fishing:miss
     {reason: 'spooked'}` → `loop.noteBite`; `fish:measured`, `fishing:escaped` and every `fishing:miss` → `loop.closeBite()`
     (the open bite of §3.3).
   - the API gains `getBitesLeft(key)` = `loop.bitesLeft(key)` (the spec's name, SPEC §3.3), null off the loop.
   - **the gate is scenery** (`PARKED.tolls`, on a trip): `evaluateGate`, `openGate` and `travel` return at once (`travel`
     → `{ok: false, msg: ''}`); `syncGateVisual` pushes the built `'sealed'` (or `'hidden'` where there is no next lake), so
     the gate stands as built and never opens. The four call sites (`measure`, `onRunStart`, `onZoneChange`, `update`) need
     no change.
   - `summarizeRun` (1323): unreachable on a trip (main never calls it); no change.
7. **progression-v3.js** `migrateSave(D, save)` (108): after the existing steps, `if (D.LOOP_ENABLED === true)
   migrateLoop(save.meta, D, {hasTrip: save.run?.outing === 'trip'})` (rev. 4: the third argument, item 15). The `!v3On(D)` early return stays first.
8. **progression-af.js**: `const loopRun = (r) => D().LOOP_ENABLED === true && r?.outing === 'trip'`. `perRunOf` (62) is false
   for a trip. `getLoadout` (123) for a trip **and, under `D().LOOP_ENABLED === true`, its no-run branch too** (the shelf's
   Odds › opens the gear log at home, where there is no run): `{rod, line, reel}` from `meta.loop.tackle`, `item: null`,
   `itemLevel: 1`, `perRun: false`, `runless` as built, and `hold` from `tackleHoldAt` for T0–T4 or
   `LOOP.tackle.extraHold` for T5–T6 (never `meta.fitted`). `getFishingCounters` (580): under the loop the expedition count
   is the evening (`run?.evening ?? meta.loop.evenings + 1`) and `firstExpedition` is evening 1.
   `ownedRelics` (141) `{}` under `PARKED.meta`. `getCatchBuffs(cls)` (163; rev. 4: the built function takes no argument, so
   it gains the optional `cls` that CONTRACT §13.7 already names and `fishing.js` already passes; off a trip it ignores it, so
   every built result is unchanged) on a trip: `wellFed false`, `boons {}`, `relics {}`;
   (rev. 3) `character` is `'ashwick'` for Ashwick (with `firstHookTonight` as built: the loop's night is phase `gloomtide`
   and a trip's `r.day` is always 1), `'tallow'` for Tallow when `cls` is `trophy`, `elder` or a legend, else `null`
   (PLAN CHOICE 31). Every caller that sums Hold passes the class (fishing.js:1163 does; a class-less call, such as
   `getCatchMods`, gives Tallow nothing). The logs keep their built rule: `getOdds` and the gear log show the tackle's odds
   with the owned relics and **no run buffs**, so no Wick's trait is in a log (rev. 4, recorded; SPEC's "odds only in the
   logs" is about the tackle, as built). `runLuresOn` (64) false on a trip. `getGearLog` (361) reads the trip's loadout (it already goes
   through `getLoadout`) and works with a null run at home (`zone` falls back to `'mossmere'`).
9. **progression-market.js**: `update` (83) and `arrive` (35) return at once under `PARKED.murkInLake`; `offerBounties`
   (484), `expireBounties` (528), `bountyEvent` (571) return under `PARKED.bounties`.
10. **progression-challenges.js**: under `PARKED.challenges`, `evaluate` (124) returns `[]`, `complete` (145) returns false,
    every `hooks.*` (177) is a no-op.
11. **validate-data.mjs**: the `--loop` pass and the v3 fingerprint (§4.3).
12. **clams.mjs**: reads `data.LOOP` (§6.4). Lane A owns the sim's re-run on its branch (PLAN CHOICEs 15 and 17 move its
    figures) and the docs commit that re-pastes the moved SPEC rows (§6.4).
13. **CONTRACT.md §14**: the seam of §3 below, as the loop's API (SPEC §12 asks for it with 1a), with a table **"the names
    the spec uses → the names built"**: `run.hold` → `run.creel` (PLAN CHOICE 19); `getBitesLeft(key)` →
    `ctx.progression.getBitesLeft` (an alias of `loop.bitesLeft`); `fishing:bite {waterKey}` for a spooked bite →
    `fishing:miss {reason: 'spooked', waterKey}` (PLAN CHOICE 22); `run.eveningT` → derived (PLAN CHOICE 21). The same four
    lines go to the lead as a one-line SPEC errata request with the 1a commit.
14. **The gate is scenery** (the facts' reference): item 6's last bullets (`evaluateGate`, `openGate`, `travel`, `syncGateVisual`).
15. (rev. 3) **The opening's data and state** (`docs/loop/OPENING.md`), in S2:
    - `LOOP.wicks` (in the LOOP block; rev. 6, `WICKS.md` §5's shape): `{ order: ['wick', 'taper', 'stub', 'tallow',
      'ashwick'], wick: {passive: 'curious', firstMult: 1.5, firstFloor: 0.4, stats: {}}, taper: {passive: 'long_reach',
      firstBites: 1, perWater: true, giantShare: 1.3, giantCap: 0.12, stats: {}}, stub: {passive: 'moth_bright', waitMul:
      0.75, quietStep: 0.08, quietWait: false, stats: {lightRadius: 1.5}}, tallow: {passive: 'broad_back', slots: 1, good: 1,
      stats: {}}, ashwick: {passive: 'burns_back', hold: 4, stats: {}} }`, and `LOOP.priceFactor: 1` (SPEC §10.1's passives;
      every number a starting number the balancing job sets). Beside `loopWickId`: `wickPoolWeights`, `wickSlots(holdSlots,
      wickId)`, `loopSlots(metaLoop, wickId)`, `quietTerms(over, wickId)`, `goodBitesFor({kind, holdSlots, wickId})` (§0). A pure
      `loopWickId(id) → id | 'wick'` beside `loopWaterKey`, reading `LOOP.wicks.order` (rev. 4: the only implementation;
      main, `loop-rules.js` and progression import or read it, none keeps its own list). (rev. 4) A pure
      `sailPlan(dock, centre, T = LOOP.tutorial, lake) → {from, to, yaw}` beside it: `T.outPath[lake]` when given, else
      `T.outDist` m from the dock toward the lake's centre; main's `game.sail` and `validate-data --loop` both call it.
    - `LOOP.tutorial = { arrive: 3, out: 3, chartWait: 3, slotInk: 0.25, castTipAfter: 1.5, outDist: 15,
      outPath: { mossmere: [[24, 38], [16, 25.3]] }, budget: { reference: 20, tapThrough: 8, max: 45 } }`.
    - `TEXT_LOOP` gains: `newDescent: 'New Descent'`, `start: 'Start'`, `back: 'Back'`, `wicks: { wick: 'Firsts and new bests sell higher.',
      taper: 'First bites are never common fish.', stub: 'Quick bites, even on quiet water.', tallow: 'Stout enough for one
      more fish.', ashwick: 'A fish that gets away comes back.' }` (rev. 6, `WICKS.md` §2's lines), `murk.firstChartBy: {
      tallow: 'Four slots in that hold. Fill them and come home.' }` (rev. 6, beside `murk.firstChart`)`, `murk.wake: "Awake, little Wick? Good. Fish sell. Clams
      buy. That's the whole of it."` (SPEC §11), `forget: { row: 'Clams, gear, the Journal. There is no undo.', confirm:
      'Every clam, every piece of gear and every name in the Journal will be lost.' }`, and (rev. 4, CHOICE 43) `settings:
      { ringFirst: 'First evening', hurry: 'From your second evening, hold anywhere to hurry a small fish in. It never
      changes the outcome' }`. Each passes the originality scan and the no-Shells/Memories/Descent rule except `newDescent`
      (the user's own word, allowed on the title and the panel only, T43). The trait lines, `back`, `forget` and `settings`
      are this plan's wording (rev. 6: the five lines are now `WICKS.md`'s, the user's "as written" of 15 November 2026) and wait on the lead's sign-off (§7.1); `newDescent`, `start`, `murk.wake` are the user's or
      the spec's.
    - The apply block, under `if (LOOP_ENABLED)` only (rev. 6): `CATCH_V3.buffs.wicks.ashwick = { hold:
      LOOP.wicks.ashwick.hold }` (no `on`; `getCatchBuffs` returns `character: 'ashwick'` only while a comeback bite is open;
      `catchBuffHold` is an exported function and is not edited, §4.1 rule 7). No Tallow buff: Tallow's passive is the hold,
      never the fight's Hold. And (rev. 6, B's request, §2.5) `INTRO.text[2] = INTRO.cove.text[2] = TEXT_LOOP.introLine3`
      with `TEXT_LOOP.introLine3 = 'Its last candles fish from lamp to lamp.'`.
    - `progression-loop.js`: `freshLoop` adds `wick: null, tutorial: null`; `migrateLoop(meta, D, {hasTrip})` fills them,
      and a block with `evenings > 0`, a `lastTrip` or `hasTrip` (rev. 4) and no tutorial gets `tutorial {done: true, step:
      null}` and `wick 'wick'`. Methods (§3.3): `wick()`, `setWick(id)` (in memory; the next save writes it; rev. 4:
      `setWick(null)` clears it, for main's abandoned film, CHOICE 46), `tutorial()`, `beginTutorial()` (`{done: false, step: 'arrive'}` when
      null), `setTutorialStep(id)`, `tutorialDone()` (`{done: true, step: null}`, then `ctx.game.save()` synchronously).
    - `validate-data --loop` (T72): `LOOP.wicks.order` is the five `CHARACTERS` ids; every `stats` key is a STATS key; the
      arrive path and (rev. 4) every lake's glide out from `docks[0]` through `sailPlan` (an explicit `outPath` or the
      `outDist` rule) clear every island and pillar of their lake's layout by raft radius + 0.3 m; the time budget; `TEXT_LOOP.wicks` has one line per id, each ≤ 8 words.
    - CONTRACT §14 (item 13) also lists the opening's seam (the rev. 3 rows of §3.3–§3.6).

### 2.2 Lane B: the evening

**Owns:** `src/main.js`, `src/fishing.js`, `src/survival.js`, `src/combat.js`, `src/combat-levels.js`, `src/player.js`,
`src/world.js` (the `home` branches in `moodTargets` and `isTitle`), `src/render.js` (one branch in `pickMode`, one in the
`zone:change` listener), `src/water.js` (one line: the ambience in `home`), `src/audio.js` and `src/audio-v3.js` (the
`home` mood and water bed, the sail-out sting), new `src/loop-rules.js` (main's pure guards, §3.5),
`tools/tests/fishing-env.mjs` (additive: the fake progression may carry a `loop` object), new
`tools/tests/loop-evening.test.mjs`.

**Work.**

1. **main.js, constants**: `const LOOP_ON = data.LOOP_ENABLED === true; const PARKED = LOOP_ON ? (data.PARKED || {}) : {};`
   next to `V3` (base 41). In every function where `LOOP_ON` and `FE_ON` both apply, the `LOOP_ON` branch comes first.
2. **Boot rule** (base 78–87): before the `pureMigrate` block:
   `const strand = LOOP_ON ? null : moduleExport(progressionMod, 'sellStrandedTrip');` and, if it returns `sold` or
   `restored`, use its `save` as the starting envelope; after `normalizeSave`, `writeSave({meta: saved.meta, run:
   saved.run})` once (`run` is null after a sale, or the parked descent put back). Runs in every build where the loop is off
   (v1 and v3-without-loop). `moduleExport` finds nothing until A wires the re-export, so B builds and tests alone.
3. **`game.startNewRun`** (base 160; written on `gw-intro`'s version, which adds `...(opts.__intro ? {intro: true} : {})` to
   the `zone:change` line): first line `if (LOOP_ON) return opts.__intro ? enterHome('intro') : startTrip(opts);`
   (**PLAN CHOICE 2**). `startTrip(opts)`: refuse unless `tripStartAllowed({flow, hasSavedTrip: game.hasSavedRun()})`; if a non-trip
   `savedRun` is waiting, `ctx.progression.loop.parkRun(savedRun)` first;
   `run = ctx.progression.createRun({startZone: opts.water || 'mossmere', character: data.loopWickId(ctx.state.meta.loop?.wick),
   nightMode: 'still', outing: 'trip'})` (rev. 3: the chosen Wick; createTrip validates it again); on failure `report` and stay home (never `fallbackRun`); `lockRunMode(run, {nightMode: 'still', outing:
   'trip'})`; **no write** to `meta.runs`, `meta.lastCharacter` (**PLAN CHOICE 3**); `ctx.state.run = run; savedRun = null;
   ctx.paused = false; actors.merchant.leave({instant: true}); ctx.ui.closeAll?.()` (the Chart sits on the Jetty; both must
   go before play), `setFlow('playing'); emit('zone:change', {zone: run.zone, prev: null, sail: true})` (the lake is already
   on screen: render does not flash, audio plays `setout`, ui shows no banner, item 18 and §2.3 item 1); `emit('run:start',
   {continued: false})`; (rev. 3) `if (opts.at) ctx.player.teleport(opts.at.position, opts.at.yaw)` in the same task (the
   player's `run:start` listener respawns the raft at the lake's spawn; this puts it back where the glide out ended before
   any frame is drawn, the `continueRun` restore pattern); `game.save()`.
4. **`game.sail(plan)`** (rev. 3: the glide out, PLAN CHOICE 38): refuse unless `tripStartAllowed`; `const first =
   ctx.progression.loop?.tutorial?.()?.done !== true`; if `first`, `ctx.progression.loop?.tutorialDone?.()` (saved before
   anything moves); `ctx.ui.closeAll?.()` (a blocking Chart would freeze `gameDt` and the glide with it); then, still in flow
   `home`, `const g = data.sailPlan(docks[0], centre, LOOP.tutorial, plan.water)` (rev. 4: `data.js`, S2, shared with the
   validator; `outPath[lake]` when given, else `outDist` m from the dock toward the lake's centre; the raft is at
   `docks[0]` because home always is, CHOICE 44); `await player.glide([g.from, g.to], {duration: LOOP.tutorial.out,
   skippable: true, kind: 'sailOut'})`; on a tap or a skip key (item 8) `skipGlide()` then `teleport(g.to, g.yaw)`; then `startTrip({water: plan.water, at: {position: g.to, yaw: g.yaw}})`. A second Sail while the glide runs is
   ignored (`sailing` latch). `game.planSetOut` is left as it is (FE only).
5. **`game.endRun(cause)`** (base 235): first lines under `LOOP_ON`: `if (!tripEndAllowed(cause)) { report('endRun', new
   Error('a trip ends only at home: ' + cause)); return; }`, then: `const tally = ctx.progression.loop?.endTrip?.() ?? null`
   (pays, sets `run.active = false`, empties the hold and **saves synchronously**, before anything moves); `resetBeats();
   ctx.state.run = null; savedRun = null; emit('run:end', {summary: null, cause: 'home'}); enterHome('trip', tally)`. Never
   `summarizeRun`, `showDeath`, `hearthCut`, `meta.deaths`, `meta.bestDay`. `player:died` (base 440) and `victory` (base 469)
   therefore do nothing on a trip.
6. **`game.canGoHome({fromPause = false} = {})`** → `{ok, why}` = `goHomeAllowed(…)` (`loop-rules.js`): ok when `LOOP_ON &&
   flow === 'playing' && run?.outing === 'trip' && (fromPause || !ctx.paused) && !ctx.cinematic && !fishing.inShow && fishing.state ∉ {bite, reeling, landing}
   && (fromPause || ctx.ui.isBlocking?.() !== true)` (the catch card is blocking; from the pause, the card cannot be open
   under it) `&& !ctx.ui.isCatchOpen?.() && !notePending`, with `notePending = fishing.state === 'lost' &&
   fishing.isAnchored()` (the built `lost && lostInfo && !noteSent`). The pause menu's Home closes the pause, resumes, then
   calls `goHome`. **`game.goHome()`**: if
   `canGoHome().ok`, cancel a line in `charging | casting | waiting` with `fishing.cancel('home')` (no bite has fired,
   nothing is spent; **PLAN CHOICE 4**), then `endRun('home')`.
7. **`enterHome(from, tally)`** (beside `enterHub`, base 318): `resetBeats(); ctx.state.run = null; ctx.paused = false;
   ui.closeAll(); setFlow('home')`. Then:
   - `from === 'trip'`: **the sail home**, a 2 s glide: `player.glide([raft position, the point 2 s of raft speed toward
     `docks[0]`], {duration: 2, skippable: true, kind: 'home'})` (rev. 4, CHOICE 44: home is always the Jetty's dock,
     `world.getDocks()[0]`, never the nearest dock; it steps in flow `home`, item 15; the sky pales to dawn through world's
     `home` mood, item 16). The clams were paid and saved before it started, so a reload during the glide is a reload
     during the tally. At its end (or a tap): `player.teleport(docks[0].position, docks[0].yaw)` in the same task as the
     arrival below, so the tally's sheet opens on the frame of the cut (R3).
   - (rev. 4) **Every `from`**: `if (ctx.progression.loop?.tutorial?.()?.done !== true) ctx.progression.loop?.beginTutorial?.()`
     first (a save with a Wick and no tutorial record, a migrated block, an abandoned film: the tutorial begins at the
     wake; `beginTutorial` leaves a running record unchanged).
   - `from === 'intro'` (rev. 3, PLAN CHOICE 35): Murk's barge moored (the arrival's `merchant.arrive`, moved before the glide), and **`game.save()` at once** (the
     film's seen flag, `meta.loop.wick` and the tutorial reach the disk before the glide); then the glide from where the film
     left the raft to the first dock (**3 s**, `LOOP.tutorial.arrive`, `kind: 'home'`, skippable), so the Jetty opens on its
     one look (SPEC §6.1: the first dock at dawn, the raft tied up). The camera holds `'sail'` through it (item 18), so the
     film's release of `setIntroCamera(null)` does not pop. At its end (or a tap: `teleport(dock)`), `home:enter`.
   - `from === 'new'` (rev. 3: Start with no film, item 20): `showLake('mossmere')`, then as `'title'`.
   - `from === 'title'`: `showLake(meta.loop.lastTrip?.zone ?? meta.loop.maps.lakes[0])` (main's built helper, from
     `gw-intro`), then `player.teleport(docks[0].position, docks[0].yaw)`; then the arrival.
   - **the arrival**: `actors.merchant.arrive(dock2.position, dock2.yaw, {instant: true})` (Murk's barge moored at the next
     dock, else beside the first); `emit('home:enter', {from, tally})`; `game.save()`. (rev. 4) The arrival sets no grade:
     the hand-off's grade is `onIntroDone`'s one guarded line below (only it knows whether the film wore the grade).
   `game.toHome()` = `enterHome('title', null)` (the title's Continue at home). `game.atHome()` = `LOOP_ON &&
   !game.hasSavedRun()`. (rev. 3) The grade: `onIntroDone`'s `if (!graded)` line reads `ctx.state.run?.zone || (LOOP_ON ?
   INTRO_LAKE : null)`, so the hand-off with no run still eases in the Mossmere's grade (one guarded expression; the built
   path is unchanged because `ctx.state.run` is set there).
8. **frame()** (base 731; on `gw-intro`'s version): `const inHome = LOOP_ON && ctx.flow === 'home'`; `running` includes it;
   `CINEMATIC_FROZEN` modules get dt 0 when `inHome`, as in the hub. `pressAction` (518): in `home`, a tap skips a skippable
   glide and nothing reaches fishing or combat. (rev. 4) `pressAction` returns at once unless `gameAcceptsInput()`
   (base:691), which is false in flow `home`, so the home branch comes **before** that check: `if (LOOP_ON && ctx.flow ===
   'home') { if (!safe(() => ctx.ui.isBlocking?.(), false) && player.glideState) skipHomeGlide(); return; }`
   (`skipHomeGlide` = `player.skipGlide()` then `teleport` to the path's end); `gameAcceptsInput` itself is unchanged.
   `keydown` (604): no pause in `home` (Esc is the UI's: the Jetty's home pause, §2.3 item 2), except that while a home glide
   runs and no screen is up, a key in `INTRO.skip.keys` (Escape, Enter, NumpadEnter, Space) runs `skipHomeGlide()`
   (after `introFlow.swallowUntil`, so the key that skipped the film does not also skip the glide). On a trip, KeyE does
   nothing (`tripKeyAllowed('KeyE') === false`: Murk is home and the gate is scenery).
9. **Parking in main's input** (written on `gw-show`'s versions of the same blocks): skip `combat.onPointerDown` (base 536)
   under `PARKED.combat`; skip `pickMerchant`/`openShop` (537) under `PARKED.runShop`; skip `combat.flare` (622) under
   `PARKED.combat`. The strike priority and `gw-show`'s Space/Enter `hurryShow` stay ahead of everything.
10. **`continueRun`** (base 215): under `LOOP_ON`: `if (!game.hasSavedRun()) return enterHome('title')` (`hasSavedRun` is
    true only for a saved trip, §3.5; a saved non-trip descent is never resumed and is handed to `loop.parkRun` by
    `startTrip` before the trip replaces the save's run slot: **PLAN CHOICE 5**); otherwise as today, then `ctx.player.restore(pos)` after `run:start
    {continued: true}` (the raft's place; outside the `FE_ON` branch, guarded by `LOOP_ON` only).
11. **`toTitle`** mid-trip stays non-destructive (`savedRun = run`). `wipeAll` unchanged (progression's lazy `ensureLoop()`
    makes a fresh `meta.loop`).
12. **fishing.js** (all guarded by `LOOP = () => D().LOOP_ENABLED === true && run()?.outing === 'trip'`):
    - `waterInfo` (gw-show:407): add `waterKey: D().loopWaterKey(place?.id ?? null, lakeId())`; `pressureKey` unchanged.
      `castInfo` copies it into `S.cast`.
    - `bite()` (gw-show:1014): under LOOP the payload gains `waterKey: S.cast?.waterKey`. The flag-off and v3 payloads are
      unchanged objects.
    - `spook()` (gw-show:1228): under LOOP `fishing:miss {reason: 'spooked', waterKey}`. No second `fishing:bite` (it would
      play the bite tell).
    - `baseTerms` (base 437–470): under LOOP drop the `letPass` and `pressure` terms and the `hush` term; add `{family:
      'quiet', value: T.favour}` and `{family: 'letGo', value: mercy}` from `prog().loop.favour(key)`.
    - `rollBite` (base 911–917): `W × prog().loop.favour(key).waitMult` before the clamp.
    - `refreshFloat` (base 504–511 / gw-show:520): `view.favour.bitesLeft = prog().loop.bitesLeft(key)`; `view.favour.quiet
      = bitesLeft <= 0`.
    - `letItPass` (gw-show:1098): keep `refundBait`, write no favour.
    - signs (`spawnSign` base 2734, `updateSigns` 2840): spawn nothing while the cast's water is quiet.
    - `startCharge` (gw-show:701): `if (LOOP() && prog()?.loop?.holdFull?.() === true) { emit('loop:holdFull', {via:
      'cast'}); return; }` before any state change; the same check in `beginCast` (base 744) for debug and instant casts. A
      strike or a play already running is never refused.
    - `timeOk` (gw-show:297): `const timeOk = LOOP_DATA ? timeOkLoop : timeOkBuilt` chosen **once at create**
      (`LOOP_DATA = D().LOOP_ENABLED === true`), with `timeOkBuilt` byte-identical to today. `timeOkLoop` reads
      `D().LOOP.hours` (§3.1); an unknown string keeps the built rule.
    - `giantSpots()` (gw-show:398): `[]` under `PARKED.giantSpots` (a backstop to the data gate).
    - `caughtV3` (gw-show:2215): under LOOP skip the `sp.final` `killAll('dawn')` and `setPhase('dawn')` (a trip never
      reaches dawn on the water).
    - the counters (`hurryAllowed`, `strikeRingOn`): on a trip `meta.runs` is read as the evening, `run.evening` (evening 1
      shows the ring and refuses the hurry; evening 2 allows it). The built expressions stay for every other run.
    - a read-only API entry `waterAt({x, z}) → {giant, waterKey, placeId}` (`waterInfo` plus the key), for T30 and the D
      scenario. Additive; no built entry changes.
    - **F16, only if the lead rules "build" (PLAN CHOICE 1):** a passed Prize or bigger (`letItPass` with `S.sizeClass` ≥
      prize, not a legend) sets `S.linger = {sp, z, waterKey: S.cast.waterKey, until: t + 45}`; `fishLinger()` returns it;
      the next cast within 45 s at any water bites at once with that species and z, and its `fishing:bite` carries
      `waterKey: S.linger.waterKey`; the linger clears on that bite, at 45 s or at `run:end`. With the ruling "drop" (the
      default) none of this is built.
13. **survival.js** (`const loopRun = (run) => !!run && run.outing === 'trip' && D().LOOP_ENABLED === true`):
    - `hushFor` (205) → 0; `v3PhaseDuration` (210): calm `LOOP.evening.day` (40), dusk `LOOP.evening.dusk` (20), gloomtide
      `LOOP.evening.night == null ? Infinity : night`, tested with `== null` and **never through `num()`** (`num(null, d)`
      returns `d`).
    - `getPhaseInfo` (335): on a trip's night `duration Infinity`, `time` unclamped, `remaining Infinity`, `open: true`,
      and `k = min(0.85, time / LOOP.evening.nightLook)` (the look reaches the full night and never starts the dawn fade at
      k ≥ 0.88; **PLAN CHOICE 6**).
    - `getPhaseDurations` (360): `{calm: 40, dusk: 20, gloomtide: null, dawn, total: null, hush: 0, open: true}`.
    - `duskForecast` (478) returns at once.
    - `simulateV3` (1050): after the clock, `T.oilRate = T.satRate = 0` and return (no drain, `checkLantern`, gutter, snuff,
      lamp-watch, `lowEdges`).
    - `damage` (754) returns 0; `die` (845), `snuff` (596), `embersZero` (712) are no-ops under `PARKED.death`; `wellFedOf`
      (301) false under `PARKED.hunger`.
    - `update` (1302): also skip `simulate` when `loopRun(run) && ctx.fishing?.inShow === true` (the freeze from T0).
14. **combat.js / combat-levels.js**: `const parked = () => D().PARKED?.combat === true && (C.run || ctx.state.run)?.outing ===
    'trip'`. `update` (1360): if parked, `clearAll()` once and return. `onPointerDown` (710) and `flare` return false.
    `addXp` (1746), `addXpV3` (1467), the `fish:landed` handler (1631) and `combat-levels.addXp` (174) return under
    `PARKED.levels`; `offerBanked` returns null. `combat-modes.js` needs no edit (`modeOf` maps outing `trip` to
    `run.nightMode`, `still`).
15. **player.js** (rev. 4) `glide(path, {duration, onLine, skippable, v0, kind = 'glide'})`: the one additive option, passed
    through to `startGlide` (base:648–654 hard-codes `'glide'`); every built caller passes none and is unchanged. The loop's
    glides pass `'home'` (the hand-off and the sail home) and `'sailOut'`. `update` (589): the glide also steps in flow `home`: `if (V3() && (ctx.flow === 'hub' || ctx.flow ===
    'home')) { if (dt > 0 && glideS) glideStep(...); else if (coveMode) simulate(...); if (ctx.flow === 'hub')
    updateInteractHub(); return; }`. The hub path stays byte-identical. On a trip (`run.outing === 'trip' &&
    D().PARKED?.tolls`), `interactable` is null for the gate and for Murk's barge and `interact()` returns false (626).
16. **world.js** `moodTargets` (M:275; on `gw-intro`'s version, which adds an `introMood` branch): a branch **after
    `introMood` and before the title clause** (which also catches `!run`): `else if (LOOP_ON && ctx.flow === 'home') { n =
    0.88 * (1 - smoothstep(0, 0.9, 0.5)); w = 0.6; }` (the built dawn look at its midpoint: "the sky pales to dawn"; **PLAN
    CHOICE 7**). `isTitle` (M:319) is false in flow `home`.
17. **Debug hooks** (main, `debugEnabled()` builds only): `ctx.debug.loop = {state: () => ctx.progression.loop?.state(),
    giveClams: (n) => ctx.progression.loop?.debugGive?.(n), bites: (key) => ctx.progression.loop?.bitesSpent?.(key), home:
    () => game.goHome(), sail: (w) => game.sail({water: w})}`. Main never writes `meta.loop` itself.
18. **The home flow's camera, look and sound** (each a guarded branch; the built paths are unchanged):
    - `render.js` `pickMode` (M:536): after the `introCam` line, `if (LOOP_ON && ctx.flow === 'home') return 'sail';` (the
      sail framing follows the raft, which the glide moves). The `zone:change` listener (M:1231): `if (intro || sail)
      return;`.
    - `water.js` (M:1146): the ambience also runs in flow `home` under `LOOP_ON`.
    - `audio.js`: `autoMood` (M:346) returns `'hub'` for flow `home` under the loop (a built mood in `V3_MOODS`), before
      its `flow !== 'playing'` line; the water bed (M:934, 941) also runs in `home`. `audio-v3.js` `zoneSting`: `if (p.sail)
      return 'setout';` first. For T56, the `home` choice is a pure helper in `audio-v3.js` (`loopHomeMood(flow, loopOn)`)
      that `autoMood` calls, so node can test it.
19. **The gate is scenery** (the facts' reference): item 15's player line (`interactable` null, `interact()` false on a trip).
20. (rev. 3) **`game.beginIntro(opts)` under `LOOP_ON`** (the New Descent's Start; flag-off and v3 keep the built one-liner):
    `if (game.hasSavedRun() || ctx.flow !== 'title') return false; const id = data.loopWickId(opts.character);
    ctx.progression.loop?.setWick?.(id); ctx.actors.setCharacter?.(id);` (the film uses the real player Wick, and actors
    re-apply a look only on `run:start` and flow `title`, so it holds through `intro` into `home`); then
    `if (filmAllowed({intro: !!ctx.intro && !!INTRO, debug: debugEnabled(), optIn: ctx.intro?.state?.optIn === true}) &&
    startIntro({replay: false, reduced: opts.reduced})) return true;` else (no film, or it could not start)
    `ctx.ui.closeAll?.(); enterHome('new'); return true;` (PLAN CHOICE 34). `onIntroDone` is unchanged: its
    `startNewRun({…, __intro: true})` is `enterHome('intro')` and ignores `opts.character`.
21. (rev. 3) **`game.loopFresh()`** = `LOOP_ON && loopFreshSave(ctx.state.meta, game.hasSavedRun())`; the title reads it
    (§2.3 item 5). `introPending` stays for the flag-off and v3 titles. The INTRO LANE B header comment (main.js:315) and the
    `INTRO.trigger.bypasses` note gain one line each: "under the loop the trigger is New Descent → Start".
22. (rev. 3) **`loop-rules.js`** gains (pure, T62–T64): `loopFreshSave(meta, hasSavedTrip)` and `filmAllowed({intro,
    debug, optIn})` (`intro && (!debug || optIn)`: a debug build plays the film only after the opt-in, as `gw-intro` built).
    (rev. 4) `loopWickId` and `sailPlan` are `data.js`'s (S2), not here. **`pressAction`** in `home`: a tap during a `home` or
    `sailOut` glide skips it (main teleports to the path's end: `skipGlide` moves the raft only for a glide with an
    `onLine`); nothing reaches the tutorial from main (the Jetty's taps are the UI's).
23. (rev. 3) **player.js**: the `zone:change` listener (579) does not respawn on `{sail: true}` under the loop (`statsCache =
    null` still runs); the `home` flow steps the glide (item 15). **Debug** (item 17): `ctx.debug.loop.tutorial(step |
    'reset' | 'done')` and `ctx.debug.loop.wick(id)` (via `ctx.progression.loop`), for D.
24. (rev. 4) **The first film abandoned to the title** (PLAN CHOICE 46): `leaveIntro` (base:371) under `LOOP_ON`, when the
    film was a first play (`!introFlow.replay`, read before it is reset), calls `ctx.progression.loop?.setWick?.(null)`
    before `setFlow('title')`, so the title is fresh again (New Descent, not Continue) and a `pagehide` save writes
    `wick: null`. `failIntro` is unchanged (it hands over through `onIntroDone`, as built).
25. (rev. 6) **The catch show's four leftovers** (QUEUE's backlog for job 9; found on the show's merge, 15 November 2026):
    - **The grade under a replayed film**: `render.js` eases `trophyK` toward the trophy grade while `showCam.w > 0.5` even
      when the film's camera is set, so a Prologue started straight from a show's card opens with the trophy vignette and
      saturation for about 2 s. The film owns the grade as it owns the lens: while the film's camera is set, `trophyK` eases
      to 0. Test: a Prologue from an open card shows no trophy grade from its first frame (`intro-show-seam`).
    - **The card's stamp under the film**: a card closed before its stamp still emits `card:stamp` next frame, and
      `audio.js`'s handler has no flow guard, so a seal and its duck can sound under the film's first frame. The handler
      plays only in flow `playing` (or `home`), and the card drops its stamp when its panel has left the play. Test: no
      `card:stamp` sound in flow `intro`.
    - **A trial completing on a catch rings inside the show** (`challenge_complete`, `unlock`; v3 without the loop, since the
      loop parks challenges): the sounds are held with their toasts until the card. Test: none of the two in the show's
      window of `show-seq`'s audio log.
    - **The show's sound mix, its measured faults** (`tools/out/show-merge` on `gw-show-merge`; the offline render,
      `node tools/audio-render.mjs --set=show`): the present must be the loudest beat of each show (today the caught
      instant's chime, splash and haul are); an Elder's card must not out-shout its show (three class chimes at −2.9 dBFS, the
      black-wax stamp the loudest sample at −1.5): no card sound above its show's present, the master's peak ≤ −1.0 dBFS; the
      Small's cord ticks ≥ 6 dB over the bed; no hush rise on the card's first frame (the lake rise's gulp: the hush waits
      for the card); the unfold gets its own sound (`ui_unfold`, in place of the generic `ui_open`). These are gates on the
      render's numbers; the by-ear mix of every class is M1 step 6's.
    - (rev. 7, `M1.md` revision 2) **They are v3 fixes too, and the one sanctioned flag-off change** (`M1.md` §2.15): all four
      happen in the v3 build today, so they are not gated by `LOOP_ENABLED`. Lane B's first commit captures `show-seq`'s
      sound log as a committed fixture (`tools/tests/fixtures/show-seq-sound.json`), so the offline render runs as
      `node tools/audio-render.mjs --set=show --log=tools/tests/fixtures/show-seq-sound.json` with no film run; the fixes'
      commit re-baselines `show-seq`'s audio expectations and `intro-show-seam` for these four alone (the diff listed in the
      merge note) and re-writes the v3 fingerprint only for the `ui_unfold` entry.
26. (rev. 6) **The film's line 3** (SPEC §0 row 16, `LORE.md` §12): under the loop the third line is "Its last candles fish
    from lamp to lamp." (40 characters), set in `data.js`'s apply block (A writes the line, §2.1 item 15; B owns the
    film's behaviour and its checks). The v3-without-loop film keeps "Its last candles fish to stay lit." (its fingerprint
    and `intro-flow` are unchanged). Its timing `INTRO.lines[2]` stays `{at: 12.5, out: 14.85}`: 40 characters in 2.35 s is
    17.0 a second, under the film's 17.5 rule (A5). B runs `intro-length` and the A5 words test with the loop on; if either
    fails, or the line takes two rows at 390 px and its box leaves the words band, `out` moves later by at most 0.15 s
    (the raft must still be clear of the band, `intro-shots`), never `at` (the `below` beat ends at 12.4 s). The new
    cut-scene video with this line and its sound is M1 step 6's, not 1a's.

### 2.3 Lane C: the screens

**Owns:** new `src/ui-loop.js`, `src/ui.js`, `src/ui-hud.js`, `src/ui-hud-v3.js`, `src/ui-screens.js`, `src/ui-icons.js`,
`src/ui.css` (a marked block at the end), new `tools/tests/ui-loop.test.mjs`; (rev. 3) new `src/loop-tutorial.js` (the
tutorial's pure beat machine), new `tools/tests/loop-tutorial.test.mjs`, and in `src/ui-intro.js` (`gw-intro`'s file, in no
other lane) the two functions `takeTitle` and `dropTitle` only (item 9).

**Work.** Every branch is behind `const loopOn = () => D().LOOP_ENABLED === true` (and `run()?.outing === 'trip'` on the
water). The words are `TEXT_LOOP`'s, read directly (`D().TEXT_LOOP.home`): S delivers them, so C has no stub literals and
the stager has nothing to swap.

1. **ui.js**: create `loopView = D().LOOP_ENABLED === true ? createLoopView(K) : null` after `K.hud = hud` (the pattern
   `gw-intro` uses for `introView`); `loopView?.update(dt)` at the end of `update()`; `api.loop = loopView`; `api.isCatchOpen = () => has('catch')` (beside
   `isShopOpen`, base 909; main's `canGoHome` reads it). Under the loop:
   `handleKey` (M:850) on a trip swallows `KeyC`, `KeyR` and `KeyB` (returns true, does nothing, says nothing: no built
   creel, no Burn-a-fish, no bait cycle); tips (`TIPS`/`TIPS_V3`), the merchant greet, **every phase banner** (dusk, night,
   dawn) and, on a `zone:change {sail: true}`, the area banner and the lake's lore toast are suppressed (**PLAN CHOICE 8**,
   revised: §8 is the whole text; rev. 3: except `fe_cast` and `fe_strike` on evening 1, which ui-loop shows itself, item 8).
   The `flow:change` listener (M:689) also closes `jetty | tally | shelf | chart` on
   `'playing'`. `gw-hints` (M:917) reads the evening on a trip (`run.evening <= 1`), the built `meta.runs` otherwise. The
   HUD is shown in `playing` only, as today.
2. **ui-loop.js** (new), `createLoopView(K)`: the hold row, the Home pill, the Jetty, the tally, the shelf, the Chart, Murk's
   lines. Pure exports for node: `slotCells`, `tallyPlan`, `goalLine`, `shelfCards`, `murkLineFor`, `clamTag` (uses
   `core.fmtClams`).
   - **The hold** (§3.1, §8.1): a `.gw-hold` row appended into `.gw-tl` (ui-hud.js:22): `loop.hold().slots` cells (rev. 6:
     the Wick's count, Tallow one more; the view never tests the Wick); a kept fish is a
     `drawFishInk` canvas (~34×20) scaled by class (Small 0.7 … Elder 1.2), gold-edged (`--gold` drop-shadow) for an epic or
     legendary fish. Data: `ctx.progression.loop.hold()`. Repaint on `fish:action` and `run:start`; shake on
     `loop:holdFull`.
   - **The Home pill** (§8.1): `<button class="gw-pill gw-home" data-loop="home">` in `.gw-actions` (ui-hud.js:67),
     min-height 56 px, word `TEXT_LOOP.home`. Press and hold 0.6 s: **a ring of ink fills the pill**, as the spec says: a
     thin circular stroke drawn inside the pill's own bounds, swept 0 → 360° by a CSS `conic-gradient` mask on `--k`
     (0 → 1). It is a button's progress mark, in the HUD layer; nothing is drawn around the raft or the Wick. With a full
     hold a tap is enough and the pill has `.gw-pulse`. Hidden (opacity 0, no pointer events) while
     `!ctx.game.canGoHome().ok`. `pointerdown` goes through ui-hud's `tapGuard` (`preventDefault` + `stopPropagation`, so the
     host never starts a cast charge); the hold is timed from it and ends on `pointerup` (→ `ctx.game.goHome()` when ≥ 0.6 s,
     or on any tap with a full hold) and `pointercancel` (nothing). The timer is a pure helper, `pillHold(t, full)`.
     Keyboard: a held `H` (0.6 s), a tap of `H` when full (**PLAN CHOICE 9**).
   - **"Hold's full."** (§3.1, §8.1 "on a cast"): on `loop:holdFull {via: 'cast'}` only, one `'bad'` toast
     `TEXT_LOOP.holdFull` (rate-limited by the existing `recentToast`) and `.gw-pulse` on the pill. `{via: 'keep'}` shows
     nothing (the card's Keep is already dimmed).
   - **The Jetty** (§8.3, §6.1): `openModal('jetty', …, {screen: true, blocking: false, onEscape: openHomePause})` (rev. 4,
     the lead's ruling 12: Esc opens the home pause, item 10; it never closes the Jetty, so the player is never at home
     with no screen) on `home:enter` when there is no
     unseen tally, else after Sold. A purse top-right `${icon('clam')}<b>${fmtClams(clams)}</b>`; three tiles in the
     `.gw-mode` card style, one word each, `data-tile="murk|chart|journal"`: **Murk** (the shelf), **Chart**, **Journal**;
     one goal line `Next: {name} · {price}` from `ctx.progression.loop.goal()` (none → no line); Murk's one line when due.
     Desktop 960×540: tiles in a row in the lower third. Phone 390×844: a column in the lower half, each ≥ 56 px, 16 px
     gutter, the purse under `--sat`.
   - **The tally** (§8.3): `openModal('tally', …, {dismissable: false, onEscape: skipToEnd})` on `home:enter {tally}` (after
     `run:end`'s `closeAll`) or at the Jetty when `loop.lastTrip()` is unseen (a reload). **Murk's scale**: one ink drawing
     (a beam and two pans, `ui-icons` style) at the top of the sheet; each fish, a small ink fish, settles onto the pan as its
     row counts up. Rows from `tallyPlan(tally)`: (rev. 6, pounds) ascending by the weight the card showed (lightest first,
     heaviest last; two that read the same go by clams, then in the order caught), giants and legends last, a giant alone with a longer pause; the name small with its weight beside it
     (`fmtWeight`, stored with the result by `endTrip`), the value counting up with one `sfx('coin')` (rev. 6: a Wick's first
     ticks twice, its base then its sale, with `sfx('coinBright')` and the seal glyph, from the row's `{base, clams, first}`); then the total `+N` in gold; one button **Sold**
     (`data-action="sold"`). A tap, Enter or Esc skips to the end; a second tap or Enter presses Sold (Esc never does). An empty hold: Murk's line `TEXT_LOOP.murk.empty` and **Sold** (**PLAN CHOICE 10**). Sold →
     `loop.markTallySeen(id)`, close, open the Jetty. The tally never pays.
   - **The shelf** (§8.4): `openModal('shelf', …, {onEscape: backToJetty})` from the Murk tile; its own render (never
     `renderShop`). The Murk head (`murkPortrait`, the purse, and a `.gw-murk-line` that is **empty** unless a §8.6 once-line
     is due; no built `murkSay` or `MERCHANT_LINES_V3` line ever fills it). Tabs from `loop.shelf()`: only tabs with an item
     show; in 1a **Tackle** (rod, line, reel) and **Raft** (the hold) (**PLAN CHOICE 11**). A card: a drawing, the name, the
     one line, a price button `clamTag(price)` (`data-buy="hold:4"`, `"rod:1"`, …). Too dear: the price dimmed
     (`.gw-dear`), no other words. **Bought (PLAN CHOICE 26):** a card bought while the shelf is open stays in its place
     reading **Yours.** (disabled) until the shelf is closed; the next step appears on the next open. The last step a 1a
     shelf offers in a slot (Hold 5; T2 of a rod, line or reel) keeps a permanent **Yours.** card. Under Tackle a small
     **Odds ›** → `screens.openTackle()` (the gear log). A buy → `loop.buy(id)` → re-render with the shelf's session list.
   - **The Chart** (§5.4 slice 1a): `openModal('chart', …, {onEscape: backToJetty})` from the Chart tile: one row per lake in `meta.loop.maps.lakes`
     (1a: the Mossmere, its open water preselected), the hold's empty slot row under it, one primary **Sail**
     (`data-action="sail"`) → `ctx.game.sail({water: 'mossmere', place: null})`. Murk's departure line above Sail: (rev. 4)
     while `loop.tutorial?.()?.done !== true` it is the tutorial's (`cue().line`, item 8), shown on **every** Chart open
     before the first Sail, and `sayOnce('firstChart')` is not called; `said.firstChart` is written by `tutorialDone()` at
     the first Sail. After that the Chart has no line (it has been said). One owner, so neither a double line nor a lost one.
     (rev. 6) The line is `murkLineFor('firstChart', wick)`: `TEXT_LOOP.murk.firstChartBy[wick]` when it exists (Tallow's
     "Four slots in that hold. Fill them and come home."), else `firstChart`. The Chart renders a new pure export,
     **`chartModel(meta, D, {tutorial})`** (beside `slotCells`; SPEC §5.4, `M1.md` §3.8): in 1a one sheet (the Mossmere,
     open water chosen, no places), no `next`, `hold.slots` from `loop.hold().slots`. M1 step 3's drawn Chart draws the same
     model, so the row keeps `[data-water=mossmere]`, its cells `.gw-slot` and Sail `[data-action=sail]`, and T65 does not
     change. No Sporewood row in 1a (the tutorial's Chart holds one water and one line).
     (rev. 3) A Sail press disables Sail at once (the glide out runs behind it, §2.2 item 4).
   - (rev. 3) **The tutorial on the Jetty and the Chart** (item 8): on `home:enter`, when `loop.tutorial?.()?.done !== true` (rev. 4: a null record reads as not done; B's `enterHome` has already begun it),
     `tutorial.start({from})`. The Jetty reads `tutorial.cue()`: the Chart tile gets `.gw-cue`, Murk and Journal `.gw-dim`
     (still live), the goal line is not drawn, `.gw-murk-line` shows the wake line (`TEXT_LOOP.murk.wake`). A tap on the
     sheet outside a tile → `tutorial.tap()`; the Chart tile → `tutorial.onTile('chart')` then the Chart. The Chart under
     the tutorial: the hold's slot cells (three; four for Tallow, rev. 6) start empty and ink in `LOOP.tutorial.slotInk` s
     apart as the departure line appears;
     Sail has `.gw-cue`; its `onEscape` also calls `tutorial.onEscapeChart()`; Sail → `tutorial.onSail()` then
     `ctx.game.sail(...)`. `tutorial.update(dt)` runs in `loopView.update` on real dt, and the machine's clock only moves
     while the top modal is `jetty` or `chart`. When the machine asks for the Chart (`tutorial.wantsChart`), ui-loop opens it
     as the tile would.
   - (rev. 3) **The first trip's two words** (PLAN CHOICE 39): on evening 1 (`run.evening === 1`), `fe_cast` as one `'tip'`
     toast `LOOP.tutorial.castTipAfter` s after `run:start` while `fishing.state === 'idle'` and `!seenTips.fe_cast`, removed on
     `fishing:cast`; `fe_strike` (`K.isTouch ? touch : desktop`) as a short `'tip'` line on the first `fishing:bite` of
     evening 1 while `!seenTips.fe_strike`, removed on `fishing:strike` or `fishing:miss` (shown directly, not through
     `updateTips`, which refuses during a bite). Each marks `meta.seenTips`. Nothing else is said on the water.
   - **Murk's lines** (§8.6): `murkOnce(id)` = `loop.sayOnce(id)`; at the Jetty or the Chart in `.gw-murk-line`; on the water
     as one `'lore'` toast after the card closes (toast already holds flavour behind modals and the show). In 1a: `firstChart`
     (at the Chart: the tutorial's, see the Chart above), `firstSale` (after the first non-empty Sold), `firstQuiet` (the first `view.favour.bitesLeft
     === 0` on the water), `firstLetGo` (after the first let go), `firstTrophy` (after Sold on a tally with a Trophy or
     bigger), `sailOut` (rotating, one per Sail from evening 2, as a lore toast at `run:start`).
3. **ui-hud.js** under `.gw-hud.gw-loop` (set by ui-loop): CSS hides `.gw-cluster`, `.gw-xp`, `.gw-tl2`, `.gw-clock`,
   `.gw-st-shells`, `.gw-st-creel`, `.gw-st-bait`, `.gw-streak`, `.gw-act-row`, `.gw-status`, `.gw-wf`, `.gw-vig-low`,
   `.gw-vig-dark`. `update()` skips `buildClock` and the clock paint (a null night must never paint NaN) and the oil,
   satiety and flare reads; `gatherTargets` (303) drops the merchant and gate markers; the interact pill
   (`.gw-pill:not(.gw-home)`, "Descend" / "Trade") is hidden. Kept: `.gw-st-journal` (locked while a line is out, built),
   `.gw-hb-pause`.
4. **ui-hud-v3.js** `paintFavour` (339): a `<span class="gw-fav-dots">` row under the notches when `typeof F.bitesLeft ===
   'number'`: `min(9, bitesLeft)` ink dots ≤ 6 px; a spent dot fades, a re-lit one inks in (`gw-ink`); `bitesLeft === 0` →
   `.gw-dim`. With `F.bitesLeft` present: no band word (`favSay` blank; "gone quiet" is gone), no Pressure family in the
   long-press list. `favourBand` is untouched.
5. **ui-screens.js** (written on the merged file: `gw-show`'s `showCatch`, `gw-intro`'s `showTitle`):
   - **`showCatch`** (gw-show:666): `const loopCard = loopOn() && run()?.outing === 'trip'`; under it the foot holds two
     buttons only: **Keep** (`key '1'`, `action 'keep'`, primary, label `Keep <em data-to="${V}">${icon('clam')}
     ${fmtClams(V)}</em>`, V = `p.clams ?? loop.priceOf(fish)`; disabled with no words when `p.holdFull`) and **Let go**
     (`key '2'`, `action 'letgo'`, autofocus when Keep is disabled). Gone: the weight row (`<dt>weight</dt>`: (pounds) `gw-pounds` already dropped it from the v3 card, whose hero is the
     weight in pounds and whose list opens with the one small `length` line in cm; the loop card keeps that hero and that line as built, and shows no kg), the worth row (gw-show:717), the Strike row (its home in the Journal is
     the built "Your odds" block's strike note: **PLAN CHOICE 25**) and the favour row, `.gw-catch-full` and the room list
     (gw-show:757), Eat, Render, Release, the banked pick. A giant: a gold ★ before
     `.gw-catch-name` and the class stamp in gold (`.gw-cc-giant`, the gilded wash). The count-up reads `data-to` (the old
     `/\+(\d+)/` parse stays for every other card) and starts at `gw-show`'s delayed t0 (after the stamp press). `onKey` map
     `{Digit1: 'keep', Digit2: 'letgo', Numpad1, Numpad2}`; Digit1 and Numpad1 do nothing while Keep is disabled. The unfold, the ruler, the knots, the count (pounds: the weight counting up, driven by the length as `gw-pounds` built it) and the stamp
     are `gw-show`'s, untouched. `doFishAction(fish, 'letgo')` shows no lore toast.
   - **`showTitle`** (M:301; rewritten in rev. 3, PLAN CHOICEs 12 and 33): one loop branch right after `nav` and `add` are
     defined and **before** the built `if (hasRun)` (M:332), so neither the built Continue nor the intro's Begin block runs
     under the loop. It hides `.gw-tagline` (§5.4) and removes `.gw-title-premise` and `.gw-title-meta`. Then:
     `if (ctx.game.loopFresh?.() === true)`: **New Descent** (`TEXT_LOOP.newDescent`, primary, autofocus) →
     `openNewDescent()`, a quiet **Settings** → `openSettings({titleChild: true})`, `prewarmIntro()` (built; the film's stage
     builds under this title), return. Otherwise: **Continue** (primary, autofocus, no sub-line) → `K.closeAll();
     ctx.game.hasSavedRun() ? ctx.game.continueRun() : ctx.game.toHome()`, a quiet **Settings**, and, when
     `ctx.game.introReplayOffered() === true`, the built quiet **Prologue** button in `.gw-title-lower` (the same code as
     M:349–357); return. Never Begin, Journal, Shrine or Trials, never a "Day N" sub-line. The fresh branch keys on
     `loopFresh`, never on `introPending` (false in a debug build without the opt-in). A pure `titleModel({fresh, trip,
     replay})` → the word list, for T62.
   - (rev. 3) **`openNewDescent`** (M:379): first line `if (loopOn()) return openLoopDescent();`. `openLoopDescent` is a new
     closure beside it: `K.openModal('newdescent', render, {state: {sel: ctx.progression.loop?.wick?.() ?? 'wick'},
     onEscape: () => K.closeModal('newdescent'), onKey})`. The render: `panel(entry, body, {title: '', sub: '', cls: 'gw-p-wide
     gw-p-descent gw-loop-descent'})`; a `.gw-chars` row of the five ids in `LOOP.wicks.order`, each `button.gw-char
     [data-wick=id]` with `wickPortrait(CHARACTER.look)` and `CHARACTER.name` (`.gw-on` on the selection); under it one
     `<p class="gw-loop-trait">` with `TEXT_LOOP.wicks[sel]`; the foot: **Back** (`TEXT_LOOP.back`, closes the panel) and
     **Start** (`TEXT_LOOP.start`, `data-action="start"`, primary, flame icon, autofocus) → `ctx.game.beginIntro({character:
     s.sel})`, with **no** `K.closeAll()` first (ui-intro holds the panel, item 9). (rev. 4) The `panel()` call passes
     `close: false` (the built default draws a ✕; Back and Escape close the panel), so the screen has exactly the Wicks, one
     line, Back and Start. It never calls `characters()`,
     `challenges()`, `modeCards`, `nightsStep`, `ratingFor` or the waystones; no `.gw-locked`. `onKey`: ← → (and A D) move the
     selection, Digit/Numpad 1–5 pick, Enter presses Start. A pure `descentModel(D, sel)` → `{cards: [{id, name}], line,
     words}` for T59. The built panel is untouched off the loop.
   - (rev. 3) **Settings' Forget everything** (base:1520–1521, M:1586–1587): under `loopOn()` the row's small line is
     `TEXT_LOOP.forget.row` and the first confirm's sub-line `TEXT_LOOP.forget.confirm`; the confirms stay the in-page
     `confirm()` modal (M:209), never `window.confirm`. (rev. 4, **PLAN CHOICE 43**) Also under `loopOn()` in
     `openSettings`: no **Damage numbers** row (combat is parked), no sub-line under **Reduced flashing**, the strike-ring
     segment's `firstExpedition` label reads `TEXT_LOOP.settings.ringFirst` ("First evening"), and the **Hold to hurry**
     row's line reads `TEXT_LOOP.settings.hurry`. Every other row, and the whole panel off the loop, is as built (T74).
   - **`openPause`** (M:1595): under a trip the panel has **no title and no sub-line** (no "The Water Waits", no day, level
     or Wick), and the menu is **Resume** (primary), **Home** (dimmed with no words while
     `!ctx.game.canGoHome({fromPause: true}).ok`; else close the pause, `resume()`, `ctx.game.goHome()`), **Settings** (the
     built settings, §8.5). No Journal, Trials or Title quick links, no Abandon, no boons list (**PLAN CHOICE 12**).
   - **`openJournal`**, the species page (M:1345): under `loopOn()` the "First" cell reads `Evening {entry.firstEvening}`
     (or "—"), with no "Day" and no descent clause; the built text stays off the loop (SPEC §3.4, §10 "Evening N").
   - **`openDescend`** (M:1639) returns at once while `loopOn()` (the gate is scenery).
   - Export the closures `panel`, `btn`, `tabs`, `fishCanvas`, `murkSay` additively as `parts` in the return object
     (gw-show:1781), for ui-loop.
6. **ui-icons.js**: `ICONS.clam`, a closed bivalve on the 24 grid (two valves and a hinge line, `currentColor`), distinct
   from the Shells fan.
7. **ui.css**: one block at the end, `/* >>> LOOP 1a */ … /* <<< LOOP 1a */`, every rule under `.gw-loop` or a loop-only
   class. It must not fight `gw-show`'s `.gw-cc-live` stamp and hero animations. (rev. 3) `.gw-loop-descent` (desktop: cards
   128×164 in one centred row, gap 16, the trait line 16 px under it; phone ≤ 480 px (rev. 4, CHOICE 42): the panel in the
   lower half, the cards a 3 + 2 grid of 104×128 with 12 px gaps (336 px of the 358 px inside the gutters; the second row
   centred), names wrapping to two lines and never truncated, the foot's buttons ≥ 56 px above `--sab`);
   (rev. 4) `.gw-loop-pauseglyph` (the Jetty's quiet pause glyph, the built `.gw-hb-pause` look, ≥ 44 px, top-left under
   `--sat`); `.gw-cue` (a soft ink breathe of opacity and brightness
   inside the element's own box, 1.6 s; under `prefers-reduced-motion` or the game's Reduced motion setting a static gold
   edge); `.gw-tile.gw-dim` (opacity 0.55, still clickable); the slot cells' ink-in. Nothing is drawn in world space.
8. (rev. 3) **`src/loop-tutorial.js`** (new, pure: no THREE, no DOM): `createLoopTutorial({bus, loop, data, now})` →
   `{start({from}), update(dt, {top}), tap(), onTile(id), onEscapeChart(), onSail(), step, isActive(), cue() → {tile:
   'chart' | null, sail: boolean, dim: boolean, line: string | null}, wantsChart, state}`. Beats `arrive → wake → chart →
   out` (`arrive` is main's glide: the machine starts at `wake` on `home:enter`). Times from `LOOP.tutorial`; Murk's hold
   from `murkHold` imported from `./first-evening.js` (a pure export; the module has no top-level side effects, and its
   `create` is never called). It emits `firstEvening:line {kind: 'murk', key, text, hold, loop: true}` (audio's built
   grumble, audio.js:1239) and `loop:tutorial {step, prev}`; never `firstEvening:step`; never touches fishing. It writes the
   save only through `loop.setTutorialStep` and `loop.tutorialDone` (the latter from `game.sail`, §2.2 item 4; `onSail`
   only ends the machine). ui-loop creates it only when `LOOP_ENABLED`. Tests: `tools/tests/loop-tutorial.test.mjs` (T65),
   with a fake bus and `fakeLoop`. (rev. 4) Two rules: the wake's self-opening of the Chart fires **at most once** per
   start (`state.autoOpened`); after `onEscapeChart()` it never fires again and only the tile's cue remains. In the chart
   beat `cue().line` is `murkLineFor('firstChart', wick)` (rev. 6; read directly, never through `sayOnce`) every time the Chart is the
   top screen, so a reload or an Escape never loses the line. The clock moves only while the top modal is `jetty` or
   `chart` (so `homepause`, `settings`, `shelf` and the Journal hold it).
9. (rev. 3) **`src/ui-intro.js` `takeTitle` / `dropTitle`**: `takeTitle` also holds an open `newdescent` entry the same way
   it holds `title` (`K.closeModal('newdescent', {hold: true})`, its element kept with the title's), and `dropTitle` removes
   both; with no `newdescent` open the functions behave byte for byte as built. So at Start the panel stays standing, inert,
   until the opening ink is full (T71). (rev. 4) The `newdescent` hold is behind `D().LOOP_ENABLED === true`: off the loop
   (v3 without the loop, and flag-off) `takeTitle` and `dropTitle` are exactly as built, even if the built New Descent panel
   is open when a film starts (T70).
10. (rev. 4) **The home pause** (`ui-loop.js`, `openHomePause`; the lead's ruling 12, PLAN CHOICE 45): `openModal('homepause',
   …, {onEscape: close})` drawn with ui-screens' `parts.panel(…, {close: false})`, no title and no sub-line, the menu
   **Resume** (primary, autofocus: closes it) and **Settings** (`screens.openSettings({pauseChild: true})`, whose Done comes
   back here). It opens from the Jetty's Escape and from the Jetty's quiet pause glyph (`button[data-loop=homepause]`, the
   built pause glyph, no word, top-left), the phone's only way to Settings at home. It is not offered during a home glide
   (no screen is up then; a key skips the glide, §2.2 item 8). The built `openPause` stays `playing`-only (T73).

### 2.4 Lane D: the scenario and the visit home

**Owns:** new `tools/tests/loop-1a.scenario.mjs`, new `tools/tests/loop-time.scenario.mjs`, `tools/scenario-run.mjs` (one
dispatch line: `--scenario=loop-1a`).

D writes against the seam (§3: DOM hooks, `window.__gw`, `ctx.debug.loop`) and does not run a browser in its worktree. The
stager runs both scripts on the merged build (§6).

- **loop-1a.scenario.mjs** (T31, T32, T36, T43, T44, T46, T50, T56, T57; rev. 3 also T59–T64, T66–T69, T71). **Rev. 3:
  the main pass starts from a fresh save** at `?loop=1` with no seed: `__gw.debug.intro('auto', true)` first and the title
  re-shown (a debug build plays the film only after the opt-in), then: the title shows exactly **New Descent** and
  **Settings** (T62) → New Descent → the panel (T59: five `[data-wick]`, the words, no `.gw-mode`/`.gw-ways`/`.gw-cd-row`/
  `.gw-locked`) → ArrowRight (Taper lit, its one line) and a click on `[data-wick=taper]` → **Start** (`[data-action=start]`): flow `intro` in the same task
  (T63), a screenshot 0.1 s later shows the panel under the ink (T71) → Skip → flow `home`, `getCameraMode() === 'sail'`,
  `player:glide {kind: 'home'}`, the raft at `docks[0]` after 3 s (T64) → the Jetty with the wake line, `.gw-cue` on
  `[data-tile=chart]`, Murk and Journal `.gw-dim`, no goal line → reload here once (Continue only, then the Jetty and the
  wake line again: T67) → (rev. 4) Esc on the Jetty: `homepause` with Resume and Settings, the tutorial clock still (T73);
  on `--mobile` the same through `[data-loop=homepause]`; Settings: no Damage numbers row, "First evening" (T74); back to
  the Jetty → tap Chart → the Chart: three empty `.gw-slot` cells, Murk's `firstChart`, Sail `.gw-cue` → reload here once
  (Continue, the Jetty, the wake, then Chart: the departure line again, T67) → Esc (the Jetty, the Chart cue; wait 10 s:
  the Chart does not open itself again, T65) → Chart → Sail: `meta.loop.tutorial.done` saved, `player:glide {kind: 'sailOut'}` in flow
  `home`, then flow `playing`, `run.character === 'taper'`, the raft at the glide's end (T66) → the `fe_cast` toast once
  (T68) → keeps 1–2 by `debug.instantCatch` (the first real bite shows `fe_strike`) → … A **second pass** with no opt-in:
  fresh save → New Descent → Start → no film: flow `home`, the tutorial at the wake, `meta.intro` unset (T63). A **third
  pass** after the main one: reload → the title shows **Continue** · **Settings** · **Prologue** and no New Descent; Settings
  → Forget everything → the two in-page confirms with the loop's words → a fresh title with New Descent (T69). The main
  pass then continues as revision 2 wrote it (the scenario takes `--wick=<id>` for the stager's step 4b; default
  `taper`): the Jetty (flow `home`,
  three `[data-tile]`, the goal line `Next: Hold 4 · 30`, the purse) → Chart → Sail → keeps 1–2 by `debug.instantCatch`
  then `[data-action=keep]` (the `em[data-to]` equals `loop.priceOf`) → keep 3 through the real path (`fishOutcome('land')`
  + `forceBite` + `fishStrike` + `fishPlayTo`, hurrying the show), with the press-and-hold checks of T50 at 1 of 3 (a 0.3 s
  press does nothing; a press while idle leaves fishing `idle`) → a 4th press is refused (`Hold's full.` toast,
  `.gw-home.gw-pulse`, fishing `idle`) → tap the pill → `openModal === 'tally'`, the clams delta equals the stamped sum
  (species and z chosen so the sum ≥ 30; rev. 4: the raft was moved near `docks[2]` before the Home press, and after the
  tally it is at `docks[0]`, T66) → Esc (the tally jumps to its end; Sold still there) → Sold → Esc on the Jetty
  (`homepause`; Resume → the Jetty, T57) → Murk tile → buy `hold:4` (its card reads `Yours.`, `holdSlots === 4`) → Esc (back at the Jetty) → Chart →
  Sail (`debug.ui().stack` empty; rev. 4: the glide out starts within 0.5 m of the raft, T66) → 4 empty cells → sail to the gate's centre (`world.getGate()`): no interact pill, E opens
  nothing, T43's scan there → open the pause (T43's scan) and the Journal's species page (T43's scan) → reload mid-trip →
  the title shows Continue only (no "New Descent", no tagline) → Continue → the hold, the bites and the raft's place
  restored. Screenshots at each step, desktop 960×540 and `--mobile` 390×844. Asserts `ctx.errors` empty, T43's word scan
  and its allow-list (the helper from ui-loop) on every screen.
- **loop-time.scenario.mjs** (T37): times each leg on a deterministic clock (`gw-show`'s `show-seq` rAF takeover): Home press
  → tally open, the tally per fish (3 fish, one giant-less), Sold → Jetty, Jetty → shelf → one buy → back, Jetty → Chart →
  Sail → `run:start`, and the glide. It prints `{home, sale, shop, out, show}` in seconds as JSON for the stager. (rev. 3)
  It also prints `tutorial` (from `intro:done` to `run:start`, with no taps and Sail pressed 2.5 s after the Chart opens;
  ≤ 45 s, T65's budget) and `sailOut` (Sail → `run:start`, the 3 s glide, which `LOOP.time.out` now includes).

### 2.5 Cross-file requests (the stager applies them after merging the owner)

The plan assigns every line above to the lane that owns its file, so no lane edits another's file. The table lists the
places where a lane **relies** on a neighbour's line; if the owner's branch arrives without it, the stager adds it in the
owner's file exactly as written here.

| needed by → owner | file · where | the line |
|---|---|---|
| D → B | main.js, the debug block | `ctx.debug.loop = {state, giveClams, bites, home, sail}` (§2.2 item 17) |
| D → A | core.js `HIDDEN_DEBUG_HOOKS` (base 200) | `'loop'` in the frozen list (beside `gw-intro`'s `'intro'`; in S) |
| D, A → B | fishing.js API | `waterAt({x, z}) → {giant, waterKey, placeId}` (§2.2 item 12) |
| B → A | progression.js `createLoop` | `loop.closeBite()` on `fish:measured`, `fishing:escaped`, `fishing:miss`; `getBitesLeft` on the API |
| C → A | progression-af.js `getLoadout` | the no-run branch under the loop reads `meta.loop.tackle` (§2.1 item 8) |
| C, D → B | player.js | `interactable` null and `interact()` false for the gate and Murk on a trip (§2.2 item 15) |
| C → B | main.js `startTrip` | `ctx.ui.closeAll?.()` before `setFlow('playing')`; `zone:change {prev: null, sail: true}` |
| C → B | main.js `game` | `canGoHome`, `goHome`, `sail`, `toHome`, `atHome` (§3.5) |
| C → B | fishing.js `refreshFloat` | `view.favour.bitesLeft` (number, trip only) and `view.favour.quiet` (§3.6) |
| C → B | main.js `enterHome` | `emit('home:enter', {from, tally})` **after** `run:end` (ui's `run:end` runs `closeAll`) |
| C → A | progression.js `measure` | `fish:landed` carries `clams` and `holdFull` on a trip |
| C → A | progression.js `restorePending` | `fish:landed {restored: true}` in a microtask after `run:start` |
| B → C | ui.js api | `isCatchOpen()` beside `isShopOpen` |
| B → A | progression.js `createLoop` | `loop.favour(key)`, `loop.bitesLeft(key)`, `loop.holdFull()`, `loop.endTrip()`, `loop.parkRun(run)` |
| B → A | progression.js module exports | `sellStrandedTrip` re-exported beside `migrateSave` (base 31), found by `moduleExport` |
| A → B | fishing.js `bite()` / `spook()` | `waterKey` on `fishing:bite` and on `fishing:miss {reason: 'spooked'}` |
| B, C, D → A | data.js, core.js, progression-loop.js, loop-fixture.mjs | everything in the seam commit S (§2.0); delivered before B, C and D branch |
| C → B (rev. 3) | main.js `game` | `beginIntro({character})` under the loop (item 20), `loopFresh()` (item 21); `introReplayOffered`, `prewarmIntro`, `toHome` as built or planned |
| C, B → A (rev. 3) | progression-loop.js | `wick()`, `setWick(id)`, `tutorial()`, `beginTutorial()`, `setTutorialStep(id)`, `tutorialDone()` (§2.1 item 15) |
| B → C (rev. 3) | ui-intro.js `takeTitle` | holds an open `newdescent` with the title (§2.3 item 9); without it the panel pops off before the ink (cosmetic only) |
| C → B (rev. 3) | main.js `game.sail` | `ctx.ui.closeAll` before the glide out; `run:start` only after it; `home:enter {from: 'intro' \| 'new' \| 'title' \| 'trip'}` |
| D → B (rev. 3) | main.js debug | `ctx.debug.loop.tutorial(step \| 'reset' \| 'done')`, `ctx.debug.loop.wick(id)` (§2.2 item 23) |
| B, C → A (rev. 4) | data.js (S2) | `loopWickId(id)` and `sailPlan(dock, centre, T, lake)` (§2.1 item 15); B's `loop-rules.js` keeps neither |
| C → B (rev. 4) | main.js `pressAction` / keydown | a tap, or a key in `INTRO.skip.keys`, skips a home glide in flow `home` (§2.2 item 8) |
| C → A (rev. 4) | progression-loop.js `tutorialDone` | also sets `meta.loop.said.firstChart = true` (the Chart's line is the tutorial's until then) |
| A, C → B (rev. 3) | player.js | `player:glide {state, kind: 'home' \| 'sailOut'}` on the two loop glides (rev. 4: through `glide`'s new `kind` option, §2.2 item 15); no respawn on `zone:change {sail: true}` |

---

## 3. The seam

Lanes code against these names now. A's data, core and pure-module names (§3.1, §3.2, the pure part of §3.3) exist from S,
so they are imported and read directly. **Stub rule (every lane), for the ctx objects that arrive with the other lanes**
(`ctx.progression.loop`'s methods, `ctx.game.*`, `ctx.ui.loop`, `ctx.fishing.waterAt`, `view.favour.bitesLeft`): read a
neighbour through optional chaining and a strict type test (`=== true`, `typeof x === 'number'`, `?.() ?? builtValue`); an
absent neighbour means the built behaviour, never a throw. In node tests, B and C build those objects with
`loop-fixture.mjs`'s `fakeLoop()` (A owns it, in S). `ctx.progression.loop` is `null` unless `data.LOOP_ENABLED`.

### 3.1 data.js exports (lane A)

```js
export const LOOP_ENABLED;            // V3_ENABLED && globalThis.GW_LOOP === true
export const PARKED;                  // frozen; {} off the loop; on the loop exactly these 31 keys, all true:
// swarm combat levels embers hunger oilAsLife nightModes death days farWater liveWell meta tolls longDescent challenges
// quality mercy passFavour baitAttract murkInLake runShop residents weather walking giantSpots watchLamps arrivalHush
// eatRender bounties firstCatchShells proofs
export const LOOP = {
  value: { perZ: 0.9, clamp: [0.4, 30], classBonus: { trophy: 1.25, elder: 1.6 },
           rarity: { common: 1, uncommon: 2.4, rare: 5.5, epic: 12 }, body: { ref: 45, exp: 0.5, clamp: [0.6, 1.6] }, legendRematch: 0.4 },
  hold: { start: 3, max: 8, shelfMax: 5,             // shelfMax: the 1a shelf stops at Hold 5 (PLAN CHOICE 11); raised in slice 2
          ladder: [ { slots: 4, price: 30, name: 'Lidded Creel' }, { slots: 5, price: 120, name: 'Double Creel' },
                    { slots: 6, price: 450, name: 'Wellbox' }, { slots: 7, price: 2000, name: 'Ferry Hamper' },
                    { slots: 8, price: 3500, name: 'Harbour Chest' } ], startName: 'Wicker Creel' },
  water: { good: { day: 2, old: 3, night: 2, crown: 2 }, openPerSlot: 1, openExtra: 1,
           stale: { favour: -0.15, floor: -1.2, wait: 0.3, waitMax: 2.2 } },
  letGo: { favour: 0.2, cap: 0.4, refund: 1 },
  evening: { day: 40, dusk: 20, night: null, nightLook: 90 },   // night null = no end (never read through num())
  hours: { day: ['calm', 'dusk'], dusk: ['dusk', 'gloomtide'], night: ['gloomtide'], 'day,dusk': ['calm', 'dusk'],
           'dusk,night': ['dusk', 'gloomtide'], any: ['calm', 'dusk', 'gloomtide', 'dawn'] },
           // the roster's hour strings only; a built string ('calm', 'gloom', 'dawn') keeps the built timeOk rule (PLAN CHOICE 24)
  tackle: { price: [0, 50, 300, 1200, 6000, 32000, 100000], extraHold: { rod: [15, 18], line: [16, 19], reel: [15, 18] },
            names: { 5: ['Bellwether', 'Starthread', 'Moonwheel'], 6: ['Crown-Reed', 'Kingshair', 'Last Wheel'] },
            shelfAt: [1, 1, 1, 2, 3, 4, 10] },      // the water (catalogue order) whose map puts a tier on the shelf; 1 = start
  waters: { mossmere: { order: 1, tier: 7, prices: { day: 60, old: 150, night: 260, crown: 500 } } },
  time: { out: 14, between: 8, raftSpeed: 6, home: 6, sale: 8, shop: 16, pass: 0.9, show: 0 },   // show 0 after gw-show: PLAN CHOICE 15; T37 rewrites
};
export const TEXT_LOOP = {   // every word is SPEC §8's (or a built word §8 names)
  holdFull: "Hold's full.", home: 'Home', keep: 'Keep', letGo: 'Let go', sold: 'Sold', yours: 'Yours.', odds: 'Odds ›',
  sail: 'Sail', resume: 'Resume', continue: 'Continue', settings: 'Settings', next: 'Next: {name} · {price}', holdName: 'Hold {n}',
  tabs: { tackle: 'Tackle', raft: 'Raft', bait: 'Bait', maps: 'Maps', home: 'Home' },
  jetty: { murk: 'Murk', chart: 'Chart', journal: 'Journal' },
  shelf: { hold: 'One more slot.', rod: 'Holds every fish better. Casts farther.', line: 'Holds every fish better.', reel: 'Holds every fish better.' },
  murk: { empty: 'Nothing? The water keeps its own counsel. Go again.',
          firstChart: 'Three slots in that hold. Fill them and come home.',
          firstSale: "Clams. Spend them here. I'm the only shop left.",
          firstQuiet: 'Quiet water. Move on, or go home.',
          firstLetGo: 'Let one go and the water remembers.',
          firstTrophy: "Now that's a fish.",
          sailOut: ['Bring me something with a story.', 'The big ones come up at dusk. They always did.', 'Back already? Good. Out you go.'] },
};   // no tagline: §8.5 gives none, so the loop's title draws none (PLAN CHOICE 14 withdrawn; a question for the user, §7.1)
/** §4.1 on the built size: max(1, round(tier × rarity × body(sizeL50) × clamp(e^(perZ·z)) × classBonus)). No quality, no streak.
 *  A legend returns null (she is priced by priceOf). */
export function fishClams(sp, z, { zone = sp?.zone, tier = LOOP.waters[zone]?.tier } = {}) → number | null;
/** The bite-count key: a place's id, or `open:<zoneId>` for open water (PLAN CHOICE 16). */
export function loopWaterKey(placeId, zoneId) → string;
/** Good bites at a water: open water holdSlots × openPerSlot + openExtra; a place LOOP.water.good[kind]. */
export function goodBitesFor({ kind = 'open', holdSlots }) → number;
/** The quiet terms for the NEXT bite, given the bites already spent there. over = max(0, spentBefore + 1 − good)
 *  (the spec's "each further bite", PLAN CHOICE 17); favour = max(floor, stale.favour × over); waitMult = min(waitMax, 1 + wait × over). */
export function quietTerms(spentBefore, good) → { over, favour, waitMult };
```

The apply block adds `TEXT.loop = TEXT_LOOP` under `LOOP_ENABLED` only.

### 3.2 core.js exports (lane A)

```js
export const LOOP_ROLLOUT = Object.freeze({ on: false });
export const LOOP_FLAG_KEY = 'gloomwater.loop';
/** Precedence: 1. preset GW_LOOP (boolean) wins; a preset GW_V3 === false turns the loop off (a v1 template); 2. ?loop / ?loop=1|on|true
 *  or ?loop=0|off|false; 3. localStorage gloomwater.loop; 4. LOOP_ROLLOUT. ?loop=1 with ?v3=0 or ?v3phase=4: the loop wins (PLAN CHOICE 18). */
export function resolveLoopFlags({ preset = null, search = '', stored = null, rollout = LOOP_ROLLOUT } = {}) → { on, source, apply };
/** Browser pages only: when on and apply, writes GW_LOOP = true, GW_V3 = true, GW_V3_PHASE = 1. Node: writes nothing. */
export function applyLoopFlags(g = globalThis) → { on, source, apply };
export function setLoopFlag(on) → stored value | null;
export const LOOP_FLAGS = applyLoopFlags();          // declared ABOVE `export const V3_FLAGS = applyV3Flags();`
/** < 10,000 → fmt(n) ("9,999"); < 1e6 → one decimal + "k" ("12.4k"); else one decimal + "m" ("1.2m"). */
export const fmtClams = (n) → string;
```

### 3.3 progression-loop.js (lane A)

Pure module exports (no data import; data is passed in):

```js
export function freshLoop(D) → MetaLoop;                 // §3.4 with holdSlots = D.LOOP.hold.start, maps.lakes ['mossmere']
export function migrateLoop(meta, D) → meta;             // idempotent: create when missing; fill missing keys; clamp holdSlots 3–8, tiers 0–6.
                                                         // A v1/v2 block (SPEC §9; written only by drafts, so tolerant of anything), all five rules:
                                                         //  1. flat bait counts {baitId: n} → bait.mossmere (the only water a v4/v5 draft sold bait for);
                                                         //  2. hold (a ladder level 0–5) → holdSlots = 3 + hold;
                                                         //  3. raft.hull (Quiet Hull I–III, v5 prices 100 · 600 · 8,000) → clams += the sum of the levels owned, hull deleted;
                                                         //  4. maps.places kept as they are (1a has no place ids, so nothing reads them yet);
                                                         //  5. each owned lake adds its day and old place ids to maps.places: in 1a no lake has place ids (a no-op, kept for 2).
export function tallyBook(metaLoop, creel, run) → { lines, total };   // the pure bookkeeping one tally makes, shared by endTrip and sellStrandedTrip:
                                                         // clams += total; evenings += 1; legends[id] += 1 per legend; giants[id].landed += 1 per giant;
                                                         // bait[run.zone] = run.bait. Reads each fish's own flags (fish.legendary, fish.giant,
                                                         // fish.clams); never data, never ctx.
export function sellStrandedTrip(save) → { save, sold, restored };
                                                         // flag-off boot only. If save.run?.active && outing === 'trip': meta.loop ??= minimal block; tallyBook(...)
                                                         // over save.run.creel (pendingCatch is NOT sold: it was never kept; prices are the stamped fish.clams);
                                                         // lastTrip {id, total, lines, boot: true, seen: true}; run = null. Then, if run is null and
                                                         // meta.loop.parkedRun exists: save.run = parkedRun, delete parkedRun (restored: true; PLAN CHOICE 5).
                                                         // Idempotent by lastTrip.id. A non-trip envelope with no parkedRun is returned untouched.
export function shelfItems(D, metaLoop, session = []) → ShelfItem[];   // the next hold step (≤ LOOP.hold.shelfMax) and per slot the next tier whose shelfAt
                                                         // water is owned; plus, as {bought: true} cards, the ids in `session` (bought since the shelf
                                                         // opened) and the last step of each ladder the 1a shelf offers once it is owned (Hold 5; T2): PLAN CHOICE 26
export function goalOf(items) → { id, name, price } | null;   // the cheapest unbought item
export function tallyLines(creel) → TallyLine[];         // (pounds) ascending by the weight the card shows (data.weightOz of data.fishWeight(species, line);
                                                         // ties by clams, then catch order); giants and legends last (a giant alone, last). A line keeps
                                                         // the fish's length, never a weight: the weight is derived wherever it is shown
```

`createLoop(S)` → the object exposed as `ctx.progression.loop` (null off the loop). Every method calls `ensureLoop()` first
(lazy `migrateLoop`, because `wipeAll` resets meta to `defaultMeta()`).

```js
{
  state() → MetaLoop,
  hold() → { slots, fish: Fish[], full },               // fish = run.creel (the hold IS run.creel: PLAN CHOICE 19)
  holdFull() → boolean,                                  // on a trip: run.creel.length >= meta.loop.holdSlots; else false
  priceOf(fish) → number,                                // fish.clams if stamped; else fishClams(...) or, for a legend, her crown price:
                                                         // first landing ((meta.loop.legends[id] | 0) === 0 and none already in the hold) → LOOP.waters[zone].prices.crown,
                                                         // later × legendRematch (500 / 200 for the Matriarch)
  keep(fish) → { ok, full?, msg, gained: { clams } },    // refuses when full (emits loop:holdFull {via: 'keep'}); stamps fish.clams = priceOf(fish);
                                                         // addToCreel (clears pending); emits fish:action {action: 'keep', fish, gained: {clams}}; requestSave
  letGo(fish) → { ok, gained: { bite: 1, favour } },     // key = fish.waterKey ?? loopWaterKey(fish.place, run.zone); run.bites[key] = max(0, n − 1);
                                                         // run.mercy[key] = min(cap, +favour); gone.add; pending.delete;
                                                         // emits fish:action {action: 'release', letgo: true, fish, gained}; requestSave.
                                                         // Never touches run.flags.mercy, never calls firstRelease, pays nothing.
  noteBite({ waterKey }) → void,                         // listener on fishing:bite and fishing:miss {reason: 'spooked'}: run.bites[key] += 1;
                                                         // run.flags.openBite = key (not for a spook: it ends the play); requestSave
  bitesSpent(key) → number, bitesLeft(key) → number,     // left = max(0, goodBitesFor − spent)
  favour(key) → { favour, waitMult, over, good, spent, mercy, quiet },
                                                         // favour ≤ 0 and waitMult from quietTerms(spent, good); mercy = run.mercy[key] (0–0.4);
                                                         // quiet = spent >= good (a boolean). Fishing adds {family: 'quiet', value: favour}
                                                         // and {family: 'letGo', value: mercy}; T11 asserts these names on both sides.
  closeBite() → void,                                    // clears run.flags.openBite (the play reached its card, was lost or passed)
  refundOpenBite() → boolean,                            // on Continue (restorePending, before the card reopens): if run.flags.openBite is set
                                                         // and no pendingCatch fish carries its key, bites[key] − 1 (floor 0); PLAN CHOICE 27
  debugGive(n) → number,                                 // debug builds only: meta.loop.clams += n, requestSave; returns the purse
  createTrip({ startZone, character }) → Run,            // §2.1 item 6
  endTrip() → TallyResult | null,                        // §3.4
  lastTrip() → TallyResult | null,  markTallySeen(id) → void,
  shelf() → { tabs: [{ id, items: ShelfItem[] }] },  goal() → { id, name, price } | null,
  buy(itemId) → { ok, msg, clams },                      // 'hold' (next step, in order, ≤ shelfMax) or 'rod:1'…: tier = current + 1, its shelfAt water owned;
                                                         // spends meta.loop.clams; S.invalidate(); ctx.game.save() synchronously; emits loop:buy
                                                         // (works at home with no run: the shelf is only reachable there)
  sayOnce(id) → string | null,                           // TEXT_LOOP.murk[id] the first time (meta.loop.said[id] = true), then null;
                                                         // 'sailOut' rotates meta.loop.said.sailOut (an index) and never returns null
  parkRun(run) → void,                                   // a saved non-trip descent → meta.loop.parkedRun (kept in the save, never resumed under the loop;
                                                         // the flag-off boot puts it back, sellStrandedTrip)
  // (rev. 3) the opening (docs/loop/OPENING.md)
  wick() → WickId,                                       // meta.loop.wick through loopWickId ('wick' when unset)
  setWick(id) → WickId,                                  // New Descent's Start; in memory (the next save writes it; flow 'intro' saves nothing);
                                                         // (rev. 4) setWick(null) clears it (main's leaveIntro after a first film abandoned to the title)
  tutorial() → { done, step } | null,                    // null before the opening
  beginTutorial() → { done, step },                      // when null: { done: false, step: 'arrive' }; otherwise unchanged
  setTutorialStep(id) → void,                            // a readout; a resume always starts at 'wake'
  tutorialDone() → void,                                 // { done: true, step: null } and (rev. 4) said.firstChart = true, then ctx.game.save() synchronously (the first Sail, before it moves)
}
```

`fishAction(fish, 'keep' | 'letgo' | 'release')` stays the single entry the UI calls; on a trip it routes to `keep`/`letGo`.

### 3.4 Save schema (lane A owns it)

`meta.loop` (SPEC §9's block, plus `said`, `lastTrip` and, only when an old descent was waiting, `parkedRun`; **PLAN CHOICE 20**).
Example after one trip and Hold 4 (the clam values other than the Dusk Minnow's 7 are illustrative):

```json
{
  "v": 3, "clams": 13, "evenings": 1, "holdSlots": 4,
  "tackle": { "rod": 0, "line": 0, "reel": 0 }, "lures": [], "fitted": { "lure": null, "bait": null },
  "bait": {}, "maps": { "lakes": ["mossmere"], "places": [] },
  "raft": { "oars": 0, "keel": 0, "lantern": 0 }, "home": { "orders": 0, "baitBed": 0, "wall": 0, "lights": 0 },
  "looks": [], "orders": [], "legends": {}, "giants": {}, "prints": {}, "ledgerPaid": [],
  "said": { "firstChart": true, "firstSale": true, "sailOut": 0 },
  "lastTrip": { "id": "run_k3x9", "evening": 1, "total": 43, "seen": true,
                "lines": [ { "uid": "f_1", "speciesId": "dusk_minnow", "sizeClass": "keeper", "length": 23.4, "clams": 7, "giant": false, "legend": false },
                           { "uid": "f_2", "speciesId": "mossback_perch", "sizeClass": "keeper", "length": 27.0, "clams": 9, "giant": false, "legend": false },
                           { "uid": "f_3", "speciesId": "weeping_carp", "sizeClass": "keeper", "length": 51.2, "clams": 27, "giant": false, "legend": false } ] }
}
```

(pounds) A tally line stores the fish's **length** and no weight. The tally (first showing or replay) derives each weight with
`data.fishWeight(species, line)` and words it with `data.fmtWeight`, so the three lines above read `6 oz`, `9 oz` and
`4 lb 12 oz` (the weights of 23.4, 27.0 and 51.2 cm with each species' `k`), and a later retune of `k` reaches a replayed tally as it reaches the Journal.

A trip run (`save.run`), on top of the built run: `outing: 'trip'`, `nightMode: 'still'`, `evening: 2`, `creel: [Fish & {clams}]`
(the hold), `bites: {"open:mossmere": 3}`, `mercy: {"open:mossmere": 0.2}`, `flags.pendingCatch: [Fish & {measured: true}]`
(a card open), `flags.openBite: "open:mossmere" | null` (PLAN CHOICE 27), `phase`, `phaseTime`, `pos` (built). `run.shells` is 0 and unused. `run.eveningT` is **not stored**: it is
derived as calm + dusk + `phaseTime` (**PLAN CHOICE 21**).

`TallyResult` = `meta.loop.lastTrip` as above, returned by `endTrip()` with `already: true` when the run was paid before.

`endTrip()` in order: `if (!trip) return null`; `if (lastTrip?.id === run.id) return {...lastTrip, already: true}`; stamp
`fish.clams ??= priceOf(fish)` on each hold fish; `tallyBook(meta.loop, run.creel, run)` (clams, evenings, legends,
giants, bait); `lastTrip = {id, evening, total, lines, seen: false}`; `run.creel = []`; `pending.clear()`; `run.flags.openBite
= null`; `run.active = false`; **`ctx.game.save()` synchronously** (not
`requestSave`); emit `loop:tally {…lastTrip}`. `writeSave` stores meta and the inactive run as one localStorage value
(core.js:350 drops an inactive run), so a reload sees either the trip still out (nothing paid) or the paid meta and no run.

(rev. 3) Two more keys in `meta.loop` (`freshLoop`: both `null`; `migrateLoop`: a block with `evenings > 0` and no tutorial
gets `{done: true, step: null}` and `wick: 'wick'`), and the built records the opening writes. A save during the tutorial:

```json
{
  "loop": { "v": 3, "clams": 0, "evenings": 0, "holdSlots": 3, "wick": "taper",
            "tutorial": { "done": false, "step": "wake" }, "said": {}, "lastTrip": null, "…": "the rest of the block above" },
  "intro": { "seen": true, "skipped": true },
  "seenTips": {}
}
```

After the first Sail: `"tutorial": {"done": true, "step": null}`, `"said": {"firstChart": true}`; after the first trip's two
words, `"seenTips": {"fe_cast": true, "fe_strike": true}`. `meta.intro` is `gw-intro`'s record (unchanged); a Start with no
film leaves it unset.

Never written under the loop: `meta.runs`, `meta.lastCharacter`, `meta.deaths`, `meta.bestDay`, `meta.memories`,
`meta.memoriesEarnedTotal`, `meta.relics`, `meta.unlocks`, `meta.challenges`, `meta.fitted`, `meta.lures`. Written as built
(the records SPEC §9 keeps shared): `meta.journal`, `meta.totalFish`, `meta.elderLog`, `meta.firstAncients`, legend wounds,
Marked Fish, `meta.intro` (by `gw-intro`). `core.defaultMeta()` gains no key.

### 3.5 main's game API (lane B)

```js
game.startNewRun(opts)      // LOOP: opts.__intro → enterHome('intro'); else startTrip(opts)
game.sail({ water, place }) → boolean     // the Chart's Sail; refused while a trip is saved or flow ∉ {home, title}
game.canGoHome({ fromPause }) → { ok, why }   // why ∈ 'play' | 'show' | 'card' | 'note' | 'flow' | null
game.goHome() → boolean                   // cancels a waiting line, then endRun('home'): endTrip pays and saves, then the 2 s glide
game.toHome() → void                      // the title's Continue at home (enterHome('title'))
game.atHome() → boolean                   // LOOP_ON && !hasSavedRun()
game.hasSavedRun() → boolean              // built; under the loop true only for a saved trip
game.endRun(cause)                        // LOOP: anything but 'home' is reported and refused
game.beginIntro({ character, reduced })   // (rev. 3) LOOP: setWick + actors.setCharacter, then the film (filmAllowed) or enterHome('new')
game.loopFresh() → boolean                // (rev. 3) the title's fresh branch: LOOP_ON && loopFreshSave(meta, hasSavedRun())
game.sail({ water, place }) → boolean     // (rev. 3) also: tutorialDone on the first Sail, closeAll, the 3 s glide out, then startTrip({at})
```

Main is never imported in node, so for T31 lane B puts its pure guards in a new file it owns, `src/loop-rules.js`, imported by
`main.js` and tested in `loop-evening.test.mjs`:

```js
export function tripEndAllowed(cause) → boolean;                        // cause === 'home'
export function tripStartAllowed({ flow, hasSavedTrip }) → boolean;     // flow ∈ {home, title} && !hasSavedTrip
export function goHomeAllowed({ flow, outing, paused, fromPause, cinematic, inShow, fishingState, blocking, cardOpen, notePending }) → { ok, why };
export function startRoute({ loopOn, intro }) → 'home' | 'trip' | 'built';     // game.startNewRun's first line (T44)
export function tripKeyAllowed(code) → boolean;                                  // main's keydown on a trip: false for KeyE, KeyF, Space outside a bite or a show
// (rev. 3) the opening
export function loopFreshSave(meta, hasSavedTrip) → boolean;   // !hasSavedTrip && no meta.loop.wick && meta.loop.tutorial == null && !(meta.loop.evenings > 0)
export function filmAllowed({ intro, debug, optIn }) → boolean;  // intro && (!debug || optIn)
// (rev. 4) loopWickId(id) and sailPlan(dock, centre, T, lake) are data.js exports (S2, §2.1 item 15), shared with A's validator
```

`notePending` is `fishing.state === 'lost' && fishing.isAnchored()`; `cardOpen` is `ctx.ui.isCatchOpen?.() === true`.

Under the loop `game.hasSavedRun()` is true only for a saved **trip** (`savedRun?.active && savedRun.outing === 'trip'`); a
saved non-trip descent is handed to `ctx.progression.loop.parkRun(run)` at the first Sail (PLAN CHOICE 5).

### 3.6 Events and ctx fields

| event | emitter | payload | under |
|---|---|---|---|
| `fishing:bite` | fishing (B) | built payload `+ waterKey` | loop only adds the key |
| `fishing:miss` | fishing (B) | `{reason: 'spooked', waterKey}` | loop only adds the key |
| `loop:holdFull` | fishing (B) on a refused cast; progression (A) on a refused keep | `{via: 'cast' \| 'keep'}` (ui toasts and pulses on `'cast'` only) | loop |
| `zone:change` | main (B) at a Sail | `{zone, prev: null, sail: true}` (render: no flash; audio: `setout`; ui: no banner) | loop |
| `fish:measured`, `fish:landed` | progression (A) | built payloads; `fish:landed` adds `clams`, `holdFull`, and `restored: true` on Continue | loop adds keys |
| `fish:action` | progression (A) | `{action: 'keep', fish, gained: {clams}}` · `{action: 'release', letgo: true, fish, gained: {bite, favour}}` | `'release'` keeps `actors-show` `end(action)`, fishing's exit latch and audio working |
| `loop:tally` | progression (A), inside `endTrip`, after the save | `TallyResult` | loop |
| `run:end` | main (B) | `{summary: null, cause: 'home'}` | loop |
| `home:enter` | main (B) | `{from: 'trip' \| 'title' \| 'intro', tally: TallyResult \| null}` | loop |
| `loop:buy` | progression (A) | `{item, price, clams}` | loop |
| `flow:change` | main (built) | new flow string `'home'` (never `'hub'`) | loop |
| `home:enter` (rev. 3) | main (B) | `from` also `'new'` (Start with no film) | loop |
| `player:glide` (rev. 3) | player (B; rev. 4: `glide` gains the `kind` option, the event is built) | `{state: 'start' \| 'end', kind: 'home' \| 'sailOut'}` for the hand-off and the glide out | loop adds the kinds |
| `loop:tutorial` (rev. 3) | loop-tutorial (C) | `{step, prev}`, `step` ∈ `wake \| chart \| out \| done` | loop |
| `firstEvening:line` (rev. 3) | loop-tutorial (C) | `{kind: 'murk', key: 'wake' \| 'firstChart', text, hold, loop: true}`, for audio's built grumble; never `firstEvening:step` | loop |

ctx fields: `ctx.progression.loop` (§3.3); `ctx.progression.getBitesLeft(key)` (alias); `ctx.fishing.waterAt({x, z})`;
`ctx.fishing.view.favour.bitesLeft` (number on a trip), `.quiet` (bitesLeft ≤ 0);
`ctx.fishing.inShow` (`gw-show`); `ctx.survival.getPhaseInfo().open` (true on a trip's night); `ctx.ui.loop` (C's view);
`ctx.debug.loop` (B, debug builds). DOM hooks for D: `[data-loop=home|jetty|tally|shelf|chart]`, `[data-tile=murk|chart|journal]`,
`[data-action=keep|letgo|sold|sail]`, `[data-buy="hold:4"|"rod:1"|…]`, `.gw-hold .gw-slot[data-filled]`, `.gw-home.gw-pulse`;
modal ids `jetty`, `tally`, `shelf`, `chart`, `catch` (read through `window.__gw.debug.ui().openModal`). (rev. 3)
`button.gw-char[data-wick=wick|taper|stub|tallow|ashwick]`, `.gw-loop-trait`, `[data-action=start]`, `.gw-cue`, `.gw-dim`,
modal id `newdescent`; `ctx.ui.loop.tutorial` (the machine's `state`, `step`, `cue()`); `ctx.game.loopFresh`. (rev. 4)
modal id `homepause`, `button[data-loop=homepause]` (the Jetty's pause glyph).

---

## 4. Flag-off safety

### 4.1 The rules every lane follows

1. **One switch, read once.** Every new branch reads `data.LOOP_ENABLED === true` (or a module constant built from it once) or
   `data.PARKED.<key>`, never `globalThis.GW_LOOP`. With the loop off `PARKED` is `{}`, so every `PARKED.x` is falsy.
2. **Inside a trip only.** Behaviour on the water is keyed on `run.outing === 'trip'`, which only `createTrip` writes. No flag-off
   or v3 build ever writes it.
3. **No reordering.** Existing statements keep their order; a loop branch is an early `if (…) return …` or a guarded line.
   `measure`'s emit order and save point are unchanged for v3.
4. **Payloads.** New event fields are added only under the loop; flag-off and v3 payloads are the same objects (tests
   deep-compare them).
5. **Saves.** `meta.loop` is written only under the loop (and by the boot rule, only for a `trip` envelope or a parked
   descent, which only a loop build writes). `defaultMeta()`,
   `normalizeSave`, `writeSave` are unchanged. `migrateSave` keeps its `!v3On(D)` early return; the loop call is behind
   `D.LOOP_ENABLED`.
6. **Hot paths.** `timeOk` is chosen once at create; the built function stays byte-identical (the v1 golden trace,
   `v1-fishing-trace.test.mjs`, runs through it, `rollBite` and `bite()`).
7. **Data.** No v1 or v3 table is mutated outside `if (LOOP_ENABLED)`. `LOOP`, `TEXT_LOOP`, `fishClams`, `loopWaterKey`,
   `quietTerms`, `goodBitesFor`, `LOOP_ENABLED`, `PARKED` are new export names, outside `tools/tests/v1-exports.json`
   `names`, so the v1 and walk fingerprints do not move. The fingerprint hashes functions by their source text
   (`tools/fingerprint.mjs`), so no existing exported function in `data.js` is edited; the only edited existing line outside
   the apply block is `V3_PHASE`'s expression, whose value is unchanged without `GW_LOOP`.
8. **Bundle.** `progression-loop.js`, `ui-loop.js` and `loop-rules.js` are in every bundle; off the loop they are constructed
   (or not) and never act. `ui-loop` is created only when `LOOP_ENABLED`.
9. **The one change that runs with the flag off** is the boot rule (`sellStrandedTrip`): a no-op unless `save.run.outing ===
   'trip'` or `meta.loop.parkedRun` exists, which only a loop build writes. It needs no data.

### 4.2 What must stay unchanged (the gate's flag-off checks)

| check | command | build |
|---|---|---|
| v1 golden fishing trace | `node tools/check.mjs` (runs `v1-fishing-trace.test.mjs`) | flag off |
| every existing node test | `node tools/check.mjs` | as each test sets its flags |
| flag-off scenario run | `node build.mjs --dev --out=tools/out/off.html && node tools/playtest.mjs --html=tools/out/off.html --script=tools/scenario-run.mjs --width=960 --height=540` | flag off |
| run-v3 | `--script=tools/tests/run-v3.scenario.mjs` (and `--v3phase=1`) | `?v3=1`, no `?loop` |
| m1-v3 | `--script=tools/tests/m1-v3.scenario.mjs --lean` | `?v3=1`, no `?loop` |
| af-progression | `--script=tools/tests/af-progression.scenario.mjs --shots=tools/out/afp/v3` | `?v3=1&v3phase=1`, no `?loop` |
| intro-flow, show-seq (from the in-flight branches) | their own scripts | loop off |

Before each browser run, clear `localStorage` `gloomwater.loop` (a stored loop flag would turn the loop on).

### 4.3 validate-data: the fingerprint rule

- **Never run `--refresh-fingerprint`.** `tools/tests/v1-exports.json` stays as it is; the v1 and walk passes must pass
  untouched, which proves the flag-off data unchanged.
- **A new v3-without-loop fingerprint**, `tools/tests/v3-exports.json`, made by lane A **as its first commit, from M's
  untouched data.js** with a new one-shot flag `--write-v3-fingerprint` that refuses to overwrite an existing file. It hashes
  (`tools/fingerprint.mjs` `fingerprint(D, names)`) every export name of `data.js` evaluated at `GW_V3 = true, GW_V3_PHASE = 1,
  GW_WALK = false` and at `GW_V3 = true` (phase 4) with walk on, `GW_LOOP` unset, recording those names. Pass 3 (`--v3`)
  then asserts both builds match it, so v3-without-loop data is proven unchanged by 1a.
- **The `--loop` pass** in its own process (appended to the spawn list at base 1797: `['--walk', '--v3', '--loop']`):
  `GW_V3 = true, GW_V3_PHASE = 1, GW_LOOP = true`, GW_WALK unset, `import('../src/data.js?loop')`, the LOOP rules only, then
  exit. Rules: `V3_PHASE === 1`; `!WALK_ENABLED`; `LOOP_ENABLED`; `PARKED` has exactly the 31 keys of §3.1, all true;
  `ZONES[0].arena.giantSpots` and `watchLamps` empty (and every lake's `watchLamps`); the hold ladder slots 4..8 in order,
  prices `[30, 120, 450, 2000, 3500]`, `shelfMax` 5; tackle prices `[0, 50, 300, 1200, 6000, 32000, 100000]`; `TACKLE`
  T0–T4 Hold equals §4.3's table; good bites and stale values as §3.3; evening 40 / 20 / null; `fishClams(dusk_minnow, 0.4)
  === 7`; the Mossmere crown 500; every `TEXT_LOOP` string has no "Shells", no "Memories", no "Descent", and passes the
  originality scan of pass 3; `TEXT.loop === TEXT_LOOP`; `quietTerms(4, 4)` is `{over: 1, favour: -0.15, waitMult: 1.3}`
  and `quietTerms(11, 4)` floors at −1.2 with ×2.2 wait.
- In passes 1–3: `LOOP_ENABLED === false`, `Object.keys(PARKED).length === 0`, `!('loop' in TEXT)`.

---

## 5. The opening and the show under the loop

### 5.1 A fresh save under `GW_LOOP` (the opening, `gw-intro`; rewritten in rev. 3)

The whole design is `docs/loop/OPENING.md`; this is how the built opening is reused.

- The title of a fresh loop save (`game.loopFresh()`) says **New Descent** and **Settings** (§2.3 item 5). **Begin** is not
  shown under the loop: the user's word is New Descent, and its panel offers only the Wick (§2.3, PLAN CHOICE 29). Start
  calls `game.beginIntro({character})` (§2.2 item 20), which sets the Wick and plays the built 18 s film through the built
  `startIntro` (the stage prebuilt under the title by `prewarmIntro`, so no loading screen); the panel is held under the
  ink with the title (§2.3 item 9). Skip is as built.
- At `intro:done`, `onIntroDone` (unchanged but for the one grade expression, §2.2 item 7) writes `meta.intro = {seen,
  skipped}` and calls `game.startNewRun({…, __intro: true})`, which under the loop is `enterHome('intro')`: the tutorial
  begins, Murk's barge is moored, the save is written, then flow `home` and the **3 s** glide from where the film left the
  raft to the first dock while the sky eases to home's dawn look (**PLAN CHOICEs 2 and 35**). The camera stays in `'sail'`
  from the film's last frame (§2.2 item 18), so releasing the film's camera does not pop.
- Then the tutorial at the Jetty (§5.5): the wake line, the Chart, the hold's empty slots (three; four for Tallow, rev. 6)
  and Murk's departure line "Three slots in that hold. Fill them and come home." (Tallow: "Four slots …"; SPEC §11, §8.6),
  **Sail**, and the glide out. (rev. 6) Under the loop the film's line 3 is "Its last candles fish from lamp to lamp."
  (§2.2 item 26).
- `introPending` stays `meta.runs === 0 && !meta.intro.seen` and is read only by the flag-off and v3 titles. Under the loop
  the film is played by Start whenever `filmAllowed` (a release build; a debug build after the opt-in), and replayed by the
  **Prologue** word on the Continue title when `replayOffered` (the lead keeps it: §7.3).
- No film (a debug build without the opt-in, no INTRO data, a start failure): Start goes to `enterHome('new')` and the
  tutorial starts at the wake (PLAN CHOICE 34). A returning save's title is **Continue** · **Settings** (· **Prologue**);
  Continue at home goes to the Jetty (`game.toHome()`), where a tutorial not yet done resumes at the wake.
- `game.save()` returns early while flow is `intro` (gw-intro main.js:289); `enterHome('intro')` saves right after
  `setFlow('home')`, so the seen flag, `meta.loop.wick` and the tutorial reach the disk before the glide.
- The intro-flow scenario runs with the loop off and still sees Begin and the First Outing (outing `first`).

### 5.2 The Keep and Let go buttons on the unfolding card (`gw-show`)

- The card still unfolds from the fish at `fishing:show {phase: 'card', origin}` (`K.measure.takeOrigin`), with the count
  ((pounds) the hero is the weight, counting up to its final figure; the length is the list's small line in cm), the stamp press
  and the record knots as `gw-show` and `gw-pounds` built them (the ruler hidden on a phone). The two buttons sit in
  the same `foot` (`.gw-pf`) the built buttons used: **Keep · clam · value** on the left (key 1, primary), **Let go** on the
  right (key 2). On a phone the card's action grid is two columns, so they share one row; a value up to "12.4k" fits at the
  card's type size (D checks it at 390×844).
- The clam value counts up after the stamp press (`gw-show`'s live t0 + 1100 ms), from `em[data-to]`.
- Let go is emitted as `fish:action {action: 'release', letgo: true}`, so `actors-show`'s `end(action)` plays the release
  gesture (gw-show actors-show.js:1124) and fishing's exit latch (gw-show:3468) and audio react as to a release.
- A restored card (Continue) has no show: `takeOrigin` returns null and the card opens from the centre, as built.

### 5.3 The show's timing and "frozen in the ceremony"

- The evening's clock stands still from T0 of the catch to the card's close: `fishing.inShow` (true from the reveal) freezes
  survival under the loop; `ctx.cinematic` (lift → card) already freezes survival and combat through main's
  `CINEMATIC_FROZEN`; the blocking card gives `gameDt` 0. Between `finishShow` and the card's first frame a frame or two may
  tick; T14 bounds it below 0.1 s.
- `measure` runs at the present (records only, the fish goes to `pending`, main saves on `fish:measured`). A reload
  **before the present** (during the reveal or the lift, a multi-second window under `gw-show`) would leave a bite spent
  for a fish that never reached the card. SPEC §3.6 says closing the game mid-trip loses nothing of the hold, the bites
  spent, the clock and the raft's place, so the loop keeps an **open bite** (PLAN CHOICE 27): `noteBite` sets
  `run.flags.openBite`; `fish:measured`, `fishing:escaped` and `fishing:miss` close it; on Continue, `refundOpenBite()`
  gives back a bite still open with no pending fish. The fish on the line was never in the hold, so nothing kept is lost.
  T48 proves it.
- A Home press is refused during the whole show (`canGoHome` reads `fishing.inShow`), and `gw-show`'s `.gw-showhide` hides
  the HUD layer (the pill and the slots) for the show at no cost.
- `abortShow` (a zone change, a reset) still measures while the run lives: the record is written, the fish stays in
  `pending` with no card until the next `run:start {continued: true}`. In 1a nothing on a trip changes zone mid-show.

### 5.4 The title's tagline

SPEC §8.5 gives the title's words as **Continue** only; it names no tagline, and §11 says §8 is the whole text of the loop.
The built tagline ends "Burn back the swarm." (the swarm is parked). **§8.5's wording is therefore no tagline at all:**
under the loop the title shows the logotype and its words, nothing else (`.gw-tagline` empty and hidden; rev. 3: the words
are **New Descent** · **Settings** on a fresh save, **Continue** · **Settings** (· **Prologue**) otherwise, §2.3 item 5). `TEXT.tagline`
and `taglineAlts` are unchanged for every other build. (PLAN CHOICE 14 of revision 1, a built alternative line, is
withdrawn.) Whether the user wants a line under the name is a question for the user (§7.1); the default is none.

### 5.5 The tutorial at home (rev. 3; `docs/loop/OPENING.md` §6)

| beat | owner | on screen | the line | advances on | budget |
|---|---|---|---|---|---|
| arrive | B (`enterHome('intro')`) | the 3 s glide to `docks[0]` | none | its end, or a tap | 3 s |
| wake | C (`loop-tutorial`, the Jetty) | the three tiles, the Chart tile `.gw-cue`, Murk and Journal `.gw-dim`, the purse, no goal line | `TEXT_LOOP.murk.wake` (5.95 s, the grumble) | a Chart tap; a tap elsewhere ends the line; the Chart opens itself `chartWait` (3 s) after the line | ≤ 9 s |
| chart | C (the Chart) | the Mossmere chosen, the hold's empty slots (`loop.hold().slots`: three, four for Tallow; rev. 6) inking in 0.25 s apart, Sail `.gw-cue` and live | `murkLineFor('firstChart', meta.loop.wick)` (rev. 4: the tutorial's, on every Chart open before the first Sail; `said.firstChart` written at Sail; rev. 6: Tallow's names four, one character shorter, so the budget does not grow) | **Sail**, by the player only; Esc → back to the wake's cue (no line, and the Chart never opens itself again) | ≈ 3 s |
| out | B (`game.sail`) | the screens close; the 3 s glide out | none | its end, or a tap | 3 s |

With no taps and Sail pressed 2.5 s after the Chart opens: 3 + 5.95 + 3 + 2.5 + 3 ≈ 17.5 s (T65's reference ≤ 20 s); tapping
through ≈ 5 s (≤ 8 s); the validator's budget sum ≤ 45 s (T72). `meta.loop.tutorial.done` is written at Sail, before the
glide. A reload anywhere before Sail resumes at the wake. The first trip then teaches the cast and the strike with the built
hints (the key glyphs and the strike ring on evening 1, T55) and the two tips `fe_cast` and `fe_strike` (§2.3 item 2,
PLAN CHOICE 39). `first-evening.js` is not used (it is the cove's and stays behind `FE_ON`); only its pure `murkHold` is
imported.

---

## 6. Acceptance, the gate, the stager

### 6.1 Per-lane acceptance (each lane, in its worktree, before hand-off)

- **S (A's first delivery):** `node tools/validate-data.mjs` (the built passes and the v3 fingerprint) and `node tools/check.mjs --quick` green;
  `loop-fixture.mjs` loads the loop data in node; esbuild bundles. Handed to the stager before anything else.
- **A:** `node tools/validate-data.mjs` (four passes, `--loop` included); `node tools/check.mjs --quick` green including
  `loop.test.mjs` and `loop-trip.test.mjs` (T1, T2, T4–T8 counting, T10–T12, T18–T25, T28, T29, T33–T35, T38–T42, T45, T46
  progression side, T48, T51, T53, T55 counters);
  `node tools/sim/clams.mjs --quick` all checks (or a stated list of what moved and why, §6.4); `node tools/sim/
  roster-check.mjs`; `progression*.test.mjs` unchanged and green; rev. 3: T53 as amended, T60 (progression side), T61, T67
  (migrate), T72; rev. 4: `loopWickId` and `sailPlan` (T60, T66), T75.
- **B:** `node tools/check.mjs --quick` green including `loop-evening.test.mjs` (T3, T8 emits, T9, T11 fishing side,
  T13–T17, T26, T27, T30 fishing side, T31 guards, T44 routing, T46 player side, T49, T52, T55 fishing side, T56 pure
  cases, T58 main side; rev. 3: `loopFreshSave`, `filmAllowed`, the glides' order with a fake player: T62–T64, T66; rev. 4:
  the home glide skip by tap and key, the `kind` option); `survival-v3`, `fishing-*`, `combat-*`, `player-cove`, `audio-*`, `render-*`,
  `first-evening`, `v1-fishing-trace` unchanged and green; esbuild bundles.
- **C:** `node tools/check.mjs --quick` green including `ui-loop.test.mjs` (`fmtClams` via core, `tallyPlan` order and
  timing, `goalLine`, `shelfCards` (the bought-card rule, Hold 5 and T2 permanent), `slotCells`, `murkLineFor` (empty
  unless a once-line is due), `pillHold` (0.6 s), the allow-list helper, the modal options of T57, the keys of T58, T47,
  T54, every string from `TEXT_LOOP`; rev. 3: `titleModel` and `descentModel` (T59, T62), the tips of T68, the Forget words
  of T69, the held panel of T71; rev. 4: the home pause of T57 and T73, the Settings rows of T74) and
  `loop-tutorial.test.mjs` (T65);
  `ui-v3`, `ui-af`, `ui-screens-v3`, `ui-show` unchanged and green; esbuild bundles.
- **D:** both scripts parse (`node --check`) and dry-run their pure helpers; every selector and hook they use is named in §3.6.
- **Every lane** reports, in its hand-off, which checks it ran and the summary lines, and any cross-file request still open.

### 6.2 The gate (SPEC §13, every slice)

`node tools/validate-data.mjs` (its LOOP pass included) · `node tools/check.mjs` · `node tools/sim/clams.mjs --quick` (reading
`data.LOOP`) · `node tools/sim/roster-check.mjs` · the `loop-1a` browser scenario with no console errors · the flag-off
checks of §4.2 unchanged.

### 6.3 The stager's checklist

−1. **The lead's rulings, before the lanes branch** (recorded in §7 with the date): F16 "build" or "drop" (PLAN CHOICE 1;
   default "drop"), and the choices the lead should confirm first (§7.1). A lane never waits for a ruling it does not
   need: only B's T9 and fishing's F16 item depend on the first.
0. **Before the lanes:** (rev. 5, 15 November 2026: DONE. `gw-show` was merged onto the dev line by `gw-show-merge` and
   the dev branch took it at 32c7133, so M is the dev head; the rest of this step is the record.) (rev. 4) `gw-intro` and
   `gw-loop-waters` are already in the base (3292886); merge `gw-show` into it → M. The conflicts are known (trial merge of
   3292886 and `gw-show`):
   - `render.js`, the FOV line: (rev. 5) as merged, the film's lens WINS over the show's blend:
     `const fov = clamp((introFov ?? rigFov) + fx.fovKick, 20, 95);` with `rigFov` the play's lens under the show's blend; pinned by
     `tools/tests/intro-seam.test.mjs` and CONTRACT §13.13 (the earlier text here had the show's blend over the film's
     lens, which that test rejects).
   - `render.js`, the API list: the union, `setTrophyTarget, setShowTarget,` then `gw-intro`'s marked block
     (`setIntroCamera`, `getIntroCamera`, `warmPrograms`) unchanged.
   - `DESIGN.md`: keep both branches' added text in order (intro, then show); neither changes the other's paragraphs.
   - (rev. 4) `index.html`: both sides rebuilt it; take either side, then rebuild it from M's source (`node build.mjs`)
     before running anything that reads it.
   Run the gate's node part on M and record it. **Expected on M:** `clams.mjs --quick` fails exactly one check ("1 h: 241
   clams per trip (target 100–240)"), because the show is counted twice; lane A's `LOOP.time.show = 0` clears it. Any other
   failure on M is a merge error. Create lane A's worktree off M.
0b. **The seam:** take S from lane A (§2.0), merge it into M, run `validate-data` and `check.mjs --quick`, then create the
   B, C and D worktrees off M+S.
1. **Merge order:** A → B → C → D. After each merge run `node tools/check.mjs --quick` and `node tools/validate-data.mjs`.
   A first (B and C read its runtime API); B before C (C reads `game.*`, `view.favour.bitesLeft`, `home:enter`); D last.
2. **Apply the cross-file requests** of §2.5 that are not already in the owner's branch. (There are no stub literals to
   swap: S delivered `TEXT_LOOP`.)
3. **Build:** `node build.mjs --dev --out=tools/out/loop-1a.html`.
4. **The scenario:** `node tools/playtest.mjs --html=tools/out/loop-1a.html --shots=tools/out/loop-1a/desktop
   --script=tools/tests/loop-1a.scenario.mjs --width=960 --height=540`, then the same with `--mobile`
   (`--shots=tools/out/loop-1a/phone`). (rev. 3) **It starts from a fresh save:** the title (New Descent · Settings) → New
   Descent → a Wick → Start → the film (skip allowed) → the tutorial at the Jetty (the wake line, the Chart cue) → the Chart
   (three empty slots, Murk's departure line, Sail) → Sail → the glide out → the first trip (`fe_cast`) → the rest of T36.
   Look at every screenshot: the title, the New Descent panel (five Wicks, one line, Back, Start; nothing else), the panel
   under the ink at Start, the glide to the dock, the Jetty with its cue (and, rev. 4, its pause glyph and the home pause
   on the phone), the Chart, the glide out, the HUD (slots top-left,
   the pill, nothing parked), the float's dots, the card (Keep · value / Let go), the tally, the shelf. No ring or disc
   around the raft or the Wick; no green beyond a trace; a cue never leaves its tile or button.
4b. (rev. 3) **The five Wicks in the film:** run the scenario's main pass once per Wick (`--wick=<id>`, D's flag) and look at
   the film's close takes (beats `wick` and `home`): the head- and rod-anchored shots follow the chosen body (scales 0.8 to
   1.15, Stub's tall flame, Tallow's and Ashwick's hoods). A take that crops a Wick badly is a note for the intro's owner
   (its framing is `gw-intro`'s), not a reason to show the default Wick (that would undo the player's choice).
4c. (rev. 3) **The timings:** `loop-time.scenario.mjs`'s `tutorial` ≤ 45 s (expected ≈ 17.5 s) and `sailOut` ≈ 3 s; write
   `sailOut` into `LOOP.time.out` with step 5.
5. **Measure the visit home:** run `loop-time.scenario.mjs` on the same build; write its `{home, sale, shop, out, show}` into
   `LOOP.time` in `data.js` (a value-only edit in A's file, recorded in the commit message); re-run `node tools/sim/clams.mjs
   --quick` and the full run. Every check must pass (the gate). If one fails, apply the knob lane A named for it in its
   hand-off (§6.4) and record which one.
5b. **Fix the spec's figures** (the SPEC header: "when the numbers here and the sim disagree, re-run the sim and fix this
   file"): regenerate the moved rows of SPEC §3.3's proof table, §4.2, §4.9 and §2.1 from the sim's output, in a separate
   docs commit for the lead's review, starting from lane A's docs commit (§6.4). Expected movers: the choosy %, the giant
   hunt %, trip minutes and clams per trip (PLAN CHOICEs 15 and 17 and the measured `LOOP.time`).
6. **The flag-off checks** of §4.2 (clear `gloomwater.loop` first).
7. **Rebuild `index.html` last:** `node build.mjs` (both in-flight branches rebuild it; rebuild once more on the final tree).
8. Commit on the slice branch; push nothing unless told.

### 6.4 The sim (lane A)

`tools/sim/clams.mjs` builds `LOOP = {...DRAFT_REST, value, hold, water, letGo, evening, tackle, time}` from `D.LOOP` and
deletes those keys from its draft; the Mossmere's `base` comes from `D.LOOP.waters.mossmere.tier`; the other 15 waters stay
draft until their slices. A new check fails if a moved key is still in the draft (T42). `trip()` computes the quiet terms
with `D.quietTerms(here, fresh)` (so the sim and the game share one function; with the spec's reading the 5th bite at 4
good bites is already quiet: **PLAN CHOICE 17**). `clamsFor` is checked against `D.fishClams` for every built Mossmere
species on its built L50. After the merge `L.time.show` is 0 (**PLAN CHOICE 15**). Lane A re-runs `--quick` and the full
run on its branch, makes every check pass (with a §6.5 knob if needed, named in its hand-off), and writes the moved SPEC
rows (§3.3, §4.2, §4.9, §2.1) in a separate docs commit for the lead. In its hand-off it names, for each check the visit
home could still move (the 1 h clams, the trip minutes, the choosy %), the knob it would turn; the stager's step 5 uses it.
(rev. 4, T75) The five Wicks: Taper's strike window and Tallow's and Ashwick's Hold raise the land chance, so the 1 h clams
and choosy checks run once per `LOOP.wicks` entry with the traits the sim models, and every Wick must pass the same band (a
Wick outside it is a trait to soften, never a band to widen). Cast distance, raft speed and light are not modelled and are
printed as such. The logs show no trait by the built rule (§2.1 item 8). (rev. 6) T75 is rewritten by `WICKS.md` §3.3: the
passives, run per Wick and also flag-off, by the balancing job (QUEUE job 8) before 1a branches; and M1's own gate is
`clams.mjs --shipped=mossmere --step=1` (`docs/loop/M1.md` §6.4; M1's step numbers) once committed. This plan edits no sim file.

### 6.5 Risks and knobs

| # | risk | knob |
|---|---|---|
| R1 | The show's longer `AUTOFISH.time.ceremony` and PLAN CHOICE 17 move the sim's pacing (trips 3.5–5.5 min; choosy 88–95%; the giant hunt 9–50%) and some of its checks fail | `LOOP.water.openExtra`, `LOOP.water.stale.favour`, `LOOP.time.*` from T37; the moved figures are re-pasted into the spec in a separate docs commit (§6.3 step 5b) |
| R2 | The open night looks frozen (every phase reader uses `k`) | `LOOP.evening.nightLook` (90 s); the 0.85 cap |
| R3 | The 2 s glide toward a dock crosses land (no collision) | the path is only 2 s of raft speed; then a teleport to the dock before the tally opens. (rev. 4) The dock is always `docks[0]` (CHOICE 44), so from the lake's far side the teleport is a cut of up to ≈ 100 m; it lands in the task that opens the tally, whose sheet covers the cut. If the stager sees it pop, the knob is a 0.3 s ink veil over the teleport (ui-intro's curtain), not the nearest dock |
| R4 | A reload during the reveal or lift spends a bite for a fish that never reached the card | the open bite (PLAN CHOICE 27, T48) refunds it on Continue |
| R5 | A non-trip descent saved before the loop was switched on would be overwritten by the first Sail | PLAN CHOICE 5: parked in `meta.loop.parkedRun` at the first Sail, put back in `save.run` by the flag-off boot (T35) |
| R6 | `gloam_eel` (rare, night) and other bait-only built fish never bite with no bait in 1a | expected; slice 3 |
| R7 | Text merge conflicts in `main.js` (gw-intro +248), `fishing.js` (gw-show 625), `ui-screens.js` (both), `ui.css`, `data.js` apply block | lanes write on M; the stager merges A → B → C → D |
| R8 | `fishing:bite` counts depend on the payload carrying `waterKey`; a missing key would silently stop the quiet rule | `noteBite` falls back to `loopWaterKey(null, run.zone)` and reports once |
| R9 | The Home pill's ring of ink (the spec's) could read as a ring round the raft | it is drawn inside the pill's own bounds, in the HUD layer; nothing in the 3D scene (C's screenshots, §6.3 step 4) |
| R10 | Murk's barge has no second dock in some lake layouts | moor it beside the first dock |
| R11 | Hold 6–8 on a phone overflow the top-left row (8 × 36 px + the right cluster) | 1a stops at Hold 5 (`shelfMax`); a two-row wrap from slice 2 |
| R12 | The gate is still drawn in the Mossmere, sealed | scenery by the spec (§9); no pill, no marker, no modal on a trip (T46) |
| R13 | No Settings at home: the title is Continue only and the Jetty has three tiles | resolved by the lead's ruling 12 (Settings everywhere) and rev. 3's titles (§2.3 item 5) |
| R14 | (rev. 3) The New Descent panel vanishes before the ink closes (`startIntro`'s `closeAll`; ui-intro holds only the title) | §2.3 item 9 holds the panel too; the fallback is a 0.2 s CSS fade on `.gw-loop-descent` at Start (T71) |
| R15 | (rev. 3) The film's close takes were framed on the default Wick; Stub (0.8) and Tallow (1.15) may crop | the stager's step 4b; the framing knob is `gw-intro`'s (`INTRO` takes) |
| R16 | (rev. 3) The player's `run:start` listener respawns the raft at the lake's spawn, so a trip would start with a jump from the glide's end (the same jump the revision-2 plan had from the dock) | `startTrip({at})` re-places the raft in the same task (§2.2 item 3); no respawn on `zone:change {sail: true}` (item 23); T66 |
| R17 | (rev. 3) A blocking Chart freezes `gameDt`, so a glide started under it never moves and `run:start` never fires | `game.sail` closes the screens before the glide (§2.2 item 4); T66 |
| R18 | (rev. 3) The hand-off glide covers 25.3 m; at 2 s it would run twice the raft's speed | 3 s (`LOOP.tutorial.arrive`); the knob is that value |
| R19 | (rev. 3) The glide-out path is hand-placed per lake; later waters need their own | `LOOP.tutorial.outPath[lake]` or the `outDist` rule, both checked by `validate-data --loop` (T72) |
| R20 | (rev. 3) Actors re-apply `meta.lastCharacter` on flow `title` before progression applies `meta.loop.wick` | the listener order is load-bearing; T60 asserts the title shows the chosen Wick after a reload |
| R21 | (rev. 3) `LOOP.time.out` (14 s in the sim) now includes a 3 s glide on every Sail | T37/step 4c measures `sailOut`; the sim is re-run with it (§6.4) |
| R22 | (rev. 4) The Jetty is DESIGN §25.4.8's fallback F0, not the lore's Landing; nothing on screen says why the Wick wakes at Murk's dock (a known gap against the user's "a place that makes sense … based on our lore") | stated in `OPENING.md` §6 and §7.3; slice 4 moves home to the Landing; put to the user in §7.1 |
| R23 | (rev. 4) Escape has two jobs at home: it skips a home glide and opens the home pause | it skips only while a glide runs and no screen is up; the film's swallow guard covers a double press after a film skip; T73 |
| R24 | (rev. 4) The Wick chosen at the first New Descent cannot be changed without Forget everything | the user's question in §7.1; the cheap build is written there |

---

## 7. PLAN CHOICEs (the spec is silent or self-contradictory; the smallest reading)

Numbers are kept from revision 1 so references stay valid; a withdrawn choice says so.

1. **F16 (the lingering bite) needs the lead's ruling before the lanes branch** (§6.3 step −1). It is not built
   (`fishLinger` → null) although SPEC §3.2 calls it built. "Drop" (the default if no ruling comes): nothing is built, T9
   asserts there is no linger, and the lead strikes "(built)" and the 1a test from SPEC §3.2 and §13 in the same commit.
   "Build": lane B builds it exactly as §2.2 item 12 says, and T9 asserts the first bite's `waterKey`.
2. **The film hands to the Jetty, not to a trip.** `startNewRun({__intro: true})` under the loop is `enterHome('intro')`
   (§11, §8.6), which glides the raft to the first dock (SPEC §6.1's one look). `onIntroDone` is unchanged. (rev. 3) The
   film is started by New Descent's **Start**, not by Begin, and the Jetty that follows runs the tutorial (§5.5), which
   ends with Sail and the glide out.
3. **The loop writes no `meta.runs`, `lastCharacter`, `deaths`, `bestDay`** (§9 "touches nothing else"); evenings live in
   `meta.loop.evenings`; Journal entries get `firstEvening`, shown as "Evening N" on the species page; every built counter
   that read `meta.runs` (the hurry, the strike ring, the key hints, `getFishingCounters`) reads the evening on a trip.
4. **"Not available during a play"** = a bite, the reel, the landing, the show, an open card or a pending got-away note. A
   line in the water (`waiting`) is reeled in by Home and spends nothing.
5. **A non-trip saved run under the loop** is never resumed (`hasSavedRun()` reports trips only, so the title shows
   Continue to the Jetty); at the first Sail it is moved into `meta.loop.parkedRun`, and the flag-off boot puts it back into
   `save.run` (so the flag-off game is exactly today's).
6. **The open night's look**: `getPhaseInfo().k = min(0.85, t / 90)` with `duration Infinity`, `open: true`.
7. **"The sky pales to dawn"** at home: the built dawn look at its midpoint in `world.moodTargets` for flow `home`, so the
   2 s glide (flow `home`, the clams already paid) eases from the night toward it through world's built mood smoothing.
8. **Revised: no banners on a trip.** §8 is the whole text, so the phase banners (dusk, night, dawn), the area banner and
   the lake's lore toast at a Sail, the tips and the merchant greet are all suppressed under the loop. The phases keep their
   looks (§10); only their words go. (rev. 3) Two exceptions on evening 1 only: `fe_cast` and `fe_strike` (PLAN CHOICE 39).
9. **The Home pill on a keyboard**: a held `H` (0.6 s), a tap with a full hold.
10. **An empty tally**: Murk's line and the one button **Sold**.
11. **The shelf in 1a**: only the tabs with items (Tackle: rod, line, reel; Raft: the hold); tiers are bought in order per
    slot; the shelf stops at Hold 5 (`LOOP.hold.shelfMax`). The goal line names the cheapest unbought item, "Hold N" for a
    hold and the TACKLE name for a tier; a hold card's name is §4.2's (Lidded Creel, Double Creel).
12. **Revised: the title and the pause are §8.5's lists exactly.** The title shows **Continue** only (no Settings, no
    tagline, no Prologue word); the pause shows Resume, Home and the built Settings, with no panel title or sub-line. On a
    fresh save the opening's title block (**Begin** and Settings, `gw-intro`) runs unchanged: SPEC §10 keeps the opening
    "unchanged". For the lead: those two words, and that Settings is reachable only from the pause on the water.
    (Amended by the lead's ruling, §7.2, and again by the user's ruling of 14 November 2026, §7.3: a fresh title is **New
    Descent** · **Settings**; a title with progress is **Continue** · **Settings** · **Prologue**; Begin is not used under
    the loop.)
13. **"Casts farther"**: under the loop `castMax` and `hookWindow` come from `TACKLE.rod[min(t, 4)]` (the absolute values the
    TACKLE comment defines).
14. **Withdrawn** (revision 1 drew a built tagline alternative). §8.5 gives no tagline, so none is drawn (§5.4).
15. **`LOOP.time.show` is 0** after `gw-show` (its `AUTOFISH.time.ceremony` already holds the reveal and the show); T37
    confirms or corrects it. It also clears the one sim check M fails.
16. **The open-water key** is `open:<zoneId>`; a place's key is its id. `pressureKey` stays null in open water.
17. **"Each further bite"**: with 4 good bites, the 5th bite is quiet (−0.15, ×1.3). The draft sim waited one bite longer;
    the sim now calls the same `quietTerms` as the game, is re-run, and the moved spec figures are re-pasted (§6.3 step 5b).
18. **Switch precedence**: a preset `GW_LOOP` wins; a preset `GW_V3 === false` keeps the loop off; otherwise `?loop` beats
    `?v3=0` and `?v3phase` (the loop always runs v3 at phase 1). `data.js` forces phase 1 when `GW_LOOP` is set.
19. **The hold is `run.creel`**, sized by `meta.loop.holdSlots` through `computeStats().creelSize`. CONTRACT §14's names
    table says so; the spec's `run.hold` is that array.
20. **`meta.loop.said`** (Murk's once-lines and the sail-out index), **`meta.loop.lastTrip`** (the replayable, pay-once
    tally) and **`meta.loop.parkedRun`** (PLAN CHOICE 5) are added to §9's block.
21. **`run.eveningT` is derived** (calm + dusk + `phaseTime`), not stored beside the built `phase`/`phaseTime`.
22. **Spooked bites** are counted from `fishing:miss {reason: 'spooked', waterKey}`; a cancel by moving during an open bite
    already emitted `fishing:bite` and counts; nibbles, feints and a cancelled waiting line do not.
23. **A legend's price** is stamped at Keep: first landing (none landed before, none already in the hold) her crown price,
    otherwise ×0.4. In 1a she cannot bite (no bait); T38 constructs her.
24. **Hour strings**: `LOOP.hours` maps only the roster's strings (day, dusk, night, "day, dusk", "dusk, night", any); a
    built string (`'calm'`, `'gloom'`, `'dawn'`) keeps the built `timeOk` rule exactly (built `'calm'` already bites at
    dusk), so no built species' window changes in 1a.
25. **The Strike line "moves to the Journal"** (§8.2): it leaves the card; its home in the Journal is the built "Your odds"
    block's strike note (`ui-af.oddsView`), which already explains the strike. 1a adds no strike record.
26. **"Bought: Yours."** (§8.4): a card bought while the shelf is open stays in place reading **Yours.** (disabled) until
    the shelf closes; the next step appears on the next open; the last step a 1a shelf offers in a slot (Hold 5, T2) keeps
    a permanent **Yours.** card.
27. **The open bite**: a bite still open at a reload (the play never reached its card, a loss or a pass) is refunded on
    Continue, so a reload loses none of the bites spent (§3.6). The fish on the line was never in the hold.
28. **The gate is scenery** (§9): on a trip it stays drawn as built (sealed), never opens, offers no pill, marker or modal,
    and E does nothing near it or near Murk's barge.

**Revision 3: the opening (14 November 2026; §7.3, `docs/loop/OPENING.md`).**

29. **One mode.** Under the loop New Descent is the choice of Wick and **Start**, nothing else: no night modes, no First
    Outing card, no waystones or start water, no trials or locks, no start boon, kit, quirk, Shells, lore, premise or
    heading. The panel keeps the built id `newdescent` and the built portraits.
30. **All five Wicks free from the first New Descent** (the lead's default; the user may overrule, §7.1). §10.1's "joins
    you when" conditions are dropped and the choice moves from home (slice 9) to New Descent (slice 1a). *If overruled:*
    (rev. 4) the panel shows the Wick and Start and the four others are **hidden** (a dark card would be a lock, which the
    panel never shows); `LOOP.wicks[id].joins` carries §10.1's conditions, read by a pure `wickJoined(meta, id)`; choosing
    a joined Wick moves home (a row on the Journal's first page). In 1a only Tallow's join (5 Trophies) is reachable; Taper's
    (12 species) and Stub's (the Sporewood map) wait on 1b and Ashwick's (a giant) on slice 2. It amends T59, T60, §2.3 item 5,
    `OPENING.md` §0, §1, §3 and §10, and SPEC §8.5's New Descent row and §10.1.
31. **The traits are `LOOP.wicks`, fishing only.** On a trip the built `CHARACTERS[].effects`, quirks, start boons and kits
    never apply; `LOOP.wicks[id].stats` is added after the tackle's absolute values; Tallow's +2 Hold reaches `catchChance`
    through `getCatchBuffs(cls)` and a LOOP-only `CATCH_V3.buffs.wicks.tallow` (the exported `catchBuffHold` is not
    edited); Ashwick's +3 is the built rule on the loop's night. Stub's light is the built `lightRadius` +1.5 m (§10.1's
    "as if one level higher" is read as the built Stub's own value until the Lantern part ships in slice 3).
32. **The chosen Wick is `meta.loop.wick`**, set at Start, written by home's first save, used by every trip and by the
    title and home's look. It stays until a start-over; changing Wick later is not in 1a. (rev. 4) That makes the first
    choice permanent for the save, which the panel does not say; it is put to the user in §7.1 with the cheap build.
    `meta.lastCharacter` is never written (CHOICE 3 holds).
33. **No New Descent once the loop has begun.** "Begun" = a trip out, or `meta.loop.wick` set, or a tutorial record, or an
    evening sold (`loopFreshSave`). There is one mode, so there is nothing to choose again, and beginning again would cost
    clams and gear. Starting over is Settings' built **Forget everything** (two in-page confirms → `wipeAll` → a fresh title),
    with the loop's words. An old v3 save that never played the loop is fresh to it (it gets the choice, the film and the
    tutorial once; the shared Journal and records are kept).
34. **Start plays the film when `filmAllowed`** (a release build; a debug build only after the intro opt-in, as `gw-intro`
    built). Otherwise, or if the film cannot start, Start goes straight to the Jetty (`enterHome('new')`) and the tutorial;
    `meta.intro` is not written, so the film is still unseen there.
35. **The hand-off glide is 3 s** (25.3 m on the Mossmere; 2 s would be twice the raft's speed). Murk's barge is moored
    and the save written as it starts, so a tab closed during the glide keeps the chosen Wick and the seen film.
36. **The tutorial lives on the Jetty and the Chart** (no new screen, no Skip word): a pure beat machine in
    `src/loop-tutorial.js` (lane C, which owns both screens). Each beat ends on a tap or a short wait; the Chart opens by
    itself 3 s after the wake line, once (rev. 4: never again after the player has backed out of it); Sail is never pressed
    for the player; Escape on the Chart goes back to the Jetty's cue, and Escape on the Jetty opens the home pause;
    the goal line is hidden while the tutorial runs; done is written at Sail; a reload resumes at the wake. Murk and the
    Journal stay live (dimmed). `first-evening.js` is not used (only its pure `murkHold`).
37. **The hold's empty slots are shown on the Chart** (rev. 6: three, or four for Tallow, `loop.hold().slots`), under the
    Mossmere row, inking in one by one as Murk's departure line (`murkLineFor('firstChart', wick)`: "Three slots in that
    hold …", Tallow "Four slots …") appears. (rev. 6) From M1 step 3 the row is the drawn Chart's Mossmere (`docs/loop/M1.md`
    §3.5: the first sheet inks in the first time the Chart opens, then the slots); the beat is unchanged. The Jetty shows no slots.
38. **The glide out on every Sail**: 3 s from the dock 15 m toward the lake's centre (`LOOP.tutorial.outPath` per lake,
    validated), in flow `home`, skippable by a tap every time, then the trip starts in place. It is how leaving home
    always looks, so the first Sail is not a special case; `LOOP.time.out` includes it (R21). (rev. 4) This goes past what
    the user and the lead asked (the user asked to be shown how to head out, once); the lead is asked in §7.1, with the
    alternative: the glide on the first Sail only, and every later Sail starting the trip at the dock at once.
39. **Two words on the first trip** (amends CHOICE 8): `fe_cast` ("Hold on the water. Let go to cast.") once, 1.5 s after
    the first trip starts; `fe_strike` ("Now. Tap." / "Now. Click.") in the first bite's window; each once per save.
    With the built key glyphs and strike ring (evening 1, T55), that is all the teaching on the water.
40. **Murk's wake line** is SPEC §11's ("Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it."), said
    at the Jetty on the first morning (`TEXT_LOOP.murk.wake`), voiced by the built grumble through
    `firstEvening:line {kind: 'murk', loop: true}`.
41. **Old saves.** A `meta.loop` block with an evening sold migrates to `tutorial.done` and `wick 'wick'`. An old v3
    `meta.lastCharacter` is ignored under the loop (the title and trips read `meta.loop.wick`).

**Revision 4: the critics' review (14 November 2026).**

42. **One trait line under the cards, for the lit Wick only** (amends the lead's reading, which put the trait on each
    card): five trait lines at once would be five lines of text on one screen. The card is the look and the name; moving
    the selection changes the one line. On a phone the cards are a 3 + 2 grid of 104 px cards (a row of five leaves 62 px
    each, too small to read as a look); names wrap and are never truncated.
43. **Settings under the loop** shows no parked row and no "outing": no Damage numbers row, no flare sub-line under
    Reduced flashing, "First evening" for the strike ring's first option, and the hurry row's line says "evening". These
    are new words (`TEXT_LOOP.settings`), proposed for the lead. The Forget-everything words are `TEXT_LOOP.forget`
    (proposed). Settings stays exempt from T43's allow-list.
44. **Home is always the Jetty's dock, `docks[0]`.** SPEC §6.1 says "the last water's first dock"; the sail home heads for
    it and ends there, the title's Continue and Start-with-no-film put the raft there, and so every Sail's glide out starts
    where the raft already is. The alternative (home at the nearest dock, with a glide-out path per dock) was rejected: the
    Jetty would have five looks and Murk's mooring would move.
45. **Escape at home** (the lead's ruling 12, which had no lane): the Jetty's Escape opens a loop-only home pause,
    **Resume** · **Settings** (`homepause`, lane C), and the Jetty carries the built quiet pause glyph (no word) so a phone
    reaches it too. The tutorial clock waits under it. During a home glide no screen is up and a key skips the glide.
46. **A first film abandoned to the title clears the chosen Wick** (main's `leaveIntro`): the title stays fresh, so New
    Descent is offered again and no half-begun save (a Wick with no tutorial) is written. Any `enterHome` also begins the
    tutorial when its record is missing, and `migrateLoop` marks it done for a block that has a `lastTrip` or a saved
    trip.

### 7.1 For the lead to confirm first, and for the user

**The lead, before the lanes branch:** PLAN CHOICE 1 (F16: build or drop), 12 (the opening's Begin and Settings on a fresh
title; Settings only in the pause at home), 5 (the parked descent and its flag-off restore), 17 (the 5th bite is quiet, and
the spec's figures move) and 27 (the open bite). (The lead has ruled on these: §7.2.)

**(rev. 4) The lead, for the opening:**

- **The new words this plan composed** (none is the user's or the spec's): the five trait lines ("Balanced." · "Casts
  farther. More time to strike." · "Sails faster. A wider light." · "Sails slower. Holds big fish better." · "Holds the
  first fish after dark better."), **Back**, `TEXT_LOOP.forget` ("Clams, gear, the Journal. There is no undo." and "Every
  clam, every piece of gear and every name in the Journal will be lost."; or keep the built confirm words, which name
  parked Memories, relics and trials) and `TEXT_LOOP.settings` ("First evening"; "From your second evening, hold anywhere
  to hurry a small fish in. It never changes the outcome"). Default: as written.
- **The allow-list exception** that lets "New Descent" appear on the fresh title and the panel (T43's no-"Descent" rule).
  Default: allowed there only.
- **The glide out on every Sail** (CHOICE 38). Default: every Sail. Alternative: the first Sail only; later Sails start
  the trip at the dock at once (`LOOP.time.out` then drops the 3 s again).
- **SPEC edits outside this branch's remit**, for the lead's docs commit: strike §13 slice 9's "The four other Wicks"
  (`gw-loop-waters` has merged; §10.1 already says it is struck); change §10's "the opening cut scene | kept | unchanged"
  row to "kept; its trigger and hand-off change under the loop (§11)"; give §2.1 "The first ten minutes" its first rows
  (title → New Descent → Start → film 18 s → Jetty wake → Chart → Sail); and add a pointer from §8.1, §8.3 and §8.6 to
  §8.5's opening table (the wake line, the two tips, the wordless glide out).

**Only the user can answer** (each with the default this plan builds):

- **A line under the name on the title?** §8.5 gives none and the built one names the parked swarm. Default: no line, the
  logotype and its words only.
- (rev. 3) **Do all five Wicks start free, or do they join over time?** Default: all five free at the first New Descent
  (PLAN CHOICE 30, which also writes out the alternative).
- (rev. 4) **Can the Wick be changed later without starting over?** Default built: no; the first choice lasts for the save
  (CHOICE 32), and only Forget everything offers New Descent again. If yes, the cheap build is a Wick row on the Journal's
  first page at home (lane C, about a day): the five portraits and the lit Wick's trait line from `descentModel`, no Start,
  a tap sets `meta.loop.wick` for the next trip; never during a trip; no new words.
- ~~(rev. 4) **Is the Jetty (Murk's dock) an acceptable home until the Landing is built in slice 4?**~~ (rev. 6) Answered
  by M1: the Jetty is home in M1 steps 1–4 and the Landing is built in step 5, with the same tutorial beats on its posts
  (`docs/loop/M1.md` §4, `OPENING.md` §6.2).
- (rev. 6) **Do the five passives (`WICKS.md`) feel right?** The five questions of that file are answered (15 November
  2026: "Default for all except 4 which i want yes"); this asks how they play. Default: as `WICKS.md` revision 3, with the
  balancing job's numbers.

### 7.2 The lead's rulings (14 November 2026, binding on every lane)

| choice | ruling |
|---|---|
| 1 · F16, the lingering bite | **Drop** for slice 1a. T9 asserts `fishLinger()` is null and a re-cast after a pass is a new bite at its own cast's `waterKey`. The docs commit strikes "(built)" from SPEC §3.2 and the lingering test from §13. |
| 12 · title and pause | Amended. **Settings must be reachable everywhere** (the opening's Reduced motion setting lives there). Title, a trip out or at home: **Continue**, and below it a quiet **Settings** link in the built secondary style. Fresh save: the opening's **Begin** and **Settings** exactly as gw-intro built them. Pause on the water: **Resume · Home · Settings**, no panel title. Escape at home opens the same panel without **Home**: **Resume · Settings**. T56 tests both. This is the one deviation from SPEC §8.5's "Continue only"; the docs commit records it there. |
| 5 · the parked descent | Confirmed: parked in `meta.loop.parkedRun` at the first Sail, restored by the flag-off boot. |
| 17 · the 5th bite | Confirmed: at 4 good bites the 5th is already quiet, as SPEC §3.3 says. The sim calls the same `quietTerms`; the stager re-pastes the figures it moves (step 5b). |
| 27 · the open bite | Confirmed: a bite still open at a reload is refunded on Continue. |
| title tagline | No line under the logotype (the default above). The swarm line and the death line are never shown under the loop. |

(rev. 4, the writer's notes on ruling 12, the ruling's text left as the lead wrote it) "T56 tests both" is not so: T56
tests home's camera, mood and sound; the home pause is T57 (as rewritten) and T73. "Fresh save: the opening's Begin and
Settings" is superseded by the user's ruling of 14 November 2026 (§7.3): a fresh title is **New Descent** · **Settings**.

**The lead's rulings on revision 4's open items (14 November 2026).**

| item | ruling |
|---|---|
| the new words (the five trait lines, "Back", `TEXT_LOOP.forget`, `TEXT_LOOP.settings`) | Approved as written, credited to the lead. Each stays as short as it is now. |
| "New Descent" on the fresh title and the panel | Allowed: it is the user's own word for the button. The allow-list carries this one exception. |
| the glide out on every Sail (CHOICE 38) | Every Sail, 3 s, always skippable by a tap or a key: the journey out is part of the trip. |
| SPEC edits outside the opening's sections | The lead strikes §13 slice 9's "The four other Wicks" in the merge commit. §10's opening row, §2.1's first rows and the §8.1/§8.3/§8.6 pointers follow in the Chart-integration docs commit, which edits those sections anyway. |
| the user's questions (PLAN §7.1) | Built with the defaults until the user answers: all five Wicks free; the Wick fixed until a start-over in 1a; the Jetty as home until slice 4; no line under the logotype. |

### 7.3 The user's ruling of 14 November 2026 (the opening)

The user, verbatim:

> "When you press new descent, make sure there aren't any other options to choose from other than different characters, we
> should only have one game mode which we've outlined in the new loop."

> "After youve pressed start, it should immediately go into the cut scene, then you move into the tutorial at the home base.
> Which ends with being shown how to head out to the lake"

The lead's reading, binding on every lane, and where this plan builds it:

| the ruling | built by | where |
|---|---|---|
| One game mode: New Descent shows only the Wick and Start | C | §2.3 item 5 (`openLoopDescent`), CHOICE 29, T59 |
| The Wick's card: its look, its name, its one §10.1 trait in a few words | A (words, traits), C (panel) | §2.1 item 15, CHOICE 31, T59, T61 |
| All five Wicks free from the first New Descent (the lead's default; the user may overrule) | A, C | CHOICE 30, §7.1 |
| The title: fresh → New Descent · Settings; with progress → Continue · Settings; no New Descent while a trip is out or at home | C (title), B (`loopFresh`) | §2.3 item 5, CHOICE 33, T62 |
| Start → the cut scene at once (no extra click, no loading screen); Skip works; the Prologue word stays | B (`beginIntro`), C (the held panel) | §2.2 item 20, §2.3 item 9, CHOICE 34, T63, T71 |
| The film hands off to home (the Jetty), not to the lake | B | §2.2 item 7, CHOICEs 2 and 35, T64 |
| A very short tutorial at home, one line at a time, Murk's spec lines, the three empty slots | C (`loop-tutorial.js`), A (`meta.loop.tutorial`) | §5.5, CHOICEs 36, 37, 40, T65, T67 |
| … "in the lore's place" (rev. 4): **a known gap.** The Jetty is Murk's dock, slice 1a's home (SPEC §6.1) and DESIGN §25.4.8's fallback F0; the lore's place is the Landing, where the last Wicks came ashore, which slice 4 builds | — | `OPENING.md` §6, R22, §7.1 (the user's question) |
| Settings reachable everywhere, home included (the lead's ruling 12) | C | §2.3 items 2 and 10, CHOICE 45, T57, T73 |
| It ends by showing how to head out: the Chart, the Mossmere, Sail, the glide out | C (Chart), B (`game.sail`) | §2.2 item 4, CHOICE 38, T66 |
| Fishing is taught on the first trip with the built light hints | C | CHOICE 39, T55, T68 |
| Never trapped; a returning player never sees it again | A, B, C | §5.5, T65, T67 |
| Flag-off and v3-without-loop builds unchanged | all | §4, T70 |

The new on-screen words (rev. 4, by source). The user's: **New Descent**, **Start**. The spec's: `TEXT_LOOP.murk.wake`
(SPEC §11). Built: the five `CHARACTERS[].name`, `FIRST_EVENING.tips.fe_cast` and `fe_strike`, **Resume**, **Settings**,
**Prologue**. **Proposed by this plan, for the lead's sign-off (§7.1):** the five `TEXT_LOOP.wicks` lines, **Back**,
`TEXT_LOOP.forget` and `TEXT_LOOP.settings`. SPEC §8.5 lists all of them in its opening table, so §8 stays the whole text;
§10.1, §11 and §13 slice 1a record the rest of the ruling (the docs commit of 14 November 2026). Still open for the lead: the
SPEC edits outside this branch's remit and the allow-list's `newDescent` exception (§7.1).

---

## Review log (revision 2)

Two critics reviewed revision 1 (commit 8747c69). Each finding was checked against SPEC v6 and against the code on the
base, on both branches and on a trial merge of M (`git merge-tree`, extracted to a scratch directory; nothing was written to
any other worktree).

| # | finding (severity) | verdict | what was done, or why not |
|---|---|---|---|
| 1 | The Descent Gate is reachable on a trip: pill "Descend", the Descend modal, `evaluateGate` every 0.5 s (major) | applied, in part | Confirmed: the pill and modal are reachable at the gate. Not confirmed: an old save's Matriarch does not open it, because `requirementDone` reads the run's own `r.legendaries`. A, B and C make the gate scenery (PLAN CHOICE 28); T46; D visits the gate |
| 2 | `entry.firstEvening` is never shown; the Journal reads "Day 1, descent 1" (major) | applied | C renders "Evening N" on the species page; T47; the Journal and the pause join T43's scan |
| 3 | T30 with a forced z 3.0 always gives an Elder (major) | applied | Confirmed (`S.forceZ` skips `capZ`). T30 tests the cap path at old centres and 20 points, plus 2,000 seeded rolls; B adds a read-only `waterAt` |
| 4 | "Yours." can never render, yet T36 asserts it (major) | applied | PLAN CHOICE 26; `shelfItems` takes the shelf's session list |
| 5 | Banners, title tagline, title Settings, Prologue and the pause title are words outside §8 (major) | applied | PLAN CHOICEs 8 and 12 revised, 14 withdrawn; the opening's Begin and Settings kept as `gw-intro`'s (SPEC §10 "unchanged") and listed for the lead; T43 gains an allow-list |
| 6 | A reload in the reveal or lift breaks §3.6 (major) | applied | The open bite (PLAN CHOICE 27): refunded on Continue; T48. Chose the refund over re-measuring an unmeasured fish: one rule, no change to the show's measure point |
| 7 | The parked descent is never restored with the flag off (major) | applied | `sellStrandedTrip` puts `parkedRun` back into `save.run` on a flag-off boot; T35 extended |
| 8 | F16 cannot be proven; the plan defers it (major) | applied | Stager step −1 asks the lead first; both rulings are written out (§2.2 item 12, T9), default "drop" |
| 9 | No test proves press-and-hold or the `goHomeAllowed` matrix (major) | applied | T49 (the matrix), T50 (the scenario and the pill timer) |
| 10 | The pill's ink wash replaced the spec's ring of ink (minor) | applied | C builds the spec's ring of ink inside the pill's bounds; R9 reworded |
| 11 | The loop card keeps a kg weight row; the Strike line's Journal home is unowned (minor) | applied | Weight row dropped under `loopCard`; PLAN CHOICE 25 for the Strike line |
| 12 | KeyR and KeyB stay live on a trip (minor) | applied | C swallows R, B and C; B makes E do nothing; T58 |
| 13 | Four spec names are renamed without a reconciliation (minor) | applied | CONTRACT §14 names table, a `getBitesLeft` alias, a SPEC errata request with the commit |
| 14 | Nobody owns re-pasting the sim's moved figures; "never edit the spec" contradicts the spec's header (minor) | applied | Stager step 5b and §6.4: lane A's docs commit, then the stager's after T37; knobs named in A's hand-off |
| 15 | `migrateLoop` implements two of SPEC §9's five rules (minor) | applied | All five written out (hull at v5's 100 · 600 · 8,000); T51 |
| 16 | The boot-rule sale skips the legends and giants bookkeeping (minor) | applied | `tallyBook`, shared by `endTrip` and `sellStrandedTrip`; T35 asserts the Matriarch's count |
| 17 | Several rules have no named test (minor) | applied | T52 (quiet water), T53 (parked buffs), T54 (the legend's card) |
| 18 | After the film the Jetty opens off the dock; from the title the lake is unspecified (minor) | applied | `enterHome('intro')` glides to the first dock; `enterHome('title')` loads the last water with `showLake` |
| 19 | The `home` flow has no music mood or water bed (minor) | applied | B owns `audio.js`/`audio-v3.js` lines: `hub` mood, water bed on, `setout` at a Sail; T56 |
| 20 | Mapping built `'calm'` to the roster's "day" changes the koi's window (minor) | rejected, simplified | Built `'calm'` already bites at dusk (`timeOk`: every phase but gloomtide), so nothing changed on a trip. To leave no doubt, `LOOP.hours` now maps only the roster's strings (PLAN CHOICE 24); T15 adds the koi case |
| 21 | The tally has no scale; the shelf's Murk line could fill with built lines (minor) | applied | C draws Murk's scale; the shelf's line is empty unless a §8.6 once-line is due |
| 22 | "Hold's full." also fires on a refused keep (minor) | applied | The toast and pulse react to `{via: 'cast'}` only; Digit1 does nothing while Keep is dimmed |
| 23 | B and C cannot build or pass their acceptance before A merges (blocker) | applied | The seam commit S (§2.0), with `loop-fixture.mjs`; B, C and D branch from M+S |
| 24 | Flow `home` with no run picks the title camera, mood and silence (major) | applied | Confirmed in M's `pickMode`, `moodTargets`, `water.js` and `audio.js`. B owns one branch in each (§2.2 items 16, 18); T56 |
| 25 | `meta.runs` stays 0, so the hurry never unlocks and the ring and hints never go (major) | applied | Confirmed. The counters read the evening on a trip (A, B, C); T55 |
| 26 | `favour(key)` has no `favour` field; `quiet` is a number in one place, a boolean in another (major) | applied | The shape is fixed in §3.3 and CONTRACT §14; T11 asserts the names on both sides |
| 27 | T30's forced z (the second critic's copy of finding 3) (major) | applied | As finding 3 |
| 28 | Sail from the Chart leaves the Jetty and the Chart open over play (major) | applied | `startTrip` calls `ui.closeAll`; ui's `flow:change` closes the loop's modals; T36 asserts an empty stack |
| 29 | The gear log at home shows T0 odds after a buy (major) | applied | `getLoadout`'s no-run branch reads `meta.loop.tackle` under the loop; T25 extended |
| 30 | Esc or a scrim tap strands the player at home (major) | applied | Modal options fixed (tally `dismissable: false`, Esc skips; Jetty ignores Esc; shelf and Chart go back); T57 |
| 31 | M does not merge cleanly, and the sim fails one check on M (minor) | applied | Confirmed by trial merge and a sim run on it. §6.3 step 0 gives both `render.js` resolutions and the `DESIGN.md` rule, and records the expected sim failure |
| 32 | Every Sail emits `zone:change {prev: 'mossmere'}`: the descend sting, a black flash, the banner (minor) | applied | `{prev: null, sail: true}`; render ignores it, audio plays `setout`, ui shows nothing |
| 33 | B's half of T44 cannot run in node; `notePending` has no named source (minor) | applied | `startRoute` and `tripKeyAllowed` in `loop-rules.js`; `notePending = state === 'lost' && isAnchored()` |
| 34 | The unseeded scenario pass never sees Begin in a debug build (minor) | applied | D calls `__gw.debug.intro('auto', true)` and re-shows the title first |
| 35 | R and B reach parked systems (the second critic's copy of finding 12) (minor) | applied | As finding 12 |
| 36 | A press on the Home pill could start a cast charge (minor) | applied | `tapGuard` on `pointerdown`; the hold ends on `pointerup`/`pointercancel`; T50 |
| 37 | Tiers 5–6 index past `TACKLE.rod`; `computeStats` keyed on `run()` misses the trip (minor) | applied | `TACKLE.rod[min(t, 4)]`; the branch is keyed on the argument `r` |
| 38 | Stub swaps, knob tuning and `meta.loop` writes land on the stager or on B; nobody stamps `fish.waterKey` (minor) | applied | No stubs after S; `loop.debugGive`; `makeFishV3` stamps `waterKey`; lane A owns the sim re-run and names the knobs |
| 39 | `evaluateGate` still runs on a trip (latent for 1b) (minor) | applied | As finding 1 |

## Review log (revision 4)

Two critics reviewed revision 3 (commit a13bb87) and the new `OPENING.md`: 27 findings. Each was checked against the base
(`ccr-87831d14-8jseye`, now 3292886 with `gw-intro` and `gw-loop-waters` in), `gw-show` as committed, and a trial merge of
the two (`git merge-tree`; nothing was written to any other worktree). This branch first merged the base, so it carries
SPEC v7.1. Where the fix is in SPEC or `OPENING.md`, that file's own log has the same row.

| # | finding (severity) | verdict | what was done, or why not |
|---|---|---|---|
| 1 | `OPENING.md` calls the Jetty the place the last Wicks came ashore; DESIGN §25.4.8 gives that to the Landing and keeps the dock as fallback F0 (major) | applied | Confirmed (DESIGN.md §25.4.8). `OPENING.md` §6 rewritten; §7.3 records the gap; R22; the user is asked in §7.1 |
| 2 | Several new lines are in no part of SPEC §8; the header's "this plan adds none" is untrue (major) | applied, within this branch's sections | SPEC §8.5 gains an opening table listing every new word and the wordless glide out; the header sentence corrected; pointers from §8.1, §8.3, §8.6 are left to the lead (§7.1) because this branch edits only §8.5 of §8 |
| 3 | Composed words credited to the user (major) | applied | SPEC rows re-tagged as the user's ruling with the wording a proposal; §7.1 and §7.3 list the proposals by source |
| 4 | The first Wick is permanent and nobody was asked (major) | applied | CHOICE 32 amended, R24, the user's question in §7.1 with the cheap build; migrated blocks stated in `OPENING.md` §10 |
| 5 | Trait line moved off the cards unrecorded; phone names truncated; 338 ≠ 344 (minor) | applied | CHOICE 42; a 3 + 2 phone grid of 104 px cards; T59 checks no name is truncated; the sums corrected |
| 6 | T57 says Esc on the Jetty does nothing, against ruling 12 (minor) | applied | T57 rewritten |
| 7 | After Esc from the Chart the auto-open could re-fire (minor) | applied | §2.3 item 8 (once per start), T65 |
| 8 | The glide on every Sail goes past the ask and is not a question (minor) | applied | CHOICE 38 amended; §7.1 asks the lead with the first-Sail-only alternative |
| 9 | Settings under the loop still shows parked rows and "outing" words (minor) | applied | CHOICE 43, §2.3 item 5, `TEXT_LOOP.settings`, T74 |
| 10 | SPEC §2.1 and slice 9 contradict §10.1 (minor) | applied in part | SPEC §10.1 says slice 9's Wick item is struck by this revision; §2.1 and the slice 9 cell are outside this branch's sections and are in §7.1 for the lead |
| 11 | The alternative's dark portraits are locks; "nothing else changes" is wrong (minor) | applied | CHOICE 30: hidden; the amended tests and sections listed |
| 12 | Ruling 12's Escape at home has no lane, no test, no phone path; "T56 tests both" is false (major) | applied | §2.3 items 2 and 10 (`homepause`, the pause glyph), CHOICE 45, T57, T73; a note under §7.2 corrects the ruling's test reference and its stale fresh-title words without rewriting the ruling |
| 13 | The glide out starts at `docks[0]` but the sail home parks at the nearest dock, so later Sails start with a jump (major) | applied | Confirmed (`glide` snaps the raft to `pts[0]`, base:652). CHOICE 44: home is always `docks[0]`; §2.2 items 4 and 7; R3 amended; T66 checks the start after a trip near `docks[2]` |
| 14 | `sayOnce('firstChart')` loses the departure line after a reload or an Escape; two owners (major) | applied | The tutorial owns the line before the first Sail and reads it directly; `tutorialDone` writes `said.firstChart`; §2.3 items 2 and 8, §3.3, T65, T67 |
| 15 | `player.glide` takes no `kind` (minor) | applied | Confirmed (base:648–654). §2.2 item 15 adds the option; §3.6 corrected |
| 16 | `pressAction` never runs in flow `home`; no skip key exists (minor) | applied | Confirmed (`gameAcceptsInput`, base:691). §2.2 item 8: a home branch before the check, and keydown skips with `INTRO.skip.keys` after the swallow guard |
| 17 | `loopWickId` in two lanes with two signatures (minor) | applied | One `data.js` export in S2 reading `LOOP.wicks.order`; removed from `loop-rules.js` and from B's tests |
| 18 | `fakeLoop` lacks `beginTutorial`; a call without `?.` (minor) | applied | §2.0; §2.2 items 4 and 7 use optional calls |
| 19 | A film abandoned through the idle valve leaves the Wick set and the tutorial null (minor) | applied | Confirmed (`leaveIntro`, base:371, and the 1.5 s valve in `tickIntroFlow`). CHOICE 46, §2.2 item 24, `setWick(null)`; `enterHome` begins a missing tutorial for every `from`; `migrateLoop` takes `{hasTrip}` and a `lastTrip`; T60, T67 |
| 20 | The `newdescent` hold in ui-intro is not behind the flag (minor) | applied | §2.3 item 9 |
| 21 | Two places set the hand-off grade; `enterHome` cannot know (minor) | applied | Confirmed (`graded = introFlow.inked`, read and reset in `onIntroDone`). The arrival's grade step removed |
| 22 | A's validator cannot check B's `sailPlan` (minor) | applied | `sailPlan` moved to `data.js` (S2); T72 checks every lake's glide out through it |
| 23 | The header's base and line numbers are stale; `index.html` also conflicts (minor) | applied | Confirmed by a trial merge of 3292886 and `gw-show` (conflicts: `DESIGN.md`, `index.html`, `render.js`; the sim still fails only the one "1 h: 241" check). Header, facts and §6.3 step 0 refreshed; the Settings citation is base:1520 / M:1586 |
| 24 | Three of the four joins wait on later slices (minor) | applied | CHOICE 30 and `OPENING.md` §0: only Tallow's is reachable in 1a |
| 25 | After the waters merge, SPEC slice 9 and §10's row still contradict §10.1 and §11 (minor) | applied in part | As row 10: §10.1 carries the strike; slice 9's cell and §10's row are in §7.1 for the lead |
| 26 | The sim runs only for the Wick; no trait reaches a log (minor) | applied | Confirmed (`getOdds` uses owned relics and no run buffs). §6.4 and T75 run the checks per Wick; §2.1 item 8 records the logs' built rule and that `getCatchBuffs` gains its `cls` argument (the built function takes none) |
| 27 | `panel()` adds a ✕ to the New Descent panel (minor) | applied | Confirmed (`close = true` default, ui-screens.js:22). `close: false` in §2.3 item 5 |

