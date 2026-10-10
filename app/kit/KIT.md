# The house kit

You write the BODY of one page: HTML, an optional `<style>`, then one inline `<script>` ending
with `K.ready()`. It runs in a sandboxed iframe on Dan's phone (about 340 px wide, touch) and
laptop, with the global `K` and the kit's stylesheet. No network or storage: no web
addresses, `fetch`, `localStorage`, `alert` or `prompt`.

## Page shape that works
1. `<p class="lead">`: one line saying what is drawn (the app adds title and action).
2. The main visual with its controls right under it: `K.stage('#scene', '#controls')` keeps the
   pair on one phone screen. A choice that re-sorts the picture may sit above it.
3. `<p class="say">`: one sentence that changes with the state and says why. Then
   `<div class="k-readouts">` for numbers the drawing does not label.
4. Secondary figures and anything that grows go below.
5. `<p class="caption">`: one short sentence, at most 20 words: where the numbers come from ("A
   sketch, not measured data") or the rule in the explanation's words. No new claim, no law or
   term the explanation does not teach. The app shows what the model leaves out.

## Keep the answer hidden until Dan moves
Dan predicts before he plays: open on a setting the question is not about, and hide whatever
gives the answer away until his first move:
- class `k-after-move` on any element (a mark, an arrow, a sentence): hidden, its space kept.
  Hide the answer, not the controls or a whole figure (a blank hole fails the test).
- `K.readout({..., afterMove: true})` shows "?" until then; plot series and marks take `afterMove: true` too.
- `K.moved` is true from then on: in `K.update`, write `K.moved ? answer : question`.
- `K.afterMove(fn)` runs `fn` once at that moment; `K.reveal()` marks it from your handlers.

## The pipeline
Controls register themselves; their values form `params` = `{id: value}`.
```
K.model(fn)        fn(params) -> outputs {name: number | string}. Pure: no DOM, no lists or objects.
K.update(fn)       fn(params, outputs): draw everything here. More than one is allowed.
K.at(over)         -> outputs of the model at those params (others take each control's starting value)
K.check(label, fn, {source?})   fn() must return exactly true
K.ready()          call once, last: draws the opening state and runs the checks
K.complete()       at the lesson's end
K.params()  K.outputs()  K.refresh()   (refresh reruns the pipeline after you change your own state)
```
A readout whose id is an output key updates itself.

## Controls
Every control takes `into` (a selector or element). Ids are unique; use the lesson's ids exactly.
```
K.control({id, label, min, max, step, value, unit?, prefix?, fmt?, log?, snap?, hint?, into}) -> {el, get(), set(v)}
K.choice({id, label, options: [value | {value, label}], value, hint?, into}) -> {el, get, set}
K.toggle({id, label, value: false, hint?, into}) -> {el, get, set}
K.stepper({id, steps: [title | {title, text}], value: 0, compact?, label?, into}) -> {el, get, set, setSteps(list)}
K.button({label, press, secondary?, into}) -> {el, press(), setLabel(text)}
K.drag(el, {control, toValue(x, y)}) -> {el}
```
`control` is a big slider with − / + buttons. Keep `unit` short; `fmt(v)` returns the whole text;
`log: true` spans decades; `snap: [values]` lands a drag exactly on a setting the prediction or a
check names. `choice`: 2-8 short named options; `value` is an option's value or its 0-based
index. `stepper` walks a process with Back / Next (`compact: true` when your diagram shows the
content). `button` is an action (Send it in): use it, not plain buttons. `drag` lets Dan move
the thing itself: `toValue` maps the pointer (viewBox units; px from `el`'s top-left for HTML)
to the control's value; the first touch counts as his move.

## Outputs
```
K.readout({id, label, unit?, prefix?, decimals?, fmt?, big?, hint?, afterMove?, into}) -> {el, set(v), get(), text()}
```
One rounding everywhere a number appears: `decimals` matching the lesson text, and the `.say`
sentence built with `K.fmt(v, {decimals})` or `readout.text()`. Labels under 30 characters.
While Dan answers a lesson check, the app hides that output's readout and the `.say` lines:
never repeat a readout's value elsewhere (a label, an aria-label).
```
K.plot(target, opts) -> {draw(opts), x(v), y(v), invert(px, py), el, canvas}
```
- `x`, `y`: `{min, max, label, log?, prefix?, unit?, fmt?, ticks?}`. Leave out `y.min`/`y.max` to fit the data.
- `series`: `[{fn: x => y | points: [[x, y], ...], label?, color?, dash?, width?, fill?, dots?, gaps?, afterMove?}]`
- `shade`: `[{between: [a, b], label?, color?, x0?, x1?}]`: fills between two series (by label), a
  series and a constant, or two functions.
- `marks`: `[{x, y, label?, color?, guides?, afterMove?}]`: a dot with a label pill; `guides` adds dashed lines to the axes.
- `regions`: `[{x0, x1, label?} | {y0, y1, label?}]` (a band); `lines`: `[{x | y, label?}]` (a dashed line).
- `label`: the text alternative; `height`; `after(ctx, plot)` draws extras using `plot.x()`, `plot.y()`.

`draw(opts)` redraws with `opts` over the creation options: call it in `K.update`. Values must be
finite (`gaps: true` only where a gap is real). Series are navy, then teal; `color: 'muted',
dash: true` for a baseline.
```
K.bars(target, {max?, unit?, prefix?, decimals?, fmt?}) -> {draw(items)}      items: [{label, value, color?}], values >= 0
K.anim({step(dt, t), reset?, label?, autoplay?, button?, into}) -> {el, play, pause, toggle, reset, playing()}
```
`anim` adds a Play button (text `label`); `reset` adds Reset. When a switch, button or drag
already starts the motion, pass `button: false` and call `play()` from that control: one control
per action. In `step` advance your state (`dt` in seconds) and redraw; return `false` to stop. To
drive a slider, keep the exact value yourself (the slider moves in whole steps).

## Sound
```
K.sound.tone(hz, {dur?, type?, gain?})   K.sound.chord([hz, ...], {dur?, stagger?})   K.sound.stop()   K.sound.mute(on)
K.sound.hold(hz, {type?, gain?, max?}) -> {set({hz?, gain?}), stop(), playing()}
```
`dur` in seconds (at most 10). Sound plays only from a `K.button` press, never `K.update`; show
what is sounding. `hold` keeps a tone going while `set()` follows a slider. Phones can't play
below about 150 Hz: use 200 to 2,000 Hz.

## Drawings and helpers
```
K.el(tag, attrs?, ...children)    attrs: class, style, on: {click: fn}, text, html, dataset, any attribute
K.svg(tag, attrs?, ...children)   the same in the SVG namespace
K.labels(group, [{x, y, text, anchor?, size?, class?, color?}], {avoid?}) -> [<text>]
K.stage(visual, controls, {max?, beside?}) -> {el}
K.fmt(v, {decimals?, sig?, prefix?, unit?, percent?, sign?, compact?}) -> '1,234.5', '−3', '2.5 × 10⁶'
K.near(a, b, tol)   K.clamp(v, lo, hi)   K.lerp(a, b, t)   K.linspace(a, b, n)   K.color(role, alpha?)
K.ease(p)   K.arrive(T, t0, dur?)   K.fade(el, a, rise?)
```
Give an `<svg>` a viewBox about 340 wide, `width="100%"`, `role="img"` and an `aria-label` that
follows the state. Text 13-16 units, never under 12 (a phone shows 340 units at about 0.9x). A
row of N labels gets about 300/N units each; label only what differs. Every label sits on, or
points to, something drawn. `K.labels` places labels (13 units unless `size`) clear of other
text, the edges and the lines or shapes in `avoid`: use it for labels that move or appear later.
Put an angle's label inside its wedge, beyond the arc, hidden while the wedge is too narrow.
`K.stage` fits the pair in `max` px (600) on a phone; `beside: false` keeps it stacked.

Draw the mechanism as it physically works. If the explanation gives a reason (X because Y), draw
Y so Dan can watch it; parts that fit are drawn fitting (teeth in teeth), never two identical
icons joined by a line; whatever the rule says happens (slides, grips, multiplies) happens on screen.

## Colour
Colour carries meaning. Use these roles as `var(--k-…)` or `K.color('fill2')` (`K.color('accent2',
0.3)` is see-through); a colour name fails the test.
- Lines and text: `ink`, `muted` (secondary, comparisons), `accent2` (navy: the main thing,
  controls), `accent` (teal: small labels, a second series), `warn` (red: warnings and mistakes
  only), `good` (green: "done" only), `amber-line` (amber lines that must stand out).
- Fills: `bg` (page), `panel`, `sunk`, `amber` (note box), `hl` (key-term highlighter), `fill1`
  (area of the main thing), `fill2` (highlighted area, amber), `fill3` (area of a second thing).
- `cat1`-`cat4` (blue, orange, magenta, aqua): telling equal things apart, never meaning; with a
  key or labels; cat1 and cat2 first. A thing with a familiar colour (water, fire) never gets
  another thing's colour: use the nearest role and label it. What is still there stays solid:
  mark a state such as unused with a label, not by fading it, and key any dashed style.
- Also `--k-line`, `--k-strong` (borders), `--k-on-accent2` (text on navy), `--k-font`, `--k-r` (radius).

Never describe colours by lightness or hue in words Dan reads ("the dark square"): dark mode
changes them.

Classes: `muted`, `small`, `k-label` (small teal caps), `mark` (key term), `note` (amber box),
`warn-note`, `panel`, `row`, `grid2`, `big`, `k-btn` (`secondary`), and a legend:
`<div class="key"><span><i class="swatch" style="background:var(--k-accent2)"></i>Your push</span>
<span><i class="swatch line dash" style="color:var(--k-muted)"></i>The limit</span></div>`.

## Rules for a great interactive
- One idea. The answer to Dan's prediction shows within about 3 seconds of his first move (add
  a K.check that it does). Include something Dan causes and a case that surprises. One or two
  controls, three at most.
- Phone first: nothing wider than 340 px, no fixed widths over 300 px, rows wrap, no hover-only
  information, tap targets at least 44 px. Size tiles and grid columns in rem (`minmax(6rem,
  1fr)`): text grows a quarter at Text size XL, and no word may split across two lines.
- Every number shown is a control, computed by the rule shown, a constant from the lesson, an
  example value named once in the lead, or a date from the lesson. Never invent data, rates or chances.
- The `.say` sentence describes what is on screen now, plainly and warmly, and reads right at the
  extremes ("none of the 100"). Never claim Dan did something ("When you slid it to 20"):
  describe the state, or write conditionally ("Push it past 20 and…").
- 3-5 `K.check` known answers worked out by hand: an edge case, a shape fact (rises, halves,
  always last), and one answer from outside your formula. `source` may ONLY be a URL from the
  lesson's own sources, and only on a check whose label restates what that source's quote says;
  a result of your rule, or a fact about your drawing, takes none. Compare numbers with
  `K.near(a, b, tol)`: tolerance about a millionth of the size, a thousandth where rounding meets roots.
- `K.anim` for motion, never timers: soft, unhurried, nothing popping in. Parts arrive about 0.6
  s apart by `K.fade(el, K.arrive(T, t0))`; travel and growth use `K.ease`; a demonstration takes
  3-5 s. No `vh` units, `position: fixed` or `height: 100%`.
- Ideas without numbers (mechanism, process, structure, history, concept): prefer a timeline
  slider, a named choice, a sorter or a drag; use `K.stepper` only when every step changes the
  drawing. Checks assert order and structure facts.
- A timeline runs forward: a slider rising left to right, its `fmt` showing the date (−500 as
  "500 BC"), or a stepper of named events in order. A lesson's calendar-year control keeps its
  range, its `fmt` showing the year; years after the first date are for new controls. Each dated
  event appears as he reaches its date.

## The self-test
Before Dan sees it, the app loads your body 340, 720 and 1040 px wide, runs every check, moves
every control, button, animation and drag, reveals the after-move parts, and looks again at Text
size XL and in the other theme. It fails on an exception, NaN or undefined on the page, an update
over 150 ms, sideways overflow, text cut off or over other text, SVG text under 11 px on a phone,
a line or arrowhead through a label, text under 3:1 contrast with what is behind it, a colour
name, a blank hole until a move, or no `K.ready()`.

## Example
```html
<p class="lead">Lengthen the string and watch each swing take longer.</p>
<div id="plot"></div>
<div class="k-controls" id="controls"></div>
<p class="say" id="say"></p>
<div class="k-readouts" id="outs"></div>
<p class="caption">Small swings only; g = 9.81 m/s² is gravity at the Earth's surface.</p>
<script>
  const g = 9.81;
  const period = (L) => 2 * Math.PI * Math.sqrt(L / g);
  K.control({ id: 'L', label: 'String length', min: 0.1, max: 3, step: 0.05, value: 1, unit: 'm', snap: [2], into: '#controls' });
  K.stage('#plot', '#controls');
  K.readout({ id: 'T', label: 'One full swing takes', unit: 's', decimals: 2, into: '#outs' });
  const plot = K.plot('#plot', { x: { min: 0, max: 3, label: 'Length (m)' }, y: { min: 0, max: 4, label: 'Period (s)' } });
  K.model((p) => ({ T: period(p.L) }));
  K.update((p, o) => {
    plot.draw({ series: [{ fn: period }], marks: [{ x: p.L, y: o.T, guides: true }] });
    document.getElementById('say').textContent = !K.moved ? 'Make the string four times longer: how much longer is each swing?'
      : 'A ' + K.fmt(p.L, { decimals: 2 }) + ' m string swings there and back every ' + K.fmt(o.T, { decimals: 2 }) + ' s. Four times the length only doubles that.';
  });
  K.check('No length, no swing time', () => K.near(period(0), 0));
  K.check('A seconds pendulum (2 s per swing) is 0.994 m long', () => K.near(period(0.994), 2, 0.002),
    { source: 'https://en.wikipedia.org/wiki/Seconds_pendulum' });
  K.check('Four times the length doubles the period', () => K.near(K.at({ L: 2 }).T / K.at({ L: 0.5 }).T, 2, 1e-9));
  K.ready();
</script>
```
