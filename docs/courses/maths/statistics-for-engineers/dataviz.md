# Beads: how Statistics for engineers draws its data

The binding guide for the five lesson builders and reviewers (26 Oct, fifth version). Base "beads", grafts from "morph" and "recorder". Prototype `dataviz.proto.html`:
eleven steps through all five lessons, five self-tests passing at 340, 720 and 1040 px in both themes. At a glance: `dataviz.showcase.png`.

## The language
Every simulated reading is a bead that leaves a hopper, strikes its way down through the rule that made it and lands with a small bounce on a beam, so every statistic is
something the pile does: it balances on a fulcrum at the mean, its skyline relaxes into the bell, it tips and peels out in the order taken, and a unit drops off its shelf
when it fails. The numbers come out of the pile, and the pile out of a rule on screen.

## Marks (viewBox 0 0 340 300, one height for every view, so the page never jumps)
- **Bead** = one reading: `bd-bead` in `accent2`, surface ring and glint; a second string's `bd-bead two` in `accent`. With the peg field the scale is `SC` (±3.5 SD at the
  widest error); without it the pile is drawn closer, `ZC` (27 columns 12 wide), the beam's numbers gliding between the two on a spring. A step with the field and the
  spread slider sizes beads for the narrowest pile the slider allows (`B.fitPile(B.peak(…))`, r 4.32); every other step for its own batch (`B.tallest`, plus one where a
  reading drags): r 5.4 at 0.03 V. A batch too tall shrinks every bead; a K.check walks 200 batches at every setting: r never under 3.5.
- **Column** = one meter step (`B.scale`); a coarse meter's columns sit on the same voltage scale, `per` beads across, so readings stack into **bricks**. Readings that
  spread by a factor (insulation resistance) use `B.logScale` (20 columns a decade, each 12% more) or an even scale of 25 MΩ bins: there a column is a bin.
- **Peg field**: twelve rows of r 1.8 pegs one nudge apart (closer for a mean), 22 above the tallest stack. A bead's path is its own nudges added row by row (a mean takes
  the mean of its readings' paths; by factors, powers add); it strikes each row with a 2-unit jink and the peg it passes swells (`M.hits`, `B.pegHit`).
- **Rows**: stacks below y 70 (60 where no bell or field sits above), beam y 232 with the **fulcrum** at the mean, numbers 258, dimension row 274, title or key 295.
  **Ringed bead**: ring r + 2.6, two drag arrows. **Off the scale**, never clipped: on the end column with an arrow (`B.offMark`). **Limits** (lesson 3): a reading on a
  limit is in, so each limit line sits on the *outer* edge of its limit's column (`limX`): every bead past a line is counted out, and every one counted is past a line.
- **Offset step**: a window as wide as an example meter's accuracy behind the hopper; "result" (mean ± 2 SD ÷ √50) an ink bracket over the pile; "most beads" (± 2 SD) under
  the beam. **Two strings**: stacked strips on one time axis, each its own scale. **Lifetimes**: shelf, pile on a beam at y 176, years at 202, and under them the failure
  rate of the units still working (y 228-268, its own scale at the right, 0.1 and 0.3 a year); the clock's hand runs through both.

## Motion (the shared engine, `B.motion`: K.anim only; Infinity is the finished picture, which tests and reduced motion open on)
- **Pour**, the signature: the old pile sinks; a bead leaves every 0.045 s, the first three slowly, each its number dissolving into the bead. It strikes a peg on each row,
  falls (1600 units/s²), bounces 4.5 then 1.3 units over 0.24 s and splashes. 4.4 s. **Tap a bead**: its path draws.
- **Hop** (`M.arc`): a fresh batch or a choice re-sorts the same beads on arcs; labels fade while they fly. **Settle** (`M.settle`: slider, drag, a step's zoom): 0.45 s, 6%
  overshoot. Leaving mid-pour, `M.finish` lands all within 1.2 s. **Springs** (`M.spring`): the fulcrum (ω 5, ζ 0.42) lags the mean and the beam tilts 5°·tanh(offset ÷
  1.2 SD), rocking only when the fulcrum arrives; field, scale, labels, brackets, best-fit ends and pointer ride springs too.
- **Story** (`M.plan`, `M.arrive`): parts arrive 0.4-0.8 s apart by a timetable, squeezed so a step settles within 5 s. Bell: the amber curve traces the skyline (1 s),
  relaxes (0.8 s); each band blooms with its bracket and its beads ring from the middle as the tile counts to the rule's tick. Tolerance: limits grow, each bead past one
  shivers 0.4 s, turns `warn` and rings. Insulation resistance turned even: beads re-sort, the fulcrum slides in, the beam rocks to balance right of the median.
- **Tip and peel** (`M.tip`): pile and bell turn onto the right edge (0.8 s); beads peel off 0.025 s apart on a thread, the mean so far writing itself; a flat amber line at
  the mean then tilts into the best fit. **Fold** (1.6 s): the time axis becomes one string's scale, pairs merge. **Lifetimes**: the clock runs 2 s, each unit drops
  (`B.fall`) as it fails. **Leaving a step**, what the next hides fades in place over 0.35 s (`M.enter`, `M.fade`); a part with its own fade carries `data-own`.

## Interaction and sound
- One or two controls under the drawing, plus **Drop a fresh batch** (full width, seed + 1); a choice that re-sorts sits **above** it. Open on a setting the question is
  not about. **Drag the ringed bead** (`K.drag`, 44 px handle, its slider the keyboard's way). `.say` reads right at both ends of every slider, never a readout's number.
- Sound: a soft tick per bead as it leaves the hopper (its first peg), pitched by where its reading sits (`B.ticks`): one `K.sound.chord` with `stagger`, from the Fresh
  batch press only; the documented chord starts at the press, so ticks mark the release, not the landing. The silent first pour stands on its own.

## Colour (kit roles only, never `good`, never a colour named in words Dan reads; one amber line per view once still)
| Element | Role |
|---|---|
| beads, ring, drag arrows, pair links and harness, share-bar fill | `accent2` |
| beam, fulcrum, mean line (dashed 4 3), SD bracket, "mean", "result", the clock's hand, off-scale arrows | `ink` |
| ticks, numbers, titles, units, thread, the air, true value and MTBF (dashed 5 4), shelf, key words, a `quiet` curve | `muted`; pegs, outlines, edges `strong` |
| small labels, ruler, stems, brackets, a path, the mean so far, the failure rate; a second string's beads | `accent` |
| bands under the bell (±1, ±2, ±3 SD at 1, .6, .32), clipped under the curve, behind the beads | `fill1` |
| the one teaching line of a view (bell, best fit, what the rule expects; on the bathtub the failure rate itself, `bd-hz lead`, the pile's curve `quiet`) | `amber-line` |
| past the limits: limit lines, warning strips, "too low", "too high", beads out | `warn` |

## Numbers, labels and checks
- Drawing labels name things ("mean", "result"); every number a check could ask for is a `K.readout` tile, so quiz mode hides it; while beads land the tiles give what is
  drawn now. Units always through `unit` (small, muted) and `prefix` (±), never inside `fmt`; a count reads "34 of 50"; a hint gives the rule ("2 SD ÷ √50").
- **Every line has a name** (a label or a key entry). Newspaper setting (`B.words`): muted words, bold tabular numbers, 13 units at least. Late labels clear every bead
  (`B.clearY`, `B.free`, `K.labels`). A paint reads the settings K.update last took in (`cur()`), never ones an animation frame meets first.
- **Checks**: three to five a lesson, each small: an edge case (a reading on a limit), a shape fact (four averaged halve the SD), one answer from outside (e^−1 at the MTBF).
  Return `B.facts([[name, fact], …])` so a failure names what broke; a fact about a step change walks the real stepper with `M.dry = true` (the prototype's `dryVisit`).
  `render.mjs` shoots its end picture 2.5 s after the controls are set, so a longer story (the bathtub, 4.4 s) is still arriving there: judge the finish from the film.

## The generator, and "simulated"
- On screen: *reading = true value (+ offset) + drift × i / 10 + random error × (sum of twelve nudges, each −½ to +½)*, read to the meter's step; twelve nudges sum to SD 1,
  so the slider's error is the SD and the peg field is that sum. Insulation resistance: *200 MΩ × 10^(0.15 × nudges)*, read to 1 MΩ. A second string takes rows n..2n−1
  of `B.nudges(seed, 2n)`, never reading i's own. Lifetimes: *t = −ln(u) ÷ λ*; the bathtub is a sketch, said so, a lifetime `B.lifeFrom(H, u, 30)`.
- Code never sets Dan's controls: a step's own setting belongs to its rule (`spreadOf`: the offset step reads with 0.04 V), so the tolerance step after it still opens at
  his 0.03 V (a K.check). Seeded (`B.nudges`, `B.uni`), a fresh batch the next seed; pick opening batches with a script like `viz/synth/seeds.mjs` (prototype 544775: a
  clean bell, one honest reading out at +2.9 SD). **Simulated** in the lead, every axis title and the caption; examples named once as examples.

## Do and don't
- Keep the peg field the real generator, only where the rule is a sum of nudges; say "many small causes add up" of the simulation, never of a real meter. Pair the
  68/95/99.7 rule with the counted share; with limits at ±0.08 V and 0.03 V of error about one batch in five or six has an honest reading out.
- No second amber thing at rest, full-height band, dual value axis, label on a bead or crossing a moving one, number a readout shows, reading clipped at an end, line
  without a name, part that pops off, two sets of numbers at once, code that sets Dan's controls, hazard drawn as measured, real rate or boat's figure, `vh`, timers.

## The five lessons in this language
- **1. The middle and spread** (steps 1-3). Fifty repeat readings pour, the first as numbers. Halve the random error: the pile halves in width and nearly doubles in height.
  Drag the ringed bead, a slipped probe: the beam tips, the mean creeps a fiftieth of the slip, the median barely moves. Then insulation resistance pours by factors into
  a bell; turned to an even scale it leans into a long high tail and the beam balances at a mean above the median: why the average alone misleads.
- **2. How far to trust a reading** (steps 4-5). The hopper sits at the true value plus an offset inside the accuracy window; each bead can be the mean of 1, 2 or 4
  readings, the pegs closing in: repeats tighten the pile round where the meter centres, and the true value can fall outside the result. A coarse meter makes bricks.
- **3. The normal curve** (steps 6-7). Skyline, bell, bands, counting rings; example limits grow, the honest reading past one shivers to a warning; fresh batches are
  counted ("Batches with a reading out"), and the ringed bead dragged along the SD ruler: one far out is more likely a slip.
- **4. Trends over time** (steps 8-9). Tip and peel; Dan sets the drift. Under one SD over the run it hides in the noise and the best fit may miss it; up to 2.5 SD only the
  order taken shows it; beyond, the side pile widens too. **Same cause**: a pump bearing and a battery's float current, the air between; folded, r about 0.9 though
  neither drives the other; with the air steady, a round cloud. Periodic insulation resistance runs on `B.logScale`.
- **5. Reliability** (steps 10-11). Fifty units, λ an example; one by one, in series, in parallel. At the MTBF only about 37% still work; series pairs empty the shelf twice
  as fast. **The bathtub**: an early heap, a quiet floor and a wear-out hump, and the amber failure rate under them is the bathtub itself.

## Copy this code
Paste all three blocks unchanged: the look into `<style>`, the language and then the motion into `<script>`. Build as the prototype does: `B.layers`, every element made once;
`layout(p)` cached; `const M = B.motion({n, r, paint, leaving, unmanaged, capture, tick, busy, done})`, springs from `M.spring`; per step a `planFor` choosing a move
(`M.pour`, `M.arc`, `M.settle`, `M.finish`, `M.tip`, `M.untip`, or the lesson's own) and a timetable for `M.enter(M.plan(…))`; moves within a step through `M.move`; in
`paint()` each bead from `M.place(i, target, pile, geo)` and parts by `M.arrive(name)`, ending in `M.fade()`. Check with `tools/eval/render.mjs`, then film the drawing
alone with `--crop "svg.bd-scene" --every 350`, dark steps a few at a time, and a choice with `--eval` clicking it.

```css
  /* ==== Beads: the shared look (dataviz.md, "Copy this code"). Paste unchanged. ==== */
  [hidden] { display: none !important; } .bd-scene { display: block; width: 100%; max-width: 32rem; margin-inline: auto; touch-action: pan-y; font-variant-numeric: tabular-nums; -webkit-user-select: none; user-select: none; } .bd-scene text { font-family: var(--k-font); font-size: 13px; }
  /* A reading: a bead with a surface ring and a glint (a second string's: .two), its splash and counted ring; its outline in the side pile; the pegs it strikes. */
  .bd-scene .bd-bead { fill: var(--k-accent2); stroke: var(--k-bg); stroke-width: 1.2; } .bd-scene .bd-bead.two { fill: var(--k-accent); } .bd-scene .bd-splash { fill: none; stroke: var(--k-accent2); stroke-width: 1.2; pointer-events: none; } .bd-scene .bd-splash.two { stroke: var(--k-accent); }
  .bd-scene .bd-glint { fill: var(--k-bg); fill-opacity: .42; pointer-events: none; } :root[data-theme="dark"] .bd-scene .bd-glint { fill: var(--k-ink); fill-opacity: .5; } .bd-scene .bd-ghost { fill: none; stroke: var(--k-strong); stroke-width: 1.1; }
  .bd-scene .bd-peg { fill: var(--k-strong); } .bd-scene .bd-hopper { fill: none; stroke: var(--k-muted); stroke-width: 1.8; stroke-linecap: round; } .bd-scene .bd-trail { fill: none; stroke: var(--k-accent); stroke-width: 1.7; stroke-dasharray: 0.1 3.4; stroke-linecap: round; }
  .bd-scene .bd-win { fill: var(--k-accent); fill-opacity: .16; } .bd-scene .bd-edge { stroke: var(--k-strong); stroke-width: 1.1; stroke-dasharray: 2 3; } .bd-scene .bd-beam { stroke: var(--k-ink); stroke-width: 2.2; stroke-linecap: round; } .bd-scene .bd-fulcrum { fill: var(--k-ink); } .bd-scene .bd-grid { stroke: var(--k-line); stroke-width: 1; }
  .bd-scene .bd-tick { stroke: var(--k-strong); stroke-width: 1.2; fill: none; } .bd-scene .bd-tick.major, .bd-scene .bd-axis { stroke: var(--k-muted); } .bd-scene .bd-axis { stroke-width: 1.3; } .bd-scene .bd-off { fill: var(--k-ink); stroke: var(--k-bg); stroke-width: 1.6px; stroke-linejoin: round; paint-order: stroke; pointer-events: none; }
  /* Words: muted names and units, bold numbers, accent small labels, warnings; a halo for a label over a line. */ .bd-scene .bd-tn, .bd-scene .bd-title, .bd-scene .bd-w, .bd-scene .bd-u { fill: var(--k-muted); } .bd-scene .bd-lab, .bd-scene .bd-name { fill: var(--k-ink); } .bd-scene .bd-n, .bd-scene .bd-name { font-weight: 700; }
  .bd-scene .bd-small { font-weight: 600; fill: var(--k-accent); } .bd-scene .bd-wt { font-weight: 600; fill: var(--k-warn); } .bd-scene .bd-halo { paint-order: stroke; stroke: var(--k-bg); stroke-width: 4px; stroke-linejoin: round; }
  /* The ringed reading: its drag handle, ring and arrows; warnings and limits. */ .bd-scene .bd-handle { fill: var(--k-bg); fill-opacity: 0; cursor: grab; } .bd-scene.nodrag .k-drag-hit, .bd-scene.nodrag .bd-handle { pointer-events: none; } .bd-scene .bd-ring { fill: none; stroke: var(--k-accent2); stroke-width: 1.7; pointer-events: none; }
  .bd-scene .bd-chev { fill: var(--k-accent2); stroke: var(--k-bg); stroke-width: 1.8px; stroke-linejoin: round; paint-order: stroke; pointer-events: none; } .bd-scene .bd-ring.out { stroke: var(--k-warn); } .bd-scene .bd-chev.out { fill: var(--k-warn); }
  .bd-scene .bd-pulse { fill: none; stroke: var(--k-warn); stroke-width: 1.4; pointer-events: none; } .bd-scene .bd-zone { fill: var(--k-warn); fill-opacity: .55; } .bd-scene .bd-limit { stroke: var(--k-warn); stroke-width: 1.6; stroke-dasharray: 5 4; }
  /* The statistics: mean, dimension lines, small-label spans and their extension lines, ruler, stems and pointers, range jaws, median, bands, curves, thread, mean so far, true value. */ .bd-scene .bd-mean { stroke: var(--k-ink); stroke-width: 1.7; stroke-dasharray: 4 3; } .bd-scene .bd-dim { fill: none; stroke: var(--k-ink); stroke-width: 1.6; stroke-linecap: round; }
  .bd-scene .bd-span { fill: none; stroke: var(--k-accent); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; } .bd-scene .bd-ext { fill: none; stroke: var(--k-accent); stroke-width: 1; stroke-dasharray: 1.5 2.5; } .bd-scene .bd-ruler { fill: none; stroke: var(--k-accent); stroke-width: 1.3; }
  .bd-scene .bd-stem { fill: none; stroke: var(--k-accent); stroke-width: 1.3; stroke-linecap: round; } .bd-scene .bd-pointer, .bd-scene .bd-med { fill: var(--k-accent); } .bd-scene .bd-band { fill: var(--k-fill1); }
  .bd-scene .bd-jaw { fill: var(--k-bg); stroke: var(--k-accent); stroke-width: 1.4; stroke-linejoin: round; } .bd-scene .bd-bell { fill: none; stroke: var(--k-muted); stroke-width: 1.5; stroke-linejoin: round; }
  .bd-scene .bd-curve, .bd-scene .bd-trend { fill: none; stroke: var(--k-amber-line); stroke-width: 2.6; stroke-linejoin: round; stroke-linecap: round; } .bd-scene .bd-truth { stroke: var(--k-muted); stroke-width: 1.6; stroke-dasharray: 5 4; }
  .bd-scene .bd-thread { fill: none; stroke: var(--k-muted); stroke-width: 1.2; stroke-linejoin: round; } .bd-scene .bd-run { fill: none; stroke: var(--k-accent); stroke-width: 1.8; stroke-linejoin: round; }
  .bd-scene .bd-air { fill: none; stroke: var(--k-muted); stroke-width: 1.7; stroke-linejoin: round; } .bd-scene .bd-hz { fill: none; stroke: var(--k-accent); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  /* One amber line a view: .lead hands it to the failure rate (the bathtub), .quiet takes it off a curve. */ .bd-scene .bd-hz.lead { stroke: var(--k-amber-line); stroke-width: 2.6; } .bd-scene .bd-curve.quiet { stroke: var(--k-muted); stroke-width: 1.6; }
  /* Lifetimes: the shelf, a pair's link (series) or harness (parallel), the clock's hand; and a share bar inside a tile. */ .bd-scene .bd-shelf { stroke: var(--k-muted); stroke-width: 1.6; stroke-linecap: round; } .bd-scene .bd-link { fill: none; stroke: var(--k-accent2); stroke-width: 1.6; stroke-linecap: round; }
  .bd-scene .bd-harness { fill: none; stroke: var(--k-accent2); stroke-linecap: round; } .bd-scene .bd-harness.in { stroke: var(--k-bg); } .bd-scene .bd-now { stroke: var(--k-ink); stroke-width: 1.4; } .bd-scene .bd-nowhead { fill: var(--k-ink); }
  .bd-gauge { display: block; position: relative; height: 6px; margin-top: 8px; border-radius: 3px; background: var(--k-line); } .bd-gauge i { display: block; height: 6px; width: 0; border-radius: 3px; background: var(--k-accent2); } .bd-gauge b { position: absolute; top: -3px; width: 2px; height: 12px; margin-left: -1px; border-radius: 1px; background: var(--k-amber-line); }
  /* ==== end of the shared look ==== */
```

```js
  // ==== Beads: the shared language (dataviz.md, "Copy this code"). Paste unchanged. ====
  const B = (() => { const B = {}, lerp = (a, b, t) => a + (b - a) * t, c01 = (v) => Math.max(0, Math.min(1, v)); B.lerp = lerp; B.c01 = c01; B.r2 = (v) => Math.round(v * 100) / 100;
    // The rule. Seeded, so every picture and check is stable; a fresh batch is the next seed.
    B.rng = (seed) => { let a = (Math.imul(seed | 0, 7919) + 104729) >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
    // n readings × 12 nudges in −½..+½: twelve sum to SD exactly 1, so sd × B.sum(u) is an error of SD sd; B.sum(u, row) is a bead after `row` rows of pegs.
    // A second string of readings takes rows n..2n−1 of B.nudges(seed, 2n), never reading i's own: two strings share only what the rule gives them both.
    B.nudges = (seed, n) => { const r = B.rng(seed); return Array.from({ length: n }, () => Array.from({ length: 12 }, () => r() - 0.5)); }; B.sum = (u, upto) => { let s = 0; for (let j = 0; j < (upto == null ? u.length : upto); j++) s += u[j]; return s; };
    B.uni = (seed, n) => { const r = B.rng(seed); return Array.from({ length: n }, () => 1 - r()); };   // in (0, 1]: a lifetime is −ln(u) / rate
    B.round = (v, res) => +(Math.round(v / res) * res).toFixed(9); B.stats = (vs) => { const n = vs.length; if (!n) return null; let m = 0, q = 0; vs.forEach((v) => { m += v / n; }); vs.forEach((v) => { q += (v - m) * (v - m); });
      const s = vs.slice().sort((a, b) => a - b); return { n, m, sd: n > 1 ? Math.sqrt(q / (n - 1)) : 0, med: n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2, lo: s[0], hi: s[n - 1] }; }; B.within = (vs, m, sd, z) => vs.filter((v) => Math.abs(v - m) <= z * sd * (1 + 1e-9)).length;
    B.fit = (pts) => { const n = pts.length; if (n < 2) return null; let mx = 0, my = 0, sxx = 0, sxy = 0, rr = 0; pts.forEach((p) => { mx += p[0] / n; my += p[1] / n; }); pts.forEach((p) => { sxx += (p[0] - mx) * (p[0] - mx); sxy += (p[0] - mx) * (p[1] - my); }); const b = sxx ? sxy / sxx : 0;
      pts.forEach((p) => { rr += Math.pow(p[1] - my - b * (p[0] - mx), 2); }); return { b, mx, my, at: (x) => my + b * (x - mx), res: n > 2 ? Math.sqrt(rr / (n - 2)) : 0 }; };
    /* How closely two strings move together: +1 a rising line, −1 a falling one, 0 no line at all. */ B.corr = (xs, ys) => { const n = xs.length; let mx = 0, my = 0, sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { mx += x / n; my += ys[i] / n; });
      xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); syy += (ys[i] - my) * (ys[i] - my); }); return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0; };
    // A lifetime from a sketched hazard: the t at which the total hazard H(t) reaches −ln u, by halving; Infinity past tmax. A column's expected count from R.
    B.lifeFrom = (H, u, tmax) => { const goal = -Math.log(u); if (!(H(tmax) >= goal)) return Infinity; let a = 0, b = tmax; for (let k = 0; k < 44; k++) { const m = (a + b) / 2; if (H(m) < goal) a = m; else b = m; } return (a + b) / 2; };
    B.colExpect = (R, n, bin) => (t) => n * (R(Math.max(0, t - bin / 2)) - R(Math.max(0, t + bin / 2)));
    // Columns one bin wide: lo, hi the end columns' centres, drawn a0 → a1. col(v) clamps; a value on an edge goes up; off(v) is −1 or +1 past an end.
    B.scale = (lo, hi, bin, a0, a1) => { const n = Math.round((hi - lo) / bin) + 1, w = (a1 - a0) / n, col = (v) => Math.max(0, Math.min(n - 1, Math.round((v - lo) / bin + 1e-7)));
      return { lo, hi, bin, n, w, a0, a1, col, mid: (c) => a0 + (c + 0.5) * w, at: (v) => a0 + ((v - lo) / bin + 0.5) * w, val: (x) => lo + ((x - a0) / w - 0.5) * bin, off: (v) => (v < lo - bin / 2 ? -1 : v > hi + bin / 2 ? 1 : 0) }; };
    // Columns of equal ratio, `steps` to a decade, for readings that spread by a factor (insulation resistance). Takes and gives plain values.
    B.logScale = (lo, hi, steps, a0, a1) => { const L = Math.log10, s = B.scale(L(lo), L(hi), 1 / steps, a0, a1); return Object.assign({}, s, { lo, hi, log: true, col: (v) => s.col(L(v)), at: (v) => s.at(L(v)), val: (x) => Math.pow(10, s.val(x)), off: (v) => s.off(L(v)) }); };
    /* A scale with no columns, for a view that zooms or a strip of a time view: v0..v1 drawn a0 → a1; w is one bin's length on it. */ B.lin = (v0, v1, a0, a1, bin) => { const k = (a1 - a0) / (v1 - v0); return { lo: v0, hi: v1, bin, w: k * bin, a0, a1, at: (v) => a0 + (v - v0) * k, val: (x) => v0 + (x - a0) / k }; };
    // Bead size: B.peak, about the tallest stack of the narrowest pile a slider allows; B.tallest, a batch's own; B.fitPile, the bead for that height and column.
    B.peak = (n, bin, sd) => { const x = Math.min(2, bin / sd), t = Math.min(n, n * x * 0.3989 * (1 - x * x / 24)); return t + Math.sqrt(t); }; B.tallest = (vs, sc) => { const c = {}; let m = 1; vs.forEach((v) => { const k = sc.col(v); c[k] = (c[k] || 0) + 1; m = Math.max(m, c[k]); }); return m; };
    B.fitPile = (tall, room, colW, rmax) => { const r = Math.min(rmax, Math.abs(colW) / 2 - 0.6, (room / Math.max(1, tall) - 1) / 2); return { r, pitch: 2 * r + 1 }; };
    /* The pile on the beam at y base, earlier readings lower, `per` across a wide column; readings past an end on top; a batch too tall shrinks every bead. */ B.stack = (vs, sc, base, top, fit) => { const per = Math.max(1, Math.floor((Math.abs(sc.w) + 1) / fit.pitch)), cnt = {}, idx = [];
      vs.map((v, i) => i).sort((a, b) => (sc.off(vs[a]) ? 1 : 0) - (sc.off(vs[b]) ? 1 : 0) || a - b).forEach((i) => { const c = sc.col(vs[i]); cnt[c] = (cnt[c] || 0) + 1; idx[i] = cnt[c] - 1; });
      const tall = Math.max(1, ...Object.values(cnt).map((k) => Math.ceil(k / per))), pitch = Math.min(fit.pitch, (base - 1.5 - top) / tall), r = Math.min(fit.r, (pitch - 1) / 2);
      return { r, tall, pitch, per, base, cnt, pos: vs.map((v, i) => { const c = sc.col(v), lay = Math.floor(idx[i] / per), row = Math.min(per, cnt[c] - lay * per); return { x: sc.mid(c) + (idx[i] % per - (row - 1) / 2) * pitch, y: base - 1.5 - r - lay * pitch, r }; }) }; };
    /* In the order taken: reading i across from x0 to x1, its value up the page on scale sv. */ B.run = (vs, sv, x0, x1, r) => vs.map((v, i) => ({ x: lerp(x0, x1, vs.length > 1 ? i / (vs.length - 1) : 0.5), y: sv.at(v), r }));
    // A pile place turned u of the way onto its side about (x0, y0) sliding to (x1, y1): value up the page (k), stacks leftwards (kh); at u = 1, level with B.run.
    B.tip = (p, u, A) => { const th = u * Math.PI / 2, c = Math.cos(th), s = Math.sin(th), k = lerp(1, A.k, u), kh = lerp(1, A.kh, u), dx = p.x - A.x0, dh = A.y0 - p.y;
      return { x: lerp(A.x0, A.x1, u) + k * dx * c - kh * dh * s, y: lerp(A.y0, A.y1, u) - k * dx * s - kh * dh * c, r: p.r * lerp(1, Math.min(A.k, A.kh), u) }; }; B.anchor = (st, sc, sv, ref, spine, room) => { let h = 1; st.pos.forEach((p) => { h = Math.max(h, st.base - p.y + p.r); }); const k = Math.abs(sv.w / sc.w);
      return { x0: sc.at(ref), y0: st.base, x1: spine, y1: sv.at(ref), k, kh: Math.min(k, room / h) }; };
    // Two strings over time folded into one against the other, u 0..1: a and b are reading i's places in their strips, f the pair's place once folded.
    B.fold = (a, b, f, u) => { const ux = K.ease(c01(2 * u)), uy = K.ease(c01(2 * u - 1)), x = lerp(a.x, f.x, ux), q = { x: lerp(b.x, f.x, ux), y: lerp(b.y, f.y, uy), r: lerp(b.r, f.r, uy) }; return [uy > 0 ? B.hop({ x, y: a.y, r: a.r }, q, uy, 12, (v) => v) : { x, y: a.y, r: a.r }, q]; };
    /* Timings (s) every lesson shares: a pour releases a bead every dt, each jinks `jink` high off every peg; a fresh batch re-sorts one every hop. */ B.T = { dt: 0.045, hop: 0.028, field: 0.5, fly: 0.5, settle: 0.45, bounce: 0.24, peel: 0.025, tip: 0.8, fold: 1.6, g: 1600, jink: 2 };
    B.releases = (n, t0, slow) => { const out = []; let t = t0; for (let i = 0; i < n; i++) { out.push(t); t += slow ? Math.max(B.T.dt, 0.32 * Math.pow(0.68, i)) : B.T.dt; } return out; };
    B.bounce = (tc) => (tc < 0 ? 0 : tc < 0.15 ? 4.5 * Math.sin(Math.PI * tc / 0.15) : tc < B.T.bounce ? 1.3 * Math.sin(Math.PI * (tc - 0.15) / (B.T.bounce - 0.15)) : 0); const fallT = (d, v0) => (-v0 + Math.sqrt(v0 * v0 + 2 * B.T.g * Math.max(2, d))) / B.T.g;
    /* A bead released at rel strikes a peg on each of the twelve rows (y0..y1), xAt(row) its nudges so far, then falls onto p and bounces twice; tc = s since landing. */ B.pour = (T, rel, xAt, p, y0, y1) => { const tau = T - rel, F = B.T.field, v0 = (y1 - y0) / F; if (tau < 0) return null;
      if (tau < F) { const f = 12 * tau / F, row = Math.min(11, Math.floor(f)), u = f - row; return { x: lerp(xAt(row), xAt(row + 1), K.ease(u)), y: lerp(y0, y1, tau / F) - (row ? B.T.jink * Math.sin(Math.PI * u) : 0), r: p.r, a: c01(tau / 0.08) }; }
      const tf = tau - F, tb = fallT(p.y - y1, v0); if (tf < tb) return { x: lerp(xAt(12), p.x, K.ease(tf / tb)), y: Math.min(p.y, y1 + v0 * tf + B.T.g * tf * tf / 2), r: p.r, a: 1 };
      return { x: p.x, y: p.y - B.bounce(tf - tb), r: p.r, a: 1, tc: tf - tb }; }; B.landed = (rel, p, y0, y1) => rel + B.T.field + fallT(p.y - y1, (y1 - y0) / B.T.field);
    // Dropped from rest at a onto b (a unit leaving a shelf), tau s after the drop: falls, lands, bounces.
    B.fall = (a, b, tau) => { const tb = fallT(b.y - a.y, 0); if (tau < tb) return { x: lerp(a.x, b.x, K.ease(tau / tb)), y: Math.min(b.y, a.y + B.T.g * tau * tau / 2), r: lerp(a.r, b.r, tau / tb), a: 1 }; return { x: b.x, y: b.y - B.bounce(tau - tb), r: b.r, a: 1, tc: tau - tb }; };
    // From a to b, q of the way, on an arc `lift` high (landing with the bounce); ease K.ease to travel, B.backOut to settle with a 6% overshoot.
    B.backOut = (q) => 1 + 2.25 * Math.pow(q - 1, 3) + 1.25 * Math.pow(q - 1, 2); B.still = (list) => list.every((s) => Math.abs(s.v - s.to) < 0.05 && Math.abs(s.vel) < 0.5); B.hop = (a, b, q, lift, ease, tc) => { const u = c01(q), e = (ease || K.ease)(u), land = lift && q >= 1;
      return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - (lift || 0) * Math.sin(Math.PI * u) - (land ? B.bounce(tc) : 0), r: lerp(a.r, b.r, c01(e)), a: lerp(a.a == null ? 1 : a.a, 1, c01(u * 3)), tc: land ? tc : undefined }; };
    // Springs give the balance point, the spread and the lines their weight: they lag, overshoot a touch and settle. B.toward eases a fade at up / down s.
    B.spring = (w, z) => ({ v: 0, vel: 0, to: 0, w, z, init: false }); B.aim = (s, to, snap) => { s.to = to; if (!s.init || snap) { s.v = to; s.vel = 0; s.init = true; } };
    B.springs = (list, dt) => { const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n; list.forEach((s) => { for (let j = 0; j < n; j++) { s.vel += (-s.w * s.w * (s.v - s.to) - 2 * s.z * s.w * s.vel) * h; s.v += s.vel * h; } }); };
    B.toward = (a, to, dt, up, down) => (to > a ? Math.min(to, a + dt / up) : Math.max(to, a - dt / (down || up)));
    // Drawing: every element is made once and moved. B.vis fades el to a (K.fade) and takes it out of the page at 0.
    B.add = (g, tag, attrs, text) => g.appendChild(K.svg(tag, attrs || {}, text == null ? undefined : String(text))); B.set = (el, attrs) => { for (const k in attrs) el.setAttribute(k, typeof attrs[k] === 'number' ? B.r2(attrs[k]) : attrs[k]); return el; };
    B.vis = (el, a, rise) => { if (!(a > 0.002)) { el.setAttribute('display', 'none'); return false; } el.removeAttribute('display'); K.fade(el, a, rise || 0); return true; };
    // The scene's layers, bottom to top; the beam and the beads sit in `tilt`, which rocks about the fulcrum.
    B.layers = (svg) => { const L = {}; ['field', 'under', 'ghosts', 'tilt', 'over', 'axes', 'tags'].forEach((k) => { L[k] = B.add(svg, 'g'); }); ['scale', 'beads', 'marks'].forEach((k) => { L[k] = B.add(L.tilt, 'g'); }); return L; };
    // n beads (splash, bead, glint); cls 'two' for a second string. B.draw puts one at d = {x, y, r, a, tc, ring, hollow}: ring 0..1 sends a counted ring out; hollow a failed unit held; warn 0..1.
    B.beads = (g, n, cls) => { const k = cls ? ' ' + cls : '', sp = [], bd = []; for (let i = 0; i < n; i++) sp.push(B.add(g, 'ellipse', { class: 'bd-splash' + k }));
      for (let i = 0; i < n; i++) bd.push([B.add(g, 'circle', { class: 'bd-bead' + k }), B.add(g, 'circle', { class: 'bd-glint' })]); return bd.map((b, i) => ({ c: b[0], g: b[1], s: sp[i] })); };
    B.draw = (b, d, warn, floor) => { if (!d || !(d.a > 0.002)) { [b.c, b.g, b.s].forEach((e) => e.setAttribute('display', 'none')); return; }
      b.c.removeAttribute('display'); B.set(b.c, { cx: d.x, cy: d.y, r: d.r }); if (B.vis(b.g, d.hollow ? 0 : 1)) B.set(b.g, { cx: d.x - 0.34 * d.r, cy: d.y - 0.36 * d.r, r: 0.3 * d.r }); b.c.style.opacity = b.g.style.opacity = d.a >= 1 ? '' : d.a.toFixed(3); b.c.style.stroke = d.hollow ? 'var(--k-accent2)' : '';
      b.c.style.fill = d.hollow ? 'var(--k-bg)' : warn > 0 ? (warn >= 1 ? 'var(--k-warn)' : 'color-mix(in srgb, var(--k-warn) ' + Math.round(warn * 100) + '%, var(--k-accent2))') : '';
      if (d.ring != null) { const R = d.r + 1.6 + 4.5 * d.ring; if (B.vis(b.s, 0.9 * (1 - d.ring))) B.set(b.s, { cx: d.x, cy: d.y, rx: R, ry: R }); return; }
      const u = d.tc == null ? 1 : d.tc / 0.3; if (B.vis(b.s, u < 1 ? 0.45 * (1 - u) * (1 - u) : 0)) B.set(b.s, { cx: d.x, cy: (floor == null ? d.y : floor) + d.r * 0.9, rx: d.r * (1 + 1.6 * K.ease(u)), ry: d.r * (0.27 + 0.45 * K.ease(u)) }); };
    // The peg field: twelve rows one nudge apart, odd rows offset by half, each peg made once. B.pegsAt sets them about the hopper at hx, sp apart, over
    // rows y0..y0 + h; B.pegHit swells the peg beside each bead that has just struck its row ([{x, row, since}], from M.hits).
    B.pegs = (g) => { const P = { list: [], at: {}, hot: [], hx: 0, sp: 1 }; for (let row = 1; row <= 12; row++) { const lim = 7.2 * Math.sqrt(row / 12) + 0.6, off = row % 2 ? 0.5 : 0;
      for (let j = -9; j <= 9; j++) if (Math.abs(j + off) <= lim) { const el = B.add(g, 'circle', { class: 'bd-peg', r: 1.8 }); P.list.push({ el, k: j + off, row }); P.at[row + ':' + (j + off)] = el; } } return P; };
    B.pegsAt = (P, hx, sp, y0, h) => { P.hx = hx; P.sp = sp; P.list.forEach((q) => B.set(q.el, { cx: hx + q.k * sp, cy: y0 + q.row * h / 12 })); }; B.pegHit = (P, hits) => { P.hot.forEach((el) => el.setAttribute('r', 1.8)); P.hot = [];
      hits.forEach((q) => { const off = q.row % 2 ? 0.5 : 0, el = P.at[q.row + ':' + (Math.round((q.x - P.hx) / P.sp - off) + off)]; if (el) { el.setAttribute('r', B.r2(1.8 + 1.4 * (1 - q.since / 0.07))); P.hot.push(el); } }); };
    /* A label set like a newspaper's: [['mean ', 'w'], ['27.01', 'n'], [' V', 'u']] gives muted words and units, a bold number. */ B.words = (t, parts) => { t.textContent = ''; parts.forEach((p) => t.appendChild(K.svg('tspan', { class: p[1] ? 'bd-' + p[1] : null }, p[0]))); return t; };
    const tws = {}; B.tw = (t) => { const k = t.getAttribute('class') + '|' + t.textContent; if (!tws[k]) { let w = 0; try { w = t.getComputedTextLength(); } catch (e) { w = 0; } if (w > 0) tws[k] = w; } return tws[k] || t.textContent.length * 7.4; };
    // Is the box clear of every bead {x, y, r} by pad? B.clearY: the lowest baseline at or above y whose letters (10 up, 3 down) clear them. Late labels use these.
    B.free = (x0, x1, y0, y1, marks, pad) => marks.every((q) => q.x + q.r + pad <= x0 || q.x - q.r - pad >= x1 || q.y + q.r + pad <= y0 || q.y - q.r - pad >= y1);
    B.clearY = (x0, x1, y, marks, pad) => { let hit = true; for (let k = 0; hit && k <= marks.length; k++) { hit = false; marks.forEach((q) => { if (!B.free(x0, x1, y - 10, y + 3, [q], pad)) { y = q.y - q.r - pad - 3.01; hit = true; } }); } return y; };
    /* A dimension line x0 to x1 at y, ends ticked `tick`, its words in a gap when they fit, else centred above (`above`, stacked brackets) or beside it. */ B.bracket = (path, text, x0, x1, y, tick, above) => { const w = B.tw(text), m = (x0 + x1) / 2, gap = x1 - x0 >= w + 16, right = x1 + 6 + w < 336, f = B.r2;
      path.setAttribute('d', 'M' + f(x0) + ' ' + f(y + tick) + 'V' + f(y) + (gap ? 'H' + f(m - w / 2 - 5) + 'M' + f(m + w / 2 + 5) + ' ' + f(y) : '') + 'H' + f(x1) + 'V' + f(y + tick));
      B.set(text, gap ? { x: m, y: y + 4.5, 'text-anchor': 'middle' } : above ? { x: Math.max(4 + w / 2, Math.min(336 - w / 2, m)), y: y - 5, 'text-anchor': 'middle' } : { x: right ? x1 + 6 : x0 - 6, y: y + 4.5, 'text-anchor': right ? 'start' : 'end' }); };
    // Over pile st from v0 to v1: the skyline (count(c) in column c) relaxing 0..1 into expect(v), beads expected per column. Works on a log scale too.
    B.relax = (sc, st, count, expect, v0, v1, relax) => { const a = sc.at(v0), b = sc.at(v1), q = sc.w / 4, n = Math.max(1, Math.ceil(Math.abs(b - a) / Math.abs(q))), pts = [], per = st.per || 1;
      for (let k = 0; k <= n; k++) { const x = lerp(a, b, k / n), sky = Math.ceil(Math.max(count(sc.col(sc.val(x - q * 0.99))), count(sc.col(sc.val(x + q * 0.99)))) / per);
        pts.push(B.r2(x) + ' ' + B.r2(st.base - 1.5 - lerp(sky, expect(sc.val(x)) / per, relax) * st.pitch - (1 - relax) * (2 * st.r - st.pitch))); } return 'M' + pts.join('L'); };
    /* A rule's curve f(t), t from a to b in n pieces, drawn by X and Y; it stops where it leaves the top (y < top) and gives that point as `exit`, for an arrow. */ B.trace = (f, a, b, X, Y, n, top) => { let d = '', exit = null; for (let k = 0; k <= n; k++) { const t = lerp(a, b, k / n), y = Y(f(t));
      if (y < top) { if (k) { const t0 = lerp(a, b, (k - 1) / n), y0 = Y(f(t0)), q = (y0 - top) / (y0 - y); exit = { x: lerp(X(t0), X(t), q), y: top }; d += 'L' + B.r2(exit.x) + ' ' + B.r2(top); } break; } d += (k ? 'L' : 'M') + B.r2(X(t)) + ' ' + B.r2(y); } return { d: d || 'M0 0', exit }; };
    // A share bar inside a readout tile (hidden with it during a check): filled to the counted share, a tick at what the rule expects.
    B.gauge = (ro, rule) => { const f = K.el('i'), t = K.el('b'); t.style.left = (100 * rule).toFixed(1) + '%'; ro.el.appendChild(K.el('span', { class: 'bd-gauge', 'aria-hidden': 'true' }, f, t)); return (share) => { f.style.width = (100 * c01(share)).toFixed(1) + '%'; }; };
    // One soft tick per bead as it leaves the hopper (its first peg), pitched to where its reading sits on the scale, `gap` s apart. Only from a Fresh batch press.
    const PENTA = [330, 392, 440, 523, 587, 659, 784, 880, 1047, 1175, 1319]; B.ticks = (vs, sc, gap) => { const a = sc.at(sc.lo), w = sc.at(sc.hi) - a || 1; return K.sound.chord(vs.map((v) => PENTA[Math.round(c01((sc.at(v) - a) / w) * 10)]), { dur: 0.07, type: 'triangle', gain: 1, stagger: gap }); };
    /* The bead nearest a tap (pointer to drawing units), or −1 when none is within reach. */ B.pick = (svg, ev, pos, reach) => { const m = svg.getScreenCTM(); if (!m) return -1; const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse()); let best = -1, bd = (reach || 14) * (reach || 14);
      pos.forEach((p, i) => { const d = (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y); if (d < bd) { bd = d; best = i; } }); return best; };
    // A reading past its scale's end: an arrow the way it went, beside the bead, or `lift` above it over a ring. Never clip a reading silently.
    B.offMark = (d, dir, lift) => { const x = lift == null ? d.x + dir * (d.r + 6.5) : d.x, y = lift == null ? d.y : d.y - d.r - lift - 4.5, f = B.r2; return 'M' + f(x - 4.5 * dir) + ' ' + f(y - 1.4) + 'h' + f(4 * dir) + 'v-2.8l' + f(5 * dir) + ' 4.2l' + f(-5 * dir) + ' 4.2v-2.8h' + f(-4 * dir) + 'z'; };
    /* A check of several named facts: true, or the name of the first that broke (the self-test report shows it). */ B.facts = (list) => { for (const f of list) if (f[1] !== true) return 'broke: ' + f[0]; return true; }; return B; })();
  // ==== end of the shared language ====

  // ==== Beads: the shared motion (dataviz.md, "Copy this code"). Paste unchanged, after the shared language. ====
  // One engine moves every lesson's beads. Clocks: Tb the beads' move, Ts the step's story, Tl always running; Infinity is the finished picture.
  // o: {n, r, paint(), leaving() the elements a step change may fade, unmanaged (a group paint never hides), capture() more to snapshot with
  // each move, tick(dt) before each paint, busy(dt) after it (true while the lesson's own parts move), done() once still (true to go on)}.
  B.motion = (o) => { const STILL = { kind: 'still', end: 0 }, M = { Tb: Infinity, Ts: Infinity, Tl: 0, sc: STILL, s0: 0, sk: 1, len: 0, times: {}, leave: null, springs: [], dry: false }; M.reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    M.instant = () => M.dry || M.reduce || document.documentElement.classList.contains('k-testing');   // tests and reduced motion open every step finished
    M.drawn = Array.from({ length: o.n }, () => ({ x: 170, y: 224, r: o.r, a: 1 })); M.snap = () => M.drawn.map((d) => ({ x: d.x, y: d.y, r: d.r, a: d.a })); M.live = (kind) => M.Tb !== Infinity && (!kind || M.sc.kind === kind); M.moving = (kind) => M.live(kind) && M.Tb < M.sc.end;
    M.spring = (w, z) => { const s = B.spring(w, z); M.springs.push(s); return s; }; M.rest = () => M.springs.forEach((s) => { s.v = s.to; s.vel = 0; }); const grab = (s) => Object.assign(s, o.capture ? o.capture() : {});
    /* Where the beads are now, as the start of a move; leaving a pour early, a bead not yet released starts from its place before the pour. */ M.fromNow = () => { const f = M.snap(); if (M.live('pour')) f.forEach((d, i) => { if (M.Tb < M.sc.rel[i]) Object.assign(d, M.sc.from[i], { a: d.a }); }); return f; };
    // pour: the old pile sinks while bead i leaves the hopper at rel[i], strikes its way down the field (y0..y1) and lands on pile[i].
    M.pour = (pile, y0, y1, t0, slow) => { const rel = B.releases(o.n, t0, slow), land = rel.map((r, i) => B.landed(r, pile[i], y0, y1)); return grab({ kind: 'pour', from: M.snap(), rel, land, slow, hold: slow ? 0.2 : 0, end: Math.max(...land) + B.T.bounce }); };
    // hop: bead i leaves where it is at t[i] for its place, dur s, on an arc `lift` high (landing with a bounce) or eased (B.backOut overshoots 6%).
    M.hop = (t, dur, lift, ease) => grab({ kind: 'hop', from: M.fromNow(), t, dur, lift, ease: ease || K.ease, end: Math.max(...t) + dur + (lift ? B.T.bounce : 0) }); M.settle = (gap) => M.hop(M.drawn.map((d, i) => (gap || 0) * i), B.T.settle, 0, B.backOut);   // a slider or a drag
    M.arc = (gap, lift) => M.hop(M.drawn.map((d, i) => 0.03 + gap * i), B.T.fly, lift, K.ease);    // a fresh batch or a choice re-sorts
    M.finish = () => M.hop(M.drawn.map((d, i) => 0.012 * i), 0.55, 0, K.ease);                    // left mid-pour: every bead home within 1.2 s
    // tip: from t0 the pile turns onto its side, then the beads peel into the time view one every B.T.peel; untip: back, last first, then it stands.
    M.tip = (t0) => { const p0 = t0 + B.T.tip + 0.1; return grab({ kind: 'tip', from: M.fromNow(), t0, peel: M.drawn.map((d, i) => p0 + B.T.peel * i), end: p0 + B.T.peel * (o.n - 1) + B.T.fly + B.T.bounce }); };
    M.untip = () => { const t = M.drawn.map((d, i) => 0.05 + 0.018 * (o.n - 1 - i)), ua = 0.05 + 0.018 * (o.n - 1) + 0.45; return grab({ kind: 'untip', from: M.snap(), t, dur: 0.45, ua, end: ua + B.T.tip }); };
    // Bead i now, bound for tgt[i]; pile[i] its place in the pile; g.field() the field now {y0, y1, x(i, row)}; g.A, g.rug, g.run the tip's hinge, side pile, time view.
    M.place = (i, tgt, pile, g) => { const T = M.Tb, s = M.sc; if (T === Infinity || s.kind === 'still') return { x: tgt[i].x, y: tgt[i].y, r: tgt[i].r, a: 1 };
      if (s.kind === 'pour') { const f = g.field(), q = B.pour(T, s.rel[i], (row) => f.x(i, row), pile[i], f.y0, f.y1); if (q) return q; const h = s.from[i], e = K.ease(B.c01((T - s.hold) / 0.3)); return { x: h.x, y: h.y + 10 * e, r: h.r, a: h.a * (1 - e) }; }
      if (s.kind === 'hop') { const h = B.hop(s.from[i], tgt[i], (T - s.t[i]) / s.dur, s.lift, s.ease, T - s.t[i] - s.dur); h.a = B.lerp(s.from[i].a == null ? 1 : s.from[i].a, 1, B.c01(T / 0.2)); return h; }
      if (s.kind === 'tip') { const q = (T - s.peel[i]) / B.T.fly; if (q >= 0) return B.hop(g.rug[i], g.run[i], q, 7, K.ease, T - s.peel[i] - B.T.fly);
        const side = B.tip(pile[i], K.arrive(T, s.t0, B.T.tip), g.A), w = K.arrive(T, 0, 0.3), f = s.from[i]; return { x: B.lerp(f.x, side.x, w), y: B.lerp(f.y, side.y, w), r: B.lerp(f.r, side.r, w), a: B.lerp(f.a, 1, B.c01(T / 0.2)) }; }
      if (s.kind === 'untip') { const q = (T - s.t[i]) / s.dur; if (q < 1) return B.hop(s.from[i], g.rug[i], q, 7, K.ease); const b = B.tip(pile[i], 1 - K.arrive(T, s.ua, B.T.tip), g.A); return { x: b.x, y: b.y, r: b.r, a: 1 }; } return null; };   // a lesson's own move (kind 'own', say) places its beads itself
    // The running statistics count only the beads that have landed. M.hits: the pegs a pouring bead has just struck, for B.pegHit.
    M.landedAt = (i) => { const s = M.sc; return s.kind === 'pour' ? s.land[i] : s.kind === 'tip' ? s.peel[i] + B.T.fly : s.kind === 'hop' && s.lift ? s.t[i] + s.dur : -Infinity; }; M.counted = (i) => M.Tb === Infinity || M.Tb >= M.landedAt(i);
    M.hits = (xAt) => { const out = []; if (M.live('pour')) M.sc.rel.forEach((r, i) => { const tau = M.Tb - r, f = 12 * tau / B.T.field, row = Math.floor(f), since = (f - row) * B.T.field / 12; if (tau > 0 && tau < B.T.field && row >= 1 && since < 0.07) out.push({ x: xAt(i, row), row, since }); }); return out; };
    /* The story: parts arrive by a timetable {name: [start, dur]} after s0, squeezed by sk so a step settles within 5 s. */ M.arrive = (name, extra) => { const t = M.times[name]; return t ? K.arrive(M.Ts, M.s0 + t[0] * M.sk + (extra || 0), t[1] * M.sk) : 1; };
    M.plan = (scene, start, len, times, squeeze) => { const k = squeeze ? Math.max(0.35, Math.min(1, (4.8 - start) / Math.max(0.01, len))) : 1; return { scene, start, len, times: times || {}, k, end: Math.max(scene.end, start + len * k) }; };
    /* A new step, or a choice that changes the story: what showed and now hides fades where it stands (0.35 s) while the plan runs. mode 'first' | 'replay'. */ M.enter = (plan, mode) => { M.times = plan.times; M.leave = null; if (mode === 'first' || M.instant()) { M.Tb = M.Ts = Infinity; M.sc = STILL; return false; }
      if (mode !== 'replay') M.leave = o.leaving().filter((el) => el.getAttribute('display') !== 'none').map((el) => [el, el.style.opacity === '' ? 1 : +el.style.opacity]); Object.assign(M, { sc: plan.scene, Tb: 0, Ts: 0, s0: plan.start, sk: plan.k, len: plan.len }); M.anim.play(); return true; };
    M.move = (scene) => { if (M.instant()) { M.Tb = Infinity; M.sc = STILL; return false; } M.sc = scene; M.Tb = 0; M.anim.play(); return true; }; M.fade = () => { if (!M.leave) return; const f = M.Ts === Infinity ? 0 : 1 - K.arrive(M.Ts, 0, 0.35);   // the last thing paint() does
      if (f > 0) M.leave.forEach(([el, a]) => { if (el.getAttribute('display') === 'none') B.vis(el, a * f); }); else { M.leave.forEach(([el]) => { if (el.parentNode === o.unmanaged) el.setAttribute('display', 'none'); }); M.leave = null; } }; M.anim = K.anim({ button: false, label: 'Beads', step: (dt) => {
      M.Tl += dt; if (M.Tb !== Infinity) M.Tb += dt; if (M.Ts !== Infinity) M.Ts += dt; B.springs(M.springs, dt); if (o.tick) o.tick(dt); o.paint(); const more = o.busy ? o.busy(dt) : false;
      if ((M.Tb !== Infinity && M.Tb < M.sc.end + 0.2) || (M.Ts !== Infinity && M.Ts < M.s0 + M.len * M.sk + 0.1) || !B.still(M.springs) || more) return true; if (M.Tb !== Infinity || M.Ts !== Infinity) { M.Tb = M.Ts = Infinity; o.paint(); } return o.done ? !!o.done() : false; } });
    M.idle = () => M.Tb === Infinity && M.Ts === Infinity && !M.anim.playing(); document.addEventListener('visibilitychange', () => { if (!document.hidden && !M.anim.playing() && (M.Tb !== Infinity || M.Ts !== Infinity)) { M.Tb = M.Ts = Infinity; o.paint(); if (o.done) o.done(); } }); return M; };
  // ==== end of the shared motion ====
```
