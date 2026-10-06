# The house kit

You write the BODY of one page: HTML, an optional `<style>`, then one inline `<script>` ending
with `K.ready()`. It runs in a sandboxed iframe on Dan's phone (about 340 px wide, touch) and
laptop (about 1000 px), with the global `K` and a calm light and dark stylesheet. No network or
storage: no web addresses, `fetch`, `localStorage`, `alert` or `prompt`.

## Page shape that works
1. `<p class="lead">`: one short line telling Dan what to do. The app shows the title; don't repeat it.
2. The main visual with its controls right under it: `K.stage('#scene', '#controls')` keeps the
   pair on one phone screen. A choice that re-sorts the picture may sit above it.
3. Readouts in `<div class="k-readouts">`, then `<p class="say">`: one sentence that changes with the state.
4. Secondary figures and anything that grows go below.
5. `<p class="caption">`: at most two short sentences (the rule, where constants come from). The
   app shows what the model leaves out.

## Keep the answer hidden until Dan moves
Dan predicts before he plays, so the opening screen must not answer it. Open on a setting it is
not about, and hide whatever gives the answer away until his first move:
- class `k-after-move` on any element (a mark, an arrow, a sentence): hidden, its space kept.
  Hide the answer (a line, a mark), not the controls or a whole figure (a blank hole).
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
options; `value` is an option's value or its 0-based index (with options '1', '2', '4', a number
is the index); `params[id]` is the chosen value. `stepper` walks a process with Back / Next (the
value is the step index; `compact: true` when your diagram shows the content). `button` is an
action (Shout, Clear): use it, not plain buttons, so the self-test presses it.

## Outputs
```
K.readout({id, label, unit?, prefix?, decimals?, fmt?, big?, hint?, afterMove?, into}) -> {el, set(v), get(), text()}
```
Use one rounding everywhere a number appears: give `decimals` to match the lesson text, and
build the `.say` sentence with `K.fmt(v, {decimals})` or `readout.text()`. Without it, whole
numbers stay whole, 100 and over round to whole, others keep 3 significant figures (2.50, 12.3).
Labels under 30 characters.
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
K.anim({step(dt, t), reset?, label?, autoplay?, button?, into}) -> {el, play, pause, toggle, reset, playing()}
```
`anim` adds a Play button (text `label`; `button: false` when your own control calls `play()`
and `pause()`); `reset` adds Reset. In `step` advance your state (`dt` in seconds) and redraw;
return `false` to stop. To drive a slider, keep the exact value yourself
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
```
K.sound.tone(hz, {dur?, type?, gain?})   K.sound.chord([hz, ...], {dur?, stagger?})   K.sound.stop()   K.sound.mute(on)
K.sound.hold(hz, {type?, gain?, max?}) -> {set({hz?, gain?}), stop(), playing()}
```
`dur` in seconds (default 1, at most 10); `hz` 20 to 20,000; `type` 'sine', 'triangle', 'square'
or 'sawtooth'. It is quiet and plays only after Dan presses something: call it from a `K.button`,
never `K.update`; show what is sounding. `hold` keeps a tone going (up to `max` seconds, default
20) while `set()` follows a slider. Phone speakers can't play below about 150 Hz: use 200 to
2,000 Hz for anything Dan must hear, and say so when the real sound is lower.
```js
K.button({ label: 'Hear the chord', into: '#controls', press: () => K.sound.chord([261.63, 329.63, 392.0], { dur: 1.5 }) });
```

## Drawings and helpers
```
K.el(tag, attrs?, ...children)    attrs: class, style, on: {click: fn}, text, html, dataset, any attribute
K.svg(tag, attrs?, ...children)   the same in the SVG namespace
K.labels(group, [{x, y, text, anchor?, class?, color?}]) -> [<text>]
K.stage(visual, controls, {max?, beside?}) -> {el}
K.fmt(v, {decimals?, sig?, prefix?, unit?, percent?, sign?, compact?}) -> '1,234.5', '−3', '2.5 × 10⁶'
K.near(a, b, tol)   K.clamp(v, lo, hi)   K.lerp(a, b, t)   K.linspace(a, b, n)   K.color(role, alpha?)
```
Give an `<svg>` a viewBox about 340 wide, `width="100%"`, text 11-14 units, `role="img"` and an
`aria-label` that follows the state; on desktop the kit centres and caps it. `K.labels` places
labels in a `<g>` (viewBox units), nudging each off other text and inside the drawing: use it for
labels that move. `K.stage` joins the visual and its controls: at most 600 px tall on a phone,
side by side on a laptop (`beside: false` stacks them).

## Colour
Colour carries meaning. Use these roles as `var(--k-…)` or `K.color('fill2')` (either works
anywhere; `K.color('accent2', 0.3)` is see-through); never hard-code colours or colour names.
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
term), `note` (amber box), `warn-note`, `panel`, `row`, `grid2`, `big`, `k-btn` (`secondary`),
`k-controls`, `k-readouts`, `k-after-move`, and a legend:
`<div class="key"><span><i class="swatch" style="background:var(--k-accent2)"></i>First hum</span></div>`.
SVG text that crosses lines gets a thin page-coloured halo by itself (`k-nohalo` turns it off).

## Rules for a great interactive
- One idea, visible within ten seconds of play. One or two controls, three at most.
- Phone first: nothing wider than 340 px, no fixed widths over 300 px, rows wrap, no hover-only
  information, tap targets at least 44 px.
- Text grows with Dan's Text size (a quarter bigger at XL). Size tiles and grid columns in rem
  (`minmax(6rem, 1fr)`), so they reflow and no word splits across two lines.
- Every number shown is a control, computed by the rule shown, a constant from the lesson, an
  assumed value shown as "for example", or a date from the lesson. Never invent data, rates or chances.
- The `.say` sentence describes what is on screen now, plainly and warmly, and reads right at the
  extremes ("none of the 100", not "0 of the 100"). Never claim Dan did something ("When you
  slid it to 20"); describe the state, or write conditionally ("Push it past 20 and…").
- 3-5 `K.check` known answers worked out by hand: an edge case, a shape fact (rises, halves,
  always last), and at least one answer from outside your formula (a worked example or a value
  from the lesson's sources). `source` may ONLY be a URL from the lesson's own sources; if it has
  none, omit `source`. Never cite from memory. Compare numbers with `K.near(a, b, tol)`: tolerance
  about a millionth of the size for exact rules, a thousandth where square roots or small steps
  meet rounding.
- `K.anim` for motion, never endless timers.
- No `vh` units, `position: fixed` or `height: 100%` (the frame grows to fit you).
- Ideas without numbers (mechanism, process, structure, history, concept) use `K.stepper`, `K.choice`, a
  timeline slider or a sorter with an HTML or SVG diagram; checks assert order and structure facts.

## The self-test
Before Dan sees it, the app loads your body 340, 720 and 1040 px wide, runs every check, sets each
control to five values (every option of a choice), reveals the after-move parts, presses every
`K.button`, plays every `K.anim`, and sweeps again at Text size XL.
It fails on an exception, NaN, Infinity or undefined anywhere on the page, a list or object
output, an update over 150 ms, sound from `K.update`, sideways overflow, text cut off at any of
those settings (hidden overflow, an ellipsis, a word split across two lines, SVG text outside its
drawing or over another label), a control not on the page, none in view at the start, a `K.anim`
without `into`, or no `K.ready()`. It warns when the first control sits over a phone screen below the main figure.

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
  // Only because this lesson cites this page; with no sources, keep the check and drop source.
  K.check('A seconds pendulum (2 s per swing) is 0.994 m long', () => K.near(period(0.994), 2, 0.002),
    { source: 'https://en.wikipedia.org/wiki/Seconds_pendulum' });
  K.check('Four times the length doubles the period', () => K.near(K.at({ L: 2 }).T / K.at({ L: 0.5 }).T, 2, 1e-9));
  K.ready();
</script>
```
