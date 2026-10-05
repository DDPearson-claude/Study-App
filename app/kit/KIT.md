# The house kit

You write the BODY of one page: HTML, an optional `<style>`, then one inline `<script>` that ends
with `K.ready()`. It runs in a sandboxed iframe on Dan's Android phone (about 340 px wide, touch)
and on desktop. The kit is already loaded: the global `K`, and a stylesheet that makes plain HTML
calm and roomy (system font, 16 px+, even spacing between top-level blocks, light and dark
colours). There is no network and no storage: no external scripts, fonts or images, no `fetch`,
no `localStorage`, no `alert`/`confirm`/`prompt`.

## Page shape that works
1. One short line telling Dan what to do: `<p class="lead">`. The app shows the title above the frame; don't repeat it.
2. The visual (plot, SVG diagram, bars) first, so his thumb on the controls doesn't cover it.
3. Controls right below it, in `<div class="k-controls" id="controls">`.
4. Readouts in `<div class="k-readouts">`, then one sentence that changes with the state: `<p class="say">`.
5. A small `<p class="caption">`: the rule, where constants come from, and what the model leaves out.

## The pipeline
Controls register themselves; their values form `params` = `{id: value}`.
```
K.model(fn)        fn(params) -> outputs {name: number | string}. Pure: no DOM. Runs on every change.
K.update(fn)       fn(params, outputs): draw everything here. More than one is allowed.
K.at(over)         -> outputs of the model at those params (others take each control's starting value)
K.check(label, fn, {source})   fn() must return exactly true; source = a URL from the lesson's sources
K.ready()          call once, last: draws the opening state, runs the checks, tells the app
K.params()  K.outputs()  K.refresh()   (refresh reruns the pipeline after you change your own state)
```
A readout whose id matches an output key updates itself.

## Controls
Every control takes `into` (a selector or element to append to). Ids are unique; use the lesson's ids exactly.
```
K.control({id, label, min, max, step, value, unit?, prefix?, fmt?, log?, hint?, into}) -> {el, get(), set(v)}
```
A big touch slider with − / + buttons and a live value. `unit` is appended ('%', '°' and ':1' with no
space); `prefix` for '£'; `fmt(v)` returns the whole text instead. `log: true` for ranges that span
decades (needs min > 0). `hint` is one short line under the label.
```
K.choice({id, label, options: [value | {value, label}], value, hint?, into}) -> {el, get, set}
K.toggle({id, label, value: false, hint?, into}) -> {el, get, set}
K.stepper({id, steps: [title | {title, text}], value: 0, compact?, label?, into}) -> {el, get, set, setSteps(list)}
```
`choice` is a row of segmented buttons (2-5 short options). `toggle` is a switch (true/false).
`stepper` walks a process with Back / Next; its value is the 0-based step index. It shows
"Step n of N", the title and text; `compact: true` shows just "Step n of N: title", progress dots
and the buttons, for when your own diagram shows the content. `setSteps` swaps the list (keep it
in K.update when a toggle adds or removes a stage).

## Outputs
```
K.readout({id, label, unit?, prefix?, dp?, fmt?, big?, hint?, into}) -> {el, set(v), get()}
```
Numbers show 3 significant figures with thousands separators, or `dp` decimals. NaN and Infinity
show '—' and fail the self-test. Strings are shown as they are.
```
K.plot(target, opts) -> {draw(opts), x(v), y(v), invert(px, py), el, canvas}
```
`target` is a selector or element; the plot fills its width, about 0.62 × width tall (220-380 px), or `height`.
- `x`, `y`: `{min, max, label, log?, prefix?, unit?, fmt?, ticks?}`. Leave out `y.min`/`y.max` to fit the data (0 is included unless `zero: false`).
- `series`: `[{fn: x => y | points: [[x, y], ...], label?, color?, dash?, width?, fill?, dots?, gaps?}]`
- `marks`: `[{x, y, label?, color?, guides?}]`: a dot with a label pill; `guides` draws dashed lines to the axes.
- `regions`: `[{x0, x1, label?} | {y0, y1, label?}]`: a shaded band, amber unless `color` is given.
- `lines`: `[{x | y, label?}]`: a dashed reference line.
- `label`: the text alternative. `after(ctx, plot)`: draw extra things using `plot.x()` and `plot.y()`.

`draw(opts)` redraws with `opts` layered over the options you created it with: call it in
`K.update`. Every series value must be finite (set `gaps: true` only where a gap is real). Two or
more labelled series get a legend. Colours: the first series is navy, the next teal; use
`color: 'muted', dash: true` for a comparison or baseline.
```
K.bars(target, {max?, unit?, prefix?, fmt?}) -> {draw(items)}      items: [{label, value, color?}], values >= 0
K.anim({step(dt, t), reset?, label?, autoplay?, into}) -> {el, play, pause, toggle, reset, playing()}
```
`anim` adds a Play / Pause button for simulations. In `step` advance your own state (`dt` in
seconds, at most 0.05) and redraw. It never autoplays when Dan prefers reduced motion, and pauses
when the page is hidden.

## Helpers
```
K.el(tag, attrs?, ...children)    attrs: class, style (object or string), on: {click: fn}, text, html, dataset, any attribute
K.svg(tag, attrs?, ...children)   the same in the SVG namespace; give <svg> a viewBox and width "100%"
K.fmt(v, {dp?, sig?, prefix?, unit?, percent?, sign?, compact?}) -> '1,234.5', '−3', '2.5 × 10⁶'
K.near(a, b, tol) -> |a − b| <= tol      K.clamp(v, lo, hi)   K.lerp(a, b, t)   K.linspace(a, b, n)
K.color(name) -> a CSS colour       K.theme = {dark, c: {bg, panel, sunk, ink, muted, line, strong, accent, accent2, onAccent2, warn, good, hl, amber}}
```

## CSS
Classes: `lead`, `say`, `caption`, `muted`, `small`, `k-label` (small teal caps label), `mark`
(amber highlight for a key term), `note` (amber box), `warn-note`, `panel`, `row`, `grid2` (two
columns on wide screens), `big`, `k-btn` (add `secondary` for an outline button),
`k-controls`, `k-readouts`.
Colours as variables, so light and dark both work: `--k-ink`, `--k-muted`, `--k-line`, `--k-bg`,
`--k-panel`, `--k-sunk`, `--k-accent2` (navy), `--k-accent` (teal), `--k-warn` (red), `--k-good`
(green), `--k-hl` (amber). Never hard-code colours. Colour carries meaning: navy for the main
thing and the controls, teal for small labels, red only for warnings or mistakes, green only for
"done", amber to highlight; grey or dashed for a comparison.

## Rules for a great interactive
- One idea. The brief says what Dan should see; make it happen within ten seconds of play.
- One or two controls (three at most). Open in an interesting state, not at zero or the minimum.
- Phone first: nothing wider than 340 px, no fixed widths over 300 px, wrap rows, no hover-only
  information, tap targets at least 44 px. SVG: viewBox plus width 100%.
- Every number on screen is a control, computed from the rule shown, or a constant whose source
  the caption names. Never invent data.
- The `.say` sentence changes with the state and says what it means in plain, warm words.
- Be honest: the caption says what is simplified or left out.
- 3-5 `K.check` known answers worked out by hand: an edge case, at least one value from a
  reference with `{source: 'https://…'}` (one of the lesson's sources), and a shape fact (rises,
  halves, conserves, always last). Each compares against an answer known independently of the
  model's code; never check the formula against itself.
- Lesson checks may read a readout or set a control by id: those ids must exist.
- Accessible: the kit's controls are labelled; give custom SVG or canvas an `aria-label` or `role="img"`
  with a description; custom buttons are `<button>` elements.
- Fast: each update well under 150 ms. Use `K.anim` for motion, never endless timers.
- No `vh` units, `position: fixed` or `height: 100%` on the page (the frame grows to fit you).
- For ideas without numbers (a process, a structure, a history), use `K.stepper`, `K.choice` or
  `K.toggle` with an HTML or SVG diagram; checks assert order and structure facts from the source.

## The self-test
Before Dan sees it, the app loads your body at 340 px and 720 px wide, runs every check, sweeps
each control across five values from min to max (then all at min and all at max), and fails on any
exception, NaN or Infinity in a readout or plot, an update slower than 150 ms, sideways overflow,
a control not on the page, external resources, or `K.ready()` never called.

## Example
```html
<p class="lead">Lengthen the string and watch each swing take longer.</p>
<div id="plot"></div>
<div class="k-controls" id="controls"></div>
<div class="k-readouts" id="outs"></div>
<p class="say" id="say"></p>
<p class="caption">Small swings: period T = 2π √(L / g), with g = 9.81 m/s². Leaves out air drag and wide swings.</p>
<script>
  const g = 9.81;
  const period = (L) => 2 * Math.PI * Math.sqrt(L / g);
  K.control({ id: 'L', label: 'String length', min: 0.1, max: 3, step: 0.05, value: 1, unit: 'm', into: '#controls' });
  K.readout({ id: 'T', label: 'One full swing takes', unit: 's', dp: 2, into: '#outs' });
  const plot = K.plot('#plot', { x: { min: 0, max: 3, label: 'Length (m)' }, y: { min: 0, max: 4, label: 'Period (s)' } });
  K.model((p) => ({ T: period(p.L) }));
  K.update((p, o) => {
    plot.draw({ series: [{ fn: period }], marks: [{ x: p.L, y: o.T, label: o.T.toFixed(2) + ' s', guides: true }] });
    document.getElementById('say').textContent = 'A ' + p.L + ' m string swings there and back once every ' +
      o.T.toFixed(2) + ' s. Making it four times longer only doubles that.';
  });
  K.check('No length, no swing time', () => K.near(period(0), 0));
  K.check('A seconds pendulum (2 s per swing) is 0.994 m long', () => K.near(period(0.994), 2, 0.002),
    { source: 'https://en.wikipedia.org/wiki/Seconds_pendulum' });
  K.check('Four times the length doubles the period', () => K.near(K.at({ L: 2 }).T / K.at({ L: 0.5 }).T, 2, 1e-9));
  K.ready();
</script>
```
