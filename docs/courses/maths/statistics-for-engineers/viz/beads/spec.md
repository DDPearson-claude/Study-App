# Beads: the visual language for Statistics for engineers

**The idea.** Every reading is a bead. It drops in, jinks through twelve rows of random nudges, lands with a
small bounce and settles on a pile. Mean, spread, the bell curve and trends are never drawn first. They come
out of the pile: the beam balances where the mean is, the curve traces the stacks before relaxing into a bell,
and the pile stands up into a time series.

Working prototype: `proto.html` (5 steps, 5 self-tests, passes at 340/720/1040 px in both themes). Pictures:
`scene-s0..4.png` (light) and `scene-dark-s0,2,4.png` are the motion, cropped to the drawing. `proto-360-*.png` are whole cards.

## Marks (viewBox 0 0 340 266)
- **Bead** (one reading): circle r 4.2, fill `accent2`, 1.2 stroke `bg` (keeps neighbours apart), plus a
  glint circle r 0.3·r at (−0.34r, −0.36r): `bg` at .42 in light, `ink` at .55 in dark. They read as ball
  bearings in light and as pearls in dark. Time view: r 3.3.
- **Column** = one step of the meter's resolution (0.01 V in the prototype), 9.6 wide, so equal readings
  stack. The scale holds 31 columns (±15 steps), x = 170 + k·9.6. Stack pitch 9.6, squeezed only when a
  stack would pass y 80 (`vp = min(9.6, 128.5 / tallest)`).
- **Beam** y 210, 2 px `ink`. Ticks hang under it: minor 2.5 long in `strong`, major 3.5 long every 5 steps in
  `muted`. Tick numbers are 13 px `muted` at y 241. The axis title is at y 259 and says "simulated".
- **Field** (only where randomness is the point): 12 rows of peg dots r 1.2 in `strong`, 6 apart (y 14 to 80).
  Peg spacing is one nudge (σ in px / 2.4), so the field widens as √rows and scales with the random error.
  The hopper is a 2-stroke funnel at the true value, labelled "true value".
- **Ringed bead** (the one Dan can drag): ring r+2.6 and two 4-unit arrowheads ‹ › in `accent2`.
  Out of tolerance, both go `warn`.
- **Fulcrum**: ink triangle 14 wide, 10 tall, apex on the beam's underside.
- Off-scale readings sit at the scale's end with a small `muted` arrowhead pointing outwards. Never clip them silently.

## Motion (K.anim only, one clock for beads `Tsc`, one for labels `Tstep`; T = Infinity is the finished picture)
- **Drop** (the signature): beads release from the hopper so that they *land* every 0.055 s, in reading
  order. In the field a bead's x eases (K.ease) from row to row through its own cumulative nudges. Then it
  falls under gravity (1600 units/s²) and slides into its column. It bounces 4.5 then 1.3 units over 0.24 s,
  and a flat ellipse splash (r → r+9, opacity .45 → 0) spreads from where it lands.
  Release time = land time − field time − fall time, so a short fall onto a tall stack leaves later.
  Fifty beads take ≈ 4.2 s. A teal count ("37 readings") ticks up at the top left as they land.
- **Rain** (a fresh batch away from the field): old beads sink 10 and fade (0.3 s), new ones fall straight
  down from y 16 and land every 0.028 s (≈ 2.4 s).
- **Morph** (pile ↔ time): beads leave in reading order, 0.03 s apart, 0.75 s each, along a 22-unit arc.
  The tick numbers travel with their values from under the beam to the left axis. The beam becomes the
  time axis and the vertical axis grows. ≈ 2.4 s. Back to the pile: 0.018 s apart, a dip instead of an arc.
- **Settle** (any slider or drag): every bead eases from where it is to its new place in 0.45 s with a
  back-out overshoot of about 6%, so the pile breathes. In the time view the beads ripple left to right (0.004 s apart).
- **Springs** carry weight: the fulcrum (ω 5, ζ 0.42) lags the mean, overshoots a touch and settles. The beam
  tilts by 5°·tanh(offset / 1.2 SD) about the fulcrum, pile included. The spread, range ends,
  best-fit line and peg spacing glide on stiffer springs (ω 7–10, ζ 0.7–0.85).
- **Order of arrival** (labels 0.4–0.7 s each, K.arrive). Mean step: the fulcrum slides in from the left
  end and the beam rocks level (0–1.4 s). Then the mean line and label, then the SD bracket growing out from
  the mean, then "1 SD" each side, then the median, then the ring. Curve step: bands bloom out from the mean
  (±1, ±2, ±3 SD, 0.35 s apart). Then the skyline traces left to right along the stack tops (1.1 s), then
  relaxes into the bell (0.9 s), then 68%, 95%, 99.7%. Tolerance step: limit lines grow down and the zones
  fade in. Then each out-of-tolerance bead turns `warn` with a 0.4 s shiver, 0.12 s apart, then the SD ruler, then the ring.
  Every step settles in 3–5 s; a self-test asserts it.
- **Payoffs**: the last bead lands and the range bracket snaps to its final width. The beam stops rocking
  under the mean. The skyline melts into the bell. The best-fit line, which swung while the first few
  readings arrived, steadies.
- Leaving the drop step mid-drop (or the filmstrip's quick flick) must not leave beads in mid-air. The rest of
  the batch finishes as a 1.1 s shower (`makeFinish`). Labels then start at 0.9 s.

## Interaction
- **Drag the ringed bead** along the scale (K.drag on the persistent circle, `control: 'slip'`). Its slider,
  "Slip on the ringed reading", −0.10 to +0.10 V in 0.01 steps, is the keyboard's way in. Steps without a drag
  set `.scene.nodrag .k-drag-hit {pointer-events: none}`.
- **One slider per step**, the others hidden: random error (1 SD), slip, or drift per 10 readings.
- **Drop a fresh batch** (K.button, secondary, full width): the next seed; it plays the step's own entrance
  (drop, rain or spool).
- `.say` is one or two sentences that follow the state and never repeat a readout. Before the first move on
  the drop step it asks for a prediction: "twice the random error: twice as wide, or twice as tall?"

## Sound (only from the Drop a fresh batch press)
One soft triangle tick per bead, scheduled when the batch starts: `K.sound.tone(hz, {dur: .07, type:
'triangle', gain: .45, at: L0 + i·dt})`, so each tick lands with its bead. Pitch follows the reading on an
11-note pentatonic run from 330 to 1319 Hz, so low readings tick low and a wide spread sounds like a scatter.
`at` is in kit.js but not KIT.md. If the kit drops it, use `K.sound.chord(list, {stagger: dt})` from the first landing.

## Colour roles (kit roles only)
| Element | Role |
|---|---|
| beads, controls, ring and arrows | `accent2` (navy; the main thing) |
| beam, axis, fulcrum, mean line (dashed 4 3), SD bracket, labels "mean", "68%" | `ink` |
| ticks, tick numbers, titles, true-value dashed line (5 4), off-scale arrows | `muted`, `strong` |
| pegs | `strong` |
| small labels: "true value", "range", "1 SD", "median", SD ruler, the count | `accent` (teal) |
| range bracket, median marker | `accent` |
| SD bands | `fill1` with fill-opacity 1 / .55 / .3 (nested, ±1 darkest) |
| bell curve and best-fit line: "the shape the readings show" | `amber-line`, 2.6 px (curve on a 4.2 `bg` halo) |
| noise band (±2 residual SD) | `fill1` |
| beyond the limits: zone fill, dashed limit lines, "too low / too high", out beads | `warn` (zone fill-opacity .09) |
| a second series (lesson 4) | `accent` beads; cat1/cat2 only for equal things (two units, two cells) |

Never `good`. Never name a colour in words Dan reads. Gotcha: K.fade writes `opacity`, so any see-through
fill must use `fill-opacity` or color-mix. Otherwise it flashes solid while fading in. A bead turning to
`warn` crossfades with `color-mix(in srgb, var(--k-warn) p%, var(--k-accent2))`.

## Numbers and labels
- Drawing labels **name** things ("mean", "1 SD", "median", "too high", "best fit"). Values live in K.readout
  tiles (2–3 per step, hidden per step), so lesson checks can hide them and nothing echoes.
- Rounding: readings 2 dp (the meter), mean, median and SD 3 dp, counts as "48 of 50", z to 1 dp with a sign, trend 3 dp with a sign.
- Text 12–13 px (12 only for teal small labels). Labels sit in the band above the pile (y 16–76), never on beads.
  The median label goes on the side away from the mean line. "1 SD" labels sit outside the bracket ends.
- Constants printed in the drawing: tick values, 68/95/99.7 %, the example limits, the true value.

## The data generator (never invented data)
- Rule shown on screen and in the caption: *reading = true value + drift × (n−1)/10 + σ × (sum of 12 nudges,
  each anywhere from −½ to +½)*, shown to the meter's resolution. Twelve U(−½,½) sum to SD 1 (12 × 1/12),
  so σ is exactly the slider's SD. The last reading adds the slip. Readings are kept as whole steps
  (integers), so a slip moves the mean by exactly slip/N.
- Seeded: `mulberry32(7919·batch + 104729)`. The prototype opens on batch 3438, picked by `seeds2.mjs` for a clean
  bell with one honest reading beyond ±0.05 V each side. Fresh batch = batch + 1. Checks and screenshots stay stable.
- Labelled **simulated** in the lead, the axis title and the caption. An example set (a lesson's own named
  readings) may replace the generator. It is named once in the lead, and each bead is then one of those readings.
- Example values (true value, limits, rates) are named once as examples ("Say the limits are…"). Rates in
  lesson 5 are controls, never real figures.

## The five lessons in this language
**1. Middle and spread.** Fifty repeat earth fault loop impedance tests on one circuit (true 0.80 Ω, read to
0.01 Ω) drop through the field onto the beam. The fulcrum slides in and the beam rocks level under the mean.
The SD bracket grows out from it and the median marker drops onto the middle bead. Control: drag the ringed bead
(a slipped probe). Surprise: drag it 0.10 Ω out and the beam tips, the mean creeps a fiftieth of that and the SD
swells, yet the median barely moves. A second beam with the same mean and twice the spread shows why the average alone misleads.

**2. How far to trust a reading.** RCD trip times (simulated, ms). The peg field is the random error and the
hopper's offset from a dashed "true value" is the systematic error. Column width is the resolution, and the
range is a choice (1 ms or 0.1 ms) that merges or splits the stacks. Below, a second small tray piles up the
*means* of repeat sets as they are taken. Controls: repeats per result (1, 4, 16) and a systematic offset.
Surprise: sixteen repeats squeeze the pile of means to a quarter of the width, but it settles round the hopper,
not the truth. Repeats never remove a systematic error. The result is drawn as a bracket on the beam, "mean ± uncertainty".

**3. The normal curve.** A UPS output voltage on rounds (simulated). The skyline of the stacks traces, then
relaxes into the bell, and the ±1, ±2, ±3 SD bands bloom out with 68%, 95% and 99.7%. Then example limits grow
down, the beads beyond them shiver and turn `warn`, and an SD ruler (from the mean and SD of the *rest*) spans the
top. Controls: random error, and drag the ringed bead. Surprise: with limits 2 SD out, about 1 honest reading in
20 is out of tolerance and nothing is wrong. A reading 5 SD out is far more likely a slip, so retest it; never
delete it without a cause.

**4. Trends over time.** A pump bearing's running temperature, one reading a watch (simulated). The pile
stands up: beads fly out in the order taken and the scale swings to the left axis. A best-fit line grows as they
arrive, then the ±2 SD noise band and the dashed true value appear. Control: drift per 10 readings. Surprise 1: with no drift the line
still leans, and with only the first ten readings it swings wildly. Surprise 2: a second string in teal (the
engine-room temperature, driven by the same simulated load) rises with it. A morph into a scatter of one against
the other shows a tight correlation that neither caused. Insulation resistance works the same on a log value
axis: a column is then one equal step in log value.

**5. Reliability.** Fifty identical units (example λ, a control, "example failure rate") sit as beads on a
shelf. As a time slider plays, each drops off at its own seeded failure time t = −ln(u)/λ into a pile along a
time axis. The shelf's survivor count traces R = e^(−λt), first as a skyline, then relaxing into the curve.
A choice switches single / series pair / parallel pair: linked beads drop as a pair when either fails, or only
when both do. Surprise: at t = MTBF only 37% are still on the shelf, not half. Mixing early, random and wear-out
units makes the failure pile's rate curve a bathtub.

## Reusable code (copy from proto.html, by name)
- `mulberry(seed)`, `nudgesOf(b)`, `pathSteps(u, i, p, upto)`, `readings(p)`: the generator. A reading is
  `Math.round(pathSteps(..., 12)) + slipSteps`, in whole resolution steps.
- `stats(ks)` (mean, n−1 SD, median, lo, hi) and `fit(pts)` (least squares: slope, mid value, residual SD).
- `dataNow(p)`: one cached layout per state. Stack index = earlier readings in the same column, `vp` squeeze;
  `pile[i]` and `time[i]` targets.
- `makeDrop(kind, fadeOld, D, time)` + `dropPos(...)`: the evenly-landing drop through the field or rain, with
  bounce and splash time `tc`. `makeMove`, `makeSettle`, `makeFinish` + `movePos(...)`: staggered arcs between any two layouts.
- `mk/aim/springStep/snapAll`: the springs. `counted(i, sc, T)` lets labels follow only the beads that have
  landed (running mean, running fit).
- The skyline→bell path in `paint()` ("First the skyline..."): sample k every 0.25,
  `lerp(skyline, bell, relax)`, trace from m−4s to m+4s.
- `vis(el, a, rise)`: K.fade plus `display: none` at 0, so hidden labels never count as overlaps.
- Patterns: build every element once and move it, never rebuild in K.update; the dragged bead must persist.
  A step change calls `enterStep`, a parameter change calls `settle`, and a press sets `lastKey` before its
  update so the drop is not replaced by a settle.
