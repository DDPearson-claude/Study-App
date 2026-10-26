# Statistics for engineers: the chart recorder language

Working prototype: `proto.html` (this folder). It passes the kit self-test at 340, 720 and 1040 px with
five checks. Contact sheets: `film-crop-s0..s5.png` (light), `film-dark-crop-s0/2/4.png`, and the
Fresh batch glide in `film-batch-s3.png`.

## The idea
Every reading arrives the way it does on kit Dan already trusts: a pen on a strip of chart paper
writes it in time order, and the same reading drops off the pen's needle into a stack beside the
paper, at the same height. The time view and the spread view share one vertical scale, so every
statistic is drawn once and crosses both views: the mean line, the SD band, the normal curve, a limit.

## The marks (viewBox 340 wide, 340 tall)
| Part | Where | Look |
|---|---|---|
| Instrument windows | 3 across the top: x = 0, 116, 232; 108 x 52, rx 8 | `sunk` fill; label 12 px bold caps, `accent`, letter-spacing .05em, at y 18; value 17 px bold `--k-mono`, `ink`, at y 38; "– – –" in `muted` until there is a value |
| Bar graph (optional) | inside a window, 90 x 4 at y 43 | `line` track, `accent2` fill to the share, a 2.4 `amber-line` tick at the rule's share (like a meter's analogue bar graph) |
| Annotation row | baseline y 65 | 12 px teal caps: "SIMULATED VOLTS · BATCH 1" over the paper, "BY VALUE" over the tray. The word SIMULATED stays on the chart. |
| Chart paper | x 34 to 228, y 72 to 294 | `panel` fill; a 1 px `line` rule every unit, a `strong` rule (opacity .55) every 5; a `line` rule every 5 readings; sprocket holes r 1.7 every 2 readings, 4.5 in from the top and bottom edges. The vertical rules and holes scroll with the paper. |
| Plot area | y 83 (top of scale) to 283 | 432 to 448 V here: 12.5 units a volt. Pick a range of about the true value ± 3.2 x the largest spread the slider allows. |
| Scale numbers | right-aligned at x 29 | every 5 units, 12.5 px `muted`. Reading numbers 1, 10, 20, 30, 40 under the paper at y 311, with a 4-unit tick. |
| Pen rail | x 228, the full paper height | 1.5 `strong` |
| The pen | on the rail | needle: a filled triangle, tip on the rail, 12 long, 13 tall, `accent2`; nib: r 2.8 `accent2` with a 1.2 `bg` ring |
| Lowest and highest pointers | on the rail | hollow triangles 10 x 11, `bg` fill, 1.3 `accent2` edge. The needle pushes them, like a maximum-demand meter's drag pointer. |
| Trace | on the paper | 1.5 `accent2` polyline, round joins; a dot r 1.7 on each reading; DX = 188 / (N − 1) units a reading, the newest at the rail |
| Stack's tray | x 228 to 338 | `sunk` fill, right corners r 6; the paper's horizontal rules run straight through it |
| Beads | in the tray | one per reading, r 4.3, `accent2` with a 1.3 `bg` ring; one row per 1-unit cell (edges on whole units, so a limit on a whole unit falls between rows); first bead at x 247, pitch 9.6, closing up evenly when a row holds more than 10 (rings keep overlapping beads apart) |
| Off-scale reading | either end | the pen pins at the edge like a real recorder: a hollow dot r 2.6 and a hollow bead in the end row; the windows still give its true number |
| Key | baseline y 331 | 12.5 px `muted`, a 14-unit swatch drawn with the same class as the mark, laid out from x 34 |

Text on the paper (limit labels, "2.9 SD out") wears its own halo: `paint-order: stroke; stroke:
var(--k-panel); stroke-width: 4px`, so a trace under it never fails the line-through-text test.
Name a line in the key, not on the paper, unless the label carries a number the scale does not show.

## Colour roles (never by name in words Dan reads)
- `accent2` (ink in the app): the readings themselves, trace, dots, beads, needle, pointers, bar-graph fill.
- `amber-line`: the one statistic being taught: mean line, running mean, best-fit line, the rule's tick.
- `fill1` (.85): the ±1 SD band, across paper and tray. `fill3`: the 1, 2 and 3 SD bands, opacity .95 / .6 / .32 under the bell, x .75 on the paper.
- `accent` (teal): the normal curve (2 px), distance-to-mean sticks (2 px, .75 fading to .4), every small caps label.
- `warn`: only limits (1.5, dash 5 4), readings outside them (dot r 2.8, bead), the ring round them, the zone beyond a limit (.06 on paper, .35 under the bell's tail).
- `good`: never on the chart (only "finished"). `cat1`-`cat4`: only for a second pen of equal standing (lesson 4).

## Motion (all through one `K.anim({button: false})`; `K.ease` for travel, `K.arrive` + `K.fade` for arrivals)
Nothing starts before 0.4 s (the 0.35 s screen fade). Parts arrive about 0.6 s apart. Every demonstration ends by 4.8 s.
1. **The trace (signature moment).** The pen writes reading k at 0.6 + 0.09k s, moving in a straight line
   between readings while the paper scrolls left by DX a reading. The newest five segments are drawn wider
   (3.6, opacity .32 falling to 0 over five readings): wet ink drying. A soft disc (r 7, .18) sits under the
   nib while it writes. As the pen reaches each reading, a bead leaves the needle tip at the reading's
   exact height and rides into its row over 0.45 s (`K.ease` on position; radius 1.6 to 4.3 and opacity in
   the first quarter), so about four beads are in flight at once and the hump builds in time with the zigzag.
   The windows read LATEST, LOWEST and HIGHEST, changing digit by digit as each reading lands; the hollow
   pointers are shoved outward by the needle. Payoff: the last bead lands at 4.6 s and the hump is whole.
2. **A statistic arrives from the data.** The running mean writes itself left to right in amber over 1.8 s and
   wanders, then settles (the MEAN window rolls with its head); then the flat mean line grows outward from
   the rail across paper and tray (0.7 s), and the running mean fades to .45. The SD band opens from zero
   height about the mean (0.9 s) while the SD window counts up with it, after teal sticks have grown from
   the mean to each reading, swept left to right (1 s). The bell is drawn from its bottom up like a pen (1.4 s), then the
   bands fill in 0.5 s apart, each window's bar graph filling to its share as the band lands. Limits slide in
   from the top and bottom edges to their values (0.8 s), the zones tint, then a ring pulses out from each
   reading outside (r 3 to 15, fading, 0.8 s) and stays as a quiet ring r 6.
3. **Glides.** The drawing is always made from `cur`, a displayed copy of the values, bead positions and
   pitch, which glides to the targets: a slider drag in 0.25 s (ease-out cubic, restarted on every input so
   it follows the finger); Fresh batch in 0.7 s (`K.ease`): beads lift into a loose cloud and re-sort into
   their new rows while the trace re-draws and the bell reshapes; adding a drift waits 0.4 s and takes 1.2 s.
   Windows show the statistics of what is drawn, so numbers settle with the beads, like a needle. Then the flat
   mean line tilts on the batch's middle into the best-fit line (0.8 s).
Reduced motion and the self-test (`html.k-testing`) open every step finished; the timing check reads
the timetable.

## Interaction
- `K.stepper` id `step` (its own label and Back / Next hidden; the page's own Back / Next buttons).
- `K.control` id `spread`: "Spread of the random error", 0.5 to 2.5 V, step 0.1, snap at the default.
  Every step answers live: the trace stretches, beads change rows, every overlay follows.
- `K.button` "Fresh batch" (made first, so the self-test presses it): the next seed. On the first step the
  pen writes the new batch from blank paper; on later steps the batch glides in.
- Lessons may add one drag: a `K.drag` on a reading's dot moves that one reading (lesson 1), or a limit's
  line (lesson 3). Never more than three controls.

## Sound (optional)
Fresh batch on the writing step plays `K.sound.chord` with one 0.05 s triangle tick per reading,
staggered at the pen's 0.09 s pace, pitch 620 + 45 x (reading − true value) Hz, clamped 300 to 1000:
higher readings tick higher, so the scatter is heard as the pen draws it. Only from that press; never in `K.update`.

## Numbers and labels
- Readings and means to 0.1 V, SD to 0.01 V, z to 0.1 SD, shares as whole percentages, the expected
  count to 0.1. Use the same rounding in the windows and the `.say` sentence (`K.fmt`).
- Window labels at most 12 characters (WITHIN 1 SD fits; STD DEVIATION does not: use SD after the text
  has said "standard deviation, SD for short"). Value plus note must fit in 99 units.
- SD is the sample SD (divide by n − 1); say so where it is taught.
- The `.say` sentence is built from the targets (the numbers the glide settles on) and reads right at
  the extremes ("none of the 40", "all 40").
- No `K.readout` tiles: the windows are the readouts. If a lesson check asks for a number, move that
  number into a `K.readout` and take it out of the windows, so quiz mode can hide it (no echo).

## The data generator (the rule is on screen)
`reading k = true value + spread x z_k`, where z_k comes from a seeded mulberry32 generator through
Box-Muller. Batch b uses seed `SEED0 + (b − 1) x 7919`, so screenshots and checks are stable and Fresh
batch walks a fixed sequence. With a drift: `reading k = start + creep x k + spread x z_k`. Pick SEED0 with a
scratch search (see `seed-search.mjs`) so batch 1 shows the lesson's point at the default setting: here, exactly
one reading outside the limits at 2.9 SD, 28 of 40 within 1 SD, the drift's fit within 0.01 of the truth. The
chart says SIMULATED and the batch number; the caption gives the rule; limits and true values are named
once in the lead as examples. Never show a made-up failure rate, tolerance or reading as real.

## The five lessons in this language
1. **The middle and spread.** Twelve simulated RCD trip times at 1 x IΔn (true value 24 ms, example only)
   traced on the paper and stacked; MEAN, MEDIAN and RANGE windows; the amber running mean settles. Dan
   drags one reading's dot up the paper as a slipped probe: the mean line climbs, the median row barely
   moves, the range pointer is shoved out. Surprise: one rogue reading moves the mean more than ten honest ones,
   and the spread slider shows two batches with the same mean but very different stacks.
2. **How far to trust a reading.** A meter takes repeat readings of a reference whose true value is a fine
   dashed line on the paper. The stack's rows are the meter's resolution (one row per last digit), and a
   systematic offset control slides the whole trace and stack off the true line while random error sets the
   width. A count control (2 to 40 repeats) shows the result window "440.3 ± 0.4 V" with its ± band on the rail
   narrowing as spread ÷ √n. Surprise: the band shrinks onto the wrong value: repeats beat random error, never systematic.
3. **The normal curve.** Proto steps 4 and 5: the bell drawn over the stack, the 1, 2 and 3 SD bands with
   bar-graph windows against 68, 95 and 99.7%, the example limits, the ring and the SD-distance callout, and
   BELL EXPECTS. Control: spread, plus Fresh batch with a tally window "batches with a reading out". Surprise:
   a reading 2.9 SD out is rare for any one reading, yet a batch of 40 has one about one press in four.
4. **Trends over time.** Monthly insulation resistance of a pump motor (simulated: an example starting value
   falling a few MΩ a month, plus noise) on a longer paper, with the best-fit line and the true trend as a
   fine dashed line. Control: noise; Fresh batch makes the fit line wobble around the dashed truth, more as noise
   rises: a real drift survives every batch, noise does not. A second pen in `cat2` (a seawater temperature rising for
   its own reasons) climbs in step and a window shows their correlation near 1. Surprise: two traces that
   both drift with time correlate strongly with no link between them.
5. **Reliability.** The paper becomes a survival chart: 40 simulated pumps, each with a seeded exponential
   life from an example failure rate λ (a control, per 1,000 h). The pen draws the count still running as a
   staircase, each failure dropping a bead into a "failed" tray at its time, and the teal curve
   R = e^(−λt) is drawn over the staircase as the bell is over the stack. A marker at the MTBF, 1/λ, shows only
   about 37% still running there (e^−1). A choice adds a second unit in series or in parallel, drawn as a
   second pen. Surprise: two units in parallel keep the system alive far longer, while series falls below either.
   The bathtub curve is drawn as a shown rule (falling early failures + constant + rising wear-out), labelled
   illustrative, with the steady middle as the λ the survival chart uses.

## Reusable code (copy from `proto.html`; line numbers as of this version)
- Generator, lines 85-99: `rng(seed)` (mulberry32), `normals(seed)` (Box-Muller, N values), `seedOf(b)`, `rule(z, spread, creep)`.
- Statistics, lines 102-124: `stats(v)` → {mean, median, sd (n − 1), lo, hi, range}; `within(v, m, sd, k)`;
  `fit(v)` → {slope, at(i)} least squares on reading number; `pdf`, `cdf` (A&S 7.1.26); `expectOut`; `simpson` for checks.
- Geometry, lines 127-139: `yOf(v)`, `binOf(v)` (1-unit cells, ends pinned), `beadsOf(v)` → {bx, by, p:[pitch], cnt, slot}.
- The glide, lines 165-185: `cur`, `setNow(to)`, `sample()`, `retarget(to, dur, delay, ease)`; one `K.anim` (line 203)
  advances `clock` and `T`, calls `sample()` and `paint()`, and stops when the demo and the glide are both done.
- Arrivals, lines 223-229: `arr(t0, d)` (also records the timetable for the timing check), `part(a, rise, draw)`.
- Drawing, lines 253-366: `win(k, label, value, sub, a, gauge)`, `keyRow(items, y)`, `drawPaper(h)`, `drawTrace(v, h, outs)`,
  `penY`, `drawPen(y, lo, hi)`, `drawBeads(outs, tracing)`, `bellX` / `bellPts` / `bellFill` (the bell on its side,
  scaled to beads: N x (1 unit ÷ s) x φ(z) beads a row, trimmed at 3.6 SD).
- `K.update` (line 579): compare step, batch and spread with the last ones and choose: writing from blank (step 0,
  or Fresh batch there), a drift morph, a batch glide, or a drag glide; then text, `.say`, `paint()`.
