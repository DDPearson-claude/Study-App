# Pounds: a fish's size told in pounds and ounces (v3 and the loop)

*Build spec for QUEUE job 3. Audit taken read-only on `ccr` at 27f2950. To be copied into the branch as
`gloomwater/docs/v3/pounds/SPEC.md`. The user, 15 November 2026: "I know this is a weird unit of measurement change but we always
use pounds as a gauge of fish size can we have that as our unit of measurement please". The lead's ruling (QUEUE job 3) is binding;
this document only makes it buildable.*

**In one paragraph.** Everything the player reads about how big a fish is becomes a weight in the UK angler's format (`11 oz`,
`4 lb 6 oz`, `212 lb`). There is one pure formatter, `data.fmtWeight(kg)`, plus a few small helpers built on it: one for the card's
count, one for "near" estimates and one for bounty and challenge targets. Length stays the hidden truth. z, the length, the model's
scale, the show's pose, the classes, values, food, oil and clams do not change. Length survives only as a small `33 cm` line on the
catch card. The weights come from `W = k·L³`. Checked against real cousins, 14 species were off by more than ±30%: those in the eel, angler and ghost bodies, the Pilgrim Salmon
and the Vesper Gar (both on the pike body), and two legends. This spec retunes four body constants (minnow, eel, angler, ghost; the
minnow is 26–27% light), adds four new body keys (`trout`, `gar`, `greateel`, `swampeel`) and changes two legends' authored weights. Nothing in the economy or the rules reads `k`: a scratch copy with the retune ran `catch-v3.mjs`,
`clams.mjs --quick` and `roster-check.mjs` byte-identical to the baseline, and `validate-data.mjs` passed all its passes. The flag-off
game (v1) is untouched. Every shared line branches on the v3 flag, and no v1 export, text or table changes.

---

## 0. Decisions taken here (the lead may overrule any of them in one line)

| # | decision | why |
|---|---|---|
| D1 | **Round once, to whole ounces, then carry.** 0.45 kg = 15.87 oz → 16 oz → `1 lb 0 oz`. Under 1 oz, round to the nearest quarter (minimum `¼ oz`). The band (oz / lb oz / lb) is chosen **after** the rounding | One rounding means one truth. `16 oz`, `1 lb 16 oz` and `100 lb 0 oz` can never appear. The output never decreases as the weight grows. A floor ("15 oz") would under-report a fish that is 99% of a pound |
| D2 | From 1 lb to under 100 lb the ounces are always written, **including `0 oz`** (`32 lb 0 oz`) | the ruling's own example; the card never changes shape between `32 lb 0 oz` and `32 lb 1 oz` |
| D3 | ≥ 100 lb: whole pounds, `en-US` grouping from 1,000 (`7,055 lb`), the same as the game's `fmt` | the Lantern-Swallower is 7,055 lb |
| D4 | Plain spaces in the core string; `{ nbsp: true }` replaces every space with U+00A0 (for prose lines that can wrap) | so `4 lb` / `6 oz` never split across a line on a phone |
| D5 | **Displayed weight is derived from length** at read time: `fishWeight(sp, fish) = k·length³` (rounded as `fishFigures` rounds), falling back to the stored `fish.weight` only when no length is known | the retune then applies to old saves too (journal PBs, the Elder Log, a creel saved mid-run), and the display and the comparisons can never disagree |
| D6 | **The play's estimate stays a class word, with no number** ("by the look of it: Prize", as built). The numeric estimate the ruling asks for is the **got-away note's "near N lb"** (and its echoes: the Journal's Got away list, the Glimpsed page, the logs' Marked Fish lines, the expedition summary) | Showing a weight during the play would leak the species. Weight is `k·L³` and `k` is the species' own, so a weight shown during the play would name the body shape, which breaks DESIGN §25.6.10 / CONTRACT §13.7a species-swap invariance. Once the fish is gone (`fish:escaped`), the note already names the species, so a weight there leaks nothing new **For the lead to confirm at the merge** (the ruling's list names "the play's estimate"; this is the one place the build departs from it): the rule it would break is the user's own, "I dont want you to be able to tell what type of fish could be on your line" (DESIGN §25.0.1 row 8). A species-blind figure is not a way out: a size class is cut on the size score, not on weight, so in the preview build's Mossmere (seven fish) a Prize is anything from `7 oz` to `17 lb 5 oz` (a typical Prize minnow 9 oz, a typical Prize carp 12 lb 14 oz: ×24). A band that wide says nothing, and a single figure would be wrong by an order of magnitude for some fish (§12 item 3) |
| D7 | The "near" estimate uses friendly steps: under 1 lb as `fmtWeight`; 1 to under 10 lb to the nearest 1 lb; 10 to under 100 lb to the nearest 5 lb; 100 to under 1,000 lb to the nearest 25 lb; from 1,000 lb to the nearest 100 lb. The word stays `near` (`AUTOFISH.gotAway.word`) | The steps follow the length steps already in use (1 cm, 5 cm, 0.1 m). The ruling's "about" is an example of the rounding, not a new word; one data string changes it if the lead wants it |
| D8 | The card's count is **driven by length, as today** (`cm = L·e(k)`, so the cord bead, the knots and the audio's crossings are unchanged), and it **shows the weight of that length**: `w = W·(cm/L)³` | The audio rules (`card:count`, the chime at a band crossing) and the bead stay exactly as built. The number stays low for the first ~15% of the count and then rises fast to land, which reads like a pointer swinging onto the scale |
| D9 | The count uses the final's own band: a final under 1 lb counts in ounces; a final from 1 lb to under 100 lb counts in ounces up to 1 lb, then in `N lb M oz`; **a final ≥ 100 lb counts in whole pounds from `0 lb`** | The lead's "whole ounces up to 1 lb, then pounds plus ounces". For a giant, an ounce stage would flash for one frame and stretch the reserved width to `99 lb 15 oz` |
| D10 | Bounty and challenge targets are **round units, worded as the card words a weight** (`fmtWeight`: "over 6 oz", "over 1 lb 8 oz", "over 9 lb 0 oz", "over 33 lb 0 oz"; never a half-pound glyph or a bare "9 lb"), and the check is made on the same ounces the card shows: `weightOz(fish) > targetOz` | words, card and check agree, and the player compares like with like: a card reading `33 lb 0 oz` does not fill "over 33 lb 0 oz", one reading `33 lb 1 oz` does |
| D11 | The card's length line reads `length · 33 cm`: the existing `length` row of the card's stats list, always in cm, one decimal under 20 cm (`8.4 cm`), no mm or m | the ruling: "kept only as a small detail line on the card (in cm)" |
| D12 | The handwritten note ("…, 4 lb 6 oz, a prize! took the mire worms…") and the record kicker's fallback use the weight | anglers say the weight |
| D13 | The Journal's species "Weight" row (today `0.11–2.8 kg`) shows the range in pounds, with an en dash and spaces, **from the species' smallest to a top Trophy** (the most open water holds), and under it, as hearsay, what it is **said to reach** (the ceiling, an Elder's): the Dusk Minnow `2 oz – 1 lb 4 oz` · `said to reach 3 lb 10 oz`; the Mossback Perch `10 oz – 5 lb 15 oz` · `said to reach 17 lb 11 oz` | `data.weightSpan(sp)` from the same derived `sp.weight` pair. A range that ran to the ceiling read as a 17 lb perch on the first Journal page a player opens; a real one is a fish of a lifetime at 6 lb |
| D14 | **A personal best is kept by length and told by the weight the card shows**: the mark (`pbLength`) moves with any longer fish, but a best is told (the record line, the kicker, `isRecord`, the summary line) only when `weightOz` of the new fish is above `weightOz` of the old mark | the two figures are printed in whole ounces; a fish a hair longer read "New best: 5 oz (was 5 oz)" (about a third of small minnow bests did) |

---

## 1. Every site, with its layer

Layer: **v1** = reached only with the flag off (leave byte-identical). **v3** = reached only on the v3 / automatic-fishing path
(change freely). **shared** = one line serves both. Change it **behind a branch** (`N.v3`, `V3()`, `D().V3_ENABLED`, `af()`), with
the v1 arm left character for character as it is.

### 1.1 The catch card (`src/ui-screens.js`)

| site | today | layer | change |
|---|---|---|---|
| 516–527 `SHAPE_K`, `fishLength(sp, kg)`, `sizeClass(sp, kg)` | v1 card's length estimate from weight; v1 size words | v1 | none |
| 531 comment "length in cm, weight in kg" | doc comment | v3 | reword |
| 544 `recordLines(D, {…, length: fish.length, max: 1})` | the kicker; falls back to `best.text` ("New best: 33 cm …") for an unknown kind | v3 | pass `weight: fishWeight(sp, fish)`; `recordLines` words in weight (§1.3) |
| 552 `const len = fmtLength(fish.length, D())` | hero and note text | v3 | `N.wt = fmtWeight(fishWeight(sp, fish))`, `N.cm = fmtCm(fish.length)`; keep `N.len` only for v1 (`catchNotes` line 576) |
| 750 `stats`: `<dt>length</dt><dd class="gw-cc-len">…` + `<dt>weight</dt><dd>${fmtKg(fish.weight)}</dd>` | **shared** (the v1 card uses the same string) | shared | `N.v3 ?` length row `length · ${N.cm}` (shown) and **no weight row** (the hero is the weight) `:` today's string unchanged |
| 779 note `${esc(N.len)}` | handwritten note | shared (N.len is the v1 length on the v1 card) | `${esc(N.v3 ? N.wt : N.len)}` |
| 785 `<b class="gw-cc-hero">${esc(N.len)}</b>` | the hero (v3 only) | v3 | the hero markup of §3.2 with `N.wt` |
| 814 make-room rows `<small>${fmtKg(f.weight)}</small>` | creel rows on a full card | shared | `V3 ? fmtWeight(fishWeight(fsp, f)) : fmtKg(f.weight)` |
| 846–877 the count (`unit`, `say(cm)`, `hero.textContent = k >= 1 ? N.len : say(cm)`) | counts cm / mm / m, lands on `N.len` | v3 | §3.3: `say` → `V.weightCount(W·(cm/L)³, W)`, land on `N.wt`; remove the unit switch |
| ui.css 1058 hides `.gw-cc-lenk` / `.gw-cc-len` in v3 | the v3 card hid the length row | v3 css | invert: the v3 length row is shown at the dd's size (it is the small detail line) |
| ui.css 1061 / 1084 / 1693 / 1835 `.gw-cc-hero` sizes 50 / 36–46 / 40 / 42 px | sized for `178 cm` (6 characters) | v3 css | §3.2: the sizer, and `.gw-cc-hero--long` (final ≥ 9 characters) at 0.78× the size |

### 1.2 Records, the Journal, the market, the summary

| site | today | layer | change |
|---|---|---|---|
| `src/progression.js:84` `fmtKg`, `:85` `fmtCm` | helpers | shared | keep both (v1 uses `fmtKg`); add `fmtW = (sp, kg, len) => data.fmtWeight(…)` use in v3 lines |
| `progression.js:897` `isPB = isNew \|\| (prevLength != null ? fish.length > prevLength : fish.weight > entry.biggest)` | per-species PB by length | v3 | the mark stays by length; **told** only when the shown weight rises (D14): `toldPB = isPB && !isNew && weightOz(now) > weightOz(old mark)` gates the `pb` record, `isRecord` and the summary line |
| `progression.js:960` `r.stats.biggest` compares `fish.weight` across species | the run's heaviest (not shown anywhere today) | v3 | compare `fishWeight(sp, fish)`; any future display uses `fmtWeight` |
| `progression.js:1372` `TEXT_V3.newBest` `'New best: {cm} cm (was {was})'`, falls back to `fmtKg(x.prev)` | summary record lines (death / dawn summary, `ui-screens.js:1781`) | v3 | `'New best: {w} (was {was})'`, both from `fishWeight` of the lengths (`x.length`, `x.prevLength`); legacy `x.prev` kg → `fmtWeight(x.prev)` |
| `progression.js:1374` `TEXT.records.biggest` `'Biggest catch: {name}, {kg} kg'` | v1 summary | v1 | none (TEXT is fingerprinted) |
| `src/ui-screens.js:1355` Journal "Biggest": `fmtLength(pb)` else `fmtKg(rec.biggest)` | shared screen (v1 Journal has no `pbLength`) | shared | `V3 ? fmtWeight(pb > 0 ? fishWeight(sp, {length: pb}) : rec.pbWeight ?? rec.biggest) : (today's expression)` |
| `ui-screens.js:1356` Journal "Weight": `${sp.weight[0]}–${sp.weight[1]} kg` | shared | shared | v3: `data.weightSpan(sp)`: `min – top`, and `said to reach {reach}` under it (D13); the v1 arm as today |
| `ui-screens.js:1194`, `:1255` creel / sell rows `${fmtKg(f.weight)}` | market Sell tab, Burn | shared | `V3 ? fmtWeight(fishWeight(sp, f)) : fmtKg(f.weight)` |
| `src/progression-market.js:146` sell item `desc: \`${S.fmtKg(fish.weight)} · …\`` | shared | shared | `V3 ? fmtWeight(…) : today` |
| `progression-market.js:444–447` heavy bounty target `b.kg` (rounded kg) | v3 branch exists (`kgV3`) | shared | v3: `const T = data.weightTarget(kgV3, kgAtZ(1.04))`; `b.kg = T.kg; b.targetOz = T.oz; fill.w = T.text`; v1 arm unchanged |
| `progression-market.js:471` `b.text = fill(t.text, fill)` with template `'Land a {species} over {kg} kg.'` (`data.js:1301`, v1 `BOUNTIES`) | text filled once, saved with the bounty | shared | the v3 apply block (`data.js` ~5073, beside `spot_catch`) patches the heavy template to `'Land a {species} over {w}.'` |
| `progression-market.js:578` heavy check `(e.fish.weight \|\| 0) >= (b.kg \|\| 0)` | shared | shared | `b.targetOz != null ? weightOz(fishWeight(sp, e.fish)) > b.targetOz : today` |
| `ui-screens.js:1210` ledger row `fill(b.text, { kg: b.target?.kg })` | shared | shared | v3: an old saved heavy bounty (no `targetOz`, text with `kg`) is re-worded from `b.kg` with `fmtWeight(b.kg)` and takes `targetOz = weightOz(b.kg)` with it, so its words and its check agree; new ones already carry the words |
| `progression-market.js:523` toast "Murk's Ledger: {bounty text}" | from `b.text` | shared | follows the bounty text |
| `src/progression-challenges.js:183` `(fish.weight \|\| 0) > (p.kg ?? 8)` | Heavyweight | shared | `p.lb != null ? weightOz(fishWeight(species, fish)) > p.lb * 16 : today` |
| `src/data.js:1276` v1 `heavy_catch` "over 8 kg" `{kg: 8}` (in play in v3 phases 1–2) | v1 table | v1 table; v3 patch | the v3 apply block, `P < 3`: `Object.assign(hc, { desc: 'Land a non-legendary fish over 18 lb 0 oz.', params: { lb: 18, excludeLegendary: true } })` |
| `data.js:4417` `CHALLENGES_V3` override "over 15 kg" `{kg: 15}` (phase ≥ 3) | v3 | v3 | `'Land a non-legendary fish over 33 lb 0 oz.'`, `{ lb: 33, excludeLegendary: true }` |
| `tools/validate-data.mjs:1267` asserts `heavy_catch.params.kg === 15` | v3 pass | tool | `params.lb === 33`; add: phase-1 build's `heavy_catch.params.lb === 18` |
| `src/core.js:373` `fmtKg` | exported, **no caller** | dead | leave |
| `src/ui.js:46` `fmtKg` on `K` | shared helper | shared | keep; add `fmtWeight` and `fishWeight` to `K` |
| `src/progression-af.js:37–44` `approxText(cm)` ("45 cm", "1.6 m"); `:572` used by `gotAwayLines` | expedition / Snuffed summary "A Trophy Reedjaw Pike, near 1.1 m, …" | v3 | `gotAwayLines` uses `data.fmtWeightNear(fishWeight(sp, {length: g.length}))`; keep `approxText` (its test) or delete it with its test |
| `progression-af.js:543` an escaped Elder's `elderLog` row `weight: null` | data only | v3 | keep; display derives from `length` (§4.3) |

### 1.3 The pure v3 helpers

| site | today | layer | change |
|---|---|---|---|
| `src/ui-v3.js:183–190` `fmtLength(cm)` ("84 mm", "112 cm", "8.50 m") | the v3 card's hero, Journal Biggest | v3 | keep (its tests, the cord's knots); no player-facing caller remains. Add `fmtCm(cm)` (§2.4) |
| `ui-v3.js:297` `cmNum`, `:303–333` `recordLines` "New best: {cm} cm (was {was})", sub "`N cm past your old mark`" | the kicker's fallback; the summary words | v3 | take `{ weight, prevWeight }` (computed by the caller from lengths): text `New best: 4 lb 6 oz (was 3 lb 12 oz)`, sub `10 oz past your old mark` (`fmtWeight(gain)`) |
| `ui-v3.js:262` `cordRuler` (lengths) | the card's ruler line: bead and knots, **no words** | v3 | none (length is the hidden truth; it writes no figure) |
| `src/ui-af.js:110–119` `nearLength(D, cm)` "near 14 cm" / "near 1.6 m" | got-away words | v3 | add `nearWeight(D, sp, cm)` = `fmtWeightNear(sizeWeight(sp, cm))` with the word; keep `nearLength` for its test or remove it |
| `ui-af.js:149–150` got-away `size` "`{a} {class}, near {len}.`" (legend: "Near 2.6 m.") | toast / card | v3 | `nearWeight` of `p.approxLength` with the species of `p.speciesId`; rename the template key `{len}` → `{size}` in `AUTOFISH.text.size` |
| `ui-af.js:205–207` Your odds, Marked Fish line "`{name}, {class}, near {len}`" | the log | v3 | `nearWeight` of `m.approxLength` with the page's species; `AUTOFISH.text.log.marked` key `{len}` → `{size}` |
| `ui-af.js:309` `leakScan` | the hidden-information test scan | v3 tests | add the weight pattern (§7 item 5) |
| `src/ui-screens.js:195–206` `gotAwayBlock` rows `AF.nearLength(D(), g.length)` | Journal Got away list | v3 | `AF.nearWeight(D(), sp, g.length)` |
| `ui-screens.js:1359–1360` Glimpsed line "Got away: a trophy, near 1.1 m, …" | Journal | v3 | `nearWeight` |
| `ui-screens.js:1786–1787` summary Got away list (`S.gotAway`, from `gotAwayLines`) | summary | v3 | follows `gotAwayLines` |

### 1.4 Strings in `src/data.js` that carry a unit

| line | string | layer | change |
|---|---|---|---|
| 1276 | `heavy_catch` "over 8 kg" | v1 (in play in v3 P1–2) | v3 patch (§1.2) |
| 1301 | `BOUNTIES` heavy "`Land a {species} over {kg} kg.`" | v1 (in play in v3) | v3 patch → `{w}` |
| 1506 | `TEXT.records.biggest` "`…, {kg} kg`" | v1 | none |
| 2751 | `BALANCE_V3.ceremony.mmBelow: 20` (lengths under 20 cm print in mm) | v3 data | keep (fmtLength reads it); no player-facing reader after this job |
| 3964 | `AUTOFISH.text.size` "`{a} {class}, near {len}.`" | v3 | `{size}` |
| 3977 | `AUTOFISH.text.log.marked` "`{name}, {class}, near {len}`" | v3 | `{size}` |
| 3946 | `AUTOFISH.gotAway.round` (cm steps) | v3 | keep (fishing still rounds `approxLength` in cm, `fishing.js:1589–1591`); add `roundLb: [[10, 1], [100, 5], [1000, 25], [Infinity, 100]]` |
| 4417 | `CHALLENGES_V3.heavy_catch` "over 15 kg" | v3 | "over 33 lb 0 oz", `{lb: 33}` |
| 4686 | `TEXT_V3.newBest` "`New best: {cm} cm (was {was})`" | v3 | "`New best: {w} (was {was})`" |
| 4673–4700 | `TEXT_V3.watchLamp` / `lampWatch*` / `hud.*` "`{m} m`" | v3 | none: distances, not fish |
| 1939, 2072 | place `look` text ("six-metre spore geyser", "seven metres up") | v3 world text | none: not a fish size |

### 1.5 The rest, checked

| what | finding |
|---|---|
| **Murk's lines** (`MERCHANT_LINES`, `MERCHANT_LINES_V3`, the loop's SPEC §8.6) | no line carries a figure or a unit ("Heard something big…", "Now that's a fish."). Rule: any future Murk line that names a size uses `fmtWeight` / `fmtWeightNear` |
| **toasts** | no toast prints a fish's size today. Bounty toasts carry the bounty text (patched); the got-away toast names the species and the cause, not the size; "Bounty honoured: …" follows `b.text` |
| **the show** (`actors-show.js`, `ui-measure.js`) | **writes no words**, confirmed: `ui-measure.js` header ("from the fish breaking the surface (T0) until the catch card, NOTHING is written on the screen"); no DOM text in `actors-show.js`. Its pose is chosen by true length (`data.showPoseFor`): unchanged |
| **the measuring overlay** | retired (`ui-measure.js`: `show()` / `onMeasured()` / `onLanded()` are no-ops); `actors-measure.js` draws a cord, no text. Not reachable |
| **the play's HUD** (`ui-hud-v3.js:396–420`) | the class stamp only ("by the look of it: Prize"); `view.estimate.length` (the class length) is never printed. Unchanged (D6) |
| **audio** (`audio-v3.js`, `audio-af.js`) | by class and class length; no weight. Unchanged |
| **the Elder Log** | written (`progression.js:943`, `progression-af.js:543`) but **not shown by any screen today**. Rule for when it is (§4.3) |
| **Tally Posts, the Long Wall plaques, legend growth lines** (DESIGN §25.8.1, §25.4, §25.7.4) | not built in `src/` (no reader). Rule: weight first, length as the detail (§4.3); docs edited (§8) |
| **the loop** (`GW_LOOP`) | no loop code exists yet (`LOOP_ENABLED`, `ui-loop.js`, the tally are slice 1a). Rules in §5 |
| `fishing.js:546–547` `S.weight` from `sizeWeight` | internal kg; unchanged |
| `progression-v3.js:157` `zFromWeight` (debug fish, a weight-only `fishing:caught`) and `models-size.js` `trueLength(sp, kg)` | invert with the species' `k`, so they follow a retune by themselves |

---

## 2. The format: one pure helper and three small ones

### 2.1 Where

In **`src/data.js`**, right after `sizeWeight` (line 4758), as plain exports. `progression`, `progression-market`,
`progression-challenges`, `progression-af`, the ui, the tests and the sims can all reach it from one source. The v1 fingerprint
(`tools/tests/v1-exports.json`) hashes only its fixed list of v1 names, so new exports leave it unchanged (`validate-data.mjs:43–48`).
Nothing in v1 calls them.

### 2.2 The code (build exactly this)

```js
// ---- Weight for the player (QUEUE job 3; docs/v3/pounds/SPEC.md). Internals stay kg; the player reads pounds and ounces.
export const LB_PER_KG = 2.20462262185;              // 1 lb = 0.45359237 kg exactly
export const OZ_PER_KG = 35.27396195;                // 16 × LB_PER_KG
const QUARTERS = ['\u00bc', '\u00bd', '\u00be'];     // ¼ ½ ¾
/** The ounces a weight reads as on screen, exactly the figure fmtWeight prints: quarters under 1 oz (never below ¼), whole ounces
 *  to under 100 lb, whole pounds beyond. Every size comparison the player can see in v3 (a personal best, a heavy bounty, the
 *  Heavyweight) is made on it, so the words, the card and the check can never disagree. 0 for no weight. */
export function weightOz(kg) {
  if (typeof kg !== 'number' || !Number.isFinite(kg) || kg <= 0) return 0;
  const oz = kg * OZ_PER_KG;
  const q = Math.round(oz * 4);                       // quarters
  if (q < 4) return Math.max(1, q) / 4;
  const w = Math.round(oz);                           // whole ounces (q ≥ 4 ⇒ w ≥ 1)
  return w < 1600 ? w : Math.round(oz / 16) * 16;     // 100 lb and up: whole pounds
}
/** "¼ oz" … "15 oz" · "1 lb 0 oz" … "99 lb 15 oz" · "100 lb" … "7,055 lb"; "—" for no weight. Rounds once, to whole ounces
 *  (under 1 oz to the nearest quarter, never below ¼), then carries: never "16 oz", "1 lb 16 oz" or "100 lb 0 oz". */
export function fmtWeight(kg, { nbsp = false } = {}) {
  const w = weightOz(kg);
  if (!(w > 0)) return '\u2014';
  const sp = nbsp ? '\u00a0' : ' ';
  if (w < 1) return `${QUARTERS[w * 4 - 1]}${sp}oz`;
  if (w < 16) return `${w}${sp}oz`;
  if (w < 1600) return `${Math.floor(w / 16)}${sp}lb${sp}${w % 16}${sp}oz`;   // "4 lb 6 oz"
  return `${(w / 16).toLocaleString('en-US')}${sp}lb`;
}
/** A fish's weight for the player: derived from its length with the species' k (so a retune reaches old saves), else the stored kg. */
export function fishWeight(sp, fish) {
  const L = Number(fish?.length);
  if (sp?.size && L > 0) { const w = sizeWeight(sp, L); return w < 1 ? Math.round(w * 1000) / 1000 : Math.round(w * 100) / 100; }
  return Number(fish?.weight) > 0 ? Number(fish.weight) : 0;
}
```

`fmtWeightNear(kg)` (the got-away estimate; D7) and `weightTarget(kg, capKg)` (bounties; §4.4) go beside it:

```js
/** A "near" weight (the got-away note): friendly steps, never an exact figure. Returns the figure only ("6 oz", "3 lb", "20 lb",
 *  "275 lb", "7,100 lb"); the caller adds AUTOFISH.gotAway.word. */
export function fmtWeightNear(kg, steps = [[10, 1], [100, 5], [1000, 25], [Infinity, 100]]) {
  if (!(kg > 0)) return '';
  if (Math.round(kg * OZ_PER_KG) < 16) return fmtWeight(kg);
  const lb = kg * LB_PER_KG;
  const step = (steps.find(([below]) => lb < below) || steps[steps.length - 1])[1];
  return `${Math.max(step, Math.round(lb / step) * step).toLocaleString('en-US')} lb`;
}
/** A round target for "over {w}" (a heavy bounty, a Murk's order): a round unit (whole ounces under 1 lb, half pounds from 1 to
 *  3 lb, whole pounds beyond), never above capKg (the top Keeper's weight), and worded as the card words a weight (fmtWeight:
 *  "6 oz", "1 lb 8 oz", "9 lb 0 oz"), so the player compares like with like. Returns {oz, kg, text}. */
export function weightTarget(kg, capKg = Infinity) {
  const oz = kg * OZ_PER_KG, cap = capKg * OZ_PER_KG;
  const unit = oz < 15.5 ? 1 : oz < 47.5 ? 8 : 16;    // whole oz · half pound · whole pound
  let t = Math.max(1, Math.round(oz / unit) * unit);
  if (t > cap) t = Math.max(1, Math.floor(cap / unit) * unit);
  return { oz: t, kg: t / OZ_PER_KG, text: fmtWeight(t / OZ_PER_KG) };
}
/** The card's length line: cm always (one decimal under 20 cm): "8.4 cm", "112 cm", "850 cm". */
export function fmtCm(cm) { cm = Number(cm); if (!(cm > 0)) return '\u2014'; return cm < 20 ? `${Math.round(cm * 10) / 10} cm` : `${Math.round(cm)} cm`; }
```

### 2.3 The test table (`tools/tests/pounds.test.mjs`, exact strings)

The oz column is `kg × 35.27396195`, shown for reading. The test asserts only the string.

| # | kg | oz | `fmtWeight(kg)` | the edge it pins |
|---|---|---|---|---|
| 1 | 0.0068 | 0.2399 | `¼ oz` | a Cupbearer: under 1 oz, nearest quarter |
| 2 | 0.0001 | 0.0035 | `¼ oz` | the minimum is ¼ (never `0 oz`) |
| 3 | 0.0142 | 0.5009 | `½ oz` | quarters |
| 4 | 0.0248 | 0.8748 | `¾ oz` | just under ⅞: still ¾ |
| 5 | 0.02481 | 0.8752 | `1 oz` | ⅞ rounds up to 4 quarters → whole ounces |
| 6 | 0.0283 | 0.9983 | `1 oz` | 1 oz |
| 7 | 0.1 | 3.5274 | `4 oz` | whole ounces round half up |
| 8 | 0.3118 | 10.9984 | `11 oz` | the ruling's `11 oz` |
| 9 | 0.4394 | 15.4994 | `15 oz` | the last value that stays in ounces |
| 10 | 0.4395 | 15.5030 | `1 lb 0 oz` | 15.5 oz rounds to 16 and carries |
| 11 | 0.45 | 15.8733 | `1 lb 0 oz` | the lead's case (D1) |
| 12 | 0.4536 | 16.0003 | `1 lb 0 oz` | 1 lb |
| 13 | 0.8930 | 31.4996 | `1 lb 15 oz` | the last value before the carry |
| 14 | 0.8931 | 31.5031 | `2 lb 0 oz` | 31.5 oz carries to 2 lb (never `1 lb 16 oz`) |
| 15 | 1.9845 | 70.0012 | `4 lb 6 oz` | the ruling's `4 lb 6 oz` |
| 16 | 14.515 | 512.0016 | `32 lb 0 oz` | `0 oz` is written (D2) |
| 17 | 45.0 | 1587.3283 | `99 lb 3 oz` | the top of the lb-oz band |
| 18 | 45.35 | 1599.6742 | `100 lb` | 99 lb 15.7 oz → 1600 oz → whole pounds (never `100 lb 0 oz`) |
| 19 | 45.5 | 1604.9653 | `100 lb` | 100.3 lb |
| 20 | 45.6 | 1608.4927 | `101 lb` | 100.5 lb rounds up |
| 21 | 96.16 | 3391.9442 | `212 lb` | the ruling's `212 lb` |
| 22 | 120 | 4232.8754 | `265 lb` | the Belled Matriarch after the retune |
| 23 | 300 | 10582.1886 | `661 lb` | the lead's 300 kg |
| 24 | 453.6 | 16000.2691 | `1,000 lb` | grouping from 1,000 (D3) |
| 25 | 3200 | 112876.6782 | `7,055 lb` | the Lantern-Swallower |
| 26 | 0, −2, NaN, undefined, '3' | — | `—` | no weight |

Also: `fmtWeight(1.9845, { nbsp: true }) === '4\u00a0lb\u00a06\u00a0oz'`. The output never decreases: step kg from 0.0001 to 500 in
×1.001 steps, parse each string back to ounces, and check the values never fall. Every output matches
`/^([¼½¾]|\d{1,2}) oz$|^\d{1,2} lb \d{1,2} oz$|^\d{1,3}(,\d{3})* lb$/`, the ounces in the middle form are always 0–15, and the middle
form's pounds are always 1–99.

`fmtWeightNear`: 0.17 kg → `6 oz`; 0.44 kg (15.5 oz) → `1 lb`; 1.36 kg (3.0 lb) → `3 lb`; 4.3 kg (9.48 lb) → `9 lb`; 4.45 kg (9.81 lb)
→ `10 lb`; 9.1 kg (20.1 lb) → `20 lb`; 44 kg (97.0 lb) → `95 lb`; 44.6 kg (98.3 lb) → `100 lb`; 125 kg (275.6 lb) → `275 lb`;
3200 kg → `7,100 lb`; 0 → `''`.

`weightTarget`: 0.178 kg, cap 0.201 → `{oz: 6, text: '6 oz'}`; 0.72 kg (1.59 lb), cap 0.81 → `1 lb 8 oz`; 0.79 kg (1.74 lb), cap 0.91 →
`1 lb 8 oz`; 3.88 kg (8.56 lb), cap 4.63 → `9 lb 0 oz`; 0.508 kg (1.12 lb), cap 0.567 → `1 lb 0 oz`; a target that rounds above its cap
steps down (0.72 kg, cap 0.66 kg → `1 lb 0 oz`). `text` is always `fmtWeight` of the target (never a half-pound glyph, `16 oz` or
`0 oz`), and `weightOz(T.kg) === T.oz`.

`weightOz`: exactly the figure `fmtWeight` prints, at every weight (0.0142 kg → 0.5; 0.45 kg → 16; 100.4 lb → 1600, not 1606;
100.6 lb → 1616; 0, a negative, `NaN`, `Infinity`, a string → 0).

`fmtCm`: 8.4 → `8.4 cm`; 19.94 → `19.9 cm`; 33.2 → `33 cm`; 850 → `850 cm`; 0 → `—`.

---

## 3. The catch card

### 3.1 What it shows (v3 card; the v1 card is untouched)

```
A NEW PERSONAL BEST                       (kicker, as built)
Weeping Carp
[PRIZE ◉]  6 lb 3 oz                      (stamp + the hero: the weight, counting up)
length   56 cm                            (the small detail line: the stats list's first row)
worth    41 shells, fine                  (as built)
strike   Clean · favour ▮▮▯ …             (behind "more", as built)
```

- The hero is `N.wt = fmtWeight(fishWeight(sp, fish))`.
- The stats list's first row is `<dt class="gw-cc-lenk">length</dt><dd class="gw-cc-len">${N.cm}</dd>`, shown on the v3 card (invert
  `ui.css:1058`). There is **no weight row**: the hero is the weight.
- The note (behind "more") reads `{name, }{N.wt}{, phrase}`.
- A legend's card: hero `265 lb`, length `260 cm`. The Lantern-Swallower: `7,055 lb`, `850 cm`. A Cupbearer: hero `¼ oz`, length
  `8.4 cm`. The First Evening's Quayling: `1 oz`, `14 cm`.

### 3.2 The hero's markup and width (no jitter)

*(As built, the markup differs: the parts are `<i>`, the live figure lies over the sizer, the sizer holds several figures laid one
over another, and each unit is set apart in the body face. See §11 B1–B3 and §12 items 4 and 6; CONTRACT §13.7 has the markup.)*

```html
<b class="gw-cc-hero{ long ? ' gw-cc-hero--long' : '' }" aria-label="{N.wt}">
  <span class="gw-cc-hero-sizer" aria-hidden="true">{V.weightSizer(W)}</span>
  <span class="gw-cc-hero-n">{shown ? N.wt : V.weightCount(0, W)}</span>
</b>
```

```css
.gw-cc-hero { display: inline-grid; justify-items: start; }                       /* + today's font, gold, rotation, tabular-nums */
.gw-cc-hero > span { grid-area: 1 / 1; white-space: nowrap; }
.gw-cc-hero-sizer { visibility: hidden; }
.gw-cc-hero--long { font-size: 0.78em; }                                           /* final string ≥ 9 characters ("12 lb 13 oz") */
```

- The sizer holds the widest string the count can show. The grid cell takes its width once, so the stamp row never moves and the
  live figure grows inside a fixed box, left-aligned (the hero already has `font-variant-numeric: tabular-nums`).
- `long` = `N.wt.length >= 9`. On the phone sizes (`ui.css:1693`, `:1835`) the same factor applies, so `12 lb 13 oz` at 40 × 0.78 =
  31 px fits the 370 px card beside the stamp. The phone capture (§7.9) is the check.
- If the stamp row still overflows at 390 px, `.gw-cc-stamp` may wrap with the hero below it (`flex-wrap: wrap`). It must not
  overlap.

`weightSizer(W)` (pure, `ui-v3.js`):

- a final under 1 lb: the final string;
- a final from 1 lb to under 100 lb: the longer of the final and, when `P ≥ 2`, `` `${P - 1} lb 15 oz` `` (`P` = the final's
  pounds; `1 lb 15 oz` is reached on the way to `2 lb 3 oz`);
- a final ≥ 100 lb: the final string (counted in whole pounds, D9).

### 3.3 The count (`ui-screens.js:846–877`)

Keep the clock, the easing, `card:count`, `card:stamp`, the bead and the knots exactly as built. Only the words change:

```js
const L = num(fish.length), W = fishWeight(sp, fish);
const live = content.querySelector('.gw-cc-hero-n');
live.textContent = V.weightCount(0, W);
// in step(): cm = L * e2 (as now: bead, knots and audio unchanged)
live.textContent = k >= 1 ? N.wt : V.weightCount(W * (cm / L) ** 3, W);
```

`weightCount(w, W)` (pure, `ui-v3.js`): returns exactly `fmtWeight(W)` once `w >= W`, and otherwise:

- a final ≥ 100 lb: `` `${Math.floor(w × LB_PER_KG).toLocaleString('en-US')} lb` `` (whole pounds from `0 lb`);
- otherwise `fmtWeight(w)`, except that `w` rounding below ¼ oz shows `0 oz` (the start frame).

It never shows a value above the final: `fmtWeight` never decreases as the weight grows, and `w ≤ W`. At `k ≥ 1` the code sets
`N.wt` itself, so the count lands on the exact final string. Its width never exceeds the sizer.

### 3.4 Records and personal bests

- **Per species: kept by length, told by the weight the card shows** (D14). `entry.pbLength` stays the record and moves with any
  longer fish (`pbWeight` stays stored, in kg, and is not shown). A best is **told** only when the figure rises:
  `weightOz(fishWeight(sp, fish)) > weightOz(fishWeight(sp, {length: pbLength}))`. A fish a hair longer that reads the same weight as
  the old mark sends no `pb` record, no `isRecord`, no kicker and no summary line: never "New best: 5 oz (was 5 oz)".
- **"New best" words:** `TEXT_V3.newBest = 'New best: {w} (was {was})'`. `{w}` = `fmtWeight(fishWeight(sp, {length}))`,
  `{was}` = the same from `prevLength` (or `fmtWeight(prevWeight)` for a legacy record with no length). `recordLines` sub:
  the difference of the two figures as they read, `fmtWeight((weightOz(now) − weightOz(prev)) / OZ_PER_KG)` + ` past your old mark`
  ("New best: 23 lb 4 oz (was 15 lb 2 oz)" → "8 lb 2 oz past your old mark"). `recordLines` itself drops a `pb` record whose two
  figures read the same (a record saved by an older build).
- **Across species, "biggest" is the heaviest:** `r.stats.biggest` compares `fishWeight`. The loop's tally orders by it (§5.1).
  v1's "Biggest catch: {name}, {kg} kg" stays v1.
- The card's PB knot and Old Ledger knot stay on the length ruler, with no words.

---

## 4. Everything else the player reads

### 4.1 The Journal (`openJournal`)

- **Biggest:** the weight of the PB length (`fmtWeight(fishWeight(sp, {length: pbLength}))`).
- **Weight:** the species' range from its smallest to a top Trophy, and under it what it is said to reach (D13;
  `data.weightSpan(sp)` → `{min, top, reach}`, `TEXT_V3.saidToReach`): the Dusk Minnow `2 oz – 1 lb 4 oz` · `said to reach 3 lb 10 oz`.
  A species capped at a Trophy or under (the Lampwarden Angler, the Quayling) and a legend (`265 lb – 397 lb`, first landing to
  fully grown) have no second line.
- **Got away list:** `Trophy, near 9 lb, under the Span, day 3 · threw the hook`.
- **Glimpsed page:** `Got away: a trophy, near 9 lb, under the Span, day 3.`
- **Your odds' Marked Fish lines:** `Old Ninefin, Elder, near 45 lb: 12%`.
- The per-species ruler (DESIGN §25.7.5) stays a length ruler drawn in ink, with no figures.

### 4.2 The got-away note (D6, D7)

- `size = fill(AUTOFISH.text.size, { a, class, size: nearWeight(D, sp, p.approxLength) })`, giving `An Elder, near 45 lb.`
- A legend: `Near 275 lb.`
- `sp` = `D.SPECIES_BY_ID[p.speciesId]`: the species is named on `fish:escaped`, after the loss (CONTRACT §13.5).
- `approxLength` stays as fishing makes it (±8%, rounded to cm steps, `fishing.js:1588–1591`); the weight is derived from it and
  then rounded to D7's steps.
- The ±8% in length is about ±26% in weight, and the word is "near".

### 4.3 The Elder Log, Tally Posts, wall plaques, legend growth (rules for when each is drawn)

- Each line leads with the weight; the length is the small detail:
  `Old Ninefin · Reedjaw Pike · 41 lb 2 oz · 147 cm · Under the Span · expedition 3, day 2 · the Taper`.
- An escaped Elder (`weight: null`) reads `near 45 lb`.
- Legend growth: `Expedition 3: 265 lb · Expedition 9: 397 lb`.

### 4.4 Bounties and challenges

- **The conversion rule.** A target authored in kg becomes `lb = Math.round(kg × 2.20462)`: 8 kg → **18 lb** (8.16 kg),
  15 kg → **33 lb** (14.97 kg). It is stored as `params.lb`. The check is `weightOz(fishWeight(sp, fish)) > lb × 16`.
- **Heavyweight**, phases 1–2: "Land a non-legendary fish over **18 lb 0 oz**." (the v1 row, patched in the v3 apply block).
- **Heavyweight**, phase ≥ 3: "over **33 lb 0 oz**" (`CHALLENGES_V3`). Both are `fmtWeight` of the target: the card's own figure.
- **Heavy bounties.** `weightTarget(heavyTargetKg(sp, 0.75), weight at z 1.04)` gives "`Land a Weeping Carp over 9 lb 0 oz.`"
  - The cap keeps today's test (`progression-v3.test.mjs:512`: the target is never above the top Keeper).
  - The words, the stored `targetOz` and the check agree.
  - Examples after the retune (75th percentile → target): Dusk Minnow 6.2 oz → `6 oz` · Mossback Perch 1.74 lb → `1 lb 8 oz` ·
    Gutter Crayfish → `9 oz` · Weeping Carp 8.56 lb → `9 lb 0 oz` · Candlefin Koi → `4 lb 0 oz` · Glassblown Puffer 1.59 lb →
    `1 lb 8 oz` · Mirror Pike → `10 lb 0 oz` · Gilt-Eyed Eel → `27 lb 0 oz` · Shroud Ray → `19 lb 0 oz`.
- **Saved bounties** from before the build: words from `fmtWeight(b.kg)` (exact), and the same figure as the target
  (`targetOz = weightOz(b.kg)`), so the check is the new one: over it, on the ounces the card shows. They last one day; the target
  itself was drawn under the old `k`, so for that day an eel's is easier and an angler's harder than a new one would be.
- **Achievability after the retune** (the sims do not model challenges):
  - 18 lb, open water, top Trophy at most: still reachable in every lake. The Mossmere through a Trophy Weeping Carp or Reedjaw; Sporewood
    a Prize Velvet Ray or Mildew Angler; Glasswater a Prize Mirror Pike or Blind Scrivener; the Pallid Deep a typical Gilt-Eyed Eel.
  - The Mildew Angler's Keeper no longer qualifies (19.6 → 13.3 lb at the Keeper top); the Gilt-Eyed Eel's median now does
    (7.9 → 19.8 lb).
  - Under the loop, challenges are parked.

### 4.5 Murk's lines, toasts, the ledger, the sell rows

- No current line carries a size.
- The Sell / Burn rows and the sell item `desc` read `6 lb 3 oz · Fine`.
- The ledger and its toasts read `Land a Weeping Carp over 9 lb 0 oz.`
- The rule for any later line: `fmtWeight` for a fish in hand, `fmtWeightNear` for one that got away, `weightTarget` for a target.

---

## 5. The loop (`GW_LOOP`; rules for slices 1a–3, nothing built yet)

### 5.1 The tally (SPEC §8.3)

- Murk's scale reads weights. Each fish's row is `name` (small) · **its weight** (`fmtWeight`, small, ink-dim) · its value ticking
  up.
- The order is **lightest first, heaviest last** (`fishWeight`); a giant goes last, alone, as written.
- `endTrip()` stores each fish's **length** with the result (as slice 1a's PLAN §3.4 `lastTrip.lines` do), never a weight: the
  tally reads `fmtWeight(fishWeight(species, line))`, on the first showing and on a replay. One rule everywhere (D5): a retune of `k`
  reaches a replayed tally as it reaches the Journal's best.
- A row's order key is `weightOz(fishWeight(species, line))`; two fish that read the same go by clams, then by the order caught.

### 5.2 The rest

- **The card** (SPEC §8.2: "name, class stamp and length as the hero"): the hero is the weight, the length is the detail line, as §3.
- **The ink print and the Journal** (SPEC §6.4): the best print per species records the weight, with the length as the detail.
- **The Chart** (SPEC §5.4): "your best fish there (species glyph, cm)" becomes "(species glyph, weight)". Across species it means
  the heaviest (`fishWeight`).
- **Murk's orders** (slice 3): a size order's target uses `weightTarget`.
- **The hold's slots:** any size shown on a slot uses `fmtWeight`.
- **Value is untouched:** SPEC §4.1's rule reads L50 (`body = clamp(√(L50 / 45 cm))`) and z, never weight.

---

## 6. The weight audit

### 6.1 What depends on weight (answer: no value and no balance rule, only two text rules)

| reader of weight / `k` | finding |
|---|---|
| value, food, oil (`fishValueV3`, `fishYieldV3`, `fishFigures`) | z and species constants only |
| clams (loop SPEC §4.1, `clams.mjs`) | L50 and z; `clams.mjs:253` copies `size.body` as `plan`, which nothing reads |
| catch chance (`catchParts`, `CATCH_V3`) | class, style, tier, items; no length or weight |
| the play, the show, poses, audio, models (`fishing-play.js`, `actors-show.js`, `showPoseFor`, `audio-v3.js`, `models-fish createFish({z})`) | class, class length and true length |
| roster rules (`roster-check.mjs`: kin, giants, record, legends ≥ 1.4×) | lengths |
| `validate-data` | `size.k === BALANCE_V3.size.k[size.body]` (line 970); a legend's `W50 = k·L50³` (963); `sp.weight` = [min < max] (975) |
| **the Heavyweight challenge and heavy bounties** | **weight**: these are the only rules (§4.4) |
| `zFromWeight`, `trueLength(sp, kg)` | invert with the same `k`; they follow by themselves |

**Proof run (scratch copy, the retune of §6.3 applied):**

- `node tools/sim/catch-v3.mjs`, `node tools/sim/clams.mjs --quick`, `node tools/sim/roster-check.mjs` and
  `node tools/sim/roster-v3.mjs`: byte-identical output before and after (`diff` empty).
- `node tools/validate-data.mjs` (no flags): OK in every pass (v1 22,693 checks; walk 26,253; v3 92,408).

**The builder re-runs all four sims on the branch** and keeps the "identical" result as the acceptance check.
`roster-v3.mjs --rows` prints the weights and is expected to change.

### 6.2 The table

Lengths in cm, weights in the game's new format.

- **Reference** is the cousin's typical weight at the same length. It comes from a published length–weight relation,
  `W(g) = a·L^b`, for the cousin (roach `a 0.0105 b 3.08`; European perch `0.0098 / 3.13`; European eel `0.00095 / 3.2`; the rest
  `k_ref·L³`). It is checked against the lead's figures: carp 61 cm 3.5–4 kg, pike 112 cm 11–13 kg, eel 90 cm 1.5–2 kg.
- **(no cousin)** marks a fantasy fish measured against its body's cousin.
- **Ceilings** are the class tops (S z −0.25, K 1.04, P 1.88, T 2.65) and R, "said to reach" (z 3.6, or the class cap), after the
  retune.
- **✗** = off by more than ±30% before the retune.

| species | body | k (g/cm³) | L50 | at L50: before → after | reference at L50 | off: before → after | ceilings after |
|---|---|---|---|---|---|---|---|
| dusk_minnow | minnow | 0.01 → **0.013** | 22 | 4 oz → **5 oz** | roach: 5 oz | -26% → -3% | S 21: 4 oz · K 25: 7 oz · P 29: 11 oz · T 35: 1 lb 4 oz · R 50: 3 lb 10 oz |
| mossback_perch | perch | 0.013 | 36 | 1 lb 5 oz | European perch: 1 lb 10 oz | -17% | S 35: 1 lb 3 oz · K 41: 2 lb 0 oz · P 48: 3 lb 3 oz · T 59: 6 lb 0 oz · R 85: 17 lb 11 oz |
| gutter_crayfish | crayfish | 0.03 | 19 | 7 oz | signal crayfish: 7 oz | 0% | S 19: 7 oz · K 21: 10 oz · P 24: 14 oz · T 29: 1 lb 10 oz · R 40: 4 lb 6 oz |
| lampsipper | minnow | 0.01 → **0.013** | 26 | 6 oz → **8 oz** | roach (no cousin): 8 oz | -27% → -5% | S 25: 7 oz · K 29: 12 oz · P 34: 1 lb 2 oz · T 42: 2 lb 1 oz · R 59: 6 lb 0 oz |
| weeping_carp | carp | 0.016 | 56 | 6 lb 3 oz | common carp: 6 lb 6 oz | -3% | S 54: 5 lb 8 oz · K 66: 10 lb 3 oz · P 79: 17 lb 5 oz · T 100: 35 lb 4 oz · R 148: 113 lb |
| candlefin_koi | koi | 0.015 | 46 | 3 lb 4 oz | koi: 3 lb 10 oz | -12% | S 45: 2 lb 15 oz · K 53: 4 lb 13 oz · P 61: 7 lb 10 oz · T 76: 14 lb 7 oz · R 109: 42 lb 10 oz |
| reedjaw_pike | pike | 0.0075 | 70 | 5 lb 11 oz | northern pike: 6 lb 7 oz | -12% | S 67: 5 lb 1 oz · K 82: 9 lb 1 oz · P 97: 15 lb 0 oz · T 122: 29 lb 13 oz · R 178: 93 lb 4 oz |
| gloam_eel | eel | 0.0016 → **0.0022** | 72 | 1 lb 5 oz → **1 lb 13 oz** | European eel: 1 lb 13 oz | -28% → -2% | S 70: 1 lb 10 oz · K 82: 2 lb 11 oz · P 96: 4 lb 4 oz · T 119: 8 lb 2 oz · R 170: 24 lb 0 oz |
| old_portcullis | carp | 0.016 | 58 | 6 lb 14 oz | flathead catfish: 5 lb 6 oz | +28% | S 56: 6 lb 2 oz · K 68: 11 lb 0 oz · P 80: 18 lb 3 oz · T 101: 36 lb 3 oz · R 147: 113 lb |
| cupbearer | minnow | 0.01 → **0.013** | 8 | ¼ oz | roach (no cousin): ¼ oz | -19% → +5% | S 8: ¼ oz · K 9: ¼ oz · P 10: ½ oz · T 12: ¾ oz · R 16: 2 oz |
| bridgechain_sturgeon | sturgeon | 0.006 | 70 | 4 lb 9 oz | white sturgeon: 5 lb 5 oz | -14% | S 67: 4 lb 0 oz · K 83: 7 lb 8 oz · P 99: 12 lb 11 oz · T 125: 25 lb 13 oz · R 185: 83 lb 1 oz |
| belled_matriarch | legend | 0.013086 → **0.006827** | 260 | 507 lb → **265 lb** | wels catfish: 263 lb | +92% **✗** → 0% | grown 298: 397 lb |
| sporebelly_puffer | puffer | 0.03 | 25 | 1 lb 1 oz | freshwater puffer: 1 lb 1 oz | 0% | S 24: 15 oz · K 28: 1 lb 7 oz · P 31: 2 lb 1 oz · T 38: 3 lb 10 oz · R 53: 9 lb 14 oz |
| plumgill_perch | perch | 0.013 | 40 | 1 lb 13 oz | European perch: 2 lb 4 oz | -18% | S 39: 1 lb 11 oz · K 46: 2 lb 12 oz · P 53: 4 lb 5 oz · T 66: 8 lb 4 oz · R 95: 24 lb 5 oz |
| capshell_crayfish | crayfish | 0.03 | 24 | 15 oz | signal crayfish: 15 oz | 0% | S 23: 14 oz · K 27: 1 lb 4 oz · P 30: 1 lb 13 oz · T 37: 3 lb 4 oz · R 51: 8 lb 12 oz |
| velvet_ray | ray | 0.012 | 67 | 7 lb 15 oz | river stingray (uncertain): 7 lb 15 oz | 0% | S 65: 7 lb 3 oz · K 78: 12 lb 5 oz · P 91: 19 lb 14 oz · T 113: 38 lb 10 oz · R 164: 117 lb |
| threadling_eel | eel → swampeel | 0.0016 (kept) | 86 | 2 lb 4 oz | marbled swamp eel: 1 lb 15 oz | +14% (kept: see §6.3) | S 83: 2 lb 1 oz · K 98: 3 lb 6 oz · P 115: 5 lb 5 oz · T 142: 10 lb 1 oz · R 203: 29 lb 11 oz |
| nightbloom_carp | carp | 0.016 | 58 | 6 lb 14 oz | giant barb: 7 lb 12 oz | -11% | S 56: 6 lb 1 oz · K 69: 11 lb 11 oz · P 83: 20 lb 6 oz · T 106: 42 lb 6 oz · R 158: 140 lb |
| mildew_angler | angler | 0.025 → **0.017** | 60 | 11 lb 14 oz → **8 lb 2 oz** | anglerfish: 7 lb 10 oz | +56% **✗** → +6% | S 58: 7 lb 3 oz · K 71: 13 lb 5 oz · P 85: 22 lb 11 oz · T 107: 46 lb 1 oz · R 158: 148 lb |
| sleepspore_jelly | jelly | 0.02 | 33 | 1 lb 9 oz | (no cousin): 1 lb 9 oz | 0% | S 32: 1 lb 8 oz · K 36: 2 lb 2 oz · P 41: 3 lb 0 oz · T 49: 5 lb 3 oz · R 68: 13 lb 10 oz |
| harpstring_eel | eel | 0.0016 → **0.0022** | 82 | 1 lb 15 oz → **2 lb 11 oz** | electric eel: 3 lb 1 oz | -36% **✗** → -12% | S 79: 2 lb 7 oz · K 94: 4 lb 0 oz · P 109: 6 lb 5 oz · T 135: 12 lb 0 oz · R 194: 35 lb 7 oz |
| hushcap_koi | koi | 0.015 | 50 | 4 lb 2 oz | koi: 4 lb 11 oz | -12% | S 48: 3 lb 12 oz · K 57: 6 lb 3 oz · P 67: 9 lb 12 oz · T 82: 18 lb 8 oz · R 118: 54 lb 12 oz |
| the_remembered_sun | koi | 0.015 | 45 | 3 lb 0 oz | koi: 3 lb 7 oz | -12% | S 44: 2 lb 12 oz · K 52: 4 lb 8 oz · P 60: 7 lb 2 oz · T 74: 13 lb 8 oz · R 106: 39 lb 15 oz |
| drifting_grove | legend | 0.011852 → **0.005556** | 300 | 705 lb → **331 lb** | giant freshwater stingray: 298 lb | +137% **✗** → +11% | grown 343: 496 lb |
| prism_minnow | minnow | 0.01 → **0.013** | 23 | 4 oz → **6 oz** | Siberian dace: 5 oz | -14% → +12% | S 22: 5 oz · K 26: 8 oz · P 30: 12 oz · T 37: 1 lb 7 oz · R 52: 4 lb 2 oz |
| glassgill_perch | perch | 0.013 | 43 | 2 lb 4 oz | European perch: 2 lb 13 oz | -19% | S 42: 2 lb 1 oz · K 49: 3 lb 7 oz · P 57: 5 lb 6 oz · T 71: 10 lb 3 oz · R 102: 30 lb 3 oz |
| glassblown_puffer | puffer | 0.03 | 27 | 1 lb 5 oz | freshwater puffer: 1 lb 5 oz | 0% | S 26: 1 lb 3 oz · K 30: 1 lb 12 oz · P 34: 2 lb 10 oz · T 41: 4 lb 10 oz · R 57: 12 lb 8 oz |
| chime_jelly | jelly | 0.02 | 36 | 2 lb 1 oz | (no cousin): 2 lb 1 oz | 0% | S 35: 1 lb 15 oz · K 40: 2 lb 12 oz · P 44: 3 lb 14 oz · T 53: 6 lb 11 oz · R 74: 17 lb 11 oz |
| mirror_pike | pike | 0.0075 | 75 | 7 lb 0 oz | northern pike: 7 lb 14 oz | -12% | S 72: 6 lb 2 oz · K 90: 11 lb 14 oz · P 108: 20 lb 11 oz · T 137: 43 lb 0 oz · R 205: 142 lb |
| shardspine_eel | eel | 0.0016 → **0.0022** | 85 | 2 lb 3 oz → **3 lb 0 oz** | NZ longfin eel: 3 lb 13 oz | -43% **✗** → -21% | S 82: 2 lb 11 oz · K 98: 4 lb 10 oz · P 115: 7 lb 7 oz · T 144: 14 lb 7 oz · R 208: 43 lb 15 oz |
| vesper_gar | pike → gar | 0.0075 → **0.003** | 70 | 5 lb 11 oz → **2 lb 4 oz** | longnose gar: 2 lb 4 oz | +150% **✗** → 0% | S 67: 2 lb 0 oz · K 82: 3 lb 10 oz · P 97: 6 lb 0 oz · T 122: 11 lb 15 oz · R 178: 37 lb 5 oz |
| blind_scrivener | angler | 0.025 → **0.017** | 64 | 14 lb 7 oz → **9 lb 13 oz** | anglerfish: 9 lb 4 oz | +56% **✗** → +6% | S 61: 8 lb 11 oz · K 76: 16 lb 3 oz · P 90: 27 lb 8 oz · T 114: 55 lb 14 oz · R 169: 180 lb |
| the_unreflected | perch | 0.013 | 60 | 6 lb 3 oz | European perch: 7 lb 15 oz | -22% | S 58: 5 lb 10 oz · K 69: 9 lb 5 oz · P 80: 14 lb 10 oz · T 99: 27 lb 12 oz · R 142: 82 lb 0 oz |
| the_footnote | perch | 0.013 | 51 | 3 lb 13 oz | European perch: 4 lb 12 oz | -20% | S 49: 3 lb 7 oz · K 58: 5 lb 11 oz · P 68: 9 lb 0 oz · T 84: 17 lb 1 oz · R 121: 50 lb 6 oz |
| rainglass_darter | minnow → trout | 0.01 → **0.011** | 39 | 1 lb 5 oz → **1 lb 7 oz** | Arctic grayling: 1 lb 8 oz | -14% → -6% | S 38: 1 lb 5 oz · K 44: 2 lb 0 oz · P 50: 3 lb 1 oz · T 61: 5 lb 8 oz · R 86: 15 lb 6 oz |
| the_sexton | carp | 0.016 | 66 | 10 lb 2 oz | common carp: 10 lb 7 oz | -3% | S 64: 9 lb 1 oz · K 77: 16 lb 3 oz · P 91: 26 lb 13 oz · T 115: 53 lb 5 oz · R 168: 167 lb |
| glass_sovereign | legend | 0.007778 | 300 | 463 lb | kaluga: 387 lb | +20% | grown 343: 694 lb |
| ossuary_fry | minnow | 0.01 → **0.013** | 23 | 4 oz → **6 oz** | roach (no cousin): 6 oz | -26% → -4% | S 22: 5 oz · K 26: 8 oz · P 30: 12 oz · T 37: 1 lb 7 oz · R 52: 4 lb 2 oz |
| pallid_wraithfin | ghost | 0.01 → **0.006** | 46 | 2 lb 2 oz → **1 lb 5 oz** | spotted ratfish: 1 lb 3 oz | +82% **✗** → +9% | S 45: 1 lb 3 oz · K 53: 1 lb 15 oz · P 61: 3 lb 1 oz · T 76: 5 lb 12 oz · R 109: 17 lb 1 oz |
| bonecrook_crayfish | crayfish | 0.03 | 27 | 1 lb 5 oz | signal crayfish: 1 lb 5 oz | 0% | S 26: 1 lb 3 oz · K 30: 1 lb 12 oz · P 34: 2 lb 10 oz · T 41: 4 lb 10 oz · R 57: 12 lb 8 oz |
| gilt_eyed_eel | eel → greateel | 0.0016 → **0.004** | 131 | 7 lb 15 oz → **19 lb 13 oz** | conger eel: 19 lb 13 oz | -60% **✗** → 0% | S 126: 17 lb 9 oz · K 155: 32 lb 11 oz · P 185: 55 lb 8 oz · T 234: 113 lb · R 345: 363 lb |
| shroud_ray | ray | 0.012 | 82 | 14 lb 9 oz | stingray (uncertain): 14 lb 9 oz | 0% | S 79: 13 lb 2 oz · K 95: 22 lb 9 oz · P 111: 36 lb 8 oz · T 139: 70 lb 13 oz · R 201: 215 lb |
| funeral_veil | ghost | 0.01 → **0.006** | 42 | 1 lb 10 oz → **1 lb 0 oz** | ratfish (no cousin): 14 oz | +82% **✗** → +9% | S 41: 15 oz · K 46: 1 lb 5 oz · P 52: 1 lb 14 oz · T 62: 3 lb 3 oz · R 86: 8 lb 7 oz |
| lampwarden_angler | angler | 0.025 → **0.017** | 72 | 20 lb 9 oz → **14 lb 0 oz** | anglerfish: 13 lb 3 oz | +56% **✗** → +6% | S 70: 12 lb 10 oz · K 83: 21 lb 10 oz · P 98: 35 lb 0 oz · R 121: 67 lb 3 oz |
| the_clapper | carp | 0.016 | 66 | 10 lb 2 oz | common carp: 10 lb 7 oz | -3% | S 64: 9 lb 1 oz · K 77: 16 lb 3 oz · P 91: 26 lb 13 oz · T 115: 53 lb 5 oz · R 168: 167 lb |
| wax_bearer | eel | 0.0016 → **0.0022** | 127 | 7 lb 4 oz → **9 lb 15 oz** | European eel (no cousin): 11 lb 5 oz | -36% **✗** → -12% | S 123: 9 lb 0 oz · K 145: 14 lb 14 oz · P 169: 23 lb 8 oz · T 209: 44 lb 8 oz · R 300: 132 lb |
| the_unpaid_fare | ghost | 0.01 → **0.006** | 87 | 14 lb 8 oz → **8 lb 11 oz** | ratfish (no cousin): 8 lb 0 oz | +82% **✗** → +9% | S 84: 7 lb 13 oz · K 101: 13 lb 8 oz · P 118: 21 lb 13 oz · T 147: 42 lb 4 oz · R 213: 129 lb |
| candlewake_sturgeon | sturgeon | 0.006 | 133 | 31 lb 2 oz | white sturgeon: 36 lb 5 oz | -14% | S 127: 27 lb 5 oz · K 160: 53 lb 12 oz · P 193: 94 lb 13 oz · T 247: 199 lb · R 370: 670 lb |
| the_namesake | perch | 0.013 | 62 | 6 lb 13 oz | European perch: 8 lb 13 oz | -22% | S 60: 6 lb 3 oz · K 71: 10 lb 4 oz · P 83: 16 lb 2 oz · T 102: 30 lb 10 oz · R 147: 90 lb 8 oz |
| lantern_swallower | legend | 0.005211 | 850 | 7,055 lb | bluntnose sixgill: 7,176 lb | -2% | grown 973: 10,583 lb |
| pilgrim_salmon@sporewood | pike → trout | 0.0075 → **0.011** | 66 | 4 lb 12 oz → **7 lb 0 oz** | Chinook salmon: 7 lb 2 oz | -33% **✗** → -2% | S 64: 6 lb 5 oz · K 76: 10 lb 7 oz · P 88: 16 lb 8 oz · T 109: 31 lb 4 oz · R 156: 92 lb 6 oz |
| pilgrim_salmon@glasswater | pike → trout | 0.0075 → **0.011** | 76 | 7 lb 4 oz → **10 lb 10 oz** | Chinook salmon: 10 lb 13 oz | -33% **✗** → -2% | S 74: 9 lb 11 oz · K 87: 16 lb 0 oz · P 101: 25 lb 3 oz · T 125: 47 lb 11 oz · R 180: 141 lb |
| pilgrim_salmon@paleabyss | pike → trout | 0.0075 → **0.011** | 87 | 10 lb 14 oz → **16 lb 0 oz** | Chinook salmon: 16 lb 4 oz | -33% **✗** → -2% | S 84: 14 lb 8 oz · K 100: 23 lb 15 oz · P 116: 37 lb 12 oz · T 143: 71 lb 9 oz · R 206: 212 lb |
| hearthfish | koi | 0.015 | 32 | 1 lb 1 oz | koi: 1 lb 4 oz | -12% | S 31: 1 lb 0 oz · K 36: 1 lb 9 oz · P 42: 2 lb 7 oz · T 51: 4 lb 8 oz · R 73: 12 lb 14 oz |
| quayling | minnow | 0.01 → **0.013** | 14 | 1 oz | roach (no cousin): 1 oz | -23% → 0% | S 14: 1 oz · R 16: 2 oz |

Spot checks against the lead's figures, after the retune:

- a 61 cm carp is 3.63 kg (8 lb 0 oz) ✓;
- a 112 cm pike is 10.54 kg (23 lb 4 oz): 4–19% under 11–13 kg, inside the band, so `pike` stays 0.0075, the reference species;
- a 90 cm Gloam Eel is 1.60 kg (3 lb 8 oz) ✓;
- the Gloam Eel's roster record of 133 cm is 5.2 kg (11 lb 7 oz), about a national-record eel ✓;
- the Gilt-Eyed Eel's Trophy top (234 cm, 113 lb) sits just under a national-record conger;
- the Belled Matriarch at 260 cm is 265 lb (a 2.7 m wels is about 130 kg);
- the Drifting Grove fully grown is 496 lb, below the 661 lb (300 kg) record stingray, which was about 4 m long.

### 6.3 The retune (data, `src/data.js`; every value is v3-only and outside the v1 fingerprint)

1. `BALANCE_V3.size.k` (line 2669):
   - `minnow 0.010 → 0.013` (roach; the research's own note for the Dusk Minnow's ancestor is "4 to 5 oz" at 21 cm, which 0.013
     gives);
   - `eel 0.0016 → 0.0022` (European eel);
   - `angler 0.025 → 0.017` (anglerfish);
   - `ghost 0.010 → 0.006` (ratfish);
   - **new** `trout: 0.011` (salmon, grayling); `gar: 0.0030` (longnose gar); `greateel: 0.0040` (conger); `swampeel: 0.0016` (today's
     eel constant, kept for the slim swamp eel, so its weights do not move).
2. Species bodies:
   - `pilgrim_salmon` (line 3129) `body: 'pike', k: SZK.pike` → `body: 'trout', k: SZK.trout`;
   - `rainglass_darter` (3081) `'minnow'` → `'trout'`;
   - `vesper_gar` (3074) `'pike'` → `'gar'`;
   - `gilt_eyed_eel` (3096) `'eel'` → `'greateel'`;
   - `threadling_eel` (3040) `'eel'` → `'swampeel'`.

   `size.body` feeds only `k`. The model's `shape` is separate and untouched.
3. Legends:
   - `belled_matriarch` (3032) `legendSize(260, 230)` → **`legendSize(260, 120)`**;
   - `drifting_grove` (3060) `legendSize(300, 320)` → **`legendSize(300, 150)`**.

   `k` re-derives itself; `s.weight` becomes `[120, 180]` / `[150, 225]`.
4. Not changed, though within the band: `perch` (−17 to −22%), `koi` (−12%), `pike` (−12%), `sturgeon` (−14%), `ray` (no reliable
   cousin figure at these lengths; uncertain), `puffer`, `jelly`, `crayfish`, the Glass Sovereign (+20%) and the
   Lantern-Swallower (−2%).
   - Old Portcullis (+28% against a flathead) stays on `carp`. Its roster plan is `catfish`, and slice 1b's converter will give it a
     catfish `k`.
5. Why the Threadling gets its own key rather than the new eel constant: it would go from +14% to +57% against a slim swamp eel. Its
   ancestor note is the least certain in the table, and a separate key keeps its weights exactly as they are.

**Acceptance for the retune:** `validate-data.mjs` OK in all passes. `catch-v3.mjs`, `clams.mjs --quick` and `roster-check.mjs`
byte-identical to `ccr` (the scratch proof in §6.1). The `progression-v3` heavy-bounty test still holds (targets are derived from z,
and the cap is the top-Keeper weight).

### 6.4 The roster's converter (slice 1b): the rule, not the data

1. **A fish's `k` is its body plan's.** `BALANCE_V3.size.k` is keyed by the roster's `bodyPlan` names: the built keys plus catfish,
   disc, dogtooth, bream, shark, sawfish, gar, trout, snakehead, lamprey, jack, tuna, billfish, cod, flatfish, softshell, salamander
   and squid (`roster.json.newBodyPlans`).
   - The converter writes `size.k = SZK[bodyPlan]` and `validate-data` keeps rule 970.
   - A plan's value is chosen from a real cousin by §6.2's method: the length–weight relation at the plan's median L50, recorded in
     the docs beside the table.
2. **A fish whose own cousin is more than ±30% off its plan's `k`** (a conger in `eel`, a zander in `perch`, a heavy-bodied barb in
   `bream`) gets its own body key in `BALANCE_V3.size.k`, named with a plain family or build word (`trout`, `gar`, `greateel`, `swampeel`) and
   **never with a real species' own name**: `tools/sim/roster-check.mjs` `REAL_NAMES` is the list (it holds "conger"; family words such
   as trout, gar, eel and pike are allowed there). It never gets a per-fish number in `roster.json`.
3. **Legends:** the roster gives `W50` (kg), the cousin's weight at the legend's first-landing length. The converter uses
   `legendSize(L50, W50)`, so a legend whose roster L50 differs from the built one (the Glass Sovereign 380 vs 300 cm) keeps the
   cousin's `k`: `W50_new = k·L50_new³`.
4. **`roster-check.mjs` gains one rule:** every fish's weight at its L50 is within ±30% of its cousin's reference weight.
   - The reference lives in a docs-only roster field `refWeight: {cm, kg, source}`. It is **not** on the converter's allow-list
     (SPEC §13 slice 1b) and never reaches `src/`.
   - A fish with no cousin figure is marked `refWeight: null` with a note.
5. **Kin by weight:** "every giant outgrows every ordinary fish of its own body plan in its water" holds by weight as well as by
   length, because they share `k` (rule 2 may split a plan; the check then runs per key).

---

## 7. Tests to add

New file **`tools/tests/pounds.test.mjs`**, picked up by `tools/check.mjs` (it runs every `*.test.mjs`). It imports data twice, flag
off then `GW_V3 = true; GW_V3_PHASE = 1`, the way `ui-screens-v3.test.mjs` does.

1. **The helper's table:** §2.3, every row, exact strings; nbsp; the no-decrease sweep; the shape regex; `fmtWeightNear`,
   `weightTarget`, `fmtCm`; `weightOz` and `fishWeight` (length wins over the stored weight; no length falls back to `weight`;
   legends use their own `k`).
2. **The card's count:**
   - For every v3 species at z ∈ {−2, −0.25, 0.4, 1.04, 1.88, 2.65, 3.6} (and each legend), run `weightCount(W·e(k)³, W)` over
     k = 0…1 in 240 steps.
   - Each string is `≤ weightSizer(W)` in length.
   - The parsed values never decrease and never exceed W.
   - The value at k = 1 is exactly `fmtWeight(W)`.
   - A final ≥ 100 lb shows only `N lb` forms; a final under 1 lb never shows `lb`.
   - The sizer rule: Weeping Carp at z 1.4 (`… lb … oz`) → sizer `` `${P−1} lb 15 oz` `` when P ≥ 2.
3. **The card's final string** (`ui-screens-v3.test.mjs` or `ui-show.test.mjs`, the stub-DOM pattern those already use):
   - the hero's live span ends on `fmtWeight(fishWeight(sp, fish))`;
   - the `.gw-cc-len` row reads `fmtCm(fish.length)`;
   - the card has no `kg` and exactly one `cm` (in `.gw-cc-len`).
4. **Records by weight:**
   - `progression-v3.test.mjs`: a PB writes `pbLength`, and `TEXT_V3.newBest` lines read
     `New best: {fmtWeight(now)} (was {fmtWeight(prev)})`;
   - `r.stats.biggest` across two species holds the heavier, not the longer: a 108 cm Mirror Pike (20 lb 11 oz) beats a 131 cm
     Gilt-Eyed Eel (19 lb 13 oz);
   - `recordLines` sub reads `… past your old mark` in weight.
5. **Hidden information:**
   - `leakScan` also flags `/\d\s?(lb|oz)\b|[¼½¾]\s?oz/` when `allowWeight` is false;
   - the existing play scans (`ui-af.test.mjs`, `af-ui.scenario.mjs`: from the cast to the reveal) run with it, so no weight is
     ever on screen during the play;
   - `gotAwayNote` for two species with the same `approxLength` gives different weights, which is allowed because it shows after the
     loss (assert that `mode`, `kicker` and `cause` are species-free, as now).
6. **Bounties and challenges:**
   - Heavyweight P1 `params.lb === 18`, desc "over 18 lb 0 oz", P3 33;
   - a fish of exactly `33 lb 0 oz` does not complete it, one of `33 lb 1 oz` does;
   - a heavy bounty's `text` ends `over {fmtWeight(b.kg)}.` (no half-pound glyph), its `targetOz` equals `weightTarget(...)` and
     `weightOz(b.kg)`, it stays ≤ the top-Keeper weight (keep the 512 test), and the check uses `targetOz`;
   - an old saved bounty (`kg` only) reads `fmtWeight(b.kg)` and takes `targetOz = weightOz(b.kg)`.
7. **v1 parity** (flag off; in `pounds.test.mjs`):
   - `TEXT`, `BOUNTIES`, `CHALLENGES` and `SPECIES` are deep-equal to the flag-off import's (the fingerprint already proves this; this
     makes it explicit);
   - progression's v1 summary still prints `Biggest catch: {name}, {kg} kg`;
   - the v1 market sell row still reads `N.NN kg · Normal`;
   - `heavy_catch.params` is `{kg: 8, excludeLegendary: true}`.
   - Plus the standing gates: `node tools/check.mjs` (the golden v1 fishing trace, `v1-fishing-trace.test.mjs`),
     `node tools/validate-data.mjs` (the v1-exports fingerprint), `node tools/scenario-run.mjs` → `ALL INVARIANTS HOLD`.
8. **The grep test** (`pounds.test.mjs`, static, over `src/`):
   - Every string or template literal containing `' kg'`, `` `kg` ``, `{kg}` or ` kg\`` must sit on a line that carries the marker
     comment `// v1` (the builder adds it to the kept v1 arms: `ui-screens.js` 750 / 814 / 1194 / 1255 / 1355–1356,
     `progression-market.js:146`, `progression.js:84 / 1374`, `ui.js:46`, `core.js:373`, `data.js:1276 / 1301 / 1506`).
   - Then at runtime, with `GW_V3` on: no string in `TEXT_V3`, `AUTOFISH.text`, `FIRST_EVENING.text`, `TIPS` (v3), `MERCHANT_LINES`,
     `DESC_V3`, the patched `BOUNTIES` or the active `CHALLENGES` matches `/\bkg\b|\{kg\}|\{cm\} cm/`.
   - `ui-screens.js` must no longer contain `fmtLength(` (the hero and the Journal are weight now).
   - Update the scenario check that asserts the opposite: `p1b-ui.scenario.mjs:308` (`/kg/.test(s.stats)`) → the stats hold
     `length` with `cm`, and the hero matches the weight shape regex.

### 7.9 Browser runs (this job's only browser work; one at a time on software GL)

1. **The regression:** `node tools/scenario-run.mjs` on the rebuilt flag-off `index.html` (`node build.mjs` from `gloomwater/`),
   which must print `ALL INVARIANTS HOLD`.
2. **One desktop and one phone capture of the catch card in pounds:**
   - `node build.mjs --dev --out=tools/out/pounds/dev.html`, then inject
     `<script>globalThis.GW_V3=true;globalThis.GW_V3_PHASE=1;</script>` before the first `<script`;
   - `node tools/playtest.mjs --html=tools/out/pounds/v3.html --shots=tools/out/pounds/desktop --script=tools/tests/catch-shots.scenario.mjs --width=960 --height=540 --only=prize`
     and the same with `--mobile` (`--only=prize`; also `elder` if cheap, for a long `NN lb NN oz` hero);
   - check by eye: the hero `N lb M oz`, the `length · N cm` row, no overflow at 390 px, the fraction glyph if a Small Cupbearer is
     in the set.
3. **The Journal page**, if cheap: open the Journal on the same save, one shot.

---

## 8. Docs that state the unit (edits for the builder)

| doc | where | edit |
|---|---|---|
| `DESIGN.md` §25.0.1 | the request table | add **row 17**: the user's words (above) → "a fish's size is told in pounds (§25.7.1 display rule; `docs/v3/pounds/SPEC.md`)" |
| `DESIGN.md` §25.7.1 | after the `weight W = k · L³` block | add "**Shown as weight.** The player reads weight in pounds and ounces (`data.fmtWeight`, UK style: `11 oz`, `4 lb 6 oz`, `212 lb`); length is the hidden truth (scale, pose, classes, value) and is shown only as the card's `length` line in cm. `k` per body is checked against a real cousin (±30%; `docs/v3/pounds/SPEC.md` §6)" |
| `DESIGN.md` §25.6.8 | lines 3199, 3216, 3218 ("the length counts up beside the class stamp"; "the class stamp and the length side by side as the hero") | "the **weight** counts up…", "the class stamp and the **weight** as the hero (the length becomes the small `length` line)" |
| `DESIGN.md` §25.6.7 | "Size words" bullet and the example ("An Elder, near 1.6 m.", "Got away: a Trophy, near 1.1 m", "A Trophy Reedjaw, near 1.1 m") | the weight estimate with D7's steps (`near 45 lb`, `near 9 lb`); the ±8% length estimate stays the source |
| `DESIGN.md` §25.6.10 | the "length" and "Measuring Cord" rows | add: "**weight** is never shown before the reveal (weight is `k·L³` and names the body); the got-away note's 'near N lb' is after the loss". The Measuring Cord row: "never a length or a weight" |
| `DESIGN.md` §25.7.4 | records table | personal best: "per species by length (the same as by weight); shown as weight: 'New best: 4 lb 6 oz (was 3 lb 12 oz)'"; Elder Log: "weight, then cm"; legend growth: "265 lb · 397 lb" |
| `DESIGN.md` §25.7.6 | the roster table (e.g. row 29 "75 / 3.2 kg … 205 / 65 kg") | the weight columns in lb (`7 lb 0 oz`, …) from `roster-v3.mjs --rows` after the retune, or a note: "weights in this table predate the pounds audit; `docs/v3/pounds/SPEC.md` §6.2 is current" |
| `DESIGN.md` §25.4 (2495), §25.8.1 (3538) | wall plaque "(species, cm, kg, …)"; Tally Posts "(species glyph, cm, kg)" | "(species, weight, cm, …)"; "(species glyph, weight)" |
| `DESIGN.md` §25.12 challenge table (3835) | Heavyweight "over 15 kg" | "over 33 lb 0 oz (P1–2: over 18 lb 0 oz)" |
| `DESIGN.md` §25.14 work list (4044 U2) | "the card shows cm, kg, class and favours" | add a new row **U20 Pounds** (ui, progression, data; S–M; this spec) and leave U2 as history |
| `DESIGN.md` §869 (v1 Heavyweight row), §1838 kg column | v1 | none (v1 stays as written) |
| `CONTRACT.md` §13.2 | `Fish += { … weight /*kg*/ … }` (980), journal `pbWeight` (990) | keep kg internally; add "**display**: `data.fishWeight(sp, fish)` → `data.fmtWeight`; never `fish.weight` directly in v3 UI" |
| `CONTRACT.md` §13.5 | `fish:escaped {approxLength}` (1031) | unchanged payload; add "the ui words it as weight with `fmtWeightNear`" |
| `CONTRACT.md` §13.7b ui ↔ audio (1422) | "`card:count {dur}` as the length counts up" | "as the weight counts up (driven by length: `cm = L·e(k)`, shown `W·(cm/L)³`)" |
| `CONTRACT.md` §13.7 ui exports | ui-v3 | add `fmtCm` (re-export), `weightCount(w, W)`, `weightSizer(W)` / `weightSizers(W)`, `weightHtml(text)`; ui-af `nearWeight(D, sp, cm)` |
| `CONTRACT.md` §13.8 | schema (1428), helpers row (1515), `BALANCE.ceremony` row (1479) | `size.k` table gains `trout`, `gar`, `greateel`, `swampeel`; helpers add `fmtWeight`, `weightOz`, `fishWeight`, `fmtWeightNear`, `weightTarget`, `weightSpan`, `fmtCm`, `LB_PER_KG`, `OZ_PER_KG`; `AUTOFISH.gotAway.roundLb`; `TEXT_V3.newBest` uses `{w}`; `heavy_catch.params.lb`; `mmBelow` "read by `fmtLength` only" |
| `CONTRACT.md` §13.10 | tests | add `pounds.test.mjs` and the leak pattern |
| `docs/loop/SPEC.md` §8.2 | "name, class stamp and length as the hero" | "name, class stamp and **weight** as the hero, the length as a small line (cm)" |
| `docs/loop/SPEC.md` §8.3 | the tally row | "the fish go onto Murk's scale one by one, **heaviest** last; each shows its weight (small) and its value ticking up…" |
| `docs/loop/SPEC.md` §5.4, §6.4 | "(species glyph, cm)"; "best print per species (length, …)" | "(species glyph, weight)"; "(weight and length, …)" |
| `docs/loop/SPEC.md` §13 slice 1b | the converter's rules table | add the `sizeModel` → `size.k` row of §6.4 (k from the plan's key; a split key for a cousin ±30% off; legends' `W50`); the allow-list unchanged (`refWeight` stays in docs) |
| `docs/v3/show/SPEC.md` | 324 "`cord_tick` rising under the length as it counts up"; 336, 348 "The hero length counts 0 → its figure"; 621 "the length counts up" | "the weight"; "The hero weight counts 0 → its figure (in the final's band)" |
| `docs/loop/ROSTER.md` | §1 rules table, "sizes" row; §3 header ("Lengths in cm") | add a row **weights**: "W = k·L³, k from the body plan's key (checked ±30% against the `inspiredBy` cousin, `refWeight`); the game shows pounds"; the §3 note "Lengths in cm (the hidden truth; the game shows the weight in pounds)". An optional "typical (lb)" column (Keeper floor to Prize top) can be generated by `roster-check.mjs --md` once the converter's keys exist |
| `docs/loop/QUEUE.md` | job 3 | the builder marks it done at merge, as usual |

---

## 9. Build order (one branch, `gw-pounds`; small commits)

1. **data.js:** the helpers (§2.2); the retune (§6.3); `AUTOFISH.gotAway.roundLb`, `AUTOFISH.text.size` / `.log.marked` `{size}`,
   `TEXT_V3.newBest` `{w}`; the v3 apply-block patches (heavy bounty template, `heavy_catch` 18 lb for P < 3);
   `CHALLENGES_V3.heavy_catch` 33 lb. Then `validate-data.mjs` (+ the rule 1267 edit) and the four sims (byte-identical).
2. **Pure helpers:** `ui-v3.js` (`weightCount`, `weightSizer`, `recordLines` in weight); `ui-af.js` (`nearWeight`, the got-away
   and log lines, the `leakScan` pattern); `progression-af.js` `gotAwayLines`. Then `pounds.test.mjs` and the ui-v3 / ui-af test
   updates.
3. **Progression:** records lines, `stats.biggest`, the bounty target and check, the challenge check. Then the tests of §7 items 4 and 6.
4. **Screens:** the card (§3), the Journal, the creel / sell / ledger rows, `ui.css`. Then the stub-DOM card test, `check.mjs`.
5. **Docs** (§8), then this spec into `gloomwater/docs/v3/pounds/SPEC.md`.
6. **Rebuild and regress:** `node build.mjs` (the tracked flag-off `index.html`); `node tools/scenario-run.mjs` →
   `ALL INVARIANTS HOLD`; the two card captures (§7.9).

Every commit message ends with the two attribution lines the job gives. No model names anywhere. Nothing shipped names a series, a
presenter, a real river or a country: the cousins' names in §6 are docs-only, the way ROSTER.md keeps them.

---

## 10. Risks

- **The handwriting font and the fraction glyphs.**
  - Cedarville Cursive (`--f-hand`) may lack ¼ ½ ¾. The browser then takes them from the fallback font: legible, a slightly different
    hand.
  - Only the smallest fish use them (a Cupbearer, a Quayling): no target is worded with one (D10).
  - Check in the phone capture. If they look wrong, the hero can wrap the glyph in a `<span class="gw-frac">` set in `--f-body`.
- **A wider hero.** `12 lb 13 oz` is about twice `178 cm`. The `--long` size step and the sizer handle it, but the docked
  desktop card (`.gw-cc-side`, 380–560 px) and the 390 px phone must be looked at once (§7.9).
- **Tabular figures in a cursive font** may not exist; the sizer still reserves the box, so only the live figure's own glyph width
  wobbles inside a fixed box. The layout never moves.
- **Shared lines.** ui-screens 750 / 814 / 1194 / 1255 / 1355–1356, market 146 / 444–447 / 578, challenges 183 and the ledger row
  are shared with v1. Each must keep its v1 arm character for character. The `// v1` markers and the grep test (§7 item 8) hold the
  line, and the golden trace plus scenario-run prove behaviour.
- **The retune moves two rules.**
  - The Heavyweight gets a little harder in Sporewood (an Angler Keeper no longer passes) and easier in the Pallid Deep (a typical
    Gilt-Eyed Eel passes).
  - Heavy bounties re-word, but their z target is unchanged.
  - No value, clam, catch chance or pacing figure moves (§6.1).
- **Old saves** keep their stored kg (`pbWeight`, `biggest`, Elder Log `weight`, creel fish). D5 derives every display from length,
  so they read with the new `k`. A legacy journal row with no `pbLength` (migrated from v1) shows its stored kg in pounds:
  consistent, if from the old `k`.
- **A 0-oz quarter case.** A positive weight under ⅛ oz still prints `¼ oz` by design (a 3 cm fry). No fish in the game is that
  small (the smallest, a Small Cupbearer at z −2, is 6.7 cm, about 4 g).
- **"near" versus "about".** The ruling's examples say "about 3 lb". This spec keeps the built word "near" (one data string,
  `AUTOFISH.gotAway.word`) and flags it (D7).
- **The play's estimate.** If the lead wants a number during the play itself, only a species-independent figure is allowed: a class
  word, or the class-length ladder with one fixed `k`, which would mislead by up to a factor of 10 between an eel and a crayfish. D6
  recommends none.

---

## 11. As built (branch `gw-pounds`)

The build follows §0–§9. What it settled, added or did differently, so the document and the code agree:

**The retune went in as §6.3 wrote it, and nothing else moved.** `node tools/sim/catch-v3.mjs`, `node tools/sim/clams.mjs --quick`,
`node tools/sim/roster-check.mjs` and `node tools/sim/roster-v3.mjs` print byte for byte what they printed at 27f2950; across all 53
species no length, value or oil yield changed at z −2, 0, 1.04, 2.65 or 3.6. `validate-data.mjs` passes its three passes. The record,
before → after, from the two data builds (weights of the model, `k·L³`):

| species | body and k (g/cm³): before → after | at L50 | at the Trophy top | said to reach |
|---|---|---|---|---|
| Dusk Minnow | minnow 0.01 → minnow 0.013 | 22 cm: 4 oz → **5 oz** | Trophy top 35 cm: 1 lb 0 oz → **1 lb 4 oz** | 50 cm: 2 lb 13 oz → **3 lb 10 oz** |
| Lampsipper | minnow 0.01 → minnow 0.013 | 26 cm: 6 oz → **8 oz** | Trophy top 42 cm: 1 lb 10 oz → **2 lb 1 oz** | 59 cm: 4 lb 10 oz → **6 lb 0 oz** |
| Gloam Eel | eel 0.0016 → eel 0.0022 | 72 cm: 1 lb 5 oz → **1 lb 13 oz** | Trophy top 119 cm: 5 lb 14 oz → **8 lb 2 oz** | 170 cm: 17 lb 7 oz → **24 lb 0 oz** |
| Cupbearer | minnow 0.01 → minnow 0.013 | 8 cm: ¼ oz → **¼ oz** | Trophy top 12 cm: ½ oz → **¾ oz** | 16 cm: 2 oz → **2 oz** |
| The Belled Matriarch | legend 0.013086 → legend 0.006827 | 260 cm: 507 lb → **265 lb** | fully grown 298 cm: 761 lb → **397 lb** | — |
| Mildew Angler | angler 0.025 → angler 0.017 | 60 cm: 11 lb 14 oz → **8 lb 2 oz** | Trophy top 107 cm: 67 lb 12 oz → **46 lb 1 oz** | 158 cm: 218 lb → **148 lb** |
| Harpstring Eel | eel 0.0016 → eel 0.0022 | 82 cm: 1 lb 15 oz → **2 lb 11 oz** | Trophy top 135 cm: 8 lb 11 oz → **12 lb 0 oz** | 194 cm: 25 lb 12 oz → **35 lb 7 oz** |
| The Drifting Grove | legend 0.011852 → legend 0.005556 | 300 cm: 705 lb → **331 lb** | fully grown 343 cm: 1,058 lb → **496 lb** | — |
| Prism Minnow | minnow 0.01 → minnow 0.013 | 23 cm: 4 oz → **6 oz** | Trophy top 37 cm: 1 lb 2 oz → **1 lb 7 oz** | 52 cm: 3 lb 3 oz → **4 lb 2 oz** |
| Shardspine Eel | eel 0.0016 → eel 0.0022 | 85 cm: 2 lb 3 oz → **3 lb 0 oz** | Trophy top 144 cm: 10 lb 8 oz → **14 lb 7 oz** | 208 cm: 31 lb 15 oz → **43 lb 15 oz** |
| Vesper Gar | pike 0.0075 → gar 0.003 | 70 cm: 5 lb 11 oz → **2 lb 4 oz** | Trophy top 122 cm: 29 lb 13 oz → **11 lb 15 oz** | 178 cm: 93 lb 4 oz → **37 lb 5 oz** |
| The Blind Scrivener | angler 0.025 → angler 0.017 | 64 cm: 14 lb 7 oz → **9 lb 13 oz** | Trophy top 114 cm: 82 lb 3 oz → **55 lb 14 oz** | 169 cm: 265 lb → **180 lb** |
| Rainglass Darter | minnow 0.01 → trout 0.011 | 39 cm: 1 lb 5 oz → **1 lb 7 oz** | Trophy top 61 cm: 5 lb 0 oz → **5 lb 8 oz** | 86 cm: 13 lb 15 oz → **15 lb 6 oz** |
| Ossuary Fry | minnow 0.01 → minnow 0.013 | 23 cm: 4 oz → **6 oz** | Trophy top 37 cm: 1 lb 2 oz → **1 lb 7 oz** | 52 cm: 3 lb 3 oz → **4 lb 2 oz** |
| Pallid Wraithfin | ghost 0.01 → ghost 0.006 | 46 cm: 2 lb 2 oz → **1 lb 5 oz** | Trophy top 76 cm: 9 lb 10 oz → **5 lb 12 oz** | 109 cm: 28 lb 7 oz → **17 lb 1 oz** |
| Gilt-Eyed Eel | eel 0.0016 → greateel 0.004 | 131 cm: 7 lb 15 oz → **19 lb 13 oz** | Trophy top 234 cm: 45 lb 2 oz → **113 lb** | 345 cm: 145 lb → **363 lb** |
| Funeral Veil | ghost 0.01 → ghost 0.006 | 42 cm: 1 lb 10 oz → **1 lb 0 oz** | Trophy top 62 cm: 5 lb 5 oz → **3 lb 3 oz** | 86 cm: 14 lb 1 oz → **8 lb 7 oz** |
| Lampwarden Angler | angler 0.025 → angler 0.017 | 72 cm: 20 lb 9 oz → **14 lb 0 oz** | Trophy top 121 cm: 98 lb 13 oz → **67 lb 3 oz** | 121 cm: 98 lb 13 oz → **67 lb 3 oz** |
| The Wax-Bearer | eel 0.0016 → eel 0.0022 | 127 cm: 7 lb 4 oz → **9 lb 15 oz** | Trophy top 209 cm: 32 lb 6 oz → **44 lb 8 oz** | 300 cm: 95 lb 11 oz → **132 lb** |
| The Unpaid Fare | ghost 0.01 → ghost 0.006 | 87 cm: 14 lb 8 oz → **8 lb 11 oz** | Trophy top 147 cm: 70 lb 7 oz → **42 lb 4 oz** | 213 cm: 214 lb → **129 lb** |
| Pilgrim Salmon (sporewood) | pike 0.0075 → trout 0.011 | 66 cm: 4 lb 12 oz → **7 lb 0 oz** | Trophy top 109 cm: 21 lb 5 oz → **31 lb 4 oz** | 156 cm: 62 lb 15 oz → **92 lb 6 oz** |
| Pilgrim Salmon (glasswater) | pike 0.0075 → trout 0.011 | 76 cm: 7 lb 4 oz → **10 lb 10 oz** | Trophy top 125 cm: 32 lb 9 oz → **47 lb 11 oz** | 180 cm: 96 lb 2 oz → **141 lb** |
| Pilgrim Salmon (paleabyss) | pike 0.0075 → trout 0.011 | 87 cm: 10 lb 14 oz → **16 lb 0 oz** | Trophy top 143 cm: 48 lb 13 oz → **71 lb 9 oz** | 206 cm: 144 lb → **212 lb** |
| Quayling | minnow 0.01 → minnow 0.013 | 14 cm: 1 oz → **1 oz** | Trophy top 16 cm: 1 oz → **2 oz** | 16 cm: 1 oz → **2 oz** |

The Threadling Eel moved to the `swampeel` key at its old constant, so its weights are the same; 31 of the 53 species keep their `k`.
The Heavyweight was completed in play by a 24 lb 14 oz Trophy Weeping Carp (over 18 lb) during the captures.

**Corrections to this document's own figures.**

- §6.2's spot check "a 90 cm Gloam Eel is 3 lb 8 oz" reads **3 lb 9 oz** in the game (0.0022 · 90³ g = 1.6038 kg = 56.6 oz). The validator and
  the tests use 3 lb 9 oz.
- §6.2's table prints the model's weight at L50. A Fish's own figure is rounded to 10 g first (`fishWeight`, D5), so a fish of exactly
  L50 can read one ounce off the table: a 60 cm Mildew Angler reads 8 lb 1 oz, a 66 cm Pilgrim Salmon 6 lb 15 oz.

**Decisions the build took** (each can be overruled in one line):

| # | what | why |
|---|---|---|
| B1 | The hero's live figure is laid **over** its sizer, out of the flow (`position: absolute`), not beside it in one grid cell (§3.2) | the handwriting face has no tabular figures and its ¼ ½ ¾ are wide: measured in the browser, a passing "¼ oz" was 18 px wider than a final "3 oz" and "18 lb 10 oz" 6 px wider than "24 lb 14 oz". In a shared grid cell that moved the box; laid over the sizer nothing can move (the capture scenario asserts 0 px of change in the hero's box, the stamp and the list) |
| B2 | The hero's two parts are `<i>`, not `<span>` | `.gw-cc-stamp span` styles every span in the stamp row as a rubber stamp |
| B3 | `.gw-cc-v3 .gw-cc-stamp` wraps (`flex-wrap`, 8 px between the rows) | on a 390 px phone a Trophy's stamp, its seal and "24 lb 14 oz" are wider than the card: the figure takes the next line (§3.2 allowed it). A Keeper's "1 lb 8 oz" still sits beside its stamp |
| B4 | `recordLines`' sub-line says the gain **as the two figures read** ("New best: 23 lb 4 oz (was 15 lb 2 oz)" → "8 lb 2 oz past your old mark"). (After the review, §12 item 1: two figures that read the same are no best at all, so there is no fall-back) | `fmtWeight(Wnow − Wprev)` (§3.4) can be an ounce off the difference of the two printed figures |
| B5 | `ui-screens.js` still calls `fmtLength` once, on the Journal's kept v1 arm (flag off, a save that carries `pbLength`) | §7 item 8 asked for none, but the v1 arm must stay character for character; the test asserts the call sits only on a `// v1` line |
| B6 | `progression-af.approxText(D, sp, cm)` is kept and now returns the near weight | one helper for the summary's got-away lines; its test moved with it |
| B7 | A heavy bounty saved in kg is re-told in `progression-market`'s `decorate` (every read of the ledger), not only in the ledger row | the toasts ("Bounty honoured: …") read the same text |
| B8 | `CHALLENGES_V3` drops `params.kg` when a rewrite gives `params.lb` | the rewrite merges onto v1's params, which would have kept `kg: 8` beside `lb: 33` |
| B9 | `BALANCE_V3.records.elderLog` lists `weight` before `cm` (was `cm`, `kg`) | §4.3's rule, in the data that names the Elder Log's fields |
| B10 | `ui-v3.js` and `ui-af.js` import the pure helpers from `data.js` directly | they are flag-free functions; every other value still comes through the `D` each function is handed |
| B11 | `tools/sim/roster-v3.mjs --rows` prints weights in pounds, and DESIGN §25.7.6's table was re-told from it | the table is the player-facing size sheet; the sim's default output is unchanged |
| B12 | The captures use a new scenario, `tools/tests/pounds-shots.scenario.mjs` (1280×720 and 390×844), not `catch-shots` (§7.9) | `catch-shots` is stale since the show; the new one also checks the card in the DOM (the hero, the length line, no kg, the count never falling, nothing moving or overflowing) |

**Checked in the browser** (the risks of §10): the handwriting face draws its own ¼ ½ ¾ (measured against the fallback faces: different
advances), so the fractions need no body-font span (the unit letters do: §12 item 4); the docked desktop card and the 390 px phone card
hold "24 lb 14 oz" without overflow.

**Not done here:** `docs/loop/QUEUE.md` job 3 is left for the lead to mark at the merge. The loop's rules (§5) are written into
`docs/loop/SPEC.md`; there is no loop code yet to apply them to.

---

## 12. After the review (branch `gw-pounds`)

The review found no defect that had to block the merge, six things that should change and five that could. What was done with each,
so the document and the code agree. The sections above are already amended; this is the record.

| # | the finding | done |
|---|---|---|
| 1 | **A best that read the same figure twice.** A personal best was decided by length (to 0.1 cm) and shown in whole ounces, so a fish a hair longer read "New best: 5 oz (was 5 oz)", "¼ oz past your old mark" (about a third of small minnow bests) | **Fixed (D14).** The mark is kept by length and a best is **told** only when `weightOz` rises: `progression.measure` gates the `pb` record, `isRecord` (so the kicker, the "biggest yet!" note and the Wick's cheer) and the summary line on it; `recordLines` and the summary also drop a saved record whose two figures read the same. The gain is always the difference of the two printed figures. Tests: `ui-screens-v3` (the tie, one ounce up, the whole-pound band), `progression-v3` (the mark moves, nothing is told, then one ounce up is told against the moved mark), and the capture scenario lands two perch a tenth of a centimetre apart |
| 2 | **Targets in a third format.** "over 1½ lb", "over 9 lb": the card beside them read "1 lb 8 oz" | **Fixed (D10).** `weightTarget` keeps its round units and words the target with `fmtWeight`: "over 6 oz", "over 1 lb 8 oz", "over 9 lb 0 oz". The Heavyweight reads "over 18 lb 0 oz" and "over 33 lb 0 oz". No target carries a fraction glyph |
| 3 | **The play's estimate is still a class word**, where the ruling's list names it | **Kept, and put to the lead (D6).** A true weight during a play is `k·L³` and names the body, against the user's own rule that the fish on the line cannot be told (DESIGN §25.0.1 row 8, §25.6.10; the species-swap test). A species-blind figure was measured and is not usable, because a class is cut on the size score and not on weight: in the preview build's Mossmere (seven fish, phase 1) a Keeper runs `4 oz – 10 lb 3 oz`, a Prize `7 oz – 17 lb 5 oz` and a Trophy `11 oz – 34 lb 14 oz` (a typical Prize minnow is 9 oz and a typical Prize carp 12 lb 14 oz: ×24). With every lake's full roster a Prize's typical fish are ×12 apart in Sporewood, ×34 in Glasswater, ×114 in the Pallid Deep and ×610 in the Mossmere (its 8 cm Cupbearer beside its carp). A band that wide says nothing, and a single figure would be wrong by one or two orders of magnitude for some fish. The numeric estimate stays the got-away note's "near N lb", after the loss. **The lead's sign-off is asked for at the merge**; the line to write into QUEUE job 3 is: "the play's estimate stays a class word (a weight during a play would name the fish: the user's rule of row 8); the numeric estimate is the got-away note's 'near N lb'". `docs/loop/QUEUE.md` is not edited on this branch: the lead's checkout has rewritten the lines around job 3 since the base, so an edit here would conflict at the merge |
| 4 | **"lb" read "eb"** on every hero: the handwriting face draws a looped l | **Fixed.** `ui-v3.weightHtml` puts each unit in `<i class="gw-u">`, and `.gw-u` sets it in the body face (italic, a size down, close to its number). It is used wherever a weight is written in the hand: the hero and its count, the handwritten note, a full card's creel rows. The hero's `textContent` and `aria-label` are still the plain figure. The capture scenario checks each unit's face and size |
| 5 | **The loop's documents disagreed** (the SPEC: heaviest last, weights stored; the slice-1a PLAN: a length hero, rows by clams, lengths stored) | **Fixed in both.** One order: lightest first, heaviest last, by `weightOz`; ties by clams, then catch order; giants and legends last. One store: `lastTrip.lines` keep the **length** and the tally derives the weight (D5), so this spec's §5.1 and the loop SPEC §8.3 no longer store a weight. The PLAN is amended in place (its header's pounds paragraph; T43's allow-list, the tally, the card, `tallyLines`, the save example, §5.2) |
| 6 | **The sizer was called "the widest figure the count shows"**, but a final in ounces was passed by wider quarter figures (18 px past the box) | **Fixed.** The sizer now holds several figures laid one over another (`weightSizers`: the final, "(P − 1) lb 15 oz", and the quarters a final under a pound passes), so the box is as wide as the widest of them; the comment and CONTRACT say what remains (a figure with other digits can run a pixel or two past: the hand has no tabular figures). The capture scenario allows 4 px |
| 7 | **`weightOz` compared whole ounces where the card shows whole pounds** (from 100 lb), and `weightOz(Infinity)` was `Infinity` | **Fixed.** `weightOz` is now exactly the figure `fmtWeight` prints, in every band (quarters, whole ounces, whole pounds), 0 for no weight, and `fmtWeight` is built on it, so the two cannot drift. ui-v3's private copy is gone. The validator and `pounds.test` sweep 0.1 g to 500 kg for the identity |
| 8 | **An old saved bounty kept "at least" under words that say "over"** | **Fixed.** When its words are re-told it takes `targetOz = weightOz(b.kg)` and so the new check. What remains for its last day: the target was drawn under the old `k` |
| 9 | **Real fish names as body keys** (`trout`, `conger`) | **`conger` renamed `greateel`; `trout`, `gar` and `swampeel` kept.** The project's own list of real species' names (`roster-check.mjs` `REAL_NAMES`) holds "conger" and expressly allows family words such as trout, gar, eel and pike; `trout` and `gar` are also the roster's own body-plan names (`roster.json.newBodyPlans`), which the slice-1b converter writes into `size.k` by rule, and the game already ships a Vesper Gar and a Pilgrim Salmon. The validator and `pounds.test` now refuse a real species' name as a key (§6.4 rule 2) |
| 10 | **The Journal's range ran to the ceiling** ("10 oz – 17 lb 11 oz" for a perch) | **Fixed (D13).** The range runs to a top Trophy and the ceiling is told under it as hearsay: "10 oz – 5 lb 15 oz", "said to reach 17 lb 11 oz" (`data.weightSpan`, `TEXT_V3.saidToReach`). The size model itself is unchanged: an Elder perch of 85 cm is still in the game, where giants live |

**Still open, for the lead:** item 3's sign-off; the word "near" against the ruling's "about" (D7, one data string); the low-confidence
cousins of §6 (rays, jellies, the ghost fish, the swamp eel) and Old Portcullis at +28% until slice 1b gives it a catfish constant.
