# Performance and reliability review (2026-10-05)

**Scope.** The whole app, with findings focused on `00-core`, `10-runtime`, `20-store`, `40-fsrs`,
`41-cards`, `50-lesson`, `51-tutor`, `60-today`, `70`–`74` and `99-boot`. Kit, sandbox and prompt
code is being rewritten, so issues there are noted only when they are severe.

**What was measured.** Measurements were taken on a build of commit `54d1616`. Line numbers are for
commit `52aa7b0`. Fixes kept landing while the review ran: the security fixes (`ce034f6`), the kit
and prompt work in progress, and uncommitted correctness edits. None of them changes the results
below, except where a finding says so.

**How.** The harness is in `docs/review/perf/`, and its header lists every script. It has five parts:
- **Runtime stand-in.** A Node-backed version of the claude.ai runtime. All tabs and devices share
  one db, with live snapshots between them. Latency, `unavailable` errors and hangs can be injected.
  It counts every subscription and every call.
- **`sample` scheduler.** Follows the contract: 2 calls run at once, 4 more wait, and anything
  beyond that is rejected `rate_limited`.
- **Real network path.** The page is served gzipped, so network throttling applies to it.
- **Throttling.** CPU and network are throttled through CDP.
- **Phone-like rendering.** Site isolation is off, so sandboxed iframes share the page's main
  thread, as they do on Android.

The profiles:

| Profile | CPU | Network | db op | `claude.use` |
| --- | --- | --- | --- | --- |
| desktop | 1x | none | 60 ms | 60 ms |
| phone | 4x | slow 4G (562 ms RTT, 1.44 Mbps down) | 600 ms | 300 ms |

Model latencies: plan 3 s, research 45 s, write-lesson 25 s, build/repair 35 s, grade 10 s, tutor
8 s, or 30 s for every call in the "slow Claude" run.

Seeded data: 12 topics × 6 ideas, each with a ready lesson and a real kit interactive, plus research
docs, progress, cards with history and a profile. The screen-cost runs use 30–40 topics.

**Headline numbers (phone profile, cold open):**

| Screen | First paint | Useful content | With Google Fonts cold (+2.25 s) | db at 3 s/op (unthrottled CPU and network) |
| --- | --- | --- | --- | --- |
| Learn (topic cards) | 0.77 s | 3.77 s | 5.30 s | 9.2 s |
| Topic (path) | 0.77 s | 3.25 s | 4.85 s | 6.2 s |
| Lesson: question | 0.76 s | 3.17 s | 4.73 s | 6.2 s |
| Lesson: interactive live | – | 3.45 s | 5.06 s | 6.3 s |

On the phone profile, the HTML (154 KB gzipped) finishes downloading at 1.41 s and the boot script
is one 85–118 ms long task. Everything after that is serial runtime and db round trips. The desktop
profile reaches useful content in 0.31–0.38 s.

---

## Ranked findings

### 1. The Google Fonts stylesheet blocks the whole app; if Google is slow, the screen stays blank
- **Measured:**
  - On a cold slow-4G open, the fonts CSS costs about 4 RTTs (2.25 s). That moved first paint from
    0.77 s to 2.95 s and the app script from 1.55 s to 3.05 s. Every screen got 1.5 s slower
    (Learn 3.77 s → 5.30 s).
  - With the stylesheet stalled for 20 s, the page stayed blank and `window.U` did not exist until
    20.1 s (`s1b-fonthang.mjs`).
- **Where:** `app/src/head.html:5`. A parser-inserted `<link rel=stylesheet>` sits before every
  inline `<style>` and `<script>`, so it blocks both rendering and script execution.
- **Impact:** every cold open on mobile. A network that cannot reach `fonts.googleapis.com` (captive
  portal, filtering, flaky Wi-Fi) shows a white screen, and the app does not run at all until the
  request times out.
- **Minimal fix:** load the fonts without blocking. In the existing inline script in `head.html`,
  add: `var l=document.createElement('link'); l.rel='stylesheet'; l.href='…css2…'; document.head.appendChild(l);`.
  Remove the blocking `<link>`. `display=swap` and the fallback stacks already cover the swap.

### 2. Boot waits for a db read before showing anything; a stalled db means "Opening your university…" forever
- **Measured:**
  - Every screen pays one extra serial db round trip: about 0.6 s on the phone profile, 3 s on a slow
    db.
  - With the db bridge not answering, Learn and Lesson both still showed "Opening your university…"
    at 15 s, and that never changes (`s4-failures.mjs db-hang`).
- **Where:** `99-boot.js:89-94`. `U._route()` runs only after `loadPrefs()` (`:43-57`) has resolved
  `U.store.getDoc(profile)`. That read has no timeout, and `.catch` does not help with a promise
  that never settles.
- **Impact:** slower first paint on every open. A total hang whenever the runtime's db bridge stalls
  (the contract describes exactly this "dead bridge" case).
- **Minimal fix:** route as soon as `U.rt.ready` resolves, and run `loadPrefs()` without awaiting it.
  `head.html` already applied the device's prefs before first paint, and the profile watch applies
  the db copy when it arrives.

### 3. When the db returns `unavailable`, nothing is retried: a whole lesson's progress and cards are lost, and the toasts blame Claude
- **Measured** (`db-midlesson`): the db went `unavailable` after a lesson loaded. Dan finished the
  whole lesson, and then the db recovered.
  - He saw 9 stacked toasts, all reading "Could not save just now: Claude could not be reached".
  - Once the db was back, his progress doc was still at `stage: predict`. No guess, answers or
    `done` had been saved, no cards doc existed, and nothing was ever re-sent.
  - Opening a lesson while the db is unavailable shows "This lesson could not be opened. Claude could
    not be reached." Learn shows every topic as "0 of 6 done", because `progress.all()` failed
    silently.
- **Where:**
  - `20-store.js:60-69` (`run`, `reportWrite`) and `:87-104` (`patchDoc`): a failed patch is
    dropped, and verbs are never retried.
  - `00-core.js:190`: `errText` maps `unavailable` to "Claude could not be reached".
  - `70-learn.js:284`: a failed progress read is turned into `{}`.
- **Impact:** silent loss of what Dan did. The contract says a verb `unavailable` is transient and
  should be retried once.
- **Minimal fix:**
  1. In `run()` and `getDoc()`, retry once after 300–1000 ms jitter when the code is `unavailable`.
  2. If the write still fails, put the patch back into `pending[path]` and flush it on the next
     write, `online` or `visibilitychange`.
  3. Use a storage-specific message, shown at most once per outage.

### 4. Transient Claude errors become permanent lesson failures shared to every device; the retry rules are backwards
- **Measured** (`s4-failures.mjs`):
  - **`rate_limited`:** each lesson attempt makes 3 `write-lesson` calls within 8 s, 2 of them
    automatic retries. "Try again" makes 3 more.
  - **`upstream_error`:** one transient error, which the contract treats as the only retryable code,
    is never retried. The lesson is marked failed with the platform's raw developer message (my
    stub's "boom").
  - **`not_granted`, or `sample` missing:** the shared lesson doc is set to `writing` and then to
    `failed` with the permission text. A desktop where Claude is not allowed therefore marks the
    lesson failed for the phone too.
- **Where:**
  - `10-runtime.js:63-64`: retries `rate_limited` twice and `unavailable` once; `sample` never
    returns `unavailable`.
  - `31-generate.js:502` writes the `writing` status before `U.ask`, and `:541-545` writes
    `failed`.
  - `00-core.js:184-192` has no mapping for `upstream_error`, `session_expired`, `refused`,
    `empty_completion` or `prompt_too_large`.
- **Impact:**
  - Retrying a rate limit from code makes the limit last longer. The contract says "never retry
    from a loop".
  - One network blip costs the whole lesson, and the error text is unreadable.
- **Minimal fix:**
  1. In `U.ask`, drop the automatic `rate_limited` retry and retry `upstream_error` once after 1–3 s
     with jitter.
  2. In `write()`, return early if `!U.rt.sample`. For `not_granted`, `rate_limited` and
     `cancelled`, put the doc back the way it was (delete it if this job created it) instead of
     storing `failed`.
  3. Add plain-English messages for the missing codes.

### 5. Two devices, or two tabs in one browser, on the same topic both generate the same lessons
- **Measured** (`s6-twotabs.mjs`, 300 ms db):
  - **Phone and desktop open a new lesson 0.2 s apart:** both run `write-lesson`, both run
    `build-interactive`, and both prefetch the next lesson. Every call happens twice, and the
    lesson doc gets 6 writes.
  - **Same, 3 s apart:** the second device waits correctly for the lesson itself. When it becomes
    ready, both devices prefetch idea 2 at the same moment, so `write-lesson` and the build run
    twice.
  - **Two tabs of one browser, 3 s apart:** they share the `mu.device` id, so `abandoned()` treats
    the first tab's live job as dead. The second tab takes it over at once, and everything runs
    twice.
  - **Phone suspended 45 s mid-build** (`s5-background.mjs takeover`, stale time scaled down to
    20 s): the desktop takes over after the stale window. That is right, but it is one more
    complex call. When the phone resumes, its late result is written over the interactive the
    desktop is already showing. Each device's interactive was tagged: the doc showed the desktop's
    at 57 s and the phone's at 62 s. Nothing checks whether the phone still owns the job.
- **Where:** `31-generate.js:403` (`abandoned`), `:405-421` (`ensureLesson`, a get-then-set race),
  `:395` (`beat`), `:530-545` (`write` never re-checks ownership), and `50-lesson.js:213-220`
  (`prefetchNext`).
- **Impact:** twice the paid model calls whenever Dan has the app open on two devices, which is a
  stated use case. The last writer silently replaces what the other device is showing.
- **Minimal fix:** use the platform's single-writer primitive. Call `db.doc(lessonPath).acquire({holder: PAGE, ttlMs: 60000})`
  before `write`, `resume` and the prefetch, and renew it in `beat()`. When `{acquired:false}`
  comes back, call `watchOther`. Before each `lesson.update`, re-check that the lease is still held.
  This replaces the device-id heuristic.

### 6. Suspending the app during an interactive's self-test fails a good interactive and triggers a paid repair (severe; in the sandbox code)
- **Measured** (`s5-background.mjs selftest`): the page was suspended 300 ms into the self-test and
  resumed 15 s later.
  - The 8 s wall-clock timer fired first: "The interactive did not load within 8 s. [at 340 px
    wide]".
  - The good body was treated as broken, and a `repair-interactive` call (complex tier) went out.
- **Where:** `32-sandbox.js:319` (`testOne`), with a wall-clock `setTimeout(…, timeout)`.
  Suspension was emulated with `Debugger.pause`; headless Chromium cannot hide a page.
- **Impact:** a build takes 30–60 s, and switching apps while it runs is the normal thing to do.
  Each switch can burn a repair call. Three in a row (`MAX_ATTEMPTS`, `33-interactive.js:23`) ship
  the lesson without its interactive.
- **Minimal fix:** count only time the page was running. When the timer fires, check whether
  `Date.now()` overshot the deadline by more than about 1 s; if so the page was suspended, so
  re-arm the timer. Also pause and resume the timer on `visibilitychange`.

### 7. The first lesson of a new topic waits for research before it is written: 77 s to the first question
- **Measured** (`s3-sample.mjs mcp`): the topic plan was shown at 4.9 s. Then:
  - `research` ran 5–50 s, while `write-lesson` waited behind it.
  - The predict question appeared at 76.9 s, and the interactive was live at 112 s.
  - The same flow without research would show the question at about 30 s.
- **Where:** `31-generate.js:22` (`RESEARCH_WAIT_MS: 120 s`) and `:358-370` (`researchFor`).
- **Impact:** the single longest wait in the app, right after Dan asks for something new.
- **Minimal fix:** the right balance is a product call. Two options:
  - Cap the wait for the first lesson at about 15 s. After that, write it with the existing "not
    yet source-checked" label. Later ideas still wait for research, which has finished by then.
  - Or start research from the query in parallel with planning.

### 8. Background generation is never cancelled or deprioritised; the lesson Dan is on waits behind ones he only glanced at
- **Measured** (`s8-peek.mjs`): Dan tapped through 6 unwritten ideas, 2 s each, then returned to idea
  1.
  - All 6 jobs kept running, 12 calls in total, queued first-in first-out in the 2 slots.
  - Idea 1's build waited 50 s in the queue. Its interactive was ready at about 112 s instead of
    about 62 s.
  - The queue reached exactly 2 running plus 4 waiting. One more call (a grade, the tutor or a 7th
    idea) would have been rejected `rate_limited`, and that rejection then triggers finding 4.
  - In the normal flow (`s3`), grading and the tutor did not have to wait, because only one
    background job was running.
  - No caller ever creates an `AbortController` (the `signal` plumbing in `U.gen.tutor` and
    `U.interactive.build` goes unused), and every call sends `cache:false`.
- **Where:** `50-lesson.js:160-175` (`ensure` keeps running after the route is gone),
  `:126/:173/:213-220` (`prefetchNext`), and `10-runtime.js:47-67`.
- **Impact:** wasted model usage on ideas he never opened. The lesson he is actually on gets slower,
  and a burst of activity can tip into rate-limiting.
- **Minimal fix:** add a small priority gate in `U.ask`:
  - User-facing calls (plan, the open lesson's write/build, grade, tutor) go first.
  - Background calls (prefetch, research) run at most one at a time.
  - On route cleanup, abort (`AbortController`) only a prefetch that has not started yet.

### 9. Learn makes serial db round trips and loads every card twice at boot
- **Measured:**
  - Learn reaches useful content 0.5 s later than Topic on the phone (3.77 s against 3.25 s), and
    3 s later on a 3 s/op db (9.2 s against 6.2 s).
  - A Learn boot makes 3 collection reads and 3 profile gets: `cards.all()` twice, the profile
    three times.
  - Each topic change from another device triggers one more `progress.all()` and a full re-render:
    5 updates cost 5 queries and 221 ms of long tasks with 40 topics.
- **Where:**
  - `70-learn.js:281-289`: `progress.all()` starts only inside the first `topics.watch` snapshot,
    and runs again on every snapshot.
  - `70-learn.js:292`, `99-boot.js:95` and `60-today.js:217-227`: `dueCount()` and
    `refreshBadge()` each run `plan()` (all cards plus the profile) at the same time.
- **Minimal fix:**
  1. Start `U.store.progress.all()` when the screen mounts, in parallel with the watch, and reuse
     that promise.
  2. In `60-today.js`, share one in-flight `plan({})` promise for about 2 s, so the badge and Learn
     read the cards once.

### 10. A review session re-reads every card in the library after every answer
- **Measured** (`s7-review.mjs`, 30 topics with 513 KB of card docs): 10 answers caused 11 full
  `cards.all()` reads, about 5.6 MB of db reads, plus 34 gets. Main-thread cost was small (one 54 ms
  long task), but on mobile data this is about 2.9 s of slow-4G transfer per answer.
- **Where:** `60-today.js:138` (`save()` → `refreshBadge()`), `:218-227` and `:42`. Today also does
  N+1 topic gets (`:253-258`): 41 gets for 40 topics.
- **Minimal fix:**
  - During a session, update the badge from the in-memory queue: the count is `queue.length - i`.
    Call `refreshBadge()` only in `summary()` and cleanup.
  - In `topicsFor`, read `topics` with a single `U.store.topics.list()`.

### 11. Every write costs two round trips
- **Measured:** in the new-topic-plus-one-lesson flow (`s3`), 26 writes came with 57 gets. Each
  `patchDoc` is a `get` followed by an `update` or `set`, which is 1.2 s per write on the phone
  profile. Since `ce034f6`, `lesson.set` and `research.set` also `get` the topic first
  (`20-store.js:158,166`).
- **Where:** `20-store.js:98-102`.
- **Impact:** writes queue up behind one another on the per-path chain, for example during a lesson
  or a heartbeat. Saves take longer and are more exposed to finding 3.
- **Minimal fix:** call `ref.update(body)` first. Fall back to `set` only for private docs, on
  `invalid_argument` (the document is missing). That makes the common case one round trip.

### 12. Leaving a lesson while its answer is being graded loses the answer
- **Where:** `50-lesson.js:592`: `if (!alive()) return;` runs before `record(rec)`. The grade call
  (paid) finishes, and both the result and Dan's say-it-back text are thrown away. Only an in-memory
  draft survives, until the page reloads.
- **Minimal fix:** call `record(rec)`, which only writes to the store, before the `alive()` check.
  Skip only the DOM updates when the screen is gone.

### 13. Finishing a lesson overwrites the whole cards doc and erases review answers saved by another device
- **Measured** (`s6-twotabs.mjs cards`): the phone saved review answers for 4 cards, which added one
  history entry each and a new schedule. The desktop's `addFromLesson`, started 0.7 s later, read the
  doc before the phone's write landed and wrote it back whole after. All 4 answers were gone (history
  length 13 → 12, schedules reverted).
- **Where:** `60-today.js:169-186`, a read followed by a `setDoc` of the whole document. This is
  also part of `correctness.md` #1.
- **Minimal fix:** write only the cards that change, `U.store.cards.patch(tid, {cards: made})`, and
  delete stale ids with a patch that nulls them. Never `set` the whole doc.

### 14. The Map screen blocks the main thread for half a second with a large library
- **Measured** (`s10-screens.mjs 40`, 4x CPU): Map with 40 topics took 1.18 s, with long tasks of
  505 ms and 214 ms. Book had a 175 ms long task, Learn 95 ms and Topic 88 ms.
- **Where:** `72-map.js:138-178` builds every topic's constellation SVG in a single synchronous pass.
  Every `topics.watch` snapshot redraws them all (`:118`).
- **Minimal fix:** draw the constellations in chunks across frames (a few topics per
  `requestAnimationFrame`), or only for topics near the viewport. Skip the redraw when the
  snapshot's ids and `updatedAt` values are unchanged.

### 15. The self-test runs on the main thread during background generation (note; sandbox code)
- **Measured** (`s9-selftest-cost.mjs`, 4x CPU): `U.sandbox.test` at 340 px and 720 px takes
  0.5–0.85 s, with 2–4 long tasks of up to 204 ms. That is per build attempt, while Dan is using
  another lesson. A 50 ms timer on the page fired up to 143 ms late.
- **Impact:** some jank, acceptable today. It grows with the kit rewrite: `kit.js` is now 104 KB and
  is parsed again in every frame.

### 16. Bundle: 43% is prompt and kit text that is only needed for generation
- **Measured:**
  - **At 54d1616:** 546 KB raw, 154 KB gzip, 126 KB brotli; download 1.41 s on slow 4G; eval
    85–118 ms at 4x.
  - **The current working tree builds to 653 KB raw, 187 KB gzip**, about 0.2 s more download.
- **Large parts (current tree):**

  | Part | Size |
  | --- | --- |
  | `32-sandbox` (kit JS and CSS strings, copied into every iframe) | 139 KB |
  | `33-interactive` (KIT_MD plus 6 example bodies, 48 KB) | 84 KB |
  | `30-prompts` | 78 KB |
  | `31-generate` | 38 KB |
  | Comments and indentation | about 66 KB (12%) |

- **Dead code (all small, under 3 KB in total):**
  - `U.on` has no subscribers anywhere, so every `U.emit('gen'|'ask'|'prefs'|'booted'|'interactive-test')`
    builds its payload for nobody.
  - These are defined but unused by the app: `U.when`, `U.TIERS`, `U.gen.status`,
    `U.gen.knownIdeas` (exported), `U.tutor.thread`, `U.cards.types`, `U.fsrs.params`,
    `U.sandbox.merge` (exported), `U.interactive.exampleFor`, `U.views.isDone`.
- **Fix:** none is urgent, because findings 1 and 2 matter more than bytes. Options:
  - Strip comments in `tools/build.mjs`.
  - Keep `KIT_EXAMPLES` and `KIT_MD` out of the first-run script, for example in a
    `<script type="text/plain">` that is read only when building.

### 17. What was measured and found fine
- **Memory over 20 lesson navigations** (lesson → topic → next lesson, 4x CPU; `s2-leak.mjs`):

  | Metric | Result |
  | --- | --- |
  | JS heap | 2.2 MB rising to a 3.2 MB plateau |
  | DOM nodes | flat at 299–390 |
  | Event listeners | flat at 57–65 |
  | Iframes alive | exactly 1 |
  | Detached nodes in a heap snapshot | 0 |

  Opening the tutor on every lesson gives the same picture. Navigation from lesson to interactive
  live has a median of 332 ms and a maximum of 427 ms.
- **Subscriptions per screen:**

  | Screen | Subscriptions |
  | --- | --- |
  | Learn | 2 |
  | Topic | 3 |
  | Lesson | 1, plus 1 while it is preparing |
  | Map | 2 |
  | Today, Review, Book | 1 |

  The highest number seen was 3, against the platform cap of 64. All of them are released on
  navigation.
- **Sample calls for one lesson in the normal flow** (`s3`): 1 `write-lesson`, 1
  `build-interactive`, 2 `grade` and 1 `tutor` (the tutor sends research tools, so it can take
  several rounds). Then the prefetch of the next idea makes 1 write and 1 build. Each topic adds 1
  `plan-topic` and 1 `research`.
  - No unbounded loops were found. The worst case per lesson is bounded: 6 write calls and 9 build
    calls with rate-limit retries, schema re-asks and repairs.
  - Within one page, `jobs` stops the same lesson being generated twice.
- **Slow Claude (30 s per call):** the question appeared at 31.5 s, the "Still going" note at 40 s,
  and the interactive was built and saved at about 61 s. There were no timeouts and no duplicate
  calls.
- **Minor:** `U.closeSheets()` (`00-core.js:195`) removes open sheets on navigation without
  calling `close()`. The sheet's `keydown` listener and the tutor's `view` stay referenced until
  the next sheet opens. This is bounded at one, because `U.tutor.open` closes the old one
  (`51-tutor.js:105`).
