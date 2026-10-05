# The house kit

You write the BODY of one page: HTML, an optional `<style>`, then one inline `<script>` ending
with `K.ready()`. It runs in a sandboxed iframe on Dan's Android phone (about 340 px wide, touch)
and on desktop (about 640 px), with the global `K` and a calm stylesheet for light and dark. No
network or storage: web addresses are blocked; no `fetch`, `localStorage`, `alert` or `prompt`.

## Page shape that works
1. `<p class="lead">`: one short line telling Dan what to do. The app shows the title; don't repeat it.
2. The main visual with its controls right under it: `K.stage('#scene', '#controls')` keeps the
   pair on one phone screen. A choice that re-sorts the picture may sit above it.
3. Readouts in `<div class="k-readouts">`, then `<p class="say">`: one sentence that changes with the state.
4. Secondary figures and anything that grows go below.
5. `<p class="caption">`: at most two short sentences (the rule, where constants come from). The
   app shows what the model leaves out in its own panel.

## Keep the answer hidden until Dan moves
Dan predicts before he plays, so the opening screen must not answer the prediction. Open on a
setting it is not about, and hide whatever gives the answer away until he first moves something:
- class `k-after-move` on any element (a mark, an arrow, a sentence): hidden, its space kept.
- `K.readout({..., afterMove: true})`: shows "?" until then.
- `K.moved` is true from then on: in `K.update`, write `K.moved ? answer : question`.
- `K.afterMove(fn)` runs `fn` once at that moment; `K.reveal()` marks it from your own handlers (a drag).

## The pipeline
Controls register themselves; their values form `params` = `{id: value}`.
```
K.model(fn)        fn(params) -> outputs {name: number | string}. Pure: no DOM, no lists or objects.
K.update(fn)       fn(params, outputs): draw everything here. More than one is allowed.
K.at(over)         -> outputs of the model at those params (others take each control's starting value)
K.check(label, fn, {source?})   fn() must return exactly true
K.ready()          call once, last: draws the opening state, runs the checks, tells the app
K.params()  K.outputs()  K.refresh()   (refresh reruns the pipeline after you change your own state)
```
A readout whose id is an output key updates itself.

## Controls
Every control takes `into` (a selector or element). Ids are unique; use the lesson's ids exactly.
```
K.control({id, label, min, max, step, value, unit?, prefix?, fmt?, log?, hint?, into}) -> {el, get(), set(v)}
K.choice({id, label, options: [value | {value, label}], value, hint?, into}) -> {el, get, set}
K.toggle({id, label, value: false, hint?, into}) -> {el, get, set}
K.stepper({id, steps: [title | {title, text}], value: 0, compact?, label?, into}) -> {el, get, set, setSteps(list)}
K.button({label, press, secondary?, into}) -> {el, press(), setLabel(text)}
```
`control` is a big slider with − / + buttons. Keep `unit` short ('s', 'km/h', '%'); `prefix` for
'£'; `fmt(v)` returns the whole text; `log: true` spans decades. `choice` is 2-8 short named
options; `value` is an option's value or its 0-based index (as lesson controls with `options`
give it); `params[id]` is the chosen value. `stepper` walks a process with Back / Next (value =
step index; `compact: true` when your diagram shows the content). `button` is an action (Shout,
Clear): use it, not plain buttons, so the self-test presses it.

## Outputs
```
K.readout({id, label, unit?, prefix?, decimals?, fmt?, big?, hint?, afterMove?, into}) -> {el, set(v), get(), text()}
```
Use one rounding everywhere a number appears: give `decimals` to match the lesson text, and
build the `.say` sentence with `K.fmt(v, {decimals})` or `readout.text()`. Without it, whole
numbers stay whole, 100 and over round to whole numbers, others keep 3 significant figures
(2.50, 12.3). Labels under 30 characters. NaN and Infinity fail.
```
K.plot(target, opts) -> {draw(opts), x(v), y(v), invert(px, py), el, canvas}
```
- `x`, `y`: `{min, max, label, log?, prefix?, unit?, fmt?, ticks?}`. Leave out `y.min`/`y.max` to fit the data.
- `series`: `[{fn: x => y | points: [[x, y], ...], label?, color?, dash?, width?, fill?, dots?, gaps?}]`
- `shade`: `[{between: [a, b], label?, color?, x0?, x1?}]`: fills the gap between two series (by
  label), a series and a constant (a number), or two functions. Amber unless `color` is given.
- `marks`: `[{x, y, label?, color?, guides?}]`: a dot with a label pill; `guides` adds dashed lines to the axes.
- `regions`: `[{x0, x1, label?} | {y0, y1, label?}]` (a band); `lines`: `[{x | y, label?}]` (a dashed line).
- `label`: the text alternative; `height`; `after(ctx, plot)` draws extras using `plot.x()`, `plot.y()`.

`draw(opts)` redraws with `opts` over the creation options: call it in `K.update`. Values must be
finite (`gaps: true` only where a gap is real). Labels avoid lines and each other; one with no
room is left out. A quantity that jumps (counts) reads better as `dots: true` or bars. Series
are navy, then teal; `color: 'muted', dash: true` for a baseline.
```
K.bars(target, {max?, unit?, prefix?, decimals?, fmt?}) -> {draw(items)}      items: [{label, value, color?}], values >= 0
K.anim({step(dt, t), reset?, label?, autoplay?, into}) -> {el, play, pause, toggle, reset, playing()}
```
`anim` adds a Play button (text `label`); `reset` adds Reset. In `step` advance your state (`dt`
in seconds) and redraw; return `false` to stop. To drive a slider, keep the exact value yourself
(the slider moves in whole steps):
```js
let exact = null;
K.anim({ label: 'Play', into: '#controls', step: (dt) => {
  const from = exact !== null && Math.abs(exact - pos.get()) < 1 ? exact : pos.get(); // a drag takes over
  exact = (from + dt * 5) % 100;
  pos.set(exact);   // reruns the pipeline; draw from `exact`
} });
```

## Sound
For sound or music, let Dan hear it:
```
K.sound.tone(hz, {dur?, type?, gain?})   K.sound.chord([hz, ...], {dur?, stagger?})   K.sound.stop()   K.sound.mute(on)
```
`dur` in seconds (default 1, at most 10); `hz` 20 to 20,000; `type` 'sine', 'triangle', 'square'
or 'sawtooth'. It is quiet and plays only after Dan presses something: call it from a `K.button`,
and show what is sounding on screen.
```js
K.button({ label: 'Hear the chord', into: '#controls', press: () => K.sound.chord([261.63, 329.63, 392.0], { dur: 1.5 }) });
```

## Drawings and helpers
```
K.el(tag, attrs?, ...children)    attrs: class, style, on: {click: fn}, text, html, dataset, any attribute
K.svg(tag, attrs?, ...children)   the same in the SVG namespace
K.labels(group, [{x, y, text, anchor?, class?, color?}]) -> [<text>]
K.stage(visual, controls, {max?}) -> {el}
K.fmt(v, {decimals?, sig?, prefix?, unit?, percent?, sign?, compact?}) -> '1,234.5', '−3', '2.5 × 10⁶'
K.near(a, b, tol)   K.clamp(v, lo, hi)   K.lerp(a, b, t)   K.linspace(a, b, n)   K.color(role, alpha?)
```
Give an `<svg>` a viewBox about 340 wide, `width="100%"`, text 11-14 units, `role="img"` and an
`aria-label` that follows the state; on desktop the kit centres and caps it (600 px, 1.45 × the
viewBox) so text stays a sensible size. `K.labels` places labels in a `<g>` (viewBox units),
nudging each off other text and inside the drawing: use it for labels that move. `K.stage` joins
the visual and its controls, shrinking the visual on a phone so the pair fits 600 px.

## Colour
Colour carries meaning. Use these roles as `var(--k-…)` or `K.color('fill2')`
(`K.color('accent2', 0.3)` is see-through); never hard-code colours.
- Lines and text: `ink`, `muted` (secondary text, comparisons), `accent2` (navy: the main thing,
  controls), `accent` (teal: small labels, a second series), `warn` (red: warnings and mistakes
  only), `good` (green: "done" only), `amber-line` (amber lines or markers that must stand out).
- Fills: `bg` (page), `panel`, `sunk`, `amber` (note box), `hl` (key-term highlighter), `fill1`
  (area of the main thing), `fill2` (highlighted area, amber), `fill3` (area of a second thing).
- `cat1`-`cat4` (blue, orange, magenta, aqua): telling equal things apart (two poles, three
  families), never meaning; always with a key or labels; cat1 and cat2 first.
- Also `--k-line`, `--k-strong` (borders), `--k-on-accent2` (text on navy), `--k-font`, `--k-r` (radius).

Never describe colours by lightness or hue in words Dan reads ("the dark square"): dark mode
changes them. Name the thing, or use a key.

Classes: `lead`, `say`, `caption`, `muted`, `small`, `k-label` (small teal caps), `mark` (key
term), `note` (amber box), `warn-note`, `panel`, `row`, `grid2`, `big`, `key` with `swatch` (a
legend), `k-btn` (`secondary`), `k-controls`, `k-readouts`, `k-after-move`.

## Rules for a great interactive
- One idea, visible within ten seconds of play. One or two controls, three at most.
- Phone first: nothing wider than 340 px, no fixed widths over 300 px, rows wrap, no hover-only
  information, tap targets at least 44 px.
- Every number shown is a control, computed by the rule shown, a constant from the lesson, an
  assumed value shown as "for example", or a date from the lesson. Never invent data, rates or chances.
- The `.say` sentence describes what is on screen now, plainly and warmly, and reads right at the
  extremes ("none of the 100", not "0 of the 100"). Never claim Dan did something ("When you
  slid it to 20"); describe the state, or write conditionally ("Push it past 20 and…").
- 3-5 `K.check` known answers worked out by hand: an edge case, a shape fact (rises, halves,
  always last), and at least one answer from outside your formula (a worked example, an everyday
  case, a value from the lesson's sources). `source` may ONLY be a URL from the lesson's own
  sources; if it has none, omit `source`. Never cite from memory.
- Ids that lesson checks use must exist.
- Each update well under 150 ms; `K.anim` for motion, never endless timers.
- No `vh` units, `position: fixed` or `height: 100%` (the frame grows to fit you).
- Ideas without numbers (process, structure, history, concept) use `K.stepper`, `K.choice`, a
  timeline slider or a sorter with an HTML or SVG diagram; checks assert order and structure facts.

## The self-test
Before Dan sees it, the app loads your body at 340 and 720 px wide, runs every check, sets each
control to five values from min to max (every option of a choice), reveals the after-move parts,
presses every `K.button` and plays every `K.anim` for 60 frames. It fails on an exception, NaN or
Infinity, a list or object output, an update over 150 ms, sideways overflow, text cut off at any
of those settings (hidden overflow, an ellipsis, SVG text outside its drawing or over another
label), a control not on the page, or no `K.ready()`. It warns when the first control sits over a
phone screen below the main figure.

## Example
```html
<p class="lead">Lengthen the string and watch each swing take longer.</p>
<div id="plot"></div>
<div class="k-controls" id="controls"></div>
<div class="k-readouts" id="outs"></div>
<p class="say" id="say"></p>
<p class="caption">Small swings: period T = 2π √(L / g), with g = 9.81 m/s².</p>
<script>
  const g = 9.81;
  const period = (L) => 2 * Math.PI * Math.sqrt(L / g);
  K.control({ id: 'L', label: 'String length', min: 0.1, max: 3, step: 0.05, value: 1, unit: 'm', into: '#controls' });
  K.stage('#plot', '#controls');
  K.readout({ id: 'T', label: 'One full swing takes', unit: 's', decimals: 2, into: '#outs' });
  const plot = K.plot('#plot', { x: { min: 0, max: 3, label: 'Length (m)' }, y: { min: 0, max: 4, label: 'Period (s)' } });
  K.model((p) => ({ T: period(p.L) }));
  K.update((p, o) => {
    plot.draw({ series: [{ fn: period }], marks: [{ x: p.L, y: o.T, label: K.fmt(o.T, { decimals: 2 }) + ' s', guides: true }] });
    document.getElementById('say').textContent = !K.moved ? 'Make the string four times longer: how much longer is each swing?'
      : 'A ' + K.fmt(p.L, { decimals: 2 }) + ' m string swings there and back every ' + K.fmt(o.T, { decimals: 2 }) + ' s. Four times the length only doubles that.';
  });
  K.check('No length, no swing time', () => K.near(period(0), 0));
  // This lesson's sources include the seconds-pendulum page; with no sources, keep the check and drop source.
  K.check('A seconds pendulum (2 s per swing) is 0.994 m long', () => K.near(period(0.994), 2, 0.002),
    { source: 'https://en.wikipedia.org/wiki/Seconds_pendulum' });
  K.check('Four times the length doubles the period', () => K.near(K.at({ L: 2 }).T / K.at({ L: 0.5 }).T, 2, 1e-9));
  K.ready();
</script>
```
