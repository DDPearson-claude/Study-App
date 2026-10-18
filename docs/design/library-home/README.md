# The Library is the home: course-library flows in the current look

The design for the course-only app (docs/HANDOFF-redesign.md). Dan asked for fresh flows around the
look he already has, D4 "Claude's notes" (`app/src/css/80-d4.css`, docs/ARCHITECTURE.md section 12),
so nothing here changes a token or a component: the screens are rearranged, and three small things
are added. Mockups: https://claude.ai/artifact/8Qnq8o8LvM22ThXk93yWaG, row F (five 390 x 844 phone
screens drawn with the real Maths shelf, Dan's real progress and a lesson's own drawing).

History, 18 Oct 2026: four directions were drawn (rows A to D); Dan picked D, "the Deck", and asked
for it in the current look (row E); then set it aside: a deck of every lesson across every course was
"too overwhelming, too much content to flick between". The rule that came out of it: keep the
choice small at each step. Pick a shelf, then a course, and only see lessons once inside a course.

## The idea in one line

Open the app on the shelves. One row says what you left open, one row says how many puzzles are
in the box, a field lets you look a lesson up, and everything else is browsing: shelf, folder,
course, lesson. Nothing is due.

## Tabs and addresses

| Tab | Address | What |
|---|---|---|
| Library (home) | `#/` | The shelves, with the look-up field, the left-open row and the puzzle row |
| Today | `#/today` | The puzzle box (the review screen, reframed) |
| Book | `#/book` | The dossiers (field guides) and "In your own words", as `#/library/dossiers` shows them now |

- `#/library/courses` and `#/book`'s two-door page go: `#/library/courses` opens `#/`; `#/book`
  opens the dossiers directly. `#/shelf/:sid`, `#/shelf/:sid/:fid`, `#/t/:tid`, `#/t/:tid/:iid`,
  `#/review`, `#/book/:tid…` and `#/book/words` are unchanged.
- The Map tab goes. The Map keeps its address (`#/map`) and a link at the end of the Book, so
  nothing is lost; it can come back as a tab if Dan misses it.
- Learn (`70-learn.js`: the ask box, example chips, intake, planning and failed states, the topic
  list, the welcome) is unhooked from the UI. The module stays, as the course tools load it.
- The Today tab carries no badge. Nothing in the app counts down.

## The screens

### 1. Library, the home (`#/`)

Top to bottom, in the Library's current chrome (eyebrow, `h1` "Your library", the `.page-head`):

1. **Look up**: one field styled as the ask box was (`.ask-input.input`: 2 px `--edge`, radius
   16 px, 52 px tall) with a search icon and the placeholder "Look up a lesson: power factor,
   cosine rule…". Typing replaces everything below the field with results (section 2); clearing
   brings the page back. It is the only search in the app.
2. **Left open**: one `.today-row` (2 px ink outline, radius `--r-lg`) with the course's tone
   band at its left (`box-shadow: inset 5px 0 0 var(--acc)`, as a shelf card), the course's
   cover thumbnail (48 px, `V.cover`), a `--cond` label "LEFT OPEN · TRIGONOMETRY" in the tone's
   `--acc-ink`, the lesson title in bold, "lesson 4 of 8" in `--mono`, and the arrow. It opens the
   lesson. There is never more than one: the most recently touched course whose next lesson is
   not finished (`progress.lastIdea`, the stage short of `done`). None: the row is not drawn.
3. **The puzzle box**: one `.today-row`, fit-content wide as Learn's reviews row is, teal icon
   tile (`--teal-tint`, never amber), "12 puzzles in the box", "From Trigonometry and Fractions ·
   when you like", opening `#/today`. None: not drawn (no quiet filler).
4. **Shelves**, under a "SHELVES" eyebrow: the shelf cards exactly as `76-shelves.js` draws them
   (`.shelf-card` with its tone band, folder icon tile, title, blurb, meta "7 folders · 17
   courses built · 33 to come"). A shelf with nothing built is a card without a link, its icon
   tile grey, its meta "On the way · about 17 courses". Shelves with no built course and no
   named folders fold under one line, "3 more shelves planned: …", a `.lib-fold` like Sources.

The laptop layout follows Learn's rules (section 11): from 900 px the left-open and puzzle rows
sit side by side under the field; the shelf cards go two a row from 608 px as now.

### 2. Looking something up

The field searches, as he types, every built course's lesson titles and one-line summaries, and
the courses' own titles and blurbs. Results replace the page below the field:

- A `--mono` count line ("4 lessons · 1 course").
- Lesson rows first: the shelf-course row shape (`.shelf-course` with the tone band), the lesson
  number in the course's tone disc (`.shelf-n`), the lesson title, its one line, and "Trigonometry
  · lesson 8 · coming soon" or "… · ready to browse" in the row's meta (teal when it opens). A
  live lesson opens `#/t/:tid/:iid`; a coming-soon one opens the course page.
- Then course rows, as on a folder page.
- Nothing found: "Nothing called that yet. Try a word from the lesson's title."
- Matching is plain: case-insensitive, every typed word must appear in the title or the one
  line; titles first, then one lines. No ranking beyond that.

Data: the lesson titles and one lines live on each topic doc (`ideas[].title`, `.oneLine`). The
home reads every built course's topic doc on the first keystroke (17 docs today, cached for the
session), so no new field is needed to start. If that read gets slow as shelves grow, the
content session adds `lessons: [{ id, title, oneLine }]` to each course entry in `shelves/<sid>`
(assemble.mjs) and the field reads one doc.

### 3. A shelf and a folder (`#/shelf/:sid`, `#/shelf/:sid/:fid`)

As now, with one change on the folder page: **planned courses fold away**. Built courses come
first, in shelf order, as the numbered rows they are today ("Ready to browse", "Lesson 4 of 8",
"Finished"). The courses with no `tid` sit under one `.lib-fold` line, "10 more coming", closed
until he opens it, and stay as he left it across a redraw. A folder with everything built has no
fold; a folder with nothing built opens with the fold open.

### 4. A course (`#/t/:tid`)

The topic page as it is, with two changes:

- **A picture on the lesson he is on.** The current node of "Your path" (`.is-current`, the white
  card) shows the lesson's first drawing between its one line and its button: the first `show`
  page's SVG from `topics/<tid>/guide/<iid>`, on a `--sunk` panel (radius 8 px, about 118 px
  tall), sized by its `viewBox`. One doc read, for one lesson. The other nodes stay as text, done
  ones with their green tick, coming-soon ones dashed. The big "Start/Continue: …" button at the
  top goes; the node's own button ("Start this lesson", "Continue") is the way in.
- **Puzzles from this course.** After the path and before Ask Claude: a `.today-row` with the
  course's tone band, "8 puzzles from lessons 1 to 3 · flip through", opening `#/review` limited
  to this course (`#/review?topic=<tid>`, a new query the review screen reads). None yet: not
  drawn.

"In one breath", Ask Claude, the mode switch, the dossier option, Sources and Delete are unchanged.

### 5. Today, the puzzle box (`#/today`)

The review screen reframed. It never says "due":

- Eyebrow the date; `h1` "12 puzzles in the box" (or "Nothing in the box yet", with "Finish a
  lesson and its puzzles come here" where "Learn something new" was); a paragraph: "From
  Trigonometry, lessons 1 to 3, and Fractions. Flip through a few, or leave them. They keep, and
  come back round when a second look would help."
- **Flip through**: the ink button, opening `#/review` as "Start review" does now.
- **By course**: one row per course with puzzles in the box, its tone band, "8 puzzles from
  lessons 1 to 3", and a "Just these" secondary button opening `#/review?topic=<tid>`.
- **Light day** stays, reworded "Just 5 puzzles, then stop".
- **This week** stays as it is (`.td-week`: days studied, no streak). Claude's notes on today's
  review stay on the done screen.
- The daily cap (`profile.prefs.cap`) still bounds a batch; `#/review/more` still offers one more.

### 6. The review session (`#/review`)

Unchanged in look. Each card is a puzzle from a finished lesson (below). The session's close
returns to where it was opened from (Today or the course page).

## What the content side must add

Written down as HANDOFF section 6 asks. One thing, and it is a product decision for Dan first:

**Puzzles as review cards.** Ready-made lessons are read-mode steps lessons, which make no review
cards today (section 4: a read lesson has `checks: []`). The box needs cards. Proposed: when a
steps lesson is finished, each `example` page of its guide (`topics/<tid>/guide/<iid>`: task,
answer, why, and its picture) becomes a card of a new type `puzzle` in `profile/cards/<tid>`,
scheduled by FSRS like the others, answered by typing and checked against `answer` (numbers
within the kit's tolerance, otherwise exact after trimming; a puzzle whose answer is a picture
or a drag, with an empty `answer`, makes no card). The card shows the picture, the task, the
field and Check; its feedback is the page's `why` as Claude's note. This is a change in
`41-cards.js` and `40-fsrs.js` and a rule for the guide writer (every `example` page that can be
typed carries an `answer`); until it lands the box is empty and Today shows its empty state.

Nothing else needs a new field. The look-up reads what topic docs already hold, and the picture
on the current node reads the guide doc that already exists.

## What goes

Learn's ask box, example chips, intake questions, planning and failed-planning states, the
topic list and the first-run welcome; the Library's two-door page; the Map tab (not the Map);
the "Start/Continue" button at the top of the topic page; the Today badge; "due" anywhere in the
app's words.

## Open questions for Dan

- Tabs: **Library · Today · Book**, or keep the Map as a fourth tab?
- Should the home greet him ("Good afternoon, Dan") as Learn does, or just say "Your library"?
- Light day: keep the switch on Today, or let the box simply stop when he stops?
- When the Electrical shelf arrives, should its folders show on the home under Maths, or stay
  behind the shelf card as the mockup shows?
