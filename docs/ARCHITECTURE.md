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
| Book, dossier and backup exports | In the page | `downloads` |
| Build, test, audit the app | Claude Code (this repo) | Playwright + the runtime stub in `tools/harness` |

Verified on Dan's Android phone (Claude app, 360×707 @3x): db, user private subtree, sample
(~2.3 s on quick), srcdoc sandboxed iframes, web workers, WebGL2. Not available: blob: iframes,
starting Claude Code sessions from the page (`create_session` is blocked by policy).

## 2. Source layout

```
app/
  src/head.html        <title>, meta, non-blocking web fonts, the pre-paint script (prefs, layout)
  src/body.html        shell: #app (top bar, #tabs, #view), #toasts, #sheets
  src/css/*.css        concatenated in filename order; 80-d4.css (the D4 look, section 12) comes last
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
  by its tabs), `mu.outbox.<uid>.<page>` (held writes to private docs); sessionStorage `mu.tab` (tab id)
  and `mu.tab.open` (the page of this tab that is open now).

### Core API (`00-core.js`)
```
U.h(tag, attrs?, ...children) -> Element   attrs: class, style{}, on:{evt: fn}, dataset, text; other
    non-strings become properties, strings attributes (true -> ''); null/false skipped
U.rich(text, {footnotes?:{has(n), open(n)}}) -> DocumentFragment   blank lines split paragraphs; a
    block of "- " lines is a list; **bold**, *italic*, [[term]] -> mark.term, [^n] -> button.fn
    (dropped when has(n) is false), `code`. No links, no raw HTML.   U.inline(el, text, opts); U.plain(text)
U.append / U.clear / U.svg (static app markup only) / U.icon(name, cls?)   U.id(prefix)   U.key()   U.device()
U.tab()   this tab's id (sessionStorage mu.tab: kept through a reload, never shared by two open tabs).
    "Duplicate tab" copies sessionStorage: a page that finds mu.tab.open set at load (an open page of
    this tab, or the copy of one; cleared on pagehide, so a reload keeps the id) takes a fresh id,
    decided at once. A copy made while the mark was missing (the page was in the back-forward
    cache) is caught a moment later: each page says hello on the BroadcastChannel 'mu.tab' with its
    id and when it took it (on load, and on coming back from that cache); of two open pages with
    one id, the one that took it later takes a fresh id (the other answers a hello). Lesson jobs
    read the id as they start, and keep it (section 7)
U.entries(v) -> [{key, value}]   U.list(v) -> [value]   U.keyed(v) -> map
    keyed lists: maps keyed by U.key() (time first), or old arrays read as L000, L001…; oldest first
U.validId(s) (one safe db path segment)   U.slug(text) (<= 40 chars)   U.hash(str) (FNV-1a)
U.studyDay(d? Date|ISO) 'YYYY-MM-DD'   like U.today, but the day turns over at 4 am: every day in review (section 8)
U.today(d?) 'YYYY-MM-DD' local   U.addDays   U.daysBetween   U.now() ISO   U.when(iso)   U.clone   U.sleep   U.shuffle
U.on(evt, fn) -> off   U.emit(evt, data)     events: gen, ask, ask-soft, interactive-test, layout, prefs, booted, rt-late, art
U.toast(text, {kind:'info'|'good'|'bad', ms})   the same text again extends the one shown. While a phone's
    bottom sheet is open: at the top, the newest only, cut to the whole lines that fit above the
    sheet's heading (U._fitToasts; a cut one opens on a tap), so its title and Close stay in view
U.errText(e) -> one plain sentence (db errors never blame Claude)   U.fail(view, e)   U.haptic   U.cheer(text?) (gone on the next route)
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
    / dossier(tid) / chapter(tid, iid)
U.store.topics.watch(fn, onError) -> stop   fn(topic docs, newest updatedAt first);  .list()
U.store.topic.get / watch(tid, fn, onError) / create(doc) / update(tid, patch) / remove(tid) -> {leftovers}
U.store.lesson.get / watch / set(tid, iid, doc) / update(tid, iid, patch, {quiet?}) / remove(tid, iid) / list(tid)
U.store.lesson.state(doc, live?) -> 'ready'|'preparing'|'failed'|'none'    (section 4; live: U.gen.status's word for it)
U.store.lesson.abandoned(doc, live?) -> bool   writing/building, by.tab is U.tab(), no job of this page on it (section 4)
U.store.research.get(tid, key) / set(tid, key, doc)
U.store.progress.get(tid) / watch(tid, fn, onError) / patch(tid, patch) / all() -> {tid: doc}       private
U.store.cards.get(tid) / patch(tid, patch) / update(tid, cardId, fn(card) -> fields|null) / all() / dropOrphan(tid)
U.store.profile.defaults() / get() / watch(fn, onError) / patch(patch)          defaults merged in
U.store.dossier.get(tid) / watch(tid, fn, onError) / list() / patch(tid, patch) / chapters(tid) -> [doc]
    / chapter.get(tid, iid) / chapter.set(tid, iid, doc) / remove(tid)          private (section 4, Dossiers)
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
- `lesson.update(…, {quiet: true})` (the "This looks wrong" note): a failure is neither held nor
  toasted; the caller says it once and keeps what Dan typed for another go.
- Shared docs (topics, lessons, research) are created only by `set`, and `lesson.set` and
  `research.set` only while the topic exists; a patch to a missing one is dropped (resolves
  `null`). Private docs are created on first patch; progress and cards only while the topic exists.
- Dossier docs (section 4) are private and never tied to the topic's existence: a chapter is
  written whole with `chapter.set` (never held in the outbox: it can be 200 KB, and binding it again
  puts it right), the index with `dossier.patch` (held like any private patch). `topic.remove`
  leaves them: deleting a course asks first whether to keep its dossier (71-topic.js).
- `topic.remove` deletes `topics/{tid}`, marks the tid removed (later writes for it are dropped),
  then deletes its lessons, research, progress and cards. `lesson.remove` deletes one lesson doc.
- Progress rules, applied to the doc as it is when the write lands: within a round, stage only
  moves forward and `predict`, `startedAt`, `doneAt` and each `checks[id]` keep their first
  value; a write tagged with an older round loses its round fields (say entries still land); a
  write that begins a round (it carries `againAt`) lands only on the round before it: one tagged
  with the round the doc is already in (another device began it first) loses its round fields;
  `cardsRound` never goes back. `profile.patch` stamps `prefsAt[key]` for each setting it writes.
  The first keyed write over an old array list converts it in place.
- Subscriptions call `onError(e, {retrying})`: on `unavailable` (the platform's dead bridge) they
  resubscribe 3 times quickly, then report `retrying:false` once and keep trying every 30 s
  (`WATCH_PARK_MS`) and at once on `online`, when the page shows again, or after a write succeeds;
  the next snapshot carries on as normal. A try refused for any other reason (permission_denied,
  say) is reported, even after parking, and ends it. A screen drawn from a watch with nothing to
  show yet (Learn's topics, the topic page, the Map) says "Reconnecting…" (calm, nothing to press)
  while the store makes its quick tries and once it has parked the watch
  (`V.reconnecting(e, info)`): it fills in by itself. Only a refusal is an error, with Try again
  (the topic page's has its own h1 and title); never "empty". A screen that has
  already shown its data keeps it: on `retrying:false` it says so: a parked watch (`unavailable`) a
  calm "Reconnecting…" with nothing to press, one that ended "… stopped updating" with Try again
  above it (`V.liveError`); its next snapshot clears it (Learn's topics, and the topic page's topic
  and progress watches). On the topic page, a long page Dan may be far down, "Reconnecting…" is a
  pill (`V.reconnectPill`) that floats under the top bar wherever he has scrolled and takes no room,
  so nothing moves (WebKit has no scroll anchoring); taps go through it.
  `cards.update` reads the card inside the write queue and never recreates one that is gone.

## 4. Data model

Shared content (the artifact is private, so "shared" means Dan's devices).

`topics/{tid}`   tid = `U.slug(query) + '-' + 5 random characters`
```
{ id, title, query, createdAt, updatedAt, plannedAt?, status:'planning'|'ready'|'failed', error,
  hook, oneBreath, level:'new'|'some'|'solid', hue,              // hue = U.hash(title) % 360
  mode?:'study'|'read',                                          // absent: study (below)
  intake?:{ questions:[{ id, q, options:[2-5 strings], multi: bool, other: bool }],
            answers:{ [id]:{ picked:[option strings], other: string|null } } } | null,
  ideas:[{ id:'i1', title, oneLine, deps:[earlier ids], kind, known?:true }],
  calibration:[{ id, iid?, q, options:[3-4], answer, why }],     // exactly 2
  research:{ status:'none'|'running'|'done'|'unavailable'|'failed', at, sources, dropped?, error?,
             reason?:'none_confirmed'|'error'|null, tries? },
  readyMade?:{ shelf, course } }                                 // a ready-made course (below)
  // done only with sources >= 1: a run that kept none is failed ("No source could be confirmed…")
  // with reason 'none_confirmed' (it finished: lessons never re-run it, and Sources says no
  // source could be confirmed); 'error': it did not.
  // tries: runs in a row that did not finish (failed, or 'running' left by a page that went away).
  // unavailable: no connector, or this view cannot run page tools (U.rt.toolsOk).
  // On screen "Sources found" (Learn's card) and "Research found N sources" (the topic page's
  // Sources) need done with sources >= 1 (U.views.sourcesChecked). A run that kept none (done
  // with 0 sources, stored before such runs counted as failed, or failed with reason
  // 'none_confirmed') reads "ran but could not confirm a single source" (sourcesNone).
  // Lessons are written from these sources, the first one often before research finishes
  // (unsourced, FIRST_RESEARCH_WAIT_MS), and each is then fact-checked against them (section 7),
  // a check that can fail. So Sources says "Each lesson is checked against them before it
  // opens." only when every whole lesson's `verified` is done with sources; otherwise "Each lesson
  // lists the sources it drew on, or says it was written without them", adding "N of the M
  // lessons written so far were checked against them." when some were.
  // hook, oneBreath and calibration (answer, why) come from plan-topic, before any research, and
  // are never checked, so the topic page says under "In one breath" (or under the hook, when there
  // is no oneBreath) and under a revealed warm-up answer, in small muted words, that they are
  // Claude's overview (answer) from what it already knows, not checked against sources. Under "In
  // one breath" it names the hook "the question above", or "the line above" when an older plan's
  // hook is a statement (not ending in "?").
kind: 'mechanism'|'quantity'|'process'|'structure'|'history'|'concept'|'skill'
```
`mode` is how Dan wants the course: `'study'` (teach and test: the default, and what a topic without
the field means) or `'read'` ("just teach me": the reading and the interactive only; no guess first,
no say-it-back, no quick checks, no review cards). He chooses it beside the level when he starts the
topic and can change it later on the topic page (`U.store.topic.update(tid, {mode})`); it applies to
lessons written after the switch, a Learn it again rewrite included: each lesson records the mode it
was written for (`lesson.mode`, section 5), and the lesson screen goes by that, not by the topic.
`readyMade` marks a topic built as a ready-made course (shelves, 76-shelves.js): `shelf` is the
shelf id (`shelves/{shelf}`) and `course` the course id within it. Its plan and lessons are built
in Claude Code, never in the page: `U.gen.ensureLesson` refuses to write, prefetch, rewrite or
research one (section 7), the lesson screen shows "Coming soon" for a lesson whose doc is missing
or not ready, and the topic page hides Learn it again and Rebuild. Learn leaves these topics out
of its list and Continue; he resumes them from the shelf's folder page, which shows where he is
("Lesson 2 of 8", "Finished") from his progress. Absent on every topic he made himself.
`intake` is the few questions Claude asked about what he typed before planning (`U.gen.intake`,
section 7) with his answers, saved at creation (`U.prompts.cleanIntake`: ids q1…, an "Other" option
folded into `other: true`, only listed options picked, one unless `multi`, his own words at most 300
characters); `null` when he skipped them. The plan and every lesson prompt read the answered ones as
"WHAT DAN TOLD US HE WANTS" (data, not instructions); none answered, no block.

**v9 shared contract: how Dan learns a topic, and the intake** (both builders implement their
side exactly; 30/31/34 the generation side, the screens and review the rest):
- `topic.mode`: `'study'` ("Teach and test me": the default, and what a topic without the field
  means) or `'read'` ("Just teach me": the reading and the interactive only). Chosen beside the
  level on Learn; `U.store.topic.update(tid, {mode})` switches it on the topic page; it applies to
  lessons written after the switch (an idea already started keeps its lesson).
- `topic.intake`: Dan's answers to a few questions about what he wants from the topic, saved on
  the topic doc at creation (null when he skipped them, or none came). `U.gen.intake(query,
  {level, mode}) -> Promise<{questions}>` (2-4 questions, quick tier, a "TASK: intake" prompt;
  rejects like U.ask does). Learn asks for it once he taps Start and shows the questions in place
  (each as chips, one or several by `multi`, a "Something else" field by `other`) with "Plan my
  course" and "Skip the questions"; an intake that fails or takes over `U.views.INTAKE_MS` (12 s)
  goes straight to planning with a calm note. Then `U.gen.createTopic(query, {level, mode,
  intake: {questions, answers} | null, onCreated})` stores mode and intake and passes them to the
  plan. `answers` holds only the questions he answered; `other` is null when he wrote nothing.
- `lesson.practice: { text }`: "Put it into practice" for the idea, U.rich text (at most about 160
  words): numbered steps or a checklist, a rule of thumb or two, one worked example with real
  numbers or a real case, and the common mistakes; for an idea that is not a skill, how to apply
  it (what to look for, how to check a claim, how to use it in a decision). Written with the
  lesson and fact-checked against its sources. In every new lesson; absent in older ones (the
  screens then show nothing). Parts are best named by a lead label ("**Steps**", "**Rule of
  thumb:**", "**Worked example:**", "**Common mistakes**"), which the dossier sorts by
  (`U.dossier.practiceParts`, section 4 Dossiers); lists are "- " or "1. " lines.
- A lesson written in read mode has `predict: null`, `say: null`, `checks: []` and no target
  checks, everything else as usual (title, interactive with brief, explain, analogy, practice,
  sources, confidence); `lesson.mode` records the mode it was written for (`'study'|'read'`). A
  study lesson keeps all its parts. The lesson screen shows a lesson read-style when its
  `lesson.mode` is `'read'` (whatever the topic says now), study-style otherwise.
`topics/{tid}/lessons/{iid}`
```
{ status:'writing'|'building'|'ready'|'failed', updatedAt, startedAt,
  by:{ device, tab, page, holder },              // the job writing it; holder = device/tab
  lesson: Lesson|null, sourced: bool,
  interactive:{ html, title, brief, selftest: Report, attempts } | null,
  note: string|null,                             // why there is no interactive
  avoid:[brief]|null, feedback: string|null,      // Learn it again: briefs to avoid, Dan's note
  request: string|null,                           // the Learn it again request it was written for
  verified:{ status:'done'|'failed'|'skipped', at,  // the fact-check (section 7); null while it is
    applied:[{ path, problem }],                  // still owed (a building doc); absent on older
    notes:[{ path, problem }] } | null,           // lessons, which say nothing about a check
  error, errorCode?, errorDetail?,                // when failed
  flags:{ [key]:{ note, at, stage } } }           // "This looks wrong", newest 30; kept when the
                                                  // lesson is rewritten or a stopped job puts it back
```
A lesson is whole, and only then shown to Dan, when it is `ready` with its `lesson`: its
interactive built and tested, or none and the `note` saying why. `writing` and `building` are
internal (a job is writing the text, or building and testing the interactive): no screen opens or
studies such a doc; they say it is being prepared. `U.store.lesson.state(doc, live)` says what a
doc means: `ready`; `preparing` (this page's job is on it, by `live`, else a writing/building doc
touched within the last 4 minutes, which a running job's 45 s heartbeat keeps fresh, and not
abandoned); `failed`; `none` (nothing yet, or work that stopped: opening the lesson prepares it).
`U.store.lesson.abandoned(doc, live)`: a writing/building doc held by this tab (`by.tab` is
`U.tab()`, an id no other open tab holds) with no job of this page on it. Its job died with an earlier load of the tab (a reload)
or ended without saving, so nobody is working on it however fresh it looks; the generator does not
wait for it either. The screens that follow the next idea start such a prefetch again (section 7).
`topics/{tid}/research/{key}`   key `'topic'` (always written) or an idea id (when it has notes):
`{ notes:[{ claim, sourceIds:[n], contested? }], sources:[Source], at }`

Private, under `data/users/{uid}/`:
```
profile   { prefs:{ theme:'light'|'dark'|'system', size:'s'|'m'|'l'|'xl', easy, cap:10|15|20|30, light, lightDay?, pictures? },
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
    readRound?,                                                // v9: the round finished as a read lesson
    againAt?, relearn?, relearnId?, relearnAt?, relearnNote?, known? } } }
```
`readRound` (v9) is written with `stage: 'done'` when Dan finishes a read lesson, with `cardsRound`
set to the same round (it makes no cards, so nothing makes them later). An idea is **read** while
`readRound` equals its `round` (`U.views.isRead`): the topic page's path says "Read", the Map gives it
its own dot, and Today, a review, the badge, the Map's bands and Learn it again leave out every card
of it, even one left from an earlier, studied round (`loadCards` in 60-today.js). A new round (Learn
it again, Rebuild) is no longer read until it is finished as one.

`relearn: true` alone is Today's suggestion (the idea was slipping when Today looked): it never
rebuilds a lesson by itself. With `relearnId` it is Dan's open Learn it again request (Today's link
followed while the idea is slipping, or Rebuild): `relearnId` is its token, which the rewrite stamps
on the lesson doc it writes (`request`), `relearnAt` when he asked and `relearnNote` his "This looks
wrong" note for the writer. Opening the idea writes the fresh lesson. The request stays open, and
the round unchanged, until the fresh lesson is whole; the round that begins then clears them all
(section 7). `known` is read alongside the plan's `known`, but nothing writes it at present.

`profile/cards/{tid}`
```
{ cards:{ [cardId]: Card } }        cardId = iid_checkId, or iid_say for the recall card
Card = { id, tid, iid, type:'choice'|'order'|'estimate'|'target'|'recall', spec, createdAt, learnedAt,
         s:{ due, stability, difficulty, reps, lapses, last }, hist:[{ at, grade:1-4, ok }], retired? }
```
`hist` keeps the newest 40. `retired`: unusable (its interactive is gone, or it was skipped in
review); learning the idea again clears it.

**Dossiers** (75-dossier.js). A course "keeps a dossier" unless Dan turns it off on its topic page:
`progress.dossier === false` (absent or true: on; private, so turning it on or off never moves the
course in Learn's list). Each idea he finishes is bound as a chapter: a snapshot of the lesson's own
content when he finishes it, taken again (a new edition) when he learns it again. It is a
teach-you-how book (v9): the explanation, analogy, plate, "Put it into practice" and
sources, and never a test question, answer or trap (the snapshot no longer keeps checks; older
chapter docs that still hold them are never printed). Nothing he wrote, chose or scored is ever
read into a dossier: not `topic.query`, `progress.ideas[iid]` beyond
`startedAt`, `doneAt` and `stage`, `progress.questions` or `calibration`, a lesson doc's `feedback`,
`request` or `flags`, the lesson's `predict` or `say`, or any card.
`profile/dossiers/{tid}` (the index, small)
```
{ v:1, tid, title, hook, oneBreath, ideas:[{ id, title, oneLine, deps, kind }],     // the plan, as course content
  research:{ sources:[{ title, url, quotes:[<= 4] }], ideas:{ [iid]: [source index] } },   // for the bibliography
  startedAt,                                  // earliest progress startedAt ("Begun")
  chapters:{ [iid]:{ doneAt, edition, plate: bool, title } }, count, total,
  finishedAt,                                 // the last chapter's doneAt once every idea is bound, else null
  createdAt, updatedAt, kept?, keptAt? }      // kept: the course was deleted and its dossier kept
```
`profile/dossiers/{tid}/chapters/{iid}` (one per chapter, under 240 KB of JSON)
```
{ v:1, tid, iid, title, oneLine, kind, deps, doneAt, edition, boundAt, sourced,
  lesson:{ title, explain, analogy, interactive:{ title, brief, whatAmILookingAt, ignores, numbers, controls, outputs } | null,
           practice:{ text } | null, sources, confidence, contested },        // practice: v9 lessons
  plate: the interactive's html | null, plateNote: string | null }   // a plate that would not fit is left out, with the note
```
Bound only from a `ready` lesson doc. `U.dossier.bind` runs when an idea is finished (50-lesson.js,
the first time through or a new round). Ideas finished before dossiers existed, or bound while the
save failed, are bound from the stored lesson docs (backfill, `U.dossier.sync`) the first time in a
page load that the Library or that dossier opens, one after another, only for courses that keep a
dossier, skipping an idea whose Learn it again request is open (its doc may be the fresh lesson).
The count, finished date and shelf come from `chapters`. Deleting a course asks whether to keep its
dossier (kept by default; the plain confirmation when it has none): kept, everything finished is
bound first and the index marked `kept`; otherwise the dossier docs are removed after the course.
A kept dossier opens with no course behind it.
What the pages print is derived by fixed rules (`U.dossier.model` and the page builders), so nothing
is invented: the field note (the Key idea tile) is the explanation's closing all-bold paragraph
(taken out of the explanation); the clipping is the first quoted source cited after its opening
paragraph; "Where it breaks" is `analogy.breaks`; "Look for" is the brief without "The one thing you
should see is"; "A number from the sources" is the first cited constant the explanation does not
already quote; Compare is the
plan's `deps` and the ideas that build on this one (links only to bound chapters); How certain is
`confidence` said once (or "Not yet source-checked" for an unsourced lesson); the glossary is each
`[[term]]` with the sentence that introduces it (with the one before when it opens "This/That/
These/It/Such"); the bibliography is one entry per address across the research and the bound
lessons, title split on " — " into work and publisher, with the chapters resting on it. "Put it into
practice" is `lesson.practice.text` sorted by `U.dossier.practiceParts` into the practice page's parts,
word for word: a part is named by its own lead label (on a line of its own, "**Label**", "## Label",
or before its text, "Label:" / "**Label:**"), the label's words saying which part ("mistake",
"pitfall", "avoid"… the common mistakes; "rule" the rules of thumb; "example", "worked" the worked
example; "step", "how to", "checklist"… the steps); with no label, the first list is the steps, a
paragraph that opens by naming its part ("For example, …", "A common mistake …") is that part,
and any other block carries on the labelled part before it, else is plain prose. A chapter without
practice (bound before lessons had it) ends with its sources on a page of their own. The title is
always `topic.title` (the index's `title`), never `topic.query`; the focus bar's mono path names the
course by the title's words (`U.slug(title)`), never the query either.

The pages (the field guide, design 3, Dan's choice on 10 Oct; `docs/design/dossier-field-guide/`)
are D4 tiles in the app's own tokens (section 12): two columns with a 10 px gap and 16 px gutters
on a phone, four columns from 55rem (`#view`) up to `--wide`, half tiles going across where the
page is under 18.5rem for its words (a phone at the larger text sizes). Tiles: white (headline
tiles, the chapters grid, finished dossiers; the page's first tile carries `--shadow`), grey
(`--sunk`, reading panels), emphasis (2 px `--edge`, a hard 3 px shadow: the key idea, the rule of
thumb), ink (`--heading`: progress only, the Bound tile), warning (`--red`: where it breaks, each
mistake) and dashed (chapters not yet written, kept dossiers). Labels are `--mono` in capitals,
the idea's kind `--cond` in `--teal`, everything else Barlow (`--sans`); Easier reading turns all
of it to Atkinson. The page builders, in reading order (`model().leaves`):
- **At a glance** (`#/book/:tid`; the cover and the contents in one): the title tile ("Dossier 01 ·
  A course in 8 ideas", the title as h1), the course picture (when pictures are on, said to be
  drawn by an image model), Bound (ink: a ring and n/N; finished: "Finished", the date and a green
  ring; kept: "Kept from a deleted course") beside Begun (the date, the year and the number of
  sources), the chapters grid (a cell per idea: a bound one links, with an ink tick; an unbound one
  is dashed, not a link, and says "not yet written" to a screen reader), the question it set out to
  answer (`hook`), In one breath, Keep a copy (Save a copy), then the glossary and bibliography as
  two small tiles. A finished dossier's date sits beside a smaller ring, sized to the tile, and the
  ring and the stats go one above the other only where they do not fit side by side, so the date
  never runs out of the ink. From 55rem, in the same order: Bound over Begun beside the picture,
  the chapters four a row, then the question beside In one breath.
- **A chapter** (`#/book/:tid/:iid`), top to bottom: the header (the numeral in its box, "Chapter
  II of VIII" and the kind, the idea title as h1), Key idea (the field note; none, no tile), the
  plate (grey: "Plate II" and its title as the plate's h2, and Tap to play, over the lesson's
  interactive in a flat `--surface` well, asleep until played, then "Look for"; a plate too big to
  keep shows its note), What's going on (the explanation with key terms and source chips, the
  clipping after the paragraph that cites it), Think of it like beside Where it breaks (the analogy
  across when it has no breaks), Compare beside How certain (three pills, this chapter's filled),
  then the plate's notes (A number from the sources and What you're looking at and What this model
  leaves out, two short ones side by side), The numbers on this plate (n), then the contested views
  (a tile each, two to a row). Every tile's label is its h2. The plate's height is held from the
  first paint, as a lesson's panel is: the height this device last measured for that plate at that
  width (`localStorage` `mu-dos-h:{tid}:{iid}`, plus `:wide`/`:laptop`), else 720 px, so what
  follows barely moves when it arrives; a look, never written to the dossier.
  From 55rem the header and key idea run across, the plate and the explanation take three of the
  four columns and the analogy, Where it breaks, Compare and How certain stack beside them; the
  notes and the views follow across the four columns, two to a tile.
- **Put it into practice** (`/:iid/practice`): a heading with no tile ("Chapter II · title"), the
  parts as tiles (`practiceParts`): the steps as a numbered ink checklist in a white tile, the rule
  of thumb in the emphasis tile (its first sentence large, the rest smaller, word for word; the
  first sentence is 34 px up to 26 characters, then steps down to 26 px up to 70 and 21 px beyond,
  so a long one stays a few lines), the
  worked example and any other prose in grey, the common mistakes as one warning tile each, two to
  a row (an odd last one across; a part written as paragraphs, one tile across), then Sources: a
  grey tile per source, two to a row, with its number chip, the publisher (the title split on
  " — "), the quote and the host, opening in a new tab.
- **Glossary and bibliography** (`/glossary`, `/bibliography`): a grey tile per term (the term
  highlighted, its sentence, "First met in chapter …") and per bibliography entry (the chapters
  resting on it as a row each, its numeral and title, its quotes collapsible); with no key terms the
  page is the bibliography alone. Opened at `/bibliography`, the path and the page bar say
  "bibliography" (the same page of the book).
Links Dan taps on their own (a source's host, a chapter in the bibliography, "First met in …",
Compare's chapters, the page bar) keep a 44 px target; a chapter reference never breaks ("ch. V").
Every dossier page has D4's focus bar (an outlined back button one level up: a chapter to At a
glance, its practice to the chapter, At a glance to the Library; the mono path, the course's part
giving way first, cut at a whole character so its ellipsis meets the next slash; Aa) and the
floating page bar (section 10). Save a copy writes the same tiles as one static page, in the same
order. The Library's Dossiers (`#/library/dossiers`): a lead tile for the dossier most recently
bound that is still being written (its ring, and a bar per idea: bound ones filled ink, the rest
dashed, numerals under them in `--muted`; over 10 ideas, narrower bars with no numerals in
balanced rows of up to 12, read left to right; the bars go below the ring where they do not fit
beside it), then half tiles (being written, finished, kept) and "In your own words"; a load error
shows the app's error panel on its own, not inside a tile.

**Course pictures** (35-art.js, version 10). `prefs.pictures`: absent until Dan answers Learn's
one-time question (asked below his topics once the profile has been read, only when the connector
is there), then true or false (Settings changes it). `art/{tid}` (shared, like the topic; its own
doc so the topics list stays small and a kept dossier keeps its picture):
```
{ status:'making'|'ready'|'failed', src: 'data:image/webp|jpeg;base64,…' (800x450, under 190,000 characters),
  scene, model:'Z-Image Turbo', seed, at, by?: the page drawing it (while making), code?: why it failed, updatedAt }
```
How one is drawn: a quick Claude call (`TASK: cover-picture`, U.prompts.coverPicture / U.validate.cover:
6-35 words of real things to look at, never writing, diagrams, maps or famous faces) writes the
scene; the page calls the viewer's connector **Claude MCP** (Dan's Hugging Face connector, with the
Space mcp-tools/Z-Image-Turbo as `gr1_z_image_turbo_generate`) with the scene plus the house style
(U.art.prompt: field-journal ink and watercolour, no text), `resolution '1280x720 ( 16:9 )'`,
`steps 8`, `random_seed true`; the reply's image block (or, failing that, its image link) is
cropped and re-encoded on a canvas to WebP (JPEG where the browser cannot write WebP).
Consent first: "Draw the pictures" (Learn) or the Settings switch asks for `mcp:Claude MCP` before
anything is turned on; granted, `prefs.pictures` becomes true; refused, false (only if he had not
answered before), and Settings shows "Not allowed for this app" with Open permissions whatever the
switch says; closed without choosing, nothing changes. Unattended drawing runs only while that
grant reads `granted` (an unattended call never opens the prompt): Learn queues every planned
course without a picture (and the topic page its own), one at a time, the scene call in the
background lane; the claim (`making`, a 4-minute lease, read fresh first) is written after the
scene, just before the image call (120 s limit). A failure is recorded with the old picture kept
(`code`, and the model's own words as `detail` for a tool error); anything but a bad picture stops
the queue for the visit; a failed course waits a day before it is tried by itself again, or until
Settings' Open permissions / Check again (refusals before then are due again). "Draw a new one"
on the topic page redraws in the foreground (a second tap joins the first) and keeps the old
picture until the new one is saved. Writes are quiet (never held, never a toast, never red);
nothing is written once the course is gone. The pictures are read once the app has booted (when
shown), so covers and the dossier's picture tile have them before they are drawn. Shown inside
every V.cover svg (`image.cv-art`, a little dimmer in dark mode) and as a tile on the dossier's At a
glance page (said to be drawn by an image model), unless `prefs.pictures === false`; the topic page says it was drawn by an image model, for
decoration only. Deleting a course deletes its picture unless its dossier is kept.

## 5. Lesson JSON (what generation writes, what the player plays)

`U.validate.lesson(o, {iid, sources, final})` in `30-prompts.js` is the truth; in short:

**Length limits are soft** (every validator: plan, research, lesson; grade has none). A model
cannot count words or characters exactly, so a limit on length (characters, words, sentences:
the "<= n chars/words" below) never throws a reply away: up to `U.validate.allowed(max)` (max +
15%, at least one unit: 170 words -> 195, 6 words -> 7) is not reported at all; past it the
problem is reported and listed in `problems.soft`, so U.ask's one repair asks for a cut and then
accepts the reply (section 3, Runtime). Judgements made by matching words or numbers are soft for
the same reason (a match can be a coincidence): a plan calibration question whose right answer is
already printed above it on the topic page, and the lesson judgements below. Everything else is
hard: missing fields, wrong types, bad or duplicate ids, unknown sources, unreachable targets, web
addresses, and counts of list items (2-3 checks, 5-8 ideas, 1-2 controls). The prompts still ask
for the same limits. `problems.warnings` holds advice that is never a problem (no repair, nothing
thrown away; `tools/eval/validate.mjs` prints it).

```
Lesson = {
  iid, title,                                    // title <= 90 chars
  predict: { q, options?:[2-4], reveal },        // reveal shown after play
  interactive: {
    brief,                                       // "The one thing you should see is ___ when you ___."
                                                 // (the "when you" half never gives the answer away: section 7)
    title, controls:[1-2 Control],
    outputs?:[0-3 { id, label, unit?, decimals? }],   // label <= 30 chars, unit <= 10, decimals 0-6
    whatAmILookingAt,                            // <= 120 words: the rule in plain words
    ignores,                                     // what the model leaves out (honesty panel)
    numbers:[{ label, value: number|string, kind, source?: n }]
  } | null,                                      // null only when nothing can be manipulated
  explain: { text },                             // <= 170 words, U.rich syntax, no links or HTML
  analogy: { text, breaks } | null,
  practice: { text },                            // "Put it into practice": <= 160 words, U.rich syntax
  say: { prompt, rubric:[2-3], model } | null,   // null in a read lesson
  checks:[2-3 Check],                            // ids unique; [] in a read lesson
  sources:[Source],                              // final: 1..n in order of first citation, all cited
  practice: { text } | null,                     // v9: Put it into practice (section 4, v9 contract)
  mode: 'study'|'read',                          // v9: the mode it was written for (read: no predict, say, checks)
  confidence:'settled'|'simplified'|'contested',
  contested: { views:[2+ { label, text }] } | null,
  mode: 'study'|'read',                          // the topic's mode it was written for (stamped by 31-generate)
  format?: 'steps'                               // read lessons only (rejected on a study lesson); absent: the usual layout
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
- `format: 'steps'` (a read lesson only): the interactive IS the lesson, a sequence of explanation
  screens and puzzles in one kit page that calls `K.complete()` at its end. The lesson screen shows
  only the title, the frame full width, and (on `K.complete()`) the done section, with the sources
  in a collapsed "Sources (n)" there; explain, practice and sources stay in the JSON so the dossier
  and Library bind the chapter as before. With no frame to show (no interactive, a build note) it
  falls back to the usual read layout (section 10).
- `practice.text` ("Put it into practice"), in both modes: steps in order or a checklist (a block of
  "- " lines), a rule of thumb or two, one worked example with real numbers or a real case, and the
  common mistakes, the other blocks opened by a bold label ("**Worked example:**"); for an idea that
  is not a skill (history, a concept), how to apply it: what to look for, how to check a claim, how
  to use it in a decision. The same truth rules as the explanation (its numbers by THE NUMBER RULE,
  sourced ones footnoted, nothing invented; where safety matters, the safe way first; money, health
  and law: how to work it out or check it, never what to choose). Required of every new lesson (a
  hard problem when missing; its length soft); a lesson written before version 9 has none, and
  the screens then show nothing. The dossier prints it.
- Mode (`U.validate.lesson(o, {mode})`, default the lesson's own `mode`, else study): a read lesson
  has `predict: null`, `say: null`, `checks: []` and no target checks, everything else as usual;
  the validator asks nothing of those three (a reply that has them is judged without them, with a
  warning, and `finaliseLesson` drops them before the sources are renumbered, so a source only they
  cited goes too). A study lesson keeps every part. The lesson screen shows a lesson read-style when
  its `lesson.mode` is "read" (whatever the topic says now), study-style otherwise.
- No interactive, no target check. An interactive with outputs and a numeric control but no
  target check is only a warning: the writer adds one only when reaching the value needs the idea.
  Given the idea's `kind`, the warning goes only to the kinds write-lesson offers target checks to
  (not history, structure or concept); `tools/eval/validate.mjs` passes it from `--topic`.
  A misconception belongs to a wrong option and speaks to Dan as "you".
- Soft lesson judgements, each message saying what to change: a target check's target (as its
  output's decimals round it) or an estimate check's answer printed in `predict.reveal` or
  `explain.text` (digit groups read whole, "1,000"; a whole number under 10 counts only with its
  unit, the output's or the estimate's, straight after it: "2 sounds" is no answer to 2x); a
  choice check's right option sharing 4+ consecutive words with `explain.text`, `predict.reveal`
  or `say.model` (two of them not little words, none part of a term the lesson marks [[like
  this]], and not a run the question or a wrong option also holds: words the options share give
  nothing away), whose repair asks to reword the outcome, keeping the lesson's names for things
  (when a wrong option or the question holds the run's start or end, two or more words that are
  not little words, the message quotes only the rest, widened to the shortest run that still
  counts, so the repair rewords the words that give the answer away);
  a right option of 4+ words over 1.5x the
  other options' average length in characters; a rubric point joining two ideas with ";"; a
  rubric point whose key words (2 or more) all appear in `say.prompt`; and, before renumbering
  (not `final`), a listed source nothing cites (with `final` that one is hard).
- No web address anywhere but `sources`. With `sources: null` (no research) the list is `[]`
  with no `[^n]`; given a list, each source's n and url must match it. Every `[^n]` and
  `numbers[].source` names a listed source.

The other replies: `plan` {title, hook (a puzzle question ending "?"), oneBreath, ideas: 5-8
{id 'i1'…, title, oneLine, deps (earlier ids only), kind, known?}, calibration: exactly 2 {id,
iid?, q, options: 3-4 distinct (trimmed, any case), answer, why}} (soft: the right answer must not
be printed in the title, hook, oneBreath or an idea's title or oneLine, which Dan reads above the
questions. Reported only when a word match is reliable: the whole right option, 3+ words, word for
word; or every word only the right option has, at least 2, within 15 words of one field);
`research` {sources, topic:{notes}, ideas:{[iid]:{notes}}},
a note citing at least one source unless contested; `intake` {questions: 2-4 {id, q (soft: <= 15
words, and not about his time or about tests, which the app and his mode settle), options: 2-5
distinct (soft: <= 8 words each), multi: bool, other: bool}} (an "Other" option is only a warning:
cleanIntake folds it into `other: true`); `grade` {met (one per rubric point), verdict
(got-it = all met, partly = some, not-yet = none), nailed, followUp ('' only when got-it), model?};
`verify` (the fact-check, `U.validate.verify(o, {lesson, sources})` in `34-verify.js`) {issues: at
most 12 {path, problem (<= 300 chars), severity 'fix'|'note', now (the whole new text of that
field, required for a fix)}}. A fix's path names one string field the lesson has: `predict.reveal`,
`explain.text`, `analogy.text`, `analogy.breaks`, `interactive.whatAmILookingAt`,
`interactive.ignores`, `say.model`, `say.rubric[i]`, `checks[i].q`, `checks[i].why`,
`checks[i].options[j]`, `checks[i].misconception[j]` (keyed by the option's index), `practice.text`,
`checks[i].items[j]`, `contested.views[i].text`. Frozen (a fix there is a hard problem whose
message says why and asks for a note): `predict.q` and `predict.options` (Dan may already have
answered them), the rest of the interactive spec (it is built from it), check ids, types, answers,
targets and every other check field, how many options or items a check has and their order, and
`sources`. A note may name any field the lesson has. One fix per field. The lesson with every fix
applied (`U.verify.apply`) is validated as the written lesson is (`{iid, sources, final: true}`):
each problem it has that the lesson as written did not is a problem of the reply, soft when the
lesson's problem is soft (a field made too long), hard otherwise (a [^n] to no source, an uncited
source, a web address, two options the same).

A read lesson (v9) makes no review cards: finishing it records `readRound` and `cardsRound`
(section 4) without calling `addFromLesson`, and its idea is never counted in review. Review cards come only from what Dan answered: each check he answered becomes a card of the
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
viewport, the kit CSS, `window.K_THEME` (`{dark, size, c:{palette}, roles?}`: `roles`, host-written
and never model-written, replaces the kit's own data roles hl, amberLine and fill1-3, for a host
with a palette of its own (none today: the dossier's plates take the app's theme); without it the
kit keeps its tuned roles; cat1-4 are always the
kit's), `window.K_BODY_LINE` (for error line numbers),
`window.K_TOKEN` (the frame's random token) and `window.K_QUIZ` (the output quiz mode hides, or
null), and the kit JS; the body follows in `<body>`. CSP: `default-src 'none'; script-src 'unsafe-inline';
style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none';
form-action 'none'; base-uri 'none'`. The frame is `sandbox="allow-scripts"` (never
`allow-same-origin`). The CSP stops the requests a page makes, not the frame navigating itself
away (a link it makes and clicks): that request still goes out, but the page it lands on is never
used. The kit takes the token and removes the script that held it before the body runs, and signs
every message with it (built on objects with no prototype, so a body's setters never see it). The
host trusts a message only from that frame's own window and with its token, so neither the body
nor a page the frame was navigated to can speak for the kit. When the page starts to leave
(`beforeunload` / `pagehide`, capture listeners added before the body's) the kit posts `leaving`
and the host removes the frame at once; a second `load` in the same window does the same (a frame
moved in the page gets a new window, which loads the kit afresh, and is kept). `document.open()`
(or `document.write()` after load) erases those listeners, so the kit also watches the document's
root element (a MutationObserver reading getters captured at load) and posts `leaving` when it is
replaced. The backstop is the heartbeat: the host pings each mounted frame every 2 s (`PING_MS`),
and anything the kit says with the token counts as an answer. A frame that has answered and then
misses 2 pings in a row (`MISSES`: 4-6 s of silence) is no longer the kit and is removed, onError
"stopped answering", like one that leaves; one that has never said anything is removed at 12 s
(`FIRST_MS`, the wait for K.ready) and never shown. The clock is `visibleTimeout`'s (time with the
app hidden does not count). A page busy with a long computation answers between its tasks (and a
frame that shares the app's thread stops the app's clock with it), so only a page frozen for
seconds is taken out. The kit's message listener is a capture listener added before the body's, so
a body's own listener cannot swallow the host's requests. The kit trusts only the parent it
captured at load. The API (full reference in `app/kit/KIT.md`):
```
pipeline   K.model(fn) K.update(fn) K.at(over) K.params() K.outputs() K.refresh() K.check(label, fn, {source?}) K.ready()
controls   K.control K.choice K.toggle K.stepper K.button         each {id, label, …, into}; ids = the lesson's
           K.control's snap: [values]: a drag within 2% of the range of one lands on it exactly (set and reach
           take it too; shown with its own decimals); − / + repeat while held (a click with no pointer, one step)
drag       K.drag(el, {control, toValue(x, y)}): the pointer in the drawing's viewBox units (px from el's top-left
           for HTML) -> the control's value (a slider fits it to range, step and snap). touch-action none
           (on the element, and on the <svg> holding a live handle, k-drag-root: Chromium ignores it on SVG
           shapes, so a touch drag would scroll the page and cancel), pointer capture, a 44 px target (an invisible k-drag-hit circle beside a small SVG handle, kept on
           it after every update and frame; k-drag-small for HTML), the slider follows (the keyboard's way in),
           and the first touch calls K.reveal()
outputs    K.readout({id, …, decimals?, afterMove?})  K.plot(target, opts)  K.bars(target, opts)  K.anim({step, …, button?})
           plot series, marks, shades, regions and lines take afterMove: true (drawn once Dan has moved; the
           axes are fitted to them from the start). A word readout's tile widens to its widest word shown.
sound      K.sound.tone / chord / stop / mute                     plays only after a press
until moved  class k-after-move, K.moved, K.afterMove(fn), K.reveal()
layout     K.stage(visual, controls, {max = 600, beside}): controls under the visual, fitted to max px
           tall in a frame under 560 px; beside the visual in a frame >= 860 px wide (unless beside:false),
           a side that is a grid or has a max-width filling its column up to it (k-fill), a
           fixed-size drawing the body centres keeping its size. The controls sit in a .k-side column;
           beside the visual, the .say and .k-readouts that follow the stage move into it (and back when
           the frame narrows)
helpers    K.el K.svg K.labels K.fmt K.near K.clamp K.lerp K.linspace K.round K.color(role, alpha?)  K.theme {dark, size, c}
           K.fmt prints −0 and a negative that rounds to nothing as 0 (no sign).
           K.color takes a role, its var(--k-…) form or a CSS colour; a colour word ('navy') or one the
           canvas can't draw is drawn as a role and fails the self-test. K.choice reads a number as the
           index when every option is a string ('1', '2', '4'). K.labels(group, items, {size = 13, avoid}):
           labels 13 units high unless sized, kept off other text, the edges, and the shapes in avoid
           (elements, a selector or a list: a line or path by its course, a filled shape by its box)
```
Messages (`postMessage`, each with `src:'kit'`; a reply carries its request's `rid`; kit -> host
messages also carry `tok`, the frame's token):
```
kit -> host  {type:'height', px}  {type:'ready', checks:[{label, ok, source?, error?}], beside}  {type:'error', message}
             (beside: a K.stage sets its controls beside the visual in a wide frame)
             {type:'change', params, outputs}   250 ms after Dan changes something; at once on Play / Pause;
                 at least every 2 s while changes keep coming (a drag, a slider an animation drives) or an
                 animation plays, as long as Dan touched the page in the last 5 min (U.boot.study)
             {type:'leaving'}   the page is navigating away (or was replaced): the host removes the frame
             {type:'complete'}  K.complete(): Dan finished the page (its last puzzle); the lesson screen
                 finishes a read lesson and celebrates (section 10); other frames ignore it
host -> kit  ping                    -> {type:'pong'}         the heartbeat
             quiz {hide}  reveal     (no reply)               quiz mode, below
             selftest {throwaway?}   -> {type:'report', report}
             get                     -> {type:'state', params, outputs, moved}
             set {id, value}         -> state | error       counts as a move
             press {label?}          -> state | error       a K.button, else a K.anim's Play; counts as a move
             inputs                  -> {type:'inputs', inputs:[{id, kind, label, value, …}], actions:[labels]}
             reach {control, output, target, tolerance, decimals?} -> {type:'reach', result:{reachable, exact, best:{value, output}|null, tried, error?}}
                 every setting of a choice; up to 2001 spread over a slider, then a closer look: the step at the
                 target itself and every step between two tried settings whose outputs fall either side of the
                 target (or next to the closest one), so fine sliders (0-5000 in ones) are judged on their own
                 steps. exact: some setting shows the target exactly at `decimals` (the lesson output's), else as
                 the output's readout rounds it (else the default rounding); −0 shows as 0. Every error result
                 (the kit's or the host's: too large, did not load, the page left) has exact: false
             theme {theme}           (no reply)
Report = { ok, errors:[], overflow, overflowDetail?, clipped:[], checks:[{label, ok, source?, error?}],
           sweep:{ ok, problems:[] }, controls:[ids], readouts:[ids], outputs:[model keys],
           inputs:[…], actions:[labels], ready, warnings:[], width, height, ms }
```
`ok` = no errors, no overflow, nothing clipped, at least one check and all pass, sweep ok,
`K.ready()` called. A word split across two lines counts as clipped; words come from
`Intl.Segmenter`, and scripts that wrap between characters (Chinese, Japanese), a soft hyphen,
and text the body lets break anywhere (`hyphens: auto`, `word-break: break-all`,
`overflow-wrap: anywhere`) are ordinary breaks, and so is text kept for screen readers (a 1 x 1 px
box, `clip: rect(0 0 0 0)`, `clip-path: inset(50%)`); turned SVG labels are compared by their own
boxes, not their upright bounding boxes. SVG text (svgNow) is also clipped when it is
under 11 CSS px (0.25 px allowed) in a frame under 560 px wide, has a stroked line, path or
outline through its letters (its box less the top 20% and bottom 22%; not faint strokes under
1.5:1 against the page, not a band at least 0.6 of its height, not a line hidden under a solid
shape painted between it and the text that covers at least 80% of the label, a backing pill, never a
small dot; not text with its own halo: a stroke painted under its letters (paint-order: stroke), at
least 2 px wide, within 1.5:1 of the colour behind it), sits on a marker-start / marker-end arrowhead, or has
under 3:1 contrast with what is behind its centre (the shapes painted before it there,
composited over the drawing's background; on the page, against both --k-bg and --k-panel).
Labels K.labels could not place clear of everything (more labels than room, avoid cannot be honoured)
give one fault per drawing instead of one per label ("K.labels has more labels than room in <svg>…: label
fewer things, or a key under the drawing, or a list beside it"). Labels on one row under 4 px apart are
advice (warnings). The self-test (KIT.md, "The
self-test") also sweeps every control, reveals the after-move parts, steps every `K.anim` for 3 s
(90 frames of 1/30 s) and, in a throwaway frame, presses every `K.button`, sweeps the controls
again at Text size XL (20 px) and looks once more in the other theme (light <-> dark, the kit's
own palette). Sweep problems include: a model output that is NaN or Infinity; `K.fmt` given a
non-number (it shows "—"); NaN, Infinity, undefined or "[object" in visible text, an aria-label or
an SVG shape's numbers (words the body wrote itself, in its HTML or a quoted string, are not
faults); an unknown K.color role; an SVG fill or stroke (attribute or inline style) that is a
colour name, a var() the kit does not define, a url(#…) to nothing or not a colour (initial, unset and
a value the page computes as a colour, such as color-mix() over the kit's variables, pass);
an echo: an output with a readout whose value (as the tile rounds it, not zero) one place prints
too, a text, an aria-label or a plot label, at two or more different values in the sweep (a fixed
reference or an axis tick matches one value at most; a setting where a control or another output
reads the same, Dan's own push while the grip equals it, does not count; digits inside a word or
code are not the value); `K.sound`
played from an update while the controls are swept; no control or button in view when the page
opens (all inside `.k-after-move` or a hidden box); a `K.anim` whose Play button is not on the
page; a K.drag naming no control, or whose toValue at the drawing's centre or corners throws or
gives a value its control cannot take. A K.drag whose element left the page (the body redrew it in
K.update, so the binding is lost) is a warning that says to create it once and move it. Errors include a `.k-after-move` block over 180 px tall (a
blank hole). Warnings (throwaway frames) include a switch, slider or button that starts a K.anim
which has its own Play button, and a Play button whose motion flips a switch.
A body that navigates its test frame away fails ("navigated its frame away"), keeping what its
self-test found if the report arrives first. On a phone a staged canvas whose height is capped
keeps its shape (its width shrinks with it). SVG halos (`k-halo`, .25em of the page colour) skip
text with a stroke of its own or a fill that is not a plain colour.

Quiz mode (contract Q), while Dan answers a target check on the interactive (a target check in a
lesson and a target review card both mount it so, from `41-cards.js`, hiding the check's `output`;
pressing Check sends `reveal`, so a miss's hint and the reading it names show together):
`U.sandbox.mount(container, {…, quiz: {hide: '<output id>'}})`. The srcdoc opens in it (`K_QUIZ`), so
the value never shows, and after every `ready` (a frame moved in the page loads the kit again) the
host posts `{type:'quiz', hide}` with the current state; `{type:'quiz', hide:null}` or
`{type:'reveal'}` ends it (`api.quiz(null)`, `api.reveal()`; `api.quiz(id)` starts one later). In
it the kit shows that output's readout as "?" (role img, aria-label "Hidden until you check your
answer"; `readout.text()` gives "?") and hides every `.say` element (`html.k-quiz .say`: visibility,
so nothing jumps). Nothing else is hidden, ever: no matching of numbers elsewhere, so reference
labels, axis ticks, bars and Dan's own input stay. KIT.md tells the body never to repeat a readout's
value elsewhere, and the self-test fails a page that does (an echo, above). `state` and `change`
messages still carry the real outputs (the app grades with them). The self-test runs with quiz
mode off (a quiz that arrives meanwhile waits for its end); test frames never have one.

Height: the kit posts the body's height, including content that spills out of a fixed-height
box (`body.scrollHeight`), capped at 6000 px; the host sizes the frame to it (hidden test
frames cap at 4000). A lesson keeps an interactive only after it passes (section 7).

## 7. Generation (in the page)

`30-prompts.js` owns the plan, research, lesson, grade and tutor prompts and every validator;
`33-interactive.js` the build and repair prompts; `34-verify.js` the fact-check's prompt,
validator and patcher (below). Each JSON call passes its validator as `schema`.
Tiers: intake and plan-topic quick; build/repair-interactive complex; the rest default (verify-lesson too).

The intake prompt (`U.prompts.intake(query, {level, mode})`, TASK: intake) reads what Dan typed and
asks for the 2-4 questions whose answers would most change how the course is built: what he wants it
for (practical use, curiosity, a decision, a job), which angle or part of a broad field, what he
already knows or has done, how hands-on or conceptual, a specific situation he has in mind; each
with 2-5 short options in his terms, whether several can be picked, and whether he may type his
own. Never what the level or mode settle, his time, or anything that would fit any topic. The plan
prompt states the mode ("HOW HE WANTS TO LEARN IT") and, given answers, shapes the course by them
(the angle, examples from his situation, the practical weight; never what is true, still from first
principles). For a read course the voice block says he is taught, not tested.

The write-lesson prompt gives the writer THE COURSE (title, the hook as the puzzle the course
answers, level, oneBreath, every idea as "id title — one line [kind]"), this idea, `prior`, Dan's
intake answers (the same short block as the plan's: his context for the examples, the worked
example and the angle), the
calibration questions with their right answers and whys (Dan has seen them: the predict and checks
build on them and never repeat them), `known`, the lesson's research and `avoid`/`feedback`. Its
rules are written once each, with at most one short example each, every example from outside the
subjects of the evals so far (vaccines, noise-cancelling headphones, rainbows, the Bronze Age
collapse, the seasons, tides, the Roman Republic; `EVAL_SET` in `tests/prompts.test.mjs` keeps
them out of every prompt, so an eval on those topics stays fair): per
part (predict, interactive, explain, analogy, say, checks, confidence), then NAMES AND TERMS,
CLAIMS THAT STAY TRUE and THE NUMBER RULE (these two are `U.prompts.truthRules({sources,
history})`, so anything that later checks a lesson against them reads the same words), SOURCES
and a closing checklist of what the writer can verify at the end. Every lesson has a practice
part ("Put it into practice", section 5): its truth rules are folded into CLAIMS THAT STAY TRUE and
THE NUMBER RULE ("every number in your explanation, practice and on the interactive"). In read mode
(`opts.mode`, default `topic.mode`) the prompt has no predict, say or checks parts, no calibration
block and no target checks, asks for `"predict": null, "say": null, "checks": []`, and its claim
rule speaks of the explanation and practice read again in his dossier (`truthRules({read: true})`).
From WRITING EACH PART to the end of the prompt that is about 2,700-2,935 words in study mode (a test
caps it at 2,950, history ideas with research among its cases; version 9's practice part added about
80) and about 1,900-2,050 in read mode (capped at 2,150). Some rules go only where they apply: the interactive's form by the
idea's kind (a labelled sketch map for a history or structure idea); date windows, period names
and timelines that run forwards (years BC counted as years after the first date, or a stepper of
dates in time order) to every lesson of a course with a history idea; to a history idea, its own
why (the chain the sources give: who acted, why, and what that led to, with how we know only
where a quote says so) in place of the physical why, a predict about the pattern the dates will
show (sooner or later, bunched or spread, before or after a named event, never a bare date), the
history limit (what the cause did not do, or where the pattern breaks), why it mattered then and
the bunched-dates check (overlapping date ranges are no evidence of spread; leave out any sourced
date a specialist would doubt); the predict's debate rule and
contested views from named scholars or peer-reviewed or university sources ("simplified" when
fewer than two remain) to an idea that is itself argued about (its title or one line says so, or
its own research has a contested note); target checks to kinds whose readout a real rule can
compute (not history, structure or concept); the sentence linking the idea to the course's puzzle
to the first and last ideas; a neutral-wording rule when a later idea's title or one line says
people argue; sound only when the topic or idea is about something heard; at most 2 new terms
and 2 numbers for a NEW learner, and simple arithmetic only (where a rule computes a readout, a
rule that needs more is said in words with two values the picture shows); and, in a lesson with
sources, one rule for what RESEARCH does not support: a textbook-standard fact only as
"textbooks add that …" (unfootnoted, never the only support for the predict's answer), a picture
of why only as "One way to picture it: …", any other plan detail left out.

The brief reads "The one thing you should see is ___ when you ___." The lesson screen shows Dan
only "Try this: " and the "when you" half before he plays (nothing, for a brief without that
half), and the whole sentence, "Watch for ___ when you ___.", after the reveal (`friendlyBrief` in
`50-lesson.js`), so the prompt has that half name the action and never give the answer away. The explanation aims for 140 words within
its 170: it lists what it must do (what playing shows, the why, the one line's claim, the
takeaway) and what it adds only if the rest came to under 140 words, a test the writer can make.
Checks are three, one per side (the why; the limit, a case the rule does not cover or covers only
partly; and a new case that compares amounts where the idea involves how much, how many or how
long), two only when a third would repeat the predict or the say-it-back.

The research prompt asks for causes before facts (what brings each idea's headline about: for a
physical idea what is physically different, for a historical one who acted, why, and what
followed) and spends its budget (8 searches, 4 fetches) in a stated order: causes, then the
one-line claims, the principle and constants each interactive computes with, a history idea's
dated events, and the rest. After a rate_limited or unavailable error it makes no new calls;
results that arrived in the same batch still count. It files each claim under the idea that
teaches it and under every other idea whose lesson needs it: a dated event under every history
idea whose period it falls in, quoting how it was dated when the page says so; a fact that limits
a claim under that idea. Quotes keep their qualifiers and dates, come only from before the "…" of
an excerpt that was cut short, and where possible show people acting on the rule; claims are no
stronger than their quotes.

`U.prompts.lessonResearch(research, iid, deps, ideas)` gives one lesson its notes and sources,
numbered 1..k: the idea's own notes, then the notes it borrows from other ideas (marked "(from
another idea in this course)" in the prompt), then those of the ideas it builds on (`deps`), then
the topic's. It borrows only when it has the course's `ideas` and other ideas' notes (the full
research reply, or stored docs with `others: {iid: doc}`): for a history idea, every note whose
claim names a year (a year with its era, a century, "c. 1450", a year after "in", "by", "from"…,
"years ago") inside the idea's own period, from the first to the last year its title, one line
and own notes name (none named, no dated note is borrowed); for any idea, every note that names
its id. Never a contested note, a claim it already has, or a note whose sources it already cites;
nearest ideas first (the earlier of two as near), at most 4 notes bringing at most 6 new sources.
Borrowed sources are numbered after all the others, so the rest keep their numbers either way.
Whatever numbers a lesson's sources passes the same research and ideas as writeLesson (which takes
the course from the topic): `31-generate.js` loads every other idea's stored doc as `others` and
passes `topic.ideas` to `lessonResearch`, so the app's prompt, its allowed sources and the
renumbering all agree; `tools/eval/validate.mjs` does the same, given `--topic`.

Pipelines (`31-generate.js`):
0. `intake(query, {level, mode, signal})` -> `{questions}`: one quick call (TASK: intake, schema
   `U.validate.intake`, the usual one repair), tidied by `U.prompts.cleanIntake`; nothing is stored
   (the screen passes his answers to createTopic). Rejects `{code, message}` like U.ask, in the
   app's words ("Claude's questions did not pass the app's own checks…"); an empty query rejects
   `invalid` without a call.
1. `createTopic(query, {level, mode, intake, onCreated(tid)})` writes `topics/{tid}` (planning, with
   `mode`, 'study' unless 'read', and `intake`, cleaned, or null), calls
   `onCreated` (Learn opens the topic to watch the plan form), then plans with `known` (up to 60
   ideas finished in other topics) and the topic's mode and intake (replan reads them again). Ready: plan fields (a title over 120 characters, possible now
   that lengths are soft, is shortened at a word) and `plannedAt`; research starts in the
   background and the first idea not marked known is written (foreground). A failed plan sets
   status failed with a readable `error`; `replan(tid)` tries again.
2. `research(tid)` never rejects and joins a run already going. No connector, or a view that
   cannot run page tools (`U.rt.toolsOk()` false, or the call rejects `tools_unavailable`):
   `unavailable`. Otherwise `running`, then one background call whose tools record every result
   that is not a tool error ("Tool error (…)" texts never count, so a refused URL is no evidence).
   The prompt sets a budget of 8 searches and 4 fetches (not enforced in code). A source survives
   only if its URL is not a copy or a test server (`U.prompts.copyHost`: web archives, caches and
   translation proxies, file-sharing uploads, a host labelled qa, dev, staging…), is a page the
   tools returned, and its quote is on that page: one text the tools
   returned for it (one excerpt, one full text, a title; a page searched and then fetched is held
   twice) holds every part of the quote between ellipses, however short, in the quote's order,
   each as whole words, except that the quote may start or end part-way through a word (between
   letters, in a part with whole words too). Numbers stay whole: digit groups join ("1,481", or
   with a thin or no-break space, is "1481") and a decimal point stays inside ("343.2"), on both
   sides. Text not in the results shape is one text. Notes keep only surviving sources (or are
   contested). A run that keeps no source is `failed` ("No source could be confirmed…", reason
   'none_confirmed'), never `done`.
3. `ensureLesson(tid, iid, {onStatus, background, signal})`: one job per lesson in the page
   (later callers join it). A ready doc comes back as it is; for a ready-made course
   (`topic.readyMade`, section 4) anything else rejects `{code:'coming_soon'}` with nothing written
   and no status left behind (so does `relearn`, and `research` resolves null untouched); a `building` doc with a lesson only
   needs its interactive; otherwise: claim the doc (`writing`); wait for research (at most 120 s
   from its start, 15 s for the topic's first lesson; start it if there is none; after 10 min
   retry an unavailable one, or one that did not finish (failed with reason 'error', or `running`
   older than 8 min) up to 3 runs in a row (`tries`), never one that finished confirming no
   source: Dan's "Check the sources again" runs that); write the
   lesson for the topic's mode as it is now (read from the topic as the writing starts, so a switch
   reaches every lesson written after it), with this lesson's research, `known`, `prior` (`priorSummary` of earlier lessons),
   `avoid` and `feedback`; a reply that still fails the checks after U.ask's repair (`invalid`
   or `bad_json`) is written once more from scratch: a fresh call with the same prompt (and its
   own repair), status line "Having another go at writing this lesson…"; any other error keeps
   its handling below. Stamp `lesson.mode` (a read lesson's predict, say and checks dropped first);
   keep only citations of checked sources, renumbered 1..n; save
   (`building`, `verified: null`); then the fact-check and the interactive's build start side by
   side (below); once both are over, save `ready` with the checked text and `verified`, and the
   interactive or, without it, a `note`. A lesson with no interactive is checked, then saved
   `ready`. A `building` doc taken up later (resumed) runs the check beside its build when its
   `verified` has no status; one already checked keeps it.
   `onStatus(text, meta)`: `meta.redo` means the step in progress is being done again (the
   lesson screen rewrites that line instead of ticking it off); `meta.failed` carries the
   failure text (the screen shows it once, under the step that failed, never as a step).
   Target checks the page cannot reach are dropped. `background` marks a prefetch: its calls go
   with priority background, and aborting `signal` cancels it until a foreground caller joins.
   A cancelled job stops waiting at once (for research, Claude, the interactive's build, another
   device) and leaves the doc as the rules below say.
4. `relearn(tid, iid, {onStatus, feedback, request, signal})` writes a new lesson, avoiding up to 3
   earlier interactive briefs; `feedback` (Dan's note, up to 1000 characters) is put to the writer;
   `request` (his request's token) is stamped on the doc as `request`, and a job that picks a
   rewrite up part-way (ensureLesson's takeover) keeps the doc's token. Holding the lease, it reads
   the doc once more before writing: work stamped with its own request (another screen with the
   same request got there first) is not done twice (a whole lesson comes back as it is; one being
   written is waited for, or finished if its writer stopped, as ensureLesson's takeover does), and
   work stamped since the rewrite began with another request (a newer one, from another device) is
   never written over: the rewrite gives the lesson up to it, as a job that lost it does (released
   lease, `superseded`, waits for that work). Aborting `signal` cancels it: a call still waiting
   for another job never starts, a running one stops as a cancelled job does. It
   never joins a job running for that lesson (a first writing, an interactive still building,
   another relearn). A foreground one (Dan is waiting for it) finishes first; a background one (a
   prefetch, or a lesson he left while it was being written: `demote`) is cancelled (queued calls
   drop, running ones stop) and the rewrite starts as soon as it has put the doc back (a fresh
   claim undone, a written lesson left resumable). A rewrite keeps the doc's `flags`.
5. `grade(say, answer, attempt, {previous, title}) -> {met, verdict, nailed, followUp, model?}`.
   A blank answer is not-yet without asking Claude. Attempt 1 never shows the model answer;
   from attempt 2 a miss carries `model` (the lesson's own when Claude gives none).
6. `tutor(messages, context, {onText(textSoFar), signal}) -> string`: `context.about` (D4, section 12)
   says what Dan has just done when he asks from one of Claude's notes (`{kind:'check', q, correct,
   picked?, answer?}` or `{kind:'say', text, verdict, followUp}`); the prompt then adds a "WHAT HE HAS
   JUST DONE" block (he has seen that result, so explaining that check's answer is fine). The context is filled in
   (topic, idea, lesson, research), the last 16 turns go, and `web_fetch` may also open the
   lesson's and the research's sources. Tools go only where the connector is there and
   `U.rt.toolsOk()`; a `tools_unavailable` rejection asks again without them (the no-tools prompt).
7. `status(tid) -> {planning, research, lessons:{iid: 'writing'|'waiting'|'building'|'ready'|'failed'}}`
   (this page only); `knownIdeas(excludeTid) -> [{title, topic}]`. Progress is broadcast as
   `U.emit('gen', {tid, iid, kind:'plan'|'research'|'lesson', status, text})`.

The fact-check, "verify-lesson" (contract V; `34-verify.js`, pure like `30-prompts.js`). Why: the
run-2 panel found an absolute or over-broad claim in every lesson, misread dates, skipped causes
and checks whose right answer was arguable, which the writer cannot see in its own text.
`U.prompts.verifyLesson(topic, idea, lesson, {research, later, level})` gives a fresh reader the
lesson JSON with its numbered sources and quotes, the research notes the writer had (the same
`lessonResearch`, numbered [R1]… apart from the lesson's [^n]), the course's later ideas (title and
one line; default: those after this idea), Dan's level, `truthRules` (the writer's own CLAIMS THAT
STAY TRUE and THE NUMBER RULE) and what to check: general claims true across the interactive's
whole range, in everyday life and after every later idea; dates read correctly; numbers by the
number rule; one defensible right answer per check, its wrong options really wrong (only when the
lesson has checks); the practice: every step works and is safe as written, the worked example's
arithmetic right, its real figures sourced or textbook-certain, its common mistakes real; nothing
beyond what the cited quotes support unless worded as a picture or a hedge; the parts agreeing. A
read lesson gets the read voice and claim rules. No tools;
tier default; its schema is `U.validate.verify` (section 5), with the usual one repair.
`U.verify.apply(lesson, reply) -> {lesson, applied, notes}` rewrites each fixed field (once; a
refused or empty fix, or a note, is recorded in `notes`). In `write()` it starts with the build:
the build works from the lesson as written (the verifier never touches the interactive's spec, so
the build stays valid for the checked text), and the doc is saved `ready` only when both are over,
with `verified: {status, at, applied:[{path, problem}], notes:[{path, problem}]}`. It never blocks
the lesson: any error, `VERIFY_MS` (90 s from the start of the step) without a reply, a rate limit,
a reply still invalid after its repair, or the job being cancelled saves the lesson as written,
`status: 'failed'`; a page without the step loaded saves `'skipped'`. A lesson with no sources is
still checked, for consistency and its claims: `'done'` with a first note "No sources were
available…". Relearn goes through `write()`, so it checks too; a prefetch's check goes with priority
background like its other calls (background calls run one at a time, so there it runs before the
build). Lines: "Checking the lesson against its sources…" ("…for consistency…" without sources)
before the build's own; if the build is over first, "Still checking the lesson against its
sources…" after its last line. The lesson screen says what it did in one quiet line in its Sources
panel (section 7's lesson screen); the topic page's Library claims a check only as far as the docs
say so (section 4).

One writer per lesson, across devices and tabs. The holder is `device/tab` (localStorage
`mu.device`, sessionStorage `mu.tab`, read as the job starts and kept by it), named in the doc's `by`. A job claims the db's lease on
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
exemplar by kind, Dan's level (new: every rule in words, no formula beyond arithmetic; some: an
equation only with every symbol labelled on the picture) and the page rules (draw the cause and
let Dan cause it, mark the brief's quantity on the picture, bands on the axis they describe,
comparisons drawn alike, each output shown once, a snap for a setting the lesson names, a source
only on a check that restates its quote). Each body is self-tested at 340, 720 and 1040 px and checked against the
lesson: ids its checks need (`missing`), web addresses other than its sources (`foreign`), and
target checks that moving one control cannot reach (`unreachable`, via `U.sandbox.reach` at the
decimals the lesson gives that output).
Failures go back in a repair prompt, at most twice. After the last repair, a page that passes
its own self-test is still kept, with stray addresses stripped and unreachable targets reported.
Its status lines: "Building the interactive…", "Testing it at phone, tablet and laptop sizes…",
then one line per repair, "Fixing what the test found (try 2 of 3)…" (never the same line twice).

The lesson screen (`50-lesson.js`) opens a lesson only when it is whole (section 4). Until then
it shows only the preparation card: the eyebrow, the title, the idea's one line, the job's
`onStatus` lines as steps (writing, checking the lesson, building the interactive, testing it,
fixing what the test found; a doc that already has its text starts with "The lesson text is written"), and a calm
note ("This usually takes a few minutes. You can leave this screen; it keeps going while the app
is open."). Never Predict or any lesson text. It switches to the whole lesson when its job settles
or when the watched doc turns whole (another device finished it), resuming at the saved stage.
The idea counts as started (`startedAt`, `stage`, `lastIdea`) only once the whole lesson is on
screen. A failure shows Try again on the card. Learn it again happens only when Dan chose it and it
is current: his own open request (`relearnId` on progress), or Today's link (`/again`) followed
while the idea is still slipping (`U.review.slipping()`; when that cannot be told, his tap stands).
Today's flag alone, or a stale link, opens the lesson as it is. Learn it again (and Rebuild) takes
the old lesson off the screen at once and shows the card until a fresh lesson is whole: the one
written for his request (the doc's `request` is the progress's `relearnId`), never decided by
comparing two devices' clocks. The old ready doc is never adopted from the watch, nor from a job
that hands it back; a fresh one finished elsewhere is. One screen starts at most two rewrites of
its own for a request (a doc that comes back for another request, say another device rewriting it
too, is rewritten once more); then the card says so with Try again, which Dan must press. The
request (`relearn`, `relearnId`, `relearnAt`, `relearnNote` on progress) stays open until then;
only when the fresh lesson opens does the idea start its new round (round + 1, stage predict, guess
and checks cleared, the old round under `past`, `againAt` now, the request cleared). The screen
re-reads progress first and starts the round only while his request is still the open one in the
round it was asked in: another device that opened the fresh lesson first has begun the round
(this screen opens it in that round), and a newer request (Rebuild elsewhere) is followed instead;
two devices that read at the same moment are settled by the store (section 3: the first start of a
round stands). A screen writes only for the request it opened (Rebuild) or took up when it loaded.
When the request moves on elsewhere (the progress watch, read again once the screen's own request
has landed, shows a newer one; or a lesson for another request comes back), its own work stops
(the rewrite is cancelled by its `signal`, a takeover demoted and cancelled) and it follows: the
card says the fresh lesson is being written on the other device and opens here when ready, and
the watch opens it when it is whole. If that try fails there (the doc marked failed, or put back
as it was) the card says so with Try again, which opens the screen afresh, so the request is then
taken up here. A round begun on another device while the card waits stops this screen's work too,
and the screen opens on that round. A rewrite that fails leaves the idea as it was and still marked to be learned again
(Today keeps offering it); opening it again tries the rewrite again with his note, the card's
first line saying so ("Trying again for the fresh lesson you asked for[, with your note]"). Work
on the fresh lesson that has begun is finished, not begun again: whole, it opens as the new round
(its rewrite finished while he was away); writing or building (or cut off by a reload) it goes
through `ensureLesson`, whose claim carries his note, the briefs to avoid and the token.

Explain's Sources panel ends with one quiet line (muted, small; no badge) from `doc.verified`:
"Checked against its sources: N corrections made." (one: "1 correction made."), "Checked against
its sources." when nothing needed correcting, and, for a lesson with no sources (no panel), the
same line under its "Not yet source-checked" note: "Checked for consistency (no sources were
available)."; nothing when the check failed, was skipped or never ran. Before play the lede says
only "Try this: …" (above); target checks open in quiz mode (section 6).

A say-it-back answer is filed under the round it was given in (the grade may land after a new round
began); only answers of the round on screen count towards it. During the checks, Ask Claude is told
the settings of the interactive Dan is using: a target question's own copy (its card's `mount`)
while it is the question on screen, else Play's. "What am I looking at?" shows a control's value
from the frame only as a number or one of the lesson's own option names (an option value the
frame reports is mapped to its label through `inputs()`, and shown only when that label is one of
the lesson's names, never by its place in the frame's list), never other text from the frame;
anything else leaves the starting value alone.

Screen readers and keyboards: results are said in one polite live region (`.lsn-said`: what happens
after "I've had a play", "Reading your answer…", the verdict with what he nailed, "Here is a model
answer.", "Question n of m."), and focus moves to what has just appeared (the answer, the verdict,
the model answer, the next question's heading, the next item to place on an order card, Continue
carrying the verdict on a checked card), never left on a removed button. In a lesson the page's
scroll padding reserves the sticky lesson bar, so a focused element never sits under it.

The steps on the card are one line each. A doc with its text starts with "The lesson text is
written", then the fact-check's line (when it still owes one) and the build's own lines (resuming
adds no line of its own); both a fresh write and a resume end the build with the line for what
really happened, "Interactive tested and ready." or "Finishing without the interactive…" (then
"Still checking the lesson against its sources…" if the check is not over). A step that did not work out (a test that found
problems, a repair that did not pass: the next line is a repair or "Finishing without the
interactive") ends with a quiet dash, never a tick; the step a failed job stopped at gets the red
cross. A lesson whole without its interactive (none planned, or one that never passed its tests) is
played by what was built: Predict asks for a guess without "before you play", and Play is headed
"What happens" (said once: the answer under it has no second "What happens" over it), never with
the title of an interactive that is not there.

Prefetch: once a lesson is whole, the next open idea is ensured with `background: true`: written,
checked, its interactive built and tested, and saved `ready`, all as background work. Leaving a lesson
that is still being prepared demotes its job (`U.gen.demote(tid, iid)`) rather than cancelling
it. Both keep going while the app is open (they are not cancelled when Dan leaves the topic) and
yield to his foreground calls; opening the lesson joins the job and promotes its queued calls
(`U._gate.promote`). The finished screen ("Idea 2 is being prepared…" / "Idea 2 is ready."),
Learn's continue card and the topic page (header line; "Being prepared…" on a path node) say
which, from `U.store.lesson.state` over the watched doc and `U.gen.status`. A reload kills the
prefetch and leaves its doc abandoned (section 4), which is not "being prepared": when Learn or
the topic page finds the next idea Dan will study abandoned by this tab, it starts that prefetch
again in the background (`ensureLesson(tid, iid, {background: true})`, which joins or claims
under the lease rules), once per page load, and never any other idea (`V.lessonWatch`).

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
slipping idea (link `#/t/:tid/:iid/again`) and sets `relearn: true` on its progress (a suggestion:
it rebuilds nothing by itself). Following the link while the idea is still slipping opens Dan's
request; the lesson then calls `U.gen.relearn`, and starts a new round once the fresh lesson is
whole (section 7); until then the idea stays flagged and listed. "This looks wrong" offers the same
rebuild, with Dan's note as feedback.

## 9. Module APIs (cross-file contract)

`32-sandbox.js` (kit host)
```
U.KIT_JS, U.KIT_CSS (build placeholders);  U.sandbox.MAX_BYTES (150 KB), CSP, srcdoc(body, {theme, token, quiz}) (throws {code:'too_large'})
U.sandbox.mount(container, {html, title, onReady(checks, {beside}), onError(msg), onChange({params, outputs}), onComplete(), minHeight = 320, loading,
                            quiz: {hide: output id}, theme: () => K_THEME}) ->
   { el, frame, ready: Promise<checks|null>, selftest(), get(), set(id, value), press(label?), inputs(), reach(spec), theme(t?),
     quiz(id | null), reveal(), destroy() }
   ready is null if K.ready() has not come after 12 s; follows the app's theme and text size;
   a frame that starts to navigate away (or throws its page away) is removed at once and its later messages
   refused; one that stops answering the heartbeat is removed too (section 6); one removed from the page is
   destroyed. quiz / reveal: quiz mode (section 6). theme: a function giving the K_THEME to use instead of
   the app's (none today: the dossier's plates take the app's, like a lesson), asked again on every theme
   or text-size change.
U.sandbox.test(html, {widths = [340, 720, 1040], timeout = 8000, theme}) -> Promise<Report>   hidden frames, one width
   at a time, merged: a message seen at only some widths ends " [at 340 and 720 px wide]", a check
   passes only at every width whose page ran, ids / inputs / actions come from the first width that
   ran (one that timed out has none, and its error still fails the report), + widths:[{width, ok}]
U.sandbox.reach(mounted | html, {control, output, target, tolerance, decimals?}) -> Promise<{reachable, exact, best, tried, error?}>
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
U.interactive.advice(report, lesson) -> ['Advice: …']   the kit's warnings (source advice dropped when the lesson has
   none), and a check cited to a source whose quote holds none of the check label's numbers
```
`30-prompts.js`, `31-generate.js`, `34-verify.js`
```
U.prompts.intake(query, {level, mode})                                           TASK: intake
U.prompts.cleanIntake(intake | reply) -> {questions, answers} | null             (section 4)
U.prompts.planTopic(query, {level, mode, intake, known:[{title, topic}]})        TASK: plan-topic
U.prompts.research(topic, {ideas})                                               TASK: research
U.prompts.writeLesson(topic, idea, {research, known, avoid, feedback, prior, mode})  TASK: write-lesson
   (mode default topic.mode; topic.intake is read from the topic)
U.prompts.grade(say, answer, {attempt, previous:{text, followUp}, title})        TASK: grade
U.prompts.tutor(context) -> preamble (the pipeline adds the turns)              TASK: tutor
U.prompts.lessonResearch(research, iid, deps?, ideas?) -> {notes, sources} | null   numbered 1..k for one lesson (section 7)
U.prompts.priorSummary(lessons) -> [{iid, title, terms, analogy, brief, numbers, asked}]
U.prompts.verifyLesson(topic, idea, lesson, {research, later, level})            TASK: verify-lesson   (34-verify.js)
U.validate.verify(reply, {lesson, sources}) -> [problems] (.soft)   U.verify.apply(lesson, reply) -> {lesson, applied, notes}
U.verify.pathProblem(path, lesson, fix) -> string | null   U.verify.PATCHABLE   U.verify.MAX_ISSUES (12)
U.prompts.copyHost(url) -> why a source URL is a copy or a test server (section 7), or ''
U.prompts.urlKey(url) / words(text) / footnotes(obj) / VOICE / voice(mode) / modeOf(m) ('read' | 'study') / KINDS / NUMBER_KINDS
U.prompts.truthRules({sources, history, read})
U.validate.plan(o) / .lesson(o, {iid, sources, final, kind, mode}) / .grade(o, {rubric, attempt}) / .research(o, {ideas}) / .intake(o) -> [problems]
   problems.soft: the length problems among them (section 5);  U.validate.hard(problems);  U.validate.allowed(max)
U.gen.intake(query, {level, mode, signal}) -> Promise<{questions}>   (section 7)
U.gen.createTopic(query, {level, mode, intake, onCreated}) / replan / research / ensureLesson / relearn / grade / tutor / status / knownIdeas   (section 7)
U.gen.demote(tid, iid, {signal?}) -> bool   a foreground job Dan left becomes background work (aborting signal cancels it)
```

`35-art.js` (course pictures; data and flow in section 4)
```
U.art.shown()  wanted()  asked()   prefs.pictures !== false / === true / is a boolean
U.art.available() -> Promise<bool> (Claude MCP lists gr1_z_image_turbo_generate; cached, reset())
U.art.consent() -> Promise<grant state>   turnOn() -> Promise<'on'|'denied'|'undecided'|'unavailable'> (asks first)   turnOff()   loaded()
U.art.doc(tid)  src(tid) (data URL when shown and ready)  state(tid) -> 'ready'|'making'|'queued'|'failed'|'none'
U.art.paint(svg, tid)  (V.cover calls it: the picture now and whenever it changes)
U.art.want(topics)  (queues planned courses without one)   make(tid, {force}) -> Promise<'ready'|'busy'|'off'|'unavailable'|'gone'>
U.art.remove(tid)   prompt(scene)   fromResult(result) -> {data, mime} | {url} | null   seedOf(result)   why(doc)
emits 'art' {tid};  U.store.art.watch(fn(map))  get(tid)  set(tid, doc) (quiet; null once the course is gone)  remove(tid)
```
`41-cards.js`, `60-today.js`
```
U.cards.render(card, {mode:'lesson'|'review', lesson?, ask?(text, {chip, about}), onDone(result)}) -> Element with destroy()
   ask (D4): given, every feedback panel carries Claude's byline and a reply row (chips and "Reply to
   Claude…"); the lesson opens Ask Claude with it, the review too (about that card's idea)
   card {id, type, spec, s?}; lesson: the lesson doc (a target card mounts its interactive in quiz
   mode, quiz: {hide: spec.output}, and calls its reveal() when Check is pressed; its element's
   `mount` is that U.sandbox.mount api). Focus never drops to the page: an answer moves it
   to Continue (aria-describedby: the verdict), an order card to the next item to place (then
   Check), a recall card to its panel's heading
   result {correct, grade, answer, ms, auto?, verdict?, skipped?, pending?: Promise<{grade, correct, verdict}>}
U.cards.types / interactiveOf(doc) / controlOf(doc, id) / outputOf(doc, id) / verdictGrade(gradeResult)
   a target card names its readout and unit from outputOf ("make Time for one swing read 3 s")
U.review.addFromLesson(tid, iid, lesson, outcome, {round?, at?}) -> Promise<[cardId]>   outcome {checks:{id:{correct}}, say:{text, verdict}};
   round: recorded as cardsRound once saved; at: when he finished (else now)
U.review.mendCards(force?) -> Promise<[{tid, iid}]>   never rejects; at most once a minute after a clean run
U.review.queue({cap, light, extra}) -> Promise<[card]>;  dueCount() -> Promise<n>;  refreshBadge();  setBadge(n)
U.review.ideaBands() -> Promise<{tid:{iid: band}}>;  slipping() -> Promise<[{tid, iid, lapses, last}]>
U.review.outlook() -> Promise<{size, done, cards, minutes, head, lead, next}>   size = dueCount (same read); minutes = Today's
    "About N minutes" for that session (per card type; 0 when nothing waits), which Learn's reviews row shows too;
    head, lead, next = Today's words
    when nothing is waiting ("Done for today", ..., "Next up: 5 cards tomorrow." or ''); next counts cards the daily limit held back.
    Today and a review with nothing to show (#/review, #/review/more) draw the same words (clearBox in 60-today.js)
```
Views and app services
```
U.views (70-learn.js)   cover (six motifs, svg[data-motif]), asTitle(query), summary(topic, progress) -> {total, done, current, index, started, allDone, touched},
   MODES ([['study', 'Teach and test me'], ['read', 'Just teach me']]), modeOf(topic), isRead(progress, iid) (section 4),
   doneWord(topic, progress) -> 'read' | 'learned' | 'done' (what its finished ideas are called), INTAKE_MS (12 s),
   planningStuck(t) (planning, silent 90 s, not running here), researchStale(t) ('running' over 8 min),
   sourcesChecked(t) (done, sources >= 1: "Sources found"), sourcesNone(t) (the check ran but kept no source; section 4),
   loadError(what, e, retrying, {lead?}) (lead: the words before the reason, '' under a heading of its own),
   parked(e) (a watch the store parks: code 'unavailable'), reconnecting(e, info) (a watch with nothing shown yet is
   still coming back: info.retrying, or parked; loadError's retrying form), liveError(what, e) (a loaded screen's watch
   stopped: "Reconnecting…", or "<what> stopped updating" with Try again), reconnectPill() (the topic page's floating
   "Reconnecting…"), slowNote, savedLate(what) (U.rt.savedLate),
   extLink(url, label, cls) (a real link the viewer opens in a new tab; plain text unless http(s)),
   empty({title, text, action, art, h1}), back, day,
   lessonLive(tid, iid) (U.gen.status's word, if any), lessonBusy(tid, iid), lessonWatch(onChange) -> {watch(tid, iid),
   state() -> lesson state | null before the doc is read, stop()} (follows the next idea Dan will study; a prefetch
   this tab abandoned is started again in the background, once per page load), lessonNote(state, n, started, cls) -> "Idea n is being
   prepared…" / "Idea n is ready." (ready only when not started) | null
U.lesson.sourceSheet(source)    U.tutor.open(context, {ask?, chip?}?) / thread(tid, iid)
   context {topic, tid?, iid?, idea?, lesson?, lessonDoc?, stage?, getState?, about?}
   ask: a question asked as soon as the sheet opens (a reply to one of Claude's notes); chip: it was
   a chip, not saved as his question. While a reply is still coming it waits in the box instead.
   A reply streams in place (finished paragraphs drawn once; only the one still coming is drawn
   again) and a new question adds its own messages. The conversation is not a live region: one
   status line says "Claude is answering…", then the finished reply once (plain words; a list said
   as sentences, never its "- " markers). Try again on a reply that failed moves focus to that reply
   on a touch screen (the input would bring the keyboard up while it streams in), else to the input.
   The chips wrap (is-wrapped), every one whole. Under a conversation on a touch screen with the
   keyboard down, all of them while that leaves the conversation 45% of the sheet below its title
   (read as if scrolled to the top: at 0.47 and more the screenshots show his question and about
   five lines of the reply, at 0.44 four, at 0.42 three and a half); else the last ones are left out
   (the most useful first: Explain it differently, Give me an example; one at least) while they
   take more than one row. With a mouse, all of them. Only while the keyboard is up (is-cramped):
   one sideways row of them that fades at the edge it runs on past
U.book.collect(topics, progressByTid) / toMarkdown(book) / toJson(book)      exported with U.saveFile
U.dossier (75-dossier.js)   the course dossier (section 4, Dossiers; routes and pages: section 10)
   pure: chapterFrom(topic, iid, lessonDoc, doneAt, prevEntry) -> chapter | null;  researchFrom({key: researchDoc});
     practiceParts(text) -> [{kind: 'steps'|'rules'|'example'|'mistakes'|'prose', label, paras, items, ordered}];
     indexFrom(topic, progress, prevIndex, research, {iid, info}?) -> index patch;  model(book) -> what every page prints
     (chapters, bound, glossary, works, leaves = the page order: [{id, href, k, t, part?, n?, rn?, p?, at?}]
     glance, then iid:chapter and iid:practice per bound chapter, then back; done, finished);  due(topic, progress, index) -> [iid];
     countOf(index);  bytes(s);  LIMIT (240 KB);  PLATE_NOTE
   on(progress) -> keeps a dossier;  bind(tid, iid, {doc, doneAt, topic?, progress?}) -> Promise<chapter | null> (never rejects);
   sync(tid, {force, topic, progress, index}) -> Promise<n bound> (once per page load per course);  setOn(tid, bool);
   keep(tid) (bind what is finished, mark kept);  remove(tid);  load(tid) -> book | null
   shelf(box, ctx, {after}) -> cleanup (the Library's Dossiers: its tiles, ending with `after`);  ownTile(href) ->
   the "In your own words" tile;  option(tid, progress, index, total) -> the topic page's "Keep a dossier";
   confirmDelete(tid, title, progress) -> Promise<{keep} | null>;
   exportHtml(model) -> one self-contained HTML file in the same tiles (styles inline, light and dark, Barlow by link
   with system fallbacks, the plate as static text, no scripts);  save(model) -> U.saveFile('dossier-<slug>-<day>.html', …, 'text/html')
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
Settings' Research line: "Connected." (U.research.available() and, where the runtime has it,
U.rt.toolsOk()); "Connected, but this view cannot use it." when page tools do not run here (new
topics started here are not source-checked); "Not connected." with the steps to connect.

## 10. Navigation

```
#/                     learn    tab learn    70-learn.js
#/t/:tid               topic    tab learn    71-topic.js
#/t/:tid/:iid          lesson   focus        50-lesson.js
#/t/:tid/:iid/again    lesson   focus        Learn it again (while the idea is slipping); the address becomes #/t/:tid/:iid
#/today                today    tab today    60-today.js
#/review               review   focus        60-today.js
#/review/more          review   focus        one batch beyond the daily cap
#/map                  map      tab map      72-map.js
#/book                 book     tab book     73-book.js   the Library: two choices, Dossiers and Ready-made courses
#/library/dossiers     library  tab book     73-book.js   the dossiers as tiles (75-dossier.js), then "In your own words"
#/library/courses      library  tab book     76-shelves.js   Ready-made courses (and #/shelf/:sid, #/shelf/:sid/:fid)
#/book/words           book     tab book     73-book.js   the Book (Dan's own words), linked from the Library
#/book/:tid            dossier  focus        75-dossier.js   a dossier's pages, in reading order: At a glance (cover and contents)
#/book/:tid/:iid                                             a chapter, with its plate (asleep until Tap to play)
#/book/:tid/:iid/practice                                    put it into practice and its sources (sources alone without practice;
                                                             /tests, its older address, opens the same page)
#/book/:tid/glossary   (and /bibliography: the same page, at the bibliography)
#/book/:tid/contents   older addresses: At a glance at its chapters grid;
#/book/:tid/:iid/plate   the chapter page at its plate (/plate/play: the plate awake)
```
- A dossier page is one page of tiles (section 4, Dossiers): a chapter is two page turns, the
  chapter (the plate on it) and its practice. An unbound chapter's address shows At a glance at its
  chapters; a dossier with none bound still has At a glance. The old addresses keep their hash and
  draw the page they now belong to. The page bar floats at the bottom in the D4 tab bar's frame
  (62 px, 2 px `--edge`, radius 16 px; centred, at most 34rem, from 40rem): the previous page on
  the left (a chevron and its name: "Contents", "Chapter II", "Practice", another chapter's practice
  by its numeral alone, "Ch. I", the rest of its name said to a screen reader), where he is in mono
  in the middle ("at a glance", "II · 1 of 2" over one `--step` segment per page of the chapter,
  "glossary", or "bibliography" when opened there), the next page on the right as the ink button.
  Where he is is never cut: when the bar is narrow " · 1 of 2" drops away whole and the numeral
  stays, a page's name may take two lines, and a bar under 17rem (a small phone at XL) shows the
  previous page by its chevron alone (still 44 px, its name still said). The
  book starts and ends at the Library (the bar's first back and last next). The page bar and the
  arrow keys (not inside the plate, a form control, details, a sheet or a source card; the Library
  is not a page, so they stop at either end) go through the page order (`model().leaves`); the
  reader says which page it shows (`.dos.reader[data-leaf]`). Topic ids are `slug-xxxxx`, so
  `words` is never one.
- `U.routes.add(pattern, handler, {focus, tab, title, screen})`; `handler(params, ctx)` draws
  into `ctx.view` and may return a cleanup (or a promise of one); `ctx.alive()` is false once
  Dan has moved on. `U.go(hash)` navigates (the same hash draws again).
- The route is the address hash. If the frame refuses a fragment change, the route is kept in
  memory (`U._memHash`; `U.currentHash()` reads either); a real `hashchange` clears it. Boot
  sends every in-app `<a href="#/…">` click through `U.go`.
- Params must pass `U.validId`, else "This page is not here" (`U.notHere`, screen `none`). An
  unknown address or a bad %-escape goes to `#/` without a history entry.
- On every route: the old cleanup runs, sheets close, a cheer still showing goes, `#view` is cleared and gets `data-screen`
  (opts.screen, else from the pattern: learn, topic, lesson, today, review, map, book, library
  (`#/library/…`), shelf, dossier for `#/book/:tid…` but not `#/book/words`);
  `html.focus` hides the top bar and tabs; the tab gets `aria-current`; the title is
  `opts.title · My University` until the view calls `U.setTitle`; the page scrolls to the top
  and focus moves to the screen's h1 once it is drawn (unless Dan has focused something else), and
  along to a new h1 when the screen draws its heading again within a few seconds.
  `U._focusScreen` waits up to 6 s for it; the topic page also moves focus to its first h1 when it
  comes later, and to the new h1 when what had focus there was taken away. Each of its states has
  an h1 and a title: "This topic is not here any more" (Topic not found) and "This topic could not
  be loaded" (Topic could not be loaded; only a refusal: while the store is reconnecting, parked
  included, it says "Reconnecting…" calmly and fills in by itself). When the warm-up's Next
  question, Done, Skip or "Try the warm-up questions" takes away the button that had focus, focus
  goes to what replaced it (the next question, the summary, the "Try" line), not to the h1.
- Learn's level choice (New to it, Know a bit, Know it well) is a radio group (`U.radios`), like Settings',
  and so is the mode beside it (Teach and test me, Just teach me; v9), and the topic page's switch.
- Lesson stages (v9): a study lesson Predict, Play, Explain (with "Put it into practice" after the
  analogy), Say it back, Check; a read lesson Explore (the interactive, "Try this", then what
  happens if the lesson says), Read (explanation, analogy, practice, sources; "Done reading"),
  finished as "Idea read". The step bar has a segment per step (five or two). A read lesson's done
  section says "Lesson complete", with "Next lesson" (or "Back to topic" on the last idea) and
  "Start again" (a separate replay run), and celebrates with `U.celebrate` (00-core.js: the tick,
  a ring pulse and a burst of fraction pieces, haptic [20, 60, 20, 60, 80], said once; reduced
  motion: no movement) the first time and whenever the interactive calls `K.complete()`. That
  call (U.sandbox.mount's onComplete) finishes a read lesson's Explore exactly as its own finish
  control does; when the done section is already showing it scrolls there and celebrates again;
  a study lesson ignores it. A steps lesson (`format: 'steps'`, section 5) has one step, Lesson:
  the frame alone, full width, then the done section with its sources in "Sources (n)"; if its
  frame cannot be shown, or is closed, it opens as an ordinary read lesson.
- Tabs Learn / Today / Map / Library (`#tabs`, Today's badge `#today-badge`; the Library tab is
  `data-tab="book"`) sit at the bottom in
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
- Laptop widths by `#view[data-screen]`: Learn, the topic page, the Map and the Library (book and
  library: its dossiers four tiles a row from 38rem, the lead one two wide) run up to `--wide`
  (1200 px); a dossier page takes the whole window (no column, no padding) with its focus bar and
  tiles up to `--wide` inside it, laid out by `@container view` (so a phone pinned on a wide window
  gets the phone shapes); the lesson and the review up to 1120 px, with reading text capped at `--measure`
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
- Returning Learn with `#view` at least 900 px wide puts the reviews row (320-380 px) beside its
  compact ask; with nothing waiting, a quiet line in Today's words from `U.review.outlook()` (done
  for today or nothing to review, and when cards come back). One column hides the quiet line, and
  the reviews row is as wide as its words there, so its arrow stays by its label. First-run Learn
  goes two columns (the welcome beside the full ask) only when `#view` is at least 58rem wide (the
  ask keeps 35rem, so the breakpoint follows the text size). The ask box fits its height to its
  text or placeholder whenever its width, its placeholder or the text size changes; while Claude
  plans it shows the whole question, and wherever the form itself is under 36rem wide (a phone,
  or the ask's column on a narrower laptop; `.ask-form` is a size container named `ask-form`)
  "Planning…" takes its own row under it, so the box never grows tall beside the button.
- The topic page's ready state has regions `top` (header), `main` (in one breath, warm-up, path),
  `rail` (Ask Claude, the dossier option, Sources) and `end` (Delete) in `71-topic.js`. They stack in that order;
  when `#view` is at least 900 px wide, main and rail sit side by side (rail 300-360 px). The
  header, and the planning and failed pages, put the cover in a `.tp-split` with the words: above
  them on a phone, beside them (in the rail's column) at 900 px and up.

## 12. D4: Claude's notes (the look Dan chose on 10 Oct)

Dan chose design D4 from the redesign canvas: a calm dashboard look in which Claude's words arrive
as comment cards. Two parts, both additive (no screen's markup or behaviour was taken away), and then the dossier:

- **The look**, `app/src/css/80-d4.css`, loaded last. It restates the tokens of `00-tokens.css` for
  light and dark (a dotted canvas, near-black ink for headings, controls and progress, grey panels
  `--sunk` for what Dan reads, white cards outlined in `--edge` for what he acts on) and adds its own:
  `--edge`, `--dot`, `--due`/`--due-ink`/`--due-tint` (what is due, chart marks), `--step` (the
  lesson's segmented progress), `--pin` (Claude's avatar), `--green-on-heading` (green on an ink
  tile, which is light in dark mode: `--green` in light, #2E7D4F in dark, 4.3:1 there), `--bar-off`
  (the dashed outline of a bar not yet filled: `--line-strong`, `--muted` in dark), `--cond` (Barlow Semi Condensed, labels)
  and `--mono` (JetBrains Mono, where he is: the lesson's eyebrow, the review's line). `--sans` and
  `--serif` are Barlow, the dossier's included (Literata is no longer loaded): the dossier is drawn
  in the same tokens, as tiles (section 4, Dossiers; `75-dossier.css`).
  Easier reading still sets Atkinson everywhere, labels and mono included. Colour keeps its meaning:
  ink = controls and progress, green = right and finished, red = mistakes and warnings, teal = small
  labels, amber = key terms, "remember this" and what is due. The phone's tabs float in an outlined
  bar (`--tabbar-h` includes its gap); the open tab is an ink pill. The kit's palette is unchanged
  (accent2 = `--heading`, now ink), so interactives match without a rebuild.
- **The dossier** (design 3, "the field guide", chosen on 10 Oct; `docs/design/dossier-field-guide/`)
  took the same look in place of its field journal (cloth covers, tape, stamps, ring stains,
  hand-lettered fonts, Literata, its own ink palette for the plates): tiles in the token names
  above, D4's focus bar, a floating page bar in the tab bar's frame, and the plates in the app's kit
  theme like a lesson's. Its data and derivation rules did not change (section 4, Dossiers).
- **Claude's notes**, `app/src/js/52-notes.js` (`U.notes`): `avatar(who)`, `byline(who, context)`,
  `card({who, context, title, text, body, actions})`, `list({title, id, notes})` and
  `reply({chips, placeholder, label, onAsk(text, chip)})`. `who` is honest: `'claude'` only for words
  Claude wrote; the app's own notices carry the app's mark. Text Claude wrote goes through `U.rich`.
  Where they appear:
  - check and review feedback (41-cards.js): Claude's byline ("from the lesson": the explanation it
    wrote when it built the lesson) over the parts, and a reply row before Continue when the screen
    passes `ask` (chips: Why?, Show me another way / Give me an example). A recall card's grade
    carries the byline "on your answer" and its reply row once graded. Focus still goes to Continue.
  - the say-it-back grade (50-lesson.js): the byline over the verdict, and on the answer just
    graded a reply row (What did I miss?, Give me an example; or Give me an example, Go a bit deeper
    when he got it). The verdict's text and focus are unchanged.
  - a reply opens Ask Claude (`U.tutor.open(context, {ask, chip})`) with `context.about`, so Claude
    knows what he has just done. A typed reply is his own question (saved to progress.questions like
    any he types there); a chip is not.
  - Learn (70-learn.js): "Claude's notes" under Continue: for each idea he has said back, Claude's
    latest words on it (the follow-up question when he was not there yet, else what he nailed), newest
    first, at most three, each opening its lesson ("Have another go" / "Open the lesson"). Ready-made
    courses stay off Learn as before. None: nothing shown.
  - Today (60-today.js): "Claude's notes on what is due": the same notes for the ideas in today's
    session (read from progress after the screen is drawn), at most three. None: nothing shown.
  A steps lesson (`format: 'steps'`) keeps its puzzles' own Check and Why? inside the frame; Ask
  Claude in the lesson bar is its way to talk to Claude.

