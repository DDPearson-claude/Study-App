# My University: architecture and contracts

This is the build contract for the app. Product intent lives in the Design Brief v2
(Claude Doc); this file is what code must agree on.

## 1. Shape of the system

One pinned, private claude.ai artifact (`dist/my-university.html`, built from `app/`).
Everything happens inside it:

| Job | Where | How |
| --- | --- | --- |
| Plan a topic, write lessons, build interactives, tutor, grade | In the page | `sample` (Claude, on Dan's usage) |
| Live research with real sources | In the page | `mcp` connector "Parallel Search" (`web_search`, `web_fetch`) passed to `sample` as tools. Optional: the app works without it and labels content "not yet source-checked" |
| Run interactives safely | In the page | `<iframe sandbox="allow-scripts" srcdoc>` + the house kit (`app/kit`) |
| Remember everything | In the page | `db` (+ `user` for the private subtree) |
| Build, test, audit the app | Claude Code (this repo) | Playwright + the runtime stub in `tools/harness` |

Verified on Dan's Android phone (Claude app, 360×707 @3x): db, user private subtree, sample
(~2.3 s on quick), srcdoc sandboxed iframes, web workers, WebGL2. Not available: blob: iframes,
starting Claude Code sessions from the page (`create_session` is blocked by policy).

## 2. Source layout

```
app/
  src/head.html        <title>, fonts, meta  (first 8 KB scanned for the title)
  src/body.html        static shell markup
  src/css/*.css        concatenated in filename order
  src/js/*.js          concatenated in filename order into one <script>, strict mode
  kit/kit.js kit.css   the in-iframe house kit, inlined into the app as strings
  kit/KIT.md           the kit API, also quoted in generation prompts
  kit/examples/*.html  hand-checked exemplar interactive bodies (prompt anchors + tests)
tools/build.mjs        app/ -> dist/my-university.html
tools/harness/         claude-stub.js (runtime stand-in), helpers for Playwright
tests/                 *.test.mjs (node --test), e2e/*.spec.mjs (Playwright via node)
```

`tools/build.mjs` replaces these placeholders inside JS: `"@@KIT_JS@@"` and `"@@KIT_CSS@@"`
(JSON string literals of the kit files) and `"@@BUILD@@"` (build id: date + short git sha).

## 3. JS conventions

- All files share one global namespace `U` created in `00-core.js`; each file attaches to it.
  No modules, no build-time bundler, no frameworks. Plain DOM.
- Never `innerHTML` with model text. Use `U.h()` (element builder) and `U.rich()` (safe
  markdown subset renderer). Model-written HTML only ever runs inside the sandboxed iframe.
- Every db/sample/mcp call is awaited and errors are surfaced as plain-English toasts.
- No `alert/confirm/prompt` (the viewer blocks them); use `U.confirmSheet()`.
- Respect `prefers-reduced-motion`. Tap targets >= 44 px.

### Core API (`00-core.js`)
```
U.h(tag, attrs?, ...children) -> Element   attrs: {class, style(obj), on:{click..}, dataset, aria-*, ...}
U.rich(text, {terms?, footnotes?}) -> DocumentFragment
    paragraphs split on blank lines; **bold**; *italic*; [[key term]] -> highlighted <mark class="term">;
    [^3] -> footnote button (calls footnotes.onOpen(3)); `code`; no links, no raw HTML.
U.id(prefix) -> short unique id;  U.slug(text) -> url-safe slug (<= 40 chars)
U.today() -> 'YYYY-MM-DD' (local);  U.now() -> ISO string
U.hash(str) -> 32-bit int (stable colours)
U.on(evt, fn) / U.emit(evt, data)      tiny event bus
U.route: U.go('#/t/<tid>'), U.routes.add(pattern, handler)   hash router; patterns like '#/t/:tid/:iid'
U.toast(text, {kind:'info'|'good'|'bad'})
U.sheet({title, body:Element, actions:[{label, kind, onClick}]}) -> {close()}
U.confirmSheet({title, text, confirm, danger}) -> Promise<boolean>
U.focusMode(on)   hides the tab bar (lessons, reviews)
```

### Runtime (`10-runtime.js`)
```
U.rt.ready -> Promise; resolves once every capability has answered (or 10 s passed)
U.rt.db, U.rt.user, U.rt.sample, U.rt.mcp, U.rt.downloads, U.rt.uid   (null when absent)
U.rt.has(name) -> boolean
U.ask(input, {tier:'quick'|'default'|'complex', onText, signal, tools, json:true|false, schema?})
    -> Promise<string|object>. json:true parses the first JSON object/array in the reply
    (strips fences). If `schema` (a validator fn returning [] or a list of problems) finds
    problems, re-asks ONCE with the problems listed. Rejects {code, message}.
U.research.available() -> Promise<boolean>   Parallel Search connected + callable
U.research.tools() -> sample tool definitions [{name:'web_search'...},{name:'web_fetch'...}]
    built from describeTool schemas at runtime, with results trimmed to fit (search 12 KB, fetch 20 KB/page)
```

### Store (`20-store.js`)
All paths below; `uid` = awaited `user.id()`.
```
U.store.topics.watch(fn) -> unsubscribe            fn(list of topic docs, newest first)
U.store.topic.get(tid) / .watch(tid, fn) / .create(data) / .update(tid, patch)
U.store.lesson.get(tid, iid) / .watch(tid, iid, fn) / .set(tid, iid, data) / .update(tid, iid, patch)
U.store.research.get(tid, key) / .set(tid, key, data)
U.store.progress.get(tid) / .watch(tid, fn) / .patch(tid, patch)        private
U.store.cards.get(tid) / .all() -> {tid: cardsDoc} / .patch(tid, patch)   private
U.store.profile.get() / .watch(fn) / .patch(patch)                          private
```
Writes to one document are serialised (a per-path promise chain) and coalesced; never
written from render or snapshot callbacks.

## 4. Data model

Shared content (the artifact is private, so "shared" means Dan's devices):

`topics/{tid}`
```
{ id, title, query, createdAt, updatedAt, status: 'planning'|'ready'|'failed',
  hook, oneBreath, level: 'new'|'some'|'solid',
  ideas: [{ id:'i1', title, oneLine, deps:['i0'...], kind:'mechanism'|'quantity'|'process'|'structure'|'history'|'concept'|'skill' }],
  calibration: [{ id, q, options:[str], answer:int, why }],
  research: { status:'none'|'running'|'done'|'unavailable'|'failed', at, sources:int },
  hue: int }                                   // 0-359 from U.hash(title)
```
`topics/{tid}/lessons/{iid}`
```
{ status: 'writing'|'building'|'ready'|'failed', error?, updatedAt,
  lesson: Lesson, interactive: { html, title, brief, selftest: Report, attempts:int } | null,
  sourced: boolean, verified?: { status:'pass'|'fail', notes, at } }
```
`topics/{tid}/research/{key}`  key = 'topic' or an idea id: `{ notes:[{claim, sourceIds:[n]}], sources:[Source] }`

Private (`data/users/{uid}/...`):

`data/users/{uid}/profile` (doc)
```
{ prefs:{ size:'s'|'m'|'l'|'xl', easy:bool, theme:'system'|'light'|'dark', cap:15, light:false },
  days:{ 'YYYY-MM-DD': minutes }, createdAt }
```
`data/users/{uid}/profile/progress/{tid}` (doc per topic)
```
{ updatedAt, lastIdea, calibration:{[qid]: answerIndex},
  ideas:{ [iid]: { stage:'predict'|'play'|'explain'|'say'|'checks'|'done', startedAt, doneAt,
                    predict:{ answer, at }, say:[{ text, at, verdict:'got-it'|'partly'|'not-yet', met:[bool] }],
                    checks:{ [checkId]:{ correct:bool, at } }, known?:bool } } }
```
`data/users/{uid}/profile/cards/{tid}` (doc per topic, all of that topic's review cards)
```
{ cards: { [cardId]: Card } }
Card = { id, tid, iid, type, spec, createdAt, s:{ due:'YYYY-MM-DD', stability, difficulty, reps, lapses, last }, hist:[{ at, grade:1-4, ok:bool }] }
```

## 5. Lesson JSON (what generation writes, what the player plays)

```
Lesson = {
  iid, title,
  predict: { q, options?:[str] (2-4, optional), reveal },   // reveal: 1-2 sentences shown after play
  interactive: {                                // the brief that drives the HTML build
    brief: 'The one thing you should see is ___ when you ___',
    title, controls:[{ id, label, min, max, step, value, unit }],
    whatAmILookingAt,                            // the rule/equation in plain words
    ignores,                                     // what this model leaves out (honesty panel)
    numbers:[{ label, value, kind:'control'|'computed'|'constant', source?:n }]
  } | null,                                      // null only for ideas with nothing to manipulate
  explain: { text },                             // <= 170 words, U.rich syntax, [[terms]], [^n] cites
  analogy?: { text, breaks },                    // where the analogy fails
  say: { prompt, rubric:[2-3 short points], model },
  checks: [Check (2-3)],
  sources: [Source],                             // n starts at 1, matches [^n]
  confidence: 'settled'|'contested'|'simplified',
  contested?: { views:[{ label, text }] }        // when contested: teach both
}
Source = { n, title, url, quote }                // quote: <= 30 words copied from the page
Check =
  { id, type:'choice', q, options:[str], answer:int, why, misconception?:{ [optionIndex]: str } }
| { id, type:'order', q, items:[str] (in the correct order; the player shuffles), why }
| { id, type:'estimate', q, min, max, answer, tolerance, unit, log?:bool, why }
| { id, type:'target', q, control:'<control id>', output:'<readout id>', target, tolerance, why }
    // graded by the interactive's own model through the kit bridge
```

Review cards are made only from things Dan actually answered: each completed check becomes a
card of the same type; his say-it-back answer becomes a `recall` card
`{ type:'recall', spec:{ prompt, rubric, model, mine } }`.

## 6. The interactive kit (in-iframe)

The app builds `srcdoc = '<!doctype html><style>' + KIT_CSS + '</style><script>' + KIT_JS +
'</script>' + body`. The model writes only `body` (HTML + one inline `<script>`). Full API
in `app/kit/KIT.md`; summary:

```
K.theme                         {dark, c:{bg, panel, ink, muted, line, accent, accent2, warn, good}}
K.control({id, label, min, max, step, value, unit, fmt?}) -> {el, get(), set(v)}  big slider
K.readout({id, label, unit, fmt?}) -> {el, set(v)}           live value display, NaN-guarded
K.plot(el, {x:{min,max,label,log?}, y:{min,max,label}, series:[{fn|points, label?}], marks:[{x,y,label}]}) -> {draw(opts)}
K.model(fn)                     the pure model: params object -> outputs object
K.update(fn)                    called with (params, outputs) whenever a control changes; draw here
K.check(label, fn, {source?})   known-answer assertion, fn() -> boolean
K.ready()                       call once after first draw
```
Host <-> kit messages (`postMessage`, every message has `src:'kit'`):
`{type:'height', px}`, `{type:'ready', checks:[{label, ok}]}`, `{type:'error', message}`,
host sends `{type:'selftest'}` -> kit replies `{type:'report', report}` where
`Report = { ok, errors:[], overflow:bool, checks:[{label, ok, source?}], sweep:{ ok, problems:[] }, controls:[ids], readouts:[ids] }`;
host sends `{type:'get'}` -> `{type:'state', params, outputs}`; `{type:'set', id, value}`.

A lesson's interactive is shown only after a self-test with `ok:true`. A failing test triggers
up to two repair calls that include the report; after that the lesson shows without the
interactive and says so.

## 7. Generation (in the page)

`app/src/js/30-prompts.js` owns every prompt and validator. Pipelines in `31-generate.js`:

1. `planTopic(query, profile)` quick tier -> topic fields (hook, oneBreath, ideas 5-8, calibration 2).
   Shown as soon as it returns. Ideas Dan already holds (from other topics) may be marked known.
2. `researchTopic(tid)` default tier with research tools (if available), runs in the background
   right after planning: sources + per-idea claim notes into `research/*`.
3. `writeLesson(tid, iid)` default tier, uses the research notes when present; JSON per section 5.
4. `buildInteractive(tid, iid)` complex tier writes the kit body; self-test in a hidden sandbox;
   up to two repairs.
5. `grade(say, answer)` default tier -> `{ met:[bool], verdict, nailed, followUp }`.
   First miss never reveals the model answer; the second shows it.
6. `tutor(messages, context)` default tier, with research tools when available.

Prefetch: opening idea N starts writing idea N+1 in the background.

## 8. Review scheduling

FSRS-lite in `40-fsrs.js`: grades 1-4 (Again, Hard, Good, Easy); new cards first due tomorrow;
target retention 0.9; daily cap from prefs (default 15, light day 5). Objective cards are graded
automatically (wrong = Again, right = Good, right and fast = Easy); recall cards are graded by
Claude in the background while the next card shows, and Dan can override. Two lapses on one
idea surface a "Learn it again" button that rebuilds that idea's lesson with a different interactive.
Strength bands for the Map: new, fragile, growing, strong (never percentages).

## 9. Module APIs (cross-file contract)

Every prompt string starts with a first line `TASK: <name>` (plan-topic, research, write-lesson,
build-interactive, repair-interactive, grade, tutor) so tests can route canned replies.
Prompt builders are pure functions (no DOM at load) so `node` can load them for evals.

`32-sandbox.js` (kit host)
```
U.KIT_JS, U.KIT_CSS                      strings (build placeholders)
U.sandbox.srcdoc(body, {theme}) -> string
U.sandbox.mount(container, {html, title, onReady(checks), onError(msg), minHeight}) ->
   { frame, ready: Promise<checks>, selftest(): Promise<Report>, get(): Promise<{params, outputs}>,
     set(id, value): Promise, destroy() }
U.sandbox.test(html, {widths:[340, 720], timeout:8000}) -> Promise<Report>   hidden, merged report
U.sandbox.theme() -> {dark, c:{...}}     current app palette for the kit
```
`33-interactive.js`
```
U.interactive.prompt(topic, idea, lesson, {avoid?:brief}) -> string        TASK: build-interactive
U.interactive.repairPrompt(topic, idea, lesson, html, report) -> string    TASK: repair-interactive
U.interactive.extract(text) -> body string (strips fences / doctype / outer html+head+body)
U.interactive.build(topic, idea, lesson, {onStatus, avoid}) -> Promise<{html, title, brief, selftest, attempts} | null>
```
`30-prompts.js` + `31-generate.js`
```
U.prompts.planTopic(query, {level, known:[{title, topic}]}) -> string     TASK: plan-topic
U.prompts.research(topic, {ideas}) -> string                              TASK: research
U.prompts.writeLesson(topic, idea, {research, known, avoid}) -> string    TASK: write-lesson
U.prompts.grade(say, answer, {attempt}) -> string                         TASK: grade
U.prompts.tutor(context) -> string (system-style preamble)                TASK: tutor
U.validate.plan(obj) / .lesson(obj) / .grade(obj) / .research(obj) -> [problems]
U.gen.createTopic(query, {level}) -> Promise<tid>    writes topics/{tid} (status planning), plans, then
     starts research (background) and prefetches the first lesson
U.gen.ensureLesson(tid, iid, {onStatus(text)}) -> Promise<lessonDoc>   dedupes in-flight work,
     takes over a stale 'writing'/'building' doc after 4 minutes
U.gen.relearn(tid, iid) -> Promise<lessonDoc>        rebuilds with a different interactive
U.gen.grade(say, answer, attempt) -> Promise<{met:[bool], verdict, nailed, followUp}>
U.gen.tutor(messages, context, {onText}) -> Promise<string>
U.gen.status(tid) -> {planning, research, lessons:{iid: status}}   (derived, for UI)
```
`40-fsrs.js`, `41-cards.js`, `60-today.js`
```
U.fsrs.init(day) -> s;  U.fsrs.review(s, grade, day) -> s';  U.fsrs.retrievability(s, day) -> 0..1
U.fsrs.band(s, day) -> 'new'|'fragile'|'growing'|'strong'
U.cards.render(card, {mode:'lesson'|'review', lesson?, onDone(result)}) -> Element
     result = {correct:bool|null, grade:1-4|null, answer, ms}
U.review.addFromLesson(tid, iid, lesson, outcome) -> Promise   outcome = {checks:{id:{correct}}, say:{text, verdict}}
U.review.queue({cap, light}) -> Promise<[card]>      due today, interleaved
U.review.dueCount() -> Promise<number>;  U.review.refreshBadge()
U.review.ideaBands() -> Promise<{tid:{iid: band}}>
```
Views: `50-lesson.js` (`#/t/:tid/:iid`), `51-tutor.js` (`U.tutor.open(context)`),
`70-learn.js` (`#/`), `71-topic.js` (`#/t/:tid`), `72-map.js`, `73-book.js`, `74-settings.js`
(`U.settings.open()`), `99-boot.js` (starts everything after `U.rt.ready`).

## 10. Navigation

Hash routes: `#/` Learn, `#/t/:tid` topic, `#/t/:tid/:iid` lesson (focus mode), `#/today`,
`#/review` (focus mode), `#/map`, `#/book`. Phone: bottom tab bar Learn / Today / Map / Book.
Desktop: the same tabs across the top, 720 px reading column.
