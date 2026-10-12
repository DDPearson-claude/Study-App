# Correctness review: core, store, review and views

**Scope.** `00-core`, `10-runtime`, `20-store`, `40-fsrs`, `41-cards`, `50-lesson`, `51-tutor`, `60-today`, `70`–`74` and `99-boot`. The code reviewed is the tree as of commit 0628558 (2026-10-05). That includes the changes to 10, 20, 41, 50 and 51 in ce034f6, which landed while this review was running.

**How each finding was checked.** Every finding below was reproduced against a full build (`node tools/build.mjs --out tests/out/correct.html`) using the runtime stub. The scripts are in `docs/review/repro/`:

- `sh docs/review/repro/run-all.sh` rebuilds the app and runs them all.
- Each script prints `REPRODUCED <finding>` while its bug is still present.
- The "other device" is simulated by writing directly into the stub db with `__CLAUDE_STUB__.seed` and `__CLAUDE_STUB__.remove`. That is exactly how a second device's writes look to this page.

## Ranked findings

### 1. High: deleting a topic on one device brings its cards back on the other as permanent ghosts
- **Where:**
  - 20-store.js:100: `patchDoc` still creates a missing *private* doc from the partial patch.
  - 60-today.js:169-186: `addFromLesson` reads the doc, then writes it back whole with `setDoc`.
  - 60-today.js:92-97: `plan()` trusts every card it finds.
  - 60-today.js:466-468: skipped cards are never saved.
- **What goes wrong:** deleting a topic removes `profile/progress/{tid}` and `profile/cards/{tid}`. The other device can then bring them back in two ways:
  - **(a) It answers a review card from that topic.** `cards.patch` finds the doc missing and `set`s `{cards:{id:{s,hist}}}`, a card with no `type`, `spec` or `iid`. When it falls due, the session shows "This kind of question is not supported yet… Skip this one". Skip never saves, so the card stays due forever and the Today badge never clears.
  - **(b) It finishes a lesson in that topic.** The progress doc and a full cards doc are recreated for a topic that no longer exists. Those cards come back in review forever, labelled "A topic · An idea". There is no topic left to delete them with.
- **Not covered by the ce034f6 fix:** its `removed` set only covers deletes made in the same page.
- **Repro:**
  - `02-ghost-card.mjs` prints `cards doc now: {"cards":{"i2_c1":{"s":{…},"hist":[…]}}}`. The next session shows the unsupported card, it is still due after Skip, and the badge reads 1.
  - `14-delete-mid-lesson.mjs` shows `progress/tA` and `cards/tA` existing after `topics/tA` was deleted, and Today offering their cards.
- **Minimal fix:**
  1. In `patchDoc`, before creating a missing progress or cards doc, `get` `topics/{tid}` and drop the write if the topic is gone. Do the same in `addFromLesson` before its `setDoc`.
  2. As a defence, have `plan()`/`flatten()` drop cards that lack `type` and `spec`, and cards whose topic `topicsFor` returns as `null` (deleting those cards docs). Ghosts then cannot stick, whatever created them.

### 2. High: a topic whose planner died stays "Planning…" forever, with no Retry and no Delete
- **Where:** 71-topic.js:56 and 79-92 (`planningView` has no actions); 70-learn.js:348-354.
- **What goes wrong:** `createTopic` writes `status:'planning'` and then plans inside the page. Nothing ever moves the doc on if that page goes away during the 3–10 s of planning. That happens when the page is reloaded, when Android kills the backgrounded app, or when the artifact is republished.
  - The topic page shows the waiting animation forever, on every device, with only an "All topics" link.
  - The Learn card says "Planning the ideas…" forever.
  - Delete only exists in the failed and ready views, so the topic can never be removed.
- **Same pattern, milder:** a `research.status:'running'` left behind by a dead page shows "Checking sources…" forever (71-topic.js:332, 70-learn.js:367).
- **Repro:** `16-stuck-planning.mjs` uses a topic last updated 2 days ago with status `planning`. It prints `buttons: [], links: ["All topics"], U.gen.status: {"planning":false,…}`.
- **Minimal fix:**
  - In `planningView`, when `!U.gen.status(tid).planning` and `updatedAt` is older than about 90 s, render the failed view ("Planning stopped") with Try again (`U.gen.replan`) and Delete.
  - In `library()` and `topicCard`, treat a `research.running` older than `RESEARCH_STALE_MS` as failed.

### 3. Medium-High: a finished idea moves back from "done" when a stale lesson screen on the other device moves forward
- **Where:**
  - 50-lesson.js:108-119: the lesson screen reads progress once, on open.
  - 50-lesson.js:327-330: `saveStage` trusts that `st.ip.doneAt`.
  - 50-lesson.js:375: the prediction is saved over whatever is in the db.
  - 50-lesson.js:744: `first` is computed from the stale `doneAt`.
- **What goes wrong:** the desktop has idea 1 open at Predict, and Dan does the whole idea on his phone (stage `done`, `doneAt` set). Any tap on the desktop then:
  - writes `stage:'play'`, because the desktop never saw `doneAt`;
  - overwrites the phone's prediction.

  The topic page, Learn and Map now show the idea as "In progress". If he finishes it on the desktop, the celebration plays again, `doneAt` is rewritten and `addFromLesson` runs again.
- **Repro:** `03-stage-regression.mjs` prints `progress.ideas.i1 = {"stage":"play","doneAt":"…","predict":{"answer":"Travels to your ear",…}}`. The topic page then shows "In progress … Continue".
- **Minimal fix:** either of these.
  - In the lesson screen, subscribe with `U.store.progress.watch(tid)`, fold `doneAt` and `stage` into `st.ip`, and never write a lower stage once the db says done.
  - Make the stage monotonic in the data: store `reached:{play:at,…}` (merged by `update`) and take the furthest stage reached.

### 4. Medium-High: a failed topic delete wipes progress and cards but keeps the topic, then silently drops every later write for it
- **Where:**
  - 20-store.js:140-149: `remove` adds the tid to `removed` first, deletes the children in parallel and the topic doc last. `removed` is never cleared.
  - 20-store.js:72-90: `gone()` drops writes silently.
- **Who introduced it:** the data loss in the first part was already there. The silent drop of later writes comes from the 20-store.js change in ce034f6.
- **What goes wrong:**
  - If any child delete fails (for example a transient `unavailable`), `Promise.all` rejects, but the other deletes still run. Progress, including his say-it-back words, and every review card are gone.
  - The topic stays, and the page says "Could not delete the topic".
  - If Dan carries on using it, the tid is still in `removed`. Every progress, cards, topic and lesson write for it is now dropped for the rest of the session, with no toast.
- **Repro:** `20-removed-sticky.mjs` makes one lessons delete reject with `unavailable`. The topic still exists while progress and cards are gone. After he answers Predict, it prints `progress doc: undefined`, and no error is shown.
- **Minimal fix:**
  - Delete the topic doc first. It then disappears everywhere at once, and a later child failure only leaves invisible orphans to retry.
  - Add the tid to `removed` only after that delete succeeds, and `removed.delete(tid)` if it fails.
  - Retry child deletes once on `unavailable`.

### 5. Medium: "Learn it again" is a dead end
- **Where:**
  - 60-today.js:119-129: `flagRelearn` writes `progress.ideas[iid].relearn`.
  - 60-today.js:273: the link goes to the plain lesson route.
  - 50-lesson.js never reads `relearn` and never calls `U.gen.relearn`.
- **What goes wrong:** two lapses in 30 days show "Worth another look … A fresh lesson with a new interactive". The link opens the old lesson in its done state ("You've learned this idea"), and nothing is rebuilt. The block stays on Today and in the review summary until the lapses age out.
- **Repro:** `04-relearn-dead-end.mjs` shows `relearn flag=true` and the heading "You've learned this idea". `lessons/i1` is unchanged, and Today still shows the block.
- **Minimal fix:** in the lesson screen, when `st.ip.relearn` is set (or on a dedicated `#/t/:tid/:iid/again` route):
  - call `U.gen.relearn(tid, iid)`;
  - reset `ideas[iid]` to `{stage:'predict', relearn:false}` and clear `checks`. Regenerated lessons reuse the ids c1–c3, so old answers would mark the new checks as done, and `addFromLesson` would make cards for questions he never answered;
  - keep the `say` history for the Book.

### 6. Medium: a target card that gets no reading can't be finished or skipped, and blocks review
- **Where:**
  - 41-cards.js:400-473: the card only offers "Check my setting", and 465-471 re-enable it after every failure.
  - 60-today.js:428-437: `lessonFor` checks the control id but never the output id.
- **What goes wrong:** the reading fails when the interactive never answers `get()` (a frame or kit error on this device, or a timeout), or when its outputs lack `spec.output`. Every Check then shows the toast "The interactive did not answer…" and re-enables the button.
  - There is no Skip.
  - The card is never saved, so it stays at the front of the queue in every future session.
  - Dan's only way out is to close the review.
- **Repro:** `06-target-stuck.mjs` uses an interactive whose model outputs `other` while the card reads `speed`. After 3 checks it shows `buttons=["Check my setting"]` and progress "1 of 2".
- **Minimal fix:**
  - After the second failed reading, show "Skip this one" (`c.finish({skipped:true})`).
  - In review, retire a target card once it has been skipped as unusable, or when the self-test report's `readouts` and `outputs` lack `spec.output`.

### 7. Medium: log-scale estimates can be impossible to answer correctly
- **Where:** 41-cards.js:321-329 and 345. `sig2` snaps every value, from the slider and from the ± nudges, to 2 significant figures.
- **What goes wrong:** with `log:true`, the only values near 343 are 340 and 350. When the tolerance is smaller than the gap to the nearest 2-significant-figure value (here a tolerance of 2), the answer can never be right.
  - Every review grades it Again, which then feeds "Learn it again".
  - The validator only requires tolerance > 0.
- **Repro:** `05-estimate-log.mjs` uses min 1, max 10000, answer 343, tolerance 2. It prints `reachable values 300-400: [300,310,…,400]; closest locked in: 340 -> "Not quite", grade 1`.
- **Minimal fix:** either of these.
  - In `snap` and `nudge`, use `u = Math.min(10^(floor(log10 v)-1), niceStep(tol, true))`.
  - Mark the answer right when `snap(value) === snap(ans)`.

### 8. Medium: transient `unavailable` writes are never retried, so a blip loses data while the screen shows it saved
- **Where:** 20-store.js:60-70 (`run`, `reportWrite`) and 87-104 (`patchDoc`).
- **What goes wrong:** the db contract says to retry once after a short random delay when a write is rejected with `unavailable`. The store instead:
  - drops the coalesced patch;
  - toasts "Could not save just now … try again", though nothing on screen can be retried.

  For example, Dan's say-it-back answer is shown as graded but never stored. It is missing from the Book, and the lesson resumes at Say it back.
- **Repro:** `17-no-retry.mjs` makes the first progress update reject once. It prints `saved say: undefined`, and the toast is shown.
- **Minimal fix:** in `run()`, retry the write once after 300–900 ms on `unavailable` (and with backoff on `resource_exhausted`) before reporting the failure.

### 9. Medium: on two devices, arrays and card state written from a stale copy erase the other device's entries
- **Where:**
  - 50-lesson.js:617-622: `say: attempts.slice()` comes from the copy loaded when the lesson opened.
  - 60-today.js:132-138: `save()` writes `s` and `hist` from the copy loaded when the session started.
  - The same pattern appears in 51-tutor.js:70-73 (`questions`) and 50-lesson.js:807 (`flags`).
- **What goes wrong:** `update()` replaces arrays wholesale.
  - **(a)** The desktop, still showing Say it back, writes `say:[its answer]`. That erases the explanation Dan gave on his phone, and his Book loses it.
  - **(b)** A review session opened before the phone reviewed the same card overwrites the phone's result. The phone's Again (the lapse and its history entry) disappears, and the card jumps 39 days ahead.
- **Repro:** `09-array-clobber.mjs` prints `say = ["DESKTOP: …"]` for (a), and `hist=["3","4"] s={"due":"2026-11-13",…,"lapses":0}` for (b).
- **Minimal fix:**
  - Store append-only lists as maps keyed by a unique id or timestamp (`say:{[at]:rec}`, `hist:{[at]:entry}`), so `update` merges them.
  - In `save()`, re-read the card inside the write, and skip or merge if `s.last` is already today.

### 10. Medium-Low: a subscription that dies is only logged, so Learn says Dan has no topics and the topic page shows a skeleton forever
- **Where:**
  - 20-store.js:107-110: the `watchDoc` error callback only logs to the console.
  - 20-store.js:131: the `topics.watch` error callback calls `fn([])`.
  - 70-learn.js:281 and 71-topic.js:35 use these watches.
- **What goes wrong:** the contract says a listener can die (`unavailable` from a dead bridge, `resource_exhausted`, `revoked`), and only a fresh `onSnapshot` recovers it.
  - Learn then shows the first-run welcome, "Your university starts here", as if every topic were gone.
  - The topic page never leaves its skeleton.
- **Repro:** `08-watch-error.mjs`. Learn shows "Your university starts here…", and the topic page is still a skeleton after 3 s.
- **Minimal fix:**
  - On `unavailable`, resubscribe after a short delay.
  - For other codes, pass an error to the view and show a notice with Try again.
  - Never deliver `[]` on an error.

### 11. Low: read-modify-write races in `addFromLesson` (whole-doc set) and `logStudy` (counter)
- **Where:** 60-today.js:169-186 and 20-store.js:191-196 (`U.logStudy`).
- **What goes wrong:**
  - `addFromLesson` reads the topic's cards doc and writes the whole doc back. A review that the other device saves in between is lost: the card goes back to due today and its history is emptied.
  - `logStudy` reads the minutes counter, adds to it and writes it back, so concurrent increments are lost.
- **Repro:** `13-rmw-races.mjs`, with the read delayed 300 ms to stand in for network latency. It prints `card i2_c1 … {"due":"2026-10-05","hist":0}` and `minutes today: 12 (expected 14)`.
- **Minimal fix:**
  - Write only the changed cards with `patch({cards:{id: card, removedId: null}})`. `flatten()` already skips `null`.
  - Keep minutes per device (`days[day][deviceId]`) and sum them on read.

### 12. Low: a malformed %-escape in the hash blanks the screen
- **Where:** 00-core.js:145-151. `decodeURIComponent` runs after the view has been cleared, outside the `try`.
- **Repro:** `07-router.mjs`. `#/t/tA%E0%A4%A` leaves an empty view and throws `URIError: URI malformed`. Separately, `#/t/..` reaches the db and shows the raw "bad path segment" error.
- **Minimal fix:**
  - Decode inside the `try`, falling back to `location.replace('#/')`.
  - Reject ids that don't match the db segment grammar, using the views' existing "not here" state.

### 13. Low: the Map paints a just-finished idea "New: not learned yet"
- **Where:** 72-map.js:129-136, together with 60-today.js:193-211.
- **What goes wrong:** `ideaBands()` returns `'new'` for an idea whose cards haven't had their first review yet (they are due tomorrow). That overrides the progress fallback, so the header says "1 of 2 ideas learned" while the dot says new, not learned yet.
- **Repro:** `18-map-new.mjs` prints `nodes: ["Sound is a pressure wave, new", …]; header: "How sound travels1 of 2 ideas learned"`.
- **Minimal fix:** in `bandsFor`, add `if (b === 'new' && V.isDone(progress[t.id], i.id)) b = 'growing'`. Alternatively, have `ideaBands` leave out ideas whose cards are all unreviewed.

### 14. Low: "Go through it again" overwrites the original record
- **Where:** 50-lesson.js:375, 704 and 725, and 743-751.
- **What goes wrong:**
  - Replay saves the new guess over the original prediction.
  - It saves the new check results over the originals.
  - It re-runs `addFromLesson`, which resets `learnedAt`. That also hides recent lapses from "Learn it again".
- **Repro:** `19-replay.mjs` prints `predict="Travels to your ear" checks.c1.correct=false … card.learnedAt reset: true`.
- **Minimal fix:** in replay, don't save predict or checks (or save them under a separate `replays` field), and skip `addFromLesson`.

### 15. Low: sheets closed by navigation leak their listener and never settle
- **Where:** 00-core.js:195 (`closeSheets` only clears the DOM), plus 212 and 223 (each sheet's `keydown` listener).
- **What goes wrong:** a route change while a sheet is open never calls that sheet's `close()`.
  - Its document `keydown` listener leaks, along with its closures.
  - `onClose` never runs.
  - A pending `confirmSheet` promise never settles.
- **Repro:** `10-sheet-leak.mjs` opens "Delete this topic?" and navigates away, five times. It prints `keydown listeners leaked: 6; confirmSheet promise: pending`.
- **Minimal fix:** keep a list of open sheet APIs, and have `closeSheets()` call `close()` on each.

### 16. Low: boot waits forever if `user.id()` never answers
- **Where:** 10-runtime.js:15-18.
- **What goes wrong:** each `claude.use()` call has a 10 s guard, but `user.id()` has none. The app stays on "Opening your university…".
- **Repro:** `15-ready-hang.mjs`. After 13 s the view still says "Opening your university…".
- **Minimal fix:** race `user.id()` against the same 10 s timeout. A null uid falls back to memdb plus the existing notice.

## Checked and found sound
- **FSRS and day arithmetic** (`11-fsrs-dates.mjs`).
  - Calendar coverage: every day from 2024 to 2031 in 13 time zones. These include zones where DST starts at midnight (Santiago, Havana, Asunción, Beirut), a half-hour DST shift (Lord Howe), UTC+14 (Kiritimati), month ends and leap days.
  - FSRS states: 20,000 random states, including cards overdue by 5 years and a `last` date in the future.
  - Results: `addDays`, `daysBetween` and `today` always round-trip. The due date is always after the review day, with no NaN. Difficulty stays within 1..10, intervals are at most 365, and Hard ≤ Good < Easy.
  - No problems found.
- **Subscriptions** (`12-subs.mjs`). Across 32 route changes covering every view, including a lesson waiting on another device, there were never more than 3 live subscriptions (the limit is 64). Every view unsubscribes on cleanup.
- **Double-submits.** Predict, say-it-back, checks, review Continue, the Learn ask form, the warm-up, flagging and backup are all guarded.
- **Already fixed during this review (ce034f6).** Two bugs no longer reproduce:
  - A topic deleted while its research or lesson prefetch was still running came back as a ghost "Untitled topic" card. The card linked to `#/t/undefined` and could not be deleted.
  - Lesson heartbeats recreated orphan `topics/{tid}/lessons/{iid}` docs.

  The 20-store.js change in ce034f6 stops both: patches no longer create shared docs, and it adds the `removed` set. `01-ghost-topic.mjs` stays as a regression check and now prints `NOT REPRODUCED`. That change does not cover private docs written from another device (finding 1), and it introduced the silent write drops in finding 4.
