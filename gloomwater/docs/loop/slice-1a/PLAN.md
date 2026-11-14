# Slice 1a build plan: Three slots on the built fish

The build plan for SPEC v6 §13 slice 1a (`docs/loop/SPEC.md`). The spec is binding; this file says who builds what, against
which seam, and how it is proven. Where the spec is silent the plan takes the smallest reading and marks it **PLAN CHOICE**
(the list is in §7). On-screen words are the spec's (§8); this plan adds none. The opening's own words (**Begin**, the film's
lines, Skip) are `gw-intro`'s, which SPEC §10 keeps "unchanged"; they are listed for the lead in §7 (PLAN CHOICE 12).
Revision 2 applies the two critics' review; the **Review log** at the end lists every finding and what was done with it.

**The merged base (M) and the seam (S).** M = `ccr-87831d14-8jseye` + `gw-intro` + `gw-show`, merged by the stager first
(§6.3 step 0 lists the two conflicts). Lane A then writes the **seam commit S** on M (§2.0: the data tables, the switch,
`fmtClams`, the pure module and a shared test fixture); the stager merges it, and **B, C and D branch from M+S**, so every
static import and every test fixture they need exists from their first commit. A keeps building on its own branch from S.
Line numbers below are **base** line numbers (`ccr-87831d14-8jseye` at 85f78ae), checked for this plan; `gw-show:N` and
`M:N` mark line numbers in those trees. In M, find code by its function name, never by the number.

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
- The trial merge of M conflicts in `DESIGN.md` (base + `gw-intro`, and again with `gw-show`) and twice in `render.js`
  (the FOV line and the API list; §6.3 step 0 gives the resolution). Every other file merges cleanly.
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

---

## 1. Scope

### 1.1 The player can (SPEC §13 slice 1a)

| id | the player can | lane | proved by |
|---|---|---|---|
| P1 | Start at the Jetty | B (the `home` flow, its camera, mood and sound), C (the Jetty screen) | T36 (scenario), T44, T56, T57 |
| P2 | Sail to the Mossmere's open water for an evening | A (`createTrip`), B (`game.sail` → `startTrip`), C (the Chart) | T36, T45 |
| P3 | Catch fish automatically (as built) | B (fishing, unchanged except the guards) | T36, T52, T55; v3 fishing tests unchanged |
| P4 | Keep or let go at the card, seeing the clams | A (`fishAction`, `priceOf`), C (the card's buttons) | T4–T6, T36, T54 |
| P5 | Fill three slots; be refused a cast when full | A (`holdFull`), B (the cast refusal), C (the slots, the line, the pulse) | T1–T3, T36 |
| P6 | Go home (press and hold) | B (`goHome`, `endRun('home')`), C (the Home pill) | T21, T31, T36, T49, T50 |
| P7 | Watch Murk's tally | A (`endTrip`), C (the tally screen) | T21, T22, T36 |
| P8 | Buy Hold 4, Hold 5, Rod, Line and Reel T1 and T2 | A (`loop.buy`, `loop.shelf`), C (the shelf) | T23–T25, T36, T53 |
| P9 | Sail again | B, C | T36 |
| P10 | Close the game mid-trip and continue | A (`restorePending`, the open bite, saves), B (`continueRun`, raft place) | T7, T32, T36, T48 |
| P11 | Never fail | B (survival, combat parked), A (parked rewards), A+B+C (the gate is scenery) | T26–T29, T46, T58 |

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
| T36 | the scenario: fresh save → three fish → Home → +clams → Hold 4 (its card reads **Yours.** until the shelf closes) → a second trip; after every Sail `debug.ui().stack` is empty (desktop 960×540 and phone 390×844) | D · loop-1a.scenario |
| T37 | measure the visit home and write it into `LOOP.time`; re-run the sim | D (measures), stager (writes, re-runs) |
| T38 | a kept Belled Matriarch is sold at the tally for 500 (constructed with `makeFish`; a second one in the same trip 200) | A · loop-trip |
| T39 | flag-off parity: every loop API is null or inert on v1 data and on v3-without-loop data; `sellStrandedTrip` is a no-op on a non-trip envelope | A · loop.test, loop-trip; B, C in their files |
| T40 | the switch: `resolveLoopFlags` precedence; `applyLoopFlags` on a fake page writes `GW_LOOP`, `GW_V3`, `GW_V3_PHASE = 1`; in node it writes nothing | A · loop.test |
| T41 | `validate-data --loop` (§3.1 rules) and the v3-without-loop fingerprint | A · validate-data |
| T42 | the sim reads `data.LOOP` and fails if a moved key is still drafted | A · clams.mjs |
| T43 | no `/shells?/i`, no "Memories", no "Descent" in the DOM on a loop trip, at the gate, at the Jetty, on the shelf, on the tally, in the pause menu and on the Journal's species page; and an **allow-list**: on the water's HUD, the card, the tally, the Jetty, the shelf, the Chart, the title and the pause menu, every visible text node is a `TEXT_LOOP` string, a species name, a size-class label, a number (with "cm" or a clam glyph), a built record kicker or the card's built "length" label (the logotype and the Settings panel are exempt) | D · scenario; C · ui-loop (the allow-list helper) |
| T44 | a fresh loop save: the film (Begin) → the Jetty in flow `home`, the raft at the first dock, with Murk's first line at the Chart | D · scenario; B · loop-evening (`startRoute({loopOn: true, intro: true}) === 'home'`, `startRoute({loopOn: true}) === 'trip'`, `startRoute({loopOn: false})` is the built route) |
| T45 | `createTrip` refuses a water not in `meta.loop.maps.lakes` (falls back to `maps.lakes[0]`) | A · loop-trip |
| T46 | the gate is scenery: with the raft at the gate on a trip, `player.interact()` opens no modal and returns false, `player.interactable` is null for the gate and Murk's barge, no `gate:open` over 60 s (even with `run.legendaries.belled_matriarch` set), `getGateInfo().open === false`; `ui.openDescend()` does nothing while `loopOn()` | B · loop-evening; A · loop-trip (`evaluateGate`/`openGate`/`travel` inert); C · ui-loop |
| T47 | the Journal's species page on the loop: an entry with `firstEvening: 3` reads "Evening 3" and contains no "Day" and no "descent"; off the loop the built line is unchanged | C · ui-loop |
| T48 | a reload in the middle of a play loses no bite: `noteBite` opens `run.flags.openBite`; a save taken in the reveal or the lift and reloaded refunds it (`bitesSpent` equals the value before the bite); a save taken with the card open reopens the card and refunds nothing | A · loop-trip |
| T49 | `goHomeAllowed` returns `ok: false` with the right `why` for each blocking state (bite, reeling, landing → `'play'`; `inShow` or `cinematic` → `'show'`; card open or blocking → `'card'`; a got-away note pending → `'note'`; paused without `fromPause`, or flow ≠ `playing`, or not a trip → `'flow'`) and `ok: true` in `idle`, `charging`, `casting` and `waiting` | B · loop-evening |
| T50 | press and hold: with 1 of 3 slots full a 0.3 s press does nothing and a 0.7 s hold opens the tally; with a full hold a tap does; a press on the pill never starts a cast charge (`fishing.state` stays `idle`); the pill's timer fires at 0.6 s | D · scenario; C · ui-loop (the timer) |
| T51 | `migrateLoop` on a synthetic v2 block: flat bait counts move under `bait.mossmere`, `hold: 2` becomes `holdSlots: 5`, `raft.hull: 2` is refunded as 700 clams and removed, places are kept, a second migrate changes nothing | A · loop.test |
| T52 | quiet water on a trip: no sign spawns once `bitesLeft` is 0; `baseTerms` has no `letPass`, `pressure` or `hush` term; `view.favour.bitesLeft` goes 4 → 3 on a bite and back to 4 on a let go | B · loop-evening |
| T53 | parked buffs on a trip: `getCatchBuffs()` has `wellFed: false`, no boons, no relics, `firstHookTonight: false`; `getOdds` equals `catchChance` with no buff terms | A · loop-trip |
| T54 | a legend's card on a trip renders exactly two buttons, **Keep** (her price, 500 on a first landing) and **Let go**; no weight row, no Strike row, no favour row | C · ui-loop |
| T55 | the counters read the evening on a trip: evening 1 shows the strike ring and the key hints and refuses the hurry; evening 2 allows the hurry; `getFishingCounters()` reports the evening | B · loop-evening; A · loop-trip; C · ui-loop (`gw-hints`) |
| T56 | home's camera, mood and sound: `render.getCameraMode()` stays `'sail'` from the film's last frame into the Jetty and through the sail home; `world`'s mood targets in flow `home` are the dawn midpoint (not the title's); the audio mood in `home` is `'hub'` and the water bed is on | B · loop-evening (pure `loopHomeMood` and `zoneSting` cases; `pickMode` through the D scenario), D · scenario |
| T57 | Escape never strands the player at home: Esc (or a scrim tap) on the tally skips to its end and leaves Sold; Esc on the Jetty does nothing; Esc on the shelf or the Chart returns to the Jetty | C · ui-loop (the modal options); D · scenario |
| T58 | the parked keys on a trip: R, B and C do nothing and put nothing on screen; E does nothing; F and Space (outside a bite or a show) do nothing | C · ui-loop (`handleKey`); B · loop-evening (main's key guard, through `loop-rules.tripKeyAllowed`) |

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
     `meta.loop.maps.lakes` else `maps.lakes[0]`; `outing 'trip'`; `nightMode 'still'`; `character 'wick'`; `shells 0`;
     `boons {}`; `upgrades {}`; `lures {}`; `bait = {...meta.loop.bait[zone]}` (empty in 1a); `equippedBait = null`;
     `equipped = null`; `creel []`; `bites {}`; `mercy {}`; `evening = meta.loop.evenings + 1`; `tally {dawns: 0, stillNights:
     0, swarmNights: 0}`; `flags.nightLog []`; hp, oil and satiety at the computed maxima. It never calls
     `challenges.specialSum`, never reads `CHARACTERS[].startKit` or `startBoon`, never adds a waystone purse.
   - `computeStats(out, r)` (133): the branch is keyed on the **argument** `r?.outing === 'trip' && D().LOOP_ENABLED ===
     true`, never on `run()` (createRun calls it before `ctx.state.run` is set). After the built body, `out.creelSize =
     meta.loop.holdSlots`; `castMax` and `hookWindow` from `TACKLE.rod[Math.min(t, TACKLE.rod.length - 1)]` for `t =
     meta.loop.tackle.rod` (TACKLE has tiers 0–4; the absolute values the TACKLE comment at data.js:3451 defines; **PLAN
     CHOICE 13**); relic and journal-perk effects are skipped (`PARKED.meta`); `flags.mercy` is not added.
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
   migrateLoop(save.meta, D)`. The `!v3On(D)` early return stays first.
8. **progression-af.js**: `const loopRun = (r) => D().LOOP_ENABLED === true && r?.outing === 'trip'`. `perRunOf` (62) is false
   for a trip. `getLoadout` (123) for a trip **and, under `D().LOOP_ENABLED === true`, its no-run branch too** (the shelf's
   Odds › opens the gear log at home, where there is no run): `{rod, line, reel}` from `meta.loop.tackle`, `item: null`,
   `itemLevel: 1`, `perRun: false`, `runless` as built, and `hold` from `tackleHoldAt` for T0–T4 or
   `LOOP.tackle.extraHold` for T5–T6 (never `meta.fitted`). `getFishingCounters` (580): under the loop the expedition count
   is the evening (`run?.evening ?? meta.loop.evenings + 1`) and `firstExpedition` is evening 1.
   `ownedRelics` (141) `{}` under `PARKED.meta`. `getCatchBuffs` (163): `wellFed false`, `boons {}`, `relics {}`,
   `firstHookTonight false`. `runLuresOn` (64) false on a trip. `getGearLog` (361) reads the trip's loadout (it already goes
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
   `run = ctx.progression.createRun({startZone: opts.water || 'mossmere', character: 'wick', nightMode: 'still', outing:
   'trip'})`; on failure `report` and stay home (never `fallbackRun`); `lockRunMode(run, {nightMode: 'still', outing:
   'trip'})`; **no write** to `meta.runs`, `meta.lastCharacter` (**PLAN CHOICE 3**); `ctx.state.run = run; savedRun = null;
   ctx.paused = false; actors.merchant.leave({instant: true}); ctx.ui.closeAll?.()` (the Chart sits on the Jetty; both must
   go before play), `setFlow('playing'); emit('zone:change', {zone: run.zone, prev: null, sail: true})` (the lake is already
   on screen: render does not flash, audio plays `setout`, ui shows no banner, item 18 and §2.3 item 1); `emit('run:start',
   {continued: false}); game.save()`.
4. **`game.sail(plan)`** → `startTrip({water: plan.water})`. `game.planSetOut` is left as it is (FE only).
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
   - `from === 'trip'`: **the sail home**, a 2 s glide: `player.glide([raft position, the point 2 s of raft speed toward the
     nearest of world.getDocks()], {duration: 2, skippable: true})` (it steps in flow `home`, item 15; the sky pales to dawn
     through world's `home` mood, item 16). The clams were paid and saved before it started, so a reload during the glide is
     a reload during the tally. At its end (or a tap): `player.teleport(dock.position, dock.yaw)`, then the arrival below.
   - `from === 'intro'`: the same glide from where the film left the raft to the first dock (2 s, skippable), so the Jetty
     opens on its one look (SPEC §6.1: the first dock at dawn, the raft tied up). The camera holds `'sail'` through it
     (item 18), so the film's release of `setIntroCamera(null)` does not pop.
   - `from === 'title'`: `showLake(meta.loop.lastTrip?.zone ?? meta.loop.maps.lakes[0])` (main's built helper, from
     `gw-intro`), then `player.teleport(dock.position, dock.yaw)`; then the arrival.
   - **the arrival**: `actors.merchant.arrive(dock2.position, dock2.yaw, {instant: true})` (Murk's barge moored at the next
     dock, else beside the first); set the lake's grade if the film did not wear it (`from === 'intro'`);
     `emit('home:enter', {from, tally})`; `game.save()`.
   `game.toHome()` = `enterHome('title', null)` (the title's Continue at home). `game.atHome()` = `LOOP_ON &&
   !game.hasSavedRun()`.
8. **frame()** (base 731; on `gw-intro`'s version): `const inHome = LOOP_ON && ctx.flow === 'home'`; `running` includes it;
   `CINEMATIC_FROZEN` modules get dt 0 when `inHome`, as in the hub. `pressAction` (518): in `home`, a tap skips a skippable
   glide and nothing reaches fishing or combat. `keydown` (604): no pause in `home` (Esc is the UI's). On a trip, KeyE does
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
15. **player.js** `update` (589): the glide also steps in flow `home`: `if (V3() && (ctx.flow === 'hub' || ctx.flow ===
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

### 2.3 Lane C: the screens

**Owns:** new `src/ui-loop.js`, `src/ui.js`, `src/ui-hud.js`, `src/ui-hud-v3.js`, `src/ui-screens.js`, `src/ui-icons.js`,
`src/ui.css` (a marked block at the end), new `tools/tests/ui-loop.test.mjs`.

**Work.** Every branch is behind `const loopOn = () => D().LOOP_ENABLED === true` (and `run()?.outing === 'trip'` on the
water). The words are `TEXT_LOOP`'s, read directly (`D().TEXT_LOOP.home`): S delivers them, so C has no stub literals and
the stager has nothing to swap.

1. **ui.js**: create `loopView = D().LOOP_ENABLED === true ? createLoopView(K) : null` after `K.hud = hud` (the pattern
   `gw-intro` uses for `introView`); `loopView?.update(dt)` at the end of `update()`; `api.loop = loopView`; `api.isCatchOpen = () => has('catch')` (beside
   `isShopOpen`, base 909; main's `canGoHome` reads it). Under the loop:
   `handleKey` (M:850) on a trip swallows `KeyC`, `KeyR` and `KeyB` (returns true, does nothing, says nothing: no built
   creel, no Burn-a-fish, no bait cycle); tips (`TIPS`/`TIPS_V3`), the merchant greet, **every phase banner** (dusk, night,
   dawn) and, on a `zone:change {sail: true}`, the area banner and the lake's lore toast are suppressed (**PLAN CHOICE 8**,
   revised: §8 is the whole text). The `flow:change` listener (M:689) also closes `jetty | tally | shelf | chart` on
   `'playing'`. `gw-hints` (M:917) reads the evening on a trip (`run.evening <= 1`), the built `meta.runs` otherwise. The
   HUD is shown in `playing` only, as today.
2. **ui-loop.js** (new), `createLoopView(K)`: the hold row, the Home pill, the Jetty, the tally, the shelf, the Chart, Murk's
   lines. Pure exports for node: `slotCells`, `tallyPlan`, `goalLine`, `shelfCards`, `murkLineFor`, `clamTag` (uses
   `core.fmtClams`).
   - **The hold** (§3.1, §8.1): a `.gw-hold` row appended into `.gw-tl` (ui-hud.js:22): `holdSlots` cells; a kept fish is a
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
   - **The Jetty** (§8.3, §6.1): `openModal('jetty', …, {screen: true, blocking: false, onEscape: () => {}})` (Esc never
     leaves the player at home with no screen) on `home:enter` when there is no
     unseen tally, else after Sold. A purse top-right `${icon('clam')}<b>${fmtClams(clams)}</b>`; three tiles in the
     `.gw-mode` card style, one word each, `data-tile="murk|chart|journal"`: **Murk** (the shelf), **Chart**, **Journal**;
     one goal line `Next: {name} · {price}` from `ctx.progression.loop.goal()` (none → no line); Murk's one line when due.
     Desktop 960×540: tiles in a row in the lower third. Phone 390×844: a column in the lower half, each ≥ 56 px, 16 px
     gutter, the purse under `--sat`.
   - **The tally** (§8.3): `openModal('tally', …, {dismissable: false, onEscape: skipToEnd})` on `home:enter {tally}` (after
     `run:end`'s `closeAll`) or at the Jetty when `loop.lastTrip()` is unseen (a reload). **Murk's scale**: one ink drawing
     (a beam and two pans, `ui-icons` style) at the top of the sheet; each fish, a small ink fish, settles onto the pan as its
     row counts up. Rows from `tallyPlan(tally)`: ascending by clams, giants and legends last, a giant alone with a longer
     pause; the name small, the value counting up with one `sfx('coin')`; then the total `+N` in gold; one button **Sold**
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
     (`data-action="sail"`) → `ctx.game.sail({water: 'mossmere', place: null})`. Murk's first line above Sail on the first
     visit.
   - **Murk's lines** (§8.6): `murkOnce(id)` = `loop.sayOnce(id)`; at the Jetty or the Chart in `.gw-murk-line`; on the water
     as one `'lore'` toast after the card closes (toast already holds flavour behind modals and the show). In 1a: `firstChart`
     (at the Chart, evening 1), `firstSale` (after the first non-empty Sold), `firstQuiet` (the first `view.favour.bitesLeft
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
     (`key '2'`, `action 'letgo'`, autofocus when Keep is disabled). Gone: the weight row (`<dt>weight</dt>`, a kg number
     §8 does not allow; the length stays the hero), the worth row (gw-show:717), the Strike row (its home in the Journal is
     the built "Your odds" block's strike note: **PLAN CHOICE 25**) and the favour row, `.gw-catch-full` and the room list
     (gw-show:757), Eat, Render, Release, the banked pick. A giant: a gold ★ before
     `.gw-catch-name` and the class stamp in gold (`.gw-cc-giant`, the gilded wash). The count-up reads `data-to` (the old
     `/\+(\d+)/` parse stays for every other card) and starts at `gw-show`'s delayed t0 (after the stamp press). `onKey` map
     `{Digit1: 'keep', Digit2: 'letgo', Numpad1, Numpad2}`; Digit1 and Numpad1 do nothing while Keep is disabled. The unfold, the ruler, the knots, the length count and the stamp
     are `gw-show`'s, untouched. `doFishAction(fish, 'letgo')` shows no lore toast.
   - **`showTitle`** (M:301): under `loopOn()` the tagline is not drawn (`.gw-tagline` empty and hidden: §8.5 gives none,
     §5.4) and the built `if (hasRun)` Continue (M:332–335) is skipped; the intro's fresh-save block runs as built (**Begin**
     and Settings, then its own return: the opening's words, SPEC §10); its Prologue replay word is **not** added under the
     loop; then the loop branch, placed just after `// <<< INTRO LANE B` and before New Descent: a trip out
     (`ctx.game.hasSavedRun()`) → **Continue** (`continueRun`, no sub-line); at home → **Continue** (`ctx.game.toHome()`);
     then return (no Settings, New Descent, Journal, Shrine, Trials) (**PLAN CHOICE 12**). `.gw-title-meta` and the premise
     are removed.
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
   class. It must not fight `gw-show`'s `.gw-cc-live` stamp and hero animations.

### 2.4 Lane D: the scenario and the visit home

**Owns:** new `tools/tests/loop-1a.scenario.mjs`, new `tools/tests/loop-time.scenario.mjs`, `tools/scenario-run.mjs` (one
dispatch line: `--scenario=loop-1a`).

D writes against the seam (§3: DOM hooks, `window.__gw`, `ctx.debug.loop`) and does not run a browser in its worktree. The
stager runs both scripts on the merged build (§6).

- **loop-1a.scenario.mjs** (T31, T32, T36, T43, T44, T46, T50, T56, T57): boot a fresh save at `?loop=1` (pre-seed
  `meta.intro = {seen: true}` for the main path; a second pass with no seed first calls `__gw.debug.intro('auto', true)` and
  re-shows the title, as `intro-flow.scenario` does, because a debug build shows no Begin without the opt-in, then checks
  Begin → the film skipped → flow `home`, the raft at the first dock and `render.getCameraMode() === 'sail'` from the film's
  last frame) → the Jetty (flow `home`,
  three `[data-tile]`, the goal line `Next: Hold 4 · 30`, the purse) → Chart → Sail → keeps 1–2 by `debug.instantCatch`
  then `[data-action=keep]` (the `em[data-to]` equals `loop.priceOf`) → keep 3 through the real path (`fishOutcome('land')`
  + `forceBite` + `fishStrike` + `fishPlayTo`, hurrying the show), with the press-and-hold checks of T50 at 1 of 3 (a 0.3 s
  press does nothing; a press while idle leaves fishing `idle`) → a 4th press is refused (`Hold's full.` toast,
  `.gw-home.gw-pulse`, fishing `idle`) → tap the pill → `openModal === 'tally'`, the clams delta equals the stamped sum
  (species and z chosen so the sum ≥ 30) → Esc (the tally jumps to its end; Sold still there) → Sold → Esc on the Jetty
  (still open) → Murk tile → buy `hold:4` (its card reads `Yours.`, `holdSlots === 4`) → Esc (back at the Jetty) → Chart →
  Sail (`debug.ui().stack` empty) → 4 empty cells → sail to the gate's centre (`world.getGate()`): no interact pill, E opens
  nothing, T43's scan there → open the pause (T43's scan) and the Journal's species page (T43's scan) → reload mid-trip →
  the title shows Continue only (no "New Descent", no tagline) → Continue → the hold, the bites and the raft's place
  restored. Screenshots at each step, desktop 960×540 and `--mobile` 390×844. Asserts `ctx.errors` empty, T43's word scan
  and its allow-list (the helper from ui-loop) on every screen.
- **loop-time.scenario.mjs** (T37): times each leg on a deterministic clock (`gw-show`'s `show-seq` rAF takeover): Home press
  → tally open, the tally per fish (3 fish, one giant-less), Sold → Jetty, Jetty → shelf → one buy → back, Jetty → Chart →
  Sail → `run:start`, and the glide. It prints `{home, sale, shop, out, show}` in seconds as JSON for the stager.

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
export function tallyLines(creel) → TallyLine[];         // ascending by clams; giants and legends last (a giant alone, last)
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
```

Main is never imported in node, so for T31 lane B puts its pure guards in a new file it owns, `src/loop-rules.js`, imported by
`main.js` and tested in `loop-evening.test.mjs`:

```js
export function tripEndAllowed(cause) → boolean;                        // cause === 'home'
export function tripStartAllowed({ flow, hasSavedTrip }) → boolean;     // flow ∈ {home, title} && !hasSavedTrip
export function goHomeAllowed({ flow, outing, paused, fromPause, cinematic, inShow, fishingState, blocking, cardOpen, notePending }) → { ok, why };
export function startRoute({ loopOn, intro }) → 'home' | 'trip' | 'built';     // game.startNewRun's first line (T44)
export function tripKeyAllowed(code) → boolean;                                  // main's keydown on a trip: false for KeyE, KeyF, Space outside a bite or a show
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

ctx fields: `ctx.progression.loop` (§3.3); `ctx.progression.getBitesLeft(key)` (alias); `ctx.fishing.waterAt({x, z})`;
`ctx.fishing.view.favour.bitesLeft` (number on a trip), `.quiet` (bitesLeft ≤ 0);
`ctx.fishing.inShow` (`gw-show`); `ctx.survival.getPhaseInfo().open` (true on a trip's night); `ctx.ui.loop` (C's view);
`ctx.debug.loop` (B, debug builds). DOM hooks for D: `[data-loop=home|jetty|tally|shelf|chart]`, `[data-tile=murk|chart|journal]`,
`[data-action=keep|letgo|sold|sail]`, `[data-buy="hold:4"|"rod:1"|…]`, `.gw-hold .gw-slot[data-filled]`, `.gw-home.gw-pulse`;
modal ids `jetty`, `tally`, `shelf`, `chart`, `catch` (read through `window.__gw.debug.ui().openModal`).

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

### 5.1 A fresh save under `GW_LOOP` (the opening, `gw-intro`)

- The title of a fresh save says **Begin** (the intro's block, unchanged). Begin plays the 18 s film. At `intro:done`,
  `onIntroDone` (unchanged) writes `meta.intro = {seen, skipped}` and calls `game.startNewRun({…, __intro: true})`. Under the
  loop that call becomes `enterHome('intro')`: flow `home`; the raft glides 2 s from where the film left it to the first
  dock while the sky eases to home's dawn look, and the Jetty opens on its one look (SPEC §6.1). The camera stays in
  `'sail'` from the film's last frame (render's `home` branch, §2.2 item 18), so releasing the film's camera does not pop.
  The Chart's first visit shows Murk's line "Three slots in that hold. Fill them and come home." This is SPEC §11 ("It plays … before the Jetty while the cove is not built"; "the game opens at the
  Jetty with the same departure line") and §8.6 ("the first evening, at the Chart") (**PLAN CHOICE 2**).
- `onIntroDone` eases the lake's grade only `if (!graded)` and reads `ctx.state.run?.zone`, which is null at home; `enterHome
  ('intro')` therefore sets the Mossmere's grade itself when the film did not wear it.
- `introPending` stays `meta.runs === 0 && !meta.intro.seen`. The loop writes no `meta.runs`, so the film plays exactly once
  (`seen` is set at the hand-off) and `replayOffered` (runs > 0 or seen) still offers the Prologue word.
- No film (a debug build without opt-in, no INTRO data, a returning save): the title's one word under the loop is
  **Continue**, which goes to the Jetty (`game.toHome()`: the last water loaded with `showLake`, the raft at its first
  dock). The Prologue replay word is not offered under the loop (§8.5: Continue only).
- `game.save()` returns early while flow is `intro` (gw-intro main.js:289); `enterHome` saves after `setFlow('home')`, so the
  seen flag and the fresh `meta.loop` reach the disk.
- The intro-flow scenario runs with the loop off and still sees the First Outing (outing `first`).

### 5.2 The Keep and Let go buttons on the unfolding card (`gw-show`)

- The card still unfolds from the fish at `fishing:show {phase: 'card', origin}` (`K.measure.takeOrigin`), with the length
  count, the stamp press and the record knots as `gw-show` built them (the ruler hidden on a phone). The two buttons sit in
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
under the loop the title shows the logotype and **Continue**, nothing else (`.gw-tagline` empty and hidden). `TEXT.tagline`
and `taglineAlts` are unchanged for every other build. (PLAN CHOICE 14 of revision 1, a built alternative line, is
withdrawn.) Whether the user wants a line under the name is a question for the user (§7.1); the default is none.

---

## 6. Acceptance, the gate, the stager

### 6.1 Per-lane acceptance (each lane, in its worktree, before hand-off)

- **S (A's first delivery):** `node tools/validate-data.mjs` (the built passes and the v3 fingerprint) and `node tools/check.mjs --quick` green;
  `loop-fixture.mjs` loads the loop data in node; esbuild bundles. Handed to the stager before anything else.
- **A:** `node tools/validate-data.mjs` (four passes, `--loop` included); `node tools/check.mjs --quick` green including
  `loop.test.mjs` and `loop-trip.test.mjs` (T1, T2, T4–T8 counting, T10–T12, T18–T25, T28, T29, T33–T35, T38–T42, T45, T46
  progression side, T48, T51, T53, T55 counters);
  `node tools/sim/clams.mjs --quick` all checks (or a stated list of what moved and why, §6.4); `node tools/sim/
  roster-check.mjs`; `progression*.test.mjs` unchanged and green.
- **B:** `node tools/check.mjs --quick` green including `loop-evening.test.mjs` (T3, T8 emits, T9, T11 fishing side,
  T13–T17, T26, T27, T30 fishing side, T31 guards, T44 routing, T46 player side, T49, T52, T55 fishing side, T56 pure
  cases, T58 main side); `survival-v3`, `fishing-*`, `combat-*`, `player-cove`, `audio-*`, `render-*`,
  `first-evening`, `v1-fishing-trace` unchanged and green; esbuild bundles.
- **C:** `node tools/check.mjs --quick` green including `ui-loop.test.mjs` (`fmtClams` via core, `tallyPlan` order and
  timing, `goalLine`, `shelfCards` (the bought-card rule, Hold 5 and T2 permanent), `slotCells`, `murkLineFor` (empty
  unless a once-line is due), `pillHold` (0.6 s), the allow-list helper, the modal options of T57, the keys of T58, T47,
  T54, every string from `TEXT_LOOP`);
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
0. **Before the lanes:** merge `gw-intro`, then `gw-show`, into the base → M. The conflicts are known (trial merge):
   - `render.js`, the FOV line: keep both terms, `const fov = clamp(lerp(introFov ?? cur.fov, showCam.fov, showCam.w) +
     fx.fovKick, 20, 95);` (the film's lens, then the show's blend over it).
   - `render.js`, the API list: the union, `setTrophyTarget, setShowTarget,` then `gw-intro`'s marked block
     (`setIntroCamera`, `getIntroCamera`, `warmPrograms`) unchanged.
   - `DESIGN.md` conflicts on both merges: keep both branches' added text in order (intro, then show); neither changes the
     other's paragraphs.
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
   (`--shots=tools/out/loop-1a/phone`). Look at every screenshot: the HUD (slots top-left, the pill, nothing parked), the
   float's dots, the card (Keep · value / Let go), the tally, the Jetty, the shelf, the Chart, the title. No ring or disc
   around the raft or the Wick; no green beyond a trace.
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

### 6.5 Risks and knobs

| # | risk | knob |
|---|---|---|
| R1 | The show's longer `AUTOFISH.time.ceremony` and PLAN CHOICE 17 move the sim's pacing (trips 3.5–5.5 min; choosy 88–95%; the giant hunt 9–50%) and some of its checks fail | `LOOP.water.openExtra`, `LOOP.water.stale.favour`, `LOOP.time.*` from T37; the moved figures are re-pasted into the spec in a separate docs commit (§6.3 step 5b) |
| R2 | The open night looks frozen (every phase reader uses `k`) | `LOOP.evening.nightLook` (90 s); the 0.85 cap |
| R3 | The 2 s glide toward a dock crosses land (no collision) | the path is only 2 s of raft speed; then a teleport to the dock before the tally opens |
| R4 | A reload during the reveal or lift spends a bite for a fish that never reached the card | the open bite (PLAN CHOICE 27, T48) refunds it on Continue |
| R5 | A non-trip descent saved before the loop was switched on would be overwritten by the first Sail | PLAN CHOICE 5: parked in `meta.loop.parkedRun` at the first Sail, put back in `save.run` by the flag-off boot (T35) |
| R6 | `gloam_eel` (rare, night) and other bait-only built fish never bite with no bait in 1a | expected; slice 3 |
| R7 | Text merge conflicts in `main.js` (gw-intro +248), `fishing.js` (gw-show 625), `ui-screens.js` (both), `ui.css`, `data.js` apply block | lanes write on M; the stager merges A → B → C → D |
| R8 | `fishing:bite` counts depend on the payload carrying `waterKey`; a missing key would silently stop the quiet rule | `noteBite` falls back to `loopWaterKey(null, run.zone)` and reports once |
| R9 | The Home pill's ring of ink (the spec's) could read as a ring round the raft | it is drawn inside the pill's own bounds, in the HUD layer; nothing in the 3D scene (C's screenshots, §6.3 step 4) |
| R10 | Murk's barge has no second dock in some lake layouts | moor it beside the first dock |
| R11 | Hold 6–8 on a phone overflow the top-left row (8 × 36 px + the right cluster) | 1a stops at Hold 5 (`shelfMax`); a two-row wrap from slice 2 |
| R12 | The gate is still drawn in the Mossmere, sealed | scenery by the spec (§9); no pill, no marker, no modal on a trip (T46) |
| R13 | No Settings at home: the title is Continue only and the Jetty has three tiles | the built Settings stay in the pause on the water; a question for the lead (§7.1) |

---

## 7. PLAN CHOICEs (the spec is silent or self-contradictory; the smallest reading)

Numbers are kept from revision 1 so references stay valid; a withdrawn choice says so.

1. **F16 (the lingering bite) needs the lead's ruling before the lanes branch** (§6.3 step −1). It is not built
   (`fishLinger` → null) although SPEC §3.2 calls it built. "Drop" (the default if no ruling comes): nothing is built, T9
   asserts there is no linger, and the lead strikes "(built)" and the 1a test from SPEC §3.2 and §13 in the same commit.
   "Build": lane B builds it exactly as §2.2 item 12 says, and T9 asserts the first bite's `waterKey`.
2. **The film hands to the Jetty, not to a trip.** `startNewRun({__intro: true})` under the loop is `enterHome('intro')`
   (§11, §8.6), which glides the raft to the first dock (SPEC §6.1's one look). `onIntroDone` is unchanged.
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
   looks (§10); only their words go.
9. **The Home pill on a keyboard**: a held `H` (0.6 s), a tap with a full hold.
10. **An empty tally**: Murk's line and the one button **Sold**.
11. **The shelf in 1a**: only the tabs with items (Tackle: rod, line, reel; Raft: the hold); tiers are bought in order per
    slot; the shelf stops at Hold 5 (`LOOP.hold.shelfMax`). The goal line names the cheapest unbought item, "Hold N" for a
    hold and the TACKLE name for a tier; a hold card's name is §4.2's (Lidded Creel, Double Creel).
12. **Revised: the title and the pause are §8.5's lists exactly.** The title shows **Continue** only (no Settings, no
    tagline, no Prologue word); the pause shows Resume, Home and the built Settings, with no panel title or sub-line. On a
    fresh save the opening's title block (**Begin** and Settings, `gw-intro`) runs unchanged: SPEC §10 keeps the opening
    "unchanged". For the lead: those two words, and that Settings is reachable only from the pause on the water.
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

### 7.1 For the lead to confirm first, and for the user

**The lead, before the lanes branch:** PLAN CHOICE 1 (F16: build or drop), 12 (the opening's Begin and Settings on a fresh
title; Settings only in the pause at home), 5 (the parked descent and its flag-off restore), 17 (the 5th bite is quiet, and
the spec's figures move) and 27 (the open bite).

**Only the user can answer** (each with the default this plan builds):

- **A line under the name on the title?** §8.5 gives none and the built one names the parked swarm. Default: no line, the
  logotype and **Continue** only.

### 7.2 The lead's rulings (14 November 2026, binding on every lane)

| choice | ruling |
|---|---|
| 1 · F16, the lingering bite | **Drop** for slice 1a. T9 asserts `fishLinger()` is null and a re-cast after a pass is a new bite at its own cast's `waterKey`. The docs commit strikes "(built)" from SPEC §3.2 and the lingering test from §13. |
| 12 · title and pause | Amended. **Settings must be reachable everywhere** (the opening's Reduced motion setting lives there). Title, a trip out or at home: **Continue**, and below it a quiet **Settings** link in the built secondary style. Fresh save: the opening's **Begin** and **Settings** exactly as gw-intro built them. Pause on the water: **Resume · Home · Settings**, no panel title. Escape at home opens the same panel without **Home**: **Resume · Settings**. T56 tests both. This is the one deviation from SPEC §8.5's "Continue only"; the docs commit records it there. |
| 5 · the parked descent | Confirmed: parked in `meta.loop.parkedRun` at the first Sail, restored by the flag-off boot. |
| 17 · the 5th bite | Confirmed: at 4 good bites the 5th is already quiet, as SPEC §3.3 says. The sim calls the same `quietTerms`; the stager re-pastes the figures it moves (step 5b). |
| 27 · the open bite | Confirmed: a bite still open at a reload is refunded on Continue. |
| title tagline | No line under the logotype (the default above). The swarm line and the death line are never shown under the loop. |

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
