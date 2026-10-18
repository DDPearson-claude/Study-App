# The Deck: course-library flows in the current look

Dan chose this on 18 Oct 2026 from the library-directions canvas
(https://claude.ai/artifact/8Qnq8o8LvM22ThXk93yWaG, row E). The app becomes a library of ready-made
courses only (docs/HANDOFF-redesign.md), and Dan wanted fresh flows around the look he already has,
not a new look: "I really like my original, I just wanted some fresh flows around it." So the look
stays D4, "Claude's notes" (`app/src/css/80-d4.css`, docs/ARCHITECTURE.md section 12), token for
token, and direction D's flows go inside it: every lesson is a picture card, the home screen is a
deck to open anything from, a course is a hand of cards, and review is a box of puzzle cards to
flip through when he likes.

Mockups only: nothing in the app has changed yet. The row E artboards are 390 x 844 phone screens
and one 1280-wide laptop screen, drawn with the real Maths courses, Dan's real progress
(Trigonometry at lesson 4, Fractions finished) and the lessons' own drawings.

| Artboard | Screen | Address |
|---|---|---|
| E · home | The Deck, in place of Learn | `#/` |
| E · a course | The course page with its lessons as cards | `#/t/:tid` |
| E · Cards | Puzzles to flip through, in place of Today | `#/cards` (`#/today` still opens it) |
| E · home on a laptop | The Deck at 1280 px | `#/` |

## What stays exactly as it is

- Every token and component of D4: the dotted canvas, ink outlines on what he acts on, grey
  `--sunk` panels for what he reads, Barlow, `--cond` labels in teal, `--mono` for where he is,
  the floating tab bar with an ink pill, the six course tones (`V.toneOf`), green for finished
  only, red for mistakes, amber for key terms and what is due.
- The lesson player (`50-lesson.js`), the kit and the sandboxed iframe, the dossier (field guide),
  Ask Claude, Settings, the Library and its shelves (`76-shelves.js`), the Map.
- Claude's notes: the comment cards keep appearing where they do now (after a puzzle is answered,
  on the done-for-today screen).

## The flows

### 1. The Deck (`#/`, tab "Deck", in place of Learn)

What the ask box, intake and planning states did on Learn is unhooked from the UI (not deleted:
the course tools still load those modules, HANDOFF section 4). In their place:

- The greeting eyebrow stays ("GOOD AFTERNOON, DAN"). The heading is **"Open anything"** and the
  line under it "Every lesson is a card. Pick one that looks interesting, or shuffle."
- A chip row (`.chip`, D4's ink outline, pressed = ink fill): **Shuffle** (an action: opens one
  random live lesson), then the filters **Everything** (default), **New to you** (lessons not yet
  started), **Done before** (lessons finished). On a laptop a soft chip per shelf (Maths…) joins
  them once more than one shelf has built courses.
- The reviews row keeps its place and shape (`.today-row`, 2 px ink outline, fit-content width on
  a phone, beside the heading from 900 px): **"12 puzzles in the box · Trigonometry and Fractions ·
  flip through when you like"**, opening `#/cards`. Its icon tile is teal (`--teal-tint`), not
  amber: the box is an offer, nothing in it is due. Amber returns only if Dan asks for a daily
  batch (open question below). With no puzzles yet the row says what Today's quiet line says now.
- **The grid of cards**, two columns on a phone, four from 900 px (the Learn width rules, section
  11). One card per live lesson of every built course, in shelf order by default; Shuffle
  reorders them and opens one.
  - A card is a `.ccard`-style white card: 2 px `--edge`, radius `--r-lg`, a 6 px band along its
    top in the course's tone (`[data-tone]::after`, as the continue card and the Map card wear it).
  - Inside: the lesson's picture on a `--sunk` panel (radius 8 px, about 92 px tall on a phone,
    110 on a laptop), then the lesson title (700, 15 px), then the course and position as a
    `--cond` label in the tone's `--acc-ink` ("FRACTIONS · 1 OF 8").
  - A finished lesson carries the green tick (`U.icons.tick` on a `--green` disc) on the picture's
    corner. Nothing else marks progress on a card.
  - **Left open**: the lesson he was last in (the topic's `lastIdea` with a stage short of done)
    is the first card and spans both columns: picture on the left, "LEFT OPEN · TRIGONOMETRY"
    label, the title, and the position in `--mono` ("lesson 4 of 8"). It is a card, not a job:
    no button, no bar, the whole card is the link.
  - Lessons not yet built ("Coming soon", a missing or not-ready lesson doc) are not in the deck.
    They show only on the course page, as dashed cards.
- Tabs: **Deck · Cards · Map · Library** (the Learn and Today icons change with the names; Cards
  takes a two-cards icon).

### 2. A course (`#/t/:tid`)

The header is the topic page's as now: the cover banner, the eyebrow ("8 LESSONS · JUST TEACH
ME"), the title, the hook. Then the path of nodes ("Your path") becomes **the hand of cards**:

- Section head "Eight cards" (the count in words, as the eyebrow counts ideas) with "In order, or
  open any · 3 done" at the right. No progress bar.
- The same card as the deck's, two columns, with the lesson's number in the course tone at the
  top left (the shelf's `.shelf-n` disc: `--acc-tint`, `--acc` border, `--acc-ink` number) and the
  green tick at the top right when finished. The left-open card has an ink number disc, an ink
  "LEFT OPEN" pill and `--shadow`, like the current node (`.is-current`).
- A lesson not yet live is a dashed card (1.5 px dashed `--line-strong`, muted, "ARRIVING", an
  empty dashed picture panel), as the shelves draw a course not built yet.
- Below the cards, unchanged and in this order: **In one breath** (the amber callout), Ask
  Claude, How you are learning this, the dossier option, Sources, Delete. The big
  "Start/Continue: …" button goes: the left-open card is the way in.

### 3. Cards (`#/cards`, tab "Cards", in place of Today)

- The date eyebrow stays. Heading **"Flip when you like"**, then "Puzzles from lessons you have
  finished. Shuffle them, or leave them in the box. Nothing here is due."
- **The box**: one puzzle card on top of two faint ones (the two behind: white, 1.5 px `--line`,
  turned a few degrees; the top one: 2 px `--edge`, `--shadow`). On the card: the `--mono` line
  "trigonometry / lesson 1" and "1 OF 12" in `--cond`, the lesson's picture on a `--sunk` panel,
  the puzzle's task (600, 18 px), an answer field (D4 input) and **Check** (ink button).
- Under it: chips **Shuffle** and **Skip**, and the link "Open the lesson".
- Check marks the answer as the lesson's own puzzle does (right in green, a mistake in red, the
  puzzle's "why" as Claude's note), then the next card comes up. Skipped cards stay in the box.
- **This week** (`.td-week`) stays under the box as it is: days he studied, no streak.
- Nothing counts down and nothing is overdue. The badge on the tab is dropped.

### 4. Shuffle and the filters

- Shuffle picks uniformly among the cards the current filter shows, never an "arriving" lesson,
  and opens it (`#/t/:tid/:iid`). On the course page, Shuffle picks within that course.
- "New to you": no progress entry for the idea. "Done before": the idea's stage is `done`
  (`U.views.isRead` for read lessons). "Everything": all live lessons.
- The filter he picked is kept on the device (localStorage, like `mu-layout`), never in the db.

## What the build needs from the content session

Written down here as HANDOFF section 6 asks; the content session adds them in
`tools/course/assemble.mjs` so every course carries them.

1. **A picture per lesson.** The deck draws the first SHOW page's drawing of each lesson. Today
   that SVG lives only inside `topics/<tid>/guide/<iid>` (every screen of the lesson, 12 pages'
   SVGs), so a deck of 130 cards would read 130 guide docs. Needed: one small doc per course,
   `topics/<tid>/deck`, `{ v: 1, pictures: { [iid]: svg } }`, each SVG the first `show` page's,
   with its `width`/`height` attributes dropped (the card sizes it by `viewBox`), well under the
   256 KiB doc cap. Written with the course and rewritten when a lesson is rebuilt.
2. **Puzzles as review cards.** Ready-made lessons are read-mode steps lessons, which make no
   review cards today (section 4: a read lesson has `checks: []`). The box needs cards. Proposed:
   each guide `example` page (task, answer, why, and its picture) becomes a card of a new type
   `puzzle` in `profile/cards/<tid>` when the lesson is finished, scheduled by FSRS like the rest,
   answered by typing and checked against `answer` (numbers with the tolerance the kit uses,
   otherwise exact after trimming). This is a product decision for Dan and a change in
   `41-cards.js` / `40-fsrs.js` plus the guide writer; until then the box is empty and the Cards
   screen shows its quiet state.

## Open questions for Dan

- The tab names: **Deck** and **Cards**, or keep **Learn** and **Today**?
- The Map: keep it as the fourth tab, or fold it into the Library once the deck exists?
- Amber: should the box ever say "due"? The mockups say never; a daily batch he asks for could.
- Shuffle: within the shelf he is looking at, or across every shelf, once Electrical arrives?
