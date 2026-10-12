# UX and accessibility review: My University

Reviewed 2026-10-05 against build `2026-10-05-54d1616` (`node tools/build.mjs`, full app).

## How this was tested

`tools/harness/page.mjs` drove the real build with the model stubbed (fixtures: `plan-jet-engines`,
`research-jet-engines` with the research tools called in-page, `lesson-jet-engines-i1`, and a kit body
matching its controls; `views-seed` for the library). Each run went through every main journey: first run,
typing a topic, planning, the topic page with warm-up, a full lesson (predict, play, Ask Claude, reveal,
explain, source sheet, flag sheet, say it back twice, three checks including a target, done), the topic
again, Learn as a returning user, Today, an 8-card review session (order, target, recall x2, choice x3,
estimate), the summary, Map, Book, Settings and the delete confirmation.

Configurations: 360x707 light m, 360 dark m, 360 light xl with easier reading, 360 dark xl, 1280x800
light m, 1280 light m with easier reading, 1280 dark xl with easier reading, and 280 px light xl (about
what a 130% OS zoom looks like at 360). Each screen got an automated check for horizontal overflow,
tap targets under 44 px, WCAG contrast, clipped text and missing names. Separate probes covered
keyboard order, sheet focus, route focus, reduced motion, re-renders and layout shift. Screenshots are
in `tests/out/review-ux/` (`<width>-<theme>-<size>[-easy]-NN-<state>.png`, plus `probe-*.png`). Web fonts
can't load in the sandbox, so the screenshots use fallback fonts.

Severity: **High**: Dan or a keyboard/screen-reader user is blocked or misled. **Medium**: noticeable
friction or a broken promise. **Low**: polish.

---

## Ranked findings

### 1. High: the Text size setting changes almost nothing outside the explanation prose
- **Screen/state:** every screen at text size L/XL. Compare `360-light-m-14-lesson-predict.png` with
  `360-light-xl-easy-14-lesson-predict.png`, and see `360-light-xl-easy-60-review-5-choice.png` and
  `360-light-xl-easy-73-map.png`.
- **What's wrong:** `--fs` feeds only 8 rules (`.reading`, the hook, analogy and model-answer text, Book text).
  Everything else is a fixed `px` size. A probe at m and xl measured the same sizes for the lesson title
  (26.4px), the predict question (21.6px), answer options (17px), the lede (16px), buttons (16px) and the
  step label (11px). Review cards, tutor replies, Today, Map labels, settings and all the 10–12px uppercase
  labels ("A COMMON MIX-UP", "YOUR ANSWER", "Claude" at 10px) stay the same size. The interactive inside the
  iframe *does* scale (32-sandbox.js passes `size`), so at XL the iframe text ends up larger than the app's
  own text around it.
- **Why it matters:** Dan turns on large text to read questions and answers. Today XL only enlarges about a
  third of what he reads, and none of the quick checks or reviews.
- **Fix:** scale the root size and move component sizes to `rem`. In `00-tokens.css`, add
  `:root{font-size:100%} :root[data-size="s"]{font-size:93.75%} :root[data-size="l"]{font-size:112.5%} :root[data-size="xl"]{font-size:125%}`
  and `--fs:1.125rem`. Then convert the `px` font sizes in `10-base.css`, `40-review.css`, `50-lesson.css`
  and `70-views.css` to `rem` (for example `.option{font:600 1rem/1.4 …}`, `.lsn-steps-label{font-size:.75rem}`,
  `.qc-g-claude{font-size:.75rem}`, minimum `.75rem`). Make the grade grid wrap once text grows (see 18).

### 2. High: in dark mode, the delete button, error toasts and "done" ticks are unreadable
- **Screen/state:** dark mode: the topic delete confirmation (`360-dark-m-81-topic-delete-sheet.png`), every
  `U.toast(…, {kind:'bad'})`, and the finished nodes on a topic path (`360-dark-m-80-topic-tides-full.png`).
- **What's wrong:** `.btn.danger` and `.toast.bad` use `color:#fff` on dark `--red` `#F2A6AC`, which is
  **1.94:1** (AA needs 4.5:1). `.is-done .pnode-mark{color:#fff}` on dark `--green` `#6FCB94` is **1.97:1**.
- **Why it matters:** the one irreversible action ("Delete topic") and every error message ("Claude is busy…")
  are nearly invisible at night, and the "done" tick, which is the main progress signal, fades away.
- **Fix:** add an `--on-red` token in `00-tokens.css`: `#FFFFFF` in light, `#2A0E11` in dark. Use it in
  `10-base.css` `.btn.danger` and `.toast.bad`. In `70-views.css` change `.is-done .pnode-mark { color: var(--on-green); }`.

### 3. High (keyboard, screen reader): sheets don't take focus, don't trap it, and can stack
- **Screen/state:** Reading settings, the source sheet and the delete confirmation at 1280
  (`probe-1280-sheet-focus-escaped.png`).
- **What's wrong:** `U.sheet` only focuses something inside when `autofocus !== false`, and settings, source
  and `confirmSheet` all pass `false`. Focus stays on the trigger behind the scrim. In the probe, 24 of 40 Tab
  presses landed on the page behind the dialog (the ask input, chips, cards). `#app` is never `inert`, so the
  `aria-modal="true"` is only nominal. After opening "Delete this topic" with the keyboard, pressing Enter
  again opens a **second** confirm sheet on top of the first (probe: 2 `.sheet`s).
- **Why it matters:** on desktop, the settings and the delete confirmation can only be reached by tabbing
  through the whole page. A screen reader doesn't announce that a dialog opened.
- **Fix (`00-core.js` `U.sheet`):** always move focus into the sheet. When `autofocus` is false, give the
  `h2` `tabindex="-1"` and focus it. Set `document.getElementById('app').inert = true` while any sheet is open
  and clear it in `close()`. Wrap Tab/Shift+Tab inside `box`. In `71-topic.js`, ignore delete clicks while a
  confirmation is open.

### 4. High (screen reader): the whole screen is an `aria-live` region, and the topic page rebuilds itself
- **Screen/state:** every route. The topic page during research, warm-up answers and progress writes.
- **What's wrong:** `body.html` has `<main id="view" aria-live="polite">`. Every route change and every DOM
  insertion is queued as an announcement: the whole Learn page, every lesson stage, the whole topic page. On
  top of that, `71-topic.js render()` runs `U.clear(root)` and rebuilds the page on every topic/progress
  snapshot. A probe confirmed the current path node is replaced after a progress write. TalkBack would
  re-read the topic page and lose its place each time. Focus isn't moved on navigation: it stays on the tab
  link, or drops to `<body>` on the lesson. `document.title` is always "My University".
- **Fix:** remove `aria-live` from `#view`. The targeted live regions are enough (`.lsn-prep`, `.lsn-grading`,
  `.qc-fb`, `.tutor-log` already have them). In `U._route`, after render, focus the screen's `h1`
  (`tabindex="-1"`, `preventScroll`) and set `document.title = '<screen> · My University'`. In `71-topic.js`,
  re-render only the section that changed (library, path, warm-up), or skip the re-render when the data
  hasn't changed.

### 5. Medium: in review, the recall card shifts under Dan's thumb when Claude's grade arrives
- **Screen/state:** a recall card in review, 360 (`360-light-m-55-review-3-recall-grading.png` then `-56-…-after.png`).
- **What's wrong:** while grading, "Continue, Claude will grade it" sits at about 639–692 CSS px. When the
  verdict arrives, "Partly there" and the follow-up are inserted above the grade picker, and the picker moves
  to about 650–707, exactly where Continue was. The marked grade also gains a "CLAUDE" line, which makes that
  one button taller than the other three.
- **Why it matters:** the grade typically lands about 2 s after Dan locks in, which is when his thumb goes to
  Continue. A mistimed tap sets a grade instead, and that changes his schedule.
- **Fix (`41-cards.js` recall / `40-review.css`):** reserve the verdict's space (`.qc-claude{min-height:96px}`),
  or render the verdict below the picker. Show the "Claude" tag as an outline badge inside the button's
  existing height (`.qc-g{min-height:64px}` for all four). Also ignore taps for about 300 ms after the layout
  changes.

### 6. Medium: a new topic and a returning visit both bury the "start the next idea" action
- **Screen/state:** topic page at 360 (`360-light-m-07-topic-ready-full.png`, `-06`, `-42`, `-43`) and 1280 (`1280-light-m-06`).
- **What's wrong:** on a new topic, "Start here" is about 1,700 CSS px down (banner, hook, "In one breath", a
  4-option warm-up, then the path). After finishing an idea, "Back to topic" and the lesson's ✕ both land at
  the top of the topic page (`window.scrollTo(0,0)`), so Dan scrolls 2–3 screens to reach "Up next".
- **Why it matters:** "Today's study is one tap away" is a product rule, and here the next lesson is three
  screens away.
- **Fix (`71-topic.js`):** add a primary button to `tp-head`: "Start: <idea>" or "Continue: <idea>", linking
  to `#/t/:tid/:iid`. When arriving from a lesson (set a `sessionStorage` flag in 50-lesson's links), scroll
  `.pnode.is-current` into view. Consider moving the warm-up below the path or collapsing it to one line.

### 7. Medium: Learn hides today's reviews below the fold, especially on desktop
- **Screen/state:** returning user, 360 (`360-light-m-45-home-library.png`) and 1280 (`1280-light-m-45-home-library.png`).
- **What's wrong:** at 360 the "8 reviews ready" row starts exactly at the fold (707 px) under the tab bar, and
  the Continue button is half under the tab bar. At 1280 the compact ask is not used (`.is-returning` rules
  sit inside `@media (max-width:599px)`), so the full hero, level picker and 5 example chips fill the first
  screen. Continue starts about 600 px down and the reviews row is off screen.
- **Fix (`70-views.css`, `70-learn.js`):** apply the `.learn.is-returning` compact rules at all widths. When
  reviews are due, render `todayBox` above `continueBox`, or merge them into one card ("8 reviews · 6 min",
  then Continue).

### 8. Medium: focused and scrolled-to controls land behind the fixed bottom tab bar
- **Screen/state:** warm-up answer at 360 (`probe-360-warmup-next-behind-tabbar.png`, also `360-light-m-10-topic-warmup-q1-reveal.png`).
- **What's wrong:** after answering, "Next question" gets focus, but its bottom edge (654 px) is under the tab
  bar (top 642 px). The browser thinks it's "in view". The same applies to any `focus()` or `scrollIntoView`
  near the bottom on tabbed screens.
- **Fix (`10-base.css`):** `html{scroll-padding-top:calc(var(--topbar-h) + 8px);scroll-padding-bottom:calc(var(--tabbar-h) + 16px + env(safe-area-inset-bottom,0px));}`
  and `--tabbar-h:0px` at ≥760 px and in `.focus`.

### 9. Medium: "What am I looking at?" shows stale numbers that contradict the interactive
- **Screen/state:** Play, after moving a slider (`360-light-m-19-lesson-play-what.png`, `-23-lesson-reveal.png`).
- **What's wrong:** the numbers list comes from the lesson JSON (`spec.numbers`), so after Dan sets the ball to
  6 kg it still says "Mass of the ball 2 · you set this" and "Your speed forwards 0.29 · worked out from the
  rule", while the interactive above reads 6 kg and 0.86 m/s.
- **Why it matters:** this breaks the brief's "numbers are controls or computed from a shown rule". Dan sees
  two different answers on one screen.
- **Fix (`50-lesson.js` `drawNotes`):** on the `<details>` `toggle` event, call `st.liveMount.get()` and fill
  `control`/`computed` rows from `params`/`outputs`, matching control ids from `spec.controls`. At minimum,
  label the column "Starting value".

### 10. Medium: target cards in review hide their own controls under the docked button
- **Screen/state:** review target card, 360 (`360-light-m-52-review-2-target.png`) and 1280 dark (`1280-dark-xl-easy-68-review-8-target.png`).
- **What's wrong:** the sticky `.qc-review .qc-foot` (button plus a 20 px fade) covers the interactive's
  slider row. The interactive is about 1,100 px tall at 360, so the goal ("Aim for 1") scrolls away while Dan
  adjusts the slider.
- **Fix (`40-review.css`):** `.qc-review.qc-type-target .qc-foot{position:static}`, or keep the foot sticky
  but repeat the goal in it ("Aim for 1 m/s · Check my setting"), and give `.qc-stage` `margin-bottom` equal
  to the foot height.

### 11. Medium: lesson preparation shows a failure with a success tick, and repeats lines
- **Screen/state:** lesson prep (`360-light-m-16-lesson-play-waiting.png`), and a failed write
  (`1280-light-m-easy-14-error-predict.png`, `280-light-xl-easy-14-error-predict.png`).
- **What's wrong:** on failure, `makePrep().fail()` marks the last status line `is-done`, so "✓ Claude's
  answer came back in the wrong shape…" appears with a tick, and the same sentence repeats in the red notice
  below. During a normal build, "✓ Building your interactive…" is followed by "• Building the interactive…".
  Finished lines keep their "…".
- **Fix (`50-lesson.js` `makePrep`):** in `fail()`, mark the last line `is-failed` (red ✕) instead of
  `is-done`, and don't echo the error as a status line. In `line()`, skip text that matches the previous line
  or the head once case and "…" are ignored, and strip a trailing "…" when a line is ticked.

### 12. Medium: "This looks wrong" promises a fix that nothing delivers
- **Screen/state:** the lesson footer and its sheet (`360-light-m-27-lesson-flag-sheet.png`, `-13-lesson-open.png`).
- **What's wrong:** the sheet says "It is saved with this lesson so it can be checked and fixed", but
  `lessons/{iid}.flags` is written in 50-lesson.js and never read anywhere: not by relearn, writeLesson or the
  Book. The link is also offered while the lesson is still being written, and then fails with "There is no
  lesson saved yet".
- **Fix:** pass `flags` into `U.gen.relearn` / `writeLesson` (`avoid`) and show a "Rebuild this lesson" action
  on the topic page for flagged ideas. Or change the copy to what actually happens. Hide `.lsn-foot` until
  `st.lesson` exists.

### 13. Medium: internal prompt templates show through as copy
- **Screen/state:** Play lede (`360-light-m-17-lesson-play-ready.png`) and the "A common mix-up" panel (`360-light-m-34-lesson-check1-wrong.png`).
- **What's wrong:** the Play stage shows the build brief word for word: "The one thing you should see is the
  skater rolling forwards faster when you throw…". The validator enforces this template on every lesson, and
  the interactive's own lead line says the same thing again just below. Misconceptions read like notes about
  Dan in the third person: "Thinks the push comes from the air outside."
- **Fix:** in `50-lesson.js renderPlay`, either drop `brief` (the kit's `.lead` already gives the instruction)
  or rewrite it: `brief.replace(/^The one thing you should see is\s*/i,'Watch for ')`. In `30-prompts.js`
  (check rules, line 448), ask for misconceptions "addressed to Dan as 'you', e.g. 'It's easy to think …,
  but …'".

### 14. Medium: the selected answer is hard to see, and the wrong-answer state is muddy
- **Screen/state:** predict and check options (`360-light-m-15-lesson-predict-picked.png`), warm-up reveal (`360-light-m-10-…`).
- **What's wrong:** selection only changes the 1.5 px border from `#DED8CC` to navy, plus a 1 px inset. There's
  no fill and no mark. On a wrong answer, the picked option shows the red border with the navy inset still
  inside it.
- **Fix (`10-base.css`):** `.option[aria-pressed="true"]{background:color-mix(in srgb,var(--heading) 8%,var(--surface));}`
  plus a leading radio dot. `.option.correct,.option.wrong{box-shadow:none}`.

### 15. Medium: some tap targets are too small: footnotes, example chips, desktop tabs
- **Screen/state:** explain, tutor and "What am I looking at?" footnotes (`.fn` 22×22, which is under WCAG 2.2's
  24×24 minimum); example and tutor chips (`.chip` 40 px); desktop tabs (40 px); the lesson step segments
  (32×44, close together).
- **Fix (`10-base.css`):** `.fn{min-width:28px;height:28px;position:relative}` `.fn::after{content:"";position:absolute;inset:-8px}`;
  `.chip{min-height:44px}`; and `.tab{min-height:44px}` in the ≥760 block.

### 16. Low: "Reading settings" holds much more than reading settings
- `360-light-m-76/77-settings*.png`. The "Aa" button opens "Reading settings", but the sheet also holds the
  daily review cap, light days, Research and Backup. Dan won't look for Backup there. Rename the sheet
  "Settings" (`74-settings.js` title, `#settings-btn` aria-label) and keep "Aa" as the icon.

### 17. Low: the review session's close button and progress scroll away
- `360-light-m-51-review-1-order-after.png`. The lesson keeps its bar sticky, but `.rv-top` scrolls off as soon
  as the feedback panel opens. Add `.rv-top{position:sticky;top:0;z-index:5;background:var(--bg);padding-block:8px}` in `40-review.css`.

### 18. Low: the grade picker and its hint crack at narrow widths and large text
- `280-light-xl-easy-38-review-3-recall-after.png`, `360-light-m-56-…`. "19 days" wraps, the "CLAUDE" tag
  clips, and the hint "HOW WELL DID YOU KNOW IT? CLAUDE'S PICK IS MARKED; CHANGE IT IF YOU DISAGREE." is a whole
  sentence in letter-spaced capitals. Set the hint in sentence case (a plain `p.muted.small` after a short
  `.qc-label`). Use `.qc-grades{grid-template-columns:repeat(auto-fit,minmax(72px,1fr))}`, which gives 2×2
  when it's tight.

### 19. Low: the review-done celebration covers the heading
- `360-light-m-69-review-summary.png`. `U.cheer('Review done')` pops at 38% of the viewport, on top of "Review
  done", the summary sentence and a second green tick. Either drop the cheer in `drawSummary` (the page already
  has `.td-done-mark`), or align it with the mark as the lesson does.

### 20. Low: some map and switch markers are too faint (non-text contrast)
- Map "New" ring (`--line-strong`) is 2.13:1 in light and 2.16:1 in dark; the "Fragile" fill `#EDC25A` is
  1.68:1 on white (its stroke is 2.65:1); switch-off tracks are 2.1:1. WCAG 1.4.11 wants 3:1. Fully learned
  topics show teal "growing" dots, while everywhere else green means "finished", which reads as unfinished
  (`360-light-m-73-map-full.png`, `1280-dark-xl-easy-73-map.png`). Use `--muted` for the New ring and a darker
  fragile stroke (`#A87B12`), use `--muted` for `.switch` off, and consider a green ring on strong ideas in
  completed topics.

### 21. Low: map labels are cut off with "…"
- `360-light-m-72-map.png`: "Throw something back, get…", "Why real coastlines differ from th…". Allow a third
  line in `72-map.js` label wrapping, or shorten using the idea's `oneLine`.

### 22. Low: the sheet grip looks draggable but isn't, and scrolling leaks to the page behind
- There's no swipe handler on `.sheet-grip`, and it also shows on the desktop modal. Scrolling past the end of
  the settings sheet scrolled the page behind by 804 px. Add `.sheet{overscroll-behavior:contain}` and
  `html.sheet-open body{overflow:hidden}`. Either add swipe-down to close, or hide `.sheet-grip` at ≥760 px.

### 23. Low: multiple choice works three different ways
- Warm-up commits on the first tap; Predict is select then "That's my guess"; checks are select then "Check".
  An accidental warm-up tap can't be undone. Pick one model (select, then confirm) everywhere, or say "Tap
  your answer" on the warm-up.

### 24. Low: copy nits
- The topic path kicker says "UP NEXT" but its button says "Start here" (`71-topic.js:206/218`); make the
  button "Start this idea".
- "Marked Again · back tomorrow" uses FSRS jargon; try "Coming back tomorrow" (`41-cards.js` `drawLine`).
- The guess reveal never acknowledges a right guess, because `predict` has no answer index. Add an optional
  `predict.answer` (option index) to the lesson schema so the reveal can say "You called it."
- On phones the level picker sits after "Start learning", so Enter submits before Dan sees it.

### 25. Low: smaller polish items
- There's no `lang` on `<html>`: set `document.documentElement.lang='en-GB'` in the head script, for TalkBack
  pronunciation and hyphenation.
- The interactive's reserved height differs from its real height on desktop (600 to 806 px), so "I've had a
  play" jumps 206 px on first visit.
- "Where it breaks" (sans) sits under "Think of it like this" (serif) in the same analogy card.

---

## Checked and fine
- No horizontal scroll anywhere at 280, 360 or 1280, in light or dark, at any text size.
- Keyboard focus is clearly visible everywhere (3 px teal outline; inputs use a navy ring). The tab order is
  logical, the sandboxed interactive is not a keyboard trap, and the lesson moves focus to each new stage's
  heading.
- Reduced motion is respected: no running animations with `prefers-reduced-motion`, and JS scrolling switches
  to `auto`.
- Waiting states are calm and specific (planning lines, lesson prep lines, "Reading your answer…", recall
  graded in the background), and every error offers Try again plus a way back.
- Empty states (Map, Book, Today, review) all point to a next step.
- Light-mode text contrast passes AA everywhere: muted 5.4:1, teal labels at least 5.4:1, red on red tint
  6.2:1. The only text failures are the dark-mode ones in finding 2.
