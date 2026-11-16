# M1 step 3a build plan: the places, giants and legend, and the Mossmere's catalogue

The build plan for `docs/loop/M1.md` §4 "Step 3 … 3a" (QUEUE job 11, the fish and water track's step 3a, size L), binding with
M1 §2.2, §2.3, §2.4, §2.13, §2.14, §2.17, §3.6, §3.8 and §6.4, `SPEC.md` v8.6 (§3.3–§3.5, §4.5, §4.6, §5.1–§5.5, §8, §8.8,
§13 step 3), `ROSTER.md` §3.1 and §4 with `roster.json`, `WATERS.md` §1–§2 and `WORLD.md` §10 for the Mossmere's look. Where the
docs are silent the plan takes the smallest reading and marks it **PLAN CHOICE** (§7). Its model is `slice-1a/PLAN.md`; it is
shorter, and leans on that plan's rules where they still hold (its §3 stub rule, §4 flag-off rules, §4.3 fingerprint rule).

**Before it starts** (M1 §4): §8 question 2, the harbour re-dress, was put to the user, who answered on 15 November 2026 **"Behind
a switch, then your yes"**: Under the Span's arch spans, broken deck and chains ship with 3a as that place's own dressing; the rest
of DESIGN §25.8's W9 (bollards and buoy-lanterns for the street lamp-posts, the leaning toll-tower, the Sluice Veil card and its
aqueduct with no spout) is built behind `LOOP.redress`, **off by default**, shown side by side (§6.4), on only after the user's yes.

**The two tracks** (QUEUE "Two tracks"). The home and map track builds step 3b, the drawn Chart, at the same time on `gw-m1-s3b`
(`tools/world-map/`, `src/chart-draw.js`, `src/chart-art.js`, `src/ui-chart.js`, `build.mjs`'s bundling step, `src/template.html`'s
fonts, M1 §3.2). **No 3a lane touches those files or that worktree.** 3a's places reach the Chart only through `LOOP` data and
`chartModel`'s place fields (M1 §3.8; the signature unchanged); 3a grows 1a's list Chart a row per place (M1 §3.6), which stays the
drawn Chart's fallback whichever step lands first (§5 step 4).

**The base (M) and the seam (S).** M = `5e8ef53` (the dev branch `ccr-87831d14-8jseye`: slice 1a and M1 step 2 merged, the minified
flag-off `index.html` rebuilt). Lane A writes the **seam commit S** on M (§2.0); the stager merges it; B, C and D branch from M+S.
Worktrees `.gw-wt/m1-s3a-<word>`, branches `gw-m1-s3a-<word>` (§2), each with `gloomwater/node_modules` symlinked from the main
checkout (gitignored). Line numbers below are M's; find code by name.

**Facts this plan rests on (checked on M).**

- Under the loop `GW_V3_PHASE` is pinned to 1, and the apply block adds the Mossmere's places only at `P >= 2`, so
  `ZONES[0].arena.places` and `PLACES` are **empty under the loop today**; `MOSSMERE_V3.places` holds the four places' geometry
  (`lily_maze` disc (−40.5, 24.5) r 7.5; `under_the_span` path (−40, −4)–(−19, 5) w 8; `buoy_lights` rect (−48, −2) 4 × 24;
  `bell_pool` disc (−4, −14) r 6), each with `landmark`, `look` and `build` text, no `kind`. `arena.legendPool` is (−4, −14) r 3.2.
- `fishing.js` `speciesPool` filters by zone, hour, depth and bait only: **places do not shape the pool** (no commons ×0.5, no draws,
  no giant share). `placeAt` reads `arena.places`; `waterInfo` gives `{place, giant: placeHoldsGiants, waterKey}`; `capZ`
  (`fishing-reel.js`) caps a class by place `maxClass` and giant water. `legendInfo` gives her sure bite from the fitted bait, her
  hour and `arena.legendPool`.
- `catchParts` (data.js) has `CATCH_V3.rarity` for common, uncommon and rare only: an epic giant gets no rarity Fight today.
  `CATCH_V3.markedFish` is 6 (the light P1 Marked Fish ships with automatic fishing; `fromClass` place `trophy`).
- `models-fish.js` `SHAPES` has no `lamprey`, `sturgeon` or `trout` (`createFish` falls back to the minnow; data.js
  `FISH_SHAPES_V3` names `sturgeon`); `ui-fishart.js` `SHAPES` lacks them too (the eel's bounds). `drawFish` has a `silhouette`
  mode and no `hatch` mode. `AUTOFISH.show.poseRules.thin` is `['eel']`.
- `ROSTER_SHIPPED` (`src/roster-shipped.js`, written by `tools/roster-export.mjs`) holds the eight step-2 roster fish; the
  Thousandcast Pike (epic, pike, old, Under the Span, dusk), the Hullkiss Lamprey (epic, lamprey, night, the Buoy Lights, night)
  and the Kissmark Trout (uncommon, trout, open, any) are in `roster.json` only. The Bridgechain Sturgeon is a built phase-2 record
  (`place: 'under_the_span'`, `weather: 'hush'`, shape `sturgeon`); the Gloam Eel (`bait: 'lumen_moss'`) and the Belled Matriarch
  (`bait: 'heartmoss'`, shape `carp`) are built phase-1 records already in loop `SPECIES`. The built Heartmoss Ball costs 40; the
  loop's is 60 (SPEC §4.6).
- `progression-loop.js`: `LOOP_SCHEMA` 3; `freshLoop` already has `maps.places`, `fitted.bait`, `bait[water]`, `legends`, `giants`
  (`{landed, marked}`, written by `tallyBook`) and `said`; `migrateLoop` fills missing keys on every boot and runs its five rules
  only on a block older than `LOOP_SCHEMA` (rule 5 gives an owned lake the places in `LOOP.waters[lake].places`, which no water has).
  `shelfItems` sells Tackle and Raft (to `LOOP.hold.shelfMax` 5) and filters maps past `LOOP.shipped`; `priceOf` prices a legend
  500 / 200 (T38). The pull (SPEC §5.5 (d)) and the card's list seal are **not built**.
- `ui-loop.js` `chartModel(meta, D, opts)` returns one sheet with `places: []` and `next: null`; `renderChart` draws the list
  (`[data-water]`, `.gw-slot`, `[data-action=sail]`). `ui-screens.js` `openJournal` under the loop draws the list's cards first
  with notches and hour glyphs, the rest after a thin rule, from `journalModel` and `listFor`.
- `loop-home.js` `sail(plan)` glides 3 s from `docks[0]` along `data.sailPlan(dock, centre, TUT, water)` (the Mossmere's authored
  `outPath`), then `startTrip({water, at})`. The Mossmere's docks are (24, 38) (home), (49, 6), (35, −40), (−36, −38), (−48, 14).
- No `tools/audio-render.mjs --set=mossmere`; `tools/tests/clarity-perf.scenario.mjs` measures the v3 phase-1 Mossmere with the
  loop off only. `index.html` is 2,840,337 bytes (budget 3.3 MB; 3b's Chart ≤ 300 KB, so 3a has about 160 KB).
- **The sim on M** (`clams.mjs --shipped=mossmere --step=3`): 13 permanent items, 2,620 clams; the empty shelf at 1.15 h (19
  trips); the first giant at about 1.1 h; the list (12) p95 29 min; the place maps +24.2% / +33.5% / +12.1% a minute; **all checks
  pass with one warning** (Hold 6 −1.4% a minute for 2.4 trips' income: a warning at steps 1–4, the lead's ruling). With `--wicks`:
  all pass, six warnings (the Wick −6.8% of the 1.04 h mean, outside the ±5% aim). The sim already models the four places, the
  giants' shares (`DRAFT.giant`), the place pools (`kindWeight`, `dayDraw`, `placeCommon`, `kept`, `favour.place/window`) and the
  Heartmoss hunt; the game does not.

---

## 1. Scope

### 1.1 The player can (M1 §4 step 3a)

| id | the player can | lanes | proved by |
|---|---|---|---|
| P1 | See standing mist over each place not yet lifted: a low lavender bank, its landmark a dark shape inside; at dusk and night a giant's dark back turning in Under the Span's and the Buoy Lights' banks | D (banks, back), A (`lifted`) | T145, T149, look sheet 1 |
| P2 | Cast into a bank: the float sinks into it and comes back; no bite spent, bait kept | B | T121 |
| P3 | Buy the Lily Maze (60), Under the Span (150), the Buoy Lights (260) and the Bell Pool (500) from at most three map cards (the shelf's Maps tab, or a priced row of the Chart's list), each naming its fish drawn life-size beside the Wick with its hour glyph and line; Sporewood's sealed card is the third, "Coming soon" | A (`mapCards`, `buy`), C (cards, rows) | T108, T109, T133–T135 |
| P4 | Watch the mist lift on the first evening after the purchase: the bank thins over 3 s, the camera frames the landmark, an ink title card names the place (1.2 s); then see the place's own dressing every evening | B (the beat), D (bank, camera, dressing), C (title card), A (ledger) | T112, T128, T142, T145, look sheet 1 |
| P5 | Choose a place on the Chart's list and **Sail** toward it | C (rows, pick), B (`sail({place})`), A (`chartPick`) | T129, T134 |
| P6 | Fish each owned place: its good bites and favour by kind, its draws (the Lily Maze's koi ×3, carp ×1.5), its own fish, commons half as often; night water only after dark | B (pool, keys), A (`placePool`) | T104, T111, T122, T125 |
| P7 | Meet Elders under the Span, and a giant as an Elder at its own place; none in open water | B | T123 |
| P8 | Hook the Thousandcast Pike (Under the Span, dusk and night) and the Hullkiss Lamprey (the Buoy Lights, night): never Small, running big, the hardest fish to land; land one for the gold card (★ before its name, the seal in gold), its ★ on its Chart row and the Journal's giants' page; lose one for the got-away note and a Marked Fish (+6 Hold, once) | A, B, C | T105–T106, T113, T124, T127, T139, T140 |
| P9 | Buy the Heartmoss Ball (60), fit it on the Chart's bait slot, sail to the Bell Pool by day or dusk and get her sure bite; land her (27% on T1) or wound her (+6 to +18); her card **Keep · 500** (**Keep · 200** after) / **Let go**; Murk's line; sold at the tally | A, B, C | T107, T110, T126, T139, T144, T149 |
| P10 | Catch the Kissmark Trout (open water) and the Bridgechain Sturgeon (Under the Span's own) on their new plans; the list grows to 12 | A (records), D (3D plans), C (2D plans) | T102, T103, T147 |
| P11 | Buy Hold 6 (450) and, on a phone, see the hold row wrap to two rows past 6 cells (Tallow's 7) | A, C | T108, T141 |
| P12 | Open the Mossmere's catalogue (the Journal's Mossmere tab; the book glyph on the Chart's Mossmere row): Sporewood's three seals at its head, the twelve notched, the rule, the places' groups, all 17 fish, hatched until caught, each with its glyphs and **no percentage**; tap a caught fish for its page, an uncaught one for its enlarged silhouette | A (`catalogueFor`), C | T115, T116, T136–T138 |
| P13 | Hear the Mossmere's own sound: its bed through the evening, each owned place in earshot, each bank a muffled version, a deep roll when a giant's back turns, the lift | B | T130, T131 |
| P14 | Complete the list: the catch seal presses with its own stamp and Murk says "Every fish in this water. I'll write that down." | A, B (sound), C | T116, T144 |
| P15 | (Taper) meet each giant at ×1.3 its share, never above 12% | A, B | T105, T124 |
| P16 | (not the player: the user) see the rest of the harbour re-dress beside today's harbour, behind `LOOP.redress` | D, A (switch) | T146, look sheet 4 |

**Left out** (M1 §4 step 3a): Sporewood's day and old water and the Harpstring Eel; place twists and Moonfall (the Bell Pool's
bell shows on every evening without it); the drawn Chart (3b: the sheets, blots, vignettes, leaders, the sealed sheet's drawing);
the tins, the lure slot, lures, Cut Strip, the raft parts and orders (step 4: the bait slot holds only the Heartmoss Ball, and the
Gloam Eel, on Lumen Moss only, does not bite in 3a); the catfish plan (the Matriarch stays carp-shaped); prints (step 5); the finds
row (5c); the pull and the card's list seal, which M1 places in no step (PLAN CHOICE 15).

### 1.2 Tests

Files: A `tools/tests/loop-places.test.mjs` (new), `loop.test.mjs`, `loop-trip.test.mjs`, `roster-species.test.mjs`,
`tools/validate-data.mjs --loop`, `tools/sim/clams.mjs`; B `tools/tests/loop-water.test.mjs` (new, on `fishing-env.mjs`),
`loop-evening.test.mjs`, `audio-mossmere.test.mjs` (new), `tools/audio-render.mjs`; C `tools/tests/ui-catalogue.test.mjs` (new),
`ui-loop.test.mjs`, `loop-tutorial.test.mjs`; D `tools/tests/world-places.test.mjs` (new), `models-plans.test.mjs` (new),
`clarity-perf.scenario.mjs --loop`, `loop-3a.scenario.mjs` (new), `loop-3a-look.scenario.mjs` (new). Numbers continue 1a's series
(T1–T84) from T101.

| id | test | lane · file |
|---|---|---|
| T101 | `LOOP.places` holds exactly the four, in the Chart's order (day, old, night, crown), each price equal to `LOOP.waters.mossmere.prices[kind]` (60, 150, 260, 500); `loopPlace(id)` merges `MOSSMERE_V3`'s geometry, name and landmark; under the loop `ZONES[0].arena.places` and `PLACES` are those four with their kinds; `LOOP.waters.mossmere` has no `places`, so `migrateLoop` on a v2 block owning the Mossmere gives no place (rule 5 stays a no-op); off the loop `PLACES` and the arena are as built | A · loop-places, validate-data |
| T102 | loop `SPECIES` holds the Mossmere's 17 once each: the step-2 eleven, the converter's Thousandcast Pike, Hullkiss Lamprey and Kissmark Trout (`epic` / `epic` / `uncommon`; `lamprey`, `pike`, `trout` plans; the giants with `giant: true` and their `place`), the Bridgechain Sturgeon lifted past the phase pin (`loopLift`, no `weather` under the loop), the Gloam Eel and the Matriarch as built; no other phase-2 record; no forbidden field or research name in `src/` or `index.html`; every new weight within its plan's ±30% (`roster-check`); `roster-shipped.js` equals a fresh export | A · loop-places, roster-species, validate-data, roster-check |
| T103 | `listFor('mossmere')` is exactly SPEC §5.5 (c)'s twelve (the eleven and the Kissmark Trout), never a giant, the legend, the Bridgechain or the Gloam Eel; `listCount` needs 12 | A · loop-places |
| T104 | **the game's pool is the sim's**: `data.placePool` equals `clams.mjs`'s `poolFor` (each species' normalised weight within 1e-9, the giant's share exactly) at open water and each place, in each light, with and without the Heartmoss Ball, with no Wick and with Taper | A · clams.mjs (a printed check) |
| T105 | a giant's share (pure, 20,000 seeded draws of `placePool`): the Thousandcast at Under the Span 6% ± 1 at dusk and night, 2.5% ± 0.7 by day; the Hullkiss at the Buoy Lights 6% ± 1 at night and absent before dark; Taper ×1.3 (7.8% ± 1), never above 12%; neither in open water or at another place | A · loop-places |
| T106 | the giants' land chance: `catchChance` of each giant at Prize on T1 equals the sim's (27% ± 0.5) and is below every other Mossmere fish's at Prize on T1; an Elder giant +2 Fight over that; a Keeper Thousandcast sells 150 and a Trophy 944 (`fishClams`) | A · loop-places |
| T107 | the Matriarch: `catchChance(…, 'legend')` on T1 equals the sim's 27% ± 0.5, never above 50% with wounds; each escape +6 Hold to +18, kept across trips; `priceOf` 500 on her first landing and 200 after (T38's rule through the Bell Pool) | A · loop-places, loop-trip |
| T108 | the shelf, walked through every purchase order the sim's buying order allows: the Maps tab never holds more than three cards (the two cheapest unowned place maps, then Sporewood's sealed card: no price, `buy('lake:sporewood')` refused); the Bell Pool's card appears only once two cheaper maps are owned; `buy('place:<id>')` owns it once; Hold 6 at 450 after Hold 5 (`shelfMax` 6); the Bait tab's Heartmoss Ball at 60, a consumable (never "Yours.", never the goal line) | A · loop-places |
| T109 | `mapCards(D, metaLoop)` is the one rule: the shelf's Maps tab and `chartModel`'s non-null place prices are exactly its cards (a Chart case of the three-cards test) | A · loop-places; C · ui-loop |
| T110 | the Heartmoss Ball in the ledger: `fit('bait', 'heartmoss')` needs one in the Mossmere's bag and is saved in `fitted.bait`; a trip carries the bag; `spendBait` takes one only when she is hooked and a pass gives it back; the tally writes the bag back; a fit with none left is refused | A · loop-trip |
| T111 | an owned place's bite count: its own key, `goodBitesFor({kind})` good bites (day 2, old 3, night 2, crown 2; Tallow +1), quiet terms per place (1a's rule) | A · loop-trip |
| T112 | the lift's ledger: `liftDue()` lists the owned places not yet lifted, in price order; `markLifted(id)` writes `lifted` once and saves; a reload before `markLifted` replays that lift on the next trip | A · loop-trip |
| T113 | a Marked giant: a giant's escape at its place marks it (`giants[id].marked = 1`) for every Wick, at any class (Ashwick's comeback never takes a giant or the legend); `takeGiantMark(id)` gives +6 Hold on its next hook, once, then clears it | A · loop-trip |
| T114 | the best fish there: a measure at a place writes `best[placeId] = {speciesId, length}` when it is the heaviest there (`fishWeight`); open water under `open:mossmere` | A · loop-trip |
| T115 | `catalogueFor(meta, D, 'mossmere')`: the head (name, `have/need`, the three seals while the Mossmere is the frontier); the list's twelve in its order; then Under the Span (the Bridgechain, ★ the Thousandcast), the Buoy Lights (★ the Hullkiss, the Gloam Eel), the Bell Pool (★ the Matriarch); no Lily Maze group; an unowned place's group has `name: null`; all 17 once; each entry's glyphs exactly SPEC §8.8's table (a listed any-hour fish the open-water glyph alone; the Thousandcast dusk and moon; the Matriarch day, dusk and the Heartmoss Ball; the Gloam Eel the moon and no tin, the tin's glyph only for a bait on the shelf); a deep scan of every entry finds no number and no `%`; `finds: null` | A · loop-places |
| T116 | `sealsOf(meta, D, 'sporewood')`: the map seal hollow with no price (`shipped: false`); the gear seal held iff Rod T1 is owned; the catch seal `{have, need: 12}`, held at 12/12; an old v3 save that landed the twelve opens with it held | A · loop-places |
| T117 | saves: a step-2 save (`tools/tests/fixtures/loop-save-m1s2.json`) opens under 3a with its clams, tackle, hold, evenings, `said`, `firsts` and Journal byte-identical, `lifted: []`, `best: {}`, no place owned, `v` still 3; a second `migrateLoop` changes nothing; a trip saved with a place owned and a ball fitted continues with both | A · loop-trip |
| T118 | `validate-data --loop`: T101–T103's shapes; each map card's fish exists in loop `SPECIES` and bites at its place; each place's water clear of islands, docks and the spawn (the v3 place validator on the loop's four); each place's glide-out heading path ≥ raft radius + 0.3 m from every island and pillar (PLAN CHOICE 7); every new `TEXT_LOOP` line ≤ 8 words; **no percentage literal anywhere in `TEXT_LOOP` or `LOOP`**; `LOOP.redress === false`; `LOOP.legendBait.mossmere.price === 60`; `shelfMax === 6` | A · validate-data |
| T119 | the sim reads the moved keys from `data.LOOP` (T42 extended to `place` and `giant`); `--shipped=mossmere --step=3` and `--wicks` pass (Hold 6's "pays its way" a warning); the converter's output equals the sim's table for the fourteen roster and kept fish | A · clams.mjs |
| T120 | flag-off: every new export is inert or empty off the loop; `FISH_SHAPES`, `CATCH_V3`, `AUTOFISH.show.poseRules`, `PLACES` and the arena as built; the v1 and v3 fingerprints unchanged | A · loop-places, validate-data passes 1–3 |
| T121 | a cast into an unowned place's bank (or one not yet lifted): `fishing:mist {placeId}`, the float sinks into the bank and rises, fishing back to `idle` within 2.5 s; no `fishing:bite`, `run.bites` and the bait bag unchanged; no sign spawns inside a bank | B · loop-water |
| T122 | an owned place: `waterAt(p)` gives its key and place; a bite spends there; over 20,000 seeded `rollSpecies` the drawn shares match `placePool`'s (each within 3σ), commons ×0.5, the Lily Maze's koi ×3 and carp ×1.5; open water's pool is the list's twelve and nothing with a `place` | B · loop-water |
| T123 | Elders: 2,000 seeded `rollSize` at the most favour give Elders under the Span and none in open water, the Lily Maze, the Buoy Lights or the Bell Pool, except a giant at its own place (the Hullkiss at the Buoy Lights) | B · loop-water |
| T124 | a giant through fishing: never Small (`z ≥ −0.25`), `+0.3` in its favour terms, never hooked outside its place; over 20,000 bites at Under the Span the T105 shares; Taper's ×1.3 on Taper's trip only | B · loop-water |
| T125 | night water: at the Buoy Lights before `gloomtide` a cast is an open-water cast (`open:mossmere`, open water's pool and good bites, no lamprey, no place favour); from `gloomtide` its own key and pool | B · loop-water |
| T126 | the legend: the ball fitted, the Bell Pool owned and lifted, day or dusk, a free slot: the sure bite (`legendCast`, her nibbles); outside her hour, outside the pool or in its bank: no legend bite and the ball kept; with the ball on, every other bite is a bare-hook bite (no bait favour, the ball kept); she spends it when hooked (`loop.spendBait`), a pass returns it | B · loop-water |
| T127 | a lost giant: `fishing:escaped {markedFish: true, place}` at any class; the got-away note names it (built); its next hook carries `mods.marked` once | B · loop-water |
| T128 | the lift (`loop-home` with a fake clock, world and render): after the glide out and `run:start`, each `liftDue()` place in turn: `place:lift {phase: 'start'}`, `world.liftMist(id, 3)`, `render.frameLandmark(…)`, after 3 s `{phase: 'title'}`, after 1.2 s `{phase: 'end'}` and `markLifted`; `ctx.cinematic` true throughout (the evening clock still, T14's rule); a tap or a skip key ends the running lift at once (the bank gone, marked); reduced motion skips the thinning, the title still shows; no Home press and no cast during it | B · loop-evening |
| T129 | Sail with a place: `game.sail({water, place})` saves the pick; the glide out heads toward the place (`sailPlan` with its centre); open water's glide is 1a's (T66 unchanged) | B · loop-evening |
| T130 | the Mossmere's sound rules (pure): the bed's layers by light (late day, dusk, night); each lifted place's voice by distance (full within 12 m, gone past 30 m); a standing bank's voice low-passed; the roll on `world:giantBack`; the music rule as built (PLAN CHOICE 17) | B · audio-mossmere |
| T131 | `node tools/audio-render.mjs --set=mossmere` writes `bed_day`, `bed_dusk`, `bed_night`, each place (`lily`, `span`, `buoys`, `bell`) clear and muffled, `giant_roll`, `mist_lift` and `seal_press` (WAV + spectrogram), and exits 1 if the master's peak passes −1.0 dBFS in any | B · audio-render |
| T132 | flag-off: fishing on v1 data and v3-without-loop data unchanged (the v1 golden trace; `fishing-*` tests unchanged); `placeAt`, `speciesPool` and `capZ` off a trip as built | B · loop-water |
| T133 | `chartModel` (M1 §3.8's shape, signature unchanged): a fresh save gives one sheet with the four places in Chart order, each `{id, kind, owned: false, price, best: null, giantLanded: false, marked: false, wounds: 0}` (prices from `mapCards`: 60, 150, null, null); `next: {waterId: 'sporewood', shipped: false, seals}`; in the tutorial every price null and `next` null; an owned place's price null, `best` from `meta.loop.best`, `giantLanded` from `giants`, `marked`, the Bell Pool's `wounds` | C · ui-loop |
| T134 | the list Chart: a row per owned place and per priced place, nothing else, in Chart order, each `[data-place=<id>]` with its kind glyph (an owned row its name, and its giant's ★ once landed); a priced row opens Murk's map card; an owned row is chosen (underlined, `chart:pick`); the Mossmere row's book glyph `[data-action=catalogue]` opens the catalogue; the bait slot `[data-slot=bait]` fits and unfits the Heartmoss Ball, its count on it; in the tutorial exactly 1a's list (T65 and T67 unchanged) | C · ui-loop; D · scenario |
| T135 | a map card: its fish's ink drawing beside the Wick's at their true lengths, its hour glyph, its line (`TEXT_LOOP.maps`), the price button (dimmed when too dear); Sporewood's sealed card: its wax, the three seals, "Coming soon" where the price would be, no buy button | C · ui-catalogue |
| T136 | the catalogue's view: six cards a row at 960 px, three at 358 px; every card and seal a ≥ 44 px target, none overlapping; an uncaught card is the hatch, "· · ·" and its glyphs (a listed one exactly §5.5 (f)'s items); a caught card its ink drawing and name; giants gold-edged with ★, the Matriarch's card gold; **no number and no `%` in any fish card or enlarged silhouette** (a DOM text scan, the giants and the legend included); **Odds ›** at the foot; no tab, card or name of an unowned water (Sporewood has no tab); off the loop the built Journal unchanged | C · ui-catalogue; D · scenario (both sizes) |
| T137 | the hatch (`drawFish(…, {hatch: true})`): a pixel probe at 116×62, 100×54 and 240×128 finds every drawn pixel in the sepia ink's hue band and at most 55% ink, no eye, no colour, no inner line; caching by species, size and mode; off the loop `silhouette` unchanged | C (the probe, `ctx.debug.ui.hatchProbe`); D · scenario |
| T138 | a tap: a caught fish opens its built species page with its odds block as built; an uncaught fish's silhouette enlarges with its glyphs and no word or number; **Back** or a tap closes it; the head's gear seal opens the shelf at Rod T1's card, the catch seal scrolls to the list | C · ui-catalogue; D · scenario |
| T139 | the gold card: a giant's name reads "★ " before it and its class seal is stamped gold; the Matriarch's card **Keep · 500** / **Let go** on her first landing, **Keep · 200** after; no number on the card but the value, the weight and the length line | C · ui-catalogue |
| T140 | the giants' page: the Journal's ★ tab shows exactly the Mossmere's three, hatched until landed, then each gold-framed ink drawing with its best weight; no other water's giant | C · ui-catalogue |
| T141 | the hold row: up to 7 cells fit beside the right cluster at 390 px, two rows past 6; the dots up to 9; desktop one row | C · ui-loop; D · scenario (phone) |
| T142 | the lift's title card: `place:lift {phase: 'title', name}` shows the place's name in an ink title card for 1.2 s, then nothing; no other word; never in world space | C · ui-loop |
| T143 | words: every new visible text node is a `TEXT_LOOP` string, a place's or a fish's name, a number (a price, a weight, the count "n/12") or a built word (T43's allow-list helper, extended); no percentage literal in `ui-loop.js`, `ui-screens.js`'s loop branches or `TEXT_LOOP` (a source scan) | C · ui-loop |
| T144 | Murk's lines, each once a save: "It's in the mist. Go and look." after the first place map; "That one had a name before you met it." at the first giant sold; "Her. You brought me her. Sit down, I'll count it twice." at the Matriarch's first tally; "Every fish in this water. I'll write that down." at the first home after the list completes, with `loop:seal {seal: 'catch'}` (the stamp); the ball's shelf line "For the Belled Matriarch. One try." | C · ui-loop |
| T145 | the banks and the dressing (node, three.js): one bank per place not yet lifted, inside its water's footprint plus 1.5 m, none over a dock, the spawn or a glide-out path; `liftMist(id, s)` takes its opacity to 0 over s; every place's dressing built once (merged by material) with its emissive terms off until lifted; the banks one merged mesh | D · world-places |
| T146 | determinism and the switch: the Mossmere's built geometry (rocks, organics, pads, reeds, docks, lamp-posts) hashes the same with the loop off and with the loop on minus the places' meshes (the extra Lily Maze pads come from their own seeded stream after every builder); `LOOP.redress` off builds no W9 mesh and keeps the lamp-posts; on, the bollards replace them and the toll-tower and the Sluice Veil (no spout) appear | D · world-places |
| T147 | the three plans under the loop: `createFish` builds `lamprey` (no jaw or paired fins, a toothed disc mouth, seven gill holes lit lavender), `sturgeon` (scutes, shovel snout) and `trout` (a fatty fin, a jaw); each species' true length within 2% of its size model; off the loop a species with one of those shapes draws as today's fallback | D · models-plans |
| T148 | draw calls (`clarity-perf --loop`, high and low, desktop and `--mobile`): the Mossmere at night, the four banks up, a giant's show: frame ≤ 200 / ≤ 150 and world ≤ 54 / 42 (DESIGN §25.8.8); the same with every place lifted, with `LOOP.redress` off and on; `cpuMs` per tier ≤ +15% of the step-1 baseline (measured on M, §5 step 0) | D · clarity-perf |
| T149 | the browser scenario (desktop 960×540, phone 390×844), from a seeded save (Hold 5, T1, clams): the Chart's rows → buy the Lily Maze from its row's card → Sail toward it → its lift (bank thins, title card) → a cast into the Buoy Lights' bank (nothing spent) → home → the other maps and two balls → fit one → Sail to the Bell Pool by day → her sure bite → her card **Keep · 500** → home: the tally pays 500, Murk's line → a forced Thousandcast at Under the Span at dusk → the gold card → the catalogue (the head, all 17, no `%`, the hatch probe) → Hold 6 and the two-row hold on the phone; a DOM scan of the HUD, the strike, the play and the show finds no `%` and no size before the card (SPEC decision 62); no console error; after every Sail `debug.ui().stack` empty | D · loop-3a.scenario |
| T150 | the look scenario captures every frame §6 asks for into `notes.json`; `tools/look-sheet.mjs` composes the four sheets | D · loop-3a-look.scenario, look-sheet |

---

## 2. Lanes

Four lanes, in four worktrees: A off M, then B, C and D off M+S. Each owns its files outright; a lane that needs a line in a
file it does not own files a cross-file request (§2.5). **No lane edits** `build.mjs`, `src/template.html`, `src/chart-draw.js`,
`src/chart-art.js`, `src/ui-chart.js`, `tools/world-map/` (3b's) or `index.html` (the stage's, last).

| lane | name | branch / worktree | owns |
|---|---|---|---|
| A | the ledger | `gw-m1-s3a-ledger` · `.gw-wt/m1-s3a-ledger` | `src/data.js`, `src/core.js`, `src/progression.js`, `src/progression-loop.js`, `src/progression-af.js`, `src/progression-market.js`, `src/progression-v3.js`, `src/roster-species.js`, `src/roster-shipped.js` (generated), `tools/roster-export.mjs`, `tools/validate-data.mjs`, `tools/sim/clams.mjs`, `tools/sim/roster-check.mjs`, `tools/tests/loop-fixture.mjs`, `loop.test.mjs`, `loop-trip.test.mjs`, `roster-species.test.mjs`, new `loop-places.test.mjs`, new `tools/tests/fixtures/loop-save-m1s2.json`, `CONTRACT.md` (§14's 3a lines), `docs/loop/roster.json` and `ROSTER.md` (the three fish's `refWeight` and weights row only) |
| B | the evening and its sound | `gw-m1-s3a-water` · `.gw-wt/m1-s3a-water` | `src/fishing.js`, `src/fishing-reel.js`, `src/fishing-play.js`, `src/fishing-fx.js`, `src/fishing-signs.js`, `src/main.js`, `src/loop-home.js`, `src/loop-rules.js`, `src/player.js`, `src/survival.js` (read only unless needed), `src/audio.js`, `src/audio-v3.js`, `src/audio-sfx.js`, new `src/audio-mossmere.js`, `tools/audio-render.mjs`, `tools/tests/fishing-env.mjs`, `audio-env.mjs`, `loop-evening.test.mjs`, new `loop-water.test.mjs`, new `audio-mossmere.test.mjs` |
| C | the screens | `gw-m1-s3a-screens` · `.gw-wt/m1-s3a-screens` | `src/ui-loop.js`, `src/ui-screens.js`, `src/ui-hud-v3.js`, `src/ui-fishart.js`, `src/ui-icons.js`, `src/ui-measure.js`, `src/ui.js`, `src/ui.css`, `src/loop-tutorial.js`, `tools/tests/ui-loop.test.mjs`, `loop-tutorial.test.mjs`, new `ui-catalogue.test.mjs` |
| D | the world, the fish and the look | `gw-m1-s3a-world` · `.gw-wt/m1-s3a-world` | `src/world.js`, `src/world-art.js`, `src/world-fx.js`, `src/world-v3.js`, `src/world-layout.js` (read only unless needed), new `src/world-places.js`, `src/render.js`, `src/render-camera.js`, `src/models-fish.js`, `src/actors-show.js` (and the other `actors*.js`, only if a look needs it), `tools/tests/clarity-perf.scenario.mjs`, `loop-1a.scenario.mjs` (a fix only, if a 3a row trips it), new `world-places.test.mjs`, new `models-plans.test.mjs`, new `loop-3a.scenario.mjs`, new `loop-3a-look.scenario.mjs`, new `tools/look-sheet.mjs` |

### 2.0 The seam commit S (lane A, first; B, C and D branch from M+S)

One commit on A's branch off M, merged by the stager before anything else, so no lane codes against a name that does not exist:

- **`data.js`**: every table of §3.1 (`LOOP.places`, `LOOP.place`, `LOOP.giant`, `LOOP.legendBait`, `LOOP.lift`, `LOOP.giantBack`,
  `LOOP.redress`, `LOOP.hold.shelfMax = 6`, the new `TEXT_LOOP` words), the pure helpers (`loopPlace`, `loopPlaceIds`, `loopHours`,
  `placePool`, `giantShare`), `ROSTER_ART` for the three new fish with the plan parameters D builds against, and the apply block's
  loop lines (§2.1 item 3).
- **`roster-shipped.js`** re-exported with the three fish (`node tools/roster-export.mjs`), and `roster-species.js` accepting
  `epic`, the giants' `place` and the two new plans.
- **`core.js`**: the dev flag `?redress=1` (PLAN CHOICE 13), read once beside `?loop`.
- **`progression-loop.js`**: the pure `mapCards`, `sealsOf`, `liftDue`, `catalogueFor` implemented (§3.2), and `createLoop`'s new
  methods as inert stubs (`null`, `false`, `[]`, `{ok: false}`), `LOOP_METHODS` extended.
- **`tools/tests/loop-fixture.mjs`**: `fakeLoop` with the new methods; `placesMeta(D, {own, lifted, balls, holdSlots, tackle,
  caught})` (a meta with places owned and lifted, Heartmoss Balls in the bag, the hold and tackle set, Journal entries caught).
- **`tools/tests/fixtures/loop-save-m1s2.json`**: a step-2 save (Hold 5, T1/T1/T0, 412 clams, 9 evenings, eight of the list
  caught, a `lastTrip`), written once from M's code by a one-off script kept in the commit message.
- **`CONTRACT.md` §14**: the names of §3 (events, APIs, save fields).

S leaves the gate green (`validate-data`, `check.mjs --quick`, the sim's step 3) and the flag-off checks untouched. Between S and B
a dev build lets a giant bite in open water (the built pool ignores `place`); nothing ships between S and the stage.

### 2.1 Lane A: the ledger

1. **The tables and words (S).** §3.1. The places' geometry, names and landmarks stay `MOSSMERE_V3`'s (one record per place);
   `LOOP.places` adds only what the loop decides. `TEXT_LOOP` gains the four map lines, the ball's shelf line, "Coming soon", Murk's
   four lines (§8.6), the ★ tab's accessible name; every line ≤ 8 words and no digit or `%`.
2. **The species (S).** `SPECIES_LOOP` gains the three roster fish (the converter: `epic`, `giant: true`, `place` from the
   `placeName`), the Bridgechain Sturgeon lifted (as the Lampsipper in step 2; `weather` and `prefers` dropped under the loop), the
   Gloam Eel and the Matriarch unchanged. `ROSTER_ART` draws the Thousandcast (stone-white with dark upright bars, rust fins, an
   amber eye rim, no glow), the Hullkiss (ink back, stone belly, amber teeth, seven gill holes lit lavender), the Kissmark (slate,
   ivory star-spots, rust-edged fins, one pale round scar), as ROSTER §3.1 describes them.
3. **The apply block, under `LOOP_ENABLED` only (S).** `moss.arena.places` = the four with their `kind`, `PLACES` likewise;
   `FISH_SHAPES` += `lamprey`, `sturgeon`, `trout`; `CATCH_V3.rarity.epic` = rare + `LOOP.giant.fight` (+10),
   `CATCH_V3.elderRarity.epic` = rare's + `LOOP.giant.elderFight` (+2); `AUTOFISH.show.poseRules.thin` += `lamprey`; the Heartmoss
   Ball's loop price 60 through `LOOP.legendBait` (the built `BAITS` row untouched).
4. **The shelf.** `shelfItems` gains the Maps tab from `mapCards` (the two cheapest unowned place maps, then Sporewood's sealed card,
   `{id: 'lake:sporewood', sealed: true, seals}`), the Bait tab's Heartmoss Ball (`bait:heartmoss`, a consumable: `count` and never
   `bought`), Hold 6. `buy` handles `place:<id>` (to `maps.places`), `bait:heartmoss` (+1 to `bait.mossmere.heartmoss`), refuses the
   sealed card. `goalOf` skips consumables (PLAN CHOICE 6).
5. **The ledger's new methods.** `fit(slot, id)` / `fitted()` (the bait slot; `loop:fit`), `spendBait(id)` / `refundBait(id)`
   (the ball, only by her hook), `liftDue()` / `markLifted(id)` / `lifted()`, `markGiant(id)` and `takeGiantMark(id)` (the Marked
   giant, once), `noteBest(fish, key)` from `measure`, `setPick({water, place})` / `pick()` (`meta.loop.chartPick`), `mapCards()`,
   `seals(waterId)`, `catalogue(waterId)`. `createTrip` sets `run.equippedBait` from `fitted.bait` when the bag holds one.
   `progression-af`'s bait spend takes the legend bait only through `spendBait` under the loop (the cast keeps it); `onEscaped`
   marks a giant at its place for every Wick and never queues a comeback for a giant or the legend. `progression.js` `measure`
   records the best fish there and carries `giant: true` on a giant's fish (the hold's gold edge, the tally's last place).
6. **The sim** (this plan's one sim change; QUEUE jobs 6 and 8 own the file, lane A edits it for 3a as 1a's lane A did). `clams.mjs` reads `LOOP.place` and `LOOP.giant` from data (`MOVED` += `place`, `giant`; its `DRAFT.giant`,
   `kindWeight`, `dayDraw`, `placeCommon`, `kept` and `favour.place/window` deleted), keeps its own `poolFor` and adds T104's printed
   check of it against `data.placePool`, and keeps every step-3 figure (M1 §6.2's step row re-printed in the docs commit if one
   moves). The three new fish get their docs-only `refWeight` in `docs/loop/roster.json` for `roster-check`'s ±30% rule (and
   ROSTER's weights row), as step 2's eight did.
7. **The validator.** T101–T103, T118 in the `--loop` pass; passes 1–3 keep proving the flag-off data unchanged (never
   `--refresh-fingerprint`; `slice-1a/PLAN.md` §4.3).

**Acceptance (A):** `node tools/validate-data.mjs` (all passes), `node tools/check.mjs --quick` with T101–T120 green, `node
tools/sim/clams.mjs --quick`, `--shipped=mossmere --step=3` and `--step=3 --wicks` (all checks; the warnings listed), `node
tools/sim/roster-check.mjs`; the hand-off names each sim figure that moved and why.

### 2.2 Lane B: the evening and its sound

1. **The pool by place.** Under the loop on a trip, `rollSpecies` draws from `data.placePool(SPECIES, {placeId, phase, bait,
   wickId})` with the built multipliers that already apply (the rarity bonus, signs, Taper's first bite) on the others, and the
   giant's weight set last from its fixed share of the rest, so its share stays exact. Open water's pool is the list's twelve.
2. **The places' rules.** An owned, lifted place is a place (`waterAt`, its key, its good bites, `LOOP.place.favour`); an unowned
   place or one whose lift has not played is mist (item 3); night water before `gloomtide` is open water (PLAN CHOICE 3). Elders:
   `capZ` lets an Elder roll in old water and for a giant at its own place, nowhere else under the loop. A giant: `minZ −0.25`,
   `+0.3` favour, its Fight through data; a Marked giant's hook carries `mods.marked` once (`takeGiantMark`).
3. **A cast into mist.** The bob lands in a bank: `fishing:mist {placeId}`, the float sinks into the bank (`fishing-fx`) and rises
   within 2 s, back to `idle`; no bite, no bait, no sign spawned inside a bank.
4. **The legend.** Her pool is the owned, lifted Bell Pool's water (PLAN CHOICE 4); with the ball fitted, her hour and a free slot
   (a full hold refuses the cast already), the built sure bite; a non-legend bite with the ball on is a bare-hook bite; her hook
   calls `loop.spendBait`, a pass `refundBait`.
5. **The lift (main / `loop-home.js`).** At `run:start` (not `continued`), for each `loop.liftDue()` place in turn: `ctx.cinematic`
   on, `place:lift {placeId, phase: 'start', name}`, `world.liftMist(id, LOOP.lift.thin)`, `render.frameLandmark(landmark, {dur})`;
   at 3 s `{phase: 'title'}`; at 4.2 s `{phase: 'end'}`, `markLifted`, the camera back (0.6 s), `cinematic` off. A tap or a skip key
   ends the running lift; reduced motion skips the thinning. `world.setPlaces({lifted})` at `run:start`, `home:enter` and after a
   buy. `game.sail({water, place})` (PLAN CHOICE 7) and `game.lifting()`.
6. **Debug hooks** for D's scenarios: `ctx.debug.loop.own(id | 'all')`, `.lift(id)`, `.giveBait(id, n)`, `.at(placeId)` (the raft
   into a place's water), `.places()` (owned, lifted, banks).
7. **The Mossmere's sound** (`audio-mossmere.js`, pure rules; `audio.js` plays them): the bed by light (late day's water and air,
   dusk's thinner air, night's low tones); each lifted place in earshot (the Lily Maze's drip and sip, the chains under the Span,
   the Buoy Lights' low hum, the Bell Pool's far toll now and then); a standing bank's voice low-passed and quieter; a deep roll on
   `world:giantBack`; `mist_lift` on `place:lift {phase: 'start'}`; `seal_press` on `loop:seal`. All under the −1.0 dBFS master.
   `tools/audio-render.mjs --set=mossmere` (T131).

**Acceptance (B):** `node tools/check.mjs --quick` with T121–T132 green and `loop-evening`, `fishing-*`, `audio-*`,
`v1-fishing-trace` unchanged; `node tools/audio-render.mjs --set=mossmere` exit 0, its spectrograms looked at; esbuild bundles.

### 2.3 Lane C: the screens

1. **`chartModel`'s places and next** (pure, signature unchanged; M1 §3.8): from `mapCards`, `meta.loop.best`, `giants`, `lifted`,
   the Matriarch's wounds and `sealsOf`; in the tutorial no prices and `next: null`. 3b draws exactly this model.
2. **The list Chart** (M1 §3.6): its rows (owned, priced), the pick, the book glyph, the bait slot under the rows (the Heartmoss
   Ball and its count; fit / unfit), the hold's slots, **Sail** with `{water, place}`. Keep the list's drawing in one function,
   `renderChartList(entry, body, model)`, so 3b's `openChart` can fall back to it whichever lands first.
3. **The shelf's Maps and Bait tabs**: the map card (the fish's ink drawing beside the Wick's at true lengths, the hour glyph, the
   line, the price), Sporewood's sealed card (the wax, the three seals, "Coming soon"; its seals open as on the Chart, SPEC §5.5
   (f): the gear seal Rod T1's card, the catch seal the catalogue's list), the ball's card (its count, its line, 60).
4. **The catalogue** (SPEC §8.8, M1 §2.17) in `openJournal`'s loop branch, from `loop.catalogue('mossmere')`: the head with the
   three seals (the map seal hollow under "Coming soon"), the list, the rule, the places' groups, **Odds ›**; the enlarged
   silhouette; the ★ tab (the giants' page, PLAN CHOICEs 11 and 25). `ui-fishart.js`: the `hatch` mode and the 2D `lamprey`,
   `sturgeon` and `trout` plans, both read only under the loop (PLAN CHOICE 14); `ctx.debug.ui.hatchProbe(id, w, h)`.
5. **The card**: the gold ★ and the gold stamp (`ui-measure.js`) for a giant; the legend's Keep values (built).
6. **The lift's title card** on `place:lift {phase: 'title'}` (1.2 s, the place's name, in the HUD layer). **Murk's lines**
   (T144) at their moments; the catch seal's press (`loop:seal {seal: 'catch'}`) at the first home after the list completes.
7. **The hold row's wrap** (`ui-hud-v3.js`), the kind glyphs (sun, ring, moon, crown), the ball's and the book's glyphs
   (`ui-icons.js`).

**Acceptance (C):** `node tools/check.mjs --quick` with T133–T144 green, `ui-v3`, `ui-af`, `ui-screens-v3`, `ui-show`,
`loop-tutorial` (T65, T67) unchanged; esbuild bundles.

### 2.4 Lane D: the world, the fish and the look

1. **`world-places.js`**, built only when `LOOP_ENABLED`: the banks (one merged mesh, each place's footprint feathered 1.5 m, the
   built mist material's family in lavender, a per-bank opacity; sailing through it thins it round the camera, never a ring); the
   landmarks inside as dark shapes (the dressing seen through the bank); the giant's back (the built night-ink silhouette, no
   species shape, at dusk and night in Under the Span's and the Buoy Lights' banks, `world:giantBack`); `setPlaces`,
   `liftMist`, `placeAnchor`.
2. **Each place's dressing**, from `MOSSMERE_V3`'s `look` and `build`, built for all four at once, emissive terms off until
   lifted (PLAN CHOICE 9): the Lily Maze's pads at twice the local density (a stream of their own after every builder) with
   glow-buds under them; Under the Span's three arch spans, broken deck and hanging chains over the Toppled Bridge's piers
   (W9's `span_arches`); the Buoy Lights' two rows of depth-tinted glow decals under 24 emissive float caps (one InstancedMesh);
   the Bell Pool's drowned bell as a depth-tinted decal on its floor with its crack's verdigris (a trace). Inside §25.8.8's
   place-props line (+4 / +3 with the arches). Colours from the Starlit palette (lavender, pale stone, candle amber, rust; green
   only as the bell's trace).
3. **W9's rest behind `LOOP.redress`** (off): rust bollards and buoy-lanterns for the lamp-posts (the dock-buoy InstancedMesh, 0
   net), the leaning toll-tower on the Sunken Gate (+1), the Sluice Veil card and two aqueduct segments with no spout (+2).
4. **The lift's shot** (`render-camera.js`): `frameLandmark(p, {dur})` frames the landmark from the raft's side for the lift and
   eases back to the sail camera in 0.6 s.
5. **The three plans** (`models-fish.js`, read only under the loop): `lamprey` from the eel with a mouth parameter (ROSTER §4),
   `sturgeon` from the leviathan profile with scutes and a shovel snout, `trout` from the minnow with a fatty fin and a jaw; the show
   holds each well (the lamprey hangs, `poseRules.thin`).
6. **The scenarios and the look tools**: `clarity-perf --loop` (T148, and the step-2 baseline the stager takes first),
   `loop-3a.scenario.mjs` (T149), `loop-3a-look.scenario.mjs` and `tools/look-sheet.mjs` (T150, §6; ImageMagick `montage`, as
   `show-sheet.mjs` uses).

**Acceptance (D):** `node tools/check.mjs --quick` with T145–T147 green and `world`, `world-v3`, `render-v3`, `actors-v3`
unchanged; every scenario parses (`node --check`) and dry-runs its pure helpers; one capture of each place on its own worktree
build, looked at and fixed, under `nice -n 5`, one browser at a time.

### 2.5 Cross-file requests (the stager applies any that the owner's branch arrives without)

| needed by → owner | file · where | the line |
|---|---|---|
| B, C, D → A | data.js, progression-loop.js, loop-fixture.mjs, the save fixture | everything in S (§2.0) |
| B → A | progression-loop `createLoop` | `spendBait`, `refundBait`, `liftDue`, `markLifted`, `markGiant`, `takeGiantMark` real (not stubs) |
| B → A | progression-af bait spend | under the loop the legend bait is spent only by `spendBait` (never at the cast) |
| C → A | progression-loop | `mapCards()`, `seals()`, `catalogue()`, `fit()`, `setPick()`, `buy('place:…' \| 'bait:heartmoss')`, `sayOnce('firstMap' \| 'firstGiant' \| 'legendFirst' \| 'listComplete')` |
| C → B | main.js `game` | `sail({water, place})`, `lifting()` |
| C, D → B | main.js / loop-home.js | `place:lift {placeId, phase, name}` (start, title, end); `fishing:mist {placeId}` |
| D → B | main.js | `world.setPlaces({lifted, owned})` at `run:start`, `home:enter` and after `loop:buy`; `world.liftMist`, `render.frameLandmark` in the lift |
| D → B | main.js debug | `ctx.debug.loop.own`, `.lift`, `.giveBait`, `.at`, `.places` (§2.2 item 6) |
| B → D | world-places.js | `world:giantBack {placeId, x, z}` when a back turns |
| B → C | ui-loop.js | `loop:seal {seal: 'catch'}` at the press beat |
| D → C | ui-screens.js / ui-fishart.js | `ctx.debug.ui.hatchProbe(id, w, h)` → `{pixels, offHue, maxInk}` |

---

## 3. The seam

The stub rule of `slice-1a/PLAN.md` §3 holds: S's data, pure helpers and fixture are imported directly; a neighbour's runtime
object (`ctx.progression.loop`'s new methods, `ctx.world.liftMist`, `ctx.render.frameLandmark`, `ctx.game.lifting`) is read
through optional chaining, an absent one meaning the built behaviour, never a throw.

### 3.1 data.js (lane A, S)

```js
LOOP.hold.shelfMax = 6;                    // Hold 6, the Wellbox, 450 (M1 §2.5)
LOOP.places = {                            // the Chart's order; geometry, name and landmark are MOSSMERE_V3.places' record of the same id
  lily_maze:      { water: 'mossmere', kind: 'day',   price: 60,  card: 'candlefin_koi',     draws: { candlefin_koi: 3, weeping_carp: 1.5 } },
  under_the_span: { water: 'mossmere', kind: 'old',   price: 150, card: 'thousandcast_pike', giant: 'thousandcast_pike', own: ['bridgechain_sturgeon'] },
  buoy_lights:    { water: 'mossmere', kind: 'night', price: 260, card: 'hullkiss_lamprey',  giant: 'hullkiss_lamprey' },
  bell_pool:      { water: 'mossmere', kind: 'crown', price: 500, card: 'belled_matriarch',  legend: 'belled_matriarch' },
};
LOOP.place = { common: 0.5, dayDraw: 1.5, kindWeight: 2.5, kept: { weight: 3, live: 0.5 },     // the sim's (moved, T42)
  favour: { base: 0.15, window: { day: 0.4, old: 0.4, night: 0.3, crown: 0.2 } } };            // day +0.55 … crown +0.35 (SPEC §3.3)
LOOP.giant = { share: { inHour: 0.06, offHour: 0.025 }, favour: 0.3, minZ: -0.25, fight: 10, elderFight: 2, markedHold: 6 };
LOOP.legendBait = { mossmere: { id: 'heartmoss', price: 60 } };                                // one try (SPEC §4.6)
LOOP.lift = { thin: 3, title: 1.2, back: 0.6 };                                                // seconds (SPEC §5.1 rule 7)
LOOP.giantBack = { every: [25, 45], dur: 2, phases: ['dusk', 'gloomtide'], places: ['under_the_span', 'buoy_lights'] };
LOOP.redress = LOOP_ENABLED && globalThis.GW_REDRESS === true;                                // false unless ?redress=1 (core, PLAN CHOICE 13)
TEXT_LOOP.maps = { lily_maze: 'Koi glow under the pads like lanterns.', under_the_span: 'The bridge kept its chain. Something kept it.',
  buoy_lights: 'The harbour lights went under, still lit.', bell_pool: 'The moon looks in on the old bell.' };
TEXT_LOOP.shelf.heartmoss = 'For the Belled Matriarch. One try.';
TEXT_LOOP.comingSoon = 'Coming soon';
Object.assign(TEXT_LOOP.murk, { firstMap: "It's in the mist. Go and look.", firstGiant: 'That one had a name before you met it.',
  legendFirst: "Her. You brought me her. Sit down, I'll count it twice.", listComplete: "Every fish in this water. I'll write that down." });
TEXT_LOOP.tabs.giants = 'Giants';          // the ★ tab's accessible name; no visible word (PLAN CHOICE 25)

/** A place of the loop: LOOP.places[id] merged over MOSSMERE_V3's record ({id, name, water, landmark, look, build, kind, price, …}); null if none. */
export function loopPlace(id) → object | null;
/** The places of a water in the Chart's order (day, old, night, crown). */
export function loopPlaceIds(waterId = 'mossmere') → string[];
/** A species' hour window in the sim's words: ['day'], ['dusk', 'night'], ['day', 'dusk', 'night'] … (LOOP.hours, or the built timeOk words). */
export function loopHours(sp) → string[];
/** The sim's pool rule (clams.mjs poolFor) on the game's records, no lure and no pull (3a): open-water fish everywhere (×LOOP.place.common
 *  for a common at a place, a day water's uncommon and rare ×dayDraw, a place's draws), a place's own fish (kept weight × live), its
 *  kind's fish (×kindWeight), the bait-only fish only on their bait; the giant as a fixed share of the rest. phase: 'calm'|'dusk'|'gloomtide'. */
export function placePool(species, { placeId = null, phase, bait = null, wickId = null }) → { list: [[sp, w]], giant: { sp, share } | null };
/** A giant's share of the bites at its place: inHour / offHour, ×LOOP.wicks.taper.giantShare for Taper, never above giantCap. */
export function giantShare(sp, phase, wickId = null) → number;
```

`ROSTER_ART.thousandcast_pike | hullkiss_lamprey | kissmark_trout` carry `model` colours and the plan parameters D builds against:
lamprey `{mouth: 'disc', teeth: 'amber', gills: 7, gillGlow: 0xb8b0ee}`, trout `{fattyFin: true, jaw: 'plain', spots: 'stars',
scar: true}`, pike `{bars: 'upright', eyeRim: 'amber'}`; the Bridgechain's built `model` gains `{scutes: 'rust', snout: 'shovel'}`
under the loop.

### 3.2 progression-loop.js (lane A; pure from S, methods real in A)

```js
/** Murk's map cards (SPEC §5.1 rule 8): the two cheapest place maps not owned, then the next lake's card; ≤ 3, in that order. */
export function mapCards(D, metaLoop) → [{ id: 'place:<id>', placeId, price, fish, line, hours }, …, { id: 'lake:sporewood', waterId, sealed: true, seals }];
/** The next water's three keys as the save stands (SPEC §5.5 (f)); in M1 the map seal is always hollow ("Coming soon"). */
export function sealsOf(meta, D, waterId = 'sporewood') → { map: { held: false, price: null, shipped: false }, gear: { held, item: 'rod:1', tier: 1 }, catch: { have, need, held } };
/** The owned places whose mist has not lifted yet, in price order. */
export function liftDue(D, metaLoop) → string[];
/** The catalogue (SPEC §8.8): the head, the list, the places' groups; never a number in an entry (revision 7); finds: null until 5c. */
export function catalogueFor(meta, D, waterId) → { head: { waterId, name, have, need, seals | null }, list: Entry[], groups: [{ placeId, kind, owned, name | null, entries: Entry[] }], finds: null };
// Entry: { id, caught, giant, legend, hours: ('sun'|'dusk'|'moon')[], place: 'open'|'day'|'old'|'night'|'crown'|null, bait: baitId | null }

// createLoop(S) gains (stubs in S, real in A; LOOP_METHODS lists them):
fit(slot, id) → { ok }   fitted() → { lure, bait }   spendBait(id) → bool   refundBait(id) → bool
liftDue() → string[]     markLifted(id)              lifted() → string[]
markGiant(id)            takeGiantMark(id) → bool    noteBest(fish, key)
setPick({ water, place }) pick() → { water, place }  mapCards()   seals(waterId)   catalogue(waterId)
```

### 3.3 Save (lane A owns it)

`meta.loop` gains `lifted: []` (place ids whose lift has played), `best: {}` (`<placeId | open:mossmere>` → `{speciesId, length}`)
and `chartPick: {water, place} | null`; `maps.places`, `bait.mossmere.heartmoss`, `fitted.bait`, `giants[id].marked` and `said`
are 1a's fields, now used. **`LOOP_SCHEMA` stays 3** (PLAN CHOICE 1): the new keys are additive and `migrateLoop`'s fill gives
them to every block; bumping it would re-run rule 5 on every 1a and step-2 save. No weight is ever saved (pounds' rule).

### 3.4 Events and APIs

| name | from → to | payload / shape |
|---|---|---|
| `place:lift` | B → C, D (via B), audio | `{placeId, phase: 'start' \| 'title' \| 'end', name}` |
| `fishing:mist` | B → audio, scenario | `{placeId}` |
| `world:giantBack` | D → audio | `{placeId, x, z}` |
| `chart:pick` | C → audio, 3b | `{water, place}` (M1 §3.8) |
| `loop:fit` | A → C, audio | `{slot, id}` |
| `loop:buy` | A (built) | `{item, price, clams}`; items `place:<id>`, `hold:6`, `bait:heartmoss` |
| `loop:seal` | C → audio | `{seal: 'catch'}` |
| `world.setPlaces({lifted, owned})`, `world.liftMist(id, s) → bool`, `world.placeAnchor(id) → {x, y, z}` | D | read by B |
| `render.frameLandmark(p, {dur, back}) → bool` | D | read by B |
| `game.sail({water, place})`, `game.lifting() → placeId \| null` | B | read by C, D |

### 3.5 The fixture

`loop-fixture.mjs` (A): `placesMeta(D, {own = [], lifted = own, balls = 0, holdSlots = 5, tackle = {rod: 1, line: 1, reel: 1},
caught = []})`; `fakeLoop` answers every new method on its own small state (`mapCards`, `seals`, `catalogue` through the real pure
functions) and logs its calls. `fixtures/loop-save-m1s2.json` is the step-2 save every 3a save test opens (M1 §7 risk 14: a save
from each step kept as a fixture).

---

## 4. Flag-off safety

`slice-1a/PLAN.md` §4.1's nine rules hold unchanged (one switch read once; trip-only behaviour on `run.outing === 'trip'`; no
reordering; payloads widened only under the loop; `meta.loop` only under the loop; byte-identical hot paths; no v1 or v3 table
mutated outside `if (LOOP_ENABLED)`; new modules inert off the loop; never `--refresh-fingerprint`). For 3a in particular:

- **Data**: every new table and helper is a new export; every edit of a built table (`FISH_SHAPES`, `CATCH_V3`, `AUTOFISH.show`,
  the arena, `PLACES`, the Bridgechain's record) is in the apply block under `LOOP_ENABLED`; `MOSSMERE_V3` and the `P >= 2` path
  are not edited, so a v3 phase-2 build is as today. Passes 1–3 of `validate-data` and `tools/tests/v3-exports.json` prove it.
- **The fish plans** (3D and 2D) and the **hatch** are read only under the loop, so v3 at any phase draws as today (PLAN CHOICE 14).
- **The world**: `world-places.js` and W9 are built only when `LOOP_ENABLED` (W9 only with `LOOP.redress`); the built pads' and
  reeds' random stream is untouched (T146).
- **Fishing**: the place pool, the mist cast, the Elder rule and the legend's pool are trip-only branches; `placeAt`,
  `speciesPool`, `capZ` and `legendInfo` off a trip are as built (T132; the v1 golden trace).
- **Sound**: the Mossmere's layers start only on a trip or at home under the loop; v3 beds unchanged.

**The flag-off checks** (the gate's; clear `localStorage` `gloomwater.loop` before each browser run):

| check | command | build |
|---|---|---|
| v1 golden trace, every node test | `node tools/check.mjs` | flag off (as each test sets it) |
| the data | `node tools/validate-data.mjs` (passes 1–3) | v1, walk, v3 |
| flag-off scenario run | `node tools/playtest.mjs --html=tools/out/m1-s3a/off.html --script=tools/scenario-run.mjs --width=960 --height=540` | `node build.mjs --dev --out=tools/out/m1-s3a/off.html` |
| run-v3 | `--script=tools/tests/run-v3.scenario.mjs` (and `--v3phase=1`) | `?v3=1`, no `?loop` |
| m1-v3 | `--script=tools/tests/m1-v3.scenario.mjs --lean` | `?v3=1`, no `?loop` |
| af-progression | `--script=tools/tests/af-progression.scenario.mjs --shots=tools/out/m1-s3a/afp` | `?v3=1&v3phase=1` |
| intro-flow, show-seq | their own scripts | loop off |

---

## 5. The stage's checklist

Every capture under `nice -n 5`, one browser at a time, generous timeouts; timing by the debug clock, never wall-clock playback.
Look at every screenshot (Read the PNGs) and fix what you see.

0. **Before the lanes.** On M: `node tools/check.mjs`, `node tools/validate-data.mjs`, `node tools/sim/clams.mjs
   --shipped=mossmere --step=3` and `--step=3 --wicks` (expected: all checks, one and six warnings, as the facts above). Once D's
   `clarity-perf --loop` exists, run D's scenario file on a build of M (`node build.mjs --dev --out=tools/out/m1-s3a/base.html`;
   desktop and `--mobile`) for T148's `cpuMs` baseline, kept as `tools/out/m1-s3a/perf-base*.json` (M1 §2.14 names step 1's; step 2
   changed no scene, so M's scene is step 1's).
1. **The seam.** Take S from A, merge it into M, run `validate-data` and `check.mjs --quick`, create B, C and D's worktrees off
   M+S (`git -C /home/user/Study-App worktree add /home/user/Study-App/.gw-wt/m1-s3a-<word> -b gw-m1-s3a-<word> <M+S>`, each with
   the `node_modules` symlink).
2. **Merge order: A → B → C → D**, on `gw-m1-s3a`; after each, `node tools/check.mjs --quick` and `node tools/validate-data.mjs`.
   A first (everyone reads its API), B before C (C reads `game.sail`, `place:lift`), D last (its scenarios drive all of it).
3. **The cross-file requests** of §2.5 not already in their owner's branch.
4. **The other track.** If `gw-m1-s3b` merged into the dev branch first, rebase onto it (one merge at a time, QUEUE): `ui-loop.js`
   is the likely conflict (3b's `openChart` routes to `ui-chart.js` and falls back to C's `renderChartList`; `chartModel` is C's,
   its signature 3b's contract); re-run this step's gate. Never edit 3b's files.
5. **Build:** `node build.mjs --dev --out=tools/out/m1-s3a/loop.html`.
6. **The node gate:** `node tools/validate-data.mjs` (four passes), `node tools/check.mjs`, `node tools/sim/roster-check.mjs`,
   `node tools/sim/clams.mjs --quick`.
7. **The sim gate:** `node tools/sim/clams.mjs --shipped=mossmere --step=3` and `--shipped=mossmere --step=3 --wicks`: every check
   passes (Hold 6's "pays its way" and the Wick's ±5% aim stay warnings); T104 and T119 print `ok`.
8. **The sound:** `node tools/audio-render.mjs --set=mossmere` (exit 0: the master ≤ −1.0 dBFS); look at the spectrograms, listen
   to the bed's three lights and each place clear and muffled.
9. **The browser scenario:** `node tools/playtest.mjs --html=tools/out/m1-s3a/loop.html --shots=tools/out/m1-s3a/desktop
   --script=tools/tests/loop-3a.scenario.mjs --width=960 --height=540`, then `--mobile --shots=tools/out/m1-s3a/phone` (the loop
   on through `?loop=1`, which the scenario sets). Then 1a's `loop-1a.scenario.mjs` on the same build, both sizes, unchanged (the
   tutorial's list has no place row). No console error in any.
10. **The budgets:** `--script=tools/tests/clarity-perf.scenario.mjs --loop` (desktop and `--mobile`; again with `?redress=1`):
    T148's lines. `node tools/hue-report.mjs tools/out/m1-s3a/look/places` (the four lifted places, dusk and night): the
    Mossmere's gate (green-teal ≤ 1% pooled, ≤ 2% a frame); green only on living things and the bell's trace.
11. **The user's look** (§6): `--script=tools/tests/loop-3a-look.scenario.mjs` (desktop and `--mobile`, `?redress=0` and `=1`
    for sheet 4), then `node tools/look-sheet.mjs --in=tools/out/m1-s3a/look --out=tools/out/m1-s3a/sheets`. Read every frame;
    fix and re-shoot what is wrong (no ring or disc round the raft or the Wick; no word but §8's; the palette).
12. **The flag-off checks** of §4.
13. **Bytes:** the minified build `node build.mjs` ≤ 3.3 MB, 3a's share stated (M: 2,840,337 bytes).
14. **Rebuild `index.html` last** (`node build.mjs`, the minified flag-off build) and commit it alone.
15. **Docs:** M1 §4 step 3a "as built" (as step 2's), SPEC §13 step 3's 3a row if a name moved, this PLAN's §7 with the lead's
    rulings; the sim's step-3 row of M1 §6.2 re-printed if it moved. (3b edits M1 §3.2: keep to §4 and §6.)
16. **Hand the sheets to the lead** for the user's look before the merge (M1 §4's gate). `LOOP.redress` stays `false` whatever the
    answer to sheet 4; a yes flips it in a later one-line commit. Commit on `gw-m1-s3a`; push nothing.

---

## 6. The user's look (made by D's look scenario, composed by `tools/look-sheet.mjs`, desktop 960×540 and phone 390×844)

1. **`places.jpg`, each place after its mist lifts.** For each of the four: the bank at dusk from the raft (before), the lift's
   three beats (thinning, framed, the title card), then the place lifted at dusk and at night from two poses, desktop and phone;
   plus the giant's back in Under the Span's bank at night.
2. **`giants.jpg`, each giant's show and the Matriarch's.** The Thousandcast Pike (a Prize and an Elder under the Span), the Hullkiss
   Lamprey (night, the Buoy Lights), the Belled Matriarch (the Bell Pool by day): five frames each (the fish leaving the water, the
   lift, the show, the pause, the gold card), as `show-sheet.mjs` lays a row; desktop and phone.
3. **`catalogue.jpg`, the Mossmere's catalogue.** A fresh page (the head's seals, twelve hatched and notched, the groups' glyph-only
   headings), a half page (eight caught, one giant, the Bell Pool owned), the complete page (12/12, both giants, the Matriarch);
   an enlarged silhouette; the giants' page; the Chart's list with its rows and the bait slot; the shelf's Maps and Bait tabs with
   Sporewood's sealed card; desktop and phone.
4. **`redress.jpg`, the harbour today against `LOOP.redress` on, side by side**, for the user's yes: the same four poses (the Sunken
   Gate and its tower, the east cliff and the Sluice Veil, an island's lamp-post or bollard, the Toppled Bridge for reference), at
   dusk and at night, left today, right re-dressed, desktop and phone.

With them: the `--set=mossmere` WAVs and spectrograms, and, if the machine is free, M1 §1's short film (a lift and the
Thousandcast's show with their sound, `show-sheet.mjs --video`).

---

## 7. PLAN CHOICEs (the docs are silent or disagree; the smallest reading)

1. **The places live in `LOOP.places`, not `LOOP.waters.mossmere.places`, and `LOOP_SCHEMA` stays 3.** `migrateLoop` rule 5 gives an
   owned lake the day and old places listed under its water; the Mossmere's are place maps (SPEC §4.8), so they must never be
   given; and a schema bump would re-run the rules on every 1a and step-2 save. The new keys are additive (§3.3).
2. **The loop's places are `MOSSMERE_V3`'s four records with the loop's kinds**; their v3 rules (Threading the Span's targets, the
   Lily Maze's sight rule, the Buoy Lights' channel, Moonfall, Tally Posts, `attract`) are not read under the loop: the twists are
   after M1 (slice 9), and the loop's draws replace `attract`.
3. **Night water before dark is open water**: at the Buoy Lights before `gloomtide` a cast counts and draws as open water's; its own
   good bites, favour, pool and giant start at dark. This is "night water gives nothing before dark" (M1 §4) with "nothing ever stops
   biting" (SPEC §3.3); the sim never fishes it by day.
4. **Her pool is the owned Bell Pool's water** (the r 6 place), not the built `legendPool`'s r 3.2, so a cast into the pool you
   bought is a cast into her pool; v3's rule is untouched.
5. **The ball on the line**: every bite but hers is a bare-hook bite and keeps the ball; she spends it when hooked, and a pass gives
   it back (SPEC §4.5's built "spent per hooked fish, refunded when let pass"; M1's "spent only by her bite").
6. **Consumables are never the goal line and never "Yours."** (M1 §2.5: they "never count"); the goal line names the cheapest
   permanent card.
7. **Sail toward a place, not from another dock** (for the lead, §7.1). SPEC §5.1 rule 10 starts a trip "at the dock nearest the
   place"; M1's home is one dock (1a's CHOICE 44, and from step 5 the barge's stern), and 1a's T66 forbids a teleport. So the 3 s glide
   out leaves the Jetty heading for the chosen place (`sailPlan` toward its centre, 15 m, validated by T118) and the Wick sails on
   from there; open water keeps 1a's authored path. The sim already charges the sail between waters (`LOOP.time.between`).
8. **The lift plays at the trip's start**, after the glide out, for each owned place not yet lifted, in price order, one after another
   (≤ 4.2 s each, a tap ends one); the evening's clock stands still (`ctx.cinematic`, as in the show); `lifted` is written at its end,
   so a reload mid-lift replays it. "On the first evening there" is read as the first evening on its water, since a trip is the whole
   water (SPEC §5.1 rule 10).
9. **The dressing is built for all four places from the first evening**, under their banks, with its emissive terms (the caps, the
   glow decals, the buds, the bell's glint) off until the lift; the banks are one merged mesh. The landmark's "dark shape" is the
   dressing seen through the bank, the lift reveals it without a pop, and the draw calls never depend on what is owned.
10. **The giant's back turns at dusk and night** (the loop has no weather, so every night is clear), every 25–45 s for 2 s, only in
    a standing bank; it is the built night-ink silhouette and names no species.
11. **The giants' page in 3a** is the Mossmere's three as cards (hatched until landed, then the gold-framed ink drawing and its best
    weight); step 5 adds the prints to it (M1 §4 names the page in both steps).
12. **The catch seal's press in 3a** is Murk's line and the seal's own stamp at the first home after the list completes; the seal is
    drawn pressed on the catalogue's head and on the shelf's sealed card from then on. 3b presses it on the drawn sheet, from the same
    `sealsOf`; no new save flag (`said.listComplete` is the beat's record).
13. **`LOOP.redress` is `false` in the data**; a dev URL flag `?redress=1` (read once by `core.js`, as `?loop`) turns it on for the
    side-by-side captures; the user's yes changes the data value in a commit of its own.
14. **The new plans and the hatch are read only under the loop.** Off the loop a lamprey, sturgeon or trout shape draws as today's
    fallback, so a v3 phase-2 build's Bridgechain is unchanged (the flag-off game must not move).
15. **Unplaced by M1, not built in 3a** (for the lead, §7.1): the pull (SPEC §5.5 (d)), the card's list seal "8/12" (§8.2) and the
    species page's reachable-seal rule (M1 §2.3's second box). The sim's list figures include the pull; nothing in 3a's gate
    compares them with the game.
16. **The bait slot holds only the Heartmoss Ball in 3a**; `catalogueFor` gives a fish its bait glyph only for a bait on the shelf,
    so the Gloam Eel's Lumen Moss glyph arrives with step 4's data and no code change.
17. **The evening's music rule** (M1 §2.13 leaves it to this lane): as built: the show's music by class, the Mossmere's bed
    otherwise.
18. **3a's new sounds** are the bed and the places' voices, the banks' muffled versions, the giant's roll, `mist_lift` and
    `seal_press`; the gold card's stamp is the built seal stamp of its class with its gold thread. The by-ear judgement is step 6's.
19. **The list Chart's rows are owned and priced places only** (M1 §3.6): an unowned place outside Murk's three has no row (the
    drawn Chart's glyph-only blot is 3b's); in the tutorial the list is exactly 1a's.
20. **Elders**: old water rolls Elders (Under the Span is `holdsGiants`); a giant may be an Elder at its own place whatever its kind
    (the Hullkiss at the Buoy Lights); no other fish anywhere else (SPEC §5.1 rule 3).
21. **The lift's shot is lane D's** (`render-camera.js`, as SPEC §13's step-3 modules name it); its title card is the HUD's (lane C).
22. **A Marked giant is marked at any class** (M1 §2.4: "a lost giant … becomes a Marked Fish"), not only from Trophy as the built
    light Marked Fish; +6 Hold once, the built value.
23. **The Matriarch's free slot** is the 1a rule: a full hold refuses every cast, so her sure bite never meets a full hold.
24. **Two lifts due at once** play in price order (the cheaper map first), each skippable; no lift waits for the raft to come near.
25. **The giants' tab is a ★ glyph with no visible word** (its accessible name "Giants", SPEC §8.8's sketch), so 3a adds no visible
    word beyond §8's.
26. **The Lily Maze's extra pads** come from a seeded stream of their own after every builder, so the built pads and reeds stay
    byte-identical; the place's "twice the local density" is the built count plus as many again inside its disc.

### 7.1 For the lead to confirm first

- PLAN CHOICE 7 (Sail toward a place from the Jetty, not from the dock nearest it). The other ways: a cut to that dock under the
  closing Chart (the knob 1a's R3 names: a 0.3 s ink veil), or a longer validated glide at the raft's speed (up to about 16 s).
- PLAN CHOICE 15 (the pull, the card's list seal and the reachable-seal rule are in no M1 step). The default: they wait for the
  lead to place them (step 4 is the natural home: it touches the bite roll and the card).
- PLAN CHOICE 8 (the lift at the trip's start, not when the raft first comes near the place).

---

## 8. Risks and knobs

| # | risk | knob |
|---|---|---|
| R1 | The game's pool drifts from the sim's (the built multipliers on top: rarity bonus, signs) and the step-3 pacing moves | T104 compares the helper with the sim; T122 the drawn shares with the helper; a mover goes in the docs commit with the sim re-run |
| R2 | The banks or the dressing pass §25.8.8's line (54 / 42) | one merged bank mesh; the dressing merged per material; the buds and decals off on low; W9 measured on and off |
| R3 | The banks read as fog or a disc round the raft | the bank is a low feathered shape on its place's footprint only, thinned round the camera, never centred on the raft; the look sheets |
| R4 | The lift steals control on every trip after a purchase | one lift per place, ever; ≤ 4.2 s; a tap ends it |
| R5 | The catalogue crowds on a phone (17 cards, three groups, the head) | SPEC §8.8's three a row and fixed head; T136's overlap check |
| R6 | The two tracks collide in `ui-loop.js` | C keeps the list in `renderChartList` and `chartModel`'s signature; the stage rebases (§5 step 4) |
| R7 | A step-2 save opens wrong (a re-run migration, a free place) | PLAN CHOICE 1; T117 on the committed fixture |
| R8 | The three plans read badly beside the built ones | the look sheet's show rows; the knob is each plan's parameters (ROSTER §4), never a new body |
| R9 | The Thousandcast's 27% at T1 or the Matriarch's 27% drift with the epic Fight term | T106 and T107 against the sim; the knob is `LOOP.giant.fight` |
| R10 | The bytes (about 160 KB left beside 3b's Chart) | the plans as builders, not meshes; the sound synthesised; §5 step 13 |
