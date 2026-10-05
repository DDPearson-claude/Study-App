# UX review, round 2: My University

**Summary.** The app is calm, consistent and finished in both layouts and both themes. Nothing blocks Dan, every state has a way forward, and no text failed WCAG contrast on any screen I checked (light or dark).
Two problems matter most. The interactive no longer follows the Text size setting (it stays at 16 px at XL, a regression from the move to `rem`). And in review, the question scrolls out of view the moment Dan answers.
The rest is laptop space use, a few unclear labels and missing units, and inconsistent switches. Count: **0 blocker, 2 major, 10 minor, 15 polish.**

## How this was tested

I tested build `2026-10-05-8950e0d` (`node tools/build.mjs --out tests/out/ux2/app.html`), the full app, with only the model stubbed. I used
`tools/harness/page.mjs` and seeded `views-seed.json`, `lesson-ui-topic.json` and `lesson-ui-pendulum.json`, plus a planning topic, a failed topic
and six due cards (choice ×2, order, estimate, target on the real pendulum interactive, recall). Scripts are in `tests/out/ux2/` (`views.mjs`,
`lesson.mjs`, `probe-*.mjs`) and screenshots are in `tests/out/ux2/shots/` (`<config>-NN-<screen>[-v|-p-sN].png`; `-L-` is the lesson, `-R-` is review).
Configs: phone 390×844 light, dark and XL; laptop 1366×768 light and dark; phone pinned on a laptop (`framed-*`); laptop pinned on a phone
(`narrowlaptop-*`). Each config covered every screen: Learn (first run, returning, planning or failed topic, nothing due), the topic page (ready,
warm-up, library, planning, failed, delete), every lesson stage plus the source, Ask Claude and "This looks wrong" sheets, revisit, Today, a
6-card review and its summary, Map, Book, Settings and the empty states. Extra probes covered text contrast on every text run
(`probe-contrast.mjs`: no failures), the kit's text size (`probe-size.mjs`, `probe-theme.mjs`), auto-scroll and line length (`probe-flow.mjs`)
and a `K.stage` exemplar in the play stage (`probe-stage.mjs`). Web fonts can't load in the sandbox, so the screenshots use fallback fonts.

The first review's high findings are fixed: text sizes are in `rem`, `on-red`/`on-green` exist, sheets make `#app` inert, and `#view` loses `aria-live` at boot.

---

## Blocker

None found.

## Major

### 1. The interactive ignores Text size: at XL everything around it grows, the interactive does not
- **Where:** the lesson play stage and target review cards, every theme and layout, at S/L/XL. Compare `phone-light-L-04-play.png` with
  `phone-xl-L-04-play.png`: the app's lede goes from 16 to 20 px, but "Length of string", the readout label and the axis ticks inside the
  frame are identical. A probe measured the kit's root at 16 px and its labels at 15.2 / 13.6 px at both M and XL. `U.sandbox.theme().size` returns 16 at every size.
- **Why it matters:** the interactive is the heart of each lesson, and its labels and tick numbers are already the smallest text in the app.
  When Dan picks XL so he can read comfortably, the one thing he has to read *and* manipulate stays small. (The first review noted the reverse
  problem: the iframe used to scale while the app didn't.)
- **Cause:** `app/src/js/32-sandbox.js` `theme()` does `parseFloat(cs.getPropertyValue('--fs'))`. `--fs` is now the string `1.125rem`, so this is
  1.125, and `Math.max(16, Math.round(1.125 * 0.9))` = 16.
- **Fix:** read pixels instead: `var fs = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.125;` (or measure a probe
  element styled `font-size: var(--fs)`). Keep the `* 0.9` mapping. Add a unit test that `theme().size` is 16/18/20 at M/L/XL.

### 2. In review, answering a card scrolls the question out of sight
- **Where:** every review card with a docked feedback panel. Laptop 1366×768 light: `laptop-light-R-01-choice-after.png` shows the options and
  "Not quite", but no question and no topic line. Phone pinned on a laptop: `framed-R-01-choice-after.png`, same. Phone 390×844:
  `phone-light-R-01-choice-after.png` and `phone-dark-R-01-choice-after.png`, where the question is sliced in half under the sticky header.
- **Why it matters:** retrieval sticks when Dan sees *question → his answer → the right answer and why* together. Here the feedback says "The
  answer: 4 s" with nothing to say what "4 s" answers, so he has to scroll back up on every miss. Review is the daily loop, so this happens every day.
- **Cause:** `reveal()` in `app/src/js/41-cards.js` (around line 202) scrolls by `card.bottom - innerHeight` so the end of the card clears the docked panel,
  with no limit.
- **Fix:** cap the scroll so `.qc-q` stays below the sticky `.rv-top`, using
  `over = Math.min(over, q.getBoundingClientRect().top - rvTop.bottom - 8)`. Let the sticky panel overlap the lower options instead, since the
  chosen and correct ones are already marked in the panel's text. At `@container view (min-width: 900px)`, put the feedback beside the options:
  there are 600 px to spare. Optionally, collapse the unchosen wrong options to one line after answering.

## Minor

### 3. On a laptop the explanation runs about 80–90 characters a line
- **Where:** lesson Explain at 1366 (`laptop-light-L-09-explain.png`): one line reads "A pendulum's period is the time it takes to swing out and
  back once. It depends on just two". The paragraph is 704 px of 18 px serif.
- **Why:** "calm reading, narrow column" is a product rule, and this is *the* reading. 60–70 characters is easier, especially at line-height 1.8.
- **Fix:** `app/src/css/50-lesson.css:160` `.lsn-reading p { max-width: none; }` overrides the base `.reading p { max-width: 36em }`. Drop it, or
  use `max-width: 38em` (about 68ch). The analogy box can stay at `--measure`.

### 4. The laptop layout spends the first screen on decoration and empty space
- **Where:**
  - Topic page at 1366×768 (`laptop-light-03-topic-tides-v.png`): the 4.6:1 banner is about 260 px tall, so the path, warm-up, Ask Claude and
    Library all start below the fold.
  - Learn (`laptop-light-01-learn-first-v.png`, `laptop-light-02-learn-returning-v.png`): the ask box and the "6 reviews ready" row stop at 44rem,
    leaving the right 40% of the first screen empty above the Continue card.
  - Topic planning or failed (`laptop-light-07`, `-08`): the content takes the left 60%.
- **Why:** on a short laptop screen Dan should see where he is in the topic (path and progress) without scrolling, and the empty top-right
  reads as unfinished.
- **Fix:** in `70-views.css` `@container view (min-width: 900px)`, give `.tp-banner` `aspect-ratio: auto; height: 150px` (or move the cover
  into `.tp-rail` as a thumbnail). For Learn, lay out `.ask` and `.learn-today` as two columns (`grid-template-columns: minmax(0,1fr) 380px`) so the
  reviews row sits beside the ask.

### 5. Laptop review: Check sits far from the answers, and target cards push their controls below the fold
- **Where:** `laptop-light-R-01-choice-before.png`: the options end at y≈500 and the docked Check button sits at the window bottom (about 300 px gap).
  `laptop-light-R-03-target-loaded.png`: the interactive is in the 720 px column, so the slider sits at the fold and the readout and "Check my
  setting" are below it. Scrolling to the button takes the pendulum off screen.
- **Fix:** on laptop, `.qc-review .qc-foot { position: static; }` (`40-review.css:19`), so Check follows the options. For target cards, give
  `.view[data-screen="review"]` the lesson's 1120 px when the card holds an interactive, so `K.stage` can put the controls beside the visual, and
  dock `.qc-aim` + the button.

### 6. Phone at XL: the predict question and lesson headings crowd out the answers
- **Where:** `phone-xl-L-01-predict.png`: the eyebrow wraps ("…IDEA 1 / OF 5"), and the predict question is 5 lines at 27 px. Only 1.5 options
  show and "That's my guess" is two screens down. At M it all fits (`phone-light-L-01-predict.png`).
- **Why:** at XL the headings grow as much as the body text, so the actual task (pick an answer) falls off the first screen.
- **Fix:** let headings grow less than body text. For example, in `50-lesson.css`:
  `:root[data-size="l"] .lsn-h { font-size: 1.25rem } :root[data-size="xl"] .lsn-h { font-size: 1.15rem }` (about 23 px at XL instead of
  27 px). Let the eyebrow drop the topic name below 400 px (`.lsn-wide` exists for this).

### 7. Target cards don't say what the number is
- **Where:** `phone-light-R-03-target-loaded.png`: "Use the **Length of string** control. Aim for **3** (give or take 0.05)." Result
  (`phone-light-R-03-target-after.png`): "It read 2.01; the target was 3 give or take 0.05."
- **Why:** "3" of what? The readout he is watching is "Time for one swing". Faithful-numbers rule: show units.
- **Fix:** in `41-cards.js` `target()` (lines 428–437 and 484), look up the output in `lesson.interactive.outputs` (label and unit) and write
  "Aim for **Time for one swing = 3 s** (give or take 0.05 s)" and "Time for one swing read 2.01 s; the target was 3 s."

### 8. The recall card asks a question Dan can't answer, and hides his old answer behind an unmarked control
- **Where:** `phone-light-R-06-recall-after.png` and `phone-dark-R-06-recall-after.png`. Under "Partly there" it says "How much slower? If the
  string is four times as long, what happens to the swing time?", but the input is locked and the next step is to grade himself.
  "What you wrote when you learned it" is a `<details>` summary with no chevron (`.qc-mine summary { display: flex }` removes the marker), so it
  reads as a heading.
- **Fix:** in review, introduce the follow-up as "Something to check next time:" (`41-cards.js:570`), or turn it into a statement of the missed
  rubric point. Add a chevron (`.qc-mine summary::after`, rotated when `[open]`), as `.lsn-past` does.

### 9. The Book shows a lone explanation faded, as if it had been replaced
- **Where:** `phone-light-11-book-p-s1.png`, `laptop-light-11-book-v.png`: "IN YOUR WORDS · Sep 20" and "What an index is" are drawn in the
  78%-ink grey that is meant to mark an *earlier* try.
- **Why:** it is his current explanation. Fading it suggests it was superseded.
- **Fix:** in `app/src/js/73-book.js:77`, pass `'is-first'` only when `many` is true.

### 10. Two different switches, and in dark mode "off" looks on
- **Where:** Today's "Light day" (`phone-light-09-today-v.png`: dark knob on a pale outlined track) versus Settings' "Easier reading" and
  "Light days" (`phone-light-12-settings-mid.png`: white knob on a grey track). In dark mode the Settings switch is off but shows a white
  knob on `#A9B1BC` (`phone-dark-12-settings-top.png`), while on is a pale-blue track. Both look "lit".
- **Fix:** use one component. Move `.td-switch` styles (`40-review.css:228–232`) and `.switch` (`70-views.css`) to one shared rule: off = `--sunk`
  track, `inset 0 0 0 2px var(--muted)`, `--muted` knob; on = `--heading` track, `--on-heading` knob.

### 11. Map: "every idea learned" is invisible, especially in dark
- **Where:** `laptop-dark-10-map-v.png`, How index funds work: the finished-topic signal is a green ring (`#6FCB94`) around teal dots
  (`#6CC7BD`), almost the same colour. In light the green and teal rings are also close. The legend doesn't mention the ring.
- **Fix:** mark a finished topic in its header with a tick and "Every idea learned" in green (`.done-note`), and drop the ring. Or draw
  the ring 3 px outside the dot (a separate circle) and add it to `.map-legend`.

### 12. Planning and failed topics are titled with the raw lowercase query, and the copy disagrees
- **Where:** `phone-light-02-learn-returning-p-s1.png`: "how black holes form", "how the romans built roads that lasted", and "Planning stopped.
  Open it to try again." for a topic whose page (`phone-light-08-topic-failed-v.png`) says "Planning did not finish. Claude is busy…".
- **Fix:** in `70-learn.js` `topicCard()`, use the same `asTitle()` as `71-topic.js:143`. When `t.status === 'failed'`, say "Planning did not
  finish. Open it to try again."; keep "stopped" for a stuck planning topic.

## Polish

13. **The review summary's numbers don't match its list, and its widths are ragged on a laptop.** `laptop-light-R-91-summary.png` shows
    "Back tomorrow **4**" above a list of **2** ideas. The stat tiles, the list, the "Worth another look" card and the buttons are four different
    widths. Fix: say "4 cards, from 2 ideas", and give `.rv-done > *` one `max-width` (for example 560 px).
14. **Footnote badges break the line spacing of the prose.** Lines holding a `.fn` badge are visibly taller (`phone-light-L-09-explain.png`,
    "gravity. [2]" and "swings, [1]"). Fix: `.fn { height: 1.25em; min-width: 1.25em; vertical-align: 0.35em; }` and keep the larger hit area
    with `::after`.
15. **The revisit summary cuts Dan's own words mid-word.** "You guessed: It takes twice as l…" (`phone-light-L-26-revisit.png`). Fix:
    `.lsn-past-sum` uses a 2-line clamp instead of `nowrap; text-overflow: ellipsis`.
16. **Ask Claude's empty state leaves a large blank on a phone.** The starter chips are at the top, about 550 px of nothing follows, and the
    input is at the bottom (`phone-light-L-06-ask-empty.png`). Fix: put the starters in `.tutor-dock` (where they go after the first answer)
    and keep the empty state's text short.
17. **The note toast lingers over the next stage.** "Thanks. Your note is kept with this lesson." covers the bottom 70 px of the Say stage for 3 s
    and takes taps (`phone-light-L-13-say.png`). Fix: confirm inside the sheet before it closes, or use `ms: 1800` with `pointer-events: none`.
18. **The sticky review header isn't full-bleed.** The feedback panel's corners show beside it (`phone-light-R-06-recall-after.png`, top
    left and right). Fix: `.rv-top { margin-inline: -16px; padding-inline: 16px; }` (`40-review.css:271`).
19. **A long topic question scrolls sideways in the one-line input.** "› vaccines train the immune system" (`phone-light-01-learn-first-typed.png`).
    Fix: make `.ask-input` an auto-growing 1–3 line textarea (Enter still submits).
20. **The failed topic's Delete looks like a neutral action.** It is a navy ghost button beside Try again (`phone-light-08-topic-failed-v.png`),
    while Delete is red everywhere else. Fix: reuse `.tp-delete.linkish`.
21. **The planning page gives no sense of time, and its skeleton is almost invisible** (`phone-light-07-topic-planning-v.png`). Fix: add "This
    usually takes under a minute. You can leave; it carries on." and raise the skeleton contrast (`--line` instead of `--sunk`).
22. **The laptop Settings dialog cuts "Daily reviews" off mid-row with no cue that it scrolls** (`laptop-light-12-settings-top.png`). Fix: a
    bottom fade on `.sheet` when it overflows, or two columns at 620 px.
23. **The Today badge covers part of its clock icon,** about 40% at XL (`phone-xl-02-learn-returning-v.png`). Fix: pin it to the icon corner,
    `right: calc(50% - 20px)`, with a px size.
24. **Covers repeat.** 4 of 6 topics get the same arches motif, differing only in hue (`laptop-light-02-learn-returning-p-s1.png`). Fix: pick the
    motif from more hash bits, or add motifs.
25. **On a laptop the headings jump between tabs.** Learn and Map start at the left edge of a 1200 px area; Today and Book are a centred 720 px
    column, so the h1 moves about 350 px sideways when switching tabs (`laptop-light-09-today-v.png` vs `laptop-light-10-map-v.png`). Fix:
    left-align the 720 px column with the wide screens' left edge, or put Today's "This week" and "Worth another look" in a right column.
26. **Some links are small targets.** Library source titles are 22 px tall and Book idea titles are 20 px
    (`phone-light-03-topic-tides-p-s3.png`, `phone-light-11-book-p-s0.png`). Fix: make the whole `.src` card the link, or add
    `padding-block: 8px`.
27. **Copy:** "Save as JSON" in the Book is jargon (try "Save everything (for a backup)"). The done screen's 4-line centred paragraph
    (`phone-light-L-25-done.png`) reads better left-aligned or as two short lines. With the laptop layout pinned on a phone, the tabs become
    unlabelled icons (`narrowlaptop-02-learn-returning-v.png`); say so under Settings → Layout.

## Checked and fine

- No sideways scroll on any screen or config.
- No text below WCAG AA in either theme (probe on every text run).
- The framed phone column keeps its tabs, sheets and toasts inside the frame.
- Sheets centre as dialogs on a laptop.
- The lesson moves focus to each new stage's h2 and scrolls it under the bar.
- The grade picker wraps to 2×2 at XL.
- Planning and failed topics always offer a way forward.
- `K.stage` exemplars sit side by side on a laptop (`probe-stage-compound-growth-laptop-play.png`).
