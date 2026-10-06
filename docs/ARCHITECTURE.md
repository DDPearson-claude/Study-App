# My University: architecture and contracts

This is the build contract for the app. Product intent lives in the Design Brief v2
(Claude Doc); this file is what modules must agree on. When code and this file disagree,
fix one of them in the same change.

## 1. Shape of the system

One pinned, private claude.ai artifact (`dist/my-university.html`, built from `app/`).
Everything happens inside it:

| Job | Where | How |
| --- | --- | --- |
| Plan a topic, write lessons, build interactives, tutor, grade | In the page | `sample` (Claude, on Dan's usage) |
| Live research with real sources | In the page | `mcp` connector "Parallel Search" (`web_search`, `web_fetch`) passed to `sample` as tools. Optional: without it lessons are labelled "not yet source-checked" |
| Run interactives safely | In the page | `<iframe sandbox="allow-scripts" srcdoc>` + the house kit (`app/kit`) |
| Remember everything | In the page | `db` (+ `user` for the private subtree) |
| Book and backup exports | In the page | `downloads` |
| Build, test, audit the app | Claude Code (this repo) | Playwright + the runtime stub in `tools/harness` |

Verified on Dan's Android phone (Claude app, 360×707 @3x): db, user private subtree, sample
(~2.3 s on quick), srcdoc sandboxed iframes, web workers, WebGL2. Not available: blob: iframes,
starting Claude Code sessions from the page (`create_session` is blocked by policy).

## 2. Source layout

```
app/
  src/head.html        <title>, meta, non-blocking web fonts, the pre-paint script (prefs, layout)
  src/body.html        shell: #app (top bar, #tabs, #view), #toasts, #sheets
  src/css/*.css        concatenated in filename order
  src/js/*.js          concatenated in filename order into one <script>, "use strict"
  kit/kit.js kit.css   the in-iframe house kit, inlined into the app as strings
  kit/KIT.md           the kit API, quoted whole in build and repair prompts
  kit/examples/*.html  exemplar bodies, each tagged <!-- kind: … --> (prompt anchors + tests)
tools/build.mjs        app/ -> dist/my-university.html   (--out path; --only 32,50 for partial builds)
tools/harness/         claude-stub.js (runtime stand-in), page.mjs (Playwright helper), png.mjs (reads screenshots)
tools/eval/            the real prompts, validators and self-test, run outside the page (RUNNER.md)
tests/                 *.test.mjs (node --test), e2e/*.spec.mjs (run.mjs builds, then runs each), fixtures/
```
The build fills JS placeholders: `"@@KIT_JS@@"`, `"@@KIT_CSS@@"` (the kit files as JSON strings)
and `"@@BUILD@@"` (date + short git sha) are required; `"@@KIT_MD@@"` and `"@@KIT_EXAMPLES@@"`
(`[{name, kind, body}]`) are optional. `<!--` and `</script` are escaped in the bundle.

## 3. JS conventions

- One global `U` (from `00-core.js`); every file attaches to it, most inside an IIFE. No modules,
  no frameworks, no dependencies, plain DOM. Tap targets >= 44 px; respect reduced motion.
- Never `innerHTML` with model text: use `U.h()` and `U.rich()`. Model-written HTML runs only in
  the sandboxed iframe; text a frame sends back goes to logs and repair prompts, never the screen.
- Async APIs reject with `{code, message}`; views word them with `U.errText(e)`. No
  `alert/confirm/prompt` (the viewer blocks them): use `U.confirmSheet()`.
- Prompt builders and validators are pure (no DOM at load) so Node can run them. Every prompt's
  first line is `TASK: <name>`.
- Browser storage is per device and always inside try: localStorage `mu-prefs` (prefs mirror),
  `mu-layout`, `mu.device` (device id), `mu.minutes` (today's study minutes on this device, shared
  by its tabs), `mu.outbox.<uid>.<page>` (held writes to private docs); sessionStorage `mu.tab` (tab id).

### Core API (`00-core.js`)
```
U.h(tag, attrs?, ...children) -> Element   attrs: class, style{}, on:{evt: fn}, dataset, text; other
    non-strings become properties, strings attributes (true -> ''); null/false skipped
U.rich(text, {footnotes?:{has(n), open(n)}}) -> DocumentFragment   blank lines split paragraphs; a
    block of "- " lines is a list; **bold**, *italic*, [[term]] -> mark.term, [^n] -> button.fn
    (dropped when has(n) is false), `code`. No links, no raw HTML.   U.inline(el, text, opts); U.plain(text)
U.append / U.clear / U.svg (static app markup only) / U.icon(name, cls?)   U.id(prefix)   U.key()   U.device()
U.entries(v) -> [{key, value}]   U.list(v) -> [value]   U.keyed(v) -> map
    keyed lists: maps keyed by U.key() (time first), or old arrays read as L000, L001…; oldest first
U.validId(s) (one safe db path segment)   U.slug(text) (<= 40 chars)   U.hash(str) (FNV-1a)
U.studyDay(d? Date|ISO) 'YYYY-MM-DD'   like U.today, but the day turns over at 4 am: every day in review (section 8)
U.today(d?) 'YYYY-MM-DD' local   U.addDays   U.daysBetween   U.now() ISO   U.when(iso)   U.clone   U.sleep   U.shuffle
U.on(evt, fn) -> off   U.emit(evt, data)     events: gen, ask, ask-soft, interactive-test, layout, prefs, booted, rt-late
U.toast(text, {kind:'info'|'good'|'bad', ms})   the same text again extends the one shown. While a phone's
    bottom sheet is open: at the top, the newest only, cut to the whole lines that fit above the
    sheet's heading (U._fitToasts; a cut one opens on a tap), so its title and Close stay in view
U.errText(e) -> one plain sentence (db errors never blame Claude)   U.fail(view, e)   U.haptic   U.cheer(text?)
U.sheet({title, body, actions:[{label, kind, onClick(api)}], onClose, autofocus, key}) -> {el, key, focus(), close({quiet})}
    modal: #app is inert behind it, Tab stays in the top sheet, Escape closes, focus returns on
    close; the same key (default: the title) brings the open one forward. U.closeSheets() on every route.
U.confirmSheet({title, text, confirm, cancel, danger}) -> Promise<boolean>   (asked again: the same promise)
U.radios(group) -> group   role=radio buttons in a role=radiogroup: one Tab stop (the checked one), arrow
    keys move the choice and focus, wrapping (a move clicks the option, so its own handler picks it)
U.layout (section 11);  U.routes, U.go, U.currentHash, U.setTitle, U.notHere, U.focusMode, U.setTab (section 10)
```

### Runtime (`10-runtime.js`)
```
U.rt.ready -> Promise<U.rt>   each claude.use(name) is waited for 10 s; db, user and user.id() (Dan's
    saved work) up to 30 s, and boot says so after 10 s. One that answers later is still taken up:
    its name waits in U.rt.late, then U.emit('rt-late', name) (the store forgets what it learned
    about topics from memory; boot redraws the screen, reloads prefs and the badge, and its notice
    says "Your saved work has not loaded yet…" until then, never "open this in the Claude app").
    A null for db or user inside the viewer (the page is framed, or the null took 5 s or more: a
    host that did not answer) is asked again after 1, 2, 4… s (at most 30 s apart), within the
    30 s wait and then quietly for the rest of the visit, its name in U.rt.late meanwhile. A quick
    null on a page of its own is believed (U.rt.NULL_SLOW_MS, AGAIN_MAX_MS)
U.rt.db, .user, .sample, .mcp, .downloads, .permissions, .uid (null when absent), .inViewer, .late;  U.rt.has(name)
U.rt.savedLate() -> db, user or uid still in U.rt.late: screens show "Your saved work is still loading"
    (V.savedLate) where they would show a first visit, an empty Map or Book, or "not here any more"
U.rt.toolsOk() -> Promise<boolean>   sample can run page tools here: sample.limits() has `tools` (no
    limits(): yes until a call rejects tools_unavailable, which U.ask records for the visit)
U.parseJson(text) -> value   the last complete JSON object in the text (an array only when there is
    none): with tools the reply holds every round, narration first; fences and prose are tolerated.
    A piece of a broken value never counts, and a bigger broken span after the answer means the
    answer is broken: throws {code:'bad_json'}
U.parseJson.candidates(text) -> {list:[{v, at, to, array}], broken:[[from, to]], tried, whole}
    every complete top-level value in order. Pieces are left out: values inside a bracketed span
    that closes but will not parse, and members (after ':' or ',') of a value that never closes
    where the text so far reads as JSON (an answer missing its last '}'). Narration that reads as
    no JSON ("I will use {objective here") hides nothing
U.parseJson.pick(text, schema) -> {value} | {problems}   the last candidate with no schema problems;
    else the biggest candidate's problems, or bad_json's own words when there is no candidate or a
    broken span is bigger than any (U.ask's json check)
U.ask(input, opts) -> Promise<string | parsed JSON>        input: a string or [{role, content}]
  opts   tier 'quick'|'default'|'complex' (default 'default'), onText, signal, tools, images,
         cache (only when true), label (U.emit('ask', {label, tier, ms, chars, truncated})),
         json, schema(data) -> [problems] (problems.soft: the soft ones), priority 'foreground'|'background', key
  json   the answer is U.parseJson.pick(text, schema): the last JSON value in the reply that fits the
         schema, so an object in the narration before or after it ("I used {…}") costs nothing; when
         none fits, the best one (only soft problems, else the biggest) is used. A parse error or
         schema problem gets ONE corrective turn listing the problems (hard ones first), then rejects
         {code:'invalid'}. Soft problems (length limits, section 5) get that turn too, but a reply
         whose only problems left after it are soft is accepted as it is (console.warn and
         U.emit('ask-soft', {label, problems}); nothing on screen). If the repair fails (a hard
         problem, or the call itself) after a first reply that had only soft problems, that first
         reply is kept (a cancelled call still rejects). A truncated JSON reply gets one more go
         asking for shorter fields (no schema retry after it); truncated text is returned as it is.
  retry  'upstream_error' or 'unavailable': once, after 1-3 s. 'rate_limited': never. Each call to
         sample (retries and corrective turns included) first calls opts.tools.reset() when the
         list has one, so it starts with the tools' whole budget; sample gets a plain copy of the list.
  reject {code:'not_granted'} without sample; {code:'cancelled'} when a queued call's signal aborts
U._gate  foreground calls go straight to sample. Background calls run one at a time, only while
         no foreground call is in flight. A queued one becomes foreground when a foreground call
         with the same opts.key arrives, or U._gate.promote(test(input, opts)) -> n matches it.
U.saveFile(filename, text, type = 'application/json') -> Promise<boolean>   downloads.save; toasts a failure
```
Research (Parallel Search):
```
U.research.SERVER = 'Parallel Search';  U.research.SESSION = 'mu-' + 32 hex, one per page load
U.research.available() -> Promise<boolean>   web_search listed, auth not 'needs_reauth' (cached; reset())
U.research.tools(log?, {allow?}) -> Promise<[{name, description, inputSchema, execute(input)}]>
    schemas from mcp.describeTool (after permissions.request(['mcp:Parallel Search'])), else
      web_search {objective, search_queries:[2-3 short queries]}    web_fetch {urls:[<= 20], objective?, full_content?}
    execute never throws; it adds session_id: SESSION when missing and calls log({tool, input}).
    web_fetch opens only the results[].url pages web_search returned in this same tools() set, or
    opts.allow. Each entry of urls is parsed with URL (http(s), no user name or password), its
    fragment dropped, and compared without trailing slash or host case; the connector gets those
    parsed addresses (never a fragment) and only objective, search_queries, full_content,
    allow_live_fetch and session_id, never the model's own text. One entry not allowed refuses the call. Problems come back as
    text: "Tool error (bad_request): …" (no address), "Tool error (refused): …" (not allowed),
    "Tool error (<code>): <message>. …" (the call failed).
    budget (opts.budget, default 10 searches and 6 fetches) counts per call to Claude: the list's
    reset() (called by U.ask) clears it and the failure count; allowed pages stay allowed.
    Results {results:[{url, title, excerpts, full_content}]}: markdown links and emphasis become
    plain text, then the JSON is fitted to 12,000 (search) / 20,000 (fetch) characters by cutting
    the longest text at a word (" …"), then dropping the last results; other payloads are cut.
```

### Store (`20-store.js`)
```
U.store.paths.topic(tid) / lesson(tid, iid) / research(tid, key) / profile() / progress(tid) / cards(tid)
U.store.topics.watch(fn, onError) -> stop   fn(topic docs, newest updatedAt first);  .list()
U.store.topic.get / watch(tid, fn, onError) / create(doc) / update(tid, patch) / remove(tid) -> {leftovers}
U.store.lesson.get / watch / set(tid, iid, doc) / update(tid, iid, patch) / remove(tid, iid) / list(tid)
U.store.research.get(tid, key) / set(tid, key, doc)
U.store.progress.get(tid) / watch(tid, fn, onError) / patch(tid, patch) / all() -> {tid: doc}       private
U.store.cards.get(tid) / patch(tid, patch) / update(tid, cardId, fn(card) -> fields|null) / all() / dropOrphan(tid)
U.store.profile.defaults() / get() / watch(fn, onError) / patch(patch)          defaults merged in
U.store.getDoc / setDoc / patchDoc / watchDoc(path, …)    persistent() (db and uid present)
U.store.isRemoved(tid) / topicExists(tid, fresh?) / topicsExist([tid]) -> {tid: bool}
U.store.replacing(old, neu) -> patch (keys only in old become null);  minutesOn(days[day]);  waiting / flush / retryLater(e, job)
U.logStudy(minutes) -> Promise   adds to this device's count for today (kept in `mu.minutes`, so two tabs add up)
U.memdb   in-memory db, same surface: used without the db capability, and for private docs without a uid
```
- Writes to one doc are serialised; patches arriving within 120 ms coalesce (deep merge, `null`
  deletes). `topic.update`, `lesson.set/update` and `progress.patch` stamp `updatedAt`.
- A write rejected as `unavailable` is retried once after 300-900 ms. Still failing for a
  passing reason (unavailable, timeout, resource_exhausted, deadline_exceeded, aborted, internal),
  it waits in the outbox, merged under newer patches: resent every 3 s for a minute (then 15 s),
  after any write succeeds, on `online` and when the page shows again. It rejects with
  `e.queued = true`; Dan gets one toast per outage (it asks him to keep the app open) and one when
  saving works. Db errors carry `e.where = 'db'`. Not held: lesson docs (the lesson job owns its
  retries under the lease; a late patch could land on a lesson rewritten since), and a `setDoc`
  drops a patch held for the same doc. Held patches to Dan's private docs are also kept in
  localStorage `mu.outbox.<uid>.<page>` (`{at, since:{path: when its oldest part was asked},
  docs}`) until they land; the next page of that user takes over and sends those of pages that
  have closed, once the runtime is ready (or when the db or uid answers late, `rt-late`). Each
  page holds the Web Lock `mu.page.<page>` while open, so a tab still open keeps its own (without
  Web Locks, every page's are taken over). One taken over is read against the doc inside its
  write queue and only what is not older than the doc goes: a card learned or reviewed since
  stays (a card with no time of its own: the one with more reviews), a missing card is made only
  whole and not when its idea was learned again since; a setting changed since stays
  (`prefsAt`); a day's minutes keep the larger count; progress keeps the write-time rules, and an
  idea that began a new round since (`againAt`) loses the patch's round fields. One saved over
  14 days ago is dropped; one the db cannot take yet stays on the device and is tried again when
  a write succeeds, on `online` or when the page shows. Shared-doc patches and `retryLater` jobs
  live only with the page.
- Private writes (`profile.patch`, `progress.patch`, `cards.patch/update`) asked for before
  `U.rt.ready` wait for it (their path names the uid), and for the outbox takeover above, so the
  older patches go out under them.
- Shared docs (topics, lessons, research) are created only by `set`, and `lesson.set` and
  `research.set` only while the topic exists; a patch to a missing one is dropped (resolves
  `null`). Private docs are created on first patch; progress and cards only while the topic exists.
- `topic.remove` deletes `topics/{tid}`, marks the tid removed (later writes for it are dropped),
  then deletes its lessons, research, progress and cards. `lesson.remove` deletes one lesson doc.
- Progress rules, applied to the doc as it is when the write lands: within a round, stage only
  moves forward and `predict`, `startedAt`, `doneAt` and each `checks[id]` keep their first
  value; a write tagged with an older round loses its round fields (say entries still land);
  `cardsRound` never goes back. `profile.patch` stamps `prefsAt[key]` for each setting it writes.
  The first keyed write over an old array list converts it in place.
- Subscriptions call `onError(e, {retrying})`: on `unavailable` (the platform's dead bridge) they
  resubscribe 3 times quickly, then report `retrying:false` once and keep trying every 30 s
  (`WATCH_PARK_MS`) and at once on `online`, when the page shows again, or after a write succeeds;
  the next snapshot carries on as normal. A try refused for any other reason (permission_denied,
  say) is reported, even after parking, and ends it. Views show an error with Try again, never "empty".
  `cards.update` reads the card inside the write queue and never recreates one that is gone.

## 4. Data model

Shared content (the artifact is private, so "shared" means Dan's devices).

`topics/{tid}`   tid = `U.slug(query) + '-' + 5 random characters`
```
{ id, title, query, createdAt, updatedAt, plannedAt?, status:'planning'|'ready'|'failed', error,
  hook, oneBreath, level:'new'|'some'|'solid', hue,              // hue = U.hash(title) % 360
  ideas:[{ id:'i1', title, oneLine, deps:[earlier ids], kind, known?:true }],
  calibration:[{ id, iid?, q, options:[3-4], answer, why }],     // exactly 2
  research:{ status:'none'|'running'|'done'|'unavailable'|'failed', at, sources, dropped?, error?,
             reason?:'none_confirmed'|'error'|null, tries? } }
  // done only with sources >= 1: a run that kept none is failed ("No source could be confirmed…")
  // with reason 'none_confirmed' (it finished: lessons never re-run it, and the Library says no
  // source could be confirmed); 'error': it did not.
  // tries: runs in a row that did not finish (failed, or 'running' left by a page that went away).
  // unavailable: no connector, or this view cannot run page tools (U.rt.toolsOk).
kind: 'mechanism'|'quantity'|'process'|'structure'|'history'|'concept'|'skill'
```
`topics/{tid}/lessons/{iid}`
```
{ status:'writing'|'building'|'ready'|'failed', updatedAt, startedAt,
  by:{ device, tab, page, holder },              // the job writing it; holder = device/tab
  lesson: Lesson|null, sourced: bool,
  interactive:{ html, title, brief, selftest: Report, attempts } | null,
  note: string|null,                             // why there is no interactive
  avoid:[brief]|null, feedback: string|null,      // Learn it again: briefs to avoid, Dan's note
  error, errorCode?, errorDetail?,                // when failed
  flags:{ [key]:{ note, at, stage } } }           // "This looks wrong", newest 30; kept when the
                                                  // lesson is rewritten or a stopped job puts it back
```
`topics/{tid}/research/{key}`   key `'topic'` (always written) or an idea id (when it has notes):
`{ notes:[{ claim, sourceIds:[n], contested? }], sources:[Source], at }`

Private, under `data/users/{uid}/`:
```
profile   { prefs:{ theme:'light'|'dark'|'system', size:'s'|'m'|'l'|'xl', easy, cap:10|15|20|30, light, lightDay? },
            prefsAt:{ [key]: iso },                                // when each setting was last written
            days:{ 'YYYY-MM-DD': { [deviceId]: minutes, legacy?: minutes } },   // study days; older days: a number
            createdAt }
```
Defaults: light theme, size m, easy false, cap 15, light false. `light` is the lasting "Light
days" setting; `lightDay` (a study day, or '') is Today's switch for that day. Each device writes
only its own minutes, under the study day (`U.studyDay`). Layout is not a pref (section 11).

`profile/progress/{tid}`
```
{ updatedAt, lastIdea, calibration:{ [qid]: optionIndex }, calibrationSkipped?,
  questions:{ [key]:{ q, iid, at } },                         // asked in Ask Claude, newest 20
  ideas:{ [iid]:{
    round,                                                     // 0, then +1 per Learn it again
    stage:'predict'|'play'|'explain'|'say'|'checks'|'done', startedAt, doneAt,
    predict:{ answer: string|null, at },                       // null: skipped
    say:{ [key]:{ text, at, verdict:'got-it'|'partly'|'not-yet'|null, met:[bool], nailed?, followUp?, model?, round } },
    checks:{ [checkId]:{ correct, at } },
    past:{ [round]:{ stage, predict, checks, doneAt, at } },   // earlier rounds
    replays:{ [key]:{ at, predict, checks } },                 // "Go through it again" runs
    cardsRound?,                                               // the round whose review cards were made
    againAt?, relearn?, known? } } }
```
`relearn: true` (set by Today) makes the lesson screen start Learn it again. `known` is read
alongside the plan's `known`, but nothing writes it at present.

`profile/cards/{tid}`
```
{ cards:{ [cardId]: Card } }        cardId = iid_checkId, or iid_say for the recall card
Card = { id, tid, iid, type:'choice'|'order'|'estimate'|'target'|'recall', spec, createdAt, learnedAt,
         s:{ due, stability, difficulty, reps, lapses, last }, hist:[{ at, grade:1-4, ok }], retired? }
```
`hist` keeps the newest 40. `retired`: unusable (its interactive is gone, or it was skipped in
review); learning the idea again clears it.

## 5. Lesson JSON (what generation writes, what the player plays)

`U.validate.lesson(o, {iid, sources, final})` in `30-prompts.js` is the truth; in short:

**Length limits are soft** (every validator: plan, research, lesson; grade has none). A model
cannot count words or characters exactly, so a limit on length (characters, words, sentences:
the "<= n chars/words" below) never throws a reply away: up to `U.validate.allowed(max)` (max +
15%, at least one unit: 170 words -> 195, 6 words -> 7) is not reported at all; past it the
problem is reported and listed in `problems.soft`, so U.ask's one repair asks for a cut and then
accepts the reply (section 3, Runtime). Everything else is hard: missing fields, wrong types,
bad or duplicate ids, unknown sources, unreachable targets, web addresses, and counts of list
items (2-3 checks, 5-8 ideas, 1-2 controls). The prompts still ask for the same limits.

```
Lesson = {
  iid, title,                                    // title <= 90 chars
  predict: { q, options?:[2-4], reveal },        // reveal shown after play
  interactive: {
    brief,                                       // "The one thing you should see is ___ when you ___."
    title, controls:[1-2 Control],
    outputs?:[0-3 { id, label, unit?, decimals? }],   // label <= 30 chars, unit <= 10, decimals 0-6
    whatAmILookingAt,                            // <= 120 words: the rule in plain words
    ignores,                                     // what the model leaves out (honesty panel)
    numbers:[{ label, value: number|string, kind, source?: n }]
  } | null,                                      // null only when nothing can be manipulated
  explain: { text },                             // <= 170 words, U.rich syntax, no links or HTML
  analogy: { text, breaks } | null,
  say: { prompt, rubric:[2-3], model },
  checks:[2-3 Check],                            // ids unique
  sources:[Source],                              // final: 1..n in order of first citation, all cited
  confidence:'settled'|'simplified'|'contested',
  contested: { views:[2+ { label, text }] } | null
}
Control = { id, label, min, max, step, value, unit }  numeric: min < max, 0 < step <= max - min,
                                                      min <= value <= max, unit <= 10 chars ('' for none)
        | { id, label, options:[2-8], value }         named: value = the opening option's 0-based index
    ids (outputs too): /^[a-z][A-Za-z0-9]{0,31}$/, none shared; labels and option names <= 6 words
number kind: 'control' | 'computed' | 'constant' | 'assumed' (an example value, never sourced) | 'date'
Source = { n, title, url, quote }                // http(s) url; quote <= 30 words of exact page text
Check =
  { id, type:'choice', q, options:[2-4 distinct], answer, why, misconception?:{ [wrongIndex]: sentence } }
| { id, type:'order', q, items:[3-6 distinct, in the correct order], why }
| { id, type:'estimate', q, min, max, answer, tolerance, unit, log?, why }  // min <= answer <= max; log needs min > 0
| { id, type:'target', q, control, output, target, tolerance, why }
    // control: a numeric control with >= 3 settings; output: an outputs id. Graded on the
    // lesson's interactive, every other control at its opening value. tolerance > 0 throughout.
```
- An interactive with outputs and a numeric control must have a target check; no interactive,
  no target check. A misconception belongs to a wrong option and speaks to Dan as "you".
- No web address anywhere but `sources`. With `sources: null` (no research) the list is `[]`
  with no `[^n]`; given a list, each source's n and url must match it. Every `[^n]` and
  `numbers[].source` names a listed source.

The other replies: `plan` {title, hook (a puzzle question ending "?"), oneBreath, ideas: 5-8
{id 'i1'…, title, oneLine, deps (earlier ids only), kind, known?}, calibration: exactly 2 {id,
iid?, q, options: 3-4 distinct (trimmed, any case), answer, why}}; `research` {sources, topic:{notes}, ideas:{[iid]:{notes}}},
a note citing at least one source unless contested; `grade` {met (one per rubric point), verdict
(got-it = all met, partly = some, not-yet = none), nailed, followUp ('' only when got-it), model?}.

Review cards come only from what Dan answered: each check he answered becomes a card of the
same type; his say-it-back becomes `{ type:'recall', spec:{ prompt, rubric, model, mine } }`.
Finishing a re-learned lesson replaces that idea's cards: an unchanged question keeps its
schedule, a changed one starts afresh, one the lesson no longer has is removed. Once they are
saved, the round is recorded (`cardsRound`). At boot (1.5 s in) and when Today opens,
`U.review.mendCards` finds ideas done in a round whose cards were never made (the app closed
before they were saved): cards learned at or after `doneAt` are only recorded; otherwise they are
made from the lesson as stored (`ready` or `building`, not rewritten since `doneAt`) and Dan's
stored answers, learned at `doneAt`, exactly as finishing would have made them.

## 6. The interactive kit (in-iframe)

The model writes only the body (HTML, optional `<style>`, one inline `<script>` ending with
`K.ready()`, at most 150 KB). `U.sandbox.srcdoc` puts the CSP first in `<head>`, then charset,
viewport, the kit CSS, `window.K_THEME` and `window.K_BODY_LINE` (for error line numbers) and
the kit JS; the body follows in `<body>`. CSP: `default-src 'none'; script-src 'unsafe-inline';
style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none';
form-action 'none'; base-uri 'none'`. The frame is `sandbox="allow-scripts"` (never
`allow-same-origin`). The host trusts a message only from that frame's own window; the kit only
from the parent it captured at load. The API (full reference in `app/kit/KIT.md`):
```
pipeline   K.model(fn) K.update(fn) K.at(over) K.params() K.outputs() K.refresh() K.check(label, fn, {source?}) K.ready()
controls   K.control K.choice K.toggle K.stepper K.button         each {id, label, …, into}; ids = the lesson's
outputs    K.readout({id, …, decimals?, afterMove?})  K.plot(target, opts)  K.bars(target, opts)  K.anim({step, …})
sound      K.sound.tone / chord / stop / mute                     plays only after a press
until moved  class k-after-move, K.moved, K.afterMove(fn), K.reveal()
layout     K.stage(visual, controls, {max = 600, beside}): controls under the visual, fitted to max px
           tall in a frame under 560 px; beside the visual in a frame >= 860 px wide (unless beside:false)
helpers    K.el K.svg K.labels K.fmt K.near K.clamp K.lerp K.linspace K.round K.color(role, alpha?)  K.theme {dark, size, c}
```
Messages (`postMessage`, each with `src:'kit'`; a reply carries its request's `rid`):
```
kit -> host  {type:'height', px}  {type:'ready', checks:[{label, ok, source?, error?}], beside}  {type:'error', message}
             (beside: a K.stage sets its controls beside the visual in a wide frame)
             {type:'change', params, outputs}   (250 ms after Dan changes something)
host -> kit  selftest {throwaway?}   -> {type:'report', report}
             get                     -> {type:'state', params, outputs, moved}
             set {id, value}         -> state | error       counts as a move
             press {label?}          -> state | error       a K.button, else a K.anim's Play; counts as a move
             inputs                  -> {type:'inputs', inputs:[{id, kind, label, value, …}], actions:[labels]}
             reach {control, output, target, tolerance} -> {type:'reach', result:{reachable, best:{value, output}|null, tried, error?}}
             theme {theme}           (no reply)
Report = { ok, errors:[], overflow, overflowDetail?, clipped:[], checks:[{label, ok, source?, error?}],
           sweep:{ ok, problems:[] }, controls:[ids], readouts:[ids], outputs:[model keys],
           inputs:[…], actions:[labels], ready, warnings:[], width, height, ms }
```
`ok` = no errors, no overflow, nothing clipped, at least one check and all pass, sweep ok,
`K.ready()` called. The self-test (KIT.md, "The self-test") also sweeps every control, reveals
the after-move parts, steps every `K.anim` and, in a throwaway frame, presses every `K.button`.

Height: the kit posts the body's height, including content that spills out of a fixed-height
box (`body.scrollHeight`), capped at 6000 px; the host sizes the frame to it (hidden test
frames cap at 4000). A lesson keeps an interactive only after it passes (section 7).

## 7. Generation (in the page)

`30-prompts.js` owns the plan, research, lesson, grade and tutor prompts and every validator;
`33-interactive.js` the build and repair prompts. Each JSON call passes its validator as `schema`.
Tiers: plan-topic quick; build/repair-interactive complex; the rest default.

Pipelines (`31-generate.js`):
1. `createTopic(query, {level, onCreated(tid)})` writes `topics/{tid}` (planning), calls
   `onCreated` (Learn opens the topic to watch the plan form), then plans with `known` (up to 60
   ideas finished in other topics). Ready: plan fields (a title over 120 characters, possible now
   that lengths are soft, is shortened at a word) and `plannedAt`; research starts in the
   background and the first idea not marked known is written (foreground). A failed plan sets
   status failed with a readable `error`; `replan(tid)` tries again.
2. `research(tid)` never rejects and joins a run already going. No connector, or a view that
   cannot run page tools (`U.rt.toolsOk()` false, or the call rejects `tools_unavailable`):
   `unavailable`. Otherwise `running`, then one background call whose tools record every result
   that is not a tool error ("Tool error (…)" texts never count, so a refused URL is no evidence).
   The prompt sets a budget of 8 searches and 4 fetches (not enforced in code). A source survives
   only if its URL is a page the tools returned and its quote is on that page: one text the tools
   returned for it (one excerpt, one full text, a title; a page searched and then fetched is held
   twice) holds every part of the quote between ellipses, however short, in the quote's order,
   each as whole words, except that the quote may start or end part-way through a word (between
   letters, in a part with whole words too). Numbers stay whole: digit groups join ("1,481", or
   with a thin or no-break space, is "1481") and a decimal point stays inside ("343.2"), on both
   sides. Text not in the results shape is one text. Notes keep only surviving sources (or are
   contested). A run that keeps no source is `failed` ("No source could be confirmed…", reason
   'none_confirmed'), never `done`.
3. `ensureLesson(tid, iid, {onStatus, background, signal})`: one job per lesson in the page
   (later callers join it). A ready doc comes back as it is; a `building` doc with a lesson only
   needs its interactive; otherwise: claim the doc (`writing`); wait for research (at most 120 s
   from its start, 15 s for the topic's first lesson; start it if there is none; after 10 min
   retry an unavailable one, or one that did not finish (failed with reason 'error', or `running`
   older than 8 min) up to 3 runs in a row (`tries`), never one that finished confirming no
   source: Dan's "Check the sources again" runs that); write the
   lesson with this lesson's research, `known`, `prior` (`priorSummary` of earlier lessons),
   `avoid` and `feedback`; a reply that still fails the checks after U.ask's repair (`invalid`
   or `bad_json`) is written once more from scratch: a fresh call with the same prompt (and its
   own repair), status line "Having another go at writing this lesson…"; any other error keeps
   its handling below. Keep only citations of checked sources, renumbered 1..n; save
   (`building`); build the interactive; save `ready` with it, or without it and a `note`.
   `onStatus(text, meta)`: `meta.redo` means the step in progress is being done again (the
   lesson screen rewrites that line instead of ticking it off); `meta.failed` carries the
   failure text (the screen shows it once, under the step that failed, never as a step).
   Target checks the page cannot reach are dropped. `background` marks a prefetch: its calls go
   with priority background, and aborting `signal` cancels it until a foreground caller joins.
   A cancelled job stops waiting at once (for research, Claude, the interactive's build, another
   device) and leaves the doc as the rules below say.
4. `relearn(tid, iid, {onStatus, feedback})` always writes a new lesson, avoiding up to 3 earlier
   interactive briefs; `feedback` (Dan's note, up to 1000 characters) is put to the writer. It
   never joins a job running for that lesson (a first writing, an interactive still building,
   another relearn). A foreground one (Dan is waiting for it) finishes first; a background one (a
   prefetch, or a lesson he left while it was being written: `demote`) is cancelled (queued calls
   drop, running ones stop) and the rewrite starts as soon as it has put the doc back (a fresh
   claim undone, a written lesson left resumable). A rewrite keeps the doc's `flags`.
5. `grade(say, answer, attempt, {previous, title}) -> {met, verdict, nailed, followUp, model?}`.
   A blank answer is not-yet without asking Claude. Attempt 1 never shows the model answer;
   from attempt 2 a miss carries `model` (the lesson's own when Claude gives none).
6. `tutor(messages, context, {onText(textSoFar), signal}) -> string`: the context is filled in
   (topic, idea, lesson, research), the last 16 turns go, and `web_fetch` may also open the
   lesson's and the research's sources. Tools go only where the connector is there and
   `U.rt.toolsOk()`; a `tools_unavailable` rejection asks again without them (the no-tools prompt).
7. `status(tid) -> {planning, research, lessons:{iid: 'writing'|'waiting'|'building'|'ready'|'failed'}}`
   (this page only); `knownIdeas(excludeTid) -> [{title, topic}]`. Progress is broadcast as
   `U.emit('gen', {tid, iid, kind:'plan'|'research'|'lesson', status, text})`.

One writer per lesson, across devices and tabs. The holder is `device/tab` (localStorage
`mu.device`, sessionStorage `mu.tab`), named in the doc's `by`. A job claims the db's lease on
the lesson doc (`ref.acquire({holder, ttlMs: 90000})`) and renews it every 45 s with a heartbeat
that also touches `updatedAt`. Before each write it renews the lease and checks `by.holder`;
if someone else has it, the job stops (`superseded`) and watches that work instead. Not
acquired: wait for the lease to run out, at most 8 rounds, then `{code:'busy'}`. Done: a 1 s
lease, so the next writer need not wait. Without leases (memdb), a `writing`/`building` doc
touched within 4 minutes and not left by this tab is waited for. Errors that say nothing about
the lesson (not_granted, rate_limited, cancelled, aborted, unavailable, upstream_error,
timeout, session_expired) leave the shared doc as it was (a fresh claim is put back or
removed; `building` stays resumable); others mark it `failed`.

Interactive build (`U.interactive.build`): the prompt carries the idea, the lesson's brief,
controls, outputs, numbers, target checks, explanation and sources, KIT.md and the nearest
exemplar by kind. Each body is self-tested at 340, 720 and 1040 px and checked against the
lesson: ids its checks need (`missing`), web addresses other than its sources (`foreign`), and
target checks that moving one control cannot reach (`unreachable`, via `U.sandbox.reach`).
Failures go back in a repair prompt, at most twice. After the last repair, a page that passes
its own self-test is still kept, with stray addresses stripped and unreachable targets reported.

Prefetch (`50-lesson.js`): once a lesson is ready, the next open idea is ensured with
`background: true`; leaving the topic aborts it. Opening a prefetched lesson joins its job, and
the lesson screen promotes its queued calls with `U._gate.promote`.

## 8. Review scheduling

FSRS-4.5 at day granularity (`40-fsrs.js`): published default weights, target retention 0.9,
intervals 1-365 days with a small fuzz keyed on the card id, Hard <= Good < Easy. A new card is
first due the next day; Again brings a card back tomorrow.
```
U.fsrs.init(day) -> s      U.fsrs.review(s, grade 1-4, day, cardId?) -> s
U.fsrs.preview(s, day, cardId?) -> {1..4: next state + interval}      ("back in N days" hints)
U.fsrs.retrievability(s, day) -> 0..1      U.fsrs.band(s, day) -> 'new'|'fragile'|'growing'|'strong'
```
Bands: new (never reviewed); fragile (recall chance < 0.7 or stability < 2 days); strong
(stability >= 21 days and chance >= 0.85); growing otherwise. The Map shows the middle reviewed
card's band per idea, never a percentage.

Days are study days (`U.studyDay`): local days that turn over at 4 am, not midnight, so a card
learned or answered Again at 23:55 is due from 4 am the day after, not five minutes later (Anki
uses the same hour). Everything in review uses them: `s.due`/`s.last`, the "back in N days"
hints, the daily cap and the week strip (a `hist` entry's day), light days (`lightDay`),
slipping's 30 days, Today's date line and the study minutes in `profile.days`. `U.fsrs` defaults
`day` to today's study day.

A session holds cards due today or overdue (not retired): most overdue first, then most faded,
interleaved so one idea never comes twice in a row and topics alternate. The daily cap
(`prefs.cap`, default 15) counts cards already reviewed today; a light day (`prefs.light`, or
`prefs.lightDay` is today) caps it at 5. `#/review/more` is one extra batch of up to 5. When the
cap leaves nothing for today but cards are due (Light day turned on after some reviews), Today
says "Done for today" with "Review 5 more" (and keeps the Light day switch while it is what holds
them back), and `#/review` says the limit is reached instead of "holding up".

An answer still on its way to the db (a recall card waits up to 30 s for Claude's grade before it
is saved) is left out of every plan and counted as reviewed today until it lands, so Today, the
badge and a new session never offer it again; closing a session recounts the badge once its saves
have landed or failed. A plan whose read of the cards began before such an answer landed treats it
the same way (that read may not show it yet), including a plan made again from the same read (the
Light day switch); a save that failed wrote nothing, so the card is simply due.

A target card plays on its idea's interactive. When the lesson doc is not 'ready' the session
drops the card and saves why, so Today and the badge stop counting it: a lesson being written
right now (status 'writing', `updatedAt` within 4 minutes; a write that fails for a passing reason
restores the old lesson) puts the card off to the next day without a grade; anything else
('building' a new interactive, 'failed', or a rebuild left part-way) retires it, as when its
control has gone. Finishing the new lesson makes the idea's cards afresh (`addFromLesson`).

Grades: in review, objective cards grade themselves (wrong = Again, right = Good, right within
reading time plus a beat = Easy; a target hit on a second try = Hard, never Easy) and Dan can
change the grade. Recall cards are graded by Claude while Dan moves on: got-it = Good (Claude
never awards Easy, whatever `nailed` says; Dan can choose it with Change), partly = Hard, not-yet =
Again; no grade (failure, or 30 s) = Hard. Saving re-reads the card inside the write and merges
`hist`, so reviews on two devices both count.

Learn it again: an idea with two or more Again grades in 30 days is slipping, counting only Agains
since it was last learned and since its latest round began (`againAt`). Until Dan finishes a new
round, the old round's cards stay in review with their old `learnedAt`; the lapses that started
the round never count again, so one more Again does not flag a half-done round. Today lists a
slipping idea (link `#/t/:tid/:iid/again`) and sets `relearn: true` on its progress. The lesson
then calls `U.gen.relearn` and starts a new round. "This looks wrong" offers the same rebuild,
with Dan's note as feedback.

## 9. Module APIs (cross-file contract)

`32-sandbox.js` (kit host)
```
U.KIT_JS, U.KIT_CSS (build placeholders);  U.sandbox.MAX_BYTES (150 KB), CSP, srcdoc(body, {theme}) (throws {code:'too_large'})
U.sandbox.mount(container, {html, title, onReady(checks, {beside}), onError(msg), onChange({params, outputs}), minHeight = 320, loading}) ->
   { el, frame, ready: Promise<checks|null>, selftest(), get(), set(id, value), press(label?), inputs(), reach(spec), theme(t?), destroy() }
   ready is null if K.ready() has not come after 12 s; follows the app's theme and text size;
   a frame that navigates away is stopped; one removed from the page is destroyed.
U.sandbox.test(html, {widths = [340, 720], timeout = 8000, theme}) -> Promise<Report>   hidden frames, one width
   at a time, merged: a message seen at only some widths ends " [at 340 and 720 px wide]", a check
   passes only at every width, + widths:[{width, ok}]
U.sandbox.reach(mounted | html, {control, output, target, tolerance}) -> Promise<{reachable, best, tried, error?}>
U.sandbox.theme() -> {dark, size, c:{bg, panel, sunk, ink, muted, line, strong, accent, accent2, onAccent2, warn, good, amber}}
U.sandbox.visibleTimeout(fn, ms) -> {cancel()}   time with the page hidden does not count
```
`33-interactive.js`
```
U.KIT_MD, U.KIT_EXAMPLES ([{name, kind, body}])
U.interactive.prompt(topic, idea, lesson, {avoid?}) -> string               TASK: build-interactive
U.interactive.repairPrompt(topic, idea, lesson, html, report) -> string     TASK: repair-interactive
U.interactive.extract(text) -> body   (fences, prose, doctype and html/head/body stripped)
U.interactive.build(topic, idea, lesson, {onStatus, avoid, signal, priority}) ->
   Promise<{html, title, brief, selftest, attempts, unreachable?:[checkIds]} | null>   rejects only when Claude can't be reached
U.interactive.problems(report, lesson, html?) / requiredIds / foreignUrls / stripUrls / unreachable / exampleFor(kind)
```
`30-prompts.js`, `31-generate.js`
```
U.prompts.planTopic(query, {level, known:[{title, topic}]})                     TASK: plan-topic
U.prompts.research(topic, {ideas})                                               TASK: research
U.prompts.writeLesson(topic, idea, {research, known, avoid, feedback, prior})    TASK: write-lesson
U.prompts.grade(say, answer, {attempt, previous:{text, followUp}, title})        TASK: grade
U.prompts.tutor(context) -> preamble (the pipeline adds the turns)              TASK: tutor
U.prompts.lessonResearch(research, iid) -> {notes, sources} | null   sources numbered 1..k for one lesson
U.prompts.priorSummary(lessons) -> [{iid, title, terms, analogy, brief, numbers, asked}]
U.prompts.urlKey(url) / words(text) / footnotes(obj) / VOICE / KINDS / NUMBER_KINDS
U.validate.plan(o) / .lesson(o, {iid, sources, final}) / .grade(o, {rubric, attempt}) / .research(o, {ideas}) -> [problems]
   problems.soft: the length problems among them (section 5);  U.validate.hard(problems);  U.validate.allowed(max)
U.gen.createTopic / replan / research / ensureLesson / relearn / grade / tutor / status / knownIdeas   (section 7)
```
`41-cards.js`, `60-today.js`
```
U.cards.render(card, {mode:'lesson'|'review', lesson?, onDone(result)}) -> Element with destroy()
   card {id, type, spec, s?}; lesson: the lesson doc (a target card mounts its interactive)
   result {correct, grade, answer, ms, auto?, verdict?, skipped?, pending?: Promise<{grade, correct, verdict}>}
U.cards.types / interactiveOf(doc) / controlOf(doc, id) / outputOf(doc, id) / verdictGrade(gradeResult)
   a target card names its readout and unit from outputOf ("make Time for one swing read 3 s")
U.review.addFromLesson(tid, iid, lesson, outcome, {round?, at?}) -> Promise<[cardId]>   outcome {checks:{id:{correct}}, say:{text, verdict}};
   round: recorded as cardsRound once saved; at: when he finished (else now)
U.review.mendCards(force?) -> Promise<[{tid, iid}]>   never rejects; at most once a minute after a clean run
U.review.queue({cap, light, extra}) -> Promise<[card]>;  dueCount() -> Promise<n>;  refreshBadge();  setBadge(n)
U.review.ideaBands() -> Promise<{tid:{iid: band}}>;  slipping() -> Promise<[{tid, iid, lapses, last}]>
```
Views and app services
```
U.views (70-learn.js)   cover (six motifs, svg[data-motif]), asTitle(query), summary(topic, progress) -> {total, done, current, index, started, allDone, touched},
   planningStuck(t) (planning, silent 90 s, not running here), researchStale(t) ('running' over 5 min),
   loadError(what, e, retrying), slowNote, savedLate(what) (U.rt.savedLate), extLink(url, label) (window.open, else copy the link), empty, back, day
U.lesson.sourceSheet(source)    U.tutor.open(context) / thread(tid, iid)
   context {topic, tid?, iid?, idea?, lesson?, lessonDoc?, stage?, getState?}
U.book.collect(topics, progressByTid) / toMarkdown(book) / toJson(book)      exported with U.saveFile
U.settings.prefs / apply(prefs) / set(key, value) / fromProfile(prefs) / readLocal() / backup() / open()
U.boot.study   visible, recently touched time (TICK 15 s, IDLE 2 min), logged with U.logStudy in 2-minute chunks;
   a kit 'change' from an interactive on screen (iframe.kit-iframe, not a hidden test frame) counts as a touch
```
`prefs` starts as the device copy (`mu-prefs`, what head.html painted). `apply` sets
`html[data-mu-theme]`, `[data-size]`, `[data-easy]`, mirrors to `mu-prefs` and emits `prefs`; `set`
saves one key to the profile; `fromProfile` (another device) is ignored while a local change is
being saved and for 3 s after. At boot the profile's prefs win, except keys Dan changed while the
app was opening; with no profile, the local copy is saved. The profile is watched even when the
boot read fails.

## 10. Navigation

```
#/                     learn    tab learn    70-learn.js
#/t/:tid               topic    tab learn    71-topic.js
#/t/:tid/:iid          lesson   focus        50-lesson.js
#/t/:tid/:iid/again    lesson   focus        Learn it again; the address becomes #/t/:tid/:iid
#/today                today    tab today    60-today.js
#/review               review   focus        60-today.js
#/review/more          review   focus        one batch beyond the daily cap
#/map                  map      tab map      72-map.js
#/book                 book     tab book     73-book.js
```
- `U.routes.add(pattern, handler, {focus, tab, title, screen})`; `handler(params, ctx)` draws
  into `ctx.view` and may return a cleanup (or a promise of one); `ctx.alive()` is false once
  Dan has moved on. `U.go(hash)` navigates (the same hash draws again).
- The route is the address hash. If the frame refuses a fragment change, the route is kept in
  memory (`U._memHash`; `U.currentHash()` reads either); a real `hashchange` clears it. Boot
  sends every in-app `<a href="#/…">` click through `U.go`.
- Params must pass `U.validId`, else "This page is not here" (`U.notHere`, screen `none`). An
  unknown address or a bad %-escape goes to `#/` without a history entry.
- On every route: the old cleanup runs, sheets close, `#view` is cleared and gets `data-screen`
  (opts.screen, else from the pattern: learn, topic, lesson, today, review, map, book);
  `html.focus` hides the top bar and tabs; the tab gets `aria-current`; the title is
  `opts.title · My University` until the view calls `U.setTitle`; the page scrolls to the top
  and focus moves to the screen's h1 once it is drawn (unless Dan has focused something else).
- Tabs Learn / Today / Map / Book (`#tabs`, Today's badge `#today-badge`) sit at the bottom in
  the phone layout and in the top bar in the laptop layout. The Aa button opens `U.settings.open()`.

## 11. Layout

- `html[data-layout]` is `'phone'` or `'laptop'`. The default, `'auto'`, means laptop when the
  window is at least 900 px wide. Dan can pin Phone or Laptop in Settings (Layout). The choice
  belongs to the device: localStorage `mu-layout`, never the db.
- `head.html` applies it before first paint; `U.layout` keeps it right as the window changes:
  `pref() -> 'auto'|'phone'|'laptop'`, `effective(pref?) -> 'phone'|'laptop'`, `apply()`,
  `set(pref)` ('auto' removes the key), and `U.emit('layout', effective)` when it changes.
- `html.framed`: phone pinned on a window at least 600 px wide. The app is a centred 430 px
  column (`--frame`) with its tab bar, sheets and toasts inside it.
- `#view` is a CSS size container named `view`. Content rules use `@container view (…)`, so a
  screen lays out by the width it actually gets (a framed phone column gets phone shapes).
  Shell rules key off `data-layout`: tabs docked at the bottom or in the top bar, sheets as
  bottom sheets (swipe down to close) or centred dialogs (up to 620 px).
- Laptop widths by `#view[data-screen]`: Learn, the topic page and the Map run up to `--wide`
  (1200 px); the lesson and the review up to 1120 px, with reading text capped at `--measure`
  (44rem) and the interactive full width; every other screen keeps the 720 px column (`--col`).
  Tab screens all start at the wide screens' left edge, so headings do not move when Dan
  switches tabs. When `#view` is at least 900 px wide a review card keeps the question and
  answers on the left with Check under them and shows the feedback beside them; a target card
  keeps its interactive in that column with the goal, hint and Check (then the feedback) beside
  it, held under the review bar, so they never cover its controls; the feedback lets go only when
  it cannot fit below the bar, and a panel never starts under the bar. Only an interactive whose
  K.stage goes side by side (the kit's `ready` says `beside`) gets the full width, with the goal
  and Check docked under it. Either way the short aim beside Check shows only once most of the
  goal sentence's number has gone under the bar (or off the screen), so the instruction never
  shows twice at once, and it comes in under Check (in the docked bar, beside it), so Check
  never moves.
- Learn at least 900 px wide puts the reviews row (or, on first run, the welcome) beside the ask.
- The topic page's ready state has regions `top` (header), `main` (in one breath, warm-up, path),
  `rail` (Ask Claude, sources) and `end` (Delete) in `71-topic.js`. They stack in that order;
  when `#view` is at least 900 px wide, main and rail sit side by side (rail 300-360 px). The
  header, and the planning and failed pages, put the cover in a `.tp-split` with the words: above
  them on a phone, beside them (in the rail's column) at 900 px and up.
