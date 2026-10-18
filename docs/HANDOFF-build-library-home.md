# Handoff: build "the Library is the home"

Written 18 Oct 2026 by the redesign session, for the session that builds the app (the one that also
builds the courses). Dan chose this design on 18 Oct from six directions. Everything you need is in
the repo; the canvas link is a convenience, not a dependency.

Read first, in this order:
1. `CLAUDE.md` (product and code rules).
2. `docs/design/library-home/README.md`: the design, screen by screen, in D4 component names. The
   mockups are beside it: `home.html`, `lookup.html`, `folder.html`, `course.html`, `today.html`
   (plain 390 x 844 pages, open in a browser) and `overview.png` (all five side by side). The same
   screens are row F of https://claude.ai/artifact/8Qnq8o8LvM22ThXk93yWaG.
3. `docs/ARCHITECTURE.md` sections 4 (data model), 9 (module APIs), 10 (navigation), 11 (layout)
   and 12 (the D4 look). Section 12 is the constraint: no token, font or component changes.
4. `docs/HANDOFF-redesign.md` section 5 (what never changes) and section 4 (what may go).

## 1. The design in one line

Open the app on the shelves. One row says what you left open, one row says how many puzzles are
in the box, a field lets you look a lesson up, and everything else is browsing: shelf, folder,
course, lesson. Nothing is due, nothing counts down, and the look is D4 exactly as it is.

## 2. Branch

This handoff and the design live on `ccr-97e55c23-q5rbo3`, two commits ahead of
`linear-equations-lesson-1`, docs only. Bring them in and build on your own branch:

```
git fetch origin ccr-97e55c23-q5rbo3
git merge origin/ccr-97e55c23-q5rbo3      # fast-forward: docs/design/library-home/, this file
```

Commit and push as you go, as you do for lessons. Publish only when Dan says so, after every suite
passes (`docs/DEPLOY.md`), keeping the artifact URL and capabilities.

## 3. Build order

Six phases, each shippable on its own. Run `node tools/build.mjs`, `node --test tests/*.test.mjs`
and `node tests/e2e/run.mjs` after each; update the specs the phase changes rather than skipping
them.

### Phase 1: the shell

- Tabs become **Library · Today · Book** (`app/src/body.html`): Learn and Map leave the bar. The
  Library tab opens `#/`; Book opens `#/book`. The Today tab carries no badge (`#today-badge` and
  the boot code that fills it go quiet; `U.review.outlook` stays for Today's own words).
- `#/` draws the new home (phase 2). `70-learn.js` keeps its module and its exports (`V.toneOf`,
  `V.cover`, `V.asTitle`, `V.modeOf`, `V.loadError`, `V.empty`, `V.back` and the rest live there or
  in `U.views`; the shelves, the topic page and the Map call them) but no longer owns a route.
  Unhook, do not delete: the course tools load `00-core`, `10-runtime`, `30-prompts`, `31-generate`,
  `33-interactive`, `34-verify` and the kit page (HANDOFF-redesign section 6), so `node --test
  tests/*.test.mjs` must still pass untouched.
- `#/book` draws what `#/library/dossiers` draws now (the dossier tiles, then "In your own words")
  with a "Map" link at its end; `#/library/dossiers` and `#/book/words` keep working. `#/library/
  courses` and the two-door page go: that address opens `#/`.
- `#/map` keeps working with no tab (its route option `tab: 'book'` so the Book pill shows).
- Specs: `tests/e2e/shell.spec.mjs` (tabs, focus mode), `views.spec.mjs` (every assertion on Learn's
  ask box, chips, intake, planning and the welcome goes; the topic page assertions stay),
  `shelves.spec.mjs` (the Library no longer "opens on two choices").

### Phase 2: the home and the folds

- The home is a new screen (a new file, `77-library.js`, or the Library part of `76-shelves.js`;
  your call), drawn with the Library's existing chrome: eyebrow, `h1` "Your library", the shelf
  cards as `76-shelves.js` draws them today.
- Above the shelves, in this order: the **look-up field** (phase 3; draw it now, inert, with its
  placeholder), the **left-open row** and the **puzzle row**, both `.today-row`s as the design
  says. Left open: the most recently touched course whose next lesson is short of `done`, from
  every built course's progress (`U.store.progress`); the row carries that course's tone band
  (`data-tone` from `V.toneOf(title, topic)`) and `V.cover` thumbnail. Puzzle row: the count of
  cards in the box across courses (`U.review` has the reads Today uses); none, no row.
- **Planned courses fold**: on a folder page the courses with no `tid` go under one `.lib-fold`
  ("10 more coming"), closed until opened, state kept across a redraw (the Sources fold in
  `71-topic.js` is the pattern). A folder with nothing built opens with the fold open. On the
  home, shelves with no built course and no named folders fold under one line.
- Laptop: from 900 px the two rows sit side by side under the field; the shelf grid is unchanged.
- Specs: `shelves.spec.mjs` (home, fold, left-open row with the views seed's progress).

### Phase 3: look-up

- Typing in the field searches every built course's `ideas[].title` and `ideas[].oneLine` plus
  the courses' titles and blurbs, and replaces the page below the field with results (the design,
  section 2: lesson rows first, then course rows, a `--mono` count line, an empty state). Reads
  every built course's topic doc on the first keystroke and caches them for the session; a built
  course is any shelf course with a `tid`.
- Plain matching: case-insensitive, every typed word must appear in the title or the one line.
  Nothing clever.
- Clearing the field restores the page. The field keeps its text while he browses results and
  comes back (in memory, not the db).
- Specs: `shelves.spec.mjs` (type, see results, open a live lesson, clear).

### Phase 4: the course page

- The current node of "Your path" shows the lesson's first drawing: the first `show` page's
  `svg` from `topics/<tid>/guide/<iid>` on a `--sunk` panel, sized by its `viewBox` (strip the
  `width`/`height` attributes when you insert it; the SVG is course content written by the build
  tools, inserted with `U.svg`, never `innerHTML` of model text at runtime). No guide doc, no
  panel. One read, for one lesson.
- The "Start/Continue: …" button at the top of the page goes; the current node's own button is
  the way in.
- After the path, before Ask Claude: the **puzzles from this course** row (`.today-row` with the
  course's tone band), opening `#/review?topic=<tid>`. Drawn only once the course has cards in
  the box (phase 6), so it is invisible until then.
- Specs: `views.spec.mjs` (the topic page), `dossier.spec.mjs` untouched.

### Phase 5: Today, the puzzle box

- Reword `60-today.js` as the design says (section 5): the heading counts puzzles in the box,
  never "due"; "Flip through" opens `#/review`; a **By course** list with "Just these" opening
  `#/review?topic=<tid>`; Light day reworded; This week and Claude's notes unchanged. The empty
  state: "Nothing in the box yet" with "Finish a lesson and its puzzles come here".
- `#/review` reads `?topic=<tid>` and limits the batch to that course; its close returns to
  where it was opened from. `#/review/more` unchanged.
- Specs: `review.spec.mjs` (wording, the course filter), `shell.spec.mjs` (no badge).

### Phase 6: puzzles as review cards (needs Dan's yes first)

Ready-made lessons are read-mode steps lessons and make no cards today. The design proposes
(section "What the content side must add") a new card type `puzzle`, made when a steps lesson is
finished from each `example` page of its guide doc that has a typed `answer`, scheduled by FSRS,
answered by typing, checked against `answer`, its `why` shown as Claude's note. This touches
`41-cards.js`, `40-fsrs.js`, `50-lesson.js` (on finish) and the guide writer's rules. Ask Dan
before starting it; until it lands, phases 2 to 5 show their empty states, which is fine.

### Then

- `docs/ARCHITECTURE.md`: update section 10 (routes and tabs), 11 (the home's widths) and the
  Library paragraph of section 12; add the look-up and the puzzle card to section 4 if phase 6 is
  built. `docs/NEXT.md`: record what shipped.
- Build `dist/my-university.html` and commit it. Publish only when Dan says so.

## 4. Decisions taken unless Dan says otherwise

- Tabs are Library · Today · Book; the Map keeps its address and a link, not a tab.
- The home greets him ("Good afternoon, Dan"), as Learn did.
- Light day stays on Today, reworded.
- The Electrical shelf, when it arrives, shows as a shelf card like Maths, its folders behind it.
- No new field in the db is needed for phases 1 to 5. If the look-up's topic reads get slow as
  shelves grow, add `lessons: [{ id, title, oneLine }]` to each course entry in `shelves/<sid>`
  in `tools/course/assemble.mjs` and read that instead.

## 5. Never

- No new colour, font, radius or token; no "due", "overdue", streaks or badges anywhere.
- No change inside the kit, the sandbox or any built lesson (`app/kit/KIT.md` is a contract).
- No model-written text in `innerHTML`; db docs under 256 KiB; writes through `U.store`.
- Do not delete the modules the course tools load (section 3, phase 1).
