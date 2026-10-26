# One set of dots, many views: the data language for Statistics for engineers

**The idea.** Every reading is one dot that keeps its identity from the first picture to the last: a
number in a log, a dot on a line, a dot in a pile, a dot under a curve, a dot at its hour. Dan steps
on and the same dots glide between views, so he sees that range, mean, SD, the normal curve and a
trend are all the same forty readings looked at differently.

Working prototype: `proto.html` (5 views, all checks pass at 340/720/1040). Films: `film-scene-s*.png`.

## Marks (viewBox 340 × 300, one fixed height for every view so the page never jumps)
- **A reading.** A number (15 units, weight 500, tabular) in the log; everywhere else a dot, r 4.4 on
  the line and in the pile (8.8 across, 10 between stack centres), r 3.4 over time. Every dot wears a
  1.2-unit ring in the page colour, so touching dots stay separate without an outline.
- **The followed reading.** An amber ring, r + 3.4, stroke 2.4; in the log a highlighter box
  (42 × 23, rx 5) behind its number. Its label sits beside it (over time, above it).
- **Value axis.** 48 to 72 °C across x 20 to 320 (12.5 units a degree), floor at y 236: ticks every
  1 °C (3 units), every 5 °C (6 units), labels 50 … "70 °C" at y 257.
- **The pile.** 0.8 °C stacks built from whole tenths (46.1-46.8, 46.9-47.6 …, so no reading ever
  sits on an edge); each dot sits at its stack's middle, lowest values at the bottom.
- **Over time.** Hour 1 to 40 across x 46 to 312, the same temperature range up y 236 to 32;
  hairline grid at 50 … 70.
- **Brackets** (range, SD, 68/95/99.7): a dimension line with 5-unit end ticks; words in a gap when
  the bracket is at least 26 units wider than them, else just past its end.

## Motion (K.anim only; K.ease travel, K.arrive for every arrival; nothing pops in)
Each move has a timetable (`plan()`): dot *i* leaves at t[i] and travels for `dur`; S is when the
last lands; then the view being entered tells its story, its parts arriving in order. The story is
squeezed (factor k) when the dots took long, so every move, forward, back or a jump, ends by 4.9 s.
- **Opening, the log.** Numbers write in 6 ms apart, each fading over 0.3 s; the highlighter
  follows. Settled by 0.6 s.
- **Log → line (the first Next).** Each number dissolves as its dot grows in its place (0.35 s), then
  the dot flies to its temperature: hour 1 first, 20 ms apart, 0.8 s each. The axis fades in as they
  leave. All on the line by 1.7 s; the range bracket grows out from its middle, then its end values,
  then "range 9.2 °C". Done 2.9 s.
- **Line → pile.** The pile builds from the floor up: a dot leaves at 0.15 + 0.07 × its layer
  + 0.25 × its rank, so each layer fills left to right before the next. Then a fulcrum slides under
  the mean, the mean line grows up from it, "mean" and "median" labels, and the SD bracket opens
  outwards from the mean. Done about 3.6 s.
- **Pile → curve.** The dots stay. The curve draws left to right (1.2 s), the bands open from the
  inside out (68%, 95%, 99.7%, 0.4 s apart, brackets with them), the followed reading's "+2.4 SD"
  arrives, the limits drop in, and the readings outside them turn red (0.6 s). Done 3.6 s.
- **Curve → time: the signature.** The pile tips 90° onto its side against the right edge
  (0.2-1.2 s), its temperature scale easing into the vertical one, so each dot ends at its own height.
  Grid, hours and limits fade in behind it. Then the dots peel off leftwards in time order, hour 1
  first, 35 ms apart, 0.75 s each, a thin thread joining each one as it lands. Last, the trend line
  draws left to right and its key arrives. Done 4.5 s. Back plays it in reverse: the series rewinds
  into the sideways pile, last hour first, and the pile stands up again.
- **Any other arrival** takes the shortest honest route (into the time view always via the pile,
  so the tip is never skipped) and then plays that view's story.
- **After a slider or Fresh batch** every dot glides to its new place (exponential, τ 0.15 s), and
  the mean, SD and slope glide with them, so the numbers in the labels roll. Leaving a view, its
  own lines fade out over 0.3 s from wherever they had got to; the floor and the °C ticks, shared
  by three views, stay put.
- **The moment of payoff** is the peel: a pile that looked like plain scatter unspools into time
  order and, with a climb, visibly leans. The second is the pile breathing under the SD slider while
  the fulcrum hardly moves.
- Reduced motion and the self-test open every view finished.

## Interaction
- **Back / Next** (`K.stepper`, id `step`, compact) sit above the drawing, outside the stage, so the
  drawing keeps at least 0.85 scale at Text size XL (inside the stage it shrank to 0.6 and failed).
- **Scatter of each reading (SD)**, 1.0-3.0 °C in 0.1, under the drawing. **Slow climb**, 0-0.6 °C
  per 10 h, shown only on the time view (it persists, and the rule line says so).
- **Fresh batch** sits beside the rule line, under the sentence: the next seed (batches 1-40, cycling).
- **Tap any reading**, number or dot: the nearest within 26 units becomes the followed one. Arrow keys
  on the drawing step through readings (by value on line, pile and curve; by hour in the log and over
  time). A tap with movement over 10 px is a scroll, not a pick (`touch-action: pan-y`).
- The `.say` sentence follows the state and reads right at the extremes ("none of the 40").

## Sound
None: the motion is the satisfaction. If ever wanted, one soft tone from Fresh batch only, never one
per dot (sound plays only from a K.button press).

## Colour roles
| Element | Role |
|---|---|
| reading dot | `accent2` fill, `bg` ring; line view fill-opacity 0.85 so overlaps show |
| reading outside the limits | `warn` fill (eased with `color-mix` over the two roles) |
| followed reading | `amber-line` ring; `hl` box in the log |
| floor, ticks / grid | `strong` 1.5 / `strong` 1, grid `line` 1 |
| mean line, fulcrum, curve | `accent2` (2 units) |
| range, SD and band brackets, their % | `accent` 1.5; % bold 13 in `accent` |
| bands 1, 2, 3 SD | `fill1` at 0.9, 0.55, 0.28, from just over the pile to the floor |
| limits | `warn` dashed 5 4, labels `warn` |
| time thread / trend | `muted` 1 at 0.7 / `amber-line` 2.5 with a key |
| small caps header | `accent` 13 bold, letter-spacing .06em |
Amber marks only what matters now: the reading being followed and the trend.

## Numbers and labels
- One rounding: 0.1 °C everywhere (`K.fmt(v, {decimals: 1})`), signed for z and slope
  (`sign: true`: "+2.4 SD", "+0.2 °C per 10 h"). SVG text is `tabular-nums`, 13 units (15 in the
  log), never smaller.
- A label is set like a newspaper's: muted words and units, the number bold: `label(x, y, [['mean ',
  'w'], ['60.1', 'n'], [' °C', 'u']])`. Number and unit never part (` ` in HTML text).
- Labels sit on or beside what they name; the followed reading's goes through `K.labels` with the
  dots, lines and brackets in `avoid`. Never a number on every dot: only extremes, the mean, the
  followed reading, the bands' shares and the trend.

## The data generator (shown on screen, labelled simulated)
`reading(i) = round to 0.1 (60.0 °C + SD × z[i] + climb × hour / 10)`. z[i] are standard normal
errors from a seeded generator (mulberry32 then Box-Muller; batch b uses seed 32 + b; batch 1 = 33),
fixed per batch, so moving SD slides every dot along its own line and its identity never changes.
The rule line under the sentence states it with the current SD and climb; the caption says the
readings are simulated and the 56 and 64 °C limits are an example. Batch 1 at SD 2.0 gives mean
60.1, SD 2.0, 28 of 40 within 1 SD, and two readings outside the limits, one each side.
Builders: never present a generated batch as real data; for a named example set, list it once.

## The five lessons in this language
**1. The middle and spread.** The log, the line and the pile from the prototype. Add a drag on the
followed dot along the axis (`K.drag` to a `value` control): the fulcrum chases it, the mean line
leans after it, and the median label does not move. With simulated insulation resistance readings
(a rule with a long upper tail, stated on screen), drag one reading out to a dry-day high and the
mean walks off while the median stays: why the average alone misleads.

**2. How far to trust a reading.** The same pile, with a dashed "true value" line from the rule.
Control one: *meter reads high by* (systematic error) shifts the whole pile rigidly sideways, the
true line staying put. Control two: *readings averaged*, 1, 2, 4 or 8: each group of dots slides
together and merges into one larger dot at its mean, and the pile narrows by √n. The surprise:
averaging shrinks the random scatter but never closes the gap to the true line. Example: an earth
fault loop impedance tester on one example circuit, readings snapped to its 0.01 Ω resolution
(the pile's stacks are the meter's steps), result written as mean ± 2 SE under the pile.

**3. The normal curve.** The prototype's curve view: the curve drawn over the pile, the 68/95/99.7
bands, fixed example limits and the followed reading's distance in SD. Control: the SD slider and a
tap to follow any reading. Surprises: the readings outside the limits go from none at 1.0 °C to 2
at 2.0 and 5 at 3.0 though the limits never move; the hottest reading stays +2.4 SD whatever the
scatter (z does not care about scale); with 40 readings, one or two beyond 2 SD is ordinary.

**4. Trends over time.** The tip and the peel, then the trend line. Controls: slow climb and SD.
Surprises: with no climb the line still tilts (+0.2 °C per 10 h in batch 1: noise has a slope
too, and it rides on any real climb); a climb small against the scatter hides in the pile and only
shows in time order. For "correlation is not cause", add a
second simulated series in `accent` (engine-room air, same hours, both following a load rule that
is shown); the dots morph from two time series into one scatter plot (x = air, y = bearing), each
dot still its hour, and the tight cloud comes from the shared load, not one causing the other.

**5. Reliability.** Forty dots in a row, each one simulated unit whose lifetime is drawn from
R = e^(−λt) with an example λ (a control, stated as an example, never a real rate). Play: time
runs, and each dot drops to the time axis when it fails; the count still running traces steps that
sit on the drawn curve e^(−λt). At t = MTBF = 1/λ only 37% are still running, not half: the
surprise. A choice of *one / two in series / two in parallel* joins dots in pairs: a series pair
drops at the first failure (R²), a parallel pair at the last (1 − (1 − R)²). For the bathtub,
three λ's for early, useful and wear-out life; the dropped dots pile up by age into its shape.

## Build notes
- The filmstrip opens every step from step 0, and render's moved and end shots come 1.5 s and 2.5 s
  after a move, mid-story. Any arrival must tell its view's whole story (it does: `plan()`); judge
  finished pictures from the film's `-end.png` frames.
- Keep the stepper and the button out of the stage; one slider in it (two on the time view).

## Reusable code (copy from `proto.html`)
- `rng(seed)`, `draws(batch)` -> `{z, jit}`, `readings(batch, sd, climb)`: the seeded generator
  (lines 72-86). Keep z fixed per batch; scale it, never redraw it, when a control changes.
- `stats(v)` (n − 1 SD), `fit(xs, ys)`, `phi(z)`, `curveY(v, m, s)`: the pile-scaled curve, so the
  curve and the stacks hold the same area (lines 89-114).
- `binOf` / `binMid` and `layout(v, jit)` -> `views[k][i] = {x, y, r, red, op, na}` for every view,
  plus `level`, `height`, `top(i)`, `pileTop` (lines 111-140). A new view is one more array here.
- `plan(a, b, L)`, `tipPos(i, u, L)`, `planned(i)`: the timetable, the tip (rotate about the pile's
  base while easing the scale, x' = kx·cosθ + y·sinθ, y' = −kx·sinθ + y·cosθ), and every dot's
  place at time T, numbers dissolving into dots and back (lines 151-234).
- The `K.anim` loop: `planned()` until `dotsEnd`, then an exponential glide to the live layout;
  `settled()` stops it; `go()` opens finished under test or reduced motion (lines 430-458).
- `part(parent, a, rise, draw)`, `label()`, `bracket()`, `tw()`: fading groups, newspaper labels,
  dimension lines (lines 239-274). `drawView(v, A, other, leaving)` shows how shared parts stay put.
- `drawTrace()`: the thread through readings in time order, extended only to dots that have landed.
